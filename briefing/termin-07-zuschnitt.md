# Zuschnitt Termin 07 (Entwurf zur Bestätigung)

Aufbau und Ton wie `briefing/termin-05-zuschnitt.md`. Grundlage ist `briefing/termin-06-07-konzept.md` mit den Entscheidungen des Dozenten vom 2026-11-27: Zweierkomplement nur als Idee ohne Umrechnen, Kommazahlen mit `round(x, 2)` vergleichen und Testdaten ohne 5 an der Rundungsstelle, `def` ohne und mit Parameter, dann `return` und `print` gegen `return`, `str`, `bool`, Umwandlung und `TypeError` erst in Termin 08. Alle Zahlen, Programme, Ausgaben, Fehlermeldungen und Testdaten sind mit Python 3.13 nachgerechnet (Pyodide 0.26.4 ist Python 3.12; die genannten Meldungen sind in beiden gleich). Wo dieses Papier „zu bestätigen“ sagt, liegt die Entscheidung beim Dozenten (Liste am Ende, höchstens 6 Fragen).

## Aufteilung

| Einheit | Termin 07 |
|---|---|
| T5 Datentypen, Teil 1 von 3 | Block 1: Datentyp und Wertebereich, Überlauf, Vorzeichen als Idee (Zweierkomplement ohne Umrechnen), Python-Ganzzahlen laufen nie über |
| P4 Funktionen, Teil 1 und 2 von 6 | Block 2: `def` ohne und mit Parameter, Aufruf, Unterprogramm im Plan. Block 3: `return`, `print` gegen `return` (`None`) |
| T5 Datentypen, Teil 2 von 3 | Block 4: `int` gegen `float`, `0.1 + 0.2`, der Grund, `round(x, 2)` vor dem Vergleich, Endlosschleife mit Kommazahl |

Beispielwelt: Theorie der Kilometerzähler, der 8-Bit-Zähler (alte Spiele) und der Werkstückzähler einer Maschine. Programmieren Alltag und Spiele (Trennlinie, Begrüßung, Spielstand, Umrechner, Rabatt). Maschinenbau dort, wo es natürlich passt: der Zähler einer Anlage mit 16 Bit (Knobelaufgabe) und das Training „Zylinder“.

Reihenfolge wie im Konzept. Die Pause liegt zwischen Block 2 und Block 3 (nur hier im Zuschnitt). Block 4 fasst alles Kommazahlige zusammen: vorher kennen die Studierenden `float` nur als „Zahl mit Komma“, jetzt kommt der Grund für die Rundungsfalle.

Abweichungen vom Konzept vorweg:

- **`2 ** 64 + 1`** (Konzept, Block 1) geht, seit der Dozent am 2026-11-27 entschieden hat (Entscheidung 3): `**` steht auf einer Karte nur zum Lesen (`2 ** 8` ist `256`), die Tabelle der Wertebereiche zeigt es in einer Spalte, und `2 ** 64 + 1` ergibt `18446744073709551617` als Beleg, dass Python nicht überläuft. Davor kommen `255 + 1` ergibt `256` und `4294967295 + 1` ergibt `4294967296`. Selbst geschrieben wird `**` nicht (Festlegung 11).
- **Knobelaufgabe „Primzahl ohne `%`“** nur mit Änderung: `n / t == int(n / t)` braucht `int()` auf eine Kommazahl (Umwandlung, Termin 08). Sauber ohne `%` und ohne `int()` geht es mit zwei ineinander liegenden Schleifen (`a * b == n`), das ist zugleich eine Anwendung von Termin 06. Nachgerechnet, siehe Abschnitt G.
- **Keine Fehlersuche-Station** im Labor: Das Training enthält „Fehler finden“, und die Termin-Blöcke sind voll (Abschnitt I).

## Festlegungen für Termin 07

Es gelten alle Festlegungen aus Termin 02 bis 05 (Stationsreihenfolge von Termin 01, drei gestufte Tipps, Grenzfall in jeder Aufgabe, höchstens 28 Minuten je Block verplant, Videos laufen nicht im Termin, Pausen stehen nicht in der App, Meldungstexte ohne Gedankenstrich, Testdaten mit letztem Eingabewert, der das Ergebnis ändert). Dazu neu:

1. **Kennung V07**, Ordner `app/inhalte/v07/`, Adressen `v07-datentypen-und-funktionen.html` und `v07-labor.html`, Bausteine in `explorables-v07.js` mit `v07.css`. Beide Dateinamen sind belegt (alte V07 „Zerlegung und Funktionen“): Technische Voraussetzung 1. In `kurs.yaml` bekommt `termine` bei `nr: 7` den Zusatz `lektion: V07`, der Eintrag unter `lektionen` zunächst mit `aktiv: false`.
2. **Wörter (Theorie):** Datentyp, `int`, `float`, Wertebereich, Überlauf, Vorzeichen. „Zähler läuft über“ sagt man auch in der Technik, „Überlauf“ ist der Fachbegriff. Das Zweierkomplement wird nicht als Wort eingeführt: Es heißt „mit Vorzeichen“, das oberste Bit zählt −128. Wer den Fachbegriff hören will, bekommt ihn vom Dozenten mündlich, er steht nicht im Selbstcheck.
3. **Zweierkomplement nur als Idee.** Gezeigt wird die Tabelle der Bytes mit Vorzeichen und der Zahlenkreis. Es gibt keine Regel „Bits kippen und 1 addieren“, keine Aufgabe, in der jemand ein Byte mit Vorzeichen umrechnet, und im Selbstcheck nur Verständnisfragen („nach 127 kommt −128“, „der Bereich reicht von −128 bis 127“). Wer den Wert von `1111 1111` wissen will, liest ihn im Baustein ab. Frage 5.
4. **Python läuft nicht über.** Jede Stelle, an der ein Überlauf gezeigt wird, sagt dazu, dass Python-Ganzzahlen mitwachsen (`255 + 1` ergibt `256`). Der Überlauf wird an Zähler, Zahlenkreis und Zeigerbild erklärt, nie an Python-Code, der „falsch“ rechnet.
5. **Funktionen:** `def name(parameter):` mit Doppelpunkt und eingerücktem Rumpf (4 Leerzeichen). Der Funktionsname wird klein geschrieben, ohne Umlaute, mit Unterstrich (`kmh_in_ms`). Immer zuerst definieren, dann aufrufen (Reihenfolge in der Datei). Selbst geschrieben werden Funktionen mit höchstens zwei Parametern. Keine Standardwerte, keine Funktion, die eine andere aufruft, kein `return` mitten in einer `if`-Verzweigung, kein gemeinsamer Name für Parameter und Variable im Hauptprogramm (die Beispiele benutzen verschiedene Namen: `zahl` im Hauptprogramm, `x` in der Funktion; ebenso `endpreis(betrag, satz)`, `zeige(nr, wert)`, `gesamt(x, y)`, `volumen(r, h)`, `stunden_bis_ueberlauf(n)`). Beim Bau gegen diese Festlegung nachzählen, auch in Plänen und Lösungen. Lokale und globale Namen: Termin 08. **Wörter:** Funktion, Aufruf, Parameter, Rückgabewert, Rumpf (wie bei Schleifen). „Argument“ wird nicht verlangt, es steht „der Wert, den du beim Aufruf übergibst“.
6. **Im Plan** ist der Aufruf ein Rechteck mit Doppellinien (Symbol „Unterprogramm“, im `<Plan>` als `Unterprogramm: ergebnis = fahrenheit(celsius)`). Die Funktion hat einen eigenen kleinen Plan: Start mit dem Namen (`fahrenheit(c)`), die Anweisungen, am Ende „Rückgabe“ mit dem Wert; hat die Funktion kein `return`, endet ihr Plan mit dem normalen Ende-Symbol. Beides entsteht im `<Plan>` nach der Erweiterung in Technische Voraussetzung 2. **Der Plan-Editor bekommt den Blocktyp „Funktion“** (Entscheidung 2 vom 2026-11-27, Ausbau in Technische Voraussetzung 3): Er hat ein Feld für den Kopf (`name(parameter)`), einen Rumpf aus den bekannten Symbolen und ein Feld „Rückgabe“ (leer heißt: kein `return`). Studierende zeichnen in Termin 07 den Plan einer Funktion (Station 5). Regeln dafür: Ein Funktionsblock steht nur auf der obersten Ebene, nie in einer Verzweigung, Schleife oder anderen Funktion. Der Rückgabewert steht im eigenen Feld, nicht als Symbol im Rumpf; damit ist ein `return` mitten in einer Verzweigung (Festlegung 5) im Editor gar nicht zeichenbar. Der erzeugte Code setzt die Funktionen vor das Hauptprogramm, egal wo der Block im Plan steht. Aufgaben, die `def` freigeben, tragen `data-erlaubt="def,…"`; die Aufgaben der Termine 01 bis 06 nennen ihre Symbole ausdrücklich und bleiben unverändert.
7. **`print` gegen `return`.** `print` zeigt etwas an, `return` gibt der Stelle zurück, die aufgerufen hat. Eine Funktion ohne `return` gibt `None` zurück, das erscheint als `None` in der Ausgabe. Die Meldung `TypeError: unsupported format string passed to NoneType.__format__` (ein `None` in `{x:.2f}`) und `TypeError: begruessen() missing 1 required positional argument: 'name'` werden nur gelesen, nie erklärt (Frage 4).
8. **Kommazahlen:** `int` ist eine ganze Zahl, `float` eine Kommazahl, `/` ergibt immer `float` (`6 / 2` ist `3.0`). Das Phänomen `0.1 + 0.2` ergibt `0.30000000000000004` wird einmal gezeigt, begründet (1/3 im Zehnersystem, 0,1 im Zweiersystem, nach einer festen Stellenzahl abgeschnitten, in einem Satz „nach 52 Bit“) und dann nur noch benutzt. Folge: Kommazahlen nie mit `==` oder `!=` vergleichen, sondern vorher `round(x, 2)`. **Testdaten und Beispiele ohne 5 an der Rundungsstelle**: `round(2.5)` ist `2`, `round(0.125, 2)` ist `0.12`, `round(2.675, 2)` ist `2.67` (alle nachgerechnet). Diese Werte stehen nicht in der Lerneinheit, nur in diesem Papier.
9. **Zählen mit Kommazahlen** ist verboten: Eine Schleife zählt mit ganzen Zahlen (`for i in range(1, 11)`), nie mit `x = x + 0.1`. Die Endlosschleife `while x != 1.0` wird im Baustein gezeigt, nicht ausgeführt (Technische Voraussetzung 7).
10. **Ausgaben mit Kommazahlen** immer mit `:.1f` oder `:.2f`; die Tests vergleichen als Zahl mit Toleranz 0,05 (`:.1f`) beziehungsweise 0,005 (`:.2f`). Das rohe `0.30000000000000004` erscheint nur dort, wo es gezeigt werden soll (Block 4, Vorhersage).
11. **`**` nur zum Lesen** (Entscheidung 3 vom 2026-11-27). `**` heißt „hoch“ und steht auf Karte 1: `2 ** 8` ist `256`, `2 ** 16` ist `65536`, `2 ** 64 + 1` ist `18446744073709551617`. Es erscheint in Abschnitt 1 (Spalte „in Python“ der Tabelle und Beleg „Python läuft nicht über“) und auf der Karte. In keiner Aufgabe, Vorlage oder Lösung schreiben Studierende `**`, und im Selbstcheck gibt es keine Frage dazu. Das Wort „Potenz“ fällt nicht, es steht „hoch“. Die Knobelaufgabe zählt weiter durch Verdoppeln in einer Schleife.

---

# Termin 07

## A. Kopf

