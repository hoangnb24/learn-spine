# Mesh extension v1 — issue #15

2026-09-11. Normative extension of [region-v0](semantics.md), implemented in
[types](../../../platform/src/model/types.ts), [v1 schema](../../../platform/src/model/project-v1.schema.json)
and [mesh rules](../../../platform/src/model/mesh.ts). V0 schema and all region
semantics stay unchanged. No Spine runtime is used.

## Versions and capabilities

`validate` accepts format 0 and 1, returning defensive copies. Format 0 remains
strictly region-only. Format 1 requires `region-v0`; any mesh/deform data additionally
requires `mesh-v1`. Unknown capabilities, including `ik-v1` until #16 integrates
its solver, are rejected. Capabilities cannot silently enable ignored data.
`modelCapabilities` and `evaluatorCapabilities` expose support separately from
`rendererCapabilities`, which still lists region only.

`migrate(input, 1)` validates and copies 0→1, changing only `formatVersion`:
identity, revision, region geometry and animation remain identical. Identity 0→0
and 1→1 return copies. 1→0 and unknown source/target versions fail; no automatic
upgrade/downgrade occurs during parse, storage or evaluation. Tests use the durable
v0 synthetic fixture before migration and assert exact after object/pose equality.

Sessions can retain/read v1 data, save/reopen, and perform existing operations.
Their feature list remains `region-v0`: this issue does not add mesh authoring
commands/tools or mesh/deform editor UI. In particular existing `putAnimation`
command input still uses the region schema; full deform authoring is not claimed.

## Mesh and deformation

`Mesh = {id,type:'mesh',assetId,vertices,uvs,triangles,bindPose,weights}`.

- `vertices`: flat XY pairs in **bind-world logical coordinates**, X right/Y up.
  At least three vertices. Unlike regions there is no additional attachment
  transform, trim/pivot or slot-bone transform applied to these positions.
- `uvs`: one normalized UV pair per vertex, `(0,0)` at the decoded texture's top
  left. Logical geometry is independent of image resolution; replacing texture
  keeps positions, topology and weights. UVs refer to the decoded/trimmed texture.
- `triangles`: zero-based integer index triples into vertices. All indices must
  be in range. Degenerate triangles are permitted; no implicit retriangulation.
- `bindPose`: unique `{boneId,world:Matrix}` entries, where Matrix uses the existing
  column-vector affine convention. Matrices are authored and retained explicitly;
  each must be invertible with finite determinant. They need not equal current
  bone setup: editing setup intentionally changes geometry relative to binding.
- `weights`: one nonempty influence list per vertex: `{boneId,weight}`. Each bone
  must exist and have a bind matrix, cannot appear twice for the same vertex,
  weights are finite/nonnegative and sum to 1 within `1e-5`. Accepted weights are
  not normalized or otherwise changed. Zero weights are permitted.

`Animation.deforms?` contains unique `{attachmentId, keys}` channels for mesh
attachments. Each key has `{time, offsets, curve}`; offsets is a full flat XY array
matching vertices. Offsets are absolute displacement from bind vertices, **not**
accumulated deltas and not a displacement after skinning. Key times/curves use
existing linear/stepped/Bezier semantics, hold outside key range, and animation
clamp/loop. Missing channel (and `animationId:null`) means all offsets zero.
A shared mesh attached to multiple slots has the same final vertices in each slot.
Slots select visibility and draw order; slot bones do not transform weighted meshes.

For vertex `v`, offset `d(t)`, bind matrix `B_i`, evaluated bone world `W_i(t)`:

```text
world(v,t) = Σ_i weight_i * W_i(t) * inverse(B_i) * (v + d(t), 1)
```

Bind inverses and all evaluated results are derived afresh; source objects are
never mutated. Finite stored data that overflows derived geometry returns
`INVALID_INPUT`, never a partial pose. Singular **animated** transforms remain
valid (collapse geometry); singular bind matrices are rejected.

## Pose handoff for #17 / #18

Every evaluation (including v0) returns `poseVersion:1`, existing `bones` and
`regions`, and `meshes:DrawMesh[]` (empty for region-only projects). Each DrawMesh
has `{slotId,attachmentId,assetId,vertices,uvs,triangles}`. Its vertices are final
world coordinates, already including skinning/deformation; renderer must apply
only world-to-screen mapping. Arrays are fresh copies, not shared with Project.
Both arrays preserve relative slot order. Interleave region/mesh entries by
canonical `project.slots` order and `slotId`; do not draw every region then every
mesh. Reused attachments produce distinct draw entries per slot.

Current renderer prepare, drawing and camera geometry reject `mesh-v1` with
`UNSUPPORTED_CAPABILITY`; preparation failure preserves the prior prepared region.
No rendered-mesh, mesh bounds/diagnostics, Gate 2 or performance claim is made.

## Coordinated #16 integration

Order: sample local channels → parent-first FK worlds → **#16 solveIK** → mesh
pre-skin deform and skinning → draw pose. `engine/index.ts` has the integration
point after worlds are built. #16 owns `model/ik.ts`, `engine/ik.ts` and its tests;
shared model/evaluator integration follows acceptance/merge of #15.

Agreed future shape (not accepted by #15 loader): optional `Project.ikConstraints`
with `{id,type:'two-bone-ik',rootBoneId,childBoneId,targetBoneId,endpoint:[x,y],
bend:1|-1,mix,order}`; distinct nonnegative integer order. #16 adds its strict
schema, references/scale rules, `ik-v1` capability and optional Pose `ik` diagnostics
in the same integration. Hook:

```ts
solveIK(bones: readonly Bone[], constraints: readonly TwoBoneIK[],
        locals: Map<string, Transform>, worlds: Map<string, Matrix>): Result<IKDiagnostic[]>
```

The hook may mutate only the current evaluation's fresh maps. Rebuild affected
worlds before mesh skinning. The explicit bind matrices are unaffected by IK.

## Durable numerical inputs

[createMeshProject](../../../platform/fixtures/mesh/synthetic.ts) supplies a triangle
with rigid root, rigid child and 25/75 blend influences, two bind matrices, rotation
and deform keys. Asset metadata is synthetic, not PNG bytes.
[Tests](../../../platform/tests/engine/mesh/mesh.test.ts) include hand arithmetic:
setup `[12,20,14,20,12,22]`, end key `[18,20,16,24,15,22]`; independent analytic
answers at 20 seeded times, midpoint, negative parent scale, shear bind inverse,
Bezier/stepped, migration, malformed input and source/result isolation.
[Browser boundary test](../../../platform/tests/render/browser/mesh-boundary.spec.ts)
uses a real generated PNG and real decoder for ZIP roundtrip plus renderer refusal.
