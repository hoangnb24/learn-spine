import { describe,it,expect,vi } from 'vitest';
import { createSession,prepareBundle } from '../../src/commands';
import { WebMCPBridge,detectWebMCP,registerWebMCP,nativeContent,toolDefinitions,type ModelContext } from '../../src/adapters/webmcp';
import { ObservationService } from '../../src/observation';
import type { ProjectBundle,Result,Storage } from '../../src/model';
const unwrap=<T>(r:Result<T>)=>{if(!r.ok)throw Error(JSON.stringify(r));return r.value;};
const bundle:ProjectBundle={project:{formatVersion:0,projectId:'test',revision:0,requiredCapabilities:['region-v0'],metadata:{name:'test'},assets:[],bones:[{id:'root',name:'root',parentId:null,setup:{x:0,y:0,rotation:0,scaleX:1,scaleY:1}}],slots:[],attachments:[],animations:[]},assets:new Map()};
async function setup(){
 // Empty asset fixture: trusted test-only validator isolates transport/commands behavior.
 const token=unwrap(await prepareBundle(bundle,async()=>({ok:true,value:bundle,warnings:[]})));
 const session=unwrap(createSession(token));
 const observation=new ObservationService();
 const storage={pack:vi.fn(async()=>({ok:true,value:new Uint8Array([1,2,3]),warnings:[]}))} as unknown as Storage;
 const bridge=new WebMCPBridge({getSession:()=>session,observation,storage});
 const scope={sessionId:session.sessionId,projectId:'test'};
 const request={...scope,expectedRevision:0,requestId:'edit',bones:[{...bundle.project.bones[0],setup:{...bundle.project.bones[0].setup,x:10}}]};
 return {session,bridge,scope,request,token,observation,storage};
}
describe('WebMCP adapter',()=>{
 it('advertises integrated composition while refusing invalid selectors and implicit migration',async()=>{
  const {bridge,session,scope}=await setup();
  expect(session.capabilities().features).toContain('composition-v1');
  const caps=unwrap(await bridge.dispatch('get_capabilities',{})) as {features:string[]};
  expect(caps.features).toContain('composition-v1');
  expect(await bridge.dispatch('render_pose',{...scope,target:{kind:'composition',compositionId:'motion'},time:0})).toMatchObject({ok:false,error:{code:'INVALID_INPUT'}});
  expect(await bridge.dispatch('apply_batch',{...scope,expectedRevision:0,requestId:'composition',operations:[{kind:'putComposition',value:{id:'motion',name:'Motion',duration:1,loop:false,tracks:[]}}]})).toMatchObject({ok:false,error:{code:'UNSUPPORTED_VERSION'}});
  expect(session.inspect().revision).toBe(0);
 });
 it('commits through Session, shares UI events and preserves retry identity after later edits',async()=>{
  const {bridge,session,request}=await setup();const listener=vi.fn();session.subscribe(listener);
  const first=await bridge.dispatch('create_bones',request);expect(first).toMatchObject({ok:true,value:{revision:1,changedIds:['root']}});
  await bridge.dispatch('create_bones',{...request,expectedRevision:1,requestId:'second'});
  expect(await bridge.dispatch('create_bones',request)).toEqual(first);expect(session.inspect().revision).toBe(2);expect(listener).toHaveBeenCalledTimes(2);
  expect(await bridge.dispatch('create_bones',{...request,requestId:'stale'})).toMatchObject({ok:false,error:{code:'REVISION_CONFLICT'},revision:2});
  expect(await bridge.dispatch('create_bones',{...request,bones:[{...request.bones[0],name:'different'}]})).toMatchObject({ok:false,error:{code:'REQUEST_ID_REUSED'}});
 });
 it('rejects malformed unknown data before core mutation',async()=>{
  const {bridge,session,request}=await setup();
  for(const input of [{...request,expectedRevision:'0'},{...request,extra:1},{...request,bones:[{...request.bones[0],setup:{...request.bones[0].setup,x:NaN}}]},null])expect(await bridge.dispatch('create_bones',input)).toMatchObject({ok:false,error:{code:'INVALID_INPUT'}});
  const get=vi.fn();expect(await bridge.dispatch('inspect_project',Object.defineProperty({},'sessionId',{get,enumerable:true}))).toMatchObject({ok:false});expect(get).not.toHaveBeenCalled();expect(session.inspect().revision).toBe(0);
 });
 it('delegates atomic rollback and checkpoints/undo/redo/restore',async()=>{
  const {bridge,session,scope,request}=await setup();
  expect(await bridge.dispatch('apply_batch',{...scope,expectedRevision:0,requestId:'bad',operations:[{kind:'putBone',value:request.bones[0]},{kind:'putSlot',value:{id:'bad',name:'bad',boneId:'missing',attachmentId:null}}]})).toMatchObject({ok:false,error:{code:'MISSING_REFERENCE'}});expect(session.inspect().revision).toBe(0);
  const checkpoint=unwrap(await bridge.dispatch('create_checkpoint',{...scope,expectedRevision:0,requestId:'checkpoint',label:'before'})) as {id:string};
  await bridge.dispatch('create_bones',request);
  for(const [name,revision] of [['undo',1],['redo',2]] as const)expect(await bridge.dispatch(name,{...scope,expectedRevision:revision,requestId:name})).toMatchObject({ok:true,value:{revision:revision+1}});
  expect(await bridge.dispatch('restore_checkpoint',{...scope,expectedRevision:3,requestId:'restore',checkpointId:checkpoint.id})).toMatchObject({ok:true,value:{revision:4}});expect(session.inspect().bones[0].setup.x).toBe(0);
 });
 it('offers selective bounded channel/key inspection without dumping full animations',async()=>{
  const {bridge,scope}=await setup();
  const animation={id:'idle',name:'idle',duration:100,loop:true,channels:[{boneId:'root',property:'x',keys:Array.from({length:100},(_,time)=>({time,value:time,curve:{type:'linear'}}))}]};
  expect(await bridge.dispatch('set_keyframes',{...scope,expectedRevision:0,requestId:'keys',animation})).toMatchObject({ok:true});
  expect(await bridge.dispatch('inspect_project',{...scope,collection:'animations'})).toMatchObject({ok:true,value:{items:[{id:'idle',channelCount:1}]}});
  const listed=unwrap(await bridge.dispatch('inspect_project',{...scope,collection:'animations'}));expect(JSON.stringify(listed)).not.toContain('keys');
  expect(await bridge.dispatch('inspect_animation',{...scope,animationId:'idle',boneId:'root',property:'x',offset:95,limit:5})).toMatchObject({ok:true,value:{total:100,nextOffset:null,items:Array.from({length:5},(_,i)=>({time:95+i,value:95+i,curve:{type:'linear'}}))}});
  expect(await bridge.dispatch('inspect_project',{...scope,limit:51})).toMatchObject({ok:false});
 });
 it('rejects same-revision reopen and discards async save completion',async()=>{
  const {bridge,session,scope,token,storage}=await setup();let finish!:(r:Result<Uint8Array>)=>void;
  vi.mocked(storage.pack).mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));
  const pending=bridge.dispatch('save_project',scope);session.open(token);finish({ok:true,value:new Uint8Array([1]),warnings:[]});
  expect(await pending).toMatchObject({ok:false,error:{code:'CANCELLED'}});
  expect(await bridge.dispatch('inspect_project',scope)).toMatchObject({ok:false,error:{code:'REVISION_CONFLICT'}});
 });
 it('aborts before synchronous dispatch and does not undo completed commits on abort',async()=>{
  const {bridge,session,request}=await setup();const c=new AbortController();c.abort();
  expect(await bridge.dispatch('create_bones',request,c.signal)).toMatchObject({ok:false,error:{code:'CANCELLED'}});expect(session.inspect().revision).toBe(0);
  expect(await bridge.dispatch('create_bones',request)).toMatchObject({ok:true});bridge.dispose();expect(session.inspect().revision).toBe(1);expect(await bridge.dispatch('get_capabilities',{})).toMatchObject({ok:false});
 });
 it('binds job access to this bridge and invalidates on reopen; forwards app-owned cancel',async()=>{
  const {bridge,observation,session,scope,token}=await setup();const job={id:'job-1',projectId:'test',revision:0,progress:0,status:'queued' as const};
  vi.spyOn(observation,'submit').mockReturnValue({ok:true,value:job,warnings:[]});vi.spyOn(observation,'get').mockReturnValue({ok:true,value:job,warnings:[]});const cancel=vi.spyOn(observation,'cancel').mockReturnValue({ok:true,value:{...job,status:'cancelled'},warnings:[]});const release=vi.spyOn(observation,'release').mockReturnValue({ok:true,value:undefined,warnings:[]});
  expect(await bridge.dispatch('cancel_job',{...scope,jobId:'job-1'})).toMatchObject({ok:false,error:{code:'JOB_NOT_FOUND'}});
  await bridge.dispatch('render_sequence',{...scope,animationId:'idle',times:[0],viewport:{width:10,height:10,centerX:0,centerY:0,zoom:1,devicePixelRatio:1,background:'#000000'}});
  expect(await bridge.dispatch('cancel_job',{...scope,jobId:'job-1'})).toMatchObject({ok:true,value:{status:'cancelled'}});expect(cancel).toHaveBeenCalled();session.open(token);expect(release).toHaveBeenCalledWith('job-1');
 });
 it('advertises bounded schemas and real image blocks',()=>{
  expect(JSON.stringify(toolDefinitions).length).toBeLessThan(65536);
  const result=nativeContent({ok:true,value:{revision:4,image:{type:'image',mimeType:'image/png',data:'abc'}},warnings:[]});expect(result.content[1]).toEqual({type:'image',mimeType:'image/png',data:'abc'});expect(result.content[0]).toMatchObject({type:'text'});expect(JSON.stringify(result.content[0])).not.toContain('abc');
 });
 it('detects both APIs; rollback and disposal unregister only own tools',async()=>{
  const {bridge}=await setup();const registered=new Set<string>();let signal:AbortSignal|undefined;
  const context:ModelContext={registerTool:vi.fn((tool,options)=>{registered.add(tool.name);signal=options?.signal;signal?.addEventListener('abort',()=>registered.delete(tool.name));}),unregisterTool:vi.fn(name=>{registered.delete(name);})};
  expect(detectWebMCP(null,null).transport).toBe('none');expect(detectWebMCP(null,{modelContext:context}).transport).toBe('webmcp-navigator');
  const registration=unwrap(await registerWebMCP(bridge,detectWebMCP({modelContext:context},null)));expect(registered.size).toBe(toolDefinitions.length);await registration.dispose();expect(registered.size).toBe(0);expect(signal?.aborted).toBe(true);
  const other=await setup();let calls=0;const partial:ModelContext={registerTool:vi.fn(()=>{if(++calls===3)throw Error('duplicate');}),unregisterTool:vi.fn()};expect(await registerWebMCP(other.bridge,{context:partial,transport:'webmcp-document'})).toMatchObject({ok:false});expect(partial.unregisterTool).toHaveBeenCalledTimes(2);
 });
});
