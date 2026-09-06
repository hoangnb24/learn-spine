import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as S from '@esotericsoftware/spine-core';
const base=new URL('../exercises/robot/',import.meta.url);
const atlas=new S.TextureAtlas(fs.readFileSync(new URL('robot.atlas',base),'utf8'));
const data=new S.SkeletonJson(new S.AtlasAttachmentLoader(atlas)).readSkeletonData(JSON.parse(fs.readFileSync(new URL('robot-ik.json',base))));
const pose=(time,layered=false)=>{
 const skeleton=new S.Skeleton(data),state=new S.AnimationState(new S.AnimationStateData(data));
 state.setAnimation(0,'walk_side',true);if(layered)state.setAnimation(1,'wave',true);
 state.update(time);state.apply(skeleton);skeleton.updateWorldTransform(S.Physics.update);return skeleton;
};
const walk=pose(.7),layered=pose(.7,true);
const hipsEqual=Math.abs(walk.findBone('body').worldY-layered.findBone('body').worldY)<.001;
const feetEqual=['left','right'].every(side=>Math.abs(walk.findBone('foot-'+side).worldX-layered.findBone('foot-'+side).worldX)<.001);
const armDifference=Math.abs(walk.findBone('forearm-right').rotation-layered.findBone('forearm-right').rotation);
assert.ok(hipsEqual&&feetEqual&&armDifference>50,'upper track should only replace its keyed body parts');
const before=layered.slots.map(slot=>slot.getAttachment().path);
const beforePose=layered.bones.map(b=>[b.worldX,b.worldY]);
layered.setSkinByName('mint');layered.setSlotsToSetupPose();layered.updateWorldTransform(S.Physics.update);
assert.ok(layered.slots.every(slot=>slot.getAttachment().path.startsWith('mint/')));
assert.deepEqual(layered.bones.map(b=>[b.worldX,b.worldY]),beforePose);
const s=new S.Skeleton(data),state=new S.AnimationState(new S.AnimationStateData(data));
const events=[];let now=0;
state.addListener({event:(_entry,event)=>events.push({receivedAt:now,name:event.data.name,side:event.stringValue})});
state.setAnimation(0,'walk_side',true);state.apply(s);
for(let frame=1;frame<=121;frame++){now=frame/60;state.update(1/60);state.apply(s)}
assert.deepEqual(events.map(e=>e.side),['right','left','right','left']);
const expected=[.4,1,1.4,2];
events.forEach((e,i)=>assert.ok(Math.abs(e.receivedAt-expected[i])<=1/60+1e-6));

// Clearing a track leaves its current pose; mixing to empty returns unkeyed parts.
function clearExperiment(empty){
 const sk=new S.Skeleton(data),st=new S.AnimationState(new S.AnimationStateData(data));
 st.setAnimation(0,'wave',true);st.update(.7);st.apply(sk);
 const before=sk.findBone('forearm-right').rotation;
 if(empty)st.setEmptyAnimation(0,.2);else st.clearTrack(0);
 for(let i=0;i<20;i++){st.update(1/60);st.apply(sk)}
 return {before,after:sk.findBone('forearm-right').rotation};
}
const cleared=clearExperiment(false),mixedOut=clearExperiment(true);
assert.equal(cleared.before,cleared.after);
assert.ok(Math.abs(mixedOut.after)<.001);
const report={layering:{hipsEqual,feetEqual,armDifference},skinChangedAttachments:before.length,
 skinPreservedPose:true,events,clearTrack:cleared,mixToEmpty:mixedOut,
 scope:'Runtime tests only; no editor skin or audio operation claimed.'};
fs.writeFileSync(new URL('state-checks.json',base),JSON.stringify(report,null,2)+'\n');console.log(report);
