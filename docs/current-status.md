# Trạng thái hiện tại — 08/09/2026

**Kế hoạch hiện tại đã khép.** [Bài 97](../lessons/097-user-audio-check.md): người dùng trực tiếp xác nhận tiếng bước chân của walk-wide nghe rõ, khớp chạm đất, không rè/chồng tiếng khi phát ở 100%. Đã dừng ở frame 0. Kết hợp các bài đã rà bên dưới và yêu cầu bỏ qua lưu/xuất, phần còn vướng đã được giải quyết. Các đoạn ghi chưa nghe hoặc bị chặn bên dưới là lịch sử trước xác nhận này.

Rà sau bài 96: đã đọc lại PLAN, bảng phạm vi và bài Events/audio 21; đối chiếu báo cáo mắt, đáy và nối vòng của thạch. Hướng dẫn tra cứu đã bổ sung quy trình sửa mặt/đáy và tạo nhịp mềm. Hai dòng tiến độ còn coi lưu/xuất là việc phải đạt đã được sửa theo yêu cầu bỏ qua của người dùng.

Lượt rà trước bài 97 còn thiếu bằng chứng nghe audio vì công cụ chỉ cung cấp ảnh và văn bản. Phần này đã được bổ sung bằng kiểm tra trực tiếp của người dùng.

**Vừa hoàn thành:** [nhánh nhân vật mềm 92–96](../lessons/096-editor-jelly-bounce.md): mesh 52 đỉnh, sửa weights mặt/đáy, thử nén–giãn–nghiêng và vòng bật 44 frame. Xem tám pose và 90 mẫu playback hơn hai vòng, Outline đầu/cuối trùng. Robot bài 91 cũng đã khép. Tiếp theo rà yêu cầu còn thiếu của mục tiêu chung; không tự thêm biến thể thạch.

**Điều chỉnh mới của người dùng:** bỏ qua bài lưu/xuất; phần này không còn chặn kế hoạch hiện tại. Đã thực hành [nhảy tại chỗ và tiếp đất](../lessons/091-editor-jump-in-place.md): nhịp thân, kiểm tra hai chân, đầu/khăn trễ và 90 ảnh playback. Đã thêm vung tay/gập khuỷu, làm mềm bốn kênh tay bằng Automatic và xem 90 ảnh playback sau sửa. Bài nhảy cơ bản đã khép. Các kết luận bị chặn bên dưới là trạng thái trước điều chỉnh này.

Đã có bài thực hành và bằng chứng cho phần dựng nhân vật, bộ động tác, mesh/weights/IK và các nhóm công cụ chính trong phạm vi robot và thạch. Âm thanh có xác nhận từ người dùng. Quy trình lưu–mở lại–xuất chưa thực hành và đã được loại khỏi phạm vi hiện tại theo yêu cầu.

Trang này là trạng thái hiện tại. Những dòng “tiếp theo” trong nhật ký bài cũ mô tả thời điểm viết, không tự trở thành việc còn thiếu hôm nay.

| Tiêu chí của kế hoạch | Bằng chứng cụ thể | Đánh giá hiện tại |
| --- | --- | --- |
| 0–1: điều khiển editor, cha/con, slot và che khuất | Rig dựng tay bài 17; sửa draw order bài 84; thao tác thực tế tiếp tục tới bài 91 | Đã thực hành và lặp lại trong editor |
| 2: key, nhịp và nội suy | Idle bài 19; sửa đường cong khăn bài 86; playback bài 82 | Đạt bài cơ bản trong động tác đã kiểm tra |
| 3: robot từ ảnh tới rig | 15 mảnh ảnh, FK/IK; kiểm tra pose, hai kích thước ở trang sản phẩm | Có nhân vật dùng được trong phạm vi động tác đã thử; không suy ra mọi góc nhìn |
| 4: idle/wave/walk và hai vòng sửa | Bài 17–19, 37–40, 55–56; 120 mẫu trực tiếp mỗi idle/wave và walk Preview ở bài 82 | Đủ bằng chứng giữ bộ robot tại chỗ hiện tại |
| 5: mesh/weights/IK và sửa lỗi | Bài 19/28–30; khăn bài 83–87; mesh đổi độ phân giải bài 88 | Đạt các bài cơ bản trong biên độ đã thử |
| 6: ảnh, tên và phiên bản | Sửa ảnh thiếu bài 34, PSD sync bài 65–74/88; tên animation cụ thể | Đã thực hành phần chuẩn bị; chưa kiểm tra một gói export của rig dựng tay |
| 6: lưu, mở lại, export và runtime tương ứng | Hiện không có `.spine`/`.skel` của bài dựng tay | Chưa thể thực hành trên Trial; không yêu cầu mua license, không dùng JSON tự tạo để thay thế |
| Events/audio | WAV/key ở bài 21/40; người dùng nghe walk-wide ở bài 97 | Người dùng xác nhận có tiếng, khớp chạm đất, rõ và không rè/chồng tiếng; Codex không tự nghe |
| Nhảy tại chỗ | Bài 91: bảy mốc mỗi chân, tám tư thế thân và 90 ảnh playback | Đạt bài nhảy cơ bản trong phạm vi đã thử: lấy đà, bật/đáp, tay và chuyển động trễ; đã sửa đường cong. Còn sai khác pixel chân đầu/cuối có sẵn từ bản trước. |
| Physics phụ kiện | Bài 89: mesh khăn hai đoạn; bài 90: giảm Mix 6–12 và 80 mẫu chậm | Đã thực hành trở về góc nền theo thời hạn. Đóng băng tư thế mô phỏng là mở rộng khác, chưa đạt và không tự thêm làm điều kiện của bài giảm Mix |

## Tài liệu để sử dụng lại

- [Bộ động tác trong editor](../exercises/robot/editor-review/README.md).
- [Tra cứu thao tác và sửa lỗi](practical-guide.md).
- [Khăn đi bộ và chuyển tiếp](../lessons/087-editor-walk-scarf.md).
- [Giảm ảnh mesh có weights/Deform](../lessons/088-editor-mesh-image-resolution.md).
- [Giảm ảnh hưởng Physics](../lessons/090-editor-scarf-physics-stop.md).

## Kiểm tra hiện vật trong lượt rà này

Đã đọc lại PLAN, bảng phạm vi PROGRESS, bài 21/68/82/90 và trang sản phẩm. Hai GIF playback idle/wave còn tồn tại, mỗi tệp 120 ảnh, kích thước 408×585. WAV mở được dưới dạng mono PCM16, 22050 Hz, 3528 mẫu (0,16 giây). Báo cáo phục hồi mesh bài 88 còn đủ năm pose và hai kết quả RGBA. Không tìm thấy tệp `.spine` hoặc `.skel` trong workspace.

Những kiểm tra tệp trên xác nhận hiện vật còn đó và đúng định dạng; không phải một lượt đánh giá lại chuyển động hoặc nghe âm thanh. Kết luận hình/nhịp dựa trên các lượt quan sát đã ghi ở bài tương ứng.

Công cụ điều khiển hiện có trả ảnh/đọc giao diện, chưa có công cụ thu/nghe đầu ra audio của Spine. Không dùng sóng âm hoặc nhãn event để tự xác nhận đã nghe. Không lặp lấy cùng chuỗi ảnh hoặc tạo thêm biến thể chỉ để kéo dài kế hoạch. Chỉ tiếp tục sửa khi có lỗi cụ thể, yêu cầu sản phẩm mới, hoặc khả năng kiểm tra phần còn thiếu.
