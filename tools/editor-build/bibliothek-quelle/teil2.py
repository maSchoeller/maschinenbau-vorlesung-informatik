from helfer import E

BE = "Bedingungen"
SC = "Schleifen"
FU = "Funktionen"
VD = "Variablen & Datentypen"
TX = "Text & Formatierung"

# ───────────── V04 ─────────────
E("bool", "bool (Wahrheitswert)", VD, "V04", "kopf",
  "Ein Wert, der nur True oder False sein kann.",
  "True    False    bool(wert)",
  "Vergleiche liefern einen bool: entweder True (wahr) oder False (falsch). Beides schreibst du mit großem Anfangsbuchstaben. Intern zählt True wie 1 und False wie 0. Als falsch gelten außerdem 0, der leere Text und die leere Liste, alles andere gilt als wahr.",
  '''
  druck_bar = 6.5
  zu_hoch = druck_bar > 6
  print(zu_hoch, type(zu_hoch))
  print(True + True)
  print(bool(0), bool(""), bool("0"))
  ''',
  "Für Zustände wie „Tür geschlossen“, „Grenzwert überschritten“ oder Schalter im Programm.",
  [("Zustand in einer Variablen merken", 'tuer_zu = True\nnot_aus = False\nprint(tuer_zu and not not_aus)'),
   ("Wie viele Messwerte über dem Limit? (True zählt als 1)", 'werte = [3, 8, 9, 2]\nprint(sum(w > 5 for w in werte))'),
   ("Leere Liste ist falsch", 'fehler = []\nif not fehler:\n    print("keine Fehler")')],
  [("true klein geschrieben", 'x = true'),
   ("bool(\"False\") ist wahr, weil der Text nicht leer ist", 'print(bool("False"))', "(keine Fehlermeldung) Ausgabe: True – jeder nicht leere Text ist wahr.")],
  ["vergleiche", "and-or", "not", "if"],
  bez=["bool", "True", "False"])

E("vergleiche", "Vergleichsoperatoren", BE, "V04", "kopf",
  "Vergleicht Werte und liefert True oder False.",
  "==   !=   <   >   <=   >=",
  "Mit == prüfst du auf Gleichheit, mit != auf Ungleichheit, dazu kommen <, >, <= und >=. Ein einfaches = ist die Zuweisung und gehört nicht in eine Bedingung. Du kannst Vergleiche verketten: 9.5 <= d <= 10.5 prüft ein Toleranzband.",
  '''
  soll = 50.0
  ist = 50.2
  print(ist == soll, ist != soll)
  print(ist > soll, soll >= ist)
  print(49.5 <= ist <= 50.5)
  ''',
  "In jeder if- und while-Bedingung.",
  [("Toleranzband in einem Ausdruck", 'd = 10.03\nprint(9.95 <= d <= 10.05)'),
   ("Texte vergleichen", 'print("Stahl" == "Stahl", "a" < "b")'),
   ("Gleichheit bei Fließkommazahlen ist heikel", 'print(0.1 + 0.2 == 0.3)')],
  [("= statt == in der Bedingung", 'x = 3\nif x = 3:\n    print("drei")'),
   ("Text mit Zahl vergleichen", 'print("5" > 3)')],
  ["bool", "if", "isclose", "and-or"],
  bez=["==", "!=", "<", ">", "<=", ">="])

E("and-or", "and / or", BE, "V04", "kopf",
  "Verknüpft zwei Bedingungen: beide (and) oder mindestens eine (or).",
  "a and b      a or b",
  "and ist nur wahr, wenn beide Seiten wahr sind – wie die Zweihand-Sicherheitsschaltung, bei der beide Taster gedrückt sein müssen. or ist wahr, sobald eine Seite wahr ist. and bindet stärker als or; mit Klammern machst du deine Absicht eindeutig.",
  '''
  links = True
  rechts = False
  print(links and rechts)
  print(links or rechts)
  t = 55
  print(10 <= t and t <= 80)
  ''',
  "Wenn mehrere Voraussetzungen gleichzeitig oder alternativ gelten müssen.",
  [("Zweihandbedienung", 'taste_l, taste_r = True, True\nif taste_l and taste_r:\n    print("Presse fährt")'),
   ("Eine von zwei Störungen genügt", 'ueberlast = False\nuebertemperatur = True\nprint("Abschalten:", ueberlast or uebertemperatur)'),
   ("Wert außerhalb des Bereichs", 'x = 120\nprint(x < 0 or x > 100)')],
  [("or 2 vergleicht nicht mit 2", 'x = 5\nif x == 1 or 2:\n    print("immer wahr")', "(keine Fehlermeldung) Ausgabe: immer wahr – die 2 allein gilt als wahr; richtig ist x == 1 or x == 2."),
   ("Zweiten Vergleich unvollständig geschrieben", 'x = 7\nprint(x > 5 and < 10)')],
  ["not", "vergleiche", "if"],
  bez=["and", "or"])

