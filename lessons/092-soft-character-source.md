# Bài 92 — Chuẩn bị nhân vật mềm

08/09/2026. Trạng thái: chuẩn bị ảnh xong với giới hạn đã ghi; **chưa dựng mesh trong Spine**.

Sau khi khép bài nhảy robot 91, chuyển sang nhân vật mềm theo phần kế tiếp đã nêu trong PLAN. Chọn thạch một khối để thấy biến dạng toàn thân, khác với các mảnh cơ khí và khăn phụ kiện.

Đã tạo và xem ảnh bằng ImageGen tích hợp, lưu [nguồn và thông số](../exercises/soft-character/README.md), [prompt đã dùng](../exercises/soft-character/prompt.txt) và [kiểm tra alpha](../exercises/soft-character/asset-check.json). Bản đầu có nền trong suốt thật, phần thân gần đục; bản sửa bị nền caro thật nên loại. Không đánh dấu sửa alpha thành công.

Spine vẫn đang dừng ở frame 0 của bài robot; lượt này chỉ đọc giao diện, chưa thay đổi rig. Bước tiếp theo: tạo skeleton riêng, nhập jelly.png và dựng đường bao mesh theo hình nhìn thấy. Tiêu chí hoàn tất cả bài nhân vật mềm được giới hạn ở ba bước trong README nguồn: rig, sửa lỗi weights, một vòng bật có kiểm tra playback.
