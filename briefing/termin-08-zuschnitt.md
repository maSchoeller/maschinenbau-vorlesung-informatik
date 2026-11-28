# Zuschnitt Termin 08 (mit den Entscheidungen vom 2026-11-27)

Aufbau und Ton wie `briefing/termin-07-zuschnitt.md`. Grundlage ist `briefing/termin-08-10-konzept.md` mit den Entscheidungen des Dozenten vom 2026-11-27 (Entscheidung 2: `str`, `bool`, Umwandlung, `int(3.7)`, `TypeError` und Text mit `+`; Entscheidung 3: lokale Namen ohne `global`; Entscheidung 4: drei Blöcke Funktionen), dazu die vorgemerkten Punkte aus „Bewusst weggelassen“ von Termin 07. Alle Zahlen, Programme, Ausgaben, Fehlermeldungen und Testdaten sind mit Python 3.13.1 nachgerechnet (Pyodide 0.26.4 ist Python 3.12; die genannten Meldungen sind in beiden gleich). Die 3D-Maße sind mit `site/assets/py/bauteil3d.py` gerechnet. Die fünf Antworten des Dozenten vom 2026-11-27 stehen am Ende („Antwort 1“ bis „Antwort 5“) und sind eingearbeitet, vor allem Antwort 1: `%` ist der Rest beim Teilen und wird in Block 3 eingeführt.

## Aufteilung

| Einheit | Termin 08 |
|---|---|
| T5 Datentypen, Teil 3 von 3 | Block 1: `str` und `bool`, Text mit `+` zusammensetzen, `input()` liefert immer Text, Umwandlung mit `int()`, `float()`, `str()` (`int(3.7)` ist 3), `TypeError` lesen |
| P4 Funktionen, Teil 3 von 6 | Block 2: lokale Namen. Parameter und Variablen im Rumpf gibt es nur dort, draußen `NameError`, gleicher Name an zwei Plätzen, Werte hinein per Parameter, heraus per `return` |
| P4 Funktionen, Teil 4 von 6 | Block 3: der Rest beim Teilen mit `%`, Funktionen, die `True` oder `False` zurückgeben, `return` in einer Verzweigung, eine Funktion ruft eine andere |
| P4 Funktionen, Teil 5 von 6 | Block 4: Parameter formen ein 3D-Bauteil (`bauteil3d`): eine Funktion gibt einen Körper zurück |

Beispielwelt: Theorie Formularfelder und Punktestände (die 5, die als Text ankommt), Schraubenbezeichnung. Programmieren Spiele und Alltag (Fingerspiel Anna gegen Ben, Spielstand, Preis mit Steuer, Anrede, Schaltjahr). Maschinenbau dort, wo es natürlich passt: die Schraube in der 3D-Vorschau (Parameter Durchmesser und Länge) und die Schraubenbezeichnung `M10 x 40`.

Reihenfolge wie im Konzept. Die Pause liegt zwischen Block 2 und Block 3 (nur hier im Zuschnitt). Block 4 ist der kurze Block (25 Minuten, höchstens 24 verplant) und trägt die 3D-Aufgabe: Sie braucht nichts Neues in Python, nur Funktionen mit Parametern, die ein Körper-Ergebnis zurückgeben.

Abweichungen vom Konzept vorweg:

- **`%` kommt neu dazu (Antwort 1).** Das Konzept schloss `%` aus (Zeile 28) und stellte es als Frage an den Dozenten. Seit der Entscheidung wird `%` in Block 3 eingeführt: Rest beim Teilen, gezeigt an kleinen Zahlen (`7 % 2` ist 1, `8 % 2` ist 0). `ist_gerade` heißt `n % 2 == 0`, das Schaltjahr nutzt `zahl % teiler == 0`. `//` kommt nicht vor. Das Verfahren mit `int` und Verdoppeln entfällt.
- **Im Plan hat jede Funktion ein Ende.** Der Plan-Editor kennt nur eine Rückgabe am Ende (Termin 07, Festlegung 6). Die Pläne in Termin 08 (Lerneinheit, Station 4, Training 2) zeichnen deshalb die Antwort mit einer Variablen (`antwort = True`, dann `Rückgabe: antwort`); im Code steht das `return` zusätzlich schon im Zweig, als Abkürzung. Beides gibt dasselbe zurück. Antwort 3.
- **Station „Lücken füllen“ entfällt.** Die sieben Stationen decken die Reihenfolge von Termin 01 ab (Werkzeugkasten, Vorgerechnet, Ablauf verfolgen, Plan zeichnen, Zeilen ordnen, erste eigene Aufgabe, Fehler finden), eine achte füllt keinen Block mehr (Block 2 bis 4 sind voll).
- **Eine Station „Fehler finden“ ist wieder dabei** (in Termin 07 entfallen): Der `NameError` aus Block 2 ist genau ihr Stoff.
- **Der Warm-up bleibt auf Papier:** Training 07, Aufgabe 1, wie im Konzept.

## Festlegungen für Termin 08

Es gelten alle Festlegungen aus Termin 02 bis 07 (Stationsreihenfolge von Termin 01, drei gestufte Tipps, Grenzfall in jeder Aufgabe, höchstens 28 Minuten je Block verplant, im letzten Block höchstens 24, Videos laufen nicht im Termin, Pausen stehen nicht in der App, Meldungstexte ohne Gedankenstrich, Testdaten mit letztem Eingabewert, der das Ergebnis ändert, Funktionen mit höchstens zwei Parametern, Zahlen ohne 5 an der Rundungsstelle). Dazu neu:

1. **Kennung V08**, Ordner `app/inhalte/v08/`, Adressen `v08-text-namen-und-funktionen.html` und `v08-labor.html`, Bausteine in `explorables-v08.js` mit `v08.css`. Beide Dateinamen sind belegt (alte V08 „Datenstrukturen“): Technische Voraussetzung 1. In `kurs.yaml` bekommt `termine` bei `nr: 8` den Zusatz `lektion: V08` (`kurs.yaml:66`), der Eintrag unter `lektionen` zunächst mit `aktiv: false` wie V06 und V07.
2. **Wörter (Theorie):** Datentyp, `str` (Text), `bool` (Wahrheitswert), umwandeln. „Text“ steht für `str`, „Wahrheitswert“ für `bool` (`True` und `False`, groß geschrieben). `float` und `int` gelten aus Termin 07. **Wörter (Programmieren):** lokal („gilt nur in der Funktion“), Rückgabewert, Aufruf (wie Termin 07). Rest (beim Teilen: `%`, Antwort 1). Das Wort „global“ kommt nicht vor (Antwort 2).
3. **Text und Anführungszeichen.** Text steht in doppelten Anführungszeichen (`"Lea"`), Leerzeichen gehören in den Text (`"Hallo " + name`). `+` zwischen Text und Text hängt aneinander, `+` zwischen Zahl und Zahl rechnet, `+` zwischen Text und Zahl ist ein `TypeError`. Die f-Strings bleiben die erste Wahl für die Ausgabe; `+` für Text steht dort, wo es der Stoff ist (Block 1, Station 5, Training 3) und wo der Aufgabentext „mit `+`“ sagt. Selbst geschrieben wird nur `+`, nicht `*` mit Text und nicht `+=`. **Text vergleichen:** `==` zwischen Text und Text fragt, ob beide gleich sind (`name == "Lea"` ergibt `True`). Das ist die einzige Stelle, an der der Kurs es einführt (Karte 1); Termin 10 (Karte 2 „Noch einmal?“, Knobelaufgabe) benutzt es danach.
4. **Umwandlung.** `int(...)`, `float(...)` und `str(...)` auf einen Wert, nie verschachtelt tiefer als zweimal (`int(input(...))` ist die bekannte Form). `int(3.7)` ist `3`: schneidet ab, rundet nicht (Tests und Beispiele nur mit positiven Zahlen; `int(-3.7)` kommt nicht vor). `int("3.7")` und `int("abc")` ergeben `ValueError` und sind nicht Thema. `type(...)` gilt aus Termin 07. **Die Meldung** `TypeError: can only concatenate str (not "int") to str` (Text plus Zahl) wird gelesen, von unten nach oben: Sie nennt die beiden Typen, die nicht zusammenpassen. Das ist seit Entscheidung 2 Stoff (anders als in Termin 07, dort nur in Tipps). Die zweite Meldung `TypeError: unsupported operand type(s) for +: 'int' and 'str'` (Zahl plus Text) ist nur im Baustein zu sehen und wird nicht erklärt (Block 1 hat schon vier Kerne).
5. **Lokale Namen** (Entscheidung 3). Regel: Parameter und Variablen im Rumpf gibt es nur dort und nur, solange die Funktion läuft; draußen sind sie unbekannt (`NameError: name 'ergebnis' is not defined`). Werte kommen über Parameter hinein und über `return` heraus; ein Ergebnis, das du draußen brauchst, speicherst du draußen in einer Variablen. Dieselbe Bezeichnung drinnen und draußen sind zwei verschiedene Plätze (`x = 5` draußen, `x` als Parameter drinnen): Das wird nur beim Lesen gezeigt, an genau drei Stellen: Programm B im Baustein (Block 2), Station 3 und Selbstcheck 5. Überall, wo selbst geschrieben wird (Vorhersagen, Stationen 4 bis 7, Training, Knobel), gilt die Festlegung 5 aus Termin 07 „verschiedene Namen“ weiter. Das Schlüsselwort `global` kommt nicht vor. Zu Namen von draußen steht ein ehrlicher Satz im Merkkasten (Antwort 2): Python lässt eine Funktion auch einen Namen von draußen lesen, das nutzen wir nicht. Namen im Hauptprogramm heißen „draußen“, das Wort „global“ kommt nicht vor. **Ab Termin 09 dürfen Parameter und Variable im Hauptprogramm gleich heißen** (`hinweis(geraten, geheim)` mit `geraten` und `geheim` auch im Hauptprogramm, Entscheidung 7 des Konzepts; Zuschnitt 09, Festlegung 5 und dort Entscheidung 3): Nach diesen drei Leseübungen ist „gleicher Name, zwei Plätze“ bekannt. In Termin 08 selbst bleibt es bei verschiedenen Namen.
6. **`return` in einer Verzweigung.** Selbst geschrieben werden Funktionen mit `if`, `elif` (seit Termin 03) und `else`, in jedem Zweig ein `return` (und die Variante mit einer Variablen und einem `return` am Ende). Nicht geübt: `return` in einer Schleife und eine Funktion, deren Zweige nicht alle zurückgeben. Dieser Fall steht einmal als Vorhersage da (`None`, Abschnitt 3) und wird nur gelesen. Funktionen, die `True` oder `False` zurückgeben, heißen `ist_…`. Eine Funktion kann eine andere aufrufen (`sieger` ruft `ist_gerade`): Reihenfolge wie bisher, erst definieren, dann aufrufen; in den Aufgaben steht die aufgerufene Funktion immer oben.
7. **Im Plan:** Der Aufruf einer eigenen Funktion ist das Unterprogramm-Rechteck (Termin 07, Festlegung 6). Steht der Aufruf in der Bedingung (`if ist_gerade(summe):`), steht er als Text in der Raute: `ist_gerade(summe)?`. Der Plan einer Funktion mit `if` hat einen Zweig `ja`, einen Zweig `nein` und am Ende ein Symbol „Rückgabe antwort“ (Technische Voraussetzung 3: Der `<Plan>` kann das schon, der Editor auch). **Der Plan-Editor wird nicht erweitert**: Station 4 zeichnet `sieger(summe)` mit dem Blocktyp „Funktion“ (Technische Voraussetzung 4).
8. **`%`, `ist_gerade` und `ist_teilbar`.** `%` ist der Rest beim Teilen (`7 % 2` ist `1`, `8 % 2` ist `0`, `10 % 3` ist `1`; nachgerechnet) und wird in Block 3 an kleinen positiven Zahlen gezeigt. Es wird nur mit ganzen Zahlen ab 0 und einem Teiler über 0 benutzt (Teiler 0, negative Zahlen und Kommazahlen kommen nicht vor). `//` wird nicht eingeführt. `ist_gerade(n)` ist `n % 2 == 0`, die Verallgemeinerung `ist_teilbar(zahl, teiler)` ist `zahl % teiler == 0` (Training 4). Die Form, den Vergleich selbst zurückzugeben (`return zahl % teiler == 0`), steht nur als zweite Fassung in der Auflösung zu Training 4, nicht in der Lerneinheit und in keiner Musterlösung als Hauptfassung (alle Musterlösungen haben `if` und `else`).
9. **3D mit Parametern.** `from bauteil3d import *` steht in der Vorlage (nicht erklärt, wie in Termin 06). Werkzeuge: `zylinder(d, l)` (Durchmesser, Länge), `ring(d_aussen, d_innen, l)`, `verschiebe(körper, dx, dy, dz)`, überall mit allen drei Zahlen, auch bei einer reinen Verschiebung nach rechts (`verschiebe(körper, 40, 0, 0)`; in Termin 06 nur `verschiebe(säule, x)`; die Standardwerte des Moduls kommen nicht vor), `vereinige(a, b)`, `zeige(körper)`. Die Maße kommen aus `abmessungen(…)` und `volumen(…)` des Moduls; die Tests rechnen gegen die facettierten Sollwerte (48 Ecken, 0,3 % unter π · r² · l), Abmessungen mit Toleranz 0,5 mm, Volumen 1 %. In der Klausur wird `bauteil3d` nicht vorausgesetzt (`KONZEPT.md`).
10. **Ablauf verfolgen mit lokalen Namen.** In Termin 07 verschwindet `x` nach der Rückgabe in der Tabelle (`weg`; Antwort 5, die Änderung an `w-trace.daten.json` gehört zu Termin 07). Termin 08 sagt dazu nichts mehr und korrigiert nichts. In Termin 08 hat die Tabelle für Namen, die in beiden Räumen vorkommen, zwei Spalten („preis außen“, „preis innen“), und nach dem Aufruf trägt man in „preis innen“ das Wort `weg` ein.
11. **Zufall.** Termin 08 hat keinen Zufall und kein `import random` (kommt in Termin 09 und 10, Entscheidung 6). Alle Programme und Tests sind deshalb deterministisch. Vorgemerkt für Termin 09 und 10: Die Tests laufen im Namensraum des Schülercodes (`aufgaben.js:314`, `exec(compile(tests_src, "<tests>", "exec"), ns)`), können also vor dem Lauf `random.seed(...)` setzen oder `random.randint` ersetzen; das wird dort beschrieben und geprüft (Hilfsfunktion `mit_zufall`, Zuschnitt 09, Technische Voraussetzung 2).
12. **Tests mit festen Eingaben:** Wie bisher mindestens ein Test, in dem der letzte Wert das Ergebnis ändert, und ein Grenzfall (hier: kleinste Summe beim Fingerspiel, Jahr durch 100, Zahl 1 bei „Gerade Zahlen“, Netto 0, Länge 10 bei der Schraube).

