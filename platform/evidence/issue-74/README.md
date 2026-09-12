# Issue 74 — composition tools and observation evidence

Runtime under test: **`3c60149781754e1e7aad5de276037b90810be237`**. Subsequent evidence
commits retain that runtime source. PR [#80](https://github.com/hoangnb24/learn-spine/pull/80),
related [#74](https://github.com/hoangnb24/learn-spine/issues/74); implementation
consumes accepted core #73 / PR #77 and compatibility fix #78. Independent review
and exact final-head CI remain the integration gate; this evidence is not self-acceptance.

[View collected native PNG sequences](viewer.html) ·
[public tool examples / #75 handoff](../../src/adapters/webmcp/COMPOSITION.md) ·
[conservative bounds proof and limits](BOUNDS.md).

## Results and classification

| Path | Actual result | Durable evidence |
| --- | --- | --- |
| Actual native WebMCP, final run | PASS scenario: 49 calls, including four intended error controls; 18 PNG image blocks | [Raw native envelopes](native-final-3c601497/raw-calls.json), image-0.png through image-17.png, browser-playback.png |
| Independent reviewer probes through actual native caller | PASS five calls: frozen source edit changes body Y 290→270, undo restores 290 at revisions 3→4→5 | [Raw probes](native-final-3c601497/reviewer-frozen-source-probes.json) |
| Actual native exploratory run before freeze | 46 calls reached expected composition workflows, then cancellation preview setup hit existing 256 MiB RGBA quota. This run is not called a full pass | [Original failure and raw calls](native-exploratory/raw-calls.json), 17 PNGs and browser-view.png |
| Browser bridge with real Pixi/PNG/ZIP | PASS same public scenario under explicit `expectedTransport:'bridge'`; 18 PNGs, two eight-frame ZIPs, playback and renderer metadata/stale check | [Bridge log](browser-bridge/browser-bridge-log.json), [motion ZIP](browser-bridge/sequence-0.zip), [frozen ZIP](browser-bridge/sequence-1.zip), composition-browser.png |
| Unit / mocked failure paths | 198 passed, one existing skipped | [Full local command output](validation-full.txt); tests under adapters/observation/diagnostics/composition |
| Platform typecheck / build / default browser suite | Passed; 20 browser tests, including legacy editor/player/mesh/deform/IK/storage paths | validation-full.txt; build retains the existing >500 KiB chunk warning, not a performance claim |
| Separate contract consumers | Typecheck and all five contract tests passed | `npm run typecheck && npm test` in docs/product/contracts; compatibility remains in default CI |
| Independent bytes/provenance audit | 49 native calls/18 PNG block matches, 16 bridge ZIP/PNG matches, CRC and target/revision assertions passed | [Verification script](verify-evidence.py) |

## Native environment and invocation

12 September 2026, macOS; Node v22.22.3. Root/orchestrator executed the actual
native run in the in-app browser host (browser id 2), while the implementation
agent's browser discovery exposed only Chrome. This is explicitly recorded rather
than substituting an in-page dispatch for native acceptance.

The visible harness reported `webmcp-document` and user agent
`Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36`.
Five additional reviewer-requested native probes separately confirm that editing the
frozen source updates the composed result at a new revision and undo restores it.
They are retained in reviewer-frozen-source-probes.json and are not folded into the
49-call scenario count.

Final run timestamps are retained in raw-calls.json:
`2026-09-12T10:05:52.482Z` through `2026-09-12T10:05:53.498Z`.
The run used a fresh/reloaded harness and newly fetched native tools:

```js
const tab = await browser.tabs.new();
await tab.goto('http://127.0.0.1:5178/tests/composition/browser/index.html');
const native = await tab.capabilities.get('webmcp');
const callset = await native.fetchTools();
const raw = await callset.call(name, input);
const result = JSON.parse(raw.content.find(c => c.type === 'text').text);
```

The complete public operation sequence and assertions are in
[native-scenario.mjs](native-scenario.mjs), invoked through that native caller.
Raw MCP text/image envelopes are preserved. Registration, DOM callbacks and
`WebMCPBridge.dispatch` alone are not native-pass evidence.

The harness imports existing robot PNGs into its initial revision-zero Session.
All animation/composition authorship goes through the public `apply_batch` or
`put_composition`/source tools. One atomic batch migrates v0→v1 and authors
walk/wave/stop and compositions; additive travel +100 +100 produces root x=200.
The canonical looping request at 2.5 returns sampledTime .5. A revision-1 sequence
remains revision 1 after source edit (revision 2) and undo (revision 3); exact retry
returns its original commit. Stale revision, hybrid target, missing reference and
incomplete frozen coverage are deliberate structured-error controls. Frozen
transition requests, diagnostics, per-PNG provenance, app-owned cancellation,
legacy rendering and canonical setup evaluation all pass final scenario assertions.

The exploratory cancellation input requested 240 640×640 RGBA frames (over quota).
Only the test request changed to 120 320×320 frames (~49 MiB); production limits
were not raised. A native retry during source hot reload encountered stale
registration and was not counted as a pass. The final run fetched a fresh tool set.

## Visual/media inspection

The root and reviewer inspected actual PNGs, including the frozen transition
frame image-13: robot pixels remain within the 640×640 canvas (observed bbox
x=167..431, y=28..603), consistent with 24-pixel sequence padding. Direct pose
image-0 uses the requested zoom .7, while sequences fit their continuous envelope;
the resulting size difference is expected. Every native PNG exactly matches its
raw image block, as checked by verify-evidence.py.

Root operated the collected-frame play control and saved browser-playback.png.
The bridge browser test independently checked that playback changes the image and
saves real media. This demonstrates collected-frame viewing, not a measured frame
rate, motion quality gate, or the #75 editor workflow. A screenshot during live
image replacement can contain partial repaint; the retained PNG blocks are the
frame artifacts of record.

Native ZIP artifact creation/read succeeded and returned download URLs. **Native
browser ZIP download was not tested**. The committed ZIP files are from the
separate browser-bridge run and are labeled accordingly; their manifests, CRCs,
frame bytes, target identity, normalized times and revisions are verified with
Python's independent zipfile reader.

## Reproduce

From platform (Node 22.22.3, npm ≥10):

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run test:browser
```

Contract compatibility from docs/product/contracts:

```sh
npm ci --ignore-scripts
npm run typecheck
npm test
```

For native replay, start `npm run dev -- --port 5178 --strictPort`, open the harness
URL above in a native-capable browser, fetch tools after registration, and call
`runNativeScenario` with the actual native caller. Start fresh at revision zero.
The same scenario is reused by the browser test with explicit bridge classification.
Run `python3 platform/evidence/issue-74/verify-evidence.py` from repository root to
check committed media and provenance without running the browser.

## Limits and downstream contract

Bounds can be loose because independent intervals discard correlation, especially
through IK/many ancestors. Finite interval/source-clock/bind/FK/camera overflow
fails explicitly; there is no sampled fallback advertised as continuous coverage.
The [matrix](BOUNDS.md) distinguishes supported composition cases, canonical
unsupported deformation mixing and existing quota/error boundaries.

No event/audio dispatch, nested/reverse refs, root-motion extraction, automatic
stop, editor composition UI, performance or native AbortSignal fix is claimed.
#75 should consume canonical EvaluationTarget/RenderablePose, Session revisions,
PNG frame provenance and target-specific bounds instead of creating another
composition evaluator. #75 owns the full native→editor create/view/edit roundtrip.
