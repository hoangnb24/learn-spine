# Xem bộ động tác dựng trong Spine

| Động tác | Bản xem | Nguồn và phạm vi |
| --- | --- | --- |
| Đứng nhún | [idle — 2 giây](idle-2s.gif) | 60 tư thế đã chụp ở bài 19, skin orange |
| Vẫy tay | [wave — 2 giây](wave-2s.gif) | 60 tư thế sau khi thêm IK ở bài 19, skin orange |
| Đi tại chỗ | [walk-wide — 1 giây](../evidence/walk-stance/walk-review.gif) | 30 tư thế bản sửa bài 56, skin mint |

Các GIF ghép từ ảnh editor theo 30 tư thế/giây. Chúng giúp xem nhịp dự kiến, không đo tốc độ playback thực và không phải file xuất từ Spine. Bản idle/wave cũ trong evidence được giữ ở tốc độ chậm 80 ms/ảnh; hai bản ở đây dùng tổng thời gian đúng 2 giây. [Thông tin nguồn](sources.json), dựng lại bằng `scripts/build_editor_review.py` từ thư mục gốc.

Các animation vẫn có trong cửa sổ Spine khi kiểm tra ở bài 68; [ảnh kiểm tra mới](../evidence/core-audit/) dùng skin mint. Project hiện chưa được lưu thành `.spine`. Xem [bảng tiêu chí](../../../lessons/068-core-plan-audit.md) để biết phần đã chứng minh và phần còn thiếu.

## Nhận xét từ các tư thế đã lấy mẫu

Ngày 07/09/2026, xem lại ba bảng ảnh 0–59 của mỗi idle/wave và hai bảng 0–30 của walk-wide. Thời gian dưới đây quy đổi từ frame ở 30 FPS, không phải phép đo playback.

| Động tác | Nhận xét và quyết định |
| --- | --- |
| Idle | Thân hạ trong giây đầu rồi nâng trong giây sau. Đầu/tay đổi chiều tại 33–37, trễ thân 3–7 frame (0,10–0,23 giây), tạo chuyển động phụ nhẹ. Các mẫu vẫn giữ bàn chân phẳng; giữ biên độ hiện có. |
| Wave | Nâng tay tới khoảng frame 20 (0,67 giây), hạ nhẹ ở 30 rồi vẫy lên ở 40, sau đó thu tay về 60. Bàn tay tách khỏi thân và mặt, động tác chào đọc được qua chuỗi pose; chưa cần tăng biên độ. |
| Walk-wide | Hai lần nâng chân quanh 7–8 và 22–23 cách nhau nửa giây. Tay có khoảng tách khỏi gối ở các pose nâng chân. Dáng còn thiên về bước tại chỗ của robot; không suy ra dáng đi tiến hoặc độ tự nhiên như người. Giữ bản này cho bài walk tại chỗ. |

Không thấy lỗi hình mới đủ rõ trong các mẫu để biện minh cho việc sửa thêm key. Đây là đánh giá tư thế và phân bố thời gian; chưa chứng minh cảm giác chuyển động liên tục hoặc tốc độ phát thực. Idle/wave là bộ ảnh lịch sử màu cam, không phải kiểm tra đầy đủ phiên bản hiện tại màu mint.


## Đối chiếu bản mint hiện tại — 08/09/2026

Đã kích hoạt đúng từng animation trong editor và chụp 17 tư thế: idle 0/15/30/45/60, wave 0/10/20/30/40/50/60, walk-wide 0/7/15/22/30. [Bảng tư thế có số frame đọc từ timeline](current-mint/poses.jpg). Đây là kiểm tra mới trên màu mint; các bộ ảnh 61/31 tư thế lịch sử vẫn là bằng chứng dày hơn về chuyển động giữa các mốc.

Đã sửa khung xem wave: Fit tại frame 20 còn cắt đầu ngón tay ở frame 10. Fit lại tại frame 10 và kiểm tra bảy mốc cho thấy toàn bộ tay nằm trong Outline. [Trước căn khung](current-mint/wave-10-before-fit.png), [sau căn khung](current-mint/wave-10.png). Không sửa key để xử lý lỗi khung xem.

[So kích thước hiển thị](current-mint/display-sizes.jpg) dùng vùng ảnh chụp cùng kích thước, thu xuống cao 300 và 150 pixel bằng Lanczos; đây là kích thước vùng cắt, nhân vật thấp hơn một chút. Ở cả hai mức, đầu/mắt và tư thế chào vẫn đọc được. Ở mức nhỏ, ngón tay và chi tiết đế chân khó phân biệt hơn; không dùng bản thu nhỏ để kết luận độ kín của mép khớp. Ảnh nguồn đầy đủ được giữ trong current-mint.

Quan sát mới: hai đầu vòng idle/wave/walk tương tự về hình; bàn chân trụ không có thay đổi rõ trong những mẫu đã chọn. Tay vẫy tách khỏi mặt, còn tay ở tư thế nghỉ sát chân là đặc điểm bố cục hiện có. Chưa thấy lỗi pose mới đủ rõ để sửa thêm key. Giữ bộ động tác hiện tại cho bài robot cơ khí ở các biên độ này; không coi đây là phép đo playback hay mọi frame trung gian.

Trạng thái cuối: wave-handbuilt, frame 0, dừng. Skeleton thử nested-robot đã ẩn để trở lại robot chính. Không tạo animation mới trong lần rà này.

## Playback trực tiếp — 08/09/2026

[Bài 82](../../../lessons/082-editor-live-playback.md) bổ sung 90 ảnh chụp khi Play chạy và phép đo timeline không Loop khoảng 29,92 frame/giây. [GIF trực tiếp](playback-timing/walk-live.gif) giữ khoảng thời gian lấy mẫu; điểm GIF khởi động lại nằm giữa vòng. Chu kỳ walk quan sát khoảng 1,06 giây cần phân biệt giữ frame cuối với lỗi key. Phép đo idle/wave được bổ sung ngay dưới đây.

Đã bổ sung chuỗi trực tiếp hiện tại: [idle](playback-timing/core/idle-live.gif), [wave](playback-timing/core/wave-live.gif), mỗi đoạn 120 mẫu khoảng 4,8 giây. Đã xem cả hai qua hơn hai vòng, không thấy bước nhảy hình lớn trong mẫu; giữ key. Chi tiết và giới hạn ở phần bổ sung bài 82.