- Titel: **Was im Speicher steht: Datentypen und eigene Funktionen** (Arbeitsname aus dem Konzept, beibehalten: „im Speicher“ trifft Zähler, Vorzeichen und Kommazahlen, „eigene Funktionen“ trifft den Programmierteil)
- Vorspann: Ein Byte kann 256 Zahlen zeigen, und nach der letzten kommt wieder die erste. Heute siehst du, warum ein Zähler überläuft, warum ein Rechner 0.1 + 0.2 nicht genau rechnet und wie du eigene Befehle bauen kannst, die du immer wieder aufrufst: mit `def` und `return`.
- Lernziele:
  - sagen, was ein Datentyp ist, den Wertebereich eines Zählers aus der Zahl der Bit bestimmen (`2 ** 8` lesen können) und erklären, was bei einem Überlauf passiert (auch mit Vorzeichen: nach 127 kommt −128)
  - eine eigene Funktion mit `def` schreiben, mit und ohne Parameter aufrufen, im Plan als Unterprogramm lesen und den Plan einer Funktion zeichnen
  - mit `return` einen Wert zurückgeben und den Unterschied zu `print` erklären (`None`)
  - sagen, warum `0.1 + 0.2 == 0.3` falsch ist, und Kommazahlen mit `round(x, 2)` vergleichen
- kurz: „Datentypen, def“
- hook: „Nach 255 kommt 0“
- neu in Python (Feld `python` in `kurs.yaml`): `python: ["def name(parameter):", "return", "type()", "round(x, 2)", "2 ** n (nur lesen)"]`. Dazu `None` als Ausgabe und die Meldungen `NameError: name 'trennlinie' is not defined` (Aufruf vor `def`), `SyntaxError: expected ':'` und die zwei `TypeError`-Meldungen aus Festlegung 7. Zeichen und Namen, die nur gelesen werden: `type(…)` mit der Ausgabe `<class 'int'>`.

## B. Warm-up (0–10)

Training Termin 06, Aufgabe 1 „Umrechnen“ (`tr-1`, wie dort gestellt): acht Zeilen auf Papier (5 Minuten), Auflösung an der Tafel (2 Minuten). Hexzahlen mit zwei Ziffern, Binärzahlen in zwei Vierergruppen. Auflösung (alle Zeilen mit Python 3.13 nachgerechnet):

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

Brücke in die Theorie (3 Minuten, Frage in die Runde): Zeile 6 war `7F`, also `0111 1111`, 127. Setzt man das oberste Bit dazu, steht `FF` da, `1111 1111`, 255: die größte Zahl, die ein Byte zeigen kann. Was passiert, wenn ein Zähler aus einem Byte um 1 weiterzählen soll? Auflösung in Abschnitt 1: Er fängt wieder bei 0 an, wie ein Kilometerzähler.

## C. Lerneinheit

### Abschnitt 1 · Ganze Zahlen im Speicher (T5, Teil 1 · 10–40)

Kernaussage: Ein Datentyp sagt, wie viele Bits eine Zahl bekommt und wie sie gelesen werden. Bei n Bit gibt es 2ⁿ Werte. Ist der größte erreicht, geht es beim kleinsten weiter: Der Zähler läuft über. Block 1 hat drei Kerne: Überlauf (der Wertebereich ist nur ein kurzer Rückgriff auf Termin 05, im Termin nur die Zeile 8 Bit), Vorzeichen als Idee, Python wächst mit. Die Zeilen 16 und 32 Bit der Tabelle stehen nur in der Lerneinheit. `**` kommt hier nur zum Lesen vor (Festlegung 11, Karte 1).

- Datentyp. Ein Speicherplatz hat nur Nullen und Einsen. Erst der Datentyp sagt, was sie bedeuten. Eine ganze Zahl heißt in Python `int`. (`type(…)` zum Abfragen des Typs kommt in Abschnitt 4, dort wird es gebraucht.)
- Wertebereich: n Bit ergeben 2ⁿ Werte (Termin 05). In Python schreibt man 2ⁿ als `2 ** n` („2 hoch n“). Das liest du nur, du schreibst es nicht selbst: `2 ** 8` ist `256`. Tabelle an der Tafel, ohne Vorzeichen:

| Bit | Werte | in Python | kleinste bis größte Zahl |
|---|---|---|---|
| 8 | 256 | `2 ** 8` | 0 bis 255 |
| 16 | 65 536 | `2 ** 16` | 0 bis 65 535 |
| 32 | 4 294 967 296 | `2 ** 32` | 0 bis 4 294 967 295 |

- Überlauf. Ein Kilometerzähler mit fünf Rädern zeigt nach 99 999 wieder 00 000. Ein 8-Bit-Zähler zeigt nach 255 wieder 0: `1111 1111` plus 1 passt nicht mehr in 8 Stellen, die neunte Stelle fehlt. Beispiel: der Zähler einer Anlage, der Werkstücke zählt. Der Rechner meldet dabei keinen Fehler, er zählt einfach weiter.
- Vorzeichen als Idee. Soll ein Byte auch negative Zahlen zeigen, ändert sich nur, wie man es liest: Das oberste Bit zählt dann −128 statt +128, die anderen wie bisher. Daraus folgt der Bereich von −128 bis 127. Tabelle, nur ablesen, kein Rechenweg zum Merken:

| Byte | ohne Vorzeichen | mit Vorzeichen |
|---|---|---|
| 0000 0000 | 0 | 0 |
| 0111 1111 | 127 | 127 |
| 1000 0000 | 128 | −128 |
| 1111 1110 | 254 | −2 |
| 1111 1111 | 255 | −1 |

  Am Zahlenkreis (Baustein) sieht man es: Nach der 127 kommt −128, gleich weit wie von 255 nach 0. Ist das oberste Bit 1, ist die Zahl negativ.
- Python läuft nicht über. `print(255 + 1)` ergibt `256`, `print(4294967295 + 1)` ergibt `4294967296`: Python-Ganzzahlen wachsen mit. Der stärkste Beleg ist `print(2 ** 64 + 1)`: Es ergibt `18446744073709551617`. Die größte Zahl mit 64 Bit ist `18446744073709551615`, die Zahl davor passt in kein 64-Bit-Feld mehr, Python rechnet trotzdem richtig. Überlauf gibt es in Steuerungen, Sensoren und anderen Programmiersprachen, nicht bei `int` in Python.
- Begriffs-Hinweise (`<Begriff e="…">`): Datentyp „Sagt, wie die Bits eines Werts gelesen werden, zum Beispiel als ganze Zahl (`int`) oder als Kommazahl (`float`).“ · Wertebereich „Alle Werte, die ein Datentyp zeigen kann, von der kleinsten bis zur größten Zahl.“ · Überlauf „Der Zähler ist beim größten Wert und zählt weiter: Er springt zum kleinsten Wert zurück.“ In Abschnitt 4: Kommazahl `float` „Eine Zahl mit Komma. Der Rechner speichert sie nur mit begrenzt vielen Stellen.“

Vorhersage „Python zählt weiter“:

```python
zaehler = 255
zaehler = zaehler + 1
print(zaehler)
```

- 0
- [x] 256
- −1
- Eine Fehlermeldung

Auflösung: In Python läuft `int` nicht über. 255 + 1 ist 256. Ein 8-Bit-Zähler in einer Steuerung dagegen springt auf 0.

### Abschnitt 2 · Eigene Befehle: def und Aufruf (P4, Teil 1 · 40–70)

Kernaussage: Mit `def` gibst du einem Ablauf einen Namen. Danach rufst du ihn an beliebig vielen Stellen auf. Ein Parameter ist ein Platz für einen Wert, den du beim Aufruf mitgibst.

- Rückgriff: Du kennst Befehle wie `print` und `input`. Jetzt baust du eigene. Problem: Ein Spiel soll nach jeder Runde dieselbe Trennlinie zeigen. Dreimal dieselbe Zeile kopieren ist mühsam und fehleranfällig.
- Definieren und aufrufen:

```python
def trennlinie():
    print("--------------------")

print("Runde 1")
trennlinie()
print("Runde 2")
trennlinie()
print("Ende")
```

  Ausgabe: `Runde 1`, die Linie, `Runde 2`, die Linie, `Ende`. `def` legt die Funktion nur an, in der Zeile passiert noch nichts. Erst der Aufruf `trennlinie()` führt den Rumpf aus. Aufgerufen wird mit Klammern: `trennlinie` ohne Klammern ruft die Funktion nicht auf, Python meldet nichts, und der Rumpf läuft nicht.
- Reihenfolge: Zuerst definieren, dann aufrufen. Steht der Aufruf davor, meldet Python `NameError: name 'trennlinie' is not defined`.
- Mit Parameter:

```python
def begruessen(name):
    print(f"Hallo {name}, viel Spaß!")

begruessen("Lea")
begruessen("Tom")
```

  Ausgabe: `Hallo Lea, viel Spaß!`, `Hallo Tom, viel Spaß!`. Beim Aufruf wird `name` mit dem Wert belegt. „Schritt für Schritt“ am Codeblock zeigt, wie `name` zuerst `"Lea"`, dann `"Tom"` ist. Mehr Parameter, mit Komma getrennt: `def zeige_stand(runde, punkte):` (Station 7).
- Im Plan. Der Aufruf ist ein Rechteck mit Doppellinien (`<Plan>`, Festlegung 6):

```text
Ausgabe: "Runde 1"
Unterprogramm: trennlinie()
Ausgabe: "Runde 2"
Unterprogramm: trennlinie()
```

  Die Funktion bekommt einen eigenen kleinen Plan mit dem Namen im Start-Symbol. Der Plan einer Funktion mit `return` kommt in Abschnitt 3 (Fahrenheit-Beispiel), hier reicht der Satz „Der Aufruf im Hauptplan ist das Rechteck mit den doppelten Seitenlinien“.
- Neu im Plan: Der Aufruf einer eigenen Funktion ist ein Rechteck mit doppelten Seitenlinien. In der Norm DIN 66001 heißt es Unterprogramm. Welches Symbol für fertige Funktionen wie `round` gilt, ist offen (Frage 6): `print` und `input` bleiben Ausgabe und Eingabe.

Vorhersage „Aufruf vor der Definition“:

```python
trennlinie()

def trennlinie():
    print("--------------------")
```

- Die Linie erscheint
- [x] `NameError: name 'trennlinie' is not defined`
- `SyntaxError: expected ':'`
- Nichts, ohne Meldung

Auflösung: Python liest von oben nach unten. Beim Aufruf kennt es `trennlinie` noch nicht. Erst definieren, dann aufrufen.

### Abschnitt 3 · Etwas zurückgeben: return (P4, Teil 2 · 80–110)

Kernaussage: `return` gibt einen Wert an die Stelle zurück, die die Funktion aufgerufen hat. Dort kannst du ihn speichern oder weiterrechnen. `print` zeigt nur etwas an.

- Rückgriff: `input` gibt dir einen Wert zurück, den du in eine Variable speicherst. Das kann jetzt auch deine Funktion.

```python
def quadrat(x):
    return x * x

ergebnis = quadrat(4)
print(ergebnis)
print(quadrat(5) + 1)
```

  Ausgabe: `16`, `26`. Der Aufruf `quadrat(4)` wird durch das Ergebnis 16 ersetzt, dann geht es in der Zeile weiter. Hier kommt „Schritt für Schritt“ an den Codeblock: Aufruf, `x` bekommt 4, `return`, der Wert landet in `ergebnis`.
- Der Plan zu einem Umrechner (Celsius in Fahrenheit, `<Plan>` zweimal, Festlegung 6): im Hauptplan das Rechteck mit Doppellinien, im Plan der Funktion Start `fahrenheit(c)`, Operation `grad = c * 9 / 5 + 32`, Ende „Rückgabe grad“.
- `print` gegen `return`: Dieselbe Funktion mit `print` statt `return`:

```python
def quadrat(x):
    print(x * x)

ergebnis = quadrat(4)
print(ergebnis)
```

  Ausgabe: `16`, danach `None`. Die Funktion zeigt die 16 an, gibt aber nichts zurück. In `ergebnis` steht `None`, das heißt „nichts“. Das ist der häufigste Fehler am Anfang: Wenn du mit dem Ergebnis weiterrechnen willst, brauchst du `return`.
- Merksatz: **Anzeigen mit `print`, Weitergeben mit `return`.** Eine Funktion kann beides tun, aber nur `return` liefert einen Wert, den du speichern kannst.
- Eine Funktion im Editor zeichnen (Vorgriff auf Station 5, in der Lerneinheit nur ein Satz): Im Plan-Editor gibt es das Symbol „Funktion“. Du trägst den Kopf ein (`kmh_in_ms(v)`), zeichnest den Rumpf aus bekannten Symbolen und schreibst unter „Rückgabe“, was die Funktion zurückgibt. Der Editor macht daraus `def` und `return`.
- Begriffs-Hinweis: Unterprogramm „Das Plan-Symbol für den Aufruf einer Funktion: ein Rechteck mit doppelten Seitenlinien.“ · Funktion „Ein benannter Ablauf, den du mit `def` anlegst und mit dem Namen aufrufst.“ · Parameter „Ein Platz für einen Wert, den du beim Aufruf mitgibst.“ · Rückgabewert „Der Wert, den eine Funktion mit `return` an die aufrufende Stelle zurückgibt.“

