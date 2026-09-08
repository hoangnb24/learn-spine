# 83 — Khăn khác đường viền trên linked mesh

**Kết quả hiện tại:** khăn dùng chung mesh và weights, có năm key deform riêng; đã kiểm tra playback và đối chiếu nguồn. Đạt phần thử tái sử dụng mesh với texture khác đường viền. Chưa gắn khăn vào robot hoặc làm vải mềm. Các mục bên dưới ghi quá trình thử và trạng thái từng bước.

Đã tạo skin `scarf` từ `purple` trên skeleton `mesh-refine`. Linked mesh vẫn trỏ đến `orange → strip`, Inherit timelines bật; Image path đổi thành `scarf-tail`. Không tạo key hoặc sửa weights mới.

Ảnh khăn có đuôi chẻ và mép cong, khác dải chữ nhật cũ. Phần nhìn thấy thay đổi nhờ alpha của texture; topology của mesh vẫn là lưới cũ. Đây chưa phải thử chỉnh topology riêng hoặc gắn khăn vào rig robot.

## Tài nguyên

Tạo bằng **image_gen tích hợp**, không dùng CLI/API fallback. [Bản nguồn RGBA 2048 × 768](../exercises/mesh-lab/scarf/source.png), [bản dùng trong Spine 256 × 96](../exercises/mesh-lab/scarf-tail.png), [kiểm tra alpha và xử lý](../exercises/mesh-lab/scarf/asset.json). Thu đều 1/8 bằng Lanczos, giữ alpha. Pixel ngoài hình có alpha 0; không dùng màu nền của bản xem để đoán độ trong suốt.

Prompt: “Use case: stylized-concept. Asset type: single 2D game scarf-tail sprite for a Spine mesh deformation lesson. Create one flat horizontal cloth scarf tail, rectangle-like attached end on the LEFT, tapering slightly toward a clearly forked swallowtail notch on the RIGHT. Orange fabric with one thin cream stitched border and subtle broad painted fabric shading, clean dark outline. Exactly one isolated cloth piece, front view, laid straight and flat, no folds out of plane, no knot, no character, no text. Wide composition approximately 8:3, cloth occupying nearly the full canvas with small clear margins. Genuine transparent RGBA background, not a drawn checkerboard. This is a deformable garment test asset whose silhouette differs from a rectangular mesh strip.”

## Thao tác và mẫu đã xem

Setup: chọn purple → Duplicate → scarf, Rename attachments tắt. Chọn strip-linked của scarf, đổi Image path sang scarf-tail. [Liên kết nguồn](../exercises/mesh-lab/scarf/scarf-linked-properties.png), [ảnh mới](../exercises/mesh-lab/scarf/scarf-linked-image.png).

Animate: bend-corrective đã có sẵn. [Frame 0](../exercises/mesh-lab/scarf/scarf-animate.png) uốn xuống, [30](../exercises/mesh-lab/scarf/scarf-bend30.png) uốn lên, [60](../exercises/mesh-lab/scarf/scarf-bend60.png) trở lại hướng xuống. Đuôi chẻ còn hiện ở cả hai chiều. Không có thêm key scarf; deform dùng từ mesh nguồn.

Robot chính vẫn hiện phía sau vì hai skeleton đang bật cùng lúc. Khăn trông như đặt trên ngực nhưng đó chỉ là chồng vị trí trong khung nhìn, **chưa gắn vào robot**. Không dùng ảnh này để chứng minh khăn theo xương body hoặc tránh va chạm tay.

## Còn làm

Cần ẩn robot để xem riêng khăn ở kích thước lớn, kiểm tra mép/khớp giữa các key và đổi lại skin nguồn để đối chiếu. Nếu đường viền hoặc biến dạng cần đỉnh khác, phải thử mesh độc lập; không tự coi linked mesh giải quyết được mọi trang phục khác hình dáng. Chưa hoàn tất bài trang phục.

Trạng thái cuối: Animate, mesh-refine/bend-corrective frame 0, scarf bật, strip-linked được chọn. Robot chính vẫn hiện. Không sửa key gốc. [Ảnh cuối](../exercises/mesh-lab/scarf/scarf-bend0-final.png).

## Bổ sung — xem riêng và tách ảnh hưởng deform

Đã ẩn robot chính bằng chấm cạnh skeleton, Fit Outline để chỉ thấy khăn lớn. Đã xem các frame 7/15/23/30/38/45/53/60, ảnh `isolated-*.png` trong thư mục scarf. Đuôi chẻ vẫn rõ, không thấy lỗ rách trong các mẫu. Tuy nhiên ở frame 30, mép trên gần khớp có một gợn nhọn nhỏ; việc chỉ thay ảnh không tự làm biến dạng phù hợp hoàn toàn.

Đổi sang orange tại cùng frame 30 rồi về scarf: [nguồn](../exercises/mesh-lab/scarf/orange-30.png), [khăn](../exercises/mesh-lab/scarf/scarf-restored-30.png). Lưới nguồn có đường viền rộng khác khăn, nên corrective deform thiết kế cho dải cũ không mặc nhiên tốt cho texture mới.

Đối chứng: trong Setup tắt Inherit timelines của riêng linked mesh scarf, trở lại Animate vẫn frame 30. [Không kế thừa](../exercises/mesh-lab/scarf/no-inherit-30.png) vẫn uốn theo xương nhưng gợn nhỏ trên mép giảm, đường gấp tổng thể ở khớp vẫn còn. Kênh Deform: strip không còn hiện cho attachment này. Điều này xác nhận phần biến dạng kế thừa có ảnh hưởng tới mép; không chứng minh tắt nó là cách sửa tốt cho cả vòng.

