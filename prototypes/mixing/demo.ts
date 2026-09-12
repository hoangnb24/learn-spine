import {pose,compose,stopEntry} from './mixer';
import {fixture,track} from './fixtures';
const project=fixture(),entry=stopEntry(.25,1), frozen=compose(project,[track('walk')],entry);
const canvas=document.querySelector('canvas')!,ctx=canvas.getContext('2d')!;
let running=true,time=0,last=performance.now();
const tracks=[track('walk',0,{end:entry,fadeOut:0}),track('walk',1,{source:{frozen},start:entry,end:entry+.4,fadeOut:0}),track('stop',2,{start:entry,fadeIn:.4}),track('wave',3,{mask:[{boneId:'arm',property:'rotation'}],mode:'additive',alpha:.5,end:entry,fadeOut:.4})];
const xy=(x:number,y:number)=>[260+x*1.7,140-y*1.7];
function line(a:number[],b:number[],color:string){ctx.beginPath();ctx.moveTo(...a as [number,number]);ctx.lineTo(...b as [number,number]);ctx.strokeStyle=color;ctx.lineWidth=10;ctx.stroke();}
function draw(){const p=pose(project,tracks,time),b=p.bones;ctx.clearRect(0,0,900,450);line(xy(-100,-100),xy(300,-100),'#425d70');
 const point=(id:string)=>xy(b[id][4],b[id][5]);line(point('hip'),point('shin'),'#93bfff');line(point('shin'),point('foot'),'#93bfff');line(point('hip'),xy(b.hip[4],b.hip[5]+70),'#d2dfee');
 const a=b.arm;line(point('arm'),xy(a[4]+a[0]*70,a[5]+a[1]*70),'#f6a8cc');
 for(const [id,color,r] of [['target','#f7ce55',5],['foot','#6de7bc',12]] as const){ctx.beginPath();ctx.arc(...point(id) as [number,number],r,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke();}
 ctx.fillStyle='#eff6ff';ctx.font='20px system-ui';ctx.fillText(time<entry?'Đi + vẫy tay':time<1.4?'Chuyển tiếp':'Đã dừng',560,90);
 document.querySelector('#status')!.textContent=`t=${time.toFixed(2)}s · chân (${b.foot[4].toFixed(2)}, ${b.foot[5].toFixed(2)}) · sai số IK ${p.ik![0].distance.toExponential(1)}`;
}
document.querySelector('#play')!.addEventListener('click',()=>{running=!running;document.querySelector('#play')!.textContent=running?'Tạm dừng':'Tiếp tục';});
document.querySelector('#restart')!.addEventListener('click',()=>{time=0;running=true;document.querySelector('#play')!.textContent='Tạm dừng';});
function frame(now:number){if(running)time=Math.min(3,time+(now-last)/1000);last=now;draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);
