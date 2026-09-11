import type { DeformChannel, Matrix, Mesh, Result } from '../model/types';
import { sample } from './timeline';

/** Pure pre-skin deformation + linear blend skinning, using explicit bind-world coordinates. */
export function skinMesh(mesh: Mesh, worlds: ReadonlyMap<string, Matrix>, deform: DeformChannel | undefined, time: number): Result<number[]> {
  const inverse = new Map(mesh.bindPose.map(({ boneId, world: m }) => {
    const determinant = m[0]*m[3]-m[1]*m[2];
    const a=m[3]/determinant, b=-m[1]/determinant, c=-m[2]/determinant, d=m[0]/determinant;
    return [boneId, [a,b,c,d,-a*m[4]-c*m[5],-b*m[4]-d*m[5]] as Matrix];
  }));
  const vertices: number[] = [];
  for (let i=0; i<mesh.vertices.length; i+=2) {
    const offset = (component: number) => deform ? sample({ boneId: '', property: 'x', keys: deform.keys.map(k => ({time:k.time,value:k.offsets[component],curve:k.curve})) }, time) : 0;
    const x=mesh.vertices[i]+offset(i), y=mesh.vertices[i+1]+offset(i+1);
    let worldX=0, worldY=0;
    for (const influence of mesh.weights[i/2]) {
      const bind=inverse.get(influence.boneId)!, world=worlds.get(influence.boneId)!;
      const localX=bind[0]*x+bind[2]*y+bind[4], localY=bind[1]*x+bind[3]*y+bind[5];
      worldX += influence.weight*(world[0]*localX+world[2]*localY+world[4]);
      worldY += influence.weight*(world[1]*localX+world[3]*localY+world[5]);
    }
    if (![x,y,worldX,worldY].every(Number.isFinite))
      return {ok:false,error:{code:'INVALID_INPUT',path:`/attachments/${mesh.id}/vertices/${i}`,message:'Derived mesh geometry must be finite'}};
    vertices.push(worldX,worldY);
  }
  return {ok:true,value:vertices,warnings:[]};
}
