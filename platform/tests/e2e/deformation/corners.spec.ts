import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { save } from "./helpers";
test.skip(!process.env.GATE2_INPUT_RUN, "Requires the already authored IK ZIP");
const input = fileURLToPath(
  new URL(
    `../../../../docs/product/results/experiment-2/${process.env.GATE2_INPUT_RUN ?? "run-03"}/`,
    import.meta.url,
  ),
);
test("all drawn IK region corners have a smooth seam, and rotation-only negative control fails", async ({
  page,
}) => {
  const original = JSON.parse(
    readFileSync(`${input}/ik-measurements.json`, "utf8"),
  );
  await page.goto("/tests/e2e/deformation/index.html");
  await page
    .getByLabel("Mở gói project", { exact: true })
    .setInputFiles(`${input}/ik.zip`);
  await expect
    .poll(() => page.evaluate(() => window.gate2.runtime.session?.inspect()))
    .toEqual(original.project);
  const measured = await page.evaluate(() => window.gate2.measure());
  const cornerPoints = measured.loop.points.filter(
    (p) => p.ref.kind === "region-corner",
  );
  expect(cornerPoints).toHaveLength(12);
  for (const point of cornerPoints) {
    expect(point.positionError).toBeLessThanOrEqual(0.5);
    expect(point.velocityError).toBeLessThanOrEqual(point.velocityThreshold);
  }
  expect(measured.loop.h).toBe(original.loop.h);
  expect(measured.loop.times).toEqual(original.loop.times);
  // A fixed origin alone cannot detect this foot-region rotation seam. This test
  // control is applied through commands after saving the original positive report.
  const negative = await page.evaluate(async () => {
    const h = window.gate2,
      s = h.runtime.session!,
      p = s.inspect(),
      animation = structuredClone(p.animations[0]);
    animation.channels.push({
      boneId: "target",
      property: "rotation",
      keys: [
        { time: 0, value: 0, curve: { type: "linear" } },
        { time: 2, value: 0.1, curve: { type: "linear" } },
      ],
    });
    const request = {
        ...h.runtime.request(),
        operations: [{ kind: "putAnimation", value: animation }],
      },
      result = s.apply(request);
    if (!result.ok) throw Error(JSON.stringify(result));
    return { request, result, measured: await h.measure() };
  });
  expect(negative.measured.report.passed).toBe(true);
  expect(
    negative.measured.loop.points.filter(
      (p) => p.ref.kind === "region-corner" && p.positionError > 0.5,
    ),
  ).toHaveLength(4);
  save("ik-region-corners.json", {
    sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim(),
    fixtureSource: "75ac03a",
    fixtureRun: process.env.GATE2_INPUT_RUN,
    projectId: original.project.projectId,
    revision: original.project.revision,
    source:
      "canonical Pose.regions.world + public render.corners; no copied skinning/IK",
    loop: measured.loop,
    negativeControl: negative,
  });
});
