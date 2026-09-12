# Atomic commands and live session — #7

Public import: `platform/src/commands/index.ts`. Implements the canonical `Commands` interface from model, plus the session integration below. No DOM, selection state, renderer, storage implementation or WebMCP registration is imported. Normative behavior is [T03 semantics](../../../docs/product/contracts/semantics.md); primitive recipes below implement the issue's create/attach/key/curve workflow without inventing another mutation protocol (ADR-001 §2).

## Session and immutable PNG boundary (#10 → #7 → #12/#13)

```ts
import { prepareBundle, createSession } from './commands';
import { validateBundle } from './storage'; // supplied by #10

const prepared = await prepareBundle(importedBundle, validateBundle);
if (!prepared.ok) return prepared; // live session untouched on failure
const result = createSession(prepared.value);
if (!result.ok) return result;
const session = result.value;
const initial = session.inspect(); // defensive Project clone
const snapshot = session.snapshot(); // same-revision Project + defensive PNG copies
```

`prepareBundle(input: unknown, validator: BundleValidator)` asynchronously invokes the application's **trusted `storage.validateBundle`**. That validator owns actual PNG decode, dimensions, SHA-256, size and bundle validation. This dependency injection avoids a commands→storage import/dependency cycle; do not pass an identity validator in application code. Commands revalidates the returned Project, requires exactly one Uint8Array per asset ID and takes ownership of copied buffers. Success returns an opaque `PreparedBundle`: it contains no bytes and cannot be recreated from JSON. A module-private WeakMap binds the token to its validated snapshot. A failed validator returns its error; a thrown validator produces INVALID_INPUT. No active session is changed during preparation.

`createSession(prepared)` returns `Result<Session>` and implements the normative Commands methods. New empty editor UI has no session; creating a new project requires a valid project with at least one root bone and an empty asset map. The factory validates token provenance at runtime. `session.open(prepared)` atomically changes the active bundle, generates a new `sessionId`, clears undo/redo/checkpoints/dedup, preserves the imported revision and publishes an `open` invalidation. A failed open keeps everything intact. Calling open on the same project is still a new retry lifetime. There is no persisted history or exactly-once guarantee after reload.

`apply(batch, prepared?)` is synchronous. Existing images reuse current bytes when ID/hash/decoded dimensions match. Newly imported/replaced images must have matching bytes in the optional prepared token. All operations, final model, byte availability and aggregate asset budgets pass before the one commit; failures never leave metadata changed without matching PNG. The token may contain a full candidate bundle; only matching final asset IDs are used. Normal metadata-only writes need no token if the image hash/dimensions stay the same. Token bytes are a verified content source, not a second request payload: the complete batch (including asset hashes/dimensions) determines dedup identity; a retry can omit its original token.

For PNG replacement/import: take `snapshot()`, make a candidate with new asset metadata and byte map, call `prepareBundle(candidate, validateBundle)`, then `apply` the corresponding `putAsset`/`putRegion`/`putSlot` operations with the token and the **revision captured before preparation**. A concurrent user edit produces REVISION_CONFLICT. If the UI supports switching/opening while async work runs, capture `session.sessionId` too and discard completion when it changes: a reopened saved project may intentionally have the same projectId/revision. #12 owns that UI completion routing, as with old autosave/job results.

History and checkpoints hold immutable internal bundle references, so replacing/removing an asset cannot discard an older texture needed by undo/redo/restore. `snapshot()` returns its own copies for storage, renderer and jobs; later edits/open do not alter them. Returned snapshots can be mutated by their caller without affecting live state. Evicted history and abandoned tokens release their references naturally. There are no mutable byte buffers exposed from live state.

## Primitive recipe mapping

All names here are recipe intent, **not registered transport tools**. #13 may expose schema-backed wrappers; it must retain the same complete batch and request identity on retry.

