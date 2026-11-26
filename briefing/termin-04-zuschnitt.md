# Zuschnitt Termin 04 (Entwurf zur Bestätigung)

Aufbau und Ton wie das Termin-03-Kapitel in `briefing/termin-02-03-zuschnitt.md`. Alle Tabellen, Programme, Ausgaben und Fehlermeldungen sind mit Python 3.13 nachgerechnet. Wo dieses Papier „zu bestätigen“ sagt, liegt die Entscheidung beim Dozenten (Liste am Ende).

## Aufteilung

| Einheit | Termin 04 |
|---|---|
| T2 Boolesche Logik, Teil 4 und 5 von 5 | Block 1: Text in Formel übersetzen, Tabelle mit 4 Variablen (16 Zeilen). Block 2: Gleichwertigkeit per Tabelle, De Morgan, Vorrang |
| P3 Schleifen, Teil 1 und 2 von 7 | Block 3: `while` mit Zähler (Countdown) und mit Eingabe als Ende (Summe bis 0), Plan mit Rücksprung. Block 4: Eingabe wiederholen, bis sie gültig ist (`or`, `not`), Brücke zu De Morgan. Zu bestätigen |

Beispielwelt: Theorie die Zweihandschaltung einer Presse (`briefing/v04-beispiel.py`), Programmieren Alltag (Raketenstart, Einkauf, Monat, Sparziel, Türcode, Becken), mit einer Rückkehr zur Presse im Training (Druck prüfen).

Reihenfolge: Theorie 1, Theorie 2, Pause, Programmieren 1, Programmieren 2 (zu bestätigen, Frage 1). Der Grund steht im Programm, nicht in der Didaktik: Die Eingabeprüfung in Block 4 ist De Morgan in Python (`not (a and b)` gegen `not a or not b`) und braucht die Entdeckung aus Block 2 als frischen Rückgriff. Und vor der Pause steht wie in Termin 02 kein neuer Code.

## Festlegungen für Termin 04

Es gelten alle Festlegungen aus Termin 02 und 03 (Stationsreihenfolge von Termin 01, Schreibweisen, drei gestufte Tipps, Grenzfall in jeder Aufgabe, höchstens 28 Minuten je Block verplant, Videos laufen nicht im Termin). Dazu neu:

1. **Kennung V04**, Ordner `app/inhalte/v04/`, Adressen `v04-formeln-und-schleifen.html` und `v04-labor.html`, Bausteine `explorables-v04.js` mit `v04.css`. Aufgabenkennungen wie Termin 01 bis 03. In `kurs.yaml` bekommt `termine` bei `nr: 4` den Zusatz `lektion: V04`; der Eintrag unter `lektionen` zunächst mit `aktiv: false` (Entwurf wie V03).
2. **Formeln im Text** schreiben UND, ODER, NICHT in Großbuchstaben, Variablen A bis D. Eigene Ausdrücke haben immer Klammern („Wir schreiben immer Klammern“ bleibt). Nur in Block 2 wird gelesen, was ohne Klammern gemeint ist (Vorrang).
3. **Tabelle** wie ab Termin 03: 1 und 0, Zeilen in der Reihenfolge 0000 bis 1111, Spalte „Zeile“ entfällt (Spalten A bis D).
4. **Schleifen nur mit ganzen Zahlen.** Kommazahlen in Schleifenbedingungen (Rundungsfalle bei `==` und `!=`) kommen mit Termin 07. Nur `while`; `for` kommt in Termin 05.
5. **Jede Schleifenaufgabe hat einen Grenzfall**: die Grenze selbst (Monat 12) oder die Schleife, die nie läuft (Summe gleich 0, `n = 0`, Sparziel 0).
6. **Im Plan** gibt es nur die kopfgesteuerte Schleife (Raute oben, ja nach unten durch den Rumpf, Pfeil zurück, nein weiter). Die Raute fragt, wie Python fragt: `<`, `<=`, `>`, `>=`, `!=`, `or`. Der Editor zeigt `!=` als ≠ und `or` als „oder“ (`nice()`, `pap-engine.js:374`). Die fußgesteuerte Schleife (`repeat`) kommt nicht vor.
7. **Ablauf verfolgen mit Schleife**: Zeilen kommen mehrfach vor. Jede Entscheidung der Schleifenraute ist ein eigener Schritt (True oder False, ohne Anführungszeichen); die Zeile `while …:` erscheint so oft, wie die Bedingung geprüft wird, auch das letzte Mal (False).
8. **Tests bei Eingabeschleifen** vergleichen die letzte Zeile und zählen die Meldungszeilen („Das gibt es nicht.“, „Falsch“); die Eingabeaufforderungen stehen im Testlauf als eigene Zeilen. Jede Aufgabe mit Eingabeschleife liefert genug Eingaben mit; läuft der Vorrat aus, endet das Programm mit der Meldung von `input()` („keine Eingabe mehr“), nicht in einer Endlosschleife.
9. **Wörter**: Der Rumpf ist alles, was unter `while` eingerückt steht; „Durchlauf“ ist einmal Rumpf; die Bedingung heißt „Schleifenbedingung“. „Endlosschleife“ wird eingeführt, nicht „Endlos-while“.

---

# Termin 04

## A. Kopf

- Titel: **Solange es stimmt: Formeln und Schleifen**
- Vorspann: Eine Presse fährt nur, wenn mehrere Bedingungen zugleich stimmen. Ein Programm wiederholt etwas, solange eine Bedingung stimmt. Heute übersetzt du Texte in Formeln, vergleichst Formeln mit Tabellen und lässt ein Programm zum ersten Mal im Kreis laufen.
- Lernziele:
  - eine Bedingung aus einem Text in eine Formel mit UND, ODER, NICHT übersetzen (Variablen festlegen, Klammern setzen) und die Tabelle mit vier Variablen (16 Zeilen) ausfüllen
  - an zwei Tabellen erkennen, ob zwei Ausdrücke gleichwertig sind, und wissen: NICHT bindet vor UND, UND vor ODER
  - eine `while`-Schleife als Plan mit Rücksprung zeichnen, in Python übertragen und die Ausgabe bestimmen
  - eine Eingabe so lange wiederholen, bis sie gültig ist, und die Schleifenbedingung dafür formulieren
- kurz: „Formeln, Schleifen“
- hook: „Die Presse fährt, solange alles stimmt“
- neu in Python (Feld `python` in `kurs.yaml`): `python: ["while …:", "Zähler in der Schleife", "!= (ungleich)", "not"]`. Dazu die Fehlermeldung `IndentationError: expected an indented block after 'while' statement on line 4` und die Meldung der Seite „Abgebrochen nach 8 s. Läuft da eine Endlosschleife?“. `summe = summe + preis` und `zaehler = zaehler - 1` sind Zuweisungen aus Termin 01 und stehen deshalb nicht in der Liste.

## B. Warm-up (0–10)

Training Termin 03, Aufgabe 1 „Wahrheitstabelle ausfüllen“: Y = (A ODER B) UND (NICHT C), 8 Zeilen. Alle füllen auf Papier aus (5 Minuten). Auflösung, Zeilen 000 bis 111: Hilfsspalte A ODER B: 0 0 1 1 1 1 1 1; NICHT C: 1 0 1 0 1 0 1 0; Ergebnis **0 0 1 0 1 0 1 0**. Rückblick: die vier Schritte (Variablen zählen, Zeilen hinschreiben, Hilfsspalten, Ergebnis). Frage in die Runde: Wie viele Zeilen hat die Tabelle, wenn eine vierte Aussage D dazukommt? (16.)

