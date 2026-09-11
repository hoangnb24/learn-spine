"""Append-only observer. No project mutation endpoint and no solution actions."""
from http.server import BaseHTTPRequestHandler,HTTPServer
from pathlib import Path
import json,re
OUT=Path(__file__).resolve().parents[3]/'docs/product/results/experiment-3/runs'
class Handler(BaseHTTPRequestHandler):
 def do_OPTIONS(self):
  self.send_response(204); self.send_header('Access-Control-Allow-Origin','*'); self.send_header('Access-Control-Allow-Headers','Content-Type'); self.end_headers()
 def do_POST(self):
  run=self.path[1:]
  if not re.fullmatch('[a-z0-9-]+',run): self.send_error(400); return
  body=self.rfile.read(int(self.headers['Content-Length'])); row=json.loads(body)
  directory=OUT/run; directory.mkdir(parents=True,exist_ok=True)
  with (directory/'events.jsonl').open('ab') as f: f.write(body+b'\n')
  self.send_response(204); self.send_header('Access-Control-Allow-Origin','*');self.end_headers()
HTTPServer(('127.0.0.1',4211),Handler).serve_forever()
