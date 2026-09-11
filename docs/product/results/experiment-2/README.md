# Gate 2 — khăn, thạch và chân trụ

Ngày 11/09/2026 · PR #64. Các phép đo và workflow dưới đây đã chạy; nghiệm thu cuối
thuộc reviewer độc lập trên đúng PR head. Không có thay đổi production, solver,
ngưỡng gate hoặc tài liệu điều phối. Physics **NOT TESTED**. Hiệu năng chỉ ghi số đo,
không nhận performance pass và không mở #21 trước nghiệm thu.

[Viewer](viewer.html) cho xem chuỗi PNG, full/half và sáu video playback thực tế.
[Khăn](run-03/scarf.zip), [thạch](run-03/jelly.zip), [chân trụ](run-03/ik.zip) là các
gói project có PNG, mở được bằng Editor/Player. Đây là đầu vào bàn giao cho #21 sau
khi #20 được nghiệm thu. Art T01 chỉ dùng đánh giá nội bộ theo
[manifest nguồn](../../../../platform/fixtures/source/manifest.json).

## Brief và cách dựng

[LOCK](../../../../platform/fixtures/deformation/LOCK.md) được commit tại
`d836e8c87c5a8a095d9e5761ff87ef6991f7e7b6` **trước lần đo đầu**. Recipe ban đầu
được commit `370ddc1` trước run01; fixture hiện tại từ `56829eb`, được đo đầy đủ
trên `75ac03a`. [author.ts](../../../../platform/fixtures/deformation/author.ts)
bắt đầu bằng project v1 rỗng có một root; nhập PNG qua prepared token đã validate,
rồi dùng public `putBone`, `putAsset`, `putMesh`, `setVertexWeights`, `putAnimation`,
`setVertexDeforms`, `putIKConstraint`, `putRegion`, `putSlot`. Không nạp sẵn rig hay
thay whole Project để bỏ qua authoring. Command request/result và mọi revision
nằm trong `log` của ba file measurements.

Khăn có 85 đỉnh, hai cột neo cổ; mid/tip trễ 0,25 giây. Thạch có 143 đỉnh, hàng
đáy 110–142 cố định, cả dải mặt dịch chuyển cứng; hai eye ROI nguồn đã khóa trước
đo là `[474,466,542,576]` và `[715,466,783,576]` trên PNG 1254². Chiều cao được đo từ
bốn góc UV nội suy barycentric vào canonical mesh world geometry, so với setup
không animation. Khăn t=0 có tip lệch pha, không gọi t=0 là setup.

Chân dùng ba PNG thigh/shin/foot của robot, hai xương dài 100 px, target `[120,-100]`,
stance toàn vòng. Art bàn chân gắn vào target cố định với pivot ở cổ chân; IK
endpoint và bone `foot` vẫn được đo độc lập, không dùng vị trí ảnh làm proxy cho
solver. Khoảng cách hip–target quan sát được nằm trong tầm với 0–200 px.

## Kết quả số và hình

| Phép đo | Khăn | Thạch | Chân trụ |
| --- | ---: | ---: | ---: |
| Sai tổng weights lớn nhất | 0 | 0 | Không có mesh |
| Weight nhỏ nhất | 0 | 0 | Không có mesh |
| Trôi neo/đáy/foot lớn nhất, px | 0 | 0 | 4,49e-14 |
| Đổi chiều cao mắt lớn nhất | — | 1,67e-15 tương đối | — |
| Sai vị trí nối vòng lớn nhất, px | 7,11e-15 | 7,11e-15 | 0 |
| Sai vector vận tốc nối vòng lớn nhất, px/s | 1,84e-4 | 1,72e-11 | 7,54e-4, gồm các góc ảnh |
| Lật tam giác / giao chéo cạnh không kề | 0 / 0 | 0 / 0 | Không có mesh |
| PNG mẫu/vòng gồm key cực trị | 65 | 61 | 61 |

