# Bài 95 — Giữ đáy thạch khi nén và kéo giãn

08/09/2026. Đã sửa weights và thử hai tư thế trong Animate; chưa đặt key animation.

## Lỗi và cách sửa

Đỉnh giữa đáy ban đầu nhận body 100%, base 0%: xương base đứng yên chưa đủ để giữ phần ảnh tiếp đất. Gán base 100% cho vùng sát đáy, rồi thử body Y110 và crown Y240. Lần đầu vẫn xuất hiện hai cánh gập ở mép vì chuyển ảnh hưởng giữa các hàng quá đột ngột. [Ảnh lỗi sau lần sửa đầu](../exercises/soft-character/evidence/base-fixed-compress.png).

Sửa tiếp hai mép đáy và tạo vùng chuyển tiếp. Tổng cộng 21 đỉnh phía dưới đã chỉnh, đọc lại trực tiếp trong Weights:

| Vùng | Số đỉnh | Base | Body | Crown |
| --- | --- | --- | --- | --- |
| Sát đáy: chín đỉnh đường bao và ba đỉnh trong | 12 | 100% | 0% | 0% |
| Hàng trong kế tiếp | 5 | 60% | 40% | 0% |
| Hai mép thấp | 2 | 70% | 30% | 0% |
| Hai mép cao hơn | 2 | 40% | 60% | 0% |

Không thêm đỉnh hoặc chạy Auto lại. Tám đỉnh quanh mặt giữ tỷ lệ body/crown 50–50 của bài 94. Trong lần thao tác có hộp xác nhận xóa attachment do trường Weight mất chọn; đã chọn No, attachment vẫn còn. Chọn đỉnh rồi kiểm tra dòng xương và trường số đang hoạt động trước khi nhập.

## Kết quả kiểm tra

Base giữ Y0. Thử trung tính body/crown Y150/300, nén 110/240, kéo giãn 180/340 rồi về 150/300. Đường bao sau sửa không còn hai cánh gập rõ như lượt đầu; mắt và miệng vẫn đọc được. Đây là kiểm tra tư thế tĩnh, chưa đánh giá toàn chuyển động.

Trong vùng giữa đáy Outline x780–899, y430–464, pixel xanh thấp nhất luôn ở y460 và số pixel theo ngưỡng màu luôn là 3.572 ở cả bốn ảnh. Phép đo này xác nhận mép tiếp đất giữa thân trong các tư thế đã thử; không suy ra mọi biên độ hoặc toàn bộ đường bao bất động. Sau phục hồi, vùng Outline x700–984, y130–469 trùng RGB với trung tính trước thử.

[Ảnh nén đã sửa](../exercises/soft-character/evidence/base-blend-compress.png) · [ảnh kéo giãn](../exercises/soft-character/evidence/base-blend-stretch.png) · [số đo và cách đo](../exercises/soft-character/evidence/base-weight-check.json).

## Tiếp theo

Làm một vòng bật nhẹ: lấy đà, kéo giãn, bay và đáp; kiểm tra tư thế khó và playback. Chưa thử nghiêng theo phạm vi bài nhân vật mềm. Hiện Animate dừng ở frame 0, crown Y300 và body Y150, chưa có animation/key cho thạch.
