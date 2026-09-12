import { validate } from '../model';
import type { Matrix, Mesh, RenderablePose, EvaluationTarget, Problem, Project, Result } from '../model/types';
import { evaluate, evaluateTarget, compositionPrimitives } from '../engine';

export const policy = Object.freeze({ version: 1, intervals: 60, distancePx: 0.5,
  weightSumTolerance: 1e-5, velocityFraction: 0.05, velocityFloorPxPerSecond: 0.5,
  areaEpsilonPxSquared: 1e-8, maxSamples: 512, maxAnchors: 256, maxLoopPoints: 4096,
  maxElements: 20_000, maxElementSamples: 2_000_000, maxPageSize: 500 });
export interface PageRequest { offset?: number; limit?: number }
export type Point = { kind: 'bone'; boneId: string; local?: [number, number] } |
  { kind: 'vertex'; slotId: string; vertex: number } | { kind: 'ik'; constraintId: string };
export interface Anchor { id: string; point: Point; target: [number, number]; start?: number; end?: number }
export type MotionRequest = PageRequest & { anchors?: Anchor[]; loopPoints?: Point[] } & ({ animationId: string } | { target: EvaluationTarget });
export interface Diagnostic {
  kind: 'invalid-weights' | 'invalid-project' | 'anchor-drift' | 'foot-target' |
    'triangle-flip' | 'triangle-degenerate' | 'loop-position' | 'loop-velocity';
  ids: string[]; time: number | null; units: 'px' | 'px/s' | 'px²' | 'weight' | 'structural';
  observed: number | null; threshold: number | null; message: string;
  vertex?: number; triangle?: number; path?: string; status?: string;
  point?: Point; sampledPeakSpeed?: number; sampledTime?: number;
}
export interface DiagnosticReport {
  projectId: string | null; revision: number | null; valid: boolean; passed: boolean;
  policy: typeof policy; sampling: { animationId?: string | null; target?: EvaluationTarget; times: number[]; sampledTimes?: number[]; boundaryPolicy?: string;
    evaluationCount: number; h: number | null; loopChecked: boolean };
  items: Diagnostic[]; total: number; nextOffset: number | null;
  validationProblem?: Problem;
}
const failure = (path: string, message: string, code: Problem['code'] = 'INVALID_INPUT'): Result<never> =>
  ({ ok: false, error: { code, path, message } });
const success = <T>(value: T): Result<T> => ({ ok: true, value, warnings: [] });
const data = (v: unknown, key: string): unknown => {
  if (v === null || typeof v !== 'object') return undefined;
  const d = Object.getOwnPropertyDescriptor(v, key);
  return d && 'value' in d ? d.value : undefined;
};
function requestData(value: unknown, ancestors = new Set<object>()): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object' || ancestors.size > 16 || ancestors.has(value)) return false;
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) return false;
  ancestors.add(value);
  for (const key of Reflect.ownKeys(value)) {
    if (Array.isArray(value) && key === 'length') continue;
    const descriptor = Object.getOwnPropertyDescriptor(value,key)!;
    if (typeof key !== 'string' || !descriptor.enumerable || !('value' in descriptor) || !requestData(descriptor.value,ancestors)) return false;
  }
  if (Array.isArray(value) && Object.keys(value).length !== value.length) return false;
  ancestors.delete(value); return true;
}
function page(input: PageRequest): Result<{ offset: number; limit: number }> {
  const offset = input.offset ?? 0, limit = input.limit ?? 100;
  return Number.isSafeInteger(offset) && offset >= 0 && Number.isSafeInteger(limit) && limit > 0 && limit <= policy.maxPageSize
    ? success({ offset, limit }) : failure('/page', 'Expected nonnegative safe offset and limit in [1,500]');
}
function collector(p: { offset: number; limit: number }) {
  const items: Diagnostic[] = []; let total = 0;
  return { add(item: Diagnostic) { if (total >= p.offset && items.length < p.limit) items.push(item); total++; },
    finish() { return { items, total, passed:total===0, nextOffset: total > p.offset + items.length ? p.offset + items.length : null }; } };
}
function header(input: unknown): Pick<DiagnosticReport, 'projectId' | 'revision'> {
  const id = data(input, 'projectId'), revision = data(input, 'revision');
  return { projectId: typeof id === 'string' ? id : null, revision: typeof revision === 'number' && Number.isSafeInteger(revision) ? revision : null };
}
/** Ajv oneOf may expose a region-branch error before the actual mesh weight error.
 * Inspect data descriptors only, without weakening or repairing strict validation. */
