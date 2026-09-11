# Post-run audit tools

`reopen.mjs` is prepared for use **after** a participant has stopped and saved a ZIP.
It opens that ZIP through real Editor and Player file inputs in separate headless
contexts, copies successful renderer preparation/draw data read-only, compares
Project and asset hashes with the instrumented stop, samples poses/screenshots and
records three-loop canvas playback. It does not edit the exported project or connect
to the participant browser. This is post-run QA, never subject/native evidence.

Run from repository root, after `export.py` extraction:

```sh
node docs/product/results/experiment-3/qa/reopen.mjs robot-2 <saved-project-filename>
```

This script was prepared while robot-2 was active but has not yet run. Any test
failure is retained and fixed only in the QA consumer where appropriate; production
or subject artifacts are not repaired. Screenshot/playback review remains separate.

Public transcript audit: use app `read_thread` with participant session id after
completion, includeOutputs true, and a large per-item character limit. Persist only
public message/command/mcpToolCall/collab metadata types; discard reasoning items
before writing. Inspect pagination and truncation flags. Count actual fetchTools
calls and any host failures before dispatch, reconcile native product starts by
name/input with raw collector. App output may omit collaboration message bodies;
root's controller records remain the source for fixed feedback and delivery timing.
No private reasoning/history is an evidence source.
