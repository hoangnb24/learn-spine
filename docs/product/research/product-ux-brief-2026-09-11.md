# Product audit và brief UX — 11/09/2026

Trạng thái: đề xuất phục vụ nghiên cứu/preview; chưa đổi phạm vi GitHub issues hoặc triển khai tính năng. Đọc cùng [audit backlog](backlog-audit-2026-09-11.md) và [audit contracts](contract-ux-audit-2026-09-11.md).

## Kết luận sản phẩm

Đây là công cụ tạo animation 2D có cấu trúc, agent thao tác qua tools và người dùng kiểm tra/chỉnh sửa cùng project. Giá trị chính là sửa chuyển động có phạm vi, giữ phần đã đạt, lưu và mở lại được. Không phải dịch vụ chat sinh video, không phải bản sao toàn bộ Spine.

Nguồn: [README](../README.md), [scope](../scope.md), [architecture](../architecture.md), [gates](../experiments.md), [contracts](../contracts/README.md). Preview cũ chỉ mô tả shell #5 nên chưa diễn đạt vòng sử dụng đầy đủ.

## Các màn hình cần nghiên cứu và thiết kế

1. Bắt đầu project: nạp PNG tách bộ phận cùng thông tin bố trí, hoặc mở gói project. Phân biệt art nguồn và project đã lưu; lỗi file phải sửa được. Đây là đích #10/#12, không phải chức năng #5.
2. Workspace xem/chỉnh: canvas là vùng chính; cây đối tượng và assets bên trái; thuộc tính theo selection bên phải; chọn animation và timeline phía dưới. Agent và UI sửa cùng trạng thái qua commands.
3. Kiểm tra kết quả: playback, lựa chọn idle/wave, lịch sử thay đổi, checkpoint và phản hồi có phạm vi. Nếu bổ sung trước/sau, cần gắn cùng thời điểm và vùng nhìn để so sánh đúng. Chức năng này chưa có acceptance cụ thể; preview đích chỉ dùng lịch sử/checkpoint, không tự thêm split compare hoặc onion-skin.
4. Lưu và dùng kết quả: tách autosave tại trình duyệt với tải gói project; có trạng thái chưa lưu/lỗi. Player là entry riêng, nạp gói đã xuất khi editor đóng.
5. Trạng thái phục hồi: file lỗi, chưa có selection/animation, kết quả quan sát cũ hơn project hiện tại, xung đột sau khi người dùng chỉnh, job đã hủy/thất bại. UI không được báo hủy thành công khi thay đổi đã commit.

## Bản đồ chức năng và issue

| Chức năng người dùng thấy | Thành phần phải có | Issue | Trong #5? |
| --- | --- | --- | --- |
| Editor/player mở được, bố cục rỗng | Workspace, core rỗng, entry riêng, CI | #5 | Có, shell |
| Dữ liệu project hợp lệ | Model/schema/references | #6 | Không |
| Chỉnh đối tượng, undo/redo/checkpoint | Commands atomic, revision, history | #7, tích hợp #12 | Không |
| Chuyển động đúng khi play/seek | Evaluator theo thời gian | #8 | Không |
| Canvas vẽ art đúng | Renderer, viewport, textures | #9 | Không |
| Lưu/mở project kèm art | Bundle, storage, autosave | #10, tích hợp #12 | Không |
| Ảnh/chuỗi quan sát và hủy tác vụ | Snapshot, jobs, artifacts | #11 | Không |
| Nạp art, chỉnh rig/key, timeline, player | UI dùng chung core | #12 | Không |
| Agent thao tác project | Capabilities, schemas, adapter | #13 | Không |
| Robot chạy toàn quy trình | Gate 1 | #14 | Không |
| Khăn/thạch, mesh/IK/chẩn đoán | Core và UI mở rộng | #15–#20 | Không |
| Agent tạo/xem/sửa được độc lập | Gate 3 và quyết định MVP | #21–#22 | Không |
| PSD, mixing, skins, physics, video, ảnh phẳng | Discovery, chưa cam kết production | #23–#29 | Không |

Tên tools trong architecture là ví dụ, không phải API đã đăng ký. Designer thể hiện ý định người dùng bằng nhãn dễ hiểu; không đưa requestId, JSON, schema hoặc mã lỗi thô lên giao diện mặc định.

