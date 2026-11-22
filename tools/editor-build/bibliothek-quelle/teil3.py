from helfer import E, S

LD = "Listen, Tupel & Dicts"
DF = "Dateien & Fehler"
TX = "Text & Formatierung"
RE = "Rechnen"
AU = "Ausblick (ab V10)"

# ───────────── V08 ─────────────
E("liste", "Liste", LD, "V08", "kopf",
  "Eine geordnete, veränderbare Sammlung von Werten.",
  "liste = [wert1, wert2, ...]",
  "Eine Liste hält mehrere Werte unter einem Namen, zum Beispiel eine Messreihe oder eine Stückliste. Die Werte stehen in eckigen Klammern, durch Komma getrennt, und behalten ihre Reihenfolge. Du kannst einzelne Elemente lesen und ändern, Elemente anhängen und die Liste mit for durchlaufen.",
  '''
  messwerte = [20.1, 20.4, 19.9]
  print(messwerte)
  messwerte[0] = 20.0
  print(messwerte)
  leer = []
  print(len(leer))
  ''',
  "Sobald du mehr als ein paar zusammengehörige Werte hast: Messreihen, Stücklisten, Ergebnisse.",
  [("Stückliste mit Texten", 'teile = ["Welle", "Lager", "Dichtung"]\nprint(teile)'),
   ("Gemischte Typen sind erlaubt", 'zeile = ["M10", 10, 49.5]\nprint(zeile)'),
   ("Liste mit Schleife füllen", 'quadrate = []\nfor i in range(5):\n    quadrate.append(i * i)\nprint(quadrate)')],
  [("Komma zwischen den Werten vergessen", 'werte = [1 2 3]'),
   ("Index außerhalb der Liste", 'werte = [1, 2, 3]\nprint(werte[3])')],
  ["append", "index", "len", "slicing", "for-liste"],
  bez=["list", "[]"])

E("append", "append()", LD, "V08", "kopf",
  "Hängt ein Element ans Ende einer Liste an.",
  "liste.append(wert)",
  "append() verändert die Liste direkt und gibt selbst nichts zurück (genauer: None). Deshalb darfst du das Ergebnis nicht wieder der Liste zuweisen. Mit append() baust du Ergebnislisten in Schleifen auf.",
  '''
  messwerte = []
  for i in range(1, 4):
      messwerte.append(i * 10.5)
  print(messwerte)
  ''',
  "Beim schrittweisen Sammeln von Ergebnissen oder Messwerten.",
  [("Nur gültige Werte sammeln", 'gueltig = []\nfor x in [3, -1, 7, -4]:\n    if x > 0:\n        gueltig.append(x)\nprint(gueltig)'),
   ("Mehrere Elemente auf einmal anhängen", 'a = [1, 2]\na.extend([3, 4])\nprint(a)')],
  [("append auf einem Tupel", 't = (1, 2)\nt.append(3)'),
   ("Ergebnis von append zugewiesen", 'liste = [1, 2]\nliste = liste.append(3)\nprint(len(liste))')],
  ["liste", "len", "tupel"],
  bez=[".append"])

E("len", "len()", LD, "V08", "kopf",
  "Anzahl der Elemente (oder Zeichen).",
  "len(objekt)",
  "len() zählt die Elemente einer Liste, eines Tupels oder Dictionaries und die Zeichen eines Textes. Der letzte gültige Index einer Liste ist len(liste) - 1. Der Mittelwert einer Liste ergibt sich aus sum(liste) / len(liste).",
  '''
  messwerte = [20.1, 20.4, 19.9, 20.2]
  print(len(messwerte))
  print(sum(messwerte) / len(messwerte))
  print(len("Welle"))
  ''',
  "Für Mittelwerte, Schleifen über Indizes und Abfragen wie „ist die Liste leer?“.",
  [("Liste leer?", 'daten = []\nif len(daten) == 0:\n    print("keine Daten")'),
   ("Alle Indizes durchlaufen", 'w = [5, 6, 7]\nfor i in range(len(w)):\n    print(i, w[i])')],
  [("len auf einer Zahl", 'len(5)'),
   ("Letztes Element mit len(liste) statt len(liste) - 1", 'w = [1, 2, 3]\nprint(w[len(w)])')],
  ["liste", "index", "sum-min-max"])

E("index", "Index [ ]", LD, "V08", "kopf",
  "Greift auf ein einzelnes Element zu – gezählt ab 0.",
  "liste[0]    liste[-1]",
  "Das erste Element hat den Index 0, das zweite 1 und so weiter. Negative Indizes zählen von hinten: -1 ist das letzte Element. Ein Index außerhalb der Liste ist ein IndexError. Einzelne Zeichen eines Textes erreichst du genauso.",
  '''
  teile = ["Welle", "Lager", "Dichtung", "Schraube"]
  print(teile[0])
  print(teile[-1])
  print("Welle"[1])
  ''',
  "Wenn du ein bestimmtes Element brauchst: das erste, das letzte, das n-te.",
  [("Erste und letzte Messung vergleichen", 'w = [20.0, 20.5, 21.3]\nprint(w[-1] - w[0])'),
   ("Zeile einer Tabelle als Liste", 'zeile = ["M10", 10, 49.5]\nprint("Schraube", zeile[0], "hat", zeile[2], "N")')],
  [("Index zu groß", 'w = [1, 2, 3]\nprint(w[5])'),
   ("Index als Fließkommazahl", 'w = [1, 2, 3]\nprint(w[1.0])')],
  ["liste", "slicing", "len"],
  bez=["[0]", "[-1]"])

E("slicing", "Slicing [von:bis]", LD, "V08", "kopf",
  "Schneidet einen Teil einer Liste oder eines Textes heraus.",
  "liste[start:stop]    liste[start:stop:schritt]",
  "Bei liste[a:b] ist das Element a dabei, b nicht (wie bei range). Lässt du eine Grenze weg, gilt Anfang bzw. Ende. Negative Werte zählen von hinten. Ein Slice liefert immer eine neue Liste, auch wenn er leer ist, und löst keinen IndexError aus.",
  '''
  m = [10, 20, 30, 40, 50]
  print(m[1:4])
  print(m[:2])
  print(m[-2:])
  print(m[::2])
  ''',
  "Zum Herausgreifen von Teilbereichen: erste drei Werte, letzte zwei, jeder zweite.",
  [("Die ersten drei Messwerte", 'w = [5, 6, 7, 8, 9]\nprint(w[:3])'),
   ("Kopie einer Liste", 'a = [1, 2, 3]\nb = a[:]\nb.append(4)\nprint(a, b)'),
   ("Liste umkehren", 'print([1, 2, 3][::-1])')],
  [("Komma statt Doppelpunkt", 'm = [1, 2, 3, 4]\nprint(m[1,3])'),
   ("Slice über das Ende hinaus: kein Fehler", 'm = [1, 2, 3]\nprint(m[1:10])', "(keine Fehlermeldung) Ausgabe: [2, 3] – Slices schneiden nur ab, was da ist.")],
  ["index", "liste", "len"],
  bez=[":"])

E("for-liste", "for über eine Liste", LD, "V08", "kopf",
  "Jedes Element einer Liste der Reihe nach bearbeiten.",
  "for element in liste:\n    anweisungen",
  "Die Schleifenvariable nimmt nacheinander jedes Element der Liste an – ohne dass du Indizes brauchst. Brauchst du auch die Position, nimm enumerate(). Verändere die Liste nicht, während du darüber läufst.",
  '''
  gewichte_kg = [12.5, 8.0, 3.2]
  gesamt = 0
  for g in gewichte_kg:
      gesamt += g
  print(gesamt, "kg")
  for i, g in enumerate(gewichte_kg):
      print(i, g)
  ''',
  "Für fast jede Auswertung einer Liste: summieren, filtern, ausgeben.",
  [("Grenzwertverletzungen melden", 'for p in [5.1, 6.8, 5.9]:\n    if p > 6:\n        print("zu hoch:", p)'),
   ("Zwei Listen parallel durchlaufen", 'namen = ["A", "B"]\nwerte = [1.5, 2.5]\nfor n, w in zip(namen, werte):\n    print(n, w)')],
  [("Liste während der Schleife verändern", 'w = [1, 2, 3, 4]\nfor x in w:\n    if x % 2 == 0:\n        w.remove(x)\nprint(w)', "(keine Fehlermeldung) Ausgabe: [1, 3] – hier zufällig richtig, aber bei anderen Daten werden Elemente übersprungen. Besser eine neue Liste aufbauen."),
   ("Schleifenvariable ändern ändert die Liste nicht", 'w = [1, 2, 3]\nfor x in w:\n    x = x * 10\nprint(w)', "(keine Fehlermeldung) Ausgabe: [1, 2, 3] – x ist nur eine Kopie des Wertes.")],
  ["for", "liste", "range", "zaehler-summe"])

E("sum-min-max", "sum(), min(), max()", LD, "V08", "kopf",
  "Summe, kleinster und größter Wert einer Liste.",
  "sum(liste)    min(liste)    max(liste)",
  "Diese drei Funktionen ersetzen viele Schleifen. Der Mittelwert ist sum(liste) / len(liste). Auf eine leere Liste angewendet, lösen min() und max() einen ValueError aus.",
  '''
  werte = [20.1, 20.4, 19.9, 20.2]
  print(sum(werte))
  print(min(werte), max(werte))
  print("Spannweite:", max(werte) - min(werte))
  print("Mittelwert:", sum(werte) / len(werte))
  ''',
  "Für die Statistik einer Messreihe.",
  [("Zwei Zahlen vergleichen", 'print(max(3, 8), min(3, 8))'),
   ("Größtes Element eines Textes (alphabetisch)", 'print(max(["Welle", "Lager", "Zahnrad"]))')],
  [("Summe über Texte", 'sum(["a", "b"])'),
   ("Maximum einer leeren Liste", 'max([])')],
  ["len", "liste", "sorted", "zaehler-summe"],
  bez=["sum", "min", "max"])

E("sorted", "sorted() / sort()", LD, "V08", "kopf",
  "Sortiert eine Liste.",
  "sorted(liste)    sorted(liste, reverse=True)    liste.sort()",
  "sorted() liefert eine neue, sortierte Liste und lässt das Original unverändert. liste.sort() sortiert die Liste selbst und gibt None zurück. Mit reverse=True sortierst du absteigend. Alle Elemente müssen vergleichbar sein.",
  '''
  werte = [3.2, 1.5, 2.8]
  print(sorted(werte))
  print(sorted(werte, reverse=True))
  print(werte)
  werte.sort()
  print(werte)
  ''',
  "Für Ranglisten, Medianbestimmung, Ausreißer finden.",
  [("Median einer ungeraden Zahl Werte", 'w = sorted([7, 1, 5])\nprint(w[len(w) // 2])'),
   ("Nach Länge sortieren", 'print(sorted(["Welle", "Ei", "Lager"], key=len))')],
  [("Zahlen und Text mischen", 'sorted([3, "a", 1])'),
   ("Ergebnis von sort() zugewiesen", 'l = [3, 1, 2]\nl = l.sort()\nprint(l)', "(keine Fehlermeldung) Ausgabe: None – sort() verändert die Liste und gibt None zurück.")],
  ["liste", "sum-min-max"],
  bez=["sorted", "sort"])

E("tupel", "Tupel", LD, "V08", "kopf",
  "Wie eine Liste, aber unveränderlich.",
  "t = (wert1, wert2)    a, b = t",
  "Ein Tupel hat runde Klammern und lässt sich nach dem Anlegen nicht mehr ändern. Das passt zu Dingen, die zusammengehören und fest sind, etwa Koordinaten. Mit dem „Auspacken“ x, y = punkt verteilst du die Werte auf Variablen. Funktionen, die mehrere Werte zurückgeben, liefern ein Tupel.",
  '''
  punkt = (10.5, 20.0)
  x, y = punkt
  print(x, y)
  print(punkt[0])
  ''',
  "Für feste Wertegruppen wie Koordinaten oder mehrere Rückgabewerte.",
  [("Tupel mit einem Element braucht das Komma", 't = (5,)\nprint(type(t), len(t))'),
   ("Mehrere Rückgabewerte", 'def min_max(a, b):\n    return min(a, b), max(a, b)\n\nprint(min_max(7, 3))'),
   ("Werte tauschen nutzt Tupel", 'a, b = 1, 2\na, b = b, a\nprint(a, b)')],
  [("Element eines Tupels ändern", 'punkt = (1, 2)\npunkt[0] = 5'),
   ("Zu viele Werte beim Auspacken", 'a, b = (1, 2, 3)')],
  ["liste", "dict", "return"])

