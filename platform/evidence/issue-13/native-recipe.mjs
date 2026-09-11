/** Run with an actual Browser skill `tools` handle after discovery; never page.evaluate. */
export async function runNativeRecipe(tools) {
 const calls=[];
 const call=async(name,input)=>{const started=new Date().toISOString(),result=await tools.call(name,input);calls.push({started,name,input,result});return result;};
 const value=result=>JSON.parse(result.content.find(c=>c.type==='text').text).value;
 const capabilities=value(await call('get_capabilities',{}));
 const scope={sessionId:capabilities.sessionId,projectId:capabilities.projectId};
 const bones=value(await call('inspect_project',{...scope,collection:'bones',ids:['root']}));
 const root=bones.items[0];
 const edit={...scope,expectedRevision:bones.revision,requestId:'recipe-rig',bones:[{...root,setup:{...root.setup,x:25}}]};
 await call('create_bones',edit);await call('create_bones',edit);
 await call('create_bones',{...edit,requestId:'recipe-stale'});
 await call('create_bones',{...edit,expectedRevision:'bad'});
 await call('create_animation',{...scope,expectedRevision:bones.revision+1,requestId:'recipe-idle',animation:{id:'idle',name:'Idle',duration:2,loop:true,channels:[{boneId:'root',property:'rotation',keys:[{time:0,value:0,curve:{type:'linear'}},{time:1,value:0.1,curve:{type:'linear'}},{time:2,value:0,curve:{type:'linear'}}]}]}});
 const viewport={width:640,height:640,centerX:25,centerY:300,zoom:0.8,devicePixelRatio:1,background:'#15202b'};
 await call('render_pose',{...scope,animationId:'idle',time:0.5,viewport});
 const job=value(await call('export_frames',{...scope,animationId:'idle',times:[0,0.5,1],viewport}));
 let status;
 for(let i=0;i<100;i++){status=value(await call('get_job_status',{...scope,jobId:job.id}));if(!['queued','running'].includes(status.status))break;await new Promise(r=>setTimeout(r,30));}
 if(status.status==='succeeded')for(const artifact of status.items.filter(a=>a.mimeType==='application/zip'||a===status.items[0]))await call('read_artifact',{...scope,jobId:job.id,artifactId:artifact.id});
 await call('save_project',scope);await call('cancel_job',{...scope,jobId:job.id});
 const cancellable=value(await call('render_sequence',{...scope,animationId:'idle',times:Array.from({length:100},(_,i)=>i/50),viewport}));
 await call('cancel_job',{...scope,jobId:cancellable.id});await call('get_job_status',{...scope,jobId:cancellable.id});
 return calls;
}
