# Composition editor #75

Implementation and browser evidence; independent acceptance remains with the
reviewer/orchestrator. Native exploratory calls are explicitly separated below.
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
  198 unit tests pass, one pre-existing skipped test; all 24 browser tests pass.
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
revision/target/.5 and visible robot geometry. Native final frozen-head evidence
will be linked after the runtime freeze. Browser bridge calls are never relabeled
native, and an unavailable native host would remain unverified.

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
