# Zuschnitt Termin 05 (Entwurf zur Bestätigung)

Aufbau und Ton wie `briefing/termin-04-zuschnitt.md`. Grundlage ist der abgestimmte Konzeptvorschlag `briefing/termin-05-konzept.md` mit den Antworten vom 2026-11-26: nur binär (hex in Termin 06), dezimal → binär mit der Stellenwerttabelle, Zweierkomplement, binäres Rechnen und Oktal entfallen, Wertebereich und Überlauf kommen mit T5 (Termin 07), Programmieren mit `for` und `range`, Aufsummieren mit Mittelwert, `if` ohne `else` im Rumpf, kein `%` und kein `//`. Alle Umrechnungen, Tabellen, Programme, Ausgaben und Fehlermeldungen sind mit Python 3.13 nachgerechnet (die Seite läuft mit Pyodide 0.26.4, also Python 3.12; die hier genannten Meldungen sind in beiden gleich). Wo dieses Papier „zu bestätigen“ sagt, liegt die Entscheidung beim Dozenten (Liste am Ende).

## Aufteilung

| Einheit | Termin 05 |
|---|---|
| T3 Zahlensysteme, Teil 1 von 2 | Block 1: Stellenwert, binär → dezimal, dezimal → binär mit der Stellenwerttabelle, Bit und Byte, n Bit ergeben 2ⁿ Werte |
| P3 Schleifen, Teil 3, 4 und 5 von 7 | Block 2: Zählschleife `for i in range(…)`, neben die `while`-Form gestellt, Plan mit der Raute „i von 1 bis 5?“. Block 3: Aufsummieren und Mittelwert. Block 4: `if` ohne `else` im Rumpf, zählen, wie viele Werte eine Grenze erreichen |

Beispielwelt: Theorie die acht Schalter eines Bytes und die Zeilen der Wahrheitstabelle; Programmieren Alltag (Runden laufen, Einmaleins, Treppe, Punkte der Übungsblätter, Pendelzeit, Wochenschritte, Würfel, Sommertage, Sparplan, Laufzeiten). Maschinenbau dort, wo es natürlich passt: der Sensor mit 10 Bit im Selbstcheck und das Training „Bolzen einer Charge prüfen“ (wie „Druck prüfen“ in Termin 04).

Reihenfolge wie im `KONZEPT.md`: Theorie, dann drei Blöcke Programmieren. Vor der Pause liegt der erste Programmierblock (`for` und `range`), danach Aufsummieren und Auswählen. Das passt, weil Block 3 und 4 dasselbe Beispiel (Punkte der Übungsblätter) weiterbauen.

Ein Abweichen vom Konzept vorweg: Das Konzept nennt für Block 2 „den Countdown aus Termin 04 einmal als `while`, dann als `for`“. Rückwärts zählen geht mit `for` nur mit Schrittweite `range(5, 0, -1)`, und die Schrittweite ist für Termin 06 vorgesehen. Dieser Zuschnitt zählt deshalb vorwärts („Fünf Runden“). Frage 1.

## Festlegungen für Termin 05

Es gelten alle Festlegungen aus Termin 02 bis 04 (Stationsreihenfolge von Termin 01, drei gestufte Tipps, Grenzfall in jeder Aufgabe, höchstens 28 Minuten je Block verplant, Videos laufen nicht im Termin, Pausen stehen nicht in der App, Meldungstexte ohne Gedankenstrich). Dazu neu:

1. **Kennung V05**, Ordner `app/inhalte/v05/`, Adressen `v05-zweiersystem-und-zaehlschleifen.html` und `v05-labor.html`, Bausteine in `explorables-v05.js` mit `v05.css`. Beide Dateinamen sind schon belegt (alte V05, und `v05.css` trägt die Plan-Regeln aller Seiten): Technische Voraussetzung 1. In `kurs.yaml` bekommt `termine` bei `nr: 5` den Zusatz `lektion: V05`, der Eintrag unter `lektionen` zunächst mit `aktiv: false` (Entwurf wie V03 und V04).
2. **Schreibweise der Binärzahlen.** Ein Byte steht immer mit 8 Stellen in zwei Vierergruppen: `0010 1101`. Kürzere Zahlen bis 4 Stellen stehen ohne Lücke: `1011`. Führende Nullen ändern den Wert nicht (wie bei 045 und 45). Einen Index (1011₂, 11₁₀) gibt es nur, wo eine Verwechslung droht, zum Beispiel „10₂ ist 2“. Kein `0b` (kommt mit Termin 06). In Eingabefeldern zählt ein Leerzeichen in der Mitte nicht (Technische Voraussetzung 3). Zu bestätigen, Frage 2.
3. **Eine Methode für beide Richtungen: die Stellenwerttabelle** 128, 64, 32, 16, 8, 4, 2, 1, immer von links nach rechts. Binär → dezimal: die Stellenwerte unter den Einsen addieren. Dezimal → binär: Passt der Stellenwert in den Rest, ist das Bit 1 und er wird abgezogen, sonst ist das Bit 0 und der Rest bleibt. Zahlen nur von 0 bis 255.
4. **Wörter (Theorie):** Zweiersystem (auch Binärsystem), Dezimalsystem, Stellenwert, Bit, Byte. „Ziffer“ statt „Zeichen“. Die Brücke zu Termin 03 und 04: Die Zeilen einer Wahrheitstabelle zählen im Zweiersystem.
5. **Zählschleife im Code** immer als `for i in range(…):`, die Schleifenvariable heißt `i`. Selbst geschrieben wird `range(start, stopp)`, für „1 bis n“ also `range(1, n + 1)`. `range(stopp)` mit einer Zahl wird nur gelesen (Vorhersage, Selbstcheck), zu bestätigen, Frage 3. Keine Schrittweite, kein `for` über Text oder Listen. Im Rumpf einer `for`-Schleife steht kein `i = i + 1`.
6. **Im Plan** ist die Zählschleife eine Raute mit Rücksprung, beschriftet „i von 1 bis 5?“ beziehungsweise „i von 1 bis n?“ (im `<Plan>` als `Schleife: i von 1 bis n?`). Ja führt durch den Rumpf und zurück, nein weiter. Einmal (Lerneinheit, Abschnitt 2) steht sie neben der `while`-Form mit eigenem Zähler. Im Plan-Editor heißt das Symbol „Zählschleife“, eingetragen wird `i in range(1, 11)`, die Raute zeigt „i von 1 bis 10?“ (Technische Voraussetzung 2).
7. **Ablauf verfolgen mit `for`:** Die Zeile `for …` kommt vor jedem Durchlauf und einmal am Ende, wenn `range` keine Zahl mehr hat (so zählt auch Python, nachgeprüft mit `sys.settrace`). In dieser Zeile wird `i` eingetragen und in der Spalte „Weg“ ja oder nein (ohne Anführungszeichen). Beim letzten Mal ändert sich `i` nicht mehr, es bleibt beim letzten Wert.
8. **Grenzfall** wie in Termin 04: die Grenze selbst (`>=` gegen `>`) oder die Schleife, die nie läuft (`n = 0`). Ausnahme sind Aufgaben mit Mittelwert: Bei `n = 0` teilt das Programm durch 0 (`ZeroDivisionError: division by zero`). Dort sagt der Aufgabentext „mindestens 1“, und der Grenzfall ist `n = 1`. Die Meldung wird einmal gezeigt (Station 2, Selbsterklärung), abgefangen wird sie nicht.
9. **Mittelwert** heißt im Text Mittelwert, in den Ausgaben „Durchschnitt“ oder „im Schnitt“. Ausgegeben mit `:.1f` aus Termin 02, über eine eigene Zeile `mittel = summe / n` (kein Rechnen in den geschweiften Klammern). Testdaten enden nie auf eine 5 an der zweiten Nachkommastelle: `f"{7.25:.1f}"` ergibt `7.2`, nicht `7.3`.
10. **Wörter (Programmieren):** Zählschleife, Schleifenvariable, Durchlauf, Rumpf (wie Termin 04), Startwert (`summe = 0`), Stoppwert („gehört nicht dazu“). Die drei Stellen eines Schleifenprogramms heißen „vor der Schleife“, „im Rumpf“, „nach der Schleife“. Faustregel: Steht vorher fest, wie oft, nimm `for`. Sonst nimm `while`.

---

# Termin 05

## A. Kopf

- Titel: **Genau so oft: Zweiersystem und Zählschleifen** (Arbeitsname aus dem Konzept, beibehalten: „genau so oft“ trifft beide Hälften, acht Stellen und n Durchläufe)
- Vorspann: Eine Wahrheitstabelle mit vier Variablen hat 16 Zeilen, von 0000 bis 1111. Das ist schon Zählen, nur mit zwei Ziffern. Heute rechnest du zwischen Zweiersystem und Dezimalsystem um. Und du lässt eine Schleife genau so oft laufen, wie du willst: mit `for`.
- Lernziele:
  - eine Binärzahl mit bis zu 8 Stellen in eine Dezimalzahl umrechnen und eine Zahl von 0 bis 255 mit der Stellenwerttabelle ins Zweiersystem
  - sagen, was Bit und Byte sind, und warum n Bit 2ⁿ Werte ergeben (8 Bit: 256 Werte, 0 bis 255)
  - eine Zählschleife mit `for i in range(…)` schreiben, als Plan mit der Raute „i von 1 bis n?“ zeichnen und angeben, welche Werte `i` annimmt
  - Werte in einer Schleife aufsummieren, den Mittelwert bilden und mit `if` im Rumpf zählen, wie viele Werte eine Grenze erreichen
