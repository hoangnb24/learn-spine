import {test,expect} from '@playwright/test';
import {writeFileSync,mkdirSync} from 'node:fs';
const out='evidence/issue-9';
test('real WebGL pixels, lifecycle, robot extremes and timings',async({page,browser})=>{
 await page.goto('/tests/render/browser/');await page.waitForFunction(()=>!!(window as any).harness);
 const result=await page.evaluate(async()=>{
 const h=(window as any).harness,r=h.renderer,u=h.unwrap,v={...h.viewport};
 const bundle=await h.synthetic();u(await r.prepare(bundle));const pose=u(h.evaluate(bundle.project,{animationId:null,time:0}));
 async function pixel(p:any,view:any,x:number,y:number){const bytes=u(await r.capture(p,view));const image=await createImageBitmap(new Blob([bytes],{type:'image/png'}));const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d')!;ctx.drawImage(image,0,0);image.close();return {color:[...ctx.getImageData(x,y,1,1).data],width:c.width,height:c.height};}
 const red=await pixel(pose,v,270,220),green=await pixel(pose,v,330,220),blue=await pixel(pose,v,270,260),alpha=await pixel(pose,v,330,260),empty=await pixel(pose,v,100,100);
 const syntheticPng=[...u(await r.capture(pose,v))];
 const fractional=await pixel(pose,{...v,width:101.3,height:99.7,devicePixelRatio:1.5,background:'#10203080'},151,149);
 const half=await h.synthetic(true);u(await r.prepare(half));const halfRed=await pixel(pose,v,270,220);
 const dpr=await pixel(pose,{...v,devicePixelRatio:2},540,440);
 bundle.project.bones[0].setup={x:30,y:20,rotation:Math.PI/2,scaleX:2,scaleY:1};u(await r.prepare(bundle));const rotated=u(h.evaluate(bundle.project,{animationId:null,time:0}));const rotation=await pixel(rotated,v,250,400);

 const mirrorBundle=await h.synthetic();mirrorBundle.project.bones[0].setup.scaleX=-1;u(await r.prepare(mirrorBundle));const mirrorPose=u(h.evaluate(mirrorBundle.project,{animationId:null,time:0}));const mirror=await pixel(mirrorPose,v,370,220);
 mirrorBundle.project.bones[0].setup.scaleX=0;u(await r.prepare(mirrorBundle));const zero=await pixel(u(h.evaluate(mirrorBundle.project,{animationId:null,time:0})),v,320,220);
 const layered=await h.synthetic();layered.project.attachments.push({...structuredClone(layered.project.attachments[0]),id:'front',transform:{x:60,y:0,rotation:0,scaleX:1,scaleY:1}});layered.project.slots.push({id:'front',name:'front',boneId:'root',attachmentId:'front'});u(await r.prepare(layered));const front=await pixel(u(h.evaluate(layered.project,{animationId:null,time:0})),v,330,220);
 layered.project.slots.reverse();u(await r.prepare(layered));const reversed=await pixel(u(h.evaluate(layered.project,{animationId:null,time:0})),v,330,220);
 u(await r.prepare(bundle));
 const missing=await r.prepare({...bundle,assets:new Map()});const retained=r.diagnostics.textureCount;const stillDraw=r.draw(rotated,v);
 const bad=structuredClone(rotated);bad.revision++;const stale=r.draw(bad,v);
 const wrongHash=structuredClone(bundle.project);wrongHash.assets[0].sha256='0'.repeat(64);const hashFailure=await r.prepare({...bundle,project:wrongHash});
 const abort=new AbortController();abort.abort();const cancelled=await r.prepare(bundle,abort.signal);
 const bot=await h.robot();const before=JSON.stringify(bot.project);u(await r.prepare(bot));
 const poses=[];for(let i=0;i<=24;i++){const p=structuredClone(bot.project);p.bones.find((b:any)=>b.id==='upper-arm-right').setup.rotation=i*Math.PI/12;poses.push(u(h.evaluate(p,{animationId:null,time:0})));}
 const fitted=u(h.fitCamera(bot.project,poses,{...v,width:1280,height:720,background:'#263442'},32));
 const contact=document.createElement('canvas');contact.width=1280;contact.height=720;const ctx=contact.getContext('2d')!;
 for(let i=0;i<25;i++){const png=u(await r.capture(poses[i],fitted.viewport));const bitmap=await createImageBitmap(new Blob([png],{type:'image/png'}));ctx.drawImage(bitmap,(i%5)*256,Math.floor(i/5)*144,256,144);bitmap.close();}
 const contactPng=[...new Uint8Array(await (await new Promise<Blob>(resolve=>contact.toBlob(b=>resolve(b!)))).arrayBuffer())];
 const samples=[];for(let i=0;i<360;i++){const start=performance.now();u(r.draw(poses[i%poses.length],fitted.viewport));if(i>=60)samples.push(performance.now()-start);}
 samples.sort((a,b)=>a-b);u(r.draw(poses[9],fitted.viewport));
 const robotPng=[...u(await r.capture(poses[9],fitted.viewport))];
 const resized=u(h.fitCamera(bot.project,poses,{...v,width:420,height:640,devicePixelRatio:2,background:'#263442'},24));u(r.draw(poses[18],resized.viewport));const resizePng=[...u(await r.capture(poses[18],resized.viewport))];
 const canvas=r.canvas,gl=canvas.getContext('webgl2')||canvas.getContext('webgl');const ext=gl!.getExtension('WEBGL_debug_renderer_info');
 const gpu=ext?gl!.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl!.getParameter(gl!.RENDERER);
 const frameMetadata=r.frameMetadata;const textureCount=r.diagnostics.textureCount;const unchanged=before===JSON.stringify(bot.project);
 r.dispose();const disposed=r.diagnostics;const afterDispose=r.draw(poses[0],v);
 return {frameMetadata,hashFailure,fractional,syntheticPng,contactPng,mirror,zero,front,reversed,red,green,blue,alpha,empty,halfRed,dpr,rotation,missing,retained,stillDraw,stale,cancelled,textureCount,unchanged,disposed,afterDispose,robotPng,resizePng,gpu,userAgent:navigator.userAgent,fit:fitted,resizeFit:resized,performance:{kind:'CPU update plus WebGL submission, not GPU completion',warmup:60,samples:300,p50:samples[150],p95:samples[285],max:samples[299]}};
 });
 expect(result.red.color).toEqual([255,0,0,255]);expect(result.green.color).toEqual([0,255,0,255]);expect(result.blue.color).toEqual([0,0,255,255]);expect(result.alpha.color[3]).toBe(128);expect(result.empty.color[3]).toBe(0);expect(result.halfRed).toEqual(result.red);expect(result.dpr).toEqual({color:[255,0,0,255],width:1280,height:1280});expect(result.rotation.color).toEqual([255,0,0,255]);
 expect(result.hashFailure.error.code).toBe('ASSET_HASH_MISMATCH');expect(result.fractional.width).toBe(152);expect(result.fractional.height).toBe(150);expect(result.fractional.color[3]).toBe(128);expect(result.frameMetadata.pixelWidth).toBe(840);
 expect(result.mirror.color).toEqual([255,0,0,255]);expect(result.zero.color[3]).toBe(0);expect(result.front.color).toEqual([255,0,0,255]);expect(result.reversed.color).toEqual([0,255,0,255]);
 expect(result.missing.error.code).toBe('MISSING_REFERENCE');expect(result.retained).toBe(1);expect(result.stillDraw.ok).toBe(true);expect(result.stale.ok).toBe(false);expect(result.cancelled.error.code).toBe('CANCELLED');expect(result.textureCount).toBe(15);expect(result.unchanged).toBe(true);expect(result.disposed.textureCount).toBe(0);expect(result.afterDispose.ok).toBe(false);
 mkdirSync(out,{recursive:true});writeFileSync(`${out}/robot-extreme.png`,Buffer.from(result.robotPng));writeFileSync(`${out}/robot-resize.png`,Buffer.from(result.resizePng));writeFileSync(`${out}/synthetic.png`,Buffer.from(result.syntheticPng));writeFileSync(`${out}/robot-contact.png`,Buffer.from(result.contactPng));const {robotPng,resizePng,syntheticPng,contactPng,...data}=result;void robotPng;void resizePng;void syntheticPng;void contactPng;writeFileSync(`${out}/browser-results.json`,JSON.stringify({browserVersion:browser.version(),...data},null,2));
});