Vorhersage „print statt return“: Was steht in `ergebnis`, wenn die Funktion mit `print` arbeitet (Programm oben)?

- 16
- [x] None
- 0
- Eine Fehlermeldung

Auflösung: Die Funktion gibt nichts zurück. `print` zeigt die 16 an, `ergebnis` bleibt `None`.

### Abschnitt 4 · Kommazahlen und ihre Genauigkeit (T5, Teil 2 · 110–135)

Kernaussage: Kommazahlen speichert der Rechner nur auf endlich viele Stellen. Manche Zahlen wie 0,1 sind im Zweiersystem unendlich lang und werden abgeschnitten. Deshalb vergleichst du Kommazahlen nie direkt mit `==`.

- `int` gegen `float` (hier kommt `type()` zum ersten Mal vor und wird gebraucht): `7 / 2` ergibt `3.5`, `6 / 2` ergibt `3.0`. `/` ergibt immer eine Kommazahl, auch wenn die Division aufgeht. `type(7 / 2)` zeigt `<class 'float'>`, `type(42)` zeigt `<class 'int'>`.
- Das Phänomen (Baustein „Kommazahl unter der Lupe“, Vermutung vorher): `print(0.1 + 0.2)` ergibt `0.30000000000000004`, und `print(0.1 + 0.2 == 0.3)` ergibt `False`.
- Der Grund, ohne Rechnen: 1/3 ist im Zehnersystem 0,333 und hört nie auf. 0,1 ist im Zweiersystem genauso unendlich lang. Der Rechner schneidet nach einer festen Zahl von Stellen ab (bei `float` nach 52 Bit), es bleibt ein winziger Rest. Halbe, Viertel und Achtel gehen genau auf: `0.5 + 0.25 == 0.75` ergibt `True`. Der Baustein zeigt dieselbe Zahl mit 20 Nachkommastellen: `0.1` ist `0.10000000000000000555`, `0.1 + 0.2` ist `0.30000000000000004441`.
- Die Folge: Runde vor dem Vergleich. `round(x, 2)` rundet auf 2 Nachkommastellen. `round(0.1 + 0.2, 2) == 0.3` ergibt `True`.

```python
a = 0.1
b = 0.2
summe = a + b
if round(summe, 2) == 0.3:
    print("Summe stimmt")
else:
    print("Summe stimmt nicht")
```

  Ausgabe: `Summe stimmt`. (Ohne `round` käme `Summe stimmt nicht`.)
- Auch Schleifen mit Kommazahlen: `while x != 1.0:` mit `x = x + 0.1` endet nie. Nach zehn Schritten steht dort `0.9999999999999999`, dann `1.0999999999999999`. Der Baustein läuft Schritt für Schritt, die Seite führt diese Schleife nicht aus. Regel: Zähle mit ganzen Zahlen (`for i in range(1, 11)`), nie mit Kommazahlen.
- Die Zahl der Stellen ist beim Runden die Wahl: `round(x, 2)` für Euro, `round(x, 1)` für Zehntel. Rundungsfälle mit 5 an der Rundungsstelle kommen im Kurs nicht vor (Festlegung 8).

Vorhersage „Welcher Vergleich stimmt?“: Welche Zeile ergibt `True`?

- `0.1 + 0.2 == 0.3`
- [x] `0.5 + 0.25 == 0.75`
- `0.1 * 3 == 0.3`
- `0.1 + 0.2 == 0.30`

Auflösung: Halbe, Viertel und Achtel (und weiter halbiert) gehen im Zweiersystem genau auf, Zehntel nicht: 0.5 + 0.25 ist genau 0.75. Bei den anderen steckt der winzige Rest dazwischen (0.1 · 3 ergibt `0.30000000000000004`, und 0.30 ist dieselbe Zahl wie 0.3).

## D. Interaktive Bausteine (3)

1. **`kreis` – „Zahlenkreis“** (Abschnitt 1). Einstellen: Zähler mit 4 oder 8 Bit (mit 4 Bit hat der Kreis nur 16 Stellen und passt gut ins Bild; 4 Bit nur ohne Vorzeichen, der Schalter „ohne Vorzeichen“ / „mit Vorzeichen“ ist nur bei 8 Bit frei, damit keine neue Zahlenreihe von −8 bis 7 vorkommt), Knöpfe „+1“, „−1“ und „Start setzen“ (ein Eingabefeld im erlaubten Bereich, 0 bis 255 beziehungsweise −128 bis 127). Sehen: ein Kreis mit allen Stellen, ein Zeiger, die Zahl groß, darunter die Bits in Vierergruppen und beim Wechsel des Schalters dieselben Bits mit der anderen Zahl (`1000 0000` ist 128 oder −128). Mit Vorzeichen färbt sich die rechte Hälfte als negativ. Beim Überlauf erscheint „Überlauf: 255 + 1 ergibt 0“ und darunter „Python rechnet: 256“. Vermutung: Was zeigt der Zähler nach 255 + 1? (0.) Und mit Vorzeichen nach 127 + 1? (−128.) Beobachtung danach: Die Bits sind in beiden Fällen dieselben, nur die Lesart ist anders. Der Baustein rechnet, die Studierenden lesen ab. Eingaben und Tests bleiben im Bereich 0 bis 255 beziehungsweise −128 bis 127.
2. **`maschine` – „Funktionsmaschine“** (Abschnitt 2 und 3). Einstellen: Auswahl einer Funktion (`begruessen(name)`, `quadrat(x)`, `doppelt(x)` aus Station 3; keine Funktion mit Kommazahl-Ergebnis, das kommt erst in Abschnitt 4), ein Eingabefeld, Schalter „`print` statt `return`“ (aus für `begruessen`). Sehen: eine Kiste mit Eingang und Ausgang und das Programm mit der aktiven Zeile, Knopf „Ein Schritt“: (1) Aufruf in der Hauptzeile, (2) der Parameter bekommt den Wert, (3) der Rumpf läuft, (4) `return` oder `print`, (5) der Wert landet in der Variablen. Eine Tabelle zeigt `x` (Parameter) und `ergebnis` (Hauptprogramm) getrennt. Mit „`print` statt `return`“ erscheint die Zahl in der Ausgabe, und `ergebnis` bleibt `None`. Vermutung (Abschnitt 2): Was bekommt `name` beim zweiten Aufruf? Vermutung (Abschnitt 3): Mit `print` statt `return`, was steht in `ergebnis`? (None.)
3. **`lupe` – „Kommazahl unter der Lupe“** (Abschnitt 4). Teil 1: zwei Kommazahlen (0,1 bis 0,9) wählen und addieren, Ergebnis einmal so, wie Python es zeigt, einmal mit 20 Nachkommastellen, daneben eine Ampel „genau / nicht genau“ und das Ergebnis von `==` gegen die erwartete Zahl und von `round(…, 2) ==`. Teil 2: zehnmal 0.1 aufsummieren, Knopf „Ein Schritt“: `0.1`, `0.2`, `0.30000000000000004`, `0.4`, `0.5`, `0.6`, `0.7`, `0.7999999999999999`, `0.8999999999999999`, `0.9999999999999999`, dann `1.0999999999999999`; daneben die Frage „x != 1.0?“ jedes Mal mit ja. Vermutung: Ist `0.5 + 0.25 == 0.75`? (Ja.) Ist `0.1 + 0.2 == 0.3`? (Nein.) Beobachtung danach: Die Halben und Viertel haben im Zweiersystem genau Platz, die Zehntel nicht.

Abschnitt 3 nutzt die Funktionsmaschine ein zweites Mal (mit dem Schalter), Abschnitt 4 hat den dritten Baustein. Einen vierten gibt es nicht.

## E. Selbstcheck (6 Fragen, 20 Punkte)

Titel ohne Nummern, Antworten ohne Bezug auf die Reihenfolge, damit sich Fragen und Antworten mischen lassen.

1. **Größte Zahl**, Zahl, 3 Punkte, Antwort 4095. Ein Sensor liefert seinen Messwert mit 12 Bit, ohne Vorzeichen. Wie groß ist die größte Zahl, die er liefern kann? Erklärung: 2¹² = 4096 Werte, von 0 bis 4095.
2. **Zähler läuft über**, Auswahl, 3 Punkte. Ein 8-Bit-Zähler ohne Vorzeichen steht auf 255 und zählt um 1 weiter. Was zeigt er? [x] 0 · 256 · −1 · 255. Erklärung: Nach dem größten Wert geht es beim kleinsten weiter, wie beim Kilometerzähler: 255 plus 1 ergibt 0.
3. **Byte mit Vorzeichen**, Auswahl, 3 Punkte. Welche Aussage über ein Byte mit Vorzeichen stimmt? [x] Es reicht von −128 bis 127, und nach 127 kommt −128. · Es reicht von −127 bis 128. · Das oberste Bit zählt +128 wie ohne Vorzeichen. · Nach 127 kommt 128. Erklärung: Das oberste Bit zählt −128. Bei `1000 0000` ist es das Einzige, das gesetzt ist, also −128.
4. **Datentyp bestimmen**, Ausgabe, 4 Punkte, Antwort `3.0`.
   ```python
   print(6 / 2)
   ```
   Erklärung: `/` ergibt immer eine Kommazahl (`float`), auch wenn die Division aufgeht. Die Antwort ist `3.0`, nicht `3`. Damit ist auch die Klausurfrage „Welchen Typ hat 6 / 2?“ beantwortet.
5. **print oder return**, Auswahl, 3 Punkte. Was steht in `ergebnis`, nachdem `ergebnis = quadrat(4)` gelaufen ist, wenn die Funktion `quadrat` mit `print(x * x)` endet und kein `return` hat? [x] `None` · 16 · 0 · `x * x`. Erklärung: Die Funktion zeigt die 16 an, gibt aber nichts zurück. Ohne `return` ist das Ergebnis `None`.
6. **Welche Vergleiche stimmen?**, Auswahl (mehrere richtig), 4 Punkte. Welche Zeilen ergeben `True`? [x] `0.5 + 0.25 == 0.75` · `0.1 + 0.2 == 0.3` · [x] `round(0.1 + 0.2, 2) == 0.3` · `0.1 * 3 == 0.3`. Erklärung: Halbe und Viertel gehen im Zweiersystem genau auf, Zehntel nicht. 0.1 + 0.2 und 0.1 · 3 ergeben `0.30000000000000004`, dort bleibt der winzige Rest. Nach `round(…, 2)` ist es genau 0.3.

## F. Labor Teil A (8 Stationen, auf der Seite 50 Minuten; im Termin laufen 3 und 6 nicht einzeln)

**1 · Werkzeugkasten (5 Min).** Vier Karten, Video „Python-Werkzeugkasten“. Alles aus Termin 02 bis 06 gilt weiter. Die Karten folgen dem Termin: Karte 1 gehört zu Block 1, Karte 2 zu Block 2, Karte 3 zu Block 3, Karte 4 zu Block 4.
- Karte 1 „**: hoch (nur lesen)“
  ```python
  print(2 ** 8)
  print(2 ** 16)
  print(2 ** 64 + 1)
  ```
  Ausgabe `256`, `65536`, `18446744073709551617` (mit Python 3.13 nachgerechnet). `**` heißt „hoch“: `2 ** 8` ist die Zahl der Werte eines Bytes. Du liest es nur, selbst schreiben musst du es nicht. Die dritte Zeile passt in kein 64-Bit-Feld, Python rechnet trotzdem: Ganzzahlen laufen in Python nicht über.
- Karte 2 „def: eigene Funktion“
  ```python
  def begruessen(name):
      print(f"Hallo {name}!")

  begruessen("Lea")
  begruessen("Tom")
  ```
  Ausgabe `Hallo Lea!`, `Hallo Tom!`. Zuerst definieren, dann aufrufen. Parameter stehen in der Klammer, mehrere mit Komma. Ohne Klammern beim Aufruf passiert nichts.
