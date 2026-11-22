# V19 Datenbanken & SQL – verbindliche Inhaltsvorgabe (vom Koordinator)

Worktree (nur hier arbeiten, nie ins Haupt-Repo darüber wechseln, NICHT committen):
C:\_Data\01_sourcecode\github\maschinenbau-vorlesung-informatik\.claude\worktrees\v19-sql-f6cc0b

## Rahmen
- Termin V19, Phase 3 (Projekt). Informatik-Strang: Datenbanken & SQL. Python-Strang neu: `sqlite3`, Parameter-Platzhalter `?`. Hook: Fertigungsaufträge abfragen.
- Roter Faden V16–V19 „Fertigungszelle FZ-3“: Maschinen D2 (Drehmaschine, 192.168.30.11), F1 (Fräsmaschine, .12), R1 (Roboter, 192.168.31.20 – in V17 der falsch konfigurierte), M1 (Messmaschine, .14), SPS (Zellensteuerung). V16: Log-Dateien der Zelle durchsucht; V17: Maschinendaten per HTTP/JSON; V18: Firmware-Prüfsumme von R1. V19: Die Zelle bekommt eine **Auftragsdatenbank** (wer fertigt was, wie viel, welcher Status). Teile: WELLE_20H6, FLANSCH_80, BUCHSE_30, DECKEL_80, BOLZEN_12, WELLE_25K6 (WELLE_20H6/FLANSCH_80 sind die NC-Programme aus V16). Gern kurz auf V16–V18 zurückverweisen („in V17 kamen die Daten als JSON von der API, heute liegen sie in einer Datenbank“).
- Vorher eingeführte Python-Konstrukte (alles bis V18 erlaubt): print, Variablen, input, int/float/str, f-Strings, if/elif/else, while/for/range, def/return/Default-Werte, Listen, Tupel (inkl. Entpacken `for nr, teil, menge in ...`), Dicts, with open, csv, try/except, List Comprehension, import, assert, numpy, pandas, pathlib, json, requests, hashlib. **Nicht**: class/Objekte selbst definieren (V20). `cur`/`db` sind Objekte mit Methoden – das darf man benutzen wie `datei.read()` (Methodenaufruf kennen sie), ohne class zu erklären.
- Wissens-Ampel V19:
  - Im Kopf: Tabelle / Zeile (Datensatz) / Spalte / Primärschlüssel; `SELECT … FROM … WHERE …` lesen und einfach schreiben; **Platzhalter `?` statt f-String im SQL** (SQL-Injection); nach Änderungen `commit()`.
  - Lesen & erkennen: `INSERT`, `UPDATE`, `DELETE` (immer mit WHERE!), `ORDER BY`, `GROUP BY` mit `SUM`/`COUNT`, `JOIN` zweier Tabellen, `CREATE TABLE`.
  - Delegieren: Datenbankentwurf großer Systeme (Normalformen), Indizes/Performance, Server-Datenbanken (PostgreSQL, SQL Server, MES/ERP-Anbindung), ORMs.

## Vorgerechnetes Beispiel
`briefing/v19-beispiel.py` – EXAKT diesen Code (Labor-Station „Vorgerechnetes Beispiel“, Notebook, Beispiel-Video). Ausgabe:
```
Auftrag 4711: 500 x WELLE_20H6
Auftrag 4713: 300 x WELLE_20H6
Menge je Maschine: [('D2', 1600), ('F1', 180)]
Unsicher (f-String): 5 Treffer - alle Aufträge!
Sicher (Platzhalter): 0 Treffer
```

## Daten (schon angelegt, nicht ändern; Generator `tools/daten/v19_auftraege.py`)
- `site/assets/data/v19/fz3.db` – SQLite-Datei, per `data-files="../assets/data/v19/fz3.db"` im Labor als `fz3.db` im Arbeitsverzeichnis. Tabellen:
  - `maschinen(id TEXT PRIMARY KEY, typ TEXT, ip TEXT)`: (D2, Drehmaschine, 192.168.30.11), (F1, Fraesmaschine, 192.168.30.12), (R1, Roboter, 192.168.31.20), (M1, Messmaschine, 192.168.30.14)
  - `auftraege(nr INTEGER PRIMARY KEY, teil TEXT, maschine TEXT, menge INTEGER, status TEXT)`, 12 Zeilen:
    4711 WELLE_20H6 D2 500 in Arbeit · 4712 FLANSCH_80 F1 120 offen · 4713 WELLE_20H6 D2 300 offen · 4714 BUCHSE_30 D2 800 fertig · 4715 FLANSCH_80 F1 60 fertig · 4716 DECKEL_80 F1 200 offen · 4717 BOLZEN_12 D2 1500 offen · 4718 FLANSCH_80 F1 240 in Arbeit · 4719 WELLE_25K6 D2 150 offen · 4720 BUCHSE_30 D2 400 offen · 4721 DECKEL_80 F1 90 fertig · 4722 WELLE_20H6 D2 250 fertig
