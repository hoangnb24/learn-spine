# #3 — Kết quả thử WebMCP

10/09/2026. **Agent đã khám phá và gọi tools qua đường WebMCP của trình duyệt trong phiên thử này.** Read, set, retry, lỗi input/revision và undo đạt. Hủy qua API trang chưa đạt; cần xử lý ở #11/#13 trước khi công bố khả năng hủy của sản phẩm.

## Môi trường và cách gọi

- Host macOS 26.4 (25E246), arm64; Node 22.22.3; Python HTTP server bind loopback port 8766.
- Agent Codex desktop, Browser skill; Codex In-app Browser user agent Chrome/152.0.0.0. Đây là tổ hợp được đo, không tuyên bố mọi Chrome 152 hoặc agent khác tương đương.
- Trang localhost, secureContext=true; `document.modelContext.registerTool` có sẵn, `navigator.modelContext` không có. Không bật/tắt flag, cài extension, thay policy hoặc dùng origin-trial token.
- Đường gọi: agent → browser tab capability webmcp → fetchTools → tools.call → callback của tool đăng ký trên trang. Không dùng page evaluate, inspector hoặc gọi handler trực tiếp để làm bằng chứng native.
- Bằng chứng phát hiện và từng lời gọi: [session.json](../../../prototypes/webmcp-probe/evidence/session.json). Trạng thái UI và callback log đối chiếu nhau.

## Kết quả theo từng khả năng

| Kiểm tra | Kết quả thực tế | Phân loại |
| --- | --- | --- |
| Discovery | Đọc được 3 tools với schemas: probe_read/set/undo | native-pass |
| Read → set | 0/revision0 → 7/revision1; UI cùng giá trị | native-pass |
| Retry | Cùng request trả 7/revision1, không tăng revision | native-pass |
| Revision cũ | REVISION_CONFLICT, không đổi trạng thái | native-pass |
| Input sai kiểu | INVALID_INPUT, không đổi trạng thái | native-pass |
| Undo | 7/revision1 → 0/revision2; UI cùng giá trị | native-pass |
| Reload và rediscovery | Phiên mới 0/revision0, tool được gọi lại | native-pass |
| Hủy handler | AbortSignal trực tiếp ngăn commit, CANCELLED | handler-only pass |
| Hủy qua page API | Abort sau 100ms, callback không có signal; lệnh vẫn commit value99 sau khoảng 1000ms | fail / chưa công bố cancel |
| Hủy từ agent transport | Tài liệu client không có tham số cancel cho tools.call | unavailable trong đường gọi hiện có |
| Fallback navigator / browser khác | Chưa chạy | untested |

`native-pass` ở đây nghĩa là lời gọi agent qua WebMCP đã khám phá của trang, khác với handler-only. Không khẳng định đường triển khai bên trong host giống trình duyệt Chrome độc lập. Nếu lần chạy khác không có API hoặc agent không khám phá/gọi được, phân loại native-unavailable; probe có thể hoàn tất nghiên cứu bằng kết luận đó. Không dùng nhãn native-pass để che lỗi cancellation hoặc để đóng Gate 3.

Ảnh: [trước](../../../prototypes/webmcp-probe/evidence/before.png), [sau set](../../../prototypes/webmcp-probe/evidence/after-set.png), [sau undo](../../../prototypes/webmcp-probe/evidence/after-undo.png). [Log cancellation](../../../prototypes/webmcp-probe/evidence/cancellation.json) và [ảnh trạng thái](../../../prototypes/webmcp-probe/evidence/cancellation.png) giữ bằng chứng chưa đạt.

## Điểm khác tài liệu và quyết định tích hợp

[Chrome overview](https://developer.chrome.com/docs/ai/webmcp/) (cập nhật 07/08/2026) nêu origin trial từ Chrome 149 và local testing flag. [Imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api) (01/09/2026) dùng document.modelContext và mô tả AbortSignal. [Draft specification](https://webmachinelearning.github.io/webmcp/) được đọc ngày 10/09, bản ngày 09/09/2026; chưa là chuẩn W3C.

Trong môi trường thực tế, executeTool của page từ chối string input (“requires an object input”) và nhận object. Dù đưa AbortSignal vào options, callback không được truyền signal. Vì vậy adapter phải feature-detect và kiểm lại semantics; không dựa version string để suy ra đầy đủ hỗ trợ.

**Corrective scope của #11/#13:** job chạy dưới AbortController do ứng dụng giữ; tool `cancel_job(jobId)` và nút Dừng gọi cùng Observation.cancel. Hủy job đang chờ/chạy phải ngăn publish artifact/commit ở điểm có thể hủy, trả terminal state rõ. Hủy transport có thể là best effort nhưng không thay cơ chế hủy của ứng dụng. Chạy race cancel-before/during/after-completion trên môi trường thực tế trước khi quảng bá capability. Đây là yêu cầu bàn giao cho các issue có sẵn, chưa phải implementation của probe.

Với write sync/atomic, không thể rút lại commit đã xong bằng việc đóng lời gọi: cần inspect + undo/checkpoint. #7 phải giữ quy tắc revision/retry khi agent không nhận được response. Nếu tổ hợp khác không có WebMCP, có thể xây bridge định tuyến cùng handlers; adapter phải báo `transport: bridge`, scope theo project/tab, trả cùng schema và không tự mở truy cập ngoài project. Chưa cần cài hoặc vận hành bridge trong #3.

## Tái lập và giới hạn nghiệm thu

[README probe](../../../prototypes/webmcp-probe/README.md) có lệnh chạy, input/output schemas và kịch bản từng bước. Test Node kiểm tra handler và race; browser evidence là phép thử agent thực tế riêng. Không có engine/renderer/animation trong trang thử. #13 có đầu vào nghiên cứu sau merge nhưng vẫn chờ #7/#10/#11; #21 phải đánh giá lại với công cụ animation thực tế, không dùng probe để ghi Gate 3 đạt.
