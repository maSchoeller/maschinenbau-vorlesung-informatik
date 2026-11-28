"""Sprechertext Termin 06, Video 3: Vorgerechnet: Kino (Quelltext mit Markup)."""
SRC = [
 ["Die Aufgabe: Ein Kinosaal hat Reihen mit Plätzen. Das Programm liest die Zahl der Reihen und die Plätze je Reihe ein, beide mindestens 1.",
  "Dann fragt es für jeden Platz, Reihe für Reihe: 1 heißt belegt, 0 heißt frei. Am Ende gibt es aus, wie viele Plätze belegt sind, zum Beispiel: Belegt: 4 von 6.",
  "In jeder Reihe jeder Platz: Das sind zwei Schleifen, eine in der anderen."],
 ["Zeichne zuerst den Plan. Zwei Eingaben: reihen und plaetze. Der Zähler belegt startet bei 0.",
  "Die äußere Raute fragt: [[i von 1 bis reihen|i von eins bis reihen]], gibt es noch eine Reihe? Bei ja kommt die innere Raute: [[j von 1 bis plaetze|j von eins bis plaetze]], gibt es noch einen Platz?",
  "Im inneren Rumpf liest du einen Platz ein. Die Entscheidung fragt: platz gleich 1? Bei ja wird belegt um 1 größer. Dann geht es zurück zur inneren Raute.",
  "Ist die Reihe fertig, geht es zurück zur äußeren Raute. Sind alle Reihen durch, wird gerechnet und ausgegeben."],
 ["Jetzt der Code. Die beiden Eingaben und `belegt = 0` stehen ganz oben.",
  "Aus der äußeren Raute wird [[for i in range(1, reihen + 1)|fohr i in rehndsch von eins, reihen plus eins]]. Aus der inneren wird [[for j in range(1, plaetze + 1)|fohr j in rehndsch von eins, plaetze plus eins]], eingerückt im Rumpf der äußeren.",
  "Im inneren Rumpf stehen die Eingabe, mit `i` und `j` in der Frage, und das `if`. Es steht noch einmal weiter eingerückt.",
  "Merke dir drei Stellen. Vor beiden Schleifen steht der Startwert. Im inneren Rumpf wird eingelesen und gezählt. Nach beiden Schleifen wird gerechnet und ausgegeben."],
 ["Die Probe mit 2, 3 und den Plätzen 1, 0, 1, 1, 1, 0.",
  "Reihe 1: Platz 1 ist belegt, der Zähler steht bei 1. Platz 2 ist frei. Platz 3 ist belegt, der Zähler steht bei 2.",
  "Reihe 2: Platz 1 und 2 sind belegt, der Zähler steht bei 4. Platz 3 ist frei.",
  "Beide Schleifen sind fertig: 4 von 6 Plätzen sind belegt."],
 ["Der Grenzfall: eine Reihe, ein Platz. Du gibst 1, 1 und 1 ein.",
  "Beide Schleifen laufen genau einmal. Das Programm gibt aus: Belegt: 1 von 1.",
  "Jetzt du: Schieb `belegt = 0` in den Rumpf der äußeren Schleife. Was passiert mit den Eingaben von eben?"],
]

SZENEN = [
 "Ein Kinosaal von oben: 2 Reihen mit je 3 Sitzen, einige belegt (1) und einige frei (0); der Auftragstext: Reihen und Plätze einlesen, jeden Platz abfragen, belegte zählen; daneben: in jeder Reihe jeder Platz, also zwei Schleifen ineinander.",
 "Der Plan baut sich auf: Eingabe reihen, Eingabe plaetze, belegt = 0, Raute i von 1 bis reihen?, Raute j von 1 bis plaetze?, Eingabe platz, Raute platz == 1?, belegt = belegt + 1; Rücksprünge innen und außen; nein: gesamt = reihen * plaetze, Ausgabe, Ende.",
 "Links der Plan, rechts der Code mit zehn Zeilen; Zeile für Zeile wird der passende Planteil markiert; am Ende drei farbige Rahmen: vor beiden Schleifen, im inneren Rumpf, nach beiden Schleifen.",
 "Links der Sitzplan mit 2 mal 3 Plätzen, der sich Platz für Platz füllt; rechts eine Tabelle mit den Spalten i, j, platz, belegt, sechs Zeilen; unten die Ausgabe Belegt: 4 von 6.",
 "Der Sitzplan mit nur einem Platz; Eingaben 1, 1, 1; Ausgabe Belegt: 1 von 1; Auftrag: belegt = 0 in den äußeren Rumpf schieben und ausprobieren (das Ergebnis wird nicht verraten).",
]
