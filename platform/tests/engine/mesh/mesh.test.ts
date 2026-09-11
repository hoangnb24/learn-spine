import { describe, expect, it } from 'vitest';
import { evaluate, evaluatorCapabilities } from '../../../src/engine';
import { migrate, parse, serialize, validate, modelCapabilities, type Project } from '../../../src/model';
import { poseGeometry } from '../../../src/render/geometry';
import { createMeshProject } from '../../../fixtures/mesh/synthetic';
import { createSyntheticProject } from '../../../fixtures/model/synthetic';
const take = <T>(r: {ok:true;value:T}|{ok:false;error:unknown}): T => {if(!r.ok)throw Error(JSON.stringify(r.error));return r.value;};
const pose = (p: Project, time=0, animationId: string|null='bend') => take(evaluate(p,{time,animationId}));
const close = (actual: number[], expected: number[]) => {expect(actual.length).toBe(expected.length);expected.forEach((v,i)=>expect(Math.abs(actual[i]-v)).toBeLessThan(1e-5));};
function rejected(change:(p:ReturnType<typeof createMeshProject>)=>void, code='INVALID_INPUT') {
  const p=createMeshProject();change(p);const before=structuredClone(p);
  expect(validate(p)).toMatchObject({ok:false,error:{code}});expect(p).toEqual(before);
}
describe('mesh-v1 strict model',()=>{
  it('rejects malformed topology, bind data, weights and references',()=>{
    for(const triangles of [[0,1],[0,1,3],[-1,1,2],[.5,1,2]])rejected(p=>{p.attachments[0].triangles=triangles;});
    rejected(p=>{p.attachments[0].vertices.push(0);});
    rejected(p=>{p.attachments[0].uvs.pop();});
    rejected(p=>{p.attachments[0].uvs[0]=1.01;});
    rejected(p=>{p.attachments[0].weights.pop();});
    rejected(p=>{p.attachments[0].weights[0]=[];});
    rejected(p=>{p.attachments[0].weights[0][0].weight=-1;});
    rejected(p=>{p.attachments[0].weights[0][0].weight=.99998;});
    rejected(p=>{p.attachments[0].weights[0].push({boneId:'root',weight:0});});
    rejected(p=>{p.attachments[0].weights[0][0].boneId='missing';},'MISSING_REFERENCE');
    rejected(p=>{p.attachments[0].bindPose.pop();},'MISSING_REFERENCE');
    rejected(p=>{p.attachments[0].bindPose[0].boneId='missing';},'MISSING_REFERENCE');
    rejected(p=>{p.attachments[0].bindPose.push(p.attachments[0].bindPose[0]);});
    rejected(p=>{p.attachments[0].bindPose[0].world=[0,0,0,1,0,0];});
    const p=createMeshProject();p.attachments[0].weights[0][0].weight=.999995;
    expect(validate(p).ok).toBe(true);expect(take(validate(p)).attachments).toEqual(p.attachments);
  });
  it.each([NaN,Infinity,-Infinity])('rejects every stored mesh/deform number family %s',n=>{
    rejected(p=>{p.attachments[0].vertices[0]=n;});
    rejected(p=>{p.attachments[0].uvs[0]=n;});
    rejected(p=>{p.attachments[0].triangles[0]=n;});
    rejected(p=>{p.attachments[0].weights[0][0].weight=n;});
    rejected(p=>{p.attachments[0].bindPose[0].world=[1,0,0,1,n,0];});
    rejected(p=>{p.animations[0].deforms![0].keys[0].offsets[0]=n;});
  });
  it('rejects deform dimensions, missing/nonmesh targets, duplicate channels/times and curves',()=>{
    rejected(p=>{p.animations[0].deforms![0].keys[0].offsets.pop();});
    rejected(p=>{p.animations[0].deforms![0].attachmentId='missing';},'MISSING_REFERENCE');
    rejected(p=>{p.animations[0].deforms!.push(p.animations[0].deforms![0]);});
    for(const time of [-1,0,2])rejected(p=>{p.animations[0].deforms![0].keys[1].time=time;});
    rejected(p=>{p.animations[0].deforms![0].keys[0].curve={type:'bezier',x1:.9,x2:.1,y1:0,y2:1};});
    rejected(p=>{p.requiredCapabilities=['region-v0'];},'UNSUPPORTED_CAPABILITY');
    rejected(p=>{p.formatVersion=0;},'UNSUPPORTED_CAPABILITY');
    expect(validate({...createMeshProject(),requiredCapabilities:['region-v0','ik-v1']})).toMatchObject({ok:false,error:{code:'UNSUPPORTED_CAPABILITY'}});
  });
  it('roundtrips v1 and explicitly migrates v0 without changing geometry or source',()=>{
    const mesh=createMeshProject();expect(take(parse(take(serialize(mesh))))).toEqual(mesh);
    const old=createSyntheticProject(),before=structuredClone(old), migrated=take(migrate(old,1));
    expect(migrated).toEqual({...before,formatVersion:1});expect(old).toEqual(before);
    const a=take(evaluate(old,{animationId:'bounce',time:.4})),b=take(evaluate(migrated,{animationId:'bounce',time:.4}));expect(a).toEqual(b);
    expect(migrate(migrated,0)).toMatchObject({ok:false,error:{code:'UNSUPPORTED_VERSION'}});
    expect(take(migrate(mesh,1))).toEqual(mesh);
    expect(modelCapabilities.features).toContain('mesh-v1');expect(evaluatorCapabilities.features).toContain('ik-v1');
  });
});
describe('bind-world pre-skin linear blend geometry',()=>{
  it('recovers setup and computes rigid/blended end keys by independent arithmetic',()=>{
    const p=createMeshProject();close(pose(p,99,null).meshes[0].vertices,[12,20,14,20,12,22]);
    close(pose(p,0).meshes[0].vertices,[12,20,14,20,12,22]);
    // root-only (18,20), child-only rotated (4,0) about (16,20),
    // blend .25*(18,22) + .75*(14,22).
    close(pose(p,1).meshes[0].vertices,[18,20,16,24,15,22]);
    const r=pose(p);expect(r.poseVersion).toBe(1);expect(r.meshes[0]).toMatchObject({uvs:[0,0,1,0,0,1],triangles:[0,1,2],slotId:'mesh-slot'});
  });
  it('uses parent world transforms and negative scales exactly once, ignoring slot bone for skinning',()=>{
    const p=createMeshProject();p.bones[0].setup.scaleX=-1;p.bones[0].setup.scaleY=2;
    // Explicit bind is retained: setup now deliberately differs from the authored bind.
    close(pose(p,0,null).meshes[0].vertices,[8,20,6,20,8,24]);
    p.slots[0].boneId='child';close(pose(p,0,null).meshes[0].vertices,[8,20,6,20,8,24]);
    p.bones.reverse();close(pose(p,0,null).meshes[0].vertices,[8,20,6,20,8,24]);
  });
  it('handles affine bind inverse including reflection and shear',()=>{
    const p=createMeshProject();p.animations=[];
    p.attachments[0].weights=p.attachments[0].weights.map(()=>[{boneId:'root',weight:1}]);
    p.attachments[0].bindPose=[{boneId:'root',world:[-2,0,1,3,10,20]}];
    // Bind-world (12,20),(14,20),(12,22) maps to local (-1,0),(-2,0),(-2/3,2/3).
    close(pose(p,0,null).meshes[0].vertices,[9,20,8,20,10-2/3,20+2/3]);
  });
  it('evaluates midpoints, stepped keys, Bezier and hold/clamp without post-skin offsets',()=>{
    const p=createMeshProject(),h=Math.SQRT1_2;
    close(pose(p,.5).meshes[0].vertices,[15,20,14+3*h,20+3*h,.25*15+.75*(14-h),.25*22+.75*(20+3*h)]);
    p.animations[0].channels=[];
    p.animations[0].deforms![0].keys[0].curve={type:'stepped'};
    close(pose(p,.9).meshes[0].vertices,[12,20,14,20,12,22]);
    close(pose(p,1).meshes[0].vertices,[14,20,16,20,14,22]);
    p.animations[0].deforms![0].keys[0].curve={type:'bezier',x1:0,x2:0,y1:0,y2:1};
    // u=.5 gives time=.125 and interpolation=.5.
    close(pose(p,.125).meshes[0].vertices,[13,20,15,20,13,22]);
    close(pose(p,-3).meshes[0].vertices,[12,20,14,20,12,22]);
    close(pose(p,3).meshes[0].vertices,[14,20,16,20,14,22]);
  });
  it('matches 20 seeded shuffled seeks against analytic answers and never mutates source/results',()=>{
    const p=createMeshProject(),before=structuredClone(p);let seed=15;
    const times=Array.from({length:20},()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;});
    const direct=times.map(t=>pose(p,t));
    for(const index of [19,0,15,3,6,11,2,17,1,13,7,18,4,16,9,5,14,8,12,10]){
      const t=times[index],c=Math.cos(Math.PI*t/2),s=Math.sin(Math.PI*t/2);
      const expected=[12+6*t,20,12+4*t+(2+2*t)*c,20+(2+2*t)*s,
        .25*(12+6*t)+.75*(12+4*t+2*t*c-2*s),.25*22+.75*(20+2*t*s+2*c)];
      const r=pose(p,t);close(r.meshes[0].vertices,expected);expect(r).toEqual(direct[index]);
    }
    expect(p).toEqual(before);direct[0].meshes[0].vertices[0]=999;direct[0].meshes[0].uvs[0]=.7;
    expect(p).toEqual(before);expect(pose(p,times[0])).not.toEqual(direct[0]);
  });
  it('reports derived overflow and refuses renderer geometry until #17',()=>{
    const p=createMeshProject();p.attachments[0].vertices[0]=Number.MAX_VALUE;p.bones[0].setup.scaleX=2;
    expect(evaluate(p,{time:0,animationId:null})).toMatchObject({ok:false,error:{code:'INVALID_INPUT'}});
    const mesh=createMeshProject();expect(poseGeometry(mesh,pose(mesh))).toMatchObject({ok:false,error:{code:'UNSUPPORTED_CAPABILITY'}});
  });
});
