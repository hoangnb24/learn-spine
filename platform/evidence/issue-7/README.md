# Issue #7 — command/session verification

Date: 2026-09-11. Environment: macOS Darwin arm64, Node v22.22.3, npm 10.9.8. Base: main `1249b2f` (#6 merged). Implementation ownership is limited to `platform/src/commands`, `platform/tests/commands` and this evidence.

Actual local commands/results on the source committed with this report:

- `npm ci --prefix platform --ignore-scripts`: success, 57 packages, 0 vulnerabilities.
- `npm run typecheck --prefix platform`: success.
- `npm test --prefix platform`: success, 3 files, 42 tests (15 commands tests plus 27 existing tests).
- `npm run build --prefix platform`: success, editor/player production bundles.

The commands suite uses an injected trusted fixture validator so tests measure transactions/history and immutable byte ownership independently of #10's decoder/storage implementation. Actual PNG decoding, ZIP, IndexedDB and browser application integration are not claimed here. #10's public `validateBundle(input: unknown, signal?)` is the production preparation dependency; it copies project/bytes before its first await.

Acceptance coverage is durable in `platform/tests/commands/session.test.ts`: atomic failure/forward references, stale/user-agent edits, structural retries/mismatches/order, FIFO dedup and session reset, undo/redo/checkpoint/restore, revision exhaustion, bounded history, single/reentrant events and replaced/deleted asset bytes retained through history. Recipe mapping and integration contract are in `platform/src/commands/README.md`.

CI/head result will be linked in the PR after the run completes. No renderer/UI/transport gate is claimed. No product blocker identified; Orchestrator owns independent review, merge, issue closure and Project updates.