- `site/assets/data/v19/auftraege-kw48.csv` (UTF-8, Semikolon, Kopfzeile `nr;teil;maschine;menge;status`): 4723 BOLZEN_12 D2 600 offen · 4724 FLANSCH_80 F1 80 offen · **4725 WELLE_25K6 D2 „zwölf“ offen (kaputte Menge)** · 4726 DECKEL_80 F1 150 offen · 4727 BUCHSE_30 D2 350 offen
- Die Dateien werden vor jedem Lauf frisch ins Arbeitsverzeichnis gelegt (Änderungen an fz3.db überleben keinen neuen Lauf – im Text erwähnen, wo es auffällt).
- Tests von Labor-Aufgaben: wo sinnvoll, die Datenbank in den Tests variieren (eigene `:memory:`-DB oder fz3.db im Test um Zeilen ergänzen), damit Hardcoding der Ausgabe nicht besteht.

## Fakten (lokal geprüft, Python 3.13 / SQLite 3.45; Pyodide hat Python 3.12)
Fehlermeldungen exakt so:
- `sqlite3.OperationalError: no such table: auftrag`
- `sqlite3.OperationalError: no such column: nummer`
- `sqlite3.OperationalError: near "SELEC": syntax error`
- `sqlite3.OperationalError: near "Brien": syntax error` (bei `WHERE teil = 'O'Brien'` per f-String – zeigt, dass ein Anführungszeichen in den Daten den SQL-Text kaputt macht; mit `?` geht `O'Brien` problemlos)
- `sqlite3.ProgrammingError: Incorrect number of bindings supplied. The current statement uses 1, and there are 2 supplied.` (bei `("D2")` statt `("D2",)` – ohne Komma ist es kein Tupel, sondern der Text "D2" mit 2 Zeichen)
- `sqlite3.IntegrityError: UNIQUE constraint failed: auftraege.nr` (Primärschlüssel doppelt)
- `sqlite3.OperationalError: table auftraege has 5 columns but 3 values were supplied`
- `sqlite3.ProgrammingError: You can only execute one statement at a time.` (`execute` führt nur EINE Anweisung aus – deshalb klappt die berühmte `'; DELETE FROM …; --`-Injection mit sqlite3.execute nicht, die `OR '1'='1`-Variante aber schon. Genau so darstellen, nicht übertreiben: andere Schnittstellen/Datenbanken erlauben teils mehrere Anweisungen.)
- `cur.execute(...)` gibt den Cursor zurück; `fetchall()` liefert eine **Liste von Tupeln**, `fetchone()` ein Tupel oder `None`. Ohne `commit()` sind Änderungen bei Datei-Datenbanken nach `close()` weg (bei `:memory:` ist ohnehin alles weg).
- `SUM` über GROUP BY liefert in der Reihenfolge der Gruppen; ohne ORDER BY ist die Reihenfolge von SELECT nicht garantiert (im Text: „wenn die Reihenfolge wichtig ist, ORDER BY schreiben“). Tests sollten deshalb ORDER BY verlangen oder reihenfolgeunabhängig prüfen.

