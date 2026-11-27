# Termin 06 und 07 · Konzeptvorschlag zur Abstimmung (2026-11-27)

Stand: Vorschlag. Nach der Abstimmung wird daraus je ein Zuschnitt im Format von `termin-05-zuschnitt.md`.

Rahmen aus `kurs.yaml`:

- Termin 06 = T3 Zahlensysteme (1) + T4 Bitoperationen und XOR (1) + P3 Schleifen (2). Von P3 sind 5 der 7 Blöcke erledigt (Termin 04: `while`; Termin 05: `for` und `range`, Aufsummieren, `if` im Rumpf).
- Termin 07 = T5 Datentypen (2) + P4 Funktionen (2). Termin 08 = T5 (1) + P4 (3).

Schon entschieden (2026-11-27, Antworten auf die ersten vier Fragen):

1. Termin 06 und 07 werden zusammen geplant, gebaut wird zuerst 06, dann 07.
2. **Zweierkomplement** kommt in Termin 07, zusammen mit Wertebereich und Überlauf, nur als Idee: Das oberste Bit zählt als −128, ein Byte mit Vorzeichen reicht von −128 bis 127, am Zahlenkreis sieht man, warum 127 + 1 zu −128 wird. **Kein Umrechnen.** In der Klausur nur als Verständnisfrage. Das ändert die Festlegung vom 2026-11-26 („Zweierkomplement entfällt“), `KONZEPT.md` wird beim Zuschnitt angepasst.
3. **Kommazahlen in Python** (0.1 + 0.2 ergibt 0.30000000000000004) kommen in Termin 07, dort, wo `int` und `float` gegenübergestellt werden: das Phänomen, der Grund (0.1 ist im Zweiersystem unendlich lang, wie 1/3 im Zehnersystem), die Folge (Kommazahlen nicht mit `==` vergleichen, vorher runden). Klausur: Ausgabe vorhersagen und begründen.
4. **Schleifen in Termin 06:** Schrittweite `range(a, b, s)` und Schleife in Schleife.

Nachgerechnet mit Python 3.13 (Pyodide 0.26.4 = Python 3.12, gleiche Ergebnisse): `0.1 + 0.2` ergibt `0.30000000000000004`, `0.1 + 0.2 == 0.3` ergibt `False`, `round(0.1 + 0.2, 2) == 0.3` ergibt `True`; zehnmal 0.1 aufsummiert ergibt `0.9999999999999999`; `0.5 + 0.25 == 0.75` ergibt `True` (Zweierbrüche sind exakt); `127 + 1` ergibt in Python `128` und `2 ** 64 + 1` ergibt `18446744073709551617`: **Python-Ganzzahlen laufen nie über.** `round(2.5)` ergibt `2` und `round(2.675, 2)` ergibt `2.67` (Rundung auf gerade Ziffer und Darstellungsfehler).

---

# Termin 06 · Vorschlag

**Titel (Arbeitsname):** Vier Bits, eine Ziffer: Hexadezimal, XOR und Schleifen in Schleifen

