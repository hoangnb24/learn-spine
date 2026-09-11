# Mesh and IK editing (#19)

The editor's **Lưới / IK** panel edits the same Session as WebMCP. Select a mesh,
then multiple vertices on the canvas or in the checkbox list. The selected vertex
indices are UI state only. Numeric weights replace only those vertices; the core
rejects invalid totals and missing bones/bind matrices. No normalization or hidden
selection is applied. Optional wireframe/selected-bone weight color uses renderer
`setOverlay`; vertex hit markers use evaluated world XY through `screenPoint`.

The panel can set absolute deform XY on selected vertices at the current timeline
time. Existing key offsets and curve are preserved for unselected vertices; a new
key starts with zero offsets. This is explicitly shown in the UI. The selected offsets
are submitted through `setVertexDeforms` at the rendered revision. IK mix,
bend and order are editable for existing constraints. Agent `apply_batch` creates
meshes, binds and IK constraints; the UI is a minimal parameter editor, not a
triangulation/automatic weighting or IK rig builder.

New editor projects use canonical format 1 with region-v0 only. Opening a format 0
ZIP leaves it at 0. The explicit **Nâng project lên v1** button submits the same
undoable `migrateProject` operation exposed to agents. Draft forms remount on source
revision and submit with the session identity to prevent stale writes. The player
uses the same renderer with overlays disabled by default.
