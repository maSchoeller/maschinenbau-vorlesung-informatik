"""Erzeugt die Daten der Fertigungszelle FZ-3 für V19 (Datenbanken & SQL).

Ausgabe (site/assets/data/v19/):
  fz3.db               SQLite-Datei mit den Tabellen maschinen und auftraege
  auftraege-kw48.csv   neue Aufträge zum Importieren (Semikolon, eine kaputte Zeile)
Die ersten fünf Aufträge sind genau die aus briefing/v19-beispiel.py.
Maschinen wie in V17 (site/assets/data/v17/api/maschinen.json).
"""
import sqlite3
from pathlib import Path

ZIEL = Path(__file__).resolve().parents[2] / "site" / "assets" / "data" / "v19"

MASCHINEN = [
    ("D2", "Drehmaschine", "192.168.30.11"),
    ("F1", "Fraesmaschine", "192.168.30.12"),
    ("R1", "Roboter", "192.168.31.20"),
    ("M1", "Messmaschine", "192.168.30.14"),
]

AUFTRAEGE = [
    (4711, "WELLE_20H6", "D2", 500, "in Arbeit"),
    (4712, "FLANSCH_80", "F1", 120, "offen"),
    (4713, "WELLE_20H6", "D2", 300, "offen"),
    (4714, "BUCHSE_30", "D2", 800, "fertig"),
    (4715, "FLANSCH_80", "F1", 60, "fertig"),
    (4716, "DECKEL_80", "F1", 200, "offen"),
    (4717, "BOLZEN_12", "D2", 1500, "offen"),
    (4718, "FLANSCH_80", "F1", 240, "in Arbeit"),
    (4719, "WELLE_25K6", "D2", 150, "offen"),
    (4720, "BUCHSE_30", "D2", 400, "offen"),
    (4721, "DECKEL_80", "F1", 90, "fertig"),
    (4722, "WELLE_20H6", "D2", 250, "fertig"),
]

CSV = """nr;teil;maschine;menge;status
4723;BOLZEN_12;D2;600;offen
4724;FLANSCH_80;F1;80;offen
4725;WELLE_25K6;D2;zwölf;offen
4726;DECKEL_80;F1;150;offen
4727;BUCHSE_30;D2;350;offen
"""


def main():
    ZIEL.mkdir(parents=True, exist_ok=True)
    db_pfad = ZIEL / "fz3.db"
    if db_pfad.exists():
        db_pfad.unlink()
    db = sqlite3.connect(db_pfad)
    db.execute("CREATE TABLE maschinen (id TEXT PRIMARY KEY, typ TEXT, ip TEXT)")
    db.execute("""CREATE TABLE auftraege (
    nr INTEGER PRIMARY KEY,
    teil TEXT,
    maschine TEXT,
    menge INTEGER,
    status TEXT
)""")
    db.executemany("INSERT INTO maschinen VALUES (?, ?, ?)", MASCHINEN)
    db.executemany("INSERT INTO auftraege VALUES (?, ?, ?, ?, ?)", AUFTRAEGE)
    db.commit()
    db.execute("VACUUM")
    db.close()
    (ZIEL / "auftraege-kw48.csv").write_bytes(CSV.encode("utf-8"))
    print("geschrieben:", db_pfad, db_pfad.stat().st_size, "Bytes")


if __name__ == "__main__":
    main()
