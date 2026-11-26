# Zuschnitt Termin 02 und Termin 03 (Endfassung)

Grundlage ist der Entwurf „anfaenger“. Alle Programme, Ausgaben, Fehlermeldungen und Tabellen dieser Fassung sind mit Python 3.13 nachgerechnet.

## Aufteilung von T2 und P2

| Einheit | Termin 02 (Teil 1) | Termin 03 (Teil 2) |
|---|---|---|
| T2 Boolesche Logik | 1 Block: Aussage, wahr oder falsch, Vergleich mit Grenzfall; zum Schluss kurz NICHT (erste Wahrheitstabelle, zwei Zeilen, an einem Alltagssatz) | 2 Blöcke: (a) UND, ODER, Wahrheitstabelle mit vier Zeilen; (b) Ausdruck mit Klammer: Hilfsspalte, Tabelle ausfüllen |
| P1 Abschluss | 1 Block: f-String mit `:.2f` | wird nur benutzt |
| P2 Verzweigungen | 2 Blöcke: (a) Raute mit zwei Wegen im Plan; (b) `if` und `else` | 2 Blöcke: (a) zweite Raute im nein-Weg, `elif`; (b) zwei Vergleiche in einer Raute: `and`, `or` |

Die Wahrheitstabelle kommt damit in allen drei T2-Blöcken vor und wächst: zwei Zeilen, vier Zeilen, vier Zeilen mit Hilfsspalte. NICHT ist aus Termin 03 nach Termin 02 gewandert, aber nur in der kleinsten Form: Tabelle mit zwei Zeilen an einem Alltagssatz, 4 Minuten am Ende des Blocks, ohne Umformen von Vergleichen. Kerninhalt des Blocks in Termin 02 bleibt der Vergleich als Aussage. Der Theorie-Block von Termin 03 wäre sonst überladen.

Beispielwelt: Getränkeautomat (Termin 02 zwei Wege; Termin 03 drei Wege und zweite Bedingung „Flasche da“), Ampel (Termin 03, drei Wege, schaltet nach der Uhr), Schere-Stein-Papier (Termin 03, Lückentext mit Spiel zu zweit).

Reihenfolge in Termin 02: Theorie, Raute, `if`/`else`, f-String im letzten Block. Aussage, Raute und `if` bilden eine Kette. Der f-String ist nicht entbehrlich (Training und Termin 03 brauchen ihn); deshalb hat der letzte Block 5 Minuten Puffer und eine feste Rangfolge (Abschnitt I).

## Festlegungen für beide Termine

1. **Stationen in der Reihenfolge von Termin 01:** Werkzeugkasten, vorgerechnetes Beispiel, Ablauf verfolgen, Plan zeichnen, Zeilen ordnen, Lücken füllen, erste eigene Aufgabe, Fehler finden. Keine Abweichung. Minuten auf der Seite: Termin 02 53 wie in Termin 01, Termin 03 49.
2. **Auf der Seite ist nichts vorgezogen.** Wer allein lernt, liest erst die Lerneinheit, dann das Labor. Nur im Termin wird verschränkt. Dort gilt: Der Werkzeugkasten ist Nachschlagewerk, jede Karte wird gezeigt, wenn ihr Inhalt dran ist; die Minuten eines Abschnitts im Ablaufplan enthalten das Zeigen der zugehörigen Karte. Vom vorgerechneten Beispiel kommt in Termin 02 vor der Pause nur der Plan, der Code danach. Jeder 30-Minuten-Block verplant höchstens 28 Minuten. Dafür laufen zwei Stationen im Termin nicht einzeln: in Termin 02 Station 6 (Hausaufgabe), in Termin 03 Station 3 (gemeinsam am Beamer oder zu Hause). Die Videos laufen nicht im Termin.
3. **Termin 02: vor der Pause kein neuer Code.** Termin 03 hat zwei kleine Programmierinhalte; dort gilt „Plan zuerst“ innerhalb jedes Blocks (erst der Plan, dann die eine neue Code-Zeile dazu).
4. **Eine Vorhersage je Abschnitt** (vier je Termin).
5. **Schreibweisen, einmal festgelegt:**

| Wo | wahr | falsch |
|---|---|---|
| im Satz | wahr | falsch |
| in Python | `True` | `False` |
| am Ausgang der Raute | ja | nein |
| in der Wahrheitstabelle (ab Termin 03, so auch in der Klausur) | 1 | 0 |

6. **In der Raute steht die Bedingung wie in Python** (`>=`, `<=`, `==`, `and`, `or`). Von Hand sind ≤ und ≥ erlaubt. Zeichenaufgaben fragen nur mit `<`, `<=`, `>`, `>=` und geben nur Zahlen aus (Grund: Bauhinweise).
7. **Ablauf verfolgen fragt die Entscheidung ab.** Jede Zeile mit Raute oder `if` ist ein eigener Schritt: Im Plan trägst du den Weg ein (ja oder nein), im Code den Wert der Bedingung (`True` oder `False`). Erst danach zeigt das Werkzeug die nächste Zeile. Eingetragen wird ohne Anführungszeichen; das steht in der Aufgabenstellung, im Text des Schritts und im Hinweis (Grund: Bauhinweise, trace).
8. **Ausgabetexte stehen wörtlich in der Aufgabe.** Tests prüfen die letzten Ausgabezeilen des Programms, ohne Groß und Klein zu unterscheiden, und nennen Soll und Ist: in der Regel die letzte Zeile; endet jeder Weg mit derselben Schlusszeile (Automat: „Danke“), die letzten zwei.
9. **Der Grenzfall gehört in jede Aufgabe:** ein Test genau auf der Grenze. Das Wort heißt überall „Grenzfall“ („Grenzwert“ ist in Mathematik belegt).
10. **Zu Hause, ehrlich gerechnet.** Das Training hat je Termin fünf Aufgaben mit den Zeiten von Termin 01 (★★★ 10 Minuten, Klausuraufgabe 8 Minuten): Termin 02 37 Minuten, Termin 03 38 Minuten. Gestrichen sind „Stempelkarte“ (Termin 02) und „Freibadwetter“ (Termin 03); sie wiederholten fast die erste eigene Aufgabe des Termins. Dazu kommt der Selbstcheck (7 Minuten), in Termin 02 außerdem Station 6 „Lücken füllen“ (4 Minuten). Zusammen: Termin 02 48 Minuten, Termin 03 45 Minuten (50, wenn Station 3 nicht gemeinsam verfolgt wurde).
11. **Zahlen:** Was wie Code aussieht, hat den Punkt (`2.0 >= 1.5`). Beträge im Text und an Reglern haben Komma und Euro-Zeichen (2,00 €). Kommazahlen, mit denen ein Programm rechnet oder vergleicht, sind Vielfache von 0,50; das gilt auch für Testwerte. Einzige Ausnahme: die Vorhersage „Zwei Stellen“ mit `2.456`, sie zeigt das Runden.
12. **Angaben an den Aufgaben wie in Termin 01:** Jede Code-, Lücken- und Zeichenaufgabe hat drei gestufte Tipps (unten ausgeschrieben). Jede Selbstcheck-Frage hat Punkte (2 bis 4, unten angegeben). Die Einleitungssätze der Stationen und die Texte für `<Ohne>` der Bausteine entstehen beim Bau nach dem Muster von Termin 01: ein bis drei Sätze, was zu tun ist; `<Ohne>` nennt ein durchgerechnetes Beispiel.

Vom Dozenten zu bestätigen:
- NICHT in Termin 02, in der kleinsten Form (Abweichung vom Entwurf).
- Python-Schreibweise in der Raute (Punkt 6).
- Umfang zu Hause (Punkt 10): Selbstcheck zu Hause statt im Termin; Termin 02 48 Minuten, Termin 03 45 Minuten.
- Kennungen V02 und V03 mit Löschen der Altlektionen V02, V03 und V04 (Bauhinweise, Kennung und Dateien).

Stand 2026-11-24: Die vier Punkte sind wie vorgeschlagen umgesetzt. Sie lagen dem Dozenten zusammen mit den folgenden Abweichungen vor; seine Antwort auf die Frage nach den Abweichungen war „Ja, passt so“.

Beim Bau abgewichen, vom Dozenten bestätigt (2026-11-24). Wo dieses Papier weiter unten etwas anderes sagt, gilt die gebaute Fassung:
- Termin 03, Station 6 „Lücken füllen“: Der Plan zeigt nur die ersten zwei der vier Rauten, der Rest steht als Kasten „weitere Fälle“. Der volle Plan passte bei keiner Breite ohne Querscrollen.
- Termin 03, Wahrheitstabelle (Lerneinheit Abschnitt 4 und Training 1): Spalten A und B statt „Schritt“ und „Zeile“, Überschrift „Tabelle“ statt „Python“.
- Termin 03, Abschnitt 2 und 3: Plan und Code stehen untereinander statt nebeneinander. Der zusätzliche statische Ampel-Plan vor dem elif-Code ist gestrichen; der Baustein zeigt denselben Plan.
- Termin 03, Station 6 „Danach zu zweit“: fertiges Programm in einem aufklappbaren Block, nicht eingerechnet in die 8 Minuten.
- Termin 02, Station 7, Zusatz: Die Grenze steht als eigene Variable (`grenze = 15`) am Anfang; eingelesen wird weiter nur die Temperatur.
- Termin 03, Übung „Tabelle“ in der Lerneinheit: Sie zählt nicht im Fortschritt. Die Plattform zählt nur Aufgaben im Labor.
- Plan zuerst nur bei neuem Ablauf: Kinoticket (Termin 02) und Zahlenraten (Termin 03) verlangen den Plan nicht mehr vorab.

Am 2026-11-25 vom Dozenten entschieden:
- Knobelaufgaben dürfen den Stoff des laufenden Termins nutzen (Termin 03: `elif`, `and`, `or`).
- Termin 02 hat zwei Knobelaufgaben: „Wettlauf mit Vorsprung“ und „Eine große oder mehrere kleine Pizzen“.
- In der Aufgabenliste zeigen Knobelaufgaben keinen Status, solange sie nicht gelöst sind.
- Die Fehlersuche „Freibad-Kasse“ bleibt mit dem Alltags-„und“ im Aufgabentext.
- Sichtbar heißt es überall „Termin 02“ bzw. „T02“; die Kennung V02 bleibt intern (Adressen, Speicher, Daten).
- Videos: Stempel WAHR/FALSCH in Großbuchstaben (Termin 02 Theorie); im Ausblick von Termin 03 Theorie stehen zwei große Rauten mit Python-Schreibweise untereinander; im Beispiel-Video von Termin 03 steht der Plan neben dem Code, solange vom Plan die Rede ist, danach der Code allein.

Am 2026-11-26 vom Dozenten entschieden (ändert den Zuschnitt von T2 und T3 im ganzen Kurs):
- Boolesche Logik (T2) hat 5 statt 3 Blöcke: Termin 02 (1 Block, unverändert), Termin 03 (2 Blöcke), Termin 04 (2 Blöcke, neu). Zahlensysteme (T3) schrumpfen von 4 auf 2 Blöcke: je 1 Block in Termin 05 und Termin 06. Was bei den Zahlensystemen wegfällt, wird erst bei Termin 05 entschieden. Termin 06 behält T4 Bitoperationen (1 Block); dort kommt XOR (ENTWEDER-ODER) hin.
- Termin 03 ist die Methode: Theorie-Block 1 (UND/ODER mit 2 Variablen) bleibt wie gebaut, das Video v03-theorie bleibt unverändert. Theorie-Block 2 heißt jetzt „Einen Ausdruck auflösen“: 3 Variablen (8 Zeilen), rein mit A, B, C ohne Alltagsgeschichte; Baustein „Drei Schalter“, Trace `A UND (B ODER C)`, Vorhersage mit 16 Zeilen.
- Das Joggen-Beispiel und NICHT (A ODER B) entfallen in Termin 03. NICHT (A ODER B) kommt in Termin 04 zu De Morgan.
- Labor t-1 in Termin 03 ist jetzt `(A ODER B) UND (NICHT C)`. Der Selbstcheck „spalte“ ist jetzt `(NICHT (A UND B)) ODER C`.
- Termin 04 ist das Anwenden: 4 Variablen (16 Zeilen), Gleichwertigkeit zweier Ausdrücke per Tabelle (so wird De Morgan entdeckt), Vorrang UND vor ODER, eine Bedingung aus einem Text in eine Formel übersetzen.
- Gar nicht: Umformen mit Rechenregeln, Gatter, KV-Diagramme. In Python weiterhin kein `not`, kein `!=`, kein gemischtes `and`/`or`.

## Hinweise für den Bau

- **Kennung und Dateien (vor dem Bau festgelegt).** Es gilt die Regel aus `docs/app/ARCHITEKTUR.md`, Abschnitt 16: Ein fertiger Termin bekommt die Kennung `V` plus Terminnummer; die alte Lektion gleicher Kennung und das Material, das der Termin ersetzt, werden gelöscht. `app/src/lib/kurs.mjs` leitet den Ordner aus der Kennung ab (`app/inhalte/<kennung klein>/`).

