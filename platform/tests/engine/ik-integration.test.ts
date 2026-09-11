import { expect, it } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { createStorage } from '../../src/storage';
import { unzip } from '../../src/storage/zip';
import { createIKProject } from '../../fixtures/ik/leg';
import { createSyntheticProject } from '../../fixtures/model/synthetic';
import { createMeshProject } from '../../fixtures/mesh/synthetic';
import { evaluate, evaluatorCapabilities } from '../../src/engine';
import { parse, serialize, validate, migrate, modelCapabilities, type Project, type Result } from '../../src/model';
const take = <T>(result: Result<T>): T => { if (!result.ok) throw Error(JSON.stringify(result.error)); return result.value; };
const pose = (p: Project, time = 0, animationId: string | null = 'idle') => take(evaluate(p, { time, animationId }));
it('public v1 evaluation holds both bends while mix0 is exact FK', () => {
  for (const bend of [1, -1] as const) {
    const p = createIKProject(); p.ikConstraints![0].bend = bend;
    for (const time of [0, .25, .5, .75, 1, 1.25, 1.5, 1.75, 2]) {
      const actual = pose(p, time);
      expect(actual.ik![0].distance).toBeLessThanOrEqual(.5);
      expect(actual.ik![0].endpoint[0]).toBeCloseTo(120, 8);
      expect(actual.ik![0].endpoint[1]).toBeCloseTo(-100, 8);
    }
    p.ikConstraints![0].mix = 0;
    const disabled = pose(p, .4), noIK = structuredClone(p); delete noIK.ikConstraints;
    expect(disabled.bones).toEqual(pose(noIK, .4).bones);
  }
});
it('20 public random seeks agree within1e-5, preserve setup and isolate outputs', () => {
  const p = createIKProject(), before = structuredClone(p);
  const times = [1.37, -.25, 0, .13, 4.8, 1.01, .77, 2, 1.9, .04, 3.2, .5, -3.1, .94, 1.5, 7.3, .33, 1.73, -1, 2.8];
  const baseline = times.map(time => pose(p, time));
  let maxDelta = 0, maxResidual = 0;
  for (const i of [13, 2, 19, 7, 0, 16, 4, 11, 9, 18, 1, 15, 5, 12, 3, 17, 8, 14, 6, 10]) {
    const actual = pose(p, times[i]);
    for (const id of Object.keys(actual.bones)) actual.bones[id].forEach((v, j) => {
      maxDelta = Math.max(maxDelta, Math.abs(v - baseline[i].bones[id][j]));
    });
    maxResidual = Math.max(maxResidual, actual.ik![0].distance);
    expect(actual).toEqual(baseline[i]);
  }
  expect(maxDelta).toBeLessThanOrEqual(1e-5); expect(maxResidual).toBeLessThanOrEqual(.5);
  baseline[0].ik![0].endpoint[0] = 999;
  expect(pose(p, times[0]).ik![0].endpoint[0]).not.toBe(999);
  expect(p).toEqual(before);
  if (process.env.IK_EVIDENCE) writeFileSync(process.env.IK_EVIDENCE, JSON.stringify({
    sampledTimes: times, maxMatrixDelta: maxDelta, maxEndpointResidual: maxResidual,
    setupUnchanged: true, outputIsolated: true, samples: times.map(time => ({ time, ...pose(p, time).ik![0] })),
  }, null, 2) + '\n');
});
it('roundtrip/migration keep IK, setup evaluation and advertised core capabilities', () => {
  const p = createIKProject(), loaded = take(parse(take(serialize(p))));
  expect(loaded).toEqual(p); expect(pose(loaded, .4)).toEqual(pose(p, .4));
  expect(pose(loaded, 500, null).ik![0].distance).toBeLessThanOrEqual(.5);
  expect(take(migrate(p, 1))).toEqual(p);
  expect(migrate(p, 0)).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_VERSION' } });
  expect(modelCapabilities.features).toContain('ik-v1'); expect(evaluatorCapabilities.features).toContain('ik-v1');
  const old = createSyntheticProject();
  expect(pose(old, .4, 'bounce')).toEqual(pose(take(migrate(old, 1)), .4, 'bounce'));
});
it('rejects malformed v1 constraints and retains strict v0 boundary', () => {
  const p = createIKProject();
  for (const delta of [{ mix: -1 }, { mix: 1.1 }, { mix: NaN }, { bend: 0 }, { order: -1 },
    { order: .5 }, { order: Number.MAX_SAFE_INTEGER + 1 }, { endpoint: [1] }, { endpoint: [1, 2, 3] },
    { endpoint: [Infinity, 0] }, { id: 'bad\n' }, { mystery: true }, { childBoneId: 'foot' }, { targetBoneId: 'hip' }]) {
    const input = { ...p, ikConstraints: [{ ...p.ikConstraints![0], ...delta }] };
    expect(validate(input)).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT' } });
    expect(serialize(input).ok).toBe(false);
  }
  expect(validate({ ...p, requiredCapabilities: ['region-v0'] })).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_CAPABILITY' } });
  expect(validate({ ...p, formatVersion: 0 })).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_CAPABILITY' } });
  expect(validate({ ...p, formatVersion: 0, requiredCapabilities: ['region-v0'] }).ok).toBe(false);
  expect(validate({ ...p, ikConstraints: [] }).ok).toBe(true);
  expect(validate({ ...p, ikConstraints: [p.ikConstraints![0], { ...p.ikConstraints![0], id: 'second' }] })).toMatchObject({ ok: false, error: { path: '/ikConstraints/1/order' } });
  expect(validate({ ...p, ikConstraints: [{ ...p.ikConstraints![0], targetBoneId: 'missing' }] })).toMatchObject({ ok: false, error: { code: 'MISSING_REFERENCE' } });
});
it('IK updates region and mesh after solving, including descendant endpoint', () => {
  const p = createIKProject(), meshSource = createMeshProject();
  p.requiredCapabilities.push('mesh-v1'); p.assets = meshSource.assets;
  p.attachments = [{ id: 'triangle', type: 'mesh', assetId: 'art',
    vertices: [200, 0, 201, 0, 200, 1], uvs: [0, 0, 1, 0, 0, 1], triangles: [0, 1, 2],
    bindPose: [{ boneId: 'foot', world: [1, 0, 0, 1, 200, 0] }],
    weights: Array.from({ length: 3 }, () => [{ boneId: 'foot', weight: 1 }]) },
    { id: 'region', type: 'region', assetId: 'art', width: 10, height: 10, pivotX: 0, pivotY: 0,
      transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 } }];
  p.slots = [{ id: 'mesh-slot', name: 'Mesh', boneId: 'foot', attachmentId: 'triangle' },
    { id: 'region-slot', name: 'Region', boneId: 'foot', attachmentId: 'region' }];
  const actual = pose(p, .5), endpoint = actual.ik![0].endpoint;
  expect(actual.meshes[0].vertices.slice(0, 2)).toEqual(endpoint);
  expect(actual.regions[0].world.slice(4)).toEqual(endpoint);
});
it('public evaluator reports finite degenerate/unsupported and numerical failure', () => {
  for (const scaleX of [0, 2]) {
    const p = createIKProject(); p.bones[0].setup.scaleX = scaleX;
    expect(pose(p).ik![0].status).toBe(scaleX ? 'unsupported-scale' : 'singular');
  }
  const p = createIKProject(); p.bones[1].setup.x = 0; p.ikConstraints![0].endpoint = [0, 0];
  expect(pose(p).ik![0].status).toBe('degenerate');
  p.bones[1].setup.x = 1e20; p.ikConstraints![0].endpoint = [1e20, 0]; p.bones[3].setup.x = 20; p.bones[3].setup.y = 0;
  expect(evaluate(p, { time: 0, animationId: null })).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT', path: '/ikConstraints' } });
});

