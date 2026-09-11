import type { Json, Result } from './types';

/** Small strict JSON reader; duplicate decoded keys are rejected before data loss. */
export function readJson(text: string): Result<Json> {
  let offset = 0;
  let errorPath = '';
  const invalid = (path: string, message: string): never => { errorPath = path; throw new SyntaxError(message); };
  const whitespace = () => { while (/[\t\n\r ]/.test(text[offset] ?? '\0')) offset++; };
  const string = (path: string): string => {
    const start = offset++;
    while (offset < text.length) {
      const c = text[offset++];
      if (c === '"') {
        try { return JSON.parse(text.slice(start, offset)) as string; }
        catch { return invalid(path, 'Invalid JSON string'); }
      }
      if (c === '\\') offset++;
    }
    return invalid(path, 'Unterminated JSON string');
  };
  const value = (path: string, depth: number): Json => {
    if (depth > 128) return invalid(path, 'JSON nesting exceeds 128 levels');
    whitespace();
    const c = text[offset];
    if (c === '"') return string(path);
    if (c === '{') {
      offset++; whitespace();
      const object: { [key: string]: Json } = Object.create(null);
      if (text[offset] === '}') { offset++; return object; }
      while (true) {
        whitespace();
        if (text[offset] !== '"') return invalid(path, 'Expected object key');
        const key = string(path);
        const location = `${path}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;
        if (Object.hasOwn(object, key)) return invalid(location, 'Duplicate JSON object key');
        whitespace();
        if (text[offset++] !== ':') return invalid(location, 'Expected colon');
        object[key] = value(location, depth + 1);
        whitespace();
        const separator = text[offset++];
        if (separator === '}') return object;
        if (separator !== ',') return invalid(path, 'Expected comma or closing brace');
      }
    }
    if (c === '[') {
      offset++; whitespace();
      const array: Json[] = [];
      if (text[offset] === ']') { offset++; return array; }
      while (true) {
        array.push(value(`${path}/${array.length}`, depth + 1));
        whitespace();
        const separator = text[offset++];
        if (separator === ']') return array;
        if (separator !== ',') return invalid(path, 'Expected comma or closing bracket');
      }
    }
    for (const [token, result] of [['true', true], ['false', false], ['null', null]] as const)
      if (text.startsWith(token, offset)) { offset += token.length; return result; }
    const number = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(text.slice(offset));
    if (number) { offset += number[0].length; return Number(number[0]); }
    return invalid(path, 'Expected JSON value');
  };
  try {
    if (typeof text !== 'string') return { ok: false, error: { code: 'INVALID_INPUT', path: '', message: 'Expected JSON text' } };
    const result = value('', 0);
    whitespace();
    if (offset !== text.length) invalid('', 'Unexpected trailing content');
    return { ok: true, value: result, warnings: [] };
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    return { ok: false, error: { code: 'INVALID_INPUT', path: errorPath, message: `${error.message} at character ${offset}` } };
  }
}
