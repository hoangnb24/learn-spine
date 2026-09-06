# Kế hoạch tự học và thực hành Spine

Ngày lập: 06/09/2026. Người học và thực hiện: Codex.

## Đích đến

Tự làm được một nhân vật từ ảnh đầu vào đến rig, animation và kiểm tra kết quả; biết tìm nguyên nhân khi chuyển động lỗi và sửa có chủ đích. Tiến độ tính bằng bài thực hành có bằng chứng, không tính bằng số trang tài liệu đã đọc.

Hiện trạng: đã đọc dữ liệu Spineboy Essential và kiểm tra quan hệ xương/slot. Chưa thao tác được trong editor. Spine Trial có tiến trình chạy nhưng Computer Use chưa nhận diện được app.

## Lộ trình

| Bài | Nội dung và cách thực hành | Sản phẩm/bằng chứng | Tiêu chí đạt |
| --- | --- | --- | --- |
| 0. Điều khiển editor | Xử lý việc nhận diện Spine; mở mẫu, chọn xương, xoay rồi hoàn tác; chuyển Setup/Animate, chọn animation và phát/dừng | Ghi cách mở, ảnh trước/sau, thao tác có thể lặp lại | Tự thực hiện lại chuỗi thao tác và xác nhận kết quả trên giao diện |
| 1. Hiểu rig mẫu | Đối chiếu cây xương trong JSON với editor; thử xương cha/con, slot và thứ tự che khuất | Sơ đồ nhỏ, dự đoán trước mỗi thay đổi và kết quả quan sát | Giải thích đúng phần nào sẽ đi theo xương; sửa được một lỗi che khuất có chủ ý |
| 2. Animation đầu tiên | Trên mẫu, tạo hoặc chỉnh một đoạn đứng thở 2 giây; tập đặt key, chỉnh thời gian và đường nội suy | Các tư thế chính và bản xem chuyển động trong editor | Động tác đọc được, điểm nối vòng không giật rõ, phân biệt được lỗi tư thế với lỗi nhịp |
| 3. Nhân vật mới từ ImageGen | Tạo robot nhỏ có các bộ phận tách rời, kiểm tra ảnh, nhập Spine, đặt điểm xoay và dựng rig | Ảnh nguồn, các bộ phận, sơ đồ rig, ảnh tư thế kiểm tra | Khớp kín ở các tư thế dự kiến, hình không lệch phong cách hoặc thiếu phần bị che |
| 4. Bộ động tác của robot | Làm đứng nhún 2 giây, vẫy tay 2–3 giây và đi bộ 1 giây; sửa qua ít nhất hai vòng đánh giá | Bản đầu/bản sửa và lý do sửa | Đứng/vẫy có nhịp rõ; chân trụ không trượt đáng kể; các vòng lặp nối êm |
| 5. Mesh, weights và IK | Dùng bài phụ riêng: uốn một lá cờ hoặc anten; dùng mục tiêu IK để giữ chân khi hạ hông | Ví dụ lỗi và bản sửa cho từng kỹ thuật | Uốn không gãy rõ, hiểu xương nào điều khiển phần nào và khi nào dùng kỹ thuật đó |
| 6. Hoàn thiện quy trình | Kiểm tra đặt tên, ảnh thiếu, phiên bản; lưu project, xuất và phát trong runtime khi có bản hỗ trợ | Project mở lại được, dữ liệu xuất và bản phát thử | Mở lại không mất ảnh; kết quả phát tương ứng với editor; chạy lại quy trình được |

Bài 1 mới hoàn thành phần phân tích dữ liệu. Những bài còn lại chưa đạt. Bài 0 là điều kiện để đánh dấu đạt các kỹ năng thao tác editor; có thể chuẩn bị ảnh và đọc tài liệu trong lúc xử lý, nhưng không dùng chúng thay cho bằng chứng thực hành Spine.

## Bài nhân vật mới: robot giao hàng

Chọn robot có khớp cơ khí vì các mảnh cứng giúp nhìn rõ ảnh hưởng của điểm xoay và cây xương. Sau khi làm được nhân vật này mới chuyển sang nhân vật mềm có biến dạng phức tạp.

