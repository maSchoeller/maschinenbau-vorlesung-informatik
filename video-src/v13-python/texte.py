"""Sprechertext V13 Python (Quelltext mit Markup)."""
SRC = [
 ["NumPy lädst du mit [[import numpy as np|import Nampei as en pe]]. Der Kurzname [[np|en pe]] ist überall üblich. Ein Array erzeugst du mit [[np.array|en pe punkt array]] aus einer Liste.",
  "[[a.shape|a punkt shape]] zeigt die Form, `len` die Länge. Beim Ausdrucken fehlen die Kommas: [[[2 4 6]|eckige Klammer auf zwei, vier, sechs, eckige Klammer zu]].",
  "Achtung: `liste * 2` hängt die Liste zweimal hintereinander. `a * 2` verdoppelt jeden Wert."],
 ["Zahlenreihen: [[np.arange|en pe punkt a range]] arbeitet wie `range`, liefert aber ein Array, auch mit Kommazahlen als Schritt. Der Stopp gehört nicht mehr dazu.",
  "[[np.linspace|en pe punkt lin space]] mit Start, Ende und Anzahl liefert gleichmäßig verteilte Werte, beide Enden eingeschlossen.",
  "Eine Zeitachse aus der Abtastrate: [[np.arange(N) / fs|en pe punkt a range von großes N, geteilt durch f s]]."],
 ["Rechnen geht elementweise: `a * 2`, `a + b`, `a ** 2`. Funktionen wie [[np.sin|en pe punkt sinus]] und [[np.sqrt|en pe punkt Wurzel]] wirken auf jedes Element.",
  "Zwei Arrays müssen gleich lang sein, sonst gibt es einen ValueError mit den beiden Formen in Klammern."],
 ["Kennwerte: [[np.mean|en pe punkt mean]], [[np.max|en pe punkt max]], [[np.min|en pe punkt min]] und [[np.sum|en pe punkt sum]] fassen ein Array zu einer Zahl zusammen.",
  "Der Effektivwert ist [[np.sqrt(np.mean(v ** 2))|en pe punkt Wurzel von en pe punkt mean von v hoch zwei]]: erst quadrieren, dann mitteln, dann die Wurzel. Wer erst mittelt und dann quadriert, bekommt bei Schwingungen fast null."],
 ["Masken wählen Werte nach einer Bedingung aus. `a > 3` liefert ein Wahr-Falsch-Array, `a[a > 3]` behält nur die passenden Werte.",
  "Mit `len` zählst du sie, durch `len(a)` ergibt sich der Anteil. Zwei Bedingungen verbindest du mit [[&|dem Und-Zeichen]] oder dem senkrechten Strich, jede in Klammern.",
  "Messdaten lädt [[np.loadtxt|en pe punkt load text]]: mit `delimiter`, `skiprows` und `usecols` bekommst du direkt eine Spalte als Array."],
 ["Zeit misst du mit [[time.perf_counter|time punkt perf counter]]: vor und nach dem Code lesen, die Differenz ist die Dauer.",
  "Mehrfach messen und `min` oder [[np.median|en pe punkt Median]] berichten. Zwischen den beiden Aufrufen steht nur die Rechnung, kein `print`.",
  "Die Zeiten hängen von deinem Rechner ab: Behaupte nie, NumPy sei immer genau so und so viel schneller."],
]

SZENEN = [
 "Syntax-Karte 1: Code import numpy as np, np.array, shape, len; daneben Gegenüberstellung liste * 2 gleich sechs Elemente und a * 2 gleich verdoppelte Werte.",
 "Syntax-Karte 2: arange und linspace als Zahlenstrahl mit eingezeichneten Punkten, Stopp offen und Ende geschlossen; darunter die Zeitachse aus Abtastrate.",
 "Syntax-Karte 3: zwei Arrays untereinander, a + b paarweise mit Pfeilen; Fehlerfall mit Längen drei und vier als Fehlermeldung.",
 "Syntax-Karte 4: Array v, Quadrate, Mittelwert, Wurzel als Rechenkette; daneben der falsche Weg mit Mittelwert zuerst.",
 "Syntax-Karte 5 und 6: Maske als Wahr-Falsch-Reihe über dem Array, Auswahl in a[a > 3]; Ausschnitt np.loadtxt mit den drei Parametern und der Tabellenkopf der phyphox-Datei.",
 "Syntax-Karte 7: Code mit perf_counter und Minimum; Punktdiagramm mit Median und Minimum; Hinweis Zeiten sind Messwerte.",
]