| Intent | Normative operations |
| --- | --- |
| `create_bones` | One `putBone` per explicit bone ID, name, parentId and setup. Reference validation uses the final batch, so child/slot can appear before parent. |
| `attach_images` | Prepare PNG bundle, then one batch with `putAsset`, `putRegion`, `putSlot`; optional `setSlotOrder` listing every slot once. |
| `create_animation` | `putAnimation` with explicit ID, duration, loop and `channels: []` (or complete initial channels). |
| `set_keyframes` | Inspect at revision R; copy target animation, replace/add the desired bone/property channel's sorted absolute keys, retain other channels; `putAnimation` with expectedRevision R. |
| `set_curves` | Inspect at revision R; copy target animation, change the curve on explicitly addressed left keys, retain other keys/channels; `putAnimation` with expectedRevision R. |
| `inspect_project` / `get_capabilities` | `inspect()` / `capabilities()`. Core advertises `transport: none`, jobs 0; #13 composes actual available module/transport features. |

Put replaces the whole entity, preserving index; new IDs append. It never implicitly merges an animation or uses UI selection. Times are seconds, angles radians, key values absolute local properties. Rotations interpolate numerically. Curve belongs to left key. Entities must include all canonical schema fields. IDs may coincide in different collections.

Example agent input (batch keyframe edit, assuming `root` exists):

```json
{"projectId":"robot","expectedRevision":0,"requestId":"agent-key-1","operations":[{"kind":"putAnimation","value":{"id":"wave","name":"Wave","duration":2,"loop":true,"channels":[{"boneId":"root","property":"rotation","keys":[{"time":0,"value":0,"curve":{"type":"linear"}},{"time":2,"value":0.2,"curve":{"type":"stepped"}}]}]}}]}
```

Output: `{"ok":true,"value":{"projectId":"robot","revision":1,"changedIds":["wave"]},"warnings":[]}`.

A new request still expecting 0 returns `{"ok":false,"error":{"code":"REVISION_CONFLICT","path":"/expectedRevision","message":"Read the current project before retrying this edit"},"revision":1}`. Inspect and re-plan to avoid overwriting the user's edit. Retrying the **original** request returns its original success at revision 1 even after later edits; do not reinterpret that success revision as the current revision. Same request ID with changed method/payload returns REQUEST_ID_REUSED. Malformed payload is rejected before dedup and revision checks. Failed requests do not consume IDs.

## History, events and limits

`undo(request)`, `redo(request)`, `checkpoint({...request,label})`, `restore({...request,checkpointId})` all accept `unknown` runtime input with strict shape/JSON validation, just like `apply`. Every successful write including a no-op put increments revision once. Undo/redo restore content at current revision+1. Checkpoint does not increment revision or change either stack. Restore creates one undo batch and clears redo. Revision overflow fails before changing stacks.

`history()` returns defensive `{undo,redo,checkpoints}` oldest-to-newest arrays. Undo/redo entries include requestId, original apply/restore kind, sourceRevision and `{collection,id}` changes. Checkpoint listing includes id/projectId/sourceRevision/label. This supports a basic history UI; it is not a before/after compare API.

`subscribe(listener)` returns unsubscribe. Events include sessionId, projectId, revision, kind, requestId (writes/checkpoint), namespaced changed entities and checkpoint metadata when created. Treat them as invalidations and inspect current state; reentrant listeners can already have committed a newer revision. Events are queued in commit order, each subscriber receives a defensive copy, exceptions in UI observers cannot undo a successful command or prevent delivery to others. Dedup is saved before notification, so callback retries cannot double-commit. Retries and failures emit nothing. Restore invalidates the union of entities on both sides; `open` invalidates the entire project.

Retains 100 undo + 100 redo entries, 20 checkpoints, and 1,000 successful request results shared across all five methods per session. Undo evicts oldest above 100; successful new apply/restore clears redo. Checkpoint capacity fails rather than evicting. Dedup FIFO retries do not refresh age. Returned capabilities advertise these limits and `session-dedup`. Asset limits are T03: 256 assets, 20 MiB each, 200 MiB total package content, 16,384 per dimension, 64 million decoded pixels. Storage validates individual prepared bundles; apply also checks the aggregate final bundle because multiple imports can accumulate assets.

