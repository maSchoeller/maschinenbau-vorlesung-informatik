"""Erzeugt site/assets/data/v15/wellen.csv: Durchmesser-Messungen zweier Drehmaschinen.

Soll 20,000 mm, Toleranz +-0,020 mm. 25 Stichproben je 5 Teile pro Maschine.
Maschine D1 ist mittig und ruhig, D2 liegt etwas hoch und driftet ab Stichprobe 18 (Werkzeugverschleiß).
"""
import random
from pathlib import Path

ZIEL = Path(__file__).resolve().parents[2] / "site" / "assets" / "data" / "v15"

if __name__ == "__main__":
    rng = random.Random(15)
    zeilen = ["stichprobe,maschine,schicht,teil,durchmesser_mm"]
    for s in range(1, 26):
        schicht = "Früh" if s <= 13 else "Spät"
        for maschine, mitte, sigma in (("D1", 20.000, 0.0040), ("D2", 20.006, 0.0050)):
            drift = 0.0012 * (s - 17) if (maschine == "D2" and s >= 18) else 0.0
            for t in range(1, 6):
                d = rng.gauss(mitte + drift, sigma)
                zeilen.append(f"{s},{maschine},{schicht},{t},{d:.4f}")
    ZIEL.mkdir(parents=True, exist_ok=True)
    (ZIEL / "wellen.csv").write_text("\n".join(zeilen) + "\n", encoding="utf-8")
    print(len(zeilen) - 1, "Messungen")
