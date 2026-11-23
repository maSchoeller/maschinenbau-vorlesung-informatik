# Konzept: Informatik (T4MB1006) – Maschinenbau, DHBW Stuttgart Campus Horb, 2026/27

Stand: 2026-11-23. Herleitung, Zielgruppen-Steckbrief und die Zuordnung des alten Materials (22 Lektionen V01–V22) stehen in `KONZEPT-MIGRATION.md`.

## Rahmen

- Modul T4MB1006 „Informatik“, 1. Studienjahr, 5 ECTS, 72 h Präsenz, 78 h Selbststudium.
- 20 Termine à 135 Minuten: 10 im 1. Semester, 10 im 2. Semester, dazwischen rund drei Monate Praxisphase.
- Rund 60 % der Vorlesungszeit Programmieren, rund 40 % Theorie.
- Prüfung: eine schriftliche Klausur am Ende des 2. Semesters (Abschnitt „Klausur“).
- KI: Der Tutor der Lern-App erklärt, verrät aber keine Lösungen. Programmieren mit Copilot kommt nicht vor.

## Leitsatz

**Erst der Ablauf, dann der Code.**

Programmieren ist Denken in Abläufen. Wer den Ablauf zeichnen kann, kann ihn programmieren. Deshalb beginnt jede Programmieraufgabe ab dem ersten Termin mit einem Programmablaufplan (PAP, DIN 66001); der Code kommt danach.

Lernziel: Beides, Bauen zuerst. Die Studierenden können erst selbst ein Programm bauen, weil nur das zum Verstehen führt, und sie können fremden Code lesen und beurteilen.

Zielbild: ein Programm in der Größe von „Schiffe versenken“ ohne Hilfe des Dozenten schreiben. Das ist hoch gesteckt; erreichbar ist es sicher für das obere Drittel, die Mitte der Gruppe baut das Spiel geführt und kann den Code lesen und ändern.

## Zielgruppe

Rund 25 Studierende in einem Raum, Konstruktion und Entwicklung und Produktionstechnik gemeinsam. Vorbildung gemischt, fast niemand hat programmiert. Sie sehen das Fach als Pflicht, viele haben Angst davor oder sind schnell frustriert. Gelernt wird im Hörsaal, wenige üben zu Hause. Gearbeitet wird am Laptop oder Tablet. KI-Lösungen werden bisher kopiert, ohne sie zu verstehen. Im Vorjahr sind die Studierenden bei Schleifen, Funktionen, Listen und beim Weg vom Problem zum Programm ausgestiegen.

Daraus folgen die Regeln für alle Inhalte:

1. **Geübt wird im Termin, gefestigt zu Hause.** Alles Klausurrelevante wird im Hörsaal mindestens einmal selbst gemacht. Das Training zu Hause ist Pflicht: 45 Minuten je Termin. Der nächste Termin beginnt mit einer Warm-up-Aufgabe daraus.
2. **PAP zuerst**, in jeder Programmieraufgabe.
3. **Tempo nach der Mitte der Gruppe.** Schnelle bekommen Ausbauaufgaben.
4. **Beispiele ohne Fachwissen.** Spiele und Rätsel, Alltag der Studierenden, Bauteile in 3D, dazu Vorgriffe auf spätere Module in einer Form, die ohne Vorwissen auskommt. Keine Auslegungsrechnungen, Passungen, Sicherheitsschaltungen oder Prozessfähigkeit.
5. **In jedem Termin läuft etwas.** Kleine Schritte, ein lauffähiges Ergebnis, Fehlermeldungen lesen als Inhalt.
6. **Aufgaben, bei denen Kopieren nichts bringt.** PAP zeichnen, Ablauf verfolgen, Ausgabe vorhersagen, Fehler finden.
7. **Wenig Tipparbeit.** PAP-Editor, Zeilen ordnen, Lückencode und Ablaufverfolgung müssen auch am Tablet gehen.

Vorgriffe auf spätere Module:

| Bereich | Spätere Module | Form ohne Vorwissen |
|---|---|---|
| Mathematik (parallel) | Mathematik I und II | Spielfeld als Raster, Summen und Folgen als Schleifen, Funktionen als Eingabe und Ausgabe |
| Messwerte auswerten | Messtechnik, Data Science im Maschinenbau, Qualitätsmanagement | Noten, Laufzeiten, Temperaturen, Würfelstatistik: Mittelwert, Minimum, Maximum |
| Abläufe und Zustände | Steuerungstechnik, Robotik, Regelungstechnik | Ampel, Getränkeautomat, Spielzug |
| Rechnen in Schritten | Mathematik III, Simulationstechnik, MATLAB/Simulink | Sparplan, abkühlender Kaffee, fallender Ball |

