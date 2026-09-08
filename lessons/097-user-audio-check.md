# Bài 97 — Người dùng kiểm tra âm thanh

08/09/2026. Đã chuyển từ jelly-soft về skeleton robot, kích hoạt `walk-wide`, căn Outline để thấy đủ chân và phát lặp ở 30 FPS, Speed 100%, Interpolated.

Người dùng trả lời “có” khi được hỏi có nghe tiếng bước chân. Sau câu hỏi riêng “Tiếng có khớp lúc chân chạm đất và nghe rõ, không rè hay chồng tiếng không?”, người dùng trả lời “confirm”. Ghi nhận đạt kiểm tra nghe và đồng bộ cảm nhận cho đoạn này theo xác nhận trực tiếp của người dùng. Codex không tự nghe âm thanh và không có bản ghi âm.

Sau xác nhận đã dừng `walk-wide` ở frame 0. [Ảnh trạng thái cuối](../exercises/robot/evidence/audio-user-confirmed-stopped.png) chỉ chứng minh giao diện và trạng thái dừng; bằng chứng âm thanh là phản hồi người dùng.

Khoảng trống audio trong bài 21/40/56 đã được giải quyết trong phạm vi `walk-wide` hiện tại. Không suy ra đã kiểm tra mọi animation, thiết bị âm thanh hoặc tích hợp runtime. Lưu/xuất đã bỏ qua theo yêu cầu trước đó.
