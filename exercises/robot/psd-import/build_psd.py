"""Package the existing robot PNG parts as a layered PSD for Spine import practice.
Requires psd-tools==1.11.0 and Pillow. Does not generate new artwork or a Spine rig.
"""
from pathlib import Path
import json, math
from PIL import Image
from psd_tools import PSDImage

HERE = Path(__file__).resolve().parent
ROBOT = HERE.parent
source = json.loads((ROBOT / 'robot-editor-4.3.json').read_text())
skin = next(s for s in source['skins'] if s['name'] == 'mint')['attachments']
world = {}
for b in source['bones']:
    px, py, pr = world.get(b.get('parent'), (0, 0, 0))
    t = math.radians(pr)
    x, y = b.get('x', 0), b.get('y', 0)
    world[b['name']] = (px+x*math.cos(t)-y*math.sin(t), py+x*math.sin(t)+y*math.cos(t), pr+b.get('rotation',0))
psd = PSDImage.new('RGBA', (640,800))
manifest = {'canvas':[640,800], 'origin':[320,750], 'source':'../robot-editor-4.3.json setup layout and existing mint PNGs', 'layers':[]}
preview = Image.new('RGBA', (640,800))
for slot in source['slots']:
    name = slot['name']
    attachment = skin[name][slot['attachment']]
    bx,by,br = world[slot['bone']]
    t = math.radians(br)
    ax,ay = attachment.get('x',0),attachment.get('y',0)
    cx,cy = bx+ax*math.cos(t)-ay*math.sin(t),by+ax*math.sin(t)+ay*math.cos(t)
    angle = br+attachment.get('rotation',0)
    path = attachment.get('path',name)
    im = Image.open(ROBOT/'images'/'parts'/f'{path}.png').convert('RGBA')
    im = im.resize((round(attachment['width']),round(attachment['height'])),Image.Resampling.LANCZOS)
    if angle % 360:
        im = im.rotate(angle,Image.Resampling.BICUBIC,expand=True)
    left,top = round(320+cx-im.width/2),round(750-cy-im.height/2)
    layer_name = f'{name} [bone:{name}] [slot:{name}] [skin:mint]'
    psd.create_pixel_layer(im,name=layer_name,top=top,left=left)
    preview.alpha_composite(im,(left,top))
    manifest['layers'].append({'name':name,'psd_name':layer_name,'image':path,'box':[left,top,left+im.width,top+im.height],'layer_center_in_spine':[left+im.width/2-320,750-top-im.height/2], 'alpha_bounds_in_layer':list(im.getchannel('A').getbbox()), 'expected_trimmed_center_in_spine':[left+(im.getchannel('A').getbbox()[0]+im.getchannel('A').getbbox()[2])/2-320,750-top-(im.getchannel('A').getbbox()[1]+im.getchannel('A').getbbox()[3])/2]})
# The marker is metadata for Spine; Spine does not output this layer as an image.
psd.create_pixel_layer(Image.new('RGBA',(2,2),(255,0,255,255)),name='origin [origin]',top=749,left=319)
psd.save(HERE/'robot-layers.psd')
preview.save(HERE/'expected-layout.png')
(HERE/'layer-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
reopened = PSDImage.open(HERE/'robot-layers.psd')
assert len(reopened)==16
print('PSD:',reopened.size,'layers:',len(reopened),'bytes:',(HERE/'robot-layers.psd').stat().st_size)
print('psd-tools saved and reopened the 15 robot layers plus origin marker.')
