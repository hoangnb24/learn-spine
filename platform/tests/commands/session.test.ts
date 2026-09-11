import { describe, expect, it } from 'vitest';
import { createSyntheticProject, identity } from '../../fixtures/model/synthetic';
import { createSession, prepareBundle, type Session, type SessionEvent } from '../../src/commands';
import { validate, type Batch, type ProjectBundle, type Result } from '../../src/model';

const value = <T>(r: Result<T>): T => { if (!r.ok) throw new Error(JSON.stringify(r)); return r.value; };
const error = (r: Result<unknown>, code: string) => { expect(r.ok).toBe(false); if (!r.ok) expect(r.error.code).toBe(code); };
// Storage owns real PNG/hash decoding. This injected validator isolates the commands boundary;
// the integration contract requires storage.validateBundle in the application, not this test double.
const trusted = async (input: unknown): Promise<Result<ProjectBundle>> => ({ ok: true, value: input as ProjectBundle, warnings: [] });
const bundle = (project = createSyntheticProject(), byte = 1): ProjectBundle => ({ project, assets: new Map(project.assets.map(a => [a.id, Uint8Array.of(byte)])) });
const prepared = async (b = bundle()) => value(await prepareBundle(b, trusted));
const session = async (b = bundle()) => value(createSession(await prepared(b)));
const req = (s: Session, requestId: string) => ({ projectId: s.inspect().projectId, expectedRevision: s.inspect().revision, requestId });
const put = (s: Session, id: string, x = 5): Batch => ({ ...req(s, id), operations: [{ kind: 'putBone', value: { id: 'root', name: 'Root', parentId: null, setup: { ...identity, x } } }] });

