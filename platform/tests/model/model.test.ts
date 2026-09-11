import { describe, expect, it } from 'vitest';
import { migrate, parse, serialize, validate, type Project, type EditorState } from '../../src/model';
import { createSyntheticProject, t03Vectors } from '../../fixtures/model/synthetic';
import contractFixture from '../../../docs/product/contracts/examples/region-valid.json';

function rejected(change: (p: Project) => void, code = 'INVALID_INPUT', path?: string) {
  const p = createSyntheticProject(); change(p);
  const before = structuredClone(p);
  const result = validate(p);
  expect(result.ok).toBe(false);
  if (!result.ok) { expect(result.error.code).toBe(code); if (path !== undefined) expect(result.error.path).toBe(path); }
  expect(p).toEqual(before);
}
describe('v0 model', () => {
  it('accepts normative and synthetic fixtures; clone isolates nested data both ways', () => {
    expect(validate(contractFixture).ok).toBe(true);
    const p = createSyntheticProject(); const result = validate(p);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings).toEqual([]);
      result.value.bones[0].setup.x = 99; expect(p.bones[0].setup.x).toBe(3);
      p.animations[0].channels[0].keys[0].value = 100;
      expect(result.value.animations[0].channels[0].keys[0].value).toBe(4);
    }
  });
  it('round-trips without UI state; identity migration clones and preserves revision', () => {
    const p = createSyntheticProject(); p.revision = 42;
    const editor: EditorState = { selection: null, camera: { centerX: 1, centerY: 2, zoom: 3 }, timeline: { animationId: null, time: 1, playing: false } };
    const session = { project: p, editor };
    const result = serialize(session.project);
    expect(result.ok).toBe(true);
    if (result.ok) { expect(parse(result.value)).toEqual(validate(p)); expect(result.value).not.toContain('camera'); }
    expect(validate(session).ok).toBe(false);
    expect(validate({ ...p, editorState: editor }).ok).toBe(false);
    const migrated = migrate(p, 0); expect(migrated).toEqual(validate(p));
    if (migrated.ok) expect(migrated.value).not.toBe(p);
    expect(migrate({ ...p, formatVersion: 1 }, 0)).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_VERSION' } });
    expect(migrate(p, 1)).toMatchObject({ ok: true, value: {formatVersion: 1} });
  });
  it('preserves T03 transform/trim vectors without prematurely implementing evaluator', () => {
    const result = validate(createSyntheticProject()); if (!result.ok) throw Error(result.error.message);
    const [child, root] = result.value.bones;
    expect(root.setup.rotation).toBe(Math.PI / 2); expect(child.setup.x).toBe(3);
    // Independent arithmetic from T03, no runtime evaluator under test yet.
    expect([root.setup.x - child.setup.y, root.setup.y + 2 * child.setup.x]).toEqual(t03Vectors.rotatedChildWorldOrigin);
    expect([10 - child.setup.x, 20 + child.setup.y]).toEqual(t03Vectors.mirroredChildWorldOrigin);
    const a = result.value.assets[0], r = result.value.attachments[0];
    if (r.type !== 'region') throw Error('Expected region fixture');
    expect([a.trimX * r.width / a.originalWidth - r.pivotX, (a.originalHeight - a.trimY - a.pixelHeight) * r.height / a.originalHeight - r.pivotY]).toEqual(t03Vectors.trimmedBottomLeft);
  });
  it('accepts multiple roots, reused regions, null slots, negative/zero scale, overshoot and outside pivots', () => {
    const p = createSyntheticProject(); p.bones[0].parentId = null; p.bones[0].setup.scaleX = 0; p.bones[1].setup.scaleY = -1;
    p.slots.push({ ...p.slots[0], id: 'second' }, { ...p.slots[0], id: 'hidden', attachmentId: null });
    p.attachments[0].pivotX = -10000;
    p.animations[0].channels[0].keys[1].curve = { type: 'bezier', x1: 0, x2: 1, y1: -3, y2: 4 };
    expect(validate(p).ok).toBe(true);
  });
  it.each([NaN, Infinity, -Infinity])('rejects non-finite memory numbers %s before stringify', n => {
    rejected(p => { p.bones[0].setup.x = n; }, 'INVALID_INPUT', '/bones/0/setup/x');
    const p = createSyntheticProject(); p.attachments[0].pivotY = n; expect(serialize(p).ok).toBe(false);
  });
  it('rejects duplicates, invalid IDs, empty bones, unsafe revision and unknown nested fields', () => {
    for (const collection of ['assets', 'bones', 'slots', 'attachments', 'animations'] as const)
      rejected(p => { (p[collection] as unknown[]).push(structuredClone(p[collection][0])); }, 'INVALID_INPUT', `/${collection}/1/id` === '/bones/1/id' ? '/bones/2/id' : `/${collection}/1/id`);
    rejected(p => { p.bones[0].id = 'bad/id'; });
    rejected(p => { p.bones[0].id = 'child\n'; });
    rejected(p => { p.assets[0].path += '\n'; });
    rejected(p => { p.assets[0].sha256 += '\n'; });
    rejected(p => { p.bones = []; });
    rejected(p => { p.revision = Number.MAX_SAFE_INTEGER + 1; });
    rejected(p => { Object.assign(p.metadata, { html: 'unknown' }); }, 'INVALID_INPUT', '/metadata/html');
  });
  it('reports every reference kind and self/multi bone cycles', () => {
    rejected(p => { p.bones[0].parentId = 'missing'; }, 'MISSING_REFERENCE', '/bones/0/parentId');
    rejected(p => { p.bones[0].parentId = 'child'; }, 'PARENT_CYCLE');
    rejected(p => { p.bones[1].parentId = 'child'; }, 'PARENT_CYCLE');
    rejected(p => { p.slots[0].boneId = 'missing'; }, 'MISSING_REFERENCE', '/slots/0/boneId');
    rejected(p => { p.slots[0].attachmentId = 'missing'; }, 'MISSING_REFERENCE', '/slots/0/attachmentId');
    rejected(p => { p.attachments[0].assetId = 'missing'; }, 'MISSING_REFERENCE', '/attachments/0/assetId');
    rejected(p => { p.animations[0].channels[0].boneId = 'missing'; }, 'MISSING_REFERENCE', '/animations/0/channels/0/boneId');
  });
  it('checks assets and key semantics', () => {
    rejected(p => { p.assets.push({ ...p.assets[0], id: 'other' }); }, 'INVALID_INPUT', '/assets/1/path');
    rejected(p => { p.assets[0].path = '../evil.png'; });
    rejected(p => { p.assets[0].trimX = 41; }, 'INVALID_INPUT', '/assets/0/trimX');
    rejected(p => { p.assets[0].trimY = 41; });
    rejected(p => { p.assets[0].pixelWidth = 1.5; });
    rejected(p => { p.animations[0].duration = 0; });
    rejected(p => { p.animations[0].channels.push(structuredClone(p.animations[0].channels[0])); });
    rejected(p => { p.animations[0].channels[0].keys = []; });
    for (const time of [-1, 0, 3]) rejected(p => { p.animations[0].channels[0].keys[1].time = time; });
    rejected(p => { p.animations[0].channels[0].keys[1].curve = { type: 'bezier', x1: .8, x2: .2, y1: 0, y2: 1 }; });
  });
  it('prioritizes version and capability and refuses future extensions', () => {
    expect(validate({ formatVersion: 2, requiredCapabilities: ['mesh-v1'] })).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_VERSION' } });
    expect(validate({ formatVersion: 0, requiredCapabilities: ['mesh-v1'] })).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_CAPABILITY' } });
    expect(validate({ ...createSyntheticProject(), constraints: [] })).toMatchObject({ ok: false, error: { code: 'UNSUPPORTED_CAPABILITY' } });
    rejected(p => { Object.assign(p.attachments[0], { type: 'mesh' }); }, 'UNSUPPORTED_CAPABILITY');
  });
  it('rejects invalid JSON memory without executing getters', () => {
    const p = createSyntheticProject(); let called = false;
    Object.defineProperty(p.metadata, 'name', { get() { called = true; return 'x'; }, enumerable: true });
    expect(validate(p).ok).toBe(false); expect(called).toBe(false);
    expect(validate({ ...createSyntheticProject(), extra: undefined }).ok).toBe(false);
    const cyclic: Record<string, unknown> = {}; cyclic.self = cyclic;
    expect(validate(cyclic).ok).toBe(false);
    const deep: Record<string, unknown> = {}; let cursor = deep;
    for (let i = 0; i < 10000; i++) { const child = {}; cursor.child = child; cursor = child; }
    expect(validate(deep)).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT', message: expect.stringContaining('nesting') } });
  });
});

describe('strict JSON loading', () => {
  it.each(['{"a":1,"a":2}', '{"a":1,"\\u0061":2}', '{"nested":{"x":0,"x":1}}', '[{"a/b":0,"a/b":1}]'])('rejects duplicate keys before parsing loses them: %s', text => {
    const result = parse(text); expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_INPUT', message: expect.stringContaining('Duplicate') } });
  });
  it.each(['', '{', '[1,]', '{"x":1,}', '01', '+1', 'true false', '"\n"'])('rejects malformed JSON: %s', text => expect(parse(text).ok).toBe(false));
  it('rejects overflowing JSON number and handles escaped names/keys safely', () => {
    const p = createSyntheticProject(); p.metadata.name = 'quote " slash \\ newline\n';
    expect(parse(JSON.stringify(p))).toEqual(validate(p));
    expect(parse(JSON.stringify(p).replace('"revision":0', '"revision":1e400')).ok).toBe(false);
    expect(parse('{"__proto__":1,"__proto__":2}')).toMatchObject({ ok: false, error: { path: '/__proto__' } });
  });
});
