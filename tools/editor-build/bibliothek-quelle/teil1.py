from helfer import E

AE = "Ausgabe & Eingabe"
VD = "Variablen & Datentypen"
RE = "Rechnen"
MA = "Mathematik (math)"
TX = "Text & Formatierung"

# ───────────── V01 ─────────────
E("print", "print", AE, "V01", "kopf",
  "Gibt Werte auf dem Bildschirm aus.",
  "print(wert1, wert2, ..., sep=' ', end='\\n')",
  "print() schreibt alles, was du in die Klammern setzt, in die Ausgabe. Mehrere Werte trennst du mit Komma, Python setzt dazwischen ein Leerzeichen. Mit sep= änderst du das Trennzeichen, mit end= das Zeilenende. Zum Prüfen deines Programms ist print() dein wichtigstes Werkzeug.",
  '''
  drehzahl = 1450
  print("Drehzahl:", drehzahl, "1/min")
  print("Welle", 3, sep="-")
  ''',
  "Immer wenn du ein Ergebnis sehen oder einen Zwischenwert kontrollieren willst.",
  [("Mehrere Werte mit Einheit in eine Zeile", 'kraft = 250\nprint("Kraft:", kraft, "N")'),
   ("Leere Zeile als optischer Abstand", 'print("Ergebnis A")\nprint()\nprint("Ergebnis B")'),
   ("Ausgabe in derselben Zeile fortsetzen", 'print("Messung läuft", end=" ... ")\nprint("fertig")')],
  [("Klammern vergessen (Python-2-Schreibweise)", 'print "Hallo"'),
   ("Anführungszeichen vergessen: Python sucht eine Variable", 'print(Hallo)')],
  ["zuweisung", "str-text", "fstring"])

E("zuweisung", "Variable & Zuweisung", VD, "V01", "kopf",
  "Legt einen Wert unter einem Namen ab.",
  "name = ausdruck",
  "Das Gleichheitszeichen ist in Python keine Gleichung, sondern ein Befehl: Erst wird die rechte Seite ausgerechnet, dann liegt das Ergebnis unter dem Namen links. Danach kannst du den Namen überall statt des Werts benutzen. Eine Variable darfst du später jederzeit neu belegen.",
  '''
  laenge_mm = 250
  laenge_m = laenge_mm / 1000
  laenge_mm = laenge_mm + 50
  print(laenge_mm, laenge_m)
  ''',
  "Sobald ein Wert mehrfach gebraucht wird oder du ihm einen sprechenden Namen geben willst (statt Zahlen im Code zu verstecken).",
  [("Zwei Werte tauschen, ohne Hilfsvariable", 'a = 1\nb = 2\na, b = b, a\nprint(a, b)'),
   ("Einen Wert hochzählen (Zähler)", 'stueck = 0\nstueck = stueck + 1\nstueck = stueck + 1\nprint(stueck)'),
   ("Mehrere Namen auf denselben Startwert setzen", 'x = y = 0\nprint(x, y)')],
  [("Name benutzt, bevor er einen Wert hat", 'print(gewicht_n * 9.81)'),
   ("Zuweisung = statt Vergleich == in einer Bedingung", 'x = 5\nif x = 5:\n    print("fünf")')],
  ["namensregeln", "vergleiche", "kommentar"],
  bez=["="])

