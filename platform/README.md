# Workspace animation 2D

Nền tảng #5: Editor và Player có entry riêng, cùng nhập `src/index.ts`. Đây là khung trống, chưa tạo project v0, nhập PNG, animation, lưu trữ hoặc kết nối agent. Không phụ thuộc package hay Spine runtime ở root repository.

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

## Giao diện bàn giao

- `apps/editor/`, `apps/player/`: hai React entry; HTML tương ứng ở `index.html`, `player.html`.
- `apps/shared/`: màu sắc, bố cục, empty state, điều hướng thật giữa hai trang; Setup/Animate chỉ là nhãn giữ chỗ, không phải tab hoạt động.
- `src/index.ts`: trạng thái shell `empty` bất biến, **không phải model project**. Không dùng bones rỗng để giả một project v0 hợp lệ.
- `src/model`, `commands`, `engine`, `render`, `storage`, `observation`, `adapters`: ranh giới rỗng cho từng owner theo [hợp đồng](../docs/product/contracts/README.md). Các module chỉ `export {}`, không mock tính năng thành công.
- #6 sở hữu model; chuyển types/schema về một nguồn duy nhất và sửa consumers/links trong cùng PR nếu cần. #7/#8/#10 tiếp tục ở module riêng sau #6. #12 tích hợp UI khi các khả năng đã có.
- Lockfile và cấu hình do #5 khởi tạo. Issue sau chỉ thay khi có nhu cầu và ghi ảnh hưởng trong PR; không dùng root package để bổ sung dependency sản phẩm.

## Lựa chọn công cụ và kiểm tra

Phiên bản được xác nhận với tài liệu chính thức và npm registry ngày 11/09/2026, pin chính xác trong manifest/lockfile: React 19.3.0, Vite 8.3.0, React plugin 6.1.1, TypeScript 7.0.2, Vitest 5.0.0, Playwright 1.63.0. Chỉ dùng client React, chưa cần renderer hay router.

Nguồn: [React versions](https://react.dev/versions), [Vite runtime requirement](https://vite.dev/guide/), [Vite multi-page build](https://vite.dev/guide/build.html#multi-page-app), [Playwright test setup](https://playwright.dev/docs/intro). Lockfile là phiên bản cài thực tế; thay đổi stack không làm thay hợp đồng v0.

`npm test` kiểm tra entry có thể render khi không có DOM, assets, live project và Player không mang panel editor. `npm run test:browser` kiểm tra cả hai trang build, reload, điều hướng, lỗi runtime/console, keyboard và bố cục 390px. GitHub Actions chạy clean install, typecheck, tests, build và Chromium smoke khi `platform/` hoặc workflow đổi. Báo cáo browser được upload 14 ngày, không dùng làm nơi lưu duy nhất của fixture.

Chưa đo animation/performance gates, chưa kiểm tra Safari/Firefox. Bằng chứng visual thực tế và handoff nằm trong `evidence/issue-5/`.