## C. Lerneinheit

### Abschnitt 1 · Vom Text zur Formel (T2, Teil 4 · 10–40)

Kernaussage: Aus einem Text wird in drei Schritten eine Formel, und die Tabelle dazu hat bei vier Variablen 16 Zeilen.

- Zweihandschaltung: Eine Presse fährt nur, wenn der Bediener beide Hände an den Tastern hat. Text: „Der Hub wird freigegeben, wenn beide Taster gedrückt sind, die Schutztür geschlossen ist und der Druck im zulässigen Bereich liegt.“
- Schritt 1, Variablen festlegen. Jede Variable ist ein Satz, der wahr oder falsch sein kann, und du schreibst ihn hin: A = „Taster links gedrückt“, B = „Taster rechts gedrückt“, C = „Schutztür geschlossen“, D = „Druck im Bereich“.
- Schritt 2, Wörter übersetzen. „und“ und „beide“ ergeben UND, „oder“ und „mindestens einer“ ergeben ODER, „nicht“, „kein“ und „offen“ (wenn die Variable „geschlossen“ heißt) ergeben NICHT vor der Variablen.
- Schritt 3, Klammern setzen. Was zusammengehört, kommt in eine Klammer: Freigabe F = (A UND B) UND (C UND D).
- Zwei weitere Texte im Zuruf. „Die Störlampe leuchtet, wenn die Schutztür offen ist oder der Druck nicht im Bereich liegt“ ergibt (NICHT C) ODER (NICHT D). „Die Anzeige ‚bedienbar‘ leuchtet, wenn die Schutztür zu ist und mindestens ein Taster gedrückt ist“ ergibt C UND (A ODER B). Ohne Klammer wäre `C UND A ODER B` zweideutig.
- Übung „Satz übersetzen“ (Quiz, Auswahl, zählt nicht im Fortschritt): zwei Sätze, je eine von vier Formeln wählen. Im Termin per Zuruf.
- Tabelle mit vier Variablen: Jede Variable verdoppelt die Zeilen (2, 4, 8, 16). Reihenfolge 0000 bis 1111. Regel: Die letzte Spalte (D) wechselt in jeder Zeile, C alle 2 Zeilen, B alle 4, A alle 8.
- Hilfsspalten wie in Termin 03; hier sind es zwei: A UND B und C UND D.

Ergebnisspalten von oben nach unten (Zeilen 0000 bis 1111):

| Spalte | Werte |
|---|---|
| A UND B | 0 0 0 0 · 0 0 0 0 · 0 0 0 0 · 1 1 1 1 |
| C UND D | 0 0 0 1 · 0 0 0 1 · 0 0 0 1 · 0 0 0 1 |
| F = (A UND B) UND (C UND D) | 0 0 0 0 · 0 0 0 0 · 0 0 0 0 · 0 0 0 1 |
| Y = (A UND B) ODER (C UND D) | 0 0 0 1 · 0 0 0 1 · 0 0 0 1 · 1 1 1 1 |

Die Freigabe F ist nur in einer von 16 Zeilen wahr (alle vier Aussagen stimmen). Merksatz: UND ist bei vier Aussagen noch strenger, ODER bleibt großzügig.

Vorhersage „Wie viele Einsen“: Y = (A UND B) ODER (C UND D). In wie vielen der 16 Zeilen ist Y gleich 1?

- 1
- 4
- [x] 7
- 8

Auflösung: A UND B ist in 4 Zeilen wahr (1100 bis 1111), C UND D in 4 Zeilen (0011, 0111, 1011, 1111). Die Zeile 1111 steht in beiden. 4 + 4 − 1 = 7.

Übung „Tabelle ausfüllen“ (Art `trace` als Tabelle, 16 Schritte, `ausgabe: false`, zählt nicht im Fortschritt): Y = (A UND B) ODER (C UND D), Spalten „A UND B“, „C UND D“, „Y“. Text jedes Schritts (`frage`): „Zeile A = 0, B = 0, C = 0, D = 0: Trag in alle drei Felder 0 oder 1 ein, ohne Anführungszeichen.“ Hinweis: „Erst die beiden Hilfsspalten, dann Y: ODER ist 1, wenn mindestens eine Hilfsspalte 1 ist.“ Erst auf Papier, dann hier prüfen.

### Abschnitt 2 · Gleichwertig: zwei Ausdrücke, eine Spalte (T2, Teil 5 · 40–70)

Kernaussage: Zwei Ausdrücke sind gleichwertig, wenn ihre Ergebnisspalten in jeder Zeile übereinstimmen. So findest du De Morgan, ohne ihn auswendig zu lernen.

- Zwei Techniker schreiben die Sperre der Presse auf. Hub gesperrt, wenn nicht gilt „Tür zu UND Druck im Bereich“: S1 = NICHT (C UND D). Die zweite schreibt: gesperrt, wenn die Tür offen ist ODER der Druck nicht stimmt: S2 = (NICHT C) ODER (NICHT D). Dasselbe? Nur die Tabelle entscheidet.
- Beide Spalten für die Zeilen CD = 00, 01, 10, 11:

| C | D | C UND D | S1 | NICHT C | NICHT D | S2 |
|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 1 | 1 | 1 | 1 |
| 0 | 1 | 0 | 1 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 | 0 | 1 | 1 |
| 1 | 1 | 1 | 0 | 0 | 0 | 0 |

- S1 und S2 haben dieselbe Spalte 1 1 1 0: gleichwertig.
- Dritte Schreibweise: S3 = (NICHT C) UND (NICHT D) hat die Spalte 1 0 0 0. Nicht gleichwertig: Bei offener Tür und gutem Druck bliebe die Presse frei. Dieser Fehler ist gefährlich, und nur die Tabelle zeigt ihn.
- Zweite Entdeckung, Ruhezustand „kein Taster gedrückt“, A und B die Taster: NICHT (A ODER B) und (NICHT A) UND (NICHT B) haben beide die Spalte 1 0 0 0.
- Regel von De Morgan (Begriff): Steht NICHT vor einer Klammer, darfst du die Klammer auflösen. Jede Variable bekommt ihr eigenes NICHT, aus UND wird ODER und aus ODER wird UND. Beide Fälle hast du gerade selbst gefunden. Umformen mit Rechenregeln üben wir nicht; im Zweifel baust du die Tabelle.
- Vorrang, nur zum Lesen: Ohne Klammern gilt NICHT vor UND vor ODER (wie Punkt vor Strich: UND ist das Mal, ODER das Plus). `A ODER B UND C` heißt `A ODER (B UND C)`. Eigene Ausdrücke bekommen trotzdem immer Klammern.
- Zwei Klammerungen, zwei Tabellen, zwei Ergebnisse (Zeilen 000 bis 111):

| Ausdruck | Ergebnisspalte |
|---|---|
| (A ODER B) UND C | 0 0 0 1 0 1 0 1 |
| A ODER (B UND C) | 0 0 0 1 1 1 1 1 |

  Sie unterscheiden sich in den Zeilen 100 und 110. Im Termin rechnet die linke Tischhälfte die erste, die rechte die zweite Tabelle; dann wird verglichen.

Vorhersage „Ohne Klammern“: A = 1, B = 0, C = 0. Ist `A ODER B UND C` wahr?

