# Kiểm tra chân trụ trong editor

Ngày 07/09/2026, Spine 4.3.25 Trial, robot mint, animation `walk_side`, 30 frame / giây. Đây là kiểm tra dữ liệu đã nhập, chưa phải animation đi mới dựng trong editor.

Chọn từng `foot-target`, bật World ở bảng Transform và đọc Translate. World cho biết vị trí trong toàn cảnh, tránh nhầm với tọa độ tương đối của xương con khi root đang di chuyển.

| Điểm điều khiển | Frame đã đọc | World X | World Y |
| --- | --- | --- | --- |
| foot-target-left | 0, 7, 15 | −43 | 73 |
| foot-target-right | 12, 21, 30 | 113 | 73 |

Điểm điều khiển chân trụ đứng yên ở các mẫu trên. Hình chân chống cũng giữ vị trí trên canvas qua các tư thế đã xem. Đây chưa phải phép đo mọi frame hay mọi điểm trên đế giày.

Bằng chứng: chân trái [0](../docs/evidence/robot-walk-left0-world.jpg), [7](../docs/evidence/robot-walk-left7-world.jpg), [15](../docs/evidence/robot-walk-left15-world.jpg); chân phải [12](../docs/evidence/robot-walk-right12-world.jpg), [21](../docs/evidence/robot-walk-right21-world.jpg), [30](../docs/evidence/robot-walk-right30-world.jpg).

Kiểm tra riêng root: World X = 0 ở [frame 0](../docs/evidence/robot-walk-root0-world.jpg), X = 70 ở [frame 30](../docs/evidence/robot-walk-root30-world.jpg), Y = 0 ở cả hai. Vì thế phát lặp nguyên clip trong editor đưa nhân vật trở về điểm xuất phát; không thể coi chuyển vị trí này là lỗi trượt của chân trụ giữa bước. Cần xử lý cách phát chuyển động tiến tới hoặc tạo bản đi tại chỗ để kiểm tra vòng lặp phù hợp.

Việc tiếp theo: làm bản đi tại chỗ trong editor hoặc kiểm tra cách nối chuyển động tiến tới, đánh giá tư thế nâng chân và khớp chân qua ít nhất hai vòng sửa. Chưa kết luận dáng đi đạt chất lượng cuối. Lượt này không thay đổi key.

Cập nhật [bài 23](023-runtime-walk-loop-placement.md): bản xem runtime đã cộng quãng đường qua các vòng và kiểm tra tư thế nối/chân trụ qua bốn chu kỳ. Phần này xử lý vị trí khi phát; không hoàn tất bản `walk-in-place` trong editor bên dưới.

## Bắt đầu bản đi tại chỗ — chưa hoàn tất

Đã dùng nút Duplicate của animation, đổi tên bản sao thành `walk-in-place`. Trong Graph của root, mở Favor và chọn Default. Chọn key X ở frame 30 rồi kéo slider hết sang phải đã đưa key này từ 70 về 0; ô Translate xác nhận 0 và Graph cho thấy key cuối hạ xuống 0. Cách chọn key và chế độ Default được đối chiếu với [hướng dẫn Graph chính thức](https://us.esotericsoftware.com/spine-graph).

Chưa đưa toàn bộ các key root còn lại về 0. Khi tiếp tục các key trước frame 30, Computer Use báo `noWindowsAvailable`, sau đó `timeoutReached`; khởi tạo lại kết nối vẫn timeout. Không biết chính xác bao nhiêu thao tác trong nhóm tiếp theo đã thực hiện. Cần đọc lại Graph khi có cửa sổ trước khi sửa tiếp. Bản sao hiện là bản đang làm dở, có thể còn đoạn nhảy vị trí; không dùng nó như vòng đi tại chỗ đã hoàn chỉnh. Bản `walk_side` gốc được giữ riêng.
