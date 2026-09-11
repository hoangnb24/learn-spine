import { validate, migrate } from "../model";
import type {
  Asset,
  AssetBytes,
  Capabilities,
  Checkpoint,
  Commands,
  Commit,
  Operation,
  Problem,
  Project,
  ProjectBundle,
  Result,
} from "../model";
import { canonical, request, type Method, type Request } from "./validation";

const collections = [
  "assets",
  "bones",
  "slots",
  "attachments",
  "animations",
  "ikConstraints",
] as const;
type Collection = (typeof collections)[number];
export interface EntityChange {
  collection: Collection;
  id: string;
}
export interface SessionEvent {
  sessionId: number;
  projectId: string;
  revision: number;
  kind: Method | "open";
  requestId?: string;
  changed: EntityChange[];
  checkpoint?: Checkpoint;
}
export interface HistoryEntry {
  requestId: string;
  kind: "apply" | "restore";
  sourceRevision: number;
  changed: EntityChange[];
}
export interface History {
  undo: HistoryEntry[];
  redo: HistoryEntry[];
  checkpoints: Checkpoint[];
}
const ok = <T>(value: T): Result<T> => ({ ok: true, value, warnings: [] });
const fail = (
  code: Problem["code"],
  path: string,
  message: string,
  revision?: number,
): Result<never> => ({
  ok: false,
  error: { code, path, message },
  ...(revision === undefined ? {} : { revision }),
});
const clone = <T>(v: T): T => structuredClone(v);
const copyBundle = (v: ProjectBundle): ProjectBundle => ({
  project: clone(v.project),
  assets: new Map(
    [...v.assets].map(([id, bytes]) => [id, new Uint8Array(bytes)]),
  ),
});

/** An opaque result of the application's trusted PNG/hash validator, never transport JSON. */
export interface PreparedBundle {
  readonly prepared: true;
}
const prepared = new WeakMap<PreparedBundle, ProjectBundle>();
export type BundleValidator = (
  input: unknown,
) => Promise<Result<ProjectBundle>>;
/** Supply storage.validateBundle. Preparation has no access to the active session. */
export async function prepareBundle(
  input: unknown,
  validator: BundleValidator,
): Promise<Result<PreparedBundle>> {
  try {
    const result = await validator(input);
    if (!result.ok) return result;
    const project = validate(result.value.project);
    if (!project.ok) return project;
    const bytes = result.value.assets;
    if (
      !(bytes instanceof Map) ||
      bytes.size !== project.value.assets.length ||
      project.value.assets.some((a) => !(bytes.get(a.id) instanceof Uint8Array))
    )
      return fail(
        "INVALID_INPUT",
        "/assets",
        "Validated bundle must contain exactly one byte buffer per asset ID",
      );
    const token: PreparedBundle = Object.freeze({ prepared: true });
    prepared.set(token, copyBundle({ project: project.value, assets: bytes }));
    return ok(token);
  } catch {
    return fail(
      "INVALID_INPUT",
      "",
      "Bundle validator failed; active session unchanged",
    );
  }
}
const resolve = (token: unknown): ProjectBundle | undefined =>
  typeof token === "object" && token !== null
    ? prepared.get(token as PreparedBundle)
    : undefined;
const sameImage = (a: Asset, b: Asset) =>
  a.sha256 === b.sha256 &&
  a.pixelWidth === b.pixelWidth &&
  a.pixelHeight === b.pixelHeight;
let sessionSerial = 0;

