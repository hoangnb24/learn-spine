import type { Problem, Project } from './types';

/** Cross-field rules supplement the strict v1 JSON shape. Does not mutate input. */
export function meshProblem(p: Project): Problem | undefined {
  const invalid = (path: string, message: string): Problem => ({ code: 'INVALID_INPUT', path, message });
  const missing = (path: string, message: string): Problem => ({ code: 'MISSING_REFERENCE', path, message });
  const meshes = p.attachments.filter(a => a.type === 'mesh');
  if ((meshes.length || p.animations.some(a => a.deforms?.length)) && !p.requiredCapabilities.includes('mesh-v1'))
    return { code: 'UNSUPPORTED_CAPABILITY', path: '/requiredCapabilities', message: 'Mesh/deform data requires mesh-v1' };
  const bones = new Set(p.bones.map(b => b.id));
  for (const mesh of meshes) {
    const path = `/attachments/${p.attachments.indexOf(mesh)}`;
    const count = mesh.vertices.length / 2;
    if (!Number.isInteger(count) || mesh.uvs.length !== mesh.vertices.length || mesh.weights.length !== count)
      return invalid(path, 'Vertices, UV pairs and per-vertex weights must have matching lengths');
    if (mesh.triangles.length % 3 || mesh.triangles.some(index => index >= count))
      return invalid(`${path}/triangles`, 'Triangles must contain in-range index triples');
    const binds = new Set<string>();
    for (const [i, bind] of mesh.bindPose.entries()) {
      if (!bones.has(bind.boneId)) return missing(`${path}/bindPose/${i}/boneId`, 'Bind bone does not exist');
      if (binds.has(bind.boneId)) return invalid(`${path}/bindPose/${i}/boneId`, 'Duplicate bind bone');
      binds.add(bind.boneId);
      const [a,b,c,d] = bind.world, determinant = a*d-b*c;
      if (!Number.isFinite(determinant) || determinant === 0)
        return invalid(`${path}/bindPose/${i}/world`, 'Bind matrix must have a finite nonzero determinant');
    }
    for (const [i, weights] of mesh.weights.entries()) {
      const seen = new Set<string>();
      for (const [j, influence] of weights.entries()) {
        if (!bones.has(influence.boneId) || !binds.has(influence.boneId))
          return missing(`${path}/weights/${i}/${j}/boneId`, 'Influence requires an existing bone and bind matrix');
        if (seen.has(influence.boneId)) return invalid(`${path}/weights/${i}/${j}/boneId`, 'Duplicate influence bone');
        seen.add(influence.boneId);
      }
      if (Math.abs(weights.reduce((sum, w) => sum+w.weight, 0)-1) > 1e-5)
        return invalid(`${path}/weights/${i}`, 'Weights must sum to one within 1e-5; no implicit normalization');
    }
  }
  for (const [i, animation] of p.animations.entries()) {
    const seen = new Set<string>();
    for (const [j, channel] of (animation.deforms ?? []).entries()) {
      const path = `/animations/${i}/deforms/${j}`;
      const mesh = meshes.find(m => m.id === channel.attachmentId);
      if (!mesh) return missing(`${path}/attachmentId`, 'Deform target must be a mesh');
      if (seen.has(mesh.id)) return invalid(path, 'Duplicate mesh deform channel');
      seen.add(mesh.id);
      let previous = -1;
      for (const [k, key] of channel.keys.entries()) {
        if (key.time <= previous || key.time > animation.duration)
          return invalid(`${path}/keys/${k}/time`, 'Key times must increase strictly within duration');
        previous = key.time;
        if (key.offsets.length !== mesh.vertices.length)
          return invalid(`${path}/keys/${k}/offsets`, 'One XY offset is required per mesh vertex');
        if (key.curve.type === 'bezier' && key.curve.x1 > key.curve.x2)
          return invalid(`${path}/keys/${k}/curve/x2`, 'Bezier requires x1 <= x2');
      }
    }
  }
}
