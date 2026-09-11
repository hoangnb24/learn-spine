# Đối chiếu authoring → Gate 2 — 11/09/2026

## Mốc và quyết định

Main `016ba56fde8310848e062b75ed016fd5771a8c4a`; PR #62 reviewer Đạt exact `fad827093f78c45b2dbb83b2bf11b796808adf41`. Orchestrator đã merge/đóng #19 completed và giao #20. Reviewer: 162 unit + probe độc lập 8,000 vertices, bốn browser authoring cases, actual native UI/tool/retry/rollback/undo/render, IK/jelly ZIP/reload/player; native supplement nguồn `af97148a53fd7b69bbab9050d8e2a4a99716a25a`, commit cuối chỉ evidence. Hai CI pass; một timeout apt/font thoáng qua đã rerun cùng head, không đổi code để nhận pass. #15–#19 Done (completed); PR #62 đã merge main `016ba56fde8310848e062b75ed016fd5771a8c4a`. #20 In Progress/Ready, sole author `/root/implement_issue20` từ main này theo quyết định Orchestrator; #21 Blocked chờ Gate 2. #51/#52 và discovery #23–#29 giữ Deferred; không đổi DAG.

[Commands](https://github.com/hoangnb24/learn-spine/blob/016ba56fde8310848e062b75ed016fd5771a8c4a/platform/src/commands/README.md) · [UI controls/migration](https://github.com/hoangnb24/learn-spine/blob/016ba56fde8310848e062b75ed016fd5771a8c4a/platform/apps/editor/mesh-controls/README.md) · [Adapter schema](https://github.com/hoangnb24/learn-spine/blob/016ba56fde8310848e062b75ed016fd5771a8c4a/platform/src/adapters/webmcp/schemas.ts) · [Evidence #19](https://github.com/hoangnb24/learn-spine/blob/016ba56fde8310848e062b75ed016fd5771a8c4a/platform/evidence/issue-19/README.md).

## Kế hoạch cũ, delta và phạm vi còn lại

Bản đối chiếu consumer trước #19 ghi write boundaries/capabilities còn region-only và yêu cầu Operation/types, schema, explicit migration/UI. PR #62 đã hoàn thành các điểm đó bằng canonical v1 hiện có; không cần mở lại model/render/storage. Finding large deform key được sửa bằng paging theo vertex và local writes, nên kế hoạch Gate 2/3 dùng API này thay vì whole-animation payload. Không có chênh lệch mới cần đổi scope/DAG; trạng thái authoring hoàn thành không thay nghiệm thu chất lượng Gate 2.

## Authoring đã nghiệm thu sau PR #62

- Canonical Operation tại `platform/src/model/types.ts`, Session `platform/src/commands/index.ts` và write validators đã đồng bộ v1. `migrateProject {targetVersion:1}` dùng model migration tường minh trong atomic candidate; undo trả version/capabilities cũ, lỗi operation sau rollback toàn batch. New editor projects là v1/region-v0; mở ZIP v0 giữ nguyên v0 đến khi người dùng/agent nâng cấp rõ ràng.
- `putMesh`, `setVertexWeights`, `setVertexDeforms`, `putIKConstraint` và remove `ikConstraints` đi cùng revision/requestId/history/dedup. Mesh/deform/IK writes vào v0 trả UNSUPPORTED_VERSION, không nâng ngầm. Required mesh-v1/ik-v1 được thêm trên candidate khi write v1 thành công; runtime Session capabilities công bố mesh-v1/ik-v1/explicit-migration-v1 độc lập format/requirements của project đang mở.
- `setVertexWeights` thay complete influence lists cho các zero-based vertex đã chọn, giữ phần còn lại. `setVertexDeforms {animationId,attachmentId,time,curve,vertices:[{vertex,offset:[x,y]}]}` chỉ sửa offsets đã chọn tại exact key time và thay curve tường minh; key mới có all-zero offsets trước local writes, key cũ giữ offsets không chọn/keys khác. Offset là absolute bind-world XY trước skinning, không delta sau skinning. `putAnimation` vẫn thay toàn animation gồm optional deforms; phải giữ unrelated data nếu dùng đường này.
- Adapter schema/dispatch đã có mesh/IK writes, `inspect_mesh`, `inspect_deforms`, `validate_project`, `measure_motion`; `get_capabilities` thêm diagnostics-v1, giữ giới hạn input/response/session. `inspect_deforms` trả channel/key summaries; thêm attachmentId + keyTime để đọc trang vertex offsets (offset/limit, total/nextOffset, curve), không trả whole large key. Dùng trang này + setVertexDeforms để đọc/sửa local key lớn; regression 8,000 vertices đã được nghiệm thu. Không dump/replace toàn animation chỉ để sửa một vertex.
- Editor `platform/apps/editor/mesh-controls/` là panel Lưới / IK dùng cùng Session với tools: canvas/list chọn vertices, sửa weights/deform và mix/bend/order của constraint hiện có, wireframe/weight overlay. Agent apply_batch tạo mesh/bind/IK; UI tối thiểu chưa phải triangulation/auto-weight hoặc IK rig builder. Runtime newProject/migration và draft revision/session đã nối chung, không có store riêng.
- Renderer/ObservationService/storage/player hiện có được tái dùng. UI→native tool cùng revision, local-only edits/retry/rollback/undo/render/diagnostics và ZIP/editor reload/player scarf/jelly/IK có evidence thật ở #19, gồm chín actual drawn Poses bằng nhau. Đây là nghiệm thu authoring/roundtrip trên fixtures đã ghi, không chứng minh brief Gate 2 hoặc Gate 3 đã đạt.

## Đầu vào triển khai Gate 2 — #20

#20 đã được Orchestrator giao `/root/implement_issue20`, In Progress/Ready từ main trên. Khóa brief khăn/thạch/chân trụ, eye ROI và chuẩn chiều cao mắt, anchors/đáy/stance targets, sampling/rubric và môi trường trước đo. Giữ nguyên ngưỡng experiments.md: không điều chỉnh brief/ROI/ngưỡng hồi tố để biến fail thành pass.

Dựng fixture qua public commands/Session hoặc tools đã nhận ở #19, không sửa JSON đầu ra để cứu kết quả. Dùng migrateProject tường minh nếu input v0; meshes/binds/constraints tạo bằng apply_batch; weights/deforms cục bộ dùng operations/paging ở trên. Lưu commands, revision, nguồn art/PNG, project ZIP và kết quả UI/player cùng commit. Khóa curve khi sửa local deform; new key zero-baseline phải đúng brief, không mặc định nội suy từ key khác.

Inputs bền vững: `platform/fixtures/source/manifest.json`, core mesh/IK fixtures, `platform/tests/render/mesh/fixture.ts`, `platform/tests/authoring/browser/harness.tsx`, `platform/evidence/issue-19/` (native-authored-scarf.zip, authored-scarf/jelly/ik.zip, native-deform-session.json). Harness là development integration, không phải demo route production. Các fixtures/evidence #19 là tham khảo/oracle đầu vào, không phải Gate 2 pass. Output #20 vẫn `platform/fixtures/deformation/`, `platform/tests/e2e/deformation/`, `docs/product/results/experiment-2/` do author #20 sở hữu.

Dùng validate_project/measure_motion đã đăng ký, giữ report valid/passed và total/nextOffset; trang rỗng không đổi verdict toàn bộ. Anchors/stance là khai báo world targets rõ, foot residual lấy final Pose.ik; bổ sung phép đo eye-height <=5% theo ROI đã khóa, xem tearing/cực trị/playback/nhịp vì module diagnostics không thay các mục này. Save/reopen/player phải kiểm trên chính project Gate 2 authored, không chỉ tham chiếu roundtrip #19. Physics chưa có thì not-tested theo scope; giữ nguyên Gate 2/3 criteria và chính sách Polish.

## Handoff Gate 3 — #21 vẫn Blocked

#21 chỉ được mở sau #20 merge/nghiệm thu và quyết định Orchestrator. Tool capabilities/authoring #19 và native supplement đã có là đầu vào, không thay chín lần sạch theo ba brief của Gate 3. Khi đủ điều kiện, khóa starting project, briefs, model/browser, budget/rubric trước run; ghi cả failure/rescue và dùng inspect_deforms pagination + local writes cho keys lớn. Không coi native smoke/fixtures #19 là độc lập hoàn thành Gate 3, không giảm giới hạn thời gian/tool calls hoặc tự mở #22.

## Nguồn đã đồng bộ

#19 checklist/verdict/Project Done; #20 In Progress/Ready, #21 Blocked; README/architecture/contract index/backlog/execution/roadmap phản ánh commands/capabilities/UI thực tế. Record consumer trước đó giữ nguyên lịch sử. Mọi backlog acceptance, Gate 2/3 criteria và DAG giữ nguyên; #51/#52, discovery #23–#29 Deferred. Updater chỉ ghi quyết định, không sửa source/fixtures/results do author #20 sở hữu hoặc tự merge/mở downstream.
