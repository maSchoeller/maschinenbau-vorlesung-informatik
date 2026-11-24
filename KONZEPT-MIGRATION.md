# Konzeptpapier: Migration der Inhalte (Informatik T4MB1006, Campus Horb)

Stand: 2026-11-23, vom Dozenten übernommen. Dieses Papier legt fest, für wen die Inhalte gebaut werden, was in den Kurs gehört und wie viel davon in die Zeit passt. `KONZEPT.md` ist auf diesen Stand umgeschrieben und enthält den Plan in Kurzform; dieses Papier hält die Herleitung, den Zielgruppen-Steckbrief und die Zuordnung des alten Materials fest.

Leitsatz des Kurses: **Erst der Ablauf, dann der Code.**

## 1. Anlass

Die vorhandenen Lektionen sind inhaltlich fertig, treffen aber an mehreren Stellen nicht:

- Die Beispiele sind allgemeiner Maschinenbau und passen zu wenig zum Campus Horb und zu den Studierenden dort.
- Sie passen nicht zum didaktischen Ziel des Dozenten.
- Die Gruppenarbeit (Projekt V14 bis V22) setzt mehr Programmierkönnen voraus, als im ersten Studienjahr da ist.
- Der Plan rechnet mit 22 Terminen; es sind 20.

## 2. Feste Vorgaben

### 2.1 Modulbeschreibung T4MB1006

Quelle: Modulhandbücher Maschinenbau der DHBW, Studienrichtungen Konstruktion und Entwicklung sowie Produktionstechnik (Horb), Stand 23.11.2026. Die Modulbeschreibung ist in beiden wortgleich.

- 1. Studienjahr, 5 ECTS, 150 h Workload: 72 h Präsenz, 78 h Selbststudium.
- Lehrformen: Vorlesung, Übung, Labor. Laborversuche können vorgesehen werden.
- Prüfungsleistung laut Handbuch: „Kombinierte Prüfung – Klausur < 50 % und Entwurf“, benotet.
- Fachkompetenz: einfachere Programme in einer höheren Programmiersprache entwickeln; grundlegende Funktionsweise eines Digitalrechners und die interne Datenverarbeitung verstehen.
- Methodenkompetenz: eine Problemstellung analysieren, die Lösung als Algorithmus formulieren und in geeigneter Notation dokumentieren; Vertiefungsthemen im betrieblichen Umfeld einordnen und bewerten.

Inhalte laut Handbuch:

| Block | Inhalt | Verbindlichkeit |
|---|---|---|
| Grundlagen der Datenverarbeitung | Problemanalyse, Algorithmen formulieren, Dokumentation in allgemeiner Notation; Zahlensysteme (dezimal, binär, hexadezimal); Operatoren, boolesche Operationen, Bitoperationen; Datentypen | Pflicht |
| Grundlagen der Programmierung | Konstanten und Variablen (Deklaration, Initialisierung, Namespaces); Ein- und Ausgabe, Ausgabeformatierung; Verzweigungen, Schleifen; Unterprogramme, Prozeduren, Funktionen | Pflicht |
| Vertiefung | „Didaktisch geeignete Auswahl“, z. B. Rechneraufbau, erweiterte Programmiertechniken (strukturierte Datentypen, Dateien, Grafik, OOP …), Betriebssysteme, Datenbanken | Auswahl frei |

### 2.2 Prüfung (Festlegung des Dozenten)

- Eine schriftliche Klausur am Ende des 2. Semesters. Der „Entwurf“ aus dem Handbuch ist Teil dieser Klausur.
- Entwurfs- und Programmierteil über 60 %, Theorie unter 40 %.
- Programmieranteil heißt nicht Quellcode schreiben. Aufgabenformen:
  - Programmablaufplan (PAP) zu einer Aufgabenstellung zeichnen,
  - PAP in Quellcode übertragen,
  - Quellcode lesen und verstehen (Ausgabe bestimmen, Ablauf verfolgen, Fehler finden, als PAP darstellen).
