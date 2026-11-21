# Automatische Sprechfassungen der bisherigen Videos

Erzeugt mit `video-src/common/sprechfassungen_erzeugen.py` (keine TTS-Aufrufe). **Original** = Untertitel/Quelltext mit Ziffern, **Sprechfassung** = `sprechfassung(Original)`, **bisher** = der bisher vertonte, von Hand ausgeschriebene Text. Die Original-Texte enthalten noch kein Markup (keine Backticks, kein `[[A|B]]`); Code erscheint deshalb ohne Backticks und wird mit PRÜFEN markiert. PRÜFEN = Automatik klingt vermutlich schlecht oder ist mehrdeutig.

Gesamt: 41 PRÜFEN-Stellen.

## v01-beispiel

Quelle: `video-src/v01-beispiel/` – render.py, Liste SECS (Untertitel = Original; bisher gesprochen = audio/s1..s6.txt bzw. SECS, 2. Tupelelement)

### v01-beispiel · Absatz 1

**Original:** Heute rechnest du ein Prüfprotokoll vor: die Zugspannung in einem Rundstab. Bekannt sind die Zugkraft von 12 000 Newton und der Durchmesser von 10 Millimetern. Das Programm fragt nach Prüfer und Bauteil, berechnet Fläche und Spannung und gibt ein Protokoll aus. Dafür reichen print, Variablen, Kommentare und input aus diesem Kapitel.

**Sprechfassung:** Heute rechnest du ein Prüfprotokoll vor: die Zugspannung in einem Rundstab. Bekannt sind die Zugkraft von zwölftausend Newton und der Durchmesser von zehn Millimetern. Das Programm fragt nach Prüfer und Bauteil, berechnet Fläche und Spannung und gibt ein Protokoll aus. Dafür reichen print, Variablen, Kommentare und input aus diesem Kapitel.

**bisher:** Heute rechnest du ein Prüfprotokoll vor: die Zugspannung in einem Rundstab. Bekannt sind die Zugkraft von zwölftausend Newton und der Durchmesser von zehn Millimetern. Das Programm fragt nach Prüfer und Bauteil, berechnet Fläche und Spannung und gibt ein Protokoll aus. Dafür reichen print, Variablen, Kommentare und input aus diesem Kapitel.

### v01-beispiel · Absatz 2

**Original:** Die ersten beiden Zeilen sind Kommentare. Sie beginnen mit einer Raute und sagen, worum es geht. In Zeile 4 und 5 liest input zwei Texte ein: den Namen der Prüferin oder des Prüfers und die Bauteil-Bezeichnung. Der Text in den Klammern ist die Aufforderung, die Antworten landen in den Variablen pruefer und bauteil. Beides bleibt Text, damit wird nichts gerechnet.

**Sprechfassung:** Die ersten beiden Zeilen sind Kommentare. Sie beginnen mit einer Raute und sagen, worum es geht. In Zeile vier und fünf liest input zwei Texte ein: den Namen der Prüferin oder des Prüfers und die Bauteil-Bezeichnung. Der Text in den Klammern ist die Aufforderung, die Antworten landen in den Variablen pruefer und bauteil. Beides bleibt Text, damit wird nichts gerechnet.

**bisher:** Die ersten beiden Zeilen sind Kommentare. Sie beginnen mit einer Raute und sagen, worum es geht. In Zeile vier und fünf liest input zwei Texte ein: den Namen der Prüferin oder des Prüfers und die Bauteil-Bezeichnung. Der Text in den Klammern ist die Aufforderung, die Antworten landen in den Variablen prüfer und bauteil. Beides bleibt Text, damit wird nichts gerechnet.

### v01-beispiel · Absatz 3

**Original:** Dann folgen die festen Werte: kraft_n ist 12000, durchmesser_mm ist 10. Die Einheit steckt im Namen und im Kommentar, so verwechselst du später nichts. Pi ist hier eine Näherung: 3,14159. Alle Zahlen stehen noch fest im Code. Zahlen einlesen lernst du in Lektion drei.

**Sprechfassung:** Dann folgen die festen Werte: kraft_n ist zwölftausend, durchmesser_mm ist zehn. Die Einheit steckt im Namen und im Kommentar, so verwechselst du später nichts. Pi ist hier eine Näherung: ungefähr drei Komma eins vier zwei. Alle Zahlen stehen noch fest im Code. Zahlen einlesen lernst du in Lektion drei.

**bisher:** Dann folgen die festen Werte: kraft Unterstrich n ist zwölftausend, durchmesser Unterstrich m m ist zehn. Die Einheit steckt im Namen und im Kommentar, so verwechselst du später nichts. Pi ist hier eine Näherung: drei Punkt eins vier eins fünf neun. Alle Zahlen stehen noch fest im Code. Zahlen einlesen lernst du in Lektion drei.

- PRÜFEN: gerundet: 3.14159
- PRÜFEN: Code ohne Backticks: kraft_n
- PRÜFEN: Code ohne Backticks: durchmesser_mm
- PRÜFEN: Rest-Ziffern/Symbole: durchmesser_mm, kraft_n

### v01-beispiel · Absatz 4

**Original:** Jetzt wird gerechnet. Zeile 11 berechnet die Fläche: pi mal d mal d durch vier. Denk an die Zuweisung von rechts nach links: Erst wird die rechte Seite ausgerechnet, dann bekommt flaeche_mm2 das Ergebnis. Zeile 12 teilt die Kraft durch die Fläche und speichert die Spannung. Die Fläche liegt in Quadratmillimetern vor, also kommt Newton pro Quadratmillimeter heraus, das sind Megapascal. Die Reihenfolge zählt: Die Fläche muss existieren, bevor du sie benutzt.

**Sprechfassung:** Jetzt wird gerechnet. Zeile elf berechnet die Fläche: pi mal d mal d durch vier. Denk an die Zuweisung von rechts nach links: Erst wird die rechte Seite ausgerechnet, dann bekommt flaeche_mm2 das Ergebnis. Zeile zwölf teilt die Kraft durch die Fläche und speichert die Spannung. Die Fläche liegt in Quadratmillimetern vor, also kommt Newton pro Quadratmillimeter heraus, das sind Megapascal. Die Reihenfolge zählt: Die Fläche muss existieren, bevor du sie benutzt.

**bisher:** Jetzt wird gerechnet. Zeile elf berechnet die Fläche: pi mal d mal d durch vier. Denk an die Zuweisung von rechts nach links: Erst wird die rechte Seite ausgerechnet, dann bekommt flaeche Unterstrich m m zwei das Ergebnis. Zeile zwölf teilt die Kraft durch die Fläche und speichert die Spannung. Die Fläche liegt in Quadratmillimetern vor, also kommt Newton pro Quadratmillimeter heraus, das sind Megapascal. Die Reihenfolge zählt: Die Fläche muss existieren, bevor du sie benutzt.

- PRÜFEN: Code ohne Backticks: flaeche_mm2
- PRÜFEN: Rest-Ziffern/Symbole: flaeche_mm2

### v01-beispiel · Absatz 5

**Original:** Zum Schluss folgen fünf print-Zeilen. Die erste gibt die Überschrift aus. Die nächsten vier haben je zwei Argumente, einen Text und eine Variable. print setzt dazwischen ein Leerzeichen. So landen Prüfer, Bauteil, Fläche und Spannung im Protokoll.

**Sprechfassung:** Zum Schluss folgen fünf print-Zeilen. Die erste gibt die Überschrift aus. Die nächsten vier haben je zwei Argumente, einen Text und eine Variable. print setzt dazwischen ein Leerzeichen. So landen Prüfer, Bauteil, Fläche und Spannung im Protokoll.

**bisher:** Zum Schluss folgen fünf print-Zeilen. Die erste gibt die Überschrift aus. Die nächsten vier haben je zwei Argumente, einen Text und eine Variable. print setzt dazwischen ein Leerzeichen. So landen Prüfer, Bauteil, Fläche und Spannung im Protokoll.

### v01-beispiel · Absatz 6

**Original:** Jetzt der Probelauf. Als Prüfer gibst du Max Mustermann ein, als Bauteil Welle W siebzehn. Danach läuft der Rest ohne weitere Eingabe, Zeile für Zeile. Die Fläche beträgt 78,53975 Quadratmillimeter. Die Spannung ist 152,78887 und dann noch viele weitere Stellen, in Megapascal.

**Sprechfassung:** Jetzt der Probelauf. Als Prüfer gibst du Max Mustermann ein, als Bauteil Welle W siebzehn. Danach läuft der Rest ohne weitere Eingabe, Zeile für Zeile. Die Fläche beträgt ungefähr achtundsiebzig Komma fünf vier Quadratmillimeter. Die Spannung ist ungefähr hundertzweiundfünfzig Komma sieben neun und dann noch viele weitere Stellen, in Megapascal.

**bisher:** Jetzt der Probelauf. Als Prüfer gibst du Max Mustermann ein, als Bauteil Welle W siebzehn. Danach läuft der Rest ohne weitere Eingabe, Zeile für Zeile. Die Fläche beträgt achtundsiebzig Komma fünf drei neun sieben fünf Quadratmillimeter. Die Spannung ist einhundertzweiundfünfzig Komma sieben acht acht acht sieben und dann noch viele weitere Stellen, in Megapascal.

- PRÜFEN: gerundet: 78.53975
- PRÜFEN: gerundet: 152.78887

### v01-beispiel · Absatz 7

**Original:** Jetzt der wichtigste Schritt: Passt das Ergebnis? Im Kopf überschlägst du 12 000 durch rund 80, das sind etwa 150. Unser Ergebnis liegt bei etwa 153 Megapascal, die Größenordnung stimmt. Das passt zu Baustahl S235: Die Streckgrenze liegt bei 235 Megapascal, der Stab bleibt also darunter. Die vielen Nachkommastellen formatieren wir in Lektion drei. Ein Ergebnis wie 0,153 oder 150 000 Megapascal würde dir dagegen sofort auffallen.

**Sprechfassung:** Jetzt der wichtigste Schritt: Passt das Ergebnis? Im Kopf überschlägst du zwölftausend durch rund achtzig, das sind etwa hundertfünfzig. Unser Ergebnis liegt bei etwa hundertdreiundfünfzig Megapascal, die Größenordnung stimmt. Das passt zu Baustahl S235: Die Streckgrenze liegt bei zweihundertfünfunddreißig Megapascal, der Stab bleibt also darunter. Die vielen Nachkommastellen formatieren wir in Lektion drei. Ein Ergebnis wie null Komma eins fünf drei oder hundertfünfzigtausend Megapascal würde dir dagegen sofort auffallen.

