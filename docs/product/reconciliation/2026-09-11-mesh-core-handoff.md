# Bàn giao mesh core — 11/09/2026

## Mốc nghiệm thu

PR #56 head `e809b86072bfe8381edf5bc86669b885c23b4637` được reviewer Đạt; Orchestrator đã merge thành `91bdd3af82683ea3c9391b28ccd51d6c6b786449` và đóng #15 completed. Bằng chứng bàn giao: 89 unit, 2 oracle độc lập, 5 contract, 15 browser, 2 renderer; typecheck/build và hai CI pass. #15 đã Closed (completed)/Done sau PR #56 tại main `91bdd3af82683ea3c9391b28ccd51d6c6b786449`; #16 In Progress/Ready, đang tích hợp IK vào shared main này; #17 In Progress/Ready, sole author `/root/implement_issue17`; #18 vẫn Blocked chờ #16, #19 chờ #17/#18. #51/#52 giữ Todo/Deferred/P2 ở Polish.

[Hợp đồng mesh-v1](https://github.com/hoangnb24/learn-spine/blob/91bdd3af82683ea3c9391b28ccd51d6c6b786449/docs/product/contracts/mesh-v1.md), [fixture](https://github.com/hoangnb24/learn-spine/blob/91bdd3af82683ea3c9391b28ccd51d6c6b786449/platform/fixtures/mesh/synthetic.ts), [evidence](https://github.com/hoangnb24/learn-spine/blob/91bdd3af82683ea3c9391b28ccd51d6c6b786449/platform/evidence/issue-15/README.md).

## Đầu vào đã merge

Model tại `platform/src/model/types.ts`, `index.ts`, `project-v1.schema.json`, `mesh.ts` đã hỗ trợ format 0 và 1 bằng schema riêng. V0 giữ strict region-only; v1 yêu cầu `region-v0`, có mesh/deform phải khai báo thêm `mesh-v1`. Migration 0→1 tường minh giữ identity/revision/geometry; không tự nâng cấp, 1→0 bị từ chối. `ik-v1` vẫn bị từ chối đến khi #16 tích hợp.

`evaluate(Project, PoseRequest): Result<Pose>` tại `platform/src/engine/index.ts` trả `poseVersion:1`, `bones`, `regions`, `meshes:DrawMesh[]` (rỗng với region-only). DrawMesh gồm `slotId`, `attachmentId`, `assetId`, `vertices`, `uvs`, `triangles`; vertices là world XY sau deform/skinning, chỉ áp world-to-screen, không cộng lại slot-bone/attachment transform. Interleave regions/meshes theo `project.slots` và `slotId`, không vẽ hết regions rồi mới meshes.

Mesh vertices/deform dùng bind-world XY; deform là offset tuyệt đối trước skinning. Weights không tự normalize; tổng cho phép sai lệch 1e-5. Bind matrices rõ ràng và invertible; UV theo ảnh decode, (0,0) góc trên trái; geometry độc lập độ phân giải texture. Arrays Pose là bản sao mới. Fixture `platform/fixtures/mesh/synthetic.ts` có expected setup `[12,20,14,20,12,22]`, end key `[18,20,16,24,15,22]`; metadata synthetic không phải PNG bundle.

Renderer prepare/draw/camera hiện vẫn từ chối `mesh-v1`, giữ prepared region cũ khi prepare thất bại. Observation chưa có mesh bounds; `platform/src/observation/bounds.ts` trả null khi gặp mesh. Model/evaluator support không đồng nghĩa renderer/tool support. Session giữ/read/save/reopen v1 nhưng feature list và command schema còn region-only; `putAnimation` chưa nhận deform authoring. Không có mesh UI/tools, diagnostics hoàn chỉnh, Gate 2 hoặc performance pass từ PR #56.

Điểm tích hợp #16 đã ghi trong engine sau FK worlds và trước mesh skinning. Hợp đồng tương lai `solveIK(bones, constraints, locals, worlds): Result<IKDiagnostic[]>` chỉ sửa fresh maps của lần evaluate; rebuild worlds trước skinning. Shape IK/diagnostics trong mesh-v1 là thỏa thuận bàn giao chưa được loader hiện tại nhận; downstream phải dùng kết quả #16 đã merge/nghiệm thu, không giả định `ik-v1` đã có.

## Downstream và ownership

#17 sở hữu `platform/src/render/` (mesh buffers, texture, geometry/camera và capabilities) cùng phần mesh support/bounds tại `platform/src/observation/` và tests render/observation phù hợp. Đây là phạm vi capture/bounds đã giao, không thay model/evaluator/IK. Dùng raw DrawMesh world vertices, canonical slot order, đúng UV và world-to-screen; mở support từng consumer sau khi kiểm chứng, không bật capabilities trước implementation. Giữ region regression và prepared resources khi lỗi. Texture-resolution test cần ảnh thật; đo geometry cost theo acceptance hiện có, không nhận Gate 1 performance pass. Sole author `/root/implement_issue17`, đã được Orchestrator giao từ main trên; #18 chưa được mở cùng đợt vì còn chờ #16.

#18 vẫn Blocked chờ #16 merge/nghiệm thu. Đầu vào mesh từ #15 đã sẵn sàng: weights/bind/deform, final world vertex arrays và fixtures ở trên. Dùng chúng cho triangle/anchor/loop diagnostics; không tự skin lại bằng giả định region transform. Phần foot target/endpoint phải nhận diagnostic contract thật từ #16 sau merge, không coi shape tương lai trong mesh-v1 đã được triển khai. Ownership vẫn `platform/src/diagnostics/` và tests riêng; không sửa renderer/bounds do #17 đang sở hữu.

#19 vẫn Blocked chờ #17/#18; #13 đã hoàn thành. Session/storage hiện đọc và giữ v1 là đầu vào có sẵn, chưa phải mesh/deform command authoring. Mở rộng command input/schema/atomic/revision/undo, adapter và UI trên canonical model v1; không tạo format song song hay tự quảng bá mesh/IK chỉ vì model/evaluator có support. Chờ renderer/capture/capabilities của #17 và diagnostics/IK bàn giao qua #18/#16; kiểm tra storage roundtrip/player theo khả năng thật khi triển khai. Ownership command modules, adapter và editor controls; phối hợp shared schema/entry thay vì ghi đè.

## Điều chỉnh nguồn điều phối

Cập nhật checklist/verdict #15, Project #15 Done và #17 In Progress/Ready. #18 giữ Blocked chờ #16; dependency kỹ thuật không đổi (#15 đã thỏa, không bỏ lịch sử cạnh). #19 tiếp tục chờ #17/#18. Bodies #17–#19 và backlog nêu input/API đã có và consumer còn thiếu; architecture/workspace README bỏ giả định chưa có mesh model/Pose. Roadmap và execution plan ghi trạng thái mới. Không thay acceptance Gate 2/3, không nhận renderer/IK/tools hay performance pass từ mesh core. Record Gate 1 và bàn giao PR #53 vẫn giữ lịch sử có ngày.