---

# Termin 08

## A. Kopf

- Titel: **Zahl oder Text: Datentypen, lokale Namen und Funktionen mit Antwort** (neuer Arbeitsname: „Zahl oder Text“ trägt die Theorie, „lokale Namen und Funktionen mit Antwort“ die drei Programmierblöcke)
- Vorspann: Wenn du eine Zahl eintippst, kommt sie bei Python als Text an. Heute siehst du, warum das so ist und wie du Text, Zahl und Ja oder Nein ineinander umwandelst. Danach geht es um die Frage, welche Namen eine Funktion kennt, was beim Teilen übrig bleibt, wie eine Funktion mit True oder False antwortet, wie eine Funktion eine andere ruft und wie ein einziger Parameter eine Schraube in 3D länger oder dicker macht.
- Lernziele:
  - die Datentypen `int`, `float`, `str` und `bool` unterscheiden, wissen, dass `input()` immer Text liefert, und mit `int()`, `float()` und `str()` umwandeln, auch eine Kommazahl in eine ganze Zahl
  - Text mit `+` zusammensetzen und die Meldung `TypeError` bei Text plus Zahl lesen
  - erklären, welche Namen nur in einer Funktion gelten, und warum draußen ein `NameError` kommt
  - den Rest beim Teilen mit `%` berechnen und damit prüfen, ob eine Zahl gerade ist
  - eine Funktion schreiben, die mit True oder False antwortet und die eine andere aufruft, und den Plan dazu zeichnen
  - mit Parametern ein 3D-Bauteil bauen: eine Funktion, die einen Körper zurückgibt
- kurz: „str, bool, lokale Namen“
- hook: „5 + 3 ist nicht immer 8“
- neu in Python (Feld `python` in `kurs.yaml`): `python: ["str, bool", "int(), float(), str()", "Text mit + und ==", "lokale Namen", "Rest mit %", "Funktion ruft Funktion", "return in if"]`. Dazu die Meldungen `TypeError: can only concatenate str (not "int") to str` (gelesen), `TypeError: unsupported operand type(s) for +: 'int' and 'str'` (nur im Baustein zu sehen) und `NameError: name 'ergebnis' is not defined` (alle mit Python 3.13 ausgegeben). Nicht im Lerntext, nur in Tipps: `UnboundLocalError: cannot access local variable 'name' where it is not associated with a value` (Station 4, Tipp 3; Antwort 2).

## B. Warm-up (0–10)

Training Termin 07, Aufgabe 1 „Wertebereich und Überlauf“ (`tr-1`, wie dort gestellt, sechs Fragen): auf Papier (5 Minuten), Auflösung an der Tafel (2 Minuten). Auflösung (alle Zeilen mit Python 3.13 nachgerechnet):

| Zeile | Frage | Ergebnis |
|---|---|---|
| 1 | Wie viele Werte hat eine Zahl mit 6 Bit? | 64 |
| 2 | Größte Zahl mit 6 Bit, ohne Vorzeichen? | 63 |
| 3 | Größte Zahl mit 7 Bit, ohne Vorzeichen? | 127 |
| 4 | 8-Bit-Zähler ohne Vorzeichen auf 250, nach 10-mal +1? | 4 |
| 5 | 4-Bit-Zähler ohne Vorzeichen auf 14, nach 3-mal +1? | 1 |
| 6 | 8-Bit-Zähler mit Vorzeichen auf 127, nach 1-mal +1? | -128 |

Brücke in die Theorie (3 Minuten, Frage in die Runde): In allen sechs Zeilen waren dieselben Bits einmal Zahl, einmal Zahl mit Vorzeichen. Der Datentyp sagt, wie man die Bits liest. Du tippst bei `input()` eine 5 ein. Liest Python die Bits als Zahl 5, oder als etwas anderes? Auflösung in Abschnitt 1.

## C. Lerneinheit

### Abschnitt 1 · Zahl oder Text: str, bool und Umwandlung (T5, Teil 3 · 10–40)

Kernaussage: Ein Wert hat einen Datentyp, und Python rechnet nur mit Werten, die zusammenpassen. Was du mit `input()` einliest, ist immer Text. Mit `int()`, `float()` und `str()` wandelst du um. Block 1 hat vier Kerne: die zwei neuen Typen, Text zusammensetzen, Umwandlung (mit `int(3.7)`), die Fehlermeldung lesen.

Vor dem Baustein „Umwandler“ stehen weder `int(3.7)` noch `"5" + "3"` noch die beiden Meldungen. Was vor dem Baustein steht, ist Typen und Text mit Wörtern.

- Die Typen. Aus Termin 07 kennst du `int` (ganze Zahl) und `float` (Kommazahl). Neu: `str` (Text, in Anführungszeichen: `"Hallo"`, `"5"`) und `bool` (Wahrheitswert: `True` oder `False`). Das Ergebnis eines Vergleichs ist ein `bool`: `print(5 > 3)` ergibt `True`, `type(5 > 3)` zeigt `<class 'bool'>`. `type("Hallo")` zeigt `<class 'str'>`. Ein `bool` kennt nur zwei Werte. Auch Text liegt als Bits im Speicher; welche Bits zu welchem Zeichen gehören, kommt in Termin 10.
- Text zusammensetzen. Mit `+` hängst du Text aneinander: `name = "Lea"`, `print("Hallo " + name)` ergibt `Hallo Lea`. Das Leerzeichen gehört in den Text. Wie ein f-String, nur mit `+`. Mit `==` vergleichst du Text mit Text: `print(name == "Lea")` ergibt `True` (Karte 1).
- Baustein „Umwandler“ (Abschnitt D, Baustein 1) mit zwei Vermutungen: Was ergibt `int(3.7)`? Was ergibt `"5" + "3"`? Danach probierst du die Umwandlungen und alle vier Kombinationen von Zahl und Text mit `+`.
- Nach dem Baustein (Beobachtung): `int(3.7)` ist `3`. `int` schneidet ab, es rundet nicht. `"5" + "3"` ist `53`: In Anführungszeichen ist die 5 ein Zeichen, kein Zahlenwert. Text plus Zahl ist ein Fehler: `"5" + 3` meldet `TypeError: can only concatenate str (not "int") to str`. Lies von unten: `TypeError` heißt „Typen passen nicht“, `str` und `int` sind die zwei Typen. Umgekehrt (`3 + "5"`) meldet Python eine andere Zeile, im Baustein zu sehen, aber nicht Stoff. Die Lösung hängt davon ab, was du willst: zahlen, dann `int("5") + 3` (ergibt `8`), oder Text, dann `"5" + str(3)` (ergibt `53`).
- `input()` liefert immer Text. `alter = input("Alter: ")` gibt bei der Eingabe 17 den Text `"17"`, nicht die Zahl. Deshalb schreibst du seit Termin 01 `int(input(...))` und `float(input(...))`: Das ist genau diese Umwandlung. `str(...)` geht in die andere Richtung: `"Punkte: " + str(12)` ergibt `Punkte: 12`.
- Begriffs-Hinweise (`<Begriff e="…">`): Datentyp „Sagt, wie die Bits eines Werts gelesen werden.“ (aus Termin 07 übernommen) · Text `str` „Eine Folge von Zeichen in Anführungszeichen, zum Beispiel "Lea" oder "5".“ · Wahrheitswert `bool` „Ein Wert mit nur zwei Möglichkeiten: True oder False. Jeder Vergleich liefert einen.“ · Umwandlung „Aus einem Wert eines Typs einen Wert eines anderen Typs machen, zum Beispiel int("5").“

Vorhersage „input und plus“:

```python
alter = input("Alter: ")
print(alter + 1)
```

Eingabe 17. Welche Ausgabe?

- 18
- 171
- [x] `TypeError: can only concatenate str (not "int") to str`
- `17 + 1`

Auflösung: `input` liefert den Text `"17"`. Text plus Zahl geht nicht. Richtig wäre `alter = int(input("Alter: "))`.

### Abschnitt 2 · Namen, die nur in der Funktion gelten (P4, Teil 3 · 40–70)

Kernaussage: Parameter und Variablen im Rumpf gibt es nur in der Funktion und nur, solange sie läuft. Werte kommen über Parameter hinein und über `return` heraus.

- Rückgriff: In Termin 07 hast du `fahrenheit(c)` mit der Variablen `grad` im Rumpf geschrieben und den Aufruf mit `Schritt für Schritt` gesehen. Frage an alle, ohne Antwort: Was wird aus den Namen der Funktion, wenn sie fertig ist? Das Bild vom eigenen Raum kommt erst in der Beobachtung nach Programm A.
- Baustein „Zwei Räume“ (Abschnitt D, Baustein 2), Programm A mit Vermutung: Was passiert in der letzten Zeile?

```python
def quadrat(x):
    ergebnis = x * x
    return ergebnis

zahl = quadrat(4)
print(zahl)
print(ergebnis)
```

  Ausgabe: `16`, dann `NameError: name 'ergebnis' is not defined` (Zeile 7). Der Name `ergebnis` gehört dem Raum `quadrat` und gibt es draußen nicht. Dasselbe gilt für den Parameter `x`: `print(x)` unter dem Aufruf meldet `NameError: name 'x' is not defined`. Beobachtung, jetzt erst das Bild: Die Funktion ist ein eigener Raum. Was drinnen angelegt wird, bleibt drinnen und ist weg, sobald die Funktion fertig ist. Nur was `return` herausgibt, kommt an.
- Hinein und heraus: Was die Funktion wissen soll, gibst du ihr als Parameter. Was draußen ankommen soll, gibst du mit `return` zurück und speicherst es draußen (`zahl = quadrat(4)`). Die Antwort steht nicht in `ergebnis`, sondern in `zahl`.
- Gleicher Name, zwei Plätze (Programm B im Baustein, mit Vermutung: Was zeigt `print(x)` in Zeile 7?):

```python
def verdoppeln(x):
    x = x * 2
    return x

x = 5
y = verdoppeln(x)
print(x)
print(y)
```

  Ausgabe: `5`, `10`. Draußen gibt es ein `x` (5), in der Funktion ein anderes `x` (zuerst 5, dann 10). Die Funktion hat dein `x` nicht verändert: Sie hat den Wert bekommen, ihr `x` ist ein eigener Platz. Das übst du heute nur beim Lesen (Ablauf verfolgen, Selbstcheck). Wenn du selbst schreibst, benutzt du verschiedene Namen.
- „Schritt für Schritt“ am Programm B zeigt dieselben Räume (eigener Kasten, nach `return` weg). Angebot zum Nachlesen in der Lerneinheit; im Termin läuft es nicht, der Baustein „Zwei Räume“ hat es gerade gezeigt.
- Merksatz: **Hinein per Parameter, heraus per `return`.**
- Merkkasten, ein ehrlicher Satz (Antwort 2): „Python lässt eine Funktion auch einen Namen von draußen lesen. Das nutzen wir nicht: Eine Funktion, die nur ihre Parameter benutzt, verstehst du, ohne das ganze Programm zu lesen.“ Das Wort „global“ und das Schlüsselwort kommen nicht vor; Namen im Hauptprogramm heißen „draußen“. `UnboundLocalError` steht nur im Hinweistext (Technische Voraussetzung 5).
- Begriffs-Hinweis: lokal „Gilt nur in der Funktion: Parameter und Variablen im Rumpf. Draußen sind sie unbekannt.“

