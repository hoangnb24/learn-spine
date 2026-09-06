import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import * as S from '@esotericsoftware/spine-canvas';
const base=fileURLToPath(new URL('../exercises/mesh-lab/',import.meta.url));
const atlas=new S.TextureAtlas(fs.readFileSync(path.join(base,'mesh.atlas'),'utf8'));
atlas.pages[0].setTexture(new S.CanvasTexture(await loadImage(path.join(base,'strip.png'))));
const data=new S.SkeletonJson(new S.AtlasAttachmentLoader(atlas)).readSkeletonData(JSON.parse(fs.readFileSync(path.join(base,'mesh.json'))));
const canvas=createCanvas(1100,420),ctx=canvas.getContext('2d'),renderer=new S.SkeletonRenderer(ctx);renderer.triangleRendering=true;
const scenes=[['wrong-weights','bend','Sai trọng số'],['default','bend','Uốn theo xương'],['manual','flutter','Biến dạng trực tiếp']];
const frames=path.join(base,'frames');fs.mkdirSync(frames,{recursive:true});
for(let frame=0;frame<60;frame++){
 ctx.fillStyle='#172130';ctx.fillRect(0,0,1100,420);
 ctx.fillStyle='#d4e0f1';ctx.font='22px sans-serif';ctx.fillText('Bài mesh · cùng một ảnh / 15 đỉnh',24,40);
 scenes.forEach(([skin,anim,label],panel)=>{
  const s=new S.Skeleton(data);s.setSkinByName(skin);s.setSlotsToSetupPose();
  data.findAnimation(anim).apply(s,0,frame/30,false,[],1,S.MixBlend.replace,S.MixDirection.mixIn);s.updateWorldTransform(S.Physics.update);
  ctx.fillStyle='#e7eff9';ctx.font='16px sans-serif';ctx.fillText(label,24+panel*360,90);
  ctx.save();ctx.translate(34+panel*360,260);ctx.scale(1,-1);renderer.draw(s);
  const slot=s.slots[0],a=slot.getAttachment(),v=new Float32Array(a.worldVerticesLength);a.computeWorldVertices(slot,0,v.length,v,0,2);
  ctx.fillStyle='#e5efff';for(let i=0;i<v.length;i+=2){ctx.beginPath();ctx.arc(v[i],v[i+1],2.5,0,7);ctx.fill()}
  ctx.strokeStyle='#f13d74';ctx.lineWidth=3;ctx.beginPath();for(const b of s.bones.slice(1)){ctx.moveTo(b.worldX,b.worldY);ctx.lineTo(b.worldX+b.a*b.data.length,b.worldY+b.c*b.data.length)}ctx.stroke();ctx.restore();
 });
 ctx.fillStyle='#91a8c4';ctx.font='14px sans-serif';ctx.fillText('Spine runtime 4.2 · Chưa thực hành trong editor',24,392);
 fs.writeFileSync(path.join(frames,`${String(frame).padStart(3,'0')}.png`),await canvas.encode('png'));
}
console.log('Rendered mesh comparison, 60 frames');
