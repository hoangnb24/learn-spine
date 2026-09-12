import { it,expect } from 'vitest';
import { fixture,composition,track,crossfade,value } from '../engine/composition-fixture';
import { measure_motion } from '../../src/diagnostics';
import { evaluateTarget } from '../../src/engine';
const target={kind:'composition' as const,compositionId:'motion'};
it('uses final composed IK residual, including unsatisfied targets, and labels sampled times',()=>{
  const p=fixture();p.compositions=[composition([track('walk',0,{end:1}),crossfade()])];
  let report=value(measure_motion(p,{target,loopPoints:[]}));
  expect(report.sampling.target).toEqual(target);expect(report.projectId).toBe(p.projectId);expect(report.revision).toBe(0);
  p.bones.find(b=>b.id==='target')!.setup.y=-500;
  report=value(measure_motion(p,{target,loopPoints:[]}));
  const residual=report.items.find(d=>d.kind==='foot-target')!;
  const pose=value(evaluateTarget(p,{target,time:residual.time!}));
  expect(residual.observed).toBe(pose.ik![0].distance);expect(residual.sampledTime).toBe(pose.sampledTime);
  expect(residual.observed).toBeGreaterThan(.5);
});
it('reports loop seam against authored end while canonical diagnostic samples wrap and caller stays immutable',()=>{
  const p=fixture();p.ikConstraints=[];p.animations[0].loop=false;
  p.compositions=[{...composition([track()]),duration:1,loop:true}];
  p.animations[0].channels[0].keys.at(-1)!.value=100;
  const before=structuredClone(p),report=value(measure_motion(p,{target,loopPoints:[{kind:'bone',boneId:'hip'}]}));
  expect(report.sampling.sampledTimes!.at(-1)).toBe(0);
  expect(report.items.some(d=>d.kind==='loop-position' && d.observed===100)).toBe(true);
  expect(p).toEqual(before);
});
