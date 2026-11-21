# V03 Sprechertext – Fließkommazahlen (Sprechfassung, Zahlen ausgeschrieben für die TTS)

## s1 Hook
Stell dir vor, du addierst in einer Toleranzkette null Komma eins Millimeter und null Komma zwei Millimeter. Python antwortet: null Komma drei, dann viele Nullen, und ganz hinten eine Vier. Und die Frage, ob das Ergebnis gleich null Komma drei ist? Python sagt: Falsch. Noch ein Beispiel: Eine SPS mit dem Datentyp REAL, also zweiunddreißig Bit, kann die Zahl sechzehn Millionen siebenhundertsiebenundsiebzigtausend zweihundertsiebzehn gar nicht darstellen. Was ist da los?

## s2 Warum
Computer speichern Zahlen binär, also mit Nullen und Einsen. Im Dezimalsystem kannst du ein Drittel nicht exakt aufschreiben: null Komma drei drei drei, ewig weiter. Genauso ist null Komma eins im Binärsystem periodisch: null Komma null null null eins eins, null null eins eins, und so weiter. Der Speicher hat aber nur endlich viele Stellen, also wird abgeschnitten. Schon die einzelne Zahl null Komma eins ist im Rechner minimal falsch.

## s3 IEEE 754
Gespeichert wird nach dem Standard I triple E sieben fünf vier. Das ist die wissenschaftliche Schreibweise, nur binär: ein Vorzeichen, ein Exponent und eine Mantisse. Beim float vierundsechzig, dem normalen Python-Float, sind das ein, elf und zweiundfünfzig Bit. Beim float zweiunddreißig, dem REAL der SPS, ein, acht und dreiundzwanzig Bit. Weil die Mantisse begrenzt ist, liegen die darstellbaren Zahlen nicht gleichmäßig: Nahe null sind sie dicht, bei großen Zahlen wachsen die Lücken. Bei float zweiunddreißig liegen ab sechzehn Millionen schon zwei Einheiten zwischen zwei Nachbarn. Deshalb fehlt die siebzehn.

## s4 Folgen
Was heißt das für dich als Ingenieur? Erstens: Vergleiche Floats nie mit dem doppelten Gleichheitszeichen. Nimm math Punkt is close, oder prüfe, ob der Betrag der Differenz kleiner ist als deine Toleranz. Zweitens: Fehler summieren sich. Addierst du zehnmal null Komma eins, kommst du nicht genau auf eins. Und drittens: In Steuerungen mit float zweiunddreißig sind die Lücken noch viel größer, etwa bei Zählern oder Zeitstempeln.

## s5 KI
Jetzt der Bezug zur KI. KI-generierter Code vergleicht Floats erstaunlich oft mit dem doppelten Gleichheitszeichen. Das sieht richtig aus, läuft durch, und scheitert erst im Betrieb. Genau das musst du beim Prüfen erkennen. In unserer Wissens-Ampel heißt das: Im Kopf haben musst du, dass das passiert und warum. Ein Bitmuster von Hand umzurechnen darfst du nachschlagen, oder der KI überlassen.

## s6 Abschluss
Auf der Seite kannst du das gleich selbst erkunden: In den Explorables schiebst du Bits hin und her und siehst, wie die Lücken auf dem Zahlenstrahl wachsen. Probier es aus!
