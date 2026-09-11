import { test, expect } from "@playwright/test";
import { writeFileSync } from "node:fs";
test("real robot PNG sequence, portable image, revision isolation, visible three-loop playback and cleanup", async ({
  page,
  browser,
}) => {
  await page.goto("/tests/observation/browser/");
  await page.waitForFunction(() => !!(window as any).observation);
  const result = await page.evaluate(async () => {
    const h = (window as any).harness,
      o = (window as any).observation,
      u = h.unwrap,
      b = await h.robot();
    h.renderer.dispose();
    h.renderer.canvas.remove();
    b.project.animations = [
      {
        id: "wave",
        name: "Wave",
        duration: 2,
        loop: true,
        channels: [
          {
            boneId: "upper-arm-right",
            property: "rotation",
            keys: [
              {
                time: 0,
                value: 0,
                curve: { type: "bezier", x1: 0.2, y1: 1.4, x2: 0.8, y2: 1.4 },
              },
              { time: 1, value: Math.PI / 2, curve: { type: "linear" } },
              { time: 2, value: 0, curve: { type: "linear" } },
            ],
          },
        ],
      },
    ];
    const s = new o.ObservationService(),
      v = { ...h.viewport, width: 640, height: 480, background: "#263442" },
      request = {
        kind: "sequence",
        animationId: "wave",
        times: Array.from({ length: 12 }, (_, i) => i / 6),
        viewport: v,
      };
    const wait = async (id: string) => {
      for (let i = 0; i < 1000; i++) {
        const j = u(s.get(id));
        if (!["queued", "running"].includes(j.status)) return j;
        await new Promise((r) => setTimeout(r, 10));
      }
      throw Error("job timeout");
    };
    const original = structuredClone(b.project),
      id = u(s.submit(b, request)).id;
    b.project.revision = 1;
    b.project.bones[0].setup.x += 1000;
    const a = await wait(id);
    if (a.status !== "succeeded") throw Error(JSON.stringify(a));
    b.project = original;
    const repeated = await wait(u(s.submit(b, request)).id);
    const hashesMatch =
      JSON.stringify(
        a.artifacts
          .filter((a: any) => a.mimeType === "image/png")
          .map((a: any) => a.sha256),
      ) ===
      JSON.stringify(
        repeated.artifacts
          .filter((a: any) => a.mimeType === "image/png")
          .map((a: any) => a.sha256),
      );
    const poseA = u(
      await s.renderPose(b, { animationId: "wave", time: 0.5, viewport: v }),
    );
    const poseB = u(
      await s.renderPose(b, { animationId: "wave", time: 0.5, viewport: v }),
    );
    const poseDeterministic =
      JSON.stringify([...poseA.png]) === JSON.stringify([...poseB.png]);
    const manifest = u(s.getManifest(id)),
      inline = u(await o.imageContent(s, a.artifacts[0].id));
    const contact = document.createElement("canvas");
    contact.width = 1280;
    contact.height = 720;
    const ctx = contact.getContext("2d")!;
    const frames = [];
    for (let i = 0; i < 12; i++) {
      const bytes = u(await s.readArtifact(a.artifacts[i].id)),
        bitmap = await createImageBitmap(new Blob([bytes]));
      ctx.drawImage(bitmap, (i % 4) * 320, Math.floor(i / 4) * 240, 320, 240);
      bitmap.close();
      frames.push([...bytes]);
    }
    const contactPng = [
      ...new Uint8Array(
        await (
          await new Promise<Blob>((r) => contact.toBlob((b) => r(b!)))
        ).arrayBuffer(),
      ),
    ];
    const portable = document.createElement("img");
    portable.id = "agent-image";
    portable.alt = "Agent portable PNG";
    portable.src = inline.dataUrl;
    portable.width = 320;
    document.body.append(portable);
    await portable.decode();
    const preview = await wait(
      u(
        s.submit(b, {
          kind: "preview",
          animationId: "wave",
          fps: 12,
          loops: 3,
          viewport: v,
        }),
      ).id,
    );
    if (preview.status !== "succeeded") throw Error(JSON.stringify(preview));
    const mediaUrls = new Set<string>();
    let createdUrls = 0;
    const createUrl = URL.createObjectURL.bind(URL),
      revokeUrl = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = createUrl(blob);
      mediaUrls.add(url);
      createdUrls++;
      return url;
    };
    URL.revokeObjectURL = (url) => {
      mediaUrls.delete(url);
      revokeUrl(url);
    };
    u(await o.mountPreview(s, preview.id, document.querySelector("main")));
    Object.assign(window, {
      review: {
        s,
        previewId: preview.id,
        manifest,
        frames,
        mediaUrls,
        createdUrls,
      },
    });
    const bad = await h.robot();
    bad.project = structuredClone(original);
    bad.assets.get(bad.project.assets[0].id)[0] = 0;
    const invalid = await wait(u(s.submit(bad, request)).id);
    return {
      hashesMatch,
      poseDeterministic,
      manifest,
      previewFrames: u(s.getManifest(preview.id)).frames.length,
      invalidStatus: invalid.status,
      inlinePixels: [portable.naturalWidth, portable.naturalHeight],
      frames,
      contactPng,
      zip: [...u(await s.readArtifact(a.artifacts[12].id))],
    };
  });
  expect(result.hashesMatch).toBe(true);
  expect(result.poseDeterministic).toBe(true);
  expect(result.manifest.revision).toBe(0);
  expect(result.manifest.frames).toHaveLength(12);
  expect(result.previewFrames).toBe(72);
  expect(result.invalidStatus).toBe("failed");
  expect(result.inlinePixels).toEqual([640, 480]);
  expect(
    new Set(result.manifest.frames.map((f: any) => JSON.stringify(f.viewport)))
      .size,
  ).toBe(1);
  await expect(page.locator("main img")).toBeVisible();
  const observed = new Set<string>();
  for (let i = 0; i < 65; i++) {
    observed.add(
      (await page.locator("main section").getAttribute("data-frame")) ?? "",
    );
    await page.waitForTimeout(100);
  }
  expect(observed.size).toBeGreaterThan(45);
  await page.screenshot({ path: "evidence/issue-11/browser-preview.png" });
  const cleanup = await page.evaluate(() => {
    const r = (window as any).review;
    r.s.release(r.previewId);
    return {
      removed: document.querySelector("main section") === null,
      expired: r.s.get(r.previewId).ok,
      remainingUrls: r.mediaUrls.size,
      createdUrls: r.createdUrls,
    };
  });
  expect(cleanup).toEqual({
    removed: true,
    expired: false,
    remainingUrls: 0,
    createdUrls: 73,
  });
  writeFileSync(
    "evidence/issue-11/contact-12.png",
    Buffer.from(result.contactPng),
  );
  result.frames.forEach((f: number[], i: number) =>
    writeFileSync(
      `evidence/issue-11/frame-${String(i).padStart(4, "0")}.png`,
      Buffer.from(f),
    ),
  );
  writeFileSync("evidence/issue-11/sequence.zip", Buffer.from(result.zip));
  writeFileSync(
    "evidence/issue-11/browser-results.json",
    JSON.stringify(
      {
        browser: browser.version(),
        hashesMatch: result.hashesMatch,
        poseDeterministic: result.poseDeterministic,
        manifest: result.manifest,
        previewFrames: result.previewFrames,
        invalidStatus: result.invalidStatus,
        inlinePixels: result.inlinePixels,
        playbackObservedFrames: observed.size,
        playbackObservedMilliseconds: 6500,
        cleanup,
      },
      null,
      2,
    ),
  );
});
