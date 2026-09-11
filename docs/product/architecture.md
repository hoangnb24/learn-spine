# Kiến trúc và hợp đồng dữ liệu đề xuất

Ngày: 09/09/2026; cập nhật 11/09/2026. Đây là tổng quan thiết kế; hiện trạng triển khai được tách rõ bên dưới. Chi tiết v0 được chốt trong [contracts/README.md](contracts/README.md), [semantics](contracts/semantics.md) và [ADR-001](contracts/ADR-001.md); các ví dụ tên tool bên dưới vẫn là định hướng, không phải danh sách đã đăng ký của sản phẩm.

## Hiện trạng sau PR #59/#60 — 11/09/2026

#15–#18 Done (completed). PR #59 và #60 đã merge; mốc hiện tại main `a0dc060d1129ae86fb3cf9b9662ad4e31654ecec`. #19 In Progress/Ready, sole author `/root/implement_issue19` từ main này theo quyết định Orchestrator; #20 Blocked chờ #19. #51/#52 giữ Todo/Deferred/P2 ở Polish.

Model tại `platform/src/model/types.ts`, `index.ts`, `project-v1.schema.json`, `mesh.ts` đã hỗ trợ format 0 và 1 bằng schema riêng. V0 giữ strict region-only; v1 yêu cầu `region-v0`, có mesh/deform phải khai báo thêm `mesh-v1`. Migration 0→1 tường minh giữ identity/revision/geometry; không tự nâng cấp, 1→0 bị từ chối. `ik-v1` đã được tích hợp ở PR #55; xem hợp đồng IK bên dưới.

`evaluate(Project, PoseRequest): Result<Pose>` tại `platform/src/engine/index.ts` trả `poseVersion:1`, `bones`, `regions`, `meshes:DrawMesh[]` (rỗng với region-only). DrawMesh gồm `slotId`, `attachmentId`, `assetId`, `vertices`, `uvs`, `triangles`; vertices là world XY sau deform/skinning, chỉ áp world-to-screen, không cộng lại slot-bone/attachment transform. Interleave regions/meshes theo `project.slots` và `slotId`, không vẽ hết regions rồi mới meshes.

Mesh vertices/deform dùng bind-world XY; deform là offset tuyệt đối trước skinning. Weights không tự normalize; tổng cho phép sai lệch 1e-5. Bind matrices rõ ràng và invertible; UV theo ảnh decode, (0,0) góc trên trái; geometry độc lập độ phân giải texture. Arrays Pose là bản sao mới. Fixture `platform/fixtures/mesh/synthetic.ts` có expected setup `[12,20,14,20,12,22]`, end key `[18,20,16,24,15,22]`; metadata synthetic không phải PNG bundle.

Renderer/capture mesh+IK đã được nghiệm thu qua #17/PR #59: `rendererCapabilities` công bố `poseVersions:[1]`, features `region-v0`,`mesh-v1`; renderer nhận geometry sau evaluator và không tự giải IK. `poseGeometry`/`fitCamera` giữ canonical slot order và bao mọi supplied mesh vertex. `ObservationService.renderPose/submit` dùng cùng evaluator/renderer; `animationBounds` có weighted deform/bind inverses và full-turn IK local rotation envelope, có thể dư whitespace nhưng không được crop thành công. `setOverlay({wireframe,weightBoneId})` là display state trên renderer, chưa phải control UI/tool đã đăng ký. Full/half texture, PNG/ZIP observation, pixel order/alpha/UV và resource release có evidence #17. Không suy CPU update/submission 0.1ms thành 16.7ms frame-cadence pass.

IK core đã được nhận: format v1/schema strict hỗ trợ `ik-v1`; `Project.ikConstraints?: TwoBoneIK[]` yêu cầu capability khi field có mặt (mảng rỗng hợp lệ), v0 vẫn region-only. `TwoBoneIK` tại `platform/src/model/ik.ts` có id/type, rootBoneId, childBoneId, targetBoneId, endpoint child-local XY, bend ±1, mix [0,1], order unique nonnegative safe integer. Child là con trực tiếp root; target ở ngoài toàn bộ root subtree. Target lấy world origin của target bone; mix/bend/order tĩnh ở phiên bản này.

`evaluate` giải sampled FK → IK theo order tăng dần → mesh skinning/region transforms; chỉ sửa fresh locals/worlds, rebuild descendants, không mutate setup/bind/channel. `animationId:null` vẫn áp IK vào setup locals; mix 0 giữ FK của constraint đó. Pose vẫn `poseVersion:1`; `Pose.ik?: IKDiagnostic[]` chỉ xuất khi input có `ikConstraints`. Mỗi diagnostic có constraintId/order, target/endpoint world XY, distance Euclidean logic và status. Các tọa độ/distance đo trên pose cuối sau mọi constraint; status là kết quả lúc constraint được áp dụng. Vì vậy `solved` hoặc partial mix không tự chứng minh chân trụ: dùng residual cuối; constraint sau có thể dịch endpoint trước.