Ngưỡng giữ nguyên: weights không âm/tổng sai ≤1e-5; neo và IK ≤0,5 px; mắt ≤5%;
loop position ≤0,5 px và vector velocity ≤max(0,5 px/s, 5% sampled peak).
Phần vận tốc được lưu **từng điểm** với vector hai phía, tốc độ đỉnh đã lấy mẫu và
ngưỡng tương ứng; bảng trên chỉ là tóm tắt, không dùng max velocity toàn hình để
thay ngưỡng từng điểm. Diagnostics #18 dùng 60 khoảng thời gian, key times và t±h,
với 211/190/186 lần evaluate tương ứng. Đây là bằng chứng lấy mẫu hữu hạn và các
cực trị kênh đã tác giả đặt, không tuyên bố chứng minh mọi thời điểm liên tục.

[Raw khăn](run-03/scarf-measurements.json), [raw thạch](run-03/jelly-measurements.json),
[raw IK](run-03/ik-measurements.json) có project/canonical pose/anchors/geometry/eyes/
loop values. [Phép tính độc lập](run-03/arithmetic-verification.json) kiểm tra signed
areas, crossing của cạnh không kề, weights, eye height và anchor residual từ raw
Pose đã lưu. Shared vertices cùng chỉ số giữ liên tục vùng nối; xem hình/video bổ
sung để đánh giá bề mặt, không chỉ dựa vào triangle signs.

Reviewer yêu cầu bổ sung góc ảnh region vì bone origin không bắt được seam do xoay.
[run06](run-06/ik-region-corners.json) đo 12 góc của ba ảnh bằng public
`render.corners(region, asset, Pose.regions.world)` với cùng h/times/ngưỡng. Sai vị
trí bằng 0; sai vận tốc lớn nhất 0,000754437 px/s; tỷ lệ lớn nhất với ngưỡng từng
điểm 0,000314818. Control cố ý xoay target 0→0,1 rad giữ nguyên origin: diagnostics
origin-only vẫn pass, nhưng cả bốn góc ảnh foot fail position. Control này không
được xuất làm fixture bàn giao.

Tác giả đã xem ảnh cực trị, full/half và Observation PNG: khăn giữ cổ và có nhịp
trễ; thạch nén–giãn rõ nhưng mắt/mặt đọc được, đáy không trượt; bàn chân đứng ổn và
cổ chân không hở khi gối chuyển động. Không thấy rách, crop hoặc thiếu art trong
các hình/video đã ghi. Đối chiếu theo mục tiêu các bài 86, 94–96 và T01 pose
references, không yêu cầu khớp pixel hay parity với Spine. Reviewer xem playback
và ghi quyết định hình/nhịp riêng trên PR; nhận định tác giả không thay bước đó.

## Seek, lưu/mở lại và quan sát

Run03 xuất bằng nút tải ZIP thật, đóng Editor, mở lại trên trang mới và nhập vào
Player context độc lập. Project giữ nguyên và các pose kiểm tra trùng canonical
geometry; Player không tải app Editor hoặc nguồn PNG ngoài gói. Full/half ZIP đều
có hash PNG đúng; metadata texture đổi kích thước nhưng geometry/rig/animation giữ
nguyên và mọi sampled XY so sánh bằng nhau.

[run05](run-05-browser.log) chạy lại **riêng** playback/seek trên chính ZIP run03:
3/3 passed, mỗi fixture ở cả Editor/Player có ≥3 vòng thực tế, 20 seek đảo thứ tự
và một case sát duration. Video là canvas stream khi ứng dụng thật đang phát;
chuỗi PNG riêng do renderer xuất, không bị gọi nhầm là video playback.

Oracle seek lấy từ successful draw của lần phát tiến đầu tiên. Native input có
thể làm tròn số rất sát 2 thành 2 rồi wrap về 0; khi đó reference là initial draw
đã ghi trong cùng forward stream. Lưu requested/effective/normalized/referenceTime;
không bỏ mẫu và không tạo expected bằng gọi evaluate-seek lần nữa. Editor chỉ
hiển thị time với hai chữ số thập phân, nên effective input được đọc **trước**
React format lại display. [Kiểm tra hiện vật](final-verification.json) xác nhận
120 seeks, sáu boundary cases, ZIP/PNG hashes, semantic full/half, observation và
các archive lịch sử. Sai seek lớn nhất nằm dưới 1e-5; giữ cả delta so với frame
cuối được yêu cầu khi UI wrap để audit việc chuẩn hóa.