E("not", "not", BE, "V04", "kopf",
  "Dreht einen Wahrheitswert um.",
  "not bedingung",
  "not macht aus True ein False und umgekehrt. Es ist gut lesbar bei Zuständen wie „nicht Tür offen“. Für Vergleiche ist != meist die lesbarere Alternative zu not (a == b).",
  '''
  tuer_offen = False
  print(not tuer_offen)
  if not tuer_offen:
      print("Maschine darf starten")
  ''',
  "Zum Umkehren von Zuständen und Flags.",
  [("Verneinte Zusammensetzung", 'a, b = True, False\nprint(not (a and b))'),
   ("Ungleich: zwei gleichwertige Schreibweisen", 'x = 3\nprint(not x == 4, x != 4)'),
   ("Leere Eingabe erkennen", 'eingabe = ""\nif not eingabe:\n    print("Bitte etwas eingeben")')],
  [("! wie in anderen Sprachen", 'tuer_offen = True\nprint(!tuer_offen)'),
   ("not gilt nur für den nächsten Ausdruck", 'print(not True == False)', "(keine Fehlermeldung) Ausgabe: True – gelesen als not (True == False).")],
  ["and-or", "bool", "vergleiche"])

E("if", "if", BE, "V04", "kopf",
  "Führt einen Block nur aus, wenn eine Bedingung wahr ist.",
  "if bedingung:\n    anweisungen",
  "Hinter if steht eine Bedingung und ein Doppelpunkt. Die Zeilen darunter, um vier Leerzeichen eingerückt, laufen nur ab, wenn die Bedingung wahr ist. Wo die Einrückung endet, endet auch der if-Block.",
  '''
  temperatur = 92
  if temperatur > 90:
      print("Warnung: Lager überhitzt")
  print("Ende der Prüfung")
  ''',
  "Sobald dein Programm je nach Wert etwas anderes tun soll.",
  [("Grenzwert überwachen", 'druck = 7.2\nif druck > 6.5:\n    print("Überdruck!")'),
   ("Mehrere Anweisungen im Block", 'n = 4\nif n % 2 == 0:\n    print("gerade")\n    print("durch 2 teilbar")'),
   ("Eingabe plausibilisieren", 'alter = -3\nif alter < 0:\n    print("Ungültig")')],
  [("Doppelpunkt vergessen", 'x = 3\nif x > 2\n    print("groß")'),
   ("Block nicht eingerückt", 'x = 3\nif x > 2:\nprint("groß")')],
  ["else", "elif", "einrueckung", "vergleiche"])

E("else", "else", BE, "V04", "kopf",
  "Der Alternativ-Block, wenn die if-Bedingung nicht zutrifft.",
  "if bedingung:\n    ...\nelse:\n    ...",
  "else hat keine eigene Bedingung und gehört immer zu einem davor stehenden if. Genau einer der beiden Blöcke wird ausgeführt.",
  '''
  last_kn = 8.5
  if last_kn <= 10:
      print("Last zulässig")
  else:
      print("Überlast")
  ''',
  "Bei einer Entweder-oder-Entscheidung.",
  [("Gerade oder ungerade", 'n = 7\nif n % 2 == 0:\n    print("gerade")\nelse:\n    print("ungerade")'),
   ("Gut/Schlecht-Prüfung eines Maßes", 'd = 10.08\nif abs(d - 10.0) <= 0.05:\n    print("i.O.")\nelse:\n    print("n.i.O.")')],
  [("else mit eigener Bedingung", 'x = 3\nif x > 5:\n    print("groß")\nelse x > 2:\n    print("mittel")'),
   ("else ohne if davor", 'else:\n    print("allein")')],
  ["if", "elif"])

