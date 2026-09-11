import { describe, expect, it } from 'vitest';
import { createLeg } from '../../fixtures/ik/leg';
import { solveIK } from '../../src/engine/ik';
import { localMatrix, multiply } from '../../src/engine/transforms';
import type { Bone, Matrix } from '../../src/model/types';
import type { TwoBoneIK } from '../../src/model/ik';
function run(bones: Bone[], constraints: TwoBoneIK[]) {
  const locals = new Map(bones.map(b => [b.id, { ...b.setup }]));
  const worlds = new Map<string, Matrix>();
  const add = (b: Bone): Matrix => {
    if (worlds.has(b.id)) return worlds.get(b.id)!;
    const m = localMatrix(locals.get(b.id)!);
    const world = b.parentId === null ? m : multiply(add(bones.find(p => p.id === b.parentId)!), m);
    worlds.set(b.id, world); return world;
  };
  bones.forEach(add);
  const result = solveIK(bones, constraints, locals, worlds);
  if (!result.ok) throw new Error(result.error.message);
  return { diagnostics: result.value, worlds, locals };
}
describe('two-bone IK solver', () => {
  it.each([1, -1] as const)('holds reachable target and signed bend %s', bend => {
    const { bones, constraint } = createLeg(); constraint.bend = bend;
    const before = structuredClone(bones);
    const { diagnostics, worlds } = run(bones, [constraint]);
    expect(diagnostics[0].distance).toBeLessThanOrEqual(0.5);
    expect(diagnostics[0].status).toBe('solved');
    const joint = worlds.get('shin')!, end = diagnostics[0].endpoint;
    expect(Math.sign(joint[4] * end[1] - joint[5] * end[0])).toBe(bend);
    expect([worlds.get('foot')![4], worlds.get('foot')![5]]).toEqual(end);
    expect(bones).toEqual(before);
  });
  it('mix zero retains exact FK and fractional mix interpolates local rotations', () => {
    const { bones, constraint } = createLeg();
    const full = run(bones, [constraint]);
    constraint.mix = 0;
    const zero = run(bones, [constraint]);
    expect(zero.diagnostics[0].endpoint).toEqual([200, 0]);
    expect(zero.diagnostics[0].status).toBe('disabled');
    constraint.mix = 0.5;
    const half = run(bones, [constraint]);
    for (const id of ['hip', 'shin']) expect(half.locals.get(id)!.rotation).toBeCloseTo(full.locals.get(id)!.rotation / 2, 12);
  });
  it.each([[400, 0], [0, 0], [1, 0]])('clamps unreachable or folded targets %s,%s', (x, y) => {
    const { bones, constraint } = createLeg();
    bones[3].setup.x = x; bones[3].setup.y = y;
    const { diagnostics } = run(bones, [constraint]);
    expect(diagnostics[0].endpoint.every(Number.isFinite)).toBe(true);
    if (x === 400) { expect(diagnostics[0].status).toBe('unreachable'); expect(diagnostics[0].distance).toBeCloseTo(200, 10); }
    else expect(diagnostics[0].distance).toBeLessThan(1e-8);
  });
  it.each([0, 1, 2])('zero-length segment case %s is finite', which => {
    const { bones, constraint } = createLeg();
    if (which !== 1) bones[1].setup.x = 0;
    if (which !== 0) constraint.endpoint = [0, 0];
    const result = run(bones, [constraint]);
    expect(result.diagnostics[0].status).toBe('degenerate');
    expect([...result.worlds.values()].flat().every(Number.isFinite)).toBe(true);
  });
  it.each([-2, 2])('uniform scaled/reflected root %s reaches target', scaleX => {
    const { bones, constraint } = createLeg();
    bones[0].setup.scaleX = scaleX; bones[0].setup.scaleY = 2;
    bones[1].setup.scaleX = -0.5; constraint.endpoint = [70, 40];
    const result = run(bones, [constraint]);
    expect(result.diagnostics[0].distance).toBeLessThan(1e-8);
  });
  it('solves beneath affine sheared/reflected ancestor', () => {
    const { bones, constraint } = createLeg();
    bones.push({ id: 'outer', name: 'Outer', parentId: null, setup: { x: 10, y: 20, rotation: 0.3, scaleX: -2, scaleY: 0.8 } });
    bones.push({ id: 'inner', name: 'Inner', parentId: 'outer', setup: { x: 3, y: 4, rotation: 0.7, scaleX: 1, scaleY: 1 } });
    bones[0].parentId = 'inner'; bones[3].setup.x = -100; bones[3].setup.y = -50;
    expect(run(bones, [constraint]).diagnostics[0].distance).toBeLessThan(1e-8);
  });
  it.each([0, 2])('reports singular/nonuniform root scale %s without NaN', scaleX => {
    const { bones, constraint } = createLeg(); bones[0].setup.scaleX = scaleX;
    const d = run(bones, [constraint]).diagnostics[0];
    expect(d.status).toBe(scaleX === 0 ? 'singular' : 'unsupported-scale');
    expect(d.endpoint.every(Number.isFinite)).toBe(true);
  });
  it('uses unique order independently of array order', () => {
    const { bones, constraint } = createLeg();
    bones.push({ ...bones[3], id: 'other-target', setup: { ...bones[3].setup, x: 80, y: 60 } });
    const other = { ...constraint, id: 'second', targetBoneId: 'other-target', order: 1 };
    const a = run(bones, [other, constraint]), b = run(bones, [constraint, other]);
    expect(a).toEqual(b); expect(a.diagnostics.map(d => d.constraintId)).toEqual(['leg', 'second']);
    expect(a.diagnostics[1].distance).toBeLessThan(1e-8);
    expect(a.diagnostics[0].endpoint).toEqual(a.diagnostics[1].endpoint);
    expect(a.diagnostics[0].distance).toBeGreaterThan(100);
  });
});

