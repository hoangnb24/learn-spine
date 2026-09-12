import { describe,it,expect } from 'vitest';
import { createSession,prepareBundle } from '../../src/commands';
import { WebMCPBridge } from '../../src/adapters/webmcp';
import { ObservationService } from '../../src/observation';
import { fixture,composition,track,crossfade,value } from '../engine/composition-fixture';
import type { Storage, Json } from '../../src/model';
async function setup() {
  const bundle={project:fixture(),assets:new Map()};bundle.project.compositions=[];
  const session=value(createSession(value(await prepareBundle(bundle,async()=>({ok:true,value:bundle,warnings:[]})))));
  const observation=new ObservationService();
  const bridge=new WebMCPBridge({getSession:()=>session,observation,storage:{} as Storage});
  const scope={sessionId:session.sessionId,projectId:session.inspect().projectId};
  const put=(revision:number,requestId:string,com=composition())=>({...scope,expectedRevision:revision,requestId,composition:com});
  return {scope,put,bridge,session};
}
describe('composition public adapter handlers (native evidence recorded separately)',()=>{
  it('authors atomically, inspects tracks, evaluates canonical pose, retries across edits and undo',async()=>{
    const {scope,put,bridge,session}=await setup();
    const request=put(0,'first',composition([track('wave',3,{mode:'additive'}),track('walk',0)]));
    const first=await bridge.dispatch('put_composition',request);expect(first).toMatchObject({ok:true,value:{revision:1}});
    expect(await bridge.dispatch('inspect_composition',{...scope,compositionId:'motion',limit:1})).toMatchObject({ok:true,value:{revision:1,total:2,nextOffset:1,items:[{id:'walk-0'}]}});
    expect(await bridge.dispatch('inspect_project',{...scope,collection:'compositions'})).toMatchObject({ok:true,value:{total:1}});
    const target={kind:'composition',compositionId:'motion'};
    const pose=value(await bridge.dispatch('evaluate_pose',{...scope,target,time:99})) as Record<string,Json>;
    expect(pose).toMatchObject({target,sampledTime:2,revision:1});expect(pose).not.toHaveProperty('animationId');
    expect(await bridge.dispatch('put_composition',put(0,'stale'))).toMatchObject({ok:false,error:{code:'REVISION_CONFLICT'}});
    expect(await bridge.dispatch('put_composition',put(1,'second'))).toMatchObject({ok:true,value:{revision:2}});
    expect(await bridge.dispatch('put_composition',request)).toEqual(first);expect(session.inspect().revision).toBe(2);
    expect(await bridge.dispatch('undo',{...scope,expectedRevision:2,requestId:'undo'})).toMatchObject({ok:true,value:{revision:3}});
    expect(session.inspect().compositions![0].tracks).toHaveLength(2);
  });
  it('preserves canonical reference, coverage and deform failures without partial writes',async()=>{
    const {scope,put,bridge,session}=await setup();
    const bad=composition([track('missing')]);
    expect(await bridge.dispatch('put_composition',put(0,'missing',bad))).toMatchObject({ok:false,error:{code:'MISSING_REFERENCE'}});
    const fade=crossfade();fade.incoming.mask=[];
    expect(await bridge.dispatch('put_composition',put(0,'coverage',composition([fade])))).toMatchObject({ok:false,error:{code:'INVALID_INPUT',message:expect.stringContaining('hip/y')}});
    expect(session.inspect().revision).toBe(0);
    value(await bridge.dispatch('put_composition',put(0,'valid')));
    expect(await bridge.dispatch('apply_batch',{...scope,expectedRevision:1,requestId:'remove-source',operations:[{kind:'remove',collection:'animations',id:'walk'}]})).toMatchObject({ok:false,error:{code:'MISSING_REFERENCE'}});
    expect(session.inspect().revision).toBe(1);
    expect(await bridge.dispatch('apply_batch',{...scope,expectedRevision:1,requestId:'remove-both',operations:[{kind:'remove',collection:'compositions',id:'motion'},{kind:'remove',collection:'animations',id:'walk'}]})).toMatchObject({ok:true,value:{revision:2}});
  });
  it('rejects hybrid, malformed and setup job selectors and returns normalized diagnostics',async()=>{
    const {scope,put,bridge}=await setup();value(await bridge.dispatch('put_composition',put(0,'initial',{...composition(),loop:true})));
    const target={kind:'composition',compositionId:'motion'};
    for(const name of ['evaluate_pose','measure_motion','render_pose','render_sequence','preview_animation'])
      expect(await bridge.dispatch(name,{...scope,target,animationId:'walk',time:0})).toMatchObject({ok:false,error:{code:'INVALID_INPUT'}});
    expect(await bridge.dispatch('evaluate_pose',{...scope,target:{...target,animationId:'walk'},time:0})).toMatchObject({ok:false,error:{code:'INVALID_INPUT'}});
    const report=value(await bridge.dispatch('measure_motion',{...scope,target,loopPoints:[],limit:1})) as Record<string,Json>;
    expect(report).toMatchObject({projectId:scope.projectId,revision:1,sampling:{target}});
    expect(report.sampling).not.toHaveProperty('animationId');
    const sampling=report.sampling as {sampledTimes:number[]};expect(sampling.sampledTimes.at(-1)).toBe(0);
  });
});
