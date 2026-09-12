import { createIKProject } from '../../platform/fixtures/ik/leg';
import type { Animation, Channel } from '../../platform/src/model/types';
import type { Track } from './mixer';
export const channel=(boneId:string,property:Channel['property'],values:number[]):Channel=>({boneId,property,keys:values.map((value,i)=>({time:i/(values.length-1||1),value,curve:{type:'linear'}}))});
export function fixture() {
 const p=createIKProject();
 p.bones.push({id:'arm',name:'Arm',parentId:'hip',setup:{x:0,y:20,rotation:0.2,scaleX:1,scaleY:1}});
 const a=(id:string,channels:Channel[],loop=true):Animation=>({id,name:id,duration:1,loop,channels});
 p.animations=[a('walk',[channel('hip','y',[0,-20,0]),channel('arm','rotation',[0.4,0.8,0.4]),channel('target','x',[120,100,120])]),a('wave',[channel('arm','rotation',[0.6,1,0.6])]),a('stop',[channel('hip','y',[0,-10,-10]),channel('target','x',[120,120,120]),channel('arm','rotation',[0.4,0.2,0.2])],false)];
 return p;
}
export function track(animationId:string,order=0,extra:Partial<Track>={}):Track {
 return {order,source:{animationId,offset:0,speed:1},mode:'overwrite',mask:[{boneId:'hip',property:'y'},{boneId:'arm',property:'rotation'},{boneId:'target',property:'x'}],alpha:1,start:0,fadeIn:0,fadeOut:0,...extra};
}
