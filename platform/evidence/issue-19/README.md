# Issue 19 — mesh, IK and diagnostic authoring evidence

Implementation source: `af97148a53fd7b69bbab9050d8e2a4a99716a25a` (PR #62).
Base: accepted main `a0dc060d1129ae86fb3cf9b9662ad4e31654ecec`.
The earlier native weights/IK run used `cb956929ede5e67ec38b664fcaea5662c621dc4d`;
the native offset-pagination supplement and final browser regressions use af97148.
The following evidence commit changes no implementation. [Environment](environment.json):
macOS 26.4 / arm64, Node 22.22.3, npm 10.9.8; automated Chromium 153.0.8010.12,
actual Pixi WebGL. Native host is Codex In-app Browser with Browser skill and
`document.modelContext`; its UA was not separately measured. No browser flags changed.

## Actual results

| Acceptance | Evidence and result |
| --- | --- |
| Shared UI/native revision | [native-session.json](native-session.json): 28 native tools discovered; actual Editor UI selected vertex 1 and set root/tip weights .8/.2 (revision 1). Native apply_batch changed vertex 2 to .7/.3 (revision 2). All other 43 vertices and every position/UV unchanged. [UI screenshot](native-ui.png), [DOM](native-ui.txt). |
| Native retry/error/undo | Exact retry returns original revision 2 without another commit. Vertex 999 gives `/operations/1/vertices/0/vertex`; missing bone gives `/attachments/0/weights/3/0/boneId`, both MISSING_REFERENCE and revision 2. Undo restores the complete post-UI vertex page; redo succeeds. Unit/browser tests additionally compare entire Project/history on failed batches. |
| Render then measure | Native render_pose returns actual [PNG image content](native-scarf.png) at revision 2, time .5. Fixed neck anchor at [-180,67.5], 61 base times, 62 evaluations: zero diagnostic records. This is this declared fixture measurement, not Gate 2 artistic acceptance. |
| Native IK diagnostics | Native putIKConstraint changes mix 1→.5. measure_motion reports passed:false, 126 records; first residual 67.67467320366315 px > .5 despite status solved. This demonstrates truthful partial-mix reporting, not a planted-foot pass. |
| Native save/player | save_project returned a 30,202-byte ZIP, downloaded through the actual browser link and committed as [native-authored-scarf.zip](native-authored-scarf.zip). It contains revision 2, 45 vertices and hash-matching scarf PNG. Independently opened through Player file chooser; [player screenshot](native-player.png) / [DOM](native-player.txt) show revision 2 and time 1. Player screenshot was refreshed on af97148 using the same saved ZIP. |
| Large deform keys | Reviewer found complete-key reads could exceed 256 KiB even at limit 1. Fixed with key summaries + `keyTime` vertex-offset pages and `setVertexDeforms`. Unit fixture has 8,000 vertices / 16,000 offsets: last vertex is read/edited without changing any other data. [Native supplement](native-deform-session.json) confirms selected offset 1→[3,4], exact retry, failed batch, undo, plus native creation of a complete mesh, slot and deform animation. |
| UI deform/IK | Real Editor canvas vertex selection, numeric weights, local deform key edit, undo/redo, IK mix form and explicit v0 upgrade/undo all pass. New projects are v1; opening v0 remains v0 before explicit upgrade. |
| Save/reload/player geometry | [Browser report](browser-results.json), [jelly](jelly-roundtrip.json), [IK](ik-roundtrip.json): authored scarf weights/deform, jelly local deform and IK mix .8 retain full Project across ZIP/editor reload. Real player draw is instrumented only to copy the actual successful pose; all nine sampled Poses match exactly. Scarf also survives IndexedDB reload. [Scarf ZIP](authored-scarf.zip), [jelly ZIP](authored-jelly.zip), [IK ZIP](authored-ik.zip). |

The native transcript was obtained with actual `webmcp.fetchTools()` / `tools.call()`.
No page-evaluate handler call is labelled native. Automated browser calls use the
in-page bridge and are labelled separately. The harness mounts the actual Editor,
Runtime and editorBridge; fixture-loading buttons only load accepted source art/data.
It is a development harness, not an added production demo route.

Visual inspection: native scarf capture has coherent texture/continuous surface;
canvas overlay shows the selected vertex and triangle edges. Independent player
shows scarf/jelly/IK geometry after export. IK deliberately reuses scarf texture
on the accepted synthetic leg fixture; this is a geometry/serialization test, not
character art quality. [Jelly player](jelly-player.png), [IK player](ik-player.png),
[automated UI](browser-ui.png), [automated scarf player](browser-player.png).

## Reproduce

From repository root with Node 22:

```sh
npm ci --prefix platform
npm run typecheck --prefix platform
npm test --prefix platform
npm run build --prefix platform
cd platform
npx playwright install chromium
npx playwright test -c authoring.playwright.config.ts
npm run test:browser
python3 evidence/issue-19/verify-evidence.py
npm run dev -- --port 4199 --strictPort
```

- [typecheck.log](typecheck.log): passed.
- [unit.log](unit.log): 162 tests / 15 files passed.
- [build.log](build.log): passed, existing large-chunk warning.
- [browser.log](browser.log): four authoring tests passed.
- [region-browser.log](region-browser.log): default CI suite, 19/19 passed (15 prior
  region/editor/storage/adapter regressions + four new authoring cases).
- [verify-evidence.py](verify-evidence.py): verifies native selected-data invariants,
  retry/error outcomes, four ZIP PNG hashes and nine actual player pose comparisons.

Authoring tests start their own Vite server on 4197 and are included in default CI
through `tests/browser/authoring.spec.ts`. Native testing uses 4199 separately.
Historical issue-12 screenshots produced by the regression run were restored, so
no historical evidence is silently retied to this source.

For native reproduction, follow Browser skill bootstrap and open
`http://127.0.0.1:4199/tests/authoring/browser/index.html`. Click **Nạp mẫu khăn**;
wait for `webmcp-document`, then discover the page tools. To reproduce the exact
shared-user part, open **Lưới / IK**, choose mesh, click vertex 1 on the picture,
set Weight root=.8 and Weight tip=.2, and apply; native inspect sees revision 1.
Replay the requests in native-session.json with the current sessionId/projectId.
[Native recipe](native-recipe.mjs) is a shorter fresh-fixture tool loop including
weights, render, diagnostics, save and selected deform. Save real image blocks and
use the download link before replacing the session. Open the downloaded ZIP with
Player's file chooser. Replaying calls through page JavaScript only is bridge evidence.

Initial development checks found a fixed 24-tool assertion (now uses definitions
length) and an incorrect Player test label (corrected to the existing Mở gói project).
Reviewer found the large-key inspection issue above; its regression and local-write
fix are in af97148. These failed attempts are not counted as passes.

## Scope and limits

Commands and transport docs: [Session](../../src/commands/README.md),
[tools](../../src/adapters/webmcp/README.md), [UI](../../apps/editor/mesh-controls/README.md).
Vertex IDs are zero-based indices; replacing topology can change their meaning.
The UI edits existing meshes/constraints; tools create complete meshes, binds and
constraints. It does not automatically triangulate/weight or build IK chains.
Diagnostics use fixed #18 sampling/thresholds and explicit anchors; passing samples
are not continuous-extrema, eye-height or artistic-quality proof. New keys start
unselected offsets at zero, as stated in UI/API. Ordinary inputs remain <=1 MiB;
pages <=50 and JSON outputs <=256 KiB. Oversized single influence lists fail clearly.
No renderer/model/solver/storage semantics were reimplemented. Gate 2/3 and Polish
performance acceptance remain downstream; no native AbortSignal support claim.
