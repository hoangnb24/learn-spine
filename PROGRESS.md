# Tiến độ thực hành

08/09 — [97: kiểm tra âm thanh cùng người dùng](lessons/097-user-audio-check.md): người dùng xác nhận nghe tiếng bước chân trong walk-wide, khớp chạm đất, rõ và không rè/chồng tiếng. Đã dừng ở frame 0. Giải quyết phần audio còn thiếu bằng kiểm tra của người dùng.

08/09 — [96: thạch bật nhẹ](lessons/096-editor-jelly-bounce.md): thử nghiêng hai phía và phục hồi trùng; tạo 21 key, chỉnh đường bay và độ trễ thân/đỉnh. Xem tám pose, 90 ảnh playback hơn hai vòng, đầu/cuối Outline trùng RGB. Khép nhánh nhân vật mềm cơ bản 92–96.

08/09 — [95: weights đáy thạch](lessons/095-editor-jelly-base-weights.md): sửa 21 đỉnh, khắc phục mép gập bằng vùng chuyển tiếp. Nén/kéo giãn giữ mép giữa đáy ở y460 trên ảnh; phục hồi Outline trùng RGB. Chưa có animation, tiếp theo vòng bật nhẹ.

08/09 — [94: weights vùng mặt thạch](lessons/094-editor-jelly-face-weights.md): tám đỉnh dùng body/crown 50–50, mắt giữ cao 32 px ở nén và kéo giãn thay vì 19/42–43 px. Phục hồi trùng Outline; đáy còn thay đổi pixel khi crown dịch, cần kiểm tra trước vòng bật.

08/09 — [93: mesh thạch](lessons/093-editor-jelly-mesh.md): skeleton riêng, mesh 52 đỉnh và ba xương có Auto weights. Thử crown Y 300/240/340 rồi phục hồi, Outline trùng bản gốc. Phát hiện mắt dẹt khi nén; cần sửa weights vùng mặt trước animation.

08/09 — [92: nguồn nhân vật mềm](lessons/092-soft-character-source.md): tạo ảnh thạch và kiểm tra alpha; chọn bản đầu gần đục, loại bản sửa có nền caro thật. Chưa nhập hoặc dựng mesh. Tiếp theo thực hành biến dạng toàn thân theo nhánh nhân vật mềm trong PLAN.

Điều chỉnh theo yêu cầu người dùng: bỏ qua bài lưu/xuất, loại khỏi điều kiện cần hoàn thành hiện tại. Đã thực hành robot nhảy tại chỗ ở bài 91.

