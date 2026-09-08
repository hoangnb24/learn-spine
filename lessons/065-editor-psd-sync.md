# Bài 65 — Đồng bộ lại PSD và giữ rig đã chỉnh

Đã đồng bộ bản PSD có lớp đầu dịch sang phải 24 pixel vào `robot-layers`. Hình toàn thân trong Outline vẫn trùng pixel trước đồng bộ; hai xương mẫu giữ tọa độ, góc và chiều dài đã chỉnh ở bài 45. Đã trả nguồn về PSD gốc, đồng bộ lần nữa và kiểm tra 15 PNG đầu ra khớp toàn bộ kênh RGBA với bản sao lưu.

## Thay đổi cách thao tác trong Spine 4.3

Hộp thoại Import PSD hiện chỉ cho tạo skeleton mới. Để cập nhật skeleton đang làm: chọn **Images → bánh răng cạnh tên PSD → PSD Settings**, chọn nguồn, OK, rồi bấm biểu tượng đồng bộ màu cam cạnh tên PSD. Hộp thoại xác nhận liệt kê 15 ảnh ghi đè; Delete previously imported images được tắt. Đây là thao tác đã chạy trong editor, có thông báo `PSD imported`.

Nhà phát triển mô tả việc chuyển cập nhật PSD sang Images từ 4.3.30-beta trong [thảo luận Spine 4.3](https://pt.esotericsoftware.com/forum/d/28396-the-spine-43-beta-has-begun/112). [Hướng dẫn Import PSD](https://esotericsoftware.com/spine-import-psd) vẫn dẫn tới lựa chọn nhập dữ liệu cũ; cần đối chiếu giao diện phiên bản đang chạy.

## Đối chứng

Bản thử `exercises/robot/psd-import/reimport/robot-layers-head-shift.psd` giữ tên và pixel của 16 lớp nguồn; chỉ tăng vị trí X lớp đầu thêm 24. Không thay hình vẽ. Bản ghi thay đổi nằm trong `layer-changes.json`.

| Xương | World X/Y trước và sau | Rotate | Length |
| --- | --- | --- | --- |
| head | 0 / 474 | 90° | 100 |
| forearm-left | −109,6 / 368 | 260° | 96 |

Ảnh bằng chứng trong `exercises/robot/psd-import/reimport/evidence/`: `before-head`, `synced-head`, `before-arm`, `synced-arm`, `restored`. Vùng Outline [700,150,990,713] chứa toàn robot trùng pixel ở cả ba cặp trước/sau/khôi phục; kết quả trong `checks.json`. Các ảnh được xem trực tiếp khi thao tác. Nguồn cuối là `robot-layers.psd`, robot ở Setup.

## Kết luận và giới hạn

Trong cấu hình đồng bộ này, dịch vị trí lớp PSD không tự dời hình đang gắn trên rig. Cần phân biệt cập nhật tệp ảnh với thay vị trí attachment. Không có nút Ignore/Replace trong PSD Settings vừa kiểm tra; chưa chứng minh thao tác thay vị trí attachment bằng PSD, cũng chưa thử thay nội dung pixel hoặc nhóm lớp lồng nhau. Hai xương mẫu và ảnh toàn thân không phải phép kiểm tra mọi thuộc tính của 15 xương.

Bước tiếp theo: thử cập nhật nội dung một ảnh có đối chứng, hoặc PSD có nhóm lồng nhau; với Physics còn bài nhiều tầng. Không lặp lại phép dịch lớp này khi chưa có câu hỏi mới.
