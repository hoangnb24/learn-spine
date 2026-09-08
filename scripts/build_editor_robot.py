"""Prepare this robot's limited 4.3 editor import variant, not a general converter.
Source schema: EsotericSoftware/spine-runtimes 4.3 SkeletonJson.ts.
The original 4.2 files remain the runtime baseline.
"""
import json
from pathlib import Path
base = Path(__file__).resolve().parents[1] / 'exercises/robot'
data = json.loads((base / 'robot-ik.json').read_text())
data['skeleton']['spine'] = '4.3.23'
data['constraints'] = [dict(type='ik', **{k: v for k, v in c.items() if k != 'order'})
                       for c in sorted(data.pop('ik'), key=lambda c: c['order'])]
# A default attachment cannot share its name with a skin placeholder in the
# editor importer. Put both variants in named skins, then select one in Spine.
for skin in data['skins']:
    if skin['name'] == 'default':
        skin['name'] = 'orange'
    else:
        for slot in skin['attachments'].values():
            for attachment in slot.values():
                attachment['name'] = attachment['path']
(base / 'robot-editor-4.3.json').write_text(json.dumps(data, indent=2) + '\n')
