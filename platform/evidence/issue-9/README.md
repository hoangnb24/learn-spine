# Issue 9 implementation evidence

Executed 2026-09-11 on Darwin 25.4.0 arm64, Node v22.22.3, npm 10.9.8.
Browser: Playwright Chromium 153.0.8010.12, headless. WebGL backend is ANGLE
**SwiftShader**, a software Vulkan device; this is real browser WebGL, not hardware
GPU performance evidence. Exact renderer/user-agent/timings are in
`browser-results.json`.

From `platform/`, actual results:

- `npm run typecheck`: passed.
- `npm test`: 6 files / 61 tests passed (combined with merged #7/#10).
- `npm run build`: passed; shell build remains separate from renderer test harness.
- `npm run test:browser`: 7 shell/storage browser tests passed.
- `npx playwright test -c renderer.playwright.config.ts`: 1 real-browser test passed.
- `npm audit --omit=dev`: zero vulnerabilities.

The browser test verifies top-left UVs with red/green/blue quadrants, alpha 128 and
transparent background, trim and bottom-left pivot, translated/rotated/nonuniform
scale, mirror and zero scale, overlap in both slot orders, half-resolution texture
invariance, DPR 2 and fractional CSS/backing dimensions, missing bytes, hash mismatch,
stale pose, cancellation, retained previous project after failure, texture counts
on replacement/dispose, and nonmutation across 25 arm poses and portrait resize.

Images: `synthetic.png` (trim oracle), `robot-contact.png` (25 poses),
`robot-extreme.png` (1280×720), `robot-resize.png` (840×1280 at DPR 2).
Author inspected the robot extreme: torso, hands, feet and antenna visible, art
orientation and layering coherent. Independent reviewer still owns acceptance.
These are renderer fixtures, not authored idle/wave quality or full Robot gate #14.

Performance is 300 synchronous draw calls after 60 warmup calls, measured with
`performance.now` at 1280×720, 15 regions. It includes geometry update and WebGL
submission, excludes evaluator, PNG encoding, GPU completion and presentation.
The submillisecond quantization is visible in results. This is a preliminary
baseline for #13/T13; no 30-second frame-rate or hardware GPU claim is made.

The exact tested implementation head is recorded in the PR and downstream handoff;
this document and generated results are committed with it. Re-running regenerates
machine-specific timing evidence. No external art publication was performed.

Combined validation ran on merge head `29ab324e74533cb326b5ba4abd84603d7d5c51be`
after merging main `9d9c9a8`. The following evidence-only commit records these
results without changing implementation.