E("dict", "Dictionary (dict)", LD, "V08", "kopf",
  "Speichert Werte unter Schlüsseln – wie ein Datenblatt.",
  "d = {'schluessel': wert}    d['schluessel']    d['neu'] = wert",
  "Ein Dictionary verbindet Schlüssel mit Werten, etwa Eigenschaften eines Bauteils. Du greifst mit dem Schlüssel in eckigen Klammern zu, nicht mit einer Nummer. Neue Einträge legst du einfach per Zuweisung an. Ein nicht vorhandener Schlüssel führt zu einem KeyError.",
  '''
  bauteil = {"name": "Welle", "laenge_mm": 250, "werkstoff": "C45"}
  print(bauteil["name"])
  bauteil["masse_kg"] = 1.2
  print(bauteil)
  ''',
  "Für Datensätze mit benannten Feldern: Bauteil, Messung, Konfiguration.",
  [("Zahl pro Bauteilnummer ablegen", 'lager = {"A-17": 12, "B-04": 3}\nlager["A-17"] += 5\nprint(lager)'),
   ("Wert ändern", 'd = {"d": 10}\nd["d"] = 12\nprint(d)'),
   ("Anzahl Einträge", 'd = {"a": 1, "b": 2}\nprint(len(d))')],
  [("Schlüssel nicht vorhanden", 'bauteil = {"name": "Welle"}\nprint(bauteil["preis"])'),
   ("Liste als Schlüssel", 'd = {}\nd[[1, 2]] = "x"')],
  ["dict-get", "dict-items", "liste"],
  bez=["dict", "{}"])

E("dict-get", "dict.get()", LD, "V08", "kopf",
  "Liest einen Wert und liefert einen Ersatzwert, wenn der Schlüssel fehlt.",
  "d.get(schluessel)    d.get(schluessel, ersatz)",
  "d[key] bricht mit KeyError ab, wenn der Schlüssel fehlt. d.get(key) gibt dann None zurück, d.get(key, 0) einen Ersatzwert deiner Wahl. Praktisch zum Zählen und für optionale Felder.",
  '''
  bauteil = {"name": "Welle", "laenge_mm": 250}
  print(bauteil.get("name"))
  print(bauteil.get("preis"))
  print(bauteil.get("preis", 0))
  ''',
  "Wenn ein Schlüssel fehlen darf.",
  [("Häufigkeiten zählen", 'zaehler = {}\nfor w in ["a", "b", "a"]:\n    zaehler[w] = zaehler.get(w, 0) + 1\nprint(zaehler)'),
   ("Optionales Feld mit Vorgabe", 'cfg = {"tol": 0.05}\nprint(cfg.get("einheit", "mm"))')],
  [("Eckige statt runde Klammern", 'd = {"a": 1}\nprint(d.get["a"])'),
   ("Fehlender Wert ist None und lässt sich nicht verrechnen", 'd = {"a": 1}\nprint(d.get("b") + 1)')],
  ["dict", "dict-items"],
  bez=[".get", "get"])

E("dict-items", "dict.items(), keys(), values()", LD, "V08", "kopf",
  "Ein Dictionary durchlaufen.",
  "for k, v in d.items():    d.keys()    d.values()",
  "d.items() liefert Schlüssel-Wert-Paare, die du in der for-Schleife direkt in zwei Variablen auspackst. d.keys() sind die Schlüssel, d.values() die Werte. Läufst du nur über d, bekommst du nur die Schlüssel.",
  '''
  lager = {"A-17": 12, "B-04": 3, "C-22": 0}
  for nr, menge in lager.items():
      print(nr, "->", menge)
  print(sum(lager.values()))
  print(list(lager.keys()))
  ''',
  "Für Auswertungen über alle Einträge eines Dictionaries.",
  [("Nur Einträge mit Bestand", 'lager = {"A": 5, "B": 0}\nfor k, v in lager.items():\n    if v > 0:\n        print(k)'),
   ("Prüfen, ob ein Schlüssel vorhanden ist", 'd = {"a": 1}\nprint("a" in d, "b" in d)')],
  [("Zwei Variablen für die Schlüsselschleife", 'd = {"abc": 1}\nfor k, v in d:\n    print(k, v)'),
   ("Dictionary beim Durchlaufen ändern", 'd = {"a": 1, "b": 2}\nfor k in d:\n    d[k + "x"] = 0')],
  ["dict", "dict-get", "for"],
  bez=[".items", "items", "keys", "values"])

# ───────────── V09 ─────────────
E("split", "str.split()", TX, "V09", "kopf",
  "Zerlegt einen Text in eine Liste von Teilen.",
  "text.split(trenner)    text.split()",
  "split(';') schneidet den Text an jedem Semikolon und liefert die Teile als Liste von Texten. Ohne Argument trennt split() an beliebigen Leerzeichen. Die Teile bleiben Text: Für Rechnungen musst du sie mit float() oder int() umwandeln.",
  '''
  zeile = "12.5;13.1;12.9"
  teile = zeile.split(";")
  print(teile)
  summe = 0
  for t in teile:
      summe += float(t)
  print(summe / len(teile))
  ''',
  "Beim Lesen von Zeilen aus Dateien und bei Eingaben mit mehreren Werten.",
  [("Wörter zählen", 'satz = "Welle Lager  Dichtung"\nprint(len(satz.split()))'),
   ("Zwei Zahlen aus einer Zeile", 'a, b = "3.5 4.5".split()\nprint(float(a) + float(b))')],
  [("split auf einer Liste", '[1, 2].split(",")'),
   ("Leeres Stück am Ende wird umgewandelt", 'teile = "1;2;".split(";")\nfor t in teile:\n    print(float(t))')],
  ["strip", "join", "csv-reader", "typumwandlung"],
  bez=["split"])

E("strip", "str.strip()", TX, "V09", "kopf",
  "Entfernt Leerzeichen und Zeilenumbrüche an Anfang und Ende.",
  "text.strip()    text.strip(zeichen)",
  "Zeilen aus Dateien enden mit einem Zeilenumbruch \\n. strip() schneidet Leerzeichen, Tabs und Umbrüche an beiden Enden ab, nicht in der Mitte. Mit lstrip() und rstrip() nur links bzw. rechts.",
  '''
  zeile = "  20.5\\n"
  print(repr(zeile))
  sauber = zeile.strip()
  print(repr(sauber), float(sauber) * 2)
  ''',
  "Direkt nach dem Lesen einer Zeile, bevor du sie auswertest.",
  [("Bestimmte Zeichen abschneiden", 'print("###Titel###".strip("#"))'),
   ("Nur rechts abschneiden", 'print(repr("Text  \\n".rstrip()))')],
  [("strip auf einer Zahl", 'x = 5\nprint(x.strip())'),
   ("strip wirkt nicht in der Mitte", 'print("a  b".strip())', "(keine Fehlermeldung) Ausgabe: a  b – innere Leerzeichen bleiben stehen.")],
  ["split", "with-open", "join"],
  bez=["strip"])

E("join", "str.join()", TX, "V09", "kopf",
  "Setzt eine Liste von Texten zu einem Text zusammen.",
  "trenner.join(liste_von_texten)",
  "Der Trenner steht vor dem Punkt: \", \".join(liste) verbindet alle Elemente mit Komma und Leerzeichen. Alle Elemente müssen Text sein; Zahlen wandelst du vorher mit str() um.",
  '''
  teile = ["Welle", "Lager", "Dichtung"]
  print(", ".join(teile))
  zahlen = [1.5, 2.5, 3.0]
  texte = []
  for z in zahlen:
      texte.append(str(z))
  print(";".join(texte))
  ''',
  "Zum Erzeugen von CSV-Zeilen und lesbaren Aufzählungen.",
  [("Pfad zusammenbauen", 'print("/".join(["daten", "2026", "messung.csv"]))'),
   ("Ohne Trenner zusammenfügen", 'print("".join(["a", "b", "c"]))')],
  [("Zahlen in der Liste", '",".join([1, 2, 3])'),
   ("join mit vertauschten Rollen", 'print(["a", "b"].join(","))')],
  ["split", "str-text", "fstring"],
  bez=["join"])

E("with-open", "with open()", DF, "V09", "kopf",
  "Öffnet eine Datei und schließt sie sicher wieder.",
  "with open(name, modus, encoding='utf-8') as datei:",
  "open() öffnet eine Datei zum Lesen (\"r\"), Schreiben (\"w\") oder Anhängen (\"a\"). Mit with schließt Python die Datei am Ende des Blocks automatisch, auch bei Fehlern. Mit for zeile in datei läufst du Zeile für Zeile durch die Datei. Gib encoding='utf-8' an, damit Umlaute auf jedem Rechner stimmen.",
  '''
  with open("messung.txt", "w", encoding="utf-8") as datei:
      datei.write("20.5\\n21.0\\n19.8\\n")

  with open("messung.txt", encoding="utf-8") as datei:
      for zeile in datei:
          print(float(zeile.strip()))
  ''',
  "Für jedes Lesen und Schreiben von Textdateien: Messdaten, Protokolle, Konfiguration.",
  [("Ganze Datei als Text lesen", 'with open("t.txt", "w", encoding="utf-8") as f:\n    f.write("Hallo\\nWelt\\n")\nwith open("t.txt", encoding="utf-8") as f:\n    print(f.read())'),
   ("An eine Datei anhängen", 'with open("log.txt", "a", encoding="utf-8") as f:\n    f.write("Start\\n")\nprint(open("log.txt", encoding="utf-8").read())')],
  [("Datei existiert nicht", 'with open("gibt_es_nicht.txt") as f:\n    text = f.read()'),
   ("Nach dem with-Block weiterlesen", 'with open("x.txt", "w") as f:\n    f.write("a")\nf.write("b")')],
  ["csv-reader", "try-except", "strip", "split"],
  bez=["open", "with"])

E("csv-reader", "csv.reader()", DF, "V09", "lesen",
  "Liest CSV-Dateien Zeile für Zeile als Listen von Texten.",
  "import csv\ncsv.reader(datei, delimiter=';')",
  "CSV-Dateien sind Tabellen als Text, die Spalten durch ein Trennzeichen getrennt. csv.reader zerlegt jede Zeile für dich in eine Liste von Texten. Deutsche Excel-Dateien benutzen meist ; als Trennzeichen. Alle Werte sind zunächst Text, auch die Zahlen; die erste Zeile ist oft eine Kopfzeile, die du überspringen musst.",
  '''
  import csv

  with open("messung.csv", "w", encoding="utf-8") as f:
      f.write("zeit_s;kraft_n\\n0;0.0\\n1;12.5\\n2;24.9\\n")

  with open("messung.csv", encoding="utf-8") as f:
      leser = csv.reader(f, delimiter=";")
      kopf = next(leser)
      print(kopf)
      for zeile in leser:
          print(float(zeile[0]), float(zeile[1]))
  ''',
  "Für Messdaten aus Excel, Messgeräten oder phyphox-Exports.",
  [("Spalte aufsummieren", 'import csv\nwith open("d.csv", "w", encoding="utf-8") as f:\n    f.write("a;b\\n1;2\\n3;4\\n")\nwith open("d.csv", encoding="utf-8") as f:\n    r = csv.reader(f, delimiter=";")\n    next(r)\n    s = 0\n    for z in r:\n        s += float(z[1])\n    print(s)'),
   ("Alle Zeilen als Liste von Listen", 'import csv, io\nr = csv.reader(io.StringIO("1,2\\n3,4"))\nprint(list(r))')],
  [("Kopfzeile als Zahl umgewandelt", 'import csv, io\nr = csv.reader(io.StringIO("zeit;kraft\\n1;2"), delimiter=";")\nfor z in r:\n    print(float(z[0]))'),
   ("Falsches Trennzeichen: nur eine Spalte", 'import csv, io\nr = csv.reader(io.StringIO("1;2;3"))\nfor z in r:\n    print(z[1])')],
  ["with-open", "split", "typumwandlung", "try-except"],
  bez=["csv"])

E("try-except", "try / except", DF, "V09", "kopf",
  "Fängt Fehler ab, damit das Programm weiterläuft.",
  "try:\n    riskanter_code\nexcept ValueError:\n    ersatz",
  "Im try-Block steht Code, der scheitern kann. Tritt der genannte Fehler auf, springt Python in den except-Block, statt abzubrechen. Nenne den erwarteten Fehlertyp (ValueError, FileNotFoundError …) und fange nie alles pauschal ab, sonst verschwinden echte Fehler. Der Programmfluss danach läuft normal weiter.",
  '''
  for text in ["12.5", "abc", "7"]:
      try:
          wert = float(text)
          print("OK:", wert)
      except ValueError:
          print("Keine Zahl:", text)
  ''',
  "Bei Eingaben, Dateien und Umwandlungen, die schiefgehen können.",
  [("Datei fehlt", 'try:\n    with open("fehlt.txt") as f:\n        text = f.read()\nexcept FileNotFoundError:\n    print("Datei nicht gefunden")'),
   ("Division durch null abfangen", 'try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print("Nenner ist null")'),
   ("Wiederholen bis die Eingabe stimmt", 'versuche = ["x", "3,5", "3.5"]\nfor v in versuche:\n    try:\n        zahl = float(v)\n        break\n    except ValueError:\n        print("ungültig:", v)\nprint(zahl)')],
  [("try ohne except", 'try:\n    x = 1'),
   ("Falscher Fehlertyp wird nicht abgefangen", 'try:\n    int("abc")\nexcept TypeError:\n    print("nie erreicht")')],
  ["typumwandlung", "with-open", "eingabe-pruefen"],
  bez=["try", "except"])

