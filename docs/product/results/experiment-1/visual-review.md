# Review hình và nhịp — tác giả, revision 5

Nguồn review: 24 PNG full canvas1280×720 thật từ editor/player; ảnh native render_pose trước/sau; hai ZIP preview native revision5; video chuyển trực tiếp từ các PNG đó, không chỉnh animation. Đây nhận định của tác giả để reviewer độc lập đối chiếu, không tự nghiệm thu thay reviewer.

Idle: xem ba vòng trong video6 giây, mỗi vòng2 giây. Log [playback-idle-log.json](playback-idle-log.json) kết thúc currentTime=duration=6; screenshot toàn trang ở playback-idle-NN.png; [contact thực tế](idle-playback-contact.png). Đầu nghiêng nhẹ và hai tay đu đưa chậm, chân/thân đứng yên theo brief. Không thấy bộ phận biến mất, camera co giãn hoặc nhảy ở mốc nối. Chuyển động nhỏ có chủ ý, không được gọi là breathing/full-body idle.

Wave: xem ba vòng trong video12 giây, mỗi vòng4 giây. Log [playback-wave-log.json](playback-wave-log.json) kết thúc currentTime=duration=12; screenshot toàn trang ở playback-wave-NN.png; [contact thực tế](wave-playback-contact.png). Tay phải nâng trong0–0,8s, hai lần hạ/ngẩng forearm trong0,8–3,2s, hạ về vị trí nghỉ3,2–4s. Vai/cổ tay vẫn nối được về mặt hình, bàn tay/antenna/giày còn trong khung; thân và tay trái không bị kéo theo. Không thấy bước nhảy bất ngờ ở các mốc4s/8s. Đường cong nghỉ eased tại vòng là chủ ý.

Bản nháp native revision4 có thêm một nhịp vẫy so với brief. Sau quan sát ảnh và kiểm tra timing, agent thay riêng wave bằng set_keyframes, revision5; idle/rig không được sửa. Transcript chứa cả hai bước, ảnh trước/sau và ZIP cuối. 12 mốc/animation còn có ảnh giữa key, không chỉ key đẹp.

Các preview dùng continuous envelope480×360 nên khung khác kích thước editor; không dùng việc đổi camera này để so pixel. Pixel parity dùng actual editor/player canvas cùng viewport1280×720. PNG của ba vòng preview trùng bytes theo từng phase; log playback chứng minh trình phát đã đi đến hết video, và contact screenshot giúp kiểm tra nhịp theo thời gian thực. Video12fps là bằng chứng quan sát, không chứng nhận gate60fps hoặc physical presentation.

Kết luận hình/nhịp theo brief: đạt trong mẫu robot này. Kết luận Gate1 chung: **chưa đạt** do phép đo cadence, độc lập với nhận định hình.

## Phụ lục review độc lập

Reviewer khác tác giả đã chạy lại video trên Codex Browser Chrome152 bằng tab/server4195 riêng. Idle6s và wave12s phát thật tới hết ba vòng, không seek; reviewer nhận ảnh realtime khoảng500ms/lần cùng DOMlog200ms. Nhận định độc lập: đủ bộ phận, không clipping hay nhảy lớn, idle nhẹ, wave hai nhịp và trở về. [Log reviewer](reviewer-playback-log.json) được sao chép nguyên từ bàn giao của reviewer. Ảnh đã được reviewer trực tiếp xem qua tool nhưng không có bản file riêng trong bàn giao này; không mô tả log là chứa các ảnh đó. Phụ lục không tuyên bố playback60fps hay physical presentation.
