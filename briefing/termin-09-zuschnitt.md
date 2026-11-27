# Zuschnitt Termin 09 (Entwurf zur Bestätigung)

Aufbau und Ton wie `briefing/termin-07-zuschnitt.md`. Grundlage ist `briefing/termin-08-10-konzept.md` mit den Entscheidungen des Dozenten vom 2026-11-27 (Entscheidungen 5 bis 8: Rechneraufbau mit Spielzeug-Rechner, Zufall mit `random.randint`, Zahlenraten in Schritten mit abnehmender Führung, Programm in Funktionen zerlegen als Brücke). Termin 09 und Termin 10 sind zusammen entworfen: Das Zahlenraten läuft über beide, die Stufen stehen in `briefing/termin-10-zuschnitt.md`. Alle Zahlen, Programme, Ausgaben, Fehlermeldungen und Testdaten sind mit Python 3.13 nachgerechnet (Pyodide 0.26.4 ist Python 3.12; die genannten Meldungen sind in beiden gleich). Wo dieses Papier „zu bestätigen“ sagt, liegt die Entscheidung beim Dozenten (Liste am Ende, 6 Fragen). Was Termin 08 bringt, ist hier nur vorausgesetzt (`str`, `bool`, Umwandlung, `int(3.7)`, lokale Namen, Funktion ruft Funktion, `return` in einer Verzweigung, `bauteil3d` mit Parametern); das Papier zu Termin 08 ist mit diesem abgeglichen (Warm-up, Namensregel, Text `==`).

## Aufteilung

| Einheit | Termin 09 |
|---|---|
| T6 Rechneraufbau, Teil 1 von 3 | Block 1: die fünf Bauteile, was bei Strom aus bleibt, der Weg eines Programms (SSD, Arbeitsspeicher, Prozessor), der Bus |
| P4 Funktionen, Teil 6 von 6 | Block 2: ein Programm in Funktionen zerlegen, Hauptplan mit Unterprogrammen |
| P5 Zahlenraten, Teil 1 von 4 | Block 3: Stufe 1 „Ein Tipp“: `import random`, `random.randint(1, 100)`, `hinweis(geraten, geheim)` gibt Text zurück |
| T6 Rechneraufbau, Teil 2 von 3 | Block 4: holen, entschlüsseln, ausführen, Takt, der Spielzeug-Rechner mit 4 Befehlen |

Beispielwelt: Theorie das Spiel (Spielstand im Arbeitsspeicher oder auf der SSD) und ein Spielzeug-Rechner. Programmieren Getränkeautomat (wie in Termin 02, jetzt mit drei Getränken) und Schere-Stein-Papier (aus Termin 03), beide zerlegt, dann das Zahlenraten. Maschinenbau nur dort, wo es natürlich passt: nirgends in diesem Termin erzwungen, der Prozessor als Facharbeiter an der Werkbank ist nur ein Bild.

Reihenfolge: Die zwei Theorie-Blöcke stehen am Anfang und am Ende, die Programmierblöcke in der Mitte (wie in Termin 07). So folgt das Zahlenraten direkt auf das Zerlegen („Brücke“, Entscheidung 8), und der Spielzeug-Rechner steht im kurzen letzten Block (24 Minuten), wo ein einziger Baustein und eine Ablaufverfolgung genügen. Die Pause liegt zwischen Block 2 und Block 3 (nur hier im Zuschnitt). Frage 2 nennt die Alternative.

Abweichungen vom Konzept vorweg:

- **Zufallszahl in den Tests:** `run_program` setzt keinen Startwert (nur der Knopf „Ausführen“ setzt `random.seed`, `aufgaben.js:221–222`). Die Tests ersetzen deshalb `random.randint` durch eine Funktion mit festen Werten (Technische Voraussetzung 2). Das ist keine Abweichung vom Konzept (Entscheidung 6: „In Tests wird der Zufall festgelegt“), nur die Ausführung.
- **Hinweistexte sind vorgegeben** (`Zu klein`, `Zu groß`, `Richtig!`), damit die Tests sie lesen können. Frage 5.
- **Kein Zeilen-Ordnen-Auftrag und keine Fehlersuche im Termin:** „Ein Tipp“ läuft über Lückencode (Station 6) und eine eigene Aufgabe (Station 7). Das Zeilenordnen tragen Termin 07 und das Training.
- **Funktionen im Plan mit einer Rückgabe am Ende** (Festlegung 6 von Termin 07): Das `return` in einer Verzweigung (Termin 08) ist im Plan-Editor nicht zeichenbar. Die Pläne dieses Termins schreiben das Ergebnis in eine Variable (`text`) und geben sie am Ende zurück; im Code dürfen Studierende `return` in den Zweigen schreiben, die Tests prüfen nur die Ausgabe. Frage 1.

## Festlegungen für Termin 09

Es gelten alle Festlegungen aus Termin 02 bis 07 (Stationsreihenfolge von Termin 01, drei gestufte Tipps, Grenzfall in jeder Aufgabe, höchstens 28 Minuten je Block verplant und im letzten Block höchstens 24, Videos laufen nicht im Termin, Pausen stehen nicht in der App, Meldungstexte ohne Gedankenstrich, Testdaten mit letztem Eingabewert, der das Ergebnis ändert, Kommazahlen mit `:.1f` oder `:.2f` ausgeben) und das Konzept zu Termin 08 bis 10. Dazu neu:

1. **Kennung V09**, Ordner `app/inhalte/v09/`, Adressen `v09-rechneraufbau-und-zufall.html` und `v09-labor.html`, Bausteine in `explorables-v09.js` mit `v09.css`. Die Dateinamen sind alt belegt (Technische Voraussetzung 1). In `kurs.yaml` bekommt `termine` bei `nr: 9` den Zusatz `lektion: V09`, der Eintrag unter `lektionen` zunächst mit `aktiv: false`.
2. **Wörter (Theorie):** Prozessor, Arbeitsspeicher (RAM), Festplatte und SSD, Eingabe und Ausgabe, Bus, Befehl, Takt, Akku (nur im Spielzeug-Rechner; ob das Wort passt, fragt Frage 4). „Befehlszähler“ und „Befehlsfeld“ sind keine Pflichtwörter: Der Spielzeug-Rechner zeigt einen Pfeil „nächster Befehl“ am Programm und ein Feld „geholt“, beides ohne Fachwort. „Flüchtig“ steht als Hinweis („weg, wenn der Strom ausfällt“), nicht als Pflichtwort. Der Name „von-Neumann-Architektur“, „Register“, „Kern“ und „Cache“ fallen in Termin 09 nicht (Cache und Register kommen in Termin 10 als Stufe des Speichers). Der Bus ist **eine** Leitung für Daten, Adressen und Signale; die Dreiteilung in Adress-, Daten- und Steuerbus entfällt.
3. **Der Spielzeug-Rechner** (Entscheidung 5, Baustein 2). Fest und überall gleich:
   - **Speicher:** vier Zellen `A`, `B`, `C`, `D`, jede hält eine ganze Zahl. Dazu im Prozessor der **Akku** (ein Rechenplatz) und ein Pfeil „nächster Befehl“ (welche Zeile als Nächstes kommt, ab 1; kein Pflichtwort, Festlegung 2).
   - **Programm:** höchstens 8 Zeilen, ein Befehl je Zeile. Das Programm liegt neben dem Speicher, nicht in den Zellen (Programm und Daten im selben Speicher entfällt).
   - **Vier Befehle:** `LADE x` (der Akku bekommt den Wert der Zelle x), `ADDIERE x` (der Akku bekommt Akku plus Wert der Zelle x), `SPEICHERE x` (die Zelle x bekommt den Wert des Akkus), `STOPP` (der Rechner hält an). Die Zelle `x` ist immer `A`, `B`, `C` oder `D`. Kein Sprung, keine Bedingung, keine Eingabe.
   - **Anzeige:** das Programm mit der aktiven Zeile und dem Pfeil „nächster Befehl“, ein Feld „geholt“ (der geholte Befehl als Text), der Akku, die vier Zellen, der Taktzähler, und drei Lämpchen „holen“, „entschlüsseln“, „ausführen“.
   - **Takt:** Jeder Befehl braucht drei Takte (holen, entschlüsseln, ausführen), auch `STOPP`. „Im Spielzeug immer drei, im echten Rechner je nach Befehl verschieden“ steht dabei.
   - **Beispielprogramm** (im Baustein beim Start geladen, Zellen `A` 5, `B` 3, `C` 0, `D` 0): `LADE A`, `ADDIERE B`, `SPEICHERE C`, `STOPP`. Ergebnis: `C` ist 8, nach 12 Takten. Es entspricht der Python-Zeile `c = a + b`.
   - **Vermutungsprogramm** (zweite Auswahl im Baustein, `A` 4): `LADE A`, `ADDIERE A`, `SPEICHERE B`, `ADDIERE B`, `SPEICHERE D`, `STOPP`. Ergebnis: `B` ist 8, `D` ist 16, nach 18 Takten. Eine Umrechnung in Sekunden gibt es nicht (Festlegung 4).
   - Die Befehle schreibt man im Baustein nie als Text, nur über Auswahlfelder (Befehl und Zelle). Frage 4 fragt, ob Studierende eigene Programme zusammenstellen dürfen.
