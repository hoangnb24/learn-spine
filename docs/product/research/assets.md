# #2 — Art và bộ mẫu đối chứng

Kiểm tra: 10/09/2026. Kết quả: 17 PNG dùng làm đầu vào (15 mảnh robot, 1 khăn, 1 thạch), 2 ảnh nguồn lịch sử và 6 ảnh/GIF đối chứng được khóa trong [manifest](../../../platform/fixtures/source/manifest.json). Không tạo/sửa art, không sao chép runtime Spine. Bộ này phục vụ nghiên cứu trong repo hiện có; chưa kết luận quyền phát hành công khai.

## Dùng đúng file

| Bộ | File đầu vào và provenance | Pivot/bố trí và phạm vi |
| --- | --- | --- |
| Robot | `exercises/robot/images/parts/*.png` theo 15 ID trong manifest; [README](../../../exercises/robot/README.md), [prompts](../../../exercises/robot/prompts.json), [crop manifest](../../../exercises/robot/parts-manifest.json) | [robot-layout.json](../../../platform/fixtures/source/robot-layout.json): joint local XY/radian, pivot bottom-left theo pixel PNG đã cắt, logicalScale, draw order. Ba mảnh chân phải được mirror; slot foot-left dùng ảnh foot-right và ngược lại. |
| Khăn | `exercises/robot/images/parts/scarf-tail.png`, bản 256×96 từ ImageGen 2048×768; [bài 83](../../../lessons/083-editor-scarf-linked-mesh.md) | Pivot đề xuất giữa cạnh trái, logical size 153.6×57.6, neo quay -20°. [Bài 84](../../../lessons/084-editor-scarf-anchor.md) và [85](../../../lessons/085-editor-robot-scarf-mesh.md) mô tả gắn cổ và weights. |
| Thạch | `exercises/soft-character/images/jelly.png`, 1254×1254; [README](../../../exercises/soft-character/README.md) ghi ImageGen 08/09 | Pivot đề xuất normalized bottom-left (0.5,0.145) tại vùng đáy nhìn thấy, logical size 300×300. Đây là seed dựng fixture mới, cần chọn chính xác contour/đỉnh ở #15/#20; không coi tọa độ màn hình editor cũ là tọa độ project. |

Các thông số crop sheet chỉ giữ provenance. Khi đưa PNG đã cắt vào v0, dùng `originalWidth/Height = pixelWidth/Height`, `trimX/Y = 0`; pivot bottom-left nhân logicalScale, width/height nhân cùng scale, attachment transform identity tại joint. Rotation joint đã là radian; không đổi lần nữa. Nếu giữ canvas trước trim, phải dùng công thức trim trong [hợp đồng](../contracts/semantics.md) thay vì trộn hai cách.

Bố trí robot được đọc từ dữ liệu placement tác giả viết (`robot.json`, script `build_robot.py`); chỉ chuyển số vị trí, không chạy runtime hoặc nhập nguyên JSON Spine. Đây không phải bản export rig dựng tay. Region mẫu #4 chỉ dùng body và hợp đồng mới.

## Năm bài thử và sơ đồ neo

[Cases](../../../platform/fixtures/source/cases.json) chứa brief, assets, vùng quan sát, số đề xuất và lesson/reference IDs. [Sơ đồ neo](../../../platform/fixtures/source/anchors.svg) độc lập với schema engine:

1. Robot idle: nhún thân nhẹ, đầu/tay trễ; xem khe khớp và bàn chân.
2. Robot wave: tay phải vẫy rồi về; xem khoảng cách với mặt, khuỷu/cổ tay và nối vòng. Bài sửa sau giữ nguyên kênh thân.
3. Khăn: bốn cột đỉnh; weights anchor/mid/tip lần lượt 100/0/0, 50/50/0, 0/50/50, 0/0/100. Giữ cổ, xem đuôi chẻ, mép và chỗ vai che.
4. Thạch: vùng mắt có cùng tỷ lệ body/crown; đáy cố định với hàng chuyển tiếp. Vùng normalized trong cases chỉ là lựa chọn ban đầu từ ảnh nguồn, phải chuyển thành vertex IDs chính xác khi dựng native fixture.
5. Chân trụ: chain hai đoạn 90/90, hip (0,180) hạ về (0,145), target (0,0) cố định; chọn bend sign ở hợp đồng IK. Đáp án hình học độc lập, không lấy số đo runtime cũ làm pass cho engine mới.

