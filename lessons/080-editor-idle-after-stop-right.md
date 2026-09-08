# Bài 80 — đứng nghỉ khớp điểm cuối dừng chân phải

Đã tạo `idle-after-stop-right` trong Spine bằng Duplicate `idle-after-stop-left`. Bản mới giữ nhịp thở 60 frame, chỉ sửa key Translate của leg-ik-right tại frame 0: X từ 71,5 về 67,5; Y giữ −391,5. Chân trái giữ X = −34,5.

Đây là thiết lập điểm đặt cho animation nghỉ mới. Không kéo chân của đoạn dừng để ép về tư thế đứng cũ.

## Đọc lại bàn chân thật

Đọc xương foot-left/foot-right ở hệ World tại 0/15/30/45/60:

| Bàn chân | X tại cả năm mốc | Y tại cả năm mốc | Rotation | Scale |
| --- | ---: | ---: | ---: | --- |
| Trái | −34,5 | −391,5 | 0° | 1/1 |
| Phải | 67,5 | −391,5 | 0° | −1/1 |

Thân và đầu thay đổi theo nhịp thở; hai chân tại các mẫu giữ vị trí. [Phải 0](../exercises/robot/evidence/idle-after-stop-right/foot-right-0.png), [phải 30](../exercises/robot/evidence/idle-after-stop-right/foot-right-30.png), [trái 30](../exercises/robot/evidence/idle-after-stop-right/foot-left-30.png), [trái 60](../exercises/robot/evidence/idle-after-stop-right/foot-left-60.png).

## So điểm nối

Bật stop-right-support tại 30, rồi bật idle-after-stop-right tại 0. Vùng hai bàn chân 827,670–1004,724 trùng pixel hoàn toàn. Vùng toàn robot 630,150–1036,735 còn khác 59.621 pixel: thân và tay chưa trùng tư thế. Vì vậy bài này xác nhận điểm đặt chân khớp; **chưa xác nhận chuyển tiếp toàn thân êm**.

[Cuối dừng](../exercises/robot/evidence/idle-after-stop-right/stop-end.png), [đầu đứng nghỉ](../exercises/robot/evidence/idle-after-stop-right/idle-start.png), [báo cáo](../exercises/robot/evidence/idle-after-stop-right/endpoint-comparison.json).

Bật lại idle-after-stop-left và đọc leg-ik-right frame 0: vẫn 71,5/−391,5. Bản gốc còn điểm đặt riêng cho đoạn dừng chân trái. [Đối chứng](../exercises/robot/evidence/idle-after-stop-right/original-left-target-0.png).

## Dùng đúng cặp

| Đoạn dừng | Bản đứng nghỉ | Điểm chân trái / phải |
| --- | --- | --- |
| stop-left-support | idle-after-stop-left | −34,5 / 71,5 |
| stop-right-support | idle-after-stop-right | −34,5 / 67,5 |

Kết thúc bản nghỉ mới đang bật tại frame 0, Play dừng, Loop bật. [Ảnh cuối](../exercises/robot/evidence/idle-after-stop-right/final.png). Vẫn là phiên Trial chưa lưu project được.

## Bổ sung — thử chuyển tiếp trong Preview

Đã chạy đúng cặp `stop-right-support` → `idle-after-stop-right` trên Track 0, Mix 0,25 giây. Cho đoạn stop chạy tới cuối với Mix 0 trước khi chọn idle. Không sửa key trong lần thử này.

Ở Speed 5%, chụp tư thế nguồn đã dừng, ảnh ngay sau khi chọn idle khi Speed còn 0, tám ảnh khi thời gian chạy và một ảnh muộn hơn. Vùng hai bàn chân (522,594–640,626) của cả mười ảnh trùng pixel với nguồn. Vùng thân/tay thay đổi khi thời gian chạy, xác nhận Preview thực sự chuyển tư thế. [Báo cáo chạy chậm](../exercises/robot/evidence/idle-after-stop-right/preview-comparison.json), [mẫu trong lúc chuyển](../exercises/robot/evidence/idle-after-stop-right/preview-mix-3.png).

Lặp lại ở Speed 100%, Mix 0,25. Cả bốn ảnh lấy sau khi chọn idle đều giữ nguyên vùng bàn chân; vùng thân/tay thay đổi. [Báo cáo tốc độ thường](../exercises/robot/evidence/idle-after-stop-right/normal-comparison.json), [mẫu](../exercises/robot/evidence/idle-after-stop-right/normal-mix-0.png).

Kết luận: đã thử chuyển tiếp thực tế trong Preview và không thấy trượt chân ở các ảnh lấy mẫu. Các ảnh tốc độ thường không có thời điểm chụp chính xác và không phủ từng frame của 0,25 giây; chưa dùng chúng để kết luận toàn bộ chuyển động hay vận tốc nối hoàn toàn êm. Phần kiểm tra điểm cuối ở trên là bước trước khi thử Preview.

Đã dừng Preview, đóng panel và trả về idle-after-stop-right frame 0, Loop bật, Play dừng. [Trạng thái cuối](../exercises/robot/evidence/idle-after-stop-right/after-preview-final.png). Tiếp theo rà nhịp của bộ động tác hoàn chỉnh; không cần nhân bản thêm idle cùng điểm đặt.
