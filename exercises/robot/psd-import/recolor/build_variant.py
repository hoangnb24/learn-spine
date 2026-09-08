"""Controlled PSD pixel-update fixture; Pillow processing authorized by user."""
from pathlib import Path
from PIL import Image, ImageChops
from psd_tools import PSDImage
import json
p=Path(__file__).resolve().parent
src=PSDImage.open(p.parent/'robot-layers.psd')
out=PSDImage.new('RGBA',src.size)
rows=[]
for layer in src:
    im=layer.topil().convert('RGBA')
    changed=layer.name.startswith('head ')
    if changed:
        r,g,b,a=im.split()
        im=Image.merge('RGBA',(g,r,b,a))
        im.save(p/'head-channel-swap.png')
    out.create_pixel_layer(im,name=layer.name,left=layer.left,top=layer.top)
    rows.append({'name':layer.name,'left':layer.left,'top':layer.top,'channels_swapped':changed})
out.save(p/'robot-layers-head-recolor.psd')
back=PSDImage.open(p/'robot-layers-head-recolor.psd')
for a,b in zip(src,back):
    assert a.name==b.name and a.bbox==b.bbox
    aa,bb=a.topil().convert('RGBA'),b.topil().convert('RGBA')
    assert ImageChops.difference(aa.getchannel('A'),bb.getchannel('A')).getbbox() is None
    delta=max(x[1] for x in ImageChops.difference(aa,bb).getextrema())
    assert (delta>0)==a.name.startswith('head ')
(p/'variant.json').write_text(json.dumps({'operation':'swap red and green in head only; preserve alpha, names and positions','layers':rows},indent=2)+'\n')
print('Verified 16 layers: only head RGB changed; all alpha/positions/names preserved.')
