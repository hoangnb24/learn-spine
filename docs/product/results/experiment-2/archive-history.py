"""Pack historical raw runs without deleting or rewriting their measurements."""
import pathlib,hashlib,json,tarfile
root=pathlib.Path(__file__).resolve().parent
archive=root/'archive';archive.mkdir(exist_ok=True)
for run in ['run-01','run-02']:
 folder=root/run
 inventory=[{'path':str(p.relative_to(folder)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(folder.rglob('*')) if p.is_file() and p.name!='inventory.json']
 (folder/'inventory.json').write_text(json.dumps(inventory,indent=2)+'\n')
 groups={kind:[p for p in folder.iterdir() if p.name.startswith(kind)] for kind in ['scarf','jelly','ik']}
 groups['history']=[p for p in folder.iterdir() if not any(p.name.startswith(k) for k in ['scarf','jelly','ik'])]
 for name,paths in groups.items():
  if not paths:continue
  target=archive/f'{run}-{name}.tar.gz'
  with tarfile.open(target,'w:gz') as tar:
   for path in sorted(paths):tar.add(path,arcname=str(path.relative_to(root)))
  print(target.name,target.stat().st_size)