E("elif", "elif", BE, "V04", "kopf",
  "Weitere Bedingung, die nur geprüft wird, wenn die vorherigen falsch waren.",
  "if a:\n    ...\nelif b:\n    ...\nelse:\n    ...",
  "elif (else if) stellt eine Kette von Fällen dar. Python prüft von oben nach unten und führt den ersten passenden Block aus, den Rest überspringt es. Deshalb zählt die Reihenfolge: zuerst der engste Fall.",
  '''
  druck_bar = 5.2
  if druck_bar > 8:
      print("ROT: Abschalten")
  elif druck_bar > 6:
      print("GELB: Warnung")
  else:
      print("GRÜN: normal")
  ''',
  "Wenn es mehr als zwei Fälle gibt: Güteklassen, Druckstufen, Notenskalen.",
  [("Drei Temperaturbereiche", 't = 45\nif t < 20:\n    print("kalt")\nelif t < 60:\n    print("warm")\nelse:\n    print("heiß")'),
   ("Vorzeichen bestimmen", 'x = -2.5\nif x > 0:\n    print("positiv")\nelif x < 0:\n    print("negativ")\nelse:\n    print("null")')],
  [("else if wie in C geschrieben", 'x = 3\nif x > 5:\n    print("a")\nelse if x > 2:\n    print("b")'),
   ("Falsche Reihenfolge: der erste Treffer gewinnt", 'x = 100\nif x > 10:\n    print("über 10")\nelif x > 50:\n    print("über 50")', "(keine Fehlermeldung) Ausgabe: über 10 – der zweite Zweig wird nie erreicht; erst den engsten Fall prüfen.")],
  ["if", "else", "and-or"])

E("einrueckung", "Einrückung", BE, "V04", "kopf",
  "Python erkennt Blöcke an der Einrückung, nicht an Klammern.",
  "4 Leerzeichen pro Ebene (Tab im Editor = 4 Leerzeichen)",
  "Alles, was zu einem if, while, for oder def gehört, steht eine Ebene weiter rechts – üblich sind vier Leerzeichen. Wo du zurückspringst, endet der Block. Deshalb ist die Einrückung Teil der Programmlogik, nicht Kosmetik. Mische keine Tabs und Leerzeichen.",
  '''
  last = 120
  if last > 100:
      print("Überlast")
      print("Abschalten")
  print("immer")
  ''',
  "Bei jedem Block: if, else, while, for, def.",
  [("Verschachtelter Block: zwei Ebenen", 'a, b = 5, 7\nif a > 0:\n    if b > 0:\n        print("beide positiv")'),
   ("Eine Zeile gehört nicht mehr zur Schleife", 'for i in range(3):\n    print("Runde", i)\nprint("fertig")')],
  [("Unerwartet eingerückt", 'x = 1\n    y = 2'),
   ("Ausrücken passt zu keiner Ebene", 'if True:\n        print("a")\n    print("b")')],
  ["if", "for", "while", "def"])

