# Quy tắc bắt buộc của v0

Các kiểu trong `types.ts` mô tả chữ ký; file này định nghĩa hành vi. Mọi error dùng `Result` với code, JSON Pointer `path`, message và ID liên quan nếu có. Thành công luôn có `warnings`, kể cả mảng rỗng. Lỗi thao tác project trả revision hiện tại. Không dùng exception để biểu diễn lỗi input dự kiến.

## Dữ liệu và validation

- Chỉ `formatVersion: 0`, `requiredCapabilities: ["region-v0"]`. Mỗi collection có ID duy nhất, dài 1–100 ký tự ASCII chữ/số/`_ . -`; ID không đổi khi đổi tên. `projectId` ổn định qua save/reopen; import-as-copy phải cấp projectId mới theo thao tác riêng. Không dùng name làm khóa.
- Có ít nhất một bone. Cho phép nhiều root, world root tính từ identity. Parent phải tồn tại, không self-parent/cycle; thứ tự mảng bones không quyết định thứ tự tính. Slot bone, attachment asset, animation channel bone đều phải tồn tại. `attachmentId: null` nghĩa là slot không vẽ. Region có thể được dùng bởi nhiều slot.
- Tất cả số hữu hạn, kể cả input trong bộ nhớ trước serialize. Revision là safe integer không âm; nếu tăng quá MAX_SAFE_INTEGER phải báo LIMIT_EXCEEDED trước commit. Scale bằng 0 và âm hợp lệ cho region v0; ma trận suy ra không hữu hạn phải báo INVALID_INPUT, không đưa NaN vào renderer. Không cần nghịch đảo ma trận world ở v0.
- Không nhận field lạ; không nhận JSON có duplicate object keys tại loader (kiểm tra trước JSON.parse). Không bỏ field/capability lạ khi load. Validation đi theo version → capabilities → shape → IDs/references/cycles → trim/key rules. Một hoặc nhiều lỗi được chẩn đoán; public Result trả lỗi đầu tiên theo thứ tự ổn định collection rồi index.
- Metadata/name chỉ là dữ liệu. Không diễn giải tên art thành chỉ dẫn, HTML, URL fetch hay code.

## Assets, trim và pivot

V0 dùng PNG. Mỗi path độc nhất, dạng `assets/<ASCII letters/digits/_/->.png` trong đó tên file chỉ gồm chữ/số/underscore/hyphen, không có thư mục con, `..`, query, URL hoặc đường dẫn tuyệt đối. SHA-256 là 64 ký tự hex thường của bytes PNG. Kích thước pixel phải khớp decoder và IHDR. Không xoay ảnh trong atlas v0.

`pixelWidth/Height` là kích thước ảnh đã trim; `originalWidth/Height` là ảnh trước trim; `trimX/Y` là tọa độ **góc trái trên** của vùng trim trong ảnh gốc, đơn vị pixel. Trim phải nằm trọn trong ảnh gốc. Ảnh chưa trim dùng original=pixel và trim=0. Thông tin cắt từ sheet ở bộ mẫu #2 là provenance, không tự biến cả sheet thành original image trong gói.

Region `width/height` là kích thước **ảnh trước trim** trong đơn vị logic; `pivotX/Y` đo từ góc trái dưới ảnh trước trim, cùng đơn vị logic (được nằm ngoài ảnh). Region transform đặt pivot vào không gian bone của slot. Với `sx = width/originalWidth`, `sy = height/originalHeight`, bốn góc vùng thực sự có texture trong không gian region trước transform là:

- left = trimX × sx − pivotX
- right = (trimX + pixelWidth) × sx − pivotX
- bottom = (originalHeight − trimY − pixelHeight) × sy − pivotY
- top = (originalHeight − trimY) × sy − pivotY

UV có gốc trái trên ảnh lưu: góc top-left dùng (0,0), bottom-left (0,1). Áp dụng `worldBone × region.transform` lên các góc. Không trừ pivot lần thứ hai trong transform. Đổi texture sang nửa độ phân giải phải đổi pixel/original/trim tương ứng nhưng giữ width/height/pivot/transform logic. Nếu tỉ lệ trim không biểu diễn bằng pixel nguyên, tái tạo PNG đầy đủ hoặc báo lỗi; không làm trôi hình để làm tròn.

