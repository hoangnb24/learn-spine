import { describe, expect, it } from 'vitest';
import { parse, serialize, validate, type Project } from '../../src/model';
import { fixture, composition, crossfade, track, value } from '../engine/composition-fixture';
const bad = (edit: (p: Project) => void, code = 'INVALID_INPUT') => { const p = fixture(); edit(p); expect(validate(p)).toMatchObject({ ok: false, error: { code } }); };

describe('strict composition v1 model', () => {
  it('roundtrips optional v1 without changing legacy projects; requires explicit format/capability', () => {
    const p = fixture(); expect(value(parse(value(serialize(p))))).toEqual(p);
    delete p.compositions; p.requiredCapabilities = ['region-v0', 'ik-v1']; expect(value(validate(p))).toEqual(p);
    bad(p => { p.requiredCapabilities = ['region-v0', 'ik-v1']; }, 'UNSUPPORTED_CAPABILITY');
    bad(p => { p.formatVersion = 0; }, 'UNSUPPORTED_CAPABILITY');
    bad(p => { (p.requiredCapabilities as string[]).push('composition-v2'); }, 'UNSUPPORTED_CAPABILITY');
    bad(p => { p.formatVersion = 2 as 1; }, 'UNSUPPORTED_VERSION');
  });
  it('rejects unknown fields at every new nested level and nested composition sources', () => {
    for (const edit of [
      (p: Project) => Object.assign(p.compositions![0], { extra: 1 }),
      (p: Project) => Object.assign(p.compositions![0].tracks[0], { extra: 1 }),
      (p: Project) => { const t = track(); Object.assign(t.source, { compositionId: 'motion' }); p.compositions![0].tracks = [t]; },
      (p: Project) => { const t = track(); Object.assign(t.mask[0], { children: true }); p.compositions![0].tracks = [t]; },
      (p: Project) => { const t = crossfade(); Object.assign(t.incoming, { extra: 1 }); p.compositions![0].tracks = [t]; },
      (p: Project) => { const t = crossfade(); Object.assign(t.outgoing, { locals: {} }); p.compositions![0].tracks = [t]; },
    ]) bad(edit);
  });
  it('rejects duplicate composition/track IDs, orders, masks and missing bone/source references', () => {
    bad(p => p.compositions!.push(composition()));
    bad(p => { p.compositions![0].tracks = [track(), track('wave', 0)]; });
    bad(p => { p.compositions![0].tracks = [track(), track('wave', 1, { id: 'walk-0' })]; });
    bad(p => { const t = track(); t.mask.push(t.mask[0]); p.compositions![0].tracks = [t]; });
    bad(p => { const t = track(); t.mask[0].boneId = 'missing'; p.compositions![0].tracks = [t]; }, 'MISSING_REFERENCE');
    bad(p => { const t = track(); t.mask[0].property = 'opacity' as 'x'; p.compositions![0].tracks = [t]; });
    bad(p => { p.compositions![0].tracks = [track('missing')]; }, 'MISSING_REFERENCE');
    bad(p => { const t = crossfade(); t.outgoing.animationId = 'missing'; p.compositions![0].tracks = [t]; }, 'MISSING_REFERENCE');
  });
  it('rejects invalid finite/range/timing data, permits explicit finite holds beyond clip end', () => {
    for (const n of [NaN, Infinity, -Infinity, -1]) {
      for (const field of ['start', 'fadeIn', 'fadeOut', 'end', 'alpha', 'order'] as const)
        bad(p => { p.compositions![0].tracks = [track('walk', 0, { [field]: n })]; });
      for (const field of ['offset', 'speed'] as const)
        bad(p => { p.compositions![0].tracks = [track('walk', 0, { source: { kind: 'live', animationId: 'walk', offset: 0, speed: 1, [field]: n } })]; });
      bad(p => { p.compositions![0].tracks = [track('walk', 0, { source: { kind: 'frozen', animationId: 'walk', entryTime: n } })]; });
    }
    bad(p => { p.compositions![0].duration = 0; });
    bad(p => { p.compositions![0].duration = Infinity; });
    bad(p => { p.compositions![0].loop = 1 as unknown as boolean; });
    bad(p => { p.compositions![0].tracks = [track('walk', 0, { start: 1, end: .5 })]; });
    bad(p => { p.compositions![0].tracks = [track('walk', .5)]; });
    bad(p => { p.compositions![0].tracks = [track('walk', 0, { alpha: 1.01 })]; });
    bad(p => { p.compositions![0].tracks = [track('walk', 0, { start: 3 })]; });
    bad(p => { p.compositions![0].tracks = [{ ...crossfade(), duration: 2 }]; });
    bad(p => { p.compositions![0].duration = 1e308; p.compositions![0].tracks = [track('walk', 0, { start: 1e308, fadeIn: 1e308 })]; });
    const p = fixture(); p.compositions![0].tracks = [track('walk', 0, { end: 10, fadeOut: 2 })]; expect(validate(p).ok).toBe(true);
  });
  it('checks complete keyed AND masked crossfade coverage, reporting every missing pair', () => {
    const p = fixture(); p.compositions = [composition([crossfade()])]; expect(validate(p).ok).toBe(true);
    p.animations[2].channels = p.animations[2].channels.filter(c => c.boneId !== 'arm' && c.boneId !== 'hip');
    expect(validate(p)).toMatchObject({ ok: false, error: { path: '/compositions/0/tracks/0/incoming/mask', message: expect.stringContaining('hip/y, arm/rotation') } });
    const q = fixture(), t = crossfade(); t.incoming.mask = t.incoming.mask.filter(m => m.boneId !== 'arm'); q.compositions = [composition([t])];
    expect(validate(q)).toMatchObject({ ok: false, error: { message: expect.stringContaining('arm/rotation') } });
    // A wide outgoing mask does not invent absent keys requiring coverage.
    t.outgoing.mask.push({ boneId: 'foot', property: 'x' }); t.incoming.mask = t.outgoing.mask.filter(m => m.boneId !== 'foot');
    expect(validate(q).ok).toBe(true);
  });
});
