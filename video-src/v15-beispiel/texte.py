"""Sprechertext V15 Beispiel (Quelltext mit Markup), genau briefing/v15-beispiel.py."""
SRC = [
 ["Zwei Drehmaschinen, [[D1|D eins]] und [[D2|D zwei]], fertigen Wellen mit 20 Millimeter Durchmesser und Toleranz plus minus [[0,02 mm|null Komma null zwei Millimeter]].",
  "Die Datei [[wellen.csv|wellen Punkt C S V]] enthält 250 Messwerte: je Maschine 25 Stichproben mit je fünf Teilen.",
  "Wir berechnen Mittelwert, [[Cp|C P]] und [[Cpk|C P K]] je Maschine, zählen den Ausschuss und zeichnen für [[D2|D zwei]] die Regelkarte. Die Frage: Welche Maschine darf liefern?"],
 ["Zeile 5 holt `pandas`. Die Zeilen 7 und 8 legen die Grenzen fest: [[20,020|zwanzig Komma null zwei null]] und [[19,980|neunzehn Komma neun acht null]] Millimeter.",
  "Zeile 10 liest die Datei in den DataFrame `df`, Zeile 11 zeigt die ersten drei Zeilen.",
  "Zeile 12 beschreibt die Spalte: 250 Werte, Mittelwert [[20,0037|zwanzig Komma null null drei sieben]]. Gemischt aus beiden Maschinen sagt das noch wenig."],
 ["Zeile 15 teilt nach Maschine und berechnet Mittelwert, Standardabweichung und Anzahl.",
  "Zeile 16 ergibt [[Cp|C P]]: Toleranzbreite durch sechs Sigma. Die Zeilen 17 und 18 holen die Abstände zu den Grenzen.",
  "Zeile 19 nimmt je Zeile den kleineren, teilt durch drei Sigma und ergibt [[Cpk|C P K]].",
  "Die Ausgabe: [[D1|D eins]] mit [[Cp|C P]] [[1,59|eins Komma fünf neun]] und [[Cpk|C P K]] [[1,58|eins Komma fünf acht]]. [[D2|D zwei]] mit [[Cp|C P]] [[1,07|eins Komma null sieben]], aber [[Cpk|C P K]] nur [[0,68|null Komma sechs acht]]."],
 ["Zeile 23 baut die Maske: Durchmesser größer als die obere Grenze oder kleiner als die untere. Beide Vergleiche stehen in Klammern, verbunden mit `|`.",
  "Die Zeilen mit Wahr bleiben übrig, und `len` zählt sie: 6 Teile außerhalb der Toleranz.",
  "Alle sechs stammen von [[D2|D zwei]] aus der Spätschicht: Stichproben 17, 20, 24 und 25."],
 ["Ab Zeile 27 die Regelkarte für [[D2|D zwei]]. Zeile 28 bildet je Stichprobe den Mittelwert aus fünf Teilen.",
  "Als Bezug dienen die ersten 15 Stichproben, die ruhige Anfangsphase. Ihr Mittelwert ist die Mittellinie.",
  "Zeile 31 teilt die Standardabweichung durch Wurzel aus fünf, denn Mittelwerte streuen weniger. Die Grenzen liegen drei mal diesen Wert über und unter der Mittellinie.",
  "Zeile 34 filtert die Mittelwerte außerhalb der Grenzen, wieder mit Klammern."],
 ["Die Ausgabe: Mittellinie [[20,0053|zwanzig Komma null null fünf drei]], obere Grenze [[20,0118|zwanzig Komma null eins eins acht]], untere Grenze [[19,9989|neunzehn Komma neun neun acht neun]]. Außerhalb liegen die Stichproben 20, 24 und 25.",
  "Das Ergebnis: [[D1|D eins]] ist fähig und darf liefern. [[D2|D zwei]] ist mit [[Cpk|C P K]] [[0,68|null Komma sechs acht]] nicht fähig und driftet.",
  "Die Regelkarte schlägt bei Stichprobe 20 an. Vier der sechs Ausschussteile kamen danach: Mit der Karte hätte man früher eingegriffen."],
]

SZENEN = [
 "Zwei Drehmaschinen als Symbole mit Toleranzband 19,980 bis 20,020 mm; rechts Tabellen-Ausschnitt wellen.csv (Kopfzeile und drei Zeilen); Hinweis 250 Messwerte, 25 Stichproben je Maschine, Frage Welche Maschine darf liefern?",
 "Code Zeilen 5 bis 12 getippt, je Satz Zeilengruppe markiert; rechts die echte Ausgabe von head(3) und describe().round(4) erscheint.",
 "Code Zeilen 14 bis 20 mit Markierung je Satz; darunter die echte Ausgabetabelle kennwerte (mean, std, count, Cp, Cpk); Cpk-Zeile D2 rot, D1 grün.",
 "Code Zeilen 22 bis 24; Maske mit Klammern und | farbig; Ausgabe 6 Teile; Liste der sechs Ausschussteile (Stichprobe, Maschine, Schicht, Wert).",
 "Code Zeilen 26 bis 36 in zwei Hälften (26 bis 31, 32 bis 36) mit Markierung; Rechenkarte: Mittellinie, sigma_x = s durch Wurzel 5, Grenzen.",
 "Regelkarte D2 mit echten 25 Stichprobenmitteln, Mittellinie, OEG und UEG, Punkte 20, 24, 25 rot; Ausgabezeilen; Fazit-Karte D1 darf liefern, D2 nicht; Hinweis vier von sechs Ausschussteilen nach Stichprobe 20.",
]