- [x] Ja: B UND C ist 0, dann ergibt 1 ODER 0 den Wert 1.
- Nein: A ODER B ist 1, aber C ist 0, das Ergebnis ist 0.
- Das lässt sich ohne Klammern nicht sagen.

Auflösung: UND bindet stärker, also zuerst B UND C. Wer `(A ODER B) UND C` gelesen hat, kommt auf 0. Deshalb setzen wir eigene Klammern.

### Abschnitt 3 · Wiederholen, solange: while (P3, Teil 1 · 80–110)

Kernaussage: Eine `while`-Schleife wiederholt ihren Rumpf, solange die Schleifenbedingung wahr ist. Im Plan ist es eine Raute mit einem Pfeil zurück.

- Rückgriff: `if` fragt einmal. Wie bringt man den Raketenstart dazu, 5, 4, 3, 2, 1 zu zählen? Der Ablauf muss zurückspringen: Im Plan führt ein Pfeil hinter dem Rumpf zurück vor die Raute.
- Plan: Eingabe entfällt. `zaehler = 5` · Raute `zaehler > 0?` · ja: Ausgabe zaehler, `zaehler = zaehler - 1`, Pfeil zurück zur Raute · nein: Ausgabe „Start!“.
- Die Raute fragt vor jedem Durchlauf, auch vor dem ersten. Ist sie gleich zu Beginn falsch, läuft der Rumpf nie.
- Was in der Bedingung vorkommt, muss sich im Rumpf ändern. Sonst bleibt die Bedingung für immer wahr: eine Endlosschleife.
- Einrückung: Was eingerückt unter `while` steht, wiederholt sich. `print("Start!")` ohne Einrückung läuft einmal danach.

```python
zaehler = 5
while zaehler > 0:
    print(zaehler)
    zaehler = zaehler - 1
print("Start!")
```

Ausgabe: `5`, `4`, `3`, `2`, `1`, `Start!`. Mit „Schritt für Schritt“ am Codeblock.

Zweite Art, eine Schleife zu steuern: die Eingabe selbst entscheidet (Station 2, Summe bis 0, mit `!=`).

Vorhersage „Ein Zeichen anders“: Im Programm steht versehentlich `>=` statt `>`. Was gibt es aus?

- 5, 4, 3, 2, 1, Start!
- [x] 5, 4, 3, 2, 1, 0, Start!
- 5, 4, 3, 2, 1, 0, −1, Start!
- Eine Endlosschleife

Auflösung: Bei `zaehler = 0` ist `0 >= 0` wahr, der Rumpf läuft noch einmal (Grenzfall). Danach ist `zaehler = -1`, und `-1 >= 0` ist falsch.

### Abschnitt 4 · Eingabe wiederholen, bis sie gültig ist (P3, Teil 2; T2-Brücke · 110–135)

Kernaussage: Eine Eingabe wird erneut abgefragt, solange sie ungültig ist. Die Schleifenbedingung beschreibt den Fehlerfall, und den formuliert De Morgan.

- Ein Würfel zeigt 1 bis 6. Gültig heißt: `wurf >= 1 and wurf <= 6` (A: mindestens 1, B: höchstens 6). Wiederholt wird, wenn das nicht gilt: NICHT (A UND B).
- Mit De Morgan aus Block 2: NICHT (A UND B) = (NICHT A) ODER (NICHT B), das heißt `wurf < 1 or wurf > 6`: zu klein oder zu groß.
- Die Eingabe steht zweimal: vor der Schleife (damit die Raute etwas prüfen kann) und am Ende des Rumpfs (damit sich `wurf` ändert). Dasselbe Muster wie bei der Summe bis 0.

```python
wurf = int(input("Gewürfelt (1 bis 6): "))
while wurf < 1 or wurf > 6:
    print("Das gibt es nicht.")
    wurf = int(input("Gewürfelt (1 bis 6): "))
print(f"Du hast eine {wurf} gewürfelt")
```

- Dieselbe Bedingung mit `not`: `while not (wurf >= 1 and wurf <= 6):`. Gleiches Verhalten, die Tabelle aus Block 2 ist der Beweis. Lies es als „solange nicht gültig“.
- Zwei Fallen: `and` statt `or` (`wurf < 1 and wurf > 6` ist nie wahr, die 7 käme durch). Die Eingabe im Rumpf vergessen: `wurf` ändert sich nie, die Schleife endet nie.
- Eingaben 0, 7, 3: zweimal „Das gibt es nicht.“, dann `Du hast eine 3 gewürfelt`. Grenzfälle 1 und 6 laufen ohne Meldung durch.

Vorhersage „Wie oft meckert es?“: Die Eingaben sind 0, 7, 3. Wie oft erscheint „Das gibt es nicht.“?

- 0
- 1
- [x] 2
- 3

Auflösung: 0 ist zu klein, 7 ist zu groß, 3 ist gültig. Die Schleife läuft zweimal.

## D. Interaktive Bausteine (3)

1. **`vier-schalter` – „Vier Schalter, eine Presse“** (Abschnitt 1). Einstellen: vier Schalter A bis D (Taster links, Taster rechts, Schutztür, Druck) und die Wahl eines von drei Ausdrücken: F, Y oder die Störlampe `(NICHT C) ODER (NICHT D)`. Sehen: die Lampe „Hub frei“ beziehungsweise „Stör“, die Hilfsspalten, die Tabelle mit 16 Zeilen, die aktuelle Zeile markiert. Vermutung: In wie vielen der 16 Stellungen leuchtet die Lampe bei F? (1.) Und die Störlampe? (12, denn nur bei C = 1 und D = 1 ist sie aus: 4 Zeilen.)
2. **`gleichwertig` – „Gleichwertig oder nicht?“** (Abschnitt 2). Einstellen: Auswahl eines von vier Paaren (Sperre, Ruhezustand, Falle `(NICHT C) UND (NICHT D)`, Vorrang). Sehen: beide Ausdrücke mit ihren Ergebnisspalten nebeneinander, Zeilen mit Unterschied rot markiert, darunter das Urteil „gleichwertig“ oder „nicht gleichwertig, Unterschied in Zeile 01 und 10“. Vermutung: NICHT (C UND D) gegen (NICHT C) UND (NICHT D): In wie vielen der 4 Zeilen unterscheiden sich die Spalten? (2.)
3. **`schleife` – „Die Schleife von Hand drehen“** (Abschnitt 3). Einstellen: Startwert des Zählers (0, 1, 3, 5), Vergleich (`>` oder `>=`), ein Schalter „Zähler im Rumpf verringern“ (an/aus). Sehen: der Plan mit Rücksprung, das gerade aktive Symbol leuchtet; Knöpfe „Ein Schritt“ und „Bis zum Ende“; daneben Zähler, bisherige Ausgabe und „Der Rumpf lief n-mal“. Steht der Schalter auf „aus“, stoppt der Baustein nach 20 Schritten mit „Das wäre eine Endlosschleife“, ohne dass Python läuft. Vermutung: Startwert 0 mit `>`: Wie oft läuft der Rumpf? (Nie. Es erscheint nur „Start!“.)

Abschnitt 4 nutzt „Schritt für Schritt“ am Codeblock und die Station „Lücken füllen“.

## E. Selbstcheck (6 Fragen, 20 Punkte)

