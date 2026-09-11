import type { Mesh as Attachment, DrawMesh, Result } from '../model/types';
import { failure, success } from './geometry';
/** Pose topology is fixed by the prepared attachment; only evaluated XY may change. */
export function meshVertices(attachment: Attachment, draw: DrawMesh, path: string): Result<number[]> {
  if (!Array.isArray(draw.vertices) || draw.vertices.length !== attachment.vertices.length || !draw.vertices.every(Number.isFinite) ||
      !Array.isArray(draw.uvs) || draw.uvs.length !== attachment.uvs.length || draw.uvs.some((n,i)=>n!==attachment.uvs[i]) ||
      !Array.isArray(draw.triangles) || draw.triangles.length !== attachment.triangles.length || draw.triangles.some((n,i)=>n!==attachment.triangles[i]))
    return failure('Invalid mesh geometry or changed topology',path);
  return success([...draw.vertices]);
}
export type MeshOverlay = { wireframe?: boolean; weightBoneId?: string };
