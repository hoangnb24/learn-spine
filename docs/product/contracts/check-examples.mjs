// Conformance oracle for the examples, NOT a production loader or command engine.
import Ajv2020 from 'ajv/dist/2020.js';
import { readFileSync } from 'node:fs';
const schema = JSON.parse(readFileSync(new URL('./project-v0.schema.json', import.meta.url)));
const shape = new Ajv2020({ strict: true, allErrors: true }).compile(schema);
export function checkExample(p) {
  if (p?.formatVersion !== 0) return ['UNSUPPORTED_VERSION'];
  if (p?.requiredCapabilities?.some(c => c !== 'region-v0')) return ['UNSUPPORTED_CAPABILITY'];
  if (!shape(p)) return ['INVALID_INPUT'];
  const errors = [];
  for (const list of [p.assets, p.bones, p.slots, p.attachments, p.animations]) {
    if (new Set(list.map(x => x.id)).size !== list.length) errors.push('INVALID_INPUT');
  }
  const bones = new Map(p.bones.map(x => [x.id, x]));
  const assets = new Set(p.assets.map(x => x.id));
  const attachments = new Set(p.attachments.map(x => x.id));
  if (new Set(p.assets.map(x => x.path)).size !== p.assets.length) errors.push('INVALID_INPUT');
  for (const asset of p.assets) {
    if (asset.trimX + asset.pixelWidth > asset.originalWidth || asset.trimY + asset.pixelHeight > asset.originalHeight) errors.push('INVALID_INPUT');
  }
  for (const bone of p.bones) {
    const seen = new Set();
    let current = bone;
    while (current) {
      if (seen.has(current.id)) { errors.push('PARENT_CYCLE'); break; }
      seen.add(current.id);
      if (current.parentId === null) break;
      if (!bones.has(current.parentId)) { errors.push('MISSING_REFERENCE'); break; }
      current = bones.get(current.parentId);
    }
  }
  for (const slot of p.slots) {
    if (!bones.has(slot.boneId) || (slot.attachmentId !== null && !attachments.has(slot.attachmentId))) errors.push('MISSING_REFERENCE');
  }
  for (const region of p.attachments) if (!assets.has(region.assetId)) errors.push('MISSING_REFERENCE');
  for (const animation of p.animations) {
    const channels = new Set();
    for (const channel of animation.channels) {
      if (!bones.has(channel.boneId)) errors.push('MISSING_REFERENCE');
      const id = `${channel.boneId}/${channel.property}`;
      if (channels.has(id)) errors.push('INVALID_INPUT');
      channels.add(id);
      let previous = -1;
      for (const key of channel.keys) {
        if (key.time <= previous || key.time > animation.duration) errors.push('INVALID_INPUT');
        previous = key.time;
        if (key.curve.type === 'bezier' && key.curve.x1 > key.curve.x2) errors.push('INVALID_INPUT');
      }
    }
  }
  return [...new Set(errors)];
}
export const examples = name => JSON.parse(readFileSync(new URL(`./examples/${name}`, import.meta.url)));