# ───────────── Stichwörter ab V10 ─────────────
S("list-comprehension", "List Comprehension", AU, "V10", "lesen",
  "Baut eine Liste in einer Zeile: [x * 2 for x in daten if x > 0].",
  "[ausdruck for x in folge if bedingung]", ["for-liste", "liste"], bez=["comprehension"])
S("tokenizer", "Tokenizer", AU, "V10", "lesen",
  "Zerlegt Text in Tokens, die kleinsten Einheiten eines Sprachmodells.",
  "text.split()  → vereinfachter Tokenizer", ["split"])
S("import", "import & Module", AU, "V11", "kopf",
  "Holt fremden Code in dein Programm: import modul, from modul import name.",
  "import modul    from modul import name    import modul as kurz", ["import-math"], bez=["from"])
S("pip", "pip install", AU, "V11", "lesen",
  "Installiert zusätzliche Pakete aus dem Internet (Terminal).",
  "pip install paketname", [])
S("assert", "assert", AU, "V12", "kopf",
  "Bricht mit Fehler ab, wenn eine Annahme nicht stimmt: assert x > 0, 'Meldung'.",
  "assert bedingung, 'Meldung'", ["if", "try-except"])
S("traceback", "Traceback lesen", AU, "V12", "kopf",
  "Die Fehlermeldung von unten nach oben lesen: letzte Zeile = Fehlerart, davor die Stelle im Code.",
  "Traceback (most recent call last): ...", ["try-except"])
S("numpy-array", "NumPy-Array", AU, "V13", "lesen",
  "Schnelles Feld aus Zahlen, mit dem sich ganze Reihen auf einmal rechnen lassen.",
  "import numpy as np\nnp.array([1, 2, 3])", ["liste"], bez=["numpy", "np"])
S("vektorisierung", "Vektorisierung", AU, "V13", "lesen",
  "Rechnen auf ganzen Arrays statt in Schleifen: a * 2 + b.",
  "arr * 2 + 1", ["numpy-array", "for"])
S("zeit-messen", "Zeit messen (time)", AU, "V13", "lesen",
  "Laufzeit eines Programmteils messen: time.perf_counter().",
  "import time\nstart = time.perf_counter()", ["import"], bez=["time"])
S("matplotlib-plot", "matplotlib: plot()", AU, "V14", "lesen",
  "Zeichnet Diagramme: plt.plot(x, y), Achsenbeschriftung nicht vergessen.",
  "import matplotlib.pyplot as plt\nplt.plot(x, y)\nplt.show()", ["liste"], bez=["matplotlib", "plt"])
S("pandas-dataframe", "pandas: DataFrame", AU, "V15", "lesen",
  "Tabelle im Speicher mit Spaltennamen; read_csv, Filtern, groupby, describe.",
  "import pandas as pd\ndf = pd.read_csv('daten.csv')", ["csv-reader", "dict"], bez=["pandas", "pd", "read_csv", "groupby"])
S("pathlib", "pathlib / os", AU, "V16", "lesen",
  "Dateien und Ordner finden und durchsuchen.",
  "from pathlib import Path\nPath('.').glob('*.csv')", ["with-open"], bez=["Path", "os"])
S("json", "json", AU, "V17", "lesen",
  "Austauschformat für Daten, sieht fast aus wie ein dict.",
  "import json\njson.loads(text)", ["dict"])
S("requests", "requests (HTTP)", AU, "V17", "delegieren",
  "Fragt Daten von einer Web-API ab.",
  "import requests\nrequests.get(url).json()", ["json"])
S("hashlib", "hashlib", AU, "V18", "delegieren",
  "Bildet Prüfsummen (Hashes) von Daten oder Dateien.",
  "import hashlib\nhashlib.sha256(daten).hexdigest()", [])
S("sqlite3", "sqlite3 (SQL)", AU, "V19", "lesen",
  "Eingebaute Datenbank: Tabellen abfragen mit SQL und Platzhaltern.",
  "import sqlite3\ncon = sqlite3.connect('daten.db')", ["dict"], bez=["sql"])
S("class", "class", AU, "V20", "lesen",
  "Eigener Datentyp mit Attributen und Methoden, z. B. ein parametrisches Bauteil.",
  "class Bauteil:\n    def __init__(self, laenge):\n        self.laenge = laenge", ["def"], bez=["__init__", "self"])

# ───────────── V12 ─────────────
TE = "Testen & Fehlersuche"

E("testfunktion", "Testfunktion", TE, "V12", "lesen",
  "Eine Funktion test_...(), die mit assert prüft, ob deine Funktion das Richtige liefert.",
  "def test_name():\n    assert funktion(eingabe) == erwartet\n    print(\"bestanden\")\n\ntest_name()",
  "Eine Testfunktion ist eine kleine Funktion ohne Parameter, deren Name mit test_ beginnt. Darin steht pro Prüfung eine assert-Zeile: links der Aufruf deiner Funktion, rechts der Wert, den du von Hand aus der Spezifikation bestimmt hast. Stimmt alles, läuft die Funktion bis zum Ende und gibt „bestanden“ aus. Scheitert ein assert, bricht der Test mit AssertionError ab. Wichtig: Die Testfunktion läuft nur, wenn du sie selbst aufrufst.",
  '''
  def zustand(t):
      if t < -40 or t > 200:
          return "sensorfehler"
      if t < 70:
          return "normal"
      if t <= 85:
          return "warnung"
      return "abschalten"

  def test_zustand():
      assert zustand(20) == "normal"
      assert zustand(69.9) == "normal"
      assert zustand(70) == "warnung"
      assert zustand(85) == "warnung"
      assert zustand(85.1) == "abschalten"
      assert zustand(-41) == "sensorfehler"
      print("bestanden")

  test_zustand()
  ''',
  "Sobald du eine Funktion geschrieben hast und wissen willst, ob sie für typische Werte und Grenzfälle stimmt, und nach jeder späteren Änderung wieder.",
  [("Drehzahl-Ampel prüfen", 'def ampel(n):\n    if n < 0:\n        return "ungueltig"\n    if n < 3000:\n        return "gruen"\n    if n <= 4500:\n        return "gelb"\n    return "rot"\n\ndef test_ampel():\n    assert ampel(-1) == "ungueltig"\n    assert ampel(0) == "gruen"\n    assert ampel(2999) == "gruen"\n    assert ampel(3000) == "gelb"\n    assert ampel(4500) == "gelb"\n    assert ampel(4501) == "rot"\n    print("bestanden")\n\ntest_ampel()'),
   ("Gleitkommazahlen mit math.isclose vergleichen", 'import math\n\ndef kmh_in_ms(v):\n    return v / 3.6\n\ndef test_kmh_in_ms():\n    assert math.isclose(kmh_in_ms(36), 10)\n    assert math.isclose(kmh_in_ms(0), 0, abs_tol=1e-9)\n    assert math.isclose(kmh_in_ms(100), 27.7778, rel_tol=1e-4)\n    print("bestanden")\n\ntest_kmh_in_ms()'),
   ("Mehrere Tests nacheinander aufrufen", 'def verdoppeln(x):\n    return 2 * x\n\ndef test_positiv():\n    assert verdoppeln(3) == 6\n\ndef test_null():\n    assert verdoppeln(0) == 0\n\ntest_positiv()\ntest_null()\nprint("alle bestanden")')],
  [("Test scheitert: Funktion liefert etwas anderes", 'def zustand(t):\n    if t <= 70:\n        return "normal"\n    return "warnung"\n\ndef test_zustand():\n    assert zustand(70) == "warnung"\n    print("bestanden")\n\ntest_zustand()'),
   ("Testfunktion mit Argument aufgerufen", 'def test_null():\n    assert 0 == 0\n\ntest_null(5)')],
  ["assert", "assertion-error", "testfaelle-liste", "def", "grenzwerte-testen"],
  bez=["Testfunktion"])

E("testfaelle-liste", "Testfälle als Liste", TE, "V12", "lesen",
  "Alle Testfälle als Liste von Tupeln (Eingabe, erwartet) und eine Schleife, die sie abarbeitet.",
  "faelle = [(eingabe1, erwartet1), (eingabe2, erwartet2)]\nfor eingabe, erwartet in faelle:\n    assert funktion(eingabe) == erwartet, f\"...\"",
  "Statt dutzende assert-Zeilen zu schreiben, legst du die Testfälle als Liste von Tupeln an: erst die Eingabe, dann das erwartete Ergebnis. Die Schleife entpackt jedes Tupel in zwei Namen und prüft den Fall. Hinter dem Komma des assert steht eine Meldung als f-String, die den scheiternden Fall nennt, sonst weißt du nicht, welcher von vielen Fällen schuld ist. Neue Fälle brauchen nur eine neue Zeile in der Liste.",
  '''
  def ampel(n):
      if n < 0:
          return "ungueltig"
      if n < 3000:
          return "gruen"
      if n <= 4500:
          return "gelb"
      return "rot"

  faelle = [
      (-1, "ungueltig"),
      (0, "gruen"),
      (2999, "gruen"),
      (3000, "gelb"),
      (4500, "gelb"),
      (4501, "rot"),
  ]
  for eingabe, erwartet in faelle:
      ergebnis = ampel(eingabe)
      assert ergebnis == erwartet, f"ampel({eingabe}): erwartet {erwartet}, bekommen {ergebnis}"
  print("alle", len(faelle), "Fälle bestanden")
  ''',
  "Wenn du viele Eingaben mit bekannten Ergebnissen prüfen willst, besonders alle Grenzwerte einer Funktion.",
  [("Temperatur-Zustände", 'def zustand(t):\n    if t < -40 or t > 200:\n        return "sensorfehler"\n    if t < 70:\n        return "normal"\n    if t <= 85:\n        return "warnung"\n    return "abschalten"\n\nfaelle = [(-41, "sensorfehler"), (-40, "normal"), (69, "normal"), (70, "warnung"), (85, "warnung"), (86, "abschalten"), (200, "abschalten"), (201, "sensorfehler")]\nfor t, erwartet in faelle:\n    assert zustand(t) == erwartet, f"zustand({t}) lieferte {zustand(t)}, erwartet {erwartet}"\nprint("bestanden")'),
   ("Mit math.isclose bei Dezimalzahlen", 'import math\n\ndef kmh_in_ms(v):\n    return v / 3.6\n\nfaelle = [(0, 0.0), (36, 10.0), (72, 20.0), (-36, -10.0)]\nfor kmh, erwartet in faelle:\n    ergebnis = kmh_in_ms(kmh)\n    assert math.isclose(ergebnis, erwartet, abs_tol=1e-9), f"{kmh} km/h: {ergebnis}, erwartet {erwartet}"\nprint("bestanden")')],
  [("Ein Fall ist falsch: die Meldung nennt ihn", 'def ampel(n):\n    if n < 3000:\n        return "gruen"\n    return "rot"\n\nfaelle = [(0, "gruen"), (3000, "gelb")]\nfor eingabe, erwartet in faelle:\n    assert ampel(eingabe) == erwartet, f"ampel({eingabe}): erwartet {erwartet}"'),
   ("Tupel hat nicht zwei Werte", 'faelle = [(1, 2), (3, 4, 5)]\nfor eingabe, erwartet in faelle:\n    print(eingabe, erwartet)')],
  ["testfunktion", "tupel", "liste", "for-liste", "fstring", "assert"],
  bez=["Testfälle"])

