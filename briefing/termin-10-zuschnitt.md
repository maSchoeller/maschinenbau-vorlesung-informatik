# Zuschnitt Termin 10 (Entscheidungen vom 2026-11-27 eingearbeitet)

Aufbau und Ton wie `briefing/termin-07-zuschnitt.md`. Grundlage ist `briefing/termin-08-10-konzept.md` mit den Entscheidungen des Dozenten vom 2026-11-27. Termin 10 ist der **letzte Termin des 1. Semesters**; danach folgt die Praxisphase, Termin 11 beginnt mit den Auffrischern (T7, P6). Das Zahlenraten läuft über Termin 09 und 10: Stufe 1 steht in `briefing/termin-09-zuschnitt.md`, die Stufen 2 bis 4 hier. Alle Zahlen, Programme, Ausgaben, Fehlermeldungen und Testdaten sind mit Python 3.13 nachgerechnet (Pyodide 0.26.4 ist Python 3.12; die genannten Meldungen sind in beiden gleich). Die 6 offenen Fragen sind beantwortet und eingearbeitet (Liste „Entscheidungen des Dozenten“ am Ende).

## Aufteilung

| Einheit | Termin 10 |
|---|---|
| T6 Rechneraufbau, Teil 3 von 3 | Block 1: Speicher von schnell und klein bis langsam und groß, KB, MB und GB, Zeichen als Zahlen (ASCII) |
| P5 Zahlenraten, Teil 2 von 4 | Block 2: Stufe 2 „Raten, bis es stimmt“: Schleife und Hinweis |
| P5 Zahlenraten, Teil 3 von 4 | Block 3: Stufe 3 „Versuche zählen“, Zufallszahl vor der Schleife, Halbieren als Strategie |
| P5 Zahlenraten, Teil 4 von 4 | Block 4: Stufe 4 „Dein Spiel“: in Funktionen gliedern und fertigstellen, Ausbau und Knobel für die Schnellen, Ausblick, Hinweis für die Praxisphase |

Das Zahlenraten über beide Termine, mit abnehmender Führung (Konzept-Entscheidung 8):

| Stufe | Wo | Führung | Ergebnis |
|---|---|---|---|
| 1 Ein Tipp | Termin 09, Block 3 | Zeile für Zeile: Lückencode mit sechs Lücken, Plan vorgegeben; dazu Würfelraten als Übertragung | Zufallszahl, ein Tipp, `hinweis(geraten, geheim)` |
| 2 Raten, bis es stimmt | Termin 10, Block 2 | Plan zeichnen (Funktion vorgegeben), Code mit Kommentargerüst: jede Zeile eine Anweisung in Worten | `while geraten != geheim:` mit Hinweis in jeder Runde |
| 3 Versuche zählen | Termin 10, Block 3 | Aufgabe in Worten, Vorlage ist dein Code aus Stufe 2, kein Gerüst | `Versuche: n` am Ende |
| 4 Dein Spiel | Termin 10, Block 4 | nur die Aufgabe: in Funktionen gliedern (`hinweis`, `spiel`) | **Pflicht erfüllt** (Konzept-Entscheidung 7): jede und jeder hat ein eigenes lauffähiges Spiel |
| Ausbau | Block 4, für die Schnellen | nur die Aufgabe | begrenzte Versuche; „Noch einmal?“ |
| Knobel | freiwillig | nur die Aufgabe | „Computer rät“ (Halbieren, 7 Versuche reichen) |

Beispielwelt: Theorie Speicher im Spiel (Spielstand, Fotos, Zeichen eines Chats), Programmieren das Spiel Zahlenraten. Maschinenbau nur dort, wo es natürlich passt: nirgends erzwungen.

Reihenfolge: Die Theorie steht am Anfang (10 bis 40), das Zahlenraten füllt die drei folgenden Blöcke. So endet der letzte Termin mit dem fertigen Spiel und nicht mit Theorie. Die Pause liegt zwischen Block 2 und Block 3 (nur hier im Zuschnitt).

Abweichungen vom Konzept vorweg:

- **Kein Warm-up für Termin 11:** Termin 11 beginnt mit den Auffrischern (T7, P6). Das Training 10 ist stattdessen **freiwilliges** Wiederholungsmaterial für die Praxisphase (Entscheidung T10-3). Pflicht zu Hause sind nur Werkzeugkasten, Selbstcheck und Spiel sichern (15 Minuten); die Trainingsaufgaben tragen `data-count="0"`, die Knobelaufgabe zählt über `data-knobel` ohnehin nie mit; alle zählen nicht im Fortschritt.
- **Ausbau ist getestet** (anders als „Für Schnelle (nicht getestet)“ in Termin 07): Es sind zwei freiwillige Aufgaben mit Tests, damit die Schnellen eine Rückmeldung bekommen. Sie zählen wie die Knobelaufgabe nicht im Fortschritt.
- **`ord()` und `chr()` stehen nur als Lesekarte** (Station 1, Karte 4, ohne Aufgabe und ohne Klausurstoff, wie `**` in Termin 07; Entscheidung T10-2). ASCII bleibt sonst Theorie und Baustein.
- **Aus der Mitte `int((unten + oben) / 2)`:** Das Konzept sagt „halbieren“. Ohne `//` geht die Mitte mit `int()` auf eine Kommazahl (Termin 08, `int(3.7)` ergibt 3). Das ist keine Annahme, sondern folgt aus dem, was Termin 08 bringt; fällt `int(3.7)` aus Termin 08 heraus, fällt auch die Knobelaufgabe.

## Festlegungen für Termin 10

Es gelten alle Festlegungen aus Termin 02 bis 09 (Stationsreihenfolge von Termin 01, drei gestufte Tipps, Grenzfall in jeder Aufgabe, höchstens 28 Minuten je Block verplant und im letzten Block höchstens 24, Videos laufen nicht im Termin, Pausen stehen nicht in der App, Meldungstexte ohne Gedankenstrich, Testdaten mit letztem Eingabewert, der das Ergebnis ändert, Hinweistexte `Zu klein`, `Zu groß`, `Richtig!`, Zufall in den Tests über `mit_zufall` aus Termin 09). Dazu neu:

1. **Kennung V10**, Ordner `app/inhalte/v10/`, Adressen `v10-speicher-und-zahlenraten.html` und `v10-labor.html`, Bausteine in `explorables-v10.js` mit `v10.css`. Die Dateinamen sind alt belegt (Technische Voraussetzung 1). In `kurs.yaml` bekommt `termine` bei `nr: 10` den Zusatz `lektion: V10`, der Eintrag unter `lektionen` zunächst mit `aktiv: false`.
2. **Wörter (Theorie):** Speicher im Prozessor (Register und Cache, nur als eine Stufe), Arbeitsspeicher, SSD, Festplatte, Byte, Kilobyte (KB), Megabyte (MB), Gigabyte (GB), Terabyte (TB), Zeichen, ASCII, Code. „Register“ und „Cache“ stehen als Hinweis in einer Klammer; im Selbstcheck heißt die Stufe „Speicher im Prozessor“.
3. **Größen:** 1 Byte sind 8 Bit (Termin 05). 1 KB sind 1000 Byte, 1 MB sind 1000 KB, 1 GB sind 1000 MB, 1 TB sind 1000 GB. Der Hinweis „viele Programme rechnen mit 1024, weil 2¹⁰ gleich 1024 ist“ steht in einem Satz, gerechnet wird mit 1000 (Entscheidung T10-1). Alle Rechnungen im Termin laufen mit glatten Zahlen (2 GB geteilt durch 4 MB).
4. **Die Speicher-Treppe** (Baustein 1, nur Größenordnungen, deutlich als „ungefähr“ beschriftet; bestätigt am 2026-11-27, Entscheidung T10-1):

   | Stufe | Größe, typisch | Zugriff, ungefähr | In Zeitlupe (RAM gleich 1 Sekunde) |
   |---|---|---|---|
   | Speicher im Prozessor (Register, Cache) | einige KB bis einige MB | 1 Nanosekunde | 0,01 Sekunden |
   | Arbeitsspeicher | 8 bis 32 GB | 100 Nanosekunden | 1 Sekunde |
   | SSD | 0,5 bis 2 TB | 100 Mikrosekunden | 1000 Sekunden, rund 17 Minuten |
   | Festplatte | 1 bis 4 TB | 10 Millisekunden | 100 000 Sekunden, rund 28 Stunden |

   Die Zeitlupe ist nachgerechnet (SSD: 100 µs geteilt durch 100 ns ist 1000; Festplatte: 10 ms geteilt durch 100 ns ist 100 000). **Für Studierende sichtbar ist nur die Zeitlupe** (0,01 Sekunden, 1 Sekunde, 17 Minuten, 28 Stunden) und die Größe. Die echten Zugriffszeiten in ns, µs und ms stehen nur in dieser Tabelle für den Dozenten, nicht in Lerneinheit und Baustein (sonst kämen drei neue Zeiteinheiten in einen Block mit drei Kernen). Die Regel dahinter: Je schneller, desto kleiner und teurer; je größer, desto langsamer. Darum gibt es mehrere Stufen, und der Prozessor holt sich Daten in die schnellen Stufen.
5. **ASCII:** ein Code mit 7 Bit, also 2⁷ gleich 128 Zeichen (Termin 05). Jedes Zeichen ist eine Zahl: das Leerzeichen 32, die Ziffern `0` bis `9` sind 48 bis 57, die Großbuchstaben `A` bis `Z` sind 65 bis 90, die Kleinbuchstaben `a` bis `z` sind 97 bis 122 (alle mit Python 3.13 nachgerechnet). `a` und `A` unterscheiden sich um 32 (der Zusammenhang mit einem einzelnen Bit bleibt draußen: Block 1 hat schon drei Kerne). Das Zeichen `5` hat den Code 53, die Zahl 5 ist etwas anderes: Das ist der Grund, warum `input()` Text liefert und man `int()` braucht (Rückgriff Termin 08). Gerechnet wird in den Aufgaben nur mit „weiterzählen“ (D ist drei nach A) und mit der Differenz 32. Umlaute und Emojis sind nicht in ASCII, Unicode (UTF-8) steht nur als `<Begriff>`, ohne Tabelle und ohne eigenen Absatz. Der Baustein `zeichen` erlaubt nur Leerzeichen, Ziffern und Buchstaben (keine Satzzeichen, deren Codes hier nicht festgelegt sind); jedes andere Zeichen meldet „Dieses Zeichen kennt der Baustein nicht.“ „Groß und klein tauschen“ ändert nur `A` bis `Z` und `a` bis `z` (plus oder minus 32); Ziffern und Leerzeichen bleiben, wie sie sind (ein blindes Umschalten von Bit 5 machte aus `5`, Code 53, die 21, ein Steuerzeichen; mit Python nachgerechnet).
6. **Zahlenraten, feste Namen und Ausgaben** (gelten für Stufe 2 bis 4 und den Ausbau):
   - Namen: `geheim`, `geraten`, `versuche`, `hinweis(geraten, geheim)`, `spiel()`.
   - Ausgabe der Hinweise: je Tipp eine Zeile `Zu klein`, `Zu groß` oder `Richtig!`.
   - Stufe 3 und 4: als letzte Zeile `Versuche: 3`.
   - Ausbau 1: `Gewonnen! Versuche: 4` oder `Verloren, die Zahl war 57` als letzte Zeile.
   - Eingabeaufforderungen sind frei (`Dein Tipp (1 bis 100): `), sie dürfen keine der Hinweiszeilen genau wiederholen.
   - Die Zufallszahl wird **vor** der Schleife gezogen, einmal je Spiel. Das ist die häufigste Falle und eine Aufgabe (Training 4) und eine Selbstcheck-Frage.
