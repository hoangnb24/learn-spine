# Bài 54 — xác định vùng dáng đi khó đọc

Đã trở lại `walk-in-place` trên skeleton robot gốc (`skeleton`), mở Outline và xem đủ 31 tư thế frame 0–30. `robot-layers` là bài nhập PSD và rig riêng, không phải nơi chứa bộ animation đã làm.

## Kết quả quan sát

- Hai bàn chân chồng nhau rõ trong khoảng frame 12–19. Đây là vấn đề hình thể trong góc nhìn chính diện; bộ ảnh không chứng minh lỗi IK hay trượt chân.
- Bàn tay sát đầu gối ở pha nhấc chân, đặc biệt quanh 8 và 23. Khuỷu phải đã gập ở bài 39 nhưng chưa giải quyết hoàn toàn sự chồng hình.
- Không thấy khớp rời rõ ở 31 tư thế. Vùng Outline được cắt ở `(1040,145)–(1410,744)` của frame 0 và 30 trùng pixel.

[Tư thế 0–15](../exercises/robot/evidence/full-body-audit/contact-1.jpg) · [Tư thế 16–30](../exercises/robot/evidence/full-body-audit/contact-2.jpg) · [Bản xem vòng đi](../exercises/robot/evidence/full-body-audit/walk-review.gif).

GIF ghép từ 30 ảnh editor, một vòng một giây; không có âm thanh, không phải export Spine hay bằng chứng playback liên tục. [Script tạo bảng ảnh](../scripts/report_full_body_audit.py) và [kết quả so sánh đầu/cuối](../exercises/robot/evidence/full-body-audit/review.json) được lưu để làm lại. Không sửa key trong bài này; các phép đo bàn chân của bài 40 không được đo lại.

## Quyết định sửa tiếp

Ưu tiên thử chỉnh tư thế tay ở đỉnh nhấc chân trên bản sao animation, so sánh toàn thân trước/sau. Nếu cần đổi khoảng cách hai chân, phải kiểm tra lại quỹ đạo chân trụ; không suy ra một mức dịch ngang tùy ý từ hình chiếu chính diện. Không mở thêm bài constraint trước khi xử lý phần dáng này.

Editor được trả về `walk-in-place`, frame 0, dừng, Loop bật và Outline mở. Quy trình lưu/xuất/mở lại vẫn cần bản Spine hỗ trợ; chưa hoàn tất kế hoạch.