E("except-as", "except … as fehler", TE, "V12", "lesen",
  "Fängt einen Fehler ab und gibt dir das Fehlerobjekt, dessen Meldung du ausgeben kannst.",
  "try:\n    ...\nexcept AssertionError as fehler:\n    print(fehler)",
  "Mit as gibst du dem abgefangenen Fehler einen Namen. print(fehler) zeigt dann die Meldung, die hinter dem Komma des assert steht. So läuft eine Testschleife auch nach einem gescheiterten Fall weiter, und du bekommst am Ende eine Übersicht statt nur den ersten Fehler. Ein Zähler für die gescheiterten Fälle zeigt, wie viele es insgesamt waren.",
  '''
  def zustand(t):
      if t < 70:
          return "normal"
      if t < 85:
          return "warnung"
      return "abschalten"

  faelle = [(20, "normal"), (70, "warnung"), (85, "warnung"), (90, "abschalten")]
  gescheitert = 0
  for t, erwartet in faelle:
      try:
          assert zustand(t) == erwartet, f"zustand({t}): erwartet {erwartet}, bekommen {zustand(t)}"
      except AssertionError as fehler:
          print("FEHLER:", fehler)
          gescheitert += 1
  print(gescheitert, "von", len(faelle), "Fällen gescheitert")
  ''',
  "Wenn ein Test nicht beim ersten Fehler stoppen soll, sondern alle gescheiterten Fälle melden soll. Auch für andere Fehler, deren Meldung du anzeigen willst.",
  [("Meldung eines ValueError ausgeben", 'try:\n    zahl = float("abc")\nexcept ValueError as fehler:\n    print("Eingabe ungültig:", fehler)'),
   ("Fehlerart mit ausgeben", 'try:\n    print(10 / 0)\nexcept ZeroDivisionError as fehler:\n    print(type(fehler).__name__, "-", fehler)'),
   ("Gescheiterte Fälle sammeln", 'def ampel(n):\n    return "gruen" if n < 3000 else "rot"\n\nfaelle = [(0, "gruen"), (3000, "gelb"), (5000, "rot"), (4000, "gelb")]\nschlecht = []\nfor n, erwartet in faelle:\n    try:\n        assert ampel(n) == erwartet\n    except AssertionError:\n        schlecht.append(n)\nprint("gescheitert bei:", schlecht)')],
  [("as vergessen: fehler ist nicht definiert", 'try:\n    assert 1 == 2, "ungleich"\nexcept AssertionError:\n    print(fehler)'),
   ("Doppelpunkt nach dem Namen vergessen", 'try:\n    x = 1\nexcept ValueError as fehler\n    print(fehler)')],
  ["try-except", "assert", "assertion-error", "testfaelle-liste"],
  bez=["as"])

E("grenzwerte-testen", "Grenzwerte testen", TE, "V12", "kopf",
  "Merkkarte: Welche Testfälle du wählst, damit Fehler an den Rändern nicht durchrutschen.",
  "Bereich: je ein typischer Wert\nGrenze: beide Seiten testen\nSonderfälle: 0, negativ, leere Liste",
  "Fehler sitzen selten mitten im Bereich, sondern an den Grenzen. Gehe so vor: 1. Pro Bereich ein typischer Wert. 2. Jede Grenze von beiden Seiten, also direkt darunter, genau darauf und direkt darüber, besonders bei < gegen <=. 3. Sonderfälle: 0, negative Werte, leere Liste, ein einzelnes Element, unmögliche Eingaben. 4. Die erwartete Antwort bestimmst du von Hand aus der Spezifikation, nie, indem du deine Funktion laufen lässt und das Ergebnis abschreibst.",
  '''
  # Spezifikation: unter 70 normal, 70 bis 85 einschließlich Warnung,
  # über 85 abschalten, unter -40 oder über 200 Sensorfehler.
  def zustand(t):
      if t < -40 or t > 200:
          return "sensorfehler"
      if t < 70:
          return "normal"
      if t <= 85:
          return "warnung"
      return "abschalten"

  faelle = [
      (20, "normal"),          # typisch je Bereich
      (78, "warnung"),
      (120, "abschalten"),
      (69.9, "normal"),        # Grenze 70 von beiden Seiten
      (70, "warnung"),
      (85, "warnung"),         # Grenze 85 von beiden Seiten
      (85.1, "abschalten"),
      (-40, "normal"),         # Sensorgrenzen
      (-40.1, "sensorfehler"),
      (200, "abschalten"),
      (200.1, "sensorfehler"),
      (0, "normal"),           # Sonderfall 0
  ]
  for t, erwartet in faelle:
      assert zustand(t) == erwartet, f"zustand({t}) falsch"
  print("alle", len(faelle), "Fälle bestanden")
  ''',
  "Immer, wenn du Testfälle für eine Funktion mit Bereichen, Schwellen oder Listen auswählst.",
  [("Sonderfälle bei einer Liste", 'def mittelwert(werte):\n    if len(werte) == 0:\n        return 0\n    return sum(werte) / len(werte)\n\nassert mittelwert([]) == 0\nassert mittelwert([5]) == 5\nassert mittelwert([2, 4]) == 3\nassert mittelwert([-2, 2]) == 0\nprint("bestanden")'),
   ("Grenze < gegen <= prüfen", 'def ampel(n):\n    if n < 0:\n        return "ungueltig"\n    if n < 3000:\n        return "gruen"\n    if n <= 4500:\n        return "gelb"\n    return "rot"\n\nfor n, erwartet in [(2999, "gruen"), (3000, "gelb"), (4500, "gelb"), (4501, "rot"), (-1, "ungueltig"), (0, "gruen")]:\n    assert ampel(n) == erwartet, f"ampel({n})"\nprint("bestanden")')],
  [("Nur typische Werte getestet: der Fehler an der Grenze 85 fällt erst mit dem Grenzwert auf", 'def zustand(t):\n    if t < 70:\n        return "normal"\n    if t < 85:\n        return "warnung"\n    return "abschalten"\n\nassert zustand(20) == "normal"\nassert zustand(78) == "warnung"\nassert zustand(120) == "abschalten"\nassert zustand(85) == "warnung", "Grenze 85 gehört noch zur Warnung"'),
   ("Sonderfall leere Liste nie getestet", 'def mittelwert(werte):\n    return sum(werte) / len(werte)\n\nprint(mittelwert([2, 4]))\nprint(mittelwert([]))')],
  ["testfaelle-liste", "testfunktion", "assert", "vergleiche"],
  bez=["Grenzwerte"])

E("assertion-error", "AssertionError", TE, "V12", "kopf",
  "Die Fehlerart, wenn ein assert scheitert: Die Annahme war falsch.",
  "AssertionError: Meldung",
  "Ein AssertionError bedeutet: Eine mit assert geprüfte Bedingung war falsch, dein Test ist gescheitert. Die Meldung hinter dem Komma des assert steht in der letzten Traceback-Zeile. Der Traceback zeigt die Stelle des assert, also die Stelle des Tests, nicht die Stelle des Fehlers. Den Fehler selbst suchst du in der geprüften Funktion. Achtung bei Klammern: assert (bedingung, \"Meldung\") bildet ein Tupel, und ein nicht leeres Tupel ist immer wahr. Der Test kann dann nie scheitern.",
  '''
  def zustand(t):
      if t < 70:
          return "normal"
      return "warnung"

  try:
      assert zustand(70) == "normal", "zustand(70) sollte normal sein"
  except AssertionError as fehler:
      print("AssertionError:", fehler)
  ''',
  "Beim Lesen von Testergebnissen: Er sagt dir, welcher Fall scheitert, nicht warum.",
  [("Meldung des Tests lesen", 'drehzahl = 5000\ntry:\n    assert drehzahl <= 4500, f"Drehzahl {drehzahl} zu hoch"\nexcept AssertionError as fehler:\n    print("AssertionError:", fehler)'),
   ("Vergleich mit math.isclose", 'import math\ntry:\n    assert math.isclose(100 / 3.6, 28), "100 km/h sind nicht 28 m/s"\nexcept AssertionError as fehler:\n    print("AssertionError:", fehler)')],
  [("Test gescheitert: Meldung steht hinter dem Komma", 'def kmh_in_ms(v):\n    return v * 3.6\n\nassert kmh_in_ms(36) == 10, "36 km/h sollten 10 m/s sein"'),
   ("Klammern machen ein Tupel: der Test scheitert nie, obwohl 1 == 2 falsch ist", 'assert (1 == 2, "wird nie geprüft")\nprint("läuft durch, obwohl falsch")', "Kein Fehler, nur eine Warnung: SyntaxWarning: assertion is always true, perhaps remove parentheses?", False)],
  ["assert", "traceback", "except-as", "tupel", "testfunktion"],
  bez=["AssertionError"])
S("numpy-reihen", "np.arange / np.linspace", AU, "V13", "lesen",
  "Zahlenreihen als Array: arange wie range (Stopp nicht dabei), linspace mit fester Anzahl (beide Enden dabei).",
  "np.arange(0, 1, 0.25)\nnp.linspace(0, 1, 5)\nt = np.arange(N) / fs", ["numpy-array", "range"],
  bez=["np.arange", "np.linspace"])
S("numpy-kennwerte", "np.mean / np.max / np.sqrt", AU, "V13", "lesen",
  "Kennwerte eines Arrays: Mittelwert, Maximum, Minimum, Summe; np.sqrt wirkt auf jedes Element. Effektivwert: np.sqrt(np.mean(a ** 2)).",
  "np.mean(a)    np.max(a)    np.sum(a)\nnp.sqrt(np.mean(a ** 2))", ["numpy-array", "sum-min-max"],
  bez=["np.mean", "np.max", "np.min", "np.sum", "np.sqrt", "np.median"])
S("numpy-maske", "Maske a[a > 3]", AU, "V13", "lesen",
  "Ein Vergleich auf dem Array ergibt Wahr/Falsch je Element; a[maske] behält nur die passenden Werte. Zwei Bedingungen mit & bzw. | und Klammern.",
  "a[a > 3]\nlen(a[a > 3]) / len(a)\na[(a > 1) & (a < 4)]", ["numpy-array", "vergleiche"])
S("numpy-loadtxt", "np.loadtxt", AU, "V13", "lesen",
  "Liest eine Textdatei mit Zahlen direkt als Array: Trennzeichen, Kopfzeile überspringen, Spalten wählen.",
  "np.loadtxt('daten.csv', delimiter=',', skiprows=1, usecols=4)", ["numpy-array", "csv-reader"],
  bez=["np.loadtxt"])

# ───────────── V14 Visualisierung (matplotlib) ─────────────
DG = "Diagramme (matplotlib)"

E("plt-plot", "plt.plot() mit Beschriftung", DG, "V14", "kopf",
  "Zeichnet eine Linie aus zwei gleich langen Listen und beschriftet die Achsen mit Größe und Einheit.",
  "import matplotlib.pyplot as plt\nplt.plot(x_liste, y_liste)\nplt.xlabel(\"Größe Formelzeichen in Einheit\")\nplt.ylabel(\"...\")\nplt.title(\"...\")\nplt.show()",
  "matplotlib ist ein Paket zum Zeichnen von Diagrammen, pyplot holst du unter dem Kurznamen plt. plt.plot(x, y) bekommt zuerst die Werte der waagerechten, dann der senkrechten Achse, beide Listen gleich lang. Jede Achse bekommt Größe, Formelzeichen und Einheit („Zeit t in s“), das Bild einen Titel. grid(True) legt ein Gitter zum Ablesen dahinter. Erst plt.show() zeigt das Bild.",
  '''
  import matplotlib.pyplot as plt

  zeit = [0, 1, 2, 3, 4, 5]                # Zeit in s
  v = [0.0, 2.2, 3.6, 4.2, 4.5, 4.6]       # Geschwindigkeit in m/s

  plt.plot(zeit, v)
  plt.xlabel("Zeit t in s")
  plt.ylabel("Geschwindigkeit v in m/s")
  plt.title("Anfahren eines Wagens")
  plt.grid(True)
  plt.show()
  ''',
  "Immer, wenn sich eine Größe über der Zeit oder einer anderen geordneten Größe ändert: Messreihen, Kennlinien, Verläufe.",
  [("Messpunkte zusätzlich markieren", 'import matplotlib.pyplot as plt\nhub = [0, 12, 25, 37, 50]          # Hub in mm\nzeit = [0, 0.5, 1.0, 1.5, 2.0]      # Zeit in s\nplt.plot(zeit, hub, marker="o")\nplt.xlabel("Zeit t in s")\nplt.ylabel("Hub h in mm")\nplt.title("Ausfahren eines Zylinders")\nplt.show()'),
   ("Zwei Linien mit Legende", 'import matplotlib.pyplot as plt\nt = [0, 10, 20, 30]\nplt.plot(t, [20, 35, 44, 48], label="Lager 1")\nplt.plot(t, [20, 30, 36, 39], linestyle="--", label="Lager 2")\nplt.xlabel("Zeit t in min")\nplt.ylabel("Temperatur T in °C")\nplt.title("Lagertemperaturen")\nplt.legend()\nplt.show()')],
  [("Listen verschieden lang (Kopfzeile mitgezählt?)", 'import matplotlib.pyplot as plt\nplt.plot([0, 1, 2], [4, 5])\nplt.show()'),
   ("Zahlen als Text eingelesen: matplotlib zeichnet Kategorien statt einer Zahlenachse", 'import matplotlib.pyplot as plt\nplt.plot([0, 1, 2], ["4,2", "3,9", "4,0"])\nplt.title("Text statt Zahl")\nplt.show()', "kein Fehler, aber die y-Achse zeigt die Texte in Lesereihenfolge statt Zahlen"),
   ("plt nicht importiert", 'plt.plot([0, 1], [0, 1])')],
  ["liste", "plt-diagrammarten", "plt-achsen", "plt-subplots"],
  bez=["matplotlib", "plt", "plt.plot", "plt.xlabel", "plt.ylabel", "plt.title", "plt.grid", "plt.show"],
  aliase=["Diagramm", "Plot", "Achsenbeschriftung", "Einheit", "pyplot"])

