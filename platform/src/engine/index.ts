import { validate } from '../model';
import type { Animation, Bone, TargetEvaluator, EvaluationTarget, Matrix, Pose, PoseRequest, Project, Result, TargetPose, TargetPoseRequest, Transform } from '../model/types';
import { localMatrix, multiply } from './transforms';
import { sample, sampledTime } from './timeline';
import { skinMesh } from './mesh';
import { solveIK } from './ik';
import { composeLocals } from './composition';
export { compositionPrimitives, trackWeight } from './composition';

export const evaluatorCapabilities = { poseVersion: 1, features: ['region-v0', 'mesh-v1', 'ik-v1', 'composition-v1'] } as const;
const invalid = (path: string, message: string): Result<never> =>
  ({ ok: false, error: { code: 'INVALID_INPUT', path, message } });
/** Data descriptors only: no getters, symbols, unknown fields or non-plain request objects. */
function fields(input: unknown, names: string[]): Record<string, PropertyDescriptor> | undefined {
  if (!input || typeof input !== 'object' || Array.isArray(input) || ![Object.prototype, null].includes(Object.getPrototypeOf(input))) return;
  const descriptors = Object.getOwnPropertyDescriptors(input);
  if (Reflect.ownKeys(input).length !== names.length || names.some(k => !descriptors[k] || !descriptors[k].enumerable || !('value' in descriptors[k]))) return;
  return descriptors;
}
const validId = (id: unknown): id is string => typeof id === 'string' && /^[A-Za-z0-9_.-]{1,100}$/.test(id) && !id.endsWith('\n');

/** Compatibility wrapper: legacy requests retain their exact shape and result semantics. */
export function evaluate(project: Project, request: PoseRequest): Result<Pose> {
  const checked = validate(project);
  if (!checked.ok) return checked;
  const f = fields(request, ['animationId', 'time']);
  if (!f) return invalid('', 'Expected animationId and time data fields only');
  const result = evaluateChecked(checked.value, { target: { kind: 'animation', animationId: f.animationId.value }, time: f.time.value });
  if (!result.ok) return { ...result, error: { ...result.error, path: result.error.path.replace('/target/animationId', '/animationId') } };
  const { target, ...pose } = result.value;
  return { ok: true, value: { ...pose, animationId: (target as Extract<EvaluationTarget, { kind: 'animation' }>).animationId }, warnings: result.warnings };
}
/** Stateless canonical boundary: absolute request time normalizes against its selected target. */
export function evaluateTarget(project: Project, request: TargetPoseRequest): Result<TargetPose> {
  const checked = validate(project);
  if (!checked.ok) return checked;
  return evaluateChecked(checked.value, request);
}
function evaluateChecked(p: Project, request: TargetPoseRequest): Result<TargetPose> {
  const f = fields(request, ['target', 'time']);
  if (!f) return invalid('', 'Expected target and time data fields only');
  const time: unknown = f.time.value;
  if (typeof time !== 'number' || !Number.isFinite(time)) return invalid('/time', 'Time must be finite');
  const animationFields = fields(f.target.value, ['kind', 'animationId']);
  const compositionFields = fields(f.target.value, ['kind', 'compositionId']);
  let target: EvaluationTarget, animation: Animation | undefined;
  let at: number;
  let locals: Map<string, Transform>;
  if (animationFields?.kind.value === 'animation') {
    const id: unknown = animationFields.animationId.value;
    if (id !== null && !validId(id)) return invalid('/target/animationId', 'Expected animation ID or null');
    target = { kind: 'animation', animationId: id };
    animation = id === null ? undefined : p.animations.find(a => a.id === id);
    if (id !== null && !animation) return { ok: false, error: { code: 'MISSING_REFERENCE', path: '/target/animationId', message: 'Animation does not exist', ids: [id] } };
    at = animation ? sampledTime(time, animation.duration, animation.loop) : 0;
    locals = new Map(p.bones.map(b => [b.id, { ...b.setup }]));
    for (const channel of animation?.channels ?? []) {
      const value = sample(channel, at);
      if (!Number.isFinite(value)) return invalid('/animations', 'Derived channel value must be finite');
      locals.get(channel.boneId)![channel.property] = value;
    }
  } else if (compositionFields?.kind.value === 'composition') {
    const id: unknown = compositionFields.compositionId.value;
    if (!validId(id)) return invalid('/target/compositionId', 'Expected composition ID');
    target = { kind: 'composition', compositionId: id };
    const composition = p.compositions?.find(c => c.id === id);
    if (!composition) return { ok: false, error: { code: 'MISSING_REFERENCE', path: '/target/compositionId', message: 'Composition does not exist', ids: [id] } };
    at = sampledTime(time, composition.duration, composition.loop);
    const composed = composeLocals(p, composition, at);
    if (!composed.ok) return composed;
    locals = composed.value;
  } else return invalid('/target', 'Expected animation or composition target with its identity only');
  return finalizePose(p, target, at, locals, animation);
}
/** Both target kinds use this one FK → ordered IK → skinning/region path. */
function finalizePose(p: Project, target: EvaluationTarget, at: number, locals: Map<string, Transform>, animation?: Animation): Result<TargetPose> {
  const source = new Map(p.bones.map(b => [b.id, b]));
  const worlds = new Map<string, Matrix>();
  for (const bone of p.bones) {
    const chain: Bone[] = [];
    let current: Bone | undefined = bone;
    while (current && !worlds.has(current.id)) {
      chain.push(current);
      current = current.parentId === null ? undefined : source.get(current.parentId);
    }
    for (const b of chain.reverse()) {
      const local = localMatrix(locals.get(b.id)!);
      const world = b.parentId === null ? local : multiply(worlds.get(b.parentId)!, local);
      if (!world.every(Number.isFinite)) return invalid(`/bones/${p.bones.indexOf(b)}/setup`, 'Derived matrix must be finite');
      worlds.set(b.id, world);
    }
  }
  const attachments = new Map(p.attachments.map(a => [a.id, a]));
  const ik = solveIK(p.bones, p.ikConstraints ?? [], locals, worlds);
  if (!ik.ok) return ik;
  const regions: Pose['regions'] = [];
  const meshes: Pose['meshes'] = [];
  for (const [i, slot] of p.slots.entries()) {
    if (slot.attachmentId === null) continue;
    const attachment = attachments.get(slot.attachmentId)!;
    if (attachment.type === 'mesh') {
      const geometry = skinMesh(attachment, worlds, animation?.deforms?.find(d => d.attachmentId === attachment.id), at);
      if (!geometry.ok) return geometry;
      meshes.push({slotId:slot.id,attachmentId:attachment.id,assetId:attachment.assetId,
        vertices:geometry.value,uvs:[...attachment.uvs],triangles:[...attachment.triangles]});
      continue;
    }
    const world = multiply(worlds.get(slot.boneId)!, localMatrix(attachment.transform));
    if (!world.every(Number.isFinite)) return invalid(`/slots/${i}`, 'Derived region matrix must be finite');
    regions.push({ slotId: slot.id, attachmentId: attachment.id, assetId: attachment.assetId, world });
  }
  return { ok: true, value: { poseVersion: 1, meshes, ...(p.ikConstraints === undefined ? {} : { ik: ik.value }), projectId: p.projectId, revision: p.revision, target,
    sampledTime: at, bones: Object.fromEntries(p.bones.map(b => [b.id, worlds.get(b.id)!])), regions }, warnings: [] };
}
export const evaluator: TargetEvaluator = { evaluate, evaluateTarget };
