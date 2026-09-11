import type { Bone, Transform } from '../../src/model/types';
import type { TwoBoneIK } from '../../src/model/ik';
const setup: Transform = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
/** Art-independent standing leg, logical pixels; fresh objects on every call. */
export function createLeg() {
  const bones: Bone[] = [
    { id: 'hip', name: 'Hip', parentId: null, setup: { ...setup } },
    { id: 'shin', name: 'Shin', parentId: 'hip', setup: { ...setup, x: 100 } },
    { id: 'foot', name: 'Foot', parentId: 'shin', setup: { ...setup, x: 100 } },
    { id: 'target', name: 'Target', parentId: null, setup: { ...setup, x: 120, y: -100 } },
  ];
  const constraint: TwoBoneIK = { id: 'leg', type: 'two-bone-ik', rootBoneId: 'hip',
    childBoneId: 'shin', targetBoneId: 'target', endpoint: [100, 0], bend: 1, mix: 1, order: 0 };
  return { bones, constraint };
}