E("plt-diagrammarten", "scatter, bar, hist", DG, "V14", "kopf",
  "Punkte für Zusammenhänge, Balken für Kategorien, Histogramm für Verteilungen.",
  "plt.scatter(x, y)\nplt.bar(namen, werte)\nplt.hist(werte, bins=12)",
  "Die Diagrammart ist eine Aussage. Eine Linie behauptet einen stetigen Verlauf mit Reihenfolge. Unabhängige Proben (zwölf Zugproben, fünf Bauteile) zeigst du als Punkte mit scatter. Kategorien (Maschinen, Schichten) vergleichst du mit bar: erst die Namen, dann die Werte, und die Achse beginnt bei 0. Viele Messwerte einer Größe zeigt hist: Es bekommt nur eine Liste, teilt den Bereich in bins Klassen und zählt selbst.",
  '''
  import matplotlib.pyplot as plt

  kraft = [2, 4, 6, 8, 10]                 # Zugkraft in kN
  dehnung = [0.8, 1.7, 2.3, 3.4, 4.1]      # Verlängerung in mm
  plt.scatter(kraft, dehnung)
  plt.xlabel("Zugkraft F in kN")
  plt.ylabel("Verlängerung dl in mm")
  plt.title("Zugversuch: fünf Proben")
  plt.show()
  ''',
  "Bevor du einen Befehl tippst: Welche Frage soll das Bild beantworten? Verlauf, Zusammenhang, Vergleich oder Verteilung?",
  [("Balken: Ausschuss je Maschine", 'import matplotlib.pyplot as plt\nplt.bar(["D1", "D2", "F1"], [2.1, 3.4, 1.8])\nplt.ylabel("Ausschussquote in %")\nplt.title("Ausschuss je Maschine")\nplt.show()'),
   ("Histogramm: Streuung der Durchmesser", 'import random\nimport matplotlib.pyplot as plt\nrandom.seed(1)\nd = [random.gauss(20.0, 0.01) for i in range(200)]\nplt.hist(d, bins=12)\nplt.xlabel("Durchmesser d in mm")\nplt.ylabel("Anzahl Wellen")\nplt.title("200 Wellen")\nplt.show()')],
  [("hist mit zwei Listen aufgerufen (die zweite Liste gilt als Klassengrenzen)", 'import matplotlib.pyplot as plt\nplt.hist([1, 2, 3], [4, 5, 6, 7])\nplt.title("Unerwartete Klassen")\nplt.show()', "kein Fehler, aber die zweite Liste wird als Klassengrenzen gedeutet"),
   ("bar: Namen und Werte verschieden lang", 'import matplotlib.pyplot as plt\nplt.bar(["A", "B", "C"], [1, 2])\nplt.show()')],
  ["plt-plot", "plt-achsen"],
  bez=["plt.scatter", "plt.bar", "plt.hist", "bins"],
  aliase=["Streudiagramm", "Punktdiagramm", "Balkendiagramm", "Histogramm", "Verteilung"])

E("plt-achsen", "ylim, axhline, legend", DG, "V14", "kopf",
  "Achsengrenzen selbst festlegen, Hilfslinien zeichnen, Linien unterscheidbar beschriften.",
  "plt.ylim(unten, oben)\nplt.axhline(y, color=\"gray\")\nplt.plot(x, y, label=\"...\")\nplt.legend()",
  "matplotlib wählt die Achsengrenzen passend zu den Daten. Kleine Unterschiede sehen dann groß aus. Mit ylim (am Teilbild set_ylim) legst du die Grenzen selbst fest: Balken beginnen immer bei 0. Werte außerhalb der Grenzen werden ohne Meldung nicht gezeichnet. axhline zeichnet eine waagerechte Hilfslinie (Null, Sollwert, Grenzwert), axvline eine senkrechte. label an jeder Linie und legend() ergeben die Legende. Unterscheide Linien nie nur über die Farbe, sondern auch über linestyle oder marker.",
  '''
  import matplotlib.pyplot as plt

  monat = [1, 2, 3, 4, 5, 6]
  a = [2.2, 2.1, 2.3, 2.2, 2.4, 2.2]       # Ausschussquote in %
  b = [2.4, 2.5, 2.3, 2.5, 2.6, 2.4]

  plt.plot(monat, a, color="black", marker="o", label="Maschine A")
  plt.plot(monat, b, color="#0072B2", linestyle="--", marker="s", label="Maschine B")
  plt.axhline(2.5, color="gray", linestyle=":")
  plt.ylim(0, 3)
  plt.xlabel("Monat")
  plt.ylabel("Ausschussquote in %")
  plt.title("Ausschuss je Maschine")
  plt.legend()
  plt.show()
  ''',
  "Bei jedem Vergleich (Balken immer ab 0), bei Grenz- und Sollwerten und sobald mehr als eine Linie im Bild ist.",
  [("Grenzwert als Hilfslinie", 'import matplotlib.pyplot as plt\nt = [0, 5, 10, 15, 20]\ntemp = [22, 38, 45, 52, 58]\nplt.plot(t, temp)\nplt.axhline(55, color="gray", linestyle="--")\nplt.ylim(0, 70)\nplt.xlabel("Zeit t in min")\nplt.ylabel("Temperatur T in °C")\nplt.title("Lager mit Grenzwert 55 °C")\nplt.show()'),
   ("Abgeschnittene Achse zum Vergleich", 'import matplotlib.pyplot as plt\nplt.bar(["A", "B"], [2.25, 2.50])\nplt.ylim(2.0, 2.6)\nplt.ylabel("Ausschussquote in %")\nplt.title("Täuscht: B wirkt doppelt so hoch")\nplt.show()')],
  [("Grenzen zu eng: Messwerte verschwinden ohne Meldung", 'import matplotlib.pyplot as plt\nplt.plot([0, 1, 2], [4.0, 6.5, 5.0], marker="o")\nplt.ylim(3, 6)\nplt.title("Punkt bei 6,5 fehlt")\nplt.show()', "kein Fehler, aber der Punkt 6,5 liegt außerhalb und wird nicht gezeichnet"),
   ("legend() ohne label an den Linien", 'import matplotlib.pyplot as plt\nplt.plot([0, 1], [0, 1])\nplt.legend()\nplt.title("Leere Legende")\nplt.show()', "Warnung: No artists with labels found to put in legend; die Legende bleibt leer", False)],
  ["plt-plot", "plt-diagrammarten", "plt-subplots"],
  bez=["plt.ylim", "plt.xlim", ".set_ylim", ".set_xlim", "plt.axhline", "plt.axvline", "plt.legend", "label", "linestyle", "marker"],
  aliase=["Achsengrenzen", "Hilfslinie", "Legende", "Täuschung", "ehrliche Achse"])

E("tupel-entpacken", "Tupel entpacken (a, b = ...)", LD, "V14", "kopf",
  "Verteilt mehrere Werte in einem Schritt auf mehrere Namen.",
  "a, b = paar\nfig, ax = plt.subplots()",
  "Steht links vom Gleichheitszeichen eine Reihe von Namen und rechts ein Tupel (oder eine Liste) mit genau so vielen Werten, bekommt jeder Name seinen Wert: a, b = 3, 4 gibt a den Wert 3 und b den Wert 4. Klammern links entpacken eine Gruppe in der Gruppe. Funktionen, die zwei Dinge zurückgeben, liefern ein Tupel, das du so auspackst, zum Beispiel plt.subplots().",
  '''
  paar = (3, 4.5)
  a, b = paar
  print(a + b)

  zeilen, spalten = 2, 3
  print(zeilen * spalten)
  ''',
  "Bei Funktionen mit mehreren Rückgabewerten (plt.subplots) und um zwei Werte in einer Zeile zuzuweisen.",
  [("Zwei Werte tauschen", 'a, b = 1, 2\na, b = b, a\nprint(a, b)'),
   ("Gruppe in der Gruppe", 'nr, (x, y) = 1, (20.0, 35.5)\nprint(nr, x, y)')],
  [("Anzahl passt nicht", 'a, b = (1, 2, 3)'),
   ("Zu wenige Werte", 'a, b, c = (1, 2)')],
  ["tupel", "plt-subplots"],
  bez=["Entpacken"],
  aliase=["Unpacking", "Mehrfachzuweisung"])

E("plt-subplots", "plt.subplots()", DG, "V14", "kopf",
  "Legt eine Abbildung mit einem oder mehreren Teilbildern an; gezeichnet wird über den Namen des Teilbilds.",
  "fig, ax = plt.subplots()\nfig, (oben, unten) = plt.subplots(2, 1, sharex=True)\nax.plot(x, y)\nax.set_xlabel(\"...\")",
  "plt.subplots(zeilen, spalten) gibt zwei Dinge zurück: die ganze Abbildung fig und die Teilbilder. Mit Tupel-Entpacken bekommen sie Namen. In ein Teilbild zeichnest du mit seinen Methoden: ax.plot, ax.scatter, ax.bar. Einstellungen heißen am Teilbild set_...: set_xlabel, set_ylabel, set_title, set_ylim. sharex=True gibt mehreren Teilbildern dieselbe x-Achse, sharey=True dieselbe y-Achse (wichtig beim Vergleich). fig.tight_layout() verhindert überlappende Beschriftungen.",
  '''
  import matplotlib.pyplot as plt

  zeit = [0, 1, 2, 3, 4, 5]
  weg = [0.0, 1.1, 4.4, 9.9, 17.6, 27.5]   # Weg in m
  v = [0.0, 2.2, 4.4, 6.6, 8.8, 11.0]      # Geschwindigkeit in m/s

  fig, (oben, unten) = plt.subplots(2, 1, sharex=True)
  oben.plot(zeit, weg)
  oben.set_ylabel("Weg s in m")
  oben.set_title("Anfahren")
  unten.plot(zeit, v)
  unten.set_ylabel("Geschwindigkeit v in m/s")
  unten.set_xlabel("Zeit t in s")
  fig.tight_layout()
  plt.show()
  ''',
  "Sobald Größen mit verschiedenen Einheiten zusammengehören (Beschleunigung und Geschwindigkeit) oder zwei Messungen nebeneinander verglichen werden.",
  [("Ein Teilbild, ausdrücklich benannt", 'import matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.plot([0, 5, 10], [22.0, 31.5, 38.0])\nax.set_xlabel("Zeit t in min")\nax.set_ylabel("Temperatur T in °C")\nax.set_title("Lagertemperatur")\nax.set_ylim(0, 50)\nplt.show()'),
   ("Zwei Maschinen nebeneinander, gleiche Skala", 'import matplotlib.pyplot as plt\nfig, (links, rechts) = plt.subplots(1, 2, sharey=True)\nlinks.bar(["F", "S"], [2.1, 2.4])\nlinks.set_title("Maschine A")\nrechts.bar(["F", "S"], [2.3, 3.0])\nrechts.set_title("Maschine B")\nlinks.set_ylabel("Ausschussquote in %")\nplt.show()')],
  [("ax.xlabel statt ax.set_xlabel", 'import matplotlib.pyplot as plt\nfig, ax = plt.subplots()\nax.xlabel("Zeit t in s")'),
   ("Teilbilder nicht entpackt: das Raster ist eine Gruppe", 'import matplotlib.pyplot as plt\nfig, ax = plt.subplots(2, 1)\nax.plot([0, 1], [0, 1])')],
  ["plt-plot", "plt-achsen", "tupel-entpacken"],
  bez=["plt.subplots", ".set_xlabel", ".set_ylabel", ".set_title", "fig", "ax", "sharex", "sharey", ".tight_layout"],
  aliase=["Subplots", "Teilbild", "Axes", "Figure"])

# ───────────── V17 Netzwerke & Industrie 4.0 (JSON, ipaddress) ─────────────
NJ = "Netzwerk & JSON"

