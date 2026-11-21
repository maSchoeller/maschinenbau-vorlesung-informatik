"""Sprechertext V09 Theorie (Quelltext mit Markup)."""
SRC = [
 ["Du hast dein Handy am Fahrradlenker befestigt und eine Bremsung aufgezeichnet.",
  "Die App [[phyphox|Fyfox]] exportiert die Messung als Datei: 400 Zeilen, 50 Messungen pro Sekunde.",
  "Gesucht ist die Spitze der Verzögerung. Dafür muss dein Programm die Datei lesen können, und es muss auch mit einer kaputten Zeile klarkommen."],
 ["Eine Datei ist ein Inhalt, der unter einem Namen auf einem Datenträger liegt. Sie steckt in einem Ordner, und der Pfad beschreibt den Weg dorthin.",
  "Ein absoluter Pfad beginnt ganz oben im Laufwerk. Ein relativer Pfad beginnt im Ordner, in dem dein Programm steht.",
  "Die häufigste Fehlermeldung ist [[`FileNotFoundError`|File Not Found Error]]: Die Datei gibt es unter diesem Namen nicht. Meist ist es ein Tippfehler oder der falsche Ordner."],
 ["Eine Datei besteht nur aus Bytes. Wie daraus Buchstaben werden, legt die Textkodierung fest.",
  "Heute gilt [[UTF-8|U T F acht]]: Umlaute brauchen dort zwei Bytes.",
  "Liest dein Programm mit der falschen Tabelle, wird aus einem ä ein [[„Ã¤“|A mit Tilde, gefolgt von einem Währungszeichen]]. Darum schreibst du immer [[`encoding=\"utf-8\"`|encoding gleich U T F acht in Anführungszeichen]]."],
 ["Tabellen speichert man als [[CSV|C S V]]-Datei: eine Zeile je Messung, die Spalten durch ein Trennzeichen getrennt, oben die Kopfzeile.",
  "Dein deutsches Excel nimmt das Semikolon als Trennzeichen und das Komma als Dezimalzeichen. Andere Programme nehmen das Komma als Trenner und den Punkt als Dezimalpunkt.",
  "Beides siehst du erst in der Datei. Python versteht als Dezimalzeichen nur den Punkt."],
 ["So wird aus einer Zeile eine Zahl.",
  "`strip` schneidet den Zeilenumbruch ab. `split` zerschneidet den Text am Trennzeichen, das Ergebnis ist eine Liste aus Texten.",
  "`replace` macht aus dem Komma einen Punkt, und `float` macht daraus endlich eine Zahl.",
  "Bis zum letzten Schritt ist alles nur Text."],
 ["Was passiert bei einer kaputten Zeile? Python löst eine Ausnahme aus, und das Programm bricht ab.",
  "Den Traceback liest du von unten nach oben: Die letzte Zeile nennt die Fehlerart.",
  "Mit `try` und `except` fängst du eine Fehlerart ab: Bei einer kaputten Zeile springt Python in den Block mit `except`, du zählst sie mit und machst weiter.",
  "Fang aber nur die Fehlerart, die du erwartest, und verschweige nie, was du übersprungen hast."],
]

SZENEN = [
 "Fahrrad-Lenker mit Smartphone (flache Vektorgrafik); daneben läuft eine Beschleunigungskurve mit einer Spitze nach unten, darunter die Zahlen 400 Zeilen, 50 Hertz. Zuletzt erscheint eine Tabellenzeile mit rot markiertem Feld Fehler.",
 "Ordnerbaum (Laufwerk, Users, informatik, daten) mit der Datei bremsen.csv; zwei Pfeile: absoluter Pfad von ganz oben, relativer Pfad ab dem Ordner des Programms. Zum Schluss ein rotes FileNotFoundError mit einem Tippfehler im Namen.",
 "Wie das Explorable Kodierung: Text Größe in Bytes (hexadezimal), Umlaute blau; Pfeil nach rechts liest die Bytes mit Latin-1 und zeigt den Ã-Salat; Einblendung encoding=utf-8 im Code.",
 "Zwei Rohzeilen untereinander (Semikolon mit Dezimalkomma, Komma mit Dezimalpunkt) mit farbig markierten Trennzeichen und Dezimalzeichen; daneben die Kopfzeile mit Anführungszeichen.",
 "Wie das Explorable CSV-Zeile zerlegen: die Zeile wandert durch strip, split (Liste aus fünf Chips, Index 2 leuchtet), replace und float; am Ende steht die Zahl minus 3,78.",
 "Programmablaufplan mit Schleife und Raute Umwandlung gelingt: ja merkt den Wert, nein erhöht den Zähler, beide Wege zurück vor die Schleife; daneben ein Traceback, dessen letzte Zeile hervorgehoben wird, und ein Code-Ausschnitt mit try und except.",
]
