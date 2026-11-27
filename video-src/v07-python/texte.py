"""Sprechertext Termin 07, Video 2: Python-Werkzeugkasten: hoch (nur lesen), def, return, type und round (Quelltext mit Markup)."""
SRC = [
 ["Vier Karten für deinen Werkzeugkasten.",
  "Karte 1 zeigt [[**|zwei Sterne]]: hoch. Karte 2 zeigt [[def|deff]], damit baust du eigene Befehle. Karte 3 zeigt [[return|rietörn]], damit gibt eine Funktion einen Wert zurück.",
  "Karte 4 zeigt [[type|teip]] und [[round|raund]]. Alles aus den Terminen zwei bis sechs gilt weiter."],
 ["Karte 1 ist nur zum Lesen. Zwei Sterne heißen hoch. [[2 ** 8|zwei hoch acht]] ergibt 256. Das ist die Zahl der Werte eines Bytes.",
  "[[2 ** 16|zwei hoch sechzehn]] ergibt 65536.",
  "Die dritte Zeile ist [[2 ** 64 + 1|zwei hoch vierundsechzig plus eins]]. Das Ergebnis ist [[18446744073709551617|eine Zahl mit zwanzig Stellen]]. In ein Feld mit 64 Bit passt das nicht, Python rechnet trotzdem richtig.",
  "Selbst schreiben musst du die zwei Sterne nicht. Du liest sie nur."],
 ["Karte 2 baut eine eigene Funktion. Mit [[def|deff]] legst du sie an: das Wort [[def|deff]], der Name, eine Klammer mit dem Parameter und ein Doppelpunkt.",
  "Der Rumpf steht eingerückt darunter. In der Zeile mit [[def|deff]] läuft noch nichts. Erst der Aufruf führt den Rumpf aus.",
  "Du rufst [[begruessen(\"Lea\")|begrüßen von Lea]] auf, dann [[begruessen(\"Tom\")|begrüßen von Tom]]. Der Parameter [[name|nehm]] ist beim ersten Mal Lea, beim zweiten Mal Tom. Die Ausgabe sind zwei Grüße.",
  "Zuerst definieren, dann aufrufen. Und beim Aufruf stehen die Klammern, sonst passiert nichts."],
 ["Karte 3 gibt einen Wert zurück. Die Funktion [[quadrat|kwadrat]] rechnet [[x * x|x mal x]] und gibt es mit [[return|rietörn]] zurück.",
  "Der Aufruf [[quadrat(4)|quadrat von vier]] wird durch das Ergebnis 16 ersetzt. Das landet in der Variablen [[ergebnis|ergebnis]], und [[print|print]] zeigt es an.",
  "Steht in der Funktion [[print|print]] statt [[return|rietörn]], zeigt sie die 16 an, gibt aber nichts zurück. In [[ergebnis|ergebnis]] steht dann [[None|none]], das heißt nichts.",
  "Merke dir: Anzeigen mit [[print|print]], Weitergeben mit [[return|rietörn]]."],
 ["Karte 4 hat zwei Werkzeuge. [[type|teip]] nennt den Datentyp. Die Zahl 42 ist ein [[int|int]], eine ganze Zahl.",
  "[[7 / 2|sieben geteilt durch zwei]] ist ein [[float|floht]], eine Kommazahl. Der Schrägstrich ergibt immer eine Kommazahl.",
  "[[round|raund]] rundet. [[round(0.1 + 0.2, 2)|round von null komma eins plus null komma zwei, zwei]] rundet auf 2 Nachkommastellen und ergibt 0.3. Der Vergleich mit 0.3 ist dann [[True|truh]].",
  "So vergleichst du Kommazahlen: erst runden, dann vergleichen."],
]

SZENEN = [
 "Vier Karten nebeneinander: 1 hoch (nur lesen), 2 def, 3 return, 4 type und round; die bekannten Karten aus den Terminen 02 bis 06 liegen blass dahinter.",
 "Karte 1: Code print(2 ** 8), print(2 ** 16), print(2 ** 64 + 1) mit den Ausgaben 256, 65536, 18446744073709551617; Hinweis: nur lesen; 2 ** 8 als Zahl der Werte eines Bytes.",
 "Karte 2: Code der Funktion begruessen mit def, Parameter name, eingerücktem Rumpf und zwei Aufrufen; die Teile def, Name, Parameter, Doppelpunkt, Rumpf sind beschriftet; Ausgabe Hallo Lea! und Hallo Tom!.",
 "Karte 3: Code der Funktion quadrat mit return, Aufruf, ergebnis, print; Ausgabe 16; darunter die Variante mit print statt return mit Ausgabe 16 und None; Merksatz Anzeigen mit print, Weitergeben mit return.",
 "Karte 4: Code print(type(42)), print(type(7 / 2)), print(round(0.1 + 0.2, 2) == 0.3) mit den Ausgaben <class 'int'>, <class 'float'>, True; Hinweis: erst runden, dann vergleichen.",
]
