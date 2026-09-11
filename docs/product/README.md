# Công cụ animation 2D dành cho agent

Ngày: 09/09/2026; cập nhật 11/09/2026. Trạng thái: đã có [bộ mẫu nguồn](research/assets.md), [hợp đồng v0](contracts/README.md) và [probe WebMCP với bằng chứng thực tế](research/webmcp.md) đã merge vào `main` qua [PR #30](https://github.com/hoangnb24/learn-spine/pull/30). #2–#13 đã Done: lõi sản phẩm, editor/player, ảnh quan sát và kết nối WebMCP đã được nghiệm thu theo từng module. #14 đang kiểm chứng workflow robot tại Gate 1; chưa có gate nào đạt.

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