**bisher:** Jetzt der wichtigste Schritt: Passt das Ergebnis? Im Kopf überschlägst du zwölftausend durch rund achtzig, das sind etwa hundertfünfzig. Unser Ergebnis liegt bei etwa hundertdreiundfünfzig Megapascal, die Größenordnung stimmt. Das passt zu Baustahl S zwei drei fünf: Die Streckgrenze liegt bei zweihundertfünfunddreißig Megapascal, der Stab bleibt also darunter. Die vielen Nachkommastellen formatieren wir in Lektion drei. Ein Ergebnis wie null Komma eins fünf drei oder hundertfünfzigtausend Megapascal würde dir dagegen sofort auffallen.

- PRÜFEN: Rest-Ziffern/Symbole: S235

## v01-python

Quelle: `video-src/v01-python/` – render.py, Liste SECS (Untertitel = Original; bisher gesprochen = audio/s1..s6.txt bzw. SECS, 2. Tupelelement)

### v01-python · Absatz 1

**Original:** Mit print gibst du etwas auf dem Bildschirm aus. Text steht in Anführungszeichen, Zahlen schreibst du ohne. Du kannst mehrere Argumente übergeben, getrennt durch Kommas. Python setzt zwischen die Teile automatisch ein Leerzeichen. Und jedes print beginnt in einer neuen Zeile.

**Sprechfassung:** Mit print gibst du etwas auf dem Bildschirm aus. Text steht in Anführungszeichen, Zahlen schreibst du ohne. Du kannst mehrere Argumente übergeben, getrennt durch Kommas. Python setzt zwischen die Teile automatisch ein Leerzeichen. Und jedes print beginnt in einer neuen Zeile.

**bisher:** Mit print gibst du etwas auf dem Bildschirm aus. Text steht in Anführungszeichen, Zahlen schreibst du ohne. Du kannst mehrere Argumente übergeben, getrennt durch Kommas. Python setzt zwischen die Teile automatisch ein Leerzeichen. Und jedes print beginnt in einer neuen Zeile.

### v01-python · Absatz 2

**Original:** Eine Variable ist ein Name für einen Wert. Mit dem Gleichheitszeichen gibst du einem Wert einen Namen. Das nennt man Zuweisung, und es ist keine Gleichung. Python liest sie von rechts nach links: Erst wird die rechte Seite berechnet, dann bekommt das Ergebnis den Namen auf der linken Seite. Danach kannst du den Namen überall verwenden, wo du den Wert brauchst.

**Sprechfassung:** Eine Variable ist ein Name für einen Wert. Mit dem Gleichheitszeichen gibst du einem Wert einen Namen. Das nennt man Zuweisung, und es ist keine Gleichung. Python liest sie von rechts nach links: Erst wird die rechte Seite berechnet, dann bekommt das Ergebnis den Namen auf der linken Seite. Danach kannst du den Namen überall verwenden, wo du den Wert brauchst.

**bisher:** Eine Variable ist ein Name für einen Wert. Mit dem Gleichheitszeichen gibst du einem Wert einen Namen. Das nennt man Zuweisung, und es ist keine Gleichung. Python liest sie von rechts nach links: Erst wird die rechte Seite berechnet, dann bekommt das Ergebnis den Namen auf der linken Seite. Danach kannst du den Namen überall verwenden, wo du den Wert brauchst.

### v01-python · Absatz 3

**Original:** Einer Variablen darfst du jederzeit einen neuen Wert zuweisen. Der alte Wert ist dann weg. Häufig siehst du zähler gleich zähler plus eins. Das ist keine Gleichung, sondern eine Anweisung: Nimm den aktuellen Wert, addiere eins und speichere das Ergebnis unter demselben Namen.

**Sprechfassung:** Einer Variablen darfst du jederzeit einen neuen Wert zuweisen. Der alte Wert ist dann weg. Häufig siehst du zähler gleich zähler plus eins. Das ist keine Gleichung, sondern eine Anweisung: Nimm den aktuellen Wert, addiere eins und speichere das Ergebnis unter demselben Namen.

**bisher:** Einer Variablen darfst du jederzeit einen neuen Wert zuweisen. Der alte Wert ist dann weg. Häufig siehst du zähler gleich zähler plus eins. Das ist keine Gleichung, sondern eine Anweisung: Nimm den aktuellen Wert, addiere eins und speichere das Ergebnis unter demselben Namen.

### v01-python · Absatz 4

**Original:** Kommentare beginnen mit einer Raute. Python ignoriert alles ab der Raute bis zum Zeilenende. Sie erklären dir und anderen, warum etwas im Code steht, zum Beispiel die Einheit. Mit input liest du eine Eingabe von der Tastatur. Der Text in den Klammern erscheint als Aufforderung, und die Antwort speichert Python in einer Variablen. Wichtig: input liefert immer Text, auch wenn du Ziffern tippst. Wie du daraus Zahlen machst, lernst du in Lektion drei.

**Sprechfassung:** Kommentare beginnen mit einer Raute. Python ignoriert alles ab der Raute bis zum Zeilenende. Sie erklären dir und anderen, warum etwas im Code steht, zum Beispiel die Einheit. Mit input liest du eine Eingabe von der Tastatur. Der Text in den Klammern erscheint als Aufforderung, und die Antwort speichert Python in einer Variablen. Wichtig: input liefert immer Text, auch wenn du Ziffern tippst. Wie du daraus Zahlen machst, lernst du in Lektion drei.

**bisher:** Kommentare beginnen mit einer Raute. Python ignoriert alles ab der Raute bis zum Zeilenende. Sie erklären dir und anderen, warum etwas im Code steht, zum Beispiel die Einheit. Mit input liest du eine Eingabe von der Tastatur. Der Text in den Klammern erscheint als Aufforderung, und die Antwort speichert Python in einer Variablen. Wichtig: input liefert immer Text, auch wenn du Ziffern tippst. Wie du daraus Zahlen machst, lernst du in Lektion drei.

### v01-python · Absatz 5

**Original:** Für Namen gelten feste Regeln. Erlaubt sind Buchstaben, Ziffern und der Unterstrich. Ein Name darf nicht mit einer Ziffer beginnen und keine Leerzeichen enthalten. Python unterscheidet Groß- und Kleinschreibung: kraft und Kraft sind zwei verschiedene Namen. Wähle sprechende Namen mit Einheit, zum Beispiel kraft_n statt nur k.

**Sprechfassung:** Für Namen gelten feste Regeln. Erlaubt sind Buchstaben, Ziffern und der Unterstrich. Ein Name darf nicht mit einer Ziffer beginnen und keine Leerzeichen enthalten. Python unterscheidet Groß- und Kleinschreibung: kraft und Kraft sind zwei verschiedene Namen. Wähle sprechende Namen mit Einheit, zum Beispiel kraft_n statt nur k.

**bisher:** Für Namen gelten feste Regeln. Erlaubt sind Buchstaben, Ziffern und der Unterstrich. Ein Name darf nicht mit einer Ziffer beginnen und keine Leerzeichen enthalten. Python unterscheidet Groß- und Kleinschreibung: kraft und Kraft sind zwei verschiedene Namen. Wähle sprechende Namen mit Einheit, zum Beispiel kraft Unterstrich n statt nur k.

- PRÜFEN: Code ohne Backticks: kraft_n
- PRÜFEN: Rest-Ziffern/Symbole: kraft_n

### v01-python · Absatz 6

**Original:** Zum Schluss: Fehlermeldungen sind keine Strafe, sondern Hinweise. Ein NameError heißt: Python kennt diesen Namen nicht, hier wegen eines Tippfehlers. Die Meldung schlägt sogar den richtigen Namen vor. Ein SyntaxError heißt: Die Zeile ist grammatisch falsch, hier fehlt ein Komma. Dann läuft das Programm gar nicht erst los. Lies immer die letzte Zeile der Meldung und die Zeilennummer darüber. Jetzt bist du dran: Tippe alle Beispiele selbst ab und probiere sie aus.

**Sprechfassung:** Zum Schluss: Fehlermeldungen sind keine Strafe, sondern Hinweise. Ein NameError heißt: Python kennt diesen Namen nicht, hier wegen eines Tippfehlers. Die Meldung schlägt sogar den richtigen Namen vor. Ein SyntaxError heißt: Die Zeile ist grammatisch falsch, hier fehlt ein Komma. Dann läuft das Programm gar nicht erst los. Lies immer die letzte Zeile der Meldung und die Zeilennummer darüber. Jetzt bist du dran: Tippe alle Beispiele selbst ab und probiere sie aus.

**bisher:** Zum Schluss: Fehlermeldungen sind keine Strafe, sondern Hinweise. Ein NameError heißt: Python kennt diesen Namen nicht, hier wegen eines Tippfehlers. Die Meldung schlägt sogar den richtigen Namen vor. Ein SyntaxError heißt: Die Zeile ist grammatisch falsch, hier fehlt ein Komma. Dann läuft das Programm gar nicht erst los. Lies immer die letzte Zeile der Meldung und die Zeilennummer darüber. Jetzt bist du dran: Tippe alle Beispiele selbst ab und probiere sie aus.

## v01-theorie

Quelle: `video-src/v01-theorie/` – render.py, Liste SECS (Untertitel = Original; bisher gesprochen = audio/s1..s6.txt bzw. SECS, 2. Tupelelement)

### v01-theorie · Absatz 1

**Original:** Eine KI soll die Zugspannung in einem Rundstab berechnen. Die Zugkraft beträgt 12 000 Newton, der Durchmesser 10 Millimeter. Die KI antwortet selbstsicher: 0,153 Megapascal. Das klingt plausibel, ist aber um den Faktor 1000 falsch. Richtig sind etwa 152,8 Megapascal. Die Fläche wurde von Quadratmillimetern falsch in Quadratmeter umgerechnet: durch 1000 statt durch eine Million. Wer das nicht merkt, dimensioniert danach ein Bauteil falsch.

**Sprechfassung:** Eine K I soll die Zugspannung in einem Rundstab berechnen. Die Zugkraft beträgt zwölftausend Newton, der Durchmesser zehn Millimeter. Die K I antwortet selbstsicher: null Komma eins fünf drei Megapascal. Das klingt plausibel, ist aber um den Faktor tausend falsch. Richtig sind etwa hundertzweiundfünfzig Komma acht Megapascal. Die Fläche wurde von Quadratmillimetern falsch in Quadratmeter umgerechnet: durch tausend statt durch eine Million. Wer das nicht merkt, dimensioniert danach ein Bauteil falsch.

