# Ba thử nghiệm trước khi chốt nền tảng

Ngày: 09/09/2026; đối chiếu 11/09/2026. Gate 1 đã chạy, nghiệm thu chức năng và merge qua PR #48; Gate 2/3 chưa chạy. Quyết định chủ dự án ngày 11/09/2026: chấp nhận Gate 1 theo chức năng, Orchestrator đã nghiệm thu chức năng và merge PR #48 tại `b6577a3b44b8016a9c7ba3ec9f60fbb869419538` (head reviewer `13bba23ceeda484aaf6e8b262b7bbceb2fc3c386`). Hiệu năng chuyển sang Polish #51 (phép đo/profile/baseline) → #52 (tối ưu/retest p95 <=16.7 ms); đây không phải performance pass. #14 đã Closed (completed)/Done; #15/#16 In Progress / Ready sau bàn giao từ main `0c1597cbf323d36e83c36db06dea18d2747d5917`. Polish không chặn các giai đoạn chức năng và không phụ thuộc #22.

Nguồn đo `a91c27cd93541b7b320b9b54c2451894b8fcd018`, PR #48: p95 editor 17.8 ms / player 17.5 ms, vượt 16.7 ms; Vite dev/React StrictMode, Headless Chromium 153/SwiftShader. Cloning instrumentation và physical presentation chưa được tách; CPU submission khoảng 0.2 ms không phải toàn frame. Giữ nguyên kết quả FAIL lịch sử và không suy nguyên nhân renderer/core từ số đo này.

## Chuẩn bị chung

1. Chọn art robot, khăn, thạch trong repo; ghi nguồn/quyền sử dụng và hash các file mẫu. Không sửa hiện vật của quá trình học.
2. Ghi máy, OS, trình duyệt, renderer và agent/model được dùng. Đầu ra web là giả định cho các thử nghiệm này.
3. Viết brief cố định và rubric trước khi chạy; mỗi lần lưu project, log tools, ảnh và playback cùng revision.
4. Thử WebMCP tối thiểu: đăng ký một tool đọc trạng thái, để agent đích khám phá và gọi thật. Tách bằng chứng này khỏi việc gọi thủ công bằng inspector.
5. Đo một baseline mới trên workflow Spine hiện có nếu môi trường cho phép. Nhật ký cũ không chứa đủ thời gian/chi phí để suy ra mức cải thiện. Nếu chưa có baseline, vẫn đo tuyệt đối nhưng không tuyên bố nhanh hơn Spine.

## 1. Robot: từ art đến kết quả mở lại được

**Câu hỏi:** kiến trúc đề xuất có hoàn thành quy trình độc lập với Spine không?

Đầu vào: PNG robot tách sẵn, thông tin bố trí và hai brief idle/wave. Xây phần giao diện đủ để xem/sửa; tạo rig và keyframe qua bộ lệnh chung. Lưu gói project, đóng trang, mở lại và nạp vào player riêng.

Điều kiện đạt:

- Không cần Spine runtime/editor để dựng và phát kết quả.
- Lưu/mở lại giữ nguyên dữ liệu animation và tham chiếu assets; player chạy từ gói được xuất, không đọc trạng thái editor.
- Ở 12 thời điểm cố định mỗi animation, transform của editor và player lệch tối đa `1e-5` đơn vị logic; cùng renderer/máy có hình hiển thị nhất quán.
- Xem playback ít nhất ba vòng: không mất bộ phận, cắt cực trị hoặc giật bất ngờ ở mốc vòng. Review hình/nhịp được ghi riêng với kiểm tra dữ liệu.
- Undo/redo một batch keyframe phục hồi đúng project; thử nhập lỗi không làm sửa dở project.
- Mục tiêu hiệu năng **chuyển sang Polish #51/#52 ngày 11/09/2026, không chặn nghiệm thu chức năng Gate 1**: với một robot, canvas 1280×720 trên máy được ghi nhận, p95 thời gian frame không quá 16,7 ms trong 30 giây sau warm-up; đo riêng overhead của công cụ lấy ảnh.

