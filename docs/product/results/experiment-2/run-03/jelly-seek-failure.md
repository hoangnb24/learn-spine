# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: gate.spec.ts >> Gate2 jelly authored and measured
- Location: tests/e2e/deformation/gate.spec.ts:213:3

# Error details

```
Error: expect(received).toBeCloseTo(expected, precision)

Expected: 1.9999999999999991
Received: 0

Expected precision:    8
Expected difference: < 0.000000005
Received difference:   1.9999999999999991

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "learn-spine, về Editor" [ref=e5] [cursor=pointer]:
      - /url: ./index.html
      - generic [aria-hidden] [ref=e6]: ◇
      - text: learn-spine
      - generic [ref=e7]: / Player
    - navigation "Ứng dụng" [ref=e8]:
      - link "Editor" [ref=e9] [cursor=pointer]:
        - /url: ./index.html
      - link "Player" [ref=e10] [cursor=pointer]:
        - /url: ./player.html
    - generic [ref=e11]: Không gian sáng tạo 2D
  - generic [ref=e12]:
    - generic [ref=e13] [cursor=pointer]:
      - text: Mở gói project
      - button "Mở gói project" [ref=e14]
    - generic [ref=e15]: Gate2 jelly
  - main "Player" [ref=e16]:
    - generic [ref=e19]:
      - button "Vừa khung" [ref=e20] [cursor=pointer]
      - generic [ref=e21]:
        - text: Thu phóng
        - combobox "Thu phóng" [ref=e22]:
          - option "50%"
          - option "100%" [selected]
          - option "200%"
  - generic [ref=e23]:
    - combobox "Chọn chuyển động" [ref=e24]:
      - option "Tư thế Setup"
      - option "Cycle" [selected]
    - button "Phát" [active] [ref=e25] [cursor=pointer]
    - slider "Thanh thời gian" [ref=e26]: "2"
    - status [ref=e27]: 2.00 s
  - contentinfo [ref=e28]:
    - generic [ref=e29]: Player
    - generic [ref=e30]: Bản 10 · 1 ảnh trong gói
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import { mkdirSync, writeFileSync } from "node:fs";
  3   | import { resolve } from "node:path";
  4   | import {fileURLToPath} from "node:url";
  5   | import { execFileSync } from "node:child_process";
  6   | const run = process.env.GATE2_RUN ?? "run-01";
  7   | const output = fileURLToPath(new URL(`../../../../docs/product/results/experiment-2/${run}/`,import.meta.url));
  8   | mkdirSync(output, { recursive: true });
  9   | const save = (name: string, value: unknown) =>
  10  |   writeFileSync(resolve(output, name), JSON.stringify(value, null, 2));
  11  | async function instrument(page: Page) {
  12  |   await page.evaluate(async () => {
  13  |     const path = "/src/render/index.ts";
  14  |     const { PixiRenderer } = await import(/* @vite-ignore */ path);
  15  |     const state: any = {
  16  |       latest: null,
  17  |       playback: false,
  18  |       perf: false,
  19  |       poses: [],
  20  |       draws: [],
  21  |     };
  22  |     (window as any).__gate2 = state;
  23  |     const original = PixiRenderer.prototype.draw;
  24  |     PixiRenderer.prototype.draw = function (pose: any, viewport: any) {
  25  |       const start = performance.now(),
  26  |         result = original.call(this, pose, viewport),
  27  |         end = performance.now();
  28  |       if (state.perf)
  29  |         state.draws.push({
  30  |           start,
  31  |           end,
  32  |           cpuMs: end - start,
  33  |           time: pose.sampledTime,
  34  |         });
  35  |       else {
  36  |         state.latest = { pose: structuredClone(pose), viewport, ok: result.ok };
  37  |         if (state.playback)
  38  |           state.poses.push({
  39  |             at: start,
  40  |             pose: structuredClone(pose),
  41  |             ok: result.ok,
  42  |           });
  43  |       }
  44  |       return result;
  45  |     };
  46  |   });
  47  |   await page.addStyleTag({
  48  |     content:
  49  |       ".stage{width:1280px!important;height:720px!important;flex:none!important;min-width:1280px!important;min-height:720px!important}",
  50  |   });
  51  | }
  52  | async function drawn(page: Page) {
  53  |   return page.evaluate(() => (window as any).__gate2.latest);
  54  | }
  55  | async function seek(page: Page, app: "editor" | "player", time: number) {
  56  |   if (app === "editor")
  57  |     await page
  58  |       .getByLabel("Thời gian (giây)", { exact: true })
  59  |       .fill(String(time));
  60  |   else
  61  |     await page
  62  |       .getByLabel("Thanh thời gian", { exact: true })
  63  |       .evaluate((node: any, value) => {
  64  |         node.step = "any";
  65  |         Object.getOwnPropertyDescriptor(
  66  |           HTMLInputElement.prototype,
  67  |           "value",
  68  |         )!.set!.call(node, String(value));
  69  |         node.dispatchEvent(new Event("input", { bubbles: true }));
  70  |         node.dispatchEvent(new Event("change", { bubbles: true }));
  71  |       }, time);
  72  |   await expect
  73  |     .poll(async () => (await drawn(page))?.pose.sampledTime)
> 74  |     .toBeCloseTo(((time % 2) + 2) % 2, 8);
      |      ^ Error: expect(received).toBeCloseTo(expected, precision)
  75  |   return drawn(page);
  76  | }
  77  | const numbers = (p: any) =>
  78  |   [
  79  |     ...Object.values(p.bones).flat(),
  80  |     ...p.meshes.flatMap((m: any) => m.vertices),
  81  |     ...p.regions.flatMap((r: any) => r.world),
  82  |   ] as number[];
  83  | function delta(a: any, b: any) {
  84  |   const av = numbers(a),
  85  |     bv = numbers(b);
  86  |   expect(av.length).toBe(bv.length);
  87  |   return Math.max(0, ...av.map((n, i) => Math.abs(n - bv[i])));
  88  | }
  89  | async function playback(page: Page, app: "editor" | "player", kind: string) {
  90  |   await seek(page, app, 0);
  91  |   await page.evaluate(() => {
  92  |     const s = (window as any).__gate2;
  93  |     s.playback = true;
  94  |     s.poses = [];
  95  |     const stream = document.querySelector("canvas")!.captureStream(30);
  96  |     s.videoChunks = [];
  97  |     s.recorder = new MediaRecorder(stream, {
  98  |       mimeType: "video/webm;codecs=vp9",
  99  |     });
  100 |     s.recorder.ondataavailable = (e: any) => s.videoChunks.push(e.data);
  101 |     s.recorder.start();
  102 |   });
  103 |   await page.getByRole("button", { name: "Phát", exact: true }).click();
  104 |   await page.waitForTimeout(6500);
  105 |   await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  106 |   const capture = await page.evaluate(
  107 |     () =>
  108 |       new Promise<any>((resolve) => {
  109 |         const s = (window as any).__gate2;
  110 |         s.playback = false;
  111 |         s.recorder.onstop = async () => {
  112 |           const bytes = new Uint8Array(
  113 |             await new Blob(s.videoChunks, { type: "video/webm" }).arrayBuffer(),
  114 |           );
  115 |           s.recorder.stream.getTracks().forEach((t: any) => t.stop());
  116 |           resolve({ frames: s.poses, bytes: Array.from(bytes) });
  117 |         };
  118 |         s.recorder.stop();
  119 |       }),
  120 |   );
  121 |   const frames = capture.frames;
  122 |   writeFileSync(
  123 |     resolve(output, `${kind}-${app}-playback.webm`),
  124 |     new Uint8Array(capture.bytes),
  125 |   );
  126 |   save(`${kind}-${app}-playback.json`, frames);
  127 |   expect(frames.length).toBeGreaterThan(120);
  128 |   expect(frames.every((f: any) => f.ok)).toBe(true);
  129 |   const wraps = frames.filter(
  130 |     (f: any, i: number) =>
  131 |       i > 0 && f.pose.sampledTime < frames[i - 1].pose.sampledTime,
  132 |   );
  133 |   expect(wraps.length).toBeGreaterThanOrEqual(3);
  134 |   // First forward cycle is an actual successful draw stream, not evaluator snapshots.
  135 |   const first = frames
  136 |     .slice(0, frames.indexOf(wraps[0]))
  137 |     .filter((f: any) => f.pose.sampledTime > 0);
  138 |   const indices = [
  139 |     7, 1, 15, 3, 19, 0, 12, 5, 17, 9, 2, 14, 6, 18, 10, 4, 16, 8, 13, 11,
  140 |   ];
  141 |   const comparisons = [];
  142 |   for (const index of indices) {
  143 |     const ref = first[Math.floor((index * (first.length - 1)) / 19)],
  144 |       actual = await seek(page, app, ref.pose.sampledTime);
  145 |     comparisons.push({
  146 |       time: ref.pose.sampledTime,
  147 |       delta: delta(ref.pose, actual.pose),
  148 |     });
  149 |   }
  150 |   save(`${kind}-${app}-seeks.json`, comparisons);
  151 |   expect(Math.max(...comparisons.map((c) => c.delta))).toBeLessThanOrEqual(
  152 |     1e-5,
  153 |   );
  154 |   return { frames: frames.length, wraps: wraps.length, comparisons };
  155 | }
  156 | async function perf(page: Page, app: string, kind: string) {
  157 |   await page.getByRole("button", { name: "Phát", exact: true }).click();
  158 |   await page.waitForTimeout(5000);
  159 |   const raw = await page.evaluate(
  160 |     () =>
  161 |       new Promise<any>((resolve) => {
  162 |         const s = (window as any).__gate2;
  163 |         s.draws = [];
  164 |         s.perf = true;
  165 |         const start = performance.now(),
  166 |           raf: number[] = [];
  167 |         function tick(now: number) {
  168 |           raf.push(now);
  169 |           if (now - start < 30000) requestAnimationFrame(tick);
  170 |           else {
  171 |             s.perf = false;
  172 |             const c = document.querySelector("canvas")!,
  173 |               gl = (c.getContext("webgl2") ||
  174 |                 c.getContext("webgl")) as WebGLRenderingContext,
```