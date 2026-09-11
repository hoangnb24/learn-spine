import {test,expect} from '@playwright/test';
import {createServer,type ViteDevServer} from 'vite';
import type {createStorage} from '../../src/storage';
import type {ProjectBundle} from '../../src/model';
declare global {interface Window {storageHarness:{createStorage:typeof createStorage;fixture:(revision?:number)=>Promise<ProjectBundle>}}}
let server:ViteDevServer;
test.beforeAll(async()=>{server=await createServer({server:{host:'127.0.0.1',port:4181,strictPort:true}});await server.listen();});
test.afterAll(async()=>{await server.close();});
test.beforeEach(async({page})=>{await page.goto('http://127.0.0.1:4181/tests/storage/harness.html');await page.waitForFunction(()=>!!window.storageHarness);});
test('actual PNG ZIP bytes and committed IndexedDB survive reload',async({page})=>{
  const expected=await page.evaluate(async()=>{
    const {createStorage,fixture}=window.storageHarness,s=createStorage({databaseName:'roundtrip'}),b=await fixture(7),p=await s.pack(b);
    if(!p.ok)throw Error(JSON.stringify(p));const u=await s.unpack(p.value);if(!u.ok)throw Error(JSON.stringify(u));
    const saved=await s.autosave(u.value);if(!saved.ok)throw Error(JSON.stringify(saved));
    return {json:b.project,bytes:Array.from(b.assets.get('art')!),unpacked:Array.from(u.value.assets.get('art')!)};
  });
  expect(expected.unpacked).toEqual(expected.bytes);await page.reload();await page.waitForFunction(()=>!!window.storageHarness);
  const recovered=await page.evaluate(async()=>{const r=await window.storageHarness.createStorage({databaseName:'roundtrip'}).recover('synthetic');if(!r.ok||!r.value)throw Error(JSON.stringify(r));return {json:r.value.project,bytes:Array.from(r.value.assets.get('art')!)};});
  expect(recovered).toEqual({json:expected.json,bytes:expected.bytes});
});
test('newer save wins delayed older validation; snapshot bytes isolated',async({page})=>{
  const r=await page.evaluate(async()=>{
    const {createStorage,fixture}=window.storageHarness;let release!:()=>void,started!:()=>void;
    const ready=new Promise<void>(r=>started=r),gate=new Promise<void>(r=>release=r);
    const old=createStorage({databaseName:'race',decodePng:async(bytes)=>{started();await gate;const image=await createImageBitmap(new Blob([bytes.slice()]));const d={width:image.width,height:image.height};image.close();return d;}});
    const b=await fixture(1),pending=old.autosave(b);await ready;b.assets.get('art')!.fill(0);b.project.metadata.name='mutated';
    const next=createStorage({databaseName:'race'}),saved=await next.autosave(await fixture(2));release();const stale=await pending,latest=await next.recover('synthetic');
    return {saved,stale,revision:latest.ok?latest.value?.project.revision:null};
  });expect(r.saved).toMatchObject({ok:true,value:{revision:2}});expect(r.stale).toMatchObject({ok:false,error:{code:'REVISION_CONFLICT'}});expect(r.revision).toBe(2);
});
test('real transaction abort/quota/write failure preserve prior committed project',async({page})=>{
  const result=await page.evaluate(async()=>{
    const {createStorage,fixture}=window.storageHarness,s=createStorage({databaseName:'failures'});await s.autosave(await fixture(1));
    const put=IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put=function(){throw new DOMException('Test injected quota exhaustion','QuotaExceededError');};
    const quota=await s.autosave(await fixture(2));IDBObjectStore.prototype.put=put;
    IDBObjectStore.prototype.put=function(value,key){const r=put.call(this,value,key);this.transaction.abort();return r;};
    const interrupted=await s.autosave(await fixture(3));IDBObjectStore.prototype.put=put;
    const abort=new AbortController();IDBObjectStore.prototype.put=function(value,key){const r=put.call(this,value,key);abort.abort();return r;};
    const cancelled=await s.autosave(await fixture(4),abort.signal);IDBObjectStore.prototype.put=put;
    const recovery=await s.recover('synthetic');return {quota,interrupted,cancelled,revision:recovery.ok?recovery.value?.project.revision:null};
  });expect(result.quota).toMatchObject({ok:false,error:{code:'STORAGE_FAILED'}});expect(result.interrupted).toMatchObject({ok:false,error:{code:'STORAGE_FAILED'}});expect(result.cancelled).toMatchObject({ok:false,error:{code:'CANCELLED'}});expect(result.revision).toBe(1);
});
test('hash, IHDR and actual decoder validation reject corrupt images',async({page})=>{
  const result=await page.evaluate(async()=>{
    const {createStorage,fixture}=window.storageHarness,s=createStorage(),b=await fixture();b.assets.get('art')![50]^=1;const hash=await s.validateBundle(b);
    b.project.assets[0].sha256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b.assets.get('art')!.slice())),v=>v.toString(16).padStart(2,'0')).join('');
    const decode=await s.validateBundle(b),wrong=await fixture();wrong.project.assets[0].pixelWidth=1;
    return {hash,decode,dimensions:await s.validateBundle(wrong)};
  });expect(result.hash).toMatchObject({ok:false,error:{code:'ASSET_HASH_MISMATCH'}});expect(result.decode).toMatchObject({ok:false,error:{code:'ASSET_DECODE_FAILED'}});expect(result.dimensions).toMatchObject({ok:false,error:{code:'ASSET_DECODE_FAILED'}});
});
