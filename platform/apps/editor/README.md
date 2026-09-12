# Editor integration — #12

`Editor` renders the existing dark/teal workspace with a bone tree, shared Pixi canvas,
Setup property form, animation/key timeline, history/checkpoints and file controls.
No editable Project lives in React state: the canonical `Session` owns the project,
bytes and history. Forms contain temporary input drafts; commits use commands.

## Public integration boundary for #13 / #14

Import `editorRuntime` from `apps/editor/runtime.ts`. The default `Editor` instance
uses exactly this singleton. A host/test can instead construct `new EditorRuntime(storage)`
and mount `<Editor runtime={runtime}/>`; do not create a second runtime beside the
already mounted default Editor.

- `runtime.session`: read-only getter, `Session | null`. Null means no project opened.
  Read `session.inspect()` or `session.snapshot()`. Dispatch `session.apply(batch, prepared?)`,
  undo/redo/checkpoint/restore directly with the normative revision/request ID contract.
  UI invalidates through `session.subscribe`; external writes appear in tree, inspector,
  canvas, timeline, history, revision and autosave. There is no separate UI apply protocol.
- `runtime.openBundle(bundle, recovered = false)`: awaits real `storage.validateBundle`
  through `prepareBundle`, then atomically creates/opens the canonical session. Use this
  entry to load an imported bundle. An external `session.open(prepared)` is also observed:
  save status is reset, stale work is aborted and ephemeral UI playback/selection reset.
- `runtime.subscribe(listener)` / `getVersion()`: external-store invalidation interface.
  The callback carries no Project; inspect the current session. `session.sessionId` changes
  on open even when project ID and revision match. Capture it before async preparation;
  pass the original expectedRevision to the final synchronous command.
- `runtime.storage`: the injected canonical Storage; used for pack/unpack/autosave/recover.
  Adapter recipes can use storage with `session.snapshot()` without reading DOM or globals.
- `newProject`, `openFile`, `importPng(files, boneId)`, `save`, `recover`, `exportFile`,
  `cancel`: application actions. Async operations own an AbortController and discard
  completion if superseded or the session lifetime changes. `cancel` aborts pending I/O;
  it never claims to undo a command that already committed. `dispose` releases subscriptions,
  timers and pending work when a custom runtime host is permanently unmounted.

`request`, `apply`, `report` are UI conveniences, not transport tools. Adapters must keep
explicit caller request IDs/revisions, validate unknown input and call Session directly.
No WebMCP/bridge globals or fake capabilities are installed here. Observation jobs remain
owned by #11 and their transport/job integration by #13; the cancel control in #12 covers
its pending load/import/save/export work, and playback has a separate pause button.

## File behavior

Create project → select or add a bone → Nạp PNG. Each selected PNG is attached to the
selected bone with its center pivot at that bone's origin; use one bone per body part
and Setup position/rotation/scale to arrange it. The image attachment can be reassigned
to another bone in the asset list. The complete multi-file import validates and commits
as one batch. Source PNG headers only supply candidate dimensions; trusted Storage
performs real PNG decode, hash and aggregate-budget validation before commit.

Autosave is debounced 600 ms after commands. A success only marks the revision actually
committed to IndexedDB. Failed saves stay unsaved and keep export available. The last
saved project ID is a localStorage convenience pointer; bundles live in IndexedDB.
After reload, choose **Khôi phục bản lưu** to recover it. Export is a separate portable
ZIP download and never claims the current revision was saved in the browser.

## Interaction and limits

- Setup edits local x/y, rotation in **radians**, scaleX/scaleY and parent/name.
- Animate creates a two-second looping animation; choose a property, time and absolute
  value, then Đặt key. It inserts/replaces that property's key at the current time.
  The UI offers linear/stepped; imported Bezier channels remain intact when only the value is edited; choosing linear/stepped explicitly replaces its curve. Core/commands support full Bezier and arbitrary duration/loop.
- The tree presents parents before children without changing the canonical collection order.
- Key fields refresh from the current selected key after external commands, carry the inspected revision/session, and retain full imported Bezier control points.
- Tree and canvas bone handles share selection. Inspector editing is Setup-only and
  says so explicitly; key editing is in the timeline. Advanced drag gizmos, curve editor,
  attachment pivot editor and configurable animation duration are outside this minimal UI.
- Checkpoints and undo/redo retain only the current session's history. Opening another
  package resets them according to the commands contract.
- Camera fits 61 samples across the selected animation and keeps that viewport stable
  during playback. This is a sampled fit, not a mathematical extrema guarantee for
  arbitrary Bezier channels. It does not modify the project. Zoom and fit are UI-only.
