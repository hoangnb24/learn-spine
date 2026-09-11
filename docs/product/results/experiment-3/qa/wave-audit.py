from pathlib import Path
import json,zipfile,hashlib
base=Path('docs/product/results/experiment-3/runs')
initial=json.loads(zipfile.ZipFile('platform/tests/agent-evals/initial/wave.zip').read('project.json'))
original=next(c for a in initial['animations'] if a['id']=='wave' for c in a['channels'] if c['boneId']=='forearm-right')
for run,filename,first,restore in [('wave-2','0158-gate3-wave.zip',17,25),('wave-3','0177-gate3-wave.zip',21,30)]:
 p=base/run; rows=[json.loads(s)['event'] for s in (p/'events.jsonl').read_text().splitlines()]; calls=[e for e in rows if e['kind']=='tool']; by={e['invocationId']:e for e in calls}; summary=json.load(open(p/'summary.json')); transcript=json.load(open(p/'public-transcript.json')); items=[i for t in transcript['turns'] for i in t['items']]; discovery=sum(i.get('arguments',{}).get('code','').count('.fetchTools(') for i in items)
 checks={'retryPayloadAndResult':by[first]['input']==by[first+1]['input'] and by[first]['result']==by[first+1]['result'],'retryRevision':by[first+1]['beforeRevision']==by[first+1]['afterRevision']==1,'stale':by[first+2]['result']['error']['code']=='REVISION_CONFLICT' and by[first+2]['afterRevision']==1,'atomic':by[first+3]['result']['error']['code']=='MISSING_REFERENCE' and by[first+3]['afterRevision']==1,'restoredForearmKeys':by[restore]['result']['value']['items']==original['keys']}
 final=json.loads(zipfile.ZipFile(p/filename).read('project.json')); channel=next(c for a in final['animations'] if a['id']=='wave' for c in a['channels'] if c['boneId']=='forearm-right')
 (p/'slowing-audit.json').write_text(json.dumps({'initialForearmKeys':original['keys'],'finalForearmKeys':channel['keys'],'initialPeakTimes':[.8,2,3.2],'finalPeakTimes':[.8,3.2],'intervalRatio':2,'initialOscillations':2,'finalOscillations':1,'duration':4},indent=2)+'\n')
 failed=[{'id':i['id'],'status':i['status'],'code':i['arguments']['code']} for i in items if i['type']=='mcpToolCall' and i.get('status')=='failed']
 evidence={'motion37ok':by[37]['result']['ok'],'render38ok':by[38]['result']['ok'],'nextNative39':by[39]['name']} if run=='wave-2' else {'firstRead36':by[36]['input'],'secondRead37':by[37]['input'],'sameArtifact':by[36]['input']==by[37]['input'],'bothNativeOk':by[36]['result']['ok'] and by[37]['result']['ok']}
 classification='Documentation unavailable, then image presentation failed after successful measure_motion/render_pose. Next item emits already-returned image, no additional native call.' if run=='wave-2' else 'First read_artifact succeeded, image presentation failed; next item rereads frame0 and both native calls are counted.'
 (p/'host-errors-audit.json').write_text(json.dumps({'publicFailedItems':failed,'classification':classification,'rawEvidence':evidence,'budgetCalls':len(calls)+discovery,'method':'App public code execution order plus raw product results, not helper counter. App omits MCP output bodies.'},indent=2)+'\n')
 limitation='Native render_pose clips antenna; geometry audit122 outsidecornerpoints peranimation in its600x600viewport. Later previewfit and reopenedPlayer show fullart. Initialcrop remains and reviewer decides.' if run=='wave-2' else 'Zero outsidecorners in QAviewport at61uniform+keys; duplicate artifact reread counted.'
 audit={'run':run,'outcome':'COMPLETED_PENDING_INDEPENDENT_REVIEW','publicInvocations':len(calls),'discoveryCalls':discovery,'budgetCalls':len(calls)+discovery,'elapsedMs':summary['elapsedMs'],'withinBudget':len(calls)+discovery<=100 and summary['elapsedMs']<=900000,'unfinishedInvocations':summary['unfinishedInvocations'],'transactionChecks':checks,'frozenPreservationScorer':json.load(open(p/'data-score.json'))['dataCriteria']['preserved'],'structuralPreservationSupplement':json.load(open(p/'preservation-audit.json'))['structuralPreservation'],'preservationNote':'Frozenfalse/objectkeyorder retained, supplemental strictly ordered arrays; independent decision pending','slowing':'2oscillations to1, interval1.2to2.4s,4s duration','finalZIP':filename,'revision':3,'reopen':'Actual Editor/Player file inputs; fullProject15PNGhash matchstop','maxEditorPlayerNumericDelta':1.9326762412674725e-12,'captureLimitation':limitation,'hostErrors':classification,'subjectPlayback':'24unique previewframes at2fps over3loops','qaPlayback':'4actualWebM >=3wraps eachappanimation','visual':'Author sampled native/reopen images show intact greeting/return; independent reviewpending','manualRescue':0,'scenarioFeedback':1,'tokens':None,'cost':None,'rawSHA256':hashlib.sha256((p/'events.jsonl').read_bytes()).hexdigest()}
 (p/'audit.json').write_text(json.dumps(audit,indent=2)+'\n')
 (p/'README.md').write_text(f'''# {run} — completed, independent review pending

{len(calls)+discovery} calls ({len(calls)} public + one discovery), {summary['elapsedMs']/1000:.4f} seconds.
[Revision3 ZIP]({filename}) reopened through real Editor/Player file inputs;
full Project and15PNGhashes matchstop. Forearm changes2oscillations to1 with
peak interval1.2→2.4s; duration remains4s. [Slowing audit](slowing-audit.json).

{limitation}

The [frozen scorer](data-score.json) keeps its object-order-sensitive false.
[Structural supplement](preservation-audit.json) ignores only objectproperty order,
strictly preserving arrays/channels/keys/curves outside3allowed rotations andrevision.
No frozen script or ZIP was changed. Reviewer decides acceptance.

{classification} [Host audit](host-errors-audit.json) retains failedpublicitems and
raw correspondence. [Transactions](audit.json) verify retry/stale/atomic/restore.
No manual rescue or creative hints. Subject viewed24previewPNG2fps/3loops;
independent actualcanvas playback has>=3wraps perappanimation. Author inspected
sampled greeting/return images; independent verdict pending.

[Editor idle](reopen/editor-idle.webm) · [Editor wave](reopen/editor-wave.webm)
[Player idle](reopen/player-idle.webm) · [Player wave](reopen/player-wave.webm)
[Reopen](reopen/report.json) · [Geometry](geometry-audit.json)
[Raw events](events.jsonl) · [Public transcript, reasoning excluded](public-transcript.json)

QA overlap with scarf1 is recorded; no timeextension or performanceclaim.
Tokens/cost unavailable. Frozen platformsource and all initial/final ZIPs unchanged.
''')
 print(run,checks)