- kurz: „Zweiersystem, for“
- hook: „Acht Schalter, 256 Zahlen“
- neu in Python (Feld `python` in `kurs.yaml`): `python: ["for i in range(…):", "range(start, stopp)", "if ohne else"]`. Dazu die Meldungen `ZeroDivisionError: division by zero`, `NameError: name 'summe' is not defined` und `SyntaxError: invalid syntax. Perhaps you forgot a comma?`. `summe = summe + punkte` und `anzahl = anzahl + 1` kennen die Studierenden aus Termin 04 (Einkauf, Sparziel) und stehen nicht in der Liste.

## B. Warm-up (0–10)

Training Termin 04, Aufgabe 1 „Wahrheitstabelle ausfüllen“: Y = (A ODER B) UND (C ODER D), 16 Zeilen, alle auf Papier (5 Minuten). Auflösung, Zeilen 0000 bis 1111:

| Spalte | Werte |
|---|---|
| A ODER B | 0 0 0 0 · 1 1 1 1 · 1 1 1 1 · 1 1 1 1 |
| C ODER D | 0 1 1 1 · 0 1 1 1 · 0 1 1 1 · 0 1 1 1 |
| Y | 0 0 0 0 · 0 1 1 1 · 0 1 1 1 · 0 1 1 1 (9 Einsen) |

Brücke in die Theorie (3 Minuten, Frage in die Runde): Die erste Zeile ist 0000, die letzte 1111. Wenn die Zeilen zählen, welche Zahl ist dann 1111? Auflösung in Abschnitt 1: 15, und 0000 ist 0. Deshalb sind es 16 Zeilen.

## C. Lerneinheit

### Abschnitt 1 · Das Zweiersystem (T3, Teil 1 · 10–40)

Kernaussage: Im Zweiersystem gibt es nur 0 und 1, und jede Stelle ist doppelt so viel wert wie die rechts daneben. Mit dieser Stellenwerttabelle rechnest du in beide Richtungen um.

- Stellenwert im Dezimalsystem: 345 = 3 · 100 + 4 · 10 + 5 · 1. Jede Stelle ist zehnmal so viel wert wie die rechts daneben, Ziffern gibt es zehn (0 bis 9).
- Im Zweiersystem (auch Binärsystem) gibt es zwei Ziffern, 0 und 1. Jede Stelle ist doppelt so viel wert wie die rechts daneben: 1, 2, 4, 8, 16, 32, 64, 128. Grund: Ein Rechner speichert alles mit Schaltern, die an oder aus sind.
- Begriffe: Eine Stelle heißt Bit (0 oder 1, ein Schalter aus oder an). 8 Bit sind ein Byte. Ein Byte steht in zwei Vierergruppen: `0010 1101`.
- Begriffs-Hinweise (`<Begriff e="…">`): Zweiersystem „Ein Zahlensystem mit nur zwei Ziffern, 0 und 1. Jede Stelle ist doppelt so viel wert wie die rechts daneben.“ · Stellenwert „Was eine Ziffer an ihrer Stelle wert ist. Bei 345 ist die 4 vierzig wert, weil sie an der Zehnerstelle steht.“ · Bit „Eine Stelle im Zweiersystem: 0 oder 1, wie ein Schalter aus oder an.“ · Byte „8 Bit. Damit lassen sich 256 verschiedene Werte darstellen, 0 bis 255.“ In Abschnitt 3: Mittelwert „Die Summe aller Werte geteilt durch ihre Anzahl, auch Durchschnitt genannt.“ In Abschnitt 2: Zählschleife „Eine Schleife, bei der vorher feststeht, wie oft sie läuft. In Python: for.“

Stellenwerttabelle, binär → dezimal (die Stellenwerte unter den Einsen addieren):

| Stellenwert | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
|---|---|---|---|---|---|---|---|---|
| 0010 1101 | 0 | 0 | 1 | 0 | 1 | 1 | 0 | 1 |

32 + 8 + 4 + 1 = **45**. Vorher an der Tafel die kurze Form: 1011 = 8 + 2 + 1 = 11. Per Zuruf: 1010 0110 = 128 + 32 + 4 + 2 = **166**.

Dezimal → binär mit derselben Tabelle, von links. Frage an jeder Stelle: Passt der Stellenwert in den Rest? Ja: Bit 1, abziehen. Nein: Bit 0, der Rest bleibt. Beispiel 45:

| Stellenwert | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
|---|---|---|---|---|---|---|---|---|
| passt in den Rest? | nein | nein | ja | nein | ja | ja | nein | ja |
| Bit | 0 | 0 | 1 | 0 | 1 | 1 | 0 | 1 |
| Rest danach | 45 | 45 | 13 | 13 | 5 | 1 | 1 | 0 |

Ergebnis `0010 1101`. Probe: rückwärts 32 + 8 + 4 + 1 = 45. Ist der Rest 0, sind alle übrigen Bits 0.

Übung „Stellenwerttabelle: 200“ (Art `trace`, `sprache: "tabelle"`, 8 Schritte, `ausgabe: false`, `typhinweis: false`, zählt nicht im Fortschritt). Text: „Rechne 200 ins Zweiersystem um. Zu Beginn ist der Rest 200. Trag in jeder Zeile das Bit (1 oder 0) und den Rest danach ein, ohne Anführungszeichen. Erst auf Papier, dann hier prüfen.“ Zeilen der Tabelle: „Stellenwert 128“ bis „Stellenwert 1“, Spalten „Bit“, „Rest“. Lösung:

| Stellenwert | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
|---|---|---|---|---|---|---|---|---|
| Bit | 1 | 1 | 0 | 0 | 1 | 0 | 0 | 0 |
| Rest | 72 | 8 | 8 | 8 | 0 | 0 | 0 | 0 |

Ergebnis `1100 1000`. `frage` je Schritt: „Stellenwert 128: Passt er in den Rest? Trag das Bit und den Rest danach ein, ohne Anführungszeichen.“ (mit dem jeweiligen Stellenwert). `hint`: „Passt der Stellenwert in den Rest, ist das Bit 1 und du ziehst ihn ab. Sonst ist das Bit 0 und der Rest bleibt gleich.“

- Wie viele Werte? 1 Bit: 2 Werte (0, 1). 2 Bit: 4 (00 bis 11). Jedes Bit verdoppelt, wie die Zeilen der Wahrheitstabelle: 3 Bit 8, 4 Bit 16, 8 Bit 2⁸ = **256** Werte, von 0 bis **255**. Die Zeilen einer Tabelle mit vier Variablen sind die Zahlen 0 bis 15, Zeile 1011 ist die Zahl 11.

Vorhersage „Größte Zahl mit 4 Bit“: Welche Zahl ist die größte, die du mit 4 Bit schreiben kannst?

- 4
- 8
- [x] 15
- 16

Auflösung: 1111 = 8 + 4 + 2 + 1 = 15. Es gibt 16 Werte, weil die 0 mitzählt: 0 bis 15. Genauso hat ein Byte 256 Werte, der größte ist 255.

### Abschnitt 2 · Genau so oft: for und range (P3, Teil 3 · 40–70)

Kernaussage: Steht vorher fest, wie oft etwas laufen soll, nimmst du eine Zählschleife. `for i in range(start, stopp)` zählt `i` von `start` bis `stopp − 1`, der Stoppwert gehört nicht dazu.

- Rückgriff Termin 04: Fünf Runden auf dem Sportplatz, mit `while` und eigenem Zähler. Drei Teile werden an der Tafel markiert: der Startwert (`i = 1`), die Bedingung (`i <= 5`), das Weiterzählen (`i = i + 1`). Vergisst man das Weiterzählen, läuft die Schleife ewig.

```python
i = 1
while i <= 5:
    print(f"Runde {i}")
    i = i + 1
print("Geschafft")
```

- Dieselbe Schleife mit `for`. `for` packt die drei Teile in eine Zeile und zählt selbst weiter:

```python
for i in range(1, 6):
    print(f"Runde {i}")
print("Geschafft")
```

Beide geben aus: `Runde 1`, `Runde 2`, `Runde 3`, `Runde 4`, `Runde 5`, `Geschafft`. „Schritt für Schritt“ am zweiten Codeblock zeigt, wie `i` jedes Mal neu belegt wird.

- Beide Pläne nebeneinander (`<Plan>` zweimal, in einer Zeile, `v05.css`):

```text
i = 1
Schleife: i <= 5?
  Ausgabe: "Runde", i
  i = i + 1
Ausgabe: "Geschafft"
```

```text
Schleife: i von 1 bis 5?
  Ausgabe: "Runde", i
Ausgabe: "Geschafft"
```

  Die Raute „i von 1 bis 5?“ heißt: Gibt es noch ein i bis 5? Dann ja, durch den Rumpf und zurück. Startwert und Weiterzählen stecken in der Raute.
