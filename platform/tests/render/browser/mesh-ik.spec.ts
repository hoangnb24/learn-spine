import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
test('accepted IK output renders mixed mesh/region and continuous observation includes it',async({page})=>{
 await page.goto('/tests/render/browser/');await page.waitForFunction(()=>!!(window as any).meshHarness);
 const result=await page.evaluate(async()=>{
  const h=(window as any).harness,m=(window as any).meshHarness,u=h.unwrap,b=await h.synthetic();b.project=m.ikRenderProject(b.project.assets[0]);
  const v={...h.viewport,width:640,height:480,background:'#263442'},poses=[0,.5,1,1.5].map(time=>u(h.evaluate(b.project,{animationId:'idle',time}))),fit=u(h.fitCamera(b.project,poses,v));
  u(await h.renderer.prepare(b));h.renderer.setOverlay({wireframe:true,weightBoneId:'shin'});
  const overlay=[...u(await h.renderer.capture(poses[1],fit.viewport))];h.renderer.setOverlay({});
  const s=new m.ObservationService(),job=u(s.submit(b,{kind:'sequence',animationId:'idle',times:[0,.5,1,1.5],viewport:v}));
  let finished;for(let i=0;i<1000;i++){finished=u(s.get(job.id));if(!['queued','running'].includes(finished.status))break;await new Promise(resolve=>setTimeout(resolve,5));}
  if(finished.status!=='succeeded')throw Error(JSON.stringify(finished));
  const manifest=u(s.getManifest(job.id));const frames=[];for(const f of manifest.frames)frames.push([...u(await s.readArtifact(f.artifactId))]);
  const contained=poses.every((pose:any)=>u(m.poseGeometry(b.project,pose)).every((xy:number[])=>xy.every((n,i)=>i%2?n>=manifest.frames[0].bounds.minY&&n<=manifest.frames[0].bounds.maxY:n>=manifest.frames[0].bounds.minX&&n<=manifest.frames[0].bounds.maxX)));
  s.dispose();h.renderer.dispose();return {contained,manifest,diagnostics:poses.map((p:any)=>p.ik),frames,overlay};
 });
 expect(result.contained).toBe(true);for(const d of result.diagnostics)expect(d[0].distance).toBeLessThan(.5);expect(result.frames).toHaveLength(4);
 mkdirSync('evidence/issue-17',{recursive:true});result.frames.forEach((png,i)=>writeFileSync(`evidence/issue-17/ik-observation-${i}.png`,Buffer.from(png)));writeFileSync('evidence/issue-17/ik-overlay.png',Buffer.from(result.overlay));const {frames,overlay,...report}=result;void frames;void overlay;writeFileSync('evidence/issue-17/ik-results.json',JSON.stringify(report,null,2)+'\n');
});