Accuracy full-mix reachable áp dụng khi root có |scaleX|=|scaleY| khác 0 và ancestor matrix khả nghịch; reflection/shear ở ancestors và child scale/endpoint lệch trục theo hợp đồng được hỗ trợ. `unsupported-scale`/`singular` giữ FK; unreachable clamp không stretch, degenerate dùng fallback xác định. Nonfinite arithmetic hoặc residual tức thời full-mix reachable >0.5 trả INVALID_INPUT. Chi tiết miền scale, mix, bend/order và final diagnostic theo `platform/src/engine/IK.md`; không suy mọi status là thành công.

Core IK/model/evaluator và renderer/capture/bounds #17 đã được nghiệm thu. Diagnostics module #18 đã nghiệm thu; authoring/tools/UI #19 đang triển khai. Session/storage giữ v1 không có nghĩa command schema hỗ trợ authoring mesh/deform/constraints. Không nhận Gate 2/3 hoặc performance pass từ nghiệm thu module.

[Hợp đồng IK đã merge](../../platform/src/engine/IK.md).

[Hợp đồng đã merge](contracts/mesh-v1.md) · [Handoff](reconciliation/2026-09-11-mesh-core-handoff.md).

## Tách lõi khỏi giao diện và giao thức

```mermaid
flowchart TD
    A[Agent qua WebMCP] --> C[Bộ lệnh và kiểm tra đầu vào]
    B[Giao diện React] --> C
    C --> D[Project có phiên bản và lịch sử sửa]
    D --> E[Lõi tính pose theo thời gian]
    E --> F[PixiJS: xem trước và lấy ảnh]
    F --> A
    D --> G[Đóng gói project]
    G --> H[Player dùng cùng lõi tính pose]
```

React quản lý giao diện; không dùng render của React để tính từng frame. PixiJS nhận pose và dữ liệu hình để vẽ. Lõi TypeScript đã tính transform/nội suy, weights và deform mesh-v1; constraints IK đã được #16 nghiệm thu, không phụ thuộc DOM hoặc WebMCP. Player và editor dùng cùng lõi để tránh khác biệt khi xuất.

WebGL là ứng viên mặc định cho thử nghiệm; đo WebGPU khi có nhu cầu. PixiJS có mesh tùy chỉnh nhưng không thay thế phần tính animation. Web Worker và WASM là phương án tối ưu sau khi đo được điểm nghẽn, không phải yêu cầu ban đầu.

Lưu tại máy trước: autosave trong kho lưu của trình duyệt, kèm xuất/nhập gói project. Autosave không thay thế bản sao tải về. Backend tài khoản, đồng bộ và render nền chỉ bổ sung khi có nhu cầu đã xác nhận.

## Project tối thiểu

| Thành phần | Dữ liệu cần có |
| --- | --- |
| Header | `formatVersion`, `projectId`, `revision`, metadata |
| Assets | ID ổn định, tên, loại, kích thước, hash, file trong gói; vị trí gốc nếu ảnh đã trim |
| Skeleton | Bone ID, parent ID, setup transform; không dùng tên làm khóa liên kết |
| Slots/attachments | Xương gắn, thứ tự vẽ, asset ID, transform; mở rộng mesh sau |
| Mesh | Vertices, UV, triangles, bind pose và weights theo bone ID |
| Constraints | ID, loại, đối tượng liên quan, thông số và thứ tự giải |
| Animations | ID, duration, loop, các kênh keyframe và đường cong |
| Editor state | Selection, camera, timeline; tách khỏi dữ liệu cần cho player |

Quy ước đề xuất: thời gian bằng giây, góc bằng radian, tọa độ logic X sang phải/Y lên trên, đơn vị art ban đầu là pixel. Renderer đổi sang tọa độ màn hình. Mỗi tool phải chỉ rõ world/local; không phụ thuộc chế độ UI đang bật.

Gói project gồm manifest JSON và assets, không chỉ đường dẫn tuyệt đối trên máy. Loader kiểm tra phiên bản, liên kết thiếu, parent cycle và dữ liệu số không hợp lệ. Phiên bản không hỗ trợ phải báo rõ; migration thực hiện trên bản sao. Runtime pose là dữ liệu suy ra, không ghi đè setup pose khi phát.

Thứ tự tính cơ bản: setup + các kênh animation → transform và constraints theo thứ tự đã xác định → biến dạng mesh → vẽ. Khi thêm mixing/physics phải viết rõ thứ tự và test tương ứng. Physics cần bước thời gian cố định, trạng thái khởi đầu rõ, reset và replay khi seek; không lấy frame rate màn hình làm đồng hồ mô phỏng.