- `range` lesen: `range(1, 6)` ergibt 1, 2, 3, 4, 5. Der Stoppwert 6 gehört nicht dazu. Durchläufe: 6 − 1 = 5. Für „1 bis n“ schreibst du deshalb `range(1, n + 1)`. Kurzform zum Lesen: `range(5)` beginnt bei 0 und ergibt 0, 1, 2, 3, 4. Ist der Start nicht kleiner als der Stopp (`range(5, 5)`, `range(1, 1)`), gibt es keine Zahl, der Rumpf läuft nie.
- Achtung: Im Rumpf einer `for`-Schleife steht kein `i = i + 1`. Das Weiterzählen erledigt `for`. (Nachgerechnet: Mit `i = i + 1` als letzter Rumpfzeile gibt `for i in range(1, 6): print(i)` trotzdem 1 bis 5 aus, die Zeile ist wirkungslos.)
- Faustregel: Steht vorher fest, wie oft, nimm `for`. Sonst nimm `while`. Zwei Paare aus Termin 04 und heute: Sparziel (wie viele Wochen, weiß man vorher nicht: `while`) gegen Sparplan über 12 Monate (`for`). Einkauf, bis 0 kommt (`while`) gegen vier Übungsblätter (`for`).

Vorhersage „Wo fängt range an?“:

```python
for i in range(4):
    print(i)
```

- 1, 2, 3, 4
- [x] 0, 1, 2, 3
- 0, 1, 2, 3, 4
- 1, 2, 3

Auflösung: Mit einer Zahl beginnt `range` bei 0. Die 4 ist der Stoppwert und gehört nicht dazu. Es sind trotzdem 4 Durchläufe.

### Abschnitt 3 · Aufsummieren und Mittelwert (P3, Teil 4 · 80–110)

Kernaussage: Jede Zeile eines Schleifenprogramms hat ihren Platz. Vor der Schleife steht, was einmal am Anfang gilt (der Startwert). Im Rumpf steht, was mit jedem Wert passiert. Nach der Schleife steht, was einmal mit dem Ergebnis passiert.

- Rückgriff Termin 04, Einkauf bis 0: `summe = summe + preis` kennst du. Jetzt steht vorher fest, wie viele Werte kommen, also `for`.
- Beispiel: die Punkte von vier Übungsblättern zusammenzählen und den Durchschnitt bilden.

```text
summe = 0
Schleife: i von 1 bis 4?
  Eingabe: punkte
  summe = summe + punkte
mittel = summe / 4
Ausgabe: summe, mittel
```

```python data-stdin="8\n10\n4\n8"
summe = 0
for i in range(1, 5):
    punkte = int(input(f"Punkte Blatt {i}: "))
    summe = summe + punkte
mittel = summe / 4
print(f"Summe: {summe}, Durchschnitt: {mittel:.1f}")
```

Eingaben 8, 10, 4, 8: `Summe: 30, Durchschnitt: 7.5`. Die Eingabeaufforderung zeigt `Punkte Blatt 1:` bis `Punkte Blatt 4:`, dafür ist `i` da.

- Die drei Stellen, an der Tafel farbig: `summe = 0` vor der Schleife, Einlesen und Addieren im Rumpf, `mittel` und `print` nach der Schleife (nicht eingerückt).
- Den Mittelwert (Begriffs-Hinweis siehe Abschnitt 1) bildest du einmal, nach der Schleife: Summe geteilt durch die Zahl der Werte. `/` ergibt eine Kommazahl, deshalb `:.1f` aus Termin 02.
- Drei typische Fehler, jeder an einer falschen Stelle (alle drei im Baustein „Summe Schritt für Schritt“): Der Startwert fehlt (`NameError: name 'summe' is not defined`, schon beim ersten Durchlauf). Der Startwert steht im Rumpf (die Summe beginnt jedes Mal von vorn, am Ende steht nur der letzte Wert: `Summe: 8, Durchschnitt: 2.0`). Die Ausgabe steht im Rumpf (vier Zeilen statt einer: Summe 8, 18, 22, 30, Durchschnitt 2.0, 4.5, 5.5, 7.5).

Vorhersage „Startwert im Rumpf“: Jemand hat `summe = 0` als erste Zeile in den Rumpf gerückt. Die Eingaben sind 8, 10, 4, 8. Was steht hinter „Summe:“?

- 30
- [x] 8
- 0
- Eine Fehlermeldung

Auflösung: In jedem Durchlauf wird `summe` erst auf 0 gesetzt, dann kommt der eine Wert dazu. Nach dem letzten Durchlauf steht dort nur der letzte Wert, 8. Der Startwert gehört vor die Schleife.

(Codeblock dazu mit `data-run="nach-antwort"` wie in Termin 04, Programm wie oben mit `summe = 0` als erster Rumpfzeile, `data-stdin="8\n10\n4\n8"`.)

### Abschnitt 4 · Auswählen im Rumpf: if ohne else (P3, Teil 5 · 110–135)

Kernaussage: Ein `if` im Rumpf prüft jeden Wert einzeln. Ohne `else` passiert bei „nein“ nichts, und die Schleife geht weiter. So zählst du, wie viele Werte eine Grenze erreichen.

- Dasselbe Beispiel: Wie viele Blätter haben mindestens 8 Punkte? Ein zweiter Zähler `anzahl` startet bei 0 und wächst nur, wenn die Bedingung stimmt.

```text
anzahl = 0
Schleife: i von 1 bis 4?
  Eingabe: punkte
  Entscheidung: punkte >= 8?
    ja:
      anzahl = anzahl + 1
Ausgabe: anzahl
```

- Im Plan hat die Raute nur einen ja-Zweig. Der nein-Weg läuft ohne Symbol am Rechteck vorbei und zurück zur Raute der Schleife. In Python ist das ein `if` ohne `else`.
- Einrückung in zwei Stufen: `if` steht im Rumpf (4 Leerzeichen), `anzahl = anzahl + 1` steht im `if` (8 Leerzeichen).

```python data-stdin="8\n10\n4\n8"
anzahl = 0
for i in range(1, 5):
    punkte = int(input(f"Punkte Blatt {i}: "))
    if punkte >= 8:
        anzahl = anzahl + 1
print(f"Blätter mit mindestens 8 Punkten: {anzahl}")
```

Eingaben 8, 10, 4, 8: `Blätter mit mindestens 8 Punkten: 3`. (Der Ausgabetext ist so gebaut, dass er auch bei 1 richtig klingt.)

- Grenzfall: „mindestens 8“ ist `>=`. Die beiden Achten zählen mit.

Vorhersage „Ein Zeichen anders“: Im Programm steht `punkte > 8` statt `>=`. Die Eingaben sind 8, 10, 4, 8. Welche Zahl erscheint?

- 0
- [x] 1
- 2
- 3

Auflösung: `8 > 8` ist falsch, beide Achten fallen heraus. Nur die 10 zählt. Mit `>=` sind es 3.

## D. Interaktive Bausteine (3)

1. **`byte` – „Acht Schalter, ein Byte“** (Abschnitt 1). Einstellen: acht Kippschalter nebeneinander, darüber die Stellenwerte 128 bis 1. Zweite Betriebsart „Zahl eingeben“: ein Zahlfeld (0 bis 255) und der Knopf „Nächste Stelle“, der die Stellenwerttabelle von links abarbeitet und die Schalter dabei umlegt. Sehen: die Dezimalzahl groß, die Rechnung aus den Einsen („32 + 8 + 4 + 1 = 45“), das Byte in Vierergruppen; in der zweiten Betriebsart je Schritt der Satz „Passt 32 in den Rest 45? Ja: Bit 1, Rest 13.“ Bei 256 oder mehr: „Ein Byte reicht von 0 bis 255.“ Vermutung: Alle acht Schalter an, welche Zahl? (255.) Beobachtung danach: Nur der linke Schalter an ergibt 128, eins mehr als alle sieben anderen zusammen (127).
2. **`range` – „range von Hand“** (Abschnitt 2). Einstellen: Start (0 bis 5) und Stopp (0 bis 10) mit Plus- und Minus-Knöpfen. Sehen: die Zeile `for i in range(3, 8):`, darunter die Zahlen als Kästchen (3 4 5 6 7) und den Stoppwert 8 durchgestrichen mit „gehört nicht dazu“; „Durchläufe: 8 − 3 = 5“; die gleichwertige `while`-Schleife (`i = 3`, `while i < 8:`, `i = i + 1`) und die Beschriftung der Raute „i von 3 bis 7?“. Knopf „Ein Durchlauf“ hebt das aktuelle `i` hervor. Bei Start 0 zusätzlich: „kurz: range(8)“. Ist der Start nicht kleiner als der Stopp: „Keine Zahl. Der Rumpf läuft nie.“ Vermutung: Wie viele Durchläufe hat `range(3, 8)`? (5.)
3. **`summe` – „Summe Schritt für Schritt“** (Abschnitt 3, wieder in Abschnitt 4). Einstellen: vier Punktwerte (vorbelegt 8, 10, 4, 8, je 0 bis 10), Auswahl „richtig“, „Startwert fehlt“, „Startwert im Rumpf“, „Ausgabe im Rumpf“; Schalter „mitzählen, wie viele mindestens 8 haben“ mit dem Vergleich `>=` oder `>` (für Abschnitt 4). Sehen: das Programm der gewählten Fassung mit der aktiven Zeile markiert, eine Tabelle `i`, `punkte`, `summe`, `anzahl`, die bisherige Ausgabe; Knöpfe „Ein Schritt“ und „Bis zum Ende“. Bei „Startwert fehlt“ endet der Lauf mit `NameError: name 'summe' is not defined`, ohne dass Python läuft. Vermutung (Abschnitt 3): Mit „Startwert im Rumpf“, was steht am Ende in `summe`? (8, nur der letzte Wert.) Vermutung (Abschnitt 4): Mit `>` statt `>=`, wie viele? (1.)

Abschnitt 4 nutzt den dritten Baustein und „Schritt für Schritt“ am Codeblock; einen vierten Baustein gibt es nicht.