4. **Takt:** „Eine Uhr gibt den Takt vor. Bei jedem Takt macht der Prozessor einen kleinen Schritt.“ Ein Prozessor mit 3 GHz schafft 3 Milliarden Takte pro Sekunde (1 GHz sind 1 Milliarde Takte pro Sekunde). Keine Rechnung mit Kernen, keine Vergleiche zwischen Geräten, keine Umrechnung der Takte in Sekunden (keine Nanosekunden, keine Zehnerpotenzen).
5. **Zerlegen (P4 Teil 6):** Vorgehen in drei Sätzen: (1) Schreib in Worten, welche Aufgaben das Programm hat. (2) Jede Aufgabe, die einen klaren Wert hineinbekommt und einen Wert oder einen Text herausgibt, wird eine Funktion. (3) Das Hauptprogramm ruft sie nur noch der Reihe nach auf und liest sich wie die Beschreibung. **Das Zerlegen ändert die Ausgabe nicht.** Funktionen haben höchstens zwei Parameter, ihre Namen sind klein und ohne Umlaute. Der Hauptplan hat für jeden Aufruf das Rechteck mit Doppellinien (Unterprogramm), jede Funktion einen eigenen kleinen Plan mit einer Rückgabe am Ende. **Zu bestätigen (Frage 3):** Dieses Papier lässt Parameter und Variablen im Hauptprogramm gleich heißen (`geld`/`preis`, `geraten`/`geheim`, `tipp`/`wurf`, `betrag`, `text`), weil Termin 08 die lokalen Namen einführt. Der Zuschnitt 08 (Festlegung 5) hält in Termin 08 an „verschiedene Namen“ fest und sagt ausdrücklich, dass ab Termin 09 gleiche Namen erlaubt sind: Die Regel lautet in beiden Papieren gleich. `hinweis(geraten, geheim)` mit denselben Namen im Hauptprogramm steht schon in Entscheidung 7 des Konzepts. In Tabellen zum Ablauf verfolgen heißen die Namen immer verschieden.
6. **Zufall (P5 Teil 1):** `import random` steht als erste Zeile. `random.randint(1, 100)` liefert eine ganze Zahl von 1 bis 100, **beide Grenzen gehören dazu** (anders als bei `range`, wo der Stoppwert nicht dazugehört; dieser Satz steht in Abschnitt 3 als Vorhersage mit Auflösung und kommt in den Grenzfällen der Stationen 6 und 7 wieder vor). Sonst kommt nichts aus `random` vor (`random()`, `choice`, `seed`, `randrange` nicht). Ob die Zufallszahl wirklich „zufällig“ ist (Pseudozufall), wird nicht erklärt. Der Name der Zufallszahl ist `geheim`, der Tipp heißt `geraten`; diese zwei Namen bleiben in allen Stufen.
7. **Zahlenraten, Stufe 1 „Ein Tipp“:** `hinweis(geraten, geheim)` gibt einen Text zurück, genau `Zu klein` (Tipp kleiner als die Zahl), `Zu groß` oder `Richtig!`. Die Funktion steht in der Datei vor dem Hauptprogramm. Das Hauptprogramm hat drei Zeilen: Zufallszahl ziehen, Tipp einlesen, `print(hinweis(geraten, geheim))`. Eine Schleife gibt es noch nicht (Stufe 2, Termin 10). Der Plan zeigt `geheim = random.randint(1, 100)` als normales Rechteck (wie `round`, Entscheidung 6 von Termin 07) und den Aufruf als Unterprogramm.
8. **Zufall in den Tests:** Jede Zahlenraten-Aufgabe prüft (a) die Ausgabe bei festen Werten für `randint` und festen Eingaben und (b) dass `random.randint` genau einmal pro Spiel mit `(1, 100)` aufgerufen wird (Technische Voraussetzung 2). Wer `geheim` fest einträgt, die Grenzen ändert oder `randint` mehrmals ruft, bekommt immer dieselbe eine Meldung: „Zieh die Zahl genau einmal mit `random.randint(1, 100)`.“ Das gilt auch für Station 6 und Training 3, nicht nur für Würfelraten; ohne diese Prüfung findet kein Test den Fehler (Technische Voraussetzung 2).
9. **Kein `%`, kein `//`, kein `+=`, kein `break`, kein `while True`, keine Liste, kein `global`, kein `try`:** In Termin 09 braucht nichts davon einen Ausweg.

---

# Termin 09

## A. Kopf

- Titel: **Was im Rechner läuft: Bauteile, Befehle und dein erstes Spiel** (Arbeitsname: „Was im Rechner läuft“ trifft Block 1 und 4, „dein erstes Spiel“ die Blöcke 2 und 3)
- Vorspann: Dein Programm läuft nicht im Bildschirm, sondern in einem Rechner mit festen Bauteilen und einem Takt. Heute siehst du, was darin passiert, Befehl für Befehl, und du lernst, ein langes Programm in Funktionen zu zerlegen. Danach beginnt dein erstes Spiel: Der Rechner denkt sich eine Zahl aus, und du rätst sie.
- Lernziele:
  - die fünf Bauteile (Prozessor, Arbeitsspeicher, Festplatte oder SSD, Eingabe und Ausgabe, Bus) nennen, ihre Aufgabe beschreiben und sagen, was bei Strom aus bleibt
  - erklären, wie ein Prozessor einen Befehl bearbeitet (holen, entschlüsseln, ausführen, im Takt) und ein kleines Programm des Spielzeug-Rechners von Hand durchgehen
  - ein Programm in Funktionen zerlegen und den Hauptplan mit Unterprogrammen lesen und zeichnen
  - mit `random.randint(1, 100)` eine Zufallszahl ziehen und mit einer Funktion `hinweis(geraten, geheim)` einen Tipp bewerten
- kurz: „Rechneraufbau, Zufall“
- hook: „Dein Rechner zählt im Takt“
- neu in Python (Feld `python` in `kurs.yaml`): `python: ["import random", "random.randint(a, b)", "Programm in Funktionen zerlegen"]`. Dazu `NameError: name 'random' is not defined` (Aufruf ohne `import`), in Tipps nur gelesen.

## B. Warm-up (0–10)

**Training 08, Aufgabe 1 „Typen und Umwandlung“** (`tr-1` aus Termin 08, wie dort gestellt): sechs Zeilen auf Papier (5 Minuten), Auflösung an der Tafel (2 Minuten). Auflösung (so festgelegt im Zuschnitt 08, mit Python 3.13 nachgerechnet): `print(int(7.9))` ergibt `7` · `print("4" + "5")` ergibt `45` · `print(int("4") + 5)` ergibt `9` · der Datentyp von `input()` ist `str` · `print("Punkte: " + str(15))` ergibt `Punkte: 15` · `print("3" + 4)` meldet `TypeError`.

Brücke in die Theorie (3 Minuten, Frage in die Runde), an Zeile 4 geknüpft: `input()` liefert immer Text: Du tippst eine 5 auf der Tastatur. Wo steht das Programm, während es läuft, und welche Bauteile arbeiten, bis `print` das Ergebnis zeigt? Auflösung in Abschnitt 1: Eingabe, Bus, Prozessor, Arbeitsspeicher, Bildschirm.

## C. Lerneinheit

### Abschnitt 1 · Die Bauteile eines Rechners (T6, Teil 1 · 10–40)

Kernaussage: Ein Rechner besteht aus wenigen Bauteilen mit klaren Aufgaben. Der Prozessor rechnet, der Arbeitsspeicher hält fest, was gerade läuft, die SSD oder Festplatte bewahrt alles auf, Eingabe und Ausgabe verbinden den Rechner mit dir, der Bus verbindet alle. Block 1 hat vier Kerne: die fünf Bauteile, bleiben oder verschwinden bei Strom aus, der Weg eines Programms, der Bus.

- Reihenfolge im Text: Bild, die fünf Bauteile, Baustein mit Vermutung „Strom aus“, danach „Bleiben oder verschwinden“, Weg eines Programms, Bus, Begriffs-Hinweise. Was bei Strom aus bleibt, steht vor dem Baustein nirgends.
- Das Bild: ein Spiel am Rechner. Das Spiel liegt auf der **SSD** (oder Festplatte). Beim Start wird es in den **Arbeitsspeicher** geladen. Der **Prozessor** führt es aus, Schritt für Schritt. Du gibst etwas mit der **Eingabe** (Tastatur, Maus, Touchscreen) ein, du siehst das Ergebnis auf der **Ausgabe** (Bildschirm, Lautsprecher). Der **Bus** transportiert die Daten zwischen allen. Als Bild für Maschinenbauer: Prozessor als Facharbeiter, Arbeitsspeicher als Werkbank, SSD als Lager, Bus als Transportweg. Das Bild steht nur in einem Satz.
- Die fünf Bauteile mit je einem Satz Aufgabe. Eingabe und Ausgabe zählen zusammen als ein Bauteil, so zählen auch der Baustein und Station 3. Prozessor „rechnet und führt Befehle aus“. Arbeitsspeicher „hält das laufende Programm und seine Daten, schnell“. Festplatte oder SSD „speichert Programme und Dateien, größer, aber langsamer“. Eingabe und Ausgabe „Tastatur, Maus, Bildschirm, Lautsprecher“. Bus „die Leitungen zwischen den Bauteilen“.
- Bleiben oder verschwinden (steht im Text erst nach dem Baustein, als Auflösung seiner Vermutung): Der Arbeitsspeicher verliert seinen Inhalt, wenn der Strom ausfällt. Die SSD behält ihn. Darum gibt es „Speichern“: Das Programm kopiert den Spielstand vom Arbeitsspeicher auf die SSD.
- Der Weg eines Programms: SSD, Bus, Arbeitsspeicher, Bus, Prozessor. Das Ergebnis geht über den Bus zum Arbeitsspeicher und zur Ausgabe. Der Prozessor arbeitet nie direkt mit der SSD.
- Der Bus im Satz: Er verbindet die Bauteile, was er transportiert, geht durch dieselben Leitungen. Mehr nicht (Festlegung 2).
- Begriffs-Hinweise (`<Begriff e="…">`, stehen nach dem Baustein): Prozessor „Das Bauteil, das rechnet und die Befehle eines Programms ausführt.“ · Arbeitsspeicher „Hält das laufende Programm und seine Daten. Der Inhalt verschwindet, wenn der Strom ausfällt.“ · SSD „Speichert Programme und Dateien dauerhaft, auch ohne Strom. Eine Festplatte macht dasselbe, nur langsamer.“ · Bus „Die Leitungen, über die die Bauteile Daten austauschen.“

Keine eigene Vorhersage in diesem Abschnitt: Die Vermutung des Bausteins („Strom aus, Level 5 nicht gespeichert: In welchem Level startest du neu?“, Level 3) ist die einzige Frage zu Strom aus, und ihre Auflösung ist der Absatz „Bleiben oder verschwinden“. Selbstcheck 2 stellt die Frage später noch einmal.

### Abschnitt 2 · Ein Programm zerlegen (P4, Teil 6 · 40–70)

Kernaussage: Ein langes Programm wird übersichtlich, wenn jede Aufgabe eine eigene Funktion bekommt. Das Hauptprogramm ruft die Funktionen der Reihe nach auf.

- Rückgriff: Du kennst `def`, Parameter und `return` (Termin 07 und 08). Bisher hast du kleine Funktionen geschrieben. Jetzt nimmst du ein ganzes Programm auseinander. Das Programm unten ist ein Getränkeautomat wie in Termin 02, jetzt mit drei Getränken: 14 Zeilen, alles hintereinander.

```python
# Getränkeautomat: 1 = Cola, 2 = Wasser, 3 = Saft
wahl = int(input("Getränk (1 Cola, 2 Wasser, 3 Saft): "))
geld = float(input("Geld in Euro: "))
if wahl == 1:
    preis = 2.5
elif wahl == 2:
    preis = 1.0
else:
    preis = 2.0
if geld >= preis:
    rest = geld - preis
    print(f"Bitte sehr. Wechselgeld: {rest:.2f} Euro")
else:
    fehlt = preis - geld
    print(f"Es fehlen {fehlt:.2f} Euro")
```

- Schritt 1, Aufgaben in Worten: Eingabe lesen. Den Preis zum Getränk bestimmen. Die Antwort bilden. Ausgeben.
- Schritt 2, was wird eine Funktion? Der Preis: es geht eine Nummer hinein, ein Preis kommt heraus (`preis_von(nr)`). Die Antwort: es gehen Geld und Preis hinein, ein Text kommt heraus (`antwort(geld, preis)`).
- **Vorhersage „Wie lang bleibt das Hauptprogramm?“** (hier, vor Schritt 3; das zerlegte Programm ist noch nicht gezeigt): Das Programm wird so zerlegt, dass `preis_von` und `antwort` Funktionen sind und alles Übrige im Hauptprogramm bleibt. Wie viele Zeilen hat das Hauptprogramm danach (ohne Kommentar)? Auswahl: 14 · [x] 4 · 8 · 1. Auflösung (mit Schritt 3): Die zwei Eingaben, der Aufruf von `preis_von` und `print(antwort(…))`: vier Zeilen. Alles andere steht in den Funktionen.
- Schritt 3, das zerlegte Programm (mit Python 3.13 gegen das lange Programm geprüft: bei denselben Eingaben dieselben Ausgaben):

