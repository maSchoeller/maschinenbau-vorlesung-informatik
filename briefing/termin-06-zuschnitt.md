# Zuschnitt Termin 06 (Entwurf zur Bestätigung)

Aufbau und Ton wie `briefing/termin-05-zuschnitt.md`. Grundlage sind `KONZEPT.md`, `app/kurs.yaml` und der Konzeptvorschlag `briefing/termin-06-07-konzept.md` mit den Entscheidungen des Dozenten vom 2026-11-27: Hexadezimal mit Vierergruppen als Kern (hex → dezimal nur zweistellig, dezimal → hex nur über den Umweg binär), `0x`, `0b`, `hex()`, `bin()`, `int("E2", 16)` und `&`, `|`, `^` nur in einer Karte zum Nachprüfen, kein `end=""` und keine Zeichenmuster. Alle Umrechnungen, Tabellen, Programme, Ausgaben, Fehlermeldungen und Testdaten sind mit Python 3.13 nachgerechnet (die Seite läuft mit Pyodide 0.26.4, also Python 3.12; die genannten Meldungen sind nach den Python-Quellen gleich, nur mit 3.13 ausgeführt). Wo dieses Papier „zu bestätigen“ sagt, liegt die Entscheidung beim Dozenten (Liste am Ende).

## Aufteilung

| Einheit | Termin 06 |
|---|---|
| T3 Zahlensysteme, Teil 2 von 2 | Block 1: Hexadezimalsystem. 16 Ziffern, binär und hex über Vierergruppen, hex → dezimal zweistellig, dezimal → hex über binär, Farbcodes |
| T4 Bitoperationen und XOR (1) | Block 4: XOR als Logik („entweder … oder“), bitweise UND, ODER, XOR auf Papier, zweimal XOR mit demselben Schlüssel ergibt das Original |
| P3 Schleifen, Teil 6 und 7 von 7 | Block 2: Schrittweite `range(start, stopp, schritt)`, Countdown mit `for`. Block 3: Schleife in Schleife (Raute in der Raute), Würfelpaare |

Beispielwelt: Theorie Farben im Web (das Rot der DHBW), Treppenhauslicht, Geheimschrift; Programmieren Countdown, Würfelpaare, Kino, Einmaleins-Tafel. Maschinenbau dort, wo es natürlich passt: die Lochreihe und das Lochraster (Abstände in mm) und, wenn bestätigt (Frage 1), die Säulenreihe in der 3D-Vorschau.

Reihenfolge wie im Konzept: Theorie (Hex), Programmieren (Schrittweite), Pause, Programmieren (Schleife in Schleife), Theorie (XOR). XOR steht am Ende, weil Block 4 nur 25 Minuten hat und nichts Neues in Python braucht: Der Block lebt von Papier, Baustein und der einen Karte. Dass T4 hinter P3 liegt, ist so im Konzept vorgesehen.

Ein Abweichen vom Konzept vorweg: Das Konzept nennt als Knobelaufgabe eine „Pyramide aus Zahlen“ mit `zeile = zeile + f"{j} "`. Das Zusammenbauen von Text mit `+` ist bisher nicht eingeführt (nichts in Termin 01 bis 05), und Zeilen aus mehreren Zahlen sind nach der Entscheidung zu `end=""` nur so möglich. Die Knobelaufgaben unten sind deshalb „Händedruck-Runde“ (die innere Grenze hängt von `i` ab, ganze Zeilen) und „Pythagoras-Tripel“. Frage 5.

## Festlegungen für Termin 06

Es gelten alle Festlegungen aus Termin 02 bis 05 (Stationsreihenfolge von Termin 01, drei gestufte Tipps, Grenzfall in jeder Aufgabe, höchstens 28 Minuten je Block verplant, Videos laufen nicht im Termin, Pausen stehen nicht in der App, Meldungstexte ohne Gedankenstrich, Mittelwert und Testdaten wie in Termin 05, Binärzahlen als zwei Vierergruppen). Dazu neu:

1. **Kennung V06**, Ordner `app/inhalte/v06/`, Adressen `v06-hexadezimal-xor-und-schleifen.html` und `v06-labor.html`, Bausteine in `explorables-v06.js` mit `v06.css`. Beide Dateinamen sind schon belegt (alte V06: Abkühlkurve und Newton-Treppe): Technische Voraussetzung 1. In `kurs.yaml` bekommt `termine` bei `nr: 6` den Zusatz `lektion: V06`; der Eintrag unter `lektionen` zunächst mit `aktiv: false` (Entwurf wie V03 bis V05).
2. **Schreibweise der Hexzahlen.** Ziffern 0 bis 9 und A bis F in Großbuchstaben, ein Byte hat genau zwei Hex-Ziffern (`E2`, `0A`), kein Präfix. Das Präfix `0x` steht nur in der Karte zum Nachprüfen. Einen Index (25₁₆ ist 37, E2₁₆) gibt es nur, wo eine Verwechslung droht: Die Hexzahl 25 ist nicht die Dezimalzahl 25. In Eingabefeldern zählt die Groß- und Kleinschreibung nicht (Technische Voraussetzung 3, Frage 3), weil Python Hex klein ausgibt. Zahlen nur von 00 bis FF.
3. **Eine Methode für beide Richtungen: die Vierergruppentabelle.** 0000 = 0 bis 1111 = F, 16 Zeilen, aus Termin 05 bekannt (die Wahrheitstabelle mit vier Variablen). binär ↔ hex: Gruppe für Gruppe nachschlagen. hex → dezimal: Stellenwerte 16 und 1 (`E2` = 14 · 16 + 2 = 226). dezimal → hex: erst binär mit der Stellenwerttabelle aus Termin 05, dann Vierergruppen. Keine Division durch 16.
4. **Wörter (Theorie):** Hexadezimalsystem (auch Sechzehnersystem), Hex-Ziffer, Vierergruppe; XOR („entweder … oder“, genau eins von beiden), bitweise (Spalte für Spalte), Schlüssel, verschlüsseln, entschlüsseln. UND, ODER, XOR werden in Texten und Aufgaben als Wörter geschrieben, in der Klausur auch (kein ⊕, kein `&`, `|`, `^` in Aufgaben, Frage 4).
5. **Schrittweite im Code** immer als `range(start, stopp, schritt)` mit drei Zahlen (oder Namen). Selbst geschrieben werden positive Schritte (2, 5, 25 oder eine Variable) und `-1`; andere negative Schritte (`-2`, `-3`) werden nur gelesen (Vorhersage; zu bestätigen, Frage 6). Der Stoppwert gehört nie dazu, bei negativem Schritt zählt `i` bis knapp über dem Stoppwert. Läuft die Richtung gegen den Schritt (`range(5, 0)`, `range(1, 6, -1)`), gibt es keine Zahl, und Python meldet nichts. Schritt 0 meldet `ValueError: range() arg 3 must not be zero` (einmal in Karte 1 gezeigt, nicht geübt).
6. **Im Plan** beschriftet die Raute die Schrittweite: „i von 5 bis 1, Schritt −1?“ und „x von 25 bis 100, Schritt 25?“. „bis“ nennt den größten (bei negativem Schritt kleinsten) Wert, den `i` noch haben darf: Stoppwert − 1 beziehungsweise + 1. Er wird nicht immer erreicht (`range(2, 20, 3)`: „i von 2 bis 19, Schritt 3“, die Werte enden bei 17; „bis“ heißt „nicht weiter als“; zu bestätigen, Frage 6). Im `<Plan>` steht das als Text von Hand (`Schleife: i von 5 bis 1, Schritt −1?`), im Editor entsteht es aus `i in range(5, 0, -1)` (Technische Voraussetzung 2).
7. **Schleife in Schleife:** Die äußere Schleife heißt `i`, die innere `j` (Koordinaten dürfen in Aufgaben `x` und `y` heißen). Der Rumpf der äußeren Schleife enthält die innere ganz; die innere läuft bei jedem Durchlauf der äußeren einmal komplett und beginnt wieder bei ihrem Startwert. Durchläufe des inneren Rumpfs: Durchläufe außen mal Durchläufe innen. Einrückung in zwei Stufen (4 und 8 Leerzeichen, mit `if` drei Stufen). Es werden nur ganze Zeilen ausgegeben (kein `end=""`, keine Muster aus Zeichen). Pflicht sind zwei Ebenen; drei kommen nur in einer Knobelaufgabe.
8. **Die drei Stellen** eines Schleifenprogramms gelten jetzt für beide Schleifen: Zähler und Startwerte vor der äußeren Schleife (ein Zähler im Rumpf der äußeren Schleife beginnt bei jedem `i` von vorn), Arbeit im inneren Rumpf, Ergebnis nach beiden Schleifen.
9. **Ablauf verfolgen bei Schleife in Schleife:** Spalten `i`, `j`, ein Wert (`summe`) und `Weg`. Jede `for`-Zeile trägt ihr eigenes `i` oder `j` ein und in `Weg` ja oder nein. Die innere `for`-Zeile kommt bei jedem `i` einmal öfter, als die innere Schleife Werte hat (auch das letzte Mal, nein). Bei `nein` bleibt die Variable beim letzten Wert stehen; beim nächsten `i` beginnt `j` wieder bei 1 (nachgeprüft mit `sys.settrace`, Zeilenfolge 1, 2, 3, 4, 3, 4, 3, 2, 3, 4, 3, 4, 3, 2, 5).
10. **XOR-Geheimschrift:** A = 1 bis Z = 26, 5 Bit je Buchstabe (bewusst nicht ASCII; Zeichencodes kommen mit T6). Ein Schlüssel hat ebenfalls 5 Bit, also 0 bis 31. Das Ergebnis kann 0 oder 27 bis 31 sein: Dafür gibt es keinen Buchstaben. Der Baustein zeigt den Geheimtext immer als Zahl und Bits, als Buchstabe nur, wo es einen gibt (sonst „?“). Entschlüsselt wird mit den Zahlen, deshalb geht es immer. Schlüssel 0 ändert nichts. Zu bestätigen, Frage 2.
11. **Wörter (Programmieren):** Schrittweite, äußere und innere Schleife, Durchlauf (wie Termin 04 und 05). „Zeilen und Spalten“ nur im Raster der Bausteine.
12. **Tests mit festen Eingaben:** Wie in Termin 05 mindestens ein Test, in dem der letzte Wert das Ergebnis ändert, bei Schleife in Schleife für beide Grenzen (außen und innen; zum Beispiel Würfelsumme 12 verlangt 6 und 6). Bei Schrittweite ein Test, in dem der Stoppwert genau auf einen Schritt fällt (Länge 100 bei Abstand 25), einer, in dem er daneben liegt (90 bei 25), und einer, in dem die Schrittweite selbst wirkt (Länge 100 bei Abstand 20: sechs statt fünf Positionen, ein fest eingetragener Abstand 25 fällt durch).
13. **trace als Tabelle mit gegebenen Werten:** Die gegebenen Werte stehen in den `code`-Zeilen, nicht in den Antwortspalten (`aufgaben.js:924` liest `Name = Wert` mit `\w+`, also nur ASCII-Namen: ein Name mit Umlaut wird abgeschnitten, aus `binär` wird „r“). Hex-Aufgaben: `Zahl = 0110 1110, System = binär, gesucht = hex` (Werte dürfen Umlaute haben, Namen nicht), eine Antwortspalte „Ergebnis“. Station 6: `A = 0110 1001, Art = UND, B = 1010 1100`, Antwortspalte „Ergebnis“. Das Zahlensystem der gegebenen Zahl steht dadurch immer in der Zeile (100 ist dezimal, nicht binär). Namen in `code`-Zeilen ohne Umlaut, Werte ohne Komma.

---

# Termin 06

## A. Kopf

