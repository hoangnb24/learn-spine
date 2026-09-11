"""Pre-run preparation only. Never execute against an active subject session."""
from pathlib import Path
import json, zipfile, hashlib
ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).parent/'initial'
def make(name,source,edit):
 with zipfile.ZipFile(ROOT/source) as z:
  files={n:z.read(n) for n in z.namelist()}
 p=json.loads(files['project.json']); edit(p); p['revision']=0; p['projectId']='gate3-'+name
 files['project.json']=json.dumps(p,separators=(',',':')).encode()
 with zipfile.ZipFile(OUT/(name+'.zip'),'w',zipfile.ZIP_STORED) as z:
  for n,b in files.items():
   info=zipfile.ZipInfo(n,(2026,9,11,0,0,0)); z.writestr(info,b)
 return {'zipSha256':hashlib.sha256((OUT/(name+'.zip')).read_bytes()).hexdigest(),'projectSha256':hashlib.sha256(files['project.json']).hexdigest(),'assets':{a['id']:a['sha256'] for a in p['assets']}}
def wave(p):
 a=next(a for a in p['animations'] if a['id']=='wave')
 # Meaningful preserved body/left-hand channels, absent in original Gate 1 wave.
 for bone,prop,values in [('body','y',[310,314,310]),('head','rotation',[0,.035,0]),('hand-left','rotation',[0,-.025,0])]:
  a['channels'].append({'boneId':bone,'property':prop,'keys':[{'time':t,'value':v,'curve':{'type':'bezier','x1':.42,'y1':0,'x2':.58,'y2':1}} for t,v in zip([0,2,4],values)]})
def scarf(p):
 a=p['animations'][0]
 # Initial visible synchronous motion; subject must create delayed tip rhythm.
 tip=next(c for c in a['channels'] if c['boneId']=='tip')
 mid=next(c for c in a['channels'] if c['boneId']=='mid')
 tip['keys']=json.loads(json.dumps(mid['keys']))
 # Valid but wrong influence on entire first two neck columns, observable by tools.
 m=p['attachments'][0]
 for row in range(5):
  for col in [0,1]: m['weights'][row*17+col]=[{'boneId':'mid','weight':1}]
manifest={
 'robot':make('robot','platform/fixtures/robot/art-input.zip',lambda p:None),
 'wave':make('wave','platform/fixtures/robot/native-project.zip',wave),
 'scarf':make('scarf','docs/product/results/experiment-2/run-03/scarf.zip',scarf)}
(OUT/'hashes.json').write_text(json.dumps(manifest,indent=2)+'\n')