## E. Selbstcheck (6 Fragen, 20 Punkte)

1. **Binär in dezimal**, Zahl, 3 Punkte, Antwort 101. Welche Dezimalzahl ist `0110 0101`? Erklärung: Einsen unter 64, 32, 4 und 1: 64 + 32 + 4 + 1 = 101.
2. **Dezimal in binär**, Auswahl, 3 Punkte. Welches Byte ist 77? [x] `0100 1101` · `0100 1011` · `1011 0010` · `0111 0111`. Erklärung: 64 passt (Rest 13), 32 und 16 nicht, 8 passt (Rest 5), 4 passt (Rest 1), 2 nicht, 1 passt. `0100 1011` ist 75, `1011 0010` ist 178 (die Bits in umgekehrter Reihenfolge), `0111 0111` ist 119.
3. **Wie viele Werte?**, Zahl, 3 Punkte, Antwort 1024. Ein Sensor liefert seinen Messwert mit 10 Bit. Wie viele verschiedene Werte kann er liefern? Erklärung: Jedes Bit verdoppelt: 2¹⁰ = 1024, von 0 bis 1023.
4. **Durchläufe zählen**, Zahl, 3 Punkte, Antwort 7. Wie oft läuft der Rumpf von `for i in range(2, 9):`? Erklärung: `i` ist 2, 3, 4, 5, 6, 7, 8. Der Stoppwert 9 gehört nicht dazu: 9 − 2 = 7.
5. **Ausgabe bestimmen**, Ausgabe, 4 Punkte, Antwort `9`.
   ```python
   summe = 0
   for i in range(1, 6):
       if i >= 4:
           summe = summe + i
   print(summe)
   ```
   Erklärung: `i` läuft von 1 bis 5. Nur bei 4 und 5 stimmt `i >= 4`: 4 + 5 = 9. `print` steht nach der Schleife und läuft einmal.
6. **for oder while?**, Auswahl (mehrere richtig), 4 Punkte. Für welche Aufgaben passt eine Zählschleife mit `for`? [x] Die Höchsttemperaturen einer Woche einlesen. · [x] Erst eine Zahl n einlesen, dann n Messwerte. · Preise einlesen, bis 0 kommt. · Einen Code abfragen, bis er stimmt. Erklärung: Bei den ersten beiden steht vor der Schleife fest, wie oft (7 und n). Bei den anderen entscheidet erst die Eingabe, wann Schluss ist: `while`.

## F. Labor Teil A (Stationen, auf der Seite 49 Minuten; im Termin laufen 3 und 5 nicht einzeln)

**1 · Werkzeugkasten (3 Min).** Zwei Karten, Video „Python-Werkzeugkasten“. Alles aus Termin 02 bis 04 gilt weiter.
- Karte 1 „for i in range: genau so oft“
  ```python
  for i in range(1, 4):
      print(i)
  print("fertig")
  ```
  Ausgabe `1`, `2`, `3`, `fertig`. `range(1, 4)` ergibt 1, 2, 3, der Stoppwert gehört nicht dazu. Für 1 bis n: `range(1, n + 1)`. `range(4)` beginnt bei 0: 0, 1, 2, 3. Kein `i = i + 1` im Rumpf, das macht `for`.
- Karte 2 „if ohne else: nur wenn“
  ```python
  punkte = 9
  if punkte >= 8:
      print("gut")
  print("weiter")
  ```
  Ausgabe `gut`, `weiter`. Mit `punkte = 5` nur `weiter`. Ohne `else` passiert bei falsch nichts, es geht unter dem `if` weiter.

**2 · Vorgerechnetes Beispiel: Pendelzeit (5 Min).** Aufgabe: Eingelesen wird, an wie vielen Tagen du die Zeit zur Hochschule gemessen hast (mindestens 1), dann die Minuten jedes Tages (ganze Zahlen). Ausgegeben wird der Durchschnitt. Video „Vorgerechnet“. Art `run`, Eingaben `3`, `25`, `31`, `22`.

```text
Eingabe: n
summe = 0
Schleife: i von 1 bis n?
  Eingabe: minuten
  summe = summe + minuten
mittel = summe / n
Ausgabe: mittel
```

```python
n = int(input("Wie viele Tage? "))
summe = 0
for i in range(1, n + 1):
    minuten = int(input(f"Minuten an Tag {i}: "))
    summe = summe + minuten
mittel = summe / n
print(f"Im Schnitt {mittel:.1f} Minuten")
```

Eingaben 3, 25, 31, 22: `Im Schnitt 26.0 Minuten`. Eingaben 1, 17: `Im Schnitt 17.0 Minuten` (Grenzfall n = 1).
Schritte: (1) Der Ablauf in Worten: n einlesen, n Zeiten einlesen und addieren, durch n teilen. (2) Wie oft? Das steht nach der ersten Eingabe fest: n-mal, also `for`. (3) Wo steht was? Startwert vor der Schleife, Einlesen und Addieren im Rumpf, Teilen und Ausgeben danach. (4) Plan: Raute „i von 1 bis n?“, Rumpf, Pfeil zurück. (5) Code: `range(1, n + 1)`, weil der Stoppwert nicht dazugehört; `i` steht in der Eingabeaufforderung. (6) Probe: 3, 25, 31, 22 ergibt 78 / 3 = 26.0. (7) Selbsterklärung: Was passiert bei 0 Tagen? Probier es aus. Python meldet `ZeroDivisionError: division by zero`: Die Schleife läuft nie, `summe` bleibt 0, und durch 0 teilen geht nicht. Deshalb steht in der Aufgabe „mindestens 1“.

**3 · Ablauf verfolgen: Zählschleife (5 Min; im Termin nicht einzeln).** Art `trace`, `typhinweis: false`. Aufgabenstellung: In der Zeile mit `for` trägst du den Wert von `i` ein und in die Spalte Weg ja, wenn der Rumpf noch einmal läuft, sonst nein, ohne Anführungszeichen.

```python
summe = 0
for i in range(1, 4):
    summe = summe + i
print(summe)
```

Spalten `i`, `summe`, `Weg`. 9 Schritte: Zeile 1 `summe = 0` · Zeile 2 `i = 1`, ja · Zeile 3 `summe = 1` · Zeile 2 `i = 2`, ja · Zeile 3 `summe = 3` · Zeile 2 `i = 3`, ja · Zeile 3 `summe = 6` · Zeile 2 nur Weg: nein · Zeile 4 Ausgabe `6`. Hinweis beim letzten Schritt in Zeile 2: „range(1, 4) liefert 1, 2 und 3. Die 3 war schon dran, also ist Schluss: nein. i bleibt 3.“ (Zeilenfolge 1, 2, 3, 2, 3, 2, 3, 2, 4 mit `sys.settrace` nachgeprüft.)

**4 · Plan zeichnen: Einmaleins (★★, 10 Min).** Art `pap-zeichnen`, erlaubt `in,out,op,for`. Die Eingabe steht schon im Editor, du ergänzt die Zählschleife und die Ausgabe. Text: Eingelesen wird eine ganze Zahl. Ausgegeben wird ihre Einmaleins-Reihe von 1 mal bis 10 mal, jede Zahl in einer eigenen Zeile. Bei 3 erscheinen 3, 6, 9, …, 30.
Lösung: Eingabe zahl (int) · Zählschleife `i in range(1, 11)` (Raute „i von 1 bis 10?“) · im Rumpf: Ausgabe `zahl * i`.
Tests (geprüft werden die Zeilen nach der Eingabeaufforderung): 3 ergibt 3, 6, 9, 12, 15, 18, 21, 24, 27, 30 · 7 ergibt 7, 14, …, 70 · 1 ergibt 1 bis 10 · 0 ergibt zehnmal 0 (Grenzfall). Genau 10 Zeilen, `range(1, 10)` fällt auf (nur 9 Zeilen).
Tipps: (1) Wie oft? Zehnmal, und das steht vorher fest. Welches Symbol zählt selbst? (2) Im Editor heißt es „Zählschleife“. Du trägst `i in range(1, 11)` ein: von 1 bis 10, die 11 gehört nicht dazu. (3) In den Rumpf kommt nur eine Ausgabe: `zahl * i`.

**5 · Zeilen ordnen: Treppe (4 Min; im Termin nicht einzeln).** Art `parsons`. Plan: Eingabe stufen · Schleife „i von 1 bis stufen?“ · ja: Ausgabe „Stufe“, i · nein: Ausgabe „Oben“.
Lösung:
```python
stufen = int(input("Wie viele Stufen? "))
for i in range(1, stufen + 1):
    print(f"Stufe {i}")
print("Oben")
```
Zeilen, die nicht dazugehören: `for i in range(1, stufen):` (eine Stufe zu wenig: bei 4 nur Stufe 1 bis 3) und `    i = i + 1` (zählt `for` schon selbst). `ok`-Text: „for zählt i selbst von 1 bis stufen. Die Ausgabe Oben steht nicht eingerückt und läuft einmal danach.“ Probe: 4 ergibt Stufe 1 bis 4, dann Oben; 0 ergibt nur Oben.

**6 · Lücken füllen: Wochenschritte (8 Min).** Art `gap`. Eingelesen werden die Schritte an 7 Tagen. Ausgegeben werden die Summe und der Durchschnitt am Tag. Der Plan steht vollständig darüber: `summe = 0` · Schleife „i von 1 bis 7?“ · ja: Eingabe schritte, `summe = summe + schritte` · nein: `mittel = summe / 7`, Ausgabe summe, mittel.

