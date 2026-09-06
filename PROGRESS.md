# Tiến độ thực hành

Cập nhật 06/09/2026. Toàn bộ kế hoạch vẫn đang thực hiện; chưa thành thạo Spine toàn diện.

**Đang bị chặn ở bước editor:** sau ba lượt làm việc, Spine vẫn chạy nhưng Computer Use không liệt kê ứng dụng và trả `Invalid app`. Các bài runtime và ảnh nguồn đã lưu. Cần người dùng cho phép thử API macOS/AppleScript trước khi tiếp tục đường điều khiển thay thế. Đây là điều kiện để trở lại các bài editor trong kế hoạch; chưa đánh dấu hoàn thành chúng. Việc lưu/xuất project sau đó còn phụ thuộc bản Spine hỗ trợ chức năng này.

| Phần kế hoạch | Trạng thái | Bằng chứng / việc còn thiếu |
| --- | --- | --- |
| 0. Điều khiển editor | Chưa đạt | Spine có tiến trình nhưng Computer Use không nhận diện; đang hỏi người dùng về cách điều khiển macOS thay thế |
| 1. Rig mẫu | Một phần | Phân tích Spineboy JSON đã có; chưa đối chiếu và sửa trực tiếp trong editor |
| 2. Animation mẫu trong editor | Chưa đạt | Chưa đặt key hay chỉnh graph trong editor |
| 3. Robot từ ImageGen | Một phần đáng kể | Có concept, 15 mảnh alpha, rig FK/IK và bản xem runtime; chưa nhập editor |
| 4. Bộ động tác robot | Một phần | Idle, wave, squat và step thử nghiệm; dáng đi hoàn chỉnh và kiểm tra thẩm mỹ còn thiếu |
| 5. Mesh, weights, IK | Một phần | Đã kiểm chứng IK, mesh có trọng số và deform bằng runtime; còn thao tác editor |
| 6. Quy trình lưu/xuất | Chưa đạt | Có render từ runtime của dữ liệu tự tạo; không thay thế kiểm tra lưu/xuất từ editor |

Sản phẩm mới: [bài robot](exercises/robot/README.md), [video](exercises/robot/robot-study.mp4), [GIF vẫy tay](exercises/robot/wave.gif).

## Phạm vi mở rộng để học toàn diện

Đối chiếu [mục lục Spine User Guide](https://esotericsoftware.com/spine-user-guide) ngày 06/09/2026. Mỗi nhóm cần một bài nhỏ trong editor, một lỗi cố ý rồi sửa, và bằng chứng; bảng này không coi việc đọc tên chức năng là đã học xong.

| Nhóm | Bài kiểm chứng dự kiến | Hiện tại |
| --- | --- | --- |
| Giao diện, tools, setup/animate, phím tắt | Dựng lại và sửa một rig nhỏ | Chưa đạt |
| Xương, kế thừa transform, slots, draw order | So sánh dự đoán với chuyển động và thứ tự che khuất | Đã thử một phần bằng runtime |
| Images, region, import PSD | Nhập tài nguyên đúng tỷ lệ và sửa ảnh thiếu | Ảnh rời đã chuẩn bị; editor chưa thử |
| Key, dopesheet, graph, timeline, playback | Chỉnh nhịp cùng một động tác bằng các công cụ | Bezier bằng dữ liệu đã thử; editor chưa thử |
| Mesh, weights, deform | Uốn lá cờ; cố ý đặt trọng số sai rồi sửa | Đã làm dải ảnh có lưới, sửa weights và schema deform bằng runtime; editor chưa thử |
| Bounding box, clipping, path, point | Va chạm thử, che một phần nhân vật, đi theo đường, điểm gắn vật | Chưa làm |
| Skins, linked assets, đổi attachment | Hai bộ trang phục dùng chung animation | Đã đổi skin màu giữ nguyên pose; trang phục khác hình dáng và editor chưa làm |
| IK | Hạ hông và giữ chân, đổi hướng gập | Đã đo và xem trong runtime; editor chưa thử |
| Transform/path/physics constraints, sliders | Điều khiển nhiều phần, đi theo đường, anten rung có kiểm soát | Chưa làm |
| Events và audio | Đánh dấu bước chân và đồng bộ âm thanh | Đã kiểm tra callback bước chân; âm thanh/editor chưa làm |
| Ghosting, preview, animation mixing | So sánh tư thế, phối chạy và vẫy ở các track | Đã kiểm tra hai track và mix sang animation rỗng bằng runtime; các view editor chưa làm |
| Metrics, outline, skins/slot color/weights views | Phát hiện lỗi và kiểm tra chi phí rig | Chưa làm |
| Versioning, import/export, texture packing, CLI, settings | Mở lại project và kiểm tra vòng nhập/xuất đúng phiên bản | Chưa đạt; lưu/xuất Trial có giới hạn |

Ưu tiên tiếp theo vẫn là mở được đường thực hành editor; các kết quả runtime không thay thế mục tiêu đó.

Cập nhật bài 2: thêm [bước ngang và mesh](lessons/002-contact-and-mesh.md). CLI đã xác nhận editor là 4.3.23 Trial. Robot có thêm bước ngang 1 giây và kiểm tra chân trụ; dáng đi tiến/chuyển trọng lượng còn cần thực hành thêm.

Cập nhật bài 3: thêm [skin, track và event](lessons/003-skins-and-tracks.md), gồm thử lỗi xóa track không trả về pose và sửa bằng mix sang animation rỗng.
