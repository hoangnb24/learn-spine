# Gate 1 brief and locked rubric

Locked before measurements on 2026-09-11. Source base f2cd5d5. One T01 robot, all 15 original PNG assets, source placement and draw order from fixtures/source/robot-layout.json; source rights and hashes remain governed by fixtures/source/manifest.json (internal evaluation only).

Idle: two-second looping gentle head tilt and alternating arm sway; legs/body stay at setup, feet stationary, no mesh or IK. Wave: four-second loop, right arm raises, forearm/hand waves twice, arm returns; left arm and legs stay at setup. Smooth eased rests at the seam are intentional. Agent may correct a visibly overextended wave after observing it; log both revisions. Rig, attachments and animation must be created through commands; seed contains only art and root.

Mandatory numeric checks: 12 fixed times per animation t=i*duration/12, i=0..11; all bone and region world matrix components differ editor/player <=1e-5. Reopened JSON and bytes identical to exported bundle, player has no editor state/source asset network requests. Undo/redo restores complete batch contents ignoring monotonic revision; invalid batch and invalid ZIP leave project unchanged.

Visual review: review actual PNGs at those times and actual playback for >=3 full loops per animation. All 15 parts present, no clipping at extremes, stable camera, connected joints, recognisable gentle idle/two waves, no unexpected jump at seam. Record visual judgement separately from numerical checks.

Performance, fixed before run: real editor and player playback at 1280x720 CSS and backing canvas pixels, DPR1. Warm up 5s then record 30s, without screenshot capture. Record renderer synchronous CPU draw submission work separately from animation frame intervals and actual changed-stage update intervals. p95 frame <=16.7ms is mandatory; passing draw submission alone cannot pass gate. Browser rAF timestamps are scheduling proxies, not proof of physical display presentation/GPU completion; report this limitation and any unavailable presentation metric. Capture overhead is a separate timed 12-PNG observation run at same canvas dimensions. Retain all raw samples and browser/OS/GPU/hardware. Never round values to turn a fail into pass. If gate fails, stop #15/#16 and request product direction; no lowered threshold.

No Spine baseline (Trial export limitation); no speedup claim. Native agent calls, automated bridge regression and UI observations are classified separately. This is Gate1, not the repeated 3-run/budget Gate3 benchmark.
