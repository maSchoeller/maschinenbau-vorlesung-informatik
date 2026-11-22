# V16 Rechner & Betriebssystem kompakt – verbindlicher Inhaltsplan (Koordinator)

Repo/Worktree (nur hier arbeiten, nie ins Haupt-Repo darüber wechseln, NICHT committen):
C:\_Data\01_sourcecode\github\maschinenbau-vorlesung-informatik\.claude\worktrees\v16-betriebssystem-7d6499

Testserver läuft schon: http://localhost:8166/ (Wurzel = `site/`). Nicht selbst starten/stoppen. Im eingebauten Browser (mcp__Claude_Browser__*) einen EIGENEN neuen Tab öffnen (tabs_create), am Ende schließen; Cache mit `?v=<zahl>` umgehen; Viewport mit resize_window testen und danach `preset: "desktop"` zurücksetzen.

## Dateinamen (fest, alle Agenten verlinken genau so)
- Lerneinheit: `site/lektionen/v16-rechner-und-betriebssystem.html`
- Labor: `site/lektionen/v16-labor.html`
- Notebook: `site/notebooks/V16-Rechner-und-Betriebssystem.ipynb`
- Explorables: `site/assets/js/explorables-v16.js`, CSS: `site/assets/css/v16.css` (gehören dem Lerneinheit-Agenten)
- Daten: `site/assets/data/v16/zelle.zip` (vorhanden, erzeugt von `tools/daten/v16_zelle.py`), eigene Zusatzdaten nur unter `site/assets/data/v16/`
- Videos: `../assets/video/v16-theorie.mp4`, `v16-python.mp4`, `v16-beispiel.mp4` (+ `-poster.png`, `.vtt`) – existieren noch nicht, „Video folgt“-Fallback wie V11.
- Hook-Bild: `../assets/img/v16-hook.png` / `.webp` (vorhanden).
- Projektseite: `../projekt.html` (wird von der V14-Session gebaut; nur verlinken, „Für Dozierende“ + Ende der Lerneinheit + Labor-Ende: letzte 30 Min Projektzeit).

## Roter Faden „Fertigungszelle FZ-3“ (V16–V19 gemeinsam, Namen exakt so)
Zelle FZ-3 in Halle 2: **D2** Drehmaschine, **F1** Fräsmaschine, **R1** Roboter (Be-/Entladen), **M1** Koordinatenmessmaschine, **SPS** Zellensteuerung. Teile/NC-Programme: `WELLE_20H6`, `FLANSCH_80` (V19 hat zusätzlich `BUCHSE_30`). Netz (V17): 192.168.30.0/24. V17 holt Maschinendaten per HTTP, V18 prüft Firmware von R1 per SHA-256, V19 Auftragsdatenbank. V16 = **die Dateien der Zelle auf dem Zellenrechner durchsuchen**.

Inhalt von `zelle.zip` (wird im Labor per `data-files="../assets/data/v16/zelle.zip"` automatisch ins Arbeitsverzeichnis entpackt, Ordner `zelle/`):
```
zelle/LIESMICH.txt
zelle/maschinen/{D2,F1,M1,R1}/logs/2026-11-16.log … 2026-11-20.log   (20 Dateien, je 40–70 Zeilen)
zelle/messprotokolle/M1_D2_KW47.csv       (teil;durchmesser_mm;ergebnis, 20 Zeilen, iO/niO)
zelle/nc-programme/WELLE_20H6.nc, FLANSCH_80.nc, alt/WELLE_20H6_v1.nc
```
Log-Format je Zeile: `2026-11-16 06:00:18;INFO;Programm WELLE_20H6 gestartet` (Zeit;Stufe;Meldung), Stufen INFO/WARN/ERROR.
Meldungen: D2 (Spindel an, 1450 1/min · Programm WELLE_20H6 gestartet · Teil fertig · WARN Werkzeugverschleiss T4 ueber 80 % · ERROR Kuehlmitteldruck zu niedrig), F1 (Programm FLANSCH_80 gestartet · Teil fertig · WARN Spaenebehaelter fast voll · ERROR Achse Z Schleppfehler), R1 (Greifer zu/auf · Teil abgelegt · WARN Lichtgitter unterbrochen · ERROR Not-Halt ausgeloest), M1 (Messung gestartet · Messung i. O. · WARN Messung n. i. O. · ERROR Taster nicht kalibriert).

