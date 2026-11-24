"""Package the offline web files and Android APK for an F95 download mirror."""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
import sys


root = Path(__file__).resolve().parents[1]
web = root / "dist"
apk = root / "android/app/build/outputs/apk/debug/app-debug.apk"
target = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "RECLAIM-v0.1-F95.zip"
if not (web / "index.html").is_file() or not apk.is_file():
    raise SystemExit("Build the web game and Android APK before packaging.")
html = (web / "index.html").read_text(encoding="utf-8")
if 'src="./assets/' not in html:
    raise SystemExit("The web build must use relative asset paths. Run npm run build:android.")

readme = """RECLAIM 0.1 — release bundle

Android: install Android/RECLAIM-v0.1-debug.apk. This is a debug-signed APK.
Web: the game files are at the ZIP root. Serve this folder with a local HTTP
server, then open its address in a browser. For example, if Python is installed:
    python -m http.server 8000
    http://localhost:8000/
Opening index.html directly as a file may be blocked by browser module security.
Online version: https://larionadd.github.io/reclaim-game/

Language can be selected on the title screen: English, Ukrainian, or Russian.
Save data stays in the browser or Android app on the user's device.
"""

target.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(target, "w", compression=ZIP_DEFLATED, compresslevel=6) as archive:
    for path in sorted(web.rglob("*")):
        if path.is_file():
            archive.write(path, path.relative_to(web).as_posix())
    archive.write(apk, "Android/RECLAIM-v0.1-debug.apk")
    archive.writestr("README.txt", readme)

with ZipFile(target) as archive:
    names = archive.namelist()
    assert names.count("index.html") == 1
    assert "Android/RECLAIM-v0.1-debug.apk" in names
    assert all("\\" not in name for name in names)
    assert archive.testzip() is None
print(f"Packaged {target} ({target.stat().st_size:,} bytes; {len(names)} files)")