- Code schreiben wird nur verlangt, wenn ein PAP zu übertragen ist oder die Lösung weniger als 8 Zeilen braucht.
- Theorieteil: Pflichttheorie mit kleinen Rechenaufgaben (Dezimal, Binär, Hex umrechnen, Wahrheitstabelle ausfüllen, Datentyp bestimmen). Vertiefungsthemen nur als Verständnisfragen.
- Keine Hilfsmittel. Die Syntax der Kursbausteine und die PAP-Symbole müssen im Kopf sein.

### 2.3 Zeit

- 20 Termine à 135 Minuten: 10 im 1. Semester, 10 im 2. Semester, dazwischen rund drei Monate Praxisphase.
- Aufteilung der Vorlesungszeit: rund 60 % Programmierung, rund 40 % Theorie aus dem Modulplan.
- Jeder Termin ist gemischt und hat denselben Ablauf:

| Minuten | Inhalt |
|---|---|
| 0–10 | Warm-up, Rückblick |
| 10–40 | Theorie-Block |
| 40–70 | Programmieren 1: PAP zuerst |
| 70–80 | Pause |
| 80–110 | Programmieren 2: Code |
| 110–135 | Programmieren 3 oder zweiter Theorie-Block |

- Daraus folgt das Budget: 4 Blöcke je Termin, 80 Blöcke insgesamt, davon 48 Programmierung und 32 Theorie; je Semester 24 und 16.

## 3. Entscheidungen

| Thema | Entscheidung |
|---|---|
| Leitsatz | „Erst der Ablauf, dann der Code.“ Programmieren ist Denken in Abläufen; wer den Ablauf zeichnen kann, kann ihn programmieren. Ersetzt „KI schreibt Code – Ingenieure spezifizieren, prüfen und verantworten“. |
| Lernziel | Beides, Bauen zuerst: erst selbst ein Programm bauen können, weil nur das zum Verstehen führt; Lesen und Beurteilen von Code kommt dazu. |
| Zielbild | Ein Programm in der Größe von „Schiffe versenken“ ohne Hilfe des Dozenten schreiben. Hoch gesteckt. |
| Projekt | Die freie Gruppenarbeit entfällt. Im 2. Semester baut jede und jeder einzeln „Schiffe versenken“ gegen den Computer. Die Führung nimmt von Teil zu Teil ab: am Anfang Vorgabe Zeile für Zeile, am Ende nur noch die Aufgabe. |
| Abschluss 1. Semester | Zahlenraten als kleines vollständiges Spiel. |
| KI | Durchgehend nur Erklärer. Programmieren mit Copilot kommt nicht vor. |
| Tempo | Maßstab ist die Mitte der Gruppe. |
| Beispielwelt | Spiele und Rätsel, Alltag der Studierenden, dazu Vorgriffe auf spätere Module (Abschnitt 4.3). Keine Beispiele, die Maschinenbau-Fachwissen voraussetzen. |
| Python-Umfang | Variablen, Ein- und Ausgabe, Verzweigungen, Schleifen, Funktionen, Listen (auch als Raster), Zufallszahlen, Dateien lesen und schreiben, Diagramm nach Vorlage. Sonst nichts. |
| Vertiefungstheorie | Datenbanken, Netzwerke und IT-Sicherheit, Wie funktioniert KI? |
| Code lesen | Keine eigene Einheit, sondern Aufgabenform in jedem Termin. Der Abschnitt „KI-Spiegel“ wird zu „Fehler finden“ ohne KI-Rahmen. |
| Bauteile in 3D | Der CAD-Teil aus V20 bleibt als Beispielwelt: `bauteil3d` und 3D-Vorschau liefern je eine Aufgabe in Schleifen, Funktionen und Listen. Keine Klassen, keine eigenen Blöcke. |
| Seiten | Eine Seite je Termin im Lernpfad; je Termin Lerneinheit und Programmierlabor wie bisher. |
| Training zu Hause | Pflicht, 45 Minuten je Termin, dazu eine Warm-up-Aufgabe zu Beginn des nächsten Termins. |
| Klausur-Modus | Umbau auf die Klausurformen: PAP zeichnen, PAP in Code übertragen, Ausgabe vorhersagen; Code schreiben nur bei Lösungen unter 8 Zeilen. |
| Wissens-Ampel | Entfällt. |
| Erklärvideos | Theorie-Videos mit bleibendem Stoff prüfen und weiterverwenden; Python- und Beispiel-Videos neu, sobald die Inhalte stehen. |
| Entfallene Lektionen | Kommen aus der App und werden nicht nach MDX übertragen. |
| „Wie funktioniert KI?“ | Bleibt in Termin 12 und 13, kein Vorgriff in Termin 01. |
| Präsenzzeit | 20 Termine sind so vorgegeben; die Differenz zu 72 h im Handbuch muss das Konzept nicht erklären. |
| Notation | PAP statt Struktogramm bleibt. |

