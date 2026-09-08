# Robot giao hàng — bài thực hành đang làm

Ngày: 06/09/2026.

## Bộ robot dựng trong Spine

Đã dựng rig FK/IK bằng thao tác editor và tạo `idle-handbuilt`, `wave-handbuilt`, `walk-wide`. Ba animation vẫn có trong cửa sổ khi kiểm tra ngày 07/09/2026. Bài 67 thêm một xương con thử Physics; phần rig robot chính có 18 xương và 15 region.

- [Xem đứng nhún, vẫy tay và đi bộ](editor-review/README.md): bản ghép các tư thế chụp từ editor, có ghi thời gian và nguồn.
- [Rà tiêu chí hoàn thiện](../../lessons/068-core-plan-audit.md): bằng chứng khớp, chân trụ, nối vòng và phần còn thiếu.
- [Tiến độ và bài dựng lại](../../PROGRESS.md): hướng dẫn thao tác, lỗi đã sửa và giới hạn từng bài.

Chưa có project `.spine` lưu từ editor hoặc dữ liệu export của rig dựng tay. Các ảnh chụp và GIF không thay thế được project mở lại; nhịp playback liên tục của bộ cuối còn cần đánh giá.

## Bản runtime viết bằng code

`index.html`, `robot-study.mp4`, `side-step.gif` và `wave.gif` ở thư mục này thuộc bản dữ liệu tự tạo chạy bằng runtime chính thức. Chúng phục vụ các bài runtime và không phải bản export của rig dựng tay hiện tại. Chạy `npm run serve` từ thư mục gốc, rồi mở [bản runtime cục bộ](http://127.0.0.1:8765/exercises/robot/).

## Tài nguyên

ImageGen tích hợp tạo concept và các bản tách; prompt đầy đủ trong `prompts.json`. Các ảnh gốc lưu ở `images/`.

- Concept: hình dáng dùng làm tham chiếu; có kênh alpha nhưng vẫn có hiệu ứng nền, không dùng trực tiếp làm mảnh rig.
- Parts v1: phần cánh tay trên bị vẽ kèm cẳng tay; nền trắng.
- Parts v2: đã sửa hình cánh tay; nền ô caro vẫn là pixel RGB, không có alpha.
- Parts v3: yêu cầu bỏ nền thêm lần nữa nhưng ảnh vẫn hiển thị ô caro; không chọn làm đầu vào.
- `images/parts/`: 15 PNG có alpha thật, tách từ v2 bằng Python sau khi người dùng cho phép. Ba mảnh chân bên còn lại được lật ngang; bản này phù hợp bài chính diện, chưa phải bộ ảnh nhiều góc nhìn.
- `parts-contact-sheet.png`: kiểm tra mảnh trên nền tối. Nét cắt dùng mask nhị phân; cần kiểm tra thêm ở kích thước lớn nếu dùng cho sản phẩm hoàn thiện.

## Lịch sử bản runtime và tài nguyên

1. **Tách ảnh:** dùng nét viền kín để giữ phần màu kem bên trong và bỏ nền nối với biên ảnh. Không xóa mọi pixel sáng, vì sẽ làm thủng phần thân màu kem.
2. **Rig đầu:** 16 xương, 15 slot. Bàn chân hướng vào nhau và tay vẫy quá duỗi. Bản gốc lưu ở `revisions/robot-v1.json`.
3. **Sửa tư thế:** đổi mảnh bàn chân trái/phải và điểm gắn; hạ góc cánh tay trên, tăng góc khuỷu. Thêm đường Bezier để giảm đổi vận tốc đột ngột.
4. **Rig IK:** thêm hai mục tiêu bàn chân dưới `root`, tổng 18 xương. Đùi/cẳng chân dùng trục dọc xương và hai constraint IK. Bàn chân đi theo mục tiêu độc lập với thân.
5. **Kiểm chứng:** nếu hạ thân 35 đơn vị trong rig FK, bàn chân đi xuống 35; ở rig IK, bàn chân giữ nguyên. Đã lấy mẫu 121 tư thế cho từng động tác idle/squat/step; sai số đầu cẳng chân tới mục tiêu dưới 0,001 đơn vị, chân trụ không trôi trong phép đo.
6. **Hiển thị:** chế độ vẽ từng tam giác tạo đường nối mảnh nhìn thấy trong ảnh render. Rig hiện chỉ dùng region attachments, nên chuyển sang cách vẽ ảnh của runtime và kiểm tra lại khung hình; đường chéo đó đã hết. Khi học mesh cần kiểm tra bộ render phù hợp riêng.

## Những phần chưa đạt

Phần còn thiếu của bộ robot editor được tập trung trong [bảng rà tiêu chí](../../lessons/068-core-plan-audit.md). Các phép kiểm tra runtime dưới đây chỉ áp dụng dữ liệu do script tạo; chúng không chứng minh đã lưu/xuất thành công animation từ Spine.

## Chạy lại bản runtime

Tại thư mục gốc:

```sh
npm ci --ignore-scripts
python3 scripts/prepare_robot.py
python3 scripts/build_robot.py
python3 scripts/build_robot_ik.py
node scripts/check_robot.mjs
node scripts/check_state_lab.mjs
node scripts/check_loop_motion.mjs
node scripts/render_robot.mjs
npm run serve
```

Python cần Pillow. Node render dùng `@napi-rs/canvas`; preview và kiểm tra dùng Spine Runtime 4.2.120 đã khóa trong package-lock. `robot.json` là bản FK, `robot-ik.json` là bản IK. Đường dẫn ảnh trong JSON trỏ tới các mảnh PNG; atlas mỗi ảnh một trang, chưa đóng gói tối ưu.

Lệnh tạo video từ frame runtime:

```sh
ffmpeg -v error -y -framerate 30 -i exercises/robot/frames/%04d.png -c:v libx264 -pix_fmt yuv420p -movflags +faststart exercises/robot/robot-study.mp4
```

Các lệnh tạo lại ghi đè sản phẩm sinh tự động; ảnh nguồn ImageGen không bị ghi đè.

## Bằng chứng và nguồn

- `loop-motion-checks.json`: kiểm tra nối vị trí qua bốn chu kỳ, 968 mẫu chân trụ, về đầu và đổi animation. Bản xem cộng chuyển vị trí mỗi vòng cho `walk_side`; camera theo root và vạch mặt đất giữ tọa độ thế giới. [Bài 23](../../lessons/023-runtime-walk-loop-placement.md) ghi cách sửa và giới hạn.
- `runtime-checks.json`: các phép đo chạy bằng runtime chính thức.
- `evidence/squat-ik.png`: tư thế hạ hông cùng điểm khớp trong trình duyệt.
- `evidence/wave-v2.png`: tư thế vẫy đã sửa.
- [IK constraints](https://esotericsoftware.com/spine-ik-constraints): cách điều khiển hai xương bằng một mục tiêu.
- [JSON format](https://esotericsoftware.com/spine-json-format): cấu trúc dữ liệu và đường Bezier.
- [Runtime source](https://github.com/EsotericSoftware/spine-runtimes/tree/4.2/spine-ts): loader, IK và bộ render dùng trong bài.
- Runtime giữ nguyên thông báo giấy phép trong dependency; đây là bài đánh giá cục bộ, chưa phát hành ứng dụng.

### Nội suy tại tiếp đất

[Bài 24](../../lessons/024-runtime-contact-velocity.md) giữ tư thế key và sửa tốc độ giữa các key của `walk_side`. Chạy `node scripts/check_walk_velocity.mjs` để so sánh với animation trước sửa đã lưu. Mức đổi tốc độ đột ngột tại ba mốc giảm khoảng 90%; đây là tinh chỉnh nhỏ của dữ liệu tự tạo, chưa chứng minh dáng đi đẹp hoặc animation trong editor đã được sửa.
