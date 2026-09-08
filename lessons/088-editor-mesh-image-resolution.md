# 88 — Đổi độ phân giải ảnh mesh

Đã chuyển body của skeleton thử nested-robot từ region sang mesh bốn đỉnh, rồi giảm PSD Scale từ 1 xuống 0,5. Thân mesh giữ khung hiển thị khoảng x471–639, y214–382 ở cùng khung nhìn; head vẫn là region nên co lại. Không Fit/zoom giữa hai trạng thái. Đây mới là mesh chưa bind weights, chưa có deform.

[Mesh trước sync](../exercises/mesh-lab/scarf/resolution-mesh-full.png), [mesh sau sync](../exercises/mesh-lab/scarf/resolution-half-mesh.png).

PNG body giảm từ 205 × 206 xuống 104 × 104, head từ 228 × 209 xuống 115 × 106. Padding 1, Trim bật, Delete previously imported images tắt. Không sửa PSD nguồn hoặc xương để bù kích thước. Hình thân giữ kích thước tổng thể nhưng độ nét thay đổi; không kết luận trùng pixel.

Khi trả Scale về 1 và Sync, editor hiện hộp Images Resized: Stretch được chọn, mô tả co giãn tọa độ texture theo ảnh mới; Keep size giữ kích thước tọa độ texture, hữu ích khi thêm/bớt lề trắng. Đã xác nhận Stretch rồi kiểm tra hình nối lại. [Hộp lựa chọn](../exercises/mesh-lab/scarf/resolution-restored.png), [hình cuối](../exercises/mesh-lab/scarf/resolution-restored-final.png). Lượt giảm ảnh không có ảnh chụp hộp này, nên không khẳng định lựa chọn đã dùng ở lượt đó.

Cả hai PNG sau phục hồi khớp toàn bộ RGBA với bản sao ngay trước thử: [kiểm tra](../exercises/robot/psd-import/nested/mesh-resolution/checks.json). Body giữ là mesh để thực hành tiếp. Kết thúc Setup, chỉ nested-robot hiện, body được chọn; robot chính đang ẩn, không sửa key robot.

Bước tiếp theo: tạo biến dạng kiểm soát trên mesh thử và so cùng tư thế trước/sau giảm ảnh, quan sát rõ hộp Images Resized. Chưa đánh dấu phần giữ biến dạng khi giảm độ phân giải hoàn tất chỉ từ khung mesh đứng yên.


## Đối chứng mesh đã kéo lệch một đỉnh

Trong Setup, chọn góc dưới phải rồi nhấn Right bốn lần ở hệ Parent. Do attachment quay −90°, đỉnh di chuyển lên trên màn hình: từ khoảng (639,382) đến (639,350). Thân nghiêng ở mép dưới, ba góc còn lại giữ nguyên. Đây là biến dạng Setup tĩnh, không phải key Deform hoặc weights.

[Ảnh gốc đang biến dạng](../exercises/mesh-lab/scarf/deform-resolution-full.png). Giữ nguyên hình học, sync PSD Scale 0,5. Lượt này chụp ngay sau sync rồi đọc trạng thái lần nữa; không có hộp lựa chọn cần xác nhận, texture nạp xong và [mesh giữ hình lệch](../exercises/mesh-lab/scarf/deform-resolution-resize-half-ready.png). Không suy rộng rằng mọi lần giảm ảnh đều bỏ qua hộp này.

Trả Scale 1, sync và quan sát [Images Resized](../exercises/mesh-lab/scarf/deform-resolution-restore-loading.png), xác nhận Stretch. [Hình đang lệch sau khôi phục](../exercises/mesh-lab/scarf/deform-resolution-full-restored.png) giữ tư thế; vùng nội thất thân (472,240)–(610,345) trùng RGB với trước giảm. Hai PNG cũng khớp toàn bộ RGBA với nguồn trước thử: [báo cáo](../exercises/robot/psd-import/nested/mesh-resolution/deform-checks.json).

Chọn lại đỉnh rồi nhấn Left bốn lần, [trả hình chữ nhật ban đầu](../exercises/mesh-lab/scarf/deform-resolution-shape-restored.png). Giữ body là mesh, không tạo animation/key mới. Bài này đã kiểm tra đổi ảnh khi hình học Setup bị lệch; phần ảnh giảm độ phân giải trên mesh có weights và key Deform vẫn chưa được chứng minh. Không lặp phép tĩnh bốn đỉnh này để thay thế phần đó.


## Mesh có weights và key Deform

Đã bind body vào torso/head bằng Weights, Auto. Hai đỉnh trái đọc nhãn phần trăm làm tròn: trên torso 37%, head 64%; dưới torso 99%, head 2%. Không coi tổng nhãn 101% là tổng số thực; chưa đọc độ chính xác cao. [Trên](../exercises/mesh-lab/scarf/weighted-resolution-top-read.png), [dưới](../exercises/mesh-lab/scarf/weighted-resolution-bottom-read.png).

Tạo animation riêng mesh-resolution. Head Rotate hệ Parent có 0°/20°/0° tại 0/30/60, linear. Body có ba key Deform tại cùng mốc: hai đầu giữ dạng gốc, frame 30 chọn đỉnh dưới trái và nhấn Right ba lần, làm đỉnh đi lên khoảng 24 px trong viewport. Đã quan sát thay đổi do xương trước khi thêm Deform, rồi thấy thêm biến dạng mép dưới sau key đỉnh. Đây là mẫu kiểm tra đồng bộ, không phải animation sản phẩm được đánh giá nhịp.

Đã xem 0/15/30/45/60 với ảnh gốc, sync PSD Scale 0,5, rồi xem lại cả năm mốc ở cùng khung nhìn Animate. Thân giữ biến dạng do weights và Deform, gồm cả mốc giữa key; đầu region nhỏ và hở cổ là hệ quả giảm toàn PSD đã biết. Không sửa xương để bù. [Trước ở 30](../exercises/mesh-lab/scarf/weighted-resolution-full30.png), [ảnh nhỏ ở 30](../exercises/mesh-lab/scarf/weighted-resolution-half30.png), [giữa key 15](../exercises/mesh-lab/scarf/weighted-resolution-half15.png).

Trả PSD Scale 1, sync, chọn Stretch ở Images Resized. Xem lại cả năm mốc: vùng Outline (780,100)–(945,325) khớp RGB tuyệt đối với từng mốc trước giảm. Hai PNG khớp RGBA gốc. [Báo cáo năm pose](../exercises/robot/psd-import/nested/mesh-resolution/weighted-checks.json), [ảnh phục hồi 30](../exercises/mesh-lab/scarf/weighted-resolution-restored30.png).

Kết thúc Animate mesh-resolution frame 0, dừng, Loop bật; Graph đóng, body có weights và ba key Deform giữ làm mẫu. Robot chính vẫn ẩn, không sửa key robot. Phần giảm độ phân giải mesh đã có kiểm tra Setup, weights, key và hai mốc nội suy; không bảo đảm mọi topology hoặc mọi tỷ lệ. Tạm khép phép đồng bộ này, không cần lặp thêm cùng bộ năm pose khi chưa có lỗi mới.
