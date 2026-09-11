# Audit backlog và ranh giới preview — 11/09/2026

## Kết luận

Thứ tự kỹ thuật hiện hợp lý: #5 → #6 → ba nhánh #7/#8/#10; chưa cần đảo roadmap. Preview cần tách rõ **khung #5**, **editor robot #12–14** và **biến dạng #15–20**. Có hai lệch tài liệu cần sửa và một nhóm yêu cầu UX cần cụ thể hóa trước khi dùng ảnh thiết kế làm tiêu chí implementation.

Phạm vi: đọc toàn bộ body issue #1–29, field GitHub Project 3, quan hệ `blockedBy` qua GitHub GraphQL, `backlog.json`, `execution-plan.md`, `scope.md`; tham chiếu README/workflow. Không sửa GitHub hoặc mã sản phẩm. Audit này không chứng nhận lại chất lượng implementation của #2–4 và không audit sâu contracts.

## Trạng thái thực tế

Snapshot GitHub ngày 11/09/2026:

| Nhóm | Issue | GitHub / Project |
| --- | --- | --- |
| Tracker | #1 | Open / Todo |
| Foundation đã bàn giao | #2, #3, #4 | Closed / Done; Readiness Ready |
| Công việc đủ đầu vào | #5 | Open / **In Progress**, Readiness Ready |
| Triển khai và kiểm chứng | #6–22 | Open / Todo, Blocked |
| Nghiên cứu tương lai | #23–29 | Open / Todo, Deferred |

