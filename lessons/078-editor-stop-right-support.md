# Bài 78 — dừng với chân phải làm trụ

Đã tạo `stop-right-support` từ walk-wide. Các key chân phải dùng cùng điểm đặt; chân trái hoàn tất bước tại frame 13. Lỗi lệch giữa key tại frame 26 đã được sửa bằng Linear ở hai key X (xem bổ sung cuối bài). Tư thế đầu trùng ảnh walk-wide frame 0. Đây là biến thể bắt đầu ở đầu vòng, chưa phải cơ chế chọn đoạn theo pha đi bất kỳ.

## Key đã sửa

Duplicate walk-wide, đổi tên, sửa các kênh Translate đã tách X/Y:

| Target / kênh | Frame | Giá trị mới |
| --- | --- | --- |
| leg-ik-right X | 18, 23, 28 | 67,5 (khớp X tại 0/30) |
| leg-ik-right Y | 23 | −391,5 (bỏ lần nhấc chân phải) |
| leg-ik-left X | 30 | −34,5 (khớp điểm đặt tại 13) |

Tắt Loop bản dừng. Ban đầu giữ key thân/tay từ bản sao. Phần bổ sung bên dưới đã chỉnh nhịp thân và tay ở nửa sau.

## Đọc lại bàn chân thật

Đọc World của các xương bàn chân sau IK, không chỉ target. Các mẫu đã xem:

| Bàn chân | Frame | X | Y |
| --- | --- | ---: | ---: |
| Phải | 0, 8, 13, 18, 23, 30 | 67,5 | −391,5 |
| Trái | 3 | −74,5 | −391,5 |
| Trái | 8 | −54,5 | −343,5 |
| Trái | 13, 23, 30 | −34,5 | −391,5 |

Góc bàn chân là 0; scale phải −1/1, trái 1/1. Trái nhấc 48 đơn vị tại 8 rồi đặt xuống tại 13. Đoạn 0–3 của chân trái vẫn dịch trên đất theo bản đi gốc; chỉ chân phải được giữ làm trụ toàn đoạn. Không suy rộng các mẫu thành chứng minh liên tục không trượt.

[Phải 0](../exercises/robot/evidence/stop-right-support/right-0.png), [phải 8](../exercises/robot/evidence/stop-right-support/right-8.png), [phải 23](../exercises/robot/evidence/stop-right-support/right-23.png), [trái 3](../exercises/robot/evidence/stop-right-support/left-3.png), [trái 8](../exercises/robot/evidence/stop-right-support/left-8.png), [trái 13](../exercises/robot/evidence/stop-right-support/left-13.png), [trái 30](../exercises/robot/evidence/stop-right-support/left-30.png). Một số tư thế cắt ngón tay ở mép Outline, không dùng để kết luận toàn thân không va chạm.

## Sửa event cho đúng động tác

Bản sao có hai key footstep 13/28 từ vòng đi. Chân phải không còn nhấc/đặt tại 28, nên đã chọn và xóa riêng key event 28 trong Dopesheet; giữ key 13. Không xóa định nghĩa event trong Tree. [Trước](../exercises/robot/evidence/stop-right-support/event-right-before.png), [sau xóa 28](../exercises/robot/evidence/stop-right-support/event-right-removed.png), [key 13 còn lại](../exercises/robot/evidence/stop-right-support/event-left-kept.png). Chưa nghe đối chiếu âm thanh.

Bật lại walk-wide: trái 30 vẫn −68,5/−391,5, phải 23 vẫn 51,5/−343,5. Chọn footstep trên bản gốc và đồng bộ Dopesheet: Timeline vẫn có hai mốc 13/28. [Trái gốc](../exercises/robot/evidence/stop-right-support/original-left-30.png), [phải gốc](../exercises/robot/evidence/stop-right-support/original-right-23.png), [hai mốc event gốc](../exercises/robot/evidence/stop-right-support/original-events.png). Lượt này không đọc lại String của từng event.

Vùng Outline 630,150–1036,735 của stop-right-support frame 0 và walk-wide frame 0 trùng pixel, 0 pixel khác. [Bản dừng đầu](../exercises/robot/evidence/stop-right-support/start.png), [walk đầu](../exercises/robot/evidence/stop-right-support/original-0.png), [so sánh](../exercises/robot/evidence/stop-right-support/start-comparison.json).

## Trạng thái và bước tiếp

Kết thúc stop-right-support đang bật, frame 30 dừng, Loop tắt, helmet; Dopesheet đóng. [Ảnh cuối](../exercises/robot/evidence/stop-right-support/final.png). Project vẫn trong phiên Trial chưa lưu được.