- Karte 3 „return: einen Wert zurückgeben“
  ```python
  def quadrat(x):
      return x * x

  ergebnis = quadrat(4)
  print(ergebnis)
  ```
  Ausgabe `16`. `print` zeigt an, `return` gibt zurück. Ohne `return` steht in `ergebnis` der Wert `None`.
- Karte 4 „type und round“
  ```python
  print(type(42))
  print(type(7 / 2))
  print(round(0.1 + 0.2, 2) == 0.3)
  ```
  Ausgabe `<class 'int'>`, `<class 'float'>`, `True`. `type(…)` nennt den Datentyp. `round(x, 2)` rundet auf 2 Nachkommastellen, nützlich vor einem Vergleich.

**2 · Vorgerechnetes Beispiel: Fahrenheit (5 Min; im Termin 3 Min, Schritt 6 nur zu Hause).** Aufgabe: Eingelesen wird eine Temperatur in Grad Celsius. Ausgegeben wird sie in Grad Fahrenheit. Die Umrechnung steht in einer Funktion. Video „Vorgerechnet“. Art `run`, Eingabe `20`. Plan (`<Plan>` für Hauptprogramm und Funktion):

```text
Eingabe: celsius
Unterprogramm: fahr = fahrenheit(celsius)
Ausgabe: celsius, fahr
```

```text
Funktion: fahrenheit(c)
grad = c * 9 / 5 + 32
Rückgabe: grad
```

```python
def fahrenheit(c):
    grad = c * 9 / 5 + 32
    return grad

celsius = float(input("Grad Celsius: "))
fahr = fahrenheit(celsius)
print(f"{celsius:.1f} Grad Celsius sind {fahr:.1f} Grad Fahrenheit")
```

Eingabe 20: `20.0 Grad Celsius sind 68.0 Grad Fahrenheit`. Weitere Läufe: 37 ergibt `37.0 Grad Celsius sind 98.6 Grad Fahrenheit`, 0 ergibt `0.0 Grad Celsius sind 32.0 Grad Fahrenheit`, −10 ergibt `-10.0 Grad Celsius sind 14.0 Grad Fahrenheit`.
Schritte: (1) Der Ablauf in Worten: Wert einlesen, umrechnen, ausgeben. (2) Was gehört in die Funktion? Die Umrechnung, weil man sie öfter braucht. Eingabe und Ausgabe bleiben im Hauptprogramm. (3) Plan: das Rechteck mit Doppellinien im Hauptplan, der kleine Plan der Funktion. (4) Code: erst `def`, dann Hauptprogramm. (5) Probe: 20 · 9 / 5 + 32 = 68. (6) Selbsterklärung: Ersetz `return grad` durch `print(grad)` und lass es laufen. Es erscheint `68.0`, danach bricht das Programm mit `TypeError: unsupported format string passed to NoneType.__format__` ab (mit Python 3.13 nachgerechnet), weil `fahr` jetzt `None` ist und `{fahr:.1f}` damit nichts anfangen kann. Die Meldung wird nur gelesen (Festlegung 7): „Hier fehlt ein `return`.“ Wer das `None` selbst sehen will, schreibt zusätzlich `print(fahr)`. Im Termin zeigt der Dozent die Schritte 1 bis 5 am Beamer (der Plan der Funktion wird nur angesehen, gezeichnet wird in Station 5), Schritt 6 ist Hausaufgabe (1 Min).

**3 · Ablauf verfolgen: Funktionsaufruf (5 Min; im Termin nicht einzeln).** Art `trace`, `typhinweis: false`. Aufgabenstellung: Du verfolgst, wie eine Funktion aufgerufen wird. Trag in jeder Zeile ein, was sich ändert. Die Funktion läuft in Zeile 2, der Rückgabewert steht in der Spalte `Rückgabe`.

```python
def doppelt(x):
    return x * 2

zahl = 3
b = doppelt(zahl)
print(b)
```

Spalten `zahl`, `x`, `b`, `Rückgabe`. 6 Schritte, von Hand geschrieben (Zeilenfolge 1, 4, 5, 2, 6 mit `sys.settrace` nachgeprüft; der zweite Besuch von Zeile 5 ist hier ein Lehrschritt, damit `b` seinen Wert in der Zeile bekommt, in der er zugewiesen wird): Zeile 1 `def`, es läuft nichts · Zeile 4 `zahl = 3` · Zeile 5 Aufruf, `x = 3` · Zeile 2 Rückgabe 6 · Zeile 5 zurück, `b = 6` · Zeile 6 Ausgabe `6`. Hinweise: bei Zeile 1 „`def` legt die Funktion nur an. Es läuft noch nichts darin.“; bei Zeile 5 „Der Aufruf gibt `x` den Wert von `zahl`.“; am Ende „`x` steht in der Tabelle weiter, obwohl die Funktion fertig ist. Das ist die flache Tabelle, kein Fehler.“ Verschiedene Namen im Hauptprogramm und in der Funktion, damit die flache Tabelle eindeutig bleibt (Technische Voraussetzung 5).

**4 · Plan zeichnen: Summe prüfen (★★, 8 Min).** Art `pap-zeichnen`, erlaubt `in,out,op,if,call`. Die zwei Eingaben stehen schon im Editor. Text: Eingelesen werden zwei Kommazahlen. Ausgegeben wird `ja`, wenn ihre Summe, auf 2 Nachkommastellen gerundet, 0.3 ist, sonst `nein`. Bei 0.1 und 0.2 erscheint `ja`. Hinweis: Das Runden darf ein normales Rechteck sein (`gerundet = round(summe, 2)`); welches Symbol der Dozent für fertige Funktionen will, ist offen (Frage 6).
Lösung: Eingabe a (float), Eingabe b (float) · Operation `summe = a + b` · Operation `gerundet = round(summe, 2)` (je nach Frage 6 als Unterprogramm) · Verzweigung `gerundet == 0.3`: ja Ausgabe `"ja"`, nein Ausgabe `"nein"`.
Tests (geprüft wird die letzte Zeile): 0.1 und 0.2 ergibt `ja` (ohne `round` käme `nein`) · 0.2 und 0.1 ergibt `ja` · 0.15 und 0.15 ergibt `ja` · 0.1 und 0.3 ergibt `nein` (der letzte Wert entscheidet) · 0.1 und 0.25 ergibt `nein` · 0.3 und 0.0 ergibt `ja` (Grenzfall, 0 addiert). Die Summen sind 0.30000000000000004, 0.3, 0.4 und 0.35: keine 5 an der Rundungsstelle. Die Tests prüfen die Ausgabe, nicht die Form des Symbols (Technische Voraussetzung 3).
Tipps: (1) Zuerst addieren, dann runden, dann vergleichen. Drei Schritte, ein Symbol je Schritt. (2) Das Runden ist ein Aufruf einer fertigen Funktion: `gerundet = round(summe, 2)`. (3) Die Raute vergleicht `gerundet == 0.3`. Beide Ausgaben stehen in den Zweigen.

**5 · Funktionsplan zeichnen: km/h in m/s (★★, 7 Min; im Termin in Block 3).** Art `pap-zeichnen`, `data-erlaubt="def,op,out"`. Der Hauptplan steht schon im Editor (Startdaten), gezeichnet wird nur die Funktion. Text: Ein Programm liest eine Geschwindigkeit in km/h ein und gibt sie in m/s aus. Der Hauptplan ruft die Funktion `kmh_in_ms(v)` auf. Zeichne den Plan dieser Funktion: Sie rechnet km/h in m/s um (durch 3.6) und gibt das Ergebnis zurück. Hauptplan (vorgegeben): Eingabe `kmh` (float) · Unterprogramm `ms = kmh_in_ms(kmh)` · Ausgabe `f"{ms:.1f} m/s"`.
Lösung: Funktion mit Kopf `kmh_in_ms(v)` · im Rumpf eine Operation `wert = v / 3.6` · Rückgabe `wert`. Erzeugter Code (mit Python 3.13 ausgeführt):
```python
def kmh_in_ms(v):
    wert = v / 3.6
    return wert

kmh = float(input("kmh: "))
ms = kmh_in_ms(kmh)
print(f"{ms:.1f} m/s")
```
Parameter `v`, Variable im Rumpf `wert`, Hauptvariablen `kmh` und `ms`: alle verschieden (Festlegung 5).
Tests (letzte Zeile, Zahl mit Toleranz 0,05; die Aufforderung `kmh: ` enthält keine Zahl): 36 ergibt `10.0 m/s` (fängt `v * 3.6` ab, das gäbe 129.6) · 72 ergibt `20.0 m/s` · 90 ergibt `25.0 m/s` · 0 ergibt `0.0 m/s` (Grenzfall) · 100 ergibt `27.8 m/s` (27.777…) · 10 ergibt `2.8 m/s` (2.777…, der letzte Wert ändert das Ergebnis). Alle ohne 5 an der Rundungsstelle (27.78 und 2.78 auf eine Stelle). Fehlt die Rückgabe, meldet Python beim ersten Test `TypeError: unsupported format string passed to NoneType.__format__` (nur lesen, „hier fehlt die Rückgabe“, Festlegung 7). Die Tests prüfen die Ausgabe, nicht die Form des Plans.
Tipps: (1) Was kommt in die Funktion hinein, was kommt heraus? Hinein kommt `v`, heraus kommt der umgerechnete Wert. (2) Füge oben das Symbol „Funktion“ ein, trag den Kopf `kmh_in_ms(v)` ein, setz in den Rumpf eine Operation und trag die Rückgabe ein. (3) Die Umrechnung ist `wert = v / 3.6`, zurückgegeben wird `wert`.
Für Schnelle (nicht getestet): Ein zweiter Funktionsblock `ms_in_kmh(w)`, der zurückrechnet (mal 3.6).

**6 · Zeilen ordnen: Fläche (4 Min; im Termin nicht einzeln).** Art `parsons`. Plan: Eingabe lang, Eingabe breit · Unterprogramm `f = flaeche(lang, breit)` · Ausgabe f. Lösung:
```python
def flaeche(laenge, breite):
    return laenge * breite

lang = int(input("Länge in m: "))
breit = int(input("Breite in m: "))
f = flaeche(lang, breit)
print(f"Fläche: {f} m²")
```
Zeilen, die nicht dazugehören: `    print(laenge * breite)` (kein `return`, die Fläche wäre `None`) und `def flaeche(laenge):` (ein Parameter fehlt). `ok`-Text: „Die Funktion steht zuerst, der Aufruf danach. `return` gibt die Fläche an die Stelle zurück, die aufgerufen hat.“ Probe: 5 und 4 ergibt `Fläche: 20 m²`, 7 und 0 ergibt `Fläche: 0 m²`.

**7 · Lücken füllen: Spielstand (8 Min).** Art `gap`. Eingelesen werden die Punkte dreier Runden. Nach jeder Runde zeigt eine Funktion den Stand. Der Plan steht vollständig darüber: Schleife „i von 1 bis 3?“ · ja: Eingabe p, Unterprogramm `zeige_stand(i, p)`; die Funktion gibt aus „Runde“, runde, „:“, punkte, „Punkte“.

```text
@@def@@ zeige_stand(runde, punkte)@@:@@
    print(f"Runde {runde}: {punkte} Punkte")

for i in range(1, 4):
    p = int(input(f"Punkte in Runde {i}: "))
    zeige_stand(@@i@@, @@p@@)
```

Tests (geprüft werden die Zeilen, die mit `Runde` beginnen; die Eingabeaufforderungen enthalten Zahlen und zählen nicht): 12, 9, 15 ergibt `Runde 1: 12 Punkte`, `Runde 2: 9 Punkte`, `Runde 3: 15 Punkte` · 0, 0, 7 ergibt `Runde 1: 0 Punkte`, `Runde 2: 0 Punkte`, `Runde 3: 7 Punkte` (Grenzfall, der letzte Wert zählt) · 5, 5, 5 ergibt dreimal 5 Punkte. Wer `zeige_stand(i, i)` einträgt, fällt beim ersten Test auf (`Runde 1: 1 Punkte`).
Tipps: (1) Lücke 1 und 2: Welches Wort legt eine Funktion an, und was steht am Ende der Zeile? (2) Lücke 3 und 4: Die Funktion bekommt zwei Werte. Welche sind es in diesem Durchlauf? (3) Karte 2.

