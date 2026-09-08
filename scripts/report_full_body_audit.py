from pathlib import Path
from PIL import Image, ImageDraw, ImageChops
import json

root = Path(__file__).resolve().parents[1] / 'exercises/robot/evidence/full-body-audit'
frames = [Image.open(root / f'poses/frame-{f:02}.png').convert('RGB').crop((1040, 145, 1410, 744)) for f in range(31)]
for page, start in enumerate(range(0, 31, 16)):
    sheet = Image.new('RGB', (1480, 2520), '#eeeeee')
    draw = ImageDraw.Draw(sheet)
    for i, frame in enumerate(frames[start:start + 16]):
        x, y = i % 4 * 370, i // 4 * 630
        sheet.paste(frame, (x, y + 24))
        draw.text((x + 8, y + 6), f'Frame {start + i}', fill='black')
    sheet.save(root / f'contact-{page + 1}.jpg', quality=92)
frames[0].save(root / 'walk-review.gif', save_all=True, append_images=frames[1:30], duration=[30, 30, 40] * 10, loop=0)
(root / 'review.json').write_text(json.dumps({'source': '31 screenshots from Spine Outline; no animation edits', 'crop': [1040,145,1410,744], 'endpoint_difference_bbox': ImageChops.difference(frames[0], frames[30]).getbbox(), 'gif': '30 sampled poses, 1 second loop; not Spine export'}, indent=2))
