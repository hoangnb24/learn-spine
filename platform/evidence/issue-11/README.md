# Issue #11 evidence — 2026-09-11

Implementation source commit: recorded in the PR; this evidence is committed with
that source. Base main `4b754be` (renderer PR #40 accepted and merged). Environment:
Darwin arm64, Node 22.22.3, npm 10.9.8, Playwright Chromium 153.0.8010.12,
PixiJS 8.13.2 WebGL. No Spine runtime used.

Actual commands from `platform/`:

- `npm run typecheck`: passed.
- `npm test`: 7 files, 68 tests passed (7 observation tests).
- `npm run build`: passed (existing shell production entry remains owned by #12).
- `npx playwright test -c observation.playwright.config.ts`: one actual browser
  test passed (17.0 seconds); details in `browser-results.json`.
- `python3 tests/observation/verify_archive.py`: passed ZIP CRCs, all 12 PNG byte
  matches, 640×480 dimensions, requested times and revision.

The browser test produced 12 PNGs at i/6 seconds, source revision 0. It mutated the
caller project to revision 1 immediately after submit and verified output remained
revision 0. A second identical render gave identical hashes for all 12 PNGs.
Direct renderPose twice at the same time/camera/revision also gave identical PNGs.
Preview produced 72 frames at 12 fps, three two-second loops. The visible player
was sampled for 6.5 seconds and showed >45 distinct frame indices (actual count in
JSON). A base64/data URL PNG decoded visibly at 640×480; a download link served ZIP
bytes. Releasing its job removed the player, expired job lookup and revoked all 73 Blob URLs. Corrupted input
PNG failed. Unit tests separately inject encoder rejection, cancellation before and
during running work, cancel after success, asset Buffer mutation, output read
mutation, invalid time/quota, terminal eviction and resource disposal.

Visual inspection of `contact-12.png`: all robot parts remain visible, the antenna
and extended arm have margin, camera/scale is stable, and the arm moves through its
overshooting arc then returns. This is an observation fixture, not an approved wave
animation or proof of artistic quality. Continuous fit also has a hand-computed
trim/translation oracle and a 501-time stress test with multi-turn parent rotation,
negative scale and Bezier overshoot.

View without executing the engine: open `viewer.html` next to the committed PNGs.
Or start `npm run dev` and open `/evidence/issue-11/viewer.html`. Pause/play and
`sequence.zip` download work in that page. `browser-preview.png` records the actual
adapter UI plus portable agent image. `contact-12.png` is a compact contact sheet.
All source art remains subject to the internal-evaluation fixture source manifest.

Limitations: no native WebMCP dispatch was run here (#13 owns it); #3 native signal
failure is unchanged. Browser checks use local Chromium, not a cross-device pixel
guarantee. Playback timing is observable sequencing, not frame-rate performance
certification. Continuous interval fit can be looser than exact extrema. No codec,
production hosting, editor integration, or Gate 1/3 completion is claimed. Initial
unit testing caught an extra viewport field passed to the evaluator; fixed by
passing only animationId/time before recording the final pass.
