import { Ajv2020 } from "ajv/dist/2020.js";
import projectSchema from "../../model/project-v1.schema.json";
import type { Json, ToolDefinition } from "../../model";
import { jsonCopy } from "../../commands/validation";
const object = (
  properties: Record<string, unknown>,
  required = Object.keys(properties),
) => ({ type: "object", properties, required, additionalProperties: false });
const id = projectSchema.properties.projectId;
const integer = {
  type: "integer",
  minimum: 0,
  maximum: Number.MAX_SAFE_INTEGER,
};
const array = (items: unknown, maxItems = 1000) => ({
  type: "array",
  items,
  minItems: 1,
  maxItems,
});
const ref = (name: string) => ({ $ref: `#/$defs/${name}` });
const scope = { sessionId: integer, projectId: id };
const write = { ...scope, expectedRevision: integer, requestId: id };
const pagination = {
  offset: integer,
  limit: { type: "integer", minimum: 1, maximum: 50 },
};
const page = { ...pagination, ids: array(id, 50) };
const collections = [
  "bones",
  "slots",
  "attachments",
  "animations",
  "assets",
  "ikConstraints",
];
const viewport = object({
  width: { type: "integer", minimum: 1, maximum: 4096 },
  height: { type: "integer", minimum: 1, maximum: 4096 },
  centerX: { type: "number" },
  centerY: { type: "number" },
  zoom: { type: "number", exclusiveMinimum: 0 },
  devicePixelRatio: { type: "number", exclusiveMinimum: 0 },
  background: { type: "string", maxLength: 100 },
});
const operation = {
  oneOf: [
    ...Object.entries({
      putBone: "bone",
      putSlot: "slot",
      putRegion: "region",
      putAnimation: "animation",
      putMesh: "mesh",
      putIKConstraint: "twoBoneIK",
    }).map(([kind, name]) =>
      object({ kind: { const: kind }, value: ref(name) }),
    ),
    object({ kind: { const: "migrateProject" }, targetVersion: { const: 1 } }),
    object({
      kind: { const: "setVertexWeights" },
      attachmentId: id,
      vertices: array(
        object({
          vertex: integer,
          weights: projectSchema.$defs.mesh.properties.weights.items,
        }),
      ),
    }),
    object({
      kind: { const: "setVertexDeforms" },
      animationId: id,
      attachmentId: id,
      time: { type: "number", minimum: 0 },
      curve: ref("curve"),
      vertices: array(
        object({
          vertex: integer,
          offset: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2,
          },
        }),
      ),
    }),
    object({
      kind: { const: "remove" },
      collection: { enum: collections },
      id,
    }),
    object({
      kind: { const: "setSlotOrder" },
      ids: { type: "array", items: id, uniqueItems: true, maxItems: 1000 },
    }),
  ],
};
const xy = {
  type: "array",
  prefixItems: [{ type: "number" }, { type: "number" }],
  items: false,
  minItems: 2,
  maxItems: 2,
};
const point = {
  oneOf: [
    object({ kind: { const: "bone" }, boneId: id, local: xy }, [
      "kind",
      "boneId",
    ]),
    object({ kind: { const: "vertex" }, slotId: id, vertex: integer }),
    object({ kind: { const: "ik" }, constraintId: id }),
  ],
};
const sequence = {
  ...scope,
  animationId: id,
  times: array({ type: "number" }, 300),
  viewport,
};
const definitions: Array<[string, string, boolean, object]> = [
  [
    "get_capabilities",
    "Discover supported tools, connection, session identity and bounded retry/job lifetime.",
    true,
    object({}),
  ],
  [
    "inspect_project",
    "Read summary or a bounded collection page. Animations omit channels; use inspect_animation for keys. Units: seconds, radians, absolute local transforms.",
    true,
    object(
      { ...scope, ...page, collection: { enum: collections } },
      Object.keys(scope),
    ),
  ],
  [
    "inspect_animation",
    "Read one animation channel page or one channel key page. Supply boneId and property together for keys.",
    true,
    object(
      {
        ...scope,
        animationId: id,
        ...pagination,
        boneId: id,
        property: { enum: ["x", "y", "rotation", "scaleX", "scaleY"] },
      },
      [...Object.keys(scope), "animationId"],
    ),
  ],
  [
    "list_assets",
    "Read project PNG metadata only. Images must first be imported through the host; no URLs or external fetch.",
    true,
    object({ ...scope, ...page }, Object.keys(scope)),
  ],
  [
    "apply_batch",
    "Atomic rig/animation edit. Existing imported assets only. Put replaces complete entities. Retry exact payload; stale revisions require inspection. Mesh/deform/IK require version 1; migrateProject is explicit and undoable. Weights use zero-based vertex indices; unselected vertices stay unchanged.",
    false,
    object({ ...write, operations: array(operation) }),
  ],
  [
    "inspect_mesh",
    "Read a bounded vertex, triangle or bind-pose page. Vertex IDs are zero-based stable indices until topology is replaced.",
    true,
    object(
      {
        ...scope,
        attachmentId: id,
        section: { enum: ["vertices", "triangles", "bindPose"] },
        ...pagination,
      },
      [...Object.keys(scope), "attachmentId", "section"],
    ),
  ],
  [
    "inspect_deforms",
    "Read deform channel/key summaries. Add attachmentId and keyTime for a vertex offset page; offsets are absolute bind-world XY before skinning.",
    true,
    object(
      {
        ...scope,
        animationId: id,
        attachmentId: id,
        keyTime: { type: "number", minimum: 0 },
        ...pagination,
      },
      [...Object.keys(scope), "animationId"],
    ),
  ],
  [
    "validate_project",
    "Validate the active snapshot; passed:false reports a problem. Bounded diagnostics carry source revision.",
    true,
    object({ ...scope, ...pagination }, Object.keys(scope)),
  ],
  [
    "measure_motion",
    "Measure the active snapshot with fixed diagnostic policy. Anchors require explicit world targets; passed:false is not success of motion quality.",
    true,
    object(
      {
        ...scope,
        animationId: id,
        anchors: {
          type: "array",
          maxItems: 256,
          items: object(
            {
              id,
              point,
              target: xy,
              start: { type: "number" },
              end: { type: "number" },
            },
            ["id", "point", "target"],
          ),
        },
        loopPoints: { type: "array", maxItems: 4096, items: point },
        ...pagination,
      },
      [...Object.keys(scope), "animationId"],
    ),
  ],
  [
    "create_bones",
    "Put complete bones atomically, with explicit IDs and local setup transforms.",
    false,
    object({ ...write, bones: array(ref("bone")) }),
  ],
  [
    "attach_images",
    "Attach existing project PNG assets with complete regions and slots in one atomic edit.",
    false,
    object({
      ...write,
      attachments: array(ref("region")),
      slots: array(ref("slot")),
    }),
  ],
  [
    "create_animation",
    "Put a complete animation with explicit ID; channels may be empty.",
    false,
    object({ ...write, animation: ref("animation") }),
  ],
  [
    "set_keyframes",
    "Replace a complete animation including channels/keys/curves. Inspect and preserve unrelated channels; no implicit merge. Keys are absolute local values, seconds/radians.",
    false,
    object({ ...write, animation: ref("animation") }),
  ],
  [
    "set_curves",
    "Replace complete animation after changing curves on left keys; preserve unrelated channels and keys. Bezier x controls are normalized.",
    false,
    object({ ...write, animation: ref("animation") }),
  ],
  [
    "undo",
    "Undo last batch. Synchronous commits cannot be cancelled after completion.",
    false,
    object(write),
  ],
  ["redo", "Redo last undone batch.", false, object(write)],
  [
    "create_checkpoint",
    "Save an in-session history checkpoint.",
    false,
    object({ ...write, label: { type: "string", maxLength: 200 } }),
  ],
  [
    "restore_checkpoint",
    "Restore checkpoint as one undoable batch.",
    false,
    object({ ...write, checkpointId: id }),
  ],
  [
    "inspect_history",
    "Read bounded oldest-first history page.",
    true,
    object(
      {
        ...scope,
        ...pagination,
        kind: { enum: ["undo", "redo", "checkpoints"] },
      },
      [...Object.keys(scope), "kind"],
    ),
  ],
  [
    "render_pose",
    "Render a snapshot PNG, returned as image content with source revision. Inline maximum 8 MiB.",
    true,
    object({
      ...scope,
      animationId: { anyOf: [id, { type: "null" }] },
      time: { type: "number" },
      viewport,
    }),
  ],
  [
    "render_sequence",
    "Submit snapshot PNG sequence + ZIP job. Poll status and read artifacts. Jobs lost on reload; cancel by jobId.",
    true,
    object(sequence),
  ],
  [
    "export_frames",
    "Export snapshot PNG sequence and manifest in ZIP via observation job.",
    true,
    object(sequence),
  ],
  [
    "preview_animation",
    "Submit bounded snapshot playback job (PNG frames + ZIP).",
    true,
    object({
      ...scope,
      animationId: id,
      fps: { type: "integer", minimum: 1, maximum: 60 },
      loops: { type: "integer", minimum: 1, maximum: 3 },
      viewport,
    }),
  ],
  [
    "get_job_status",
    "Read job status with artifact page. Old session/evicted jobs return JOB_NOT_FOUND.",
    true,
    object({ ...scope, jobId: id, ...pagination }, [
      ...Object.keys(scope),
      "jobId",
    ]),
  ],
  [
    "cancel_job",
    "Cancel app-owned observation job; terminal outcomes unchanged. Native AbortSignal support is not claimed.",
    false,
    object({ ...scope, jobId: id }),
  ],
  [
    "release_job",
    "Release observation job and artifacts.",
    false,
    object({ ...scope, jobId: id }),
  ],
  [
    "read_artifact",
    "Read PNG as image content or create browser download for PNG/ZIP. Artifact must belong to this session job.",
    true,
    object({ ...scope, jobId: id, artifactId: id }),
  ],
  [
    "save_project",
    "Pack a snapshot with all PNGs into a downloadable ZIP through Storage.pack. Does not change project revision.",
    true,
    object(scope),
  ],
];
function withDefinitions(input: object): Json {
  const defs: Record<string, unknown> = {};
  const scan = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    for (const [key, value] of Object.entries(node)) {
      if (key === "$ref" && typeof value === "string") {
        const name = value.split("/").at(-1)!;
        if (!(name in defs)) {
          defs[name] =
            projectSchema.$defs[name as keyof typeof projectSchema.$defs];
          scan(defs[name]);
        }
      } else scan(value);
    }
  };
  scan(input);
  return {
    ...input,
    ...(Object.keys(defs).length ? { $defs: defs } : {}),
  } as Json;
}
export const toolDefinitions: ToolDefinition[] = definitions.map(
  ([name, description, readOnly, inputSchema]) => ({
    name,
    description,
    readOnly,
    inputSchema: withDefinitions(inputSchema),
  }),
);
const ajv = new Ajv2020({ strict: true, ownProperties: true });
const validators = new Map(
  toolDefinitions.map((t) => [t.name, ajv.compile(t.inputSchema as object)]),
);
export function validateInput(name: string, input: unknown) {
  const copy = jsonCopy(input);
  if (!copy.ok) return copy;
  if (new TextEncoder().encode(JSON.stringify(copy.value)).length > 1048576)
    return {
      ok: false as const,
      error: {
        code: "LIMIT_EXCEEDED" as const,
        path: "",
        message:
          "Tool input exceeds 1 MiB; split edits into bounded atomic batches",
      },
    };
  const validator = validators.get(name);
  if (!validator || !validator(copy.value))
    return {
      ok: false as const,
      error: {
        code: "INVALID_INPUT" as const,
        path: validator?.errors?.[0]?.instancePath ?? "",
        message: validator?.errors?.[0]?.message ?? "Unknown tool",
      },
    };
  return {
    ok: true as const,
    value: copy.value as Record<string, Json>,
    warnings: [],
  };
}