[run04](run-04-browser.log): 3/3 bridge `validate_project`, `measure_motion` và
`render_pose` cases passed, có chín PNG thật. Đây là **browser bridge**, không nhận
native WebMCP pass. Inclusive render_pose times cho ba lần gọi: khăn 157,2–181,2 ms;
thạch 65,6–68 ms; IK 156,5–173,1 ms. Bao gồm validate/evaluate/prepare/draw/PNG encode,
được đo ngoài cửa sổ frame performance; không lấy làm GPU time.

## Hiệu năng và môi trường

[Môi trường](environment.json): cùng Mac Studio M4 Max 36 GB, macOS arm64,
Node22.22.3/npm10.9.8, Chromium153.0.8010.12, ANGLE Vulkan **SwiftShader** như Gate1.
Vite dev, canvas1280×720, DPR1, warmup5s rồi đo30s, khoảng1.800draws/cửa sổ.
MediaRecorder dừng và release tracks trước warmup; không có Playwright video.
Instrumentation không clone pose trong cửa sổ đo, chỉ lưu timestamps/CPU duration.

| Mẫu / app | p95 rAF interval, ms | p95 actual draw interval, ms | p95 draw CPU submission, ms |
| --- | ---: | ---: | ---: |
| Khăn Editor | 16,7 | 17,6 | 0,2 |
| Khăn Player | 16,7 | 17,5 | 0,1 |
| Thạch Editor | 16,7 | 17,6 | 0,2 |
| Thạch Player | 16,8 | 17,5 | 0,2 |
| IK Editor | 16,7 | 17,6 | 0,1 |
| IK Player | 16,7 | 17,6 | 0,2 |

Năm raw windows tại run03 `*-performance.json`; thạch Player tại
[run05](run-05/jelly-player-performance.json), là window chưa chạy do harness run03
bị dừng. Số trong bảng làm tròn; raw giữ chính xác. rAF/draw interval không phải
physical display presentation. CPU submission không bao gồm GPU hoàn tất và không
phải tổng frame. Không đặt hay suy ra performance pass Gate2; #51/#52 giữ việc
profile/tối ưu Gate1. Baseline Spine không đo, không tuyên bố nhanh hơn Spine.

## Tái lập và lịch sử

Từ `platform/` với Node22:

```sh
npm ci
npm run typecheck
npm test
npm run build
npx playwright install chromium
GATE2_RUN=fresh npx playwright test -c deformation.playwright.config.ts gate.spec.ts
GATE2_INPUT_RUN=fresh GATE2_RUN=fresh-observation npx playwright test -c deformation.playwright.config.ts capture.spec.ts corners.spec.ts
```

Chọn tên run mới để giữ lịch sử. Nếu bỏ GATE2_RUN, config sinh thư mục local mới.
Để tái lập phần recheck trên bundle đã có (không cần dựng lại/thu lại PNG):
`GATE2_INPUT_RUN=run-03 GATE2_RUN=fresh-recheck npx playwright test -c deformation.playwright.config.ts recheck.spec.ts`.
Recheck có cửa sổ thạch Player vì window đó thiếu trong lịch sử; không sửa fixture.

Kiểm tra raw đã bàn giao: từ repo root chạy
`python3 platform/tests/e2e/deformation/verify.py docs/product/results/experiment-2/run-03`
và `python3 docs/product/results/experiment-2/verify-final.py`.
Serve repo root bằng HTTP rồi mở `docs/product/results/experiment-2/viewer.html`.

[TypeScript](typecheck.log), [162 unit tests](unit.log), [build](build.log) passed;
build còn cảnh báo bundle lớn đã tồn tại. CI và reviewer phải gắn final PR head.
Run03 full harness: 2 passed/1 failed; run04: observation3 passed/seek3 failed;
run05: seek3 passed; run06: corner positive+negative control1 passed. Không xóa các
failed result để tạo câu chuyện full-suite xanh.

[Run01](run-01/README.md) giữ lỗi foot art và seek oracle ban đầu; [run02](run-02/README.md)
giữ lượt bị dừng do cwd output. Raw của hai run được đóng thành các
[archive](archive/) chia theo fixture và history, có inventory/hash; `verify-final.py`
đã kiểm từng file phục hồi được. Run03–06 giữ trực tiếp, kèm README/log failure.
Nguồn fixture không đổi từ run03 sang05/06; chỉ harness/coverage được sửa. Negative
control nằm riêng trong corner report, không phải project cho #21.
