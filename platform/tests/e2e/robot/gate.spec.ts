import { test, expect, type Page } from "@playwright/test";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
const output = resolve("../docs/product/results/experiment-1"),
  fixture = resolve("fixtures/robot/native-project.zip"),
  runtime = "/apps/editor/runtime.ts";
mkdirSync(output, { recursive: true });
// Record only the real application's drawn pose; no replacement evaluator or project.
async function instrument(page: Page) {
  await page.evaluate(async () => {
    const path = "/src/render/index.ts";
    const { PixiRenderer } = await import(/* @vite-ignore */ path);
    const state: any = { draws: [], latest: null, record: false };
    (window as any).__gate = state;
    const draw = PixiRenderer.prototype.draw;
    PixiRenderer.prototype.draw = function (pose: any, viewport: any) {
      const start = performance.now(),
        result = draw.call(this, pose, viewport),
        end = performance.now();
      state.latest = {
        pose: structuredClone(pose),
        viewport: structuredClone(viewport),
        ok: result.ok,
      };
      if (state.record)
        state.draws.push({
          start,
          end,
          cpuMs: end - start,
          time: pose.sampledTime,
          revision: pose.revision,
          animationId: pose.animationId,
        });
      return result;
    };
  });
  await page.addStyleTag({
    content:
      ".stage{width:1280px!important;height:720px!important;flex:none!important;min-width:1280px!important;min-height:720px!important}",
  });
}
const inspect = (p: Page) =>
  p.evaluate(
    async (path) =>
      (await import(/* @vite-ignore */ path)).editorRuntime.session?.inspect(),
    runtime,
  );
const stage = (p: Page) => p.evaluate(() => (window as any).__gate.latest);
async function setTime(p: Page, app: string, time: number) {
  if (app === "editor")
    await p.getByLabel("Thời gian (giây)", { exact: true }).fill(String(time));
  else
    await p
      .getByLabel("Thanh thời gian", { exact: true })
      .evaluate((node: any, value) => {
        node.setAttribute("step", "any");
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )!.set!.call(node, String(value));
        node.dispatchEvent(new Event("input", { bubbles: true }));
        node.dispatchEvent(new Event("change", { bubbles: true }));
      }, time);
  await expect
    .poll(async () => (await stage(p))?.pose.sampledTime)
    .toBeCloseTo(time, 8);
}
async function samples(p: Page, app: string) {
  const result: any = {};
  for (const [animationId, duration] of [
    ["idle", 2],
    ["wave", 4],
  ] as const) {
    if (app === "editor")
      await p
        .getByRole("button", {
          name: animationId === "idle" ? "Idle" : "Wave",
          exact: true,
        })
        .click();
    else await p.getByLabel("Chọn chuyển động").selectOption(animationId);
    await expect
      .poll(async () => (await stage(p))?.pose.animationId)
      .toBe(animationId);
    result[animationId] = [];
    for (let i = 0; i < 12; i++) {
      await setTime(p, app, (i * duration) / 12);
      const actual = await stage(p);
      expect(actual.ok).toBe(true);
      expect(actual.viewport.width).toBe(1280);
      expect(actual.viewport.height).toBe(720);
      expect(actual.pose.regions).toHaveLength(15);
      const filename = `${app}-${animationId}-${String(i).padStart(2, "0")}.png`;
      const data = await p
        .locator("canvas")
        .evaluate((c: HTMLCanvasElement) => c.toDataURL("image/png"));
      writeFileSync(
        resolve(output, filename),
        Buffer.from(data.split(",")[1], "base64"),
      );
      result[animationId].push({ ...actual, filename });
    }
  }
  return result;
}
const p95 = (v: number[]) =>
  v.slice().sort((a, b) => a - b)[Math.ceil(v.length * 0.95) - 1];
