# -*- coding: utf-8 -*-
"""Erzeugt video-src/SPRECHFASSUNGEN.md: automatische Sprechfassung aller bisherigen Sprechertexte (ohne TTS-Aufruf).

Quellen je Video:
  * SECS in <video>/render.py: Liste von Absaetzen, je Satz (Untertitel, bisher gesprochener Text).
    Untertitel = "Original", bisher gesprochen = audio/sN.txt bzw. zweites Tupelelement.
  * v03 (Fliesskomma): out/v03.vtt (Untertitel, nach out/timeline.json je Abschnitt) und sprechertext.md.
Aufruf (im Ordner common): ../.venv/Scripts/python sprechfassungen_erzeugen.py
"""
import ast
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sprechen as sp  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
VIDEOS = ["v01-beispiel", "v01-python", "v01-theorie", "v02-beispiel", "v02-python", "v02-theorie",
          "v03", "v03-python-typen", "v03-toleranzrechner"]


def secs_aus_render(pfad: Path):
    baum = ast.parse(pfad.read_text(encoding="utf-8"))
    for k in baum.body:
        if isinstance(k, ast.Assign) and any(getattr(t, "id", "") == "SECS" for t in k.targets):
            ausdruck = ast.Expression(k.value)
            ast.fix_missing_locations(ausdruck)
            return eval(compile(ausdruck, str(pfad), "eval"), {"S": lambda a, b=None: (a, a if b is None else b)})
    return None


def vtt_cues(pfad: Path):
    cues = []
    for block in re.split(r"\n\s*\n", pfad.read_text(encoding="utf-8").strip()):
        z = block.strip().splitlines()
        for i, zeile in enumerate(z):
            m = re.match(r"(\d+):(\d+):([\d.]+) -->", zeile)
            if m:
                t = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
                cues.append((t, " ".join(z[i + 1:])))
    return cues


def absaetze_v03():
    tl = json.loads((ROOT / "v03/out/timeline.json").read_text(encoding="utf-8"))
    cues = vtt_cues(ROOT / "v03/out/v03.vtt")
    bisher = {}
    for m in re.finditer(r"^## s(\d+)[^\n]*\n(.*?)(?=^## |\Z)", (ROOT / "v03/sprechertext.md").read_text(encoding="utf-8"), re.S | re.M):
        bisher[int(m.group(1))] = m.group(2).strip()
    out = []
    for i in sorted(int(k) for k in tl if k.isdigit()):
        a, b = tl[str(i)]["start"], tl[str(i)]["start"] + tl[str(i)]["len"]
        orig = " ".join(t for s, t in cues if a <= s < b)
        out.append((orig, bisher.get(i, "")))
    return out


def absaetze(video: str):
    if video == "v03":
        return ("out/v03.vtt (Untertitel je Abschnitt laut out/timeline.json) + sprechertext.md (bisheriger Sprechtext)",
                absaetze_v03())
    secs = secs_aus_render(ROOT / video / "render.py")
    erg = []
    for i, s in enumerate(secs, 1):
        orig = " ".join(a for a, _ in s)
        pfad = ROOT / video / "audio" / f"s{i}.txt"
        bisher = pfad.read_text(encoding="utf-8") if pfad.exists() else " ".join(b for _, b in s)
        erg.append((orig, bisher))
    return ("render.py, Liste SECS (Untertitel = Original; bisher gesprochen = audio/s1..s6.txt bzw. SECS, 2. Tupelelement)", erg)


def main():
    z = ["# Automatische Sprechfassungen der bisherigen Videos",
         "",
         "Erzeugt mit `video-src/common/sprechfassungen_erzeugen.py` (keine TTS-Aufrufe). **Original** = Untertitel/Quelltext mit Ziffern, "
         "**Sprechfassung** = `sprechfassung(Original)`, **bisher** = der bisher vertonte, von Hand ausgeschriebene Text. "
         "Die Original-Texte enthalten noch kein Markup (keine Backticks, kein `[[A|B]]`); Code erscheint deshalb ohne Backticks und wird "
         "mit PRÜFEN markiert. PRÜFEN = Automatik klingt vermutlich schlecht oder ist mehrdeutig.",
         ""]
    gesamt = 0
    for v in VIDEOS:
        quelle, aps = absaetze(v)
        z += [f"## {v}", "", f"Quelle: `video-src/{v}/` – {quelle}", ""]
        for i, (orig, bisher) in enumerate(aps, 1):
            sf, _ = sp._verarbeite(orig)
            hinweise = sp.pruefen(orig)
            gesamt += len(hinweise)
            z += [f"### {v} · Absatz {i}", "", f"**Original:** {orig}", "", f"**Sprechfassung:** {sf}", ""]
            if bisher:
                z += [f"**bisher:** {bisher}", ""]
            for h in hinweise:
                z += [f"- PRÜFEN: {h}"]
            if hinweise:
                z.append("")
    z[3:3] = []
    z.insert(4, f"Gesamt: {gesamt} PRÜFEN-Stellen.")
    z.insert(5, "")
    (ROOT / "SPRECHFASSUNGEN.md").write_text("\n".join(z) + "\n", encoding="utf-8")
    print("PRÜFEN-Stellen:", gesamt)


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    main()
