"""Generate an independent diagnostic palette fixture; preserve the source asset."""
from pathlib import Path
from PIL import Image, ImageDraw

output = Path(__file__).resolve().parents[1] / 'exercises/mesh-lab/strip-variant.png'
image = Image.new('RGBA', (256, 96), '#f6edd7')
draw = ImageDraw.Draw(image)
draw.rectangle((0, 0, 255, 29), fill='#9254d6')
draw.rectangle((0, 66, 255, 95), fill='#fb6b75')
for x in range(0, 256, 32):
    draw.line((x, 0, x, 95), fill='#665b50', width=1)
draw.rectangle((1, 1, 254, 94), outline='#243044', width=3)
image.save(output)
