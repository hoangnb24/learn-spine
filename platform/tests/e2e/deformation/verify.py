"""Independent arithmetic on saved canonical poses; no alternate evaluator.
Run from platform: python3 tests/e2e/deformation/verify.py ../docs/product/results/experiment-2/run-NN
"""
import json, math, pathlib, sys
folder=pathlib.Path(sys.argv[1]); summary={}
def dist(a,b): return math.hypot(a[0]-b[0],a[1]-b[1])
def point(p,ref):
 if ref['kind']=='bone': return p['bones'][ref['boneId']][4:6]
 if ref['kind']=='vertex':
  m=next(m for m in p['meshes'] if m['slotId']==ref['slotId']);i=ref['vertex']*2;return m['vertices'][i:i+2]
 return next(k for k in p['ik'] if k['constraintId']==ref['constraintId'])['endpoint']
def cross(a,b,c): return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
for kind in ['scarf','jelly','ik']:
 d=json.loads((folder/f'{kind}-measurements.json').read_text());p=d['project'];samples=d['samples'];minimum=1;sumerror=0;anchor=0;area=math.inf;flips=0;crossings=0
 for m in p['attachments']:
  if m['type']!='mesh':continue
  for weights in m['weights']:
   minimum=min(minimum,*[w['weight'] for w in weights]);sumerror=max(sumerror,abs(sum(w['weight'] for w in weights)-1))
   assert all(w['boneId'] in [b['id'] for b in p['bones']] for w in weights)
 for pose in samples:
  for a in d['anchors']:anchor=max(anchor,dist(point(pose,a['point']),a['target']))
  for m in pose['meshes']:
   verts=list(zip(m['vertices'][::2],m['vertices'][1::2]));edges=set()
   for i in range(0,len(m['triangles']),3):
    a,b,c=m['triangles'][i:i+3];signed=cross(verts[a],verts[b],verts[c]);area=min(area,abs(signed));flips+=signed>=0
    for x,y in [(a,b),(b,c),(c,a)]:edges.add(tuple(sorted((x,y))))
   edges=list(edges)
   for i,(a,b) in enumerate(edges):
    for c,e in edges[i+1:]:
     if len({a,b,c,e})<4:continue
     av,bv,cv,ev=verts[a],verts[b],verts[c],verts[e]
     if max(av[0],bv[0])<min(cv[0],ev[0]) or max(cv[0],ev[0])<min(av[0],bv[0]) or max(av[1],bv[1])<min(cv[1],ev[1]) or max(cv[1],ev[1])<min(av[1],bv[1]):continue
     crossings+=cross(av,bv,cv)*cross(av,bv,ev)<-1e-12 and cross(cv,ev,av)*cross(cv,ev,bv)<-1e-12
 eye=0
 if d['eyes']:eye=max(abs(e['height']/d['eyes']['canonical'][i]['height']-1) for row in d['eyes']['samples'] for i,e in enumerate(row))
 residual=max([i['distance'] for pose in samples for i in pose.get('ik',[])]+[0])
 summary[kind]={'minimumWeight':minimum if kind!='ik' else None,'maximumWeightSumError':sumerror,'maximumAnchorErrorPx':anchor,'minimumTriangleDoubleArea':area if area!=math.inf else None,'unexpectedTriangleFlips':flips,'nonadjacentEdgeProperCrossings':crossings,'maximumEyeHeightRelativeChange':eye if kind=='jelly' else None,'maximumIKResidualPx':residual if kind=='ik' else None,'sampleCount':len(samples),'diagnosticPass':d['report']['passed']}
 assert minimum>=0 and sumerror<=1e-5 and anchor<=.5 and eye<=.05 and residual<=.5 and flips==0 and crossings==0 and d['report']['passed'],summary[kind]
(folder/'arithmetic-verification.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
