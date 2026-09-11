/** Read-only post-run QA in separate headless browser. Never native-agent evidence. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)), repo=resolve(here,'../../../../..');
const { chromium }=await import(pathToFileURL(resolve(repo,'platform/node_modules/playwright/index.mjs')));
const run=process.argv[2], filename=process.argv[3];
if(!run||!filename)throw Error('Usage: node reopen.mjs <run> <saved-project-filename>');
const directory=resolve(here,'../runs',run), archive=resolve(directory,filename), out=resolve(directory,'reopen');mkdirSync(out,{recursive:true});
const events=readFileSync(resolve(directory,'events.jsonl'),'utf8').trim().split('\n').map(s=>JSON.parse(s).event);
const stop=events.filter(e=>e.kind==='stop').at(-1);if(!stop)throw Error('No instrumented stop; record explicit missing evidence instead of QA pass');
const browser=await chromium.launch({headless:true}), report={kind:'post-run read-only browser QA, not a subject or native invocation',run,archive:filename,sourceRevision:stop.project.revision,browser:browser.version(),results:{}};
try {
 for(const app of ['editor','player']){
  const context=await browser.newContext({viewport:{width:1600,height:1100},deviceScaleFactor:1});const page=await context.newPage();
  await page.goto(`http://127.0.0.1:4210/${app==='editor'?'index.html':'player.html'}`);
  await page.evaluate(async()=>{
   const renderer=await import('/src/render/index.ts');
   const state={prepared:null,latest:null,draws:[],record:false};window.qa=state;
   const prepare=renderer.PixiRenderer.prototype.prepare,draw=renderer.PixiRenderer.prototype.draw;
   renderer.PixiRenderer.prototype.prepare=async function(bundle){const result=await prepare.call(this,bundle);if(result.ok)state.prepared={project:structuredClone(bundle.project),assets:Array.from(bundle.assets,([id,bytes])=>({id,bytes:Array.from(bytes)}))};return result;};
   renderer.PixiRenderer.prototype.draw=function(pose,viewport){const result=draw.call(this,pose,viewport);if(result.ok){state.latest={pose:structuredClone(pose),viewport:structuredClone(viewport)};if(state.record)state.draws.push({time:pose.sampledTime,revision:pose.revision,animationId:pose.animationId});}return result;};
  });
  await page.getByLabel('Mở gói project',{exact:true}).setInputFiles(archive);
  await page.waitForFunction(()=>window.qa?.prepared&&window.qa?.latest);
  const snapshot=await page.evaluate(async()=>({project:window.qa.prepared.project,assets:await Promise.all(window.qa.prepared.assets.map(async a=>({id:a.id,sha256:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(a.bytes))),b=>b.toString(16).padStart(2,'0')).join('')})))}));
  const result={sameProjectAsStop:JSON.stringify(snapshot.project)===JSON.stringify(stop.project),assetHashesMatch:snapshot.assets.every(a=>snapshot.project.assets.find(x=>x.id===a.id)?.sha256===a.sha256),animations:{}};
  report.results[app]=result;writeFileSync(resolve(out,`${app}-snapshot.json`),JSON.stringify(snapshot,null,2));
  if(!result.sameProjectAsStop||!result.assetHashesMatch)throw Error(`${app} reopen mismatch`);
  for(const animation of snapshot.project.animations){
   if(app==='editor'){await page.getByRole('button',{name:'Animate',exact:true}).click();await page.getByRole('button',{name:animation.name,exact:true}).click();await page.getByRole('button',{name:'Vừa khung',exact:true}).click();}
   else await page.getByLabel('Chọn chuyển động').selectOption(animation.id);
   const poses=[];
   for(let i=0;i<12;i++){
    const time=i*animation.duration/12;
    if(app==='editor')await page.getByLabel('Thời gian (giây)',{exact:true}).fill(String(time));
    else await page.getByLabel('Thanh thời gian',{exact:true}).evaluate((node,value)=>{node.setAttribute('step','any');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(node,String(value));node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}));},time);
    await page.waitForFunction(({id,time})=>window.qa.latest.pose.animationId===id&&Math.abs(window.qa.latest.pose.sampledTime-time)<1e-5,{id:animation.id,time});
    poses.push(await page.evaluate(()=>window.qa.latest));
    await page.screenshot({path:resolve(out,`${app}-${animation.id}-${String(i).padStart(2,'0')}.png`)});
   }
   await page.evaluate(()=>{
    const canvas=document.querySelector('canvas'),stream=canvas.captureStream(30),chunks=[];
    const recorder=new MediaRecorder(stream,{mimeType:'video/webm'});window.qa.record=true;window.qa.draws=[];
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};window.qa.video={recorder,chunks,stream};recorder.start();
   });
   await page.getByRole('button',{name:'Phát',exact:true}).click();
   await page.waitForTimeout((animation.duration*3+.3)*1000);
   await page.getByRole('button',{name:'Tạm dừng',exact:true}).click();
   const playback=await page.evaluate(async()=>{window.qa.record=false;const v=window.qa.video;await new Promise(r=>{v.recorder.onstop=r;v.recorder.stop();});v.stream.getTracks().forEach(t=>t.stop());const data=await new Promise(r=>{const reader=new FileReader();reader.onload=()=>r(reader.result);reader.readAsDataURL(new Blob(v.chunks,{type:'video/webm'}));});return {draws:window.qa.draws,data};});
   writeFileSync(resolve(out,`${app}-${animation.id}.webm`),Buffer.from(playback.data.split(',')[1],'base64'));
   let wraps=0;for(let i=1;i<playback.draws.length;i++)if(playback.draws[i].time<playback.draws[i-1].time)wraps++;
   result.animations[animation.id]={poses,playbackDraws:playback.draws,wraps};
  }
  writeFileSync(resolve(out,`${app}-dom.txt`),await page.locator('body').innerText());await context.close();
 }
 writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2));
} finally {await browser.close();}
