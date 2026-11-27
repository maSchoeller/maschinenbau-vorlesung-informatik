"""Sprechertext Termin 05, Video 1: Die Stellenwerttabelle: binär und dezimal (Quelltext mit Markup)."""
SRC = [
 ["Erinnerst du dich an die Wahrheitstabelle mit vier Variablen? Ihre Zeilen laufen von [[0000|null null null null]] bis [[1111|eins eins eins eins]].",
  "Diese Zeilen sind Zahlen. Sie zählen: [[0000|null null null null]], [[0001|null null null eins]], [[0010|null null eins null]], und so weiter.",
  "Das ist das Zweiersystem. Es kennt nur zwei Ziffern, 0 und 1. Jede Stelle heißt Bit, und 8 Bit sind ein Byte."],
 ["Bei Dezimalzahlen ist jede Stelle zehnmal so viel wert wie die rechts daneben. Bei 345 steht die 3 für dreihundert, die 4 für vierzig und die 5 für fünf.",
  "Im Zweiersystem ist jede Stelle doppelt so viel wert. Von rechts nach links: 1, 2, 4, 8, 16, 32, 64, 128.",
  "Stell dir dazu acht Schalter vor. Über jedem steht sein Wert. Ist der Schalter an, zählt der Wert mit, sonst nicht."],
 ["Die Zahl [[0010 1101|null null eins null, eins eins null eins]] steht in zwei Vierergruppen.",
  "Wo eine 1 steht, ist der Schalter an: bei 32, bei 8, bei 4 und bei 1.",
  "Du addierst die Werte der Einsen: 32 plus 8 plus 4 plus 1 ergibt 45."],
 ["Jetzt umgekehrt: Wie schreibst du 45 binär? Du gehst von links durch die Tabelle und fragst bei jeder Stelle: Passt der Wert in den Rest?",
  "128: nein, das Bit ist 0. 64: nein, Bit 0. 32: Ja, Bit 1, und du ziehst ab. Der Rest ist 13.",
  "16: nein, Bit 0. 8: ja, Bit 1, der Rest ist 5. 4: ja, Bit 1, der Rest ist 1. 2: nein, Bit 0. 1: ja, Bit 1, der Rest ist 0.",
  "Das ergibt wieder [[0010 1101|null null eins null, eins eins null eins]]. Zur Probe addierst du 32 plus 8 plus 4 plus 1: Es sind 45."],
 ["Wie viele Werte passen in ein Byte? Mit jedem Bit verdoppelt sich die Zahl der Möglichkeiten: 2, 4, 8, 16, und mit 8 Bit sind es 256.",
  "Sie laufen von 0 bis 255. Der größte Wert ist [[1111 1111|eins eins eins eins, eins eins eins eins]].",
  "Probier es gleich mit den acht Schaltern aus."],
]

SZENEN = [
 "Die Wahrheitstabelle mit vier Variablen, Zeilen 0000 bis 1111; daneben erscheinen die Zahlen 0 bis 15 als Zeilennummern; die Begriffe Zweiersystem, Bit und Byte (8 Bit) werden eingeblendet.",
 "Links die Dezimalzahl 345 mit den Stellenwerten 100, 10, 1 und den Faktoren 3, 4, 5; rechts acht Schalter mit den Werten 128, 64, 32, 16, 8, 4, 2, 1 darüber; jeder Wert ist doppelt so groß wie der rechte Nachbar (Pfeil mal 2).",
 "Die acht Schalter zeigen 0010 1101, in zwei Vierergruppen; die Schalter bei 32, 8, 4 und 1 stehen an und leuchten; darunter die Rechnung 32 + 8 + 4 + 1 = 45.",
 "Stellenwerttabelle für 45 mit den Zeilen Stellenwert, passt in den Rest?, Bit, Rest danach; sie füllt sich von links: nein, nein, ja, nein, ja, ja, nein, ja; Bits 0 0 1 0 1 1 0 1; Reste 45, 45, 13, 13, 5, 1, 1, 0; unten das Ergebnis 0010 1101 und die Probe 45.",
 "Die Zahl der Werte verdoppelt sich je Bit: 1 Bit 2 Werte, 2 Bit 4, 3 Bit 8, 4 Bit 16, 8 Bit 256; das Byte mit allen Schaltern an: 1111 1111 = 255; Schluss: Werte von 0 bis 255; der Baustein Acht Schalter, ein Byte wird angedeutet.",
]