# ───────────── V05 ─────────────
E("verschachtelte-if", "Verschachtelte Verzweigung", BE, "V05", "kopf",
  "Eine Entscheidung innerhalb einer anderen – so setzt du Programmablaufpläne um.",
  "if a:\n    if b:\n        ...\n    else:\n        ...\nelse:\n    ...",
  "Ein if darf in einem anderen if stehen. Jede Ebene wird einmal weiter eingerückt. Das übersetzt einen Programmablaufplan mit einer Raute innerhalb eines Zweigs Zeile für Zeile. Prüfe zuerst die Bedingung, die alles andere erst sinnvoll macht, zum Beispiel ob die Eingabe überhaupt gültig ist.",
  '''
  drehzahl = 2800
  oeltemp = 105
  if drehzahl > 2500:
      if oeltemp > 100:
          print("Drehzahl begrenzen")
      else:
          print("Hohe Drehzahl, Temperatur ok")
  else:
      print("Normalbetrieb")
  ''',
  "Wenn eine zweite Frage nur Sinn hat, nachdem die erste mit Ja beantwortet wurde.",
  [("Erst gültig?, dann Bereich?", 'x = 7\nif x > 0:\n    if x < 10:\n        print("zwischen 0 und 10")\n    else:\n        print("zu groß")\nelse:\n    print("nicht positiv")'),
   ("Gleiche Logik flach mit and", 'x = 7\nif x > 0 and x < 10:\n    print("zwischen 0 und 10")')],
  [("else gehört zum falschen if", 'a, b = True, False\nif a:\n    if b:\n        print("beide")\nelse:\n    print("a ist falsch")', "(keine Fehlermeldung) Ausgabe: (nichts) – der else-Zweig hängt am äußeren if, nicht am inneren; hier ist a wahr und b falsch, also passiert nichts."),
   ("Innere Ebene nicht eingerückt", 'if True:\n    if True:\n    print("x")')],
  ["if", "else", "and-or", "eingabe-pruefen"])

E("eingabe-pruefen", "Eingabe prüfen (isdigit, Bereich)", TX, "V05", "kopf",
  "Prüft, ob ein Text eine brauchbare Zahl ist, bevor du damit rechnest.",
  "text.isdigit()    if 1 <= n <= 100:",
  "Texte aus Eingaben sind unberechenbar. Mit text.isdigit() prüfst du, ob nur Ziffern drin stehen. Danach kannst du sicher mit int() umwandeln und den Wertebereich prüfen. Negative Zahlen und Dezimalzahlen bestehen den isdigit-Test nicht. Dafür gibt es später try/except (V09).",
  '''
  eingabe = "250"
  if eingabe.isdigit():
      anzahl = int(eingabe)
      if 1 <= anzahl <= 1000:
          print("Auftrag über", anzahl, "Stück angenommen")
      else:
          print("Stückzahl außerhalb 1–1000")
  else:
      print("Bitte eine ganze Zahl eingeben")
  ''',
  "Immer, wenn Eingaben von Menschen oder aus Dateien kommen.",
  [("Leere Eingabe abfangen", 'eingabe = ""\nif not eingabe:\n    print("Bitte etwas eingeben")'),
   ("Dezimalkomma tolerieren", 'text = "3,5"\ntext = text.replace(",", ".")\nprint(float(text) * 2)')],
  [("Negative Zahl besteht isdigit nicht", 'print("-5".isdigit())', "(keine Fehlermeldung) Ausgabe: False – das Minus ist keine Ziffer."),
   ("Ungeprüft umwandeln", 'int("abc")')],
  ["input", "typumwandlung", "verschachtelte-if", "try-except"],
  bez=["isdigit"])

# ───────────── V06 ─────────────
E("while", "while", SC, "V06", "kopf",
  "Wiederholt einen Block, solange eine Bedingung wahr ist.",
  "while bedingung:\n    anweisungen",
  "Vor jedem Durchlauf prüft Python die Bedingung. Ist sie wahr, läuft der Block, sonst geht es hinter der Schleife weiter. Irgendetwas im Block muss die Bedingung irgendwann falsch machen, sonst läuft die Schleife ewig. Nimm while, wenn du die Anzahl der Durchläufe nicht vorher kennst.",
  '''
  temp = 90.0
  minuten = 0
  while temp > 30:
      temp = temp * 0.9
      minuten = minuten + 1
  print(minuten, "min bis unter 30 °C")
  ''',
  "Wenn du wiederholst, bis ein Ziel erreicht ist: Abkühlen, Annähern (Newton), Eingabe wiederholen.",
  [("Verdoppeln bis zur Grenze", 'x = 1\nwhile x < 1000:\n    x = x * 2\nprint(x)'),
   ("Newton-Verfahren für die Wurzel aus 2", 'x = 1.0\nwhile abs(x * x - 2) > 1e-9:\n    x = (x + 2 / x) / 2\nprint(x)'),
   ("Herunterzählen", 'n = 3\nwhile n > 0:\n    print(n)\n    n -= 1\nprint("Start")')],
  [("Doppelpunkt vergessen", 'n = 3\nwhile n > 0\n    n -= 1'),
   ("Bedingung wird nie falsch: Endlosschleife", 'n = 3\nwhile n > 0:\n    print(n)', "(kein Abbruch) Das Programm hängt: Im Browser kommt nach ein paar Sekunden \"Abgebrochen\". Es fehlt n -= 1 im Block.", False)],
  ["for", "break", "zaehler-summe", "vergleiche"])

