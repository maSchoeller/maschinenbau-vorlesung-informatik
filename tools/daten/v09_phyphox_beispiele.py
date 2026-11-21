"""Erzeugt synthetische phyphox-Beispieldateien für V09 (reproduzierbar, Seed fest).

Format wie der phyphox-Export "Linear Acceleration":
- bremsen.csv:       Semikolon, Dezimalkomma (Export-Variante "CSV (Semicolon, decimal comma)")
- waschmaschine.csv: Komma, Dezimalpunkt (Export-Variante "CSV (Comma, decimal point)")
- bremsen-kaputt.csv: wie bremsen.csv, aber mit kaputten Zeilen (Übertragungsfehler, leere Werte)
"""
import math
import random
from pathlib import Path

ZIEL = Path(__file__).resolve().parents[2] / "site" / "assets" / "data" / "v09"
KOPF = ['"Time (s)"', '"Linear Acceleration x (m/s^2)"', '"Linear Acceleration y (m/s^2)"',
        '"Linear Acceleration z (m/s^2)"', '"Absolute acceleration (m/s^2)"']


def bremsen(rng):
    """Fahrrad: 4 s Rollen, 2 s Bremsen (ca. -3,5 m/s² in y), 2 s Stand. 50 Hz."""
    zeilen = []
    for i in range(400):
        t = i * 0.02
        if t < 4.0:
            ay = rng.gauss(0, 0.25)
        elif t < 6.0:
            ay = -3.5 * math.sin(math.pi * (t - 4.0) / 2.0) + rng.gauss(0, 0.35)
        else:
            ay = rng.gauss(0, 0.05)
        ax = rng.gauss(0, 0.2 if t < 6 else 0.04)
        az = rng.gauss(0, 0.6 if t < 6 else 0.05)
        zeilen.append((t, ax, ay, az, math.sqrt(ax * ax + ay * ay + az * az)))
    return zeilen


def waschmaschine(rng):
    """Schleudern: 13,3 Hz (800 1/min), Amplitude steigt an. 100 Hz, 6 s."""
    zeilen = []
    for i in range(600):
        t = i * 0.01
        amp = 0.4 + 1.6 * min(t / 4.0, 1.0)
        w = 2 * math.pi * 13.3 * t
        ax = amp * math.sin(w) + rng.gauss(0, 0.08)
        ay = 0.5 * amp * math.cos(w) + rng.gauss(0, 0.08)
        az = rng.gauss(0, 0.1)
        zeilen.append((t, ax, ay, az, math.sqrt(ax * ax + ay * ay + az * az)))
    return zeilen


def schreibe(name, zeilen, trenn, komma, kaputt=None):
    def zahl(x):
        s = f"{x:.6E}"
        return s.replace(".", ",") if komma else s
    text = [trenn.join(KOPF)]
    for i, z in enumerate(zeilen):
        werte = [zahl(v) for v in z]
        if kaputt and i in kaputt:
            art = kaputt[i]
            if art == "leer":
                werte[2] = ""
            elif art == "nan":
                werte[2] = "NaN"
            elif art == "abgeschnitten":
                werte = werte[:2]
            elif art == "text":
                werte[2] = "Fehler"
        text.append(trenn.join(werte))
    (ZIEL / name).write_text("\n".join(text) + "\n", encoding="utf-8")


if __name__ == "__main__":
    ZIEL.mkdir(parents=True, exist_ok=True)
    b = bremsen(random.Random(7))
    schreibe("bremsen.csv", b, ";", True)
    schreibe("bremsen-kaputt.csv", b, ";", True,
             kaputt={37: "leer", 120: "text", 251: "abgeschnitten", 252: "leer", 330: "text"})
    schreibe("waschmaschine.csv", waschmaschine(random.Random(11)), ",", False)
    print("geschrieben nach", ZIEL)