- Titel: **Vier Bits, eine Ziffer: Hexadezimal, XOR und Schleifen in Schleifen** (Arbeitsname aus dem Konzept, beibehalten: „vier Bits, eine Ziffer“ trägt Hex und XOR, „Schleifen in Schleifen“ den Programmierteil)
- Vorspann: Ein Byte mit acht Nullen und Einsen ist lang und leicht falsch abgeschrieben. Mit zwei Ziffern geht es kürzer: Jede Vierergruppe wird eine Ziffer. So stehen Farben im Web, und so schreibt man Bytes auf. Außerdem lässt du heute Schleifen auch rückwärts und in Sprüngen laufen, steckst eine Schleife in eine andere, und du verschlüsselst ein Wort mit einer einzigen Verknüpfung, die sich selbst wieder rückgängig macht.
- Lernziele:
  - eine Binärzahl mit bis zu 8 Stellen ins Hexadezimalsystem umrechnen und zurück, und eine zweistellige Hexzahl in eine Dezimalzahl
  - mit `range(start, stopp, schritt)` vorwärts in Sprüngen und rückwärts zählen, einen Plan mit der Raute „i von 5 bis 1, Schritt −1?“ lesen, in Code übertragen und angeben, welche Werte `i` annimmt
  - eine Schleife in eine andere stecken (Raute in der Raute), die Durchläufe zählen und mit `if` im inneren Rumpf Treffer zählen
  - XOR erklären und zwei Bytes bitweise mit UND, ODER und XOR verknüpfen, und wissen: Zweimal XOR mit demselben Schlüssel ergibt wieder das Original
- kurz: „Hex, XOR, Schleifen in Schleifen“
- hook: „Zwei Ziffern für acht Bits“
- neu in Python (Feld `python` in `kurs.yaml`): `python: ["range(start, stopp, schritt)", "Schleife in Schleife"]`. Nur in der Karte zum Nachprüfen, nicht in Aufgaben: `0x`, `0b`, `hex()`, `bin()`, `int("E2", 16)`, `&`, `|`, `^`. Dazu die Meldungen `SyntaxError: expected ':'` (Training 3) und `ValueError: range() arg 3 must not be zero` (Karte 1).

## B. Warm-up (0–10)

Training Termin 05, Aufgabe 1 „Umrechnen“: acht Zeilen auf Papier (5 Minuten). Auflösung:

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

Brücke in die Theorie (3 Minuten, Frage in die Runde): Du hast acht Stellen je Zeile geschrieben. Wenn jede Vierergruppe eine einzige Ziffer wäre, wie lang wäre dann Zeile 5? Auflösung in Abschnitt 1: `0010 0101` besteht aus den Gruppen 0010 = 2 und 0101 = 5, also zwei Ziffern, `25`. Das ist nicht fünfundzwanzig, sondern 37 (2 · 16 + 5). Dazu brauchen wir Ziffern über 9.

## C. Lerneinheit

### Abschnitt 1 · Das Hexadezimalsystem (T3, Teil 2 · 10–40)

Kernaussage: Eine Vierergruppe hat 16 mögliche Werte. Im Hexadezimalsystem bekommt jeder Wert eine eigene Ziffer, und ein Byte wird zu zwei Ziffern.

- Rückgriff Termin 05: Vier Bits ergeben 2⁴ = 16 Werte, von 0000 bis 1111, die Zeilen der Wahrheitstabelle. Dezimal gibt es nur zehn Ziffern. Für die Werte 10 bis 15 nimmt man Buchstaben: A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.
- Begriffs-Hinweise (`<Begriff e="…">`): Hexadezimalsystem „Ein Zahlensystem mit 16 Ziffern: 0 bis 9 und A bis F. Jede Ziffer steht für genau vier Bit.“ · Hex-Ziffer „Eine der Ziffern 0 bis 9 und A bis F. A ist 10, F ist 15.“ In Abschnitt 4: XOR „Entweder … oder: Das Ergebnis ist wahr, wenn genau eine der beiden Seiten wahr ist.“
- Die Tabelle zum Merken und Nachschlagen (Vierergruppe, Hex-Ziffer, Dezimalwert):

| binär | 0000 | 0001 | 0010 | 0011 | 0100 | 0101 | 0110 | 0111 | 1000 | 1001 | 1010 | 1011 | 1100 | 1101 | 1110 | 1111 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| hex | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | A | B | C | D | E | F |
| dezimal | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |

- **binär → hex, Gruppe für Gruppe.** `1110 0010`: 1110 ist E, 0010 ist 2, also **E2**. Per Zuruf: `0011 1100` ergibt **3C**. Umgekehrt hex → binär: `A7` ergibt A = 1010 und 7 = 0111, also `1010 0111`. Die Vierergruppen aus Termin 05 sind jetzt die Ziffern.
- **hex → dezimal, zweistellig.** Stellenwerte 16 und 1: `E2` = 14 · 16 + 2 · 1 = 224 + 2 = **226**. Probe über binär: `1110 0010` = 128 + 64 + 32 + 2 = 226.
- **dezimal → hex über binär.** 200 mit der Stellenwerttabelle aus Termin 05: `1100 1000`, dann 1100 = C und 1000 = 8, also **C8**. Probe: 12 · 16 + 8 = 200.
- **Wozu das Ganze:** kürzer und weniger Tippfehler als acht Nullen und Einsen, und trotzdem direkt lesbar als Bits. Alltag: Farben im Web. `#E2001A` ist das Rot der DHBW: E2 = 226 Rot, 00 = 0 Grün, 1A = 26 Blau. Jede Farbe hat drei Bytes, je eines für Rot, Grün, Blau. `#FFFFFF` ist Weiß (alles voll an), `#000000` Schwarz.

Übung „Hexzahlen umrechnen“ (Art `trace`, `sprache: "tabelle"`, 4 Schritte, `ausgabe: false`, `typhinweis: false`, `leerzeichen: false`, Groß- und Kleinschreibung egal, zählt nicht im Fortschritt). Text: „Rechne um. Hexzahlen schreibst du mit zwei Ziffern, Binärzahlen mit 8 Stellen, ohne Anführungszeichen. Erst auf Papier, dann hier prüfen.“ `code`-Zeilen und Spalten nach Festlegung 13 (`Zahl`, `System`, `gesucht`, Antwortspalte „Ergebnis“). Lösung:

| Zeile | Zahl, System | gesucht | Ergebnis |
|---|---|---|---|
| 1 | 0110 1110 | hex | 6E |
| 2 | A7 | binär | 1010 0111 |
| 3 | B3 | dezimal | 179 |
| 4 | 100 | hex | 64 |

`hint`: Zeile 1: „Zwei Vierergruppen: 0110 ist 6, 1110 ist E. Jedes Byte hat zwei Hex-Ziffern, auch mit einer 0 vorn.“ Zeile 3: „B ist 11. Rechne 11 · 16 + 3.“ Zeile 4: „Erst binär mit der Stellenwerttabelle (0110 0100), dann die Gruppen: 6 und 4.“ (Zeilen mit Rechnung nachgeprüft: 6E ist 110, B3 ist 179, 64 ist 100.)

Vorhersage „Wie viele Bit stecken in einer Hex-Ziffer?“:

- 2
- [x] 4
- 8
- 16

Auflösung: Es gibt 16 Hex-Ziffern, und 16 = 2⁴. Vier Bit haben genau 16 Werte. Darum ist jede Vierergruppe eine Ziffer und jedes Byte zwei.

### Abschnitt 2 · Sprünge und Rückwärtszählen: die Schrittweite (P3, Teil 6 · 40–70)

Kernaussage: `range(start, stopp, schritt)` zählt von `start` in Schritten von `schritt`, solange der Stoppwert nicht erreicht oder überschritten ist. Mit einem negativen Schritt zählt `for` rückwärts.

- Rückgriff Termin 04: Der Raketenstart, ein Countdown mit `while` und eigenem Zähler, der um 1 sinkt (`zaehler = zaehler - 1`). Jetzt mit `for`:

```python
for i in range(5, 0, -1):
    print(i)
print("Start")
```

  Ausgabe `5`, `4`, `3`, `2`, `1`, `Start`. Die drei Zahlen heißen Start, Stopp, Schritt. Stopp gehört wieder nicht dazu: Die 0 erscheint nicht.
- Plan (`<Plan>`, beschriftet von Hand): `Schleife: i von 5 bis 1, Schritt −1?`, im Rumpf `Ausgabe: i`, danach `Ausgabe: "Start"`. Die Raute fragt: Ist noch ein `i` von 5 bis 1 übrig?
- Vorwärts in Sprüngen, drei Beispiele an der Tafel (Wertetabelle, Werte nachgerechnet):

| Aufruf | Werte von `i` | Wie oft | Alltag |
|---|---|---|---|
| `range(1, 10, 2)` | 1, 3, 5, 7, 9 | 5 | Hausnummern einer Straßenseite |
| `range(0, 11, 5)` | 0, 5, 10 | 3 | alle 5 Minuten |
| `range(0, 101, 25)` | 0, 25, 50, 75, 100 | 5 | Löcher alle 25 mm auf einer 100 mm langen Leiste |

  Bei `range(0, 101, 25)` steht der Stoppwert 101, damit die 100 noch dazugehört. Mit `range(0, 100, 25)` fehlt die letzte Position (0, 25, 50, 75).
- Der Stoppwert muss nicht getroffen werden: `range(2, 20, 3)` ergibt 2, 5, 8, 11, 14, 17 (6 Durchläufe), die nächste Zahl wäre 20 und gehört nicht mehr dazu.
- Achtung (Fehler, den Python nicht meldet): Zählt man gegen den Schritt, läuft der Rumpf nie. `range(5, 0)` und `range(1, 6, -1)` geben keine Zahl. Rückwärts braucht den Schritt `-1`.
- Faustregel aus Termin 05 bleibt: Steht vorher fest, wie oft, nimm `for`. Neu: Für Sprünge und Rückwärtszählen nimmst du den dritten Wert.

Vorhersage „Wo endet der Countdown?“:

```python
for i in range(5, 0, -1):
    print(i)
```

- 5, 4, 3, 2, 1, 0
- [x] 5, 4, 3, 2, 1
- 4, 3, 2, 1
- 1, 2, 3, 4, 5

Auflösung: Der Stoppwert 0 gehört nicht dazu, auch nicht beim Rückwärtszählen. Es sind 5 Durchläufe.

Vorhersage „Ein Zeichen vergessen“: Im Programm steht `for i in range(5, 0):` ohne den Schritt. Was erscheint?

- 5, 4, 3, 2, 1
- 1, 2, 3, 4, 5
- [x] Nichts, der Rumpf läuft nie.
- Eine Fehlermeldung

Auflösung: Ohne Schritt zählt `range` vorwärts, und 5 ist schon größer als der Stoppwert 0. Es gibt keine Zahl. Python meldet das nicht.

Dieser Abschnitt hat keinen eigenen Baustein (es sind genau drei, siehe „Bewusst weggelassen“). „Schritt für Schritt“ am Countdown-Codeblock zeigt `i` beim Rückwärtszählen.

### Abschnitt 3 · Schleife in Schleife (P3, Teil 7 · 80–110)

Kernaussage: Steckt eine Schleife im Rumpf einer anderen, läuft die innere bei jedem Durchlauf der äußeren einmal ganz durch. Der innere Rumpf läuft so oft, wie außen mal innen.

- Idee mit einem Sitzplan: 2 Reihen, 3 Plätze je Reihe. Für jede Reihe `i` kommen alle Plätze `j`. Plan (`<Plan>`, Raute in der Raute):

```text
Schleife: i von 1 bis 2?
  Schleife: j von 1 bis 3?
    Ausgabe: "Reihe", i, "Platz", j
```

