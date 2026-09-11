import {test,expect} from '@playwright/test';
// Real renderer/storage/commands via in-page bridge. This is explicitly not native agent evidence.
test('bridge delivers real PNG + project ZIP, snapshot jobs, cancellation and lifecycle',async({page})=>{
 await page.goto('/tests/adapters/browser/index.html');await expect(page.locator('#state')).toContainText('Revision 0');
 const result=await page.evaluate(async()=>{
  const {bridge,session,storage}= (window as unknown as {adapterHarness:{bridge:import('../../../src/adapters/webmcp').WebMCPBridge;session:import('../../../src/commands').Session;storage:import('../../../src/model').Storage}}).adapterHarness;
  const scope={sessionId:session.sessionId,projectId:session.inspect().projectId};
  const viewport={width:320,height:320,centerX:0,centerY:300,zoom:0.4,devicePixelRatio:1,background:'#15202b'};
  const call=async(name:string,input:object)=>{const r=await bridge.dispatch(name,{...scope,...input});if(!r.ok)throw Error(JSON.stringify(r));return r.value as Record<string,unknown>;};
  await call('create_animation',{expectedRevision:0,requestId:'animation',animation:{id:'idle',name:'idle',duration:2,loop:true,channels:[{boneId:'root',property:'x',keys:[{time:0,value:0,curve:{type:'linear'}},{time:2,value:20,curve:{type:'linear'}}]}]}});
  const pose=await call('render_pose',{animationId:'idle',time:0.5,viewport});const image=pose.image as {data:string};
  const decoded=await createImageBitmap(await(await fetch(`data:image/png;base64,${image.data}`)).blob());const dimensions=[decoded.width,decoded.height];decoded.close();
  const job=await call('export_frames',{animationId:'idle',times:[0,0.5,1],viewport});
  await call('create_bones',{expectedRevision:1,requestId:'edit',bones:[{...session.inspect().bones[0],setup:{...session.inspect().bones[0].setup,x:80}}]});
  let status=await call('get_job_status',{jobId:job.id});while(['queued','running'].includes(status.status as string)){await new Promise(r=>setTimeout(r,20));status=await call('get_job_status',{jobId:job.id});}
  if(status.status!=='succeeded')throw Error(JSON.stringify(status));
  const artifacts=status.items as Array<{id:string;mimeType:string}>;
  const artifact=await call('read_artifact',{jobId:job.id,artifactId:artifacts[0].id});
  const zip=await call('read_artifact',{jobId:job.id,artifactId:artifacts.find(a=>a.mimeType==='application/zip')!.id});
  const zipBytes=new Uint8Array(await(await fetch(zip.url as string)).arrayBuffer());
  const saved=await call('save_project',{});const packed=new Uint8Array(await(await fetch(saved.url as string)).arrayBuffer());const reopened=await storage.unpack(packed);if(!reopened.ok)throw Error(JSON.stringify(reopened));
  const cancelJob=await call('render_sequence',{animationId:'idle',times:Array.from({length:30},(_,i)=>i/15),viewport});const cancelled=await call('cancel_job',{jobId:cancelJob.id});
  const completed=await call('cancel_job',{jobId:job.id});
  const failed=await bridge.dispatch('render_sequence',{...scope,animationId:'missing',times:[0],viewport});
  const savedRevision=reopened.value.project.revision,assetCount=reopened.value.assets.size;
  bridge.dispose();let revoked=false;try{await fetch(saved.url as string);}catch{revoked=true;}
  return {dimensions,poseRevision:pose.revision,jobRevision:status.revision,artifactRevision:artifact.revision,zipSignature:[...zipBytes.slice(0,4)],savedRevision,assetCount,cancelled:cancelled.status,terminalCancel:completed.status,failed:failed.ok?'unexpected-success':failed.error.code,revoked,current:session.inspect().revision};
 });
 expect(result).toEqual({dimensions:[320,320],poseRevision:1,jobRevision:1,artifactRevision:1,zipSignature:[80,75,3,4],savedRevision:2,assetCount:15,cancelled:'cancelled',terminalCancel:'succeeded',failed:'MISSING_REFERENCE',revoked:true,current:2});
});
