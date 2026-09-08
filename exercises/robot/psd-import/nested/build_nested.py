"""Reuse existing PSD pixels to test nested bone groups; no new artwork."""
from pathlib import Path
from psd_tools import PSDImage
from PIL import Image

HERE = Path(__file__).resolve().parent
source = PSDImage.open(HERE.parent / 'robot-layers.psd')
out = PSDImage.new('RGBA', source.size)
parts = {}
for name in ('body', 'head'):
    layer = next(layer for layer in source if layer.name.startswith(name + ' '))
    parts[name] = out.create_pixel_layer(layer.topil(), name=f'{name} [slot:{name}]',
                                         top=layer.top, left=layer.left)
head = out.create_group([parts['head']], name='head group [bone:head]')
out.create_group([parts['body'], head], name='torso group [bone:torso]')
out.create_pixel_layer(Image.new('RGBA', (2, 2), (255, 0, 255, 255)),
                       name='origin [origin]', top=749, left=319)
out.save(HERE / 'nested-robot.psd')
reopened = PSDImage.open(HERE / 'nested-robot.psd')
def dump(group, depth=0):
    for layer in group:
        print('  ' * depth + layer.name)
        if layer.is_group():
            dump(layer, depth + 1)
dump(reopened)