## 4. Zielgruppe

### 4.1 Steckbrief (Angaben des Dozenten, 2026-11-23)

| Merkmal | Stand |
|---|---|
| Gruppe | rund 25 Studierende in einem Raum, Konstruktion und Entwicklung und Produktionstechnik gemeinsam |
| Vorbildung | gemischt: allgemeines Abitur, Technisches Gymnasium, Fachhochschulreife, Ausbildung vor dem Studium |
| Programmiererfahrung | fast niemand |
| Betriebe | mittelständischer Maschinen- und Anlagenbau, kleine Betriebe |
| Software im Betrieb | CAD und Excel; im ersten Jahr teils kaum Arbeit am Rechner |
| Geräte im Hörsaal | Laptop oder Tablet, gemischt |
| Selbststudium | wenige üben regelmäßig |
| Umgang mit KI | Lösungen werden kopiert, ohne sie zu verstehen |
| Haltung | Pflichtfach, das man bestehen will; Angst vor dem Fach; anfangs neugierig, aber schnell frustriert; „braucht man nicht, gibt ja KI“ |
| Abbruchstellen 25/26 | Schleifen, Funktionen, Listen und Datenstrukturen, der Weg vom Problem zum Programm. Verzweigungen gingen noch. |
| Klausur 25/26 | ordentlich ausgefallen, obwohl Code von Hand verlangt war |
| Pause zwischen den Semestern | rund drei Monate; die Grundlagen bleiben hängen |

In einem Satz: Anfängerinnen und Anfänger ohne Vorerfahrung, die das Fach als Pflicht sehen, im Hörsaal lernen und nicht zu Hause, bei der ersten Fehlermeldung zur KI greifen und bisher an der Stelle aussteigen, an der aus einzelnen Befehlen ein Programm werden soll.

### 4.2 Was daraus folgt

