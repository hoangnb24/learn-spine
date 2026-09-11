# WebMCP product adapter — #13

11 September 2026. **Native-pass for actual agent discovery, project edits, PNG delivery and app-owned observation cancellation in the tested Codex In-app Browser (Chrome/152.0.0.0).** This is the independent robot harness, not editor integration or Gate 1/3 completion. #14 connects the entry below to the editor runtime. Evidence and exact commits: [issue-13](../../../platform/evidence/issue-13/README.md).

## Entry and ownership

Public imports are `WebMCPBridge`, `registerWebMCP`, `detectWebMCP`, `toolDefinitions` from `platform/src/adapters/webmcp/index.ts`. Nothing is imported by core/model/commands/evaluator/renderer/storage/observation. The adapter receives the existing Session getter, ObservationService and canonical Storage; it never creates a second project owner. `bridge.dispatch(name, unknown, signal?)` returns canonical `Result<Json>`. Native registration wraps this result in MCP text/image content. The explicit in-page dispatch is labelled `transport: bridge` when native registration is unavailable; it is not a network MCP server or cloud agent service.

For #14, use the merged #12 singleton `editorRuntime` documented in [editor README](../../../platform/apps/editor/README.md):

```ts
const bridge = new WebMCPBridge({
  getSession: () => editorRuntime.session,
  storage: editorRuntime.storage,
  observation, // host-owned ObservationService
  onDownload: ({ url, filename, revision }) => showDownload(url, filename, revision),
});
const unsubscribe = editorRuntime.subscribe(() => bridge.refresh());
const registration = await registerWebMCP(bridge);
// Display registration.error.message if !registration.ok; never label it native-pass.
// On unmount, await registration completion before teardown:
unsubscribe();
if (registration.ok) await registration.value.dispose();
else bridge.dispose();
```

`refresh()` also runs at every dispatch and subscribes to the current Session's invalidations, including `session.open`. The host subscription is required to release resources immediately when its getter changes or becomes null. Async outputs capture the exact Session object and numeric `sessionId`, and are discarded on replacement/reopen/dispose. Core mutation events update the same UI through #12's existing subscription. Bridge cleanup only releases jobs/downloads it owns, leaving other users of ObservationService intact. Host owns disposal of the service itself.

## Tools and input contracts

Every scoped tool requires `sessionId` and `projectId` from `get_capabilities`. Every project mutation additionally requires `expectedRevision` and `requestId`. Standalone JSON Schemas derive canonical entity definitions directly from project-v0, with only referenced `$defs` included. Ajv validates a defensive finite JSON copy before dispatch. Accessors, unknown properties, nonfinite numbers and oversized inputs are rejected; unknown payloads are never cast directly to Batch.

| Tools | Contract |
| --- | --- |
| `get_capabilities` | Actual tool names, transport, active identity/revision, limits, retry and cancellation lifetime |
| `inspect_project`, `list_assets` | Summary or selected collection/IDs; oldest/index-order page, `offset`, `limit` 1–50, `total`, `nextOffset`; animation summaries omit channels |
| `inspect_animation` | Animation channel summaries, or key page selected by both `boneId` and `property`; reconstruct all pages at one revision before writing |
| `apply_batch` | Canonical putBone/putSlot/putRegion/putAnimation/remove/setSlotOrder, one atomic commit |
| `create_bones`, `attach_images` | Complete bones, or regions + slots referencing PNGs already imported in the active bundle |
| `create_animation`, `set_keyframes`, `set_curves` | Put **complete animation**. Caller preserves unrelated channels/keys. These are explicit wrappers over putAnimation, not implicit partial merges |
| `undo`, `redo`, `create_checkpoint`, `restore_checkpoint`, `inspect_history` | Existing Commands history/checkpoint API; paginated listing |
| `render_pose` | Snapshot PNG as actual MCP image block plus source revision, animation/time |
| `render_sequence`, `preview_animation`, `export_frames` | Existing ObservationService jobs with copied snapshot; return job ID, revision and state |
| `get_job_status`, `cancel_job`, `release_job` | Bridge-owned job only; status returns a paginated `items` artifact list when succeeded |
| `read_artifact` | Requires owning `jobId` + `artifactId`; PNG image content up to 8 MiB, browser download link for PNG/ZIP |
| `save_project` | Storage.pack of same-revision snapshot, complete portable ZIP exposed as browser download; does not mark host autosave successful |

