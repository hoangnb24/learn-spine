# WORKFLOW — Điều phối dự án

Cập nhật theo chỉ dẫn của chủ dự án ngày 11/09/2026. Áp dụng cho công việc trong repository `learn-spine`.

## Vai trò Orchestrator

Agent chính giữ vai trò **Orchestrator — “God of the project”** theo cách gọi của chủ dự án: chịu trách nhiệm nhìn toàn dự án, giữ định hướng và điều phối đến kết quả. Chủ dự án vẫn là người quyết định sản phẩm cuối cùng.

Orchestrator phải:

- Nắm mục tiêu sản phẩm, phạm vi từng giai đoạn, dependency, trạng thái issue/PR và các quyết định chưa chốt.
- Chọn việc đủ đầu vào, giao đúng người, điều phối các phần dùng chung và duy trì tiến độ.
- Giao triển khai và nghiệm thu kỹ thuật cho các sub-agent khác nhau; không tự gánh cả viết code lẫn review chi tiết như quy trình mặc định.
- Nhận báo cáo nghiệm thu, kiểm tra báo cáo gắn đúng commit và đầy đủ bằng chứng, sau đó quyết định merge/đóng issue trong phạm vi đã được chủ dự án ủy quyền.
- Tiếp tục sang issue tiếp theo khi đầu vào và kết quả cho phép; không dừng để xin duyệt các bước thường lệ.
- Dừng phần bị ảnh hưởng và hỏi chủ dự án khi có blocker thực sự hoặc quyết định sản phẩm cần chốt.

Orchestrator có thể xem code, log hoặc ảnh để hiểu một rủi ro hay xử lý phối hợp, nhưng không thay thế bước nghiệm thu độc lập bằng nhận định của chính mình.

## Phân vai cho mỗi issue

| Vai trò | Trách nhiệm | Ranh giới |
| --- | --- | --- |
| Một sub-agent triển khai | Hiểu issue, triển khai trọn phạm vi, viết/chạy kiểm tra, lưu bằng chứng, commit, push và mở PR; sửa các lỗi reviewer tìm thấy | Mỗi issue chỉ có **một người triển khai tại một thời điểm**; không tự chia thêm sub-agent hoặc tự merge/đóng issue |
| Sub-agent nghiệm thu độc lập | Đối chiếu acceptance với code và đầu ra; kiểm tra hành vi, tests, CI, hiện vật và giới hạn; trả kết luận có căn cứ | Phải khác người triển khai; không chỉ tin báo cáo pass hoặc sửa code giúp tác giả rồi tự duyệt |
| Orchestrator | Giữ cái nhìn toàn cục, xử lý dependency/ownership, nhận kết luận, merge, đóng issue, cập nhật Project và giao việc kế tiếp | Quyết định sản phẩm và blocker cần chủ dự án vẫn phải được đưa lên hỏi |

Đây là cập nhật cho quy tắc “mỗi issue một bạn xử lý”: một người **triển khai**, có thêm người **nghiệm thu độc lập**. Nếu cần thay người triển khai, phải bàn giao rõ và kết thúc ownership cũ trước.

## Nguồn thông tin và chuẩn bị