7. **Startcode aus der Vorstufe.** Von Stufe 3 an (Station 4 bis 7) kann jede Aufgabe mit dem **eigenen** Code der Vorstufe beginnen (Konzept-Entscheidung 8: „jede und jeder baut das eigene Spiel“): Knopf „Meinen Code laden“ (`data-start-aus`). Ohne gespeicherten Code lädt derselbe Knopf die Musterlösung der Vorstufe, aber nur wenn die Vorstufe schon geprüft ist (Technische Voraussetzung 3). Die Vorlage selbst ist nur ein Kommentar. Station 3 (Stufe 2) startet mit dem Gerüst, weil Stufe 1 ein Lückencode ist. Das braucht eine kleine Erweiterung (Technische Voraussetzung 3, beschlossen). Sie gilt auch für die Ausbau-Stationen 6 und 7 (Vorstufe Station 5 bzw. 6); beide tragen `data-count="0"`, damit sie nicht im Fortschritt zählen. Der Knopf wird gebaut (Entscheidung T10-5).
8. **Pflicht ist Stufe 4.** Die Tests von Stufe 4 prüfen alles, was Konzept-Entscheidung 7 als Pflicht nennt: Zufallszahl von 1 bis 100, raten bis richtig, Hinweis, Versuche zählen, Gliederung in Funktionen (Letztes nur als Selbstbewertung nach Schema, weil es sich per Ausgabe nicht prüfen lässt). Eingaben prüfen (Zahl außerhalb von 1 bis 100, Text statt Zahl) gehört nicht dazu: Es geht ohne `try` nur mit `if`, und das Spiel bleibt auch ohne einfach.
9. **Ausblick und Praxisphase:** In Abschnitt 4 steht ein Schluss ohne eigenen Block (Ausblick auf das 2. Semester, Hinweis für die Praxisphase). Er steht als Kasten (`<Dozent>`) am Ende der Lerneinheit, der Hinweis zur Sicherung des Spiels auch am Ende des Labors.
10. **Lesekarte `ord()` und `chr()`** (Entscheidung T10-2): nur in Station 1, Karte 4, nur lesen: `ord("A")` ergibt 65, `chr(66)` ergibt `B` (mit Python 3.13 nachgerechnet). Keine Aufgabe, kein Test, kein Klausurstoff, kein Baustein. `ord` und `chr` kommen in keiner Lösung vor und werden nirgends gebraucht.
11. **Training 10 ist freiwillig** (Entscheidung T10-3): steht überall so (Kopf von Teil B, Ablaufplan, Hinweis für die Praxisphase). Die Trainingsaufgaben tragen `data-count="0"`; die Knobelaufgabe trägt es nicht (sie zählt über `data-knobel` nie mit, `bausteine.mjs:362` verbietet das Attribut). Zu Hause sind Pflicht: Werkzeugkasten (5), Selbstcheck (7), Spiel sichern (3), zusammen 15 Minuten (Attribut `training="freiwillig"`, Technische Voraussetzung 3a); das Training (30) kommt freiwillig dazu.
12. **Nicht eingeführt und nicht erlaubt:** `//`, `+=`, `break`, `while True`, Listen, `global`, `try`. `%` ist seit Termin 08 erlaubt (Entscheidung T10-6), wird hier aber nicht gebraucht.

---

# Termin 10

## A. Kopf

- Titel: **Schnell, groß, Zahlen: Speicher und dein fertiges Spiel** (Arbeitsname: „Speicher“ trifft Block 1, „dein fertiges Spiel“ die Blöcke 2 bis 4)
- Vorspann: Ein Rechner hat Speicher in mehreren Stufen, vom winzigen und blitzschnellen bis zum riesigen und langsamen. Und alles darin, auch Buchstaben, ist Zahl. Danach baust du dein Spiel fertig: Der Rechner denkt sich eine Zahl aus, du rätst, und am Ende zeigt dir das Spiel, wie viele Versuche du gebraucht hast.
- Lernziele:
  - die Stufen des Speichers vom schnellen und kleinen bis zum langsamen und großen ordnen und mit KB, MB und GB rechnen
  - erklären, dass Zeichen als Zahlen gespeichert werden (ASCII), und den Code eines Buchstabens aus dem Alphabet ableiten
  - ein Spiel mit Zufallszahl, Schleife und Funktionen Schritt für Schritt bauen: Raten bis richtig, Versuche zählen, in Funktionen gliedern
  - erklären, warum die Zufallszahl vor die Schleife gehört und wie viele Versuche „immer die Mitte“ höchstens braucht
- kurz: „Speicher, Zahlenraten“
- hook: „Dein erstes Spiel läuft“
- neu in Python (Feld `python` in `kurs.yaml`): nichts Neues, das Spiel setzt zusammen, was da ist: `python: ["Zahlenraten zusammensetzen: random, while, def, return", "ord und chr (nur lesen)"]`. Dazu `NameError: name 'geraten' is not defined` (Schleife ohne Startwert) und `SyntaxError: expected ':'`, in Tipps nur gelesen.

## B. Warm-up (0–10)

Training 09, Aufgabe 1 „Spielzeug-Rechner von Hand“ (`tr-1`, wie dort gestellt): sechs Fragen auf Papier (5 Minuten), Auflösung an der Tafel (2 Minuten). Zelle `A` ist 6, `B` ist 1, `C` ist 9, `D` ist 0; Programm `LADE C`, `SPEICHERE D`, `LADE A`, `ADDIERE D`, `SPEICHERE A`, `STOPP`; jeder Befehl braucht 3 Takte. Auflösung (mit Python 3.13 nachgerechnet):

| Zeile | Frage | Ergebnis |
|---|---|---|
| 1 | Was steht nach dem 1. Befehl im Rechenplatz? | 9 |
| 2 | Was steht nach dem 2. Befehl in D? | 9 |
| 3 | Was steht nach dem 3. Befehl im Rechenplatz? | 6 |
| 4 | Was steht nach dem 4. Befehl im Rechenplatz? | 15 |
| 5 | Was steht am Ende in A? | 15 |
| 6 | Wie viele Takte braucht das ganze Programm? | 18 |

Brücke in die Theorie (3 Minuten, Frage in die Runde): Der Spielzeug-Rechner hat vier Zellen. Dein Rechner hat Milliarden. Wie viel ist das, und wie schnell kommt der Prozessor an eine Zelle? Auflösung in Abschnitt 1: Der Speicher hat Stufen, die kleinste ist die schnellste.

## C. Lerneinheit

### Abschnitt 1 · Speicher und Zeichen (T6, Teil 3 · 10–40)

Kernaussage: Ein Rechner hat mehrere Speicher mit gegensätzlichen Eigenschaften: schnell und klein oder langsam und groß. Die Größe misst man in Byte, KB, MB und GB. Auch Buchstaben stehen als Zahlen im Speicher. Block 1 hat drei Kerne: die Stufen, die Größen, Zeichen als Zahlen.

- Die Stufen (Baustein „Speicher-Treppe“): ganz oben im Prozessor ein winziger, blitzschneller Speicher, dann der Arbeitsspeicher, dann die SSD, ganz unten die Festplatte. Je weiter nach unten, desto größer, billiger und langsamer. Rückgriff auf Termin 09: Arbeitsspeicher weg bei Strom aus, SSD und Festplatte bleiben. Die Tabelle in der Lerneinheit zeigt nur die **Größen** aus Festlegung 4 („ungefähr“); die Zeitlupe steht erst nach dem Baustein da, damit seine Vermutung nicht vorweggenommen ist.
- Warum Stufen? Ein Speicher, der groß, schnell und billig ist, gibt es nicht. Also nimmt man mehrere: Was der Prozessor jetzt braucht, liegt oben, der Rest unten. Das Bild aus Termin 09 geht weiter: Werkzeug in der Hand (Speicher im Prozessor), auf der Werkbank (Arbeitsspeicher), im Lager (SSD), im Außenlager (Festplatte). In einem Satz.
- Die Größen: Ein Byte sind 8 Bit (Termin 05) und reicht für eine Zahl bis 255 oder einen Buchstaben. 1 KB sind 1000 Byte, 1 MB sind 1000 KB, 1 GB sind 1000 MB, 1 TB sind 1000 GB. Eine Textseite hat etwa 2 KB, ein Foto etwa 3 MB, ein Film etwa 2 GB. Rechenbeispiel: Wie viele Musikdateien mit 5 MB passen auf einen Stick mit 1 GB? 1 GB sind 1000 MB, geteilt durch 5 MB ergibt 200 Dateien (bewusst nicht 500: Das ist die Antwort von Selbstcheck 2). Der Satz zu 1024 steht in einer Klammer (Festlegung 3, Entscheidung T10-1).
- Zeichen als Zahlen: Der Rechner kennt nur Zahlen. Jedem Zeichen ist eine Zahl zugeordnet, der Code. Der verbreitete einfache Code heißt ASCII: 7 Bit, also 128 Zeichen. Das `A` ist die 65, das `B` die 66, und so weiter bis `Z` mit 90. Der Tabellenausschnitt in der Lerneinheit zeigt nur die Großbuchstaben (65 bis 90, Festlegung 5); die Kleinbuchstaben stehen erst nach der Vorhersage unten da. Auch Ziffern sind Zeichen und haben einen Code, die Zahl 5 ist etwas anderes. Nach dem Baustein „Zeichen sind Zahlen“ (Beobachtung): Das Zeichen `5` ist 53; deshalb liefert `input()` Text, und du brauchst `int()`. Dass Python diese Nummern auch selbst nennen kann (`ord`, `chr`), zeigt nur die Lesekarte im Labor (Station 1, Karte 4); im Termin wird sie nicht gebraucht.
- Nach der Auflösung der Vorhersage unten: Das kleine `a` ist 97, der Unterschied zwischen groß und klein ist immer 32 (`a` minus `A`, `b` minus `B`, und so weiter).
- Umlaute und Emojis stehen nicht in ASCII. Das sagt nur der Begriffs-Hinweis „Unicode“ (unten), kein eigener Absatz.
- Begriffs-Hinweise (`<Begriff e="…">`): Byte „8 Bit. Die Einheit, in der Speicher gemessen wird.“ · Gigabyte (GB) „Etwa 1 Milliarde Byte: 1000 MB.“ · ASCII „Ein Code, der jedem Zeichen eine Zahl von 0 bis 127 gibt, zum Beispiel A gleich 65.“ · Unicode „Eine größere Zeichentabelle, die auch Umlaute und Emojis enthält, mit mehr Bit je Zeichen.“

Vorhersage „Code des kleinen a“ (vor dem Baustein „Zeichen sind Zahlen“, dessen Vermutung eine andere Frage stellt): Das große `A` hat im ASCII-Code die Nummer 65. Welche Nummer hat das kleine `a`?

- 66
- [x] 97
- 1
- 65

Auflösung: Zwischen `A` und `a` liegen 32. `a` hat 97.

### Abschnitt 2 · Zahlenraten, Teil 2: Raten, bis es stimmt (P5, Teil 2 · 40–70)

Kernaussage: Aus einem Tipp wird ein Spiel, wenn eine Schleife so lange fragt, bis der Tipp stimmt. Die Zufallszahl wird vor der Schleife gezogen, in der Schleife stehen Tipp und Hinweis.

- Rückgriff: In Termin 09 hast du `hinweis(geraten, geheim)` geschrieben und einen Tipp bewertet. Jetzt soll das Spiel weiterfragen. Du kennst die Schleife aus Termin 04: `while`, solange eine Bedingung gilt.
- Das Muster an einem anderen Beispiel (Beamer, ohne das Spiel): **Zahlen addieren, bis eine 0 kommt.** Der Plan:

```text
summe = 0
zahl = -1
Schleife: zahl != 0?
  Eingabe: zahl
  summe = summe + zahl
Ausgabe: "Summe:", summe
```

  Der Code (mit Python 3.13 nachgerechnet, Eingaben 5, 3 und 0 ergeben `Summe: 8`):

```python
summe = 0
zahl = -1
while zahl != 0:
    zahl = int(input("Zahl (0 = Ende): "))
    summe = summe + zahl
print("Summe:", summe)
```

  Zwei Fragen am Plan: Warum haben `summe` und `zahl` vor der Schleife einen Wert? (Die Bedingung braucht beim ersten Mal einen Wert; `-1` ist nicht 0, also läuft die Schleife an.) Warum steht die Eingabe im Rumpf? (Jede Runde liest eine neue Zahl.) Hier kommt „Schritt für Schritt“ an den Codeblock. Dasselbe Muster trägt dein Spiel: den Plan zeichnest du in Station 2, den Code schreibst du in Station 3. Die fertigen Stufen des Spiels stehen **nicht** in der Lerneinheit, sondern als aufklappbare „Lösung zum Vergleich“ bei den Stationen 3, 4 und 5 (Abschnitt F): So lässt sich keine Aufgabe abschreiben (Regel 6 im Konzept, Konzept-Entscheidung 8: abnehmende Führung).
- Wiederholung aus Termin 04: Die Bedingung steht oben, der Rumpf läuft nur, solange sie stimmt.

Vorhersage „Was zeigt das Spiel?“ (vor Station 3; andere Daten als die Tests von Station 2): `geheim` ist 42 (fest eingetragen). Die Eingaben sind 60, 10 und 42. Was erscheint?

```python
geheim = 42
geraten = 0
while geraten != geheim:
    geraten = int(input("Dein Tipp: "))
    print(hinweis(geraten, geheim))
```