1. **Geübt wird im Termin, gefestigt zu Hause.** Weil bisher wenige zu Hause üben, muss alles Klausurrelevante im Hörsaal mindestens einmal selbst gemacht worden sein. Das begrenzt den Stoff stärker als die Stundenzahl. Das Training zu Hause ist trotzdem Pflicht (45 Minuten je Termin); die Warm-up-Aufgabe des nächsten Termins greift es auf.
2. **Der PAP ist Werkzeug ab dem ersten Termin, kein eigenes Thema.** Die schwerste Abbruchstelle ist der Weg vom Problem zum Programm. Bisher steht der PAP in einem Termin (V05). Er begleitet künftig das Programmieren in jedem Termin: Ein neuer Ablauf wird zuerst gezeichnet, dann kommt der Code. Das ist zugleich das Klausurformat. Nicht jede Programmieraufgabe muss mit einem PAP beginnen (Festlegung des Dozenten, 2026-11-24).
3. **Die Programmierzeit liegt hinter den Verzweigungen.** Variablen, Ein- und Ausgabe und Verzweigungen gingen im Vorjahr; Schleifen, Funktionen und Listen nicht. Diese drei bekommen 19 der 48 Programmierblöcke, die beiden Spiele weitere 13.
4. **Beispiele dürfen kein zweites Fach sein.** Wellen, Passungen, Cp/Cpk und Sicherheitsschaltungen kennen die Studierenden noch nicht, sie wirken aufgesetzt und machen keinen Spaß. Spiele und Alltag versteht jeder sofort. Vorgriffe auf spätere Module nur in einer Form, die ohne Vorwissen auskommt.
5. **Früh etwas, das läuft und Spaß macht.** Gegen Angst und schnellen Frust: kleine Schritte, in jedem Termin ein lauffähiges Ergebnis, Fehlermeldungen lesen als eigener Inhalt statt als Störung.
6. **Aufgaben, bei denen Kopieren nichts bringt.** PAP von Hand zeichnen, Ablauf verfolgen, Ausgabe vorhersagen, Fehler finden. Der Tutor der Lern-App bleibt Erklärer.
7. **Wenig Tipparbeit.** Ein Teil arbeitet am Tablet. PAP-Editor, Zeilen ordnen, Lückencode und Ablaufverfolgung gehen ohne große Tastatur; lange Programme frei tippen geht dort schlecht.
8. **Zwei Semester, zwei Aufgaben.** 1. Semester: die Bausteine bis zu einem kleinen vollständigen Spiel. Termin 11 beginnt mit einem Auffrischer. 2. Semester: Listen, Schiffe versenken, Vertiefungstheorie.
9. **Die Klausurnote ist nicht der Maßstab.** Die Klausur 25/26 fiel ordentlich aus, obwohl die Studierenden bei Schleifen ausgestiegen sind. Ob der Kurs sein Ziel erreicht, zeigt der letzte, offene Teil von Schiffe versenken.

### 4.3 Anschluss an spätere Module

Was den Studierenden in späteren Vorlesungen hilft (Modulhandbücher Horb, KE und PT). Alle vier Bereiche werden vorbereitet.

| Bereich | Spätere Module | Was Informatik vorbereitet | Form ohne Vorwissen |
|---|---|---|---|
| Mathematik, läuft parallel | Mathematik I (Vektoren, Matrizen, lineare Gleichungssysteme), Mathematik II (Folgen, Reihen, Funktionen) | Listen und Raster mit Zeile und Spalte, Schleifen als Folgen und Summen, Funktionen als Eingabe und Ausgabe | Spielfeld als Raster, Summen und Folgen ausrechnen lassen |
| Messwerte auswerten | Messtechnik (2. Jahr), Data Science im Maschinenbau (Wahlmodul), Qualitätsmanagement (3. Jahr) | Listen von Zahlen durchgehen, Mittelwert, Minimum, Maximum, Ausreißer, Rundung | Noten, Laufzeiten, Temperaturen, Würfelstatistik |
| Abläufe und Zustände | Steuerungstechnik mit SPS (3. Jahr), Roboterprogrammierung in Handhabungstechnik und Automation (PT), Regelungstechnik (2. Jahr) | Bedingungen, Zustände, Schrittketten; der PAP als Vorstufe | Ampel, Getränkeautomat, Spielzug |
| Rechnen in Schritten | Mathematik III (optional numerische Methoden), Simulationstechnik (KE, 3. Jahr), MATLAB/Simulink in Regelungstechnik | etwas in kleinen Zeitschritten ausrechnen, Näherungen, Genauigkeit von Kommazahlen | Sparplan, abkühlender Kaffee, fallender Ball |

## 5. Themen auf hoher Ebene

### 5.1 Programmierstrang (48 Blöcke)

