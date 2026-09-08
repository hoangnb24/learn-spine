# Robot PSD import exercise

`robot-layers.psd` is the input; `imported-images/` contains PNGs written by Spine's Import PSD dialog. `expected-layout.png` is a mechanically assembled reference using the existing robot parts and the setup layout from `../robot-editor-4.3.json`, not the later handbuilt rig.

The PSD can be imported directly without Python. To rebuild it, use Python with `psd-tools==1.11.0` and Pillow (this session used Pillow 11.3.0). Run `build_psd.py`, then import through Spine as described in `../../../lessons/044-editor-import-psd.md`. Run `verify_import.py` only after Spine has written the PNGs.

The scripts package or inspect image files; they do not control Spine or create the final rig. Do not treat `import-checks.json` as an exported skeleton.
