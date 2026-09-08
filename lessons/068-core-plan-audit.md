# Bài 68 — Rà tiêu chí hoàn thiện bộ robot

Chưa thể coi toàn bộ kế hoạch hoàn tất. Đã có rig và bộ động tác dựng trực tiếp trong Spine, cùng bằng chứng sửa lỗi có chủ đích. Bài 82 đã bổ sung chuỗi playback trực tiếp cho bộ cuối. Khoảng trống bàn giao còn lại là quy trình lưu–mở lại–xuất từ editor; xem cập nhật cuối trang để không dùng kết luận lịch sử làm trạng thái hiện tại.

## Nguồn đã kiểm tra lại

Đọc tiêu chí trong PLAN, bài 17/19/30/56, báo cáo chụp idle/wave và kiểm tra walk-wide. Mở lại ba animation trong cửa sổ hiện tại: idle-handbuilt tại 30, wave-handbuilt tại 30, walk-wide tại 15. Hình có đủ các bộ phận trong những pose này; ảnh nằm ở `exercises/robot/evidence/core-audit/`. Phải kích hoạt animation bằng chấm bên trái tên; chỉ chọn tên không đổi animation đang chạy. Khi vẫy bị cắt ở mép Outline, đã Fit lại để thấy cả bàn tay.

Đây là kiểm tra sự tồn tại và ba tư thế đại diện, không thay thế các chuỗi mẫu của những bài trước. Kiểm tra tệp trong repository chưa thấy project `.spine` hoặc `.skel`; hai atlas hiện có thuộc các bài dữ liệu tự tạo, không chứng minh export từ editor.

## Đối chiếu từng mốc của PLAN

| Mốc / tiêu chí | Bằng chứng hiện có | Kết luận còn giới hạn |
| --- | --- | --- |
| 0 — điều khiển và lặp lại thao tác | Các bài editor, lần này chuyển ba animation và sửa khung nhìn | Đạt thao tác cơ bản; đã lặp lại thực tế |
| 1 — cha/con và che khuất | Bài 5; rig dựng tay bài 17; Physics hai tầng bài 67 | Đạt bài cơ chế cơ bản |
| 2 — key, thời gian, nội suy, đứng thở | editor-breathe bài 5; idle bài 19 có nhịp thân/đầu/tay và Graph | Đạt thao tác; bằng chứng nhịp liên tục còn hạn chế |
| 3 — robot từ ảnh, đủ phần, khớp kín trong pose dự kiến | 15 ảnh alpha; bài 17 dựng FK; bài 19 IK và 61 pose mỗi idle/wave; bài 56 xem 31 pose walk | Có bằng chứng trong các biên độ đã dùng. Chưa đánh giá cạnh ảnh ở nhiều kích thước hiển thị hoặc góc nhìn mới |
| 4 — idle 2 s, wave 2–3 s, walk 1 s | 60/60/30 frame ở 30 FPS; bản xem từ ảnh; các vòng sửa tay/IK ở 17–19 và tay/chân ở 37–40, 55–56 | Đủ độ dài và lịch sử sửa. Chân trụ có 62 mẫu, wave/walk khớp ảnh đầu cuối; chưa chứng minh mọi khoảng giữa frame hoặc nhịp playback liên tục của bản cuối |
| 4 — vòng idle | Bài 19 có số đo bàn chân giữ nguyên, sai khác IK khoảng 0,001°/0,003 đơn vị | Không tiếp tục ép trùng pixel nếu không có bước nhảy nhìn thấy; câu hỏi còn lại là nhịp/chất lượng, không phải số pixel khác |
| 5 — mesh/weights/IK, lỗi và sửa | Bài 19 giữ chân khi hạ hông; bài 28–30 sửa weights/deform, 61 pose ở ±35° | Đạt bài cơ bản trong biên độ đã thử; chưa phải mesh tái sử dụng mọi góc |
| 6 — tên, ảnh, phiên bản | Tên ba animation rõ, PSD sync sửa ảnh ở 65–66, dữ liệu thử có ghi nguồn/phiên bản | Có chuẩn bị và kiểm tra ảnh; cần kiểm tra lại chính gói export sau khi tạo được |
| 6 — lưu, mở lại, export, runtime tương ứng | Chưa có project lưu từ editor hoặc gói export của rig dựng tay | Chưa đạt. Bản Trial hiện tại là giới hạn thực tế; đã hỏi người dùng về bản có bản quyền |

Các bài mở rộng vẫn được theo dõi trong PROGRESS. Những mục chưa thử như PSD nhóm lồng nhau, trang phục khác hình dáng hoặc Physics có ảnh nhiều tầng không được tự đánh dấu đạt vì đã thực hành trường hợp gần giống.

## Sửa cách trình bày sản phẩm

README robot cũ còn ghi “chưa nhập vào editor” và dẫn trước tới video runtime viết bằng code. Đã thay bằng lối vào riêng cho bộ động tác dựng trong Spine và giữ lịch sử runtime ở mục riêng.

