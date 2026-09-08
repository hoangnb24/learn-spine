# Bài 24 — tư thế nối khớp nhưng tốc độ vẫn khựng

Đã sửa nội suy của `walk_side` trong dữ liệu runtime tự tạo. Các tư thế đã đặt được giữ lại; tốc độ giữa những tư thế đó thay đổi đều hơn quanh lúc nhấc và đặt chân. Chưa sửa animation dựng tay trong editor và chưa coi dáng đi đạt chất lượng cuối cùng.

## Chẩn đoán

Bài 23 kiểm tra vị trí đầu/cuối và chân trụ. Hai kiểm tra đó không phát hiện việc tốc độ đổi đột ngột: một chân có thể đến đúng điểm nhưng dừng gấp ở đó.

Trong `build_robot_ik.py`, bước chân được tính từ hàm liên tục rồi lấy 61 mẫu trong một giây. JSON ban đầu không có đường cong giữa các mẫu nên runtime nối bằng đoạn thẳng. Độ dốc của đoạn cuối trước tiếp đất khác đoạn đứng yên ngay sau đó. Ở điểm nối vòng cũng xảy ra tình trạng tương tự.

Đã lưu animation trước sửa ở [walk-linear-before.json](../exercises/robot/evidence/walk-linear-before.json), để phép so sánh có thể chạy lại trên cùng rig hiện tại.

## Cách sửa và điều học được

Thêm Bezier với tiếp tuyến lấy từ đạo hàm của chuyển động gốc. Với hai key A/B và khoảng thời gian Δt, hai tay nắm là `(tA + Δt/3, vA + tốc_độ_A × Δt/3)` và `(tB − Δt/3, vB − tốc_độ_B × Δt/3)`. `v` ở đây là giá trị tọa độ hoặc góc tại key, không phải vận tốc.

Chân trên mặt đất phải có tốc độ **thế giới** bằng 0. Vì root tiến 70 đơn vị/giây, target tương đối với root phải lùi 70 đơn vị/giây. Đặt tiếp tuyến ngang cho X của target ở pha trụ sẽ làm chân trượt. Chỉ Y cần tốc độ bằng 0 ở tiếp đất. Đây là điểm cần mang sang bài chỉnh Graph trong editor: xác định đang chỉnh tọa độ tương đối với xương nào trước khi làm phẳng tiếp tuyến.

Root tiếp tục đi đều; thân/đầu/tay dùng tốc độ của nhịp sin/cos đã có. Không thay thời điểm event hoặc khoảng chân trụ.

## Kết quả đo

Lệnh chạy lại:

```sh
python3 scripts/build_robot_ik.py
node scripts/check_walk_velocity.mjs
node scripts/check_loop_motion.mjs
node scripts/check_robot.mjs
```

[Báo cáo tốc độ](../exercises/robot/walk-velocity-checks.json) dùng runtime Spine 4.2.120, lấy tốc độ từ hai phía của từng mốc với khoảng thời gian 0,0001 và 0,00001 giây. Bảng dưới dùng khoảng nhỏ hơn; số là chênh lệch vector vận tốc, đơn vị thế giới/giây.

| Mốc | Chênh lệch lớn nhất giữa các gốc xương trước → sau | Chân liên quan trước → sau |
| --- | --- | --- |
| 1,00 giây: nối vòng | 82,64 → 8,36 | Phải 39,02 → 3,96; trái 25,05 → 2,53 |
| 1,40 giây: chân phải tiếp đất | 88,97 → 8,99 | Phải 38,99 → 3,96 |
| 1,50 giây: chân trái nhấc lên | 64,05 → 6,44 | Trái 25,05 → 2,53 |

Cả hai khoảng đo đều qua ngưỡng giảm tối thiểu 75%; thực tế giảm khoảng 90%. Đây là đo gốc xương sau khi runtime giải IK, không chỉ đọc giá trị target.

Kiểm tra hồi quy vẫn qua: 968 mẫu chân trụ có độ trôi lớn nhất khoảng 0,00000311 đơn vị; pose nối vòng khớp; về đầu và đổi animation xóa đúng phần dịch chuyển tích lũy. Lấy 1.201 mẫu so sánh trước/sau cho thấy vị trí các gốc xương tại key lệch tối đa khoảng 0,00000121 đơn vị; giữa key lệch tối đa 0,33836 đơn vị.

## Giới hạn của kết luận

Đây là tinh chỉnh nội suy nhỏ, không phải thiết kế lại dáng đi. Bản cũ đã có key mỗi 1/60 giây; render đúng các key ở 30 hoặc 60 fps sẽ gần như giống bản mới. Không dùng phần trăm giảm của phép đo tốc độ để khẳng định khác biệt nhìn thấy lớn.

Tốc độ vẫn chưa liên tục hoàn toàn. Mã `CurveTimeline.setBezier/getBezierValue` trong runtime đang dùng chia Bezier thành những đoạn ngắn rồi nội suy tuyến tính. Vì thế kết quả đã giảm nhưng không về 0. Phép đo mới chỉ xét gốc xương ở ba mốc, chưa đánh giá tốc độ xoay toàn bộ khớp, mọi thời điểm hoặc độ tự nhiên của động tác.

Còn phải hoàn thiện chuyển trọng lượng, nhịp và dáng đi tiến trong editor, đánh giá ở tốc độ thường, cũng như lưu/xuất bằng bản Spine hỗ trợ. Các kết quả runtime này không thay thế những tiêu chí đó.
