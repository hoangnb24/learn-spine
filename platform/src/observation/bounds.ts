import { validate } from "../model";
import type { Project, Channel, EvaluationTarget, Result } from "../model/types";
import { compositionPrimitives, evaluateTarget, trackWeight } from "../engine";
import { sample, sampledTime } from "../engine/timeline";
import type { Bounds } from "../render/geometry";
type I = [number, number];
const finite = (n: number): number => {
  if (!Number.isFinite(n)) throw { code: "INVALID_INPUT", path: "/bounds", message: "Conservative interval arithmetic overflow; no sampled fallback" };
  return n;
};
// Directed rounding keeps accumulation conservative in floating point as well.
const bits = new DataView(new ArrayBuffer(8));
function next(n: number, up: boolean): number {
  finite(n);
  if (n === 0) return up ? Number.MIN_VALUE : -Number.MIN_VALUE;
  bits.setFloat64(0, n);
  bits.setBigUint64(0, bits.getBigUint64(0) + ((n > 0) === up ? 1n : -1n));
  return finite(bits.getFloat64(0));
}
const interval = (lo: number, hi: number): I => [next(lo, false), next(hi, true)];
const singleton = (n: number): I => [finite(n), finite(n)];
const hull = (a: I, b: I): I => [Math.min(a[0],b[0]),Math.max(a[1],b[1])];
const add = (a: I, b: I): I => interval(a[0] + b[0], a[1] + b[1]);
const mul = (a: I, b: I): I => {
  const p = [a[0] * b[0], a[0] * b[1], a[1] * b[0], a[1] * b[1]];
  p.forEach(finite);
  return interval(Math.min(...p), Math.max(...p));
};
const trig = (r: I, cos = false): I => {
  r.forEach(finite);
  const f = cos ? Math.cos : Math.sin;
  if (
    Math.max(Math.abs(r[0]), Math.abs(r[1])) > 1e12 ||
    r[1] - r[0] >= 2 * Math.PI
  )
    return [-1, 1];
  const v = [f(r[0]), f(r[1])];
  const offset = cos ? 0 : Math.PI / 2;
  for (
    let k = Math.ceil((r[0] - offset) / Math.PI);
    k <= (r[1] - offset) / Math.PI;
    k++
  )
    v.push(k % 2 === 0 ? 1 : -1);
  return interval(Math.min(...v), Math.max(...v));
};
type LocalRange = (id: string, property: Channel['property'], setup: number) => I;
type DeformRange = (attachmentId: string, index: number) => I;
function channelRange(channel: Channel): I {
  const values = channel.keys.map(k => k.value);
  for (let i=0; i<channel.keys.length-1; i++) {
    const k=channel.keys[i], end=channel.keys[i+1];
    if (k.curve.type === 'bezier') {
      // Cubic convex hull includes unrestricted y-control overshoot.
      for (const y of [k.curve.y1,k.curve.y2]) {
        const control = add(mul(singleton(1-y),singleton(k.value)),mul(singleton(y),singleton(end.value)));
        values.push(...control);
      }
    }
  }
  values.forEach(finite);
  return interval(Math.min(...values),Math.max(...values));
}
function animationRanges(p: Project, animationId: string): { local: LocalRange; deform: DeformRange } {
  const animation=p.animations.find(a=>a.id===animationId)!;
  return {
    local: (id,property,setup) => {
      const c=animation.channels.find(c=>c.boneId===id && c.property===property);
      return c ? channelRange(c) : singleton(setup);
    },
    deform: (id,index) => {
      const c=animation.deforms?.find(c=>c.attachmentId===id);
      return c ? channelRange({boneId:'',property:'x',keys:c.keys.map(k=>({time:k.time,value:k.offsets[index],curve:k.curve}))}) : [0,0];
    },
  };
}
/** The same FK/IK/region/skinning walker serves legacy animations and compositions. */
function geometryBounds(p: Project, range: LocalRange, deform: DeformRange): Bounds | null {
  type M = [I, I, I, I, I, I];
  const worlds = new Map<string, M>();
  // IK only rotates these locals. A full turn safely bounds solver reach/clamping,
  // reflected scales and interactions between ordered constraints without solving twice.
  const ikBones=new Set(p.ikConstraints?.flatMap(c=>[c.rootBoneId,c.childBoneId])??[]);
  const remaining = [...p.bones];
  while (remaining.length) {
    const i = remaining.findIndex(
      (b) => b.parentId === null || worlds.has(b.parentId),
    );
    if (i < 0) throw { code: "INVALID_INPUT", path: "/bones", message: "Invalid parent graph" };
    const bone = remaining.splice(i, 1)[0],
      t = bone.setup;
    const r: I = ikBones.has(bone.id)?[-Math.PI,Math.PI]:range(bone.id, "rotation", t.rotation),
      s = trig(r),
      c = trig(r, true),
      sx = range(bone.id, "scaleX", t.scaleX),
      sy = range(bone.id, "scaleY", t.scaleY);
    let m: M = [
      mul(c, sx),
      mul(s, sx),
      mul([-s[1], -s[0]], sy),
      mul(c, sy),
      range(bone.id, "x", t.x),
      range(bone.id, "y", t.y),
    ];
    const parent = bone.parentId && worlds.get(bone.parentId);
    if (parent) {
      const [a, b, c, d, x, y] = parent;
      const [e, f, g, h, u, v] = m;
      m = [
        add(mul(a, e), mul(c, f)),
        add(mul(b, e), mul(d, f)),
        add(mul(a, g), mul(c, h)),
        add(mul(b, g), mul(d, h)),
        add(add(mul(a, u), mul(c, v)), x),
        add(add(mul(b, u), mul(d, v)), y),
      ];
    }
    m.flat().forEach(finite);
    worlds.set(bone.id, m);
  }
  let bounds: Bounds | null = null;
  for (const slot of p.slots) {
    const region = p.attachments.find((r) => r.id === slot.attachmentId);
    if (!region) continue;
    if (region.type === "mesh") {
      for(let v=0;v<region.vertices.length;v+=2) {
        const px=add(singleton(region.vertices[v]),deform(region.id,v)),
          py=add(singleton(region.vertices[v+1]),deform(region.id,v+1));
        let wx:I=[0,0],wy:I=[0,0];
        for(const influence of region.weights[v/2]) {
          if(influence.weight===0)continue;
          const [ba,bb,bc,bd,bx,by]=region.bindPose.find(b=>b.boneId===influence.boneId)!.world;
          const det=finite(finite(ba*bd)-finite(bb*bc));
          // Match evaluator bind inverse arithmetic, including its translation terms.
          const ia=finite(bd/det),ib=finite(-bb/det),ic=finite(-bc/det),id=finite(ba/det);
          const ix=finite(finite(-ia*bx)-finite(ic*by)),iy=finite(finite(-ib*bx)-finite(id*by));
          const lx=add(add(mul(singleton(ia),px),mul(singleton(ic),py)),singleton(ix));
          const ly=add(add(mul(singleton(ib),px),mul(singleton(id),py)),singleton(iy));
          const [a,b,c,d,x,y]=worlds.get(influence.boneId)!;
          const w:I=[influence.weight,influence.weight];
          wx=add(wx,mul(w,add(add(mul(a,lx),mul(c,ly)),x)));
          wy=add(wy,mul(w,add(add(mul(b,lx),mul(d,ly)),y)));
        }
        if(!bounds)bounds={minX:wx[0],maxX:wx[1],minY:wy[0],maxY:wy[1]};
        else {bounds.minX=Math.min(bounds.minX,wx[0]);bounds.maxX=Math.max(bounds.maxX,wx[1]);bounds.minY=Math.min(bounds.minY,wy[0]);bounds.maxY=Math.max(bounds.maxY,wy[1]);}
      }
      continue;
    }
    const asset = p.assets.find((a) => a.id === region.assetId)!;
    const t = region.transform,
      c = Math.cos(t.rotation),
      s = Math.sin(t.rotation);
    const left =
      (asset.trimX * region.width) / asset.originalWidth - region.pivotX;
    const right =
      left + (asset.pixelWidth * region.width) / asset.originalWidth;
    const top =
      ((asset.originalHeight - asset.trimY) * region.height) /
        asset.originalHeight -
      region.pivotY;
    const bottom =
      top - (asset.pixelHeight * region.height) / asset.originalHeight;
    const [a, b, cw, d, x, y] = worlds.get(slot.boneId)!;
    for (const [u, v] of [
      [left, top],
      [right, top],
      [left, bottom],
      [right, bottom],
    ]) {
      const px = t.x + c * t.scaleX * u - s * t.scaleY * v,
        py = t.y + s * t.scaleX * u + c * t.scaleY * v;
      const wx = add(add(mul(a, [px, px]), mul(cw, [py, py])), x),
        wy = add(add(mul(b, [px, px]), mul(d, [py, py])), y);
      if (!bounds)
        bounds = { minX: wx[0], maxX: wx[1], minY: wy[0], maxY: wy[1] };
      else {
        bounds.minX = Math.min(bounds.minX, wx[0]);
        bounds.maxX = Math.max(bounds.maxX, wx[1]);
        bounds.minY = Math.min(bounds.minY, wy[0]);
        bounds.maxY = Math.max(bounds.maxY, wy[1]);
      }
    }
  }
  return bounds;
}

