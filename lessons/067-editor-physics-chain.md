# Bài 67 — Physics nối tiếp trên hai xương

Đã tạo `head-tip` dưới xương `head` của robot, mỗi xương có Physics riêng. Thử đủ bốn tổ hợp Mix trong bản animation `head-chain`, đọc góc theo World và khôi phục cấu hình. Khi tắt Physics của con, nó vẫn đi theo góc cha; khi bật, nó có thêm chuyển động riêng.

## Dựng trong editor

Xương head có Length 100, góc Setup 0°, World X/Y −0,5/82,5. Tạo con `head-tip`, đặt World X/Y 99,5/82,5, Rotate 0°, Length 80. Như vậy gốc con nằm ở đầu mút cha, Translate theo cha là 100/0. Đây là xương thử chưa gắn ảnh; chưa phải anten hai đoạn hoàn chỉnh.

Tạo Physics Constraint cho head-tip. Rotation 100, các Translate/Scale/Shear 0, FPS 60, Inertia 50, Strength 100, Damping 15, Mass 100, Wind/Gravity 0. Giữ Mix trong Setup = 0. Sao chép `head-settle` thành `head-chain`, giữ các key thân 0/6/90 và key Physics head có sẵn. Đặt thêm key Mix 100 của head-tip tại frame 0. Không đặt key Rotate cho hai xương.

Theo [hướng dẫn Physics chính thức](https://esotericsoftware.com/spine-physics-constraints), chiều dài xương ảnh hưởng mô phỏng; Mix điều chỉnh ảnh hưởng constraint, và Deterministic tính từ đầu để đối chiếu cùng frame. Bật Deterministic trong các phép đo dưới đây.

## Bốn đối chứng tại frame 6

Mỗi thay đổi Mix được **ghi vào key frame 0**, sau đó tua tới frame 6 để mô phỏng lại. Không dùng thay đổi tạm tại frame 6 làm đại diện cho toàn bộ lịch sử mô phỏng.

| Mix cha | Mix con | Góc World của con |
| --- | --- | ---: |
| 0 | 0 | 0° |
| 100 | 0 | 2,336° |
| 0 | 100 | 2,918° |
| 100 | 100 | 3,677° |

Khi chỉ bật cha, con cùng góc với cha. Khi chỉ bật con, cha giữ 0° nhưng con vẫn phản ứng với chuyển động hạ thân. Khi bật cả hai, kết quả không bằng phép cộng hai góc của hai lần thử riêng: chuyển động của cha cũng thay đổi chuyển động đầu vào của con.

## Hai tầng sau khi thân dừng

Góc gần 360° được đổi sang số âm để đọc dễ hơn. Các số là giá trị hiển thị đã làm tròn, không phải dữ liệu export.

| Frame | Head | Head-tip |
| --- | ---: | ---: |
| 6 | 2,336° | 3,677° |
| 12 | −0,345° | 1,173° |
| 24 | 0,102° | −0,200° |
| 45 | 0,004° | −0,012° |
| 90 | 0° | 0° |

Hai đoạn có thể nghiêng khác phía ở cùng frame. Tọa độ gốc con khớp đầu mút cha trong sai số làm tròn UI dưới 0,001 đơn vị ở năm mẫu. Ví dụ frame 6: gốc con 99,417/74,575; cha ở −0,5/70,5 với góc 2,336° và chiều dài 100. Không có Translate Physics trên con; chuyển động gốc con đến từ quan hệ cha/con.

## Khôi phục và phạm vi kết luận

Đã trả hai key Mix về 100, tua lại frame 12 và đọc con 1,173° như trước. Kích hoạt `head-settle` gốc: head-tip Mix 0, frame 6 có góc 2,336° theo cha. Cuối bài kích hoạt lại head-chain, về frame 0 và dừng; bật lại ảnh robot và mở Outline toàn thân.

Bằng chứng trong `exercises/robot/evidence/physics-chain/`, gồm ảnh từng mẫu và `measurements.json`. Đã xem tất cả ảnh trong lúc thao tác. Bài chứng minh cơ chế hai tầng qua các pose xác định; chưa đánh giá playback liên tục của chuỗi, đổi thứ tự constraint hay chất lượng một phụ kiện có ảnh. Không coi đây là bằng chứng hoàn thiện mọi trường hợp Physics nhiều tầng.

Bước tiếp theo: rà trực tiếp tiêu chí bài 3–6 trong PLAN để chọn việc còn thiếu ảnh hưởng đến sản phẩm robot; tạm khép phép bật/tắt hai tầng đã có đối chứng.
