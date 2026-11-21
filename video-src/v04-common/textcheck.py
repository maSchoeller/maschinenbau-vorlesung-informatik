"""Vorschau ohne Kosten: gesendeter Text je Absatz + PRUEFEN-Hinweise. Aufruf: python textcheck.py v04-theorie"""
import sys, os, importlib.util
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import b4
p = os.path.join(HERE, "..", sys.argv[1], "render.py")
spec = importlib.util.spec_from_file_location("r", p); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
tot = 0
for i, sec in enumerate(m.SRC, 1):
    sp = b4.spoken(m.SECS, i); w = len(sp.split()); tot += w
    print(f"s{i} {len(sp)}Z {w}W: {sp}")
    for s in sec:
        for h in b4.SP.pruefen(s): print("   PRUEFEN:", h, "|", s[:60])
print("Woerter", tot, "ca. Minuten", round(tot / 150, 2))
