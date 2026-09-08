# 91 — Nhảy tại chỗ và tiếp đất

Đã tạo `jump-in-place` trên robot chính trong Spine: nhún lấy đà, bật lên, rơi xuống, khuỵu gối rồi đứng lại. Phần lưu/xuất được bỏ qua theo yêu cầu người dùng.

## Cách dựng

Tạo animation trống. Hai target IK của chân vốn nằm dưới `root`, nên dịch `body` làm gối gập trong khi chân giữ chỗ; dịch `root` nâng cả người và hai target. Dùng hệ trục Parent, đặt key Translate theo bảng. Root X luôn 0, body X luôn −0,5.

| Frame | Root Y | Body Y | Ý nghĩa |
| --- | --- | --- | --- |
| 0 | 0 | 2,5 | Đứng |
| 6 | 0 (giữ) | −37,5 | Lấy đà |
| 10 | 0 | 2,5 | Duỗi để bật |
| 18 | 140 | −17,5 | Đỉnh nhảy, gập nhẹ gối |
| 26 | 0 | 2,5 | Chạm đất |
| 30 | 0 (giữ) | −32,5 | Hấp thụ lực |
| 40 | 0 | 2,5 | Đứng lại |

Root có key tại 0/10/18/26/40. Tách Translate X/Y; dùng Bézier cho Y và preset Bounce ở 10/26 để đoạn bay đi nhanh gần mặt đất, chậm gần đỉnh. Không áp dụng Automatic trơn xuyên mốc chạm đất. Các key Y của body dùng Automatic để chuyển qua cực trị mềm hơn. Đọc lại đủ bảy giá trị body sau sửa.

Root Y đã đọc tại frame 10/11/14/17/18/19/22/25/26: 0/27,273/94,807/135,87/140/135,87/94,807/27,273/0. Đây là đường cong dựng trong editor, không khẳng định gia tốc trọng trường không đổi.

Thêm Rotate cho đầu và khăn để chuyển động không kết thúc cùng lúc với thân. Bảng dưới là góc tuyệt đối theo Parent; các kênh phụ giữ nội suy Linear ở bản này.

| Xương | Frame | Rotate |
| --- | --- | --- |
| head | 0/8/12/20/28/34/40 | 0/−4/4/−2/4/−2/0 |
| scarf-mid | 0/8/12/20/28/34/40 | −0,022/8/−16/10/−10/5/−0,022 |
| scarf-tip | 0/10/14/22/30/36/40 | 0,078/12/−20/14/−12/6/0,078 |

Đuôi khăn trễ hai frame so với đoạn giữa ở các cực trị tương ứng. Đây là chuyển động đặt key, không phải một lượt thử Physics mới. Tay còn ở tư thế thả; động tác hiện tại ưu tiên kiểm tra nhịp thân và chân.

## Kiểm tra

Chọn từng `foot-left` và `foot-right`, chuyển sang World để đọc vị trí bàn chân thật, không chỉ đọc target IK. Tại 0/6/10/26/30/40: chân trái X/Y = −48,5/−391,5; chân phải = 47,5/−391,5. Tại 18, hai Y đều −251,5, tức nâng đúng 140; X giữ nguyên và Rotate đều 0 ở bảy mốc đã lấy mẫu. Đây là kết luận tại các mốc, chưa phải đo toàn bộ thời gian liên tục.

Đã xem tám tư thế thân ở 6/10/14/18/22/26/30/40, rồi xem các tư thế sau thêm đầu/khăn. Hai gối gập ra ngoài, bàn chân giữ nằm ngang; không thấy khớp tách lớn trong các hình đã quan sát.

Playback: Timeline FPS 30, Speed 100%, Interpolated, Loop bật. Lấy 90 ảnh liên tiếp khi đang chạy; ảnh đầu ở 0,424 giây, ảnh cuối ở 3,890 giây sau bấm Play. Đã xem đủ 90 ảnh trong [bảng ảnh](../exercises/mesh-lab/scarf/jump-live-review.jpg): có hơn hai chu kỳ bật/đáp, không thấy bước nhảy hình lớn hoặc mất ảnh ở kích thước quan sát. Chuỗi này bỏ lỡ 0,424 giây đầu; không coi là kiểm chứng từng frame hoặc chuyển động đã trau chuốt hoàn toàn.

Bằng chứng nằm trong `exercises/mesh-lab/scarf/`: `jump-core-pose-*.png`, `jump-foot-{left,right}-world-*.png`, `jump-{head,scarf-mid,scarf-tip}-key-*.png`, `jump-live-000.png` đến `jump-live-089.png` và `jump-live-times.json`. Các ảnh Graph/thử khung nhìn trước đó giữ lại làm lịch sử thao tác; dùng các nhóm vừa nêu để xem kết quả.

Đã dừng tại frame 0. Phần tiếp theo có ích: thêm vung tay để tư thế bật nhảy rõ hơn, rồi so sánh với bản tay thả hiện tại. Không lặp bài lưu/xuất.

## Bổ sung — Vung tay và gập khuỷu

