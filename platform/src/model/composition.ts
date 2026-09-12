import type { CompositionMask, Problem, Project } from './types';

const key = (m: CompositionMask[number]) => `${m.boneId}/${m.property}`;
/** Semantic checks after strict schema validation, also run after every Session batch. */
export function compositionProblem(p: Project): Problem | undefined {
  if (p.compositions === undefined) return;
  if (!p.requiredCapabilities.includes('composition-v1'))
    return { code: 'UNSUPPORTED_CAPABILITY', path: '/requiredCapabilities', message: 'Compositions require composition-v1' };
  const ids = new Set<string>();
  const bones = new Set(p.bones.map(b => b.id));
  const animations = new Map(p.animations.map(a => [a.id, a]));
  const invalid = (path: string, message: string): Problem => ({ code: 'INVALID_INPUT', path, message });
  const maskProblem = (mask: CompositionMask, path: string): Problem | undefined => {
    const seen = new Set<string>();
    for (const [i, m] of mask.entries()) {
      if (!bones.has(m.boneId)) return { code: 'MISSING_REFERENCE', path: `${path}/${i}/boneId`, message: 'Mask bone does not exist', ids: [m.boneId] };
      if (seen.has(key(m))) return invalid(`${path}/${i}`, 'Duplicate bone/property mask');
      seen.add(key(m));
    }
  };
  const sourceProblem = (id: string, path: string): Problem | undefined => {
    const a = animations.get(id);
    if (!a) return { code: 'MISSING_REFERENCE', path: `${path}/animationId`, message: 'Source animation does not exist', ids: [id] };
    if (a.deforms?.length) return { code: 'UNSUPPORTED_CAPABILITY', path, message: 'Composition v1 does not support source deforms', ids: [id] };
  };
  for (const [i, c] of p.compositions.entries()) {
    const path = `/compositions/${i}`;
    if (ids.has(c.id)) return invalid(`${path}/id`, 'Duplicate composition ID');
    ids.add(c.id);
    const orders = new Set<number>(), tracks = new Set<string>();
    for (const [j, t] of c.tracks.entries()) {
      const at = `${path}/tracks/${j}`;
      if (orders.has(t.order)) return invalid(`${at}/order`, 'Track order must be unique');
      if (tracks.has(t.id)) return invalid(`${at}/id`, 'Track ID must be unique');
      orders.add(t.order); tracks.add(t.id);
      if (t.start > c.duration) return invalid(`${at}/start`, 'Track start exceeds composition duration');
      if (t.kind === 'track') {
        const problem = sourceProblem(t.source.animationId, `${at}/source`) ?? maskProblem(t.mask, `${at}/mask`);
        if (problem) return problem;
        if (!Number.isFinite(t.start + t.fadeIn)) return invalid(`${at}/fadeIn`, 'Fade endpoint must be finite');
        if (t.end !== undefined && (t.end < t.start || !Number.isFinite(t.end + t.fadeOut)))
          return invalid(`${at}/end`, 'End must be at or after start and removal endpoint must be finite');
      } else {
        const problem = sourceProblem(t.outgoing.animationId, `${at}/outgoing`) ?? sourceProblem(t.incoming.animationId, `${at}/incoming`) ??
          maskProblem(t.outgoing.mask, `${at}/outgoing/mask`) ?? maskProblem(t.incoming.mask, `${at}/incoming/mask`);
        if (problem) return problem;
        if (!Number.isFinite(t.start + t.duration) || t.start + t.duration > c.duration)
          return invalid(`${at}/duration`, 'Crossfade must complete within composition duration');
        const outgoing = animations.get(t.outgoing.animationId)!;
        const incoming = animations.get(t.incoming.animationId)!;
        const keyedOut = new Set(outgoing.channels.map(key));
        const keyedIn = new Set(incoming.channels.map(key));
        const maskedIn = new Set(t.incoming.mask.map(key));
        const missing = t.outgoing.mask.map(key).filter(k => keyedOut.has(k) && (!keyedIn.has(k) || !maskedIn.has(k)));
        if (missing.length) return invalid(`${at}/incoming/mask`, `Crossfade incoming requires keyed and masked coverage: ${missing.join(', ')}`);
      }
    }
  }
}