Đã bật lại Inherit timelines và về frame 0; kênh Deform: strip hiện lại. [Trạng thái cuối](../exercises/mesh-lab/scarf/isolated-final-0.png). Robot chính tiếp tục ẩn để bài mesh đứng riêng. Không sửa key hoặc weights nguồn.

Bước tiếp theo: tạo phiên bản có deform riêng cho scarf, sửa gợn ở cực trị và đối chiếu hai chiều cùng mẫu giữa key. Mục tiêu là học giới hạn tái sử dụng chỉnh hình từ trang phục cũ; không cần thêm một lượt đổi màu hoặc thay ảnh tương tự.

## Bổ sung — năm key deform riêng cho scarf

Đã tắt Inherit timelines trên linked mesh của skin scarf và tạo kênh `Deform: strip/strip-linked` trong bend-corrective. Mesh vẫn liên kết tới orange/strip; không thay topology, weights hoặc key xương.

Đặt key hình trung tính ở 15/45. Ở 30, chọn đỉnh giữa mép trên của lưới, dịch ngang một bước sang phải. Thử thêm bước lên làm tái xuất hiện gợn nên đã bỏ bước lên. Ở 0/60, dịch đỉnh giữa mép dưới một bước sang phải. Thao tác kéo nhỏ ban đầu không cho thay đổi rõ; dùng phím mũi tên và đọc lại hình. Không khẳng định số đơn vị từ tọa độ màn hình. Thử copy/paste không tạo được key 60, nên đã lặp đúng thao tác dịch tại frame 60 và đối chiếu kết quả bằng ảnh.

Dopesheet hiện đủ năm key 0/15/30/45/60 trên kênh riêng. [Frame 30 đã lưu](../exercises/mesh-lab/scarf/own-final30.png), [kênh riêng và frame 0](../exercises/mesh-lab/scarf/own-final-rest.png). Mép trên gần khớp không còn gợn nhô nhỏ của bản kế thừa; vẫn có góc gấp tổng thể của rig hai xương. Chưa coi đây là mô phỏng vải mềm tự nhiên.

Đã xem chín mẫu 0/7/15/23/30/38/45/53/60 sau sửa: đuôi chẻ nguyên, không thấy khe rách mới trong mẫu. [Frame giữa 23](../exercises/mesh-lab/scarf/own-final23.png), [38](../exercises/mesh-lab/scarf/own-final38.png). Vùng Outline `(664,95)–(1037,379)` của frame 0/60 trùng pixel, 15/45 cũng trùng. [Kết quả kiểm tra](../exercises/mesh-lab/scarf/own-deform-checks.json). Đây là kiểm tra tư thế, chưa kiểm tra playback của bản có deform riêng.

Để chỉnh đỉnh, đã mở rộng viewport bằng đóng nhóm Timeline/Graph, bật lại hiển thị Images và dùng nút Fit dưới thanh zoom. Outline dùng xem kết quả; đỉnh được chỉnh ở viewport chính. Không dùng việc đổi khung nhìn để che lỗi.

Trạng thái giữ lại: scarf có deform riêng, Inherit timelines tắt, frame 0 dừng; robot vẫn ẩn. Tiếp theo kiểm tra skin nguồn sau thay đổi và playback bản này, rồi quyết định mức đạt của bài dùng chung mesh. Việc gắn khăn vào robot vẫn chưa làm.


## Kiểm tra cuối — nguồn và playback

Đổi sang orange ở frame 30 sau khi tạo deform riêng cho scarf: [ảnh mới](../exercises/mesh-lab/scarf/source-final-30.png). Vùng so sánh ban đầu khác đúng một vùng nhỏ ở sát mép phải, ngoài hình dải. Khi bỏ mép đó, vùng `(664,95)–(1030,379)` trùng pixel với ảnh orange-30 trước sửa. [Số liệu](../exercises/mesh-lab/scarf/source-review.json). Đây là đối chứng hình tại frame 30, không phải kiểm tra toàn bộ dữ liệu nguồn.

Chuyển lại scarf, Play ở 30 FPS, Speed 100%, Loop bật. Lấy 100 ảnh liên tiếp trong khoảng 3,987 giây, gần hai vòng chuyển động. Đã xem đủ [mẫu 0–49](../exercises/mesh-lab/scarf/live-contact-0.jpg) và [50–99](../exercises/mesh-lab/scarf/live-contact-1.jpg): đuôi chẻ giữ nguyên, không thấy rách hoặc bước nhảy hình lớn khi nối vòng trong các mẫu. Góc gấp ở khớp vẫn thấy khi uốn lên; bài này chưa đạt chất lượng vải mềm. [Thời điểm lấy mẫu](../exercises/mesh-lab/scarf/live-times.json); số trên ảnh tổng hợp là số mẫu, không phải frame Spine.

Đã dừng và trả về [frame 0](../exercises/mesh-lab/scarf/after-live-rest.png), scarf bật và Inherit timelines tắt. Không chỉnh thêm key trong lượt kiểm tra cuối.

Kết luận: đã thực hành thay đường viền bằng alpha trên linked mesh, nhận ra deform nguồn không phù hợp hoàn toàn, và tách deform riêng mà vẫn giữ liên kết mesh/weights. Phần tiếp theo cần xử lý quan hệ khăn với rig nhân vật; không tính bài này là đã gắn trang phục hoặc xuất được dự án.
