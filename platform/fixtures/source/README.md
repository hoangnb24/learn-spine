# Source fixtures — #2

`manifest.json` khóa file nguồn bằng hash, bytes, dimensions và provenance. Đường dẫn tính từ root repo; không cần tải art từ dịch vụ ngoài. `robot-layout.json` chỉ là bố trí độc lập rút từ dữ liệu tác giả tạo cho bài học, không phải native Project. `cases.json` có năm brief robot idle/wave, khăn, thạch và chân trụ; `anchors.svg` là sơ đồ điểm quan sát.

Chạy `node platform/fixtures/source/verify.mjs` từ root repo (Node 22, không cần npm install).

Không tái sinh hash trong lệnh verify: nguồn đổi phải được review và cập nhật có chủ ý. Khi chuyển thành fixture native ở #6/#14/#20, dùng schema và quy tắc trong `docs/product/contracts/`, copy PNG vào gói tương đối, cấp IDs và chuyển các vị trí theo hướng dẫn `docs/product/research/assets.md`.

`rig-input` là PNG đưa vào rig. `source-art` giữ lịch sử ảnh gốc, có thể có nền caro không dùng được. `editor-capture-reference` và `runtime-capture-reference` chỉ là đối chứng hình của workflow cũ. Không dùng screenshots/GIF hoặc JSON Spine làm bằng chứng engine mới đã đạt. Art có provenance ImageGen trong repo, nhưng quyền phát hành công khai chưa được kết luận; manifest không cấp giấy phép mới.
