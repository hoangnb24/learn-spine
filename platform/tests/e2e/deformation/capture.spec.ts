import { test, expect } from "@playwright/test";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
test.skip(
  !process.env.GATE2_INPUT_RUN,
  "Requires command-authored packages from a previous run",
);
const run = process.env.GATE2_RUN ?? "run-04";
const input = fileURLToPath(
  new URL(
    `../../../../docs/product/results/experiment-2/${process.env.GATE2_INPUT_RUN ?? run}/`,
    import.meta.url,
  ),
);
const output = fileURLToPath(
  new URL(
    `../../../../docs/product/results/experiment-2/${run}/`,
    import.meta.url,
  ),
);
// Explicitly run after gate.spec.ts. These packages were already command-authored.
for (const kind of ["scarf", "jelly", "ik"] as const)
  test(`observation supplement ${kind}`, async ({ page }) => {
    mkdirSync(output, { recursive: true });
    await page.goto("/tests/e2e/deformation/index.html");
    await page
      .getByLabel("Mở gói project", { exact: true })
      .setInputFiles(`${input}/${kind}.zip`);
    const original = JSON.parse(
      readFileSync(`${input}/${kind}-measurements.json`, "utf8"),
    );
    await expect
      .poll(() =>
        page.evaluate(() => window.gate2.runtime.session?.inspect().revision),
      )
      .toBe(original.project.revision);
    const result = await page.evaluate(
      async ({ anchors, viewport }) => {
        const h = window.gate2,
          s = h.runtime.session!,
          p = s.inspect(),
          scope = { sessionId: s.sessionId, projectId: p.projectId };
        const validation = await h.bridge.dispatch("validate_project", scope),
          motion = await h.bridge.dispatch("measure_motion", {
            ...scope,
            animationId: "cycle",
            anchors,
            limit: 50,
          });
        const captures = [];
        for (const time of [0, 0.5, 1.5]) {
          const start = performance.now(),
            result = await h.bridge.dispatch("render_pose", {
              ...scope,
              animationId: "cycle",
              time,
              viewport,
            }),
            durationMs = performance.now() - start;
          captures.push({ time, durationMs, result });
        }
        return { validation, motion, captures };
      },
      {
        anchors: original.anchors,
        viewport: JSON.parse(
          readFileSync(`${input}/${kind}-sequence.json`, "utf8"),
        ).view,
      },
    );
    expect(result.validation.ok).toBe(true);
    expect(result.motion.ok).toBe(true);
    for (const capture of result.captures) {
      expect(capture.result.ok).toBe(true);
      if (capture.result.ok) {
        const value = capture.result.value as any;
        writeFileSync(
          `${output}/${kind}-observation-${capture.time}.png`,
          Buffer.from(value.image.data, "base64"),
        );
        value.image = {
          mimeType: "image/png",
          base64Length: value.image.data.length,
        };
      }
    }
    writeFileSync(
      `${output}/${kind}-observation.json`,
      JSON.stringify(
        {
          sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
            encoding: "utf8",
          }).trim(),
          classification: "browser bridge; not native WebMCP",
          timing:
            "inclusive actual render_pose validation/evaluate/prepare/draw/PNG encode; outside frame-performance windows",
          ...result,
        },
        null,
        2,
      ),
    );
  });
