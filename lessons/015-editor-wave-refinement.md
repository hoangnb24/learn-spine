# Vẫy tay: sửa tư thế vào trong

Thực hành 07/09/2026 trên Spine 4.3.25 Trial, sau khi nhập lại `exercises/robot/robot-editor-4.3.json`, skin mint, animation wave.

Ở frame 21 và 39, `forearm-right` có Rotate 110°. Bàn tay chồng lên phần đầu bên phải. Giảm cả hai key xuống 95° làm bàn tay dịch ra ngoài, hình dáng bàn tay đọc rõ hơn. Đây là một vòng sửa tư thế; chưa kết luận bộ động tác đã đạt chất lượng cuối.

- [Frame 21 trước sửa](../docs/evidence/robot-wave21-before.jpg)
- [Frame 21 sau sửa và chuyển frame kiểm tra lại](../docs/evidence/robot-wave21-after.jpg)
- [Frame 39 sau sửa và chuyển frame kiểm tra lại](../docs/evidence/robot-wave39-after.jpg)
- [Phát thử sau sửa](../docs/evidence/robot-wave-revised-play.jpg)

Để dựng lại: mở wave, chọn `forearm-right` từ Dopesheet; đến frame 21, nhập Rotate 95, bấm nút key Rotate; lặp lại ở frame 39. Auto Key tắt. Chuyển sang frame 0 rồi quay lại từng key: cả hai đều hiển thị 95°. Đã phát thử và dừng về frame 0.

Lỗi thao tác gặp trong bài: double-click rồi Backspace một lần không xóa hết ô số, khiến giá trị thành 9510 thay vì 95. Đã xóa đủ ký tự phía trước và sau con trỏ, nhập lại 95 và ghi đè key sai. Phải đọc lại con số trên giao diện sau khi nhập, rồi chuyển frame để kiểm tra key thực sự được lưu trong phiên.

Vòng sửa thứ hai: mở Graph của `forearm-right`. Các điểm đổi chiều đã có tiếp tuyến ngang, tức tốc độ xoay giảm về 0 ở đỉnh/đáy. Giảm key cuối frame 57 từ 95° xuống 85° để lần vẫy cuối nhẹ hơn hai lần trước. Chuyển frame 0 rồi về 57 xác nhận 85° được giữ; Graph cho thấy đỉnh cuối thấp hơn và đường cong xuống frame 75 vẫn liền mạch.

- [Graph trước sửa nhịp cuối](../docs/evidence/robot-wave-graph-before-tail.jpg)
- [Graph sau sửa, key 57 = 85°](../docs/evidence/robot-wave-graph-tail85.jpg)
- [Tư thế frame 57](../docs/evidence/robot-wave57-tail85.jpg)
- [Tư thế đầu](../docs/evidence/robot-wave0-start.jpg) và [cuối](../docs/evidence/robot-wave75-end.jpg): cùng tư thế đứng, tay hạ.

Đã phát bản sửa thứ hai và dừng về frame 0. Không đổi thời điểm các key; thay đổi lần hai là giảm biên độ nhịp cuối. Không có phép đo vận tốc toàn thân hay đánh giá video xuất.

Giới hạn: ngón cái vẫn sát viền đầu ở các nhịp giữa; chưa coi rig và toàn bộ bộ động tác hoàn thiện. Thay đổi chỉ nằm trong project Trial đang mở; file JSON nguồn chưa chứa ba key sửa (21 = 95°, 39 = 95°, 57 = 85°), chưa có project lưu/xuất.
