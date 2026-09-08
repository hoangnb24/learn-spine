# Bài 79 — chọn điểm vào đoạn dừng theo tư thế

Với bản `stop-right-support` hiện tại, mốc vào đã kiểm chứng là **walk-wide frame 0 → stop-right-support frame 0**. Cùng số frame 8 hoặc 13 không khớp chân trụ, vì bản đi dịch bàn chân trong khi bản dừng giữ bàn chân cố định.

## Phép đối chiếu trong editor

Bật từng animation bằng chấm bên trái Tree, dừng phát và đọc foot-right trong hệ World. Không chỉnh key trong bài này.

| Frame | X chân phải ở walk-wide | X chân phải ở stop-right-support | Chênh lệch |
| --- | ---: | ---: | ---: |
| 0 | 67,5 | 67,5 | 0 |
| 8 | 51,5 | 67,5 | 16 |
| 13 | 41,5 | 67,5 | 26 |

Y cả ba mẫu là −391,5. Vì vậy chuyển walk8 → stop8 vẫn kéo chân ngang 16 đơn vị, dù thời gian hai animation bằng nhau. Không dùng thao tác giữ cùng playhead làm bảo đảm khớp tư thế.

Ảnh [walk 8](../exercises/robot/evidence/stop-phase-entry/walk-8.png) và [stop 8](../exercises/robot/evidence/stop-phase-entry/stop-8.png) thể hiện khác biệt này. Ảnh dùng Outline cố định; phần ngón tay ở pose 8 sát mép, không dùng để kết luận va chạm toàn thân.

So vùng Outline 630,150–1036,735 bằng pixel: cặp frame 0 trùng hoàn toàn; cặp 8 khác 17.419 pixel, cặp 13 khác 18.457 pixel. Số pixel chỉ giúp đối chiếu ảnh, không thay cho số đo bàn chân. [Báo cáo](../exercises/robot/evidence/stop-phase-entry/comparison.json).

## Thực hiện lại mốc vào

1. Bật walk-wide và đặt frame 0 khi dừng phát.
2. Bật stop-right-support khi playhead vẫn ở 0.
3. Hai ảnh trước/sau lại trùng toàn vùng Outline, 0 pixel khác: [trước](../exercises/robot/evidence/stop-phase-entry/gate-walk-0.png), [sau](../exercises/robot/evidence/stop-phase-entry/gate-stop-0.png), [đối chiếu](../exercises/robot/evidence/stop-phase-entry/gate-comparison.json).
4. Phát đoạn dừng với Loop tắt. Có mẫu đang nhấc chân tại frame 9 và mẫu giữ tư thế cuối khi Timeline đã qua key cuối. Sau đó chủ động dừng phát và trả frame 30. [Đang phát](../exercises/robot/evidence/stop-phase-entry/stop-playing.png), [giữ tư thế](../exercises/robot/evidence/stop-phase-entry/stop-held-after-play.png), [kết thúc](../exercises/robot/evidence/stop-phase-entry/final.png).

Đây là phép chuyển bằng tay giữa các pose khi editor đang dừng, rồi phát bản dừng. Chưa phải bộ điều khiển tự chờ đúng pha trong runtime, cũng chưa chứng minh vận tốc qua điểm chuyển êm: trùng tư thế mới chỉ loại bước nhảy vị trí tại mốc vào.

## Quy tắc sử dụng bản dừng hiện tại

Nếu yêu cầu dừng xuất hiện giữa vòng đi, ghi nhận yêu cầu và chờ đầu vòng kế tiếp rồi bắt đầu stop-right-support ở frame 0. Với vòng dài một giây, thời gian chờ có thể gần một giây. Quy tắc này khớp điểm vào đã thử nhưng phản hồi chậm; muốn dừng ngay ở pha khác cần dựng đoạn dừng có điểm đặt chân tương ứng và kiểm chứng lại. Không chỉ tăng thời gian Mix để che việc chân đang bị kéo.

Chưa triển khai quy tắc chờ tự động trong runtime vì đây là rig đang làm trong Trial, chưa có dữ liệu xuất. Đoạn nối từ stop-right-support sang idle còn phải khớp chân phải 67,5; idle-after-stop-left đang ở 71,5 nên không tự dùng thay.

Bài học chính: **pha chuyển phải gắn với tư thế và vị trí chân, không chỉ số frame hoặc tên animation**. Bằng chứng này đủ chọn mốc vào cho bản dừng hiện tại; các pha khác và độ êm động học vẫn là phạm vi tiếp theo.
