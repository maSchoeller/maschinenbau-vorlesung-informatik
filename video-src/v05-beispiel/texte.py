"""Sprechertext Termin 05, Video 3: Vorgerechnet: Pendelzeit (Quelltext mit Markup)."""
SRC = [
 ["Die Aufgabe: Du hast an einigen Tagen gemessen, wie lange du zur Hochschule brauchst. Das Programm liest zuerst ein, an wie vielen Tagen du gemessen hast, mindestens 1.",
  "Dann liest es die Minuten jedes Tages ein, als ganze Zahlen. Am Ende gibt es den Durchschnitt aus.",
  "Wie oft das passiert, steht nach der ersten Eingabe fest: n Mal. Deshalb nimmst du [[for|fohr]]."],
 ["Zeichne zuerst den Plan. Eingabe: n. Die Summe startet bei 0.",
  "Dann kommt die Raute. Sie fragt: [[i von 1 bis n|i von eins bis n]], gibt es noch einen Tag?",
  "Bei ja läuft der Rumpf: Eingabe der Minuten, die Summe wird größer, und der Pfeil führt zurück zur Raute. Bei nein geht es weiter: Der Durchschnitt ist die Summe geteilt durch n, dann die Ausgabe."],
 ["Jetzt der Code, Symbol für Symbol. Die Eingabe von n wird `int(input(...))`.",
  "Aus der Raute wird [[for i in range(1, n + 1)|fohr i in rehndsch von eins, n plus eins]]. Das Plus eins steht dort, weil der Stoppwert nicht dazugehört.",
  "Im Rumpf stehen die Eingabe der Minuten und die Summe. Das `i` steckt in der Eingabeaufforderung: Minuten an Tag i.",
  "Merke dir drei Stellen. Vor der Schleife steht der Startwert der Summe. Im Rumpf wird eingelesen und addiert. Nach der Schleife wird geteilt und ausgegeben."],
 ["Die Probe mit 3, 25, 31 und 22. Die erste Eingabe ist 3: drei Tage.",
  "Tag 1: 25 Minuten, die Summe ist 25. Tag 2: 31 Minuten, die Summe ist 56. Tag 3: 22 Minuten, die Summe ist 78.",
  "Die Schleife ist zu Ende. 78 geteilt durch 3 ergibt 26. Das Programm gibt aus: Im Schnitt 26.0 Minuten."],
 ["Jetzt du: Gib 0 Tage ein. Was erwartest du?",
  "Die Schleife läuft nie, die Summe bleibt 0, und dann teilt das Programm durch 0.",
  "Python meldet einen `ZeroDivisionError`: division by zero. Durch 0 teilen geht nicht.",
  "Deshalb steht in der Aufgabe: mindestens [[1 Tag|ein Tag]]."],
]

SZENEN = [
 "Ein Wochenplan mit drei Tagen und Stoppuhr-Zeiten; der Auftragstext: n Tage einlesen, die Minuten jedes Tages einlesen, den Durchschnitt ausgeben; daneben: n Mal, also for.",
 "Der Plan baut sich auf: Eingabe n, summe = 0, Raute i von 1 bis n?, Rumpf Eingabe minuten und summe = summe + minuten, Pfeil zurück zur Raute; nein: mittel = summe / n, Ausgabe mittel.",
 "Links der Plan klein, rechts der Code: n = int(input(...)), summe = 0, for i in range(1, n + 1):, eingerückt minuten = int(input(f\"Minuten an Tag {i}: \")) und summe = summe + minuten, dann mittel = summe / n und print; die drei Stellen vor, im und nach der Schleife werden farbig markiert.",
 "Lauf mit den Eingaben 3, 25, 31, 22: eine Tabelle mit den Spalten i, minuten, summe füllt sich: 1, 25, 25; 2, 31, 56; 3, 22, 78; dann 78 / 3 = 26.0; Ausgabe Im Schnitt 26.0 Minuten.",
 "Eingabe 0: die Schleife wird grau, die Summe bleibt 0, die Zeile mittel = summe / n leuchtet rot; Fehlermeldung ZeroDivisionError: division by zero; Hinweis: mindestens 1 Tag; Auftrag: Probier es selbst aus.",
]