E("for", "for", SC, "V06", "kopf",
  "Läuft über eine Folge von Werten und führt den Block für jeden aus.",
  "for variable in folge:\n    anweisungen",
  "for nimmt nacheinander jeden Wert der Folge, legt ihn in der Schleifenvariablen ab und führt den Block aus. Die Folge kann ein range(), eine Liste (kommt später im Kurs) oder ein Text sein. Nimm for, wenn du weißt, wie oft oder worüber du wiederholst.",
  '''
  summe = 0
  for i in range(1, 6):
      summe = summe + i
  print(summe)
  for zeichen in "M10":
      print(zeichen)
  ''',
  "Für feste Anzahl an Durchläufen und zum Abarbeiten von Folgen.",
  [("Wertetabelle", 'for d in range(10, 31, 10):\n    print(d, "mm ->", 3.14159 * d, "mm Umfang")'),
   ("Alle Zeichen eines Textes", 'for c in "Welle":\n    print(c, end=" ")'),
   ("Fakultät", 'f = 1\nfor k in range(1, 6):\n    f = f * k\nprint(f)')],
  [("Doppelpunkt vergessen", 'for i in range(3)\n    print(i)'),
   ("Über eine Zahl statt einer Folge laufen", 'for i in 5:\n    print(i)')],
  ["range", "while", "break", "for-liste"])

E("range", "range()", SC, "V06", "kopf",
  "Erzeugt eine Zahlenfolge für Schleifen.",
  "range(stop)    range(start, stop)    range(start, stop, schritt)",
  "range(5) liefert 0, 1, 2, 3, 4: Der Startwert 0 ist dabei, der Endwert 5 nicht. range(1, 6) liefert 1 bis 5, range(0, 100, 25) liefert 0, 25, 50, 75. Mit negativem Schritt zählst du rückwärts.",
  '''
  for winkel in range(0, 91, 30):
      print(winkel, "Grad")
  print(list(range(5)))
  ''',
  "Wenn du n-mal etwas tun oder eine Zahlenreihe durchlaufen willst.",
  [("Rückwärts zählen", 'for i in range(5, 0, -1):\n    print(i)'),
   ("Nur gerade Zahlen", 'print(list(range(0, 11, 2)))'),
   ("Eine Aktion dreimal wiederholen", 'for _ in range(3):\n    print("Piep")')],
  [("Fließkommazahl als Argument", 'range(1.5)'),
   ("Start größer als Stopp: keine Durchläufe", 'for i in range(10, 0):\n    print(i)\nprint("fertig")', "(keine Fehlermeldung) Ausgabe: fertig – die Folge ist leer; für abwärts brauchst du den Schritt -1.")],
  ["for", "while", "len"])

E("break", "break", SC, "V06", "kopf",
  "Verlässt die Schleife sofort.",
  "break",
  "break beendet die innerste Schleife und springt dahinter weiter. Das brauchst du, wenn du ein Suchergebnis gefunden hast oder eine Grenze überschritten ist und weiteres Wiederholen nur Zeit kostet.",
  '''
  for v in range(1, 100):
      if v * v > 200:
          print("Erste Zahl mit Quadrat über 200:", v)
          break
  ''',
  "Beim Suchen und wenn eine Abbruchbedingung mitten im Durchlauf entsteht.",
  [("Erstes Vielfaches finden", 'for n in range(1, 100):\n    if n % 7 == 0 and n % 5 == 0:\n        print(n)\n        break'),
   ("Endlosschleife mit sauberem Ausstieg", 'zaehler = 0\nwhile True:\n    zaehler += 1\n    if zaehler >= 3:\n        break\nprint(zaehler)')],
  [("break außerhalb einer Schleife", 'x = 3\nbreak'),
   ("break verlässt nur die innere Schleife", 'for a in range(2):\n    for b in range(3):\n        if b == 1:\n            break\n        print(a, b)', "(keine Fehlermeldung) Ausgabe: 0 0 und 1 0 – die äußere Schleife läuft weiter.")],
  ["continue", "while", "for"])

