# Bài 60 — giữ tư thế khi đổi lớp trong Spine 4.3

Hold Previous không còn là nút cần học bật/tắt trong Preview 4.3. [Changelog chính thức](https://us.esotericsoftware.com/spine-changelog) ghi bỏ nút ở 4.3.53-beta ngày 24/03/2026. [Giải thích của nhà phát triển](https://es.esotericsoftware.com/forum/d/29234-spine-unity-42-to-43-upgrade-guide/13) cho biết hệ thống giữ tư thế khi hòa trộn được xử lý tự động; `holdPrevious` cũng đã bỏ khỏi TrackEntry. Mục Hold Previous trong trang Preview chung mô tả giao diện cũ, không khớp editor hiện tại.

## Phép thử trong editor

Từ `arm-offset20` của bài 59, sao chép thành `arm-hold20`, giữ key Rotate 20° của `forearm-left`. Sao chép tiếp thành `arm-base0`, sửa key đó về 0°. Đã đọc lại [key bản 20°](../exercises/robot/evidence/preview-auto-hold/copy-key20.png) và [key nền 0°](../exercises/robot/evidence/preview-auto-hold/base-key0.png).

Đặt `arm-base0` trên track 0, `arm-offset20` trên track 1. Cả nền và lớp trên đều có key cho cùng góc xoay; Alpha 100, Additive tắt. Sau khi có tư thế 20°, đặt Mix 5 giây và Speed 100, rồi đổi track 1 sang `arm-hold20`.

Hai lớp trên cùng giữ 20°. Nếu ảnh hưởng của nền 0° lọt vào giữa quá trình hòa trộn, tay có thể tụt góc rồi trở lại. Đây là lý do dùng nền có key 0°, không chỉ để track dưới rỗng.

## Kết quả

Chụp 12 mẫu cách nhau khoảng nửa giây sau thao tác đổi, bao trùm khoảng hòa trộn và sau đó. Cả 12 vùng nhân vật `(380,140)–(720,745)` trùng pixel với ảnh trước chuyển. Nền 0° khác rõ ảnh 20°, nên phép so sánh có thể phát hiện sự trở về nền ở những mẫu này.

[Trước chuyển](../exercises/robot/evidence/preview-auto-hold/before.png), [mẫu đầu](../exercises/robot/evidence/preview-auto-hold/mix-0.png), [mẫu giữa](../exercises/robot/evidence/preview-auto-hold/mix-5.png), [mẫu cuối](../exercises/robot/evidence/preview-auto-hold/mix-11.png), [mốc thời gian](../exercises/robot/evidence/preview-auto-hold/sampling.json), [so sánh ảnh](../exercises/robot/evidence/preview-auto-hold/comparison.json).

Sau thử, đặt Mix 0 và bỏ lớp trên: ảnh trở lại nền 0°. Dừng Speed 0 và trả Mix 0,25 trên hai track. Preview kết thúc ở `arm-base0` trên track 0, track 1 rỗng; bản 20° gốc và bản sao vẫn giữ được.

Đã kiểm chứng trường hợp chuyển giữa hai lớp cùng giá trị, trên nền có key khác giá trị. Không suy ra mọi chuỗi ngắt chuyển, mọi loại timeline hay mọi frame giữa các mẫu đều đã được kiểm tra. Phần bật/tắt Hold Previous trong kế hoạch được thay bằng bài kiểm tra đúng với 4.3 này; không coi tính năng đã bỏ là một việc còn thiếu.