**bisher:** Eine KI soll die Zugspannung in einem Rundstab berechnen. Die Zugkraft beträgt zwölftausend Newton, der Durchmesser zehn Millimeter. Die KI antwortet selbstsicher: null Komma eins fünf drei Megapascal. Das klingt plausibel, ist aber um den Faktor tausend falsch. Richtig sind etwa einhundertzweiundfünfzig Komma acht Megapascal. Die Fläche wurde von Quadratmillimetern falsch in Quadratmeter umgerechnet: durch tausend statt durch eine Million. Wer das nicht merkt, dimensioniert danach ein Bauteil falsch.

### v01-theorie · Absatz 2

**Original:** Warum also selbst programmieren lernen, wenn eine KI das kann? Dafür gibt es vier Gründe. Erstens: Du musst Code lesen können, um ihn zu prüfen. Wer ihn nicht versteht, kann nur glauben. Zweitens: Eine KI verstärkt deine Spezifikation. Ist die Aufgabe unklar, bekommst du schnell und überzeugend das Falsche. Drittens: Du musst überschlagen können. 12 000 durch rund 80 sind etwa 150, und schon fällt der Fehler auf. Viertens: Im Betrieb läuft oft gar keine KI. Steuerungen, Messgeräte und Skripte sind Code, den du verstehen und anpassen musst.

**Sprechfassung:** Warum also selbst programmieren lernen, wenn eine K I das kann? Dafür gibt es vier Gründe. Erstens: Du musst Code lesen können, um ihn zu prüfen. Wer ihn nicht versteht, kann nur glauben. Zweitens: Eine K I verstärkt deine Spezifikation. Ist die Aufgabe unklar, bekommst du schnell und überzeugend das Falsche. Drittens: Du musst überschlagen können. zwölftausend durch rund achtzig sind etwa hundertfünfzig, und schon fällt der Fehler auf. Viertens: Im Betrieb läuft oft gar keine K I. Steuerungen, Messgeräte und Skripte sind Code, den du verstehen und anpassen musst.

**bisher:** Warum also selbst programmieren lernen, wenn eine KI das kann? Dafür gibt es vier Gründe. Erstens: Du musst Code lesen können, um ihn zu prüfen. Wer ihn nicht versteht, kann nur glauben. Zweitens: Eine KI verstärkt deine Spezifikation. Ist die Aufgabe unklar, bekommst du schnell und überzeugend das Falsche. Drittens: Du musst überschlagen können. Zwölftausend durch rund achtzig sind etwa hundertfünfzig, und schon fällt der Fehler auf. Viertens: Im Betrieb läuft oft gar keine KI. Steuerungen, Messgeräte und Skripte sind Code, den du verstehen und anpassen musst.

### v01-theorie · Absatz 3

**Original:** Du musst aber nicht alles selbst können. Dafür gibt es die Wissens-Ampel. Im Kopf: Das brauchst du ohne Hilfe, sonst kannst du KI-Ergebnisse nicht beurteilen, zum Beispiel Größenordnungen und Einheiten. Lesen und erkennen: Du verstehst Code, musst ihn aber nicht zwingend selbst schreiben. Delegieren: Die KI übernimmt, du musst nur wissen, dass es das gibt. Bei jedem Thema im Kurs zeigt dir die Ampel, in welche Stufe es gehört.

**Sprechfassung:** Du musst aber nicht alles selbst können. Dafür gibt es die Wissens-Ampel. Im Kopf: Das brauchst du ohne Hilfe, sonst kannst du K I-Ergebnisse nicht beurteilen, zum Beispiel Größenordnungen und Einheiten. Lesen und erkennen: Du verstehst Code, musst ihn aber nicht zwingend selbst schreiben. Delegieren: Die K I übernimmt, du musst nur wissen, dass es das gibt. Bei jedem Thema im Kurs zeigt dir die Ampel, in welche Stufe es gehört.

**bisher:** Du musst aber nicht alles selbst können. Dafür gibt es die Wissens-Ampel. Im Kopf: Das brauchst du ohne Hilfe, sonst kannst du KI-Ergebnisse nicht beurteilen, zum Beispiel Größenordnungen und Einheiten. Lesen und erkennen: Du verstehst Code, musst ihn aber nicht zwingend selbst schreiben. Delegieren: Die KI übernimmt, du musst nur wissen, dass es das gibt. Bei jedem Thema im Kurs zeigt dir die Ampel, in welche Stufe es gehört.

### v01-theorie · Absatz 4

**Original:** Doch was ist eigentlich ein Programm? Ein Programm folgt fast immer demselben Muster: Eingabe, Verarbeitung, Ausgabe. Hier stehen in den ersten beiden Zeilen die Eingaben, in der dritten wird gerechnet, und die vierte gibt das Ergebnis aus. Der Interpreter arbeitet den Code Zeile für Zeile von oben nach unten ab. Und er ist deterministisch: gleiche Eingabe, gleiches Ergebnis, jedes Mal. Genau das macht ein Programm überprüfbar, anders als eine KI-Antwort, die bei jeder Anfrage anders ausfallen kann.

**Sprechfassung:** Doch was ist eigentlich ein Programm? Ein Programm folgt fast immer demselben Muster: Eingabe, Verarbeitung, Ausgabe. Hier stehen in den ersten beiden Zeilen die Eingaben, in der dritten wird gerechnet, und die vierte gibt das Ergebnis aus. Der Interpreter arbeitet den Code Zeile für Zeile von oben nach unten ab. Und er ist deterministisch: gleiche Eingabe, gleiches Ergebnis, jedes Mal. Genau das macht ein Programm überprüfbar, anders als eine K I-Antwort, die bei jeder Anfrage anders ausfallen kann.

**bisher:** Doch was ist eigentlich ein Programm? Ein Programm folgt fast immer demselben Muster: Eingabe, Verarbeitung, Ausgabe. Hier stehen in den ersten beiden Zeilen die Eingaben, in der dritten wird gerechnet, und die vierte gibt das Ergebnis aus. Der Interpreter arbeitet den Code Zeile für Zeile von oben nach unten ab. Und er ist deterministisch: gleiche Eingabe, gleiches Ergebnis, jedes Mal. Genau das macht ein Programm überprüfbar, anders als eine KI-Antwort, die bei jeder Anfrage anders ausfallen kann.

### v01-theorie · Absatz 5

**Original:** Merke dir: Die KI ist ein starkes Werkzeug, aber die Verantwortung für das Ergebnis bleibt bei dir. Dafür brauchst du Wissen im Kopf, Leseverständnis und ein Gefühl für Größenordnungen. Im nächsten Video schreibst du deine ersten Zeilen Python.

**Sprechfassung:** Merke dir: Die K I ist ein starkes Werkzeug, aber die Verantwortung für das Ergebnis bleibt bei dir. Dafür brauchst du Wissen im Kopf, Leseverständnis und ein Gefühl für Größenordnungen. Im nächsten Video schreibst du deine ersten Zeilen Python.

**bisher:** Merke dir: Die KI ist ein starkes Werkzeug, aber die Verantwortung für das Ergebnis bleibt bei dir. Dafür brauchst du Wissen im Kopf, Leseverständnis und ein Gefühl für Größenordnungen. Im nächsten Video schreibst du deine ersten Zeilen Python.

## v02-beispiel

Quelle: `video-src/v02-beispiel/` – render.py, Liste SECS (Untertitel = Original; bisher gesprochen = audio/s1..s6.txt bzw. SECS, 2. Tupelelement)

### v02-beispiel · Absatz 1

**Original:** Ein Inkrementalgeber liefert 1024 Impulse pro Umdrehung. Der Zähler steht auf 5000. Wie viele ganze Umdrehungen sind das, und in welchem Winkel steht die Welle jetzt? 5000 durch 1024 ist knapp 5, also vier ganze Umdrehungen und ein Rest. Genau diese Aufteilung in Ganzteil und Rest übernimmt Python für uns. Wir gehen den Code Abschnitt für Abschnitt durch.

**Sprechfassung:** Ein Inkrementalgeber liefert tausendvierundzwanzig Impulse pro Umdrehung. Der Zähler steht auf fünftausend. Wie viele ganze Umdrehungen sind das, und in welchem Winkel steht die Welle jetzt? fünftausend durch tausendvierundzwanzig ist knapp fünf, also vier ganze Umdrehungen und ein Rest. Genau diese Aufteilung in Ganzteil und Rest übernimmt Python für uns. Wir gehen den Code Abschnitt für Abschnitt durch.

**bisher:** Ein Inkrementalgeber liefert eintausendvierundzwanzig Impulse pro Umdrehung. Der Zähler steht auf fünftausend. Wie viele ganze Umdrehungen sind das, und in welchem Winkel steht die Welle jetzt? Fünftausend durch eintausendvierundzwanzig ist knapp fünf, also vier ganze Umdrehungen und ein Rest. Genau diese Aufteilung in Ganzteil und Rest übernimmt Python für uns. Wir gehen den Code Abschnitt für Abschnitt durch.

### v02-beispiel · Absatz 2

**Original:** Zuerst die Eingangsdaten: 1024 Impulse pro Umdrehung und ein Zählerstand von 5000. Die Variablennamen sagen, was drinsteht, so brauchst du kaum Kommentare. Zeile 7: Der doppelte Schrägstrich liefert die ganzen Umdrehungen: 5000 // 1024 ist 4. Zeile 8: Das Prozentzeichen liefert den Rest: 5000 % 1024 ist 904.

**Sprechfassung:** Zuerst die Eingangsdaten: tausendvierundzwanzig Impulse pro Umdrehung und ein Zählerstand von fünftausend. Die Variablennamen sagen, was drinsteht, so brauchst du kaum Kommentare. Zeile sieben: Der doppelte Schrägstrich liefert die ganzen Umdrehungen: fünftausend Doppel-Slash tausendvierundzwanzig ist vier. Zeile acht: Das Prozentzeichen liefert den Rest: fünftausend modulo tausendvierundzwanzig ist neunhundertvier.

**bisher:** Zuerst die Eingangsdaten: eintausendvierundzwanzig Impulse pro Umdrehung und ein Zählerstand von fünftausend. Die Variablennamen sagen, was drinsteht, so brauchst du kaum Kommentare. Zeile sieben: Der doppelte Schrägstrich liefert die ganzen Umdrehungen: Fünftausend, doppelter Schrägstrich, eintausendvierundzwanzig, ist vier. Zeile acht: Das Prozentzeichen liefert den Rest: Fünftausend Prozent eintausendvierundzwanzig ist neunhundertvier.

