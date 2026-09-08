import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as S from '@esotericsoftware/spine-core';

// Independent runtime experiment, not an export of the Trial editor project.
const data = new S.SkeletonData();
const root = new S.BoneData(0, 'root', null);
const tip = new S.BoneData(1, 'tip', root);
tip.x = 128;
data.bones.push(root, tip);
const slotData = new S.SlotData(0, 'hit-area', tip);
data.slots.push(slotData);
const skeleton = new S.Skeleton(data);
const box = new S.BoundingBoxAttachment('hit-area');
box.vertices = new Float32Array([0, 24, 100, 24, 0, -26]);
box.worldVerticesLength = 6;
skeleton.slots[0].setAttachment(box);
skeleton.updateWorldTransform(S.Physics.update);
const bounds = new S.SkeletonBounds();
bounds.update(skeleton, true);
assert.equal(bounds.containsPoint(148, 0), box);
assert.equal(bounds.aabbContainsPoint(218, -16), true);
assert.equal(bounds.containsPoint(218, -16), null);
assert.equal(bounds.intersectsSegment(120, 0, 170, 0), box);
const initialPolygon = [...bounds.getPolygon(box)];

skeleton.findBone('tip').rotation = 90;
skeleton.updateWorldTransform(S.Physics.update);
const staleHit = bounds.containsPoint(148, 0) === box;
assert.equal(staleHit, true);
bounds.update(skeleton, true);
assert.equal(bounds.containsPoint(148, 0), null);
assert.equal(bounds.containsPoint(128, 20), box);
const rotatedPolygon = [...bounds.getPolygon(box)];
skeleton.slots[0].setAttachment(null);
bounds.update(skeleton, true);
assert.equal(bounds.boundingBoxes.length, 0);
assert.equal(bounds.containsPoint(128, 20), null);

const report = {
  scope: 'Independent official 4.2 runtime test; does not validate editor export.',
  initialPolygon, rotatedPolygon,
  insideHit: true, aabbFalsePositiveRejectedByPolygon: true,
  segmentHit: true, staleHitBeforeBoundsUpdate: staleHit,
  oldPointMissAfterUpdate: true, rotatedPointHitAfterUpdate: true,
  hiddenAttachmentIgnored: true,
};
fs.writeFileSync(new URL('../exercises/mesh-lab/bounds-checks.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(report);
