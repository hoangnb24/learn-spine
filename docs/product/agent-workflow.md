# Cách nhận và bàn giao một issue

Áp dụng cho công việc xây website animation trong repo này. GitHub issue và tài liệu trong repo là ngữ cảnh bền vững; không cần đọc cuộc hội thoại đã tạo dự án.

Đọc [WORKFLOW — Điều phối dự án](../../WORKFLOW.md) trước khi nhận việc. Theo chỉ dẫn cập nhật ngày 11/09/2026: mỗi issue có một sub-agent triển khai và một sub-agent nghiệm thu độc lập; Orchestrator giữ toàn cảnh, nhận kết luận nghiệm thu, merge, đóng issue và điều phối tiếp. Các bước kỹ thuật dưới đây thực hiện theo phân vai đó.

## Trước khi bắt đầu

1. Đọc đầy đủ issue, các dependency trực tiếp và PR bàn giao của chúng. Chỉ bắt đầu implementation khi đầu vào đã merge vào `main` và đáp ứng tiêu chí của dependency; trạng thái Closed một mình chưa đủ nếu issue bị đóng là not planned.
2. Đọc `docs/product/README.md`, `architecture.md`, `experiments.md` và các tài liệu cụ thể được link trong issue. Đường dẫn `platform/`, `prototypes/`, `contracts/`, `results/` có thể là đầu ra cần tạo; không mặc định đã tồn tại.
3. Checkout nhánh riêng từ `main` mới nhất, tên `codex/issue-<number>-<slug>`. Ghi phạm vi mình sở hữu trong PR. Có thể dùng worktree riêng để tránh nhiều agent sửa cùng checkout.
4. Khảo sát code thực tế trước khi quyết định. File/module trong issue xác định trách nhiệm dự kiến; nếu cần đổi cấu trúc, giữ ranh giới trách nhiệm và cập nhật hợp đồng/đường dẫn bàn giao.

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
- Khi merge/đóng issue, cập nhật Project và các issue được mở khóa. `Readiness` là snapshot được duy trì khi công việc thay đổi; hiện chưa có automation tự cập nhật field này. Cập nhật `backlog.json`/execution plan nếu dependency hoặc phạm vi thay đổi.

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
```

## Ranh giới sản phẩm

Thư mục hiện có ở root là tài liệu và bài thực hành Spine. Root `package.json` có Spine runtime phục vụ học; sản phẩm mới dưới `platform/` dùng lõi độc lập. Không sửa/xóa bằng chứng học hoặc tái sử dụng runtime vào sản phẩm theo mặc định. Không tự gửi art ra dịch vụ ngoài, publish hoặc mua dịch vụ trong một issue không bao gồm hành động đó.
