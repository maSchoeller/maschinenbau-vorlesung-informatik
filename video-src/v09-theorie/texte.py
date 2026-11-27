"""Sprechertext Termin 09, Video 1: Was im Rechner arbeitet (Quelltext mit Markup). Nur Text, noch nicht vertont."""
SRC = [
 ["Du startest ein Spiel. Es liegt auf der [[SSD|ess ess dee]]. Beim Start wird es in den Arbeitsspeicher geladen. Dort arbeitet der Prozessor es Schritt für Schritt ab.",
  "Mit der Eingabe, zum Beispiel einer Taste, sagst du dem Spiel, was es tun soll. Die Ausgabe, zum Beispiel der Bildschirm, zeigt dir das Ergebnis.",
  "Der Bus ist die Leitung dazwischen. Über ihn gehen alle Daten von einem Bauteil zum anderen.",
  "Als Bild aus der Werkhalle: Der Prozessor ist der Facharbeiter, der Arbeitsspeicher seine Werkbank, die [[SSD|ess ess dee]] das Lager."],
 ["Der Weg eines Programms: von der [[SSD|ess ess dee]] über den Bus in den Arbeitsspeicher, dann über den Bus zum Prozessor.",
  "Der Prozessor arbeitet nie direkt mit der [[SSD|ess ess dee]].",
  "Das Ergebnis geht über den Bus zurück in den Arbeitsspeicher und zur Ausgabe."],
 ["Jetzt fällt der Strom aus.",
  "Der Arbeitsspeicher verliert seinen Inhalt. Er ist leer.",
  "Die [[SSD|ess ess dee]] behält alles, auch ohne Strom.",
  "Darum gibt es Speichern: Das Programm kopiert den Spielstand vom Arbeitsspeicher auf die [[SSD|ess ess dee]]. Erst dann bleibt er erhalten."],
 ["Der Prozessor arbeitet ein Programm Befehl für Befehl ab. Jedes Mal macht er dasselbe, in drei Schritten.",
  "Erstens holt er den nächsten Befehl aus dem Speicher.",
  "Zweitens entschlüsselt er ihn. Er stellt fest, was der Befehl bedeutet.",
  "Drittens führt er ihn aus. Dann kommt der nächste Befehl."],
 ["Eine Uhr gibt den Takt vor. Bei jedem Takt macht der Prozessor einen kleinen Schritt.",
  "[[3 GHz|drei Gigahertz]] sind 3 Milliarden Takte pro Sekunde.",
  "Eine Python-Zeile wie [[c = a + b|c gleich a plus b]] wird im Rechner zu mehreren solcher Befehle. Python übersetzt sie für dich."],
]

SZENEN = [
 "Ein Rechner aus fünf Bauteilen: SSD, Arbeitsspeicher und Prozessor oben, Eingabe und Ausgabe unten, darunter der Bus als Leitung; ein Spiel wandert von der SSD in den Arbeitsspeicher.",
 "Der Weg eines Programms als Kette: SSD, Bus, Arbeitsspeicher, Bus, Prozessor; der direkte Weg von der SSD zum Prozessor ist durchgestrichen; das Ergebnis geht zurück zu Arbeitsspeicher und Ausgabe.",
 "Strom aus: Der Arbeitsspeicher wird leer, die SSD behält ihren Inhalt; Speichern kopiert den Spielstand vom Arbeitsspeicher auf die SSD.",
 "Der Dreischritt des Prozessors als Kreis: holen, entschlüsseln, ausführen, dann der nächste Befehl.",
 "Eine Uhr mit Takt; 3 GHz sind 3 Milliarden Takte pro Sekunde; die Python-Zeile c = a + b wird im Rechner zu mehreren Befehlen.",
]
