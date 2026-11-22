"""Sprechertext V14 Theorie (Quelltext mit Markup)."""
SRC = [
 ["In der Qualitätsrunde zeigt jemand ein Diagramm: Drehmaschine B hat doppelt so viel Ausschuss wie Maschine A.",
  "Die Runde will B stilllegen.",
  "Die Zahlen: [[2,25 %|zwei Komma zwei fünf Prozent]] für A und [[2,50 %|zwei Komma fünf null Prozent]] für B.",
  "Die y-Achse beginnt bei zwei, und der Achsentitel fehlt. Beginnt sie bei null, wirkt B nur [[1,1-mal|eins Komma eins mal]] so hoch. Dieselben Zahlen, ein anderer Eindruck."],
 ["Zuerst die Frage, dann die Diagrammart. Eine Linie zeigt einen Verlauf über der Zeit.",
  "Punkte zeigen den Zusammenhang zweier Größen, wenn die Proben unabhängig sind.",
  "Balken vergleichen Kategorien. Ein Histogramm zeigt eine Verteilung, zum Beispiel von 200 Wellendurchmessern.",
  "Vorsicht bei der Linie: Sie behauptet eine Reihenfolge und einen stetigen Verlauf dazwischen."],
 ["Jede Achse braucht die Größe, das Formelzeichen und die Einheit. Zum Beispiel: Zeit t in [[s|Sekunden]].",
  "Dazu kommt ein Titel, und bei mehreren Kurven eine Legende.",
  "Eine Zahl ohne Einheit ist keine Information. Ob fünf Millimeter oder fünf Meter gemeint sind, sieht man dem Diagramm sonst nicht an."],
 ["Der Computer kennt nur Pixel. Deine Datenkoordinaten rechnet er linear um: Achsengrenzen werden auf einen Pixelbereich abgebildet.",
  "Beispiel: Die x-Achse läuft von null bis zehn Sekunden, auf den Pixeln 50 bis 450. Dann liegt t gleich vier Sekunden bei Pixel 210.",
  "Bei y zählt das Pixel von oben, die Richtung dreht sich also um: Größere Werte liegen bei kleineren Pixelzahlen.",
  "Andere Grenzen heißen: dieselben Zahlen an anderen Pixeln. Punkte außerhalb verschwinden ohne Meldung."],
 ["Vor jedem Diagramm gehst du eine Checkliste durch: Achse abgeschnitten? Einheit fehlt? Seitenverhältnis gestreckt? Nur ein Ausschnitt gezeigt?",
  "Beim Vergleich zweier Diagramme gleiche Skala, dazu die passende Art, und die Quelle samt Menge der Daten. Ein schöner Verlauf aus drei Messwerten ist kein Beleg.",
  "Farbe ist nie der einzige Unterschied. Etwa jeder zwölfte Mann hat eine Rot-Grün-Schwäche."],
 ["Ein Diagramm ist eine Aussage, und du verantwortest sie.",
  "Eine [[KI|Ka I]] zeichnet gern schön statt ehrlich. Prüfe ihr Diagramm mit der Checkliste.",
  "Ab heute läuft dein Projekt, in Zweiergruppen. In den letzten 30 Minuten jedes Termins arbeitest du daran, mit Copilot.",
  "Präsentiert wird in [[V22|V zweiundzwanzig]]."],
]

SZENEN = [
 "Balkendiagramm Ausschussquote A 2,25 % und B 2,50 % mit y-Achse ab 2,0 ohne Achsentitel (B wirkt doppelt so hoch); dann dieselben Balken mit Achse ab 0 (nur 1,1-mal).",
 "Vier Kacheln mit kleinen gezeichneten Diagrammen: Linie, Punkte, Balken, Histogramm, jeweils mit Frage; bei der Linie ein Hinweis auf Reihenfolge und stetigen Verlauf.",
 "Ein Diagramm baut sich auf: erst Zahlen ohne Beschriftung, dann Achsentitel Zeit t in s, Titel und Legende; Hinweis Zahl ohne Einheit ist keine Information.",
 "Zahlenstrahl 0 bis 10 s über Pixelachse 50 bis 450 mit Rechnung für t = 4 s (Pixel 210); y-Achse zählt von oben; zweites Raster mit anderen Grenzen, ein Punkt fällt heraus.",
 "Checkliste mit sieben Punkten, Haken erscheinen nacheinander; daneben zwei Linien, nur durch Farbe unterscheidbar, dann mit Linienstil und Beschriftung.",
 "Diagramm als Aussage mit Verantwortungsschild; KI-Diagramm mit abgeschnittener Achse; Projektkarte mit Zweiergruppen, 30 Minuten und Präsentation in V22.",
]