| Minuten | Inhalt |
|---|---|
| 0–10 | Warm-up: „Umrechnen“ aus dem Training von Termin 05 (8 Zeilen, Papier). Brücke: Die Vierergruppen `0010 0101` werden gleich zu einer Ziffer je Gruppe. |
| 10–40 | **T3 Teil 2: Das Hexadezimalsystem.** (1) 16 Ziffern: 0 bis 9 und A bis F (A = 10 … F = 15). (2) binär ↔ hex über Vierergruppen: jede Vierergruppe ist genau eine Hex-Ziffer (`1110 0010` = `E2`). (3) hex → dezimal nur zweistellig: Stellenwerte 16 und 1 (`E2` = 14 · 16 + 2 = 226). Dezimal → hex über den Umweg binär (Stellenwerttabelle aus Termin 05, dann Vierergruppen). (4) Wozu: kürzer und weniger Tippfehler als 8 Nullen und Einsen. Alltag: Farben im Web, `#E2001A` ist das DHBW-Rot (E2 = 226 Rot, 00 Grün, 1A = 26 Blau). Präfixe `0x` und `0b` lesen. |
| 40–70 | **P3 Teil 6: Schrittweite.** `range(start, stopp, schritt)`. Der Countdown aus Termin 04 jetzt mit `for`: `range(5, 0, -1)` ergibt 5 bis 1 (der Stoppwert gehört wieder nicht dazu). Jede zweite Zahl: `range(0, 11, 2)`. Im Plan: Raute „i von 5 bis 1, Schritt −1?“. |
| 80–110 | **P3 Teil 7: Schleife in Schleife.** Für jedes `i` läuft die innere Schleife einmal ganz durch. Beispiele: alle Würfelpaare (6 · 6 = 36 Durchläufe) und zählen, wie oft die Summe 7 ist (6-mal); kleines Einmaleins als Tafel. Im Plan: Raute in der Raute. Vorbereitung auf das Raster (P9) und Schiffe versenken. |
| 110–135 | **T4: Bitoperationen und XOR.** (1) XOR als Logik: „entweder … oder“, Wahrheitstabelle neben UND und ODER (aus Termin 02 bis 04). Alltag: Treppenhauslicht mit zwei Schaltern (jeder Schalter schaltet um). (2) Bitweise UND, ODER, XOR: zwei Bytes untereinander, Spalte für Spalte die Tabelle anwenden. (3) XOR zweimal mit demselben Schlüssel ergibt wieder das Original: einfachste Verschlüsselung. Danach Auftrag für zu Hause. |

### Interaktive Bausteine (Vorschlag, 3)

1. **„Hex-Farbmischer“** (T3): drei Bytes als Schieberegler (Rot, Grün, Blau, 0 bis 255), daneben je Byte die 8 Bits in Vierergruppen, die zwei Hex-Ziffern und der Farbcode `#E2001A` mit Farbfläche. Umgekehrt lässt sich ein Code eintippen. Vermutung: Was ergibt `#FFFFFF`? (Weiß.) Und `#000000`? (Schwarz.)
2. **„Schleife in Schleife“** (P3): zwei Zähler `i` und `j` mit einstellbaren Grenzen. Knopf „Ein Schritt“ zeigt, wie `j` durchläuft und `i` erst danach weiterzählt, dazu ein Raster, das sich Zelle für Zelle füllt (6 × 6 Würfelpaare, Summe 7 hervorgehoben). Vermutung: Wie oft läuft der innere Rumpf bei 3 und 4? (12.)
3. **„XOR-Geheimschrift“** (T4): ein Wort aus Großbuchstaben (A = 1 … Z = 26, 5 Bit) und ein Schlüssel aus 5 Bit. Der Baustein zeigt je Buchstabe die Bits, den Schlüssel darunter, das XOR-Ergebnis und daraus den verschlüsselten Buchstaben. Knopf „Noch einmal mit demselben Schlüssel“ entschlüsselt. Vermutung: Was kommt heraus, wenn du das Ergebnis noch einmal mit dem Schlüssel verknüpfst? (Das Wort.)

Die Codierung A = 1 … Z = 26 ist bewusst nicht ASCII (Zeichencodes kommen mit T6). Ergebnisse über 26 (bis 31) zeigt der Baustein als Zahl statt als Buchstaben (zu klären im Zuschnitt).

### Knobelaufgaben (Ideen)

1. **Pyramide aus Zahlen:** Für n = 4 die Zeilen `1`, `1 2`, `1 2 3`, `1 2 3 4`. Die innere Schleife hängt von `i` ab (`range(1, i + 1)`), und die Zeile wird als Text zusammengebaut (`zeile = zeile + f"{j} "`). Nur bekannte Mittel, aber der Kniff mit der wachsenden inneren Grenze muss selbst gefunden werden.
2. **Pythagoras-Tripel:** alle a, b, c bis 20 mit a·a + b·b == c·c und a < b, drei Schleifen ineinander, zählen, wie viele es gibt (6: 3-4-5, 5-12-13, 6-8-10, 8-15-17, 9-12-15, 12-16-20). Nachzurechnen im Zuschnitt.

