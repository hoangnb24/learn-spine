# Composition editor #75

Runtime freeze: `3cbd7443a9b0869959b35fe29eb2ca0f0c752276` on main
`caff057a99d83e148a7860ae10996e189debdaa0`. [PR #82](https://github.com/hoangnb24/learn-spine/pull/82).
All later evidence commits preserve these runtime bytes. Independent acceptance
remains with the reviewer/orchestrator; exploratory calls are separated below.
No new output requirement, performance/gate pass, event/audio support, generic
stop controller or production-readiness claim.

## Reproduce from clone

Node 22.22.3; from `platform/`:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run test:browser
npm run dev -- --port 5179 --strictPort
```

Open `/index.html`. Import `fixtures/robot/native-project.zip` with **Mở gói**.
Create source animations through public `apply_batch` using the operations exported
by [authoring-inputs.mjs](authoring-inputs.mjs). Add current `sessionId`, `projectId`,
`expectedRevision` and a fresh `requestId` from native `get_capabilities`.
The imported robot is revision 5; always read current scope/revision rather than
hard-coding that example. `nativeComposition()` in the same file supplies a complete
public `put_composition` fixture for native↔UI verification. All source edits and
composition writes go through the existing Session.

UI-only composition workflow after these source inputs:

1. **Tạo phối chuyển động**, name `Đi và vẫy`, duration 2, loop on.
2. **Thêm lớp**, source `Đi bộ`, order 0, overwrite, alpha 1. Select only `body/y`
   and `root/x` in **Thuộc tính của lớp**. Start/fades 0, no end.
3. **Thêm lớp**, source `Vẫy tay`, order 1, alpha .5, mask
   `upper-arm-right/rotation`. Apply. Seek .5: root world X 40, body world Y 290.
   Play/pause, seek .25/.5, observe actual arm and body motion.
4. Change arm layer to additive, order 3, speed 0 and offset .5. Apply/undo/redo.
   Rotation stays at fixed source time while other layers and fades can move.
5. Change source mode to **Giữ một thời điểm**, entry .5; edit fades/end explicitly.
   Save browser, download ZIP, reload/recover, and open ZIP again. Select the same
   composition and .5; data/pose must match before saving.

Frozen transition workflow: nonloop duration 2; a prior walk track masks body/y
and root/x and ends at 1. Add crossfade order 1, start 1, duration .4, outgoing
walk entry .5 and incoming stop offset 0/speed 1, masks body/y + root/x on both.
Apply without incoming masks first: visible missing-coverage error, same revision,
data and undo history. Fill masks and apply. At times 1/1.2/1.4/1.7/2 root X is
40; body Y is 290/294/306/310/310. After completion this authored stop holds; it
does not find or stop arbitrary gait phases. The browser test edits entry time,
undoes, then tries a valid nonempty deform source: visible rejection, no partial
mutation and no hidden key/offset rewriting.

## Actual checks

- [Local validation log](validation-local.txt): platform typecheck/build pass;
  198 unit tests pass, one pre-existing skipped test (`agent-evals/score.test.ts`,
  requires a supplied scoring ZIP); all 24 browser tests pass.
  Contracts typecheck and 5 tests pass. Build's existing >500 KiB chunk warning
  remains; no performance claim.
- [Browser spec](../../tests/browser/composition-editor.spec.ts): real Editor,
  real Pixi canvas, UI create/edit explicit masks/order/alpha/timing and frozen
  crossfade, play/pause/loop/seek, zero speed, atomic coverage/deform errors,
  undo/redo, browser recovery and ZIP reopen. Also dirty-draft protection against
  outside Session edits, paused duration shrink/loop changes, target reset and
  bounds-overflow stale-frame suppression followed by undo recovery.
- [Viewer](viewer.html): durable videos, screenshots, accepted ZIP and numeric
  readbacks. UI setup in tests imports the robot then invokes public Session
  operations for source fixtures. This is browser/Session evidence, **not native**.
- Existing full suite covers legacy region, mesh/deform/IK editor and independent
  Player; generated historical #12/#19 artifacts were restored, not rewritten.

## Native transport and version discipline

`native-exploratory/` was recorded by the orchestrator on the actual in-app browser
`webmcp-document` transport while source was still changing. It demonstrates early
integration, not final-head acceptance. Imported robot revision 5 → native source/
composition batch 6 → UI alpha .5 at 7; native inspection and pose agree with Stage
revision/target/.5 and visible robot geometry. Final proof on the frozen runtime is in
[native-final-3cbd7443/raw-calls.json](native-final-3cbd7443/raw-calls.json): 11 raw
native MCP envelopes plus actual UI steps/DOM snapshots, 2026-09-12 10:32–10:36 UTC,
in-app browser `webmcp-document`. Source/composition batch 5→6; UI alpha .5→7,
read back natively. While UI draft alpha .3 is dirty, native alpha .8/name change
commits 8; draft .3 and warning remain, Apply is disabled. Explicit reload loads
.8; UI .5→9, undo→10 restores .8, redo→11 restores .5. Stage playback times change
.7168→.2334 across the target loop. Browser save/reload/recover then same target at
.5 gives revision 11 and exact same bones/regions/meshes as revision 7, read via
native `evaluate_pose`. Native `render_pose` also returns a revision-11 PNG.

- [UI edit](native-final-3cbd7443/01-ui-edit.jpg),
  [dirty/native conflict](native-final-3cbd7443/02-dirty-native-conflict.jpg),
  [playback A](native-final-3cbd7443/03-playback-a.jpg),
  [playback B](native-final-3cbd7443/04-playback-b.jpg),
  [reopened UI](native-final-3cbd7443/05-reopened.jpg),
  [native PNG](native-final-3cbd7443/06-native-observation.png).
- Native final uses the four-track public fixture from #74 (root X 200 from two
  additive tracks), not the two-track browser authoring fixture above (root X 40).
  Their expected geometry is kept distinct in logs and the verifier.
- Source-freeze CI: [push SUCCESS](https://github.com/hoangnb24/learn-spine/actions/runs/34688722321),
  [PR SUCCESS](https://github.com/hoangnb24/learn-spine/actions/runs/34688725228).
- `python3 evidence/issue-75/verify-evidence.py` verifies captured native scope,
  target/time/revision, alpha history, reopen geometry, ZIP data and artifact hashes.
  It audits these records; it does not replay browser/native interactions.

Browser bridge calls are never relabeled native. Native availability was verified
only in this actual host; no cross-host reliability claim follows.

During development, the first concurrency test exposed transient evaluation of a
new composition against the previous prepared bundle. Stage now guards prepared
bundle identity and associates each camera with its bundle/target. The test was
rerun successfully and a bounds-error regression was added. Early cramped inspector
feedback led to a taller composition inspector and compact transport. These are
resolved development findings, not omitted failing gate attempts.

Chrome's extension file chooser on the implementer's browser rejected local file
upload because file-URL access is unavailable. The actual browser tests use their
normal controlled upload path, and native roundtrip runs in the orchestrator's
in-app browser. No extension permissions were changed to manufacture availability.

## Additional reviewer probes and artifact audit

[Reviewer-requested native probes](native-final-3cbd7443/reviewer-probes.json),
7 further actual-native calls on the same frozen runtime: removing the selected
composition commits revision 12 and UI falls back to Idle at 0; undo at 13 restores
exact baseline bone geometry after reselect. A native duration edit 2→.3 while
paused at .5 wraps the UI/Stage/native sampledTime to .2 at revision 14; undo returns
revision 15. [Removed selection](native-final-3cbd7443/07-review-remove-selected.jpg),
[shorter duration](native-final-3cbd7443/08-review-short-duration.jpg).

The first artifact-audit attempt found that in-app browser screenshots had JPEG
bytes under `.png` filenames. They were renamed to `.jpg` without re-encoding;
links and hashes now match. Native observation 06 is the actual PNG image block.
The verifier also avoids Python 3.10-only `zip(strict=...)` so it runs on the host's
Python 3.9. These were evidence-packaging corrections, not runtime changes.
