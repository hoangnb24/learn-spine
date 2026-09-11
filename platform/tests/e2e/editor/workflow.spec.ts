import { expect, test } from "@playwright/test";
import { createServer, type ViteDevServer } from "vite";
import { mkdirSync } from "node:fs";
let server: ViteDevServer;
test.use({ baseURL: "http://127.0.0.1:4182" });
test.beforeAll(async () => {
  server = await createServer({
    server: { host: "127.0.0.1", port: 4182, strictPort: true },
  });
  await server.listen();
});
test.afterAll(async () => {
  await server.close();
});
const root = "/apps/editor/runtime.ts";
async function inspect(page: import("@playwright/test").Page) {
  return page.evaluate(
    async (path) =>
      (await import(/* @vite-ignore */ path)).editorRuntime.session.inspect(),
    root,
  );
}
test("load PNG, bones, keys, playback, undo, save, reload, independent exported player", async ({
  page,
  browser,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Project mới", exact: true }).click();
  await expect(page.getByRole("treeitem", { name: "◇ Gốc" })).toBeVisible();
  await page.getByLabel("Tên xương mới").fill("Cánh tay");
  await page.getByRole("button", { name: "Thêm xương", exact: true }).click();
  const png = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 140;
    c.height = 80;
    const x = c.getContext("2d")!;
    x.fillStyle = "#edaa55";
    x.fillRect(0, 0, 140, 80);
    x.fillStyle = "#69dbcf";
    x.fillRect(100, 10, 30, 60);
    return [
      ...new Uint8Array(
        await (
          await new Promise<Blob>((resolve) =>
            c.toBlob((b) => resolve(b!), "image/png"),
          )
        ).arrayBuffer(),
      ),
    ];
  });
  await page.getByLabel("Nạp PNG", { exact: true }).setInputFiles({
    name: "arm.png",
    mimeType: "image/png",
    buffer: Buffer.from(png),
  });
  await expect(page.getByLabel("Xương của arm.png")).toBeVisible();
  await page.getByLabel("Vị trí X", { exact: true }).fill("60");
  await page.getByRole("button", { name: "Áp dụng thuộc tính" }).click();
  await page
    .getByRole("button", { name: "Thêm chuyển động", exact: true })
    .click();
  await page.getByLabel("Giá trị key").fill("0");
  await page.getByRole("button", { name: "Đặt key", exact: true }).click();
  await page.getByLabel("Thời gian (giây)", { exact: true }).fill("1");
  await page.getByLabel("Giá trị key").fill("1.2");
  await page.getByRole("button", { name: "Đặt key", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Key 1 Góc xoay (radian)", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Thời gian (giây)", { exact: true }).fill("0");
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-time",
    "0",
  );
  const startPixels = await page.locator("canvas").screenshot();
  await page.getByLabel("Thời gian (giây)", { exact: true }).fill("0.5");
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-time",
    "0.5",
  );
  const betweenPixels = await page.locator("canvas").screenshot();
  expect(betweenPixels.equals(startPixels)).toBe(false);
  await page.getByLabel("Thời gian (giây)", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Phát", exact: true }).click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  expect(
    Number(
      await page.getByLabel("Thời gian (giây)", { exact: true }).inputValue(),
    ),
  ).toBeGreaterThan(1);
  await page.getByRole("button", { name: "Hoàn tác", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Key 1 Góc xoay (radian)", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Làm lại", exact: true }).click();
  const before = await inspect(page);
  await page.getByLabel("Giá trị key").fill("");
  await page.getByRole("button", { name: "Đặt key", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Dữ liệu chưa hợp lệ");
  expect(await inspect(page)).toEqual(before);
  await page.getByLabel("Giá trị key").fill("0.6");
  await page.evaluate(async (path) => {
    const { editorRuntime: r } = await import(/* @vite-ignore */ path);
    const b = r.session.inspect().bones[1];
    r.session.apply({
      ...r.request(),
      operations: [
        { kind: "putBone", value: { ...b, name: "Tay từ lệnh ngoài" } },
      ],
    });
  }, root);
  await expect(
    page.getByRole("treeitem", { name: "◇ Tay từ lệnh ngoài" }),
  ).toBeVisible();
  await expect(page.getByLabel("Tên xương", { exact: true })).toHaveValue(
    "Tay từ lệnh ngoài",
  );
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    String((await inspect(page)).revision),
  );
  await expect(
    page.getByRole("button", { name: "Lưu trình duyệt", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Lưu trình duyệt", exact: true })
    .click();
  await expect(page.locator("footer")).toContainText("Đã lưu trên trình duyệt");
  const saved = await inspect(page);
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Tải gói project", exact: true })
    .click();
  const file = await download;
  const path = await file.path();
  await page.screenshot({
    path: "evidence/issue-12/editor-desktop.png",
    fullPage: true,
  });
  await page.reload();
  await expect(page.locator("[data-workspace-state=empty]")).toBeVisible();
  await page.getByRole("button", { name: "Khôi phục bản lưu" }).click();
  await expect(
    page.getByRole("treeitem", { name: "◇ Tay từ lệnh ngoài" }),
  ).toBeVisible();
  expect(await inspect(page)).toEqual(saved);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "evidence/issue-12/editor-narrow.png",
    fullPage: true,
  });
  // A fresh browser context has no editor globals, IndexedDB or localStorage.
  await page.close();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
  });
  const player = await context.newPage();
  player.on("pageerror", (e) => errors.push(e.message));
  await player.goto("http://127.0.0.1:4182/player.html");
  await player
    .getByLabel("Mở gói project", { exact: true })
    .setInputFiles(path!);
  await expect(player.locator(".stage")).toHaveAttribute(
    "data-rendered-revision",
    String(saved.revision),
  );
  await expect(
    player.getByRole("region", { name: "Thuộc tính", exact: true }),
  ).toHaveCount(0);
  await player.getByRole("button", { name: "Phát", exact: true }).click();
  await player.waitForTimeout(200);
  await player.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  expect(
    Number((await player.locator("output").innerText()).replace(" s", "")),
  ).toBeGreaterThan(0);
  await player.screenshot({
    path: "evidence/issue-12/player-independent.png",
    fullPage: true,
  });
  await context.close();
  expect(errors).toEqual([]);
});

