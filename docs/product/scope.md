# Phạm vi theo giai đoạn

Ngày: 09/09/2026. Các giai đoạn dưới đây là thứ tự kiểm chứng, không phải lịch phát hành. Chỉ mở rộng sau khi mốc trước có bằng chứng.

| Nhóm khả năng | Giai đoạn 1: quy trình robot | Giai đoạn 2: biến dạng | Giai đoạn sau |
| --- | --- | --- | --- |
| Art | PNG tách sẵn, bố trí và điểm xoay rõ ràng | Thay độ phân giải/ảnh và giữ rig | PSD, đồng bộ layer; nghiên cứu tách ảnh phẳng riêng |
| Rig | Xương cha/con, transform, ảnh gắn xương, thứ tự vẽ | Mesh, bind pose, weights; IK hai xương | Transform/path constraints, các chế độ kế thừa nâng cao |
| Animation | Translate/rotate/scale, keyframe, linear/stepped/Bezier, idle/wave | Deform, nhịp khăn/thạch; walk và kiểm tra chân trụ | Mixing nhiều track, additive, chuyển tiếp, events/audio |
| Biến thể | Một bộ ảnh và rig | Giữ cấu trúc để mở rộng skins | Skins, linked mesh và constraint theo skin |
| Physics | Chưa cần | Kiểm tra mô phỏng nhỏ nếu đủ năng lực nền | Physics phụ kiện, reset, seek, bake và vòng lặp |
| Giao diện | Canvas, cây đối tượng, thuộc tính, timeline cơ bản, undo | Hiển thị mesh/weights, so pose, đường cong | Công cụ chỉnh sửa chuyên sâu theo nhu cầu thực tế |
| Tools | Đọc project, tạo rig, batch keys, render, checkpoint | Weights/deform, IK, chẩn đoán | Recipes tái sử dụng và tác vụ dài |
| Đầu ra | Project đóng gói, mở lại, player độc lập, chuỗi PNG | Spritesheet và kiểm tra crop/padding | Video, atlas, tích hợp engine theo ưu tiên |

WebMCP được thử ngay từ đầu trên một tool nhỏ, rồi kiểm chứng toàn workflow ở thử nghiệm 3. Không đợi xây xong editor mới thử agent.

## Bộ mẫu làm chuẩn

| Mẫu | Giá trị kiểm tra | Tham chiếu |
| --- | --- | --- |
| Robot idle/wave | Rig, nhịp, ảnh gắn xương, sửa theo feedback | [Bộ robot](../../exercises/robot/editor-review/README.md) |
| Robot chân trụ | IK, trượt chân và nội suy giữa key | [Idle và IK](../../lessons/019-handbuilt-idle-and-ik.md) |
| Khăn | Neo giữ nguyên, weights, chuyển động trễ | [Mesh khăn](../../lessons/085-editor-robot-scarf-mesh.md), [idle](../../lessons/086-editor-scarf-delayed-idle.md) |
| Thạch | Nén–giãn, giữ mặt, giữ vùng đáy | [Bộ thạch](../../exercises/soft-character/README.md) |
| Đổi ảnh | Kích thước hiển thị, texture và rig | [Đổi độ phân giải](../../lessons/088-editor-mesh-image-resolution.md) |

Đối chiếu theo mục tiêu chuyển động và lỗi đã biết. Không yêu cầu trùng từng pixel với Spine hoặc sao chép hành vi chưa có đặc tả. Với engine mới, các ngưỡng số phải được ghi trước khi chạy thử.

## Điều kiện để gọi là thay thế được workflow

- Tạo, sửa, lưu, mở lại và phát được trên player mà không cần Spine.
- Agent thực hiện qua bộ lệnh công khai; không dựa vào sửa file nội bộ hay chỉnh tay dữ liệu để hoàn thành bài.
- Người dùng nhận được cả project chỉnh sửa tiếp và đầu ra sử dụng được.
- Có bằng chứng ở pose giữa key, cực trị và playback, không chỉ ảnh đẹp tại keyframe.
- Việc sửa được hoàn tác và không làm mất phần project đã đạt.

Các tính năng chưa làm phải được báo là chưa hỗ trợ. Không âm thầm bỏ qua khi nhập project hoặc xuất kết quả.
