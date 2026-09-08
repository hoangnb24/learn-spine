# Bài 96 — Thạch nghiêng và bật nhẹ

08/09/2026. Đã thực hành trong skeleton jelly-soft, animation jelly-bounce. Khép bài nhân vật mềm cơ bản trong biên độ đã thử.

## Thử nghiêng trước animation

Giữ base đứng yên, body/crown Y150/300. Dịch body X20 và crown X45, rồi thử -20/-45: thân nghiêng hai phía, mặt đọc được, không thấy đường bao gập rõ. Đây là nghiêng bằng dịch các tầng xương, chưa phải kiểm tra xoắn hoặc xoay lớn. Trả cả hai X0; vùng Outline x700–984, y130–469 trùng RGB với ảnh trung tính trước thử.

[Phía phải](../exercises/soft-character/evidence/lean-right.png) · [phía trái](../exercises/soft-character/evidence/lean-left.png).

## Vòng bật

Tạo jelly-bounce dài 44 frame, 30 FPS (khoảng 1,47 giây). Root nâng toàn bộ rig; body và crown dịch tương đối trong hệ cha. Base giữ tư thế Setup. Ba kênh Translate đã tách X/Y; X giữ 0. Không đổi weights hoặc mesh trong bài này.

| Xương | Frame → Y |
| --- | --- |
| root | 0→0, 10→0, 18→100, 26→0, 44→0 |
| jelly-body | 0→150, 6→110, 10→180, 18→150, 26→170, 30→110, 36→160, 44→150 |
| jelly-crown | 0→300, 8→240, 12→340, 18→300, 26→330, 30→240, 36→315, 44→300 |

Đã đọc trực tiếp 21 key sau nhập. Đỉnh thạch trễ hai frame ở lấy đà và duỗi bật so với body; khi đáp, cả hai nén ở frame 30. Các key Y của body/crown dùng Automatic, đồ thị hiện tay nắm mềm tại các cực trị. Root dùng Automatic ở đỉnh 18, Bounce ở 10 và 26 để giữ thay đổi tốc độ rõ khi rời/chạm đất.

Đọc lại root Y ở frame 11/14/17/18/19/22/25: 19,481 / 67,72 / 97,048 / 100 / 97,048 / 67,72 / 19,481; X đều 0. Đường bay chậm lại sát đỉnh, đối xứng trong các mẫu này. Không gọi đây là mô phỏng trọng lực chính xác.

## Kiểm tra kết quả

Xem tám tư thế sau chỉnh đường cong: 0, 8, 12, 18, 26, 30, 36, 44. Outline đã thu nhỏ để nhìn đủ đường bay; không dùng viewport chính bị cắt phần đỉnh để kết luận. Mặt còn rõ, đáy không xuất hiện cánh gập như lỗi bài 95.

Playback xác nhận 30 FPS, Speed 100%, Interpolated. Thu và xem đủ 90 ảnh, từ 0,400 đến 3,918 giây sau bấm phát, dài 3,518 giây, hơn hai vòng. Có lấy đà, bay, nén khi đáp và hồi thân. Chưa thấy rách mesh hay bật hình lớn trong mẫu đã xem. Đây là đánh giá cơ bản bằng chuỗi ảnh lấy mẫu, không phải xác nhận mọi frame ở mọi tốc độ.

Vùng Outline của frame 0 và 44 trùng RGB. Đường cong đầu/cuối body và crown nối cùng hướng trên Graph; kết hợp với chuỗi playback, đủ khép vòng cơ bản hiện tại.

[90 ảnh playback](../exercises/soft-character/evidence/bounce-live-review.jpg) · [đồ thị đường bay](../exercises/soft-character/evidence/bounce-root-shaped.png) · [kết quả đối chiếu](../exercises/soft-character/evidence/bounce-check.json).

## Phạm vi đã khép

Bài 92–96 đã đi từ ảnh nguồn đến mesh 52 đỉnh, ba xương điều khiển, sửa weights mặt/đáy, thử nén–giãn–nghiêng và một vòng bật có playback. Lỗi gán cứng làm mép gập ở bài 95 và bản sửa là đối chứng lỗi weights thực tế. Không tự thêm biến thể mới vào điều kiện của bài này.

Hiện Spine dừng ở frame 0, jelly-bounce hoạt động, root được chọn, Playback đóng. Bỏ qua lưu/xuất theo yêu cầu người dùng. Mục tiêu học chung vẫn đang tiếp tục; bài này không chứng minh đã thuần thục mọi chức năng Spine.