```text
summe = @@0@@
@@for@@ i in range(1, @@8@@):
    schritte = int(input(f"Schritte an Tag {i}: "))
    summe = @@summe@@ + schritte
mittel = summe / 7
print(f"Woche: {summe} Schritte, im Schnitt {mittel:.1f} am Tag")
```

Tests (geprüft wird die letzte Zeile): 5000, 7000, 9000, 6000, 8000, 10000, 4000 ergibt `Woche: 49000 Schritte, im Schnitt 7000.0 am Tag` · siebenmal 0 ergibt `Woche: 0 Schritte, im Schnitt 0.0 am Tag` (Grenzfall) · 6500, 7200, 8100, 5400, 9900, 12000, 3100 ergibt `Woche: 52200 Schritte, im Schnitt 7457.1 am Tag`. Wer `7` statt `8` einträgt, liest nur 6 Tage (erster Test: 45000 statt 49000).
Tipps: (1) Lücke 1: Womit fängt eine Summe an, bevor der erste Wert dazukommt? (2) Lücke 2 und 3: Karte 1. Von 1 bis 7, und der Stoppwert gehört nicht dazu. (3) Lücke 4: Zur bisherigen Summe kommen die Schritte des Tages dazu.

**7 · Erste eigene Aufgabe: Sechsen zählen (★, 8 Min).** Art `code`, Klausurform „Plan in Code übertragen“ mit Ausführen. Text: Eingelesen wird, wie oft gewürfelt wird, dann jeder Wurf (ganze Zahl). Ausgegeben wird, wie viele Sechsen dabei waren, als `Sechsen: 2`.
Plan:
```text
Eingabe: n
sechsen = 0
Schleife: i von 1 bis n?
  Eingabe: wurf
  Entscheidung: wurf == 6?
    ja:
      sechsen = sechsen + 1
Ausgabe: sechsen
```
Lösung:
```python
n = int(input("Wie viele Würfe? "))
sechsen = 0
for i in range(1, n + 1):
    wurf = int(input(f"Wurf {i}: "))
    if wurf == 6:
        sechsen = sechsen + 1
print(f"Sechsen: {sechsen}")
```
Tests (letzte Zeile): 5 und 6, 1, 6, 3, 4 ergibt `Sechsen: 2` · 1 und 6 ergibt `Sechsen: 1` (Grenzfall, ein Wurf) · 3 und 1, 2, 3 ergibt `Sechsen: 0` · 0 ergibt `Sechsen: 0` (Grenzfall, die Schleife läuft nie) · 4 und 6, 6, 6, 6 ergibt `Sechsen: 4` (der letzte Wurf zählt mit; mit `range(1, n)` käme 3 heraus).
Tipps: (1) Sechs Symbole, sieben Zeilen. (2) Die Raute in der Schleife ist ein `if` ohne `else`, Karte 2. Achte auf die zweite Einrückung. (3) `print` steht nach der Schleife, ganz links.
Für Schnelle: Zähl zusätzlich die Einsen und gib beide Zahlen aus.

**8 · Fehler finden: Sommertage (6 Min).** `Fehlersuche`, Fehler in Zeile 1 und 3. Text: Eingelesen werden die Höchsttemperaturen einer Woche (ganze Zahlen). Gezählt wird, an wie vielen Tagen es mindestens 25 Grad warm war, das sind Sommertage. Bei 22, 25, 28, 19, 30, 24, 26 wird 4 erwartet. In zwei Zeilen steckt ein Fehler.

```text
for i in range(1 8):
    temp = int(input(f"Höchstwert Tag {i}: "))
    anzahl = 0
    if temp >= 25:
        anzahl = anzahl + 1
print(f"Sommertage: {anzahl}")
```

Fehler 1 (Zeile 1), meldet Python: `SyntaxError: invalid syntax. Perhaps you forgot a comma?`, zwischen 1 und 8 fehlt das Komma. Fehler 2 (Zeile 3), meldet Python nicht: Der Startwert steht im Rumpf, `anzahl` beginnt jeden Tag bei 0. Mit den Beispielwerten kommt 1 heraus (nur der letzte Tag, 26, zählt). Richtig, mit dem Startwert vor der Schleife (`data-stdin="22\n25\n28\n19\n30\n24\n26"`):

```python
anzahl = 0
for i in range(1, 8):
    temp = int(input(f"Höchstwert Tag {i}: "))
    if temp >= 25:
        anzahl = anzahl + 1
print(f"Sommertage: {anzahl}")
```

Probe: `Sommertage: 4`. Die 25 zählt mit (Grenzfall), mit `>` wären es 3.

## G. Labor Teil B (Training, 4 Aufgaben, 32 Minuten) und Knobelaufgaben

Zu Hause zusammen **48 Minuten**: Stationen 3 und 5 (9), Selbstcheck (7), Training (32).

1. **Umrechnen** (★, 8 Min, `trace` als Tabelle, `sprache: "tabelle"`, 8 Zeilen, `ausgabe: false`, `typhinweis: false`, Leerzeichen-Schalter aus Technischer Voraussetzung 3). Erst auf Papier, dann hier prüfen. Text: „Rechne um. Binärzahlen schreibst du mit 8 Stellen, mit oder ohne Leerzeichen in der Mitte, ohne Anführungszeichen.“ Spalten „dezimal“, „binär“; in jeder Zeile ist eines der beiden Felder gefragt.

   | Zeile | gegeben | Lösung |
   |---|---|---|
   | 1 | 0001 1010 | 26 |
   | 2 | 0101 0101 | 85 |
   | 3 | 1000 0001 | 129 |
   | 4 | 1111 1110 | 254 |
   | 5 | 37 | 0010 0101 |
   | 6 | 100 | 0110 0100 |
   | 7 | 128 | 1000 0000 |
   | 8 | 255 | 1111 1111 |

   Hinweis bei den Zeilen 5 bis 8: „Fang links bei 128 an. Passt der Stellenwert in den Rest, ist das Bit 1. Vorne aufgefüllte Nullen gehören dazu: 8 Stellen.“ Wird das Warm-up von Termin 06 (auf Papier), dort als Brücke zu den Vierergruppen des Hexadezimalsystems.
2. **Plan in Code übertragen: Sparplan** (★★, 8 Min, `klausur`). Text: Eingelesen werden der Betrag, den du jeden Monat zurücklegst, und die Zahl der Monate (ganze Zahlen). Ausgegeben wird nach jedem Monat der Stand, zum Beispiel `Monat 2: 100 Euro`.
   Plan:
   ```text
   Eingabe: betrag (ganze Zahl)
   Eingabe: monate (ganze Zahl)
   geld = 0
   Schleife: i von 1 bis monate?
     geld = geld + betrag
     Ausgabe: "Monat", i, geld, "Euro"
   ```
   ```python
   betrag = int(input("Betrag pro Monat in Euro: "))
   monate = int(input("Wie viele Monate? "))
   geld = 0
   for i in range(1, monate + 1):
       geld = geld + betrag
       print(f"Monat {i}: {geld} Euro")
   ```
   Tests (die ersten zwei Zeilen sind die Eingabeaufforderungen, danach je Zeile die Zahlen Monat und Stand): 50, 3 ergibt `Monat 1: 50 Euro`, `Monat 2: 100 Euro`, `Monat 3: 150 Euro` · 20, 1 ergibt `Monat 1: 20 Euro` (Grenzfall) · 50, 0 ergibt keine Zeile (Grenzfall, der Rumpf läuft nie) · 25, 12 ergibt 12 Zeilen, die letzte `Monat 12: 300 Euro`. Schema (je 1 Punkt): beide Eingaben mit `int(input(…))` und `geld = 0` vor der Schleife · `for i in range(1, monate + 1):` mit Doppelpunkt · `geld = geld + betrag` eingerückt im Rumpf · `print` ebenfalls im Rumpf eingerückt, weil jeder Monat eine Zeile bekommt.
   Hier steht die Ausgabe absichtlich im Rumpf. Das ist der Gegenpol zu Abschnitt 3: Gefragt ist jeder Zwischenstand, nicht nur das Ergebnis.
3. **Fehler finden und beheben: Laufzeiten** (★★, 6 Min, `code`). Zwei Fehler: einer, den Python meldet, einer, den du nur mit einer Probe findest. Probier 3 Läufe.
   Vorlage:
   ```python
   # Liest n Laufzeiten in Sekunden ein und gibt den Durchschnitt aus.
   n = int(input("Wie viele Läufe? "))
   for i in range(1, n):
       zeit = int(input(f"Zeit Lauf {i}: "))
       summe = summe + zeit
   mittel = summe / n
   print(f"Durchschnitt: {mittel:.1f} s")
   ```
   Lösung: Python meldet `NameError: name 'summe' is not defined` in Zeile 5 (bei n = 1 erst in Zeile 6, weil der Rumpf nie läuft): Der Startwert `summe = 0` fehlt vor der Schleife. Danach zeigt die Probe mit 3 Läufen nur zwei Eingabeaufforderungen (Lauf 1 und 2): `range(1, n)` endet eine Zahl zu früh. Mit 3, 62, 58, 60 käme dann `Durchschnitt: 40.0 s` heraus statt 60.0.
   ```python
   # Liest n Laufzeiten in Sekunden ein und gibt den Durchschnitt aus.
   n = int(input("Wie viele Läufe? "))
   summe = 0
   for i in range(1, n + 1):
       zeit = int(input(f"Zeit Lauf {i}: "))
       summe = summe + zeit
   mittel = summe / n
   print(f"Durchschnitt: {mittel:.1f} s")
   ```
   Tests (letzte Zeile, Zahl mit Toleranz 0,05; n ist mindestens 1): 3 und 62, 58, 60 ergibt `Durchschnitt: 60.0 s` · 1 und 75 ergibt `Durchschnitt: 75.0 s` (Grenzfall) · 4 und 50, 55, 61, 60 ergibt `Durchschnitt: 56.5 s` · 2 und 40, 45 ergibt `Durchschnitt: 42.5 s`.
   Tipps: (1) Führ das Programm aus und lies die Meldung von unten: Welcher Name ist unbekannt, und wo müsste er einen Wert bekommen? (2) Läuft es, probier 3 Läufe: Wie oft fragt das Programm nach einer Zeit? (3) Für 1 bis n gehört der Stoppwert nicht dazu. Karte 1.
