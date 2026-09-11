> Các dòng bằng chứng phía dưới là snapshot trước #6. Types hiện được chuyển nguyên nguồn sang [`platform/src/model/types.ts`](../../../platform/src/model/types.ts); semantics vẫn ở contracts.

# Audit hợp đồng v0 phục vụ UX — 11/09/2026

Phạm vi: đọc contracts, architecture, backlog tại repo và bằng chứng Foundation/WebMCP. Không kiểm chứng lại trạng thái GitHub, không triển khai engine, không sửa hợp đồng. Các issue dưới đây là **owner đề xuất cho phần bổ sung**, không phải blocker mới được áp dụng lên Project.

## Kết luận

Hợp đồng đủ rõ để dựng #5 và triển khai validator/evaluator v0. Không thấy mâu thuẫn trực tiếp đáng kết luận giữa shape JSON, types và semantics về region, trim/pivot, tọa độ, keyframes, revision hay jobs. JSON Schema không tự kiểm tra tham chiếu/cycle/trim/key order là chủ ý: README contracts yêu cầu semantic validator bổ sung. TypeScript dùng number/string rộng hơn schema cũng không phải lỗi.

Phần cần chốt sớm là **ghép phiên editor với bytes ảnh, lịch sử và sự kiện**, trước khi #7/#10/#12 được tích hợp. Interface hiện tại là ranh giới module, không phải API ứng dụng đầy đủ; thiếu factory, subscribe hay helper không tự chứng minh implementation bất khả thi. Tuy vậy các hành vi liên module dưới đây cần một nguồn quy định chung để nhóm làm song song không tự chọn khác nhau.

## Các khoảng trống có tác động thực tế

### 1. Vòng đời ảnh và phiên project chưa có hợp đồng ghép — #7 + #10, tích hợp #12

**Bằng chứng:** `contracts/types.ts:37` chỉ đưa metadata vào putAsset; `:61` Commands chỉ nhận/đọc Project; `:79` bytes nằm trong Map theo asset ID. `contracts/semantics.md:62` yêu cầu checkpoint giữ bytes, history/job không mất bytes; `:66` yêu cầu import chỉ thay live project sau validation; `:68` cho phép thay bytes qua metadata/hash mới.

**Khoảng trống:** chưa chỉ ra ai giữ kho bytes của phiên, cách đưa PNG mới vào kho trước batch, cách lấy bundle nhất quán từ revision, và cách đổi phiên sau unpack/recover. Đặc biệt cùng asset ID có hash mới thì undo/checkpoint phải truy xuất bytes cũ; một Map live duy nhất theo ID không đủ nếu bị ghi đè, nhưng Map/snapshot riêng hoặc kho theo hash đều có thể giải quyết.

**Tác động UX:** Import PNG, mở project, thay ảnh, undo và khôi phục phải thành công hoặc giữ nguyên bản đang dùng. Không được đổi tên/hash xong mới phát hiện không có ảnh tương ứng; không được phục hồi rig với texture sai.

**Đề xuất:** mô tả session coordinator/factory và ownership bytes trong #7/#10; #12 dùng cùng coordinator. Acceptance có import thất bại giữ phiên cũ, thay bytes cùng ID → undo/restore giữ hash cũ, chuyển project khi job/autosave đang chạy không trộn phiên. Đây là hợp đồng ghép cần bổ sung, chưa phải lỗi schema hay lý do dừng #5.

### 2. Cập nhật UI và lịch sử dùng chung chưa có mô tả sự kiện — #7, consumer #12/#13

**Bằng chứng:** `backlog.json:188` yêu cầu thông báo revision; `contracts/types.ts:61` không có subscription/history query; `contracts/semantics.md:54` retry không emit write/history lần nữa; `:62` checkpoint được log riêng dù revision không tăng. `architecture.md:66` yêu cầu thao tác hiển thị trong lịch sử.

**Tác động UX:** UI phải thấy lệnh agent, trạng thái undo/redo, checkpoint mới và save đúng thời điểm. Chỉ quan sát số revision sẽ bỏ sót checkpoint. `Commit.changedIds` (`types.ts:47`, semantics `:52`) không đủ làm bản mô tả thay đổi độc lập cho mọi subscriber vì ID được phép trùng giữa collections, song caller có operations vẫn đối chiếu được.

**Đề xuất:** chốt event tối thiểu gồm loại thao tác, project/session, revision và entity collection+ID hoặc payload đủ để đọc lại; chốt cách subscribe/dispose, query undo/redo/checkpoints. Có thể phát invalidation rồi inspect lại toàn bộ trong v0; không bắt buộc xây event bus phức tạp. Test một lệnh ngoài UI chỉ hiện một history entry dù retry; checkpoint xuất hiện không tăng revision.

### 3. Compare và checkpoint là hai mức chức năng khác nhau — #12, phần mở rộng #19

