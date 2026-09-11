# Gate 3 — preparation, no subject results yet

Accepted production base `538f939d9c76e29a55bc7680f8e36943095e4326`.
The [locked protocol](../../../../platform/tests/agent-evals/PROTOCOL.md) and
[exact prompts](../../../../platform/tests/agent-evals/prompts/) are committed before
runs. Initial ZIP hashes are in [hashes.json](../../../../platform/tests/agent-evals/initial/hashes.json).
No native smoke test or scripted setup is counted among the nine subjects.

Setup: Node 22.22.3, macOS arm64, Codex In-app Browser UA in setup events.
Actual browser opened all three starting ZIPs through production Storage unpack +
EditorRuntime.openBundle. All registered document native tools. On setup-wave actual
fetchTools/get_capabilities returned webmcp-document and revision 0. The first
immediate post-reload discovery was too early and returned unavailable; after page
readiness, rediscovery succeeded. This is retained setup history, not a subject run.

[Typecheck](setup-typecheck.log) and [locked-input test](setup-test.log) passed.
Test checks deterministic ZIP/hash/PNG hash/model/seed state; real browser setup
additionally performs actual PNG decode. No production code changed.

## Root handoff

1. Services running: Vite 4210, append-only collector 4211. Do not change code during
   subject runs (Vite HMR would invalidate clean state).
2. Spawn fresh subject with only exact prompts/preflight.md. Subject says READY
   after browser bootstrap only; no tab/project/brief/schema access yet.
3. Root creates fresh tab URL from protocol, observes header webmcp-document,
   checks `runs/<run>/events.jsonl` setup hash against initial/hashes.json; no native
   calls on the subject page before timer. Subjects may inherit browser connection
   globally but must obtain their own tab handle by ID.
4. Root clicks Bắt đầu lượt and sends prompts/common.md + one of robot.md, wave.md,
   scarf.md plus tab ID and URL. No preparer or answers. Delivery latency counts.
5. On PAUSE_READY, send exact interruption line from protocol; record time and
   subject messages in durable transcript. Wait max 60 s at a time, observe call
   count and elapsed wall clock without project mutation. Interrupt at limits.
6. Subject/root clicks Kết thúc lượt; all logs already append on disk. Preserve tab
   for observation/export only. `python3 platform/tests/agent-evals/export.py <run>`
   extracts ZIPs/PNGs and provisional summary. Root saves actual subject transcript,
   including discovery/tool calls, timing, interruption, UI actions and final text.
7. Author performs independent post-run reopen/data/media scoring from emitted
   ZIP; no fixes. Reviewer judges visual rubric separately. No extra clean runs.

Browser native minimal bootstrap after reading Browser skill and full documentation:
`const tab = await browser.tabs.get(rootProvidedTabId);`
`const native = await (await tab.capabilities.get('webmcp')).fetchTools();`
Print `native.description()` if schemas not in notifications, then actual
`native.call(name,input)`. No bridge invocation. Each discovery counts one.

No statistical reliability, native cancellation, performance or MVP claim.

Prelaunch independent review found and corrected pending-call accounting and made
scarf phase/region visual scoring explicit. A final accounting correction counts
prestart at invocation start, not completion. `score.test.ts` is a read-only post-run
consumer: use `GATE3_RUN=wave-1 npm test --prefix platform -- tests/agent-evals/score.test.ts`
after export. It leaves visual and actual browser reopen pending; it cannot award
Gate 3 by itself. No subject has started at this lock update.
