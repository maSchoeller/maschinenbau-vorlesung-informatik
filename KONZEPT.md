# Konzept: Informatik (T4MB1006) – Maschinenbau, DHBW Stuttgart Campus Horb, 2026/27

Zielgruppe: Maschinenbau 1./2. Semester (Konstruktion und Entwicklung, Produktionstechnik). Heterogene Vorkenntnisse, viele Programmier-Neulinge.
Rahmen: 22 Termine à 135 Min. Programmieranteil > 50 %. Prüfung: rein schriftliche Klausur (Niveau wie Probeklausur 25/26: https://raw.githubusercontent.com/maSchoeller/maschinenbau-vorlsung-25_26/main/klausur/Probeklausur-Grundlagen-Informatik.html).
KI-Zugang: Studierende können GitHub Copilot über die DHBW bekommen (GitHub Education). Keine Pflicht zu weiteren Accounts.

## Leitidee
„KI schreibt Code – Ingenieure spezifizieren, prüfen und verantworten.“
Vier Argumente, warum man trotzdem programmieren lernt:
1. Was man nicht lesen kann, kann man nicht prüfen (Haftung liegt beim Menschen).
2. KI verstärkt, was man ihr gibt – ein sauberer Programmablaufplan ist ein sehr guter Prompt.
3. Überschlagen > Rechnen: 0.1+0.2, Überlauf, mm/m-Verwechslung erkennen.
4. Im Betrieb ist KI oft nicht erlaubt (CAD-Daten, Kundendaten, SPS).

Ziel der Website: Lernen soll so viel Spaß machen, dass Selbststudium freiwillig passiert.

## Wissens-Ampel (bei jedem Thema sichtbar, mit Box „Warum muss ich das wissen?“)
- 🧠 Im Kopf: ohne das kannst du KI-Ergebnisse nicht beurteilen
- 📖 Lesen & erkennen: verstehen ja, selbst schreiben nicht zwingend
- 🤖 Delegieren: die KI macht das, du musst nur wissen, dass es existiert

## Drei Phasen
1. Fundament (V01–V09): KI als Erklärer, nicht als Generator. Selbst tippen.
2. Werkzeug (V10–V13): KI erzeugt, du prüfst (Testfälle von Hand vorher).
3. Projekt (V14–V22): ab V14 jeweils letzte 30 Min Projektzeit: kleines Ingenieurwerkzeug mit Copilot.

## Zwei Stränge pro Termin
Jeder Termin hat einen **Informatik-Strang** (Theorie) und einen **Python-Strang** (Programmierhandwerk). Die Klausur verlangt, Code von Hand zu schreiben – der Python-Strang ist deshalb vollwertig, systematisch aufbauend und wird ohne KI geübt (Phase 1) bzw. mit KI vertieft (ab Phase 2). Jedes Python-Konzept wird genau einmal eingeführt und danach in Aufgaben ständig wiederverwendet (Spiralprinzip).

## 22 Termine
| Nr | Informatik-Strang | Python-Strang (neu eingeführt) | Hook | Phase |
|---|---|---|---|---|
| V01 | Warum programmieren, wenn KI es kann? Wissens-Ampel | print, Variablen & Zuweisung, Kommentare, input, Namensregeln | KI-Rechnung um Faktor 1000 falsch | 1 |
| V02 | Bits, Binär, Hex, Zweierkomplement | int, int(text) für Eingaben, Rechenoperatoren (+ - * / // % **), Operatorrangfolge, bin()/hex()/int(x, 2) | Encoder-Zähler läuft über | 1 |
| V03 | Fließkommazahlen & Datentypen | float, type(), Typumwandlung int()/float()/str(), input → Zahl, f-Strings mit Format (:.2f), math-Modul, math.isclose | 0.1+0.2, Toleranzen addieren | 1 |
| V04 | Boolesche Logik | bool, Vergleichsoperatoren, and/or/not, if / elif / else, Einrückung | Zweihand-Sicherheitsschaltung | 1 |
| V05 | Problemanalyse & Programmablaufplan | PAP → Code, verschachtelte Verzweigungen, Eingabe prüfen | Der PAP wird zum Prompt | 1 |
| V06 | Algorithmen mit Wiederholung | while, for, range, break/continue, Zähler & Summen | Abkühlkurve, Newton-Verfahren | 1 |
| V07 | Zerlegung, KISS/DRY/SRP | def, Parameter, return, Default-Werte, Docstring, lokale Variablen | Wellen-Rechner aus Bausteinen | 1 |
| V08 | Datenstrukturen | Listen (Index, Slicing, append, len), for über Listen, Tupel, Dictionaries | Stückliste, Messreihe | 1 |
| V09 | Dateien & Fehler | Strings (split, strip), with open, csv-Modul, try/except | eigene Smartphone-Messdaten (phyphox) | 1 |
| V10 | Wie funktioniert KI? Tokens, Training, Halluzination | String-Methoden vertieft, List Comprehension, einfacher Tokenizer | warum KI selbstbewusst falsch liegt | 2 |
| V11 | Programmieren mit Copilot: spezifizieren, generieren, prüfen | import, Module & pip, Codespaces/VS Code, Copilot-Workflow | Prompt A vs. PAP als Prompt | 2 |
| V12 | Testen & Debuggen | assert, Testfälle schreiben, Tracebacks lesen, Debugger | Testfälle von Hand, Grenzwerte | 2 |
| V13 | Laufzeit-Intuition | NumPy-Arrays, Vektorisierung, Zeit messen | 1 Mio. Messpunkte: Schleife vs. Vektor | 2 |
| V14 | Visualisierung | matplotlib (plot, Achsen, Einheiten, Subplots) | Diagramme, die täuschen – Projekt-Kickoff | 3 |
| V15 | Datenanalyse | pandas (read_csv, Filtern, groupby, describe) | Cp/Cpk, SPC-Regelkarte | 3 |
| V16 | Rechner & Betriebssystem kompakt | pathlib/os, Dateien durchsuchen, Prozesse/Zeit | Warum ruckelt mein CAD? | 3 |
| V17 | Netzwerke & Industrie 4.0 | JSON, requests (HTTP-API abfragen) | IP/Subnetz einer Fertigungszelle, MQTT | 3 |
| V18 | IT-Sicherheit für Ingenieure | hashlib, Prüfsummen von Dateien | CRA, Firmware-Signatur, KI & vertrauliche Daten | 3 |
| V19 | Datenbanken & SQL | sqlite3, Parameter-Platzhalter | Fertigungsaufträge abfragen | 3 |
| V20 | Objekte & CAD-Automatisierung | class, __init__, Attribute, Methoden (lesen & einfach schreiben) | parametrisches Bauteil per Skript | 3 |
| V21 | Projektwerkstatt | Wiederholung nach Bedarf | Werkzeug fertigstellen | 3 |
| V22 | Code-Walkthroughs & Klausurtraining | Klausuraufgaben von Hand | eigenen Code erklären | 3 |

Freiwillige Deep Dives (Material aus 25/26): Bäume & Hash-Tabellen, RSA-Mathematik, Sockets, Generatoren, Big-O.

## Ablauf eines Termins (135 Min Präsenz + ca. 60 Min Training zu Hause)
Präsenz: 0–10 Warm-up (Vorhersagequiz, Wiederholung letztes Python-Konzept) · 10–35 Informatik-Theorie mit Explorable + Ampel-Diskussion · 35–80 Python-Werkstatt Teil 1 (vormachen, Parsons, Lücken, erste eigene Aufgabe) · 80–90 Pause · 90–120 Python-Werkstatt Teil 2 / KI-Spiegel · 120–135 Selbstcheck + Exit-Ticket + Auftrag fürs Training.
Zu Hause (~60 Min, fester Bestandteil, Selbststudium laut Modul 78 h): Training mit automatisch geprüften Code-Aufgaben im Browser, Klausur-Modus (Code erst „auf Papier“ schreiben, dann prüfen), Notebook, optional Deep Dive.

## Aufbau jeder Lektionsseite
1. Warum? – Hook aus dem Ingenieuralltag + Wissens-Ampel
2. Theorie – animiertes Erklärvideo (3–5 Min), interaktive Explorables, kompakter Lesetext
3. Python-Werkstatt – das Programmierkonzept des Tages: Syntax-Karte (Merkkasten), durchgerechnetes Beispiel (Worked Example), Ablaufverfolgung (Variablenbelegung Schritt für Schritt), Parsons-Puzzle (Zeilen ordnen), Lückencode, erste eigene Aufgabe mit automatischen Tests, typische Fehlermeldungen
4. Ausprobieren – Vorhersage-Aufgaben mit Python im Browser
5. KI-Spiegel – echte KI-Lösung mit eingebauten Fehlern: „Würdest du das freigeben?“
6. Selbstcheck – Quiz im Klausurformat, inkl. einer Code-Schreib-Aufgabe
7. Training zu Hause (eigene Seite, ~60 Min) – 6–8 gestufte Code-Aufgaben mit automatischen Tests (⭐ bis ⭐⭐⭐⭐), Klausur-Modus, Notebook-Link, Wiederholungsaufgabe zu einem früheren Konzept
8. Deep Dive (freiwillig)

Aufgabentypen nach Lernforschung für Programmier-Neulinge: Worked Example → Vorhersagen → Ablaufverfolgung → Parsons → Lücken → Fehler finden → selbst schreiben (Fading: Hilfen nehmen schrittweise ab).

Übergreifend (später): Glossar, Prompt-Bibliothek, Projektbereich, Klausurtrainer.

## Design
Corporate Style DHBW: Rot #E2001A, Weiß, Grautöne, Source Sans 3, viel Weißraum, Karten mit rotem Akzent links. Basis: `site/assets/css/dhbw-base.css` (aus 25/26). Sprache Deutsch, Du-Ansprache, locker aber fachlich präzise.
