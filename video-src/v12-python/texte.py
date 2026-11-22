"""Sprechertext V12 Python (Quelltext mit Markup)."""
SRC = [
 ["Mit `assert` stellst du eine Behauptung auf: `assert` und eine Bedingung. Ist sie wahr, passiert nichts. Ist sie falsch, löst Python einen `AssertionError` aus.",
  "Hinter ein Komma schreibst du eine Meldung in Anführungszeichen. Sie erscheint nur im Fehlerfall. Gute Meldungen nennen den Wert, das Erwartete und das Bekommene.",
  "Das Erwartete rechnest du von Hand aus der Spezifikation aus, nie aus der Funktion selbst."],
 ["Mehrere `assert`-Zeilen packst du in eine Testfunktion. Ihr Name beginnt mit `test_`, zum Beispiel `test_kmh_in_ms`.",
  "Die Funktion läuft erst, wenn du sie selbst aufrufst. Am Ende steht ein `print` mit dem Wort bestanden, denn bei Erfolg schweigt `assert`.",
  "Der erste gescheiterte `assert` beendet die Testfunktion."],
 ["Viele Testfälle schreibst du als Liste von Tupeln: erst die Eingabe, dann das erwartete Ergebnis.",
  "Eine Schleife geht sie durch. Mit `for t, erwartet in faelle` wird jedes Tupel in zwei Namen ausgepackt, wie bei `items` in Lektion acht.",
  "Die Meldung ist ein f-String mit den Werten. So siehst du sofort, welcher Fall gescheitert ist."],
 ["Berechnete Kommazahlen sind selten exakt gleich. Null Komma eins plus null Komma zwei ist nicht null Komma drei.",
  "Darum vergleichst du sie beim Testen mit Toleranz: `math.isclose` mit `rel_tol`, oder `abs` der Differenz kleiner als eine kleine Zahl.",
  "Texte, ganze Zahlen und Wahrheitswerte vergleichst du weiter mit zwei Gleichheitszeichen."],
 ["Willst du alle gescheiterten Tests sehen, fängst du den `AssertionError` mit `try` und `except` ab.",
  "Neu ist das Wort `as`: `except AssertionError as fehler` gibt der Ausnahme den Namen `fehler`. Mit `print(fehler)` zeigst du deine Meldung.",
  "Fang nur `AssertionError`, damit Tippfehler im Test weiter auffallen."],
 ["Zum Beobachten setzt du ein `print` an die verdächtige Stelle und gibst auch das aus, was entscheidet.",
  "Oder du drückst unter dem Codefeld auf Schritt für Schritt. Dann siehst du Zeile für Zeile, welche Variable sich ändert.",
  "Schreibe `assert` nie mit Klammern um alles. Das ist ein Tupel, und das ist immer wahr: Der Test prüft dann nichts."],
]

SZENEN = [
 "Code assert kmh_in_ms(36) == 10.0, \"36 km/h müssen 10 m/s sein\"; links grüner Haken bei wahrer Bedingung (keine Ausgabe), rechts roter AssertionError mit der Meldung bei falscher Bedingung. Das Komma und die Meldung sind farbig markiert.",
 "Code def test_kmh_in_ms(): mit drei assert-Zeilen eingerückt, darunter der Aufruf test_kmh_in_ms() und print(\"bestanden\"); die Funktion wird als Block markiert, der Aufruf als eigene Zeile.",
 "Code faelle = [(20, \"normal\"), (70, \"warnung\"), ...] und die Schleife for t, erwartet in faelle; ein Tupel wird in zwei Kästchen t und erwartet zerlegt; f-String-Meldung mit den Werten.",
 "Zwei Zeilen 0.1 + 0.2 == 0.3 ergibt False und math.isclose(0.1 + 0.2, 0.3) ergibt True; daneben ein Toleranzband um den Sollwert.",
 "Code mit try, assert und except AssertionError as fehler; ein Pfeil springt bei gescheitertem assert in den except-Block; das Wort as bekommt ein Etikett fehler, print(fehler) zeigt die Meldung.",
 "Links print mit zwei Werten an einer Bedingung; rechts der Schritt-für-Schritt-Visualisierer mit Variablenfenster; darunter ein durchgestrichenes assert mit Klammern und der Hinweis immer wahr.",
]
