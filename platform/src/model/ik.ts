import type { Id } from './types';

/** Endpoint is a point in child-bone local space; target is the target bone origin. */
export interface TwoBoneIK {
  id: Id;
  type: 'two-bone-ik';
  rootBoneId: Id;
  childBoneId: Id;
  targetBoneId: Id;
  endpoint: [number, number];
  /** Signed elbow orientation in root-parent coordinates (before ancestor reflection). */
  bend: 1 | -1;
  mix: number;
  order: number;
}
export interface IKDiagnostic {
  constraintId: Id;
  order: number;
  target: [number, number];
  endpoint: [number, number];
  distance: number;
  status: 'solved' | 'unreachable' | 'degenerate' | 'disabled' | 'unsupported-scale' | 'singular';
}
