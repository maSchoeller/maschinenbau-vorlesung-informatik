"""Gibt Satzstartzeiten je Abschnitt aus: python zeiten.py v04-theorie"""
import sys, os, importlib.util
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import b4
d = os.path.join(HERE, "..", sys.argv[1]); spec = importlib.util.spec_from_file_location("r", os.path.join(d, "render.py"))
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
tl = b4.build_timeline(d, m.SECS)
for i in range(1, tl["n"] + 1):
    print(i, "start", round(tl[i]["start"], 1), "len", round(tl[i]["len"], 1), "Saetze ab", [round(a, 1) for a, b in tl[i]["chunks"]])
print("Gesamt", round(tl["total"], 1), "=", int(tl["total"] // 60), "min", round(tl["total"] % 60), "s")