| Nr | Einheit | Blöcke | Semester | Beispielwelt | Anschluss |
|---|---|---|---|---|---|
| P1 | Variablen, Ein- und Ausgabe, Ausgabe formatieren | 3 | 1 | Alltag: Trinkgeld, Pendelstrecke, Einheiten | – |
| P2 | Verzweigungen | 4 | 1 | Ampel, Getränkeautomat, Schere-Stein-Papier | Abläufe und Zustände |
| P3 | Schleifen (while, for) | 7 | 1 | Würfeln, Countdown, Summen und Folgen, Sparplan; 3D: Turm oder Lochreihe | Mathematik II, Rechnen in Schritten |
| P4 | Funktionen, lokale und globale Namen | 6 | 1 | Bausteine für das Spiel, Umrechner; 3D: Bauteil mit Parametern | Mathematik II |
| P5 | Zahlenraten: erstes vollständiges Spiel | 4 | 1 | Spiel | – |
| P6 | Auffrischer nach der Praxisphase | 2 | 2 | Zahlenraten ausbauen | – |
| P7 | Listen | 6 | 2 | Punktestände, Würfelstatistik, Noten; 3D: gestufte Welle aus einer Liste | Mathematik I, Messwerte |
| P8 | Messwerte auswerten: Datei lesen, Mittelwert, Minimum, Maximum, Diagramm nach Vorlage | 3 | 2 | Temperaturen, Laufzeiten | Messwerte |
| P9 | Raster (Liste in Liste) | 2 | 2 | Spielfeld mit Zeile und Spalte | Mathematik I |
| P10 | Schiffe versenken gegen den Computer, Führung nimmt ab | 9 | 2 | Spiel | – |
| P11 | Klausurtraining Programmierteil | 2 | 2 | – | – |

In jedem Termin, ohne eigene Blöcke:

- **PAP zuerst.** Ein neuer Ablauf wird zuerst gezeichnet; nicht jede Programmieraufgabe muss mit einem PAP beginnen.
- **Code lesen und beurteilen.** Ablauf verfolgen, Ausgabe vorhersagen, Fehler finden, Code als PAP darstellen.
- **Fehlermeldungen lesen.**

### 5.2 Theoriestrang (32 Blöcke)

| Nr | Einheit | Blöcke | Semester | Tiefe | Passt zeitlich zu |
|---|---|---|---|---|---|
| T1 | Problemanalyse, Algorithmus, PAP-Symbole | 2 | 1 | anwenden | P1 |
| T2 | Boolesche Logik: und, oder, nicht, Wahrheitstabelle | 3 | 1 | rechnen | P2 |
| T3 | Zahlensysteme: dezimal, binär, hexadezimal | 4 | 1 | rechnen | P3 (Umrechnen als Schleife) |
| T4 | Bitoperationen | 1 | 1 | rechnen, einfach | P3 |
| T5 | Datentypen, Kommazahlen und ihre Genauigkeit | 3 | 1 | rechnen, einfach | P4 |
| T6 | Aufbau und Funktion eines Rechners | 3 | 1 | verstehen | P5 |
| T7 | Auffrischer Pflichttheorie | 1 | 2 | rechnen | P6 |
| T8 | Wie funktioniert KI? | 3 | 2 | verstehen | P7 |
| T9 | Datenbanken | 3 | 2 | verstehen | P8 |
| T10 | Netzwerke und IT-Sicherheit | 5 | 2 | verstehen | P10 |
| T11 | Klausurtraining Theorieteil | 2 | 2 | – | P11 |
| – | Puffer | 2 | 2 | – | – |

### 5.3 Abdeckung des Modulhandbuchs

| Inhalt laut Handbuch | Einheit |
|---|---|
| Problemanalyse, Algorithmen, Dokumentation in Notation | T1, dazu PAP in jedem Termin |
| Zahlensysteme | T3 |
| Operatoren, boolesche Operationen, Bitoperationen | P1, T2, T4 |
| Datentypen | T5 |
| Konstanten und Variablen, Namespaces | P1, P4 |
| Ein- und Ausgabe, Ausgabeformatierung | P1 |
| Verzweigungen, Schleifen | P2, P3 |
| Unterprogramme, Prozeduren, Funktionen | P4 |
| Vertiefung: Rechneraufbau | T6 |
| Vertiefung: strukturierte Datentypen, Dateiverarbeitung, Grafikfunktionen | P7, P9, P8 |
| Vertiefung: Datenbanken | T9 |
| Fachkompetenz „Funktionsweise eines Digitalrechners und interne Datenverarbeitung“ | T3, T5, T6 |

Alle Pflichtinhalte sind abgedeckt. Netzwerke, IT-Sicherheit und KI stehen nicht im Handbuch; sie laufen unter der freien Auswahl vertiefender Themen.

