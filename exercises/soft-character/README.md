# Nhân vật mềm — thạch xanh

Nguồn: công cụ image_gen tích hợp, 08/09/2026. Ảnh được xem trực tiếp sau sinh.

Ảnh chọn tạm để dựng mesh: [images/jelly.png](images/jelly.png), 1254 × 1254. Đây là nguồn ảnh. [Rig trong editor đã có mesh và ba xương](../../lessons/093-editor-jelly-mesh.md), đã có [jelly-bounce và kiểm tra playback](../../lessons/096-editor-jelly-bounce.md).

Kiểm tra alpha: 1.017.457 pixel trong suốt hoàn toàn; phần thân chủ yếu alpha 252–253/255 (khoảng 99% đục). Các pixel alpha rất thấp xuất hiện ngoài đường viền, nên không dùng bounds alpha khác 0 làm đường bao mesh tự động. Đặt đường bao theo thân nhìn thấy và kiểm tra trên nền tối/sáng trong editor. Chưa gọi nguồn này là ảnh đã làm sạch hoàn toàn.

Bản `jelly-v2.png` bị loại: nền caro đã nằm trong RGB, toàn bộ alpha 255. Lần sửa tiếp theo cũng trả alpha 255 nên không chọn. Không tiếp tục sinh lại cùng yêu cầu khi chưa có lý do mới.

## Phạm vi bài thực hành

1. Dựng skeleton riêng trong project đang mở; nhập ảnh, đặt điểm gốc ở giữa đáy. Dựng mesh có các hàng đỉnh quanh đáy, thân dưới, mặt và đỉnh; tránh tam giác dài xuyên vùng mắt.
2. Gán weights cho xương đáy/thân/đỉnh. Thử nén, kéo giãn và nghiêng; đáy không trôi khi nén, đường viền không gãy và mặt còn đọc rõ. Cố tình gán sai một vùng rồi sửa để phân biệt lỗi weights với thiếu đỉnh.
3. Làm một vòng bật nhẹ với lấy đà, kéo giãn và đáp; kiểm tra các tư thế khó rồi playback. Chỉ khép bài sau bằng chứng editor, không dùng ảnh nguồn làm bằng chứng biến dạng.

Lưu/xuất bỏ qua theo yêu cầu người dùng. Không sửa robot đã hoàn tất để làm bài này.

## Kết quả

Đã hoàn thành phạm vi cơ bản trên qua bài 93–96. Lỗi gán cứng đáy làm mép gập và cách sửa vùng chuyển tiếp nằm ở bài 95; thử nghiêng và vòng bật có bằng chứng ở bài 96. Không mở thêm biến thể nếu chưa có lỗi hoặc yêu cầu mới.
