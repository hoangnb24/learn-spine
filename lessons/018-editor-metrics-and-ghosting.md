# Bài 18 — Kiểm tra rig bằng Metrics và Ghosting

Ngày 07/09/2026, Spine 4.3.25 Trial. Thực hành trên rig dựng trực tiếp ở [bài 17](017-editor-handbuilt-rig.md); animation vẫn có tên `animation`.

## Metrics: phát hiện một mảnh ảnh không còn hiển thị

Dự đoán: ẩn region cẳng tay trái làm số ảnh đang hiện giảm một, số đỉnh giảm bốn và số tam giác giảm hai. Tổng xương và tổng attachment không đổi.

Mở Views → Metrics, kéo mép trái của bảng để đọc đủ số. Tại frame 60, chọn region `forearm-left`, bấm biểu tượng hiển thị ở đầu hàng để ẩn rồi bật lại.

| Số liệu đọc trực tiếp | Ban đầu | Ẩn cẳng tay | Khôi phục |
| --- | --- | --- | --- |
| Bones / Bone transforms | 16 / 16 | 16 / 16 | 16 / 16 |
| Slots | 15 | 15 | 15 |
| Total attachments | 15 | 15 | 15 |
| Visible attachments | 15 | 14 | 15 |
| Vertices / Vertex transforms | 60 / 60 | 56 / 56 | 60 / 60 |
| Triangles | 30 | 28 | 30 |
| Timelines / Keys | 4 / 22 | 4 / 22 | 4 / 22 |

Editor còn hiển thị 0 constraint, 0 clipping polygon, 17 Bezier curves và 0 deform vertices. Đây là số liệu của rig hiện tại, không phải bản IK nhập ở những bài trước. Chọn region trong phiên này không làm Metrics hiện cặp số riêng cho selection như mô tả ở tài liệu; không ghi tính năng đó là đã kiểm chứng.

Bằng chứng: [ban đầu](../exercises/robot/evidence/robot-handbuilt-metrics.jpg), [thiếu cẳng tay](../exercises/robot/evidence/robot-handbuilt-metrics-hidden.jpg), [đã khôi phục](../exercises/robot/evidence/robot-handbuilt-metrics-restored.jpg). Outline cho thấy cẳng tay biến mất và trở lại trong khi bàn tay vẫn còn. Vì vậy, trước khi sửa cây xương khi thấy một khớp trống, cần kiểm tra attachment có đang hiển thị hay không.

Metrics giúp mô tả rig, chưa chứng minh FPS hay chi phí trên thiết bị đích. Nguồn: [Metrics view](https://esotericsoftware.com/spine-metrics).

## Ghosting: nhìn đường đi trước và sau tư thế hiện tại

Mở Views → Ghosting. Trong Frames, bật Before và After, dùng Before frames = 6, After frames = 6, Frame step = 3. Tại frame 8, bóng trước tương ứng frame 2/5 và bóng sau tương ứng frame 11/14. Bật On top để bóng không bị ảnh hiện tại che. Anchor và Loop giữ bật; offset X/Y = 0. Keys và Motion Vectors không bật.

Đã kiểm tra riêng từng phía: chỉ Before cho bóng đỏ phía tay còn thấp; chỉ After cho bóng xanh phía tay nâng cao hơn. Tư thế chính và playhead vẫn ở frame 8. Khi bật cả hai, thân bị nhuộm màu do các bóng chồng lên phần đứng yên; đây là hiển thị hỗ trợ, không phải đổi màu attachment.

Bằng chứng: [cả hai phía](../exercises/robot/evidence/robot-handbuilt-ghosting08.jpg), [chỉ Before](../exercises/robot/evidence/robot-handbuilt-ghost-before08.jpg), [chỉ After](../exercises/robot/evidence/robot-handbuilt-ghost-after08.jpg), [tắt bóng](../exercises/robot/evidence/robot-handbuilt-ghost-off08.jpg). Cuối bài đã tắt Before, After và On top, giữ frame 8.

Đã phân biệt được tư thế trước/sau và hướng nâng tay bằng hình chồng trong editor. Chưa thử Motion Vectors, ghost theo key, anchor trên root di chuyển hoặc dùng Ghosting để sửa một dáng đi. Nguồn: [Ghosting view](https://esotericsoftware.com/spine-ghosting).

## Phần tiếp theo

Đổi tên animation vẫy tay, tiếp tục bộ động tác và hoàn thiện dáng đi/giữ chân. Bản Trial chưa lưu được project này; ảnh và hướng dẫn không thay thế project mở lại được.
