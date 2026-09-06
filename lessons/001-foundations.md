# Bài 1 — Cấu trúc nhân vật và đọc animation mẫu

Ngày: 06/09/2026. Người thực hành: Codex.

## Kết quả

Đã khởi động tiến trình Spine Trial qua Finder và đọc, kiểm tra dữ liệu mẫu Spineboy Essential bằng script. Chưa điều khiển được cửa sổ Spine, chưa sửa tư thế hoặc tạo animation trong editor.

## Những gì đã hiểu và đối chiếu

Xương tạo thành cây cha–con. Slot gắn với xương; hình hoặc mesh gắn với slot. Slot giúp quản lý thứ tự che khuất và tại một thời điểm chỉ hiện một attachment. [Basic Concepts](https://esotericsoftware.com/spine-basic-concepts).

Trong mẫu Essential đã tải, có 18 xương, 20 slot và 8 animation. Script lần theo chuỗi cha–con và kiểm tra rằng mỗi slot trỏ tới một xương tồn tại. Kết quả chi tiết nằm trong [báo cáo dữ liệu](001-data-report.md).

Bài đọc cụ thể: theo dõi kênh xoay `head` trong `walk`. Các key nằm tại 0; 0,2667; 0,5; 0,7667; 1 giây. Giá trị đầu và cuối đều là -12,23. Đây là điều kiện hữu ích khi xem xét vòng lặp, nhưng chưa đủ kết luận chuyển động mượt: cần xem nội suy và toàn bộ nhân vật.

JSON chứa dữ liệu xương và animation có thể được Spine nhập hoặc runtime đọc. Script hiện tại chỉ phân tích cấu trúc; không đóng vai trò runtime và không kiểm chứng kết quả hiển thị. [JSON format](https://esotericsoftware.com/spine-json-format).

## Thử nghiệm và lỗi thực tế

1. Gọi Computer Use bằng tên `Spine Trial` và đường dẫn app đều nhận `Invalid app`.
2. Mở Finder, dùng Go to Folder. Nhập đường dẫn bằng `type_text` chỉ còn tên file trong ô; dùng `set_value` với đường dẫn đầy đủ đã chọn đúng ứng dụng.
3. Gọi hành động `open` trên mục SpineTrial. Kiểm tra tiến trình thấy `/Applications/SpineTrial.app/Contents/MacOS/Spine Trial` đang chạy.
4. Computer Use vẫn không liệt kê Spine và không đọc được trạng thái app. Metadata thiếu `CFBundleIdentifier`; đây là dấu hiệu liên quan, chưa đủ để xác định nguyên nhân.
5. Chuyển sang đọc mẫu chính thức và tạo script kiểm tra. Không sửa metadata của ứng dụng để cố làm công cụ nhận diện.

## Chạy lại phần đã làm được

Tại thư mục learn-spine, chạy `python3 scripts/inspect_spine.py`. Script đọc bản JSON lưu trong workspace và tạo lại báo cáo; không cần tải lại dữ liệu.

## Tự đánh giá

- Đã làm được: đọc cây xương, kiểm tra liên kết slot, liệt kê animation và các key của một chuyển động cụ thể.
- Mới hiểu từ tài liệu: tác động của xương cha, vai trò slot và đường nhập JSON vào editor.
- Chưa chứng minh: thao tác rig, đặt key, chỉnh đường nội suy, đánh giá chuyển động bằng mắt, lưu/xuất sản phẩm.

## Bài tiếp theo

Giải quyết khả năng nhận diện cửa sổ Spine, sau đó mở project mẫu từ màn hình Welcome theo [Getting Started](https://esotericsoftware.com/spine-getting-started). Thử xoay một xương, quan sát các phần đi theo, hoàn tác và kiểm tra tư thế trở lại. Chỉ đánh dấu đạt khi có bằng chứng giao diện trước/sau.
