# Fertigungszelle FZ-3: Log-Dateien aller Maschinen durchsuchen
# (V16: pathlib, Dateien und Ordner durchsuchen, Dateigröße, Zeit messen)
# Ordner zelle/ (im Labor aus zelle.zip entpackt)

import time
from pathlib import Path

start = time.perf_counter()
zelle = Path("zelle")

fehler_je_maschine = {}
anzahl_dateien = 0
groesse = 0
for log in sorted(zelle.glob("maschinen/*/logs/*.log")):
    anzahl_dateien = anzahl_dateien + 1
    groesse = groesse + log.stat().st_size
    maschine = log.parent.parent.name        # .../D2/logs/2026-11-16.log -> D2
    with open(log, encoding="utf-8") as datei:
        for zeile in datei:
            teile = zeile.strip().split(";")
            if teile[1] == "ERROR":
                if maschine not in fehler_je_maschine:
                    fehler_je_maschine[maschine] = []
                fehler_je_maschine[maschine].append(log.stem + " " + teile[0][11:] + " " + teile[2])

print(f"{anzahl_dateien} Log-Dateien, zusammen {groesse / 1024:.1f} KiB")
for maschine, liste in fehler_je_maschine.items():
    print(f"{maschine}: {len(liste)} Fehler, zuerst: {liste[0]}")

nc = [p.name for p in sorted(zelle.rglob("*.nc"))]
print("NC-Programme:", nc)
print(f"Suche dauerte {1000 * (time.perf_counter() - start):.1f} ms")