### Was in Termin 06 wegfällt (Vorschlag)

- Hex mit mehr als zwei Stellen umrechnen (keine neue Idee, nur längere Rechnung).
- Dezimal → hex direkt mit Division durch 16: Ohne `//` und `%` und mit dem Umweg über binär nicht nötig.
- Schiebe-Operatoren `<<` und `>>`, bitweises NICHT `~`, NAND, NOR.
- `break`, `continue`, `while True:` (wie bisher).
- Muster aus Sternchen (Rechteck, Dreieck): braucht `print(..., end="")` oder `"*" * n`, beides nicht eingeführt (siehe Frage 4).

---

# Termin 07 · Vorschlag

**Titel (Arbeitsname):** Was im Speicher steht: Datentypen und eigene Funktionen

| Minuten | Inhalt |
|---|---|
| 0–10 | Warm-up aus dem Training von Termin 06 (Hex umrechnen oder Ablauf einer Schleife in Schleife). |
| 10–40 | **T5 Teil 1: Ganze Zahlen im Speicher.** (1) Ein Datentyp sagt, wie die Bits gelesen werden; `type(42)` ist `int`. (2) Wertebereich: n Bit ergeben 2ⁿ Werte (aus Termin 05), also 8 Bit 0 bis 255, 16 Bit 0 bis 65 535. (3) Überlauf: Ein 8-Bit-Zähler springt von 255 auf 0, wie ein Kilometerzähler mit fünf Rädern von 99 999 auf 00 000. (4) Negative Zahlen, nur die Idee des Zweierkomplements: Das oberste Bit zählt als −128 statt +128. Damit reicht ein Byte von −128 bis 127, `1000 0000` ist die kleinste Zahl, `1111 1111` ist −1, und am Zahlenkreis wird aus 127 + 1 die −128. Kein Umrechnen. Wichtig für Python: Python-Ganzzahlen wachsen mit und laufen nie über; Überlauf gibt es in Steuerungen, Sensoren und anderen Sprachen. |
| 40–70 | **P4 Teil 1: Eigene Funktion ohne Rückgabe.** `def`, Rumpf eingerückt, Aufruf mit Namen und Klammern. Ein benannter Ablauf, der mehrfach aufgerufen wird (Spielregeln anzeigen, Trennlinie). Dann mit Parameter: `def begruessen(name):`. Im Plan: Symbol „Unterprogramm“ (Rechteck mit Doppellinien, DIN 66001) im Hauptplan, eigener kleiner Plan für die Funktion. |
| 80–110 | **P4 Teil 2: Funktion mit Rückgabe.** `return`, der Wert kommt beim Aufruf heraus und wird gespeichert oder ausgegeben (`ergebnis = quadrat(4)`). Unterschied `print` gegen `return` (häufigster Anfängerfehler: `None` in der Ausgabe). Beispiele: Umrechner (Grad Celsius in Fahrenheit, km/h in m/s), Punkte in Note. |
| 110–135 | **T5 Teil 2: Kommazahlen und ihre Genauigkeit.** (1) `int` und `float` nebeneinander: `7 / 2` ergibt `3.5`, `6 / 2` ergibt `3.0`, `type()` zeigt den Unterschied. (2) Das Phänomen: `0.1 + 0.2` ergibt `0.30000000000000004`, `0.1 + 0.2 == 0.3` ergibt `False`. (3) Der Grund ohne Rechnen: 1/3 ist im Zehnersystem 0,333… und hört nie auf; 0,1 ist im Zweiersystem genauso unendlich lang, der Rechner schneidet nach 52 Bit ab. Halbe, Viertel, Achtel gehen genau auf (`0.5 + 0.25 == 0.75` ist `True`). (4) Die Folge: Kommazahlen nie direkt mit `==` oder `!=` vergleichen, sondern vorher runden (Frage 6). Auch Schleifenbedingungen mit Kommazahlen: `while x != 1.0` mit `x = x + 0.1` endet nie (im Termin-04-Zuschnitt für Termin 07 vorgemerkt). Danach Auftrag für zu Hause. |

