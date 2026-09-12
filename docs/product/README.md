# Công cụ animation 2D dành cho agent

Ngày 11/09/2026 · Snapshot code main `564d9eaea2ad6a98fb74672ca9c18931e5b720ac`.

Sản phẩm trong `platform/` đã có workflow PNG tách bộ phận → agent dựng/sửa animation qua WebMCP → quan sát → xuất ZIP → mở lại Editor/Player độc lập, được kiểm chứng trên bộ mẫu robot/khăn và môi trường native ghi trong reports. Lõi sản phẩm độc lập với các bài học và Spine runtime ở root.

Ngày 12/09/2026 — **DEFERRED BY OWNER**. Chủ dự án hoãn chọn nơi sử dụng, đầu ra animation và logic tương ứng đến khi có nhu cầu thực tế. Trọng tâm là tạo, xem và sửa ngay trên trang. Lưu/mở lại, ZIP và Player là khả năng hiện có, không phải nhu cầu đầu ra đã chốt. #22 OPEN/Todo/Deferred; #23–#29 Deferred, #28 chỉ xem lại khi có nhu cầu đầu ra thực. #51 và #52 Todo/Deferred: chủ dự án xác nhận Polish để sau, gồm cả đo/profile baseline và tối ưu. Chưa chọn issue thay thế. Không duyệt MVP hoặc production. [Quyết định #22](decisions/mvp.md), [đối chiếu 12/09](reconciliation/2026-09-12-deferred-output.md).

## Khả năng đã kiểm chứng

- Region rig cha/con, ảnh gắn xương, transform animation; agent tạo robot idle/wave rồi sửa chuyển động cục bộ qua native tools.
- Mesh/weights/deform và IK hai xương trong miền hợp đồng; Gate 2 có mẫu khăn/thạch/chân trụ authored, seek và playback, full/half texture giữ geometry.
- Editor và agent dùng chung Session; revision, atomic batch, undo/redo/checkpoints và lỗi không sửa dở có kiểm tra. Lịch sử undo chỉ trong session, không nằm trong ZIP.
- Quan sát PNG/preview/sequence gắn revision; diagnostics cấu trúc/chuyển động có giới hạn rõ. Region corners cần phép đo bổ sung, chưa nằm đầy đủ trong default diagnostics.
- Lưu trình duyệt, khôi phục và ZIP có project + PNG; ZIP đã mở lại trong Editor và Player riêng. Video trong reports là evidence playback, không phải tính năng xuất video của sản phẩm.

[Gate 1](results/experiment-1/README.md) được nhận chức năng theo quyết định 11/09; hiệu năng vẫn **FAIL 17.8/17.5 ms so 16.7 ms**, chuyển Polish #51→#52. [Gate 2](results/experiment-2/README.md) Đạt theo phạm vi mẫu, physics **NOT TESTED**, browser bridge không phải native pass. [Gate 3](results/experiment-3/README.md) native robot 2/3, wave 3/3, scarf 2/3 = **7/9**, không thay lượt lỗi: một lỗi môi trường, một thiếu public evidence. Đây là feasibility experiment, chưa chứng minh statistical reliability, native cancellation, chi phí, nhanh hơn Spine, full parity hay production readiness.

## Chạy từ clone

Cần Node.js 22.22.3 (`platform/.nvmrc`, minimum 22.12), npm ≥10. Không cần cài dependencies ở root.

```sh
git clone https://github.com/hoangnb24/learn-spine.git
cd learn-spine/platform
npm ci
npm run typecheck
npm test
npm run build
npm run dev
```

Mở [Editor](http://127.0.0.1:5173/index.html) hoặc [Player](http://127.0.0.1:5173/player.html). Repo private cần tài khoản có quyền clone. Native agent cần host có `document.modelContext` WebMCP như môi trường ghi ở Gate 3; chạy trang trong browser thông thường không tự có native agent. Trang hiển thị tình trạng kết nối; browser bridge/tests không thay native acceptance.

Trong Editor, tạo project, thêm/chọn xương rồi **Nạp PNG**, bố trí Setup, tạo animation và đặt key; xem playback; có thể xuất ZIP để lưu/chuyển project. Sau reload chọn **Khôi phục bản lưu**; Player mở ZIP qua file input riêng. Để xem mẫu đã kiểm chứng, mở [robot ZIP](../../platform/fixtures/robot/native-project.zip) hoặc [khăn ZIP](results/experiment-2/run-03/scarf.zip) bằng file input. [Hướng dẫn Editor](../../platform/apps/editor/README.md) và [panel mesh/IK](../../platform/apps/editor/mesh-controls/README.md) nêu thao tác và giới hạn UI; core/tools hỗ trợ nhiều thao tác hơn UI tối thiểu.

Browser checks sau build (cổng 4173 phải trống):

```sh
npx playwright install --with-deps chromium
npm run test:browser
```

Các lệnh trên chạy từ `platform/`; [workspace](../../platform/README.md) có cấu hình và test harness. Chạy lại native gates phải theo protocol/report tương ứng, không coi browser suite xanh là native pass.

## Tài liệu

- [Đề xuất quyết định MVP và thứ tự đầu tư](decisions/mvp.md), [phạm vi](scope.md).
- [Kiến trúc](architecture.md), [hợp đồng](contracts/README.md), [commands](../../platform/src/commands/README.md), [adapter tools](../../platform/src/adapters/webmcp/README.md).
- [Ba thử nghiệm và tiêu chí](experiments.md), [nguồn art](research/assets.md), [audit UX](research/product-ux-brief-2026-09-11.md).
- [WORKFLOW](../../WORKFLOW.md), [quy trình bàn giao](agent-workflow.md), [execution plan](execution-plan.md), [backlog](backlog.json), [roadmap #1](https://github.com/hoangnb24/learn-spine/issues/1).

Các bài [tra cứu thực hành](../practical-guide.md) là nguồn học/đối chứng, không chứng minh engine mới đúng hoặc có đủ năng lực Spine.
