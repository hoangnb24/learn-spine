# Issue #15 evidence

Implementation source: commit introducing this report; exact full reviewed head is
recorded in the PR (no self-referential commit hash in a committed file).
Base: `0c1597cbf323d36e83c36db06dea18d2747d5917`.
2026-09-11, macOS 26.4 (25E246), Darwin arm64, Node v22.22.3, npm 10.9.8.

Commands run from repository root unless indicated:

| Check | Actual result |
| --- | --- |
| `npm ci --prefix platform` | 70 packages installed, 0 vulnerabilities |
| `npm run typecheck --prefix platform` | pass |
| `npm test --prefix platform` | 89/89 tests, 9 files pass |
| `npm run build --prefix platform` | pass; existing large chunk warning |
| `npm ci --ignore-scripts --prefix docs/product/contracts` | pass |
| `npm test --prefix docs/product/contracts` | 5/5 region contract tests pass |
| `npm run typecheck --prefix docs/product/contracts` | pass |
| `cd platform && npx playwright test` | 15/15 browser tests pass: editor/player, storage, adapter |
| `cd platform && npx playwright test -c renderer.playwright.config.ts mesh-boundary.spec.ts` | 1/1 real decoder ZIP + renderer rejection pass |
| `cd platform && npx playwright test -c renderer.playwright.config.ts` | original region renderer test pass (before adding mesh boundary test); measured output copied to region-regression.json |

`region-regression.json` is actual rerun data; performance numbers are descriptive,
not a Gate 1 retest/pass. No existing historical evidence was replaced. Mesh browser
boundary result is in `browser-boundary.json`, with Chromium version and actual
ZIP/pose equality, unsupported response and retained region drawing result.

[Contract and downstream handoff](../../../docs/product/contracts/mesh-v1.md).
No mesh rendering/editor authoring, IK solving, diagnostics acceptance, Gate 2 or
performance claim. CI/reviewer acceptance must refer to the PR head separately.