### Interaktive Bausteine (Vorschlag, 3)

1. **„Zahlenkreis“** (T5 Teil 1): ein Byte als Kreis mit 256 Stellen, ein Zeiger, Knöpfe „+1“ und „−1“, die 8 Bits darunter. Schalter „ohne Vorzeichen“ / „mit Vorzeichen“: Dieselben Bits zeigen 0 bis 255 oder −128 bis 127, die rechte Hälfte des Kreises färbt sich bei „mit Vorzeichen“ als negativ. Vermutung: Was zeigt der Zähler nach 255 + 1? (0.) Und mit Vorzeichen nach 127 + 1? (−128.) Der Baustein rechnet, die Studierenden lesen nur ab.
2. **„Funktionsmaschine“** (P4): eine Kiste mit Eingang und Ausgang. Wert eintragen, die Kiste rechnet (gewählte Funktion, z. B. `celsius_zu_fahrenheit`), Schritt für Schritt: Aufruf, der Parameter bekommt den Wert, Rumpf, `return`, der Wert landet in der Variablen beim Aufruf. Schalter „`print` statt `return`“ zeigt, warum dann `None` gespeichert wird.
3. **„Kommazahl unter der Lupe“** (T5 Teil 2): zwei Kommazahlen addieren, Ergebnis einmal so, wie Python es zeigt, und einmal mit 20 Nachkommastellen; Ampel „genau / nicht genau“. Zweiter Teil: zehnmal 0.1 aufsummieren, die Summe Schritt für Schritt (0.1, 0.2, 0.30000000000000004, …, 0.9999999999999999) und der Vergleich mit 1.0. Vermutung: Ist `0.5 + 0.25 == 0.75`? (Ja.) Ist `0.1 + 0.2 == 0.3`? (Nein.)

### Knobelaufgaben (Ideen)

1. **Primzahl-Funktion:** `ist_primzahl(n)` mit `for` und einem Zähler der Teiler, ohne `%`: Teiler prüfen über `n / t == int(n / t)` (geht, weil die Ganzzahlen klein sind). Danach alle Primzahlen bis 50 ausgeben. Nachzurechnen, ob das ohne `%` sauber bleibt; sonst eine andere Aufgabe.
2. **Wann läuft der Zähler über?** Ein 16-Bit-Zähler zählt Werkstücke, jede Sekunde eins. Nach wie vielen Stunden springt er auf 0? (65 536 s, gut 18,2 h.) Als Funktion `stunden_bis_ueberlauf(bit)` für 8, 16, 32 Bit.

### Was in Termin 07 wegfällt (Vorschlag)

- Zweierkomplement umrechnen (Bits kippen, 1 addieren): entschieden, kein Rechnen.
- Aufbau einer Gleitkommazahl (Vorzeichen, Exponent, Mantisse, IEEE 754): nur der Satz „der Rechner schneidet nach 52 Bit ab“.
- `decimal`, `fractions`, `math.isclose`.
- `str` und `bool` als Datentypen, Umwandlung mit `int()`, `float()`, `str()`, `TypeError` bei `"5" + 3`: Termin 08 (T5 Teil 3, Frage 5).
- Lokale und globale Namen, Funktionen, die Funktionen aufrufen, Standardwerte für Parameter, `bauteil3d` mit Parametern: Termin 08.

---

# Technische Fragen, die ich vor dem Zuschnitt prüfe (keine Entscheidung nötig)