## Informatik-Strang (Lerneinheit) – Inhalt
1. Warum? Hook: Schichtleitung der Zelle FZ-3 fragt morgens: „Was liegt heute noch für D2 an?“ Bisher: eine Excel-/CSV-Liste auf dem Gruppenlaufwerk, die Arbeitsvorbereitung und Meister gleichzeitig ändern (zwei Stände, Zeile überschrieben, Spalte verrutscht). Lösung: Auftragsdatenbank. Zweite Szene: das Suchfeld „Teil suchen“ im Zellen-Dashboard – jemand tippt `x' OR '1'='1` und sieht alle Aufträge (SQL-Injection). Hook-Bild `v19-hook.png/.webp` (liegt schon vor). Ampel + „Warum muss ich das wissen?“ (KI schreibt SQL sehr gern per f-String; ein Ingenieur muss das in der Code-Review sofort sehen; Messdaten/Aufträge/Qualitätsdaten liegen in der Praxis fast immer in Datenbanken: MES, ERP, Messmaschinen-Software).
2. Theorie:
   - Erklärvideo `v19-theorie` (Video folgt).
   - Datei vs. Datenbank: was ein Datenbankmanagementsystem leistet (gleichzeitiger Zugriff, Regeln/Datentypen, Abfragen statt selbst Schleifen schreiben, Transaktion: alles oder nichts). SQLite = Datenbank in einer einzigen Datei, steckt in Python, Smartphones, Browsern; Server-Datenbanken als Ausblick.
   - Tabelle, Zeile, Spalte, Datentyp (INTEGER, REAL, TEXT), Primärschlüssel (Auftragsnummer eindeutig wie eine Seriennummer). Explorable: Tabelle `auftraege` als Gitter, Begriffe per Klick hervorheben.
   - SQL als **deklarative** Sprache: du sagst WAS, nicht WIE (Gegensatz zur for-Schleife aus V08). Die vier Grundbefehle (CRUD): INSERT, SELECT, UPDATE, DELETE + CREATE TABLE.
   - **Explorable 1 „Abfrage-Baukasten“** (Regel 14, Mechanismus): Auswahl Spalten (Checkboxen), WHERE maschine = (alle/D2/F1), status (alle/offen/in Arbeit/fertig), menge > Schieberegler, ORDER BY (keine/menge auf/ab). Zeigt live den SQL-Text und animiert schrittweise die Auswertungsreihenfolge **FROM → WHERE (Zeilen fallen weg) → SELECT (Spalten fallen weg) → ORDER BY**, Ergebnis als Liste von Tupeln wie in Python. Daten: die 12 Aufträge aus fz3.db. Knöpfe „Schritt für Schritt“ / „Ganz“.
   - GROUP BY / SUM / COUNT: **Explorable 2** Zeilen wandern in Fächer je Maschine, dann wird je Fach summiert (`SELECT maschine, SUM(menge) FROM auftraege GROUP BY maschine`). Für die 5 Beispiel-Aufträge Ergebnis D2 1600, F1 180 (identisch mit dem Beispiel).
   - Zwei Tabellen und JOIN (Lesen & erkennen): `maschinen` + `auftraege`, Fremdschlüssel `auftraege.maschine` → `maschinen.id`, warum man den Maschinentyp nicht in jede Auftragszeile schreibt (Redundanz, Widerspruch bei Änderung). Statische Grafik/kleines Bild reicht.
   - Python spricht mit der Datenbank: connect → cursor → execute → fetchall → commit → close. Als kleiner Ablauf (Animation oder Schritt-Grafik). Code dazu ausführbar (`:memory:`).
   - **SQL-Injection** (Kernstück, Mechanismus sichtbar): **Explorable 3** Eingabefeld „Teil suchen“ mit Vorschlägen (`FLANSCH_80`, `x' OR '1'='1`, `O'Brien`). Links „f-String“: der entstehende SQL-Text, Eingabe farbig markiert – man sieht, wie das `'` den Text beendet und `OR '1'='1'` zu SQL-Code wird; dann je Zeile die Bedingung auswerten → alle Zeilen wahr. Rechts „Platzhalter“: SQL-Text bleibt fest mit `?`, Wert geht getrennt als Daten mit → nur exakte Treffer. Merke-Kasten: „Daten nie in den SQL-Text kleben. Immer `?` und ein Tupel.“ Achtung: `(maschine,)` – Komma für Tupel mit einem Element.
   - PAP zum Code (Pflicht, per `KursPAP.figure`): PAP von „offene Aufträge einer Maschine ausgeben“: Start → Eingabe maschine → Unterprogramm „Verbindung öffnen“ → Operation „SELECT … WHERE maschine = ? ausführen“ → Verzweigung „Treffer vorhanden?“ ja: Schleife über die Treffer mit Ausgabe, nein: Ausgabe „keine offenen Aufträge“ → Unterprogramm „Verbindung schließen“ → Ende. Mit Satz: Datenbankzugriffe sind im PAP Unterprogramme oder Ein-/Ausgaben.
   - KI und Datenbanken: KI schreibt SQL schnell, prüfe: Platzhalter? WHERE bei UPDATE/DELETE? commit? Keine echten Kundendaten in den Prompt (Brücke zu V18).
