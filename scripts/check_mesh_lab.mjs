import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as S from '@esotericsoftware/spine-core';
const base=new URL('../exercises/mesh-lab/',import.meta.url);
const raw=JSON.parse(fs.readFileSync(new URL('mesh.json',base)));
const load=raw=>new S.SkeletonJson(new S.AtlasAttachmentLoader(new S.TextureAtlas(fs.readFileSync(new URL('mesh.atlas',base),'utf8')))).readSkeletonData(raw);
const data=load(raw);
function vertices(data,skin,anim,time){
 const s=new S.Skeleton(data);s.setSkinByName(skin);s.setSlotsToSetupPose();
 if(anim)data.findAnimation(anim).apply(s,0,time,false,[],1,S.MixBlend.replace,S.MixDirection.mixIn);
 s.updateWorldTransform(S.Physics.update);const slot=s.findSlot('strip'),a=slot.getAttachment();
 const out=new Float32Array(a.worldVerticesLength);a.computeWorldVertices(slot,0,out.length,out,0,2);return [...out];
}
const rest=vertices(data,'default',null,0),bend=vertices(data,'default','bend',.5);
const wrong=vertices(data,'wrong-weights','bend',.5),manual=vertices(data,'manual','flutter',.5);
const max=(a,b)=>Math.max(...a.map((v,i)=>Math.abs(v-b[i])));
assert.ok(max(rest,wrong)<.001,'wrong weights should ignore tip rotation');
assert.ok(max(rest,bend)>50,'weighted tip should bend');
assert.ok(Math.abs(bend[0]-rest[0])<.001&&Math.abs(bend[1]-rest[1])<.001,'base must stay fixed');
assert.ok(Math.abs(manual[5]-rest[5]-20)<.001,'manual middle vertex should move 20');
// Deliberately use a historical top-level key. This loader silently ignores it;
// checking loaded animation timelines detects the mistake.
const invalid=structuredClone(raw);
invalid.animations.flutter.deform=invalid.animations.flutter.attachments;
delete invalid.animations.flutter.attachments;
const invalidData=load(invalid);
assert.equal(invalidData.findAnimation('flutter').timelines.length,0);
assert.ok(data.findAnimation('flutter').timelines.length>0);
const report={vertices:rest.length/2,triangles:16,weightedMaxMovement:max(rest,bend),
 wrongWeightsMaxMovement:max(rest,wrong),manualMidpointMovement:manual[5]-rest[5],
 wrongSchemaLoadedTimelines:invalidData.findAnimation('flutter').timelines.length,
 correctSchemaLoadedTimelines:data.findAnimation('flutter').timelines.length,
 scope:'Official runtime behavior; no editor operation verified.'};
fs.writeFileSync(new URL('checks.json',base),JSON.stringify(report,null,2)+'\n');console.log(report);
