"""Verify committed native calls/PNG blocks and separately produced bridge ZIPs."""
import hashlib
import json
import pathlib
import zipfile

root = pathlib.Path(__file__).resolve().parent
native = json.loads((root / 'native-final-3c601497/raw-calls.json').read_text())
assert native['runtimeCommit'] == '3c60149781754e1e7aad5de276037b90810be237'
assert native['classification'] == 'actual-native-webmcp-document'
assert native['error'] is None
assert len(native['calls']) == 49
png_index = 0
errors = []
for call in native['calls']:
    result = json.loads(next(c['text'] for c in call['raw']['content'] if c['type'] == 'text'))
    if not result['ok']:
        errors.append((call['name'], result['error']['code']))
    if call['name'] == 'read_artifact' and result['ok']:
        output = result['value']
        assert output['revision'] in (1, 3)
        assert output['target']['kind'] == 'composition'
        if output['artifact']['mimeType'] == 'image/png':
            frame = output['artifact']['frame']
            assert frame['revision'] == output['revision']
            assert frame['target'] == output['target']
            assert 'animationId' not in frame
    for block in call['raw']['content']:
        if block['type'] == 'image':
            import base64
            data = base64.b64decode(block['data'])
            path = root / 'native-final-3c601497' / f'image-{png_index}.png'
            assert path.read_bytes() == data
            assert data[:8] == b'\x89PNG\r\n\x1a\n'
            assert int.from_bytes(data[16:20], 'big') == 640
            assert int.from_bytes(data[20:24], 'big') == 640
            png_index += 1
assert png_index == 18
assert errors == [('put_composition', 'REVISION_CONFLICT'), ('evaluate_pose', 'INVALID_INPUT'),
                  ('evaluate_pose', 'MISSING_REFERENCE'), ('put_composition', 'INVALID_INPUT')]
print('PASS: 49 actual native calls, 4 intended error controls, 18 PNGs match raw MCP blocks; canonical artifact provenance')
probes = json.loads((root / 'native-final-3c601497/reviewer-frozen-source-probes.json').read_text())
assert probes['runtimeCommit'] == native['runtimeCommit']
assert len(probes['calls']) == 5
poses = []
for call in probes['calls']:
    result = json.loads(next(c['text'] for c in call['raw']['content'] if c['type'] == 'text'))
    assert result['ok']
    if call['name'] == 'evaluate_pose':
        poses.append((result['value']['revision'], result['value']['bones']['body'][5]))
assert poses == [(3, 290), (4, 270), (5, 290)]
print('PASS: 5 independent native frozen-source probes, bodyY290→270→290 and revisions3→4→5')
for sequence, revision, target in [(0, 1, 'motion'), (1, 3, 'stop-motion')]:
    path = root / 'browser-bridge' / f'sequence-{sequence}.zip'
    with zipfile.ZipFile(path) as archive:
        assert archive.testzip() is None
        manifest = json.loads(archive.read('manifest.json'))
        assert manifest['revision'] == revision
        assert manifest['target'] == {'kind': 'composition', 'compositionId': target}
        assert manifest['fit'] == 'continuous-composition-envelope'
        assert len(manifest['frames']) == 8
        assert len(archive.namelist()) == 9
        for i, frame in enumerate(manifest['frames']):
            assert frame['revision'] == revision
            assert frame['target'] == manifest['target']
            assert 'animationId' not in frame
            assert frame['boundsKind'] == 'continuous-target-envelope'
            assert archive.read(frame['file']) == (root / 'browser-bridge' / f'frame-{1 + sequence * 8 + i:02}.png').read_bytes()
    print(f'PASS: bridge ZIP {sequence}, 8 PNG byte matches, target={target}, revision={revision}, SHA256={hashlib.sha256(path.read_bytes()).hexdigest()}')
print('Native ZIP browser download is NOT TESTED; native artifact creation/read and separate bridge ZIPs are distinct evidence.')
