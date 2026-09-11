import { Ajv2020 } from "ajv/dist/2020.js";
import schema from "../model/project-v1.schema.json";
import type { Batch, RevisionRequest, Result, Json } from "../model";

export type Method = "apply" | "undo" | "redo" | "checkpoint" | "restore";
export type Request = Batch & { label: string; checkpointId: string };
const ajv = new Ajv2020({ strict: true, ownProperties: true });
ajv.addSchema(schema);
const id = schema.properties.projectId;
const ref = (name: string) => ({ $ref: `${schema.$id}#/$defs/${name}` });
const object = (properties: object) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
const operation = {
  oneOf: [
    ...Object.entries({
      putAsset: "asset",
      putBone: "bone",
      putSlot: "slot",
      putRegion: "region",
      putAnimation: "animation",
      putMesh: "mesh",
      putIKConstraint: "twoBoneIK",
    }).map(([kind, name]) =>
      object({ kind: { const: kind }, value: ref(name) }),
    ),
    object({
      kind: { const: "remove" },
      collection: {
        enum: [
          "assets",
          "bones",
          "slots",
          "attachments",
          "animations",
          "ikConstraints",
        ],
      },
      id,
    }),
    object({ kind: { const: "migrateProject" }, targetVersion: { const: 1 } }),
    object({
      kind: { const: "setVertexWeights" },
      attachmentId: id,
      vertices: {
        type: "array",
        minItems: 1,
        maxItems: 1000,
        items: object({
          vertex: {
            type: "integer",
            minimum: 0,
            maximum: Number.MAX_SAFE_INTEGER,
          },
          weights: schema.$defs.mesh.properties.weights.items,
        }),
      },
    }),
    object({
      kind: { const: "setVertexDeforms" },
      animationId: id,
      attachmentId: id,
      time: { type: "number", minimum: 0 },
      curve: ref("curve"),
      vertices: {
        type: "array",
        minItems: 1,
        maxItems: 1000,
        items: object({
          vertex: {
            type: "integer",
            minimum: 0,
            maximum: Number.MAX_SAFE_INTEGER,
          },
          offset: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2,
          },
        }),
      },
    }),
    object({
      kind: { const: "setSlotOrder" },
      ids: { type: "array", items: id, uniqueItems: true },
    }),
  ],
};
const base = {
  projectId: id,
  requestId: id,
  expectedRevision: schema.properties.revision,
};
const validators = {
  apply: ajv.compile<Batch>(
    object({
      ...base,
      operations: {
        type: "array",
        minItems: 1,
        maxItems: 1000,
        items: operation,
      },
    }),
  ),
  undo: ajv.compile<RevisionRequest>(object(base)),
  redo: ajv.compile<RevisionRequest>(object(base)),
  checkpoint: ajv.compile(object({ ...base, label: { type: "string" } })),
  restore: ajv.compile(object({ ...base, checkpointId: id })),
};
const bad = (path: string, message: string): Result<never> => ({
  ok: false,
  error: { code: "INVALID_INPUT", path, message },
});
/** Copies only ordinary finite JSON data; never invokes accessors/toJSON. */
export function jsonCopy(
  input: unknown,
  path = "",
  parents = new Set<object>(),
): Result<Json> {
  if (input === null || typeof input === "string" || typeof input === "boolean")
    return { ok: true, value: input, warnings: [] };
  if (typeof input === "number")
    return Number.isFinite(input)
      ? { ok: true, value: input === 0 ? 0 : input, warnings: [] }
      : bad(path, "Expected finite number");
  if (typeof input !== "object" || parents.has(input) || parents.size > 128)
    return bad(path, "Expected acyclic JSON data");
  if (
    !Array.isArray(input) &&
    ![Object.prototype, null].includes(Object.getPrototypeOf(input))
  )
    return bad(path, "Expected plain JSON object");
  parents.add(input);
  const value: Json[] | Record<string, Json> = Array.isArray(input)
    ? []
    : Object.create(null);
  for (const key of Reflect.ownKeys(input)) {
    if (Array.isArray(input) && key === "length") continue;
    const descriptor = Object.getOwnPropertyDescriptor(input, key)!;
    const location = `${path}/${String(key).replace(/~/g, "~0").replace(/\//g, "~1")}`;
    if (
      typeof key !== "string" ||
      !descriptor.enumerable ||
      !("value" in descriptor) ||
      (Array.isArray(input) && !/^(0|[1-9][0-9]*)$/.test(key))
    )
      return bad(location, "Expected JSON data property");
    const copied = jsonCopy(descriptor.value, location, parents);
    if (!copied.ok) return copied;
    Object.defineProperty(value, key, {
      value: copied.value,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }
  if (Array.isArray(input) && Object.keys(input).length !== input.length)
    return bad(path, "Sparse array");
  parents.delete(input);
  return { ok: true, value, warnings: [] };
}
export function request(method: Method, input: unknown): Result<Request> {
  const copy = jsonCopy(input);
  if (!copy.ok) return copy;
  const check = validators[method];
  if (!check(copy.value)) {
    const e = check.errors![0];
    return bad(e.instancePath, e.message ?? "Invalid request");
  }
  return { ok: true, value: copy.value as unknown as Request, warnings: [] };
}
/** Structural canonicalization after runtime validation. */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.keys(value)
      .sort()
      .map(
        (k) =>
          `${JSON.stringify(k)}:${canonical((value as Record<string, unknown>)[k])}`,
      )
      .join(",")}}`;
  return JSON.stringify(value);
}
