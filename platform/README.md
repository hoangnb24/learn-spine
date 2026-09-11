# Workspace animation 2D

Snapshot 11/09/2026 tại main `b6577a3b44b8016a9c7ba3ec9f60fbb869419538`: #5–#13 đã merge, có project region-v0, commands, evaluator, Pixi renderer, storage, observation, editor/player và adapter WebMCP. PR #48 đã merge, tích hợp bridge vào runtime editor và bàn giao workflow robot. Editor và Player có entry riêng; các consumer dùng module entry trực tiếp, `src/index.ts` vẫn là shell. Không phụ thuộc package hay Spine runtime ở root repository.

## Chạy từ clone sạch

Cần Node.js **22.22.3** (file `.nvmrc`; minimum 22.12), npm 10 trở lên. Không cần cài dependencies ở root.

```sh
cd platform
npm ci
npm run typecheck
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:browser
npm run dev
```

Dev: [Editor](http://127.0.0.1:5173/index.html), [Player](http://127.0.0.1:5173/player.html). `npm run preview` phục vụ output đã build; mặc định cổng 4173. Browser tests tự chạy preview trên cổng 4173 (cần để trống cổng này), kiểm tra output production. Không mở dev server cùng cổng với tests.

## Workflow và giao diện bàn giao

Editor: tạo project → chọn/thêm xương → nạp PNG → sửa Setup → tạo animation/đặt key → xem playback → lưu trình duyệt hoặc xuất ZIP. Sau reload dùng Khôi phục bản lưu; Player chỉ mở ZIP được chọn. [Hướng dẫn editor và giới hạn UI](apps/editor/README.md) mô tả runtime, import, autosave và thao tác cụ thể.

- `apps/editor/`, `apps/player/`: React entry độc lập; `apps/editor/runtime.ts` sở hữu Session/Storage chung, `apps/shared/Stage.tsx` dùng renderer hiển thị pose.
- [Model](src/model/README.md): types/schema/validator v0 tại `src/model/`; format 0 region-v0 và format 1 mesh-v1 qua schema riêng; IK core đã merge qua PR #55; xem IK.md bên dưới. `src/index.ts` không phải model.
- [Commands](src/commands/README.md): Session, revision, atomic batch, undo/redo và checkpoints.
- [Engine](src/engine/README.md): evaluate pose thuần, transform/timeline; [renderer](src/render/README.md): Pixi region và capture.
- [Storage](src/storage/README.md): validate PNG/bundle, pack/unpack ZIP, autosave/recover; [observation](src/observation/README.md): ảnh, sequence/preview và jobs.
- `src/adapters/webmcp/{index.ts,bridge.ts,schemas.ts}`: adapter #13 đã merge; việc gắn vào chính runtime editor và chứng cứ robot đã merge qua PR #48. Không coi handler tests là bằng chứng native end-to-end.
- #15 đã bàn giao [mesh-v1](../docs/product/contracts/mesh-v1.md): model v1, Pose version 1 với world mesh arrays và điểm IK sau FK/trước skinning. #16 đã nghiệm thu IK core; #17 đã nghiệm thu renderer/observation mesh+IK; controls authoring và transport schema đã được #19 nghiệm thu. Session/storage và mesh/deform/IK authoring cùng dùng canonical v1; xem [handoff](../docs/product/reconciliation/2026-09-11-mesh-core-handoff.md).

## Gate 1 và Polish

Theo quyết định 11/09/2026, Gate 1 đã được Orchestrator nghiệm thu chức năng và merge; #14 Closed/Done, #15–#20 Done; #21 In Progress / Ready, #22 còn Blocked. Lần đo nguồn `a91c27cd93541b7b320b9b54c2451894b8fcd018` có p95 editor 17.8 ms / player 17.5 ms, vượt 16.7 ms trong Vite dev/React StrictMode, Chromium 153/SwiftShader; cloning instrumentation và presentation chưa tách. [Báo cáo lịch sử](https://github.com/hoangnb24/learn-spine/blob/55bd54fdde2a1922f5c6ec4863b0baaee8f210fe/docs/product/results/experiment-1/README.md) giữ FAIL hiệu năng.

[#51](https://github.com/hoangnb24/learn-spine/issues/51) chuẩn hóa phép đo/profile/baseline, rồi [#52](https://github.com/hoangnb24/learn-spine/issues/52) tối ưu/retest p95 <=16.7 ms: P2/Polish/Deferred, không chặn giai đoạn chức năng. [Đối chiếu có ngày](../docs/product/reconciliation/2026-09-11-gate1.md) ghi mốc main, nguồn đo và nghiệm thu.

## Lựa chọn công cụ và kiểm tra

Phiên bản được xác nhận với tài liệu chính thức và npm registry ngày 11/09/2026, pin chính xác trong manifest/lockfile: React 19.3.0, Vite 8.3.0, React plugin 6.1.1, TypeScript 7.0.2, Vitest 5.0.0, Playwright 1.63.0. React chạy tại client; renderer PixiJS đã được bổ sung ở #9. Manifest/lockfile là nguồn phiên bản hiện tại.

Nguồn: [React versions](https://react.dev/versions), [Vite runtime requirement](https://vite.dev/guide/), [Vite multi-page build](https://vite.dev/guide/build.html#multi-page-app), [Playwright test setup](https://playwright.dev/docs/intro). Lockfile là phiên bản cài thực tế; thay đổi stack không làm thay hợp đồng v0.

`npm test` kiểm tra entry có thể render khi không có DOM, assets, live project và Player không mang panel editor. `npm run test:browser` kiểm tra cả hai trang build, reload, điều hướng, lỗi runtime/console, keyboard và bố cục 390px. GitHub Actions chạy clean install, typecheck, tests, build và Chromium smoke khi `platform/` hoặc workflow đổi. Báo cáo browser được upload 14 ngày, không dùng làm nơi lưu duy nhất của fixture.

Gate 1 đã đo và PR #48 đã merge như trên; chưa có tuyên bố đạt hiệu năng hoặc kiểm tra Safari/Firefox. Bằng chứng visual thực tế và handoff nằm trong `evidence/issue-5/`.

Mesh core extension (#15): [versioned contract](../docs/product/contracts/mesh-v1.md),
[fixtures](fixtures/mesh/synthetic.ts), [checks and limits](evidence/issue-15/README.md).
Format 1 supports core mesh/deform evaluation and accepted #17 rendering/capture;
editor mesh/IK authoring and transport writes are accepted through #19. Existing region-v0 projects retain their format and geometry.

## IK hai xương — #16

Model v1 đã có `ik-v1` và `ikConstraints`; evaluator giải sau FK, trước mesh/region.
[Hợp đồng IK](src/engine/IK.md) ghi miền scale hỗ trợ, mix/bend/order, fallback và
chẩn đoán target/endpoint trên pose cuối. [Bằng chứng](evidence/issue-16/README.md)
bao gồm public seek, roundtrip ZIP và hồi quy robot. Đây là lõi IK; authoring constraints/UI được bổ sung ở #19; không phải nghiệm thu Gate 2 hoặc hiệu năng.

[Đối chiếu authoring → Gate 2](../docs/product/reconciliation/2026-09-11-authoring-gate2.md) ghi commands/paging/migration đã nhận và đầu vào Gate 2 còn cần kiểm.

[Diagnostics API #18](src/diagnostics/README.md) đã nghiệm thu và validate_project/measure_motion đã được #19 đăng ký tool với fixed policy/bounded reports.

[Commands v1](src/commands/README.md) · [Panel Lưới / IK](apps/editor/mesh-controls/README.md): new project v1, mở v0 giữ nguyên tới explicit upgrade; inspect_deforms có vertex-offset paging và setVertexDeforms sửa local key lớn.

## Gate 2 → Gate 3 — 11/09/2026

Gate 2 đã được nghiệm thu trên main `538f939d9c76e29a55bc7680f8e36943095e4326`: [report/ZIPs/playback](../docs/product/results/experiment-2/README.md). Default diagnostics không bao region corners; gate có phép đo public corners bổ sung, không nâng capability của tool. #21 chuẩn bị protocol/initial states/budgets trước chín native runs bằng fresh agents; chưa ghi nhận runs đã bắt đầu/đạt. [Đối chiếu](../docs/product/reconciliation/2026-09-11-gate2.md). Physics/performance/native WebMCP không được Gate 2 nhận pass.
