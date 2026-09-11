# Gate 1 — nhận về chức năng/hình ảnh; hiệu năng chuyển sang polish

Ngày 11/09/2026. Robot đã hoàn tất đường đi art → native tools → editor → ZIP → mở lại → player độc lập. **Chủ dự án chấp nhận Gate 1 về chức năng và hình ảnh ngày 11/09/2026**, đồng thời chuyển phần hiệu năng sang giai đoạn polish. Kết quả run ban đầu vẫn không đạt ngưỡng 16,7 ms; không đổi số đo, rubric hoặc lịch sử.

Quyết định sau review: “Phần này có thể để sau ở giai đoạn polish thành issues mới. Mình chấp nhận khi chức năng đạt.” Đây là thay đổi tiêu chí nhận bàn giao sản phẩm, không phải một lần benchmark pass mới.

[Brief và rubric](brief.md) được commit trước khi chạy tại `8d533fb8eedb8df38a5938fbfdb90ce6aa0c596a`. Lần Gate đầy đủ đo source app và harness tại `a91c27cd93541b7b320b9b54c2451894b8fcd018`; [gate-results.json](gate-results.json) ghi SHA này. Những commit sau bổ sung report, scripts/media, formatting và bằng chứng; không tối ưu renderer, evaluator, commands hoặc thời gian animation.

## Kết quả thực tế

| Tiêu chí | Kết quả | Bằng chứng |
| --- | --- | --- |
| Agent dựng/sửa trong editor bằng WebMCP thật | Đạt trên Codex In-app Browser: 24 tools; từ ZIP chỉ có 15 PNG và root, tạo rig/attachments/idle/wave rồi quan sát và sửa wave; revision 0→5 | [Native transcript cuối](native-final-session.json), [ảnh nhận từ tool](native-final-after.png), [editor cùng revision](native-final-editor.png) |
| 12 mốc mỗi animation, transform editor/player ≤1e-5 | Đạt, lớn nhất `1.8758328224066645e-12`; so tất cả thành phần ma trận của 16 bones và 15 regions từ các lần Stage thực sự gọi renderer | [24 đối chiếu và pose đầy đủ](gate-results.json) |
| Hình nhất quán trên cùng renderer/máy | Đạt: 24/24 PNG lấy trực tiếp từ canvas của editor và player trùng bytes, không gồm lớp vẽ xương của UI | [Idle](idle-contact.png), [Wave](wave-contact.png), các file `editor/player-idle/wave-NN.png` |
| Xuất, đóng trang, mở lại và player chỉ dùng ZIP | Đạt: project JSON giữ nguyên; ZIP xuất lại trùng bytes native ZIP; archive chỉ có project.json + 15 PNG đúng hash; player chạy trong browser context mới sau khi editor đóng, không request editor/source art/Spine | [Project ZIP](../../../../platform/fixtures/robot/native-project.zip), [ZIP xuất lại](editor-export.zip), [archive validation](archive-validation.json), requests và recovered trong gate-results |
| Undo/redo batch keys; lỗi không sửa dở | Đạt: một batch thay 3 kênh được undo/redo rồi undo phục hồi toàn bộ nội dung (revision tăng theo hợp đồng); batch có thao tác hợp lệ rồi remove ID thiếu và ZIP hỏng đều giữ nguyên project | `history` trong [gate-results](gate-results.json) |
| Xem playback ≥3 vòng và review hình/nhịp | Đã review riêng: idle 6 giây, wave 12 giây, 12 fps từ native preview; đủ bộ phận, không cắt cực trị hay nhảy mốc nối ngoài chủ ý | [Review hình/nhịp](visual-review.md), [trình xem](viewer.html), [idle video](idle-three-loops.mp4), [wave video](wave-three-loops.mp4) |
| 1280×720, 30 giây sau warm-up, p95 frame ≤16,7 ms | **Chưa đạt**: khoảng giữa các lần gọi draw có p95 **17,80 ms editor**, **17,50 ms player**. Cả hai run có 1.800 lần draw, hơn 30 giây; CPU draw submission p95 khoảng 0,20 ms không thay thế frame gate | [Editor raw](editor-performance.json), [Player raw](player-performance.json), [test thất bại đúng tại hai assertion hiệu năng](gate-test.log) |
| Overhead capture riêng | Đã đo riêng, không chụp trong run hiệu năng. 12 PNG 1280×720: public sequence 461,5 ms toàn job; renderer đã prepare có capture p95 158,4 ms trong 12 mẫu (gồm draw/readback/encode, không chỉ encoder) | [Capture raw](capture-overhead.json), [capture test](capture-test.log) |

