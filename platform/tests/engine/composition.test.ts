import { describe, expect, it } from 'vitest';
import { evaluate, evaluateTarget, compositionPrimitives, trackWeight } from '../../src/engine';
import { composeLocals } from '../../src/engine/composition';
import { validate, type Project, type TargetPoseRequest, type PoseRequest } from '../../src/model';
import { createSyntheticProject } from '../../fixtures/model/synthetic';
import { createMeshProject } from '../../fixtures/mesh/synthetic';
import { fixture, track, crossfade, composition, channel, value } from './composition-fixture';
const pose = (p: Project, time: number) => value(evaluateTarget(p, { target: { kind: 'composition', compositionId: 'motion' }, time }));
const locals = (p: Project, time: number) => value(composeLocals(value(validate(p)), p.compositions![0], time));

describe('canonical composition evaluation', () => {
  it('matches independent #24 overwrite/additive vectors; absent channels and masks preserve lower values', () => {
    const p = fixture();
    p.compositions = [composition([track(), track('wave', 1, { alpha: .5 })])];
    let l = locals(p, .5); expect(l.get('arm')!.rotation).toBeCloseTo(.9, 12);
    expect(l.get('hip')!.y).toBe(-20); expect(l.get('target')!.x).toBe(100);
    p.compositions[0].tracks[1] = track('wave', 1, { alpha: .5, mode: 'additive' });
    expect(locals(p, .5).get('arm')!.rotation).toBeCloseTo(1.2, 12);
    for (const [alpha, overwrite, additive] of [[0, .8, .8], [.5, .9, 1.2], [1, 1, 1.6]]) {
      for (const [mode, expected] of [['overwrite', overwrite], ['additive', additive]] as const) {
        p.compositions[0].tracks[1] = track('wave', 1, { alpha, mode });
        expect(locals(p, .5).get('arm')!.rotation).toBeCloseTo(expected, 12);
      }
    }
    p.compositions[0].tracks[1] = track('wave', 1, { mask: [] });
    expect(locals(p, .5).get('arm')!.rotation).toBe(.8);
  });
  it('keeps direct rotation winding and additive scale deltas including zero/negative scale', () => {
    const p = fixture(); p.ikConstraints = [];
    p.bones.find(b => b.id === 'arm')!.setup.scaleX = 2;
    p.animations[1].loop = false;
    p.animations[1].channels = [channel('arm', 'rotation', [170 * Math.PI / 180, -170 * Math.PI / 180]), channel('arm', 'scaleX', [-2, 2])];
    p.compositions = [composition([track('wave', 0, { mask: [{ boneId: 'arm', property: 'rotation' }, { boneId: 'arm', property: 'scaleX' }] })])];
    expect(locals(p, .5).get('arm')).toMatchObject({ rotation: 0, scaleX: 0 });
    expect(locals(p, 0).get('arm')!.scaleX).toBe(-2);
    p.animations[1].channels[0] = channel('arm', 'rotation', [0, 4 * Math.PI]);
    expect(locals(p, .75).get('arm')!.rotation).toBeCloseTo(3 * Math.PI, 12);
    p.compositions[0].tracks[0] = track('wave', 0, { mode: 'additive', alpha: .5, mask: [{ boneId: 'arm', property: 'scaleX' }] });
    expect(locals(p, 0).get('arm')!.scaleX).toBe(0); // 2 + .5*(-2-2), not multiplicative ratio
  });
  it('normalizes target clock, independently holds/clamps/loops source clocks, supports speed zero and explicit removal', () => {
    const p = fixture(); p.ikConstraints = [];
    p.compositions = [composition([track('wave', 0, { source: { kind: 'live', animationId: 'wave', offset: .5, speed: 0 }, fadeIn: .4, end: 1, fadeOut: .4 })])];
    expect(locals(p, 0).get('arm')!.rotation).toBe(.2);
    expect(locals(p, .2).get('arm')!.rotation).toBeCloseTo(.6, 12);
    expect(locals(p, .4).get('arm')!.rotation).toBe(1);
    expect(locals(p, 1.2).get('arm')!.rotation).toBeCloseTo(.6, 12);
    expect(locals(p, 1.4).get('arm')!.rotation).toBeCloseTo(.2, 12);
    expect(pose(p, -.1).sampledTime).toBe(0); expect(pose(p, 10).sampledTime).toBe(2);
    p.compositions[0].loop = true;
    expect(pose(p, 2).sampledTime).toBe(0); expect(pose(p, -.25).sampledTime).toBe(1.75);
    p.compositions[0].tracks = [track('stop')];
    expect(locals(p, 1.9).get('arm')!.rotation).toBe(.2);
    p.compositions[0].tracks = [track()];
    expect(locals(p, 1).get('arm')!.rotation).toBe(.4);
    p.compositions[0].tracks = [track('wave', 0, { end: .5 })];
    expect(locals(p, .5).get('arm')!.rotation).toBe(.2);
    p.compositions[0].tracks = [track('wave', 0, { source: { kind: 'live', animationId: 'wave', offset: 0, speed: 2 } })];
    expect(locals(p, .25).get('arm')!.rotation).toBe(1);
  });
  it('is fresh, immutable and seek-order independent, with real target/time/revision provenance', () => {
    const p = fixture(); p.revision = 42;
    p.compositions = [composition([track('wave', 2, { mode: 'additive', alpha: .5 }), track('walk', 0)])];
    const before = structuredClone(p), times = [.5, 0, 1.2, .75, 2, -.1, 100, .25];
    const expected = times.map(t => pose(p, t));
    for (const i of [6, 1, 5, 0, 7, 3, 2, 4]) expect(pose(p, times[i])).toEqual(expected[i]);
    expect(pose(p, .5)).toEqual(pose(p, .5)); // paused transport: unchanged absolute C
    expect(expected[0]).toMatchObject({ projectId: p.projectId, revision: 42, sampledTime: .5, target: { kind: 'composition', compositionId: 'motion' } });
    expect(expected[0]).not.toHaveProperty('animationId'); expect(p).toEqual(before);
    expected[0].bones.arm = [0, 0, 0, 0, 0, 0]; expect(pose(p, .5).bones.arm).not.toEqual(expected[0].bones.arm);
  });
  it('expands frozen crossfade exactly and keeps named source time frozen across seeks, tied to current revision', () => {
    const p = fixture(); p.compositions = [composition([track('walk', 0, { end: 1 }), crossfade()])];
    const primitives = compositionPrimitives(p.compositions[0]);
    expect(primitives).toHaveLength(3);
    expect(trackWeight(primitives[1], 1.2)).toBe(1); expect(trackWeight(primitives[2], 1.2)).toBeCloseTo(.5, 12);
    expect(trackWeight(primitives[1], 1.4)).toBe(0); expect(trackWeight(primitives[2], 1.4)).toBeCloseTo(1, 12);
    expect(locals(p, 1.2).get('hip')!.y).toBeCloseTo(-2, 12);
    expect(locals(p, 1.2).get('arm')!.rotation).toBeCloseTo(.36, 12);
    expect(locals(p, 1.4 - 1e-9).get('arm')!.rotation).toBeCloseTo(.2400000008, 12);
    expect(locals(p, 1.4).get('arm')!.rotation).toBeCloseTo(.24, 12);
    p.animations[0].channels[1].keys[0].value = .6; p.revision++;
    expect(locals(p, 1.2).get('arm')!.rotation).toBeCloseTo(.46, 12);
    expect(pose(p, 1.2).revision).toBe(1);
    p.compositions[0].tracks = [{ ...crossfade(), duration: 0 }];
    expect(locals(p, 1).get('arm')!.rotation).toBe(.4);
  });
  it('composes before IK and holds authored phase-entry final foot with wrong-phase and no-IK negative controls', () => {
    const p = fixture(); p.compositions = [composition([track('walk', 0, { end: 1 }), crossfade()])];
    for (let i = 0; i <= 100; i++) {
      const result = pose(p, 1 + i / 100), foot = result.bones.foot;
      expect(foot[4]).toBeCloseTo(120, 10); expect(foot[5]).toBeCloseTo(-100, 10);
      expect(Math.hypot(foot[4] - 120, foot[5] + 100)).toBeLessThan(1e-8);
    }
    const wrongWalk = value(evaluate(p, { animationId: 'walk', time: .25 }));
    const wrongStop = value(evaluate(p, { animationId: 'stop', time: .25 }));
    expect(Math.abs(wrongWalk.bones.foot[4] - wrongStop.bones.foot[4])).toBeCloseTo(10, 10);
    p.ikConstraints = [];
    const foot = pose(p, 1.5).bones.foot; expect(Math.hypot(foot[4] - 120, foot[5] + 100)).toBeGreaterThan(10);
  });
  it('feeds composed locals through existing region and mesh geometry unchanged for a full source track', () => {
    for (const p of [createSyntheticProject(), createMeshProject()]) {
      p.formatVersion = 1; const animation = p.animations[0]; delete animation.deforms;
      p.requiredCapabilities.push('composition-v1');
      p.compositions = [composition([track(animation.id, 0, { mask: animation.channels.map(({boneId,property}) => ({boneId,property})) })])];
      p.compositions[0].duration = animation.duration;
      p.compositions[0].loop = animation.loop;
      for (const time of [0,.3,1,5]) {
        const legacy = value(evaluate(p,{animationId:animation.id,time})), composed = pose(p,time);
        expect(composed.bones).toEqual(legacy.bones); expect(composed.regions).toEqual(legacy.regions); expect(composed.meshes).toEqual(legacy.meshes);
      }
    }
  });
  it('uses the legacy mesh/deform geometry path for animation targets without changing old result fields', () => {
    const p = createMeshProject();
    for (const time of [0, .3, 1, 5]) {
      const old = value(evaluate(p, { animationId: p.animations[0].id, time }));
      const canonical = value(evaluateTarget(p, { target: { kind: 'animation', animationId: p.animations[0].id }, time }));
      const { target, ...geometry } = canonical;
      expect({ ...geometry, animationId: target.kind === 'animation' ? target.animationId : undefined }).toEqual(old);
    }
    const setup = value(evaluateTarget(p, { target: { kind: 'animation', animationId: null }, time: 900 }));
    expect(setup.sampledTime).toBe(0); expect(setup.target).toEqual({ kind: 'animation', animationId: null });
  });
  it('rejects unknown or fake targets, source overflow and malformed requests without running getters', () => {
    const p = fixture();
    const requests: unknown[] = [null, {}, { target: { kind: 'composition', animationId: 'walk' }, time: 0 },
      { target: { kind: 'composition', compositionId: 'motion', extra: 1 }, time: 0 }, { target: { kind: 'composition', compositionId: 'missing' }, time: 0 },
      { target: { kind: 'composition', compositionId: 'motion' }, time: NaN },
      { get target() { throw Error('must not run'); }, time: 0 }];
    for (const request of requests) expect(evaluateTarget(p, request as TargetPoseRequest).ok).toBe(false);
    expect(evaluate(p, { target: { kind: 'composition', compositionId: 'motion' }, time: 0 } as unknown as PoseRequest).ok).toBe(false);
    p.compositions![0].tracks = [track('wave', 0, { source: { kind: 'live', animationId: 'wave', offset: 1e308, speed: 1e308 } })];
    expect(evaluateTarget(p, { target: { kind: 'composition', compositionId: 'motion' }, time: 2 })).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT', message: expect.stringContaining('source time') } });
  });
});