### 5.4 Was gegenüber dem bisherigen Plan entfällt

- Python: Dictionaries, Tupel, try/except, List Comprehension, vertiefte String-Methoden, Module und pip, assert und Debugger, NumPy, pandas, pathlib/os, JSON und requests, hashlib, sqlite3, Klassen.
- Themen: Programmieren mit Copilot, Testen und Debuggen von KI-Code, Laufzeit-Intuition, Datenanalyse, Betriebssystem, Objekte und CAD-Automatisierung, Projektwerkstatt, Code-Walkthroughs.
- Rechenaufgaben zu Zweierkomplement, Subnetzen und SQL.
- Freies Projekt mit Themenkatalog, Projektzeit, Testat und Feedback-Raster.

## 6. Umfang je Termin

Erste Verteilung der Blöcke. Jeder Termin hat 4 Blöcke; T steht für Theorie, P für Programmieren.

### 1. Semester

| Termin | Theorie | Programmieren |
|---|---|---|
| 01 | T1 Problemanalyse, PAP-Symbole (2) | P1 Variablen, Ein- und Ausgabe (2) |
| 02 | T2 Boolesche Logik (1) | P1 Abschluss (1), P2 Verzweigungen (2) |
| 03 | T2 Boolesche Logik (2) | P2 Verzweigungen (2) |
| 04 | T3 Zahlensysteme (2) | P3 Schleifen (2) |
| 05 | T3 Zahlensysteme (1) | P3 Schleifen (3) |
| 06 | T3 Zahlensysteme (1), T4 Bitoperationen (1) | P3 Schleifen (2) |
| 07 | T5 Datentypen (2) | P4 Funktionen (2) |
| 08 | T5 Datentypen (1) | P4 Funktionen (3) |
| 09 | T6 Rechneraufbau (2) | P4 Funktionen (1), P5 Zahlenraten (1) |
| 10 | T6 Rechneraufbau (1) | P5 Zahlenraten (3) |

### 2. Semester

| Termin | Theorie | Programmieren |
|---|---|---|
| 11 | T7 Auffrischer (1) | P6 Auffrischer (2), P7 Listen (1) |
| 12 | T8 Wie funktioniert KI? (2) | P7 Listen (2) |
| 13 | T8 Wie funktioniert KI? (1) | P7 Listen (3) |
| 14 | T9 Datenbanken (2) | P8 Messwerte auswerten (2) |
| 15 | T9 Datenbanken (1) | P8 Messwerte auswerten (1), P9 Raster (2) |
| 16 | T10 Netzwerke (2) | P10 Schiffe versenken (2) |
| 17 | T10 Netzwerke und IT-Sicherheit (1) | P10 Schiffe versenken (3) |
| 18 | T10 IT-Sicherheit (2) | P10 Schiffe versenken (2) |
| 19 | Puffer (2) | P10 Schiffe versenken (2) |
| 20 | T11 Klausurtraining (2) | P11 Klausurtraining (2) |

### Einschätzung

- **Kein Puffer im 1. Semester.** Fällt ein Termin aus oder dauert Schleifen länger, muss etwas weichen. Vorschlag für die Reihenfolge des Weichens: T6 Rechneraufbau rückt in den Puffer des 2. Semesters, danach T4 Bitoperationen auf einen halben Block.
- **Der vierte Block hat 25 statt 30 Minuten.** 80 Blöcke sind die Obergrenze, nicht der Erwartungswert.
- **Zielbild.** 48 Blöcke sind 24 Stunden Programmieren im Hörsaal, bei wenig Übung zu Hause. Dass die Mitte der Gruppe Schiffe versenken geführt fertig baut und den Code lesen und ändern kann, ist damit erreichbar. Dass sie ein Programm dieser Größe ganz allein entwirft, ist für das obere Drittel realistisch, für die Mitte nicht gesichert. Das ist eine Einschätzung, kein Messwert.
- **Keine Hilfsmittel in der Klausur.** Die Syntax muss sitzen. Das spricht für den kleinen Python-Umfang und dafür, „PAP in Code“ im Training ohne Autovervollständigung zu üben. Funktionen aus `bauteil3d` können in der Klausur nicht vorausgesetzt werden.
- **Schiffe versenken braucht eine kleine Fassung:** ein Raster, der Computer setzt die Schiffe zufällig, die Person schießt, bis alles versenkt ist. Zuerst Schiffe der Länge 1, längere Schiffe als Ausbau für die Schnellen.