Ví dụ: original 100×80, trim (10,20), PNG 60×40, region 200×160, pivot (100,0): góc dưới trái (-80,40), trên phải (40,120). Ví dụ body hợp lệ dùng PNG đã cắt 203×204 làm ảnh gốc, pivot (102,20), tương đương pivot top-left (102,184) của bài cũ.

## Tọa độ, pose và viewport

Giây/radian, X phải/Y lên, rotation dương ngược chiều kim đồng hồ. Một đơn vị logic mặc định bằng một pixel art trước khi chọn region scale. Vector cột, local = T × R × S; worldCon = worldCha × localCon. Lưu world bằng 6 số affine `[a,b,c,d,tx,ty]`; không ép về rotation/scale vì shear có thể xuất hiện.

Đáp án tính tay: cha (10,20), rotation π/2, scale (2,1), con local (3,4) → world (6,26). Cha không quay, scale (-1,1), cùng con → (7,24). Renderer không lật dữ liệu project. Trên viewport width/height là CSS pixel, screenX=width/2+(worldX−centerX)×zoom; screenY=height/2−(worldY−centerY)×zoom. Backing canvas width/height=round(CSS size×devicePixelRatio); zoom và DPR phải dương, mọi giá trị hữu hạn. PNG capture dùng cùng backing dimensions. Background là màu CSS dạng `#RRGGBB` hoặc `#RRGGBBAA`; không nhận URL/CSS tự do.

Pose giữ source projectId/revision; regions theo đúng thứ tự slots (từ sau ra trước), bỏ slot null. DrawRegion.world = boneWorld × attachmentLocal. Evaluator không ghi đè setup và không thay project. Player dùng cùng evaluator/renderer với editor.

## Nội suy

PoseRequest `animationId: null` trả setup, `sampledTime: 0`; time vẫn phải hữu hạn. ID animation thiếu trả MISSING_REFERENCE. Duration dương. Mỗi animation có tối đa một channel cho mỗi bone/property, keys không rỗng, tăng nghiêm ngặt theo time và nằm trong [0,duration]. Key chứa giá trị **tuyệt đối** của thuộc tính local, không phải offset so với setup.

Channel thiếu dùng setup. Trước key đầu giữ giá trị đầu, sau key cuối giữ giá trị cuối. Tại time đúng key trả đúng value đó. Curve trên key trái điều khiển đoạn tới key kế; curve key cuối được kiểm tra nhưng không dùng. `stepped` giữ value trái cho tới trước key phải; `linear` nội suy thẳng. Với Bezier, điều khiển chuẩn hóa từ (0,0) tới (1,1), `0 ≤ x1 ≤ x2 ≤ 1`; y hữu hạn, cho phép overshoot. Giải Bx(u)=tNormalized rồi dùng By(u) làm trọng số. Dùng bisection đủ sai số time ≤1e-9, kiểm tra ma trận tính ra hữu hạn; không dùng Bezier time/value tuyệt đối từ JSON Spine.

Rotation nội suy số trực tiếp, không tự chọn cung ngắn, cho phép nhiều vòng: 170° → -170° có giữa là 0°; muốn qua 180° phải ghi 170° → 190°. Scale nội suy số, được qua 0; đổi dấu không tự sinh visibility key.

Non-loop clamp time vào [0,duration]. Loop dùng modulo dương `((t % duration)+duration)%duration`, bao gồm time âm. Với duration=2: t=2→0, t=-.25→1.75. Key tại duration là endpoint của đoạn cuối trước wrap. Không tự nối từ key cuối về đầu nếu các key không phủ toàn duration. Độ mượt nối vòng là acceptance riêng: key hợp lệ chưa chứng minh vòng mượt.

## Lệnh, atomic và retry

