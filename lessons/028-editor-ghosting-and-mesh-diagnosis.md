# Bài 28 — kiểm tra nối tư thế và sửa trọng số mesh

Ngày 07/09/2026, thao tác trực tiếp trong Spine 4.3.25 Trial.

## Walk: hai đầu chu kỳ có cùng tư thế sau khi bù root

Trong `walk-handbuilt`, root tiến 60 đơn vị từ frame 0 đến 30. Mở Ghosting tại frame 0, bật After, đặt After frames = 30 và Step = 30; tắt Before, Current, Keys và Motion. Bật Anchor và On top, tắt Loop để xem đúng frame 30.

Với X offset = 0, bóng frame 30 nằm phía trước nhân vật. Đặt X offset = −2: bóng dịch −60 sau 30 frame, chồng lên tư thế hiện tại. Quan sát các bộ phận cho thấy tư thế đầu–cuối khớp nhau sau khi loại quãng tiến của root.

- [Không bù root](../exercises/robot/evidence/walk-ghost-seam-offset0.jpg).
- [Bù −2 mỗi frame](../exercises/robot/evidence/walk-ghost-seam-offset-minus2.jpg).

Đây là kiểm tra tư thế bằng mắt, chưa đo sai khác pixel hoặc vận tốc tại điểm nối. Nó cũng không tự sửa cú nhảy vị trí khi editor lặp lại root từ 60 về 0. Anchor cố định mốc lấy bóng; việc bù root ở đây đến từ X offset. Sau kiểm tra đã tắt After/On top, bật lại Loop và trả X offset về 0. Cách offset được mô tả trong [Ghosting của Spine](https://esotericsoftware.com/spine-ghosting).

## Mesh: dùng tư thế uốn để tìm ảnh hưởng thừa

Nhập `exercises/mesh-lab/editor-start.json` thành skeleton `mesh-refine` trong project hiện tại, ẩn robot để dễ quan sát. Chuyển region `strip` thành mesh 27 đỉnh: chín cột, ba hàng. Bind hai xương `base` và `tip`, mỗi xương dài 128. [Ảnh lưới trước bind](../docs/evidence/mesh-refine-27-vertices.jpg).

Trong lúc thử phân bố trọng số, ba đỉnh của cột thứ hai được đặt tip = 12,5%; ba đỉnh giữa dải đặt tip = 50%. Các cột khác vẫn dùng kết quả tự động. Đây là trạng thái thử do mình tạo ra, không phải lỗi sẵn có của dữ liệu nhập. Kế hoạch chuyển toàn dải thành gradient rộng chưa thực hiện xong và không được coi là kết quả.

Chuyển Animate, dùng Pose để xoay tip 35° mà không sửa tư thế Setup. Đường viền gần đầu dải xuất hiện một gợn rõ tại cột thứ hai, cách xa khớp. Nguyên nhân: phần đáng lẽ đi theo base vẫn chịu 12,5% ảnh hưởng của tip.

Sửa trong Setup bằng Weights / Direct: chọn từng đỉnh trong ba đỉnh đó và đặt trọng số tip về 0, tương ứng base 100%. Trở lại Animate và thử cùng góc 35°: gợn tại cột thứ hai biến mất. Vùng gần khớp vẫn uốn như trước.

- [Trước sửa, tip 35°](../exercises/mesh-lab/evidence/mesh-refine-before-35.jpg).
- [Trọng số sau sửa](../exercises/mesh-lab/evidence/mesh-refine-weight-fixed.jpg).
- [Sau sửa, cùng góc và khung nhìn](../exercises/mesh-lab/evidence/mesh-refine-after-35.jpg).
- [Toàn dải sau sửa, góc 35°](../exercises/mesh-lab/evidence/mesh-refine-after-35-fit.jpg).
- [Thử chiều ngược −35°, UI hiển thị 325°](../exercises/mesh-lab/evidence/mesh-refine-after-minus35.jpg).

Ảnh trước và ảnh sau cùng khung nhìn bị cắt đầu trên của dải; chỉ dùng chúng so sánh gợn ở phần trái. Hai ảnh fit dùng để xem toàn bộ hình sau sửa. Không kết luận toàn mesh đã đạt chất lượng: đường viền sát khớp còn đổi độ cong, chưa kiểm tra chuyển động liên tục hoặc góc lớn hơn.

## Thao tác cần nhớ

Chỉ nhập Weight khi đã thấy đúng đỉnh được chọn và giá trị đang hiện trong ô. Bấm lại dòng tên xương có thể làm thay đổi lựa chọn; bấm nhiều lần vào số thập phân cũng không chắc chọn hết số. Cách đã dùng ổn định là đặt con trỏ vào ô, End, xóa hết ký tự rồi nhập số mới và kiểm tra lại. Có một thao tác mất focus làm mesh biến mất trong lúc thử; đã Undo ngay và xác nhận mesh 27 đỉnh cùng hai xương còn nguyên trước khi tiếp tục.

Nguyên lý chọn đỉnh và chỉnh trọng số trong Direct được mô tả ở [Weights của Spine](https://esotericsoftware.com/spine-weights). Bài học thực tế: thêm nhiều đỉnh không tự làm mesh đẹp; phải thử tư thế uốn và giới hạn ảnh hưởng của xương vào vùng cần chuyển động.

Cuối bài đã trở về Setup, tip góc 0°. Chưa tạo animation cho mesh này, chưa xuất hay lưu lại project Trial. Robot vẫn ở project, đang ẩn. Việc tiếp theo: tinh chỉnh riêng vùng sát khớp và đánh giá chuyển động qua nhiều góc, sau đó tiếp tục các phần chất lượng robot và lưu/xuất còn mở.