```python
# Getränkeautomat: 1 = Cola, 2 = Wasser, 3 = Saft
def preis_von(nr):
    if nr == 1:
        return 2.5
    elif nr == 2:
        return 1.0
    else:
        return 2.0

def antwort(geld, preis):
    if geld >= preis:
        rest = geld - preis
        return f"Bitte sehr. Wechselgeld: {rest:.2f} Euro"
    else:
        fehlt = preis - geld
        return f"Es fehlen {fehlt:.2f} Euro"

wahl = int(input("Getränk (1 Cola, 2 Wasser, 3 Saft): "))
geld = float(input("Geld in Euro: "))
preis = preis_von(wahl)
print(antwort(geld, preis))
```

  Das Hauptprogramm hat noch 4 Zeilen und liest sich wie die Beschreibung. Beispiele: Eingabe 1 und 3 ergibt `Bitte sehr. Wechselgeld: 0.50 Euro`; 3 und 1.5 ergibt `Es fehlen 0.50 Euro`; 2 und 1 ergibt `Bitte sehr. Wechselgeld: 0.00 Euro`.
- Der Hauptplan mit Unterprogrammen (`<Plan>` dreimal: Hauptplan und zwei Funktionspläne):

```text
Eingabe: wahl
Eingabe: geld
Unterprogramm: preis = preis_von(wahl)
Unterprogramm: text = antwort(geld, preis)
Ausgabe: text
```

  Der Hauptplan zeigt nur noch, was passiert, nicht, wie. Das „Wie“ steht in den Plänen der Funktionen. Hier kommt „Schritt für Schritt“ an den Codeblock: der Aufruf springt in die Funktion und kehrt mit dem Wert zurück.
- Regel zum Mitnehmen (nach dem Baustein): **Eine Funktion, eine Aufgabe.** Was hineingeht, sind die Parameter, was herauskommt, ist der Rückgabewert. Zerlegen ändert nur, wo etwas steht, nicht, was herauskommt.
- Begriffs-Hinweis: Hauptprogramm „Der Teil, der die Funktionen der Reihe nach aufruft. Er steht unter den Funktionen.“

### Abschnitt 3 · Zahlenraten, Teil 1: Ein Tipp (P5, Teil 1 · 80–110)

Kernaussage: Der Rechner zieht mit `random.randint(1, 100)` eine Zahl, du tippst, und eine Funktion `hinweis(geraten, geheim)` sagt, ob der Tipp zu klein, zu groß oder richtig ist. Das ist die erste Stufe deines Spiels.

- Das Ziel: Der Rechner denkt sich eine Zahl von 1 bis 100 aus. Du rätst, er sagt „Zu klein“ oder „Zu groß“. In dieser Stunde kommt ein Tipp, In Termin 10 wird daraus das ganze Spiel. Der Dozent spielt einmal am Beamer (`Zu klein`, `Zu groß`, `Richtig!`).
- **Vorhersage „Welche Zahlen sind möglich?“** (hier, vor dem Plan und vor Karte 1; die Auflösung gibt Karte 1): Welche Werte kann `geheim = random.randint(1, 100)` annehmen? Auswahl: 1 bis 99 · 0 bis 100 · [x] alle ganzen Zahlen von 1 bis 100, auch 1 und 100 · nur Zahlen, die durch 10 teilbar sind. Auflösung: `randint(a, b)` nimmt beide Grenzen mit. Bei `range(1, 100)` ist das anders: dort fehlt die 100.
- Der Plan zuerst (neu: Zufall und Unterprogramm in einem Plan):

```text
geheim = random.randint(1, 100)
Eingabe: geraten
Unterprogramm: text = hinweis(geraten, geheim)
Ausgabe: text
```

```text
Funktion: hinweis(geraten, geheim)
Entscheidung: geraten < geheim?
  ja:
    text = "Zu klein"
  nein:
    Entscheidung: geraten > geheim?
      ja:
        text = "Zu groß"
      nein:
        text = "Richtig!"
Rückgabe: text
```