4. **Bolzen einer Charge prüfen** (★★★, 10 Min, `code`, ohne Plan; erst auf Papier zeichnen). Text: Bolzen sollen 100 mm lang sein, erlaubt sind 98 bis 102 mm, die Grenzen sind gut. Eingelesen werden die Zahl der Bolzen und dann jede Länge in mm (ganze Zahlen). Ausgegeben wird, wie viele außerhalb liegen, als `Ausschuss: 2 von 5`.
   ```python
   n = int(input("Wie viele Bolzen? "))
   ausschuss = 0
   for i in range(1, n + 1):
       laenge = int(input(f"Länge Bolzen {i} in mm: "))
       if laenge < 98 or laenge > 102:
           ausschuss = ausschuss + 1
   print(f"Ausschuss: {ausschuss} von {n}")
   ```
   Akzeptiert wird auch `not (laenge >= 98 and laenge <= 102)`.
   Tests (letzte Zeile): 5 und 100, 97, 102, 103, 98 ergibt `Ausschuss: 2 von 5` (Grenzfälle 98 und 102 sind gut) · 3 und 100, 101, 99 ergibt `Ausschuss: 0 von 3` · 1 und 104 ergibt `Ausschuss: 1 von 1` · 0 ergibt `Ausschuss: 0 von 0` (Grenzfall, die Schleife läuft nie) · 4 und 90, 110, 50, 150 ergibt `Ausschuss: 4 von 4` · 2 und 98, 102 ergibt `Ausschuss: 0 von 2` (nur Grenzen). Fallen auf: `and` statt `or` (erster Test: 0 von 5), `<=` und `>=` an den Grenzen (erster Test: 4 von 5).
   Tipps: (1) Zeichne zuerst den Plan: Eingabe n, Zähler auf 0, Zählschleife, im Rumpf einlesen und prüfen, danach die Ausgabe. (2) Ausschuss heißt zu kurz ODER zu lang. 98 und 102 selbst sind gut. Die Bedingung kennst du von „Druck prüfen“ aus Termin 04. (3) Die Form kennst du von „Sechsen zählen“: Zähler vor der Schleife, `if` ohne `else` im Rumpf.

**Knobelaufgaben (freiwillig, zählen nicht im Fortschritt).** Nur Stoff bis Termin 05. Beide ausgearbeitet und nachgerechnet.

- **`kn-1` · „Bits einlesen“** (`k-1`, `code`, `data-mode="programm"`, `data-inputs="0|0|1|0|1|1|0|1"`).
  Text: Eingelesen werden die 8 Bits eines Bytes, jedes als 0 oder 1, das linke zuerst. Ausgegeben wird die Dezimalzahl, zum Beispiel `Dezimal: 45` für 0, 0, 1, 0, 1, 1, 0, 1. Es geht ohne die Stellenwerte 128, 64, 32 … im Programm. Findest du den Weg?
  Vorlage:
  ```python
  # Bits einlesen: acht Eingaben 0 oder 1, das linke Bit zuerst.
  # Gesucht ist die Dezimalzahl.
  ```
  Musterlösung:
  ```python
  zahl = 0
  for i in range(1, 9):
      bit = int(input(f"Bit {i}: "))
      zahl = zahl * 2 + bit
  print(f"Dezimal: {zahl}")
  ```
  Tests (letzte Zeile, letzte Zahl, Vergleich als Zahl): 0, 0, 1, 0, 1, 1, 0, 1 ergibt 45 · achtmal 1 ergibt 255 · achtmal 0 ergibt 0 (Grenzfall) · 1, 0, 0, 0, 0, 0, 0, 0 ergibt 128 · 0, 0, 0, 0, 0, 0, 0, 1 ergibt 1 · 1, 1, 0, 0, 1, 0, 0, 0 ergibt 200 · 1, 0, 1, 0, 0, 1, 1, 0 ergibt 166. Wer doch mit einem Stellenwert arbeitet (`stellenwert = 128`, im Rumpf `zahl = zahl + bit * stellenwert` und `stellenwert = stellenwert / 2`), bekommt `Dezimal: 45.0` und besteht die Tests ebenfalls, weil als Zahl verglichen wird (ohne `//` wird der halbierte Stellenwert eine Kommazahl).
  Tipps: (1) Rechne auf Papier mit den Bits 1, 0, 1, 1 und schreib nach jedem Bit die Zahl auf, die bisher dasteht: 1, dann 10, dann 101, dann 1011. Welche Dezimalzahlen sind das? (1, 2, 5, 11.) (2) Kommt rechts ein Bit dazu, rücken alle bisherigen Bits eine Stelle nach links, ihr Wert verdoppelt sich. Dazu kommt das neue Bit. (3) Vor der Schleife `zahl = 0`. Im Rumpf: Bit einlesen, dann aus der alten Zahl und dem Bit die neue machen.
- **`kn-2` · „Reiskörner auf dem Schachbrett“** (`k-2`, `code`, `data-mode="programm"`, `data-inputs="100"`).
  Text: Auf dem ersten Feld eines Schachbretts liegt 1 Reiskorn, auf jedem weiteren doppelt so viele wie auf dem davor. Eingelesen wird eine Grenze (ganze Zahl). Gesucht ist das erste Feld, auf dem mehr Körner liegen als die Grenze, wie viele dort liegen und wie viele auf allen Feldern bis dahin zusammen. Beispiel: Grenze 100 ergibt `Feld 8: 128 Körner, zusammen 255`.
  Vorlage:
  ```python
  # Reiskörner: Feld 1 hat 1 Korn, jedes weitere Feld doppelt so viele.
  grenze = int(input("Grenze: "))
  # Ab hier entscheidest du.
  ```
  Musterlösung:
  ```python
  grenze = int(input("Grenze: "))
  feld = 1
  koerner = 1
  summe = 1
  while koerner <= grenze:
      feld = feld + 1
      koerner = koerner * 2
      summe = summe + koerner
  print(f"Feld {feld}: {koerner} Körner, zusammen {summe}")
  ```
  Tests (letzte Zeile, die Zahlen Feld, Körner, zusammen): 100 ergibt 8, 128, 255 · 1000000 ergibt 21, 1048576, 2097151 (auf Feld 20 liegen 524288, noch nicht mehr als eine Million) · 63 ergibt 7, 64, 127 · 64 ergibt 8, 128, 255 (Grenzfall: 64 ist nicht mehr als 64) · 1 ergibt 2, 2, 3 · 0 ergibt 1, 1, 1 (Grenzfall, die Schleife läuft nie).
  Tipps: (1) Drei Werte ändern sich: das Feld, die Körner auf dem Feld und die Summe. Schreib die ersten vier Felder als Tabelle auf. (2) Wie viele Felder es werden, steht vorher nicht fest: Die Faustregel sagt `while`. Wiederholt wird, solange die Körner die Grenze noch nicht übersteigen. (3) Start: Feld 1, 1 Korn, Summe 1. Im Rumpf zuerst das nächste Feld, dann die Körner verdoppeln, dann zur Summe addieren.
  Für die Auflösung (nicht getestet): Die Summe ist immer eins weniger als das Doppelte des letzten Felds (255 = 2 · 128 − 1, wie das größte Byte). Auf dem ganzen Brett liegen 18446744073709551615 Körner, das ist 2⁶⁴ − 1.

## H. Videos (je etwa 2 bis 2,5 Minuten; hier nur der Inhalt, kein Sprechertext)

**Theorie (Lerneinheit, Abschnitt 1): „Die Stellenwerttabelle: binär und dezimal“.** Von den Zeilen 0000 bis 1111 der Wahrheitstabelle zum Zählen mit zwei Ziffern; acht Schalter mit 128 bis 1 darüber; 0010 1101 wird durch Addieren zu 45, und 45 wird von links durch „passt, abziehen“ wieder zu 0010 1101; zum Schluss: 8 Bit ergeben 256 Werte.

**Python-Werkzeugkasten (Labor, Station 1): „for, range, if ohne else“.** Karte 1 lässt `range(1, 4)` laufen und zeigt, dass der Stoppwert fehlt und `range(4)` bei 0 beginnt; Karte 2 zeigt `if` ohne `else` mit zwei Werten.

**Vorgerechnet (Labor, Station 2): „Pendelzeit“.** Plan mit Raute „i von 1 bis n?“ neben dem Code; die drei Stellen vor, im und nach der Schleife werden markiert; ein Lauf mit 3, 25, 31, 22 und am Ende der Versuch mit 0 Tagen samt `ZeroDivisionError`.

Abschnitte 2 bis 4 haben kein eigenes Theorie-Video. Sie leben von den Bausteinen und von „Schritt für Schritt“.

