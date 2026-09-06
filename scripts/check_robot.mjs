// Behavioral measurements with the official Spine runtime, not a JSON-only check.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as spine from '@esotericsoftware/spine-core';
const base = new URL('../exercises/robot/', import.meta.url);
function load(name){
 const atlas=new spine.TextureAtlas(fs.readFileSync(new URL('robot.atlas',base),'utf8'));
 return new spine.SkeletonJson(new spine.AtlasAttachmentLoader(atlas)).readSkeletonData(
  JSON.parse(fs.readFileSync(new URL(name,base),'utf8')));
}
const fkData=load('robot.json'),ikData=load('robot-ik.json');
function pose(data,name,time){
 const s=new spine.Skeleton(data);
 if(name)data.findAnimation(name).apply(s,0,time,false,[],1,spine.MixBlend.replace,spine.MixDirection.mixIn);
 s.updateWorldTransform(spine.Physics.update);return s;
}
const results={runtime:'@esotericsoftware/spine-core 4.2.120',checks:[]};
function record(name,values){results.checks.push({name,...values});}
for(const [name,data] of [['FK',fkData],['IK',ikData]]){
 const s=pose(data,null,0),before=s.findBone('foot-left').worldY;
 s.findBone('body').y-=35;s.updateWorldTransform(spine.Physics.update);
 const movement=s.findBone('foot-left').worldY-before;
 assert.ok(Math.abs(movement-(name==='FK'?-35:0))<1e-6);
 record(`${name}: hạ thân 35`,{footVerticalMovement:movement});
}
for(const name of ['idle','squat','step','walk_side']){
 const anim=ikData.findAnimation(name);let maxError=0,maxPlantDrift=0;
 const start=pose(ikData,name,0);
 for(let i=0;i<=120;i++){
  const t=i/120*anim.duration,s=pose(ikData,name,t);
  for(const side of ['left','right']){
   const shin=s.findBone(`shin-${side}`),target=s.findBone(`foot-target-${side}`);
   maxError=Math.max(maxError,Math.hypot(shin.worldX+shin.a*107-target.worldX,shin.worldY+shin.c*107-target.worldY));
   const planted=name==='walk_side'?(side==='left'?t<=.5:t>=.4):(name!=='step'||(side==='left'?t>=.5:t<=.5));
   if(planted){const foot=s.findBone(`foot-${side}`),initial=(name==='walk_side'&&side==='right'?pose(ikData,name,.4):start).findBone(`foot-${side}`);
    maxPlantDrift=Math.max(maxPlantDrift,Math.hypot(foot.worldX-initial.worldX,foot.worldY-initial.worldY));}
  }
 }
 assert.ok(maxError<.001,`${name} IK endpoint error ${maxError}`);
 assert.ok(maxPlantDrift<.001,`${name} planted foot drift ${maxPlantDrift}`);
 record(`${name}: 121 tư thế`,{maxIKEndpointError:maxError,maxPlantedFootDrift:maxPlantDrift});
}
for(const anim of ikData.animations){
 const first=pose(ikData,anim.name,0),last=pose(ikData,anim.name,anim.duration);
 let gap=0;
 for(let i=0;i<first.bones.length;i++)for(const field of ['worldX','worldY','a','b','c','d'])
  gap=Math.max(gap,Math.abs(first.bones[i][field]-last.bones[i][field]+(anim.name==='walk_side'&&field==='worldX'?70:0)));
 assert.ok(gap<.001,`${anim.name} loop pose mismatch ${gap}`);
 record(`${anim.name}: đầu/cuối vòng`,{maxTransformDifference:gap,rootTravel:anim.name==='walk_side'?70:0});
}
results.limitations=['Không kiểm tra editor hoặc xuất từ Trial.',
 'Đầu/cuối bằng nhau không chứng minh vận tốc nối vòng hoặc chất lượng thẩm mỹ.',
 'step là bài nhấc chân tại chỗ, chưa phải dáng đi hoàn chỉnh.'];
fs.writeFileSync(new URL('runtime-checks.json',base),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
