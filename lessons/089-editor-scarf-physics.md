# 89 — Physics trên mesh khăn hai đoạn

Đã cho mesh khăn thật phản ứng với hai Physics constraint trên `scarf-mid` và `scarf-tip`, đối chứng bật/tắt và xem playback. Khăn bám cổ, uốn theo cú nhún thân rồi lắng lại; chưa thấy rách hoặc bật hình lớn ở phần nhìn thấy. Vai che một phần khăn nên chưa kết luận toàn bộ bề mặt không tự chồng.

## Dựng trong editor

Dùng lại mesh tám đỉnh và weights bài 85. Mỗi constraint nhắm vào xương cùng tên, Rotation 100, Translate/Scale/Shear 0, FPS 60, Inertia 50, Strength 100, Damping 15, Mass 100, Wind/Gravity 0. Mix trong Setup bằng 0, đã đọc lại cho cả hai sau kiểm tra.

Sao chép `head-settle` thành `scarf-physics`, giữ cú hạ thân ở 0–6 và giữ đến 90. Đặt key Mix 100 ở frame 0 cho cả hai constraint khăn; không thêm Rotate key cho khăn. Trong lúc nhập từng có Mix 1000 do chọn số chưa hết; đã sửa và đọc lại 100. Simulate và Deterministic bật.

## Đối chứng

Tám mốc 0, 3, 6, 9, 12, 24, 45, 90 cho góc Parent của mid lần lượt −0,022; 2,923; 4,367; 1,342; −0,664; 0,17; −0,015; −0,022 độ. Đây là phản ứng nhỏ phù hợp cú nhún hiện có, không phải phép đo độ mềm cho mọi chuyển động.

Tạm đổi hai key Mix về 0: frame 6 cho mid −0,022° và tip 0,078°, bằng góc nền. Khôi phục hai key Mix 100, frame 6 tip thành 1,818°. Như vậy phần lệch được tạo bởi Physics, không chỉ do kế thừa chuyển động thân.

Chạy Loop ở 30 FPS, Speed 100%, lấy 90 ảnh trong khoảng 0,390–3,979 giây sau bấm Play. Đã xem đủ ảnh qua [bảng playback](../exercises/mesh-lab/scarf/physics-live-contact.jpg). Không thấy chỗ nối cổ bung hoặc bước nhảy hình lớn ở vùng khăn nhìn thấy. Animation này thân hạ rồi giữ, không có tư thế thân đầu/cuối trùng nhau; phép xem playback không chứng minh một vòng seamless.

Ảnh đối chứng nằm trong `exercises/mesh-lab/scarf/physics-scarf-*.png`; thời gian mẫu trong `physics-live-times.json`. Kết thúc dừng frame 0, `scarf-physics`, hai Mix 100; Setup hai Mix vẫn 0. Chưa kiểm tra lại riêng idle/walk sau thêm constraint, chưa thử dừng mô phỏng ở pha tùy ý. Dữ liệu editor vẫn thuộc phiên Trial đang mở; tài liệu/ảnh không thay thế file Spine đã lưu.

## Cách dùng lại

Giữ điểm neo ở cổ ngoài hai xương mô phỏng. Kiểm tra weights trước khi thêm Physics để phân biệt lỗi ảnh với lỗi mô phỏng. Đặt Mix mặc định 0, chỉ key bật trong động tác cần dùng. Khi đánh giá phải xem ảnh và chỗ nối; góc xương thay đổi chưa đủ để kết luận mesh tốt.

Bổ sung: [bài 90](090-editor-scarf-physics-stop.md) đã kiểm tra Mix/góc ở bốn mốc idle/walk và tạo đoạn giảm Mix khi đang rung.
