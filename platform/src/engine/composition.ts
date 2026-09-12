import type { Composition, Project, Result, Transform, TransformTrack } from '../model';
import { sample, sampledTime } from './timeline';

/** Canonical descriptor expansion; each group remains adjacent at its unique stack order. */
export function compositionPrimitives(composition: Composition): TransformTrack[] {
  return [...composition.tracks].sort((a, b) => a.order - b.order).flatMap((t): TransformTrack[] => t.kind === 'track' ? [t] : [
    { kind: 'track', id: t.id, order: t.order, source: { kind: 'frozen', animationId: t.outgoing.animationId, entryTime: t.outgoing.entryTime },
      mask: t.outgoing.mask, mode: 'overwrite', alpha: 1, start: t.start, fadeIn: 0, end: t.start + t.duration, fadeOut: 0 },
    { kind: 'track', id: t.id, order: t.order, source: { kind: 'live', animationId: t.incoming.animationId, offset: t.incoming.offset, speed: t.incoming.speed },
      mask: t.incoming.mask, mode: 'overwrite', alpha: 1, start: t.start, fadeIn: t.duration, fadeOut: 0 },
  ]);
}
export function trackWeight(track: TransformTrack, time: number): number {
  if (time < track.start) return 0;
  const incoming = track.fadeIn === 0 ? 1 : Math.min(1, (time - track.start) / track.fadeIn);
  const outgoing = track.end === undefined || time < track.end ? 1 : track.fadeOut === 0 ? 0 : Math.max(0, 1 - (time - track.end) / track.fadeOut);
  return track.alpha * incoming * outgoing;
}
/** Validated project and normalized composition clock in; fresh pre-IK locals out. */
export function composeLocals(project: Project, composition: Composition, time: number): Result<Map<string, Transform>> {
  const locals = new Map(project.bones.map(b => [b.id, { ...b.setup }]));
  const setup = new Map(project.bones.map(b => [b.id, b.setup]));
  const animations = new Map(project.animations.map(a => [a.id, a]));
  for (const track of compositionPrimitives(composition)) {
    const w = trackWeight(track, time);
    if (w === 0) continue;
    const animation = animations.get(track.source.animationId)!;
    const sourceTime = track.source.kind === 'frozen' ? track.source.entryTime : track.source.offset + (time - track.start) * track.source.speed;
    if (!Number.isFinite(sourceTime)) return { ok: false, error: { code: 'INVALID_INPUT', path: '/compositions', message: `Derived source time must be finite for track ${track.id}` } };
    const at = sampledTime(sourceTime, animation.duration, animation.loop);
    const mask = new Set(track.mask.map(m => `${m.boneId}/${m.property}`));
    for (const channel of animation.channels) {
      if (!mask.has(`${channel.boneId}/${channel.property}`)) continue;
      const a = sample(channel, at), local = locals.get(channel.boneId)!, prior = local[channel.property];
      const value = track.mode === 'overwrite' ? (1 - w) * prior + w * a : prior + w * (a - setup.get(channel.boneId)![channel.property]);
      if (!Number.isFinite(value)) return { ok: false, error: { code: 'INVALID_INPUT', path: '/compositions', message: `Derived local must be finite for track ${track.id}: ${channel.boneId}/${channel.property}` } };
      local[channel.property] = value;
    }
  }
  return { ok: true, value: locals, warnings: [] };
}