Hiện vật: gói project, player demo, chuỗi PNG, playback, kết quả kiểm tra và số đo. [Báo cáo lịch sử tại nguồn đo](https://github.com/hoangnb24/learn-spine/blob/55bd54fdde2a1922f5c6ec4863b0baaee8f210fe/docs/product/results/experiment-1/README.md) giữ kết quả performance FAIL. Điều tra nguyên nhân hiệu năng theo #51; không tự chặn mesh/IK bởi mục tiêu đã chuyển Polish. [Đối chiếu](reconciliation/2026-09-11-gate1.md) ghi kết quả nghiệm thu/merge và bàn giao downstream.

## 2. Khăn và thạch: biến dạng có kiểm soát

**Câu hỏi:** nền tảng xử lý được những bài khó hơn ảnh gắn xương không?

Đầu vào: khăn neo cổ, nhân vật thạch và pose đối chứng từ bài đã học. Tạo weights bằng dữ liệu rõ ràng trước; tự động chia weights là bài mở rộng. Thử IK hai xương bằng một pose chân trụ đơn giản.

Điều kiện đạt:

- Weights không âm, tổng tại mỗi vertex sai lệch tối đa `1e-5` so với 1; liên kết bone hợp lệ.
- Trong fixture có neo cố định, đỉnh neo/đáy được chỉ định lệch tối đa 0,5 pixel logic; chân IK với target trong tầm với lệch tối đa 0,5 pixel logic.
- Trong fixture nén–giãn thạch, chiều cao vùng mắt thay đổi tối đa 5% so với pose chuẩn, trừ pose được brief cho phép biến dạng mặt.
- Kiểm tra cực trị và 60 mẫu thời gian mỗi vòng: không lật tam giác ngoài dự kiến, rách vùng nối hoặc làm trôi neo. Quan sát bổ sung các lỗi mà số liệu không diễn tả được.
- Với vòng được thiết kế mượt, đo cả vị trí và vận tốc hai phía mốc nối; dung sai vị trí tối đa 0,5 pixel logic và chênh vận tốc tối đa 5% tốc độ đỉnh, hoặc 0,5 pixel/giây cho chuyển động gần đứng yên. Nếu chủ ý dừng tại mốc vòng phải ghi trong brief.
- Seek 20 thời điểm theo thứ tự ngẫu nhiên cho pose trùng với phát từ đầu trong sai số `1e-5` cho phần không physics.
- Nếu thêm physics: bước cố định 1/60 giây, reset/replay cùng đầu vào phải tái tạo pose trong sai số `1e-4` trên cùng môi trường. Ghi riêng phần chưa thử giữa trình duyệt/máy khác.
- Đổi texture sang nửa độ phân giải theo quy tắc kích thước logic giữ nguyên không làm đổi khớp, hình học hoặc animation.

Hiện vật: fixture và project khăn/thạch, bảng đo, ảnh cực trị, playback, báo cáo seek và hiệu năng cùng cấu hình thử nghiệm 1. Không quy toàn bộ lỗi weights/rig thành thiếu hiệu năng GPU.

## 3. Agent: tự tạo, quan sát và sửa qua WebMCP

**Câu hỏi:** tools có đủ để agent hoàn thành công việc và sửa theo feedback đáng tin cậy không?

Chạy sau khi các khả năng cần thiết ở thử nghiệm 1–2 đã hoạt động. Dùng project khởi đầu sạch, brief cố định và budget công khai trước khi chạy.

Ba brief:

1. Tạo idle và wave cho robot từ art và bố trí có sẵn.
2. Sửa wave: tay chậm hơn, giữ nguyên animation thân và các kênh không liên quan.
3. Tạo nhịp khăn trễ, kiểm tra neo và sửa một lỗi weights được cố ý đưa vào.

Điều kiện đạt:

- Có bằng chứng agent khám phá/gọi tools bằng WebMCP trên tổ hợp thực tế. Log ghi tên tool, input, revision, duration và kết quả.
- Agent dùng tools công khai để tạo/sửa, lấy ảnh/playback và kiểm tra; không có người âm thầm chỉnh file để cứu bài.
- Mỗi brief chạy ba lần từ trạng thái sạch; mục tiêu ít nhất 2/3 lần đạt trong tối đa 15 phút và 100 lượt gọi tool mỗi lần. Đây chỉ là tín hiệu khả thi ban đầu, không phải thống kê độ tin cậy cho sản phẩm.
- Hoàn thành đúng yêu cầu và xuất project mở lại được; kiểm tra dữ liệu các kênh được yêu cầu giữ nguyên ở brief 2.
- Có ít nhất một vòng đọc kết quả và điều chỉnh khi có lỗi; không coi `success` từ tool là xác nhận chất lượng hình.
- Retry cùng request không nhân đôi đối tượng. Revision cũ bị từ chối rõ ràng. Batch lỗi không sửa dở. Người dùng có thể dừng và phục hồi checkpoint.
- Ghi chi phí/token nếu công cụ cung cấp; nếu không, ghi “không đo được”. Đếm riêng can thiệp cứu lỗi và feedback sáng tạo theo kịch bản.

Hiện vật: log, project trước/sau, media quan sát, điểm rubric của từng lần, thời gian và chi phí. Nếu agent không gọi được WebMCP nhưng bộ lệnh chạy qua cầu nối, ghi kết quả cầu nối riêng; mục WebMCP vẫn chưa đạt.

## Quyết định sau thử nghiệm

| Kết quả | Hành động |
| --- | --- |
| Cả ba đạt | Chốt stack cho MVP, triển khai các workflow đã chứng minh |
| Lõi đúng nhưng chậm | Profile; thử Worker/renderer khác hoặc WASM tại điểm nghẽn |
| Renderer tốt nhưng pose sai | Sửa mô hình transform/constraints/thời gian trước |
| Engine đạt, agent khó sử dụng | Sửa schema, khả năng quan sát và thông báo lỗi; chạy lại brief lỗi |
| WebMCP chưa dùng được với agent đích | Đánh giá cầu nối/MCP riêng và ghi rõ đánh đổi |
| Đầu ra thực tế cần Unity/engine khác | Mở nghiên cứu player/export tương ứng trước khi mở rộng editor |

Kết thúc nghiên cứu bằng một bản quyết định ghi: lựa chọn, bằng chứng, phần chưa biết và điều kiện xem lại. Không ấn định lịch xây đầy đủ Spine khi chưa có số đo từ ba thử nghiệm.
