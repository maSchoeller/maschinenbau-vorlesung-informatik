# Fertigungszelle FZ-3: Auftragsdatenbank mit SQL abfragen
# (V19: sqlite3, SQL CREATE/INSERT/SELECT, Parameter-Platzhalter, SQL-Injection)

import sqlite3

db = sqlite3.connect(":memory:")          # Datenbank im Arbeitsspeicher (zum Üben)
cur = db.cursor()
cur.execute("""CREATE TABLE auftraege (
    nr INTEGER PRIMARY KEY,
    teil TEXT,
    maschine TEXT,
    menge INTEGER,
    status TEXT
)""")

auftraege = [
    (4711, "WELLE_20H6", "D2", 500, "in Arbeit"),
    (4712, "FLANSCH_80", "F1", 120, "offen"),
    (4713, "WELLE_20H6", "D2", 300, "offen"),
    (4714, "BUCHSE_30", "D2", 800, "fertig"),
    (4715, "FLANSCH_80", "F1", 60, "fertig"),
]
cur.executemany("INSERT INTO auftraege VALUES (?, ?, ?, ?, ?)", auftraege)
db.commit()

# Alle offenen Aufträge der Drehmaschine D2 - mit Platzhaltern
maschine = "D2"
cur.execute("SELECT nr, teil, menge FROM auftraege WHERE maschine = ? AND status != ?",
            (maschine, "fertig"))
for nr, teil, menge in cur.fetchall():
    print(f"Auftrag {nr}: {menge} x {teil}")

# Summe der Stückzahlen je Maschine
cur.execute("SELECT maschine, SUM(menge) FROM auftraege GROUP BY maschine")
print("Menge je Maschine:", cur.fetchall())

# SQL-Injection: Eingabe direkt in den SQL-Text einbauen ist gefährlich
eingabe = "x' OR '1'='1"
sql = f"SELECT nr FROM auftraege WHERE teil = '{eingabe}'"
cur.execute(sql)
print("Unsicher (f-String):", len(cur.fetchall()), "Treffer - alle Aufträge!")

cur.execute("SELECT nr FROM auftraege WHERE teil = ?", (eingabe,))
print("Sicher (Platzhalter):", len(cur.fetchall()), "Treffer")
db.close()
