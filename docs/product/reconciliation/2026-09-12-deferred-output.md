# Đối chiếu — hoãn quyết định đầu ra

Trạng thái hiện hành sau PR #78: #24/#73 Done/completed; #74 In Progress/Ready, #75 Todo/Blocked; #22 và audio/Polish/các discovery khác vẫn Deferred. Xem mốc nghiệm thu và ownership cuối tài liệu.

## Lịch sử quyết định đầu ra và mở discovery

Ngày 12/09/2026 — **DEFERRED BY OWNER**. Chủ dự án hoãn chọn nơi sử dụng, đầu ra animation và logic tương ứng đến khi có nhu cầu thực tế. Trọng tâm là tạo, xem và sửa ngay trên trang. Lưu/mở lại, ZIP và Player là khả năng hiện có, không phải nhu cầu đầu ra đã chốt. #22 OPEN/Todo/Deferred; #23 và #25–#29 Deferred, #28 chỉ xem lại khi có nhu cầu đầu ra thực. #51 và #52 Todo/Deferred: chủ dự án xác nhận Polish để sau, gồm cả đo/profile baseline và tối ưu. Chủ dự án sau đó cho phép #24 In Progress/Ready: discovery mixing/chuyển tiếp/events metadata phục vụ tạo/xem/sửa trên trang; audio tách #70 Todo/Deferred. Sole implementer `/root/implement_issue24`, reviewer `/root/review_issue24`. Đầu vào #8/#16/#19 đã merged; bỏ dependency #22 cho riêng #24. Sau nghiệm thu discovery, Orchestrator tiếp tục các implementation tasks trong phạm vi tạo/xem/sửa đến khi gặp quyết định sản phẩm thực sự; không cần chốt đầu ra/MVP #22. Không tự mở #25/#26 hoặc toàn backlog. Không duyệt MVP hoặc production.

