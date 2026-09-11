import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createProbe, schemas } from './state.mjs';
test('published input contract matches registered handlers', () => {
  const contract = JSON.parse(readFileSync(new URL('./tool-contract.json', import.meta.url)));
  assert.deepEqual(contract.inputs, schemas);
});
test('read, set, undo and retry share one revisioned state', async () => {
  const p = createProbe();
  assert.deepEqual(await p.call('probe_read', {}), { ok: true, value: 0, revision: 0, canUndo: false });
  const input = { value: 7, expectedRevision: 0, requestId: 'a' };
  const first = await p.call('probe_set', input);
  assert.equal(first.value, 7);
  assert.deepEqual(await p.call('probe_set', input), first);
  assert.equal((await p.call('probe_set', { ...input, value: 8 })).error.code, 'REQUEST_ID_REUSED');
  assert.equal((await p.call('probe_set', { ...input, requestId: 'b' })).error.code, 'REVISION_CONFLICT');
  assert.equal((await p.call('probe_undo', { expectedRevision: 1, requestId: 'c' })).value, 0);
  assert.equal(p.state().revision, 2);
});
test('invalid payloads never mutate state', async () => {
  const p = createProbe();
  for (const input of [null, [], {}, { value: NaN, expectedRevision: 0, requestId: 'x' }, { value: 101, expectedRevision: 0, requestId: 'x' }, { value: 1, expectedRevision: 0, requestId: 'x', extra: 1 }]) {
    assert.equal((await p.call('probe_set', input)).error.code, 'INVALID_INPUT');
    assert.equal(p.state().revision, 0);
  }
});
test('cancel prevents commit; intervening edit wins over delayed edit', async () => {
  const p = createProbe(), controller = new AbortController();
  const pending = p.call('probe_set', { value: 99, expectedRevision: 0, requestId: 'slow', delayMs: 100 }, { signal: controller.signal });
  controller.abort();
  assert.equal((await pending).error.code, 'CANCELLED');
  const race = p.call('probe_set', { value: 99, expectedRevision: 0, requestId: 'race', delayMs: 10 });
  await p.call('probe_set', { value: 7, expectedRevision: 0, requestId: 'fast' });
  assert.equal((await race).error.code, 'REVISION_CONFLICT');
  assert.equal(p.state().value, 7);
});
test('concurrent identical retries commit once; a new instance resets session', async () => {
  const p = createProbe(), input = { value: 3, expectedRevision: 0, requestId: 'same', delayMs: 10 };
  const [a, b] = await Promise.all([p.call('probe_set', input), p.call('probe_set', input)]);
  assert.deepEqual(a, b);
  assert.equal(p.state().revision, 1);
  assert.equal(createProbe().state().revision, 0);
});
