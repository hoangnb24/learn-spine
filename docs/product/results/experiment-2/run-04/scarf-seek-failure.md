# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: recheck.spec.ts >> recheck recorded UI seeks scarf
- Location: tests/e2e/deformation/recheck.spec.ts:17:3

# Error details

```
Error: expect(received).toBeCloseTo(expected, precision)

Expected: 0.73
Received: 0.7334000000000003

Expected precision:    8
Expected difference: < 0.000000005
Received difference:   0.0034000000000002917

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
    - navigation "Ứng dụng" [ref=e7]:
      - link "Editor" [ref=e8] [cursor=pointer]:
        - /url: ./index.html
      - link "Player" [ref=e9] [cursor=pointer]:
        - /url: ./player.html
    - generic [ref=e10]: Không gian sáng tạo 2D
  - generic [ref=e11]:
    - button "Project mới" [ref=e12] [cursor=pointer]
    - generic [ref=e13] [cursor=pointer]:
      - text: Mở gói
      - button "Mở gói project" [ref=e14]
    - button "Khôi phục bản lưu" [ref=e15] [cursor=pointer]
    - generic [ref=e16]: Gate2 scarf
    - button "Hoàn tác" [disabled] [ref=e17]
    - button "Làm lại" [disabled] [ref=e18]
    - button "Lưu trình duyệt" [ref=e19] [cursor=pointer]
    - button "Tải gói project" [ref=e20] [cursor=pointer]
  - generic [ref=e21]:
    - button "Setup" [ref=e22] [cursor=pointer]
    - button "Animate" [pressed] [ref=e23] [cursor=pointer]
    - paragraph [ref=e24]: Chỉnh key theo thời gian · Giá trị tuyệt đối, góc radian
  - status [ref=e26]: Đã lưu bản 5 trên trình duyệt.
  - main "Editor" [ref=e27]:
    - region "Cấu trúc / Ảnh" [ref=e28]:
      - heading "Cấu trúc / Ảnh" [level=2] [ref=e29]
      - generic [ref=e30]:
        - tree "Cây xương" [ref=e31]:
          - treeitem "◇ root" [level=1] [selected] [ref=e32] [cursor=pointer]
          - treeitem "◇ mid" [level=2] [ref=e33] [cursor=pointer]
          - treeitem "◇ tip" [level=2] [ref=e34] [cursor=pointer]
        - generic [ref=e35]:
          - textbox "Tên xương mới" [ref=e36]: Xương mới
          - button "Thêm xương" [ref=e37] [cursor=pointer]
        - heading "Ảnh gắn xương" [level=3] [ref=e38]
        - paragraph [ref=e39]: PNG mới gắn vào xương đang chọn, tâm ảnh tại gốc xương. Chỉnh bố trí trong Thuộc tính.
        - generic [ref=e40] [cursor=pointer]:
          - text: Nạp PNG
          - button "Nạp PNG" [ref=e41]
        - generic [ref=e42]:
          - text: Mesh
          - combobox "Xương của Mesh" [ref=e43]:
            - option "root" [selected]
            - option "mid"
            - option "tip"
    - region "Vùng làm việc" [ref=e44]:
      - generic [ref=e45]:
        - img "Xương trên canvas":
          - button "Chọn xương root" [ref=e47] [cursor=pointer]
          - button "Chọn xương mid" [ref=e48] [cursor=pointer]
          - button "Chọn xương tip" [ref=e49] [cursor=pointer]
        - generic [ref=e50]:
          - button "Vừa khung" [ref=e51] [cursor=pointer]
          - generic [ref=e52]:
            - text: Thu phóng
            - combobox "Thu phóng" [ref=e53]:
              - option "50%"
              - option "100%" [selected]
              - option "200%"
    - region "Thuộc tính" [ref=e54]:
      - heading "Thuộc tính" [level=2] [ref=e55]
      - generic [ref=e56]:
        - button "Thuộc tính" [pressed] [ref=e57] [cursor=pointer]
        - button "Lưới / IK" [ref=e58] [cursor=pointer]
        - button "Lịch sử" [ref=e59] [cursor=pointer]
      - generic [ref=e60]:
        - heading "root" [level=3] [ref=e61]
        - generic [ref=e62]:
          - generic [ref=e63]:
            - text: Tên xương
            - textbox "Tên xương" [ref=e64]: root
          - generic [ref=e65]:
            - text: Xương cha
            - combobox "Xương cha" [ref=e66]:
              - option "Không có" [selected]
              - option "mid"
              - option "tip"
          - generic [ref=e67]:
            - text: Vị trí X
            - spinbutton "Vị trí X" [ref=e68]: "0"
          - generic [ref=e69]:
            - text: Vị trí Y
            - spinbutton "Vị trí Y" [ref=e70]: "0"
          - generic [ref=e71]:
            - text: Góc xoay (radian)
            - spinbutton "Góc xoay (radian)" [ref=e72]: "-0.3490658503988659"
          - generic [ref=e73]:
            - text: Tỉ lệ X
            - spinbutton "Tỉ lệ X" [ref=e74]: "1"
          - generic [ref=e75]:
            - text: Tỉ lệ Y
            - spinbutton "Tỉ lệ Y" [ref=e76]: "1"
          - button "Áp dụng thuộc tính" [ref=e77] [cursor=pointer]
        - paragraph [ref=e78]: Thuộc tính sửa tư thế Setup. Animate thêm key ở thanh thời gian.
    - region "Chuyển động" [ref=e79]:
      - heading "Chuyển động" [level=2] [ref=e80]
      - generic [ref=e81]:
        - generic [ref=e82]:
          - button "Cycle" [pressed] [ref=e83] [cursor=pointer]
          - generic [ref=e84]:
            - textbox "Tên chuyển động mới" [ref=e85]: wave
            - button "Thêm chuyển động" [ref=e86] [cursor=pointer]
        - generic [ref=e87]:
          - generic [ref=e88]:
            - button "Phát" [ref=e89] [cursor=pointer]
            - generic [ref=e90]:
              - text: Thời gian (giây)
              - spinbutton "Thời gian (giây)" [active] [ref=e91]: "0.73"
            - generic [ref=e92]: 2.00 s · Lặp
          - slider "Thanh thời gian" [ref=e93]: "0.73"
          - generic [ref=e94]:
            - generic [ref=e95]:
              - generic [ref=e96]: mid / Vị trí Y
              - generic [ref=e97]:
                - button "Key 0 Vị trí Y" [ref=e98] [cursor=pointer]: ◆
                - button "Key 0.5 Vị trí Y" [ref=e99] [cursor=pointer]: ◆
                - button "Key 1 Vị trí Y" [ref=e100] [cursor=pointer]: ◆
                - button "Key 1.5 Vị trí Y" [ref=e101] [cursor=pointer]: ◆
                - button "Key 2 Vị trí Y" [ref=e102] [cursor=pointer]: ◆
            - generic [ref=e103]:
              - generic [ref=e104]: tip / Vị trí Y
              - generic [ref=e105]:
                - button "Key 0 Vị trí Y" [ref=e106] [cursor=pointer]: ◆
                - button "Key 0.25 Vị trí Y" [ref=e107] [cursor=pointer]: ◆
                - button "Key 0.5 Vị trí Y" [ref=e108] [cursor=pointer]: ◆
                - button "Key 0.75 Vị trí Y" [ref=e109] [cursor=pointer]: ◆
                - button "Key 1 Vị trí Y" [ref=e110] [cursor=pointer]: ◆
                - button "Key 1.25 Vị trí Y" [ref=e111] [cursor=pointer]: ◆
                - button "Key 1.5 Vị trí Y" [ref=e112] [cursor=pointer]: ◆
                - button "Key 1.75 Vị trí Y" [ref=e113] [cursor=pointer]: ◆
                - button "Key 2 Vị trí Y" [ref=e114] [cursor=pointer]: ◆
          - generic [ref=e115]:
            - combobox "Thuộc tính key" [ref=e116]:
              - option "Vị trí X"
              - option "Vị trí Y"
              - option "Góc xoay (radian)" [selected]
              - option "Tỉ lệ X"
              - option "Tỉ lệ Y"
            - spinbutton "Giá trị key" [ref=e117]: "0"
            - combobox "Nội suy key" [ref=e118]:
              - option "Thẳng" [selected]
              - option "Giữ bước"
            - button "Đặt key" [ref=e119] [cursor=pointer]
  - contentinfo [ref=e120]:
    - generic [ref=e121]: Bản 5 · Đã lưu trên trình duyệt
    - generic [ref=e122]: Agent chưa kết nối · Tải gói để mở trong Player
```

