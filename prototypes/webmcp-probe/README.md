# WebMCP probe — #3

Trang thử độc lập, không engine/React/PixiJS/Spine, không gọi dịch vụ ngoài và không cần npm install. Mục tiêu: agent khám phá tools đăng ký bởi trang, đọc/sửa cùng trạng thái UI, undo, kiểm tra lỗi/retry/reload/cancel.

## Chạy từ clone

Cần Node.js 22 cho tests và Python 3 cho server, trình duyệt hỗ trợ JavaScript modules. Ở root repo:

```sh
node --test prototypes/webmcp-probe/state.test.mjs
python3 -m http.server 8766 --bind 127.0.0.1
```

Mở `http://127.0.0.1:8766/prototypes/webmcp-probe/`. Nếu port đang dùng, chọn port khác và ghi URL thực tế vào bằng chứng. Root npm dependencies phục vụ bài Spine không cần cài cho probe này.

Trang ưu tiên `document.modelContext.registerTool`, fallback feature-detect `navigator.modelContext.registerTool` cho môi trường cũ. Không inject polyfill hoặc giả tools. Nếu API không có/registration fail, UI báo chưa đăng ký đủ. Có công cụ đăng ký chưa tự chứng minh agent gọi được.

Theo [Chrome docs](https://developer.chrome.com/docs/ai/webmcp/) kiểm tra 10/09/2026, origin trial bắt đầu Chrome 149; thử local có cờ `chrome://flags/#enable-webmcp-testing` và cần relaunch. Probe không thay flag hoặc đăng ký origin trial. Môi trường đã chạy là Codex In-app Browser báo Chrome/152.0.0.0, macOS 26.4 arm64, localhost secureContext=true, document API có sẵn. Không suy ra cùng kết quả trên Chrome độc lập hoặc agent khác.

## Input/output

[tool-contract.json](tool-contract.json) giữ input schemas và schema kết quả logic; [state.mjs](state.mjs) là handler dùng chung. Tools:

- `probe_read({})` → `{ok:true,value,revision,canUndo}`.
- `probe_set({value,expectedRevision,requestId,delayMs?})`: integer -100..100; delay integer 0..5000 ms, chỉ dùng test hủy/race.
- `probe_undo({expectedRevision,requestId})`: phục hồi một lần sửa, tăng revision.

Lỗi trả `{ok:false,error:{code},value,revision,canUndo}`. Adapter đăng ký tools trả `{content:[{type:"text",text:JSON.stringify(result)}],isError:!result.ok}`. Sai kiểu không mutate. Retry request thành công cùng payload trả kết quả cũ; đổi payload cùng ID trả REQUEST_ID_REUSED; revision cũ trả REVISION_CONFLICT. Giữ 1.000 request thành công và 100 undo entries trong phiên. Reload reset về 0/revision0 và xóa history/dedup/log. Đây là semantics của probe disposable, không là storage của product.

## Kịch bản agent thực tế

1. Mở trang, dùng chức năng khám phá WebMCP của agent, ghi danh sách tool/schema. Không gọi handler bằng console/inspector để thay bằng chứng này.
2. Gọi `probe_read({})`: 0/revision0. Chụp UI trước.
3. Gọi `probe_set({value:7,expectedRevision:0,requestId:"native-set-1"})`: 7/revision1. Đối chiếu UI và chụp sau.
4. Retry payload đó: vẫn revision1. Lệnh mới dùng revision0 phải trả REVISION_CONFLICT.
5. Thử `value:"bad"` với request mới, revision1: INVALID_INPUT, không đổi 7/revision1.
6. Gọi `probe_undo({expectedRevision:1,requestId:"native-undo-1"})`: 0/revision2; đối chiếu UI/chụp ảnh.
7. Reload, khám phá lại và đọc lại: 0/revision0. Không dùng tool handle của document cũ.
8. Nút “Thử hủy trước khi sửa” kiểm tra handler trực tiếp, phải CANCELLED và giữ revision. Nút “Thử hủy qua API trình duyệt” dùng getTools/executeTool với delay1000 và abort sau100ms; đây là **page API test**, không phải agent transport cancellation.

Browser client trong lần chạy dùng `tab.capabilities.get("webmcp")`, `fetchTools()` và `tools.call(name,input)`. Tên/inputs lấy từ discovery trên trang, không thực thi qua evaluate. Muốn chạy ở môi trường khác, dùng đường gọi WebMCP thật của agent đó và giữ phân loại bằng chứng.

## Bằng chứng và giới hạn

[evidence/session.json](evidence/session.json), [before.png](evidence/before.png), [after-set.png](evidence/after-set.png), [after-undo.png](evidence/after-undo.png), [reload.json](evidence/reload.json) và [cancellation.json](evidence/cancellation.json) ghi kết quả thực tế; [báo cáo](../../docs/product/research/webmcp.md) là kết luận.

Đọc/sửa/undo thật: **native-pass trong tổ hợp được ghi nhận**. Hủy trực tiếp handler: **handler-only pass**. Hủy qua API trang: **chưa đạt**; callback không nhận signal và lệnh vẫn commit. Không được biến lỗi này thành nhận định hủy thành công. #11/#13 phải có job.cancel với AbortController do ứng dụng sở hữu và chạy lại kiểm tra trước khi công bố capability cancel.

Ví dụ Chrome docs tháng 9 truyền chuỗi JSON vào executeTool, nhưng API trong môi trường này báo “requires an object input”; nút thử dùng object theo lỗi thực tế. Client transport không quảng bá cách truyền AbortSignal cho tools.call trong tài liệu đã có, nên chưa đo agent-side cancellation. Không sửa môi trường người dùng để ép pass. Chưa thử origin trial, cross-origin, navigator fallback hoặc các phiên bản trình duyệt khác.
