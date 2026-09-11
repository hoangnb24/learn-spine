# ADR-MVP — đề xuất phạm vi sau ba gate

Ngày 11/09/2026 · **PROPOSED / AWAITING OWNER DECISION** · [Issue #22](https://github.com/hoangnb24/learn-spine/issues/22).

## Quyết định được đề nghị

Đề nghị giữ stack hiện có và chọn MVP hẹp phục vụ **PNG đã tách bộ phận → agent dựng rig/tạo animation → quan sát/sửa cục bộ → ZIP chỉnh sửa tiếp + web Player**. Đầu tiên dùng trong workflow nội bộ có người xem và quyết định chất lượng; chưa phát hành production. Giữ performance ở Polish theo quyết định 11/09, không mở đồng loạt discovery.

Đây là phương án để chủ dự án chốt, **chưa phải MVP approved hoặc tuyên bố MVP feasible**. Gate 1 được nhận chức năng theo ngoại lệ chủ dự án, còn phép đo hiệu năng FAIL; Gate 2 và Gate 3 được nhận trong phạm vi riêng. Không đủ căn cứ nói cả ba gate đạt trọn ngưỡng ban đầu. PR này chỉ chuẩn bị quyết định; #22 chưa được đóng và các việc phụ thuộc quyết định vẫn chờ.

Đánh đổi chính: giữ PNG tách sẵn và web Player giúp dùng lại đường đi đã kiểm chứng nhưng người dùng vẫn phải chuẩn bị art, chưa có PSD/video/game-engine export. Tiếp tục chức năng trong khi Polish Deferred giúp kiểm tra giá trị workflow sớm, nhưng không có cam kết 60 fps hoặc trải nghiệm production. Nếu chủ dự án cần 60 fps như điều kiện trước khi tiếp tục, phương án thay thế là chỉ ưu tiên #51→#52 rồi quyết định lại phạm vi; không đổi engine chỉ từ số cadence hiện có.

## Bằng chứng làm căn cứ

Mốc đọc code: main `564d9eaea2ad6a98fb74672ca9c18931e5b720ac` ([PR #67](https://github.com/hoangnb24/learn-spine/pull/67)). [Đối chiếu ba gate](../reconciliation/2026-09-11-three-gates.md) giữ đầy đủ provenance và các ngoại lệ; bản đề xuất không sửa report/rubric lịch sử.

| Đã đo/được nhận | Ý nghĩa cho phương án | Giới hạn phải giữ |
| --- | --- | --- |
| [Gate 1](https://github.com/hoangnb24/learn-spine/blob/fe112ca002513e3767715e9d32ecbfb58dde833a/docs/product/results/experiment-1/README.md): native robot, sửa wave, undo/atomic failure, ZIP reopen và Player độc lập; 24 pose Editor/Player ≤1e-5, PNG cùng máy trùng bytes | Đường đi region rig → animation → xuất có bằng chứng | p95 draw interval 17.8/17.5 ms **FAIL** so 16.7 ms; dev/StrictMode, Chromium SwiftShader, instrumentation clone chưa cô lập; không đo physical presentation. Accepted head `13bba23ceeda484aaf6e8b262b7bbceb2fc3c386`, merge `b6577a3b44b8016a9c7ba3ec9f60fbb869419538` |
| [Gate 2](https://github.com/hoangnb24/learn-spine/blob/fe112ca002513e3767715e9d32ecbfb58dde833a/docs/product/results/experiment-2/README.md): authored khăn/thạch/chân trụ, anchors/eye ROI/loop, seek, full/half texture, ZIP/playback | Có thể đưa mesh/deform và IK hai xương trong miền hợp đồng vào workflow hẹp | Physics **NOT TESTED**; browser bridge không native pass. Region corners chỉ là supplement dùng public `render.corners`, default diagnostics chưa bao đủ. Sampled checks không chứng minh mọi thời điểm. Accepted `fb143ae0afe50b0e2af6c4952f96c2f1f81fd42f`, merge `538f939d9c76e29a55bc7680f8e36943095e4326` |
| [Gate 3 report](https://github.com/hoangnb24/learn-spine/blob/fe112ca002513e3767715e9d32ecbfb58dde833a/docs/product/results/experiment-3/README.md), [aggregate](https://github.com/hoangnb24/learn-spine/blob/fe112ca002513e3767715e9d32ecbfb58dde833a/docs/product/results/experiment-3/aggregate.json): robot 2/3, wave 3/3, scarf 2/3 = 7/9; đủ ≥2/3 từng brief với ≤900 s, ≤100 calls theo protocol; tám ZIP emit mở lại Editor/Player | Native agent tạo và sửa được qua tools; đủ cơ sở đề nghị tiếp tục có giới hạn | Robot 1 fail môi trường trước native call; scarf 1 fail thiếu public observation/outside-native evidence, không chứng minh project fail/rescue. Scarf 1 tổng budget/rescue UNKNOWN: chỉ biết 57 native + 1 discovery, 193.3775 s. Chín lượt là feasibility experiment, không phải thống kê reliability |

Gate 3 accepted head `d6f18420a0651845b95933da36b79b523cfc6bf9`, merge `fe112ca002513e3767715e9d32ecbfb58dde833a`, [CI 34585694942 SUCCESS](https://github.com/hoangnb24/learn-spine/actions/runs/34585694942). Source/harness/protocol frozen `57eed3122782fe1c8b2d5eb536bc1e27a4ebc360` trên production `538f939`. Giữ wave property-order false trong scorer gốc cùng structural supplement đã được reviewer nhận; wave 2/scarf 2 có crop viewport trung gian và later full preview/Player; scarf 3 manual 59 khác audited 57. Review sampled images/playback records không có nghĩa reviewer trực tiếp xem mọi WebM. Không suy native cancellation hay performance từ Gate 3.

**Chưa biết:** tổng tokens/chi phí, provider model version sâu hơn nhãn `gpt-6-astra`/medium, baseline Spine tương đương, tỷ lệ thành công ngoài ba brief, nhiều loại art/máy/browser, mức can thiệp ở workflow thực tế, native cancellation và độ bao phủ production. Vì vậy chưa tính ROI, speedup hoặc chi phí một animation.

**Giả định để chủ dự án chốt:** người dùng đầu tiên chấp nhận tự tách PNG và dùng trên web; cần project chỉnh sửa tiếp hơn video; có thể xem và chọn kết quả trước sử dụng. Gate chứng minh thao tác có cấu trúc và sửa cục bộ, chưa chứng minh nhu cầu thị trường hoặc tiết kiệm thời gian so quy trình hiện tại. Nếu các giả định này sai, ưu tiên discovery cần đổi trước khi triển khai mở rộng.

## Kiến trúc khuyến nghị từ hợp đồng đang chạy

| Thành phần | Đề nghị giữ | Căn cứ và điều kiện xem lại |
| --- | --- | --- |
| Giao diện | TypeScript + React + Vite, Editor/Player entry riêng trong `platform/`; phiên bản theo lockfile | [Editor runtime](../../../platform/apps/editor/runtime.ts) dùng một Session, React giữ state giao diện; [Player](../../../platform/apps/player/) độc lập. Xem lại nếu tác vụ nền/multi-user thành yêu cầu; chưa thêm server |
| Lõi | Model versioned + Session commands duy nhất sở hữu project/history; evaluator thuần theo thời gian | [Commands](../../../platform/src/commands/README.md), [engine](../../../platform/src/engine/README.md). Giữ revision/requestId, atomic batch, undo/checkpoint và lỗi rõ. Format 0 giữ region-only; format 1 khai báo `region-v0`, `mesh-v1`/`ik-v1` khi cần; [migration](../contracts/mesh-v1.md) 0→1 tường minh, không hạ 1→0. Xem lại khi semantics mới đòi migration |
| Renderer | PixiJS 8, nhận Pose v1 từ evaluator; regions/meshes theo slot order | [Renderer](../../../platform/src/render/README.md) không tự giải IK. Geometry world-space dùng chung Editor/Player/observation giúp tránh hai engine khác nhau. #51 cần tách bottleneck trước khi quyết định đổi renderer; không suy CPU submission nhanh là frame pass |
| Lưu trữ | JSON + PNG trong ZIP portable; IndexedDB autosave tại browser, ZIP là đầu ra bàn giao | [Storage](../../../platform/src/storage/README.md) validate schema/hash/PNG/limits, autosave atomic; không có cloud sync. ZIP không lưu undo history. Xem lại nếu cần cộng tác, lưu nhiều thiết bị hoặc vượt limits; không coi giới hạn dung lượng validator là hiệu năng đã đạt |
| Agent/quan sát | WebMCP adapter mỏng dùng cùng Session/Storage/ObservationService; browser/agent đã kiểm chứng | [Adapter 28 tools](../../../platform/src/adapters/webmcp/README.md) dùng schemas, paging/revision; [observation](../../../platform/src/observation/README.md) snapshot gắn revision. Không tạo project mutable riêng hoặc automation DOM thay native acceptance. Khi native unavailable hiển thị rõ; chỉ cân nhắc adapter khác sau thử môi trường đích |

Không lấy Spine runtime/dependencies ở root sang sản phẩm. Kiến trúc riêng đã đi qua các workflow trên; thay bằng Spine chưa có baseline và nghiên cứu giấy phép tương ứng để biện minh. Điều này không khẳng định engine riêng có full Spine parity.

## Phạm vi và điều kiện nhận được đề xuất

Đầu vào là bộ PNG đã tách với bố trí/pivot và brief rõ, trong giới hạn [storage](../../../platform/src/storage/README.md). Phạm vi có region rig cha/con, transform keys và curves hiện có, idle/wave; mesh/weights/deform cho phụ kiện mềm và IK hai xương **trong miền scale/target của [hợp đồng IK](../../../platform/src/engine/IK.md)**. Không bao physics, animation mixing, auto-segmentation hoặc mọi constraint của Spine.

Một bàn giao nội bộ được đề nghị chỉ nhận khi: người xem đồng ý chuyển động; agent có public create→observe→edit evidence gắn revision; kiểm pose giữa key/cực trị và playback; sửa đúng vùng cho phép; lỗi batch không sửa dở và undo/checkpoint giữ phần đã đạt; ZIP chứa đủ PNG mở lại Editor và Player độc lập. Với mẫu gate, giữ nguyên ngưỡng/rubric lịch sử; với brief mới phải khóa yêu cầu trước run, không suy pass từ tool success hay diagnostics `passed` đơn lẻ. Region rotation cần public corner check bổ sung cho tới khi coverage được xử lý. Không áp số liệu mẫu làm bảo đảm cho mọi project.

Đầu ra cam kết **nếu phương án được duyệt**: project ZIP chỉnh sửa tiếp và phát bằng web Player; PNG/preview/sequence phục vụ quan sát. Video đã ghi trong gate là evidence, không phải exporter video của sản phẩm. Hiệu năng vẫn Deferred #51→#52, chưa cam kết 60 fps; không nâng ngưỡng 16.7 ms, không hạ gate hồi tố. Native cancellation chưa được nhận; kiểm soát I/O/job ở module không đồng nghĩa dừng toàn bộ native agent đã được chứng minh.

## Thứ tự đầu tư được đề xuất

Tất cả hàng dưới **giữ Deferred hiện tại**, không đổi priority field, dependency, mở việc hoặc cấp quyền implementation trong ADR. Thứ tự là đề nghị đầu tư để chủ dự án quyết định, không phải lịch. #51→#52 vẫn nhánh Polish riêng, không thêm cạnh phụ thuộc #22.

| Thứ tự đề nghị | Issue/trạng thái giữ nguyên | Outcome và lý do/điều kiện xem lại |
| --- | --- | --- |
| 1, trước mở rộng tính năng | [#51](https://github.com/hoangnb24/learn-spine/issues/51) Deferred → [#52](https://github.com/hoangnb24/learn-spine/issues/52) Deferred | Chuẩn hóa baseline/profile rồi tối ưu/retest p95 ≤16.7 ms đúng phạm vi issue; phân tách instrumentation/scheduler/render trước đổi stack. Không chặn tiếp tục chức năng đã được chủ dự án cho phép; mức ưu tiên đầu tư cần chủ dự án chốt |
| 2, discovery đầu tiên khi cần bớt chuẩn bị art | [#23](https://github.com/hoangnb24/learn-spine/issues/23) Deferred | PSD mapping/update giữ rig, stable IDs và policy trim/rename/delete. Giảm thao tác nhập art nhưng thêm parser/migration; chỉ mở khi người dùng xác nhận chuẩn bị art là nút thắt, chưa hứa importer production |
| 3, chỉ khi web Player chưa đủ đầu ra | [#28](https://github.com/hoangnb24/learn-spine/issues/28) Deferred | Chọn một đầu ra đích và prototype timing/crop/toolchain. Ưu tiên sau #23 theo giả định web hiện tại; đưa lên trước #23 nếu người dùng cần video/engine ngay. Không làm tất cả exporter |
| Sau nhu cầu motion cụ thể | [#24](https://github.com/hoangnb24/learn-spine/issues/24) Deferred | Semantics mixing/transitions/events/audio, test vectors và kiểm nghe; chỉ khi một clip hiện tại không đáp ứng. Có ảnh hưởng evaluator/time semantics nên chưa mở |
| Sau nhu cầu biến thể art | [#25](https://github.com/hoangnb24/learn-spine/issues/25) Deferred | Skins/linked mesh/clipping và ownership deform; chờ use case dùng chung rig, tránh thêm migration chỉ để đạt parity |
| Sau giới hạn rig cụ thể | [#26](https://github.com/hoangnb24/learn-spine/issues/26) Deferred | Path/transform constraints và thứ tự solve; chờ rig không thể đáp ứng bằng FK/IK hiện có |
| Sau các nhánh trên, nếu thật sự cần mô phỏng | [#27](https://github.com/hoangnb24/learn-spine/issues/27) Deferred | Physics seek/reset/export tái lập; Gate 2 không kiểm physics. Cần thiết kế determinism trước tích hợp, không gọi deform authored là physics |
| Cuối, tách khỏi MVP PNG | [#29](https://github.com/hoangnb24/learn-spine/issues/29) Deferred | Ảnh phẳng→tách lớp/rig đề xuất; chất lượng phần bị che, dịch vụ/chi phí/quyền art chưa biết. Chỉ nghiên cứu khi người dùng không thể cung cấp art tách sẵn; chưa gửi art ra dịch vụ |

Hai corrective có căn cứ được đề nghị để chủ dự án cân nhắc, **chưa tạo issue hay code**: (1) đưa region-corner loop coverage vào diagnostics công khai, outcome có rotation-only negative control đã fail đúng và hồi quy mẫu gate, không đổi policy âm thầm; (2) làm vòng native observation/audit đầy đủ và kiểm lifecycle/cancellation trên môi trường đích, outcome có public transcript, budget/rescue provenance và dừng rõ ràng. Hai failure Gate 3 không chứng minh lỗi engine; cần phân biệt môi trường với thiếu evidence trước khi sửa. Nếu chủ dự án muốn claim reliability/cost, khóa protocol mới có số mẫu và ngân sách phù hợp, ghi đủ tokens/cost/intervention; không diễn giải lại chín lượt cũ.

## Ghi nhận quyết định và bước tiếp theo

**Quyết định chủ dự án: CHƯA CÓ.** Đề nghị chốt một phương án ở đầu ADR: MVP nội bộ PNG→ZIP/web Player, giữ stack, chấp nhận performance tiếp tục Deferred; ưu tiên Polish rồi discovery theo nhu cầu xác nhận. Duyệt phương án không tự duyệt deploy, chi phí/dịch vụ, full parity hay toàn bộ discovery implementation.

Sau quyết định, Orchestrator giao updater ghi nguyên quyết định/ngày/phạm vi, đồng bộ #22/README/scope và tracker; chỉ đổi trạng thái các việc được cho phép. Nếu không chấp nhận ngoại lệ hiệu năng, giữ quyết định MVP chờ #51→#52 và xem lại số đo. Review tài liệu Đạt chỉ xác nhận đề xuất đúng bằng chứng, không thay quyết định sản phẩm và không tự hoàn tất #22.

## Kiểm tra bản đề xuất — 11/09/2026

Nội dung đề xuất được kiểm tra tại commit `0ae337ddb05772cc00a2458aaa07571e7583ef06` (chỉ ba file docs trên base `564d9ea`); phần ghi kết quả này được bổ sung sau kiểm tra, không đổi production. Môi trường macOS 26.4 arm64, Node 22.22.3, npm 10.9.8, Playwright Chromium hiện có trên máy.

| Lệnh từ root worktree | Actual result |
| --- | --- |
| `npm ci --prefix platform` | 70 packages cài từ lockfile; audit 0 vulnerabilities tại lần chạy này |
| `npm run typecheck --prefix platform` | Exit 0 |
| `npm test --prefix platform` | 163 passed, 1 skipped (scorer Gate 3 cần GATE3_RUN); không gọi lượt skipped là pass |
| `npm run build --prefix platform` | Exit 0, còn warning chunk >500 kB như trước |
| `npm run test:browser --prefix platform` | 19/19 passed, 9.9 s; real browser Editor/Player/storage/authoring/bridge. Không phải native gate hoặc benchmark mới |
| `npm run dev --prefix platform` | Vite ready tại 127.0.0.1:5173; HTTP GET `/index.html` và `/player.html` đều 200; server đã dừng sau kiểm tra |
| Kiểm tra Markdown relative targets của ba file bằng Python pathlib + regex | 45/45 đường dẫn tồn tại trước bổ sung mục này |
| `git diff --check` | Exit 0 |

Đã cài dependencies sạch trong worktree riêng; không chạy lại thao tác clone/auth vì repo đã checkout. Chromium đã có sẵn nên không chạy lại bước tải browser/OS dependencies. Browser suite sinh lại ảnh/ZIP evidence cũ trong worktree; đã loại đúng các output do lần kiểm tra này tạo khỏi diff để giữ nguyên historical evidence. Không sửa source/schema/API, không chạy lại native Gate 1–3, không claim kiểm visual mới từ HTTP 200. Fixtures/scripts/contracts tái lập đều đã link đến file trong repo; report lịch sử là bằng chứng gate, các kết quả trên chỉ xác minh tài liệu và cách chạy.
