# 90 — Giảm ảnh hưởng Physics khi khăn đang rung

Đã tạo `scarf-physics-stop`, giảm Mix của cả hai đoạn khăn từ 100 về 0 trong frame 6–12. Frame 12 và 13 trở về góc nền; xem chậm phần chuyển tiếp chưa thấy bật hình rõ ở vùng khăn nhìn thấy. Đây là đưa ảnh hưởng mô phỏng về 0, không đóng băng tư thế đang mô phỏng hoặc chứng minh hệ mô phỏng ngừng tính nội bộ.

## Kiểm tra động tác cũ

Trước khi tạo bản mới, mở đúng `idle-scarf` và `walk-scarf`, đọc constraint trong từng động tác:

| Động tác | Xương/mốc | Mix | Góc Parent |
| --- | --- | --- | --- |
| idle-scarf | mid, 15 | 0 | 20° |
| idle-scarf | tip, 23 | 0 | 12° |
| walk-scarf | mid, 7 | 0 | 22° |
| walk-scarf | tip, 11 | 0 | 14° |

Các góc khớp key cũ bài 86–87. Không có track Mix mới ở những mẫu này. Đây là đối chứng các mốc cụ thể, không phải so pixel toàn vòng cũ.

## Thao tác và kết quả

Duplicate `scarf-physics`, đổi tên `scarf-physics-stop`. Giữ key Mix 100 ở frame 0, thêm 100 ở frame 6, 0 ở frame 12 cho cả mid và tip. Giữ nội suy Linear. Không sửa Damping, góc nền hoặc nguồn.

| Frame | Mix hai đoạn | mid | tip |
| --- | --- | --- | --- |
| 6 | 100 | 4,367° | 1,818° |
| 7 | 83,333 | 3,085° | 2,5° |
| 8 | 66,667 | 1,918° | 2,648° |
| 9 | 50 | 0,995° | 2,272° |
| 10 | 33,333 | 0,372° | 1,551° |
| 11 | 16,667 | 0,048° | 0,738° |
| 12 | 0 | −0,022° | 0,078° |
| 13 | 0 | −0,022° | 0,078° |

Đã đọc cả 16 mẫu trong [bảng ảnh/góc/Mix](../exercises/mesh-lab/scarf/physics-stop-frames.jpg). Tip vẫn tăng nhẹ đầu đoạn dù Mix giảm: còn phản ứng chuyển động của chuỗi, nên không suy ra góc giảm đều theo Mix.

Playback bắt đầu frame 5, Speed 10%, Timeline 30 FPS; 80 ảnh từ 0,385 đến 3,555 giây sau bấm Play. Đã xem toàn bộ [bảng playback](../exercises/mesh-lab/scarf/physics-stop-live-contact.jpg), phủ phần giảm Mix và sau khi về 0; thiếu khoảnh khắc đầu sau bấm. Phần ảnh bị vai che chưa đánh giá được. Đã trả Speed 100%, dừng frame 0.

## Cách áp dụng

Muốn khăn trở về tư thế đã đặt: giữ một key Mix trước lúc giảm, rồi đưa về 0 trong một khoảng đủ dài để tránh bước nhảy lớn. Muốn giữ nguyên tư thế đang rung là bài toán khác; bài này chưa giải quyết. Biên độ và chuyển động khác có thể cần khoảng giảm khác, không dùng sáu frame như một quy tắc cố định.
