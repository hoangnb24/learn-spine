# Công cụ hiện có để học và làm việc với Spine

Kiểm tra ngày **06/09/2026**, múi giờ Asia/Ho_Chi_Minh.
Workspace: `/Users/tubakhuym/projects/learn-spine`.

Đây là bản kiểm kê khả năng hiện tại, không phải chứng nhận đã thành thạo các công cụ.

**Cập nhật sau bài 1 cùng ngày:** đã mở Spine qua Finder và xác nhận tiến trình chạy. Computer Use vẫn báo `Invalid app`, nên chưa xác nhận nội dung cửa sổ editor. Đã tải và phân tích JSON mẫu Spineboy Essential chính thức; xem [bài thực hành](../lessons/001-foundations.md). Bảng dưới giữ kết quả kiểm kê ban đầu.

**Cập nhật CLI:** `--version` báo launcher 4.3.06 và editor **4.3.23 Trial**. `--help` của bản Trial không liệt kê nhóm nhập/xuất. Xem [bài 2](../lessons/002-contact-and-mesh.md).

## Tổng quan

| Công cụ | Vai trò trong việc học Spine | Trạng thái đã kiểm tra |
| --- | --- | --- |
| Computer Use | Quan sát và thao tác ứng dụng macOS bằng chuột, bàn phím, ảnh chụp màn hình | Đã đọc được giao diện Finder và danh sách ứng dụng; chưa điều khiển được Spine |
| Chrome | Đọc tài liệu trên trình duyệt, tương tác trang web, xem các bản demo | Đã kết nối được Chrome qua tiện ích; chưa thử thao tác trang web trong lần kiểm kê này |
| Web Search | Tìm và đối chiếu tài liệu Spine, ví dụ và giải thích lỗi | Đã tìm kiếm và mở được trang chính thức về Spine Trial |
| Spine Trial | Môi trường thực hành rig và animation | Có ứng dụng trong Applications và bộ cài trong Downloads; chưa xác nhận editor chạy được |

## 1. Computer Use

**Khả năng được cung cấp:** đọc trạng thái giao diện và ảnh chụp ứng dụng; click, kéo thả, cuộn, nhấn phím, nhập và dán văn bản. Ưu tiên chọn phần tử giao diện theo thông tin công cụ trả về; dùng tọa độ từ ảnh chụp khi cần.

**Ứng dụng dự kiến với Spine:** chọn xương, thay đổi tư thế, thao tác timeline, phát animation và quan sát kết quả. Những thao tác này chưa được thử trên Spine.

**Bằng chứng trong phiên này:** đọc thành công cửa sổ Downloads của Finder. Yêu cầu đọc `/Applications/SpineTrial.app` trả về `Invalid app`. Danh sách ứng dụng từ Computer Use không có Spine để lấy định danh thay thế. File `Info.plist` của Spine Trial cũng không có trường `CFBundleIdentifier`.

**Điểm còn phải xác minh:** cách công cụ nhận diện Spine và khả năng thao tác bên trong editor. Chưa đủ bằng chứng để kết luận nguyên nhân lỗi hay ứng dụng bị hỏng.

## 2. Chrome

**Khả năng được cung cấp:** mở và điều hướng tab, đọc nội dung trang, click, nhập liệu, cuộn và chụp ảnh trang. Có thể dùng khi cần xem hướng dẫn hoặc tương tác với một trang demo.

**Bằng chứng trong phiên này:** kết nối thành công tới Chrome qua tiện ích trình duyệt và đặt tên phiên “🔎 Công cụ học Spine”. Chưa mở trang thử nghiệm hay kiểm tra phát animation trên web.

Chrome điều khiển nội dung trong trình duyệt; việc thao tác Spine desktop cần Computer Use hoặc khả năng chính thức khác của Spine được xác minh sau.

## 3. Web Search

**Khả năng:** tìm kiếm trên web, mở và đọc trang, tìm nội dung trong tài liệu; phù hợp để tra cứu nhanh và lưu nguồn cho các kết luận.

**Bằng chứng trong phiên này:** tìm thông tin về giới hạn Trial và đọc được [trang tải Spine Trial chính thức](https://esotericsoftware.com/spine-download).

Khi học, ưu tiên tài liệu và ví dụ của Esoteric Software. Ghi phiên bản liên quan khi một hướng dẫn phụ thuộc phiên bản. Nội dung đọc được cần được kiểm chứng bằng bài thực hành trước khi ghi là đã làm được.

## 4. Spine Trial

**Các file đã tìm thấy:**

- Ứng dụng: `/Applications/SpineTrial.app`.
- Bộ cài: `/Users/tubakhuym/Downloads/SpineTrial-ARM.dmg`.
- Tên trong metadata: `Spine Trial`.
- Phiên bản trong `Contents/Info.plist`: `4.3.06`. Đây là phiên bản gói ứng dụng; chưa xác nhận phiên bản editor bên trong qua giao diện.

**Khả năng và giới hạn theo nhà phát triển:** Trial có các tính năng Spine Professional, ngoại trừ lưu project, đóng gói texture và xuất dữ liệu animation, hình ảnh hoặc video. Trial kèm project mẫu cùng JSON và texture atlas đã xuất sẵn để đánh giá runtime. [Nguồn chính thức, kiểm tra 06/09/2026](https://esotericsoftware.com/spine-download).

**Ảnh hưởng đến việc học:** có thể dùng Trial để tập thao tác và quan sát kết quả trong editor sau khi kết nối được. Cần lưu ghi chép và bằng chứng thực hành bên ngoài ứng dụng; không dựa vào khả năng lưu project đã chỉnh sửa. Mốc tạo project `.spine` lưu được và xuất animation do mình làm trong trao đổi trước chưa thể hoàn thành bằng Trial.

**Chưa thử:** mở project mẫu, tạo/chỉnh xương, đặt keyframe, phát animation, nhập dữ liệu và dòng lệnh. Chưa coi bất kỳ thao tác nào trong số này là đã hoạt động trên bản cài hiện tại.

## Hỗ trợ trong workspace

Ngoài bốn công cụ chính, có thể đọc/ghi file và chạy lệnh để tạo tài liệu, script hoặc dữ liệu thử nghiệm trong `learn-spine`. Đã dùng khả năng này để kiểm tra metadata ứng dụng và tạo bản ghi này. Khả năng chạy lệnh không đồng nghĩa với việc Spine Trial hỗ trợ tự động nhập/xuất; phần đó cần kiểm tra riêng.

## Bước thực hành tiếp theo

Xác định cách mở và nhận diện Spine trong Computer Use, sau đó mở một project mẫu, chọn một xương và thử thay đổi tư thế. Ghi lại thao tác và kết quả quan sát trước khi chuyển sang animation.
