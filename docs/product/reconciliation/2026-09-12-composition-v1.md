# Đối chiếu Composition v1 — 12/09/2026

#24/#73/#74/#75 CLOSED/completed · Done/Ready. Chuỗi Composition v1 tạo/xem/sửa đã nghiệm thu theo scope từng issue, gồm editor và native→UI roundtrip. Roadmap #1 giữ OPEN; #22/#23/#25–#29/#51/#52/#70 vẫn Todo/Deferred. Không mở event/audio/deform mixing/generic auto-stop/performance hoặc đầu ra mới. Phần được chọn đã hoàn tất; việc tiếp theo cần ưu tiên sản phẩm mới hoặc quyết định mở lại mục đang hoãn, không tự chọn/mở issue và không suy thành blocker kỹ thuật.

## Mốc hiện hành

Main `fe947b11432c892b6601bedd78d20e0fca6e4dc7` sau PR #82. Snapshot này thay trạng thái đang triển khai trong [lịch sử quyết định đầu ra](2026-09-12-deferred-output.md); không thay evidence hoặc verdict gate.

## Chuỗi bàn giao và bằng chứng

| Issue | Phần được nhận | Bằng chứng và giới hạn |
| --- | --- | --- |
| #24 | Discovery/spec/prototype mixing và chuyển tiếp | Accepted `d539f8d85dd5f66dfd78d50a8f01d4e1c1cee2b3`, PR #72 merge `a25dc95cc6588de5c5a3389fff207a6d9131e0a1`, CI 34685586726 SUCCESS. Truth tables/fixture số walk+wave và stop chân trụ; không phải native/UI capability tại mốc discovery. |
| #73 | Canonical composition data, Session, evaluator và lưu/mở lại theo scope core | PR #77 accepted `b05f4dbae62cf4370bfdfe1a0f61720903f4fd6a`, merge `bfff5e5fcd65371ed9baffd0c891aa54bba7e305`; CI 34686490771/34686490757/34686489418 SUCCESS. Gap legacy Evaluator compile được sửa riêng PR #78 accepted `ec06775147f3e3fa76c1fa601b9a44de8b340158`, merge `d2cf8ed339353d1029481c925aec7017d341bcbf`, CI 34686680117/34686680189/34686668168 SUCCESS; contract/mock-consumer check vào CI. |
| #74 | Native adapter/tools, observation/render metadata, diagnostics và conservative bounds | PR #80 accepted `bbe2797e2e375b94c240c5480426ec8995732ebe`, merge `83f4dd1bd2334075eeb515be068167984596aca0`; CI 34687783505/34687785266/34687785276 SUCCESS. 49 native calls + 5 probes, 18 PNG, actual playback, 22 independent tests. Native artifact reads và ZIP verification qua bridge là bằng chứng riêng; native ZIP download chưa thử tại mốc #74. |
| #75 | Editor/shared Stage và native→UI roundtrip | #75 CLOSED/completed: [PR #82](https://github.com/hoangnb24/learn-spine/pull/82) được reviewer `/root/review_issue24` nghiệm thu Đạt tại `756a409ab1ba01ac1040fb7739a1265c71f8827f`, CI 34689269905/34689267278 SUCCESS, merge `fe947b11432c892b6601bedd78d20e0fca6e4dc7`. [Evidence](https://github.com/hoangnb24/learn-spine/blob/fe947b11432c892b6601bedd78d20e0fca6e4dc7/platform/evidence/issue-75/README.md): 198 unit tests (+1 pre-existing skipped), 24 browser tests, 5 contracts tests; 18 actual native/UI calls (11 final + 7 probes), browser persistence/reopen geometry và bridge ZIP verification. Native ZIP download chưa thử. Native runtime frozen `3cbd7443a9b0869959b35fe29eb2ca0f0c752276`; final head có CSS readability và test/evidence corrections đã được review. |

## Phân biệt bằng chứng

Editor browser/Session kiểm tạo/phát/sửa/mask/timing/frozen coverage, undo/redo, browser recovery và ZIP reopen. Actual native final 11 calls + 7 reviewer probes kiểm hai chiều native↔UI cùng target/time/revision, dirty draft conflict, playback, removal/undo và duration shrink. Không gộp exploratory calls vào 18 lượt cuối; bridge/DOM không được gọi native. Browser save/reload/recover có native evaluate readback bones/regions/meshes trùng. Native artifact read, ZIP được kiểm qua browser/bridge và native ZIP download là các đường khác nhau; đường download native chưa thử.

Native runtime frozen `3cbd7443a9b0869959b35fe29eb2ca0f0c752276`; screenshot checkbox trên `2384f53`, browser ZIP-reopen test/media cập nhật trên `6149f2a`. Final reviewer nhận exact `756a409ab1ba01ac1040fb7739a1265c71f8827f`; không đổi nhãn capture lịch sử thành final runtime. CI 34689004298 từng fail vì test tương tác Session cũ khi ZIP đang decode; test chờ đúng Session/Setup đã sửa và final CI đạt. Chi tiết và hashes ở [evidence #75](https://github.com/hoangnb24/learn-spine/blob/fe947b11432c892b6601bedd78d20e0fca6e4dc7/platform/evidence/issue-75/README.md).

## Phạm vi sản phẩm đã nghiệm thu

Composition v1 hỗ trợ kết hợp/chuyển tiếp transform để tạo, xem và sửa trên trang, dùng chung canonical data/Session/evaluator và tools/editor. Nghiệm thu chỉ trong miền hỗ trợ đã document, không cam kết full Spine parity hoặc production readiness. Legacy animation đơn và deforms của animation đơn giữ behavior được regression kiểm; composition nguồn deform bị từ chối rõ.

Không event dispatch/audio, deform mixing, nested compositions, reverse, root motion extraction, generic auto-stop, performance Polish hoặc đầu ra mới. Stop fixture authored theo chân trụ không chứng minh auto-stop mọi rig. Event metadata policy của discovery không chứng minh dispatch/audio. Mục tiêu và verdict các gate cũ giữ nguyên, đặc biệt performance FAIL 17.8/17.5 ms so 16.7 ms; không tuyên bố 60 fps từ composition tests.

## Trạng thái và việc tiếp theo

#24/#73/#74/#75 CLOSED/completed · Done/Ready. Chuỗi Composition v1 tạo/xem/sửa đã nghiệm thu theo scope từng issue, gồm editor và native→UI roundtrip. Roadmap #1 giữ OPEN; #22/#23/#25–#29/#51/#52/#70 vẫn Todo/Deferred. Không mở event/audio/deform mixing/generic auto-stop/performance hoặc đầu ra mới. Phần được chọn đã hoàn tất; việc tiếp theo cần ưu tiên sản phẩm mới hoặc quyết định mở lại mục đang hoãn, không tự chọn/mở issue và không suy thành blocker kỹ thuật.

Không còn implementation mở trong chuỗi #24→#73→#74→#75. Các issue Deferred không tự Ready khi dependency hoàn tất. Việc chọn hướng tiếp theo thuộc ưu tiên sản phẩm, không hạ acceptance hoặc mở lại toàn MVP.
