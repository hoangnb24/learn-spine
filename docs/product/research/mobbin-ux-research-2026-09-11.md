# Nghiên cứu UX bằng Mobbin — 11/09/2026

## Kết luận cho thiết kế

Ưu tiên workspace lấy canvas làm trung tâm, cây đối tượng/ảnh bên trái, thuộc tính của selection bên phải và timeline phía dưới. Review kết quả qua lịch sử thay đổi và checkpoint; agent hoạt động ở host bên ngoài, không thêm khung chat nhúng. Thiết kế hai ảnh riêng: trải nghiệm robot đích #12–14 và khung trống #5 có cùng hệ thống thị giác.

Đây là đề xuất UX từ ảnh tham khảo, không mở rộng acceptance của issue. Đã đọc README, scope, product UX brief, backlog audit và contract UX audit cùng ngày. Đã dùng Mobbin Plugin thực tế: bốn truy vấn hẹp trên web, giới hạn 2–3 kết quả mỗi truy vấn; xem toàn bộ ảnh preview trả về. Luồng nhiều bước chỉ có preview cách đều (đầu/giữa/cuối), nên không suy diễn các bước không được xem. Không gửi nội dung tài liệu riêng vào truy vấn. Không kiểm thử tương tác của app tham khảo.

## Quan sát từ nguồn

