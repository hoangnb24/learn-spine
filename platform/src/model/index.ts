import { Ajv2020 } from 'ajv/dist/2020.js';
import schema from './project-v0.schema.json';
import schemaV1 from './project-v1.schema.json';
import { meshProblem } from './mesh';
import { compositionProblem } from './composition';
import { ikProblem } from './ik';
import type { Model, Project, Result, Problem } from './types';
import { readJson } from './json';
export const modelCapabilities = { formatVersions: [0, 1], features: ['region-v0', 'mesh-v1', 'ik-v1', 'composition-v1'] } as const;
export type * from './types';

const shape = new Ajv2020({ strict: true, allErrors: false, ownProperties: true }).compile<Project>(schema);
const shapeV1 = new Ajv2020({ strict: true, allErrors: false, ownProperties: true }).compile<Project>(schemaV1);
const pointer = (key: string) => key.replace(/~/g, '~0').replace(/\//g, '~1');
const fail = (code: Problem['code'], path: string, message: string, ids?: string[]): Result<never> =>
  ({ ok: false, error: { code, path, message, ...(ids ? { ids } : {}) } });

/** Reject non-JSON memory values before cloning (including getters and cycles). */
function jsonProblem(value: unknown, path = '', ancestors = new Set<object>()): Problem | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? undefined : { code: 'INVALID_INPUT', path, message: 'Number must be finite' };
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value !== 'object') return { code: 'INVALID_INPUT', path, message: 'Expected JSON value' };
  if (ancestors.size > 128) return { code: 'INVALID_INPUT', path, message: 'JSON nesting exceeds 128 levels' };
  if (ancestors.has(value)) return { code: 'INVALID_INPUT', path, message: 'Cyclic object is not JSON' };
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
    return { code: 'INVALID_INPUT', path, message: 'Expected plain object' };
  ancestors.add(value);
  for (const key of Reflect.ownKeys(value)) {
    if (Array.isArray(value) && key === 'length') continue;
    const location = `${path}/${pointer(String(key))}`;
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
    if (typeof key !== 'string' || !descriptor.enumerable || !('value' in descriptor) ||
        (Array.isArray(value) && !/^(0|[1-9][0-9]*)$/.test(key)))
      return { code: 'INVALID_INPUT', path: location, message: 'Expected JSON data property' };
    const problem = jsonProblem(descriptor.value, location, ancestors);
    if (problem) return problem;
  }
  if (Array.isArray(value) && Object.keys(value).length !== value.length)
    return { code: 'INVALID_INPUT', path, message: 'Sparse arrays are not JSON' };
  ancestors.delete(value);
}