**8 · Erste eigene Aufgabe: Rabatt (★, 8 Min).** Art `code`, Klausurform „Plan in Code übertragen“ mit Ausführen. Text: Eingelesen werden ein Preis und ein Rabatt in Prozent (Kommazahlen). Eine Funktion `endpreis(betrag, satz)` gibt den Preis nach Abzug des Rabatts zurück. Ausgegeben wird `Endpreis: 68.00 Euro`. Plan:
```text
Eingabe: preis
Eingabe: prozent
Unterprogramm: ergebnis = endpreis(preis, prozent)
Ausgabe: ergebnis
```
```text
Funktion: endpreis(betrag, satz)
rabatt = betrag * satz / 100
Rückgabe: betrag - rabatt
```
Lösung:
```python
def endpreis(betrag, satz):
    rabatt = betrag * satz / 100
    return betrag - rabatt

preis = float(input("Preis in Euro: "))
prozent = float(input("Rabatt in Prozent: "))
ergebnis = endpreis(preis, prozent)
print(f"Endpreis: {ergebnis:.2f} Euro")
```
Tests (die Zeile, die mit `Endpreis` beginnt, Zahl mit Toleranz 0,005): 80 und 15 ergibt `Endpreis: 68.00 Euro` · 50 und 0 ergibt `Endpreis: 50.00 Euro` (Grenzfall, kein Rabatt) · 120 und 100 ergibt `Endpreis: 0.00 Euro` (Grenzfall, voller Rabatt) · 39.9 und 10 ergibt `Endpreis: 35.91 Euro` · 60 und 25 ergibt `Endpreis: 45.00 Euro`. Fallen auf: `print` statt `return` (der Aufruf liefert `None`, in `{ergebnis:.2f}` meldet Python `TypeError: unsupported format string passed to NoneType.__format__`, Festlegung 7), nur der Rabatt zurückgegeben (`return rabatt`, erster Test: 12.00), Rabatt nicht abgezogen (`return preis`, erster Test: 80.00).
Tipps: (1) Lies zuerst den Plan der Funktion: Was kommt hinein, was kommt heraus? (2) Die Funktion steht zuerst im Code. Sie rechnet und gibt mit `return` zurück, sie zeigt nichts an. (3) Meldet Python etwas mit `None`, fehlt dem Aufruf ein `return`.
Für Schnelle (nicht getestet): Ruf `endpreis` ein zweites Mal auf, mit dem Endpreis und 10 Prozent, und gib vor der Endpreis-Zeile eine Zeile `Sonderpreis: …` aus. Die Tests lesen nur die Zeile, die mit `Endpreis` beginnt.

## G. Labor Teil B (Training, 4 Aufgaben, 30 Minuten) und Knobelaufgaben

Zu Hause zusammen **47 Minuten**: Stationen 3 und 6 (9), Fahrenheit Schritt 6 (1), Selbstcheck (7), Training (30).

1. **Wertebereich und Überlauf** (★, 6 Min, `trace` als Tabelle, `sprache: "tabelle"`, 6 Zeilen, eine Spalte „Antwort“, `ausgabe: false`, `typhinweis: false`). Erst auf Papier, dann hier prüfen. Text: „Trag die Zahl ein, ohne Leerzeichen und ohne Anführungszeichen. Negative Zahlen mit einem Minuszeichen. Zeichne dir bei den Zählern den Zahlenkreis auf.“

   | Zeile | Frage | Lösung |
   |---|---|---|
   | 1 | Wie viele Werte hat eine Zahl mit 6 Bit? | 64 |
   | 2 | Größte Zahl mit 6 Bit, ohne Vorzeichen? | 63 |
   | 3 | Größte Zahl mit 7 Bit, ohne Vorzeichen? | 127 |
   | 4 | Ein 8-Bit-Zähler ohne Vorzeichen steht auf 250. Was zeigt er nach 10-mal +1? | 4 |
   | 5 | Ein 4-Bit-Zähler ohne Vorzeichen steht auf 14. Was zeigt er nach 3-mal +1? | 1 |
   | 6 | Ein 8-Bit-Zähler mit Vorzeichen steht auf 127. Was zeigt er nach 1-mal +1? | -128 |

   Hinweis bei den Zeilen 4 bis 6: „Zähl auf dem Kreis weiter. Nach dem größten Wert kommt der kleinste.“ Zeile 4: 250 bis 255 sind 5 Schritte, die restlichen 5 Schritte ergeben 0, 1, 2, 3, 4. Zeile 6: nach 127 kommt −128, nur die Kernaussage, keine Rechnung mit Vorzeichenwerten (Festlegung 3, Frage 5). Wird das Warm-up von Termin 08 (auf Papier), dort als Brücke zu `str` und `bool`.
2. **Plan in Code übertragen: Blätter anzeigen** (★★, 8 Min, `klausur`). Text: Eingelesen werden die Zahl der Übungsblätter und dann die Punkte jedes Blatts (ganze Zahlen). Für jedes Blatt zeigt eine Funktion `zeige(nr, wert)` eine Zeile, zum Beispiel `Blatt 2: 10 Punkte`.
   Plan:
   ```text
   Eingabe: n
   Schleife: i von 1 bis n?
     Eingabe: punkte
     Unterprogramm: zeige(i, punkte)
   ```
   ```text
   Funktion: zeige(nr, wert)
   Ausgabe: "Blatt", nr, ":", wert, "Punkte"
   ```
   (Die Funktion hat kein `return`, ihr Plan endet mit dem normalen Ende-Symbol.)
   ```python
   def zeige(nr, wert):
       print(f"Blatt {nr}: {wert} Punkte")

   n = int(input("Wie viele Blätter? "))
   for i in range(1, n + 1):
       punkte = int(input(f"Punkte Blatt {i}: "))
       zeige(i, punkte)
   ```
   Tests (die Zeilen, die mit `Blatt` und einer Zahl und `:` beginnen und mit `Punkte` enden; die Eingabeaufforderungen enthalten dasselbe Wort, aber ohne `Punkte` am Ende): 3 und 8, 10, 4 ergibt `Blatt 1: 8 Punkte`, `Blatt 2: 10 Punkte`, `Blatt 3: 4 Punkte` · 1 und 7 ergibt `Blatt 1: 7 Punkte` (Grenzfall) · 0 ergibt keine Zeile (Grenzfall, die Schleife läuft nie) · 2 und 0, 9 ergibt `Blatt 1: 0 Punkte`, `Blatt 2: 9 Punkte`. Schema (je 1 Punkt): `def zeige(nr, wert):` mit Doppelpunkt · `print` im Rumpf der Funktion eingerückt · `for i in range(1, n + 1):` · Aufruf `zeige(i, punkte)` im Rumpf der Schleife.
   Tipps: (1) Zeichne zuerst den Hauptplan: Eingabe, Schleife, im Rumpf einlesen und das Unterprogramm aufrufen. (2) Die Funktion steht im Code zuerst, vor der Schleife. (3) Die Funktion zeigt etwas an, sie braucht kein `return`.
3. **Fehler finden und beheben: Passt die Summe** (★★, 6 Min, `code`). Zwei Fehler: einer, den Python meldet, einer, den du nur mit einer Probe findest. Probier 0.1 und 0.2.
   Vorlage:
   ```python
   # Prüft, ob zwei Preise zusammen genau 0.30 Euro kosten.
   a = float(input("Preis 1: "))
   b = float(input("Preis 2: "))
   if gesamt(a, b) == 0.3:
       print("Passt")
   else:
       print("Passt nicht")

   def gesamt(x, y):
       return x + y
   ```
   Lösung: Python meldet `NameError: name 'gesamt' is not defined` in Zeile 4: Der Aufruf steht vor der Definition. Danach zeigt die Probe mit 0.1 und 0.2 `Passt nicht`, obwohl 0.1 + 0.2 gleich 0.3 sein soll: `0.1 + 0.2` ist `0.30000000000000004`. Mit `round(…, 2)` vor dem Vergleich:
   ```python
   # Prüft, ob zwei Preise zusammen genau 0.30 Euro kosten.
   def gesamt(x, y):
       return x + y

   a = float(input("Preis 1: "))
   b = float(input("Preis 2: "))
   if round(gesamt(a, b), 2) == 0.3:
       print("Passt")
   else:
       print("Passt nicht")
   ```
   Tests (letzte Zeile): 0.1 und 0.2 ergibt `Passt` · 0.2 und 0.1 ergibt `Passt` · 0.15 und 0.15 ergibt `Passt` · 0.1 und 0.3 ergibt `Passt nicht` (der letzte Wert entscheidet) · 0.1 und 0.25 ergibt `Passt nicht` · 0.3 und 0.0 ergibt `Passt` (Grenzfall). Ohne `round` fällt der erste Test auf (`Passt nicht`).
   Tipps: (1) Führ das Programm aus und lies die Meldung von unten: Welcher Name ist unbekannt, und wo müsste er schon bekannt sein? (2) Läuft es, probier 0.1 und 0.2: Was erwartest du, was kommt heraus? (3) Karte 4 und Abschnitt 4: Runde vor dem Vergleich.
4. **Zylinder berechnen** (★★★, 10 Min, `code`, ohne Plan; erst auf Papier zeichnen). Text: Das Volumen eines Zylinders ist 3.14 · Radius · Radius · Höhe. Eingelesen werden der Radius und die Höhe in cm (Kommazahlen). Eine Funktion `volumen(r, h)` berechnet es und gibt es zurück. Ausgegeben wird das Volumen mit einer Nachkommastelle, als `Volumen: 565.2 cm³`.
   ```python
   def volumen(r, h):
       return 3.14 * r * r * h

   radius = float(input("Radius in cm: "))
   hoehe = float(input("Höhe in cm: "))
   v = volumen(radius, hoehe)
   print(f"Volumen: {v:.1f} cm³")
   ```
   Tests (letzte Zeile, Zahl mit Toleranz 0,05): 6 und 5 ergibt `Volumen: 565.2 cm³` · 2 und 10 ergibt `Volumen: 125.6 cm³` · 4 und 3 ergibt `Volumen: 150.7 cm³` (150.72) · 0 und 5 ergibt `Volumen: 0.0 cm³` (Grenzfall) · 10 und 0 ergibt `Volumen: 0.0 cm³` (Grenzfall). Das Beispiel 3 und 7.5 (211.95, genau 5 an der Rundungsstelle) kommt nicht vor. Fallen auf: `print` statt `return` in der Funktion (`TypeError` bei `:.1f`), Radius nicht quadriert (erster Test: 94.2). Parameter und Hauptvariablen heißen verschieden (`r`, `h` gegen `radius`, `hoehe`, Festlegung 5).
   Tipps: (1) Was geht in die Funktion hinein, was kommt heraus? Das sind die Parameter und der Rückgabewert. (2) Die Rechnung steht in der Funktion, Eingabe und Ausgabe im Hauptprogramm. (3) Die Form kennst du von „Rabatt“: Funktion zuerst, `return`, der Aufruf in einer eigenen Zeile, dann ausgeben.

**Knobelaufgaben (freiwillig, zählen nicht im Fortschritt).** Nur Stoff bis Termin 07. Beide ausgearbeitet und nachgerechnet.