- `Zu klein`, `Zu groß`, `Richtig!`
- [x] `Zu groß`, `Zu klein`, `Richtig!`
- `Zu groß`, `Zu klein`
- `Richtig!`

Auflösung: 60 ist größer als 42, 10 ist kleiner, 42 stimmt. Die Schleife endet nach dem dritten Tipp, nicht vor ihm: Der Tipp, der das Spiel beendet, wird noch bewertet (`Richtig!`), weil der Rumpf bis zum Ende läuft und die Bedingung erst danach wieder gefragt wird.

### Abschnitt 3 · Zahlenraten, Teil 3: Versuche zählen (P5, Teil 3 · 80–110)

Kernaussage: Ein Zähler in der Schleife zählt die Versuche. Eine Strategie wie „immer die Mitte“ braucht nur wenige Versuche, und die Zahl der Versuche lässt sich sagen, bevor man spielt.

- Der Zähler, am Beispiel „Summe“ (Beamer): `anzahl = 0` vor der Schleife, `anzahl = anzahl + 1` im Rumpf (Termin 04). Nach der Schleife steht die Zahl (nachgerechnet: Eingaben 5, 3 und 0 ergeben `Summe: 8, Zahlen: 3`, Eingabe 0 ergibt `Summe: 0, Zahlen: 1`):

```python
summe = 0
anzahl = 0
zahl = -1
while zahl != 0:
    zahl = int(input("Zahl (0 = Ende): "))
    summe = summe + zahl
    anzahl = anzahl + 1
print(f"Summe: {summe}, Zahlen: {anzahl}")
```

  Dasselbe machst du in Station 4 mit `versuche`; die letzte Zeile heißt dort `Versuche: 3`. Der fertige Code der Stufe 3 steht als „Lösung zum Vergleich“ bei Station 4, nicht hier.

Vorhersage „Zufall in der Schleife“: Die Zeile `geheim = random.randint(1, 100)` steht vor der Schleife und noch einmal im Rumpf (so entsteht der Fehler in der Praxis: Die Zeile wurde kopiert). Was passiert?

```python
geheim = random.randint(1, 100)
geraten = 0
while geraten != geheim:
    geheim = random.randint(1, 100)
    geraten = int(input("Dein Tipp (1 bis 100): "))
    print(hinweis(geraten, geheim))
```

- Das Spiel läuft wie vorher
- [x] Die Zahl ändert sich in jeder Runde, ein Treffer ist Glück
- Python meldet `SyntaxError`
- Das Spiel zeigt immer `Richtig!`

Auflösung: Jede Runde zieht eine neue Zahl. Der Tipp passt nur, wenn er zufällig mit der gerade gezogenen übereinstimmt. Die Zufallszahl gehört vor die Schleife, und nur dorthin. (Stünde die Zeile nur im Rumpf, meldete Python `NameError: name 'geheim' is not defined`, weil die Bedingung der Schleife `geheim` vorher braucht; mit Python 3.13 nachgerechnet.)

- Die Falle (steht im Text erst nach der Auflösung): die Zufallszahl in der Schleife. Dann ändert sich die Zahl in jeder Runde, und das Spiel ist nur mit Glück zu gewinnen. Training 4 ist der Fehler zum Finden.
- „Immer die Mitte“ (Baustein „Halbieren“; die Zahlen stehen erst nach dem Baustein da, als Beobachtung): Wer 1 bis 100 rät und immer die Mitte des Rests tippt, halbiert jedes Mal die Zahl der Möglichkeiten: 100, 50, 25, 12, 6, 3, 1. Vor dem 7. Tipp bleibt höchstens eine Zahl übrig, der 7. Tipp trifft sie: Das sind höchstens **7 Versuche**, weil 2⁷ gleich 128 ist (Termin 05). Die Mitte rechnet man mit `int((unten + oben) / 2)`, `int` schneidet ab (Termin 08). Das ist Stoff für die Knobelaufgabe, im Termin nur der Baustein.
- Begriffs-Hinweis: Strategie „Eine Regel, nach der man rät.“

### Abschnitt 4 · Zahlenraten, Teil 4: Dein Spiel (P5, Teil 4 · 110–135)

Kernaussage: Dein Spiel besteht aus zwei Funktionen und einem kurzen Hauptprogramm. Damit ist es fertig, wenn du die Pflichtliste abhaken kannst. Wer schneller ist, baut aus.

- Gliedern (Brücke aus Termin 09), am Beispiel „Summe“ (Beamer, 1 Minute): Die Schleife samt Startwerten wird die Funktion `summiere()`, sie gibt die Summe zurück. Das Hauptprogramm ruft sie auf und zeigt das Ergebnis. Der Plan:

```text
Unterprogramm: ergebnis = summiere()
Ausgabe: "Summe:", ergebnis
```

```text
Funktion: summiere()
summe = 0
zahl = -1
Schleife: zahl != 0?
  Eingabe: zahl
  summe = summe + zahl
Rückgabe: summe
```

  Der Code (nachgerechnet, Eingaben 5, 3 und 0 ergeben `Summe: 8`):

```python
def summiere():
    summe = 0
    zahl = -1
    while zahl != 0:
        zahl = int(input("Zahl (0 = Ende): "))
        summe = summe + zahl
    return summe

ergebnis = summiere()
print(f"Summe: {ergebnis}")
```

  Dein Spiel gliederst du genauso (Station 5): Die Schleife samt Zufallszahl und Zähler wird die Funktion `spiel()`, sie gibt die Zahl der Versuche zurück, und das Hauptprogramm hat zwei Zeilen. Den Plan von `spiel()` bekommst du bei Station 5 mit dem dritten Tipp, den fertigen Code als „Lösung zum Vergleich“ danach.
- Die Pflichtliste (Konzept-Entscheidung 7): Zufallszahl von 1 bis 100 · raten, bis es stimmt · `Zu klein` oder `Zu groß` nach jedem Tipp · Versuche zählen und zeigen · `hinweis` und `spiel` als Funktionen.
- Ausbau, für die Schnellen (freiwillig): Begrenzte Versuche (nach 7 Versuchen ist Schluss: `while geraten != geheim and versuche < 7:`, danach `Gewonnen! Versuche: 4` oder `Verloren, die Zahl war 57`). „Noch einmal?“ (eine äußere Schleife `while weiter == "ja":`, nach jedem Spiel `weiter = input("Noch einmal? (ja/nein) ")`). Beides ist in Station 6 und 7 ausgearbeitet.
- Knobelaufgabe „Der Computer rät“: Du denkst dir eine Zahl, der Computer findet sie mit der Mitte. Siehe Abschnitt G.
- **Ausblick (kurz, 3 Minuten, Dozent):** Im 2. Semester kommen Listen (viele Werte in einer Variablen), Messwerte aus Dateien und ein Diagramm, Raster für ein Spielfeld und am Ende das Spiel Schiffe versenken gegen den Computer. In der Theorie: Wie funktioniert KI, Datenbanken, Netzwerke und IT-Sicherheit. Termin 11 beginnt mit Auffrischern; Zahlenraten wird dort wieder ausgepackt und ausgebaut.
- **Hinweis für die Praxisphase (kurz, 3 Minuten, Dozent):** (1) **Spiel sichern:** Die App merkt sich deinen Stand nur in diesem Browser. Kopier dein fertiges Spiel (Knopf Kopieren am Codeblock) in eine eigene Datei oder eine Mail an dich selbst. (2) Das Training 10 ist freiwillig und die Wiederholung: Wer sich sicherer fühlen will, macht es in der letzten Woche vor Termin 11 (Entscheidung T10-3). Es gibt keinen Knopf „Meinen Stand sichern“, nur das Kopieren des Codes. (3) Empfehlung für die Praxisphase, freiwillig: dreimal 20 Minuten, zum Beispiel nach vier, acht und zwölf Wochen: das Spiel starten, einmal spielen, ein Ausbau oder ein Fehler aus dem Training. (4) Termin 11 beginnt mit Auffrischern: Du musst in der Praxisphase nichts Neues lernen (Entscheidung T10-3: Termin 11 beginnt mit Auffrischern und übernimmt, was fehlt).

Vorhersage entfällt in diesem Abschnitt: Der letzte Block hat 24 Minuten.

## D. Interaktive Bausteine (3)

1. **`treppe` – „Speicher-Treppe“** (Abschnitt 1). Einstellen: eine Stufe anklicken (Speicher im Prozessor, Arbeitsspeicher, SSD, Festplatte). Sehen: vier Stufen als Balken, die Länge zeigt die Größe (Maßstab Logarithmus, sonst passt es nicht aufs Tablet), daneben die Größe „ungefähr“ (Festlegung 4). Ein Klick lässt für die gewählte Stufe einen **Wartebalken** in Zeitlupe laufen: der Arbeitsspeicher braucht 1 Sekunde, der Speicher im Prozessor 0,01 Sekunden; für die SSD und die Festplatte ist der Balken gerafft, daneben steht die volle Zeitlupe (17 Minuten, 28 Stunden). Im Ausgangszustand steht neben den Balken nur die Größe, die Zeit zeigt „?“, nichts läuft. Echte Zugriffszeiten (Nanosekunden bis Millisekunden) zeigt der Baustein nicht (Festlegung 4). Vermutung vorher, vor dem ersten Klick (Auswahl): Wenn der Arbeitsspeicher 1 Sekunde dauert, wie lange dauert dann die SSD? (2 Sekunden / 1 Minute / 17 Minuten / 1 Tag; richtig 17 Minuten.) Beobachtung danach: Von Stufe zu Stufe wird es etwa tausendmal langsamer (RAM zu SSD) bis hundertmal langsamer (SSD zu Festplatte), und die Stufen werden größer. Darum liegt oben, was jetzt gebraucht wird. Der Baustein rechnet nichts, die Studierenden lesen ab.
2. **`zeichen` – „Zeichen sind Zahlen“** (Abschnitt 1). Einstellen: ein Eingabefeld für bis zu 8 Zeichen (nur Buchstaben, Ziffern und Leerzeichen; jedes andere Zeichen, auch Umlaute und Satzzeichen, meldet „Dieses Zeichen kennt der Baustein nicht.“), Knopf „Groß und klein tauschen“. Sehen: je Zeichen eine Karte mit dem Zeichen und seiner Zahl (`A` ist 65). Im Ausgangszustand ist das Feld leer, es steht keine Tabelle da. „Groß und klein tauschen“ ändert nur Buchstaben (plus oder minus 32); Ziffern und Leerzeichen bleiben, wie sie sind (Festlegung 5). Vermutung vorher (nach der Vorhersage „Code des kleinen a“ der Lerneinheit, also mit einer anderen Frage): Welche Zahl hat das Zeichen `5`? (Auswahl: 5 / 35 / 53 / 65; richtig 53.) Beobachtung danach: Das Zeichen `5` hat die Zahl 53, die Zahl 5 ist etwas anderes: Deshalb liefert `input()` Text. Beim Tauschen ändert sich jeder Buchstabencode um genau 32. Der Rechenkern kennt nur die Zeichen von Festlegung 5 und gibt die Werte aus, die oben mit Python gerechnet sind.
3. **`halbieren` – „Immer die Mitte“** (Abschnitt 3). Einstellen: Zahl von 1 bis 100 (die geheime Zahl wählt der Baustein beim Start, sie steht erst nach dem Treffer da), Knöpfe „Tipp“ (Eingabefeld) und „Die Mitte tippen“. Sehen: ein Streifen von 1 bis 100 mit dem Bereich, in dem die Zahl noch liegen kann (er schrumpft, wenn ein Hinweis kommt), der Zähler der Versuche, die letzten Tipps mit `Zu klein`, `Zu groß`, `Richtig!`. „Die Mitte tippen“ tippt `int((unten + oben) / 2)` für dich. Im Ausgangszustand zeigt der Baustein weder die Halbierungsfolge noch die höchste Versuchszahl. (Ein Knopf „Alle 100 Zahlen durchprobieren“ mit Verteilung ist gestrichen: Er wäre ein zweiter Baustein im Baustein. Die Verteilung 1, 2, 4, 8, 16, 32, 37 und das Höchstmaß 7 prüft nur der Test des Rechenkerns, nachgerechnet.) Vermutung vorher: Wie viele Versuche braucht „immer die Mitte“ höchstens für 1 bis 100? (5 / 7 / 10 / 50; richtig 7.) Beobachtung danach: Der Bereich halbiert sich jedes Mal: Vor dem 7. Tipp bleibt höchstens eine Zahl übrig (100, 50, 25, 12, 6, 3, 1), der 7. Tipp trifft sie. Das ist auch der Grund, warum 7 Bit für 128 Werte reichen: 2⁷ gleich 128 (Rückgriff Termin 05).

