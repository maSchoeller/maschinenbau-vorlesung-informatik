"""Eintraege der Termine 09 und 10 (Zufall, Zeichencode). Nur anhaengen, keine fremden Eintraege aendern."""
from helfer import E

ZU = "Zufall (random)"
VD = "Variablen & Datentypen"

E("import-random", "import random", ZU, "V09", "kopf",
  "Holt das Modul für Zufallszahlen in dein Programm.",
  "import random",
  "Ohne diese Zeile kennt Python den Namen random nicht. Sie steht ganz oben im Programm, vor allem anderen. In der Klausur musst du sie auswendig schreiben können.",
  '''
  import random
  zahl = random.randint(1, 6)
  print(zahl >= 1)
  ''',
  "Immer, wenn dein Programm etwas zufällig auswählen soll: Würfel, Spiele.",
  [("Würfel", 'import random\nwurf = random.randint(1, 6)\nprint(1 <= wurf <= 6)'),
   ("Zahl für das Ratespiel", 'import random\ngeheim = random.randint(1, 100)\nprint(1 <= geheim <= 100)')],
  [("import vergessen", 'zahl = random.randint(1, 6)'),
   ("Name falsch geschrieben", 'import randon')],
  ["random-randint"],
  bez=["random", "import random"])

E("random-randint", "random.randint(a, b)", ZU, "V09", "kopf",
  "Eine zufällige ganze Zahl von a bis b.",
  "random.randint(a, b)",
  "random.randint(a, b) liefert eine ganze Zahl von a bis b. Beide Grenzen gehören dazu. Das ist anders als bei range, wo der Stoppwert nicht dazugehört. Bei jedem Aufruf kommt eine neue Zahl. Wer die Zahl mehrfach braucht, speichert sie in einer Variablen.",
  '''
  import random
  wurf = random.randint(1, 6)
  print(1 <= wurf <= 6)
  ''',
  "Für Würfel, die geheime Zahl im Ratespiel und alles, was dem Zufall überlassen bleibt.",
  [("Würfel mit zwei Augenzahlen", 'import random\na = random.randint(1, 6)\nb = random.randint(1, 6)\nprint(2 <= a + b <= 12)'),
   ("Zahl von 1 bis 100", 'import random\ngeheim = random.randint(1, 100)\nprint(1 <= geheim <= 100)')],
  [("Nur eine Grenze angegeben", 'import random\nrandom.randint(6)'),
   ("Ohne import", 'random.randint(1, 6)')],
  ["import-random", "range"],
  bez=["random.randint", "randint"], aliase=["Zufallszahl", "würfeln"])

E("ord-chr", "ord() und chr() (nur lesen)", VD, "V10", "lesen",
  "Zeichen und ihre Zahl im ASCII-Code ineinander umrechnen.",
  "ord(\"A\")    chr(65)",
  "Jedes Zeichen ist im Rechner eine Zahl. ord(zeichen) liefert diese Zahl, chr(zahl) das Zeichen dazu. Bei diesem Kurs liest du die beiden Befehle nur, schreiben musst du sie nicht.",
  '''
  print(ord("A"))
  print(chr(66))
  ''',
  "Zum Verstehen, dass ein Buchstabe als Zahl gespeichert ist.",
  [("Code eines Kleinbuchstabens", 'print(ord("a"))'),
   ("Zeichen zu einem Code", 'print(chr(48))')],
  [("Mehr als ein Zeichen", 'print(ord("AB"))'),
   ("Zahl statt Text bei ord", 'print(ord(65))')],
  ["str-text"],
  bez=["ord", "chr"], aliase=["ASCII", "Zeichencode"])