- Plan-Baustein und Plan-Editor: Raute in der Raute (verschachtelte Schleifen) und Beschriftung mit Schrittweite („i von 5 bis 1, Schritt −1“). Das Symbol „Unterprogramm“ kennt der Editor schon (`pap-editor.js:45`, `pap-engine.js:409`).
- 3D-Vorschau in der neuen App: `bauteil3d.py` liegt unter `site/assets/py/`, benutzt wurde es nur von der alten V20. Ob Aufgaben der App es laden können, ist ungeprüft. Laut `KONZEPT.md` soll P3 eine 3D-Aufgabe bekommen (Turm oder Lochreihe); in Termin 05 ist sie wegen der fehlenden Schrittweite nicht drin.
- Selbsterklärung „Schritt für Schritt“ (`viz.js`) mit zwei geschachtelten `for`-Zeilen.

# Offene Fragen an dich

1. **Hexadezimal: Umfang.** Vorschlag oben: binär ↔ hex über Vierergruppen als Kern, hex → dezimal nur zweistellig, dezimal → hex nur über den Umweg binär. Oder zusätzlich dezimal → hex direkt?
2. **Python-Werkzeuge zum Nachprüfen** (`0b1011`, `0xE2`, `bin()`, `hex()`, `int("E2", 16)`): Vorschlag: in einer Karte zeigen, damit man Ergebnisse von Hand nachprüft; nicht in der Klausur, nicht in Aufgaben verlangt. Oder ganz weglassen?
3. **Bitoperationen in Python** (`&`, `|`, `^`): Vorschlag: nur auf Papier und im Baustein üben, die Python-Zeichen einmal zeigen. Oder auch in Code-Aufgaben?
4. **Muster aus Zeichen bei Schleife in Schleife** (Rechteck aus `*`): braucht `print("*", end="")` oder `"*" * n`. Vorschlag: nicht einführen, die Beispiele geben ganze Zeilen aus (Würfelpaare, Einmaleins). Oder `end=""` einführen, weil Muster sehr anschaulich sind?
5. **Datentypen auf 07 und 08 verteilt:** Vorschlag oben: 07 ganze Zahlen im Speicher (Wertebereich, Überlauf, Zweierkomplement-Idee) und Kommazahlen; 08 `str` und `bool`, Umwandlung, `TypeError`. Einverstanden?
6. **Runden vor dem Vergleich:** `round(x, 2)` neu einführen (kurz, klausurtauglich; Testdaten ohne 5 an der letzten Stelle, weil `round(2.5)` 2 ergibt) – oder Vergleich mit Toleranz `abs(a - b) < 0.001` (braucht `abs`) – oder nur ausgeben mit `:.2f` und den Vergleich ganz vermeiden?
7. **Funktionen in 07:** `def` ohne und mit Parameter, dann `return` (Vorschlag) – oder in 07 nur ohne Rückgabe und `return` erst in 08?

# Entscheidungen des Dozenten (2026-11-27)

Alle sieben Fragen sind mit der Empfehlung beantwortet:

1. Hexadezimal: Vierergruppen als Kern, hex → dezimal nur zweistellig, dezimal → hex nur über den Umweg binär.
2. `0x`, `0b`, `hex()`, `bin()`, `int("E2", 16)`: nur in einer Karte zum Nachprüfen zeigen, nicht in Aufgaben, nicht in der Klausur.
3. `&`, `|`, `^`: nur zeigen; geübt wird auf Papier und im Baustein.
4. Kein `end=""`, keine Muster aus Zeichen; Schleife in Schleife gibt ganze Zeilen aus.
5. T5 verteilt: Termin 07 ganze Zahlen im Speicher und Kommazahlen, Termin 08 `str`, `bool`, Umwandlung, `TypeError`.
6. Kommazahlen vergleichen mit `round(x, 2)`; Testdaten ohne 5 an der Rundungsstelle.
7. Funktionen in Termin 07: `def` ohne und mit Parameter, dann `return`, `print` gegen `return`.