- **`kn-1` · „Primzahlen ohne Rest“** (`k-1`, `code`, `data-mode="programm"`, `data-inputs="30"`).
  Text: Eine Primzahl lässt sich nicht als Produkt zweier kleinerer ganzer Zahlen (ab 2) schreiben. Eingelesen wird eine Grenze (höchstens 50, mindestens 1). Ausgegeben werden alle Primzahlen bis zur Grenze, je eine in einer Zeile. Dafür schreibst du eine Funktion `zerlegungen(n)`, die zählt, wie viele Paare `a * b == n` es gibt (a und b ab 2, kleiner als n). Eine Zahl ab 2 ist prim, wenn es 0 Paare gibt. Beispiel: Grenze 10 ergibt 2, 3, 5, 7.
  Vorlage:
  ```python
  # Primzahlen bis zur Grenze, ohne Rest-Rechnung.
  # Die Funktion zerlegungen(n) zählt die Paare a * b == n.
  grenze = int(input("Grenze: "))
  ```
  Musterlösung:
  ```python
  def zerlegungen(n):
      anzahl = 0
      for a in range(2, n):
          for b in range(2, n):
              if a * b == n:
                  anzahl = anzahl + 1
      return anzahl

  grenze = int(input("Grenze: "))
  for zahl in range(2, grenze + 1):
      if zerlegungen(zahl) == 0:
          print(zahl)
  ```
  Tests (alle Zeilen, die reine Zahlen sind): 30 ergibt 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 · 31 ergibt dieselben Zahlen und 31 (die Grenze selbst zählt mit) · 10 ergibt 2, 3, 5, 7 · 2 ergibt 2 (Grenzfall) · 1 ergibt keine Zeile (Grenzfall). Für 50 ergibt sich die 15-elementige Liste bis 47 (nachgerechnet, die Musterlösung braucht dafür 78 771 Zeilen, der Schutz greift ab 200 000, Technische Voraussetzung 7). Deshalb „höchstens 50“ im Text und nicht in den Tests: 100 würde 647 606 Zeilen brauchen und abbrechen.
  Tipps: (1) Teste zuerst von Hand: 6 hat die Paare 2 · 3 und 3 · 2, 7 hat keines. (2) Für jedes `a` probierst du alle `b` durch. Zwei Schleifen, eine in der anderen. (3) Die Funktion zählt nur, die Hauptschleife fragt `== 0`. Beide Schleifen laufen von 2 bis n − 1.
  Für die Auflösung (nicht getestet): Mit `%` ginge es kürzer. Hier genügt die Multiplikation.
- **`kn-2` · „Wann läuft der Zähler über?“** (`k-2`, `code`, `data-mode="programm"`, `data-inputs="16"`).
  Text: Ein Zähler in einer Anlage zählt jede Sekunde ein Werkstück, ohne Vorzeichen, mit einer festen Zahl von Bit. Eingelesen wird die Zahl der Bit (ganze Zahl). Gesucht ist, nach wie vielen Stunden er überläuft und auf 0 springt. Eine Funktion `stunden_bis_ueberlauf(n)` gibt die Stunden zurück. Beispiel: 16 Bit ergeben `Der Zähler springt auf 0 nach 18.2 Stunden`. Die Stundenzahl steht bewusst als letzte Zahl der Zeile (die Tests lesen die letzte Zahl, die 0 davor würde sonst als Antwort gelten). `**` wird hier nur gelesen, nicht geschrieben (Festlegung 11): Die Zahl der Werte entsteht durch wiederholtes Verdoppeln.
  Musterlösung:
  ```python
  def stunden_bis_ueberlauf(n):
      werte = 1
      for i in range(1, n + 1):
          werte = werte * 2
      return werte / 3600

  bit = int(input("Wie viele Bit? "))
  stunden = stunden_bis_ueberlauf(bit)
  print(f"Der Zähler springt auf 0 nach {stunden:.1f} Stunden")
  ```
  Tests (letzte Zeile, Zahl mit Toleranz 0,05): 16 ergibt 18.2 · 8 ergibt 0.1 · 12 ergibt 1.1 · 24 ergibt 4660.3 · 32 ergibt 1193046.5 · 1 ergibt 0.0 (Grenzfall, zwei Werte, nach 2 Sekunden übergelaufen, 2 / 3600 ergibt gerundet 0.0). Alle nachgerechnet und ohne 5 an der Rundungsstelle (65 536 / 3600 ist 18.2044…, 4 294 967 296 / 3600 ist 1 193 046.4711…).
  Tipps: (1) Wie viele Werte hat der Zähler? 2 hoch bit, also bit-mal mit 2 malnehmen (Tabelle in Abschnitt 1). (2) Ein Wert pro Sekunde, also so viele Sekunden. Eine Stunde hat 3600 Sekunden. (3) Die Funktion rechnet und gibt zurück, `print` steht im Hauptprogramm.
  Für die Auflösung (nicht getestet): Ein 16-Bit-Zähler, der jede Sekunde ein Werkstück zählt, läuft nach gut 18 Stunden über. Genau diese Rechnung ist der Grund, warum Steuerungen 32 Bit oder mehr nehmen.

## H. Videos (je etwa 2 bis 2,5 Minuten; hier nur der Inhalt, kein Sprechertext)

**Theorie (Lerneinheit, Abschnitt 1): „Ein Byte, zwei Lesarten: Überlauf und Vorzeichen“.** Der Kilometerzähler springt von 99 999 auf 00 000; ein Byte mit acht Schaltern springt von `1111 1111` auf `0000 0000`; derselbe Zahlenkreis, die rechte Hälfte wird negativ: nach 127 kommt −128; zum Schluss der Satz, dass Python-Ganzzahlen mitwachsen.

**Python-Werkzeugkasten (Labor, Station 1): „hoch, def, return, type und round“.** Karte 1 zeigt `2 ** 8`, `2 ** 16` und `2 ** 64 + 1` (nur lesen); Karte 2 lässt `begruessen` zweimal laufen; Karte 3 zeigt `quadrat` mit `return` und die Variante mit `print` (`None`); Karte 4 zeigt `type(42)`, `type(7 / 2)` und `round(0.1 + 0.2, 2) == 0.3`.

**Vorgerechnet (Labor, Station 2): „Fahrenheit“.** Hauptplan mit dem Unterprogramm-Rechteck neben dem Plan der Funktion und dem Code; Lauf mit 20; am Ende der Versuch, `return` durch `print` zu ersetzen: erst `68.0`, dann die Meldung `TypeError` (nur lesen, „hier fehlt ein `return`“).

Abschnitte 2 bis 4 haben kein eigenes Theorie-Video. Sie leben von den Bausteinen und von „Schritt für Schritt“.

## I. Ablaufplan für den Dozenten

Jeder 30-Minuten-Block verplant höchstens 28 Minuten. Die Minuten eines Abschnitts enthalten das Zeigen der genannten Karte. Hier im Zuschnitt mit der Pause; in der App laufen die Minuten wie in Termin 05 ohne sie durch (0–10, 10–40, 40–70, 70–100, 100–125, Titel „Ablauf des Termins (125 Minuten)“), und die Pause wird nicht erwähnt.

| Minuten | Wo | Was |
|---|---|---|
| 0–10 | Papier, Beamer | **Warm-up.** Training 06, Aufgabe 1 „Umrechnen“ auf Papier (5), Auflösung (2). Brücke: Was passiert, wenn ein Byte-Zähler nach 255 weiterzählt? (3) |
| 10–40 | Lerneinheit 1 | **Theorie: ganze Zahlen im Speicher.** Wertebereich als Rückgriff auf Termin 05, nur 8 Bit, dazu Karte 1 `2 ** 8` zum Lesen (2; die Brücke steht schon im Warm-up). Baustein „Zahlenkreis“ ohne Vorzeichen mit Vermutung, Kilometerzähler, Beispiel Zähler einer Anlage (8). Vorzeichen als Idee: Tabelle und Baustein mit Schalter, Vermutung 127 + 1 (9). Python läuft nicht über, `2 ** 64 + 1`, Vorhersage (4). Verplant: 23. |
| 40–70 | Lerneinheit 2, Labor 1 (Karte 2), 7 | **Programmieren 1: def und Aufruf.** Trennlinie, `def` und Aufruf (5). Vorhersage „Aufruf vor der Definition“ (2). `begruessen(name)`, Karte 2, „Schritt für Schritt“ (5). Baustein „Funktionsmaschine“ mit Vermutung (4). Unterprogramm im Plan (3). „Spielstand“ als Lückentext (8). Verplant: 27. Station 6 läuft nicht einzeln. |
| 70–80 | – | **Pause** (nur im Zuschnitt). |
| 80–110 | Lerneinheit 3, Labor 1 (Karte 3), 2, 5, 8 | **Programmieren 2: return.** Rückgriff `input` (1). `quadrat` mit `return`, Karte 3 und „Schritt für Schritt“ (4). `print` gegen `return`, Baustein mit Schalter und Vorhersage (5). Fahrenheit am Beamer: Plan der Funktion nur ansehen, Code, Probe (3). Alle zeichnen den Funktionsplan „km/h in m/s“ (7). „Rabatt“ übertragen (8). Verplant: 28. |
| 110–135 | Lerneinheit 4, Labor 1 (Karte 4), 4 | **Theorie: Kommazahlen.** `int` gegen `float`, `type(42)` und `type(7 / 2)`, Karte 4 (3). Baustein „Kommazahl unter der Lupe“ mit Vermutung, Grund (1/3, 0,1 im Zweiersystem, 52 Bit) (7). `round(x, 2)` vor dem Vergleich, Vorhersage (3). Endlosschleife nur als Satz mit der Regel „mit ganzen Zahlen zählen“ (1). Alle zeichnen „Summe prüfen“ (8). Auftrag für zu Hause, Pflicht, zusammen 47 Minuten: Stationen 3 und 6 (9), Fahrenheit Schritt 6 (1), Selbstcheck (7), Training (30) (2). Termin 08 beginnt mit dem Wertebereich aus dem Training. Verplant: 24 (Block 110–135 hat nur 25 Minuten). |

Wenn die Zeit knapp wird: Im Block 10–40 entfällt zuerst die Vorhersage „Python zählt weiter“ (sie steht in der Lerneinheit). Im Block 40–70 wird der Lückentext gemeinsam am Beamer gefüllt statt einzeln. Der Block 80–110 ist mit 28 Minuten voll. Wird es eng, wird zuerst „Fahrenheit“ am Beamer gekürzt (nur Code und ein Lauf, 2 statt 3 Minuten). Danach geht „Funktionsplan zeichnen“ (7) nach Hause, das wird ausdrücklich gesagt, die Hausaufgabe wächst dann auf 54 Minuten. „Rabatt“ hat Vorrang, weil es die Klausurform „Plan in Code übertragen“ ist. Im letzten Block entfällt zuerst die Endlosschleife (Lupe Teil 2), dann wird die Vorhersage zusammen mit der `round`-Erklärung verkürzt; „Summe prüfen“ (Klausurform „Plan zeichnen“) geht erst zuletzt nach Hause, und das wird dann ausdrücklich gesagt.

Die drei Klausurformen im Termin: Plan zeichnen (Station 5 mit Funktionsblock in Block 3, Station 4 in Block 4), Plan in Code übertragen (Station 8, Block 3), Code lesen (Vorhersagen in jedem Block, Station 7). Zu Hause dazu: Ablauf verfolgen (Station 3), Plan in Code im Klausurmodus (Training 2), Fehler finden (Training 3).

---

# Bewusst weggelassen

**Datentypen**
- Zweierkomplement umrechnen (Bits kippen, 1 addieren), das Wort „Zweierkomplement“ im Selbstcheck, Rechenübungen mit Vorzeichen: entschieden.
- Aufbau einer Gleitkommazahl (Vorzeichen, Exponent, Mantisse, IEEE 754): nur der Satz „nach 52 Bit abgeschnitten“. `decimal`, `fractions`, `math.isclose`, Vergleich mit Toleranz `abs(a - b) < 0.001`: Frage 6 des Konzepts, entschieden für `round`.
- `str`, `bool`, Umwandlung mit `int()`, `float()`, `str()`, `TypeError` bei `"5" + 3`: Termin 08. Auch die Umwandlung einer Kommazahl in `int` (`int(3.7)`) bleibt dort.
- Rundungsfälle mit 5 an der Rundungsstelle: `round(2.5)` ist `2`, `round(0.125, 2)` ist `0.12`, `round(2.675, 2)` ist `2.67` (nachgerechnet). Sie stehen weder in der Lerneinheit noch in Aufgaben, sondern nur als Regel für die Testdaten (Festlegung 8). `round(x)` mit einem Argument kommt nicht vor.
- `**` selbst schreiben: nicht verlangt (Entscheidung 3, Festlegung 11). Es steht nur zum Lesen auf Karte 1 und in Abschnitt 1 (`2 ** 8`, `2 ** 64 + 1`). Rechenaufgaben mit `**`, das Wort „Potenz“, `pow()`: nein. Das Verdoppeln als Schleife bleibt in der Knobelaufgabe.
- Kilobyte, Megabyte, ASCII: T6.