export interface Session extends Commands {
  apply(input: unknown, assets?: PreparedBundle): Result<Commit>;
  undo(input: unknown): Result<Commit>;
  redo(input: unknown): Result<Commit>;
  checkpoint(input: unknown): Result<Checkpoint>;
  restore(input: unknown): Result<Commit>;
  /** Calling open, including same project, starts a new retry/history lifetime. */
  open(
    bundle: unknown,
  ): Result<{ sessionId: number; projectId: string; revision: number }>;
  snapshot(): ProjectBundle;
  history(): History;
  capabilities(): Capabilities;
  subscribe(listener: (event: SessionEvent) => void): () => void;
  readonly sessionId: number;
}
interface Entry {
  before: ProjectBundle;
  after: ProjectBundle;
  info: HistoryEntry;
}
interface Memo {
  fingerprint: string;
  result: Result<Commit | Checkpoint>;
}
export function createSession(bundle: unknown): Result<Session> {
  const initial = resolve(bundle);
  if (!initial)
    return fail(
      "INVALID_INPUT",
      "",
      "Expected a PreparedBundle from prepareBundle",
    );
  return ok(new CommandSession(initial));
}
class CommandSession implements Session {
  private current: ProjectBundle;
  private identity = ++sessionSerial;
  private undoEntries: Entry[] = [];
  private redoEntries: Entry[] = [];
  private checkpoints = new Map<
    string,
    { info: Checkpoint; bundle: ProjectBundle }
  >();
  private dedup = new Map<string, Memo>();
  private listeners = new Set<(event: SessionEvent) => void>();
  private eventQueue: SessionEvent[] = [];
  private notifying = false;
  private checkpointSerial = 0;
  constructor(initial: ProjectBundle) {
    this.current = copyBundle(initial);
  }
  get sessionId() {
    return this.identity;
  }
  inspect(): Project {
    return clone(this.current.project);
  }
  snapshot(): ProjectBundle {
    return copyBundle(this.current);
  }
  history(): History {
    return clone({
      undo: this.undoEntries.map((e) => e.info),
      redo: this.redoEntries.map((e) => e.info),
      checkpoints: [...this.checkpoints.values()].map((c) => c.info),
    });
  }
  capabilities(): Capabilities {
    return {
      formatVersions: [0, 1],
      features: [
        "region-v0",
        "mesh-v1",
        "ik-v1",
        "explicit-migration-v1",
        "atomic-batch",
        "undo-redo",
        "checkpoints",
        "session-dedup",
        "session-events",
      ],
      transport: "none",
      limits: {
        dedupRequests: 1000,
        undoBatches: 100,
        checkpoints: 20,
        jobs: 0,
        packageBytes: 200 * 1024 ** 2,
        assetBytes: 20 * 1024 ** 2,
        maxImageDimension: 16384,
      },
    };
  }
  subscribe(listener: (event: SessionEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  private emit(event: SessionEvent) {
    this.eventQueue.push(event);
    if (this.notifying) return;
    this.notifying = true;
    try {
      while (this.eventQueue.length) {
        const next = this.eventQueue.shift()!;
        for (const listener of [...this.listeners]) {
          try {
            listener(clone(next));
          } catch {
            /* A UI observer cannot roll back a committed write or starve other observers. */
          }
        }
      }
    } finally {
      this.notifying = false;
    }
  }
  open(
    token: unknown,
  ): Result<{ sessionId: number; projectId: string; revision: number }> {
    const bundle = resolve(token);
    if (!bundle)
      return fail(
        "INVALID_INPUT",
        "",
        "Expected a PreparedBundle from prepareBundle",
        this.current.project.revision,
      );
    this.current = copyBundle(bundle);
    this.identity = ++sessionSerial;
    this.undoEntries = [];
    this.redoEntries = [];
    this.checkpoints.clear();
    this.dedup.clear();
    this.checkpointSerial = 0;
    const result = {
      sessionId: this.identity,
      projectId: bundle.project.projectId,
      revision: bundle.project.revision,
    };
    this.emit({ ...result, kind: "open", changed: [] });
    return ok(result);
  }
  private start(
    method: Method,
    input: unknown,
  ): Result<{ req: Request; fingerprint: string; memo?: Memo }> {
    const parsed = request(method, input);
    const revision = this.current.project.revision;
    if (!parsed.ok) return { ...parsed, revision };
    const req = parsed.value;
    if (req.projectId !== this.current.project.projectId)
      return fail(
        "MISSING_REFERENCE",
        "/projectId",
        "Request does not target the active project",
        revision,
      );
    const fingerprint = canonical({ method, payload: req });
    const memo = this.dedup.get(req.requestId);
    if (memo)
      return memo.fingerprint === fingerprint
        ? ok({ req, fingerprint, memo })
        : fail(
            "REQUEST_ID_REUSED",
            "/requestId",
            "Request ID already succeeded with a different payload",
            revision,
          );
    if (req.expectedRevision !== revision)
      return fail(
        "REVISION_CONFLICT",
        "/expectedRevision",
        "Read the current project before retrying this edit",
        revision,
      );
    return ok({ req, fingerprint });
  }
  private remember(
    req: Request,
    fingerprint: string,
    result: Result<Commit | Checkpoint>,
  ) {
    this.dedup.set(req.requestId, { fingerprint, result: clone(result) });
    if (this.dedup.size > 1000)
      this.dedup.delete(this.dedup.keys().next().value!);
  }
  private write(
    kind: "apply" | "undo" | "redo" | "restore",
    req: Request,
    fingerprint: string,
    target: ProjectBundle,
    changed: EntityChange[],
  ): Result<Commit> {
    const revision = this.current.project.revision;
    if (revision === Number.MAX_SAFE_INTEGER)
      return fail(
        "LIMIT_EXCEEDED",
        "/revision",
        "Revision cannot exceed MAX_SAFE_INTEGER",
        revision,
      );
    const next = {
      project: { ...target.project, revision: revision + 1 },
      assets: target.assets,
    };
    if (kind === "apply" || kind === "restore") {
      this.undoEntries.push({
        before: this.current,
        after: next,
        info: {
          requestId: req.requestId,
          kind,
          sourceRevision: revision,
          changed,
        },
      });
      if (this.undoEntries.length > 100) this.undoEntries.shift();
      this.redoEntries = [];
    } else if (kind === "undo") this.redoEntries.push(this.undoEntries.pop()!);
    else this.undoEntries.push(this.redoEntries.pop()!);
    this.current = next;
    const result = ok({
      projectId: next.project.projectId,
      revision: next.project.revision,
      changedIds: [...new Set(changed.map((c) => c.id))],
    });
    this.remember(req, fingerprint, result);
    this.emit({
      sessionId: this.identity,
      projectId: req.projectId,
      revision: next.project.revision,
      kind,
      requestId: req.requestId,
      changed,
    });
    return result;
  }
  apply(input: unknown, token?: PreparedBundle): Result<Commit> {
    const started = this.start("apply", input);
    if (!started.ok) return started;
    const { req, fingerprint, memo } = started.value;
    if (memo) return clone(memo.result) as Result<Commit>;
    const candidate = this.inspect();
    const changed: EntityChange[] = [];
    for (const [index, op] of req.operations.entries()) {
      const error = perform(candidate, op, changed);
      if (error)
        return {
          ok: false,
          error: { ...error, path: `/operations/${index}${error.path}` },
          revision: this.current.project.revision,
        };
    }
    const checked = validate(candidate);
    if (!checked.ok)
      return { ...checked, revision: this.current.project.revision };
    const supplied = token === undefined ? undefined : resolve(token);
    if (token !== undefined && !supplied)
      return fail(
        "INVALID_INPUT",
        "/assets",
        "Expected PreparedBundle",
        this.current.project.revision,
      );
    const bytes = new Map<string, Uint8Array>();
    for (const asset of checked.value.assets) {
      const source = [supplied, this.current].find((b) =>
        b?.project.assets.some((a) => a.id === asset.id && sameImage(a, asset)),
      );
      const buffer = source?.assets.get(asset.id);
      if (!buffer)
        return fail(
          "MISSING_REFERENCE",
          "/assets",
          `Prepare validated PNG bytes for asset ${asset.id} before applying`,
          this.current.project.revision,
        );
      bytes.set(asset.id, buffer);
    }
    const assets = checked.value.assets;
    const totalBytes = [...bytes.values()].reduce(
      (sum, b) => sum + b.byteLength,
      new TextEncoder().encode(JSON.stringify(checked.value)).byteLength,
    );
    if (
      assets.length > 256 ||
      assets.reduce((sum, a) => sum + a.pixelWidth * a.pixelHeight, 0) >
        64_000_000 ||
      [...bytes.values()].some((b) => b.byteLength > 20 * 1024 ** 2) ||
      totalBytes > 200 * 1024 ** 2
    )
      return fail(
        "LIMIT_EXCEEDED",
        "/assets",
        "Candidate exceeds region-v0 bundle resource limits",
        this.current.project.revision,
      );
    return this.write(
      "apply",
      req,
      fingerprint,
      { project: checked.value, assets: bytes },
      unique(changed),
    );
  }
  undo(input: unknown): Result<Commit> {
    return this.travel("undo", input);
  }
  redo(input: unknown): Result<Commit> {
    return this.travel("redo", input);
  }
  private travel(kind: "undo" | "redo", input: unknown): Result<Commit> {
    const started = this.start(kind, input);
    if (!started.ok) return started;
    const { req, fingerprint, memo } = started.value;
    if (memo) return clone(memo.result) as Result<Commit>;
    const entry = (kind === "undo" ? this.undoEntries : this.redoEntries).at(
      -1,
    );
    if (!entry)
      return fail(
        kind === "undo" ? "NOTHING_TO_UNDO" : "NOTHING_TO_REDO",
        "",
        "No history entry in this session",
        this.current.project.revision,
      );
    return this.write(
      kind,
      req,
      fingerprint,
      kind === "undo" ? entry.before : entry.after,
      entry.info.changed,
    );
  }
  checkpoint(input: unknown): Result<Checkpoint> {
    const started = this.start("checkpoint", input);
    if (!started.ok) return started;
    const { req, fingerprint, memo } = started.value;
    if (memo) return clone(memo.result) as Result<Checkpoint>;
    if (this.checkpoints.size === 20)
      return fail(
        "LIMIT_EXCEEDED",
        "",
        "Session retains at most 20 checkpoints",
        this.current.project.revision,
      );
    const info: Checkpoint = {
      id: `checkpoint-${++this.checkpointSerial}`,
      projectId: req.projectId,
      sourceRevision: this.current.project.revision,
      label: req.label,
    };
    this.checkpoints.set(info.id, { info, bundle: this.current });
    const result = ok(clone(info));
    this.remember(req, fingerprint, result);
    this.emit({
      sessionId: this.identity,
      projectId: req.projectId,
      revision: this.current.project.revision,
      kind: "checkpoint",
      requestId: req.requestId,
      changed: [],
      checkpoint: info,
    });
    return result;
  }
  restore(input: unknown): Result<Commit> {
    const started = this.start("restore", input);
    if (!started.ok) return started;
    const { req, fingerprint, memo } = started.value;
    if (memo) return clone(memo.result) as Result<Commit>;
    const saved = this.checkpoints.get(req.checkpointId);
    if (!saved)
      return fail(
        "CHECKPOINT_NOT_FOUND",
        "/checkpointId",
        "Checkpoint is not retained in this session",
        this.current.project.revision,
      );
    // Restore invalidates all entity IDs present on either side, preserving namespaces.
    const changed = unique(
      collections.flatMap((collection) =>
        [
          ...(this.current.project[collection] ?? []),
          ...(saved.bundle.project[collection] ?? []),
        ].map((e) => ({ collection, id: e.id })),
      ),
    );
    return this.write("restore", req, fingerprint, saved.bundle, changed);
  }
}
const unique = (changes: EntityChange[]) => [
  ...new Map(changes.map((c) => [`${c.collection}/${c.id}`, c])).values(),
];
function perform(
  project: Project,
  operation: Operation,
  changed: EntityChange[],
): Problem | undefined {
  const missing = (path: string, message: string): Problem => ({
    code: "MISSING_REFERENCE",
    path,
    message,
  });
  if (operation.kind === "migrateProject") {
    const migrated = migrate(project, operation.targetVersion);
    if (!migrated.ok) return migrated.error;
    Object.assign(project, migrated.value);
    return;
  }
  if (
    operation.kind === "putMesh" ||
    operation.kind === "putIKConstraint" ||
    operation.kind === "setVertexWeights" ||
    (operation.kind === "putAnimation" && operation.value.deforms !== undefined)
  ) {
    if (project.formatVersion !== 1)
      return {
        code: "UNSUPPORTED_VERSION",
        path: "",
        message:
          "Explicitly migrateProject to version 1 before mesh, deform or IK authoring",
      };
    const feature = operation.kind === "putIKConstraint" ? "ik-v1" : "mesh-v1";
    if (!project.requiredCapabilities.includes(feature))
      project.requiredCapabilities.push(feature);
  }
  if (operation.kind === "setVertexWeights") {
    const mesh = project.attachments.find(
      (a) => a.id === operation.attachmentId,
    );
    if (!mesh || mesh.type !== "mesh")
      return missing(
        "/attachmentId",
        "Expected an existing mesh attachment ID",
      );
    const seen = new Set<number>();
    for (const [i, entry] of operation.vertices.entries()) {
      if (entry.vertex >= mesh.weights.length)
        return missing(
          `/vertices/${i}/vertex`,
          `Vertex index ${entry.vertex} does not exist in mesh ${mesh.id}`,
        );
      if (seen.has(entry.vertex))
        return {
          code: "INVALID_INPUT",
          path: `/vertices/${i}/vertex`,
          message: "Duplicate vertex index",
        };
      seen.add(entry.vertex);
      mesh.weights[entry.vertex] = entry.weights;
    }
    changed.push({ collection: "attachments", id: mesh.id });
    return;
  }
  if (operation.kind === "setSlotOrder") {
    const slots = new Map(project.slots.map((s) => [s.id, s]));
    if (
      operation.ids.length !== slots.size ||
      operation.ids.some((id) => !slots.has(id))
    )
      return {
        code: "INVALID_INPUT",
        path: "/ids",
        message: "Slot order must list every slot exactly once",
      };
    project.slots = operation.ids.map((id) => slots.get(id)!);
    changed.push(
      ...operation.ids.map((id) => ({ collection: "slots" as const, id })),
    );
    return;
  }
  if (operation.kind === "remove") {
    const entries = project[operation.collection] ?? [];
    const index = entries.findIndex((e) => e.id === operation.id);
    if (index === -1) return missing("/id", "Entity ID does not exist");
    entries.splice(index, 1);
    changed.push({ collection: operation.collection, id: operation.id });
    return;
  }
  const names = {
    putAsset: "assets",
    putBone: "bones",
    putSlot: "slots",
    putRegion: "attachments",
    putAnimation: "animations",
    putMesh: "attachments",
    putIKConstraint: "ikConstraints",
  } as const;
  const collection = names[operation.kind];
  // The runtime operation schema has already coupled each kind to its entity schema.
  if (collection === "ikConstraints") project.ikConstraints ??= [];
  const entries = project[collection] as Array<{ id: string }>;
  const index = entries.findIndex((e) => e.id === operation.value.id);
  if (index < 0) entries.push(operation.value);
  else entries[index] = operation.value;
  changed.push({ collection, id: operation.value.id });
}
export type { AssetBytes };