Vorhersage „Aufruf ohne Speichern“:

```python
punkte = 0

def treffer(stand):
    return stand + 10

treffer(punkte)
print(punkte)
```

- 10
- [x] 0
- 20
- `NameError`

Auflösung: Die Funktion gibt 10 zurück, aber draußen speichert niemand den Wert. `punkte` draußen bleibt 0. Wer den Wert braucht, schreibt `punkte = treffer(punkte)`. (Die Vorhersage prüft nur den nicht gespeicherten Rückgabewert, deshalb heißen Parameter und Variable verschieden.)

### Abschnitt 3 · Rest, True und False: Funktionen mit Antwort (P4, Teil 4 · 80–110)

Kernaussage: Mit `%` fragst du, was beim Teilen übrig bleibt, und kannst so prüfen, ob eine Zahl gerade ist. Eine Funktion kann mit `True` oder `False` antworten. Dann steht ihr Aufruf direkt in einem `if`. Sie darf eine andere Funktion aufrufen. `return` beendet die Funktion sofort, auch mitten in einer Verzweigung.

- Spiel: Fingerspiel. Anna und Ben zeigen je 1 bis 5 Finger. Ist die Summe gerade, gewinnt Anna, sonst Ben. Dazu braucht es die Frage „Ist diese Zahl gerade?“ als eigene Funktion.
- Der Rest beim Teilen (neu, 4 Minuten). Zusammen zeigen Anna und Ben 7 Finger: 7 geteilt durch 2 ist 3, und 1 bleibt übrig. Dieser Rest heißt in Python `7 % 2` und ist `1`. `8 % 2` ist `0`: Es bleibt nichts übrig. `10 % 3` ist `1`. Das Zeichen `%` heißt Prozentzeichen, bedeutet hier aber nicht Prozent, sondern „Rest beim Teilen“. Eine Zahl ist gerade, wenn beim Teilen durch 2 nichts übrig bleibt: `n % 2 == 0`. Erst wird der Rest gerechnet, dann verglichen. Kurze Frage an alle, nur mündlich und nicht in der App: Was ist `9 % 2`, was `12 % 5`, was `20 % 4`? (Antworten 1, 2 und 0, nachgerechnet.) `//` kommt nicht vor.
- Plan zuerst (neuer Ablauf: eine Funktion antwortet mit einem Wahrheitswert). `<Plan>` für `ist_gerade` mit einem Ende (Festlegung 7):

```text
Funktion: ist_gerade(n)
Entscheidung: n % 2 == 0?
  ja:
    antwort = True
  nein:
    antwort = False
Rückgabe: antwort
```

  Gerade heißt: Rest 0 beim Teilen durch 2 (8: `8 % 2` ist 0; 7: `7 % 2` ist 1).
- Code, erst die Form nach dem Plan, dann die Abkürzung:

```python
def ist_gerade(n):
    if n % 2 == 0:
        antwort = True
    else:
        antwort = False
    return antwort
```

  Abkürzung, dasselbe: in jedem Zweig gleich `return`.

```python
def ist_gerade(n):
    if n % 2 == 0:
        return True
    else:
        return False
```

  Karte 4 zeigt `print(ist_gerade(8))` ergibt `True`, `print(ist_gerade(7))` ergibt `False`. Der Aufruf steht auch in der Bedingung: `if ist_gerade(10):` druckt `gerade`. `return` beendet die Funktion sofort: Von den zwei `return` läuft immer nur eines.
- Vorhersage „Zweig ohne return“ (gelesen, nicht geübt; im Termin nicht gezeigt, bleibt in der Lerneinheit zum Nachlesen):

```python
def ist_gerade(n):
    if n % 2 == 0:
        return True

print(ist_gerade(7))
```

- True
- False
- [x] None
- Eine Fehlermeldung

  Auflösung: Für 7 läuft der `if`-Zweig nicht, die Funktion endet ohne `return` und gibt `None` zurück (wie in Termin 07). Deshalb steht in jedem Zweig ein `return`.
- Funktion ruft Funktion. `sieger(summe)` fragt `ist_gerade`:

```python
def sieger(summe):
    if ist_gerade(summe):
        return "Anna"
    else:
        return "Ben"
```

  Hier steht nur der Code, kein Plan: Den Plan von `sieger(summe)` (Raute `ist_gerade(summe)?`, `ja` `name = "Anna"`, `nein` `name = "Ben"`, Ende „Rückgabe name“) zeichnen die Studierenden erst in Station 4, er steht in der Auflösung dort. Baustein „Aufrufkette“ (Abschnitt D, Baustein 3) mit Vermutung: Wie viele Kästen stehen auf dem Höhepunkt übereinander? Der Aufruf `sieger(7)` ruft `ist_gerade(7)`, und `ist_gerade` ist fertig, bevor `sieger` weitermacht. Jede Funktion hat ihren eigenen Raum (Abschnitt 2).
- Das Hauptprogramm (Station 2 „Vorgerechnet“): `wer = sieger(anna + ben)`, `print("Sieger:", wer)`. Mit 3 und 5 steht `Sieger: Anna`, mit 2 und 3 `Sieger: Ben`.
- Begriffs-Hinweis: Rest `%` „Was beim Teilen übrig bleibt. 7 % 2 ist 1, 8 % 2 ist 0.“ · Wahrheitswert-Funktion „Eine Funktion, die True oder False zurückgibt. Ihr Name beginnt oft mit ist_.“

### Abschnitt 4 · Parameter formen ein Bauteil (P4, Teil 5 · 110–135)

Kernaussage: Eine Funktion kann auch einen Körper zurückgeben. Mit anderen Parametern entsteht ein anderes Bauteil. Der Rest ist Funktionen, die Funktionen aufrufen: `zylinder`, `verschiebe` und `vereinige` sind selbst Funktionen.

- Rückgriff: In Termin 06 hast du die Säulenreihe gebaut. Jetzt packst du den Bau in eine eigene Funktion. Bisher gab deine Funktion Zahlen und Text zurück, jetzt gibt sie einen Körper zurück. Für Python ist das auch nur ein Wert.
- Rückgriff-Satz zu `verschiebe`: „Jetzt mit allen drei Richtungen: rechts, hinten, oben.“
- Beispiel am Beamer (es ist nicht die Aufgabe von Station 6): eine Buchse mit 2 mm Wand.

```python
from bauteil3d import *

def buchse(aussen, laenge):
    return ring(aussen, aussen - 4, laenge)

zeige(vereinige(buchse(30, 20), verschiebe(buchse(20, 40), 40, 0, 0)))
```

- Vor dem Lauf werden die Maße nicht genannt. Vermutung (Alle ändern im Beispiel einen Parameter): Wie dick ist die Wand der ersten Buchse, wenn du im ersten Aufruf die 30 durch 50 ersetzt? Danach „Ausführen“ und in der Vorschau nachsehen. Auflösung (nach dem Lauf): Die Wand bleibt 2 mm, weil der Innendurchmesser `aussen - 4` ist. Die Vorschau zeigt zwei Buchsen: eine 30 mm breit und 20 mm hoch, daneben, 40 mm weiter rechts, eine 20 mm breit und 40 mm hoch; zusammen 65 × 30 × 40 mm. Die Funktion `buchse` ruft `ring` auf und gibt den Körper zurück.
- Übertragen (Station 6): Der Plan der Funktion `schraube(d, l)` steht da (Kopf doppelt so breit wie der Schaft), geschrieben wird die Funktion, das Hauptprogramm steht schon in der Vorlage.
- Merke: Die Funktion bekommt Maße und gibt einen Körper zurück. Wer sie aufruft, entscheidet über Größe und Platz. Die 3D-Vorschau kommt in der Klausur nicht vor; was du hier übst, sind Parameter und `return`.

## D. Interaktive Bausteine (3)

1. **`umwandler` – „Umwandler“** (Abschnitt 1). Teil 1 „Umwandeln“: Auswahl eines Werts (`5`, `"5"`, `3.7`) und einer Funktion (`int`, `float`, `str`), Knopf „Ausführen“. Sehen: die Zeile, die Python bekommt (zum Beispiel `print(int(3.7))`), darunter die Ausgabe und der Typ des Ergebnisses als Wort (`int`, `float`, `str`). Das Ergebnis `5` aus `str(5)` steht mit Anführungszeichen daneben (`'5'`), damit Zahl und Text unterscheidbar sind. Alle neun Kombinationen sind erlaubt und liefern (nachgerechnet): `int(5)` 5, `float(5)` 5.0, `str(5)` 5 (Text); `int("5")` 5, `float("5")` 5.0, `str("5")` 5 (Text); `int(3.7)` 3, `float(3.7)` 3.7, `str(3.7)` 3.7 (Text). Der Typ steht ohnehin bei jedem Ergebnis; `type(…)` und `9.99` kommen im Baustein nicht vor (Karte 1 zeigt `type`). Teil 2 „Zusammenrechnen“: zwei Auswahlfelder (erste und zweite Zahl, je als Zahl oder als Text: `5` oder `"5"`, `3` oder `"3"`), Knopf „Ausführen“, Ergebnis `print(5 + 3)` 8, `print("5" + "3")` 53, bei Text und Zahl die Meldung wörtlich (`TypeError: can only concatenate str (not "int") to str`, `TypeError: unsupported operand type(s) for +: 'int' and 'str'`) mit dem Satz „Das Programm bricht in dieser Zeile ab.“ **Ausgangszustand:** Beide Teile zeigen nur den Satz „Noch nichts ausgeführt. Vermute, wähle und drück auf Ausführen.“ Vermutung 1 (vor Teil 1): Was ergibt `int(3.7)`? (4, 3, 3.7, Fehler; richtig 3). Vermutung 2 (vor Teil 2): Was ergibt `"5" + "3"`? (8, 53, 5 3, Fehler; richtig 53). Beobachtung danach: `int` schneidet ab, Zahl in Anführungszeichen rechnet nicht, Text plus Zahl ist ein Fehler. Der Rechenkern ist eine feste Tabelle der 13 Ergebnisse, geprüft gegen die Python-Werte dieses Papiers.
2. **`raeume` – „Zwei Räume“** (Abschnitt 2). Einstellen: Auswahl von Programm A (`quadrat`, mit `ergebnis` draußen) oder Programm B (`verdoppeln`, mit `x` an zwei Plätzen), Knopf „Ein Schritt“ und „Von vorn“. Sehen: links das Programm mit der aktiven Zeile, rechts ein Kasten „Hauptprogramm“ mit seinen Namen und, solange die Funktion läuft, ein zweiter Kasten mit dem Namen der Funktion und ihren Namen; ein Pfeil trägt den Rückgabewert; nach `return` ist der zweite Kasten weg. Programm A: sieben Schritte, Zeile 1 (nur `def`), 5 (Aufruf, Kasten `quadrat` mit `x = 4`), 2 (`ergebnis = 16`), 3 (`return`, Kasten weg), 5 (`zahl = 16`), 6 (Ausgabe `16`), 7 (Meldung `NameError: name 'ergebnis' is not defined`, im Hauptkasten steht kein `ergebnis`). Programm B: acht Schritte, Zeile 1, 5 (`x = 5` im Hauptkasten), 6 (Aufruf, zweiter Kasten mit `x = 5`), 2 (`x = 10` im zweiten Kasten), 3 (`return`, Kasten weg), 6 (`y = 10`), 7 (Ausgabe `5`), 8 (Ausgabe `10`). **Ausgangszustand:** Das Programm steht da, beide Kästen sind leer, keine Ausgabe, keine Meldung. Vermutung A: Was passiert in der letzten Zeile? (16, 0, Fehlermeldung, nichts; richtig Fehlermeldung). Vermutung B: Was zeigt `print(x)` in Zeile 7? (5, 10, Fehler; richtig 5). Beobachtung danach: Der Kasten der Funktion ist weg, das `x` draußen hat sich nicht geändert.
3. **`kette` – „Aufrufkette“** (Abschnitt 3). Einstellen: die Zahl für `sieger(summe)` (5, 7, 8 oder 10), „Ein Schritt“, „Von vorn“. Sehen: das Programm mit `ist_gerade` und `sieger` (Zeilen 1 bis 13, der Aufruf in Zeile 13), darunter ein Stapel von Kästen: Hauptprogramm, dann `sieger(summe)`, darauf `ist_gerade(n)`; beim Rechnen in Zeile 2 steht die Rechnung (für 7: `7 % 2` ist 1, 1 ist nicht 0: falsch). Für 7: Zeile 1 und 7 (nur `def`), 13 (Aufruf, Kasten `sieger` mit `summe = 7`), 8 (Aufruf `ist_gerade`, dritter Kasten mit `n = 7`), 2 (Rechnung, falsch), 5 (`return False`, oberster Kasten weg), 11 (`return "Ben"`, Kasten weg), 13 (Ausgabe `Ben`). Für 10: Zeile 2 ergibt `10 % 2` gleich 0, 0 ist 0: wahr (10 ist beim Fingerspiel die größte Summe); Zeile 3 `return True`; Zeile 9 `return "Anna"`. Die nicht gelaufene Zeile ist grau. **Ausgangszustand:** Nur das Programm und ein leerer Stapel. Vermutung: Wie viele Kästen stehen auf dem Höhepunkt übereinander, das Hauptprogramm mitgezählt? (1, 2, 3, 4; richtig 3). Beobachtung danach: Nur ein `return` pro Aufruf läuft, und die innere Funktion ist fertig, bevor die äußere weitermacht.

