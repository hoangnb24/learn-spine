# Đối chiếu consumer sau mesh/IK/renderer — 11/09/2026

## Mốc bằng chứng

Mốc đầu đợt: main `4f88b93fa8019e22409feafbcab49392446f1501`; PR #59 reviewer Đạt exact `1bcdfb05b50d2b649fbc6365831df1dc97afc083`, hai CI pass, Orchestrator đã merge/đóng #17. Reviewer độc lập: 125 unit + 5 Chromium/WebGL; actual PNG full/half, wire/weights, IK capture, pixel order/alpha/UV, dispose và 12×101 IK bounds. #15/#16 core đã được nghiệm thu trước đó. #15–#18 Done (completed). PR #59 và #60 đã merge; mốc hiện tại main `a0dc060d1129ae86fb3cf9b9662ad4e31654ecec`. #19 In Progress/Ready, sole author `/root/implement_issue19` từ main này theo quyết định Orchestrator; #20 Blocked chờ #19. #51/#52 giữ Todo/Deferred/P2 ở Polish.

[Renderer API](https://github.com/hoangnb24/learn-spine/blob/4f88b93fa8019e22409feafbcab49392446f1501/platform/src/render/README.md) · [Observation API](https://github.com/hoangnb24/learn-spine/blob/4f88b93fa8019e22409feafbcab49392446f1501/platform/src/observation/README.md) · [Evidence](https://github.com/hoangnb24/learn-spine/blob/4f88b93fa8019e22409feafbcab49392446f1501/platform/evidence/issue-17/README.md).

## Kế hoạch cũ và chênh lệch thực tế

Kế hoạch #19 từng phân công helpers commands và mesh controls mà chưa nêu các entry/schema dùng chung. Thực tế model/renderer đã có v1 nhưng write validators và adapter vẫn v0; Session features và editor newProject còn region-only. Đây là gap tích hợp thuộc #19, không phải thiếu model/renderer/storage cần làm lại. Orchestrator đã chấp thuận ngày 11/09/2026 mở ownership Operation/types, command+adapter schemas, Session capabilities và explicit newProject/migration flow. Không đổi DAG hoặc acceptance.

Renderer/capture mesh+IK đã được nghiệm thu qua #17/PR #59: `rendererCapabilities` công bố `poseVersions:[1]`, features `region-v0`,`mesh-v1`; renderer nhận geometry sau evaluator và không tự giải IK. `poseGeometry`/`fitCamera` giữ canonical slot order và bao mọi supplied mesh vertex. `ObservationService.renderPose/submit` dùng cùng evaluator/renderer; `animationBounds` có weighted deform/bind inverses và full-turn IK local rotation envelope, có thể dư whitespace nhưng không được crop thành công. `setOverlay({wireframe,weightBoneId})` là display state trên renderer, chưa phải control UI/tool đã đăng ký. Full/half texture, PNG/ZIP observation, pixel order/alpha/UV và resource release có evidence #17. Không suy CPU update/submission 0.1ms thành 16.7ms frame-cadence pass.

## Input và phạm vi thực thi #19

#19 bổ sung authoring thật trên core đã nhận, không làm lại model/evaluator/renderer/storage. Các điểm tích hợp đã có:

- `platform/src/model/types.ts`: Operation union còn `putAsset/putBone/putSlot/putRegion/putAnimation/remove/setSlotOrder`, chưa có mesh/constraint write. Canonical Project v1 đã có mesh/deform/ikConstraints; mở Operation/types đồng bộ với schema/Session thay vì model hoặc format riêng.
- `platform/src/commands/index.ts` sở hữu Session/perform/capabilities; `validation.ts` còn tham chiếu project-v0 schema cho write, kể cả putAnimation. Session có formatVersions [0,1] nhưng features authoring vẫn region-v0. Mở operation và validation cùng atomic batch/revision/retry/undo; không quảng bá mesh/IK write chỉ từ model capabilities.
- `platform/src/adapters/webmcp/schemas.ts` còn copy defs v0, apply_batch mô tả No mesh/IK; `bridge.ts` dispatch/get_capabilities lấy Session features. Mở schema/dispatch/inspection và diagnostics wrapper nhất quán, giữ giới hạn response/input và session identity; render_pose/sequence/preview/save_project đã có service để tái dùng.
- `platform/apps/editor/runtime.ts` tạo project format0/region-v0; `Editor.tsx` chỉ author bones/regions/animation channels. Chốt đường tạo hoặc migrate v0→v1 tường minh bằng model.migrate đã có, giữ v0 regression; không âm thầm nâng project người dùng. UI và tools phải dùng cùng Session và history.
- Renderer overlay là API có sẵn để UI chọn wireframe/weights; không dựng renderer riêng. Storage.pack/unpack/autosave/recover đã đi qua strict model và giữ v1. Player hiện unpack ZIP → Stage → evaluator/renderer chung; đây là code path có sẵn, chưa phải bằng chứng toàn vòng project mesh+IK được UI/tool author rồi export/reopen/player.

Ownership #19 mở rộng: `platform/src/model/types.ts` (Operation/interface cần cho authoring, phối hợp canonical types); `platform/src/commands/{index.ts,validation.ts}` và helpers mesh/constraints; `platform/src/adapters/webmcp/{schemas.ts,bridge.ts,index.ts}`; `platform/apps/editor/{Editor.tsx,runtime.ts,webmcp.ts}` và controls mới; tests tương ứng. Chỉ sửa consumer/schema glue cần thiết, không fork core model/schema hay solver. Storage/player là đầu vào tái dùng nhưng vẫn phải kiểm full authored roundtrip, UI/tool cùng revision, invalid batch, undo/retry, region regression theo acceptance #19.

## Diagnostics đã nghiệm thu — #18/PR #60

Reviewer Đạt exact `9d9fbb1483e13b69a9abe350a0b3b9d84ea0861a`; kiểm độc lập 30 diagnostics tests + 6 probes, hai CI pass, xác nhận base #17 không đổi dependency/API. Orchestrator đã merge/đóng #18 tại main `a0dc060d1129ae86fb3cf9b9662ad4e31654ecec` và giao #19 In Progress/Ready.

API/types cùng ở `platform/src/diagnostics/index.ts`: `validate_project(unknown,page?)` và `measure_motion(unknown,MotionRequest)`. Model-invalid là Result thành công với report `valid:false`, không evaluate dữ liệu lỗi; request/evaluation failure là Result lỗi. `valid` chỉ structural validity; `passed` xét mọi records bất kể trang trả về. Wrapper phải giữ `total/nextOffset`, project/revision và policy/sampling, không suy trang rỗng thành pass.

MotionRequest chọn animationId, optional explicit anchors (bone-local point, slot/vertex hoặc IK endpoint, fixed-world target và inclusive stance interval), loopPoints, offset/limit. Empty loopPoints chủ ý bỏ loop checks. Foot residual lấy final Pose.ik.distance; anchor với target world cố định còn phát hiện target IK trượt dù residual zero. Sampling/epsilon/threshold đã khóa trong README (60 intervals cộng keys/stance endpoints/key neighbors, h=min(1/600,duration/600), 0.5px và max(0.5px/s,5% sampled peak)); #19 không biến ngưỡng thành tùy chọn để làm pass.

API là module thuần đã nhận, chưa phải tool đã đăng ký. Finite sampling và local triangle orientation không chứng minh continuous extrema, self-intersection/tearing, eye-height hoặc artistic quality. [API/policy](https://github.com/hoangnb24/learn-spine/blob/a0dc060d1129ae86fb3cf9b9662ad4e31654ecec/platform/src/diagnostics/README.md) · [fixtures](https://github.com/hoangnb24/learn-spine/blob/a0dc060d1129ae86fb3cf9b9662ad4e31654ecec/platform/fixtures/diagnostics/synthetic.ts) · [evidence](https://github.com/hoangnb24/learn-spine/blob/a0dc060d1129ae86fb3cf9b9662ad4e31654ecec/platform/evidence/issue-18/README.md).

## Handoff cho #20

#20 vẫn chờ #19 hoàn thành/nghiệm thu. Nguồn art và placement là `platform/fixtures/source/manifest.json`; fixture core tại `platform/fixtures/mesh/synthetic.ts`, `platform/fixtures/ik/leg.ts`; renderer T01 scarf/jelly+IK tại `platform/tests/render/mesh/fixture.ts` và `platform/tests/render/browser/mesh-harness.ts`, evidence trong `platform/evidence/issue-17/`. Synthetic metadata không phải bundle PNG. `platform/fixtures/deformation/`, `platform/tests/e2e/deformation/`, `docs/product/results/experiment-2/` vẫn là output Gate 2 dự kiến.

Tái dùng inputs/oracles đã có, nhưng dựng fixture qua commands #19 với brief/anchors/stance cụ thể, lưu package có PNG và đo cùng workflow UI/tool/export/player. #17 chỉ chứng minh renderer/capture đúng, chưa chứng minh neo khăn, giữ mặt/đáy thạch hoặc nhịp chân đạt brief. #18 đã nghiệm thu motion diagnostics theo finite sampling: không tự đo eye-height <=5%, self-intersection/tearing hay chất lượng hình/nhịp. #20 vẫn phải bổ sung phép đo vùng mắt, cực trị/playback và các bằng chứng rubric còn thiếu; không đổi ngưỡng, không suy sample pass thành continuous/artistic pass. Gate 2/3 criteria và performance policy hiện tại giữ nguyên.

## Điều chỉnh và điều kiện đi tiếp

#17/#18 checklist/verdict/Project Done. Trong đợt này Orchestrator đã merge #60, xác nhận đủ inputs và giao #19 cho `/root/implement_issue19`, nên #19 In Progress/Ready; #20 vẫn Blocked. Body/backlog/ownership/work #19 và input #20 đã cập nhật theo code thật; README/architecture/execution/contract index sửa trạng thái consumer. #51/#52 Deferred; không đổi Gate 2/3 criteria hoặc thêm cạnh dependency. Updater chỉ ghi quyết định đã được giao, không tự mở downstream, triển khai hoặc nghiệm thu code.