- Zufall (Karte 1): `import random` steht ganz oben. `random.randint(1, 100)` liefert eine ganze Zahl von 1 bis 100, **beide Grenzen gehören dazu**. Bei jedem Lauf kommt eine andere Zahl. Die Zahl wird einmal gezogen und in `geheim` gespeichert.
- Der Code, Stufe 1 (mit Python 3.13 nachgerechnet, Zufall auf feste Werte gesetzt):

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
geraten = int(input("Dein Tipp (1 bis 100): "))
print(hinweis(geraten, geheim))
```

  Mit `geheim` 42: Tipp 30 ergibt `Zu klein`, Tipp 77 ergibt `Zu groß`, Tipp 42 ergibt `Richtig!`. Auch 1 und 100 gehen: `geheim` 1 und Tipp 100 ergibt `Zu groß`.
- Merke: In der Datei steht oben `import random`, dann die Funktion, dann das Hauptprogramm. Ohne `import random` meldet Python `NameError: name 'random' is not defined`.

### Abschnitt 4 · Wie ein Prozessor einen Befehl abarbeitet (T6, Teil 2 · 110–135)

Kernaussage: Der Prozessor arbeitet ein Programm Befehl für Befehl ab, immer im selben Dreischritt: holen, entschlüsseln, ausführen. Eine Uhr gibt den Takt vor. Im Spielzeug-Rechner siehst du den Dreischritt mit nur vier Befehlen. Block 4 hat drei Kerne: Dreischritt, Takt, Spielzeug-Rechner (der Satz „Jede Python-Zeile wird zu vielen solcher Befehle“ steht am Ende).

- Der Dreischritt: **holen** (der Prozessor holt den nächsten Befehl aus dem Speicher), **entschlüsseln** (er stellt fest, was der Befehl bedeutet), **ausführen** (er macht es). Dann kommt der nächste Befehl. Ein Pfeil am Programm zeigt, welcher Befehl dran ist.
- Der Takt: Eine Uhr gibt den Takt vor. Bei jedem Takt macht der Prozessor einen kleinen Schritt. 3 GHz sind 3 Milliarden Takte pro Sekunde (Festlegung 4).
- Der Spielzeug-Rechner (Festlegung 3): vier Zellen, ein Akku, vier Befehle. Das Beispielprogramm aus der Festlegung rechnet `C = A + B` und braucht 12 Takte. Der Baustein läuft Takt für Takt, mit Lämpchen für den Dreischritt.
- Brücke zu Python: `c = a + b` ist eine Zeile. Im Rechner werden es mehrere solcher kleinen Befehle. Python übersetzt jede Zeile für dich.
- Begriffs-Hinweise: Befehl „Ein einzelner kleiner Schritt, den der Prozessor ausführt, zum Beispiel laden, addieren oder speichern.“ · Takt „Die Uhr des Prozessors: Bei jedem Takt macht er einen kleinen Schritt.“ · Akku „Der Rechenplatz im Prozessor, in dem das aktuelle Ergebnis steht.“

Vorhersage „Was steht am Ende in D?“: Zelle `A` ist 4. Das Programm lautet `LADE A`, `ADDIERE A`, `SPEICHERE B`, `ADDIERE B`, `SPEICHERE D`, `STOPP`. Was steht danach in `D`?

- 8
- 12
- [x] 16
- 4

Auflösung: `LADE A` ergibt Akku 4, `ADDIERE A` ergibt 8, `SPEICHERE B` legt die 8 in `B`, `ADDIERE B` ergibt 16, `SPEICHERE D` legt die 16 in `D`. Die Rechnung dauert 6 Befehle mal 3 Takte, also 18 Takte.

## D. Interaktive Bausteine (3)

Alle drei gehören je einem Block (1, 2, 4). Block 3 (Zahlenraten) hat keinen eigenen Baustein, damit die Zeit für die eigene Arbeit bleibt.

1. **`bauteile` – „Rechner-Baukasten“** (Abschnitt 1). Einstellen: sechs Knöpfe „Spiel starten“, „Taste drücken“, „Rechnen“, „Ergebnis zeigen“, „Spielstand speichern“, „Strom aus“. Sehen: ein Schema mit Prozessor in der Mitte, Arbeitsspeicher, SSD, Eingabe und Ausgabe (in einer gemeinsamen Klammer, als ein Bauteil) und dem Bus als Leitung dazwischen. Je Knopf leuchten die beteiligten Bauteile und die Pfeile auf dem Bus auf, ein Satz erklärt, was passiert („Das Spiel wird von der SSD in den Arbeitsspeicher geladen.“). Im Ausgangszustand steht in der SSD „Spielstand: Level 3“ und im Arbeitsspeicher „Level 5“ (das Spiel läuft), kein Bauteil trägt Wörter wie „flüchtig“ oder „dauerhaft“. „Strom aus“ leert den Arbeitsspeicher und färbt ihn grau; „Spielstand speichern“ schreibt „Level 5“ in die SSD. Vermutung: Strom aus, Level 5 nicht gespeichert: In welchem Level startest du neu? (Level 3; die Frage steht vor dem Absatz „Bleiben oder verschwinden“ und ist die einzige zu Strom aus.) Beobachtung danach: Nur der Inhalt der SSD hat überlebt. Mit „Spielstand speichern“ vor „Strom aus“ bleibt Level 5. Der Baustein rechnet nichts, die Studierenden lesen ab.
2. **`zerlegen` – „Programm zerlegen“** (Abschnitt 2). Einstellen: Eingaben für den Getränkeautomaten (Getränk 1, 2 oder 3; Geld 0 bis 5 Euro in Schritten von 0,5), Knopf „Zerlegen“, Knopf „Beide laufen lassen“. Sehen: Im Ausgangszustand steht nur das lange Programm (14 Zeilen), seine Zeilen in drei Farben („Preis bestimmen“, „Antwort bilden“, „Eingabe und Ausgabe“). „Zerlegen“ schiebt die Gruppen in die Funktionen `preis_von` und `antwort`; das Hauptprogramm bleibt mit 4 Zeilen übrig. „Beide laufen lassen“ zeigt unter beiden Fassungen die Ausgabe und, beim zerlegten Programm, welche Zeile als Nächstes dran ist (Hauptprogramm, Sprung in die Funktion, zurück). Vermutung (nicht die Frage der Vorhersage in der Lerneinheit): Ändert sich die Ausgabe bei Eingabe 3 und 1.5, wenn das Programm zerlegt ist? (Auswahl: ja, anders · nein, dieselbe; richtig: dieselbe, `Es fehlen 0.50 Euro`.) Beobachtung danach: Dieselbe Eingabe ergibt in beiden Fassungen dieselbe Ausgabe. Der Rechenkern in JavaScript stimmt mit Python überein, weil die Eingaben (Geld in halben Euro) nur genau darstellbare Werte ergeben (Technische Voraussetzung 4).
3. **`spielzeug` – „Spielzeug-Rechner“** (Abschnitt 4). Einstellen: Auswahl „Beispiel (Summe)“ oder „Vermutungsprogramm“ (siehe Festlegung 3), die Startwerte der Zellen (nur sichtbar und nicht änderbar, die Programme legen sie fest), Knöpfe „Ein Takt“, „Ein Befehl“, „Von vorn“. Sehen: Programm mit aktiver Zeile und Pfeil „nächster Befehl“, Feld „geholt“, Akku, Zellen `A` bis `D`, Taktzähler, drei Lämpchen. „Ein Takt“ schaltet das Lämpchen weiter (holen, entschlüsseln, ausführen) und ändert dabei das Feld „geholt“ und den Akku. Vermutung: Was steht am Ende in `D`? (16, Vorhersage in Abschnitt 4, gestellt vor dem ersten Takt.) Beobachtung danach: Der Akku hält ein Zwischenergebnis, die Zellen nur, was `SPEICHERE` hineinschreibt. Das Beispielprogramm gibt es bei Auswahl „Beispiel“ zum Vergleich mit `c = a + b`. Der Baustein kennt nur diese zwei Programme (Frage 4 für eigene Programme). Im Ausgangszustand zeigt er das Programm mit allen Zellen auf Startwert und den Akku auf 0: keine Zwischenergebnisse, keine Ergebniszelle.

Die Bausteine sind einfache HTML-Controls ohne eigenes Rechnen der Studierenden. Einen vierten gibt es nicht.

## E. Selbstcheck (6 Fragen, 20 Punkte)

Titel ohne Nummern, Antworten ohne Bezug auf die Reihenfolge, damit sich Fragen und Antworten mischen lassen.

1. **Wo läuft das Programm**, Auswahl, 3 Punkte. Wo liegen ein Programm und seine Daten, während es läuft? [x] Im Arbeitsspeicher · Nur auf der SSD · Im Bus · In der Ausgabe. Erklärung: Der Prozessor arbeitet mit dem Arbeitsspeicher, nicht direkt mit der SSD. Die SSD hält das Programm nur, solange es nicht läuft.
2. **Strom aus**, Auswahl (mehrere richtig), 4 Punkte. Welche Bauteile behalten ihre Daten, wenn der Strom ausfällt? [x] SSD · [x] Festplatte · Arbeitsspeicher · Bus. Erklärung: SSD und Festplatte speichern dauerhaft. Der Arbeitsspeicher verliert alles, der Bus speichert nichts, er transportiert nur.
3. **Reihenfolge**, Auswahl, 3 Punkte. In welcher Reihenfolge bearbeitet der Prozessor einen Befehl? [x] holen, entschlüsseln, ausführen · ausführen, holen, entschlüsseln · entschlüsseln, holen, ausführen · speichern, holen, ausführen. Erklärung: Zuerst muss der Befehl da sein (holen), dann wird er verstanden (entschlüsseln), dann gemacht (ausführen).
4. **Spielzeug-Rechner**, Zahl, 4 Punkte, Antwort `12`. Zelle `A` ist 6, `B` ist 0. Das Programm lautet `LADE A`, `ADDIERE A`, `SPEICHERE B`, `STOPP`. Was steht danach in `B`? Erklärung: `LADE A` ergibt Akku 6, `ADDIERE A` ergibt 12, `SPEICHERE B` legt die 12 in `B`.
5. **Zerlegen**, Auswahl, 3 Punkte. Im zerlegten Getränkeautomaten soll der Saft 2.20 Euro kosten. Wo änderst du etwas? [x] Nur in `preis_von` · Nur im Hauptprogramm · In `preis_von` und im Hauptprogramm · In `antwort`. Erklärung: Der Preis steht nur in `preis_von`. Das Hauptprogramm und `antwort` bekommen ihn als Wert und bleiben, wie sie sind. (Der Wertebereich von `randint` steht als Vorhersage in Abschnitt 3 und in den Grenzfällen der Stationen 6 und 7, darum keine zweite Frage dazu.)
6. **Tipp bewerten**, Ausgabe, 3 Punkte, Antwort `Zu groß`.
   ```python
   def hinweis(geraten, geheim):
       if geraten < geheim:
           return "Zu klein"
       elif geraten > geheim:
           return "Zu groß"
       else:
           return "Richtig!"

   print(hinweis(40, 25))
   ```
   Erklärung: 40 ist größer als 25, also kommt der zweite Zweig: `Zu groß`.

## F. Labor Teil A (7 Stationen, auf der Seite 42 Minuten: 5 + 5 + 4 + 8 + 6 + 6 + 8; im Termin läuft Station 3 nicht einzeln)

**1 · Werkzeugkasten (5 Min; Karte 2 zeigt der Dozent in Block 2, Karte 1 in Block 3 am Beamer, der Rest ist zu Hause nachzulesen; wie in Termin 07 und 08 zählt er nicht zur Hausaufgabe).** Zwei Karten, Video „Python-Werkzeugkasten“. Alles aus Termin 02 bis 08 gilt weiter. Die Karten folgen dem Termin: Karte 1 gehört zu Block 3, Karte 2 zu Block 2.
- Karte 1 „random: Zufallszahl“
  ```python
  import random

  zahl = random.randint(1, 100)
  print(zahl)
  ```
  Ausgabe: eine Zahl von 1 bis 100, bei jedem Lauf eine andere. `import random` steht oben, `random.randint(1, 100)` zieht die Zahl, beide Grenzen gehören dazu. Wer ohne `import` arbeitet, bekommt `NameError: name 'random' is not defined`.
- Karte 2 „Programm in Funktionen“
  ```python
  def frage(text):
      return int(input(text))

  def melde(x):
      print(f"Ergebnis: {x}")

  a = frage("Erste Zahl: ")
  b = frage("Zweite Zahl: ")
  melde(a + b)
  ```
  Eingabe 3 und 4 ergibt `Ergebnis: 7`. Funktionen oben, Hauptprogramm unten. Das Hauptprogramm liest sich wie die Beschreibung.

**2 · Vorgerechnet: Getränkeautomat zerlegen (5 Min; im Termin 4 Min am Beamer, Schritt 6 nur zu Hause).** Das lange Programm aus Abschnitt 2, Art `run`, Eingabe `1` und `3`. Video „Vorgerechnet“. Schritte: (1) Aufgaben in Worten. (2) Was wird eine Funktion: Preis und Antwort, weil jeweils etwas hineingeht und etwas herauskommt. (3) Hauptplan mit den zwei Unterprogramm-Rechtecken und je ein kleiner Plan für die Funktionen (Plan der Funktion `preis_von(nr)`: Verzweigung, `preis` in jedem Zweig, Rückgabe `preis`). (4) Code: erst die Funktionen, dann das Hauptprogramm. (5) Probe mit denselben Eingaben wie vorher: Eingabe 1 und 3 ergibt `Bitte sehr. Wechselgeld: 0.50 Euro` in beiden Fassungen. (6) Selbsterklärung: Ändere den Preis der Cola in der Funktion auf 3.0 und lass es laufen. Wo musst du etwas ändern, wo nicht? (Nur in `preis_von`, nicht im Hauptprogramm.) Im Termin zeigt der Dozent Schritt 1 bis 5 am Beamer (der Plan wird nur angesehen).

**3 · Bauteile zuordnen (4 Min; im Termin nicht einzeln).** Art `trace`, `sprache: "tabelle"`, `ausgabe: false`, `typhinweis: false`. Text: „Welches Bauteil ist gemeint? Trag die Nummer ein: 1 Prozessor, 2 Arbeitsspeicher, 3 SSD, 4 Eingabe oder Ausgabe, 5 Bus.“ Sechs Zeilen (Eingabe und Ausgabe zählen als ein Bauteil, wie in Abschnitt 1), eine Spalte „Antwort“:

| Zeile | Beschreibung | Lösung |
|---|---|---|
| 1 | Rechnet und führt die Befehle eines Programms aus | 1 |
| 2 | Hält das laufende Spiel und verliert alles bei Strom aus | 2 |
| 3 | Speichert den Spielstand dauerhaft | 3 |
| 4 | Die Tastatur | 4 |
| 5 | Der Lautsprecher | 4 |
| 6 | Die Leitungen, über die die Bauteile Daten austauschen | 5 |

Hinweise: bei Zeile 2 „Was verschwindet, wenn der Strom ausfällt?“, bei Zeile 3 „Was behält seine Daten ohne Strom?“, bei Zeile 5 „Eingabe und Ausgabe haben dieselbe Nummer.“

**4 · Hauptplan zeichnen: Schere-Stein-Papier (★★, 8 Min; Block 2).** Art `pap-zeichnen`, `data-erlaubt="in,out,for,call,def"`. Die Funktion `urteil` steht schon im Editor (Startdaten), gezeichnet wird nur der Hauptplan. Text: Das Programm aus Termin 03 wird zerlegt. Gespielt werden drei Runden, 1 = Schere, 2 = Stein, 3 = Papier. Die vorgegebene Funktion `urteil(a, b)` gibt `Unentschieden`, `Ich gewinne` oder `Du gewinnst` zurück. Zeichne den Hauptplan: drei Runden, in jeder Runde zwei Eingaben, dann das Urteil holen und ausgeben. (Bewusst klein: keine Zähler, keine Verzweigung im Hauptplan, nur eine Funktion mit einer Aufgabe. Eine frühere Fassung mit `spiele_runde()` und `zeige_stand()` ist gestrichen: Zwei Zähler, verschachtelte Verzweigung und eine Funktion, die einliest, aufruft, ausgibt und zurückgibt, waren für ängstliche Anfänger in 8 Minuten zu viel und widersprachen der Regel „Eine Funktion, eine Aufgabe“. Die Fassung mit Zählern kann später als Ausbau oder Training dienen.)
Lösung: Schleife `runde` von 1 bis 3 · im Rumpf Eingabe `ich`, Eingabe `du`, Unterprogramm `text = urteil(ich, du)`, Ausgabe `text`. Erzeugter Code (Hauptprogramm, mit Python 3.13 zusammen mit `urteil` ausgeführt):
```python
for runde in range(1, 4):
    ich = int(input("Ich wähle (1 Schere, 2 Stein, 3 Papier): "))
    du = int(input("Du wählst: "))
    text = urteil(ich, du)
    print(text)
