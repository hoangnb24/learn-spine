# Mixing và chuyển tiếp — kết quả discovery #24

Ngày 12/09/2026. Baseline `5b692111cb99d0dbeb3fd70c6732500b9fbed726`.
Phạm vi mới theo chủ dự án: kết hợp/chuyển tiếp phục vụ tạo, xem, sửa trên trang;
audio chuyển sang #70 Deferred. Không mở lại quyết định đầu ra #22, không làm
Polish #51/#52. Đây là đặc tả đề nghị và prototype, chưa phải capability sản phẩm.

## Kết luận đề nghị

Triển khai trước một composition hữu hạn, gồm các track transform tham chiếu
animation hiện có, mask thuộc tính tường minh, alpha và thời gian chuyển tuyến tính.
Giữ một animation cũ hoạt động như trước. Không dùng Spine runtime. Dùng chung
schema/capability, evaluator, Session, Editor và tools khi tích hợp, không giấu
composition trong metadata hoặc dựng evaluator thứ hai trong sản phẩm.

Prototype [mixer.ts](../../../prototypes/mixing/mixer.ts) nhập trực tiếp `Project`,
`Transform`, `Animation`, `sample` và `sampledTime` canonical. `pose()` là adapter
nghiên cứu: tạo transient setup từ locals rồi gọi evaluator hiện có để tái dùng
FK/IK/region; nó trả pose `animationId:null,time:0`, **không phải API/provenance
được đề nghị cho sản phẩm**. Không có dữ liệu art/mesh deformation trong demo.
Prototype nhận canonical Project đã hợp lệ; exception input controls là tiện ích
nghiên cứu, không thay public `Result`/schema contract.

## Semantics scalar và thứ tự

Setup của thuộc tính là S; giá trị sau track dưới là L; sample channel là A;
trọng số hiệu dụng là w. Chỉ tác động khi có channel **và** cặp bone/property
nằm trong mask; thiếu channel không kéo về setup. Không ngầm mở rộng mask tới
con/cháu. Mask rỗng là no-op; bone/property sai hoặc trùng bị từ chối.

| Mode | Kết quả |
| --- | --- |
| overwrite | `(1-w)*L + w*A` |
| additive | `L + w*(A-S)` |

Key vẫn là giá trị tuyệt đối local. Góc radian nội suy số trực tiếp, giữ multi-turn:
170°→−170° giữa là 0°, muốn qua 180° phải author 170°→190°. Mixing không tự chọn
cung ngắn; khác với phần shortest-angle riêng của IK đã được chốt. Scale additive
cộng delta so với setup, **không nhân tỉ lệ**; scale qua zero/âm giữ semantics hiện
có, có thể làm IK singular/unsupported, phải báo diagnostics thực tế.

Track có `order` nguyên không âm, unique; áp thấp trước cao sau, không phụ thuộc
thứ tự mảng. Mỗi pose khởi tạo lại từ setup, không cộng tích lũy vào frame trước.
Root x/y là thuộc tính bình thường phải nằm trong mask. Không extraction,
accumulated displacement, in-place compensation hay world locomotion tự động;
loop quay lại sample đầu, có thể nhảy nếu root keys không nối. Tọa độ vẫn X phải,
Y lên; local T×R×S.

Thứ tự tích hợp: **sample từng track → compose fresh locals → FK → IK tăng order
→ deform/skinning → region transforms → renderer**. Không blend world matrix hoặc
blend hai pose đã giải IK. Deform mixing chưa được định nghĩa: prototype từ chối
track có deforms; bước v1 phải từ chối rõ các composition chứa nguồn deform, không
âm thầm bỏ offset. Animation đơn mesh/deform cũ phải giữ nguyên. Renderer chỉ nhận
final geometry; status `solved` không thay thế final foot residual.

## Clock, removal, hold và transition

Composition time C là thời gian tuyệt đối có thể seek. Source sample time là
`offset+(C-start)*speed`, sau đó dùng canonical clamp/modulo; speed không âm.
Reverse playback deferred. Source speed 0 giữ sample nhưng fade vẫn chạy nếu C
chạy. Pause toàn transport giữ C, nên cả sample, fade và event cursor đứng yên.
Seek tính lại pose độc lập, không replay callbacks. Không lấy delta frame làm
đầu vào evaluator.

