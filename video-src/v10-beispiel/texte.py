"""Sprechertext Termin 10, Video 3: Dein Spiel Schritt für Schritt (Quelltext mit Markup)."""
SRC = [
 ["Dein Spiel besteht aus kleinen Schritten. Die Funktion [[hinweis|Hinweis]] steht schon da. Sie bekommt den Tipp und die geheime Zahl und gibt Zu klein, Zu groß oder Richtig zurück.",
  "Der erste Schritt: Zahl ziehen, einen Tipp einlesen, den Hinweis zeigen. Das ist ein einziger Versuch.",
  "Das Spiel soll aber fragen, bis der Tipp stimmt."],
 ["Aus dem Tipp wird eine Schleife. Sie wiederholt zwei Dinge: Tipp einlesen und Hinweis zeigen. Sie läuft, solange [[geraten != geheim|geraten ungleich geheim]] gilt.",
  "Darum braucht [[geraten|geraten]] vor der Schleife einen Startwert, die 0. Sonst gäbe es beim ersten Prüfen noch keinen Wert.",
  "Die Zufallszahl wird einmal gezogen, direkt vor der Schleife."],
 ["Die Falle: Die Zufallszahl steht in der Schleife. Dann würfelt der Rechner bei jedem Tipp neu.",
  "Du kannst die Zahl nie finden, denn sie ändert sich, bevor du sie triffst. Die Zeile [[random.randint(1, 100)|rändom punkt rand-int von eins bis hundert]] gehört darum vor die Schleife."],
 ["Jetzt der Zähler. [[versuche|versuche]] beginnt vor der Schleife bei 0. In jeder Runde kommt 1 dazu.",
  "Nach der Schleife zeigt [[print|print]] die Zahl. Die Zeile steht ohne Einrückung unter der Schleife, sie läuft also erst nach dem Treffer."],
 ["Zum Schluss gliederst du das Spiel. Die Zufallszahl, der Zähler und die Schleife wandern in die Funktion [[spiel|spiel]]. Am Ende steht [[return versuche|rietörn versuche]].",
  "Das Hauptprogramm ruft [[spiel()|spiel]] auf und merkt sich die Zahl in [[anzahl|anzahl]]. Dann zeigt es sie an."],
 ["Ein Lauf: Die geheime Zahl ist 30. Du tippst 50, das ist zu groß. Dann 20, das ist zu klein. Dann 30, und es steht Richtig da.",
  "Zuletzt zeigt das Programm Versuche 3. Das ist dein Spiel."],
]

SZENEN = [
 "Oben ein Hinweis, dass hinweis schon da ist; darunter der Code mit drei Zeilen: Zahl ziehen, Tipp einlesen, Hinweis zeigen; ein Lauf mit Tipp 50 ergibt Zu groß; Frage: bis der Tipp stimmt?",
 "Der Code mit Schleife: geheim ziehen, geraten gleich 0, while geraten != geheim mit Tipp und Hinweis im Rumpf; die Startzeilen und die Bedingung sind markiert.",
 "Der Code mit der Zeile geheim gleich random.randint im Rumpf der Schleife, rot markiert; Hinweis: bei jedem Tipp eine neue Zahl; Ausgaben Zu klein, Zu groß, Zu groß, ohne Treffer.",
 "Der Code mit versuche gleich 0 vor der Schleife, versuche plus 1 im Rumpf und der Ausgabe nach der Schleife; markierte Zeilen.",
 "Der Code mit def spiel und return versuche, darunter das Hauptprogramm anzahl gleich spiel() und die Ausgabe; die Teile der Funktion sind eingerahmt.",
 "Ein Lauf des fertigen Spiels mit Tipps 50, 20, 30, den Hinweisen und der letzten Zeile Versuche: 3.",
]
