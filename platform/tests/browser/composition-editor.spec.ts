import { test, expect, type Page } from "@playwright/test";
import { createServer, type ViteDevServer } from "vite";
import { mkdirSync, writeFileSync } from "node:fs";
let server: ViteDevServer;
test.use({ baseURL: "http://127.0.0.1:4185", video: "on" });
test.beforeAll(async () => {
  server = await createServer({
    server: { host: "127.0.0.1", port: 4185, strictPort: true },
  });
  await server.listen();
  mkdirSync("evidence/issue-75/browser", { recursive: true });
});
test.afterAll(async () => {
  await server.close();
});
async function inspect(page: Page) {
  return page.evaluate(async () => {
    const path = "/apps/editor/runtime.ts";
    return (
      await import(/* @vite-ignore */ path)
    ).editorRuntime.session.inspect();
  });
}
async function load(page: Page) {
  await page.goto("/");
  await page
    .getByLabel("Mở gói project", { exact: true })
    .setInputFiles("fixtures/robot/native-project.zip");
  await expect(page.getByRole("treeitem")).not.toHaveCount(0);
  await page.evaluate(async () => {
    const rp = "/apps/editor/runtime.ts",
      fp = "/evidence/issue-75/authoring-inputs.mjs";
    const r = (await import(/* @vite-ignore */ rp)).editorRuntime,
      f = await import(/* @vite-ignore */ fp);
    if (!r.apply(f.authoringOperations())) throw Error(r.error);
  });
}
async function seek(page: Page, t: number) {
  await page.getByLabel("Thời gian (giây)", { exact: true }).fill(String(t));
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-time",
    String(t),
  );
}
async function apply(page: Page) {
  await page
    .getByRole("button", { name: "Áp dụng phối chuyển động", exact: true })
    .click();
}
async function mask(page: Page, label: string, bone: string, property: string) {
  const field = page.getByRole("group", { name: label, exact: true });
  const checkbox = page.getByLabel(`${label} · ${bone} · ${property}`, {
    exact: true,
  });
  if (!(await checkbox.isVisible()))
    await field
      .locator("details")
      .filter({ hasText: bone })
      .locator("summary")
      .click();
  await checkbox.check();
}
async function pose(page: Page, t: number) {
  return page.evaluate(async (t) => {
    const rp = "/apps/editor/runtime.ts",
      ep = "/src/engine/index.ts";
    const p = (
      await import(/* @vite-ignore */ rp)
    ).editorRuntime.session.inspect();
    return (await import(/* @vite-ignore */ ep)).evaluateTarget(p, {
      target: { kind: "composition", compositionId: p.compositions.at(-1).id },
      time: t,
    });
  }, t);
}