Alle Rechenkerne ohne DOM oben in der Datei. Einen vierten Baustein gibt es nicht; Abschnitt 4 hat die Vorschau.

## E. Selbstcheck (6 Fragen, 20 Punkte)

Titel ohne Nummern, Antworten ohne Bezug auf die Reihenfolge, damit sich Fragen und Antworten mischen lassen.

1. **Typ eines Vergleichs**, Auswahl, 3 Punkte. Welchen Datentyp hat der Ausdruck `5 > 3`? [x] `bool` · `int` · `str` · `float`. Erklärung: Jeder Vergleich ergibt `True` oder `False`, und das ist ein `bool`.
2. **Eingabe ist Text**, Ausgabe, 3 Punkte, Antwort `44`.
   ```python
   x = input()
   print(x + x)
   ```
   Eingabe: 4. Erklärung: `input` liefert den Text `"4"`. Text plus Text wird aneinandergehängt: `"44"`. Mit `int(input())` wäre es 8.
3. **Umwandlung schneidet ab**, Zahl, 3 Punkte, Antwort `8`. Was gibt `print(int(8.9))` aus? Erklärung: `int` schneidet die Stellen nach dem Komma ab und rundet nicht.
4. **Meldung lesen**, Auswahl, 3 Punkte. Was geschieht bei `print("Punkte: " + 12)`? [x] `TypeError: can only concatenate str (not "int") to str` · `NameError: name 'Punkte' is not defined` · `SyntaxError: expected ':'` · Es erscheint `Punkte: 12`. Erklärung: Text und Zahl lassen sich nicht mit `+` verbinden. Mit `str(12)` oder einem f-String geht es.
5. **Gleicher Name, zwei Plätze**, Ausgabe, 4 Punkte, Antwort `10`.
   ```python
   def f(x):
       x = x + 1
       return x

   x = 10
   y = f(x)
   print(x)
   ```
   Erklärung: Das `x` in der Funktion ist ein eigener Platz. Draußen bleibt `x` bei 10, in `y` steht 11.
6. **Funktion ruft Funktion**, Ausgabe, 4 Punkte, Antwort `ungerade`.
   ```python
   def ist_gerade(n):
       if n % 2 == 0:
           return True
       else:
           return False

   def meldung(n):
       if ist_gerade(n):
           return "gerade"
       else:
           return "ungerade"

   print(meldung(9))
   ```
   Erklärung: `ist_gerade(9)` rechnet `9 % 2`: Der Rest ist 1, nicht 0, also `False`. Also gibt `meldung` den Text `ungerade` zurück.

## F. Labor Teil A (7 Stationen, auf der Seite 44 Minuten; im Termin laufen 3 und 5 nicht einzeln)

**1 · Werkzeugkasten (5 Min).** Vier Karten, Video „Python-Werkzeugkasten“. Alles aus Termin 02 bis 07 gilt weiter. Die Karten folgen dem Termin: Karte 1 gehört zu Block 1 und wird vor dem Baustein „Umwandler“ gezeigt (sie beantwortet keine Vermutung), Karte 2 gehört zu Block 1 und wird nach dem Baustein gezeigt (sie enthält `int(3.7)`), Karte 3 zu Block 2, Karte 4 zu Block 3. Die Werkzeuge für Block 4 stehen am Anfang von Station 6, nicht auf einer Karte.
- Karte 1 „str, bool und Text zusammensetzen“
  ```python
  name = "Lea"
  print("Hallo " + name)
  print(type(name))
  print(type(5 > 3))
  print(name == "Lea")
  ```
  Ausgabe `Hallo Lea`, `<class 'str'>`, `<class 'bool'>`, `True` (mit Python 3.13 ausgegeben). Text steht in Anführungszeichen, `+` hängt Text aneinander, `==` vergleicht Text mit Text. Ein Vergleich ergibt `True` oder `False`.
- Karte 2 „Umwandeln: int, float, str“
  ```python
  zahl = int("5")
  print(zahl + 3)
  print(float("2.5") * 2)
  print("Punkte: " + str(12))
  print(int(3.7))
  ```
  Ausgabe `8`, `5.0`, `Punkte: 12`, `3`. `input()` liefert Text: umwandeln, bevor du rechnest. `int` schneidet ab. Text plus Zahl ist ein `TypeError`.
- Karte 3 „Namen in der Funktion“
  ```python
  def quadrat(x):
      ergebnis = x * x
      return ergebnis

  zahl = quadrat(4)
  print(zahl)
  print(ergebnis)
  ```
  Ausgabe `16`, dann `NameError: name 'ergebnis' is not defined`. `x` und `ergebnis` gibt es nur in der Funktion. Hinein per Parameter, heraus per `return`.
- Karte 4 „Rest und True und False zurückgeben“
  ```python
  print(7 % 2)
  print(8 % 2)

  def ist_gerade(n):
      if n % 2 == 0:
          return True
      else:
          return False

  print(ist_gerade(8))
  print(ist_gerade(7))
  if ist_gerade(10):
      print("gerade")
  ```
  Ausgabe `1`, `0`, `True`, `False`, `gerade` (mit Python 3.13 ausgegeben). `%` ist der Rest beim Teilen, gerade heißt Rest 0. In jedem Zweig ein `return`. Der Aufruf darf in der Bedingung stehen.

**2 · Vorgerechnetes Beispiel: Fingerspiel (5 Min; im Termin 2 Min, Schritt 6 nur zu Hause).** Aufgabe: Anna und Ben zeigen je 1 bis 5 Finger. Ist die Summe gerade, gewinnt Anna, sonst Ben. Video „Vorgerechnet“. Art `run`, Eingabe `3|5`. Plan (`<Plan>` zweimal, Hauptprogramm und `ist_gerade`; der Plan von `sieger` fehlt absichtlich, er wird in Station 4 gezeichnet):

```text
Eingabe: anna
Eingabe: ben
Unterprogramm: wer = sieger(anna + ben)
Ausgabe: "Sieger:", wer
```

```text
Funktion: ist_gerade(n)
Entscheidung: n % 2 == 0?
  ja:
    antwort = True
  nein:
    antwort = False
Rückgabe: antwort
```

```python
def ist_gerade(n):
    if n % 2 == 0:
        return True
    else:
        return False

def sieger(summe):
    if ist_gerade(summe):
        return "Anna"
    else:
        return "Ben"

anna = int(input("Finger von Anna: "))
ben = int(input("Finger von Ben: "))
wer = sieger(anna + ben)
print("Sieger:", wer)
```

Eingabe 3 und 5: `Sieger: Anna`. Weitere Läufe (alle nachgerechnet): 2 und 3 ergibt `Sieger: Ben`, 1 und 1 ergibt `Sieger: Anna`, 5 und 4 ergibt `Sieger: Ben`.
Schritte: (1) Der Ablauf in Worten: zwei Zahlen einlesen, Summe bilden, Sieger fragen, ausgeben. (2) Was gehört in welche Funktion? `ist_gerade` beantwortet nur „gerade oder nicht“, `sieger` macht daraus einen Namen. (3) Plan: das Unterprogramm-Rechteck im Hauptplan und der kleine Plan von `ist_gerade`; für `sieger` steht nur der Hinweis „Den Plan dazu zeichnest du gleich selbst.“ (4) Code: erst `ist_gerade`, dann `sieger`, dann das Hauptprogramm. (5) Probe: 3 + 5 ist 8, `8 % 2` ist 0, wahr, Anna. (6) Selbsterklärung: Ersetz in `sieger` das `return "Ben"` durch `print("Ben")` und lass es mit 2 und 3 laufen. Es erscheint `Ben`, danach `Sieger: None` (mit Python 3.13 nachgerechnet): Die Funktion zeigt etwas an, gibt aber nichts zurück. Im Termin zeigt der Dozent die Schritte 1 bis 5 am Beamer (die zwei Pläne werden nur angesehen, der Plan von `sieger` wird in Station 4 gezeichnet), Schritt 6 ist Hausaufgabe (1 Min).

**3 · Ablauf verfolgen: Zwei Plätze für einen Namen (5 Min; im Termin nicht einzeln).** Art `trace`, `typhinweis: false`. Aufgabenstellung: Du verfolgst, wie `preis` zweimal vorkommt. Trag in jeder Zeile ein, was sich ändert. Hat die Funktion ihr `return` erreicht, gibt es ihren Namen nicht mehr: Trag dann `weg` ein.

```python
def aufschlag(preis):
    preis = preis + 5
    return preis

preis = 20
neu = aufschlag(preis)
print(preis)
print(neu)
```

Spalten `preis außen`, `preis innen`, `neu`, `Rückgabe`. 8 Schritte, von Hand geschrieben (Zeilenfolge 1, 5, 6, 2, 3, 7, 8 mit `sys.settrace` nachgeprüft; der zweite Besuch von Zeile 6 ist ein Lehrschritt, damit `neu` seinen Wert in der Zeile bekommt, in der er zugewiesen wird): Zeile 1 `def`, es läuft nichts · Zeile 5 `preis außen = 20` · Zeile 6 Aufruf, `preis innen = 20` · Zeile 2 `preis innen = 25` · Zeile 3 Rückgabe 25 · Zeile 6 zurück, `neu = 25` und `preis innen = weg` · Zeile 7 Ausgabe `20` · Zeile 8 Ausgabe `25`. Hinweise: bei Zeile 1 „`def` legt die Funktion nur an.“; bei Zeile 6 (Aufruf) „Die Funktion bekommt den Wert von `preis`. Ihr `preis` ist ein eigener Platz.“; bei Zeile 6 (zurück) „Die Funktion ist fertig, ihr `preis` gibt es nicht mehr.“; bei Zeile 7 „Das `preis` draußen hat sich nicht geändert.“ Antwort-Text `weg` wörtlich (Technische Voraussetzung 6).

**4 · Plan zeichnen: Sieger (★★, 8 Min; im Termin 9 Min in Block 3).** Art `pap-zeichnen`, `data-erlaubt="def,op,if"`. Im Editor steht schon das Hauptprogramm und die Funktion `ist_gerade(n)`; gezeichnet wird nur `sieger(summe)`. Text: Anna und Ben zeigen je 1 bis 5 Finger. Ist die Summe gerade, gewinnt Anna, sonst Ben. Der Hauptplan ruft `sieger(summe)` auf. `ist_gerade(n)` ist fertig und steht im Editor. Zeichne den Plan von `sieger(summe)`: Er fragt `ist_gerade(summe)` und gibt `"Anna"` oder `"Ben"` zurück. Hinweis: Im Editor hat eine Funktion nur eine Rückgabe am Ende: Merk dir den Namen erst in einer Variablen.
Startdaten (Baum): Funktion `ist_gerade(n)` mit der Raute `n % 2 == 0`, im Zweig ja `antwort = True`, im Zweig nein `antwort = False`, Rückgabe `antwort` · Eingabe `anna` (int) · Eingabe `ben` (int) · Aufruf `wer = sieger(anna + ben)` · Ausgabe `"Sieger:", wer`.
Der Plan von `sieger` steht in der Lerneinheit und in Station 2 nicht, er wird hier zum ersten Mal gezeigt (die Auflösung). Lösung: Funktion `sieger(summe)`, im Rumpf die Raute `ist_gerade(summe)`, ja: Operation `name = "Anna"`, nein: Operation `name = "Ben"`, Rückgabe `name`. Erzeugter Code (mit Python 3.13 ausgeführt):

```python
def ist_gerade(n):
    if n % 2 == 0:
        antwort = True
    else:
        antwort = False
    return antwort

def sieger(summe):
    if ist_gerade(summe):
        name = "Anna"
    else:
        name = "Ben"
    return name

anna = int(input("anna: "))
ben = int(input("ben: "))
wer = sieger(anna + ben)
print("Sieger:", wer)
```