E("kommentar", "Kommentar", AE, "V01", "kopf",
  "Text nach # ignoriert Python – er ist nur für Menschen.",
  "# Kommentar bis zum Zeilenende",
  "Alles ab dem #-Zeichen bis zum Zeilenende überspringt Python. Schreibe Kommentare für das Warum und für Einheiten, nicht für das, was der Code ohnehin sagt. Mit # kannst du außerdem Zeilen beim Testen kurz deaktivieren.",
  '''
  d_mm = 40          # Wellendurchmesser in mm
  # print("Debug:", d_mm)
  print(d_mm / 2)    # Radius in mm
  ''',
  "Für Einheiten, Annahmen, Quellen von Formeln und zum zeitweisen Abschalten einer Zeile.",
  [("Einheit dokumentieren", 'p_bar = 6.5   # Betriebsdruck in bar\nprint(p_bar * 0.1, "MPa")'),
   ("Zeile zum Testen auskommentieren", 'print("A")\n# print("B")\nprint("C")'),
   ("Merker für später (TODO)", '# TODO: Toleranz aus Zeichnung prüfen\ntoleranz = 0.05\nprint(toleranz)')],
  [("# innerhalb von Anführungszeichen ist Text, kein Kommentar", 'print("Nr. # 5")', "(keine Fehlermeldung) Ausgabe: Nr. # 5 – in einem String bleibt das # normaler Text."),
   ("Code hinter # wird nie ausgeführt", 'x = 5  # + 10\nprint(x)', "(keine Fehlermeldung) Ausgabe: 5 – das \"+ 10\" steht im Kommentar und zählt nicht.")],
  ["print", "zuweisung"],
  bez=["#"])

E("input", "input", AE, "V01", "kopf",
  "Liest eine Eingabe von der Tastatur – immer als Text (str).",
  "text = input('Fragetext: ')",
  "input() zeigt den Fragetext, wartet auf Enter und liefert das Eingegebene als Text zurück – auch wenn du eine Zahl tippst. Für Rechnungen wandelst du mit int() oder float() um. Beim Ausführen hier öffnet sich ein Terminal, in das du die Antworten direkt tippst; mit dem Umschalter „Eingaben“ kannst du sie auch vorab eintragen.",
  '''
  text = input("Durchmesser in mm: ")
  d = float(text)
  print("Umfang:", 3.14159 * d, "mm")
  ''',
  "Wenn dein Programm Werte vom Benutzer braucht, die beim Schreiben noch nicht feststehen.",
  [("Ganze Zahl abfragen", 'n = int(input("Stückzahl: "))\nprint("Doppelt:", n * 2)'),
   ("Text abfragen und begrüßen", 'name = input("Name: ")\nprint("Hallo", name)')],
  [("Eingabe ist Text: Rechnen mit + scheitert", 'zahl = input("Zahl: ")\nprint(zahl + 1)'),
   ("Dezimalkomma statt Punkt eingegeben", 'wert = float("3,5")')],
  ["typumwandlung", "float", "int"],
  lauff=False, stdin="5\n")

E("namensregeln", "Namensregeln", VD, "V01", "kopf",
  "Welche Namen für Variablen erlaubt und sinnvoll sind.",
  "kleinbuchstaben_mit_unterstrich  (nicht mit Ziffer beginnen, keine Leerzeichen)",
  "Namen bestehen aus Buchstaben, Ziffern und Unterstrich und dürfen nicht mit einer Ziffer beginnen. Groß- und Kleinschreibung zählt: kraft und Kraft sind zwei verschiedene Variablen. Wörter wie if, for oder class sind reserviert. Wähle Namen, die das Gemeinte samt Einheit sagen, zum Beispiel wandstaerke_mm.",
  '''
  wandstaerke_mm = 2.5
  anzahl_bohrungen = 4
  kraft = 10
  Kraft = 99
  print(wandstaerke_mm * anzahl_bohrungen, kraft, Kraft)
  ''',
  "Bei jeder Variable: Ein guter Name erspart den Kommentar und verhindert mm/m-Verwechslungen.",
  [("Einheit im Namen gegen Verwechslungen", 'laenge_mm = 1200\nlaenge_m = laenge_mm / 1000\nprint(laenge_m)'),
   ("Konstanten GROSS schreiben (Konvention)", 'G = 9.81\nmasse_kg = 5\nprint(masse_kg * G)')],
  [("Name beginnt mit einer Ziffer", '2d_flaeche = 3'),
   ("Leerzeichen im Namen", 'wand staerke = 3'),
   ("Reserviertes Wort als Name", 'class = 3')],
  ["zuweisung", "kommentar"],
  bez=["Namensregeln"])

