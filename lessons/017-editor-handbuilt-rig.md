# Dựng rig robot từ project trống

Ngày 07/09/2026. Sau khi kết nối hoạt động trở lại, Spine hiển thị project trống. Các bản sửa animation chưa lưu không còn trong cửa sổ này. Tiếp tục phần dựng rig trực tiếp trong editor của kế hoạch, dùng ảnh đã có, không nhập skeleton JSON.

Đã làm:

1. Đặt Images Path thành đường dẫn tuyệt đối tới `exercises/robot/images/parts`, Refresh và mở cây Images.
2. Chọn root, dùng Create và click canvas để tạo xương con; đổi tên thành `body`.
3. Chọn body → New → Slot, đặt tên slot `body`.
4. Chọn ảnh `body` trong Images, nhấn P (Set Parent), chọn slot body. Region `body` xuất hiện dưới slot.
5. Xoay xương body từ 0° đến 15°, chọn region để kiểm tra ảnh nghiêng theo; trả góc xương về 0°, ảnh trở lại thẳng.

Bằng chứng: [region được gắn](../docs/evidence/robot-handbuilt-body-region.jpg), [ảnh nghiêng theo xương](../docs/evidence/robot-handbuilt-body-rotate15.jpg), [trả về 0°](../docs/evidence/robot-handbuilt-body-restored.jpg).