```python
for i in range(1, 3):
    for j in range(1, 4):
        print(f"Reihe {i}, Platz {j}")
```

  Ausgabe: `Reihe 1, Platz 1`, `Reihe 1, Platz 2`, `Reihe 1, Platz 3`, `Reihe 2, Platz 1`, `Reihe 2, Platz 2`, `Reihe 2, Platz 3`. Sechs Zeilen: 2 · 3. Zuerst läuft `j` ganz durch, dann erst springt `i` weiter, und `j` beginnt wieder bei 1. Wie bei einem Kilometerzähler: Die rechte Ziffer läuft schnell, die linke langsam. „Schritt für Schritt“ am Codeblock zeigt das.
- Einrückung in zwei Stufen: `for j` steht im Rumpf von `for i` (4 Leerzeichen), `print` im Rumpf von `for j` (8 Leerzeichen).
- Beispiel: **alle Würfelpaare.** Zwei Würfel haben 6 · 6 = 36 Paare. Wie oft ist die Augensumme 7? Der Zähler steht vor beiden Schleifen, der Vergleich im inneren Rumpf:

```text
anzahl = 0
Schleife: i von 1 bis 6?
  Schleife: j von 1 bis 6?
    Entscheidung: i + j == 7?
      ja:
        anzahl = anzahl + 1
Ausgabe: anzahl
```

```python
anzahl = 0
for i in range(1, 7):
    for j in range(1, 7):
        if i + j == 7:
            anzahl = anzahl + 1
print(f"Summe 7 kommt {anzahl}-mal vor")
```

  Ausgabe `Summe 7 kommt 6-mal vor`. Die Paare: 1 und 6, 2 und 5, 3 und 4, 4 und 3, 5 und 2, 6 und 1. Alle anderen Summen: 2 und 12 je einmal, 6 und 8 je fünfmal (nachgerechnet; im Baustein ablesbar).
- Die drei Stellen aus Termin 05 gelten für beide Schleifen: Zähler vor der äußeren Schleife, `if` im inneren Rumpf, `print` nach beiden. Das `print` steht ganz links.
- Alltag und Ausblick: Raster (Zeilen und Spalten), Pixel, später Schiffe versenken. Die Einmaleins-Tafel (Station 4) ist dasselbe Prinzip mit zwei Zahlen.

Vorhersage „Wer läuft schneller?“:

```python
for i in range(1, 3):
    for j in range(1, 3):
        print(f"{i} {j}")
```

- `1 1`, `2 1`, `1 2`, `2 2`
- [x] `1 1`, `1 2`, `2 1`, `2 2`
- `1 1`, `2 2`
- `1 2`, `1 1`, `2 2`, `2 1`

Auflösung: Die innere Schleife läuft bei jedem `i` ganz durch: erst `1 1`, `1 2`, dann springt `i` auf 2, und `j` beginnt wieder bei 1. Zusammen 2 · 2 = 4 Zeilen.

Vorhersage „Zähler im äußeren Rumpf“ (Würfelpaare, Summe 7): Jemand hat `anzahl = 0` als erste Zeile in den Rumpf der äußeren Schleife gerückt. Was steht hinter „Summe 7 kommt“?

- 0
- [x] 1
- 6
- 36

Auflösung: Bei jedem neuen `i` beginnt `anzahl` wieder bei 0. Am Ende zählt nur der letzte Durchlauf, `i = 6`, und der hat genau ein Paar (6 und 1). Der Startwert gehört vor beide Schleifen. (Codeblock dazu mit `data-run="nach-antwort"` wie in Termin 04 und 05; nachgerechnet.)

### Abschnitt 4 · Bitoperationen und XOR (T4 · 110–135)

Kernaussage: XOR heißt „entweder … oder“. Auf Bytes angewendet, verknüpft man Spalte für Spalte. Zweimal XOR mit demselben Schlüssel macht die Verknüpfung rückgängig.

- **XOR als Logik.** UND und ODER aus Termin 02 bis 04 kennst du. XOR ist wahr, wenn genau eine der beiden Seiten wahr ist. Wahrheitstabelle neben UND und ODER:

| A | B | A UND B | A ODER B | A XOR B |
|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 |
| 1 | 1 | 1 | 1 | 0 |

  Der Unterschied zu ODER liegt nur in der letzten Zeile: Bei ODER darf auch beides sein, bei XOR nicht.
- Alltag: das **Treppenhauslicht** mit zwei Schaltern, einer unten, einer oben. Das Licht ist an, wenn die Schalter verschieden stehen, und jeder Schalter schaltet um. Das ist XOR: Bei 0 und 1 an, bei 1 und 0 an, bei gleich aus. Wer oben umlegt, kippt das Ergebnis, egal wie der untere steht.
- **Bitweise.** Zwei Bytes untereinander, in jeder Spalte die Tabelle anwenden. Zuerst mit 4 Bit, `1100` und `1010`: UND `1000`, ODER `1110`, XOR `0110`. Dann mit einem Byte, `0110 1001` und `1010 1100`:

| | Byte |
|---|---|
| A | 0110 1001 |
| B | 1010 1100 |
| A UND B | 0010 1000 |
| A ODER B | 1110 1101 |
| A XOR B | 1100 0101 |

- **Verschlüsseln.** Ein Byte A mit einem Schlüssel B per XOR verknüpfen: `1100 0101`. Dasselbe Ergebnis noch einmal mit demselben Schlüssel verknüpft ergibt `0110 1001`, also wieder A. Grund: Jede Spalte wird zweimal gekippt oder gar nicht, und zweimal kippen heißt zurück. Das ist die einfachste Verschlüsselung und steckt als Baustein in echten Verfahren. Als Geheimschrift: Buchstaben als Zahlen A = 1 bis Z = 26 in 5 Bit, Schlüssel mit 5 Bit.
- Beispiel `HALLO` mit Schlüssel `01101` (13): Geheimtext `ELAAB` (nachgerechnet; H = 8 = `01000`, XOR `01101` ergibt `00101` = 5 = E). Ergibt das XOR eine Zahl ohne Buchstaben (0 oder 27 bis 31), zeigt das nur der Baustein (Frage 2); im Text kommt das nicht vor.

Vorhersage „Wann ist XOR wahr?“:

- Wenn mindestens eine Seite wahr ist.
- [x] Wenn genau eine Seite wahr ist.
- Wenn beide Seiten wahr sind.
- Wenn beide Seiten gleich sind.

Auflösung: „Mindestens eine“ ist ODER, „beide“ ist UND, „beide gleich“ ist das Gegenteil von XOR. Bei 1 XOR 1 kommt 0.

Die Python-Zeichen (`0x`, `0b`, `hex()`, `bin()`, `int("E2", 16)`, `&`, `|`, `^`) stehen nur in Karte 3 (Station 1) und werden am Ende des Blocks einmal gezeigt: „So prüfst du deine Rechnung nach.“ Nicht in Aufgaben, nicht in der Klausur.

## D. Interaktive Bausteine (3)

1. **`hexfarbe` – „Hex-Farbmischer“** (Abschnitt 1). Einstellen: drei Schieberegler Rot, Grün, Blau (je 0 bis 255), dazu je ein Zahlfeld; umgekehrt ein Eingabefeld für den Farbcode (`#E2001A`, sechs Hex-Ziffern, ungültige Eingaben werden mit einem Satz abgelehnt). Sehen: je Byte die 8 Bit in zwei Vierergruppen mit der Hex-Ziffer darunter („1110 → E, 0010 → 2“), der Farbcode groß und die Farbfläche. Die Farbe wird immer auch als Text genannt („Rot 226, Grün 0, Blau 26“), nie nur als Fläche. Vermutung: Was ergibt `#FFFFFF`? (Weiß.) Und `#000000`? (Schwarz.) Beobachtung danach: Schieber auf 255 heißt FF, alle acht Bit an. Zweite Vermutung: `#00FF00`? (Reines Grün.)
2. **`doppelschleife` – „Schleife in Schleife“** (Abschnitt 3). Einstellen: Grenzen für `i` (1 bis 6) und `j` (1 bis 6) mit Plus- und Minus-Knöpfen, vorbelegt 3 und 4; Schalter „Würfelpaare (6 × 6) mit Summe 7“. Sehen: die zwei Zeilen `for i in range(1, 4):` und `for j in range(1, 5):`, eine Tabelle `i`, `j`, Durchläufe und ein Raster, das sich Zelle für Zelle füllt (Zeilen `i`, Spalten `j`, die aktive Zelle hervorgehoben). Knöpfe „Ein Schritt“ und „Bis zum Ende“. Im Würfelmodus sind die Zellen mit `i + j == 7` hervorgehoben und der Zähler zählt mit. Vermutung: Wie oft läuft der innere Rumpf bei 3 und 4? (12.) Beobachtung: `j` beginnt bei jedem neuen `i` wieder bei 1. Zweite Vermutung (Würfelmodus): Wie viele Zellen sind hervorgehoben? (6.)
3. **`xorschrift` – „XOR-Geheimschrift“** (Abschnitt 4). Einstellen: ein Wort aus 1 bis 6 Großbuchstaben (A bis Z, andere Zeichen werden nicht angenommen), ein Schlüssel als fünf Kippschalter oder Zahl 0 bis 31, vorbelegt `HALLO` und `01101`. Sehen: je Buchstabe eine Spalte mit Zahl, 5 Bit, darunter die 5 Bit des Schlüssels, darunter das XOR-Ergebnis als Bits, als Zahl und als Buchstabe (bei 0 und 27 bis 31 ein „?“ mit dem Satz „Für 30 gibt es keinen Buchstaben. Er bleibt als Zahl stehen.“). Knopf „Noch einmal mit demselben Schlüssel“ verknüpft das Ergebnis erneut, die zweite Zeile zeigt das Wort. Beim Schlüssel 00000 der Hinweis „Dieser Schlüssel ändert nichts.“ Vermutung: Was kommt heraus, wenn du das Ergebnis noch einmal mit dem Schlüssel verknüpfst? (Das Wort.)

Abschnitt 2 hat keinen Baustein; „Schritt für Schritt“ am Codeblock genügt (Technische Voraussetzung 4).

## E. Selbstcheck (6 Fragen, 20 Punkte)

Die Reihenfolge der Fragen und Antworten ist bei jedem Aufruf anders. Titel ohne Nummern, keine Antwort „alle oben“, keine Verweise auf die Reihenfolge.

1. **Binär in hex**, Auswahl, 3 Punkte. Welche Hexzahl ist `1001 1110`? [x] `9E` · `E9` · `9F` · `8E`. Erklärung: 1001 ist 9, 1110 ist E. `E9` hat die Gruppen vertauscht, `9F` endet auf 1111, `8E` beginnt mit 1000.
2. **Hex in dezimal**, Zahl, 3 Punkte, Antwort 93. Welche Dezimalzahl ist `5D`? Erklärung: D ist 13, also 5 · 16 + 13 = 80 + 13 = 93.
3. **Farbe lesen**, Auswahl, 3 Punkte. Welche Farbe hat der Code `#00FF00`? [x] reines Grün · reines Rot · reines Blau · Schwarz. Erklärung: Die Bytes sind Rot 00, Grün FF, Blau 00. Nur Grün ist voll an.
4. **Durchläufe zählen**, Zahl, 3 Punkte, Antwort 6. Wie oft läuft der Rumpf von `for i in range(2, 20, 3):`? Erklärung: `i` ist 2, 5, 8, 11, 14, 17. Die nächste Zahl, 20, gehört nicht mehr dazu.
5. **Ausgabe bestimmen**, Ausgabe, 4 Punkte, Antwort `5`.
   ```python
   anzahl = 0
   for i in range(1, 4):
       for j in range(1, 5):
           if i * j >= 6:
               anzahl = anzahl + 1
   print(anzahl)
   ```
   Erklärung: `i` ist 1 bis 3, `j` ist 1 bis 4. `i * j >= 6` stimmt bei 2 und 3 (6), 2 und 4 (8), 3 und 2 (6), 3 und 3 (9), 3 und 4 (12). Das sind 5 Paare. `print` steht nach beiden Schleifen und läuft einmal.