test("cancel and failed save leave live data unchanged and unsaved; checkpoint restores", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Project mới", exact: true }).click();
  await expect(page.getByRole("treeitem")).toBeVisible();
  await page.evaluate(async (path) => {
    const { editorRuntime: r } = await import(/* @vite-ignore */ path);
    r.storage.autosave = async () => ({
      ok: false,
      error: {
        code: "STORAGE_FAILED",
        path: "",
        message: "Injected quota failure",
      },
    });
  }, root);
  await page
    .getByRole("button", { name: "Lưu trình duyệt", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Không lưu được");
  await expect(page.locator("footer")).toContainText("Chưa lưu bản hiện tại");
  const before = await inspect(page);
  await page.evaluate(async (path) => {
    const { editorRuntime: r } = await import(/* @vite-ignore */ path);
    r.storage.pack = async (_bundle: any, signal: AbortSignal) =>
      new Promise((resolve) =>
        signal.addEventListener(
          "abort",
          () =>
            resolve({
              ok: false,
              error: { code: "CANCELLED", path: "", message: "Cancelled" },
            }),
          { once: true },
        ),
      );
  }, root);
  await page
    .getByRole("button", { name: "Tải gói project", exact: true })
    .click();
  await page.getByRole("button", { name: "Hủy tác vụ đang chờ" }).click();
  expect(await inspect(page)).toEqual(before);
  await page.getByRole("button", { name: "Lịch sử", exact: true }).click();
  await page.getByRole("button", { name: "Tạo mốc khôi phục" }).click();
  await page.getByRole("button", { name: "Thêm xương", exact: true }).click();
  await expect(page.getByRole("treeitem")).toHaveCount(2);
  await page.getByRole("button", { name: "Khôi phục", exact: true }).click();
  await expect(page.getByRole("treeitem")).toHaveCount(1);
  mkdirSync("evidence/issue-12", { recursive: true });
  await page.screenshot({
    path: "evidence/issue-12/history.png",
    fullPage: true,
  });
});

test("late save and import cannot attach to a reopened session at the same revision", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Project mới", exact: true }).click();
  await expect(page.getByRole("treeitem")).toBeVisible();
  const result = await page.evaluate(async (path) => {
    const { editorRuntime: r } = await import(/* @vite-ignore */ path);
    const commandsPath = "/src/commands/index.ts",
      storagePath = "/src/storage/index.ts";
    const { prepareBundle } = await import(/* @vite-ignore */ commandsPath);
    const { validateBundle } = await import(/* @vite-ignore */ storagePath);
    const initial = r.session.snapshot(),
      oldSessionId = r.session.sessionId;
    const prepared = await prepareBundle(initial, validateBundle);
    if (!prepared.ok) throw Error("prepare failed");
    const realSave = r.storage.autosave.bind(r.storage);
    let release!: () => void;
    r.storage.autosave = async () =>
      new Promise((resolve) => {
        release = () =>
          resolve({
            ok: true,
            value: { revision: initial.project.revision },
            warnings: [],
          });
      });
    const pending = r.save();
    r.session.open(prepared.value); // same projectId AND revision, different session lifetime
    release();
    await pending;
    const state = {
      oldSessionId,
      newSessionId: r.session.sessionId,
      savedRevision: r.savedRevision,
      busy: r.busy,
      revision: r.session.inspect().revision,
    };
    r.storage.autosave = realSave;
    return state;
  }, root);
  expect(result.newSessionId).not.toBe(result.oldSessionId);
  expect(result.savedRevision).toBeNull();
  expect(result.busy).toBe("");
  expect(result.revision).toBe(0);
  const imported = await page.evaluate(async (path) => {
    const { editorRuntime: r } = await import(/* @vite-ignore */ path);
    const initial = r.session.snapshot();
    let release!: (v: ArrayBuffer) => void;
    const file = new File(["placeholder"], "late.png", { type: "image/png" });
    file.arrayBuffer = () =>
      new Promise((resolve) => {
        release = resolve;
      });
    const pending = r.importPng([file], "root");
    await r.openBundle(initial);
    release(new ArrayBuffer(24));
    await pending;
    return {
      assets: r.session.inspect().assets.length,
      revision: r.session.inspect().revision,
      error: r.error,
      busy: r.busy,
    };
  }, root);
  expect(imported).toEqual({ assets: 0, revision: 0, error: "", busy: "" });
});

