import type { Mesh, Project } from '../../src/model';
import { createSyntheticProject, identity } from '../model/synthetic';
/** Metadata-only synthetic triangle; no claim that zero hash represents a usable PNG. */
export function createMeshProject(): Project & { attachments: Mesh[] } {
  const old = createSyntheticProject();
  return { ...old, formatVersion:1, requiredCapabilities:['region-v0','mesh-v1'],
    bones:[{id:'root',name:'Root',parentId:null,setup:{...identity,x:10,y:20}},
      {id:'child',name:'Child',parentId:'root',setup:{...identity,x:2}}],
    slots:[{id:'mesh-slot',name:'Mesh',boneId:'root',attachmentId:'triangle'}],
    attachments:[{id:'triangle',type:'mesh',assetId:'art',vertices:[12,20,14,20,12,22],
      uvs:[0,0,1,0,0,1],triangles:[0,1,2],
      bindPose:[{boneId:'root',world:[1,0,0,1,10,20]},{boneId:'child',world:[1,0,0,1,12,20]}],
      weights:[[{boneId:'root',weight:1}],[{boneId:'child',weight:1}],[{boneId:'root',weight:.25},{boneId:'child',weight:.75}]]}],
    animations:[{id:'bend',name:'Bend',duration:1,loop:false,channels:[
      {boneId:'root',property:'x',keys:[{time:0,value:10,curve:{type:'linear'}},{time:1,value:14,curve:{type:'linear'}}]},
      {boneId:'child',property:'rotation',keys:[{time:0,value:0,curve:{type:'linear'}},{time:1,value:Math.PI/2,curve:{type:'linear'}}]}],
      deforms:[{attachmentId:'triangle',keys:[{time:0,offsets:[0,0,0,0,0,0],curve:{type:'linear'}},{time:1,offsets:[2,0,2,0,2,0],curve:{type:'linear'}}]}]}]
  };
}
