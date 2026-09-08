// Exercise the same loop placement used by the browser with the real IK rig.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as spine from '@esotericsoftware/spine-core';
import { applyLoopPose, rootTravel } from '../exercises/robot/loop-motion.mjs';

const base = new URL('../exercises/robot/', import.meta.url);
const atlas = new spine.TextureAtlas(fs.readFileSync(new URL('robot.atlas', base), 'utf8'));
const data = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(atlas)).readSkeletonData(
  JSON.parse(fs.readFileSync(new URL('robot-ik.json', base), 'utf8')));
const walk = data.findAnimation('walk_side'), travel = rootTravel(spine, data, walk);
assert.equal(walk.duration, 1);
assert.deepEqual(travel, { x: 70, y: 0 });

function pose(elapsed, displacement = travel) {
  const s = new spine.Skeleton(data);
  applyLoopPose(spine, s, walk, elapsed, displacement);
  return s;
}
function gap(a, b) {
  let result = 0;
  for (let i = 0; i < a.bones.length; i++) {
    for (const field of ['worldX', 'worldY', 'a', 'b', 'c', 'd']) {
      result = Math.max(result, Math.abs(a.bones[i][field] - b.bones[i][field]));
    }
  }
  return result;
}

// Negative control: wrapping clip time alone has a 70-unit world-space jump.
const oldBefore = pose(1 - 1e-6, { x: 0, y: 0 }), oldAfter = pose(1, { x: 0, y: 0 });
const oldRootJump = oldBefore.getRootBone().worldX - oldAfter.getRootBone().worldX;
assert.ok(oldRootJump > 69.99);

let maxExactSeamGap = 0, maxNearSeamGap = 0, maxPlantDrift = 0;
for (let cycle = 0; cycle < 4; cycle++) {
  const last = new spine.Skeleton(data);
  walk.apply(last, 0, walk.duration, false, [], 1, spine.MixBlend.replace, spine.MixDirection.mixIn);
  last.x = cycle * travel.x;
  last.updateWorldTransform(spine.Physics.update);
  maxExactSeamGap = Math.max(maxExactSeamGap, gap(last, pose(cycle + 1)));
  maxNearSeamGap = Math.max(maxNearSeamGap, gap(pose(cycle + 1 - 1e-6), pose(cycle + 1 + 1e-6)));
  for (const [side, start, end] of [['left', 0, 0.5], ['right', 0.4, 1]]) {
    const reference = pose(cycle + start).findBone(`foot-${side}`);
    for (let i = 0; i <= 120; i++) {
      const foot = pose(cycle + start + (end - start) * i / 120).findBone(`foot-${side}`);
      maxPlantDrift = Math.max(maxPlantDrift, Math.hypot(foot.worldX - reference.worldX, foot.worldY - reference.worldY));
    }
  }
}
assert.ok(maxExactSeamGap < 0.001, `Exact loop seam: ${maxExactSeamGap}`);
assert.ok(maxNearSeamGap < 0.01, `Near loop seam: ${maxNearSeamGap}`);
assert.ok(maxPlantDrift < 0.001, `Planted foot drift: ${maxPlantDrift}`);
assert.ok(Math.abs(pose(3.25).getRootBone().worldX - 227.5) < 0.001);

// Seeking and changing animation reuse one skeleton in the viewer.
const reused = pose(4.6);
applyLoopPose(spine, reused, walk, 0, travel);
assert.ok(gap(reused, pose(0)) < 0.001, 'Restart must clear accumulated placement');
applyLoopPose(spine, reused, walk, 3.25, travel);
applyLoopPose(spine, reused, data.findAnimation('idle'), 0.25);
const idle = new spine.Skeleton(data);
applyLoopPose(spine, idle, data.findAnimation('idle'), 0.25);
assert.ok(gap(reused, idle) < 0.001, 'Switching to idle must clear walk placement');
applyLoopPose(spine, reused, null, 0);
assert.equal(reused.x, 0);
assert.equal(reused.y, 0);

const report = {
  runtime: '@esotericsoftware/spine-core 4.2.120',
  clip: 'walk_side', duration: walk.duration, cycleDisplacement: travel,
  oldRootJump, maxExactSeamGap, maxNearSeamGap, maxPlantDrift,
  contactSamples: 4 * 2 * 121,
  rootXAt3_25Seconds: pose(3.25).getRootBone().worldX,
  restartAndAnimationSwitch: 'passed',
  limitations: [
    'Translation-only placement; does not handle rotational root motion or animation blending.',
    'Verifies generated runtime data, not the handbuilt editor rig or editor export.',
    'Does not prove matching velocity at every joint or final animation quality.'
  ]
};
fs.writeFileSync(new URL('loop-motion-checks.json', base), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