### v02-beispiel · Absatz 3

**Original:** Zeile 9 rechnet den Winkel der angefangenen Umdrehung: 904 · 360 / 1024. Mal und Schrägstrich sind gleichrangig und werden von links nach rechts gerechnet. Der einfache Schrägstrich liefert immer einen float: 317.8125 Grad. Das ist knapp vor einer vollen Umdrehung.

**Sprechfassung:** Zeile neun rechnet den Winkel der angefangenen Umdrehung: neunhundertvier mal dreihundertsechzig durch tausendvierundzwanzig. Mal und Schrägstrich sind gleichrangig und werden von links nach rechts gerechnet. Der einfache Schrägstrich liefert immer einen float: dreihundertsiebzehn Komma acht eins zwei fünf Grad. Das ist knapp vor einer vollen Umdrehung.

**bisher:** Zeile neun rechnet den Winkel der angefangenen Umdrehung: neunhundertvier mal dreihundertsechzig durch eintausendvierundzwanzig. Mal und Schrägstrich sind gleichrangig und werden von links nach rechts gerechnet. Der einfache Schrägstrich liefert immer einen float: dreihundertsiebzehn Komma acht eins zwei fünf Grad. Das ist knapp vor einer vollen Umdrehung.

### v02-beispiel · Absatz 4

**Original:** Die Zeilen 11 bis 15 geben die Ergebnisse aus. Probelauf: Ganze Umdrehungen 4, Rest-Impulse 904, Winkel 317.8125 Grad. bin liefert die Binärdarstellung, hex die Hexdarstellung des Zählerstands. Zur Probe: 0x1388 ist 1 · 4096 + 3 · 256 + 8 · 16 + 8, das sind wieder 5000.

**Sprechfassung:** Die Zeilen elf bis fünfzehn geben die Ergebnisse aus. Probelauf: Ganze Umdrehungen vier, Rest-Impulse neunhundertvier, Winkel dreihundertsiebzehn Komma acht eins zwei fünf Grad. bin liefert die Binärdarstellung, hex die Hexdarstellung des Zählerstands. Zur Probe: null x eins drei acht acht ist eins mal viertausendsechsundneunzig plus drei mal zweihundertsechsundfünfzig plus acht mal sechzehn plus acht, das sind wieder fünftausend.

**bisher:** Die Zeilen elf bis fünfzehn geben die Ergebnisse aus. Probelauf: Ganze Umdrehungen vier, Rest-Impulse neunhundertvier, Winkel dreihundertsiebzehn Komma acht eins zwei fünf Grad. bin liefert die Binärdarstellung, hex die Hexdarstellung des Zählerstands. Zur Probe: Hex eins drei acht acht ist eins mal viertausendsechsundneunzig plus drei mal zweihundertsechsundfünfzig plus acht mal sechzehn plus acht, das sind wieder fünftausend.

### v02-beispiel · Absatz 5

**Original:** Die letzten Zeilen zeigen den Überlauf: Ein 16-Bit-Zähler kennt nur 0 bis 2 hoch 16 minus 1, also 65535. Ein Impuls weiter wäre 65536, und der Rest modulo 2 hoch 16 ist dann 0. Genau so läuft ein echter Zähler über. Bei 1024 Impulsen pro Umdrehung passiert das schon nach 64 Umdrehungen.

**Sprechfassung:** Die letzten Zeilen zeigen den Überlauf: Ein sechzehn-Bit-Zähler kennt nur null bis zwei hoch sechzehn minus eins, also fünfundsechzigtausendfünfhundertfünfunddreißig. Ein Impuls weiter wäre fünfundsechzigtausendfünfhundertsechsunddreißig, und der Rest modulo zwei hoch sechzehn ist dann null. Genau so läuft ein echter Zähler über. Bei tausendvierundzwanzig Impulsen pro Umdrehung passiert das schon nach vierundsechzig Umdrehungen.

**bisher:** Die letzten Zeilen zeigen den Überlauf: Ein Sechzehn-Bit-Zähler kennt nur null bis zwei hoch sechzehn minus eins, also fünfundsechzigtausend fünfhundertfünfunddreißig. Ein Impuls weiter wäre fünfundsechzigtausend fünfhundertsechsunddreißig, und der Rest modulo zwei hoch sechzehn ist dann null. Genau so läuft ein echter Zähler über. Bei eintausendvierundzwanzig Impulsen pro Umdrehung passiert das schon nach vierundsechzig Umdrehungen.

### v02-beispiel · Absatz 6

**Original:** Warum gehören // und % zusammen? Weil sie die Zahl vollständig zerlegen: 4 · 1024 + 904 ergibt wieder 5000. Für eine echte Achse bedeutet der Überlauf: Die Steuerung verliert die Position, obwohl die Achse weiterläuft. Du musst Überläufe mitzählen oder einen größeren Zähler wählen. Ändere den Zählerstand und sage vorher, was herauskommt.

**Sprechfassung:** Warum gehören Doppel-Slash und % zusammen? Weil sie die Zahl vollständig zerlegen: vier mal tausendvierundzwanzig plus neunhundertvier ergibt wieder fünftausend. Für eine echte Achse bedeutet der Überlauf: Die Steuerung verliert die Position, obwohl die Achse weiterläuft. Du musst Überläufe mitzählen oder einen größeren Zähler wählen. Ändere den Zählerstand und sage vorher, was herauskommt.

**bisher:** Warum gehören doppelter Schrägstrich und Prozentzeichen zusammen? Weil sie die Zahl vollständig zerlegen: Vier mal eintausendvierundzwanzig plus neunhundertvier ergibt wieder fünftausend. Für eine echte Achse bedeutet der Überlauf: Die Steuerung verliert die Position, obwohl die Achse weiterläuft. Du musst Überläufe mitzählen oder einen größeren Zähler wählen. Ändere den Zählerstand und sage vorher, was herauskommt.

## v02-python

Quelle: `video-src/v02-python/` – render.py, Liste SECS (Untertitel = Original; bisher gesprochen = audio/s1..s6.txt bzw. SECS, 2. Tupelelement)

### v02-python · Absatz 1

**Original:** In Python rechnest du mit int, also mit ganzen Zahlen. Plus, Minus und Mal funktionieren wie gewohnt, nur dass Mal als Sternchen geschrieben wird. 7 + 3 ist 10, 7 − 3 ist 4, 7 · 3 ist 21. Das Ergebnis bleibt dabei ein int.

**Sprechfassung:** In Python rechnest du mit int, also mit ganzen Zahlen. Plus, Minus und Mal funktionieren wie gewohnt, nur dass Mal als Sternchen geschrieben wird. sieben plus drei ist zehn, sieben minus drei ist vier, sieben mal drei ist einundzwanzig. Das Ergebnis bleibt dabei ein int.

**bisher:** In Python rechnest du mit int, also mit ganzen Zahlen. Plus, Minus und Mal funktionieren wie gewohnt, nur dass Mal als Sternchen geschrieben wird. Sieben plus drei ist zehn, sieben minus drei ist vier, sieben mal drei ist einundzwanzig. Das Ergebnis bleibt dabei ein int.

### v02-python · Absatz 2

**Original:** Der einfache Schrägstrich dividiert und liefert immer einen float, auch wenn die Division aufgeht. 7 / 2 ergibt 3.5, 6 / 3 ergibt 2.0. Zwei Sterne potenzieren: 2 ** 10 ist 1024. Brauchst du eine ganze Zahl als Ergebnis, nimmst du den doppelten Schrägstrich.

**Sprechfassung:** Der einfache Schrägstrich dividiert und liefert immer einen float, auch wenn die Division aufgeht. sieben durch zwei ergibt drei Komma fünf, sechs durch drei ergibt zwei Komma null. Zwei Sterne potenzieren: zwei hoch zehn ist tausendvierundzwanzig. Brauchst du eine ganze Zahl als Ergebnis, nimmst du den doppelten Schrägstrich.

**bisher:** Der einfache Schrägstrich dividiert und liefert immer einen float, auch wenn die Division aufgeht. Sieben durch zwei ergibt drei Komma fünf, sechs durch drei ergibt zwei Komma null. Zwei Sterne potenzieren: Zwei hoch zehn ist eintausendvierundzwanzig. Brauchst du eine ganze Zahl als Ergebnis, nimmst du den doppelten Schrägstrich.

### v02-python · Absatz 3

**Original:** Jetzt das wichtigste Paar: // liefert den Ganzteil der Division, % den Rest. 17 // 5 ergibt 3, 17 % 5 ergibt 2. Die beiden gehören zusammen: 3 · 5 + 2 ergibt wieder 17. Praktisch: Aus 4000 Sekunden werden 66 Minuten und 40 Sekunden. Dasselbe Muster gilt für Zähler, Stückzahlen und Zeiten: erst der Ganzteil, dann der Rest.

**Sprechfassung:** Jetzt das wichtigste Paar: Doppel-Slash liefert den Ganzteil der Division, % den Rest. siebzehn Doppel-Slash fünf ergibt drei, siebzehn modulo fünf ergibt zwei. Die beiden gehören zusammen: drei mal fünf plus zwei ergibt wieder siebzehn. Praktisch: Aus viertausend Sekunden werden sechsundsechzig Minuten und vierzig Sekunden. Dasselbe Muster gilt für Zähler, Stückzahlen und Zeiten: erst der Ganzteil, dann der Rest.

**bisher:** Jetzt das wichtigste Paar: Der doppelte Schrägstrich liefert den Ganzteil der Division, das Prozentzeichen den Rest. Siebzehn durch fünf ergibt drei, Rest zwei. Die beiden gehören zusammen: Drei mal fünf plus zwei ergibt wieder siebzehn. Praktisch: Aus viertausend Sekunden werden sechsundsechzig Minuten und vierzig Sekunden. Dasselbe Muster gilt für Zähler, Stückzahlen und Zeiten: erst der Ganzteil, dann der Rest.

### v02-python · Absatz 4

**Original:** Python beachtet die Rangfolge wie in der Mathematik: Potenz vor Punkt vor Strich. 2 + 3 * 4 ergibt 14, weil zuerst multipliziert wird. Mit Klammern erzwingst du die Reihenfolge: (2 + 3) * 4 ergibt 20. Und 2 * 3 ** 2 ist 18, denn die Potenz kommt zuerst. Im Zweifel setze Klammern, das liest sich auch besser.

