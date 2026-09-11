import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { imageMetadata } from './image-metadata.mjs';
const root = new URL('../../../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const manifest = read('manifest.json'), layout = read('robot-layout.json'), briefs = read('cases.json');
const ids = new Set(), paths = new Set();
for (const item of manifest.records) {
  assert.ok(!ids.has(item.id), `duplicate ID: ${item.id}`); ids.add(item.id);
  assert.ok(!paths.has(item.path), `duplicate path: ${item.path}`); paths.add(item.path);
  assert.ok(!item.path.startsWith('/') && !item.path.split('/').includes('..'));
  const bytes = readFileSync(new URL(item.path, root));
  assert.equal(bytes.length, item.byteLength, item.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, item.path);
  const actual = imageMetadata(bytes);
  assert.equal(actual.pixelWidth, item.pixelWidth, item.path);
  assert.equal(actual.pixelHeight, item.pixelHeight, item.path);
  assert.equal(actual.mimeType, item.mimeType, item.path);
  if (item.role === 'rig-input') {
    assert.equal(actual.mimeType, 'image/png');
    assert.ok([4, 6].includes(bytes[25]), `Expected alpha channel: ${item.path}`);
  }
  assert.ok(readFileSync(new URL(item.provenance, root)).length);
  assert.equal(item.rights.redistributionCleared, false);
}
const joints = new Map(layout.joints.map(j => [j.name,j]));
assert.equal(joints.size, layout.joints.length);
for (const joint of layout.joints) {
  const seen = new Set(); let j = joint;
  while (j) { assert.ok(!seen.has(j.name)); seen.add(j.name); assert.ok(j.parent === null || joints.has(j.parent)); j = joints.get(j.parent); }
  assert.ok([...joint.localXY,joint.rotationRadians].every(Number.isFinite));
}
for (const p of layout.placements) { assert.ok(joints.has(p.joint)); assert.ok(ids.has(p.art)); assert.ok(p.logicalScale > 0); }
assert.equal(new Set(layout.drawOrder).size, layout.placements.length);
for (const id of layout.drawOrder) assert.ok(layout.placements.some(p => p.joint === id));
for (const c of briefs.cases) {
  for (const id of [...c.assets,...c.references]) assert.ok(ids.has(id), id);
  for (const lesson of c.lessons) assert.ok(readFileSync(new URL(lesson,root)).length);
  assert.ok(c.observationRegions.length && c.acceptance && c.brief);
}
console.log(`PASS: ${ids.size} files verified (hash, bytes, dimensions, provenance); ${layout.placements.length} placements; ${briefs.cases.length} briefs.`);
