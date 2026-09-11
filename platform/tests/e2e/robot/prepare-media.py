"""Validate native output and make viewable video/contact sheets from exact PNGs."""
from pathlib import Path
import json,zipfile,hashlib,subprocess,tempfile
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[4];out=root/'docs/product/results/experiment-1';fixture=root/'platform/fixtures/robot/native-project.zip'
report={}
with zipfile.ZipFile(fixture) as z:
 assert z.testzip() is None
 p=json.loads(z.read('project.json'));assert p['revision']==5
 assert set(z.namelist())=={'project.json',*[a['path'] for a in p['assets']]}
 for a in p['assets']:assert hashlib.sha256(z.read(a['path'])).hexdigest()==a['sha256']
 assert (out/'editor-export.zip').read_bytes()==fixture.read_bytes()
 report['project']={'revision':p['revision'],'assets':len(p['assets']),'sha256':hashlib.sha256(fixture.read_bytes()).hexdigest(),'editorExportByteIdentical':True,'onlyProjectAndAssets':True}
for name,frames in [('idle',72),('wave',144)]:
 with zipfile.ZipFile(out/f'{name}-preview.zip') as z:
  assert z.testzip() is None
  m=json.loads(z.read('manifest.json'));assert m['revision']==5 and m['fps']==12 and len(m['frames'])==frames
  sequence=[z.read(f['file']) for f in m['frames']]
  assert all(sequence[n]==sequence[n%(frames//3)] for n in range(frames))
  with tempfile.TemporaryDirectory() as tmp:
   for n,b in enumerate(sequence):Path(tmp,f'frame-{n:04}.png').write_bytes(b)
   subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-framerate','12','-i',tmp+'/frame-%04d.png','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(out/f'{name}-three-loops.mp4')],check=True)
  (out/f'{name}-manifest.json').write_text(json.dumps(m,indent=2))
  report[name]={'frames':frames,'fps':12,'durationSeconds':frames/12,'loops':3,'loopPngsByteIdentical':True,'archiveSha256':hashlib.sha256((out/f'{name}-preview.zip').read_bytes()).hexdigest()}
 contact=Image.new('RGB',(1280,660),'#13202a');d=ImageDraw.Draw(contact)
 for n in range(12):
  image=Image.open(out/f'editor-{name}-{n:02}.png').convert('RGB');image.thumbnail((320,180));x=(n%4)*320;y=(n//4)*220;contact.paste(image,(x,y));d.text((x+10,y+185),f'{name} t={n*(2 if name=="idle" else 4)/12:.4f}s / rev5',fill='white')
 contact.save(out/f'{name}-contact.png')
(out/'archive-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
# Optional actual Browser playback screenshots captured by playback-review.html.
if (out/'playback-viewport.json').exists():
 rect=json.loads((out/'playback-viewport.json').read_text());box=tuple(round(x) for x in (rect['x'],rect['y'],rect['x']+rect['width'],rect['y']+rect['height']))
 for name in ['idle','wave']:
  logs=json.loads((out/f'playback-{name}-log.json').read_text());sheet=Image.new('RGB',(1200,((len(logs)+3)//4)*250),'#13202a');d=ImageDraw.Draw(sheet)
  for n,entry in enumerate(logs):
   im=Image.open(out/f'playback-{name}-{n:02}.png').convert('RGB').crop(box);im.thumbnail((300,225));x=n%4*300;y=n//4*250;sheet.paste(im,(x,y));d.text((x+5,y+227),f'{name} actual playback t={entry["log"]["currentTime"]:.3f}s',fill='white')
  sheet.save(out/f'{name}-playback-contact.png')
