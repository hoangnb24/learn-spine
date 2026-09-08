# Tra cứu thực hành Spine

Trạng thái audio cập nhật: [bài 97](../lessons/097-user-audio-check.md) đã có người dùng nghe và xác nhận tiếng bước chân walk-wide rõ, khớp chạm đất, không rè/chồng tiếng. Những dòng ghi audio còn mở phía dưới mô tả thời điểm trước xác nhận này.

Tổng hợp từ các thao tác đã kiểm chứng trong Spine 4.3.25 Trial, cập nhật 08/09/2026. Đây là lối vào các bài đã làm, không phải bằng chứng mới hay tuyên bố đã thành thạo mọi chức năng.

## Bắt đầu một lượt làm việc

1. Xác nhận skeleton, Setup/Animate, animation đang **kích hoạt**, frame và trạng thái phát/dừng. Chọn tên trong Tree có thể chỉ chọn đối tượng; chấm bên trái tên mới đổi animation/skin đang dùng trong những thao tác đã thử.
2. Xác nhận hệ tọa độ trước khi nhập số. World là tọa độ chung; Parent là tọa độ so với xương cha. Cùng một xương có thể hiện số khác nhau khi đổi hệ.
3. Chụp hoặc ghi thông số trước thay đổi. Với thử animation, dùng bản sao khi cần giữ bản gốc để so sánh.
4. Làm một thay đổi có dự đoán rõ, đọc lại kết quả trong UI rồi kiểm tra hình. Không coi chuỗi phím đã gửi là thao tác thành công.

## Chọn cách xử lý theo dấu hiệu

| Dấu hiệu | Kiểm tra trước | Cách sửa đã thử và cách xác nhận |
| --- | --- | --- |
| Chọn animation khác nhưng hình không đổi | Tên đang chọn có thực sự đang kích hoạt không? | Bấm chấm trái tên, nhìn tên được gạch dưới và pose ở frame có khác biệt. [Đối chiếu robot](../exercises/robot/editor-review/README.md) |
| Nhập tên ảnh mới rồi hiện MISSING | Image path có bị nối thêm vào chuỗi cũ không? | Sửa toàn chuỗi; xác nhận ảnh trở lại trước khi đổi thư mục hoặc dựng lại mesh. [Bài 34](../lessons/034-editor-linked-skins.md) |
| Nhập 474 nhưng số thành 474,5 | Đã chọn toàn bộ số hay chỉ phần nguyên? | Nhấp cuối ô số, xóa hết số cũ rồi nhập lại; Enter và đọc đủ phần thập phân. Với bố cục khác phải tìm lại ô. [Bài 72](../lessons/072-editor-nested-pivots.md) |
| Xoay xương mà ảnh/xương con đứng yên | Images/Bones compensation có đang bật không? | Tắt chế độ giữ ảnh/xương con trước phép thử chuyển động; xoay rồi trả góc ban đầu. [Bài 72](../lessons/072-editor-nested-pivots.md) |
| Đổi điểm xoay làm ảnh hoặc cổ chạy theo | Đang cần giữ ảnh, giữ xương con hay cả hai? | Chỉnh trong Setup: Images giữ attachment, Bones giữ xương con; đọc lại vị trí cổ sau khi chỉnh thân. [Bài 72](../lessons/072-editor-nested-pivots.md) |
| Đổi nhóm PSD nhưng cây Spine không đổi | Đang nhập mới hay sync qua Images? | Nhập mới đã tạo cây theo nhóm; sync với tên giữ nguyên đã giữ cây rig hiện có. Nếu cần sửa cha, thao tác cây xương trong editor và kiểm tra pose. [Bài 71](../lessons/071-editor-psd-nested-groups.md), [bài 73](../lessons/073-editor-psd-group-sync.md) |
| Hai key alpha bằng nhau nhưng giữa đoạn tối/mờ khác | Graph có tiếp tuyến làm đường cong võng không? | Trong bài thử, Flat đã sửa đoạn alpha 128 bị xuống 114; kiểm tra thêm frame giữa, không chỉ hai đầu. [Bài 70](../lessons/070-editor-separate-color-alpha.md) |
| Mesh móc ngược ở góc uốn lớn | Lỗi nằm ở weights hay hình tại một góc cụ thể? | So bản weights cũ/mới; nếu chỉ cần sửa cực trị, dùng deform tiết chế và giữ key hình thẳng. Kiểm tra cả đoạn giữa và nối vòng. [Bài 30](../lessons/030-editor-corrective-deform.md) |
| Bỏ lớp tay trong Preview nhưng tư thế vẫn giữ | Speed có bằng 0 trong lúc đang chuyển ra không? | Cho thời gian chạy để phần chuyển ra kết thúc, kiểm tra track còn lại và Alpha. [Bài 57](../lessons/057-editor-preview-transition.md) |
| Hình lệch sau sync PSD dù xương giữ nguyên | PNG có đổi sang kích thước toàn canvas do tắt Trim không? | Bật lại Trim trên cùng nguồn đã khôi phục hai ảnh gốc; kiểm tra PNG trước khi dời khớp. [Bài 74](../lessons/074-editor-psd-trim-dimensions.md) |
| Bàn tay hoặc anten bị cắt trong ảnh kiểm tra | Khung nhìn hay attachment thực sự bị mất? | Căn khung tại tư thế vươn xa, kiểm tra các cực trị còn lại. Đã sửa wave bằng Fit ở frame 10; không cần sửa key. [Bản mint hiện tại](../exercises/robot/editor-review/README.md) |