/** Legacy validated-animation helper; overflow throws a structured Problem. */
export function animationBounds(p: Project, animationId: string): Bounds | null {
  const ranges=animationRanges(p,animationId);
  return geometryBounds(p,ranges.local,ranges.deform);
}
/** Conservative enclosure for the entire selected clock (including every source loop).
 * Source-clock correlation is deliberately discarded; this can add whitespace, never crop.
 * Public caller gets validation/reference/overflow errors, never a sampled approximation. */
export function targetBounds(input: Project, target: EvaluationTarget): Result<Bounds | null> {
  const valid=validate(input); if(!valid.ok)return valid;
  const p=valid.value;
  const checked=evaluateTarget(p,{target,time:0}); if(!checked.ok)return checked;
  try {
    let bounds: Bounds | null;
    if(target.kind==='animation') bounds=target.animationId===null
      ? geometryBounds(p,(_id,_property,setup)=>singleton(setup),()=>[0,0])
      : animationBounds(p,target.animationId);
    else {
      const composition=p.compositions!.find(c=>c.id===target.compositionId)!;
      const locals=new Map(p.bones.map(b=>[b.id,Object.fromEntries(Object.entries(b.setup).map(([k,v])=>[k,singleton(v)])) as Record<Channel['property'],I>]));
      const setup=new Map(p.bones.map(b=>[b.id,b.setup]));
      // Expansion already sorts groups. Never re-sort the adjacent crossfade pair.
      for(const track of compositionPrimitives(composition)) {
        if(track.alpha===0)continue;
        const upper=Math.min(composition.duration,track.end===undefined?composition.duration:track.end+track.fadeOut);
        // No positive-weight clock exists here (notably zero-duration outgoing entries).
        if(upper<track.start || (upper===track.start && (composition.loop || trackWeight(track,upper)===0)))continue;
        const animation=p.animations.find(a=>a.id===track.source.animationId)!;
        if(track.source.kind==='live') finite(track.source.offset+finite((upper-track.start)*track.source.speed));
        const mask=new Set(track.mask.map(m=>`${m.boneId}/${m.property}`));
        for(const channel of animation.channels) {
          if(!mask.has(`${channel.boneId}/${channel.property}`))continue;
          const fixedTime=track.source.kind==='frozen' ? track.source.entryTime : track.source.speed===0 ? track.source.offset : undefined;
          const source=fixedTime!==undefined
            ? singleton(sample(channel,sampledTime(fixedTime,animation.duration,animation.loop)))
            : channelRange(channel);
          const local=locals.get(channel.boneId)!, prior=local[channel.property];
          local[channel.property]=track.mode==='overwrite'
            ? hull(prior,add(mul(singleton(1-track.alpha),prior),mul(singleton(track.alpha),source)))
            : add(prior,mul([0,track.alpha],add(source,singleton(-setup.get(channel.boneId)![channel.property]))));
        }
      }
      bounds=geometryBounds(p,(id,property)=>locals.get(id)![property],()=>[0,0]);
    }
    return {ok:true,value:bounds,warnings:[]};
  } catch(error) {
    return {ok:false,error: error as {code:'INVALID_INPUT';path:string;message:string}};
  }
}
