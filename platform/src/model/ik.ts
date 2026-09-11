import type { Bone, Id, Problem } from './types.js';

/** Endpoint is a point in child-bone local space; target is the target bone origin. */
export interface TwoBoneIK {
  id: Id;
  type: 'two-bone-ik';
  rootBoneId: Id;
  childBoneId: Id;
  targetBoneId: Id;
  endpoint: [number, number];
  /** Signed elbow orientation in root-parent coordinates (before ancestor reflection). */
  bend: 1 | -1;
  mix: number;
  order: number;
}
export interface IKDiagnostic {
  constraintId: Id;
  order: number;
  target: [number, number];
  endpoint: [number, number];
  distance: number;
  status: 'solved' | 'unreachable' | 'degenerate' | 'disabled' | 'unsupported-scale' | 'singular';
}

/** Semantic checks after JSON shape, unique bone IDs and acyclic hierarchy validation. */
export function ikProblem(bones: readonly Bone[], constraints: readonly TwoBoneIK[]): Problem | undefined {
  const source = new Map(bones.map(b => [b.id, b]));
  const ids = new Set<string>(), orders = new Set<number>();
  for (const [i, c] of constraints.entries()) {
    const path = `/ikConstraints/${i}`;
    const invalid = (field: string, message: string): Problem =>
      ({ code: 'INVALID_INPUT', path: `${path}/${field}`, message, ids: [c.id] });
    if (ids.has(c.id)) return invalid('id', 'Duplicate IK constraint ID');
    ids.add(c.id);
    if (orders.has(c.order)) return invalid('order', 'IK solve order must be unique');
    orders.add(c.order);
    for (const field of ['rootBoneId', 'childBoneId', 'targetBoneId'] as const) {
      if (!source.has(c[field])) return { code: 'MISSING_REFERENCE', path: `${path}/${field}`,
        message: 'IK bone does not exist', ids: [c.id, c[field]] };
    }
    if (source.get(c.childBoneId)!.parentId !== c.rootBoneId)
      return invalid('childBoneId', 'IK child must be a direct child of root');
    let target: Bone | undefined = source.get(c.targetBoneId);
    while (target) {
      if (target.id === c.rootBoneId)
        return invalid('targetBoneId', 'IK target must be outside the root subtree');
      target = target.parentId === null ? undefined : source.get(target.parentId);
    }
  }
}