| Nguồn đã xem | Điều nhìn thấy trong ảnh | Đề xuất riêng cho learn-spine |
| --- | --- | --- |
| [Figma — Creating a design file](https://mobbin.com/flows/3ff8cc29-ddbe-48e4-9d1d-a2b97c3f3e77), preview 1/3/5 | Đi từ danh sách file dạng thẻ sang canvas; bên trái có File/Assets và cây layers; hướng dẫn nhỏ nằm ngay trong workspace. | Empty state có hai đường đi rõ: mở gói project và nạp PNG tách bộ phận. Không cần dashboard template/library hoặc tour nhiều bước. |
| [Rive — Uploading an asset](https://mobbin.com/flows/6ba49842-a00b-4d45-ada7-66abbe839a75), preview 1/3/5 | Hierarchy/Assets dùng chung vùng trái; preview giữa có vòng tiến độ cạnh ảnh; preview cuối chọn asset màu xanh, inspector hiện thumbnail, tên file, kích thước và thông tin xuất. | Nạp ảnh không che mất ngữ cảnh canvas. Chọn ảnh thì hiện kích thước và tình trạng sử dụng; xử lý lỗi tại danh sách nhập. Không suy rằng nguồn đã có rollback hoặc validation theo hợp đồng của ta. |
| [Framer — selected object inspector](https://mobbin.com/screens/b9342420-e6c8-4183-8194-c56791fc13f8) | Hộp selection màu xanh nối đối tượng trên canvas với bảng Style bên phải; các nhóm Layout/Effects/Styles có phân cấp; Pages/Layers/Assets ở trái. | Một selection thống nhất giữa cây, canvas, inspector và track. Thuộc tính chia nhóm nhỏ; không trải toàn bộ rig/animation/advanced trên một màn hình. |
| [Jitter — animation timeline](https://mobbin.com/screens/c36b2a4b-2efd-4598-be6b-35d3dcb10ff2) | Timeline nằm dưới canvas, có các hàng Scale/Rotate/Move/Opacity, thước giây và playhead đỏ; Design/Animate ở phải. | Dùng timeline theo thuộc tính và animation đang chọn. Giữ play/pause, thời điểm, loop và scrubbing cùng một vùng. Hình dạng block của nguồn không phải bằng chứng cho keyframe editor; ta cần keyframes cụ thể. |
| [Rive — animation editor](https://mobbin.com/screens/f6733dd6-d26b-492b-a225-548c8520781e) | Hierarchy trái, canvas giữa, properties phải; danh sách Animations ở góc dưới trái; timeline với playhead bên dưới; Design/Animate tách mode; bảng interpolation phía dưới phải. | Đây là cấu trúc gần nhất với region/bone v0: tách Setup và Animate, chọn idle/wave ở vùng timeline; chỉ mở interpolation khi chọn key. Không lấy state machine, joystick hoặc công cụ nâng cao vào v0. |
| [Figma — version history](https://mobbin.com/screens/e024e911-7e57-48af-904e-61283e8d63fc) | History chiếm panel phải, canvas vẫn hiện; các mốc có tên/thời gian, nhóm autosave thu gọn; menu có Name this version và Restore this version. | History là tab có thể thay inspector, không thêm cột cố định. Checkpoint có tên dễ hiểu; khôi phục là thao tác thay đổi project. Không vẽ xem trước checkpoint hoặc diff như đã có API. |
| [Google AI Studio — app versions](https://mobbin.com/screens/26c8f8ba-2aaa-4028-8983-d41f4b71b784) | Versions ở panel phải, mốc hiện tại có nhãn Current; các mục mô tả thay đổi, Restore version ở đáy. | Dùng lời mô tả việc đã sửa và nhãn bản hiện tại trong lịch sử. Không lấy chat, Publish, Secrets hoặc service của nguồn vào sản phẩm. |

## Kết quả không phù hợp và giới hạn

- [Magnific — canvas settings](https://mobbin.com/screens/7ba349c7-c9ec-4233-803a-2a8ab445385b) có canvas lớn, công cụ cạnh trái và Export bên phải, nhưng không có cây cấu trúc/timeline trong ảnh. Không dùng làm khung chính; tùy chọn JPG/scale của nguồn không quyết định đầu ra của ta.
- [Ditto — selected text](https://mobbin.com/screens/e05f7c4f-20a9-4a25-ab85-84897a3f1b6d) thể hiện selection, inspector, comment và metadata công việc, nhưng thiên về quản lý nội dung văn bản. Không nhập Assign/Tags/Variants vào editor animation.
- [VEED — animation/video editor](https://mobbin.com/screens/298744d5-2328-4b4e-a55a-8a6c188a72d8) có thước thời gian, thumbnail video, hàng subtitle/audio và preset animation. Chỉ tham khảo vị trí playback; loại video clips, audio, subtitle và preset sinh hiệu ứng khỏi preview region v0.
- Không tìm riêng luồng export vì đã dùng đủ bốn truy vấn ưu tiên cấu trúc chỉnh sửa và review. Nguồn có nút Export chỉ chứng minh vị trí hiển thị, không chứng minh save/recovery hoặc bundle workflow. Phần save/import failure bên dưới dựa vào audit sản phẩm, không gán cho Mobbin.

## Brief cụ thể bàn giao designer

### Ảnh A — trải nghiệm đích robot #12–14

- Caption ngoài khung: **Concept trải nghiệm robot · đích #12–14**, dữ liệu minh họa. Không gắn nhãn hoàn thành hay Gate passed.
- Canvas chiếm diện tích lớn nhất, robot ghép từ PNG tách bộ phận; một cánh tay được chọn, có xương/khớp vừa đủ để hiểu sửa có phạm vi. Cây bên trái làm nổi cùng cánh tay; tab Assets riêng, không trộn ảnh nguồn và bone.
- Thanh trên: tên project, Undo/Redo, trạng thái **Đã lưu trên trình duyệt**, **Tải gói project**, **Mở Player**. Menu file phân biệt **Mở gói project** và **Nạp ảnh PNG**. Không cloud sync, đăng nhập, MP4 hay spritesheet.
- Mode **Setup / Animate** rõ. Inspector theo selection có vị trí/góc xoay/tỉ lệ, không raw JSON. Timeline phía dưới có idle/wave, play/pause, loop, thời điểm, track cánh tay và keyframe. Không vẽ mesh, IK, weights hoặc physics.
- Review dùng tab **Thuộc tính / Lịch sử** ở cùng panel phải. Nếu cần một inset, hiện lịch sử như “Chỉnh nhịp vẫy tay”, “Tạo checkpoint: Trước khi chỉnh tay”, “Bản hiện tại”. Ghi rõ checkpoint chỉ giữ trong phiên; **Khôi phục** thay đổi project, không phải nút preview.
- Trạng thái agent nhỏ, thu gọn, dùng nhãn **Agent kết nối từ bên ngoài** hoặc **Agent chưa kết nối**. Khi có job, tên hành động cụ thể như **Đang tạo chuỗi PNG** và **Hủy tác vụ**. Tách với Pause playback; không dùng “Dừng AI” cho cả ba việc. Hình không cần chat composer.
- Một inset phục hồi có thể là **Chưa lưu được trên trình duyệt** với **Thử lại / Tải gói project**. Chỉ trình bày là trạng thái đề xuất; bundle phải được tạo từ phiên hợp lệ trước khi cho tải.
- Không side-by-side, onion-skin, Before/After slider hoặc trạng thái “chỉ tay thay đổi” như bằng chứng tự động. Ghi chú phạm vi sửa trong history là mô tả, không thay thế kiểm chứng giữ phần còn lại.

### Ảnh B — khung #5 + player entry trống

- Caption: **Issue #5 · Khung workspace**, cùng visual system với ảnh A.
- Editor chưa mở project: canvas trống, panels có nhãn và empty state nhẹ, timeline chưa có dữ liệu. Không robot, keyframes hoạt động hoặc trạng thái saved giả. Các vị trí hành động tương lai có thể bị vô hiệu hóa và ghi chú ngoài khung; không làm người xem nghĩ import đã chạy ở #5.
- Player là cửa sổ/entry riêng, với vùng xem trống và tên Player rõ; không inspector/history/checkpoint. Một placeholder mở gói thể hiện ý định tương lai, chưa phải chức năng #5 đã build.
- Khung rỗng là **chưa có phiên project**, không tạo model rỗng trái quy định cần ít nhất một bone.

### Thị giác và khả năng sử dụng đề xuất

Tạo ngôn ngữ riêng, không sao chép logo, palette hoặc chrome của app tham khảo. Nền trung tính giúp đọc PNG trong suốt, màu nhấn nhất quán cho selection; trạng thái lỗi phải có chữ, không chỉ màu. Panel có thể thu gọn; ưu tiên diện tích canvas hơn marketing copy. Khi triển khai #12 cần định nghĩa focus, bàn phím và desktop tối thiểu; ảnh tĩnh chưa chứng minh các hành vi này.

## Những điểm phải chốt trước implementation

Import PNG mới và lỗi giữ phiên cũ thuộc phối hợp #7/#10/#12. History/checkpoint cần coordinator và sự kiện chung; chỉ đọc revision không đủ. Metadata kết quả cũ, camera/time và cancel thuộc #9/#11/#13. Giao diện review không tự giải quyết các hợp đồng này. Không có phát hiện UX trong nghiên cứu này cần dừng hoặc mở rộng #5.