| | Termin 02 | Termin 03 |
|---|---|---|
| Kennung (`nr` in `kurs.yaml`, `data-lesson`, Schlüssel für den Fortschritt) | `V02` | `V03` |
| Ordner | `app/inhalte/v02/` | `app/inhalte/v03/` |
| Quellen | `lerneinheit.mdx`, `labor.mdx`, `labor/<Aufgabe>.<Rolle>.py` und `.json` | dasselbe, dazu `lerneinheit/tabelle.daten.json` (Übung in Abschnitt 4) |
| Adresse der Lerneinheit | `v02-entscheiden.html` | `v03-und-oder-drei-wege.html` |
| Adresse des Labors | `v02-labor.html` | `v03-labor.html` |
| Videos (`<Video name>`, `video-src/`) | `v02-theorie`, `v02-python`, `v02-beispiel` | `v03-theorie`, `v03-python`, `v03-beispiel` |
| Bausteine | `site/assets/js/explorables-v02.js` mit `site/assets/css/v02.css` (`vergleich`, `weiche`) | `explorables-v03.js` mit `v03.css` (`schalter`); die Seite lädt zusätzlich `explorables-v02.js` und `v02.css` für `weiche` |
| Kennungen der Aufgaben | wie Termin 01: `w-vorgemacht`, `w-trace`, `w-plan`, `w-parsons`, `w-luecken`, `w-eigene`, `tr-1` bis `tr-5` | dasselbe |

  Was mit den alten Einträgen geschieht:
  - Beim Bau von Termin 02 wird die Altlektion V02 „Bits und Bytes“ gelöscht: Eintrag in `kurs.yaml`, `site/lektionen/v02-bits-und-bytes.html` und `v02-labor.html`, das alte `explorables-v02.js`, `v02.css`, die Videos `v02-*` und `video-src/v02-*`. Die neuen Dateien tragen dieselben Namen.
  - Beim Bau von Termin 03 wird die Altlektion V03 „Fließkommazahlen“ gelöscht (Seiten, `v03-training.html` samt `app/src/pages/lektionen/v03-training.html.js`, `v03.css`, Videos `v03*`). Weil Termin 03 T2 und P2 abschließt, geht dann auch die Altlektion V04 (Seiten, `explorables-v04.js`, `v04.css`, Videos `v04-*`).
  - In `kurs.yaml` entfallen damit unter `einheiten` die Angaben `stoff: [V02]` (T3, T4), `stoff: [V03]` (T5) und `stoff: [V04]` (P2, T2); sonst zeigten sie auf die neuen Termine. Unter `termine` kommen `lektion: V02` und `lektion: V03` dazu.
  - Der Steinbruch für T3, T4 und T5 (Termin 04 bis 08) bleibt in der Git-Historie: vor dem Löschen einen Tag setzen (zum Beispiel `altbestand-v02-v03-v04`) und in `KONZEPT-MIGRATION.md`, Abschnitt 7, nennen. Die Videos liegen im Repository und sind damit mitgesichert.
  - Mitzuziehen: `app/skripte/tests/quelle.test.mjs` nimmt `lektionen/v02-bits-und-bytes.html` und `v02-theorie.mp4` als Beispiel (auf eine bleibende Altseite mit Video umstellen). `pruefe-seiten.mjs` und `pruefe-zusammenspiel.mjs` nehmen `v03-training.html` aus. `site/klausurtrainer.html` hängt Aufgaben an `data-lektion="V02"`, `"V03"`, `"V04"` (steht nicht mehr in der Navigation, zeigte aber auf die neuen Termine).
- **Bausteine:** Die neue `explorables-v02.js` ersetzt die gleichnamige Datei der Altlektion (siehe oben), ein Ausweichname ist nicht nötig. `weiche` wird einmal gebaut (Plan als Daten, Knopfgruppe statt Regler); die Seite von Termin 03 lädt die Datei von Termin 02 mit, kopiert wird nichts.
- **trace (Voraussetzung, kleiner Umbau in `site/assets/js/aufgaben.js`, `initTrace`):** Der feste Starttext jedes Schritts lautet „Zeile N wird ausgeführt. … Typen beachten: Text steht in Anführungszeichen.“ und erscheint vor der Eingabe. Wer deshalb `"nein"` tippt, bekommt falsch: Der Vergleich entfernt keine Anführungszeichen, und trace kennt keine Alternativen. Der eigene Hinweis kommt erst nach dem Fehlversuch. Deshalb gehören zwei Schalter in den Aufgabendaten zum Bauumfang: `frage` an einem Schritt ersetzt den festen Starttext dieses Schritts; `ausgabe: false` an der Aufgabe blendet die Spalte „Ausgabe“ aus. Ohne die Felder bleibt alles wie in Termin 01. Unabhängig vom Schalter steht „ohne Anführungszeichen“ in der Aufgabenstellung und im Hinweis jedes Entscheidungsschritts. Sonst genügen eine zusätzliche Spalte in `vars` (`Weg` oder `Bedingung`) und ein Schritt auf der Zeile der Entscheidung. Der Vergleich unterscheidet Groß und Klein (`True`, nicht `true`); auch das steht im Text und im Hinweis des Schritts.
- **Wahrheitstabelle als trace:** Zeilen = Tabellenzeilen („A = 0, B = 0“ bis „A = 1, B = 1“), Spalten = Hilfsspalte und Ergebnis, je Zeile ein Schritt. Dreimal gebraucht (Termin 03 Abschnitt 4, Training, Warm-up Termin 04), deshalb mit beiden Schaltern: `ausgabe: false` und an jedem Schritt eine `frage` („Zeile A = 0, B = 1: Trag in beide Felder 0 oder 1 ein, ohne Anführungszeichen.“). Die Spalte „Zeile“ bleibt, sie zeigt 1 bis 4. Die Lerneinheit lädt `aufgaben.js` bereits.
- **PAP-Zeichner:** `nice()` in `pap-engine.js` zeigt `==` als `=`, `<=` als ≤, `and` als „und“. Solange das so ist, vermeiden Zeichenaufgaben `==`, `and`, `or`; sichtbar ist dann nur ≤ statt `<=`. Wer in die Raute ein Fragezeichen tippt, bekommt einen SyntaxError aus erzeugtem Code: Tipp an der Aufgabe („Das Fragezeichen setzt der Editor selbst“) oder eine Zeile in `condOf`. `elif` entsteht nur, wenn die Raute das einzige Symbol im nein-Weg ist; alle Musterlösungen sind so gebaut.
- **Tests:** Die Eingabeaufforderung steht im Testlauf als eigene Zeile in der Ausgabe, deshalb die letzten Zeilen vergleichen (nicht `in zeilen(...)`, sonst fällt `if` statt `elif` nicht auf). Beim Automaten (Termin 02, Station 6) ist die letzte Zeile immer „Danke“: dort `[z.lower() for z in zeilen(run_program(["1.5"]))[-2:]]` mit `["cola kommt", "danke"]` vergleichen. f-String-Aufgaben: prüfen, ob `10.50` in der letzten Zeile steht; `zahlen()` macht daraus 10.5. Beim Kinoticket zusätzlich das Wort in der letzten Zeile prüfen. Bei Schere-Stein-Papier enthalten die Aufforderungen Ziffern: Text der letzten Zeile prüfen und die Zahl der Zeilen (zwei Aufforderungen, eine Ergebniszeile).
- **Quiz:** Das Antwortfeld für `typ="output"` ist einzeilig; Alternativen mit `|` angeben. Der Vergleich fasst nur Leerraum zusammen, deshalb bei der Ergebnisspalte alle vier Schreibweisen nennen: `antwort="0 1 0 0|0100|0, 1, 0, 0|0,1,0,0"`. Der Platzhalter „Ausgabe, genau wie Python sie druckt“ passt dort nicht ganz; die Frage gibt die Schreibweise deshalb selbst vor.
- **Fehlermeldungen** sind wörtlich aus Python 3.13 übernommen; beim Bau gegen die Python-Version der Seite prüfen.
- **MDX:** Geschweifte Klammern in Antworten und Tipps brauchen den Rückstrich. Eine `<Vorhersage>` beginnt mit einem Frage-Absatz.

---

# Termin 02

## A. Kopf

- Titel: **Wahr oder falsch: Programme, die entscheiden**
- Vorspann: Bisher laufen deine Programme stur von oben nach unten. Heute stellen sie eine Frage und nehmen je nach Antwort einen von zwei Wegen.
- Lernziele:
  - entscheiden, ob eine Aussage wahr oder falsch ist, und Zahlen mit `<`, `>`, `<=`, `>=`, `==` vergleichen, auch im Grenzfall
  - eine Verzweigung mit der Raute in einen Plan zeichnen und den Weg für gegebene Werte verfolgen
  - einen Plan mit Raute in `if` und `else` übertragen und die Ausgabe bestimmen
  - Zahlen mit einem f-String auf zwei Nachkommastellen ausgeben
- kurz: „Entscheiden“
- hook: „Wenn das Geld reicht, kommt die Cola“
- neu in Python: `True`/`False`, Vergleiche `<  >  <=  >=  ==`, `if …:`, `else:`, Einrückung, f-String mit `{x:.2f}`, Fehlermeldungen `SyntaxError: expected ':'` und `IndentationError`.

NICHT steht nicht in den Lernzielen: Es wird in Termin 02 nur gezeigt und erst in Termin 03 geprüft.

## B. Warm-up (0–10)

Training Termin 01, Aufgabe „Verdienst im Nebenjob“ (tr-4, Plan in Code übertragen), auf Papier, 5 Minuten allein. Auflösung am Beamer, Probe mit 12 und 13.5: `Verdienst: 162.0`.

Zwei Fragen bleiben offen stehen:
- „Ab 40 Stunden gibt es einen Zuschlag. Wo im Plan würdet ihr das einbauen?“ Dafür fehlt ein Symbol. Es kommt nach dem Theorie-Block.
- „162.0 Euro: Schreibt so jemand einen Geldbetrag?“ Die Antwort kommt am Ende des Termins.

## C. Lerneinheit

### Abschnitt 1 · Wahr oder falsch (T2, Teil 1 · 10–40)

Kernaussage: Eine Aussage ist entweder wahr oder falsch. Ein Vergleich ist eine Aussage über Zahlen.

- Eine Cola kostet 1,50 Euro. Du hast 2 Euro. Die Aussage „Mein Geld reicht“ ist wahr. Mit 1 Euro ist sie falsch.
- Aussage (Begriff): ein Satz, der stimmt oder nicht stimmt. „Wie spät ist es?“ ist keine Aussage. Ob sie stimmt, heißt Wahrheitswert: wahr oder falsch, dazwischen gibt es nichts. Python schreibt `True` und `False`, groß und ohne Anführungszeichen.
- Vergleich: fünf Zeichen. `1 < 1.5` wahr · `1.5 > 1.5` falsch · `1.5 <= 1.5` wahr · `2 >= 1.5` wahr · `6 == 6` wahr.
- Vom Satz zum Zeichen: „mindestens 16“ ist `>= 16` · „höchstens 50“ ist `<= 50` · „unter 10“ ist `< 10` · „mehr als 30“ ist `> 30` · „genau 6“ ist `== 6`.
- Der Grenzfall: Bei genau 1.5 ist `>=` wahr und `>` falsch. Deshalb probierst du immer drei Werte: einen darunter, einen genau auf der Grenze, einen darüber.

Zum Schluss, kurz (4 Minuten): NICHT dreht eine Aussage um. Aus wahr wird falsch, aus falsch wird wahr. Beispiel: A ist „Das Geld reicht“, NICHT A ist „Das Geld reicht nicht“. Die kleine Tabelle heißt Wahrheitstabelle (Begriff): Sie listet jeden Fall auf. Vergleiche werden hier nicht umgeformt.

| A | NICHT A |
|---|---|
| wahr | falsch |
| falsch | wahr |

Ausblick in einem Satz: Wie man zwei Aussagen mit UND und ODER verknüpft, kommt in Termin 03.

```python
geld = 2
preis = 1.5
print(geld >= preis)
print(geld < preis)
```

Ausgabe: `True`, `False`.

Vorhersage „Der Grenzfall“: Was geben die beiden letzten Zeilen aus?

```python
geld = 1.5
preis = 1.5
print(geld > preis)
print(geld >= preis)
```

- [x] False, dann True
- True, dann True
- False, dann False
- True, dann False

Auflösung: 1.5 ist nicht größer als 1.5, aber größer oder gleich.

Der Unterschied zwischen `=` und `==` steht nicht hier, sondern in Abschnitt 3 und auf Karte 1: dort, wo `==` zum ersten Mal im Programm steht.

### Abschnitt 2 · Die Raute: ein Plan mit zwei Wegen (P2, Teil 1 · 40–70)

Kernaussage: Die Raute stellt eine Frage; der Ablauf nimmt genau einen der beiden Wege, danach laufen sie wieder zusammen.

