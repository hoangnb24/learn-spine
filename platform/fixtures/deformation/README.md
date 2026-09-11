# Deformation Gate2 fixtures

[LOCK](LOCK.md) precedes measurement; [author.ts](author.ts) constructs all three
fixtures through public commands from an empty new v1 project and validated T01 PNG
imports. It is browser code (crypto, PNG decode, EditorRuntime session); no prebuilt
Project is installed to skip authoring. The runtime's initial empty root is the
only seed. Full command requests/results live in the experiment2 measurements.

[Report and portable PNG packages](../../../docs/product/results/experiment-2/README.md).
Final positive packages are run03/scarf.zip, jelly.zip and ik.zip, with full/half
textures. Use these only after independent Gate2 acceptance; #21 is not part of this
work. Negative controls and prior failed rig versions are explicitly separated.

The test-only Browser harness is `/tests/e2e/deformation/index.html`; run
`npm run dev -- --port 4196 --strictPort`.
Invoke `window.gate2.author('scarf'|'jelly'|'ik')` through automated browser code to
replay the canonical command recipe. This is public command/bridge evidence, not a
native WebMCP invocation. See the report for exact Playwright commands and limits.