Điểm cuối hai chân là −34,5 và 67,5; khác idle-after-stop-left ở chân phải (71,5). Cần tư thế nghỉ khớp điểm này hoặc chuẩn hóa đích bằng một bước có nhấc chân; không đổi thẳng target gây kéo chân. Hai biến thể hiện cùng khởi đầu ở walk frame 0, nên chưa thể gọi là xử lý dừng theo pha. Bước tiếp theo cần xác định pha vào, nhịp thân/tay và đoạn nối tương ứng, tránh chỉ nhân bản thêm animation cùng điểm vào.


## Bổ sung — đưa thân và tay về nghỉ, kiểm tra giữa key

Đã sửa trực tiếp stop-right-support trong phiên Trial:

| Xương, hệ Parent | Frame | Giá trị mới |
| --- | --- | --- |
| upper-arm-right Rotation | 23 | 5° |
| forearm-right Rotation | 23 | 0° |
| upper-arm-left Rotation | 23 | −5° |
| body Translate X/Y | 23 | −0,5 / −9,5 |
| body Translate X | 18, 28 | −0,5 |

Body tại 17/20/26 đều đọc −0,5/−9,5; các ảnh cho thấy hai tay đã về cạnh thân. Không sửa head. [Body 20](../exercises/robot/evidence/stop-right-support/settle-body-20.png), [tư thế 23](../exercises/robot/evidence/stop-right-support/settle-body-23.png), [cuối](../exercises/robot/evidence/stop-right-support/settle-final.png).

Đọc lại bàn chân thật World: phải ở 18/23/28/30 đều 67,5/−391,5; trái ở 18/23/26/28 đều −34,5/−391,5. Tuy nhiên **phải tại 26 là 71,749/−391,5**, lệch 4,249 đơn vị. Target leg-ik-right tại 26 cũng là 71,749: đây là chuyển động của target giữa các key, không phải chân không với tới target. [Target 26](../exercises/robot/evidence/stop-right-support/settle-ik-right-26.png). Ảnh tên settle-target-right-26 thực tế vẫn đang đọc foot-right do tìm sai tên; không dùng ảnh đó làm bằng chứng target.

Chưa sửa đường cong trong lượt bổ sung này. Đã mở Graph để quan sát rồi trở lại Timeline; không xác nhận thao tác chọn nhiều key nên chưa áp dụng Linear. Ưu tiên tiếp theo là làm phẳng đường X của chân trụ, đo thêm khung hình giữa key và Y, rồi mới chuyển sang nối đoạn dừng theo pha. Kết quả cũ ở các key vẫn đúng nhưng không đủ để kết luận chân trụ đứng yên cả đoạn.

Kết thúc ở stop-right-support frame 30, Play dừng, Loop tắt; Timeline đang mở rộng. Các chỉnh sửa vẫn nằm trong phiên Trial chưa lưu được.


## Bổ sung — đã sửa đường cong chân trụ

Trong Graph, chọn riêng key Translate X của leg-ik-right tại 23 rồi đổi Bézier sang Linear; làm tương tự tại 18. Key 28 đã là Linear. Không đổi giá trị hoặc thời điểm key. Hai key liền nhau cùng X = 67,5 nay nối bằng đoạn ngang, bỏ phần cong làm chân đi quá điểm đặt. Cách đổi loại đường cong dựa trên [Graph — Spine User Guide](https://us.esotericsoftware.com/spine-graph).

[Key 23 đã Linear](../exercises/robot/evidence/stop-right-support/curve-right-x23-linear.png), [đường X sau sửa](../exercises/robot/evidence/stop-right-support/curve-right-x-flat.png).

Đọc World của **foot-right thật** tại frame 26 sau sửa: X = 67,5, Y = −391,5 (trước đó X = 71,749). Đọc thêm 1/5/10/15/20/25/27/29: cả tám đều 67,5/−391,5; Rotation 0, Scale −1/1. Các mẫu bao phủ phần trước và sau bước cuối, gồm giữa hai đoạn vừa sửa. Đây là chín mẫu sau sửa, không phải đo mọi thời điểm liên tục.

[Frame 26 hết lệch](../exercises/robot/evidence/stop-right-support/curve-fixed-right-26.png), [frame 20](../exercises/robot/evidence/stop-right-support/curve-right-frame-20.png), [frame 27](../exercises/robot/evidence/stop-right-support/curve-right-frame-27.png), [ảnh cuối](../exercises/robot/evidence/stop-right-support/curve-fixed-final.png).

Bài học: chỉ nhìn giá trị tại key chưa đủ. Khi biến chuyển động đi thành giữ chân, cần kiểm tra cả đường cong giữa key; các tay nắm Bézier từ bản đi có thể còn gây trượt dù hai đầu bằng nhau. Với đoạn giữ vị trí cố định, Linear giữa các key bằng giá trị là cách rõ ràng để loại phần cong này.

Bước tiếp theo quay lại chọn pha vào đoạn dừng và nối sang tư thế nghỉ tương ứng. Phiên Trial vẫn đang mở tại stop-right-support frame 30, dừng phát, Loop tắt.
