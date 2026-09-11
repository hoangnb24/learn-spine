"""Rebuild T01 art-only input and public-command arguments, never an animated project."""
import json, zipfile, hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[3]; here=Path(__file__).resolve().parent
layout=json.loads((root/'platform/fixtures/source/robot-layout.json').read_text()); manifest=json.loads((root/'platform/fixtures/source/manifest.json').read_text())
i=dict(x=0,y=0,rotation=0,scaleX=1,scaleY=1)
records=[r for r in manifest['records'] if r['id'] in [p['art'] for p in layout['placements']]]
assets=[dict(id=r['id'],name=r['id'],path='assets/'+r['id']+'.png',mimeType='image/png',sha256=r['sha256'],pixelWidth=r['pixelWidth'],pixelHeight=r['pixelHeight'],originalWidth=r['pixelWidth'],originalHeight=r['pixelHeight'],trimX=0,trimY=0) for r in records]
seed=dict(formatVersion=0,projectId='gate1-robot',revision=0,requiredCapabilities=['region-v0'],metadata=dict(name='Gate 1 T01 Robot'),assets=assets,bones=[dict(id='root',name='root',parentId=None,setup=i)],slots=[],attachments=[],animations=[])
with zipfile.ZipFile(here/'art-input.zip','w',compression=zipfile.ZIP_STORED) as z:
 z.writestr('project.json',json.dumps(seed))
 for r in records:
  b=(root/r['path']).read_bytes();assert hashlib.sha256(b).hexdigest()==r['sha256'];z.writestr('assets/'+r['id']+'.png',b)
bones=[dict(id=j['name'],name=j['name'],parentId=j['parent'],setup=dict(i,x=j['localXY'][0],y=j['localXY'][1],rotation=j['rotationRadians'])) for j in layout['joints']]
regions=[]
for p in layout['placements']:
 a=next(a for a in assets if a['id']==p['art']);s=p['logicalScale'];regions.append(dict(id=p['joint'],type='region',assetId=p['art'],transform=i,width=a['pixelWidth']*s,height=a['pixelHeight']*s,pivotX=p['pivotPixelsBottomLeft'][0]*s,pivotY=p['pivotPixelsBottomLeft'][1]*s))
slots=[dict(id=x,name=x,boneId=x,attachmentId=x) for x in layout['drawOrder']]
def ch(b,t,v):return dict(boneId=b,property='rotation',keys=[dict(time=x,value=y,curve=dict(type='bezier',x1=.42,y1=0,x2=.58,y2=1)) for x,y in zip(t,v)])
idle=dict(id='idle',name='Idle',duration=2,loop=True,channels=[ch('head',[0,1,2],[-.025,.025,-.025]),ch('upper-arm-left',[0,1,2],[-.1745,-.13,-.1745]),ch('upper-arm-right',[0,1,2],[.1745,.13,.1745])])
t=[0,.8,1.2,1.6,2,2.4,2.8,3.2,4]
wave=dict(id='wave',name='Wave',duration=4,loop=True,channels=[ch('upper-arm-right',[0,.8,3.2,4],[.174532925,1.4,1.4,.174532925]),ch('forearm-right',t,[0,1.25,.8,1.25,.8,1.25,.8,1.25,0]),ch('hand-right',t,[0,0,-.12,.12,-.12,.12,-.12,0,0])])
(here/'commands.json').write_text(json.dumps(dict(bones=bones,attachments=regions,slots=slots,idle=idle,wave=wave),indent=2)+'\n')
print('Generated art-only ZIP and command arguments.')