E("json-loads", "json.loads() / json.dumps()", NJ, "V17", "kopf",
  "Übersetzt JSON-Text in Python-Daten (loads) und Python-Daten in JSON-Text (dumps).",
  "import json\ndaten = json.loads(text)\ntext = json.dumps(daten)\ntext = json.dumps(daten, indent=2)",
  "JSON ist ein Textformat für Daten, das Maschinen, Server und Programme untereinander austauschen. json.loads (load string) macht aus dem Text Python-Daten: ein JSON-Objekt {…} wird ein dict, ein Array […] eine Liste, Zahlen werden int oder float, true/false werden True/False und null wird None. json.dumps macht den umgekehrten Weg, zum Beispiel für eine Meldung an einen MQTT-Broker. In JSON stehen Texte immer in doppelten Anführungszeichen, und nach dem letzten Element steht kein Komma.",
  '''
  import json

  text = '{"id": "D2", "drehzahl_1_min": 1450, "programm": null, "laeuft": true}'
  d2 = json.loads(text)
  print(type(d2))
  print(d2["drehzahl_1_min"] + 50)
  print(d2["programm"], d2["laeuft"])

  meldung = {"maschine": "D2", "werkzeug": "T4", "aktion": "wechseln"}
  print(json.dumps(meldung))
  ''',
  "Immer, wenn Daten als Text zwischen Programmen reisen: Web-APIs, MQTT-Nachrichten, Konfigurationsdateien.",
  [("Array aus JSON: wird eine Liste", 'import json\nwerte = json.loads("[48.5, 49.1, 50.2]")\nprint(max(werte))'),
   ("Lesbar eingerückt ausgeben", 'import json\nd = {"id": "F1", "verschleiss": {"T1": 47}}\nprint(json.dumps(d, indent=2))'),
   ("Fehlerhaften Text abfangen (JSONDecodeError ist ein ValueError)", 'import json\ntry:\n    json.loads("{\'id\': \'D2\'}")\nexcept ValueError:\n    print("kein gültiges JSON")')],
  [("Einfache Anführungszeichen sind in JSON nicht erlaubt", "import json\njson.loads(\"{'id': 'D2'}\")"),
   ("Komma nach dem letzten Element", 'import json\njson.loads(\'{"id": "D2",}\')'),
   ("loads bekommt schon ein dict statt Text", 'import json\njson.loads({"id": "D2"})')],
  ["dict", "liste", "verschachtelt", "json-datei"],
  bez=["json", "json.loads", "json.dumps", "indent"],
  aliase=["JSON", "loads", "dumps", "MQTT-Nachricht", "API-Antwort"])

E("json-datei", "json.load() / json.dump()", NJ, "V17", "lesen",
  "Liest JSON aus einer Datei bzw. schreibt Python-Daten als JSON in eine Datei.",
  "with open(\"datei.json\", encoding=\"utf-8\") as f:\n    daten = json.load(f)\nwith open(\"datei.json\", \"w\", encoding=\"utf-8\") as f:\n    json.dump(daten, f, indent=2)",
  "Ohne s am Ende arbeiten load und dump mit einer geöffneten Datei statt mit Text: json.load(f) liest die ganze Datei und liefert dict oder Liste, json.dump(daten, f) schreibt sie hinein. Öffne die Datei wie in V09 mit with open und encoding=\"utf-8\". Merkhilfe: das s in loads und dumps steht für string.",
  '''
  import json

  zelle = {"zelle": "FZ-3", "netz": "192.168.30.0/24", "geraete": ["D2", "F1", "R1"]}
  with open("zelle.json", "w", encoding="utf-8") as f:
      json.dump(zelle, f, indent=2)

  with open("zelle.json", encoding="utf-8") as f:
      geladen = json.load(f)
  print(geladen["netz"], len(geladen["geraete"]))
  ''',
  "Für Einstellungen, Zwischenergebnisse und Messdaten, die ein anderes Programm wieder einlesen soll.",
  [("Liste von Messwerten speichern und wieder laden", 'import json\nwith open("temp.json", "w", encoding="utf-8") as f:\n    json.dump([48.5, 49.1], f)\nwith open("temp.json", encoding="utf-8") as f:\n    print(json.load(f))'),
   ("JSON-Datei zeilenweise (eine Nachricht je Zeile)", 'import json\nwith open("log.jsonl", "w", encoding="utf-8") as f:\n    f.write(\'{"t": 1}\\n{"t": 2}\\n\')\nwith open("log.jsonl", encoding="utf-8") as f:\n    for zeile in f:\n        print(json.loads(zeile)["t"])')],
  [("load mit Dateinamen statt geöffneter Datei", 'import json\njson.load("zelle.json")'),
   ("Datei zum Lesen geöffnet, aber dump aufgerufen", 'import json\nopen("x.json", "w").close()\nwith open("x.json", encoding="utf-8") as f:\n    json.dump({"a": 1}, f)')],
  ["json-loads", "with-open", "try-except"],
  bez=["json.load", "json.dump"],
  aliase=["JSON-Datei", "Konfigurationsdatei", "JSON Lines"])

E("verschachtelt", "Verschachtelte Daten", LD, "V17", "kopf",
  "Listen von Dicts und Dicts in Dicts: Zugriffe von außen nach innen aneinanderhängen.",
  "zelle[\"maschinen\"][0][\"id\"]\nfor m in zelle[\"maschinen\"]:\n    print(m[\"id\"])\nd2[\"verschleiss\"][\"T4\"]",
  "Daten aus JSON sind fast immer verschachtelt: Ein dict enthält eine Liste, die Liste enthält dicts. Du liest einen Zugriff von links nach rechts, jede Klammer geht eine Ebene tiefer. Bei einer Liste brauchst du eine Zahl als Index oder eine for-Schleife, bei einem dict einen Schlüssel. Fehlt ein Schlüssel bei manchen Einträgen, hilft .get(schluessel, ersatz). Drucke im Zweifel erst type(...) der Ebene, auf der du gerade bist.",
  '''
  zelle = {
      "zelle": "FZ-3",
      "maschinen": [
          {"id": "D2", "status": "laeuft", "verschleiss": {"T1": 22, "T4": 83}},
          {"id": "R1", "status": "gestoert"},
      ],
  }
  print(zelle["maschinen"][0]["id"])
  print(zelle["maschinen"][0]["verschleiss"]["T4"])
  for m in zelle["maschinen"]:
      print(m["id"], m["status"], m.get("verschleiss", {}))
  ''',
  "Bei jeder API-Antwort und jeder JSON-Datei mit mehr als einer Ebene.",
  [("Alle gestörten Geräte sammeln", 'zelle = {"maschinen": [{"id": "D2", "status": "laeuft"}, {"id": "R1", "status": "gestoert"}]}\ngestoert = []\nfor m in zelle["maschinen"]:\n    if m["status"] == "gestoert":\n        gestoert.append(m["id"])\nprint(gestoert)'),
   ("Inneres dict durchlaufen", 'd2 = {"verschleiss": {"T1": 22, "T4": 83}}\nfor werkzeug, prozent in d2["verschleiss"].items():\n    if prozent > 80:\n        print(werkzeug, "wechseln")')],
  [("Liste mit Schlüssel statt Index angesprochen", 'zelle = {"maschinen": [{"id": "D2"}]}\nprint(zelle["maschinen"]["D2"])'),
   ("Schlüssel fehlt bei einem Eintrag", 'maschinen = [{"id": "D2", "temperatur_c": 48.5}, {"id": "R1"}]\nfor m in maschinen:\n    print(m["temperatur_c"])')],
  ["dict", "dict-get", "liste", "json-loads"],
  bez=["Verschachtelung"],
  aliase=["Liste von Dicts", "dict im dict", "geschachtelt", "JSON auswerten"])

E("ipaddress", "ipaddress (IP und Subnetz)", NJ, "V17", "lesen",
  "Prüft IP-Adressen und Netze: Liegt ein Gerät im Netz, wie viele Adressen hat das Netz?",
  "import ipaddress\nnetz = ipaddress.ip_network(\"192.168.30.0/24\")\nip = ipaddress.ip_address(\"192.168.30.11\")\nip in netz",
  "Eine IP-Adresse besteht aus 32 Bit, geschrieben als vier Zahlen von 0 bis 255. Die Zahl hinter dem Schrägstrich (Präfix) sagt, wie viele Bit vorne das Netz bezeichnen; der Rest nummeriert die Geräte. Bei /24 gehören alle Adressen mit denselben ersten drei Zahlen zum Netz. ip_network baut ein Netz, ip_address eine Adresse, und mit in prüfst du die Zugehörigkeit. num_addresses zählt alle Adressen des Netzes; die erste (Netzadresse) und die letzte (Broadcast) bekommt kein Gerät.",
  '''
  import ipaddress

  netz = ipaddress.ip_network("192.168.30.0/24")
  print(netz.netmask, netz.num_addresses - 2, "nutzbare Adressen")
  for text in ["192.168.30.11", "192.168.31.20"]:
      ip = ipaddress.ip_address(text)
      print(text, ip in netz)
  ''',
  "Beim Prüfen von Gerätelisten, Inbetriebnahme-Protokollen und Netzplänen einer Anlage.",
  [("Kleineres Netz /26", 'import ipaddress\nnetz = ipaddress.ip_network("192.168.30.64/26")\nprint(netz.network_address, netz.broadcast_address, netz.num_addresses - 2)'),
   ("Netz zu einer Adresse mit Präfix finden", 'import ipaddress\nprint(ipaddress.ip_interface("192.168.30.77/26").network)')],
  [("Zahl über 255 in der Adresse", 'import ipaddress\nipaddress.ip_address("192.168.30.300")'),
   ("Netzadresse mit gesetzten Host-Bits", 'import ipaddress\nipaddress.ip_network("192.168.30.11/24")'),
   ("Adressen als Text vergleichen statt als Netz", 'print("192.168.31.20".startswith("192.168.3"))', "kein Fehler, aber True: 192.168.31.20 liegt nicht in 192.168.30.0/24", False)],
  ["import", "json-loads"],
  bez=["ipaddress", "ipaddress.ip_network", "ipaddress.ip_address", "ipaddress.ip_interface", ".num_addresses", ".network_address", ".broadcast_address", ".netmask"],
  aliase=["IP-Adresse", "Subnetz", "Netzmaske", "Präfix", "CIDR"])
# ───────────── V15 Datenanalyse (pandas) ─────────────
PD = "Datenanalyse (pandas)"

_WELLEN = ('with open("wellen.csv", "w", encoding="utf-8") as f:\n'
           '    f.write("stichprobe,maschine,teil,durchmesser_mm\\n"\n'
           '            "1,D1,1,20.001\\n1,D1,2,19.998\\n1,D2,1,20.009\\n1,D2,2,20.012\\n"\n'
           '            "2,D1,1,20.002\\n2,D1,2,19.997\\n2,D2,1,20.015\\n2,D2,2,20.021\\n")\n')
_PD = _WELLEN + 'import pandas as pd\ndf = pd.read_csv("wellen.csv")\n'

E("pd-read-csv", "pd.read_csv()", PD, "V15", "kopf",
  "Liest eine CSV-Datei als Tabelle (DataFrame) mit Spaltennamen ein.",
  "import pandas as pd\ndf = pd.read_csv(\"datei.csv\")\ndf = pd.read_csv(\"datei.csv\", sep=\";\", decimal=\",\")",
  "pandas ist das Standardpaket für Tabellendaten. read_csv liest die ganze Datei auf einmal: Die erste Zeile wird zu den Spaltennamen, jede weitere zu einer Zeile der Tabelle, Zahlen werden automatisch zu Zahlen. Das Ergebnis heißt DataFrame. Deutsche Dateien (Excel, phyphox) brauchen meist sep=\";\" und decimal=\",\". df.head() zeigt die ersten fünf Zeilen, len(df) die Anzahl der Zeilen, df.columns die Spaltennamen.",
  _WELLEN + '''
import pandas as pd
df = pd.read_csv("wellen.csv")
print(df.head(3))
print(len(df), "Zeilen")
print(list(df.columns))
''',
  "Sobald eine Messreihe oder ein Protokoll als CSV vorliegt und du mehr als ein paar Werte auswerten willst.",
  [("Deutsche CSV mit Semikolon und Dezimalkomma", 'with open("kraft.csv", "w", encoding="utf-8") as f:\n    f.write("zeit_s;kraft_n\\n0;0,0\\n1;12,5\\n2;24,9\\n")\nimport pandas as pd\ndf = pd.read_csv("kraft.csv", sep=";", decimal=",")\nprint(df["kraft_n"].max())'),
   ("Größe der Tabelle", _PD + 'print(df.shape)   # (Zeilen, Spalten)')],
  [("Falsches Trennzeichen: alles landet in einer Spalte", 'with open("kraft.csv", "w", encoding="utf-8") as f:\n    f.write("zeit_s;kraft_n\\n0;0,0\\n1;12,5\\n")\nimport pandas as pd\ndf = pd.read_csv("kraft.csv")\nprint(list(df.columns))',
    "(keine Fehlermeldung) Es gibt nur eine Spalte 'zeit_s;kraft_n'. Mit sep=\";\" einlesen."),
   ("Datei nicht im Arbeitsordner", 'import pandas as pd\ndf = pd.read_csv("fehlt.csv")')],
  ["pd-spalte", "pd-describe", "csv-reader", "pandas-dataframe"],
  bez=["pd.read_csv", "read_csv", ".head", ".shape", ".columns"],
  aliase=["pandas", "DataFrame", "Tabelle einlesen", "CSV"])