Abschnitt 2 und 4 haben keinen Baustein. Der Block 2 und der letzte Block sind für die eigene Arbeit.

## E. Selbstcheck (6 Fragen, 20 Punkte)

Titel ohne Nummern, Antworten ohne Bezug auf die Reihenfolge, damit sich Fragen und Antworten mischen lassen.

1. **Schnell und klein**, Auswahl, 3 Punkte. Welcher Speicher ist der schnellste und kleinste? [x] Der Speicher im Prozessor · Der Arbeitsspeicher · Die SSD · Die Festplatte. Erklärung: Je schneller ein Speicher ist, desto kleiner und teurer ist er. Darum liegt im Prozessor nur, was jetzt gebraucht wird.
2. **Fotos auf dem Stick**, Zahl, 4 Punkte, Antwort `500`. Ein Foto hat 4 MB. Wie viele Fotos passen auf einen Stick mit 2 GB? Rechne mit 1 GB gleich 1000 MB. Erklärung: 2 GB sind 2000 MB, geteilt durch 4 MB ergibt 500.
3. **Code eines Buchstabens**, Zahl, 3 Punkte, Antwort `68`. Im ASCII-Code hat `A` die Nummer 65, `B` die 66 und so weiter. Welche Nummer hat `D`? Erklärung: `D` kommt drei Buchstaben nach `A`: 65 plus 3 ergibt 68.
4. **Wie viele Zeichen**, Auswahl, 3 Punkte. Der ASCII-Code hat 7 Bit. Wie viele verschiedene Zeichen kann er darstellen? [x] 128 · 7 · 256 · 700. Erklärung: Mit 7 Bit gibt es 2⁷ gleich 128 Werte (Termin 05). Mit 8 Bit wären es 256.
5. **Zufallszahl im Spiel**, Auswahl, 4 Punkte. Wo muss `geheim = random.randint(1, 100)` stehen, damit dir die Hinweise beim Raten helfen? [x] Vor der Schleife, einmal je Spiel · Im Rumpf der Schleife, damit es jede Runde neu ist · Nach der Schleife · Nach dem `print`. Erklärung: Die Zahl muss das ganze Spiel gleich bleiben. Wird sie in jeder Runde neu gezogen, ändert sich das Ziel mit jedem Tipp.
6. **Halbieren**, Zahl, 3 Punkte, Antwort `7`. Du rätst eine Zahl von 1 bis 100 und tippst immer die Mitte des Rests. Wie viele Versuche brauchst du höchstens? Erklärung: Die Möglichkeiten halbieren sich: 100, 50, 25, 12, 6, 3, 1. Das sind 7 Tipps.

## F. Labor Teil A (7 Stationen, auf der Seite 60 Minuten: 5 + 8 + 9 + 10 + 12 + 8 + 8; Pflicht sind Station 1 bis 5 mit 44 Minuten, Station 6 und 7 sind freiwillig mit 16 Minuten)

**1 · Werkzeugkasten (5 Min, zu Hause).** Vier Karten, Video „Python-Werkzeugkasten“. Alles aus Termin 02 bis 09 gilt weiter. Karte 1 bis 3 sind Wiederholung mit neuer Anwendung, Karte 4 ist eine Lesekarte.
- Karte 1 „while mit and: begrenzte Versuche“
  ```python
  versuche = 0
  geraten = 0
  while geraten != 5 and versuche < 3:
      geraten = int(input("Tipp: "))
      versuche = versuche + 1
  print(versuche)
  ```
  Eingaben 1, 2, 3 ergeben `3` (die Schleife endet nach 3 Versuchen), Eingabe 5 ergibt `1` (der Tipp stimmt). `and`: Beide Bedingungen müssen stimmen, damit die Schleife weiterläuft.
- Karte 2 „Text einlesen: Noch einmal?“
  ```python
  weiter = "ja"
  while weiter == "ja":
      print("Runde")
      weiter = input("Noch einmal? (ja/nein) ")
  ```
  Eingaben `ja`, `ja`, `nein` ergeben dreimal `Runde`. `input` liefert Text, `==` vergleicht Text mit Text (Termin 08).
- Karte 3 „Die Mitte“
  ```python
  print(int((1 + 100) / 2))
  print(int((51 + 100) / 2))
  print(int((3 + 4) / 2))
  ```
  Ausgabe `50`, `75`, `3`. `/` ergibt eine Kommazahl, `int` schneidet ab (Termin 08). Für die Knobelaufgabe.
- Karte 4 „ord und chr (nur lesen)“: eine Lesekarte ohne Aufgabe und ohne Klausurstoff, wie `**` in Termin 07 (Entscheidung T10-2). Sie steht hinter den drei Karten und ist als „nur lesen“ gekennzeichnet.
  ```python
  print(ord("A"))
  print(chr(66))
  ```
  Ausgabe `65` und `B`. `ord` nennt die Nummer eines Zeichens, `chr` das Zeichen zu einer Nummer: genau die Nummern aus dem Baustein „Zeichen sind Zahlen“. Mit Python 3.13 nachgerechnet. Keine Kleinbuchstaben auf der Karte, damit die Vorhersage „Code des kleinen a“ nicht vorweggenommen wird.

**2 · Plan zeichnen: Raten, bis es stimmt (★★, 8 Min; Block 2).** Art `pap-zeichnen`, `data-erlaubt="in,out,op,while,call"`. Die Funktion `hinweis` steht schon im Editor (Startdaten, ein Knoten `def` mit Verzweigungen und Rückgabe `text`), dazu als erster Knoten des Hauptplans die vorgegebene Operation `import random`; gezeichnet wird der Rest des Hauptplans. Der Plan-Editor erzeugt nie eine Zeile `import`, und `run_program` führt den Code in einem leeren Namensraum aus: Ohne die vorgegebene Zeile bricht jeder Test mit `NameError: name 'random' is not defined` ab, auch für die Musterlösung (Technische Voraussetzung 4). Der Bereich „Erzeugten Python-Code ansehen und ausführen“ ist in dieser Aufgabe abgeschaltet, sonst ließe sich der Code für Station 3 kopieren. Text: Der Rechner zieht eine Zahl von 1 bis 100. Du tippst, das Spiel sagt nach jedem Tipp `Zu klein`, `Zu groß` oder `Richtig!` und fragt weiter, bis der Tipp stimmt. Die Zeile `import random` steht schon da. Zeichne den übrigen Hauptplan.
Lösung: vorgegeben `import random` · Operation `geheim = random.randint(1, 100)` · Operation `geraten = 0` · Schleife `geraten != geheim` · im Rumpf Eingabe `geraten` · Unterprogramm `text = hinweis(geraten, geheim)` · Ausgabe `text`. Erzeugter Code (Hauptprogramm; mit der Funktion zusammen mit Python 3.13 ausgeführt): `import random`, `geheim = random.randint(1, 100)`, `geraten = 0`, `while geraten != geheim:` mit Eingabe, Aufruf und Ausgabe im Rumpf (siehe Lösung zum Vergleich bei Station 3).
Tests (Zufall auf feste Werte, Zeilen `Zu klein`, `Zu groß`, `Richtig!`; `randint` genau einmal mit `(1, 100)` gerufen): Zahl 30, Eingaben 50, 20, 30 ergibt `Zu groß`, `Zu klein`, `Richtig!` · Zahl 30, Eingabe 30 ergibt `Richtig!` (Grenzfall, die Schleife läuft einmal) · Zahl 1, Eingaben 100, 1 ergibt `Zu groß`, `Richtig!` (Grenzfall unten) · Zahl 100, Eingaben 1, 99, 100 ergibt `Zu klein`, `Zu klein`, `Richtig!` (Grenzfall oben, der letzte Wert entscheidet). Alle nachgerechnet. Die Tests prüfen die Ausgabe, nicht die Form des Plans.
Tipps: (1) Was passiert vor der Schleife, was in jeder Runde? (2) Die Bedingung der Schleife heißt „der Tipp ist nicht die Zahl“. `geraten` braucht vor der Schleife einen Wert. (3) Im Rumpf steht zuerst der Tipp, dann der Hinweis.

**3 · Code zum Plan: Stufe 2 (★★, 9 Min; Block 2).** Art `code`, Klausurform „Plan in Code übertragen“ mit Ausführen. Text: Übertrag deinen Plan in Code. Die Funktion `hinweis` steht schon in der Vorlage. Das Gerüst sagt dir, was jede Zeile tun soll.
Vorlage:
```python
import random

def hinweis(geraten, geheim):
    if geraten < geheim:
        return "Zu klein"
    elif geraten > geheim:
        return "Zu groß"
    else:
        return "Richtig!"

# Zieh die Zufallszahl von 1 bis 100 und speichere sie in geheim.
# Setze geraten auf 0, damit die Schleife starten kann.
# Solange geraten nicht geheim ist:
#     lies einen Tipp ein
#     zeig den Hinweis
```
Lösung zum Vergleich (aufklappbar, erst nach dem ersten Prüfen; die Stufe 2 steht nicht in der Lerneinheit):
```python
import random

def hinweis(geraten, geheim):
    if geraten < geheim:
        return "Zu klein"
    elif geraten > geheim:
        return "Zu groß"
    else:
        return "Richtig!"

geheim = random.randint(1, 100)
geraten = 0
while geraten != geheim:
    geraten = int(input("Dein Tipp (1 bis 100): "))
    print(hinweis(geraten, geheim))
```
Tests wie Station 2 (feste Werte 30, 99, 5 und Eingaben 50, 20, 30 machen den Fehler sichtbar, Technische Voraussetzung 2), dazu die zwei häufigen Fehler (nachgerechnet): (a) `geheim = random.randint(1, 100)` steht nur im Rumpf der Schleife: Python meldet schon vor der ersten Runde `NameError: name 'geheim' is not defined` (keine Hinweiszeile, kein `EOFError`); Meldung der Aufgabe: „geheim braucht vor der Schleife einen Wert: Zieh die Zahl vor `while`.“ (b) Die Zeile steht vor der Schleife und zusätzlich im Rumpf: Es erscheinen `Zu klein`, `Zu groß`, `Zu groß`, danach bricht der Lauf mit `EOFError` ab, und `randint` wird fünfmal gerufen; Meldung: „Dein Programm hat mehr Eingaben verlangt als vorgesehen: Wird die Zahl wirklich nur einmal gezogen?“ Fehlt `geraten = 0`, meldet Python `NameError: name 'geraten' is not defined` (nur lesen, „hier fehlt ein Startwert“).
Tipps: (1) Der Plan: oben die zwei Zeilen vor der Schleife, dann `while`. (2) Die Bedingung heißt `geraten != geheim`, die Zeilen im Rumpf sind eingerückt. (3) Das Beispiel „Summe bis 0“ in Abschnitt 2 und Karte 1 aus Termin 04.

**4 · Versuche zählen: Stufe 3 (★★, 10 Min; Block 3).** Art `code`, `data-mode="programm"`. Vorlage: dein Code aus Station 3 (Knopf „Meinen Code laden“, `data-start-aus="w-stufe2"`; hast du nichts gespeichert, lädt der Knopf die Musterlösung der Stufe 2). Text: Das Spiel soll zählen, wie viele Tipps du gebraucht hast. Nach dem Treffer zeigt es die Zahl in einer eigenen Zeile, zum Beispiel `Versuche: 3`. Du bekommst keinen Plan und kein Gerüst: Ergänze deinen Code.
Lösung zum Vergleich (aufklappbar, erst nach dem ersten Prüfen):
```python
import random

def hinweis(geraten, geheim):
    if geraten < geheim:
        return "Zu klein"
    elif geraten > geheim:
        return "Zu groß"
    else:
        return "Richtig!"

geheim = random.randint(1, 100)
geraten = 0
versuche = 0
while geraten != geheim:
    geraten = int(input("Dein Tipp (1 bis 100): "))
    versuche = versuche + 1
    print(hinweis(geraten, geheim))
print(f"Versuche: {versuche}")
```
Tests (Zufall fest mit einem Wert, die Zeilen `Zu klein`, `Zu groß`, `Richtig!` und die letzte Zeile; bei jedem Test zusätzlich `aufrufe == [(1, 100)]`, Meldung wie Termin 09 Festlegung 8: Ein Programm mit `geheim = -1` und `randint` im Rumpf besteht sonst alle fünf Tests, weil jeder Aufruf denselben Wert liefert, nachgerechnet: gleiche Ausgabe, nur 3, 1, 2, 4 und 7 Aufrufe statt einem): Zahl 30, Eingaben 50, 20, 30 ergibt `Zu groß`, `Zu klein`, `Richtig!`, `Versuche: 3` · Zahl 30, Eingabe 30 ergibt `Richtig!`, `Versuche: 1` (Grenzfall) · Zahl 1, Eingaben 100, 1 ergibt `Zu groß`, `Richtig!`, `Versuche: 2` (Grenzfall unten) · Zahl 50, Eingaben 100, 100, 1, 50 ergibt `Zu groß`, `Zu groß`, `Zu klein`, `Richtig!`, `Versuche: 4` · Zahl 7, Eingaben 50, 25, 12, 6, 9, 8, 7 ergibt sieben Hinweise und `Versuche: 7` (der letzte Wert entscheidet). Alle nachgerechnet.
Tipps: (1) Wo muss der Zähler anfangen, und wann zählt er? (2) `versuche = 0` vor der Schleife, im Rumpf eine Zeile `versuche = versuche + 1`. (3) Die Ausgabe `Versuche: …` steht nach der Schleife, nicht in ihr.

