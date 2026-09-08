# Bài 81 — giảm độ phân giải ảnh bằng PSD Scale

Đã thử Scale 0,5 trên nguồn nested-robot.psd trong skeleton thử có sẵn, rồi khôi phục Scale 1. PNG nhỏ đi nhưng các hình region cũng co lại quanh vị trí hiện có, làm đầu rời thân. Không sửa xương để bù lỗi.

## Phép thử trong editor

Trong Setup, bật nested-robot và chọn đúng nhánh Images của skeleton này → PSD Settings. Giữ nguồn nested-robot.psd, Padding 1, Trim bật, Delete previously imported images tắt. Chỉ đổi Scale từ 1 sang 0,5, bấm OK rồi Sync; hộp ghi đè chỉ liệt kê head.png và body.png.

[Thiết lập 0,5](../exercises/robot/psd-import/nested/resolution/settings-half.png), [hình sau sync](../exercises/robot/psd-import/nested/resolution/half-imported.png). Robot có mũ phía dưới thuộc skeleton khác cũng đang hiện; đầu/thân rời phía trên là đối tượng thử.

| PNG | Scale 1 | Scale 0,5 | Sau khôi phục |
| --- | --- | --- | --- |
| head | 228 × 209 | 115 × 106 | 228 × 209, RGBA trùng gốc |
| body | 205 × 206 | 104 × 104 | 205 × 206, RGBA trùng gốc |

Kích thước tính cả padding nên không lấy nguyên kích thước PNG chia đôi để dự đoán chính xác. Đây là co giãn phần ảnh nhìn thấy, khác phép thêm lề trong suốt ở bài 74.

## Chẩn đoán và khôi phục

Khi ảnh nhỏ, chọn xương head: World 0/474, Rotation 90°, Scale 1/1, Length 100, cây root → torso → head. Sau trả PSD Scale về 1 và sync, các giá trị vẫn như vậy, hình đầu/thân nối lại. [Xương lúc ảnh nhỏ](../exercises/robot/psd-import/nested/resolution/half-head-bone.png), [sau khôi phục](../exercises/robot/psd-import/nested/resolution/restored-head-bone.png).

Đối chiếu toàn bộ RGBA của hai PNG sau khôi phục với bản sao trước thử: cả hai trùng hoàn toàn. [Báo cáo](../exercises/robot/psd-import/nested/resolution/checks.json). Không đổi PSD nguồn, transform hoặc key. Kết thúc trong Setup, head của nested-robot đang chọn.

Bài học: khi giảm độ phân giải qua thiết lập đồng bộ này, cần kiểm tra kích thước hiển thị của attachment; không mặc định rig sẽ tự bù tỷ lệ. Phép thử chỉ xác nhận Scale toàn PSD trên region có sẵn. Chưa kiểm tra cách giữ nguyên kích thước hiển thị bằng tag riêng hoặc trên mesh đã có weights.

