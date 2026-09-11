import {createRoot} from 'react-dom/client';
import {Editor} from '../../../apps/editor/Editor';
import {editorRuntime as runtime} from '../../../apps/editor/runtime';
import {editorBridge as bridge} from '../../../apps/editor/webmcp';
import '../../../apps/shared/styles.css';
import * as recipe from '../../../fixtures/deformation/author';
import {evaluate} from '../../../src/engine';
import {PixiRenderer,fitCamera} from '../../../src/render';
import {measure_motion} from '../../../src/diagnostics';
import type {Pose,Project} from '../../../src/model';
createRoot(document.getElementById('root')!).render(<Editor runtime={runtime}/>);
function pose(p:Project,time:number){return recipe.unwrap(evaluate(p,{animationId:'cycle',time}));}
function anchors(p:Project){const canonical=recipe.unwrap(evaluate(p,{animationId:null,time:0}));
 if(p.ikConstraints?.length)return[{id:'stance',point:{kind:'ik' as const,constraintId:'leg'},target:[120,-100] as [number,number],start:0,end:2},{id:'foot-origin',point:{kind:'bone' as const,boneId:'foot'},target:[120,-100] as [number,number],start:0,end:2}];
 const ids=p.assets[0].id==='scarf'?Array.from({length:5},(_,y)=>[y*17,y*17+1]).flat():Array.from({length:33},(_,i)=>110+i);
 return ids.map(vertex=>({id:`anchor-${vertex}`,point:{kind:'vertex' as const,slotId:'mesh',vertex},target:canonical.meshes[0].vertices.slice(vertex*2,vertex*2+2) as [number,number]}));
}
function uvPoint(p:Pose,u:number,v:number){const m=p.meshes[0];for(let i=0;i<m.triangles.length;i+=3){const ids=m.triangles.slice(i,i+3),[[ax,ay],[bx,by],[cx,cy]]=ids.map(n=>m.uvs.slice(n*2,n*2+2));const den=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy),a=((by-cy)*(u-cx)+(cx-bx)*(v-cy))/den,b=((cy-ay)*(u-cx)+(ax-cx)*(v-cy))/den,c=1-a-b;if(Math.min(a,b,c)>=-1e-10)return[0,1].map(axis=>a*m.vertices[ids[0]*2+axis]+b*m.vertices[ids[1]*2+axis]+c*m.vertices[ids[2]*2+axis]);}throw Error('UV outside mesh');}
function eyes(p:Pose){return recipe.eyeROIs.map(([x0,y0,x1,y1])=>{const points=[[x0,y0],[x1,y0],[x0,y1],[x1,y1]].map(([x,y])=>uvPoint(p,x/1254,y/1254));return{points,height:Math.max(...points.map(p=>p[1]))-Math.min(...points.map(p=>p[1]))};});}
async function measure(){const p=runtime.session!.inspect(),declared=anchors(p);const report=recipe.unwrap(measure_motion(p,{animationId:'cycle',anchors:declared,limit:500}));
 const times=[...new Set([...Array.from({length:61},(_,i)=>i/30),...p.animations[0].channels.flatMap(c=>c.keys.map(k=>k.time))])].sort((a,b)=>a-b);
 const unwrapped=structuredClone(p);unwrapped.animations[0].loop=false;
 const canonical=recipe.unwrap(evaluate(p,{animationId:null,time:0})),samples=times.map(time=>pose(unwrapped,time));
 return{project:p,anchors:declared,report,times,canonical,samples,eyes:p.assets[0].id==='jelly'?{canonical:eyes(canonical),samples:samples.map(eyes)}:null,log:recipe.log};
}
async function sequence(half=false){const b=runtime.session!.snapshot(),p=b.project,renderer=recipe.unwrap(await PixiRenderer.create());recipe.unwrap(await renderer.prepare(b));
 const measured=await measure(),view=recipe.unwrap(fitCamera(p,measured.samples,{width:1280,height:720,centerX:0,centerY:0,zoom:1,devicePixelRatio:1,background:'#252831'},60)).viewport;
 const frames=[];for(const sample of measured.samples){recipe.unwrap(renderer.draw(sample,view));frames.push({time:sample.sampledTime,png:renderer.canvas.toDataURL('image/png')});}renderer.dispose();return{half,view,frames};}
Object.assign(window,{gate2:{runtime,bridge,...recipe,evaluate,measure,sequence}});
declare global{interface Window{gate2:{runtime:typeof runtime;bridge:typeof bridge;author:typeof recipe.author;replaceHalf:typeof recipe.replaceHalf;semantics:typeof recipe.semantics;evaluate:typeof evaluate;measure:typeof measure;sequence:typeof sequence}}}