## Zwei Stränge

Jeder Termin hat 4 Blöcke à 30 Minuten. Zusammen sind das 80 Blöcke: 48 Programmieren, 32 Theorie. Eine Einheit läuft über mehrere Termine.

### Programmierstrang (48 Blöcke)

| Nr | Einheit | Blöcke | Semester | Beispielwelt |
|---|---|---|---|---|
| P1 | Variablen, Ein- und Ausgabe, Ausgabe formatieren | 3 | 1 | Trinkgeld, Pendelstrecke, Einheiten |
| P2 | Verzweigungen | 4 | 1 | Ampel, Getränkeautomat, Schere-Stein-Papier |
| P3 | Schleifen (while, for) | 7 | 1 | Würfeln, Countdown, Summen und Folgen, Sparplan; 3D: Turm oder Lochreihe aus Körpern |
| P4 | Funktionen, lokale und globale Namen | 6 | 1 | Bausteine für das Spiel, Umrechner; 3D: Parameter ändern, Bauteil ändert sich |
| P5 | Zahlenraten: erstes vollständiges Spiel | 4 | 1 | Spiel |
| P6 | Auffrischer nach der Praxisphase | 2 | 2 | Zahlenraten ausbauen |
| P7 | Listen | 6 | 2 | Punktestände, Würfelstatistik, Noten; 3D: gestufte Welle aus einer Liste |
| P8 | Messwerte auswerten: Datei lesen, Mittelwert, Minimum, Maximum, Diagramm nach Vorlage | 3 | 2 | Temperaturen, Laufzeiten |
| P9 | Raster (Liste in Liste) | 2 | 2 | Spielfeld mit Zeile und Spalte |
| P10 | Schiffe versenken gegen den Computer | 9 | 2 | Spiel |
| P11 | Klausurtraining Programmierteil | 2 | 2 | – |

Python-Umfang: Variablen, Ein- und Ausgabe, Verzweigungen, Schleifen, Funktionen, Listen (auch als Raster), Zufallszahlen, Dateien lesen und schreiben, Diagramm nach Vorlage. Sonst nichts: keine Dictionaries, Tupel, try/except, List Comprehension, NumPy, pandas, Datenbankzugriff, Klassen.

Jedes Konstrukt wird einmal eingeführt und danach in den Aufgaben ständig wiederverwendet.

Bauteile in 3D: Das mitgelieferte Modul `bauteil3d` (Zylinder, Ring, Welle, Flansch, verschieben, zusammensetzen) und die 3D-Vorschau liefern in P3, P4 und P7 je eine Aufgabe mit sichtbarem Ergebnis. Es sind reine Funktionsaufrufe, keine Klassen, und es gibt dafür keine eigenen Blöcke. In der Klausur werden die Funktionen von `bauteil3d` nicht vorausgesetzt.

In jedem Termin, ohne eigene Blöcke: PAP zuerst, Code lesen und beurteilen, Fehlermeldungen lesen.

Schiffe versenken (P10): Jede und jeder baut das Spiel einzeln. Die Führung nimmt von Teil zu Teil ab: am Anfang Vorgabe Zeile für Zeile, am Ende nur noch die Aufgabe. Kleine Fassung: ein Raster, der Computer setzt die Schiffe zufällig, die Person schießt, bis alles versenkt ist. Zuerst Schiffe der Länge 1; längere Schiffe sind Ausbau für die Schnellen. Eine freie Gruppenarbeit gibt es nicht.

### Theoriestrang (32 Blöcke)

| Nr | Einheit | Blöcke | Semester | Tiefe |
|---|---|---|---|---|
| T1 | Problemanalyse, Algorithmus, PAP-Symbole | 2 | 1 | anwenden |
| T2 | Boolesche Logik: und, oder, nicht, Wahrheitstabelle | 3 | 1 | rechnen |
| T3 | Zahlensysteme: dezimal, binär, hexadezimal | 4 | 1 | rechnen |
| T4 | Bitoperationen | 1 | 1 | rechnen, einfach |
| T5 | Datentypen, Kommazahlen und ihre Genauigkeit | 3 | 1 | rechnen, einfach |
| T6 | Aufbau und Funktion eines Rechners | 3 | 1 | verstehen |
| T7 | Auffrischer Pflichttheorie | 1 | 2 | rechnen |
| T8 | Wie funktioniert KI? | 3 | 2 | verstehen |
| T9 | Datenbanken | 3 | 2 | verstehen |
| T10 | Netzwerke und IT-Sicherheit | 5 | 2 | verstehen |
| T11 | Klausurtraining Theorieteil | 2 | 2 | – |
| – | Puffer | 2 | 2 | – |

