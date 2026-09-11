import {describe,it,expect} from 'vitest';
import {corners,screenPoint,fitCamera} from '../../src/render/geometry';
import {evaluate} from '../../src/engine';
import type {Project, Region} from '../../src/model/types';
import sample from '../../../docs/product/contracts/examples/region-valid.json';
describe('renderer geometry',()=>{
 it('trim, pivot, negative scale and shear retain all four corners',()=>{
 const r={...(sample.attachments[0] as Region),width:200,height:160,pivotX:100,pivotY:0};const a={...(sample as Project).assets[0],originalWidth:100,originalHeight:80,trimX:10,trimY:20,pixelWidth:60,pixelHeight:40};
 expect(corners(r,a,[1,0,0,1,0,0])).toEqual([-80,120,40,120,40,40,-80,40]);
 expect(corners(r,a,[-1,0,2,1,10,20])).toEqual([330,140,210,140,50,60,170,60]);
 });
 it('union fit includes endpoints and keeps DPR independent',()=>{const p=sample as Project;const a=evaluate(p,{animationId:null,time:0});if(!a.ok)throw Error();const b=structuredClone(a.value);b.regions[0].world=[1,0,0,1,900,900];const v={width:640,height:480,centerX:0,centerY:0,zoom:1,devicePixelRatio:2,background:'#000000'};const fit=fitCamera(p,[a.value,b],v);expect(fit.ok).toBe(true);if(!fit.ok)return;expect(fit.value.bounds?.maxX).toBe(1001);expect(fit.value.poseCount).toBe(2);expect(screenPoint(fit.value.viewport.centerX,fit.value.viewport.centerY,fit.value.viewport)).toEqual([320,240]);expect(JSON.stringify(p)).toEqual(JSON.stringify(sample));});
});