async function performanceRun(p: Page, app: string) {
  if (app === "editor")
    await p.getByRole("button", { name: "Wave", exact: true }).click();
  else await p.getByLabel("Chọn chuyển động").selectOption("wave");
  await p.getByRole("button", { name: "Phát", exact: true }).click();
  await p.waitForTimeout(5000);
  const raw = await p.evaluate(
    () =>
      new Promise<any>((resolve) => {
        const s = (window as any).__gate;
        s.draws = [];
        s.record = true;
        const raf: number[] = [],
          start = performance.now();
        function tick(now: number) {
          raf.push(now);
          if (now - start < 30000) requestAnimationFrame(tick);
          else {
            s.record = false;
            const c = document.querySelector("canvas")!,
              gl = (c.getContext("webgl2") ||
                c.getContext("webgl")) as WebGLRenderingContext,
              ext = gl?.getExtension("WEBGL_debug_renderer_info");
            resolve({
              start,
              end: performance.now(),
              raf,
              draws: s.draws,
              canvas: {
                width: c.width,
                height: c.height,
                cssWidth: c.clientWidth,
                cssHeight: c.clientHeight,
              },
              visibility: document.visibilityState,
              userAgent: navigator.userAgent,
              hardwareConcurrency: navigator.hardwareConcurrency,
              gpu: ext
                ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
                : "unavailable",
              vendor: ext
                ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)
                : "unavailable",
            });
          }
        }
        requestAnimationFrame(tick);
      }),
  );
  await p.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  const rafIntervals = raw.raf
      .slice(1)
      .map((x: number, i: number) => x - raw.raf[i]),
    drawIntervals = raw.draws
      .slice(1)
      .map((x: any, i: number) => x.start - raw.draws[i].start);
  const summary = {
    app,
    durationMs: raw.end - raw.start,
    frames: raw.draws.length,
    p95CpuSubmissionMs: p95(raw.draws.map((x: any) => x.cpuMs)),
    p95RafIntervalMs: p95(rafIntervals),
    p95RenderedUpdateIntervalMs: p95(drawIntervals),
    physicalPresentation: "unavailable in browser API",
    frameGatePassed: p95(rafIntervals) <= 16.7 && p95(drawIntervals) <= 16.7,
  };
  writeFileSync(
    resolve(output, `${app}-performance.json`),
    JSON.stringify({ summary, raw, rafIntervals, drawIntervals }, null, 2),
  );
  expect(raw.end - raw.start).toBeGreaterThanOrEqual(30000);
  expect(raw.canvas).toEqual({
    width: 1280,
    height: 720,
    cssWidth: 1280,
    cssHeight: 720,
  });
  return summary;
}
test("Gate 1 editor ZIP reopen and isolated player", async ({
  page,
  browser,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await instrument(page);
  await page
    .getByLabel("Mở gói project", { exact: true })
    .setInputFiles(fixture);
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    "5",
  );
  const original = await inspect(page);
  const history = await page.evaluate(async (path) => {
    const { editorRuntime: r } = await import(/* @vite-ignore */ path),
      before = r.session.inspect(),
      animation = structuredClone(before.animations[0]);
    for (const c of animation.channels) c.keys[1].value += 0.01;
    const applied = r.session.apply({
        ...r.request(),
        operations: [{ kind: "putAnimation", value: animation }],
      }),
      changed = r.session.inspect();
    const undone = r.session.undo(r.request()),
      undo = r.session.inspect(),
      redone = r.session.redo(r.request()),
      redo = r.session.inspect();
    r.session.undo(r.request());
    const restored = r.session.inspect();
    const invalid = r.session.apply({
      ...r.request(),
      operations: [
        {
          kind: "putBone",
          value: { ...before.bones[0], name: "must not commit" },
        },
        { kind: "remove", collection: "bones", id: "missing" },
      ],
    });
    return {
      before,
      applied,
      changed,
      undone,
      undo,
      redone,
      redo,
      restored,
      invalid,
      final: r.session.inspect(),
    };
  }, runtime);
  const content = (p: any) => ({ ...p, revision: 0 });
  expect(history.applied.ok && history.undone.ok && history.redone.ok).toBe(
    true,
  );
  expect(content(history.undo)).toEqual(content(original));
  expect(content(history.redo)).toEqual(content(history.changed));
  expect(content(history.restored)).toEqual(content(original));
  expect(history.invalid.ok).toBe(false);
  expect(history.final).toEqual(history.restored);
  await page
    .getByLabel("Mở gói project", { exact: true })
    .setInputFiles({
      name: "invalid.zip",
      mimeType: "application/zip",
      buffer: Buffer.from("invalid ZIP"),
    });
  await expect(page.getByRole("alert")).toBeVisible();
  expect(await inspect(page)).toEqual(history.final);
  await page
    .getByLabel("Mở gói project", { exact: true })
    .setInputFiles(fixture);
  await expect.poll(() => inspect(page)).toEqual(original);
  const editorSamples = await samples(page, "editor");
  // History tests changed autosave revision. This fresh native export remains portable.
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Tải gói project", exact: true })
    .click();
  const download = await downloading,
    exported = resolve(output, "editor-export.zip");
  await download.saveAs(exported);
  const editorPerf = await performanceRun(page, "editor");
  await page.screenshot({
    path: resolve(output, "editor-full.png"),
    fullPage: true,
  });
  const ctx = page.context();
  await page.close();
  const reopened = await ctx.newPage();
  await reopened.goto("/");
  await instrument(reopened);
  await reopened
    .getByLabel("Mở gói project", { exact: true })
    .setInputFiles(exported);
  await expect.poll(() => inspect(reopened)).toEqual(original);
  const recovered = await inspect(reopened);
  await reopened.close();
  const isolated = await browser.newContext({
      viewport: { width: 1900, height: 1300 },
      deviceScaleFactor: 1,
    }),
    player = await isolated.newPage(),
    requests: string[] = [];
  player.on("pageerror", (e) => errors.push(e.message));
  player.on("request", (r) => requests.push(r.url()));
  await player.goto("http://127.0.0.1:4184/player.html");
  await instrument(player);
  await player
    .getByLabel("Mở gói project", { exact: true })
    .setInputFiles(exported);
  await expect(player.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    "5",
  );
  const playerSamples = await samples(player, "player");
  let maxDelta = 0;
  const matches: any[] = [];
  for (const id of ["idle", "wave"])
    for (let i = 0; i < 12; i++) {
      const e = editorSamples[id][i],
        p = playerSamples[id][i];
      expect(p.viewport).toEqual(e.viewport);
      expect(p.pose.projectId).toBe(e.pose.projectId);
      expect(p.pose.revision).toBe(e.pose.revision);
      expect(Object.keys(p.pose.bones)).toEqual(Object.keys(e.pose.bones));
      const ev = [
          ...Object.values(e.pose.bones).flat(),
          ...e.pose.regions.flatMap((r: any) => r.world),
        ] as number[],
        pv = [
          ...Object.values(p.pose.bones).flat(),
          ...p.pose.regions.flatMap((r: any) => r.world),
        ] as number[];
      const delta = Math.max(...ev.map((v, n) => Math.abs(v - pv[n])));
      maxDelta = Math.max(maxDelta, delta);
      expect(delta).toBeLessThanOrEqual(1e-5);
      const pngBytesIdentical = readFileSync(
        resolve(output, e.filename),
      ).equals(readFileSync(resolve(output, p.filename)));
      expect.soft(pngBytesIdentical).toBe(true);
      matches.push({
        animation: id,
        time: e.pose.sampledTime,
        maxMatrixDelta: delta,
        pngBytesIdentical,
      });
    }
  const playerPerf = await performanceRun(player, "player");
  await player.screenshot({
    path: resolve(output, "player-full.png"),
    fullPage: true,
  });
  expect(
    requests.filter((u) =>
      /apps\/editor|exercises\/|fixtures\/source|spine-canvas/.test(u),
    ),
  ).toEqual([]);
  expect(
    await player.evaluate(() => ({
      local: localStorage.length,
      editor: typeof (window as any).editorRuntime,
    })),
  ).toEqual({ local: 0, editor: "undefined" });
  await isolated.close();
  expect(errors).toEqual([]);
  writeFileSync(
    resolve(output, "gate-results.json"),
    JSON.stringify(
      {
        sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
          encoding: "utf8",
        }).trim(),
        original,
        recovered,
        history,
        editorSamples,
        playerSamples,
        matches,
        maxDelta,
        editorPerf,
        playerPerf,
        playerRequests: requests,
        errors,
        gatePassed: editorPerf.frameGatePassed && playerPerf.frameGatePassed,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ maxDelta, editorPerf, playerPerf }));
  expect
    .soft(editorPerf.frameGatePassed, "editor p95 frame <=16.7ms")
    .toBe(true);
  expect
    .soft(playerPerf.frameGatePassed, "player p95 frame <=16.7ms")
    .toBe(true);
});
