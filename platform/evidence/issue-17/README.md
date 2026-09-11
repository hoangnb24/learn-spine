# Mesh renderer #17 — review evidence

Mesh-v1 now renders using evaluated world vertices, canonical slot order and PNG
alpha. Real T01 scarf/jelly PNGs were captured at bind, midpoint and extreme,
then at half source resolution using the same logical geometry and camera. Both
semantic and evaluated-pose hashes remain identical. The actual ObservationService
produces mesh PNGs and ZIPs; its continuous camera envelope includes deforms and
accepted #16 IK output. This is renderer acceptance, not Gate 2 authored-motion
acceptance or a 16.7 ms performance pass.

Source: `3deda2099dc2ef1fe49ec9777c37a5c1b0e9c25d`, based on accepted main
`700b18c` (#15 and #16 merged). The final evidence-only commit is identified by the
PR head. [Environment](environment.json): macOS / arm64, Mac Studio Mac16,9,
Apple M4 Max, 36 GiB RAM, Node 22.22.3, npm 10.9.8; Chromium 153.0.8010.12,
ANGLE Vulkan **SwiftShader software renderer**. This is the same host/browser
family/backend as Gate 1, not a native hardware GPU measurement.

## Review media and oracles

Open [viewer.html](viewer.html) locally, or run `npm run dev` in platform and open
`/evidence/issue-17/viewer.html`. It switches full/half/observation/weights images
and plays the three saved phases. [Contact sheet](contact.png): scarf across the
top, jelly below; columns are 0, 0.5 and 1 second. The generated PNGs are direct
renderer or ObservationService bytes, not screenshots of another engine.

- [Mesh report](mesh-results.json): source/pose hashes, three-vertex bounded
  inspection at each phase, evaluated bounds, signed triangle area extrema,
  full/half pixel comparisons, observation manifests and actual timing samples.
- [Pixel oracle](pixel-results.json), [synthetic image](synthetic.png): exact
  red/green/blue/top-left mapping, 128/255 alpha, shared-edge coverage,
  reflected and collapsed geometry, interleaved region/mesh draws in both
  orders, repeated attachment slots (alpha 192/255), bad pose/cancel/context-loss
  errors, closed bitmaps and destroyed textures, geometries **and buffers**.
- [IK report](ik-results.json), [overlay](ik-overlay.png),
  [observation](ik-observation-1.png): mixed mesh/foot region uses the real
  accepted solver through evaluate, then real renderer and observation. Four
  phases are inside the continuous envelope; final foot residual stays <0.5.
  Full-turn constrained-rotation bounds are deliberately loose (extra whitespace).
- [Scarf ZIP](scarf-observation.zip) and [jelly ZIP](jelly-observation.zip) include
  direct PNGs and manifests with source revision, sampled time and fixed camera.
  [ZIP roundtrip report](browser-boundary.json) checks v1 Project/Pose identity
  with actual PNG decode and failed replacement preserving the prepared mesh.

Visual inspection of full/half bind, midpoint, extreme, wireframe/weights and IK
media found coherent texture direction, continuous shared edges and no unexpected
triangle reversal. Numeric signed areas stay strictly negative for all T01 fixture
triangles in the three sampled poses. The synthetic seam pixel is solid, not
transparent or double-blended. This does not promise correct arbitrary topology:
degenerate/reversed authored triangles are allowed and are not repaired.

Full/half mean absolute RGBA differences (0–255 scale) are 0.68–0.73 for scarf and
0.13–0.16 for jelly across the three phases; the test threshold was <3. Images are
not expected to match pixel-for-pixel because resampling loses detail. Logical
vertices, weights, binds, bones, slots and animation hashes, plus complete evaluated
pose hashes, match exactly; identical viewports are used for every full/half pair.

## Reproduce and actual checks

From `platform/` with Node 22:

```sh
npm ci
npm run typecheck
npm test
npm run build
npx playwright install chromium
node tests/render/mesh/environment.mjs
npx playwright test -c renderer.playwright.config.ts --workers=1
npx playwright test
npx playwright test -c observation.playwright.config.ts
```

Run the last two commands sequentially: the existing storage test and observation
harness both reserve port 4181. An initial concurrent run hit that port conflict;
[its log](app-port-conflict.log) is retained. Sequential rerun passed without
changing app/storage code. This was a harness scheduling error, not a product pass.

| Check | Actual result / log |
| --- | --- |
| TypeScript | Passed — [log](typecheck.log) |
| Unit | 125 tests / 13 files passed — [log](unit-check.log) |
| Build | Passed; existing >500 kB bundle warning — [log](build-check.log) |
| Real renderer | 5 tests passed, one worker — [log](renderer-check.log) |
| Editor/player/storage/adapter regression | 15 tests passed — [log](app-check.log) |
| Real region observation regression | 1 test passed — [log](observation-check.log) |
| T01 source verifier | 25 files, 15 placements, 5 briefs passed — [log](source-check.log) |

Unit coverage adds exact hand-calculated mesh XY, bad UV/index/slot/finite-boundary
rejection, continuous Bezier deform overshoot with reflected/nonuniform scale,
and actual IK mesh/region bounds over 12 bend/mix/reflection combinations × 101
phases. Existing v0, v1 storage/session and IK regression suites remain included.
Historical Gate 1/issue 9/11/12 artifacts are not updated by this PR; their test
outputs are restored after checking so old evidence remains tied to its source.

## Geometry update measurement and limits

Each T01 mesh has 45 shared vertices / 64 triangles. The benchmark pre-evaluates
three poses, warms 60 draws and records 300 draws, with overlays disabled. It times
the **actual draw call**: geometry validation, world-to-screen conversion, in-place
position-buffer update and WebGL submission. It excludes evaluator and PNG encoding.
It does not measure GPU completion, display presentation or whole-frame cadence.
Browser timer quantization makes some sub-millisecond p50 readings 0; see exact
p50/p95/max values in mesh-results.json. No attempt is made to use these inclusive
CPU timings as a Gate 1 performance pass. Polish #51/#52 retains that work.

The renderer exposes minimal display overlays via `setOverlay`; no mesh authoring
commands, editor controls or public mesh inspection tool is added (#19). Observation
uses full mesh/deform/IK envelopes, but the conservative IK camera can be wider than
the tight sampled-pose fit. The fixture tests renderer geometry, not scarf motion
quality, jelly eye preservation or Gate 2 scoring. T01 art is internal evaluation
per the source manifest; this evidence does not expand redistribution rights.

Ownership: render/mesh.ts, index.ts, geometry.ts, render README; observation/bounds.ts
and README; renderer tests/fixtures/evidence, plus the former renderer-refusal
assertion in engine/mesh tests and the corresponding mesh contract paragraph.
No model/schema/solver/command/storage behavior was changed.