- Player imports only its chosen exported ZIP; it never recovers editor IndexedDB,
  reads an editor global, fetches source workspace paths or imports EditorRuntime.

## Checks

From `platform`: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:browser`.
Default browser CI includes `tests/e2e/editor/workflow.spec.ts` via its browser-suite entry.
For only the editor workflow: `npx playwright test -c editor.playwright.config.ts`.
The integration tests start the real Vite application on 4182 so direct external Session
commands can be tested through its normal module boundary without production test globals.
The default suite additionally checks built editor/player shell navigation on 4173.

## Entry integration #14

The production editor entry now registers the generic WebMCP bridge with the exact
`editorRuntime.session`, `editorRuntime.storage` and one app-owned ObservationService.
`webmcp.ts` subscribes to Session lifetime changes, invalidates downloaded links on
reopen and tears registration/jobs/URLs down on unload/HMR. Persisted pagehide keeps
its document registration for back/forward-cache restoration. A latest-result download
link includes source revision and says when it differs from the active project.
Editor receives its capability status through `agentStatus`; readiness does not claim
an agent is currently connected. Native absence is displayed explicitly.

Gate scripts and evidence live in `tests/e2e/robot` and
`docs/product/results/experiment-1`. Gate1 is not passed merely by this integration.

## Phối chuyển động (Composition v1)

Trong **Chuyển động**, chọn animation có sẵn hoặc **Tạo phối chuyển động**.
Nút **Phối · tên** chọn composition; Stage, thời gian, Phát/Tạm dừng và thanh kéo
đều dùng target đó. Chuyển target hoặc mở project đặt lại thời gian về 0 và dừng
phát. Setup vẫn xem tư thế Setup. Player riêng giữ hành vi animation hiện có.

Bảng **Phối chuyển động** có tên, độ dài và lặp. **Thêm lớp** cho chọn nguồn,
cách chạy (theo thời gian hoặc giữ một thời điểm), thời điểm nguồn bắt đầu/tốc độ,
thứ tự, cách trộn, mức trộn 0–1, bắt đầu/tăng dần/kết thúc/giảm dần. Chọn rõ từng
xương và thuộc tính trong **Thuộc tính của lớp**; xương con không tự được chọn.
Thứ tự số tăng dần quyết định lớp dưới → trên; thứ tự phải khác nhau. Tốc độ 0
giữ thời điểm nguồn nhưng mức tăng/giảm vẫn chạy theo thời gian composition.

**Thêm chuyển tiếp** giữ nguồn đi ra ở thời điểm đã chọn và tăng dần nguồn đi vào.
Chọn mask ở cả hai phía: mọi thuộc tính có key đi ra phải có key và được chọn ở
phía đi vào. Nếu muốn dừng một chuyển động đang chạy, đặt kết thúc lớp cũ đúng
lúc chuyển tiếp bắt đầu và dùng nguồn dừng đã dựng sẵn. Đây không phải nút tự
động dừng mọi rig. Nguồn giữ thời điểm dùng dữ liệu mới nhất của nguồn, không
phải bản chụp lịch sử. Biến dạng lưới trong nguồn chưa phối được.

**Áp dụng phối chuyển động** gửi cả bản nháp qua public Session, là một bước
Hoàn tác/Làm lại. Thiếu coverage, nguồn biến dạng, thứ tự trùng hoặc dữ liệu sai
hiện lỗi và giữ project/revision/lịch sử nguyên vẹn; không tự thêm key. Nếu agent
sửa project khi có bản nháp, giao diện giữ nháp, báo thay đổi và khóa Áp dụng.
**Bỏ nháp và tải bản mới** nhận bản hiện tại một cách tường minh. Khi chưa sửa
nháp, native edits và undo/redo tự cập nhật form và Stage theo revision.
Chuyển sang composition khác hoặc đóng panel bỏ bản nháp chưa áp dụng.

Editor dùng canonical `evaluateTarget`; camera dùng `targetBounds` cho toàn target.
Bounds là bao bảo thủ nên có thể dư khoảng trống, nhất là IK. Nếu không tính được
bounds/geometry, Stage báo lỗi và ẩn hình/provenance cũ; không âm thầm dùng camera
của nguồn. Thu phóng >100% là lựa chọn người dùng có thể cắt hình; **Vừa khung**
khôi phục envelope. Lưu trình duyệt và Tải/Mở gói giữ cùng dữ liệu composition,
không thêm exporter. Session history không được lưu trong gói.

[Hợp đồng canonical](../../src/model/COMPOSITION.md) ·
[Tools/observation](../../src/adapters/webmcp/COMPOSITION.md) ·
[Bằng chứng và cách tái lập #75](../../evidence/issue-75/README.md).
