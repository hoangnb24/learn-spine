"""Make correctly timed review GIFs from existing, inspected editor pose captures.
Does not export Spine data or record live playback.
"""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]
out=root/'exercises/robot/editor-review'
out.mkdir(exist_ok=True)
report={}
for name,folder,crop in [('idle','handbuilt-idle-review',(445,140,610,480)),('wave','handbuilt-wave-ik-review',(350,140,595,480))]:
    source=root/'exercises/robot/evidence'/folder
    frames=[Image.open(source/f'frame-{i:02}.jpg').convert('RGB').crop(crop) for i in range(60)]
    target=out/f'{name}-2s.gif'
    frames[0].save(target,save_all=True,append_images=frames[1:],duration=[30,30,40]*20,loop=0,disposal=2)
    gif=Image.open(target);duration=0
    for i in range(gif.n_frames):
        gif.seek(i);duration+=gif.info.get('duration',0)
    assert duration==2000
    report[name]={'source':str(source.relative_to(root)),'source_frames':'0..59; endpoint 60 excluded','crop':crop,'duration_ms':duration,'gif_frames':gif.n_frames,'scope':'30 sampled editor poses per second, historical orange skin; not live recording or Spine export'}
(out/'sources.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