describe('atomic project commands', () => {
  it('validates all operations before committing; final references allow forward construction', async () => {
    const s = await session();
    const initial = s.snapshot();
    const invalid = put(s, 'bad');
    invalid.operations.push({ kind: 'putBone', value: { id: 'bad', name: 'Bad', parentId: 'missing', setup: identity } });
    error(s.apply(invalid), 'MISSING_REFERENCE');
    expect(s.snapshot()).toEqual(initial); expect(s.history().undo).toHaveLength(0);
    value(s.apply({ ...req(s, 'forward'), operations: [
      { kind: 'putSlot', value: { id: 'new-slot', name: 'New', boneId: 'new-bone', attachmentId: null } },
      { kind: 'putBone', value: { id: 'new-bone', name: 'New', parentId: 'root', setup: identity } },
    ] }));
    expect(s.inspect().revision).toBe(1); expect(s.inspect().bones.at(-1)?.id).toBe('new-bone');
    expect(s.inspect().bones[1].id).toBe('root');
  });
  it('rejects unknown, non-JSON, sparse, cyclic and accessor inputs without effects', async () => {
    const s = await session();
    const getter = { ...put(s, 'getter') }; Object.defineProperty(getter, 'evil', { enumerable: true, get() { throw new Error('must not run'); } });
    const cycle: Record<string, unknown> = {}; cycle.self = cycle;
    for (const input of [null, [], {}, { ...put(s, 'extra'), extra: 1 }, put(s, 'nan', NaN), put(s, 'inf', Infinity), { ...put(s, 'undefined'), extra: undefined }, getter, cycle, { ...req(s, 'sparse'), operations: Array(1) }, { ...req(s, 'none'), operations: [] }, { ...req(s, 'large'), operations: Array(1001).fill(put(s, 'x').operations[0]) }]) error(s.apply(input), 'INVALID_INPUT');
    expect(s.inspect().revision).toBe(0);
  });
  it('validates payload before dedup and stale revision, rejects reused IDs across methods', async () => {
    const s = await session(); const input = put(s, 'agent');
    const first = value(s.apply(input));
    value(s.apply(put(s, 'user', 9)));
    expect(value(s.apply(input))).toEqual(first);
    error(s.apply({ ...input, operations: [] }), 'INVALID_INPUT');
    error(s.apply({ ...input, expectedRevision: 1 }), 'REQUEST_ID_REUSED');
    error(s.undo({ ...req(s, 'agent') }), 'REQUEST_ID_REUSED');
    const stale = s.apply({ ...put(s, 'new'), expectedRevision: 0 });
    error(stale, 'REVISION_CONFLICT'); if (!stale.ok) expect(stale.revision).toBe(2);
    expect(s.history().undo).toHaveLength(2);
  });
  it('deduplicates reordered keys and signed zero; failure IDs remain reusable', async () => {
    const s = await session(); const a = put(s, 'zero', -0);
    const first = s.apply(a);
    const reordered = { operations: a.operations, requestId: 'zero', expectedRevision: 0, projectId: 'synthetic' };
    if (reordered.operations[0].kind === 'putBone') reordered.operations[0].value.setup.x = 0;
    expect(s.apply(reordered)).toEqual(first);
    error(s.apply({ ...put(s, 'fix'), expectedRevision: 0 }), 'REVISION_CONFLICT');
    expect(s.apply(put(s, 'fix')).ok).toBe(true);
  });
  it('does not cascade removal, validates slot permutation and reports namespaced changes', async () => {
    const s = await session(); const events: SessionEvent[] = []; s.subscribe(e => events.push(e));
    error(s.apply({ ...req(s, 'remove'), operations: [{ kind: 'remove', collection: 'bones', id: 'child' }] }), 'MISSING_REFERENCE');
    error(s.apply({ ...req(s, 'missing'), operations: [{ kind: 'remove', collection: 'bones', id: 'missing' }] }), 'MISSING_REFERENCE');
    error(s.apply({ ...req(s, 'order'), operations: [{ kind: 'setSlotOrder', ids: ['no'] }] }), 'INVALID_INPUT');
    error(s.apply({ ...req(s, 'dup-order'), operations: [{ kind: 'setSlotOrder', ids: ['body', 'body'] }] }), 'INVALID_INPUT');
    const result = value(s.apply({ ...req(s, 'shared'), operations: [
      { kind: 'putBone', value: { id: 'body', name: 'Body', parentId: 'root', setup: identity } },
      { kind: 'setSlotOrder', ids: ['body'] },
    ] }));
    expect(result.changedIds).toEqual(['body']);
    expect(events[0].changed).toEqual([{ collection: 'bones', id: 'body' }, { collection: 'slots', id: 'body' }]);
  });
  it('supports animation/key/curve recipes through complete putAnimation, preserving unrelated channels', async () => {
    const s = await session();
    const animation = s.inspect().animations[0];
    animation.channels.push({ boneId: 'root', property: 'rotation', keys: [{ time: 0, value: 0, curve: { type: 'bezier', x1: .2, y1: -.5, x2: .8, y2: 1.5 } }, { time: 2, value: Math.PI, curve: { type: 'linear' } }] });
    value(s.apply({ ...req(s, 'keys'), operations: [{ kind: 'putAnimation', value: animation }] }));
    expect(s.inspect().animations[0].channels[0]).toEqual(createSyntheticProject().animations[0].channels[0]);
    animation.channels[1].keys[0].curve = { type: 'bezier', x1: .9, y1: 0, x2: .1, y2: 1 };
    error(s.apply({ ...req(s, 'badcurve'), operations: [{ kind: 'putAnimation', value: animation }] }), 'INVALID_INPUT');
    expect(s.inspect().revision).toBe(1);
  });
});