# Test source

```ts
  1   | import { expect, type Page } from "@playwright/test";
  2   | import { mkdirSync, writeFileSync } from "node:fs";
  3   | import { resolve } from "node:path";
  4   | import { fileURLToPath } from "node:url";
  5   | const run = process.env.GATE2_RUN ?? "run-01";
  6   | export const output = fileURLToPath(
  7   |   new URL(
  8   |     `../../../../docs/product/results/experiment-2/${run}/`,
  9   |     import.meta.url,
  10  |   ),
  11  | );
  12  | mkdirSync(output, { recursive: true });
  13  | export const save = (name: string, value: unknown) =>
  14  |   writeFileSync(resolve(output, name), JSON.stringify(value, null, 2));
  15  | export async function instrument(page: Page) {
  16  |   await page.evaluate(async () => {
  17  |     const path = "/src/render/index.ts";
  18  |     const { PixiRenderer } = await import(/* @vite-ignore */ path);
  19  |     const state: any = {
  20  |       latest: null,
  21  |       playback: false,
  22  |       perf: false,
  23  |       poses: [],
  24  |       draws: [],
  25  |     };
  26  |     (window as any).__gate2 = state;
  27  |     const original = PixiRenderer.prototype.draw;
  28  |     PixiRenderer.prototype.draw = function (pose: any, viewport: any) {
  29  |       const start = performance.now(),
  30  |         result = original.call(this, pose, viewport),
  31  |         end = performance.now();
  32  |       if (state.perf)
  33  |         state.draws.push({
  34  |           start,
  35  |           end,
  36  |           cpuMs: end - start,
  37  |           time: pose.sampledTime,
  38  |         });
  39  |       else {
  40  |         state.latest = { pose: structuredClone(pose), viewport, ok: result.ok };
  41  |         if (state.playback)
  42  |           state.poses.push({
  43  |             at: start,
  44  |             pose: structuredClone(pose),
  45  |             ok: result.ok,
  46  |           });
  47  |       }
  48  |       return result;
  49  |     };
  50  |   });
  51  |   await page.addStyleTag({
  52  |     content:
  53  |       ".stage{width:1280px!important;height:720px!important;flex:none!important;min-width:1280px!important;min-height:720px!important}",
  54  |   });
  55  | }
  56  | export async function drawn(page: Page) {
  57  |   return page.evaluate(() => (window as any).__gate2.latest);
  58  | }
  59  | export async function seek(page: Page, app: "editor" | "player", time: number) {
  60  |   if (app === "editor")
  61  |     await page
  62  |       .getByLabel("Thời gian (giây)", { exact: true })
  63  |       .fill(String(time));
  64  |   else
  65  |     await page
  66  |       .getByLabel("Thanh thời gian", { exact: true })
  67  |       .evaluate((node: any, value) => {
  68  |         node.step = "any";
  69  |         Object.getOwnPropertyDescriptor(
  70  |           HTMLInputElement.prototype,
  71  |           "value",
  72  |         )!.set!.call(node, String(value));
  73  |         node.dispatchEvent(new Event("input", { bubbles: true }));
  74  |         node.dispatchEvent(new Event("change", { bubbles: true }));
  75  |       }, time);
  76  |   const effectiveInput = Number(
  77  |     await page
  78  |       .getByLabel(app === "editor" ? "Thời gian (giây)" : "Thanh thời gian", {
  79  |         exact: true,
  80  |       })
  81  |       .inputValue(),
  82  |   );
  83  |   const normalizedTime = ((effectiveInput % 2) + 2) % 2;
  84  |   await expect
  85  |     .poll(async () => (await drawn(page))?.pose.sampledTime)
> 86  |     .toBeCloseTo(normalizedTime, 8);
      |      ^ Error: expect(received).toBeCloseTo(expected, precision)
  87  |   return {
  88  |     ...(await drawn(page)),
  89  |     requestedTime: time,
  90  |     effectiveInput,
  91  |     normalizedTime,
  92  |   };
  93  | }
  94  | const numbers = (p: any) =>
  95  |   [
  96  |     ...Object.values(p.bones).flat(),
  97  |     ...p.meshes.flatMap((m: any) => m.vertices),
  98  |     ...p.regions.flatMap((r: any) => r.world),
  99  |   ] as number[];
  100 | export function delta(a: any, b: any) {
  101 |   const av = numbers(a),
  102 |     bv = numbers(b);
  103 |   expect(av.length).toBe(bv.length);
  104 |   return Math.max(0, ...av.map((n, i) => Math.abs(n - bv[i])));
  105 | }
  106 | export async function playback(
  107 |   page: Page,
  108 |   app: "editor" | "player",
  109 |   kind: string,
  110 | ) {
  111 |   const initial = await seek(page, app, 0);
  112 |   await page.evaluate(() => {
  113 |     const s = (window as any).__gate2;
  114 |     s.playback = true;
  115 |     s.poses = [
  116 |       {
  117 |         at: performance.now(),
  118 |         pose: structuredClone(s.latest.pose),
  119 |         ok: s.latest.ok,
  120 |       },
  121 |     ];
  122 |     const stream = document.querySelector("canvas")!.captureStream(30);
  123 |     s.videoChunks = [];
  124 |     s.recorder = new MediaRecorder(stream, {
  125 |       mimeType: "video/webm;codecs=vp9",
  126 |     });
  127 |     s.recorder.ondataavailable = (e: any) => s.videoChunks.push(e.data);
  128 |     s.recorder.start();
  129 |   });
  130 |   await page.getByRole("button", { name: "Phát", exact: true }).click();
  131 |   await page.waitForTimeout(6500);
  132 |   await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  133 |   const capture = await page.evaluate(
  134 |     () =>
  135 |       new Promise<any>((resolve) => {
  136 |         const s = (window as any).__gate2;
  137 |         s.playback = false;
  138 |         s.recorder.onstop = async () => {
  139 |           const bytes = new Uint8Array(
  140 |             await new Blob(s.videoChunks, { type: "video/webm" }).arrayBuffer(),
  141 |           );
  142 |           s.recorder.stream.getTracks().forEach((t: any) => t.stop());
  143 |           resolve({ frames: s.poses, bytes: Array.from(bytes) });
  144 |         };
  145 |         s.recorder.stop();
  146 |       }),
  147 |   );
  148 |   const frames = capture.frames;
  149 |   writeFileSync(
  150 |     resolve(output, `${kind}-${app}-playback.webm`),
  151 |     new Uint8Array(capture.bytes),
  152 |   );
  153 |   save(`${kind}-${app}-playback.json`, frames);
  154 |   expect(frames.length).toBeGreaterThan(120);
  155 |   expect(frames.every((f: any) => f.ok)).toBe(true);
  156 |   const wraps = frames.filter(
  157 |     (f: any, i: number) =>
  158 |       i > 0 && f.pose.sampledTime < frames[i - 1].pose.sampledTime,
  159 |   );
  160 |   expect(wraps.length).toBeGreaterThanOrEqual(3);
  161 |   // First forward cycle is an actual successful draw stream, not evaluator snapshots.
  162 |   const first = frames
  163 |     .slice(0, frames.indexOf(wraps[0]))
  164 |     .filter((f: any) => f.pose.sampledTime > 0);
  165 |   const indices = [
  166 |     7, 1, 15, 3, 19, 0, 12, 5, 17, 9, 2, 14, 6, 18, 10, 4, 16, 8, 13, 11,
  167 |   ];
  168 |   const comparisons = [];
  169 |   for (const index of indices) {
  170 |     const ref = first[Math.floor((index * (first.length - 1)) / 19)],
  171 |       actual = await seek(page, app, ref.pose.sampledTime);
  172 |     const reference = actual.normalizedTime === 0 ? initial : ref;
  173 |     comparisons.push({
  174 |       requestedTime: ref.pose.sampledTime,
  175 |       effectiveInput: actual.effectiveInput,
  176 |       normalizedTime: actual.normalizedTime,
  177 |       referenceTime: reference.pose.sampledTime,
  178 |       referenceSource:
  179 |         actual.normalizedTime === 0
  180 |           ? "recorded initial successful draw"
  181 |           : "recorded forward first-cycle draw",
  182 |       requestedReferenceDelta: delta(ref.pose, actual.pose),
  183 |       delta: delta(reference.pose, actual.pose),
  184 |     });
  185 |   }
  186 |   save(`${kind}-${app}-seeks.json`, comparisons);
```