E("pd-spalte", "Spalte df[\"name\"] (Series)", PD, "V15", "kopf",
  "Holt eine Spalte aus der Tabelle; mit ihr rechnest du wie mit einer Messreihe.",
  "df[\"spalte\"]            # eine Spalte (Series)\ndf[[\"a\", \"b\"]]         # mehrere Spalten (DataFrame)\ndf[\"spalte\"].mean()     # auch .std() .min() .max() .count()",
  "Eine einzelne Spalte heißt Series: eine Reihe von Werten mit Index (der Zeilennummer). Auf ihr gibt es die üblichen Kennwerte: mean() Mittelwert, std() Standardabweichung der Stichprobe (mit n − 1), min(), max(), count() Anzahl der Werte. Doppelte eckige Klammern wählen mehrere Spalten und liefern wieder eine Tabelle. Der Spaltenname muss genau stimmen, auch Groß- und Kleinschreibung.",
  _PD + '''d = df["durchmesser_mm"]
print("Mittelwert:", round(d.mean(), 4), "mm")
print("Standardabweichung:", round(d.std(), 4), "mm")
print(df[["maschine", "durchmesser_mm"]].head(2))
''',
  "Immer wenn du Kennwerte einer Messgröße brauchst oder nur einen Teil der Spalten anzeigen willst.",
  [("Spannweite einer Messreihe", _PD + 'd = df["durchmesser_mm"]\nprint(round(d.max() - d.min(), 4), "mm")'),
   ("Eine Series wie eine Liste durchlaufen", _PD + 'for wert in df["durchmesser_mm"].head(3):\n    print(wert)')],
  [("Spaltenname falsch geschrieben", _PD + 'print(df["Durchmesser"])'),
   ("Mehrere Spalten mit einfachen Klammern", _PD + 'print(df["maschine", "durchmesser_mm"])')],
  ["pd-read-csv", "pd-describe", "pd-neue-spalte", "pd-filtern"],
  bez=["Series", ".mean", ".std", ".count"],
  aliase=["Series", "Spalte", "Mittelwert", "Standardabweichung"])

E("pd-describe", "describe()", PD, "V15", "lesen",
  "Zeigt die wichtigsten Kennwerte einer Spalte oder Tabelle auf einen Blick.",
  "df[\"spalte\"].describe()\ndf.describe()",
  "describe() liefert count (Anzahl), mean (Mittelwert), std (Standardabweichung), min, 25 %, 50 % (Median), 75 % und max. Die Prozentzeilen sind Quartile: Unter dem 25-%-Wert liegt ein Viertel aller Messwerte. Mit .round(4) wird die Ausgabe lesbarer. Auf der ganzen Tabelle beschreibt describe() alle Zahlenspalten nebeneinander.",
  _PD + 'print(df["durchmesser_mm"].describe().round(4))\n',
  "Als erster Blick auf neue Messdaten: Stimmen Anzahl, Bereich und Größenordnung? Ausreißer fallen bei min und max auf.",
  [("Einen Kennwert aus describe holen", _PD + 'k = df["durchmesser_mm"].describe()\nprint(k["max"])'),
   ("Median direkt", _PD + 'print(df["durchmesser_mm"].median())')],
  [("describe ohne Klammern aufgerufen", _PD + 'print(df["durchmesser_mm"].describe["mean"])'),
   ("std mit statistics.pstdev verwechselt", 'import statistics\nprint(round(statistics.pstdev([1.0, 2.0, 3.0]), 4), round(statistics.stdev([1.0, 2.0, 3.0]), 4))',
    "(keine Fehlermeldung) pandas std() rechnet wie statistics.stdev mit n − 1, nicht wie pstdev.")],
  ["pd-spalte", "pd-groupby"],
  bez=[".describe", ".median", ".round"],
  aliase=["Kennwerte", "Quartil", "Statistik", "Übersicht"])

E("pd-filtern", "Filtern mit Maske df[bedingung]", PD, "V15", "kopf",
  "Behält nur die Zeilen, für die eine Bedingung wahr ist.",
  "maske = df[\"spalte\"] > grenze\ndf[maske]\ndf[(bedingung1) & (bedingung2)]   # und\ndf[(bedingung1) | (bedingung2)]   # oder\ndf[~(bedingung)]                  # nicht",
  "Ein Vergleich mit einer Spalte prüft jede Zeile einzeln und liefert eine Maske: eine Spalte aus True und False. df[maske] behält die Zeilen mit True. Bedingungen verknüpfst du mit & (und), | (oder) und ~ (nicht), nicht mit and/or/not. Jede Teilbedingung braucht eigene runde Klammern, weil & und | stärker binden als > und ==.",
  _PD + '''OSG, USG = 20.020, 19.980
d2 = df[df["maschine"] == "D2"]
print(len(d2), "Teile von D2")
ausschuss = df[(df["durchmesser_mm"] > OSG) | (df["durchmesser_mm"] < USG)]
print(ausschuss)
''',
  "Für Teilmengen: eine Maschine, eine Schicht, alle Teile außerhalb der Toleranz.",
  [("Zwei Bedingungen mit und", _PD + 'auswahl = df[(df["maschine"] == "D2") & (df["stichprobe"] == 2)]\nprint(auswahl["durchmesser_mm"].mean())'),
   ("Anzahl der True-Werte einer Maske", _PD + 'print((df["durchmesser_mm"] > 20.010).sum(), "Teile über 20,010 mm")')],
  [("and statt &", _PD + 'print(df[(df["maschine"] == "D2") and (df["durchmesser_mm"] > 20.01)])'),
   ("Klammern vergessen", _PD + 'print(df[df["durchmesser_mm"] > 20.01 & df["maschine"] == "D2"])')],
  ["pd-spalte", "pd-groupby", "and-or"],
  bez=["Maske", "&", "|", "~"],
  aliase=["filtern", "Bedingung", "boolean indexing", "Auswahl"])

E("pd-groupby", "groupby()", PD, "V15", "kopf",
  "Teilt die Tabelle in Gruppen auf und berechnet je Gruppe einen Kennwert.",
  "df.groupby(\"gruppenspalte\")[\"wertspalte\"].mean()\ndf.groupby(\"gruppenspalte\")[\"wertspalte\"].agg([\"mean\", \"std\", \"count\"])",
  "groupby arbeitet in drei Schritten: aufteilen (alle Zeilen mit gleichem Wert in der Gruppenspalte kommen zusammen), anwenden (je Gruppe wird mean, std, count … berechnet), zusammenführen (das Ergebnis hat eine Zeile je Gruppe, die Gruppenwerte sind der Index). agg mit einer Liste rechnet mehrere Kennwerte auf einmal. Gruppieren nach zwei Spalten: groupby([\"maschine\", \"stichprobe\"]).",
  _PD + '''print(df.groupby("maschine")["durchmesser_mm"].mean().round(4))
kennwerte = df.groupby("maschine")["durchmesser_mm"].agg(["mean", "std", "count"])
print(kennwerte.round(4))
''',
  "Wenn du Maschinen, Schichten, Chargen oder Stichproben miteinander vergleichen willst.",
  [("Stichprobenmittel für eine Regelkarte", _PD + 'd2 = df[df["maschine"] == "D2"]\nprint(d2.groupby("stichprobe")["durchmesser_mm"].mean())'),
   ("Einen Wert aus dem Ergebnis holen", _PD + 'mittel = df.groupby("maschine")["durchmesser_mm"].mean()\nprint(round(mittel["D2"], 4))')],
  [("Gruppenspalte falsch geschrieben", _PD + 'print(df.groupby("Maschine")["durchmesser_mm"].mean())'),
   ("Kennwert vergessen: nur das Gruppen-Objekt", _PD + 'print(type(df.groupby("maschine")["durchmesser_mm"]).__name__)',
    "(keine Fehlermeldung) Ausgabe: SeriesGroupBy. Erst .mean(), .std() oder .agg([...]) rechnet etwas aus.")],
  ["pd-filtern", "pd-describe", "pd-cp-cpk"],
  bez=[".groupby", ".agg"],
  aliase=["gruppieren", "aggregieren", "split-apply-combine", "Gruppe"])

E("pd-neue-spalte", "Neue Spalte berechnen", PD, "V15", "kopf",
  "Rechnet aus vorhandenen Spalten eine neue, für alle Zeilen auf einmal.",
  "df[\"neu\"] = ausdruck_mit_spalten\nkennwerte[\"Cp\"] = (OSG - USG) / (6 * kennwerte[\"std\"])",
  "Rechnen mit einer Spalte wirkt auf jede Zeile (wie bei NumPy-Arrays), eine Schleife ist nicht nötig. Die Zuweisung an df[\"neuer_name\"] hängt das Ergebnis als Spalte an. Mit min(axis=1) nimmst du je Zeile den kleineren Wert aus mehreren Spalten, das braucht der Cpk.",
  _PD + '''df["abw_um"] = (df["durchmesser_mm"] - 20.0) * 1000   # Abweichung vom Soll in µm
print(df[["maschine", "durchmesser_mm", "abw_um"]].round(1).head(4))
''',
  "Für Abweichungen vom Sollmaß, Einheiten umrechnen (mm in µm) und Kennzahlen je Gruppe (Cp, Cpk).",
  [("Ja/Nein-Spalte für außerhalb der Toleranz", _PD + 'df["ausserhalb"] = (df["durchmesser_mm"] > 20.020) | (df["durchmesser_mm"] < 19.980)\nprint(df["ausserhalb"].sum())'),
   ("Kleinerer Wert je Zeile aus zwei Spalten", 'import pandas as pd\nk = pd.DataFrame({"bis_oben": [0.019, 0.013], "bis_unten": [0.021, 0.027]})\nprint(k[["bis_oben", "bis_unten"]].min(axis=1))')],
  [("Neue Spalte mit Punkt statt Klammern", _PD + 'df.abw = df["durchmesser_mm"] - 20.0\nprint(df["abw"])'),
   ("Text-Spalte mit Zahl verrechnet", _PD + 'print(df["maschine"] - 1)')],
  ["pd-spalte", "pd-cp-cpk", "vektorisierung"],
  bez=["axis"],
  aliase=["Spalte hinzufügen", "berechnete Spalte", "min axis=1"])

E("pd-value-counts", "value_counts() und unique()", PD, "V15", "lesen",
  "Zählt, wie oft jeder Wert in einer Spalte vorkommt.",
  "df[\"spalte\"].value_counts()\ndf[\"spalte\"].unique()",
  "value_counts() gibt jeden vorkommenden Wert mit seiner Häufigkeit aus, die häufigsten zuerst. unique() liefert die verschiedenen Werte ohne Wiederholung, nunique() ihre Anzahl. Beides ist ein schneller Plausibilitätstest: Sind alle Maschinen und Schichten dabei, gibt es Tippfehler wie \"d2\" neben \"D2\"?",
  _PD + '''print(df["maschine"].value_counts())
print(list(df["maschine"].unique()))
''',
  "Zum Prüfen von Kategorien (Maschine, Schicht, Prüfer) direkt nach dem Einlesen.",
  [("Wie viele Teile über 20,010 mm je Maschine?", _PD + 'print(df[df["durchmesser_mm"] > 20.010]["maschine"].value_counts())'),
   ("Anzahl verschiedener Werte", _PD + 'print(df["stichprobe"].nunique(), "Stichproben")')],
  [("unique auf der ganzen Tabelle statt auf einer Spalte", _PD + 'print(df.unique())')],
  ["pd-spalte", "pd-groupby"],
  bez=[".value_counts", ".unique", ".nunique"],
  aliase=["zählen", "Häufigkeit", "Kategorien"])