describe('history, events and session lifetime', () => {
  it('undo/redo increase revision, new writes clear redo, retry emits once', async () => {
    const s = await session(); const events: SessionEvent[] = []; s.subscribe(e => events.push(e));
    const original = s.inspect(); const edit = put(s, 'edit'); value(s.apply(edit));
    const undo = req(s, 'undo'); value(s.undo(undo));
    expect(s.inspect()).toEqual({ ...original, revision: 2 });
    value(s.undo(undo)); expect(events).toHaveLength(2);
    const redo = req(s, 'redo'); value(s.redo(redo)); value(s.redo(redo));
    expect(s.inspect().revision).toBe(3); expect(s.inspect().bones[1].setup.x).toBe(5);
    value(s.undo(req(s, 'undo2'))); value(s.apply(put(s, 'branch')));
    error(s.redo(req(s, 'empty')), 'NOTHING_TO_REDO'); expect(events).toHaveLength(5);
  });
  it('checkpoints do not increment revision; restore is one undoable batch and dedups', async () => {
    const s = await session(); const initial = s.snapshot(); const events: SessionEvent[] = []; s.subscribe(e => events.push(e));
    const input = { ...req(s, 'checkpoint'), label: 'Before agent' }; const checkpoint = value(s.checkpoint(input));
    expect(s.checkpoint(input)).toEqual({ ok: true, value: checkpoint, warnings: [] });
    expect(s.inspect().revision).toBe(0); expect(s.history().undo).toHaveLength(0); expect(events).toHaveLength(1);
    value(s.apply(put(s, 'edit')));
    const restore = { ...req(s, 'restore'), checkpointId: checkpoint.id };
    value(s.restore(restore)); value(s.restore(restore));
    expect(s.snapshot()).toEqual({ ...initial, project: { ...initial.project, revision: 2 } });
    value(s.undo(req(s, 'undo-restore'))); expect(s.inspect().bones[1].setup.x).toBe(5);
    error(s.restore({ ...req(s, 'missing'), checkpointId: 'missing' }), 'CHECKPOINT_NOT_FOUND');
  });
  it('advertises and enforces 20 checkpoints, 100 undo/redo and 1000 FIFO dedup', async () => {
    const s = await session();
    for (let i = 0; i < 20; i++) value(s.checkpoint({ ...req(s, `c${i}`), label: `${i}` }));
    error(s.checkpoint({ ...req(s, 'overflow'), label: '' }), 'LIMIT_EXCEEDED');
    const oldest = put(s, 'edit0'); value(s.apply(oldest));
    for (let i = 1; i < 980; i++) value(s.apply(put(s, `edit${i}`)));
    expect(s.apply(oldest).ok).toBe(true); // retry does not refresh FIFO
    for (let i = 980; i <= 1000; i++) value(s.apply(put(s, `edit${i}`)));
    error(s.apply(oldest), 'REVISION_CONFLICT'); // evicted, not exactly-once forever
    expect(s.history().undo).toHaveLength(100);
    for (let i = 0; i < 100; i++) value(s.undo(req(s, `undo${i}`)));
    error(s.undo(req(s, 'empty')), 'NOTHING_TO_UNDO'); expect(s.history().redo).toHaveLength(100);
    for (let i = 0; i < 100; i++) value(s.redo(req(s, `redo${i}`)));
    expect(s.history().undo).toHaveLength(100);
    expect(s.capabilities().limits).toMatchObject({ checkpoints: 20, undoBatches: 100, dedupRequests: 1000 });
  });
  it('opens atomically, resets dedup/history/checkpoints but preserves saved revision and snapshots', async () => {
    const s = await session(); const oldSession = s.sessionId;
    value(s.apply(put(s, 'edit'))); value(s.checkpoint({ ...req(s, 'cp'), label: '' }));
    const snapshot = s.snapshot();
    error(s.open({ prepared: true }), 'INVALID_INPUT'); expect(s.sessionId).toBe(oldSession);
    value(s.open(await prepared(snapshot)));
    expect(s.inspect().revision).toBe(1); expect(s.sessionId).not.toBe(oldSession);
    expect(s.history()).toEqual({ undo: [], redo: [], checkpoints: [] });
    expect(s.apply(put(s, 'edit')).ok).toBe(true); // same ID now belongs to new lifetime
    expect(snapshot.project.revision).toBe(1);
    error(s.apply({ ...put(s, 'wrong'), projectId: 'elsewhere' }), 'MISSING_REFERENCE');
  });
  it('revision overflow refuses write/undo/restore without changing history; checkpoint still works', async () => {
    const p = createSyntheticProject(); p.revision = Number.MAX_SAFE_INTEGER - 1;
    const s = await session(bundle(p)); const cp = value(s.checkpoint({ ...req(s, 'c'), label: '' })); value(s.apply(put(s, 'last')));
    const before = s.snapshot(); const history = s.history();
    error(s.apply(put(s, 'overflow')), 'LIMIT_EXCEEDED'); error(s.undo(req(s, 'u')), 'LIMIT_EXCEEDED');
    error(s.restore({ ...req(s, 'r'), checkpointId: cp.id }), 'LIMIT_EXCEEDED');
    expect(s.snapshot()).toEqual(before); expect(s.history()).toEqual(history);
    expect(s.checkpoint({ ...req(s, 'last-cp'), label: '' }).ok).toBe(true);
  });
  it('defensive read/results/events and throwing/reentrant observers cannot corrupt committed data', async () => {
    const s = await session(); const seen: number[] = []; let triggered = false;
    const unsubscribe = s.subscribe(() => { throw new Error('UI failure'); });
    s.subscribe(e => { if (!triggered) { triggered = true; value(s.apply(put(s, 'nested'))); } e.changed.length = 0; });
    s.subscribe(e => { seen.push(e.revision); expect(e.changed).toHaveLength(1); });
    const result = value(s.apply(put(s, 'first'))); result.changedIds.length = 0;
    expect(seen).toEqual([1, 2]); unsubscribe();
    const p = s.inspect(); p.bones.length = 0; const h = s.history(); h.undo.length = 0;
    expect(s.history().undo).toHaveLength(2); expect(validate(s.inspect()).ok).toBe(true);
  });
});

