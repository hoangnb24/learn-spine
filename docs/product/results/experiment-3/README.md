# Gate 3 — threshold met,7/9 independently accepted

Exactly nine fresh subjects were attempted. Robot1 failed on the browser/session environment before a native invocation and stays in the denominator. Robot2–3 and all three wave runs have independent acceptance. Scarf2–3 are independently accepted. Scarf1 fails acceptance because public observation/outside-native-action evidence is incomplete; this does not establish project failure or rescue. No replacement runs or solution repairs were made.

| Run | Budget calls (native + discovery) | Seconds | Result |
| --- | ---: | ---: | --- |
| [robot-1](runs/robot-1/README.md) | 0 + 0 | ~259, controller only | Failed environment; native stop absent |
| [robot-2](runs/robot-2/README.md) | 64 + 1 | 219.5683 | Independently accepted |
| [robot-3](runs/robot-3/README.md) | 65 + 1 | 249.3876 | Independently accepted |
| [wave-1](runs/wave-1/README.md) | 68 + 1 | 211.9505 | Independently accepted |
| [wave-2](runs/wave-2/README.md) | 66 + 1 | 239.8279 | Independently accepted; intermediate crop retained |
| [wave-3](runs/wave-3/README.md) | 75 + 1 | 251.5980 | Independently accepted |
| [scarf-1](runs/scarf-1/README.md) | observed57 + 1; total unknown | 193.3775 | Failed: missing public evidence |
| [scarf-2](runs/scarf-2/README.md) | 60 + 1 | 231.8685 | Independently accepted; pose viewport crop retained |
| [scarf-3](runs/scarf-3/README.md) | 56 + 1 | 246.0763 | Independently accepted; manual count discrepancy audited |

Threshold remains at least2/3 per brief, every per-run criterion required, <=900s and <=100 calls. Independent results are robot2/3, wave3/3 and scarf2/3:7/9 accepted, meeting the gate threshold. This is feasibility evidence, not statistical reliability, MVP readiness, native cancellation, or a performance claim.

## Locked experiment and provenance

Accepted production base: `538f939d9c76e29a55bc7680f8e36943095e4326`. Frozen harness/protocol/preparer commit: `57eed3122782fe1c8b2d5eb536bc1e27a4ebc360`. All production and platform experiment files remain unchanged from that lock throughout the nine runs; subsequent additions are docs/evidence and read-only QA consumers.

[Protocol](../../../../platform/tests/agent-evals/PROTOCOL.md), [exact prompts](../../../../platform/tests/agent-evals/prompts/), [initial ZIP hashes](../../../../platform/tests/agent-evals/initial/hashes.json). Each brief uses the same initial ZIP/hash, with nine different subjects. Setup author, subjects and independent reviewer are separate. Root verified model `gpt-6-astra`, effort `medium`. Deeper provider version, token totals and cost are unavailable; no estimates substituted. Environment: macOS arm64, Node22.22.3, Codex In-app Browser, actual document.modelContext WebMCP. Per-load UA and initial hash are in raw setup events. Post-run browser QA used Chromium153.0.8010.12 separately from subject sessions.

Robot1 exposed lost browser bindings across a completed preflight turn and service lifetime gaps. [Amendment1](lifecycle-amendment.md) and [amendment2](lifecycle-amendment-2.md) were recorded before remaining runs: active-turn participant bootstrap, own isolated browser page and timer Start, root-owned services. They do not change brief, solution, budget or threshold. Robot1 has only setup/start plus a later setup event, with no native stop or ZIP; the controller's approximate end is separately labeled. [Late setup note](runs/robot-1/late-setup-note.json).

For successful exports, timers run continuously from Start through Stop, including brief delivery and fixed interruption. Root's clock-after-send values are upper bounds, not invented exact delivery timestamps. Every run gets the exact checkpoint interruption from protocol; no rescue was verified for accepted runs; scarf1 complete rescue status is unknown. Raw call starts/completions count failed requests, retries, polling, artifact reads and saves. Discovery is reconciled with public transcript/root provenance. DOM observation and image presentation are not product calls. QA takes place after run Stop and cannot alter final ZIPs. Earlier QA overlap is recorded per run; no performance inference is made.

## Evidence and limitations that affect acceptance

All eight emitted ZIPs reopen through real Editor and Player file inputs. Complete Project data and all PNG hashes match Stop. Reopen folders retain both app snapshots, sampled UI images and actual canvas playback recordings with at least three wraps per animation. [QA implementation](qa/README.md) consumes emitted results only. Author image sampling does not replace independent visual judgment; earlier reviewer decisions sampled images/playback records and did not directly watch WebM.

Robot2–3 contain15 assembled art pieces, 2s idle and4s greeting/return. Wave runs preserve4s duration and slow the forearm from2 oscillations to1 (peak interval1.2→2.4s). The frozen wave preservation check incorrectly reports false because it compares JSON property insertion order. Its original output is retained. A separate read-only structural comparison ignores object key order only and preserves array/channel/key/curve ordering outside the three allowed rotation channels and revision. Independent reviewer accepted this comparison; no rubric or frozen scorer was rewritten. Wave2's intermediate native pose clips the antenna (122 outside geometry points per animation in that viewport), while its later native preview and Player fit show the full art. That recorded limitation remains.

All scarf runs preserve rig, topology and non-anchor weights, fix ten neck weights, pass frozen structural/diagnostic checks, and have a0.25s projected tip delay. Mid/tip amplitudes are14/20,20/24,14/18px. Initial diagnostics620 become0; retry, stale rejection, atomic failure and checkpoint restoration checks pass. Scarf2 has35 outside geometry points across sampled cycle times in the render_pose input viewport only. ObservationService.preview fits the continuous envelope; reviewer inspected0065/0068/0083 read_artifact images showing the full scarf, and the reopened Player fit is intact. This does not claim an independent geometry measurement of the full preview sequence. Scarf1 public transcript ends after early inspect_project with no pagination cursor; the native raw log is complete, but subsequent outside-native actions cannot be fully confirmed from that transcript. Root's received final self-report is separate provenance, not a replacement transcript. Its observed57 native +1 discovery and193.3775s remain recorded, but complete budget and rescue status are UNKNOWN; missing evidence makes this run fail acceptance. Scarf3's subject manual59 total differs from audited57: public code and raw log show56 product calls plus1 discovery; failed image emission happened after two successful native calls, and re-emitting the stored image added none. Both counts and failed host items remain recorded.

Each run directory contains raw input/result events, extracted ZIP/PNG outputs, public transcript excluding reasoning, controller timing, audit and reopen reports where available. No private reasoning is included or used to fill missing public evidence. Native raw results are authoritative because the app transcript tool omits native output bodies.

## Validation

[Typecheck](final-typecheck.log) passed. [Tests](final-tests.log):163 passed,1 skipped (per-run scoring requires GATE3_RUN and was run separately for each exported run). [Build](final-build.log) passed with the existing bundle-size warning. Per-run frozen scores, supplemental preservation where needed, geometry, transactions, ZIP/hash checks and playback reports are retained in each run folder. Independent acceptance is recorded separately per run. Final documentation corrections await reviewer confirmation before merge.
