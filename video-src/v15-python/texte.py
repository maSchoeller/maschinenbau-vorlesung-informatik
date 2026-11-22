"""Sprechertext V15 Python (Quelltext mit Markup)."""
SRC = [
 ["Messdaten kommen als Tabelle. Mit `pandas` liest du sie ein und wertest sie aus, ohne eine einzige Schleife.",
  "Zuerst `import pandas as pd`. Das `pd` ist die übliche Abkürzung.",
  "Dann `pd.read_csv`: Aus der Datei [[wellen.csv|wellen Punkt C S V]] wird ein DataFrame, kurz `df`. Das ist eine Tabelle mit Spaltennamen.",
  "Mit `head` siehst du die ersten Zeilen. Sie zeigen, wie die Tabelle aufgebaut ist."],
 ["Eine Spalte holst du mit dem Spaltennamen in eckigen Klammern: [[df[\"durchmesser_mm\"]|df, dahinter in eckigen Klammern durchmesser mm]]. Sie heißt Series.",
  "Auf eine Series wendest du Kennzahlen an. `describe` liefert Anzahl, Mittelwert, Standardabweichung, Minimum, Quartile und Maximum.",
  "Hier: 250 Werte, Mittelwert [[20,0037|zwanzig Komma null null drei sieben]]. Aber das mischt beide Maschinen und hilft noch nicht."],
 ["Zum Filtern vergleichst du eine Spalte: [[df[\"schicht\"] == \"Spät\"|df schicht gleich gleich Spät]]. Das Ergebnis ist eine Maske, eine Spalte aus Wahr und Falsch.",
  "Steckst du die Maske in eckige Klammern, bleiben nur die Zeilen mit Wahr: [[df[maske]|df, dahinter in eckigen Klammern maske]].",
  "Mehrere Bedingungen verbindest du mit `&` für und und `|` für oder. Jeder Vergleich steht dabei in runden Klammern.",
  "Mit `and` oder `or` bekommst du einen `ValueError`: Python kann eine ganze Spalte nicht als ein Wahr oder Falsch lesen."],
 ["Jetzt die Auswertung je Maschine. `groupby` arbeitet in drei Schritten: aufteilen, anwenden, zusammenführen.",
  "[[df.groupby(\"maschine\")|df punkt groupby, in Klammern maschine]] teilt die Tabelle in [[D1|D eins]] und [[D2|D zwei]]. Dann wählst du die Spalte und die Rechnung, hier `mean`.",
  "Das Ergebnis hat eine Zeile je Gruppe. Mit `agg` und einer Liste bekommst du mehrere Kennzahlen auf einmal: Mittelwert, Standardabweichung, Anzahl."],
 ["Eine neue Spalte entsteht mit einer Zuweisung. Rechts steht die Formel, und sie rechnet für alle Zeilen auf einmal.",
  "Hier: Toleranzbreite geteilt durch sechs mal die Spalte der Standardabweichungen.",
  "Für [[Cpk|C P K]] brauchst du je Zeile den kleineren von zwei Abständen. Das gibt `min` mit `axis=1`: zeilenweise statt spaltenweise."],
 ["Merke dir vier Punkte. Erstens: Eine Spalte ist eine Series. Zweitens: Ein Filter ist eine Maske in eckigen Klammern.",
  "Drittens: Mehrere Bedingungen mit `&` und `|`, jede in Klammern, nie mit `and` und `or`. Viertens: `groupby`, dann Spalte, dann Rechnung.",
  "Schau auf die Daten, bevor du rechnest: Das Werkzeug rechnet auch Unsinn korrekt. Im Labor probierst du es aus."],
]

SZENEN = [
 "Code import pandas as pd und read_csv getippt; Tabelle wellen.csv (Ausschnitt) wird zum DataFrame mit beschrifteten Spalten stichprobe, maschine, schicht, teil, durchmesser_mm; head(3) mit echter Ausgabe.",
 "DataFrame mit hervorgehobener Spalte durchmesser_mm wird herausgezogen (Series); describe-Ausgabe mit echten Werten, Zeilen count, mean, std erscheinen nacheinander.",
 "Maske: Spalte schicht, daneben Wahr/Falsch-Spalte, dann gefilterte Tabelle; zwei Bedingungen mit & und |, Klammern farbig; Fehler mit and als rote Meldung.",
 "Ablaufbild aufteilen - anwenden - zusammenführen: Tabelle wird in D1 und D2 geteilt, je Gruppe mean, Ergebnis zwei Zahlen; echte Ausgabe von agg.",
 "Neue Spalte: kennwerte-Tabelle mit std, Formel Cp und die Spalte Cp erscheint für beide Zeilen; min(axis=1) zeilenweise gegen spaltenweise als zwei Pfeile.",
 "Merkkarte mit vier Punkten (Series, Maske, & und | mit Klammern, groupby) und Hinweis Daten prüfen; Labor-Hinweis.",
]
