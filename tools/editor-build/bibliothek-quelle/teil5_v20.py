"""Eintraege der Lektion V20 (Objekte & CAD-Automatisierung). Nur anhaengen, keine fremden Eintraege aendern."""
from helfer import E, S

KO = "Klassen & Objekte"
AU = "Ausblick (ab V10)"

E("klasse", "class (Klasse definieren)", KO, "V20", "kopf",
  "Ein Bauplan für Objekte: bündelt Maße (Attribute) und Rechnungen (Methoden) eines Bauteils.",
  "class Name:\n    def __init__(self, parameter):\n        self.parameter = parameter\n\n    def methode(self):\n        return ...",
  "Mit class legst du einen neuen Datentyp an. Die Klasse ist der Bauplan, wie ein Normblatt oder eine Zeichnungsvorlage: Sie beschreibt, welche Maße ein Bauteil hat und was man damit rechnen kann, ist selbst aber noch kein konkretes Teil. Der Name steht im Kopf, ein Doppelpunkt schließt ihn ab, der Rumpf ist eingerückt. Per Konvention beginnt der Klassenname mit einem Großbuchstaben (Flansch, Welle), damit man ihn von Variablen unterscheidet. Die Definition allein rechnet nichts: Erst wenn du ein Objekt erzeugst, entsteht ein konkretes Teil.",
  '''
  class Welle:
      """Glatte Welle (Maße in mm)."""

      def __init__(self, d, l):
          self.d = d
          self.l = l

      def volumen(self):
          return 3.14159265 / 4 * self.d ** 2 * self.l


  w = Welle(20, 150)
  print(w.d, w.l)
  print(round(w.volumen() / 1000, 1), "cm³")
  ''',
  "Immer wenn zusammengehörige Maße und die zugehörigen Rechnungen sonst als lose Variablen und Funktionen mit vielen Parametern herumliegen: Welle, Rohr, Flansch, Feder, Werkzeug.",
  [("Bauplan für eine Feder", 'class Feder:\n    def __init__(self, c):\n        self.c = c\n\n    def kraft(self, s):\n        return self.c * s\n\nf = Feder(12.5)\nprint(f.kraft(4), "N")'),
   ("Zwei Teile aus einem Bauplan", 'class Rohr:\n    def __init__(self, d_aussen, d_innen, l):\n        self.d_aussen = d_aussen\n        self.d_innen = d_innen\n        self.l = l\n\nr1 = Rohr(42, 36, 1000)\nr2 = Rohr(60, 52, 500)\nprint(r1.d_aussen, r2.d_aussen)')],
  [("Doppelpunkt hinter dem Klassennamen vergessen", 'class Welle\n    pass'),
   ("Klasse definiert, aber kein Objekt erzeugt: der Klassenname allein hat keine Maße", 'class Welle:\n    def __init__(self, d):\n        self.d = d\n\nprint(Welle.d)')],
  ["init", "objekt-erzeugen", "def"],
  bez=["class"],
  aliase=["Klasse", "Bauplan", "Objektorientierung", "eigener Datentyp", "OOP"])

E("init", "__init__ (Konstruktor)", KO, "V20", "kopf",
  "Richtet ein neues Objekt ein: nimmt die Maße entgegen und speichert sie als Attribute.",
  "def __init__(self, d, l):\n    self.d = d\n    self.l = l",
  "__init__ (zwei Unterstriche davor und dahinter) ruft Python automatisch auf, sobald du ein Objekt erzeugst, zum Beispiel mit Welle(20, 150). Der erste Parameter heißt immer self, die übrigen sind die Werte, die du beim Erzeugen angibst. Was nicht mit self.name = ... gespeichert wird, ist nach dem Ende von __init__ weg: Parameter sind lokale Variablen. Auch Standardwerte funktionieren wie bei jeder Funktion. __init__ gibt nichts zurück (kein return).",
  '''
  class Flansch:
      def __init__(self, d_aussen, d_innen, dicke, n=4):
          self.d_aussen = d_aussen
          self.d_innen = d_innen
          self.dicke = dicke
          self.n = n


  f1 = Flansch(120, 40, 15, 6)
  f2 = Flansch(100, 30, 12)
  print(f1.n, f2.n)
  ''',
  "Bei jeder Klasse, die Maße oder Zustand speichert: Einmal beim Erzeugen festlegen, danach in allen Methoden benutzen.",
  [("Wert prüfen, bevor er gespeichert wird", 'class Welle:\n    def __init__(self, d, l):\n        if d <= 0 or l <= 0:\n            raise ValueError("Maße müssen positiv sein")\n        self.d = d\n        self.l = l\n\nprint(Welle(20, 150).d)'),
   ("Aus gegebenen Maßen ein weiteres Attribut ableiten", 'class Rohr:\n    def __init__(self, d_aussen, d_innen):\n        self.d_aussen = d_aussen\n        self.d_innen = d_innen\n        self.wand = (d_aussen - d_innen) / 2\n\nprint(Rohr(42, 36).wand)')],
  [("Parameter nicht als Attribut gespeichert: die Methode findet ihn nicht", 'class Welle:\n    def __init__(self, d, l):\n        self.d = d\n\n    def volumen(self):\n        return self.l * self.d\n\nprint(Welle(20, 150).volumen())'),
   ("Zu wenige Argumente beim Erzeugen", 'class Welle:\n    def __init__(self, d, l):\n        self.d = d\n        self.l = l\n\nw = Welle(20)')],
  ["klasse", "self", "default-werte"],
  bez=["__init__"],
  aliase=["Konstruktor", "Initialisierung", "Objekt einrichten"])

