# #6 — Model validation evidence

Implementation commit: `cd52f63` ([PR #33](https://github.com/hoangnb24/learn-spine/pull/33)), 11 September 2026. Environment: macOS 26.4 (25E246), arm64; Node 22.22.3; npm 10.9.8; Playwright 1.63.0 / Chromium 153.0.8010.12 (revision 1243).

Actual results from repository root, all exit 0 after installing the browser:

| Command | Result |
| --- | --- |
| `npm ci --prefix platform` | 57 packages installed; audit 0 vulnerabilities |
| `npm run typecheck --prefix platform` | Pass |
| `npm test --prefix platform` | 27/27 tests; 25 model/JSON cases + 2 existing shell cases |
| `npm run build --prefix platform` | Production Editor/Player/shared chunks built |
| `npm run test:browser --prefix platform` | 2/2 Chromium shell regressions; direct entries/navigation/reload/no runtime errors, narrow viewport and keyboard |
| `npm ci --ignore-scripts --prefix docs/product/contracts` | 6 packages installed; audit 0 vulnerabilities |
| `npm test --prefix docs/product/contracts` | 5/5 existing contract oracle cases |
| `npm run typecheck --prefix docs/product/contracts` | Shared types and mock consumers pass after single-source move |
| `git diff --check` | Pass |

The initial local browser run failed before any page opened because the pinned Chromium executable was absent. Running `npx playwright install chromium` from `platform/` installed it; the rerun passed. No code change was needed for this environment issue.

Coverage includes real T03 JSON and synthetic fixtures, defensive copies, identity migration/revision retention, editor state separation, duplicate IDs/paths, every reference kind, self/multi-bone cycles, finite numbers before serialization, duration/channel/key/Bezier rules, trim bounds, unknown fields/features/versions, getter/cyclic/deep malformed in-memory data and strict duplicate decoded JSON keys. Schema regex checks include terminal newlines in IDs/path/hash. T03 arithmetic is an independent fixture check, not evidence that an evaluator or renderer is implemented.

Public API/handoff and limits: [model README](../../src/model/README.md). No animation playback, storage bundle/hash/decode, commands/history, WebMCP or product gates are claimed here. CI runs for the implementation: [push](https://github.com/hoangnb24/learn-spine/actions/runs/34559973067), [PR](https://github.com/hoangnb24/learn-spine/actions/runs/34560023251); inspect GitHub status for final outcome.
