import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { save, instrument, seek, delta, playback, perf } from "./helpers";
test.skip(
  !process.env.GATE2_INPUT_RUN,
  "Requires previous command-authored packages; no fixture or performance rerun",
);
const input = fileURLToPath(
  new URL(
    `../../../../docs/product/results/experiment-2/${process.env.GATE2_INPUT_RUN ?? "run-03"}/`,
    import.meta.url,
  ),
);
for (const kind of ["scarf", "jelly", "ik"] as const)
  test(`recheck recorded UI seeks ${kind}`, async ({ page, browser }) => {
    const original = JSON.parse(
      readFileSync(`${input}/${kind}-measurements.json`, "utf8"),
    );
    await page.goto("/tests/e2e/deformation/index.html");
    await instrument(page);
    await page
      .getByLabel("Mở gói project", { exact: true })
      .setInputFiles(`${input}/${kind}.zip`);
    await expect
      .poll(() => page.evaluate(() => window.gate2.runtime.session?.inspect()))
      .toEqual(original.project);
    const start = await seek(page, "editor", 0);
    expect(delta(start.pose, original.samples[0])).toBe(0);
    const editor = await playback(page, "editor", kind);
    await page.close();
    const context = await browser.newContext({
        viewport: { width: 1900, height: 1300 },
        deviceScaleFactor: 1,
      }),
      player = await context.newPage();
    await player.goto("http://127.0.0.1:4196/player.html");
    await instrument(player);
    await player
      .getByLabel("Mở gói project", { exact: true })
      .setInputFiles(`${input}/${kind}.zip`);
    await expect(player.locator(".stage")).toHaveAttribute(
      "data-rendered-revision",
      String(original.project.revision),
    );
    const playerStart = await seek(player, "player", 0);
    expect(delta(playerStart.pose, start.pose)).toBe(0);
    const playerResult = await playback(player, "player", kind);
    // Run03 jelly stopped before Player performance. Keep all other measured windows.
    const missingPerformance =
      kind === "jelly" ? await perf(player, "player", kind) : null;
    save(`${kind}-recheck.json`, {
      sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim(),
      fixtureRun: process.env.GATE2_INPUT_RUN,
      fixtureSource: "75ac03a",
      projectId: original.project.projectId,
      revision: original.project.revision,
      editor,
      player: playerResult,
      missingPerformance,
      initialEditorPlayerDelta: delta(start.pose, playerStart.pose),
    });
    await context.close();
  });