**5 · Dein Spiel: Stufe 4 (★★★, 12 Min; Block 4).** Art `code`, `data-mode="programm"`. Vorlage: dein Code aus Station 4 (Knopf „Meinen Code laden“, `data-start-aus="w-stufe3"`, sonst die Musterlösung der Stufe 3). Text: Gliedere dein Spiel. Die Funktion `hinweis(geraten, geheim)` gibt den Hinweis zurück (sie steht schon in deinem geladenen Code). Die Funktion `spiel()` spielt eine Runde: zieht die Zahl, fragt, bis der Tipp stimmt, zeigt jeden Hinweis und gibt die Zahl der Versuche zurück. Das Hauptprogramm ruft `spiel()` auf und zeigt `Versuche: 3`.
Nur die Aufgabe, kein Gerüst; der Plan von `spiel()` kommt erst mit dem dritten Tipp. Lösung zum Vergleich (aufklappbar, erst nach dem dritten Tipp):
```python
import random

def hinweis(geraten, geheim):
    if geraten < geheim:
        return "Zu klein"
    elif geraten > geheim:
        return "Zu groß"
    else:
        return "Richtig!"

def spiel():
    geheim = random.randint(1, 100)
    geraten = 0
    versuche = 0
    while geraten != geheim:
        geraten = int(input("Dein Tipp (1 bis 100): "))
        versuche = versuche + 1
        print(hinweis(geraten, geheim))
    return versuche

anzahl = spiel()
print(f"Versuche: {anzahl}")
```
Tests: dieselben wie Station 4, dazu `randint` einmal je Aufruf von `spiel()` mit `(1, 100)`. Die Gliederung prüft **Selbstbewertung nach Schema** (je 1 Punkt, `scheme.json`): `def hinweis(geraten, geheim):` mit `return` in den Zweigen oder am Ende · `def spiel():` zieht die Zufallszahl **in** der Funktion, vor der Schleife · `spiel()` gibt `versuche` mit `return` zurück · das Hauptprogramm ruft `spiel()` auf und zeigt die Zahl · alle Funktionen stehen vor dem Hauptprogramm · die Aufforderung enthält keinen der Hinweistexte. Dazu die **Pflichtliste** zum Abhaken (Zufallszahl von 1 bis 100, raten bis richtig, Hinweis, Versuche, Funktionen), und am Ende ein Satz: „Dein Spiel läuft. Das ist dein erstes vollständiges Programm.“ Die Meldung erscheint, wenn alle Tests grün sind. **Werkzeug:** Das Schema wertet `aufgaben.js` nur im Klausur-Modus aus; eine Pflichtliste und eine eigene Erfolgsmeldung gibt es nicht (Technische Voraussetzung 10, dort auch die Alternative ohne Werkzeugbau).
Tipps: (1) Was gehört in `spiel()`, was bleibt draußen? (2) Die Zufallszahl, der Zähler und die Schleife wandern in die Funktion. Am Ende steht `return versuche`. (3) Der Plan von `spiel()`:
```text
Funktion: spiel()
geheim = random.randint(1, 100)
geraten = 0
versuche = 0
Schleife: geraten != geheim?
  Eingabe: geraten
  versuche = versuche + 1
  Unterprogramm: text = hinweis(geraten, geheim)
  Ausgabe: text
Rückgabe: versuche
```
Das Hauptprogramm: `anzahl = spiel()` und dann `print(f"Versuche: {anzahl}")`.

**6 · Ausbau A: begrenzte Versuche (★★★, freiwillig, 8 Min).** Art `code`, `data-mode="programm"`, `data-count="0"` (zählt nicht im Fortschritt). Vorlage: dein Code aus Station 5 (`data-start-aus="w-stufe4"`, sonst die Musterlösung von Station 5). Text: Nach 7 Versuchen ist Schluss. Hat der Spieler die Zahl gefunden, erscheint als letzte Zeile `Gewonnen! Versuche: 4`, sonst `Verloren, die Zahl war 57`. Die Funktion `spiel()` zeigt das Ergebnis selbst; das Hauptprogramm ruft sie nur auf.
Lösung (mit Python 3.13 nachgerechnet):
```python
def spiel():
    geheim = random.randint(1, 100)
    geraten = 0
    versuche = 0
    while geraten != geheim and versuche < 7:
        geraten = int(input("Dein Tipp (1 bis 100): "))
        versuche = versuche + 1
        print(hinweis(geraten, geheim))
    if geraten == geheim:
        print(f"Gewonnen! Versuche: {versuche}")
    else:
        print(f"Verloren, die Zahl war {geheim}")

spiel()
```
(mit `import random` und `hinweis` darüber). Tests (Zufall fest, letzte Zeile): Zahl 57, Eingaben 50, 75, 60, 55, 58, 56, 57 ergibt `Gewonnen! Versuche: 7` (genau der letzte erlaubte Versuch, Grenzfall) · Zahl 57, Eingaben 50, 75, 60, 55, 58, 56, 1 ergibt `Verloren, die Zahl war 57` (der letzte Wert wechselt das Ergebnis) · Zahl 7, Eingaben 50, 25, 12, 6, 9, 8, 7 ergibt `Gewonnen! Versuche: 7` · Zahl 30, Eingabe 30 ergibt `Gewonnen! Versuche: 1` (Grenzfall). Alle nachgerechnet.
Tipps: (1) Die Schleife soll in zwei Fällen enden: Der Tipp stimmt, oder 7 Versuche sind vorbei. (2) Karte 1. (3) Nach der Schleife entscheidet ein `if`, ob der letzte Tipp stimmte.

**7 · Ausbau B: Noch einmal? (★★★, freiwillig, 8 Min).** Art `code`, `data-mode="programm"`, `data-count="0"`. Vorlage: dein Code aus Station 6 (`data-start-aus="w-ausbau-a"`, sonst die Musterlösung von Station 6). Text: Nach jedem Spiel fragt das Programm `Noch einmal? (ja/nein)`. Bei `ja` beginnt ein neues Spiel mit einer neuen Zufallszahl, bei `nein` endet das Programm. Das Spiel ist die Funktion aus Ausbau A.
Lösung: die Funktion aus Station 6 und darunter
```python
weiter = "ja"
while weiter == "ja":
    spiel()
    weiter = input("Noch einmal? (ja/nein) ")
```
Tests (Zufall: zwei Werte, die Zeilen `Zu klein`, `Zu groß`, `Richtig!` und die Zeilen, die mit `Gewonnen` oder `Verloren` beginnen; Eingabeaufforderungen zählen nicht): Zahlen 30 und 77, Eingaben 50, 30, `ja`, 80, 77, `nein` ergibt `Zu groß`, `Richtig!`, `Gewonnen! Versuche: 2`, `Zu groß`, `Richtig!`, `Gewonnen! Versuche: 2`, `randint` wird zweimal mit `(1, 100)` gerufen · Zahl 57, Eingaben 1, 2, 3, 4, 5, 6, 57, `nein` ergibt sechsmal `Zu klein`, `Richtig!`, `Gewonnen! Versuche: 7`, `randint` einmal (Grenzfall, kein zweites Spiel). Beide nachgerechnet.
Tipps: (1) Das ganze Spiel steckt schon in `spiel()`. Du brauchst nur eine äußere Schleife. (2) Karte 2. (3) `weiter` muss vor der Schleife einen Wert haben, der sie startet.

## G. Labor Teil B (Training, freiwillig, 4 Aufgaben, 30 Minuten) und Knobelaufgabe

Zu Hause **Pflicht 15 Minuten**: Werkzeugkasten (5), Selbstcheck (7), Spiel sichern (3). Das **Training 10 ist freiwillig** (30 Minuten zusätzlich, Entscheidung T10-3): Es ist die Wiederholung für die Praxisphase und wird am liebsten in der letzten Woche vor Termin 11 gemacht. Alle vier Trainingsaufgaben tragen `data-count="0"` und zählen nicht im Fortschritt; im Labor steht „freiwillig“ in der Überschrift von Teil B und ein Satz, der es sagt. `zuhause="15"` und `training="freiwillig"` im Labor (Technische Voraussetzung 3a): Die Überschrift von Teil B lautet dann „Teil B · Training zu Hause (freiwillig, 30 Min)“, die Pflicht von 15 Minuten steht getrennt im Einleitungssatz.

1. **Größen und Zeichen** (★, 6 Min, `trace` als Tabelle, `sprache: "tabelle"`, 6 Zeilen, eine Spalte „Antwort“, `ausgabe: false`, `typhinweis: false`). Erst auf Papier, dann hier prüfen. Text: „Trag die Zahl oder den Buchstaben ein, ohne Leerzeichen und ohne Anführungszeichen. Rechne mit 1 GB gleich 1000 MB und 1 MB gleich 1000 KB. A hat die Nummer 65, B die 66, und so weiter.“ Nachgerechnet:

   | Zeile | Frage | Lösung |
   |---|---|---|
   | 1 | Wie viele KB sind 3 MB? | 3000 |
   | 2 | Wie viele MB sind 2 GB? | 2000 |
   | 3 | Wie viele Fotos mit 5 MB passen auf 4 GB? | 800 |
   | 4 | Welche Nummer hat C? | 67 |
   | 5 | Welcher Buchstabe hat die Nummer 70? | F |
   | 6 | Wie viele Werte hat ein 6-Bit-Code? | 64 |

   `gross: false` gilt für die ganze Aufgabe (`aufgaben.js:920`) und wirkt nur bei Zeile 5, weil nur dort Buchstaben als Antwort stehen (f und F gelten gleich); (die Zeilen 3 und 6 sind neue Zahlen und nicht die Antworten aus Selbstcheck 2 und 4). Hinweis bei Zeile 4 und 5: „Zähl vom A aus weiter: A ist 65, B ist 66, …“.
2. **Plan in Code übertragen: Würfelraten mit drei Versuchen** (★★, 10 Min, `klausur`). Text: Der Rechner würfelt eine Zahl von 1 bis 6. Du hast drei Versuche. Wer trifft, bekommt als letzte Zeile `Treffer, Versuche: 2`, sonst `Verloren, es war 4`. Plan:
   ```text
   wurf = random.randint(1, 6)
   versuche = 0
   tipp = 0
   Schleife: tipp != wurf and versuche < 3?
     Eingabe: tipp
     versuche = versuche + 1
   Entscheidung: tipp == wurf?
     ja:
       Ausgabe: "Treffer, Versuche:", versuche
     nein:
       Ausgabe: "Verloren, es war", wurf
   ```
   ```python
   import random

   wurf = random.randint(1, 6)
   versuche = 0
   tipp = 0
   while tipp != wurf and versuche < 3:
       tipp = int(input("Dein Tipp (1 bis 6): "))
       versuche = versuche + 1
   if tipp == wurf:
       print(f"Treffer, Versuche: {versuche}")
   else:
       print(f"Verloren, es war {wurf}")
   ```
   Tests (Zufall fest, letzte Zeile, nachgerechnet): Wurf 4, Eingabe 4 ergibt `Treffer, Versuche: 1` · Wurf 4, Eingaben 1, 2, 4 ergibt `Treffer, Versuche: 3` (Grenzfall, der letzte Versuch trifft) · Wurf 4, Eingaben 1, 2, 3 ergibt `Verloren, es war 4` (der letzte Wert wechselt das Ergebnis) · Wurf 4, Eingaben 6, 6, 6 ergibt `Verloren, es war 4` · Wurf 1, Eingabe 1 ergibt `Treffer, Versuche: 1` (Grenzfall) · Wurf 6, Eingaben 2, 6 ergibt `Treffer, Versuche: 2` (Grenzfall); `randint` einmal mit `(1, 6)`. Schema (je 1 Punkt): `import random` als erste Zeile · `random.randint(1, 6)` vor der Schleife · Bedingung mit `and` und `versuche < 3` · der Zähler wächst im Rumpf. Tipps: (1) Zeichne zuerst die Schleife: Sie endet auf zwei Arten. (2) Karte 1. (3) Nach der Schleife entscheidet ein `if`, ob der letzte Tipp stimmt.