test("invalid files preserve the project and a later valid editor package opens", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Project mới", exact: true }).click();
  await expect(page.getByRole("treeitem")).toBeVisible();
  const before = await inspect(page);
  await page.getByLabel("Mở gói project", { exact: true }).setInputFiles({
    name: "broken.zip",
    mimeType: "application/zip",
    buffer: Buffer.from("not a ZIP"),
  });
  await expect(page.getByRole("alert")).toBeVisible();
  expect(await inspect(page)).toEqual(before);
  await page.getByLabel("Nạp PNG", { exact: true }).setInputFiles({
    name: "broken.png",
    mimeType: "image/png",
    buffer: Buffer.from("not a PNG"),
  });
  await expect(page.getByRole("alert")).toContainText("Không đọc được ảnh PNG");
  expect(await inspect(page)).toEqual(before);
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Tải gói project", exact: true })
    .click();
  const file = await download,
    path = await file.path();
  await page.getByRole("button", { name: "Thêm xương", exact: true }).click();
  await expect(page.getByRole("treeitem")).toHaveCount(2);
  await page.getByLabel("Mở gói project", { exact: true }).setInputFiles(path!);
  await expect(page.getByRole("treeitem")).toHaveCount(1);
  expect(await inspect(page)).toEqual(before);
  await expect(
    page.getByRole("button", { name: "Hoàn tác", exact: true }),
  ).toBeDisabled();
});

test("opening an identical saved package recognizes the committed record, but equal-revision different content stays unsaved", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Project mới", exact: true }).click();
  await expect(page.getByRole("treeitem")).toBeVisible();
  const result = await page.evaluate(async (path) => {
    const { editorRuntime: r } = await import(/* @vite-ignore */ path);
    await r.save();
    const saved = r.session.snapshot();
    await r.openBundle(saved);
    await r.save();
    const identicalSaved = r.savedRevision;
    saved.project.bones[0].name = "Other content at same revision";
    await r.openBundle(saved);
    await r.save();
    return { identicalSaved, differentSaved: r.savedRevision, error: r.error };
  }, root);
  expect(result.identicalSaved).toBe(0);
  expect(result.differentSaved).toBeNull();
  expect(result.error).toContain("Project đã thay đổi");
});