E("str-text", "Text (str)", VD, "V01", "kopf",
  "Zeichenketten in Anführungszeichen – Namen, Meldungen, Dateipfade.",
  "text = \"Hallo\"   oder   'Hallo'",
  "Ein str ist Text in einfachen oder doppelten Anführungszeichen. Mit + hängst du Texte aneinander, mit * wiederholst du sie. Zahlen und Text lassen sich nicht einfach mischen: Dafür wandelst du mit str() um oder nimmst einen f-String.",
  '''
  bauteil = "Welle"
  nr = "A-17"
  print(bauteil + " " + nr)
  print("=" * 20)
  ''',
  "Für alles, was Text ist: Meldungen, Bauteilnamen, Dateinamen, Eingaben.",
  [("Trennlinie in der Ausgabe", 'print("-" * 30)'),
   ("Dateinamen zusammensetzen", 'nummer = "07"\nprint("messung_" + nummer + ".csv")'),
   ("Anführungszeichen im Text", 'print("Er sagte: \'Stopp\'")')],
  [("Text und Zahl mit + verbinden", 'print("Teil " + 5)'),
   ("Anführungszeichen nicht geschlossen", 'print("Hallo)')],
  ["print", "typumwandlung", "fstring"],
  bez=["str"])

# ───────────── V02 ─────────────
E("int", "int (Ganzzahl)", VD, "V02", "kopf",
  "Ganze Zahlen ohne Nachkommastellen.",
  "zahl = 42     int(wert)",
  "Python-Ganzzahlen haben keine feste Obergrenze: Sie wachsen so weit, wie der Speicher reicht. Das ist anders als bei einem 16-Bit-Zähler in der Steuerung, der bei 65535 überläuft. int(x) wandelt Text oder eine Fließkommazahl in eine Ganzzahl um und schneidet dabei Nachkommastellen ab.",
  '''
  zaehler = 65535
  zaehler = zaehler + 1
  print(zaehler)
  print(2**64)
  print(int(7.9), int("42"))
  ''',
  "Für Zählungen, Stückzahlen, Indizes und alles, was nicht gebrochen sein kann.",
  [("Stückzahl hochrechnen", 'pro_schicht = 480\nprint(pro_schicht * 3)'),
   ("Abschneiden statt Runden", 'print(int(2.99), int(-2.99))'),
   ("Riesige Zahlen ohne Überlauf", 'print(2**100)')],
  [("Text mit Dezimalpunkt direkt in int umwandeln", 'int("3.7")'),
   ("Führende Null im Zahlenliteral", 'x = 007')],
  ["float", "typumwandlung", "bin-hex"],
  bez=["int"])

E("rechenoperatoren", "Rechenoperatoren + − * /", RE, "V02", "kopf",
  "Addieren, Subtrahieren, Multiplizieren, Dividieren.",
  "a + b    a - b    a * b    a / b",
  "Die vier Grundrechenarten schreibst du wie gewohnt, das Malzeichen ist aber immer *. Die Division / liefert stets eine Fließkommazahl, auch wenn das Ergebnis glatt aufgeht: 10 / 2 ergibt 5.0. Durch null zu teilen bricht das Programm ab.",
  '''
  kraft_n = 1200
  flaeche_mm2 = 40
  spannung = kraft_n / flaeche_mm2
  print(spannung, "N/mm²")
  print(10 / 2)
  ''',
  "Für jede Formel, die du in Code übersetzt.",
  [("Mittelwert zweier Messwerte", 'a = 20.1\nb = 20.5\nprint((a + b) / 2)'),
   ("Einheit umrechnen", 'weg_mm = 3250\nprint(weg_mm / 1000, "m")'),
   ("Prozentwert", 'preis = 80\nprint(preis * 0.19, "Euro MwSt")')],
  [("Division durch null", 'print(5 / 0)'),
   ("Malzeichen vergessen oder durch x ersetzt", 'print(5 x 3)')],
  ["floordiv", "modulo", "rangfolge", "potenz"],
  bez=["+", "-", "*", "/"])