3. Ausprobieren (ausführbare Vorhersage-Snippets, `:memory:`-DB je Snippet selbst aufbauen oder `data-files` fz3.db): SELECT mit WHERE, fetchone vs. fetchall, ORDER BY DESC, COUNT, UPDATE + SELECT, DELETE ohne WHERE (Vorhersage: wie viele Zeilen bleiben? 0), `("D2")` ohne Komma (Fehler vorhersagen).
4. Selbstcheck im Klausurformat (Probeklausur-25/26-Stil): 5–7 Fragen (Begriffe Primärschlüssel; welche Zeilen liefert eine gegebene Abfrage; Ergebnis von GROUP BY; was ist an diesem Code gefährlich (f-String); was fehlt (commit); Tupel mit einem Element) + eine Code-Schreib-Aufgabe `data-a="klausur"`: Funktion `offene_menge(cur, maschine)` gibt die Summe der Menge aller nicht fertigen Aufträge einer Maschine zurück, mit Platzhalter (0, wenn keine). Tests mit eigener DB inkl. Injection-Eingabe.
5. Deep Dive (eingeklappt): ACID/Transaktion mit Beispiel „Material buchen und Auftrag freigeben – beides oder nichts“ (`with db:`), Index und Laufzeit (Brücke V13), Normalformen kurz, Server-Datenbanken/MES/ERP/OPC UA-Anbindung, pandas `read_sql_query` (Brücke V15).
Danach „Videos zur Nachbereitung“, „Wie geht es weiter?“ (Labor + **Projekt: `../projekt.html`**), „Für Dozierende“ (Ablaufplan 135 Min mit 30 Min Projektzeit am Ende ab V14, Link `../projekt.html`, Hinweise).

## Labor (`site/lektionen/v19-labor.html`)
Teil A „Im Labor“:
- Werkzeugkasten: Syntax-Karten (alle ausführbar, `:memory:` oder fz3.db): connect/cursor/execute/fetchall/close; CREATE TABLE; INSERT + executemany + `?`; SELECT … WHERE mit Platzhalter (+ Tupel-Komma); ORDER BY / LIMIT; GROUP BY + SUM/COUNT; UPDATE/DELETE immer mit WHERE + commit; fetchone und `None`. Video `v19-python` (Video folgt).
- Vorgerechnetes Beispiel: `briefing/v19-beispiel.py` exakt, Video `v19-beispiel` (Video folgt), Erklärung Zeile für Zeile.
- Ablauf verfolgen (`data-a="trace"`): Schleife über `fetchall()`-Ergebnis mit Tupel-Entpacken und Summe; zweiter Trace: GROUP-BY-Ergebnis in ein Dict übernehmen.
- Zeilen ordnen (Parsons, 2 Stück): (a) Tabelle anlegen, INSERT, commit, SELECT mit Platzhalter, Schleife; (b) Funktion mit fetchone + if None.
- Lücken füllen (`gap`): `?`, `(maschine,)`, `fetchall()`, `commit()`.
- Erste eigene Aufgabe (code, `data-files` fz3.db): alle offenen Aufträge von F1 nach Menge absteigend als „Auftrag 4716: 200 x DECKEL_80“ ausgeben. Tests variieren die DB.
- PAP-Aufgabe (`data-a="pap-zeichnen"`, siehe docs/PAP-EDITOR.md; der Typ kennt **kein** data-files, deshalb ohne Datenbank): „Eingaben prüfen, bevor sie in die Datenbank gehen“: Mengen (int) für neue Aufträge einlesen, bis 0 eingegeben wird (0 beendet nur, zählt nicht); negative Mengen und Mengen über 2000 zählen als ungültig, gültige werden summiert; am Ende Summe und Anzahl ungültiger ausgeben. Eingabeaufforderung ohne Ziffern. Start-PAP optional mit `"prompt":""` (siehe Hinweis aus V12: Prompt leer, damit Ausgabe sauber). Brücke: Validierung ist die zweite Schutzschicht neben Platzhaltern.
- Code-Review (KI-Spiegel): KI-Funktion `auftrag_suchen(cur, teil)` und `status_setzen(db, nr, status)` mit eingebauten Fehlern: f-String im SQL (Injection), fehlendes `commit()`, `UPDATE auftraege SET status = ?` ohne WHERE (setzt alle!), `fetchone()` ohne None-Prüfung. „Würdest du das freigeben?“ – Fehler ankreuzen/finden + korrigierte Fassung als Code-Aufgabe mit Tests (inkl. Injection-Eingabe `x' OR '1'='1` → 0 Treffer, und nach `status_setzen` hat nur der eine Auftrag den neuen Status).
- Typische Fehlermeldungen: die Liste aus „Fakten“ (no such table, no such column, syntax error, Incorrect number of bindings, UNIQUE constraint failed, 5 columns but 3 values, one statement at a time), jeweils Ursache + Abhilfe, mit ausführbarem Auslöser.
Teil B „Training zu Hause“ (6–8 gestufte Aufgaben, 1–4 Sterne, automatisch geprüft):
1. ★ Anzahl fertiger Aufträge mit COUNT (fz3.db).
2. ★★ Menge je Maschine mit GROUP BY und ORDER BY, als „D2: 3900 Stück“ ausgeben (Werte aus fz3.db berechnen lassen, nicht vorgeben).
3. ★★ UPDATE: Auftrag per Eingabe-Nummer auf „fertig“ setzen, commit, prüfen mit fetchone; unbekannte Nummer → „Auftrag nicht gefunden“ (`cur.rowcount` oder vorher SELECT).
4. ★★★ Funktion `auftraege_fuer(cur, maschine, status)` → Liste der Auftragsnummern (sortiert), mit Platzhaltern; Tests inkl. Injection.
5. ★★★ Wiederholung V09: `auftraege-kw48.csv` mit `csv` einlesen, kaputte Zeile per `try/except ValueError` überspringen (Meldung ausgeben), gültige mit `executemany` in fz3.db einfügen, danach Anzahl offener Aufträge von D2 ausgeben. Tests variieren die CSV.
6. ★★★ JOIN: Liste „4711 WELLE_20H6 auf Drehmaschine“ für alle offenen Aufträge (JOIN maschinen). JOIN-Gerüst darf im Starter stehen.
7. ★★★★ Klausur-Modus (`data-a="klausur"`, erst auf Papier): Funktion `auftrag_anlegen(db, nr, teil, maschine, menge)` prüft Menge 1..2000 und Maschine in der Tabelle maschinen (Platzhalter), fängt `sqlite3.IntegrityError` bei doppelter Nummer ab, gibt "angelegt"/"Menge ungültig"/"Maschine unbekannt"/"Nummer vergeben" zurück, commit. Mit Punkteschema.
Notebook-Link. Projekt-Hinweis auf `../projekt.html`.

