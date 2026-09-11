# Gate 3 locked protocol — 11 September 2026

Commit this protocol, prompts, preparer and initial ZIP hashes before any subject run.
Accepted production base: 538f939d9c76e29a55bc7680f8e36943095e4326 (Gate 2 merged).
Sole setup/report author differs from nine fresh subjects and independent reviewer.
Subjects inherit root's verified `gpt-6-astra`, effort `medium`; deeper provider build,
tokens and monetary cost unavailable unless runtime supplies them. No guessed prices.
Codex In-app Browser, actual document.modelContext WebMCP; UA recorded on each load.
Same machine and browser throughout. No bridge-only result earns native acceptance.

## Assignment and budget

Exactly robot-1, robot-2, robot-3, wave-1, wave-2, wave-3, scarf-1, scarf-2,
scarf-3, sequential and fresh page/session each. Same initial ZIP for a brief (see
initial/hashes.json). Failures count; no replacement runs or threshold changes.
Each subject receives only preflight prompt, then common + assigned brief prompt.
No source, fixture generation, previous outputs, answers or other agents' transcripts.
Root may read skill/bootstrap before timer but subject must not view target page,
project, tool schemas or brief until start. Root loads fresh page and checks setup
hash, clicks Bắt đầu lượt then sends brief and tab ID immediately. Timer starts at
that click, so delivery delay counts conservatively. Subject preflight binds browser
only, no tab/project inspection. End at Kết thúc lượt after final save; root clicks
if subject exits. Root interrupts at 900 seconds or 100 budget calls. Calls finishing
past budget count and fail. No pause/exemption for model thinking, polling or errors.

Budget calls = every actual public product invocation (including failed requests,
retry, polling, save and media reads) + each fetchTools discovery. A batch is one
call, retaining existing product operation/input limits. Tool description printing,
browser UI observations, screenshots, downloads, skill/bootstrap overhead counted
separately from product calls; subject reports those and root retains transcript.
Page observer cannot see host discovery: root reconciles transcript with server log
and adds discovery count (never assume zero). Browser UI mutations to solve the task,
direct JSON/session/module calls, hidden file edits or manual rescue invalidate the
independence result. UI allowed for observation/playback, downloading and reopening.

## Required workflow and scoring

All per-run criteria below must pass, in <=900 s and <=100 budget calls. At least
2/3 per brief required. Nine runs are feasibility evidence, not reliability statistics.
Missing/unavailable evidence is not a pass. Preserve failure reason and partial ZIP.

Common: actual native discovery and invocation; inspect then author through public
tools; inspect image and playback (three loops, real UI or preview frames); save
final ZIP; independent post-run editor and Player reopen with exact Project/assets
comparison. Post-run QA/review time reported separately, cannot fix project. Subject
may request no creative guidance beyond fixed brief. Any rescue counted separately.

Robot: all 15 source art pieces assembled at supplied placement, idle 2 s loop
with subtle motion, wave 4 s loop with recognisable raised right-arm greeting and
return to rest. Coherent connected body, visible motion, no missing/cropped pieces
or unexpected loop jump. Rig and animation authored by subject from root-only ZIP.

Wave: retain 4 s duration and loop flag; right-arm greeting visibly slower (one
oscillation instead of original two, or measured oscillation interval >=1.5x original
without increasing duration). Only rotation channels of upper-arm-right,
forearm-right and hand-right may change. Every other channel, idle animation,
rig, assets, slots, attachments byte-equivalent structurally. Explicit nonzero body,
head and left-hand channels make preservation meaningful. Compare complete keys,
curves and ordering, not just sampled pose. Exported waveform and visual review
must show a recognisable greeting, not a frozen arm.

Scarf: 2 s looping motion; tip peak delayed 0.20–0.35 s relative to mid, noticeable
nonzero amplitude (mid >=6 and tip >=6 logical pixels peak-to-peak). Existing rig,
art and mesh topology preserved. Entire first two columns (vertex x<=9.6 in bind
positions) form fixed neck, with world positions from setup. All ten anchors drift
<=0.5 logical pixel at 61 uniform samples plus keys. Weights valid and visibly
misassigned influences found and corrected via public tools; no whole-file rescue.
Preserve non-anchor weights and rig. Structural validation, no unexpected flipped
triangles/tearing; seam position <=0.5 px, velocity <=max(0.5 px/s, 5% point peak).
Subject must show initial observed failure then corrective edit then remeasurement.

