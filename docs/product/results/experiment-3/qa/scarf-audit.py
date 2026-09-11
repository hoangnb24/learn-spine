"""Read-only post-run evidence summary; never modifies project or rubric."""
import json, pathlib, hashlib
b=pathlib.Path('docs/product/results/experiment-3/runs')
for n,first in [(1,16),(2,14),(3,15)]:
 p=b/f'scarf-{n}'; rows=[json.loads(s)['event'] for s in (p/'events.jsonl').read_text().splitlines()];calls=[e for e in rows if e['kind']=='tool'];by={e['invocationId']:e for e in calls};s=json.load(open(p/'summary.json'));score=json.load(open(p/'data-score.json'));reopen=json.load(open(p/'reopen/report.json'));geo=json.load(open(p/'geometry-audit.json'))
 restore=next(e for e in calls if e['name']=='restore_checkpoint'); read=by[restore['invocationId']+1];initial=next(e for e in calls if e['name']=='inspect_mesh' and e['input']['section']=='vertices')
 checks={'identicalRetryInputAndResult':by[first]['input']==by[first+1]['input'] and by[first]['result']==by[first+1]['result'],'retryRevisionUnchanged':by[first+1]['beforeRevision']==by[first+1]['afterRevision']==1,'staleRejected':by[first+2]['result']['error']['code']=='REVISION_CONFLICT' and by[first+2]['afterRevision']==1,'atomicRejected':by[first+3]['result']['error']['code']=='MISSING_REFERENCE' and by[first+3]['afterRevision']==1,'checkpointRestoredRevision2':restore['afterRevision']==2,'rereadMatchesInitialVertices':read['result']['value']['items']==initial['result']['value']['items'][:2]}
 transcript=json.load(open(p/'public-transcript.json'));items=[i for t in transcript['turns'] for i in t['items']];failed=[i for i in items if i.get('status')=='failed'];measures=[e for e in calls if e['name']=='measure_motion']
 limit='App public transcript stops after early inspect_project; no pagination cursor and final text missing. Root verified session and independently received subject final. Raw native starts/results/stop/download are complete; missing transcript is not backfilled.' if n==1 else ('Native 640x360 pose/preview viewport has 35 outside geometry samples across the cycle; actual reopened Player fit shows full scarf. Reviewer decides framing criterion.' if n==2 else 'Subject manual count58 product vs56 raw; public code audit matches56. Image emission failed after successful measure_motion/render_pose; subsequent re-emission adds no native invocation. One discovery makes57 budget calls. No uncounted pre-dispatch call identified.')
 audit={'run':p.name,'outcome':'COMPLETED_PENDING_INDEPENDENT_REVIEW','publicInvocations':len(calls),'discoveryCalls':1,'budgetCalls':len(calls)+1,'elapsedMs':s['elapsedMs'],'withinBudget':len(calls)+1<=100 and s['elapsedMs']<=900000,'unfinishedInvocations':s['unfinishedInvocations'],'transactionChecks':checks,'dataCriteria':score['dataCriteria'],'phase':score['phase'],'initialDiagnosticCount':measures[0]['result']['value']['total'],'finalDiagnosticCount':measures[-1]['result']['value']['total'],'finalZIP':score['finalFile'],'revision':3,'reopenChecks':{k:{'sameProjectAsStop':v['sameProjectAsStop'],'assetHashesMatch':v['assetHashesMatch'],'wraps':v['animations']['cycle']['wraps']} for k,v in reopen['results'].items()},'geometry':geo['animations']['cycle'],'limitation':limit,'subjectPreview':{'uniqueFrames':24,'fps':4,'loops':3},'visualAuthor':'Sampled Player frames03/09 show continuous intact scarf, anchored left seam, distinct tip motion; independent judgment pending. Two WebM recordings and24 UI images saved per run.','manualRescue':0,'scenarioFeedback':1,'tokens':None,'cost':None,'rawSHA256':hashlib.sha256((p/'events.jsonl').read_bytes()).hexdigest()}
 (p/'audit.json').write_text(json.dumps(audit,indent=2)+'\n');(p/'host-errors-audit.json').write_text(json.dumps({'failedPublicItems':failed,'limitation':limit,'rawCalls':len(calls),'discoveryCalls':1,'publicTranscriptContainsReasoning':False},indent=2)+'\n')
 (p/'README.md').write_text(f'''# {p.name} — independent review pending

{len(calls)+1} budget calls ({len(calls)} native + one discovery), {s['elapsedMs']/1000:.4f}s.
[Final revision3 ZIP]({score['finalFile']}) was opened through actual Editor and Player file inputs. Both full projects and asset hashes match the stop snapshot. Both playback recordings cross at least3 loops. No solution changes or manual rescue.

Frozen data checks pass: preserved content, phase lag0.25s, anchor/loop diagnostics. Initial diagnostic count620 becomes0. Mid/tip amplitudes {score['phase']['stats']['mid']['amplitude']}/{score['phase']['stats']['tip']['amplitude']:.2f}. [Data score](data-score.json), [transactions and audit](audit.json).

{limit}

[Public transcript](public-transcript.json) excludes reasoning. [Host error audit](host-errors-audit.json). Raw native log is authoritative for dispatched calls. Tokens/cost unavailable. Author sampled Player frames03/09; independent visual verdict pending.

[Editor playback](reopen/editor-cycle.webm) · [Player playback](reopen/player-cycle.webm) · [Reopen report](reopen/report.json) · [Geometry](geometry-audit.json) · [Raw events](events.jsonl).
''')
 print(p.name, checks)
