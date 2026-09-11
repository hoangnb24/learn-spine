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

/** Serializable v1 fixture with an animated hip and a fixed planted target. */
export function createIKProject(): import('../../src/model/types').Project {
  const { bones, constraint } = createLeg();
  return { formatVersion: 1, projectId: 'standing-leg', revision: 0,
    requiredCapabilities: ['region-v0', 'ik-v1'], metadata: { name: 'Standing IK leg' },
    bones, ikConstraints: [constraint], assets: [], attachments: [], slots: [],
    animations: [{ id: 'idle', name: 'Idle planted leg', duration: 2, loop: true, channels: [
      { boneId: 'hip', property: 'y', keys: [
        { time: 0, value: 0, curve: { type: 'linear' } },
        { time: 1, value: -30, curve: { type: 'linear' } },
        { time: 2, value: 0, curve: { type: 'linear' } },
      ] },
    ] }],
  };
}