**Funktionen**
- Lokale und globale Namen, Funktionen, die Funktionen aufrufen, Standardwerte, mehr als zwei Parameter, `return` mehrerer Werte, `return` mitten in einer Verzweigung: Termin 08 und später.
- Funktionen im Editor mit mehr als zwei Parametern, mehreren `return` oder verschachtelt: Der Blocktyp „Funktion“ kennt nur Kopf, Rumpf und eine Rückgabe am Ende (Festlegung 6). Mehr kommt mit Termin 08 und später.
- `bauteil3d` mit Parametern: Termin 08. Technisch geht es (Technische Voraussetzung 8), Frage 1.
- Dokumentation einer Funktion (Kommentar unter `def`), Namenskonventionen über „klein, ohne Umlaute, mit Unterstrich“ hinaus: nicht jetzt.

**Aufbau und Umfang**
- Eine Fehlersuche-Station im Labor: Das Training „Passt die Summe“ deckt „Fehler finden“ ab, und Block 2 bis 4 sind voll.
- Ein zweites Beispiel für Überlauf in Python mit Zeichen (`bytearray`, `& 0xFF`): zu weit weg von der Lerneinheit.
- Bitmasken („nur diese vier Bit lassen“ mit UND, ODER, XOR auf einem Byte), von Termin 06 hierher verschoben: auch in Termin 07 kein Platz, weitergeschoben auf später (T6 oder Wiederholung). Termin 06 zeigt UND, ODER, XOR nur Spalte für Spalte (Station 6) und `&`, `|`, `^` nur in Karte 3; Termin 07 greift sie nicht auf.
- Videos zu Abschnitt 2 bis 4: Bausteine und „Schritt für Schritt“ genügen.
- Primzahl-Idee mit `n / t == int(n / t)` aus dem Konzept: ersetzt, siehe Aufteilung.

---

# Technische Voraussetzungen

Belegt heißt: im Code gelesen oder gerechnet. Nicht ausprobiert ist ausdrücklich gesagt. Grundlage ist die Technikprüfung vom 2026-11-27.

1. **Dateinamen `explorables-v07.js` und `v07.css` sind belegt (Pflicht, ca. 1 Stunde).** `site/assets/js/explorables-v07.js` (633 Zeilen) ist der Baukasten der alten V07 „Zerlegung und Funktionen“ (Kopfkommentar Z. 1–8: Bausteine „zerlegung“, „baum“; braucht `pap-engine.js` und `v05.css`). `site/assets/css/v07.css` (81 Zeilen) trägt die `.v07-…`-Regeln dazu (ab Z. 8). Keine Seite unter `app/inhalte`, `app/src`, `app/skripte` und `docs` lädt eine der beiden Dateien (gesucht, nur Treffer in `app/dist*` als Kopien). Vorschlag wie bei V05: beide Dateien durch die neuen ersetzen (altes Material darf weg). `v05.css` bleibt auf den neuen Seiten für die Plan-Regeln eingebunden (`bausteine.mjs:194`).
2. **`<Plan>`: Unterprogramm, Funktionskopf und Rückgabe (Pflicht, ca. 1 Stunde mit Test).** `planSpec` (`app/src/lib/mdx/bausteine.mjs:63–101`) kennt nur Eingabe, Ausgabe, Entscheidung, Schleife und das Rechteck; `Unterprogramm: abs(-3)` wird ein normales Rechteck (getestet). Nötig: `Unterprogramm: …` ergibt `K.P.sub` (die Zeichnung kennt das Symbol, `pap-engine.js:31, 212`), `Funktion: name(parameter)` als erste Zeile ergibt ein Start-Symbol mit dem Namen (`P.start` nimmt keinen Text, `pap-engine.js:27`, `P.end` nimmt einen, `:28`), `Rückgabe: wert` als letzte Zeile ergibt ein Ende-Symbol „Rückgabe wert“. Test in `app/skripte/tests/pap-engine.test.mjs` oder `mdx.test.mjs`. Nebenbei: Der Entscheidungstext im `<Plan>` läuft ohne `nice()` (`bausteine.mjs:79–90`), `==` ist davon nicht betroffen.
3. **Plan-Editor: Blocktyp „Funktion“ (Pflicht, Entscheidung 2 vom 2026-11-27, ca. 2 Tage).** Ist-Stand, gelesen im Arbeitsbaum vom 2026-11-27 (die Zeilen verschieben sich, solange Termin 06 an denselben Dateien baut): Der Editor erzeugt für „Unterprogramm“ nur die Aufrufzeile (`lineOf`, `pap-engine.js:323–335`), `parseCode` wirft bei jedem Blockkopf außer `if`, `while`, `for` (`HEAD_ERR`, `:459–460`; Fehlertext nennt `def` als „kommt später“), und `toPap` kennt nur einen Plan mit `P.start('start')` und `P.end('end')` (`:413–430`). Gebraucht wird ein Knoten `k: 'def'`: Kopf in `v` (`name(parameter)`), Rumpf in `body`, Rückgabewert in `ret` (leer heißt: kein `return`). Nicht nachprüfbar im Browser, nur gelesen. Die Arbeitsschritte:
   - **Knoten und Baum** (`pap-engine.js`, ca. 2 Stunden): Konstruktor `nDef(v, body, ret)` neben `nCall` (`:303`), `kids()` (`:310–315`) gibt den Rumpf zurück, Hilfsfunktion `isDef`; `numberTree` (`:363–371`) nummeriert die Funktionspläne nach dem Hauptplan; `toJson` und `fromJson` (`:549–575`) tragen `ret` mit; `find` und `flat` (`:577–598`) laufen ohne Änderung über `kids`. Kopfkommentar `:7` und `:15` nachziehen.
   - **Code-Erzeugung** (`toLines`/`toText`, `:343–362`, ca. 2 Stunden): `def v:` mit eingerücktem Rumpf (leer ergibt `pass`), danach `return ` plus `ret`, wenn `ret` nicht leer ist. Alle `def`-Blöcke kommen vor den Rest und werden durch eine Leerzeile getrennt (`toText` schreibt die Leerzeilen), `toPy` (`:317`) gilt auch für `ret`. Ein leerer Kopf ergibt `pass  # Lücke: Funktionskopf eintragen`, wie bei den anderen Lücken (`:323–335`). Der Editor lässt `def` nur auf oberster Ebene zu, die Engine prüft das nicht noch einmal.
   - **Parser** (`parseCode`, `:433–546`, ca. 3 Stunden, mit `{erweitert: true}`): In `parseBlock` (`:473–489`) ein Zweig für `def name(…):` auf Einrückung 0 (`^def\s+([A-Za-z_]\w*)\(([^)]*)\)\s*:$`), Rumpf über `parseBody` (`:490`); eine Zeile `return …` ist nur als letzte Zeile des Rumpfs erlaubt und wird zu `ret`, sonst Fehler mit Zeilennummer („`return` steht nur am Ende der Funktion.“). `def` in einem Block, mehr als zwei Parameter und Standardwerte werden mit einer lesbaren Meldung abgelehnt (Festlegung 5). `HEAD_ERR` (`:459–460`) nennt `def` nicht mehr als „später“. Ohne `erweitert` (Baukasten V05 und Vorgänger) bleibt alles wie bisher.
   - **Zeichnung** (`toPap`, `P.start`, `layout`, `svg`, ca. 4 Stunden): `P.start` bekommt einen optionalen Text (`:27`, bisher fest „Start“; `sizeOf` `:57` nimmt ihn schon), die Funktion wird zu `[P.start(name(params))] + Rumpf + [P.end('Rückgabe …')]` oder zu einem normalen Ende ohne `ret` (`P.end` nimmt Text, `:28`). Neu `toPapAll(tree)`, das den Hauptplan (ohne `def`-Knoten) und je Funktion einen Plan liefert, und `svgAll`, das die Pläne untereinander in eine Zeichnung setzt (je Plan ein `layout`, `:192–203`, mit Abstand und einer Überschrift „Funktion …“ für Screenreader, `describe` `:248–266` erzählt jeden Plan). `exportSvg` (`:285`) gibt alle Pläne aus.
   - **Einfügestellen** (`marks`, `:604–635`, ca. 3 Stunden): Die Stellen eines Funktionsplans haben denselben Aufbau (`slot: 'body'`), aber einen y-Versatz; `target.label` sagt „in die Funktion“. Auf oberster Ebene bietet der Hauptplan zusätzlich „Funktion davor/danach“; ein Funktionsblock erscheint nicht im Hauptplan, sondern als eigener Plan (Reihenfolge: Hauptplan, dann Funktionen).
   - **Editor-Oberfläche** (`pap-editor.js`, ca. 5 Stunden): `KIND` (`:37–46`) bekommt `def` (Name „Funktion“, Form „Start mit Namen, Ende mit Rückgabe“, Feld „Funktionskopf“ mit Platzhalter `z. B. umrechnen(x)`), `ORDER` (`:47`) und `makeNode` (`:49–58`) kennen `def`, `SIMPLE` (`:48`) nicht (die Art wird nicht umgestellt). `renderPanel` (`:173–217`) bekommt ein zweites Feld „Rückgabe (leer = kein return)“ für `def`. `openMenu` (`:277–297`) bietet `def` nur bei Zielen mit `slot: 'root'` an; in `insertAt` (`:232`) und `moveNode` (`:247–261`) darf ein `def` nicht in Blöcke hinein und nichts darf aus einem `def` in den Hauptplan springen, das Verschieben auf oberster Ebene sortiert nur die Funktionen. `renderPap` (`:127–150`) und die Fokusreihenfolge mit Pfeiltasten (`:262`, `stepSel`) laufen über alle Pläne; `nodeLabel` (`:113`) sagt „Funktion, kmh_in_ms(v)“. `hasGaps` (`:355`) zählt eine leere Rückgabe nicht als Lücke. `data-erlaubt="def,…"` (`:626`) schaltet das Symbol frei; ohne die Angabe gilt `ORDER`, das ist nur im freien Editor der Fall (`:491`), weil jede Aufgabe der Termine 01 bis 06 ihre Symbole nennt (nachgesehen: `labor.mdx` von v01 bis v05).
   - **Tests** (`app/skripte/tests/pap-engine.test.mjs`, ca. 3 Stunden, nach dem Muster der vorhandenen Tests): erzeugter Code für eine Funktion mit und ohne Rückgabe und mit leerem Rumpf; Funktionen stehen im Code vor dem Hauptplan, auch wenn der Block im Baum später steht; `parseCode(toText(baum))` ergibt denselben Baum (Rundlauf); `toJson` und `fromJson` mit `ret`; `return` mitten im Rumpf, `def` im Einrückblock und drei Parameter werfen mit Zeilennummer; `marks` liefert für den Funktionsplan Stellen mit `slot: 'body'`; die Lösung von Station 5 ergibt genau den Code aus Abschnitt F. Die Oberfläche lässt sich im Zuschnitt nur mit der Hand im Browser prüfen (ein Lauf mit Tastatur, einer mit Screenreader-Beschreibung); dafür bleiben ca. 2 Stunden.
   Zusammen ca. 2 Tage. Der Ausbau ändert die Dateien `site/assets/js/pap-engine.js` und `pap-editor.js`, die auch der freie PAP-Editor und alle Plan-Aufgaben laden: Die Tests der Termine 01 bis 06 (`pap-engine.test.mjs` und die Aufgaben-Tests) müssen unverändert grün bleiben, und `docs/PAP-EDITOR.md` bekommt einen Abschnitt „Funktion“. Die Aufgabe in Station 4 braucht das Symbol nicht; sie nimmt `round` als normale Operation (Entscheidung 6) und erzeugt `gerundet = round(summe, 2)`. Die Tests prüfen nur die Ausgabe, nicht die Form des Symbols (`w-plan.tests.py` in Termin 05 ebenso).
