/** Post-run read-only scoring. This never touches a running page or writes a solution. */
import { test, expect } from 'vitest';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { unzip } from '../../src/storage/zip';
import { evaluate } from '../../src/engine';
import { measure_motion } from '../../src/diagnostics';
import type { Project } from '../../src/model';
const name=process.env.GATE3_RUN;
test.skipIf(!name)('score the observed final ZIP without changing it',async()=>{
 const directory=resolve('../docs/product/results/experiment-3/runs',name!);
 const summary=JSON.parse(readFileSync(resolve(directory,'summary.json'),'utf8'));
 const rows=readFileSync(resolve(directory,'events.jsonl'),'utf8').trim().split('\n').map(s=>JSON.parse(s).event);
 const saves=summary.media.filter((m:any)=>m.file.endsWith('.zip'));
 const final=saves.filter((m:any)=>{try {return existsSync(resolve(directory,m.file));}catch{return false;}}).at(-1);
 expect(final,'final saved project ZIP missing').toBeTruthy();
 const z=await unzip(new Uint8Array(readFileSync(resolve(directory,final.file))));
 expect(z.has('project.json'),'last ZIP must contain actual project').toBe(true);
 const p:Project=JSON.parse(new TextDecoder().decode(z.get('project.json')!));
 const initial=rows.find((r:any)=>r.kind==='setup').project;
 const stopped=rows.filter((r:any)=>r.kind==='stop').at(-1);
 const output:any={revision:p.revision,finalFile:final.file,exactStopProject:JSON.stringify(p)===JSON.stringify(stopped?.project),dataCriteria:{},visual:'pending reviewer',reopen:'pending actual browser'};
 if(name!.startsWith('wave')){
  const allowed=new Set(['upper-arm-right/rotation','forearm-right/rotation','hand-right/rotation']);
  const clean=(project:Project)=>({...project,revision:0,animations:project.animations.map(a=>a.id==='wave'?{...a,channels:a.channels.filter(c=>!allowed.has(`${c.boneId}/${c.property}`))}:a)});
  output.dataCriteria.preserved=JSON.stringify(clean(p))===JSON.stringify(clean(initial));
 }
 if(name!.startsWith('scarf')){
  const setup=evaluate(p,{animationId:null,time:0});expect(setup.ok).toBe(true);if(!setup.ok)return;
  const root=setup.value.bones.root, norm=Math.hypot(root[2],root[3]),axis=[root[2]/norm,root[3]/norm];
  const signals={mid:[] as number[],tip:[] as number[]};
  for(let i=0;i<1000;i++){
   const pose=evaluate(p,{animationId:'cycle',time:i*2/1000});expect(pose.ok).toBe(true);if(!pose.ok)return;
   for(const id of ['mid','tip'] as const){const b=pose.value.bones[id];signals[id].push(b[4]*axis[0]+b[5]*axis[1]);}
  }
  const stats=Object.fromEntries(Object.entries(signals).map(([id,v])=>[id,{amplitude:Math.max(...v)-Math.min(...v),peakTime:v.indexOf(Math.max(...v))*2/1000}]));
  const lag=(stats.tip.peakTime-stats.mid.peakTime+2)%2;
  const mesh=setup.value.meshes[0],anchors=Array.from({length:5},(_,r)=>[0,1].map(c=>r*17+c)).flat().map(vertex=>({id:`neck-${vertex}`,point:{kind:'vertex' as const,slotId:mesh.slotId,vertex},target:[mesh.vertices[vertex*2],mesh.vertices[vertex*2+1]] as [number,number]}));
  const diagnostics=measure_motion(p,{animationId:'cycle',anchors});
  output.phase={stats,lag};output.diagnostics=diagnostics;
  output.dataCriteria.phase=lag>=.20&&lag<=.35&&stats.mid.amplitude>=6&&stats.tip.amplitude>=6;
  const stable=(project:Project)=>({...project,revision:0,animations:[],attachments:project.attachments.map(a=>a.type==='mesh'?{...a,weights:a.weights.filter((_,i)=>i%17>1)}:a)});
  output.dataCriteria.preserved=JSON.stringify(stable(p))===JSON.stringify(stable(initial));
 }
 writeFileSync(resolve(directory,'data-score.json'),JSON.stringify(output,null,2)+'\n');
});
