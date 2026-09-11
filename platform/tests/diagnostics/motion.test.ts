import { describe, expect, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { measure_motion, validate_project, policy } from '../../src/diagnostics';
import type { DiagnosticReport, MotionRequest } from '../../src/diagnostics';
import type { Result } from '../../src/model/types';
import { stationaryMesh, meshRequest, driftingMesh, flippedMesh, velocityLoop, footFixture } from '../../fixtures/diagnostics/synthetic';
const get = (result: Result<DiagnosticReport>) => { expect(result.ok,JSON.stringify(result)).toBe(true); if(!result.ok)throw new Error(result.error.message);return result.value; };
const run = (p=stationaryMesh(), request: MotionRequest={animationId:'motion'}) => get(measure_motion(p,request));
describe('strict validation before sampling',()=>{
  it('accepts a good weighted mesh and reports no geometry',()=>{
    expect(get(validate_project(stationaryMesh()))).toMatchObject({valid:true,total:0,items:[]});
  });
  it.each(['negative','above-one','sum','missing','duplicate','nan','count'] as const)('reports %s weights without evaluating',kind=>{
    const p=stationaryMesh(),m=p.attachments[0];
    if(kind==='negative') m.weights[0][0].weight=-1;
    if(kind==='above-one') m.weights[0][0].weight=2;
    if(kind==='sum') m.weights[0][0].weight=.9;
    if(kind==='missing') m.weights[0][0].boneId='absent';
    if(kind==='duplicate')m.weights[0].push({...m.weights[0][0]});
    if(kind==='nan')m.weights[0][0].weight=NaN;
    if(kind==='count')m.weights.pop();
    const report=get(measure_motion(p,{animationId:'motion'}));
    expect(report.valid).toBe(false);expect(report.sampling.evaluationCount).toBe(0);
    expect(report.total).toBe(1);expect(report.validationProblem).toBeDefined();
    expect(report.items[0]).toMatchObject({kind:'invalid-weights',ids:['triangle'],time:null,units:'weight'});
    if(kind==='sum')expect(report.items[0].observed).toBeCloseTo(.1);
  });
  it('does not invoke an invalid project getter',()=>{
    const p=stationaryMesh();let calls=0;
    Object.defineProperty(p.attachments[0].weights[0][0],'weight',{enumerable:true,get(){calls++;throw Error('no');}});
    expect(get(validate_project(p)).valid).toBe(false);expect(calls).toBe(0);
  });
  it('retains strict capability and missing-reference errors',()=>{
    const p=stationaryMesh();p.requiredCapabilities=['region-v0'];
    expect(get(validate_project(p)).validationProblem?.code).toBe('UNSUPPORTED_CAPABILITY');
  });
});
describe('canonical geometry and final IK diagnostics',()=>{
  it('good fixed anchor and stationary loop have zero issues',()=>{
    const p=stationaryMesh(),before=structuredClone(p),report=run(p,meshRequest);
    expect(report.total).toBe(0);expect(report.sampling.loopChecked).toBe(true);expect(p).toEqual(before);
  });
  it('uses strict .5px anchor and loop thresholds',()=>{
    expect(run(driftingMesh(.5),meshRequest).items.filter(i=>i.kind==='anchor-drift'||i.kind==='loop-position')).toEqual([]);
    const report=run(driftingMesh(.5001),meshRequest);
    expect(report.items.some(i=>i.kind==='anchor-drift'&&i.time===1)).toBe(true);
    expect(report.items.some(i=>i.kind==='loop-position')).toBe(true);
  });
  it('compensates global reflection of a multi-bone weighted mesh',()=>{
    expect(run(flippedMesh(true)).total).toBe(0);
    const bad=run(flippedMesh(false));expect(bad.total).toBe(61);
    expect(bad.items.every(i=>i.kind==='triangle-flip'&&i.triangle===0)).toBe(true);
  });
  it('does not compensate a reflection of only one influence',()=>{
    const p=stationaryMesh();p.animations[0].loop=false;
    p.animations[0].channels=[{boneId:'child',property:'scaleX',keys:[{time:0,value:-1,curve:{type:'linear'}}]}];
    expect(run(p).items.some(i=>i.kind==='triangle-flip')).toBe(true);
  });
  it('reports collapse independently from inversion',()=>{
    const p=stationaryMesh();p.animations[0].deforms=[{attachmentId:'triangle',keys:[{time:0,offsets:[0,0,0,0,0,-2],curve:{type:'linear'}}]}];
    expect(run(p).items.some(i=>i.kind==='triangle-degenerate')).toBe(true);
  });
  it('uses canonical mesh vertices when slot bone is different',()=>{
    const p=stationaryMesh();p.slots[0].boneId='child';
    expect(run(p,meshRequest).total).toBe(0);
  });
  it('respects anchor stance intervals including exact endpoints',()=>{
    const p=driftingMesh();
    const report=run(p,{animationId:'motion',loopPoints:[],anchors:[{...meshRequest.anchors![0],end:.5}]});
    expect(report.total).toBe(0);
    expect(run(p,{animationId:'motion',loopPoints:[],anchors:[{...meshRequest.anchors![0],start:.511,end:.511}]}).items[0].time).toBe(.511);
  });
  it('reachable planted foot is good, unreachable foot is flagged',()=>{
    const good=get(measure_motion(footFixture('good'),{animationId:'idle',loopPoints:[]}));expect(good.total).toBe(0);
    const bad=get(measure_motion(footFixture('unreachable'),{animationId:'idle',loopPoints:[]}));
    expect(bad.items.some(i=>i.kind==='foot-target'&&i.observed!>.5&&i.status==='unreachable')).toBe(true);
  });
  it('a sliding solved target is caught by a declared world anchor',()=>{
    const report=get(measure_motion(footFixture('sliding'),{animationId:'idle',loopPoints:[],anchors:[{id:'plant',point:{kind:'ik',constraintId:'leg'},target:[120,-100]}]}));
    expect(report.items.some(i=>i.kind==='anchor-drift')).toBe(true);
    expect(report.items.some(i=>i.kind==='foot-target')).toBe(false);
  });
  it('later overlapping constraints can invalidate an earlier solved foot',()=>{
    const report=get(measure_motion(footFixture('overridden'),{animationId:'idle',loopPoints:[]}));
    expect(report.items.some(i=>i.kind==='foot-target'&&i.ids[0]==='leg'&&i.status==='solved'&&i.observed!>.5)).toBe(true);
  });
});
describe('locked loop sampling and bounded API',()=>{
  it('detects velocity mismatch when loop positions match',()=>{
    const report=run(velocityLoop());
    expect(report.items.some(i=>i.kind==='loop-position')).toBe(false);
    const seam=report.items.find(i=>i.kind==='loop-velocity')!;
    expect(seam.observed).toBeCloseTo(40);expect(seam.threshold).toBeCloseTo(1);
  });
  it('smooth Bezier endpoints and near-stationary floor pass',()=>{
    expect(run(velocityLoop(10,true)).total).toBe(0);
    expect(run(velocityLoop(.1)).total).toBe(0);
    expect(run(velocityLoop(.2)).items.find(i=>i.kind==='loop-velocity')?.threshold).toBe(.5);
  });
  it('retains authored loop end instead of wrapping it to zero',()=>{
    const p=driftingMesh(4);const before=structuredClone(p);const report=run(p);
    expect(report.items.find(i=>i.kind==='loop-position')?.observed).toBeCloseTo(4);expect(p).toEqual(before);
  });
  it('samples keys, neighbors and 60 uniform intervals',()=>{
    const p=stationaryMesh();p.animations[0].channels=[{boneId:'root',property:'x',keys:[{time:.123,value:10,curve:{type:'linear'}}]}];
    const r=run(p);expect(r.sampling.times).toContain(.123);expect(r.sampling.times).toContain(.123-r.sampling.h!);
    expect(r.sampling.times).toContain(.5);expect(r.sampling.times).toContain(1);expect(r.sampling.evaluationCount).toBeLessThanOrEqual(policy.maxSamples);
  });
  it('paginates stable records and reports the full issue count',()=>{
    const p=flippedMesh(false),all=run(p,{animationId:'motion',limit:500});
    const first=run(p,{animationId:'motion',limit:7}),second=run(p,{animationId:'motion',offset:7,limit:7});
    expect(first.total).toBe(61);expect(first.nextOffset).toBe(7);
    expect([...first.items,...second.items]).toEqual(all.items.slice(0,14));
    expect(run(p,{animationId:'motion',offset:100}).items).toEqual([]);
    expect(run(p,{animationId:'motion',offset:100}).nextOffset).toBeNull();
    expect(run(p,{animationId:'motion',offset:100}).passed).toBe(false);
    expect(JSON.stringify(first)).not.toContain('vertices');
  });
  it('rejects invalid requests and excessive sampling instead of truncating',()=>{
    expect(measure_motion(stationaryMesh(),{animationId:'missing'}).ok).toBe(false);
    expect(measure_motion(stationaryMesh(),{animationId:'motion',limit:501}).ok).toBe(false);
    expect(measure_motion(stationaryMesh(),{animationId:'motion',loopPoints:[{kind:'vertex',slotId:'mesh-slot',vertex:99}]}).ok).toBe(false);
    const p=stationaryMesh();p.animations[0].channels=[{boneId:'root',property:'x',keys:Array.from({length:600},(_,i)=>({time:i/600,value:10,curve:{type:'linear' as const}}))}];
    expect(measure_motion(p,{animationId:'motion'})).toMatchObject({ok:false,error:{code:'LIMIT_EXCEEDED'}});
  });
  it('rejects accessor requests without invoking them',()=>{
    let calls=0;const request={animationId:'motion'};
    Object.defineProperty(request,'limit',{enumerable:true,get(){calls++;throw Error('no');}});
    expect(measure_motion(stationaryMesh(),request).ok).toBe(false);expect(calls).toBe(0);
  });
  it('bounds selected points and catches arithmetic overflow explicitly',()=>{
    expect(measure_motion(stationaryMesh(),{animationId:'motion',loopPoints:Array.from({length:4097},()=>({kind:'bone',boneId:'root'}))})).toMatchObject({ok:false,error:{code:'LIMIT_EXCEEDED'}});
    const p=stationaryMesh();p.animations[0].channels=[{boneId:'root',property:'scaleX',keys:[{time:0,value:1e308,curve:{type:'linear'}}]}];
    expect(measure_motion(p,{animationId:'motion'}).ok).toBe(false);
  });
  it('measures bone-local points and never treats disabled IK as planted',()=>{
    const p=stationaryMesh();
    expect(run(p,{animationId:'motion',anchors:[{id:'bone-point',point:{kind:'bone',boneId:'root',local:[2,0]},target:[12,20]}]}).total).toBe(0);
    const leg=footFixture('good');leg.ikConstraints![0].mix=0;
    expect(get(measure_motion(leg,{animationId:'idle',loopPoints:[]})).items.some(i=>i.kind==='foot-target'&&i.status==='disabled')).toBe(true);
  });
  it('records reproducible good/bad reports when requested',()=>{
    const invalid=stationaryMesh();invalid.attachments[0].weights[0][0].weight=-1;
    const results={policy,invalidWeights:get(validate_project(invalid)),goodMesh:run(stationaryMesh(),meshRequest),anchorDrift:run(driftingMesh(),meshRequest),
      globalReflection:run(flippedMesh(true)),localInversion:run(flippedMesh(false)),velocityMismatch:run(velocityLoop()),
      smoothLoop:run(velocityLoop(10,true)),goodFoot:get(measure_motion(footFixture('good'),{animationId:'idle',loopPoints:[]})),
      overriddenFoot:get(measure_motion(footFixture('overridden'),{animationId:'idle',loopPoints:[],limit:1}))};
    if(process.env.DIAGNOSTICS_EVIDENCE)writeFileSync(process.env.DIAGNOSTICS_EVIDENCE,JSON.stringify(results,null,2)+'\n');
    expect(results.goodMesh.total).toBe(0);
  });
});
