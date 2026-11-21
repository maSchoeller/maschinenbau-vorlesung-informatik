"""Sprechertext V08 Beispiel (Quelltext mit Markup). Erklärt genau briefing/v08-beispiel.py."""
SRC = [
 ["Wir werten acht Messungen einer Bohrung aus: Durchmesser 12 Millimeter, Toleranz [[H7|H sieben]], also 12,000 bis 12,018.",
  "Danach rechnen wir das Gesamtgewicht einer Stückliste.",
  "Das Programm hat zwei Teile. Wir gehen sie nacheinander durch."],
 ["Zeile 5: `messungen` ist eine Liste mit acht Kommazahlen in eckigen Klammern.",
  "Zeile 6: `toleranz` ist ein Tupel mit runden Klammern: untere und obere Grenze.",
  "Ein Tupel, weil sich die Toleranz im Programm nicht ändern soll.",
  "Zeile 8 und 9: `sum` durch `len` ist der Mittelwert, `max` minus `min` die Spannweite. Beides ohne Schleife."],
 ["Zeile 11 legt eine leere Liste `ausserhalb` an. Die Schleife ab Zeile 12 nimmt der Reihe nach jeden Wert in `d`.",
  "Zeile 13 prüft beide Grenzen: `toleranz[0]` ist die untere, `toleranz[1]` die obere.",
  "Liegt der Wert außerhalb, hängt Zeile 14 ihn mit `append` hinten an.",
  "Hier landen 11,998 und 12,019."],
 ["Die Zeilen 16 bis 19 geben die Ergebnisse aus.",
  "`len(ausserhalb)` ist 2. Der Mittelwert ist [[12,0081|zwölf Komma null null acht eins]] Millimeter, die Spannweite [[0,021|null Komma null zwei eins]].",
  "`messungen[-3:]` ist ein Slice vom drittletzten Element bis zum Ende: die letzten drei Messungen."],
 ["Teil zwei, ab Zeile 22: Die Stückliste ist ein Dictionary.",
  "Jede Teilenummer ist ein Schlüssel. Der Wert ist ein Tupel aus Menge und Gewicht je Stück in Kilogramm.",
  "Zeile 27 fügt die Passfeder hinzu. Der Schlüssel ist neu, also wird ein Eintrag eingefügt."],
 ["Die Schleife in Zeile 30 läuft mit `.items()` über alle Paare. `teil` ist der Schlüssel, `werte` das Tupel.",
  "`werte[0]` ist die Menge, `werte[1]` das Gewicht. Der Akkumulator `gesamt` sammelt Menge mal Gewicht.",
  "Das Ergebnis: [[2,71|zwei Komma sieben eins]] Kilogramm.",
  "Zum Schluss prüft `in`, ob das Lager in der Stückliste steht. So fragst du, bevor du zugreifst, und vermeidest den KeyError."],
]

SZENEN = [
 "Titelfolie mit Zeichnung der Bohrung und der Toleranz; daneben das Icon einer Stückliste. Unten der Programmkopf aus Zeile 1 und 2 des Beispiels.",
 "Code Zeilen 5 bis 9, Zeile für Zeile hervorgehoben. Rechts erscheint die Kästchenreihe mit den acht Werten, daneben das Tupel (12.000, 12.018) und die Ergebnisse von sum/len und max minus min.",
 "Code Zeilen 11 bis 14 hervorgehoben, daneben die Kästchenreihe mit dem laufenden d. Die beiden Verletzer 11.998 und 12.019 färben sich rot und rutschen in die Liste ausserhalb; dazu der Programmablaufplan der Schleife.",
 "Code Zeilen 16 bis 19 und die Konsolenausgabe darunter (vier Zeilen), die Ausgabezeile mit dem Slice messungen[-3:] ist über der Kästchenreihe markiert.",
 "Code Zeilen 22 bis 27 und die Tabelle der Stückliste mit drei Zeilen. Die Zeile P-8x7 fährt als vierte Zeile ein.",
 "Code Zeilen 29 bis 38 hervorgehoben. Die Tabelle wird Zeile für Zeile durchlaufen, ein laufendes gesamt zählt 2.40, 2.66, 2.70, 2.71. Unten die Ausgabe mit Gesamtgewicht und die Zeile zum in-Test.",
]