## I. Ablaufplan für den Dozenten

Jeder 30-Minuten-Block verplant höchstens 28 Minuten. Die Minuten eines Abschnitts enthalten das Zeigen der genannten Karte. Hier im Zuschnitt mit der Pause; in der App laufen die Minuten wie in Termin 04 ohne sie durch (0–10, 10–40, 40–70, 70–100, 100–125, Titel „Ablauf des Termins (125 Minuten)“), und die Pause wird nicht erwähnt.

| Minuten | Wo | Was |
|---|---|---|
| 0–10 | Papier, Beamer | **Warm-up.** Training-04-Tabelle (A ODER B) UND (C ODER D) auf Papier (5), Auflösung mit beiden Hilfsspalten, 9 Einsen (2). Brücke: Welche Zahl ist die Zeile 1111? (3) |
| 10–40 | Lerneinheit 1 | **Theorie: das Zweiersystem.** Brücke aus dem Warm-up: Die Zeilen zählen (2). Stellenwert 345, dann Zweiersystem, Bit und Byte (5). Binär → dezimal: 1011 und 0010 1101 an der Tafel, 1010 0110 per Zuruf (5). Baustein „Acht Schalter, ein Byte“ mit Vermutung (4). Dezimal → binär: Stellenwerttabelle für 45 an der Tafel (5). Alle rechnen 200 auf Papier, Prüfen in der Übung (5). 2ⁿ Werte, Vorhersage „Größte Zahl mit 4 Bit“ (2). Verplant: 28. |
| 40–70 | Lerneinheit 2, Labor 1 (Karte 1), 4 | **Programmieren 1: genau so oft.** Fünf Runden mit `while`, die drei Teile markieren (3). Dieselbe Schleife mit `for`, Karte 1, beide Pläne nebeneinander (5). `range` lesen, `range(1, n + 1)`, Vorhersage „Wo fängt range an?“ (4). Baustein „range von Hand“ mit Vermutung (4). Faustregel an zwei Paaren (2). Alle zeichnen „Einmaleins“ (10). Verplant: 28. |
| 70–80 | – | **Pause** (nur im Zuschnitt). |
| 80–110 | Lerneinheit 3, Labor 2, 6 | **Programmieren 2: aufsummieren.** Rückgriff Einkauf: jetzt steht die Zahl fest (1). Punkte von vier Blättern: Plan, Code, die drei Stellen, Mittelwert (6). Baustein „Summe Schritt für Schritt“ mit Vermutung (5). Vorhersage „Startwert im Rumpf“ (2). Pendelzeit am Beamer, Plan und Code, Probe, Versuch mit 0 Tagen (5). „Wochenschritte“ als Lückentext (8). Verplant: 27. Station 3 läuft nicht einzeln. |
| 110–135 | Lerneinheit 4, Labor 1 (Karte 2), 7, 8 | **Programmieren 3: auswählen im Rumpf.** Plan mit Raute im Rumpf, `if` ohne `else`, Karte 2 (4). `anzahl` im Code, Vorhersage „Ein Zeichen anders“ (3). Baustein „Summe Schritt für Schritt“ mit dem Schalter „mitzählen“ (2). Alle übertragen „Sechsen zählen“ (8). „Sommertage“ gemeinsam am Beamer (5). Auftrag für zu Hause, Pflicht, zusammen 48 Minuten: Stationen 3 und 5 (9), Selbstcheck (7), Training (32) (2). Termin 06 beginnt mit dem Umrechnen aus dem Training. Verplant: 24. |

Wenn die Zeit knapp wird: Im Block 10–40 entfällt zuerst das Prüfen in der Übung (Hausaufgabe), die 200 wird nur auf Papier gerechnet und an der Tafel aufgelöst. Im Block 40–70 wird „Einmaleins“ gemeinsam am Beamer gezeichnet statt einzeln. Im Block 80–110 wird die Pendelzeit nur gezeigt (ein Lauf), der Versuch mit 0 Tagen bleibt Selbsterklärung zu Hause. Im letzten Block entfällt zuerst „Sommertage“ (Hausaufgabe), dann der Baustein; „Sechsen zählen“ hat Vorrang, weil es die Klausurform „Plan in Code übertragen“ im Termin ist.

Die drei Klausurformen im Termin: Plan zeichnen (Station 4, Block 2), Plan in Code übertragen (Station 7, Block 4), Code lesen (Vorhersagen in jedem Block, Station 8). Zu Hause dazu: Ablauf verfolgen (Station 3), Plan in Code im Klausurmodus (Training 2), Fehler finden (Training 3).

---

# Bewusst weggelassen

**Zahlensysteme**
- Hexadezimalsystem, Vierergruppen als Hex-Ziffern, Präfixe `0b` und `0x`: Termin 06. Die Vierergruppen-Schreibweise wird hier schon eingeübt, damit Termin 06 daran anknüpft.
- `bin()`, `int("1011", 2)`, `format(…, "08b")`: nicht in Termin 05. In Termin 06 vielleicht als Werkzeug zum Nachprüfen.
- Divisionsrestverfahren: entschieden für die Stellenwerttabelle. Ohne `%` und `//` ginge es ohnehin nicht als Programm.
- Zweierkomplement, negative Binärzahlen, binäres Addieren mit Überträgen, Oktal und andere Basen: entschieden.
- Wertebereich und Überlauf (Zähler springt um): T5 in Termin 07. Hier bleibt „8 Bit ergeben 256 Werte“; der Baustein meldet bei 256 nur, dass ein Byte bis 255 reicht.
- Zahlen über 255 und mehr als 8 Stellen umrechnen: kein neuer Gedanke, nur längere Rechnung. Einzige Ausnahme sind der Sensor mit 10 Bit (nur 2ⁿ) und die Knobelaufgabe.
- Kilobyte, Megabyte, KiB gegen KB, Zeichencodes (ASCII): eher T6 Rechneraufbau; hier keine Zeit.
- „Rechts eine 0 anhängen verdoppelt“ als eigener Lehrsatz: steckt nur als Tipp in der Knobelaufgabe „Bits einlesen“, damit die Pflicht bei der Tabelle bleibt.

**Python**
- Schrittweite `range(a, b, s)` und damit der Countdown mit `for`: Termin 06 (Frage 1). Verschachtelte Schleifen: Termin 06. `break`, `continue`, `while True:`: bleiben draußen.
- `for` über Text oder Listen, `sum()`, `min()`, `max()`: Listen kommen in P7. Minimum und Maximum in einer Schleife (mit `if` im Rumpf) wären möglich, sind aber ein vierter Kerninhalt; Kandidat für Termin 06.
- `else` und `elif` im Rumpf: Neu ist nur `if` ohne `else`. `if … else` im Rumpf ginge mit bekanntem Stoff, bringt aber keine neue Idee.
- Den Mittelwert bei n = 0 abfangen: Ohne `else` bleibt nur „n ist mindestens 1“ im Aufgabentext. Die Meldung wird gezeigt, nicht verhindert.
- `+=`, `%`, `//`: wie in Termin 04 und vom Dozenten bestätigt.
- Zufallszahlen beim Würfeln: Die Würfe werden eingetippt, damit die Tests feste Eingaben haben.
- Kommazahlen als Eingabe in Schleifen (`float(input())` bei Messwerten): Mittelwerte entstehen aus ganzen Zahlen; Kommazahlen in Schleifen kommen mit Termin 07.
- `bauteil3d` (Turm, Lochreihe): Eine Lochreihe braucht Abstände, also Schrittweite oder `i * abstand`; passt zu Termin 06.

**Aufbau und Umfang**
- Eine zweite Vorhersage je Abschnitt und ein eigener Baustein für Abschnitt 4: Der dritte Baustein bekommt einen Schalter dafür.
- Theorie-Videos zu Abschnitt 2 bis 4: Die Bausteine und „Schritt für Schritt“ zeigen den Ablauf.
- Eine Station „Ausgabe vorhersagen“ im Labor: Die Vorhersagen der Lerneinheit und Selbstcheck 5 decken das ab.
- Ein Training zu „for oder while?“: steht als Selbstcheck 6.
- Gleichwertigkeit, De Morgan und Tabellen mit vier Variablen im Training: Termin 04 ist abgeschlossen, das Warm-up holt die Tabelle einmal zurück.

---

# Technische Voraussetzungen

Belegt heißt: im Code gelesen. Nicht ausprobiert ist ausdrücklich gesagt.

