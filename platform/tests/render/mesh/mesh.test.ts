import {ikRenderProject} from './fixture';
import {describe,it,expect} from 'vitest';
import {createMeshProject} from '../../../fixtures/mesh/synthetic';
import {evaluate} from '../../../src/engine';
import {poseGeometry,fitCamera} from '../../../src/render/geometry';
import {animationBounds} from '../../../src/observation/bounds';
import type {Result} from '../../../src/model';
const u=<T>(r:Result<T>):T=>{if(!r.ok)throw Error(r.error.message);return r.value;};
const viewport={width:400,height:300,centerX:0,centerY:0,zoom:1,devicePixelRatio:2,background:'#00000000'};
describe('mesh renderer geometry boundary',()=>{
 it('uses evaluated world XY exactly, fits deformation, does not mutate',()=>{
  const p=createMeshProject(),snapshot=structuredClone(p),pose=u(evaluate(p,{animationId:'bend',time:1}));
  expect(u(poseGeometry(p,pose))).toEqual([[18,20,16,24,15,22]]);
  expect(u(fitCamera(p,[pose],viewport)).bounds).toEqual({minX:15,minY:20,maxX:18,maxY:24});
  expect(p).toEqual(snapshot);
 });
 it('rejects mismatched UV, indices, NaN, count and duplicate slot entries',()=>{
  const p=createMeshProject(),pose=u(evaluate(p,{animationId:null,time:0}));
  for(const change of [(x:typeof pose)=>x.meshes[0].uvs[0]=.3,(x:typeof pose)=>x.meshes[0].triangles[0]=2,(x:typeof pose)=>x.meshes[0].vertices[0]=NaN,(x:typeof pose)=>x.meshes[0].vertices.pop(),(x:typeof pose)=>x.meshes.push(x.meshes[0])]){
   const x=structuredClone(pose);change(x);expect(poseGeometry(p,x).ok).toBe(false);
  }
 });
 it('continuous envelope contains weighted deforms and Bezier overshoot between requested frames',()=>{
  const p=createMeshProject();p.animations[0].deforms![0].keys[0].curve={type:'bezier',x1:.2,y1:3,x2:.8,y2:2};
  p.bones[0].setup.scaleX=-2;p.bones[0].setup.scaleY=.5;
  const bounds=animationBounds(p,'bend')!;
  for(let k=0;k<=200;k++){
   const xy=u(evaluate(p,{animationId:'bend',time:k/200})).meshes[0].vertices;
   for(let i=0;i<xy.length;i+=2){expect(xy[i]).toBeGreaterThanOrEqual(bounds.minX-1e-9);expect(xy[i]).toBeLessThanOrEqual(bounds.maxX+1e-9);expect(xy[i+1]).toBeGreaterThanOrEqual(bounds.minY-1e-9);expect(xy[i+1]).toBeLessThanOrEqual(bounds.maxY+1e-9);}
  }
 });
});

it('continuous IK envelope includes actual solved mesh/region worlds under reflection and partial mix',()=>{
 for(const bend of [1,-1] as const)for(const mix of [0,.5,1])for(const reflection of [1,-1]){
  const p=ikRenderProject(createMeshProject().assets[0]);p.ikConstraints![0].bend=bend;p.ikConstraints![0].mix=mix;p.bones[0].setup.scaleX=reflection;
  p.animations[0].channels.push({boneId:'target',property:'x',keys:[{time:0,value:120,curve:{type:'bezier',x1:.2,y1:3,x2:.8,y2:2}},{time:2,value:-80,curve:{type:'linear'}}]});
  const bounds=animationBounds(p,'idle')!;
  for(let k=0;k<=100;k++)for(const xy of u(poseGeometry(p,u(evaluate(p,{animationId:'idle',time:k/50}))))){
   for(let i=0;i<xy.length;i+=2){expect(xy[i]).toBeGreaterThanOrEqual(bounds.minX-1e-8);expect(xy[i]).toBeLessThanOrEqual(bounds.maxX+1e-8);expect(xy[i+1]).toBeGreaterThanOrEqual(bounds.minY-1e-8);expect(xy[i+1]).toBeLessThanOrEqual(bounds.maxY+1e-8);}
  }
 }
});
