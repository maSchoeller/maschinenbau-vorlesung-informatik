"""Sprechertext Termin 08, Video 1: Zahl oder Text? (Quelltext mit Markup)."""
SRC = [
 ["Ein Programm fragt nach dem Alter. Du tippst [[17|siebzehn]] in das Eingabefeld. Aber Python speichert das nicht als Zahl.",
  "Was [[input|input]] liefert, ist immer Text. [[type|teip]] zeigt es: [[str|ess-tee-er]]. Das steht für Text.",
  "Text steht in Anführungszeichen, hier [[\"17\"|siebzehn in Anführungszeichen]]. Es sieht aus wie eine Zahl, ist aber Text.",
  "Neben [[int|int]] und [[float|floht]] gibt es also einen dritten Typ. Der Typ sagt Python, wie ein Wert zu behandeln ist."],
 ["Mit [[+|plus]] hängst du Text aneinander: [[\"Hallo \" + name|Hallo in Anführungszeichen plus name]] ergibt Hallo Lea. Das Leerzeichen gehört in den Text.",
  "Anders ist es bei Text und Zahl. Zählst du zum Alter eins dazu, bricht Python ab und meldet einen [[TypeError|teip-error]].",
  "Lies die Meldung von unten. [[TypeError|teip-error]] heißt: Die Typen passen nicht zusammen. [[str|ess-tee-er]] und [[int|int]] sind die zwei Typen, die sich nicht mischen lassen.",
  "Die Meldung ist keine Strafe. Sie sagt dir genau, was nicht passt."],
 ["Was du tust, hängt davon ab, was du willst. Willst du rechnen, machst du mit [[int|int]] aus dem Text eine Zahl. Deshalb schreibst du seit Termin eins [[int(input(...))|int von input]].",
  "Dann steht in [[alter|alter]] die Zahl 17, und [[alter + 1|alter plus eins]] ergibt 18.",
  "[[str|ess-tee-er]] geht in die andere Richtung. [[str(12)|str von zwölf]] macht aus der Zahl einen Text. So hängst du sie an einen Text an: Punkte, Doppelpunkt, 12.",
  "Und noch etwas zu [[int|int]]: [[int(3.7)|int von drei Komma sieben]] ergibt 3. Die Umwandlung schneidet die Stellen nach dem Komma ab, sie rundet nicht."],
 ["Der vierte Typ heißt [[bool|buhl]]. Er kennt nur zwei Werte: [[True|truh]] und [[False|fals]]. Ein Vergleich wie [[5 > 3|fünf größer drei]] ergibt einen davon.",
  "Das kennst du schon aus [[if|if]]: Die Bedingung ist ein Vergleich, und er ist wahr oder falsch.",
  "Merke dir: [[input|input]] liefert Text. Mit [[int|int]], [[float|floht]] und [[str|ess-tee-er]] wandelst du um. Python rechnet nur mit Werten, die zusammenpassen."],
]

SZENEN = [
 "Ein Eingabefeld, in das 17 getippt wird; die 17 landet als Text in Anführungszeichen in der Variablen alter; type(alter) zeigt str.",
 "Text mit plus zusammengesetzt (Hallo Lea); alter + 1 mit alter als Text bricht ab; die Meldung TypeError wird von unten gelesen, str und int sind markiert.",
 "int, str und int(3.7): der Text wird zur Zahl, die Zahl zum Text, die Kommazahl wird abgeschnitten.",
 "Ein Vergleich ergibt True oder False, Typ bool; eine Merkzeile mit den vier Typen int, float, str, bool.",
]
