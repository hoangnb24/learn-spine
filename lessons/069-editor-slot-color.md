# 69 — Nhận diện ảnh tối hoặc mất do màu slot

Thực hành trên Spine Trial, ngày 07/09/2026. Đã mở Views → Color, chọn slot `head` của robot mint và thử trong Setup. Không tạo key màu trong animation.

## Dự đoán và kết quả

Giảm độ sáng sẽ làm tối ảnh; giảm alpha sẽ làm ảnh trong suốt. Cả hai không cần đổi ảnh nguồn hoặc xương.

| Thử | Giá trị đọc lại | Kết quả quan sát |
| --- | --- | --- |
| Ban đầu | `FFFFFFFF`, RGB/A đều 255 | Đầu hiện bình thường |
| Brightness 50 | RGB 127/127/127, A 255, `7F7F7FFF` | Đầu tối, thân giữ màu |
| Alpha 128 | RGB 255/255/255, `FFFFFF80` | Đầu mờ, nền hiện xuyên qua |
| Alpha 0, lần kiểm tra cuối | `FFFFFF00` | Ảnh đầu không còn thấy; attachment vẫn có trong cây và viền chọn còn hiện |
| Khôi phục | `FFFFFFFF`, RGB/A đều 255 | Đầu hiện lại; đã trở về Animate ở frame 6 |

Bằng chứng: [ban đầu](../exercises/robot/evidence/slot-color/baseline.png), [tối](../exercises/robot/evidence/slot-color/brightness-50.png), [mờ](../exercises/robot/evidence/slot-color/alpha-128.png), [alpha 0](../exercises/robot/evidence/slot-color/white-alpha-0.png), [khôi phục](../exercises/robot/evidence/slot-color/restored-final.png), [animation sau thử](../exercises/robot/evidence/slot-color/final-animation.png).

## Lỗi thao tác đã xử lý

Setup và Animate có bố cục riêng. Sau đổi chế độ, kéo theo vị trí panel cũ đã xoay nhầm đầu về 324,122°. Bấm Undo trên thanh công cụ đã trả góc về 0° trước khi thử màu. Phải đọc lại bố cục sau đổi chế độ.

Một số lần nhập alpha/hex không thay thế đúng nội dung ô; số đọc lại không khớp dự định. Không dùng chúng làm bằng chứng cho giá trị dự định. Chuyển sang thanh alpha và xóa trực tiếp nội dung ô Saturation; kiểm tra lại mã RGBA. Phép thử alpha 0 được lặp lại với RGB trắng chính xác, sau đó khôi phục `FFFFFFFF`. Không kết luận nguyên nhân lỗi nhập là lỗi của Spine.

## Áp dụng khi sửa lỗi

Khi ảnh tối hoặc mất nhưng attachment vẫn tồn tại, kiểm tra màu slot và alpha trước khi sửa ảnh nguồn. Trong bài này, khôi phục trắng/255 sửa được lỗi. Nếu hiện tượng chỉ xảy ra ở một đoạn animation, cần kiểm tra thêm key màu; bài này chưa thử key RGB và alpha riêng.

Theo [hướng dẫn Slots](https://us.esotericsoftware.com/spine-slots), màu slot điều chỉnh sắc độ và độ trong suốt của attachment, có thể đặt key. Alpha 0 không nên được coi là cách giảm chi phí vẽ; khi cần ẩn hẳn có thể dùng key attachment. Đây là hướng dẫn tài liệu, chưa đo hiệu năng trong bài này. [Color view](https://en.esotericsoftware.com/spine-slot-color) có thể mở rộng để hiện các ô RGB/alpha, như đã làm trong Setup.

Đạt bài chẩn đoán màu/alpha trong Setup. Còn kiểm tra key màu/alpha tách riêng và cửa sổ Weights; lưu/export vẫn là mốc có điều kiện của bản Trial.
