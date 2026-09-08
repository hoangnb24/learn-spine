# Bài 62 — skin constraint trong animation

Constraint của bài 61 giữ `tip` ở 30° khi badge bật, dù animation `bend-corrective` đặt hai key −35° và +35°. Bỏ ghim badge trả lại chuyển động theo key; không cần sửa hoặc tạo lại key.

## Phép thử

Chuyển Animate, chọn `mesh-refine / bend-corrective`, giữ skin orange. Mở Skins, chọn tip và đọc World Rotate. Dừng playback khi so sánh cùng frame; bật/tắt ghim badge để thay đổi trạng thái constraint.

| Frame | Badge tắt | Badge bật | Tắt lại sau playback |
|---|---:|---:|---:|
| 0 | 325° (−35°) | 30° | 325° |
| 30 | 35° | 30° | 35° |

Ảnh đối chứng: [tắt ở 0](../exercises/robot/evidence/skin-constraint-animation/off0.png), [tắt ở 30](../exercises/robot/evidence/skin-constraint-animation/off30.png), [bật ở 0](../exercises/robot/evidence/skin-constraint-animation/on0.png), [bật ở 30](../exercises/robot/evidence/skin-constraint-animation/on30.png).

Đã phát animation khi badge bật rồi bỏ ghim trong lúc phát. [Ảnh đang phát với badge](../exercises/robot/evidence/skin-constraint-animation/playing-on.png) có nút Play xanh, Timeline khoảng frame 10 và Rotate 30°. [Ảnh sau bỏ ghim](../exercises/robot/evidence/skin-constraint-animation/playing-off.png) vẫn đang phát, Timeline khoảng frame 41 và Rotate 13,676°. Đây là hai mẫu khi chạy, không phải phép so sánh cùng thời điểm hoặc bản ghi video liên tục.

Sau đó dừng phát, đọc lại [frame 30 = 35°](../exercises/robot/evidence/skin-constraint-animation/restored30.png) và [frame 0 = 325°](../exercises/robot/evidence/skin-constraint-animation/restored0.png). Không sửa giá trị góc, key hoặc Mix trong lượt thử.

## Điều cần nhớ

Với cấu hình Source base, Offset 30°, Mix 100 của bài 61, constraint chi phối góc cuối cùng khi skin hoạt động. Việc nhìn thấy Rotate 30° trên xương không có nghĩa key gốc đã bị đổi thành 30°.

Các key sửa hình mesh của bend-corrective vẫn tác động: ảnh badge bật ở 0 và 30 có góc tip bằng nhau nhưng mép trong khác nhau. Bài 30 đã làm các key sửa hình cho biên độ ±35°; dùng constraint giữ góc khác có thể khiến sửa hình không còn phù hợp. Nếu thiết kế phụ kiện thật, cần chọn xương chịu constraint và animation đi kèm có chủ đích, rồi kiểm tra hình mesh.

Trạng thái cuối: Animate, bend-corrective frame 0, dừng phát, orange hoạt động, badge không ghim. Đây là thực hành editor Trial, chưa kiểm chứng thay skin qua runtime hoặc lưu project.
