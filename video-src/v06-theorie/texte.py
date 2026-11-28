"""Sprechertext Termin 06, Video 1: Vierergruppen und Hex-Ziffern (Quelltext mit Markup)."""
SRC = [
 ["Vier Bit haben 16 Werte. Das sind die 16 Zeilen der Wahrheitstabelle, von [[0000|null null null null]] bis [[1111|eins eins eins eins]].",
  "Dezimal gibt es nur die Ziffern 0 bis 9. Für die Werte 10 bis 15 nimmst du Buchstaben: [[A|ah]] ist 10, [[B|beh]] ist 11, [[C|zeh]] ist 12, [[D|deh]] ist 13, [[E|eh]] ist 14 und [[F|eff]] ist 15.",
  "Das ist das Hexadezimalsystem. Es hat 16 Ziffern, und jede steht für genau eine Vierergruppe."],
 ["Ein Byte besteht aus zwei Vierergruppen. Du schlägst jede Gruppe einzeln in der Tabelle nach.",
  "Nimm [[1110 0010|eins eins eins null, null null eins null]]. Die linke Gruppe ist [[E|eh]], die rechte ist 2. Das Byte ist also [[E2|eh zwei]].",
  "Noch eins zum Mitrechnen: [[0011 1100|null null eins eins, eins eins null null]] ergibt [[3C|drei zeh]].",
  "Zurück geht es genauso: [[A7|ah sieben]] wird zu [[1010 0111|eins null eins null, null eins eins eins]]."],
 ["Was ist [[E2|eh zwei]] als Dezimalzahl? Die Hexzahl hat zwei Stellen. Die linke ist 16-mal so viel wert wie die rechte. Die Stellenwerte sind 16 und 1.",
  "[[E|eh]] ist 14. Du rechnest 14 mal 16, das sind 224, plus 2 mal 1. Das ergibt 226.",
  "Zur Probe nimmst du das Byte [[1110 0010|eins eins eins null, null null eins null]]: 128 plus 64 plus 32 plus 2 ergibt ebenfalls 226."],
 ["Wozu das Ganze? Hex ist kürzer als acht Nullen und Einsen und lässt sich trotzdem direkt in Bits zurückübersetzen. Du findest es zum Beispiel bei Farben im Web.",
  "Der Code [[#E2001A|Raute, eh zwei, null null, eins ah]] ist das Rot der DHBW. Er besteht aus drei Bytes: [[E2|eh zwei]] für Rot, 00 für Grün und [[1A|eins ah]] für Blau.",
  "[[E2|eh zwei]] ist 226, 00 ist 0 und [[1A|eins ah]] ist 26. Viel Rot, kein Grün, wenig Blau.",
  "Gleich kannst du es mit dem Hex-Farbmischer selbst ausprobieren."],
]

SZENEN = [
 "Die Wahrheitstabelle mit vier Variablen, 16 Zeilen von 0000 bis 1111; daneben füllt sich eine Spalte mit den Hex-Ziffern 0 bis 9 und A bis F, und eine mit den Dezimalwerten 0 bis 15; Begriff Hexadezimalsystem: 16 Ziffern, jede ist eine Vierergruppe.",
 "Das Byte 1110 0010 in zwei Vierergruppen; jede Gruppe zeigt auf ihre Hex-Ziffer in der Tabelle: E und 2, zusammen E2; dann 0011 1100 zu 3C; dann A7 zu 1010 0111.",
 "E2 mit den Stellenwerten 16 und 1 über den beiden Ziffern; 14 mal 16 ist 224, 2 mal 1 ist 2, Summe 226; Probe: die Bits 1110 0010 mit den Werten 128, 64, 32, 2 ergeben 226.",
 "Eine Farbfläche im DHBW-Rot mit dem Code #E2001A; der Code zerfällt in drei Bytes E2, 00, 1A mit den Beschriftungen Rot, Grün, Blau und den Dezimalwerten 226, 0, 26; Hinweis auf den Baustein Hex-Farbmischer.",
]
