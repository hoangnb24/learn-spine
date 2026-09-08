# Bài 77 — dừng bước với chân trái làm trụ

Đã tạo `stop-left-support` từ `walk-wide` trong editor. Đoạn cuối giữ chân trái, cho chân phải hoàn tất bước rồi giữ tư thế sau frame 30. Đây là một đoạn dừng bắt đầu ở đầu chu kỳ đi; chưa xử lý yêu cầu dừng tại pha bất kỳ.

## Thay đổi

Duplicate toàn bộ walk-wide rồi sửa key X của hai target tại frame 30: trái từ −68,5 thành −34,5; phải từ 67,5 thành 71,5. Giữ Y −391,5 và các key còn lại. Tắt Loop cho bản dừng. Không sửa key bản gốc.

Việc giữ nguyên phần đầu chu kỳ nghĩa là robot vẫn thực hiện bước trước khi đi vào đoạn chân trái trụ. Không gọi đây là phản ứng dừng tức thời.

## Kiểm tra chân thật sau IK

Đọc tọa độ World của xương bàn chân, thay vì chỉ đọc target điều khiển. Đơn vị là đơn vị tọa độ editor.

| Xương | Frame | X | Y | Quan sát |
| --- | --- | ---: | ---: | --- |
| foot-left | 13, 18, 23, 28, 30, 45 | −34,5 | −391,5 | Các mẫu giữ cùng điểm trụ |
| foot-right | 18 | 31,5 | −391,5 | Trên mặt đất |
| foot-right | 23 | 51,5 | −343,5 | Nhấc cao 48 |
| foot-right | 28, 29, 30, 45 | 71,5 | −391,5 | Đã đặt xuống và giữ vị trí |

Góc bàn chân đọc được là 0; scale trái 1/1, phải −1/1. Các mẫu hình đã xem không thấy khớp gối rời rõ. Đây là bằng chứng ở các frame lấy mẫu, không chứng minh toàn bộ khoảng liên tục không trượt.

Bằng chứng: [trái 13](../exercises/robot/evidence/stop-left-support/foot-left-13.png), [trái 23](../exercises/robot/evidence/stop-left-support/foot-left-23.png), [trái 45](../exercises/robot/evidence/stop-left-support/foot-left-45.png), [phải 18](../exercises/robot/evidence/stop-left-support/foot-right-18.png), [phải 23](../exercises/robot/evidence/stop-left-support/foot-right-23.png), [phải 28](../exercises/robot/evidence/stop-left-support/foot-right-28.png), [phải 45](../exercises/robot/evidence/stop-left-support/foot-right-45.png). Các frame còn lại nằm cùng thư mục. Một số ảnh cực trị cắt đầu ngón tay ở mép Outline; không dùng chúng để kết luận toàn thân không va chạm.

## Phát và đối chiếu bản gốc

Đã phát từ frame 0 với Loop tắt. Timeline tiếp tục chạy sau key cuối trong khi tư thế được giữ; tắt Loop không có nghĩa nút Play tự dừng tại frame 30. Ảnh `playback-ended.png` được chụp ở frame 59 khi Play còn chạy, tên ảnh không phải kết luận playback đã dừng. Sau đó đã dừng thủ công.

Bật lại walk-wide: frame 30 chân trái vẫn −68,5/−391,5, chân phải vẫn 67,5/−391,5; xác nhận các tọa độ gốc không bị sửa. [Trái gốc](../exercises/robot/evidence/stop-left-support/original-walk-30-left.png), [phải gốc](../exercises/robot/evidence/stop-left-support/original-walk-30-right.png), [pose đầu gốc](../exercises/robot/evidence/stop-left-support/original-walk-0.png).

Kết thúc đã bật lại đúng stop-left-support, frame 30, Play dừng, Loop tắt, skin helmet. [Trạng thái cuối](../exercises/robot/evidence/stop-left-support/final.png). Khi chọn animation bằng tìm kiếm, cần kiểm tra chấm đang bật: chọn hàng không đồng nghĩa kích hoạt animation, và vị trí hàng có thể thay đổi sau khi cây cuộn.

## Giới hạn và bước tiếp

Tư thế cuối có X hai chân −34,5 và 71,5, khác idle-wide (−68,5 và 67,5). Chuyển thẳng sang idle-wide vẫn có thể kéo chân; cần một idle khớp tư thế cuối hoặc thêm bước điều chỉnh có nhấc chân. Còn bản dừng với chân phải trụ và chọn đoạn theo pha đi hiện tại. Chưa xác nhận chuyển tiếp trong runtime; project vẫn ở phiên Trial chưa lưu được.


## Bổ sung — idle khớp điểm đặt chân

Đã duplicate idle-wide thành `idle-after-stop-left`. Key hai target ở frame 0: trái X −34,5, phải X 71,5, cùng Y −391,5. Ban đầu chỉ đổi target chưa đủ: foot-right thực tế tại frame 0 là 71,299/−389,81, cao hơn target 1,69. Hình chân duỗi thẳng và việc hạ thân sửa được sai lệch phù hợp với chẩn đoán target nằm ngoài tầm với của chuỗi IK ở tư thế cao.