Commands là chủ sở hữu duy nhất live project. `inspect` trả defensive copy. Mọi write chạy sync trên bản sao và commit một lần; UI/transport không được sửa object do commands giữ. `put*` tạo mới nếu ID chưa có, thay toàn bộ entity nếu ID có, giữ index cũ; tạo mới append. `remove` ID thiếu trả MISSING_REFERENCE. Xóa không tự cascade. `setSlotOrder` phải liệt kê mỗi ID slot đúng một lần. Operations áp dụng theo thứ tự trên bản sao; validation tham chiếu trên trạng thái cuối, nên được tạo bone và slot cùng batch. Invalid operation/batch làm toàn bộ không đổi.

Batch có 1–1000 operations; validate payload trước, tra dedup, kiểm tra expectedRevision, áp dụng, validate project cuối, commit. Request projectId phải bằng active project. Mỗi batch thành công, kể cả put cùng giá trị, tăng revision đúng 1 và tạo một undo entry. `changedIds` là các entity IDs touched, loại trùng; namespace đối chiếu operations, tên trùng giữa collection được phép. Hủy signal kiểm tra trước commit; sau commit không báo như chưa áp dụng: client đọc trạng thái hoặc undo.

Dedup là chung cho apply/undo/redo/checkpoint/restore, key `(projectId, requestId)`. Fingerprint gồm tên thao tác và payload đầy đủ (expectedRevision, operations…); so sánh cấu trúc, bỏ thứ tự object keys, giữ thứ tự array, -0 bằng 0, không nhận undefined/NaN. Tra request đã thành công **trước** so revision: cùng fingerprint trả lại kết quả cũ (revision tại lần áp dụng), không emit write/history lần nữa. Khác fingerprint cùng ID trả REQUEST_ID_REUSED. Failures không lưu trong dedup; sửa input và thử lại được khi chưa có commit.

Giữ 1.000 request thành công gần nhất theo thứ tự áp dụng (retry không refresh). Dedup chỉ trong một phiên mở project; reload/open kết thúc phiên, phải quảng bá giới hạn qua capabilities. Sau mất kết nối/timeout, client retry cùng ID trong phiên; nếu phiên mất hoặc bị evict, inspect và đối chiếu trước khi tạo request mới. Không hứa exactly-once qua reload. Reset phiên không tự đổi revision của project đã lưu.

## Undo, redo và checkpoint

Giữ tối đa 100 batch undo + 100 redo trong phiên. Undo/redo nhận RevisionRequest, kiểm tra cùng quy tắc write, phục hồi nội dung nhưng gán revision hiện tại+1, không quay số revision về quá khứ. Undo/redo không tạo entry mới trong undo stack ngoài việc chuyển entry giữa hai stack. Write mới thành công xóa redo. Stack rỗng trả NOTHING_TO_UNDO/REDO. Nếu tài nguyên không đủ, từ chối write trước commit, không silently mất history ngoài giới hạn đã quảng bá.

Checkpoint giữ bản sao project và tham chiếu bytes assets bất biến, gồm sourceRevision/ID/label; tối đa 20 checkpoint trong phiên. Tạo checkpoint cần revision đúng và requestId nhưng không sửa project/revision hoặc undo stack; việc tạo checkpoint được log riêng. Hết 20 trả LIMIT_EXCEEDED, không tự xóa. Restore checkpoint tạo một undo batch, revision+1, xóa redo; ID không tồn tại trả CHECKPOINT_NOT_FOUND. Bytes còn được history/checkpoint/job dùng không bị thu gom. History/checkpoint/dedup không nằm trong gói player.

## Storage, autosave và migration

Gói ZIP: `project.json` UTF-8 + đúng các PNG trong assets. V0 không atlas, external URL, symlink, encryption hay nested archive. Tổng bytes giải nén tối đa 200 MiB, mỗi PNG tối đa 20 MiB, tối đa 256 assets; mỗi dimension ≤16384 và tổng pixel decode ≤64 triệu. Kiểm tra cả declared và actual bytes trong lúc giải nén để chặn ZIP bomb. Không nhận duplicate ZIP paths, path traversal hoặc file ngoài manifest. Storage kiểm tra hash/size, decode PNG và project semantics trước khi trả Bundle; active project chỉ được thay sau khi mọi phần đã đạt. Lỗi giữ nguyên bản đang mở.