6. **XOR verstehen**, Auswahl (mehrere richtig), 4 Punkte. Welche Aussagen stimmen? [x] Bei XOR ist das Ergebnis 1, wenn genau eines der beiden Bits 1 ist. · [x] Verknüpft man ein Byte zweimal mit demselben Schlüssel per XOR, steht wieder das Byte da. · Bei XOR ist das Ergebnis 1, wenn mindestens eines der beiden Bits 1 ist. · 1 XOR 1 ergibt 1. Erklärung: „Mindestens eines“ ist ODER, und bei XOR gibt 1 XOR 1 gleich 0.

## F. Labor Teil A (Stationen, auf der Seite 41 Minuten; im Termin laufen 2 und 3 nicht einzeln)

**1 · Werkzeugkasten (4 Min).** Drei Karten, Video „Python-Werkzeugkasten“. Alles aus Termin 02 bis 05 gilt weiter.
- Karte 1 „range mit Schrittweite“
  ```python
  for i in range(0, 11, 5):
      print(i)
  print("fertig")
  ```
  Ausgabe `0`, `5`, `10`, `fertig`. Drei Zahlen: Start, Stopp, Schritt. Der Stoppwert gehört nie dazu. Rückwärts braucht den Schritt `-1`: `range(5, 0, -1)` ergibt 5, 4, 3, 2, 1. Andere negative Schritte nur lesen: `range(10, 0, -3)` ergibt 10, 7, 4, 1. `range(0, 101, 25)` ergibt 0, 25, 50, 75, 100. Ohne Schritt zählt `range` vorwärts, `range(5, 0)` gibt keine Zahl. Ein Schritt von 0 meldet `ValueError: range() arg 3 must not be zero`.
- Karte 2 „Schleife in Schleife“
  ```python
  for i in range(1, 3):
      for j in range(1, 4):
          print(f"{i} und {j}")
  print("fertig")
  ```
  Ausgabe `1 und 1`, `1 und 2`, `1 und 3`, `2 und 1`, `2 und 2`, `2 und 3`, `fertig`. Die innere Schleife läuft bei jedem `i` ganz durch und beginnt wieder bei ihrem Startwert. Zähler vor beide Schleifen, Ausgabe danach ganz links.
- Karte 3 „Zum Nachprüfen: Hex und Bits in Python“ (nur zum Kontrollieren deiner Rechnung auf Papier, nicht in Aufgaben)
  ```python
  print(0xE2)               # 226, die Hexzahl E2
  print(0b11100010)         # 226, dasselbe Byte in binär
  print(hex(226))           # 0xe2, Python schreibt klein
  print(bin(37))            # 0b100101, ohne führende Nullen
  print(int("E2", 16))      # 226, den Text E2 als Hexzahl lesen
  a = 0b1100
  b = 0b1010
  print(a & b)              # 8, UND bitweise
  print(a | b)              # 14, ODER bitweise
  print(a ^ b)              # 6, XOR bitweise
  print(bin(a ^ b))         # 0b110
  ```
  Die Ausgaben stehen als Kommentar (alle nachgerechnet). `0x` heißt „Hexzahl“, `0b` heißt „Binärzahl“. `^` ist hier XOR, nicht „hoch“ wie im Taschenrechner.

**2 · Vorgerechnetes Beispiel: Kino (5 Min; im Termin nicht einzeln).** Aufgabe: Eingelesen werden die Zahl der Reihen und die Zahl der Plätze je Reihe (beide mindestens 1), dann für jeden Platz, Reihe für Reihe, eine 1 (belegt) oder eine 0 (frei). Ausgegeben wird, wie viele Plätze belegt sind, als `Belegt: 4 von 6`. Video „Vorgerechnet“. Art `run`, Eingaben `2`, `3`, `1`, `0`, `1`, `1`, `1`, `0`.

```text
Eingabe: reihen
Eingabe: plaetze
belegt = 0
Schleife: i von 1 bis reihen?
  Schleife: j von 1 bis plaetze?
    Eingabe: platz
    Entscheidung: platz == 1?
      ja:
        belegt = belegt + 1
gesamt = reihen * plaetze
Ausgabe: "Belegt:", belegt, "von", gesamt
```

```python
reihen = int(input("Wie viele Reihen? "))
plaetze = int(input("Wie viele Plätze je Reihe? "))
belegt = 0
for i in range(1, reihen + 1):
    for j in range(1, plaetze + 1):
        platz = int(input(f"Reihe {i}, Platz {j} (1 belegt, 0 frei): "))
        if platz == 1:
            belegt = belegt + 1
gesamt = reihen * plaetze
print(f"Belegt: {belegt} von {gesamt}")
```

Eingaben 2, 3, 1, 0, 1, 1, 1, 0: `Belegt: 4 von 6`. Eingaben 1, 1, 1: `Belegt: 1 von 1` (Grenzfall). Schritte: (1) Der Ablauf in Worten: Reihen und Plätze einlesen, jeden Platz abfragen, belegte zählen. (2) Wie oft? Außen `reihen`-mal, innen `plaetze`-mal, also zwei Schleifen ineinander; der innere Rumpf läuft `reihen * plaetze`-mal. (3) Wo steht was? Zähler vor beiden Schleifen, Einlesen und `if` im inneren Rumpf, Ausgabe nach beiden. (4) Plan: Raute in der Raute. (5) Code: zwei Mal `range(1, … + 1)`, `i` und `j` stehen in der Eingabeaufforderung. (6) Probe: Die Einsen sind 1, 1, 1, 1 (vier), also `Belegt: 4 von 6`. (7) Selbsterklärung: Was passiert, wenn `belegt = 0` in den Rumpf der äußeren Schleife rutscht? Der Zähler beginnt in jeder Reihe von vorn, und es zählt nur die letzte Reihe: Mit 2, 3 und 1, 0, 1, 1, 1, 0 erscheint `Belegt: 2 von 6`.

**3 · Ablauf verfolgen: Schleife in Schleife (7 Min; 15 Schritte statt 9 in Termin 05; im Termin nicht einzeln).** Art `trace`, `typhinweis: false`. Aufgabenstellung: In jeder Zeile mit `for` trägst du das `i` oder `j` ein und in die Spalte Weg ja, wenn der Rumpf noch einmal läuft, sonst nein, ohne Anführungszeichen. Beachte, wo `j` wieder bei 1 beginnt.

```python
summe = 0
for i in range(1, 3):
    for j in range(1, 3):
        summe = summe + i * j
print(summe)
```

Spalten `i`, `j`, `summe`, `Weg`. 15 Schritte: Zeile 1 `summe = 0` · Zeile 2 `i = 1`, ja · Zeile 3 `j = 1`, ja · Zeile 4 `summe = 1` · Zeile 3 `j = 2`, ja · Zeile 4 `summe = 3` · Zeile 3 nur Weg: nein · Zeile 2 `i = 2`, ja · Zeile 3 `j = 1`, ja · Zeile 4 `summe = 5` · Zeile 3 `j = 2`, ja · Zeile 4 `summe = 9` · Zeile 3 nur Weg: nein · Zeile 2 nur Weg: nein · Zeile 5 Ausgabe `9`. Hinweise: beim zweiten Mal in Zeile 3 „Die innere Schleife beginnt für jedes neue i wieder bei 1.“; beim letzten Schritt in Zeile 3 „range(1, 3) liefert 1 und 2. Die 2 war schon dran, also ist Schluss: nein. j bleibt 2.“ (Zeilenfolge 1, 2, 3, 4, 3, 4, 3, 2, 3, 4, 3, 4, 3, 2, 5 mit `sys.settrace` nachgeprüft, Endwert 9 nachgerechnet.)

**4 · Plan zeichnen: Einmaleins-Tafel (★★, 10 Min).** Art `pap-zeichnen`, erlaubt `in,out,op,for`. Die zwei Eingaben stehen schon im Editor, du ergänzt zwei Zählschleifen ineinander und die Ausgabe. Text: Eingelesen werden zwei ganze Zahlen n und m. Ausgegeben wird jedes Produkt `i * j` mit `i` von 1 bis n und `j` von 1 bis m, jedes in einer eigenen Zeile, zuerst alle für `i = 1`. Bei n = 2 und m = 3 erscheinen 1, 2, 3, 2, 4, 6.
Start: Eingabe `n` (int), Eingabe `m` (int). Lösung: Zählschleife `i in range(1, n + 1)` (Raute „i von 1 bis n?“), darin Zählschleife `j in range(1, m + 1)` (Raute „j von 1 bis m?“), darin Ausgabe `i * j`.
Tests (geprüft werden die Zeilen, die reine Zahlen sind): 2 und 3 ergibt 1, 2, 3, 2, 4, 6 · 3 und 4 ergibt 1, 2, 3, 4, 2, 4, 6, 8, 3, 6, 9, 12 (die letzte Zahl 12 verlangt beide Grenzen vollständig) · 1 und 1 ergibt 1 (Grenzfall) · 0 und 3 ergibt keine Zeile (Grenzfall, die äußere Schleife läuft nie) · 3 und 0 ergibt keine Zeile (Grenzfall, die innere läuft nie).
Tipps: (1) Wie oft läuft die Ausgabe? n-mal m-mal. Wie viele Zählschleifen brauchst du, und wo steht die zweite? (2) Die erste Zählschleife trägst du als `i in range(1, n + 1)` ein. Die zweite fügst du mit „In die Schleife einfügen“ in ihren Rumpf ein: `j in range(1, m + 1)`. (3) In den Rumpf der inneren Schleife kommt nur eine Ausgabe: `i * j`.

**5 · Plan in Code: Säulenreihe in 3D (★★, 10 Min; Vorschlag, Frage 1).** Art `code` mit 3D-Vorschau (`data-files="../assets/py/bauteil3d.py"`). Text: Auf einer Leiste stehen 5 Säulen (Durchmesser 10 mm, Höhe 30 mm) im Abstand von 25 mm, die erste bei x = 0, die letzte bei x = 100. Die erste steht schon im Programm. Übertrage den Plan: Die weiteren Säulen kommen mit einer Schleife dazu. Mit „Ausführen“ erscheint die Reihe in der 3D-Vorschau (drehbar).

```text
reihe = Säule bei x = 0
Schleife: x von 25 bis 100, Schritt 25?
  reihe = reihe plus Säule bei x
Ausgabe: reihe zeigen
```

Vorlage:
```python
# Säulenreihe: 5 Säulen, Abstand 25 mm, die erste steht bei x = 0.
# Die Werkzeuge: zylinder(10, 30) ist eine Säule (Durchmesser 10, Höhe 30), verschiebe(säule, x) setzt sie
# um x mm nach rechts, vereinige(a, b) hängt zwei Körper zusammen, zeige(körper) zeigt ihn.
from bauteil3d import *
reihe = zylinder(10, 30)
# Hier fehlen die Schleife und ihr Rumpf.
zeige(reihe)
```
Musterlösung:
```python
from bauteil3d import *
reihe = zylinder(10, 30)
for x in range(25, 101, 25):
    reihe = vereinige(reihe, verschiebe(zylinder(10, 30), x))
zeige(reihe)
```
Tests (Namensraum des Schülercodes, `reihe` und `bauteil3d`; nachgerechnet gegen die facettierten Sollwerte): Abmessungen der Reihe 110 × 10 × 30 mm mit Toleranz 0,5 mm (mit `range(25, 100, 25)` nur 85 × 10 × 30: „Es fehlt eine Säule am Ende. Der Stoppwert gehört nicht dazu.“) · Volumen 11 747 mm³ (5 mal das Volumen einer Säule, 2 349,5 mm³) mit Toleranz 1 % (mit sechs Säulen, etwa bei `range(0, 101, 25)`, steht eine Säule doppelt: „Zwei Säulen stehen am selben Platz.“) · Die Aufgabe hat keine Eingabe und deshalb keinen Grenzfall im üblichen Sinn; die Tests fassen das Ergebnis, nicht die Vorschau (die ist nur zum Ansehen).
Tipps: (1) Eine Säule steht schon bei 0. Wie viele kommen dazu, und bei welchen x? (2) Karte 1: von 25 in Schritten von 25. Die 100 muss dabei sein, also ist der Stoppwert 101. (3) Im Rumpf wächst `reihe`, so wie `summe = summe + …`: `reihe = vereinige(reihe, …)` mit der verschobenen Säule.
Variante ohne 3D (falls Frage 1 mit Nein beantwortet wird): Art `code`, `data-mode="programm"`, `data-inputs="100|25"`. Text: Eingelesen werden die Länge einer Leiste in mm und der Abstand der Löcher in mm (ganze Zahlen, Abstand mindestens 1). Das erste Loch sitzt bei 0 mm, das letzte höchstens bei der Länge. Ausgegeben wird jede Position als `Loch bei 25 mm`. Lösung: `for x in range(0, laenge + 1, abstand): print(f"Loch bei {x} mm")`. Tests (Zeilen mit „Loch bei“): 100 und 25 ergibt 0, 25, 50, 75, 100 · 100 und 20 ergibt 0, 20, 40, 60, 80, 100 (sechs Zeilen; ein fest eingetragener Abstand 25 gäbe nur fünf) · 90 und 25 ergibt 0, 25, 50, 75 (Stoppwert fällt nicht auf einen Schritt) · 0 und 10 ergibt 0 (Grenzfall) · 10 und 25 ergibt 0 (Abstand größer als die Leiste).

