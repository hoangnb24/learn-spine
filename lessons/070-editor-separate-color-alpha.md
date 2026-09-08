# 70 — Key màu và alpha độc lập

Thực hành trên Spine Trial ngày 07/09/2026, animation mới `head-color-alpha` của robot mint. Bài này tạo từ trống, chỉ đặt key màu slot `head`; không sửa Setup.

## Cấu hình đã dựng

Trong thuộc tính slot, bật Separate → Alpha. Nút key bên trái dành cho alpha, bên phải cho RGB. Graph hiển thị hai dòng `Alpha: head` và `RGB: head`.

| Dòng key | Mốc và giá trị |
| --- | --- |
| RGB | Frame 0 trắng 255/255/255; 30 vàng 255/255/0; 60 trắng 255/255/255 |
| Alpha | Frame 0 = 255; 15 = 128; 45 = 128; 60 = 255 |

Mục đích: màu tiếp tục đổi trong đoạn 15–45, còn độ trong suốt giữ nguyên. Các giá trị RGB chỉ pha màu lên ảnh mint có sẵn, không thay ảnh nguồn.

## Lỗi tìm được và sửa

Đọc lại năm mốc sau khi tạo key: alpha tại 15/45 đều 128 nhưng tại 30 chỉ 114 (`FFFF0072`). [Ảnh lỗi](../exercises/robot/evidence/color-alpha-keys/frame-30.png).

Mở Graph, căn toàn bộ đường cong: tiếp tuyến alpha đi vào key 45 nghiêng, khiến đoạn giữa hai key bằng nhau võng xuống. Chọn đúng key alpha tại 45 rồi dùng Flat. [Trước sửa](../exercises/robot/evidence/color-alpha-keys/alpha-graph-before.png), [sau sửa](../exercises/robot/evidence/color-alpha-keys/alpha-graph-flat.png). Không thêm key alpha tại 30 để che lỗi; cấu trúc key vẫn là 0/15/45/60.

Đã đọc lại ba mốc giữa sau sửa:

| Frame | RGB | Alpha | Mã màu |
| --- | --- | --- | --- |
| 22 | 255/255/46 | 128 | `FFFF2E80` |
| 30 | 255/255/0 | 128 | `FFFF0080` |
| 38 | 255/255/46 | 128 | `FFFF2E80` |

Ảnh: [22](../exercises/robot/evidence/color-alpha-keys/fixed-22.png), [30](../exercises/robot/evidence/color-alpha-keys/fixed-30.png), [38](../exercises/robot/evidence/color-alpha-keys/fixed-38.png). Đường alpha sau sửa nằm ngang từ 15 đến 45; RGB vẫn có đỉnh màu tại 30. Đó là bằng chứng hai thuộc tính dùng các thời điểm key độc lập.

## Kết thúc và phạm vi

Đã mở lại animation gốc ở frame 6 và thấy đầu hiển thị màu bình thường; ảnh này không phải phép so sánh toàn bộ key của bản gốc. Khi chuyển về bài mới, cây cuộn làm lần bấm đầu bật nhầm `head-forces`; đã đọc lại tên gạch dưới và chấm trắng, bật đúng `head-color-alpha`. [Trạng thái cuối](../exercises/robot/evidence/color-alpha-keys/final-0.png): animation mới đang bật, frame 0, dừng, Loop bật, robot trắng/mint bình thường.

Đạt bài tách key RGB/alpha và sửa lỗi nội suy giữa hai key bằng nhau. Chưa đánh giá playback liên tục hoặc xuất dữ liệu. Bước tiếp theo trong phạm vi còn thiếu là dùng Weights view để truy ảnh hưởng xương trên mesh đã có.

Tham khảo: [Slots — Separate color and alpha](https://us.esotericsoftware.com/spine-slots), [Keys — Slot color](https://eu.esotericsoftware.com/spine-keys). Hướng dẫn có khác tên nút theo phiên bản; bài ghi đúng nhãn Separate → Alpha đang thấy trong editor.
