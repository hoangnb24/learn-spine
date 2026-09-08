"""Create a geometric marker fixture for the mix-and-match skins exercise."""
from pathlib import Path
from PIL import Image, ImageDraw

image = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)
draw.ellipse((1, 1, 30, 30), fill='#ffe067', outline='#243044', width=2)
draw.line((9, 16, 23, 16), fill='#243044', width=3)
draw.line((16, 9, 16, 23), fill='#243044', width=3)
image.save(Path(__file__).resolve().parents[1] / 'exercises/mesh-lab/skin-badge.png')