E("self", "self", KO, "V20", "kopf",
  "Das Objekt, mit dem eine Methode gerade arbeitet: über self.name erreichst du seine Attribute.",
  "def methode(self, ...):\n    return self.attribut",
  "In jeder Methode ist self der erste Parameter. Beim Aufruf w1.volumen() setzt Python das Objekt w1 automatisch dort ein, du schreibst es nicht in die Klammer. Darum gehört in die Methode self.d für das Maß des eigenen Objekts: Ein nacktes d wäre eine andere Variable (und existiert meist nicht). Ruft man dieselbe Methode an einem zweiten Objekt auf, ist self dieses zweite Objekt, und die Rechnung nimmt dessen Maße. Der Name self ist Konvention, aber alle verwenden ihn.",
  '''
  class Welle:
      def __init__(self, d, l):
          self.d = d
          self.l = l

      def streckung(self):
          return self.l / self.d


  w1 = Welle(20, 150)
  w2 = Welle(40, 150)
  print(w1.streckung())
  print(w2.streckung())
  ''',
  "In jeder Methode und in __init__, sobald sie Maße des Objekts lesen oder ändern soll.",
  [("Eine Methode ändert den Zustand des eigenen Objekts", 'class Werkzeug:\n    def __init__(self, standzeit):\n        self.rest = standzeit\n\n    def benutze(self, minuten):\n        self.rest = self.rest - minuten\n\nt = Werkzeug(60)\nt.benutze(25)\nprint(t.rest)'),
   ("Eine Methode ruft eine andere Methode desselben Objekts auf", 'class Quader:\n    def __init__(self, a, b, c):\n        self.a, self.b, self.c = a, b, c\n\n    def volumen(self):\n        return self.a * self.b * self.c\n\n    def masse(self, dichte=7.85):\n        return self.volumen() / 1e6 * dichte\n\nprint(round(Quader(100, 50, 20).masse(), 2), "kg")')],
  [("self in der Definition vergessen", 'class Welle:\n    def __init__(self, d):\n        self.d = d\n\n    def umfang():\n        return 3.14159 * self.d\n\nprint(Welle(20).umfang())'),
   ("d statt self.d in der Rechnung", 'class Welle:\n    def __init__(self, d):\n        self.d = d\n\n    def umfang(self):\n        return 3.14159 * d\n\nprint(Welle(20).umfang())')],
  ["klasse", "methode", "attribut"],
  bez=["self"],
  aliase=["selbst", "eigenes Objekt", "self vergessen"])