test("UI create/edit layers, motion, clocks, undo/redo and browser/ZIP reopen", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await load(page);
  const initial = await inspect(page),
    boneName = (id: string) => initial.bones.find((b: any) => b.id === id).name;
  await page
    .getByRole("button", { name: "Tạo phối chuyển động", exact: true })
    .click();
  await page
    .getByLabel("Tên phối chuyển động", { exact: true })
    .fill("Đi và vẫy");
  await page.getByRole("button", { name: "Thêm lớp", exact: true }).click();
  await page
    .getByLabel("Chuyển động nguồn", { exact: true })
    .selectOption("walk");
  await mask(page, "Thuộc tính của lớp", boneName("body"), "Vị trí Y");
  await mask(page, "Thuộc tính của lớp", boneName("root"), "Vị trí X");
  await page.getByRole("button", { name: "Thêm lớp", exact: true }).click();
  await page
    .getByLabel("Chuyển động nguồn", { exact: true })
    .selectOption("wave");
  await mask(
    page,
    "Thuộc tính của lớp",
    boneName("upper-arm-right"),
    "Góc xoay",
  );
  await page.getByLabel("Mức trộn (0–1)", { exact: true }).fill("0.5");
  await apply(page);
  const authored = await inspect(page),
    c = authored.compositions.at(-1);
  expect(c.tracks).toHaveLength(2);
  expect(c.tracks[1].alpha).toBe(0.5);
  await seek(page, 0.5);
  const halfway = await pose(page, 0.5);
  expect(halfway.ok).toBe(true);
  expect(halfway.value.bones.root[4]).toBe(40);
  expect(halfway.value.bones.body[5]).toBe(290);
  await page.screenshot({
    path: "evidence/issue-75/browser/walk-wave.png",
    fullPage: true,
  });
  const pixels = await page.locator("canvas").screenshot();
  await seek(page, 0.25);
  expect((await page.locator("canvas").screenshot()).equals(pixels)).toBe(
    false,
  );
  await page.getByRole("button", { name: "Phát", exact: true }).click();
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  const paused = await page
    .getByLabel("Thời gian (giây)", { exact: true })
    .inputValue();
  await page.waitForTimeout(100);
  expect(
    await page.getByLabel("Thời gian (giây)", { exact: true }).inputValue(),
  ).toBe(paused);
  await seek(page, 1.9);
  await page.getByRole("button", { name: "Phát", exact: true }).click();
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  expect(
    Number(
      await page.getByLabel("Thời gian (giây)", { exact: true }).inputValue(),
    ),
  ).toBeLessThan(1);
  await page
    .getByLabel("Lớp đang sửa", { exact: true })
    .selectOption(c.tracks[1].id);
  await page.getByLabel("Cách trộn", { exact: true }).selectOption("additive");
  await page.getByLabel("Thứ tự lớp", { exact: true }).fill("3");
  await page.getByLabel("Tốc độ nguồn", { exact: true }).fill("0");
  await page.getByLabel("Thời điểm nguồn bắt đầu", { exact: true }).fill(".5");
  await apply(page);
  const zero1 = await pose(page, 0.1),
    zero2 = await pose(page, 0.8);
  expect(zero1.value.bones["upper-arm-right"].slice(0, 4)).toEqual(
    zero2.value.bones["upper-arm-right"].slice(0, 4),
  );
  await page.getByRole("button", { name: "Hoàn tác", exact: true }).click();
  expect((await inspect(page)).compositions.at(-1)).toEqual(c);
  await page.getByRole("button", { name: "Làm lại", exact: true }).click();
  await page
    .getByLabel("Lớp đang sửa", { exact: true })
    .selectOption(c.tracks[1].id);
  await page
    .getByLabel("Cách chạy nguồn", { exact: true })
    .selectOption("frozen");
  await page.getByLabel("Thời điểm giữ", { exact: true }).fill(".5");
  await page.getByLabel("Tăng dần (giây)", { exact: true }).fill(".2");
  await page.getByLabel("Có thời điểm kết thúc", { exact: true }).check();
  await page.getByLabel("Kết thúc (giây)", { exact: true }).fill("1");
  await page.getByLabel("Giảm dần (giây)", { exact: true }).fill(".3");
  await apply(page);
  const saved = await inspect(page);
  await seek(page, 0.5);
  const savedPose = await pose(page, 0.5);
  await page
    .getByRole("button", { name: "Lưu trình duyệt", exact: true })
    .click();
  await expect(page.locator("footer")).toContainText("Đã lưu trên trình duyệt");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Tải gói project", exact: true })
    .click();
  await (await download).saveAs("evidence/issue-75/browser/authored.zip");
  await page.reload();
  await page
    .getByRole("button", { name: "Khôi phục bản lưu", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Phối · Đi và vẫy", exact: true }),
  ).toBeVisible();
  expect(await inspect(page)).toEqual(saved);
  await page
    .getByRole("button", { name: "Phối · Đi và vẫy", exact: true })
    .click();
  await seek(page, 0.5);
  expect((await pose(page, 0.5)).value).toEqual(savedPose.value);
  await page
    .getByLabel("Mở gói project", { exact: true })
    .setInputFiles("evidence/issue-75/browser/authored.zip");
  await page
    .getByRole("button", { name: "Phối · Đi và vẫy", exact: true })
    .click();
  await seek(page, 0.5);
  expect((await pose(page, 0.5)).value).toEqual(savedPose.value);
  await page.screenshot({
    path: "evidence/issue-75/browser/reopened.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Đi bộ", exact: true }).click();
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-target",
    JSON.stringify({ kind: "animation", animationId: "walk" }),
  );
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-time",
    "0",
  );
  expect(errors).toEqual([]);
  writeFileSync(
    "evidence/issue-75/browser/authoring.json",
    JSON.stringify(
      {
        classification: "browser-ui-not-native",
        project: saved,
        pose: savedPose,
        checks: [
          "create/edit masks alpha order live/frozen clocks",
          "actual canvas pixels differ",
          "play pause loop",
          "zero speed",
          "undo redo",
          "IndexedDB and ZIP reopen same canonical pose",
          "legacy target selection resets",
        ],
      },
      null,
      2,
    ),
  );
  await page.close();
  await page.video()?.saveAs("evidence/issue-75/browser/authoring.webm");
});

