"""Sprechertext Termin 05, Video 2: Python-Werkzeugkasten: for, range, if ohne else (Quelltext mit Markup)."""
SRC = [
 ["Zwei neue Karten für deinen Werkzeugkasten.",
  "Karte 1 heißt [[for|fohr]] und [[range|rehndsch]]. Damit wiederholst du etwas, wenn vorher feststeht, wie oft.",
  "Karte 2 ist `if` ohne [[else|els]]. Damit tust du etwas nur dann, wenn eine Bedingung stimmt, und sonst nichts."],
 ["Karte 1 zeigt [[for i in range(1, 4)|fohr i in rehndsch von eins, vier]] mit einem Doppelpunkt am Ende. Darunter, eingerückt, steht der Rumpf mit `print(i)`.",
  "Die Variable `i` nimmt nacheinander die Werte 1, 2 und 3 an. Bei jedem Wert läuft der Rumpf einmal.",
  "Der Stoppwert 4 fehlt. Er gehört nicht dazu: Der Zähler hört vor dem Stoppwert auf.",
  "Die Ausgabe ist also 1, 2, 3. Es sind drei Durchläufe, nämlich 4 minus 1."],
 ["Gibst du nur einen Wert an, zählt [[range|rehndsch]] ab 0. [[range(4)|rehndsch von vier]] liefert 0, 1, 2 und 3.",
  "Das sind vier Durchläufe, und die 4 selbst fehlt wieder.",
  "Mit zwei Werten legst du den Start selbst fest. Mit einem Wert beginnt es immer bei 0.",
  "Die Faustregel: Steht die Zahl der Durchläufe vorher fest, nimmst du [[for|fohr]]. Hängt sie von etwas ab, das sich erst unterwegs ändert, nimmst du [[while|weil]]."],
 ["Karte 2: `if` ohne [[else|els]]. Die Punkte sind 9.",
  "Die Zeile `if punkte >= 8:` fragt, ob die Punkte mindestens 8 sind. Ist das wahr, läuft der eingerückte Teil und gibt gut aus.",
  "Darunter steht eine Zeile ohne Einrückung: weiter. Sie läuft immer."],
 ["Mit 9 Punkten erscheinen gut und weiter.",
  "Setze die Punkte auf 5. Die Bedingung ist falsch, der Rumpf wird übersprungen, und es erscheint nur weiter.",
  "Es gibt keinen [[else-Zweig|els-Zweig]], also passiert bei falsch nichts. Das Programm geht unter dem `if` einfach weiter.",
  "Probier beide Karten aus und ändere die Werte."],
]

SZENEN = [
 "Zwei Karten vorn: for und range: genau so oft, und if ohne else: nur wenn; die bekannten Karten aus Termin 04 (while, !=, not) liegen blass dahinter.",
 "Karte 1: Code for i in range(1, 4): mit eingerücktem print(i); der Rumpf ist farbig hinterlegt; daneben eine Zahlenreihe 1, 2, 3 mit einem Pfeil, die 4 steht gestrichelt und durchgestrichen; Ausgabe 1, 2, 3.",
 "range(4) mit der Zahlenreihe 0, 1, 2, 3 und der gestrichelten 4; daneben range(1, 4) zum Vergleich; unten die Faustregel: steht die Zahl fest: for; hängt sie von etwas ab: while.",
 "Karte 2: Code punkte = 9, if punkte >= 8:, eingerückt print(\"gut\"), darunter ohne Einrückung print(\"weiter\"); die Bedingung leuchtet grün; Ausgabe gut, weiter.",
 "Derselbe Code mit punkte = 5: die Bedingung leuchtet rot, der Rumpf wird grau; Ausgabe nur weiter; Hinweis: kein else, bei falsch passiert nichts; Auftrag: Probier beide Karten aus.",
]
