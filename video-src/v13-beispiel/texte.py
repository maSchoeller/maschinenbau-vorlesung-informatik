"""Sprechertext V13 Beispiel (Quelltext mit Markup). Erklärt genau briefing/v13-beispiel.py."""
SRC = [
 ["Wir berechnen den Effektivwert einer Schwingung mit einer Million Messpunkten, zweimal: mit einer Schleife und mit NumPy. Dabei messen wir die Zeit.",
  "Zeile 4 bis 6 laden `math`, `time` und `numpy` als `np`. Zeile 8 bis 10: [[N|große N]] ist eine Million, die Frequenz ist fünfzig Hertz, die Amplitude zwei Millimeter pro Sekunde."],
 ["Variante eins, Zeile 13 bis 22. Zeile 13 liest die Stoppuhr. Die erste Schleife berechnet für jeden Punkt die Zeit und den Messwert und hängt ihn an die Liste `werte`.",
  "Die zweite Schleife summiert die Quadrate. Dann Wurzel aus der Summe geteilt durch [[N|große N]]: das ist der Effektivwert. Zeile 22 liest die Uhr noch einmal, nachher minus vorher ist die Dauer."],
 ["Variante zwei, Zeile 25 bis 29. `np.arange` mit [[N|große N]] erzeugt alle Zeitpunkte auf einmal, geteilt durch hunderttausend.",
  "Zeile 27 berechnet alle Messwerte in einem Ausdruck: `np.sin` und das Malzeichen wirken auf jedes Element.",
  "Zeile 28 ist der Effektivwert in einer Zeile: `v ** 2` quadriert jedes Element, `np.mean` mittelt, `np.sqrt` zieht die Wurzel."],
 ["Jetzt die Ausgabe, Zeile 31 bis 34. Beide Wege liefern [[1,4142|eins Komma vier eins vier zwei]] Millimeter pro Sekunde.",
  "Das stimmt mit der Theorie überein: Die Amplitude zwei durch Wurzel zwei ist ebenfalls eins Komma vier eins vier zwei."],
 ["Die Zeiten unterscheiden sich, und sie sind bei jedem Lauf anders. Auf einem normalen Rechner braucht die Schleife grob eine bis zwei Sekunden, NumPy einen Bruchteil davon. Im Browser sind beide langsamer.",
  "Der Faktor in der letzten Zeile ist nur ein Messwert, keine Naturkonstante. Führe das Programm mehrfach aus und berichte das Minimum.",
  "Und prüfe immer zuerst: Liefern beide Wege denselben Effektivwert? Erst dann zählt der Zeitvergleich."],
]

SZENEN = [
 "Titelfolie mit Schwingungskurve und der Zahl 1 000 000; rechts die Zeilen 4 bis 10 des Codes, Zeilen 4 bis 6 und 8 bis 10 nacheinander hervorgehoben.",
 "Code Zeile 12 bis 22, Zeile für Zeile hervorgehoben; links wächst die Liste werte als Balkenreihe, rechts die Summe der Quadrate als Zahl; Stoppuhr-Symbol bei Zeile 13 und 22.",
 "Code Zeile 24 bis 29; die drei Arrays t, v und v ** 2 als farbige Datenblöcke, die in einem Schritt aufleuchten; Stoppuhr-Symbol bei Zeile 25 und 29.",
 "Konsole mit den Ausgabezeilen 1 und 2 und Theoriewert; die zwei Zahlen 1.4142 werden mit einem grünen Gleichheitszeichen verbunden.",
 "Konsole mit den Zeiten (mit Hinweis variiert bei jedem Lauf) und die Zeile NumPy ist etwa so viel mal schneller; Einblendung Minimum aus mehreren Läufen berichten und Ergebnis vergleichen, bevor die Zeit zählt.",
]
