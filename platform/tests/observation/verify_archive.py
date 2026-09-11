"""Independent stdlib validation of the browser-produced observation archive."""
import hashlib
import json
import pathlib
import zipfile

root = pathlib.Path(__file__).resolve().parents[2] / 'evidence' / 'issue-11'
with zipfile.ZipFile(root / 'sequence.zip') as archive:
    assert archive.testzip() is None
    manifest = json.loads(archive.read('manifest.json'))
    assert manifest['revision'] == 0
    assert len(manifest['frames']) == 12
    assert len(archive.namelist()) == 13
    for index, frame in enumerate(manifest['frames']):
        assert frame['time'] == index / 6
        data = archive.read(frame['file'])
        assert data == (root / frame['file']).read_bytes()
        assert data[:8] == b'\x89PNG\r\n\x1a\n'
        assert int.from_bytes(data[16:20], 'big') == 640
        assert int.from_bytes(data[20:24], 'big') == 480
    print('PASS: ZIP CRCs, 12 PNG byte matches, 640x480 dimensions, times and revision 0')
    print('ZIP SHA-256:', hashlib.sha256((root / 'sequence.zip').read_bytes()).hexdigest())