test("UI authors and edits complete frozen transition; coverage/deform failures are atomic", async ({
  page,
}) => {
  await load(page);
  const initial = await inspect(page),
    name = (id: string) => initial.bones.find((b: any) => b.id === id).name;
  await page
    .getByRole("button", { name: "Tạo phối chuyển động", exact: true })
    .click();
  await page
    .getByLabel("Tên phối chuyển động", { exact: true })
    .fill("Dừng mềm");
  await page.getByLabel("Lặp phối chuyển động", { exact: true }).uncheck();
  await page.getByRole("button", { name: "Thêm lớp", exact: true }).click();
  await page
    .getByLabel("Chuyển động nguồn", { exact: true })
    .selectOption("walk");
  await mask(page, "Thuộc tính của lớp", name("body"), "Vị trí Y");
  await mask(page, "Thuộc tính của lớp", name("root"), "Vị trí X");
  await page.getByLabel("Có thời điểm kết thúc", { exact: true }).check();
  await page.getByLabel("Kết thúc (giây)", { exact: true }).fill("1");
  await page
    .getByRole("button", { name: "Thêm chuyển tiếp", exact: true })
    .click();
  await page.getByLabel("Bắt đầu (giây)", { exact: true }).fill("1");
  await page.getByLabel("Độ dài chuyển tiếp", { exact: true }).fill(".4");
  await page.getByLabel("Nguồn đi ra", { exact: true }).selectOption("walk");
  await page
    .getByLabel("Thời điểm giữ nguồn đi ra", { exact: true })
    .fill(".5");
  await mask(page, "Thuộc tính đi ra", name("body"), "Vị trí Y");
  await mask(page, "Thuộc tính đi ra", name("root"), "Vị trí X");
  await page.getByLabel("Nguồn đi vào", { exact: true }).selectOption("stop");
  const before = await inspect(page);
  await apply(page);
  await expect(page.getByRole("alert")).toContainText(
    "Chuyển tiếp còn thiếu key",
  );
  expect(await inspect(page)).toEqual(before);
  await page.screenshot({
    path: "evidence/issue-75/browser/coverage-error.png",
    fullPage: true,
  });
  await mask(page, "Thuộc tính đi vào", name("body"), "Vị trí Y");
  await mask(page, "Thuộc tính đi vào", name("root"), "Vị trí X");
  await apply(page);
  const accepted = await inspect(page),
    cross = accepted.compositions.at(-1).tracks[1];
  expect(cross.kind).toBe("crossfade");
  const samples = [];
  for (const t of [1, 1.2, 1.4, 1.7, 2]) {
    await seek(page, t);
    const result = await pose(page, t);
    expect(result.ok).toBe(true);
    expect(result.value.bones.root[4]).toBe(40);
    samples.push(result.value);
  }
  expect(samples[0].bones.body[5]).toBe(290);
  expect(samples[1].bones.body[5]).toBeCloseTo(294);
  expect(samples[2].bones.body[5]).toBeCloseTo(306);
  expect(samples[4].bones.body[5]).toBe(310);
  await seek(page, 1);
  const entry = await page.locator("canvas").screenshot();
  await seek(page, 1.4);
  expect((await page.locator("canvas").screenshot()).equals(entry)).toBe(false);
  await page.getByLabel("Lớp đang sửa", { exact: true }).selectOption(cross.id);
  await page
    .getByLabel("Thời điểm giữ nguồn đi ra", { exact: true })
    .fill(".25");
  await apply(page);
  const edited = await pose(page, 1);
  expect(edited.value.bones.root[4]).toBe(20);
  await page.getByRole("button", { name: "Hoàn tác", exact: true }).click();
  expect((await pose(page, 1)).value.bones.root[4]).toBe(40);
  // Add a valid, unreferenced deformation source via public Session commands.
  await page.evaluate(async () => {
    const path = "/apps/editor/runtime.ts";
    const r = (await import(/* @vite-ignore */ path)).editorRuntime,
      p = r.session.inspect();
    if (
      !r.apply([
        {
          kind: "putMesh",
          value: {
            id: "test-mesh",
            type: "mesh",
            assetId: p.assets[0].id,
            vertices: [0, 0, 10, 0, 0, 10],
            uvs: [0, 0, 1, 0, 0, 1],
            triangles: [0, 1, 2],
            bindPose: [{ boneId: "root", world: [1, 0, 0, 1, 0, 0] }],
            weights: [
              [{ boneId: "root", weight: 1 }],
              [{ boneId: "root", weight: 1 }],
              [{ boneId: "root", weight: 1 }],
            ],
          },
        },
        {
          kind: "putAnimation",
          value: {
            id: "deform-source",
            name: "Nguồn biến dạng",
            duration: 1,
            loop: false,
            channels: [],
            deforms: [
              {
                attachmentId: "test-mesh",
                keys: [
                  {
                    time: 0,
                    offsets: [0, 0, 0, 0, 0, 0],
                    curve: { type: "linear" },
                  },
                ],
              },
            ],
          },
        },
      ])
    )
      throw Error(r.error);
  });
  await page.getByLabel("Lớp đang sửa", { exact: true }).selectOption(cross.id);
  await page
    .getByLabel("Nguồn đi ra", { exact: true })
    .selectOption("deform-source");
  const beforeDeform = await inspect(page);
  await apply(page);
  await expect(page.getByRole("alert")).toContainText(
    "Nguồn này có biến dạng lưới",
  );
  expect(await inspect(page)).toEqual(beforeDeform);
  await page.screenshot({
    path: "evidence/issue-75/browser/deform-error.png",
    fullPage: true,
  });
  writeFileSync(
    "evidence/issue-75/browser/transition.json",
    JSON.stringify(
      {
        classification: "browser-ui-not-native",
        accepted: accepted.compositions.at(-1),
        samples,
        coverageAtomic: true,
        deformAtomic: true,
      },
      null,
      2,
    ),
  );
  await page.close();
  await page.video()?.saveAs("evidence/issue-75/browser/transition.webm");
});

