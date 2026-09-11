import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const output = fileURLToPath(
  new URL("../../../evidence/issue-19", import.meta.url),
);
test("actual editor weights, deform, IK; bridge retry/rollback; ZIP recovery and independent player", async ({
  page,
  browser,
}) => {
  await mkdir(output, { recursive: true });
  await page.goto("/tests/authoring/browser/index.html");
  await page.getByRole("button", { name: "Nạp mẫu khăn", exact: true }).click();
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    "0",
  );
  const before = await page.evaluate(() =>
    window.issue19.runtime.session!.inspect(),
  );
  await page.getByRole("button", { name: "Lưới / IK", exact: true }).click();
  await page.getByLabel("Chọn lưới", { exact: true }).selectOption("mesh");
  await page
    .getByRole("button", { name: "Chọn đỉnh 1 trên hình", exact: true })
    .click();
  await expect(page.getByTestId("selected-vertices")).toContainText("1");
  await page.getByLabel("Weight root", { exact: true }).fill("0.8");
  await page.getByLabel("Weight tip", { exact: true }).fill("0.2");
  await page
    .getByRole("button", { name: "Áp dụng weights vùng chọn", exact: true })
    .click();
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    "1",
  );
  const result = await page.evaluate(async () => {
    const h = window.issue19,
      s = h.runtime.session!,
      p = s.inspect(),
      scope = { sessionId: s.sessionId, projectId: p.projectId };
    const original = s.inspect();
    const batch = {
      ...scope,
      expectedRevision: p.revision,
      requestId: "browser-weights",
      operations: [
        {
          kind: "setVertexWeights",
          attachmentId: "mesh",
          vertices: [
            {
              vertex: 2,
              weights: [
                { boneId: "root", weight: 0.7 },
                { boneId: "tip", weight: 0.3 },
              ],
            },
          ],
        },
      ],
    };
    const first = await h.bridge.dispatch("apply_batch", batch),
      retry = await h.bridge.dispatch("apply_batch", batch);
    const beforeBad = s.inspect();
    const failed = await h.bridge.dispatch("apply_batch", {
      ...batch,
      expectedRevision: 2,
      requestId: "bad",
      operations: [
        ...batch.operations,
        {
          kind: "setVertexWeights",
          attachmentId: "mesh",
          vertices: [{ vertex: 999, weights: [{ boneId: "root", weight: 1 }] }],
        },
      ],
    });
    const unchanged = JSON.stringify(beforeBad) === JSON.stringify(s.inspect());
    const report = await h.bridge.dispatch("measure_motion", {
      ...scope,
      animationId: "deform",
      anchors: [
        {
          id: "neck",
          point: { kind: "vertex", slotId: "mesh", vertex: 0 },
          target: [-180, 67.5],
        },
      ],
      loopPoints: [],
      limit: 5,
    });
    return {
      original,
      first,
      retry,
      failed,
      unchanged,
      report,
      after: s.inspect(),
    };
  });
  expect(result.first).toEqual(result.retry);
  expect(result.unchanged).toBe(true);
  expect(result.failed).toMatchObject({
    ok: false,
    error: {
      code: "MISSING_REFERENCE",
      path: "/operations/1/vertices/0/vertex",
    },
  });
  const expected = structuredClone(before);
  expected.revision = 2;
  if (expected.attachments[0].type === "mesh") {
    expected.attachments[0].weights[1] = [
      { boneId: "root", weight: 0.8 },
      { boneId: "tip", weight: 0.2 },
    ];
    expected.attachments[0].weights[2] = [
      { boneId: "root", weight: 0.7 },
      { boneId: "tip", weight: 0.3 },
    ];
  }
  expect(result.after).toEqual(expected);
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    "2",
  );
  await page.getByLabel("Deform X", { exact: true }).fill("2");
  await page.getByLabel("Deform Y", { exact: true }).fill("0");
  await page
    .getByRole("button", { name: "Đặt key biến dạng vùng chọn", exact: true })
    .click();
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    "3",
  );
  const deformed = await page.evaluate(() =>
    window.issue19.runtime.session!.inspect(),
  );
  expect(deformed.animations[0].deforms![0].keys[0].offsets[2]).toBe(2);
  expect(
    deformed.animations[0].deforms![0].keys[0].offsets.filter(
      (_, i) => i !== 2,
    ),
  ).toEqual(
    before.animations[0].deforms![0].keys[0].offsets.filter((_, i) => i !== 2),
  );
  await page
    .getByLabel("Xương xem weights", { exact: true })
    .selectOption("tip");
  await page.screenshot({ path: `${output}/browser-ui.png` });
  await page.getByRole("button", { name: "Hoàn tác", exact: true }).click();
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    "4",
  );
  await page.getByRole("button", { name: "Làm lại", exact: true }).click();
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    "5",
  );
  const packed = await page.evaluate(async () => {
    const h = window.issue19,
      s = h.runtime.session!,
      snapshot = s.snapshot();
    const packed = await h.runtime.storage.pack(snapshot);
    if (!packed.ok) throw Error(JSON.stringify(packed));
    const reopened = await h.runtime.storage.unpack(packed.value);
    if (!reopened.ok) throw Error(JSON.stringify(reopened));
    return {
      bytes: Array.from(packed.value),
      project: reopened.value.project,
      poses: [0, 0.5, 1].map((time) =>
        h.evaluate(reopened.value.project, { animationId: "deform", time }),
      ),
    };
  });
  const zip = `${output}/authored-scarf.zip`;
  await writeFile(zip, new Uint8Array(packed.bytes));
  expect(packed.project).toEqual({ ...deformed, revision: 5 });
  await page
    .getByRole("button", { name: "Lưu trình duyệt", exact: true })
    .click();
  await expect(
    page.getByText("Bản 5 · Đã lưu trên trình duyệt", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Khôi phục bản lưu", exact: true })
    .click();
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    "5",
  );
  expect(
    await page.evaluate(() => window.issue19.runtime.session!.inspect()),
  ).toEqual(packed.project);
  const player = await browser.newPage({
    viewport: { width: 1500, height: 1000 },
  });
  await player.goto("http://127.0.0.1:4199/player.html");
  await player.evaluate(async () => {
    const path = "/src/render/index.ts";
    const { PixiRenderer } = await import(/* @vite-ignore */ path);
    const draw = PixiRenderer.prototype.draw;
    PixiRenderer.prototype.draw = function (pose: unknown, viewport: unknown) {
      const result = draw.call(this, pose, viewport);
      (window as unknown as { drawn: unknown }).drawn = {
        pose: structuredClone(pose),
        ok: result.ok,
      };
      return result;
    };
  });
  await player.getByLabel("Mở gói project", { exact: true }).setInputFiles(zip);
  await expect(player.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    "5",
  );
  const playerPoses = [];
  for (const [index, time] of [0, 0.5, 1].entries()) {
    await player.getByLabel("Thanh thời gian").fill(String(time));
    await expect(player.locator(".stage")).toHaveAttribute(
      "data-rendered-time",
      String(time),
    );
    const drawn = await player.evaluate(
      () =>
        (window as unknown as { drawn: { pose: unknown; ok: boolean } }).drawn,
    );
    expect(drawn.ok).toBe(true);
    expect(packed.poses[index]).toMatchObject({ ok: true, value: drawn.pose });
    playerPoses.push(drawn.pose);
  }
  await player.screenshot({ path: `${output}/browser-player.png` });
  await page.getByRole("button", { name: "Nạp mẫu IK", exact: true }).click();
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    "0",
  );
  await page.getByRole("button", { name: "Lưới / IK", exact: true }).click();
  await page.getByLabel("Mức IK", { exact: true }).fill("0.5");
  await page.getByRole("button", { name: "Áp dụng IK", exact: true }).click();
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    "1",
  );
  const ik = await page.evaluate(() =>
    window.issue19.runtime.session!.inspect(),
  );
  expect(ik.ikConstraints![0].mix).toBe(0.5);
  await writeFile(
    `${output}/browser-results.json`,
    JSON.stringify(
      {
        browser: browser.version(),
        classification:
          "real browser UI + bridge dispatch, not native invocation",
        result,
        zipProject: packed.project,
        poses: packed.poses,
        playerPoses,
        ik,
      },
      null,
      2,
    ),
  );
  await player.close();
});
test("new projects use v1; opening v0 stays v0 until explicit UI upgrade, undo restores v0", async ({
  page,
}) => {
  await page.goto("/tests/authoring/browser/index.html");
  await page.getByRole("button", { name: "Project mới", exact: true }).click();
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    "0",
  );
  expect(
    await page.evaluate(
      () => window.issue19.runtime.session!.inspect().formatVersion,
    ),
  ).toBe(1);
  await page.evaluate(async () => {
    const h = window.issue19,
      b = h.runtime.session!.snapshot();
    b.project.formatVersion = 0;
    b.project.projectId = "v0-" + crypto.randomUUID();
    await h.runtime.openBundle(b);
  });
  await page.getByRole("button", { name: "Lưới / IK", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Nâng project lên v1", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => window.issue19.runtime.session!.inspect().formatVersion,
    ),
  ).toBe(0);
  await page
    .getByRole("button", { name: "Nâng project lên v1", exact: true })
    .click();
  expect(
    await page.evaluate(
      () => window.issue19.runtime.session!.inspect().formatVersion,
    ),
  ).toBe(1);
  await page.getByRole("button", { name: "Hoàn tác", exact: true }).click();
  expect(
    await page.evaluate(() => window.issue19.runtime.session!.inspect()),
  ).toMatchObject({
    formatVersion: 0,
    revision: 2,
    requiredCapabilities: ["region-v0"],
  });
});
