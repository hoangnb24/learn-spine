# PixiJS region renderer (#9)

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

## Versioned pose boundary (#15)

The renderer accepts `poseVersion:1` for region geometry. `rendererCapabilities`
lists only region-v0; prepare/draw/camera reject mesh-v1 until #17. Failed mesh
prepare preserves the previous prepared region. [Mesh handoff](../../../docs/product/contracts/mesh-v1.md).