test("outside revision preserves dirty draft; duration and loop changes normalize paused clock", async ({
  page,
}) => {
  await load(page);
  await page
    .getByRole("button", { name: "Tạo phối chuyển động", exact: true })
    .click();
  await page
    .getByLabel("Tên phối chuyển động", { exact: true })
    .fill("Bản nháp giữ lại");
  await page.evaluate(async () => {
    const path = "/apps/editor/runtime.ts";
    const r = (await import(/* @vite-ignore */ path)).editorRuntime,
      c = r.session.inspect().compositions.at(-1);
    r.apply([
      { kind: "putComposition", value: { ...c, name: "Tên từ agent" } },
    ]);
  });
  await expect(
    page.getByLabel("Tên phối chuyển động", { exact: true }),
  ).toHaveValue("Bản nháp giữ lại");
  await expect(page.getByRole("alert")).toContainText(
    "Bản nháp của bạn vẫn còn",
  );
  await expect(
    page.getByRole("button", { name: "Áp dụng phối chuyển động", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Bỏ nháp và tải bản mới", exact: true })
    .click();
  await expect(
    page.getByLabel("Tên phối chuyển động", { exact: true }),
  ).toHaveValue("Tên từ agent");
  await seek(page, 1.5);
  await page.getByLabel("Độ dài phối (giây)", { exact: true }).fill("1");
  await apply(page);
  await expect(
    page.getByLabel("Thời gian (giây)", { exact: true }),
  ).toHaveValue("0.50");
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-time",
    "0.5",
  );
  await page.getByLabel("Lặp phối chuyển động", { exact: true }).uncheck();
  await apply(page);
  await seek(page, 0.9);
  await page.getByLabel("Độ dài phối (giây)", { exact: true }).fill(".6");
  await apply(page);
  await expect(
    page.getByLabel("Thời gian (giây)", { exact: true }),
  ).toHaveValue("0.60");
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-time",
    "0.6",
  );
  await page.getByLabel("Lặp phối chuyển động", { exact: true }).check();
  await apply(page);
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-time",
    "0",
  );
  await page.getByRole("button", { name: "Phát", exact: true }).click();
  await page.getByRole("button", { name: "Đi bộ", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Phát", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-time",
    "0",
  );
});

test("bounds failure hides stale geometry and provenance, then undo restores the target", async ({
  page,
}) => {
  await load(page);
  await page.evaluate(async () => {
    const rp = "/apps/editor/runtime.ts",
      fp = "/evidence/issue-75/authoring-inputs.mjs";
    const r = (await import(/* @vite-ignore */ rp)).editorRuntime,
      f = await import(/* @vite-ignore */ fp);
    r.apply([{ kind: "putComposition", value: f.nativeComposition() }]);
  });
  await page
    .getByRole("button", { name: "Phối · Phối từ agent", exact: true })
    .click();
  await seek(page, 0.5);
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-frame-ready",
    "true",
  );
  await page.evaluate(async () => {
    const rp = "/apps/editor/runtime.ts";
    const r = (await import(/* @vite-ignore */ rp)).editorRuntime,
      p = r.session.inspect();
    const animation = {
      id: "extreme",
      name: "Extreme bounds",
      duration: 1,
      loop: false,
      channels: [
        {
          boneId: "root",
          property: "x",
          keys: [
            { time: 0, value: 0, curve: { type: "linear" } },
            { time: 1, value: 1e308, curve: { type: "linear" } },
          ],
        },
      ],
    };
    const c = p.compositions.at(-1);
    c.tracks = [0, 1].map((order) => ({
      kind: "track",
      id: `extreme-${order}`,
      order,
      source: { kind: "live", animationId: "extreme", offset: 0, speed: 1 },
      mask: [{ boneId: "root", property: "x" }],
      mode: "additive",
      alpha: 1,
      start: 0,
      fadeIn: 0,
      fadeOut: 0,
    }));
    if (
      !r.apply([
        { kind: "putAnimation", value: animation },
        { kind: "putComposition", value: c },
      ])
    )
      throw Error(r.error);
  });
  await expect(page.locator(".stage-error")).toBeVisible();
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-frame-ready",
    "false",
  );
  await expect(page.locator(".stage")).not.toHaveAttribute(
    "data-rendered-revision",
    /\d+/,
  );
  await expect(page.locator("canvas")).toBeHidden();
  await page.getByRole("button", { name: "Hoàn tác", exact: true }).click();
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-frame-ready",
    "true",
  );
  await expect(page.locator(".stage-error")).toHaveCount(0);
});