## 7. Folgen für das vorhandene Material

Erste Zuordnung der 22 vorhandenen Lektionen. „Stoff“ heißt: Erklärungen, Aufgabentypen und Explorables lassen sich übernehmen; Hooks und vorgerechnete Beispiele werden überall ersetzt.

| Vorhanden | Künftig |
|---|---|
| V01 Warum programmieren? | Stoff für P1; Einstieg neu mit dem Leitsatz statt mit der KI-Leitidee |
| V02 Bits, Binär, Hex | Stoff für T3, T4; ohne Zweierkomplement-Rechnen |
| V03 Fließkommazahlen und Datentypen | Stoff für T5 |
| V04 Logik und Verzweigungen | Stoff für T2, P2 |
| V05 Programmablaufplan | Stoff für T1; PAP-Aufgaben wandern in alle Einheiten |
| V06 Schleifen | Stoff für P3, wird von einem auf drei Termine gestreckt |
| V07 Funktionen | Stoff für P4, wird gestreckt |
| V08 Datenstrukturen | nur Listen für P7; Tupel und Dictionaries entfallen |
| V09 Dateien und Fehler | nur Dateien lesen für P8 |
| V10 Wie funktioniert KI? | Stoff für T8, ohne Python-Teil |
| V14 Visualisierung | nur Diagramm nach Vorlage für P8 |
| V16 Rechner und Betriebssystem | Rechner-Teil für T6 |
| V17 Netzwerke, V18 IT-Sicherheit | Stoff für T10, nur Verständnis, ohne Python-Teil |
| V19 Datenbanken und SQL | Stoff für T9, nur Verständnis, ohne sqlite3 |
| V22 Klausurtraining | Stoff für P11, T11; Aufgaben auf das neue Klausurformat |
| V20 Objekte und CAD-Automatisierung | Klassen entfallen; `bauteil3d` und 3D-Vorschau werden Beispielwelt in P3, P4, P7 |
| V11, V12, V13, V15, V21 | entfallen, kommen aus der App, keine Übertragung nach MDX |
| Erklärvideos | Theorie-Videos mit bleibendem Stoff prüfen und weiterverwenden; Python- und Beispiel-Videos neu |
| Wissens-Ampel, KI-Spiegel | Ampel entfällt auf allen Seiten; KI-Spiegel wird „Fehler finden“ |
| `site/projekt.html` | entfällt; an die Stelle tritt die Schrittfolge für Schiffe versenken (P10) |
| Probeklausur 2026/27, Klausurtrainer | Teil B5 „Kurze Programmieraufgaben“ und Klausur-Modus (Code auf Papier) umbauen; Theorieteil auf die neue Auswahl |
| `KONZEPT.md` | umgeschrieben (2026-11-23) |
| `app/kurs.yaml`, `DESIGN.md`, `briefing/LEKTION-BRIEF.md`, `README.md` | 20 statt 22 Termine, neue Einheiten, Phasen „Werkzeug“ und „Projekt“ entfallen; noch nicht nachgezogen |

Neu zu bauen, ohne Vorlage: P5 Zahlenraten, P6 und T7 Auffrischer, P9 Raster, P10 Schiffe versenken mit abnehmender Führung.

## 8. Offene Punkte

Keine. Die Punkte aus der ersten Fassung (Hilfsmittel, Präsenzzeit, Reihenfolge der Vertiefung, Seitenaufbau, Wissens-Ampel, KI-Spiegel, Klausur-Modus, entfallene Lektionen, Videos) sind am 2026-11-23 entschieden und stehen in Abschnitt 3.