Mốc main căn cứ: 564d9eaea2ad6a98fb74672ca9c18931e5b720ac; [PR #68](https://github.com/hoangnb24/learn-spine/pull/68) còn mở, chưa merge tại thời điểm lập bản ghi này. Giả định đề xuất 11/09 PNG→ZIP/web Player đã superseded. Đồng bộ ADR, README, scope, execution plan và backlog; updater riêng đồng bộ GitHub theo chỉ thị Orchestrator.

Giữ nguyên [evidence ba gate](2026-09-11-three-gates.md), historical reports, dependency và acceptance kỹ thuật; performance vẫn FAIL 17.8/17.5 ms so 16.7 ms. Không phát triển hoặc xóa code. Không thêm cạnh #22 cho Polish.

Ownership đợt docs được bàn giao từ tác giả PR #68 sang updater docs; #51 và #52 để sau theo xác nhận tiếp theo của chủ dự án cùng ngày, chưa giao triển khai hoặc chọn issue thay thế. Merge tài liệu chỉ ghi nhận hoãn, không đóng #22 hoặc duyệt MVP.

Kiểm tra đợt tài liệu 12/09: parse backlog JSON thành công; 49 relative Markdown targets tồn tại; git diff --check exit 0. Không chạy lại code suites hoặc native gates vì không đổi code/evidence.

Cập nhật tiếp theo cùng ngày trên main 9850dd2 sau PR #68: chủ dự án xác nhận #51 cũng chưa cần làm vì Polish để sau. Trạng thái Ready từng ghi trong PR #68 được thay bằng Deferred; #52 giữ Deferred. Chưa giao code hoặc tự chọn việc thay thế; dependency và ngưỡng giữ nguyên. Kiểm tra cập nhật này: backlog JSON parse thành công, git diff --check đạt; không chạy code suites.

## Mở nhánh mixing theo chỉ thị tiếp theo — 12/09/2026

Mốc main `5b692111cb99d0dbeb3fd70c6732500b9fbed726` sau PR #69. Chủ dự án sau đó cho phép #24 In Progress/Ready: discovery mixing/chuyển tiếp/events metadata phục vụ tạo/xem/sửa trên trang; audio tách #70 Todo/Deferred. Sole implementer `/root/implement_issue24`, reviewer `/root/review_issue24`. Đầu vào #8/#16/#19 đã merged; bỏ dependency #22 cho riêng #24. Sau nghiệm thu discovery, Orchestrator tiếp tục các implementation tasks trong phạm vi tạo/xem/sửa đến khi gặp quyết định sản phẩm thực sự; không cần chốt đầu ra/MVP #22. Không tự mở #25/#26 hoặc toàn backlog.

#24 chỉ làm spec/truth tables và prototype số walk+wave/stop chân trụ, không sửa production evaluator. Audio clock, stop/restart, kiểm nghe và acceptance audio được giữ trong #70, chưa nghiệm thu. #22/#23/#25–#29/#51/#52/#70 vẫn Deferred. Kết quả gate và acceptance lịch sử giữ nguyên.

## Nghiệm thu discovery và giao implementation — 12/09/2026

#24 đã CLOSED/completed sau nghiệm thu discovery Đạt tại `d539f8d85dd5f66dfd78d50a8f01d4e1c1cee2b3`; [CI Mixing numeric 34685586726 SUCCESS](https://github.com/hoangnb24/learn-spine/actions/runs/34685586726), [PR #72](https://github.com/hoangnb24/learn-spine/pull/72) merge main `a25dc95cc6588de5c5a3389fff207a6d9131e0a1`. Đây chỉ là spec/prototype transform và event metadata, chưa nghiệm thu composition sản phẩm/native/UI.

#73 In Progress/Ready triển khai canonical data + Session + evaluator; sole implementer `/root/implement_composition_core`, reviewer `/root/review_composition_core`. #74 Todo/Blocked chờ #73: native tools/observation/conservative bounds; #75 Todo/Blocked chờ #73 và #74: editor/create/view/edit và native→UI roundtrip. #74/#75 chưa giao owner. Audio #70 vẫn Todo/Deferred dù #24 đã xong; #22/#23/#25–#29/#51/#52 tiếp tục Deferred.

Trạng thái #24 In Progress ở các mốc phía trên là lịch sử, thay bằng Done tại mốc này. User đã cho phép implementation create/view/edit sau discovery, không cần chốt đầu ra/MVP #22. A sở hữu chung schema/Session/evaluator để tránh công bố capability chưa chạy được; B/C tiêu thụ contract A. Bounds B bắt buộc hỗ trợ fixture v1 chuẩn walk+wave/complete-coverage frozen transition/stop và valid multi-track additive trong miền scale/IK; không được unsupported toàn composition. Không sửa source/prototype/contract hoặc kết quả gate trong đợt planning này.

## Nghiệm thu core và mở native/observation — 12/09/2026

#73 core đã nghiệm thu đầy đủ: [PR #77](https://github.com/hoangnb24/learn-spine/pull/77), exact `b05f4dbae62cf4370bfdfe1a0f61720903f4fd6a`, merge `bfff5e5fcd65371ed9baffd0c891aa54bba7e305`, CI 34686490771/34686490757/34686489418 SUCCESS. Follow-up [PR #78](https://github.com/hoangnb24/learn-spine/pull/78) được nghiệm thu Đạt tại `ec06775147f3e3fa76c1fa601b9a44de8b340158`, CI 34686680117/34686680189/34686668168 SUCCESS, merge `d2cf8ed339353d1029481c925aec7017d341bcbf`. Lỗi compile legacy `Evaluator` phát hiện sau PR #77 đã sửa bằng `TargetEvaluator extends Evaluator`; kiểm tra contract/mock-consumers được thêm vào CI. Handoff core đã được nhận, không còn chờ follow-up compatibility.

#73 CLOSED/completed · Done/Ready. #74 In Progress/Ready: sole implementer `/root/implement_composition_tools`, reviewer `/root/review_composition_tools`; đã cho phép triển khai đầy đủ scope native tools/observation/bounds sau khi core và compatibility fix được nhận. #75 Todo/Blocked chờ #74 (#73 đã đạt), chưa giao owner. Native adapter/observation/UI composition chưa nghiệm thu. #22/#23/#25–#29/#51/#52/#70 giữ Deferred.

Các snapshot trước PR #78 phía trên giữ lịch sử. Bridge capability filter và hai observation guards do #73 thêm vẫn là ranh giới tương thích: #74 chỉ thay khi có target handling và capability thực tế, không fallback bỏ qua target. Không đổi acceptance gate hoặc nhận native/UI từ kết quả core.