**6 · Bits verknüpfen (5 Min).** Art `trace`, `sprache: "tabelle"`, 4 Schritte, `ausgabe: false`, `typhinweis: false`, `leerzeichen: false`. Text: „Verknüpfe die beiden Bytes Spalte für Spalte. Trag das Ergebnis mit 8 Stellen ein, mit oder ohne Leerzeichen in der Mitte, ohne Anführungszeichen. Erst auf Papier, dann hier prüfen.“ `code`-Zeilen `A = 0110 1001, Art = UND, B = 1010 1100` (Festlegung 13), Antwortspalte „Ergebnis“. In Zeile 4 steht als A das Ergebnis aus Zeile 3 (`A = 1100 0101, Art = XOR, B = 1010 1100`). Lösung:

| Zeile | A, Art, B | Ergebnis |
|---|---|---|
| 1 | 0110 1001 UND 1010 1100 | 0010 1000 |
| 2 | 0110 1001 ODER 1010 1100 | 1110 1101 |
| 3 | 0110 1001 XOR 1010 1100 | 1100 0101 |
| 4 | 1100 0101 XOR 1010 1100 | 0110 1001 |

`hint`: Zeile 1: „UND ist nur 1, wenn beide Bits 1 sind. Geh Spalte für Spalte.“ Zeile 3: „XOR ist 1, wenn die beiden Bits verschieden sind.“ Zeile 4: „Das Ergebnis aus Zeile 3 noch einmal mit demselben Schlüssel (dem zweiten Byte). Schau dir das Ergebnis genau an: Kennst du es von irgendwoher?“ (Zeile 4 ist das Byte aus Zeile 1 bis 3, also das Original.)

## G. Labor Teil B (Training, 4 Aufgaben, 28 Minuten) und Knobelaufgaben

Zu Hause zusammen **47 Minuten**: Stationen 2 und 3 (12), Selbstcheck (7), Training (28). In `<Labor zuhause="47">` steht diese Summe. Die Zeiten sind für ängstliche Anfänger nicht knapper gerechnet: Station 3 hat 15 Schritte, Training 4 verbindet beide neuen Themen.

1. **Umrechnen** (★, 5 Min, `trace` als Tabelle, `sprache: "tabelle"`, 8 Zeilen, `ausgabe: false`, `typhinweis: false`, `leerzeichen: false`, Groß- und Kleinschreibung egal). Erst auf Papier, dann hier prüfen. Text: „Rechne um. Hexzahlen schreibst du mit zwei Ziffern, Binärzahlen mit 8 Stellen, mit oder ohne Leerzeichen in der Mitte, ohne Anführungszeichen.“ `code`-Zeilen und Antwortspalte „Ergebnis“ nach Festlegung 13.

   | Zeile | Zahl, System | gesucht | Ergebnis |
   |---|---|---|---|
   | 1 | 1011 0111 | hex | B7 |
   | 2 | 0101 1010 | hex | 5A |
   | 3 | 0000 1010 | hex | 0A |
   | 4 | 4F | binär | 0100 1111 |
   | 5 | D9 | binär | 1101 1001 |
   | 6 | 7F | dezimal | 127 |
   | 7 | A0 | dezimal | 160 |
   | 8 | 180 | hex | B4 |

   Hinweis bei Zeile 3: „Die erste Vierergruppe ist 0000, also die Ziffer 0. Auch die führende 0 schreibst du hin: zwei Ziffern.“ Hinweis bei Zeile 8: „Erst binär mit der Stellenwerttabelle (1011 0100), dann die zwei Vierergruppen: B und 4.“ Wird das Warm-up von Termin 07 (Aufgabe 1 „Umrechnen“, alle acht Zeilen, auf Papier; Termin 07 übernimmt Zeilen und Auflösung unverändert, die Brücke dort nutzt Zeile 6, `7F`). Es bleibt bei Hex und Dezimal; XOR wird in Station 6 und im Selbstcheck geübt (Frage 4).
2. **Plan in Code übertragen: Würfelpaare mit gewünschter Summe** (★★, 8 Min, `klausur`). Text: Eingelesen wird die gewünschte Augensumme (ganze Zahl). Gezählt wird, bei wie vielen der 36 Würfelpaare (beide Würfel von 1 bis 6) die Summe so groß ist. Ausgegeben wird `Paare: 6` für 7.
   Plan:
   ```text
   Eingabe: summe (ganze Zahl)
   anzahl = 0
   Schleife: i von 1 bis 6?
     Schleife: j von 1 bis 6?
       Entscheidung: i + j == summe?
         ja:
           anzahl = anzahl + 1
   Ausgabe: "Paare:", anzahl
   ```
   ```python
   summe = int(input("Gewünschte Augensumme: "))
   anzahl = 0
   for i in range(1, 7):
       for j in range(1, 7):
           if i + j == summe:
               anzahl = anzahl + 1
   print(f"Paare: {anzahl}")
   ```
   Tests (letzte Zeile): 7 ergibt `Paare: 6` · 12 ergibt `Paare: 1` (nur 6 und 6, beide Grenzen vollständig; mit `range(1, 6)` käme 0) · 2 ergibt `Paare: 1` (nur 1 und 1) · 13 ergibt `Paare: 0` (Grenzfall, kein Paar) · 8 ergibt `Paare: 5` · 1 ergibt `Paare: 0`. Schema (je 1 Punkt, 5): `summe` mit `int(input(…))` und `anzahl = 0` vor beiden Schleifen · äußere Schleife `for i in range(1, 7):` mit Doppelpunkt · innere Schleife `for j in range(1, 7):` eingerückt in der äußeren · `if i + j == summe:` in der inneren, `anzahl = anzahl + 1` in der dritten Stufe · `print` einmal nach beiden Schleifen, ganz links.
   Hier steht der Zähler absichtlich vor beiden Schleifen: der Gegenpol zur Vorhersage „Zähler im äußeren Rumpf“.
3. **Fehler finden und beheben: Countdown** (★★, 5 Min, `code`). Zwei Fehler: einer, den Python meldet, einer, den du nur mit einer Probe findest. Probier 3 als Start.
   Vorlage:
   ```python
   # Zählt von einer Startzahl rückwärts bis 1 und gibt dann Los aus.
   start = int(input("Start: "))
   for i in range(start, 0)
       print(i)
   print("Los")
   ```
   Lösung: Python meldet `SyntaxError: expected ':'` in Zeile 3: Am Ende der `for`-Zeile fehlt der Doppelpunkt. Danach zeigt die Probe mit 3 nur `Los`: Ohne Schritt zählt `range(start, 0)` vorwärts und hat keine Zahl, der Rumpf läuft nie. Richtig ist `range(start, 0, -1)`:
   ```python
   # Zählt von einer Startzahl rückwärts bis 1 und gibt dann Los aus.
   start = int(input("Start: "))
   for i in range(start, 0, -1):
       print(i)
   print("Los")
   ```
   Tests (Ausgabezeilen ohne die Eingabeaufforderung): 3 ergibt 3, 2, 1, Los · 1 ergibt 1, Los (Grenzfall) · 0 ergibt Los (Grenzfall, die Schleife läuft nie) · 5 ergibt 5, 4, 3, 2, 1, Los (der letzte Wert zählt; mit `range(start, 1, -1)` endet es bei 2).
   Tipps: (1) Führ das Programm aus und lies die Meldung: Welche Zeile, was fehlt am Ende? (2) Läuft es, probier 3: Was erscheint? (3) Rückwärts braucht einen dritten Wert in `range`. Karte 1.
4. **Lochraster einer Platte** (★★★, 10 Min, `code`, ohne Plan; erst auf Papier zeichnen). Text: Eine Platte ist so breit und so hoch wie eingelesen (in mm). Löcher sitzen im eingelesenen Abstand: das erste in der Ecke bei x = 0 und y = 0, dann Reihe für Reihe nach oben, in jeder Reihe von links nach rechts. Eingelesen werden Breite, Höhe und Abstand in mm (ganze Zahlen, Abstand mindestens 1). Ausgegeben wird jedes Loch als `Loch bei x = 25, y = 0` und zuletzt `Löcher: 6`. Beispiel: Die Eingaben 50, 25, 25 ergeben sechs Löcher (x = 0, 25, 50 und y = 0, 25).
   ```python
   breite = int(input("Breite in mm: "))
   hoehe = int(input("Höhe in mm: "))
   abstand = int(input("Abstand in mm: "))
   anzahl = 0
   for y in range(0, hoehe + 1, abstand):
       for x in range(0, breite + 1, abstand):
           print(f"Loch bei x = {x}, y = {y}")
           anzahl = anzahl + 1
   print(f"Löcher: {anzahl}")
   ```
   Tests (letzte Zeile und Zahl der Zeilen „Loch bei“): 50, 25, 25 ergibt `Löcher: 6` und 6 Zeilen, die zweite `Loch bei x = 25, y = 0` (bei vertauschten Schleifen käme dort `Loch bei x = 0, y = 25`), die letzte `Loch bei x = 50, y = 25` · 100, 50, 50 ergibt `Löcher: 6` (der Stoppwert fällt genau auf einen Schritt; mit `range(0, breite, abstand)` käme 4) · 60, 40, 20 ergibt `Löcher: 12` (4 mal 3) · 45, 30, 20 ergibt `Löcher: 6` (45 und 30 sind keine Vielfachen von 20, das letzte Loch sitzt bei x = 40, y = 20) · 0, 0, 10 ergibt `Löcher: 1` (Grenzfall, nur die Ecke) · 30, 30, 40 ergibt `Löcher: 1` (Abstand größer als die Platte). Mit Abstand 0 meldet Python `ValueError`; deshalb „Abstand mindestens 1“ im Text.
   Tipps: (1) Zeichne zuerst den Plan: drei Eingaben, Zähler auf 0, Zählschleife für die Reihen, darin die Zählschleife für die Löcher einer Reihe, im inneren Rumpf Ausgabe und Zählen, danach die Anzahl. (2) Von 0 in Schritten von `abstand` bis `breite`. Der Stoppwert gehört nicht dazu: Was muss deshalb hinter `breite` stehen? (3) Die Form kennst du von „Würfelpaare“ und von Karte 2: Zähler vor beiden Schleifen, innen `anzahl = anzahl + 1`.

**Knobelaufgaben (freiwillig, zählen nicht im Fortschritt).** Nur Stoff bis Termin 06. Beide ausgearbeitet und nachgerechnet.

