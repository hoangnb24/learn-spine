import { test,expect } from '@playwright/test';
import { createServer,type ViteDevServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { mkdir,writeFile } from 'node:fs/promises';
let server:ViteDevServer;
test.beforeAll(async()=>{server=await createServer({root:fileURLToPath(new URL('../../..',import.meta.url)),server:{host:'127.0.0.1',port:4198,strictPort:true}});await server.listen();});
test.afterAll(async()=>{await server.close();});
test('composition browser bridge: actual PNGs, snapshots, frozen transition, playback, legacy and cleanup (not native)',async({page},info)=>{
  test.setTimeout(120_000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4198/tests/composition/browser/index.html');
  await expect(page.locator('#state')).toContainText('Revision 0');
  const result=await page.evaluate(async()=>{
    const path='/evidence/issue-74/native-scenario.mjs';
    const {runNativeScenario}=await import(/* @vite-ignore */path);
    return runNativeScenario((name:string,input:unknown)=>(window as any).adapterHarness.bridge.dispatch(name,input),{expectedTransport:'bridge'});
  });
  expect(result.classification).toBe('browser-bridge-not-native');
  const rendererMetadata=await page.evaluate(async()=>{
    const adapter=(window as any).adapterHarness,h=(window as any).harness;
    const p=adapter.session.inspect(),scope={sessionId:adapter.session.sessionId,projectId:p.projectId};
    const result=await adapter.bridge.dispatch('evaluate_pose',{...scope,target:{kind:'composition',compositionId:'motion'},time:2.5});
    if(!result.ok)throw Error(JSON.stringify(result));
    const prepared=await h.renderer.prepare(adapter.session.snapshot());if(!prepared.ok)throw Error(JSON.stringify(prepared));
    const draw=h.renderer.draw(result.value,{...h.viewport,centerX:200,centerY:330,zoom:.7});if(!draw.ok)throw Error(JSON.stringify(draw));
    const metadata=h.renderer.frameMetadata;
    const stale=h.renderer.draw({...result.value,revision:0},h.viewport);
    return {metadata,stale};
  });
  expect(rendererMetadata.metadata).toMatchObject({target:{kind:'composition',compositionId:'motion'},sampledTime:.5,revision:3});
  expect(rendererMetadata.metadata).not.toHaveProperty('animationId');
  expect(rendererMetadata.stale).toMatchObject({ok:false,error:{code:'INVALID_INPUT'}});
  const out=info.outputPath('composition');await mkdir(out,{recursive:true});
  let imageCount=0;
  for(const entry of result.log){
    const image=entry.result.ok?entry.result.value.image:undefined;
    if(image){
      const bytes=Buffer.from(image.data,'base64');expect(bytes.subarray(1,4).toString()).toBe('PNG');
      await writeFile(`${out}/frame-${String(imageCount++).padStart(2,'0')}.png`,bytes);
      entry.result.value.image={mimeType:image.mimeType,byteLength:bytes.length};
    }
  }
  expect(imageCount).toBe(18);
  await writeFile(`${out}/browser-bridge-log.json`,JSON.stringify(result,null,2));
  await page.getByRole('button',{name:'Play collected frames',exact:true}).click();
  const before=await page.locator('#observation').getAttribute('src');
  await expect.poll(()=>page.locator('#observation').getAttribute('src')).not.toBe(before);
  await page.getByRole('button',{name:'Pause collected frames',exact:true}).click();
  await page.screenshot({path:`${out}/composition-browser.png`,fullPage:true});
  // Read ZIP through the public artifact download URLs already returned by the adapter.
  const archives=await page.evaluate(async()=>{
    const log=(window as any).adapterHarness.events;
    const urls=log.filter((e:any)=>e.name==='read_artifact'&&e.result.ok&&e.result.value.mimeType==='application/zip').map((e:any)=>e.result.value.url);
    return Promise.all(urls.map(async(url:string)=>Array.from(new Uint8Array(await(await fetch(url)).arrayBuffer()))));
  });
  expect(archives).toHaveLength(2);
  for(let i=0;i<archives.length;i++)await writeFile(`${out}/sequence-${i}.zip`,Buffer.from(archives[i] as number[]));
  expect(errors).toEqual([]);
  await info.attach('composition browser bridge log',{path:`${out}/browser-bridge-log.json`,contentType:'application/json'});
  await info.attach('composition browser screenshot',{path:`${out}/composition-browser.png`,contentType:'image/png'});
});
