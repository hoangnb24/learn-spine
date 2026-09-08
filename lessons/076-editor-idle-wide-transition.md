# Bài 76 — khớp dáng đứng với dáng đi

Đã tạo `idle-wide` từ `idle-handbuilt`, mở hai target chân thêm 20 đơn vị mỗi bên và thử `walk-wide → idle-wide` trong Preview. Đây là chỉnh tư thế đích, chưa phải animation dừng bước hoàn chỉnh.

## Quan sát và cách sửa

Khi chuyển walk-wide về idle-handbuilt, khoảng tách chân thu hẹp. Đã thử từ một tư thế hai chân thấp và một tư thế chân bên phải ảnh đang nhấc. Thử đầu dùng Mix 2 giây; thử sau dùng Mix 5 giây. Hai phép thử chưa đồng bộ frame, không dùng để so sánh định lượng độ trượt.

[Nguồn A](../exercises/robot/evidence/preview-phases/a-before.png), [đích A](../exercises/robot/evidence/preview-phases/a-end.png), [nguồn B](../exercises/robot/evidence/preview-phases/b-source.png), [mẫu cuối B](../exercises/robot/evidence/preview-phases/b-11.png). B có 12 mẫu; [thời gian ghi](../exercises/robot/evidence/preview-phases/b-times.json) tính sau thao tác Speed, không phải thời gian animation chính xác.

[Tài liệu Preview](https://esotericsoftware.com/spine-preview#Mix) xác định Mix là thời gian hòa trộn khi đổi animation. Từ phép thử này, tăng Mix không đủ để tạo ra bước thu chân có nhấc chân khỏi đất.

Duplicate idle-handbuilt thành idle-wide, bật bản sao rồi thêm key Translate cho hai target trực thuộc root tại frame 0:

| Target | X cũ | X mới | Y giữ nguyên |
| --- | ---: | ---: | ---: |
| leg-ik-left | −48,5 | −68,5 | −391,5 |
| leg-ik-right | 47,5 | 67,5 | −391,5 |

Lần đầu animation bị tắt, editor báo `No animation is visible`, không ghi được key. Sau bật, trái trở về −48,5; đã nhập lại và ghi key bản cuối. Không dùng lần nhập chưa key làm bằng chứng hoàn thành.

Đã đọc lại cả hai target tại frame 60, giá trị giữ đúng; xem pose giữa vòng ở frame 30. Giữ các key thân/tay/đầu được sao chép. Bật idle-handbuilt rồi đọc lại trái −48,5/phải 47,5 xác nhận bản gốc còn nguyên tọa độ.

Bằng chứng: [key trái](../exercises/robot/evidence/preview-phases/idle-wide-left-key.png), [key phải](../exercises/robot/evidence/preview-phases/idle-wide-right-key.png), [trái 60](../exercises/robot/evidence/preview-phases/idle-wide-left-60.png), [phải 60](../exercises/robot/evidence/preview-phases/idle-wide-right-60.png), [pose 30](../exercises/robot/evidence/preview-phases/idle-wide-30.png), [trái gốc](../exercises/robot/evidence/preview-phases/original-left-restored.png), [phải gốc](../exercises/robot/evidence/preview-phases/original-right-restored.png).

## Thử lại

Preview track 0: Mix 0 lấy tư thế đầu walk-wide; đổi Mix 5, chuyển idle-wide, Speed 100. Đã xem 10 mẫu cách nhau khoảng nửa giây cộng thời gian chụp. Đích giữ dáng đứng rộng hơn bản gốc. Không thấy khớp rời rõ; chân vẫn dịch trong thời gian hòa trộn. Chưa kết luận hết trượt hoặc Mix 0,25 tối ưu.

[Nguồn](../exercises/robot/evidence/preview-phases/wide-walk-start.png), [đầu](../exercises/robot/evidence/preview-phases/wide-mix-0.png), [giữa](../exercises/robot/evidence/preview-phases/wide-mix-4.png), [cuối](../exercises/robot/evidence/preview-phases/wide-mix-9.png), [thời gian](../exercises/robot/evidence/preview-phases/wide-times.json).

Bước tiếp theo: dựng đoạn dừng với chân trụ rõ, nhấc chân kia thu về rồi đặt xuống; thử cả hai hướng chân trụ. Không tiếp tục tăng Mix để thay thế động tác đó.

Kết thúc: animation chính idle-wide frame 30 dừng; Preview idle-wide, Speed 0, Mix 0,25, track 0; skin helmet. Trial chưa lưu/mở lại project được. Chưa hoàn thành đánh giá chuyển tiếp ở mọi pha chân.
