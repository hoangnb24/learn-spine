# #5 — Bằng chứng nghiệm thu

Ngày 11/09/2026, implementation commit `79af0417eef6d81b8e734123085f2c0e177b2ea8`, [PR #32](https://github.com/hoangnb24/learn-spine/pull/32). Các ảnh là screenshot phần mềm chạy thật, không phải concept.

## Kết quả thực tế

- macOS 26.4 (25E246), arm64, Node 22.22.3, npm 10.9.8: `npm ci`, `npm run typecheck`, `npm test` (2/2), `npm run build` đều exit 0 tại `platform/`. Không cài root package. `npm ci` báo 0 vulnerabilities.
- Clean GitHub runner Ubuntu 24.04, Node 22.22.3/npm 10.9.8: [PR CI run 34559077052](https://github.com/hoangnb24/learn-spine/actions/runs/34559077052) và [push CI run 34559062271](https://github.com/hoangnb24/learn-spine/actions/runs/34559062271) **success**. CI chạy đủ install/typecheck/unit/build/Chromium install/browser smoke. Unit 2/2; browser 2/2, gồm direct entry, reload, navigation, không lỗi console/runtime, 390px và keyboard focus/Enter.
- Dependency tree, manifest/lockfile và source sản phẩm không có `@esotericsoftware/*`; build tách editor/player và chunk shared.
- Browser skill / Codex in-app browser: kiểm tra production preview tại cổng 5175, Editor và Player đúng empty state, điều hướng hai chiều, reload Player vẫn hiện đúng, console error list rỗng. Kiểm tra dev tại cổng 5176 sau fresh install: Editor/Player hiển thị đúng, console error list rỗng.

Lần đầu mở dev server đang chạy khi `npm ci` thay dependencies có trang trống; dừng server và chạy lại sau cài đặt đã xử lý. Không cần đổi source. Tái lập nên hoàn tất install trước khi khởi động server.

## Ảnh và đối chiếu thiết kế

- [Editor desktop](editor-desktop.jpg): viewport mặc định 1280×720, từ production preview. Bố cục cây/canvas/thuộc tính/chuyển động, navy/teal theo concept đã duyệt. Không có robot, track, keyframe hay thao tác lưu giả.
- [Player desktop](player-desktop.jpg): viewport mặc định 1280×720, từ production preview. Trang riêng không mang inspector/cây/timeline.
- [Editor 390px](editor-narrow.jpg): viewport 390×844, từ dev server sau clean install. Canvas lên trước; cây và thuộc tính thành hai cột bên dưới; trang cuộn dọc để giữ nội dung đọc được. Đã reset override sau kiểm tra.

Không tuyên bố animation, renderer, lưu/mở project, WebMCP hoặc ba gate đã đạt. Chưa kiểm tra Safari/Firefox. Ảnh chỉ chứng minh shell hiển thị; CI browser assertions mới kiểm tra điều hướng/keyboard/no-errors.

## Đầu vào tiếp theo

#6 nhận `platform/` có lockfile và các lệnh tái lập trong [README](../../README.md), triển khai `src/model` theo hợp đồng duy nhất ở `docs/product/contracts`. `src/index.ts` chỉ là trạng thái workspace empty, không tạo model chưa hợp lệ. Sau #6, #7/#8/#10 tiếp nhận module riêng; #12 mới ghép tương tác UI. Không cần thay root package hoặc art.
