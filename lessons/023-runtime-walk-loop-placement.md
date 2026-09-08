# Bài 23 — nối vị trí qua nhiều vòng đi

Đã sửa bản xem runtime để `walk_side` đi tiếp sau mỗi chu kỳ một giây. Trước đây thời gian bị lấy phần dư nên root cũng quay từ gần 70 về 0. Đây là lỗi đặt vị trí giữa các vòng, khác với chân trượt trong một bước.

## Cách sửa

Giữ tổng thời gian phát. Với mỗi giây đã hoàn tất, cộng thêm 70 đơn vị vào vị trí toàn skeleton; animation tiếp tục cung cấp chuyển động bên trong vòng hiện tại:

```text
X trong thế giới = X root trong clip + số vòng đã hoàn tất × 70
```

Ví dụ, tại 3,25 giây: clip ở 0,25 giây có root X = 17,5; ba vòng trước đã đi 210; tổng X = 227,5. Quãng đường mỗi vòng được đo từ hai đầu clip bằng runtime, không nhập cứng vào giao diện.

[loop-motion.mjs](../exercises/robot/loop-motion.mjs) chứa cách lấy tư thế và bù vị trí; [bản xem](../exercises/robot/index.html) dùng chung hàm này với phép kiểm tra. Mỗi lần lấy tư thế đều đặt lại vị trí toàn skeleton, tránh giữ phần dịch chuyển của walk khi đổi sang idle. Thuộc tính vị trí skeleton và phép tính world transform được đối chiếu với mã Spine Runtime 4.2.120 đã cài trong workspace; xem thêm [Runtime Skeletons](https://en.esotericsoftware.com/spine-runtime-skeletons).

Không chỉ xóa key root để làm đi tại chỗ: các target chân hiện đã trừ chuyển động root để giữ chân trụ. Nếu chỉ đưa root về 0 mà không xét lại target, chân có thể trượt so với mặt đất.

## Bằng chứng bằng runtime

Chạy `node scripts/check_loop_motion.mjs`. [Báo cáo](../exercises/robot/loop-motion-checks.json) ghi:

| Kiểm tra | Kết quả |
| --- | --- |
| Cách cũ, trước/sau mốc 1 giây | Root nhảy gần 70 đơn vị |
| Tư thế cuối vòng so với đầu vòng kế tiếp, có bù vị trí | Sai khác transform lớn nhất khoảng 2,8 × 10⁻¹⁷ |
| Hai phía điểm nối, cách mốc 0,000001 giây | Sai khác transform lớn nhất khoảng 0,000321 |
| 968 mẫu chân trụ qua bốn chu kỳ | Trôi lớn nhất khoảng 0,00000311 đơn vị |
| Root ở 3,25 giây | X = 227,5 |
| Về đầu, đổi walk → idle, về setup | Đạt kiểm tra xóa phần vị trí tích lũy |

Phép đo chân trụ dùng bàn chân thực sau IK, không chỉ đọc target. Đo chân trái trong pha 0–0,5 và chân phải trong pha 0,4–1 của từng vòng. So sánh transform tại điểm nối bao gồm mọi xương của rig.

## Kiểm tra bản xem

Đã phát nhiều vòng trong trình duyệt; lần chụp cuối hiển thị 9355,1 đơn vị ở vòng 134, camera vẫn giữ robot trong khung. Các vạch và số trên mặt đất được vẽ theo tọa độ thế giới, không hết vạch khi nhân vật đi xa. [Ảnh trình duyệt](../exercises/robot/evidence/root-motion-browser.png).

Đã kiểm tra nút Về đầu trả quãng đường về 0; tua 0,25 giây cho 17,5 đơn vị; tua cuối clip giữ thanh ở 1,00 giây và có thể lùi về 0,99; đổi sang đứng nhún trả thời gian về 0 và ẩn thông tin quãng đường. Console không có error/warn ở lần kiểm tra cuối.

Thời gian trên thanh tua là thời gian **trong vòng**. Tua thủ công quay về vòng đầu; nút Về đầu giữ trạng thái đang phát hay dừng hiện tại. Ở đúng 1 giây, tư thế tương đương đầu vòng 2 đã dịch 70 đơn vị.

## Phần chưa chứng minh

Đây là sửa bản phát dữ liệu tự tạo, không phải thay đổi rig dựng tay đang mở trong editor. Chưa xử lý root xoay, phối animation có chuyển động root hoặc chứng minh vận tốc mọi khớp nối êm. Ảnh chụp không thay thế đánh giá video ở tốc độ thường. Dáng đi vẫn là bài bước ngang thử nghiệm; tiêu chí chất lượng dáng đi và xuất/mở lại project vẫn còn mở.

Bổ sung: [bài 24](024-runtime-contact-velocity.md) chỉnh nội suy giữa các key và chạy lại các kiểm tra trên. Số liệu chân trụ trong bảng đã cập nhật theo bản này.