Parameter `summe`, `n`, Variablen `name`, `antwort`, `wer`, `anna`, `ben`: alle verschieden (Festlegung 5).
Tests (letzte Zeile der Ausgabe, die mit `Sieger` beginnt): 3 und 5 ergibt `Sieger: Anna` · 3 und 4 ergibt `Sieger: Ben` (der letzte Wert ändert das Ergebnis) · 1 und 1 ergibt `Sieger: Anna` (Grenzfall, kleinste Summe 2) · 5 und 5 ergibt `Sieger: Anna` (Grenzfall, größte Summe 10) · 5 und 4 ergibt `Sieger: Ben` · 2 und 3 ergibt `Sieger: Ben`. Fehlt die Rückgabe, steht `Sieger: None` da. Die Tests prüfen die Ausgabe, nicht die Form des Plans.
Tipps: (1) Was kommt in die Funktion hinein, was kommt heraus? Hinein kommt `summe`, heraus kommt ein Name. (2) Füge das Symbol „Funktion“ ein, trag den Kopf `sieger(summe)` ein, setz in den Rumpf eine Verzweigung mit der Bedingung `ist_gerade(summe)` und in jeden Zweig eine Operation, die `name` setzt. (3) Die Rückgabe ist `name`. Meldet Python `UnboundLocalError: cannot access local variable 'name' …`, bekommt `name` in einem Zweig keinen Wert (mit Python 3.13 ausgeführt; die Meldung heißt nicht `NameError`).
Für Schnelle (nicht getestet): Ein zweiter Funktionsblock `ist_ungerade(n)`, der `ist_gerade(n)` aufruft und das Gegenteil zurückgibt.

**5 · Zeilen ordnen: Anrede (4 Min; im Termin nicht einzeln).** Art `parsons`. Plan: Eingabe vorname, Eingabe jahre · Unterprogramm `anrede(vorname, jahre)` · Ausgabe des Ergebnisses. Lösung:

```python
def anrede(name, alter):
    return "Hallo " + name + ", du wirst " + str(alter + 1) + "."

vorname = input("Name: ")
jahre = int(input("Alter: "))
print(anrede(vorname, jahre))
```

Zeilen, die nicht dazugehören: `    return "Hallo " + name + ", du wirst " + alter + 1 + "."` (Text plus Zahl, `TypeError: can only concatenate str (not "int") to str`) und `    print("Hallo " + name + ", du wirst " + str(alter + 1) + ".")` (zeigt an, gibt nichts zurück, danach erscheint `None`). `ok`-Text: „Die Funktion steht zuerst. `str` macht aus der Zahl Text, damit `+` hängt. `return` gibt den Text an die Stelle zurück, die aufgerufen hat.“ Probe: `Lea` und 17 ergibt `Hallo Lea, du wirst 18.`, `Tom` und 0 ergibt `Hallo Tom, du wirst 1.`

**6 · Erste eigene Aufgabe: Schraube (★★, 10 Min; im Termin in Block 4).** Art `code` mit 3D-Vorschau, Klausurform „Plan in Code übertragen“ mit Ausführen. `data-mode="code"`, `data-files="../assets/py/bauteil3d.py"`, `data-timeout="10000"` (Muster aus `app/inhalte/v06/labor.mdx:193`). Text: Eine Schraube besteht aus einem Kopf und einem Schaft. Der Kopf ist doppelt so breit wie der Schaft und so hoch, wie der Schaft breit ist. Der Schaft steht auf dem Kopf. Schreibe die Funktion `schraube(d, l)`, die eine Schraube mit Schaftdurchmesser `d` und Schaftlänge `l` zurückgibt (alles in mm). Das Hauptprogramm steht schon da. Mit „Ausführen“ erscheint die Vorschau. Die Werkzeuge: `zylinder(d, l)` ist ein Zylinder mit Durchmesser `d` und Länge `l`, `verschiebe(körper, dx, dy, dz)` setzt ihn um `dx` nach rechts, `dy` nach hinten und `dz` nach oben (alles in mm, immer mit allen drei Zahlen: `verschiebe(körper, 40, 0, 0)` ist nach rechts, `verschiebe(körper, 0, 0, 10)` nach oben), `vereinige(a, b)` hängt zwei Körper zusammen. `<Plan>` für die Funktion (in Worten, geschrieben wird der Code) und für das Hauptprogramm:

```text
Funktion: schraube(d, l)
kopf = Zylinder, Durchmesser 2 · d, Länge d
schaft = Zylinder, Durchmesser d, Länge l, um d nach oben gesetzt
Rückgabe: Kopf und Schaft vereinigt
```

```text
Unterprogramm: gross = schraube(10, 40)
Unterprogramm: klein = verschiebe(schraube(6, 25), 40, 0, 0)
Ausgabe: zeige(vereinige(gross, klein))
```

Vorlage (Vorlage-Datei `labor/w-3d.vorlage.py`, wie in Termin 06 mit `from bauteil3d import *` in der ersten Zeile):

```python
from bauteil3d import *

# Hier fehlt die Funktion schraube(d, l).

gross = schraube(10, 40)
klein = verschiebe(schraube(6, 25), 40, 0, 0)
zeige(vereinige(gross, klein))
```

Lösung:

```python
from bauteil3d import *

def schraube(d, l):
    kopf = zylinder(2 * d, d)
    schaft = verschiebe(zylinder(d, l), 0, 0, d)
    return vereinige(kopf, schaft)

gross = schraube(10, 40)
klein = verschiebe(schraube(6, 25), 40, 0, 0)
zeige(vereinige(gross, klein))
```

Die ganze Szene misst 56 × 20 × 50 mm (Volumen 7 646,7 mm³, nachgerechnet mit `bauteil3d`).
Tests (Namensraum des Schülercodes, `schraube` direkt aufgerufen; nachgerechnet gegen die facettierten Sollwerte):
- `schraube(10, 40)` misst 20 × 20 × 50 mm, Toleranz 0,5 mm. Steht der Schaft nicht auf dem Kopf (kein `verschiebe`), misst sie 20 × 20 × 40: „Der Schaft steckt im Kopf. Er muss um die Kopfhöhe d nach oben.“ Ist der Schaft zur Seite geschoben (`verschiebe(zylinder(d, l), d)` wie in Termin 06, nachgerechnet mit `bauteil3d`), misst sie 25 × 20 × 40: „Der Schaft ist zur Seite geschoben. Er muss nach oben: verschiebe(…, 0, 0, d).“
- `schraube(6, 25)` misst 12 × 12 × 31 mm (zeigt, dass die Parameter wirken, nicht feste Zahlen; mit festem 10 und 40 käme 20 × 20 × 50).
- `schraube(4, 10)` misst 8 × 8 × 14 mm (Grenzfall, die kleinste Schraube der Tests).
- Volumen von `schraube(10, 40)`: 6 265,2 mm³, Toleranz 1 % (Kopf 3 132,6 plus Schaft 3 132,6; mit Kopf gleich dick wie der Schaft käme 3 915,8, mit der π-Formel wären es 6 283,2).
- Das Ergebnis ist ein Körper. Gibt die Funktion `None` zurück (es fehlt das `return`, oder `zeige` steht statt `return` in der Funktion), läuft kein Test: `data-mode="code"` führt den Code vor den Tests aus, und schon die Vorlagenzeile `klein = verschiebe(schraube(6, 25), 40, 0, 0)` bricht mit `AttributeError: 'NoneType' object has no attribute 'get'` ab (nachgerechnet mit `bauteil3d`). Die Hilfe kommt deshalb aus `_hint` (Technische Voraussetzung 5), nicht aus einer Testmeldung. Sind `d` und `l` vertauscht, misst die Schraube 80 × 80 × 50: „Der erste Parameter ist der Durchmesser, der zweite die Länge.“
Tipps: (1) Jede Zeile des Plans wird eine Zeile in der Funktion, eingerückt. Zwei Zylinder: ein dicker flacher für den Kopf, ein dünner langer für den Schaft. Wie breit und wie hoch ist der Kopf, ausgedrückt in `d`? (2) Der Schaft müsste im Kopf stecken. Setz ihn mit `verschiebe(…, 0, 0, d)` um die Kopfhöhe nach oben. (3) Die Funktion endet mit `return vereinige(kopf, schaft)`. Nicht `zeige` in der Funktion: Das Hauptprogramm zeigt.
Für Schnelle (nicht getestet): Ändere im Hauptprogramm die Zahlen und sieh, wie sich die Schraube ändert, und stelle eine dritte Schraube dazu.
**Variante ohne 3D** (falls Termin 06 zeigt, dass die Vorschau im Hörsaal nicht läuft; Antwort 4): Art `code`, `data-mode="programm"`, `data-inputs="10|40"`. Text: Eingelesen werden Durchmesser und Länge einer Schraube in mm (ganze Zahlen). Eine Funktion `bezeichnung(d, l)` gibt die Bezeichnung zurück, zum Beispiel `M10 x 40`. Ausgegeben wird sie. Klausurform „Plan in Code übertragen“ bleibt: Der Aufgabe sind zwei `<Plan>` mitgegeben, der Text sagt es ausdrücklich. Plan der Funktion: `Funktion: bezeichnung(d, l)` und `Rückgabe: "M" + str(d) + " x " + str(l)`. Hauptplan: `Eingabe: durchmesser`, `Eingabe: laenge`, `Ausgabe: bezeichnung(durchmesser, laenge)`. Lösung:

```python
def bezeichnung(d, l):
    return "M" + str(d) + " x " + str(l)

durchmesser = int(input("Durchmesser in mm: "))
laenge = int(input("Länge in mm: "))
print(bezeichnung(durchmesser, laenge))
```

Tests (letzte Zeile, Text mit Leerzeichen normalisiert): 10 und 40 ergibt `M10 x 40` · 6 und 25 ergibt `M6 x 25` · 8 und 30 ergibt `M8 x 30` · 4 und 10 ergibt `M4 x 10` (Grenzfall, einstellig). Fallen auf: `"M" + d` (Zahl, `TypeError`), `print` statt `return` (der Aufruf liefert `None`, die Ausgabe ist `None`). Die Variante prüft dieselben Wörter (Text mit `+`, `str()`, `return`) ohne `bauteil3d`.

**7 · Fehler finden: Preis mit Steuer (7 Min; im Termin in Block 2).** `Fehlersuche`, Fehler in Zeile 5 und 9. Text: Das Programm rechnet einen Nettopreis in den Preis mit 19 Prozent Steuer um. Bei 100 Euro wird `Brutto: 119.00 Euro` erwartet. In zwei Zeilen steckt ein Fehler.

```text
# Rechnet einen Nettopreis in den Preis mit 19 Prozent Steuer um.
def brutto(netto):
    steuer = netto * 0.19
    endpreis = netto + steuer
    return steuer

n = float(input("Netto in Euro: "))
b = brutto(n)
print(f"Brutto: {endpreis:.2f} Euro")
```

Fehler 1 (Zeile 9), meldet Python: `NameError: name 'endpreis' is not defined`. `endpreis` gibt es nur in der Funktion; draußen steht das Ergebnis in `b`. Fehler 2 (Zeile 5), meldet Python nicht: Die Funktion gibt nur die Steuer zurück. Mit Fehler 1 behoben steht bei 100 Euro `Brutto: 19.00 Euro`. Richtig (`data-stdin="100"`):

```python
# Rechnet einen Nettopreis in den Preis mit 19 Prozent Steuer um.
def brutto(netto):
    steuer = netto * 0.19
    endpreis = netto + steuer
    return endpreis

n = float(input("Netto in Euro: "))
b = brutto(n)
print(f"Brutto: {b:.2f} Euro")
```

Mit 100 ergibt das `Brutto: 119.00 Euro` (alle Läufe nachgerechnet: 50 ergibt 59.50, 0 ergibt 0.00, 80 ergibt 95.20, 99.9 ergibt 118.88; 12.5 hätte 14.875, 5 an der Rundungsstelle, und kommt nicht vor).

## G. Labor Teil B (Training, 4 Aufgaben, 30 Minuten) und Knobelaufgaben

Zu Hause zusammen **47 Minuten**: Stationen 3 und 5 (9), Vorgerechnet Schritt 6 (1), Selbstcheck (7), Training (30). Termin 09 beginnt mit Training 1 auf Papier.

1. **Typen und Umwandlung** (★, 6 Min, `trace` als Tabelle, `sprache: "tabelle"`, 6 Zeilen, eine Spalte „Antwort“, `ausgabe: false`, `typhinweis: false`). Erst auf Papier, dann hier prüfen. Text: „Trag ein, was Python ausgibt, ohne Anführungszeichen. Bei Zeile 4 steht nur der Typ, bei Zeile 6 nur die Art der Meldung.“

   | Zeile | Frage | Lösung |
   |---|---|---|
   | 1 | `print(int(7.9))` | 7 |
   | 2 | `print("4" + "5")` | 45 |
   | 3 | `print(int("4") + 5)` | 9 |
   | 4 | Welchen Datentyp liefert `input()`? (int oder float oder str oder bool) | str |
   | 5 | `print("Punkte: " + str(15))` | Punkte: 15 |
   | 6 | Was meldet Python bei `print("3" + 4)`? Nur die Art der Meldung. | TypeError |

   Hinweise: Zeile 1 „`int` schneidet ab.“, Zeile 2 „In Anführungszeichen ist es Text. Text plus Text wird aneinandergehängt.“, Zeile 3 „Erst umwandeln, dann rechnen.“, Zeile 6 „Text plus Zahl passt nicht zusammen.“ Die Zeilen sind ohne Komma und ohne zweites `=` geschrieben, auch Zeile 4 (der Parser schneidet an einem Komma ab; Technische Voraussetzung 6). Die Wahl der Typen steht in Klammern ohne Komma, der Text „frage“ des Schritts wiederholt sie. Wird das Warm-up von Termin 09, dort als Brücke zur Frage „Wo steht das Programm, während es läuft?“ (T6).
