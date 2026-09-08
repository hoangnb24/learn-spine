# 84 — Gắn đuôi khăn vào thân robot

Đã tạo nhánh `root → body → scarf-anchor → scarf-tail` trên skeleton robot, dùng ảnh từ bài 83. Đây là region mới để kiểm tra chỗ gắn trước khi dựng mesh trên nhân vật; không chuyển linked mesh hoặc các key deform từ skeleton phụ.

## Dựng lại

1. Chép `exercises/mesh-lab/scarf-tail.png` vào `exercises/robot/images/parts/scarf-tail.png`, Refresh Images của robot.
2. Setup, chọn xương body rồi Create tại cổ; đổi tên xương con thành scarf-anchor. World đọc được X −0,3435, Y 68,155, Length 0.
3. Chọn scarf-tail trong Images của robot → P → scarf-anchor, chấp nhận tạo slot scarf-tail. [Cây attachment](../exercises/mesh-lab/scarf/scarf-attached.png).
4. Chỉnh region Scale X/Y 0,6, World X 76,4565, Y 68,155. Dịch tâm ảnh để đầu trái nằm gần điểm neo; không dịch xương để bù tâm ảnh. [Giá trị đã đọc lại](../exercises/mesh-lab/scarf/aligned-fit.png).
5. Xoay scarf-anchor −20° trong Setup để khăn hướng xuống bên phải. Ẩn mesh-refine, giữ robot hiện; [chỉ robot và nhánh mới](../exercises/mesh-lab/scarf/robot-only-anchor.png) là ảnh trước khi xoay.

Trong lúc nhập số, chọn một phần chuỗi làm Scale về gần 0 và khăn biến mất. Đã sửa bằng click ô, End, Backspace hết chuỗi, nhập lại rồi click ra ngoài; đọc lại cả hai Scale 0,6. Không dùng việc khăn biến mất làm bằng chứng ảnh thiếu. Giao diện đã chuyển sang cỡ lớn trong lúc thử phím, nên tọa độ thao tác cũ không còn dùng được.

## Kiểm tra bước đầu

Đã xem walk-wide tại [0](../exercises/mesh-lab/scarf/anchor-walk0.png) và [15](../exercises/mesh-lab/scarf/anchor-walk15.png); sau đó idle-handbuilt tại [0](../exercises/mesh-lab/scarf/anchor-idle0.png) và [30](../exercises/mesh-lab/scarf/anchor-idle30.png). Đuôi khăn hiện ở cổ khi thân đổi độ cao, không còn là ảnh từ skeleton phụ chồng lên ngực. Chưa đánh giá toàn vòng hoặc va chạm với tay vẫy.

Khăn hiện ở trước vai phải, chưa chỉnh draw order riêng. Chưa có vòng vải quấn cổ hay nút thắt; hình chỉ là đuôi khăn. Cần kiểm tra tư thế tay khó, quyết định lớp che khuất rồi dựng mesh/xương đuôi để có uốn trễ. Không coi region cứng này là trang phục hoàn tất.

Trạng thái cuối: Animate, idle-handbuilt frame 0 dừng, robot hiện, mesh-refine ẩn. Không sửa key của các animation robot trong lượt này. [Ảnh cuối](../exercises/mesh-lab/scarf/anchor-rest-final.png).


## Bổ sung — lớp che khuất và tay vẫy

Đã xem wave-handbuilt 15/30/45, khăn nằm phía đối diện tay vẫy nhưng đè lên vai gần. Chuyển slot scarf-tail từ đầu Draw order xuống giữa head và body bằng Minus 14 lần trong Setup. Kéo thả trước đó không đổi thứ tự. [Thứ tự đã đọc lại](../exercises/mesh-lab/scarf/scarf-order-behind-arms.png), [cùng wave30 sau sửa](../exercises/mesh-lab/scarf/scarf-order-wave30-clean.png). Vai che một phần đuôi khăn, phần sát cổ vẫn trước thân. Đây là chọn lớp của phụ kiện, không phải xử lý va chạm 3D.

Phím đổi thứ tự được đối chiếu với [Spine Slots](https://us.esotericsoftware.com/spine-slots). Phần mesh tiếp tục ở bài 85.