function weightProblem(input: unknown): Problem | undefined {
  const attachments = data(input, 'attachments'), bones = data(input, 'bones');
  if (!Array.isArray(attachments) || !Array.isArray(bones)) return;
  const boneIds = new Set(Array.from({length:Math.min(bones.length,policy.maxElements)},(_,i)=>data(data(bones,String(i)),'id')));
  let inspected = 0;
  for (let a=0; a<Math.min(attachments.length,policy.maxElements); a++) {
    const mesh=data(attachments,String(a)); if(data(mesh,'type')!=='mesh')continue;
    const weights=data(mesh,'weights'),vertices=data(mesh,'vertices'),binds=data(mesh,'bindPose');
    const root=`/attachments/${a}/weights`;
    const issue=(path:string,message:string):Problem=>({code:'INVALID_INPUT',path,message});
    if(!Array.isArray(weights))return issue(root,'Expected per-vertex weights');
    if(Array.isArray(vertices)&&weights.length!==vertices.length/2)return issue(root,'One weight list is required per vertex');
    const bindIds=new Set(Array.isArray(binds)?Array.from({length:Math.min(binds.length,policy.maxElements)},(_,i)=>data(data(binds,String(i)),'boneId')):[]);
    for(let v=0;v<weights.length;v++) {
      if(++inspected>policy.maxElements)return;
      const influences=data(weights,String(v)); const path=`${root}/${v}`;
      if(!Array.isArray(influences)||influences.length===0)return issue(path,'Expected nonempty influences');
      let sum=0;const seen=new Set<unknown>();
      for(let j=0;j<influences.length;j++) {
        if(++inspected>policy.maxElements)return;
        const influence=data(influences,String(j)),w=data(influence,'weight'),id=data(influence,'boneId');
        if(typeof w!=='number'||!Number.isFinite(w)||w<0||w>1)return issue(`${path}/${j}/weight`,'Weight must be finite and in [0,1]');
        if(!boneIds.has(id)||!bindIds.has(id))return issue(`${path}/${j}/boneId`,'Influence requires an existing bone and bind matrix');
        if(seen.has(id))return issue(`${path}/${j}/boneId`,'Duplicate influence bone');
        seen.add(id);sum+=w;
      }
      if(!Number.isFinite(sum)||Math.abs(sum-1)>policy.weightSumTolerance)return issue(path,'Weights must sum to one within 1e-5; no implicit normalization');
    }
  }
}
function invalidReport(input: unknown, problem: Problem, p: { offset: number; limit: number }): DiagnosticReport {
  const modelProblem = problem; problem = weightProblem(input) ?? problem;
  const c = collector(p), weights = /^\/attachments\/\d+\/weights(?:\/|$)/.test(problem.path);
  const segments = problem.path.split('/').slice(1);
  let value: unknown = input;
  for (const segment of segments) value = data(value, segment);
  const attachment = data(data(input, 'attachments'), segments[1] ?? ''), id = data(attachment, 'id');
  let observed: number | null = typeof value === 'number' && Number.isFinite(value) ? value : null;
  let threshold: number | null = null;
  if (weights && problem.message.includes('sum to one') && Array.isArray(value)) {
    let sum = 0;
    for (let i = 0; i < value.length; i++) {
      const weight = data(data(value, String(i)), 'weight');
      if (typeof weight !== 'number' || !Number.isFinite(weight)) { sum = NaN; break; }
      sum += weight;
    }
    observed = Number.isFinite(sum) ? Math.abs(sum - 1) : null; threshold = policy.weightSumTolerance;
  } else if (weights && segments.at(-1) === 'weight' && observed !== null) threshold = observed > 1 ? 1 : 0;
  c.add({ kind: weights ? 'invalid-weights' : 'invalid-project', ids: typeof id === 'string' ? [id] : problem.ids ?? [],
    time: null, units: weights ? 'weight' : 'structural', observed, threshold,
    path: problem.path, message: problem.message });
  return { ...header(input), valid: false, policy, sampling: { animationId: null, times: [], evaluationCount: 0, h: null, loopChecked: false },
    ...c.finish(), validationProblem: modelProblem };
}
export function validate_project(input: unknown, request: PageRequest = {}): Result<DiagnosticReport> {
  if (!request || typeof request !== 'object' || Array.isArray(request) || !requestData(request) || Object.keys(request).some(k=>!['offset','limit'].includes(k))) return failure('/page', 'Expected JSON page request');
  const p = page(request); if (!p.ok) return p;
  const checked = validate(input);
  return success(checked.ok ? { ...header(checked.value), valid: true, policy,
    sampling: { animationId: null, times: [], evaluationCount: 0, h: null, loopChecked: false }, ...collector(p.value).finish() }
    : invalidReport(input, checked.error, p.value));
}
const xy = (m: Matrix, p: readonly number[]): [number, number] => [m[0]*p[0]+m[2]*p[1]+m[4], m[1]*p[0]+m[3]*p[1]+m[5]];
const distance = (a: readonly number[], b: readonly number[]) => Math.hypot(a[0]-b[0], a[1]-b[1]);
const determinant = (m: Matrix) => m[0]*m[3]-m[1]*m[2];
function point(pose: RenderablePose, ref: Point): [number, number] {
  if (ref.kind === 'bone') return xy(pose.bones[ref.boneId], ref.local ?? [0, 0]);
  if (ref.kind === 'ik') return [...pose.ik!.find(i => i.constraintId === ref.constraintId)!.endpoint];
  const mesh = pose.meshes.find(m => m.slotId === ref.slotId)!;
  return [mesh.vertices[2*ref.vertex], mesh.vertices[2*ref.vertex+1]];
}
function pointIds(ref: Point): string[] { return [ref.kind === 'bone' ? ref.boneId : ref.kind === 'vertex' ? ref.slotId : ref.constraintId]; }
function checkPoint(p: Project, ref: Point): boolean {
  if (!ref || typeof ref !== 'object') return false;
  if (ref.kind === 'bone') return p.bones.some(b => b.id === ref.boneId) &&
    (ref.local === undefined || (Array.isArray(ref.local) && ref.local.length === 2 && ref.local.every(Number.isFinite)));
  if (ref.kind === 'ik') return !!p.ikConstraints?.some(i => i.id === ref.constraintId);
  if (ref.kind !== 'vertex' || !Number.isSafeInteger(ref.vertex) || ref.vertex < 0) return false;
  const slot = p.slots.find(s => s.id === ref.slotId), mesh = p.attachments.find(m => m.id === slot?.attachmentId);
  return mesh?.type === 'mesh' && ref.vertex < mesh.vertices.length/2;
}
function commonAncestor(p: Project, mesh: Mesh): string | undefined {
  const bones = new Map(p.bones.map(b => [b.id, b]));
  const chains = [...new Set(mesh.weights.flatMap(w => w.filter(i => i.weight > 0).map(i => i.boneId)))].map(id => {
    const chain: string[] = []; let current: string | null = id;
    while (current !== null) { chain.push(current); current = bones.get(current)!.parentId; }
    return chain;
  });
  return chains[0]?.find(id => chains.every(c => c.includes(id)));
}
function area(v: number[], t: number[], i: number) {
  const a = 2*t[i], b = 2*t[i+1], c = 2*t[i+2];
  return (v[b]-v[a])*(v[c+1]-v[a+1])-(v[b+1]-v[a+1])*(v[c]-v[a]);
}

