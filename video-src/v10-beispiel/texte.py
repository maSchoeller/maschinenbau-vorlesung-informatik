"""Sprechertext V10 Beispiel (Quelltext mit Markup). Erklärt genau briefing/v10-beispiel.py."""
SRC = [
 ["Wir bauen ein Mini-Sprachmodell: Aus sechs Sätzen über Welle, Zahnrad und Lager lernt das Programm, welches Wort auf welches folgt, und erzeugt damit einen neuen Satz.",
  "Zeile 4 lädt das Modul `random` für den Zufall. Zeile 6 bis 8: `text` ist ein mehrzeiliger String, unser Trainingstext."],
 ["Ab Zeile 11 steht der Tokenizer als Funktion. Zeile 13 verkettet drei String-Methoden: `lower` macht alles klein, `replace` gibt dem Punkt Leerzeichen, ein zweites `replace` ersetzt die Zeilenumbrüche.",
  "Zeile 14 ist eine List Comprehension mit Filter: `split` liefert die Stücke, das `if` wirft die leeren weg."],
 ["Zeile 17 ruft den Tokenizer auf. Zeile 18 gibt die Anzahl aus: [[36|sechsunddreißig]] Tokens, und die ersten acht: die, welle, trägt, das, zahnrad, Punkt, das, zahnrad."],
 ["Jetzt das Training, Zeile 21 bis 26. Das Dictionary `nachfolger` bildet jedes Wort auf die Liste seiner Nachfolger ab.",
  "Die Schleife läuft bis zum vorletzten Token. Kommt ein Wort zum ersten Mal vor, bekommt es eine leere Liste, dann hängt `append` das nächste Wort an.",
  "Zeile 28: Nach `die` kam fünfmal ein Wort: viermal welle, einmal schraube."],
 ["Die Wahrscheinlichkeit ist der Anteil an dieser Liste, Zeile 31 bis 37: `liste.count(kandidat)` durch `len(liste)`.",
  "Die Liste `gezaehlt` sorgt dafür, dass jeder Kandidat nur einmal erscheint.",
  "Ergebnis: für welle [[0,80|null Komma acht null]], für schraube [[0,20|null Komma zwei null]]."],
 ["Zum Schluss das Erzeugen, Zeile 40 bis 48. `random.seed` mit der Zahl vier legt den Zufall fest, damit jedes Mal derselbe Satz entsteht.",
  "Startwort ist das. Dann zieht `random.choice` bis zu achtmal einen Nachfolger. Weil welle viermal in der Liste steht, wird es viermal so oft gezogen wie schraube. Das `break` beendet die Schleife beim Punkt.",
  "Der erzeugte Satz: das zahnrad treibt die schraube hält das zahnrad Punkt. Grammatisch sauber, aber ohne Sinn: Jedes Wortpaar gab es, die Kette nicht. Genau so entsteht flüssiger Unsinn."],
]

SZENEN = [
 "Titelfolie mit den sechs Trainingssätzen als Textblock; rechts Zeile 4 import random und Zeile 6 bis 8 mit dem mehrzeiligen String hervorgehoben.",
 "Code Zeile 11 bis 14, Zeile für Zeile hervorgehoben. Darüber läuft ein Beispieltext durch die Stufen lower, replace, split und Filter; die leeren Stücke werden durchgestrichen.",
 "Zeile 17 und 18 mit der Konsolenausgabe 36 Tokens und den ersten acht Tokens als farbige Chips.",
 "Code Zeile 21 bis 28. Das Dictionary nachfolger wächst Eintrag für Eintrag; bei die erscheint die Liste welle, welle, welle, schraube, welle, daneben die Ausgabe von Zeile 28.",
 "Code Zeile 31 bis 37 und zwei Balken mit 0,80 und 0,20 neben der Liste; die gezählten Kandidaten werden nacheinander markiert.",
 "Code Zeile 40 bis 48 und der Programmablaufplan Text erzeugen. Der Satz entsteht Wort für Wort als Chips; die Ausgabe das zahnrad treibt die schraube hält das zahnrad . erscheint unten, jedes Wortpaar mit grünem Haken.",
]
