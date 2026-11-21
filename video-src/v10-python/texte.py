"""Sprechertext V10 Python (Quelltext mit Markup)."""
SRC = [
 ["Ein Text ist in Python ein String. Mit Methoden bearbeitest du ihn, geschrieben mit einem Punkt hinter dem Text.",
  "`text.strip()` entfernt Leerzeichen an beiden Enden. `text.lower()` macht alles klein, `text.upper()` alles groß.",
  "`text.replace` mit altem und neuem Stück ersetzt jedes Vorkommen.",
  "Wichtig: Ein String ist unveränderlich. Jede Methode liefert einen neuen Text. Du musst ihn einer Variablen zuweisen, sonst ist er weg."],
 ["Mit `split` zerlegst du einen Text in eine Liste: `satz.split(\" \")` trennt an jedem Leerzeichen.",
  "Mit `join` baust du aus einer Liste wieder einen Text. Das Trennzeichen steht vor dem Punkt: `\" \".join(woerter)`.",
  "Die Liste darf nur Texte enthalten. Bei Zahlen gibt es einen TypeError."],
 ["`count` zählt, wie oft ein Stück vorkommt. Groß und klein sind verschiedene Zeichen, also vorher `lower` anwenden.",
  "`startswith` und `endswith` prüfen Anfang und Ende, `in` fragt, ob ein Stück irgendwo im Text steht.",
  "Bei einer Liste zählt `count` dagegen ganze Elemente."],
 ["Die List Comprehension ist eine Kurzform der Schleife mit `append`.",
  "Statt leere Liste, Schleife und `append` schreibst du in eckigen Klammern: `[x * x for x in zahlen]`.",
  "Lies sie wie einen Satz: x mal x für jedes x in zahlen. Vorn steht, was in die neue Liste kommt, hinten, woher die Elemente stammen."],
 ["Am Ende darf ein `if` als Filter stehen. `[d for d in messungen if d > grenze]` sammelt alle Werte über der Grenze.",
  "Nur Elemente, für die die Bedingung wahr ist, kommen in die neue Liste.",
  "Vorn darfst du zusätzlich umrechnen, zum Beispiel `w.upper()`. Wird die Zeile unlesbar, nimm lieber die Schleife."],
 ["Daraus wird ein Tokenizer. Alles klein, der Punkt bekommt mit `replace` Leerzeichen und wird ein eigenes Token, dann `split`.",
  "Zum Schluss filterst du die leeren Stücke heraus: `[w for w in woerter if w != \"\"]`.",
  "Wer den Punkt oder die Kleinschreibung vergisst, zählt Zahnrad und zahnrad als zwei Wörter. Das ist ein typischer Fehler in KI-Code."],
]

SZENEN = [
 "Codeausschnitt mit text = \"  Die Welle  \" und vier Aufrufen strip, lower, upper, replace; neben jedem Aufruf erscheint das Ergebnis. Ein Warnschild Neuer Text, Original bleibt zeigt, dass text selbst unverändert bleibt.",
 "Ein Satz als Kette von Wortkästchen; split schneidet sie auf, join klebt sie wieder zusammen. Ein roter Hinweis TypeError erscheint bei join mit Zahlen.",
 "Der Satz mit hervorgehobenen Treffern für count; bei großem und kleinem die färben sich unterschiedlich viele Treffer. Drei kleine Kästen mit True oder False für startswith, endswith und in.",
 "Links eine Schleife mit append (vier Zeilen), rechts die eine Zeile der Comprehension; Pfeile verbinden gleiche Teile (Ausdruck, for-Teil). Die Ergebnisliste wächst Element für Element.",
 "Messreihe als Kästchenreihe, der if-Teil prüft jedes Element; Werte außerhalb wandern in die Ergebnisliste, die anderen werden durchgestrichen. Darunter ein Wörter-Beispiel mit upper.",
 "Funktion tokenisiere im Editor, vier Schritte nacheinander markiert (klein, Punkt, split, leere filtern). Als Warnbeispiel zwei Tokenlisten nebeneinander: mit und ohne lower, Zahnrad. und zahnrad.",
]