- Der Automat soll zwei verschiedene Dinge tun können. Mit Parallelogramm und Rechteck geht es nur geradeaus.
- Viertes Symbol: die Raute, Name Verzweigung. In ihr steht eine Bedingung (Begriff: eine Aussage, die der Ablauf prüft) als Frage: `geld >= 1.5?`
- Ein Eingang, zwei Ausgänge, beschriftet mit ja (die Aussage ist wahr) und nein (sie ist falsch).
- Es wird genau ein Weg gegangen: nie beide, nie keiner.
- Danach treffen sich die Wege. Was darunter steht, passiert immer. Es bleibt bei einem Ende.
- Plan lesen: Wert einsetzen, Frage beantworten, dem Pfeil folgen.

Ein Satz zur Schreibweise: In der Raute schreibst du die Bedingung so, wie sie später in Python steht. Von Hand darfst du ≤ und ≥ schreiben.

```text
Eingabe: geld
Entscheidung: geld >= 1.5?
  ja:
    Ausgabe: "Cola kommt"
  nein:
    Ausgabe: "Zu wenig Geld"
Ausgabe: "Danke"
```

Mit 2 Euro: Cola kommt, Danke. Mit 1 Euro: Zu wenig Geld, Danke.

Vorhersage „Plan lesen“ (Plan als Bild): Was gibt der Plan bei der Eingabe 25 aus?

```text
Eingabe: bestellwert
Entscheidung: bestellwert >= 30?
  ja:
    versand = 0
  nein:
    versand = 4
gesamt = bestellwert + versand
Ausgabe: gesamt
```

- [x] 29
- 25
- 4
- 34

Auflösung: 25 >= 30 ist falsch, also Weg nein: versand = 4. Danach laufen die Wege zusammen: 25 + 4 = 29.

### Abschnitt 3 · if und else: aus der Raute wird Code (P2, Teil 1 · 80–110)

Kernaussage: Die Raute wird `if Bedingung:`, der ja-Weg steht eingerückt darunter, der nein-Weg eingerückt unter `else:`.

- Übersetzung: Raute wird `if`, ja-Weg darunter, `else:` für den nein-Weg. `else` hat keine eigene Bedingung: Es ist der Fall, in dem die Aussage falsch ist.
- Hinter der Bedingung und hinter `else` steht ein Doppelpunkt.
- Einrückung: vier Leerzeichen. Sie zeigt, welche Zeilen zu einem Weg gehören. Nach dem Doppelpunkt rückt der Editor die nächste Zeile selbst ein.
- `else` steht auf derselben Höhe wie `if`.
- Was nicht eingerückt ist, läuft immer: Das ist die Stelle, an der die Wege zusammenlaufen.
- `=` legt einen Wert ab, `==` fragt, ob zwei Werte gleich sind. In einer Bedingung steht deshalb `==` (`if wurf == 6:`).
- Zwei Fehlermeldungen: Doppelpunkt vergessen ergibt `SyntaxError: expected ':'`. Einrückung vergessen ergibt `IndentationError: expected an indented block after 'if' statement on line 2`.

Plan aus Abschnitt 2 links, Code rechts (`data-stdin="2"`). Mit „Schritt für Schritt“ siehst du, welche Zeile übersprungen wird.

```python
geld = float(input("Eingeworfen in Euro: "))
if geld >= 1.5:
    print("Cola kommt")
else:
    print("Zu wenig Geld")
print("Danke")
```

Eingabe 2: `Cola kommt`, `Danke`. Eingabe 1: `Zu wenig Geld`, `Danke`. Eingabe 1.5: `Cola kommt`, `Danke`.

Vorhersage „Was gehört zum Weg?“: Was gibt das Programm aus?

```python
wurf = 6
if wurf == 6:
    print("Gewonnen")
else:
    print("Verloren")
    print("Nochmal würfeln")
print("Ende")
```

- [x] Gewonnen, dann Ende
- Gewonnen, dann Nochmal würfeln, dann Ende
- nur Gewonnen
- Gewonnen, dann Verloren, dann Nochmal würfeln, dann Ende

Auflösung: Die zwei eingerückten Zeilen unter `else` gehören zum nein-Weg und werden übersprungen. `print("Ende")` ist nicht eingerückt und läuft immer.

### Abschnitt 4 · Ausgabe formatieren: der f-String (P1, Abschluss · 110–135)

Kernaussage: Ein f-String ist ein Text mit Lücken in geschweiften Klammern; `:.2f` zeigt eine Zahl mit genau zwei Nachkommastellen.

- Problem: Das Programm „Verdienst im Nebenjob“ aus dem Training von Termin 01 gibt `Verdienst: 162.0` aus. Ein Automat, der 50 Cent zurückgibt, schriebe `Rückgeld: 0.5 Euro`. Geld schreibt man mit zwei Stellen.
- Ein `f` direkt vor dem Anführungszeichen macht aus dem Text einen f-String.
- In `{}` steht ein Variablenname. Python setzt dort den Wert ein.
- `{rueckgeld:.2f}`: Doppelpunkt, Punkt, 2, f. Die Zahl wird mit zwei Nachkommastellen angezeigt, gerundet oder mit Nullen aufgefüllt. Die Variable ändert sich dabei nicht, nur die Anzeige.
- Im Plan ändert sich nichts: Das Parallelogramm „Ausgabe: verdienst“ bleibt. Wie die Zahl aussieht, legt der Code fest.
- Ohne das `f` erscheinen die Klammern wörtlich in der Ausgabe. Python meldet keinen Fehler.

```python
rueckgeld = 0.5
print("Rückgeld:", rueckgeld, "Euro")
print(f"Rückgeld: {rueckgeld} Euro")
print(f"Rückgeld: {rueckgeld:.2f} Euro")
```

Ausgabe: `Rückgeld: 0.5 Euro`, `Rückgeld: 0.5 Euro`, `Rückgeld: 0.50 Euro`.

Jetzt du: das Programm „Verdienst im Nebenjob“ aus dem Training von Termin 01, der Plan bleibt derselbe (`data-stdin="12\n13.5"`).

```text
Eingabe: stunden
Eingabe: lohn
verdienst = stunden * lohn
Ausgabe: verdienst
```

```python
stunden = float(input("Stunden: "))
lohn = float(input("Stundenlohn in Euro: "))
verdienst = stunden * lohn
print("Verdienst:", verdienst)
```

Ausgabe: `Verdienst: 162.0`. Auftrag am Block: Ändere die letzte Zeile so, dass `Verdienst: 162.00 Euro` erscheint. (Lösung: `print(f"Verdienst: {verdienst:.2f} Euro")`.)

Vorhersage „Zwei Stellen“: Was gibt das Programm aus?

```python
preis = 2.456
print(f"Preis: {preis:.2f} Euro")
```

- [x] Preis: 2.46 Euro
- Preis: 2.45 Euro
- Preis: 2.456 Euro
- Preis: \{preis:.2f\} Euro

Auflösung: Zwei Stellen, gerundet. Die Klammern erschienen nur, wenn das `f` fehlte.

## D. Interaktive Bausteine (2)

1. **`vergleich` – „Reicht das Geld?“** (Abschnitt 1). Einstellen: Regler „Dein Geld“ von 0 bis 3 Euro in Schritten von 0,50; fünf Knöpfe für das Vergleichszeichen; der Preis 1,50 Euro steht fest. Sehen: die Aussage mit Zahlen (`2.0 >= 1.5`), groß „wahr“ oder „falsch“, darunter `True` oder `False`. Dazu sieben Punkte für die sieben Beträge; gefärbt sind die, bei denen die Aussage wahr ist. Vermutung: Du hast genau 1,50 Euro. Bei welchen der fünf Zeichen ist die Aussage wahr? (Bei drei: `<=`, `>=`, `==`.)
2. **`weiche` – „Der Plan des Getränkeautomaten“** (Abschnitt 2). Einstellen: fünf Knöpfe 0,50 · 1,00 · 1,50 · 2,00 · 3,00 Euro. Sehen: der Plan; der gegangene Weg leuchtet, der andere ist grau. Daneben die Bedingung mit eingesetztem Wert (`1.0 >= 1.5` ist falsch: Weg nein) und die Ausgaben. Vermutung: Findest du einen Betrag, bei dem beide Wege leuchten, oder einen, bei dem keiner leuchtet? (Nein. Es ist immer genau ein Weg.)

Abschnitt 3 nutzt „Schritt für Schritt“ am Codeblock, Abschnitt 4 den Codeblock mit Auftrag.

## E. Selbstcheck (6 Fragen, 18 Punkte)

1. **Vergleiche prüfen (mehrere richtig)**, Auswahl, 4 Punkte. Welche Vergleiche sind wahr? [x] `7 >= 7` · `3 > 5` · [x] `4 <= 9` · `6 == 9` · [x] `2 < 2.5`. Erklärung: Bei `>=` und `<=` zählt der gleiche Wert mit. `==` ist nur bei gleichen Werten wahr.
2. **Vom Satz zum Zeichen**, Auswahl, 2 Punkte. In einen Aufzug dürfen höchstens 8 Personen. Welcher Vergleich ist genau dann wahr, wenn alles in Ordnung ist? [x] `personen <= 8` · `personen < 8` · `personen >= 8` · `personen == 8`. Erklärung: „Höchstens 8“ heißt: 8 ist noch erlaubt. Probier den Grenzfall: Bei 8 ist `personen <= 8` wahr, `personen < 8` wäre falsch.
3. **Plan lesen**, Zahl, 3 Punkte, Antwort 80. Welche Zahl gibt der Plan bei der Eingabe 10 aus?
   ```text
   Eingabe: personen
   Entscheidung: personen >= 10?
     ja:
       preis = 8
     nein:
       preis = 10
   gesamt = personen * preis
   Ausgabe: gesamt
   ```
   Erklärung: 10 >= 10 ist wahr, also Weg ja: preis = 8. Danach laufen die Wege zusammen: 10 · 8 = 80.
4. **Ausgabe bestimmen**, Auswahl, 3 Punkte.
   ```python
   tempo = 62
   if tempo > 50:
       print("Zu schnell")
   else:
       print("In Ordnung")
   print("Gute Fahrt")
   ```
   [x] Zu schnell, dann Gute Fahrt · nur Zu schnell · In Ordnung, dann Gute Fahrt · Zu schnell, dann In Ordnung, dann Gute Fahrt. Erklärung: 62 > 50 ist wahr. Die letzte Zeile ist nicht eingerückt und läuft immer.
5. **Ausgabe mit f-String**, Ausgabe bestimmen, 3 Punkte, Antwort `3.50 Euro`.
   ```python
   x = 3.5
   print(f"{x:.2f} Euro")
   ```
   Erklärung: `:.2f` zeigt genau zwei Nachkommastellen, aus 3.5 wird 3.50.
6. **Fehler finden**, Auswahl, 3 Punkte. In welcher Zeile steckt der Fehler?
   ```python
   punkte = int(input("Punkte: "))
   if punkte >= 50
       print("Bestanden")
   else:
       print("Nicht bestanden")
   ```
   `punkte = int(input("Punkte: "))` · [x] `if punkte >= 50` · `else:` · In keiner Zeile, das Programm läuft. Erklärung: Hinter der Bedingung fehlt der Doppelpunkt. Python meldet `SyntaxError: expected ':'`.

## F. Labor Teil A (Stationen, auf der Seite 53 Minuten; im Termin ohne Station 6)

**1 · Werkzeugkasten (5 Min).** Drei Karten, Video „Python-Werkzeugkasten“. Einleitung: Karte 1 und 2 brauchst du für die Verzweigung, Karte 3 für die Ausgabe. Im Termin: Karte 1 und 2 nach der Pause mit Abschnitt 3, Karte 3 mit Abschnitt 4.
- Karte 1 „Vergleichen: wahr oder falsch“
  ```python
  punkte = 48
  print(punkte >= 50)
  print(punkte == 48)
  ```
  Ausgabe `False`, `True`. Fünf Zeichen: `<  >  <=  >=  ==`. `==` fragt, `=` legt ab.
- Karte 2 „if und else: einer von zwei Wegen“
  ```python
  punkte = 48
  if punkte >= 50:
      print("Bestanden")
  else:
      print("Nicht bestanden")
  ```
  Ausgabe `Nicht bestanden`. Doppelpunkt hinter der Bedingung und hinter `else`. Vier Leerzeichen Einrückung. Genau ein Weg läuft.
- Karte 3 „f-String: zwei Nachkommastellen“
  ```python
  preis = 9.5
  print(f"Ticket: {preis:.2f} Euro")
  ```
  Ausgabe `Ticket: 9.50 Euro`. Das `f` steht vor dem Anführungszeichen, der Name in `{}`.

**2 · Vorgerechnetes Beispiel: Einlass ab 16 (8 Min).** Aufgabe: Das Programm liest das Alter ein (ganze Zahl). Ab 16 Jahren gibt es „Einlass“ aus, sonst „Kein Einlass“. Danach in jedem Fall „Der Nächste bitte“. Video „Vorgerechnet“. Art `run`, Eingabe `17`.

```text
Eingabe: alter
Entscheidung: alter >= 16?
  ja:
    Ausgabe: "Einlass"
  nein:
    Ausgabe: "Kein Einlass"
Ausgabe: "Der Nächste bitte"
```

