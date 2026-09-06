# Kết quả đọc dữ liệu Spineboy Essential

Phiên bản dữ liệu: 4.2.22
Số xương: 18; số slot: 20.
Lỗi tham chiếu cha/slot: 0.

## Cây xương

```text
root
root → hip
root → hip → torso
root → hip → torso → front-upper-arm
root → hip → torso → front-upper-arm → front-bracer
root → hip → torso → front-upper-arm → front-bracer → front-fist
root → hip → front-thigh
root → hip → front-thigh → front-shin
root → hip → front-thigh → front-shin → front-foot
root → hip → torso → rear-upper-arm
root → hip → torso → rear-upper-arm → rear-bracer
root → hip → torso → rear-upper-arm → rear-bracer → gun
root → hip → torso → rear-upper-arm → rear-bracer → gun → gun-tip
root → hip → torso → neck
root → hip → torso → neck → head
root → hip → rear-thigh
root → hip → rear-thigh → rear-shin
root → hip → rear-thigh → rear-shin → rear-foot
```

## Phạm vi kế thừa từ xương cha

- `root` có 17 xương con/cháu: hip, torso, front-thigh, rear-thigh, front-upper-arm, rear-upper-arm, neck, front-bracer, front-fist, rear-bracer, gun, gun-tip, head, front-shin, front-foot, rear-shin, rear-foot
- `hip` có 16 xương con/cháu: torso, front-thigh, rear-thigh, front-upper-arm, rear-upper-arm, neck, front-bracer, front-fist, rear-bracer, gun, gun-tip, head, front-shin, front-foot, rear-shin, rear-foot
- `torso` có 9 xương con/cháu: front-upper-arm, rear-upper-arm, neck, front-bracer, front-fist, rear-bracer, gun, gun-tip, head
- `head` có 0 xương con/cháu: 

Đây là quan hệ cây; chưa mô phỏng transform hoặc constraint.

## Mốc thời gian cuối trong dữ liệu animation

| Animation | Giây |
| --- | ---: |
| aim | 0 |
| death | 4.9333 |
| hit | 0.3333 |
| idle | 1.6667 |
| jump | 1.3333 |
| run | 0.6667 |
| shoot | 0.4 |
| walk | 1 |

## Các key xoay đầu trong walk

| Giây | Giá trị xoay |
| ---: | ---: |
| 0 | -12.23 |
| 0.2667 | -7.43 |
| 0.5 | -12.23 |
| 0.7667 | -7.47 |
| 1 | -12.23 |

Hai key đầu/cuối bằng nhau chưa chứng minh toàn bộ vòng lặp mượt: còn vận tốc nội suy và các kênh khác.