4. **Zählschleife, Schrittweite und Raute in Raute** sind Sache von Termin 06 (`forText` für drei Argumente, `pap-engine.js:379–395`). Für Termin 07 ist nichts nötig: Die Schleife in Station 7 und Training 2 ist `range(1, n + 1)` mit zwei Argumenten und wird als „i von 1 bis n?“ gezeichnet (belegt in Termin 05).
5. **trace mit Funktionsaufruf (Station 3, ca. 1 Stunde, nur Daten).** Die Schritte sind handgeschriebene JSON-Konfiguration (`cfg.code`, `cfg.vars`, `cfg.steps`, `aufgaben.js:899–905`), kein Python-Lauf. Die Spalten sind flach (`aufgaben.js:920–1000`), es gibt keine Aufrufstapel- oder Frame-Anzeige; deshalb heißen Parameter und Hauptvariable verschieden. Die Zeilenfolge 1, 4, 5, 2, 6 ist mit `sys.settrace` nachgeprüft, `x` bleibt in der Tabelle stehen. „Schritt für Schritt“ (`viz.js`) zeigt echte Frames mit Funktionsname (`frameTitle`, `viz.js:437–443`) und Rückgabewert (`:306`), setzt `def` nicht ein (`_NOSUB`, `:121`) und bricht bei 1000 Schritten oder 5 Sekunden ab (`:6`). Beides nur gelesen, nicht im Browser gesehen: einmal am Codeblock `quadrat` in Abschnitt 3 ansehen.
6. **Bausteine `kreis`, `maschine`, `lupe` (zusammen ca. 2 Tage).** `kreis` etwa 4 Stunden (Ring mit 16 oder 256 Stellen in SVG, Rechenkern `lesen(bits, mitVorzeichen)`, `plus(wert, schritt)`). `maschine` etwa 1 Tag: Schritt-Mechanismus und Markierung der aktiven Zeile aus dem Baustein `schleife` in `explorables-v04.js` übernehmen, drei Funktionen mit je zwei Fassungen als Daten, getrennte Tabelle für Parameter und Hauptprogramm. `lupe` etwa 0,5 Tag: Der Rechenkern in JavaScript stimmt mit Python überein, nachgerechnet mit Node: `String(0.1 + 0.2)` ergibt `0.30000000000000004`, `(0.1).toFixed(20)` ergibt `0.10000000000000000555`, `(0.1 + 0.2).toFixed(20)` ergibt `0.30000000000000004441`, die zehn Summen stimmen mit Python überein, `0.1 * 3` ergibt `0.30000000000000004`. Zwei Stolpersteine: JavaScript schreibt `6 / 2` als `3`, der Baustein muss `3.0` selbst bilden; `toFixed(2)` rundet genau halbe Werte anders als Python (`(0.125).toFixed(2)` ist `0.13`, Python `0.12`): Eingaben im Baustein auf eine Nachkommastelle (0,1 bis 0,9) begrenzen, dann gibt es keinen Unterschied (alle 81 Summen nachgerechnet). Rechenkerne ohne DOM oben in der Datei, Test `app/skripte/tests/explorables-v07.test.mjs` nach dem Muster von `explorables-v05.test.mjs`.
7. **Endlosschleifen und Zeilenobergrenze.** Die `while`-Schleife mit `x != 1.0` wird nie ausgeführt (nicht in einem laufenden Codeblock), sie erscheint nur im Baustein. Für die Knobelaufgabe „Primzahlen ohne Rest“ gilt die Zeilengrenze im Testlauf (`_MAX_ZEILEN = 200000`, `aufgaben.js:154–158`, Meldung „Dein Programm läuft nicht zu Ende. Ändert sich in der Schleife etwas an der Bedingung?“). Nachgerechnet (Zeilenereignisse, wie der Tracer sie zählt): Grenze 30 ergibt 16 450, 50 ergibt 78 771, 60 ergibt 137 337, 100 ergibt 647 606. Die Tests benutzen höchstens 31 (18 196 Zeilen mit der Musterlösung). Eine weniger sparsame Lösung (Schleifen von 1 bis n) bräuchte bei 50 deutlich mehr als die Musterlösung und könnte an die Grenze stoßen, deshalb steht „höchstens 50“ nur im Text und 50 in keinem Test.
8. **3D-Vorschau (`bauteil3d`), nur falls Frage 1 mit „ja“ beantwortet wird.** Geht ohne Codeänderung: Das Modul kommt über `data-files` an der Aufgabe (`aufgaben.js:563, 655, 862`; Pfad `../assets/py/bauteil3d.py`), die Vorschau läuft über `kursausgabe.zeige("3d", …)` (`bauteil3d.py:263–275`) und `vorschau3d.js`, die CSP braucht nichts Neues. Tests laufen im selben Namespace wie der Schülercode (`aufgaben.js` ca. 314) und können `volumen(…)` mit Toleranz (1 %) und `abmessungen(…)` (Bounding Box) prüfen. Offene Stolpersteine: Bei fehlendem `data-files` meldet die Seite `ModuleNotFoundError` mit dem Hinweis „import vergessen?“ (`aufgaben.js` ca. 121); der erste Lauf lädt Pyodide (ca. 10 MB); eine Aufgaben-Doku fehlt (`docs/3D-VORSCHAU.md` zeigt nur das alte V20-Beispiel). Aufwand für eine Aufgabe mit Tests und Vorschau etwa 1 bis 2 Stunden.
9. **Meldungen und Testdaten.** Alle Meldungen aus Festlegung 7 und Abschnitt C sind mit Python 3.13 ausgegeben (`NameError`, `SyntaxError: expected ':'`, beide `TypeError`). Die Tests mit Kommazahlen vergleichen als Zahl mit Toleranz (`zahlen()`, `aufgaben.js:270`). Alle Testdaten sind nachgerechnet und enden nie mit einer 5 an der Rundungsstelle (`f"{211.95:.1f}"` ergibt `211.9`, deshalb ist 3 und 7.5 im Training „Zylinder“ nicht dabei). Antworten mit Minuszeichen (Training 1, Zeile 6) werden wörtlich verglichen (`normVal`, `aufgaben.js:897`): Der Aufgabentext verlangt das Zeichen `-`, das Unicode-Minus `−` gilt nicht.
10. **Gebaut werden danach:** `kurs.yaml` (Eintrag V07 mit `aktiv: false`, `lektion: V07` bei Termin 7, Titel, kurz, hook, python), `app/inhalte/v07/lerneinheit.mdx`, `app/inhalte/v07/labor.mdx` mit den Aufgaben `w-vorgemacht`, `w-trace`, `w-plan`, `w-funktionsplan`, `w-parsons`, `w-luecken`, `w-eigene`, `tr-1` bis `tr-4`, Knobel `k-1` und `k-2` (je `.vorlage.py`, `.tests.py`, `.solution.py`, Pläne und Daten als `.json`), `explorables-v07.js`, `v07.css`. Gesamtaufwand der Werkzeug-Punkte 1, 2, 3, 5 und 6 etwa 5 Tage (Punkt 3 allein 2 Tage).

---

# Entscheidungen des Dozenten (2026-11-27)

Zwei Fragen weichen von der Empfehlung ab, die übrigen vier folgen ihr:

1. 3D-Aufgabe zu Funktionen erst in Termin 08 (Empfehlung).
2. **Abweichend: Der Plan-Editor bekommt einen Blocktyp „Funktion“** (`def` mit Parametern, Rumpf, `return`; Parser, Knoten, Code-Erzeugung, Zeichnung, Tests). Damit gibt es in Termin 07 eine Station „Funktionsplan zeichnen“, und Festlegung 6 („Studierende zeichnen in Termin 07 keinen Funktionsplan“) gilt nicht mehr. Nachgezogen am 2026-11-27 in Festlegung 6, Abschnitt F (Station 5), I und Technische Voraussetzung 3.
3. **Abweichend: `**` steht auf einer Karte nur zum Lesen** (`2 ** 8` ist `256`), passend zur Tabelle der Wertebereiche; damit geht auch `2 ** 64 + 1` als Beleg, dass Python nicht überläuft. Selbst geschrieben wird `**` nicht, in der Klausur nur gelesen. Nachgezogen am 2026-11-27 in Festlegung 11, Abschnitt 1, Karte 1, Kopf, Ablaufplan und „Bewusst weggelassen“.
4. `TypeError`-Meldungen nur in Tipps und Erklärungen (Empfehlung).
5. Vorzeichen: Der Dozent rechnet die Begründung einmal mündlich vor (`1111 1111` = −128 + 127 = −1, `1000 0000` = −128); Tabelle und Baustein zeigen nur Ergebnisse, im Selbstcheck keine Rechenfrage; als Aufgabe erlaubt ist nur der eine Schritt am Zahlenkreis (127 + 1 wird −128) (Empfehlung).
6. `round` steht im Plan in einem normalen Rechteck, das Unterprogramm-Symbol nur für eigene Funktionen (Empfehlung).

# Offene Fragen an den Dozenten (beantwortet, siehe oben)

1. **3D-Aufgabe in Termin 07 oder 08?** `KONZEPT.md` verlangt eine 3D-Aufgabe in P4 (Parameter ändern, Bauteil ändert sich), das Konzept sagt „`bauteil3d` mit Parametern erst Termin 08“. Technisch geht es jetzt (Technische Voraussetzung 8). Empfehlung: erst Termin 08. Termin 07 hat schon vier Kerninhalte je Block, und das Training „Zylinder“ bereitet die Funktion mit Parametern vor. Alternative: Training 4 als 3D-Aufgabe (`zylinder(radius, hoehe)` mit Vorschau), etwa 2 Stunden Mehraufwand, dafür ein Highlight im Termin.
2. **Funktionen im Plan-Editor?** Der Editor kann Unterprogramm-Aufrufe zeichnen, aber keine Funktionspläne und keinen `def`-Code (Technische Voraussetzung 3). Empfehlung: nur die Erweiterung des `<Plan>` (ca. 1 Stunde), Studierende lesen Funktionspläne und übertragen sie in Code. Alternative: Editor-Blocktyp „Funktion“ (halber bis ganzer Tag), dann gäbe es eine Station „Funktionsplan zeichnen“ und eine Klausurform mehr; das steht in Konkurrenz zur vollen Zeit in Block 3.
3. **`**` und `2 ** 64 + 1`.** `**` ist nicht eingeführt. Empfehlung: nicht einführen, den Überlauf-Gegensatz mit `4294967295 + 1` zeigen und das Verdoppeln als Schleife schreiben (Knobelaufgabe 2). Alternative: `**` auf einer Karte nur zum Lesen zeigen (`2 ** 8` ist 256), dann passt die Tabelle der Wertebereiche direkt dazu.
4. **`TypeError`-Meldungen in Termin 07.** Zwei Meldungen tauchen von selbst auf, wenn `print` statt `return` benutzt oder ein Parameter beim Aufruf vergessen wird (`TypeError: unsupported format string passed to NoneType.__format__`, `TypeError: begruessen() missing 1 required positional argument: 'name'`). Empfehlung: nur in Tipps und Erklärungen zeigen („hier fehlt ein `return`“), nicht als Thema; das Thema `TypeError` bleibt Termin 08. Alternative: Aufgaben und Tipps so bauen, dass sie nie vorkommen (die Tests lassen sich dann nicht auf `print` statt `return` prüfen).
5. **Wie viel Rechnung beim Vorzeichen?** Der Satz „das oberste Bit zählt −128“ legt nahe, für `1111 1111` zu rechnen: −128 + 127 = −1. Das Konzept sagt „kein Umrechnen“. Empfehlung: Der Dozent zeigt diese eine Rechnung mündlich an `1111 1111` und `1000 0000` als Begründung der Idee, Tabelle und Baustein zeigen nur das Ergebnis, im Selbstcheck gibt es keine Rechenfrage. Alternative: ganz ohne Rechnung („so wird es gelesen“), dann bleibt die Idee ein Merksatz ohne Begründung. Dazu: Training 1, Zeile 6 („127, nach 1-mal +1“) zählt nur am Kreis weiter und rechnet nichts um. Ist auch das Weiterzählen mit Vorzeichen als Aufgabe erlaubt? Empfehlung: ja, nur dieser eine Schritt (127 nach −128).
6. **Symbol für fertige Funktionen im Plan.** Eigene Funktionen sind im Plan das Rechteck mit Doppellinien. Gilt das auch für fertige Funktionen wie `round`, oder zeichnen die Studierenden `round` in einem normalen Rechteck (Operation), und `print` und `input` bleiben Ausgabe und Eingabe? Empfehlung: Unterprogramm nur für eigene Funktionen, `round` in einem normalen Rechteck (Station 4 ist so formuliert, dass beides richtig ist, die Tests prüfen das Symbol nicht). Alternative: auch fertige Funktionen als Unterprogramm, dann Station 4 wieder mit dem Symbol „Unterprogramm“ für `round`.
