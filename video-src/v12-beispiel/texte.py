"""Sprechertext V12 Beispiel (Quelltext mit Markup)."""
SRC = [
 ["Heute prüfst du die Lagertemperatur von Hand. Die Spezifikation steht in den ersten vier Zeilen: unter 70 Grad normal, von 70 bis einschließlich 85 Grad warnung, darüber abschalten.",
  "Messwerte unter minus 40 Grad oder über 200 Grad sind Sensorfehler.",
  "Die Testfälle schreibst du aus dieser Spezifikation, nicht aus dem Code."],
 ["Die Funktion `zustand` bekommt die Temperatur `t`. Die erste Frage sortiert die Sensorfehler aus.",
  "Danach drei Zweige: unter 70 normal, bis einschließlich 85 warnung, sonst abschalten.",
  "In Zeile 13 steht kleiner gleich. Das Gleichheitszeichen ist der Kern der Spezifikation."],
 ["Jetzt die Testfälle. 20 Grad ist ein typischer Wert für normal.",
  "Dann die erste Grenze von beiden Seiten: [[69,9|neunundsechzig Komma neun]] ist noch normal, 70 ist schon Warnung.",
  "Die zweite Grenze: 85 gehört noch zur Warnung, [[85,1|fünfundachtzig Komma eins]] ist schon abschalten."],
 ["Dann die Grenzen der Sensorfehler. Minus 40 ist noch eine gültige Messung, also normal. [[-40,1|minus vierzig Komma eins]] ist schon ein Sensorfehler.",
  "200 Grad ist noch gültig, also abschalten. [[200,1|zweihundert Komma eins]] ist ein Sensorfehler.",
  "Neun `assert`-Zeilen, und keine hat geschwiegen oder abgebrochen: Alle neun Tests bestanden."],
 ["Nun die Version der KI. Sie sieht fast genauso aus.",
  "Aber in Zeile 35 steht `t < 85` statt `t <= 85`, und der Sensorfehler fehlt.",
  "Beim Durchlesen fällt das kaum auf. Bei 20, 75 und 90 Grad macht sie alles richtig."],
 ["Der Test an der Grenze steht in einem `try`-Block. Der `assert` fragt, ob `zustand_ki(85)` gleich warnung ist. Das stimmt nicht, denn die Funktion liefert abschalten.",
  "Python springt in den `except`-Block, und `as fehler` gibt der Ausnahme einen Namen. Die Ausgabe: AssertionError, Grenzwert 85 Grad falsch eingeordnet.",
  "Ein einziger Test an der Grenze hat den Fehler gefunden. Merke: Testfälle aus der Spezifikation, Grenzen von beiden Seiten, vor dem Generieren."],
]

SZENEN = [
 "Code-Ausschnitt Zeilen 1 bis 4 mit der Spezifikation als Kommentar; daneben ein Zahlenstrahl mit den Bereichen Sensorfehler, normal, Warnung, abschalten, Sensorfehler und den Grenzen minus 40, 70, 85, 200.",
 "Code der Funktion zustand (Zeilen 7 bis 16); die drei Zweige werden nacheinander hervorgehoben; Zeile 13 mit <= wird farbig markiert.",
 "Zeilen 19 bis 24 mit den assert-Zeilen für 20, 69,9, 70, 85, 85,1; auf dem Zahlenstrahl leuchten die zugehörigen Testpunkte beidseits der Grenzen 70 und 85 auf.",
 "Zeilen 25 bis 29; auf dem Zahlenstrahl leuchten die Punkte minus 40, minus 40,1, 200 und 200,1 auf; unten erscheint die Ausgabe Alle 9 Tests bestanden.",
 "Code der Funktion zustand_ki (Zeilen 32 bis 38); Zeile 35 mit t < 85 wird rot markiert, der fehlende Sensorfehler-Zweig als gestrichelte Lücke angedeutet.",
 "Zeilen 40 bis 43 mit try, assert, except as; ein Pfeil springt in den except-Block; Ausgabe AssertionError: Grenzwert 85 °C falsch eingeordnet; am Ende ein Merksatz Tests aus der Spezifikation, Grenzen beidseits.",
]