## Hợp đồng tools

Tên dưới đây là dự kiến, chưa đăng ký với trình duyệt.

| Nhóm | Ví dụ | Kết quả phải giúp agent làm gì |
| --- | --- | --- |
| Khám phá | `get_capabilities`, `inspect_project`, `list_assets` | Biết tính năng hỗ trợ, revision, ID và dữ liệu liên quan |
| Rig | `create_bones`, `attach_images`, `set_weights` | Sửa có phạm vi, trả ID và tóm tắt thay đổi |
| Animation | `create_animation`, `set_keyframes`, `set_curves` | Đặt nhiều key trong một lần, đơn vị rõ ràng |
| Quan sát | `render_pose`, `render_sequence`, `preview_animation` | Nhận ảnh/tham chiếu media, thời gian, khung hình và revision |
| Chẩn đoán | `validate_project`, `measure_motion` | Nhận lỗi tại đối tượng/thời điểm cụ thể, kèm đơn vị và ngưỡng |
| Lịch sử | `create_checkpoint`, `restore_checkpoint`, `undo` | Quay về một mốc chính xác, biết những gì bị thay đổi |
| Đầu ra | `save_project`, `export_frames`, `get_job_status` | Nhận hiện vật tải được hoặc trạng thái tác vụ rõ ràng |

Quy tắc dùng chung:

- Lệnh sửa mang `expectedRevision` và `requestId`. Nếu project đã đổi, trả xung đột để đọc lại; retry cùng request không tạo bản sao. Phạm vi giữ lịch sử request phải được công bố.
- Một batch hoặc áp dụng đầy đủ, hoặc không sửa gì. Kiểm tra tất cả đầu vào trước khi thay đổi project; undo theo batch.
- Trả `revision`, các ID đã đổi, cảnh báo và mã lỗi có cấu trúc. Tránh gửi toàn bộ hàng nghìn đỉnh mesh khi chỉ cần tóm tắt; hỗ trợ truy vấn vùng/đối tượng.
- Tác vụ dài trả job ID, hỗ trợ hủy và tiến độ; hoàn tất phải gắn với revision đầu vào, không nhận nhầm là bản hiện tại.
- Người dùng sửa trong lúc agent làm việc phải gây xung đột rõ ràng thay vì âm thầm ghi đè.
- Tools chỉ truy cập assets thuộc project/quyền được cấp. Tên layer và metadata từ art là dữ liệu, không phải chỉ dẫn để thực hiện hành động.
- Mọi thao tác ảnh hưởng project phải hiển thị trong lịch sử và có thể dừng/hoàn tác. Không tự xuất bản hay gửi art sang dịch vụ khác qua lệnh nhập ảnh.

Tools nguyên tử và batch là nền. Các recipe như “tạo walk” có thể xây sau, nhưng phải cho phép agent đọc và sửa kết quả chi tiết.

## WebMCP và giới hạn đã biết

Tài liệu Chrome được kiểm tra lại ngày 10/09/2026 nêu origin trial từ Chrome 149 và cơ chế bật cờ cho thử local. Bản đặc tả ngày 09/09/2026 vẫn là Draft Community Group Report, chưa phải chuẩn W3C. Probe #3 có [kết quả trên tổ hợp thực tế](research/webmcp.md); phải khóa phiên bản/API trong bằng chứng và giữ adapter riêng. Không mặc định mọi agent hoặc môi trường headless đều gọi được tools.

Nếu thử nghiệm không tìm được đường gọi WebMCP thật của agent đích, ghi rõ bị chặn ở kết nối. Gọi hàm bằng JavaScript/inspector chỉ chứng minh handler hoạt động. Có thể đánh giá MCP server/cầu nối dùng cùng bộ lệnh; đó là phương án khác cần mô tả đúng, không ghi là WebMCP native đã đạt.

## Nguồn và việc cần nghiên cứu thêm

