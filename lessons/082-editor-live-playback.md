# 82 — Đo playback đang chạy

Đã lấy ảnh liên tiếp khi **Play đang bật**, không kéo timeline giữa các ảnh. Kết quả tách được hai vấn đề: timeline chạy gần đúng 30 frame/giây; nhịp quay lại đầu vòng walk-wide cần xem riêng.

## Phép đo

Playback: FPS 30, Speed 100%, Interpolated bật. [Ảnh cấu hình](../exercises/robot/editor-review/playback-timing/settings.png).

- Bật Loop: 90 ảnh liên tiếp trong khoảng 3,611 giây giữa hai lần nhận ảnh đầu/cuối, xấp xỉ 24,65 mẫu/giây. Đã xem cả ba bảng ảnh kèm số frame: [1](../exercises/robot/editor-review/playback-timing/contact-0.jpg), [2](../exercises/robot/editor-review/playback-timing/contact-1.jpg), [3](../exercises/robot/editor-review/playback-timing/contact-2.jpg).
- Tắt Loop để tránh lẫn thời gian nối vòng: tám ảnh đọc được frame 9, 19, 29, 38, 48, 58, 68, 77. Timeline tiến 68 frame trong khoảng 2,273 giây, tương đương **29,92 frame/giây**. Sau frame 30, hình giữ pose cuối nhưng bộ đếm vẫn tiến.
- [Thời điểm lấy mẫu](../exercises/robot/editor-review/playback-timing/linear-times.json) và [kết quả tính](../exercises/robot/editor-review/playback-timing/analysis.json).

Thời điểm ghi là trước/sau lời gọi lấy ảnh, không phải thời điểm màn hình phát sáng. Đây là ước lượng tốc độ timeline, không phải phép đo FPS hiển thị. Không lấy mật độ ảnh chụp làm FPS của Spine.

## Chỗ nối vòng còn cần kiểm tra

Ba lần đi qua cuối vòng có các mẫu 30 → 1, 30 → 0 → 1 và 30 → 1. Các vòng quan sát dài khoảng 1,06 giây; có lần frame 30 xuất hiện ở hai mẫu kế nhau. Chưa đủ để quy lỗi cho key: việc giữ mốc cuối, cách làm tròn bộ đếm và sai số lấy mẫu đều cần phân biệt. Giữ nguyên FPS, Speed và key trong lượt này.

[GIF từ playback thật](../exercises/robot/editor-review/playback-timing/walk-live.gif) dùng khoảng cách thời gian lấy mẫu, làm tròn theo đơn vị thời gian GIF. Nó khác các GIF cũ ghép từ pose kéo tay. Đoạn chụp bắt đầu/kết thúc giữa vòng, nên điểm GIF tự khởi động lại không phải chỗ nối của animation. Vùng cắt GIF cũng không dùng để kết luận mọi đầu ngón tay nằm trong khung; ảnh PNG đầy đủ là nguồn kiểm tra.

## Trạng thái và bước tiếp

Đã dừng, trả walk-wide về frame 0, bật Loop. [Ảnh cuối](../exercises/robot/editor-review/playback-timing/restored-loop-frame0.png). Không sửa key hay transform.

Tiếp theo dùng cùng cách lấy mẫu trực tiếp để xem idle/wave hiện tại và kiểm tra nhịp cuối vòng walk. Chưa đánh dấu toàn bộ tiêu chí chuyển động liên tục là hoàn tất; lưu/mở lại và export vẫn là phần riêng chưa thực hiện trên Trial.

## Bổ sung — idle và wave đang chạy

Đã kích hoạt từng animation bằng nút cạnh tên trong Tree, rồi bật Play với Loop. Mỗi đoạn có 120 ảnh liên tiếp: idle 4,790 giây và wave 4,760 giây giữa lần nhận ảnh đầu/cuối. Mật độ khoảng 25 mẫu/giây; không kéo timeline trong chuỗi. Skin hiện tại là robot xanh đội mũ. Đã Fit Outline ở wave frame 10 để thấy trọn bàn tay trước khi chạy.

