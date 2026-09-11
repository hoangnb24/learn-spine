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

## Corrective review — owned Buffer bytes

Reviewer identified Buffer aliasing after initial merge. Corrective implementation `d2ac534`, based on main `7d1e19d`, replaces polymorphic input copies with concrete Uint8Array copies, snapshots direct PNG input/metadata and isolates decoder input. No dependencies added.

Actual local checks (same Darwin/Node environment above): `npm run typecheck --prefix platform` pass; `npm test --prefix platform` 42 pass; `npm run build --prefix platform` pass; `npm run test:browser --prefix platform -- tests/browser/storage.spec.ts` 5 pass. Regression uses real Node Buffer for ZIP input mutation during DEFLATE and browser Uint8Array subclass whose slice aliases (equivalent to Buffer), with real createImageBitmap decoding. It mutates source during delayed validation, mutates decoder-owned input, and checks validated/packed/autosaved snapshots plus recovery output isolation. Direct `validatePng` metadata and byte snapshots are covered too.

The new browser alias regression was also run against pre-fix storage source from main: it failed with `ASSET_DECODE_FAILED` after external mutation (exit 1). Restored corrective source then reran the storage browser suite: all 5 pass. This demonstrates the regression catches the original bug. Independent re-review and CI remain required before closing #10.
