import type {Project, Mesh, Asset} from '../../../src/model';
/** Renderer fixture, not a Gate 2 authored motion: regular shared-vertex grid. */
export function gridProject(asset:Asset, kind:'scarf'|'jelly'|'synthetic'):Project {
 const width=kind==='scarf'?360:260,height=kind==='scarf'?135:260;
 const vertices:number[]=[],uvs:number[]=[],triangles:number[]=[],weights:Mesh['weights']=[];
 for(let y=0;y<=4;y++)for(let x=0;x<=8;x++){
  vertices.push(-width/2+x*width/8,height/2-y*height/4);uvs.push(x/8,y/4);
  const w=kind==='scarf'?x/8:1-y/4;
  weights.push([{boneId:'root',weight:1-w},{boneId:'tip',weight:w}]);
 }
 for(let y=0;y<4;y++)for(let x=0;x<8;x++){const i=y*9+x;triangles.push(i,i+1,i+10,i,i+10,i+9);}
 const offsets=vertices.map((n,i)=>i%2?(kind==='scarf'?30*Math.sin(uvs[i-1]*Math.PI):0):(kind==='jelly'?n*.15:0));
 const identity={x:0,y:0,rotation:0,scaleX:1,scaleY:1};
 return {formatVersion:1,projectId:`mesh-${kind}`,revision:0,requiredCapabilities:['region-v0','mesh-v1'],metadata:{name:`T01 ${kind} mesh renderer fixture`},assets:[asset],bones:[{id:'root',name:'Root',parentId:null,setup:identity},{id:'tip',name:'Tip',parentId:'root',setup:{...identity}}],slots:[{id:'mesh',name:'Mesh',boneId:'root',attachmentId:'mesh'}],attachments:[{id:'mesh',type:'mesh',assetId:asset.id,vertices,uvs,triangles,weights,bindPose:[{boneId:'root',world:[1,0,0,1,0,0]},{boneId:'tip',world:[1,0,0,1,0,0]}]}],animations:[{id:'deform',name:'Deform',duration:1,loop:false,channels:[{boneId:'tip',property:kind==='scarf'?'rotation':'scaleY',keys:[{time:0,value:kind==='scarf'?0:1,curve:{type:'linear'}},{time:1,value:kind==='scarf'?.65:.55,curve:{type:'linear'}}]}],deforms:[{attachmentId:'mesh',keys:[{time:0,offsets:vertices.map(()=>0),curve:{type:'linear'}},{time:1,offsets,curve:{type:'linear'}}]}]}]};
}

import {createIKProject} from '../../../fixtures/ik/leg';
/** Mixed mesh + foot region consumes the accepted #16 solver output. */
export function ikRenderProject(asset:Asset):Project {
 const p=createIKProject();p.requiredCapabilities.push('mesh-v1');p.assets=[asset];
 p.attachments=[{id:'leg-mesh',type:'mesh',assetId:asset.id,vertices:[0,10,100,10,200,10,0,-10,100,-10,200,-10],uvs:[0,0,.5,0,1,0,0,1,.5,1,1,1],triangles:[0,1,4,0,4,3,1,2,5,1,5,4],bindPose:[{boneId:'hip',world:[1,0,0,1,0,0]},{boneId:'shin',world:[1,0,0,1,100,0]}],weights:[[{boneId:'hip',weight:1}],[{boneId:'hip',weight:.5},{boneId:'shin',weight:.5}],[{boneId:'shin',weight:1}],[{boneId:'hip',weight:1}],[{boneId:'hip',weight:.5},{boneId:'shin',weight:.5}],[{boneId:'shin',weight:1}]]},
 {id:'foot-region',type:'region',assetId:asset.id,transform:{x:0,y:0,rotation:0,scaleX:1,scaleY:1},width:30,height:20,pivotX:15,pivotY:10}];
 p.slots=[{id:'leg',name:'Leg mesh',boneId:'hip',attachmentId:'leg-mesh'},{id:'foot',name:'Foot region',boneId:'foot',attachmentId:'foot-region'}];
 return p;
}
