import type { Matrix, Transform } from '../model/types';

export function localMatrix(t: Transform): Matrix {
  const c = Math.cos(t.rotation), s = Math.sin(t.rotation);
  return [c * t.scaleX, s * t.scaleX, -s * t.scaleY, c * t.scaleY, t.x, t.y];
}
export function multiply(p: Matrix, q: Matrix): Matrix {
  return [p[0]*q[0]+p[2]*q[1], p[1]*q[0]+p[3]*q[1],
    p[0]*q[2]+p[2]*q[3], p[1]*q[2]+p[3]*q[3],
    p[0]*q[4]+p[2]*q[5]+p[4], p[1]*q[4]+p[3]*q[5]+p[5]];
}