describe('IK numerical stability', () => {
  it('repeated seeded target samples remain pure and independent of sample order', () => {
    const { bones, constraint } = createLeg();
    const original = structuredClone(bones);
    let seed = 16;
    const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
    const targets = Array.from({ length: 20 }, () => {
      const radius = 10 + random() * 180, angle = random() * Math.PI * 2;
      return [radius * Math.cos(angle), radius * Math.sin(angle)];
    });
    const evaluateTarget = (index: number) => {
      const b = structuredClone(bones);
      [b[3].setup.x, b[3].setup.y] = targets[index];
      return run(b, [{ ...constraint, bend: index % 2 ? 1 : -1 }]);
    };
    const baseline = targets.map((_, i) => evaluateTarget(i));
    const order = [13, 2, 19, 7, 0, 16, 4, 11, 9, 18, 1, 15, 5, 12, 3, 17, 8, 14, 6, 10];
    for (const i of order) {
      const result = evaluateTarget(i);
      expect(result).toEqual(baseline[i]);
      expect(result.diagnostics[0].distance).toBeLessThanOrEqual(0.5);
    }
    expect(bones).toEqual(original);
  });
  it('inner unreachable annulus clamps to minimum reach', () => {
    const { bones, constraint } = createLeg();
    bones[1].setup.x = 150;
    bones[3].setup.x = 0; bones[3].setup.y = 0;
    const d = run(bones, [constraint]).diagnostics[0];
    expect(d.status).toBe('unreachable'); expect(d.distance).toBeCloseTo(50, 9);
  });
  it('singular ancestor retains finite FK', () => {
    const { bones, constraint } = createLeg();
    bones.push({ id: 'parent', name: 'Parent', parentId: null,
      setup: { ...bones[0].setup, scaleY: 0 } });
    bones[0].parentId = 'parent';
    expect(run(bones, [constraint]).diagnostics[0].status).toBe('singular');
  });
});

it('retains near-fold geometry when target reach is tiny relative to limb length', () => {
  const { bones, constraint } = createLeg();
  bones[1].setup.x = 1e14;
  constraint.endpoint = [1e14 - 10, 0];
  bones[3].setup.x = 20; bones[3].setup.y = 0;
  for (const bend of [1, -1] as const) {
    const d = run(bones, [{ ...constraint, bend }]).diagnostics[0];
    expect(d.status).toBe('solved');
    expect(d.distance).toBeLessThanOrEqual(0.5);
  }
});
