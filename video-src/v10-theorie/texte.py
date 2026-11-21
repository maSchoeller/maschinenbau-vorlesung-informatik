"""Sprechertext V10 Theorie (Quelltext mit Markup)."""
SRC = [
 ["Du fragst eine KI: Welches Anzugsdrehmoment hat eine Schraube [[M10|M zehn]] der Festigkeitsklasse [[8.8|acht Punkt acht]]?",
  "Die Antwort kommt sofort: [[86 Nm|sechsundachtzig Newtonmeter]]. Das klingt sicher. Der Tabellenwert ist aber [[49 Nm|neunundvierzig Newtonmeter]]. Die sechsundachtzig gehören zur [[M12|M zwölf]].",
  "Wie kommt eine KI zu so einer selbstbewussten Falschaussage?"],
 ["Ein Sprachmodell rechnet nicht mit Buchstaben, sondern mit Tokens.",
  "Ein Tokenizer zerlegt den Text in Stücke und gibt jedem Stück eine Nummer.",
  "Häufige Wörter sind ein Token. Lange Wörter werden zerlegt: Wellendichtring wird zu Wellen, dicht und ring.",
  "Das Modell sieht nur die Nummern."],
 ["Beim Training wird gezählt: Welches Token folgte auf welchen Kontext?",
  "Kam nach dem Wort die fünfmal ein Wort, viermal Welle und einmal Schraube, dann sind das achtzig Prozent für Welle und zwanzig Prozent für Schraube.",
  "Das ist ein Bigramm-Modell, der einfachste Fall. Große Modelle speichern ihre Wahrscheinlichkeiten in einem neuronalen Netz, aber gelernt wird dasselbe."],
 ["Zum Erzeugen würfelt das Modell den Nachfolger nach diesen Wahrscheinlichkeiten, hängt ihn an und macht weiter, Token für Token.",
  "Die Temperatur regelt den Zufall: Niedrig heißt fast immer das häufigste Wort, hoch heißt, auch Unwahrscheinliches kommt dran.",
  "Der Seed macht den Zufall wiederholbar: Gleicher Seed, gleicher Text."],
 ["Der Kontext ist das, was das Modell beim Vorhersagen sieht. Dein Mini-Modell sieht ein Wort, große Modelle viele tausend Tokens.",
  "Jeder erzeugte Satz besteht aus Wortpaaren, die es im Training gab. Darum klingt er flüssig, auch wenn die Aussage falsch ist.",
  "Das nennt man Halluzination. Das Modell prüft keine Quelle, es erzeugt Wahrscheinliches, nicht Wahres."],
 ["Für dich als Ingenieur heißt das: Zahlen gegenrechnen oder in der Tabelle nachschlagen, Einheiten prüfen, Normen im Original öffnen und Quellen anklicken.",
  "Vertrauliche Daten gehören nicht in eine öffentliche KI.",
  "Die KI schreibt den Entwurf, du verantwortest das Ergebnis."],
]

SZENEN = [
 "Chatfenster mit der Frage nach dem Anzugsdrehmoment M10 8.8 und der selbstsicheren Antwort 86 Nm. Daneben erscheint eine Tabellenzeile mit M10 = 49 Nm und M12 = 86 Nm; ein roter Pfeil zeigt von der Antwort auf die M12-Zeile.",
 "Der Satz Der Wellendichtring sitzt im Lagerschild wird in farbige Stücke zerlegt (Der | Wellen | dicht | ring | sitzt | im | Lager | schild | .). Unter jedem Stück erscheint eine Nummer; ein Modellkasten zeigt nur die Zahlenfolge.",
 "Tabelle der Nachfolger von die: welle viermal, schraube einmal, daneben zwei Balken mit 80 und 20 Prozent. Darunter der Hinweis Bigramm = Kontext ein Wort; ein größerer Kasten neuronales Netz mit demselben Ergebnis.",
 "Würfelband mit einem Stück welle (80 Prozent) und einem Stück schraube (20 Prozent) und einer roten Marke für die Zufallszahl. Ein Satz entsteht Wort für Wort. Ein Regler Temperatur verändert die Breite der Stücke; ein Feld Seed 4 erscheint.",
 "Satz das zahnrad treibt die schraube hält das zahnrad. mit Klammern um jedes Wortpaar, jedes grün markiert als im Training vorhanden. Darunter in Rot der Stempel Halluzination und das Schild keine Quellenprüfung.",
 "Checkliste mit sechs Haken: Zahlen gegenrechnen, Einheiten prüfen, Norm öffnen, Quelle anklicken, Randfälle testen, nichts Vertrauliches eingeben. Unten das Wissens-Ampel-Symbol Im Kopf und der Satz KI entwirft, du verantwortest.",
]