```python
# Einlass ab 16
alter = int(input("Alter: "))
if alter >= 16:
    print("Einlass")
else:
    print("Kein Einlass")
print("Der Nächste bitte")
```

Eingabe 17: `Einlass`, `Der Nächste bitte`. Eingabe 15: `Kein Einlass`, `Der Nächste bitte`. Eingabe 16: `Einlass`, `Der Nächste bitte`.

Schritte: (1) Die Frage finden: „ab 16“ heißt mindestens 16, also `>=`. (2) Der Plan: Eingabe, Raute, je Weg eine Ausgabe, danach eine gemeinsame. (3) Zeile 2: Eingabe als ganze Zahl. (4) Zeile 3: Die Raute wird `if`, mit Doppelpunkt. (5) Zeilen 4 bis 6: ja-Weg eingerückt, `else:`, nein-Weg eingerückt. (6) Zeile 7: nicht eingerückt, läuft immer. (7) Probe mit drei Werten: 15, dem Grenzfall 16 und 17. (8) Selbsterklärung: Was passiert bei 16, wenn du `>` statt `>=` schreibst? (Kein Einlass.)

Im Termin: Schritte 1 und 2 vor der Pause (3 Minuten), Schritte 3 bis 8 danach (5 Minuten).

**3 · Ablauf verfolgen: ein Plan mit Raute (5 Min).** Art `trace`. Diesmal verfolgst du einen Plan. Quiz-Regel: Wer mindestens 50 Punkte hat, bekommt 10 dazu, alle anderen verlieren 10. In der Aufgabenstellung steht: An der Raute trägst du den Weg ein, ja oder nein, klein geschrieben und ohne Anführungszeichen. Der Plan steht als Bild darüber:

```text
Eingabe: punkte
Entscheidung: punkte >= 50?
  ja:
    punkte = punkte + 10
  nein:
    punkte = punkte - 10
Ausgabe: punkte
```

Zeilen der Aufgabe:

```text
Eingabe: punkte  (eingegeben wird 45)
Raute: punkte >= 50?
ja-Weg: punkte = punkte + 10
nein-Weg: punkte = punkte - 10
Ausgabe: punkte
```

Spalten `punkte` und `Weg`. Schritte:
- Zeile 1: punkte = 45.
- Zeile 2: Weg = nein. Text des Schritts (`frage`): Die Raute fragt: punkte >= 50? Trag den Weg ein: ja oder nein, klein und ohne Anführungszeichen. Hinweis: 45 >= 50 ist falsch. Am Ausgang der Raute heißt das nein. Schreib ja oder nein, klein, ohne Anführungszeichen.
- Zeile 4: punkte = 35. Hinweis: Der ja-Weg wird nicht gegangen. Im nein-Weg: 45 − 10.
- Zeile 5: Ausgabe `35`.

Zusatzfrage im Text: Was käme beim Grenzfall 50 heraus? (60)

**4 · Plan zeichnen: Eintritt ins Freibad (★, 10 Min).** Art `pap-zeichnen`, erlaubt `in,out,op,if`. Text: Eingelesen wird das Alter (ganze Zahl). Wer unter 18 ist, zahlt 3 Euro, alle anderen zahlen 5 Euro. Ausgegeben wird der Preis.
Lösung: Eingabe alter (int) · Raute `alter < 18` · ja: Rechteck `preis = 3` · nein: Rechteck `preis = 5` · Ausgabe preis.
Tests: 12 ergibt 3 · 17 ergibt 3 · 18 ergibt 5 · 40 ergibt 5.
Tipps: (1) Welche Frage entscheidet über den Preis? Das Fragezeichen setzt der Editor selbst. (2) Du brauchst eine Eingabe, eine Raute, in jedem Weg ein Rechteck und danach eine Ausgabe. (3) In der Raute steht: alter < 18.

**5 · Zeilen ordnen: Sechs gewinnt (4 Min).** Art `parsons`. Plan: Eingabe wurf · Raute `wurf == 6?` · ja: Ausgabe "Gewonnen" · nein: Ausgabe "Verloren".
Lösung:
```python
wurf = int(input("Dein Wurf: "))
if wurf == 6:
    print("Gewonnen")
else:
    print("Verloren")
```
Zeilen, die nicht dazugehören: `if wurf = 6:` und `else` (ohne Doppelpunkt).

**6 · Lücken füllen: der Getränkeautomat (4 Min; im Termin Hausaufgabe).** Art `gap`. Der Automat aus der Lerneinheit mit vier Lücken; der Plan aus Abschnitt 2 steht darüber. Im Termin wird die Station nicht bearbeitet: Derselbe Automat lief gerade in Abschnitt 3. Zu Hause ist sie der Einstieg vor dem Training.

```text
geld = float(input("Eingeworfen in Euro: "))
@@if@@ geld @@>=@@ 1.5@@:@@
    print("Cola kommt")
@@else@@:
    print("Zu wenig Geld")
print("Danke")
```

Tests (verglichen werden die letzten zwei Zeilen, klein geschrieben; die letzte Zeile allein ist immer „Danke“): 2 ergibt `cola kommt`, `danke` · 1.5 ergibt `cola kommt`, `danke` (fängt `>` ab) · 1 ergibt `zu wenig geld`, `danke`.
Tipps: (1) Welches Wort gehört zur Raute? (2) „Reicht“ heißt mindestens 1,50 Euro. (3) Welches Zeichen steht am Ende der Zeile mit `if`?

**7 · Erste eigene Aufgabe: Jacke oder T-Shirt (★, 10 Min).** Art `code`. Text: Das Programm liest die Temperatur ein (Kommazahl). Unter 15 Grad gibt es `Jacke anziehen` aus, sonst `T-Shirt reicht`.
Plan: Eingabe temperatur · Raute `temperatur < 15?` · ja: Ausgabe "Jacke anziehen" · nein: Ausgabe "T-Shirt reicht".
Lösung:
```python
temperatur = float(input("Temperatur in Grad: "))
if temperatur < 15:
    print("Jacke anziehen")
else:
    print("T-Shirt reicht")
```
Tests: 8 ergibt Jacke anziehen · 14.5 ergibt Jacke anziehen · 15 ergibt T-Shirt reicht · 22.5 ergibt T-Shirt reicht.
Tipps: (1) Vier Symbole, fünf Zeilen. (2) Karte 2 im Werkzeugkasten zeigt die Form. (3) Vergiss die Doppelpunkte und die Einrückung nicht.
Für Schnelle: Lies auch die Grenze ein, statt 15 fest ins Programm zu schreiben.

**8 · Fehler finden: Eis kaufen (7 Min).** `Fehlersuche`, Fehler in Zeile 3 und 7. Text: Eine Kugel kostet 1.50 Euro, du hast 5 Euro. Das Programm zeigt den Preis mit zwei Nachkommastellen und sagt, ob das Geld reicht. Erwartet bei 2 Kugeln: `Preis: 3.00 Euro`, dann `Geld reicht`. In zwei Zeilen steckt ein Fehler.

```text
kugeln = int(input("Wie viele Kugeln? "))
preis = kugeln * 1.5
print("Preis: {preis:.2f} Euro")
if preis <= 5:
    print("Geld reicht")
else:
print("Zu teuer")
```

Fehler 1 (Zeile 7), meldet Python: Die Zeile unter `else:` ist nicht eingerückt, `IndentationError: expected an indented block after 'else' statement on line 6`. Fehler 2 (Zeile 3), findest nur du: Das `f` vor dem Anführungszeichen fehlt. Das Programm läuft und schreibt `Preis: {preis:.2f} Euro` wörtlich hin. Richtig (`data-stdin="2"`):

```python
kugeln = int(input("Wie viele Kugeln? "))
preis = kugeln * 1.5
print(f"Preis: {preis:.2f} Euro")
if preis <= 5:
    print("Geld reicht")
else:
    print("Zu teuer")
```

Eingabe 2: `Preis: 3.00 Euro`, `Geld reicht`. Eingabe 4: `Preis: 6.00 Euro`, `Zu teuer`.

## G. Labor Teil B (Training, 5 Aufgaben, 37 Minuten)

Zu Hause zusammen 48 Minuten: Station 6 (4), Selbstcheck (7), Training (37).

1. **Ablauf verfolgen: Gutschein** (★, 5 Min, `trace`). Wird das Warm-up von Termin 03. In der Aufgabenstellung steht: In der Zeile mit `if` trägst du in die Spalte Bedingung True oder False ein, ohne Anführungszeichen.
   ```python
   preis = 30
   gutschein = 5
   if preis >= 25:
       preis = preis - gutschein
   else:
       gutschein = 0
   print(preis, gutschein)
   ```
   Spalten `preis`, `gutschein`, `Bedingung`. Schritte: Zeile 1 preis = 30 · Zeile 2 gutschein = 5 · Zeile 3 Bedingung = True (Text des Schritts: Zeile 3 prüft die Bedingung. Trag True oder False ein, wie Python es schreibt: großer Anfangsbuchstabe, ohne Anführungszeichen. Hinweis: 30 >= 25 ist wahr. Schreib True oder False wie Python, mit großem Anfangsbuchstaben und ohne Anführungszeichen.) · Zeile 4 preis = 25 · Zeile 7 Ausgabe `25 5` (Hinweis: Zeile 6 wurde übersprungen, gutschein ist noch 5).
2. **Plan zeichnen: Paketporto** (★★, 8 Min, `pap-zeichnen`, erlaubt `in,out,op,if`). Eingelesen wird das Gewicht in Kilogramm (Kommazahl). Bis einschließlich 2 kg kostet das Paket 5 Euro, schwerere kosten 7 Euro. Ausgegeben wird das Porto. Lösung: Eingabe gewicht (float) · Raute `gewicht <= 2` · ja: `porto = 5` · nein: `porto = 7` · Ausgabe porto. Tests: 0.5 ergibt 5 · 2 ergibt 5 · 2.5 ergibt 7 · 10 ergibt 7.
   Tipps: (1) Schreib die zwei Fälle auf: bis einschließlich 2 kg und schwerer. Welche eine Frage trennt sie? (2) Du brauchst eine Eingabe, eine Raute, in jedem Weg ein Rechteck und danach eine Ausgabe. (3) Für „bis einschließlich“ tippst du `<=`; der Editor zeigt ≤. In der Raute steht: gewicht <= 2.
3. **Plan in Code übertragen: Zahlenraten, erster Schritt** (★★, 8 Min, `klausur`). Plan: Rechteck `geheim = 7` · Eingabe tipp (ganze Zahl) · Raute `tipp == geheim?` · ja: Ausgabe "Treffer" · nein: Ausgabe "Daneben". Tests: 7 ergibt Treffer, 3 ergibt Daneben. Schema (je 1 Punkt): Zuweisung und Eingabe mit `int(input(…))` · `if` mit `==` und Doppelpunkt · `else:` und beide Wege eingerückt · die Ausgaben stehen im richtigen Weg.
   ```python
   geheim = 7
   tipp = int(input("Dein Tipp: "))
   if tipp == geheim:
       print("Treffer")
   else:
       print("Daneben")
   ```
4. **Fehler finden und beheben: Achterbahn** (★★, 6 Min, `code`). Mitfahren darf, wer mindestens 140 cm groß ist. Zwei Fehler: einer, den Python meldet, einer, den du nur mit dem Grenzfall findest. Probier 140.
   Vorlage:
   ```python
   # Achterbahn: Mitfahren ab 140 cm
   groesse = int(input("Größe in cm: "))
   if groesse > 140:
       print("Einsteigen")
   else
       print("Leider zu klein")
   ```
   Lösung: Zeile 5 `else:` (Python meldet `SyntaxError: expected ':'`), Zeile 3 `groesse >= 140` (mit `>` bekommt jemand mit genau 140 cm „Leider zu klein“). Tests: 140 ergibt Einsteigen · 139 ergibt Leider zu klein · 150 ergibt Einsteigen.
   Tipps: (1) Führ das Programm aus und lies die Fehlermeldung von unten: Welche Zeile nennt sie, welches Zeichen fehlt dort? (2) Läuft das Programm, probier den Grenzfall 140: Darf die Person laut Aufgabe mitfahren? (3) „Mindestens 140“ schließt die 140 ein. Welches Vergleichszeichen zählt den gleichen Wert mit?
