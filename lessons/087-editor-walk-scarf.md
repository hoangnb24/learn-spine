# 87 — Khăn theo nhịp đi bộ và chuyển từ idle

Đã tạo walk-scarf từ bản sao walk-wide, thêm chuyển động khăn một vòng 30 frame và thử chuyển hai chiều giữa idle-scarf và walk-scarf trong Preview. Khăn có nhịp nhanh hơn idle, đuôi trễ bốn frame so với đoạn giữa. Không sửa key chân/tay hay event nguồn trong lượt này.

## Key và đường cong

Góc Rotate ở hệ Parent, đơn vị độ; các key đều đã nhập và đọc lại trong editor.

| Xương | Frame → góc |
| --- | --- |
| scarf-mid | 0 → 12; 7 → 22; 15 → 12; 22 → 2; 30 → 12 |
| scarf-tip | 0 → −6; 4 → 0; 11 → 14; 19 → 0; 26 → −14; 30 → −6 |

Chọn riêng hàng Rotate, dùng Automatic để làm mềm điểm đổi chiều. Sau đó chọn điểm đầu vòng trong Graph và bật Automatic cho điểm đó: tiếp tuyến đầu/cuối từ ngang đổi sang nghiêng. Không chỉnh event footstep. [Graph mid](../exercises/mesh-lab/scarf/walk-mid-wrap-fixed.png), [Graph tip](../exercises/mesh-lab/scarf/walk-tip-wrap-fixed.png).

Tip đọc tại 29/0/1 là −8,243/−6/−4,423; cực trị 11 = 14 và 26 = −14. Đây là số đo mỗi frame, chưa phải vận tốc liên tục tại đúng mốc vòng.

## Kiểm tra vòng đi

Đã xem các key và mốc 29/0/1 sau chỉnh. Phát 30 FPS, Speed 100%, Loop bật; thu 90 ảnh trong 4,046 giây, xem đủ [0–44](../exercises/mesh-lab/scarf/walk-contact-0.jpg) và [45–89](../exercises/mesh-lab/scarf/walk-contact-45.jpg). Trong vùng cổ/vai Outline, chưa thấy rách mới hoặc bước bật hình lớn qua hơn ba vòng. Khăn bám cổ, đuôi khuất một phần sau vai khi hạ. Không coi vùng bị che là đã kiểm tra được.

## Chuyển từ đứng nghỉ sang đi

Trong Preview, Track 0, Mix 0,25 giây, Repeat bật. Chọn idle-scarf, sau đó walk-scarf. Lượt Speed 100% thu 70 mẫu trong 3,223 giây nhưng ảnh đầu tới sau 0,380 giây: đã qua thời gian Mix, nên lượt này chỉ xác nhận trạng thái sau chuyển và playback, không chứng minh phần hòa trộn. [Lượt tốc độ thường](../exercises/mesh-lab/scarf/walk-transition-contact.jpg).

Làm lại ở Speed 10%, để idle ổn định rồi chọn walk-scarf. Thu 80 mẫu trong 3,5 giây; ảnh đầu ở 0,383 giây. Thời gian hòa trộn dự kiến kéo dài 2,5 giây thực ở tốc độ này, nên chuỗi có phần đang hòa trộn và phần sau đó. Xem đủ [80 ảnh chậm](../exercises/mesh-lab/scarf/walk-slow-contact.jpg): vùng cổ/khăn đổi tư thế dần, không thấy bật về khăn Setup hoặc rách rõ. Khoảng đầu trước mẫu đầu chưa được ghi; đây là kiểm tra mẫu ở một thời điểm chuyển, không bảo đảm mọi pha chuyển hoặc mọi frame.

Cuối lượt đã đặt Speed Preview về 0 rồi đóng Preview. Editor walk-scarf frame 0, dừng, Loop bật, Graph mở, tip được chọn. Các ảnh và thông số nằm trong exercises/mesh-lab/scarf; chưa có project/export mới.

## Chuyển từ đi về đứng nghỉ

Đã cho walk-scarf chạy ở Speed 10%, rồi chọn idle-scarf trên Track 0, Mix 0,25 giây, Repeat bật. Thu 80 ảnh trong 3,631 giây; mẫu đầu ở 0,388 giây. Đã xem đủ [chuỗi chuyển ngược](../exercises/mesh-lab/scarf/reverse-contact.jpg): trong vùng cổ/khăn nhìn thấy, chưa thấy bật về Setup hoặc rách rõ. Chuỗi bao phủ một phần thời gian hòa trộn dự kiến 2,5 giây thực; không bao phủ 0,388 giây đầu và không chứng minh mọi pha chuyển. [Thời điểm từng mẫu](../exercises/mesh-lab/scarf/reverse-times.json).

Đã đặt Speed Preview về 0 rồi đóng Preview. Editor trở lại walk-scarf, frame 0, dừng, Loop bật. Không thay key trong lượt kiểm tra ngược.

Khép bài khăn cơ bản: mesh khác đường viền, weights trên robot, chuyển động phụ trễ ở idle/walk và chuyển tiếp hai chiều đều đã có thực hành. Khăn còn khuất sau vai ở một số tư thế; đây không phải bộ trang phục hoàn chỉnh cho mọi động tác. Không cần lặp cùng phép chuyển nếu chưa có lỗi mới. Phần tiếp theo của bảng phạm vi là giảm độ phân giải ảnh mesh nhưng giữ kích thước và biến dạng; kết quả trên region ở bài 81 chưa đủ cho mesh.
