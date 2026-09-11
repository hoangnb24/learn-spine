import { expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
const run = process.env.GATE2_RUN ?? "run-01";
export const output = fileURLToPath(
  new URL(
    `../../../../docs/product/results/experiment-2/${run}/`,
    import.meta.url,
  ),
);
mkdirSync(output, { recursive: true });
export const save = (name: string, value: unknown) =>
  writeFileSync(resolve(output, name), JSON.stringify(value, null, 2));
export async function instrument(page: Page) {
  await page.evaluate(async () => {
    const path = "/src/render/index.ts";
    const { PixiRenderer } = await import(/* @vite-ignore */ path);
    const state: any = {
      latest: null,
      playback: false,
      perf: false,
      poses: [],
      draws: [],
    };
    (window as any).__gate2 = state;
    const original = PixiRenderer.prototype.draw;
    PixiRenderer.prototype.draw = function (pose: any, viewport: any) {
      const start = performance.now(),
        result = original.call(this, pose, viewport),
        end = performance.now();
      if (state.perf)
        state.draws.push({
          start,
          end,
          cpuMs: end - start,
          time: pose.sampledTime,
        });
      else {
        state.latest = { pose: structuredClone(pose), viewport, ok: result.ok };
        if (state.playback)
          state.poses.push({
            at: start,
            pose: structuredClone(pose),
            ok: result.ok,
          });
      }
      return result;
    };
  });
  await page.addStyleTag({
    content:
      ".stage{width:1280px!important;height:720px!important;flex:none!important;min-width:1280px!important;min-height:720px!important}",
  });
}
export async function drawn(page: Page) {
  return page.evaluate(() => (window as any).__gate2.latest);
}
export async function seek(page: Page, app: "editor" | "player", time: number) {
  // Read the browser-accepted value before dispatch. Editor formats its displayed
  // value to 2 decimals after React handles the event; that display is not its time.
  const effectiveInput = await page
    .getByLabel(app === "editor" ? "Thời gian (giây)" : "Thanh thời gian", {
      exact: true,
    })
    .evaluate((node: HTMLInputElement, value) => {
      if (node.type === "range") node.step = "any";
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(node, String(value));
      const accepted = Number(node.value);
      node.dispatchEvent(new Event("input", { bubbles: true }));
      node.dispatchEvent(new Event("change", { bubbles: true }));
      return accepted;
    }, time);
  const normalizedTime = ((effectiveInput % 2) + 2) % 2;
  await expect
    .poll(async () => (await drawn(page))?.pose.sampledTime)
    .toBeCloseTo(normalizedTime, 8);
  return {
    ...(await drawn(page)),
    requestedTime: time,
    effectiveInput,
    normalizedTime,
  };
}
const numbers = (p: any) =>
  [
    ...Object.values(p.bones).flat(),
    ...p.meshes.flatMap((m: any) => m.vertices),
    ...p.regions.flatMap((r: any) => r.world),
  ] as number[];
export function delta(a: any, b: any) {
  const av = numbers(a),
    bv = numbers(b);
  expect(av.length).toBe(bv.length);
  return Math.max(0, ...av.map((n, i) => Math.abs(n - bv[i])));
}
export async function playback(
  page: Page,
  app: "editor" | "player",
  kind: string,
) {
  const initial = await seek(page, app, 0);
  await page.evaluate(() => {
    const s = (window as any).__gate2;
    s.playback = true;
    s.poses = [
      {
        at: performance.now(),
        pose: structuredClone(s.latest.pose),
        ok: s.latest.ok,
      },
    ];
    const stream = document.querySelector("canvas")!.captureStream(30);
    s.videoChunks = [];
    s.recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });
    s.recorder.ondataavailable = (e: any) => s.videoChunks.push(e.data);
    s.recorder.start();
  });
  await page.getByRole("button", { name: "Phát", exact: true }).click();
  await page.waitForTimeout(6500);
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  const capture = await page.evaluate(
    () =>
      new Promise<any>((resolve) => {
        const s = (window as any).__gate2;
        s.playback = false;
        s.recorder.onstop = async () => {
          const bytes = new Uint8Array(
            await new Blob(s.videoChunks, { type: "video/webm" }).arrayBuffer(),
          );
          s.recorder.stream.getTracks().forEach((t: any) => t.stop());
          resolve({ frames: s.poses, bytes: Array.from(bytes) });
        };
        s.recorder.stop();
      }),
  );
  const frames = capture.frames;
  writeFileSync(
    resolve(output, `${kind}-${app}-playback.webm`),
    new Uint8Array(capture.bytes),
  );
  save(`${kind}-${app}-playback.json`, frames);
  expect(frames.length).toBeGreaterThan(120);
  expect(frames.every((f: any) => f.ok)).toBe(true);
  const wraps = frames.filter(
    (f: any, i: number) =>
      i > 0 && f.pose.sampledTime < frames[i - 1].pose.sampledTime,
  );
  expect(wraps.length).toBeGreaterThanOrEqual(3);
  // First forward cycle is an actual successful draw stream, not evaluator snapshots.
  const first = frames
    .slice(0, frames.indexOf(wraps[0]))
    .filter((f: any) => f.pose.sampledTime > 0);
  const indices = [
    7, 1, 15, 3, 19, 0, 12, 5, 17, 9, 2, 14, 6, 18, 10, 4, 16, 8, 13, 11,
  ];
  const comparisons = [];
  for (const index of indices) {
    const ref = first[Math.floor((index * (first.length - 1)) / 19)],
      actual = await seek(page, app, ref.pose.sampledTime);
    const reference = actual.normalizedTime === 0 ? initial : ref;
    comparisons.push({
      requestedTime: ref.pose.sampledTime,
      effectiveInput: actual.effectiveInput,
      normalizedTime: actual.normalizedTime,
      referenceTime: reference.pose.sampledTime,
      referenceSource:
        actual.normalizedTime === 0
          ? "recorded initial successful draw"
          : "recorded forward first-cycle draw",
      requestedReferenceDelta: delta(ref.pose, actual.pose),
      delta: delta(reference.pose, actual.pose),
    });
  }
  save(`${kind}-${app}-seeks.json`, comparisons);
  expect(Math.max(...comparisons.map((c) => c.delta))).toBeLessThanOrEqual(
    1e-5,
  );
  // Regression for native range sanitization at the loop endpoint; expected pose
  // comes from the recorded initial draw, never from a second evaluator seek.
  const boundary = await seek(page, app, 2 - 4 * Number.EPSILON);
  const boundaryComparison = {
    requestedTime: boundary.requestedTime,
    effectiveInput: boundary.effectiveInput,
    normalizedTime: boundary.normalizedTime,
    referenceTime: initial.pose.sampledTime,
    delta: delta(initial.pose, boundary.pose),
  };
  save(`${kind}-${app}-boundary-seek.json`, boundaryComparison);
  expect(boundaryComparison.delta).toBeLessThanOrEqual(1e-5);
  return {
    frames: frames.length,
    wraps: wraps.length,
    comparisons,
    boundaryComparison,
  };
}
export async function perf(page: Page, app: string, kind: string) {
  await page.getByRole("button", { name: "Phát", exact: true }).click();
  await page.waitForTimeout(5000);
  const raw = await page.evaluate(
    () =>
      new Promise<any>((resolve) => {
        const s = (window as any).__gate2;
        s.draws = [];
        s.perf = true;
        const start = performance.now(),
          raf: number[] = [];
        function tick(now: number) {
          raf.push(now);
          if (now - start < 30000) requestAnimationFrame(tick);
          else {
            s.perf = false;
            const c = document.querySelector("canvas")!,
              gl = (c.getContext("webgl2") ||
                c.getContext("webgl")) as WebGLRenderingContext,
              ext = gl.getExtension("WEBGL_debug_renderer_info");
            resolve({
              start,
              end: performance.now(),
              raf,
              draws: s.draws,
              canvas: [c.width, c.height],
              gpu: ext
                ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
                : "unavailable",
              userAgent: navigator.userAgent,
              visibility: document.visibilityState,
            });
          }
        }
        requestAnimationFrame(tick);
      }),
  );
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  const intervals = (a: number[]) => a.slice(1).map((n, i) => n - a[i]),
    p95 = (a: number[]) =>
      a.slice().sort((a, b) => a - b)[Math.ceil(a.length * 0.95) - 1];
  const summary = {
    duration: raw.end - raw.start,
    frames: raw.draws.length,
    p95RafIntervalMs: p95(intervals(raw.raf)),
    p95DrawIntervalMs: p95(intervals(raw.draws.map((d: any) => d.start))),
    p95CpuSubmissionMs: p95(raw.draws.map((d: any) => d.cpuMs)),
    physicalPresentation: "unavailable",
    performanceGate: "not specified for Gate2; report only",
    instrumentation:
      "draw timing excludes cloning; record numeric timestamps only; screenshots/sequence/encoding outside window; browser video inactive; MediaRecorder stopped and tracks released before warmup",
  };
  save(`${kind}-${app}-performance.json`, { summary, raw });
  expect(raw.canvas).toEqual([1280, 720]);
  return summary;
}
