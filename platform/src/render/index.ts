import { Container, Mesh, MeshGeometry, Texture, WebGLRenderer } from 'pixi.js';
import { validate } from '../model';
import type { Pose, Project, ProjectBundle, Renderer, Result, Viewport, Problem } from '../model/types';
import { failure, poseGeometry, screenPoint, success, validateViewport } from './geometry';
export { corners, fitCamera, screenPoint } from './geometry';
export type { Bounds } from './geometry';
const error = (code: Problem['code'], message: string, path = ''): Result<never> => ({ok:false,error:{code,message,path}});
/** One instance owns one canvas and one prepared snapshot; no shared Pixi asset cache. */
export class PixiRenderer implements Renderer {
  private gpu: WebGLRenderer<HTMLCanvasElement>;
  private stage = new Container();
  private project?: Project;
  private resources = new Map<string,{texture:Texture; bitmap:ImageBitmap}>();
  private meshes: Mesh[] = [];
  private generation = 0;
  private disposed = false;
  private frame?: { projectId:string; revision:number; animationId:string|null; sampledTime:number; viewport:Viewport; pixelWidth:number; pixelHeight:number };
  get frameMetadata() { return this.frame ? structuredClone(this.frame) : null; }
  private constructor(gpu: WebGLRenderer<HTMLCanvasElement>) { this.gpu=gpu; }
  static async create(canvas?: HTMLCanvasElement): Promise<Result<PixiRenderer>> {
    const gpu=new WebGLRenderer<HTMLCanvasElement>();
    try { await gpu.init({canvas,width:1,height:1,antialias:false,preserveDrawingBuffer:true,backgroundAlpha:0}); return success(new PixiRenderer(gpu)); }
    catch (e) { return error('RENDER_FAILED',`WebGL initialization failed: ${String(e)}`); }
  }
  get canvas(): HTMLCanvasElement { return this.gpu.canvas; }
  get diagnostics() { return {backend:'webgl',textureCount:this.resources.size,disposed:this.disposed}; }
  private clear() {
    for (const mesh of this.meshes) { mesh.geometry.destroy(); mesh.destroy(); }
    this.meshes=[];
    for (const r of this.resources.values()) { r.texture.destroy(true); r.bitmap.close(); }
    this.resources.clear();
    this.frame=undefined;
  }
  async prepare(bundle: ProjectBundle, signal?: AbortSignal): Promise<Result<void>> {
    if (this.disposed) return error('RENDER_FAILED','Renderer disposed');
    const generation=++this.generation;
    const checked=validate(bundle.project); if (!checked.ok) return checked;
    if (checked.value.assets.length > 256 || checked.value.assets.reduce((n,a)=>n+a.pixelWidth*a.pixelHeight,0)>64e6) return error('LIMIT_EXCEEDED','Asset decode limits exceeded');
    const pending=new Map<string,{texture:Texture;bitmap:ImageBitmap}>();
    const cleanup=() => { for (const r of pending.values()) {r.texture.destroy(true);r.bitmap.close();} };
    const cancelled=() => signal?.aborted || this.disposed || generation !== this.generation;
    try {
      for (const [i,a] of checked.value.assets.entries()) {
        if (cancelled()) {cleanup(); return error('CANCELLED','Preparation cancelled');}
        const bytes=bundle.assets.get(a.id);
        if (!bytes) {cleanup(); return error('MISSING_REFERENCE',`Missing PNG bytes for asset ${a.id}`,`/assets/${i}`);}
        if (bytes.byteLength > 20*1024*1024 || a.pixelWidth>16384 || a.pixelHeight>16384) {cleanup();return error('LIMIT_EXCEEDED','Asset exceeds decoder limits',`/assets/${i}`);}
        const copy=new Uint8Array(bytes);
        const header=new DataView(copy.buffer);
        if(copy.length<33 || ![137,80,78,71,13,10,26,10].every((n,i)=>copy[i]===n) || header.getUint32(8)!==13 || header.getUint32(12)!==0x49484452 || header.getUint32(16)!==a.pixelWidth || header.getUint32(20)!==a.pixelHeight){cleanup();return error('ASSET_DECODE_FAILED',`Invalid PNG header for ${a.id}`,`/assets/${i}`);}
        const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',copy)),n=>n.toString(16).padStart(2,'0')).join('');
        if (hash !== a.sha256) {cleanup(); return error('ASSET_HASH_MISMATCH',`PNG hash differs for ${a.id}`,`/assets/${i}/sha256`);}
        const bitmap=await createImageBitmap(new Blob([copy],{type:'image/png'}));
        if (bitmap.width !== a.pixelWidth || bitmap.height !== a.pixelHeight) {bitmap.close();cleanup();return error('ASSET_DECODE_FAILED',`PNG dimensions differ for ${a.id}`,`/assets/${i}`);}
        pending.set(a.id,{bitmap,texture:Texture.from(bitmap,true)});
      }
      if (cancelled()) {cleanup();return error('CANCELLED','Preparation cancelled');}
      this.clear();this.resources=pending;this.project=checked.value;
      for (const slot of this.project.slots) if (slot.attachmentId !== null) {
        const region=this.project.attachments.find(a=>a.id===slot.attachmentId)!;
        const mesh=new Mesh({texture:this.resources.get(region.assetId)!.texture,geometry:new MeshGeometry({positions:new Float32Array(8),uvs:new Float32Array([0,0,1,0,1,1,0,1]),indices:new Uint32Array([0,1,2,0,2,3])})});
        this.meshes.push(mesh);this.stage.addChild(mesh);
      }
      return success(undefined);
    } catch(e) {cleanup();return error('ASSET_DECODE_FAILED',`PNG preparation failed: ${String(e)}`);}
  }
  draw(pose: Pose, viewport: Viewport): Result<void> {
    if(this.disposed || !this.project) return error('RENDER_FAILED','Prepare a project before drawing');
    const valid=validateViewport(viewport);if(!valid.ok)return valid;
    const geometry=poseGeometry(this.project,pose);if(!geometry.ok)return geometry;
    const screen=geometry.value.map(points=>points.flatMap((_,i)=>i%2?[]:screenPoint(points[i],points[i+1],viewport)));
    if(!screen.flat().every(n=>Number.isFinite(n)&&Math.abs(n)<=3.4e38))return failure('Screen geometry exceeds Float32 limits');
    try {
      // Pixi uses round(CSS * resolution). Coordinates stay in CSS pixels.
      if(this.gpu.gl.isContextLost())return error('RENDER_FAILED','WebGL context lost; recreate renderer');
      this.gpu.resize(viewport.width,viewport.height,viewport.devicePixelRatio);
      this.canvas.style.width=`${viewport.width}px`;this.canvas.style.height=`${viewport.height}px`;
      this.gpu.background.color=viewport.background.slice(0,7);
      this.gpu.background.alpha=viewport.background.length===9?parseInt(viewport.background.slice(7),16)/255:1;
      screen.forEach((p,i)=>{this.meshes[i].geometry.positions=new Float32Array(p);});
      this.gpu.render({container:this.stage,clear:true});
      this.frame={projectId:pose.projectId,revision:pose.revision,animationId:pose.animationId,sampledTime:pose.sampledTime,viewport:{...viewport},pixelWidth:this.canvas.width,pixelHeight:this.canvas.height};
      return success(undefined);
    } catch(e){return error('RENDER_FAILED',String(e));}
  }
  async capture(pose: Pose, viewport: Viewport, signal?: AbortSignal): Promise<Result<Uint8Array>> {
    if(signal?.aborted)return error('CANCELLED','Capture cancelled');
    const drawn=this.draw(pose,viewport);if(!drawn.ok)return drawn;
    try {
      // toBlob snapshots immediately, before another caller can draw/prepare.
      const blob=await new Promise<Blob|null>(resolve=>this.canvas.toBlob(resolve,'image/png'));
      if(signal?.aborted)return error('CANCELLED','Capture cancelled');
      if(!blob)return error('RENDER_FAILED','PNG encoding failed');
      return success(new Uint8Array(await blob.arrayBuffer()));
    }catch(e){return error('RENDER_FAILED',String(e));}
  }
  dispose(): void {if(this.disposed)return;this.disposed=true;++this.generation;this.clear();this.stage.destroy();this.gpu.destroy(false);this.project=undefined;}
}