E("continue", "continue", SC, "V06", "kopf",
  "Springt zum nächsten Durchlauf und überspringt den Rest des Blocks.",
  "continue",
  "continue lässt den Rest des aktuellen Durchlaufs aus und macht mit dem nächsten Wert weiter. Das ist praktisch, um ungültige Werte zu überspringen, ohne den ganzen Block zu verschachteln.",
  '''
  for n in range(1, 8):
      if n % 2 == 0:
          continue
      print(n, "ist ungerade")
  ''',
  "Wenn bestimmte Durchläufe nichts tun sollen: ungültige Messwerte, leere Zeilen.",
  [("Nur positive Werte summieren", 'summe = 0\nfor x in range(-3, 4):\n    if x < 0:\n        continue\n    summe += x\nprint(summe)'),
   ("Eine Zahl auslassen", 'for i in range(5):\n    if i == 2:\n        continue\n    print(i)')],
  [("continue außerhalb einer Schleife", 'continue'),
   ("continue vor dem Hochzählen in while", 'i = 0\nwhile i < 5:\n    if i == 2:\n        continue\n    i += 1', "(kein Abbruch) Endlosschleife: bei i == 2 wird i += 1 nie erreicht.", False)],
  ["break", "while", "for"])

E("zaehler-summe", "Zähler & Summe (+=)", SC, "V06", "kopf",
  "Ergebnisse in einer Schleife sammeln: hochzählen und aufsummieren.",
  "summe = 0\nfor ...:\n    summe += wert",
  "Muster in fast jeder Schleife: Vor der Schleife startest du mit 0, in der Schleife addierst du. a += b ist die Kurzform von a = a + b, ebenso gibt es -=, *= und /=. Der Startwert gehört vor die Schleife, sonst wird er in jedem Durchlauf zurückgesetzt.",
  '''
  summe = 0
  anzahl = 0
  for kraft in range(10, 60, 10):
      summe += kraft
      anzahl += 1
  print("Mittelwert:", summe / anzahl)
  ''',
  "Für Summen, Mittelwerte, Zählen von Treffern und Produkte.",
  [("Treffer zählen", 'treffer = 0\nfor n in range(1, 21):\n    if n % 3 == 0:\n        treffer += 1\nprint(treffer)'),
   ("Produkt statt Summe", 'p = 1\nfor n in range(1, 5):\n    p *= n\nprint(p)')],
  [("Summe nicht initialisiert", 'for i in range(3):\n    summe += i'),
   ("Startwert innerhalb der Schleife gesetzt", 'for i in range(1, 4):\n    summe = 0\n    summe += i\nprint(summe)', "(keine Fehlermeldung) Ausgabe: 3 – die Summe wird in jedem Durchlauf auf 0 zurückgesetzt, übrig bleibt nur der letzte Wert.")],
  ["for", "range", "sum-min-max"],
  bez=["+="])

# ───────────── V07 ─────────────
E("def", "def (Funktion definieren)", FU, "V07", "kopf",
  "Fasst Code unter einem Namen zusammen, damit du ihn wiederverwenden kannst.",
  "def name(parameter):\n    anweisungen\n    return ergebnis",
  "Mit def bekommt ein Stück Code einen Namen. Der Block wird erst ausgeführt, wenn du die Funktion aufrufst: name(werte). Funktionen vermeiden Wiederholungen (DRY), halten Code lesbar und lassen sich einzeln testen.",
  '''
  def flaeche_kreis(d):
      return 3.14159 * d**2 / 4

  print(flaeche_kreis(20))
  print(flaeche_kreis(40))
  ''',
  "Sobald du dieselbe Rechnung ein zweites Mal brauchst – oder einem Block einen Namen geben willst.",
  [("Umrechnung als Funktion", 'def mm_zu_m(mm):\n    return mm / 1000\n\nprint(mm_zu_m(2500))'),
   ("Funktion ohne Rückgabewert, nur mit Ausgabe", 'def gruss(name):\n    print("Hallo", name)\n\ngruss("Anna")')],
  [("Funktion vor der Definition aufgerufen", 'print(quadrat(3))\n\ndef quadrat(x):\n    return x * x'),
   ("Doppelpunkt vergessen", 'def quadrat(x)\n    return x * x')],
  ["parameter", "return", "default-werte", "docstring"])

