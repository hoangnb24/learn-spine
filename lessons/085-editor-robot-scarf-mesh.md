# 85 — Mesh khăn trên robot và sửa weights đầu neo

Đã chuyển region scarf-tail của robot thành mesh, dựng thêm scarf-mid và scarf-tip dưới scarf-anchor. Đầu khăn vẫn gắn vào body; hai xương mới điều khiển phần giữa và đuôi. Chưa đặt key chuyển động trễ.

## Lưới và xương

Edit Mesh, giữ bốn góc ngoài ảnh rồi thêm hai cặp đỉnh tại khoảng 1/3 và 2/3 chiều dài. Tổng tám đỉnh, bốn cột; các tam giác tự chia. [Lưới tám đỉnh](../exercises/mesh-lab/scarf/mesh-edge-four.png). Đường viền đuôi chẻ vẫn do alpha; không mô tả lưới này là bám sát mép khăn.

Ở Setup, Create scarf-mid tại giữa chiều dài phần đầu, kéo dọc khăn tới cột tiếp theo. Đọc World X 47,33, Y 51,014, góc 339,978°, Length 51,14717. Tạo con scarf-tip tại World X 95,386, Y 33,502, góc 340,056°, Length 51,33853. [Nhánh xương](../exercises/mesh-lab/scarf/scarf-weights-open.png). Số góc World gần nhau; scarf-tip có góc tương đối nhỏ so với cha.

## Sửa weights

Bind chọn đúng scarf-anchor, scarf-mid, scarf-tip. Kết quả tự động ban đầu gán cả cột sát cổ cho scarf-mid 100%; xương neo có Length 0 nên cần đọc weights, không mặc nhiên tin Bind đã giữ cổ. [Lỗi trước sửa](../exercises/mesh-lab/scarf/anchor-weights-selected.png).

Đã đặt và đọc lại cả hai đỉnh của mỗi cột:

| Cột từ trái sang phải | scarf-anchor | scarf-mid | scarf-tip |
| --- | --- | --- | --- |
| 1, sát cổ | 100% | 0% | 0% |
| 2 | 50% | 50% | 0% |
| 3 | 0% | 50% | 50% |
| 4, cuối đuôi | 0% | 0% | 100% |

[Đầu neo 100%](../exercises/mesh-lab/scarf/anchor-weight100.png), [cột 2 trên](../exercises/mesh-lab/scarf/column2-top50.png) và [dưới](../exercises/mesh-lab/scarf/column2-bottom50.png), [cột 3 trên](../exercises/mesh-lab/scarf/column3-top50.png) và [dưới](../exercises/mesh-lab/scarf/column3-bottom50.png), [cột 4 trên](../exercises/mesh-lab/scarf/column4-top100.png) và [dưới](../exercises/mesh-lab/scarf/column4-bottom100.png).

Trong lượt thao tác, kích thước giao diện thay đổi nên tọa độ cũ không còn trỏ đúng ô Weight; Backspace mở hộp xóa attachment. Đã chọn No, mesh vẫn còn. Sau đó chọn từng đỉnh theo ảnh mới, nhập Weight bằng End → Backspace hết chuỗi → số → click ra ngoài và đọc kết quả. Không có attachment bị xóa.

## Thử uốn rồi phục hồi

Trong Setup, thử riêng scarf-mid tăng/giảm 20°: [hướng lên](../exercises/mesh-lab/scarf/mid-test-plus20.png), [hướng xuống](../exercises/mesh-lab/scarf/mid-test-minus20.png). Phần gốc gần cổ giữ vị trí trong ảnh; phần sau uốn theo. Hướng xuống bị vai che khá nhiều, vì vậy ảnh này không chứng minh toàn bộ mép phía sau vai không bị gấp.

Trả scarf-mid về 339,978°, thử riêng scarf-tip tăng/giảm 25°: [lên](../exercises/mesh-lab/scarf/tip-test-plus25.png), [xuống](../exercises/mesh-lab/scarf/tip-test-minus25.png). Đuôi đổi hướng, đoạn đầu không đổi rõ trong các mẫu. Chưa kiểm tra tổ hợp hai xương cùng uốn hoặc nội suy.

Đã trả mid về 339,978° và tip về 340,056°; [ảnh cuối](../exercises/mesh-lab/scarf/tip-test-restored.png). Vẫn ở Setup, chỉ robot hiện; mesh-refine ẩn, Weights view mở. Không sửa key animation robot trong bài này.

Tiếp theo tạo bản sao idle để thêm chuyển động khăn có độ trễ giữa mid/tip, kiểm tra nối vòng và phần khuất sau vai. Không tính việc Bind thành công là đã có chuyển động vải hoàn chỉnh.
