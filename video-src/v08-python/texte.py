"""Sprechertext Termin 08, Video 2: Python-Werkzeugkasten: Text, umwandeln, lokale Namen, Rest und True oder False (Quelltext mit Markup)."""
SRC = [
 ["Vier Karten für deinen Werkzeugkasten.",
  "Karte 1 zeigt Text und Wahrheitswerte. Karte 2 zeigt das Umwandeln. Karte 3 zeigt, wo Namen in einer Funktion gelten.",
  "Karte 4 zeigt den Rest beim Teilen und Funktionen, die [[True|truh]] oder [[False|fals]] zurückgeben. Alles aus den Terminen zwei bis sieben gilt weiter."],
 ["Karte 1: Text steht in Anführungszeichen. Mit [[+|plus]] hängst du Text aneinander. Das Leerzeichen gehört in den Text.",
  "[[type|teip]] nennt den Typ. Der Text hat den Typ [[str|ess-tee-er]]. Ein Vergleich wie [[5 > 3|fünf größer drei]] hat den Typ [[bool|buhl]].",
  "Mit [[==|gleich gleich]] vergleichst du Text mit Text. [[name == \"Lea\"|name gleich gleich Lea in Anführungszeichen]] ergibt [[True|truh]]."],
 ["Karte 2 wandelt um. [[int(\"5\")|int von fünf in Anführungszeichen]] macht aus dem Text die Zahl 5. Danach kannst du rechnen: 5 plus 3 ergibt 8.",
  "[[float(\"2.5\")|float von zwei Komma fünf in Anführungszeichen]] macht eine Kommazahl daraus. Mal zwei ergibt [[5.0|fünf Komma null]].",
  "[[str(12)|str von zwölf]] macht aus der Zahl einen Text, den du an Punkte hängst. [[int(3.7)|int von drei Komma sieben]] ergibt 3: [[int|int]] schneidet ab.",
  "Denk daran: [[input|input]] liefert Text. Wandle um, bevor du rechnest."],
 ["Karte 3 zeigt die Funktion [[quadrat|quadrat]]. Sie rechnet [[x * x|x mal x]], speichert es in [[ergebnis|ergebnis]] und gibt es mit [[return|rietörn]] zurück.",
  "Draußen speicherst du den Wert in [[zahl|zahl]]. Das zeigt [[print|print]]: 16.",
  "In der letzten Zeile will [[print|print]] [[ergebnis|ergebnis]] zeigen. Draußen gibt es diesen Namen nicht. Python meldet einen [[NameError|neim-error]]: Der Name ist nicht definiert.",
  "[[x|x]] und [[ergebnis|ergebnis]] gibt es nur in der Funktion. Hinein geht ein Wert per Parameter, heraus geht er per [[return|rietörn]]."],
 ["Karte 4 beginnt mit dem Rest beim Teilen. Das Zeichen [[%|Prozent]] liefert den Rest. [[7 % 2|sieben Prozent zwei]] ergibt 1, [[8 % 2|acht Prozent zwei]] ergibt 0.",
  "Gerade heißt: Rest 0. Die Funktion [[ist_gerade|ist gerade]] fragt [[n % 2 == 0|n Prozent zwei gleich gleich null]].",
  "In beiden Zweigen steht ein [[return|rietörn]]: [[True|truh]] oder [[False|fals]]. Es läuft immer nur eines von beiden.",
  "Der Aufruf darf direkt in der Bedingung stehen. [[if ist_gerade(10):|if ist gerade von zehn]] druckt gerade."],
]

SZENEN = [
 "Vier Karten nebeneinander: 1 Text und Wahrheitswerte, 2 Umwandeln, 3 Namen in der Funktion, 4 Rest und True oder False; die bekannten Karten aus den Terminen 02 bis 07 liegen blass dahinter.",
 "Karte 1: Code mit name = Lea, print(Hallo + name), type(name), type(5 > 3), name == Lea; Ausgaben Hallo Lea, str, bool, True.",
 "Karte 2: Code mit int(5), float(2.5), str(12), int(3.7); Ausgaben 8, 5.0, Punkte: 12, 3; Hinweis: input liefert Text.",
 "Karte 3: Funktion quadrat mit ergebnis und return, Aufruf mit zahl, print(zahl), print(ergebnis); Ausgabe 16 und die Meldung NameError; Merksatz hinein per Parameter, heraus per return.",
 "Karte 4: 7 % 2 und 8 % 2, die Funktion ist_gerade mit n % 2 == 0 und return in beiden Zweigen, zwei Aufrufe und ein Aufruf in einem if; Ausgaben 1, 0, True, False, gerade.",
]
