"""Sprechertext Termin 06, Video 2: Python-Werkzeugkasten: range mit Schrittweite, Schleife in Schleife, Nachprüfen (Quelltext mit Markup)."""
SRC = [
 ["Drei neue Karten für deinen Werkzeugkasten.",
  "Karte 1 heißt [[range|rehndsch]] mit Schrittweite. Damit zählst du in Sprüngen und rückwärts.",
  "Karte 2 zeigt eine Schleife in der Schleife.",
  "Karte 3 hilft dir beim Nachprüfen: Hex und Bits in Python."],
 ["Karte 1 beginnt mit Sprüngen. [[range(0, 11, 5)|rehndsch von null, elf, fünf]] hat drei Zahlen: Start, Stopp, Schritt.",
  "Die Variable `i` beginnt bei 0 und springt jedes Mal um 5. Sie nimmt die Werte 0, 5 und 10 an.",
  "Die 11 ist der Stoppwert und gehört nicht dazu. Der Rumpf läuft dreimal, dann kommt `fertig`."],
 ["Rückwärts zählst du mit dem Schritt minus 1. [[range(5, 0, -1)|rehndsch von fünf, null, minus eins]] ergibt 5, 4, 3, 2, 1. Die 0 fehlt: Der Stoppwert gehört nie dazu.",
  "Andere negative Schritte liest du nur. [[range(10, 0, -3)|rehndsch von zehn, null, minus drei]] ergibt 10, 7, 4 und 1.",
  "Achtung: Zählst du gegen den Schritt, läuft der Rumpf nie. [[range(5, 0)|rehndsch von fünf, null]] hat keine Zahl, und Python schweigt.",
  "Ein Schritt von 0 meldet einen `ValueError`."],
 ["Karte 2 hat zwei Schleifen. Die äußere zählt `i` von 1 bis 2. Die innere steht in ihrem Rumpf, eingerückt, und zählt `j` von 1 bis 3.",
  "Bei jedem `i` läuft die innere Schleife ganz durch. Danach beginnt `j` wieder bei 1.",
  "Die Ausgabe ist 1 und 1, 1 und 2, 1 und 3, dann 2 und 1, 2 und 2, 2 und 3. Das sind 2 mal 3, also 6 Durchläufe.",
  "Das `fertig` steht ganz links. Es läuft erst nach beiden Schleifen, einmal."],
 ["Karte 3 ist nur zum Nachprüfen, nicht für Aufgaben. Rechne zuerst auf Papier.",
  "[[0xE2|null x, eh zwei]] ist die Hexzahl [[E2|eh zwei]] und ergibt 226. Dasselbe ist [[0b11100010|null b, eins eins eins null, null null eins null]], das Byte in binär.",
  "[[hex(226)|hex von zweihundertsechsundzwanzig]] gibt [[0xe2|null x, eh zwei]] aus, denn Python schreibt klein. [[int(\"E2\", 16)|int von dem Text eh zwei, sechzehn]] liest den Text [[E2|eh zwei]] als Hexzahl.",
  "Für [[XOR|ex or]] schreibt Python ein Dach: [[a ^ b|a Dach b]]. Mit a gleich [[1100|eins eins null null]] und b gleich [[1010|eins null eins null]] kommt 6 heraus, binär [[110|eins eins null]]. Das Dach ist hier [[XOR|ex or]], nicht hoch."],
]

SZENEN = [
 "Drei Karten nebeneinander: 1 range mit Schrittweite (range(0, 11, 5)), 2 Schleife in Schleife, 3 Zum Nachprüfen: Hex und Bits; die bekannten Karten aus Termin 05 (for und range, if ohne else) liegen blass dahinter.",
 "Karte 1: Code for i in range(0, 11, 5): mit eingerücktem print(i), danach print(\"fertig\"); die drei Zahlen sind als Start, Stopp, Schritt beschriftet; eine Zahlenreihe 0, 5, 10 mit Pfeilen der Länge 5, die 11 steht gestrichelt und durchgestrichen; Ausgabe 0, 5, 10, fertig.",
 "Der Countdown range(5, 0, -1) mit der Zahlenreihe 5, 4, 3, 2, 1 und der gestrichelten 0; darunter range(10, 0, -3) als Nur-lesen-Zeile (10, 7, 4, 1); dann range(5, 0) mit leerer Reihe und dem Hinweis: Rumpf läuft nie, keine Meldung; zuletzt range(0, 5, 0) mit ValueError: range() arg 3 must not be zero.",
 "Karte 2: Code mit zwei verschachtelten for-Schleifen, die innere eingerückt; ein kleines Raster mit i als Zeilen und j als Spalten füllt sich Paar für Paar; die Ausgabe 1 und 1 bis 2 und 3, dann fertig; Hinweis: 2 mal 3 = 6 Durchläufe, fertig ganz links.",
 "Karte 3: der Code mit print(0xE2), print(0b11100010), print(hex(226)), print(bin(37)), print(int(\"E2\", 16)) und a = 0b1100, b = 0b1010 mit &, |, ^ und bin(a ^ b), jede Ausgabe als Kommentar; markiert werden 0xE2, hex(226), int(\"E2\", 16) und a ^ b; Hinweis: ^ ist hier XOR, nicht hoch.",
]