## Dùng lại mesh, khăn và ảnh giảm độ phân giải

Khi làm phụ kiện khác đường viền, trước hết kiểm tra liên kết mesh có đang kế thừa Deform của nguồn. Ở khăn đuôi chẻ, Deform nguồn tạo gợn tại cực trị; tách kế thừa và đặt kênh Deform riêng đã giảm gợn mà giữ hình nguồn ở pose đối chứng. [Bài 83](../lessons/083-editor-scarf-linked-mesh.md).

Với phụ kiện cần uốn riêng trên nhân vật, đặt xương neo ở vị trí gắn, rồi thêm xương điều khiển dọc phụ kiện. Kiểm tra draw order ở tư thế tay che khăn trước khi chỉnh mesh. Bind tự động cần đọc lại weights: trong bài khăn, hai đỉnh sát cổ từng theo nhầm xương giữa; sửa để chúng theo neo đã giữ chỗ gắn. [Bài 84](../lessons/084-editor-scarf-anchor.md), [bài 85](../lessons/085-editor-robot-scarf-mesh.md).

Để có chuyển động trễ, tạo key đoạn giữa trước rồi lùi nhịp đuôi. Bài 86 dùng độ trễ tám frame cho idle 60 frame; bài 87 dùng bốn frame cho walk 30 frame. Đây là thông số của bài mẫu, cần chọn lại theo chuyển động mới. Làm mềm cực trị bằng Graph rồi xem cả mốc vòng: key đầu/cuối bằng nhau vẫn có thể giảm tốc thừa nếu tiếp tuyến nằm ngang. Đã sửa Automatic riêng mốc đầu để bỏ đoạn giảm tốc này. [Idle](../lessons/086-editor-scarf-delayed-idle.md), [walk và chuyển tiếp](../lessons/087-editor-walk-scarf.md).

Khi giảm độ phân giải ảnh, phân biệt region và mesh. Sync PSD Scale 0,5 làm region cũ co; nhập region mới với tag scale đã tạo hệ số bù. Với mesh bốn đỉnh đã thử, khung và biến dạng giữ được qua đổi ảnh, gồm weights và key Deform. Khi khôi phục ảnh lớn, đã chọn Stretch trong Images Resized để đổi tọa độ texture theo ảnh mới. Không dời xương để chữa lỗi ảnh trước khi kiểm tra kiểu attachment và thiết lập resize. [Region](../lessons/081-editor-psd-scale-resolution.md), [mesh](../lessons/088-editor-mesh-image-resolution.md).

Đối chứng cùng frame trước/sau và giữ nguyên khung nhìn. Bài 88 có năm pose sau khôi phục trùng RGB với trước thử, cùng hai PNG khớp RGBA; điều này xác nhận phục hồi trong bài, không bảo đảm mọi mesh hoặc mọi tỷ lệ. Hình mềm đi do ít pixel hơn vẫn cần xem ở kích thước sử dụng thực tế.

## Nhân vật mềm: giữ mặt, giữ đáy và tạo nhịp

Thử ba vùng đáy, thân và đỉnh trước khi đặt key. Auto weights chỉ là điểm khởi đầu: xương đáy đứng yên vẫn không giữ được ảnh nếu đỉnh mesh ở đáy nhận body 100%. [Rig thạch](../lessons/093-editor-jelly-mesh.md).

Nếu mắt dẹt khi nén, đọc tỷ lệ xương quanh mặt. Trong bài thạch, cho tám đỉnh cùng body/crown 50–50 đã giữ chiều cao mắt ở hai pose. Đây là cấu hình đã thử cho ảnh này, không phải tỷ lệ bắt buộc cho mọi nhân vật. [Sửa mặt](../lessons/094-editor-jelly-face-weights.md).

Nếu đáy trôi, gán vùng sát tiếp đất cho base; nếu mép gập sau sửa, kiểm tra sự chuyển tiếp sang hàng phía trên. Bài thạch dùng base 100% sát đáy, rồi pha 60/40 ở hàng trong và 70/30, 40/60 ở mép. Đã sửa được hai cánh gập mà không thêm đỉnh. Thử nén và kéo giãn lại trước khi chỉnh animation. [Sửa đáy](../lessons/095-editor-jelly-base-weights.md).

