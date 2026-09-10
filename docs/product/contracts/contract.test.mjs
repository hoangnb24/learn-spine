import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { checkExample, examples } from './check-examples.mjs';
const valid = () => examples('region-valid.json');
test('region example is valid and packaged asset resolves to exact clone bytes', () => {
  const p = valid(); assert.deepEqual(checkExample(p), []);
  const map = examples('asset-map.json');
  for (const a of p.assets) {
    const bytes = readFileSync(new URL('../../../' + map[a.path], import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), a.sha256);
    assert.equal(bytes.readUInt32BE(16), a.pixelWidth);
    assert.equal(bytes.readUInt32BE(20), a.pixelHeight);
  }
});
test('examples reject cycles, missing assets and non-JSON NaN before serialization', () => {
  assert.ok(checkExample(examples('cycle-invalid.json')).includes('PARENT_CYCLE'));
  assert.ok(checkExample(examples('missing-asset-invalid.json')).includes('MISSING_REFERENCE'));
  const p = valid(); p.bones[0].setup.x = NaN;
  assert.deepEqual(checkExample(p), ['INVALID_INPUT']);
  p.bones[0].setup.x = Infinity;
  assert.deepEqual(checkExample(p), ['INVALID_INPUT']);
});
test('reject invalid trim, duplicate channels/times, backward bezier and unsupported features', () => {
  const mutations = [
    p => p.assets[0].trimX = 1,
    p => p.animations[0].channels.push(structuredClone(p.animations[0].channels[0])),
    p => p.animations[0].channels[0].keys[1].time = 0,
    p => p.animations[0].channels[0].keys[0].curve.x1 = .9,
    p => p.assets[0].path = '../outside.png',
    p => p.bones[1].id = 'root',
  ];
  for (const mutate of mutations) { const p = valid(); mutate(p); assert.ok(checkExample(p).length > 0); }
  const p = valid(); p.requiredCapabilities.push('mesh-v1');
  assert.deepEqual(checkExample(p), ['UNSUPPORTED_CAPABILITY']);
  p.formatVersion = 1; assert.deepEqual(checkExample(p), ['UNSUPPORTED_VERSION']);
});
test('stale request example specifies a real conflict (command implementation remains #7)', () => {
  const e = examples('stale-revision-invalid.json');
  assert.notEqual(e.currentRevision, e.request.expectedRevision);
  assert.equal(e.expectedError, 'REVISION_CONFLICT');
});
test('hand-calculated transform, trim and loop vectors', () => {
  const transform = (x,y,tx,ty,r,sx,sy) => [tx + Math.cos(r)*sx*x - Math.sin(r)*sy*y,ty + Math.sin(r)*sx*x + Math.cos(r)*sy*y];
  const close = (got,want) => got.forEach((v,i) => assert.ok(Math.abs(v-want[i]) < 1e-10));
  close(transform(3,4,10,20,Math.PI/2,2,1),[6,26]);
  close(transform(3,4,10,20,0,-1,1),[7,24]);
  // Original 100x80, trim top-left (10,20), stored 60x40, logical 200x160, pivot (100,0).
  close([10*2-100,(80-20-40)*2-0],[-80,40]);
  close([(10+60)*2-100,(80-20)*2-0],[40,120]);
  assert.equal(((2%2)+2)%2,0); assert.equal(((-.25%2)+2)%2,1.75);
  const a=170*Math.PI/180,b=-170*Math.PI/180;
  assert.equal((a+b)/2,0); // Numeric interpolation, not shortest arc.
});
