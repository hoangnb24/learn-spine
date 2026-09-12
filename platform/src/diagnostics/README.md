# Motion diagnostics v1 — policy locked before measurement

2026-09-11, issue #18. Pure consumers of the accepted model and evaluator on
`700b18c`. No renderer, DOM, Spine, skinning or IK solver is implemented here.
This policy is fixed before running the diagnostic fixtures; thresholds are not
request options. This module is the API handoff to #19, not registered tools.

- `validate_project(unknown, page?)` reports one validation
  problem. A bounded descriptor-only scan identifies malformed weights even when
  the schema union's first error points at the region alternative. The original
  strict-model problem is retained in `validationProblem`. It never evaluates invalid data. Repair and rerun to discover subsequent
  model errors. Invalid input is a successful diagnostic report with `valid:false`;
  malformed requests and evaluation failures are failed `Result`s.
- `measure_motion(unknown, request)` validates first and returns the same invalid
  report before any evaluation. A valid request names one animation. It measures
  all IK final residuals, all drawn mesh triangles, declared fixed-world anchors,
  and loop position/velocity for declared points (default: all bone origins,
  drawn mesh vertices and IK endpoints). Empty loopPoints deliberately selects
  none. Anchors use explicit world targets; an IK endpoint anchor detects a sliding
  target even when solver residual is zero. Optional inclusive anchor intervals
  support stance phases. Nothing guesses which body part is a foot/anchor.
- World distance threshold: 0.5 logical px, strict `>`; weights sum tolerance
  1e-5, no normalization. Loop velocity uses the Euclidean vector difference,
  tolerance `max(0.5 px/s, 0.05 * sampled peak speed)`; near stationary means
  sampled peak <=10 px/s. Both directions and magnitude matter.
- Sampling: 60 equal intervals including 0 and duration, union all channel/deform
  key times and anchor interval endpoints. At every interior key add t±h (clipped
  to [0,duration]); h = min(1/600 s, duration/600). Loop endpoints use second-order
  one-sided differences (-3p0+4ph-p2h)/(2h) and
  (3pT-4p(T-h)+p(T-2h))/(2h). Peak uses the same h central differences at interior
  base samples and one-sided endpoint differences. Time deduplication is exact;
  h must produce distinct representable samples or return an error.
- To expose the authored last pose (including an endpoint discontinuity), evaluate
  a defensive project copy with only the selected animation's loop flag false.
  Evaluator clamping then gives the unwrapped [0,duration] cycle. Source project
  and its animation remain unchanged. All positions come from canonical Pose;
  foot errors use final `Pose.ik.distance`, even if its status says `solved`.
- Triangle signed double-area epsilon: 1e-8 logical px². Compare setup-pose area
  with sampled area after cancelling determinant-sign changes of the deepest
  common ancestor of all positive-weight influences in that mesh. Thus a common
  ancestor's negative scale is a whole-mesh reflection, not local inversion.
  Slot transforms are irrelevant to world mesh vertices. No common ancestor:
  compare world signs, without guessing reflection across independent roots.
  Degenerate setup/sample triangles are reported separately; no orientation claim
  is made for them. This detects orientation inversion, not self-intersection,
  tearing, appearance, eye height or artistic quality.
- Fixed limits: at most 512 evaluated times, 256 anchors, 4096 loop points,
  20,000 drawn vertices+triangles+regions+bones+IK constraints and 2,000,000
  (such elements + anchors + loop points) times evaluations. Reject over-limit work instead of silently downsampling.
  Results are stable ordered records; page offset defaults 0, limit 100 (max 500).
  Only the requested page is retained; total and nextOffset expose omitted records.
  Pagination reruns the pure measurement against the same project revision and
  request. No geometry array or cache/token lifetime is needed.

Every record carries kind, entity IDs, time in seconds (null for static validation),
units, observed/threshold and explanatory message. Null observed/threshold means
non-numeric structural validation, never zero. Reports include project/revision,
policy and sampling counts. Passing samples are not a proof about unsampled times,
continuous extrema, rendering or artistic intent. Loop checks run only for an
animation authored with loop:true; intentional boundary stops require caller/brief
interpretation, not relaxed thresholds.

`valid` reports structural project validity; `passed` is true only when the entire
requested measurement has zero diagnostics (regardless of page offset). A failed
Result or `passed:false` never means the project passed. Model validation itself
uses the existing core boundary; motion work limits apply after that validation.

Example (#19 may expose these typed data requests with transport schemas):

```ts
import { validate_project, measure_motion } from './diagnostics';
validate_project(candidateProject, { offset: 0, limit: 100 });
measure_motion(project, {
  animationId: 'idle',
  anchors: [{ id: 'planted', point: { kind: 'ik', constraintId: 'leg' },
    target: [120, -100], start: 0, end: 2 }],
  loopPoints: [{ kind: 'vertex', slotId: 'scarf-slot', vertex: 0 }],
  offset: 0, limit: 100,
});
```

Point references support a bone-local `[x,y]` offset (default origin), a drawn
mesh vertex identified by slot and zero-based vertex index, or an IK endpoint.
Records disambiguate vertices/triangles by zero-based index. Weight diagnostics
include a JSON pointer; for sum failures observed is `abs(sum-1)` and threshold
is 1e-5. Reports contain no input geometry; sampling.times lists measured base
times, while evaluationCount includes setup and finite-difference helper poses.

## Composition targets (#74)

`measure_motion` also accepts `{target:{kind:'composition',compositionId},...}`.
Canonical reports carry `sampling.target` and normalized `sampledTimes`; findings
include sampledTime alongside the requested diagnostic time. Composed poses pass
through the same final geometry/IK residual checks. The fixed grid also includes
composition fade/transition boundaries. This remains sampled evidence, not bounds.
Loop seam comparison inspects authored end before target wrap and is explicitly
labeled in `sampling.boundaryPolicy`; source clocks retain their own rules. Legacy
animation requests and their authored-end diagnostics remain supported.
