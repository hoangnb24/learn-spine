// Translation-only loop placement. The clip supplies movement inside one cycle;
// skeleton.x/y carry the displacement of completed cycles into world space.
export function loopSample(elapsed, duration) {
  if (!Number.isFinite(elapsed) || elapsed < 0) throw new RangeError('Invalid elapsed time');
  if (!Number.isFinite(duration) || duration < 0) throw new RangeError('Invalid duration');
  if (duration === 0) return { time: 0, cycles: 0 };
  const cycles = Math.floor(elapsed / duration);
  return { time: elapsed - cycles * duration, cycles };
}

export function rootTravel(spine, data, animation) {
  function at(time) {
    const skeleton = new spine.Skeleton(data);
    animation.apply(skeleton, 0, time, false, [], 1, spine.MixBlend.replace, spine.MixDirection.mixIn);
    skeleton.updateWorldTransform(spine.Physics.update);
    return { x: skeleton.getRootBone().worldX, y: skeleton.getRootBone().worldY };
  }
  const start = at(0), end = at(animation.duration);
  return { x: end.x - start.x, y: end.y - start.y };
}

export function applyLoopPose(spine, skeleton, animation, elapsed, travel = { x: 0, y: 0 }) {
  const sample = loopSample(elapsed, animation?.duration ?? 0);
  skeleton.setToSetupPose();
  skeleton.x = sample.cycles * travel.x;
  skeleton.y = sample.cycles * travel.y;
  if (animation) animation.apply(skeleton, 0, sample.time, false, [], 1,
    spine.MixBlend.replace, spine.MixDirection.mixIn);
  skeleton.updateWorldTransform(spine.Physics.update);
  return sample;
}