## Đọc đúng phép đo hiệu năng

Môi trường: **Vite dev build**, React StrictMode, macOS 26.4, Mac Studio M4 Max 14 CPU cores, RAM 36 GB, Node 22.22.3, npm 10.9.8. Test chạy **Playwright Headless Chromium 153.0.8010.12, WebGL qua ANGLE Vulkan SwiftShader** (renderer bằng phần mềm), không phải kết quả GPU Apple được tăng tốc. Native agent và playback review chạy Codex In-app Browser Chrome 152.0.0.0. [Môi trường máy](environment.json), [môi trường native](native-environment.json); chuỗi GPU thật nằm trong từng raw performance file.

Canvas thực tế 1280×720 CSS/backing pixels, DPR 1; viewport cửa sổ 1900×1300 để editor chứa được canvas. Harness chỉ đặt kích thước stage, không sửa thuật toán. Chọn Wave, phát 5 giây warm-up rồi lấy liên tục 30 giây; không screenshot/capture và không chạy native observation jobs trong khoảng này. p95 dùng nearest rank `ceil(N×0.95)-1`, giữ nguyên số thô.

- `cpuMs`: từ trước đến sau **hàm draw đồng bộ**. Bao gồm validation/geometry/upload/submission trong draw; không bao gồm evaluator, React, GPU completion hoặc compositor. Đây **không phải tổng work time của một frame**.
- `p95RenderedUpdateIntervalMs` trong JSON là tên trường cũ của **khoảng giữa start của hai lần gọi draw bởi Stage**, không phải callback báo đã trình chiếu. Cả editor/player được ghi ở cùng boundary, không gọi evaluator thay cho ứng dụng.
- `rafIntervals` là khoảng timestamp requestAnimationFrame. p95 raw `16.700000000004366` ms ở run cuối, xấp xỉ 16,7 ms trong độ phân giải timer; không coi sai số biểu diễn rất nhỏ này là bằng chứng engine chậm. Draw-call cadence vẫn vượt rõ ràng 17,8/17,5 ms nên kết luận chưa đạt không dựa riêng vào sai số làm tròn.
- **Instrumentation cũng có overhead chưa cô lập**: sau mỗi draw, harness structuredClone pose và viewport để ghi pose thật. Phần đó nằm ngoài cpuMs nhưng ảnh hưởng cadence. Capture-overhead test không đo thay chi phí này. Không trừ một overhead giả định khỏi kết quả và không tuyên bố đây là tốc độ không có instrumentation.
- **Physical presentation/GPU completion chưa đo được** bằng API đang dùng. Draw-call intervals và rAF là proxy theo rubric đã khóa; kết quả không chứng nhận màn hình thật trình chiếu mỗi 16,7 ms.

[Control trang trống](scheduler-control.json) (không editor/evaluator/renderer, warm-up 5 giây + 30 giây) cũng có rAF p95 xấp xỉ 16,7 ms. Control giúp thấy mức cadence của host, **không** thay gate hay chứng minh rằng jitter của ứng dụng chỉ do host. CPU submission nhỏ, dữ liệu/hình đúng và control này chưa phân biệt được scheduling, React, SwiftShader hay overhead ghi log. **Chưa xác định lỗi implementation cụ thể để quy cho một module**, và không tự sửa/đổi kiến trúc để tìm một số pass.

## Hiện vật và chạy lại

Từ repository root:

```sh
python3 platform/fixtures/robot/prepare.py
cd platform
npm ci --ignore-scripts
npm run dev -- --port 4184 --strictPort
```

Giữ server trên một terminal; tại terminal khác từ `platform/`:

```sh
npx playwright test -c tests/e2e/robot/playwright.config.ts
npx playwright test -c tests/e2e/robot/media.playwright.config.ts
```

Lệnh Gate ở trên tái chạy phép đo theo rubric ban đầu, không phải bộ chặn nghiệm thu chức năng theo quyết định mới. Test vẫn trả exit 1 khi cadence không đạt; không xfail, không bỏ assertion. Nó ghi kết quả đầy đủ trước hai assertion hiệu năng cuối. Không dùng `npm run test:browser` đồng thời với server 4184 vì suite cũ tự chiếm port đó. Gate/performance không nằm trong CI mặc định; CI xanh không chứng minh hiệu năng đạt 16,7 ms.