3. **Code lesen: Dein Spiel verfolgen** (★★, 6 Min, `trace` als Tabelle, `sprache: "tabelle"`, 4 Zeilen, zwei Spalten `geraten` und `versuche`, dazu je Runde das Feld `out`; die Zeilen lauten `Runde = 1` bis `Runde = 4`, das Programm steht im Aufgabentext; Entscheidung T10-4). Das ist die Stufe 3 mit festen Eingaben: dein eigenes Spiel, nur mit festem `geheim` und festen Tipps. Text: „Das Spiel hat `geheim = 64` und bekommt nacheinander die Tipps 80, 50, 70 und 64. Trag nach jeder Runde `geraten` und `versuche` ein und trag in jeder Runde die Ausgabe dieser Runde ein.“ Ausgangszustand: Tabelle leer, kein Ergebnis sichtbar.
   ```python
   geheim = 64
   geraten = 0
   versuche = 0
   while geraten != geheim:
       geraten = int(input("Dein Tipp (1 bis 100): "))
       versuche = versuche + 1
       print(hinweis(geraten, geheim))
   print(f"Versuche: {versuche}")
   ```
   (Die Funktion `hinweis` steht im Aufgabentext darüber, wie in Station 3.) Nachgerechnet (nach jeder Runde, mit Python 3.13):

   | Runde | geraten | versuche |
   |---|---|---|
   | 1 | 80 | 1 |
   | 2 | 50 | 2 |
   | 3 | 70 | 3 |
   | 4 | 64 | 4 |

   `out` je Runde: Runde 1 `Zu groß`, Runde 2 `Zu klein`, Runde 3 `Zu groß`, Runde 4 `Richtig!` (`ausgabe` nicht auf false; keine fünfte Zeile, sonst bricht die Spaltenstruktur). Die Schlusszeile `Versuche: 4` steht im Programmtext und wird nicht eingetragen; die Hinweise erklären sie. Eine Eingabeaufforderung zählt nicht mit. Hinweise: bei Runde 1 „80 ist größer als 64: `hinweis` gibt `Zu groß` zurück, `versuche` wächst von 0 auf 1.“; bei Runde 4 „Der Tipp stimmt, `hinweis` gibt `Richtig!` zurück. Danach ist die Bedingung der Schleife falsch, und die letzte Zeile zeigt `Versuche: 4`.“ Die Folge 80, 50, 70, 64 mit `geheim = 64` kommt sonst nirgends vor (einzelne Zahlen wie 50 schon, das verrät nichts). Das Halbieren bleibt in Baustein und Knobelaufgabe (Entscheidung T10-4); die Spalten `unten` und `oben` entfallen.
4. **Fehler finden: Zufallszahl in der Schleife** (★★, 8 Min, `code`, `data-count="0"`). Zwei Fehler: einer, den Python meldet, einer, den du nur an der Ausgabe findest. Probier die Eingaben 50, 20 und 30.
   Vorlage (die Funktion `hinweis` steht darüber, wie in Stufe 3):
   ```python
   import random

   def hinweis(geraten, geheim):
       if geraten < geheim:
           return "Zu klein"
       elif geraten > geheim:
           return "Zu groß"
       else:
           return "Richtig!"

   versuche = 0
   geraten = 0
   geheim = random.randint(1, 100)
   while geraten != geheim
       geheim = random.randint(1, 100)
       geraten = int(input("Dein Tipp (1 bis 100): "))
       versuche = versuche + 1
       print(hinweis(geraten, geheim))
   print(f"Versuche: {versuche}")
   ```
   Lösung: Python meldet `SyntaxError: expected ':'` in Zeile 14 (nachgerechnet): Nach der Bedingung der Schleife fehlt der Doppelpunkt. Danach läuft das Programm, aber die Zeile `geheim = random.randint(1, 100)` steht zweimal da, vor der Schleife und im Rumpf (so entsteht der Fehler in der Praxis: Die Zeile wurde kopiert). Mit den festen Zahlen 30, 99, 5 erscheinen `Zu klein`, `Zu groß` und `Zu groß`, `randint` wird fünfmal gerufen, und das Programm bricht mit `EOFError` ab, weil die Eingaben ausgehen (nachgerechnet). Behoben wird es, indem die Zeile im Rumpf gelöscht wird:
   ```python
   versuche = 0
   geraten = 0
   geheim = random.randint(1, 100)
   while geraten != geheim:
       geraten = int(input("Dein Tipp (1 bis 100): "))
       versuche = versuche + 1
       print(hinweis(geraten, geheim))
   print(f"Versuche: {versuche}")
   ```
   Tests (Zufall fest über `mit_zufall`; `randint` genau einmal; Werteliste je Test: [30, 99, 5] bei Eingaben 50, 20, 30, das macht den Fehler sichtbar, sonst [30], [1] bzw. [100]): Zahl 30, Eingaben 50, 20, 30 ergibt `Zu groß`, `Zu klein`, `Richtig!`, `Versuche: 3` · Zahl 30, Eingabe 30 ergibt `Richtig!`, `Versuche: 1` (Grenzfall) · Zahl 1, Eingaben 100, 1 ergibt `Zu groß`, `Richtig!`, `Versuche: 2` (Grenzfall unten) · Zahl 100, Eingaben 1, 99, 100 ergibt `Zu klein`, `Zu klein`, `Richtig!`, `Versuche: 3` (Grenzfall oben). Alle nachgerechnet. Tipps: (1) Führ das Programm aus und lies die Meldung von unten: In welcher Zeile fehlt etwas? (2) Läuft es, probier die Eingaben 50, 20, 30: Kommt am Ende `Richtig!`? (3) Wie oft wird die Zufallszahl gezogen? Abschnitt 3.

**Knobelaufgabe (freiwillig, zählt nicht im Fortschritt; `<Knobel id="kn-1">` mit `<Aufgabe id="k-1" ...>` ohne `data-count`, denn Knobelaufgaben bekommen `data-knobel` automatisch und `bausteine.mjs:362` verbietet das Attribut).** Nur Stoff bis Termin 10. Ausgearbeitet und nachgerechnet.

- **`kn-1` · „Der Computer rät“** (`k-1`, `code`, ausdrücklich `data-mode="code"`, damit die Tests die Funktion aufrufen können (wie v06 `w-3d`); ohne das Attribut gilt der Programm-Modus (`aufgaben.js:488`), der Studierendencode läuft dann nicht vorab, `computer_raet` und `hinweis` fehlen im Namensraum der Tests, und alle Tests scheitern; die Vorlage hat kein Hauptprogramm). Das ist die Knobelaufgabe aus Konzept-Entscheidung 7.
  Text: Du denkst dir eine Zahl von 1 bis 100, der Computer rät sie mit der Mitte. Er kennt deine Zahl nicht, er bekommt nur die Hinweise `Zu klein`, `Zu groß` und `Richtig!` von der Funktion `hinweis`. Schreib die Funktion `computer_raet(geheim)`: Sie rät mit der Mitte, fragt dazu jedes Mal `hinweis(tipp, geheim)` und gibt die Zahl der Versuche zurück. Für jede Zahl von 1 bis 100 sollen höchstens 7 Versuche reichen. Der erste Tipp darf nicht von `geheim` abhängen.
  Vorlage:
  ```python
  def hinweis(geraten, geheim):
      if geraten < geheim:
          return "Zu klein"
      elif geraten > geheim:
          return "Zu groß"
      else:
          return "Richtig!"

  # Schreib die Funktion computer_raet(geheim).
  # Sie gibt die Zahl der Versuche zurück.
  ```
  Musterlösung (mit Python 3.13 nachgerechnet):
  ```python
  def computer_raet(geheim):
      unten = 1
      oben = 100
      tipp = 0
      versuche = 0
      while tipp != geheim:
          tipp = int((unten + oben) / 2)
          versuche = versuche + 1
          antwort = hinweis(tipp, geheim)
          if antwort == "Zu klein":
              unten = tipp + 1
          elif antwort == "Zu groß":
              oben = tipp - 1
      return versuche
  ```
  Tests (Funktion wird direkt aufgerufen, `hinweis` wird für den Lauf durch eine Zählfunktion ersetzt; nachgebildet und ausgeführt, Technische Voraussetzung 5): für jede Zahl von 1 bis 100 höchstens 7 Versuche (die Musterlösung braucht für 1 sechs, für 50 einen, für 100 sieben, für 73 sechs, im Schnitt 5,8) · die Rückgabe stimmt mit der Zahl der Aufrufe von `hinweis` überein und der letzte Tipp ist die gesuchte Zahl · der erste Tipp ist für die Zahlen 3, 40, 77 und 100 derselbe (er darf `geheim` nicht kennen: Wer nur `hinweis(geheim, geheim)` aufruft, fällt hier durch). Die Aufgabe „1 bis 1000“ ergibt höchstens 10 Versuche (nachgerechnet), steht aber nur im Text der Auflösung.
  Tipps: (1) Wenn du 50 tippst und `Zu klein` hörst, welche Zahlen bleiben übrig? (2) Du merkst dir die Grenzen `unten` und `oben` und tippst immer die Mitte. (3) Die Mitte ist `int((unten + oben) / 2)`, bei `Zu klein` wird `unten` zu `tipp + 1`, bei `Zu groß` wird `oben` zu `tipp - 1`.
  Für die Auflösung (nicht getestet): Mach daraus ein Spiel mit dir: statt `hinweis(tipp, geheim)` fragt der Computer mit `input`, ob seine Zahl zu klein, zu groß oder richtig ist (zum Beispiel `k`, `g`, `r`). Dann denkst du dir eine Zahl und er findet sie in höchstens 7 Versuchen. Das ist dasselbe Prinzip, mit dem ein Rechner in einer sortierten Liste sucht (Termin 11 ff.).

## H. Videos (je etwa 2 bis 2,5 Minuten; hier nur der Inhalt, kein Sprechertext)

**Theorie (Lerneinheit, Abschnitt 1): „Schnell, groß, Zahlen“.** Die Speicher-Treppe in Zeitlupe (der Arbeitsspeicher dauert eine Sekunde, die SSD rund 17 Minuten, die Festplatte rund 28 Stunden, also mehr als ein Tag; dieselben Zahlen wie im Baustein); dann KB, MB und GB an Beispielen (Textseite, Foto, Film); zum Schluss das `A` als 65 mit den Bits und das kleine `a` als 97.

**Python-Werkzeugkasten (Labor, Station 1): „Mehr als ein Grund zum Aufhören“.** Karte 1 zeigt die Schleife mit `and`, Karte 2 die Text-Eingabe, Karte 3 die Mitte mit `int`. Karte 4 (ord und chr, nur lesen) kommt im Video nicht vor.

**Beispiel (Labor, Stufe 3 und 4): „Dein Spiel Schritt für Schritt“.** Aus dem Tipp mit Hinweis wird die Schleife, dazu der Zähler, dann die Funktion `spiel()`. Die Falle: Die Zufallszahl in der Schleife. Ein Lauf des fertigen Spiels mit Versuche-Zahl am Ende.

Abschnitt 2 bis 4 haben sonst kein eigenes Video. Sie leben von den Bausteinen und von „Schritt für Schritt“. Die Videos werden erst geplant, dann erzeugt (Sprechertext zuerst, Vertonung später).

## I. Ablaufplan für den Dozenten

Jeder 30-Minuten-Block verplant höchstens 28 Minuten, der letzte höchstens 24. Hier im Zuschnitt mit der Pause; in der App laufen die Minuten wie in Termin 05 ohne sie durch (0–10, 10–40, 40–70, 70–100, 100–125, Titel „Ablauf des Termins (125 Minuten)“), und die Pause wird nicht erwähnt.

