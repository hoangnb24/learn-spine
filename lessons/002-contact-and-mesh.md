# Bài 2 — Tiếp đất và lỗi biến dạng

Ngày 06/09/2026. Bài thực hành runtime bổ sung trong khi đường điều khiển editor chưa có.

## Bước ngang

Đã thêm `walk_side` vào robot. Một chu kỳ 1 giây dịch chuyển xương gốc 70 đơn vị. Mục tiêu chân được dựng trong tọa độ thế giới rồi trừ chuyển động xương gốc để tạo key cục bộ.

- Chân trái trụ từ 0 đến 0,5 giây.
- Chân phải trụ từ 0,4 đến 1 giây.
- Có khoảng cả hai chân chạm đất từ 0,4 đến 0,5 giây.
- Camera bám xương gốc, vạch sàn giúp thấy chuyển động tương đối.

Lấy mẫu 121 tư thế: chân trụ lệch tối đa khoảng 0,00000264 đơn vị. Khi so tư thế đầu/cuối, cần trừ quãng đường 70 đơn vị; so trực tiếp tọa độ sẽ nhầm chuyển động tiến lên thành lỗi vòng lặp.

Đây là bài bước ngang phù hợp ảnh chính diện, chưa chứng minh dáng đi tiến ở góc nghiêng hoặc chuyển trọng lượng tự nhiên. Xem [bài robot](../exercises/robot/README.md) và `runtime-checks.json`.

## Mesh và dữ liệu bị bỏ qua

Đã dựng một dải ảnh có ba biến thể để so sánh sai trọng số, uốn theo xương và biến dạng trực tiếp. Một file đọc được nhưng có 0 timeline vẫn có thể là file sai về hành vi. Xem [bài mesh](../exercises/mesh-lab/README.md).

## Xác minh bản cài Spine

Chạy CLI chính thức `--help` và `--version` trên `/Applications/SpineTrial.app/Contents/MacOS/Spine Trial`:

- Launcher: 4.3.06 Trial.
- Editor được CLI báo: **4.3.23 Trial**.
- Help của Trial chỉ liệt kê nhóm Editor; không liệt kê các lệnh nhập/xuất của bản đầy đủ.

Do đó, metadata 4.3.06 trong app không phải phiên bản editor. Dữ liệu học hiện tại là 4.2.22 với runtime 4.2.120; khả năng nhập vào editor 4.3.23 còn phải kiểm tra. [CLI chính thức](https://esotericsoftware.com/spine-command-line-interface).

Vẫn chưa có bằng chứng thao tác editor. Câu hỏi cho phép dùng API macOS/AppleScript thay thế Computer Use đang chờ người dùng trả lời.
