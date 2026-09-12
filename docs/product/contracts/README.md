# Hợp đồng project v0

Ngày chốt đặc tả: 10/09/2026 · Issue #4 (T03). Đây là đầu vào triển khai #5–#13; chưa phải engine đã hoạt động. Bản này tiếp tục bản nháp tại máy và đã đối chiếu đầy đủ issue trên GitHub. Việc mở khóa downstream chỉ xảy ra sau khi PR được merge.

## Bộ tài liệu bàn giao

- [project-v0.schema.json](../../../platform/src/model/project-v0.schema.json): cấu trúc JSON, kiểu và phạm vi giá trị.
- [types.ts](../../../platform/src/model/types.ts): kiểu dữ liệu và interface cho từng module, không có runtime import.
- [semantics.md](semantics.md): quy tắc liên kết, tọa độ, thời gian, giao dịch, lịch sử và jobs.
- [ADR-001.md](ADR-001.md): quyết định bổ sung so với architecture ban đầu, điểm mở rộng và migration.
- [examples/region-valid.json](examples/region-valid.json): một ảnh thân robot với kênh nhún 2 giây; ví dụ dữ liệu, chưa là demo chuyển động.
- [examples/asset-map.json](examples/asset-map.json): ánh xạ đường dẫn trong gói sang PNG đã có trong repo. Gói native không chứa đường dẫn repo này.
- [cycle-invalid.json](examples/cycle-invalid.json), [missing-asset-invalid.json](examples/missing-asset-invalid.json), [stale-revision-invalid.json](examples/stale-revision-invalid.json): dữ liệu lỗi có đáp án. NaN/Infinity được tạo trực tiếp trong test vì JSON không biểu diễn được chúng.
- [mock-consumers.ts](mock-consumers.ts): ví dụ mock có typecheck để làm việc trước khi các module khác được merge. Mock phải được gắn nhãn trong test; không dùng làm bằng chứng engine đạt.

Schema, semantics và types là một hợp đồng: schema kiểm tra hình dạng; semantics bắt buộc kiểm tra các liên kết và điều kiện mà JSON Schema không diễn tả. Nếu phát hiện mâu thuẫn, dừng phần bị ảnh hưởng và sửa hợp đồng kèm test trước khi tiếp tục; không chọn cách hiểu âm thầm ở từng module.

## Ownership và cách ghép

| Module / owner | Đầu vào → đầu ra | Đồng bộ / tài nguyên | Mock khi chưa có đầu vào |
| --- | --- | --- | --- |
| Model #6 | unknown → Result<Project> | Sync, kiểm tra và sao chép; không DOM | JSON region-valid và lỗi; oracle chỉ kiểm tra ví dụ |
| Commands #7 | Batch/RevisionRequest → Commit/Checkpoint | Sync, duy nhất sở hữu live project/history | Trả UNSUPPORTED_CAPABILITY cho write, clone fixture cho read |
| Evaluator #8 | Project + PoseRequest → Pose | Sync, pure, không delta frame | Pose cố định với ma trận tính tay |
| Renderer #9 | Bundle/Pose + Viewport → canvas hoặc PNG bytes | Prepare/capture async; draw sync; sở hữu texture/GPU | Renderer mock chỉ ghi nhận pose, không giả ảnh thành công |
| Storage #10 | Bundle ↔ ZIP bytes; autosave/recover | Async; copy-on-write; sở hữu persistence | Bundle trong bộ nhớ, pack trả unsupported |
| Observation #11 | Snapshot bundle + request → ảnh hoặc job | renderPose async; submit/get/cancel sync; đọc artifact async | Job/ảnh cố định gắn revision, không đọc live project |
| Editor/player #12 | Commands + Evaluator + Renderer + Storage | Cùng core, UI state riêng | Dùng các mock trên, ghi rõ phần chưa hiện thực |
| Transport #13 | tool schema + unknown payload → Result<Json> | Async; chỉ đăng ký/dispatch; không tự sửa project | Transport mock trả unsupported; probe #3 để kiểm tra đường nối |

#6 đã chuyển types/schema sang `platform/src/model/` làm một nguồn duy nhất và cập nhật mock/oracle. [API production và fixture](../../../platform/src/model/README.md). Regex kết thúc chuỗi dùng negative lookahead để loại cả newline cuối; đây là sửa kiểm tra khớp quy tắc ASCII/path/hash v0, không đổi format. Root package học Spine không phải dependency của hợp đồng hoặc sản phẩm.

## Kiểm tra từ clone

Cần Node.js 22, npm. Chạy ở root repo:

```sh
npm ci --ignore-scripts --prefix docs/product/contracts
npm test --prefix docs/product/contracts
npm run typecheck --prefix docs/product/contracts
```

Package riêng chỉ chứa công cụ kiểm tra đặc tả (Ajv 8.20.0, TypeScript 5.9.3), có lockfile; không sửa package/config của workspace sản phẩm #5. `check-examples.mjs` là oracle nhỏ cho ví dụ, không phải model #6. Các test revision chỉ xác nhận ví dụ mô tả xung đột; hành vi atomic/history/dedup thực tế phải được #7 kiểm tra.

## Bàn giao

#5 có thể dựng workspace sau merge; #6 dùng schema, semantic rules và fixture; #7 dùng giao dịch; #8 dùng tọa độ/nội suy; #9 dùng trim/pivot/viewport; #10 dùng gói/giới hạn; #11 dùng snapshot/job. #13 nhận thêm [kết quả thử WebMCP](../research/webmcp.md). [Bộ mẫu #2](../research/assets.md) cung cấp art và quan sát đối chứng; không dùng JSON Spine làm project native.

## Extension after Gate 1

[Mesh v1 (#15)](mesh-v1.md) specifies the implemented format 1 schema, explicit
0→1 migration and versioned Pose. [Two-bone IK (#16)](../../../platform/src/engine/IK.md)
is now integrated in format v1 with `ik-v1`, ordered solving before mesh/region
output and final-world `Pose.ik` diagnostics; renderer/capture is accepted through #17; authoring/transport is accepted through #19; see [commands v1](../../../platform/src/commands/README.md) and [UI migration](../../../platform/apps/editor/mesh-controls/README.md). The original
v0 schema and semantics remain unchanged; the region oracle above stays v0-only.

[Motion diagnostics #18](../../../platform/src/diagnostics/README.md) is an accepted consumer API with fixed policy, final-pose measurements and bounded reports. #19 has integrated the diagnostic tools and canonical v1 authoring operations; Gate 2/3 still require their own evidence.

Gate 2 (#20) is accepted at PR #64. Default motion diagnostics still omit region corners; [Gate 2 supplemental coverage](../reconciliation/2026-09-11-gate2.md) uses public render.corners and a rotation-only negative control. This did not add a new diagnostic/tool capability. Gate 3 now has 7/9 independently accepted native runs (PR #66); this does not turn module contracts into production/MVP approval. See [three-gate decision handoff](../reconciliation/2026-09-11-three-gates.md).

[Composition v1 core (#73)](../../../platform/src/model/COMPOSITION.md) defines
optional persisted transform stacks, public Session edits, the shared evaluator's
canonical target/provenance, and frozen descriptor expansion. Existing animation
requests retain their contract. Tools/observation and UI support remain separate
#74/#75 integrations; core support alone does not advertise transport support.
