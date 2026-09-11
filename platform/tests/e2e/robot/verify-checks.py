"""Run regression checks and retain exact command/output/source identity."""
from pathlib import Path
import subprocess,sys
root=Path(__file__).resolve().parents[4];platform=root/'platform';log=root/'docs/product/results/experiment-1/verification.log'
commands=[['git','rev-parse','HEAD'],['node','--version'],['npm','--version'],['npm','run','typecheck'],['npm','test'],['npm','run','build'],['npm','run','test:browser']]
with log.open('w') as f:
 for command in commands:
  f.write('\nCOMMAND: '+' '.join(command)+'\n');f.flush()
  result=subprocess.run(command,cwd=platform,stdout=f,stderr=subprocess.STDOUT)
  f.write('\nEXIT CODE: '+str(result.returncode)+'\n');f.flush()
  if result.returncode:print('Failed: '+' '.join(command)+'; see '+str(log));sys.exit(result.returncode)
print('All regression checks passed. Raw output: '+str(log))
