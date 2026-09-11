import type { Project, Mesh, Curve } from '../../src/model/types';
import { createMeshProject } from '../mesh/synthetic';
import { createIKProject } from '../ik/leg';
import type { MotionRequest } from '../../src/diagnostics';
const linear: Curve = { type:'linear' };
/** Metadata-only geometry oracle. No PNG/visual quality claim. */
export function stationaryMesh(): Project & {attachments: Mesh[]} {
  const p=createMeshProject();
  p.animations=[{id:'motion',name:'Motion',duration:1,loop:true,channels:[]}];
  return p;
}
export const meshRequest: MotionRequest = {animationId:'motion',anchors:[
  {id:'neck',point:{kind:'vertex',slotId:'mesh-slot',vertex:0},target:[12,20]}]};
export function driftingMesh(amount=1) {
  const p=stationaryMesh();
  p.animations[0].channels=[{boneId:'root',property:'x',keys:[{time:0,value:10,curve:linear},{time:1,value:10+amount,curve:linear}]}];
  return p;
}
export function flippedMesh(global: boolean) {
  const p=stationaryMesh(); p.animations[0].loop=false;
  // Child + root weights are already mixed on vertex 2: the relevant transform
  // is their common root, not the slot transform or an arbitrary influence.
  if(global) p.animations[0].channels=[{boneId:'root',property:'scaleX',keys:[{time:0,value:-1,curve:linear}]}];
  else p.animations[0].deforms=[{attachmentId:'triangle',keys:[{time:0,offsets:[0,0,0,0,0,-4],curve:linear}]}];
  return p;
}
export function velocityLoop(amplitude=10, smooth=false) {
  const p=stationaryMesh();
  const curve: Curve = smooth ? {type:'bezier',x1:1/3,y1:0,x2:2/3,y2:1} : linear;
  p.animations[0].channels=[{boneId:'root',property:'x',keys:[
    {time:0,value:10,curve},{time:.5,value:10+amplitude,curve},{time:1,value:10,curve}]}];
  return p;
}
export function footFixture(kind: 'good'|'unreachable'|'sliding'|'overridden') {
  const p=createIKProject();
  if(kind==='unreachable') p.bones.find(b=>b.id==='target')!.setup.x=300;
  if(kind==='sliding') p.animations[0].channels.push({boneId:'target',property:'x',keys:[
    {time:0,value:120,curve:linear},{time:2,value:125,curve:linear}]});
  if(kind==='overridden') {
    p.bones.push({id:'target2',name:'Target 2',parentId:null,setup:{x:100,y:100,rotation:0,scaleX:1,scaleY:1}});
    p.ikConstraints!.push({...p.ikConstraints![0],id:'later',targetBoneId:'target2',order:1});
  }
  return p;
}
