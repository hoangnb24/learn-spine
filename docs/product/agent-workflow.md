# Cách nhận và bàn giao một issue

Áp dụng cho công việc xây website animation trong repo này. GitHub issue và tài liệu trong repo là ngữ cảnh bền vững; không cần đọc cuộc hội thoại đã tạo dự án.

Đọc [WORKFLOW — Điều phối dự án](../../WORKFLOW.md) trước khi nhận việc. Theo chỉ dẫn cập nhật ngày 11/09/2026: mỗi issue có một sub-agent triển khai và một sub-agent nghiệm thu độc lập; Orchestrator giữ toàn cảnh, nhận kết luận nghiệm thu, merge, đóng issue và điều phối tiếp. Orchestrator tổng hợp bằng chứng, ra chỉ thị cụ thể và giao sub-agent cập nhật issue/tài liệu; kiểm tra kết quả và chịu trách nhiệm toàn cục. Các bước dưới đây thực hiện theo phân vai đó.

## Trước khi bắt đầu

1. Đọc đầy đủ issue, các dependency trực tiếp và PR bàn giao của chúng. Chỉ bắt đầu implementation khi đầu vào đã merge vào `main` và đáp ứng tiêu chí của dependency; trạng thái Closed một mình chưa đủ nếu issue bị đóng là not planned.
2. Đọc `docs/product/README.md`, `architecture.md`, `experiments.md` và các tài liệu cụ thể được link trong issue. Đường dẫn `platform/`, `prototypes/`, `contracts/`, `results/` có thể là đầu ra cần tạo; không mặc định đã tồn tại.
3. Checkout nhánh riêng từ `main` mới nhất, tên `codex/issue-<number>-<slug>`. Ghi phạm vi mình sở hữu trong PR. Có thể dùng worktree riêng để tránh nhiều agent sửa cùng checkout.
4. Khảo sát code thực tế trước khi quyết định. File/module trong issue xác định trách nhiệm dự kiến; nếu cần đổi cấu trúc, giữ ranh giới trách nhiệm và cập nhật hợp đồng/đường dẫn bàn giao.
5. Đọc kết luận đối chiếu kế hoạch gần nhất nếu có. Báo Orchestrator khi code/API/dependency hoặc công việc còn lại khác mô tả issue; không tiếp tục làm theo giả định cũ chỉ vì nó nằm trong backlog. Orchestrator chốt hướng điều chỉnh và giao sub-agent cập nhật kế hoạch theo mục “Đối chiếu thực tế và định hình lại kế hoạch” trong WORKFLOW.

## Làm song song

- Quan hệ GitHub `blocked by` là thứ tự kỹ thuật. `Wave` chỉ là đợt sớm nhất theo dependency, không phải lịch cứng; một nhánh được tiếp tục ngay khi đầu vào của nó sẵn sàng.
- Issue cùng đợt không mặc nhiên được sửa cùng file. Mỗi issue có ownership; không revert thay đổi của người khác. Các file chung như lockfile, model index và evaluator entry phải phối hợp hoặc tích hợp tuần tự.
- Sau khi hợp đồng T03 được chốt, dùng interface/fixture đã bàn giao. Nếu cần thay đổi tương thích, cập nhật tài liệu và báo các issue phụ thuộc. Không tự copy một phiên bản model vào module riêng.
- Issue `Deferred` chỉ cho phép công việc discovery được mô tả sau mốc quyết định; chưa ủy quyền xây toàn bộ tính năng tương lai.

## Kiểm tra và kết thúc

- Chạy các lệnh do workspace hiện tại cung cấp và test đặc thù trong issue. Nêu chính xác lệnh, môi trường, commit và kết quả; không ghi pass cho việc chưa chạy.
- Ghi ảnh/playback khi issue yêu cầu kiểm tra hình. Tool success, JSON hợp lệ và screenshot một pose không thay thế playback hay kiểm tra mở lại project.
- Không tự hạ ngưỡng sau khi thử thất bại. Ghi lỗi, nguyên nhân, corrective issue và dependency liên quan. Gate chỉ được đánh dấu đạt khi có đủ bằng chứng.
- PR liên kết issue, mô tả kết quả, thay đổi interface, kiểm tra, giới hạn và cách tái lập. Commit tất cả fixture/script nhỏ cần thiết; hiện vật lớn phải có URL bền vững truy cập được và hash, không chỉ đường dẫn `/tmp` hoặc máy cá nhân.
- Sau quyết định merge/đóng issue và mở downstream của Orchestrator, sub-agent được giao cập nhật Project và các issue liên quan theo chỉ thị. Không tự mở khóa issue từ kết quả cập nhật. `Readiness` là snapshot được duy trì khi công việc thay đổi; hiện chưa có automation tự cập nhật field này. Cập nhật `backlog.json`/execution plan nếu dependency hoặc phạm vi thay đổi.

## Khi được giao cập nhật thông tin và kế hoạch

- Nhận chỉ thị từ Orchestrator gồm bằng chứng/quyết định làm căn cứ, issue và tài liệu cần sửa, phạm vi thay đổi, phần giữ nguyên và đầu ra. Ownership bao gồm từng issue/file; không sửa đồng thời với owner khác hoặc ghi đè thay đổi của họ. Khi đổi owner, bàn giao và kết thúc ownership cũ trước.
- Cập nhật issue body, checklist, bình luận, Project, dependency, roadmap, backlog, execution plan, tài liệu và bản đối chiếu trong `docs/product/reconciliation/` theo phạm vi được giao. Không chỉ thêm bình luận trong khi mô tả giao việc vẫn lỗi thời.
- Không tự đổi scope, acceptance hoặc ngưỡng gate; không tự nghiệm thu kỹ thuật hay quyết định merge, đóng issue, mở downstream. Nếu phát hiện chênh lệch ngoài chỉ thị, báo Orchestrator để chốt cách xử lý; quyết định sản phẩm vẫn thuộc chủ dự án.
- Bàn giao diff/PR, liên kết các nguồn đã sửa, căn cứ, kết quả kiểm tra nhất quán và phần còn chờ. Orchestrator kiểm tra kết quả; PR có reviewer độc lập theo WORKFLOW, kiểm tra bổ sung được giao độc lập khi cần. Người cập nhật không dùng việc đồng bộ trạng thái để thay kết luận nghiệm thu.

## Mẫu bàn giao trong PR hoặc issue

```text
Kết quả:
- Điều đã hoàn thành và tiêu chí nào đạt/chưa đạt.

Đầu vào cho issue tiếp theo:
- Commit/PR; module/API/schema mới; fixture và đường dẫn tài liệu.

Cách tái lập:
- Yêu cầu môi trường; lệnh cài/chạy/test; vị trí kết quả.

Bằng chứng:
- Test output, ảnh/playback, số đo; liên kết hiện vật bền vững.

Giới hạn:
- Phần chưa thử, lỗi còn mở, issue chặn và điều kiện tiếp tục.

Chênh lệch so với kế hoạch:
- Giả định không còn đúng, việc đã làm thêm hoặc còn thiếu, issue/dependency/tài liệu cần cập nhật; ghi rõ nếu không có.
```

## Ranh giới sản phẩm

Thư mục hiện có ở root là tài liệu và bài thực hành Spine. Root `package.json` có Spine runtime phục vụ học; sản phẩm mới dưới `platform/` dùng lõi độc lập. Không sửa/xóa bằng chứng học hoặc tái sử dụng runtime vào sản phẩm theo mặc định. Không tự gửi art ra dịch vụ ngoài, publish hoặc mua dịch vụ trong một issue không bao gồm hành động đó.