E("floordiv", "Ganzzahldivision //", RE, "V02", "kopf",
  "Teilt und rundet das Ergebnis ab auf die nächste ganze Zahl.",
  "a // b",
  "Mit // fragst du, wie oft b ganz in a passt. Das Ergebnis wird immer nach unten gerundet, bei negativen Zahlen also weg von der Null. Zusammen mit dem Rest (%) zerlegst du Mengen in volle Einheiten und Rest.",
  '''
  teile = 1000
  pro_palette = 48
  print(teile // pro_palette, "volle Paletten")
  ''',
  "Wenn nur ganze Einheiten zählen: volle Paletten, ganze Stunden, Seitenzahlen.",
  [("Minuten in volle Stunden", 'minuten = 135\nprint(minuten // 60, "h")'),
   ("Anzahl benötigter Kisten aufrunden (Trick)", 'teile = 1000\nprint(-(-teile // 48))'),
   ("Mitte einer Liste finden", 'n = 9\nprint(n // 2)')],
  [("Durch null teilen", 'print(7 // 0)'),
   ("Negative Zahl rundet nach unten, nicht Richtung null", 'print(-7 // 2)', "(keine Fehlermeldung) Ausgabe: -4 – // rundet Richtung minus unendlich, nicht Richtung null.")],
  ["modulo", "rechenoperatoren", "round"],
  bez=["//"])

E("modulo", "Rest (Modulo) %", RE, "V02", "kopf",
  "Liefert den Rest der Division.",
  "a % b",
  "a % b ist der Rest, der bei a geteilt durch b übrig bleibt. Er liegt immer zwischen 0 und b-1. Typische Einsätze: gerade oder ungerade prüfen, Zähler im Kreis laufen lassen (wie ein Encoder) und jede n-te Wiederholung erkennen.",
  '''
  sekunden = 7384
  minuten = sekunden // 60
  rest_s = sekunden % 60
  print(minuten, "min", rest_s, "s")
  ''',
  "Für Restmengen, gerade/ungerade und alles, was sich zyklisch wiederholt.",
  [("Gerade oder ungerade", 'n = 17\nprint(n % 2 == 0)'),
   ("Zähler läuft im Kreis (Encoder mit 4096 Schritten)", 'pos = 4095\npos = (pos + 1) % 4096\nprint(pos)'),
   ("Nur jeden 10. Durchlauf melden", 'for i in range(1, 31):\n    if i % 10 == 0:\n        print("Durchlauf", i)')],
  [("Rest mit null", 'print(7 % 0)'),
   ("% als Prozentzeichen missverstanden", 'print(200 * 5 %)')],
  ["floordiv", "rechenoperatoren", "if"],
  bez=["%"])

E("potenz", "Potenz **", RE, "V02", "kopf",
  "Potenzieren und Wurzelziehen.",
  "a ** b",
  "a ** b ist a hoch b. Mit gebrochenen Exponenten ziehst du Wurzeln: x ** 0.5 ist die Quadratwurzel. Das Zeichen ^, das du vom Taschenrechner kennst, ist in Python etwas ganz anderes (bitweises XOR).",
  '''
  d = 20
  print(d**2)
  print(2**10)
  print(9**0.5)
  ''',
  "Für Quadrate, Kubikzahlen, Zweierpotenzen (Bits!) und Wurzeln ohne math-Modul.",
  [("Anzahl Werte bei n Bit", 'bits = 8\nprint(2**bits)'),
   ("Kreisfläche aus dem Durchmesser", 'd = 40\nprint(3.14159 * d**2 / 4)'),
   ("Kubikwurzel als Exponent 1/3", 'print(27 ** (1/3))')],
  [("^ statt ** benutzt", 'print(2 ^ 3)', "(keine Fehlermeldung) Ausgabe: 1 – ^ ist bitweises XOR, nicht Potenz."),
   ("Null hoch negative Zahl", 'print(0 ** -1)')],
  ["rangfolge", "sqrt", "rechenoperatoren"],
  bez=["**"])

