// Render original learning data with the official runtime; no editor automation.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import * as spine from '@esotericsoftware/spine-canvas';
const base=fileURLToPath(new URL('../exercises/robot/',import.meta.url));
const atlas=new spine.TextureAtlas(fs.readFileSync(path.join(base,'robot.atlas'),'utf8'));
for(const page of atlas.pages)page.setTexture(new spine.CanvasTexture(await loadImage(path.join(base,page.name))));
const data=new spine.SkeletonJson(new spine.AtlasAttachmentLoader(atlas)).readSkeletonData(
 JSON.parse(fs.readFileSync(path.join(base,'robot-ik.json'))));
const canvas=createCanvas(640,760),ctx=canvas.getContext('2d');
const renderer=new spine.SkeletonRenderer(ctx);renderer.triangleRendering=false;
const folder=path.join(base,'frames');fs.mkdirSync(folder,{recursive:true});
let index=0;
for(const [name,label] of [['idle','IDLE'],['wave','WAVE'],['squat','IK / SQUAT'],['step','STEP / FIRST PASS'],['walk_side','SIDE STEP / CONTACT STUDY']]){
 const animation=data.findAnimation(name);
 for(let frame=0;frame<Math.round(animation.duration*30);frame++){
  const time=frame/30,skeleton=new spine.Skeleton(data);
  animation.apply(skeleton,0,time,false,[],1,spine.MixBlend.replace,spine.MixDirection.mixIn);
  skeleton.updateWorldTransform(spine.Physics.update);
  ctx.fillStyle='#172130';ctx.fillRect(0,0,640,760);
  ctx.fillStyle='#c8d5e8';ctx.font='19px sans-serif';ctx.fillText(label,24,34);
  ctx.fillStyle='#7f95af';ctx.font='13px sans-serif';ctx.fillText('Original robot · Spine runtime 4.2',24,58);
  ctx.save();ctx.translate(320,710);ctx.scale(.92,-.92);
  ctx.translate(-skeleton.findBone('root').worldX,0);
  ctx.strokeStyle='#485a72';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-300,0);ctx.lineTo(300,0);ctx.stroke();
  if(name==='walk_side'){ctx.beginPath();for(let x=-350;x<=450;x+=35){ctx.moveTo(x,0);ctx.lineTo(x,-10)}ctx.stroke()}
  renderer.draw(skeleton);ctx.restore();
  const png=await canvas.encode('png');
  fs.writeFileSync(path.join(folder,`${String(index++).padStart(4,'0')}.png`),png);
 }
}
console.log(`Rendered ${index} frames at 30 fps to ${folder}`);
