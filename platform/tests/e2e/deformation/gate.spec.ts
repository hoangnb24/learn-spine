import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
const run = process.env.GATE2_RUN ?? "run-01";
const output = fileURLToPath(
  new URL(
    `../../../../docs/product/results/experiment-2/${run}/`,
    import.meta.url,
  ),
);
mkdirSync(output, { recursive: true });
const save = (name: string, value: unknown) =>
  writeFileSync(resolve(output, name), JSON.stringify(value, null, 2));
async function instrument(page: Page) {
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
async function drawn(page: Page) {
  return page.evaluate(() => (window as any).__gate2.latest);
}
async function seek(page: Page, app: "editor" | "player", time: number) {
  if (app === "editor")
    await page
      .getByLabel("Thời gian (giây)", { exact: true })
      .fill(String(time));
  else
    await page
      .getByLabel("Thanh thời gian", { exact: true })
      .evaluate((node: any, value) => {
        node.step = "any";
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )!.set!.call(node, String(value));
        node.dispatchEvent(new Event("input", { bubbles: true }));
        node.dispatchEvent(new Event("change", { bubbles: true }));
      }, time);
  const effectiveInput = Number(
    await page
      .getByLabel(app === "editor" ? "Thời gian (giây)" : "Thanh thời gian", {
        exact: true,
      })
      .inputValue(),
  );
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
function delta(a: any, b: any) {
  const av = numbers(a),
    bv = numbers(b);
  expect(av.length).toBe(bv.length);
  return Math.max(0, ...av.map((n, i) => Math.abs(n - bv[i])));
}
async function playback(page: Page, app: "editor" | "player", kind: string) {
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
async function perf(page: Page, app: string, kind: string) {
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
for (const kind of ["scarf", "jelly", "ik"] as const)
  test(`Gate2 ${kind} authored and measured`, async ({ page, browser }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/tests/e2e/deformation/index.html");
    await instrument(page);
    const project = await page.evaluate(
      (kind) => window.gate2.author(kind),
      kind,
    );
    save(`${kind}-project.json`, project);
    await expect(page.locator(".stage")).toHaveAttribute(
      "data-rendered-revision",
      String(project.revision),
    );
    const measured = await page.evaluate(() => window.gate2.measure());
    save(`${kind}-measurements.json`, measured);
    expect
      .soft(measured.report.passed, JSON.stringify(measured.report))
      .toBe(true);
    expect.soft(measured.loop.maxPositionError).toBeLessThanOrEqual(0.5);
    expect.soft(measured.loop.maxVelocityThresholdRatio).toBeLessThanOrEqual(1);
    if (measured.eyes) {
      const errors = measured.eyes.samples.flatMap((s) =>
        s.map((eye, i) =>
          Math.abs(eye.height / measured.eyes!.canonical[i].height - 1),
        ),
      );
      save("jelly-eye-heights.json", {
        maxRelativeChange: Math.max(...errors),
        errors,
      });
      expect.soft(Math.max(...errors)).toBeLessThanOrEqual(0.05);
    }
    const sequences = await page.evaluate(() => window.gate2.sequence());
    const seqdir = resolve(output, `${kind}-sequence`);
    mkdirSync(seqdir, { recursive: true });
    for (const [f, frame] of sequences.frames.entries())
      writeFileSync(
        resolve(seqdir, `${String(f).padStart(3, "0")}.png`),
        Buffer.from(frame.png.split(",")[1], "base64"),
      );
    save(`${kind}-sequence.json`, {
      view: sequences.view,
      times: sequences.frames.map((f) => f.time),
    });
    const zip = resolve(output, `${kind}.zip`),
      downloaded = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Tải gói project", exact: true })
      .click();
    await (await downloaded).saveAs(zip);
    const playbackResult = await playback(page, "editor", kind);
    await page.screenshot({ path: resolve(output, `${kind}-editor.png`) });
    const perfResult = await perf(page, "editor", kind);
    const half = await page.evaluate(async () => {
      const h = window.gate2,
        before = h.runtime.session!.inspect(),
        after = await h.replaceHalf(),
        measure = await h.measure();
      return {
        before,
        after,
        measure,
        equal:
          JSON.stringify(h.semantics(before)) ===
          JSON.stringify(h.semantics(after)),
      };
    });
    save(`${kind}-half.json`, half);
    expect(half.equal).toBe(true);
    for (let i = 0; i < measured.samples.length; i++)
      expect(delta(measured.samples[i], half.measure.samples[i])).toBe(0);
    const halfSeq = await page.evaluate(() => window.gate2.sequence(true));
    for (const i of [0, 15, 30, 45, 60]) {
      const frame = halfSeq.frames[i];
      if (frame)
        writeFileSync(
          resolve(output, `${kind}-half-${i}.png`),
          Buffer.from(frame.png.split(",")[1], "base64"),
        );
    }
    const hd = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Tải gói project", exact: true })
      .click();
    await (await hd).saveAs(resolve(output, `${kind}-half.zip`));
    // Close original editor; fresh page imports exported full ZIP.
    await page.close();
    const reopened = await browser.newPage();
    await reopened.goto("/tests/e2e/deformation/index.html");
    await instrument(reopened);
    await reopened
      .getByLabel("Mở gói project", { exact: true })
      .setInputFiles(zip);
    await expect
      .poll(() =>
        reopened.evaluate(() => window.gate2.runtime.session?.inspect()),
      )
      .toEqual(project);
    await reopened.close();
    const context = await browser.newContext({
        viewport: { width: 1900, height: 1300 },
        deviceScaleFactor: 1,
      }),
      player = await context.newPage();
    const requests: string[] = [];
    player.on("request", (r) => requests.push(r.url()));
    player.on("pageerror", (e) => errors.push(e.message));
    await player.goto("http://127.0.0.1:4196/player.html");
    await instrument(player);
    await player
      .getByLabel("Mở gói project", { exact: true })
      .setInputFiles(zip);
    await expect(player.locator(".stage")).toHaveAttribute(
      "data-rendered-revision",
      String(project.revision),
    );
    const playerSamples = [];
    for (const time of [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75]) {
      const actual = await seek(player, "player", time);
      const ref = await player.evaluate(
        async ({ project, time }) => {
          const path = "/src/engine/index.ts";
          const { evaluate } = await import(/* @vite-ignore */ path);
          const r = evaluate(project, { animationId: "cycle", time });
          if (!r.ok) throw Error(JSON.stringify(r));
          return r.value;
        },
        { project, time },
      );
      expect(delta(ref, actual.pose)).toBeLessThanOrEqual(1e-5);
      playerSamples.push(actual);
    }
    const playerPlayback = await playback(player, "player", kind);
    await player.screenshot({ path: resolve(output, `${kind}-player.png`) });
    const playerPerf = await perf(player, "player", kind);
    expect(requests.filter((u) => /apps\/editor|exercises\//.test(u))).toEqual(
      [],
    );
    expect(errors).toEqual([]);
    save(`${kind}-result.json`, {
      sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim(),
      protocolCommit: "d836e8c87c5a8a095d9e5761ff87ef6991f7e7b6",
      browser: browser.version(),
      classification: "public commands + browser UI; no native WebMCP claim",
      playbackResult,
      perfResult,
      playerPlayback,
      playerPerf,
      playerSamples,
      requests,
      errors,
      physics: "NOT TESTED",
    });
    await context.close();
  });