E("rangfolge", "Operatorrangfolge", RE, "V02", "kopf",
  "Punkt vor Strich – und wie Klammern die Reihenfolge ändern.",
  "** vor * / // % vor + -   (Klammern gehen vor)",
  "Python rechnet wie in der Mathematik: Potenz vor Punktrechnung, Punkt vor Strich, gleichrangige Operatoren von links nach rechts. Bei Zweifeln setze Klammern, sie kosten nichts und machen Formeln lesbar. Achtung: -2 ** 2 ist -4, weil ** stärker bindet als das Minus.",
  '''
  print(2 + 3 * 4)
  print((2 + 3) * 4)
  print(-2 ** 2)
  print(2 ** 3 ** 2)
  ''',
  "Bei jeder Formel mit mehr als einem Operator – besonders beim Nenner eines Bruchs.",
  [("Mittelwert: Klammern sind Pflicht", 'a = 10\nb = 20\nprint(a + b / 2, (a + b) / 2)'),
   ("Nenner mit mehreren Faktoren klammern", 'F = 1000\nd = 10\nprint(F / (3.14159 * d**2 / 4))'),
   ("Gleichrangig läuft von links nach rechts", 'print(100 / 10 / 2)')],
  [("Klammer nicht geschlossen", 'print((2 + 3) * 4'),
   ("Nenner ohne Klammer: Formel falsch, aber kein Fehler", 'print(100 / 2 * 5)', "(keine Fehlermeldung) Ausgabe: 250.0 – gemeint war vielleicht 100 / (2 * 5) = 10.0.")],
  ["potenz", "rechenoperatoren"],
  bez=["Rangfolge"])

E("bin-hex", "bin(), hex(), int(x, Basis)", RE, "V02", "lesen",
  "Zahlen in Binär- und Hexadezimalschreibweise umwandeln.",
  "bin(n)    hex(n)    int('1010', 2)    0b1010    0xFF",
  "bin() und hex() liefern Text wie '0b11001010' oder '0xca'. In die Gegenrichtung gibst du int() den Text und die Basis: int('11001010', 2). Zahlen kannst du auch direkt als 0b… oder 0x… schreiben. Für Bitmuster aus Sensoren und Bussen ist das nützlich.",
  '''
  wert = 202
  print(bin(wert))
  print(hex(wert))
  print(int("11001010", 2))
  print(int("CA", 16))
  ''',
  "Beim Lesen von Registerwerten, Bitmasken und Zahlen aus Datenblättern.",
  [("Hex-Literal im Code", 'maske = 0xFF\nprint(maske)'),
   ("Binär-Literal im Code", 'status = 0b1010\nprint(status)'),
   ("Größter Wert eines 8-Bit-Zählers", 'print(2**8 - 1, hex(2**8 - 1))')],
  [("Ziffer 2 in einer Binärzahl", 'int("102", 2)'),
   ("Text statt Zahl an bin()", 'bin("5")')],
  ["int", "potenz"],
  bez=["bin", "hex"])

# ───────────── V03 ─────────────
E("float", "float (Fließkommazahl)", VD, "V03", "kopf",
  "Zahlen mit Nachkommastellen – mit Rundungsfehlern.",
  "x = 3.14     float(wert)     1e-3",
  "float speichert Zahlen mit Dezimalpunkt (nicht Komma!). Intern sind es Binärbrüche, deshalb sind viele Dezimalzahlen nur angenähert: 0.1 + 0.2 ergibt 0.30000000000000004. Vergleiche mit == sind bei floats gefährlich, nimm math.isclose().",
  '''
  print(0.1 + 0.2)
  print(0.1 + 0.2 == 0.3)
  print(1e-3, 2.5e6)
  print(10 / 4)
  ''',
  "Für alle Messwerte, Längen, Kräfte, Temperaturen – alles, was nicht ganzzahlig ist.",
  [("Zehnmal 0,1 addieren", 'summe = 0.0\nfor i in range(10):\n    summe += 0.1\nprint(summe)'),
   ("Wissenschaftliche Schreibweise", 'e_modul = 2.1e5\nprint(e_modul, "N/mm²")'),
   ("Ganzzahl in float umwandeln", 'print(float(3), float("2.5"))')],
  [("Dezimalkomma statt Punkt im Code", 'x = 3,5\nprint(x)', "(keine Fehlermeldung) x ist das Tupel (3, 5), keine Zahl."),
   ("Text ohne Zahl umwandeln", 'float("abc")')],
  ["isclose", "int", "typumwandlung", "round"],
  bez=["float"])