| Đoạn | Quan sát từ chuỗi trực tiếp | Quyết định |
| --- | --- | --- |
| Idle | Thân nhún xuống rồi lên, đầu/tay đổi hướng nhẹ. Qua các mẫu nối vòng 59/60 → 1 và 59 → 0 → 1, không thấy bước nhảy hình lớn. Hai chân vẫn tiếp đất trong chuỗi. | Giữ biên độ và key cho robot cơ khí. Chưa đo vận tốc hoặc khẳng định chân bất động tới từng pixel. |
| Wave | Tay mở ra, nâng, hạ nhẹ rồi nâng lại, cuối cùng thu về cạnh thân. Bàn tay tách khỏi mặt trong chuỗi; hai lần qua cuối vòng không thấy pose bật sang vị trí khác rõ rệt. | Giữ nhịp chào hiện tại. Đây là động tác chào trọn lượt có thu tay, không phải chỉ lặp phần cổ tay. |

Đã xem toàn bộ tám bảng ảnh: [idle 1](../exercises/robot/editor-review/playback-timing/core/idle-contact-0.jpg), [2](../exercises/robot/editor-review/playback-timing/core/idle-contact-1.jpg), [3](../exercises/robot/editor-review/playback-timing/core/idle-contact-2.jpg), [4](../exercises/robot/editor-review/playback-timing/core/idle-contact-3.jpg); [wave 1](../exercises/robot/editor-review/playback-timing/core/wave-contact-0.jpg), [2](../exercises/robot/editor-review/playback-timing/core/wave-contact-1.jpg), [3](../exercises/robot/editor-review/playback-timing/core/wave-contact-2.jpg), [4](../exercises/robot/editor-review/playback-timing/core/wave-contact-3.jpg). Số thứ tự ảnh ở trên, frame của Spine ở dưới mỗi ô.

Bản xem: [idle trực tiếp](../exercises/robot/editor-review/playback-timing/core/idle-live.gif), [wave trực tiếp](../exercises/robot/editor-review/playback-timing/core/wave-live.gif). GIF giữ khoảng thời gian lấy mẫu được làm tròn; điểm tự khởi động lại của GIF nằm giữa animation. Không dùng chính điểm đó để đánh giá nối vòng. Các PNG và thời điểm gốc được giữ cùng thư mục.

Lượt này bổ sung bằng chứng playback cho cả idle/wave hiện tại, thay cho khoảng trống chỉ có ảnh kéo timeline. Phạm vi vẫn là chuỗi khoảng 25 mẫu/giây; còn kiểm tra nguyên nhân nhịp cuối vòng walk. Không sửa key. Trạng thái cuối: wave-handbuilt frame 0, dừng, Loop bật; [ảnh xác nhận](../exercises/robot/editor-review/playback-timing/wave-final0.png).

## Đối chứng — phạm vi Loop 0–30

Playback đọc lại: FPS 30, Speed 100, Interpolated bật, Stepped tắt. Dopesheet có Loop Start/End trống trước thử. [Ảnh trước](../exercises/robot/editor-review/playback-timing/dopesheet-loop-bounds.png).

Đặt rõ Start 0, End 30 rồi chạy 90 ảnh liên tiếp, khoảng 3,666 giây. [Cấu hình](../exercises/robot/editor-review/playback-timing/explicit-loop-0-30.png), [90 số frame và thời điểm](../exercises/robot/editor-review/playback-timing/core/bounded-timeline.jpg). Frame 0 xuất hiện ở mẫu 19 (0,764 s), 45 (1,852 s), 71 (2,913 s): khoảng cách quan sát 1,088 và 1,061 giây. Sai số gồm thời điểm lấy ảnh và khoảng cách mẫu khoảng 40 ms. Kết quả không cho thấy việc đặt rõ giới hạn 0–30 loại bỏ nhịp dài hơn một giây đã quan sát. Không quy lỗi cho key chỉ dựa vào số frame cuối lặp ở hai ảnh.