| Minuten | Wo | Was |
|---|---|---|
| 0–10 | Papier, Beamer | **Warm-up.** Training 09, Aufgabe 1 „Spielzeug-Rechner von Hand“ auf Papier (5), Auflösung (2). Brücke: Wie groß ist der Speicher eines echten Rechners, wie schnell? (3) |
| 10–40 | Lerneinheit 1 | **Theorie: Speicher und Zeichen.** Stufen, Baustein „Speicher-Treppe“ mit Vermutung (8). KB, MB, GB, ein Rechenbeispiel (6). Vorhersage „Code des kleinen a“ (2). Baustein „Zeichen sind Zahlen“ mit Vermutung „Zeichen 5“ (8). Verplant: 24. |
| 40–70 | Lerneinheit 2, Labor 2, 3 | **Programmieren 1: Zahlenraten, Stufe 2.** Rückgriff und das Beispiel „Summe bis 0“ am Beamer (4). Plan zeichnen (8). Vorhersage (3). Code zum Plan mit Gerüst (9). Läufe und Grenzfälle am Beamer (3). Verplant: 27. |
| 70–80 | – | **Pause** (nur im Zuschnitt). |
| 80–110 | Lerneinheit 3, Labor 4 | **Programmieren 2: Zahlenraten, Stufe 3.** Der Zähler (3). Stufe 3 selbst, kein Gerüst (10). Vorhersage „Zufall in der Schleife“ (3). Baustein „Immer die Mitte“ mit Vermutung (7). Läufe und Grenzfälle am Beamer (2). Verplant: 25. |
| 110–135 | Lerneinheit 4, Labor 5, 6, 7 | **Programmieren 3: dein Spiel.** Gliedern: das Beispiel „Summe“ als Funktion am Beamer (1). Stufe 4 selbst, der Plan von `spiel()` als Tipp 3 (12). Pflichtliste abhaken, Meldung „Dein Spiel läuft“ (3). Ausbau und Knobel für die Schnellen (parallel zum Abhaken, keine eigenen Minuten). Ausblick auf das 2. Semester (3). Hinweis für die Praxisphase: Spiel sichern, Training 10 freiwillig, Empfehlung (3). Auftrag für zu Hause, 15 Minuten Pflicht (2). Verplant: 24. |

Wenn die Zeit knapp wird: Im Block 10–40 entfällt zuerst die Vorhersage „Code des kleinen a“, dann die Speicher-Treppe wird in der Lerneinheit gelesen statt im Termin gespielt (3 Minuten gespart). Im Block 40–70 wird der Plan nur gelesen, nicht gezeichnet; Code zum Plan (Station 3) hat Vorrang. Im Block 80–110 entfällt zuerst das Beamer-Lauf-Beispiel, dann der Baustein „Immer die Mitte“ (er läuft in der Lerneinheit, und die Knobelaufgabe nutzt ihn). Die Stufe 3 hat Vorrang, weil ohne sie die Stufe 4 nicht beginnen kann. Im letzten Block gilt: Wer die Stufe 4 nicht schafft, bekommt nach dem dritten Tipp die Musterlösung zum Nachbauen zu Hause (die Pflicht zu Hause wächst dann auf 25 Minuten, das wird ausdrücklich gesagt). Der Ausblick und der Hinweis für die Praxisphase bleiben immer im Termin, weil sie nur hier gesagt werden können.

Die drei Klausurformen im Termin: Plan zeichnen (Station 2), Plan in Code übertragen (Station 3), Code lesen (Vorhersagen in Block 1 bis 3, Station 5 in der Auswertung). Zu Hause dazu, freiwillig: Plan in Code im Klausurmodus (Training 2), Ablauf des eigenen Spiels verfolgen (Training 3), Fehler finden (Training 4).

---

# Bewusst weggelassen

**Speicher und Zeichen**
- Cache-Stufen (L1, L2, L3), Register einzeln, virtueller Speicher, Auslagerungsdatei, Speicherzellen mit Adressen und Zeigern, RAID, Cloud-Speicher: nein.
- 1 KiB, 1 MiB (Zweierpotenzen als eigene Einheiten): nur der Satz „viele Programme rechnen mit 1024“ (Entscheidung T10-1).
- Zeichentabellen über ASCII hinaus (Latin-1, Unicode im Einzelnen, UTF-8 als Aufbau), Emojis: nur ein Satz. `ord()` und `chr()` in Python: nur die Lesekarte, keine Aufgabe, kein Klausurstoff (Entscheidung T10-2).
- Rechnungen mit Bit und Byte gemischt (Übertragungsraten, Mbit gegen MB): nein.

**Zahlenraten**
- Eingaben prüfen (Zahl außerhalb von 1 bis 100, Buchstaben statt Zahl): geht nur mit `try` oder umständlich mit `if`. Stufe 4 verlangt es nicht; wer 150 tippt, bekommt `Zu groß`.
- Mehr als eine Funktion mit Parametern in `spiel()`, `spiel(grenze)` mit einstellbarem Bereich: nur Ausbau-Idee im Gespräch, keine Aufgabe.
- `break`, `continue`, `while True:`: bleiben draußen, die Schleife endet über die Bedingung.
- Punkte nach Versuchen, Bestenliste, mehrere Spieler: braucht Listen (Termin 11 ff.).
- Der Computer rät mit `input` statt `hinweis`: nur in der Auflösung der Knobelaufgabe.
- Aufgaben zu `ord()` und `chr()` sowie zum Rechnen mit `2 ** n` (Schritte der Mitte-Strategie): `**` bleibt nur zum Lesen (Termin 07); der Satz „2⁷ gleich 128“ steht als Wertebereich aus Termin 05.

**Aufbau**
- Ein Selbstcheck über das ganze Semester: nein. Der Termin 11 beginnt mit Auffrischern, das freiwillige Training 10 ist die Wiederholung.
- Videos zu Abschnitt 2 bis 4: Bausteine und „Schritt für Schritt“ genügen, außer dem Beispielvideo „Dein Spiel Schritt für Schritt“.
- Was Termin 08 und 09 für Funktionen offen lassen (Standardwerte, mehr als zwei Parameter, mehrere Rückgabewerte, `return` in einer Schleife, Funktionen als Argument): auch hier nicht; `hinweis` hat zwei, `computer_raet` einen, `spiel()` keinen Parameter.

---

# Technische Voraussetzungen

Belegt heißt: im Code gelesen oder gerechnet. Nicht ausprobiert ist ausdrücklich gesagt. Grundlage ist die Technikprüfung vom 2026-11-27 (Dateien `site/assets/js/aufgaben.js`, `pap-engine.js`, `pap-editor.js`, `speicher.js`) und die Zuschnitte der Termine 06, 07 und 09.

1. **Dateinamen `explorables-v10.js` und `v10.css` sind alt belegt (Pflicht, ca. 1 Stunde).** `site/assets/js/explorables-v10.js` (625 Zeilen) ist der Baukasten der alten V10 „Wie funktioniert KI?“ (Mini-Sprachmodell, Tokenizer, List Comprehension, Textgenerierung als Plan). `site/assets/css/v10.css` (124 Zeilen) trägt die `.v10-…`-Regeln. Keine Seite unter `app/inhalte`, `app/src`, `app/skripte` und `docs` lädt eine der beiden Dateien (gesucht, keine Treffer; ein Test `explorables-v10.test.mjs` gibt es nicht). Vorschlag wie bei V05: beide Dateien durch die neuen ersetzen. Das Thema KI kommt im 2. Semester als T8 mit eigener Kennung (V12 und V13) neu; der alte Baukasten ist dann Vorlage und nicht verloren, solange er im Git-Verlauf steht. Ebenso belegt: `video-src/v10-beispiel`, `v10-python`, `v10-theorie`, `v10-common` und `site/assets/video/v10-theorie.mp4` mit Poster und Untertitel (alte V10).
2. **Zahlenraten-Tests mit festem Zufall (Pflicht, ca. 3 Stunden zusammen mit Termin 09).** Die Hilfsfunktion `mit_zufall(werte, eingaben)` steht in Termin 09 (Technische Voraussetzung 2). Alle Aufgaben dieses Termins mit Zufall (Station 2 bis 7, Training 2 und 4) benutzen sie. Für die Aufgaben mit zwei Spielen (Station 7) liefert sie nacheinander zwei Werte (das Spiel ruft `randint` zweimal). Mit mehreren Werten (30, 99, 5) wird der Fehler „Zufallszahl in der Schleife“ sichtbar: Steht die Zeile vor der Schleife und zusätzlich im Rumpf, erscheinen `Zu klein`, `Zu groß`, `Zu groß`, danach bricht der Lauf mit `EOFError` ab, weil die Eingaben ausgehen; steht sie nur im Rumpf, meldet Python `NameError: name 'geheim' is not defined` (beides nachgebildet und ausgeführt). Mit nur einem Wert bleibt dagegen alles unauffällig (jeder Aufruf liefert denselben Wert): Dort findet allein die Prüfung `aufrufe == [(1, 100)]` den Fehler, darum steht sie in jeder Aufgabe mit Zufall (Termin 09 Festlegung 8). Die Meldung der Aufgabe nennt den Verdacht („Wird die Zahl wirklich nur einmal gezogen?“). `run_program` wandelt den Abbruch in eine Meldung („Dein Programm bricht bei den Eingaben … ab“, `aufgaben.js:298` ff.); der Text der Aufgabe fängt ihn ab und ergänzt die Frage.
3. **Knopf „Meinen Code laden“ (beschlossen, Pflicht, ca. 0,5 Tag; Entscheidung T10-5).** Der Stand von `code`-Aufgaben liegt je Lektion unter `code:<id>` (`aufgaben.js:693`, gelesen), erreichbar über `KS.stand(lektion, schluessel)` (`speicher.js`, `KursSpeicher.pfad`). Vertrag (die Datei steht auch als Notiz im Scratchpad der Bauagenten):
   - **Attribut:** `data-start-aus="<id>"` an der Zielaufgabe (`art="code"`, auch `run`, nicht `klausur`). Wert: die Id der Vorstufe in derselben Lektion (`w-stufe2`) oder `V10:w-stufe2` für eine andere Lektion. Die Vorstufe ist eine `code`-Aufgabe (gespeichert unter `code:<id>`). Ohne das Attribut gibt es keinen Knopf, alle anderen Aufgaben bleiben unverändert.
   - **Knopf:** „Meinen Code laden“ in der Knopfleiste. Klick: (1) Gibt es gespeicherten Code der Vorstufe, ersetzt er den Editorinhalt („Dein Code aus der letzten Aufgabe ist geladen.“). (2) Sonst, wenn die Vorstufe auf derselben Seite steht, eine Musterlösung hat und schon geprüft oder gelöst ist (oder ihre Lösung zum Vergleich freigeschaltet ist), wird die Musterlösung geladen („Du hast die letzte Aufgabe nicht bearbeitet. Geladen ist die Musterlösung.“). (2b) Ist die Vorstufe noch nicht geprüft, lautet die Meldung „Bearbeite zuerst die Stufe davor.“, der Editor bleibt (sonst ließe sich die Freigabe der Lösungen umgehen). (3) Sonst „Zu dieser Aufgabe gibt es noch keinen Code.“, der Editor bleibt.
   - **Ersetzen:** Weicht der Editor von der Vorlage ab, verlangt der Knopf einen zweiten Klick (Text „Wirklich ersetzen?“, Meldung „Dein Code hier wird ersetzt.“), kein `window.confirm`. „Zurücksetzen“ stellt die Vorlage wieder her, nicht den geladenen Code. Der geladene Code läuft über den normalen Weg (Eingabeereignis) und wird unter `code:<eigene id>` gespeichert.
   - **Vorlage:** Die Vorlage der Zielaufgabe ist auch ohne den Knopf brauchbar (ein Kommentar, kein fremder Code); die Musterlösung der Vorstufe steht **nicht** in der Vorlage, sonst wäre sie vor der Vorstufe sichtbar. Der Aufgabentext nennt den Knopf („Mit ‚Meinen Code laden‘ holst du deinen Code aus Station 3“). Vorlagen: Station 4 bis 7 beginnen je mit dem Kommentar „# Lade mit ‚Meinen Code laden‘ deinen Code aus Station n und ergänze ihn.“ (n = 3, 4, 5, 6); der Aufgabentext nennt den Knopf ebenso.
   - **Stationen:** Station 4 (`data-start-aus="w-stufe2"`), Station 5 (`"w-stufe3"`), Station 6 (`"w-stufe4"`), Station 7 (`"w-ausbau-a"`). Station 6 und 7 tragen `data-count="0"` (`aufgaben.js:53`: zählt nicht im Fortschritt). Station 3 startet mit dem Gerüst und der fertigen Funktion `hinweis`, weil Stufe 1 ein Lückencode ist und keinen eigenen Code speichert (nur die Lückenwerte, `luecken:<id>`, `aufgaben.js:892`).
   - **Kern und Test:** reiner Kern `KursAufgaben.startcode` mit `parse(spec, heute)` und `waehle(stand, loesung)` (Quelle `eigen` oder `muster`), Test `app/skripte/tests/aufgaben-start.test.mjs`. Im Browser nicht ausprobiert.