```
Die Funktion im Start (Plan mit einer Rückgabe am Ende): `urteil(a, b)` mit Verzweigungen, die `text` setzen (`a == b`: `Unentschieden`; die drei Fälle 1 gegen 3, 2 gegen 1, 3 gegen 2: `Ich gewinne`; sonst `Du gewinnst`), Rückgabe `text`.
Tests (die Zeilen, die `Unentschieden`, `Ich gewinne` oder `Du gewinnst` heißen; die Aufforderungen zählen nicht): Eingaben 1 3 2 1 3 3 ergibt `Ich gewinne`, `Ich gewinne`, `Unentschieden` · 1 2 1 2 1 2 ergibt dreimal `Du gewinnst` · 2 2 2 2 2 2 ergibt dreimal `Unentschieden` (Grenzfall) · 2 1 3 2 1 2 ergibt `Ich gewinne`, `Ich gewinne`, `Du gewinnst` (die dritte Runde entscheidet) · 2 1 3 2 3 2 ergibt dreimal `Ich gewinne`. Alle nachgerechnet. Die Tests prüfen die Ausgabe, nicht die Form des Plans (Technische Voraussetzung 3).
Tipps: (1) Was passiert in jeder Runde? (2) Die Schleife wiederholt alles dreimal: zwei Eingaben, den Aufruf von `urteil`, die Ausgabe. (3) Das Rechteck mit den Doppellinien steht in der Schleife, `urteil` ist schon da.

**5 · Ablauf verfolgen: Spielzeug-Rechner (6 Min; im Termin 5 Min; Block 4).** Art `trace`, `sprache: "plan"`, `ausgabe: false`, `typhinweis: false`. Aufgabenstellung: Zelle `A` ist 2, `B` ist 7, `C` ist 5, `D` ist 0. Du verfolgst das Programm Zeile für Zeile. Trag nach jedem Befehl den Akku, den Inhalt von `D` und den Taktzähler ein. Jeder Befehl braucht 3 Takte.
```text
LADE A
ADDIERE B
ADDIERE C
SPEICHERE D
STOPP
```
Spalten `Akku`, `D`, `Takte`. 5 Schritte, nachgerechnet: Zeile 1 `Akku` 2, `Takte` 3 · Zeile 2 `Akku` 9, `Takte` 6 · Zeile 3 `Akku` 14, `Takte` 9 · Zeile 4 `D` 14, `Takte` 12 · Zeile 5 `Takte` 15. Hinweise: bei Zeile 1 „`LADE A` kopiert den Wert von `A` in den Akku.“; bei Zeile 3 „`ADDIERE` zählt den Wert der Zelle zum Akku dazu, der Akku bleibt der Rechenplatz.“; bei Zeile 4 „`SPEICHERE` schreibt den Akku in die Zelle. Erst jetzt steht das Ergebnis im Speicher.“; bei Zeile 5 „Auch `STOPP` braucht seine drei Takte.“
Wichtig: `STOPP` setzt keinen Wert, nur den Takt (die Zeile 5 fragt nur den Takt ab).

**6 · Lücken füllen: Ein Tipp (6 Min; Block 3).** Art `gap`, `data-mode="programm"`. Der Plan steht darüber (Abschnitt 3, Hauptplan und Funktionsplan). Text: Ergänze die sechs Lücken. Dann läuft der erste Teil deines Spiels.
```text
@@import@@ random

def hinweis(geraten, geheim):
    if geraten @@<@@ geheim:
        @@return@@ "Zu klein"
    elif geraten @@>@@ geheim:
        return "Zu groß"
    else:
        return "Richtig!"

geheim = random.@@randint@@(1, 100)
geraten = int(input("Dein Tipp (1 bis 100): "))
print(@@hinweis@@(geraten, geheim))
```
Tests (Zufall auf feste Werte, Eingaben siehe Technische Voraussetzung 2; geprüft werden die Zeilen `Zu klein`, `Zu groß`, `Richtig!`): `geheim` 42 und Tipp 30 ergibt `Zu klein` · 42 und 77 ergibt `Zu groß` · 42 und 42 ergibt `Richtig!` · 1 und 1 ergibt `Richtig!` (Grenzfall) · 100 und 1 ergibt `Zu klein`, 1 und 100 ergibt `Zu groß` (Grenzfälle, der letzte Wert wechselt die Richtung). Dazu prüft jeder Lauf `aufrufe == [(1, 100)]` (Meldung wie Festlegung 8; die Lücken lassen nur ein `randint` zu, die Prüfung gilt aber für alle Aufgaben mit Zufall). Alle nachgerechnet.
Tipps (die Nummern folgen den Lücken im Code: 1 `import`, 2 `<`, 3 `return`, 4 `>`, 5 `randint`, 6 `hinweis`): (1) Lücke 1 und 5: Welches Wort holt `random`? Wie heißt die Funktion, die eine ganze Zahl zieht? (2) Lücke 2 und 4: Wann ist der Tipp zu klein, wann zu groß? (3) Lücke 3 und 6: Eine Funktion gibt ihr Ergebnis mit `return` zurück. Am Ende ruft das Hauptprogramm die Funktion `hinweis` auf und zeigt, was sie zurückgibt. Karte 1.

**7 · Erste eigene Aufgabe: Würfelraten (★★, 8 Min; Block 3).** Art `code`, Klausurform „Plan in Code übertragen“ mit Ausführen. Text: Der Rechner würfelt, du tippst eine Zahl von 1 bis 6. Eine Funktion `bewerte(tipp, wurf)` gibt `Treffer` zurück, wenn der Tipp stimmt, sonst `Leider nein, es war 4` mit der gewürfelten Zahl. Das Hauptprogramm würfelt mit `random.randint(1, 6)`, liest den Tipp ein und gibt den Text aus. (Der Name `bewerte` ist bewusst nicht `urteil`: So heißt die Funktion in Station 4.) Plan:
```text
wurf = random.randint(1, 6)
Eingabe: tipp
Unterprogramm: text = bewerte(tipp, wurf)
Ausgabe: text
```
```text
Funktion: bewerte(tipp, wurf)
Entscheidung: tipp == wurf?
  ja:
    text = "Treffer"
  nein:
    text = "Leider nein, es war " + str(wurf)
Rückgabe: text
```
Lösung (folgt dem Plan Zeile für Zeile, mit Python 3.13 nachgerechnet):
```python
import random

def bewerte(tipp, wurf):
    if tipp == wurf:
        text = "Treffer"
    else:
        text = "Leider nein, es war " + str(wurf)
    return text

