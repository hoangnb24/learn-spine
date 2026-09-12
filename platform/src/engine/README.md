# Region v0 pose evaluator (#8)

Import `evaluate` or `evaluator` from this module's `index.ts`. Public input/output
are the canonical `Project`, `PoseRequest`, `Result<Pose>` in `../model/types.ts`.
No DOM, renderer, React or Spine dependency is used. Every call validates the
project with the model boundary, validates the request, and computes a fresh pose.
This defensive validation currently clones the project per sample; no performance
claim is made. Future caching must preserve validation and stateless seek semantics.

`animationId: null` returns setup at sampledTime 0. Animation samples apply absolute
local property values. Missing channels use setup. Keys hold outside their range;
non-loop time clamps, loop time wraps including negative time. Rotation is numeric
interpolation in radians, with no shortest-path adjustment. Scale may cross zero.
Bezier inversion uses 60 bisection iterations on normalized x, then evaluates y.
Overflow in sampled values or derived world matrices returns INVALID_INPUT.

Bones are evaluated parent-first regardless of input order, without recursive call
stack depth. World matrices retain shear. `bones` is keyed by IDs; `regions` retains
slot order, omitting null attachments. Region world = bone world × attachment
local. Renderer #9 must apply the trim/pivot corner equations in
`docs/product/contracts/semantics.md` before this matrix, and top-left texture UVs.
Pivot is deliberately not subtracted inside the matrix a second time.

The exported module entry is `engine/index.ts`; transform/timeline helpers are
internal implementation modules and expect validated inputs. The shell root index
is unchanged; consumers can import this entry directly.

## Reproduce

From repository root with Node 22:

```sh
npm ci --prefix platform
npm run typecheck --prefix platform
npm test --prefix platform
npm run build --prefix platform
```

Actual validation 2026-09-11: Node v22.22.3, npm 10.9.8, Darwin arm64.
Typecheck passed; 3 test files / 35 tests passed (8 engine tests); production build
passed. Baseline main: 1249b2f. Implementation commit is the commit introducing
this document, recorded exactly in the PR evidence. Initial test authoring found
an accessor return annotation and a signed-zero assertion; both were corrected
before the recorded pass. No browser/playback tests were needed for this pure core;
renderer/image playback acceptance belongs to downstream #9/#11.

Numerical tests reuse the T03 region-valid fixture and include hand-calculated
parent/child worlds, negative scale, trimmed region corners, rotation across the
angle boundary, multiple turns, Bezier inversion/overshoot, stepped endpoints,
loop/clamp, missing/cyclic/duplicate-key input, overflow, prototype-like IDs,
20 shuffled seeks, nonmutation and result isolation.

## Mesh v1 (#15)

`evaluate` also skins versioned meshes and returns `poseVersion:1` with `meshes`
(empty for region-only input). See [mesh contract](../../../docs/product/contracts/mesh-v1.md)
for exact pre-skin deformation, explicit bind matrices, output arrays and #16 hook.
Numerical and browser-boundary evidence for mesh is in
[evidence/issue-15](../../evidence/issue-15/README.md).

## Two-bone IK (#16)

The evaluator solves optional v1 `ikConstraints` after FK and before region/mesh
output. [IK contract](IK.md) defines bend/mix/order, supported scale domain, finite
fallbacks and final-pose target/endpoint diagnostics in optional `Pose.ik`.
[Evidence](../../evidence/issue-16/README.md) includes public seek/roundtrip tests.

## Composition targets (#73)

`evaluateTarget(project,{target,time})` evaluates the canonical animation/composition
union and returns explicit target identity, normalized sampledTime and revision.
Legacy `evaluate` retains its request/result shape and error paths. Both use one
FK/IK/skinning/region implementation; composition mixes fresh transform locals
before that shared path. `compositionPrimitives` and `trackWeight` expose the same
validated descriptor expansion/weight seam for downstream consumers.

See [Composition v1 contract](../model/COMPOSITION.md) for types, formulas, frozen
crossfade coverage, timing, supported limits and #74/#75 integration boundaries.
