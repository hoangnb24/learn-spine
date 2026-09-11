"""Extract observed artifacts and provisional budget facts; never assigns visual pass."""
from pathlib import Path
import json,base64,sys,hashlib
root=Path(__file__).resolve().parents[3]/'docs/product/results/experiment-3/runs'
for d in ([root/sys.argv[1]] if len(sys.argv)>1 else sorted(root.iterdir())):
 rows=[json.loads(s)['event'] for s in (d/'events.jsonl').read_text().splitlines()]
 tools=[r for r in rows if r['kind']=='tool']; start=[r for r in rows if r['kind']=='start']; stop=[r for r in rows if r['kind']=='stop']
 media=[]
 for i,r in enumerate(rows):
  if r['kind']=='artifact':
   data=base64.b64decode(r['data'].split(',')[1]); name=f'{i:04d}-'+r['filename'];(d/name).write_bytes(data); media.append({'file':name,'revision':r['revision'],'sha256':hashlib.sha256(data).hexdigest()})
  if r['kind']=='tool' and r['result'].get('ok'):
   im=r['result'].get('value',{}).get('image')
   if im:
    name=f'{i:04d}-{r["name"]}.png';(d/name).write_bytes(base64.b64decode(im['data']));media.append({'file':name,'revision':r['afterRevision']})
 summary={'productInvocations':len(tools),'discoveryCalls':'reconcile subject transcript','elapsedMs':stop[-1]['elapsedMs'] if stop else None,'startCount':len(start),'stopCount':len(stop),'setupCount':sum(r['kind']=='setup' for r in rows),'prestartInvocations':sum(r['elapsedMs'] is None for r in tools),'errors':[{'name':r['name'],'result':r['result']} for r in tools if not r['result']['ok']],'media':media,'visualRubric':'pending independent review','reopen':'pending','manualRescue':'reconcile transcript','tokens':None,'cost':None}
 (d/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