1. **Dateinamen `explorables-v05.js` und `v05.css` sind belegt (Pflicht, ca. 1–2 Stunden).** `site/assets/js/explorables-v05.js` ist der Baukasten der alten V05 (Kopfkommentar Z. 1–8: Symbol-Lexikon, PAP-Baukasten, Fehler im PAP); keine Seite unter `app/inhalte/` lädt ihn (gesucht in `app/inhalte`, `app/src`, `app/skripte`), nur `docs/PAP-EDITOR.md:11, 108` erwähnt ihn. `site/assets/css/v05.css` dagegen lädt jede neue Seite (v01 bis v04, Lerneinheit und Labor), weil dort die Plan-Regeln stehen (`.pap…`, Z. 7 bis etwa 54; `bausteine.mjs:194` „Die Seite braucht v05.css“). Die Klassen `.v05-…` (ab Z. 55) benutzt nur der alte Baukasten. Vorschlag: `explorables-v05.js` durch die neuen Bausteine ersetzen (altes Material darf weg), in `v05.css` den PAP-Teil unverändert lassen, die alten `.v05-…`-Regeln löschen und die neuen dahinter schreiben, `docs/PAP-EDITOR.md` nachziehen. Die sauberere Lösung (PAP-Regeln in eine eigene `pap.css`, alle Seiten umstellen) ist größer und nicht nötig.
2. **Zählschleife im Plan-Editor (Pflicht, ca. 0,5 Tag).** Belegt: Der Editor kennt das Symbol „Zählschleife“ (`pap-editor.js:44`, Feld „Zählschleife (Python: for …)“, Vorgabe `i in range(1, 6)`), der Baum erzeugt daraus `for i in range(1, 6):` (`pap-engine.js:350–352`) und zeichnet es als Raute mit Rücksprung (`:394`). Die Raute zeigt aber den Python-Text: `nice("i in range(1, 11)") + "?"` ergibt „i in range(1, 11)?“, nicht „i von 1 bis 10?“ (`nice()` bei `:374` ersetzt nur Vergleiche und `and`, `or`, `not`). Nötig: in `toPap` für `k === 'for'` eine Anzeige `i in range(a, b)` → „i von a bis b − 1“ (Zahl ausgerechnet), `i in range(a, n + 1)` → „i von a bis n“, `i in range(b)` → „i von 0 bis b − 1“, sonst der Text wie bisher; Test in `app/skripte/tests/pap-engine.test.mjs`. Im `<Plan>` ist nichts zu tun: `Schleife: i von 1 bis n?` geht durch `planSpec` als Text (`bausteine.mjs:80–83`, `nice` ändert „von“ und „bis“ nicht). Es gibt noch keine Aufgabe mit `for` im Editor: Station 4 einmal mit „In die Schleife einfügen“ durchklicken, `data-erlaubt="in,out,op,for"` prüfen (nicht ausprobiert).
3. **trace: Binärzahlen mit Leerzeichen (ca. 1 Stunde).** Belegt: `normVal` (`aufgaben.js:897`) fasst Leerraum zu einem Leerzeichen zusammen, entfernt ihn aber nicht. `0010 0101` und `00100101` gelten damit als verschieden. Für Training 1 ein Schalter an der Aufgabe, etwa `leerzeichen: false` („Leerzeichen zählen nicht“), der vor dem Vergleich allen Leerraum entfernt; in den Fingerabdruck `f` aufnehmen und in `app/skripte/pruefe-stand.mjs` (Teil „schalter“) mitprüfen. Ohne den Schalter müsste der Text „8 Stellen ohne Leerzeichen“ verlangen, gegen Festlegung 2.
4. **trace mit `for`-Zeile (ca. 1 Stunde).** Die Zeilenfolge 1, 2, 3, 2, 3, 2, 3, 2, 4 für Station 3 ist mit `sys.settrace` nachgeprüft (die `for`-Zeile meldet sich auch beim Ende). Der Schritt beim Ende hat nur `set: {"Weg": "nein"}`, `i` bleibt stehen; das geht wie die Bedingungsspalte in Termin 04. Nicht gelesen: ob „Schritt für Schritt“ (`viz.js`) die `for`-Zeile am Ende ebenfalls zeigt; einmal am Codeblock aus Abschnitt 2 ansehen, damit Station und Visualisierer dasselbe sagen.
5. **Tests für Zählschleifen mit festen Eingaben (Regel für die Autoren, optional ein Helfer, ca. 1 Stunde).** Belegt: Liest ein Programm zu viele Eingaben (`range` zu lang), endet der Testlauf mit `EOFError` und dem Hinweis „Das Programm wollte mehr Eingaben lesen, als vorgesehen sind …“ (`aufgaben.js:210, 117`, Meldung über `run_program` Z. 302–303). Liest es zu wenige (`range(1, n)`), bleiben Eingaben übrig, und niemand merkt es (`run_program` gibt nur die Ausgabe zurück). Deshalb: Jede Aufgabe hat mindestens einen Test, in dem der letzte Wert das Ergebnis ändert (Würfel 6, 6, 6, 6; Laufzeiten; Wochenschritte mit 4000 am Ende); Testdaten mit 0 als letztem Wert reichen dafür nicht (siebenmal 0 gibt mit `range(1, 7)` dasselbe Ergebnis). Wer es robuster will: ein Helfer, der die übrigen Eingaben meldet (zum Beispiel `run_program` mit Rückgabe der Restliste unter neuem Namen). Außerdem stehen Eingabeaufforderungen im Testlauf als eigene Zeilen und enthalten hier Zahlen („Wurf 3:“, „Zeit Lauf 2:“): Tests werten die letzte Zeile aus oder überspringen die Aufforderungen (Einmaleins: erste Zeile, Sparplan: erste zwei Zeilen), nie `zahlen()` über die ganze Ausgabe.
6. **Mittelwert in Tests.** Vergleich als Zahl mit Toleranz 0,05 über `zahlen()` (`aufgaben.js:270`). Alle Testdaten sind nachgerechnet und enden nicht auf 5 an der zweiten Nachkommastelle (`f"{7.25:.1f}"` ergibt `7.2`, `f"{56.25:.1f}"` ergibt `56.2`).
7. **Bausteine `byte`, `range`, `summe` (zusammen ca. 1,5 Tage).** `byte` etwa 4 Stunden (Schalter, Zahlfeld, Schritt-Knopf, Rechenkern `bits(z)`, `stellenwertSchritte(z)`). `range` etwa 4 Stunden. `summe` etwa 1 Tag: Schritt-Mechanismus und Markierung der aktiven Zeile aus dem Baustein `schleife` in `explorables-v04.js` übernehmen, vier Programmfassungen als Daten. Rechenkern ohne DOM oben in der Datei, Test `app/skripte/tests/explorables-v05.test.mjs` nach dem Muster von `explorables-v04.test.mjs`.
8. **Endlosschleifen.** Eine `for`-Schleife über `range` endet immer. Der Schutz aus Termin 04 (`aufgaben.js:154–158`, 200 000 Zeilen) bleibt für die `while`-Knobelaufgabe „Reiskörner“ (vergisst jemand das Verdoppeln, bricht der Test mit „Dein Programm läuft nicht zu Ende …“ ab).
9. **Gebaut werden danach:** `kurs.yaml` (Eintrag V05 mit `aktiv: false`, `lektion: V05` bei Termin 5, Titel, kurz, hook, python), `app/inhalte/v05/lerneinheit.mdx` mit `lerneinheit/stellenwert.daten.json`, `app/inhalte/v05/labor.mdx` mit den Aufgaben `w-vorgemacht`, `w-trace`, `w-plan`, `w-parsons`, `w-luecken`, `w-eigene`, `tr-1` bis `tr-4`, Knobel `k-1` und `k-2` (je `.vorlage.py`, `.tests.py`, `.solution.py`, Pläne und Daten als `.json`), `explorables-v05.js`, `v05.css`. Gesamtaufwand der Werkzeug-Punkte 1 bis 5 und 7: etwa 2,5 Tage.

---

# Entscheidungen des Dozenten (2026-11-26)

Alle drei Fragen unten sind mit der Empfehlung beantwortet: (1) vorwärts zählen mit „Fünf Runden“, der Countdown mit Schrittweite kommt in Termin 06; (2) Binärzahlen mit 8 Stellen in zwei Vierergruppen, Index ₂ nur bei Verwechslungsgefahr, kein `0b`, Leerzeichen in Eingabefeldern zählt nicht (Technische Voraussetzung 3 wird gebaut); (3) `range(n)` mit einer Zahl wird nur gelesen, selbst geschrieben wird `range(start, stopp)`. Die Überschrift oben („Entwurf zur Bestätigung“) und alle „zu bestätigen“ gelten damit als erledigt.

# Offene Fragen an den Dozenten (beantwortet, siehe oben)

1. **Countdown mit `for`.** Das Konzept will den Countdown aus Termin 04 als `for` zeigen. Das braucht `range(5, 0, -1)`, also die Schrittweite, die für Termin 06 vorgesehen ist. Empfehlung: In Termin 05 vorwärts zählen („Fünf Runden“, Abschnitt 2), der Countdown wird das erste Beispiel für die Schrittweite in Termin 06. Alternative: Schrittweite hier nur an diesem einen Beispiel zeigen, ohne Übung; dann hätte Block 2 fünf Kerninhalte.
2. **Schreibweise der Binärzahlen in App und Klausur.** Vorschlag (Festlegung 2): ein Byte immer mit 8 Stellen in zwei Vierergruppen (`0010 1101`), Index ₂ nur bei Verwechslungsgefahr, kein `0b` vor Termin 06; in Eingabefeldern zählt das Leerzeichen nicht. Empfehlung: so, und in der Klausur dieselbe Schreibweise, weil sie zu den Hex-Vierergruppen in Termin 06 führt. Wenn lieber ohne Lücke geschrieben werden soll, entfällt Technische Voraussetzung 3.
3. **`range` mit einer Zahl.** `range(5)` (beginnt bei 0) steht im Konzept. Empfehlung: nur lesen (Vorhersage in Abschnitt 2, Karte 1, Selbstcheck), selbst geschrieben wird immer `range(start, stopp)`, für 1 bis n also `range(1, n + 1)`, weil das zur Raute „i von 1 bis n?“ passt und die Eingabeaufforderungen ab 1 zählen. In der Klausur käme `range(n)` dann nur in „Ausgabe bestimmen“ vor. Alternative: beide Formen auch schreiben lassen; dann braucht es eine weitere Übung und die Regel, wann welche Form.