T1 bis T6 sind die Pflichtinhalte des Modulhandbuchs; T8 bis T10 sind die frei gewählten Vertiefungsthemen.

## 20 Termine

In Klammern die Zahl der Blöcke.

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
| | *Praxisphase, rund drei Monate* | |
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

Das 1. Semester hat keinen Puffer. Wird die Zeit knapp, rückt zuerst T6 Rechneraufbau in den Puffer des 2. Semesters, danach schrumpft T4 Bitoperationen auf einen halben Block.

## Ablauf eines Termins (135 Minuten)

| Minuten | Inhalt |
|---|---|
| 0–10 | Warm-up-Aufgabe aus dem Training, Rückblick |
| 10–40 | Theorie-Block |
| 40–70 | Programmieren 1: PAP zuerst |
| 70–80 | Pause |
| 80–110 | Programmieren 2: Code |
| 110–135 | Programmieren 3 oder zweiter Theorie-Block |

## Klausur

- Rein schriftlich. Der „Entwurf“ aus dem Modulhandbuch („Kombinierte Prüfung – Klausur < 50 % und Entwurf“) ist Teil der Klausur.
- Entwurfs- und Programmierteil über 60 %, Theorie unter 40 %.
- Aufgabenformen im Programmierteil: PAP zu einer Aufgabenstellung zeichnen; PAP in Code übertragen; Code lesen und verstehen (Ausgabe bestimmen, Ablauf verfolgen, Fehler finden, als PAP darstellen).
- Code schreiben wird nur verlangt, wenn ein PAP zu übertragen ist oder die Lösung weniger als 8 Zeilen braucht.
- Theorieteil: T1 bis T6 mit kleinen Rechenaufgaben (umrechnen, Wahrheitstabelle ausfüllen, Datentyp bestimmen); T8 bis T10 nur als Verständnisfragen.
- Keine Hilfsmittel. Die Syntax der Kursbausteine und die PAP-Symbole müssen im Kopf sein; auch deshalb ist der Python-Umfang klein.

## Aufgabentypen

Nach Lernforschung für Programmier-Neulinge, mit abnehmender Hilfe (Fading):

Durchgerechnetes Beispiel → Ausgabe vorhersagen → Ablauf verfolgen (Variablenbelegung Schritt für Schritt) → Zeilen ordnen (Parsons) → Lückencode → Fehler finden → PAP zeichnen → PAP in Code übertragen → selbst bauen.

Die drei Klausurformen (PAP zeichnen, PAP in Code übertragen, Code lesen) kommen in jedem Termin vor.

## Seiten und Material

- **Eine Seite je Termin.** Der Lernpfad hat 20 Termine. Läuft eine Einheit über mehrere Termine, steht sie als Teil 1, 2, 3 auf den jeweiligen Terminseiten.
- **Je Termin zwei Seiten wie bisher:** Lerneinheit (verstehen, lineares Lesestück mit dem Theorie-Block und der Einführung ins Programmierthema) und Programmierlabor (Aufgaben im Termin und Training zu Hause). Einzelheiten in `DESIGN.md`.
- **Training zu Hause:** Pflicht, 45 Minuten je Termin, dazu die Warm-up-Aufgabe zu Beginn des nächsten Termins.
- **Klausur-Modus im Training:** PAP auf Papier zeichnen und mit der Musterlösung vergleichen; PAP ohne Autovervollständigung und ohne Befehls-Bibliothek in Code übertragen; Ausgabe eines Programms vorhersagen; Code schreiben nur bei Lösungen unter 8 Zeilen.
- **Fehler finden** ersetzt den Abschnitt „KI-Spiegel“: dieselbe Aufgabenform (Code lesen, Fehler finden, beurteilen), ohne die Behauptung, der Code stamme von einer KI.
- **Die Wissens-Ampel entfällt.**
- **Erklärvideos:** Theorie-Videos, deren Stoff bleibt, werden geprüft und weiterverwendet. Python- und Beispiel-Videos werden mit den neuen Beispielen neu produziert, sobald die Inhalte stehen.
- **Entfallene Lektionen** (V11, V12, V13, V15, V20, V21, Projektseite) kommen aus der App und werden nicht nach MDX übertragen. Aus V20 leben `bauteil3d` und die 3D-Vorschau als Beispielwelt weiter.

## Design

Corporate Style DHBW: Rot #E2001A, Weiß, Grautöne, Source Sans 3, viel Weißraum, Karten mit rotem Akzent links. Basis: `site/assets/css/dhbw-base.css`. Sprache Deutsch, Du-Ansprache, locker aber fachlich präzise. Einzelheiten in `DESIGN.md`.