1. **Text in Formel**, Auswahl, 4 Punkte. „Die Warnleuchte leuchtet, wenn die Schutztür offen ist oder der Druck nicht im Bereich liegt.“ Mit C = „Schutztür geschlossen“ und D = „Druck im Bereich“: [x] (NICHT C) ODER (NICHT D) · (NICHT C) UND (NICHT D) · NICHT (C ODER D) · C ODER D. Erklärung: „offen“ ist NICHT C, „nicht im Bereich“ ist NICHT D, dazwischen steht „oder“. NICHT (C ODER D) ist dasselbe wie (NICHT C) UND (NICHT D), das ist die Falle aus der Lerneinheit.
2. **Tabelle mit vier Variablen**, Zahl, 3 Punkte, Antwort 3. Y = (A UND B) UND (C ODER D). In wie vielen der 16 Zeilen ist Y gleich 1? Erklärung: A UND B gilt nur bei A = 1 und B = 1 (4 Zeilen: C und D laufen durch 00, 01, 10, 11). Davon ist C ODER D in 3 Zeilen wahr (nicht bei 00).
3. **Gleichwertig?**, Auswahl (mehrere richtig), 3 Punkte. Welche Paare sind gleichwertig? [x] NICHT (A UND B) und (NICHT A) ODER (NICHT B) · [x] NICHT (A ODER B) und (NICHT A) UND (NICHT B) · NICHT (A UND B) und (NICHT A) UND (NICHT B) · A ODER B und A UND B. Erklärung: Beim ersten Paar sind beide Spalten 1 1 1 0, beim zweiten beide 1 0 0 0. Das dritte Paar hat 1 1 1 0 gegen 1 0 0 0, das vierte 0 1 1 1 gegen 0 0 0 1.
4. **Vorrang**, Zahl, 3 Punkte, Antwort 1. Ohne Klammern gilt NICHT vor UND vor ODER. A = 0, B = 0, C = 1. Welchen Wert hat `A UND B ODER C`? Erklärung: A UND B ist 0, dann 0 ODER 1 ergibt 1. Mit der Klammer A UND (B ODER C) käme 0 heraus.
5. **Ausgabe bestimmen: Schleife**, Ausgabe, 4 Punkte, Antwort `9`.
   ```python
   stock = 0
   while stock < 7:
       stock = stock + 3
   print(stock)
   ```
   Erklärung: 0, 3, 6 sind kleiner als 7, der Rumpf läuft dreimal. Bei 9 ist `9 < 7` falsch, die Schleife endet, ausgegeben wird 9.
6. **Eingabe prüfen**, Auswahl (mehrere richtig), 3 Punkte. Die Eingabe `wurf` soll wiederholt werden, solange sie nicht zwischen 1 und 6 liegt. Welche Bedingungen leisten das? [x] `wurf < 1 or wurf > 6` · [x] `not (wurf >= 1 and wurf <= 6)` · `wurf < 1 and wurf > 6` · `wurf >= 1 or wurf <= 6`. Erklärung: Die ersten zwei sind gleichwertig (De Morgan). `and` ergibt nie wahr, `wurf >= 1 or wurf <= 6` ist immer wahr, also eine Endlosschleife.

## F. Labor Teil A (Stationen, auf der Seite 49 Minuten; im Termin laufen 3, 5 und 7 nicht einzeln)

**1 · Werkzeugkasten (3 Min).** Zwei Karten, Video „Python-Werkzeugkasten“. Alles aus Termin 02 und 03 gilt weiter.
- Karte 1 „while: wiederholen, solange“
  ```python
  zaehler = 3
  while zaehler > 0:
      print(zaehler)
      zaehler = zaehler - 1
  print("Start")
  ```
  Ausgabe `3`, `2`, `1`, `Start`. `while` fragt vor jedem Durchlauf. Was in der Bedingung steht, muss sich im Rumpf ändern.
- Karte 2 „!= und not: das Gegenteil“
  ```python
  preis = 0
  print(preis != 0)
  print(not (preis >= 1 and preis <= 6))
  ```
  Ausgabe `False`, `True`. `!=` heißt ungleich. `not` dreht wahr und falsch um; die Klammer sagt, was umgedreht wird.

**2 · Vorgerechnetes Beispiel: Einkauf zusammenrechnen (5 Min).** Aufgabe: Eingelesen werden Preise in ganzen Euro, so lange bis die Eingabe 0 kommt. Ausgegeben wird die Summe. Video „Vorgerechnet“. Art `run`, Eingaben `12`, `8`, `5`, `0`.

```text
Eingabe: preis
summe = 0
Schleife: preis != 0?
  ja:
    summe = summe + preis
    Eingabe: preis
Ausgabe: summe
```

```python
preis = int(input("Preis in Euro (0 = fertig): "))
summe = 0
while preis != 0:
    summe = summe + preis
    preis = int(input("Preis in Euro (0 = fertig): "))
print(f"Summe: {summe} Euro")
```

Eingaben 12, 8, 5, 0: `Summe: 25 Euro`. Nur 0: `Summe: 0 Euro` (der Rumpf läuft nie).
Schritte: (1) Den Ablauf in Worten: Preise nacheinander einlesen und addieren, bis 0 kommt. (2) Wann ist Schluss? Die Eingabe entscheidet: Die Schleife läuft, solange `preis` nicht 0 ist. (3) Die Eingabe steht zweimal: vor der Schleife (sonst hat die Raute nichts zu prüfen) und am Ende des Rumpfs (sonst ändert sich `preis` nie). (4) Plan: Raute `preis != 0?`, Rumpf, Pfeil zurück. (5) Code: `!=` heißt ungleich; Doppelpunkt, Einrückung. (6) Probe: 12, 8, 5, 0 und nur 0. (7) Selbsterklärung: Was passiert, wenn die letzte Zeile im Rumpf fehlt? (Endlosschleife: `preis` ändert sich nie.)

**3 · Ablauf verfolgen: Schleife (5 Min; im Termin nicht einzeln).** Art `trace`, Zeilen kommen mehrfach vor. In der Aufgabenstellung steht: In der Zeile mit `while` trägst du in die Spalte Bedingung True oder False ein, ohne Anführungszeichen.

```python
n = 1
schritte = 0
while n < 6:
    n = n * 2
    schritte = schritte + 1
print(n, schritte)
```

Spalten `n`, `schritte`, `Bedingung`. 13 Schritte: Zeile 1 `n = 1` · Zeile 2 `schritte = 0` · Zeile 3 True · Zeile 4 `n = 2` · Zeile 5 `schritte = 1` · Zeile 3 True · Zeile 4 `n = 4` · Zeile 5 `schritte = 2` · Zeile 3 True · Zeile 4 `n = 8` · Zeile 5 `schritte = 3` · Zeile 3 False · Zeile 6 Ausgabe `8 3`. Hinweis bei Zeile 3 im letzten Durchgang: 8 < 6 ist falsch, die Schleife ist zu Ende, Zeilen 4 und 5 laufen nicht noch einmal. Im Termin: gemeinsam, wenn Reserve übrig ist, sonst zu Hause.