08/09 — [91: làm mềm tay](lessons/091-editor-jump-in-place.md#hoàn-thiện--làm-mềm-đổi-hướng-tay): bốn kênh dùng Automatic; đọc số quanh đỉnh xác nhận bước xoay nhỏ hơn và hai bên tương ứng. Xem 90 ảnh playback sau sửa; khép bài nhảy tại chỗ cơ bản, đã dừng ở frame 0.

08/09 — [91: thêm vung tay](lessons/091-editor-jump-in-place.md#bổ-sung--vung-tay-và-gập-khuỷu): bốn kênh Rotate, cẳng tay trễ hai frame; xem năm pose và 90 ảnh playback. Tư thế bay rõ hơn; sai khác nhỏ chân 0/40 giống hoàn toàn bản trước. Chưa làm mềm đỉnh vung Linear.

08/09 — [91: nhảy tại chỗ](lessons/091-editor-jump-in-place.md): tạo jump-in-place 0–40, chỉnh đường bay và nhún thân, thêm đầu/khăn lệch nhịp. Đọc hai chân tại bảy mốc: giữ chỗ dưới đất, cùng nâng 140 ở đỉnh. Xem 90 ảnh playback, chưa thấy bật hình lớn; tay còn thả, là phần có thể cải thiện tiếp.

08/09 — [rà trạng thái sau bài 90](docs/current-status.md): đối chiếu tiêu chí 0–6 và hiện vật, sửa các dòng trạng thái lỗi thời. Còn đầu ra audio chưa nghe/thu được và lưu–mở lại–xuất trên Trial; không coi thêm biến thể bài tập là cách khép hai khoảng trống này.

08/09 — [90: giảm Physics khi đang rung](lessons/090-editor-scarf-physics-stop.md): xác nhận Mix 0/góc key ở bốn mốc idle/walk cũ; tạo scarf-physics-stop giảm hai Mix 100→0 ở 6–12. Đọc 16 mẫu và xem 80 ảnh chậm, chưa thấy bật hình rõ. Đã trả Speed 100%; đây là về góc nền, chưa phải giữ tư thế đang mô phỏng.

08/09 — [89: Physics trên mesh khăn](lessons/089-editor-scarf-physics.md): hai constraint mid/tip, đối chứng Mix 0/100 và xem đủ 90 ảnh playback. Khăn phản ứng theo cú nhún rồi lắng, chưa thấy lỗi rõ ở vùng nhìn thấy. Setup hai Mix 0 đã đọc lại; còn kiểm tra idle/walk cũ và dừng ở pha tùy ý.

08/09 — cập nhật [tra cứu thực hành](docs/practical-guide.md): thêm quy trình khăn/weights/nhịp trễ/đổi ảnh từ bài 83–88; sửa mục Path còn ghi thiếu Spacing/weights dù bài 46–53 đã thực hành. Chọn phụ kiện Physics có ảnh hai tầng làm phần tiếp theo; chưa đánh dấu đạt.

08/09 — [88: mesh có weights và key Deform](lessons/088-editor-mesh-image-resolution.md#mesh-có-weights-và-key-deform): bind torso/head, tạo mesh-resolution với ba key Rotate và ba Deform. Năm pose giữ biến dạng sau giảm ảnh; sau khôi phục cả năm vùng Outline trùng RGB và hai PNG trùng RGBA. Tạm khép bài độ phân giải mesh trong phạm vi đã thử.

08/09 — [88: ảnh mesh đang biến dạng](lessons/088-editor-mesh-image-resolution.md#đối-chứng-mesh-đã-kéo-lệch-một-đỉnh): kéo góc dưới phải lên khoảng 32 px, giảm ảnh rồi phục hồi vẫn giữ hình lệch. Hai PNG và vùng nội thất thân khôi phục trùng; đã trả đỉnh về cũ. Đây là biến dạng Setup, chưa kiểm tra weights/key Deform khi đổi ảnh.

08/09 — [88: độ phân giải ảnh mesh](lessons/088-editor-mesh-image-resolution.md): body mesh bốn đỉnh giữ khung sau PSD Scale 0,5, head region co. Đã phục hồi Scale 1, chọn Stretch và đối chiếu hai PNG khớp RGBA gốc. Còn kiểm tra mesh đang biến dạng và lựa chọn resize ở lượt giảm.

08/09 — [87: chuyển đi → đứng nghỉ](lessons/087-editor-walk-scarf.md#chuyển-từ-đi-về-đứng-nghỉ): xem đủ 80 mẫu chậm, chưa thấy khăn bật về Setup hoặc rách rõ ở vùng nhìn thấy; thiếu 0,388 giây đầu. Khép bài khăn cơ bản, chưa phải trang phục mọi động tác. Tiếp theo kiểm tra giảm pixel ảnh mesh mà giữ kích thước/biến dạng.

08/09 — [87: khăn đi bộ và chuyển từ idle](lessons/087-editor-walk-scarf.md): tạo walk-scarf, 11 key và đường cong mềm, trễ bốn frame. Xem 90 mẫu vòng đi và 80 mẫu chuyển chậm idle → walk chưa thấy lỗi rõ ở cổ/khăn. Lượt thường bỏ lỡ thời gian Mix nên không dùng để kết luận hòa trộn. Còn chiều walk → idle.

08/09 — [86: kiểm tra cuối vòng khăn](lessons/086-editor-scarf-delayed-idle.md#kiểm-tra-cuối--bỏ-giảm-tốc-thừa-ở-mốc-vòng): sửa Automatic riêng mốc 0, bỏ giảm tốc thừa và giữ cực trị mềm. Xem 130 ảnh playback sau sửa không thấy rách/bật hình lớn. Khép khăn idle; tiếp theo tích hợp với walk và chuyển tiếp giữa động tác.

08/09 — [86: làm mềm nhịp khăn](lessons/086-editor-scarf-delayed-idle.md#bổ-sung--đối-chứng-nguồn-và-làm-mềm-cực-trị): sai khác chân 0/60 có sẵn ở nguồn; bản sao khớp nguồn cùng frame. Đổi mid/tip sang Bézier Automatic, góc mỗi bước sát đỉnh giảm còn khoảng 0,1°/0,152°. Còn tiếp tuyến đầu/cuối tip đang giảm tốc phụ; cần sửa trước playback mới.

08/09 — [86: khăn chuyển động trễ](lessons/086-editor-scarf-delayed-idle.md): bản sao idle-scarf có 11 key cho mid/tip, trễ tám frame. Đã xem chín tư thế và 130 ảnh playback; vùng khăn Outline 0/60 trùng, nửa dưới robot còn khác. Tiếp theo đối chứng idle nguồn trước khi sửa nối vòng.

08/09 — [85: mesh khăn trên robot](lessons/085-editor-robot-scarf-mesh.md): tám đỉnh, ba xương, sửa weights tự động làm đầu khăn theo sai xương. Đã đọc weights và thử riêng mid ±20°, tip ±25°, phục hồi góc Setup. Còn key trễ và kiểm tra toàn vòng. Bài 84 đã đưa khăn sau đầu/tay, trước thân.

08/09 — [84: neo khăn vào robot](lessons/084-editor-scarf-anchor.md): tạo xương con của body ở cổ, gắn region khăn, chỉnh tâm ảnh và tỷ lệ. Đã xem hai pose walk và hai pose idle; còn draw order, tay vẫy và mesh uốn riêng trên robot.

08/09 — [83: kiểm tra cuối khăn](lessons/083-editor-scarf-linked-mesh.md#kiểm-tra-cuối--nguồn-và-playback): hình nguồn ở frame 30 giữ nguyên trong vùng đối chiếu; xem 100 mẫu playback gần hai vòng không thấy rách hoặc nhảy hình lớn. Khép phần tái sử dụng mesh với deform riêng. Khăn vẫn chưa gắn vào robot, khớp còn gấp rõ.

08/09 — [83: deform riêng cho khăn](lessons/083-editor-scarf-linked-mesh.md#bổ-sung--năm-key-deform-riêng-cho-scarf): năm key trên kênh linked mesh riêng, giảm gợn ở cực trị; chín mẫu không thấy rách mới, ảnh 0/60 và 15/45 trùng. Còn đối chiếu skin nguồn và playback của bản sửa.

08/09 — bổ sung [83: xem riêng khăn và đối chứng deform](lessons/083-editor-scarf-linked-mesh.md#bổ-sung--xem-riêng-và-tách-ảnh-hưởng-deform). Tám mẫu giữa/cực trị giữ đuôi chẻ; frame 30 có gợn mép. Tắt kế thừa làm gợn giảm nhưng khớp vẫn gấp; đã bật lại, không sửa key nguồn. Tiếp theo cần deform riêng cho khăn.

08/09 — [83: khăn trên linked mesh](lessons/083-editor-scarf-linked-mesh.md): tạo ảnh alpha đuôi chẻ, skin scarf dùng liên kết orange/strip; đã xem bend-corrective 0/30/60. Chưa đổi topology hoặc gắn vào robot. Cần xem riêng ở kích thước lớn và kiểm tra giữa key.

08/09 — [rà sau bài 82](lessons/068-core-plan-audit.md#rà-hiện-trạng-sau-bài-82--08092026): sửa bảng còn ghi thiếu playback/PSD resolution/skin khác hình dù đã có bằng chứng. Chưa có project/export mới. Bài tiếp theo được chọn: trang phục mesh khác đường viền, dùng chung chuyển động; không lặp đổi màu hoặc thay region đầu.

08/09 — đối chứng Preview ở [bài 82](lessons/082-editor-live-playback.md#đối-chứng--cùng-walk-trong-preview): 120 ảnh, chu kỳ hình gần nhất khoảng 0,997 giây. Chưa tái hiện nhịp 1,06–1,09 giây của timeline; giữ key, tạm khép truy lỗi bộ đếm. Đã dừng/đóng Preview. Cần quay lại tiêu chí sản phẩm còn thiếu, không lặp thêm đo cùng vòng.

08/09 — đối chứng Loop 0–30 ở [bài 82](lessons/082-editor-live-playback.md#đối-chứng--phạm-vi-loop-030): ô giới hạn ban đầu trống; đặt rõ 0–30 vẫn cho khoảng 1,06–1,09 giây giữa mẫu đầu vòng. Đã khôi phục giới hạn trống và Speed 100. Chưa quy nguyên nhân cho key; tiếp theo so cơ chế phát Preview.

08/09 — bổ sung [82: playback idle/wave](lessons/082-editor-live-playback.md#bổ-sung--idle-và-wave-đang-chạy): 120 mẫu mỗi đoạn, hơn hai vòng; đã xem đủ 240 mẫu, chưa thấy bước nhảy hình lớn ở nối vòng. Giữ key, có GIF từ chuỗi trực tiếp. Còn nguyên nhân nhịp cuối vòng walk.

08/09 — [82: đo playback thật](lessons/082-editor-live-playback.md). Đã lấy 90 ảnh khi Play chạy và đối chứng không Loop: timeline khoảng 29,92 frame/giây. Chu kỳ walk quan sát khoảng 1,06 giây cần kiểm tra mốc cuối; chưa sửa key. Đã trả frame 0, Loop bật. Tiếp theo xem trực tiếp idle/wave và nhịp nối walk.

08/09 — đã kiểm tra [bản tag đứng riêng](lessons/081-editor-psd-scale-resolution.md#kiểm-tra-riêng-từng-skeleton), tắt các skeleton chồng hình và so bản gốc cùng khung nhìn. Không thấy khoảng hở lớn của lượt sync thiếu bù Scale. Đã trả về robot chính walk-wide frame 0; tạm khép bài PSD Scale.

08/09 — bổ sung [81: nhập mới có bù Scale](lessons/081-editor-psd-scale-resolution.md#bổ-sung--nhập-mới-tự-bù-scale). Nhập cùng nguồn tag vào tag-half-new: cả hai region tự có Scale 2/2, PNG khớp lượt sync 0,5 trước. Đã phân biệt nhập mới với đồng bộ rig có sẵn; PNG gốc vẫn nguyên. Chưa áp dụng cho mesh.

08/09 — bổ sung [81: tag Scale trên rig có sẵn](lessons/081-editor-psd-scale-resolution.md#bổ-sung--tag-scale-khi-đồng-bộ-attachment-có-sẵn). Tag 0,5 giảm PNG nhưng sync vẫn làm hình nhỏ; chưa xác nhận tự bù tỷ lệ. Đã khôi phục nguồn và hai PNG gốc. Tiếp theo cần đối chứng nhập attachment mới, không lặp sync cùng cấu hình.

08/09 — [81: PSD Scale và độ phân giải](lessons/081-editor-psd-scale-resolution.md). Thử 0,5 làm PNG và hình region nhỏ đi, hở cổ dù head vẫn 0/474. Trả Scale 1, sync và xác nhận hai PNG khớp RGBA gốc. Đã phân biệt lỗi tỷ lệ ảnh với điểm xoay; chưa thử bù tỷ lệ để giữ kích thước hiển thị.

08/09 — bổ sung [80: thử chuyển tiếp trong Preview](lessons/080-editor-idle-after-stop-right.md#bổ-sung--thử-chuyển-tiếp-trong-preview). Đã chạy stop phải → idle phải, Mix 0,25 ở Speed 5% và 100%. Mười ảnh lượt chậm và bốn ảnh lượt thường giữ vùng bàn chân; thân/tay chuyển tư thế. Chưa có bằng chứng phủ từng frame ở tốc độ thường. Giữ nguyên key, đã đóng Preview.

08/09 — [80: đứng nghỉ sau dừng chân phải](lessons/080-editor-idle-after-stop-right.md). Đã tạo idle-after-stop-right, sửa một key điểm đặt chân phải. Mười mẫu bàn chân giữ tọa độ; hai bàn chân cuối stop/đầu idle trùng pixel. Thân/tay còn khác, cần kiểm tra hòa trộn đúng cặp.

08/09 — [79: chọn mốc vào đoạn dừng](lessons/079-editor-stop-phase-entry.md). Walk0 → stop0 trùng toàn vùng Outline trong hai lần đối chiếu. Cùng frame 8/13 vẫn lệch chân phải 16/26 đơn vị; đã ghi quy tắc chờ đầu vòng và giới hạn phản hồi gần một giây. Chưa có bộ chờ tự động hoặc bằng chứng vận tốc nối êm.

08/09 — [78: đã sửa trượt giữa key](lessons/078-editor-stop-right-support.md#bổ-sung--đã-sửa-đường-cong-chân-trụ). Đổi X của chân trụ tại 18/23 sang Linear. Chân phải tại 26 trở lại 67,5/−391,5; tám mẫu bổ sung cũng giữ tọa độ. Tiếp theo: pha vào đoạn dừng và tư thế nghỉ tương ứng.

08/09 — bổ sung [78: ổn định thân và tay](lessons/078-editor-stop-right-support.md#bổ-sung--đưa-thân-và-tay-về-nghỉ-kiểm-tra-giữa-key). Đã bỏ phần vung tay/thân ở nửa sau đoạn dừng. Đo giữa key phát hiện chân phải tại 26 lệch 4,249 đơn vị và target cũng lệch tương ứng; cần sửa đường nội suy trước khi kết luận chân trụ ổn định.

08/09 — [78: dừng với chân phải trụ](lessons/078-editor-stop-right-support.md). Đã sửa năm key kênh chân, kiểm tra sáu mẫu chân phải cố định và chân trái đặt tại 13; bỏ event 28 không còn tương ứng bước chân. Pose đầu trùng walk0; bản gốc giữ tọa độ. Còn nhịp thân/tay và điểm vào theo pha.

08/09 — [77: đã thử hòa trộn stop → idle](lessons/077-editor-stop-left-support.md#bổ-sung--kiểm-tra-hòa-trộn-trong-preview) trong Preview, Mix 1/Speed 10. Vùng bàn chân trùng pixel ở 11 ảnh so với tư thế nguồn đã dừng; thân/tay thay đổi qua mẫu. Giữ key. Còn hướng chân trụ phải, chọn pha dừng và nhịp ở tốc độ thường.

08/09 — bổ sung [77: idle sau dừng](lessons/077-editor-stop-left-support.md#bổ-sung--idle-khớp-điểm-đặt-chân). Tạo idle-after-stop-left; phát hiện bàn chân không tới target ở dáng cao, hạ body và giảm biên độ thở. Mười mẫu chân đúng tọa độ; ảnh bàn chân cuối stop/đầu idle trùng pixel. Chưa kiểm chứng Mix toàn thân.

08/09 — [77: dừng bước với chân trái trụ](lessons/077-editor-stop-left-support.md). Đã tạo stop-left-support, kiểm tra chân trái giữ tọa độ ở sáu frame và chân phải nhấc 48 rồi đặt xuống. Bản walk-wide giữ tọa độ gốc. Còn idle khớp điểm cuối và dừng theo pha/chân còn lại.

08/09 — [76: dáng đứng rộng và chuyển từ đi](lessons/076-editor-idle-wide-transition.md). Đã thêm idle-wide, key hai target chân ±20, đọc lại frame 60 và xác nhận idle gốc giữ tọa độ. Preview về tư thế đứng rộng; còn cần đoạn dừng bước có chân trụ, chưa kết luận hết trượt.

08/09 — [75: skin đội mũ khác hình dáng](lessons/075-editor-helmet-skin.md). Đã duplicate mint, thay region đầu và chỉnh scale 0.22; kiểm tra wave 20/40, walk 7/22 và đổi lại mint tại walk 22. Không sửa key. Còn trang phục mesh và kiểm tra toàn bộ chuyển động.

Bài mới nhất: [74 — Trim và kích thước ảnh PSD](lessons/074-editor-psd-trim-dimensions.md). Tắt Trim làm hai PNG thành 642 × 802 và hình lệch; bật lại trên cùng nguồn đã khôi phục hình và RGBA gốc. Đã trả nguồn ban đầu. Còn đổi độ phân giải nội dung ảnh.

08/09 — đã gom [hướng dẫn tra cứu thực hành](docs/practical-guide.md): mười dấu hiệu lỗi, cách kiểm tra/sửa và liên kết bằng chứng. Đây là tài liệu dùng lại, không tính thêm bài kỹ thuật đã đạt. Phần còn mở được giữ riêng ở cuối hướng dẫn.
08/09 — đối chiếu sản phẩm: đã xem 17 pose mint hiện tại của idle/wave/walk, bổ sung bảng kích thước 300/150 px và sửa khung Outline cắt bàn tay. Giữ key vì chưa thấy lỗi pose mới rõ. [Bằng chứng và giới hạn](exercises/robot/editor-review/README.md#đối-chiếu-bản-mint-hiện-tại--08092026). Không tính lần rà này thành bài kỹ thuật mới.

08/09/2026: tiếp tục thực hành trên Trial. Không yêu cầu người dùng ghi hình để mở khóa kế hoạch; video không phải điều kiện bắt buộc. Nhận xét chất lượng hiện chỉ áp dụng cho bằng chứng đã có. Đã hoàn thành phép thử nhóm PSD lồng nhau ở bài 71.

Rà lại sau bài 70: Weights view đã có bằng chứng ở bài 50 (Direct, Pies, chọn đỉnh và đọc lại 18 trọng số); mục “còn Weights view” trước đây là tiến độ lỗi thời. Đã xem lại ảnh `reset-a100.png` và báo cáo giá trị, không cần tạo lại cùng phép thử.

Bài mới nhất: [73 — đồng bộ sau đổi nhóm PSD](lessons/073-editor-psd-group-sync.md). Đưa head ra ngang hàng với torso trong nguồn rồi sync: cây và thông số khớp trong Spine vẫn giữ nguyên. Đã trả nguồn gốc và kiểm tra hai PNG khớp RGBA.

Mốc trước: [72 — đặt lại khớp trên PSD lồng nhóm](lessons/072-editor-nested-pivots.md). Đã đặt torso 0/304 và head 0/474 bằng compensation, thử cổ hai chiều và thân, khôi phục tư thế. Còn thử sync sau thay đổi cấu trúc nhóm.

Mốc trước: [71 — nhóm PSD lồng nhau](lessons/071-editor-psd-nested-groups.md). Đã nhập skeleton riêng, kiểm tra cây root → torso → head, thử xoay cha/con rồi khôi phục. Hai PNG khớp RGBA gốc. Cần đặt lại điểm xoay tự sinh trước khi dùng cho animation.

Mốc trước: [70 — tách key RGB/alpha](lessons/070-editor-separate-color-alpha.md). Tạo `head-color-alpha` với ba key RGB và bốn key alpha. Phát hiện alpha 114 giữa hai key 128, sửa tiếp tuyến Flat; đọc lại 22/30/38 đều 128 trong khi RGB đổi. Đã trở về đúng animation mới ở frame 0.

Bài mới nhất: [69 — màu và alpha của slot](lessons/069-editor-slot-color.md). Đã thử đầu tối, mờ và mất ảnh trong Setup; khôi phục `FFFFFFFF`, kiểm tra lại trong Animate. Đã xử lý thao tác kéo nhầm do hai bố cục và nhập màu không đúng dự định. Còn key RGB/alpha riêng và Weights view.

Người dùng đã xác nhận Spine không có license nên không export được. Tiếp tục lấy Trial làm điều kiện thực hành; lưu–mở lại–xuất là mốc chưa thể kiểm chứng do phần mềm, không tính là thiếu kỹ năng và không yêu cầu mua license.

Rà soát mới nhất: [68 — tiêu chí bộ robot](lessons/068-core-plan-audit.md). Đã kiểm tra ba animation trong cửa sổ hiện tại, sửa README lỗi thời và gom bản xem theo đúng thời gian. Còn đánh giá nhịp liên tục; lưu–mở lại–xuất để ở mốc có điều kiện.

Kiểm tra bổ sung: QuickTime đang vô hiệu hóa `New Screen Recording`; chưa ghi được playback, chưa rõ nguyên nhân. Đã trở về `walk-wide` ở frame 0, không sửa key. Đây là giới hạn bằng chứng, không tính thêm một bài Spine hoàn tất.

Đã đánh giá lại phân bố thời gian và toàn bộ bảng pose idle/wave/walk tại [trang xem bộ động tác](exercises/robot/editor-review/README.md). Giữ key hiện có vì chưa thấy lỗi hình mới rõ ràng. Chưa kiểm chứng quy trình chính rig dựng tay từ editor đến runtime; không dùng bài tập khác để tự đánh dấu mốc này hoàn tất. Thông tin license đã rõ, không còn chờ người dùng trả lời.

Mốc trước: [67 — Physics hai tầng](lessons/067-editor-physics-chain.md). Tạo head-tip và head-chain, thử bốn tổ hợp Mix, đo năm cặp góc và chỗ nối. Đã khôi phục hai tầng và kiểm tra Mix 0 trên animation gốc. Còn đánh giá phụ kiện có ảnh/playback liên tục; bước tiếp theo rà tiêu chí sản phẩm robot.

Mốc trước: [66 — cập nhật pixel PSD](lessons/066-editor-psd-pixel-update.md). Đổi màu đầu, đồng bộ và xoay thử 90→75→90°. Chỉ head PNG thay đổi, khớp giữ thông số; đã khôi phục nguồn/màu, 15 PNG và ảnh toàn thân khớp gốc.

Mốc trước: [65 — đồng bộ PSD](lessons/065-editor-psd-sync.md). Dùng Images để đồng bộ bản PSD dịch lớp đầu 24 px; hình toàn thân trùng pixel, hai xương mẫu giữ thông số. Đã khôi phục nguồn gốc và kiểm tra 15 PNG khớp RGBA. Chưa thử đổi nội dung ảnh hoặc nhóm lồng nhau.

Mốc trước: [64 — vòng Physics](lessons/064-editor-physics-loop.md). Tạo head-loop 0/6/30/90; chép key đầu sang 30/90 khắc phục sai khác chân và cho ảnh đầu/cuối trùng pixel. Đã xem 12 mẫu mô phỏng liên tục qua bốn điểm nối. Bổ sung: đã xem 30 mẫu ở Speed 10% qua 85–90→0–8; đoạn nghỉ trùng pixel, chưa thấy bước nhảy hình rõ. Đã trả Speed 100%.

Mốc trước: [63 — Wind và Gravity](lessons/063-editor-physics-forces.md). Bản head-forces có góc nền 45°; ở frame 90 Wind 100 cho 22,798°, Gravity 109,1 cho −15,295°. Đã sửa lỗi nhập số, trả hai lực về 0 và kiểm tra head-settle gốc. Còn nối vòng Physics.

Mốc trước: [62 — skin constraint trong animation](lessons/062-editor-skin-constraint-animation.md). Badge bật giữ tip 30° tại hai key −35/+35; tắt trả lại key. Đã bỏ ghim trong khi playback chạy và kiểm tra lại hai key sau dừng. Phát hiện deform vẫn thay hình khi góc bị giữ; không sửa animation.

Mốc trước: [61 — constraint theo skin](lessons/061-editor-skin-constraint.md). Gán badge-tilt cho badge; bật/tắt ghim trên nền orange cho World Rotate tip 30°/0°, thử lại khớp. Đã trả badge về không ghim để giữ mesh thẳng. Còn đổi skin khi animation chạy.

Mốc trước: [60 — tự giữ tư thế khi đổi lớp](lessons/060-editor-automatic-hold.md). Spine 4.3 đã bỏ nút Hold Previous; cơ chế được xử lý tự động. Thử hai lớp 20° trên nền có key 0°, chuyển trong 5 giây: 12 mẫu giữ ảnh tư thế, bỏ lớp trở lại nền. Những mục cũ ghi còn bật/tắt Hold Previous được thay bởi bài này.

Mốc trước: [59 — cộng góc bằng Additive](lessons/059-editor-additive-offset.md). Tạo lớp một key 20°; trên nền 20°, Alpha 50/100 cho ảnh trùng key trực tiếp 30/40°. Cách thay thế giữ 20°. Năm đối chứng ảnh khớp; đã khôi phục key 20°. Tiếp theo Hold Previous.

Mốc trước: [58 — Additive](lessons/058-editor-preview-additive.md). So sánh lớp tay ở tư thế đầu trên nền idle đứng yên; Additive giữ ảnh nền, cách thay thế đổi tay. Chỉ bật nút không đổi lớp đang có; phát lại mới áp dụng. Bốn đối chứng pixel và lần thử lặp lại khớp. Còn độ lệch khác không và Hold Previous.

Mốc trước: [57 — chuyển idle/walk trong Preview](lessons/057-editor-preview-transition.md). Thử Mix 0/5/0,25 trên track 0; 12 mẫu chiều walk → idle cho thấy biên độ giảm dần. Sửa trạng thái lớp tay còn ảnh hưởng khi Speed 0. Chưa đánh giá đầy đủ chuyển ngắn ở mọi pha chân.

Mốc trước: [56 — mở khoảng cách chân](lessons/056-editor-walk-stance.md). Tạo walk-wide, dịch target ±20; giảm chân chồng giữa vòng. Đã xem 31 pose, đọc 62 mẫu chân: nhịp chân trụ/Y/góc giữ nguyên theo số UI, đầu/cuối trùng ảnh. Sửa lỗi Revaluing Scale bằng None và dựng lại từ bản gốc. Bổ sung: đã đọc lại hai event trái/phải ở 13/28, thông số audio giữ đúng; chạy thử 30 FPS/100%/Interpolated, có nhãn footstep. Chưa nghe trực tiếp hoặc ghi liên tục.

Mốc trước: [55 — tách tay khỏi gối](lessons/055-editor-walk-clearance.md). Tạo walk-clearance, chỉnh hai khuỷu, xem đủ 31 tư thế; đầu/cuối khớp. Hai pose bản gốc đối chiếu trùng bài 54. Chân chồng giữa vòng còn chưa sửa.

Mốc trước: [54 — đánh giá toàn thân](lessons/054-editor-full-body-audit.md). Đã xem 31 tư thế walk trong Outline; xác định vùng chân chồng ở 12–19 và tay sát gối quanh 8/23. Chưa sửa key; đã lưu mốc so sánh toàn vòng.

Cập nhật 07/09/2026. Toàn bộ kế hoạch vẫn đang thực hiện; chưa thành thạo Spine toàn diện.

**Bài mới nhất:** [Bài 53 — Path weights](lessons/053-editor-path-weights.md): tạo Path riêng, gán ba điểm giữa 100% cho route-lift; nâng khoảng 60,45 đơn vị và dây đi theo. Đã xem 31 mẫu, đầu/cuối khớp; Trial che một phần đỉnh dây. Bài rope-travel vẫn dùng route gốc. Tiếp theo trở lại chất lượng toàn thân robot.

**Key Spacing:** [Bài 52 — key Spacing](lessons/052-editor-rope-spacing-keys.md): animation riêng co/giãn dây, giữ Position 25%. Bốn mẫu short1 giữ X/Y, Scale X thay đổi 0,6378–1,3630. Đã xem 31 mẫu; ảnh đầu/cuối và một pose rope-travel cũ khớp. Tiếp theo Path weights.

**Dây sáu xương:** [Bài 51 — dây sáu xương](lessons/051-editor-rope-six-bones.md): tạo bản sao riêng, sáu xương dài 55 và Auto weights. Frame 15 bớt võng giữa, còn góc nhỏ; ba mẫu Position khớp chuỗi cũ. Đã xem 31 tư thế, vùng ảnh 0/60 trùng pixel. Tiếp theo key Spacing và Path weights.

**Trọng số từng cặp:** [Bài 50 — trọng số từng cặp đỉnh](lessons/050-editor-rope-manual-weights.md): chỉnh 18 đỉnh ở hai khớp, đọc lại 18 giá trị. Góc nối dịu hơn ở frame 15 nhưng giữa còn võng; đã xem 31 mẫu, ảnh 0/60 khớp. Tiếp theo so sánh biến thể nhiều xương ngắn.

**Thử lưới dày hơn:** [Bài 49 — thử tinh chỉnh dây](lessons/049-editor-rope-refinement.md): tăng 16→30 đỉnh, Auto ở tư thế thẳng, thử rồi hoàn tác Smooth. Đã xem 31 mẫu, vùng ảnh 0/60 trùng pixel. Kết quả chưa mềm hơn rõ; còn chỉnh weights tại hai khớp. Có bảng ảnh đối chiếu.

**Mesh dây:** [Bài 48 — Mesh dây trên Path](lessons/048-editor-path-rope.md): dựng mesh 16 đỉnh, bind ba xương, tạo rope-travel 0/30/60 và Bezier. Xem 31 tư thế, bật Loop/playback; vùng ảnh 0/60 trùng pixel. Có GIF lấy mẫu. Dải còn hơi gấp gần đỉnh; chưa hoàn thiện weights hoặc lưu/xuất.

**Chuỗi trên Path:** [Bài 47 — Chain và Chain Scale](lessons/047-editor-path-chain.md): đối chiếu ba chế độ xoay và đo chín mẫu World. Chain nối đoạn giữ chiều dài; Chain Scale bám điểm đường bằng giãn xương. Đổi Percent 25 sang Length 0 giảm Scale X về 0,995–1,009 tại mẫu. Có bảng ảnh và phép tính kiểm tra chỗ nối; còn mesh dây và toàn hành trình.

**Path Spacing:** [Bài 46 — Path Spacing](lessons/046-editor-path-spacing.md): tạo ba xương dài 100/150/80, kiểm tra Fixed/Length/Percent/Proportional trong Setup, lưu 12 mẫu World và 16 ảnh. Đã phân biệt khoảng cách cố định, theo chiều dài xương và theo chiều dài đường. Còn Chain/Chain Scale, weights và key Spacing.

**Rig sau PSD:** [Bài 45 — Rig sau nhập PSD](lessons/045-editor-rig-after-psd.md): đã đặt lại 15 điểm xoay/hướng/chiều dài và nối cây FK trong editor. Năm tư thế thử thân, khuỷu và gối cho các nhánh đi theo đúng; trả về Setup có ảnh Outline toàn robot trùng pixel trước sửa. Bản PSD chưa có IK/animation và chưa kiểm tra mọi biên độ khớp.

**Nhập PSD:** [Bài 44 — Import PSD](lessons/044-editor-import-psd.md): đã nhập PSD 15 bộ phận với tag bone/slot/skin/origin vào skeleton riêng. Editor có 16 xương, 15 slot và 15 ảnh hiện; kiểm tra cả 15 PNG đầu ra khớp pixel lớp PSD và Trim/Padding. Hai tâm xương mẫu khớp. Bài 65–66 đã đồng bộ lại để giữ rig và cập nhật màu đầu; bài 71 đã kiểm tra nhóm bone lồng nhau khi nhập mới.

**Physics trên nhân vật:** [Bài 43 — Physics trên đầu robot](lessons/043-editor-head-physics.md): tạo head-settle, thân hạ ở 0–6 rồi giữ đến 90; đặt Mix/Damping bằng key. Bảy mẫu so sánh Damping 0/15 cho thấy rung kéo dài giảm về gần 0 với mức 15. Đã thử Mix 0, khôi phục, phát mô phỏng và kiểm tra idle frame 0 cũ vẫn trùng ảnh. Bài 63–64 đã thử Wind/Gravity và nối vòng; bài 67 đã thử cơ chế hai tầng với bốn tổ hợp Mix.

**Đánh giá toàn thân mới nhất:** kiểm tra robot ở khung Outline lớn. Walk 0/30 trùng pixel; năm tư thế 0/8/15/23/30 chưa thấy khớp rời, nhưng tay–gối còn chồng hình và chân chụm ở giữa vòng. Idle 0/60 có sai khác rất nhỏ: gối trái lệch X 0,003 và góc khoảng 0,001°; hai bàn chân và target vẫn giữ cùng vị trí/góc theo số hiển thị. Đã bổ sung vào bài 19/39 cùng [bảng ảnh](exercises/robot/evidence/full-body-review/contact-sheet.jpg); giữ key idle vì sai khác đo được rất nhỏ; nguyên nhân tính toán chính xác chưa xác định.

**Path deform:** [Bài 42 — Path deform](lessons/042-editor-path-deform.md): tạo route-deform riêng với ba key hình đường 0/30/60 và Position giữ 50%. Năm mẫu Linear cho follower nâng 101 đơn vị ở đỉnh, root giữ nguyên; đã so sánh Bezier/Linear, sửa lỗi nhập Position 500%, kiểm tra ảnh nối vòng và phát thử. Một pose route-turn cũ vẫn khớp. Editor ở route-deform frame 0; còn weights/Spacing và chất lượng nhịp liên tục.

**Quay đầu trên Path:** [Bài 41 — quay đầu trên Path](lessons/041-editor-path-turnaround.md): dựng skeleton riêng và route-turn 0–72, dừng sáu frame ở mỗi đầu để quay. Chín mẫu World xác nhận chiều về lệch 180° tại cùng vị trí, các mốc quay giữ tọa độ; ảnh 0/72 trùng vùng đường/xương. Đã chạy playback, dừng frame 0. Chưa đánh giá đầy đủ vận tốc và hình thể khi quay. Bài Path cũ không còn trong project hiện tại; bài 41 đã dựng lại.

**Kiểm tra walk:** [Bài 40 — kiểm tra bản walk sau sao chép](lessons/040-editor-walk-transfer-audit.md): xác nhận event left/right ở 13/28 và thông số audio. Đã đo 62 mẫu bàn chân; sau bù root, X khớp bảng gốc với sai khác tối đa 0,0019 đơn vị. Pha trụ dịch lùi đều 2 đơn vị/frame trong bản tại chỗ, bàn chân giữ góc 0°. Chưa kiểm chứng frame lẻ hoặc nghe audio từ editor. Editor ở frame 0.

**Độ rõ bàn tay:** [Bài 39 — bàn tay bị đùi che](lessons/039-editor-walk-hand-clearance.md): thêm nhịp gập khuỷu phải 0/0/−35/0° ở 0/15/23/30. Bàn tay hiện rõ hơn; Graph có đầu nhịp phẳng, đã đọc bốn mẫu sát key và xem 31 tư thế. Đầu/cuối khớp, có clip so sánh; còn đánh giá cân đối toàn thân. Editor dừng ở frame 23.

**Pha tay:** [Bài 38 — pha tay trong vòng đi](lessons/038-editor-walk-arm-phase.md): đo góc hai vai, đảo hai key vai phải tại 8/23 trên `walk-in-place`. Đã xem 31 tư thế, đầu/cuối trùng pixel và có ảnh/clip trước–sau. Tay phải còn bị đùi che ở pha vào trong; chưa kết luận dáng đi hoàn thiện. Editor dừng ở frame 0 của bản chỉnh.

**Bản đi tại chỗ:** [Bài 37 — walk-in-place](lessons/037-editor-walk-in-place.md): sao chép key walk và giữ root X = 0. Đã xem đủ 31 tư thế, vùng nhân vật 0/30 trùng pixel; bản gốc vẫn có root X = 60 ở frame 30. Playback 30 FPS/100% đã chạy và có footstep; có clip ghép 5 vòng từ ảnh. Còn kiểm tra đường cong/thông số event sau sao chép và chất lượng toàn thân. Editor ở bản mới, frame 0.

**Skin bones:** [Bài 36 — skin bones](lessons/036-editor-skin-bones.md): thêm badge-control, chuyển slot phụ kiện và gán xương vào badge. Tắt skin giảm Bone transforms 4→3, Slots 2→1/2; đã xử lý cảnh báo phụ thuộc và kiểm tra khôi phục ở frame 0/30. Editor ở orange + badge, `bend-corrective`, frame 30.

**Phối skin:** [Bài 35 — phối skin và phụ kiện](lessons/035-editor-mixed-skins.md): badge riêng được ghim cùng orange/purple, kiểm tra bật/tắt ở frame 0/30 và vùng sai khác chỉ quanh phụ kiện. Đã tạo lỗi hai skin tranh cùng placeholder rồi sửa bằng thứ tự ghim; ảnh sau khôi phục trùng pixel. Editor ở orange + badge, `bend-corrective`, frame 0.

**Linked mesh qua skin:** [Bài 34 — linked mesh qua hai skin](lessons/034-editor-linked-skins.md): đưa nguồn vào orange, bản liên kết vào purple trong cùng placeholder, gán ảnh tím và đối chiếu frame 0/30. Đổi lại orange ở frame 30 cho vùng mesh trùng pixel. Còn trang phục khác hình dáng, phối nhiều skin và kiểm tra runtime. Editor ở orange, `bend-corrective`, frame 30.

**Nền linked mesh:** [Bài 33 — linked mesh](lessons/033-editor-linked-mesh.md): tạo `strip-linked`, kiểm tra bật/tắt Inherit timelines và đối chiếu nguồn/bản liên kết ở ±35°. Thử trọng số dùng chung 50→60→50 đã khôi phục và đọc lại cả hai mesh. Phần hai skin và ảnh biến thể được tiếp tục ở bài 34. Editor ở `bend-corrective`, frame 0, mesh nguồn hiện.

**Lớp tay riêng:** [Bài 32 — lớp vẫy chỉ điều khiển tay](lessons/032-editor-arm-only-layer.md): tạo `wave-arm-only` bằng Copy/Paste 18 key của vai/khuỷu/cổ tay. Đã phối trên walk và đối chiếu Alpha 0/100 tại hai tư thế: vùng đầu và bàn chân khớp nền, sai khác nằm ở tay. Tư thế riêng 0/60 trùng pixel. Còn đánh giá chuyển tiếp liên tục và chất lượng dáng đi; editor dừng ở bản mới, frame 22.

**Bài Preview nền:** [Bài 31 — phối track trong Preview](lessons/031-editor-preview-tracks.md): idle trên track 0, wave trên track 1; thử Alpha 0/50/100, phát và bỏ lớp wave. Hai phép so sánh ảnh xác nhận trả Alpha 100 và bỏ lớp về nền đúng tư thế. Đã hoàn tác lỗi nhập nhầm khi bố cục đổi; còn đánh giá chuyển tiếp liên tục và lớp chỉ key tay. Editor hiện ở Preview của robot, idle dừng, track 1 rỗng.

**Bài mesh đã hoàn thành gần đây:** [Bài 30 — sửa mesh bằng deform](lessons/030-editor-corrective-deform.md): bản `bend-corrective` giảm móc ngược ở mép trong bằng năm key deform, giữ weights và bản gốc. Đã xem 61 tư thế, kiểm tra hình thẳng 15/45, ảnh nối 0/60 và playback. Bài mesh có bản sửa dùng được trong ±35°; chưa thử biên độ khác hoặc xuất runtime. Editor hiện dừng ở bản sửa, frame 0.

**Animation kiểm tra mesh:** [Bài 29 — animation kiểm tra mesh](lessons/029-editor-mesh-bend-review.md): tạo `bend-review` 0/30/60 với góc −35/+35/−35, xem 31 tư thế, chạy playback 30 FPS/100%, ảnh cuối 0/60 trùng pixel. Thử mở rộng weights làm đường viền xấu hơn nên đã hoàn tác và đọc lại đủ sáu giá trị. Còn chỉnh hình sát khớp; editor hiện dừng ở animation này, frame 0.

**Kiểm tra tư thế và trọng số:** [Bài 28 — Ghosting và sửa trọng số mesh](lessons/028-editor-ghosting-and-mesh-diagnosis.md): tư thế walk 0/30 chồng khớp khi bù root −60; mesh mới 27 đỉnh đã sửa ảnh hưởng thừa tại ba đỉnh, có ảnh trước/sau 35° và thử −35°. Vùng sát khớp còn cần tinh chỉnh. Editor hiện ở Setup của `mesh-refine`, robot đang ẩn; chưa lưu/xuất project.

**Pha vung chân:** [Bài 27 — làm mềm pha vung trong editor](lessons/027-editor-walk-swing-curves.md) đã chỉnh Bezier X của cả hai chân. Quãng dịch trong frame sát lúc nhấc/đặt giảm từ 6 xuống khoảng 1,6–1,8 đơn vị. Đã đọc đủ 62 mẫu hai bàn chân: mọi đoạn trụ vẫn giữ vị trí và góc 0°. Đã xem 31 tư thế, có GIF xem chậm và chạy/dừng playback. Chưa đo vận tốc tức thời ở frame lẻ; nhịp toàn thân và nối vị trí qua vòng của bản dựng tay còn mở.

**Bản bước tiến đầu:** [Bài 26](lessons/026-editor-walk-travel.md) thêm root tiến 60 đơn vị và bù X của hai target IK; cố ý cho chân trụ trượt rồi sửa. Bản X Linear và bảng đo ban đầu giữ lại để đối chiếu với bài 27.

**Nền nhịp trong editor:** [Bài 25 — nhịp đi một giây trong editor](lessons/025-editor-walk-timing.md) đã nhân bản march thành `walk-handbuilt`, co toàn bộ key và event từ 0–60 về 0–30. Đã xem chín tư thế, xác nhận ảnh nhân vật 0/30 trùng pixel và playback 30 FPS/100%. Một số mốc bị làm tròn nửa frame; đây vẫn là bước tại chỗ, còn làm di chuyển tiến. Trạng thái cuối bài 25 là walk frame 0, skin mint; bài 26 tiếp tục chỉnh animation này.

**Tốc độ tiếp đất trong runtime:** [Bài 24 — tốc độ tại tiếp đất](lessons/024-runtime-contact-velocity.md) đã thay nội suy thẳng bằng Bezier trong `walk_side` tự tạo. Chênh lệch tốc độ tại ba mốc giảm khoảng 90%; kiểm tra chân trụ/nối vòng vẫn qua. Đây là tinh chỉnh nhỏ giữa các key, chưa chứng minh dáng đi tự nhiên hoặc hoàn thiện bài editor.

**Nối vị trí qua các vòng:** [Bài 23 — nối vòng đi trong runtime](lessons/023-runtime-walk-loop-placement.md) đã sửa bản xem để cộng 70 đơn vị qua mỗi vòng `walk_side`, thay vì root quay lại 0. Kiểm tra tư thế nối mọi xương và 968 mẫu chân trụ qua bốn vòng đã qua; trình duyệt đã chạy nhiều vòng, kiểm tra về đầu/tua/đổi animation. Đây là sửa cách phát dữ liệu tự tạo; dáng đi dựng tay và chất lượng chuyển động vẫn còn mở.

**Skin trên rig dựng tay:** [Bài 22](lessons/022-editor-handbuilt-skins.md) đã đưa 15 region vào placeholders, tạo orange/mint và gán ảnh mint. Đã đổi qua lại ở march frame 15/45: tư thế nhìn khớp, góc/tọa độ upper-arm-left không đổi giữa hai skin. Đã sửa thao tác phím tắt làm xoay nhầm ảnh thân trước nhân bản. Cửa sổ Spine vẫn dừng ở mint, march frame 45. Còn linked mesh, phối skin và trang phục khác hình dáng.

**Event và audio:** [Bài 21](lessons/021-editor-events-audio.md) đã thêm `footstep` tại frame 25/55 với String trái/phải, gắn WAV tự tạo và sửa lỗi đường dẫn thiếu file. Audio view hiện hai sóng âm; đã thử ẩn/bật lại và thấy nhãn event khi playback. Đã kiểm tra lại hai key sau Undo một thao tác xóa nhầm. Chưa xác nhận âm thanh bằng nghe trực tiếp.

**Bước tại chỗ:** [Bài 20](lessons/020-handbuilt-march.md) đã tinh chỉnh `march-handbuilt` thành 34 key chuyển động: thân chuyển trước khi nhấc chân, có nhịp đầu/hai tay. Graph thân đã sửa đoạn vượt giá trị bằng Flat. Đã xem lại 61 tư thế và đọc tọa độ/góc chân trụ ở mọi frame nguyên: chân phải 0–30, chân trái 31–60 đều giữ chỗ và góc 0°. Đã phát ở Timeline FPS 30, Speed 100%; còn đánh giá nhịp qua video liên tục và dáng đi tiến.

**Rig nền từ bài 19:** rig tự dựng đã có 18 xương, 15 region và IK hai chân. Bản vẫy tay mang tên `wave-handbuilt`; trước khi thêm IK đã xem đủ 61 tư thế và kiểm tra ảnh đầu/cuối trùng nhau ở [bài 17](lessons/017-editor-handbuilt-rig.md). [Bài 18](lessons/018-editor-metrics-and-ghosting.md) thực hành Metrics/Ghosting. [Bài 19](lessons/019-handbuilt-idle-and-ik.md) tạo `idle-handbuilt`, sửa lỗi chân kéo theo thân và bàn chân nghiêng; tọa độ/góc cả hai bàn chân giữ nguyên ở 5 frame lấy mẫu. Đã thêm 9 key cho nhịp đầu/hai tay và xem đủ 61 tư thế mỗi animation; không thấy khớp rời hoặc tay xuyên thân ở độ phân giải chụp. Có GIF xem chậm idle/wave sau IK trong bài 19. Wave khớp pixel đầu/cuối; idle còn sai khác pixel nhỏ ở chân dù tư thế nhìn khớp. Graph ba đường xoay mới đã xác nhận tiếp tuyến ngang; playback idle sau bổ sung đã chạy và dừng lại tại frame 0. Còn đánh giá nhịp bằng video ở tốc độ thường và dựng dáng đi. Bản Trial chưa lưu được project để mở lại.

**Phiên tiếp tục 07/09:** Kết nối Computer Use từng trả ảnh cũ đã mất; khởi tạo lại phiên JavaScript đã lấy được trạng thái mới. Spine hiện là 4.3.25 Trial và mở project trống. Đã nhập lại `robot-editor-4.3.json` (cảnh báo dữ liệu 4.3.23 khác patch), chọn mint, mở wave, kiểm tra frame 30 và phát/dừng thành công. [Tư thế frame 30](docs/evidence/robot-wave-before30.jpg), [playback](docs/evidence/robot-wave-reimport-play.jpg). Các bài chỉnh trực tiếp ở phiên trước còn ảnh và hướng dẫn nhưng không còn trong project hiện tại; chưa được lưu thành project. Cần dựng lại khi cần dùng, không coi lần nhập này là khôi phục những chỉnh sửa đó.

**Đã gỡ blocker điều khiển editor (06/09/2026):** Computer Use thao tác được bản sao `/Users/tubakhuym/Applications/SpineTrial-Control.app` qua ID `local.spine.trial`. Đã mở Spineboy Essential trong editor 4.3.23 Trial, chọn xương head, đổi góc xoay từ 23.184° sang 35° rồi trả lại 23.184°, chuyển Setup/Animate và phát/dừng walk. Timeline và tư thế thay đổi được xác nhận qua ảnh chụp. Đây là bài kiểm tra điều khiển ban đầu, chưa hoàn thành các bài học editor còn lại. Xem [cách mở và bằng chứng](docs/spine-editor-control.md).

| Phần kế hoạch | Trạng thái | Bằng chứng / việc còn thiếu |
| --- | --- | --- |
| 0. Điều khiển editor | Đã kiểm chứng cơ bản | Mở project mẫu, chọn/xoay xương, chuyển Setup/Animate, phát/dừng walk |
| 1. Rig mẫu | Đạt bài cơ bản trên robot | Đã thử cha/con, gắn sai rồi sửa, đổi draw order rồi sửa; phân tích Spineboy đã có |
| 2. Animation mẫu trong editor | Đã làm trên robot | editor-breathe 2 giây từ trống; key/Bezier/Dopesheet, thêm nhịp đầu và hai tay, kiểm tra Graph/pose nối/playback |
| 3. Robot từ ImageGen | Đạt bài cơ bản trong phạm vi robot | Có concept, 15 mảnh alpha, rig FK/IK và bản xem runtime; đã nhập editor 4.3; đã tự dựng rig đủ bộ phận, FK/IK và bộ idle/wave/walk trong editor; đã kiểm tra nhiều tư thế và hai kích thước hiển thị trong trang sản phẩm; không bảo đảm mọi góc nhìn |
| 4. Bộ động tác robot | Đạt bài cơ bản tại chỗ | Wave đã sửa hai vòng ở bài 15; bài 16 kiểm tra chân trụ và root dịch 70 mỗi vòng. Bài 23 đã xử lý nối vị trí trong runtime; bài 37–39 tách walk tại chỗ, sửa pha tay/khuỷu qua hai vòng; bài 40 kiểm tra event và 62 mẫu chân sau sao chép. Bài 82 đã xem chuỗi playback trực tiếp idle/wave và walk trong Preview; đạt bài nhịp cơ bản trong phạm vi robot cơ khí tại chỗ |
| 5. Mesh, weights, IK | Đạt bài cơ bản trong biên độ đã thử | Bài 28–30: mesh 27 đỉnh, sửa ảnh hưởng thừa, loại thử nghiệm weights xấu, corrective deform giảm móc ngược tại ±35°; đã xem 61 tư thế và nối vòng. IK robot đã kiểm tra ở bài 19. Còn tái sử dụng/biên độ rộng hơn |
| 6. Quy trình lưu/xuất | Bỏ qua theo yêu cầu người dùng | Chưa thực hành từ editor; không còn là điều kiện cần hoàn thành hiện tại |

Sản phẩm mới: [bài robot](exercises/robot/README.md), [video](exercises/robot/robot-study.mp4), [GIF vẫy tay](exercises/robot/wave.gif).

## Phạm vi mở rộng để học toàn diện

Đối chiếu [mục lục Spine User Guide](https://esotericsoftware.com/spine-user-guide) ngày 06/09/2026. Mỗi nhóm cần một bài nhỏ trong editor, một lỗi cố ý rồi sửa, và bằng chứng; bảng này không coi việc đọc tên chức năng là đã học xong.

| Nhóm | Bài kiểm chứng dự kiến | Hiện tại |
| --- | --- | --- |
| Giao diện, tools, setup/animate, phím tắt | Dựng lại và sửa một rig nhỏ | Đã dựng rig 16 xương trực tiếp và tạo animation ở bài 17; còn mở rộng thao tác |
| Xương, kế thừa transform, slots, draw order | So sánh dự đoán với chuyển động và thứ tự che khuất | Đã thực hành xoay thân, sai cha/con và sai draw order rồi sửa trong editor |
| Images, region, import PSD | Nhập tài nguyên đúng tỷ lệ và sửa ảnh thiếu | Đã gắn 15 region, chỉnh tỷ lệ/điểm đặt trong editor; đã sửa lỗi Image path gây MISSING ở bài 34; bài 44 đã nhập PSD nhiều lớp, kiểm tra tag bone/slot/skin/origin, Trim/Padding và 15 PNG đầu ra; bài 65 đã đồng bộ lại PSD qua Images và kiểm tra giữ rig; bài 66 đã thay nội dung ảnh và thử xoay khớp; bài 71 đã kiểm tra nhóm bone lồng nhau khi nhập mới; bài 73 đã đồng bộ sau đổi cấu trúc nhóm, giữ cây hiện có; bài 74 đã thử lề/Trim làm đổi kích thước PNG; bài 81 đã thử giảm độ phân giải region và bù Scale khi nhập mới; bài 88 đã thử mesh bốn đỉnh có weights/Deform ở năm pose và khôi phục ảnh gốc |
| Key, dopesheet, graph, timeline, playback | Chỉnh nhịp cùng một động tác bằng các công cụ | Đã đặt key, tách Y, đổi linear/Bezier và kéo thời điểm trong Dopesheet |
| Mesh, weights, deform | Uốn lá cờ; cố ý đặt trọng số sai rồi sửa | Đã tạo mesh, sửa bind/weights; bài 30 có bản corrective với năm key, 61 tư thế, kiểm tra nối vòng và playback trong ±35°; bài 83 đã tái sử dụng đường viền khăn và tách deform, bài 85–87 đã rig/weights và chuyển động khăn trên robot; biên độ ngoài các bài đã thử chưa được bảo đảm |
| Bounding box, clipping, path, point | Va chạm thử, che một phần nhân vật, đi theo đường, điểm gắn vật | Cả bốn loại đã tạo trong editor; Path Constraint đã có Position và playback; bài 41 dựng lại rig riêng, thêm facing quay đầu với chín mẫu World, bài 42 thêm Path deform và đối chiếu nội suy, bài 46 đã thử bốn chế độ Spacing, bài 53 đã gán weights cho Path và xem 31 pose; nhịp trực tiếp của dây còn giới hạn; Bounding Box có kiểm tra runtime độc lập |
| Skins, linked assets, đổi attachment | Hai bộ trang phục dùng chung animation | Editor đã dựng orange/mint với 15 placeholders, sửa Image path, kiểm tra đổi skin tại hai pose ở bài 22; bài 33–36 đã thực hành linked mesh giữa hai màu, phối phụ kiện, thứ tự ghim và xương riêng theo skin; bài 61–62 đã thử skin constraint; bài 75 đã thay region đầu khác hình dáng; bài 83–87 đã có khăn mesh khác đường viền, deform riêng, weights trên robot và chuyển tiếp idle/walk hai chiều; chưa phải bộ trang phục toàn thân |
| IK | Hạ hông và giữ chân, đổi hướng gập | Đã tự dựng IK hai chân, sửa hướng gập/góc bàn chân và đọc tọa độ ở 5 frame trong editor: bài 19 |
| Transform/path/physics constraints, sliders | Điều khiển nhiều phần, đi theo đường, anten rung có kiểm soát | Cả bốn loại đã thực hành cơ bản; Physics có xương con, Mix, Damping và playback; đã thử Reset key rồi hoàn tác ở bổ sung bài 13; bài 43 đã áp dụng lên đầu robot và so sánh bảy mẫu sau khi thân dừng với Damping 0/15; bài 63–64 đã thử lực ngoài và nối vòng; bài 67 có hai tầng/bốn tổ hợp Mix; bài 89 đã thử mesh khăn chịu hai constraint và playback; bài 90 đã giảm Mix về 0 tại frame 12, đọc từng frame và xem chậm |
| Events và audio | Đánh dấu bước chân và đồng bộ âm thanh | Runtime đã kiểm tra callback; editor có key/WAV và đối chiếu ở bài 21/40. Bài 97: người dùng trực tiếp xác nhận nghe rõ và khớp chạm đất trong walk-wide ở 100%, không rè/chồng tiếng |
| Ghosting, preview, animation mixing | So sánh tư thế, phối chạy và vẫy ở các track | Runtime đã kiểm tra hai track/mix rỗng; editor đã mở Preview và thử Ghosting trước/sau ở bài 18; bài 31 đã phối idle/wave trên hai track trong Preview, kiểm tra Alpha và bỏ lớp về nền; bài 32 tạo lớp tay riêng và phối trên walk tại hai tư thế; bài 57–60 đã thử chuyển tiếp, Additive và cơ chế giữ tự động của 4.3; còn đánh giá chuyển tiếp ngắn ở nhiều pha |
| Metrics, outline, skins/slot color/weights views | Phát hiện lỗi và kiểm tra chi phí rig | Outline đã xem 61 pose; Metrics đã kiểm tra ẩn/hiện region ở bài 18; Skins view đổi skin ở bài 22; Color view ở bài 69–70; Weights view ở bài 50 có Direct, Pies và 18 giá trị đọc lại. Đạt các bài cửa sổ cơ bản trong phạm vi này |
| Versioning, import/export, texture packing, CLI, settings | Mở lại project và kiểm tra vòng nhập/xuất đúng phiên bản | Phần lưu/xuất bỏ qua theo yêu cầu; giữ ghi chép cũ làm lịch sử |

Ưu tiên sau bài 89: đã thử Physics trên mesh khăn hai đoạn. Bài 90 đã kiểm tra bốn mốc idle/walk và giảm Mix giữa lúc rung; còn phân biệt với giữ tư thế mô phỏng, và nghe đầu ra audio. Không lặp playback cùng cấu hình. Lưu–xuất giữ có điều kiện, không yêu cầu license.

Cập nhật bài 2: thêm [bước ngang và mesh](lessons/002-contact-and-mesh.md). CLI đã xác nhận editor là 4.3.23 Trial. Robot có thêm bước ngang 1 giây và kiểm tra chân trụ; dáng đi tiến/chuyển trọng lượng còn cần thực hành thêm.

Cập nhật bài 3: thêm [skin, track và event](lessons/003-skins-and-tracks.md), gồm thử lỗi xóa track không trả về pose và sửa bằng mix sang animation rỗng.

Cập nhật bài 4: [thực hành editor](lessons/004-editor-import-and-keys.md). Đã nhập robot, sửa xung đột skin, quan sát squat/wave, đổi mint giữ pose, thêm key head ở frame 13 và Undo thành công. Chưa đánh dấu toàn bộ bài rig/animation đạt.

Cập nhật bài 5: [rig và nhịp trong editor](lessons/005-editor-rig-and-timing.md). Đã tạo xương thử, sửa quan hệ cha/con và che khuất, tạo editor-breathe 2 giây từ trống rồi chỉnh Bezier/Dopesheet. Phần chuyển động phụ và các bài nâng cao còn mở.

Cập nhật bài 6: [mesh, weights và deform trong editor](lessons/006-editor-mesh-weights-deform.md). Tạo mesh từ region, bind sai rồi sửa, thử phân bố weights và xác nhận deform sau đổi frame. Ghi rõ lỗi võng và giới hạn lưu của Trial.

Cập nhật bài 7: [clipping trong editor](lessons/007-editor-clipping.md). Đã tạo vùng cắt ảnh, đặt End slot và kiểm chứng clipping ngừng/hoạt động lại khi đổi sai/đúng thứ tự slot.

Cập nhật bài 8: [Point và Compensation](lessons/008-editor-point-and-compensation.md). Tạo Point ở đầu tip, tách slot để clipping cùng hoạt động, kiểm tra xoay 35° khi giữ/tắt giữ vị trí attachment rồi trả về 0°.

Cập nhật bài 9: [Bounding Box](lessons/009-editor-bounding-box.md). Dựng vùng tam giác theo tip trong editor; script runtime độc lập kiểm tra điểm/đoạn thẳng, sai số dùng hình bao và quên cập nhật bounds.

Cập nhật bài 10: [Path Constraint](lessons/010-editor-path-constraint.md). Tạo đường cong và follower từ editor, so sánh Position 0/50/100% cùng Rotate Mix 0/100 trong Setup.

Bổ sung bài 10: kiểm tra runtime độc lập 61 pose đi–về đã qua; chỉ ra chiều về chạy lùi dù pose vòng lặp khớp. Phần key Path trong editor tạm dừng vì Mac bị khóa khi tạo animation; cần mở khóa để tiếp tục.

07/09: Mac đã mở khóa. Đã tạo route-trip trong editor, key Position 0/100/0 ở frame 0/30/60, xác nhận frame 45 = 50% và playback. Phần quay đầu còn mở.

Bài 11: [Transform Constraint](lessons/011-editor-transform-constraint.md). Hai xương driver/driven dưới root, nối Rotate → Rotate trong giao diện 4.3, kiểm tra Mix 0/50/100 và Offset +30° rồi trả pose.

Bài 12: [Sliders](lessons/012-editor-sliders.md). Tạo từ deform-check, thử Frame/Mix trong Animate; ánh xạ Rotate 0–60° thành frame 0–15, kiểm chứng 30° → 7,5. Hoàn tác key thử do Auto Key và trả driver về 0°.

Bổ sung bài 12: tạo slider-cycle với key Rotate driver ở frame 0/30/60, phát vòng, đối chiếu timeline chính frame 15 → Slider frame 7,5. Thử Mix 0/100 tại đỉnh nhịp xác nhận deform đến từ Slider; đầu/cuối pose khớp.

Bài 13: [Physics](lessons/013-editor-physics.md). Tạo pendulum con của driver, constraint Rotation 100/FPS 60; thử Mix để phân biệt Physics với kế thừa góc cha; so sánh Damping 0/80 trong Setup và phát mô phỏng. Chưa đo độ tắt rung.

Bổ sung bài 13: đã thử Reset key tại frame 15, chạy lại từ 0 để xác nhận pose reset rồi Undo và kiểm tra độ trễ trở lại.

Bài 14 đang dở: [nhịp đầu/tay robot](lessons/014-robot-secondary-motion.md). Đầu có key ±2° và playback; tay trái có ba key trễ nhịp body. Mac khóa khi chỉnh tay phải, cần đọc lại trạng thái sau mở khóa trước khi tiếp tục. Chưa coi idle hoàn thiện.

Tiếp tục bài 14 sau mở khóa: tay phải đã key 10/12/10° tại 0/35/60. Graph xác nhận cả đầu và hai tay có tiếp tuyến ngang ở các đầu nhịp; đã đối chiếu pose frame 0/60 và phát toàn vòng. Nhịp đứng đạt bài cơ bản có chuyển động phụ; vẫy tay, dáng đi và lưu/xuất vẫn còn mở.

Bài 19: [idle và IK trên rig dựng tay](lessons/019-handbuilt-idle-and-ik.md). Đã tạo hai target dưới root, căn trục chân, xử lý nhánh phản chiếu, giữ bàn chân phẳng và kiểm tra tiếp xúc tại năm thời điểm. Đã bổ sung nhịp đầu/tay và kiểm tra 61 tư thế idle cùng 61 tư thế wave sau IK; còn đánh giá nhịp ở tốc độ thường và dáng đi.
