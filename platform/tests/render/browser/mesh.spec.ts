import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='evidence/issue-17';
test('T01 mesh bind/deform/extreme, resolution, real observation and geometry update cost',async({page,browser})=>{
 test.setTimeout(90000);
 await page.goto('/tests/render/browser/');await page.waitForFunction(()=>!!(window as any).meshHarness);
 const result=await page.evaluate(async()=>{
  const h=(window as any).harness,m=(window as any).meshHarness,r=h.renderer,u=h.unwrap;
  const evidence:any[]=[];const reports:any[]=[];
  const v={...h.viewport,width:640,height:480,background:'#263442'};
  const encode=async(c:HTMLCanvasElement)=>[...new Uint8Array(await(await new Promise<Blob>(resolve=>c.toBlob(b=>resolve(b!)))).arrayBuffer())];
  const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=960;const ctx=canvas.getContext('2d')!;
  for(const [row,kind] of ['scarf','jelly'].entries()){
   const bundle=await m.bundle(kind),half=await m.bundle(kind,true),before=JSON.stringify(bundle.project);
   const semantic=(p:any)=>m.hash(new TextEncoder().encode(JSON.stringify({bones:p.bones,slots:p.slots,attachments:p.attachments,animations:p.animations})));
   const semanticBefore=await semantic(bundle.project),semanticAfter=await semantic(half.project);
   const poses=[0,.5,1].map(time=>u(h.evaluate(bundle.project,{animationId:'deform',time})));
   const halfPoses=[0,.5,1].map(time=>u(h.evaluate(half.project,{animationId:'deform',time})));
   const poseHashes=await Promise.all([poses,halfPoses].map(data=>m.hash(new TextEncoder().encode(JSON.stringify(data)))));
   const triangleAreas=poses.map((pose:any)=>{const xy=pose.meshes[0].vertices,tri=pose.meshes[0].triangles,areas=[];for(let i=0;i<tri.length;i+=3){const [a,b,c]=tri.slice(i,i+3).map((n:number)=>n*2);areas.push((xy[b]-xy[a])*(xy[c+1]-xy[a+1])-(xy[b+1]-xy[a+1])*(xy[c]-xy[a]));}return {min:Math.min(...areas),max:Math.max(...areas)};});
   const fit=u(h.fitCamera(bundle.project,poses,v));
   u(await r.prepare(bundle));
   const full:any[]=[];const pixelBounds:any[]=[];
   for(const [i,pose] of poses.entries()){
    const png=u(await r.capture(pose,fit.viewport));full.push([...png]);
    const bitmap=await createImageBitmap(new Blob([png]));ctx.drawImage(bitmap,i*640,row*480);bitmap.close();
    const xy=u(m.poseGeometry(bundle.project,pose))[0];pixelBounds.push({minX:Math.min(...xy.filter((_:number,i:number)=>i%2===0)),maxX:Math.max(...xy.filter((_:number,i:number)=>i%2===0)),minY:Math.min(...xy.filter((_:number,i:number)=>i%2===1)),maxY:Math.max(...xy.filter((_:number,i:number)=>i%2===1))});
    evidence.push({name:`${kind}-${['bind','deform','extreme'][i]}.png`,png:[...png]});
   }
   r.setOverlay({wireframe:true,weightBoneId:'tip'});evidence.push({name:`${kind}-weights.png`,png:[...u(await r.capture(poses[1],fit.viewport))]});r.setOverlay({});
   u(await r.prepare(half));
   const comparisons=[];
   for(const [i,pose] of poses.entries()){
    const png=u(await r.capture(pose,fit.viewport));evidence.push({name:`${kind}-half-${i}.png`,png:[...png]});
    const pixels=async(bytes:number[])=>{const bitmap=await createImageBitmap(new Blob([new Uint8Array(bytes)]));const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;const cx=c.getContext('2d')!;cx.drawImage(bitmap,0,0);bitmap.close();return cx.getImageData(0,0,c.width,c.height).data;};
    const a=await pixels(full[i]),b=await pixels([...png]);let absolute=0;for(let n=0;n<a.length;n++)absolute+=Math.abs(a[n]-b[n]);comparisons.push({meanAbsoluteRGBA:absolute/a.length});
   }
   const service=new m.ObservationService();
   const job=u(service.submit(bundle,{kind:'sequence',animationId:'deform',times:[0,.5,1],viewport:v}));
   let finished;for(let i=0;i<1000;i++){finished=u(service.get(job.id));if(!['queued','running'].includes(finished.status))break;await new Promise(resolve=>setTimeout(resolve,5));}
   if(finished.status!=='succeeded')throw Error(JSON.stringify(finished));
   const manifest=u(service.getManifest(job.id));
   for(const [i,frame] of manifest.frames.entries())evidence.push({name:`${kind}-observation-${i}.png`,png:[...u(await service.readArtifact(frame.artifactId))]});
   const direct=u(await service.renderPose(bundle,{animationId:'deform',time:.5,viewport:fit.viewport}));
   evidence.push({name:`${kind}-render-pose.png`,png:[...direct.png]});
   const zip=finished.artifacts.find((a:any)=>a.mimeType==='application/zip');evidence.push({name:`${kind}-observation.zip`,png:[...u(await service.readArtifact(zip.id))]});
   service.dispose();
   const samples=[];for(let i=0;i<360;i++){const start=performance.now();u(r.draw(poses[i%3],fit.viewport));if(i>=60)samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);
   reports.push({kind,semanticBefore,semanticAfter,poseHashes,triangleAreas,geometrySample:poses.map((pose:any)=>({time:pose.sampledTime,firstThreeVertices:pose.meshes[0].vertices.slice(0,6)})),unchanged:before===JSON.stringify(bundle.project),fit,pixelBounds,comparisons,manifest,directMetadata:direct.metadata,performance:{kind:'CPU geometry update and WebGL submission; not GPU completion or frame cadence',vertices:45,triangles:64,warmup:60,samples:300,p50:samples[150],p95:samples[285],max:samples[299]}});
  }
  evidence.push({name:'contact.png',png:await encode(canvas)});
  const gl=r.canvas.getContext('webgl2')||r.canvas.getContext('webgl'),ext=gl.getExtension('WEBGL_debug_renderer_info');const gpu=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
  const beforeDispose=r.diagnostics;r.dispose();r.dispose();return {reports,evidence,gpu,userAgent:navigator.userAgent,beforeDispose,disposed:r.diagnostics};
 });
 for(const report of result.reports){expect(report.semanticAfter).toBe(report.semanticBefore);expect(report.poseHashes[0]).toBe(report.poseHashes[1]);for(const area of report.triangleAreas)expect(area.max).toBeLessThan(-1);expect(report.unchanged).toBe(true);expect(report.manifest.frames).toHaveLength(3);for(const c of report.comparisons)expect(c.meanAbsoluteRGBA).toBeLessThan(3);for(const b of report.pixelBounds){const envelope=report.manifest.frames[0].bounds;expect(b.minX).toBeGreaterThanOrEqual(envelope.minX-1e-8);expect(b.maxX).toBeLessThanOrEqual(envelope.maxX+1e-8);expect(b.minY).toBeGreaterThanOrEqual(envelope.minY-1e-8);expect(b.maxY).toBeLessThanOrEqual(envelope.maxY+1e-8);}}
 expect(result.beforeDispose.geometryCount).toBe(1);expect(result.disposed).toMatchObject({geometryCount:0,textureCount:0,disposed:true});
 mkdirSync(out,{recursive:true});for(const f of result.evidence)writeFileSync(`${out}/${f.name}`,Buffer.from(f.png));const {evidence,...report}=result;void evidence;writeFileSync(`${out}/mesh-results.json`,JSON.stringify({browserVersion:browser.version(),...report},null,2)+'\n');
});
