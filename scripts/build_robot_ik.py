"""Add two-bone leg IK to the original FK robot for a controlled comparison."""
import json
import math
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'exercises/robot'
data = json.loads((BASE / 'robot.json').read_text())
bones = {b['name']: b for b in data['bones']}
bones['body']['y'] = 304
targets = []
data['ik'] = []
for order,(side,sign) in enumerate([('left',-1),('right',1)]):
    target = {'name':f'foot-target-{side}','parent':'root','x':sign*43,'y':73}
    targets.append(target)
    thigh,shin,foot = [bones[f'{p}-{side}'] for p in ['thigh','shin','foot']]
    thigh.update(rotation=-90,length=100)
    shin.update(x=100,y=0,length=107)
    foot.update(parent=target['name'],x=0,y=0)
    for name in [thigh['name'],shin['name']]:
        for skin in data['skins']:
            a=skin['attachments'][name][name]
            a['x'],a['y']=-a['y'],a['x']
            a['rotation']=90
    data['ik'].append({'name':f'leg-ik-{side}','order':order,
                       'bones':[thigh['name'],shin['name']],
                       'target':target['name'],'bendPositive':side=='left','mix':1})
# Parent targets must precede their foot children in the JSON bone array.
data['bones'] = [data['bones'][0]]+targets+data['bones'][1:]
del data['animations']['idle']['bones']['pelvis']
data['animations']['squat']={'bones':{'body':{'translate':[
    {'time':0,'x':0,'y':0,'curve':[.2,0,.5,0,.2,0,.5,-35]},
    {'time':.7,'x':0,'y':-35},
    {'time':1.3,'x':0,'y':-35,'curve':[1.5,0,1.8,0,1.5,-35,1.8,0]},
    {'time':2,'x':0,'y':0}]}}}
data['animations']['step']={'bones':{
    'foot-target-left':{'translate':[{'time':0,'x':0,'y':0},
                                   {'time':.15,'x':-8,'y':12},
                                   {'time':.25,'x':-10,'y':22},
                                   {'time':.4,'x':-4,'y':10},
                                   {'time':.5,'x':0,'y':0},
                                   {'time':1,'x':0,'y':0}]},
    'foot-target-right':{'translate':[{'time':0,'x':0,'y':0},
                                    {'time':.5,'x':0,'y':0},
                                    {'time':.65,'x':8,'y':12},
                                    {'time':.75,'x':10,'y':22},
                                    {'time':.9,'x':4,'y':10},
                                    {'time':1,'x':0,'y':0}]}
}}
# One sideways step cycle advances 70 units. Foot positions are authored in world
# space, then root travel is subtracted to get local target keys. Contact phases
# are stationary in world space; the viewer follows root and shows ground marks.
walk = {'bones': {}}
for name in ['root','body','foot-target-left','foot-target-right']:
    walk['bones'][name] = {'translate': []}
for name in ['upper-arm-left','upper-arm-right','head']:
    walk['bones'][name] = {'rotate': []}
for i in range(61):
    t=i/60
    travel=70*t
    walk['bones']['root']['translate'].append({'time':t,'x':travel,'y':0})
    walk['bones']['body']['translate'].append({'time':t,'x':-8*math.sin(2*math.pi*t),
                                             'y':-5+3*math.cos(4*math.pi*t)})
    for side,start,end in [('right',0,.4),('left',.5,1)]:
        u=max(0,min(1,(t-start)/(end-start)))
        progress=u*u*(3-2*u)
        lift=32*math.sin(math.pi*u)**2
        walk['bones'][f'foot-target-{side}']['translate'].append(
            {'time':t,'x':70*progress-travel,'y':lift})
    for side,sign in [('left',1),('right',-1)]:
        walk['bones'][f'upper-arm-{side}']['rotate'].append(
            {'time':t,'value':sign*8*math.sin(2*math.pi*t)})
    walk['bones']['head']['rotate'].append({'time':t,'value':.7*math.sin(2*math.pi*t)})
# Match the analytical velocities at adjacent keys. Linear samples match poses
# but introduce a velocity jump, most noticeably at takeoff and landing.
def velocity(name, t):
    if name == 'root':
        return [70, 0]
    if name == 'body':
        return [-16*math.pi*math.cos(2*math.pi*t), -12*math.pi*math.sin(4*math.pi*t)]
    if name.startswith('foot-target-'):
        start, end = (0, .4) if name.endswith('right') else (.5, 1)
        u = max(0, min(1, (t-start)/(end-start)))
        return [420*u*(1-u)/(end-start)-70,
                32*math.pi*math.sin(2*math.pi*u)/(end-start)]
    amplitude = .7 if name == 'head' else (8 if name.endswith('left') else -8)
    return [amplitude*2*math.pi*math.cos(2*math.pi*t)]

for name, timelines in walk['bones'].items():
    for kind, keys in timelines.items():
        fields = ['value'] if kind == 'rotate' else ['x', 'y']
        for a, b in zip(keys, keys[1:]):
            dt = (b['time']-a['time'])/3
            va, vb = velocity(name, a['time']), velocity(name, b['time'])
            a['curve'] = []
            for j, field in enumerate(fields):
                a['curve'] += [a['time']+dt, a[field]+va[j]*dt,
                               b['time']-dt, b[field]-vb[j]*dt]
data['animations']['walk_side']=walk
data['events']={'footstep':{'string':''}}
walk['events']=[{'time':.4,'name':'footstep','string':'right'},
                {'time':1,'name':'footstep','string':'left'}]
(BASE/'robot-ik.json').write_text(json.dumps(data,indent=2)+'\n')
print('Created IK variant: independent foot targets; idle, wave, squat, step, walk_side')
