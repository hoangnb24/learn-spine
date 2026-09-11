# Issue #18 evidence

Base: accepted mesh + IK main `700b18c`. Source: commit introducing this report;
exact full reviewed head is recorded in the PR. 2026-09-11, Darwin arm64,
Node v22.22.3, npm 10.9.8.

| Check (repository root) | Actual result |
| --- | --- |
| `npm ci --ignore-scripts --prefix platform` | 70 packages installed, 0 vulnerabilities |
| `DIAGNOSTICS_EVIDENCE=./evidence/issue-18/results.json npm test --prefix platform` | 151 tests / 13 files passed; 30 diagnostics tests |
| `npm run typecheck --prefix platform` | passed |
| `npm run build --prefix platform` | passed; existing large-chunk warning |

[results.json](results.json) contains actual deterministic diagnostic reports:
invalid negative weights (no evaluation), stationary mesh and fixed anchor (zero
issues), moving anchor, whole-mesh reflection (zero issues), local inversion,
velocity seam mismatch with matching positions, smooth Bezier loop (zero issues),
reachable planted foot (zero issues), and an earlier `solved` IK endpoint displaced
by a later constraint (nonzero final error). Reports retain sampling policy, exact
base sample times, evaluation count, observed values, thresholds, IDs and pages.

[Fixtures](../../fixtures/diagnostics/synthetic.ts) are metadata-only synthetic
geometry and IK projects, composed from the accepted mesh/IK fixtures. No image
assets or visual-quality claim. [Tests](../../tests/diagnostics/motion.test.ts)
also exercise weight sums/references/counts/duplicates/nonfinite data, strict 0.5px
thresholds, stance intervals, a sliding solved target, local versus shared
reflection on a multi-bone mesh, degeneracy, disabled IK, bone-local points,
velocity direction, the 0.5px/s floor, authored unwrapped loop endpoints,
nonmutation, pagination, getters, sampling limits and arithmetic overflow.

[API and pre-measurement policy](../../src/diagnostics/README.md) is the handoff to
#19. Ownership is only diagnostics source/tests, fixtures and this evidence;
shared model, evaluator, renderer, transport and coordination files are unchanged.
The pure APIs are not yet registered authoring/observation tools.

Finite samples and sampled peak speed are not a continuous-extrema proof. No
rendering, art review, eye-height diagnostic, Gate 2 or performance claim. Browser
regressions were not rerun for this pure module with no UI/shared entry changes.
