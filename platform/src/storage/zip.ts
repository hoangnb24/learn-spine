/** Small strict ZIP boundary: STORE/DEFLATE only, single disk, no ZIP64. */
export const MAX_BYTES = 200 * 1024 * 1024;
export class StorageProblem extends Error {
  constructor(public code: import('../model').Problem['code'], message: string, public path = '') { super(message); }
}
export function check(signal?: AbortSignal) { if (signal?.aborted) throw new StorageProblem('CANCELLED', 'Operation cancelled'); }
export function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const b of bytes) { crc ^= b; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
  return (crc ^ 0xffffffff) >>> 0;
}
const safe = (name: string) => name === 'project.json' || /^assets\/[A-Za-z0-9_-]+\.png$/.test(name);
export function zip(files: Map<string, Uint8Array>): Uint8Array {
  const encoder = new TextEncoder();
  const size = [...files].reduce((n, [name,b]) => n + 76 + encoder.encode(name).length * 2 + b.length,22);
  const out = new Uint8Array(size), v = new DataView(out.buffer); let pos = 0;
  const entries: { name: Uint8Array; bytes: Uint8Array; offset: number; crc: number }[] = [];
  for (const [name, bytes] of files) {
    const n = encoder.encode(name), crc = crc32(bytes), offset = pos;
    v.setUint32(pos,0x04034b50,true); v.setUint16(pos+4,20,true); v.setUint32(pos+14,crc,true);
    v.setUint32(pos+18,bytes.length,true); v.setUint32(pos+22,bytes.length,true); v.setUint16(pos+26,n.length,true);
    out.set(n,pos+30); out.set(bytes,pos+30+n.length); pos += 30+n.length+bytes.length; entries.push({name:n,bytes,offset,crc});
  }
  const start = pos;
  for (const e of entries) {
    v.setUint32(pos,0x02014b50,true); v.setUint16(pos+4,20,true); v.setUint16(pos+6,20,true);
    v.setUint32(pos+16,e.crc,true); v.setUint32(pos+20,e.bytes.length,true); v.setUint32(pos+24,e.bytes.length,true);
    v.setUint16(pos+28,e.name.length,true); v.setUint32(pos+42,e.offset,true); out.set(e.name,pos+46); pos+=46+e.name.length;
  }
  v.setUint32(pos,0x06054b50,true); v.setUint16(pos+8,entries.length,true); v.setUint16(pos+10,entries.length,true);
  v.setUint32(pos+12,pos-start,true); v.setUint32(pos+16,start,true); return out;
}
export async function unzip(input: Uint8Array, signal?: AbortSignal): Promise<Map<string,Uint8Array>> {
  check(signal);
  if (input.length > MAX_BYTES + 1024*1024) throw new StorageProblem('LIMIT_EXCEEDED','Archive too large');
  // Own the archive before DEFLATE yields; Buffer.slice() is only a view.
  input = new Uint8Array(input);
  const v = new DataView(input.buffer,input.byteOffset,input.byteLength);
  const bad = () => new StorageProblem('INVALID_INPUT','Malformed or unsupported ZIP');
  if (input.length < 22) throw bad();
  let end = input.length -22;
  while (end >= Math.max(0,input.length-65557) && v.getUint32(end,true)!==0x06054b50) end--;
  if (end<0 || v.getUint32(end,true)!==0x06054b50 || end+22+v.getUint16(end+20,true)!==input.length) throw bad();
  const count=v.getUint16(end+10,true), start=v.getUint32(end+16,true);
  if(v.getUint16(end+4,true)||v.getUint16(end+6,true)||v.getUint16(end+8,true)!==count||start+v.getUint32(end+12,true)!==end) throw bad();
  if(count>257) throw new StorageProblem('LIMIT_EXCEEDED','Too many archive entries');
  const files=new Map<string,Uint8Array>(); let pos=start,total=0; const ranges: [number,number][]=[];
  for(let i=0;i<count;i++) {
    check(signal);
    if(pos+46>end||v.getUint32(pos,true)!==0x02014b50) throw bad();
    const flags=v.getUint16(pos+8,true), method=v.getUint16(pos+10,true), crc=v.getUint32(pos+16,true);
    const compressed=v.getUint32(pos+20,true), size=v.getUint32(pos+24,true), n=v.getUint16(pos+28,true), extra=v.getUint16(pos+30,true), comment=v.getUint16(pos+32,true), offset=v.getUint32(pos+42,true);
    if(pos+46+n+extra+comment>end || flags & ~0x808 || ![0,8].includes(method) || v.getUint16(pos+34,true) || ((v.getUint32(pos+38,true)>>>16)&0xf000)===0xa000) throw bad();
    const name=new TextDecoder('utf-8',{fatal:true}).decode(input.subarray(pos+46,pos+46+n));
    if(!safe(name)) throw new StorageProblem('UNSAFE_PATH','Unsafe archive path',name);
    if(files.has(name)) throw new StorageProblem('INVALID_INPUT','Duplicate ZIP entry',name);
    total+=size; const limit=name==='project.json'?MAX_BYTES:20*1024*1024;
    if(size>limit||total>MAX_BYTES) throw new StorageProblem('LIMIT_EXCEEDED','Declared decompressed size exceeds budget',name);
    if(offset+30>start||v.getUint32(offset,true)!==0x04034b50) throw bad();
    const ln=v.getUint16(offset+26,true), le=v.getUint16(offset+28,true), data=offset+30+ln+le;
    if(data+compressed>start||v.getUint16(offset+6,true)!==flags||v.getUint16(offset+8,true)!==method||new TextDecoder().decode(input.subarray(offset+30,offset+30+ln))!==name) throw bad();
    if(!(flags&8)&&(v.getUint32(offset+14,true)!==crc||v.getUint32(offset+18,true)!==compressed||v.getUint32(offset+22,true)!==size)) throw bad();
    let bytes:Uint8Array;
    if(method===0) bytes=input.slice(data,data+compressed);
    else {
      const reader=new Blob([input.slice(data,data+compressed)]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
      const chunks:Uint8Array[]=[]; let actual=0;
      try { while(true) { check(signal); const r=await reader.read(); if(r.done) break; actual+=r.value.length; if(actual>size||actual>limit) throw new StorageProblem('LIMIT_EXCEEDED','Actual decompressed size exceeds budget',name); chunks.push(r.value); } }
      finally { await reader.cancel().catch(()=>{}); }
      bytes=new Uint8Array(actual); let at=0; for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}
    }
    if(bytes.length!==size||crc32(bytes)!==crc) throw bad();
    let localEnd=data+compressed;
    if(flags&8) { const signature=v.getUint32(localEnd,true)===0x08074b50; const d=localEnd+(signature?4:0); if(d+12>start||v.getUint32(d,true)!==crc||v.getUint32(d+4,true)!==compressed||v.getUint32(d+8,true)!==size) throw bad(); localEnd=d+12; }
    ranges.push([offset,localEnd]); files.set(name,bytes);pos+=46+n+extra+comment;
  }
  ranges.sort((a,b)=>a[0]-b[0]); let covered=0; for(const [from,to] of ranges) {if(from!==covered) throw bad();covered=to;}
  if(pos!==end||covered!==start) throw bad();
  return files;
}
