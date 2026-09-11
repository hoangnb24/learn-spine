// Use after Browser skill bootstrap, discovery and reading the page tool schemas.
// Open /tests/authoring/browser/index.html and click “Nạp mẫu khăn”.
// Pass the actual `await (await tab.capabilities.get('webmcp')).fetchTools()` handle.
// This is a public native-tool recipe, never a page-evaluate handler invocation.
export async function run(tools) {
 const calls=[];
 const call=async(name,input)=>{const result=await tools.call(name,input);calls.push({name,input,result});return JSON.parse(result.content.find(c=>c.type==='text').text);};
 const cap=await call('get_capabilities',{}),scope={sessionId:cap.value.sessionId,projectId:cap.value.projectId};
 if(cap.value.revision!==0)throw Error('Use a freshly loaded scarf fixture');
 const read={...scope,attachmentId:'mesh',section:'vertices',limit:50};
 const before=await call('inspect_mesh',read);
 const request={...scope,expectedRevision:0,requestId:'recipe-weights',operations:[{kind:'setVertexWeights',attachmentId:'mesh',vertices:[{vertex:2,weights:[{boneId:'root',weight:.7},{boneId:'tip',weight:.3}]}]}]};
 const first=await call('apply_batch',request),retry=await call('apply_batch',request);
 if(JSON.stringify(first)!==JSON.stringify(retry))throw Error('Retry mismatch');
 const after=await call('inspect_mesh',read);
 if(after.value.items.some((v,i)=>i!==2&&JSON.stringify(v)!==JSON.stringify(before.value.items[i])))throw Error('Unselected vertex changed');
 await call('apply_batch',{...request,expectedRevision:1,requestId:'recipe-bad',operations:[...request.operations,{kind:'setVertexWeights',attachmentId:'mesh',vertices:[{vertex:999,weights:[{boneId:'root',weight:1}]}]}]});
 await call('validate_project',scope);
 await call('measure_motion',{...scope,animationId:'deform',anchors:[{id:'neck',point:{kind:'vertex',slotId:'mesh',vertex:0},target:[-180,67.5]}],loopPoints:[],limit:5});
 await call('render_pose',{...scope,animationId:'deform',time:.5,viewport:{width:640,height:420,centerX:0,centerY:0,zoom:1.2,devicePixelRatio:1,background:'#253542'}});
 await call('save_project',scope);
 const keyRead={...scope,animationId:'deform',attachmentId:'mesh',keyTime:0,limit:50};
 await call('inspect_deforms',keyRead);
 await call('apply_batch',{...scope,expectedRevision:1,requestId:'recipe-deform',operations:[{kind:'setVertexDeforms',animationId:'deform',attachmentId:'mesh',time:0,curve:{type:'linear'},vertices:[{vertex:1,offset:[3,4]}]}]});
 await call('inspect_deforms',keyRead);
 await call('undo',{...scope,expectedRevision:2,requestId:'recipe-undo'});
 return calls;
}