Tạo [trang xem bộ động tác](../exercises/robot/editor-review/README.md): chuyển hai bộ ảnh idle/wave đã kiểm tra sang GIF dài đúng 2 giây, giữ nguyên các GIF xem chậm cũ; walk-wide đã có bản 1 giây. Đã kiểm tra mỗi GIF mới có 60 frame và tổng 2.000 ms. Không dùng việc đóng gói GIF này làm bằng chứng playback thực hoặc export.

## Việc tiếp theo có ảnh hưởng đến đích đến

1. Đánh giá bộ động tác ở nhịp dự kiến bằng các bản xem được gắn đúng thời gian và kiểm tra playback thực nếu có cách ghi phù hợp; chỉ sửa lỗi nhịp hoặc hình cụ thể được quan sát.
2. Khi có editor hỗ trợ lưu/xuất, lưu project rồi mở lại, kiểm tra ảnh, export đúng phiên bản và đối chiếu runtime với chính rig đó. Không dùng JSON tự tạo để thay cho bước này.
3. Rà bảng phạm vi mở rộng còn thiếu sau các mốc sản phẩm; không tiếp tục thêm biến thể của phép thử đã đủ bằng chứng chỉ để tăng số bài.

Không đổi định nghĩa “hoàn tất” thành số lượng bài đã làm. Toàn bộ mục tiêu vẫn đang tiếp tục.

## Kiểm tra khả năng ghi playback — 07/09/2026

Đã thử QuickTime Player qua giao diện. Menu File hiển thị `New Screen Recording` bị vô hiệu hóa; phím tắt cũng không mở được điều khiển ghi. Chưa xác định nguyên nhân, chưa thay đổi cài đặt hệ thống và chưa tạo video mới. Không coi lần thử này là bằng chứng chất lượng chuyển động hoặc một bài kỹ thuật Spine đã hoàn thành.

Đã trở về Spine và xác nhận `walk-wide` còn đang mở, dừng tại frame 0 với toàn thân hiển thị trong Outline. Không sửa key trong lần kiểm tra này. Bản xem từ các ảnh ở trang editor-review vẫn dùng được để đánh giá các pose và thời lượng đã lấy mẫu; đánh giá playback liên tục và lưu/export vẫn còn thiếu.

## Rà lại sau bài 70

Weights view không còn thiếu: bài 50 đã có Direct, Pies, chọn đỉnh và 18 giá trị đọc lại. Đã xem lại ảnh `exercises/path-turnaround/rope-manual/reset-a100.png` và báo cáo `weights-readback.json`; ảnh thể hiện rõ Weights view, xương link-a và giá trị 100%. Vì vậy đã sửa bảng phạm vi, không tạo bài lặp lại.

Đã thử mở ứng dụng Screenshot trực tiếp qua công cụ điều khiển macOS. Lệnh trả timeout; danh sách ứng dụng sau đó không trả mục Screenshot. Chưa có điều khiển ghi hình hoặc video mới. Kết quả chỉ xác nhận lần truy cập này chưa thành công, không xác định nguyên nhân và không kết luận macOS không hỗ trợ quay màn hình.

Người dùng đã xác nhận không có license Spine. Không tiếp tục chờ câu trả lời về license hoặc yêu cầu nâng cấp. Lưu/export giữ là mốc có điều kiện; bằng chứng nhịp playback liên tục vẫn chưa đủ. Các bài 69–70 bổ sung chẩn đoán màu/alpha và sửa nội suy, không thay thế kiểm tra nhịp của bộ idle/wave/walk.


## Cập nhật 08/09 sau chuỗi PSD

Bài 71–73 đã nhập nhóm lồng nhau, đặt lại điểm xoay và thử đồng bộ sau đổi nhóm; khoảng trống PSD nhóm trong bản rà cũ đã có bằng chứng. Lưu/export vẫn là mốc có điều kiện do Trial đã được người dùng xác nhận.

Đã đối chiếu thêm 17 pose mint hiện tại và hai kích thước hiển thị tại [trang sản phẩm](../exercises/robot/editor-review/README.md). Sửa khung Outline cắt ngón tay bằng Fit tại tư thế tay duỗi ngang; không sửa key khi vấn đề thuộc khung nhìn. Kết quả củng cố kiểm tra hình bản hiện tại, không thay cho đánh giá playback liên tục. Không chờ hay yêu cầu video để tiếp tục học.

## Rà hiện trạng sau bài 82 — 08/09/2026

Đã đọc lại tiêu chí 0–6 trong PLAN, bằng chứng bài 75/81/82 và danh sách file dự án. Tìm theo phần mở rộng vẫn không có `.spine` hay `.skel`; hai atlas robot/mesh-lab là dữ liệu thử đã có từ trước. Không có gói xuất mới để kiểm tra mở lại hoặc runtime của rig dựng tay.

