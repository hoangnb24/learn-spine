# Foundation handoff — #2, #3, #4

Ngày: 10/09/2026. Implementation commit được kiểm tra: `d8a3567ca7f1c8dd823853e48f391fdf0214477e`. Base: `c308ee26f7a4e3c92a6e5c34106c3019c45c3441`. Báo cáo này bổ sung sau commit implementation, không đổi hành vi. Nhánh: `codex/issue-4-project-contract` (tiếp tục nhánh/bản nháp #4 đã có, gộp bàn giao ba issue Foundation độc lập).

## Kết quả và ownership

- #2: `platform/fixtures/source/`, `research/assets.md`. 25 files nguồn/đối chứng có hash, bytes, kích thước, MIME và provenance; 15 placement, năm brief, sơ đồ neo. Art gốc và hiện vật học không bị sửa. Quyền phát hành chưa được kết luận.
- #3: `prototypes/webmcp-probe/`, `research/webmcp.md`. Trang thử, schemas, handler tests, lời gọi agent WebMCP, UI trước/sau và reload. Read/set/retry/error/undo đạt trên tổ hợp đã ghi; cancellation qua API trang chưa đạt, handler cancellation đạt riêng.
- #4: `contracts/`, cập nhật architecture và README sản phẩm. Schema, types, semantic rules, ADR, example hợp lệ/lỗi và mocks. Không xây engine hoặc workspace #5.

Điều chỉnh ownership chỉ gồm README tổng quan để không tiếp tục ghi “chưa có prototype” khi probe đã có. Root package/lock và dữ liệu Spine giữ nguyên.

## Kiểm tra đã chạy

Máy: macOS 26.4 (25E246), arm64; Node.js 22.22.3. Contract tools khóa Ajv 8.20.0, TypeScript 5.9.3. Browser: Codex In-app Browser báo Chrome/152.0.0.0; chi tiết ở webmcp.md.

| Lệnh/phép thử | Actual result |
| --- | --- |
| `node platform/fixtures/source/verify.mjs` | PASS: 25 files, 15 placements, 5 briefs |
| `node --test prototypes/webmcp-probe/state.test.mjs` | PASS: 5 tests, 0 failures |
| `npm test --prefix docs/product/contracts` | PASS: 5 tests, 0 failures |
| `npm run typecheck --prefix docs/product/contracts` | PASS: tsc exit 0 |
| `git diff --cached --check` trước commit implementation | PASS, exit 0 |
| Kiểm tra tất cả link Markdown tương đối trong docs mới | PASS, không có file đích thiếu |
| Agent WebMCP read/set/retry/stale/bad-input/undo | PASS; session.json có sáu lời gọi và output |
| Reload, rediscovery, read | PASS; reload.json, revision 0 |
| Hủy handler bằng AbortSignal | PASS, CANCELLED, không commit |
| Hủy qua API trang bằng AbortSignal | FAIL: callback không nhận signal, commit value99 sau ~1 giây; cancellation.json giữ bằng chứng |

Không chạy Gate 1/2/3 vì chưa có engine/editor/player. Không dùng conformance oracle để khẳng định model/commands đã được triển khai. Không đo hiệu năng animation, chi phí/token hoặc so sánh với Spine.

## Đầu vào downstream sau merge

| Issue | Nhận gì | Trạng thái cần giữ |
| --- | --- | --- |
| #5 | Hợp đồng #4: schema/types/semantics/ADR | Mở Ready sau khi #4 merge và đạt |
| #6 | Fixture region, ví dụ invalid, bộ art/bố trí | Vẫn chờ #5 |
| #9 | PNG, hash, pivots/draw order; trim/world/viewport contract | Vẫn chờ #8; #2 chỉ hoàn thành một dependency |
| #10 | Art bytes/hash, asset-map và quy tắc ZIP/autosave | Vẫn chờ #6 |
| #11 | Snapshot/job interfaces và giới hạn/cancellation | Vẫn chờ #9; phải test hủy bằng controller của ứng dụng |
| #13 | Probe thực tế và hạn chế API; command/transport contract | Vẫn chờ #7/#10/#11; thêm cancel_job do app sở hữu, chạy lại trước quảng bá cancel |
| #14/#20/#21 | Bộ brief và đối chứng; điều kiện gate gốc | Không đánh dấu gate pass từ bằng chứng Foundation |

Readiness hiện là snapshot trên Project. PR chưa merge thì không mở khóa downstream hoặc đóng issue như đã có đầu vào main. Sau merge cập nhật #2/#3/#4 Done, #5 Ready; các issue khác chỉ mở khi đủ mọi dependency. Kết quả hủy ở #3 là giới hạn nghiên cứu đã ghi nhận, corrective implementation nằm trong #11/#13, không bị che bằng việc đánh dấu hoàn tất nghiên cứu.