Theo [hướng dẫn Keys](https://eu.esotericsoftware.com/spine-keys), Repeat dùng key muộn nhất của các animation đang hoạt động; frame chỉ là cách chia timeline, playback có thể ở giữa frame. [Dopesheet](https://eu.esotericsoftware.com/spine-dopesheet) cho phép giới hạn riêng đoạn phát; giới hạn này không lưu theo animation. [Playback](https://eu.esotericsoftware.com/spine-playback) phân biệt FPS timeline với Speed và Interpolated. Không có tham số delay trong bảng Playback vừa kiểm tra.

Đã xóa hai giới hạn thử, đọc lại ô trống, dừng ở walk-wide frame 0, Speed 100 và Repeat bật. [Ảnh cuối](../exercises/robot/editor-review/playback-timing/loop-bounds-restored.png). Trong thao tác chuyển bảng, giao diện đổi tỷ lệ khiến một click làm Speed thành 71,02; đã phát hiện và trả 100 trước lượt đối chứng. Không sửa key. Playback/Dopesheet hiện mở, giao diện đang ở tỷ lệ nhỏ.

Kết luận giới hạn: đã loại trừ giả thuyết ô Loop End đặt dư từ trước; chưa xác định nguyên nhân thời lượng quan sát. Bước đối chứng có ích tiếp theo là so cùng animation trong Preview (cơ chế phát riêng), không tiếp tục thay FPS hoặc dịch key cuối để ép kết quả.

## Đối chứng — cùng walk trong Preview

Chọn walk-wide trên Track 0, Repeat bật, Speed 100 trong Preview; editor chính vẫn dừng frame 0. Mix hiển thị 0,25; chuỗi được lấy sau khi chuyển animation đã xong, không đo giai đoạn mix. Đã lấy 120 ảnh trong 4,747 giây, xem đủ [60 ảnh đầu](../exercises/robot/editor-review/playback-timing/core/preview-contact-0.jpg) và [60 ảnh sau](../exercises/robot/editor-review/playback-timing/core/preview-contact-1.jpg). Hai chân luân phiên nâng/hạ, không thấy một lần bật pose lớn giữa các vòng trong chuỗi.

Để ước lượng chu kỳ khi Preview không hiện frame, so sai khác RGB trung bình của vùng robot (x550–650, y208–384) giữa các cặp ảnh cách nhau 22–28 mẫu. Sai khác thấp nhất ở **25 mẫu, trung bình 0,997 giây**: 2,88/255, so với 11,32 ở 24 mẫu và 10,10 ở 26 mẫu. [Bảng số liệu](../exercises/robot/editor-review/playback-timing/core/preview-period.json). Đây là ước lượng từ tính lặp lại của hình, không phải số thời gian nội bộ của animation; độ phân giải thời gian khoảng 40 ms.

Kết quả hỗ trợ chu kỳ gần một giây trong Preview. Dấu hiệu 1,06–1,09 giây từ timeline editor chưa tái hiện ở cơ chế phát này. Chưa có căn cứ dịch key cuối hoặc tăng FPS để bù. Tạm khép việc truy lỗi nhịp bộ đếm editor: giữ key hiện tại và dùng Preview cho nhận xét chu kỳ của bản walk này, không kết luận lỗi nội bộ cụ thể của Spine.

Đã đặt Speed Preview về 0 và đóng bảng; editor vẫn walk-wide frame 0, Repeat bật, Playback 30 FPS/100%, giới hạn Dopesheet trống. [Ảnh cuối](../exercises/robot/editor-review/playback-timing/after-preview-compare.png). Không sửa transform/key. Phần còn thiếu của sản phẩm là lưu/mở lại/export và các tiêu chí bàn giao tương ứng; phép đo này không thay thế chúng.
