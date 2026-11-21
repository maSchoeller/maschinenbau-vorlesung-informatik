"""Erzeugt die Dateien der fiktiven Fertigungszelle FZ-3 (roter Faden V16-V19).

Zelle FZ-3: Drehmaschine D2, Fräsmaschine F1, Roboter R1 (Be-/Entladen), Koordinatenmessmaschine M1.
Ergebnis: site/assets/data/v16/zelle.zip (Ordner zelle/...) - wird im Browser-Labor automatisch entpackt.
"""
import io
import random
import zipfile
from pathlib import Path

ZIEL = Path(__file__).resolve().parents[2] / "site" / "assets" / "data" / "v16"
TAGE = ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20"]
MELDUNGEN = {
    "D2": [("INFO", "Spindel an, 1450 1/min"), ("INFO", "Programm WELLE_20H6 gestartet"), ("INFO", "Teil fertig"),
           ("WARN", "Werkzeugverschleiss T4 ueber 80 %"), ("ERROR", "Kuehlmitteldruck zu niedrig")],
    "F1": [("INFO", "Programm FLANSCH_80 gestartet"), ("INFO", "Teil fertig"), ("WARN", "Spaenebehaelter fast voll"),
           ("ERROR", "Achse Z Schleppfehler")],
    "R1": [("INFO", "Greifer zu"), ("INFO", "Greifer auf"), ("INFO", "Teil abgelegt"), ("WARN", "Lichtgitter unterbrochen"),
           ("ERROR", "Not-Halt ausgeloest")],
    "M1": [("INFO", "Messung gestartet"), ("INFO", "Messung i. O."), ("WARN", "Messung n. i. O."),
           ("ERROR", "Taster nicht kalibriert")],
}
GEWICHT = {"INFO": 30, "WARN": 4, "ERROR": 1}


def logtext(rng, maschine, tag):
    zeilen = []
    for i in range(rng.randint(40, 70)):
        stufe_meld = rng.choices(MELDUNGEN[maschine], [GEWICHT[s] for s, _ in MELDUNGEN[maschine]])[0]
        h, m, s = 6 + i * 14 // 60 % 16, (i * 14) % 60, rng.randint(0, 59)
        zeilen.append(f"{tag} {h:02d}:{m:02d}:{s:02d};{stufe_meld[0]};{stufe_meld[1]}")
    return "\n".join(zeilen) + "\n"


def dateien():
    rng = random.Random(16)
    out = {}
    for maschine in MELDUNGEN:
        for tag in TAGE:
            out[f"zelle/maschinen/{maschine}/logs/{tag}.log"] = logtext(rng, maschine, tag)
    out["zelle/nc-programme/WELLE_20H6.nc"] = "%\nO1001 (WELLE 20 H6)\nG21 G90 G95\nT0404 M06\nG96 S180 M03\nG00 X22 Z2\nG01 X20 Z-60 F0.15\nG00 X100 Z100\nM30\n%\n"
    out["zelle/nc-programme/FLANSCH_80.nc"] = "%\nO2001 (FLANSCH 80)\nG21 G90 G94\nT1 M06\nS3000 M03\nG81 X30 Y0 Z-12 R2 F200\nX15 Y25.98\nX-15 Y25.98\nG80 M30\n%\n"
    out["zelle/nc-programme/alt/WELLE_20H6_v1.nc"] = "%\nO1000 (ALTE VERSION - NICHT VERWENDEN)\nM30\n%\n"
    messung = ["teil;durchmesser_mm;ergebnis"]
    for t in range(1, 21):
        d = rng.gauss(20.004, 0.005)
        ergebnis = "iO" if 19.98 <= d <= 20.02 else "niO"
        messung.append(f"{t};{d:.4f};{ergebnis}")
    out["zelle/messprotokolle/M1_D2_KW47.csv"] = "\n".join(messung) + "\n"
    out["zelle/LIESMICH.txt"] = ("Fertigungszelle FZ-3 (Halle 2)\nD2 Drehmaschine, F1 Fraesmaschine, R1 Roboter, M1 Messmaschine\n"
                                 "Logs: maschinen/<Maschine>/logs/<Datum>.log, Format: Zeit;Stufe;Meldung\n")
    return out


if __name__ == "__main__":
    ZIEL.mkdir(parents=True, exist_ok=True)
    puffer = io.BytesIO()
    with zipfile.ZipFile(puffer, "w", zipfile.ZIP_DEFLATED) as z:
        for name, text in sorted(dateien().items()):
            info = zipfile.ZipInfo(name, date_time=(2026, 11, 20, 18, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, text)
    (ZIEL / "zelle.zip").write_bytes(puffer.getvalue())
    print(len(dateien()), "Dateien ->", ZIEL / "zelle.zip", len(puffer.getvalue()), "Bytes")
