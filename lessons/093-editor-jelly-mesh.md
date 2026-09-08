# Bài 93 — Dựng mesh toàn thân thạch

08/09/2026. Đã thực hành trong Spine 4.3.25 Trial; chưa có animation có key.

## Kết quả

Skeleton riêng `jelly-soft` trong project đang mở, với `root → jelly-base / jelly-body / jelly-crown`. Ba xương cùng cấp, Rotate 0, Scale 1, Length 0; X 0 và Y lần lượt 0/150/300. Slot `jelly` vẫn dưới root, attachment `jelly` đã bind vào ba xương bằng Auto weights.

Mesh có **52 đỉnh: 28 đường bao và 24 trong thân**. Các hàng trong chia vùng đỉnh, mặt, bụng và đáy; chưa chỉnh cạnh thủ công. [Ảnh kiểm tra số đỉnh](../exercises/soft-character/evidence/mesh-52.png), [cây xương](../exercises/soft-character/evidence/bones-setup.png), [bind](../exercises/soft-character/evidence/weights-bound.png).

Images dùng `exercises/soft-character/images/`, chọn jelly.png, bỏ jelly-v2.png. Đường bao vẽ quanh hình nhìn thấy, không lấy bounds alpha khác 0 vì ảnh có điểm alpha thấp ở xa.

## Thao tác và lỗi đã xử lý

New Skeleton từ menu Spine giữ các skeleton cũ trong project. Dùng Images → Path nhập thư mục, chọn ảnh → Parent → root để tạo slot. Kéo ảnh trực tiếp không tạo attachment trong lần thao tác này, nên chuyển sang Parent.

Chuyển region sang Mesh rồi Edit Mesh → New. New thay đổi vị trí và kích thước hiển thị so với region trước đó; đã căn lại bằng thông số attachment cuối: X 0, Y khoảng 164 (UI 163,9999), Scale X/Y 0,16. Đáy đường bao trùng gần trục ngang root trong ảnh Setup; đáy hình màu cách trục vài pixel do mép trong suốt. Chưa đo chính xác tiếp xúc toàn bộ đáy.

Chọn 28 điểm ngoài thân rồi đóng đường bao. Thêm 24 điểm trong. Đã sửa việc ba lần bấm cuối rơi lên thanh breadcrumb khiến Edit Mesh đóng: mở lại, xác nhận 49 đỉnh, thêm ba điểm đáy rồi đọc đủ 52. Không có mesh 52 cho đến lượt đọc cuối này.

## Thử biến dạng

Trong Animate, chưa tạo animation/key. Chỉ sửa tạm Translate Y của crown, giữ body/base:

| Crown Y | Quan sát |
| --- | --- |
| 300 | Trung tính |
| 240 | Đỉnh hạ, thân trên nén; mắt dẹt rõ |
| 340 | Thân trên kéo dài, mắt cũng dài theo |
| 300 khôi phục | Vùng Outline trùng RGB hoàn toàn với ảnh trung tính trước thử |

[Trung tính](../exercises/soft-character/evidence/neutral-before.png), [nén](../exercises/soft-character/evidence/crown-compress-240.png), [kéo giãn](../exercises/soft-character/evidence/crown-stretch-340.png), [đối chiếu phục hồi](../exercises/soft-character/evidence/pose-check.json).

Đường viền nhìn thấy liền trong các pose này; chưa kiểm tra mọi góc hoặc playback. Không suy ra đáy hoàn toàn cố định chỉ từ quan sát ba pose. **Auto weights làm mắt dẹt quá nhiều khi nén**: đây là lỗi cụ thể tiếp theo cần sửa bằng phân bố weights vùng mặt, rồi thử cùng pose để đối chiếu. Không cần sinh lại ảnh chỉ để xử lý lỗi phân bố này.

## Trạng thái để tiếp tục

Animate, frame 0, dừng; crown đã trả Y 300. Robot ẩn, jelly-soft hiện. Chưa có key. Bước tiếp theo: chỉnh vùng mặt và đọc weights vùng đáy, sau đó một vòng bật với kiểm tra playback theo phạm vi bài nhân vật mềm. Lưu/xuất đã loại khỏi yêu cầu hiện tại.