Sửa body Y ở 0/30/60 từ 2,5/−9,5/2,5 thành −9,5/−15,5/−9,5; giữ X −0,5. Nhịp lên xuống giảm từ 12 còn 6 đơn vị. Không hạ riêng pelvis vì cần thân và hông đi cùng nhau.

Sau sửa, đọc World của từng bàn chân tại 0/15/30/45/60: trái luôn −34,5/−391,5, phải luôn 71,5/−391,5; góc 0 và scale trái 1/1, phải −1/1. Đã xem mười ảnh mẫu. [Lỗi trước sửa](../exercises/robot/evidence/idle-after-stop/right-before-0.png), [body mới](../exercises/robot/evidence/idle-after-stop/body-0.png), [trái giữa vòng](../exercises/robot/evidence/idle-after-stop/left-30.png), [phải cuối vòng](../exercises/robot/evidence/idle-after-stop/right-60.png).

Bật stop-left-support frame 30 rồi đổi trực tiếp sang idle-after-stop-left frame 0, giữ nguyên khung Outline. Vùng hai bàn chân trong hai ảnh trùng pixel (hộp 827,670–1004,724); toàn thân không trùng, do đó chưa gọi chuyển tiếp toàn thân liền mạch. Đây là phép đổi trực tiếp hai tư thế, chưa phải phép đo quá trình Mix trong Preview. [Nguồn cuối](../exercises/robot/evidence/idle-after-stop/stop-30.png), [đích đầu](../exercises/robot/evidence/idle-after-stop/idle-0-switch.png), [kết quả so ảnh](../exercises/robot/evidence/idle-after-stop/endpoint-comparison.json).

Bật lại idle-wide frame 0 và đọc body Y 2,5, target trái −68,5, phải 67,5: các giá trị gốc giữ nguyên. [Body gốc](../exercises/robot/evidence/idle-after-stop/original-body-0.png), [trái gốc](../exercises/robot/evidence/idle-after-stop/original-left-0.png), [phải gốc](../exercises/robot/evidence/idle-after-stop/original-right-0.png).

Trạng thái cuối mới: idle-after-stop-left đang bật, frame 30 dừng, skin helmet. [Ảnh cuối](../exercises/robot/evidence/idle-after-stop/final.png). Bước còn lại là hòa trộn thân/tay, kiểm tra quá trình chuyển và làm hướng chân trụ còn lại; vấn đề tọa độ chân đích đã có bản idle riêng xử lý.


## Bổ sung — kiểm tra hòa trộn trong Preview

Đã thử thật `stop-left-support → idle-after-stop-left` ở track 0. Đặt Mix 0, Loop tắt, phát stop ở Speed 100 cho qua key cuối rồi đặt Speed 0 để giữ tư thế cuối. Sau đó đặt Mix 1 giây, chọn idle-after-stop-left trong lúc đứng thời gian, rồi Speed 10 để quan sát chậm.

Đã xem chín mẫu liên tiếp, cách nhau 800 ms cộng thời gian chụp, cùng một mẫu muộn. Thân/tay có thay đổi hình qua các mẫu; không thấy khớp rời rõ ở kích thước Preview khoảng 335 px chiều cao robot. Không suy ra frame chính xác từ thời gian chụp. [Thời gian mẫu](../exercises/robot/evidence/idle-after-stop/preview-mix-times.json).

So với ảnh stop đã giữ cuối, vùng hai bàn chân 522,594–640,626 trùng pixel ở ảnh vừa chọn đích, cả chín mẫu đang chạy và mẫu muộn: 11/11 ảnh, 0 pixel thay đổi trong vùng này. Kết quả hỗ trợ rằng hai bàn chân giữ chỗ trong lượt hòa trộn được lấy mẫu, trong khi phần trên chuyển tư thế. Không chứng minh mọi thời điểm hoặc mọi pha bắt đầu đều đạt.

Bằng chứng: [stop giữ cuối](../exercises/robot/evidence/idle-after-stop/preview-stop-held.png), [đích chưa chạy thời gian](../exercises/robot/evidence/idle-after-stop/preview-mix-frozen.png), [mẫu đầu](../exercises/robot/evidence/idle-after-stop/preview-mix-0.png), [mẫu giữa](../exercises/robot/evidence/idle-after-stop/preview-mix-4.png), [mẫu cuối chuỗi](../exercises/robot/evidence/idle-after-stop/preview-mix-8.png), [mẫu muộn](../exercises/robot/evidence/idle-after-stop/preview-mix-late.png), [so sánh bàn chân](../exercises/robot/evidence/idle-after-stop/preview-feet-comparison.json).

Kết thúc đặt Preview Speed 0, Mix 0,25, Loop tắt và đóng panel; main vẫn idle-after-stop-left frame 30 dừng, skin helmet. Không sửa key trong lượt này. Mix 0,25 là giá trị trả lại, chưa phải giá trị đã được đánh giá ở tốc độ thường. [Trạng thái cuối](../exercises/robot/evidence/idle-after-stop/after-preview-final.png).

Phần nối từ điểm cuối stop sang idle đã có bằng chứng hòa trộn thực tế ở thiết lập trên. Phần học tiếp chuyển sang dừng với chân phải trụ và chọn đoạn dừng theo pha đi, không cần lặp phép thử chân trái này nếu không đổi rig/key.
