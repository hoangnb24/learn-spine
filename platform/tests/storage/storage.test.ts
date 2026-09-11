import { describe,it,expect } from 'vitest';
import { deflateRawSync } from 'node:zlib';
import { createStorage } from '../../src/storage';
import { crc32,zip,unzip,MAX_BYTES } from '../../src/storage/zip';
import { createSyntheticProject } from '../../fixtures/model/synthetic';
const text=(s:string)=>new TextEncoder().encode(s);
const bundle=()=>{const project=createSyntheticProject();project.assets=[];project.attachments=[];project.slots=[];return {project,assets:new Map<string,Uint8Array>()};};
const storage=createStorage();
const code=async(p:Promise<unknown>,expected:string)=>expect(await p).toMatchObject({ok:false,error:{code:expected}});
describe('portable ZIP boundary',()=>{
  it('roundtrips complete JSON preserving identity and revision',async()=>{
    const b=bundle(); b.project.revision=42;const packed=await storage.pack(b);expect(packed.ok).toBe(true);if(!packed.ok)return;
    const read=await storage.unpack(packed.value);expect(read).toEqual({ok:true,value:b,warnings:[]});expect(b.project.revision).toBe(42);
  });
  it('rejects broken, unexpected, missing and unsafe entries',async()=>{
    await code(storage.unpack(text('not zip')),'INVALID_INPUT');
    await code(storage.unpack(zip(new Map([['../evil',text('x')]]))),'UNSAFE_PATH');
    await code(storage.unpack(zip(new Map([['project.json',text(JSON.stringify(bundle().project))],['assets/extra.png',text('x')]]))),'INVALID_INPUT');
    await code(storage.unpack(zip(new Map())),'MISSING_REFERENCE');
    const p=createSyntheticProject(); await code(storage.unpack(zip(new Map([['project.json',text(JSON.stringify(p))]]))),'INVALID_INPUT');
  });
  it('rejects unsupported versions and duplicate JSON keys before migration',async()=>{
    const p=JSON.stringify(bundle().project);
    await code(storage.unpack(zip(new Map([['project.json',text(p.replace('"formatVersion":0','"formatVersion":1'))]]))),'UNSUPPORTED_VERSION');
    await code(storage.unpack(zip(new Map([['project.json',text(p.replace('"revision":0','"revision":0,"revision":1'))]]))),'INVALID_INPUT');
  });
  it('rejects duplicate central paths, symlinks, encryption, sizes and CRC corruption',async()=>{
    const original=zip(new Map([['assets/aaa.png',text('abc')],['assets/bbb.png',text('def')]]));
    const duplicate=original.slice();const ascii=new TextDecoder().decode(duplicate);for(let i=0;i<ascii.length;i++) if(ascii.slice(i,i+14)==='assets/bbb.png') duplicate.set(text('assets/aaa.png'),i);
    // Replace all occurrences using byte search (names are 14 bytes).
    for(let i=0;i<duplicate.length-13;i++) if(new TextDecoder().decode(duplicate.subarray(i,i+14))==='assets/bbb.png')duplicate.set(text('assets/aaa.png'),i);
    await expect(unzip(duplicate)).rejects.toThrow();
    const base=zip(new Map([['project.json',text('{}')]]));const central=30+12+2;
    const mutation=(at:number,n:number)=>{const b=base.slice();new DataView(b.buffer).setUint32(at,n,true);return b;};
    await expect(unzip(mutation(central+38,0xa0000000))).rejects.toThrow();
    await expect(unzip(mutation(central+8,1))).rejects.toThrow();
    await expect(unzip(mutation(central+24,MAX_BYTES+1))).rejects.toMatchObject({code:'LIMIT_EXCEEDED'});
    const corrupt=base.slice();corrupt[42]^=1;await expect(unzip(corrupt)).rejects.toThrow();
  });
  it('streams deflate and rejects actual expansion beyond declared size',async()=>{
    const content=text('a'.repeat(100000)); const compressed=deflateRawSync(content);
    const name=text('project.json'),out=new Uint8Array(30+name.length+compressed.length+46+name.length+22),v=new DataView(out.buffer),c=30+name.length+compressed.length,e=c+46+name.length;
    v.setUint32(0,0x04034b50,true);v.setUint16(8,8,true);v.setUint32(14,crc32(content),true);v.setUint32(18,compressed.length,true);v.setUint32(22,content.length,true);v.setUint16(26,name.length,true);out.set(name,30);out.set(compressed,42);
    v.setUint32(c,0x02014b50,true);v.setUint16(c+10,8,true);v.setUint32(c+16,crc32(content),true);v.setUint32(c+20,compressed.length,true);v.setUint32(c+24,content.length,true);v.setUint16(c+28,name.length,true);out.set(name,c+46);
    v.setUint32(e,0x06054b50,true);v.setUint16(e+8,1,true);v.setUint16(e+10,1,true);v.setUint32(e+12,58,true);v.setUint32(e+16,c,true);
    expect((await unzip(out)).get('project.json')).toEqual(content);
    v.setUint32(22,10,true);v.setUint32(c+24,10,true);await expect(unzip(out)).rejects.toMatchObject({code:'LIMIT_EXCEEDED'});
  });
  it('returns cancellation and unavailable storage as Results',async()=>{
    const abort=new AbortController();abort.abort();await code(storage.pack(bundle(),abort.signal),'CANCELLED');await code(storage.recover('synthetic'),'STORAGE_FAILED');
  });
});
