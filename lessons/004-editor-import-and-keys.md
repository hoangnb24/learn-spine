# Robot trong Spine Editor: nhập, skin, IK và key

Thực hành trực tiếp ngày 06/09/2026, Spine 4.3.23 Trial, qua Computer Use với `local.spine.trial`.

## Kết quả đã quan sát

- Nhập robot vào project mới; bật skin orange thấy đủ các phần ảnh, không hiện ảnh thiếu.
- Chuyển Animate, chọn squat và so sánh frame 0 với 21: hông hạ, đầu gối gập, hai bàn chân giữ vị trí trên màn hình. Đây là bằng chứng quan sát trong editor; phép đo sai số chi tiết vẫn thuộc bài runtime.
- Chọn wave ở frame 13: tay giơ lên, các mảnh nối thành cánh tay như bản runtime.
- Bật mint bằng dấu tròn ở cột trái của Tree: màu đổi, tư thế được giữ.
- Chọn head trên canvas. Auto Key bật. Thử nhập vào ô Rotate ở frame 13, quan sát góc cuối là −13° và xuất hiện key mới. Chuyển frame 10 rồi về 13: giá trị −13° còn giữ.
- Click Undo ở thanh trên: góc trở lại −3.787°, key thử nghiệm ở frame 13 biến mất. Bài thử đã được hoàn tác.

Không coi bài này là đã tự dựng toàn bộ rig trong editor hoặc đã chỉnh thành thạo graph. Rig/key ban đầu do script chuẩn bị; thao tác sửa key và hoàn tác nói trên được làm trực tiếp trong editor.

## Hai lỗi nhập và cách sửa

1. JSON 4.2 gặp thông báo không cùng phiên bản với editor 4.3. Trial chỉ chạy phiên bản hiện hành. Bản riêng `robot-editor-4.3.json` dùng mảng `constraints`, mỗi IK có `type: ik` theo [mã đọc JSON chính thức 4.3](https://github.com/EsotericSoftware/spine-runtimes/blob/4.3/spine-ts/spine-core/src/SkeletonJson.ts). Không dùng bản này với runtime 4.2.
2. Log báo `Multiple attachments have the same name: thigh-left`. Chỉ đổi tên attachment mint chưa đủ. Chuyển bộ default thành skin có tên `orange`, giữ bộ còn lại là `mint`, rồi chọn skin trong editor thì nhập thành công. Đây là khác biệt giữa attachment mặc định và placeholder của skin cần nhớ khi tự viết dữ liệu.

Chạy `python3 scripts/build_editor_robot.py` để tạo lại bản nhập đã kiểm chứng. Script chỉ xử lý phạm vi robot này, không phải công cụ chuyển phiên bản tổng quát. Quy trình chính thức với dữ liệu xuất cũ vẫn là nhập vào editor tương ứng rồi mở project bằng bản mới: [Versioning](https://esotericsoftware.com/spine-versioning).

## Cách lặp lại

1. Menu Spine → Import Data, nhập đường dẫn tuyệt đối đến `exercises/robot/robot-editor-4.3.json`, Scale 1, New project, Import.
2. Tree → Skins → click dấu tròn bên trái orange. Click tên chọn dòng; double-click tên mở Rename, không bật skin.
3. Chuyển Animate; mở Animations; click dấu tròn của squat hoặc wave.
4. Nút Fit ở góc dưới trái viewport giúp thấy toàn bộ robot. Kéo vạch giữa viewport và Graph xuống để có thêm chỗ nhìn.
5. Click thước timeline tại frame mong muốn. Chọn xương head trên canvas để thấy góc Rotate. Thực hành key với Auto Key, kiểm tra sau khi chuyển frame, dùng nút Undo trên cùng để hoàn tác.

Computer Use: `paste` từng bị timeout trong ô nhập Spine; `type_text` hoạt động. Triple-click chọn toàn bộ đường dẫn; các tổ hợp chọn văn bản thử trong phiên này không đáng tin. Với ô số, kiểm tra giá trị cuối vì thao tác nhập có thể được hiểu khác dự định. Không ghi nhận −10° là kết quả khi giao diện thực tế hiển thị −13°.

Sau khi mở Console từ Open Log trong chế độ toàn màn hình, click tọa độ báo `noWindowsAvailable` dù đọc ảnh/gửi phím vẫn được. Đã thoát bằng menu accessibility → Quit Spine rồi mở lại bản Control; chuột hoạt động trở lại. Giữ cửa sổ thường để thực hành. Interface scale đã tăng và có hiệu lực sau khởi động lại.

## Bằng chứng

- [Lỗi phiên bản](../docs/evidence/robot-import-version-error.jpg)
- [Squat frame 0](../docs/evidence/robot-editor-squat-0.jpg), [frame 21](../docs/evidence/robot-editor-squat-21.jpg)
- [Wave trong editor](../docs/evidence/robot-editor-wave.jpg)
- [Mint trước key](../docs/evidence/robot-editor-mint-before-key.jpg)
- [Key mới còn giữ sau đổi frame](../docs/evidence/robot-editor-new-key.jpg), [Undo về góc gốc](../docs/evidence/robot-editor-key-undone.jpg)

Còn thiếu: tự dựng/thay đổi cấu trúc rig trong editor, sửa draw order, chỉnh graph có chủ đích, mesh/weights trong editor và các nhóm nâng cao. Trial chưa cho phép hoàn thành mốc lưu project và xuất từ editor.