**Sprechfassung:** Python beachtet die Rangfolge wie in der Mathematik: Potenz vor Punkt vor Strich. zwei plus drei mal vier ergibt vierzehn, weil zuerst multipliziert wird. Mit Klammern erzwingst du die Reihenfolge: (zwei plus drei) mal vier ergibt zwanzig. Und zwei mal drei hoch zwei ist achtzehn, denn die Potenz kommt zuerst. Im Zweifel setze Klammern, das liest sich auch besser.

**bisher:** Python beachtet die Rangfolge wie in der Mathematik: Potenz vor Punkt vor Strich. Zwei plus drei mal vier ergibt vierzehn, weil zuerst multipliziert wird. Mit Klammern erzwingst du die Reihenfolge: Klammer auf zwei plus drei Klammer zu mal vier ergibt zwanzig. Und zwei mal drei hoch zwei ist achtzehn, denn die Potenz kommt zuerst. Im Zweifel setze Klammern, das liest sich auch besser.

### v02-python · Absatz 5

**Original:** Zwischen den Zahlensystemen wandelst du mit drei Funktionen um. bin() liefert die Binärschreibweise als Text, mit dem Präfix 0b. hex() liefert die Hexschreibweise mit dem Präfix 0x, in Kleinbuchstaben. Zurück geht es mit int() und der Basis als zweitem Argument: Aus "1010" zur Basis 2 wird 10, aus "ff" zur Basis 16 wird 255. Die Präfixe sind nur Beschriftung: Der Wert der Zahl bleibt derselbe.

**Sprechfassung:** Zwischen den Zahlensystemen wandelst du mit drei Funktionen um. bin() liefert die Binärschreibweise als Text, mit dem Präfix null b. hex() liefert die Hexschreibweise mit dem Präfix null x, in Kleinbuchstaben. Zurück geht es mit int() und der Basis als zweitem Argument: Aus "tausendzehn" zur Basis zwei wird zehn, aus "ff" zur Basis sechzehn wird zweihundertfünfundfünfzig. Die Präfixe sind nur Beschriftung: Der Wert der Zahl bleibt derselbe.

**bisher:** Zwischen den Zahlensystemen wandelst du mit drei Funktionen um. bin liefert die Binärschreibweise als Text, mit dem Präfix null b. hex liefert die Hexschreibweise mit dem Präfix null x, in Kleinbuchstaben. Zurück geht es mit int und der Basis als zweitem Argument: Aus dem Text eins null eins null zur Basis zwei wird zehn, aus dem Text f f zur Basis sechzehn wird zweihundertfünfundfünfzig. Die Präfixe sind nur Beschriftung: Der Wert der Zahl bleibt derselbe.

- PRÜFEN: Code ohne Backticks: bin()
- PRÜFEN: Code ohne Backticks: hex()
- PRÜFEN: Code ohne Backticks: int()

### v02-python · Absatz 6

**Original:** Anders als in der SPS ist ein Python-int beliebig groß, er wächst einfach mit. 2 ** 100 hat 31 Stellen und läuft nie über. Einen Überlauf simulierst du selbst: Der Rest modulo 2 ** 16 lässt den Wert wieder bei 0 beginnen. Und teilst du durch null, meldet Python einen ZeroDivisionError und bricht ab. Lies die Meldung, sie sagt dir genau, was los ist. Probier alles selbst aus!

**Sprechfassung:** Anders als in der S P S ist ein Python-int beliebig groß, er wächst einfach mit. zwei hoch hundert hat einunddreißig Stellen und läuft nie über. Einen Überlauf simulierst du selbst: Der Rest modulo zwei hoch sechzehn lässt den Wert wieder bei null beginnen. Und teilst du durch null, meldet Python einen ZeroDivisionError und bricht ab. Lies die Meldung, sie sagt dir genau, was los ist. Probier alles selbst aus!

**bisher:** Anders als in der SPS ist ein Python-int beliebig groß, er wächst einfach mit. Zwei hoch hundert hat einunddreißig Stellen und läuft nie über, ganz anders als ein Zähler mit sechzehn Bit. Einen Überlauf simulierst du selbst: Der Rest modulo zwei hoch sechzehn lässt den Wert wieder bei null beginnen. Und teilst du durch null, meldet Python einen ZeroDivisionError und bricht ab. Lies die Meldung, sie sagt dir genau, was los ist. Probier alles selbst aus!

## v02-theorie

Quelle: `video-src/v02-theorie/` – render.py, Liste SECS (Untertitel = Original; bisher gesprochen = audio/s1..s6.txt bzw. SECS, 2. Tupelelement)

### v02-theorie · Absatz 1

**Original:** Ein Drehgeber zählt Impulse, und sein Zähler hat 16 Bit. Bei 65535 ist Schluss: Der nächste Impuls setzt ihn auf 0 zurück. Liest die Steuerung denselben Zähler mit Vorzeichen, springt er von 32767 auf −32768. Die Achse bewegt sich nur einen Impuls, doch die Zahl springt über die ganze Skala. Schauen wir, wie ein Rechner wirklich zählt.

**Sprechfassung:** Ein Drehgeber zählt Impulse, und sein Zähler hat sechzehn Bit. Bei fünfundsechzigtausendfünfhundertfünfunddreißig ist Schluss: Der nächste Impuls setzt ihn auf null zurück. Liest die Steuerung denselben Zähler mit Vorzeichen, springt er von zweiunddreißigtausendsiebenhundertsiebenundsechzig auf minus zweiunddreißigtausendsiebenhundertachtundsechzig. Die Achse bewegt sich nur einen Impuls, doch die Zahl springt über die ganze Skala. Schauen wir, wie ein Rechner wirklich zählt.

**bisher:** Ein Drehgeber zählt Impulse, und sein Zähler hat sechzehn Bit. Bei fünfundsechzigtausend fünfhundertfünfunddreißig ist Schluss: Der nächste Impuls setzt ihn auf null. Liest die Steuerung denselben Zähler mit Vorzeichen, springt er von der größten positiven zur kleinsten negativen Zahl. Die Achse bewegt sich nur einen Impuls, doch die Zahl springt über die ganze Skala. Schauen wir, wie ein Rechner wirklich zählt.

### v02-theorie · Absatz 2

**Original:** Im Dezimalsystem ist jede Stelle eine Zehnerpotenz. 45 ist 4 · 10 plus 5 · 1. Ein Rechner kennt nur zwei Zustände, also zählt er binär: Jede Stelle ist eine Zweierpotenz. 45 ist dann 32 + 8 + 4 + 1, also 101101. Im Hexadezimalsystem steht jede Stelle für eine Sechzehnerpotenz, mit den Ziffern 0 bis 9 und A bis F. 45 ist 2 · 16 + 13, und 13 schreibt man D: also 2D.

**Sprechfassung:** Im Dezimalsystem ist jede Stelle eine Zehnerpotenz. fünfundvierzig ist vier mal zehn plus fünf mal eins. Ein Rechner kennt nur zwei Zustände, also zählt er binär: Jede Stelle ist eine Zweierpotenz. fünfundvierzig ist dann zweiunddreißig plus acht plus vier plus eins, also hunderteinstausendeinhunderteins. Im Hexadezimalsystem steht jede Stelle für eine Sechzehnerpotenz, mit den Ziffern null bis neun und A bis F. fünfundvierzig ist zwei mal sechzehn plus dreizehn, und dreizehn schreibt man D: also zwei D.

**bisher:** Im Dezimalsystem ist jede Stelle eine Zehnerpotenz. Die Zahl fünfundvierzig ist vier mal zehn plus fünf mal eins. Ein Rechner kennt nur zwei Zustände, also zählt er binär: Jede Stelle ist eine Zweierpotenz. Fünfundvierzig ist dann zweiunddreißig plus acht plus vier plus eins. Im Hexadezimalsystem steht jede Stelle für eine Sechzehnerpotenz, mit den Ziffern null bis neun und A bis F. Fünfundvierzig ist zwei mal sechzehn plus dreizehn, und dreizehn schreibt man D, also zwei D.

### v02-theorie · Absatz 3

**Original:** Dezimal in binär wandelst du mit dem Divisionsrestverfahren um. Du teilst immer wieder durch 2 und merkst dir den Rest. 45 durch 2 ist 22 Rest 1, und so weiter, bis du bei 0 ankommst. Die Reste liest du von unten nach oben: 101101. Zurück rechnest du, indem du die Stellenwerte der Einsen addierst.

**Sprechfassung:** Dezimal in binär wandelst du mit dem Divisionsrestverfahren um. Du teilst immer wieder durch zwei und merkst dir den Rest. fünfundvierzig durch zwei ist zweiundzwanzig Rest eins, und so weiter, bis du bei null ankommst. Die Reste liest du von unten nach oben: hunderteinstausendeinhunderteins. Zurück rechnest du, indem du die Stellenwerte der Einsen addierst.

**bisher:** Dezimal in binär wandelst du mit dem Divisionsrestverfahren um. Du teilst immer wieder durch zwei und merkst dir den Rest. Fünfundvierzig durch zwei ist zweiundzwanzig Rest eins, und so geht es weiter, bis du bei null ankommst. Die Reste liest du von unten nach oben: eins null eins eins null eins. Zurück rechnest du, indem du die Stellenwerte der Einsen addierst.

### v02-theorie · Absatz 4

**Original:** Ein Bit ist eine Binärstelle, 0 oder 1. Acht Bit sind ein Byte. Mit n Bit gibt es 2ⁿ Werte, ohne Vorzeichen von 0 bis 2ⁿ − 1. Bei 8 Bit sind das 0 bis 255, bei 16 Bit 0 bis 65535. Mit Vorzeichen halbiert sich der positive Bereich: Bei 16 Bit liegt er zwischen −32768 und +32767. Wird der Bereich verlassen, läuft die Zahl über und beginnt von vorn.

**Sprechfassung:** Ein Bit ist eine Binärstelle, null oder eins. Acht Bit sind ein Byte. Mit n Bit gibt es zwei hoch n Werte, ohne Vorzeichen von null bis zwei hoch n minus eins. Bei acht Bit sind das null bis zweihundertfünfundfünfzig, bei sechzehn Bit null bis fünfundsechzigtausendfünfhundertfünfunddreißig. Mit Vorzeichen halbiert sich der positive Bereich: Bei sechzehn Bit liegt er zwischen minus zweiunddreißigtausendsiebenhundertachtundsechzig und plus zweiunddreißigtausendsiebenhundertsiebenundsechzig. Wird der Bereich verlassen, läuft die Zahl über und beginnt von vorn.

