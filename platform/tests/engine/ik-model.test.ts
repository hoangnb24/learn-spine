import { expect, it } from 'vitest';
import { createLeg } from '../../fixtures/ik/leg';
import { ikProblem } from '../../src/model/ik';
it('accepts independent target and unique ordered overlapping constraints', () => {
  const { bones, constraint } = createLeg();
  expect(ikProblem(bones, [constraint, { ...constraint, id: 'other', order: 1 }])).toBeUndefined();
});
it('rejects missing references with location and IDs', () => {
  const { bones, constraint } = createLeg();
  constraint.targetBoneId = 'missing';
  expect(ikProblem(bones, [constraint])).toMatchObject({ code: 'MISSING_REFERENCE',
    path: '/ikConstraints/0/targetBoneId', ids: ['leg', 'missing'] });
});
it('rejects non-direct chain, feedback target, duplicate ID/order', () => {
  const { bones, constraint } = createLeg();
  for (const targetBoneId of ['hip', 'shin', 'foot'])
    expect(ikProblem(bones, [{ ...constraint, targetBoneId }])?.path).toBe('/ikConstraints/0/targetBoneId');
  expect(ikProblem(bones, [{ ...constraint, childBoneId: 'foot' }])?.path).toBe('/ikConstraints/0/childBoneId');
  expect(ikProblem(bones, [constraint, constraint])?.path).toBe('/ikConstraints/1/id');
  expect(ikProblem(bones, [constraint, { ...constraint, id: 'other' }])?.path).toBe('/ikConstraints/1/order');
});
