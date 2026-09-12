# Evaluator interface compatibility follow-up

Baseline: main `bfff5e5` after #73 / PR #77, 2026-09-12. Runtime behavior is
unchanged. A final consumer audit found `docs/product/contracts/mock-consumers.ts`
implements the legacy `Evaluator` interface with only `evaluate`. Making the new
`evaluateTarget` method mandatory broke that consumer, which is outside platform's
typecheck include paths.

The legacy `Evaluator` interface is preserved. `TargetEvaluator extends Evaluator`
adds the canonical target method; the single exported engine implements that
extension. Existing consumers can still supply `{evaluate}`. New consumers can use
`TargetEvaluator`, `evaluateTarget`, `TargetPose` and `RenderablePose` directly.

Validated on macOS arm64 / Node 22.22.3 / npm 10.9.8:

| Check | Result |
| --- | --- |
| `npm run typecheck --prefix docs/product/contracts` | exit 0, including old mock consumer; [log](contracts-typecheck.txt) |
| `npm test --prefix docs/product/contracts` | 5 passed; [log](contracts-tests.txt) |
| `npm run typecheck --prefix platform` | exit 0; [log](typecheck.txt) |
| `npm test --prefix platform` | 184 passed, 1 existing skip; [log](tests.txt) |

Platform CI now also installs/typechecks/tests the contracts package whenever
platform or contract files change; the trigger includes docs/product/contracts.
This catches separately compiled legacy consumers alongside core changes.

The engine regression suite now explicitly constructs `const legacy: Evaluator =
{evaluate}` before exercising legacy geometry behavior. CI checks the new head;
no new browser behavior or downstream support is introduced. Original #73 evidence
is retained unchanged. Exact reviewed head/CI is in this follow-up PR.