**bisher:** Ein Bit ist eine Binärstelle, null oder eins. Acht Bit sind ein Byte. Mit n Bit gibt es zwei hoch n verschiedene Werte, ohne Vorzeichen von null bis zwei hoch n minus eins. Bei acht Bit sind das null bis zweihundertfünfundfünfzig, bei sechzehn Bit null bis fünfundsechzigtausend. Mit Vorzeichen halbiert sich der positive Bereich: Bei sechzehn Bit liegt er zwischen minus und plus rund zweiunddreißigtausend. Wird der Bereich verlassen, läuft die Zahl über und beginnt von vorn.

### v02-theorie · Absatz 5

**Original:** Negative Zahlen speichert der Rechner im Zweierkomplement. Du schreibst den Betrag binär auf, invertierst alle Bits und addierst 1. Beispiel −5 in 8 Bit: 00000101 invertiert, plus 1, ergibt 11111011. Ohne Vorzeichen gelesen wäre dasselbe Muster die 251. Am Zahlenkreis siehst du den Überlauf: Nach der größten positiven kommt die kleinste negative Zahl.

**Sprechfassung:** Negative Zahlen speichert der Rechner im Zweierkomplement. Du schreibst den Betrag binär auf, invertierst alle Bits und addierst eins. Beispiel minus fünf in acht Bit: null null null null null eins null eins invertiert, plus eins, ergibt elf Millionen einhundertelftausendelf. Ohne Vorzeichen gelesen wäre dasselbe Muster die zweihunderteinundfünfzig. Am Zahlenkreis siehst du den Überlauf: Nach der größten positiven kommt die kleinste negative Zahl.

**bisher:** Negative Zahlen speichert der Rechner im Zweierkomplement. Du schreibst den Betrag binär auf, invertierst alle Bits und addierst eins. Beispiel minus fünf in acht Bit: Du invertierst die Bits der Fünf und addierst eins. Heraus kommt eins eins eins eins eins null eins eins. Ohne Vorzeichen gelesen wäre dasselbe Muster die zweihunderteinundfünfzig. Am Zahlenkreis siehst du den Überlauf: Nach der größten positiven Zahl kommt die kleinste negative.

### v02-theorie · Absatz 6

**Original:** Lange Bitketten sind unlesbar. Hex ist die Kurzschrift: Vier Bit ergeben genau eine Hexziffer. Jede Vierergruppe wird eine Ziffer: Das Register wird zu F, A, 3, 1, also 0xFA31. In SPS-Registern und bei Fehlercodes begegnet dir Hex ständig. Das Präfix 0x kennzeichnet Hex, 0b kennzeichnet binär. Merke: Ein Zähler hat endlich viele Bits. Prüfe immer, ob dein Wertebereich reicht.

**Sprechfassung:** Lange Bitketten sind unlesbar. Hex ist die Kurzschrift: Vier Bit ergeben genau eine Hexziffer. Jede Vierergruppe wird eine Ziffer: Das Register wird zu F, A, drei, eins, also null x F A drei eins. In S P S-Registern und bei Fehlercodes begegnet dir Hex ständig. Das Präfix null x kennzeichnet Hex, null b kennzeichnet binär. Merke: Ein Zähler hat endlich viele Bits. Prüfe immer, ob dein Wertebereich reicht.

**bisher:** Lange Bitketten sind unlesbar. Hex ist die Kurzschrift: Vier Bit ergeben genau eine Hexziffer. Jede Vierergruppe wird zu einer Ziffer: Das Register wird zu F, A, drei, eins, also null x F A drei eins. In SPS-Registern und bei Fehlercodes begegnet dir Hex ständig. Das Präfix null x kennzeichnet Hex, null b kennzeichnet binär. Merke: Ein Zähler hat endlich viele Bits. Prüfe immer, ob dein Wertebereich reicht.

## v03

Quelle: `video-src/v03/` – out/v03.vtt (Untertitel je Abschnitt laut out/timeline.json) + sprechertext.md (bisheriger Sprechtext)

### v03 · Absatz 1

**Original:** Stell dir vor, du addierst in einer Toleranzkette 0,1 mm und 0,2 mm. Python antwortet: 0,30000000000000004. Ist das Ergebnis gleich 0,3? Python sagt: Falsch. Noch ein Beispiel: Eine SPS mit dem Datentyp REAL (32 Bit) kann die Zahl 16 777 217 gar nicht darstellen. Was ist da los?

**Sprechfassung:** Stell dir vor, du addierst in einer Toleranzkette null Komma eins Millimeter und null Komma zwei Millimeter. Python antwortet: null Komma drei, dann fünfzehn Nullen und eine Vier. Ist das Ergebnis gleich null Komma drei? Python sagt: Falsch. Noch ein Beispiel: Eine S P S mit dem Datentyp REAL (zweiunddreißig Bit) kann die Zahl sechzehn Millionen siebenhundertsiebenundsiebzigtausendzweihundertsiebzehn gar nicht darstellen. Was ist da los?

**bisher:** Stell dir vor, du addierst in einer Toleranzkette null Komma eins Millimeter und null Komma zwei Millimeter. Python antwortet: null Komma drei, dann viele Nullen, und ganz hinten eine Vier. Und die Frage, ob das Ergebnis gleich null Komma drei ist? Python sagt: Falsch. Noch ein Beispiel: Eine SPS mit dem Datentyp REAL, also zweiunddreißig Bit, kann die Zahl sechzehn Millionen siebenhundertsiebenundsiebzigtausend zweihundertsiebzehn gar nicht darstellen. Was ist da los?

- PRÜFEN: „1“ vor Nomen: Genus prüfen (eins/ein/eine)

### v03 · Absatz 2

**Original:** Computer speichern Zahlen binär, also mit Nullen und Einsen. Im Dezimalsystem kannst du 1/3 nicht exakt aufschreiben: 0,333…, ewig weiter. Genauso ist 0,1 im Binärsystem periodisch: 0,0001100110011…, und so weiter. Der Speicher hat aber nur endlich viele Stellen, also wird abgeschnitten. Schon die einzelne Zahl 0,1 ist im Rechner minimal falsch.

**Sprechfassung:** Computer speichern Zahlen binär, also mit Nullen und Einsen. Im Dezimalsystem kannst du eins durch drei nicht exakt aufschreiben: null Komma drei drei drei, ewig weiter. Genauso ist null Komma eins im Binärsystem periodisch: ungefähr null Komma null null null eins eins, und so weiter. Der Speicher hat aber nur endlich viele Stellen, also wird abgeschnitten. Schon die einzelne Zahl null Komma eins ist im Rechner minimal falsch.

**bisher:** Computer speichern Zahlen binär, also mit Nullen und Einsen. Im Dezimalsystem kannst du ein Drittel nicht exakt aufschreiben: null Komma drei drei drei, ewig weiter. Genauso ist null Komma eins im Binärsystem periodisch: null Komma null null null eins eins, null null eins eins, und so weiter. Der Speicher hat aber nur endlich viele Stellen, also wird abgeschnitten. Schon die einzelne Zahl null Komma eins ist im Rechner minimal falsch.

- PRÜFEN: gerundet: 0.00011001…

### v03 · Absatz 3

**Original:** Gespeichert wird nach dem Standard IEEE 754. Das ist die wissenschaftliche Schreibweise, nur binär: Vorzeichen, Exponent und Mantisse. Beim float64, dem normalen Python-Float, sind das 1, 11 und 52 Bit. Beim float32, dem REAL der SPS: 1, 8 und 23 Bit. Weil die Mantisse begrenzt ist, liegen die darstellbaren Zahlen nicht gleichmäßig: Nahe null sind sie dicht, bei großen Zahlen wachsen die Lücken. Bei float32 liegen ab 16 Millionen schon zwei Einheiten zwischen zwei Nachbarn. Deshalb fehlt die 17.

**Sprechfassung:** Gespeichert wird nach dem Standard I triple E sieben fünf vier. Das ist die wissenschaftliche Schreibweise, nur binär: Vorzeichen, Exponent und Mantisse. Beim float vierundsechzig, dem normalen Python-Float, sind das eins, elf und zweiundfünfzig Bit. Beim float zweiunddreißig, dem REAL der S P S: eins, acht und dreiundzwanzig Bit. Weil die Mantisse begrenzt ist, liegen die darstellbaren Zahlen nicht gleichmäßig: Nahe null sind sie dicht, bei großen Zahlen wachsen die Lücken. Bei float zweiunddreißig liegen ab sechzehn Millionen schon zwei Einheiten zwischen zwei Nachbarn. Deshalb fehlt die siebzehn.

**bisher:** Gespeichert wird nach dem Standard I triple E sieben fünf vier. Das ist die wissenschaftliche Schreibweise, nur binär: ein Vorzeichen, ein Exponent und eine Mantisse. Beim float vierundsechzig, dem normalen Python-Float, sind das ein, elf und zweiundfünfzig Bit. Beim float zweiunddreißig, dem REAL der SPS, ein, acht und dreiundzwanzig Bit. Weil die Mantisse begrenzt ist, liegen die darstellbaren Zahlen nicht gleichmäßig: Nahe null sind sie dicht, bei großen Zahlen wachsen die Lücken. Bei float zweiunddreißig liegen ab sechzehn Millionen schon zwei Einheiten zwischen zwei Nachbarn. Deshalb fehlt die siebzehn.

### v03 · Absatz 4

**Original:** Was heißt das für dich als Ingenieur? Erstens: Vergleiche Floats nie mit dem doppelten Gleichheitszeichen. Nimm math.isclose, oder prüfe, ob der Betrag der Differenz kleiner ist als deine Toleranz. Zweitens: Fehler summieren sich. Addierst du zehnmal 0,1, kommst du nicht genau auf 1. Und drittens: In Steuerungen mit float32 sind die Lücken noch viel größer, etwa bei Zählern oder Zeitstempeln.

**Sprechfassung:** Was heißt das für dich als Ingenieur? Erstens: Vergleiche Floats nie mit dem doppelten Gleichheitszeichen. Nimm math.isclose, oder prüfe, ob der Betrag der Differenz kleiner ist als deine Toleranz. Zweitens: Fehler summieren sich. Addierst du zehnmal null Komma eins, kommst du nicht genau auf eins. Und drittens: In Steuerungen mit float zweiunddreißig sind die Lücken noch viel größer, etwa bei Zählern oder Zeitstempeln.

