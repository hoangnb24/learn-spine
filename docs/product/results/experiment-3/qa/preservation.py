"""Read-only structural audit: JSON object key order irrelevant, arrays ordered."""
from pathlib import Path
import json,zipfile,sys,hashlib,copy
root=Path(__file__).resolve().parents[5]
run=sys.argv[1]; directory=root/'docs/product/results/experiment-3/runs'/run
summary=json.loads((directory/'summary.json').read_text())
archive=next(directory/m['file'] for m in reversed(summary['media']) if m['file'].endswith('.zip'))
initial=json.loads(zipfile.ZipFile(root/'platform/tests/agent-evals/initial/wave.zip').read('project.json'))
final=json.loads(zipfile.ZipFile(archive).read('project.json'))
allowed={'upper-arm-right','forearm-right','hand-right'}
def retained(p):
 p=copy.deepcopy(p);p['revision']=0
 for a in p['animations']:
  if a['id']=='wave':a['channels']=[c for c in a['channels'] if not(c['boneId'] in allowed and c['property']=='rotation')]
 return p
def digest(p):return hashlib.sha256(json.dumps(p,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def rotation(p,bone):return next(c for a in p['animations'] if a['id']=='wave' for c in a['channels'] if c['boneId']==bone and c['property']=='rotation')
a,b=retained(initial),retained(final)
output={'run':run,'method':'Deep JSON equality ignores dictionary key order, preserves every list element order/value including channels/keys/curves. Excludes only project.revision and the three allowed wave rotation channels.','structuralPreservation':a==b,'initialRetainedSHA256':digest(a),'finalRetainedSHA256':digest(b),'originalFrozenScorer':'Retained unchanged; its JSON.stringify comparison is object-key-order-sensitive. False raw output is retained, not overwritten.','independentVerdict':'pending reviewer; supplemental audit is not self-awarded acceptance','rotationChannels':{bone:{'initial':rotation(initial,bone),'final':rotation(final,bone)} for bone in sorted(allowed)}}
(directory/'preservation-audit.json').write_text(json.dumps(output,indent=2)+'\n')
