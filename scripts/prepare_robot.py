"""Extract ImageGen's isolated robot parts after explicit user authorization.

Uses a border-connected light-background mask, preserving enclosed cream fills.
The original generated sheets are never overwritten.
"""
import json
import colorsys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'exercises/robot'
image = Image.open(BASE / 'images/parts-study-v2.png').convert('RGB')
out = BASE / 'images/parts'
out.mkdir(exist_ok=True)
# Bounds are from visual inspection of the generated sheet, not assumed grid cells.
boxes = {
    'head': (65, 20, 385, 310),
    'body': (415, 75, 650, 315),
    'pelvis': (700, 170, 930, 310),
    'upper-arm-left': (125, 365, 250, 565),
    'forearm-left': (410, 350, 550, 635),
    'hand-left': (700, 385, 840, 615),
    'upper-arm-right': (125, 675, 255, 880),
    'forearm-right': (410, 675, 560, 955),
    'hand-right': (695, 700, 835, 935),
    'thigh-left': (110, 965, 245, 1210),
    'shin-left': (410, 965, 555, 1220),
    'foot-left': (670, 1010, 900, 1220),
}
manifest = {}
for name, box in boxes.items():
    crop = image.crop(box)
    # Background is light neutral checkerboard. Dark outlines enclose pale interiors.
    mask = Image.new('L', crop.size)
    mask.putdata([255 if min(p) < 190 or max(p)-min(p) > 55 else 0
                  for p in crop.getdata()])
    # Fill enclosed regions by marking only exterior zeros with flood fill.
    exterior = ImageOps.expand(mask, border=1, fill=0)
    ImageDraw.floodfill(exterior, (0, 0), 128, thresh=0)
    exterior = exterior.crop((1, 1, crop.width+1, crop.height+1))
    alpha = exterior.point(lambda p: 0 if p == 128 else 255)
    bounds = alpha.getbbox()
    if not bounds:
        raise ValueError(f'No foreground for {name}')
    part = crop.convert('RGBA')
    part.putalpha(alpha)
    part = part.crop(bounds)
    part.save(out / f'{name}.png')
    manifest[name] = {'sheetBox': box, 'trim': bounds, 'width': part.width,
                      'height': part.height, 'transparentPixels':
                      sum(1 for a in part.getchannel('A').getdata() if a == 0)}
for part in ['thigh', 'shin', 'foot']:
    source = out / f'{part}-left.png'
    mirrored = ImageOps.mirror(Image.open(source))
    mirrored.save(out / f'{part}-right.png')
    manifest[f'{part}-right'] = {**manifest[f'{part}-left'], 'mirroredFrom': source.name}
(BASE / 'parts-manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')

# A second skin changes only saturated orange panels, preserving cream and alpha.
mint_folder = BASE / 'images/parts/mint'
mint_folder.mkdir(exist_ok=True)
for name in manifest:
    p = Image.open(out / f'{name}.png')
    pixels=[]
    for r,g,b,a in p.getdata():
        h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
        if a and .035<h<.17 and s>.42:
            r,g,b=[round(c*255) for c in colorsys.hsv_to_rgb(.46,s*.8,v*.88)]
        pixels.append((r,g,b,a))
    p.putdata(pixels)
    p.save(mint_folder / f'{name}.png')

# Contact sheet is for checking extraction only, not an animation preview.
contact = Image.new('RGB', (1000, 1000), '#283140')
draw = ImageDraw.Draw(contact)
for i, name in enumerate(manifest):
    p = Image.open(out / f'{name}.png')
    p.thumbnail((220, 205))
    x, y = (i % 4)*250, (i // 4)*250
    contact.paste(p, (x+(250-p.width)//2, y+25), p)
    draw.text((x+10, y+232), name, fill='white')
contact.save(BASE / 'parts-contact-sheet.png')
print(f'Prepared {len(manifest)} parts in {out}')
