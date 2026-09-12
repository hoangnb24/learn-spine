import { createIKProject } from '../../fixtures/ik/leg';
import type { Animation, Channel, Composition, CompositionMask, FrozenCrossfade, Result, TransformTrack } from '../../src/model';
export const value = <T>(r: Result<T>): T => { if (!r.ok) throw Error(JSON.stringify(r.error)); return r.value; };
export const channel = (boneId: string, property: Channel['property'], values: number[]): Channel => ({ boneId, property,
  keys: values.map((value, i) => ({ time: i / (values.length - 1 || 1), value, curve: { type: 'linear' } })) });
export const mask: CompositionMask = [{ boneId: 'hip', property: 'y' }, { boneId: 'arm', property: 'rotation' }, { boneId: 'target', property: 'x' }];
export function track(animationId = 'walk', order = 0, extra: Partial<TransformTrack> = {}): TransformTrack {
  return { kind: 'track', id: `${animationId}-${order}`, order, source: { kind: 'live', animationId, offset: 0, speed: 1 },
    mask: structuredClone(mask), mode: 'overwrite', alpha: 1, start: 0, fadeIn: 0, fadeOut: 0, ...extra };
}
export const crossfade = (): FrozenCrossfade => ({ kind: 'crossfade', id: 'stop-entry', order: 1, start: 1, duration: .4,
  outgoing: { animationId: 'walk', entryTime: 1, mask: structuredClone(mask) },
  incoming: { animationId: 'stop', offset: 0, speed: 1, mask: structuredClone(mask) } });
export const composition = (tracks: Composition['tracks'] = [track()]): Composition => ({ id: 'motion', name: 'Motion', duration: 2, loop: false, tracks });
export function fixture() {
  const p = createIKProject();
  p.bones.push({ id: 'arm', name: 'Arm', parentId: 'hip', setup: { x: 0, y: 20, rotation: .2, scaleX: 1, scaleY: 1 } });
  const a = (id: string, channels: Channel[], loop = true): Animation => ({ id, name: id, duration: 1, loop, channels });
  p.animations = [a('walk', [channel('hip', 'y', [0, -20, 0]), channel('arm', 'rotation', [.4, .8, .4]), channel('target', 'x', [120, 100, 120])]),
    a('wave', [channel('arm', 'rotation', [.6, 1, .6])]),
    a('stop', [channel('hip', 'y', [0, -10, -10]), channel('target', 'x', [120, 120, 120]), channel('arm', 'rotation', [.4, .2, .2])], false)];
  p.requiredCapabilities.push('composition-v1'); p.compositions = [composition()];
  return p;
}