5. **Kinoticket** (★★★, 10 Min, `code`, ohne Plan; erst auf Papier zeichnen). Ein Ticket kostet 9.50 Euro. Das Programm liest dein Geld ein (Kommazahl). Reicht es, gibt es aus, wie viel übrig bleibt, sonst, wie viel fehlt. Die Ausgabe soll genau so aussehen: `Übrig: 10.50 Euro` oder `Es fehlen 0.50 Euro`. Tests (geprüft werden in der letzten Zeile die Zahl mit zwei Stellen und das Wort, ohne Groß und Klein zu unterscheiden): 20 ergibt `10.50` und „übrig“ · 9.5 ergibt `0.00` und „übrig“ · 9 ergibt `0.50` und „fehlen“ · 5 ergibt `4.50` und „fehlen“. Mit dem Wort fällt ein Programm ohne Verzweigung auf, das nur den Betrag der Differenz ausgibt.
   ```python
   geld = float(input("Dein Geld in Euro: "))
   if geld >= 9.5:
       uebrig = geld - 9.5
       print(f"Übrig: {uebrig:.2f} Euro")
   else:
       fehlt = 9.5 - geld
       print(f"Es fehlen {fehlt:.2f} Euro")
   ```
   Tipps: (1) Zeichne zuerst den Plan: eine Eingabe, eine Raute, in jedem Weg ein Rechteck für die Rechnung und eine Ausgabe. (2) Die Frage in der Raute: Reicht das Geld, also geld >= 9.5? Im ja-Weg rechnest du geld - 9.5, im nein-Weg 9.5 - geld. (3) Zwei Nachkommastellen zeigt Karte 3, zum Beispiel: print(f"Übrig: \{uebrig:.2f\} Euro")

## H. Videos (je etwa 2 bis 2,5 Minuten, je fünf Szenen)

**Theorie (Lerneinheit, Abschnitt 1): „Wahr oder falsch: Aussagen und Vergleiche“**
1. Ein Getränkeautomat, die Cola kostet 1,50 Euro. Die Aussage „Das Geld reicht“ erscheint: mit 2 Euro wahr, mit 1 Euro falsch, dazwischen nichts.
2. Aus dem Satz wird der Vergleich `2 >= 1.5`; die fünf Zeichen werden eingeblendet.
3. Der Grenzfall: genau 1,50 Euro. `>=` ist wahr, `>` ist falsch. Drei Werte zur Probe: darunter, auf der Grenze, darüber.
4. NICHT dreht um: die Tabelle mit zwei Zeilen. Aus „Das Geld reicht“ wird „Das Geld reicht nicht“.
5. Merksatz im Bild: Eine Aussage ist wahr oder falsch. Gleich steht so eine Aussage in einem neuen Symbol.

**Python-Werkzeugkasten (Labor, Station 1): „vergleichen, if und else, f-String“**
1. Karte 1: `print(punkte >= 50)` wird ausgeführt und zeigt `False`; `==` fragt, `=` legt ab.
2. Karte 2: Die `if`-Zeile wird getippt, der Doppelpunkt wird hervorgehoben; die nächste Zeile rückt ein.
3. `else:` steht wieder ganz links. Ein Lauf mit 48, einer mit 60: Die übersprungene Zeile wird grau.
4. Karte 3: Das `f` vor dem Anführungszeichen und `{preis:.2f}` machen aus 9.5 die Ausgabe 9.50.
5. Die zwei häufigsten Fehler nebeneinander: Doppelpunkt vergessen, `f` vergessen.

**Vorgerechnet (Labor, Station 2): „Einlass ab 16, vom Plan zum Programm“**
1. Die Aufgabe wird vorgelesen, „ab 16“ wird unterstrichen: mindestens 16, also `>=`.
2. Der Plan entsteht Symbol für Symbol: Eingabe, Raute, zwei Ausgaben, eine gemeinsame Ausgabe.
3. Die Raute wandert nach rechts und wird zur Zeile `if alter >= 16:`; die beiden Wege werden eingerückt, dazwischen `else:`.
4. Die letzte Zeile steht ohne Einrückung: Sie läuft in beiden Fällen.
5. Probe mit dem Grenzfall 16; Plan und Code leuchten parallel. Auftrag: Probier selbst 15 und 17.

## I. Ablaufplan für den Dozenten

Jeder 30-Minuten-Block verplant höchstens 28 Minuten. Die Minuten eines Abschnitts enthalten das Zeigen der genannten Karten.

| Minuten | Wo | Was |
|---|---|---|
| 0–10 | Papier, Beamer | **Warm-up.** „Verdienst im Nebenjob“ auf Papier in Code übertragen, Auflösung, Probe 12 und 13.5. Zwei offene Fragen: Zuschlag ab 40 Stunden (fehlendes Symbol), 162.0 als Geldbetrag. |
| 10–40 | Lerneinheit 1 | **Theorie: wahr oder falsch.** Aussagen aus dem Raum per Handzeichen als wahr oder falsch einordnen, Begriff Aussage, `True` und `False` (6). Fünf Zeichen, „vom Satz zum Zeichen“ (7). Baustein „Reicht das Geld?“ mit Vermutung (6). Vorhersage zum Grenzfall, drei Probewerte (4). Zum Schluss NICHT: Tabelle mit zwei Zeilen an die Tafel, zwei Aussagen vom Anfang umdrehen, keine Vergleiche umformen (4). Verplant: 27. |
| 40–70 | Lerneinheit 2, Labor 2 (Schritte 1 und 2), 3, 4 | **Programmieren 1: der Plan zuerst.** Rückgriff auf den Zuschlag: Das fehlende Symbol ist die Raute. Automat, Baustein „Weiche“, Vorhersage Versandkosten (10). Bei „Einlass ab 16“ die Frage finden und den Plan an der Tafel entwickeln (3). Alle verfolgen den Quiz-Plan (5) und zeichnen den Freibad-Plan (10). Kein Code vor der Pause. Verplant: 28. |
| 70–80 | – | **Pause.** |
| 80–110 | Lerneinheit 3, Labor 1 (Karte 1 und 2), 2 (Schritte 3 bis 8), 5, 7 | **Programmieren 2: der Code.** Plan und Code des Automaten nebeneinander, „Schritt für Schritt“ mit 2 und 1, `=` gegen `==`, Karte 1 und 2 zeigen, Vorhersage (9). Code zu „Einlass ab 16“ mit dem Grenzfall 16 (5). Zeilen ordnen (4), eigene Aufgabe (10). Station 6 ist Hausaufgabe. Rundgang: Doppelpunkt, Einrückung, `=` statt `==`. Verplant: 28. |
| 110–135 | Lerneinheit 4, Labor 1 (Karte 3), 8 | **Programmieren 3: Ausgabe formatieren.** f-String am Rückgeld mit Karte 3; alle bauen die letzte Zeile des Warm-up-Programms um, bis `162.00 Euro` dasteht (10). „Eis kaufen“ gemeinsam am Beamer (7). Auftrag für zu Hause, Pflicht, zusammen 48 Minuten: Station 6, Selbstcheck, Training (3). Termin 03 beginnt mit „Gutschein“. Puffer: 5 Minuten. |

Wenn die Zeit trotzdem knapp wird: Im Block 40–70 wird Station 3 gemeinsam am Beamer verfolgt statt einzeln; der Plan wird gezeichnet. Im Block 80–110 wird Station 5 gemeinsam am Beamer geordnet; die eigene Aufgabe bleibt. Im letzten Block hat der f-String Vorrang vor Station 8; die Fehlersuche löst sich zu Hause selbst auf.

---

# Termin 03

## A. Kopf

- Titel: **Und, oder: mehr als zwei Wege**
- Vorspann: Zwei Wege reichen oft nicht: Eine Ampel hat drei Farben, und bei Schere-Stein-Papier hängt das Ergebnis von zwei Dingen zugleich ab. Heute verknüpfst du Aussagen und baust Pläne mit mehr als einer Raute.
- Lernziele:
  - zwei Aussagen mit UND und ODER verknüpfen und die Wahrheitstabelle dazu aus dem Kopf aufschreiben
  - eine Wahrheitstabelle für eine Verknüpfung mit Klammer ausfüllen, zum Beispiel A UND (NICHT B), mit Hilfsspalte
  - einen Plan mit zwei Rauten zeichnen und in `if`, `elif`, `else` übertragen
  - zwei Vergleiche mit `and` oder `or` in einer Bedingung verbinden und die Ausgabe bestimmen
- kurz: „Und, oder, drei Wege“
- hook: „Grün, Gelb, Rot. Und wer gewinnt mit Stein?“
- neu in Python: `elif`, `and`, `or`.

## B. Warm-up (0–10)

Training Termin 02, Aufgabe „Ablauf verfolgen: Gutschein“. Alle verfolgen das Programm auf Papier, 4 Minuten. Auflösung: Ausgabe `25 5`. Frage in die Runde: Welche Zeile wurde übersprungen, und warum? (Zeile 6, weil 30 >= 25 wahr ist.) Rückblick: eine Frage, zwei Wege, Doppelpunkt, Einrückung.

## C. Lerneinheit

### Abschnitt 1 · Und, oder (T2, Teil 2 · 10–40)

Kernaussage: Mit UND und ODER wird aus zwei Aussagen eine neue; die Wahrheitstabelle zeigt für jede der vier Kombinationen, ob sie wahr ist.

- Rückblick: Eine Aussage ist wahr oder falsch. NICHT dreht sie um.
- Kurzschreibweise für Tabellen: 1 für wahr, 0 für falsch. Aussagen bekommen Namen: A, B. So füllst du Tabellen auch in der Klausur aus.
- UND: Beide müssen stimmen. Der Automat gibt die Cola aus, wenn das Geld reicht (A) UND noch eine Flasche im Fach ist (B).
- Wahrheitstabelle: eine Zeile für jede Kombination. Zwei Aussagen ergeben vier Zeilen, immer in der Reihenfolge 00, 01, 10, 11. So vergisst du keine.
- ODER: Mindestens eine stimmt, auch beide. Museum: Der Eintritt ist frei, wenn du unter 18 bist (A) ODER einen Studierendenausweis hast (B).
- Das „oder“ im Alltag („Kaffee oder Tee?“) meint oft „entweder oder“. Das ODER der Logik ist auch wahr, wenn beides stimmt.
- Merksatz: UND ist streng (eine von vier Zeilen ist wahr), ODER ist großzügig (drei von vier).

| A | B | A UND B | A ODER B |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 1 |

Kein Code in diesem Abschnitt. Ausblick in einem Satz: Nach der Pause stehen UND und ODER in der Raute.

Vorhersage „Beides stimmt“: Tom ist 16 und hat einen Studierendenausweis. Kommt er kostenlos ins Museum (unter 18 ODER Ausweis)?

- [x] Ja, bei ODER dürfen auch beide Aussagen wahr sein.
- Nein, bei ODER darf nur eine der beiden Aussagen wahr sein.
- Das lässt sich nicht entscheiden.

Auflösung: Zeile 1 1 der Tabelle: 1 ODER 1 ergibt 1.

### Abschnitt 2 · Mehr als zwei Wege: elif (P2, Teil 2 · 40–70)

Kernaussage: Braucht ein Ablauf drei Wege, steht im nein-Weg der ersten Raute eine zweite Raute; in Python heißt das `elif`.

- Eine Ampel schaltet nach der Uhr. Ein Umlauf dauert 60 Sekunden: Sekunde 0 bis 29 Grün, 30 bis 34 Gelb, danach Rot. Drei Farben, aber eine Raute hat nur zwei Ausgänge.
- Lösung im Plan: Erste Frage `sekunde < 30?`. Bei nein folgt die zweite Frage `sekunde < 35?`. Bei nein bleibt nur Rot.
- Im nein-Weg weißt du schon etwas: Die Sekunde ist mindestens 30. Deshalb genügt als zweite Frage `sekunde < 35`.
- Gefragt wird von oben nach unten. Nach dem ersten Ja wird nicht weiter gefragt. Es läuft wieder genau ein Weg.
- Python: `elif` heißt „sonst wenn“ und hat eine eigene Bedingung mit Doppelpunkt. `else` steht am Ende, ohne Bedingung, und nimmt den Rest.
- `if`, `elif` und `else` stehen auf derselben Höhe.

Plan links, Code rechts (`data-stdin="32"`):

```text
Eingabe: sekunde
Entscheidung: sekunde < 30?
  ja:
    Ausgabe: "Grün"
  nein:
    Entscheidung: sekunde < 35?
      ja:
        Ausgabe: "Gelb"
      nein:
        Ausgabe: "Rot"
```

```python
sekunde = int(input("Sekunde im Umlauf (0 bis 59): "))
if sekunde < 30:
    print("Grün")
elif sekunde < 35:
    print("Gelb")
else:
    print("Rot")
```

Eingabe 32: `Gelb`. Eingabe 10: `Grün`. Eingabe 50: `Rot`. Grenzfälle: 30 ergibt `Gelb`, 35 ergibt `Rot`.

Vorhersage „Der Rest“: Jemand tippt 75 ein, eine Sekunde, die es im Umlauf gar nicht gibt. Was gibt das Programm aus?

- [x] Rot
- nichts
- eine Fehlermeldung
- Gelb

Auflösung: `else` fragt nicht. Es nimmt alles, was übrig bleibt, auch unsinnige Werte.

### Abschnitt 3 · Zwei Bedingungen in einer Raute: and und or (P2, Teil 2 · 80–110)

Kernaussage: Hängt eine Entscheidung von zwei Dingen ab, verbindest du zwei Vergleiche mit `and` (beide müssen stimmen) oder `or` (einer genügt).