- **`kn-1` · „Händedruck-Runde“** (`k-1`, `code`, `data-mode="programm"`, `data-inputs="4"`).
  Text: Auf einer Feier sind n Personen, die von 1 bis n durchnummeriert sind. Jede gibt jeder anderen genau einmal die Hand. Eingelesen wird n (ganze Zahl). Ausgegeben wird jedes Paar einmal als `1 und 2` und zuletzt die Anzahl, zum Beispiel `Händedrücke: 6` für n = 4. Das Paar `2 und 1` ist dasselbe wie `1 und 2` und kommt nicht noch einmal vor.
  Vorlage:
  ```python
  # Händedruck-Runde: Jedes Paar gibt sich einmal die Hand.
  n = int(input("Wie viele Personen? "))
  # Ab hier entscheidest du.
  ```
  Musterlösung:
  ```python
  n = int(input("Wie viele Personen? "))
  anzahl = 0
  for i in range(1, n + 1):
      for j in range(i + 1, n + 1):
          print(f"{i} und {j}")
          anzahl = anzahl + 1
  print(f"Händedrücke: {anzahl}")
  ```
  Tests (letzte Zeile, dazu die Zahl der Zeilen „… und …“): 4 ergibt `Händedrücke: 6` und die Paare 1 und 2, 1 und 3, 1 und 4, 2 und 3, 2 und 4, 3 und 4 · 6 ergibt `Händedrücke: 15` · 2 ergibt `Händedrücke: 1` (das letzte Paar zählt mit) · 1 ergibt `Händedrücke: 0` (Grenzfall, keine Zeile davor) · 0 ergibt `Händedrücke: 0` · 10 ergibt `Händedrücke: 45`. Wer nur `n * (n - 1) / 2` ausgibt, besteht die Zahl, aber nicht die Zeilen der Paare.
  Tipps: (1) Schreib für n = 4 alle Paare auf und streich die doppelten. Mit welcher Person fängt die zweite Zahl bei der ersten 1 an, und bei der ersten 3? (2) Die innere Schleife fängt nicht immer bei 1 an. Ihr Startwert hängt von `i` ab. (3) Die innere Schleife beginnt bei `i + 1` und endet wie die äußere bei n.
  Für die Auflösung (nicht getestet): Es sind n · (n − 1) / 2 Paare. 4 Personen: 6, 10 Personen: 45.
- **`kn-2` · „Pythagoras-Tripel“** (`k-2`, `code`, `data-mode="programm"`, `data-inputs="20"`).
  Text: Ein Tripel aus drei ganzen Zahlen a < b < c mit a · a + b · b gleich c · c passt in ein rechtwinkliges Dreieck, zum Beispiel 3, 4, 5. Eingelesen wird eine Grenze g (ganze Zahl). Gesucht sind alle Tripel, in denen alle drei Zahlen höchstens g sind. Ausgegeben wird jedes Tripel als `3 4 5` und zuletzt `Tripel: 6` (für g = 20).
  Vorlage:
  ```python
  # Pythagoras-Tripel bis zu einer Grenze.
  grenze = int(input("Grenze: "))
  # Ab hier entscheidest du.
  ```
  Musterlösung:
  ```python
  grenze = int(input("Grenze: "))
  anzahl = 0
  for a in range(1, grenze + 1):
      for b in range(a + 1, grenze + 1):
          for c in range(b + 1, grenze + 1):
              if a * a + b * b == c * c:
                  print(f"{a} {b} {c}")
                  anzahl = anzahl + 1
  print(f"Tripel: {anzahl}")
  ```
  Tests (letzte Zeile und Zeilen der Tripel): 20 ergibt `Tripel: 6` mit 3 4 5, 5 12 13, 6 8 10, 8 15 17, 9 12 15, 12 16 20 · 5 ergibt `Tripel: 1` (c = 5 liegt genau auf der Grenze) · 4 ergibt `Tripel: 0` (Grenzfall) · 13 ergibt `Tripel: 3` (3 4 5, 5 12 13, 6 8 10) · 25 ergibt `Tripel: 8` · 30 ergibt `Tripel: 11`. Mit nur zwei Schleifen geht es nicht ohne Wurzel; die drei Schleifen sind der Weg ohne neues Werkzeug.
  Tipps: (1) Du suchst drei Zahlen, also braucht der Vergleich drei Schleifen ineinander. (2) Du musst keine Wurzel ziehen: Probier jedes c aus und prüf, ob a · a + b · b genau c · c ergibt. (3) Wenn die Schleifen von `a + 1` und `b + 1` beginnen, kommt jedes Tripel nur einmal vor, und a < b < c ist von selbst erfüllt.

## H. Videos (je etwa 2 bis 2,5 Minuten; hier nur der Inhalt, kein Sprechertext)

**Theorie (Lerneinheit, Abschnitt 1): „Vierergruppen und Hex-Ziffern“.** Von den 16 Zeilen der Wahrheitstabelle zu den 16 Ziffern 0 bis F; `1110 0010` wird gruppenweise zu E2; E2 wird mit den Stellenwerten 16 und 1 zu 226; zum Schluss die Farbe `#E2001A` als drei Bytes.

**Python-Werkzeugkasten (Labor, Station 1): „range mit Schritt, Schleife in Schleife, nachprüfen“.** Karte 1 zeigt die Sprünge mit `range(0, 11, 5)`, den Countdown mit `range(5, 0, -1)` (und `range(10, 0, -3)` nur zum Lesen) und dass der Stoppwert fehlt; Karte 2 lässt die Schleife in der Schleife laufen und zeigt, dass `j` neu beginnt; Karte 3 prüft `E2` mit `int("E2", 16)` und `hex()` und XOR mit `^`.

**Vorgerechnet (Labor, Station 2): „Kino“.** Plan mit der Raute in der Raute neben dem Code; die drei Stellen vor beiden Schleifen, im inneren Rumpf und nach beiden werden markiert; ein Lauf mit 2, 3 und sechs Plätzen, dazu 1, 1, 1.

Abschnitte 2 bis 4 haben kein eigenes Theorie-Video. Sie leben von den Bausteinen, den Vorhersagen und von „Schritt für Schritt“.

## I. Ablaufplan für den Dozenten

Jeder 30-Minuten-Block verplant höchstens 28 Minuten, der letzte Block (25 Minuten) höchstens 24. Die Minuten eines Abschnitts enthalten das Zeigen der genannten Karte. Hier im Zuschnitt mit der Pause; in der App laufen die Minuten wie in Termin 05 ohne sie durch (0–10, 10–40, 40–70, 70–100, 100–125, Titel „Ablauf des Termins (125 Minuten)“), und die Pause wird nicht erwähnt.

| Minuten | Wo | Was |
|---|---|---|
| 0–10 | Papier, Beamer | **Warm-up.** Training-05-Tabelle „Umrechnen“ auf Papier (5), Auflösung (2). Brücke: Wie lang wäre Zeile 5, wenn jede Vierergruppe eine Ziffer wäre? (3) |
| 10–40 | Lerneinheit 1 | **Theorie: das Hexadezimalsystem.** Brücke: 16 Werte, Buchstaben A bis F, Tabelle der Vierergruppen, Vorhersage „Wie viele Bit in einer Ziffer?“ (4). binär → hex: `1110 0010` an der Tafel, `0011 1100` per Zuruf, hex → binär `A7` (5). hex → dezimal: `E2` mit 16 und 1 (4). dezimal → hex über binär: 200 (3). Baustein „Hex-Farbmischer“ mit Vermutung, das DHBW-Rot (5). Alle rechnen die Übung „Hexzahlen umrechnen“ auf Papier, Prüfen in der Übung (5). Verplant: 26. Die Karte zum Nachprüfen kommt erst in Block 4. |
| 40–70 | Lerneinheit 2, Labor 1 (Karte 1), 5 | **Programmieren 1: Schrittweite.** Rückgriff Raketenstart mit `while` (2). Countdown mit `for` und `range(5, 0, -1)`, Plan mit der Schrittweite, Karte 1 (5). Vorhersage „Wo endet der Countdown?“ (3). Sprünge vorwärts: Hausnummern, alle 5 Minuten, Lochreihe an der Tafel (4). Vorhersage „Ein Zeichen vergessen“ (3). Alle lösen „Säulenreihe in 3D“ (10). Verplant: 27. |
| 70–80 | – | **Pause** (nur im Zuschnitt). |
| 80–110 | Lerneinheit 3, Labor 1 (Karte 2), 4 | **Programmieren 2: Schleife in Schleife.** Sitzplan an der Tafel: Plan und Code, „Schritt für Schritt“, Karte 2 (5). Baustein „Schleife in Schleife“ mit Vermutung 12 (4). Vorhersage „Wer läuft schneller?“ (2). Würfelpaare, Summe 7: Plan und Code, 6-mal (5). Vorhersage „Zähler im äußeren Rumpf“ (2). Alle zeichnen die „Einmaleins-Tafel“ (10). Verplant: 28. Stationen 2 und 3 laufen nicht einzeln. |
| 110–135 | Lerneinheit 4, Labor 1 (Karte 3), 6 | **Theorie: XOR.** Logik-XOR, Wahrheitstabelle neben UND und ODER, Treppenhauslicht, Vorhersage „Wann ist XOR wahr?“ (6). Bitweise: erst 4 Bit an der Tafel, dann ein Byte (4). Alle lösen „Bits verknüpfen“ (5). Baustein „XOR-Geheimschrift“ mit Vermutung, `HALLO` und `ELAAB` (6). Karte 3: So prüfst du nach (1). Auftrag für zu Hause, Pflicht, zusammen 47 Minuten: Stationen 2 und 3 (12), Selbstcheck (7), Training (28) (2). Termin 07 beginnt mit dem Umrechnen aus dem Training. Verplant: 24. |

Wenn die Zeit knapp wird: Im Block 10–40 entfällt zuerst das Prüfen in der Übung (Hausaufgabe), die Hexzahlen werden nur auf Papier gerechnet und an der Tafel aufgelöst. Im Block 40–70 wird die Säulenreihe gemeinsam am Beamer geschrieben statt einzeln (der Plan an die Tafel, die Schleife Zeile für Zeile). Im Block 80–110 wird „Einmaleins-Tafel“ gemeinsam am Beamer gezeichnet statt einzeln. Im letzten Block entfällt zuerst „Bits verknüpfen“ (Hausaufgabe, sie ist die Hälfte der Papierübung des Blocks), dann Karte 3; der Baustein hat Vorrang, weil er das Verschlüsseln zeigt.

Die drei Klausurformen im Termin: Plan zeichnen (Station 4, Block 3), Plan in Code übertragen (Station 5, Block 2), Code lesen (Vorhersagen in jedem Block). Zu Hause dazu: Ablauf verfolgen (Station 3), Plan in Code im Klausurmodus (Training 2), Fehler finden (Training 3).

---

# Bewusst weggelassen

**Zahlensysteme und Bits**
- Hexzahlen mit mehr als zwei Ziffern umrechnen: kein neuer Gedanke, nur längere Rechnung (Konzept).
- Dezimal → hex direkt mit Division durch 16 und Rest: ohne `//` und `%` und mit dem Umweg über binär nicht nötig (entschieden).
- `0x`, `0b`, `hex()`, `bin()`, `int("E2", 16)`, `&`, `|`, `^` in Aufgaben, Tests und Klausur: entschieden, nur in Karte 3 zum Nachprüfen. `int("11100010", 2)` und `format(…, "08b")` stehen nicht einmal dort.
- Schiebe-Operatoren `<<` und `>>`, bitweises NICHT `~`, NAND, NOR, Bitmasken: Termin 06 hat dafür keine Zeit, und es sind neue Ideen. UND und ODER auf Bits mit einer Maske („nur diese vier Bit lassen“) kommen auch in Termin 07 nicht vor (dort ausdrücklich weiter verschoben, später).
- Zweierkomplement und negative Zahlen: Termin 07, nur als Idee.
- Zeichencodes (ASCII, Unicode): T6. Die Geheimschrift nimmt A = 1 bis Z = 26, damit keine Tabelle nötig ist.
- Starke Verschlüsselung, Schlüssellänge, Angriffe auf XOR, Einmalschlüssel: Ein Hinweis, dass XOR mit einem kurzen, wiederholten Schlüssel leicht zu knacken ist, steht nicht im Text. Der Baustein zeigt nur das Prinzip.
- Farben mit Alpha (`#E2001AFF`), Kurzschreibweise `#F00`, `rgb(…)`: nicht nötig.

