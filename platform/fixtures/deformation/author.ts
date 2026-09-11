import type {Asset, Bone, Curve, Mesh, Operation, Project, Result} from '../../src/model';
import {prepareBundle} from '../../src/commands';
import {validateBundle} from '../../src/storage';
import {editorRuntime as runtime,identity} from '../../apps/editor/runtime';
import manifest from '../source/manifest.json';
export type Kind='scarf'|'jelly'|'ik';
const urls=import.meta.glob('../../../exercises/{robot/images/parts/*,soft-character/images/jelly}.png',{query:'?url',import:'default',eager:true}) as Record<string,string>;
export const unwrap=<T>(r:Result<T>):T=>{if(!r.ok)throw Error(JSON.stringify(r));return r.value;};
export const hash=async(b:Uint8Array)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(b))),v=>v.toString(16).padStart(2,'0')).join('');
export const log:unknown[]=[];
function apply(operations:Operation[],token?:Awaited<ReturnType<typeof prepareBundle>> extends Result<infer T>?T:never){
 const request={...runtime.request(),requestId:`gate2-${log.length}`,operations};
 const result=runtime.session!.apply(request,token);log.push({request,result});unwrap(result);
}
export async function texture(id:string,half=false):Promise<{asset:Asset;bytes:Uint8Array}>{
 const r=manifest.records.find(a=>a.id===id)!;
 let bytes=new Uint8Array(await(await fetch(urls[`../../../${r.path}`])).arrayBuffer());
 let width=r.pixelWidth!,height=r.pixelHeight!;
 if(await hash(bytes)!==r.sha256)throw Error('T01 source hash mismatch');
 if(half){const bitmap=await createImageBitmap(new Blob([bytes]));const c=document.createElement('canvas');c.width=Math.round(width/2);c.height=Math.round(height/2);c.getContext('2d')!.drawImage(bitmap,0,0,c.width,c.height);bitmap.close();bytes=new Uint8Array(await(await new Promise<Blob>(r=>c.toBlob(b=>r(b!)))).arrayBuffer());width=c.width;height=c.height;}
 return {bytes,asset:{id,name:id,path:`assets/${id}.png`,mimeType:'image/png',sha256:await hash(bytes),pixelWidth:width,pixelHeight:height,originalWidth:width,originalHeight:height,trimX:0,trimY:0}};
}
async function assets(ids:string[],half=false){
 const source=await Promise.all(ids.map(id=>texture(id,half))),candidate=runtime.session!.snapshot();
 for(const s of source){candidate.project.assets=candidate.project.assets.filter(a=>a.id!==s.asset.id).concat(s.asset);candidate.assets=new Map([...candidate.assets,[s.asset.id,s.bytes]]);}
 const token=unwrap(await prepareBundle(candidate,validateBundle));apply(source.map(s=>({kind:'putAsset',value:s.asset})),token);
}
const bone=(id:string,parentId:string|null='root',setup={}) : Bone=>({id,name:id,parentId,setup:{...identity(),...setup}});
const smooth:Curve={type:'bezier',x1:1/3,y1:0,x2:2/3,y2:1};
/** Periodic cubic Hermite interpolation; extrema at every quarter cycle. */
function sine(amplitude:number,delay=0){
 const times=[0,.5,1,1.5,2,...[0,.5,1,1.5,2].map(t=>t+delay).filter(t=>t>0&&t<2)].sort((a,b)=>a-b).filter((t,i,a)=>!i||t!==a[i-1]);
 return times.map((time,i)=>{const value=amplitude*Math.sin(Math.PI*(time-delay)),end=times[i+1];let curve:Curve={type:'linear'};
 if(end!==undefined){const next=amplitude*Math.sin(Math.PI*(end-delay)),d=next-value;curve=Math.abs(d)<1e-10?smooth:{type:'bezier',x1:1/3,x2:2/3,y1:amplitude*Math.PI*Math.cos(Math.PI*(time-delay))*(end-time)/3/d,y2:1-amplitude*Math.PI*Math.cos(Math.PI*(end-delay))*(end-time)/3/d};}
 return{time,value,curve};});
}
const xs=[0,.16,.30,.37,.44,.50,.56,.63,.70,.84,1],ys=[0,.14,.25,.35,.37,.46,.50,.60,.70,.80,.84,.86,1];
export const eyeROIs=[[474,466,542,576],[715,466,783,576]];
export async function author(kind:Kind){
 log.length=0;unwrap(await runtime.newProject(`Gate2 ${kind}`));log.push({newProject:runtime.session!.inspect()});
 await assets(kind==='ik'?['robot-thigh-left','robot-shin-left','robot-foot-left']:[kind]);
 if(kind==='ik'){
 const bones=[bone('hip',null),bone('shin','hip',{x:100}),bone('foot','shin',{x:100}),bone('target',null,{x:120,y:-100})];
 apply(bones.map(value=>({kind:'putBone',value})));
 const regions=['thigh','shin','foot'].flatMap((name,i):Operation[]=>[{kind:'putRegion',value:{id:name,type:'region',assetId:['robot-thigh-left','robot-shin-left','robot-foot-left'][i],transform:{...identity(),rotation:i===2?0:Math.PI/2},width:i===2?55:48,height:i===2?50:110,pivotX:i===2?27:24,pivotY:i===2?25:100}},{kind:'putSlot',value:{id:name,name,boneId:['hip','shin','foot'][i],attachmentId:name}}]);
 apply([...regions,{kind:'putIKConstraint',value:{id:'leg',type:'two-bone-ik',rootBoneId:'hip',childBoneId:'shin',targetBoneId:'target',endpoint:[100,0],bend:1,mix:1,order:0}},{kind:'putAnimation',value:{id:'cycle',name:'Cycle',duration:2,loop:true,channels:[{boneId:'hip',property:'y',keys:[{time:0,value:0,curve:smooth},{time:1,value:-30,curve:smooth},{time:2,value:0,curve:smooth}]}]}}]);
 }else{
 const scarf=kind==='scarf',us=scarf?Array.from({length:17},(_,i)=>i/16):xs,vs=scarf?[0,.25,.5,.75,1]:ys;
 const vertices:number[]=[],uvs:number[]=[],triangles:number[]=[],weights:Mesh['weights']=[];
 for(const v of vs)for(const u of us){vertices.push(scarf?u*153.6:(u-.5)*300,scarf?(.5-v)*57.6:(.855-v)*300);uvs.push(u,v);
 if(scarf){const t=Math.max(0,(u-1/16)/(15/16));weights.push(t<.5?[{boneId:'root',weight:1-t*2},{boneId:'mid',weight:t*2}]:[{boneId:'mid',weight:2-t*2},{boneId:'tip',weight:t*2-1}]);}
 else{const w=v<=.35?1:v<=.50?1:Math.max(0,(.84-v)/.34);weights.push([{boneId:'root',weight:1-w},{boneId:'body',weight:w}]);}}
 for(let y=0;y<vs.length-1;y++)for(let x=0;x<us.length-1;x++){const i=y*us.length+x,n=us.length;triangles.push(i,i+1,i+n+1,i,i+n+1,i+n);}
 const bones=scarf?[bone('root',null,{rotation:-Math.PI/9}),bone('mid'),bone('tip')]:[bone('body')];
 apply(bones.map(value=>({kind:'putBone',value})));
 // Bind-world is unrotated art. Rest root rotation deliberately tilts scarf.
 const mesh:Mesh={id:'mesh',type:'mesh',assetId:kind,vertices,uvs,triangles,weights:vertices.filter((_,i)=>i%2===0).map(()=>[{boneId:'root',weight:1}]),bindPose:(scarf?['root','mid','tip']:['root','body']).map(boneId=>({boneId,world:[1,0,0,1,0,0]}))};
 apply([{kind:'putMesh',value:mesh},{kind:'putSlot',value:{id:'mesh',name:'Mesh',boneId:'root',attachmentId:'mesh'}}]);
 apply([{kind:'setVertexWeights',attachmentId:'mesh',vertices:weights.map((weights,vertex)=>({vertex,weights}))}]);
 apply([{kind:'putAnimation',value:{id:'cycle',name:'Cycle',duration:2,loop:true,channels:scarf?[{boneId:'mid',property:'y',keys:sine(7)},{boneId:'tip',property:'y',keys:sine(12,.25)}]:[{boneId:'body',property:'y',keys:sine(-20)}]}}]);
 if(!scarf)for(const key of sine(1))apply([{kind:'setVertexDeforms',animationId:'cycle',attachmentId:'mesh',time:key.time,curve:key.curve,vertices:weights.map((_,vertex)=>{const u=uvs[vertex*2],v=uvs[vertex*2+1];const top=Math.max(0,(.35-v)/.35),lower=v>.5&&v<.84?Math.sin((v-.5)/.34*Math.PI):0;return{vertex,offset:[(u-.5)*key.value*20*(top+lower),-15*top*key.value]};})}]);
 }
 return runtime.session!.inspect();
}
export async function replaceHalf(){await assets(runtime.session!.inspect().assets.map(a=>a.id),true);return runtime.session!.inspect();}
export function semantics(p:Project){const {assets:_,revision:__,...rest}=p;return rest;}