`w = alpha * in(C) * out(C)`. Before start: 0. Fade-in tuyến tính từ 0 tới 1
trong `fadeIn`; zero duration là 1 ngay start. `end` là lúc bắt đầu removal,
`fadeOut` là thời gian về 0; zero fadeOut remove ngay tại end. Không có end = hold
vô hạn; source non-loop giữ key cuối, loop tiếp tục lặp. Composition sản phẩm
cần duration hữu hạn riêng và clamp/loop riêng đã validate.

| Điều kiện | Giá trị / hành vi |
| --- | --- |
| alpha 0 / .5 / 1, L=.8 A=1 S=.2 | overwrite .8/.9/1; additive .8/1.2/1.6 |
| alpha ngoài [0,1], NaN, order trùng, thời gian không hữu hạn | lỗi |
| start 0, fadeIn .4 tại C=0/.2/.4 | w=0/.5/1 |
| end 1, fadeOut .4 tại C=1/1.2/1.4 | w=1/.5/0 (sau fade-in) |
| remove tức thì | lower stack lộ ra ngay; có thể nhảy |
| source speed 0, offset .5 | sample .5; fade theo C |
| C không đổi | pose/fades không đổi; không emit event |
| non-loop sau duration, không end | giữ last sample |
| loop duration 1 tại C=1 | sample 0; không cộng root displacement |
| frozen source | snapshot locals trước IK, không giữ reference mutable |

**Crossfade hai động tác đầy đủ**: giữ outgoing frozen locals ở weight 1 trên
lower stack, đưa incoming overwrite lên từ 0→1, rồi remove outgoing khi incoming
đạt 1. Không fade-out outgoing đồng thời fade-in incoming overwrite: cách đó pha
thêm setup/lower vào giữa, không phải lerp A→B. Frozen ở đây giữ locals, không hứa
giữ world endpoint nếu cha/target khác còn di chuyển. Nếu cần outgoing còn phát,
phải chọn rõ live source thay frozen; prototype hỗ trợ cả hai nhưng không tự chọn.

**Coverage tại removal**: incoming phải key và mask toàn bộ thuộc tính outgoing
được dùng cho crossfade đầy đủ, hoặc author riêng fade-out về lower cho phần thiếu.
Không tự coi absent channel là setup. Prototype primitive cho phép partial tracks
và có negative control chứng minh arm snap .2 rad khi bỏ channel đích; API authoring
transition v1 nên từ chối transition thiếu coverage và trả danh sách bone/property,
để người/agent bổ sung key hoặc chọn fade-out riêng. Không hứa mọi partial-mask
transition trơn. Demo stop có explicit arm rotation .4→.2 để tránh lỗi đó.

## Fixture số và chân trụ

[Tests](../../../prototypes/mixing/mixer.test.ts) có các expected độc lập:
walk tại .5: hip.y=−20, target.x=100, arm=.8. Wave tại .5 arm=1.
Overwrite wave alpha .5 → arm .9; additive →1.2. Mask arm giữ hip/target nguyên.
Crossfade tại C=1.2 từ frozen walk boundary sang stop (fade .4): hip.y=−2,
arm=.36; tại 1.4 arm=.24. Kiểm tra trước mốc 1.4−1e−9 dùng đáp số .2400000008,
không coi hai thời điểm khác nhau phải trùng tuyệt đối.

Stop request .25 chờ boundary 1.0 (`ceil(request/duration)*duration`). Chân phải
ở (120,−100) tại entry; target là root độc lập, được giữ cố định trong stop;
hip tiếp tục hạ. 101 samples từ 1→2 yêu cầu foot XY đúng trong 1e−10-level oracle,
final IK residual <1e−8. Negative controls: walk .25→stop .25 chênh X=10; bỏ IK
lệch >10. Đây là fixture hai segment 100+100 trong miền reachable, không bảo đảm
dừng tức thì ở mọi pha/rig. Tối đa chờ gần 1 giây với chu kỳ này; nhiều contact
phases và author stop clips tương ứng là việc sau nếu cần. Không chứng minh vận tốc
hoặc gia tốc liên tục; key linear và vận tốc đổi tại điểm nối vẫn có thể nhìn cơ học.

Bài học [57](../../../lessons/057-editor-preview-transition.md) tách speed và removal;
[59](../../../lessons/059-editor-additive-offset.md) kiểm additive bằng expected số;
[79](../../../lessons/079-editor-stop-phase-entry.md) chỉ ra cùng frame không đồng
nghĩa cùng chân trụ. Không suy bằng chứng Spine Trial thành engine parity.

