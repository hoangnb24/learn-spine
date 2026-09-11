# Issue 13 evidence

11 September 2026. Native invocation code: **9a25e873d7948afda76d0b4d3db48c83d20bf668**. Combined regression after merging #12/main: **690af9ecdb611d3e6213195eb14f70438445764f**; that merge did not change adapter/harness code. Documentation/evidence commits following those SHAs do not change behavior.

Environment: macOS 26.4 (25E246), arm64; Node v22.22.3, npm 10.9.8. Native agent: Codex desktop with Browser skill; In-app Browser user-agent `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36`. Loopback Vite http://127.0.0.1:4183, no flags/extensions/tokens changed. Real Pixi WebGL + T01 robot PNGs. Automated media test uses installed Playwright Chromium, explicitly bridge-only.

## Actual results

- [native-session.json](native-session.json): actual `fetchTools` / `tools.call` outputs, including PNG image blocks; UI snapshot; zero tools after disconnect. Source SHA recorded in file.
- [native-pose.png](native-pose.png): exact image block bytes delivered from render_pose, revision 2, idle at 0.5 seconds. Robot visible with whole body and limbs; this simple pose is not a full animation rubric.
- [ui-revision-2.png](ui-revision-2.png): actual harness UI shows Session 1 / Revision 2 / root x25 / one animation and received observation revision 2. UI uses fit camera, observation uses explicitly requested camera, so screen sizes differ.
- [verification.log](verification.log): exact full SHA, versions, commands and combined results. No hand-entered pass substituted for tool output.

| Check | Actual result / classification |
| --- | --- |
| Discovery | 24 tools; native-pass |
| Rig write/retry | root x0→25 revision0→1; exact retry stays1; native-pass |
| Stale/schema | REVISION_CONFLICT / INVALID_INPUT; no extra commit; native-pass |
| Animation/image | create_animation→revision2; native render_pose returns image content, PNG viewed by agent; native-pass |
| Job media | export_frames three times→succeeded, source revision2; read_artifact PNG image + downloadable ZIP metadata; native-pass |
| Save | Storage.pack ZIP URL 663,898 bytes revision2; native call pass. Separate automated test fetches ZIP and unpacks all15assets and revision2 |
| Cancellation | queued→cancelled, running→cancelled, succeeded unchanged; app-owned native calls pass. No transport AbortSignal claim |
| Resource rejection | 100×1024×1024 RGBA exceeds observation budget, LIMIT_EXCEEDED; native-pass |
| User/agent share | UI edit x25→35 revision3, agent inspect sees it, undo→revision4; native-pass |
| Reopen | Session2 revision0; old identity REVISION_CONFLICT; old job JOB_NOT_FOUND; native-pass |
| Reload/lifecycle | Rediscovered24 tools after reload; Disconnect registration AbortController→zero tools; native-pass |
| Unit/real browser | 9 adapter unit cases; media integration validates decoded320×320PNG, snapshot revision1 despite live2, ZIP signature and reopening15assets, cancellation and revoked download. See log for complete suite counts |

Initial integration attempt required a correction: repeating all canonical `$defs` in every tool exceeded the host's configuration budget and disabled discovery. The committed adapter includes only referenced definitions, and discovery then succeeded. Another initial detector required `unregisterTool`; current document API instead uses registerTool's AbortSignal. Both are fixed in the tested code. These failed development attempts are not labelled unavailable acceptance or hidden behind bridge calls.

## Reproduce

From `platform/`:

```sh
npm ci --ignore-scripts
npm run typecheck
npm test
npm run build
npm run test:browser
npx playwright test -c adapters.playwright.config.ts
npm run dev -- --port 4183 --strictPort
```

Open `/tests/adapters/browser/index.html` in the Browser skill's supported native host. Follow that skill's setup and select this tab; get `webmcp = await tab.capabilities.get('webmcp')`, `tools = await webmcp.fetchTools()`, inspect `tools.description()`. Use [native-recipe.mjs](native-recipe.mjs) as the reproducible sequence (pass the actual discovered tools handle). Tools are local project mutations/observations. Save the returned call transcript and PNG block; compare UI revision using DOM snapshot/screenshot. Do not call handlers through evaluate and label that native.

If tools are unsupported or inaccessible, record native-blocked-with-fallback and run the in-page bridge test separately. Do not infer native support from registration text or a Chromium version. Download URLs in the transcript are intentionally ephemeral. The PNG and scripts above are durable; to preserve ZIP downloads, use the harness links before reopen/disconnect.

## Limits

This is adapter acceptance, not editor integration or Gate 1/3. No repeated broad task-quality benchmark, performance claim or full Spine parity. Native execution AbortSignal remains unavailable; direct render_pose/save use host/bridge signal and session teardown, while `cancel_job` is observation-only. The native test saw running state before cancellation but progress was still0, so it proves cancellation during preparation, not after an encoded frame; lower-level Observation tests cover later race points. The browser media test confirms actual archive decoding/reopening; native save evidence confirms delivery of the downloadable reference, not a separate browser-file download. Navigator transport and other browsers are untested.
