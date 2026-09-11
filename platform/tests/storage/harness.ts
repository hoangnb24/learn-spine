import { createStorage } from '../../src/storage';
import { createSyntheticProject } from '../../fixtures/model/synthetic';
async function fixture(revision=0) {
  const canvas=document.createElement('canvas');canvas.width=2;canvas.height=3;
  const ctx=canvas.getContext('2d')!;ctx.fillStyle='#ff5500';ctx.fillRect(0,0,1,3);
  const blob=await new Promise<Blob>(resolve=>canvas.toBlob(b=>resolve(b!),'image/png'));
  const bytes=new Uint8Array(await blob.arrayBuffer()),project=createSyntheticProject();project.revision=revision;
  project.assets[0]={...project.assets[0],pixelWidth:2,pixelHeight:3,originalWidth:2,originalHeight:3,trimX:0,trimY:0,sha256:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('')};
  return {project,assets:new Map([['art',bytes]])};
}
Object.assign(window,{storageHarness:{createStorage,fixture}});
