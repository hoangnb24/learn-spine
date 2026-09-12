# Phạm vi theo giai đoạn

Ngày 12/09/2026 — **DEFERRED BY OWNER**. Chủ dự án hoãn chọn nơi sử dụng, đầu ra animation và logic tương ứng đến khi có nhu cầu thực tế. Trọng tâm là tạo, xem và sửa ngay trên trang. Lưu/mở lại, ZIP và Player là khả năng hiện có, không phải nhu cầu đầu ra đã chốt. #22 OPEN/Todo/Deferred; #23 và #25–#29 Deferred, #28 chỉ xem lại khi có nhu cầu đầu ra thực. #51 và #52 Todo/Deferred: chủ dự án xác nhận Polish để sau, gồm cả đo/profile baseline và tối ưu. #24 đã CLOSED/completed sau nghiệm thu discovery Đạt tại `d539f8d85dd5f66dfd78d50a8f01d4e1c1cee2b3`; [CI Mixing numeric 34685586726 SUCCESS](https://github.com/hoangnb24/learn-spine/actions/runs/34685586726), [PR #72](https://github.com/hoangnb24/learn-spine/pull/72) merge main `a25dc95cc6588de5c5a3389fff207a6d9131e0a1`. Đây chỉ là spec/prototype transform và event metadata, chưa nghiệm thu native/UI composition; core #73 đã được nhận theo cập nhật dưới. #73 CLOSED/completed · Done/Ready. #74 In Progress/Ready: sole implementer `/root/implement_composition_tools`, reviewer `/root/review_composition_tools`; đã cho phép triển khai đầy đủ scope native tools/observation/bounds sau khi core và compatibility fix được nhận. #75 Todo/Blocked chờ #74 (#73 đã đạt), chưa giao owner. Native adapter/observation/UI composition chưa nghiệm thu. #22/#23/#25–#29/#51/#52/#70 giữ Deferred. Không duyệt MVP hoặc production. Bảng dưới là phạm vi kỹ thuật từng đề xuất, chưa phải sản phẩm được duyệt.

## Phạm vi hẹp được đề xuất

| Nhóm | Trong phương án đề nghị | Ngoài phương án / chưa được nhận |
| --- | --- | --- |
| Art | PNG tách sẵn với bố trí/pivot, trong giới hạn storage; full/half texture có mẫu giữ geometry | PSD/sync layer, tự tách ảnh phẳng/sinh art bị che |
| Rig | Region, xương cha/con; mesh/bind/weights; IK hai xương theo miền hợp đồng | Skins/linked mesh/clipping, path/transform constraints, mọi miền scale |
| Animation | Transform keys/curves, idle/wave, deform phụ kiện mềm authored | Mixing/additive/transitions/events/audio; physics chưa thử |
| Agent/UI | Dùng chung Session, native create→observe→edit trong môi trường đã thử; UI cơ bản và undo/checkpoints | Mọi browser/agent; native cancellation đã chứng minh; editor ngang Spine |
| Quan sát | PNG/preview/sequence, pose/diagnostics gắn revision; region corner supplement khi cần | Default diagnostics bao mọi lỗi/mọi điểm/mọi thời điểm |
| Lưu/đầu ra | IndexedDB + ZIP + web Player có sẵn; chưa chốt nhu cầu đầu ra | Cloud/cộng tác, spritesheet/video/game-engine exporter; history trong ZIP |
| Chất lượng | Người xem nhận chuyển động, public evidence và ZIP reopen; giữ ngưỡng mẫu gate | Cam kết 60 fps, reliability thống kê, ROI hoặc production readiness |

Gate 1 chức năng được nhận nhưng performance vẫn FAIL 17.8/17.5 ms so 16.7 ms; #51 và #52 Deferred theo xác nhận để Polish về sau ngày 12/09. Đề xuất tiếp tục phạm vi chức năng không đổi kết quả đo hoặc hạ ngưỡng. Gate 2 physics NOT TESTED và bridge không native pass; Gate 3 7/9 đạt ngưỡng thử nghiệm, chưa tự chốt MVP feasible.

## Phần sau quyết định

Theo [quyết định #22](decisions/mvp.md), #23 và #25–#29 vẫn Deferred; #24 Done/completed trong phạm vi discovery mixing/transitions/events metadata; core #73 đã đạt, triển khai tiếp #74→#75, audio #70 Deferred; #28 chỉ xem lại khi có nơi sử dụng và nhu cầu đầu ra thực tế. #51 và #52 Todo/Deferred; cả đo/profile baseline và tối ưu đều để sau, đã chọn #24 theo chỉ thị tiếp theo, không tự mở các nhánh khác. [Đối chiếu 12/09](reconciliation/2026-09-12-deferred-output.md).

## Bộ mẫu làm chuẩn

| Mẫu | Giá trị kiểm tra | Tham chiếu |
| --- | --- | --- |
| Robot idle/wave | Rig, nhịp, ảnh gắn xương, sửa theo feedback | [Bộ robot](../../exercises/robot/editor-review/README.md) |
| Robot chân trụ | IK, trượt chân và nội suy giữa key | [Idle và IK](../../lessons/019-handbuilt-idle-and-ik.md) |
| Khăn | Neo giữ nguyên, weights, chuyển động trễ | [Mesh khăn](../../lessons/085-editor-robot-scarf-mesh.md), [idle](../../lessons/086-editor-scarf-delayed-idle.md) |
| Thạch | Nén–giãn, giữ mặt, giữ vùng đáy | [Bộ thạch](../../exercises/soft-character/README.md) |
| Đổi ảnh | Kích thước hiển thị, texture và rig | [Đổi độ phân giải](../../lessons/088-editor-mesh-image-resolution.md) |

Đối chiếu theo mục tiêu chuyển động và lỗi đã biết. Không yêu cầu trùng từng pixel với Spine hoặc sao chép hành vi chưa có đặc tả. Với engine mới, các ngưỡng số phải được ghi trước khi chạy thử.

## Điều kiện đề xuất 11/09 — chưa duyệt

- Tạo, sửa, lưu, mở lại và phát được trên player mà không cần Spine.
- Agent thực hiện qua bộ lệnh công khai; không dựa vào sửa file nội bộ hay chỉnh tay dữ liệu để hoàn thành bài.
- Giả định đầu ra sử dụng được đã superseded ngày 12/09; cần xác định lại khi có nhu cầu.
- Có bằng chứng ở pose giữa key, cực trị và playback, không chỉ ảnh đẹp tại keyframe.
- Việc sửa được hoàn tác và không làm mất phần project đã đạt.

Các tính năng chưa làm phải được báo là chưa hỗ trợ. Không âm thầm bỏ qua khi nhập project hoặc xuất kết quả.

Các điều kiện này chưa duyệt; quyết định đầu ra đã hoãn. Bằng chứng trên bộ mẫu không chứng minh thay thế toàn bộ workflow Spine; chưa có baseline so sánh tương đương hoặc chi phí/tokens đầy đủ.
