"""Create a small diagnostic texture and Spine weighted/unweighted mesh study."""
import copy
import json
import math
from pathlib import Path
from PIL import Image, ImageDraw

BASE=Path(__file__).resolve().parents[1]/'exercises/mesh-lab'
BASE.mkdir(parents=True,exist_ok=True)
im=Image.new('RGBA',(256,96),'#f6edd7')
d=ImageDraw.Draw(im)
d.rectangle((0,0,255,29),fill='#fc9e25')
d.rectangle((0,66,255,95),fill='#22c5d4')
for x in range(0,256,32):d.line((x,0,x,95),fill='#665b50',width=1)
d.rectangle((1,1,254,94),outline='#243044',width=3)
im.save(BASE/'strip.png')
# Boundary vertices first (12), followed by three interior vertices.
points=[(x,48) for x in [0,64,128,192,256]]+[(256,0)]+[(x,-48) for x in [256,192,128,64,0]]+[(0,0)]+[(x,0) for x in [64,128,192]]
idx={p:i for i,p in enumerate(points)}
triangles=[]
for x in [0,64,128,192]:
 for y in [48,0]:
  a,b,c,e=[idx[p] for p in [(x,y),(x+64,y),(x,y-48),(x+64,y-48)]]
  triangles += [a,b,c,b,e,c]
base={'type':'mesh','path':'strip','uvs':[v for x,y in points for v in [x/256,(48-y)/96]],
      'triangles':triangles,'hull':12,'width':256,'height':96}
weighted=copy.deepcopy(base);weighted['vertices']=[]
wrong=copy.deepcopy(base);wrong['vertices']=[]
manual=copy.deepcopy(base);manual['vertices']=[v for p in points for v in p]
for x,y in points:
 w=max(0,min(1,(x-64)/128))
 influences=[]
 if w<1:influences.append([1,x,y,1-w])
 if w>0:influences.append([2,x-128,y,w])
 weighted['vertices'] += [len(influences)]+[v for influence in influences for v in influence]
 wrong['vertices'] += [1,1,x,y,1]
deform=[v for x,y in points for v in [0,20*math.sin(math.pi*x/256)]]
data={'skeleton':{'spine':'4.2.22','images':'./'},
 'bones':[{'name':'root'},{'name':'base','parent':'root','length':128},
          {'name':'tip','parent':'base','x':128,'length':128}],
 'slots':[{'name':'strip','bone':'base','attachment':'strip'}],
 'skins':[{'name':name,'attachments':{'strip':{'strip':mesh}}}
          for name,mesh in [('default',weighted),('wrong-weights',wrong),('manual',manual)]],
 'animations':{
  'bend':{'bones':{'tip':{'rotate':[{'time':0,'value':0},{'time':.5,'value':35},
                                  {'time':1,'value':0},{'time':1.5,'value':-35},{'time':2,'value':0}]}}},
  'flutter':{'attachments':{'manual':{'strip':{'strip':{'deform':[
      {'time':0},{'time':.5,'vertices':deform},{'time':1},
      {'time':1.5,'vertices':[-v for v in deform]},{'time':2}]}}}}}
 }}
(BASE/'mesh.json').write_text(json.dumps(data,indent=2)+'\n')
(BASE/'mesh.atlas').write_text('strip.png\nsize: 256, 96\nfilter: Linear, Linear\nrepeat: none\nstrip\n  bounds: 0, 0, 256, 96\n')
(BASE/'vertex-map.json').write_text(json.dumps(points)+'\n')
print('Created mesh lab: 15 vertices, 16 triangles, 3 skins, bend + flutter')