## Notebook `site/notebooks/V19-Datenbanken-und-SQL.ipynb`
Wie V11-Notebook aufgebaut (Colab/Jupyter-tauglich): Beispiel, Werkzeugkasten-Zellen, ein paar Übungen mit Lösungen in eingeklappten/separaten Zellen. Datenbank im Notebook selbst erzeugen (`:memory:` mit den 12 Aufträgen), damit es ohne Download läuft.

## Videos (keine Vertonung)
Drei Videos `video-src/v19-theorie`, `v19-python`, `v19-beispiel`: `texte.py` (SRC + SZENEN, ≤ 2.700 Zeichen Sprechfassung), `render.py` (Pipeline wie V11), gemeinsames `video-src/v19-common/`.
Theorie: Datei vs. Datenbank → Tabelle/Zeile/Spalte/Primärschlüssel → SQL deklarativ, Auswertungsreihenfolge → GROUP BY → SQL-Injection-Mechanismus → Platzhalter + Merksatz.
Python: connect/cursor/execute/fetchall/commit/close, `?` und Tupel-Komma, executemany, fetchone/None, typische Fehler.
Beispiel: genau `briefing/v19-beispiel.py`.

## Allgemein
Deutsch, Du-Ansprache, keine Emojis, keine Gedankenstrich-Flut, fachlich exakt. Begriffs-Hinweise (`k-begriff`) für jeden neuen Fachbegriff: Datenbank, Datenbankmanagementsystem, Tabelle, Datensatz, Spalte, Primärschlüssel, Fremdschlüssel, SQL, Abfrage, Cursor, Transaktion, commit, Platzhalter, SQL-Injection, deklarativ, JOIN, Aggregatfunktion.

## Nachtrag nach Rebase (V12-V17 auf main)
- Neueste Vorlage mit gleichem roten Faden: v17-netzwerke.html, v17-labor.html, video-src/v17-* (h17.py mit Modus probe), briefing/berichte/v17.md.
- Labor bekommt wie V17 die Station t-projekt "Projekt: Meilenstein V19" (Teil B, ohne Wertung), Inhalt aus site/projekt.html (Meilenstein v19 "Ausgabe und Diagramm"); naechster Meilenstein V20: Feinschliff und Code-Review im Team.
- Projektthema Stueckliste nennt schon "Stueckliste in einer SQLite-Datenbank (V19)" - aufgreifen.
- Hoechstens 2 Subagenten gleichzeitig.
