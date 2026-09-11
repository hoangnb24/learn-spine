import type { Project, Transform } from '../../src/model';
export const identity: Transform = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
/** Synthetic metadata only: storage tests must supply matching PNG bytes/hash. */
export function createSyntheticProject(): Project {
  return {
    formatVersion: 0, projectId: 'synthetic', revision: 0, requiredCapabilities: ['region-v0'], metadata: { name: 'Synthetic robot' },
    assets: [{ id: 'art', name: 'Trimmed art', path: 'assets/art.png', mimeType: 'image/png', sha256: '0'.repeat(64), pixelWidth: 60, pixelHeight: 40, originalWidth: 100, originalHeight: 80, trimX: 10, trimY: 20 }],
    bones: [{ id: 'child', name: 'Child', parentId: 'root', setup: { ...identity, x: 3, y: 4 } }, { id: 'root', name: 'Root', parentId: null, setup: { ...identity, x: 10, y: 20, rotation: Math.PI / 2, scaleX: 2 } }],
    attachments: [{ id: 'region', type: 'region', assetId: 'art', transform: { ...identity }, width: 200, height: 160, pivotX: 100, pivotY: 0 }],
    slots: [{ id: 'body', name: 'Body', boneId: 'child', attachmentId: 'region' }],
    animations: [{ id: 'bounce', name: 'Bounce', duration: 2, loop: true, channels: [{ boneId: 'child', property: 'y', keys: [{ time: 0, value: 4, curve: { type: 'linear' } }, { time: 2, value: 8, curve: { type: 'stepped' } }] }] }],
  };
}
/** Hand-computed T03 answers for #8/#9; these are data, not evaluator output. */
export const t03Vectors = {
  rotatedChildWorldOrigin: [6, 26],
  mirroredParent: { ...identity, x: 10, y: 20, scaleX: -1 },
  mirroredChildWorldOrigin: [7, 24],
  trimmedBottomLeft: [-80, 40], trimmedTopRight: [40, 120],
} as const;
