# Phạm vi theo giai đoạn

Ngày 11/09/2026. **PROPOSED / AWAITING OWNER DECISION**: phạm vi MVP dưới đây thuộc [đề xuất #22](decisions/mvp.md), chưa được chủ dự án duyệt. Các giai đoạn trước là thứ tự kiểm chứng, không phải lịch phát hành; [ba gate](reconciliation/2026-09-11-three-gates.md) giữ kết quả và giới hạn gốc.

## Phạm vi hẹp được đề xuất

| Nhóm | Trong phương án đề nghị | Ngoài phương án / chưa được nhận |
| --- | --- | --- |
| Art | PNG tách sẵn với bố trí/pivot, trong giới hạn storage; full/half texture có mẫu giữ geometry | PSD/sync layer, tự tách ảnh phẳng/sinh art bị che |
| Rig | Region, xương cha/con; mesh/bind/weights; IK hai xương theo miền hợp đồng | Skins/linked mesh/clipping, path/transform constraints, mọi miền scale |
| Animation | Transform keys/curves, idle/wave, deform phụ kiện mềm authored | Mixing/additive/transitions/events/audio; physics chưa thử |
| Agent/UI | Dùng chung Session, native create→observe→edit trong môi trường đã thử; UI cơ bản và undo/checkpoints | Mọi browser/agent; native cancellation đã chứng minh; editor ngang Spine |
| Quan sát | PNG/preview/sequence, pose/diagnostics gắn revision; region corner supplement khi cần | Default diagnostics bao mọi lỗi/mọi điểm/mọi thời điểm |
| Lưu/đầu ra | IndexedDB + ZIP chỉnh sửa tiếp và web Player độc lập | Cloud/cộng tác, spritesheet/video/game-engine exporter; history trong ZIP |
| Chất lượng | Người xem nhận chuyển động, public evidence và ZIP reopen; giữ ngưỡng mẫu gate | Cam kết 60 fps, reliability thống kê, ROI hoặc production readiness |

Gate 1 chức năng được nhận nhưng performance vẫn FAIL 17.8/17.5 ms so 16.7 ms; #51→#52 giữ Polish Deferred theo quyết định 11/09. Đề xuất tiếp tục phạm vi chức năng không đổi kết quả đo hoặc hạ ngưỡng. Gate 2 physics NOT TESTED và bridge không native pass; Gate 3 7/9 đạt ngưỡng thử nghiệm, chưa tự chốt MVP feasible.

## Phần sau quyết định

[#22 ADR](decisions/mvp.md) đề nghị ưu tiên đầu tư #51→#52, rồi discovery #23 nếu chuẩn bị art là nút thắt, #28 khi web Player không đủ; #24/#25/#26 theo nhu cầu cụ thể, #27/#29 để sau. **#23–#29 và #51/#52 đều giữ Deferred**; bảng ưu tiên không mở việc, đổi dependency hay cho phép triển khai production. Mọi mở rộng cần outcome/acceptance riêng và quyết định tương ứng của chủ dự án.

## Bộ mẫu làm chuẩn

| Mẫu | Giá trị kiểm tra | Tham chiếu |
| --- | --- | --- |
| Robot idle/wave | Rig, nhịp, ảnh gắn xương, sửa theo feedback | [Bộ robot](../../exercises/robot/editor-review/README.md) |
| Robot chân trụ | IK, trượt chân và nội suy giữa key | [Idle và IK](../../lessons/019-handbuilt-idle-and-ik.md) |
| Khăn | Neo giữ nguyên, weights, chuyển động trễ | [Mesh khăn](../../lessons/085-editor-robot-scarf-mesh.md), [idle](../../lessons/086-editor-scarf-delayed-idle.md) |
| Thạch | Nén–giãn, giữ mặt, giữ vùng đáy | [Bộ thạch](../../exercises/soft-character/README.md) |
| Đổi ảnh | Kích thước hiển thị, texture và rig | [Đổi độ phân giải](../../lessons/088-editor-mesh-image-resolution.md) |

Đối chiếu theo mục tiêu chuyển động và lỗi đã biết. Không yêu cầu trùng từng pixel với Spine hoặc sao chép hành vi chưa có đặc tả. Với engine mới, các ngưỡng số phải được ghi trước khi chạy thử.

## Điều kiện đề xuất để nhận workflow nội bộ

- Tạo, sửa, lưu, mở lại và phát được trên player mà không cần Spine.
- Agent thực hiện qua bộ lệnh công khai; không dựa vào sửa file nội bộ hay chỉnh tay dữ liệu để hoàn thành bài.
- Người dùng nhận được cả project chỉnh sửa tiếp và đầu ra sử dụng được.
- Có bằng chứng ở pose giữa key, cực trị và playback, không chỉ ảnh đẹp tại keyframe.
- Việc sửa được hoàn tác và không làm mất phần project đã đạt.

Các tính năng chưa làm phải được báo là chưa hỗ trợ. Không âm thầm bỏ qua khi nhập project hoặc xuất kết quả.

Các điều kiện này là đề xuất chờ quyết định. Bằng chứng trên bộ mẫu không chứng minh thay thế toàn bộ workflow Spine; chưa có baseline so sánh tương đương hoặc chi phí/tokens đầy đủ.