Nguồn: [Project 3](https://github.com/users/hoangnb24/projects/3), [roadmap #1](https://github.com/hoangnb24/learn-spine/issues/1), [#5](https://github.com/hoangnb24/learn-spine/issues/5). `Readiness Ready` ở issue đã Done không có nghĩa là cần làm lại; đó là field điều kiện đầu vào tách với Status. Roadmap #1 ghi #5 Todo trong đoạn trạng thái trong khi Project đang In Progress; cần xác nhận có người đang triển khai trước khi giao trùng.

## Phát hiện cần xử lý

### P2 — Tài liệu điều phối trong repo còn trạng thái trước merge

`execution-plan.md:16` vẫn mời bắt đầu #2/#3/#4, bảng `:26–29` để #5 Blocked. `backlog.json:136` cũng là Blocked. `README.md:3` vẫn mô tả Foundation ở nhánh triển khai, chờ merge. GitHub #1 đã ghi merge PR #30 và #5 Ready. Người nhận việc chỉ đọc clone có thể chờ nhầm hoặc lặp nghiên cứu.

Đề xuất: cập nhật đoạn hiện trạng và #5 readiness, ghi thời điểm snapshot; thêm status/completedAt hoặc nói rõ backlog chỉ lưu readiness. Duy trì cùng một quy tắc cập nhật sau merge. Không cần xóa cạnh #4 → #5: dependency đã hoàn thành vẫn có giá trị truy vết.

### P2 — Spritesheet bị đặt sớm hơn backlog thực tế

`scope.md:14` ghi spritesheet ở giai đoạn 2, nhưng [#28](https://github.com/hoangnb24/learn-spine/issues/28) / `backlog.json:912` chỉ nghiên cứu spritesheet/video/engine sau quyết định #22. Gate 2 [#20](https://github.com/hoangnb24/learn-spine/issues/20) không có acceptance cho spritesheet.

Đề xuất: giai đoạn 2 tiếp tục project/player/chuỗi PNG; chuyển spritesheet về discovery sau MVP theo #28. Preview xuất file chỉ thể hiện project và PNG sequence là đầu ra dự kiến của workflow robot. Không hiển thị video/atlas/spritesheet như tính năng đã nằm trong MVP.

### P2 — Journey UX chưa đủ cụ thể để làm tiêu chí thiết kế và nghiệm thu

[#12](https://github.com/hoangnb24/learn-spine/issues/12), `backlog.json:358–368` hứa người dùng nạp art, chỉnh rig/key nhưng acceptance mở đầu bằng “load”, chưa phân biệt PNG tách bộ phận với mở project đóng gói. [#10](https://github.com/hoangnb24/learn-spine/issues/10) tập trung package storage; [#7](https://github.com/hoangnb24/learn-spine/issues/7) tập trung tạo/gắn rig. Vì thế vẫn có thể pass một bài chỉ nạp fixture đã đóng gói mà chưa chứng minh luồng người dùng đưa PNG mới.

Đề xuất bổ sung vào #12, phối hợp #7/#10: từ canvas trống → chọn nhiều PNG → xem danh sách assets/kích thước → xác nhận bố trí/pivot → tạo rig → lưu/mở lại. Có trạng thái sai định dạng, thiếu ảnh, chưa chọn đối tượng, project có thay đổi chưa lưu và lỗi lưu có thể phục hồi. Chốt owner nhập bytes/assets qua module API khi triển khai, không để UI tự tạo bản model riêng.

`README.md:25–29` yêu cầu người dùng mô tả chuyển động, xem tiến độ, phản hồi và so trước/sau, nhưng #12 chỉ nêu revision/save/error/dừng; #13 cung cấp adapter, không có cloud agent service. Đề xuất ghi rõ trong UX brief: agent chạy ở môi trường hỗ trợ bên ngoài; trang thể hiện kết nối, tác vụ, thay đổi, dừng job và hoàn tác. Ô chat/gửi prompt chạy ngay trong website là quyết định sản phẩm bổ sung, chưa được backlog hiện tại bảo đảm. “So trước/sau” cần chọn cách tối thiểu cụ thể (checkpoint + hai pose hoặc chuyển phiên bản), không mặc nhiên vẽ trình so sánh hoàn chỉnh.

### P3 — Cần làm rõ nghĩa của UI trong acceptance #13

`backlog.json:400` giao tích hợp editor thật cho T13 (= issue #14), nhưng `:403` của issue #13 nói “UI thấy cùng revision”. Không phải vòng dependency: harness độc lập đã được yêu cầu. Đề xuất chỉ rõ #13 kiểm tra với harness; #14 kiểm tra với editor sản phẩm. Giữ #12 và #13 phát triển độc lập như DAG hiện có.

## Kiểm tra DAG

28 task T01–T28: không chu trình; toàn bộ wave bằng wave sớm nhất tính lại từ dependencies. Tất cả quan hệ GitHub `blockedBy` khớp `backlog.json`; nội dung công việc/acceptance trong backlog đều có trong body issue tương ứng tại thời điểm đọc. Không phát hiện blocker kỹ thuật bị thiếu đủ bằng chứng để yêu cầu đổi DAG.

Thứ tự gợi ý:

1. #5 khung workspace; #6 model dùng chung.
2. Song song #7 commands, #8 evaluator, #10 storage. #9 nối tiếp #8; #11 nối tiếp #9.
3. #12 editor cần #7/#9/#10; #13 adapter cần #3/#7/#10/#11. Tích hợp hai bên ở #14, kiểm chứng robot.
4. Sau #14, #15 mesh và #16 IK chạy song song. #17 renderer sau #15; #18 diagnostics cần cả #15/#16. #19 đưa biến dạng vào tools/UI; #20 kiểm chứng khăn/thạch/chân trụ.
5. #21 đánh giá agent thực hiện workflow; #22 quyết định khả thi MVP từ bằng chứng. #23–29 là discovery, chưa phải implementation production.

Bằng chứng sơ đồ: `execution-plan.md:88–124`; [roadmap #1](https://github.com/hoangnb24/learn-spine/issues/1).

## Feature map cho nghiên cứu UX và design

| Mốc | Người dùng sẽ nhìn thấy/làm được | Issue sở hữu | Giới hạn cần giữ trong preview |
| --- | --- | --- | --- |
| Foundation | Hai entry Editor/Player mở được; khung trống có định hướng | #5 | Không animation, đăng nhập/backend hay triển khai production; các vùng UI là concept, chưa là tính năng vận hành |
| Robot workspace | Nạp art/project, cây xương/ảnh, chọn đối tượng, thuộc tính, timeline play/pause/scrub, sửa rig/key, undo/redo, save/recovery | #6–10, #12 | Dùng PNG tách sẵn; UI và agent sửa cùng dữ liệu |
| Agent quan sát | Render pose/chuỗi PNG, preview, trạng thái job/hủy, trạng thái kết nối/capabilities | #11, #13; editor integration #14 | Không hứa chat AI nhúng; native/fallback phải phản ánh kết quả thật |
| Robot usable | Tạo idle/wave, chỉnh cục bộ, xem playback, xuất project rồi mở player độc lập | #14 Gate 1 | Chưa gọi là toàn bộ MVP; cần bằng chứng giữ dữ liệu và nhịp giữa key |
| Deformation | Mesh, weights, deform, IK; đổi ảnh giữ rig; overlay và lỗi neo/chân/loop | #15–19 | Chẩn đoán kỹ thuật tách đánh giá thẩm mỹ; UI chỉ tối thiểu |
| Chứng minh sản phẩm | Khăn/thạch/chân trụ; agent tạo và sửa qua tools, kiểm chứng độc lập | #20–22 | Không tự tuyên bố gate đạt từ ảnh concept |
| Sau MVP | PSD, mixing/audio, skins/clipping, path constraints, physics, spritesheet/video/engine, ảnh phẳng | #23–29 | Chỉ nghiên cứu, không đưa vào thanh công cụ hiện hành như đã sắp có |

Nguồn: `scope.md:5–16`, `README.md:13–29`, [#5](https://github.com/hoangnb24/learn-spine/issues/5), [#12](https://github.com/hoangnb24/learn-spine/issues/12), [#19](https://github.com/hoangnb24/learn-spine/issues/19).

## Brief bàn giao design

Đề xuất hai hình chính: **A. Khung #5, trống** và **B. Trải nghiệm đích robot #12–14, có dữ liệu minh họa**. Hình B giúp hiểu vì sao khung A có cấu trúc đó; không dùng B để mở rộng acceptance #5. Có thể thêm một inset player độc lập và một inset lỗi lưu/kết nối agent chưa khả dụng.

Hình B ưu tiên canvas nhân vật ở giữa, cây đối tượng và assets bên trái, thuộc tính selection bên phải, timeline bên dưới. Tác vụ agent là vùng quan sát tiến độ và thay đổi có thể thu gọn; thông tin sửa cục bộ cần đọc được. Các hành động quan trọng: mở/nạp, phát/dừng, hoàn tác, lưu project, xem player và xuất PNG. Không đưa hash, raw revision, protocol name hoặc payload tool vào luồng chính nếu không giúp người dùng quyết định.

Trước khi code #12, bổ sung acceptance cho nhập PNG mới, lỗi/recovery, điều khiển bằng bàn phím/focus và viewport desktop tối thiểu. Đây là khuyến nghị UX cụ thể hóa scope hiện có, không phải bằng chứng các tiêu chí này đã được chốt.
