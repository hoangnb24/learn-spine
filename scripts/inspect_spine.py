"""Inspect a Spine JSON example; does not render or modify it."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'examples/spineboy/spineboy-ess.json'
data = json.loads(source.read_text())
bones = {bone['name']: bone for bone in data['bones']}
errors = []
for bone in bones.values():
    if bone.get('parent') and bone['parent'] not in bones:
        errors.append(f"Missing parent: {bone['name']}")
for slot in data['slots']:
    if slot['bone'] not in bones:
        errors.append(f"Missing slot bone: {slot['name']}")

def descendants(name):
    children = [b['name'] for b in bones.values() if b.get('parent') == name]
    return children + [d for child in children for d in descendants(child)]

def last_time(value):
    if isinstance(value, dict):
        return max([value.get('time', 0)] + [last_time(v) for v in value.values()])
    if isinstance(value, list):
        return max([0] + [last_time(v) for v in value])
    return 0

lines = ['# Kết quả đọc dữ liệu Spineboy Essential', '',
         f"Phiên bản dữ liệu: {data['skeleton']['spine']}",
         f"Số xương: {len(bones)}; số slot: {len(data['slots'])}.",
         f"Lỗi tham chiếu cha/slot: {len(errors)}.", '',
         '## Cây xương', '', '```text']
for bone in bones.values():
    chain = [bone['name']]
    while bones[chain[0]].get('parent'):
        chain.insert(0, bones[chain[0]]['parent'])
    lines.append(' → '.join(chain))
lines += ['```', '', '## Phạm vi kế thừa từ xương cha', '']
for name in ['root', 'hip', 'torso', 'head']:
    lines.append(f"- `{name}` có {len(descendants(name))} xương con/cháu: " + ', '.join(descendants(name)))
lines += ['', 'Đây là quan hệ cây; chưa mô phỏng transform hoặc constraint.', '',
          '## Mốc thời gian cuối trong dữ liệu animation', '',
          '| Animation | Giây |', '| --- | ---: |']
for name, anim in data['animations'].items():
    lines.append(f'| {name} | {last_time(anim):g} |')
lines += ['', '## Các key xoay đầu trong walk', '', '| Giây | Giá trị xoay |', '| ---: | ---: |']
for key in data['animations']['walk']['bones']['head']['rotate']:
    lines.append(f"| {key.get('time', 0):g} | {key.get('value', 0):g} |")
lines += ['', 'Hai key đầu/cuối bằng nhau chưa chứng minh toàn bộ vòng lặp mượt: còn vận tốc nội suy và các kênh khác.', '']
output = ROOT / 'lessons/001-data-report.md'
output.write_text('\n'.join(lines))
print(output)
print('\n'.join(errors) if errors else 'Parent and slot references: OK')