export function validate(input: unknown): Result<Project> {
  // Read headers through descriptors so invalid accessors are never executed.
  const object = input !== null && typeof input === 'object' ? input : {};
  const version = Object.getOwnPropertyDescriptor(object, 'formatVersion');
  if (version && 'value' in version && version.value !== 0 && version.value !== 1)
    return fail('UNSUPPORTED_VERSION', '/formatVersion', 'Supported formatVersions are 0 and 1');
  const caps = Object.getOwnPropertyDescriptor(object, 'requiredCapabilities');
  if (caps && 'value' in caps && Array.isArray(caps.value)) {
    for (let i = 0; i < caps.value.length; i++) {
      const cap = Object.getOwnPropertyDescriptor(caps.value, String(i));
      if (cap && 'value' in cap && typeof cap.value === 'string' && cap.value !== 'region-v0' && !(version && 'value' in version && version.value === 1 && (cap.value === 'mesh-v1' || cap.value === 'ik-v1' || cap.value === 'composition-v1')))
        return fail('UNSUPPORTED_CAPABILITY', `/requiredCapabilities/${i}`, 'Capability is not supported for this format');
    }
  }
  const memoryError = jsonProblem(input);
  if (memoryError) return { ok: false, error: memoryError };
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const fields = input as Record<string, unknown>;
    if (Object.hasOwn(fields, 'constraints')) return fail('UNSUPPORTED_CAPABILITY', '/constraints', 'Constraints require a future format');
    if (fields.formatVersion === 0 && Array.isArray(fields.attachments)) {
      for (const [i, attachment] of fields.attachments.entries())
        if (attachment && typeof attachment === 'object' && attachment.type === 'mesh')
          return fail('UNSUPPORTED_CAPABILITY', `/attachments/${i}/type`, 'Meshes require a future format');
    }
  }
  const check = version && 'value' in version && version.value === 1 ? shapeV1 : shape;
  if (!check(input)) {
    const error = check.errors![0];
    const key = error.params.missingProperty ?? error.params.additionalProperty;
    return fail('INVALID_INPUT', error.instancePath + (key ? `/${pointer(key)}` : ''), error.message ?? 'Invalid project');
  }
  const p = input;
  if (p.ikConstraints !== undefined && !p.requiredCapabilities.includes('ik-v1'))
    return fail('UNSUPPORTED_CAPABILITY', '/requiredCapabilities', 'IK constraints require ik-v1');
  const meshError = meshProblem(p);
  if (meshError) return { ok: false, error: meshError };
  const collections = ['assets', 'bones', 'slots', 'attachments', 'animations'] as const;
  for (const name of collections) {
    const seen = new Set<string>();
    for (const [i, entity] of p[name].entries()) {
      if (seen.has(entity.id)) return fail('INVALID_INPUT', `/${name}/${i}/id`, 'Duplicate ID in collection', [entity.id]);
      seen.add(entity.id);
    }
  }
  const bones = new Map(p.bones.map(b => [b.id, b]));
  const assets = new Set(p.assets.map(a => a.id));
  const attachments = new Set(p.attachments.map(a => a.id));
  for (const [i, bone] of p.bones.entries()) {
    if (bone.parentId !== null && !bones.has(bone.parentId)) return fail('MISSING_REFERENCE', `/bones/${i}/parentId`, 'Parent bone does not exist', [bone.id, bone.parentId]);
  }
  const visited = new Set<string>();
  for (const [i, bone] of p.bones.entries()) {
    const chain = new Set<string>();
    let current: typeof bone | undefined = bone;
    while (current && !visited.has(current.id)) {
      if (chain.has(current.id)) return fail('PARENT_CYCLE', `/bones/${i}/parentId`, 'Bone hierarchy contains a cycle', [...chain]);
      chain.add(current.id);
      current = current.parentId === null ? undefined : bones.get(current.parentId);
    }
    for (const id of chain) visited.add(id);
  }
  const ikError = ikProblem(p.bones, p.ikConstraints ?? []);
  if (ikError) return { ok: false, error: ikError };
  for (const [i, slot] of p.slots.entries()) {
    if (!bones.has(slot.boneId)) return fail('MISSING_REFERENCE', `/slots/${i}/boneId`, 'Slot bone does not exist', [slot.id, slot.boneId]);
    if (slot.attachmentId !== null && !attachments.has(slot.attachmentId)) return fail('MISSING_REFERENCE', `/slots/${i}/attachmentId`, 'Slot attachment does not exist', [slot.id, slot.attachmentId]);
  }
  for (const [i, region] of p.attachments.entries())
    if (!assets.has(region.assetId)) return fail('MISSING_REFERENCE', `/attachments/${i}/assetId`, 'Region asset does not exist', [region.id, region.assetId]);
  for (const [i, animation] of p.animations.entries())
    for (const [j, channel] of animation.channels.entries())
      if (!bones.has(channel.boneId)) return fail('MISSING_REFERENCE', `/animations/${i}/channels/${j}/boneId`, 'Channel bone does not exist', [animation.id, channel.boneId]);
  const paths = new Set<string>();
  for (const [i, asset] of p.assets.entries()) {
    if (paths.has(asset.path)) return fail('INVALID_INPUT', `/assets/${i}/path`, 'Duplicate asset path', [asset.id]);
    paths.add(asset.path);
    for (const axis of ['X', 'Y'] as const) {
      const dimension = axis === 'X' ? 'Width' : 'Height';
      if (asset[`trim${axis}`] + asset[`pixel${dimension}`] > asset[`original${dimension}`])
        return fail('INVALID_INPUT', `/assets/${i}/trim${axis}`, 'Trim exceeds original image', [asset.id]);
    }
  }
  for (const [i, animation] of p.animations.entries()) {
    const channels = new Set<string>();
    for (const [j, channel] of animation.channels.entries()) {
      const path = `/animations/${i}/channels/${j}`;
      const id = `${channel.boneId}/${channel.property}`;
      if (channels.has(id)) return fail('INVALID_INPUT', path, 'Duplicate bone/property channel', [animation.id, channel.boneId]);
      channels.add(id);
      let previous = -1;
      for (const [k, key] of channel.keys.entries()) {
        if (key.time <= previous || key.time > animation.duration)
          return fail('INVALID_INPUT', `${path}/keys/${k}/time`, 'Key times must increase strictly within duration', [animation.id, channel.boneId]);
        previous = key.time;
        if (key.curve.type === 'bezier' && key.curve.x1 > key.curve.x2)
          return fail('INVALID_INPUT', `${path}/keys/${k}/curve/x2`, 'Bezier requires x1 <= x2', [animation.id, channel.boneId]);
      }
    }
  }
  const compositionError = compositionProblem(p);
  if (compositionError) return { ok: false, error: compositionError };
  return { ok: true, value: structuredClone(p), warnings: [] };
}

export function migrate(input: unknown, targetVersion: 0 | 1): Result<Project> {
  if (targetVersion !== 0 && targetVersion !== 1) return fail('UNSUPPORTED_VERSION', '/formatVersion', 'Supported targets are 0 and 1');
  const checked = validate(input);
  if (!checked.ok) return checked;
  if (checked.value.formatVersion > targetVersion) return fail('UNSUPPORTED_VERSION', '/formatVersion', 'Downgrade is not supported');
  checked.value.formatVersion = targetVersion;
  return checked;
}
export function parse(text: string): Result<Project> {
  const json = readJson(text);
  return json.ok ? validate(json.value) : json;
}
export function serialize(input: unknown): Result<string> {
  const result = validate(input);
  return result.ok ? { ok: true, value: JSON.stringify(result.value), warnings: result.warnings } : result;
}
export const model: Model = { validate, migrate };