**4 · Plan zeichnen: Sparziel (★★, 10 Min).** Art `pap-zeichnen`, erlaubt `in,out,op,if,while`. Die Eingabe und die Ausgabe stehen schon im Editor, du ergänzt die Schleife. Text: Du sparst jede Woche 5 Euro. Eingelesen wird das Sparziel in Euro (ganze Zahl). Ausgegeben wird die Zahl der Wochen, bis das Ziel erreicht oder überschritten ist.
Lösung: Eingabe ziel (int) · `geld = 0` · `wochen = 0` · Schleife `geld < ziel` · ja: `geld = geld + 5`, `wochen = wochen + 1` · nein: Ausgabe wochen.
Tests: 40 ergibt 8 (Grenzfall, genau getroffen) · 42 ergibt 9 · 5 ergibt 1 · 1 ergibt 1 · 0 ergibt 0 (Grenzfall, der Rumpf läuft nie).
Tipps: (1) Zwei Werte ändern sich: `geld` und `wochen`. Beide starten bei 0. (2) Die Schleife fragt, ob das Geld noch nicht reicht: `geld < ziel`. Das Fragezeichen setzt der Editor selbst. (3) Im Rumpf stehen zwei Operationen; vom letzten führt der Pfeil zurück zur Raute. Die Ausgabe steht hinter dem nein-Ausgang.

**5 · Zeilen ordnen: Countdown (4 Min; im Termin nicht einzeln).** Art `parsons`. Plan: `zaehler = 3` · Schleife `zaehler > 0` · ja: Ausgabe zaehler, `zaehler = zaehler - 1` · nein: Ausgabe „Start“.
Lösung:
```python
zaehler = 3
while zaehler > 0:
    print(zaehler)
    zaehler = zaehler - 1
print("Start")
```
Zeilen, die nicht dazugehören: `while zaehler < 0:` und `zaehler = zaehler + 1`.

**6 · Lücken füllen: Monat eintragen (8 Min).** Art `gap`. Die Eingabe wird wiederholt, bis ein Monat zwischen 1 und 12 kommt. Der Plan steht vollständig darüber: Eingabe monat · Schleife `not (monat >= 1 and monat <= 12)` · ja: Ausgabe „Das gibt es nicht.“, Eingabe monat · nein: Ausgabe „Monat … eingetragen“.

```text
monat = int(input("Monat (1 bis 12): "))
@@while@@ @@not@@ (monat >= 1 @@and@@ monat <= 12):
    print("Das gibt es nicht.")
    monat = @@int@@(input("Monat (1 bis 12): "))
print(f"Monat {monat} eingetragen")
```

Tests (Eingaben; geprüft wird die letzte Zeile und die Zahl der Meldungen): 3 ergibt `Monat 3 eingetragen`, keine Meldung · 1 und 12 (Grenzfälle) ergeben keine Meldung · 0, 13, 7 ergeben `Monat 7 eingetragen` und zwei Meldungen · 13, 12 ergeben `Monat 12 eingetragen` und eine Meldung. `or` statt `and` oder die fehlende zweite Eingabe fallen in den Tests auf.
Tipps: (1) Lücke 1: Welches Wort lässt einen Block so lange laufen, wie eine Bedingung stimmt? Karte 1. (2) Lücke 2 und 3: Gültig ist 1 bis 12, wiederholt wird bei „nicht gültig“. Karte 2 zeigt das Wort für „nicht“. Gültig heißt: mindestens 1 UND höchstens 12. (3) Lücke 4: Im Rumpf wird die Eingabe noch einmal gelesen, in eine Zahl umgewandelt wie in der ersten Zeile.

**7 · Erste eigene Aufgabe: Türcode (★, 8 Min; im Termin nicht einzeln).** Art `code`. Text: Die Tür öffnet bei dem Code 4711. Eingelesen wird ein Code (ganze Zahl), bei jedem falschen Code erscheint `Falsch` und der Code wird erneut abgefragt. Zum Schluss erscheint `Tür offen`.
Plan: Eingabe code · Schleife `code != 4711` · ja: Ausgabe „Falsch“, Eingabe code · nein: Ausgabe „Tür offen“.
Lösung:
```python
code = int(input("Code: "))
while code != 4711:
    print("Falsch")
    code = int(input("Code: "))
print("Tür offen")
```
Tests: 4711 ergibt `Tür offen`, keine Meldung (Grenzfall) · 1, 2, 4711 ergibt `Tür offen` und zwei Meldungen · 4710, 4712, 4711 ergibt `Tür offen` und zwei Meldungen.
Tipps: (1) Fünf Symbole, sechs Zeilen. (2) Die Eingabe steht zweimal: einmal vor der Schleife, einmal im Rumpf. (3) Wiederholt wird, solange der Code nicht stimmt: Welcher Vergleich heißt „ungleich“? Karte 2.
Für Schnelle: Nach drei falschen Codes erscheint `Gesperrt` statt weiterer Abfrage. Dafür braucht es einen Zähler; probier, wie weit du ohne Hilfe kommst.

**8 · Fehler finden: Becken füllen (6 Min).** `Fehlersuche`, Fehler in Zeile 3 und 4. Text: Ein Becken fasst 100 Liter. Jede Minute laufen 20 Liter ein. Das Programm soll ausgeben, nach wie vielen Minuten es voll ist. Erwartet wird 5. In zwei Zeilen steckt ein Fehler.

```text
liter = 0
minuten = 0
while liter < 100
    minuten = minuten + 1
print(f"Voll nach {minuten} Minuten")
```

Fehler 1 (Zeile 3), meldet Python: `SyntaxError: expected ':'`, am Ende der Bedingung fehlt der Doppelpunkt. Fehler 2 (Zeile 4), meldet Python nicht: `liter` wächst im Rumpf nie, `liter < 100` bleibt wahr. Die Seite bricht nach 8 Sekunden ab: „Abgebrochen nach 8 s. Läuft da eine Endlosschleife?“ Richtig, mit `liter = liter + 20` als zweiter Rumpfzeile (`data-stdin` leer):

```python
liter = 0
minuten = 0
while liter < 100:
    minuten = minuten + 1
    liter = liter + 20
print(f"Voll nach {minuten} Minuten")
```

Probe: `Voll nach 5 Minuten`. Im Termin läuft die Endlosschleife nur am Beamer (Frage 5).

## G. Labor Teil B (Training, 5 Aufgaben, 38 Minuten) und Knobelaufgaben

Zu Hause zusammen 62 Minuten: Selbstcheck (7), Training (38), dazu die drei Stationen, die im Termin nicht einzeln laufen (3, 5, 7: zusammen 17). Frage 4.

1. **Wahrheitstabelle ausfüllen** (★, 9 Min, `trace` als Tabelle, 16 Zeilen, ohne Spalte „Ausgabe“). Y = (A ODER B) UND (C ODER D). Erst auf Papier, dann hier prüfen. Spalten „A ODER B“, „C ODER D“, „Y“. Lösung, Zeilen 0000 bis 1111: A ODER B: 0 0 0 0 · 1 1 1 1 · 1 1 1 1 · 1 1 1 1; C ODER D: 0 1 1 1 · 0 1 1 1 · 0 1 1 1 · 0 1 1 1; Y: 0 0 0 0 · 0 1 1 1 · 0 1 1 1 · 0 1 1 1 (9 Einsen). Text jedes Schritts wie in der Lerneinheit. Wird das Warm-up von Termin 05 (auf Papier).
2. **Gleichwertig?** (★★, 5 Min, `trace` als Tabelle, 4 Zeilen plus Urteil). Sind NICHT (A ODER (NICHT B)) und (NICHT A) UND B gleichwertig? Zeilen 00, 01, 10, 11, Spalten für beide Ausdrücke, jeweils 0 1 0 0. Letzter Schritt: Feld „gleichwertig?“, Eintrag `ja`, ohne Anführungszeichen. Hinweis: Erst NICHT B, dann die Klammer, dann das äußere NICHT; die beiden Spalten vergleichen.
3. **Plan in Code übertragen: Summe bis n** (★★, 8 Min, `klausur`). Plan: Eingabe n (ganze Zahl) · `summe = 0` · `zahl = 1` · Schleife `zahl <= n` · ja: `summe = summe + zahl`, `zahl = zahl + 1` · nein: Ausgabe summe. Tests: 4 ergibt 10 · 1 ergibt 1 · 3 ergibt 6 · 0 ergibt 0 (Grenzfall, der Rumpf läuft nie). Schema (je 1 Punkt): Eingabe mit `int(input(…))` und beide Startwerte vor der Schleife · `while zahl <= n:` mit Doppelpunkt · Rumpf eingerückt mit beiden Änderungen · `print(summe)` nach der Schleife, nicht eingerückt.
   ```python
   n = int(input("n: "))
   summe = 0
   zahl = 1
   while zahl <= n:
       summe = summe + zahl
       zahl = zahl + 1
   print(summe)
   ```