**Thiết kế dự kiến:** robot nhỏ thân tròn, góc nhìn chính diện hơi nghiêng, tay chân ngắn, màu kem và cam; hình khối đơn giản, không chữ, không bóng đổ nền. Đây là lựa chọn cho bài học, có thể điều chỉnh nếu ảnh sinh ra khó rig.

**Quy trình dùng ImageGen:**

1. Tạo một ảnh thiết kế tổng thể để chốt tỷ lệ và nhận diện nhân vật.
2. Dùng ảnh đó làm tham chiếu để tạo bộ phận tách rời: thân, đầu, cánh tay/cẳng tay/bàn tay mỗi bên, đùi/cẳng chân/bàn chân mỗi bên. Yêu cầu các mảnh không chạm nhau, nền trong suốt, cùng tỷ lệ và hướng sáng.
3. Kiểm tra bằng mắt trước khi rig: đủ mảnh, trái/phải đúng, nền thực sự trong suốt, mép sạch, phần khớp có vùng chồng lấp. ImageGen có thể tạo sai hoặc không nhất quán; sửa ảnh hoặc sinh lại phần lỗi trước khi tiếp tục.
4. Chuẩn bị từng ảnh riêng và đặt tên ổn định; đặt điểm xoay tại khớp. Mọi chỉnh sửa ảnh bằng AI dùng ImageGen; xử lý file cơ học chỉ thực hiện bằng công cụ phù hợp khi cần.
5. Dựng cây dự kiến `root → body → head/arms` và `body → legs`; thử biên độ từng khớp trước khi làm animation.
6. Làm tư thế chính, chỉnh nhịp, rồi mới thêm chuyển động trễ của đầu/tay. Đánh giá cả tốc độ bình thường lẫn từng tư thế quan trọng.

ImageGen tạo tài nguyên hình ảnh; phần rig và animation của bài này phải được thực hành trong Spine. Chưa gọi ImageGen ở bước lập kế hoạch.

## Cách học mỗi bài

1. Đặt câu hỏi nhỏ và dự đoán kết quả, ví dụ: xoay thân thì bàn tay và bàn chân nào đi theo?
2. Đọc phần tài liệu chính thức đủ để làm bài.
3. Thay đổi một yếu tố, quan sát và lưu bằng chứng.
4. Cố tình tạo một lỗi có thể hoàn tác, xác định nguyên nhân rồi sửa.
5. Làm lại từ trạng thái ban đầu để kiểm tra có thực sự nắm thao tác.
6. Ghi kết luận: đã làm được, còn chưa chắc, cần thử gì tiếp.

Mỗi bài lưu trong `lessons/`; bài có nhiều tài nguyên dùng thư mục riêng trong `exercises/`. Ghi nguồn ảnh/mẫu và phiên bản. Script chỉ được coi là công cụ hỗ trợ; JSON hợp lệ không chứng minh animation đẹp.

## Giới hạn Trial và cách tổ chức

Trial không lưu project, đóng gói texture hoặc xuất animation/hình/video theo [trang chính thức](https://esotericsoftware.com/spine-download). Vì vậy, các bài editor phải ngắn, có ảnh bằng chứng và hướng dẫn dựng lại; không trông cậy việc giữ app mở để bảo toàn bài tập.

Ảnh nguồn từ ImageGen và tài liệu/script trong workspace vẫn lưu được. Mốc lưu/xuất ở bài 6 cần bản Spine hỗ trợ; không tự mua hay nâng cấp. Có thể nghiên cứu runtime bằng dữ liệu mẫu đã xuất sẵn, nhưng điều đó chưa chứng minh đã xuất thành công animation tự làm.

## Việc làm ngay

Ưu tiên hoàn thành bài 0, xác định khả năng điều khiển Spine thực tế. Nếu vẫn không nhận diện được app sau khi kiểm tra có mục tiêu, ghi rõ giới hạn công cụ và phần cần người dùng hỗ trợ; tiếp tục chuẩn bị bài ảnh mới. Không đánh dấu tiến bộ thao tác editor chỉ vì đã đọc thêm tài liệu.

Sau mỗi bài, báo ngắn: sản phẩm để xem, điều đã học, lỗi đã sửa và bước tiếp theo. Chưa ấn định thời gian thành thạo khi khả năng điều khiển editor còn chưa xác minh.
