import type { Project, Pose } from "../../../src/model";
import type { DiagnosticReport, Point } from "../../../src/diagnostics";
import { evaluate } from "../../../src/engine";
import { corners } from "../../../src/render";
type MeasuredPoint =
  | Point
  | { kind: "region-corner"; slotId: string; corner: number };
import { unwrap } from "../../../fixtures/deformation/author";
/** Supplement #18's failure-only report with actual values for every default point
 * and all four corners of every drawn region (including rotational seams).
 * Same fixed sampling/one-sided derivative policy; evaluator remains canonical.
 */
export function loopValues(project: Project, report: DiagnosticReport) {
  const p = structuredClone(project);
  p.animations[0].loop = false;
  const h = report.sampling.h!,
    T = p.animations[0].duration,
    times = report.sampling.times;
  const cache = new Map<number, Pose>();
  const pose = (t: number) => {
    if (!cache.has(t))
      cache.set(t, unwrap(evaluate(p, { animationId: "cycle", time: t })));
    return cache.get(t)!;
  };
  const refs: MeasuredPoint[] = [
    ...p.bones.map((b) => ({ kind: "bone" as const, boneId: b.id })),
    ...p.slots.flatMap((s) => {
      const a = p.attachments.find((a) => a.id === s.attachmentId);
      return a?.type === "mesh"
        ? Array.from({ length: a.vertices.length / 2 }, (_, vertex) => ({
            kind: "vertex" as const,
            slotId: s.id,
            vertex,
          }))
        : [];
    }),
    ...p.slots.flatMap((s) =>
      p.attachments.find((a) => a.id === s.attachmentId)?.type === "region"
        ? Array.from({ length: 4 }, (_, corner) => ({
            kind: "region-corner" as const,
            slotId: s.id,
            corner,
          }))
        : [],
    ),
    ...(p.ikConstraints ?? []).map((i) => ({
      kind: "ik" as const,
      constraintId: i.id,
    })),
  ];
  const at = (t: number, ref: MeasuredPoint) => {
    const v = pose(t);
    if (ref.kind === "bone") return v.bones[ref.boneId].slice(4, 6);
    if (ref.kind === "ik")
      return v.ik!.find((i) => i.constraintId === ref.constraintId)!.endpoint;
    if (ref.kind === "region-corner") {
      const drawn = v.regions.find((r) => r.slotId === ref.slotId)!;
      const region = p.attachments.find((a) => a.id === drawn.attachmentId)!;
      if (region.type !== "region") throw Error("Expected a region");
      const asset = p.assets.find((a) => a.id === region.assetId)!;
      return corners(region, asset, drawn.world).slice(
        ref.corner * 2,
        ref.corner * 2 + 2,
      );
    }
    const m = v.meshes.find((m) => m.slotId === ref.slotId)!;
    return m.vertices.slice(ref.vertex * 2, ref.vertex * 2 + 2);
  };
  const points = refs.map((ref) => {
    const derivative = (t: number) => {
      if (t < h) {
        const a = at(0, ref),
          b = at(h, ref),
          c = at(2 * h, ref);
        return [0, 1].map((i) => (3 * (b[i] - a[i]) - (c[i] - b[i])) / (2 * h));
      }
      if (t > T - h) {
        const a = at(T, ref),
          b = at(T - h, ref),
          c = at(T - 2 * h, ref);
        return [0, 1].map((i) => (3 * (a[i] - b[i]) - (b[i] - c[i])) / (2 * h));
      }
      const a = at(t - h, ref),
        b = at(t + h, ref);
      return [0, 1].map((i) => (b[i] - a[i]) / (2 * h));
    };
    const start = at(0, ref),
      end = at(T, ref),
      startVelocity = derivative(0),
      endVelocity = derivative(T),
      sampledPeakSpeed = Math.max(
        ...times.map((t) => Math.hypot(...derivative(t))),
      );
    return {
      ref,
      start,
      end,
      startVelocity,
      endVelocity,
      positionError: Math.hypot(...start.map((n, i) => n - end[i])),
      velocityError: Math.hypot(
        ...startVelocity.map((n, i) => n - endVelocity[i]),
      ),
      sampledPeakSpeed,
      velocityThreshold: Math.max(0.5, 0.05 * sampledPeakSpeed),
    };
  });
  return {
    h,
    intervals: 60,
    times,
    points,
    maxPositionError: Math.max(...points.map((p) => p.positionError)),
    maxVelocityError: Math.max(...points.map((p) => p.velocityError)),
    maxVelocityThresholdRatio: Math.max(
      ...points.map((p) => p.velocityError / p.velocityThreshold),
    ),
  };
}
