import { parse, validate } from '../model';
import type { Asset, ProjectBundle, Result, Storage } from '../model';
import { check, MAX_BYTES, StorageProblem, unzip, zip } from './zip';
export interface StorageOptions {
  databaseName?: string;
  indexedDB?: IDBFactory;
  /** Non-browser hosts must supply a real PNG decoder; dimensions alone are insufficient. */
  decodePng?: (bytes: Uint8Array) => Promise<{ width: number; height: number }>;
}
const success = <T>(value:T):Result<T> => ({ok:true,value,warnings:[]});
async function boundary<T>(fn:()=>Promise<T>, fallback: 'INVALID_INPUT'|'STORAGE_FAILED' = 'INVALID_INPUT'):Promise<Result<T>> {
  try { return success(await fn()); } catch(e) { return {ok:false,error:e instanceof StorageProblem?{code:e.code,path:e.path,message:e.message}:{code:fallback,path:'',message:e instanceof Error?e.message:'Operation failed'}}; }
}
async function browserDecode(bytes:Uint8Array) {
  const bitmap=await createImageBitmap(new Blob([bytes.slice()],{type:'image/png'}));
  try { return {width:bitmap.width,height:bitmap.height}; } finally { bitmap.close(); }
}
export async function validatePng(asset:Asset, bytes:Uint8Array, signal?:AbortSignal, decode=browserDecode):Promise<Result<void>> {
  return boundary(async()=>{
    check(signal);
    if(bytes.length>20*1024*1024) throw new StorageProblem('LIMIT_EXCEEDED','PNG exceeds 20 MiB',asset.path);
    const signature=[137,80,78,71,13,10,26,10];
    if(bytes.length<33||!signature.every((b,i)=>bytes[i]===b)||String.fromCharCode(...bytes.subarray(12,16))!=='IHDR') throw new StorageProblem('ASSET_DECODE_FAILED','Invalid PNG header',asset.path);
    const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength), width=view.getUint32(16),height=view.getUint32(20);
    if(view.getUint32(8)!==13||!width||!height||width>16384||height>16384) throw new StorageProblem('LIMIT_EXCEEDED','PNG dimensions exceed limits',asset.path);
    if(width!==asset.pixelWidth||height!==asset.pixelHeight) throw new StorageProblem('ASSET_DECODE_FAILED','PNG dimensions differ from manifest',asset.path);
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes.slice())),b=>b.toString(16).padStart(2,'0')).join('');
    if(hash!==asset.sha256) throw new StorageProblem('ASSET_HASH_MISMATCH','PNG hash differs from manifest',asset.path);
    let decoded; try { decoded=await decode(bytes.slice()); } catch { throw new StorageProblem('ASSET_DECODE_FAILED','PNG decoder rejected image',asset.path); }
    check(signal);
    if(width!==asset.pixelWidth||height!==asset.pixelHeight||decoded.width!==width||decoded.height!==height) throw new StorageProblem('ASSET_DECODE_FAILED','PNG dimensions differ from manifest or decoder',asset.path);
  });
}
function unwrap<T>(r:Result<T>):T { if(!r.ok) throw new StorageProblem(r.error.code,r.error.message,r.error.path); return r.value; }
async function validated(input:unknown, signal?:AbortSignal, decode=browserDecode):Promise<ProjectBundle> {
  check(signal);
  if(!input||typeof input!=='object'||!('project' in input)||!('assets' in input)||!(input.assets instanceof Map)) throw new StorageProblem('INVALID_INPUT','Expected project bundle');
  const project=unwrap(validate(input.project)); const assets=new Map<string,Uint8Array>();
  if(input.assets.size!==project.assets.length) throw new StorageProblem('INVALID_INPUT','Unexpected or missing asset bytes');
  let total=new TextEncoder().encode(JSON.stringify(project)).length,pixels=0;
  for(const asset of project.assets) {
    const source=input.assets.get(asset.id); if(!(source instanceof Uint8Array)) throw new StorageProblem('MISSING_REFERENCE','Asset bytes missing',asset.path);
    const bytes=source.slice(); total+=bytes.length; pixels+=asset.pixelWidth*asset.pixelHeight;
    if(total>MAX_BYTES||pixels>64000000) throw new StorageProblem('LIMIT_EXCEEDED','Bundle exceeds byte or pixel budget');
    assets.set(asset.id,bytes);
  }
  // Snapshot every byte before the first asynchronous operation.
  for(const asset of project.assets) unwrap(await validatePng(asset,assets.get(asset.id)!,signal,decode));
  check(signal); return {project,assets};
}
export const validateBundle=(input:unknown,signal?:AbortSignal):Promise<Result<ProjectBundle>> => boundary(()=>validated(input,signal));
export function createStorage(options:StorageOptions={}):Storage & {validateBundle:(input:unknown,signal?:AbortSignal)=>Promise<Result<ProjectBundle>>} {
  const decoder=options.decodePng??browserDecode;
  async function database() {
    const factory=options.indexedDB??globalThis.indexedDB;
    if(!factory) throw new StorageProblem('STORAGE_FAILED','IndexedDB unavailable');
    return new Promise<IDBDatabase>((resolve,reject)=>{
      const request=factory.open(options.databaseName??'learn-spine-projects-v0',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('projects',{keyPath:'project.projectId'});
      request.onerror=()=>reject(request.error); request.onblocked=()=>reject(new StorageProblem('STORAGE_FAILED','Database upgrade blocked'));
      request.onsuccess=()=>{request.result.onversionchange=()=>request.result.close();resolve(request.result);};
    });
  }
  async function transaction<T>(mode:IDBTransactionMode, signal:AbortSignal|undefined, action:(store:IDBObjectStore,set:(v:T)=>void,fail:(e:unknown)=>void)=>void):Promise<T> {
    check(signal); const db=await database();
    try { check(signal); return await new Promise<T>((resolve,reject)=>{
      const tx=db.transaction('projects',mode); let value:T,problem:unknown;
      const abort=()=>{problem=new StorageProblem('CANCELLED','Operation cancelled');try{tx.abort();}catch{/* committed */}};
      const cleanup=()=>signal?.removeEventListener('abort',abort);
      tx.oncomplete=()=>{cleanup();resolve(value);}; tx.onabort=()=>{cleanup();reject(problem??tx.error??new StorageProblem('STORAGE_FAILED','Transaction aborted'));}; tx.onerror=()=>{};
      signal?.addEventListener('abort',abort,{once:true});
      try { action(tx.objectStore('projects'),v=>{value=v;},e=>{problem=e;tx.abort();}); } catch(e){problem=e;tx.abort();}
    }); } finally {db.close();}
  }
  return {
    validateBundle:(input,signal)=>boundary(()=>validated(input,signal,decoder)),
    pack:(bundle,signal)=>boundary(async()=>{
      const snapshot=await validated(bundle,signal,decoder); const files=new Map<string,Uint8Array>([['project.json',new TextEncoder().encode(JSON.stringify(snapshot.project))]]);
      for(const asset of snapshot.project.assets) files.set(asset.path,snapshot.assets.get(asset.id)!);
      check(signal); return zip(files);
    }),
    unpack:(bytes,signal)=>boundary(async()=>{
      const files=await unzip(bytes.slice(),signal); const manifest=files.get('project.json');
      if(!manifest) throw new StorageProblem('MISSING_REFERENCE','project.json missing');
      const project=unwrap(parse(new TextDecoder('utf-8',{fatal:true}).decode(manifest)));
      if(files.size!==project.assets.length+1||[...files.keys()].some(path=>path!=='project.json'&&!project.assets.some(a=>a.path===path))) throw new StorageProblem('INVALID_INPUT','Unexpected archive files');
      const assets=new Map<string,Uint8Array>(); for(const asset of project.assets) {const b=files.get(asset.path);if(!b) throw new StorageProblem('MISSING_REFERENCE','PNG missing',asset.path);assets.set(asset.id,b);}
      return validated({project,assets},signal,decoder);
    }),
    autosave:(bundle,signal)=>boundary(async()=>{
      const snapshot=await validated(bundle,signal,decoder);
      return transaction('readwrite',signal,(store,set,fail)=>{
        const request=store.get(snapshot.project.projectId);
        request.onsuccess=()=>{
          try {
          const old=request.result as ProjectBundle|undefined;
          if(old&&old.project.revision>=snapshot.project.revision) {
            fail(new StorageProblem('REVISION_CONFLICT','Stored revision is equal or newer'));return;
          }
          store.put(snapshot);set({revision:snapshot.project.revision});
          } catch(error) { fail(error); }
        };
      });
    },'STORAGE_FAILED'),
    recover:(projectId,signal)=>boundary(async()=>{
      if(typeof projectId!=='string'||!/^[A-Za-z0-9_.-]{1,100}$/.test(projectId)) throw new StorageProblem('INVALID_INPUT','Invalid project ID');
      const value=await transaction<ProjectBundle|undefined>('readonly',signal,(store,set)=>{const r=store.get(projectId);r.onsuccess=()=>set(r.result);});
      return value===undefined?null:validated(value,signal,decoder);
    },'STORAGE_FAILED'),
  };
}
