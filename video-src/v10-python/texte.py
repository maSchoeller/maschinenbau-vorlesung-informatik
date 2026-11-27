"""Sprechertext Termin 10, Video 2: Python-Werkzeugkasten: Mehr als ein Grund zum Aufhören (Quelltext mit Markup)."""
SRC = [
 ["Drei Karten für dein Zahlenraten.",
  "Karte 1 zeigt eine Schleife mit [[and|änd]]. Sie endet aus zwei Gründen. Karte 2 liest Text ein und fragt: Noch einmal? Karte 3 berechnet die Mitte mit [[int|int]].",
  "Alles aus den Terminen zwei bis neun gilt weiter."],
 ["Karte 1. Das Programm liest Tipps, bis der Tipp 5 stimmt. Nach drei Versuchen ist aber auch Schluss.",
  "Die Schleife läuft nur weiter, wenn beide Bedingungen stimmen: [[geraten != 5|geraten ungleich fünf]] [[and|änd]] [[versuche < 3|versuche kleiner drei]]. Ist eine falsch, endet sie.",
  "Du tippst 1, 2 und 3. Dann ist die Schleife vorbei, und das Programm zeigt 3. Du tippst gleich 5? Dann endet sie nach einem Versuch, und es steht 1 da.",
  "Merke dir: [[and|änd]] heißt, beide Bedingungen müssen stimmen."],
 ["Karte 2. Hier fragt das Programm nach einem Wort. Ein Tipp ist eine Zahl, hier ist es Text.",
  "Die Variable [[weiter|weiter]] beginnt mit [[\"ja\"|ja in Anführungszeichen]]. Die Schleife läuft, solange [[weiter == \"ja\"|weiter ist gleich ja]] gilt.",
  "In jeder Runde zeigt das Programm Runde und fragt: Noch einmal? Du tippst ja, ja und dann nein. Dreimal steht Runde da, und beim Wort nein endet die Schleife.",
  "[[input|input]] liefert immer Text. Du vergleichst darum Text mit Text, ohne [[int|int]]."],
 ["Karte 3 berechnet die Mitte zwischen zwei Zahlen. Das brauchst du für die Knobelaufgabe.",
  "Die Mitte von 1 und 100 ist [[(1 + 100) / 2|eins plus hundert, geteilt durch zwei]], also 50 Komma 5. [[int|int]] schneidet die Nachkommastellen ab. Es bleibt 50.",
  "Mit 51 und 100 kommt 75 heraus, mit 3 und 4 kommt 3 heraus.",
  "Der Schrägstrich gibt immer eine Kommazahl, und [[int|int]] macht daraus eine ganze Zahl."],
]

SZENEN = [
 "Drei Karten nebeneinander: 1 Schleife mit and, 2 Text einlesen, 3 die Mitte mit int; blass dahinter die Termine 02 bis 09.",
 "Karte 1: Code mit while geraten != 5 and versuche < 3; der Lauf mit Eingaben 1, 2, 3 ergibt 3, der Lauf mit Eingabe 5 ergibt 1; Hinweis: and, beide Bedingungen müssen stimmen.",
 "Karte 2: Code mit weiter gleich ja und while weiter == ja; Lauf mit dreimal Runde und den Eingaben ja, ja, nein; Hinweis: input liefert Text.",
 "Karte 3: drei Zeilen print(int((1 + 100) / 2)) und zwei weitere; Ausgaben 50, 75, 3; daneben die Rechnungen 50,5 und 75,5 und 3,5 mit abgeschnittenen Nachkommastellen.",
]
