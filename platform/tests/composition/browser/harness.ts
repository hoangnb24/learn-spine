import '../../render/browser/harness';
import { createSession, prepareBundle, type Session } from '../../../src/commands';
import { createStorage, validateBundle } from '../../../src/storage';
import { ObservationService } from '../../../src/observation';
import { WebMCPBridge, registerWebMCP } from '../../../src/adapters/webmcp';
import type { ProjectBundle, Result, Json } from '../../../src/model';
const unwrap=<T>(r:Result<T>)=>{if(!r.ok)throw Error(JSON.stringify(r));return r.value;};
const h=(window as unknown as {harness:{robot():Promise<ProjectBundle>;renderer:import('../../../src/render').PixiRenderer;evaluate:typeof import('../../../src/engine').evaluate;fitCamera:typeof import('../../../src/render').fitCamera;viewport:import('../../../src/model').Viewport}}).harness;
const initial=await h.robot();
const session=unwrap(createSession(unwrap(await prepareBundle(initial,validateBundle))));
const storage=createStorage(),observation=new ObservationService();
const el=(id:string)=>document.getElementById(id)!;
el('scene').append(h.renderer.canvas);
let drawing=0;
async function draw(){
 const generation=++drawing,bundle=session.snapshot();
 const prepared=await h.renderer.prepare(bundle);if(generation!==drawing)return;unwrap(prepared);
 const pose=unwrap(h.evaluate(bundle.project,{animationId:bundle.project.animations[0]?.id??null,time:0.5}));
 const camera=unwrap(h.fitCamera(bundle.project,[pose],h.viewport));unwrap(h.renderer.draw(pose,camera.viewport));
 el('state').textContent=`Session ${session.sessionId} · Revision ${bundle.project.revision} · root x ${bundle.project.bones[0].setup.x} · ${bundle.project.animations.length} animations`;
}
const events:unknown[]=[];
const frames: string[]=[]; let playing=false, frame=0;
el('play').onclick=()=>{playing=!playing;el('play').textContent=playing?'Pause collected frames':'Play collected frames';};
setInterval(()=>{if(playing && frames.length)(el('observation') as HTMLImageElement).src=frames[frame++%frames.length];},125);

const bridge=new WebMCPBridge({getSession:()=>session,storage,observation,onDownload(d){const a=document.createElement('a');a.href=d.url;a.download=d.filename;a.textContent=`Download ${d.filename} · revision ${d.revision}`;el('downloads').append(a,document.createElement('br'));},onResult(name,input,result){
 const value=result.ok?result.value as Record<string,Json>:null;const image=value?.image as {data:string}|undefined;
 if(image){ const src=`data:image/png;base64,${image.data}`;frames.push(src);const thumb=document.createElement('img');thumb.src=src;thumb.width=140;thumb.alt=`${name} frame ${frames.length}`;el('frames').append(thumb);(el('observation') as HTMLImageElement).src=`data:image/png;base64,${image.data}`;el('observation-state').textContent=`Observation revision ${value?.revision}`;}
 events.push({at:new Date().toISOString(),name,input,result:image?{...result,value:{...value,image:{mimeType:'image/png',base64Length:image.data.length}}}:result});el('log').textContent=JSON.stringify(events,null,2);
}});
session.subscribe(()=>{bridge.refresh();void draw();});
el('user-edit').onclick=()=>{const p=session.inspect(),bone=p.bones[0];session.apply({projectId:p.projectId,expectedRevision:p.revision,requestId:crypto.randomUUID(),operations:[{kind:'putBone',value:{...bone,setup:{...bone.setup,x:bone.setup.x+10}}}]});};
el('reopen').onclick=async()=>{session.open(unwrap(await prepareBundle(initial,validateBundle)));};
const registration=await registerWebMCP(bridge);
el('connection').textContent=registration.ok?`${registration.value.transport} · ${bridge.definitions.length} tools registered · ${navigator.userAgent}`:registration.error.message;
el('dispose').onclick=async()=>{if(registration.ok)await registration.value.dispose();else bridge.dispose();el('connection').textContent='Disconnected';};
await draw();
Object.assign(window,{adapterHarness:{bridge,session,initial,storage,observation,events}} satisfies {adapterHarness:{bridge:WebMCPBridge;session:Session;initial:ProjectBundle;storage:ReturnType<typeof createStorage>;observation:ObservationService;events:unknown[]}});