2. **Plan in Code übertragen: Gerade Zahlen zählen** (★★, 8 Min, `klausur`). Text: Eingelesen wird eine Zahl `n`. Ausgegeben wird, wie viele gerade Zahlen es von 1 bis `n` gibt, zum Beispiel `Gerade Zahlen: 5` bei 10. Eine Funktion `ist_gerade(zahl)` antwortet mit True oder False.
   Plan (`<Plan>` zweimal):
   ```text
   Eingabe: n
   anzahl = 0
   Schleife: i von 1 bis n?
     Entscheidung: ist_gerade(i)?
       ja:
         anzahl = anzahl + 1
   Ausgabe: "Gerade Zahlen:", anzahl
   ```
   ```text
   Funktion: ist_gerade(zahl)
   Entscheidung: zahl % 2 == 0?
     ja:
       antwort = True
     nein:
       antwort = False
   Rückgabe: antwort
   ```
   ```python
   def ist_gerade(zahl):
       if zahl % 2 == 0:
           return True
       else:
           return False

   n = int(input("Bis wohin? "))
   anzahl = 0
   for i in range(1, n + 1):
       if ist_gerade(i):
           anzahl = anzahl + 1
   print("Gerade Zahlen:", anzahl)
   ```
   (Die Form mit einer Variablen `antwort` gilt genauso; beide nachgerechnet, gleiche Ausgabe.)
   Tests (die Zeile, die mit `Gerade` beginnt, letzte Zahl): 10 ergibt `Gerade Zahlen: 5` · 6 ergibt 3 · 5 ergibt 2 (der letzte Wert entscheidet: 6 zählt mit, 5 nicht) · 1 ergibt 0 (Grenzfall, keine gerade Zahl) · 2 ergibt 1 · 0 ergibt 0 (Grenzfall, die Schleife läuft nie) · 13 ergibt 6. Schema (je 1 Punkt): `def ist_gerade(zahl):` mit Doppelpunkt, vor dem Hauptprogramm · Bedingung `zahl % 2 == 0` mit Antwort in beiden Zweigen · `anzahl = 0` vor der Schleife und `for i in range(1, n + 1):` · `if ist_gerade(i):` im Rumpf der Schleife mit `anzahl = anzahl + 1`.
   Tipps: (1) Zeichne zuerst den Hauptplan: Zähler, Schleife, in der Schleife die Raute mit dem Aufruf. (2) Die Funktion steht im Code zuerst. (3) Der Aufruf `ist_gerade(i)` steht gleich nach `if`. Du brauchst kein `== True`.
3. **Fehler finden und beheben: Bonus zu den Punkten** (★★, 6 Min, `code`, `data-inputs="25"`). Zwei Fehler, beide meldet Python, aber nacheinander. Probier 25.
   Vorlage:
   ```python
   # Zählt Bonuspunkte zu den Punkten einer Runde.
   punkte = input("Punkte: ")
   bonus = 10
   gesamt = punkte + bonus
   print("Gesamt: " + gesamt)
   ```
   Lösung: Zeile 4 meldet `TypeError: can only concatenate str (not "int") to str`: `punkte` ist Text, weil `input` Text liefert. Mit `int(input(...))` in Zeile 2 läuft Zeile 4. Dann meldet Zeile 5 dieselbe Meldung: `gesamt` ist jetzt eine Zahl, und Text plus Zahl geht nicht:
   ```python
   # Zählt Bonuspunkte zu den Punkten einer Runde.
   punkte = int(input("Punkte: "))
   bonus = 10
   gesamt = punkte + bonus
   print("Gesamt: " + str(gesamt))
   ```
   (Auch richtig: `print(f"Gesamt: {gesamt}")`.) Tests (die Zeile, die mit `Gesamt` beginnt): 25 ergibt `Gesamt: 35` · 0 ergibt `Gesamt: 10` (Grenzfall) · 100 ergibt `Gesamt: 110` · 7 ergibt `Gesamt: 17` · 89 ergibt `Gesamt: 99` (der letzte Wert ändert das Ergebnis).
   Tipps: (1) Führ das Programm aus und lies die Meldung von unten: Welche zwei Typen passen nicht zusammen? (2) Nach dem ersten Fix läuft Zeile 4. Meldet Zeile 5 dasselbe, gehört in die Zeile eine Umwandlung. (3) Karte 2 und Abschnitt 1.
4. **Schaltjahr** (★★★, 10 Min, `code`, ohne Plan, erst auf Papier zeichnen). Text: Ein Jahr ist ein Schaltjahr, wenn es durch 4 teilbar ist, außer es ist durch 100 teilbar. Es sei denn, es ist durch 400 teilbar: Dann ist es doch eins. Eingelesen wird ein Jahr. Eine Funktion `ist_teilbar(zahl, teiler)` antwortet, ob die Zahl ohne Rest durch den Teiler geht, eine zweite Funktion `ist_schaltjahr(jahr)` benutzt sie. Ausgegeben wird `2024 ist ein Schaltjahr` oder `2023 ist kein Schaltjahr`.
   ```python
   def ist_teilbar(zahl, teiler):
       if zahl % teiler == 0:
           return True
       else:
           return False

   def ist_schaltjahr(jahr):
       if ist_teilbar(jahr, 400):
           return True
       elif ist_teilbar(jahr, 100):
           return False
       else:
           return ist_teilbar(jahr, 4)

   eingabe = int(input("Jahr: "))
   if ist_schaltjahr(eingabe):
       print(eingabe, "ist ein Schaltjahr")
   else:
       print(eingabe, "ist kein Schaltjahr")
   ```
   Zweite Fassung, nur in der Auflösung (nicht in der Lerneinheit): `ist_teilbar` mit `return zahl % teiler == 0` und `ist_schaltjahr` mit `return (ist_teilbar(jahr, 4) and not ist_teilbar(jahr, 100)) or ist_teilbar(jahr, 400)`. Beide Fassungen gegen `calendar.isleap` für die Jahre 1 bis 2999 nachgerechnet.
   Tests (letzte Zeile, auf „ein Schaltjahr“ oder „kein Schaltjahr“ geprüft): 2024 ergibt `ist ein Schaltjahr` · 2023 ergibt `ist kein Schaltjahr` · 1900 ergibt `ist kein Schaltjahr` (Grenzfall, durch 100 teilbar) · 2000 ergibt `ist ein Schaltjahr` (durch 400, der letzte Wert ändert das Ergebnis) · 2100 ergibt `ist kein Schaltjahr` · 2028 ergibt `ist ein Schaltjahr`. Fallen auf: `ist_teilbar` ohne `return` (gibt `None`, zählt wie `False`, alle Jahre „kein Schaltjahr“), nur „durch 4“ geprüft (1900 fällt auf).
   Tipps: (1) `ist_gerade` aus der Lerneinheit (Abschnitt 3) ist `ist_teilbar` mit dem Teiler 2: Der Rest beim Teilen durch den Teiler muss 0 sein. (2) Die Regel in dieser Reihenfolge: durch 400, dann durch 100, dann durch 4. (3) Zeichne drei Rauten untereinander: durch 400? durch 100? durch 4? Jeder Ausgang setzt `antwort` auf `True` oder `False`, am Ende steht die Rückgabe `antwort`. Im Code darfst du in jedem Zweig gleich `return` schreiben. (Die Fassung mit `and`, `or` und `not` steht nur in der Auflösung; dort gilt: `and` bindet stärker als `or`.)

**Knobelaufgaben (freiwillig, zählen nicht im Fortschritt).** Nur Stoff bis Termin 08. Beide ausgearbeitet und nachgerechnet.

- **`kn-1` · „Quersumme Ziffer für Ziffer“** (`k-1`, `code`, `data-mode="programm"`, `data-inputs="1234"`).
  Text: Die Quersumme einer Zahl ist die Summe ihrer Ziffern, 1234 ergibt 1 + 2 + 3 + 4 = 10. Eingelesen wird eine ganze Zahl von 0 bis 99999. Eine Funktion `quersumme(n)` gibt die Quersumme zurück. Ausgegeben wird `Quersumme: 10`. Die letzte Ziffer einer Zahl bekommst du mit `n % 10`, die Zahl ohne ihre letzte Ziffer mit `int(n / 10)`.
  Musterlösung:
  ```python
  def quersumme(n):
      summe = 0
      while n > 0:
          letzte = n % 10
          summe = summe + letzte
          n = int(n / 10)
      return summe

  zahl = int(input("Zahl: "))
  print("Quersumme:", quersumme(zahl))
  ```
  Tests (letzte Zeile, letzte Zahl): 1234 ergibt 10 · 9999 ergibt 36 · 7 ergibt 7 · 0 ergibt 0 (Grenzfall, die Schleife läuft nie) · 1000 ergibt 1 (Nullen am Ende) · 98765 ergibt 35 (der letzte Wert entscheidet) · 99999 ergibt 45. Alle nachgerechnet; 6 bis 26 Zeilenereignisse je Lauf (0 ergibt 6, 7 ergibt 10, 1234 ergibt 22, 99999 ergibt 26).
  Tipps: (1) Zeichne 1234 auf: Welche Ziffer fällt zuerst heraus, und was bleibt übrig? (2) `n % 10` ist die letzte Ziffer, der Rest beim Teilen durch 10: Probier es mit 1234 von Hand. (3) Die Schleife läuft, solange noch eine Ziffer da ist (`n > 0`). `summe` steht vor der Schleife.
  Für die Auflösung (nicht getestet): `int(n / 10)` schneidet die letzte Ziffer ab.
- **`kn-2` · „Vollkommene Zahlen“** (`k-2`, `code`, `data-mode="programm"`, `data-inputs="30"`).
  Text: Eine Zahl ist vollkommen, wenn die Summe ihrer Teiler (ohne sie selbst) die Zahl ergibt. 6 hat die Teiler 1, 2 und 3: 1 + 2 + 3 ist 6. Eingelesen wird eine Grenze (höchstens 100). Ausgegeben werden alle vollkommenen Zahlen von 2 bis zur Grenze, je eine in einer Zeile. Dafür schreibst du `ist_teilbar(zahl, teiler)` und `teilersumme(n)`, die `ist_teilbar` aufruft. Beispiel: Grenze 30 ergibt 6 und 28.
  Musterlösung:
  ```python
  def ist_teilbar(zahl, teiler):
      if zahl % teiler == 0:
          return True
      else:
          return False

  def teilersumme(n):
      summe = 0
      for t in range(1, int(n / 2) + 1):
          if ist_teilbar(n, t):
              summe = summe + t
      return summe

  grenze = int(input("Grenze: "))
  for kandidat in range(2, grenze + 1):
      if teilersumme(kandidat) == kandidat:
          print(kandidat)
  ```
  Tests (alle Zeilen, die reine Zahlen sind): 30 ergibt 6, 28 · 100 ergibt 6, 28 · 28 ergibt 6, 28 (die Grenze selbst zählt mit) · 27 ergibt 6 (der letzte Wert ändert das Ergebnis) · 6 ergibt 6 · 5 ergibt keine Zeile (Grenzfall). Nachgerechnet (Zeilenereignisse wie der Tracer sie zählt): Grenze 28 ergibt 998, 100 ergibt 10 883, 500 ergibt 255 192 (neu gezählt, mit `%` in `ist_teilbar`; die Zeilengrenze von 200 000 greift also schon vor 500, Technische Voraussetzung 7). Deshalb „höchstens 100“ im Text und 500 in keinem Test.
  Tipps: (1) Teste von Hand: Die Teiler von 28 sind 1, 2, 4, 7, 14. (2) Die Funktion `teilersumme` summiert alle Teiler von 1 bis zur Hälfte von `n` (kein Teiler ist größer als die Hälfte). (3) Die Hauptschleife fragt `teilersumme(kandidat) == kandidat`.
  Für die Auflösung (nicht getestet): Es gibt nur wenige: 6, 28, 496 und 8128.

## H. Videos (je etwa 2 bis 2,5 Minuten; hier nur der Inhalt, kein Sprechertext)

**Theorie (Lerneinheit, Abschnitt 1): „Zahl oder Text?“.** Ein Eingabefeld, in das 17 getippt wird; die 17 ist ein Text, `type` zeigt `str`; Text plus Zahl ist ein Fehler (die Meldung wird von unten gelesen); `int` macht aus dem Text eine Zahl, `str` macht aus einer Zahl Text, `int(3.7)` schneidet ab; zum Schluss `bool`: Ein Vergleich ergibt True oder False.

