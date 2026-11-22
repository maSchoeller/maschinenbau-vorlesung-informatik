"""Sprechertext V13 Beispiel (Quelltext mit Markup). Erklärt genau briefing/v13-beispiel.py."""
SRC = [
 ["Wir berechnen den Effektivwert einer Schwingung mit einer Million Messpunkten, zweimal: mit einer Schleife und mit NumPy. Dabei messen wir die Zeit.",
  "Zeile 4 bis 6 laden `math`, `time` und [[numpy|Nampei]] als [[np|en pe]]. Zeile 8 bis 10: [[N|großes N]] ist eine Million, die Frequenz ist fünfzig Hertz, die Amplitude zwei Millimeter pro Sekunde."],
 ["Variante eins, Zeile 13 bis 22. Zeile 13 liest die Stoppuhr. Die erste Schleife, Zeile 15 bis 17, berechnet für jeden Punkt die Zeit und den Messwert und hängt ihn an die Liste `werte`.",
  "Die zweite Schleife, Zeile 19 und 20, summiert die Quadrate. Zeile 21: Wurzel aus der Summe geteilt durch [[N|großes N]], das ist der Effektivwert. Zeile 22 liest die Uhr noch einmal, nachher minus vorher ist die Dauer."],
 ["Variante zwei, Zeile 25 bis 29. Zeile 25 liest wieder die Stoppuhr. Dann erzeugt [[np.arange|en pe punkt a range]] mit [[N|großes N]] in Zeile 26 alle Zeitpunkte auf einmal, geteilt durch hunderttausend.",
  "Zeile 27 berechnet alle Messwerte in einem Ausdruck: [[np.sin|en pe punkt sinus]] und das Malzeichen wirken auf jedes Element.",
  "Zeile 28 ist der Effektivwert in einer Zeile: `v ** 2` quadriert jedes Element, [[np.mean|en pe punkt mean]] mittelt, [[np.sqrt|en pe punkt Wurzel]] zieht die Wurzel. Zeile 29 liest die Uhr."],
 ["Jetzt die Ausgabe, Zeile 31 bis 34. Beide Wege liefern [[1,4142|eins Komma vier eins vier zwei]] Millimeter pro Sekunde.",
  "Das stimmt mit der Theorie in Zeile 33 überein: Die Amplitude zwei durch Wurzel zwei ist ebenfalls [[1,4142|eins Komma vier eins vier zwei]]."],
 ["Die Zeiten in den Ausgaben unterscheiden sich, und sie sind bei jedem Lauf und auf jedem Rechner anders. Sie hängen vom Rechner ab, darum miss selbst.",
  "Der Faktor in der letzten Zeile ist nur ein Messwert, keine Naturkonstante. Führe das Programm mehrfach aus und berichte das Minimum.",
  "Und prüfe immer zuerst: Liefern beide Wege denselben Effektivwert? Erst dann zählt der Zeitvergleich."],
]

SZENEN = [
 "Titelfolie mit Schwingungskurve und der Zahl 1 000 000; darunter die Zeilen 4 bis 10 des Codes, Zeilen 4 bis 6 und 8 bis 10 nacheinander hervorgehoben.",
 "Code Zeile 12 bis 22, Zeile für Zeile hervorgehoben; rechts wächst die Liste werte als Balkenreihe, die Summe der Quadrate und die Dauer als Zahl; Stoppuhr-Symbol bei Zeile 13 und 22.",
 "Code Zeile 24 bis 29; die drei Arrays t, v und v ** 2 als farbige Datenblöcke, die in einem Schritt aufleuchten; Stoppuhr-Symbol bei Zeile 25 und 29.",
 "Code Zeile 31 bis 34 und Konsole mit den Ausgabezeilen; die drei Zahlen 1.4142 werden mit einem grünen Gleichheitszeichen verbunden.",
 "Konsole mit den Zeiten (mit Hinweis variiert bei jedem Lauf) und die Zeile NumPy ist etwa so viel mal schneller; Einblendung Minimum aus mehreren Läufen berichten und Ergebnis vergleichen, bevor die Zeit zählt.",
]
