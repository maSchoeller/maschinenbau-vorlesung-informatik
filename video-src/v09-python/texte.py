"""Sprechertext Termin 09, Video 2: Python-Werkzeugkasten: random und Programme gliedern (Quelltext mit Markup). Nur Text, noch nicht vertont."""
SRC = [
 ["Zwei Karten für deinen Werkzeugkasten.",
  "Karte 1 zeigt [[random|rändom]]. Damit zieht der Rechner eine Zufallszahl. Karte 2 zeigt, wie du ein Programm in Funktionen gliederst.",
  "Alles aus den Terminen zwei bis acht gilt weiter."],
 ["Karte 1 beginnt mit [[import random|import rändom]]. Das steht ganz oben und holt das Werkzeug für den Zufall ins Programm.",
  "[[random.randint(1, 100)|rändom punkt rand-int von eins bis hundert]] zieht eine ganze Zahl von 1 bis 100. Beide Grenzen gehören dazu: Die 1 ist möglich, die 100 auch. Bei [[range|rehndsch]] ist das anders: Dort gehört der Stoppwert nicht dazu.",
  "Die Zahl landet in [[zahl|zahl]], und [[print|print]] zeigt sie an. Bei jedem Lauf kommt eine andere Zahl.",
  "Fehlt die Zeile mit [[import|import]], meldet Python einen [[NameError|neim-Error]]: Der Name [[random|rändom]] ist nicht bekannt.",
  "Diese zwei Zeilen musst du in der Klausur ohne Vorlage schreiben können."],
 ["Karte 2 gliedert ein Programm. Oben stehen die Funktionen. [[frage|frage]] liest eine Zahl ein und gibt sie zurück. [[melde|melde]] zeigt ein Ergebnis an.",
  "Darunter steht das Hauptprogramm. Es ruft [[frage|frage]] zweimal auf und gibt die Summe an [[melde|melde]] weiter. Die Funktionen stehen oben, damit Python sie kennt, wenn das Hauptprogramm sie aufruft.",
  "Mit den Eingaben 3 und 4 steht da: Ergebnis 7."],
 ["Schau, wie die Werte wandern. Der Aufruf [[frage(\"Erste Zahl: \")|frage von erste Zahl]] liefert 3, und [[a|a]] bekommt diesen Wert. Der zweite Aufruf liefert 4 für [[b|b]].",
  "Dann steht in [[melde(a + b)|melde von a plus b]] die Summe 7, und [[melde|melde]] zeigt sie an.",
  "Das Hauptprogramm liest sich wie die Beschreibung der Aufgabe. Funktionen oben, Hauptprogramm unten. Eine Funktion, eine Aufgabe."],
]

SZENEN = [
 "Zwei Karten nebeneinander: 1 random (Zufallszahl ziehen), 2 Programm in Funktionen gliedern; die bekannten Karten aus den Terminen 02 bis 08 liegen blass dahinter.",
 "Karte 1: Code import random, zahl = random.randint(1, 100), print(zahl) mit einer Beispielausgabe; Hinweis: beide Grenzen gehören dazu; daneben die Fehlermeldung NameError, wenn import fehlt.",
 "Karte 2: Code mit den Funktionen frage und melde und dem Hauptprogramm; Eingabe 3 und 4; Ausgabe Ergebnis: 7; Funktionen oben, Hauptprogramm unten markiert.",
 "Die Werte wandern: frage liefert 3, dann 4; a ist 3, b ist 4; a + b ist 7 und geht an melde; Merksatz Eine Funktion, eine Aufgabe.",
]