E("attribut", "Attribut lesen und ändern", KO, "V20", "kopf",
  "Ein Maß oder Merkmal eines Objekts: mit objekt.name lesen, mit objekt.name = wert ändern.",
  "w = Welle(20, 150)\nprint(w.d)\nw.d = 25",
  "Ein Attribut ist eine Variable, die zu einem Objekt gehört. Du erreichst sie mit einem Punkt zwischen Objektname und Attributname. Lesen und Ändern funktionieren wie bei einer normalen Variablen; es gibt keine Klammern. Jedes Objekt hat seine eigenen Attribute: Ändert man w1.d, bleibt w2.d unverändert. Wichtig: Weist du ein Objekt einem zweiten Namen zu (w2 = w1), gibt es trotzdem nur ein Objekt mit zwei Namen, und eine Änderung ist über beide sichtbar (wie bei Listen in V08).",
  '''
  class Welle:
      def __init__(self, d, l):
          self.d = d
          self.l = l


  w1 = Welle(20, 150)
  w2 = Welle(20, 150)
  w1.d = 25
  print(w1.d, w2.d)

  w3 = w1
  w3.l = 200
  print(w1.l)
  ''',
  "Wenn du Varianten durchspielst (Länge ändern, Durchmesser ändern) oder den Zustand eines Teils fortschreibst (Reststandzeit, Stückzahl).",
  [("Alle Maße eines Objekts ausgeben", 'class Welle:\n    def __init__(self, d, l):\n        self.d = d\n        self.l = l\n\nw = Welle(20, 150)\nprint(vars(w))'),
   ("Variante durch Ändern eines Attributs", 'class Flansch:\n    def __init__(self, n):\n        self.n = n\n\nf = Flansch(6)\nfor n in (4, 6, 8):\n    f.n = n\n    print(f.n, "Bohrungen")')],
  [("Tippfehler im Attributnamen", 'class Welle:\n    def __init__(self, d):\n        self.d = d\n\nw = Welle(20)\nprint(w.durchmesser)'),
   ("Zwei Namen, ein Objekt: die Änderung schlägt auf beide durch", 'class Welle:\n    def __init__(self, d):\n        self.d = d\n\nw1 = Welle(20)\nw2 = w1\nw2.d = 99\nprint(w1.d)', "(keine Fehlermeldung) Ausgabe 99: w1 und w2 sind dasselbe Objekt.", False)],
  ["klasse", "init", "liste"],
  bez=["Attribut", "vars"],
  aliase=["Eigenschaft", "Maß ändern", "punkt-notation", "Alias"])

E("methode", "Methode definieren und aufrufen", KO, "V20", "kopf",
  "Eine Funktion, die zu einer Klasse gehört: Aufruf mit Klammern am Objekt, z. B. w.volumen().",
  "class Welle:\n    def volumen(self):\n        return ...\n\nw.volumen()",
  "Eine Methode ist eine def-Funktion im Rumpf der Klasse. Ihr erster Parameter ist self. Aufgerufen wird sie am Objekt: objekt.methode(argumente). Die Klammern sind Pflicht, auch ohne Argumente; ohne Klammern bekommst du nur die Methode selbst (bound method), nicht ihr Ergebnis. Methoden können Standardwerte haben (masse(dichte=7.85)), etwas zurückgeben (return) oder ein Attribut verändern. Du nutzt Methoden seit V01: \"M10\".upper() und liste.append(x) sind Methodenaufrufe, denn str und list sind Klassen.",
  '''
  import math


  class Rohr:
      def __init__(self, d_aussen, d_innen, l):
          self.d_aussen = d_aussen
          self.d_innen = d_innen
          self.l = l

      def volumen(self):
          """mm³"""
          return math.pi / 4 * (self.d_aussen ** 2 - self.d_innen ** 2) * self.l

      def masse(self, dichte=7.85):
          """kg, Dichte in g/cm³"""
          return self.volumen() / 1000 * dichte / 1000


  r = Rohr(42, 36, 1000)
  print(round(r.volumen() / 1000, 1), "cm³")
  print(round(r.masse(), 2), "kg Stahl")
  print(round(r.masse(2.70), 2), "kg Aluminium")
  ''',
  "Für jede Rechnung oder Prüfung, die zu einem Bauteil gehört: Volumen, Masse, ist_gueltig, benutzen.",
  [("Prüfmethode mit Wahrheitswert", 'class Rohr:\n    def __init__(self, d_aussen, d_innen):\n        self.d_aussen = d_aussen\n        self.d_innen = d_innen\n\n    def ist_gueltig(self):\n        return 0 < self.d_innen < self.d_aussen\n\nprint(Rohr(42, 36).ist_gueltig(), Rohr(36, 42).ist_gueltig())'),
   ("Baureihe: Methode auf allen Objekten einer Liste", 'class Welle:\n    def __init__(self, d, l):\n        self.d = d\n        self.l = l\n\n    def volumen(self):\n        return 3.14159265 / 4 * self.d ** 2 * self.l\n\nreihe = [Welle(d, 200) for d in (16, 20, 25)]\nfor w in reihe:\n    print(w.d, round(w.volumen() / 1000, 1))'),
   ("Bekannte Methoden: str und list sind Klassen", 'text = "m10"\nprint(text.upper())\nteile = []\nteile.append("Welle")\nprint(teile)')],
  [("Klammern vergessen: du bekommst die Methode, nicht das Ergebnis", 'class Welle:\n    def __init__(self, d):\n        self.d = d\n\n    def umfang(self):\n        return 3.14159 * self.d\n\nprint(Welle(20).umfang)', "(keine Fehlermeldung) Ausgabe <bound method Welle.umfang of ...>: das Ergebnis fehlt, die Klammern auch.", False),
   ("Argument übergeben, das die Methode nicht erwartet", 'class Welle:\n    def __init__(self, d):\n        self.d = d\n\n    def umfang(self):\n        return 3.14159 * self.d\n\nprint(Welle(20).umfang(5))')],
  ["klasse", "self", "def", "default-werte"],
  bez=["Methode", "bound method"],
  aliase=["Funktion im Objekt", "Methodenaufruf", "Klammern", "bound method"])

