# Kiến trúc và hợp đồng dữ liệu đề xuất

Ngày: 09/09/2026; cập nhật 11/09/2026. Đây là tổng quan thiết kế; hiện trạng triển khai được tách rõ bên dưới. Chi tiết v0 được chốt trong [contracts/README.md](contracts/README.md), [semantics](contracts/semantics.md) và [ADR-001](contracts/ADR-001.md); các ví dụ tên tool bên dưới vẫn là định hướng, không phải danh sách đã đăng ký của sản phẩm.

## Hiện trạng sau PR #55 — 11/09/2026

#15/#16 Done (completed); PR #55 đã merge main `700b18c73c88ef2a6c48cee21d037ffd97bfb462` sau reviewer Đạt exact `cdee4e120f02883ef99ee6d07e92409965cd0216`. #17 tiếp tục In Progress/Ready; #18 In Progress/Ready, sole author `/root/implement_issue18` từ main này; #19 vẫn Blocked chờ #17 và #18. #51/#52 giữ Todo/Deferred/P2 ở Polish.

Model tại `platform/src/model/types.ts`, `index.ts`, `project-v1.schema.json`, `mesh.ts` đã hỗ trợ format 0 và 1 bằng schema riêng. V0 giữ strict region-only; v1 yêu cầu `region-v0`, có mesh/deform phải khai báo thêm `mesh-v1`. Migration 0→1 tường minh giữ identity/revision/geometry; không tự nâng cấp, 1→0 bị từ chối. `ik-v1` đã được tích hợp ở PR #55; xem hợp đồng IK bên dưới.

`evaluate(Project, PoseRequest): Result<Pose>` tại `platform/src/engine/index.ts` trả `poseVersion:1`, `bones`, `regions`, `meshes:DrawMesh[]` (rỗng với region-only). DrawMesh gồm `slotId`, `attachmentId`, `assetId`, `vertices`, `uvs`, `triangles`; vertices là world XY sau deform/skinning, chỉ áp world-to-screen, không cộng lại slot-bone/attachment transform. Interleave regions/meshes theo `project.slots` và `slotId`, không vẽ hết regions rồi mới meshes.

Mesh vertices/deform dùng bind-world XY; deform là offset tuyệt đối trước skinning. Weights không tự normalize; tổng cho phép sai lệch 1e-5. Bind matrices rõ ràng và invertible; UV theo ảnh decode, (0,0) góc trên trái; geometry độc lập độ phân giải texture. Arrays Pose là bản sao mới. Fixture `platform/fixtures/mesh/synthetic.ts` có expected setup `[12,20,14,20,12,22]`, end key `[18,20,16,24,15,22]`; metadata synthetic không phải PNG bundle.

Renderer prepare/draw/camera hiện vẫn từ chối `mesh-v1`, giữ prepared region cũ khi prepare thất bại. Observation chưa có mesh bounds; `platform/src/observation/bounds.ts` trả null khi gặp mesh. Model/evaluator support không đồng nghĩa renderer/tool support. Session giữ/read/save/reopen v1 nhưng feature list và command schema còn region-only; `putAnimation` chưa nhận deform authoring. Không có mesh UI/tools, diagnostics hoàn chỉnh, Gate 2 hoặc performance pass từ PR #56.

IK core đã được nhận: format v1/schema strict hỗ trợ `ik-v1`; `Project.ikConstraints?: TwoBoneIK[]` yêu cầu capability khi field có mặt (mảng rỗng hợp lệ), v0 vẫn region-only. `TwoBoneIK` tại `platform/src/model/ik.ts` có id/type, rootBoneId, childBoneId, targetBoneId, endpoint child-local XY, bend ±1, mix [0,1], order unique nonnegative safe integer. Child là con trực tiếp root; target ở ngoài toàn bộ root subtree. Target lấy world origin của target bone; mix/bend/order tĩnh ở phiên bản này.

`evaluate` giải sampled FK → IK theo order tăng dần → mesh skinning/region transforms; chỉ sửa fresh locals/worlds, rebuild descendants, không mutate setup/bind/channel. `animationId:null` vẫn áp IK vào setup locals; mix 0 giữ FK của constraint đó. Pose vẫn `poseVersion:1`; `Pose.ik?: IKDiagnostic[]` chỉ xuất khi input có `ikConstraints`. Mỗi diagnostic có constraintId/order, target/endpoint world XY, distance Euclidean logic và status. Các tọa độ/distance đo trên pose cuối sau mọi constraint; status là kết quả lúc constraint được áp dụng. Vì vậy `solved` hoặc partial mix không tự chứng minh chân trụ: dùng residual cuối; constraint sau có thể dịch endpoint trước.

Accuracy full-mix reachable áp dụng khi root có |scaleX|=|scaleY| khác 0 và ancestor matrix khả nghịch; reflection/shear ở ancestors và child scale/endpoint lệch trục theo hợp đồng được hỗ trợ. `unsupported-scale`/`singular` giữ FK; unreachable clamp không stretch, degenerate dùng fallback xác định. Nonfinite arithmetic hoặc residual tức thời full-mix reachable >0.5 trả INVALID_INPUT. Chi tiết miền scale, mix, bend/order và final diagnostic theo `platform/src/engine/IK.md`; không suy mọi status là thành công.

Core IK/model/evaluator/JSON-ZIP được nghiệm thu không thay nghiệm thu renderer/capture/bounds #17 hoặc diagnostics đo chuyển động #18 và authoring/tools/UI #19. Renderer/observation mesh và envelope có IK còn thuộc #17; Session/storage giữ v1 không có nghĩa schema command đã hỗ trợ authoring mesh/deform/constraints. Không nhận Gate 2/3 hoặc performance pass từ PR #55.

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
