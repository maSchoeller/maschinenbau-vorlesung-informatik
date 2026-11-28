"""Sprechertext Termin 08, Video 3: Vorgerechnet: Fingerspiel (Quelltext mit Markup)."""
SRC = [
 ["Die Aufgabe: Anna und Ben zeigen je einen bis fünf Finger. Ist die Summe gerade, gewinnt Anna. Sonst gewinnt Ben.",
  "Der Ablauf in Worten: Zwei Zahlen einlesen, die Summe bilden, fragen, wer gewinnt, und den Sieger ausgeben.",
  "Was gehört in welche Funktion? Eine Funktion beantwortet nur: Ist die Zahl gerade? Eine zweite macht daraus einen Namen. Eingabe und Ausgabe bleiben im Hauptprogramm."],
 ["Zuerst die Pläne. Der Hauptplan liest [[anna|anna]] und [[ben|ben]] ein. Dann kommt das Rechteck mit den doppelten Seitenlinien: [[wer = sieger(anna + ben)|wer gleich sieger von anna plus ben]]. Danach gibt er den Sieger aus.",
  "Die Funktion [[ist_gerade|ist gerade]] hat einen eigenen Plan. Im Start-Symbol steht ihr Kopf. Dann kommt die Raute: [[n % 2 == 0|n Prozent zwei gleich gleich null]].",
  "Ist der Rest 0, wird die Antwort [[True|truh]]. Sonst wird sie [[False|fals]]. Am Ende geht die Antwort zurück an den Aufruf.",
  "Den Plan von [[sieger|sieger]] zeichnest du gleich selbst. Er fehlt hier mit Absicht."],
 ["Jetzt der Code. Zuerst kommt [[ist_gerade|ist gerade]] mit [[def|deff]]. Die Raute wird zu [[if|if]] und [[else|else]], und in beiden Zweigen steht ein [[return|rietörn]].",
  "Dann folgt [[sieger|sieger]]. Die Funktion ruft [[ist_gerade|ist gerade]] direkt in der Bedingung auf. Ist die Summe gerade, kommt [[\"Anna\"|Anna in Anführungszeichen]] zurück, sonst [[\"Ben\"|Ben in Anführungszeichen]].",
  "Das Hauptprogramm steht unten, ohne Einrückung. Es liest beide Zahlen mit [[int(input(...))|int von input]] ein, denn [[input|input]] liefert Text. Es ruft [[sieger|sieger]] auf und speichert das Ergebnis in [[wer|wer]]. Dann gibt es den Sieger aus.",
  "Wichtig: Erst definieren, dann aufrufen."],
 ["Die Probe mit 3 und 5. Die Summe ist 8.",
  "[[8 % 2|acht Prozent zwei]] ergibt 0. Also ist die Antwort [[True|truh]], und [[sieger|sieger]] gibt [[\"Anna\"|Anna in Anführungszeichen]] zurück.",
  "Der Lauf zeigt dasselbe: Sieger, Doppelpunkt, Anna.",
  "Der Wert geht durch das Programm: von [[summe|summe]] nach [[n|n]], als [[True|truh]] zurück, als Name zurück, und landet in [[wer|wer]]."],
 ["Jetzt du, zu Hause. Ersetze in [[sieger|sieger]] das [[return \"Ben\"|rietörn Ben in Anführungszeichen]] durch [[print(\"Ben\")|print von Ben in Anführungszeichen]].",
  "Lass das Programm mit 2 und 3 laufen. Überlege zuerst, was du erwartest. Schau dann genau hin, was erscheint.",
  "Lies jede Zeile der Ausgabe. Erkläre dir, warum sie so aussieht. Der Unterschied zwischen Anzeigen und Zurückgeben ist der Kern."],
]

SZENEN = [
 "Zwei Hände mit je einer Zahl von 1 bis 5 Fingern; Regel: Summe gerade, Anna gewinnt, sonst Ben; drei Schritte (einlesen, Summe, Sieger fragen, ausgeben); Kästen Hauptprogramm und die zwei Funktionen.",
 "Links der Hauptplan: Start, Eingabe anna, Eingabe ben, Unterprogramm wer = sieger(anna + ben), Ausgabe, Ende; rechts der Plan von ist_gerade mit der Raute n % 2 == 0, den Zweigen antwort = True und antwort = False und der Rückgabe; ein gestrichelter Platz für den Plan von sieger, der fehlt.",
 "Der Code mit 17 Zeilen (Kommentar, ist_gerade, sieger, Hauptprogramm); Zeile für Zeile wird der passende Teil markiert; Hinweis erst definieren, dann aufrufen.",
 "Die Probe: 3 + 5 ist 8, 8 % 2 ist 0, True, Anna; der Programmlauf mit den Eingaben 3 und 5 und der Ausgabe Sieger: Anna; der Weg des Werts durch summe, n, True und Anna nach wer.",
 "Der Auftrag für zu Hause: return Ben durch print(Ben) ersetzen und mit 2 und 3 laufen lassen; der Code mit der markierten Zeile; Hinweis: erst vermuten, dann ausprobieren; das Ergebnis wird nicht verraten.",
]