E("objekt-erzeugen", "Objekt erzeugen (Klassenname(...))", KO, "V20", "kopf",
  "Aus dem Bauplan ein konkretes Teil machen: name = Klasse(werte). Viele Objekte gehen in eine Liste.",
  "w = Welle(20, 150)\nreihe = [Welle(16, 200), Welle(20, 200)]",
  "Der Aufruf Klassenname(werte) legt ein neues Objekt (eine Instanz, ein Exemplar) an und führt dabei __init__ mit diesen Werten aus. Das Ergebnis speicherst du in einer Variablen. Aus einer Klasse kannst du beliebig viele Objekte erzeugen, jedes mit eigenen Maßen. Wie jeder Wert dürfen sie in Listen, Dictionaries oder Funktionsargumenten stehen. So bildest du eine Baureihe ab und wertest sie mit einer Schleife aus.",
  '''
  class Flansch:
      def __init__(self, d_aussen, d_innen, dicke):
          self.d_aussen = d_aussen
          self.d_innen = d_innen
          self.dicke = dicke

      def volumen(self):
          return 3.14159265 / 4 * (self.d_aussen ** 2 - self.d_innen ** 2) * self.dicke


  reihe = [Flansch(90, 30, 12), Flansch(120, 40, 15), Flansch(150, 60, 18)]
  for f in reihe:
      print(f.d_aussen, round(f.volumen() / 1000, 1), "cm³")

  groesster = max(reihe, key=lambda f: f.volumen())
  print("Größtes Volumen bei Außendurchmesser:", groesster.d_aussen)
  ''',
  "Wenn du mehrere Varianten desselben Bauteils vergleichst: Baureihe, Prüfplan, Stückliste mit Objekten.",
  [("Objekte aus Tabellenzeilen erzeugen", 'class Welle:\n    def __init__(self, d, l):\n        self.d = d\n        self.l = l\n\nzeilen = ["20;150", "25;200"]\nwellen = []\nfor z in zeilen:\n    d, l = z.split(";")\n    wellen.append(Welle(float(d), float(l)))\nprint(len(wellen), wellen[1].l)'),
   ("Ungültige Varianten zählen", 'class Rohr:\n    def __init__(self, a, i):\n        self.a, self.i = a, i\n\n    def ist_gueltig(self):\n        return self.i < self.a\n\nrohre = [Rohr(42, 36), Rohr(30, 32), Rohr(60, 52)]\nprint(sum(1 for r in rohre if not r.ist_gueltig()), "ungültig")')],
  [("Klammern beim Erzeugen vergessen: der Name ist nur die Klasse, kein Objekt", 'class Welle:\n    def __init__(self, d):\n        self.d = d\n\nw = Welle\nprint(w.d)'),
   ("Zu viele Argumente beim Erzeugen", 'class Welle:\n    def __init__(self, d, l):\n        self.d = d\n        self.l = l\n\nw = Welle(20, 150, 7)')],
  ["klasse", "init", "attribut", "append"],
  bez=["Objekt", "Instanz"],
  aliase=["Instanz", "Exemplar", "Baureihe", "Objekte in Liste", "neues Objekt"])

S("bauteil3d", "bauteil3d (Dreiecksnetz, STL)", AU, "V20", "delegieren",
  "Mitgeliefertes Hilfsmodul: erzeugt aus Maßen ein Dreiecksnetz und zeigt es in 3D (flansch, welle, ring, zeige). Dein Anteil: die Klasse mit den Maßen.",
  "import bauteil3d\nm = bauteil3d.flansch(120, 40, 15, 90, 6, 11)\nbauteil3d.zeige(m, \"Flansch\")", ["klasse", "methode"], bez=["bauteil3d", "STL", "mesh"])
