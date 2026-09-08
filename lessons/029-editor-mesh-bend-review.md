# Bài 29 — animation kiểm tra mesh và một thử nghiệm không nên giữ

Ngày 07/09/2026, Spine 4.3.25 Trial. Tiếp nối mesh 27 đỉnh ở bài 28.

## Kết quả

Đã tạo animation `bend-review` trên skeleton `mesh-refine`, cho xương `tip` uốn qua hai chiều. Đã xem 31 tư thế cách nhau hai frame, xác nhận playback ở 30 FPS / 100%, và kiểm tra ảnh tư thế đầu–cuối trùng nhau. Đã thử mở rộng vùng ảnh hưởng quanh khớp, thấy đường viền xấu hơn và hoàn tác đúng sáu trọng số. Animation mới vẫn còn; trọng số cuối bài giữ bản trước thử nghiệm.

[GIF từ các tư thế lấy mẫu](../exercises/mesh-lab/evidence/bend-review/bend-review-sampled.gif) · [31 tư thế](../exercises/mesh-lab/evidence/bend-review/before/poses.jpg) · [So sánh thử nghiệm](../exercises/mesh-lab/evidence/bend-review/comparison.jpg).

GIF ghép từ ảnh editor ở frame 0, 2, …, 58, tổng thời gian hai giây, khoảng 15 hình/giây. Đây không phải video quay playback liên tục và không phải file xuất từ Spine.

## Animation dùng để kiểm tra

Chọn thư mục Animations → New → Animation → `bend-review`. Trong Animate, chọn tip, đặt và bấm key Rotate ở ba mốc:

| Frame | Góc nhập | Hiển thị trên UI |
| --- | --- | --- |
| 0 | −35° | 325° |
| 30 | +35° | 35° |
| 60 | −35° | 325° |

Các key dùng Bezier có tiếp tuyến ngang ở hai đầu; [Graph đã kiểm tra](../exercises/mesh-lab/evidence/bend-review/graph.jpg) cho thấy đường xoay đi từ −35 lên +35 rồi về −35. Không cần sửa thêm tay nắm trong bài này. Frame 15 đi qua góc 0, xác nhận góc không chạy vòng dài qua 180°.

Tạo animation quét biên độ để kiểm tra weights cũng là cách được hướng dẫn trong [Weights — Testing weights](https://esotericsoftware.com/spine-weights#Testing-weights). Nó giúp dùng lại cùng chuyển động khi so sánh nhiều cách phân bố trọng số.

## Thử mở rộng vùng chuyển tiếp

Bản đầu còn đổi hướng khá tập trung ở giữa. Dự đoán: tăng ảnh hưởng tip ở cột ngay trước khớp và giảm ở cột ngay sau khớp có thể phân bố độ uốn rộng hơn.

Thao tác trong Setup / Weights / Direct, thay đúng sáu đỉnh:

| Cột theo tọa độ dải | Tip trước: trên / giữa / dưới (%) | Thử nghiệm: cả ba đỉnh (%) |
| --- | --- | --- |
| x ≈ 96, trước khớp | 5,38455 / 0 / 5,96335 | 20 |
| x ≈ 160, sau khớp | 90,1495 / 99,9943 / 92,842 | 80 |

Cột giữa tại khớp vẫn tip 50% từ bài trước. Không chỉnh các cột xa khớp, không chỉnh key xoay hoặc thêm đỉnh.

Kết quả ở +35° xuất hiện một chỗ lõm trước khớp, và ở −35° chỗ đó đội lên. Vì vậy đã bỏ thử nghiệm này. [Ảnh +35°](../exercises/mesh-lab/evidence/bend-review/experiment-20-80-plus35.jpg), [ảnh −35°](../exercises/mesh-lab/evidence/bend-review/experiment-20-80-minus35.jpg).

Giải thích hình học: đỉnh nằm trước điểm xoay tip sẽ đi về phía ngược lại khi tip xoay. Ví dụ đơn giản, một điểm trên trục cách khớp 32 đơn vị về bên trái, khi tip xoay +35°, phần chuyển động do tip kéo xuống khoảng `32 × sin(35°) = 18,35` đơn vị. Cho tip 20% ảnh hưởng tạo khoảng 3,67 đơn vị kéo xuống ở điểm đó. Đây là tính minh họa cho nguyên nhân, không phải số đo tọa độ từ editor. Với dải rộng và chỉ hai xương hiện tại, mở rộng weights có thể làm xuất hiện vùng lõm thay vì đường cong đều.

## Kiểm tra sau hoàn tác

Đã Undo sáu lần rồi đọc lại cả sáu giá trị. [Bảng ảnh trọng số đã trả lại](../exercises/mesh-lab/evidence/bend-review/restored-weights.jpg) khớp các giá trị trước thử nghiệm trong bảng trên.

Đã chụp lại frame 0/30/60 sau hoàn tác. Vùng ảnh mesh ở frame 30 và 60 trùng pixel với ảnh tương ứng trước thử nghiệm. Hai ảnh cuối cùng tại frame 0 và 60 cũng trùng pixel. So sánh ảnh frame 0 cũ có sai khác nhỏ tại dấu điều khiển đầu xương; không dùng ảnh đó để khẳng định toàn bộ ảnh giống nhau. [Kết quả so sánh ảnh](../exercises/mesh-lab/evidence/bend-review/pose-comparison.json).

[Playback](../exercises/mesh-lab/evidence/bend-review/playing-30fps.jpg) hiện Timeline FPS 30, Speed 100%, Interpolated, đang ở frame lẻ; đã chạy rồi dừng và đưa về frame 0. Đã tắt Bone compensation sau khi nhận ra nút Bones ở cụm bù chuyển đổi; trong thử nghiệm chỉ đổi weights, không dịch xương Setup.

## Kết luận và phần chưa đạt

Đã có animation tái sử dụng để kiểm tra mesh, có bằng chứng về pha đổi hướng và tư thế nối vòng. Thử nghiệm 20/50/80 bị loại vì làm đường viền xấu hơn; không coi nó là cải tiến chất lượng.

Bản hiện tại còn góc đổi hướng rõ quanh khớp ở biên độ lớn. Bước tiếp theo nên thử một sửa hình có kiểm soát bằng deform ở tư thế cực đại, hoặc xem lại cách chia chuỗi xương; chưa khẳng định phương án nào đã thành công. Không cần thu lại 31 tư thế khi chưa thay đổi mesh hay chuyển động.

Editor cuối bài: Animate, `mesh-refine / bend-review`, frame 0, tip 325°, dừng phát; robot vẫn ẩn. Trial chưa lưu/xuất được project. Tiêu chí mesh “uốn không gãy rõ” và toàn bộ kế hoạch vẫn còn mở.
