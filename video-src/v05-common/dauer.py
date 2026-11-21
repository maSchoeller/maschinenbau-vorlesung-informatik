"""Zeigt die echte Dauer aus den vorhandenen Audios: python dauer.py <video-ordner>"""
import sys, os, importlib.util
vdir = os.path.abspath(sys.argv[1])
sys.path.insert(0, os.path.join(vdir)); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("r", os.path.join(vdir, "render.py")); r = importlib.util.module_from_spec(spec); spec.loader.exec_module(r)
tl = r.build_timeline(vdir, r.SECS)
print("Gesamt", round(tl["total"], 1), "s =", f"{int(tl['total']//60)}:{int(tl['total']%60):02d}")
for i in range(1, tl["n"] + 1):
    s = tl[i]; print(i, "start", round(s["start"], 1), "len", round(s["len"], 1), [(round(a, 1), round(b, 1)) for a, b in s["chunks"]])
