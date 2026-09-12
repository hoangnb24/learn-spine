# Composition v1 core contract (#73)

Canonical types are exported from `platform/src/model`; strict shapes live in
`project-v1.schema.json`. `validate` adds reference, uniqueness, timing and coverage
checks. `composition-v1` is implemented by model, Session and evaluator together.
This is transform evaluation and persistence support. Tools/observation (#74) and
editor/player (#75) are separate integrations; the bridge currently filters this
feature from its advertised capabilities and rejects composition request shapes.
Direct Observation `renderPose`/`submit` also reject `target` or `compositionId`
fields with `UNSUPPORTED_CAPABILITY`, including hybrid legacy+canonical requests,
so they cannot quietly sample the legacy animation ID. #74 must replace these
guards when the complete canonical target path is implemented.

## Data and timing

`Project.compositions?: Composition[]` is accepted only in format 1 with
`requiredCapabilities` containing `composition-v1`. Omission preserves legacy
projects. An explicit empty collection still requires the capability. IDs are
unique within each collection; animation and composition IDs may coincide.
A composition contains `id`, `name`, finite positive `duration`, boolean `loop`,
and `tracks`. Track IDs and safe nonnegative integer `order` are unique within
that composition. Increasing order is authoritative, independent of array order.
Tracks may be empty. No composition references or nested compositions are accepted.

A primitive track contains:

```ts
{
  kind: 'track', id, order,
  source: { kind: 'live', animationId, offset, speed }
       // or { kind: 'frozen', animationId, entryTime }
  mask: [{ boneId, property }],
  mode: 'overwrite' | 'additive', alpha,
  start, fadeIn, end?, fadeOut
}
```

All numbers are finite; alpha is in [0,1]; speed and all authored clock/fade fields
are nonnegative. Start cannot exceed composition duration. `end`, when present,
is at or after start; both `start+fadeIn` and `end+fadeOut` must remain finite.
End/fades may extend beyond composition duration; the composition clock still
clamps/wraps normally, so a non-loop composition can hold a partially faded pose
at its final time. A crossfade descriptor (below) must complete within duration.
Reverse playback is not supported. Input request time can be signed, as before.

The absolute input time is normalized using canonical `sampledTime` against
composition duration and loop, independently of the source animation clock.
Non-loop clamps to [0,duration]; loop wraps signed time to [0,duration), including
exact duration → 0. Call the resulting composition clock C. A live source samples
`offset + (C-start)*speed`, then applies its animation's existing clamp/loop rules.
A frozen source samples `entryTime` using those same source rules on every seek.
Frozen means fixed **source time**, derived from the current project revision;
editing its source animation changes the frozen result. It is not a historical
snapshot. Session undo/checkpoint restores the source data and thus the old result.
No solved pose or mutable runtime transform snapshot is stored in Project.

Weight is zero before start. Otherwise it is `alpha * in(C) * out(C)`:

- `in = fadeIn === 0 ? 1 : min(1,(C-start)/fadeIn)`.
- With no end, or before end, `out = 1`.
- At/after end, `out = fadeOut === 0 ? 0 : max(0,1-(C-end)/fadeOut)`.

At computed fade endpoints the weights are set to exactly 1 (incoming) or 0
(outgoing), so floating-point ratio rounding cannot leak lower values when the
frozen outgoing is removed.

No end means hold for the remaining composition clock; a non-loop source holds
its last key, a loop source wraps. Zero speed freezes source time while fades
continue with C. Pause is the caller keeping C unchanged. Every seek recomputes
fresh locals; there is no previous-frame state, root extraction or displacement
accumulation. At zero effective weight the source is not sampled. Derived active
source-time/local/matrix overflow returns `INVALID_INPUT`, never NaN geometry.

## Masks and scalar composition

Masks list explicit existing bone/property pairs (`x`, `y`, `rotation`, `scaleX`,
`scaleY`), without duplicates. Empty masks are no-op; descendants are never added.
Only pairs both masked and keyed by the source contribute. Missing channels do
not sample setup. Frozen sources obey the same missing-channel rule.

Every pose begins with setup locals S. For each contributing channel with sample
A, prior lower-stack value L and effective weight w:

| Mode | New local value |
| --- | --- |
| overwrite | `(1-w)*L + w*A` |
| additive | `L + w*(A-S)` |

Keys are absolute local values, including scale. Additive scale adds setup delta,
not a multiplicative ratio. Rotation interpolation/mixing is numeric radians and
preserves authored winding: 170°→−170° has midpoint 0°, while 170°→190° crosses
180°. Scale zero/negative retains existing IK diagnostics and geometry semantics.

The evaluator then uses the **same** FK → ordered IK → mesh skinning/regions path
as single animations. It never blends solved world matrices. Nonempty source
`deforms` are rejected with `UNSUPPORTED_CAPABILITY` even for zero-weight or empty
mask tracks: deformation mixing is undefined. Empty `deforms: []` is harmless.
Unreferenced deform animations and legacy animation-only evaluation remain valid.

## Frozen crossfade descriptor → primitive contract

A `tracks` entry may instead be:

```ts
{
  kind: 'crossfade', id, order, start, duration,
  outgoing: { animationId, entryTime, mask },
  incoming: { animationId, offset, speed, mask }
}
```

Duration is nonnegative, and `start+duration <= composition.duration`. The source
animation and explicit entry time determine the frozen outgoing local values before
IK. The incoming live source follows its own clock. Both use overwrite mode at
alpha 1; descriptor alpha/mode/end fields are intentionally not accepted.

`compositionPrimitives(composition)` from `platform/src/engine` sorts entries by
order and expands each crossfade **at its one order position into two adjacent
primitives**, outgoing first, incoming second:

| Field | Outgoing primitive | Incoming primitive |
| --- | --- | --- |
| source | frozen animation + entryTime | live animation + offset + speed |
| mask | outgoing mask | incoming mask |
| mode / alpha | overwrite / 1 | overwrite / 1 |
| start | descriptor start | descriptor start |
| fadeIn | 0 | descriptor duration |
| end | start + duration | omitted |
| fadeOut | 0 | 0 |

The expanded pair retains the descriptor's ID/order for provenance; these are
not independently persisted track identities. **Do not re-sort or validate the
expanded array as a stored composition**: the adjacent pair intentionally shares
one ID/order. `trackWeight(primitive,C)` is the common weight seam. These exported
helpers assume already validated data and a normalized composition clock; public
unknown-input callers use `validate`/`evaluateTarget`. They do not mutate input.
Bounds/tools consumers must use this exact expansion rather than independently
inventing another crossfade or envelope model.

Outgoing stays full until incoming reaches 1, then outgoing is removed. At zero
duration incoming is full immediately and outgoing contributes nothing. After the
crossfade incoming continues to hold/play; later tracks may layer/remove it through
normal composition authoring. A prior live outgoing track should explicitly end
at descriptor start, as in the stop fixture. No phase search or implicit stopping
is performed. To fade an uncovered property back to lower/setup, author explicit
primitive tracks instead of a full crossfade descriptor.

Validation requires incoming **keyed AND masked** coverage for every pair both
keyed and masked by outgoing. Failure is `INVALID_INPUT` at the incoming mask path
with the full missing `boneId/property` list in its message. A wider unkeyed outgoing
mask does not invent channels. Coverage prevents the outgoing-removal snap; it
does not guarantee velocity continuity or stationary world endpoints when parents,
other layers or IK targets move.

## Canonical request and provenance

```ts
EvaluationTarget =
  | { kind: 'animation', animationId: Id | null }
  | { kind: 'composition', compositionId: Id };
TargetPoseRequest = { target: EvaluationTarget, time: number };
evaluateTarget(project, request): Result<TargetPose>;
```

`TargetPose` has `target`, `projectId`, `revision`, `sampledTime`, `poseVersion:1`,
`bones`, `regions`, `meshes`, and optional `ik`. `sampledTime` is normalized against
the selected target. `animationId:null` explicitly selects setup with sampledTime
0. Composition results carry their composition ID/time, **no animationId field**.
Revision identifies the complete source/composition data used for the result.
The target and returned geometry are detached from request/project memory.

Existing `evaluate(project,{animationId,time}): Result<Pose>` remains strict and
keeps its legacy result fields, including animationId and existing error paths.
It calls the same checked evaluation/finalization pipeline once. Supplying a
composition target to this legacy request is rejected instead of selecting a
fallback animation. The canonical wrapper for legacy setup is
`{target:{kind:'animation',animationId:null},time}`. There is no third setup kind.

`RenderablePose = Pose | TargetPose` exports the shared geometry/provenance union
for downstream consumers. Current Renderer/Observation interfaces still take
legacy Pose/request types; #74 must wire this canonical union and targets through
those boundaries, without adding a fake animationId. This core does not claim
composition rendering, job bounds or native tool support.

## Session, persistence and evidence

`putComposition { value: Composition }` replaces/appends a complete composition.
Format 0 requires an explicit preceding `migrateProject {targetVersion:1}`; a v1
put adds required `composition-v1`. `remove {collection:'compositions',id}` removes
one composition; capabilities remain declared after removal, as for mesh/IK.
Changed events/history use the `compositions` namespace. Normal atomic revisions,
retry identity, undo/redo/checkpoints and prepared bundle rules apply unchanged.

Whole-candidate validation runs after each batch. Removing a referenced animation
or bone, introducing source deforms, or editing source keys to break transition
coverage fails without mutation/revision/history/events. A single batch may remove
or retarget all dependents together with their source; only its final graph must
be valid. Source edits that preserve validity affect subsequent evaluation at the
new revision, including frozen entries. Consumers invalidate evaluation on project
revision, not just on a changed composition ID.

Existing ZIP storage roundtrips composition data using the same model serializer;
there is no exporter or alternate storage path. Tests in `tests/{model,commands,
engine,storage}/composition.test.ts` plus `tests/engine/composition-fixture.ts`
cover accepted #24 numeric vectors, source/clock/mask errors, final-foot stop
oracle and negative controls, transaction behavior and ZIP pose equivalence.
See [issue-73 evidence](../../evidence/issue-73/README.md).

Audio/events, nested compositions, reverse playback, deformation mixing, generic
stop-at-any-phase, automatic root motion and motion-quality polish are excluded.
No new native, performance, gate, MVP or Spine-parity claim follows from core tests.
