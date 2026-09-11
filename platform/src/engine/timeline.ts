import type { Channel, Curve } from '../model/types';

function weight(curve: Curve, time: number): number {
  if (curve.type === 'stepped') return 0;
  if (curve.type === 'linear') return time;
  const cubic = (u: number, a: number, b: number) =>
    3*(1-u)*(1-u)*u*a + 3*(1-u)*u*u*b + u*u*u;
  let lo = 0, hi = 1;
  // Fixed iteration count avoids dependence on previous seeks, including flat endpoints.
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (cubic(mid, curve.x1, curve.x2) < time) lo = mid;
    else hi = mid;
  }
  return cubic((lo + hi) / 2, curve.y1, curve.y2);
}
export function sample(channel: Channel, time: number): number {
  const keys = channel.keys;
  if (time <= keys[0].time) return keys[0].value;
  if (time >= keys[keys.length-1].time) return keys[keys.length-1].value;
  let lo = 0, hi = keys.length-1;
  while (hi-lo > 1) {
    const mid = Math.floor((lo+hi)/2);
    if (keys[mid].time <= time) lo = mid; else hi = mid;
  }
  const left = keys[lo], right = keys[hi];
  if (time === left.time) return left.value;
  const w = weight(left.curve, (time-left.time)/(right.time-left.time));
  // Weighted sum avoids overflow of right-left for opposite large finite values.
  return (1-w)*left.value + w*right.value;
}
export function sampledTime(time: number, duration: number, loop: boolean): number {
  if (!loop) return Math.max(0, Math.min(time, duration));
  const remainder = time % duration;
  // Avoid overflow from adding duration to an already-positive remainder.
  return remainder < 0 ? (remainder + duration) % duration : remainder === 0 ? 0 : remainder;
}
