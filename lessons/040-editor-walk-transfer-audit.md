# Bài 40 — kiểm tra bản walk sau sao chép và sửa dáng

Đã kiểm tra lại event, thông số audio và 62 mẫu bàn chân của `walk-in-place` sau các bài 37–39. Các mẫu X khớp bản walk gốc sau khi bù quãng root đã bỏ, với sai khác hiển thị tối đa dưới 0,002 đơn vị. Không sửa key trong lượt kiểm tra này.

## Hai event vẫn đúng nội dung

Trong Dopesheet, chọn trực tiếp từng key `footstep` để đọc giá trị riêng của key. Chỉ chọn tên event trong Tree ở frame không có key sẽ thấy giá trị mặc định và dễ kết luận nhầm String bị mất.

| Frame | String | Integer / Float | Audio path | Volume / Balance |
| --- | --- | --- | --- | --- |
| 13 | left | 0 / 0 | footstep.wav | 100 / 0 |
| 28 | right | 0 / 0 | footstep.wav | 100 / 0 |

Ảnh [key 13](../exercises/robot/evidence/walk-transfer-audit/event13.jpg), [key 28](../exercises/robot/evidence/walk-transfer-audit/event28.jpg), [audio 13](../exercises/robot/evidence/walk-transfer-audit/audio13.jpg), [audio 28](../exercises/robot/evidence/walk-transfer-audit/audio28.jpg). Hai key ứng với lúc chân tương ứng trở lại độ cao đặt chân. Chưa nghe trực tiếp âm thanh từ editor; thông số đúng không tự chứng minh đầu ra âm thanh.

## Đo bàn chân thực, không chỉ target

Chọn `foot-left`, bật World axes và chụp từng frame 0–30; lặp lại với `foot-right`. Đã đọc cả [bảng trái](../exercises/robot/evidence/walk-transfer-audit/left-values.jpg) và [bảng phải](../exercises/robot/evidence/walk-transfer-audit/right-values.jpg). Số chép lại và kết quả tính nằm trong [review.json](../exercises/robot/evidence/walk-transfer-audit/review.json).

Bài 27 đo bản có root tiến 2 đơn vị/frame. Bản tại chỗ bỏ chuyển động root, nên phép so sánh đúng là:

`X mới tại frame f + 2 × f` so với `X gốc tại frame f`.

So sánh đủ 31 mẫu mỗi chân với bảng bài 27:

| Chân | Sai khác X lớn nhất sau bù root |
| --- | --- |
| Trái | 0,0004 đơn vị |
| Phải | 0,0019 đơn vị |

Số này trong phạm vi làm tròn của các lần đọc giao diện; không phải phép so sánh dữ liệu export chính xác. Nó chứng minh quỹ đạo ngang đã được giữ ở các frame nguyên đã đo, không chứng minh mọi frame lẻ hoặc tay nắm đường cong giống tuyệt đối.

Ở tất cả mẫu trụ, Y = −391,5 và góc bàn chân = 0°. X giảm đều 2 đơn vị mỗi frame trong các khoảng: trái 0–3 và 13–30, phải 0–18 và 28–30. Góc bàn chân còn bằng 0° ở toàn bộ mẫu vung; đỉnh nhấc Y = −343,5 tại 8 và 23.

Đây là chân đi lùi tương đối với màn hình của animation tại chỗ. Muốn chân giữ vị trí trong thế giới game thì chuyển động nhân vật bên ngoài cần bù tương ứng; chưa nối bản editor này vào runtime.

## Phần còn thiếu sau rà kế hoạch

Rig cơ bản, bộ động tác, sửa mesh/IK và nhiều vòng sửa dáng đã có bằng chứng. Lượt này khép phần nghi ngờ về event và quỹ đạo chân sau sao chép. Còn đánh giá cảm giác nhịp toàn thân bằng quan sát liên tục, kiểm tra các frame lẻ khi cần, và lưu/xuất/mở lại project bằng bản Spine hỗ trợ.

Phạm vi mở rộng vẫn còn các bài riêng như quay đầu khi đi theo Path, skin constraints, import PSD và chuyển tiếp animation liên tục. Không coi các phép đo walk này là hoàn thành toàn bộ kế hoạch. Editor được trả về `walk-in-place`, frame 0.
