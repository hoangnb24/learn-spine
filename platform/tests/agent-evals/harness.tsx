import { createRoot } from 'react-dom/client';
import { useSyncExternalStore } from 'react';
import '../../apps/shared/styles.css';
import { Editor } from '../../apps/editor/Editor';
import { EditorRuntime } from '../../apps/editor/runtime';
import { WebMCPBridge, registerWebMCP } from '../../src/adapters/webmcp';
import { ObservationService } from '../../src/observation';
import layout from '../../fixtures/source/robot-layout.json';
const params = new URLSearchParams(location.search);
const brief = params.get('brief') ?? 'robot', run = params.get('run') ?? 'setup';
if (!['robot','wave','scarf'].includes(brief) || !/^[a-z0-9-]+$/.test(run)) throw Error('Invalid run');
const runtime = new EditorRuntime(), events: unknown[] = [];
let chain = Promise.resolve(), started: number | null = null, stopped = false, count = 0;
let download: {url:string;filename:string;revision:number}|null=null;
const listeners = new Set<()=>void>();
function record(event: unknown) {
 const row = {at:new Date().toISOString(),event}; events.push(row);
 chain = chain.then(async()=> { const r=await fetch('http://127.0.0.1:4211/'+run,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(row)}); if(!r.ok)throw Error('Collector rejected log'); });
 chain.catch(e=>{document.title='LOG FAILURE';console.error(e);});
}
const bridge = new WebMCPBridge({getSession:()=>runtime.session,storage:runtime.storage,observation:new ObservationService(),onDownload:d=>{
 download=d; listeners.forEach(f=>f());
 void fetch(d.url).then(r=>r.blob()).then(b=>new Promise<string>(resolve=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.readAsDataURL(b);})).then(data=>record({kind:'artifact',...d,data}));
}});
const dispatch=bridge.dispatch.bind(bridge);
bridge.dispatch=async(name,input,signal)=>{
 const begin=performance.now(), before=runtime.session?.inspect().revision;
 const result=await dispatch(name,input,signal);
 record({kind:'tool',name,input,result,beforeRevision:before,afterRevision:runtime.session?.inspect().revision,durationMs:performance.now()-begin,elapsedMs:started===null?null:performance.now()-started,callNumber:++count,afterStop:stopped});
 return result;
};
runtime.subscribe(()=>bridge.refresh());
const bytes = new Uint8Array(await (await fetch(`./initial/${brief}.zip`)).arrayBuffer());
const unpacked=await runtime.storage.unpack(bytes); if(!unpacked.ok)throw Error(JSON.stringify(unpacked));
const opened=await runtime.openBundle(unpacked.value); if(!opened.ok)throw Error(JSON.stringify(opened));
const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
const registration=await registerWebMCP(bridge);
const transport=registration.ok?registration.value.transport:'unavailable';
record({kind:'setup',brief,run,zipSha256:hash,project:runtime.session!.inspect(),transport,userAgent:navigator.userAgent,model:'gpt-6-astra / medium; provider snapshot unavailable',tokens:null,cost:null});
function start(){if(started!==null)return;started=performance.now();record({kind:'start',timestamp:Date.now()}); listeners.forEach(f=>f());}
function stop(){if(stopped)return;stopped=true;record({kind:'stop',timestamp:Date.now(),elapsedMs:started===null?null:performance.now()-started,toolCount:count,project:runtime.session!.inspect()});listeners.forEach(f=>f());}
function App(){
 useSyncExternalStore(f=>{listeners.add(f);return()=>listeners.delete(f);},()=>`${started}-${stopped}-${download?.url}`);
 return <><div><strong>Gate 3 {brief} / {run} · {transport}</strong><button onClick={start} disabled={started!==null}>Bắt đầu lượt</button><button onClick={stop} disabled={started===null||stopped}>Kết thúc lượt</button>{download&&<a href={download.url} download={download.filename}>Tải bản tool {download.revision}</a>}</div>{brief==='robot'&&<details><summary>Bố trí robot được cung cấp</summary><pre>{JSON.stringify(layout,null,2)}</pre></details>}<Editor runtime={runtime} agentStatus={transport}/></>;
}
createRoot(document.getElementById('root')!).render(<App/>);