3a. **Überschrift von Teil B (beschlossen, klein).** `labor.js:64/75` baut sie fest als „Teil B · Training zu Hause (n Min, Pflicht)“; mit `zuhause="15"` stünde über dem freiwilligen Training „Pflicht“. Ein Attribut `training="freiwillig"` an `<Labor>` macht daraus „Teil B · Training zu Hause (freiwillig, 30 Min)“ und nennt die Pflicht von 15 Minuten (Werkzeugkasten, Selbstcheck, Spiel sichern) getrennt im Einleitungssatz `l-task__intro`. Test in `termin02-03.test.mjs`. `zuhause` heißt in `bausteine.mjs:15` „Minuten Training zu Hause“; hier zählt es die Pflichtminuten.

4. **Plan-Editor (nur Aufgaben, zwei kleine Zusätze gegenüber Termin 07 und 09).** Station 2 braucht eine Schleife mit Bedingung, ein Unterprogramm, eine vorgegebene Funktion in den Startdaten (`w-plan.start.json`, ein Knoten `k: 'def'`, siehe Termin 09 Technische Voraussetzung 3), `data-erlaubt="in,out,op,while,call"` und **als ersten Knoten des Hauptplans eine vorgegebene Operation `import random`**: Der Plan-Editor kennt kein `import` (`pap-engine.js`, gelesen: kein Treffer), `toText` setzt nur die `def`-Blöcke vor den Hauptplan, und `run_program` führt den Code in einem leeren Namensraum aus; `mit_zufall` hilft hier nicht, weil `random` im Namensraum des Studierendencodes fehlt. Ohne die Zeile bricht jeder Test mit `NameError: name 'random' is not defined` ab, auch die Musterlösung. Test in `pap-engine.test.mjs`: der Hauptplan der Lösung mit `import random`, `hinweis` und festem `randint` ergibt die Ausgaben aus Station 2 (ca. 1 Stunde). Zweiter Zusatz, **Code-Ansicht abschalten** (ca. 0,5 Stunden): Der Plan-Editor hängt in jede Aufgabe „Erzeugten Python-Code ansehen und ausführen“ an (`pap-editor.js:672`); in Station 2 würde er den Code für Station 3 liefern. Ein Attribut `data-ohne-code` lässt den Bereich weg. Alternative: Station 3 überträgt einen anderen Plan (zum Beispiel „Summe bis 0“), dann bricht aber die Kette Stufe 2 bis 4 auf. Die Pläne in Abschnitt 4 (`summiere()`), bei Station 5 (`spiel()` mit Schleife und `Rückgabe: versuche` am Ende, als Tipp 3) und im Training 2 sind nur Darstellung (`<Plan>`), nicht Aufgaben. Das `return` in einer Verzweigung ist im Editor nicht zeichenbar (Termin 09, Frage 1); alle Pläne dieses Termins geben am Ende der Funktion zurück.
5. **Test der Knobelaufgabe `computer_raet` (Pflicht, ca. 2 Stunden).** Die Aufgabe braucht ausdrücklich `data-mode="code"` (ohne das Attribut gilt der Programm-Modus, `aufgaben.js:488`: Der Studierendencode läuft nicht vorab, `computer_raet` und `hinweis` fehlen im Namensraum der Tests, alle Tests scheitern; Vorbild v06 `w-3d`): Der Studierendencode wird einmal ohne Eingaben ausgeführt (`_run_user(src, [], True, False)`, `aufgaben.js:488–500`, gelesen) und seine Namen stehen im Test-Namensraum (`ns`, `aufgaben.js` ca. 314, gelesen). Die Vorlage hat kein Hauptprogramm, sonst scheitert der Lauf an `input()`. Der Test ersetzt `hinweis` in `globals()` für den Lauf durch eine zählende Funktion und stellt sie wieder her (nachgebildet mit drei Lösungen und ausgeführt: die Musterlösung besteht beide Tests, die „schummelnde“ Lösung `hinweis(geheim, geheim); return 1` fällt bei „erster Tipp gleich“ durch, die langsame Lösung `tipp = tipp + 1` fällt bei „höchstens 7“ durch). Nicht im Browser ausprobiert. Die Zeilenzahl der Tests (100 Zahlen mal höchstens 7 Tipps) liegt weit unter `_MAX_ZEILEN` (`aufgaben.js:154–158`).
6. **Bausteine `treppe`, `zeichen`, `halbieren` (zusammen ca. 1,5 Tage).** `treppe` etwa 0,5 Tag: vier Balken in SVG mit logarithmischer Länge, das Anklicken einer Stufe lässt einen Wartebalken laufen (gerafft bei SSD und Festplatte), Auswahl für die Vermutung als Daten, der Zeitlupe-Faktor als Rechenkern ohne DOM (Zeit durch 100 Nanosekunden, formatiert in Sekunden, Minuten, Stunden; nachgerechnet: 0,01 s, 1 s, 1000 s gleich 16,7 Minuten gleich „17 Minuten“, 100 000 s gleich 27,8 Stunden gleich „28 Stunden“). `zeichen` etwa 0,5 Tag: Tabelle der erlaubten Zeichen (Festlegung 5: Leerzeichen, Ziffern, Buchstaben) als Daten, das Wechseln von groß und klein (nur Buchstaben), Meldung für jedes andere Zeichen. `halbieren` etwa 0,5 Tag: Streifen mit Bereich, Rechenkern `mitte(unten, oben)` mit `Math.floor((unten + oben) / 2)` (stimmt mit Python `int(…)` überein, weil beide Zahlen positiv sind); der Test des Rechenkerns läuft über alle 100 Zahlen und prüft höchstens 7 Versuche (Verteilung 1, 2, 4, 8, 16, 32, 37, nachgerechnet), die Oberfläche zeigt sie nicht. Test `app/skripte/tests/explorables-v10.test.mjs` nach dem Muster von `explorables-v05.test.mjs`.
7. **Hinweis für die Praxisphase: Sichern (kein Werkzeugbau, Entscheidung T10-3).** Der Stand liegt über `KursSpeicher` im Browser (`localStorage`, Adapter austauschbar, `speicher.js`, Kopf); `KursSpeicher.exportieren()` liefert ein JSON-Objekt, `importieren(obj)` führt zusammen. Es gibt noch keinen Knopf dafür, und es wird keiner gebaut (Entscheidung T10-3): Es bleibt beim Hinweis „Spiel sichern (Code kopieren)“, der nichts kostet. Nicht ausprobiert, ob der Stand nach drei Monaten ohne Besuch im Browser noch da ist (Browser räumen Websitedaten bei geringer Nutzung teilweise auf; das ist der Grund für den Hinweis).
8. **`kurs.yaml` (nach dem Bau, ca. 0,5 Stunden).** `lektion: V10` bei Termin 10, Eintrag V10 mit `titel` „Schnell, groß, Zahlen: Speicher und dein fertiges Spiel“, `kurz` „Speicher, Zahlenraten“, `hook` „Dein erstes Spiel läuft“, `python` laut Abschnitt A, `lerneinheit: v10-speicher-und-zahlenraten.html`, `labor: v10-labor.html`, `aktiv: false`. Termin 09 (V09) muss vorher gebaut sein.
9. **Meldungen und Testdaten.** Alle Meldungen sind mit Python 3.13 ausgegeben: `SyntaxError: expected ':'` (Zeile 14 der Vorlage in Training 4), `NameError: name 'geraten' is not defined`, `NameError: name 'geheim' is not defined` (Station 3, `randint` nur im Rumpf), `EOFError` beim Aufbrauchen der Eingaben. Die Lesekarte `ord`/`chr` hat keine Meldung und keinen Test. Antworten mit Zahlen und Buchstaben (Training 1) werden wörtlich verglichen (`normVal`, `aufgaben.js:906`); `gross: false` gilt für die ganze Aufgabe und wirkt nur bei Zeile 5. Alle Zufallswerte stammen aus `mit_zufall`; kein Test hängt von einem echten Zufall ab.
10. **Schema, Pflichtliste und eigene Meldung bei `code`-Aufgaben (Station 5; Pflicht, ca. 1 Tag).** Das Punkteschema (`script data-role="scheme"`, `.scheme.json`) wird in `aufgaben.js` nur in `initKlausur` gelesen und angezeigt (`:720` ff., gelesen), also nur bei `art="klausur"`. Station 5 ist aber `code` und braucht „Ausführen“, damit man das eigene Spiel spielen kann; eine `klausur`-Aufgabe hat keinen Ausführen-Knopf. Für eine Pflichtliste zum Abhaken und eine eigene Erfolgsmeldung gibt es keine Komponente: `renderResults` zeigt fest „Alle N Tests bestanden. Aufgabe gelöst.“. Nötig sind (a) das Schema auch bei `art="code"` (der Schema-Teil von `initKlausur` wird herausgelöst), (b) die Pflichtliste als Checkliste, (c) ein Attribut `data-erfolg` mit dem Text der Meldung. Nicht ausprobiert. Alternative ohne Werkzeugbau: Pflichtliste und Schlusssatz als statischer Text unter der Aufgabe (Kästchen ohne Speicherung), das Schema entfällt hier und bleibt in Training 2 (`klausur`).
11. **Gebaut werden danach:** `kurs.yaml` (Punkt 8), `app/inhalte/v10/lerneinheit.mdx`, `app/inhalte/v10/labor.mdx` (`zuhause="15"`, `training="freiwillig"`, Training mit `data-count="0"`, Knobelaufgabe ohne `data-count`, Lesekarte als Karte 4 in Station 1) mit den Aufgaben `w-plan`, `w-stufe2`, `w-stufe3`, `w-stufe4`, `w-ausbau-a`, `w-ausbau-b`, `tr-1` bis `tr-4` (freiwillig), Knobel `k-1` (je `.vorlage.py`, `.tests.py`, `.solution.py`, Pläne und Daten als `.json`, `w-stufe4.scheme.json`), `explorables-v10.js`, `v10.css`. Der Aufwand der Werkzeug-Punkte 3, 4, 5, 6 und 10 liegt bei etwa 4 Tagen (ohne Sichern-Knopf); die größten Posten sind der Knopf „Meinen Code laden“, das Schema bei `code`-Aufgaben und die Bausteine.

---

# Entscheidungen des Dozenten (2026-11-27, Kennung T10-1 bis T10-6)

T10-1. Gerechnet wird mit 1000 (1 GB = 1000 MB), ein Satz nennt 1024 als Wert „in vielen Programmen“. Die Speicher-Treppe bleibt mit gerundeten Werten und Zeitlupe, beschriftet „ungefähr“ (Empfehlung).
T10-2. **Abweichend: `ord()` und `chr()` auf einer Karte nur zum Lesen** (`ord("A")` ist 65, `chr(66)` ist `B`), ohne Aufgabe und ohne Klausurstoff, wie `**` in Termin 07.
T10-3. **Abweichend: Training 10 ist freiwillig.** Hinweis für die Praxisphase: „Spiel sichern (Code kopieren)“, ein freiwilliger Plan „dreimal 20 Minuten“, Zusage: Termin 11 beginnt mit Auffrischern. Der Auffrischer in Termin 11 übernimmt, was fehlt. Kein Knopf „Meinen Stand sichern“.
T10-4. Training 3 verfolgt das eigene Spiel (Stufe 3 mit festen Eingaben, Spalten `geraten` und `versuche`, dazu die Ausgabe); das Halbieren bleibt in Baustein und Knobelaufgabe (Empfehlung).
T10-5. Knopf „Meinen Code laden“ wird gebaut: Jede Stufe kann mit dem eigenen Code der Vorstufe beginnen (Empfehlung, ca. 0,5 Tag).
T10-6. Aus Termin 08: `%` ist eingeführt und darf benutzt werden; `//` nicht. Aus Termin 09: Hinweistexte `Zu klein`, `Zu groß`, `Richtig!`, Rechenplatz statt Akku, gleiche Namen erlaubt, `random` ist Klausurstoff.

# Offene Fragen an den Dozenten

Keine. Alle 6 Fragen sind am 2026-11-27 beantwortet und eingearbeitet (Frage 1 → T10-1, Frage 2 → T10-2, Frage 3 und 4 → T10-3, Frage 5 → T10-4, Frage 6 → T10-5: Der Knopf „Meinen Code laden“ wird gebaut; T10-6 übernimmt Festlegungen aus Termin 08 und 09).
