import { describe, it, expect } from 'vitest';
import { fixture, composition, track, crossfade, channel, value } from '../engine/composition-fixture';
import { targetBounds, animationBounds } from '../../src/observation/bounds';
import { evaluateTarget } from '../../src/engine';
import { poseGeometry, fitCamera } from '../../src/render/geometry';
import { ObservationService } from '../../src/observation';
import type { EvaluationTarget, Project, Renderer, RenderablePose, Viewport } from '../../src/model';
const target: EvaluationTarget={kind:'composition',compositionId:'motion'};
const viewport: Viewport={width:240,height:240,centerX:0,centerY:0,zoom:1,devicePixelRatio:1,background:'#000000'};
export function drawable(): Project {
  const p=fixture();
  p.assets=[{id:'art',name:'Art',mimeType:'image/png',path:'assets/art.png',sha256:'0'.repeat(64),pixelWidth:16,pixelHeight:16,originalWidth:16,originalHeight:16,trimX:0,trimY:0}];
  p.attachments=p.bones.map(b=>({id:b.id,type:'region',assetId:'art',width:16,height:16,pivotX:8,pivotY:8,transform:{x:0,y:0,rotation:0,scaleX:1,scaleY:1}}));
  p.slots=p.bones.map(b=>({id:b.id,name:b.id,boneId:b.id,attachmentId:b.id}));
  return p;
}
function contains(p:Project,times=Array.from({length:121},(_,i)=>i/30-1)) {
  const bounds=value(targetBounds(p,target))!;
  for(const time of times) for(const points of value(poseGeometry(p,value(evaluateTarget(p,{target,time})))))
    for(let i=0;i<points.length;i+=2) {
      expect(points[i]).toBeGreaterThanOrEqual(bounds.minX-1e-8);expect(points[i]).toBeLessThanOrEqual(bounds.maxX+1e-8);
      expect(points[i+1]).toBeGreaterThanOrEqual(bounds.minY-1e-8);expect(points[i+1]).toBeLessThanOrEqual(bounds.maxY+1e-8);
    }
  return bounds;
}
describe('composition interval bounds (containment is a regression check, not the enclosure proof)',()=>{
  it('encloses canonical walk+wave, frozen complete coverage stop, reflected and ordered IK geometry',()=>{
    const p=drawable();
    p.compositions=[composition([track(),track('wave',1,{mode:'additive',alpha:.4})])];contains(p);
    p.compositions=[composition([track('walk',0,{end:1}),crossfade()])];contains(p,[0,.9,1,1.1,1.2,1.399999,1.4,1.5,2,20]);
    p.bones[0].setup.scaleX=-1;contains(p);
  });
  it('does not use union of source animations: two additive +100 tracks move geometry +200',()=>{
    const p=drawable();p.ikConstraints=[];
    p.animations[0].channels=[channel('hip','x',[100,100])];
    const mask=[{boneId:'hip',property:'x'}] as const;
    p.compositions=[composition([track('walk',0,{mask:[...mask],mode:'additive'}),track('walk',1,{mask:[...mask],mode:'additive'})])];
    const b=contains(p),single=animationBounds(p,'walk')!;
    expect(b.maxX).toBeGreaterThan(single.maxX+90);
    const actual=value(poseGeometry(p,value(evaluateTarget(p,{target,time:.5})))).flat();
    expect(actual.some((v,i)=>i%2===0 && v>single.maxX)).toBe(true); // crop negative control
  });
  it('covers interior rotation and Bezier overshoot missed by endpoint-only fit',()=>{
    const p=drawable();p.ikConstraints=[];
    p.animations[0].loop=false;p.animations[0].channels=[channel('hip','rotation',[0,Math.PI*2])];
    p.compositions=[composition([track('walk',0,{mask:[{boneId:'hip',property:'rotation'}]})])];
    const b=contains(p), endpoints=value(fitCamera(p,[0,1].map(time=>value(evaluateTarget(p,{target,time}))),viewport)).bounds!;
    expect(b.minY).toBeLessThan(endpoints.minY-50);
    p.animations[0].channels=[{...channel('hip','x',[0,100]),keys:[{time:0,value:0,curve:{type:'bezier',x1:.2,y1:3,x2:.8,y2:3}},{time:1,value:100,curve:{type:'linear'}}]}];
    p.compositions[0].tracks=[track('walk',0,{mask:[{boneId:'hip',property:'x'}]})];
    const bezier=contains(p);expect(bezier.maxX).toBeGreaterThan(300);
    expect(value(evaluateTarget(p,{target,time:.5})).bones.hip[4]).toBeGreaterThan(100);
  });
  it('keeps prior channels through missing keys/masks, partial overwrite, additive, fades, speed 0, seek and source loops',()=>{
    const p=drawable();p.ikConstraints=[];
    p.animations[0].channels=[channel('hip','x',[100,100])];
    p.animations[1].channels=[channel('hip','x',[-100,-100])];
    p.compositions=[{...composition([
      track('walk',2,{mask:[{boneId:'hip',property:'x'}]}),
      track('wave',4,{source:{kind:'live',animationId:'wave',offset:.8,speed:0},mask:[{boneId:'hip',property:'x'},{boneId:'arm',property:'y'}],alpha:.25,start:.2,fadeIn:.4,end:1.5,fadeOut:.3}),
      track('wave',6,{mask:[],mode:'additive'}),
    ]),loop:true}];
    contains(p);expect(value(evaluateTarget(p,{target,time:.8})).bones.hip[4]).toBe(50);
    expect(value(evaluateTarget(p,{target,time:2.8})).bones.hip[4]).toBe(50);
  });
  it('encloses weighted mesh geometry with source loops, offsets, mixed timing, and undeformed composition',()=>{
    const p=drawable();p.requiredCapabilities.push('mesh-v1');
    const setup=value(evaluateTarget(p,{target:{kind:'animation',animationId:null},time:0}));
    p.attachments.push({id:'mesh',type:'mesh',assetId:'art',vertices:[0,0,30,0,0,30],uvs:[0,0,1,0,0,1],triangles:[0,1,2],
      weights:Array.from({length:3},()=>[{boneId:'hip',weight:.25},{boneId:'shin',weight:.75}]),
      bindPose:['hip','shin'].map(boneId=>({boneId,world:setup.bones[boneId]}))});
    p.slots.push({id:'mesh',name:'Mesh',boneId:'hip',attachmentId:'mesh'});
    p.compositions=[composition([track('walk',0,{source:{kind:'live',animationId:'walk',offset:.23,speed:8.3},start:.123,fadeIn:.3,end:1.5,fadeOut:.2}),track('wave',2,{mode:'additive',alpha:.4})])];
    contains(p);
    p.animations.push({id:'unused-deform',name:'Unused deform',duration:1,loop:false,channels:[],deforms:[{attachmentId:'mesh',keys:[{time:0,offsets:[999,999,999,999,999,999],curve:{type:'linear'}}]}]});
    contains(p); // unrelated deformation must not leak into a composed pose
    p.compositions[0].tracks.push(track('unused-deform',3,{mask:[],alpha:0}));
    expect(targetBounds(p,target)).toMatchObject({ok:false,error:{code:'UNSUPPORTED_CAPABILITY'}});
  });
  it('does not sample dead zero-duration outgoing entries and checks only active source clock intervals',()=>{
    const p=drawable();p.ikConstraints=[];
    p.animations[0].channels=[{boneId:'hip',property:'x',keys:[{time:0,value:1e308,curve:{type:'bezier',x1:.2,y1:3,x2:.8,y2:3}},{time:1,value:-1e308,curve:{type:'linear'}}]}];
    p.animations[2].channels=[channel('hip','x',[0,0])];
    const mask=[{boneId:'hip',property:'x'}] as const;
    p.compositions=[composition([{kind:'crossfade',id:'instant',order:0,start:.5,duration:0,outgoing:{animationId:'walk',entryTime:.5,mask:[...mask]},incoming:{animationId:'stop',offset:0,speed:1,mask:[...mask]}}])];
    contains(p);
    p.compositions[0].tracks=[track('stop',0,{mask:[...mask],source:{kind:'live',animationId:'stop',offset:0,speed:1e308},end:1})];
    contains(p);
  });
  it('bounds immutable frozen sample and empty deform channels; rejects overflow rather than sampling fallback',()=>{
    const p=drawable();p.ikConstraints=[];
    p.animations[0].channels=[channel('hip','x',[0,100])];p.animations[0].deforms=[];
    p.compositions=[composition([track('walk',0,{mask:[{boneId:'hip',property:'x'}],source:{kind:'frozen',animationId:'walk',entryTime:.5}})])];
    const b=contains(p);expect(b.maxX).toBeLessThan(260);
    p.animations[0].channels=[channel('hip','x',[1e308,1e308])];
    p.compositions[0].tracks=[track('walk',0,{mask:[{boneId:'hip',property:'x'}],mode:'additive',fadeIn:1}),track('walk',1,{mask:[{boneId:'hip',property:'x'}],mode:'additive',fadeIn:1})];
    expect(targetBounds(p,target)).toMatchObject({ok:false,error:{code:'INVALID_INPUT'}});
  });
});
const wait=async(s:ObservationService,id:string)=>{for(let i=0;i<100;i++){const j=value(s.get(id));if(!['queued','running'].includes(j.status))return j;await new Promise(r=>setTimeout(r,3));}throw Error('timeout');};
describe('canonical snapshot jobs',()=>{
  it('passes the same target/revision geometry to renderer, snapshots source edits, identifies fit and wraps time',async()=>{
    const p=drawable();p.compositions![0].loop=true;
    const captured:RenderablePose[]=[];
    const renderer:Renderer={prepare:async()=>({ok:true,value:undefined,warnings:[]}),draw:()=>({ok:true,value:undefined,warnings:[]}),capture:async pose=>{captured.push(pose);return {ok:true,value:new Uint8Array([1]),warnings:[]};},dispose(){}};
    const s=new ObservationService(async()=>({ok:true,value:renderer,warnings:[]}));
    const b={project:p,assets:new Map([['art',new Uint8Array([1])]])};
    const job=value(s.submit(b,{kind:'sequence',target,times:[-.5,2,2.5],viewport}));
    expect(job).toMatchObject({target,revision:0});p.revision=4;p.animations[0].channels[0].keys[0].value=99;
    expect((await wait(s,job.id)).status).toBe('succeeded');
    const manifest=value(s.getManifest(job.id));
    expect(manifest).toMatchObject({target,revision:0,fit:'continuous-composition-envelope'});
    expect(manifest.frames.map(f=>f.sampledTime)).toEqual([1.5,0,.5]);
    expect(captured.map(p=>p.revision)).toEqual([0,0,0]);
    for(const frame of manifest.frames){expect(frame.target).toEqual(target);expect(frame).not.toHaveProperty('animationId');expect(frame.boundsKind).toBe('continuous-target-envelope');}
    s.dispose();
  });
  it('returns direct sampled frame metadata and structured selector failures before rendering',async()=>{
    const p=drawable();const b={project:p,assets:new Map([['art',new Uint8Array([1])]])};
    const s=new ObservationService(async()=>({ok:true,value:{prepare:async()=>({ok:true,value:undefined,warnings:[]}),draw:()=>({ok:true,value:undefined,warnings:[]}),capture:async()=>({ok:true,value:new Uint8Array([1]),warnings:[]}),dispose(){}},warnings:[]}));
    expect(value(await s.renderPose(b,{target,time:20,viewport})).metadata).toMatchObject({target,sampledTime:2,boundsKind:'sampled-frame'});
    expect(await s.renderPose(b,{target,animationId:'walk',time:0,viewport})).toMatchObject({ok:false,error:{code:'INVALID_INPUT'}});
    expect(s.submit(b,{target,animationId:'walk',kind:'sequence',times:[0],viewport})).toMatchObject({ok:false,error:{code:'INVALID_INPUT'}});
    s.dispose();
  });
});
