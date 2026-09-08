# Kế hoạch tự học và thực hành Spine

Ngày lập: 06/09/2026. Người học và thực hiện: Codex.

Trạng thái hiện tại: [trạng thái hiện tại](docs/current-status.md). Các cập nhật theo bài bên dưới giữ lịch sử, không phải toàn bộ danh sách việc còn mở.

Kết thúc lượt kế hoạch hiện tại — 08/09/2026: bài 0–5, robot nhảy và nhánh nhân vật mềm đã có bằng chứng thực hành; bài 97 bổ sung xác nhận nghe âm thanh từ người dùng, giải quyết điểm còn vướng trong lượt rà sau bài 96. Lưu/xuất bỏ qua theo yêu cầu. Kết quả áp dụng cho các rig, động tác và biên độ đã kiểm chứng; không tuyên bố thành thạo mọi tình huống Spine.

## Điều chỉnh theo yêu cầu người dùng

Người dùng yêu cầu bỏ qua bài lưu/xuất. Mốc 6 về lưu–mở lại–xuất không còn là điều kiện cần hoàn thành trong kế hoạch hiện tại; giữ các ghi chép cũ làm lịch sử, không dùng giới hạn Trial để chặn những bài khác. Đã thực hành [bài 91: robot nhảy tại chỗ](lessons/091-editor-jump-in-place.md): lấy đà, bật lên, tiếp đất; đọc hai bàn chân và xem playback sau thêm đầu/khăn trễ. Đã bổ sung vung tay và gập khuỷu trễ hai frame, làm mềm bốn kênh tay bằng Automatic và kiểm tra số quanh đỉnh cùng playback. Khép bài nhảy tại chỗ cơ bản.

## Đích đến

Tự làm được một nhân vật từ ảnh đầu vào đến rig, animation và kiểm tra kết quả; biết tìm nguyên nhân khi chuyển động lỗi và sửa có chủ đích. Tiến độ tính bằng bài thực hành có bằng chứng, không tính bằng số trang tài liệu đã đọc.

Hiện trạng: đã dựng robot FK/IK trong editor, làm idle/wave/walk, sửa mesh bằng weights/deform và thực hành nhiều attachment/constraint. Các bài 37–40 đã tách walk tại chỗ, sửa tay/khuỷu và kiểm tra lại event cùng 62 mẫu bàn chân. Xem [bảng tiến độ](PROGRESS.md) để phân biệt phần đã kiểm chứng với chất lượng chuyển động và quy trình lưu/xuất còn thiếu.

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

Bài 0–5 đã có bằng chứng thực hành trong phạm vi robot và biên độ đã thử; xem bản rà hiện tại để biết giới hạn. Lưu/xuất từ editor vẫn chưa thực hành trên Trial. Có thể chuẩn bị ảnh và đọc tài liệu khi editor không truy cập được, nhưng không dùng chúng thay cho bằng chứng thực hành Spine.

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

ImageGen tạo tài nguyên hình ảnh; phần rig và animation của bài này phải được thực hành trong Spine. Tài nguyên robot đã được sinh, kiểm tra và tách thành 15 mảnh; nguồn và cách xử lý nằm trong exercises/robot/.

## Cách học mỗi bài

1. Đặt câu hỏi nhỏ và dự đoán kết quả, ví dụ: xoay thân thì bàn tay và bàn chân nào đi theo?
2. Đọc phần tài liệu chính thức đủ để làm bài.
3. Thay đổi một yếu tố, quan sát và lưu bằng chứng.
4. Cố tình tạo một lỗi có thể hoàn tác, xác định nguyên nhân rồi sửa.
5. Làm lại từ trạng thái ban đầu để kiểm tra có thực sự nắm thao tác.
6. Ghi kết luận: đã làm được, còn chưa chắc, cần thử gì tiếp.

Mỗi bài lưu trong `lessons/`; bài có nhiều tài nguyên dùng thư mục riêng trong `exercises/`. Ghi nguồn ảnh/mẫu và phiên bản. Script chỉ được coi là công cụ hỗ trợ; JSON hợp lệ không chứng minh animation đẹp.

## Giới hạn Trial và cách tổ chức

Người dùng đã xác nhận không có license. Kế hoạch thực hành dùng Trial; không chờ hoặc yêu cầu nâng cấp. Mốc lưu/mở lại/export giữ nguyên là phần có điều kiện, ghi “chưa thể thực hành do giới hạn phần mềm”, không đánh đồng với chưa nắm kỹ năng. Các bài rig, animation và sửa lỗi trong editor vẫn có thể tiếp tục khi có mục tiêu thực hành cụ thể.

