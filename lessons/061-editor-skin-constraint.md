# Bài 61 — constraint chỉ chạy theo skin phụ kiện

Bật skin `badge` làm xương `tip` nghiêng 30°; tắt skin này thì `tip` trở về 0° và mesh thẳng. Skin `orange` vẫn được chọn trong cả hai trường hợp. Đây là bài mở rộng từ [skin bones ở bài 36](036-editor-skin-bones.md).

## Dựng lại trong editor

Trên skeleton `mesh-refine`, ở Setup, tạo Transform constraint `badge-tilt`: Source là `base`, Targets là `tip`. Chỉ nối Rotate với Rotate, đặt Offset Rotate 30 và Mix Rotate 100. Hai xương này có sẵn và vẫn hoạt động khi không có phụ kiện.

Trong Skins, chọn `badge`, rồi chọn constraint và dùng **Skin… → Add: badge**. Nhấn Escape để thoát chế độ gán trước khi đổi skin. Chọn lại `orange`; dùng ghim bên cạnh `badge` để bật/tắt thêm skin phụ kiện.

[Ảnh cấu hình](../exercises/robot/evidence/skin-constraint/configuration.png) cho thấy Source/Targets, Offset 30, Mix 100 và biểu tượng skin trên constraint. [Tài liệu Skin constraints](https://esotericsoftware.com/spine-skins#Skin-constraints) giải thích constraint thuộc skin chỉ hoạt động khi skin đó đang được sử dụng.

## Đối chiếu thực tế

Chọn `tip`, chuyển hệ tọa độ sang World và đọc Rotate ở góc dưới trái. Không sửa góc xương giữa các lần đo.

| Trạng thái | World Rotate của tip | Quan sát |
|---|---:|---|
| Orange + ghim badge | 30,0° | Có huy hiệu vàng, đầu mesh nghiêng |
| Orange, bỏ ghim badge | 0,0° | Huy hiệu biến mất, mesh thẳng |
| Ghim badge lại | 30,0° | Tư thế nghiêng trở lại |
| Bỏ ghim lần cuối | 0,0° | Trả về trạng thái thẳng |

Ảnh: [bật](../exercises/robot/evidence/skin-constraint/badge-on30.png), [tắt](../exercises/robot/evidence/skin-constraint/badge-off0.png), [bật lại](../exercises/robot/evidence/skin-constraint/badge-on30-repeat.png), [trạng thái cuối](../exercises/robot/evidence/skin-constraint/badge-off0-restored.png).

Điểm phân biệt với chỉ ẩn ảnh: `tip` vẫn tồn tại và được chọn khi badge tắt, nhưng tác động xoay 30° cũng ngừng. Constraint này cố ý tác động lên xương chung để có thể nhìn thấy sự khác biệt đó.

## Trạng thái cuối và giới hạn

Để `orange` hoạt động, `badge` không ghim, Setup và World Rotate của tip là 0°. Không sửa key animation. Nếu ghim badge khi xem bài uốn mesh cũ, constraint mới sẽ tác động lên tip; bỏ ghim để xem lại hành vi cũ.

Bài đã kiểm tra bật/tắt trong Setup; chưa kiểm tra đổi skin giữa animation hoặc cập nhật skin qua runtime. Spine Trial vẫn không lưu project, nên ảnh và hướng dẫn này là tài liệu dựng lại, không phải file project đã lưu.