| Tiêu chí trước đây còn mở | Bằng chứng cập nhật | Trạng thái hiện tại |
| --- | --- | --- |
| Hình robot ở kích thước khác | Đối chiếu bản mint và khung 300/150 px trong trang sản phẩm; bài 75 thay đầu đội mũ | Đã kiểm tra kích thước và region khác hình dáng trong phạm vi robot này |
| Nhịp idle/wave hiện tại | Bài 82: 120 mẫu trực tiếp mỗi đoạn, hơn hai vòng, đã xem đủ 240 mẫu | Đạt bài nhịp cơ bản trong chuỗi lấy mẫu; không có bước nhảy hình lớn quan sát được |
| Walk một giây và nối vòng | Bài 56 có 62 mẫu chân, bài 82 có playback timeline và 120 ảnh Preview; chu kỳ hình khoảng 0,997 s | Đủ để giữ bản walk cơ khí tại chỗ hiện tại; không suy ra đi tiến hoặc chuyển động tự nhiên như người |
| Dừng và về idle | Bài 77–80 có chân trụ trái/phải, sửa nội suy gây trượt và thử Mix | Đã thực hành ở các điểm vào/ra ghi trong bài; dừng tùy pha chưa hoàn tất |
| PSD lồng nhóm, Trim, độ phân giải | Bài 71–74 và 81, đối chứng nhập mới region tự bù tỷ lệ | Đã thực hành cho region; không áp kết luận sang mesh |
| Lưu, mở lại, export và đối chiếu runtime | Chưa có file project/export của rig dựng tay | Chưa thể thực hành trên Trial; giữ nguyên mốc có điều kiện, không yêu cầu mua license |

Các nhận xét “chưa có playback trực tiếp” ở phần lịch sử phía trên đã được bài 82 bổ sung. Không cần tiếp tục lấy lại cùng các vòng hoặc ép sai khác ảnh xuống thấp hơn khi chưa thấy lỗi mới.

Phần mở rộng có thể làm tiếp: trang phục mesh khác hình dáng dùng chung chuyển động. Bài 34 mới chứng minh linked mesh giữa màu, bài 75 mới thay region đầu. Phép thử tiếp theo cần một biến thể mesh thực sự khác đường viền, kiểm tra liên kết/deform và tư thế khó; không tính đổi texture cùng hình là đạt mục này. Giữ lưu/export là phần chưa thực hành, không dùng bài mở rộng để tự đánh dấu hoàn tất toàn bộ kế hoạch.


## Cập nhật sau bài 87 — 08/09/2026

Bài 83 đã tạo khăn khác đường viền bằng linked mesh và deform riêng. Bài 84–85 gắn khăn vào robot, chỉnh draw order và weights tám đỉnh trên ba xương. Bài 86–87 có chuyển động trễ ở idle/walk, sửa đường cong và xem playback cùng chuyển tiếp hai chiều. Vì vậy mục trang phục mesh khác đường viền đã có bài cơ bản; không còn là mục chưa làm. Phạm vi vẫn chỉ là khăn, với vùng đuôi bị vai che trong một số tư thế, không phải mọi trang phục hoặc mọi pha chuyển.

Bước thực hành tiếp theo: kiểm tra giảm độ phân giải ảnh mesh mà giữ kích thước/biến dạng. Bài 81 mới chứng minh region; cần đối chứng mesh tại cùng pose trước/sau và phục hồi nguồn. Không lặp bài khăn đã đủ bằng chứng nếu không thấy lỗi mới. Lưu/mở lại/export vẫn là mốc có điều kiện; không yêu cầu người dùng mua license và không thay bằng JSON tự tạo.


Cập nhật sau bài 88: đã giảm ảnh mesh bốn đỉnh có weights và key Deform, xem năm pose trước/sau; khôi phục bằng Stretch cho cùng hình ở các mốc đối chứng và PNG gốc. Phần tiếp theo là phụ kiện Physics có ảnh hai tầng, vì bài 67 chỉ có xương con chưa gắn ảnh. Hướng dẫn thao tác tổng hợp đã được cập nhật trong docs/practical-guide.md.

Cập nhật sau bài 89: mesh khăn đã chịu Physics trên mid/tip, đối chứng Mix bật/tắt và xem 90 mẫu playback; Setup Mix 0 đã xác nhận cho cả hai. Còn kiểm tra idle/walk cũ và dừng mô phỏng ở pha tùy ý. Đây là một mesh chịu hai xương, không phải hai attachment độc lập.

Cập nhật sau bài 90: bốn mốc idle/walk giữ Mix 0 và góc key cũ; bản scarf-physics-stop giảm hai Mix từ 100 về 0 trong frame 6–12, xem 16 mẫu và 80 ảnh chậm. Đã thực hành trở về góc nền có thời hạn; chưa phải giữ nguyên tư thế mô phỏng. Còn xác nhận audio nghe được trong editor.