Native reproduction: mở editor, chọn art-input.zip, dùng Browser skill lấy handle thật `tab.capabilities.get('webmcp').fetchTools()`. Chạy [native-recipe.mjs](../../../../platform/tests/e2e/robot/native-recipe.mjs) với [commands.json](../../../../platform/fixtures/robot/commands.json), [corrected-wave.json](corrected-wave.json) và callback hiển thị/lưu image block thật. Sau save, nhấn link “Tải kết quả bản 5”. Recipe không chọc vào editor globals hay sửa project file; input assets được người dùng/host nạp qua UI. [Transcript media](native-media-session.json) ghi tham số preview_animation/get_job_status/read_artifact. Preview idle 72 PNG, wave 144 PNG, fps12/loops3, viewport480×360; tải ZIP qua link từ tool và giữ thành [idle-preview.zip](idle-preview.zip)/[wave-preview.zip](wave-preview.zip).

Từ root, `python3 platform/tests/e2e/robot/prepare-media.py` kiểm CRC/hash, xác nhận ba vòng PNG trùng từng frame và tạo MP4/contact sheets từ PNG thật. Cần Python/Pillow và ffmpeg. `python3 -m http.server 4185 --bind 127.0.0.1 --directory docs/product/results/experiment-1` rồi mở [viewer](http://127.0.0.1:4185/viewer.html) hoặc [trang review cố định](http://127.0.0.1:4185/playback-review.html). Video chỉ là bản xem từ PNG, không bổ sung một export codec vào sản phẩm.

Kiểm tra regression: `npm run typecheck`, `npm test` (77 tests), `npm run build`, `npm run test:browser` (15 tests) đều đã pass. Build có cảnh báo chunk >500 kB; chưa tối ưu bundle. Bằng chứng kiểm tra cuối được ghi trong verification.log và CI của PR; số Gate nêu trên vẫn giữ source/run gốc.

## Các lần sửa harness và giới hạn còn lại

Hai lần thử ban đầu chưa đi hết gate: lần 1 polling inspect quá sớm trước khi mở xong project; lần 2 screenshot theo bounding box canvas còn lấy SVG overlay UI nên so bytes không đúng loại ảnh cần đo. Đã sửa await và lấy PNG trực tiếp canvas; giữ [attempt 1](gate-attempt-1.log), [attempt 2](gate-attempt-2.log) và các raw editor performance tương ứng. Không hạ threshold hay tối ưu sản phẩm giữa các lần đo. Run cuối hoàn tất và chỉ fail hai assertion cadence.

Lần playback đầu có screenshot crop không ổn định khi DOM status dài làm đổi layout; logs còn ở playback-*-attempt-1-log.json. Đã xem lại từ đầu bằng trang khung cố định và screenshot toàn viewport, lưu log/ảnh cuối cùng riêng. Visual judgement dựa trên lần cuối và PNG đầy đủ, không dựa trên ảnh crop lỗi.

Chưa đo baseline Spine mới (Trial), không tuyên bố nhanh hơn Spine. Chưa benchmark production build/hardware acceleration/browser khác, chưa đo tổng CPU frame hoặc GPU presentation; không suy pass cho phần chưa đo. Đây một workflow Gate 1, không phải Gate 3 ba lần/budget/token benchmark. Chi phí/token riêng của native brief không được API cung cấp. Native execution AbortSignal vẫn unavailable theo #13; cancel_job là cơ chế app-owned đã có, không phải tuyên bố đã sửa transport.

## Quyết định sau run — 11/09/2026

Chủ dự án nhận kết quả chức năng/hình ảnh của Gate 1; phần cadence 17,8/17,5 ms chưa đạt chuẩn cũ được chuyển sang polish thành công việc riêng. Các giới hạn instrumentation, scheduling, dev build/SwiftShader và physical presentation phía trên vẫn áp dụng. Không tự chọn nguyên nhân hay triển khai tối ưu trong PR này.

Orchestrator cập nhật trạng thái #14 và dependency #15/#16 theo quyết định mới sau nghiệm thu độc lập. Report không còn yêu cầu giữ downstream bị chặn chỉ vì phép đo hiệu năng này. Raw `gatePassed: false`, test exit 1, các attempts, brief và rubric là lịch sử của run ban đầu và được giữ nguyên; chức năng được nhận theo quyết định sản phẩm bổ sung này.
