import { test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { unzip } from '../../src/storage/zip';
import { validate } from '../../src/model';
import hashes from './initial/hashes.json';
test('locked inputs have matching hashes, valid model and semantic error only', async()=>{
 for(const brief of ['robot','wave','scarf'] as const){
  const bytes=new Uint8Array(readFileSync(new URL(`./initial/${brief}.zip`,import.meta.url)));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(hashes[brief].zipSha256);
  const entries=await unzip(bytes); const p=JSON.parse(new TextDecoder().decode(entries.get('project.json')!));
  expect(validate(p).ok).toBe(true); expect(p.revision).toBe(0);
  for(const a of p.assets)expect(createHash('sha256').update(entries.get(a.path)!).digest('hex')).toBe(a.sha256);
  if(brief==='robot'){expect(p.animations).toHaveLength(0);expect(p.bones).toHaveLength(1);expect(p.assets).toHaveLength(15);}
  if(brief==='wave')expect(p.animations.find((a:any)=>a.id==='wave').channels.some((c:any)=>c.boneId==='body')).toBe(true);
  if(brief==='scarf')expect(p.attachments[0].weights[0]).toEqual([{boneId:'mid',weight:1}]);
 }
});
