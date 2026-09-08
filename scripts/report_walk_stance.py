from pathlib import Path
from PIL import Image, ImageDraw, ImageChops
import json

root = Path(__file__).resolve().parents[1] / 'exercises/robot/evidence/walk-stance'
frames = [Image.open(root / f'wide-foot-left-{f}.png').convert('RGB').crop((668, 145, 1038, 744)) for f in range(31)]
for page, start in enumerate(range(0, 31, 16)):
    sheet = Image.new('RGB', (1480, 2520), '#eeeeee')
    draw = ImageDraw.Draw(sheet)
    for i, frame in enumerate(frames[start:start + 16]):
        x, y = i % 4 * 370, i // 4 * 630
        sheet.paste(frame, (x, y + 24))
        draw.text((x + 8, y + 6), f'Frame {start + i}', fill='black')
    sheet.save(root / f'contact-{page + 1}.jpg', quality=92)
frames[0].save(root / 'walk-review.gif', save_all=True, append_images=frames[1:30], duration=[30, 30, 40] * 10, loop=0)
(root / 'review.json').write_text(json.dumps({'source': '31 screenshots from Spine Outline; walk-wide: targets X shifted left -20, right +20; Revaluing None', 'crop': [668,145,1038,744], 'endpoint_difference_bbox': ImageChops.difference(frames[0], frames[30]).getbbox(), 'gif': '30 sampled poses, 1 second loop; not Spine export'}, indent=2))

old = root.parent / 'walk-clearance' / 'poses'
comparison = Image.new('RGB', (740, 1260), '#eeeeee')
draw = ImageDraw.Draw(comparison)
for row, f in enumerate([15, 23]):
    before = Image.open(old / f'frame-{f:02}.png').convert('RGB').crop((1040,145,1410,744))
    comparison.paste(before, (0, row*630+24))
    comparison.paste(frames[f], (370, row*630+24))
    draw.text((8,row*630+6), f'Before - frame {f}', fill='black')
    draw.text((378,row*630+6), f'After - frame {f}', fill='black')
comparison.save(root/'comparison.jpg', quality=95)
