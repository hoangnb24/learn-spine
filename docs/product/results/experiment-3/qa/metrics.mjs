/** Canonical post-run read-only geometry checks from the actually reopened ZIP. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),repo=resolve(here,'../../../../..'),run=process.argv[2];
const {createServer}=await import(pathToFileURL(resolve(repo,'platform/node_modules/vite/dist/node/index.js')));
const server=await createServer({configFile:false,root:resolve(repo,'platform'),server:{middlewareMode:true},appType:'custom',logLevel:'error'});
try {
 const {evaluate}=await server.ssrLoadModule('/src/engine/index.ts'),{corners,screenPoint}=await server.ssrLoadModule('/src/render/geometry.ts');
 const directory=resolve(here,'../runs',run),p=JSON.parse(readFileSync(resolve(directory,'reopen/editor-snapshot.json'))).project;
 const report=JSON.parse(readFileSync(resolve(directory,'reopen/report.json'))),output={run,sourceRevision:p.revision,animations:{}};
 const rows=readFileSync(resolve(directory,'events.jsonl'),'utf8').trim().split('\n').map(s=>JSON.parse(s).event);
 const render=rows.filter(r=>r.kind==='tool'&&r.name==='render_pose'&&r.afterRevision===p.revision).at(-1);
 for(const anim of p.animations){
  const times=[...new Set([...Array.from({length:61},(_,i)=>i*anim.duration/60),...anim.channels.flatMap(c=>c.keys.map(k=>k.time)),...(anim.deforms??[]).flatMap(d=>d.keys.map(k=>k.time))])].sort((a,b)=>a-b);
  const copy={...p,animations:p.animations.map(a=>a.id===anim.id?{...a,loop:false}:a)};
  const viewport=render?.input.viewport??report.results.player.animations[anim.id].poses[0].viewport;
  let outside=0,total=0;const bounds={minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};
  for(const time of times){const e=evaluate(copy,{animationId:anim.id,time});if(!e.ok)throw Error(JSON.stringify(e));
   const points=e.value.regions.flatMap(r=>corners(p.attachments.find(a=>a.id===r.attachmentId),p.assets.find(a=>a.id===r.assetId),r.world)).concat(e.value.meshes.flatMap(m=>m.vertices));
   for(let i=0;i<points.length;i+=2){const [x,y]=screenPoint(points[i],points[i+1],viewport);bounds.minX=Math.min(bounds.minX,x);bounds.maxX=Math.max(bounds.maxX,x);bounds.minY=Math.min(bounds.minY,y);bounds.maxY=Math.max(bounds.maxY,y);total++;if(x<0||y<0||x>viewport.width||y>viewport.height)outside++;}
  }
  let maxPoseNumericDelta=0;const walk=(a,b)=>{if(typeof a==='number'&&typeof b==='number')maxPoseNumericDelta=Math.max(maxPoseNumericDelta,Math.abs(a-b));else if(a&&b&&typeof a==='object'&&typeof b==='object')for(const k of Object.keys(a))walk(a[k],b[k]);else if(a!==b)throw Error('Pose structure differs');};
  report.results.editor.animations[anim.id].poses.forEach((v,i)=>walk(v.pose,report.results.player.animations[anim.id].poses[i].pose));
  output.animations[anim.id]={sampleTimes:times,viewport,bounds,totalGeometryPoints:total,outsideViewportPoints:outside,editorPlayerMaxNumericDelta:maxPoseNumericDelta,editorPlayerWithin1e5:maxPoseNumericDelta<=1e-5};
 }
 writeFileSync(resolve(directory,'geometry-audit.json'),JSON.stringify(output,null,2)+'\n');
}finally{await server.close();}