There are no mesh/IK/weights tools, external URL asset fetches, PNG upload protocol, autosave/recovery tool or editor UI glue here. The host imports PNGs through its trusted storage boundary; the adapter attaches those existing assets. No frontend LLM key or cloud service is used.

Mutating wrappers translate deterministically to the canonical batch: full entities retain the same retry payload even after later changes. Session owns dedup (1,000 successful requests), history (100 batches per undo/redo) and checkpoints (20). Aliases producing the same canonical batch have the same Session request identity. Exact retry returns the original commit revision, which can be older than current UI state. Errors carry core codes and revision when available. A stale revision requires reread/replan; a reopened session requires new capabilities/identity. Reload starts a new lifetime; do not replay old request IDs into a reloaded document.

Limits: input JSON 1 MiB; inspect/history JSON payload 256 KiB UTF-8; inspect pages ≤50; sequences/preview ≤300 frames and existing observation budgets; inline PNG ≤8 MiB. Request smaller pages if a response exceeds the JSON budget. Download URLs retain at most 20 files / 256 MiB and are revoked on session change/dispose. URLs are browser-local, not durable or remotely fetchable; download the ZIP before reload. The native media result carries image bytes as an image block rather than stringifying a Uint8Array.

## Lifecycle and cancellation

Feature detection prefers document.modelContext.registerTool, then navigator.modelContext.registerTool. The [current document API](https://developer.chrome.com/docs/ai/webmcp/imperative-api#unregister-tools) removes registration through the AbortSignal passed to registerTool. The tested host has no unregisterTool method; adapter also calls that method when an older navigator implementation provides it. Partial registration is rolled back. The actual test confirmed 24 tools before disconnect and zero after aborting the registration controller.

This **registration** AbortSignal result does not fix the **execution** AbortSignal limitation measured in [#3](webmcp.md). The actual native tool-call API still offers no agent transport cancellation. Use `cancel_job(jobId)` for observation jobs: queued/running becomes cancelled, terminal states remain unchanged, cancelled work publishes no partial artifacts. Native tests cover queued, running and after-completion calls. Jobs lost by release/eviction/reopen/reload return JOB_NOT_FOUND; invalid animation/quota inputs return structured failures before admission.

Synchronous writes check supplied cancellation immediately before dispatch; once committed, use inspect/undo. Direct `render_pose` and `save_project` await canonical services (at most two direct calls per bridge); they accept bridge/host AbortSignal and are aborted/discarded on session teardown. They are not observation jobs and cannot be stopped with `cancel_job`. Native transport cancellation of those direct requests is not advertised. Use a one-frame sequence when an explicitly cancellable render is required.

## Reproduction and downstream

The independent harness is `platform/tests/adapters/browser/index.html`; it loads the existing T01 robot fixture, prepares PNGs with real validateBundle, creates one Session and renders that Session. Its user-edit button and registered tool callbacks share the same owner. It records callback metadata and displays the received PNG plus source revision; this does not itself prove native invocation, so a separate agent call transcript is committed.

Run commands and native recipe from the [evidence README](../../../platform/evidence/issue-13/README.md). Automated tests isolate transport/command cases with explicitly labelled fixtures and separately run real browser renderer/storage media tests. The tested browser path is agent → tab capability webmcp → fetchTools → tools.call → registered callback. No inspector/evaluate handler call is counted as native-pass. #14 owns full editor integration and Gate 1; #21 must run the broader repeated agent Gate 3 experiment. Navigator fallback and other browser/agent combinations remain untested.