4. **Fehler finden und beheben: Zahlen von 1 bis n** (★★, 6 Min, `code`). Zwei Fehler: einer, den Python meldet, einer, den du nur mit einer Probe findest. Probier 3.
   Vorlage:
   ```python
   # Gibt die Zahlen von 1 bis n aus.
   n = int(input("n: "))
   zahl = 1
   while zahl < n:
   print(zahl)
       zahl = zahl + 1
   ```
   Lösung: Zeile 5 fehlt die Einrückung (`IndentationError: expected an indented block after 'while' statement on line 4`). Die Bedingung muss `zahl <= n` heißen, sonst fehlt die letzte Zahl (Grenzfall).
   ```python
   # Gibt die Zahlen von 1 bis n aus.
   n = int(input("n: "))
   zahl = 1
   while zahl <= n:
       print(zahl)
       zahl = zahl + 1
   ```
   Tests: 3 ergibt die Zeilen 1, 2, 3 · 1 ergibt die Zeile 1 (Grenzfall) · 0 ergibt keine Zahl (Grenzfall).
   Tipps: (1) Führ das Programm aus und lies die Meldung von unten: Nach welcher Zeile fehlt etwas? (2) Läuft es, probier 3: Welche Zahlen soll es ausgeben, welche gibt es aus? (3) Die letzte Zahl ist `n` selbst. Welcher Vergleich lässt `zahl == n` noch durch?
5. **Druck prüfen** (★★★, 10 Min, `code`, ohne Plan; erst auf Papier zeichnen). Die Presse braucht einen Hydraulikdruck von 150 bis 210 bar, die Grenzen sind erlaubt. Das Programm liest den Druck (ganze Zahl) ein und fragt neu, solange er außerhalb liegt. Es zählt die Fehlversuche und gibt am Ende `Druck ok: 180 bar, Fehlversuche: 0` aus (mit dem eingegebenen Druck und der Zahl der Fehlversuche). Tests: 180 ergibt `Druck ok: 180 bar, Fehlversuche: 0` · 100, 250, 150 ergibt `Druck ok: 150 bar, Fehlversuche: 2` (Grenzfall 150) · 211, 210 ergibt `Druck ok: 210 bar, Fehlversuche: 1` (Grenzfall 210) · 149, 180 ergibt `Druck ok: 180 bar, Fehlversuche: 1`.
   ```python
   druck = int(input("Hydraulikdruck in bar: "))
   fehler = 0
   while druck < 150 or druck > 210:
       fehler = fehler + 1
       druck = int(input("Außerhalb von 150 bis 210 bar. Nochmal: "))
   print(f"Druck ok: {druck} bar, Fehlversuche: {fehler}")
   ```
   Akzeptiert wird auch `not (druck >= 150 and druck <= 210)`.
   Tipps: (1) Zeichne zuerst den Plan: Eingabe, Zähler auf 0, Schleife, im Rumpf zählen und neu einlesen. (2) Ungültig heißt zu klein ODER zu groß; 150 und 210 selbst sind gültig. (3) Die Form kennst du von „Monat eintragen“: `fehler = 0` vor der Schleife, `fehler = fehler + 1` im Rumpf.

**Knobelaufgaben (freiwillig, zählen nicht im Fortschritt; Ideen, nicht ausgearbeitet).** Sie dürfen den Stoff von Termin 04 nutzen und sind nur für die Starken.
- „Streichholzspiel für zwei“ (`code`, sehr anspruchsvoll): 12 Hölzer, Spieler 1 und 2 nehmen abwechselnd 1 bis 3, wer das letzte nimmt, verliert. Das Programm fragt den jeweiligen Spieler, wiederholt bei ungültiger Zahl (mehr als 3, weniger als 1, mehr als noch da sind) und meldet den Verlierer. Es braucht eine äußere und eine innere Schleife und die Eingabeprüfung mit drei `or`-Teilen. Test: Eingaben 3, 3, 3, 2, 1 ergeben `Spieler 1 nimmt das letzte Holz und verliert` (nachgerechnet).
- „Genau zwei von drei Tastern“ (`code`, anspruchsvoll): Drei Taster als 0 oder 1 eingelesen; ausgegeben wird `Ja`, wenn genau zwei gedrückt sind, sonst `Nein`. Wer die drei Fälle (3 Einsen in der 8-Zeilen-Tabelle) mit `and`, `or` und `not` bauen will, mischt sie, was im Kurs sonst fehlt; der kurze Weg ist `a + b + c == 2`. Grenzfälle 0 0 0 und 1 1 1.
Empfehlung: das Streichholzspiel bauen, die zweite Aufgabe nur, wenn Zeit ist (Frage 6).

## H. Videos (je etwa 2 bis 2,5 Minuten; hier nur der Inhalt, kein Sprechertext)

**Theorie (Lerneinheit, Abschnitt 2): „Gleichwertig: zwei Tabellen, eine Spalte“.** Zwei Techniker schreiben die Sperre der Presse verschieden auf, zwei Tabellen mit vier Zeilen zeigen, dass NICHT (C UND D) und (NICHT C) ODER (NICHT D) dieselbe Spalte haben und (NICHT C) UND (NICHT D) nicht, und daraus entsteht die Regel von De Morgan.

**Python-Werkzeugkasten (Labor, Station 1): „while, !=, not“.** Zwei Karten; Karte 1 lässt den Countdown laufen, bis die Bedingung falsch wird, Karte 2 zeigt `!=` und `not` mit ihren Ergebnissen.

**Vorgerechnet (Labor, Station 2): „Einkauf zusammenrechnen“.** Der Plan mit Rücksprung entsteht neben dem Code; die Eingabe steht zweimal, und ein Lauf mit 12, 8, 5, 0 zeigt, wie der Pfeil zurückspringt, bis die 0 die Schleife beendet.

Abschnitte 1, 3 und 4 haben kein eigenes Video. Die Tabelle wird an der Tafel vorgerechnet, die Schleife läuft im Baustein und mit „Schritt für Schritt“.

## I. Ablaufplan für den Dozenten

Jeder 30-Minuten-Block verplant höchstens 28 Minuten. Die Minuten eines Abschnitts enthalten das Zeigen der genannten Karte.