wurf = random.randint(1, 6)
tipp = int(input("Dein Tipp (1 bis 6): "))
text = bewerte(tipp, wurf)
print(text)
```
Ebenfalls richtig und von den Tests angenommen: `return` direkt in den Zweigen und `f"Leider nein, es war {wurf}"` (Termin 08). Tests (Zufall auf feste Werte; die letzte Zeile zählt): Wurf 4 und Tipp 4 ergibt `Treffer` · Wurf 4 und Tipp 2 ergibt `Leider nein, es war 4` · Wurf 1 und Tipp 1 ergibt `Treffer` (Grenzfall) · Wurf 6 und Tipp 5 ergibt `Leider nein, es war 6` (Grenzfall, der letzte Wert ändert das Ergebnis) · `randint` wird genau einmal mit `(1, 6)` aufgerufen. Die Aufgabe nimmt die Zeile `import random` nicht ab: Fehlt sie, meldet Python `NameError: name 'random' is not defined` (nur lesen, „hier fehlt ein `import`“). Fallen auf: `randint(0, 6)` (Grenze), `print` statt `return` in der Funktion (`None` in der Ausgabe), `random.randint(1, 6)` in der Funktion statt im Hauptprogramm (die Tests lassen es zu, solange es einmal vorkommt).
Tipps: (1) Zeichne den Plan zuerst: Was geht in `bewerte` hinein, was kommt heraus? (2) `import random` ist die erste Zeile, die Funktion steht davor, wo sie benutzt wird. (3) Karte 1 und Station 6: Du hast das fast genauso schon geschrieben.

## G. Labor Teil B (Training, 4 Aufgaben, 30 Minuten) und Knobelaufgabe

Zu Hause zusammen **42 Minuten**: Bauteile zuordnen (4), Vorgerechnet Schritt 6 (1), Selbstcheck (7), Training (30). Der Werkzeugkasten zählt wie in Termin 07 und 08 nicht mit (die Karten laufen im Termin am Beamer). Termin 07 und 08 haben 47, weil dort zwei Stationen zu Hause liegen, Termin 09 nur eine.

1. **Spielzeug-Rechner von Hand** (★, 6 Min, `trace` als Tabelle, `sprache: "tabelle"`, 6 Zeilen, eine Spalte „Antwort“, `ausgabe: false`, `typhinweis: false`). **Diese Aufgabe ist das Warm-up von Termin 10.** Erst auf Papier, dann hier prüfen. Text: „Zelle A ist 6, B ist 1, C ist 9, D ist 0. Das Programm: LADE C, SPEICHERE D, LADE A, ADDIERE D, SPEICHERE A, STOPP. Trag die Zahl ein, ohne Leerzeichen. Jeder Befehl braucht 3 Takte.“ Nachgerechnet:

   | Zeile | Frage | Lösung |
   |---|---|---|
   | 1 | Was steht nach dem 1. Befehl im Akku? | 9 |
   | 2 | Was steht nach dem 2. Befehl in D? | 9 |
   | 3 | Was steht nach dem 3. Befehl im Akku? | 6 |
   | 4 | Was steht nach dem 4. Befehl im Akku? | 15 |
   | 5 | Was steht am Ende in A? | 15 |
   | 6 | Wie viele Takte braucht das ganze Programm? | 18 |

   Hinweis bei den Zeilen 1 bis 4: „Geh Befehl für Befehl. `LADE` überschreibt den Akku, `ADDIERE` zählt dazu.“
2. **Plan in Code übertragen: Medaille** (★★, 8 Min, `klausur`). Text: Eingelesen werden die Punkte (ganze Zahl). Eine Funktion `medaille(punkte)` gibt `Gold` ab 90 Punkten zurück, `Silber` ab 70, `Bronze` ab 50, sonst `keine`. Ausgegeben wird `Medaille: Gold`. Plan:
   ```text
   Eingabe: punkte
   Unterprogramm: m = medaille(punkte)
   Ausgabe: "Medaille:", m
   ```
   ```text
   Funktion: medaille(punkte)
   Entscheidung: punkte >= 90?
     ja: name = "Gold"
     nein:
       Entscheidung: punkte >= 70?
         ja: name = "Silber"
         nein:
           Entscheidung: punkte >= 50?
             ja: name = "Bronze"
             nein: name = "keine"
   Rückgabe: name
   ```
   ```python
   def medaille(punkte):
       if punkte >= 90:
           name = "Gold"
       elif punkte >= 70:
           name = "Silber"
       elif punkte >= 50:
           name = "Bronze"
       else:
           name = "keine"
       return name

   punkte = int(input("Punkte: "))
   m = medaille(punkte)
   print(f"Medaille: {m}")
   ```
   Tests (letzte Zeile, nachgerechnet): 95 ergibt `Medaille: Gold` · 90 ergibt `Medaille: Gold` (Grenzfall) · 89 ergibt `Medaille: Silber` · 70 ergibt `Medaille: Silber` (Grenzfall) · 69 ergibt `Medaille: Bronze` · 50 ergibt `Medaille: Bronze` (Grenzfall) · 49 ergibt `Medaille: keine` · 0 ergibt `Medaille: keine` (Grenzfall). Schema (je 1 Punkt): `def medaille(punkte):` mit Doppelpunkt · die Funktion steht vor dem Hauptprogramm · `return` mit dem Namen · Aufruf `medaille(punkte)` im Hauptprogramm. Tipps: (1) Lies zuerst den Plan der Funktion: Was kommt hinein, was heraus? (2) Die Zweige setzen `name`, am Ende gibt die Funktion `name` zurück. (3) Fängt der Plan mit der größten Grenze an, bleibt die Reihenfolge der Zweige so.
3. **Fehler finden: Ein Tipp** (★★, 8 Min, `code`). Zwei Fehler: einer, den Python meldet, einer, den du nur an der Ausgabe findest. Probier die Eingabe 30. Die Funktion `hinweis` soll den Text zurückgeben, nicht selbst anzeigen (so braucht ihn Termin 10).
   Vorlage:
   ```python
   # Ein Tipp beim Zahlenraten.
   def hinweis(geraten, geheim):
       if geraten < geheim:
           print("Zu klein")
       elif geraten > geheim:
           print("Zu groß")
       else:
           print("Richtig!")

   geheim = random.randint(1, 100)
   geraten = int(input("Dein Tipp (1 bis 100): "))
   print(hinweis(geraten, geheim))
   ```
   Lösung: Python meldet `NameError: name 'random' is not defined` (nachgerechnet): Es fehlt `import random` als erste Zeile. Danach zeigt der Lauf mit dem festen Wert 42 und dem Tipp 30 die Zeilen `Zu klein` und `None`: Die Funktion zeigt den Text an, gibt aber nichts zurück, deshalb gibt das äußere `print` `None` aus. Behoben wird es mit `return` statt `print` in der Funktion; das ist die Fassung, die Termin 10 braucht (`print(hinweis(geraten, geheim))`). Das äußere `print(…)` durch den bloßen Aufruf zu ersetzen gibt dieselbe Ausgabe, aber dann gibt `hinweis` nichts zurück. Die Tests prüfen nur die Ausgabe und sehen die Form der Funktion nicht; sie lassen beide Fassungen durch (nachgerechnet: gleiche Zeilen). Darum steht die Forderung im Aufgabentext, und die Auflösung sagt: „Für das Spiel in Termin 10 muss `hinweis` den Text zurückgeben.“ Tests (Zufall fest, Zeilen `Zu klein`, `Zu groß`, `Richtig!`, `None` dürfen nicht erscheinen): 42 und Tipp 30 ergibt `Zu klein` · 42 und 77 ergibt `Zu groß` · 42 und 42 ergibt `Richtig!` · 1 und 100 ergibt `Zu groß` (Grenzfall); dazu `aufrufe == [(1, 100)]` (Meldung wie Festlegung 8). Tipps: (1) Führ das Programm aus und lies die Meldung von unten: Welcher Name ist unbekannt? (2) Läuft es, schau auf die Ausgabe: Was steht außer dem Hinweis noch da? (3) Abschnitt 3 und Station 6: Wie bekommt die Funktion ihr Ergebnis nach außen?
4. **Programm zerlegen: Einkauf** (★★★, 8 Min, `klausur` mit `tr-4.scheme.json` und `data-minutes="8"`, wie `tr-2`; erst Plan auf Papier). Text: Das Programm unten rechnet einen Rabatt nach dem Einkaufsbetrag (ab 100 Euro 10 Prozent, ab 50 Euro 5 Prozent, sonst nichts) und fügt 10 Prozent Trinkgeld hinzu. Zerlege es: Eine Funktion `rabatt_satz(betrag)` gibt den Satz zurück (10, 5 oder 0). Die Ausgabe bleibt dieselbe.
   Vorlage:
   ```python
   # Einkauf: Rabatt nach Betrag, danach Trinkgeld.
   betrag = float(input("Einkauf in Euro: "))
   if betrag >= 100:
       satz = 10
   elif betrag >= 50:
       satz = 5
   else:
       satz = 0
   nach_rabatt = betrag - betrag * satz / 100
   trinkgeld = nach_rabatt * 0.1
   gesamt = nach_rabatt + trinkgeld
   print(f"Rabatt: {satz} Prozent")
   print(f"Gesamt mit Trinkgeld: {gesamt:.2f} Euro")
   ```
   Musterlösung:
   ```python
   def rabatt_satz(betrag):
       if betrag >= 100:
           return 10
       elif betrag >= 50:
           return 5
       else:
           return 0

   betrag = float(input("Einkauf in Euro: "))
   satz = rabatt_satz(betrag)
   nach_rabatt = betrag - betrag * satz / 100
   trinkgeld = nach_rabatt * 0.1
   gesamt = nach_rabatt + trinkgeld
   print(f"Rabatt: {satz} Prozent")
   print(f"Gesamt mit Trinkgeld: {gesamt:.2f} Euro")
   ```
   Tests (die letzten zwei Zeilen, Zahlen mit Toleranz 0,005, nachgerechnet; kein Wert hat eine 5 an der Rundungsstelle): 120 ergibt `Rabatt: 10 Prozent`, `Gesamt mit Trinkgeld: 118.80 Euro` · 100 ergibt 10 Prozent, 99.00 Euro (Grenzfall) · 80 ergibt 5 Prozent, 83.60 Euro · 50 ergibt 5 Prozent, 52.25 Euro (Grenzfall; 52.25 hat genau zwei Nachkommastellen) · 49.9 ergibt 0 Prozent, 54.89 Euro (Grenzfall unten) · 0 ergibt 0 Prozent, 0.00 Euro (Grenzfall) · 60 ergibt 5 Prozent, 62.70 Euro. Die Tests prüfen nur die Ausgabe: Die unveränderte Vorlage gibt bei allen sieben Tests genau die Sollausgabe aus (selbst ausgeführt: 118.80, 99.00, 83.60, 52.25, 54.89, 0.00, 62.70), und `run_program` gibt den Namensraum des Studierendencodes nicht zurück, die Form lässt sich also nicht testen. Darum Schema zur Selbstbewertung (je 1 Punkt), das nur der Klausur-Modus auswertet (`initKlausur`, `aufgaben.js:720` ff.), nicht die Art `code`: `def rabatt_satz(betrag):` mit Doppelpunkt, vor dem Hauptprogramm · die Funktion gibt den Satz mit `return` zurück und zeigt nichts an · das Hauptprogramm ruft sie mit `rabatt_satz(betrag)` auf · die Zweige mit `if`, `elif`, `else` stehen nicht mehr im Hauptprogramm. Tipps: (1) Was geht hinein, was kommt heraus? (2) Die drei Zweige wandern in die Funktion, dort setzen sie nicht `satz`, sondern geben Zahlen zurück. (3) Im Hauptprogramm bleibt `satz = rabatt_satz(betrag)`. Alternative ohne Schema (Art `code`): Die Vorlage ruft schon `satz = rabatt_satz(betrag)` im Hauptprogramm auf und lässt die Funktion samt den drei Zweigen weg; sie scheitert mit `NameError`, bis `rabatt_satz` geschrieben ist.

**Knobelaufgabe (freiwillig, zählt nicht im Fortschritt).** Nur Stoff bis Termin 08. Ausgearbeitet und nachgerechnet.

- **`kn-1` · „Hoch ohne Mal“** (`k-1`, `code`, `data-mode="programm"`, `data-inputs="2|10"` (die Eingaben stehen mit `|` getrennt, `aufgaben.js:503`)). Passend zum Spielzeug-Rechner, der nur addieren kann.
  Text: Der Spielzeug-Rechner kennt nur `ADDIERE`. Wie weit kommst du in Python, wenn du nur `+` benutzt? Eingelesen werden eine Zahl `a` und ein Exponent `b` (ganze Zahlen, `a` höchstens 10, `b` höchstens 5). Eine Funktion `hoch(a, b)` gibt `a` hoch `b` zurück, **ohne `*` und ohne `**`** (das Wort „hoch“ kennst du aus Termin 07). Ausgegeben wird `2 hoch 10 ist 1024`.
  Vorlage:
  ```python
  # a hoch b, nur mit Plus.
  # Die Funktion hoch(a, b) schreibst du.
  a = int(input("Zahl: "))
  b = int(input("Hoch: "))
  print(f"{a} hoch {b} ist {hoch(a, b)}")
  ```
  Musterlösung (mit Python 3.13 nachgerechnet):
  ```python
  def hoch(a, b):
      ergebnis = 1
      for i in range(b):
          neu = 0
          for j in range(a):
              neu = neu + ergebnis
          ergebnis = neu
      return ergebnis

  a = int(input("Zahl: "))
  b = int(input("Hoch: "))
  print(f"{a} hoch {b} ist {hoch(a, b)}")
  ```
  Tests (letzte Zahl der Ausgabe): 2 und 10 ergibt 1024 · 3 und 4 ergibt 81 · 5 und 0 ergibt 1 (Grenzfall) · 0 und 3 ergibt 0 (Grenzfall) · 7 und 1 ergibt 7 · 10 und 3 ergibt 1000 · 9 und 5 ergibt 59049 (der letzte Wert ändert das Ergebnis). Höchstens 45 Durchläufe der inneren Schleife, weit unter der Zeilengrenze (Technische Voraussetzung 7). Die Tests können `*` nicht verbieten, sie prüfen nur die Ergebnisse.
  Tipps: (1) Mit `+` baust du ein Mal: `a` mal `x` ist `x` einmal `a`-mal addiert. (2) Das Hoch ist ein Mal, das `b`-mal wiederholt wird. (3) Zwei Schleifen ineinander, die innere hängt von `a` ab, die äußere von `b`. `ergebnis` fängt bei 1 an.
  Für die Auflösung (nicht getestet): Genau so addiert der Spielzeug-Rechner: Ein echter Prozessor hat zusätzlich einen Befehl für das Malnehmen.

## H. Videos (je etwa 2 bis 2,5 Minuten; hier nur der Inhalt, kein Sprechertext)

**Theorie (Lerneinheit, Abschnitt 1 und 4): „Was im Rechner arbeitet“.** Ein Spiel startet: von der SSD in den Arbeitsspeicher, der Prozessor arbeitet es ab, die Eingabe schickt eine Taste, die Ausgabe zeigt das Ergebnis, der Bus ist die Leitung dazwischen. Strom aus: Der Arbeitsspeicher wird leer, die SSD bleibt. Dann der Dreischritt (holen, entschlüsseln, ausführen) mit dem Takt als Uhr.

**Python-Werkzeugkasten (Labor, Station 1): „random und Programme gliedern“.** Karte 1 zeigt `random.randint(1, 100)` und die Meldung ohne `import`; Karte 2 zeigt `frage`, `melde` und das Hauptprogramm.

**Vorgerechnet (Labor, Station 2): „Getränkeautomat zerlegen“.** Das lange Programm, die Aufgaben in Worten, die zwei Funktionen mit ihren Plänen, der Hauptplan mit zwei Unterprogramm-Rechtecken, der Lauf mit Eingabe 1 und 3 in beiden Fassungen, am Ende der Preis der Cola in der Funktion geändert.

Abschnitt 2 bis 4 haben sonst kein eigenes Video. Sie leben von den Bausteinen und von „Schritt für Schritt“. Die Videos werden erst geplant, dann erzeugt (Sprechertext zuerst, Vertonung später).

## I. Ablaufplan für den Dozenten

Jeder 30-Minuten-Block verplant höchstens 28 Minuten, der letzte höchstens 24. Hier im Zuschnitt mit der Pause; in der App laufen die Minuten wie in Termin 05 ohne sie durch (0–10, 10–40, 40–70, 70–100, 100–125, Titel „Ablauf des Termins (125 Minuten)“), und die Pause wird nicht erwähnt.

| Minuten | Wo | Was |
|---|---|---|
| 0–10 | Papier, Beamer | **Warm-up.** Training 08, Aufgabe 1 „Typen und Umwandlung“ auf Papier (5), Auflösung (2). Brücke: Wo steht das Programm, während es läuft, und welche Bauteile arbeiten, bis `print` das Ergebnis zeigt? (3) |
| 10–40 | Lerneinheit 1 | **Theorie: Bauteile.** Das Bild und die fünf Bauteile (8). Baustein „Rechner-Baukasten“ mit der Vermutung „Strom aus“, vor der Auflösung (9). „Bleiben oder verschwinden“, Weg eines Programms und Bus (6). Verbindung zur Hausaufgabe (Station 3, 2). Keine eigene Vorhersage. Verplant: 25. |
| 40–70 | Lerneinheit 2, Labor 1 (Karte 2), 2, 4 | **Programmieren 1: zerlegen.** Das lange Programm, Aufgaben in Worten (3). Vorhersage „Wie lang bleibt das Hauptprogramm?“ (2). Zerlegen am Beamer, Vorgerechnet Schritt 1 bis 5 (4). Baustein „Programm zerlegen“ mit Vermutung (5). Hauptplan mit Unterprogrammen lesen, Karte 2, „Schritt für Schritt“ (4). Alle zeichnen den Hauptplan „Schere-Stein-Papier“ (8). Verplant: 26. |
| 70–80 | – | **Pause** (nur im Zuschnitt). |
| 80–110 | Lerneinheit 3, Labor 1 (Karte 1), 6, 7 | **Programmieren 2: Zahlenraten, Stufe 1.** Das Spiel zeigen, einmal spielen (3). Vorhersage „Welche Zahlen sind möglich?“ (3). Karte 1 mit Auflösung, Grenzen gehören dazu (3). Der Plan, einmal am Beamer gelesen (2). Lückencode „Ein Tipp“ (6). Läufe und Grenzfälle am Beamer (2). „Würfelraten“ als Plan in Code (8). Verplant: 27. |
| 110–135 | Lerneinheit 4, Labor 5 | **Theorie: der Befehl im Prozessor.** Dreischritt und Takt (5). Spielzeug-Rechner vorgestellt, Beispielprogramm (4). Baustein „Spielzeug-Rechner“ mit Vermutung (7). Ablauf verfolgen, Station 5 (5). Brücke zu Python (1). Auftrag für zu Hause, Pflicht, zusammen 42 Minuten (2). Termin 10 beginnt mit Training 1 „Spielzeug-Rechner von Hand“ auf Papier. Verplant: 24. |

Wenn die Zeit knapp wird: Im Block 10–40 ist Luft (5 Minuten); bei Zeitnot zeigt der Baustein „Rechner-Baukasten“ nur „Strom aus“ und „Spielstand speichern“ (3 Minuten gespart). Im Block 40–70 entfällt zuerst die Vorhersage (sie steht in der Lerneinheit), dann läuft der Baustein „Programm zerlegen“ als Vorführung des Dozenten (2 statt 5 Minuten), dann wird das Vorgerechnete auf Schritt 1, 2 und 5 verkürzt. Station 4 (Hauptplan zeichnen) bleibt im Termin, notfalls zu zweit gezeichnet: Sie ist die einzige Aufgabe zur Klausurform „Plan zeichnen“ in diesem Termin. Im Block 80–110 hat „Würfelraten“ Vorrang vor dem Lückencode, weil es die Klausurform „Plan in Code übertragen“ ist; der Lückencode läuft dann gemeinsam am Beamer. Im letzten Block entfällt zuerst die Brücke zu Python, dann wird Station 5 zu Hause gemacht (die Hausaufgabe wächst dann auf 47 Minuten, das wird ausdrücklich gesagt).

Die drei Klausurformen im Termin: Plan zeichnen (Station 4), Plan in Code übertragen (Station 7), Code lesen (Vorhersagen in jedem Block, Station 5, Station 6). Zu Hause dazu: Plan in Code im Klausurmodus (Training 2), Fehler finden (Training 3), Zerlegen selbst (Training 4).

---

# Bewusst weggelassen

**Rechneraufbau**
- Grafikkarte, Mainboard, Netzteil, Betriebssystem, Kerne und Threads, Cache und Register (Cache und Register als Stufen des Speichers kommen in Termin 10), Adress-, Daten- und Steuerbus getrennt, Pipeline, Befehlssätze, Maschinencode in Bits, Assembler (nur mündlich, wenn jemand fragt), „von-Neumann-Architektur“ (nur mündlich).
- Taktfrequenz-Rechnungen mit Kernen oder Vergleich zwischen Geräten: nur der Satz „3 GHz sind 3 Milliarden Takte pro Sekunde“ und der Taktzähler im Baustein; keine Nanosekunden.
- Spielzeug-Rechner: Sprung, Bedingung, Eingabe, Programm und Daten im selben Speicher, mehr als vier Befehle, mehr als vier Zellen, Zwischenspeicher für Rechenergebnisse außer dem Akku.

**Funktionen und Zerlegen**
- Funktionen mit mehr als zwei Parametern, Standardwerte (auch in Termin 10 nicht), eine `main()`-Funktion (Termin 10 gliedert mit `spiel()`, ohne Parameter), mehrere Dateien oder Module, Rekursion, Dokumentation unter `def`.
- Das `return` in einer Verzweigung im Plan-Editor zeichnen: Frage 1. Im Code ist es erlaubt, nur der Plan nutzt eine Rückgabe am Ende.
- Zerlegen als Regel, wann eine Funktion „zu groß“ ist, Namenskonventionen über „klein, ohne Umlaute, mit Unterstrich“ hinaus: nicht jetzt.

**Zufall und Zahlenraten**
- `random()`, `choice`, `randrange`, `seed`, Pseudozufall und warum die Zahl „zufällig“ ist: nicht jetzt. Wer fragt, bekommt einen Satz vom Dozenten.
- Eingaben prüfen (kein Tipp außerhalb von 1 bis 100, keine Buchstaben): Ohne `try` und ohne `break` geht nur die Beschränkung durch `if`, und Stufe 1 hat sie bewusst nicht. Wer 150 tippt, bekommt `Zu groß`.
- Die Schleife („bis richtig geraten“), das Zählen der Versuche und das Gliedern in `spiel()`: Termin 10.

---

# Technische Voraussetzungen

Belegt heißt: im Code gelesen oder gerechnet. Nicht ausprobiert ist ausdrücklich gesagt. Grundlage ist die Technikprüfung vom 2026-11-27 (Dateien `site/assets/js/aufgaben.js`, `pap-engine.js`, `pap-editor.js`) und die Zuschnitte der Termine 06 und 07.

1. **Dateinamen `explorables-v09.js` und `v09.css` sind alt belegt (Pflicht, ca. 1 Stunde).** `site/assets/js/explorables-v09.js` (467 Zeilen) ist der Baukasten der alten V09 „Dateien & Fehler“ (Textkodierung, CSV-Zeile, `try/except`, Datei lesen). `site/assets/css/v09.css` (74 Zeilen) trägt die `.v09-…`-Regeln dazu. Keine Seite unter `app/inhalte`, `app/src`, `app/skripte` und `docs` lädt eine der beiden Dateien (gesucht, keine Treffer; ein Test `explorables-v09.test.mjs` gibt es nicht). Vorschlag wie bei V05: beide Dateien durch die neuen ersetzen (altes Material darf weg). Ebenso belegt: `video-src/v09-beispiel`, `v09-python`, `v09-theorie`, `v09-common` und `site/assets/video/v09-theorie.mp4` mit Poster und Untertitel (alte V09). Sie werden mit dem Video-Plan ersetzt, nicht jetzt.
2. **Zufall in den Tests (Pflicht, ca. 3 Stunden mit Hilfsfunktion und Test).** `run_program` (`aufgaben.js:298`) setzt keinen Startwert; nur beim Knopf „Ausführen“ ruft `_run_user` `random.seed(int(term))` auf (`:221–222`). Die Tests ersetzen deshalb `random.randint` für die Dauer des Laufs. Der Studierendencode macht `import random` im selben Python, sein Aufruf `random.randint(…)` trifft die ersetzte Funktion (nachgebildet und mit Python 3.13 ausgeführt, auch für `from random import randint`, das die ersetzte Funktion beim Import übernimmt). Hilfsfunktion für alle Zahlenraten-Tests (in jeder `.tests.py`, bis es eine gemeinsame Datei gibt):
   ```python
   import random

   def mit_zufall(werte, eingaben):
       """Lässt random.randint nacheinander die Werte liefern (der letzte gilt weiter) und merkt sich die Aufrufe."""
       aufrufe = []
       echt = random.randint
       def fest(a, b):
           aufrufe.append((a, b))
           return werte[min(len(aufrufe), len(werte)) - 1]
       random.randint = fest
       try:
           text = run_program([str(e) for e in eingaben])
       finally:
           random.randint = echt
       return zeilen(text), aufrufe
   ```
   Die Tests lesen aus `zeilen` nur die Hinweiszeilen (`Zu klein`, `Zu groß`, `Richtig!`) und prüfen `aufrufe == [(1, 100)]` mit einer einzigen Meldung für jeden Verstoß: „Zieh die Zahl genau einmal mit `random.randint(1, 100)`.“ (auch wenn `aufrufe` leer bleibt, weil jemand `random.randrange`, `choice` oder `random.random` benutzt, und auch bei `from random import randint`, das die ersetzte Funktion übernimmt). Wichtig: Bei einem einzigen Wert (so rufen alle Tests in Termin 09 `mit_zufall` auf, zum Beispiel `[42]`) liefert jeder weitere Aufruf wieder diesen Wert, das Spiel verhält sich gleich, und die Ausgabe zeigt nichts (nachgerechnet: Tipps 30 und 42 mit dem Wert 42 ergeben `Zu klein`, `Richtig!`, aber zwei Aufrufe). Den Fehler findet allein die Prüfung der Aufrufe; sie gehört deshalb in jede Aufgabe mit Zufall (Station 6 und 7, Training 3, in Termin 10 Station 2 bis 5). Mehrere Werte gibt es nur dort, wo Termin 10 den Fehler sichtbar machen will (Zufallszahl in der Schleife, zwei Spiele hintereinander); dann bekommt jeder Aufruf den nächsten Wert. Nicht im Browser ausprobiert.
3. **Plan-Editor (nur Aufgaben, kein neuer Ausbau gegenüber Termin 07; Pflicht ca. 3 Stunden Prüfung).** Station 4 braucht einen Hauptplan mit Schleife, zwei Eingaben, einem Unterprogramm-Aufruf und einer Ausgabe sowie einen **vorgegebenen Funktionsblock** in den Startdaten (`w-hauptplan.start.json`, ein Knoten `k: 'def'` mit Kopf, Rumpf und `ret`, wie in `w-funktionsplan.start.json` von Termin 07, dort stand der Hauptplan vorgegeben). Zu prüfen (nicht ausprobiert): (a) dass vorgegebene `def`-Blöcke den Code vor das Hauptprogramm setzen und der Student sie nicht aus Versehen verändert (Hilfe: ein Hinweis „Die Funktionen sind vorgegeben“ über dem Editor; eine Sperre ist nicht nötig); (b) dass `data-erlaubt="in,out,for,call,def"` die Symbole des Hauptplans freigibt. Test in `app/skripte/tests/pap-engine.test.mjs`: der erzeugte Code der Lösung von Station 4 mit der Funktion `urteil` läuft mit Python 3.13 und ergibt die Ausgaben aus Abschnitt F. Der Hauptplan der Lerneinheit und die Pläne der Funktionen (`<Plan>` mit `Funktion:` und `Rückgabe:`) gelten wie in Termin 07 (Technische Voraussetzung 2 dort).
4. **Bausteine `bauteile`, `zerlegen`, `spielzeug` (zusammen ca. 2,5 Tage).** `bauteile` etwa 1 Tag: SVG-Schema mit fünf Kästen und einer Busleitung, sechs Szenarien als Daten (welche Kästen, welcher Satz, welche Inhalte der zwei Speicher); der Rechenkern (`strom_aus(zustand)`, `speichern(zustand)`) ohne DOM. `zerlegen` etwa 0,5 Tag: zwei Programmtexte als Daten, der Rechenkern in JavaScript gibt für 3 mal 11 Eingaben dieselben Texte wie Python: Geld nur in halben Euro (0 bis 5), dann sind alle Zwischenwerte genau darstellbar und `toFixed(2)` stimmt mit `:.2f` überein (nachgerechnet für die drei Beispiele aus Abschnitt 2 und für alle 33 Eingaben, 3 Getränke mal 11 Geldbeträge: beide Programme geben dasselbe aus); Zeilenzuordnung zu den drei Farben als Daten. `spielzeug` etwa 1 Tag: Zustandsautomat mit Phase (holen, entschlüsseln, ausführen), Programme und Zellen als Daten; der Rechenkern `schritt(zustand)` ist ohne DOM testbar. Test `app/skripte/tests/explorables-v09.test.mjs` nach dem Muster von `explorables-v05.test.mjs`: Beispielprogramm ergibt `C` gleich 8 nach 12 Takten, Vermutungsprogramm ergibt `B` gleich 8 und `D` gleich 16 nach 18 Takten (mit Läufen in Python 3.13 verglichen), `strom_aus` leert nur den Arbeitsspeicher.
5. **`trace` für den Spielzeug-Rechner (Station 5 und Training 1).** `sprache: "plan"` zeigt die Zeilen als „Plan“ statt „Python“ und lässt den Kopieren-Knopf weg (`aufgaben.js:928`, gelesen); die Beschriftung „Plan“ passt hier nicht. Vorschlag: ein dritter Wert `sprache: "befehle"` mit der Beschriftung „Programm“ (ca. 1 Stunde); bis dahin gilt `"plan"` mit der Ersatzbeschriftung im Aufgabentext. Die Schritte sind handgeschrieben (`cfg.steps`), kein Python-Lauf. Die Tabelle ist flach: Spalten `Akku`, `D`, `Takte`. `STOPP` setzt nur `Takte`.
6. **`kurs.yaml` (nach dem Bau, ca. 0,5 Stunden).** `lektion: V09` bei Termin 9, Eintrag V09 mit `titel` „Was im Rechner läuft: Bauteile, Befehle und dein erstes Spiel“, `kurz` „Rechneraufbau, Zufall“, `hook` „Dein Rechner zählt im Takt“, `python` laut Abschnitt A, `lerneinheit: v09-rechneraufbau-und-zufall.html`, `labor: v09-labor.html`, `aktiv: false`. Termin 08 (V08) muss vorher gebaut sein: V09 verweist im Warm-up auf das Training 08.
7. **Zeilenobergrenze.** Alle Aufgaben dieses Termins liegen weit unter `_MAX_ZEILEN = 200000` (`aufgaben.js:154–158`). Die Knobelaufgabe „Hoch ohne Mal“ braucht bei Eingabe 9 und 5 höchstens 45 Durchläufe der inneren Schleife (nachgerechnet), bei 10 und 5 höchstens 50.
8. **Meldungen und Testdaten.** Alle Meldungen aus Abschnitt C und G sind mit Python 3.13 ausgegeben: `NameError: name 'random' is not defined` (Aufruf ohne `import`), `None` in der Ausgabe (`print` statt `return`). Antworten mit Zahlen (Station 3, Training 1) werden wörtlich verglichen (`normVal`, `aufgaben.js:906`): ohne Leerzeichen eintragen. Testdaten enden nie mit einer 5 an der Rundungsstelle (Einkauf 50 ergibt 52.25: zwei Nachkommastellen, nichts zu runden).
9. **Gebaut werden danach:** `kurs.yaml` (Punkt 6), `app/inhalte/v09/lerneinheit.mdx`, `app/inhalte/v09/labor.mdx` (`zuhause="42"`) mit den Aufgaben `w-vorgemacht`, `w-bauteile`, `w-hauptplan`, `w-spielzeug`, `w-luecken`, `w-wuerfel`, `tr-1` bis `tr-4`, Knobel `k-1` (je `.vorlage.py`, `.tests.py`, `.solution.py`, Pläne und Daten als `.json`), `explorables-v09.js`, `v09.css`. Der Aufwand der Werkzeug-Punkte 2, 3, 4 und 5 liegt bei etwa 4 Tagen; der größte Posten sind die Bausteine.

---

# Entscheidungen des Dozenten (2026-11-27)

1. `return` in einem Zweig: Pläne schreiben das Ergebnis in eine Variable (`text`) und haben ein Ende; im Code darf `return` im Zweig stehen (Empfehlung).
2. Reihenfolge: Theorie Teil 1 am Anfang, Programm zerlegen und Zahlenraten Stufe 1 in der Mitte, Spielzeug-Rechner im letzten Block (Empfehlung).
3. Gleiche Namen für Parameter und Variablen im Hauptprogramm sind ab Termin 09 erlaubt (Empfehlung).
4. Spielzeug-Rechner: „Rechenplatz“ statt „Akku“ (Begriffs-Hinweis „Der Platz im Prozessor, an dem gerechnet wird“), zwei vorgegebene Programme, keine eigenen Programme im Baustein (Empfehlung).
5. Hinweistexte fest: `Zu klein`, `Zu groß`, `Richtig!` (Empfehlung).
6. `import random` und `random.randint(a, b)` (beide Grenzen gehören dazu) sind Klausurstoff im Kopf (Empfehlung).
7. Aus Termin 08: `%` ist ab Termin 08 eingeführt (Rest beim Teilen) und darf benutzt werden; `//` nicht.

