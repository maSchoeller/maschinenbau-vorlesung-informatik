"""Sprechertext Termin 10, Video 1: Schnell, groß, Zahlen: Speicher-Treppe, KB bis GB, Zeichen als Zahlen (Quelltext mit Markup)."""
SRC = [
 ["Ein Rechner hat nicht einen Speicher, sondern vier Stufen. Ganz oben sitzt der Speicher im Prozessor. Dann kommt der Arbeitsspeicher, dann die [[SSD|ess ess dee]], ganz unten die Festplatte.",
  "Wir spielen es in Zeitlupe. Der Arbeitsspeicher braucht für einen Zugriff eine Sekunde. Der Speicher im Prozessor braucht dann nur [[0,01 Sekunden|ein Hundertstel einer Sekunde]].",
  "Die [[SSD|ess ess dee]] braucht in dieser Zeitlupe rund 17 Minuten. Die Festplatte braucht rund 28 Stunden, also mehr als einen ganzen Tag.",
  "Je schneller ein Speicher ist, desto kleiner und teurer ist er. Darum liegt oben, was der Prozessor jetzt braucht, und unten der große Rest."],
 ["Gemessen wird in Byte. Ein Byte sind 8 Bit. Es reicht für eine Zahl bis 255 oder für einen Buchstaben.",
  "Von Einheit zu Einheit geht es mal 1000. Ein [[KB|Kilobyte]] sind 1000 Byte, ein [[MB|Megabyte]] sind 1000 [[KB|Kilobyte]], ein [[GB|Gigabyte]] sind 1000 [[MB|Megabyte]]. Viele Programme rechnen mit 1024, wir rechnen mit 1000.",
  "Eine Textseite hat etwa 2 [[KB|Kilobyte]]. Ein Foto hat etwa 3 [[MB|Megabyte]]. Ein Film hat etwa 2 [[GB|Gigabyte]], das sind 2000 [[MB|Megabyte]]."],
 ["Der Rechner kennt nur Zahlen. Darum ist auch jeder Buchstabe eine Zahl. Diese Zuordnung heißt Code.",
  "Ein einfacher Code ist [[ASCII|Asky]]. Er hat 7 Bit, das sind 128 Zeichen.",
  "Das große A ist die 65. In Bits ist das [[100 0001|eins null null null null null eins]]. Das B ist die 66, das C die 67, und so geht es weiter.",
  "Das kleine a ist die 97, in Bits [[110 0001|eins eins null null null null eins]]. Zwischen groß und klein liegen immer 32."],
]

SZENEN = [
 "Vier Stufen als Balken untereinander: Speicher im Prozessor, Arbeitsspeicher, SSD, Festplatte, mit Größe ungefähr; rechts die Zeitlupe: 0,01 Sekunden, 1 Sekunde, 17 Minuten, 28 Stunden; Merksatz: schnell ist klein und teuer.",
 "Eine Kette Byte, KB, MB, GB mit je mal 1000; darunter drei Karten: Textseite etwa 2 KB, Foto etwa 3 MB, Film etwa 2 GB; Hinweis 1 Byte gleich 8 Bit.",
 "Zwei Zeilen: das A wird 65 mit sieben Bits 1000001, das a wird 97 mit 1100001; die Gewichte 64 bis 1 darüber; daneben B 66 und C 67; Hinweis: groß und klein liegen 32 auseinander.",
]