| Minuten | Wo | Was |
|---|---|---|
| 0–10 | Papier, Beamer | **Warm-up.** Training-03-Tabelle (A ODER B) UND (NICHT C) auf Papier (5), Auflösung `0 0 1 0 1 0 1 0` (2). Rückblick auf die vier Schritte, Frage: Wie viele Zeilen bei vier Aussagen? (3) |
| 10–40 | Lerneinheit 1 | **Theorie 1: vom Text zur Formel.** Presse, Text, Variablen festlegen (3). Wörter und Klammern an zwei Sätzen, „Satz übersetzen“ per Zuruf (5). 16 Zeilen: Zeilen zählen, Reihenfolge, F an der Tafel vorrechnen (6). Baustein „Vier Schalter“ mit Vermutung (4). Vorhersage „Wie viele Einsen“, dann die Tabelle auf Papier, Prüfen in der Übung (10). Verplant: 28. |
| 40–70 | Lerneinheit 2 | **Theorie 2: gleichwertig.** Zwei Schreibweisen der Sperre, beide Spalten auf Papier, vergleichen (7). Die gefährliche dritte Schreibweise (2). Baustein „Gleichwertig oder nicht?“ mit Vermutung (5). Regel von De Morgan, Ruhezustand als zweites Beispiel (3). Vorrang: zwei Klammerungen, die Tischhälften rechnen je eine Tabelle, vergleichen, Vorhersage (8). „Wir schreiben immer Klammern“ als Abschluss (3). Verplant: 28. |
| 70–80 | – | **Pause.** |
| 80–110 | Lerneinheit 3, Labor 1 (Karte 1), 2, 4 | **Programmieren 1: wiederholen, solange.** Rückgriff: `if` fragt einmal (2). Countdown: Plan mit Rücksprung an der Tafel, Code mit Karte 1 (5). Baustein „Die Schleife von Hand drehen“ mit Vermutung (4). Vorhersage „Ein Zeichen anders“ (2). Einkauf zusammenrechnen am Beamer, Plan und Code nebeneinander, `!=` genannt (5). Alle zeichnen „Sparziel“ (10). Verplant: 28. Station 3 und 5 laufen nicht einzeln. |
| 110–135 | Lerneinheit 4, Labor 1 (Karte 2), 6, 8 | **Programmieren 2: Eingabe wiederholen.** Würfel: Plan, gültig und ungültig, De Morgan als Brücke, `not` mit Karte 2, Vorhersage (10). „Monat eintragen“ als Lückentext (8). „Becken füllen“ gemeinsam am Beamer, die Endlosschleife läuft nur dort (5). Auftrag für zu Hause, Pflicht, zusammen 62 Minuten: Stationen 3, 5, 7, Selbstcheck, Training (2). Termin 05 beginnt mit der Tabelle aus dem Training. Verplant: 25. |

Wenn die Zeit trotzdem knapp wird: Im Block 10–40 wird nur die Hilfsspalte auf Papier gefüllt, das Prüfen in der Übung ist Hausaufgabe. Im Block 40–70 gibt es nur eine Tabelle zum Vorrang (an der Tafel), die zweite zu Hause. Im Block 80–110 wird „Sparziel“ gemeinsam an der Tafel gezeichnet statt einzeln; der Einkauf wird nur gezeigt (Plan und Code auf der Seite, ein Lauf). Im letzten Block entfällt zuerst „Becken füllen“ (Hausaufgabe), dann hat der Lückentext Vorrang vor der Vorhersage.

---

# Bewusst weggelassen

**Logik**
- Umformen mit Rechenregeln (Distributivgesetz, Absorption), Gatter und Schaltsymbole, KV-Diagramme, NAND und NOR: Die Klausurform ist „Tabelle ausfüllen“ und „sind zwei Ausdrücke gleichwertig?“, beides geht mit der Tabelle. XOR kommt in Termin 06 (T4).
- De Morgan als auswendig gelernte Formel und mit drei oder vier Variablen: Entdeckt wird er an zwei Variablen; mehr bringt Tabellen mit mehr Spalten und keine neue Einsicht.
- Tautologie und Widerspruch als Begriffe, Tabellen mit mehr als vier Variablen: kein Prüfungsstoff, keine Zeit.
- Vorrang zum Schreiben: Eigene Ausdrücke haben Klammern. Der Vorrang wird nur gelesen.
- Alltagssätze mit „entweder … oder“ im Übersetzen: Der Unterschied steht seit Termin 03 im Text; XOR gibt es erst in Termin 06.

**Python**
- `for` und `range`: Termin 05. `break`, `continue`, `while True:`: Sie kürzen Schleifen ab, bevor die einfache Form sitzt. Die fußgesteuerte Schleife im Plan (`repeat`) kommt nicht vor.
- Schleife in Schleife: nur in einer Knobelaufgabe.
- `+=`, `%`, `//`: Rechnen bleibt bei `summe = summe + preis`, damit in der Schleife nur die Schleife neu ist.
- `if` ohne `else` und `if` im ja-Weg: Keine Aufgabe von Termin 04 braucht sie; sie kommen, wenn ein Schleifenrumpf auswählen muss (Termin 05).
- Zufallszahlen, Würfel mit `random`: Der Würfel wird eingetippt. Zufall bräuchte feste Startwerte in jedem Test.
- Textschleifen (`while antwort != "ja"`), Kommazahlen in Bedingungen, verkettete Vergleiche (`1 <= x <= 6`), gemischtes `and`/`or`: bleiben weg wie in Termin 03. Die Brücke zu De Morgan läuft über zwei Vergleiche.
- `bauteil3d` (Turm, Lochreihe): kommt mit der Zählschleife in einem späteren P3-Block.

**Aufbau und Umfang**
- Summe bis 0 als eigener Abschnitt der Lerneinheit: Er steht als Station 2. So bleibt Abschnitt 3 bei einer Idee (der Rücksprung).
- Zweite Vorhersage je Abschnitt, Theorie-Video zu Block 1, „Danach zu zweit“ bei den Lücken.
- Maschinenbau-Beispiele im Programmieren: nur Training 5 (Druck prüfen). Alltag hält die Programmierwelt klein.
- Eine Schleife mit Zahlenstrahl-Baustein für die Eingabeprüfung: Der Lückentext und die Vorhersage erledigen das.

---

# Technische Voraussetzungen

Belegt heißt: im Code gelesen. Nicht ausprobiert ist ausdrücklich gesagt.

