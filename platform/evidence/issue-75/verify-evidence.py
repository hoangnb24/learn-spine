"""Verify durable artifacts, without claiming a replay or inferring native availability."""
from pathlib import Path
import hashlib
import json
import math
import zipfile

HERE = Path(__file__).resolve().parent
runtime = "3cbd7443a9b0869959b35fe29eb2ca0f0c752276"
native = json.loads((HERE / "native-final-3cbd7443/raw-calls.json").read_text())
assert native["runtimeCommit"] == runtime
assert native["classification"] == "actual-native-webmcp-document-and-real-editor-UI"

def result(call):
    texts = [item["text"] for item in call["raw"]["content"] if "text" in item]
    parsed = json.loads(texts[0])
    assert parsed["ok"], parsed
    return parsed["value"]

calls = native["calls"]
assert len(calls) == 11
caps = [result(c) for c in calls if c["name"] == "get_capabilities"]
assert all(c["transport"] == "webmcp-document" for c in caps)
assert caps[0]["revision"] == 5 and caps[1]["revision"] == 11
inspections = [result(c) for c in calls if c["name"] == "inspect_composition"]
assert [c["revision"] for c in inspections] == [7, 9, 10, 11]
assert [next(t for t in c["items"] if t["id"] == "wave")["alpha"] for c in inspections] == [.5, .5, .8, .5]
poses = [result(c) for c in calls if c["name"] == "evaluate_pose"]
assert [p["revision"] for p in poses] == [7, 11]
for p in poses:
    assert p["target"] == {"kind": "composition", "compositionId": "motion"}
    assert p["sampledTime"] == .5 and "animationId" not in p
    assert p["bones"]["root"][4] == 200 and p["bones"]["body"][5] == 290
for field in ["bones", "regions", "meshes"]:
    assert poses[0][field] == poses[1][field], field
ui = native["ui"]
assert ui[-1]["geometryEqualsBefore"] is True
assert ui[-1]["stage"] == [{"revision": "11", "target": '{"kind":"composition","compositionId":"motion"}', "time": "0.5"}]
assert "Bản nháp của bạn vẫn còn" in ui[2]["snapshot"]
assert "Áp dụng phối chuyển động\" [disabled]" in ui[2]["snapshot"]

browser = json.loads((HERE / "browser/authoring.json").read_text())
assert browser["classification"] == "browser-ui-not-native"
with zipfile.ZipFile(HERE / "browser/authored.zip") as archive:
    project_name = next(n for n in archive.namelist() if n.endswith("project.json"))
    assert json.loads(archive.read(project_name)) == browser["project"]
transition = json.loads((HERE / "browser/transition.json").read_text())
assert transition["coverageAtomic"] and transition["deformAtomic"]
assert len(transition["samples"]) == 5
for sample, expected in zip(transition["samples"], [290, 294, 306, 310, 310]):
    assert math.isclose(sample["bones"]["body"][5], expected, abs_tol=1e-9)
    assert sample["bones"]["root"][4] == 40
for png in HERE.rglob("*.png"):
    assert png.read_bytes().startswith(b"\x89PNG\r\n\x1a\n"), png
for webm in (HERE / "browser").glob("*.webm"):
    assert webm.read_bytes().startswith(b"\x1a\x45\xdf\xa3"), webm
manifest = json.loads((HERE / "sha256.json").read_text())
for path, digest in manifest.items():
    assert hashlib.sha256((HERE / path).read_bytes()).hexdigest() == digest, path
print("PASS: native transport/provenance, UI edits/undo/reopen geometry, browser ZIP and transition samples, media signatures and hashes")