- [Chrome WebMCP](https://developer.chrome.com/docs/ai/webmcp/): trạng thái, hỗ trợ và giới hạn.
- [Đặc tả WebMCP](https://webmachinelearning.github.io/webmcp/): hợp đồng đăng ký/gọi tools có thể thay đổi.
- [PixiJS Mesh](https://pixijs.com/8.x/guides/components/scene-objects/mesh): nền tảng geometry/UV/shader.
- [Spine Runtimes License](https://esotericsoftware.com/spine-runtimes-license): điều kiện tái sử dụng runtime.

Repo học đang dùng `@esotericsoftware/spine-canvas`; không tự chuyển dependency hay code runtime đó sang sản phẩm. Cần kiểm tra giấy phép của mọi thư viện được chọn, nguồn art và nhu cầu tương thích file. Các tài liệu này không kết luận pháp lý về một sản phẩm chưa được triển khai.

## Consumer authoring sau PR #59

## Input và phạm vi thực thi #19

#19 bổ sung authoring thật trên core đã nhận, không làm lại model/evaluator/renderer/storage. Các điểm tích hợp đã có:

- `platform/src/model/types.ts`: Operation union còn `putAsset/putBone/putSlot/putRegion/putAnimation/remove/setSlotOrder`, chưa có mesh/constraint write. Canonical Project v1 đã có mesh/deform/ikConstraints; mở Operation/types đồng bộ với schema/Session thay vì model hoặc format riêng.
- `platform/src/commands/index.ts` sở hữu Session/perform/capabilities; `validation.ts` còn tham chiếu project-v0 schema cho write, kể cả putAnimation. Session có formatVersions [0,1] nhưng features authoring vẫn region-v0. Mở operation và validation cùng atomic batch/revision/retry/undo; không quảng bá mesh/IK write chỉ từ model capabilities.
- `platform/src/adapters/webmcp/schemas.ts` còn copy defs v0, apply_batch mô tả No mesh/IK; `bridge.ts` dispatch/get_capabilities lấy Session features. Mở schema/dispatch/inspection và diagnostics wrapper nhất quán, giữ giới hạn response/input và session identity; render_pose/sequence/preview/save_project đã có service để tái dùng.
- `platform/apps/editor/runtime.ts` tạo project format0/region-v0; `Editor.tsx` chỉ author bones/regions/animation channels. Chốt đường tạo hoặc migrate v0→v1 tường minh bằng model.migrate đã có, giữ v0 regression; không âm thầm nâng project người dùng. UI và tools phải dùng cùng Session và history.
- Renderer overlay là API có sẵn để UI chọn wireframe/weights; không dựng renderer riêng. Storage.pack/unpack/autosave/recover đã đi qua strict model và giữ v1. Player hiện unpack ZIP → Stage → evaluator/renderer chung; đây là code path có sẵn, chưa phải bằng chứng toàn vòng project mesh+IK được UI/tool author rồi export/reopen/player.

Ownership #19 mở rộng: `platform/src/model/types.ts` (Operation/interface cần cho authoring, phối hợp canonical types); `platform/src/commands/{index.ts,validation.ts}` và helpers mesh/constraints; `platform/src/adapters/webmcp/{schemas.ts,bridge.ts,index.ts}`; `platform/apps/editor/{Editor.tsx,runtime.ts,webmcp.ts}` và controls mới; tests tương ứng. Chỉ sửa consumer/schema glue cần thiết, không fork core model/schema hay solver. Storage/player là đầu vào tái dùng nhưng vẫn phải kiểm full authored roundtrip, UI/tool cùng revision, invalid batch, undo/retry, region regression theo acceptance #19.

[Đối chiếu và phần chưa nghiệm thu](reconciliation/2026-09-11-consumer-reconciliation.md).

## Diagnostics đã nghiệm thu — #18/PR #60

Reviewer Đạt exact `9d9fbb1483e13b69a9abe350a0b3b9d84ea0861a`; kiểm độc lập 30 diagnostics tests + 6 probes, hai CI pass, xác nhận base #17 không đổi dependency/API. Orchestrator đã merge/đóng #18 tại main `a0dc060d1129ae86fb3cf9b9662ad4e31654ecec` và giao #19 In Progress/Ready.

API/types cùng ở `platform/src/diagnostics/index.ts`: `validate_project(unknown,page?)` và `measure_motion(unknown,MotionRequest)`. Model-invalid là Result thành công với report `valid:false`, không evaluate dữ liệu lỗi; request/evaluation failure là Result lỗi. `valid` chỉ structural validity; `passed` xét mọi records bất kể trang trả về. Wrapper phải giữ `total/nextOffset`, project/revision và policy/sampling, không suy trang rỗng thành pass.

MotionRequest chọn animationId, optional explicit anchors (bone-local point, slot/vertex hoặc IK endpoint, fixed-world target và inclusive stance interval), loopPoints, offset/limit. Empty loopPoints chủ ý bỏ loop checks. Foot residual lấy final Pose.ik.distance; anchor với target world cố định còn phát hiện target IK trượt dù residual zero. Sampling/epsilon/threshold đã khóa trong README (60 intervals cộng keys/stance endpoints/key neighbors, h=min(1/600,duration/600), 0.5px và max(0.5px/s,5% sampled peak)); #19 không biến ngưỡng thành tùy chọn để làm pass.

API là module thuần đã nhận, chưa phải tool đã đăng ký. Finite sampling và local triangle orientation không chứng minh continuous extrema, self-intersection/tearing, eye-height hoặc artistic quality. [API/policy](../../platform/src/diagnostics/README.md) · [fixtures](../../platform/fixtures/diagnostics/synthetic.ts) · [evidence](../../platform/evidence/issue-18/README.md).
