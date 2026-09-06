# Bài 3 — Skin, phối animation và sự kiện

Thực hành 06/09/2026 với Spine Runtime 4.2.120. Phần editor chưa được kiểm chứng.

## Đổi skin mà giữ chuyển động

Đã tạo skin `mint` từ 15 mảnh robot bằng cách đổi các vùng cam bão hòa sang xanh, giữ vùng kem và alpha. Hai skin dùng cùng slot, tên attachment và kích thước ảnh.

Khi chuyển sang `mint`, cả 15 attachment đổi đường dẫn ảnh; tọa độ các xương giữ nguyên. Đã xem trên trình duyệt và lưu `exercises/robot/evidence/mint-skin.png`.

Thứ tự đã thử: `setSkinByName`, `setSlotsToSetupPose`, sau đó tiếp tục áp animation. Skin là bản ánh xạ các attachment; thay skin không phải tạo lại toàn bộ rig. [Runtime Skins](https://esotericsoftware.com/spine-runtime-skins).

Bài này là đổi bảng màu, chưa phải bài nhiều trang phục có hình dáng khác nhau hoặc kết hợp các nhóm skin.

## Track trên chỉ thay phần nó có key

Track 0 chạy `walk_side`, track 1 chạy `wave`. Ở 0,7 giây, tọa độ hông và hai bàn chân giống bản chỉ chạy bước ngang, nhưng góc cẳng tay phải khác khoảng 110°. Điều này xác nhận tay có thể vẫy mà không thay key chân.

Thử xóa track sau khi tay đã giơ: góc tay giữ nguyên. Sửa bằng `setEmptyAnimation` với thời gian chuyển 0,2 giây; sau quá trình chuyển, góc trở lại 0. [Applying Animations](https://esotericsoftware.com/spine-applying-animations).

## Sự kiện chạm đất

`walk_side` có sự kiện `footstep` tại 0,4 giây (phải) và 1 giây (trái). Chạy bằng `AnimationState` trong hơn hai vòng, nhận đúng thứ tự phải–trái–phải–trái, không lặp thừa. Thời điểm callback lệch tối đa một frame ở 60 FPS so với key.

Chưa gắn âm thanh hay thử Audio view trong editor. Callback đúng thời điểm mới là phần đầu của bài đồng bộ âm thanh.

## Chạy lại và bằng chứng

```sh
node scripts/check_state_lab.mjs
```

Kết quả lưu trong `exercises/robot/state-checks.json`. Tests dùng runtime để kiểm tra pose, thay attachment, event và trạng thái track; không chỉ kiểm tra JSON có các trường tương ứng.
