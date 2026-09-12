/** Research-only composition of canonical local channels, never a production evaluator. */
import type { Project, Transform, Animation } from '../../platform/src/model/types';
import { sample, sampledTime } from '../../platform/src/engine/timeline';
import { evaluate } from '../../platform/src/engine';
export type Mask = { boneId: string; property: keyof Transform }[];
export type Source = { animationId: string; offset: number; speed: number } | { frozen: Record<string, Transform> };
export interface Track {
  order: number; source: Source; mode: 'overwrite'|'additive'; mask: Mask; alpha: number;
  start: number; fadeIn: number;
  /** End is explicit removal start; omitted means hold indefinitely, including clamped last pose. */
  end?: number; fadeOut: number;
}
const finite = (n: number) => { if (!Number.isFinite(n)) throw Error('Expected finite number'); };
export function weight(track: Track, time: number) {
  if (time < track.start) return 0;
  const incoming = track.fadeIn === 0 ? 1 : Math.min(1, (time-track.start)/track.fadeIn);
  const outgoing = track.end === undefined || time < track.end ? 1 : track.fadeOut === 0 ? 0 : Math.max(0, 1-(time-track.end)/track.fadeOut);
  return track.alpha * incoming * outgoing;
}
export function compose(project: Project, tracks: Track[], time: number) {
  finite(time);
  const locals = Object.fromEntries(project.bones.map(b=>[b.id,{...b.setup}]));
  const setup = Object.fromEntries(project.bones.map(b=>[b.id,b.setup]));
  const orders = new Set<number>();
  for (const t of tracks) {
    [t.order,t.alpha,t.start,t.fadeIn,t.fadeOut].forEach(finite);
    if (!Number.isSafeInteger(t.order)||t.order<0||orders.has(t.order)||t.alpha<0||t.alpha>1||t.fadeIn<0||t.fadeOut<0) throw Error('Invalid track');
    orders.add(t.order);
    if(t.end!==undefined) { finite(t.end); if(t.end<t.start) throw Error('End before start'); }
    if(t.mode!=='overwrite'&&t.mode!=='additive') throw Error('Invalid mode');
    const seen = new Set<string>();
    for(const m of t.mask) {
      const k=m.boneId+'/'+m.property;
      if(!setup[m.boneId] || !Object.hasOwn(setup[m.boneId],m.property)||seen.has(k)) throw Error('Invalid mask');
      seen.add(k);
    }
  }
  for(const t of [...tracks].sort((a,b)=>a.order-b.order)) {
    let animation: Animation|undefined;
    let at=0;
    if('animationId' in t.source) {
      finite(t.source.offset); finite(t.source.speed);
      if(t.source.speed<0) throw Error('Reverse playback is deferred');
      const id=t.source.animationId;
      animation=project.animations.find(a=>a.id===id);
      if(!animation) throw Error('Missing animation');
      if(animation.deforms?.length) throw Error('Deform mixing is deferred');
      at=sampledTime(t.source.offset+(time-t.start)*t.source.speed,animation.duration,animation.loop);
      finite(at);
    }
    const w=weight(t,time);
    for(const m of t.mask) {
      const channel=animation?.channels.find(c=>c.boneId===m.boneId&&c.property===m.property);
      // An absent channel contributes nothing, even with a wider mask.
      const v='frozen' in t.source ? t.source.frozen[m.boneId]?.[m.property] : channel ? sample(channel,at) : undefined;
      if(v===undefined) continue;
      finite(v);
      const prior=locals[m.boneId][m.property];
      const value=t.mode==='overwrite' ? (1-w)*prior+w*v : prior+w*(v-setup[m.boneId][m.property]);
      finite(value); locals[m.boneId][m.property]=value;
    }
  }
  return locals;
}
/** Adapter solely for the prototype: evaluate a defensive transient setup so accepted FK/IK is reused. */
export function pose(project: Project, tracks: Track[], time: number) {
  const locals=compose(project,tracks,time);
  const transient={...project,bones:project.bones.map(b=>({...b,setup:locals[b.id]}))};
  const result=evaluate(transient,{animationId:null,time:0});
  if(!result.ok) throw Error(result.error.message);
  return result.value;
}
export interface Marker { id: string; time: number }
/** Forward transport intervals are (previous,next]; seek/reset emit none. Cursor belongs to caller. */
export function crossings(markers: Marker[], duration: number, loop: boolean, previous: number, next: number, kind: 'advance'|'seek'|'reset') {
  [duration,previous,next].forEach(finite);
  if(duration<=0||new Set(markers.map(m=>m.id)).size!==markers.length) throw Error('Invalid markers');
  for(const m of markers) if(!Number.isFinite(m.time)||m.time<0||m.time>=duration) throw Error('Marker outside [0,duration)');
  if(kind!=='advance'||next<=previous) return [];
  const result: {id:string; cycle:number; at:number}[]=[];
  for(const m of markers) {
    const first=loop ? Math.floor((previous-m.time)/duration)+1 : 0;
    const last=loop ? Math.floor((next-m.time)/duration) : 0;
    if(!Number.isSafeInteger(first)||!Number.isSafeInteger(last)||last-first>10000) throw Error('Crossing limit exceeded');
    for(let cycle=first;cycle<=last;cycle++) {
      const at=cycle*duration+m.time;
      if(at>previous&&at<=next) result.push({id:m.id,cycle,at});
    }
  }
  return result.sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id));
}
/** Request at a contact boundary starts immediately; otherwise wait for next wrap. */
export function stopEntry(request: number, duration: number) {
  finite(request); finite(duration); if(request<0||duration<=0) throw Error('Invalid stop request');
  return Math.ceil(request/duration)*duration;
}