Vorgerechnetes Beispiel = exakt `briefing/v16-beispiel.py`. Ausgabe im Browser (Pyodide = Linux, Groß-/Kleinschreibung zählt beim Sortieren; Windows sortiert anders!):
```
20 Log-Dateien, zusammen 47.2 KiB
D2: 5 Fehler, zuerst: 2026-11-16 11:22:00 Kuehlmitteldruck zu niedrig
F1: 4 Fehler, zuerst: 2026-11-16 13:42:24 Achse Z Schleppfehler
M1: 11 Fehler, zuerst: 2026-11-16 14:24:20 Taster nicht kalibriert
R1: 7 Fehler, zuerst: 2026-11-16 09:02:27 Not-Halt ausgeloest
NC-Programme: ['FLANSCH_80.nc', 'WELLE_20H6.nc', 'WELLE_20H6_v1.nc']
Suche dauerte … ms   (schwankt von Lauf zu Lauf)
```
Lokal unter Windows kommt `WELLE_20H6_v1.nc` zuerst (Windows-Pfade vergleichen ohne Groß-/Kleinschreibung) – genau das ist ein schöner Hinweis „Betriebssysteme unterscheiden sich“ (Deep Dive / Achtung-Kasten).

## Python-Strang V16 (neu) – und was vorher da ist
Neu in V16: `from pathlib import Path`, `Path("zelle")`, Pfade verbinden mit `/`, `.name` `.stem` `.suffix` `.parent` (auch `.parent.parent`), `.exists()` `.is_file()` `.is_dir()`, `.iterdir()`, `.glob("*.log")`, `.rglob("*.nc")`, Muster `*` und `**`/Ordner im Muster (`"maschinen/*/logs/*.log"`), `.stat().st_size` (Bytes → KiB = /1024), `.read_text(encoding="utf-8")`, `sorted(...)` (wird hier kurz eingeführt: Reihenfolge von glob ist nicht festgelegt), `import os`: `os.getcwd()`, `os.listdir(".")`, `os.path.join` nur lesen (ältere Schreibweise, in KI-Code häufig), `os.walk` nur lesen. Zeit: `import time`, `time.perf_counter()` (Laufzeit messen, Differenz in s, ×1000 = ms), `time.sleep()` darf vorkommen; Uhrzeit vs. Laufzeit.
Vorher eingeführt (darf benutzt werden): alles bis V15 – print/input, int/float/str, f-Strings `:.1f`, math, if/elif/else, while/for/range/break, def/return/Default-Parameter, Listen/Tupel/Dicts (`in`, `.items()`, `.append`), Strings `split/strip/replace/startswith/lower`, `with open`, `csv`, `try/except` (`ValueError`, `FileNotFoundError`), List Comprehension, `import`, `assert`, NumPy, matplotlib, pandas (`read_csv`, Filtern, `groupby`, `describe`).
NICHT verwenden: `class` (V20), `json` (V17), `requests` (V17), `hashlib` (V18), `sqlite3` (V19), `lambda`, `subprocess`, `psutil`, `threading`, `datetime`-Rechnungen, `Path.unlink`/Löschen (höchstens im KI-Spiegel als Gefahr zeigen, nicht ausführen lassen).
Im Browser nicht verfügbar/unsinnig: echte Prozessliste, `os.cpu_count()`-Werte des echten Rechners (Pyodide-Sandbox), Laufwerksbuchstaben. Das sagt die Seite ehrlich („Das Labor läuft in einer Sandbox im Browser; auf deinem Rechner zeigt der Task-Manager …“).