**Bằng chứng:** `contracts/types.ts:66` hỗ trợ tạo/restore checkpoint, không đọc snapshot hay liệt kê checkpoints; `scope.md:12` đưa “so pose” sang bước kế tiếp. `semantics.md:62` checkpoints chỉ sống trong phiên, tối đa 20.

**Kết luận:** không coi thiếu compare API là lỗi v0. UI history/checkpoint khả thi bằng coordinator bổ sung ở mục 2; side-by-side/onion-skin hoặc diff trước/sau không nên được preview như tính năng #5 hay cam kết #12 hiện tại.

**Đề xuất:** thiết kế trước trạng thái tạo/restore checkpoint, thông báo mất sau reload; chỉ thêm compare nếu có issue/acceptance rõ. Không dùng restore để giả việc xem trước checkpoint vì restore là mutation, tăng revision và thêm undo entry.

### 4. Metadata ảnh và fit toàn sequence cần chốt định dạng — #9 + #11

**Bằng chứng:** `backlog.json:260` yêu cầu fit cực trị; `:325` yêu cầu time/bounds/scale. `types.ts:82` có Viewport explicit; `:101` Artifact chỉ chứa ID/MIME/size/hash; `:111` renderPose trả revision + PNG. `semantics.md:76` quy định ZIP manifest time/revision/frame rate nhưng chưa có shape manifest hoặc metadata bounds/scale cụ thể.

**Tác động UX:** xem ảnh phải biết pose nào, zoom/camera nào và liệu kết quả thuộc revision hiện tại; fit một frame có thể cắt tay ở frame khác. Việc metadata không nằm trong Artifact không tự là mâu thuẫn, vì manifest/adapter có thể chứa nó.

**Đề xuất:** #11 chốt manifest/response metadata và #9/#11 thống nhất helper tính bounds/fit theo tập thời điểm. Preview UI có nhãn animation/time/source revision, trạng thái kết quả cũ; không quảng bá “fit mọi cực trị liên tục” nếu mới fit các mẫu đã chọn.

### 5. “Dừng” cần phân biệt job và lệnh đã commit — #11 + #13, hiển thị #12

**Bằng chứng:** `research/webmcp.md:25` hủy qua API trang thất bại; `:37` callback không nhận signal; `:41` commit sync cần inspect + undo. `semantics.md:52` hủy trước commit, sau commit không báo như chưa áp dụng; `:74` terminal job bất biến; `types.ts:114` có cancel(id).

**Kết luận:** đây là giới hạn thực nghiệm đã biết, không phải phát hiện blocker mới. Commands sync không có AbortSignal trong chữ ký không tự là lỗi: adapter có thể kiểm tra signal ngay trước dispatch sync. Async capture/pack/unpack cần truyền signal thật.

**Đề xuất UX:** Cancel job dùng controller/cancel_job của ứng dụng; đã hoàn tất thì giữ kết quả. Sau lệnh sửa đã commit, hành động thích hợp là Undo, không hiện “đã hủy” giả. Trạng thái transport native/bridge/unavailable tách khỏi trạng thái rendering; không có nút chat LLM trong #5/#12 vì chưa có service đó.

## Hướng dẫn cho thiết kế preview

- **#5:** editor/player có entry riêng, khung trống, trạng thái chưa mở project; vùng canvas, object tree, properties, timeline có thể minh họa bố cục nhưng chưa là tính năng animation hoạt động. Không cần dựng một Project không hợp lệ có zero bones để thể hiện empty state: chưa có phiên active là UI state.
- **#12 + #13:** dùng art region PNG, xương/slot, thuộc tính local, animation và timeline; UI và tools dùng cùng state. Setup và animation cần nhãn rõ vì key là giá trị tuyệt đối, không offset (`semantics.md:40`). UI có thể hiển thị độ nếu chuyển đổi nhất quán sang radian, đây là lựa chọn trình bày.
- **Save:** phân biệt “Đã lưu trên trình duyệt” và “Tải gói project”; báo save failure, recovery, kết quả xuất thuộc revision cũ. Không ngụ ý cloud sync.
- **Player:** chỉ mở gói và phát cùng core/renderer, không cần history, checkpoint hoặc editor globals (`contracts/README.md:28`, `semantics.md:62`).
- **Chưa thuộc v0:** mesh, weights, IK, PSD, skins, physics, video/MP4, auto-rig; architecture mô tả hướng dài hạn còn ADR-001 quyết định region-only cho v0 (`contracts/ADR-001.md:7`).

## Kiểm chứng giới hạn

Đây là audit tài liệu và ranh giới integration. Không chạy lại contract tests vì không thay đổi hành vi; test fixture/oracle hiện tại cũng không thể chứng minh lifecycle ứng dụng chưa được triển khai. Các đường dẫn và số dòng tham chiếu bản repo ngày audit; backlog local là nguồn phạm vi, không dùng suy ra trạng thái hiện tại của GitHub Project.
