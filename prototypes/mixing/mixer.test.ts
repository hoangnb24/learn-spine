import {test,expect} from '../../platform/node_modules/vitest';
import {compose,pose,weight,crossings,stopEntry} from './mixer';
import {fixture,track,channel} from './fixtures';
const near=(a:number,b:number)=>expect(a).toBeCloseTo(b,10);
test('walk+wave independent numeric oracle; additive relative to nonzero setup',()=>{
 const p=fixture(), walk=track('walk'), wave=track('wave',1,{mask:[{boneId:'arm',property:'rotation'}],alpha:.5});
 let l=compose(p,[wave,walk],.5); near(l.hip.y,-20);near(l.target.x,100);near(l.arm.rotation,.9);
 l=compose(p,[walk,{...wave,mode:'additive'}],.5);near(l.arm.rotation,1.2);
 for(const [alpha,overwrite,additive] of [[0,.8,.8],[.5,.9,1.2],[1,1,1.6]]) {
  near(compose(p,[walk,{...wave,alpha}],.5).arm.rotation,overwrite);
  near(compose(p,[walk,{...wave,alpha,mode:'additive'}],.5).arm.rotation,additive);
 }
 near(compose(p,[{...wave,mask:[]}],.5).arm.rotation,.2);
 near(compose(p,[wave,track('walk',2)],.5).arm.rotation,.8);
});
test('fade in, removal, indefinite hold, zero speed and frozen transition source',()=>{
 const p=fixture(), w=track('wave',1,{fadeIn:.4,end:1,fadeOut:.4});
 for(const [time,expected] of [[-.1,0],[0,0],[.2,.5],[.4,1],[1,1],[1.2,.5],[1.4,0],[2,0]])near(weight(w,time),expected);
 near(weight({...w,fadeOut:0},1),0);
 near(compose(p,[track('stop')],100).hip.y,-10);
 const freeze=compose(p,[track('walk')],.5);
 const f=track('wave',0,{source:{frozen:freeze},end:1,fadeOut:1});
 near(compose(p,[f],1.5).hip.y,-10);
 const zero=track('wave',0,{source:{animationId:'wave',offset:.5,speed:0},fadeIn:1});
 near(compose(p,[zero],.5).arm.rotation,.6); near(compose(p,[zero],1).arm.rotation,1);
 // Global transport pause means pass the same time: fades freeze too.
 expect(compose(p,[w],.2)).toEqual(compose(p,[w],.2));
 near(compose(p,[track('walk'),track('wave',1,{end:0,fadeOut:0})],.5).arm.rotation,.8);
});
test('canonical numeric angles preserve multi-turn and scale uses setup delta',()=>{
 const p=fixture();p.animations[1].channels=[channel('arm','rotation',[170*Math.PI/180,-170*Math.PI/180]),channel('arm','scaleX',[3])];
 const w=track('wave',0,{mask:[{boneId:'arm',property:'rotation'},{boneId:'arm',property:'scaleX'}],mode:'additive',alpha:.5});
 near(compose(p,[w],.5).arm.rotation,.1);near(compose(p,[w],.5).arm.scaleX,2);
 p.animations[1].channels[0]=channel('arm','rotation',[0,4*Math.PI]);near(compose(p,[{...w,mode:'overwrite',alpha:1}],.5).arm.rotation,2*Math.PI);
});
test('seek order/loops deterministic; project and frozen input stay immutable',()=>{
 const p=fixture(),before=JSON.stringify(p),w=track('walk');const frozen=compose(p,[w],.25), saved=JSON.stringify(frozen);
 const first=pose(p,[w],.25);for(const t of [3.2,-.25,1,.8,.25])pose(p,[w],t);
 expect(pose(p,[w],.25)).toEqual(first);expect(compose(p,[w],1)).toEqual(compose(p,[w],0));
 pose(p,[track('wave',0,{source:{frozen}})],.3);expect(JSON.stringify(frozen)).toBe(saved);expect(JSON.stringify(p)).toBe(before);
 first.bones.hip=[0,0,0,0,0,0];expect(pose(p,[w],.25).bones.hip).not.toEqual(first.bones.hip);
});
test('stop waits for contact; FK then accepted IK holds foot throughout transition; bad entry fails oracle',()=>{
 const p=fixture();expect(stopEntry(.25,1)).toBe(1);expect(stopEntry(1,1)).toBe(1);
 const frozen=compose(p,[track('walk')],1), tracks=[track('walk',0,{source:{frozen},start:1,end:1.4,fadeOut:0}),track('stop',1,{start:1,fadeIn:.4})];
 for(let i=0;i<=100;i++){const v=pose(p,tracks,1+i/100);near(v.bones.foot[4],120);near(v.bones.foot[5],-100);expect(v.ik![0].distance).toBeLessThan(1e-8);}
 // Same playhead is not same contact: walk .25 target X=110, stop .25 target X=120.
 expect(Math.abs(pose(p,[track('walk')],.25).bones.foot[4]-pose(p,[track('stop')],.25).bones.foot[4])).toBeGreaterThan(9.9);
 const noIK={...p,ikConstraints:[]};expect(Math.hypot(pose(noIK,tracks,1.2).bones.foot[4]-120,pose(noIK,tracks,1.2).bones.foot[5]+100)).toBeGreaterThan(10);
});
test('events half-open interval, multi-loop, wrap zero once, seek/reset silent, cursor partition invariant',()=>{
 const events=[{id:'contact',time:0},{id:'wave',time:.5}];
 const all=crossings(events,1,true,0,2.5,'advance');expect(all.map(e=>[e.id,e.cycle,e.at])).toEqual([['wave',0,.5],['contact',1,1],['wave',1,1.5],['contact',2,2],['wave',2,2.5]]);
 expect([...crossings(events,1,true,0,1,'advance'),...crossings(events,1,true,1,2.5,'advance')]).toEqual(all);
 for(const kind of ['seek','reset'] as const)expect(crossings(events,1,true,0,2.5,kind)).toEqual([]);
 expect(crossings(events,1,true,1,1,'advance')).toEqual([]);expect(crossings(events,1,true,2,1,'advance')).toEqual([]);
 expect(crossings(events,1,false,0,3,'advance')).toEqual([{id:'wave',cycle:0,at:.5}]);
 expect(()=>crossings([{id:'end',time:1}],1,true,0,2,'advance')).toThrow();
 expect(()=>crossings(events,1,true,1e20,1e20+1e6,'advance')).toThrow();
});
test('invalid controls fail instead of silently altering semantics',()=>{
 for(const t of [track('missing'),track('walk',0,{alpha:2}),track('walk',0,{fadeIn:-1}),track('walk',0,{source:{animationId:'walk',offset:0,speed:-1}}),track('walk',0,{mask:[{boneId:'missing',property:'x'}]})])expect(()=>compose(fixture(),[t],0)).toThrow();
 expect(()=>compose(fixture(),[track('walk'),track('wave')],0)).toThrow();expect(()=>compose(fixture(),[],NaN)).toThrow();
 const p=fixture();p.animations[0].deforms=[{attachmentId:'x',keys:[]}];expect(()=>compose(p,[track('walk')],0)).toThrow();
});

test('complete crossfade is linear; incomplete destination snaps and must be rejected by future transition authoring',()=>{
 const p=fixture(),frozen=compose(p,[track('walk')],1);
 const ts=[track('walk',0,{source:{frozen},start:1,end:1.4,fadeOut:0}),track('stop',1,{start:1,fadeIn:.4})];
 near(compose(p,ts,1.2).hip.y,-2);
 near(compose(p,ts,1.2).arm.rotation,.36);
 near(compose(p,ts,1.4-1e-9).arm.rotation,.2400000008);near(compose(p,ts,1.4).arm.rotation,.24);
 p.animations[2].channels=p.animations[2].channels.filter(c=>c.boneId!=='arm');
 expect(Math.abs(compose(p,ts,1.4-1e-9).arm.rotation-compose(p,ts,1.4).arm.rotation)).toBeGreaterThan(.19);
});
