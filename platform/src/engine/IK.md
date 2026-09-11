# Two-bone IK contract — issue #16

This independent core uses no Spine runtime, mesh solver, DOM, frame history or
physics. Integration into format v1 follows the shared extension from #15. The
strict region-v0 boundary remains unchanged; v1 requires `ik-v1` whenever an
`ikConstraints` field is present. Empty constraints are legal. The optional
`Pose.ik` array is emitted for projects carrying that field, including an empty
array; legacy poses need no fabricated diagnostics.

## Data and ordering

`TwoBoneIK` in `../model/ik.ts` contains an immutable ID, `type: 'two-bone-ik'`,
`rootBoneId`, `childBoneId`, `targetBoneId`, `endpoint: [x,y]` in child-local logical
units, `bend: 1|-1`, `mix` in [0,1], and a unique nonnegative safe-integer `order`.
Child must be a direct child of root. Target bone must exist outside the entire
root subtree. IDs and order values must be unique within constraints. All numeric
fields must be finite. Zero-length endpoint/child offsets are legal.

Target is the sampled world origin of the target bone. Animate it with ordinary
bone translate channels; mix/bend/order themselves are static in this version.
Solve ascending order once per sample; each constraint sees the worlds produced
by earlier constraints. Overlapping chains are allowed: later constraints can
move an earlier endpoint. This is an explicit ordered solve, not an iterative
system promising to satisfy incompatible constraints simultaneously.

Evaluator ordering is sampled local transforms → forward kinematics → IK → mesh
skinning/region transforms. IK updates only fresh evaluator-local transform/maps,
then rebuilds descendant worlds (currently all worlds for simplicity). Setup data
and animation channels are never mutated. `animationId: null` applies constraints
to setup locals; it does not disable them. Mix 0 leaves that constraint's FK
exactly unchanged; mix 1 applies the solved rotations. Fractional mix interpolates
each local rotation over its shortest signed angular difference, preserving
translations/scales and original multi-turn rotation offsets.

## Geometry and scale policy

The first segment is root-origin → child-origin; the second is child-origin →
child-local endpoint after child scale. The solve occurs in root-parent space.
`bend` is the sign of the cross product of the two segment vectors **in that
space**. Ancestor reflections can therefore reverse its appearance in world
space; this convention is stable and intentional.

Guaranteed reachable accuracy applies when the root has equal nonzero absolute
X/Y scales, allowing reflection, and its parent world matrix is invertible.
Ancestors may have nonuniform scale/shear/reflection; arbitrary child scales and
an off-axis endpoint are supported. The target is converted through the inverse
parent matrix; rotation changes preserve the two lengths in that solve space.
Outside the annulus [abs(length1-length2), length1+length2], clamp radial reach
without stretch and report `unreachable`. This minimizes radial distance in solve
space, not necessarily Euclidean world distance under a nonuniform ancestor.

Root scale magnitudes differing by more than 1e-12 × max(magnitudes) retain FK
and report `unsupported-scale`. Absolute root scale or parent determinant <=1e-12
retains FK and reports `singular`. Near-zero segment lengths <=1e-12 use a finite,
deterministic one-segment/no-segment fallback and report `degenerate`. At a
coincident target, the direction is deterministically +X; an equal-length chain
folds fully. No warm-start or previous pose is consulted. Non-finite derived
arithmetic returns `INVALID_INPUT` rather than exporting NaN/Infinity. A full-mix
reachable solution whose immediate world residual exceeds 0.5 logical pixels
also returns `INVALID_INPUT` (numerical tolerance), never a false `solved` claim.
This guards extreme finite coordinate magnitudes beyond floating-point precision;
it does not waive the ordinary reachable-target acceptance.

## Diagnostics for #18

`IKDiagnostic` records constraint ID/order, target and actual endpoint in world
logical pixels, Euclidean `distance`, and status: `solved`, `unreachable`,
`degenerate`, `disabled`, `unsupported-scale`, or `singular`. `solved` describes
the full-strength geometric solve; partial mix does not promise zero residual.
Target/endpoint/distance are measured from the **final pose**, after every ordered
constraint. Status describes what happened when that constraint was applied; a
later constraint can override an earlier `solved` result, making its final
distance nonzero. Consumers can use these final measurements directly.
Neither status nor valid JSON substitutes for the numeric residual when deciding
whether a foot is planted.

## Fixture and checks

`../../fixtures/ik/leg.ts` is an art-independent 100+100 logical-pixel leg with a
foot child at its endpoint and a separate target. `../../tests/engine/ik.test.ts`
covers both bends, exact 0 mix, full/partial mix, reflected/scaled root and child,
affine ancestors, out-of-reach/folded targets, zero lengths and ordered constraints.
The public evaluator/validation/seek regression tests are added upon integration
with the accepted v1 shared model. This document makes no claim that the standalone
hook alone completes the public project workflow.
