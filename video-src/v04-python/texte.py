"""Sprechertext Termin 04, Video 2: Python-Werkzeugkasten: while, !=, not (Quelltext mit Markup)."""
SRC = [
 ["Heute kommen zwei Karten in deinen Werkzeugkasten.",
  "Alles aus [[Termin 02|Termin zwei]] und [[Termin 03|Termin drei]] gilt weiter: `if`, [[elif|ell-iff]], [[and|änd]] und `or`.",
  "Neu ist [[while|weil]]. Damit wiederholst du etwas.",
  "Dazu kommen zwei Wörter, mit denen du das Gegenteil bildest: [[!=|ungleich]] und `not`."],
 ["Karte 1: Der Raketenstart zählt rückwärts. Der Zähler beginnt bei 3.",
  "Die Zeile mit [[while|weil]] hat eine Bedingung und einen Doppelpunkt. Solange die Bedingung wahr ist, läuft der Rumpf.",
  "Der Rumpf ist alles, was darunter eingerückt steht. Hier gibt er den Zähler aus und zählt um eins herunter.",
  "Die Zeile `print(\"Start\")` ist nicht eingerückt. Sie läuft erst, wenn die Schleife zu Ende ist."],
 ["Ein Lauf. [[while|Weil]] fragt vor jedem Durchlauf: Ist der Zähler größer als 0?",
  "3 ist größer als 0: Ja. Das Programm gibt 3 aus. Der Zähler ist jetzt 2.",
  "Dann 2 und 1. Beim Zähler 0 lautet die Antwort: Nein.",
  "Die Schleife ist zu Ende, und das Programm gibt Start aus.",
  "Merke: Was in der Bedingung steht, muss sich im Rumpf ändern. Sonst endet die Schleife nie."],
 ["Karte 2: das Gegenteil. Der Preis ist 0.",
  "Das Zeichen [[!=|ungleich]] besteht aus Ausrufezeichen und Gleichheitszeichen. Es fragt: Ist der Preis ungleich 0?",
  "Der Preis ist 0, also ist die Antwort falsch. Python gibt [[False|Fols]] aus.",
  "Du brauchst es gleich bei Schleifen, die enden, wenn eine Eingabe 0 ist."],
 ["Das Wort `not` dreht wahr und falsch um.",
  "Die Klammer sagt, was umgedreht wird. In der Klammer steht: Der Preis ist mindestens 1 [[and|und]] höchstens 6.",
  "Bei Preis 0 ist das falsch. `not` macht daraus wahr. Python gibt [[True|Truh]] aus.",
  "Nach De Morgan ist das dasselbe wie: Der Preis ist kleiner als 1 oder größer als 6. Probier beide Karten aus und ändere die Werte."],
]

SZENEN = [
 "Zwei neue Karten vorn: while: wiederholen, solange und != und not: das Gegenteil; die Karten aus Termin 02 und 03 (if, elif, and, or) liegen blass dahinter; dann die Wörter while, !=, not groß.",
 "Karte 1: Code zaehler = 3, while zaehler > 0:, eingerückt print(zaehler) und zaehler = zaehler - 1, dann print(\"Start\") ohne Einrückung; der Rumpf ist farbig hinterlegt, die letzte Zeile steht außerhalb.",
 "Derselbe Code als Lauf: an der while-Zeile erscheint nacheinander 3 > 0 ja, 2 > 0 ja, 1 > 0 ja, 0 > 0 nein; ein Pfeil führt jedes Mal vom Rumpf zurück nach oben; die Ausgabe füllt sich mit 3, 2, 1, Start; darunter der Merksatz zur Bedingung.",
 "Karte 2: Code preis = 0 und print(preis != 0); unter dem Ausdruck steht 0 != 0 ist falsch; Ausgabe False; daneben die Zeichen != als Ausrufezeichen und Gleichheitszeichen.",
 "Code print(not (preis >= 1 and preis <= 6)); die Klammer wird umrandet, darin steht False, mit not-Pfeil daraus True; Ausgabe True; die beiden Ausgaben False und True stehen untereinander.",
]
