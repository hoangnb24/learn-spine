/** Reproducible public tool inputs. Pass an actual native WebMCP caller returning
 * canonical Result parsed from its MCP text block. Never pass bridge.dispatch as native. */
export async function runNativeScenario(call, { expectedTransport = "native" } = {}) {
  const log=[];
  async function invoke(name,input) {
    const result=await call(name,input);
    log.push({name,input:structuredClone(input),result:structuredClone(result)});
    return result;
  }
  function value(r) {if(!r.ok)throw Error(JSON.stringify(r));return r.value;}
  function check(condition,message){if(!condition)throw Error(message);}
  const caps=value(await invoke('get_capabilities',{}));
  check(expectedTransport==='bridge' ? caps.transport==='bridge' : caps.transport==='webmcp-document'||caps.transport==='webmcp-navigator','Expected transport required');
  check(caps.features.includes('composition-v1'),'Composition capability missing');
  const scope={sessionId:caps.sessionId,projectId:caps.projectId};
  check(caps.revision===0,'Start from freshly loaded evidence harness');
  value(await invoke('inspect_project',{...scope,collection:'bones',limit:50}));
  const curve={type:'linear'};
  const channel=(boneId,property,values)=>({boneId,property,keys:values.map((value,i)=>({time:i/(values.length-1||1),value,curve}))});
  const walk={id:'walk',name:'Walk base',duration:1,loop:true,channels:[channel('body','y',[310,290,310]),channel('root','x',[100,100])]};
  const wave={id:'wave',name:'Wave layer',duration:1,loop:true,channels:[channel('upper-arm-right','rotation',[.2,1.2,.2])]};
  const stop={id:'stop',name:'Stop source',duration:1,loop:false,channels:[channel('body','y',[310,310]),channel('root','x',[0,0])]};
  const body=[{boneId:'body',property:'y'}],root=[{boneId:'root',property:'x'}],arm=[{boneId:'upper-arm-right',property:'rotation'}];
  const track=(id,order,animationId,mask,mode='overwrite')=>({kind:'track',id,order,source:{kind:'live',animationId,offset:0,speed:1},mask,mode,alpha:1,start:0,fadeIn:0,fadeOut:0});
  const composition={id:'motion',name:'Walk + wave + additive travel',duration:2,loop:true,tracks:[track('wave',3,'wave',arm),track('base',0,'walk',body),track('travel-a',1,'walk',root,'additive'),track('travel-b',2,'walk',root,'additive')]};
  const stopComposition={id:'stop-motion',name:'Complete coverage frozen transition',duration:2,loop:false,tracks:[{...track('prior',0,'walk',[...body,...root]),end:1},{kind:'crossfade',id:'entry',order:1,start:1,duration:.4,outgoing:{animationId:'walk',entryTime:.5,mask:[...body,...root]},incoming:{animationId:'stop',offset:0,speed:1,mask:[...body,...root]}}]};
  const authored={...scope,expectedRevision:0,requestId:'native-author',operations:[{kind:'migrateProject',targetVersion:1},...[walk,wave,stop].map(value=>({kind:'putAnimation',value})),...[composition,stopComposition].map(value=>({kind:'putComposition',value}))]};
  const first=value(await invoke('apply_batch',authored));check(first.revision===1,'Atomic batch must produce one revision');
  value(await invoke('inspect_composition',{...scope,compositionId:'motion',limit:2}));
  const target={kind:'composition',compositionId:'motion'};
  const pose=value(await invoke('evaluate_pose',{...scope,target,time:2.5}));
  check(pose.revision===1&&pose.sampledTime===.5&&pose.target.compositionId==='motion'&&!('animationId' in pose),'Canonical pose provenance');
  check(pose.bones.root[4]===200&&pose.bones.body[5]===290,'Two additive tracks must accumulate beyond source union');
  const viewport={width:640,height:640,centerX:200,centerY:330,zoom:.7,devicePixelRatio:1,background:'#233243'};
  value(await invoke('render_pose',{...scope,target,time:2.5,viewport}));
  const job=value(await invoke('render_sequence',{...scope,target,times:[0,.25,.5,.75,1,1.5,2,2.5],viewport}));
  check(job.revision===1&&job.target.compositionId==='motion','Queued target provenance');
  const edited=structuredClone(wave);edited.channels[0].keys[1].value=1.6;
  value(await invoke('set_keyframes',{...scope,expectedRevision:1,requestId:'native-edit-source',animation:edited}));
  const retry=value(await invoke('apply_batch',authored));check(retry.revision===1,'Retry returns original commit after intervening source edit');
  const after=value(await invoke('evaluate_pose',{...scope,target,time:.5}));check(after.revision===2,'Edited source must reach composed pose');
  const stale=await invoke('put_composition',{...scope,expectedRevision:1,requestId:'native-stale',composition});check(!stale.ok&&stale.error.code==='REVISION_CONFLICT','Reject stale mutation');
  const hybrid=await invoke('evaluate_pose',{...scope,target,animationId:'walk',time:0});check(!hybrid.ok&&hybrid.error.code==='INVALID_INPUT','Reject hybrid selectors');
  const missing=await invoke('evaluate_pose',{...scope,target:{kind:'composition',compositionId:'missing'},time:0});check(!missing.ok&&missing.error.code==='MISSING_REFERENCE','Canonical missing reference');
  const bad=structuredClone(stopComposition);bad.tracks[1].incoming.mask=[];
  const coverage=await invoke('put_composition',{...scope,expectedRevision:2,requestId:'native-coverage',composition:bad});check(!coverage.ok&&coverage.error.code==='INVALID_INPUT','Canonical coverage rejection');
  value(await invoke('undo',{...scope,expectedRevision:2,requestId:'native-undo'}));
  const restored=value(await invoke('evaluate_pose',{...scope,target,time:.5}));check(restored.revision===3&&JSON.stringify(restored.bones)===JSON.stringify(pose.bones),'Undo restores source and composed pose');
  value(await invoke('measure_motion',{...scope,target,loopPoints:[],limit:20}));
  const stopTarget={kind:'composition',compositionId:'stop-motion'};
  for(const time of [1,1.2,1.4,2,20]){
    const p=value(await invoke('evaluate_pose',{...scope,target:stopTarget,time}));check(p.target.compositionId==='stop-motion'&&p.sampledTime===Math.min(time,2),'Frozen target time');
  }
  const frozenJob=value(await invoke('render_sequence',{...scope,target:stopTarget,times:[.5,1,1.1,1.2,1.3,1.4,1.7,2],viewport}));
  async function collect(job) {
    let status;
    for(let i=0;i<30;i++){
      status=value(await invoke('get_job_status',{...scope,jobId:job.id,limit:50}));
      if(!['queued','running'].includes(status.status))break;
      await new Promise(r=>setTimeout(r,100));
    }
    check(status.status==='succeeded','Native render job must succeed');
    check(status.revision===job.revision&&JSON.stringify(status.target)===JSON.stringify(job.target),'Snapshot job provenance after edits');
    for(const artifact of status.items){
      if(artifact.mimeType==='image/png')check(artifact.frame.target.compositionId===job.target.compositionId&&artifact.frame.revision===job.revision&&Number.isFinite(artifact.frame.sampledTime),'PNG frame provenance');
      const output=value(await invoke('read_artifact',{...scope,jobId:job.id,artifactId:artifact.id}));
      check(output.revision===job.revision&&JSON.stringify(output.target)===JSON.stringify(job.target),'Artifact snapshot provenance');
    }
  }
  await collect(job);await collect(frozenJob);
  const cancelled=value(await invoke('preview_animation',{...scope,target,fps:30,loops:2,viewport:{...viewport,width:320,height:320}}));
  const cancel=value(await invoke('cancel_job',{...scope,jobId:cancelled.id}));
  check(cancel.status==='cancelled','App-owned cancellation');
  value(await invoke('release_job',{...scope,jobId:cancelled.id}));
  value(await invoke('render_pose',{...scope,animationId:'walk',time:.5,viewport}));
  value(await invoke('evaluate_pose',{...scope,target:{kind:'animation',animationId:null},time:99}));
  return {classification:expectedTransport==='bridge'?'browser-bridge-not-native':'actual-native-only-if-caller-uses-browser-webmcp-capability',log};
}
