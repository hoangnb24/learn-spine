# Bài 26 — tiến bằng root và giữ chân trụ trong editor

Đã thêm quãng tiến 60 đơn vị vào `walk-handbuilt` trong Spine 4.3.25 Trial. Mỗi chân tiến 60 đơn vị theo lượt, thân đi cùng root trong chu kỳ 30 frame/30 FPS. Đây là bản đầu của bước tiến ngang; còn tinh chỉnh tốc độ chân và chất lượng dáng đi.

**Cập nhật:** [bài 27](027-editor-walk-swing-curves.md) đã áp dụng Bezier và chỉnh tay nắm cho pha vung của cả hai chân, đo lại đủ chu kỳ. Nội dung dưới đây giữ lại trạng thái bản đầu và thông số dự tính để đối chiếu.

## Lỗi cố ý trước khi sửa

Đặt riêng root Translate X = 0 ở frame 0 và 60 ở frame 30, chọn Linear trong Graph. Frame 15 cho X = 30: [bằng chứng](../exercises/robot/evidence/walk-root-linear15.jpg).

Khi chưa sửa target, **bàn chân phải thực**, đọc ở World axes, có X = 47,5 tại frame 0 nhưng X = 77,5 tại frame 15; Y vẫn −391,5. Chân đang trụ bị kéo đi đúng 30 đơn vị cùng root. [Ảnh lỗi](../exercises/robot/evidence/walk-foot-slide-before15.jpg).

## Sửa trong Spine

Bật Separate Translate trên root và hai target `leg-ik-left/right`, để đặt X độc lập với đường nhấc chân Y. Chọn Parent axes để nhập target; hai target là con trực tiếp của root. Spine cho phép tách X/Y qua thuộc tính Separate của xương: [Keys User Guide](https://us.esotericsoftware.com/spine-keys).

Tọa độ dùng trong bản đầu:

| Target | Frame → Parent X |
| --- | --- |
| Trái | 0 → −48,5; 3 → −54,5; 8 → −34,5; 13 → −14,5; 30 → −48,5 |
| Phải | 0 → 47,5; 18 → 11,5; 23 → 31,5; 28 → 51,5; 30 → 47,5 |

Giữ Y đã có: mặt đất −391,5, đỉnh nhấc −343,5; trái nhấc trong 3–13, phải trong 18–28. Chọn **chỉ hàng Translate X** trong Dopesheet và áp dụng Linear; Y vẫn Bezier. Ảnh [X trái](../exercises/robot/evidence/walk-left-x-linear.jpg), [X phải](../exercises/robot/evidence/walk-right-x-linear.jpg).

Root tiến 2 đơn vị mỗi frame. Trong pha trụ, target lùi 2 đơn vị mỗi frame so với root nên tổng vị trí thế giới đứng yên. Trong pha vung của bản đầu, bàn chân tiến 6 đơn vị mỗi frame trong thế giới.

Một thao tác kéo vùng chọn bắt trúng key X đầu và kéo nó từ 0 đến 31. Đã bấm Undo ngay, xác nhận key về 0, rồi tạo vùng chọn từ khoảng trống bên phải kéo sang trái. Sau đó mới áp dụng Linear. Bài học: kiểm tra các key sáng trong đúng hàng trước khi đổi nội suy.

## Kiểm tra bàn chân thực ở World axes

Đã chọn từng `foot-left/right`, chuyển World axes và chụp **mọi frame nguyên 0–30 cho cả hai chân**, tổng 62 ảnh. Không chỉ đo target. Các trục tọa độ hiển thị được đối chiếu với [Tools User Guide](https://esotericsoftware.com/spine-tools).

| Chân | Pha trụ đã đọc đủ từng frame | World X | World Y | Góc |
| --- | --- | --- | --- | --- |
| Trái | 0–3 | −48,5 | −391,5 | 0° |
| Trái | 13–30 | 11,5 | −391,5 | 0° |
| Phải | 0–18 | 47,5 | −391,5 | 0° |
| Phải | 28–30 | 107,5 | −391,5 | 0° |

Đã đọc toàn bộ bảng ảnh [chân trái](../exercises/robot/evidence/handbuilt-walk-travel-first/left-values.jpg) và [chân phải](../exercises/robot/evidence/handbuilt-walk-travel-first/right-values.jpg). Các pha trụ giữ đúng số trong bảng ở độ chính xác editor hiển thị. Chưa đo frame lẻ.

Đã xem [31 tư thế](../exercises/robot/evidence/handbuilt-walk-travel-first/all-poses.jpg): hai chân nhấc luân phiên, không thấy khớp rời ở độ phân giải chụp. Hai chân thu gần nhau giữa chu kỳ rồi mở lại. Bảng này không chứng minh chuyển trọng lượng tự nhiên hoặc nhịp tốt ở tốc độ thường.

## Việc còn thiếu

Đã bật phát bản có root tiến trong editor, lưu [ảnh đang phát](../exercises/robot/evidence/walk-handbuilt-travel-playing-a.jpg), rồi dừng ở frame 0. Đây chỉ là xác nhận playback hoạt động, chưa phải đánh giá chuyển động bằng video liên tục.

### Thông số tinh chỉnh đã tính, chưa áp dụng

Đã mở Graph và tách hiển thị X để khảo sát. Chưa sửa key hoặc tay nắm trong lượt kiểm tra này. Bản trong editor vẫn dùng X Linear như bảng trên.

Để bàn chân tiến 60 đơn vị trong 10 frame và đứng yên ở hai đầu, có thể dùng World X = điểm đầu + 60 × (3u² − 2u³), với u chạy từ 0 đến 1 trong pha vung. Trừ root X = 2 × frame để được Parent X. Độ dốc Parent X phải là **−2, +7, −2** tại đầu, giữa và cuối pha vung. Ba giá trị X đã đặt ở các key giữ nguyên.

Tọa độ tuyệt đối của hai tay nắm cho mỗi đoạn 5 frame đã lưu trong [swing-curve-plan.json](../exercises/robot/evidence/handbuilt-walk-travel-first/swing-curve-plan.json). File ghi rõ `planned_not_applied_in_editor`; đây là hướng dẫn cho bước chỉnh tiếp, không phải dữ liệu đã xuất từ Spine. Khi áp dụng, chỉ đổi hai đoạn vung sang Bezier và giữ các đoạn trụ Linear. Graph cho phép chỉnh tay nắm Bezier: [hướng dẫn Graph](https://esotericsoftware.com/spine-graph).

X dùng Linear nên tốc độ thế giới chuyển ngay từ 0 sang 6 đơn vị/frame lúc nhấc và về 0 lúc đặt chân. Cần tinh chỉnh đoạn vung mà vẫn giữ đoạn trụ thẳng và bù đúng root. Làm phẳng tiếp tuyến X của target theo Parent sẽ không tương đương tốc độ thế giới bằng 0.

Root kết thúc ở X = 60 nên phát lặp trực tiếp trong editor sẽ quay về vị trí đầu. Hai đầu cần so trong hệ tọa độ theo root, hoặc đặt nhân vật tiếp qua các vòng ở runtime như bài 23; chưa chứng minh vòng phát liên tục của animation dựng tay này. Bản mới cũng chưa được xuất từ editor hoặc lưu thành project mở lại được vì giới hạn Trial.