- Achterbahn: Mitfahren darf, wer mindestens 140 cm groß UND mindestens 10 Jahre alt ist. Zwei Regeln, eine Raute.
- UND heißt in Python `and`, ODER heißt `or`, beide klein geschrieben.
- Links und rechts steht je ein vollständiger Vergleich: `groesse >= 140 and alter >= 10`, nicht `groesse >= 140 and >= 10`.
- So liest du die Zeile: erst jeden Vergleich einzeln zu wahr oder falsch machen, dann die Tabelle aus Abschnitt 1 anwenden. Eine Bedingung lesen heißt eine Tabellenzeile ausrechnen.
- Ein Wort entscheidet: Stünde dort `or`, dürfte schon mitfahren, wer nur eine der beiden Regeln erfüllt.
- `and` und `or` mischst du vorerst nicht in einer Bedingung.

Plan: Eingabe groesse · Eingabe alter · Raute `groesse >= 140 and alter >= 10?` · ja: Ausgabe "Einsteigen" · nein: Ausgabe "Leider nicht".

```python
groesse = int(input("Größe in cm: "))
alter = int(input("Alter: "))
if groesse >= 140 and alter >= 10:
    print("Einsteigen")
else:
    print("Leider nicht")
```

`data-stdin="150\n9"`, Ausgabe `Leider nicht` (wahr UND falsch ergibt falsch). Mit 145 und 12: `Einsteigen`. Grenzfall 140 und 10: `Einsteigen`.

Vorhersage „Ein Wort anders“: Im Programm steht versehentlich `or`. Was gibt es aus?

```python
groesse = 150
alter = 9
if groesse >= 140 or alter >= 10:
    print("Einsteigen")
else:
    print("Leider nicht")
```

- [x] Einsteigen
- Leider nicht
- Einsteigen, dann Leider nicht
- eine Fehlermeldung

Auflösung: 150 >= 140 ist wahr, 9 >= 10 ist falsch. Wahr ODER falsch ergibt wahr. Mit `and` wäre es falsch gewesen.

### Abschnitt 4 · Wahrheitstabelle ausfüllen (T2, Teil 2 · 110–135)

Kernaussage: Einen Ausdruck mit Klammer rechnest du in zwei Schritten aus: erst die Klammer in einer Hilfsspalte, dann das Ergebnis.

- Ausdruck (Begriff): eine Verknüpfung von Aussagen mit UND, ODER, NICHT, die du zu wahr oder falsch ausrechnest. Beispiel: A UND (NICHT B).
- Klausurform: Ein Ausdruck ist gegeben, du füllst die Tabelle mit vier Zeilen aus.
- Schritt 1: die vier Zeilen für A und B hinschreiben: 00, 01, 10, 11.
- Schritt 2: für die Klammer eine Hilfsspalte anlegen und ausfüllen.
- Schritt 3: das Ergebnis aus der Hilfsspalte bestimmen, Zeile für Zeile.
- Wir schreiben immer Klammern. Dann ist klar, was zuerst gerechnet wird.
- Beispiel: „Ich gehe joggen, wenn ich Zeit habe UND es NICHT regnet.“ A = „Ich habe Zeit“, B = „Es regnet“. Der Ausdruck: A UND (NICHT B).

| A | B | NICHT B | A UND (NICHT B) |
|---|---|---|---|
| 0 | 0 | 1 | 0 |
| 0 | 1 | 0 | 0 |
| 1 | 0 | 1 | 1 |
| 1 | 1 | 0 | 0 |

Gejoggt wird nur in einer Zeile: Zeit ja, Regen nein.

Übung „Tabelle ausfüllen“ (Art `trace` als Tabelle, erst auf Papier, dann hier prüfen): NICHT (A ODER B). Spalten „A ODER B“ und „NICHT (A ODER B)“, eine Zeile je Kombination, ohne Spalte „Ausgabe“. In der Aufgabenstellung steht: Trag in jedes Feld 0 oder 1 ein, ohne Anführungszeichen.

| A | B | A ODER B | NICHT (A ODER B) |
|---|---|---|---|
| 0 | 0 | 0 | 1 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 1 | 0 |

Text jedes Schritts (`frage`), am Beispiel der zweiten Zeile: Zeile A = 0, B = 1: Trag in beide Felder 0 oder 1 ein, ohne Anführungszeichen. Hinweis je Zeile: Erst die Klammer: Ist A ODER B wahr? Dann umdrehen. Schreib 0 oder 1, ohne Anführungszeichen.

Vorhersage „Ergebnisspalte“: Welche Ergebnisspalte gehört zu (NICHT A) ODER B? Die Zeilen stehen in der Reihenfolge 00, 01, 10, 11.

- [x] 1, 1, 0, 1
- 1, 0, 0, 0
- 0, 1, 0, 0
- 1, 1, 1, 0

Auflösung: Hilfsspalte NICHT A: 1, 1, 0, 0. Falsch ist der Ausdruck nur bei A = 1 und B = 0.

## D. Interaktive Bausteine (2)

1. **`schalter` – „Zwei Schalter, zwei Lampen“** (Abschnitt 1). Einstellen: zwei Schalter A und B. Sehen: eine Lampe für A UND B, eine für A ODER B; daneben die Wahrheitstabelle, die aktuelle Zeile ist markiert. Vermutung: In wie vielen der vier Stellungen leuchtet die UND-Lampe, in wie vielen die ODER-Lampe? (1 und 3.)
2. **`weiche` mit dem Ampel-Plan – „Welche Fragen werden gestellt?“** (Abschnitt 2). Derselbe Baustein wie in Termin 02, mit dem Plan der Ampel. Einstellen: sechs Knöpfe für die Sekunde: 10 · 29 · 30 · 32 · 35 · 50. Sehen: Der gegangene Weg leuchtet; daneben die Liste der gestellten Fragen (`32 < 30` ist falsch: nein · `32 < 35` ist wahr: ja) und die Ausgabe. Vermutung: Bei Sekunde 10 ist auch `10 < 35` wahr. Wird diese zweite Frage überhaupt gestellt? (Nein. Nach dem ersten Ja ist Schluss.)

Abschnitt 3 nutzt „Schritt für Schritt“ am Codeblock, Abschnitt 4 die Tabellen-Übung.

## E. Selbstcheck (6 Fragen, 20 Punkte)

1. **Grundtabelle (mehrere richtig)**, Auswahl, 4 Punkte. In welchen Fällen ist A ODER B wahr? [x] A = 0, B = 1 · [x] A = 1, B = 0 · [x] A = 1, B = 1 · A = 0, B = 0. Erklärung: ODER ist nur falsch, wenn beide Aussagen falsch sind.
2. **Ergebnisspalte bestimmen**, Ausgabe, 4 Punkte, `antwort="0 1 0 0|0100|0, 1, 0, 0|0,1,0,0"`. Füll auf Papier die Tabelle für (NICHT A) UND B aus (Zeilen 00, 01, 10, 11). Gib die Ergebnisspalte von oben nach unten an: vier Ziffern mit Leerzeichen dazwischen, in der Form 1 0 0 1 (das ist nur ein Muster für die Schreibweise, nicht die Lösung). Erklärung: Hilfsspalte NICHT A: 1, 1, 0, 0. Beide zugleich 1 nur in der Zeile 0 1.
3. **Ausgabe bestimmen: drei Wege**, Ausgabe, 3 Punkte, Antwort `warm`.
   ```python
   grad = 30
   if grad > 25:
       print("warm")
   elif grad > 15:
       print("mild")
   else:
       print("kalt")
   ```
   Erklärung: 30 > 25 ist wahr. Nach dem ersten Ja wird nicht weiter gefragt, auch wenn 30 > 15 ebenfalls stimmt.
4. **Zwei Bedingungen**, Auswahl, 3 Punkte.
   ```python
   akku = 15
   minuten = 50
   if akku < 20 and minuten > 60:
       print("Laden")
   else:
       print("Weiter")
   ```
   [x] Weiter · Laden · Laden, dann Weiter · eine Fehlermeldung. Erklärung: 15 < 20 ist wahr, 50 > 60 ist falsch. Wahr UND falsch ergibt falsch.
5. **Plan lesen: drei Wege**, Zahl, 3 Punkte, Antwort 3. Ein Parkhaus rechnet nach diesem Plan ab. Welche Zahl gibt der Plan bei der Eingabe 4 aus?
   ```text
   Eingabe: stunden
   Entscheidung: stunden <= 1?
     ja:
       preis = 0
     nein:
       Entscheidung: stunden <= 4?
         ja:
           preis = 3
         nein:
           preis = 8
   Ausgabe: preis
   ```
   Erklärung: 4 <= 1 ist falsch, also Weg nein zur zweiten Raute. 4 <= 4 ist wahr, das ist der Grenzfall: preis = 3. (Eigener Plan statt des Freibad-Plans, damit die Frage die Lösung von Station 4 nicht zeigt.)
6. **Fehler finden**, Auswahl, 3 Punkte. In welcher Zeile steckt der Fehler?
   ```python
   punkte = int(input("Punkte: "))
   if punkte >= 100:
       print("Gold")
   elif punkte >= 50:
       print("Silber")
   else punkte < 50:
       print("Bronze")
   ```
   `if punkte >= 100:` · `elif punkte >= 50:` · [x] `else punkte < 50:` · In keiner Zeile, das Programm läuft. Erklärung: `else` hat nie eine Bedingung. Python meldet `SyntaxError: expected ':'`, weil es den Doppelpunkt direkt hinter `else` erwartet.

## F. Labor Teil A (Stationen, auf der Seite 49 Minuten; im Termin Station 3 nicht einzeln)

**1 · Werkzeugkasten (3 Min).** Zwei Karten, Video „Python-Werkzeugkasten“. Alles aus Termin 02 gilt weiter.
- Karte 1 „elif: mehr als zwei Wege“
  ```python
  sekunde = 32
  if sekunde < 30:
      print("Grün")
  elif sekunde < 35:
      print("Gelb")
  else:
      print("Rot")
  ```
  Ausgabe `Gelb`. `elif` hat eine Bedingung, `else` nicht. Das erste Ja gewinnt.
- Karte 2 „and und or: zwei Vergleiche verbinden“
  ```python
  groesse = 150
  alter = 9
  print(groesse >= 140 and alter >= 10)
  print(groesse >= 140 or alter >= 10)
  ```
  Ausgabe `False`, `True`. `and`: beide müssen stimmen. `or`: einer genügt. Links und rechts steht je ein vollständiger Vergleich.

**2 · Vorgerechnetes Beispiel: Getränkeautomat mit drei Wegen (5 Min).** Aufgabe: Die Cola kostet 1.50 Euro. Bei zu wenig Geld meldet der Automat „Zu wenig Geld“. Bei mehr Geld gibt er das Rückgeld mit zwei Nachkommastellen aus. Sonst passt es genau. Video „Vorgerechnet“. Art `run`, Eingabe `2`. Im Termin am Beamer: Plan und Code nebeneinander, je Weg ein Wert.

```text
Eingabe: geld
Entscheidung: geld < 1.5?
  ja:
    Ausgabe: "Zu wenig Geld"
  nein:
    Entscheidung: geld > 1.5?
      ja:
        rueckgeld = geld - 1.5
        Ausgabe: rueckgeld
      nein:
        Ausgabe: "Passt genau"
```

```python
# Getränkeautomat mit drei Wegen
geld = float(input("Eingeworfen in Euro: "))
if geld < 1.5:
    print("Zu wenig Geld")
elif geld > 1.5:
    rueckgeld = geld - 1.5
    print(f"Rückgeld: {rueckgeld:.2f} Euro")
else:
    print("Passt genau")
```

Eingabe 2: `Rückgeld: 0.50 Euro`. Eingabe 1: `Zu wenig Geld`. Eingabe 1.5: `Passt genau`.
Schritte: (1) Die drei Fälle aufschreiben: zu wenig, zu viel, genau passend. Zwei Fragen genügen. (2) Die erste Raute wird `if`. (3) Die Raute im nein-Weg wird `elif`. (4) Der Rest wird `else`: weder kleiner noch größer, also genau 1.5. (5) Im Plan steht nur „Ausgabe: rueckgeld“. Wie die Zahl aussieht, legt der f-String aus Termin 02 fest. (6) Probe mit einem Wert je Weg: 1, 2 und 1.5. (7) Selbsterklärung: Was passiert bei 1.5, wenn du die zweite Bedingung in `geld >= 1.5` änderst? (`Rückgeld: 0.00 Euro`; „Passt genau“ erscheint nie mehr.)

**3 · Ablauf verfolgen: drei Wege (5 Min; im Termin nicht einzeln).** Art `trace`. Ein Spiel: Ab 100 Punkten Stufe 3, ab 50 Punkten Stufe 2, sonst Stufe 1. In der Aufgabenstellung steht: In den Zeilen mit `if` und `elif` trägst du in die Spalte Bedingung True oder False ein, ohne Anführungszeichen. Im Termin: gemeinsam am Beamer per Zuruf, wenn die Reserve des Blocks übrig ist (2 bis 3 Minuten, nur die Schritte in Zeile 4 und 6); sonst zu Hause vor dem Training. Dieselbe Fertigkeit prüft im Selbstcheck die Frage „Ausgabe bestimmen: drei Wege“.

