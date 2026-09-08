# Bài 63 — thử riêng Wind và Gravity

Đã tạo `head-forces` từ `head-settle`, đặt thêm key Rotate đầu 45° tại frame 0 và thử hai lực riêng. Ở frame 90, gió làm góc đầu nhỏ hơn; trọng lực làm đầu nghiêng xuống qua góc 0°. Sau khi trả hai lực về 0, góc trở lại 45°.

## Cấu hình và cách thử

Bản sao giữ chuyển động hạ thân và Physics của [bài 43](043-editor-head-physics.md): Mix 100, Damping 15, Inertia 50, Strength 100, Mass 100. Deterministic bật. Chỉ thêm góc đầu 45° trên bản sao để xương không nằm dọc một trong hai hướng lực. [Tên animation và key 45°](../exercises/robot/evidence/head-forces/animation-key45.png).

Theo [Physics constraints — tài liệu chính thức](https://esotericsoftware.com/spine-physics-constraints), Wind là lực không đổi dọc trục X thế giới; Gravity dọc trục Y thế giới. Hai lực này không tương đương việc trực tiếp đặt góc xoay. Kết quả còn phụ thuộc cấu hình mô phỏng và tư thế xương.

Thử mỗi cấu hình bằng cách đặt key lực tại frame 0, rồi tua đến 90. Khi chuyển sang Gravity, đã đặt lại key Wind thành 0. Các số dưới đây được đọc trực tiếp từ UI, không phải dữ liệu xuất.

| Cấu hình | Wind | Gravity | World Rotate ở 90 |
|---|---:|---:|---:|
| Nền | 0 | 0 | 45,0° |
| Chỉ gió | 100 | 0 | 22,798° |
| Chỉ trọng lực | 0 | 109,1 | 344,705° (= −15,295°) |
| Trả về nền | 0 | 0 | 45,0° |

Ảnh: [nền](../exercises/robot/evidence/head-forces/base90.png), [gió](../exercises/robot/evidence/head-forces/wind90.png), [trọng lực](../exercises/robot/evidence/head-forces/gravity90.png), [khôi phục](../exercises/robot/evidence/head-forces/restored90.png). Ở cả bốn mẫu, vị trí đầu hiển thị X/Y = −0,5 / 70,5. Bài này thử Physics Rotation, không thử dịch chuyển X/Y.

## Lỗi nhập số và giới hạn kết luận

Lượt nhập Wind dự định 100 ban đầu thành 1000 do chữ số cũ chưa được thay hoàn toàn. Đã đọc lại, sửa key về đúng 100 rồi đo lại; ảnh gió trong bảng là bản sau sửa. Gravity cũng gặp lỗi nhập, sau đó chỉnh bằng thanh trượt và đọc được 109,1. Bảng giữ đúng giá trị đó, không làm tròn thành 100. Hai lực thử khác độ lớn, nên không dùng bảng để kết luận lực nào mạnh hơn với cùng giá trị.

Đây là so sánh một mốc sau kích thích, chưa chứng minh đã đạt cân bằng tuyệt đối hoặc chất lượng chuyển động toàn hành trình. Khung robot còn nhỏ và chữ Trial che phần trên; góc UI là bằng chứng chính. Chưa đánh giá nối vòng.

## Trạng thái cuối

Hai key lực trên head-forces đã trả về 0, key Rotate đầu vẫn 45°. Kiểm tra lại head-settle gốc ở [frame 90](../exercises/robot/evidence/head-forces/original90.png): góc đầu 0°, đúng mốc bài 43. Kết thúc ở head-forces frame 0, dừng phát. Trial chưa lưu được project; ảnh và hướng dẫn đã lưu trong workspace.