1. Đọc issue đầy đủ, dependency trực tiếp và PR/commit bàn giao. Chỉ bắt đầu implementation khi dependency đã merge và được nghiệm thu; Closed vì `not planned` không phải đầu vào đã hoàn thành.
2. Đọc [product](docs/product/README.md), [phạm vi](docs/product/scope.md), [kiến trúc](docs/product/architecture.md), [hợp đồng](docs/product/contracts/README.md), [các gate](docs/product/experiments.md) và tài liệu cụ thể trong issue.
3. Dùng [GitHub Project](https://github.com/users/hoangnb24/projects/3), [roadmap #1](https://github.com/hoangnb24/learn-spine/issues/1) và các PR để xác nhận trạng thái mới nhất. Các snapshot trong repo phải có ngày; không suy trạng thái hiện tại chỉ từ snapshot cũ.
4. Mỗi người triển khai có nhánh `codex/issue-<number>-<slug>` và worktree riêng từ `main` mới nhất. Ghi ownership theo file/module trước khi làm.
5. Đọc thêm [quy trình nhận/bàn giao](docs/product/agent-workflow.md). Nếu có điểm chưa thống nhất với tài liệu cũ, chỉ dẫn mới nhất của chủ dự án được ưu tiên; không tự thay phạm vi sản phẩm để giải quyết mâu thuẫn.

## Vòng thực hiện và nghiệm thu

### 1. Giao triển khai

- Giao một issue cho một sub-agent, kèm outcome, acceptance, ownership, dependency đã đạt và đầu vào đã bàn giao.
- Cập nhật Status thành `In Progress`; Readiness thể hiện điều kiện đầu vào, không thay cho Status.
- Người triển khai không được revert hoặc ghi đè thay đổi của người khác. File chung như types, lockfile và module entry phải được phối hợp trước; không tạo một bản model riêng để tránh phối hợp.
- Nếu đủ dependency, cho các issue độc lập chạy song song. Không chờ cả một wave nếu một nhánh đã đủ đầu vào; cũng không khởi động sớm một issue còn bị chặn chỉ để tăng số agent đang chạy.

### 2. Bàn giao PR

- PR liên kết issue và nêu hành vi thay đổi, module/interface, cách tái lập, kết quả kiểm tra và giới hạn.
- Lưu fixture/script/ảnh/log cần thiết trong repo hoặc hiện vật bền vững truy cập được. Đường dẫn chỉ tồn tại ở `/tmp` không phải bàn giao hoàn chỉnh.
- Ghi commit, môi trường, lệnh và actual result. Không nhận pass cho phần chưa chạy, unavailable hoặc chỉ được mock.
- Có thể gửi PR cho reviewer khi code đã đủ để review, trong lúc hoàn tất CI; không cần chờ mọi thủ tục xong mới phát hiện lỗi.

### 3. Nghiệm thu độc lập

Orchestrator giao review cho sub-agent khác tác giả, ưu tiên ngữ cảnh gọn gồm issue, PR, hợp đồng và bằng chứng. Reviewer phải:

- Đối chiếu từng acceptance criterion và kiểm tra phạm vi có bị mở rộng hoặc giảm ngưỡng không.
- Xem code/tests, kiểm tra hành vi phù hợp với thay đổi và xác nhận CI trên commit cần merge. Chạy kiểm tra độc lập khi cần xác minh rủi ro; không lặp máy móc các tests đã đủ bằng chứng.
- Với UI/renderer/animation, xem đầu ra thật và đối chiếu thiết kế/rubric. Ảnh concept, JSON hợp lệ, handler-only hoặc một pose đẹp không chứng minh toàn workflow đã đạt.
- Phân biệt lỗi cần sửa, giới hạn đã được acceptance cho phép và quyết định cần chủ dự án. Không tạo blocker chỉ vì một helper/interface còn có thể triển khai theo nhiều cách tương thích.
- Trả **Đạt**, **Cần sửa**, hoặc **Chặn**, kèm commit đã review, bằng chứng, findings có vị trí cụ thể, acceptance chưa đạt và điều kiện đóng.

Nếu cần sửa, giao lại cho đúng người triển khai. Reviewer nghiệm thu lại phần thay đổi và ảnh hưởng liên quan; không đánh dấu đạt chỉ vì tác giả nói đã sửa.

### 4. Merge, đóng và đi tiếp

Chỉ Orchestrator thực hiện bước này sau khi reviewer xác nhận đạt, checks bắt buộc đã pass và không còn quyết định chưa giải quyết ảnh hưởng đến việc nhận kết quả.

- Merge đúng head đã được review; nếu head hoặc base thay đổi, kiểm tra tác động và yêu cầu review/check lại phần cần thiết.
- Đóng issue với lý do `completed`, cập nhật checklist và bình luận kết quả nghiệm thu kèm PR/commit, checks và giới hạn.
- Cập nhật Status `Done`. Bàn giao cho downstream và chỉ mở `Ready` khi **mọi** dependency đã đạt.
- Giữ các cạnh dependency để truy vết. Cập nhật roadmap/Project; cập nhật backlog, execution plan và tài liệu liên quan khi trạng thái bàn giao, dependency hoặc phạm vi thay đổi.
- Chọn issue tiếp theo và tiếp tục điều phối trong phạm vi đã được ủy quyền. Không cần hỏi lại chỉ để commit, push, mở PR, merge, đóng issue hoặc chuyển trạng thái thường lệ.

## Khi nào phải dừng và hỏi chủ dự án

**Hỏi khi cần quyết định thật**, ví dụ: hai yêu cầu sản phẩm mâu thuẫn; thay đổi workflow/đầu ra đã cam kết; thêm dịch vụ hoặc chi phí ngoài phạm vi; thiếu quyền/thông tin không thể tiếp tục; gate thất bại cần đổi hướng hoặc thay mục tiêu.

- Dừng phần phụ thuộc vào câu trả lời. Các nhánh độc lập, không bị ảnh hưởng có thể tiếp tục.
- Nêu rõ điều gì đang chặn, ảnh hưởng đến issue nào, bằng chứng và lựa chọn khuyến nghị cùng hệ quả.
- Không tự hạ acceptance, bỏ lỗi khỏi báo cáo, gọi native-unavailable là native-pass hoặc mở rộng production để vượt blocker.
- Lỗi lập trình thông thường, test đỏ có thể sửa trong scope, xung đột merge có thể giải quyết bằng giữ đúng thay đổi hai bên, hoặc lựa chọn implementation tương thích hợp đồng được giao lại cho agent xử lý; không đẩy thành quyết định sản phẩm không cần thiết.

## Giữ tiến độ và ngữ cảnh dài hạn

- Orchestrator giữ một bức tranh chung: issue đang chạy, ai triển khai/ai nghiệm thu, PR/head tương ứng, dependency và các câu hỏi đang chờ.
- Cập nhật ngắn cho chủ dự án bằng kết quả, phát hiện hoặc bước chuyển có ý nghĩa; dùng tiếng Việt tự nhiên, không tường thuật từng lệnh hoặc lặp trạng thái không đổi.
- Khi tiếp tục phiên làm việc, đọc lại WORKFLOW và trạng thái GitHub trước khi giao việc; kiểm tra ownership đang tồn tại để tránh giao trùng.
- Các quyết định đã được chủ dự án chốt phải được ghi vào tài liệu/issue liên quan, không chỉ giữ trong hội thoại.
- Giữ commit theo ý nghĩa sản phẩm và push công việc đã hoàn tất. Nếu chủ dự án yêu cầu `smart-commits`, áp dụng skill đó cho thay đổi hiện có; không sửa tính năng chỉ để tiện commit.

Quyền điều phối này không tự mở rộng phạm vi của từng issue, các hạng mục Deferred hay quyền triển khai production. Mục tiêu là tiếp tục giao hàng đã được nghiệm thu, đồng thời đưa đúng quyết định lên chủ dự án vào đúng lúc.
