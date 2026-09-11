# Observation #11

`ObservationService` implements the canonical `Observation` from model/types, using
`evaluate` and `PixiRenderer` directly. Import from `src/observation/index.ts`;
browser/transport presentation is separately exported by `media.ts`. This module
does not register WebMCP tools or modify the editor. #13 maps public tool names:

| Tool | Service call |
| --- | --- |
| `render_pose` | `renderPose(bundle, {animationId, time, viewport}, signal?)` |
| `render_sequence` | `submit(bundle, {kind:'sequence', animationId, times, viewport})` |
| `preview_animation` | `submit(bundle, {kind:'preview', animationId, fps, loops, viewport})` |
| `get_job_status` / cancel | `get(jobId)` / `cancel(jobId)` |
| Read output | `readArtifact(artifactId)` / `getManifest(jobId)` |
| Release / session close | `release(jobId)` / `dispose()` |

All calls return canonical Results. `renderPose` adds metadata to the canonical
`{revision,png}` result. A pose uses the exact requested camera; sequence/preview
fit one stable camera for their entire animation, evaluate every requested sample,
and output PNGs in request order. Sequence supports arbitrary finite times including
negative, repeated and unsorted times; sampledTime records evaluator wrap/clamp
separately from requested time. Preview samples `i/fps < loops*duration`.

## Fit guarantees

`fitCamera` first sees every requested pose. `animationBounds` then computes a
conservative continuous envelope for the whole animation, including times not
requested. For each local channel its range contains every key value and every
Bezier value control point. The convex-hull property bounds Bezier overshoot even
when time inversion is nonlinear. Rotation sine/cosine ranges include their turning
points; intervals covering a full turn or huge angles conservatively use [-1,1].
Interval multiplication/addition propagates affine transforms parent-first, then
includes all trimmed texture corners after attachment transform. Negative scales,
shear, multiple turns and channels with different key times remain bounded.

This is an envelope, not an exact extrema optimizer: treating correlated values as
independent may leave more empty space than the tightest possible camera, especially
for many animated ancestors. It deliberately fits the full animation even for a
short requested subset. Overflow fails with INVALID_INPUT; it does not return a
clipped success. Empty drawing preserves the supplied camera with null bounds.
The default padding is 24 CSS pixels, reduced to one quarter of the smaller viewport
for small outputs. Frame metadata includes bounds, actual zoom/viewport, dimensions,
projectId, source revision, animationId, requested time and sampledTime.

## Snapshot and lifetime

Project validation/cloning, byte copying (`new Uint8Array`, including Node Buffer),
request copying and quota admission occur synchronously before the first await or
queued callback. A job never reads live state again. Both successful and failed
renderers are disposed in finally; failed/cancelled jobs expose no partial artifacts.
App-owned job IDs provide cancellation independently of native transport signals.
The #3 native WebMCP AbortSignal failure is not claimed fixed or passed here.
`renderPose` also accepts an AbortSignal. Cancel is idempotent; terminal states do
not change. Cancelled work retains its active resource slot until its async work
settles, preventing repeated cancels from bypassing resource admission.

Limits: two queued/running observations (including direct poses); 20 terminal jobs;
1–300 sequence frames; preview fps integer 1–60, loops integer 1–3, total <=300;
multiple loops require a looping animation; backing dimensions <=4096; RGBA <=256
MiB per job; copied input assets <=200 MiB per request. PNGs plus ZIP are limited to
256 MiB per job and 256 MiB retained across the session. Oldest terminal records and
artifacts are evicted to satisfy retention limits; IDs then return JOB_NOT_FOUND.
These are retained-output limits, not a claim of 256 MiB peak process memory:
renderer decoding, two snapshots and temporary export buffers also consume memory.
Reload loses jobs. Download the ZIP to preserve results.

## Media that users and agents can view

Each succeeded job has one PNG Artifact per frame and one ZIP Artifact. The ZIP
contains `frame-0000.png` etc and `manifest.json` with frame metadata, source revision
and playback fps (null for arbitrary sequence). The ZIP writer uses existing STORE
archive support; artifact IDs are opaque, never filesystem paths. `readArtifact`
returns fresh bytes; `getManifest` returns a fresh copy.

`imageContent(service, pngArtifactId)` in `media.ts` produces base64 image content
and a portable `data:image/png;base64,...` URL, capped at 8 MiB. #13 should forward
the image content using the actual transport's supported image block or present the
data URL to a browser; JSON.stringify of raw bytes is not image delivery. Native
agent transport delivery is #13's acceptance, not established by this module.

`mountPreview(service, jobId, host)` displays PNG playback, source revision/time,
play/pause and a ZIP download. It returns `{dispose}`. It creates Blob URLs only in
the browser adapter and revokes them on dispose or job release/eviction. Call its
dispose on unmount. Compare the displayed source revision with the active editor
revision in the consuming UI when integrating #12/#13. No image is uploaded.

Durable reviewer media: `platform/evidence/issue-11/viewer.html` opens the committed
PNGs directly and plays them. `contact-12.png` shows all samples; `sequence.zip`
is independently downloadable. Run `npm run dev` and open
`/evidence/issue-11/viewer.html`, or open the file after cloning. This uses the same
saved frames inspected by the browser test and is not a production service.

## Verification

From platform: `npm run typecheck`, `npm test`, `npm run build`, and
`npx playwright test -c observation.playwright.config.ts`.

The unit renderer is explicitly mocked for lifecycle failures and byte isolation.
The browser harness uses real T01 robot PNGs, evaluator, Pixi WebGL and PNG encoding.
See `evidence/issue-11/README.md` for actual results and limits. No editor/player or
full Gate 1/3 acceptance is implied.
