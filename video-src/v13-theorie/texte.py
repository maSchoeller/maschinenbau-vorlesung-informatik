"""Sprechertext V13 Theorie (Quelltext mit Markup)."""
SRC = [
 ["Eine Maschine wurde zehn Sekunden lang mit hunderttausend Messpunkten pro Sekunde überwacht. Das ergibt eine Million Messpunkte, und du willst den Effektivwert der Schwingung.",
  "Zwei Wege zum gleichen Ergebnis: eine Python-Schleife und eine NumPy-Rechnung.",
  "Wie viel schneller? Das zeigt nur die Stoppuhr. Aber vorher kannst du schätzen, und das üben wir heute."],
 ["Die Laufzeit hängt davon ab, wie viele Schritte ein Programm macht. Eine Schleife über alle Daten braucht [[n|en]] Schritte. Doppelt so viele Daten, doppelt so viele Schritte: linear.",
  "Viel schneller wächst es bei einer Schleife in einer Schleife, also wenn jedes Element mit jedem verglichen wird. Beispiel: Kollisionsprüfung von Bohrungen.",
  "Bei [[n|en]] Bohrungen gibt es [[n·(n−1)/2|n mal n minus eins durch zwei]] Paare. Zehntausend Bohrungen ergeben knapp fünfzig Millionen Paare. Doppelt so viele Bohrungen, ungefähr viermal so viele Schritte: Das ist quadratisch."],
 ["Aus der Schrittzahl wird eine Zeit, wenn du das Tempo kennst. Die Größenordnungen: Ein Prozessortakt dauert unter einer Nanosekunde, und eine Python-Anweisung grob eine zehntel Mikrosekunde.",
  "Ingenieurmäßig überschlagen: Eine Million Schleifendurchläufe mal eine zehntel Mikrosekunde sind eine zehntel Sekunde. Fünfzig Millionen Paare sind fünf Sekunden. Hunderttausend Bohrungen sind fünf Milliarden Paare, rund acht Minuten. Alles Faustwerte, kein Messwert.",
  "Ein hundertfach schnellerer Rechner ist aufgebraucht, sobald die Daten auf das Zehnfache wachsen, denn dann braucht jeder mit jedem das Hundertfache. Ein besserer Algorithmus bringt dort mehr."],
 ["Warum ist NumPy schneller? Erstens: Ein Befehl bearbeitet das ganze Array. `a * 2` verdoppelt alle Werte, ohne dass du eine Schleife schreibst.",
  "Zweitens: Die Rechnung läuft in vorübersetztem [[C-Code|Ze-Code]]. Der Interpreter muss nicht bei jedem Element nachsehen, welche Objekte vor ihm liegen.",
  "Drittens: Die Zahlen liegen dicht im Speicher, alle vom gleichen Typ. Eine Liste dagegen besteht aus Verweisen auf einzelne Objekte.",
  "Die Rechenoperationen sind dieselben. NumPy spart die Verwaltungsarbeit je Element, und die summiert sich bei einer Million Werten."],
 ["Zeit misst du mit `time.perf_counter`. Du liest die Uhr vor und nach dem Code, die Differenz ist die Dauer.",
  "Doch jede Messung schwankt: Andere Programme laufen, der Takt ändert sich, Zwischenspeicher sind leer. Störungen machen die Messung nur länger, nie kürzer.",
  "Darum: mehrfach messen, Minimum oder Median berichten, nicht den Mittelwert. Nur die Rechnung in den Messbereich. Und nie eine Zeit als Naturkonstante behaupten."],
 ["Merke: Erst die Schrittzahl senken, dann die Zeit je Schritt. Schleife über alle Daten ist linear, jeder mit jedem ist quadratisch.",
  "Eine NumPy-Operation auf dem ganzen Array schlägt die Python-Schleife. Aber prüfe: Liste oder Array? Und Mittelwert der Quadrate, nicht Quadrat des Mittelwerts.",
  "Im Labor misst du selbst, und zwar mehrfach."],
]

SZENEN = [
 "Messkurve aus sehr vielen Punkten, die sich von links nach rechts aufbaut; rechts zwei Stoppuhren (Schleife, NumPy) mit Fragezeichen statt Zeiten; Einblendung 1 000 000 Messpunkte.",
 "Zwei Diagramme nebeneinander: Gerade für n Schritte, Parabel für n(n-1)/2 Paare; unten Bohrungsplatte mit Linien zwischen allen Bohrungspaaren, die Zahl der Linien wächst, wenn Bohrungen dazukommen; Einblendung 10 000 Bohrungen gleich 49 995 000 Paare.",
 "Größenordnungs-Leiter von ns bis Stunden auf einer Logarithmus-Achse mit Beispielen; darunter die Überschlagsrechnung 10^6 mal 10^-7 s gleich 0,1 s; rote Marke wandert bei 5 Milliarden Paaren auf rund 8 Minuten.",
 "Animation Schleife gegen Vektor: oben ein Zeiger läuft über verstreute Listenelemente einzeln, unten leuchtet ein lückenloser Array-Block mit a * 2 in einem Schritt auf; Zähler Durchläufe gegen 1 Aufruf.",
 "Code-Ausschnitt start = time.perf_counter() und dauer = time.perf_counter() - start; darunter Punktdiagramm mit zehn Messungen, zwei Ausreißer; Minimum, Median und Mittelwert als farbige Linien.",
 "Drei Merkkarten nacheinander: Schrittzahl linear gegen quadratisch, Vektor gegen Schleife, Zeit mehrfach messen; am Ende der Hinweis Weiter ins Labor.",
]
