# Bài 53 — Dùng xương điều khiển hình Path

Đã tạo `route-weighted` và animation `path-lift`. Xương `route-lift` nâng phần giữa đường khoảng 60,45 đơn vị; dây sáu xương đi theo đường mới. Hai đầu Path giữ cùng vị trí quan sát trên ảnh 0/30. Đây là bài điều khiển đường bằng xương, chưa phải đánh giá hoàn chỉnh chất lượng dây.

## Cách dựng

1. Trong Setup, duplicate attachment `route` trong cùng slot. Chọn **No** khi hỏi sao chép key, đặt tên `route-weighted`. Giữ attachment gốc để các bài trước tiếp tục dùng.
2. Tạo xương `route-lift` dưới `root`, không đặt dưới các xương đang bị Path constraint điều khiển. Tư thế gốc đọc được: X −434,13; Y −297,05; góc 0; chiều dài khoảng 66,8089.
3. Chọn Path mới, dùng G và bảng Weights, Bind vào `root` rồi `route-lift`. Sau bind các điểm ban đầu theo root. Gán ba điểm ngang ở giữa — nút giữa và hai tay nắm của nó — 100% cho route-lift. Không dùng Auto hay Smooth.
4. Đọc lại ba ảnh: [tay nắm trái](../exercises/path-turnaround/path-weights/weight-269.png), [nút giữa](../exercises/path-turnaround/path-weights/weight-center100.png), [tay nắm phải](../exercises/path-turnaround/path-weights/weight-553.png). Cả ba hiển thị route-lift 100%. Các điểm còn lại không được chỉnh sau bind.
5. Trả attachment `route` làm mặc định trong Setup. Tạo animation riêng `path-lift`; bật `route-weighted` và đặt key attachment ở frame 0. Path constraint dùng attachment đang hiện trong slot, nên không cần tạo constraint mới.
6. Key Position của `six-route` là 35% ở frame 0, giữ Spacing Length 0 và Mix 100. Key Translate của route-lift ở 0/30/60: tư thế gốc, nâng, trở về.

Weights áp dụng được cho Path, giúp biến đổi đường bằng xương thay vì sửa từng điểm ở mỗi tư thế. [Tài liệu Weights](https://us.esotericsoftware.com/spine-weights), [tài liệu Paths](https://us.esotericsoftware.com/spine-paths).

## Số và hình đã kiểm tra

| Mốc | Y của route-lift | Chiều dài Path hiển thị |
|---|---:|---:|
| 0 | −297,05 | 1.179,28 |
| 15 | chưa chép số xương | 1.214,31 |
| 30 | −236,60 | 1.251,42 |
| 60 | −297,05 | chưa chép lại chiều dài |

X của xương giữ −434,13 ở ba key. Độ nâng khoảng 60,45 tính từ số hiển thị; không phải chính xác 100 như ý định nhập ban đầu. Lần nhập tọa độ đầu tiên làm xương hạ xuống ngoài ý muốn, đã Undo trước khi đặt key rồi dùng kéo theo trục Y. Kéo ngược trở về cuối vòng cho cùng Y hiển thị và cùng vùng ảnh đầu/cuối.

So sánh [Path frame 0](../exercises/path-turnaround/path-weights/path00.png) và [frame 30](../exercises/path-turnaround/path-weights/path30.png): nút giữa cùng hai tay nắm nâng lên, hai đầu đường giữ nguyên vị trí trên ảnh. Phép so pixel ở các vùng nhỏ quanh đầu đường có sai khác do đoạn đường kế bên thay đổi; không tuyên bố cả vùng đó trùng pixel hoặc đã đọc tọa độ chính xác từng điểm.

Đường dài hơn khi nâng. Vì Position được giữ theo phần trăm, khoảng cách thực từ đầu đường tới dây cũng thay đổi; muốn giữ khoảng cách thực cần thử Position Fixed riêng.

Đã xem [31 tư thế](../exercises/path-turnaround/path-weights/poses.jpg), dây đi theo đường và chưa thấy chỗ rời rõ trong phần quan sát được. Chữ Trial che một phần dây ở các frame gần đỉnh nâng, nên chưa đánh giá đầy đủ mép dây tại đó. [GIF lấy mẫu](../exercises/path-turnaround/path-weights/rope-travel.gif) ghép từ ảnh editor, không phải xuất Spine hoặc quay playback liên tục. [Review](../exercises/path-turnaround/path-weights/review.json) xác nhận vùng ảnh frame 0/60 trùng pixel.

Đã bật lại `rope-travel`, frame 30: [constraint vẫn dùng route gốc, Position 70%](../exercises/path-turnaround/path-weights/travel-original-path.png). Sau đó trở về `path-lift`, xác nhận attachment weighted được dùng và dừng ở frame 0. Chưa kiểm tra lại toàn bộ các animation cũ.

Ảnh `weight-center-confirmed` là lần chọn ảnh hưởng chưa thành công; bằng chứng nút giữa đúng là `weight-center100`. Ảnh `lift-constraint30` thực tế ở frame 0 do đổi animation đặt lại thời gian; không dùng làm số đo frame 30.

## Tiếp theo

Bài Path đã có các ví dụ Position, Spacing, deform và weights. Trở lại robot để xử lý chất lượng toàn thân, nhất là tư thế chân đi qua nhau và độ rõ tay/chân. Quy trình lưu/xuất vẫn chưa được hoàn thành trong Trial.

Tạo lại bảng ảnh và GIF bằng `python3 scripts/report_path_weights.py`. Script chỉ xử lý bằng chứng, không tạo rig thay cho thao tác trong Spine.
