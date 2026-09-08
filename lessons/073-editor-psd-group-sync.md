# Bài 73 — Đổi nhóm PSD rồi đồng bộ rig đã chỉnh

08/09/2026, Spine 4.3.25 Trial, skeleton `nested-robot`.

Đã chuyển nhóm head ra ngang hàng với torso trong một PSD thử, rồi đồng bộ qua Images. Cây trong Spine vẫn là `root → torso → head`; cả hai xương giữ điểm xoay, góc và chiều dài của bài 72. Trong cấu hình này, đồng bộ ảnh không tự đổi cha của xương theo cấu trúc nhóm mới.

## Đối chứng đầu vào

[sibling-robot.psd](../exercises/robot/psd-import/nested/sibling-robot.psd) được tạo bằng psd-tools từ bản gốc: lấy nhóm head bên trong torso và gọi `move_to_group` đưa ra cấp PSD. Giữ tên, tag, pixel và vị trí tất cả lớp ảnh. Đã mở lại hai PSD và so bbox cùng byte ảnh của từng lớp: bằng nhau.

```text
Trước: torso group [bone:torso] → head group [bone:head]
Sau:   torso group [bone:torso]
       head group [bone:head]
```

## Thao tác và kết quả

Chọn Images thuộc đúng `nested-robot`, mở bánh răng PSD Settings, thay đường dẫn bằng bản thử. Giữ Scale 1, Padding 1, Trim bật, Delete previously imported images tắt. OK rồi bấm nút đồng bộ màu cam. Xác nhận chỉ ghi đè head.png và body.png; editor báo `PSD imported`.

Tìm Images bằng ô tìm kiếm chung lúc đầu đã chọn Images của robot khác (PSD none). Đã trở về skeleton mới và chọn đúng nhánh trước khi thay nguồn; không thêm PSD vào robot kia.

| Xương | World X/Y sau sync | Góc | Length | Cha |
| --- | --- | --- | --- | --- |
| torso | 0 / 304 | 90° | 170 | root |
| head | 0 / 474 | 90° | 100 | torso |

[Cây sau sync](../exercises/robot/psd-import/nested/evidence/sibling-sync-tree.png), [thông số torso](../exercises/robot/psd-import/nested/evidence/sibling-sync-torso.png), [hai file ghi đè](../exercises/robot/psd-import/nested/evidence/sibling-sync-files.png).

## Khôi phục và giới hạn

Đã đổi nguồn lại `nested-robot.psd` và đồng bộ thành công lần nữa. [Nguồn gốc được khôi phục](../exercises/robot/psd-import/nested/evidence/sync-original-restored.png); [ảnh cuối](../exercises/robot/psd-import/nested/evidence/sync-restored-head.png) cho thấy head vẫn dưới torso, X/Y 0/474, góc 90°, Length 100. Hai PNG đầu ra khớp toàn bộ RGBA với ảnh gốc; [báo cáo kiểm tra](../exercises/robot/psd-import/nested/sync-checks.json).

Không sửa key hoặc tạo animation trong bài này. Kết quả chỉ áp dụng cho đổi nhóm với tên ảnh/xương giữ nguyên, không suy ra cách xử lý đổi tên hoặc thêm/xóa attachment. Bài 71 kiểm chứng cấu trúc khi nhập mới; bài này kiểm chứng cập nhật qua Images trên rig đã tồn tại. Hai thao tác cần được phân biệt khi xử lý PSD.

Tạm khép chuỗi nhập nhóm–đặt khớp–đồng bộ. Trở lại bộ động tác robot để đánh giá chất lượng theo phạm vi bằng chứng hiện có; không yêu cầu người dùng cung cấp video để tiếp tục học.
