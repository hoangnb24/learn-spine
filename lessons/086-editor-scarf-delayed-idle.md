# 86 — Chuyển động trễ cho khăn khi đứng nghỉ

Đã nhân bản `idle-handbuilt` thành `idle-scarf`, thêm key Rotate cho scarf-mid và scarf-tip. Khăn có nhịp uốn riêng trên robot; phần đuôi đạt cực trị sau đoạn giữa tám frame. Đã làm mềm đường cong ở các điểm đổi hướng; đã sửa tiếp tuyến ở mốc nối vòng và kiểm tra playback cuối, xem phần cuối bài.

## Các key đã nhập và đọc lại

Góc hiển thị ở hệ Parent, đơn vị độ. Chỉ đặt key hai xương khăn trên bản sao animation.

| Xương | Frame → góc |
| --- | --- |
| scarf-mid | 0 → 12; 15 → 20; 30 → 12; 45 → 4; 60 → 12 |
| scarf-tip | 0 → −6,4; 8 → 0; 23 → 12; 38 → 0; 53 → −12; 60 → −6,4 |

Ảnh từng key nằm trong `exercises/mesh-lab/scarf/mid-key*.png` và `tip-key*.png`. Góc tip ở 0/60 được chọn để tiếp nối đoạn tuyến tính từ frame 53 sang frame 8 của vòng sau: tăng 0,8° mỗi frame. Mid tăng khoảng 0,533° mỗi frame ở hai phía mốc vòng. Đây là cấu hình key, chưa phải kết luận về chất lượng đường cong toàn vòng.

## Kiểm tra tư thế và phát thật

Đã xem riêng các frame 0, 8, 15, 23, 30, 38, 45, 53, 60. Đuôi chẻ giữ hình; khi khăn hạ xuống, vai che một phần mép dưới. Chưa thấy rách ở phần đang nhìn được; không suy rộng cho phần bị che.

Phát Loop, 30 FPS, Speed 100%, Interpolated bật; thu 130 ảnh trong 5,609 giây rồi dừng và trả frame 0. Đã xem đủ hai bảng ảnh [0–64](../exercises/mesh-lab/scarf/cloth-contact-0.jpg) và [65–129](../exercises/mesh-lab/scarf/cloth-contact-65.jpg). Qua hơn hai vòng, chưa thấy bước nhảy hình lớn hoặc rách mới; chuyển hướng vẫn cần đánh giá độ mềm.

## Đối chiếu đầu/cuối

Lượt ảnh đầu chưa trùng toàn bộ robot. Chụp lại 60 rồi 0 ở cùng khung nhìn: vùng khăn trong Outline `(800,215)–(945,290)` trùng pixel RGB; vùng robot rộng hơn còn khác ở nửa dưới. Vùng chính có đường xương/điểm chọn nên cũng không trùng toàn ảnh. [Số liệu đối chiếu](../exercises/mesh-lab/scarf/cloth-loop-check.json), [frame 0](../exercises/mesh-lab/scarf/cloth-loop-repeat0.png), [frame 60](../exercises/mesh-lab/scarf/cloth-loop-repeat60.png).

Vì vậy có bằng chứng khăn trở lại cùng hình ở mốc vòng trong Outline, nhưng chưa kết luận toàn animation nối chính xác. Bước tiếp theo: đối chứng phần thân/chân với idle-handbuilt, xác định khác biệt có từ bản nguồn hay do trạng thái editor, rồi mới sửa key có liên quan. Không lặp Bind hoặc tạo lại 11 key khăn đã có.

Hiện editor ở idle-scarf, frame 0, dừng, chỉ robot hiện, scarf-tip được chọn. Bài này có ảnh và thông số tái tạo; chưa có project/export mới.

## Bổ sung — đối chứng nguồn và làm mềm cực trị

Phần thân dưới của idle-handbuilt và idle-scarf trùng pixel khi so cùng frame 0 hoặc cùng frame 60. Sai khác giữa 0/60 đã tồn tại ở nguồn: kênh RGB lệch tối đa 13/255, trung bình mỗi kênh dưới 0,42/255 trong vùng `(780,310)–(950,489)`. Hai ảnh phóng lớn chưa cho thấy chân dịch vị trí rõ. [Kết quả đối chứng](../exercises/mesh-lab/scarf/cloth-source-comparison.json). Chưa xác định đây là sai khác nội suy, hiển thị hay dữ liệu; không sửa key chân dựa riêng vào khác biệt pixel nhỏ này. Kênh scarf-tip ở nguồn không có key Rotate.

