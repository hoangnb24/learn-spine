# Sửa rig và tự tạo nhịp thở trong editor

Thực hành ngày 06/09/2026 trong Spine 4.3.23 Trial qua Computer Use. Đây là thao tác trực tiếp trên robot đã nhập, không phải sửa JSON rồi gọi đó là thao tác editor.

## Quan hệ xương cha/con và IK

Dự đoán: xoay body thì đầu/tay đi theo; mục tiêu bàn chân nằm dưới root nên bàn chân vẫn giữ chỗ. Ở Setup, chọn body và nhập Rotate 15°. Quan sát đúng dự đoán; Undo về 0°.

Cố ý làm sai: chọn xương head, nhấn P (Set Parent), chọn root. Hình giữ vị trí, nhưng tọa độ Y của head đổi từ 170 dưới body thành 474 dưới root. Xoay body 15° lần nữa: đầu đứng thẳng trong khi thân nghiêng. Đây là lỗi quan hệ xương, không phải lỗi key.

Sửa: Undo phép xoay trước; chọn head → P → body. Y trở lại 170. Xoay body 15° để kiểm tra lại: đầu nghiêng cùng thân. Cuối cùng Undo phép xoay về 0°.

Bằng chứng: [trước](../docs/evidence/robot-body-before.jpg), [xoay thân](../docs/evidence/robot-body-15.jpg), [sai cha](../docs/evidence/parent-head-wrong.jpg), [sửa cha](../docs/evidence/parent-head-fixed.jpg), [thử lại](../docs/evidence/parent-head-retested.jpg).

## Thứ tự che khuất

Dự đoán: nếu slot head nằm sau body, phần cổ vốn được đầu che sẽ chồng lên mặt. Chọn slot head trong Draw order, nhấn Minus bốn lần: head xuống dưới body; phần cổ đen và vai hiện đè lên mép dưới mặt. Nhấn Equals bốn lần đưa head trở lại đầu danh sách: ảnh ghép kín như trước.

Drag slot đã không đổi thứ tự trong hai lần thử; phím Minus/Equals hoạt động và kết quả được kiểm tra qua thứ tự Tree cùng ảnh. Xem [hướng dẫn Slots](https://esotericsoftware.com/spine-slots).

Bằng chứng: [trước](../docs/evidence/draw-order-before.jpg), [lỗi](../docs/evidence/draw-order-broken.jpg), [đã sửa](../docs/evidence/draw-order-fixed.jpg).

## Tạo xương bằng công cụ Create

Chọn head, nhấn N, kéo một đoạn ngang bên cạnh đầu. Editor tạo head2 dưới head, dài khoảng 175.45 đơn vị. Double-click tên và đổi thành head-probe. Bằng chứng [xương mới](../docs/evidence/new-bone-head-probe.jpg) cho thấy đường dẫn root → body → head → head-probe. Undo lần đổi tên và lần tạo xương để trả rig về trạng thái trước bài thử. Xương thử chưa gắn ảnh; không coi đây là hoàn thành rig một nhân vật từ đầu.

## Animation editor-breathe tạo từ trống

Tree → Animations → New → Animation → editor-breathe. Chọn body qua breadcrumb để tránh chọn nhầm pelvis nằm gần nhau trên canvas.

Tạo ba key Translate:

| Frame (30 fps) | Thời gian | Body X | Body Y |
| --- | --- | --- | --- |
| 0 | 0 s | 0 | 304 |
| 30 | 1 s | 0 | 296 |
| 60 | 2 s | 0 | 304 |

Key đầu dùng nút chìa khóa cạnh Translate; các key sau nhập giá trị khi Auto Key bật. Ban đầu thử Y=312 tại frame 30 làm chân duỗi hết tầm, nên sửa thành 296 để nhún trong tầm IK. Cần kiểm tra tầm khớp trước khi chỉnh độ êm.

Bật Separate Translate, chọn dấu tròn của Translate Y trong Graph để chỉ xem đường dọc. Dấu tròn chọn đường cần hiển thị, không đơn giản là nút ẩn riêng dòng vừa click. Chọn key 30 và nút Bezier; làm tương tự key 0. Hai đoạn chuyển từ đường thẳng thành đường cong có tiếp tuyến ngang ở các đầu nhịp. [Hướng dẫn Graph](https://esotericsoftware.com/spine-graph).

Bằng chứng: [linear](../docs/evidence/editor-breathe-linear.jpg), [Bezier](../docs/evidence/editor-breathe-bezier.jpg).

Trong Dopesheet, kéo key Translate Y từ frame 30 sang 20: cùng pose Y=296 nhưng đến sớm hơn, nhịp xuống 20 frame/lên 40 frame. Undo để quay về 30/30. Đây là thay thời điểm, khác với đổi pose. [Key chuyển sang 20](../docs/evidence/editor-breathe-retimed-20.jpg), [trả về 30](../docs/evidence/editor-breathe-retimed-restored.jpg).

So sánh [frame 0](../docs/evidence/editor-breathe-loop-0.jpg) với [60](../docs/evidence/editor-breathe-loop-60.jpg): cùng Y=304 và cùng tư thế. Bật playback: [frame 9](../docs/evidence/editor-breathe-playing-9.jpg) và [46](../docs/evidence/editor-breathe-playing-46.jpg) cho thấy timeline và giá trị chuyển động thay đổi. Đã dừng playback sau kiểm tra. Ảnh tĩnh và hình dạng Graph hỗ trợ kiểm tra vòng nối; chưa có video xuất từ editor.

## Phạm vi đạt và còn thiếu

Đã thao tác tạo/đặt tên xương, sửa quan hệ cha con, sửa draw order, tạo animation từ trống, đặt key, tách trục, đổi linear/Bezier và đổi thời điểm bằng Dopesheet. Bài dùng robot thay cho Spineboy vì cho phép so sánh với bài IK đã biết.

Nhịp thở hiện chỉ là nhún body đơn giản; chưa phải animation nhân vật hoàn thiện có nhịp đầu/tay phụ. Các kỹ năng mesh, weights, constraints nâng cao và quy trình lưu/xuất vẫn cần thực hành. Project Trial chưa lưu được; ảnh và hướng dẫn này là bằng chứng có thể giữ lại và dựng lại.
