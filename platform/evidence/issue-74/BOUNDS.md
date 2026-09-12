# Composition enclosure argument and limits

Implementation: `src/observation/bounds.ts`. Public `targetBounds(project,target)`
returns `Result<Bounds|null>`; sequences and previews use it before preparing a
renderer. It is an interval enclosure of **all** target times, not a fit to the
requested frames. `fitCamera` remains a separate sampled geometry operation.

## Scalar induction

Validate the canonical project/target first. Initialize each local property to its
setup singleton S. Walk `compositionPrimitives(composition)` in its returned order;
its crossfade outgoing/incoming pair remains adjacent at the descriptor's position.
The expanded pair must never be sorted again.

For each source channel that is both keyed and masked, obtain a source interval A:

* Live nonzero-speed source: hull of every key value and the two Bezier **value**
  control points per segment, including holds before/after keys. The cubic
  convex-hull property contains every interior value. Time inversion, source
  offset, speed and repeated source wraps only select points from this hull.
* Frozen source: the singleton from canonical `sample` at `sampledTime(entryTime)`.
  A zero-speed live source uses the same singleton rule at its offset.
* Missing keyed channels or mask entries retain the preceding interval P. They do
  not blend toward setup. Empty masks do not create channels.

Every effective weight is in W=[0,alpha]. Fades, startup, end removal and target
wrap cannot leave W. With prior interval P:

* Overwrite: `hull(P, (1-alpha)*P + alpha*A)`. The affine expression in w reaches
  its extrema at w=0 or w=alpha, so this contains `(1-w)*p+w*a` for every allowed
  p,a,w. This is tighter than independently multiplying [1-alpha,1] by P.
* Additive: `P + W*(A-S)`, enclosing `p+w*(a-S)`. The new interval becomes P for
  the next track; taking a union of source animations would be incorrect.

By induction every composed local is enclosed. Discarding channel/clock
correlations makes bounds larger, never smaller. A zero-duration outgoing entry,
alpha-zero track or track with no positive-weight target clock is skipped exactly
as inactive source evaluation is skipped. Source-clock overflow checks cover the
active start through min(target duration,end+fadeOut); no whole-cycle multiplier
is invented for compositions that loop.

## Geometry propagation

One common walker serves animation and composition local/deform intervals.
Translations/scales use the scalar enclosure; sine/cosine inspect interior turning
points, and use [-1,1] for full turns or huge angles. Constrained IK root/child local
rotations use a full circle. The solver only changes these local rotations; this
also encloses unsupported-scale/FK fallbacks and ordered IK interactions. No second
IK solver is implemented.

Parent-first affine interval multiplication encloses each final bone transform.
The walker includes all trimmed region corners with attachment transforms. Mesh
vertices receive bind-world deform intervals, the same inverse-bind arithmetic as
the evaluator, final world intervals and the sum of nonnegative weight terms.
Composition uses offset zero: canonical v1 rejects nonempty source deforms even
when its track is masked out or has zero alpha. Unreferenced deform animations are
irrelevant, and legacy single-animation deform bounds retain their source channel.

Interval addition/multiplication round outward to adjacent IEEE-754 values. All
intermediate interval values, inverse-bind coefficients, region geometry and
camera values must be finite; malformed model/target references use canonical
validation. Failed arithmetic returns a structured error at `/bounds` and never
falls back to sampling while claiming continuous coverage. The final camera is
validated and the renderer separately rejects nonfinite or Float32-excess screen
geometry. Empty drawing returns null bounds and retains the requested camera.

## Supported and rejected matrix

| Case | Behavior |
| --- | --- |
| Walk+wave; many overwrite/additive tracks; partial alpha; explicit masks | Continuous enclosure, including values beyond any individual source animation |
| Frozen complete-coverage transition/stop, zero-duration transition, holds | Supported using canonical adjacent expansion and frozen source singleton |
| Nonzero offsets/speeds, speed zero, arbitrary seek, source/target loops | Supported; whole active source interval or fixed singleton as above |
| Winding rotations, Bezier overshoot, negative/zero scale, IK in its canonical domain or diagnostic FK fallback | Enclosed; IK envelopes may contain substantial whitespace |
| Region and weighted undeformed mesh composition | Supported; every final drawn vertex participates |
| Legacy single animation with source deformation | Supported by the same walker |
| Nonempty source deformation in a composition | Canonical `UNSUPPORTED_CAPABILITY`, including alpha zero/empty mask |
| Missing references, uncovered frozen transition channels, unknown/hybrid target | Canonical `MISSING_REFERENCE` / `INVALID_INPUT`; no mutation/fallback |
| Nonfinite derived interval/source clock/bind/FK/camera arithmetic | Structured `INVALID_INPUT`; failed job exposes no partial media. Conservative overapproximation can overflow even if a selected frame is finite |
| Output/snapshot/frame quota exceeded | Existing `LIMIT_EXCEEDED`; limits are unchanged |
| Nested refs, reverse playback, event/audio dispatch, root-motion extraction, deform mixing | Not offered by composition v1 |

Tests in `tests/observation/composition.test.ts` compare final geometry with the
computed box, plus deliberately wrong source-union/endpoint-only crop controls.
They cover additive +100 +100 = +200, interior full-turn/Bezier extrema, masks and
partial overwrite, frozen/reflected/IK, mesh, source clock offsets and holds,
zero-speed, loop/seek, dead outgoing entries and finite extreme overflow. These
samples test the implementation; the interval argument above establishes the
continuous enclosure claim. This is not a claim of tightest bounds, stationary
world feet for arbitrary transitions, or a performance gate.
