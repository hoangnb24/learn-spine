import { validate } from '../model';
import type { Bone, Evaluator, Matrix, Pose, PoseRequest, Project, Result } from '../model/types';
import { localMatrix, multiply } from './transforms';
import { sample, sampledTime } from './timeline';
import { skinMesh } from './mesh';

export const evaluatorCapabilities = { poseVersion: 1, features: ['region-v0', 'mesh-v1'] } as const;
const invalid = (path: string, message: string): Result<never> =>
  ({ ok: false, error: { code: 'INVALID_INPUT', path, message } });

/** Stateless versioned evaluator; validates both boundaries and never retains project references. */
export function evaluate(project: Project, request: PoseRequest): Result<Pose> {
  const checked = validate(project);
  if (!checked.ok) return checked;
  const p = checked.value;
  if (!request || typeof request !== 'object' || Array.isArray(request))
    return invalid('', 'Expected pose request');
  const fields = Object.getOwnPropertyDescriptors(request);
  if (Object.keys(fields).some(k => k !== 'time' && k !== 'animationId') ||
      Reflect.ownKeys(request).length !== 2 || !fields.time || !fields.animationId ||
      !('value' in fields.time) || !('value' in fields.animationId))
    return invalid('', 'Expected animationId and time data fields only');
  const time: unknown = fields.time.value, id: unknown = fields.animationId.value;
  if (typeof time !== 'number' || !Number.isFinite(time)) return invalid('/time', 'Time must be finite');
  if (id !== null && (typeof id !== 'string' || !/^[A-Za-z0-9_.-]{1,100}$/.test(id)))
    return invalid('/animationId', 'Expected animation ID or null');
  const animation = id === null ? undefined : p.animations.find(a => a.id === id);
  if (id !== null && !animation)
    return { ok: false, error: { code: 'MISSING_REFERENCE', path: '/animationId', message: 'Animation does not exist', ids: [id as string] } };
  const at = animation ? sampledTime(time, animation.duration, animation.loop) : 0;
  const locals = new Map(p.bones.map(b => [b.id, { ...b.setup }]));
  for (const channel of animation?.channels ?? []) {
    const value = sample(channel, at);
    if (!Number.isFinite(value)) return invalid('/animations', 'Derived channel value must be finite');
    locals.get(channel.boneId)![channel.property] = value;
  }
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
  // #16 integration point: solveIK operates on fresh locals/worlds here, before skinning.
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
  return { ok: true, value: { poseVersion: 1, meshes, projectId: p.projectId, revision: p.revision, animationId: id as string | null,
    sampledTime: at, bones: Object.fromEntries(p.bones.map(b => [b.id, worlds.get(b.id)!])), regions }, warnings: [] };
}
export const evaluator: Evaluator = { evaluate };