Transaction scenarios: every run performs exact retry after first successful edit;
then stale expectedRevision with fresh requestId, then atomic batch with a valid
no-op and invalid missing-bone reference. Must observe no revision/content change
on failure and exact retry result. Each subject makes initial checkpoint before
work. After first successful authoring edit + retry/errors, send PAUSE_READY;
root delivers fixed simulated user interruption: “Dừng nhánh thử này. Khôi phục
checkpoint ban đầu, xác nhận trạng thái rồi tiếp tục brief.” Subject restores using
public tool and rechecks, then continues. This is scripted feedback, not rescue.
Root records delivery times. No claim about native AbortSignal; public checkpoint
restoration tests committed work interruption. Async job cancel may be additional,
not required replacement for checkpoint restoration.

## Collector, setup and audit

`prepare.py` deterministic setup only; never run on live sessions. Sources and art
rights from accepted internal fixtures/source/manifest.json. It plants valid semantic
weights error and replaces synchronous scarf keys; it does not write final answers.
`harness.tsx` mounts real Editor/runtime/storage/adapter, loads ZIP before timer, then
only timestamps/copies dispatch inputs/results, revisions, returned media and saved
ZIP bytes to collector. No authoring sequence and no hidden solution endpoint.
`collector.py` append-only localhost log sink. Start/stop snapshots are read-only.
Full image content remains in raw log; export tool decodes durable media. Log failure,
missing setup hash, reload mid-run or pre-start product invocation flagged in audit.
Production bugs are reported to root for separate corrective work, not edited here.

Startup from repository root: `python3 platform/tests/agent-evals/collector.py` and
`npm run dev --prefix platform -- --port 4210 --strictPort`.
URL: http://127.0.0.1:4210/tests/agent-evals/index.html?brief=robot&run=robot-1
(substitute only locked brief/run IDs). Setup checks use run IDs prefixed setup-;
these are explicitly not subjects and cannot enter the nine-run score.

### Measurement implementation locked before subjects

Scarf delay/amplitude: sample canonical evaluate at 1,000 equally spaced times
`t=i*2/1000`, i=0..999. Scalar signal for each of bones mid and tip is world origin
translation dotted with the normalized setup root Y axis (root setup matrix column
[c,d]); subtracting a constant setup offset does not affect peak/lag. Amplitude is
max minus min of that scalar. Peak time is earliest sample attaining its maximum;
delay is `(tipPeakTime-midPeakTime+2)%2`. Accept inclusive [0.20,0.35] seconds and
both amplitudes >=6. This measures intended motion direction despite tilted root,
uses finite sampling at 0.002 s resolution, and does not fit a different phase model
post hoc. Mesh anchor targets are canonical setup Pose vertices for all indices
row*17+col with row=0..4 and col=0,1. Check the 61 uniform samples plus all final key
times using the accepted evaluator/diagnostics, preserving source project.

For robot visual review inspect full silhouette and connection at shoulder/elbow/
wrist/neck/hip/knee/ankle over three loops and extrema screenshots. Region corners
and full art bounds must be inside chosen capture viewport at sampled extrema;
bone-origin diagnostics alone do not establish cropping or connection quality.
Scarf final mesh geometry/triangle diagnostics and images cover surface; bone signal
lag alone does not establish coherent deformation. Independent reviewer records
these visual observations separately from numeric thresholds.

Observer records `tool-start` with invocationId before awaiting every native dispatch;
completion, thrown error or unfinished status are matched by id. Budget uses starts,
including unfinished and after-stop starts. Stop snapshot cannot imply no pending
calls: aggregate flags any unmatched start and calls completed after deadline. Host
failures before dispatch are reconciled from subject transcript and still counted.
