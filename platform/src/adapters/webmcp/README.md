# WebMCP authoring and diagnostics (#19)

The existing transport exposes 28 tools. `apply_batch` accepts the version 1
operations documented in [commands](../../commands/README.md), including explicit
migration, complete meshes/IK/deform animations and selected vertex weights.
There is no second mutable model or separate mesh session. `sessionId`, projectId,
expectedRevision and requestId retain their existing conflict/retry semantics.

`get_capabilities.features` describes supported runtime workflows; inspect summary
returns the project's formatVersion and requiredCapabilities separately. Mesh/IK
capabilities are discoverable even when the active project is v0. `diagnostics-v1`
is advertised by the adapter because it actually dispatches to diagnostics APIs.

Read tools omit large geometry by default:

- `inspect_project`: mesh summaries (IDs, asset, vertex/triangle/bind counts),
  animation summaries without channels/deforms, optional `ikConstraints` collection.
- `inspect_mesh { attachmentId, section: 'vertices'|'triangles'|'bindPose', offset?,
  limit? }`: vertex pages include stable zero-based index, bind-world position,
  normalized UV and weights; triangle indices and bind matrices have separate pages.
- `inspect_deforms { animationId, attachmentId?, keyTime?, offset?, limit? }`: channel
  counts without attachmentId, key summaries (time/curve/vertexCount) with it. Add
  keyTime for a page of `{vertex, offset:[x,y]}`. Large keys remain readable without
  sending the entire offsets array. Use `setVertexDeforms` to edit them locally.
- `validate_project { offset?, limit? }` and `measure_motion { animationId,
  anchors?, loopPoints?, offset?, limit? }`: consume the current snapshot, with the
  fixed policy from [diagnostics](../../diagnostics/README.md). Anchors require an
  explicit point and world target. `valid` means structural validity; `passed`
  concerns the entire diagnostic result, including records outside the page.
  Successful transport with `passed:false` never establishes motion quality.

Every read carries session/project/source revision. Pages default 20, max 50;
JSON output is capped at 256 KiB (oversized influence lists return LIMIT_EXCEEDED,
never partial data). Input is ordinary finite JSON capped at 1 MiB; exact schemas
reject extra properties. Diagnostic policy/work limits remain owned by diagnostics,
not user-overridable thresholds. Pagination reruns against the current revision;
clients must compare revisions before combining pages. No Gate 2/3 or performance
claim is made by tool availability.

PNG render/save/job behavior and native registration remain as in
[evidence #13](../../../evidence/issue-13/README.md). New end-to-end evidence:
[evidence #19](../../../evidence/issue-19/README.md).
