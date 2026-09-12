# Đối chiếu — hoãn quyết định đầu ra

Ngày 12/09/2026 — **DEFERRED BY OWNER**. Chủ dự án hoãn chọn nơi sử dụng, đầu ra animation và logic tương ứng đến khi có nhu cầu thực tế. Trọng tâm là tạo, xem và sửa ngay trên trang. Lưu/mở lại, ZIP và Player là khả năng hiện có, không phải nhu cầu đầu ra đã chốt. #22 OPEN/Todo/Deferred; #23 và #25–#29 Deferred, #28 chỉ xem lại khi có nhu cầu đầu ra thực. #51 và #52 Todo/Deferred: chủ dự án xác nhận Polish để sau, gồm cả đo/profile baseline và tối ưu. Chủ dự án sau đó cho phép #24 In Progress/Ready: discovery mixing/chuyển tiếp/events metadata phục vụ tạo/xem/sửa trên trang; audio tách #70 Todo/Deferred. Sole implementer `/root/implement_issue24`, reviewer `/root/review_issue24`. Đầu vào #8/#16/#19 đã merged; bỏ dependency #22 cho riêng #24. Sau nghiệm thu discovery, Orchestrator tiếp tục các implementation tasks trong phạm vi tạo/xem/sửa đến khi gặp quyết định sản phẩm thực sự; không cần chốt đầu ra/MVP #22. Không tự mở #25/#26 hoặc toàn backlog. Không duyệt MVP hoặc production.

Mốc main căn cứ: 564d9eaea2ad6a98fb74672ca9c18931e5b720ac; [PR #68](https://github.com/hoangnb24/learn-spine/pull/68) còn mở, chưa merge tại thời điểm lập bản ghi này. Giả định đề xuất 11/09 PNG→ZIP/web Player đã superseded. Đồng bộ ADR, README, scope, execution plan và backlog; updater riêng đồng bộ GitHub theo chỉ thị Orchestrator.

Giữ nguyên [evidence ba gate](2026-09-11-three-gates.md), historical reports, dependency và acceptance kỹ thuật; performance vẫn FAIL 17.8/17.5 ms so 16.7 ms. Không phát triển hoặc xóa code. Không thêm cạnh #22 cho Polish.

Ownership đợt docs được bàn giao từ tác giả PR #68 sang updater docs; #51 và #52 để sau theo xác nhận tiếp theo của chủ dự án cùng ngày, chưa giao triển khai hoặc chọn issue thay thế. Merge tài liệu chỉ ghi nhận hoãn, không đóng #22 hoặc duyệt MVP.

Kiểm tra đợt tài liệu 12/09: parse backlog JSON thành công; 49 relative Markdown targets tồn tại; git diff --check exit 0. Không chạy lại code suites hoặc native gates vì không đổi code/evidence.

Cập nhật tiếp theo cùng ngày trên main 9850dd2 sau PR #68: chủ dự án xác nhận #51 cũng chưa cần làm vì Polish để sau. Trạng thái Ready từng ghi trong PR #68 được thay bằng Deferred; #52 giữ Deferred. Chưa giao code hoặc tự chọn việc thay thế; dependency và ngưỡng giữ nguyên. Kiểm tra cập nhật này: backlog JSON parse thành công, git diff --check đạt; không chạy code suites.

## Mở nhánh mixing theo chỉ thị tiếp theo — 12/09/2026

Mốc main `5b692111cb99d0dbeb3fd70c6732500b9fbed726` sau PR #69. Chủ dự án sau đó cho phép #24 In Progress/Ready: discovery mixing/chuyển tiếp/events metadata phục vụ tạo/xem/sửa trên trang; audio tách #70 Todo/Deferred. Sole implementer `/root/implement_issue24`, reviewer `/root/review_issue24`. Đầu vào #8/#16/#19 đã merged; bỏ dependency #22 cho riêng #24. Sau nghiệm thu discovery, Orchestrator tiếp tục các implementation tasks trong phạm vi tạo/xem/sửa đến khi gặp quyết định sản phẩm thực sự; không cần chốt đầu ra/MVP #22. Không tự mở #25/#26 hoặc toàn backlog.

#24 chỉ làm spec/truth tables và prototype số walk+wave/stop chân trụ, không sửa production evaluator. Audio clock, stop/restart, kiểm nghe và acceptance audio được giữ trong #70, chưa nghiệm thu. #22/#23/#25–#29/#51/#52/#70 vẫn Deferred. Kết quả gate và acceptance lịch sử giữ nguyên.
