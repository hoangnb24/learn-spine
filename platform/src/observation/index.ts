import type {
  Artifact,
  Job,
  JobRequest,
  Observation,
  ObservationRequest,
  Pose,
  Problem,
  ProjectBundle,
  Renderer,
  Result,
  Viewport,
} from "../model/types";
import { validate } from "../model";
import { evaluate } from "../engine";
import { PixiRenderer } from "../render";
import { fitCamera, validateViewport, type Bounds } from "../render/geometry";
import { zip } from "../storage/zip";
import { animationBounds } from "./bounds";
export const observationLimits = Object.freeze({
  activeJobs: 2,
  terminalJobs: 20,
  frames: 300,
  backingDimension: 4096,
  rgbaBytes: 256 * 1024 * 1024,
  retainedBytes: 256 * 1024 * 1024,
  snapshotBytes: 200 * 1024 * 1024,
});
const ok = <T>(value: T): Result<T> => ({ ok: true, value, warnings: [] });
const fail = (
  code: Problem["code"],
  message: string,
  path = "",
): Result<never> => ({ ok: false, error: { code, message, path } });
/** #73 compatibility guard; #74 replaces this only when canonical targets are supported. */
function unsupportedTarget(input: unknown): Result<never> | undefined {
  if (input && typeof input === "object") {
    for (const field of ["target", "compositionId"])
      if (field in input) return fail("UNSUPPORTED_CAPABILITY", "Observation currently accepts legacy animation requests only", `/${field}`);
  }
}
function take<T>(r: Result<T>): T {
  if (!r.ok) throw r.error;
  return r.value;
}
function problem(e: unknown): Problem {
  return e && typeof e === "object" && "code" in e && "path" in e
    ? (e as Problem)
    : {
        code: "RENDER_FAILED",
        path: "",
        message: e instanceof Error ? e.message : "Observation failed",
      };
}
function check(s?: AbortSignal) {
  if (s?.aborted) take(fail("CANCELLED", "Cancelled"));
}
const pause = () => new Promise<void>((r) => setTimeout(r, 0));
const hash = async (b: Uint8Array) =>
  Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array(b))),
    (n) => n.toString(16).padStart(2, "0"),
  ).join("");
