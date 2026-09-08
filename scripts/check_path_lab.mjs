import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as S from '@esotericsoftware/spine-core';

// A controlled cubic curve created in code, not exported from the editor.
const data = new S.SkeletonData();
const root = new S.BoneData(0, 'root', null);
const follower = new S.BoneData(1, 'follower', root);
follower.x = -80; follower.y = -60; follower.length = 40;
data.bones.push(root, follower);
const slot = new S.SlotData(0, 'route', root);
slot.attachmentName = 'route'; data.slots.push(slot);
const path = new S.PathAttachment('route');
path.closed = false; path.constantSpeed = true;
path.vertices = new Float32Array([-50,-100, 0,0, 50,100, 150,100, 200,0, 250,-100]);
path.worldVerticesLength = 12;
const skin = new S.Skin('default');
skin.setAttachment(0, 'route', path);
data.defaultSkin = skin; data.skins.push(skin);
const pc = new S.PathConstraintData('follow-route');
pc.bones.push(follower); pc.target = slot;
pc.positionMode = S.PositionMode.Percent;
pc.rotateMode = S.RotateMode.Tangent;
pc.mixRotate = pc.mixX = pc.mixY = 1;
data.pathConstraints.push(pc);
const s = new S.Skeleton(data);
const constraint = s.pathConstraints[0];
function pose(position, rotateMix = 1) {
  s.setToSetupPose();
  constraint.position = position; constraint.mixRotate = rotateMix;
  s.updateWorldTransform(S.Physics.update);
  const b = s.findBone('follower');
  return { x:b.worldX, y:b.worldY, angle:Math.atan2(b.c,b.a)*180/Math.PI };
}
const start = pose(0), middle = pose(.5), end = pose(1);
const near=(a,b,t=.02)=>assert.ok(Math.abs(a-b)<t, `${a} versus ${b}`);
near(start.x,0); near(start.y,0); near(end.x,200); near(end.y,0);
near(middle.x,100,.5); near(middle.y,75,.1);
assert.ok(start.angle>60 && end.angle < -60);
const rotationOff = pose(1,0);
near(rotationOff.x,end.x); near(rotationOff.y,end.y); near(rotationOff.angle,0);
const frames = Array.from({length:61}, (_,frame)=>pose(frame<=30 ? frame/30 : (60-frame)/30));
near(frames[0].x,frames[60].x); near(frames[0].y,frames[60].y);
near(frames[0].angle,frames[60].angle);
// Constant speed on a symmetric cubic: equal position increments should have
// nearly equal chord lengths. This is an approximation, not an exact arc test.
const distances = frames.slice(1,31).map((p,i)=>Math.hypot(p.x-frames[i].x,p.y-frames[i].y));
const chordRatio = Math.max(...distances)/Math.min(...distances);
assert.ok(chordRatio<1.15);
const report = {scope:'Independent runtime 4.2; editor animation/export not verified.',
  start,middle,end,rotationOff,loopFrames:61,loopPoseMatches:true,
  maxToMinChordRatio:chordRatio,
  limitation:'Return leg moves backward while tangent orientation stays forward; no turn animation.'};
fs.writeFileSync(new URL('../exercises/mesh-lab/path-checks.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(report);