export function measure_motion(input: unknown, request: MotionRequest): Result<DiagnosticReport> {
  if (!request || typeof request !== 'object' || Array.isArray(request) || !requestData(request) || Object.keys(request).some(k=>!['animationId','target','anchors','loopPoints','offset','limit'].includes(k))) return failure('', 'Expected JSON motion request');
  const pagination = page(request); if (!pagination.ok) return pagination;
  const checked = validate(input);
  if (!checked.ok) return success(invalidReport(input, checked.error, pagination.value));
  if (('target' in request) === ('animationId' in request)) return failure('/target', 'Supply exactly one target or animationId');
  const p = checked.value, target: EvaluationTarget = 'target' in request ? request.target : {kind:'animation',animationId:request.animationId};
  const probe=evaluateTarget(p,{target,time:0}); if(!probe.ok)return probe;
  const animation = target.kind === 'composition' ? p.compositions?.find(c=>c.id===target.compositionId)
    : p.animations.find(a=>a.id===target.animationId);
  if (!animation) return failure('/target', 'Motion diagnostics require an animation or composition', 'MISSING_REFERENCE');
  const duration = animation.duration, loop = animation.loop, h = Math.min(1/600, duration/600);
  if (!(h > 0 && duration-h < duration && duration-2*h < duration-h)) return failure('/target', 'Duration cannot support distinct finite-difference times');
  const anchors = request.anchors ?? [];
  if (!Array.isArray(anchors) || anchors.length > policy.maxAnchors) return failure('/anchors', 'At most 256 anchors are supported', 'LIMIT_EXCEEDED');
  const anchorIds = new Set<string>();
  for (const a of anchors) {
    if (!a || typeof a.id !== 'string' || !/^[A-Za-z0-9_.-]{1,100}$/.test(a.id) || anchorIds.has(a.id) ||
      !checkPoint(p, a.point) || !Array.isArray(a.target) || a.target.length !== 2 || !a.target.every(Number.isFinite) ||
      !Number.isFinite(a.start ?? 0) || !Number.isFinite(a.end ?? duration) || (a.start ?? 0) < 0 ||
      (a.end ?? duration) > duration || (a.start ?? 0) > (a.end ?? duration)) return failure('/anchors', 'Invalid anchor ID, point, world target or interval');
    anchorIds.add(a.id);
  }
  const points: Point[] = request.loopPoints ?? [
    ...p.bones.map(b => ({ kind: 'bone' as const, boneId: b.id })),
    ...p.slots.flatMap(s => { const m = p.attachments.find(a => a.id === s.attachmentId);
      return m?.type === 'mesh' ? Array.from({ length: m.vertices.length/2 }, (_, vertex) => ({ kind: 'vertex' as const, slotId: s.id, vertex })) : []; }),
    ...(p.ikConstraints ?? []).map(i => ({ kind: 'ik' as const, constraintId: i.id })) ];
  if (!Array.isArray(points) || points.length > policy.maxLoopPoints) return failure('/loopPoints', 'At most 4096 loop points are supported', 'LIMIT_EXCEEDED');
  if (!points.every(ref => checkPoint(p, ref))) return failure('/loopPoints', 'Invalid point reference');
  const base = new Set<number>(Array.from({ length: policy.intervals+1 }, (_, i) => duration*(i/policy.intervals)));
  // Composition clocks include fade/transition boundaries. Live source keys are covered by
  // the fixed grid; diagnostics are sampled evidence, not a continuous-coverage claim.
  const keys = 'tracks' in animation ? compositionPrimitives(animation).flatMap(t=>[t.start,t.start+t.fadeIn,...(t.end===undefined?[]:[t.end,t.end+t.fadeOut])]).filter(t=>t>=0 && t<=duration)
    : [...animation.channels.flatMap(c => c.keys.map(k => k.time)), ...(animation.deforms ?? []).flatMap(c => c.keys.map(k => k.time))];
  for (const t of keys) { base.add(t); if (t > 0 && t < duration) { base.add(Math.max(0,t-h)); base.add(Math.min(duration,t+h)); } }
  for (const a of anchors) { base.add(a.start ?? 0); base.add(a.end ?? duration); }
  const times = [...base].sort((a,b) => a-b), evalTimes = new Set(times);
  if (loop && points.length) {
    evalTimes.add(h); evalTimes.add(2*h); evalTimes.add(duration-h); evalTimes.add(duration-2*h);
    for (const t of times) if (t >= h && t <= duration-h) { evalTimes.add(t-h); evalTimes.add(t+h); }
  }
  const elements = p.bones.length + (p.ikConstraints?.length ?? 0) + p.slots.reduce((sum, s) => {
    const m = p.attachments.find(a => a.id === s.attachmentId); return sum + (m?.type === 'mesh' ? m.vertices.length/2 + m.triangles.length/3 : 1);
  }, 0);
  const extraBoundary='target' in request && loop ? 1 : 0;
  if (evalTimes.size+1+extraBoundary > policy.maxSamples || elements > policy.maxElements || (elements+anchors.length+points.length)*(evalTimes.size+1+extraBoundary) > policy.maxElementSamples)
    return failure('/sampling', 'Diagnostic sampling workload exceeds fixed limits', 'LIMIT_EXCEEDED');
  const setup = evaluate(p, { animationId: null, time: 0 }); if (!setup.ok) return setup;
  // Legacy diagnostics retain authored-end sampling. Canonical samples keep normalized clocks.
  if (!('target' in request)) animation.loop = false;
  const poses = new Map<number, RenderablePose>();
  for (const time of [...evalTimes].sort((a,b) => a-b)) {
    const sampled = "target" in request ? evaluateTarget(p, {target,time}) : evaluate(p, { animationId: animation.id, time }); if (!sampled.ok) return sampled;
    poses.set(time, sampled.value);
  }
  // Only loop comparison inspects the authored end before wrapping; source clocks are unchanged.
  let authoredEnd: RenderablePose | undefined;
  if ('target' in request && loop) {
    animation.loop=false;
    const end=evaluateTarget(p,{target,time:duration}); if(!end.ok)return end;
    authoredEnd=end.value;
    animation.loop=loop;
  }
  const raw = collector(pagination.value);
  const c = { finish:raw.finish, add(item: Diagnostic) {
    raw.add('target' in request && item.time !== null ? {...item,sampledTime:poses.get(item.time)?.sampledTime ?? item.time} : item);
  } };
  const ancestors = new Map(p.attachments.filter((a): a is Mesh => a.type === 'mesh').map(m => [m.id, commonAncestor(p, m)]));
  for (const time of times) {
    const pose = poses.get(time)!;
    for (const a of anchors) if (time >= (a.start ?? 0) && time <= (a.end ?? duration)) {
      const observed = distance(point(pose,a.point),a.target);
      if (!Number.isFinite(observed)) return failure('/anchors', 'Derived anchor distance must be finite');
      if (observed > policy.distancePx) c.add({ kind:'anchor-drift', point:structuredClone(a.point), ids:[a.id,...pointIds(a.point)], time, units:'px', observed, threshold:policy.distancePx,
        ...(a.point.kind === 'vertex' ? { vertex:a.point.vertex } : {}), message:'Point moved away from its declared fixed world target' });
    }
    for (const ik of pose.ik ?? []) if (ik.distance > policy.distancePx) c.add({ kind:'foot-target',ids:[ik.constraintId], time,units:'px',observed:ik.distance,threshold:policy.distancePx,status:ik.status,message:'Final IK endpoint differs from final target' });
    for (const mesh of pose.meshes) {
      const reference = setup.value.meshes.find(m => m.slotId === mesh.slotId)!;
      const ancestor = ancestors.get(mesh.attachmentId);
      const currentDet = ancestor ? determinant(pose.bones[ancestor]) : 1;
      const setupDet = ancestor ? determinant(setup.value.bones[ancestor]) : 1;
      if (!Number.isFinite(currentDet) || !Number.isFinite(setupDet)) return failure('/triangles','Reflection determinant must be finite');
      const reflection = Math.sign(currentDet)*Math.sign(setupDet);
      for (let i=0; i<mesh.triangles.length; i+=3) {
        const before = area(reference.vertices,reference.triangles,i), after = area(mesh.vertices,mesh.triangles,i);
        if (!Number.isFinite(before) || !Number.isFinite(after)) return failure('/triangles','Derived triangle area must be finite');
        const degenerate = Math.abs(before) <= policy.areaEpsilonPxSquared || Math.abs(after) <= policy.areaEpsilonPxSquared || reflection === 0;
        if (degenerate || Math.sign(before)*Math.sign(after)*reflection < 0)
          c.add({kind:degenerate?'triangle-degenerate':'triangle-flip',ids:[mesh.slotId,mesh.attachmentId],time,units:'px²',
            observed: degenerate ? Math.min(Math.abs(before),Math.abs(after)) : Math.sign(before)*after*reflection,
            threshold:policy.areaEpsilonPxSquared,triangle:i/3,message:degenerate?'Setup or sampled triangle has no reliable orientation':'Triangle orientation inverted after common-ancestor reflection compensation'});
      }
    }
  }
  if (loop && points.length) for (const ref of points) {
    const at = (t: number) => point(t===duration && authoredEnd ? authoredEnd : poses.get(t)!,ref);
    const derivative = (t: number): [number,number] => {
      if (t < h) { const a=at(0),b=at(h),d=at(2*h); return [(3*(b[0]-a[0])-(d[0]-b[0]))/(2*h),(3*(b[1]-a[1])-(d[1]-b[1]))/(2*h)]; }
      if (t > duration-h) { const a=at(duration),b=at(duration-h),d=at(duration-2*h); return [(3*(a[0]-b[0])-(b[0]-d[0]))/(2*h),(3*(a[1]-b[1])-(b[1]-d[1]))/(2*h)]; }
      const a=at(t-h),b=at(t+h); return [(b[0]-a[0])/(2*h),(b[1]-a[1])/(2*h)];
    };
    const startV=derivative(0),endV=derivative(duration);
    const peak=Math.max(...times.map(t=>Math.hypot(...derivative(t))));
    const position=distance(at(0),at(duration)), velocity=distance(startV,endV), threshold=Math.max(policy.velocityFloorPxPerSecond,policy.velocityFraction*peak);
    if (![position,velocity,threshold].every(Number.isFinite)) return failure('/loopPoints','Derived loop measurements must be finite');
    const identity = {point:structuredClone(ref),ids:pointIds(ref),time:duration,...(ref.kind==='vertex'?{vertex:ref.vertex}:{})};
    if (position>policy.distancePx) c.add({...identity,kind:'loop-position',units:'px',observed:position,threshold:policy.distancePx,message:'Authored end differs from loop start'});
    if (velocity>threshold) c.add({...identity,kind:'loop-velocity',units:'px/s',observed:velocity,threshold,sampledPeakSpeed:peak,message:`Boundary velocity vector mismatch; sampled peak ${peak} px/s`});
  }
  return success({...header(p),valid:true,policy,sampling:{...('target' in request ? {target:structuredClone(target),sampledTimes:times.map(t=>poses.get(t)!.sampledTime),boundaryPolicy:'Loop seam compares authored end before target wrap; source clocks unchanged'} : {animationId:animation.id}),times,evaluationCount:poses.size+1+(authoredEnd?1:0),h,loopChecked:loop&&points.length>0},...c.finish()});
}