1. **Endlosschleifen in den Tests (Pflicht, ca. 0,5 Tag).** Der Testlauf (`_run_user` im Capture-Modus, `aufgaben.js:167–225`) hat keine Schrittgrenze; nur beim Terminal-Modus läuft `sys.settrace`. Es gibt nur das Zeitlimit der Seite: `kurs.js:792–805` beendet den Worker hart nach `data-timeout` (8000 ms), die Meldung steht bei `kurs.js:1260`. Folge: Ein Programm der Studierenden mit vergessener Zählzeile (Sparziel, Summe bis n, Becken) lässt den ganzen Testlauf mit „Abgebrochen“ enden, ohne einen Einzeltest zu melden. Dazu hat `append` in `kurs.js:1249` keine Grenze; eine Endlosschleife mit `print` füllt 8 Sekunden lang die Seite (nicht ausprobiert, im gelesenen Code keine Kappung). Nötig: ein Zähler über `sys.settrace` im Capture-Modus (Abbruch zum Beispiel nach 200 000 Zeilen mit der Meldung „Dein Programm läuft nicht zu Ende. Ändert sich in der Schleife etwas an der Bedingung?“ je Test) und eine Kappung der Ausgabe (etwa 500 Zeilen mit dem Hinweis „weitere Ausgabe abgeschnitten“). Bis dahin planen die Aufgaben um den Fehler herum: Eingabeschleifen haben endliche Eingaben (Festlegung 8), aber Zählschleifen (Station 4, Training 3 und 4) sind ungeschützt.
2. **Plan zeichnen mit `while` (ca. 3 Stunden).** Belegt: Die Engine zeichnet und erzeugt `while` (`pap-engine.js:83–86, 167, 347–354`), die Doku nennt es (`docs/PAP-EDITOR.md:37, 50–52`), `nice()` zeigt `!=` als ≠ (`pap-engine.js:374`), `condOf` entfernt das Fragezeichen (`:322`). Es gibt aber keine Aufgabe mit `while` unter `app/inhalte/` (keine `.json` mit „while“). Für Station 4 und Training 3 sind zu bauen: Startvorgabe, Musterlösung als Baum, Tests; danach im Editor mit „In Schleife einfügen“ durchklicken. Nicht getestet: ob die Rückführung bei schmalen Tablets ohne Querscrollen sichtbar bleibt.
3. **trace mit wiederholten Zeilen (ca. 1 Stunde).** Belegt: `initTrace` arbeitet mit einem Zeiger über `steps`, jeder Schritt hat seine Zeile, nichts verlangt eindeutige Zeilen (`aufgaben.js:856, 924, 962`). Es gibt kein Beispiel mit Wiederholung und keinen Lauf auf der Seite. Zu tun: Station 3 bauen und einmal durchspielen. Hinweis: Die Spalte „Bedingung“ zeigt in den Zeilen dazwischen den alten Wert, das ist gewollt. Die Tabellen mit 16 Zeilen laufen über denselben Pfad wie die mit 8 (`tabellenSpalten` liest `A = 0, B = 0, …`, beliebig viele Spalten).
4. **Baustein `schleife` (ca. 1 Tag).** `explorables-v06.js` hat eine Abkühlkurve mit `while` als Plan, Marke, Zähler und „Watchdog“ bei der Endlosschleife (Kopfkommentar Z. 1–7). Sie zeichnet eigenhändig (`papKopf`, `papFuss`, `papZaehl`) und nutzt `KursPAP` nicht. Neu schreiben mit `KursPAP.figure` und einer Klasse am aktiven Knoten (`weiche` macht es so, `explorables-v02.js:239`); aus dem alten Baustein nur die Idee und den Schritt-Mechanismus übernehmen. Die Altlektion bleibt unangetastet.
5. **Bausteine `vier-schalter` und `gleichwertig` (ca. 3 und 4 Stunden).** `drei-schalter` ist tabellengetrieben (`AUSDRUECKE` in `explorables-v03.js:31–57`): auf vier Variablen und zwei Ausdrücke erweitern, dazu `v04.css`.
6. **Schritt für Schritt bei Schleifen.** `viz.js` begrenzt auf 1000 Schritte und 5 s (`viz.js:6, 18, 289`), die Schleifen dieses Termins brauchen unter 30. Das Verhalten bei Überschreitung ist nicht gelesen und für Termin 04 nicht nötig.
7. **Gebaut werden danach:** `kurs.yaml` (Eintrag V04, `lektion: V04` bei Termin 4), die Aufgaben `w-vorgemacht`, `w-trace`, `w-plan`, `w-parsons`, `w-luecken`, `w-eigene`, `tr-1` bis `tr-5`, Knobel `k-1`, Tabellen-Daten unter `lerneinheit/` und die Pläne für die Seiten. Gesamtaufwand der Werkzeug-Punkte 1 bis 5: etwa 2,5 Tage.

---

# Entscheidungen des Dozenten (2026-11-26)

- Frage 1: Theorie 1 und 2 zuerst, dann Programmieren 1 und 2. **Pausen werden in der App nicht erwähnt**, auch nicht im Dozenten-Ablaufplan (die Zeile „Pause“ entfällt; die Minuten laufen ohne sie weiter).
- Frage 2 und 3: wie empfohlen, mit `not` und `!=`.
- Frage 4: **Training 2 „Gleichwertig?“ entfällt.** Das Training hat 4 Aufgaben (33 Minuten), zu Hause zusammen 57 Minuten. Gleichwertigkeit wird im Selbstcheck (Frage 3) geprüft.
- Frage 5: Endlosschleife nur am Beamer; der Schutz in den Tests (Technische Voraussetzung 1) wird trotzdem gebaut, weil alle späteren Schleifen-Termine ihn brauchen.
- Frage 6: beide Knobelaufgaben bauen (Streichholzspiel und „Genau zwei von drei Tastern“).
- Frage 7: Programmieren im Alltag, Presse nur in Training „Druck prüfen“.

# Offene Fragen an den Dozenten (beantwortet, siehe oben)

1. **Reihenfolge der Blöcke.** Theorie 1 und 2 vor der Pause, Programmieren danach (statt Wechsel wie in Termin 03). Empfehlung: ja. Block 4 braucht De Morgan frisch, und vor der Pause gibt es keinen neuen Code. Preis: 60 Minuten Tabellen am Stück; dagegen helfen Partnerarbeit, Baustein und Zuruf.
2. **Schleifen-Zuschnitt bestätigen.** Block 3 Countdown, Summe bis 0 (nur als Station 2), Block 4 Eingabe wiederholen. Empfehlung: ja, mit dem Muster „Eingabe vor der Schleife und im Rumpf“ in beiden Beispielen, weil es das Muster ist, an dem die Hälfte hängen bleibt.
3. **`not` und `!=` in Termin 04.** `!=` dient der Summe und dem Türcode, `not` der Brücke zu De Morgan, dem Lückentext und dem Selbstcheck. Empfehlung: ja, beide. Wäre `not` zu viel, steht in Block 4 nur die `or`-Form, und Karte 2, Lücke 2 und Selbstcheck 6 verlieren die zweite Schreibweise.
4. **Umfang zu Hause: 62 statt etwa 47 Minuten.** Der Termin hat vier Blöcke, aber nur zwei für Programmieren, deshalb laufen drei Stationen nicht einzeln. Empfehlung: so lassen und den Auftrag in zwei Stücke teilen: Stationen 3, 5, 7 (17 Minuten) bis zur Wochenmitte, Selbstcheck und Training (45) bis zum nächsten Termin. Alternative: Training 2 („Gleichwertig?“) entfällt, dann 57 Minuten.
5. **Endlosschleife live.** Station 8 lässt Python 8 Sekunden laufen, bis die Seite abbricht (neu starten dauert; bei 25 Laptops gleichzeitig unschön). Empfehlung: nur am Beamer vorführen, die Studierenden lesen den Fehler und tragen ihn ein. Das ist auch die Voraussetzung dafür, dass Technische Voraussetzung 1 nicht vor dem Termin fertig sein muss.
6. **Knobelaufgaben.** Empfehlung: „Streichholzspiel für zwei“ bauen (zeigt äußere und innere Schleife und Eingabeprüfung mit drei `or`), „Genau zwei von drei Tastern“ nur bei Bedarf. Beide gelten als freiwillig und zählen nicht im Fortschritt.
7. **Presse im Programmieren.** Außer im Training 5 (Druck prüfen, dasselbe Bauteil wie in der Theorie) bleibt Programmieren im Alltag. Empfehlung: so, weil in Termin 04 zwei neue Dinge zugleich laufen (Logik, Schleifen) und vertraute Welten das Programmieren entlasten. Wenn auch dort Maschinenbau gewollt ist, würden „Countdown“ zu „Hübe bis Werkzeugwechsel“ und „Einkauf“ zu „Stückzahlen je Palette“; die Pläne bleiben gleich.
