import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import {
  output,
  save,
  instrument,
  seek,
  delta,
  playback,
  perf,
} from "./helpers";
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