E("pd-cp-cpk", "Cp und Cpk berechnen", PD, "V15", "kopf",
  "Prozessfähigkeit: Wie gut passt die Streuung (Cp) und die Lage (Cpk) in die Toleranz?",
  "Cp  = (OSG - USG) / (6 * s)\nCpk = min(OSG - mittel, mittel - USG) / (3 * s)",
  "OSG und USG sind die obere und untere Spezifikationsgrenze aus der Zeichnung, mittel und s Mittelwert und Standardabweichung der Messwerte. Cp vergleicht nur die Toleranzbreite mit der Prozessstreuung 6s. Cpk berücksichtigt zusätzlich, wie mittig der Prozess liegt: Es zählt der Abstand zur näheren Grenze, deshalb ist Cpk nie größer als Cp. Üblicher Richtwert: Cpk ab 1,33 gilt als fähig, unter 1 entsteht sicher Ausschuss; verbindlich ist die Vorgabe des Kunden. Aussagekräftig nur bei einem beherrschten Prozess (Regelkarte ohne Auffälligkeiten) und genügend Teilen (z. B. 125).",
  _WELLEN + '''import pandas as pd
OSG, USG = 20.020, 19.980
df = pd.read_csv("wellen.csv")
k = df.groupby("maschine")["durchmesser_mm"].agg(["mean", "std"])
k["Cp"] = (OSG - USG) / (6 * k["std"])
k["bis_oben"] = OSG - k["mean"]
k["bis_unten"] = k["mean"] - USG
k["Cpk"] = k[["bis_oben", "bis_unten"]].min(axis=1) / (3 * k["std"])
print(k[["mean", "std", "Cp", "Cpk"]].round(3))
''',
  "Bei der Abnahme einer Maschine oder eines Prozesses und in jedem Qualitätsbericht.",
  [("Als Funktion für eine Liste von Messwerten", 'import statistics\n\ndef cpk(werte, usg, osg):\n    m = statistics.mean(werte)\n    s = statistics.stdev(werte)\n    return min(osg - m, m - usg) / (3 * s)\n\nprint(round(cpk([20.001, 19.998, 20.003, 19.999, 20.002], 19.98, 20.02), 2))'),
   ("Eingriffsgrenzen einer Mittelwertkarte (n = 5)", 'mitte, s, n = 20.0053, 0.0048, 5\nsigma_x = s / n ** 0.5\nprint(f"OEG {mitte + 3 * sigma_x:.4f} mm, UEG {mitte - 3 * sigma_x:.4f} mm")')],
  [("max statt min: der Prozess sieht besser aus, als er ist", 'mittel, s, OSG, USG = 20.0072, 0.0062, 20.020, 19.980\nprint(round(max(OSG - mittel, mittel - USG) / (3 * s), 2))',
    "(keine Fehlermeldung) Ergebnis 1,45 statt 0,68: Der Cpk nimmt den Abstand zur näheren Grenze."),
   ("Standardabweichung null (alle Werte gleich)", 'import statistics\nwerte = [20.0, 20.0, 20.0]\nprint((20.02 - 19.98) / (6 * statistics.stdev(werte)))')],
  ["pd-groupby", "pd-neue-spalte", "pd-describe"],
  bez=["Cp", "Cpk"],
  aliase=["Prozessfähigkeit", "Cpk", "Cp", "SPC", "Regelkarte", "Eingriffsgrenze"])

# ───────────── V18 IT-Sicherheit (hashlib, Bytes, Prüfsummen) ─────────────
SI = "Sicherheit & Prüfsummen"

E("hashlib-sha256", "hashlib.sha256().hexdigest()", SI, "V18", "kopf",
  "Berechnet den SHA-256-Fingerabdruck (Hash) von Bytes: immer 64 Hex-Zeichen.",
  "import hashlib\nhashlib.sha256(daten).hexdigest()\nhashlib.sha256(\"Text\".encode(\"utf-8\")).hexdigest()",
  "Eine Hashfunktion macht aus beliebig vielen Bytes einen Fingerabdruck fester Länge: bei SHA-256 sind es 256 Bit, als Text 64 Hex-Zeichen. Gleiche Daten ergeben immer denselben Hash; ändert sich auch nur ein Bit, sieht der Hash völlig anders aus (Lawineneffekt). Aus dem Hash kann man die Daten nicht zurückrechnen. sha256 nimmt nur Bytes an, Text musst du vorher mit .encode(\"utf-8\") umwandeln. hexdigest() liefert den Hash als Text (str), digest() als Bytes – vergleiche immer gleiche Arten miteinander. MD5 und SHA-1 gibt es auch, sie gelten für Sicherheitszwecke als gebrochen.",
  '''
  import hashlib

  h1 = hashlib.sha256(b"Drehzahl 1450").hexdigest()
  h2 = hashlib.sha256(b"Drehzahl 1451").hexdigest()
  print(len(h1), "Hex-Zeichen")
  print(h1[:16])
  print(h2[:16])
  print(h1 == h2)
  ''',
  "Wenn du prüfen willst, ob Daten unverändert sind: Firmware, NC-Programme, Konfigurationen, Downloads.",
  [("Hash eines Textes (erst in Bytes umwandeln)", 'import hashlib\ntext = "Welle Ø20 h6"\nprint(hashlib.sha256(text.encode("utf-8")).hexdigest())'),
   ("Daten in Stücken einmischen mit update", 'import hashlib\nh = hashlib.sha256()\nh.update(b"Drehzahl ")\nh.update(b"1450")\nprint(h.hexdigest() == hashlib.sha256(b"Drehzahl 1450").hexdigest())'),
   ("Nur den Anfang zeigen", 'import hashlib\nprint(hashlib.sha256(b"R1").hexdigest()[:16], "...")')],
  [("Text statt Bytes übergeben", 'import hashlib\nhashlib.sha256("Drehzahl 1450")'),
   ("hexdigest vergessen: Objekt statt Text", 'import hashlib\nprint(hashlib.sha256(b"abc") == "ba7816bf")', "kein Fehler, aber immer False: links steht ein Hash-Objekt, kein Text", False),
   ("digest() mit Hex-Text verglichen", 'import hashlib\nsoll = hashlib.sha256(b"abc").hexdigest()\nprint(hashlib.sha256(b"abc").digest() == soll)', "kein Fehler, aber False: digest() liefert Bytes, hexdigest() Text", False)],
  ["bytes-encode", "datei-binaer", "pruefsumme-vergleichen", "hashlib"],
  bez=["hashlib.sha256", ".hexdigest", ".digest", ".update", "hashlib.md5", "hashlib.sha1"],
  aliase=["Hash", "Prüfsumme", "SHA-256", "Fingerabdruck", "Checksumme", "sha256sum"])

E("bytes-encode", "bytes, b\"...\", .encode()", SI, "V18", "lesen",
  "Bytes sind rohe Daten (Zahlen 0 bis 255). Text wird mit .encode() zu Bytes, mit .decode() zurück.",
  "daten = b\"R1-FW\"\ndaten = \"Text\".encode(\"utf-8\")\ntext = daten.decode(\"utf-8\")",
  "Im Speicher und in Dateien stehen nur Bytes. Ein str ist Text aus Zeichen, ein bytes-Objekt eine Folge von Zahlen von 0 bis 255. Ein b vor den Anführungszeichen schreibt Bytes direkt hin (nur für einfache Zeichen ohne Umlaute). .encode(\"utf-8\") übersetzt Text in Bytes – bei UTF-8 braucht ein Umlaut zwei Bytes, deshalb ist len() danach größer. .decode(\"utf-8\") geht den Weg zurück. Ein einzelnes Byte per Index ist eine Zahl.",
  '''
  daten = b"R1-FW 3.2.1"
  print(type(daten), len(daten))
  print(daten[0])

  text = "Ä"
  roh = text.encode("utf-8")
  print(roh, len(text), len(roh))
  print(roh.decode("utf-8") == text)
  ''',
  "Überall, wo Python mit Rohdaten arbeitet: Hashes, Binärdateien, Netzwerk, serielle Schnittstellen.",
  [("Bytes als Hex anzeigen", 'print(b"R1".hex())'),
   ("Länge in Zeichen und in Bytes", 'text = "Maß 20 µm"\nprint(len(text), len(text.encode("utf-8")))')],
  [("Umlaut in einem b-Literal", 'daten = b"Maß"'),
   ("Bytes und Text verknüpft", 'print(b"R1" + "-FW")'),
   ("Bytes mit falscher Codierung zurückübersetzt", 'print("Ä".encode("utf-8").decode("ascii"))')],
  ["hashlib-sha256", "datei-binaer"],
  bez=["bytes", ".encode", ".decode", ".hex"],
  aliase=["Bytes", "Binärdaten", "encode", "decode", "UTF-8"])

E("datei-binaer", "open(pfad, \"rb\") blockweise lesen", SI, "V18", "lesen",
  "Öffnet eine Datei als Bytes (\"rb\") und liest sie Stück für Stück, z. B. für eine Prüfsumme.",
  "with open(pfad, \"rb\") as datei:\n    while True:\n        block = datei.read(4096)\n        if not block:\n            break\n        h.update(block)",
  "Firmware, Bilder oder CAD-Dateien sind kein Text. Mit dem Modus \"rb\" (read binary) liefert read() Bytes statt str, eine Codierung gibt es dabei nicht. read(4096) holt höchstens 4096 Bytes; ist die Datei zu Ende, kommt ein leeres b\"\" zurück, und not block wird wahr. So passt auch eine Datei mit mehreren Gigabyte durch, ohne den Arbeitsspeicher zu füllen. Jeder Block wird per update in den Hash eingemischt; das Ergebnis ist dasselbe, als hätte man alles auf einmal gehasht.",
  '''
  import hashlib

  with open("test.bin", "wb") as f:
      f.write(b"0123456789")

  h = hashlib.sha256()
  with open("test.bin", "rb") as datei:
      while True:
          block = datei.read(4)
          if not block:
              break
          print("Block:", block)
          h.update(block)
  print(h.hexdigest() == hashlib.sha256(b"0123456789").hexdigest())
  ''',
  "Bei jeder Datei, die keine Textdatei ist, und bei großen Dateien.",
  [("Kleine Datei auf einmal lesen", 'import hashlib\nwith open("klein.bin", "wb") as f:\n    f.write(b"abc")\nwith open("klein.bin", "rb") as f:\n    print(hashlib.sha256(f.read()).hexdigest()[:16])'),
   ("Dateigröße in Bytes", 'from pathlib import Path\nPath("x.bin").write_bytes(bytes(1000))\nprint(Path("x.bin").stat().st_size)')],
  [("Binärdatei im Textmodus gelesen", 'with open("x.bin", "wb") as f:\n    f.write(bytes([0xFF, 0xFE, 0x00, 0x81]))\nwith open("x.bin", encoding="utf-8") as f:\n    f.read()'),
   ("encoding bei \"rb\" angegeben", 'open("x.bin", "wb").close()\nopen("x.bin", "rb", encoding="utf-8")')],
  ["hashlib-sha256", "with-open", "bytes-encode"],
  bez=["\"rb\"", "\"wb\"", ".read", "read(4096)"],
  aliase=["Binärmodus", "rb", "Datei als Bytes", "blockweise lesen", "Firmware lesen"])

E("pruefsumme-vergleichen", "Prüfsumme vergleichen (Soll/Ist)", SI, "V18", "kopf",
  "Soll-Wert aus der .sha256-Datei lesen, bereinigen und mit dem selbst berechneten Ist-Wert vergleichen.",
  "soll = f.read().split()[0].lower()\nist = sha256_datei(pfad)\nif ist == soll:\n    print(\"OK\")",
  "Hersteller veröffentlichen zu Downloads eine Prüfsummendatei im Format <hex>  <dateiname>. split()[0] nimmt die erste Spalte und wirft Leerzeichen und Zeilenumbruch weg; .lower() macht Großbuchstaben-Hex vergleichbar. Erst dann vergleichst du mit ==. Wichtig: Der Soll-Wert muss über einen zweiten, vertrauenswürdigen Weg kommen (z. B. Hersteller-Website), nicht vom selben USB-Stick wie die Datei – sonst kann ein Angreifer beides tauschen.",
  '''
  import hashlib

  daten = b"R1-FW 3.2.1"
  zeile = hashlib.sha256(daten).hexdigest().upper() + "  R1_fw_3.2.1.bin\\n"
  soll = zeile.split()[0].lower()
  ist = hashlib.sha256(daten).hexdigest()
  if ist == soll:
      print("OK - darf eingespielt werden")
  else:
      print("ABWEICHUNG - nicht einspielen!")
  ''',
  "Vor dem Einspielen von Firmware, Updates und freigegebenen NC-Programmen.",
  [("Mehrere Dateien gegen eine Liste prüfen", 'import hashlib\nfreigabe = {"a.nc": hashlib.sha256(b"G0 X0").hexdigest()}\ndateien = {"a.nc": b"G0 X0", "b.nc": b"G1 X5"}\nfor name, inhalt in dateien.items():\n    if name not in freigabe:\n        print(name, "nicht freigegeben")\n    elif hashlib.sha256(inhalt).hexdigest() == freigabe[name]:\n        print(name, "OK")\n    else:\n        print(name, "GEÄNDERT")'),
   ("Soll-Wert in Großbuchstaben mit Leerzeichen", 'import hashlib\nsoll = "  " + hashlib.sha256(b"R1").hexdigest().upper() + "\\n"\nist = hashlib.sha256(b"R1").hexdigest()\nprint(ist == soll, ist == soll.strip().lower())')],
  [("Ganze Zeile mit Dateiname verglichen", 'import hashlib\nzeile = hashlib.sha256(b"x").hexdigest() + "  x.bin\\n"\nprint(hashlib.sha256(b"x").hexdigest() == zeile)', "kein Fehler, aber immer False: Dateiname und Zeilenumbruch stehen mit im Text", False),
   ("Leere Prüfsummendatei", 'zeile = ""\nsoll = zeile.split()[0]')],
  ["hashlib-sha256", "split", "datei-binaer"],
  bez=["Soll-Ist-Vergleich", ".sha256"],
  aliase=["Prüfsumme prüfen", "Checksumme vergleichen", "Integrität prüfen", "Firmware prüfen", "sha256sum -c"])
