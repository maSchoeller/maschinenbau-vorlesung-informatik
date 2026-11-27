"""Sprechertext Termin 07, Video 1: Ein Byte, zwei Lesarten: Überlauf und Vorzeichen (Quelltext mit Markup)."""
SRC = [
 ["Ein Kilometerzähler hat fünf Räder. Der größte Stand ist [[99 999|neunundneunzigtausend neunhundertneunundneunzig]].",
  "Fährst du einen Kilometer weiter, springt er auf [[00 000|null null null null null]]. Ein sechstes Rad gibt es nicht. Das ist ein Überlauf.",
  "Ein Zähler im Rechner läuft genauso über, wenn ihm die Stellen ausgehen."],
 ["Ein Byte hat acht Schalter, jeder steht auf 0 oder 1. Das sind 256 Werte, von 0 bis 255.",
  "Der größte Stand ist [[1111 1111|acht mal eins]]. Zählst du eins dazu, brauchst du eine neunte Stelle: [[1 0000 0000|eins, dann acht Nullen]].",
  "Diese neunte Stelle gibt es nicht. Übrig bleiben acht Nullen, das Byte steht wieder auf [[0000 0000|acht mal null]].",
  "Aus 255 plus 1 wird also 0. Der Rechner meldet keinen Fehler, er zählt einfach weiter. Ein Werkstückzähler in einer Anlage springt so von 255 auf 0."],
 ["Dieselben 256 Werte liegen auf einem Kreis. Nach der 255 geht es wieder bei 0 los.",
  "Soll ein Byte auch negative Zahlen zeigen, ändert sich nur das Lesen. Der oberste Schalter zählt dann minus 128 statt plus 128. Die anderen sieben zählen wie bisher.",
  "Ich rechne es einmal vor. [[1111 1111|acht mal eins]] ist minus 128 plus 127, das ergibt minus 1. [[1000 0000|eins, dann sieben Nullen]] ist nur der oberste Schalter, also minus 128.",
  "Der Bereich geht von minus 128 bis 127. Nach der 127 kommt die minus 128, gleich weit wie von 255 nach 0. Ist der oberste Schalter 1, ist die Zahl negativ."],
 ["In Python ist das anders: Ganze Zahlen wachsen mit. [[4294967295 + 1|vier Milliarden und so weiter plus eins]] ergibt [[4294967296|die nächste Zahl, ohne Sprung zurück]].",
  "Der stärkste Beleg ist [[2 ** 64 + 1|zwei hoch vierundsechzig plus eins]]. Das Ergebnis hat zwanzig Stellen und passt in kein Feld mit 64 Bit. Python rechnet trotzdem richtig.",
  "Überläufe gibt es in Steuerungen, in Sensoren und in anderen Programmiersprachen. Bei ganzen Zahlen in Python gibt es sie nicht."],
]

SZENEN = [
 "Ein Kilometerzähler mit fünf Rädern: 9 9 9 9 9, dann springt er auf 0 0 0 0 0; ein sechstes Rad ist gestrichelt und leer; Begriff Überlauf.",
 "Ein Byte aus acht Schaltern mit Wert 255 (1111 1111); links eine gestrichelte neunte Stelle mit der 1, durchgestrichen; danach 0000 0000 und Wert 0; Aussage 255 + 1 = 0, keine Fehlermeldung.",
 "Ein Zahlenkreis mit 256 Werten, oben 0, links daneben 255, unten 128; der oberste Schalter hat das Gewicht minus 128; Rechnung 1111 1111 = minus 128 + 127 = minus 1 und 1000 0000 = minus 128; Tabelle mit Byte, ohne Vorzeichen, mit Vorzeichen; Bereich minus 128 bis 127.",
 "Zwei Zeilen Python-Code mit Ausgabe 4294967296 und 18446744073709551617; daneben zwei Karten: Zähler in der Steuerung läuft über, ganze Zahl in Python wächst mit.",
]
