import type { Bone, Matrix, Result, Transform } from '../model/types';
import type { IKDiagnostic, TwoBoneIK } from '../model/ik';
import { localMatrix, multiply } from './transforms';

const EPS = 1e-12;
const identity: Matrix = [1, 0, 0, 1, 0, 0];
const point = (m: Matrix, p: readonly number[]): [number, number] =>
  [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
const angleMix = (from: number, to: number, mix: number) =>
  from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * mix;

/** Internal hook: validated bones/constraints, fresh evaluator-owned maps only. */
export function solveIK(bones: readonly Bone[], constraints: readonly TwoBoneIK[],
  locals: Map<string, Transform>, worlds: Map<string, Matrix>): Result<IKDiagnostic[]> {
  const source = new Map(bones.map(b => [b.id, b]));
  const diagnostics: IKDiagnostic[] = [];
  const invalid = (message = 'Derived IK geometry must be finite'): Result<never> => ({ ok: false, error: {
    code: 'INVALID_INPUT', path: '/ikConstraints', message,
  } });
  for (const c of [...constraints].sort((a, b) => a.order - b.order)) {
    const root = source.get(c.rootBoneId)!;
    const r = locals.get(c.rootBoneId)!, child = locals.get(c.childBoneId)!;
    const parent = root.parentId === null ? identity : worlds.get(root.parentId)!;
    const targetWorld = worlds.get(c.targetBoneId)!;
    const target: [number, number] = [targetWorld[4], targetWorld[5]];
    let status: IKDiagnostic['status'] = 'solved';
    const det = parent[0] * parent[3] - parent[1] * parent[2];
    if (!Number.isFinite(det)) return invalid();
    if (c.mix === 0) status = 'disabled';
    else if (Math.abs(det) <= EPS || Math.abs(r.scaleX) <= EPS || Math.abs(r.scaleY) <= EPS) status = 'singular';
    else if (Math.abs(Math.abs(r.scaleX) - Math.abs(r.scaleY)) > EPS * Math.max(Math.abs(r.scaleX), Math.abs(r.scaleY))) status = 'unsupported-scale';
    else {
      const dx = target[0] - parent[4], dy = target[1] - parent[5];
      const tx = (parent[3] * dx - parent[2] * dy) / det - r.x;
      const ty = (-parent[1] * dx + parent[0] * dy) / det - r.y;
      const ax = r.scaleX * child.x, ay = r.scaleY * child.y;
      const ex = child.scaleX * c.endpoint[0], ey = child.scaleY * c.endpoint[1];
      const l1 = Math.hypot(ax, ay), l2 = Math.abs(r.scaleX) * Math.hypot(ex, ey);
      const distance = Math.hypot(tx, ty);
      if (![tx, ty, ax, ay, ex, ey, l1, l2, distance, l1 + l2].every(Number.isFinite)) return invalid();
      const direction = distance > EPS ? Math.atan2(ty, tx) : 0;
      let rootAngle = r.rotation, childAngle = child.rotation;
      if (l1 <= EPS && l2 <= EPS) status = 'degenerate';
      else {
        let jx: number, jy: number;
        if (l1 <= EPS) {
          status = 'degenerate'; jx = 0; jy = 0;
        } else if (l2 <= EPS) {
          status = 'degenerate'; jx = l1 * Math.cos(direction); jy = l1 * Math.sin(direction);
        } else {
          const reach = Math.min(l1 + l2, Math.max(Math.abs(l1 - l2), distance));
          status = distance > l1 + l2 || distance < Math.abs(l1 - l2) ? 'unreachable' : 'solved';
          // Normalize lengths first to avoid squaring very large finite values.
          const scale = Math.max(l1, l2, reach);
          const a = l1 / scale, b = l2 / scale, d = reach / scale;
          // Factor the difference before normalizing: near-folded long limbs otherwise lose
          // their length difference to cancellation, and small normalized reach is not zero.
          const difference = (l1 - l2) / scale;
          const cos = reach === 0 ? 0 : Math.min(1, Math.max(-1,
            (difference * (a + b) + d*d) / (2*a*d)));
          const jointAngle = direction - c.bend * Math.acos(cos);
          jx = l1 * Math.cos(jointAngle); jy = l1 * Math.sin(jointAngle);
        }
        if (l1 > EPS) rootAngle = Math.atan2(jy, jx) - Math.atan2(ay, ax);
        const reach = Math.min(l1 + l2, Math.max(Math.abs(l1 - l2), distance));
        const vx = reach * Math.cos(direction) - jx, vy = reach * Math.sin(direction) - jy;
        const co = Math.cos(rootAngle), si = Math.sin(rootAngle);
        if (l2 > EPS) childAngle = Math.atan2((-si * vx + co * vy) / r.scaleY,
          (co * vx + si * vy) / r.scaleX) - Math.atan2(ey, ex);
        r.rotation = angleMix(r.rotation, rootAngle, c.mix);
        child.rotation = angleMix(child.rotation, childAngle, c.mix);
        // Recompute parent-first: constraints later in order observe all earlier changes.
        worlds.clear();
        for (const bone of bones) {
          const chain: Bone[] = [];
          let current: Bone | undefined = bone;
          while (current && !worlds.has(current.id)) {
            chain.push(current); current = current.parentId === null ? undefined : source.get(current.parentId);
          }
          for (const b of chain.reverse()) {
            const local = localMatrix(locals.get(b.id)!);
            const world = b.parentId === null ? local : multiply(worlds.get(b.parentId)!, local);
            if (!world.every(Number.isFinite)) return invalid();
            worlds.set(b.id, world);
          }
        }
      }
    }
    const endpoint = point(worlds.get(c.childBoneId)!, c.endpoint);
    const distance = Math.hypot(target[0] - endpoint[0], target[1] - endpoint[1]);
    if (![...endpoint, distance].every(Number.isFinite)) return invalid();
    if (status === 'solved' && c.mix === 1 && distance > 0.5)
      return invalid('IK solution exceeds 0.5 logical-pixel numerical tolerance');
    diagnostics.push({ constraintId: c.id, order: c.order, target, endpoint, distance, status });
  }
  // Diagnostics describe the final pose, including later constraints overriding earlier ones.
  const byId = new Map(constraints.map(c => [c.id, c]));
  for (const diagnostic of diagnostics) {
    const c = byId.get(diagnostic.constraintId)!;
    const targetWorld = worlds.get(c.targetBoneId)!;
    diagnostic.target = [targetWorld[4], targetWorld[5]];
    diagnostic.endpoint = point(worlds.get(c.childBoneId)!, c.endpoint);
    diagnostic.distance = Math.hypot(diagnostic.target[0] - diagnostic.endpoint[0],
      diagnostic.target[1] - diagnostic.endpoint[1]);
    if (![...diagnostic.endpoint, diagnostic.distance].every(Number.isFinite)) return invalid();
  }
  return { ok: true, value: diagnostics, warnings: [] };
}