Commands commit synchronously and do not take AbortSignal. The adapter checks cancellation immediately before synchronous dispatch; once success is returned, use inspect/undo, never report a committed write as cancelled. Async preparation uses the storage validator's optional signal through a closure if needed.

## Checks and scope

From repository root: `npm ci --prefix platform`, `npm run typecheck --prefix platform`, `npm test --prefix platform`, `npm run build --prefix platform`.

Tests cover atomic rollback, forward references, malformed unknown inputs, request ordering/structural dedup/FIFO eviction/reload, user-agent conflicts, history limits/revision overflow/checkpoint events, reentrant observers and byte retention through replace/remove/undo/redo/restore. The commands unit suite deliberately injects a trusted fixture validator to isolate session behavior; actual PNG/hash/ZIP/IndexedDB validation belongs to #10. Integration must supply its real `validateBundle`. No UI, renderer or transport success is claimed by these unit tests. Evidence: [issue-7](../../evidence/issue-7/README.md).

## Version 1 authoring (#19)

Session advertises runtime support for `mesh-v1`, `ik-v1` and
`explicit-migration-v1` regardless of the current project's format. The project's
`requiredCapabilities` describes its serialized data, not runtime support.

Additional canonical operations (all in the same atomic batch/history/dedup):

- `migrateProject { targetVersion: 1 }`: explicitly calls the existing model
  migration on the candidate. It preserves geometry/identity and commits at the
  next revision. Undo restores the prior version/capabilities. Place it before v1
  operations in the same batch; any later failure rolls back the entire upgrade.
- `putMesh { value: Mesh }`: replaces/appends a complete canonical mesh. Existing
  imported PNG bytes are reused; no new image transport is introduced.
- `setVertexWeights { attachmentId, vertices: [{ vertex, weights }] }`: zero-based
  vertex indices with complete influence lists. Indices must exist and occur once;
  all other weights, bind matrices, topology, bones and animations stay unchanged.
  References/totals are validated by the final canonical model, with no repair.
- `setVertexDeforms { animationId, attachmentId, time, curve, vertices: [{ vertex,
  offset: [x,y] }] }`: changes only selected vertex offsets at an exact key time,
  and explicitly replaces that key's curve. Missing keys/channels are created; a
  new key starts with all-zero offsets before selected writes. Existing unselected
  offsets, other keys, channels and attachments are preserved. Time is seconds in
  [0,duration]; indices must exist and be unique. Read the curve/offsets with
  inspect_deforms before editing; this avoids full-animation payloads for large keys.
- `putIKConstraint { value: TwoBoneIK }`, and `remove` with
  `collection: 'ikConstraints'`: complete constraints, final reference validation,
  namespaced history changes, same undo/redo/checkpoint semantics as other entities.
- `putAnimation` now accepts canonical optional `deforms`; it still replaces the
  complete animation, so callers preserve unrelated channels and keys explicitly.

Mesh/deform/IK writes reject format 0 with `UNSUPPORTED_VERSION`. They never upgrade
implicitly. Successful v1 writes add their required `mesh-v1`/`ik-v1` declaration to
the candidate, which is rolled back on failure and retained after entity removal.
No operation bypasses the unchanged strict v0/v1 model validation or asset checks.

## Composition authoring (#73)

`putComposition {value}` and `remove {collection:'compositions',id}` join the same
atomic Session/history path. Explicit format-1 migration is required; successful
puts add `composition-v1`. Final-project validation rejects dangling references,
source deforms and incomplete keyed/masked frozen transitions, including changes
made indirectly by editing/removing source animations. A valid final batch may
remove or retarget dependents together. Retry, revision, events, undo/redo and
checkpoints follow the rules above. Source edits invalidate composed poses at the
new project revision, including frozen sources (fixed time, current source data).

[Canonical composition and target contract](../model/COMPOSITION.md) is the
handoff for transport and UI; core Session capability does not imply adapter
support. The bridge keeps this feature unadvertised until #74 is integrated.
