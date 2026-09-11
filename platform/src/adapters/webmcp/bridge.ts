import {
  validate_project,
  measure_motion,
  type MotionRequest,
} from "../../diagnostics";
import type { Session } from "../../commands";
import type {
  Json,
  Result,
  Problem,
  Storage,
  JobRequest,
  ObservationRequest,
  Animation,
  Capabilities,
} from "../../model";
import type { ObservationService } from "../../observation";
import { toolDefinitions, validateInput } from "./schemas";

export interface BridgeServices {
  getSession(): Session | null;
  observation: ObservationService;
  storage: Storage;
  /** Host owns presentation; adapter revokes its object URLs on session change/dispose. */
  onDownload?(download: {
    url: string;
    filename: string;
    revision: number;
  }): void;
  onResult?(name: string, input: unknown, result: Result<Json>): void;
}
const ok = (value: unknown): Result<Json> => ({
  ok: true,
  value: value as Json,
  warnings: [],
});
const fail = (
  code: Problem["code"],
  message: string,
  revision?: number,
): Result<Json> => ({
  ok: false,
  error: { code, path: "", message },
  ...(revision === undefined ? {} : { revision }),
});
const base64 = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
};
const page = (values: unknown[], input: Record<string, Json>) => {
  const offset = Number(input.offset ?? 0),
    limit = Number(input.limit ?? 20);
  return {
    items: values.slice(offset, offset + limit),
    total: values.length,
    nextOffset: offset + limit < values.length ? offset + limit : null,
  };
};
/** Tab-local entry point, sharing the exact Session used by its host UI. No network service. */
export class WebMCPBridge {
  readonly definitions = toolDefinitions;
  transport: Capabilities["transport"] = "bridge";
  private disposed = false;
  private identity: number | null = null;
  private owner: Session | null = null;
  private jobs = new Set<string>();
  private urls = new Map<string, number>();
  private downloadBytes = 0;
  private controllers = new Set<AbortController>();
  private unsubscribe?: () => void;
  constructor(readonly services: BridgeServices) {}
  private clear() {
    for (const c of this.controllers) c.abort();
    this.controllers.clear();
    for (const id of this.jobs) {
      this.services.observation.cancel(id);
      this.services.observation.release(id);
    }
    this.jobs.clear();
    for (const url of this.urls.keys()) URL.revokeObjectURL(url);
    this.urls.clear();
    this.downloadBytes = 0;
  }
  /** Call from host invalidation subscription when its session is replaced or cleared. */
  refresh() {
    const session = this.services.getSession();
    if (
      session !== this.owner ||
      (session?.sessionId ?? null) !== this.identity
    ) {
      this.clear();
      this.unsubscribe?.();
      this.owner = session;
      this.identity = session?.sessionId ?? null;
      this.unsubscribe = session?.subscribe(() => this.refresh());
    }
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.clear();
    this.unsubscribe?.();
  }
  private download(
    bytes: Uint8Array,
    mimeType: string,
    filename: string,
    revision: number,
  ) {
    // Bound retained downloads without revoking observation-owned media.
    while (
      this.urls.size >= 20 ||
      this.downloadBytes + bytes.length > 256 * 1024 ** 2
    ) {
      const [first, size] = this.urls.entries().next().value!;
      URL.revokeObjectURL(first);
      this.urls.delete(first);
      this.downloadBytes -= size;
    }
    const url = URL.createObjectURL(
      new Blob([new Uint8Array(bytes)], { type: mimeType }),
    );
    this.urls.set(url, bytes.length);
    this.downloadBytes += bytes.length;
    try {
      this.services.onDownload?.({ url, filename, revision });
    } catch {
      /* Presentation cannot invalidate completed output. */
    }
    return {
      url,
      filename,
      mimeType,
      byteLength: bytes.length,
      revision,
      expires:
        "session change, dispose, reload, or when download retention exceeds 20 files / 256 MiB",
    };
  }
  async dispatch(
    name: string,
    input: unknown,
    signal?: AbortSignal,
  ): Promise<Result<Json>> {
    let result: Result<Json>;
    try {
      result = await this.call(name, input, signal);
    } catch (e) {
      result = fail("INVALID_INPUT", `Tool failed: ${String(e)}`);
    }
    try {
      this.services.onResult?.(name, input, result);
    } catch {
      /* Logs cannot change results. */
    }
    return result;
  }
  private async call(
    name: string,
    input: unknown,
    signal?: AbortSignal,
  ): Promise<Result<Json>> {
    if (this.disposed)
      return fail(
        "UNSUPPORTED_CAPABILITY",
        "Bridge disposed; reconnect and rediscover tools",
      );
    this.refresh();
    const parsed = validateInput(name, input);
    if (!parsed.ok) return parsed;
    const p = parsed.value,
      session = this.services.getSession(),
      project = session?.inspect();
    if (name === "get_capabilities")
      return ok({
        ...(session?.capabilities() ?? {
          formatVersions: [0, 1],
          features: [],
          limits: {},
        }),
        transport: this.transport,
        sessionId: session?.sessionId ?? null,
        projectId: project?.projectId ?? null,
        revision: project?.revision ?? null,
        tools: this.definitions.map((t) => t.name),
        features: [
          ...(session?.capabilities().features ?? []),
          "snapshot-observation",
          "png-image-content",
          "project-zip",
          "app-owned-job-cancel",
          "diagnostics-v1",
        ],
        limits: {
          ...(session?.capabilities().limits ?? {}),
          jobs: 2,
          inspectPage: 50,
          jsonResponseBytes: 262144,
          inlineImageBytes: 8388608,
          inputJsonBytes: 1048576,
          downloadBytes: 268435456,
          downloadFiles: 20,
        },
        lifetime:
          "Session changes/reload invalidate jobs, URLs and retry identity. Sync commit retries are retained for 1000 requests by Session; observation submissions and save are not deduplicated.",
        cancellation:
          "cancel_job for observation jobs; native AbortSignal unavailable in tested host; completed synchronous edits require undo.",
      });
    if (!session || !project)
      return fail(
        "MISSING_REFERENCE",
        "No active project; open/import a project in the host UI",
      );
    if (p.sessionId !== session.sessionId || p.projectId !== project.projectId)
      return fail(
        "REVISION_CONFLICT",
        "Session changed; rediscover capabilities and inspect before continuing",
        project.revision,
      );
    if (signal?.aborted)
      return fail("CANCELLED", "Cancelled before dispatch", project.revision);
    const envelope = {
      sessionId: session.sessionId,
      projectId: project.projectId,
      revision: project.revision,
    };
    const bounded = (value: unknown) =>
      new TextEncoder().encode(JSON.stringify(value)).length > 262144
        ? fail(
            "LIMIT_EXCEEDED",
            "Response exceeds 256 KiB; request a smaller limit or select IDs/channel",
            project.revision,
          )
        : ok({ ...envelope, ...(value as object) });
    const request = {
      projectId: p.projectId,
      expectedRevision: p.expectedRevision,
      requestId: p.requestId,
    };
    if (
      [
        "apply_batch",
        "create_bones",
        "attach_images",
        "create_animation",
        "set_keyframes",
        "set_curves",
      ].includes(name)
    ) {
      const operations =
        name === "apply_batch"
          ? p.operations
          : name === "create_bones"
            ? (p.bones as Json[]).map((value) => ({ kind: "putBone", value }))
            : name === "attach_images"
              ? [
                  ...(p.attachments as Json[]).map((value) => ({
                    kind: "putRegion",
                    value,
                  })),
                  ...(p.slots as Json[]).map((value) => ({
                    kind: "putSlot",
                    value,
                  })),
                ]
              : [{ kind: "putAnimation", value: p.animation }];
      return session.apply({ ...request, operations }) as Result<Json>;
    }
    if (name === "undo" || name === "redo")
      return session[name](request) as Result<Json>;
    if (name === "create_checkpoint")
      return session.checkpoint({ ...request, label: p.label }) as Result<Json>;
    if (name === "restore_checkpoint")
      return session.restore({
        ...request,
        checkpointId: p.checkpointId,
      }) as Result<Json>;
    if (name === "inspect_history")
      return bounded(
        page(session.history()[p.kind as "undo" | "redo" | "checkpoints"], p),
      );
    if (name === "validate_project" || name === "measure_motion") {
      const { sessionId: _, projectId: __, ...parameters } = p;
      const report =
        name === "validate_project"
          ? validate_project(project, { ...parameters, limit: Number(p.limit ?? 20) })
          : measure_motion(project, { ...parameters, limit: Number(p.limit ?? 20) } as unknown as MotionRequest);
      return report.ok ? bounded(report.value) : report;
    }
    if (name === "inspect_mesh") {
      const mesh = project.attachments.find((a) => a.id === p.attachmentId);
      if (!mesh || mesh.type !== "mesh")
        return fail(
          "MISSING_REFERENCE",
          "Mesh attachment not found",
          project.revision,
        );
      const offset = Number(p.offset ?? 0),
        limit = Number(p.limit ?? 20);
      const total =
        p.section === "vertices"
          ? mesh.weights.length
          : p.section === "triangles"
            ? mesh.triangles.length / 3
            : mesh.bindPose.length;
      const items = Array.from(
        { length: Math.max(0, Math.min(limit, total - offset)) },
        (_, i) => {
          const index = offset + i;
          return p.section === "vertices"
            ? {
                vertex: index,
                position: mesh.vertices.slice(index * 2, index * 2 + 2),
                uv: mesh.uvs.slice(index * 2, index * 2 + 2),
                weights: mesh.weights[index],
              }
            : p.section === "triangles"
              ? {
                  triangle: index,
                  vertices: mesh.triangles.slice(index * 3, index * 3 + 3),
                }
              : mesh.bindPose[index];
        },
      );
      return bounded({
        attachmentId: mesh.id,
        section: p.section,
        items,
        total,
        nextOffset:
          offset + items.length < total ? offset + items.length : null,
      });
    }
    if (name === "inspect_deforms") {
      const animation = project.animations.find((a) => a.id === p.animationId);
      if (!animation)
        return fail(
          "MISSING_REFERENCE",
          "Animation not found",
          project.revision,
        );
      if (p.attachmentId) {
        const deform = animation.deforms?.find(
          (d) => d.attachmentId === p.attachmentId,
        );
        if (!deform)
          return fail(
            "MISSING_REFERENCE",
            "Deform channel not found",
            project.revision,
          );
        return bounded({
          animationId: animation.id,
          attachmentId: p.attachmentId,
          ...page(deform.keys, p),
        });
      }
      return bounded({
        animationId: animation.id,
        ...page(
          (animation.deforms ?? []).map((d) => ({
            attachmentId: d.attachmentId,
            keyCount: d.keys.length,
          })),
          p,
        ),
      });
    }
    if (name === "inspect_project" || name === "list_assets") {
      const collection = name === "list_assets" ? "assets" : p.collection;
      if (!collection)
        return bounded({
          formatVersion: project.formatVersion,
          requiredCapabilities: project.requiredCapabilities,
          metadata: project.metadata,
          counts: Object.fromEntries(
            [
              "bones",
              "slots",
              "attachments",
              "animations",
              "assets",
              "ikConstraints",
            ].map((k) => [k, (project[k as "bones"] ?? []).length]),
          ),
        });
      let values: unknown[] = project[collection as "bones"] ?? [];
      if (p.ids)
        values = values.filter((v) =>
          (p.ids as string[]).includes((v as { id: string }).id),
        );
      if (collection === "animations")
        values = (values as Animation[]).map(
          ({ channels, deforms, ...animation }) => ({
            ...animation,
            channelCount: channels.length,
            deformCount: deforms?.length ?? 0,
          }),
        );
      if (collection === "attachments")
        values = (values as typeof project.attachments).map((a) =>
          a.type === "region"
            ? a
            : {
                id: a.id,
                type: a.type,
                assetId: a.assetId,
                vertexCount: a.vertices.length / 2,
                triangleCount: a.triangles.length / 3,
                bindCount: a.bindPose.length,
              },
        );
      return bounded({ collection, ...page(values, p) });
    }
    if (name === "inspect_animation") {
      const animation = project.animations.find((a) => a.id === p.animationId);
      if (!animation)
        return fail(
          "MISSING_REFERENCE",
          "Animation not found",
          project.revision,
        );
      if (Boolean(p.boneId) !== Boolean(p.property))
        return fail(
          "INVALID_INPUT",
          "Provide boneId and property together",
          project.revision,
        );
      if (p.boneId) {
        const channel = animation.channels.find(
          (c) => c.boneId === p.boneId && c.property === p.property,
        );
        if (!channel)
          return fail(
            "MISSING_REFERENCE",
            "Channel not found",
            project.revision,
          );
        return bounded({
          animationId: animation.id,
          boneId: channel.boneId,
          property: channel.property,
          ...page(channel.keys, p),
        });
      }
      return bounded({
        animation: {
          id: animation.id,
          name: animation.name,
          duration: animation.duration,
          loop: animation.loop,
        },
        ...page(
          animation.channels.map(({ keys, ...c }) => ({
            ...c,
            keyCount: keys.length,
          })),
          p,
        ),
      });
    }
    if (
      ["render_sequence", "export_frames", "preview_animation"].includes(name)
    ) {
      const { sessionId: _, projectId: __, ...parameters } = p;
      const result = this.services.observation.submit(session.snapshot(), {
        ...parameters,
        kind: name === "preview_animation" ? "preview" : "sequence",
      } as unknown as JobRequest);
      if (result.ok) this.jobs.add(result.value.id);
      return result as Result<Json>;
    }
    if (
      ["get_job_status", "cancel_job", "release_job", "read_artifact"].includes(
        name,
      )
    ) {
      const jobId = p.jobId as string;
      if (!this.jobs.has(jobId))
        return fail(
          "JOB_NOT_FOUND",
          "Job belongs to an old session, was released, or was not submitted by this bridge",
          project.revision,
        );
      const job = this.services.observation.get(jobId);
      if (!job.ok) return job;
      if (name === "cancel_job")
        return this.services.observation.cancel(jobId) as Result<Json>;
      if (name === "release_job") {
        const result = this.services.observation.release(jobId);
        this.jobs.delete(jobId);
        return result.ok ? ok({ ...envelope, released: jobId }) : result;
      }
      if (name === "get_job_status") {
        if (job.value.status === "succeeded") {
          const { artifacts, ...summary } = job.value;
          return ok({ ...summary, ...page(artifacts, p) });
        }
        return ok(job.value);
      }
      if (job.value.status !== "succeeded")
        return fail(
          "INVALID_INPUT",
          `Job is ${job.value.status}; poll until succeeded`,
          project.revision,
        );
      const artifact = job.value.artifacts.find((a) => a.id === p.artifactId);
      if (!artifact)
        return fail(
          "MISSING_REFERENCE",
          "Artifact does not belong to this job",
          project.revision,
        );
      const bytes = await this.services.observation.readArtifact(artifact.id);
      if (!bytes.ok) return bytes;
      this.refresh();
      if (
        session !== this.owner ||
        p.sessionId !== this.identity ||
        this.disposed
      )
        return fail("CANCELLED", "Session changed while reading artifact");
      const value = {
        ...envelope,
        jobId,
        artifact,
        ...this.download(
          bytes.value,
          artifact.mimeType,
          `${artifact.id}.${artifact.mimeType === "image/png" ? "png" : "zip"}`,
          job.value.revision,
        ),
      };
      return ok(
        artifact.mimeType === "image/png" && bytes.value.length <= 8388608
          ? {
              ...value,
              image: {
                type: "image",
                mimeType: "image/png",
                data: base64(bytes.value),
              },
            }
          : value,
      );
    }
    if (name === "render_pose" || name === "save_project") {
      if (this.controllers.size >= 2)
        return fail(
          "LIMIT_EXCEEDED",
          "Two direct snapshot requests already active",
        );
      const controller = new AbortController();
      this.controllers.add(controller);
      const abort = () => controller.abort();
      signal?.addEventListener("abort", abort, { once: true });
      const snapshot = session.snapshot();
      try {
        const { sessionId: _, projectId: __, ...parameters } = p;
        const result =
          name === "render_pose"
            ? await this.services.observation.renderPose(
                snapshot,
                parameters as unknown as ObservationRequest,
                controller.signal,
              )
            : await this.services.storage.pack(snapshot, controller.signal);
        this.refresh();
        if (
          controller.signal.aborted ||
          this.disposed ||
          session !== this.owner ||
          p.sessionId !== this.identity
        )
          return fail(
            "CANCELLED",
            "Session changed or request cancelled; output discarded",
          );
        if (!result.ok) return result;
        if (name === "save_project")
          return ok({
            ...envelope,
            ...this.download(
              result.value as Uint8Array,
              "application/zip",
              `${project.projectId}.zip`,
              project.revision,
            ),
          });
        const pose = result.value as { revision: number; png: Uint8Array };
        if (pose.png.length > 8388608)
          return fail(
            "LIMIT_EXCEEDED",
            "Pose exceeds 8 MiB inline limit; submit render_sequence and download artifact",
            pose.revision,
          );
        return ok({
          ...envelope,
          animationId: p.animationId,
          time: p.time,
          image: {
            type: "image",
            mimeType: "image/png",
            data: base64(pose.png),
          },
        });
      } finally {
        this.controllers.delete(controller);
        signal?.removeEventListener("abort", abort);
      }
    }
    return fail("UNSUPPORTED_CAPABILITY", "Tool unavailable");
  }
}
