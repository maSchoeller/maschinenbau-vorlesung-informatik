"""Sprechertext Termin 04, Video 3: Vorgerechnet: Einkauf zusammenrechnen (Quelltext mit Markup)."""
SRC = [
 ["Die Aufgabe: Du liest Preise in ganzen Euro ein, so lange, bis die Eingabe 0 kommt.",
  "Am Ende gibst du die Summe aus.",
  "Wie oft das passiert, weißt du vorher nicht. Deshalb entscheidet die Eingabe: Die Schleife läuft, solange der Preis nicht 0 ist.",
  "Das schreibst du zuerst in Worten auf, dann zeichnest du den Plan."],
 ["Zuerst die erste Eingabe: der Preis.",
  "Dann die Summe, sie startet bei 0. Dann kommt die Raute: Ist der Preis ungleich 0? Bei ja läuft der Rumpf, bei nein geht es zur Ausgabe.",
  "Im Rumpf steht: Summe ist Summe plus Preis. Danach folgt die nächste Eingabe, und der Pfeil führt zurück zur Raute.",
  "Merke: Die Eingabe steht zweimal. Einmal vor der Schleife, sonst hat die Raute nichts zu prüfen.",
  "Und einmal am Ende des Rumpfs, sonst ändert sich der Preis nie."],
 ["Jetzt der Code, Raute für Raute.",
  "Die Eingabe wird eine Zeile mit `input`, darum `int`, denn die Preise sind ganze Zahlen.",
  "Die Raute wird [[while preis != 0|weil preis ungleich null]], mit Doppelpunkt.",
  "Der Rumpf ist eingerückt: die Summe, dann dieselbe Eingabe noch einmal.",
  "Die Ausgabe steht ohne Einrückung unter der Schleife. Sie läuft einmal, am Ende."],
 ["Die Probe mit 12, 8, 5 und 0.",
  "Der erste Preis ist 12. Ist 12 ungleich 0? Ja. Die Summe ist 12.",
  "Dann 8: Ja, die Summe ist 20. Dann 5: Ja, die Summe ist 25.",
  "Jetzt die 0. Ist 0 ungleich 0? Nein. Die Schleife endet, und das Programm gibt aus: Summe: 25 Euro.",
  "Die 0 zählt nicht mit. Sie ist nur das Zeichen für Schluss."],
 ["Jetzt du: Gib nur die 0 ein. Was erwartest du?",
  "Die Raute ist gleich beim ersten Mal falsch, der Rumpf läuft nie, und die Summe bleibt 0.",
  "Das ist der Grenzfall dieser Aufgabe.",
  "Und was passiert, wenn die letzte Zeile im Rumpf fehlt? Der Preis ändert sich nie, und die Schleife hört nie auf."],
]

SZENEN = [
 "Kassenbon mit drei Preisen und einer 0 am Ende; der Auftragstext: Preise einlesen bis 0, dann Summe ausgeben; daneben ein Satz in Worten: Die Schleife läuft, solange preis nicht 0 ist.",
 "Der Plan baut sich auf: Eingabe preis, summe = 0, Raute preis != 0? mit ja: summe = summe + preis, Eingabe preis, Pfeil zurück zur Raute; nein: Ausgabe summe; die beiden Eingaben werden markiert, mit den Beschriftungen vor der Schleife und am Ende des Rumpfs.",
 "Links der Plan klein, rechts der Code: preis = int(input(\"Preis in Euro (0 = fertig): \")), summe = 0, while preis != 0:, eingerückt summe = summe + preis und dieselbe Eingabezeile, dann print(f\"Summe: {summe} Euro\") ohne Einrückung; die jeweilige Raute oder Zeile leuchtet.",
 "Lauf mit den Eingaben 12, 8, 5, 0: eine Tabelle mit den Spalten preis, preis != 0, summe füllt sich: 12 True 12, 8 True 20, 5 True 25, 0 False; der Pfeil springt dreimal zurück; Ausgabe Summe: 25 Euro.",
 "Nur die Eingabe 0: preis != 0 ist False, der Rumpf wird grau, Ausgabe Summe: 0 Euro; danach der Code ohne die letzte Zeile im Rumpf, der Preis bleibt 12, ein Kreis um den Rücksprung; Auftrag: Probier 12, 8, 5, 0 und nur 0.",
]