Trial không lưu project, đóng gói texture hoặc xuất animation/hình/video theo [trang chính thức](https://esotericsoftware.com/spine-download). Vì vậy, các bài editor phải ngắn, có ảnh bằng chứng và hướng dẫn dựng lại; không trông cậy việc giữ app mở để bảo toàn bài tập.

Ảnh nguồn từ ImageGen và tài liệu/script trong workspace vẫn lưu được. Mốc lưu/xuất ở bài 6 cần bản Spine hỗ trợ; không tự mua hay nâng cấp. Có thể nghiên cứu runtime bằng dữ liệu mẫu đã xuất sẵn, nhưng điều đó chưa chứng minh đã xuất thành công animation tự làm.

## Việc làm ngay

08/09/2026: ghi hình là một cách bổ sung bằng chứng, không phải điều kiện để tiếp tục học và không phải việc bắt buộc người dùng phải làm. Không chờ video hoặc license để thực hành các phần Trial hỗ trợ. Bài 71 đã kiểm tra nhóm PSD lồng nhau; bài 72 đã đặt lại điểm xoay bằng Compensation và thử ba tư thế; bài 73 đã sync sau đổi nhóm và xác nhận giữ cây/khớp hiện có. Tạm khép chuỗi PSD, trở lại chất lượng bộ động tác robot; phần đánh giá playback còn chưa đầy đủ được ghi riêng, không tự đánh dấu đạt.

Rà lại sau bài 70: Weights view đã được thực hành ở bài 50, không còn là khoảng trống. Ưu tiên còn lại là bằng chứng playback liên tục; mốc lưu/export giữ có điều kiện theo bản Trial đã xác nhận.

Bài 70 đã tách key RGB/alpha trong animation riêng, sửa đoạn alpha võng giữa hai key bằng nhau và đọc lại ba mốc. Weights view đã được kiểm chứng ở bài 50; không mở thêm biến thể màu nếu chưa có lỗi mới.

Sau xác nhận dùng Trial, bài 69 đã kiểm chứng Color view và chẩn đoán đầu tối/mất do RGB/alpha, khôi phục giá trị gốc. Bài tiếp theo có thể tách key RGB và alpha trong animation riêng để kiểm tra hai thuộc tính độc lập; không dùng bài này thay cho mốc lưu/export có điều kiện.

Bài 41 đã dựng lại Path trong skeleton riêng, thêm hai khoảng dừng quay đầu và kiểm tra chín mốc cùng playback. Bài 42 đã thực hành Path deform với Position cố định và đối chiếu Linear/Bezier. Bài 46 đã thử bốn chế độ Spacing với ba xương trong Setup. Bài 47 đã so sánh Chain/Chain Scale trong Setup và đo chỗ nối. Bài 48 đã gắn mesh 16 đỉnh vào chuỗi và tạo vòng rope-travel, xem 31 tư thế. Bài 49 đã thử 30 đỉnh/Auto và Smooth, chưa cải thiện rõ; Bài 50 đã chỉnh và đọc lại weights 18 đỉnh tại hai khớp, còn võng giữa; Bài 51 đã tạo biến thể sáu xương ngắn và Auto weights, giảm võng giữa ở frame 15, xem 31 mẫu và đối chiếu nhịp với bản cũ. Bài 52 đã key Spacing trong animation riêng, đo bốn mẫu gốc/Scale xương đầu, kiểm tra 31 tư thế và một pose rope-travel cũ. Bài 53 đã dùng xương nâng Path có trọng số, tạo animation riêng và xem 31 mẫu. Còn tinh chỉnh độ mềm dây; trở lại chất lượng toàn thân robot thay vì tiếp tục mở rộng bài Path. Bài 43 đã áp dụng Physics lên đầu robot và so sánh độ rung sau khi thân dừng. Bài 44 đã nhập PSD nhiều lớp vào skeleton riêng và kiểm tra ảnh/tọa độ. Bài 45 đã chuyển bản nhập thành rig FK, đặt 15 khớp và thử thân/khuỷu/gối; bản này chưa có animation. Tiếp tục các chế độ constraint còn thiếu và hoàn thiện robot theo tiêu chí bài 3–5; không tiếp tục truy sai khác pixel idle rất nhỏ nếu không có ảnh hưởng chuyển động đo được. Không đánh dấu tiến bộ thao tác editor chỉ vì đã đọc thêm tài liệu hoặc chạy script runtime.

Sau mỗi bài, báo ngắn: sản phẩm để xem, điều đã học, lỗi đã sửa và bước tiếp theo. Chưa ấn định thời gian thành thạo; phải kiểm chứng đủ tiêu chí trước khi coi kế hoạch hoàn tất.

Bài 54 đã kiểm tra đủ 31 tư thế walk trong Outline. Tiếp theo thử chỉnh khoảng tách tay–gối trên bản sao animation, đánh giá toàn thân trước/sau; giữ bài đo chân trụ làm chuẩn khi có thay đổi chân.

Bài 55 đã tạo walk-clearance và chỉnh hai khuỷu, kiểm tra 31 tư thế cùng hai pose bản gốc. Khoảng tách tay–gối đã cải thiện; tiếp theo xử lý dáng chân chồng giữa vòng và đánh giá nhịp toàn thân, sau đó kiểm tra event bản sao.

Bài 56 đã tạo walk-wide, mở khoảng cách target ±20 và kiểm tra 62 mẫu chân cùng 31 pose. Đã sửa lỗi thay đổi đường cong do Revaluing Scale; bản cuối dùng None. Tiếp theo kiểm tra event trên walk-wide và nhịp playback toàn thân, rồi rà lại các tiêu chí còn thiếu của kế hoạch.

Bổ sung bài 56: event 13/28 và thiết lập audio đã đọc lại trên walk-wide; playback chạy 30 FPS/100%/Interpolated và có nhãn footstep. Chưa có bằng chứng nghe âm thanh hoặc ghi liên tục. Tạm khép kiểm tra tĩnh bản walk; bài tiếp theo thực hành chuyển tiếp idle → walk trong Preview, kiểm tra thời gian mix và trở về idle. Không lặp thêm vòng đo 62 mẫu nếu chưa sửa chân hoặc phát hiện lỗi mới.

Bài 57 đã thử chuyển idle/walk trong Preview, lấy 12 mẫu chiều về với Mix 5 giây để thấy cơ chế và trả Mix về 0,25. Tiếp theo thực hành Hold Previous/Additive trên lớp tay với đối chứng rõ; không coi ảnh hai trạng thái đích là bằng chứng độ êm của mọi chuyển tiếp.

Bài 58 đã thực hành Additive với lớp tay ở tư thế đầu, đối chiếu thay thế và thử lặp lại. Tiếp theo dùng lớp có độ lệch khác không để kiểm tra cộng biên độ, rồi Hold Previous với hai lớp cùng đặt key; giữ phạm vi thử rõ ràng.

Bài 59 đã kiểm chứng Additive với độ lệch khác không: nền 20° cộng lớp 20° ở Alpha 50/100 trùng ảnh key trực tiếp 30/40°. Đã trả key về 20°. Tiếp theo Hold Previous; tránh lặp thêm phép cộng góc đã có đối chứng đủ.

Bài 60 đã xác nhận Hold Previous bị bỏ từ 4.3.53-beta; thử cơ chế tự giữ tư thế trên track 1 bằng hai lớp 20° trên nền có key 0°. Cả 12 mẫu trong/sau chuyển 5 giây trùng ảnh trước; bỏ lớp trở lại nền. Các yêu cầu cũ về bật/tắt nút này được thay bởi kiểm tra hành vi phù hợp phiên bản. Tiếp theo trở lại nhóm skins: constraint chỉ hoạt động khi skin tương ứng được bật, còn thiếu trong bảng phạm vi.

Bài 61 đã gán Transform constraint cho skin badge và kiểm tra Setup bật/tắt: tip 30°/0°, thử lại đúng. Để badge không ghim khi kết thúc. Tiếp theo kiểm tra skin constraint trong animation: phân biệt key gốc và tác động constraint, rồi rà các phần Physics/PSD và lưu–xuất còn thiếu.

Bài 62 đã kiểm tra skin constraint trong bend-corrective: hai mốc và tắt skin khi playback chạy, sau đó khôi phục hai góc key gốc. Deform vẫn thay đổi theo frame dù tip bị giữ 30°. Tạm khép nhóm skin constraint; tiếp theo Physics Wind/Gravity và nối vòng, tránh lặp thêm phép bật/tắt cùng cấu hình.

Bài 63 đã thử riêng Wind/Gravity trên head-forces, đo frame 90 và trả hai lực về 0. Giá trị Gravity thực tế 109,1 được ghi đúng; không suy ra so sánh hai lực cùng độ lớn. Tiếp theo tạo chuyển động Physics có đầu/cuối thân trùng nhau, kiểm tra Deterministic và trạng thái mô phỏng qua điểm nối; không dùng head-settle một chiều làm vòng lặp.

Bài 64 đã tạo head-loop có đoạn nghỉ, chép nguyên key Translate đầu sang 30/90 và xác nhận ảnh đầu/cuối trùng pixel. Mô phỏng liên tục có 12 mẫu qua bốn điểm nối. Còn kiểm tra dày sát điểm nối; tránh suy ra độ êm liên tục chỉ từ ảnh cách nhau một giây. Sau đó tiếp tục PSD cập nhật lại và Physics nhiều tầng trong bảng phạm vi.

Bổ sung bài 64 đã xem 30 mẫu chậm sát điểm nối, đoạn nghỉ trùng pixel và chưa thấy bước nhảy rõ; trả Speed 100%. Bài 65 đã đồng bộ PSD qua Images, giữ rig với bản dịch lớp đầu, khôi phục nguồn và 15 ảnh gốc. Tiếp theo cập nhật nội dung ảnh/nhóm PSD lồng nhau hoặc Physics nhiều tầng; không tìm Ignore/Replace trong hộp Import PSD cũ của 4.3.

Bài 66 đã cập nhật màu đầu qua PSD sync, kiểm tra 15 ảnh và xoay khớp, khôi phục hoàn toàn. Tạm khép quy trình sửa màu PSD; tiếp theo Physics nhiều tầng rồi rà tiêu chí sản phẩm toàn thân/lưu–xuất, không tiếp tục lặp phép sync cùng loại.

Bài 67 đã thử Physics hai tầng trên head/head-tip trong bản head-chain: bốn tổ hợp Mix, năm cặp góc và kiểm tra chỗ nối. Đã khôi phục và đọc Mix 0 trên head-settle gốc. Tiếp theo rà tiêu chí bài 3–6 và chọn phần còn thiếu trực tiếp của sản phẩm; không mở thêm biến thể constraint trước khi rà.

Bài 68 đã rà từng mốc 0–6, kiểm tra ba animation hiện tại và sửa trang giới thiệu lỗi thời. Hai khoảng trống chính: đánh giá nhịp liên tục bộ cuối và project lưu/mở lại/export. Đã hỏi người dùng về bản có bản quyền; tiếp tục phần đánh giá được với Trial trong khi chờ thông tin, không coi ảnh/GIF là project export.


Bài 78–79 đã sửa thân/tay của đoạn dừng chân phải, loại cong X gây trượt giữa key và xác nhận điểm vào walk0 → stop0. Cùng frame 8/13 không khớp điểm đặt chân. Tiếp theo cần hoàn thiện điểm ra sang idle phù hợp và đánh giá nhịp bộ cuối; không mở thêm biến thể dừng cùng điểm vào. Quy tắc chờ đầu vòng mới được đối chiếu tư thế trong editor, chưa tự động chạy trong runtime.

Bài 80 đã thử stop phải → idle phải trong Preview ở Speed 5%/100%, các ảnh lấy mẫu giữ chân. Bài 81 thử PSD Scale 0,5, thấy hình region co và hở cổ, khôi phục Scale 1 cùng hai PNG gốc. Không lặp lại phép giảm Scale toàn nguồn; nếu tiếp tục phần này, cần kiểm chứng cách giảm pixel mà giữ kích thước hiển thị. Rà nhịp bộ cuối vẫn còn mở.

Bài 82 đã mở được cách kiểm tra trực tiếp: lấy ảnh liên tiếp khi Play chạy, đối chứng timeline gần 30 frame/giây. Tiếp theo áp dụng cho idle/wave và kiểm tra giữ mốc cuối walk; không lặp kiểm tra PSD đã khép.

Bổ sung bài 82: idle/wave có 120 mẫu playback mỗi đoạn; walk trong Preview có chu kỳ ảnh khoảng 0,997 giây. Giữ key và tạm khép truy lỗi bộ đếm timeline. Tiếp theo rà tiêu chí bàn giao/lưu–xuất còn thiếu; không mở thêm phép đo cùng chu kỳ chỉ để thu hẹp sai số.

Rà sau bài 82 đã cập nhật bảng phạm vi: nhịp cơ bản robot có bằng chứng trực tiếp, PSD region resolution và đầu skin khác hình đã thử. Bài Trial tiếp theo: trang phục mesh khác đường viền dùng chung chuyển động, kiểm tra linked/deform và tư thế khó; chưa làm và chưa đánh dấu đạt.


## Cập nhật sau bài 87 — 08/09/2026

Bài 83 đã tạo khăn khác đường viền bằng linked mesh và deform riêng. Bài 84–85 gắn khăn vào robot, chỉnh draw order và weights tám đỉnh trên ba xương. Bài 86–87 có chuyển động trễ ở idle/walk, sửa đường cong và xem playback cùng chuyển tiếp hai chiều. Vì vậy mục trang phục mesh khác đường viền đã có bài cơ bản; không còn là mục chưa làm. Phạm vi vẫn chỉ là khăn, với vùng đuôi bị vai che trong một số tư thế, không phải mọi trang phục hoặc mọi pha chuyển.

Bước thực hành tiếp theo: kiểm tra giảm độ phân giải ảnh mesh mà giữ kích thước/biến dạng. Bài 81 mới chứng minh region; cần đối chứng mesh tại cùng pose trước/sau và phục hồi nguồn. Không lặp bài khăn đã đủ bằng chứng nếu không thấy lỗi mới. Lưu/mở lại/export vẫn là mốc có điều kiện; không yêu cầu người dùng mua license và không thay bằng JSON tự tạo.


Cập nhật sau bài 88: đã giảm ảnh mesh bốn đỉnh có weights và key Deform, xem năm pose trước/sau; khôi phục bằng Stretch cho cùng hình ở các mốc đối chứng và PNG gốc. Phần tiếp theo là phụ kiện Physics có ảnh hai tầng, vì bài 67 chỉ có xương con chưa gắn ảnh. Hướng dẫn thao tác tổng hợp đã được cập nhật trong docs/practical-guide.md.

Cập nhật sau bài 89: mesh khăn đã chịu Physics trên mid/tip, đối chứng Mix bật/tắt và xem 90 mẫu playback; Setup Mix 0 đã xác nhận cho cả hai. Còn kiểm tra idle/walk cũ và dừng mô phỏng ở pha tùy ý. Đây là một mesh chịu hai xương, không phải hai attachment độc lập.

Cập nhật sau bài 90: bốn mốc idle/walk giữ Mix 0 và góc key cũ; bản scarf-physics-stop giảm hai Mix từ 100 về 0 trong frame 6–12, xem 16 mẫu và 80 ảnh chậm. Đã thực hành trở về góc nền có thời hạn; chưa phải giữ nguyên tư thế mô phỏng. Còn xác nhận audio nghe được trong editor.


Cập nhật bài 92: bắt đầu nhánh nhân vật mềm sau robot. Đã sinh và kiểm tra ảnh thạch; chưa thực hành rig. Phạm vi ba bước và tiêu chí nằm ở exercises/soft-character/README.md. Tiếp theo dựng mesh riêng, kiểm tra weights và một vòng bật; không tiếp tục tinh chỉnh bài nhảy robot khi chưa có lỗi mới.

Cập nhật bài 93: đã dựng jelly-soft, mesh 52 đỉnh, bind ba xương và thử nén/kéo giãn trong Animate. Phục hồi tư thế cho ảnh Outline trùng. Tiếp theo sửa weights vùng mặt bị dẹt ở crown Y 240 và kiểm tra vùng đáy, rồi làm vòng bật đã định; chưa mở thêm bài khác.

Cập nhật bài 94: sửa tám đỉnh quanh mặt về body/crown 50–50, cùng hai pose mắt giữ chiều cao 32 px. Tiếp theo đọc/sửa weights đáy (còn sai khác pixel khi crown dịch), rồi làm vòng bật. Không lặp lại kiểm tra mắt nếu chưa sửa thêm vùng này.

Cập nhật bài 95: đã sửa weights đáy và vùng chuyển tiếp sau khi thấy mép gập ở lần gán cứng đầu. Hai pose nén/kéo giãn giữ mép tiếp đất giữa thân, phục hồi Outline trùng. Tiếp theo thử nghiêng và làm vòng bật nhẹ, chưa mở thêm nhánh.

Cập nhật bài 96: khép nhánh nhân vật mềm cơ bản 92–96. Đã thử nghiêng hai phía, dựng vòng bật 44 frame, làm mềm thân/đỉnh và đường bay, xem tám pose cùng 90 mẫu playback hơn hai vòng. Outline 0/44 trùng. Không thêm biến thể thạch vào điều kiện hoàn thành; rà phần còn thiếu của mục tiêu chung trước bài tiếp theo.
