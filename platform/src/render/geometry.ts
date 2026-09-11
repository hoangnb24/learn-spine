import type { Asset, Matrix, Pose, Project, Region, Result, Viewport } from '../model/types';
export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };
export const success = <T>(value: T): Result<T> => ({ ok: true, value, warnings: [] });
export const failure = (message: string, path = ''): Result<never> => ({ ok: false, error: { code: 'INVALID_INPUT', path, message } });
export function corners(region: Region, asset: Asset, m: Matrix): number[] {
  const sx = region.width / asset.originalWidth, sy = region.height / asset.originalHeight;
  const l = asset.trimX * sx - region.pivotX, r = l + asset.pixelWidth * sx;
  const t = (asset.originalHeight - asset.trimY) * sy - region.pivotY, b = t - asset.pixelHeight * sy;
  return [[l,t],[r,t],[r,b],[l,b]].flatMap(([x,y]) => [m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]);
}
export function screenPoint(x: number, y: number, v: Viewport): [number, number] {
  return [v.width/2+(x-v.centerX)*v.zoom,v.height/2-(y-v.centerY)*v.zoom];
}
export function validateViewport(v: Viewport): Result<void> {
  if (!v || ![v.width,v.height,v.centerX,v.centerY,v.zoom,v.devicePixelRatio].every(Number.isFinite) ||
      v.width <= 0 || v.height <= 0 || v.zoom <= 0 || v.devicePixelRatio <= 0 ||
      !/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(v.background)) return failure('Invalid viewport', '/viewport');
  const w = Math.round(v.width*v.devicePixelRatio), h = Math.round(v.height*v.devicePixelRatio);
  if (w < 1 || h < 1 || w > 16384 || h > 16384 || w*h > 64e6) return failure('Backing canvas exceeds limits', '/viewport');
  return success(undefined);
}
export function poseGeometry(project: Project, pose: Pose): Result<number[][]> {
  if (project.requiredCapabilities.includes('mesh-v1') || pose.meshes?.length) return {ok:false,error:{code:'UNSUPPORTED_CAPABILITY',path:'/pose/meshes',message:'Renderer does not yet support mesh-v1'}};
  if (pose.poseVersion !== 1) return failure('Unsupported pose version', '/pose/poseVersion');
  if (pose.projectId !== project.projectId || pose.revision !== project.revision) return failure('Pose does not match prepared project/revision', '/pose');
  const slots = project.slots.filter(s => s.attachmentId !== null);
  if (pose.regions.length !== slots.length) return failure('Pose slot count differs', '/pose/regions');
  const regions = new Map(project.attachments.map(r => [r.id,r])), assets = new Map(project.assets.map(a => [a.id,a]));
  const output: number[][] = [];
  for (const [i, d] of pose.regions.entries()) {
    const region = regions.get(d.attachmentId), asset = assets.get(d.assetId);
    if (d.slotId !== slots[i].id || d.attachmentId !== slots[i].attachmentId || !region || region.type !== 'region' || !asset || region.assetId !== d.assetId || d.world.length !== 6 || !d.world.every(Number.isFinite)) return failure('Invalid pose region reference or matrix', `/pose/regions/${i}`);
    const points = corners(region,asset,d.world);
    if (!points.every(Number.isFinite)) return failure('Nonfinite geometry', `/pose/regions/${i}`);
    output.push(points);
  }
  return success(output);
}
/** Fits the union of all supplied poses, including every supplied extremum. */
export function fitCamera(project: Project, poses: readonly Pose[], viewport: Viewport, padding = 24): Result<{ viewport: Viewport; bounds: Bounds | null; poseCount: number }> {
  const valid = validateViewport(viewport); if (!valid.ok) return valid;
  if (!poses.length || !Number.isFinite(padding) || padding < 0 || 2*padding >= Math.min(viewport.width,viewport.height)) return failure('Supply poses and valid fit padding');
  const bounds: Bounds = { minX: Infinity,minY: Infinity,maxX: -Infinity,maxY: -Infinity };
  for (const pose of poses) {
    const result = poseGeometry(project,pose); if (!result.ok) return result;
    for (const points of result.value) for (let i=0;i<points.length;i+=2) {
      bounds.minX=Math.min(bounds.minX,points[i]); bounds.maxX=Math.max(bounds.maxX,points[i]);
      bounds.minY=Math.min(bounds.minY,points[i+1]); bounds.maxY=Math.max(bounds.maxY,points[i+1]);
    }
  }
  if (bounds.minX === Infinity) return success({viewport:{...viewport},bounds:null,poseCount:poses.length});
  const zoom=Math.min((viewport.width-2*padding)/Math.max(bounds.maxX-bounds.minX,1),(viewport.height-2*padding)/Math.max(bounds.maxY-bounds.minY,1));
  const fitted={...viewport,centerX:bounds.minX/2+bounds.maxX/2,centerY:bounds.minY/2+bounds.maxY/2,zoom};
  const check=validateViewport(fitted); if (!check.ok) return check;
  return success({viewport:fitted,bounds,poseCount:poses.length});
}