Autosave snapshot theo revision, giao dịch lưu project và bytes cùng nhau. Không cho lần lưu revision cũ hoàn tất muộn ghi đè revision mới. Lỗi quota/I/O trả STORAGE_FAILED và hiển thị chưa lưu; export vẫn là bản sao chủ động. Chỉ đánh dấu saved khi transaction thành công. Khôi phục trả bundle của lần lưu hoàn tất gần nhất, hoặc null nếu chưa có. Bytes bất biến trong phiên; thay asset bytes phải qua asset metadata/hash mới và batch hợp lệ.

V0 chỉ có identity migration 0→0 trên bản sao sau validation; version khác trả UNSUPPORTED_VERSION. Thay shape/semantics bắt buộc tăng formatVersion với migration có test fixture trước/sau; không sửa live data khi migration thất bại, không tự downgrade. Chỉ cập nhật mô tả hoặc test mà không đổi nghĩa mới được giữ v0.

## Quan sát, jobs và output

RenderPose/submit chụp defensive snapshot project + immutable bytes ngay khi nhận; sourceRevision không đổi dù người dùng tiếp tục sửa. Job IDs và artifact IDs opaque, không phải file path của máy. `queued → running → succeeded|failed|cancelled`, hoặc queued→cancelled. Terminal không đổi. Progress từ 0 tới 1, không giảm; succeeded=1. Cancel lặp lại trả trạng thái hiện có; cancel sau succeeded không xóa kết quả hoặc nhận là đã hủy. Cancelled/failed không expose artifact thành công một phần.

V0 tối đa 2 job đang chờ/chạy, 20 job terminal giữ trong phiên; evict terminal cũ nhất cùng artifact khi vượt giới hạn, về sau trả JOB_NOT_FOUND. Không evict job active. Mỗi request sequence 1–300 time hữu hạn; preview fps là số nguyên 1–60, loops nguyên 1–3, tổng frame ≤300. Preview lấy mẫu từ 0, bước 1/fps, tới trước loops×duration (animation phải loop nếu loops>1); không cộng chuyển vị trí giữa vòng. Capture viewport tối đa 4096×4096 backing pixels, tổng uncompressed RGBA của job ≤256 MiB; vượt trả LIMIT_EXCEEDED trước chạy. PNG sequence/preview trả PNG cùng ZIP manifest ghi time/revision/frame rate để UI phát; video codec/export là scope sau, không khóa module #11 vào MP4.

Artifact bytes, hash, mimeType, byteLength được đọc qua Observation; browser Blob URL chỉ tạo ở UI/transport, revoke khi dispose/evict. Không trả absolute local paths hoặc gửi ảnh lên dịch vụ ngoài. Output job gắn revision nguồn; UI phải báo nếu khác revision đang mở. Reload mất job trong phiên; hiện vật muốn giữ phải tải/lưu chủ động. #11 cần test hủy trước/trong/sau chạy và race sửa project.

## Transport và capabilities

Input unknown được validate theo schema tool rồi chuyển về cùng commands/evaluator/storage/observation. Không tạo đường sửa thứ hai. Result nội bộ không có DOM/HTTP; adapter chuyển `Result<Json>` thành content JSON, `isError` theo `ok`. Binary chuyển qua artifact ID, không JSON.stringify Uint8Array. Công bố versions/features/limits và transport thực tế. Feature chưa hỗ trợ trả UNSUPPORTED_CAPABILITY trước khi đổi project. Cancellation AbortSignal từ transport phải truyền đến async module, không chỉ đóng thông báo UI.

Kết quả probe #3 chỉ xác nhận tổ hợp đã ghi nhận, không tự đánh dấu Gate 1 hoặc Gate 3 đạt. Version Chrome hoặc API thay đổi phải chạy probe lại; bridge riêng phải công bố `transport: bridge`, không giả nhãn native.
