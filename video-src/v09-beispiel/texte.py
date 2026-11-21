"""Sprechertext V09 Beispiel (Quelltext mit Markup), genau briefing/v09-beispiel.py."""
SRC = [
 ["Die Aufgabe: Die Datei [[bremsen-kaputt.csv|bremsen Strich kaputt Punkt C S V]] ist eine Fahrrad-Bremsmessung mit 400 Messzeilen.",
  "Sie hat das Semikolon als Trennzeichen und das Dezimalkomma. Fünf Zeilen sind kaputt.",
  "Wir wollen die Verzögerungsspitze, den Mittelwert und die Zahl der übersprungenen Zeilen, und das Ergebnis soll in eine Datei."],
 ["Zuerst das Modul `csv` und eine kleine Funktion `zahl`.",
  "Sie schneidet mit `strip` Leerzeichen ab, ersetzt das Komma durch einen Punkt und macht mit `float` eine Zahl daraus.",
  "So steht die Regel an einer Stelle und wird zweimal benutzt.",
  "Dazu zwei leere Listen und der Zähler `kaputt` bei null, alle vor der Schleife."],
 ["Mit `with open` öffnen wir die Datei, mit `encoding=\"utf-8\"`.",
  "`csv.reader` mit `delimiter=\";\"` liefert jede Zeile als Liste von Feldern.",
  "`next(leser)` holt die Kopfzeile ab: Ihre Spaltennamen landen in der Variablen `kopf`."],
 ["Jetzt die Schleife. Im `try`-Block stehen nur die zwei Umwandlungen, Spalte null ist die Zeit, Spalte zwei die Beschleunigung.",
  "Scheitert eine, springt Python in den `except`-Block: bei einem `ValueError`, etwa „Fehler“ oder einem leeren Feld, und bei einem `IndexError`, wenn die Zeile zu kurz ist.",
  "Dort zählen wir die Zeile mit und machen mit `continue` bei der nächsten weiter. Nur gute Zeilen kommen in die Listen."],
 ["Die Ausgabe: 395 gültige Zeilen und 5 übersprungene. Zusammen sind das 400, wie in der Datei. Das ist unsere Gegenprobe.",
  "Die Spitze ist der kleinste Wert, denn Bremsen ist eine negative Beschleunigung.",
  "Wir starten mit dem ersten Wert und merken uns in der Schleife jeden kleineren, samt Zeitpunkt.",
  "Ergebnis: [[-3,78|minus drei Komma sieben acht]] Meter pro Sekunde zum Quadrat bei [[4,94 s|vier Komma neun vier Sekunden]]. Der Mittelwert über die ganze Fahrt liegt bei [[-0,53|minus null Komma fünf drei]]."],
 ["Zum Schluss schreiben wir das Ergebnis in die Datei `auswertung.txt`, mit dem Modus `\"w\"`.",
  "Jede Zeile bekommt ihren Zeilenumbruch selbst, und Spitzenwert und Zeitpunkt stehen mit Semikolon getrennt darin.",
  "Probier es mit deiner eigenen Datei: Name und Trennzeichen anpassen, und prüfe, wie viele Zeilen übersprungen wurden."],
]

SZENEN = [
 "Beschleunigungskurve der Bremsmessung (aus bremsen-kaputt.csv) mit fünf rot markierten Ausfallpunkten; daneben die Rohzeilen mit dem Wort Fehler, einem leeren Feld und einer zu kurzen Zeile.",
 "Code-Ausschnitt Zeilen 5 bis 15 aus briefing/v09-beispiel.py (import csv, def zahl, drei Startwerte); die Funktion zahl wird in drei Schritten (strip, replace, float) farbig markiert.",
 "Code-Ausschnitt Zeilen 17 bis 19: with open, csv.reader mit delimiter, next(leser); Kopfzeile fliegt in kopf.",
 "Code-Ausschnitt Zeilen 20 bis 28 mit try, except, continue; wie im Explorable springt eine Marke bei einer kaputten Zeile in den except-Block, der Zähler kaputt zählt hoch.",
 "Ausgabe-Fenster mit den vier Zeilen (Spalte, 395 gültig, 5 übersprungen, Spitzenwert, Mittelwert); darunter die Gegenprobe 395 plus 5 gleich 400; die Kurve mit markierter Spitze bei 4,94 s.",
 "Code-Ausschnitt Zeilen 43 bis 46 mit open im Modus w und zwei aus.write; rechts die erzeugte Datei auswertung.txt mit zwei Zeilen.",
]
