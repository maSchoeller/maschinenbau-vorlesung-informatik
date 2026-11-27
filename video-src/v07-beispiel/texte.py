"""Sprechertext Termin 07, Video 3: Vorgerechnet: Fahrenheit (Quelltext mit Markup)."""
SRC = [
 ["Die Aufgabe: Das Programm liest eine Temperatur in Grad Celsius ein und gibt sie in Grad Fahrenheit aus. Die Umrechnung steht in einer Funktion.",
  "Der Ablauf in Worten: Wert einlesen, umrechnen, ausgeben. Was gehört in die Funktion? Die Umrechnung, weil man sie öfter braucht. Eingabe und Ausgabe bleiben im Hauptprogramm."],
 ["Zuerst die Pläne. Der Hauptplan liest [[celsius|zellsius]] ein. Dann kommt das Rechteck mit den doppelten Seitenlinien. Es ruft die Funktion auf: [[fahr = fahrenheit(celsius)|fahr gleich fahrenheit von celsius]]. Danach gibt er aus.",
  "Die Funktion hat einen eigenen kleinen Plan. Im Start-Symbol steht ihr Kopf: [[fahrenheit(c)|fahrenheit von c]]. Darunter steht die Rechnung [[grad = c * 9 / 5 + 32|grad gleich c mal neun durch fünf plus zweiunddreißig]].",
  "Am Ende steht die Rückgabe: [[grad|grad]] geht zurück an die Stelle, die die Funktion aufgerufen hat."],
 ["Jetzt der Code. Zuerst kommt die Funktion mit [[def|deff]]. Der Name, die Klammer mit dem Parameter [[c|ze]] und der Doppelpunkt stehen im Kopf, der Rumpf ist eingerückt.",
  "Die Rechnung steht im Rumpf. Die letzte Zeile ist [[return grad|rietörn grad]]. Das ist die Rückgabe aus dem Plan.",
  "Danach folgt das Hauptprogramm, ganz links. Es liest [[celsius|zellsius]] ein und ruft [[fahrenheit(celsius)|fahrenheit von celsius]] auf. Das Ergebnis speichert es in [[fahr|fahr]]. Dann gibt es beides aus.",
  "Wichtig: Erst definieren, dann aufrufen."],
 ["Die Probe mit 20 Grad. Du rechnest 20 mal 9 durch 5, das sind 36. Dazu kommen 32, das ergibt 68.",
  "Der Lauf zeigt dasselbe: 20.0 Grad Celsius sind 68.0 Grad Fahrenheit.",
  "Beim Aufruf bekommt der Parameter [[c|ze]] den Wert aus [[celsius|zellsius]]. Der Rückgabewert landet in [[fahr|fahr]]."],
 ["Jetzt du, zu Hause. Ersetze [[return grad|rietörn grad]] durch [[print(grad)|print von grad]] und lass das Programm laufen.",
  "Überlege zuerst, was du erwartest. Probiere es dann aus. Lies die Meldung genau.",
  "Wenn du magst, schreibst du zusätzlich [[print(fahr)|print von fahr]] unter den Aufruf. Dann siehst du, was in [[fahr|fahr]] steht."],
]

SZENEN = [
 "Ein Thermometer mit 20 Grad Celsius und ein zweites mit Fahrenheit; der Auftrag in drei Schritten: einlesen, umrechnen, ausgeben; die Umrechnung steht in einer Funktion, Eingabe und Ausgabe im Hauptprogramm.",
 "Links der Hauptplan: Start, Eingabe celsius, Unterprogramm fahr = fahrenheit(celsius), Ausgabe, Ende; rechts der Plan der Funktion: Start fahrenheit(c), grad = c * 9 / 5 + 32, Rückgabe grad; eine gestrichelte Verbindung zwischen Aufruf und Funktion.",
 "Der Code mit acht Zeilen (Kommentar, Funktion, Leerzeile, Hauptprogramm); Zeile für Zeile wird der passende Planteil markiert: def und Kopf, Rechnung, return, dann Hauptprogramm.",
 "Die Probe: 20 mal 9 durch 5 gleich 36, plus 32 gleich 68; der Programmlauf mit Eingabe 20 und Ausgabe; ein Pfeil zeigt den Weg von celsius über c und grad nach fahr.",
 "Der Auftrag für zu Hause: return grad durch print(grad) ersetzen; der Code mit der markierten Zeile; Hinweis: erst vermuten, dann ausprobieren; das Ergebnis wird nicht verraten.",
]
