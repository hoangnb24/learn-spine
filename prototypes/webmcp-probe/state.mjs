// Deliberately isolated probe, not the product command engine.
export const schemas = {
  probe_read: { type: 'object', properties: {}, additionalProperties: false },
  probe_set: { type: 'object', properties: {
    value: { type: 'integer', minimum: -100, maximum: 100 },
    expectedRevision: { type: 'integer', minimum: 0 },
    requestId: { type: 'string', minLength: 1, maxLength: 100 },
    delayMs: { type: 'integer', minimum: 0, maximum: 5000 },
  }, required: ['value', 'expectedRevision', 'requestId'], additionalProperties: false },
  probe_undo: { type: 'object', properties: {
    expectedRevision: { type: 'integer', minimum: 0 },
    requestId: { type: 'string', minLength: 1, maxLength: 100 },
  }, required: ['expectedRevision', 'requestId'], additionalProperties: false },
};

export function createProbe(onEvent = () => {}) {
  let value = 0, revision = 0;
  const history = [], requests = new Map();
  const state = () => ({ value, revision, canUndo: history.length > 0 });
  async function call(name, input, { signal, source = 'handler-only' } = {}) {
    const start = performance.now();
    const error = (code) => ({ ok: false, error: { code }, ...state() });
    const finish = (result) => {
      onEvent({ name, input, source, signalProvided: Boolean(signal), durationMs: Math.round((performance.now() - start) * 100) / 100, result });
      return result;
    };
    const schema = schemas[name];
    if (!schema) return finish(error('UNKNOWN_TOOL'));
    if (!input || typeof input !== 'object' || Array.isArray(input) ||
        Object.keys(input).some(key => !Object.hasOwn(schema.properties, key)) ||
        (schema.required ?? []).some(key => !Object.hasOwn(input, key))) return finish(error('INVALID_INPUT'));
    for (const [key, val] of Object.entries(input)) {
      const rule = schema.properties[key];
      if (rule.type === 'integer' && (!Number.isSafeInteger(val) || val < rule.minimum || val > (rule.maximum ?? Number.MAX_SAFE_INTEGER))) return finish(error('INVALID_INPUT'));
      if (rule.type === 'string' && (typeof val !== 'string' || val.length < rule.minLength || val.length > rule.maxLength)) return finish(error('INVALID_INPUT'));
    }
    if (signal?.aborted) return finish(error('CANCELLED'));
    if (name === 'probe_read') return finish({ ok: true, ...state() });
    const fingerprint = JSON.stringify([name, Object.keys(input).sort().map(k => [k, input[k]])]);
    const cached = () => {
      const old = requests.get(input.requestId);
      return old ? old.fingerprint === fingerprint ? structuredClone(old.result) : error('REQUEST_ID_REUSED') : null;
    };
    if (cached()) return finish(cached());
    if (input.expectedRevision !== revision) return finish(error('REVISION_CONFLICT'));
    if (input.delayMs) {
      await new Promise(resolve => {
        const done = () => { clearTimeout(timer); signal?.removeEventListener('abort', done); resolve(); };
        const timer = setTimeout(done, input.delayMs);
        signal?.addEventListener('abort', done, { once: true });
      });
    }
    if (signal?.aborted) return finish(error('CANCELLED'));
    // Another caller can commit while this call awaits; recheck at commit time.
    if (cached()) return finish(cached());
    if (input.expectedRevision !== revision) return finish(error('REVISION_CONFLICT'));
    if (name === 'probe_undo') {
      if (!history.length) return finish(error('NOTHING_TO_UNDO'));
      value = history.pop();
    } else {
      history.push(value);
      if (history.length > 100) history.shift();
      value = input.value;
    }
    revision += 1;
    const result = { ok: true, ...state() };
    requests.set(input.requestId, { fingerprint, result: structuredClone(result) });
    if (requests.size > 1000) requests.delete(requests.keys().next().value);
    return finish(result);
  }
  return { state, call };
}
