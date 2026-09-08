from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageChops
import json
root=Path(__file__).resolve().parents[1]
p=root/'exercises/path-turnaround/rope-evidence'
files=sorted((p/'poses').glob('*.png'))
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',18)
crop=(165,120,915,390)
frames=[Image.open(f).convert('RGB').crop(crop) for f in files]
canvas=Image.new('RGB',(4*375,8*165),'#20252c')
d=ImageDraw.Draw(canvas)
for i,(f,im) in enumerate(zip(files,frames)):
 x=(i%4)*375;y=(i//4)*165
 d.text((x+8,y+4),'Frame '+f.stem,font=font,fill='white')
 canvas.paste(im.resize((375,135)),(x,y+28))
canvas.save(p/'poses.jpg',quality=94)
frames[0].save(p/'rope-travel.gif',save_all=True,append_images=frames[1:-1],duration=[70,60,70]*10,loop=0,optimize=False)
diff=ImageChops.difference(frames[0],frames[-1])
result={'source':'Spine editor screenshots, frames selected on Timeline; not Spine export or continuous screen recording','crop':crop,'sampleFrames':[int(f.stem) for f in files],'endpointCropDifferenceBBox':diff.getbbox(),'gifFrames':30,'gifDurationMs':2000,'notes':'Frame labels in contact sheet come from requested Timeline positions; originals retain displayed current frame. Inspect contact sheet for visual quality. Screenshot equality is limited to this viewport crop.'}
(p/'review.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
