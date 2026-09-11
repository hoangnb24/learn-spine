"""Verify committed artifact relationships without trusting a PASS string alone."""
import pathlib,json,hashlib,zipfile,tarfile,math
root=pathlib.Path(__file__).resolve().parent
load=lambda path:json.loads((root/path).read_text())
summary={}
for kind in ['scarf','jelly','ik']:
 m=load(f'run-03/{kind}-measurements.json');p=m['project'];half=load(f'run-03/{kind}-half.json')
 for suffix,expected in [('',p),('-half',half['after'])]:
  with zipfile.ZipFile(root/f'run-03/{kind}{suffix}.zip') as z:
   q=json.loads(z.read('project.json'));assert q==expected
   for asset in q['assets']:assert hashlib.sha256(z.read(asset['path'])).hexdigest()==asset['sha256']
 assert {k:v for k,v in p.items() if k not in ['assets','revision']}=={k:v for k,v in half['after'].items() if k not in ['assets','revision']}
 for a,b in zip(p['assets'],half['after']['assets']):assert b['pixelWidth']==(a['pixelWidth']+1)//2 and b['pixelHeight']==(a['pixelHeight']+1)//2
 assert m['report']['passed'] and m['report']['total']==0
 for point in m['loop']['points']:assert point['positionError']<=.5 and point['velocityError']<=point['velocityThreshold']
 check=load(f'run-05/{kind}-recheck.json');assert check['projectId']==p['projectId'] and check['revision']==p['revision']
 seeks=[]
 for app in ['editor','player']:
  rows=load(f'run-05/{kind}-{app}-seeks.json');assert len(rows)==20 and len({r['requestedTime'] for r in rows})==20
  assert max(r['delta'] for r in rows)<=1e-5
  frames=load(f'run-05/{kind}-{app}-playback.json');assert frames[0]['pose']['sampledTime']==0 and all(f['ok'] for f in frames)
  wraps=sum(frames[i]['pose']['sampledTime']<frames[i-1]['pose']['sampledTime'] for i in range(1,len(frames)));assert wraps>=3
  boundary=load(f'run-05/{kind}-{app}-boundary-seek.json');assert boundary['delta']<=1e-5 and boundary['referenceTime']==0
  seeks.append({'app':app,'count':len(rows),'maxDelta':max(r['delta'] for r in rows),'maxRequestedReferenceDelta':max(r['requestedReferenceDelta'] for r in rows),'wraps':wraps,'boundary':boundary})
 observation=load(f'run-04/{kind}-observation.json');assert observation['validation']['value']['valid'] and observation['motion']['value']['passed']
 assert all(c['result']['ok'] and c['result']['value']['projectId']==p['projectId'] and c['result']['value']['revision']==p['revision'] for c in observation['captures'])
 reachable=[math.hypot(i['target'][0]-pose['bones']['hip'][4],i['target'][1]-pose['bones']['hip'][5]) for pose in m['samples'] for i in pose.get('ik',[])];assert all(0<=r<=200 for r in reachable)
 summary[kind]={'projectId':p['projectId'],'revision':p['revision'],'zipAssetsHashVerified':True,'halfLogicalSemanticsIdentical':True,'seeks':seeks,'reachabilityDistanceRange':None if not reachable else [min(reachable),max(reachable)]}
corner=load('run-06/ik-region-corners.json');points=[p for p in corner['loop']['points'] if p['ref']['kind']=='region-corner'];assert len(points)==12 and all(p['positionError']<=.5 and p['velocityError']<=p['velocityThreshold'] for p in points)
assert corner['negativeControl']['measured']['report']['passed'] and len([p for p in corner['negativeControl']['measured']['loop']['points'] if p['ref']['kind']=='region-corner' and p['positionError']>.5])==4
archives={}
for run in ['run-01','run-02']:
 recovered={}
 for path in sorted((root/'archive').glob(f'{run}-*.tar.gz')):
  with tarfile.open(path) as tar:
   for member in tar.getmembers():
    if member.isfile():recovered[str(pathlib.PurePosixPath(member.name).relative_to(run))]=hashlib.sha256(tar.extractfile(member).read()).hexdigest()
 for entry in load(f'{run}/inventory.json'):assert recovered[entry['path']]==entry['sha256']
 archives[run]={'filesVerified':len(load(f'{run}/inventory.json'))}
(root/'final-verification.json').write_text(json.dumps({'fixtures':summary,'regionCornerCount':12,'rotationOnlyNegativeControlDetected':True,'historicalArchives':archives},indent=2)+'\n')
print('PASS: ZIP/PNG hashes, full/half semantics, 120 actual seeks, 6 boundary cases, 18+ playback cycles, 12 region corners, observation and historical archives')