```python
punkte = 40
bonus = 30
punkte = punkte + bonus
if punkte >= 100:
    stufe = 3
elif punkte >= 50:
    stufe = 2
else:
    stufe = 1
print(punkte, stufe)
```

Spalten `punkte`, `bonus`, `stufe`, `Bedingung`. Schritte:
- Zeile 1: punkte = 40 · Zeile 2: bonus = 30 · Zeile 3: punkte = 70.
- Zeile 4: Bedingung = False. Text des Schritts (`frage`): Zeile 4 prüft die Bedingung. Trag True oder False ein, wie Python es schreibt: großer Anfangsbuchstabe, ohne Anführungszeichen. Hinweis: 70 >= 100 ist falsch. Schreib True oder False wie Python, ohne Anführungszeichen.
- Zeile 6: Bedingung = True. Text des Schritts wie bei Zeile 4, mit Zeile 6. Hinweis: 70 >= 50 ist wahr. Schreib True, ohne Anführungszeichen.
- Zeile 7: stufe = 2.
- Zeile 10: Ausgabe `70 2`. Hinweis: Die Zeilen 8 und 9 werden übersprungen.

**4 · Plan zeichnen: Freibad mit drei Preisen (★★, 10 Min).** Art `pap-zeichnen`, erlaubt `in,out,op,if`. Die Eingabe und die Ausgabe stehen schon im Editor (Startvorgabe), du ergänzt die Entscheidungen. Text: Eingelesen wird das Alter (ganze Zahl). Kinder unter 6 zahlen 0 Euro, alle anderen unter 18 zahlen 3 Euro, Erwachsene 5 Euro. Ausgegeben wird der Preis.
Lösung: Eingabe alter (int) · Raute `alter < 6` · ja: `preis = 0` · nein: Raute `alter < 18` · ja: `preis = 3` · nein: `preis = 5` · Ausgabe preis.
Tests: 4 ergibt 0 · 6 ergibt 3 · 17 ergibt 3 · 18 ergibt 5 · 40 ergibt 5.
Tipps: (1) Schreib die drei Fälle auf: unter 6, 6 bis 17, ab 18. (2) Die zweite Raute kommt in den nein-Weg der ersten, als einziges Symbol dort. (3) Im nein-Weg weißt du schon: Das Kind ist mindestens 6. Es genügt die Frage alter < 18.

**5 · Zeilen ordnen: Automat mit Flaschen (4 Min).** Art `parsons`. Die Cola kommt nur, wenn das Geld reicht und noch eine Flasche im Fach ist. Plan: Eingabe geld · Eingabe flaschen · Raute `geld >= 1.5 and flaschen > 0?` · ja: Ausgabe "Cola kommt" · nein: Ausgabe "Geld zurück".
Lösung:
```python
geld = float(input("Eingeworfen in Euro: "))
flaschen = int(input("Flaschen im Fach: "))
if geld >= 1.5 and flaschen > 0:
    print("Cola kommt")
else:
    print("Geld zurück")
```
Zeilen, die nicht dazugehören: `if geld >= 1.5 or flaschen > 0:` und `if geld >= 1.5 and > 0:`.

**6 · Lücken füllen: Schere-Stein-Papier (8 Min).** Art `gap`. Gespielt wird mit Zahlen: 1 = Schere, 2 = Stein, 3 = Papier. Schere schneidet Papier, Stein schlägt Schere, Papier wickelt Stein ein. Der Plan steht vollständig darüber (vier Rauten in einer Kette, im waagerecht scrollbaren Rahmen): `ich == du?` ja: Unentschieden · nein: `ich == 1 and du == 3?` ja: Ich gewinne · nein: `ich == 2 and du == 1?` ja: Ich gewinne · nein: `ich == 3 and du == 2?` ja: Ich gewinne · nein: Du gewinnst. Lesen musst du nur das Muster der ersten beiden Rauten. Kommentare stehen als eigene Zeile, wie in Termin 01 eingeführt.

```text
# Schere-Stein-Papier: 1 = Schere, 2 = Stein, 3 = Papier
ich = int(input("Ich wähle (1, 2 oder 3): "))
du = int(input("Du wählst (1, 2 oder 3): "))
if ich @@==@@ du:
    print("Unentschieden")
@@elif@@ ich == 1 @@and@@ du == 3:
    # Schere schneidet Papier
    print("Ich gewinne")
elif ich == 2 and du == @@1@@:
    # Stein schlägt Schere
    print("Ich gewinne")
elif ich == 3 and du == 2:
    # Papier wickelt Stein ein
    print("Ich gewinne")
@@else@@:
    print("Du gewinnst")
```

Tests (ich, du; geprüft wird die letzte Zeile, und es darf nur eine Ergebniszeile geben): 1, 3 ergibt Ich gewinne · 2, 1 ergibt Ich gewinne · 3, 2 ergibt Ich gewinne · 2, 2 ergibt Unentschieden · 1, 2 ergibt Du gewinnst · 3, 1 ergibt Du gewinnst. Nachgerechnet: alle 9 Kombinationen stimmen; `or` statt `and`, `if` statt `elif` und eine falsche Zahl in Lücke 4 fallen in den Tests auf.
Tipps: (1) Lücke 1: Unentschieden heißt, beide haben dasselbe gewählt. Welches Zeichen fragt, ob zwei Werte gleich sind? (2) Lücke 2 und 5: Nach dem `if` kommen weitere Fragen, am Ende der Rest. Karte 1 zeigt die beiden Wörter. Lücke 3: Beide Vergleiche müssen stimmen. (3) Lücke 4: Stein (2) schlägt Schere. Welche Zahl hat die Schere?
Danach zu zweit: Zählt „Schere, Stein, Papier“ und zeigt die Hand. Tragt eure beiden Zahlen ins Feld „Eingaben“ ein: Das Programm ist der Schiedsrichter. Eine Runde. Frage zum Schluss: Was passiert, wenn jemand 7 eintippt, und warum? (Du gewinnst: `else` nimmt den Rest.)

**7 · Erste eigene Aufgabe: Pizza-Lieferung (★, 8 Min).** Art `code`. Text: Die Lieferung ist gratis, wenn der Bestellwert mindestens 20 Euro beträgt und die Entfernung höchstens 5 km. Sonst kostet sie 3 Euro. Eingelesen werden zuerst der Bestellwert, dann die Entfernung (beides Kommazahlen). Ausgegeben wird `Lieferung gratis` oder `Lieferung 3 Euro`.
Plan: Eingabe wert · Eingabe km · Raute `wert >= 20 and km <= 5?` · ja: Ausgabe "Lieferung gratis" · nein: Ausgabe "Lieferung 3 Euro".
Lösung:
```python
wert = float(input("Bestellwert in Euro: "))
km = float(input("Entfernung in km: "))
if wert >= 20 and km <= 5:
    print("Lieferung gratis")
else:
    print("Lieferung 3 Euro")
```
Tests (wert, km): 25, 3 ergibt Lieferung gratis · 20, 5 ergibt Lieferung gratis · 15, 3 ergibt Lieferung 3 Euro · 25, 8 ergibt Lieferung 3 Euro · 10, 10 ergibt Lieferung 3 Euro.
Tipps: (1) Fünf Symbole, sechs Zeilen. (2) In der Raute stehen zwei vollständige Vergleiche. (3) Beide müssen stimmen: Welches Wort verbindet sie?
Für Schnelle: Ab 40 Euro ist die Lieferung immer gratis, egal wie weit. Bau das als erste Frage davor (`if`, dann `elif`).

**8 · Fehler finden: Freibad-Kasse (6 Min).** `Fehlersuche`, Fehler in Zeile 2 und 6. Text: Kinder unter 6 und alle ab 65 zahlen nichts. Wer sonst unter 18 ist, zahlt 3 Euro, alle anderen 5 Euro. Bei 70 wird „Eintritt frei“ erwartet. In zwei Zeilen steckt ein Fehler.

```text
alter = int(input("Alter: "))
if alter < 6 and alter >= 65:
    print("Eintritt frei")
elif alter < 18:
    print("3 Euro")
else alter >= 18:
    print("5 Euro")
```

Fehler 1 (Zeile 6), meldet Python: `else` hat nie eine Bedingung. Die Meldung lautet `SyntaxError: expected ':'`, obwohl am Ende ein Doppelpunkt steht: Python erwartet ihn direkt hinter `else`. Fehler 2 (Zeile 2), findest nur du: Im Satz steht „und“, gemeint ist ODER. Mit A = „unter 6“ und B = „ab 65“ kommt die Zeile 1 1 der Tabelle nie vor, denn niemand ist beides zugleich. Mit UND ist die Bedingung also nie wahr. Bei 70 ist A falsch und B wahr: UND ergibt falsch, das Programm landet bei „5 Euro“. Richtig (`data-stdin="70"`):

```python
alter = int(input("Alter: "))
if alter < 6 or alter >= 65:
    print("Eintritt frei")
elif alter < 18:
    print("3 Euro")
else:
    print("5 Euro")
```

Probe: 70, 65 und 4 ergeben Eintritt frei, 6 und 12 ergeben 3 Euro, 18 und 30 ergeben 5 Euro.

## G. Labor Teil B (Training, 5 Aufgaben, 38 Minuten)

Zu Hause zusammen 45 Minuten: Selbstcheck (7), Training (38). Wurde Station 3 nicht gemeinsam verfolgt, kommen ihre 5 Minuten dazu.

1. **Wahrheitstabelle ausfüllen** (★, 6 Min, `trace` als Tabelle, ohne Spalte „Ausgabe“). A ODER (NICHT B). Erst auf Papier, dann hier prüfen. In der Aufgabenstellung steht: Trag in jedes Feld 0 oder 1 ein, ohne Anführungszeichen. Spalten „NICHT B“ und „A ODER (NICHT B)“. Lösung, Zeilen 00 bis 11: Hilfsspalte 1, 0, 1, 0; Ergebnis 1, 0, 1, 1. Text jedes Schritts, am Beispiel der ersten Zeile: Zeile A = 0, B = 0: Trag in beide Felder 0 oder 1 ein, ohne Anführungszeichen. Hinweis je Zeile: Erst die Klammer: NICHT B dreht B um. Dann: Ist A wahr oder die Klammer? Schreib 0 oder 1, ohne Anführungszeichen. Wird das Warm-up von Termin 04 (auf Papier).
2. **Plan zeichnen: Paketporto mit drei Stufen** (★★, 8 Min, `pap-zeichnen`, erlaubt `in,out,op,if`). Eingelesen wird das Gewicht in Kilogramm (Kommazahl). Bis einschließlich 2 kg kostet das Paket 5 Euro, bis einschließlich 10 kg 8 Euro, darüber 15 Euro. Ausgegeben wird das Porto. Lösung: Eingabe gewicht (float) · Raute `gewicht <= 2` · ja: `porto = 5` · nein: Raute `gewicht <= 10` · ja: `porto = 8` · nein: `porto = 15` · Ausgabe porto. Tests: 1 ergibt 5 · 2 ergibt 5 · 2.5 ergibt 8 · 10 ergibt 8 · 12 ergibt 15.
   Tipps: (1) Schreib die drei Fälle auf: bis 2 kg, über 2 bis 10 kg, über 10 kg. Zwei Fragen genügen. (2) Die zweite Raute kommt in den nein-Weg der ersten, als einziges Symbol dort. (3) Im nein-Weg weißt du schon: Das Paket ist schwerer als 2 kg. Es genügt die Frage gewicht <= 10.
3. **Plan in Code übertragen: Würfelglück** (★★, 8 Min, `klausur`). Plan: Eingabe wurf (ganze Zahl) · Raute `wurf == 1 or wurf == 6?` · ja: Ausgabe "Nochmal würfeln" · nein: Ausgabe "Der Nächste ist dran". Tests: 1 und 6 ergeben Nochmal würfeln, 3 ergibt Der Nächste ist dran. Schema (je 1 Punkt): Eingabe mit `int(input(…))` · zwei vollständige Vergleiche mit `==` · mit `or` verbunden, Doppelpunkt am Ende · `else:` und beide Wege eingerückt.
   ```python
   wurf = int(input("Dein Wurf: "))
   if wurf == 1 or wurf == 6:
       print("Nochmal würfeln")
   else:
       print("Der Nächste ist dran")
   ```