export interface FrameMetadata {
  projectId: string;
  revision: number;
  animationId: string | null;
  time: number;
  sampledTime: number;
  viewport: Viewport;
  bounds: Bounds | null;
  scale: number;
  pixelWidth: number;
  pixelHeight: number;
}
export interface Manifest {
  version: 1;
  projectId: string;
  revision: number;
  kind: "sequence" | "preview";
  fps: number | null;
  frames: (FrameMetadata & { file: string; artifactId: string })[];
  fit: "continuous-animation-envelope";
}
export interface PoseOutput {
  revision: number;
  png: Uint8Array;
  metadata: FrameMetadata;
}
export type RendererFactory = () => Promise<Result<Renderer>>;
interface Entry {
  job: Job;
  controller: AbortController;
  artifacts: Map<string, Uint8Array>;
  manifest?: Manifest;
}
export class ObservationService implements Observation {
  private listeners = new Set<(id: string) => void>();
  onRelease(listener: (id: string) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  private jobs = new Map<string, Entry>();
  private disposed = false;
  private poses = new Set<AbortController>();
  private executing = new Set<string>();
  constructor(private factory: RendererFactory = () => PixiRenderer.create()) {}
  private active() {
    return (
      this.poses.size +
      new Set([
        ...this.executing,
        ...[...this.jobs.values()]
          .filter((r) => ["queued", "running"].includes(r.job.status))
          .map((r) => r.job.id),
      ]).size
    );
  }
  private snapshot(b: ProjectBundle): ProjectBundle {
    const project = take(validate(b?.project)),
      assets = new Map<string, Uint8Array>();
    let total = 0;
    for (const a of project.assets) {
      const bytes = b.assets?.get(a.id);
      if (!(bytes instanceof Uint8Array))
        take(fail("MISSING_REFERENCE", "Missing asset bytes", "/assets"));
      total += bytes!.byteLength;
      if (total > observationLimits.snapshotBytes)
        take(fail("LIMIT_EXCEEDED", "Snapshot exceeds 200 MiB"));
      assets.set(a.id, new Uint8Array(bytes!));
    }
    return { project, assets };
  }
  private viewport(v: Viewport, count: number) {
    take(validateViewport(v));
    const w = Math.round(v.width * v.devicePixelRatio),
      h = Math.round(v.height * v.devicePixelRatio);
    if (w > 4096 || h > 4096 || w * h * 4 * count > observationLimits.rgbaBytes)
      take(
        fail(
          "LIMIT_EXCEEDED",
          "4096 backing dimension / 256 MiB RGBA budget exceeded",
          "/viewport",
        ),
      );
  }
  private metadata(
    p: Pose,
    time: number,
    v: Viewport,
    bounds: Bounds | null,
  ): FrameMetadata {
    return {
      projectId: p.projectId,
      revision: p.revision,
      animationId: p.animationId,
      time,
      sampledTime: p.sampledTime,
      viewport: { ...v },
      bounds,
      scale: v.zoom,
      pixelWidth: Math.round(v.width * v.devicePixelRatio),
      pixelHeight: Math.round(v.height * v.devicePixelRatio),
    };
  }
  async renderPose(
    bundle: ProjectBundle,
    input: ObservationRequest,
    signal?: AbortSignal,
  ): Promise<Result<PoseOutput>> {
    let renderer: Renderer | undefined;
    const c = new AbortController(),
      abort = () => c.abort();
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    try {
      const unsupported = unsupportedTarget(input);
      if (unsupported) return unsupported;
      if (this.disposed) return fail("CANCELLED", "Observation disposed");
      if (this.active() >= 2)
        return fail("LIMIT_EXCEEDED", "At most two active observations");
      this.poses.add(c);
      check(c.signal);
      const b = this.snapshot(bundle),
        r = structuredClone(input);
      this.viewport(r.viewport, 1);
      const pose = take(
          evaluate(b.project, { animationId: r.animationId, time: r.time }),
        ),
        fit = take(fitCamera(b.project, [pose], r.viewport, 0));
      renderer = take(await this.factory());
      check(c.signal);
      take(await renderer.prepare(b, c.signal));
      const png = take(await renderer.capture(pose, r.viewport, c.signal));
      check(c.signal);
      return ok({
        revision: pose.revision,
        png: new Uint8Array(png),
        metadata: this.metadata(pose, r.time, r.viewport, fit.bounds),
      });
    } catch (e) {
      return { ok: false, error: problem(e) };
    } finally {
      renderer?.dispose();
      this.poses.delete(c);
      signal?.removeEventListener("abort", abort);
    }
  }
  submit(bundle: ProjectBundle, input: JobRequest): Result<Job> {
    try {
      const unsupported = unsupportedTarget(input);
      if (unsupported) return unsupported;
      if (this.disposed) return fail("CANCELLED", "Observation disposed");
      if (this.active() >= 2)
        return fail("LIMIT_EXCEEDED", "At most two active observations");
      const r = structuredClone(input),
        b = this.snapshot(bundle),
        a = b.project.animations.find((a) => a.id === r.animationId);
      if (!a)
        return fail(
          "MISSING_REFERENCE",
          "Animation does not exist",
          "/animationId",
        );
      let times: number[];
      if (r.kind === "sequence") {
        if (
          !Array.isArray(r.times) ||
          r.times.length < 1 ||
          r.times.length > 300 ||
          !r.times.every(Number.isFinite)
        )
          return fail("INVALID_INPUT", "Supply 1–300 finite times", "/times");
        times = r.times;
      } else if (r.kind === "preview") {
        if (
          !Number.isInteger(r.fps) ||
          r.fps < 1 ||
          r.fps > 60 ||
          !Number.isInteger(r.loops) ||
          r.loops < 1 ||
          r.loops > 3 ||
          (r.loops > 1 && !a.loop)
        )
          return fail(
            "INVALID_INPUT",
            "fps 1–60; loops 1–3; multiple loops require looping animation",
          );
        const n = Math.ceil(r.fps * r.loops * a.duration);
        if (n > 300)
          return fail("LIMIT_EXCEEDED", "Preview exceeds 300 frames");
        times = Array.from({ length: n }, (_, i) => i / r.fps);
      } else return fail("INVALID_INPUT", "Unknown observation kind", "/kind");
      this.viewport(r.viewport, times.length);
      const job: Job = {
        id: crypto.randomUUID(),
        projectId: b.project.projectId,
        revision: b.project.revision,
        progress: 0,
        status: "queued",
      };
      const entry: Entry = {
        job,
        controller: new AbortController(),
        artifacts: new Map(),
      };
      this.jobs.set(job.id, entry);
      this.executing.add(job.id);
      setTimeout(() => void this.run(entry, b, r, times), 0);
      return ok(structuredClone(job));
    } catch (e) {
      return { ok: false, error: problem(e) };
    }
  }
  private async run(
    e: Entry,
    b: ProjectBundle,
    r: JobRequest,
    times: number[],
  ) {
    let renderer: Renderer | undefined;
    const signal = e.controller.signal;
    this.executing.add(e.job.id);
    try {
      check(signal);
      e.job = { ...e.job, status: "running" };
      const poses: Pose[] = [];
      for (const time of times) {
        check(signal);
        poses.push(
          take(evaluate(b.project, { animationId: r.animationId, time })),
        );
        await pause();
      }
      const padding = Math.min(
          24,
          Math.min(r.viewport.width, r.viewport.height) / 4,
        ),
        fit = take(fitCamera(b.project, poses, r.viewport, padding)),
        bounds = animationBounds(b.project, r.animationId);
      let viewport = fit.viewport;
      if (bounds) {
        if (!Object.values(bounds).every(Number.isFinite))
          take(fail("INVALID_INPUT", "Animation bounds overflow"));
        viewport = {
          ...viewport,
          centerX: bounds.minX / 2 + bounds.maxX / 2,
          centerY: bounds.minY / 2 + bounds.maxY / 2,
          zoom: Math.min(
            (viewport.width - 2 * padding) /
              Math.max(1, bounds.maxX - bounds.minX),
            (viewport.height - 2 * padding) /
              Math.max(1, bounds.maxY - bounds.minY),
          ),
        };
        take(validateViewport(viewport));
      }
      renderer = take(await this.factory());
      check(signal);
      take(await renderer.prepare(b, signal));
      const artifacts: Artifact[] = [],
        files = new Map<string, Uint8Array>(),
        pending = new Map<string, Uint8Array>();
      let size = 0;
      const manifest: Manifest = {
        version: 1,
        projectId: e.job.projectId,
        revision: e.job.revision,
        kind: r.kind,
        fps: r.kind === "preview" ? r.fps : null,
        fit: "continuous-animation-envelope",
        frames: [],
      };
      const add = async (bytes: Uint8Array, mimeType: Artifact["mimeType"]) => {
        size += bytes.length;
        if (size > observationLimits.retainedBytes)
          take(fail("LIMIT_EXCEEDED", "Output exceeds 256 MiB"));
        const a = {
          id: crypto.randomUUID(),
          mimeType,
          byteLength: bytes.length,
          sha256: await hash(bytes),
        };
        check(signal);
        pending.set(a.id, new Uint8Array(bytes));
        artifacts.push(a);
        return a.id;
      };
      for (let i = 0; i < poses.length; i++) {
        check(signal);
        const png = take(await renderer.capture(poses[i], viewport, signal));
        check(signal);
        const artifactId = await add(png, "image/png"),
          file = `frame-${String(i).padStart(4, "0")}.png`;
        files.set(file, png);
        manifest.frames.push({
          ...this.metadata(poses[i], times[i], viewport, bounds),
          file,
          artifactId,
        });
        e.job = { ...e.job, progress: (i + 1) / (poses.length + 1) };
        await pause();
      }
      files.set(
        "manifest.json",
        new TextEncoder().encode(JSON.stringify(manifest, null, 2)),
      );
      check(signal);
      await add(zip(files), "application/zip");
      check(signal);
      e.artifacts = pending;
      e.manifest = manifest;
      e.job = { ...e.job, status: "succeeded", progress: 1, artifacts };
    } catch (error) {
      if (e.job.status !== "cancelled")
        e.job = signal.aborted
          ? { ...e.job, status: "cancelled" }
          : { ...e.job, status: "failed", error: problem(error) };
      e.artifacts.clear();
    } finally {
      renderer?.dispose();
      this.executing.delete(e.job.id);
      if (this.jobs.has(e.job.id)) {
        this.jobs.delete(e.job.id);
        this.jobs.set(e.job.id, e);
      }
      this.evict();
    }
  }
  get(id: string): Result<Job> {
    const e = this.jobs.get(id);
    return e
      ? ok(structuredClone(e.job))
      : fail("JOB_NOT_FOUND", "Unknown or expired job");
  }
  cancel(id: string): Result<Job> {
    const e = this.jobs.get(id);
    if (!e) return fail("JOB_NOT_FOUND", "Unknown or expired job");
    if (["queued", "running"].includes(e.job.status)) {
      e.controller.abort();
      e.job = { ...e.job, status: "cancelled" };
      e.artifacts.clear();
      this.evict();
    }
    return ok(structuredClone(e.job));
  }
  async readArtifact(id: string): Promise<Result<Uint8Array>> {
    for (const e of this.jobs.values()) {
      const bytes = e.artifacts.get(id);
      if (bytes) return ok(new Uint8Array(bytes));
    }
    return fail("JOB_NOT_FOUND", "Unknown or expired artifact");
  }
  getManifest(id: string): Result<Manifest> {
    const e = this.jobs.get(id);
    return e?.manifest
      ? ok(structuredClone(e.manifest))
      : fail("JOB_NOT_FOUND", "No completed manifest");
  }
  release(id: string): Result<void> {
    const e = this.jobs.get(id);
    if (!e) return fail("JOB_NOT_FOUND", "Unknown or expired job");
    this.cancel(id);
    e.artifacts.clear();
    this.jobs.delete(id);
    for (const listener of this.listeners) listener(id);
    return ok(undefined);
  }
  private evict() {
    const terminal = [...this.jobs.values()].filter(
      (e) => !["queued", "running"].includes(e.job.status),
    );
    let total = [...this.jobs.values()].reduce(
      (n, e) => n + [...e.artifacts.values()].reduce((n, b) => n + b.length, 0),
      0,
    );
    while (terminal.length > 20 || total > observationLimits.retainedBytes) {
      const e = terminal.shift();
      if (!e) break;
      total -= [...e.artifacts.values()].reduce((n, b) => n + b.length, 0);
      e.artifacts.clear();
      this.jobs.delete(e.job.id);
      for (const listener of this.listeners) listener(e.job.id);
    }
  }
  dispose() {
    this.disposed = true;
    for (const c of this.poses) c.abort();
    for (const id of this.jobs.keys()) this.release(id);
  }
}