Kéo ảnh vào canvas hoặc slot không tạo được attachment trong các lần thử ở phiên này. Dùng P là cách khác được [tài liệu Images chính thức](https://us.esotericsoftware.com/spine-images) hỗ trợ, và đã thực hiện thành công. Chưa xác định nguyên nhân kéo thả không có hiệu lực.

Đã xử lý chế độ hiển thị: bật chấm trong cột mắt, hàng Images của bảng hiển thị ở cạnh công cụ Transform. Ảnh thân tiếp tục hiện khi chọn xương; lỗi trước đó là chế độ hiển thị, không phải thiếu ảnh.

Tiếp tục thêm đầu: chọn body, Create rồi click tại cổ để tạo xương con; đổi tên thành `head`. World của xương là (−0.5, 82.5), tức cao hơn body 80 đơn vị. Chọn ảnh head trong Images → P → xương head, chấp nhận tạo slot head. Ảnh ban đầu nằm giữa xương, chồng lên thân; chọn region head và đổi World Y từ 82.5 thành 202.5. Điểm xoay vẫn ở cổ, còn ảnh dịch lên 120 đơn vị.

Đã thử xoay xương head +15° và −15° rồi về 0°. Đầu nghiêng quanh cổ, thân giữ nguyên; ở kích thước đang xem, phần cổ vẫn nối với đầu. [Góc +15°](../docs/evidence/robot-handbuilt-head15.jpg), [góc −15°](../docs/evidence/robot-handbuilt-head-minus15.jpg), [trả về 0°](../docs/evidence/robot-handbuilt-head0.jpg). Đây là thử tư thế Setup, chưa có key animation.

Đã thêm `upper-arm-left` làm con của body, đặt xương ở vai (World −84.5, 30.5). Gắn ảnh bằng Images → P → xương, chấp nhận tạo slot. Dịch riêng region xuống: World Y −39.5. Thử xoay xương −45°: ảnh quay quanh vai, thân và đầu giữ nguyên. [Ảnh kiểm tra vai](../exercises/robot/evidence/robot-handbuilt-upper-arm-minus45.jpg).

Thêm `forearm-left` làm con của upper-arm-left tại khuỷu (World −90.5, −103.5). Gắn ảnh cùng cách trên; region có Scale X/Y 0.65 và World Y −163.5 để khớp đầu ảnh với khuỷu. Thử xoay xương −90°: cẳng tay nằm ngang, phần trên tay và thân không đổi. [Ảnh kiểm tra khuỷu](../exercises/robot/evidence/robot-handbuilt-elbow-minus90.jpg). Các tọa độ này là giá trị của bản dựng thử hiện tại, chưa phải tỷ lệ cuối cùng.

Thêm `hand-left` làm con của forearm-left tại World (−90.5, −227.5). Region bàn tay có Scale X/Y 0.55 và World Y −267.5. Khi vai xoay −45° và cẳng tay có hướng World −135°, bàn tay đi theo cả hai khớp, giữ nối với cổ tay. [Kiểm tra cả chuỗi](../exercises/robot/evidence/robot-handbuilt-arm-chain.jpg).

Tạo tay phải bằng nút Duplicate ở bảng thuộc tính xương upper-arm-left. Spine sao chép cả chuỗi con, slot và region. Đặt World X của xương bản sao thành 83.5 và Scale X thành −1 để đối xứng; đổi tên ba xương thành upper-arm-right, forearm-right, hand-right, giữ chọn Rename slot. Bản thử này dùng ảnh tay trái được lật, chưa dùng các ảnh riêng của tay phải.

Đã xoay cẳng tay phải để kiểm tra: bàn tay đi theo, tay trái đứng yên. [Kiểm tra tay phải](../exercises/robot/evidence/robot-handbuilt-right-elbow.jpg). Sau đó đã trả cả hai tay về tư thế buông thẳng. Với xương bị lật, góc hiển thị World cần được đối chiếu với hình sau khi nhập; trong phiên này nhập 180 không khôi phục tư thế buông, nhập 0 mới khôi phục được. Chưa xác định đầy đủ quy ước của ô nhập trong trường hợp phản chiếu, nên chưa dùng các con số này làm hướng dẫn tổng quát.

Đã thêm hông và hai chân. Tạo pelvis làm con của body, sau đó tạo chuỗi thigh-left → shin-left → foot-left dưới pelvis. Gắn ảnh bằng P như ở phần tay. Các giá trị của bản thử:

| Xương | World X, Y của xương | Scale X, Y của region | World X, Y của region |
| --- | --- | --- | --- |
| pelvis | −0.5, −83.5 | 0.75, 0.75 | −0.5, −123.5 |
| thigh-left | −42.5, −139.5 | 0.8, 0.8 | −42.5, −209.5 |
| shin-left | −44.5, −265.5 | 0.8, 0.8 | −44.5, −325.5 |
| foot-left | −48.5, −391.5 | −0.6, 0.6 | −63.5, −431.5 |

Ảnh foot-left ban đầu hướng mũi sang phải; lật riêng region theo X và dịch ảnh để cổ chân vẫn nối với xương. Thử thigh-left −25° và shin-left World 30°: gối gập, bàn chân đi theo cẳng chân và phần thân giữ nguyên. [Kiểm tra chân trái](../exercises/robot/evidence/robot-handbuilt-left-leg-bend.jpg). Đã trả hai xương về 0° sau thử.

Duplicate thigh-left để sao chép cả chuỗi, đặt World X xương bản sao 41.5 và Scale X −1, đổi tên ba xương cùng slot thành thigh-right, shin-right, foot-right. [Robot đủ các bộ phận](../exercises/robot/evidence/robot-handbuilt-full-body.jpg). Chân phải dùng các ảnh trái được lật; chưa kiểm tra gập riêng chân phải.

Đã kiểm tra thêm chân phải: xoay đùi và cẳng chân, bàn chân đi theo trong khi chân trái đứng yên; đã trả về tư thế đứng. [Ảnh kiểm tra](../exercises/robot/evidence/robot-handbuilt-right-leg-bend.jpg). Đã phóng to toàn thân để quan sát tư thế đứng. Rig hiện có 16 xương, 15 slot và 15 region; tỷ lệ và thứ tự ảnh vẫn cần tinh chỉnh khi làm các động tác phức tạp hơn.

Đã chuyển sang Animate và đặt key trên animation mặc định tên `animation`. Chọn hệ tọa độ Parent cho các key xoay, nhập frame qua ô Current và bấm biểu tượng chìa khóa cạnh Rotate sau mỗi giá trị.

| Xương | Các cặp frame: góc |
| --- | --- |
| upper-arm-left | 0: 0°, 15: −45°, 45: −45°, 60: 0° |
| forearm-left | 0: 0°, 15: −90°, 22: −115°, 30: −85°, 38: −115°, 45: −90°, 60: 0° |

Đã thấy key trên Dopesheet, kiểm tra tư thế frame 22 và tư thế nội suy frame 8; bàn tay vẫn nối với cẳng tay và không chạm thân ở các mẫu này. [Frame 22 trước tinh chỉnh](../exercises/robot/evidence/robot-handbuilt-wave22.jpg). Đã bật playback, quan sát timeline chuyển qua frame 18 và 51 với tư thế khác nhau, rồi dừng.

Vòng tinh chỉnh tiếp theo thêm hai đường xoay theo Parent:

| Xương | Các cặp frame: góc |
| --- | --- |
| hand-left | 0: 0°, 15: −10°, 24: 12°, 32: −8°, 40: 12°, 48: −6°, 60: 0° |
| head | 0: 0°, 18: 8°, 38: 5°, 60: 0° |

Cổ tay đổi chiều trễ hơn khuỷu khoảng hai frame ở các nhịp giữa, tạo chuyển động tiếp nối. Trong Graph, chọn từng điểm key rồi bấm Bezier, áp dụng cho các đoạn của đầu, vai, khuỷu và cổ tay. Đường cong đã thay cho các góc gãy tại các điểm đổi chiều; vai có đoạn giữ nguyên từ frame 15 đến 45. [Graph đầu](../exercises/robot/evidence/robot-handbuilt-head-bezier.jpg), [Graph vai](../exercises/robot/evidence/robot-handbuilt-shoulder-bezier.jpg), [Graph khuỷu](../exercises/robot/evidence/robot-handbuilt-elbow-bezier.jpg).

Đã so sánh [frame 0](../exercises/robot/evidence/robot-handbuilt-wave-loop0.jpg) và [frame 60](../exercises/robot/evidence/robot-handbuilt-wave-loop60.jpg): đầu và tay trở lại cùng tư thế trong phần canvas nhìn thấy.

Sau đó mở [Outline](https://en.esotericsoftware.com/spine-outline) để xem tư thế đồng bộ với timeline, không bị công cụ che. Preview phát độc lập nên không dùng để xác nhận từng frame. Đã chụp đủ 61 ảnh UI từ frame 0 đến 60, ghép thành bảng và xem toàn bộ: không thấy khớp cổ/vai/khuỷu/cổ tay bị rời hoặc tay đi xuyên vào thân ở độ phân giải đã chụp. Hai chân giữ nguyên trong động tác này.

- [Frame 0–19](../exercises/robot/evidence/handbuilt-wave-review/contact-00-19.jpg)
- [Frame 20–39](../exercises/robot/evidence/handbuilt-wave-review/contact-20-39.jpg)
- [Frame 40–59](../exercises/robot/evidence/handbuilt-wave-review/contact-40-59.jpg)
- [Frame 60](../exercises/robot/evidence/handbuilt-wave-review/contact-60-60.jpg)
- [GIF xem chậm](../exercises/robot/evidence/handbuilt-wave-review/wave-editor-review.gif)

So sánh pixel vùng Outline cho thấy ảnh frame 0 và 60 giống hệt nhau; có 60 tư thế ảnh khác nhau trong 61 ảnh. [Thông tin lần chụp](../exercises/robot/evidence/handbuilt-wave-review/capture-report.json). GIF được ghép từ ảnh UI ở tốc độ 80 ms/frame để xem chậm, không phải file xuất từ Spine và không xác nhận FPS của project.

Chưa thêm chuyển động thân và chưa đặt tên riêng cho animation. Bài chưa được lưu thành project do Trial.