# Offene Fragen an den Dozenten (beantwortet, siehe oben)

Höchstens 6. Jede Frage nennt die Empfehlung und die Alternative.

1. **Wie wird das `return` in einer Verzweigung im Plan gezeichnet?** (Dieselbe Frage wie Frage 3 im Zuschnitt 08: Eine Antwort gilt für Termin 08 bis 10.) Termin 08 bringt `return` im `if`-Zweig, der Plan-Editor (Termin 07) kennt nur eine Rückgabe am Ende der Funktion (Festlegung 6 dort). Empfehlung: Die Pläne in Termin 09 und 10 schreiben das Ergebnis in eine Variable (`text`) und geben sie am Ende zurück; im Code darf `return` in den Zweigen stehen, die Tests prüfen nur die Ausgabe. Alternative: Der Editor bekommt ein Symbol „Rückgabe“ innerhalb von Verzweigungen (ca. 1 Tag mehr im Ausbau von Termin 08), dann zeichnen die Pläne `hinweis` so, wie der Code geschrieben wird.
2. **Reihenfolge der Blöcke in Termin 09.** Empfehlung: Theorie Teil 1 am Anfang, zwei Programmierblöcke in der Mitte, Theorie Teil 2 im letzten Block (24 Minuten). So folgt das Zahlenraten direkt auf das Zerlegen. Alternative: beide Theorie-Blöcke am Anfang (10 bis 70), dann Zerlegen und Zahlenraten nach der Pause; das Zahlenraten bekäme dann nur 24 Minuten und der Spielzeug-Rechner 28.
3. **Gleiche Namen für Parameter und Variablen im Hauptprogramm ab Termin 09?** Der Zuschnitt 08 (Festlegung 5) lässt in Termin 08 „verschiedene Namen“ gelten (drei Ausnahmen zum Lesen) und erlaubt gleiche Namen ab Termin 09; beide Papiere sind darauf abgeglichen. Dieses Papier nimmt gleiche Namen fast überall (`geld`/`preis`, `geraten`/`geheim`, `tipp`/`wurf`, `betrag`, `text`), und `hinweis(geraten, geheim)` mit denselben Namen im Hauptprogramm steht in Entscheidung 7 des Konzepts. Empfehlung: so lassen. Alternative: verschiedene Namen bleiben; dann braucht es eine Liste der Umbenennungen (Abschnitt 2 `g` und `p`, `hinweis(g, z)` und im Hauptprogramm `tipp` und `zahl`, Station 4, 7, Training 2 bis 4), die auch alle Stufen in Termin 10 trifft.
4. **Spielzeug-Rechner: Wort „Akku“ und eigene Programme?** (a) Für Anfänger heißt Akku Batterie, gerade nach „Strom aus“ in Block 1. Empfehlung: „Rechenplatz“ statt „Akku“ (Begriffs-Hinweis „Der Platz im Prozessor, an dem gerechnet wird“; Spalte in Station 5 und Training 1 heißen dann `Rechenplatz`), alternativ „Ergebnisfeld“. Alternative: „Akku“ bleiben (so heißt es in Büchern) mit dem Zusatz „kein Akku wie im Handy“. (b) Eigene Programme? Empfehlung: nein, zwei vorgegebene Programme (Beispiel und Vermutungsprogramm) plus Training 1 und Station 5 auf Papier und in der Tabelle. Alternative: Auswahlfelder (Befehl und Zelle) für ein eigenes Programm mit bis zu 8 Zeilen und einem „Prüfen“-Knopf gegen einen Sollwert (ca. 0,5 Tag mehr), dazu eine Station „Bau ein Programm, das D gleich A plus B plus C berechnet“.
5. **Hinweistexte vorgeben oder frei lassen?** Das Konzept sagt „größer/kleiner“. Empfehlung: Termin 09 und 10 geben `Zu klein`, `Zu groß`, `Richtig!` vor (Tests lesen sie, wer anders schreibt, bekommt eine klare Meldung); freie Texte nur im Ausbau und im eigenen Spiel am Schluss. Alternative: „Die Zahl ist größer.“ und „Die Zahl ist kleiner.“ (eindeutig, was zu klein ist, aber längere Texte im Plan); die Tests ändern sich nur in den Zeichenketten.
6. **Was gilt in der Klausur für `random`?** Zahlenraten ist Pflicht im Kurs, die Klausur verlangt „PAP in Code übertragen“ und „Code lesen“. Empfehlung: `import random` und `random.randint(a, b)` müssen im Kopf sein (zwei Wörter, wie `range`), `randint` einschließlich der Grenzen ist Klausurstoff. Alternative: Die Klausur gibt die zwei Zeilen vor, geprüft wird nur das Lesen.