Đã thêm bốn kênh Rotate ngay trên `jump-in-place`. Bằng chứng tay thả phía trên giữ làm bản trước; không tạo animation bản sao trong lượt này. Dùng Parent và đọc lại từng key sau nhập.

| Xương | Frame | Góc |
| --- | --- | --- |
| upper-arm-left | 0/6/12/18/26/32/40 | 0/−10/−65/−55/−30/−15/0 |
| upper-arm-right | 0/6/12/18/26/32/40 | 0/10/65/55/30/15/0 |
| forearm-left và forearm-right | 0/8/14/20/28/34/40 | 0/−12/−35/−30/−15/−8/0 |

Vai hai bên xoay trái dấu. Cẳng tay phải nằm dưới nhánh có Scale X = −1, nên cùng góc Parent âm với bên trái tạo gập đối xứng trong hình. Không tự đổi dấu mọi key chỉ vì tên xương là bên phải. Cẳng tay đạt các mốc trễ hai frame so với vai, trừ đầu/cuối. Các kênh mới dùng Linear.

[Bảng so tư thế tại frame 18](../exercises/mesh-lab/scarf/jump-arms-comparison.jpg) cho thấy hai tay tách khỏi thân và khuỷu gập nhẹ, tư thế bay rõ hơn bản tay thả. Bản trước trong bảng là ảnh core trước thêm cả đầu/khăn; chỉ dùng bảng này đánh giá thay đổi tư thế tay, không coi là đối chứng mọi pixel ngoài tay.

Đã xem năm pose cuối tại 0/12/18/26/40 và [90 ảnh playback mới](../exercises/mesh-lab/scarf/jump-arms-live-review.jpg), từ 0,403 đến 3,889 giây sau Play, cùng 30 FPS/Speed 100%. Không thấy mất ảnh, hở khớp lớn hoặc bước nhảy lớn của tay ở kích thước quan sát. Đây vẫn là đánh giá chuỗi ảnh lấy mẫu, chưa chứng minh độ mượt ở mọi thời điểm.

Đối chiếu Outline 0/40 không trùng hoàn toàn: 1.285 pixel khác ở vùng chân. Đã so với hai ảnh chân phải World 0/40 trước thêm tay: **ảnh sai khác trước và sau giống hoàn toàn**, nên không quy sai khác này cho sửa tay. [Kết quả đối chiếu](../exercises/mesh-lab/scarf/jump-arms-end-check.json). Không sửa key chân trong lượt này.

Đã trả frame 0 và dừng. Nhịp vung tay cơ bản đã có; phần cần xem tiếp nếu tinh chỉnh là đổi hướng tại đỉnh vung đang dùng Linear, không cần lặp lại toàn bộ phép đo bàn chân.

## Hoàn thiện — Làm mềm đổi hướng tay

Đã đổi cả bảy key của từng kênh `upper-arm-left`, `upper-arm-right`, `forearm-left`, `forearm-right` sang Bézier Automatic trong Graph. Chọn từng điểm, áp dụng Automatic; xem lại bốn đường cong với đủ các điểm và tiếp tuyến. Các mốc thời gian/góc ở bảng vung tay giữ nguyên; độ trễ cẳng tay vẫn hai frame.

Đọc Rotate Parent quanh cực trị để kiểm tra hiệu quả cụ thể:

| Kênh | Frame | Góc sau sửa |
| --- | --- | --- |
| upper-arm-right | 11/12/13 | 61,403/65/64,578 |
| upper-arm-left | 11/12/13 | −61,403/−65/−64,578 |
| forearm-left và forearm-right | 13/14/15 | −33,556/−35/−34,815 |

Với vai phải, bước 11→12 giảm từ khoảng 9,167° của nội suy Linear xuống 3,597°, và bước 12→13 giảm từ 1,667° xuống 0,422°. Cẳng tay ngay sau đỉnh chỉ đổi 0,185°. Hai bên có độ lớn tương ứng; ảnh số đọc lại nằm ở [bảng số](../exercises/mesh-lab/scarf/jump-smooth-numbers.jpg), cùng ba ảnh `jump-upper-right-smooth-*.png`. Những phép tính trước sửa dựa trên bảng key Linear, không phải số đọc trực tiếp mới của bản cũ.

Đã xem đủ [90 ảnh playback sau làm mềm](../exercises/mesh-lab/scarf/jump-smooth-live-review.jpg), từ 0,416 đến 3,922 giây sau Play. Có hơn hai vòng, không thấy tay bật hình hoặc hở khớp lớn ở kích thước quan sát. Đường cong và số quanh cực trị chứng minh đã giảm tốc khi đổi hướng; chuỗi ảnh không thay cho đánh giá liên tục ở mọi thời điểm.

Khép bài nhảy tại chỗ cơ bản: có lấy đà, pha bay, tiếp đất, vung tay/gập khuỷu, đầu/khăn trễ và một lượt sửa đường cong có đối chứng. Đã dừng tại frame 0; không phát sinh bài lưu/xuất. Sai khác nhỏ chân đầu/cuối đã có từ trước và được ghi ở phần đối chiếu; chưa khẳng định mọi pixel của vòng trùng nhau.