4. **Fehler finden und beheben: Blitzer** (★★, 6 Min, `code`). Erlaubt sind 50 km/h. Bis 70 gibt es eine Verwarnung, darüber ein Bußgeld. Zwei Fehler: einer, den Python meldet, einer, den du nur mit einer Probe findest. Probier 80.
   Vorlage:
   ```python
   # Blitzer: Erlaubt sind 50 km/h.
   tempo = int(input("Tempo in km/h: "))
   if tempo > 50:
       print("Verwarnung")
   elif tempo > 70:
       print("Bußgeld")
   else:
       print("Alles in Ordnung)
   ```
   Lösung: In Zeile 8 fehlt das zweite Anführungszeichen (`SyntaxError: unterminated string literal`). Die Fragen stehen in der falschen Reihenfolge: Bei 80 ist schon `tempo > 50` wahr, „Bußgeld“ kommt nie. Die strengere Frage muss zuerst kommen.
   ```python
   # Blitzer: Erlaubt sind 50 km/h.
   tempo = int(input("Tempo in km/h: "))
   if tempo > 70:
       print("Bußgeld")
   elif tempo > 50:
       print("Verwarnung")
   else:
       print("Alles in Ordnung")
   ```
   Tests: 80 und 71 ergeben Bußgeld · 70 und 60 ergeben Verwarnung · 50 ergibt Alles in Ordnung.
   Tipps: (1) Führ das Programm aus und lies die Fehlermeldung von unten: In welcher Zeile fehlt ein Zeichen? (2) Läuft das Programm, probier 80: Laut Aufgabe gibt es über 70 ein Bußgeld. Was gibt dein Programm aus? (3) Gefragt wird von oben nach unten, das erste Ja gewinnt. Welche Frage muss zuerst kommen: tempo > 50 oder tempo > 70?
5. **Zahlenraten mit Hinweis** (★★★, 10 Min, `code`, ohne Plan; erst auf Papier zeichnen). Die geheime Zahl ist 7. Das Programm liest einen Tipp ein (ganze Zahl) und gibt `Treffer`, `Zu niedrig` oder `Zu hoch` aus. Tests: 7 ergibt Treffer · 3 ergibt Zu niedrig · 9 ergibt Zu hoch.
   ```python
   tipp = int(input("Dein Tipp: "))
   if tipp == 7:
       print("Treffer")
   elif tipp < 7:
       print("Zu niedrig")
   else:
       print("Zu hoch")
   ```
   Tipps: (1) Zeichne zuerst den Plan: drei Ausgaben, also zwei Rauten. Die zweite steht im nein-Weg der ersten. (2) Erste Frage: tipp == 7? Im nein-Weg weißt du schon, dass der Tipp nicht 7 ist. Eine Frage genügt, um „zu niedrig“ und „zu hoch“ zu trennen. (3) Die Form steht auf Karte 1: if, elif, else. Für „Zu hoch“ brauchst du keine eigene Bedingung.

## H. Videos (je etwa 2 bis 2,5 Minuten, je fünf Szenen)

**Theorie (Lerneinheit, Abschnitt 1): „Und, oder: die Wahrheitstabelle“**
1. Der Automat aus Termin 02: Die Cola kommt nur, wenn das Geld reicht UND eine Flasche da ist. Zwei Aussagen A und B erscheinen.
2. Vier Kombinationen, vier Zeilen: 00, 01, 10, 11. Die Spalte A UND B füllt sich: nur in der letzten Zeile eine 1.
3. Das Museum mit „unter 18 ODER Ausweis“: Die ODER-Spalte hat drei Einsen, auch wenn beides stimmt.
4. Beide Spalten nebeneinander: UND ist streng, ODER ist großzügig.
5. Ausblick: Nach der Pause stehen UND und ODER in der Raute.

**Python-Werkzeugkasten (Labor, Station 1): „elif, and, or“**
1. Zwei Karten; die Karten aus Termin 02 liegen blass dahinter: Alles von dort gilt weiter.
2. Karte 1: Zwischen `if` und `else` schiebt sich eine Zeile `elif` für die dritte Farbe der Ampel.
3. Ein Lauf mit Sekunde 32: Die erste Frage wird mit nein beantwortet, die zweite mit ja, `else` wird übersprungen.
4. Karte 2: zwei vollständige Vergleiche, dazwischen `and`; mit 150 und 9 wird aus wahr und falsch ein `False`.
5. Dieselbe Zeile mit `or`: Jetzt genügt der eine wahre Vergleich, `True`.

**Vorgerechnet (Labor, Station 2): „Getränkeautomat mit drei Wegen“**
1. Der Automat aus Termin 02 kann zwei Fälle; jetzt werden drei Fälle untereinander aufgeschrieben.
2. Im Plan entsteht die erste Raute `geld < 1.5?`; in ihren nein-Weg kommt die zweite Raute `geld > 1.5?`. Was übrig bleibt, ist „Passt genau“.
3. Plan und Code nebeneinander: erste Raute `if`, zweite Raute `elif`, Rest `else`.
4. Das Rückgeld wird mit dem f-String ausgegeben, wie in Termin 02.
5. Probe mit 2 Euro im Bild; im Plan leuchtet der mittlere Weg. Auftrag: Probier selbst 1 und 1.5, je Weg ein Wert.

Abschnitt 4 hat kein eigenes Video; die Tabelle mit Hilfsspalte wird im Termin an der Tafel vorgerechnet.

## I. Ablaufplan für den Dozenten

Jeder 30-Minuten-Block verplant höchstens 28 Minuten. Die Minuten eines Abschnitts enthalten das Zeigen der genannten Karte.

| Minuten | Wo | Was |
|---|---|---|
| 0–10 | Papier, Beamer | **Warm-up.** „Ablauf verfolgen: Gutschein“ auf Papier, Auflösung `25 5`. Rückblick: eine Frage, zwei Wege, Doppelpunkt, Einrückung. |
| 10–40 | Lerneinheit 1 | **Theorie 1: und, oder.** Automat (UND) und Museum (ODER), 1 und 0 als Schreibweise. Baustein „Zwei Schalter, zwei Lampen“ mit Vermutung. Alle schreiben beide Tabellen einmal aus dem Kopf auf Papier, Nachbar vergleicht. Vorhersage „Beides stimmt“. |
| 40–70 | Lerneinheit 2, Labor 1 (Karte 1), 2, 4 | **Programmieren 1: drei Wege, Plan zuerst.** Ampel-Plan mit zwei Rauten, Baustein „Welche Fragen werden gestellt?“, daneben `elif` mit Karte 1, Vorhersage (13). Automat mit drei Wegen am Beamer: Plan und Code nebeneinander, je Weg ein Wert (5). Alle zeichnen „Freibad mit drei Preisen“ (10). Verplant: 28. Station 3 läuft nicht einzeln: gemeinsam per Zuruf, wenn die Reserve übrig ist, sonst zu Hause. |
| 70–80 | – | **Pause.** |
| 80–110 | Lerneinheit 3, Labor 1 (Karte 2), 5, 6, 7 | **Programmieren 2: and und or.** Achterbahn mit Rückgriff auf die Tabellen aus dem Theorie-Block, Karte 2, Vorhersage „Ein Wort anders“ (8). Zeilen ordnen (4). Schere-Stein-Papier als Lückentext, dann eine Runde zu zweit (8). Eigene Aufgabe (8). Rundgang: unvollständiger Vergleich hinter `and`, `and` und `or` verwechselt. Verplant: 28. |
| 110–135 | Lerneinheit 4, Labor 8 | **Theorie 2: Wahrheitstabelle ausfüllen.** Drei Schritte, Joggen-Tabelle an der Tafel vorrechnen (7). Alle füllen NICHT (A ODER B) auf Papier aus und prüfen in der Übung (7). „Freibad-Kasse“ gemeinsam, den Fehler mit der Tabelle begründen (6). Auftrag für zu Hause, Pflicht, zusammen 45 Minuten: Selbstcheck und Training. Termin 04 beginnt mit der Tabelle aus dem Training. |

Wenn die Zeit trotzdem knapp wird: Im Block 40–70 wird Station 2 nur gezeigt (Plan und Code auf der Seite, ein Lauf mit 2); der Plan wird gezeichnet. Im Block 80–110 entfällt zuerst das Spiel zu zweit, dann wird Station 7 die erste Trainingsaufgabe. Im letzten Block hat die Tabelle Vorrang vor Station 8.

---

# Bewusst weggelassen

**Logik**
- ~~De Morgan, XOR, NAND, Gleichwertigkeit von Ausdrücken: für die Klausurform „Tabelle ausfüllen“ nicht nötig.~~ Überholt am 2026-11-26: Gleichwertigkeit und De Morgan kommen in Termin 04, XOR in Termin 06 (T4). NAND bleibt weg.
- Das Umformen von Vergleichen mit NICHT (das Gegenteil von `>=` ist `<`) und die Selbstcheck-Frage „Das Gegenteil finden“: eine eigene, fehleranfällige Fertigkeit; sie machte den Theorie-Block von Termin 02 zu voll. NICHT gibt es dort nur als Tabelle mit zwei Zeilen an einem Alltagssatz.
- ~~Vorrangregeln (NICHT vor UND vor ODER): Stattdessen stehen immer Klammern.~~ Überholt am 2026-11-26: Der Vorrang UND vor ODER kommt in Termin 04. In Termin 02 und 03 stehen weiter immer Klammern.
- ~~Tabellen mit drei Aussagen (acht Zeilen): zwei Aussagen sicher zu können ist das Ziel; mehr passt nicht in 25 Minuten.~~ Überholt am 2026-11-26: Tabellen mit drei Aussagen (8 Zeilen) kommen im zweiten Theorie-Block von Termin 03, vier Aussagen (16 Zeilen) in Termin 04.
- Kurzschluss-Auswertung, Schaltungen, Gatter, Kontaktplan, Bezug zu Bits.

**Python**
- `not` und `!=`: Im Programm braucht man sie erst bei den Schleifen (`while tipp != geheim`). NICHT gibt es bis dahin nur in der Wahrheitstabelle. So wird kein Konstrukt eingeführt, das danach keine Aufgabe benutzt.
- `=` gegen `==` im Theorie-Block von Termin 02: steht in Abschnitt 3 und auf Karte 1, wo `==` zum ersten Mal im Programm vorkommt.
- Text vergleichen (`farbe == "rot"`, Groß- und Kleinschreibung): wäre in Termin 03 ein zweiter Kerninhalt neben `elif`. Die Ampel schaltet deshalb nach der Uhr, Schere-Stein-Papier wird mit 1, 2, 3 gespielt. Das ist auch am Tablet tippfest.
- `and` und `or` gemischt in einer Bedingung, verkettete Vergleiche (`1 <= x <= 10`).
- `if` ohne `else` und `if` im ja-Weg: kommen, wenn die Schleifen sie brauchen. Rauten stehen nur im nein-Weg, also immer `elif`.
- Wahrheitswerte in Variablen (`fertig = True`), `bool()`, Wahrheitswert von Zahlen und Text.
- Die Rundungsfalle bei `==` mit Kommazahlen (Termin 07). In Aufgaben steht `==` nur bei ganzen Zahlen.
- Kommentare am Zeilenende: Eingeführt ist der Kommentar nur als ganze Zeile.
- `%`, `round()`, `.lower()`, weitere Formatangaben (`:.1f`, `:.0f`), Rechnen in `{}`, `sep`/`end`, Text mit `+` verbinden.

**Aufbau und Umfang**
- Zweite Vorhersage je Abschnitt: Jede kostet im Termin 2 bis 3 Minuten. Es bleibt bei einer je Abschnitt.
- Tabellen-Trainer als Baustein: Er war eine verkappte Aufgabe. Die Tabelle wird stattdessen als gezählte Aufgabe mit dem vorhandenen Typ `trace` geübt (Lerneinheit, Training, Warm-up Termin 04).
- Dritter Baustein je Termin: Die Code-Abschnitte nutzen „Schritt für Schritt“ am Codeblock.
- Dritte Werkzeugkasten-Karte in Termin 03, zweites Beispiel für `or` im Abschnitt, Theorie-Video zu Abschnitt 4.
- „Unter 6 und ab 65“ (im Satz „und“, gemeint ODER) steht nur noch an einer Stelle, in der Fehlersuche Freibad-Kasse.
- Der fertige Automat mit Rückgeld und f-String in Termin 02: mischte den neuen f-String sofort mit `if`/`else`. Der f-String wird am geraden Programm „Verdienst im Nebenjob“ geübt; die Kombination kommt in der Fehlersuche am Ende des Termins, im Training und in Termin 03.
- Die Trainingsaufgaben „Stempelkarte“ (Termin 02) und „Freibadwetter“ (Termin 03): Sie wiederholten fast die erste eigene Aufgabe des Termins (Jacke oder T-Shirt, Pizza-Lieferung). Dafür haben die übrigen Aufgaben die Zeiten von Termin 01.
- Die Selbstcheck-Frage „Bedingung finden“ (Termin 03): Sie prüfte fast dasselbe wie „Zwei Bedingungen“. An ihrer Stelle steht „Plan lesen: drei Wege“.
- Im Termin: Station 6 in Termin 02 (derselbe Automat wie in der Lerneinheit, wird Hausaufgabe), Station 3 einzeln in Termin 03, zwei der drei Runden Schere-Stein-Papier. So bleiben in jedem Block mindestens 2 Minuten frei.
- Geänderte Stationsreihenfolge und eine neunte Station: Die Reihenfolge von Termin 01 bleibt als festes Ritual.
- Schere-Stein-Papier gegen den Computer: braucht Zufallszahlen.
- Alle Maschinenbau-Beispiele, Wissens-Ampel, KI-Spiegel, Deep Dive.
