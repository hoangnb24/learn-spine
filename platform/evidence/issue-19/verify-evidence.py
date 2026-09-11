"""Cross-check the committed actual transcripts, ZIPs and player pose reports."""
from pathlib import Path
import hashlib,json,zipfile
root=Path(__file__).resolve().parent
def read(name):return json.loads((root/name).read_text())
native=read('native-session.json')
assert native['unselectedInvariant'] and native['undoRestoredUIContent']
def payload(call):return json.loads(next(c['text'] for c in call['result']['content'] if c['type']=='text'))
weights=[payload(c) for c in native['calls'] if c['name']=='apply_batch']
assert weights[0]==weights[1] and weights[0]['value']['revision']==2
assert weights[2]['error']['code']=='MISSING_REFERENCE' and weights[2]['revision']==2
fixed=read('native-deform-session.json')
assert fixed['onlySelectedChanged']==[1] and fixed['undoRestored']
for name in ['authored-scarf.zip','authored-jelly.zip','authored-ik.zip','native-authored-scarf.zip']:
 with zipfile.ZipFile(root/name) as z:
  p=json.loads(z.read('project.json'))
  assert p['formatVersion']==1
  for a in p['assets']:assert hashlib.sha256(z.read(a['path'])).hexdigest()==a['sha256']
for name in ['browser-results.json','jelly-roundtrip.json','ik-roundtrip.json']:
 report=read(name)
 assert [p['value'] for p in report['poses']]==report['playerPoses']
assert read('ik-roundtrip.json')['project']['ikConstraints'][0]['mix']==.8
print('PASS: native invariants/retry/errors, 4 ZIP PNG hashes, 9 player poses including authored IK')