Tài liệu chính thức mô tả Scale là co giãn lớp trước khi ghi file ảnh: [Import PSD](https://us.esotericsoftware.com/spine-import-psd). Kết luận về khoảng hở trên rig ở đây đến từ thao tác và ảnh editor, không suy ra chỉ từ tài liệu.

## Bổ sung — tag Scale khi đồng bộ attachment có sẵn

Tạo tag-half-robot.psd từ nguồn gốc, chỉ thêm `[scale:0.5]` vào tên hai lớp head/body. Không thay pixel hay nhóm. Tài liệu [Import PSD — tags](https://us.esotericsoftware.com/spine-import-psd#Group-and-layer-tags) mô tả tag này thu nhỏ ảnh và bù scale của attachment để giữ kích thước hiển thị. Cần kiểm tra riêng khi attachment đã tồn tại.

Đổi nguồn trong PSD Settings, giữ Scale toàn nguồn = 1 rồi Sync. PNG đầu thành 115 × 106, thân 104 × 104, nhưng hình vẫn nhỏ và hở cổ trong rig hiện có. [Thiết lập](../exercises/robot/psd-import/nested/resolution/tag-settings.png), [kết quả thực tế](../exercises/robot/psd-import/nested/resolution/tag-imported.png). Kết quả này chưa chứng minh tag giữ kích thước khi đồng bộ; cũng không bác bỏ hành vi khi nhập attachment mới.

Đã trả nguồn nested-robot.psd và Sync lại. Hai PNG khớp RGBA với bản trước thử, hình nối lại; không sửa transform/key. [Kiểm tra file](../exercises/robot/psd-import/nested/resolution/tag-checks.json), [trạng thái khôi phục](../exercises/robot/psd-import/nested/resolution/tag-restored.png). Kết thúc Setup, Images của nested-robot đang chọn.

Lúc đổi đường dẫn, phím chọn toàn bộ không có tác dụng và chuỗi mới bị chèn vào giữa đường dẫn cũ. Đã sửa bằng click ba lần trong ô, Backspace, kiểm tra ô trống rồi nhập đường dẫn đầy đủ; sync thành công sau đó. Không coi lỗi không tìm thấy file lúc đầu là lỗi tag PSD.

Phần còn cần làm: đối chứng nhập mới cùng nguồn tag để xác định khả năng tự bù scale, rồi xây cách áp dụng an toàn cho rig có sẵn. Không lặp thêm sync cùng cấu hình đã cho kết quả nhỏ hình.

## Bổ sung — nhập mới tự bù Scale

Đã nhập cùng tag-half-robot.psd vào skeleton mới `tag-half-new`, ghi PNG riêng vào tag-new-images. New project tắt, Scale toàn nguồn 1, Padding 1, Trim bật. [Thiết lập nhập](../exercises/robot/psd-import/nested/resolution/tag-new-settings.png).

Chọn trực tiếp hai region mới trong cây để đọc thông số: body và head đều có Scale X/Y = 2/2. Đây là giá trị Spine tự tạo; không chỉnh tay. PNG vẫn 104 × 104 và 115 × 106, toàn bộ pixel khớp với PNG của lượt sync tag trước. [Region body](../exercises/robot/psd-import/nested/resolution/tag-new-body-scale.png), [region head](../exercises/robot/psd-import/nested/resolution/tag-new-head-scale.png), [báo cáo](../exercises/robot/psd-import/nested/resolution/tag-new-checks.json).

Phép đối chứng xác nhận: nhập attachment mới có tạo hệ số bù 2 cho ảnh giảm 0,5; sync vào attachment cũ ở lượt trước không tạo ra kết quả hiển thị tương tự. Vì vậy nên định độ phân giải bằng tag trước khi dựng rig mới. Với rig đã tồn tại, cần kiểm tra và xử lý scale attachment riêng, không mặc định Sync sẽ sửa transform.

Các skeleton cũ cùng hiện trong viewport và khung nhìn tự Fit khi nhập, nên không dùng kích thước đo từ hai screenshot khác lượt để kết luận trùng hình tuyệt đối. Bằng chứng ở đây là Scale đọc trực tiếp trên region, PNG thực và trường hợp sync đối chứng. Chưa kiểm tra mesh hoặc sai khác biên do làm tròn pixel/padding.

Hai PNG của nested-robot vẫn khớp bản gốc sau nhập mới. Kết thúc Setup với region head của tag-half-new đang chọn; skeleton mới giữ làm mẫu cơ chế. Không sửa key hoặc rig robot chính.

## Kiểm tra riêng từng skeleton

Đã tắt hiển thị nested-robot và robot chính, chỉ giữ tag-half-new. Sau đó tắt tag-half-new, bật riêng nested-robot ở cùng khung nhìn, không Fit/zoom giữa hai ảnh. [Bản tag đứng riêng](../exercises/robot/psd-import/nested/resolution/tag-isolated.png), [bản gốc đứng riêng](../exercises/robot/psd-import/nested/resolution/original-isolated.png).

Hai hình có kích thước và vị trí tổng thể tương ứng ở khung này; bản tag không xuất hiện khoảng hở lớn như khi sync mà thiếu bù scale. Không kết luận trùng pixel: độ phân giải, cách lọc ảnh và xương hiển thị khác nhau. Phép kiểm tra loại khả năng hình gốc đang chồng lên che lỗi của bản mới.

Đã ẩn cả hai skeleton PSD, bật lại riêng robot chính trong Animate, walk-wide tại frame 0, Play dừng và Loop bật. [Khung làm việc cuối](../exercises/robot/psd-import/nested/resolution/return-main-walk.png). Không sửa key. Tạm khép bài PSD Scale; trở lại đánh giá nhịp bộ động tác.
