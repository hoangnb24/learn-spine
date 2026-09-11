# Gate 2 protocol, locked before first measurement

2026-09-11. Base accepted main 016ba56fde8310848e062b75ed016fd5771a8c4a.
This document is committed before authoring/measurement. Changes to fixture rigs
are allowed through commands with a revision and retained run history; thresholds,
brief and measured regions must not be changed to fit a result.

Three 2-second smooth periodic fixtures, no intentional boundary stop. Canonical
reference is setup (no animation); time zero is not necessarily setup for the
phase-delayed scarf. Public Session commands author every bone/mesh/weight/IK/key
from a new empty v1 project. Prepared asset tokens only supply validated PNG bytes.
No whole pre-authored project is loaded to bypass commands. Browser bridge use is
labelled bridge, never native WebMCP. Sources/hashes/rights are manifest.json T01.

- Scarf: scarf-tail.png, 153.6 x 57.6 logical pixels, left edge at neck, rest
  tilt -20 degrees. 17 columns x 5 rows (row-major vertices, vertex=y*17+x).
  First two columns (x indices 0,1, every row) rigid to neck root; named anchors
  scarf-neck-0..9. Mid rises/falls 7 px, tip 12 px with quarter-of-a-quarter-cycle
  delay (0.25 s), 2 s cycle. Smooth motion must read as a delayed soft wave without
  root drift, tears, sharp creases or clipping. Pose comparison: T01 scarf anchor
  reference and lesson 86 delayed idle; comparison by intent, not Spine pixels.
- Jelly: jelly.png, 300 x 300 logical pixels, x=(u-.5)*300,
  y=(.855-v)*300. UV x columns [0,.16,.30,.37,.44,.50,.56,.63,.70,.84,1];
  UV y rows [0,.14,.25,.35,.37,.46,.50,.60,.70,.80,.84,.86,1].
  Row-major IDs y*11+x. Bottom rows 10,11,12 (all columns) fixed to base root,
  anchors jelly-base-110..142. They bracket visible bottom at v≈.855, not alpha>0.
  Face band rows 3..6 moves rigidly in y (20 px amplitude), with unchanged x;
  top shifts 35 px, lower transition blends to zero at row10. Upper/lower body
  widens on compression and narrows on stretch; preserve readable face and smooth
  base transition. Both eye ROI source rectangles are fixed BEFORE sampling:
  left [474,466,542,576], right [715,466,783,576] in 1254-square PNG coordinates.
  Measure four UV corners mapped barycentrically into evaluated mesh; max vertical
  height change from setup <=5%. Supplement with real rendered eye/face review.
  Compare T01 face-fixed-compress/base-blend-compress and lessons94–96 by intent.
- IK: T01 robot thigh-left/shin-left/foot-left PNGs, two 100 px bones, full mix,
  target [120,-100] fixed, hip y varies 0..-30..0 with smooth easing over2s.
  Stance is entire [0,2]. Final endpoint and foot origin must remain <=.5px from
  target; all targets reachable (distance <=200 and >=0). Foot art is a region;
  ground contact and bending must remain coherent, no sudden knee reversal.

All weights nonnegative, valid bone IDs, abs(sum-1)<=1e-5. Canonical #18 diagnostics
on entire drawn geometry: 60 uniform intervals inclusive endpoints plus every key
and t±h; loop position<=.5px; vector velocity seam<=max(.5px/s,5% sampled peak).
No loop point omissions. Anchors <=.5px. Smooth sine channels use quarter-period
Hermite Bezier segments (x controls1/3,2/3); include all channel extrema and delayed
extrema. This is finite sampling, not a general continuous proof. No unexpected
triangle flips/degeneracy; shared UV topology and rendered output must show no
tearing/overlap seam. Retain raw sampled geometry and diagnostics.

Playback: actual Editor and isolated Player for >=3 cycles; save recorded playback
and review extrema/cycle seam. Twenty deterministic shuffled seek times from the
recorded forward-playback first cycle, compare drawn canonical geometry<=1e-5.
PNG sequence at>=60 uniform samples/cycle plus extrema. Export ZIP, close editor,
reopen ZIP, independent player equal Project/poses. Full/half-resolution replacement
through putAsset with validated token preserves semantic geometry/rig/animation
(except asset metadata/revision) and evaluated XY. Save both packages and PNGs.

Performance: same Gate1 host family, Chromium/SwiftShader, Vite dev,1280x720,5s
warmup and30s measurement. Record rAF intervals, actual draw intervals and draw CPU
submission separately, overhead/capture outside measurement. No new performance
pass threshold; physical presentation unavailable. Physics NOT TESTED, no solver.
Rubric required: readable coherent art; deliberate squash/stretch/delay; stable
anchors/contact; smooth extrema/seam; no tearing/triangle flips/crop or missing art.
Author records findings; independent reviewer decides acceptance on exact PR head.
