# Issue #10 acceptance evidence

Implementation tested: `928f141` (2026-09-11). Environment: Darwin arm64, Node v22.22.3, npm 10.9.8; installed pinned platform dependencies with `npm ci --prefix platform --ignore-scripts`.

Actual commands from repository root:

| Command | Actual result |
| --- | --- |
| `npm run typecheck --prefix platform` | pass |
| `npm test --prefix platform` | 33 tests pass across 3 files, including 6 ZIP/storage boundary tests |
| `npm run build --prefix platform` | pass, 21 modules |
| `npm run test:browser --prefix platform` | 6 Chromium tests pass, including 4 storage tests and 2 existing shell checks |

Tests cover complete project roundtrip, exact PNG bytes through ZIP and real IndexedDB reload, delayed old save after newer commit, malformed ZIP, paths, duplicate entries/JSON keys, unexpected/missing files, version rejection, encryption/symlink rejection, CRC, declared and actual DEFLATE budgets, hash/header/decoder errors, quota/write failure, transaction interruption and AbortSignal. Browser PNG fixtures are created by canvas in a committed harness, not synthetic zero-filled metadata. Browser failures are injected into real IndexedDB, not a fake-IDB implementation; physical disk exhaustion is not tested.

See [API and integration contract](../../src/storage/README.md). No additional production dependencies or app integration were introduced. Local checks do not establish hosted CI results or downstream #12/#13 UI acceptance; independent reviewer and CI must evaluate the PR head.
