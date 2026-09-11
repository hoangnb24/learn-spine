import { test, expect } from "@playwright/test";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";
const out = resolve("../docs/product/results/experiment-1");
test("separate capture overhead and scheduler control", async ({ page }) => {
  await page.goto("/");
  await page
    .getByLabel("Mở gói project", { exact: true })
    .setInputFiles(resolve("fixtures/robot/native-project.zip"));
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    "5",
  );
  const overhead = await page.evaluate(async () => {
    const rp = "/apps/editor/runtime.ts",
      op = "/src/observation/index.ts",
      ep = "/src/engine/index.ts",
      renderPath = "/src/render/index.ts";
    const { editorRuntime: r } = await import(/* @vite-ignore */ rp),
      { ObservationService } = await import(/* @vite-ignore */ op),
      { evaluate } = await import(/* @vite-ignore */ ep),
      { PixiRenderer, fitCamera } = await import(/* @vite-ignore */ renderPath);
    const bundle = r.session.snapshot(),
      times = Array.from({ length: 12 }, (_, i) => (i * 4) / 12),
      view = {
        width: 1280,
        height: 720,
        centerX: 0,
        centerY: 300,
        zoom: 1,
        devicePixelRatio: 1,
        background: "#253542",
      };
    const unwrap = (x: any) => {
      if (!x.ok) throw Error(JSON.stringify(x));
      return x.value;
    };
    const renderer = unwrap(await PixiRenderer.create());
    unwrap(await renderer.prepare(bundle));
    const poses = times.map((time) =>
        unwrap(evaluate(bundle.project, { animationId: "wave", time })),
      ),
      viewport = unwrap(fitCamera(bundle.project, poses, view, 32)).viewport;
    // Prepared renderer: isolate encode/readback overhead from initialization/decode.
    const draws: number[] = [],
      captures: number[] = [],
      sizes: number[] = [];
    for (const pose of poses) {
      const t = performance.now();
      unwrap(renderer.draw(pose, viewport));
      draws.push(performance.now() - t);
    }
    for (const pose of poses) {
      const t = performance.now(),
        bytes = unwrap(await renderer.capture(pose, viewport));
      captures.push(performance.now() - t);
      sizes.push(bytes.length);
    }
    renderer.dispose();
    // Full public observation sequence: initialization, snapshot, decode, fitting and encoding.
    const observation = new ObservationService(),
      start = performance.now(),
      job = unwrap(
        observation.submit(bundle, {
          kind: "sequence",
          animationId: "wave",
          times,
          viewport: view,
        }),
      );
    let state = job;
    while (state.status === "queued" || state.status === "running") {
      await new Promise((r) => setTimeout(r, 10));
      state = unwrap(observation.get(job.id));
    }
    const wallMs = performance.now() - start;
    if (state.status !== "succeeded") throw Error(JSON.stringify(state));
    const manifest = unwrap(observation.getManifest(job.id));
    observation.release(job.id);
    return {
      revision: bundle.project.revision,
      viewport,
      draws,
      captures,
      sizes,
      publicSequenceWallMs: wallMs,
      publicSequenceFrames: manifest.frames.length,
      pollingResolutionMs: 10,
      measurement: "separate run; never included in no-capture frame gate",
    };
  });
  writeFileSync(
    resolve(out, "capture-overhead.json"),
    JSON.stringify(overhead, null, 2),
  );
  expect(overhead.publicSequenceFrames).toBe(12);
  expect(overhead.revision).toBe(5);
  // No editor/evaluator/renderer at all: isolate host rAF cadence as a diagnostic,
  // not an alternate threshold and never a substitute gate pass.
  await page.goto("about:blank");
  await page.waitForTimeout(5000);
  const control = await page.evaluate(
    () =>
      new Promise<any>((resolve) => {
        const times: number[] = [],
          start = performance.now();
        function frame(t: number) {
          times.push(t);
          if (t - start < 30000) requestAnimationFrame(frame);
          else
            resolve({
              start,
              end: performance.now(),
              times,
              userAgent: navigator.userAgent,
            });
        }
        requestAnimationFrame(frame);
      }),
  );
  const intervals = control.times
    .slice(1)
    .map((t: number, i: number) => t - control.times[i]);
  writeFileSync(
    resolve(out, "scheduler-control.json"),
    JSON.stringify(
      {
        ...control,
        intervals,
        p95Ms: intervals.slice().sort((a: number, b: number) => a - b)[
          Math.ceil(intervals.length * 0.95) - 1
        ],
      },
      null,
      2,
    ),
  );
});
