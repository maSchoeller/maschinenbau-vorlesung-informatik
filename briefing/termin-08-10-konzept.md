# Termin 08 bis 10 · Konzept mit den Entscheidungen vom 2026-11-27

Rahmen aus `kurs.yaml`:

| Termin | Theorie | Programmieren |
|---|---|---|
| 08 | T5 Datentypen, Teil 3 (1) | P4 Funktionen, Teil 3 bis 5 (3) |
| 09 | T6 Rechneraufbau, Teil 1 und 2 (2) | P4 Funktionen, Teil 6 (1), P5 Zahlenraten, Teil 1 (1) |
| 10 | T6 Rechneraufbau, Teil 3 (1) | P5 Zahlenraten, Teil 2 bis 4 (3) |

Termin 10 ist der letzte Termin des 1. Semesters. Danach folgt die Praxisphase; Termin 11 beginnt mit Auffrischern (T7, P6).

Stand vorher: Termin 07 bringt `def` ohne und mit Parameter, `return`, `print` gegen `return`, `type()`, `round(x, 2)`, `**` nur zum Lesen, Wertebereich, Überlauf, Zweierkomplement als Idee, Kommazahlen. Der Plan-Editor kennt den Blocktyp „Funktion“ (Kopf, Rumpf, eine Rückgabe am Ende). Vorgemerkt für Termin 08 (`termin-07-zuschnitt.md`, „Bewusst weggelassen“): `str`, `bool`, Umwandlung, `TypeError`, `int(3.7)`, lokale und globale Namen, Funktionen, die Funktionen aufrufen, `return` in einer Verzweigung, `bauteil3d` mit Parametern. Das Warm-up von Termin 08 ist Training 07, Aufgabe 1 (Zähler am Kreis weiterzählen).

# Entscheidungen des Dozenten (2026-11-27)

1. **Umfang:** Termin 08 bis 10 werden zusammen geplant, gebaut wird nacheinander.
2. **T5 Teil 3 (Termin 08, 1 Block):** `str` und `bool` als Datentypen, `input()` liefert immer Text, Umwandlung mit `int()`, `float()`, `str()`, `int(3.7)` ergibt 3 (schneidet ab), `TypeError` bei `"5" + 3` lesen, **dazu Text mit `+` zusammensetzen** (`"Hallo " + name`).
3. **Lokale Namen ohne `global`:** Parameter und Variablen im Rumpf gibt es nur dort, draußen sind sie unbekannt (`NameError`). Werte kommen über Parameter hinein und über `return` heraus. Das Schlüsselwort `global` kommt nicht vor.
4. **P4 in Termin 08 (3 Blöcke):** (1) lokale Namen; (2) Funktion ruft Funktion und Funktionen, die `True` oder `False` zurückgeben, mit `return` in einer Verzweigung (z. B. `ist_gerade`); (3) 3D-Bauteil mit Parametern (`bauteil3d`).
5. **T6 Rechneraufbau (Termin 09 zwei Blöcke, Termin 10 ein Block, Tiefe „verstehen“):** (1) Bauteile: Prozessor, Arbeitsspeicher, Festplatte/SSD, Ein- und Ausgabe, Bus. (2) Wie ein Programm läuft: holen, entschlüsseln, ausführen, Takt, mit einem Spielzeug-Rechner als Baustein (4 Befehle, Schritt für Schritt). (3) Speicher: schnell und klein bis langsam und groß, KB/MB/GB, Zeichen als Zahlen (ASCII).
6. **Zufall:** `import random` und `geheim = random.randint(1, 100)`. In Tests wird der Zufall festgelegt.
7. **Zahlenraten, Umfang:** Pflicht: Zufallszahl 1 bis 100, raten bis richtig, Hinweis „größer/kleiner“, Versuche zählen, in Funktionen gegliedert (z. B. `hinweis(geraten, geheim)` gibt Text zurück). Ausbau: begrenzte Versuche, „Noch einmal?“. Knobelaufgabe: Der Computer rät deine Zahl (halbieren, 7 Versuche reichen für 1 bis 100).
8. **Zahlenraten, Bauweise:** Jede und jeder baut das eigene Spiel in Schritten, die Führung nimmt ab (erst Zeile für Zeile vorgegeben, am Ende nur die Aufgabe). Der letzte Funktionen-Block in Termin 09 (P4 Teil 6) zerlegt ein Programm in Funktionen (Hauptplan mit Unterprogrammen) als Brücke zum Spiel.

# Was weiter gilt

Alle Festlegungen aus den Zuschnitten von Termin 02 bis 07 (Stationsreihenfolge, drei gestufte Tipps, Grenzfall in jeder Aufgabe, höchstens 28 Minuten je Block verplant, Pausen nicht in der App, drei Bausteine je Termin, Vermutung vor der Auflösung, Quiz mischbar, 1 bis 2 Knobelaufgaben, Training rund 45 Minuten mit Warm-up im nächsten Termin, PAP zuerst bei neuem Ablauf, drei Klausurformen in jedem Termin). Python-Umfang laut `KONZEPT.md`: keine Listen (kommen in P7), keine Dictionaries, kein `try/except`, kein `break`/`continue`/`while True:`, kein `%`/`//` (bisher nicht eingeführt; falls Zahlenraten oder `ist_gerade` sie braucht, ist das eine Frage an den Dozenten).