## Informatik-Strang (Theorie, Lerneinheit; das Theorie-Video erzählt dasselbe)
Hook „Warum ruckelt mein CAD?“: Baugruppe der Zelle (Roboterzelle, ca. 2.000 Teile) dreht sich im CAD ruckelig. Task-Manager zeigt: CPU gesamt nur 13 %, aber ein Kern auf 100 %; Arbeitsspeicher 15,2 von 16 GB; Baugruppe liegt auf dem Netzlaufwerk. Wo ist der Engpass?
1. **Bausteine des Rechners**: Prozessor (CPU, Kerne, Takt), Arbeitsspeicher (RAM, flüchtig), Massenspeicher (SSD/HDD, dauerhaft), Grafikprozessor (GPU, Darstellung/Drehen), Netzwerk; Datenwege. Von-Neumann-Idee kurz: Programm und Daten liegen im selben Speicher, CPU holt Befehl für Befehl.
2. **Speicherhierarchie** – Zugriffszeiten auf menschliches Maß (1 ns ≙ 1 s): Register/L1-Cache ca. 1 ns (1 s) · RAM ca. 100 ns (knapp 2 min) · SSD (NVMe) ca. 100 µs (gut 1 Tag) · HDD ca. 10 ms (ca. 4 Monate) · Datei vom Netzlaufwerk ca. 1 ms und mehr je Zugriff (knapp 2 Wochen und mehr). Schneller = kleiner und teurer. Zahlen als Größenordnung („ca.“) kennzeichnen.
3. **Betriebssystem**: Vermittler zwischen Programmen und Hardware. Aufgaben: Prozesse verwalten (Scheduler verteilt Rechenzeit in Zeitscheiben auf Kerne), Speicher verwalten (jeder Prozess eigener Speicher; ist RAM voll, Auslagerung auf die SSD = Auslagerungsdatei, ca. 1000-mal langsamer → Ruckeln), Dateisystem (Ordnerbaum, Pfade, Rechte), Geräte über Treiber (Grafiktreiber! zertifizierte Treiber bei CAD). Beispiele: Windows, Linux (auch auf Steuerungen/Servern), macOS; Echtzeit-Betriebssysteme in SPS/Robotern (Ausblick).
4. **Prozess und Thread**: Prozess = laufendes Programm mit eigenem Speicher; Thread = Ausführungsstrang im Prozess. Viele Kerne helfen nur, wenn das Programm seine Arbeit aufteilen kann. Die Neuberechnung des Feature-Baums im CAD läuft großteils nacheinander (ein Schritt baut auf dem vorigen auf) → ein Kern bei 100 %, Gesamtanzeige 13 % bei 8 Kernen (100/8 = 12,5 %). Rendern/Drehen = GPU.
5. **Dateisystem und Pfade**: Baum aus Ordnern; absoluter Pfad (Windows `C:\Users\…`, Linux `/home/…`) vs. relativer Pfad (ab Arbeitsverzeichnis); Trennzeichen `\` vs `/`; Dateiendung sagt dem Betriebssystem, welches Programm öffnet; Netzlaufwerk = Ordner auf einem anderen Rechner. pathlib macht Pfade betriebssystemunabhängig.
6. **Zeit**: Uhrzeit (Wanduhr) vs. Laufzeit messen (`perf_counter`, Stoppuhr). Messwerte schwanken, weil das Betriebssystem andere Prozesse dazwischenschiebt → mehrmals messen, Bestwert oder Median.
Auflösung des Hooks: ein Kern am Anschlag (Feature-Neuberechnung) + RAM fast voll (Auslagerung droht) + Netzlaufwerk (Ladezeit) → Maßnahmen: Baugruppe vereinfachen/Teile unterdrücken bzw. vereinfachte Darstellung, andere Programme schließen, mehr RAM, lokal arbeiten (Kopie auf SSD/PDM-Cache), höherer Einzelkern-Takt wichtiger als viele Kerne, zertifizierter Grafiktreiber.

Wissens-Ampel: Im Kopf – Bausteine CPU/RAM/SSD/GPU und welche Anzeige im Task-Manager welchen Engpass zeigt; absoluter vs. relativer Pfad; Laufzeit messen. Lesen & erkennen – Prozess/Thread/Scheduler, Auslagerung, `os.walk`/`os.path.join` in KI-Code. Delegieren – Treiber/Registry/Details des Betriebssystems, Admin-Rechte (Betriebs-IT).

## PAP-Anteil
- Lerneinheit: PAP (per `KursPAP.figure`) zum Durchsuchen der Logs: Start → Ein-/Ausgabe/Operation „fehler = 0“ → Schleife „für jede Log-Datei“ → darin Schleife „für jede Zeile“ → Raute „Stufe == ERROR?“ ja → „fehler = fehler + 1“ → Ausgabe → Ende.
- Labor: mindestens eine Aufgabe „PAP zeichnen“ (Aufgabentyp aus `docs/PAP-EDITOR.md`), Vorschlag „Speicher-Ampel“: Eingabe RAM gesamt in GB (float), Anzahl Programme n (int), Schleife: je Programm Bedarf in GB einlesen und summieren; Ausgabe „ok“ (Summe ≤ 80 % RAM), „knapp“ (≤ 100 %), sonst „Auslagerung“. Grenzwerte testen (genau 80 %, genau 100 %).

## Nachtrag nach Rebase (V12–V14 und projekt.html sind jetzt da)
- **Neueste Vorlage ist V14**: `site/lektionen/v14-visualisierung.html`, `v14-labor.html` (inkl. Station „Projekt: Meilenstein V14“ und PAP-zeichnen im Training), Bericht `briefing/berichte/v14.md`. V12/V13 ebenfalls fertig (`briefing/berichte/v12.md`, `v13.md` lesen: Erfahrungen/Fallstricke).
- `site/projekt.html` existiert (Meilensteine V14–V21). Das Labor bekommt wie V14 eine Station „Projekt: Meilenstein V16“ (Inhalt passend zu projekt.html, Meilenstein V16 dort nachlesen) und verlinkt `../projekt.html`.
- Bereits eingeführt bis V14 zusätzlich: `assert`, Testfälle, Tupel-Entpacken (`a, b = ...`, `for x, y in ...`), NumPy, matplotlib. V15 (pandas) wird parallel gebaut, gilt aber als eingeführt.