**bisher:** Was heißt das für dich als Ingenieur? Erstens: Vergleiche Floats nie mit dem doppelten Gleichheitszeichen. Nimm math Punkt is close, oder prüfe, ob der Betrag der Differenz kleiner ist als deine Toleranz. Zweitens: Fehler summieren sich. Addierst du zehnmal null Komma eins, kommst du nicht genau auf eins. Und drittens: In Steuerungen mit float zweiunddreißig sind die Lücken noch viel größer, etwa bei Zählern oder Zeitstempeln.

### v03 · Absatz 5

**Original:** Jetzt der Bezug zur KI. KI-generierter Code vergleicht Floats erstaunlich oft mit dem doppelten Gleichheitszeichen. Das sieht richtig aus, läuft durch, und scheitert erst im Betrieb. Genau das musst du beim Prüfen erkennen. In unserer Wissens-Ampel heißt das: Im Kopf haben musst du, dass das passiert und warum. Ein Bitmuster von Hand umzurechnen darfst du nachschlagen, oder der KI überlassen.

**Sprechfassung:** Jetzt der Bezug zur K I. K I-generierter Code vergleicht Floats erstaunlich oft mit dem doppelten Gleichheitszeichen. Das sieht richtig aus, läuft durch, und scheitert erst im Betrieb. Genau das musst du beim Prüfen erkennen. In unserer Wissens-Ampel heißt das: Im Kopf haben musst du, dass das passiert und warum. Ein Bitmuster von Hand umzurechnen darfst du nachschlagen, oder der K I überlassen.

**bisher:** Jetzt der Bezug zur KI. KI-generierter Code vergleicht Floats erstaunlich oft mit dem doppelten Gleichheitszeichen. Das sieht richtig aus, läuft durch, und scheitert erst im Betrieb. Genau das musst du beim Prüfen erkennen. In unserer Wissens-Ampel heißt das: Im Kopf haben musst du, dass das passiert und warum. Ein Bitmuster von Hand umzurechnen darfst du nachschlagen, oder der KI überlassen.

### v03 · Absatz 6

**Original:** Auf der Seite kannst du das gleich selbst erkunden: In den Explorables schiebst du Bits hin und her und siehst, wie die Lücken auf dem Zahlenstrahl wachsen. Probier es aus!

**Sprechfassung:** Auf der Seite kannst du das gleich selbst erkunden: In den Explorables schiebst du Bits hin und her und siehst, wie die Lücken auf dem Zahlenstrahl wachsen. Probier es aus!

**bisher:** Auf der Seite kannst du das gleich selbst erkunden: In den Explorables schiebst du Bits hin und her und siehst, wie die Lücken auf dem Zahlenstrahl wachsen. Probier es aus!

## v03-python-typen

Quelle: `video-src/v03-python-typen/` – render.py, Liste SECS (Untertitel = Original; bisher gesprochen = audio/s1..s6.txt bzw. SECS, 2. Tupelelement)

### v03-python-typen · Absatz 1

**Original:** In Python hat jeder Wert einen Typ. Eine ganze Zahl ist ein int, eine Kommazahl ein float, Text ein str und ein Wahrheitswert ein bool. Mit type() fragst du den Typ ab. Beachte: 25 ist ein int, 25.0 ein float und "25" in Anführungszeichen ein str.

**Sprechfassung:** In Python hat jeder Wert einen Typ. Eine ganze Zahl ist ein int, eine Kommazahl ein float, Text ein str und ein Wahrheitswert ein bool. Mit type() fragst du den Typ ab. Beachte: fünfundzwanzig ist ein int, fünfundzwanzig Komma null ein float und "fünfundzwanzig" in Anführungszeichen ein str.

**bisher:** In Python hat jeder Wert einen Typ. Eine ganze Zahl ist ein int, eine Kommazahl ein float, Text ein str und ein Wahrheitswert ein bool. Mit der Funktion type fragst du den Typ ab. Beachte: fünfundzwanzig ist ein int, fünfundzwanzig Punkt null ein float und fünfundzwanzig in Anführungszeichen ein str.

- PRÜFEN: Code ohne Backticks: type()

### v03-python-typen · Absatz 2

**Original:** Jetzt der wichtigste Stolperstein bei Messwerten: input() liefert immer Text. Auch wenn du eine Zahl eintippst, steht in der Variablen ein str. Zum Rechnen wandelst du um: float(input(...)). So hast du in einer Zeile gleich eine Zahl.

**Sprechfassung:** Jetzt der wichtigste Stolperstein bei Messwerten: input() liefert immer Text. Auch wenn du eine Zahl eintippst, steht in der Variablen ein str. Zum Rechnen wandelst du um: float(input(..)). So hast du in einer Zeile gleich eine Zahl.

**bisher:** Jetzt der wichtigste Stolperstein bei Messwerten: Die Funktion input liefert immer Text. Auch wenn du eine Zahl eintippst, steht in der Variablen ein str. Zum Rechnen wandelst du um: float von input. So hast du in einer Zeile gleich eine Zahl.

