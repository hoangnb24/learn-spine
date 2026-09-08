// Compare one-sided world velocities across contacts using the real runtime.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as spine from '@esotericsoftware/spine-core';
import { applyLoopPose, rootTravel } from '../exercises/robot/loop-motion.mjs';

const base = new URL('../exercises/robot/', import.meta.url);
const raw = JSON.parse(fs.readFileSync(new URL('robot-ik.json', base)));
const before = structuredClone(raw);
before.animations.walk_side = JSON.parse(fs.readFileSync(new URL('evidence/walk-linear-before.json', base)));
const atlas = new spine.TextureAtlas(fs.readFileSync(new URL('robot.atlas', base), 'utf8'));
function measure(json, h) {
  const data = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(atlas)).readSkeletonData(json);
  const clip = data.findAnimation('walk_side'), travel = rootTravel(spine, data, clip);
  function pose(t) {
    const skeleton = new spine.Skeleton(data);
    applyLoopPose(spine, skeleton, clip, t, travel);
    return skeleton.bones;
  }
  return [1, 1.4, 1.5].map(time => {
    const left = pose(time-h), middle = pose(time), right = pose(time+h);
    const jumps = middle.map((bone, i) => ({
      bone: bone.data.name,
      velocityJump: Math.hypot(
        (right[i].worldX - 2*bone.worldX + left[i].worldX)/h,
        (right[i].worldY - 2*bone.worldY + left[i].worldY)/h)
    }));
    return { time, maxBone: jumps.reduce((a,b) => a.velocityJump > b.velocityJump ? a : b),
      feet: jumps.filter(b => ['foot-left','foot-right'].includes(b.bone)) };
  });
}
const comparisons = [1e-4, 1e-5].map(step => ({ step,
  before: measure(before, step), after: measure(raw, step) }));
function positionalChange() {
  const rigs = [before, raw].map(json => {
    const data = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(atlas)).readSkeletonData(json);
    const clip = data.findAnimation('walk_side');
    return { skeleton: new spine.Skeleton(data), clip, travel: rootTravel(spine, data, clip) };
  });
  let maxAtAuthoredKeys = 0, maxBetweenKeys = 0;
  for (let i = 0; i <= 1200; i++) {
    for (const rig of rigs) applyLoopPose(spine, rig.skeleton, rig.clip, i/1200, rig.travel);
    for (let b = 0; b < rigs[0].skeleton.bones.length; b++) {
      const a = rigs[0].skeleton.bones[b], z = rigs[1].skeleton.bones[b];
      const difference = Math.hypot(a.worldX-z.worldX, a.worldY-z.worldY);
      if (i % 20 === 0) maxAtAuthoredKeys = Math.max(maxAtAuthoredKeys, difference);
      else maxBetweenKeys = Math.max(maxBetweenKeys, difference);
    }
  }
  assert.ok(maxAtAuthoredKeys < .001, 'Keep existing authored poses');
  return { samples: 1201, maxAtAuthoredKeys, maxBetweenKeys };
}
for (const comparison of comparisons) {
  comparison.after.forEach((result, i) => {
    assert.ok(result.maxBone.velocityJump < comparison.before[i].maxBone.velocityJump * .25,
      `Contact ${result.time}: maximum velocity jump must fall by at least 75%`);
    result.feet.forEach((foot, j) => {
      const old = comparison.before[i].feet[j].velocityJump;
      if (old > 1) assert.ok(foot.velocityJump < old*.25, `Foot contact: ${foot.bone}`);
    });
  });
}
const report = { runtime: '@esotericsoftware/spine-core 4.2.120',
  units: 'world units per second', comparisons,
  positionDifferenceWorldUnits: positionalChange(),
  limitations: [
    'Finite differences at loop seam and foot contacts only, not an all-frame smoothness proof.',
    'Runtime samples Bezier curves; remaining velocity jumps are measured, not assumed zero.',
    'Generated data only; does not verify editor animation, export or artistic quality.'
  ] };
fs.writeFileSync(new URL('walk-velocity-checks.json', base), JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