it('portable ZIP preserves the planted leg and public evaluated pose', async () => {
  const storage = createStorage(), project = createIKProject();
  const bytes = take(await storage.pack({ project, assets: new Map() }));
  const reopened = take(await storage.unpack(bytes));
  expect(reopened.project).toEqual(project);
  expect(pose(reopened.project, .65)).toEqual(pose(project, .65));
});
it('real region-v0 robot remains unchanged by empty IK integration at24 poses', async () => {
  const files = await unzip(new Uint8Array(readFileSync('fixtures/robot/native-project.zip')));
  const robot = take(parse(new TextDecoder().decode(files.get('project.json')!)));
  const migrated = take(migrate(robot, 1));
  migrated.requiredCapabilities.push('ik-v1'); migrated.ikConstraints = [];
  let samples = 0;
  for (const animation of robot.animations) for (let i = 0; i < 12; i++) {
    const time = animation.duration * i / 12;
    const original = pose(robot, time, animation.id), actual = pose(migrated, time, animation.id);
    expect(actual.bones).toEqual(original.bones); expect(actual.regions).toEqual(original.regions);
    expect(actual.meshes).toEqual([]); expect(actual.ik).toEqual([]);
    expect(Object.values(actual.bones).flat().every(Number.isFinite)).toBe(true); samples++;
  }
  expect(samples).toBe(24);
});
