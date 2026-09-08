from pathlib import Path
import json,math
from PIL import Image,ImageDraw,ImageFont
p=Path(__file__).resolve().parents[1];d=p/'exercises/path-turnaround'
samples={'chain': [[-704.08,-320.28,22.47,1],[-611.67,-282.06,352.79,1],[-462.86,-300.89,335.837,1]],'scale': [[-704.08,-320.28,22.47,2.8968],[-436.39,-209.57,333.725,1.917],[-178.56,-336.86,319.418,3.695]],'scale-length':[[-704.08,-320.28,34.668,1.0013],[-621.72,-263.33,19.726,.995],[-481.24,-212.95,1.061,1.009]]}
result={'source':'Manual World readback, Spine 4.3.25 Trial. Rounded UI values; not project export.','positionPercent':25,'lengths':[100,150,80],'samples':{},'calculation':'Tip = World origin + length * scaleX * (cos(rotation), sin(rotation)); same parent, no shear. Rounded inputs limit precision.'}
for name,rows in samples.items():
 tips=[(x+length*scale*math.cos(math.radians(rot)),y+length*scale*math.sin(math.radians(rot))) for (x,y,rot,scale),length in zip(rows,[100,150,80])]
 gaps=[math.dist(tips[i],rows[i+1][:2]) for i in range(2)]
 result['samples'][name]={'spacing':'Length 0' if name=='scale-length' else 'Percent 25','rotationMode':'Chain' if name=='chain' else 'Chain Scale','worldXYRotationScaleX':rows,'computedTips':tips,'computedJointGaps':gaps}
 if name=='scale':result['samples'][name]['computedLastTipToPathEndDistance']=math.dist(tips[2],[45.934,-529.15])
print(json.dumps(result,indent=2))
(d/'chain-readback.json').write_text(json.dumps(result,indent=2)+'\n')
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',24)
canvas=Image.new('RGB',(1524,2*(425+48)), '#20252c');draw=ImageDraw.Draw(canvas)
for i,(filename,label) in enumerate([('tangent-settings','Tangent | Percent 25'),('chain-settings','Chain | Percent 25'),('scale-settings','Chain Scale | Percent 25'),('scale-length-settings','Chain Scale | Length 0')]):
 im=Image.open(d/'chain-evidence'/f'{filename}.png').crop((0,90,1048,540));im.thumbnail((752,425))
 x=(i%2)*762;y=(i//2)*473
 draw.text((x+12,y+10),label,font=font,fill='white');canvas.paste(im,(x,y+48))
canvas.save(d/'chain-evidence/comparison.jpg',quality=92)