**Python-Werkzeugkasten (Labor, Station 1): „Text, umwandeln, lokal, True und False“.** Karte 1 zeigt `"Hallo " + name`, `type(name)` und `type(5 > 3)`; Karte 2 zeigt `int("5")`, `float("2.5")`, `str(12)` und `int(3.7)`; Karte 3 zeigt `quadrat` mit `ergebnis` und die Meldung `NameError`; Karte 4 zeigt `7 % 2` und `8 % 2`, `ist_gerade` mit `n % 2 == 0` und `return` in beiden Zweigen und den Aufruf in einem `if`.

**Vorgerechnet (Labor, Station 2): „Fingerspiel“.** Der Plan von `ist_gerade` neben dem Hauptplan und dem Code (der Plan von `sieger` fehlt, er wird danach selbst gezeichnet); Lauf mit 3 und 5; am Ende der Versuch, `return "Ben"` durch `print("Ben")` zu ersetzen: erst `Ben`, dann `Sieger: None`.

Abschnitte 2 bis 4 haben kein eigenes Theorie-Video. Sie leben von den Bausteinen, den Vorhersagen und von „Schritt für Schritt“.

## I. Ablaufplan für den Dozenten

Jeder 30-Minuten-Block verplant höchstens 28 Minuten, der letzte (25 Minuten) höchstens 24. Die Minuten eines Abschnitts enthalten das Zeigen der genannten Karte. Hier im Zuschnitt mit der Pause; in der App laufen die Minuten wie in Termin 05 ohne sie durch (0–10, 10–40, 40–70, 70–100, 100–125, Titel „Ablauf des Termins (125 Minuten)“), und die Pause wird nicht erwähnt.

| Minuten | Wo | Was |
|---|---|---|
| 0–10 | Papier, Beamer | **Warm-up.** Training 07, Aufgabe 1 „Wertebereich und Überlauf“ auf Papier (5), Auflösung (2). Brücke: Du tippst bei `input()` eine 5. Was kommt bei Python an? (3) |
| 10–40 | Lerneinheit 1 | **Theorie: Zahl oder Text.** Datentypen `str` und `bool`, `type` mit den Beispielen, Karte 1 vor dem Baustein (4). Text zusammensetzen mit `+` (3). Baustein „Umwandler“ mit den zwei Vermutungen `int(3.7)` und `"5" + "3"`, alle Fälle (8). Beobachtung: `int` schneidet ab, Text plus Zahl ist ein Fehler, Meldung von unten lesen (4). `input()` liefert Text, `int(input())` mit Grund, Karte 2 nach dem Baustein (4). Vorhersage „input und plus“ (2). Verplant: 25. |
| 40–70 | Lerneinheit 2, Labor 1 (Karte 3), 7 | **Programmieren 1: lokale Namen.** Rückgriff auf `fahrenheit` und das Bild vom eigenen Raum (3). Baustein „Zwei Räume“, Programm A, Vermutung (5). Auflösung `NameError`, Merksatz hinein und heraus (3). Programm B „gleicher Name, zwei Plätze“ mit Vermutung (4). Vorhersage „Aufruf ohne Speichern“ (3). Karte 3 (1). Alle lösen „Fehler finden: Preis mit Steuer“ (7). Verplant: 26 („Schritt für Schritt“ läuft im Termin nicht). Stationen 3 und 5 laufen nicht einzeln. |
| 70–80 | – | **Pause** (nur im Zuschnitt). |
| 80–110 | Lerneinheit 3, Labor 1 (Karte 4), 2, 4 | **Programmieren 2: Rest und Funktionen mit Antwort.** Fingerspiel, der Rest beim Teilen mit `%`: 7 durch 2, 8 durch 2, kurze Frage an alle (`9 % 2`, `12 % 5`, `20 % 4`) (4). Plan von `ist_gerade` mit der Raute `n % 2 == 0` (2). Code, Abkürzung mit `return` im Zweig, der Aufruf in der Bedingung, Karte 4 (4). Die Vorhersage „Zweig ohne return“ läuft im Termin nicht (Nachlesen). `sieger(summe)` ruft `ist_gerade`, Baustein „Aufrufkette“ mit Vermutung (6). Fingerspiel am Beamer: zwei Pläne nur ansehen, Code, Probe (2). Alle zeichnen den Funktionsplan „Sieger“ (9). Verplant: 27. |
| 110–135 | Lerneinheit 4, Labor 6 | **Programmieren 3: Parameter formen ein Bauteil.** Rückgriff auf die Säulenreihe, eine Funktion gibt einen Körper zurück (1). `buchse(aussen, laenge)` am Beamer: Code, Lauf, Vorschau (4). Alle ändern einen Parameter und beobachten (Vermutung) (4). Werkzeuge ansehen (1). Alle übertragen den Plan „Schraube“ in Code (10). Auftrag für zu Hause, Pflicht, zusammen 47 Minuten: Stationen 3 und 5 (9), Vorgerechnet Schritt 6 (1), Selbstcheck (7), Training (30) (2). Termin 09 beginnt mit Training 1 auf Papier. Verplant: 22. |

Wenn die Zeit knapp wird: Im Block 10–40 entfällt zuerst die Vorhersage „input und plus“ (sie steht in der Lerneinheit), danach wird Teil 2 des Bausteins (Kombinationen) verkürzt auf `"5" + 3`. Im Block 40–70 wird Programm B im Baustein weggelassen und nur als Vorhersage gelesen, „Fehler finden“ wird gemeinsam am Beamer gelöst statt einzeln. Im Block 80–110 gilt: Wird es eng, wird zuerst „Fingerspiel“ am Beamer gekürzt (nur Code und ein Lauf, 1 statt 2 Minuten). Der Rest mit `%` wird nicht gekürzt (neuer Stoff), nur die Frage an alle darf entfallen (1 Minute). Danach wird der Funktionsplan „Sieger“ (8) gemeinsam an der Tafel gezeichnet und der Editor-Teil geht nach Hause; das wird ausdrücklich gesagt, die Hausaufgabe wächst dann auf 55 Minuten. Im letzten Block entfällt zuerst der Vermutungs-Teil des Beamer-Beispiels (4 Minuten), dann sinkt die Schraube auf „nur den Plan lesen und die Funktion abschreiben“; „Schraube“ ist die einzige Übung „Plan in Code“ des Termins, sie geht erst zuletzt nach Hause, und das wird dann ausdrücklich gesagt. Läuft die 3D-Vorschau im Hörsaal nicht, gilt die Variante ohne 3D (Station 6, `bezeichnung`).

Die drei Klausurformen im Termin: Plan zeichnen (Station 4 mit Funktionsblock in Block 3), Plan in Code übertragen (Station 6 in Block 4), Code lesen (Vorhersagen in jedem Block, Station 7 in Block 2). Zu Hause dazu: Ablauf verfolgen (Station 3), Plan in Code im Klausurmodus (Training 2), Fehler finden (Training 3).

---

# Bewusst weggelassen

**Datentypen**
- `ValueError` bei `int("3.7")` und `int("abc")`, `try` und `except`: nicht Thema. Python meldet es von selbst (`aufgaben.js:115–116`), der Hinweis ist vorhanden; `try`/`except` steht außerhalb des Umfangs (`KONZEPT.md`).
- `bool` als Zahl (`True + 1`), der Wahrheitswert von Zahlen und Text (`if text:`), `int(-3.7)`, `int(True)`: nicht gezeigt und nicht abgefragt.
- Text, der mehr kann: `len(text)`, Methoden wie `.upper()`, Zugriff auf einzelne Zeichen, Text mal Zahl (`"ab" * 3`), `+=`: gehören zu Listen (Termin 11 und später) oder werden nicht gebraucht.
- Zeichen als Zahlen (ASCII): Termin 10 (T6).
- Rundungsfälle und `round(x)` mit einem Argument: wie Termin 07.
- `//` (ganzzahlige Division) und `%` mit negativen Zahlen, Kommazahlen oder dem Teiler 0 (`ZeroDivisionError`): nicht gezeigt, nicht abgefragt.

**Funktionen**
- `global`, Namen von draußen lesen, `UnboundLocalError` als Thema: Entscheidung 3 und Antwort 2. Die Meldung steht nur in einem Tipp.
- Standardwerte, mehr als zwei Parameter, mehrere Rückgabewerte, `return` in einer Schleife, Funktionen, die sich selbst aufrufen, Funktionen als Argument: nicht in Termin 08 und auch nicht in Termin 09 und 10 (dort haben alle Funktionen null bis zwei Parameter). Die Schraube hat zwei Parameter; `ring(d_aussen, d_innen, l)` und `verschiebe(…, dx, dy, dz)` werden nur aufgerufen, nicht geschrieben.
- `hinweis(geraten, geheim)` und alles aus dem Zahlenraten: Termin 09 und 10. Termin 09 bringt als letzten Funktionen-Block die Zerlegung eines Programms in Funktionen (P4 Teil 6, Entscheidung 8); `ist_gerade` und `sieger` sind dafür nur ein erstes Muster.
- Dokumentation einer Funktion (Kommentar unter `def`): nicht jetzt.

**Plan und Editor**
- Mehrere `Rückgabe`-Symbole in den Zweigen im Plan und im Editor: Antwort 3. Der Editor kennt weiter nur Kopf, Rumpf und eine Rückgabe am Ende.
- Zufall (`import random`): wird in Termin 09 eingeführt (Block 3) und in Termin 10 benutzt.

**Aufbau und Umfang**
- „Lücken füllen“ als Station: siehe Aufteilung.
- Videos zu Abschnitt 2 bis 4: Bausteine und „Schritt für Schritt“ genügen.
- `welle(absaetze)` und `flansch(...)` aus `bauteil3d`: brauchen eine Liste beziehungsweise sechs Zahlen. Die Schraube und die Buchse genügen.
- Die Schraube mit Gewinde, Rundungen oder `volumen(...)`/`abmessungen(...)` im Schülercode: nicht gebraucht. Die Maße stehen nur in den Tests.
- Ein zweites 3D-Training zu Hause: Training 1 bis 4 üben Typen, Plan in Code, Fehler und Funktionen ohne `bauteil3d` (Klausur setzt es nicht voraus).

---

# Technische Voraussetzungen

Belegt heißt: im Code gelesen oder gerechnet. Nicht ausprobiert ist ausdrücklich gesagt. Grundlage ist eine Prüfung der Dateien am 2026-11-27 im Arbeitsbaum.

