import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createMeshProject } from '../../../fixtures/mesh/synthetic';

test('mesh v1 ZIP uses real PNG decode and unsupported rendering retains prior region', async ({page,browser}) => {
  await page.goto('/tests/render/browser/');
  await page.waitForFunction(()=>!!(window as any).harness);
  const result=await page.evaluate(async (project)=>{
    const h=(window as any).harness, old=await h.synthetic();
    h.unwrap(await h.renderer.prepare(old));
    const oldPose=h.unwrap(h.evaluate(old.project,{time:0,animationId:null}));
    project.assets=old.project.assets;
    const bundle={project,assets:old.assets};
    const path='/src/storage/index.ts';
    const {createStorage}=await import(/* @vite-ignore */ path);
    const storage=createStorage(), bytes=h.unwrap(await storage.pack(bundle));
    const reopened=h.unwrap(await storage.unpack(bytes));
    const before=h.unwrap(h.evaluate(project,{time:.5,animationId:'bend'}));
    const after=h.unwrap(h.evaluate(reopened.project,{time:.5,animationId:'bend'}));
    const unsupported=await h.renderer.prepare(reopened);
    const retained=h.renderer.draw(oldPose,h.viewport);
    return {sameProject:JSON.stringify(project)===JSON.stringify(reopened.project),samePose:JSON.stringify(before)===JSON.stringify(after),zipBytes:bytes.length,unsupported,retained,textureCount:h.renderer.diagnostics.textureCount};
  },createMeshProject());
  expect(result.sameProject).toBe(true);expect(result.samePose).toBe(true);expect(result.zipBytes).toBeGreaterThan(0);
  expect(result.unsupported).toMatchObject({ok:false,error:{code:'UNSUPPORTED_CAPABILITY'}});
  expect(result.retained.ok).toBe(true);expect(result.textureCount).toBe(1);
  mkdirSync('evidence/issue-15',{recursive:true});
  writeFileSync('evidence/issue-15/browser-boundary.json',JSON.stringify({browserVersion:browser.version(),...result},null,2)+'\n');
});
