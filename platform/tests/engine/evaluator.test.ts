import { describe, expect, it } from 'vitest';
import fixture from '../../../docs/product/contracts/examples/region-valid.json';
import { evaluate } from '../../src/engine';
import type { Project, Pose, Curve } from '../../src/model/types';
const make = () => structuredClone(fixture) as Project;
function pose(p = make(), time = 0, animationId: string | null = null): Pose {
  const r = evaluate(p, { time, animationId });
  if (!r.ok) throw new Error(JSON.stringify(r.error));
  return r.value;
}
function channel(p: Project, property: 'x'|'rotation'|'scaleX', a: number, b: number, curve: Curve = {type:'linear'}) {
  p.animations[0] = {id:'idle',name:'idle',duration:2,loop:false,channels:[{boneId:'body',property,keys:[
    {time:0,value:a,curve},{time:2,value:b,curve:{type:'linear'}}]}]};
}
describe('deterministic region v0 evaluator', () => {
  it('computes hand-calculated parent/child worlds independent of bone order', () => {
    const p=make(); p.bones[0].setup={x:10,y:20,rotation:Math.PI/2,scaleX:2,scaleY:1};
    p.bones[1].setup.x=3;p.bones[1].setup.y=4;p.bones.reverse();
    const m=pose(p).bones.body; expect(m[4]).toBeCloseTo(6,10);expect(m[5]).toBeCloseTo(26,10);
    expect(m.slice(0,4)).toEqual([expect.closeTo(0,10),2,-1,expect.closeTo(0,10)]);
    p.bones[1].setup.rotation=0;p.bones[1].setup.scaleX=-1;
    expect(pose(p).bones.body).toEqual([-1,0,0,1,7,24]);
  });
  it('places trimmed art with pivot only in corners and stable slot order', () => {
    const p=make(); Object.assign(p.assets[0],{originalWidth:100,originalHeight:80,trimX:10,trimY:20,pixelWidth:60,pixelHeight:40});
    Object.assign(p.attachments[0],{width:200,height:160,pivotX:100,pivotY:0});
    p.attachments[0].transform.x=5;p.attachments[0].transform.y=7;
    p.slots=[{...p.slots[0],id:'back'},{...p.slots[0],id:'empty',attachmentId:null},{...p.slots[0],id:'front'}];
    const regions=pose(p).regions;expect(regions.map(r=>r.slotId)).toEqual(['back','front']);
    const m=regions[0].world;[1,0,0,1,5,317].forEach((v,i)=>expect(m[i]).toBeCloseTo(v,10));
    // T03 corners (-80,40), (40,120), then translation (5,317).
    expect([m[0]*-80+m[2]*40+m[4],m[1]*-80+m[3]*40+m[5]]).toEqual([-75,357]);
    expect([m[0]*40+m[2]*120+m[4],m[1]*40+m[3]*120+m[5]]).toEqual([45,437]);
  });
  it('uses absolute channel values, numeric rotations and scale through zero', () => {
    const p=make();p.bones[1].setup.x=100;channel(p,'x',2,6);expect(pose(p,1,'idle').bones.body[4]).toBe(4);
    channel(p,'rotation',170*Math.PI/180,-170*Math.PI/180);expect(pose(p,1,'idle').bones.body[0]).toBe(1);
    channel(p,'rotation',0,4*Math.PI);expect(pose(p,.25,'idle').bones.body[1]).toBeCloseTo(1);
    channel(p,'scaleX',-1,1);expect(pose(p,1,'idle').bones.body[0]).toBe(0);
    expect(pose(p,0,'idle').bones.body[0]).toBe(-1);
  });
  it('inverts Bezier x before applying y, including overshoot and flat endpoints', () => {
    const p=make();channel(p,'x',0,8,{type:'bezier',x1:0,y1:0,x2:0,y2:1});
    // u=.5 -> x=.125, y=.5; sampled time=.25 seconds.
    expect(pose(p,.25,'idle').bones.body[4]).toBeCloseTo(4,9);
    channel(p,'x',0,8,{type:'bezier',x1:1/3,y1:2,x2:2/3,y2:2});
    expect(pose(p,1,'idle').bones.body[4]).toBeCloseTo(13,9);
  });
  it('holds stepped values until exact key, clamps and wraps signed time', () => {
    const p=make();channel(p,'x',2,6,{type:'stepped'});
    expect(pose(p,1.999,'idle').bones.body[4]).toBe(2);expect(pose(p,2,'idle').bones.body[4]).toBe(6);
    expect(pose(p,-1,'idle').sampledTime).toBe(0);expect(pose(p,3,'idle').sampledTime).toBe(2);
    p.animations[0].loop=true;expect(pose(p,2,'idle').sampledTime).toBe(0);expect(pose(p,-.25,'idle').sampledTime).toBe(1.75);
    expect(pose(p,123,null).sampledTime).toBe(0);
    p.animations[0].channels[0].keys[0].time=.5;p.animations[0].channels[0].keys[1].time=1.5;
    expect(pose(p,0,'idle').bones.body[4]).toBe(2);expect(pose(p,1.75,'idle').bones.body[4]).toBe(6);
  });
  it('20 shuffled seeks agree with direct samples and do not mutate input or retain results', () => {
    const p=make(), before=structuredClone(p);
    const times=[.31,1.92,.02,1.17,.73,0,2,-.25,3.2,.4,1.6,.8,1.4,.1,1.9,.9,1.1,.6,1.3,.2];
    const direct=times.map(t=>pose(p,t,'idle'));
    for(const i of [9,1,18,6,3,14,11,0,19,4,16,7,12,2,15,5,17,8,13,10]) expect(pose(p,times[i],'idle')).toEqual(direct[i]);
    expect(p).toEqual(before);direct[0].regions.length=0;expect(pose(p,.31,'idle').regions).toHaveLength(1);
  });
  it('rejects invalid project/request and finite-derived overflow with Results', () => {
    for(const time of [NaN,Infinity,-Infinity]) expect(evaluate(make(),{animationId:null,time}).ok).toBe(false);
    expect(evaluate(make(),{animationId:'missing',time:0})).toMatchObject({ok:false,error:{code:'MISSING_REFERENCE',path:'/animationId'}});
    const p=make();p.bones[0].parentId='body';expect(evaluate(p,{animationId:null,time:0})).toMatchObject({ok:false,error:{code:'PARENT_CYCLE'}});
    p.bones[0].parentId=null;p.bones[0].setup.scaleX=1e308;p.bones[1].setup.scaleX=1e308;
    expect(evaluate(p,{animationId:null,time:0})).toMatchObject({ok:false,error:{code:'INVALID_INPUT'}});
    const q=make();q.animations[0].channels[0].keys[1].time=0;expect(evaluate(q,{animationId:'idle',time:0}).ok).toBe(false);
    expect(evaluate(make(),{get time(): number {throw Error('must not run')},animationId:null}).ok).toBe(false);
  });
  it('supports large finite loop duration without overflowing modulo and prototype-like IDs', () => {
    const p=make();p.bones[0].id='__proto__';p.bones[1].parentId='__proto__';p.animations[0].duration=1e308;
    const result=pose(p,9e307,'idle');expect(result.sampledTime).toBe(9e307);
    expect(Object.hasOwn(result.bones,'__proto__')).toBe(true);
    expect(Object.values(result.bones).flat().every(Number.isFinite)).toBe(true);
  });
});