**Python**
- `break`, `continue`, `while True:`: bleiben draußen (wie bisher).
- `end=""`, `"*" * n`, Muster aus Zeichen (Rechteck, Dreieck aus Sternchen): entschieden. Die Beispiele geben ganze Zeilen aus.
- Text zusammenbauen mit `+` (`zeile = zeile + …`): nicht eingeführt; deshalb ohne die Knobelaufgabe „Pyramide“ aus dem Konzept (Frage 5).
- Schrittweiten außer `-1` selbst schreiben (`-2`, `-3`): werden nur gelesen. Schrittweite 0 und Kommazahlen als Schritt: `range` kennt keine Kommazahlen, der `TypeError` wird nicht gezeigt.
- Drei Schleifen ineinander in Pflichtaufgaben: nur in der Knobelaufgabe „Pythagoras-Tripel“.
- Schleifen mit `while` ineinander oder `for` in `while`: nicht nötig; Termin 07 beginnt mit Funktionen.
- `import` erklären: In Station 5 steht `from bauteil3d import *` in der Vorlage und wird nicht erklärt (nur als „holt die Werkzeuge“). In der Klausur wird `bauteil3d` nicht vorausgesetzt (`KONZEPT.md`, Abschnitt 70).
- Das Pyramidenmuster, Primzahlen (braucht `%`), `sum()` und Listen: Listen kommen in P7.

**Aufbau und Umfang**
- Ein Baustein für Abschnitt 2: Drei Bausteine genügen, und „Schritt für Schritt“ zeigt den Countdown. Ein „range von Hand“ aus Termin 05 mit Schrittweite wäre eine Erweiterung (3 Schalter statt 2), aber ein vierter Baustein.
- Eine zweite XOR-Station im Termin und ein XOR-Training: Station 6 und Selbstcheck 6 genügen (Frage 4).
- Parsons-Aufgabe und Lückentext: In Termin 06 gibt es keinen Platz mehr, die Stationen sind voll; beide Typen können in Termin 07 wieder vorkommen (Funktionen).
- Eine Station „Ausgabe vorhersagen“ im Labor: Die Vorhersagen der Lerneinheit und Selbstcheck 5 decken das ab.
- Theorie-Videos zu den Abschnitten 2 bis 4: Die Bausteine, Vorhersagen und „Schritt für Schritt“ zeigen den Ablauf.
- Der Plan mit „Unterprogramm“ und `def`: Termin 07.

---

# Technische Voraussetzungen

Belegt heißt: im Code gelesen (Datei:Zeile) oder mit Node und Python im Scratchpad getestet, ohne das Repo zu verändern. Nicht ausprobiert ist ausdrücklich gesagt.

1. **Dateinamen `explorables-v06.js` und `v06.css` sind belegt (Pflicht, ca. 1–2 Stunden).** `site/assets/js/explorables-v06.js` (466 Zeilen) ist der Baukasten der alten V06 (Kopfkommentar Z. 1–8: Abkühlkurve live mit eigener fest verdrahteter PAP-Zeichnung, Newton-Treppe). Keine Seite unter `app/inhalte/`, `app/src` oder `app/skripte` lädt ihn oder `v06.css`; es gibt nur Treffer in den Build-Ordnern (`app/dist*`, erzeugt) und in `docs/PAP-EDITOR.md:13, 78`, wo steht, dass er unverändert bleibt und ein Beispiel der alten V06 enthält. `site/assets/css/v06.css` (48 Zeilen) enthält wie die alte V05 eigene `.pap`-Regeln (Z. 9, `max-width: 440px`), die mit den Plan-Regeln aus `v05.css` (Z. 8–12, `.pap-wrap`, `.pap`) kollidieren würden. Vorschlag wie bei V05: Beide Dateien durch den neuen Inhalt ersetzen (altes Material darf weg), in `v06.css` nur neue `.v06-…`-Regeln. Die Plan-Regeln lädt jede neue Seite über `v05.css` mit (`app/src/lib/mdx/bausteine.mjs:194`: „Die Seite braucht v05.css“), also bindet V06 beide Stylesheets ein (`v05.css` für die Pläne, `v06.css` für die Bausteine) und `explorables-v06.js`. `docs/PAP-EDITOR.md` (Z. 13 und das Beispiel Z. 78 `v06-gerade-summe`) nachziehen.
2. **Schrittweite in der Raute des Plan-Editors (Pflicht, ca. 0,5 Stunden plus Test).** Belegt: `forText` (`site/assets/js/pap-engine.js:379–395`) beschriftet nur `range` mit einer und zwei Zahlen. Mit drei Argumenten gibt Zeile 389 (`args.length > 2`) den Rohtext zurück: „i in range(5, 0, -1)?“, getestet auch für `range(0, 11, 2)`. Die Code-Erzeugung ist für drei Argumente richtig (`pap-engine.js:343–361`, `condOf` und `lineOf`, getestet). Nötig: für drei Argumente mit Zahlen den Text „i von 5 bis 1, Schritt −1“ (Endwert = Stoppwert − Vorzeichen des Schritts), für `range(0, hoehe + 1, abstand)` den Text „y von 0 bis hoehe, Schritt abstand“ (der `pl`-Fall in Z. 390 funktioniert auch für den Endwert, der Schritt wird als Text übernommen); Test in `app/skripte/tests/pap-engine.test.mjs`. Nebenbei: `range(5, 0)` ergibt dort „i von 5 bis −1“. Formal richtig, aber irreführend; da Python-Code nichts meldet und in der Aufgabe nur selten vorkommt, bleibt es (oder nur mit Hinweis). Im `<Plan>` (`bausteine.mjs:63–101`, Schleifen-Zweig Z. 80–83) wird das Schleifen-Label wörtlich gezeichnet; dort steht „Schleife: i von 5 bis 1, Schritt −1?“ von Hand, nichts ist zu bauen. Der Entscheidungstext im `<Plan>` wird ohne `nice()` gezeichnet (Z. 79–90): „>=“ statt „≥“ wie im Editor. Das ist eine kleine Inkonsistenz ohne Folgen für Termin 06, weil kein neuer Vergleich vorkommt.
3. **trace: Groß- und Kleinschreibung bei Hex (Pflicht, ca. 0,5–1 Stunde).** Belegt: `normVal` (`site/assets/js/aufgaben.js:897`) fasst Leerraum zusammen und ersetzt Anführungszeichen, unterscheidet aber Groß- und Kleinschreibung. `E2` und `e2` gelten als verschieden. Python schreibt Hex klein (`hex(226)` ergibt `0xe2`, in Karte 3 zu sehen). Vorschlag: ein Schalter an der Aufgabe wie `leerzeichen: false` (`aufgaben.js:907–911`, Fingerabdruck Z. 958, `app/skripte/pruefe-stand.mjs:381, 452–458`), etwa `gross: false` („Groß- und Kleinschreibung zählt nicht“), der vor dem Vergleich beide Seiten in Großbuchstaben bringt; in den Fingerabdruck und in `pruefe-stand.mjs` aufnehmen. Ohne den Schalter müsste der Text „Großbuchstaben“ verlangen (Frage 3). Den Schalter `leerzeichen: false` für „Hexzahlen umrechnen“, Training 1 und Station 6 gibt es schon (Termin 05, `tr-1.daten.json`).
4. **Schleife in Schleife: Plan, Editor, Ablauf verfolgen, Schritt für Schritt (nichts zu bauen).** Belegt und getestet (ohne Browser): Die Zählschleife in der Zählschleife (Raute in der Raute) funktioniert im Editor (`toPap` rekursiv, `pap-engine.js:402–416`, Code-Erzeugung `toLines :343–361`, Test: for in for in while, 8 Knoten, 10 Kanten, richtiger Python-Code, SVG ok; optisch nicht geprüft) und im `<Plan>` (Rumpf über 2 Leerzeichen je Ebene, `bausteine.mjs:63–101`; Schleife in Schleife und Schleife mit Entscheidung im Rumpf getestet). Vorlage: `app/inhalte/v05/lerneinheit.mdx:332–340`. Die Station 4 einmal im Editor durchklicken („In die Schleife einfügen“ in den Rumpf der ersten Schleife; nicht ausprobiert). „Schritt für Schritt“ (`site/assets/js/viz.js`): geht; echte Ablaufverfolgung mit `sys.settrace` (ab Z. 30), verschachtelte `for`-Schleifen laufen, Grenze 1000 Schritte und 5 Sekunden (Z. 6). Würfelpaare (36 Durchläufe, 36 · 3 Zeilen) bleiben darunter. Die Aufgabenart `trace` ist handgeschriebene JSON-Konfiguration (`aufgaben.js:899–905`, `cfg.code`, `cfg.vars`, `cfg.steps`); zwei geschachtelte `for` gehen, solange jede Zeile ihre Schritte hat (Station 3: 15 Schritte, nachgeprüft). Es gibt keine Frame-Anzeige (Spalten sind flach, `aufgaben.js:920–1000`), das ist hier nicht nötig, weil keine Funktionen vorkommen.
5. **Tests für geschachtelte Schleifen und Schrittweite mit festen Eingaben (Regel für die Autoren, ca. 1 Stunde).** Wie in Termin 05, Technische Voraussetzung 5: Liest ein Programm zu viele Eingaben, endet der Testlauf mit `EOFError` und dem Hinweis „Das Programm wollte mehr Eingaben lesen, …“ (`aufgaben.js:210, 117`); liest es zu wenige, merkt es niemand. Deshalb in jedem Test, dass der letzte Wert zählt, und bei zwei Schleifen für beide Grenzen (Würfelsumme 12, Einmaleins 3 und 4, Lochraster 100, 50, 50, Händedruck mit 2 Personen). Eingabeaufforderungen enthalten hier Zahlen („Reihe 2, Platz 1“): Tests werten die letzte Zeile aus oder überspringen die Aufforderungen (Einmaleins: nur Zeilen, die reine Zahlen sind), nie `zahlen()` über die ganze Ausgabe. Die Grenzen sind in „Fehler 2: range ohne Schritt“ prüfbar: Die Schleife läuft nie, die Ausgabe hat nur `Los`.
6. **Endlosschleifen.** Nur `for` über `range`: endet immer. Der Schutz aus Termin 04 (`aufgaben.js:154–158`, `_MAX_ZEILEN = 200000`) bleibt. Ein Schritt von 0 endet sofort mit `ValueError: range() arg 3 must not be zero`, kein Hängen. Das Lochraster (Abstand mindestens 1) und die Pythagoras-Knobelaufgabe (bei Grenze 30 nur 4 060 Durchläufe der innersten Schleife, da a < b < c) bleiben weit unter der Zeilengrenze von 200 000.
7. **Bausteine `hexfarbe`, `doppelschleife`, `xorschrift` (zusammen ca. 2 Tage).** `hexfarbe` etwa 5 Stunden: Schieberegler und Zahlfelder, Hex-Eingabefeld mit Prüfung, Bits in Vierergruppen, Farbfläche mit Text („Rot 226, Grün 0, Blau 26“) für Menschen ohne Farbsehen oder mit Bildschirmleser. `doppelschleife` etwa 6 Stunden: Schritt-Mechanismus und Markierung der aktiven Zeile aus dem Baustein `summe` in `explorables-v05.js` übernehmen, dazu das Raster und der Würfelmodus. `xorschrift` etwa 5 Stunden: Rechenkern `xor5(wort, schluessel)` mit Buchstabe, Zahl, Bits, „?“ bei 0 und 27 bis 31. Rechenkern ohne DOM oben in der Datei, Test `app/skripte/tests/explorables-v06.test.mjs` nach dem Muster von `explorables-v05.test.mjs` (Werte: `HALLO` mit 13 ergibt `ELAAB`, mit 22 ergibt `?WZZY`, zweimal ergibt `HALLO`).
8. **3D-Vorschau in einer Aufgabe (nur wenn Frage 1 mit Ja beantwortet wird, ca. 1–2 Stunden plus 0,5 Stunden Doku).** Geprüft im Code, im Browser nicht ausprobiert: (a) Das Modul wird über `data-files` an der Aufgabe geladen (`aufgaben.js:563, 655, 862`, auch im Testlauf; das Attribut läuft über `...rest` in der Aufgabe-Komponente, `bausteine.mjs` etwa Z. 301); der Pfad `../assets/py/bauteil3d.py` löst sich gegen `/lektionen/v06-labor.html` auf (`kurs.js:807`), die Datei wird ins Arbeitsverzeichnis geschrieben (`kurs.js` etwa Z. 476–487, `PATH_PY` nimmt das Arbeitsverzeichnis in `sys.path`), `app/skripte/assets-kopieren.mjs` kopiert `site/assets` komplett, `dist/assets/py/bauteil3d.py` ist vorhanden. Referenzmuster: `site/werkzeuge/labor-test.html:96–101` (nicht veröffentlicht). (b) Die Vorschau: `bauteil3d.py:263–275` ruft `kursausgabe.zeige("3d", …)`, `kurs.js` etwa Z. 400–416 registriert es im Worker immer, `renderRich` für `3d` lädt `vorschau3d.js` und die CSS relativ zu `kurs.js` (`kurs.js` etwa Z. 1066–1073, `rel` Z. 991); three.js liegt lokal (`vorschau3d.js:8–18`), die Content-Security-Policy `script-src 'self'` reicht. Voraussetzung: Die Labor-Seite bindet `kurs.js` ein (steht im Kopf von `app/inhalte/v01/labor.mdx` und `v05/labor.mdx`). Im Testmodus wird die Vorschau ohne Handler verworfen, ohne Fehler. (c) Das alte V20 (`explorables-v20.js:299, 325, 454–459`) nutzt dasselbe Muster; keine Aufgabe in `app/inhalte` oder `app/src` verwendet `bauteil3d` bisher (0 Treffer). (d) Tests laufen im selben Namensraum wie der Schülercode (`aufgaben.js` etwa Z. 314, `exec(tests_src, ns)`), dürfen also `reihe` und `import bauteil3d` direkt nutzen: `abmessungen(reihe)` (Bounding Box) und `volumen(reihe)` gegen den facettierten Sollwert, nicht gegen π · r² · l (2 349,5 statt 2 356,2 mm³ je Säule, 0,3 % Unterschied). Risiken: Eine fehlende Datei meldet „ModuleNotFoundError … import vergessen?“ (`aufgaben.js` etwa Z. 121), irreführend, wenn `data-files` fehlt. Der erste Lauf lädt Pyodide (ca. 10 MB; `bauteil3d` braucht nur `json` und `math`). `docs/3D-VORSCHAU.md` zeigt nur das V20-Klassenbeispiel; ein Aufgabenbeispiel ergänzen. Im Konzept (`briefing/termin-06-07-konzept.md:85`) steht `bauteil3d` mit Parametern erst in Termin 08; die Station in Termin 06 braucht nur Aufrufe ohne `def` (`:92` verlangt die P3-Aufgabe laut `KONZEPT.md` Z. 56, 70), aber den Satz sollte der Dozent einmal bestätigen.
9. **Aufwand Werkzeuge.** Punkte 1 bis 3, 5 und 7: etwa 2,5 Tage; Punkt 8 (nur bei Ja) dazu 0,5 Tage. Ohne die Pflicht-Punkte 1 bis 3 sind weder die Schrittweite im Editor noch die Hex-Aufgaben noch die neuen Bausteine baubar.
10. **Gebaut werden danach:** `kurs.yaml` (Eintrag V06 mit `aktiv: false`, `lektion: V06` bei Termin 6, Titel, kurz, hook, python), `app/inhalte/v06/lerneinheit.mdx` mit `lerneinheit/hex-uebung.daten.json`, `app/inhalte/v06/labor.mdx` (`zuhause` aus den Stationen) mit den Aufgaben `w-vorgemacht`, `w-trace`, `w-plan`, `w-3d` (oder die Variante ohne 3D), `w-bits`, `tr-1` bis `tr-4`, Knobel `k-1` und `k-2` (je `.vorlage.py`, `.tests.py`, `.solution.py`, Pläne und Daten als `.json`), `explorables-v06.js`, `v06.css`, `docs/PAP-EDITOR.md`, `KONZEPT.md` (Zweierkomplement und Termin 06 stehen schon im Abschnitt 123).