E("parameter", "Parameter & Argumente", FU, "V07", "kopf",
  "Werte, die du einer Funktion beim Aufruf mitgibst.",
  "def f(a, b): ...    f(1, 2)    f(b=2, a=1)",
  "Parameter stehen in der Klammer der Definition, Argumente beim Aufruf. Die Zuordnung erfolgt nach Position oder mit Namen (f(b=2, a=1)). Die Anzahl muss passen, sonst gibt es einen TypeError.",
  '''
  def spannung(kraft, flaeche):
      return kraft / flaeche

  print(spannung(1200, 40))
  print(spannung(flaeche=40, kraft=1200))
  ''',
  "Wenn eine Funktion mit unterschiedlichen Eingabewerten arbeiten soll.",
  [("Zwei Werte, ein Ergebnis", 'def rechteck(a, b):\n    return a * b\n\nprint(rechteck(3, 4))'),
   ("Mit Namen aufrufen verhindert Reihenfolgefehler", 'def verhaeltnis(zaehler, nenner):\n    return zaehler / nenner\n\nprint(verhaeltnis(nenner=4, zaehler=1))')],
  [("Argument fehlt", 'def spannung(kraft, flaeche):\n    return kraft / flaeche\n\nspannung(1200)'),
   ("Zu viele Argumente", 'def quadrat(x):\n    return x * x\n\nquadrat(2, 3)')],
  ["def", "return", "default-werte"])

E("return", "return", FU, "V07", "kopf",
  "Gibt einen Wert aus der Funktion zurück und beendet sie.",
  "return ausdruck",
  "return liefert das Ergebnis an die aufrufende Stelle und beendet die Funktion sofort. Zeilen dahinter laufen nicht mehr. Ohne return gibt die Funktion None zurück. print() zeigt nur etwas an und gibt nichts zurück, das du weiterverwenden kannst.",
  '''
  def betrag_sicher(x):
      if x < 0:
          return -x
      return x

  print(betrag_sicher(-4), betrag_sicher(2.5))
  ''',
  "Immer, wenn du das Ergebnis weiterverwenden willst statt es nur anzuzeigen.",
  [("Mehrere Werte als Tupel zurückgeben", 'def min_max(a, b):\n    return min(a, b), max(a, b)\n\nkleiner, groesser = min_max(5, 2)\nprint(kleiner, groesser)'),
   ("Frühes return statt else", 'def vorzeichen(x):\n    if x > 0:\n        return "plus"\n    if x < 0:\n        return "minus"\n    return "null"\n\nprint(vorzeichen(-3))')],
  [("return vergessen: Ergebnis ist None", 'def verdopple(x):\n    x * 2\n\nprint(verdopple(3) + 1)'),
   ("Code nach return wird nie ausgeführt", 'def f():\n    return 1\n    print("nie")\n\nf()', "(keine Fehlermeldung) Die Zeile print(\"nie\") läuft nie, die Funktion endet beim return.")],
  ["def", "parameter", "print"])

E("default-werte", "Standardwerte für Parameter", FU, "V07", "kopf",
  "Ein Parameter bekommt einen Vorgabewert, wenn du ihn weglässt.",
  "def f(a, b=10): ...",
  "Mit name=wert in der Definition machst du einen Parameter optional. Parameter mit Standardwert stehen immer hinter denen ohne. Das ist ideal für Konstanten wie π, Sicherheitsfaktoren oder Einheiten, die meistens gleich sind.",
  '''
  def umfang(d, pi=3.14159):
      return pi * d

  print(umfang(10))
  print(umfang(10, pi=3.14))
  ''',
  "Für Parameter, die fast immer denselben Wert haben.",
  [("Sicherheitsfaktor mit Vorgabe", 'def zul_last(bruch_kn, s=2.0):\n    return bruch_kn / s\n\nprint(zul_last(100), zul_last(100, s=4))'),
   ("Trennzeichen optional", 'def verbinde(a, b, trenner="-"):\n    return a + trenner + b\n\nprint(verbinde("M", "10"), verbinde("M", "10", "_"))')],
  [("Parameter ohne Standardwert nach einem mit", 'def f(a=1, b):\n    return a + b'),
   ("Parametername falsch geschrieben", 'def umfang(d, pi=3.14159):\n    return pi * d\n\numfang(10, PI=3.14)')],
  ["def", "parameter"],
  bez=["default"])