Để bật nhẹ, dùng root nâng cả rig và body/crown tạo nén–giãn tương đối. Tách Y khi muốn chỉnh đường bay mà giữ X. Làm mềm cực trị thân bằng Automatic, cho phần đỉnh trễ khi lấy đà/duỗi bật; đọc giá trị giữa key để xác nhận đường bay chậm lại ở đỉnh. Cuối cùng xem lúc đáp và nối vòng. [Vòng bật 44 frame](../lessons/096-editor-jelly-bounce.md).

## Chọn bài mẫu để dùng lại

| Nhu cầu | Điểm bắt đầu |
| --- | --- |
| Đưa ảnh robot vào rig và đặt khớp | [Rig sau PSD](../lessons/045-editor-rig-after-psd.md) |
| Giữ chân khi hạ thân | [Idle và IK dựng tay](../lessons/019-handbuilt-idle-and-ik.md) |
| Uốn hình, sửa mép tại tư thế khó | [Corrective deform](../lessons/030-editor-corrective-deform.md) |
| Hai skin dùng chung lưới và chuyển động | [Linked mesh giữa skin](../lessons/034-editor-linked-skins.md) |
| Cập nhật nội dung ảnh, giữ rig | [Cập nhật pixel PSD](../lessons/066-editor-psd-pixel-update.md) |
| Đổi hình đầu, giữ chuyển động | [Skin đội mũ](../lessons/075-editor-helmet-skin.md) |
| Dừng bước với chân trụ | [Chân trái](../lessons/077-editor-stop-left-support.md), [chân phải và sửa nội suy](../lessons/078-editor-stop-right-support.md), [chọn mốc vào](../lessons/079-editor-stop-phase-entry.md) |
| Trang phục mesh, chuyển động trễ và đổi ảnh | [Khăn linked mesh](../lessons/083-editor-scarf-linked-mesh.md), [khăn trên robot](../lessons/085-editor-robot-scarf-mesh.md), [độ phân giải mesh](../lessons/088-editor-mesh-image-resolution.md) |
| Dây theo đường, khoảng cách và Path weights | [Spacing](../lessons/046-editor-path-spacing.md), [Path weights](../lessons/053-editor-path-weights.md) |
| Kiểm tra bộ động tác robot | [Trang sản phẩm và ảnh hiện tại](../exercises/robot/editor-review/README.md) |
| Nhảy tại chỗ, tay và chuyển động trễ | [Robot nhảy](../lessons/091-editor-jump-in-place.md) |
| Nhân vật mềm từ ảnh đến mesh và bật nhẹ | [Thạch: nguồn, rig và bài sửa](../exercises/soft-character/README.md) |

Điều chỉnh phạm vi hiện tại: người dùng đã yêu cầu bỏ qua lưu–mở lại–xuất. Các dòng cũ bên dưới về mốc có điều kiện giữ làm lịch sử; không dùng phần này để chặn kế hoạch. Robot nhảy bài 91 và thạch bài 92–96 đã khép ở mức cơ bản trong biên độ đã kiểm tra. Phần audio cần bằng chứng nghe đầu ra của editor; nhận file, sóng âm và nhãn event chưa đủ để xác nhận nghe hoặc đồng bộ cảm nhận.

## Kết thúc một lượt sửa

Đối chiếu trước/sau ở cùng frame và khung nhìn. Kiểm tra cực trị, frame giữa và hai đầu vòng; khi ảnh bị cắt hoặc có dấu chọn, sửa cách quan sát trước khi kết luận rig lỗi. Trả các giá trị thử về trạng thái định giữ, tắt compensation nếu đã dùng, ghi rõ animation/frame cuối.

Ảnh pose chứng minh hình tại thời điểm đã chụp. GIF ghép đúng thời gian hỗ trợ xem nhịp dự kiến. Cả hai không thay thế file project mở lại hoặc dữ liệu xuất từ editor. Lưu–mở lại–xuất còn là mốc có điều kiện vì bản hiện tại không có license; không cần người dùng ghi hình hay mua license để tiếp tục các bài Trial hỗ trợ.

## Phần học tiếp có mục tiêu rõ

Các bài cơ bản đã có mẫu cho rig robot cơ khí. Bài 83–88 đã bổ sung khăn khác đường viền, chuyển động trễ, chuyển tiếp hai chiều và giảm độ phân giải mesh có weights/Deform. Path Spacing và weights đã có ở bài 46–53. Không coi các mục này là chưa làm chỉ vì bảng lịch sử ghi thiếu.

[Bài 89](../lessons/089-editor-scarf-physics.md) đã đưa Physics lên hai xương của mesh khăn thật, đối chứng Mix và xem chỗ nối trong playback. Khi dùng lại, giữ neo cổ ngoài mô phỏng, kiểm tra weights trước, để Setup Mix 0 rồi key bật trong động tác cần dùng. [Bài 90](../lessons/090-editor-scarf-physics-stop.md) đã kiểm tra bốn mốc idle/walk và giảm Mix ở 6–12 để về góc nền. Giữ nguyên tư thế đang rung là yêu cầu khác chưa thử. Nghe đầu ra audio vẫn còn mở. Lưu–mở lại–xuất giữ là mốc có điều kiện do Trial.