---

# Entscheidungen des Dozenten (2026-11-27)

Alle sechs Fragen unten sind mit der Empfehlung beantwortet: (1) Säulenreihe in 3D als Station 5, aber nur, wenn der 3D-Lauf vorher im Browser klappt; sonst die Variante „Lochreihe“ mit `print`; (2) Geheimschrift zeigt Zahl und Bits, als Buchstabe nur, wo es einen gibt, sonst „?“, entschlüsselt wird mit den Zahlen; (3) in Eingabefeldern zählt Groß- und Kleinschreibung bei Hex nicht (Schalter, Technische Voraussetzung 3), die Klausur verlangt Großbuchstaben; (4) UND, ODER, XOR als Wörter, kein ⊕, XOR nicht im Training; (5) Knobelaufgaben „Händedruck-Runde“ und „Pythagoras-Tripel“; (6) Raute „i von 2 bis 19, Schritt 3?“ („bis“ heißt „nicht weiter als“), selbst geschrieben nur positive Schritte und −1. Die Überschrift oben („Entwurf zur Bestätigung“) und alle „zu bestätigen“ gelten damit als erledigt.

# Offene Fragen an den Dozenten (beantwortet, siehe oben)

1. **3D-Aufgabe in Termin 06 (Station 5, Säulenreihe).** `KONZEPT.md` verlangt in P3 eine Aufgabe mit sichtbarem Ergebnis (Turm oder Lochreihe aus Körpern). Die 3D-Vorschau ist in der neuen App nutzbar (Technische Voraussetzung 8). Die Aufgabe nutzt `range(25, 101, 25)` und `reihe = vereinige(reihe, verschiebe(zylinder(10, 30), x))`, also drei Funktionsaufrufe und `from bauteil3d import *` aus der Vorlage; das sind neue Wörter (`import`, Funktionen aus einer Bibliothek), aber ohne `def`. Empfehlung: Ja, als Station 5 im Block 40–70, weil die Schrittweite dort sichtbar wird (Spalte für Spalte statt nur Zahlen). Risiken: Die Station ist die einzige Übung „Plan in Code“ im Termin und hängt an `bauteil3d`, das in der Klausur nicht vorausgesetzt wird; die Lösung verschachtelt drei Aufrufe plus `from bauteil3d import *`, und im selben Block ist die Schrittweite neu (zwei neue Dinge auf einmal); der erste 3D-Lauf im Hörsaal ist im Browser nicht ausprobiert, und Pyodide lädt bei 25 Geräten. Alternativen: (a) Nein; Station 5 als „Lochreihe“ mit `print` (klausurnah, ohne `import`, Variante unter Station 5), die 3D-Aufgabe in Termin 07 oder 08, wo Funktionen und Parameter kommen. (b) Ja, aber entschärft: Die Rumpfzeile steht schon in der Vorlage, geschrieben wird nur die `for`-Zeile; die `print`-Lochreihe kommt als Ausbau oder zu Hause. Die Empfehlung Ja gilt nur, wenn der 3D-Lauf vorher einmal im Browser geprüft ist; sonst (a).
2. **Geheimschrift: Ergebnisse 0 und 27 bis 31.** Mit 5-Bit-Schlüsseln liegen Ergebnisse auch bei 0 und 27 bis 31, dafür gibt es keinen Buchstaben (zum Beispiel `HALLO` mit Schlüssel 22 ergibt `?WZZY`). Empfehlung (Festlegung 10): Der Baustein zeigt den Geheimtext als Zahl und Bits und als Buchstabe nur, wo es einen gibt (sonst „?“), und entschlüsselt mit den Zahlen. Das zeigt, dass XOR mit allen 32 Mustern rechnet, nicht nur mit Buchstaben. Alternative: nur Zahlen und Bits zeigen (keine Buchstaben im Geheimtext), oder die Wörter so wählen lassen, dass nie ein „?“ vorkommt (für ein Wort gibt es gute Schlüssel, für beliebige Eingaben nicht).
3. **Groß- und Kleinschreibung bei Hex in Aufgaben.** Python schreibt `0xe2` klein, die Klausur und die App `E2`. Empfehlung: In Eingabefeldern zählt die Schreibweise nicht (Schalter, Technische Voraussetzung 3, ca. 0,5–1 Stunde); die Klausur verlangt weiter Großbuchstaben. Alternative: nur Großbuchstaben annehmen und im Text „Großbuchstaben“ verlangen.
4. **Wie steht XOR in Text, Klausur und Training?** Vorschlag (Festlegung 4): UND, ODER, XOR als Wörter, bitweise Verknüpfung zweier Bytes (8 Stellen, zwei Vierergruppen) auf Papier als Klausurform, `&`, `|`, `^` und das Zeichen ⊕ kommen nicht vor. Das Training enthält keine XOR-Zeile; XOR üben Station 6 im Termin und der Selbstcheck 6 („weniger ist mehr“, das Warm-up von Termin 07 ist Hex). Empfehlung: so. Alternativen: ⊕ als Zeichen (in Lehrbüchern üblich) einführen und in der Klausur zulassen, dann braucht es einen Satz in Abschnitt 4; oder Training 1 mit zwei XOR-Zeilen (dann Hex nur 6 Zeilen), damit XOR im Warm-up von Termin 07 wiederholt wird.
5. **Knobelaufgaben statt „Pyramide“.** Die Pyramide aus dem Konzept braucht `zeile = zeile + f"{j} "`, also Text mit `+`, nicht eingeführt. Empfehlung: „Händedruck-Runde“ (die innere Grenze hängt von `i` ab) und „Pythagoras-Tripel“ (drei Schleifen ineinander, 6 Tripel bis 20). Alternative: Die Pyramide mit einer kurzen Einführung der Textverkettung in der Knobelaufgabe selbst (Tipp 2), dann zählt sie nicht mehr als „nur bisheriger Stoff“; oder nur eine Knobelaufgabe (Händedruck).
6. **Regeln zur Schrittweite (Festlegungen 5 und 6).** (a) Beschriftung der Raute: Bei `range(2, 20, 3)` steht „i von 2 bis 19, Schritt 3“, obwohl der letzte Wert 17 ist; 19 kommt nie vor. Die Beschriftung gilt auch in der Klausur (Plan zeichnen, Plan in Code übertragen). Empfehlung: „bis“ heißt „nicht weiter als“ (Stoppwert − 1), im Text einmal an diesem Beispiel erklärt; bei Variablen („x von 0 bis breite, Schritt abstand“) ist das die natürliche Lesart. Alternativen: „i von 2, kleiner als 20, Schritt 3“ (ehrlicher, aber nicht parallel zu Termin 05), oder in Plänen nur Bereiche, deren Stoppwert auf einen Schritt fällt, und `range(2, 20, 3)` nur in Code-lesen-Aufgaben. (b) Negative Schritte: Selbst geschrieben werden nur `-1` und positive Schritte, `-2` und `-3` werden nur gelesen. Empfehlung: so.