E("type", "type()", VD, "V03", "lesen",
  "Zeigt, welchen Datentyp ein Wert hat.",
  "type(wert)",
  "type() verrät, ob ein Wert int, float, str oder bool ist. Das ist die schnellste Hilfe, wenn eine Rechnung merkwürdige Ergebnisse oder einen TypeError liefert, zum Beispiel weil input() Text geliefert hat.",
  '''
  print(type(42))
  print(type(3.14))
  print(type("Hallo"))
  print(type(5 / 2))
  print(type(True))
  ''',
  "Beim Debuggen: Wenn ein Ergebnis überrascht oder ein TypeError auftritt.",
  [("Prüfen, was eine Rechnung liefert", 'print(type(6 // 2), type(6 / 2))'),
   ("Wert nach der Umwandlung kontrollieren", 'x = "12"\nprint(type(x), type(int(x)))')],
  [("Text und Zahl addieren", '"5" + 3'),
   ("Text mit Text multiplizieren", '"5" * "3"')],
  ["typumwandlung", "float", "int"],
  bez=["type"])

E("typumwandlung", "Typumwandlung int() / float() / str()", VD, "V03", "kopf",
  "Wandelt einen Wert in einen anderen Datentyp um.",
  "int(x)    float(x)    str(x)",
  "Daten aus input() oder Dateien sind Text und müssen für Rechnungen mit float() oder int() umgewandelt werden. int() schneidet Nachkommastellen ab, rundet also nicht. str() macht aus einer Zahl Text, etwa um sie an einen Text zu hängen. Passt der Inhalt nicht, gibt es einen ValueError.",
  '''
  eingabe = "12.5"
  d = float(eingabe)
  n = int(7.9)
  print(d * 2, n, str(n) + " Stück")
  ''',
  "Immer, wenn Daten aus einer Eingabe oder Datei kommen oder Zahlen in einen Text sollen.",
  [("Dezimalkomma ersetzen", 'text = "3,5"\nprint(float(text.replace(",", ".")))'),
   ("int() schneidet ab, auch bei negativen Zahlen", 'print(int(-2.7), int(2.7))'),
   ("Wahrheitswert als Zahl", 'print(int(True), int(False))')],
  [("Text mit Dezimalpunkt direkt in int", 'int("3.7")'),
   ("Leerer Text lässt sich nicht umwandeln", 'float("")')],
  ["input", "type", "float", "int", "str-text"],
  bez=["Typumwandlung"])

E("fstring", "f-String & Formatierung", TX, "V03", "kopf",
  "Werte direkt in Text einbauen und dabei formatieren.",
  "f\"Text {wert}\"    {x:.2f}    {x:>8}    {x:.1%}",
  "Ein f vor dem Anführungszeichen macht aus dem Text eine Schablone: Alles in {} wird als Ausdruck berechnet und eingesetzt. Nach einem Doppelpunkt legst du das Format fest: .2f heißt zwei Nachkommastellen, >8 rechtsbündig in Breite 8, .1% als Prozent, , als Tausendertrennzeichen.",
  '''
  d = 12.3456
  laenge = 250
  print(f"Durchmesser: {d:.2f} mm")
  print(f"Länge: {laenge:>8} mm")
  print(f"Anteil: {0.256:.1%}")
  ''',
  "Für jede Ausgabe mit Zahlen: Ergebnisse mit passender Stellenzahl und Einheit.",
  [("Tausendertrennzeichen", 'print(f"{1234567:,} Stück")'),
   ("Wissenschaftliche Notation", 'print(f"{0.000123:.2e}")'),
   ("Tabelle mit festen Spaltenbreiten", 'for n, w in [("M6", 10.0), ("M10", 49.5)]:\n    print(f"{n:<5}{w:>8.1f} N")')],
  [("f vor dem String vergessen", 'd = 3.14159\nprint("{d:.2f}")', "(keine Fehlermeldung) Ausgabe: {d:.2f} – ohne f bleibt die Schablone wörtlich stehen."),
   ("Geschweifte Klammer nicht geschlossen", 'd = 3.14\nprint(f"Wert {d")'),
   ("Zahlenformat auf Text angewendet", 'print(f"{\'abc\':.2f}")')],
  ["print", "round", "str-text"],
  bez=["f-String", "format"])

