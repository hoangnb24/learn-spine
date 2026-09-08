# Bài 30 — sửa mép trong của mesh bằng deform

Ngày 07/09/2026, thao tác trong Spine 4.3.25 Trial.

## Kết quả để xem

Bản `bend-corrective` đã giảm chỗ móc ngược ở mép trong khi uốn ±35°. Chỉ chỉnh một đỉnh ở mỗi tư thế cực đại, giữ nguyên weights và chuyển động của hai xương. Đã xem đủ 61 tư thế nguyên từ 0 đến 60; không thấy mặt lưới lật hoặc rách ở độ phân giải chụp. Hai tư thế đầu–cuối khớp pixel, hai tư thế thẳng giữ hình gốc.

[So sánh trước–sau](../exercises/mesh-lab/evidence/bend-corrective/before-after.jpg) · [GIF lấy mẫu](../exercises/mesh-lab/evidence/bend-corrective/bend-corrective-sampled.gif).

GIF ghép từ 60 ảnh editor, tổng thời gian hai giây, khoảng 30 hình/giây. Đây là bản xem từ các tư thế đã chụp, không phải video quay playback hoặc file xuất từ Spine.

## Vì sao dùng deform ở đây

Thử nghiệm weights ở bài 29 làm xuất hiện vùng lõm trước khớp nên đã bỏ. Lần này giữ phân bố trọng số cũ và sửa riêng hình tại các góc khó. Deform lưu vị trí các đỉnh trong animation; trọng số vẫn đảm nhiệm phần lớn chuyển động. Spine khuyến nghị dùng deform tiết chế vì mỗi key lưu nhiều dữ liệu hơn key xương và các đỉnh nội suy theo đường thẳng. Xem [Deform keys](https://esotericsoftware.com/spine-keys#Deform-keys) và [Transform tools của mesh](https://esotericsoftware.com/spine-meshes#Transform-tools).

Nhân bản animation `bend-review`, đổi tên thành `bend-corrective`. Bản gốc vẫn còn để đối chiếu. Ba key xoay tip −35° / +35° / −35° ở frame 0/30/60 giữ nguyên.

## Năm key sửa hình

Trong Animate, chọn attachment `strip` và công cụ Translate; không vào Edit Mesh vì lần này cần chỉnh hình theo thời gian, không đổi lưới hoặc UV.

Đặt hai key hình gốc ở frame 15 và 45 trước khi sửa các tư thế khác. Bấm nút key cạnh attachment trong Tree để key deform. Khi cả hai xương nằm thẳng, mesh phải là dải chữ nhật ban đầu.

Sau đó chỉnh đỉnh ở mép trong, ngay cột giữa của dải:

| Frame | Tip | Deform |
| --- | --- | --- |
| 0 | −35° | Đỉnh giữa mép dưới dịch sang phải và xuống |
| 15 | 0° | Không dịch đỉnh |
| 30 | +35° | Đỉnh giữa mép trên dịch sang phải và lên |
| 45 | 0° | Không dịch đỉnh |
| 60 | −35° | Lặp đúng chỉnh hình của frame 0 |

Ở khung nhìn đã dùng, đỉnh mép dưới đi từ khoảng (503, 375) đến (524, 397); đỉnh mép trên từ khoảng (503, 194) đến (524, 173). Đây là tọa độ màn hình để mô tả thao tác, không phải dữ liệu vertex xuất từ Spine. Mỗi đỉnh được dịch bằng một lần phím ngang và một lần phím dọc, tương đương khoảng 21 pixel mỗi trục trong khung nhìn này.

Có vài lần kéo chuột không làm đỉnh đổi chỗ. Thử Shift + phím mũi tên cũng không cho bước nhỏ như dự kiến; đã quan sát hình, trả các bước thử về vị trí cũ rồi dùng bước dịch kiểm chứng được. Không dùng thao tác đó như bằng chứng đã chỉnh chính xác đến đơn vị lẻ.

Ảnh key: [frame 0](../exercises/mesh-lab/evidence/bend-corrective/key0-edit.jpg), [frame 30](../exercises/mesh-lab/evidence/bend-corrective/key30-edit.jpg), [frame 60](../exercises/mesh-lab/evidence/bend-corrective/key60-edit.jpg). [Dopesheet](../exercises/mesh-lab/evidence/bend-corrective/deform-keys.jpg) hiển thị đủ năm key Deform: strip tại 0/15/30/45/60.

## Kiểm tra bản sửa

Đã xem toàn bộ tư thế ở [bảng frame chẵn](../exercises/mesh-lab/evidence/bend-corrective/poses-0.jpg) và [bảng frame lẻ](../exercises/mesh-lab/evidence/bend-corrective/poses-1.jpg). Ở hai cực đại, mép trong chuyển hướng qua các đoạn kế tiếp nhẹ hơn bản đầu; phần cuối dải và mép ngoài vẫn giữ dáng. Ở các frame trung gian không thấy góc nhọn mới, mặt lưới lật hoặc khe rách. Đây là đánh giá hình ảnh, chưa phải đo diện tích tam giác hoặc độ cong bằng dữ liệu xuất.

Đã đổi qua lại bản gốc và bản sửa để chụp cùng góc, cùng khung nhìn. Kết quả so sánh trong [comparison.json](../exercises/mesh-lab/evidence/bend-corrective/comparison.json):

- Vùng chứa toàn mesh ở hai ảnh cuối frame 0 và 60 trùng pixel.
- Frame 45 của bản sửa trùng pixel bản gốc trong vùng xem.
- Frame 15 trùng pixel bản gốc trong hình chữ nhật bao toàn mesh ở tư thế thẳng. Vùng xem lớn hơn có tooltip của giao diện ở phía dưới, nên không coi sai khác tooltip là lỗi mesh.

Ảnh đầu tiên từng có dấu điều khiển xương và tooltip làm phép so ảnh báo khác. Đã chụp lại khi bỏ chọn; các ảnh nguồn và phạm vi crop đều được giữ rõ trong báo cáo. Không xóa vùng hình lỗi để làm phép kiểm tra đạt.

[Playback bản sửa](../exercises/mesh-lab/evidence/bend-corrective/playing.jpg) đã chạy ở Timeline FPS 30, Speed 100%, Interpolated; sau đó dừng và đưa về frame 0. Bằng chứng này xác nhận phát được, không thay thế đánh giá video liên tục ở tốc độ thường.

## Mức đạt và giới hạn

Bài mesh cơ bản đã có một bản sửa hình dùng được trong biên độ ±35°: lỗi mép trong ban đầu giảm rõ, hình thẳng được giữ, đã kiểm tra toàn bộ frame nguyên và tư thế nối vòng. Chưa thử góc lớn hơn, thay nhịp animation, phối nhiều animation hoặc xuất sang runtime. Deform này gắn với animation cụ thể; muốn tái sử dụng rộng nên tiếp tục xem lại cách chia chuỗi xương thay vì thêm nhiều key sửa hình.

Trạng thái cuối: Animate / `mesh-refine / bend-corrective`, frame 0, dừng phát. `bend-review` còn nguyên để so sánh; robot vẫn ẩn trong cùng project. Toàn bộ mục tiêu học Spine chưa hoàn tất, đặc biệt chất lượng chuyển động robot và quy trình lưu/xuất còn mở.
