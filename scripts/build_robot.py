"""Build an original Spine 4.2 learning skeleton from prepared robot images.

This generates input data; it is not an export from the Spine Trial editor.
"""
import json
import copy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'exercises/robot'
parts = json.loads((BASE / 'parts-manifest.json').read_text())
bones = [{'name': 'root'}, {'name': 'body', 'parent': 'root', 'y': 310},
         {'name': 'pelvis', 'parent': 'body', 'y': -10},
         {'name': 'head', 'parent': 'body', 'y': 170}]
attachments = {}
def attach(name, scale, pivot):
    p = parts[name]
    attachments[name] = {name: {'x': round((p['width']/2-pivot[0])*scale, 3),
                              'y': round((pivot[1]-p['height']/2)*scale, 3),
                              'width': round(p['width']*scale, 3),
                              'height': round(p['height']*scale, 3)}}
attach('body', 1, (102,184))
attach('head', .8, (140,244))
attach('pelvis', .65, (96,45))
for side, sign in [('left', -1), ('right', 1)]:
    bones += [
        {'name': f'upper-arm-{side}', 'parent': 'body', 'x': sign*98, 'y': 130,
         'rotation': sign*10},
        {'name': f'forearm-{side}', 'parent': f'upper-arm-{side}', 'y': -67},
        {'name': f'hand-{side}', 'parent': f'forearm-{side}', 'y': -96},
        {'name': f'thigh-{side}', 'parent': 'pelvis', 'x': sign*43, 'y': -20},
        {'name': f'shin-{side}', 'parent': f'thigh-{side}', 'y': -100},
        {'name': f'foot-{side}', 'parent': f'shin-{side}', 'y': -107},
    ]
    attach(f'upper-arm-{side}', .6, (48,43))
    attach(f'forearm-{side}', .45, (47,24))
    attach(f'hand-{side}', .38, (50,20))
    attach(f'thigh-{side}', .58, (51,25))
    attach(f'shin-{side}', .58, (51,35))
    attach(f'foot-{side}', .45, (124 if side=='left' else 70,16))
    attachments[f'foot-{side}'][f'foot-{side}']['path'] = f"foot-{'right' if side=='left' else 'left'}"

draw_order = ['thigh-left','shin-left','foot-left','thigh-right','shin-right','foot-right',
              'pelvis','upper-arm-left','forearm-left','hand-left','body',
              'upper-arm-right','forearm-right','hand-right','head']
def rotate(values):
    return {'rotate': [{'time': t, 'value': v} for t,v in values]}
def translate(values):
    return {'translate': [{'time': t, 'x': 0, 'y': v} for t,v in values]}
idle = {'bones': {
    'body': translate([(0,0),(.5,2),(1,3),(1.5,1),(2,0)]),
    'pelvis': translate([(0,0),(.5,-2),(1,-3),(1.5,-1),(2,0)]),
    'head': rotate([(0,-1),(.5,0),(1,1),(1.5,0),(2,-1)]),
    'upper-arm-left': rotate([(0,0),(.5,-1),(1,-2),(1.5,-1),(2,0)]),
    'upper-arm-right': rotate([(0,0),(.5,1),(1,2),(1.5,1),(2,0)]),
}}
wave = {'bones': {
    'upper-arm-right': rotate([(0,0),(.45,70),(2,70),(2.5,0)]),
    'forearm-right': rotate([(0,0),(.45,80),(.7,110),(1,70),(1.3,110),(1.6,70),(1.9,95),(2.5,0)]),
    'hand-right': rotate([(0,0),(.45,0),(.7,10),(1,-10),(1.3,10),(1.6,-10),(1.9,5),(2.5,0)]),
    'head': rotate([(0,0),(.5,-4),(2,-4),(2.5,0)]),
}}
# Spine 4.2 Bezier controls use time and value, not normalized 0..1 handles.
# Ease the wave to zero speed at each pose; periodic central tangents for idle.
def smooth(anim, periodic=False):
    for timelines in anim['bones'].values():
        for kind, keys in timelines.items():
            fields = ['value'] if kind=='rotate' else ['x','y']
            period = keys[-1]['time']-keys[0]['time']
            def slope(i, field):
                if not periodic:
                    return 0
                if i in (0,len(keys)-1):
                    return (keys[1][field]-keys[-2][field])/(keys[1]['time']+period-keys[-2]['time'])
                return (keys[i+1][field]-keys[i-1][field])/(keys[i+1]['time']-keys[i-1]['time'])
            for i,(a,b) in enumerate(zip(keys,keys[1:])):
                dt=(b['time']-a['time'])/3
                a['curve']=[]
                for field in fields:
                    a['curve'] += [round(a['time']+dt,6),round(a[field]+slope(i,field)*dt,6),
                                   round(b['time']-dt,6),round(b[field]-slope(i+1,field)*dt,6)]
smooth(idle, True)
smooth(wave)
data = {'skeleton': {'spine':'4.2.22','images':'./images/parts/','name':'delivery-robot'},
        'bones': bones,
        'slots': [{'name':n,'bone':n,'attachment':n} for n in draw_order],
        'skins':[{'name':'default','attachments':attachments}],
        'animations':{'idle':idle,'wave':wave}}
mint = copy.deepcopy(attachments)
for name,entries in mint.items():
    entries[name]['path']='mint/'+entries[name].get('path',name)
data['skins'].append({'name':'mint','attachments':mint})
(BASE / 'robot.json').write_text(json.dumps(data, indent=2)+'\n')
# One atlas page per original image: no texture packing required.
atlas = []
for name,p in parts.items():
    w,h=p['width'],p['height']
    atlas += [f'images/parts/{name}.png',f'size: {w}, {h}','filter: Linear, Linear',
              'repeat: none',name,f'  bounds: 0, 0, {w}, {h}','']
for name,p in parts.items():
    w,h=p['width'],p['height']
    atlas += [f'images/parts/mint/{name}.png',f'size: {w}, {h}','filter: Linear, Linear',
              'repeat: none',f'mint/{name}',f'  bounds: 0, 0, {w}, {h}','']
(BASE / 'robot.atlas').write_text('\n'.join(atlas))
print(f'Created robot.json: {len(bones)} bones, {len(draw_order)} slots, idle + wave')