E("docstring", "Docstring", FU, "V07", "kopf",
  "Beschreibung der Funktion als Text direkt unter der def-Zeile.",
  "def f(x):\n    \"\"\"Kurzbeschreibung.\"\"\"",
  "Ein Docstring ist ein Text in dreifachen Anführungszeichen als erste Anweisung der Funktion. Er beschreibt, was die Funktion tut, welche Einheiten sie erwartet und was sie zurückgibt. Editoren und help() zeigen ihn an – so sehen auch Kolleginnen und KI-Werkzeuge, wie die Funktion gemeint ist.",
  """
  def flaeche_kreis(d_mm):
      '''Kreisfläche in mm² aus dem Durchmesser in mm.'''
      return 3.14159 * d_mm**2 / 4

  print(flaeche_kreis.__doc__)
  help(flaeche_kreis)
  """,
  "Bei jeder Funktion, die jemand anders (oder du in drei Monaten) benutzen soll.",
  [("Einheiten im Docstring festhalten", 'def mm_zu_m(mm):\n    """Rechnet Millimeter in Meter um."""\n    return mm / 1000\n\nprint(mm_zu_m.__doc__)'),
   ("Mehrzeilig mit Parametern", 'def spannung(kraft_n, flaeche_mm2):\n    """Zugspannung in N/mm².\n\n    kraft_n: Kraft in Newton\n    flaeche_mm2: Querschnitt in mm²\n    """\n    return kraft_n / flaeche_mm2\n\nprint(spannung(100, 10))')],
  [("Docstring nicht geschlossen", 'def f():\n    """Text ohne Ende\n    return 1'),
   ("Text steht nicht als erste Anweisung: kein Docstring", 'def f():\n    x = 1\n    """Das ist kein Docstring"""\n    return x\n\nprint(f.__doc__)', "(keine Fehlermeldung) Ausgabe: None – nur der Text als erste Anweisung zählt.")],
  ["def", "kommentar"],
  bez=["help"])

E("lokale-variablen", "Lokale Variablen", FU, "V07", "kopf",
  "Variablen in einer Funktion sind nur dort sichtbar.",
  "def f(x):\n    lokal = x * 2    # nur innerhalb von f bekannt",
  "Namen, die du in einer Funktion zuweist, existieren nur während des Aufrufs. Eine gleichnamige Variable außerhalb bleibt unberührt. Eine äußere Variable kannst du in der Funktion lesen, aber nicht einfach verändern. Reiche Werte stattdessen als Parameter hinein und über return hinaus.",
  '''
  g = 10

  def f(x):
      g = x * 2          # neue lokale Variable
      return g

  print(f(3), g)
  ''',
  "Zum Verständnis, warum Funktionen sich nicht gegenseitig stören – und warum \"name not defined\" auftaucht.",
  [("Hilfsvariable verschwindet nach dem Aufruf", 'def quadrat_summe(a, b):\n    ergebnis = a**2 + b**2\n    return ergebnis\n\nprint(quadrat_summe(3, 4))'),
   ("Äußeren Wert lesen ist erlaubt", 'faktor = 3\n\ndef mal_faktor(x):\n    return x * faktor\n\nprint(mal_faktor(5))')],
  [("Lokale Variable außerhalb benutzt", 'def f(x):\n    ergebnis = x * 2\n    return ergebnis\n\nf(3)\nprint(ergebnis)'),
   ("Äußere Variable verändern wollen", 'zaehler = 0\n\ndef hoch():\n    zaehler = zaehler + 1\n\nhoch()')],
  ["def", "return", "zuweisung"])
