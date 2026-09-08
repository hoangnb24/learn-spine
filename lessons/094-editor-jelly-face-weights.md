# Bài 94 — Giữ hình mắt khi nén thạch

08/09/2026. Đã sửa weights trong Setup, thử lại hai pose Animate và phục hồi; chưa tạo key.

## Thay đổi

Tám đỉnh quanh vùng mặt (ba phía trên mắt, năm phía dưới mắt/miệng) cùng nhận 50% `jelly-body` và 50% `jelly-crown`. Đỉnh trên mắt trái trước sửa có crown 72,1978%; các đỉnh nhận tỷ lệ khác nhau khiến ảnh mắt bị co/dãn khi crown dịch chuyển. Không sửa ảnh, đường bao hoặc vị trí xương Setup.

Dùng Weights: chọn đỉnh → chọn dòng crown → nhập Weight 50. Copy weights rồi chọn từng đỉnh còn lại và Paste; đọc lại hai dòng body/crown đều 50%. Chọn hộp bằng kéo chuột không chọn được nhóm trong lần này, nên dùng từng đỉnh. Tám đỉnh đã được kiểm tra trực tiếp; các ảnh `face-weight-*.png` lưu trong thư mục bằng chứng.

## Đối chứng cùng tư thế

Giữ body Y150 và base Y0, thử crown Y300/240/340 rồi về 300. Cùng khung Outline như bài 93. Chiều cao vùng mắt tối trong ảnh chụp được đo bằng nhóm pixel liên thông (RGB đều dưới 100), không phải kích thước attachment hoặc phép đo độ đẹp tổng thể.

| Crown Y | Trước sửa: chiều cao mắt | Sau sửa: chiều cao mắt |
| --- | --- | --- |
| 300 | 32 px cả hai | 32 px cả hai |
| 240 | 19 px cả hai | 32 px cả hai |
| 340 | 43/42 px | 32 px cả hai |

Vùng mặt dịch chuyển theo thân trong cả hai pose, mắt không dẹt/dài rõ như trước. Miệng nhìn thấy và đọc được. Sau trả crown Y300, toàn vùng Outline trùng RGB với trung tính trước thử.

[Ảnh nén sau sửa](../exercises/soft-character/evidence/face-fixed-compress.png) · [ảnh kéo giãn](../exercises/soft-character/evidence/face-fixed-stretch.png) · [số đo](../exercises/soft-character/evidence/face-weight-check.json).

## Còn lại

Vùng đáy Outline y430–462 không trùng pixel giữa trung tính và hai pose crown, dù base đứng yên. Đây là bằng chứng cần đọc weights đáy và kiểm tra chỗ tiếp xúc; chưa đủ để định lượng trượt. Chưa chỉnh đáy trong bài này. Không lặp thêm bài mắt với cùng hai pose nếu không sửa vùng mặt.

Kế tiếp: sửa ảnh hưởng không mong muốn lên đáy, rồi làm một vòng bật theo phạm vi đã định. Hiện Animate frame0 dừng, crown Y300, chưa có animation/key. Robot vẫn ẩn; jelly-soft hiện.
