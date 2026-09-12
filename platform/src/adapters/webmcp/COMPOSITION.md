# Composition public tools (#74)

The adapter now advertises `composition-v1` only alongside real Session,
`evaluateTarget`, observation and diagnostics integration. It does not advertise
event/audio dispatch. See [core contract](../../model/COMPOSITION.md) for authored
semantics and [bounds proof/matrix](../../../evidence/issue-74/BOUNDS.md).

Every scoped tool requires `sessionId` and `projectId` from `get_capabilities`.
Writes also require `expectedRevision` and unique `requestId`; exact retries return
the original Session result, including after later edits. Synchronous writes use
Session atomic validation/history/undo; there is no adapter composition store.

| Tool | Composition input / output |
| --- | --- |
| `put_composition` | Complete `composition` object → normal Session commit result |
| `apply_batch` | `putComposition {value}` and `remove {collection:'compositions',id}`; migration to v1 can precede creation in the same atomic batch |
| `inspect_project` | `collection:'compositions'` and summary count |
| `inspect_composition` | `compositionId`, optional offset/limit → header and authored tracks sorted by order, without expanding descriptors |
| `evaluate_pose` | `target`, `time` → final canonical pose plus session scope; includes final IK residual and region/mesh geometry, bounded to 256 KiB |
| `render_pose` | `target`, `time`, `viewport` → PNG image content with requested time, normalized sampledTime, target, projectId and snapshot revision; boundsKind `sampled-frame` |
| `render_sequence` / `export_frames` | `target`, `times`, `viewport` → snapshot job with target and revision; stable continuous envelope across the selected target |
| `preview_animation` | `target`, `fps`, `loops`, `viewport`; legacy tool name retained; target duration/loop controls preview sampling |
| `measure_motion` | `target`, optional anchors/loopPoints/page → sampled final-geometry diagnostics; `sampling.target`, `times`, `sampledTimes` and snapshot revision |
| Job status / read artifact | Job target + snapshot revision; every PNG artifact has `frame {target,time,sampledTime,projectId,revision}`; ZIP manifest includes full camera/frame metadata |

The canonical target is exactly one of:

```json
{"kind":"animation","animationId":null}
{"kind":"animation","animationId":"walk"}
{"kind":"composition","compositionId":"motion"}
```

Setup (`animationId:null`) is supported by `evaluate_pose` and `render_pose` only.
All legacy `animationId` selectors remain supported. A request must choose exactly
one canonical `target` or legacy `animationId`; hybrid/unknown selectors are
rejected even if both IDs happen to exist. Composition results never invent an
`animationId`. Legacy requests keep the legacy pose identity field.

Examples (add scope/revision envelopes described above):

```js
// One revision, one undo step. A v0 project requires this explicit migration.
apply_batch({ ...write, operations: [
  { kind: 'migrateProject', targetVersion: 1 },
  { kind: 'putComposition', value: {
    id:'motion', name:'Walk + wave', duration:2, loop:true, tracks:[
      {kind:'track', id:'base', order:0,
       source:{kind:'live',animationId:'walk',offset:0,speed:1},
       mask:[{boneId:'body',property:'y'}], mode:'overwrite', alpha:1,
       start:0,fadeIn:0,fadeOut:0},
      {kind:'track', id:'upper', order:1,
       source:{kind:'live',animationId:'wave',offset:0,speed:1},
       mask:[{boneId:'upper-arm-right',property:'rotation'}], mode:'additive',alpha:.5,
       start:0,fadeIn:.2,fadeOut:0}
    ]
  }}
]});
evaluate_pose({...scope,target:{kind:'composition',compositionId:'motion'},time:2.5});
// sampledTime .5 for the looping 2-second composition; absolute input time remains 2.5.
render_sequence({...scope,target:{kind:'composition',compositionId:'motion'},times:[0,.5,1,1.5,2],viewport});
measure_motion({...scope,target:{kind:'composition',compositionId:'motion'},loopPoints:[],limit:20});
```

A source animation edit invalidates composed and frozen results through project
revision. Queued jobs keep their original project/source/target snapshot; an active
Session edit does not change already submitted output. Session replacement/reopen
invalidates bridge-owned jobs/URLs. App-owned cancellation remains distinct from
native AbortSignal support, which is not newly claimed.

Diagnostics are sampled evidence. Canonical `sampling.sampledTimes` and item
`sampledTime` use the selected target's clamp/wrap. Loop seam checks separately
inspect the authored end before target wrapping, with source clocks unchanged;
`sampling.boundaryPolicy` explicitly states this. Legacy diagnostics preserve their
existing authored-end behavior. Foot-target findings use final geometry residual,
not `status:'solved'` as a quality verdict.

Runnable public input sequence and transport-separated evidence:
[issue-74](../../../evidence/issue-74/README.md). #75 can reuse these targets,
RenderablePose renderer input, snapshot metadata, bounds and Session history; no
editor composition controls or native→editor workflow are included in #74.
