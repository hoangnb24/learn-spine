# Bài 36 — xương chỉ hoạt động cùng skin phụ kiện

Đã thêm `badge-control` dưới `tip`, chuyển slot phụ kiện sang xương này và cho xương thuộc skin `badge`. Khi bỏ ghim badge, Metrics giảm từ 4 xuống 3 phép biến đổi xương; mesh chính vẫn hiện và giữ tư thế.

## Dựng và gắn skin

Trong Setup của Spine 4.3.25 Trial:

1. Chọn `tip`, dùng Create và click tại tâm dấu badge để tạo xương con. Đổi tên xương mới `tip2` thành `badge-control`.
2. Chọn hệ tọa độ Parent, nhập Translate `(96, 0)`, Rotate `0`, Scale `(1, 1)`. Xương dài 0: dùng làm điểm xoay riêng cho dấu phụ kiện.
3. Chọn **slot** `skin-badge`, nhấn P (Set Parent), chọn `badge-control`. Slot chuyển cùng placeholder và attachment; hình giữ nguyên vị trí. Region có tọa độ Parent `(0, 0)` sau chuyển, thay cho `(96, 0)` khi nằm trực tiếp dưới tip.
4. Trong Skins view, chọn badge và kiểm tra nó đang active. Chọn xương `badge-control` → Skin → Add: badge. Kiểm tra kết quả trước khi đổi skin; nhấn Escape và bỏ chọn xương rồi mới chuyển về orange.
5. Giữ badge được ghim, orange active. Xương có biểu tượng skin trong Tree; bỏ ghim badge làm xương và slot phụ kiện mờ đi.

[Hướng dẫn Skin bones](https://esotericsoftware.com/spine-skins#Skin-bones) giải thích cách giới hạn xương theo skin và yêu cầu phụ thuộc giữa xương, attachment. Bài này dùng một xương con riêng; các xương root/base/tip vẫn là xương chung.

## Đo bật/tắt bằng Metrics

Chỉ skeleton `mesh-refine` đang hiển thị. Đã mở Metrics trong Setup, bỏ chọn attachment để đọc toàn bộ số liệu:

| Số liệu | Badge ghim | Badge bỏ ghim | Ghim lại |
| --- | --- | --- | --- |
| Bones | 4 | 3 / 4 | 4 |
| Bone transforms | 4 | 3 | 4 |
| Slots | 2 | 1 / 2 | 2 |
| Attachments visible | 2 | 1 | 2 |
| Vertices | 31 | 27 | 31 |
| Vertex transforms | 41 | 37 | 41 |
| Triangles | 34 | 32 | 34 |

Bằng chứng: [bật](../exercises/mesh-lab/evidence/skin-bones/metrics-badge-on.jpg), [tắt](../exercises/mesh-lab/evidence/skin-bones/metrics-badge-off.jpg), [ghim lại](../exercises/mesh-lab/evidence/skin-bones/metrics-badge-restored.jpg).

Con số `3 / 4` cho thấy xương vẫn có trong rig, còn Bone transforms giảm chứng minh editor không tính biến đổi cho nó trong trạng thái đã thử. [Metrics](https://esotericsoftware.com/spine-metrics) tổng hợp các skeleton đang hiển thị. Đây là số liệu editor, chưa phải phép đo CPU hay tốc độ khung hình trong game.

## Cảnh báo đã gặp và sửa

Lần thêm đầu tiên rồi đổi skin ngay, xương xuất hiện thuộc hai skin. Chưa xác định chính xác vì sao thao tác đó thêm cả hai. Undo một lần để kiểm tra đã tạo cảnh báo: xương của slot không nằm trong skin của attachment. [Problems (1)](../exercises/mesh-lab/evidence/skin-bones/dependency-warning.jpg).

Không coi việc hình vẫn hiện là bằng chứng rig đúng: lúc đó nhiều skin đang cùng hiển thị. Đã Undo thêm lần nữa để bỏ bước gán skin, kiểm tra Problems hết lỗi, rồi làm lại bước 4 với kiểm tra giao diện sau từng thao tác. Xương chỉ còn một liên kết skin, [Problems không còn lỗi](../exercises/mesh-lab/evidence/skin-bones/badge-membership-clean.jpg). Sau đó đổi về orange và tắt badge cho đúng kết quả Metrics trong bảng. Không xóa xương hay ảnh để che cảnh báo.

## Đối chiếu animation sau đổi cha

Trong `bend-corrective`, không thêm hoặc sửa key:

| Frame | Badge bật | Badge tắt | Khôi phục |
| --- | --- | --- | --- |
| 0 | [ảnh](../exercises/mesh-lab/evidence/skin-bones/orange-badge0.jpg) | [ảnh](../exercises/mesh-lab/evidence/skin-bones/orange-no-badge0.jpg) | [ảnh](../exercises/mesh-lab/evidence/skin-bones/orange-badge0-restored.jpg) |
| 30 | [ảnh](../exercises/mesh-lab/evidence/skin-bones/orange-badge30.jpg) | [ảnh](../exercises/mesh-lab/evidence/skin-bones/orange-no-badge30.jpg) | [ảnh](../exercises/mesh-lab/evidence/skin-bones/orange-badge30-restored.jpg) |

Trong khung chứa toàn bộ mesh `(55,48)–(800,518)`, mỗi cặp bật/khôi phục trùng pixel. Bật/tắt chỉ khác quanh phụ kiện. Ảnh không badge tại frame 0 cũng trùng pixel với bài 35 trước khi thêm xương. Ảnh có badge khác bài 35 ở vùng giữa dấu, nơi editor vẽ thêm biểu tượng xương mới; không dùng chúng để tuyên bố toàn ảnh trùng nhau.

Đã kiểm tra hai tư thế dừng; chưa thêm animation riêng cho badge-control, thử skin constraints hoặc xuất runtime. Cuối bài: orange active, badge ghim, frame 30, playback dừng. Project Trial vẫn chưa lưu/xuất.