E("round", "round()", RE, "V03", "kopf",
  "Rundet auf eine bestimmte Stellenzahl.",
  "round(x)    round(x, stellen)",
  "round(x, 2) rundet auf zwei Nachkommastellen, round(x) auf eine ganze Zahl. Bei genau .5 rundet Python zur nächsten geraden Zahl (round(2.5) ist 2) und wegen der Fließkomma-Darstellung kann auch round(2.675, 2) überraschen. Für reine Anzeige reicht oft die Formatierung mit :.2f im f-String.",
  '''
  print(round(3.14159, 2))
  print(round(2.5), round(3.5))
  print(round(1234.5678, -2))
  ''',
  "Wenn du den gerundeten Wert weiterverwenden willst; zum reinen Anzeigen nimm :.2f.",
  [("Auf eine Nachkommastelle", 'print(round(20.46, 1))'),
   ("Auf Hunderter runden", 'print(round(8765, -2))'),
   ("Anzeige ohne den Wert zu verändern", 'x = 2.0 / 3\nprint(f"{x:.3f}", x)')],
  [("Text statt Zahl", 'round("3.5")'),
   ("Dezimal-Rundung überrascht", 'print(round(2.675, 2))', "(keine Fehlermeldung) Ausgabe: 2.67 – 2.675 ist intern etwas kleiner als 2,675.")],
  ["fstring", "float", "abs"],
  bez=["round"])

E("abs", "abs()", RE, "V03", "kopf",
  "Betrag: entfernt das Vorzeichen.",
  "abs(x)",
  "abs() liefert den Betrag einer Zahl, also ihren Abstand von null. Für Toleranzprüfungen ist abs(ist - soll) die richtige Größe, weil es egal ist, ob du zu groß oder zu klein bist.",
  '''
  soll = 50.00
  ist = 49.97
  abweichung = abs(ist - soll)
  print(f"Abweichung: {abweichung:.2f} mm")
  ''',
  "Bei Abweichungen, Abständen und Toleranzprüfungen.",
  [("Toleranzprüfung", 'ist, soll, tol = 10.04, 10.0, 0.05\nprint(abs(ist - soll) <= tol)'),
   ("Betrag einer negativen Zahl", 'print(abs(-3.5))')],
  [("Text statt Zahl", 'abs("5")'),
   ("Klammern vergessen: abs wird mit Minus verwechselt", 'abs -3')],
  ["isclose", "round", "vergleiche"],
  bez=["abs"])

E("import-math", "import math", MA, "V03", "kopf",
  "Holt das math-Modul mit Wurzel, Pi, Winkelfunktionen & Co.",
  "import math    from math import sqrt",
  "Nicht alles ist sofort in Python verfügbar. Mit import math lädst du ein Modul, danach rufst du seine Funktionen mit Punkt auf: math.sqrt(2). Die import-Zeile steht üblicherweise ganz oben im Programm.",
  '''
  import math
  print(math.pi)
  print(math.sqrt(2))
  print(math.sin(math.radians(30)))
  ''',
  "Sobald du Wurzel, Pi, Sinus/Cosinus, Logarithmus oder isclose brauchst.",
  [("Einzelne Funktion direkt importieren", 'from math import sqrt\nprint(sqrt(16))'),
   ("Kurzer Alias", 'import math as m\nprint(m.pi)')],
  [("Modul nicht importiert", 'print(math.pi)'),
   ("Modulname falsch geschrieben (Groß/Klein)", 'import Math')],
  ["sqrt", "pi", "isclose"],
  bez=["math", "import"])