describe('immutable asset integration', () => {
  it('atomically retains replaced bytes through undo/redo/checkpoint/restore and caller mutation', async () => {
    const original = bundle(); const token = await prepared(original); const s = value(createSession(token));
    original.assets.get('art')![0] = 99;
    const cp = value(s.checkpoint({ ...req(s, 'cp'), label: 'Original' }));
    const candidate = s.snapshot(); candidate.project.assets[0].sha256 = '1'.repeat(64); (candidate.assets as Map<string, Uint8Array>).set('art', Uint8Array.of(2));
    const mutation = { ...req(s, 'replace'), operations: [{ kind: 'putAsset', value: candidate.project.assets[0] }] };
    error(s.apply(mutation), 'MISSING_REFERENCE'); expect(s.inspect().revision).toBe(0);
    const next = await prepared(candidate); value(s.apply(mutation, next)); candidate.assets.get('art')![0] = 99;
    expect(s.snapshot().assets.get('art')![0]).toBe(2);
    value(s.undo(req(s, 'undo'))); expect(s.snapshot().assets.get('art')![0]).toBe(1);
    value(s.redo(req(s, 'redo'))); expect(s.snapshot().assets.get('art')![0]).toBe(2);
    const job = s.snapshot(); value(s.restore({ ...req(s, 'restore'), checkpointId: cp.id }));
    expect(s.snapshot().assets.get('art')![0]).toBe(1); expect(job.assets.get('art')![0]).toBe(2);
    job.assets.get('art')![0] = 100; expect(s.snapshot().assets.get('art')![0]).toBe(1);
  });
  it('keeps deleted asset bytes in history and excludes them from active snapshots', async () => {
    const s = await session(); value(s.apply({ ...req(s, 'remove-art'), operations: [
      { kind: 'remove', collection: 'assets', id: 'art' }, { kind: 'remove', collection: 'attachments', id: 'region' },
      { kind: 'putSlot', value: { id: 'body', name: 'Body', boneId: 'child', attachmentId: null } },
    ] }));
    expect(s.snapshot().assets.size).toBe(0); value(s.undo(req(s, 'undo'))); expect(s.snapshot().assets.get('art')).toEqual(Uint8Array.of(1));
  });
  it('rejects aggregate resource overflow when individually prepared imports accumulate', async () => {
    const s = await session();
    const source = createSyntheticProject();
    source.assets = Array.from({ length: 256 }, (_, i) => ({ ...source.assets[0], id: `import${i}`, path: `assets/import${i}.png` }));
    source.attachments[0].assetId = 'import0';
    const token = await prepared(bundle(source));
    const before = s.snapshot();
    error(s.apply({ ...req(s, 'too-many'), operations: source.assets.map(asset => ({ kind: 'putAsset', value: asset })) }, token), 'LIMIT_EXCEEDED');
    expect(s.snapshot()).toEqual(before); expect(s.history().undo).toHaveLength(0);
  });
  it('failed preparation and stale async preparation cannot mutate a session', async () => {
    const s = await session(); const before = s.snapshot();
    error(await prepareBundle({}, async () => ({ ok: false, error: { code: 'ASSET_HASH_MISMATCH', path: '/assets', message: 'Bad hash' } })), 'ASSET_HASH_MISMATCH');
    error(await prepareBundle({}, async () => { throw new Error('decode failed'); }), 'INVALID_INPUT');
    error(await prepareBundle({ project: before.project, assets: new Map() }, trusted), 'INVALID_INPUT');
    const edit = put(s, 'slow'); const pending = prepared(before); value(s.apply(put(s, 'user')));
    error(s.apply(edit, await pending), 'REVISION_CONFLICT'); expect(s.inspect().revision).toBe(1);
  });
});
