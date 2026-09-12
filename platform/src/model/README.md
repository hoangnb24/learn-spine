# Model v0 — #6

Public import: `platform/src/model/index.ts`. Types and `project-v0.schema.json` live here as the single source; normative behavior remains in [semantics](../../../docs/product/contracts/semantics.md). No DOM, UI, storage, evaluator or Spine dependency. Ajv 8.20.0 validates the existing normative JSON Schema, without coercion, default injection or removal of unknown fields.

- `validate(unknown): Result<Project>` checks version/capabilities, JSON data/shape, IDs/references/cycles, trim/channel/key semantics, then returns a defensive clone. Success includes `warnings: []`; failure includes an error code, JSON Pointer path and related IDs where known.
- `migrate(unknown, 0): Result<Project>` is validation plus identity copy, preserves projectId/revision. Other source/target versions return `UNSUPPORTED_VERSION`.
- `parse(string): Result<Project>` reads strict JSON, rejects duplicate decoded object keys (including escaped equivalents), then validates. Invalid input returns Result rather than throwing. Object nesting is bounded at 128; a valid v0 project is much shallower.
- `serialize(unknown): Result<string>` validates first, so NaN/Infinity/undefined and extra fields cannot disappear silently during JSON serialization. It preserves semantic values, not whitespace/object key ordering or the sign of zero.
- `model: Model` exposes the normative validate/migrate interface. All shared module types are exported from this index.
- `EditorState` is ephemeral selection/camera/timeline state kept alongside Project by UI. It is neither a required player field nor accepted inside project JSON; serialization rejects leaked editor fields rather than silently stripping them. No persistence contract is promised for editor state.

Synthetic fixtures: `platform/fixtures/model/synthetic.ts` exports a fresh `createSyntheticProject()` for each caller and hand-computed `t03Vectors` for #8/#9. Its asset metadata is synthetic, **not a PNG bundle**; #10 tests must supply actual PNG bytes with matching metadata/hash. The normative real-art example remains in `docs/product/contracts/examples/region-valid.json`.

#7 owns commands and validates the final transaction state through this API. #8 owns evaluating transforms/time and reporting non-finite derived matrices; model validation only validates stored numbers. #10 owns PNG decode/hash/size/package budgets and passes complete JSON through `parse` (never directly through `JSON.parse`, which loses duplicate keys). Model does not fetch asset paths or decode PNG. Each downstream owns its own module index and need not edit the shell `src/index.ts`.

Checks from repository root: `npm ci --prefix platform`, `npm run typecheck --prefix platform`, `npm test --prefix platform`, `npm run build --prefix platform`. Contract oracle: `npm ci --ignore-scripts --prefix docs/product/contracts`, `npm test --prefix docs/product/contracts`, `npm run typecheck --prefix docs/product/contracts`.

## Mesh v1 extension (#15)

Model now accepts format 0 and 1 with separate strict schemas; migrate supports
0→1 and identity, rejecting downgrade. See [normative extension](../../../docs/product/contracts/mesh-v1.md)
for bind/weight/deform rules, migration and capability boundaries. The v0 notes
above describe the original #6 scope; `ik-v1` now enables strict optional `ikConstraints` in v1. See the
[IK contract](../engine/IK.md) for two-bone chain validation, scale policy and diagnostics.

## Composition v1 (#73)

Optional format-1 `compositions` now has a strict canonical schema and required
`composition-v1`, implemented jointly with Session and the shared evaluator.
See [the complete data/target/transition contract](COMPOSITION.md), including
source mutation, keyed mask coverage, clocks and compatibility boundaries.