E("sqrt", "math.sqrt()", MA, "V03", "kopf",
  "Quadratwurzel.",
  "math.sqrt(x)",
  "math.sqrt(x) liefert die Quadratwurzel als float. Sie ist für negative Zahlen nicht definiert und löst dann einen ValueError aus. Für den Abstand zweier Punkte oder den Satz des Pythagoras brauchst du sie ständig.",
  '''
  import math
  a = 3.0
  b = 4.0
  c = math.sqrt(a**2 + b**2)
  print(c)
  ''',
  "Für Längen aus Komponenten, Standardabweichung, Radius aus Fläche.",
  [("Radius aus der Kreisfläche", 'import math\nA = 314.0\nprint(math.sqrt(A / math.pi))'),
   ("Abstand zweier Punkte", 'import math\nx1, y1, x2, y2 = 0, 0, 30, 40\nprint(math.sqrt((x2 - x1)**2 + (y2 - y1)**2))'),
   ("Wurzel als Potenz (gleiches Ergebnis)", 'print(16 ** 0.5)')],
  [("Wurzel einer negativen Zahl", 'import math\nmath.sqrt(-4)'),
   ("Text statt Zahl", 'import math\nmath.sqrt("9")')],
  ["import-math", "potenz", "pi"],
  bez=["math.sqrt", "sqrt"])

E("pi", "math.pi", MA, "V03", "kopf",
  "Die Kreiszahl π als float-Konstante.",
  "math.pi",
  "math.pi ist keine Funktion, sondern eine Konstante – deshalb ohne Klammern. Sie hat rund 15 gültige Stellen, genug für jede technische Rechnung. Für Winkel in Grad brauchst du math.radians().",
  '''
  import math
  d = 40.0
  print("Umfang:", math.pi * d)
  print("Fläche:", math.pi * d**2 / 4)
  ''',
  "Bei allem mit Kreisen, Wellen, Schwingungen und Winkeln.",
  [("Kreisfrequenz aus der Frequenz", 'import math\nf = 50\nprint(2 * math.pi * f)'),
   ("Grad in Bogenmaß", 'import math\nprint(math.radians(90))'),
   ("Zylindervolumen", 'import math\nd, h = 20, 50\nprint(math.pi * d**2 / 4 * h)')],
  [("Konstante großgeschrieben", 'import math\nprint(math.PI)'),
   ("pi wie eine Funktion aufgerufen", 'import math\nprint(math.pi())')],
  ["import-math", "sqrt"],
  bez=["math.pi", "pi"])

E("isclose", "math.isclose()", MA, "V03", "kopf",
  "Vergleicht zwei Fließkommazahlen mit Toleranz.",
  "math.isclose(a, b, rel_tol=1e-09, abs_tol=0.0)",
  "Wegen Rundungsfehlern sind a == b bei floats unzuverlässig. math.isclose(a, b) prüft, ob die Werte praktisch gleich sind. Mit abs_tol=… gibst du eine absolute Toleranz an, nötig zum Beispiel beim Vergleich mit 0 oder bei Maßtoleranzen.",
  '''
  import math
  a = 0.1 + 0.2
  print(a == 0.3)
  print(math.isclose(a, 0.3))
  print(math.isclose(10.02, 10.0, abs_tol=0.05))
  ''',
  "Immer, wenn berechnete Fließkommazahlen auf Gleichheit oder Toleranz geprüft werden.",
  [("Maß innerhalb Toleranz", 'import math\nprint(math.isclose(49.97, 50.0, abs_tol=0.05))'),
   ("Vergleich mit null braucht abs_tol", 'import math\nprint(math.isclose(0.0, 1e-12), math.isclose(0.0, 1e-12, abs_tol=1e-9))')],
  [("Dritter Wert positional übergeben", 'import math\nmath.isclose(1, 1.1, 0.2)'),
   ("Vergleich mit 0 ohne abs_tol", 'import math\nprint(math.isclose(0.0, 1e-12))', "(keine Fehlermeldung) Ausgabe: False – relative Toleranz hilft bei 0 nicht, abs_tol angeben.")],
  ["float", "vergleiche", "abs"],
  bez=["math.isclose", "isclose"])
