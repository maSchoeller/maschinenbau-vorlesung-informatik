"""Sprechertext V11 Beispiel (Quelltext mit Markup)."""
SRC = [
 ["Wir prüfen den Code, den Copilot nach einem Programmablaufplan geschrieben hat.",
  "Der Plan hat zwei Rauten: Ist die kleinste Bohrung größer oder gleich der größten Welle, ist es eine Spielpassung.",
  "Sonst: Ist die größte Bohrung kleiner oder gleich der kleinsten Welle, ist es eine Übermaßpassung.",
  "Alles andere ist eine Übergangspassung."],
 ["Das ist die Funktion von Copilot. Sie bekommt vier Maße in Millimeter.",
  "Die erste Bedingung steht auf `bohrung_min >= welle_max`, die zweite auf `bohrung_max <= welle_min`.",
  "Dazu kommt `return` mit dem passenden Text. Genau so stand es im Prompt."],
 ["Jetzt kommen die Testfälle. Wir haben sie vorher von Hand aufgeschrieben.",
  "Jeder Fall hat vier Maße und die erwartete Antwort: H7 mit g6 ist Spiel, H7 mit r6 Übermaß, H7 mit k6 Übergang.",
  "Der vierte Fall ist der Grenzfall: H7 mit h6. Hier ist das Spiel genau null, und es muss Spielpassung herauskommen."],
 ["Die Schleife geht alle Testfälle durch und ruft die Funktion auf.",
  "Stimmt das Ergebnis, steht ok davor. Sonst steht FEHLER da, und ein Zähler wird größer.",
  "Am Ende: Fehlgeschlagene Tests, null. Erst jetzt vertrauen wir dem Code, weil er unsere Fälle besteht."],
 ["Zur Auswertung brauchen wir zwei Module. `import statistics` holt das ganze Modul, `from math import isclose` nur die Funktion.",
  "Die Höchstspiele aller Testfälle stehen in einer Liste. `statistics.mean` bildet den Mittelwert: ungefähr [[0,0218|null Komma null zwei eins acht]] Millimeter.",
  "`isclose` prüft, ob das Spiel im Grenzfall null ist. Kommazahlen vergleicht man mit einer Toleranz, nie mit zwei Gleichheitszeichen."],
 ["Probiere es selbst: Ändere in der Funktion `>=` in `>`.",
  "Dann scheitert genau der vierte Testfall, der Grenzfall.",
  "Ohne ihn hätte kein Test den Fehler gefunden. Darum gehört die Grenze immer zu den Testfällen."],
]

SZENEN = [
 "Der Passungs-PAP (Start, Eingabe, zwei Rauten, drei Ausgaben, Ende) wird gezeichnet. Die beiden Bedingungen in den Rauten werden hervorgehoben, die Ausgaben Spielpassung, Übermaßpassung, Übergangspassung erscheinen nacheinander.",
 "Code-Ausschnitt der Funktion passungsart (Zeilen 11 bis 18). Die zwei Vergleiche werden farbig markiert, daneben die zwei Rauten des PAP als Verbindung.",
 "Code-Ausschnitt der Liste testfaelle mit vier Tupeln. Daneben ein Maßstab mit den Toleranzfeldern H7 und g6, r6, k6, h6; beim vierten berühren sich die Felder an einer Linie (Spiel genau 0).",
 "Code der Testschleife. Die Zeilen laufen Schritt für Schritt; die vier Ausgaben ok erscheinen nacheinander im Terminalfenster, darunter Fehlgeschlagene Tests: 0.",
 "Code der Zeilen mit import statistics, from math import isclose, der List Comprehension für hoechstspiele, mean und isclose; die Ergebnisse erscheinen in der Ausgabe (Höchstspiele, Mittel, True).",
 "Der Operator >= in der Funktion wird zu > geändert; die Testausgabe zeigt jetzt FEHLER beim vierten Fall. Zum Schluss steht die Merkzeile: Testfälle zuerst, Grenze dabei.",
]