Trong Graph của idle-scarf, chọn riêng toàn bộ Rotate của mid rồi tip, áp dụng Automatic. Đường tuyến tính đã chuyển sang Bézier, tay nắm tại cực trị nằm ngang; tay nắm giữa nhịp nghiêng theo chiều đi. Cách hoạt động của Automatic và nhận dạng tay nắm tam giác được đối chiếu với [Graph — Spine User Guide](https://esotericsoftware.com/spine-graph#Presets). [Mid sau đổi](../exercises/mesh-lab/scarf/cloth-mid-automatic.png), [tip sau đổi](../exercises/mesh-lab/scarf/cloth-tip-automatic.png).

Đọc số từ editor sau đổi:

| Xương | Ba frame sát cực trị | Góc đọc được | Đổi góc mỗi bước sát đỉnh |
| --- | --- | --- | --- |
| mid | 14, 15, 16 | 19,9; 20; 19,9 | khoảng 0,1°, trước Linear khoảng 0,533° |
| tip | 22, 23, 24 | 11,848; 12; 11,848 | khoảng 0,152°, trước Linear 0,8° |

Đỉnh vẫn ở frame 15 và 23; độ trễ tám frame giữ nguyên. Đây là bằng chứng giảm tốc gần điểm đổi chiều, chưa thay cho đánh giá playback mới.

**Điểm còn phải sửa:** tip ở 59/0/1 đọc −6,74/−6,4/−6,194; Graph cho thấy tiếp tuyến đầu/cuối đang nằm ngang, tạo giảm tốc phụ tại mốc vòng. Lượt kéo tay nắm chưa thay đổi đường; thử phím Up tác động vào tư thế xương chưa đặt key, đã đổi frame để trả lại −6,4 tại 0 (nút key đỏ). Không giữ thay đổi tư thế thử đó. Cần chỉnh tay nắm đầu/cuối trong Curves hoặc Graph có vùng thao tác lớn hơn, rồi mới kiểm tra playback và khép bài. Không áp dụng lại Automatic cho cả kênh sau khi sửa tay nắm riêng.

Cuối lượt: idle-scarf frame 0, dừng, mid được chọn; Graph mở. Chưa có project/export mới.

## Kiểm tra cuối — bỏ giảm tốc thừa ở mốc vòng

Chọn riêng key Rotate frame 0 của tip trong Dopesheet rồi bật Automatic cho điểm này khi toàn kênh đã là Bézier. Hai tay nắm ở mốc vòng đổi từ nằm ngang sang nghiêng; Curves của đoạn 0→8 thành đường thẳng. Đây là thay đổi đã quan sát được, không kết luận thứ tự chuyển loại đường cong là nguyên nhân chắc chắn của trạng thái cũ. Lượt kéo tay nắm trong Curves trước đó không có hiệu quả rõ, không tính là thao tác sửa thành công. [Ảnh sau sửa](../exercises/mesh-lab/scarf/wrap-auto-endpoint-refresh.png).

| Frame | 58 | 59 | 60/0 | 1 | 2 |
| --- | --- | --- | --- | --- | --- |
| Góc tip | −8,328 | −7,306 | −6,4 | −5,6 | −4,8 |

Mỗi bước sát mốc nay tăng khoảng 0,906° rồi 0,8°, thay cho 0,34° rồi 0,206° ở bản chậm thừa. Chưa đo đạo hàm tại thời điểm liên tục; không gọi số chênh frame này là vận tốc chính xác ngay mốc. Các frame 22/23/24 vẫn là 11,848/12/11,848: giữ được giảm tốc ở cực trị sau sửa đầu vòng.

Đã phát Loop ở 30 FPS, Speed 100%, thu 130 ảnh trong 5,718 giây; xem đủ [mẫu 0–64](../exercises/mesh-lab/scarf/wrap-contact-0.jpg) và [65–129](../exercises/mesh-lab/scarf/wrap-contact-65.jpg). Vùng cổ/vai trong Outline không thấy rách mới hay bước bật hình lớn qua hơn hai vòng. Đuôi vẫn bị vai che một phần khi hạ xuống; kết luận chỉ áp dụng cho phần nhìn thấy ở cỡ hiển thị này.

Khép bài chuyển động khăn khi idle: đã có mesh gắn robot, phân bố weights, chuyển động trễ, đường cong mềm và lượt kiểm tra sau sửa. Chưa suy rộng kết quả sang walk/wave hay chuyển tiếp giữa animation. Đích tiếp theo là cho khăn hoạt động trong bộ động tác robot, ưu tiên thử chuyển idle-scarf sang walk trước khi làm thêm trang phục. Editor hiện idle-scarf, frame 0, dừng; tip chọn, Curves và Graph mở. Chưa có project/export mới.
