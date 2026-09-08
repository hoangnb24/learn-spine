"""Verify PNGs actually written by Spine against the input PSD (no UI access)."""
from pathlib import Path
import json
from PIL import Image, ImageChops
from psd_tools import PSDImage

HERE = Path(__file__).resolve().parent
psd = PSDImage.open(HERE/'robot-layers.psd')
rows = []
for layer in psd:
    if '[origin]' in layer.name:
        continue
    name = layer.name.split(' [')[0]
    source = layer.topil().convert('RGBA')
    source = source.crop(source.getchannel('A').getbbox())
    output = Image.open(HERE/'imported-images'/'mint'/f'{name}.png').convert('RGBA')
    expected_size = (source.width+2, source.height+2)
    assert output.size == expected_size, (name, output.size, expected_size)
    inside = output.crop((1,1,output.width-1,output.height-1))
    assert ImageChops.difference(source.getchannel('A'),inside.getchannel('A')).getbbox() is None, name
    assert all(a[:3] == b[:3] for a,b in zip(source.getdata(),inside.getdata()) if a[3]), name
    rows.append({'name':name,'output_size':list(output.size),'expected_size_with_padding':list(expected_size),'alpha_equal':True,'max_rgb_error_where_alpha_nonzero':0})
assert len(rows) == 15
assert len(list((HERE/'imported-images').rglob('*.png'))) == 15
report = json.loads((HERE/'import-checks.json').read_text())
report['layers'] = rows
(HERE/'import-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('PASS: all 15 imported PNGs match PSD layer pixels and trim/padding sizes.')
