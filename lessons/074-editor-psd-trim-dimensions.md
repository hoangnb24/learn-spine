# Bài 74 — Kích thước ảnh PSD và Trim

08/09/2026, Spine 4.3.25 Trial, skeleton thử `nested-robot`.

Đã phát hiện và sửa một lỗi nhập ảnh: tắt Trim khi đồng bộ làm mỗi PNG thành kích thước toàn canvas, khiến hình trên rig lệch. Bật lại Trim trên cùng nguồn thử khôi phục hình và hai PNG gốc, không phải sửa xương.

## Phép thử và dự đoán sai

Tạo [padded-robot.psd](../exercises/robot/psd-import/nested/padded-robot.psd) từ pixel của PSD bài 71. Thêm lề trong suốt 20 pixel quanh lớp head; giảm left/top 20 để phần ảnh nhìn thấy giữ vị trí trên canvas. Lớp head từ 226 × 207 thành 266 × 247; body vẫn 203 × 204. Canvas vẫn 640 × 800. Không vẽ lại hoặc co giãn nội dung ảnh.

Dự đoán ban đầu: tắt Trim sẽ giữ riêng phần lề thêm quanh đầu. Kết quả thực tế bác bỏ dự đoán đó: **cả head và body đều thành 642 × 802**, tương ứng canvas cộng Padding 1 mỗi cạnh.

## Thao tác trong editor

Images của nested-robot → PSD Settings → chọn nguồn padded-robot.psd. Scale 1, Padding 1, Trim whitespace tắt; Delete previously imported images tắt. Đồng bộ và xác nhận chỉ ghi đè hai PNG.

[Thiết lập](../exercises/robot/psd-import/nested/evidence/padding-settings.png), [hình sau đồng bộ](../exercises/robot/psd-import/nested/evidence/padding-imported.png). Trong khung đang xem, đầu không còn nằm trên cổ và thân dời lên. [Xương đầu](../exercises/robot/psd-import/nested/evidence/padding-head-bone.png) vẫn đọc World 0/474, góc 90°, Length 100, breadcrumb root → torso → head.

Hai PNG chưa Trim được giữ ở [head](../exercises/robot/psd-import/nested/padded-output-head.png) và [body](../exercises/robot/psd-import/nested/padded-output-body.png), đều 642 × 802. Không kết luận ảnh bị xóa chỉ vì nó không còn trong khung nhìn.

## Sửa và kiểm tra nguyên nhân

Giữ nguyên PSD thử, chỉ bật lại Trim rồi đồng bộ lần nữa. [Hình trở lại](../exercises/robot/psd-import/nested/evidence/padding-trim-fixed.png). Đọc file đầu ra:

| Ảnh | Trim tắt | Trim bật lại | So với PNG gốc |
| --- | --- | --- | --- |
| head | 642 × 802 | 228 × 209 | Toàn bộ RGBA bằng nhau |
| body | 642 × 802 | 205 × 206 | Toàn bộ RGBA bằng nhau |

Như vậy chỉ thay Trim trên cùng nguồn đã đủ khôi phục ảnh. Sau kiểm tra, đổi đường dẫn lại nested-robot.psd và giữ Trim bật; không cần ghi lại các PNG đã khớp gốc. [Nguồn cuối](../exercises/robot/psd-import/nested/evidence/padding-source-restored.png).

## Bài học và giới hạn

Khi ảnh lệch sau sync, kiểm tra kích thước PNG và tùy chọn Trim trước khi dời khớp để bù lỗi. Cây xương và vị trí xương có thể giữ nguyên trong khi hình hiển thị thay đổi.

Đây là phép thử lề trong suốt và kích thước canvas đầu ra. Chưa kiểm tra thay độ phân giải phần ảnh nhìn thấy hoặc thay tỷ lệ nhân vật. Không dùng bài này để đánh dấu mọi tình huống đổi kích thước đã hoàn tất. Không sửa key hay biến đổi xương; kết thúc ở Setup của skeleton thử.
