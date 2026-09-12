import { describe, expect, it } from 'vitest';
import { createSession, prepareBundle, type Session, type SessionEvent } from '../../src/commands';
import { validate } from '../../src/model';
import { evaluateTarget } from '../../src/engine';
import { createMeshProject } from '../../fixtures/mesh/synthetic';
import { fixture, composition, crossfade, track, value } from '../engine/composition-fixture';
async function session(project = fixture()) {
  const bundle = { project, assets: new Map(project.assets.map(a => [a.id, new Uint8Array([1])])) };
  return value(createSession(value(await prepareBundle(bundle, async () => ({ ok: true, value: bundle, warnings: [] })))));
}
const req = (s: Session, requestId: string) => ({ projectId: s.inspect().projectId, expectedRevision: s.inspect().revision, requestId });
const pose = (s: Session) => value(evaluateTarget(s.inspect(), { target: { kind: 'composition', compositionId: 'motion' }, time: .5 }));

describe('Session composition transactions', () => {
  it('puts/edits through public atomic revisions, retry, undo/redo/checkpoint and events', async () => {
    const p = fixture(); delete p.compositions; p.requiredCapabilities = p.requiredCapabilities.filter(c => c !== 'composition-v1');
    const s = await session(p), events: SessionEvent[] = []; s.subscribe(e => events.push(e));
    const batch = { ...req(s, 'create'), operations: [{ kind: 'putComposition', value: composition() }] };
    const first = value(s.apply(batch)); expect(first.revision).toBe(1); expect(s.apply(batch)).toEqual({ ok: true, value: first, warnings: [] });
    expect(events).toHaveLength(1); expect(events[0].changed).toEqual([{ collection: 'compositions', id: 'motion' }]);
    expect(s.capabilities().features).toContain('composition-v1');
    const initial = pose(s); const checkpoint = value(s.checkpoint({ ...req(s, 'save'), label: 'before layer' }));
    const edited = composition([track(), track('wave', 1, { mode: 'additive', alpha: .5 })]);
    value(s.apply({ ...req(s, 'edit'), operations: [{ kind: 'putComposition', value: edited }] })); const after = pose(s);
    expect(after.bones.arm).not.toEqual(initial.bones.arm);
    value(s.undo(req(s, 'undo'))); expect(pose(s).bones).toEqual(initial.bones); expect(s.inspect().revision).toBe(3);
    value(s.redo(req(s, 'redo'))); expect(pose(s).bones).toEqual(after.bones); expect(s.inspect().revision).toBe(4);
    value(s.restore({ ...req(s, 'restore'), checkpointId: checkpoint.id })); expect(pose(s).bones).toEqual(initial.bones);
    expect(events.at(-1)!.changed).toContainEqual({ collection: 'compositions', id: 'motion' });
    expect(s.apply({ ...batch, operations: [{ kind: 'putComposition', value: edited }] })).toMatchObject({ ok: false, error: { code: 'REQUEST_ID_REUSED' } });
    expect(s.apply({ ...req(s, 'stale'), expectedRevision: 0, operations: [{ kind: 'putComposition', value: edited }] })).toMatchObject({ ok: false, error: { code: 'REVISION_CONFLICT' } });
    value(s.apply({ ...req(s, 'remove'), operations: [{ kind: 'remove', collection: 'compositions', id: 'motion' }] }));
    expect(s.inspect().compositions).toEqual([]); value(s.undo(req(s, 'unremove'))); expect(pose(s).bones).toEqual(initial.bones);
  });
  it('rejects dangling refs, invalid batch and frozen coverage edits without mutation/history/events', async () => {
    const p = fixture(); p.compositions = [composition([crossfade()])]; const s = await session(p), events: SessionEvent[] = []; s.subscribe(e => events.push(e));
    const before = s.inspect(), history = s.history();
    const badAnimation = structuredClone(p.animations[2]); badAnimation.channels = badAnimation.channels.filter(c => c.boneId !== 'arm');
    for (const operations of [
      [{ kind: 'remove', collection: 'animations', id: 'walk' }],
      [{ kind: 'remove', collection: 'bones', id: 'target' }],
      [{ kind: 'putComposition', value: composition([track('missing')]) }],
      [{ kind: 'putAnimation', value: badAnimation }],
      [{ kind: 'putComposition', value: composition([]) }, { kind: 'remove', collection: 'animations', id: 'missing' }],
    ]) expect(s.apply({ ...req(s, 'failure'), operations }).ok).toBe(false);
    expect(s.inspect()).toEqual(before); expect(s.history()).toEqual(history); expect(events).toEqual([]);
    // Same failed request ID can be corrected and retried. Remove all dependents in one final valid batch.
    value(s.apply({ ...req(s, 'failure'), operations: [{ kind: 'remove', collection: 'animations', id: 'walk' }, { kind: 'remove', collection: 'compositions', id: 'motion' }] }));
    expect(s.inspect().revision).toBe(1); expect(validate(s.inspect()).ok).toBe(true);
  });
  it('source edits recompute frozen values while undo restores exact previous pose', async () => {
    const p = fixture(); p.compositions = [composition([track('walk', 0, { source: { kind: 'frozen', animationId: 'walk', entryTime: .5 } })])];
    const s = await session(p), old = pose(s); const source = structuredClone(p.animations[0]); source.channels[1].keys[1].value = 1.4;
    value(s.apply({ ...req(s, 'source'), operations: [{ kind: 'putAnimation', value: source }] })); expect(pose(s).bones.arm).not.toEqual(old.bones.arm);
    value(s.undo(req(s, 'undo-source'))); expect(pose(s).bones).toEqual(old.bones);
  });
  it('requires explicit v1 migration and atomically rejects source deforms for live/frozen/crossfade', async () => {
    const p = fixture(); delete p.compositions; delete p.ikConstraints; p.requiredCapabilities = ['region-v0']; p.formatVersion = 0;
    const s = await session(p);
    expect(s.apply({ ...req(s, 'put'), operations: [{ kind: 'putComposition', value: composition() }] })).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_VERSION' } });
    expect(s.inspect()).toEqual(p);
    value(s.apply({ ...req(s, 'put'), operations: [{ kind: 'migrateProject', targetVersion: 1 }, { kind: 'putComposition', value: composition() }] }));
    expect(s.inspect().requiredCapabilities).toContain('composition-v1');
    const mesh = createMeshProject(); const source = mesh.animations[0], deforms = source.deforms; delete source.deforms;
    mesh.requiredCapabilities.push('composition-v1');
    const c = composition([track(source.id, 0, { mask: [] })]); mesh.compositions = [c];
    const ms = await session(mesh), before = ms.inspect();
    source.deforms = deforms;
    expect(ms.apply({ ...req(ms, 'deform'), operations: [{ kind: 'putAnimation', value: source }] })).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_CAPABILITY', message: expect.stringContaining('deforms') } });
    expect(ms.inspect()).toEqual(before);
    expect(ms.apply({ ...req(ms, 'deform-vertices'), operations: [{ kind: 'setVertexDeforms', animationId: source.id, attachmentId: mesh.attachments[0].id,
      time: 0, curve: {type:'linear'}, vertices: [{vertex:0,offset:[1,2]}] }] })).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_CAPABILITY' } });
    expect(ms.inspect()).toEqual(before); expect(ms.history().undo).toEqual([]);
    for (const tracks of [[track(source.id, 0, { mask: [] })], [track(source.id, 0, { mask: [], source: { kind: 'frozen', animationId: source.id, entryTime: 0 } })],
      [{ ...crossfade(), outgoing: { animationId: source.id, entryTime: 0, mask: [] }, incoming: { animationId: source.id, offset: 0, speed: 1, mask: [] } }]]) {
      mesh.compositions = [composition(tracks)]; expect(validate(mesh)).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_CAPABILITY' } });
    }
  });
});