## Event metadata policy — không audio

Prototype `crossings(markers,duration,loop,previous,next,kind)` chỉ trả metadata.
Markers unique ID, time trong [0,duration), endpoint duration bị từ chối để tránh
hai biểu diễn cho cùng wrap. Forward advance dùng khoảng **(previous,next]**;
marker0 không fire tự động ở initial C=0, fire tại wrap; nhiều vòng trả mọi crossing
với cycle và absolute at theo thứ tự thời gian/ID. Seek/reset/reverse và interval
rỗng emit none. Cursor cập nhật bởi transport sau mỗi advance và cả seek/reset;
không gọi lại interval cũ rồi đòi dedup. Chia interval thành nhiều frame cho cùng
kết quả. Preview frame sampling tuyệt đối không phát event. Giới hạn 10.001 cycles
mỗi marker/interval, safe integer cycle; vượt phải báo lỗi, không silently drop.

Khi tích hợp tracks, event identity cần `(composition revision, track instance,
marker ID, cycle)`; chỉ incoming/current live source đủ effective weight>0 mới
được dispatch, frozen outgoing silent. Không trộn callbacks từ cả hai half của
một transition; mask bone không lọc marker. Các quy tắc dispatch nhiều track này
**mới đặc tả, chưa implemented**; v1 transform preview không quảng bá events.

Audio hoàn toàn Deferred #70: chưa có audio clock, buffering, stop/restart,
seek resync, latency, waveform hoặc kiểm nghe; metadata không chứng minh audio
đồng bộ. Khi có nhu cầu mới mở #70 với nguồn audio/thiết bị và nghe playback thật.

## API và acceptance bàn giao cho implementation

Đề nghị 3 bước nhỏ, merge/review tuần tự. Đây là handoff kỹ thuật, không tự mở
issue hay duyệt feature toàn bộ:

1. **Canonical composition data**: explicit optional `Project.compositions` với
capability/version phù hợp quy tắc schema hiện có; ID/name/duration/loop và tracks
tham chiếu animation ID, numeric mask/order/timing validated. No metadata escape.
Public `putComposition/remove` qua cùng Session atomic revision/undo; lỗi reference,
unsupported deform, incomplete transition coverage không sửa dở. Frozen transition
snapshot nên được suy ra từ source animation+entry time đã định danh, không lưu
mutable runtime pose. Document precise translation từ descriptor sang primitive.
Legacy projects giữ nguyên semantics và lưu/mở lại; test missing reference,
strict unknown fields/capability, undo/redo, invalid batch, ZIP roundtrip. Không
phát triển exporter mới.
2. **Evaluator**: bổ sung target union rõ `animation`/`composition`, giữ request
animation cũ tương thích. Return provenance đúng target/time/revision; không copy
adapter transient của prototype. Compose trước FK/IK; reused accepted transforms,
IK and render paths. Acceptance: vectors ở đây, shuffled seeks/loop/pause, setup
nonmutation, complete coverage crossfade + rejected incomplete, scale/angle tests,
IK residual+negative controls, region/mesh legacy regressions. Composition có
source deform trả unsupported rõ. Generic auto-stop không nằm trong bước này.
3. **Tạo/xem/sửa trên trang và agent**: tools/schema/capability, shared Stage và
playback chọn composition + duration cùng engine; author mask/alpha/order/timing,
inspect kết quả, sửa và undo qua public Session. Observation/diagnostics phải nhận
composition target/provenance; bounds cần conservative multi-track/additive,
zero-speed/hold/transition, không tái dùng envelope của một animation hay gọi
sample-only là continuous coverage. Nếu chưa có conservative bounds phải lỗi
unsupported rõ cho target đó. Kiểm workflow thật create→play→edit→observe→undo→
save/reopen, nhìn chuyển động; kiểm legacy editor/player và actual final geometry.
Không nhận handler-only/browser bridge là native pass. Không thêm renderer feature
hoặc quyết định output chỉ để hỗ trợ composition.

Audio/event dispatch, deform mixing, reverse, automatic phase controller cho mọi
rig, root motion extraction và quality polish vẫn ngoài v1. Bằng chứng và giới hạn
trong [prototype README](../../../prototypes/mixing/README.md). Không đổi ngưỡng
Gate 1/2/3, không có claim performance/native/production/full parity.
