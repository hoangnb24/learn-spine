# Bài 21 — đánh dấu bước chân và gắn âm thanh

Đã thêm hai key `footstep` vào `march-handbuilt` trong Spine 4.3.25 Trial. Event là dấu mốc để báo một hành động xảy ra; ở bài này là lúc chân hạ xuống đất.

| Frame | String của key | Thời gian tại 30 FPS |
| --- | --- | --- |
| 25 | `left` | khoảng 0,833 giây |
| 55 | `right` | khoảng 1,833 giây |

Đây là một event với hai giá trị String, không phải hai event riêng. Hai mốc cách nhau một giây. Không thêm key ở frame 0.

## Cách dựng đã thực hành

1. Tạo `footstep` trong nhánh Events của Tree.
2. Trong Animate, chọn march, đến frame 25, đặt String `left` rồi key event; làm tương tự frame 55 với `right`.
3. Tạo file [footstep.wav](../exercises/robot/audio/footstep.wav) bằng [script Python](../scripts/create_step_audio.py). Đây là tiếng tác động tự tổng hợp, mono PCM16, 22050 Hz, dài 0,16 giây.
4. Bật Audio trong Tree, đặt thư mục audio của robot. Trong Setup, gán Audio path của event là `footstep.wav`.
5. Mở Audio view, chỉnh khoảng nhìn để thấy cả hai sóng âm. Chọn từng key để đối chiếu String.

Trong lần thử này, chỉ nhập `footstep` khiến Problems báo thiếu file. Đổi thành `footstep.wav` làm lỗi biến mất: [ảnh sau sửa](../exercises/robot/evidence/robot-handbuilt-audio-path-fixed.jpg). Trường Audio path được sửa trong Setup; nhập khi đang Animate không sửa được trường và có thể kích hoạt phím tắt.

## Kiểm tra trong editor

- Playback được đặt Timeline FPS 30, Speed 100%, Interpolated bật: [cài đặt](../exercises/robot/evidence/robot-handbuilt-march-playback-settings.jpg). Đã chạy rồi dừng march ở cấu hình này.
- Hai sóng âm xuất hiện tại 25/55. Ẩn event làm chúng biến mất khỏi Audio view nhưng key Dopesheet vẫn còn; bật lại thì sóng âm trở lại. [Ẩn](../exercises/robot/evidence/robot-handbuilt-audio-hidden.jpg), [bật lại](../exercises/robot/evidence/robot-handbuilt-audio-restored55.jpg).
- Khi playback đi qua mốc, nhãn `footstep` xuất hiện trên nhân vật: [ảnh đang phát](../exercises/robot/evidence/robot-handbuilt-audio-playing.jpg).
- Cuối buổi đã kiểm tra lại tư thế và String: [25 = left](../exercises/robot/evidence/robot-handbuilt-audio-final25.jpg), [55 = right](../exercises/robot/evidence/robot-handbuilt-audio-final55.jpg). Cửa sổ dừng ở frame 55.

Khi rà lại, nhập số nhầm vào nhãn Current thay vì ô số đã xóa event bằng Backspace. Nút Undo trên thanh công cụ khôi phục event, cả hai key và sóng âm; hai ảnh cuối ở trên được chụp sau khôi phục. Cần xác nhận ô số có focus trước khi xóa nội dung.

Chọn một dòng trong Audio view có lúc đổi vạch thời gian nhưng hình nhân vật còn giữ tư thế trước đó. Đã chuyển qua frame 24 rồi nhập lại 25 bằng ô số để hình cập nhật; không dùng ảnh chọn dòng đơn thuần để kết luận tư thế tiếp xúc.

## Giới hạn và bước tiếp

Đã xác nhận file được nhận, sóng âm và event kích hoạt trong giao diện. Chưa nghe trực tiếp hoặc ghi lại đầu ra âm thanh nên chưa kết luận tiếng phát đúng, không méo hay đồng bộ cảm nhận tốt. Ảnh playback cũng chưa đủ đánh giá chất lượng nhịp như video liên tục.

Trong ứng dụng dùng Spine Runtime, phần nhận event cần tự xử lý phát âm thanh; việc thấy sóng âm trong editor chưa kiểm tra phần tích hợp đó. Bản Trial chưa lưu được project để mở lại.

Tham khảo chính thức: [Events](https://esotericsoftware.com/spine-events), [Audio view](https://en.esotericsoftware.com/spine-audio-view). Các ảnh và kết quả nêu trên là quan sát của bài thực hành, không phải kết quả suy ra từ tài liệu.
