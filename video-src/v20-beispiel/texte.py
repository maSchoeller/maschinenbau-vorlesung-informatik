"""Sprechertext V20 Beispiel (Quelltext mit Markup), genau briefing/v20-beispiel.py."""
SRC = [
 ["Wir bauen den Flansch als Klasse: Außendurchmesser 120 Millimeter, Mittelloch 40, Dicke 15, sechs Bohrungen mit 11 Millimeter auf einem Lochkreis von 90.",
  "Rechts siehst du die Draufsicht.",
  "Die Klasse soll prüfen, ob die Maße passen, Volumen und Masse berechnen und am Ende ein 3D-Modell liefern."],
 ["Die Zeilen 5 und 6 holen `math` und das Hilfsmodul `bauteil3d`. Zeile 9 beginnt die Klasse `Flansch`.",
  "Die Methode [[__init__|init]] ab Zeile 12 nimmt sechs Maße entgegen und speichert jedes als Attribut mit `self.`.",
  "Ab jetzt trägt jedes Flansch-Objekt seine Maße selbst mit sich."],
 ["Die Methode `ist_gueltig` prüft zwei Regeln. Erstens: Die Bohrung darf nicht über den Rand ragen, Lochkreis plus Bohrungsdurchmesser halbiert muss kleiner sein als der halbe Außendurchmesser. Hier: 90 plus 11, halbiert 50,5, ist kleiner als 60.",
  "Zweitens: Sie darf nicht ins Mittelloch ragen. 90 minus 11, halbiert 39,5, ist größer als 20.",
  "Nur wenn beide Bedingungen stimmen, gibt die Methode `True` zurück."],
 ["`volumen` rechnet den Kreisring, Pi Viertel mal Außendurchmesser zum Quadrat minus Innendurchmesser zum Quadrat, mal Dicke. Davon gehen die Bohrungen ab. Beim Flansch sind das rund 150 000 Kubikmillimeter für den Ring, abzüglich knapp 8 600 für die Bohrungen.",
  "Das Ergebnis steht in Kubikmillimetern. `masse` teilt durch 1000 für Kubikzentimeter, multipliziert mit der Dichte und teilt nochmals durch 1000 für Kilogramm.",
  "Die Dichte ist per Default 7,85 für Stahl."],
 ["Jetzt benutzen wir die Klasse. Zeile 41 erzeugt `f` mit den Maßen 120, 40, 15, 90, 6 und 11.",
  "Die Ausgabe: Gültig `True`, Volumen 142,2 Kubikzentimeter, Masse 1,12 Kilogramm.",
  "Zeile 45 ändert `f.n` auf 8, und die Masse sinkt auf 1,09 Kilogramm.",
  "Ein zweites Objekt mit Lochkreis 110 und Bohrung 14 ist ungültig: `False`. 110 plus 14, halbiert 62, ist nicht kleiner als 60."],
 ["Zum Schluss liefert `mesh` das Dreiecksnetz, und `zeige` zeichnet die 3D-Ansicht, die du drehen kannst.",
  "Von dort lädst du die [[STL|S T L]]-Datei herunter, für den 3D-Druck oder ein [[CAD|Kad]]-Programm."],
]

SZENEN = [
 "Flansch-Draufsicht mit Maßen und Lochkreis.",
 "Code Zeilen 5 bis 18 (Import, Klassenkopf, __init__).",
 "Code ist_gueltig mit Prüfregel als kleiner PAP.",
 "Code volumen und masse mit Rechenweg.",
 "Code Zeilen 41 bis 49 mit Konsole und Draufsichten.",
 "3D-Ansicht und STL-Download.",
]