Gate 1/2 trong [experiments](../experiments.md) vẫn là acceptance chính thức. Các file `editor-capture-reference` là ảnh/GIF chụp editor; `runtime-capture-reference` là ảnh runtime cũ. Cả hai chỉ làm đối chứng, không là art đầu vào và không chứng minh project mới lưu/mở lại được.

## Nguồn/quyền sử dụng

Robot, khăn, thạch có ghi nhận ImageGen trong repo, robot được tách nền theo lịch sử README. Không tìm thấy giấy phép phát hành riêng cho bộ art trong các tài liệu nguồn đã đọc. Mọi record được đánh dấu `provenance-recorded-distribution-unreviewed`, `redistributionCleared: false`: đủ phân biệt nguồn để tiếp tục thử nội bộ, không phải lời cấp quyền hoặc kết luận pháp lý. Không đưa bộ này lên demo công khai trước khi xác nhận quyền hoặc thay art.

Không chọn robot parts-study-v1/v3, concept, jelly-v2, mint/helmet variants cho bộ tối thiểu. Sheet v2 có caro RGB, chỉ giữ làm nguồn lịch sử; chỉ các PNG đã tách là rig input. Jelly có alpha thấp ở ngoài contour, không dùng alpha >0 để tự lấy bounds. Một số ảnh chụp có đuôi `.png` nhưng bytes là JPEG; manifest ghi MIME theo header thực tế, không đổi file lịch sử.

Mẫu Spineboy bên thứ ba bị loại khỏi fixtures sản phẩm: [SOURCE.md](../../../examples/spineboy/SOURCE.md) chỉ nêu dùng học/đánh giá và dẫn license nguồn. JSON Spine trong bài học không là định dạng native.

## Dependency review (nguồn chính thức, 10/09/2026)

| Dependency dự kiến | License được kiểm tra | Cách dùng và việc bàn giao |
| --- | --- | --- |
| PixiJS | [MIT, v8.13.2](https://github.com/pixijs/pixijs/blob/v8.13.2/LICENSE) | Renderer #9; giữ copyright/license khi phân phối; kiểm lại bản thực sự pin ở #5/#9. |
| React | [MIT](https://github.com/react/react/blob/main/LICENSE) | UI; giữ notice, chưa pin version sản phẩm. |
| Vite | [MIT](https://github.com/vitejs/vite/blob/main/LICENSE) | Build; giữ notice theo phần phân phối, kiểm dependency tree sau lock. |
| TypeScript | [Apache-2.0](https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt) | Tooling, giữ license/notice áp dụng; công cụ kiểm tra hợp đồng pin 5.9.3. |
| Spine runtime | [License riêng](https://esotericsoftware.com/spine-runtimes-license) | Chỉ tồn tại trong repo học. Không kéo vào sản phẩm; không mặc định MIT hoặc được phép phân phối. |

Đây là rà các dependency trực tiếp dự kiến, chưa là audit lockfile sản phẩm vì #5 chưa triển khai. Package kiểm tra hợp đồng có lock riêng, Ajv/TypeScript là dev tools; không phát sinh runtime dependency của platform. #5/#9/#10 phải kiểm phiên bản và dependencies bắc cầu thực sự chọn (đặc biệt ZIP/renderer).

## Chạy và bàn giao

```sh
node platform/fixtures/source/verify.mjs
```

Không cần npm install. Script kiểm hash/bytes/MIME/dimensions, PNG alpha channel của rig input, provenance links, joints/placements và năm briefs. Không decode toàn bộ PNG hoặc đo chất lượng silhouette; loader #10 phải decode và xác nhận asset khi mở gói.

#6 tạo fixture native từ ảnh và bố trí; #9 nhận PNG/scale/pivot; #10 dùng hash để đóng gói, không ghi URL repo vào project; #14 chạy robot; #20 chọn mesh vertices và chạy khăn/thạch/IK. Mỗi lần đổi ảnh, cập nhật manifest sau review và chạy lại kiểm tra, không tự cập nhật hash để che source drift.
