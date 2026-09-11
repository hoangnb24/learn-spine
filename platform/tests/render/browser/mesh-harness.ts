import {gridProject} from '../mesh/fixture';
import manifest from '../../../fixtures/source/manifest.json';
import {ObservationService} from '../../../src/observation';
import {poseGeometry} from '../../../src/render/geometry';
const art=import.meta.glob('../../../../exercises/{robot/images/parts/scarf-tail,soft-character/images/jelly}.png',{query:'?url',import:'default',eager:true}) as Record<string,string>;
const hash=async(bytes:Uint8Array)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes))),n=>n.toString(16).padStart(2,'0')).join('');
async function bundle(kind:'scarf'|'jelly',half=false){
 const a=manifest.records.find(r=>r.id===kind)!;
 let bytes=new Uint8Array(await(await fetch(art[`../../../../${a.path}`])).arrayBuffer()),width=a.pixelWidth!,height=a.pixelHeight!;
 if(half){const bitmap=await createImageBitmap(new Blob([bytes]));const c=document.createElement('canvas');c.width=Math.round(width/2);c.height=Math.round(height/2);c.getContext('2d')!.drawImage(bitmap,0,0,c.width,c.height);bitmap.close();bytes=new Uint8Array(await(await new Promise<Blob>(r=>c.toBlob(b=>r(b!)))).arrayBuffer());width=c.width;height=c.height;}
 const asset={id:kind,name:kind,path:`assets/${kind}.png`,mimeType:'image/png' as const,sha256:await hash(bytes),pixelWidth:width,pixelHeight:height,originalWidth:width,originalHeight:height,trimX:0,trimY:0};
 return {project:gridProject(asset,kind),assets:new Map([[kind,bytes]])};
}
Object.assign(window,{meshHarness:{bundle,hash,gridProject,ObservationService,poseGeometry}});