## Những điểm phải làm rõ trước implementation liên quan

- README dòng 3 và execution-plan phần bắt đầu còn nói Foundation chưa merge/#2–#4 bắt đầu ngay. GitHub PR #30 đã merge ngày 11/09/2026; #2–#4 Done và #5 Ready. Đây là stale snapshot, không phải yêu cầu làm lại Foundation.
- README dòng 25–28 mô tả brief/feedback nhưng chưa xác định nơi hội thoại. Hướng tạm cho preview: hội thoại ở agent host bên ngoài, editor hiển thị kết quả/trạng thái; không tự thêm chat backend/API key/login/billing vào MVP.
- README dòng 28 yêu cầu xem trước/sau nhưng #12 chưa có acceptance cụ thể cho so sánh. Đề xuất #12/#14 cụ thể hóa review theo checkpoint; compare chỉ là lựa chọn cần chốt, chưa thêm vào acceptance.
- “Dừng công việc” phải phân biệt dừng playback, hủy job trong ứng dụng, và ngừng agent gửi các lệnh mới. Cancel job không tự dừng agent bên ngoài. Cần #7/#11/#12/#13 phối hợp cơ chế và trạng thái; không dùng một nút mơ hồ cho cả ba.
- V0 yêu cầu ít nhất một bone (semantics: Dữ liệu và validation). Empty state #5 có thể là chưa mở project; không cần tạo project có bones=[] trái hợp đồng để hiển thị canvas trống.

## Hướng giao nghiên cứu Mobbin

Tìm và xem ảnh thực tế của các mẫu: mở/tạo project trong creative tool; canvas và inspector theo selection; timeline/playback trong công cụ animation hoặc video; version history/so sánh và save/export. Rút ra nguyên tắc từ màn hình thực tế, kèm URL Mobbin và phân biệt quan sát với đề xuất. Không sao chép skin hoặc thêm những tính năng của app tham khảo ngoài phạm vi.

## Đầu ra design đề xuất

Một ảnh workspace đích (robot idle/wave, caption rõ concept cho #12–#14) để hình dung chức năng; một ảnh shell #5 + player entry trống cùng visual system để chốt cái sẽ build trước. Không dùng ảnh concept làm bằng chứng engine/gate đã hoạt động. Ưu tiên canvas, trạng thái lưu và thao tác review rõ; advanced tools chỉ hiện theo selection/mode, không chiếm toàn bộ màn hình.

## Kết quả audit và thay đổi tài liệu trong đợt này

- Đã kiểm tra 28 task và quan hệ phụ thuộc GitHub: không chu trình, wave đúng, DAG khớp backlog. #5 đang In Progress / Ready, không giao implementation trùng trong đợt thiết kế này.
- Đã cập nhật factual snapshot tại README, execution-plan và readiness T04 trong backlog; giữ nguyên dependencies và acceptance GitHub. Báo cáo audit ghi trạng thái trước chỉnh để truy vết.
- Spritesheet đang lệch scope: scope.md đặt ở giai đoạn 2 nhưng #28 deferred sau #22. Đề xuất theo backlog: giai đoạn 2 giữ project/player/PNG sequence; spritesheet nghiên cứu sau. Chưa sửa phạm vi hoặc GitHub trong đợt audit.
- Các hợp đồng ghép cần cụ thể hóa trước tích hợp: #7/#10/#12 quản lý phiên và bytes ảnh khi import/undo/restore; #7/#12/#13 cập nhật UI và history; #9/#11 metadata và fit ảnh; #11/#13 hủy job. Không có phát hiện buộc dừng #5.
- UX research tiếp theo: [Mobbin research](mobbin-ux-research-2026-09-11.md). Quan sát từ mẫu tham khảo không thay thế user testing; thiết kế là đề xuất, không phải chức năng đã triển khai.

## Preview đã bàn giao

[Xem hai ảnh và giải thích thiết kế](design-preview-2026-09-11.md): trải nghiệm robot đích #12–14 và shell #5/player riêng. Robot là minh họa thiết kế, chưa phải fixture chạy trên engine. Các file audit, nghiên cứu và preview được lưu trong repo; chưa commit/push trong đợt này.