1. **Dateinamen `explorables-v08.js` und `v08.css` sind belegt (Pflicht, ca. 1 Stunde).** `site/assets/js/explorables-v08.js` (434 Zeilen) ist der Baukasten der alten V08 „Datenstrukturen“ (Kopfkommentar Z. 1–8: Liste im Speicher, Schleife über eine Liste, Aliasing, Dictionary, Selbstcheck-Haken). `site/assets/css/v08.css` (101 Zeilen) trägt die zugehörigen Regeln. Keine Seite unter `app/inhalte`, `app/src`, `app/skripte`, `docs` und `site/*.html` lädt eine der beiden Dateien (gesucht, nur sie selbst enthalten die Namen). Vorschlag wie bei V05 bis V07: beide Dateien durch die neuen ersetzen (altes Material darf weg). Für Termin 07 sind es jetzt 619 und 109 Zeilen (`explorables-v07.js`, `v07.css`), also schon ersetzt. `v05.css` bleibt für die Plan-Regeln eingebunden (`app/src/lib/mdx/bausteine.mjs:207`).
2. **Bausteine `umwandler`, `raeume`, `kette` (zusammen ca. 2 Tage).** `umwandler` etwa 3 Stunden: zwei Auswahlfelder, feste Tabelle der 13 Ergebnisse (9 Umwandlungen, 4 Summen), Meldungstexte wörtlich aus Python; die Zahlen dieses Papiers sind die Sollwerte des Tests `app/skripte/tests/explorables-v08.test.mjs` (Muster `explorables-v07.test.mjs`, 449 Zeilen). Ein Stolperstein: JavaScript schreibt `5.0` als `5` und `3.0` als `3`, der Baustein bildet `5.0` für `float(5)` selbst. `raeume` etwa 1 Tag: Schrittmechanismus, aktive Zeile und Ausgabe aus `initMaschine` (`explorables-v07.js:430–520`) übernehmen, zwei Programme (A und B) mit festen Schrittlisten, zwei Kästen statt der einen Tabelle, die Meldung `NameError` im letzten Schritt von A. `kette` etwa 1 Tag: derselbe Mechanismus mit einem Stapel aus bis zu drei Kästen, vier Eingaben (5, 7, 8, 10) mit je fester Schrittliste (Zeilenfolgen mit `sys.settrace` nachgeprüft: für 7 ist es 1, 7, 13, 8, 2, 5, 11, 13; für 10 ist es 1, 7, 13, 8, 2, 3, 9, 13, die Zeile 13 kommt am Ende ein zweites Mal für die Ausgabe). Test `explorables-v08.test.mjs`, dazu ein Browserlauf `app/skripte/pruefe-v08.mjs` (Muster `pruefe-v07.mjs`, 200 Zeilen) und ein Selbsttest `app/skripte/tests/termin08.test.mjs` (Muster `termin07.test.mjs`, 229 Zeilen: Zahlen der Lerneinheit, Selbstcheck 20 Punkte, Zeitangaben, Schreibregeln: keine Pause, kein Gedankenstrich, keine Antwort vor einer Vermutung).
3. **`<Plan>`: Funktionen mit `if` (kein Ausbau nötig).** `planSpec` (`bausteine.mjs:66–130`) kennt `Funktion: …` als erste und `Rückgabe: …` als letzte Zeile (Z. 72–80, 47–48) und `Entscheidung:` mit `ja:` und `nein:` auf jeder Ebene. Die Pläne dieses Papiers (`ist_gerade`, `sieger`, `schraube`) brauchen nur das, und der Aufruf in der Raute ist Text der Raute (`K.P.iff`, Z. 103). Nicht im Browser ausprobiert: Die Zeichnung einer Funktion mit Raute und Rückgabe-Ende (das Layout kennt Ende-Symbole in Zweigen, `pap-engine.js:190`, das Papier nutzt sie aber nicht); einmal ansehen. Ein Ende in einem Zweig (mehrere `Rückgabe`) ginge im `<Plan>` heute nicht (`bausteine.mjs:89` wirft „steht nur als letzte Zeile des Plans“); Antwort 3.
4. **Plan-Editor: Funktion mit `if` im Rumpf, vorgegebene Funktion in den Startdaten (Pflicht, ca. 3 Stunden mit Test).** Der Blocktyp „Funktion“ ist gebaut (`pap-engine.js:310–316` Knoten, `:347–351` Code, `:521–527`, `:579–606` Parser mit höchstens einer Rückgabe am Ende, `pap-editor.js:46` Eintrag `def`). Für Station 4 gebraucht und nicht vorhanden: eine Startdatei mit einem schon fertigen `def`-Knoten und zwei Eingaben mit `typ: "int"`. `fromJson` kennt `k: 'def'` (`pap-engine.js:649`), `nIn` kennt `typ` (`:300`), die Datei `w-funktionsplan.start.json` aus Termin 07 hat nur das Hauptprogramm. Lesbar, im Browser nicht ausprobiert: Der Student darf den vorgegebenen Funktionsblock verändern oder löschen; die Tests prüfen nur die Ausgabe. Der Editor zeigt die vorgegebene Funktion und die zu zeichnende nacheinander (Reihenfolge Hauptplan, dann Funktionen; `toPapAll`, `:467`). Test in `app/skripte/tests/pap-engine.test.mjs`: die Lösung der Station ergibt genau den Code aus Abschnitt F (Rundlauf `parseCode(toText(baum))`). Die Raute `n % 2 == 0` ist im Editor Text wie jede Bedingung; das Zeichen `%` wird in `pap-engine.js` und `pap-editor.js` nicht besonders behandelt (gesucht), im Browser nicht ausprobiert, der Rundlauf-Test deckt es ab.
5. **Hinweistexte (ca. 30 Minuten).** `_hint` (`aufgaben.js:99–100`) sagt bei `NameError` „Dieser Name ist unbekannt. Tippfehler? Groß-/Kleinschreibung? Oder die Variable wird erst weiter unten definiert?“ (belegt). Ergänzen: „Oder der Name gilt nur in einer Funktion?“ und, für `UnboundLocalError` (Unterklasse von `NameError`, dasselbe `isinstance`), einen eigenen Satz („Dieser Name bekommt auf diesem Weg durch die Funktion noch keinen Wert. Steht in jedem Zweig eine Zeile, die ihn setzt? Oder gib den Wert über einen Parameter hinein.“, Antwort 2). `UnboundLocalError` kommt in Station 4 vor (Tipp 3), wenn ein Zweig `name` nicht setzt (mit Python 3.13: `cannot access local variable 'name' where it is not associated with a value`). Zusätzlich (Pflicht, wegen Station 6): `AttributeError` mit `'NoneType' object has no attribute` bekommt denselben Satz wie der `TypeError` mit `NoneType` („Ein Wert ist None (nichts). Fehlt in der Funktion ein return? print() zeigt nur an, gibt aber nichts zurück.“): Fehlt in `schraube` das `return`, ist `gross` gleich `None`, und `verschiebe(None, …)` meldet `AttributeError`, ohne diese Änderung also „Name im Modul falsch geschrieben, oder import vergessen?“ (`aufgaben.js`, letzte Abfrage in `_hint`; der neue Fall muss vor der allgemeinen `AttributeError`-Abfrage stehen; nachgerechnet mit `bauteil3d`). Der Satz zum `TypeError` mit Text und Zahl steht schon da (`:113–114`: „input() liefert immer Text (str): mit float() oder int() in eine Zahl umwandeln“). Test: eine Zeile in `termin08.test.mjs`.
6. **trace mit zwei Spalten für einen Namen und mit Text (Stationen 3, Training 1).** Die Spaltennamen sind freier Text (`aufgaben.js:952`, `el('code', {text: v})`; `data-var` nimmt den Namen unverändert); Leerzeichen und `ß` in „preis außen“ sind gelesen, im Browser nicht gesehen, ersatzweise `preis_aussen` und `preis_innen`. Das Wort `weg` wird wörtlich verglichen (`normVal`, `aufgaben.js:906`). Training 1 liest die Zeilen der Tabelle mit `/(\w+)\s*=\s*([^,]+)/g` (`:936`): Die Zeilen haben genau ein `=` und kein Komma (`Frage = print(int(7.9))` und so weiter); ein Komma schneidet den Rest ab, ein zweites `=` zählte als zweite Spalte. Das gilt auch für Zeile 4 („Welchen Datentyp liefert input()? (int oder float oder str oder bool)“): Mit Komma zeigte die Zelle nur „Welchen Datentyp liefert input(): int“ (mit dem Parser nachgerechnet) und legte die falsche Antwort nahe. Die Antwort `Punkte: 15` enthält ein Leerzeichen: erlaubt, Leerraum wird zusammengefasst (Schalter `leerzeichen` bleibt an).
7. **Zeilengrenze und Testlast (Knobelaufgabe 2).** `_MAX_ZEILEN = 200000` (`aufgaben.js:156`, Meldung bei Überschreitung „Dein Programm läuft nicht zu Ende. Ändert sich in der Schleife etwas an der Bedingung?“). Nachgerechnet (Zeilenereignisse, wie der Tracer sie zählt) für die Musterlösung von `kn-2`: Grenze 28 ergibt 998, 100 ergibt 10 883, 500 ergibt 255 192 (neu gezählt: über der Grenze, der Lauf bräche ab; 500 steht in keinem Test). Die Tests benutzen höchstens 100. `kn-1` braucht 6 bis 26 Zeilen je Lauf (0 ergibt 6, 7 ergibt 10, vierstellige Zahlen 22, fünfstellige 26).
8. **3D-Aufgabe (`bauteil3d`), Antwort 4 lautet ja.** Geht ohne Codeänderung, gelesen: Das Modul kommt über `data-files` an die Aufgabe (`aufgaben.js:563, 871`; Pfad `../assets/py/bauteil3d.py`), die Vorschau läuft über `kursausgabe.zeige("3d", …)` (`bauteil3d.py:263–275`) und `vorschau3d.js` (z zeigt nach oben, `:145`). Die Signaturen: `zylinder(d, l, segmente=48)` (`bauteil3d.py:86`), `ring(d_aussen, d_innen, l, segmente=48)` (`:94`, verlangt `0 < d_innen < d_aussen`, die Buchse ab Außendurchmesser 5 geht), `verschiebe(mesh, dx=0, dy=0, dz=0)` (`:244`, im Kurs immer mit allen drei Zahlen aufgerufen), `vereinige(*meshes, name=…)` (`:251`), `zeige(mesh, name=None)` (`:263`). Tests laufen im selben Namensraum (`exec(tests_src, ns)`) und können `schraube(…)`, `abmessungen(…)` und `volumen(…)` aufrufen (Muster `app/inhalte/v06/labor/w-3d.tests.py`). Maße und Volumen aus diesem Papier mit `bauteil3d` gerechnet: `schraube(10, 40)` 20 × 20 × 50, Volumen 6 265,24; `schraube(6, 25)` 12 × 12 × 31, Volumen 1 381,50; `schraube(4, 10)` 8 × 8 × 14, Volumen 325,79; Szene 56 × 20 × 50, Volumen 7 646,74; `buchse(30, 20)` 30 × 30 × 20, Volumen 3 508,6; Beispiel am Beamer 65 × 30 × 40, Volumen 8 019,6. Risiken wie in Termin 06: Der erste 3D-Lauf im Hörsaal ist im Browser nicht ausprobiert (Termin 06 nennt dieselbe Bedingung); Pyodide ist zu diesem Zeitpunkt schon geladen (Code lief in Block 2 und 3), die Vorschau lädt three.js lazy; fehlt `data-files`, meldet die Seite `ModuleNotFoundError` mit dem Hinweis „import vergessen?“ (`aufgaben.js:121–122`). Aufwand für eine Aufgabe mit Tests und Vorschau etwa 1 bis 2 Stunden, plus die Variante ohne 3D (Station 6) etwa 1 Stunde.
9. **Meldungen und Testdaten.** Alle Meldungen aus Festlegung 4 und Abschnitt C sind mit Python 3.13 ausgegeben (`TypeError` zweimal, `NameError` zweimal, `UnboundLocalError`). Die Tests mit Kommazahlen (Station 7) vergleichen als Zahl mit Toleranz 0,005 (`zahlen()`, `aufgaben.js:270`); Text-Tests (Fingerspiel, Schaltjahr, Bezeichnung) lesen die Zeile über ihr Anfangswort (`zeilen()`, `:263`), weil die Eingabeaufforderungen im Ausgabestrom stehen können (alle Aufforderungen enthalten keine Zahl). Keine Testdaten mit einer 5 an der Rundungsstelle (`12.5` bei Station 7 ist nicht dabei, `14.875`).
10. **Gebaut werden danach:** `kurs.yaml` (Eintrag V08 mit `aktiv: false`, `lektion: V08` bei Termin 8, Titel, kurz, hook, python), `app/inhalte/v08/lerneinheit.mdx`, `app/inhalte/v08/labor.mdx` mit den Aufgaben `w-vorgemacht`, `w-trace`, `w-funktionsplan` (mit `.start.json`, `.solution.json`), `w-parsons`, `w-3d` (`.vorlage.py`, `.tests.py`, `.solution.py`) und der Variante, `w-fehler` (`<Fehlersuche>`), `tr-1` bis `tr-4`, Knobel `k-1` und `k-2` (je `.vorlage.py`, `.tests.py`, `.solution.py`, Pläne und Daten als `.json`), `explorables-v08.js`, `v08.css`, die Hinweistexte und die zwei Tests. Gesamtaufwand der Werkzeug-Punkte 1 bis 8 etwa 4 Tage (Bausteine 2 Tage, Rest 2 Tage).

---

# Antworten des Dozenten (2026-11-27), eingearbeitet

1. **`%` wird eingeführt** (Abweichung vom Konzept). `ist_gerade` heißt `n % 2 == 0`, das Schaltjahr nutzt `zahl % teiler == 0`. `int(n / 2) * 2 == n` entfällt als Verfahren. `%` ist „Rest beim Teilen“, gezeigt an kleinen Zahlen (`7 % 2` ist 1, `8 % 2` ist 0). `//` wird nicht eingeführt. Umgerechnet: Abschnitt 3 (neuer Punkt „Der Rest beim Teilen“), Karte 4, Stationen 2 und 4, Training 2 und 4, Knobel 1 und 2, Selbstcheck 6, Festlegung 8, Ablaufplan, Baustein „Aufrufkette“ (Rechnung `7 % 2`), Station 4 (Startdaten), Technische Voraussetzung 7 (Zeilenzahlen), Lernziel, `python`-Feld, Videoinhalt Karte 4 und „Bewusst weggelassen“. Block 3 verplant 27 Minuten (höchstens 28), der Rest mit `%` kostet 4 und ersetzt das Verfahren mit `int`.
2. Lesen von draußen: ein ehrlicher Satz im Merkkasten, das Wort „global“ kommt nicht vor, Namen im Hauptprogramm heißen „draußen“.
3. `return` in einem Zweig: Pläne schreiben das Ergebnis in eine Variable und haben ein Ende; im Code darf `return` im Zweig stehen. Kein Werkzeugbau (gilt für Termin 08 bis 10).
4. 3D-Aufgabe: Schraube `schraube(d, l)` mit `verschiebe(…, 0, 0, d)`, Ersatz `bezeichnung(d, l)`.
5. Termin 07 wird angepasst: In `app/inhalte/v07/labor/w-trace.daten.json` verschwindet `x` nach der Rückgabe (`weg`). Termin 08 korrigiert nichts mehr: Der Satz „Hilfsmittel“ ist in Festlegung 10 und Station 3 gestrichen. Die Änderung an Termin 07 gehört nicht zu diesem Papier.
