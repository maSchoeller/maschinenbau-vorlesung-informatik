"""Sprechertext V22 Beispiel (Quelltext mit Markup), genau briefing/v22-beispiel.py als Code-Walkthrough."""
SRC = [
 ["Das Prüfprotokoll einer Wellen-Charge. Die Spezifikation: Nennmaß 20 Millimeter, Toleranz plus minus 0,02 Millimeter.",
  "Zu dick heißt Nacharbeit, zu dünn heißt Ausschuss.",
  "Schritt eins, der Zweck: Das Programm ordnet jede Messung ein, zählt je Klasse und gibt den Gutanteil aus.",
  "Schritt zwei, Eingaben und Ausgaben: Hinein gehen Durchmesser in Millimeter, heraus kommen Text, Zähler und ein Prozentwert."],
 ["Der Plan der Funktion. Zuerst die Abweichung berechnen: Durchmesser minus Nennmaß.",
  "Erste Raute: Ist der Betrag der Abweichung höchstens die Toleranz? Wenn ja, ist die Welle gut.",
  "Wenn nein, die zweite Raute: Ist die Abweichung größer als null? Dann zu dick, also nacharbeit. Sonst zu dünn, also ausschuss."],
 ["Zeile 7 definiert `bewerte` mit Durchmesser und Standardwerten für Nennmaß und Toleranz.",
  "Zeile 9 berechnet die Abweichung. Zeile 10 prüft mit `abs` den Betrag. Liegt er innerhalb der Toleranz, gibt Zeile 11 gut zurück.",
  "Zeile 12 fragt nur noch nach der Richtung. Größer als null heißt nacharbeit, sonst gibt Zeile 15 ausschuss zurück.",
  "Das `abs` steht nur in der ersten Bedingung, denn dort zählt der Abstand. In der zweiten zählt das Vorzeichen."],
 ["Das Hauptprogramm. Zeile 18 legt die Messwerte an, Zeile 19 die Zähler, alle auf null.",
  "Die Schleife in Zeile 20 nimmt der Reihe nach jeden Messwert. Zeile 21 ruft `bewerte` auf, Zeile 22 erhöht den passenden Zähler um eins.",
  "Erster Durchlauf: 20,01 ist gut, der Zähler gut steht auf eins. 20,03 ist nacharbeit. 19,97 ist ausschuss.",
  "Dann 20,00 und 20,02, beide gut. Am Ende stehen die Zähler auf drei, eins und eins."],
 ["Zeile 23 druckt je Messwert eine Zeile mit zwei Nachkommastellen.",
  "Zeile 25 rechnet den Gutanteil: drei geteilt durch fünf mal hundert, das sind 60 Prozent.",
  "Zeile 26 druckt das Dictionary, Zeile 27 den Gutanteil ohne Nachkommastellen."],
 ["Jetzt Schritt vier, die Grenzfälle. Drei Tests prüfen die Grenzen: 19,98 ist gut, 20,025 ist nacharbeit, 19,975 ist ausschuss.",
  "Der vierte Fall ist heimtückisch: 25,1 minus 25,0 ergibt [[0.10000000000000142|null Komma eins, dann dreizehn Nullen und eins vier zwei]]. Das ist mehr als 0,1, die Welle gilt als nacharbeit statt gut.",
  "Der Grund steht in Vorlesung 3: Kommazahlen sind Binärbrüche. Merke: Grenzfälle immer als Test aufschreiben.",
  "Schritt fünf, Verbesserungen: die leere Liste abfangen und die Grenzprüfung gegen Rundungsfehler absichern."],
]

SZENEN = [
 "Messskala von 19,95 bis 20,05 Millimeter mit drei Zonen: ausschuss (rot, unter 19,98), gut (grün, 19,98 bis 20,02), nacharbeit (bernstein, über 20,02). Darunter zwei Karten: Schritt 1 Zweck und Schritt 2 Eingaben und Ausgaben.",
 "Programmablaufplan der Funktion bewerte: Start, Operation abweichung = d - nenn, Raute Betrag kleiner gleich tol (ja: gut), Raute größer null (ja: nacharbeit, nein: ausschuss); Gruppen werden nacheinander farbig hervorgehoben, rechts kurze Notizen.",
 "Code Zeile 7 bis 15 (bewerte) mit Zeilennummern; je Satz werden die genannten Zeilen hervorgehoben; rechts zwei Karten: abs gleich Abstand, elif gleich Richtung.",
 "Code Zeile 18 bis 23 links, rechts die Variablentabelle mit den fünf Durchläufen (d, ergebnis, drei Zähler), Zeile für Zeile aufgebaut; am Ende der Stand der Zähler 3, 1, 1.",
 "Code Zeile 23 und 25 bis 27; darunter die echte Ausgabe des Programms in einer Konsole; eine Karte rechnet 3 / 5 · 100 = 60 Prozent.",
 "Code Zeile 33 bis 38 mit den vier asserts; drei grüne Häkchen-Chips, der vierte Chip rot: 25.1 - 25.0 = 0.10000000000000142 größer als 0.1; zum Schluss zwei Verbesserungskarten.",
]
