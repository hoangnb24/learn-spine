# PixiJS region and mesh renderer (#9 / #17)

`PixiRenderer` implements the canonical `Renderer` in `model/types.ts`. It uses
PixiJS **8.13.2** (MIT) WebGL directly; no Spine runtime and no animation ticker.
Editor/player and observation use this same module. The app shells are not wired
in this issue; integration belongs to #11/#12.

```ts
import { PixiRenderer, fitCamera } from './render';
import { evaluate } from './engine';
const created = await PixiRenderer.create(optionalCanvas);
if (!created.ok) return created;
const renderer = created.value;
const ready = await renderer.prepare(bundle, signal);
if (!ready.ok) return ready;
const pose = evaluate(bundle.project, { animationId: null, time: 0 });
if (!pose.ok) return pose;
const fitted = fitCamera(bundle.project, [pose.value], viewport, 24);
if (!fitted.ok) return fitted;
renderer.draw(pose.value, fitted.value.viewport);
// Mount renderer.canvas; resize by supplying a new viewport to draw.
const png = await renderer.capture(pose.value, fitted.value.viewport, signal);
const metadata = renderer.frameMetadata;
// When closing the player/job:
renderer.dispose();
```

All expected failures return canonical `Result` errors. `create` reports unavailable
WebGL. `prepare` defensively validates/clones the project, verifies PNG header,
SHA-256 and decoded dimensions, and owns its ImageBitmaps and uncached textures.
Missing bytes report `MISSING_REFERENCE` with an asset path. Decode/hash failure,
cancellation or superseding prepare leaves the previous prepared snapshot intact.
A successful replacement destroys old mesh geometry, textures/sources and closes
bitmaps. `dispose` is idempotent, cancels in-flight prepare and releases resources.
No source URL is fetched from project metadata. Limits: 256 assets, 20 MiB each,
16384 per image dimension, 64 million decoded pixels. Storage remains responsible
for validating the complete package and ZIP limits.

`draw` requires the prepared project ID/revision and slot references/order. It
preserves affine shear, negative and zero scale using four mesh vertices instead
of decomposing a matrix. `DrawRegion.world` already includes attachment transform.
Trim/pivot are applied once using T03; top-left PNG UVs remain top-left. PNG alpha
and slot order provide transparency/occlusion; v0 has no per-slot alpha property.
Viewport mapping is centralized in `screenPoint`. CSS dimensions and zoom determine
geometry; DPR only changes backing dimensions (`round(CSS * DPR)`) and PNG size.
Capture snapshots the canvas before awaiting PNG encoding; returned bytes are owned
by the caller. A context loss reports `RENDER_FAILED`; recreate/reprepare to recover.

`frameMetadata` is a copied description of the last successful frame: project ID,
revision, animation ID, sampled time, viewport, and actual PNG pixel dimensions.
It is cleared on replacement/dispose. `diagnostics` exposes backend, disposed state
and owned texture count for lifecycle checks. One instance is intended for one
player or observation job. Concurrent prepares use latest-call-wins cancellation;
a capture begun before replacement still owns its already-snapshotted image.

## Camera contract

`fitCamera(project, poses, viewport, padding)` returns a fresh viewport, union bounds
and poseCount. It includes every textured corner of **every supplied pose**, including
antennae and transparent margins. Pass the entire observation sequence (and known
extrema) once to keep a stable camera throughout playback. Empty drawing returns
null bounds and preserves the camera. It never changes the project or keyframes.
A finite pose set cannot prove containment between samples of arbitrary animation
curves. Continuous animation extrema discovery belongs to the caller/evaluator;
this API does not claim it. The test rotates the robot arm through 25 supplied
poses, fitting their full union, then captures the same union after portrait resize.

## Reproduce

Node 22, from `platform/`:

```sh
npm ci
npm run typecheck
npm test
npm run build
npx playwright install chromium
npx playwright test -c renderer.playwright.config.ts
```

The separate Vite development harness lives in `tests/render/browser/`; it is not a
production entry and does not publish T01 art. It uses the reviewed fixture manifest
and placement data directly. Browser tests generate synthetic quadrants in memory,
exercise real PNG decode/WebGL/readback, and write durable evidence into
`evidence/issue-9/`. No screenshot is substituted for rendering tests.

Primary API sources checked 2026-09-11:
[renderer guide](https://pixijs.com/8.x/guides/components/renderers),
[WebGLRenderer](https://pixijs.download/release/docs/rendering.WebGLRenderer.html).
Pinned package types/source were used for version-specific mesh lifetime and resize.
Dependency lock audit: `npm audit --omit=dev` reports zero vulnerabilities; this is
not an audit of all future distribution obligations. Keep PixiJS MIT notice with
redistribution. T01 art remains internal evaluation per its source manifest.

## Mesh v1 (#17)

`rendererCapabilities` advertises `poseVersions:[1]`, `region-v0` and `mesh-v1`.
Prepare accepts validated v0/v1 bundles. `poseGeometry` interleaves Pose regions and
meshes by project slot order, validating each relative order, reference, vertex count,
finite positions and unchanged UV/index topology. Mesh world XY is already skinned;
only `screenPoint` is applied. No attachment/slot transform, trim or pivot is applied
again. UV (0,0) remains the decoded PNG top left. Reused attachments have separate
slot draws. PNG alpha uses the same source-over blending as regions; the model has
no per-slot alpha channel.

Geometry is allocated once per prepare and position buffers are updated in place on
draw. Winding reversal and zero animated scale render naturally; there is no culling
or automatic topology repair. `fitCamera` includes every evaluated vertex of every
supplied mesh pose. Observation's continuous envelope also includes deform curves,
weighted bind inverses, animated worlds and constrained local rotations (see its
README); renderer itself never solves IK.

`renderer.setOverlay({wireframe:true, weightBoneId:'tip'})` enables optional cyan
triangle edges and per-vertex selected-bone weights (blue=0, red=1, radius 3 CSS px).
Use `{}` to turn it off. Overlays are display state only and do not modify Project,
Pose, fit bounds or storage. They are above all attachments and appear in subsequent
`capture` calls on this renderer. Observation's owned renderers default to no overlay.
No mesh authoring/editor UI or WebMCP geometry tool is introduced here (#19).

Replacement is transactional: textures and geometries are prepared before releasing
the old snapshot. Failures/cancellation retain it. Destroying geometry explicitly
passes `true` to destroy its owned vertex, UV and index buffers; texture sources,
bitmaps and overlay graphics are released as well. `diagnostics.geometryCount` joins
textureCount for lifecycle inspection. Browser tests inspect the actual owned
buffers' destroyed states, closed ImageBitmaps and context-loss error behavior.

Changing source PNG pixel dimensions while preserving mesh vertices, UVs, bind poses,
weights, bones and keys requires no rig edit. The T01 fixture uses full/half sources,
compares semantic and evaluated-pose hashes, renders both with identical viewports,
and records bounded first-three-vertex inspection rather than dumping large poses.
See [durable #17 evidence](../../evidence/issue-17/README.md) and
[mesh contract](../../../docs/product/contracts/mesh-v1.md).
