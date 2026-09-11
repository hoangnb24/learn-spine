import type { Json, Result } from '../../model';
import { WebMCPBridge } from './bridge';
export { WebMCPBridge, type BridgeServices } from './bridge';
export { toolDefinitions } from './schemas';
export interface ModelContext {
 registerTool(tool:{name:string;description:string;inputSchema:Json;annotations:{readOnlyHint:boolean};execute(input:unknown,options?:{signal?:AbortSignal}):Promise<unknown>},options?:{signal:AbortSignal}):void|Promise<void>;
 unregisterTool?(name:string):void|Promise<void>;
}
export interface Detection { context:ModelContext|null; transport:'webmcp-document'|'webmcp-navigator'|'none' }
export function detectWebMCP(documentValue:unknown=typeof document==='undefined'?null:document,navigatorValue:unknown=typeof navigator==='undefined'?null:navigator):Detection{
 for(const [host,transport] of [[documentValue,'webmcp-document'],[navigatorValue,'webmcp-navigator']] as const){
  const context=(host as {modelContext?:ModelContext}|null)?.modelContext;
  if(typeof context?.registerTool==='function')return {context,transport};
 }
 return {context:null,transport:'none'};
}
/** Media is a real MCP image block, never a serialized byte array. */
export function nativeContent(result:Result<Json>){
 const value=result.ok&&result.value&&typeof result.value==='object'&&!Array.isArray(result.value)?result.value:null;
 const image=value?.image;
 const metadata=value&&image?{...result,value:{...value,image:undefined}}:result;
 return {content:[{type:'text',text:JSON.stringify(metadata)},...(image?[image]:[])],isError:!result.ok};
}
/** Await registration before disposing; rolls back partial registration. */
export async function registerWebMCP(bridge:WebMCPBridge,detection=detectWebMCP()):Promise<Result<{transport:string;dispose():Promise<void>}>>{
 if(!detection.context){bridge.transport='bridge';return {ok:false,error:{code:'UNSUPPORTED_CAPABILITY',path:'',message:'Native WebMCP unavailable. Explicit in-page bridge dispatch remains available; not native-pass.'}};}
 const context=detection.context,registered:string[]=[];
 let disposed=false;
 const controller=new AbortController();
 const unregister=async()=>{controller.abort();for(const name of registered.splice(0).reverse())await context.unregisterTool?.(name);};
 try{
  for(const definition of bridge.definitions){
   await context.registerTool({...definition,annotations:{readOnlyHint:definition.readOnly},execute:async(input,options)=>nativeContent(await bridge.dispatch(definition.name,input,options?.signal))},{signal:controller.signal});
   registered.push(definition.name);
  }
  bridge.transport=detection.transport;
  return {ok:true,value:{transport:detection.transport,async dispose(){if(disposed)return;disposed=true;bridge.dispose();await unregister();}},warnings:[]};
 }catch(e){try{await unregister();}catch{/* Original error retained. */}bridge.transport='bridge';return {ok:false,error:{code:'UNSUPPORTED_CAPABILITY',path:'',message:`WebMCP registration failed: ${String(e)}; use explicitly labelled bridge only.`}};}
}
