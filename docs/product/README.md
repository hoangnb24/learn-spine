# Công cụ animation 2D dành cho agent

Ngày: 09/09/2026; cập nhật 11/09/2026. Trạng thái: đã có [bộ mẫu nguồn](research/assets.md), [hợp đồng v0](contracts/README.md) và [probe WebMCP với bằng chứng thực tế](research/webmcp.md) đã merge vào `main` qua [PR #30](https://github.com/hoangnb24/learn-spine/pull/30). #2–#13 đã Done: lõi sản phẩm, editor/player, ảnh quan sát và kết nối WebMCP đã được nghiệm thu theo từng module. #14 đã được nghiệm thu chức năng và PR #48 đã merge. Quyết định chủ dự án ngày 11/09/2026: chấp nhận Gate 1 theo chức năng, Orchestrator đã nghiệm thu chức năng và merge PR #48 tại `b6577a3b44b8016a9c7ba3ec9f60fbb869419538` (head reviewer `13bba23ceeda484aaf6e8b262b7bbceb2fc3c386`). Hiệu năng chuyển sang Polish #51 (phép đo/profile/baseline) → #52 (tối ưu/retest p95 <=16.7 ms); đây không phải performance pass. #14 đã Closed (completed)/Done; #15 đã Done; #16/#17 In Progress / Ready theo mốc PR #56 bên dưới. Polish không chặn các giai đoạn chức năng và không phụ thuộc #22.

## Trạng thái sau mesh core PR #56 — 11/09/2026

#15 đã Closed (completed)/Done sau PR #56 tại main `91bdd3af82683ea3c9391b28ccd51d6c6b786449`; #16 In Progress/Ready, đang tích hợp IK vào shared main này; #17 In Progress/Ready, sole author `/root/implement_issue17`; #18 vẫn Blocked chờ #16, #19 chờ #17/#18. #51/#52 giữ Todo/Deferred/P2 ở Polish.

[Handoff mesh cho #17–#19](reconciliation/2026-09-11-mesh-core-handoff.md).

## Lịch sử bàn giao sau PR #53 — 11/09/2026

PR #53 đã được review Đạt, CI pass và Orchestrator merge thành main `0c1597cbf323d36e83c36db06dea18d2747d5917`. Từ mốc này, #15/#16 **In Progress / Ready**, đã được giao sole authors:

- #15: `/root/implement_issue15` sở hữu đề xuất extension dùng chung (model/schema/format/capabilities/Pose) và mesh.
- #16: `/root/implement_issue16` sở hữu solver IK cùng types/helpers riêng.
- Hai owner thống nhất hợp đồng chung trước khi tích hợp. Shared model/evaluator entry được sửa tuần tự theo bàn giao; không tự tạo hai version hoặc model không tương thích, không ghi đè thay đổi của nhau. Việc giao triển khai không chứng minh extension/API mới đã được nghiệm thu.

#14 giữ Done; #51/#52 giữ Todo / Deferred / P2 ở Polish. Các snapshot nghiệm thu Gate 1 trước mốc này ghi #15/#16 Todo/Ready là lịch sử; đây là trạng thái tại mốc lịch sử PR #53; trạng thái hiện tại theo mốc PR #56 ở đầu tài liệu và GitHub Project.

## Sản phẩm trong một trang

Xây website animation 2D độc lập: người dùng đưa art và yêu cầu; agent dựng rig, tạo chuyển động, quan sát, sửa theo feedback và xuất kết quả qua tools trên trang. Người dùng xem cùng project, dừng công việc, chỉnh trực tiếp và hoàn tác được.

Người thao tác chính là agent. Người quyết định chất lượng và sử dụng kết quả là người cung cấp art. Giả định ban đầu: sử dụng cho nhân vật 2D trên web; nếu ưu tiên game engine khác, phải xem lại thiết kế đầu ra trước khi mở rộng.

Giá trị cần chứng minh: tạo được animation có cấu trúc để chỉnh sửa tiếp; sửa một yêu cầu cục bộ mà giữ được các phần đã đạt; giảm thời gian và can thiệp thủ công so với workflow hiện tại. Có nhiều tools chưa phải bằng chứng sản phẩm hữu ích.

### Phạm vi đầu tiên

- Nhận PNG đã tách bộ phận và thông tin bố trí; dùng robot hiện có làm mẫu.
- Dựng xương, gắn ảnh, tạo idle/wave; người dùng xem và sửa trên cùng dữ liệu với agent.
- Lưu project kèm assets, đóng/mở lại và phát trong player riêng trên web.
- Bổ sung mesh/weights/deform bằng khăn và thạch để kiểm tra độ khó thực sự.
- Agent hoàn thành một vòng tạo → xem → sửa qua WebMCP trên tổ hợp trình duyệt/agent được kiểm chứng.

Mốc thành công đầu tiên là thay thế workflow mẫu của chúng ta. Toàn bộ năng lực Spine là định hướng dài hạn, chưa phải cam kết phạm vi hay thời gian. Tự tách một ảnh phẳng thành các bộ phận, sinh phần art bị che, cộng tác nhiều người, hỗ trợ mọi game engine và tương thích file Spine chưa nằm trong bản đầu.

### Trải nghiệm đích

1. Người dùng nạp art, mô tả chuyển động và mục đích sử dụng.
2. Agent đọc assets, dựng rig và tạo bản đầu; trang hiển thị tiến độ và kết quả.
3. Agent kiểm tra pose, playback và chẩn đoán; sửa những lỗi xác định được.
4. Người dùng phản hồi, ví dụ “tay vẫy chậm hơn, thân giữ nguyên”. Agent sửa có phạm vi, có bản trước/sau để xem.
5. Người dùng lưu bản chỉnh sửa được và xuất kết quả dùng bên ngoài editor.

### Các quyết định hiện tại

| Vấn đề | Hướng đề xuất | Điều kiện xem lại |
| --- | --- | --- |
| Nền tảng | Web desktop, xử lý project tại trình duyệt trước | Nhu cầu tác vụ nền hoặc project vượt ngân sách máy thử |
| Công nghệ | TypeScript, React, Vite, PixiJS; lõi animation riêng | Kết quả thử renderer và tính toán |
| Kết nối agent | WebMCP bọc bộ lệnh dùng chung | Agent đích không hỗ trợ; đánh giá cầu nối riêng |
| Dữ liệu | Định dạng riêng có phiên bản, assets đóng gói | Yêu cầu tích hợp đầu ra đã được xác nhận |
| Mã nguồn Spine | Không lấy dependency của repo học làm mặc định cho sản phẩm | Chỉ xem lại sau nghiên cứu giấy phép và mục đích sử dụng |

### Tài liệu thực hiện

- [GitHub repository](https://github.com/hoangnb24/learn-spine) — nhánh `main`, private.
- [GitHub Project](https://github.com/users/hoangnb24/projects/3) và [issue điều phối](https://github.com/hoangnb24/learn-spine/issues/1).
- [Thứ tự thực hiện, nhóm song song và links tới từng issue](execution-plan.md).
- [Audit sản phẩm và brief UX ngày 11/09/2026](research/product-ux-brief-2026-09-11.md) — bản đồ chức năng, ranh giới preview và điểm cần chốt.
- [Phạm vi theo giai đoạn](scope.md).
- [Kiến trúc, project và tools](architecture.md).
- [Ba thử nghiệm và tiêu chí quyết định](experiments.md).
- [Quy trình nhận và bàn giao issue cho agent](agent-workflow.md).
- [Backlog có cấu trúc và dependencies](backlog.json).

Nguồn đối chứng nội bộ: [trạng thái học](../current-status.md), [tra cứu thực hành](../practical-guide.md). Các bài đã học cung cấp quy trình, lỗi và hình mẫu; không chứng minh rằng engine mới đã đúng. Lưu/xuất bị loại khỏi kế hoạch học cũ nhưng là yêu cầu bắt buộc của sản phẩm mới.