- PRÜFEN: Code ohne Backticks: input()
- PRÜFEN: Code ohne Backticks: float(input(...)

### v03-python-typen · Absatz 3

**Original:** Was passiert, wenn du Typen falsch mischst? int("2.5") ist ein ValueError: Text mit Dezimalpunkt lässt sich nicht direkt in eine Ganzzahl wandeln. Der Umweg geht erst über float, dann über int. "3" + 4 ist ein TypeError: Text und Zahl lassen sich nicht addieren. Lies immer die letzte Zeile der Fehlermeldung: Dort steht, was los ist.

**Sprechfassung:** Was passiert, wenn du Typen falsch mischst? int("zwei Komma fünf") ist ein ValueError: Text mit Dezimalpunkt lässt sich nicht direkt in eine Ganzzahl wandeln. Der Umweg geht erst über float, dann über int. "drei" plus vier ist ein TypeError: Text und Zahl lassen sich nicht addieren. Lies immer die letzte Zeile der Fehlermeldung: Dort steht, was los ist.

**bisher:** Was passiert, wenn du Typen falsch mischst? int von Text zwei Punkt fünf ist ein ValueError, denn Text mit Dezimalpunkt lässt sich nicht direkt in eine Ganzzahl umwandeln. Der Umweg geht erst über float und dann über int. Und der Text drei plus die Zahl vier ist ein TypeError, denn Text und Zahl lassen sich nicht addieren. Lies immer die letzte Zeile der Fehlermeldung: Dort steht, was los ist.

- PRÜFEN: Code ohne Backticks: int("2.5")

### v03-python-typen · Absatz 4

**Original:** Jetzt: Abschneiden gegen Runden. int() schneidet die Nachkommastellen ab, in Richtung null: int(2.9) ist 2, int(-2.9) ist -2. round() rundet: round(2.9) ist 3. Genau bei .5 rundet Python zur nächsten geraden Zahl: round(2.5) ist 2, round(3.5) ist 4. Das nennt man Banker's Rounding.

**Sprechfassung:** Jetzt: Abschneiden gegen Runden. int() schneidet die Nachkommastellen ab, in Richtung null: int(zwei Komma neun) ist zwei, int(minus zwei Komma neun) ist minus zwei. round() rundet: round(zwei Komma neun) ist drei. Genau bei .5 rundet Python zur nächsten geraden Zahl: round(zwei Komma fünf) ist zwei, round(drei Komma fünf) ist vier. Das nennt man Banker's Rounding.

**bisher:** Jetzt: Abschneiden gegen Runden. int schneidet die Nachkommastellen ab, in Richtung null: int von zwei Punkt neun ist zwei, und int von minus zwei Punkt neun ist minus zwei. round rundet: round von zwei Punkt neun ist drei. Genau bei einem halben rundet Python zur nächsten geraden Zahl: round von zwei Punkt fünf ist zwei, round von drei Punkt fünf ist vier. Das nennt man Bankers Rounding.

- PRÜFEN: Code ohne Backticks: int()
- PRÜFEN: Code ohne Backticks: int(2.9)
- PRÜFEN: Code ohne Backticks: int(-2.9)
- PRÜFEN: Code ohne Backticks: round()
- PRÜFEN: Code ohne Backticks: round(2.9)
- PRÜFEN: Code ohne Backticks: round(2.5)
- PRÜFEN: Code ohne Backticks: round(3.5)
- PRÜFEN: Rest-Ziffern/Symbole: 5

### v03-python-typen · Absatz 5

**Original:** Für saubere Ausgaben nimmst du f-Strings. Vor dem Anführungszeichen steht ein f, in geschweiften Klammern der Wert. Nach dem Doppelpunkt folgt das Format: .2f bedeutet zwei Nachkommastellen. 8.3f macht das Feld 8 Zeichen breit, mit drei Nachkommastellen. Und e schreibt in wissenschaftlicher Schreibweise. Das Format ändert nur die Anzeige, nicht den gespeicherten Wert.

**Sprechfassung:** Für saubere Ausgaben nimmst du f-Strings. Vor dem Anführungszeichen steht ein f, in geschweiften Klammern der Wert. Nach dem Doppelpunkt folgt das Format: .2f bedeutet zwei Nachkommastellen. acht Komma drei f macht das Feld acht Zeichen breit, mit drei Nachkommastellen. Und e schreibt in wissenschaftlicher Schreibweise. Das Format ändert nur die Anzeige, nicht den gespeicherten Wert.

**bisher:** Für saubere Ausgaben nimmst du f-Strings. Vor dem Anführungszeichen steht ein f, und in geschweiften Klammern der Wert. Nach dem Doppelpunkt folgt das Format: Punkt zwei f bedeutet zwei Nachkommastellen. Acht Punkt drei f macht das Feld acht Zeichen breit, mit drei Nachkommastellen. Und e schreibt in wissenschaftlicher Schreibweise. Das Format ändert nur die Anzeige, nicht den gespeicherten Wert.

- PRÜFEN: Formatangabe (z. B. .2f): ausschreiben, z. B. [[.2f|Punkt zwei f]]
- PRÜFEN: Rest-Ziffern/Symbole: 2f

### v03-python-typen · Absatz 6

**Original:** Das Modul math bringt Funktionen mit. Du holst es mit import math. math.sqrt(2) ist die Wurzel aus 2, math.pi ist die Kreiszahl. Weil Floats nie ganz exakt sind, ist 0.1 + 0.2 == 0.3 falsch. Vergleiche stattdessen mit math.isclose, und du bekommst True. Probier alles selbst aus!

**Sprechfassung:** Das Modul math bringt Funktionen mit. Du holst es mit import math. math.sqrt(zwei) ist die Wurzel aus zwei, math.pi ist die Kreiszahl. Weil Floats nie ganz exakt sind, ist null Komma eins plus null Komma zwei gleich gleich null Komma drei falsch. Vergleiche stattdessen mit math.isclose, und du bekommst True. Probier alles selbst aus!

**bisher:** Das Modul math bringt Funktionen mit. Du holst es mit import math. math Punkt sqrt von zwei ist die Wurzel aus zwei, und math Punkt pi ist die Kreiszahl. Weil Floats nie ganz exakt sind, ist null Komma eins plus null Komma zwei gleich null Komma drei: False. Vergleiche stattdessen mit math Punkt is close, und du bekommst True. Probier alles selbst aus!

- PRÜFEN: Code ohne Backticks: math.sqrt(2)

## v03-toleranzrechner

Quelle: `video-src/v03-toleranzrechner/` – render.py, Liste SECS (Untertitel = Original; bisher gesprochen = audio/s1..s6.txt bzw. SECS, 2. Tupelelement)

### v03-toleranzrechner · Absatz 1

**Original:** Aufgabe: Ein Programm liest Nennmaß, Abmaß und Messwert ein. Es gibt die Grenzmaße aus und prüft, ob der Messwert in der Toleranz liegt. Unser Beispiel: Nennmaß 25 mm, Abmaß ± 0,05 mm. Das Bauteil darf also zwischen 24,95 und 25,05 mm messen. Unser Messwert liegt genau auf der Grenze: 25,05 mm. Ist das noch in Ordnung?

**Sprechfassung:** Aufgabe: Ein Programm liest Nennmaß, Abmaß und Messwert ein. Es gibt die Grenzmaße aus und prüft, ob der Messwert in der Toleranz liegt. Unser Beispiel: Nennmaß fünfundzwanzig Millimeter, Abmaß plus minus null Komma null fünf Millimeter. Das Bauteil darf also zwischen vierundzwanzig Komma neun fünf und fünfundzwanzig Komma null fünf Millimeter messen. Unser Messwert liegt genau auf der Grenze: fünfundzwanzig Komma null fünf Millimeter. Ist das noch in Ordnung?

**bisher:** Aufgabe: Ein Programm liest Nennmaß, Abmaß und Messwert ein. Es gibt die Grenzmaße aus und prüft, ob der Messwert in der Toleranz liegt. Unser Beispiel: Nennmaß fünfundzwanzig Millimeter, Abmaß plus minus null Komma null fünf Millimeter. Das Bauteil darf also zwischen vierundzwanzig Komma neun fünf und fünfundzwanzig Komma null fünf Millimeter messen. Unser Messwert liegt genau auf der Grenze: fünfundzwanzig Komma null fünf Millimeter. Ist das noch in Ordnung?

### v03-toleranzrechner · Absatz 2

**Original:** Bevor du Code schreibst, zerlegst du die Aufgabe, ähnlich wie in einem Programmablaufplan. Eingabe: drei Zahlen, nämlich Nennmaß, Abmaß und Messwert. Verarbeitung: Untermaß und Obermaß berechnen und prüfen, ob der Messwert passt. Ausgabe: die Grenzmaße und das Ergebnis der Prüfung. Jeder dieser Kästen wird später ein Abschnitt im Code.

**Sprechfassung:** Bevor du Code schreibst, zerlegst du die Aufgabe, ähnlich wie in einem Programmablaufplan. Eingabe: drei Zahlen, nämlich Nennmaß, Abmaß und Messwert. Verarbeitung: Untermaß und Obermaß berechnen und prüfen, ob der Messwert passt. Ausgabe: die Grenzmaße und das Ergebnis der Prüfung. Jeder dieser Kästen wird später ein Abschnitt im Code.

**bisher:** Bevor du Code schreibst, zerlegst du die Aufgabe, ähnlich wie in einem Struktogramm. Eingabe: drei Zahlen, nämlich Nennmaß, Abmaß und Messwert. Verarbeitung: Untermaß und Obermaß berechnen und prüfen, ob der Messwert passt. Ausgabe: die Grenzmaße und das Ergebnis der Prüfung. Jeder dieser Kästen wird später ein Abschnitt im Code.

### v03-toleranzrechner · Absatz 3

**Original:** Abschnitt 1 liest die Eingaben. input() liefert Text, deshalb steht float() drumherum. Ohne float() bricht schon die Subtraktion mit einem TypeError ab. Abschnitt 2 rechnet: Untermaß ist Nennmaß minus Abmaß, Obermaß ist Nennmaß plus Abmaß. Abschnitt 3 gibt die Grenzmaße aus. Der f-String mit :.2f zeigt zwei Nachkommastellen.

**Sprechfassung:** Abschnitt eins liest die Eingaben. input() liefert Text, deshalb steht float() drumherum. Ohne float() bricht schon die Subtraktion mit einem TypeError ab. Abschnitt zwei rechnet: Untermaß ist Nennmaß minus Abmaß, Obermaß ist Nennmaß plus Abmaß. Abschnitt drei gibt die Grenzmaße aus. Der f-String mit :.2f zeigt zwei Nachkommastellen.

**bisher:** Abschnitt eins liest die Eingaben. input liefert Text, deshalb steht float drumherum. Ohne float bricht schon die Subtraktion mit einem TypeError ab. Abschnitt zwei rechnet: Untermaß ist Nennmaß minus Abmaß, Obermaß ist Nennmaß plus Abmaß. Abschnitt drei gibt die Grenzmaße aus. Der f-String mit Doppelpunkt, Punkt zwei f, zeigt zwei Nachkommastellen.

- PRÜFEN: Code ohne Backticks: input()
- PRÜFEN: Code ohne Backticks: float()
- PRÜFEN: Code ohne Backticks: float()
- PRÜFEN: Formatangabe (z. B. .2f): ausschreiben, z. B. [[.2f|Punkt zwei f]]
- PRÜFEN: Rest-Ziffern/Symbole: 2f

### v03-toleranzrechner · Absatz 4

**Original:** Abschnitt 4 ist der Kern der Aufgabe. math.isclose prüft, ob der Messwert höchstens ein Abmaß vom Nennmaß entfernt liegt. rel_tol ist null, damit nur die absolute Toleranz zählt. abs_tol ist das Abmaß. Der kleine Zuschlag von 1e-9 fängt Rundungsfehler ab.

**Sprechfassung:** Abschnitt vier ist der Kern der Aufgabe. math.isclose prüft, ob der Messwert höchstens ein Abmaß vom Nennmaß entfernt liegt. rel_tol ist null, damit nur die absolute Toleranz zählt. abs_tol ist das Abmaß. Der kleine Zuschlag von zehn hoch minus neun fängt Rundungsfehler ab.

**bisher:** Abschnitt vier ist der Kern der Aufgabe. math Punkt is close prüft, ob der Messwert höchstens ein Abmaß vom Nennmaß entfernt liegt. rel tol ist null, damit nur die absolute Toleranz zählt. abs tol ist das Abmaß. Der kleine Zuschlag von eins mal zehn hoch minus neun fängt Rundungsfehler ab.

- PRÜFEN: Code ohne Backticks: rel_tol
- PRÜFEN: Code ohne Backticks: abs_tol
- PRÜFEN: Rest-Ziffern/Symbole: abs_tol, rel_tol

### v03-toleranzrechner · Absatz 5

**Original:** Jetzt der Probelauf mit den Eingaben 25, 0.05 und 25.05. Die Grenzmaße lauten 24.95 und 25.05. Der Messwert liegt genau auf der Grenze, also erwarten wir True. Aber 25.05 minus 25 ergibt in Python 0.05000000000000071, also minimal mehr als 0.05. Ohne Zuschlag fiele der Grenzwert fälschlich durch. Bei 25.06 ist False dagegen richtig.

**Sprechfassung:** Jetzt der Probelauf mit den Eingaben fünfundzwanzig, null Komma null fünf und fünfundzwanzig Komma null fünf. Die Grenzmaße lauten vierundzwanzig Komma neun fünf und fünfundzwanzig Komma null fünf. Der Messwert liegt genau auf der Grenze, also erwarten wir True. Aber fünfundzwanzig Komma null fünf minus fünfundzwanzig ergibt in Python null Komma null fünf, dann dreizehn Nullen und hinten die Ziffern sieben eins, also minimal mehr als null Komma null fünf. Ohne Zuschlag fiele der Grenzwert fälschlich durch. Bei fünfundzwanzig Komma null sechs ist False dagegen richtig.

**bisher:** Jetzt der Probelauf mit den Eingaben fünfundzwanzig, null Punkt null fünf und fünfundzwanzig Punkt null fünf. Die Grenzmaße lauten vierundzwanzig Punkt neun fünf und fünfundzwanzig Punkt null fünf. Der Messwert liegt genau auf der Grenze, also erwarten wir True. Aber fünfundzwanzig Punkt null fünf minus fünfundzwanzig ergibt in Python null Punkt null fünf, dann sechs Nullen, und hinten eins null null null null null null sieben eins, also minimal mehr als null Punkt null fünf. Ohne den Zuschlag fiele der Grenzwert fälschlich durch. Bei fünfundzwanzig Punkt null sechs ist False dagegen richtig.

### v03-toleranzrechner · Absatz 6

**Original:** Zum Schluss: Vergleiche deine Lösung mit einem KI-Vorschlag. Steht float() um input()? Werden Floats irgendwo mit == verglichen? Und teste immer die Grenzfälle: genau auf der Grenze, knapp darüber und knapp darunter. Dann weißt du, ob du den Code wirklich verstanden hast.

**Sprechfassung:** Zum Schluss: Vergleiche deine Lösung mit einem K I-Vorschlag. Steht float() um input()? Werden Floats irgendwo mit gleich gleich verglichen? Und teste immer die Grenzfälle: genau auf der Grenze, knapp darüber und knapp darunter. Dann weißt du, ob du den Code wirklich verstanden hast.

**bisher:** Zum Schluss: Vergleiche deine Lösung mit einem KI-Vorschlag. Steht float um input? Werden Floats irgendwo mit zwei Gleichheitszeichen verglichen? Und teste immer die Grenzfälle: genau auf der Grenze, knapp darüber und knapp darunter. Dann weißt du, ob du den Code wirklich verstanden hast.

- PRÜFEN: Code ohne Backticks: float()
- PRÜFEN: Code ohne Backticks: input()

