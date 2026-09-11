import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const run=(command,args)=>execFileSync(command,args,{encoding:'utf8'}).trim();
writeFileSync('evidence/issue-17/environment.json',JSON.stringify({recordedAt:new Date().toISOString(),sourceCommit:run('git',['rev-parse','HEAD']),node:process.version,npm:run('npm',['--version']),platform:process.platform,architecture:process.arch,hardware:process.platform==='darwin'?{model:run('sysctl',['-n','hw.model']),cpu:run('sysctl',['-n','machdep.cpu.brand_string']),memoryBytes:run('sysctl',['-n','hw.memsize'])}:null,reference:'docs/product/results/experiment-1/environment.json; same local Mac Studio and Chromium 153/SwiftShader; no hardware GPU or cadence pass implied'},null,2)+'\n');
