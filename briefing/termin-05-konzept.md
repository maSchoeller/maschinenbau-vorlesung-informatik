# Termin 05 · Konzeptvorschlag zur Abstimmung (2026-11-26)

Stand: Vorschlag, noch nicht entschieden. Nach der Abstimmung wird daraus `termin-05-zuschnitt.md` im Format von Termin 04.

Rahmen aus `kurs.yaml`: Termin 05 = T3 Zahlensysteme (1 Block) + P3 Schleifen (3 Blöcke). Termin 06 = T3 (1) + T4 Bitoperationen und XOR (1) + P3 (2). Von P3 sind 2 der 7 Blöcke erledigt (Termin 04: `while`, Countdown, Eingabe wiederholen bis gültig).

Pflicht laut Modulhandbuch: „Zahlensysteme (dezimal, binär, hexadezimal)“. Klausurform: kleine Rechenaufgaben (umrechnen).

## Was es im alten Kurs gab (alte V02 „Bits, Binär, Hex“)

Stellenwerte, dezimal/binär/hex, Divisionsrestverfahren, Bit und Byte, 2ⁿ Werte, Vorzeichen, Zweierkomplement, Überlauf am Zahlenkreis, Hex als Kurzschrift für Vierergruppen, Präfixe 0x und 0b. Für zwei Blöcke ist das zu viel. Die Migration hatte schon „ohne Zweierkomplement-Rechnen“ festgelegt.

## Vorschlag: Aufteilung der Zahlensysteme

| Termin | Inhalt |
|---|---|
| 05 | **Binär.** Stellenwertsystem, binär → dezimal, dezimal → binär, Bit, Byte, n Bit ergeben 2ⁿ Werte |
| 06 | **Hexadezimal.** Ziffern A bis F, binär ↔ hex über Vierergruppen, hex → dezimal (zweistellig), Präfixe 0x und 0b. Danach T4 Bitoperationen und XOR |

Brücke zur Logik: Die Zeilen einer Wahrheitstabelle sind schon binäres Zählen (000, 001, …, 111). Darum hat eine Tabelle mit 3 Variablen 2³ = 8 Zeilen und mit 4 Variablen 16. Das kennen die Studierenden aus Termin 03 und 04 und müssen es nur neu lesen.

## Vorschlag: Termin 05 im Ablauf

**Titel (Arbeitsname):** Genau so oft: Zweiersystem und Zählschleifen

| Minuten | Inhalt |
|---|---|
| 0–10 | Warm-up: die 16-Zeilen-Tabelle Y = (A ODER B) UND (C ODER D) aus dem Training (steht schon fest) |
| 10–40 | **T3 Teil 1: Das Zweiersystem.** Kerninhalte: (1) Stellenwert: 45 = 4·10 + 5·1; im Zweiersystem gelten 128, 64, 32, 16, 8, 4, 2, 1. (2) binär → dezimal: die Stellenwerte unter den Einsen addieren. (3) dezimal → binär mit der Stellenwerttabelle: von links die größte Zweierpotenz abziehen, die noch hineinpasst. (4) Bit und Byte, 8 Bit ergeben 256 Werte (0 bis 255). Brücke: Die Tabellenzeilen zählen binär. |
| 40–70 | **P3 Teil 3: Zählschleife mit `for` und `range`.** Der Countdown aus Termin 04 einmal als `while`, dann als `for`. `range(1, 6)` ergibt 1 bis 5, der Stoppwert gehört nicht dazu. `range(5)` ergibt 0 bis 4. Faustregel: Steht die Zahl der Durchläufe vorher fest, nimm `for`. Sonst nimm `while`. |
| 80–110 | **P3 Teil 4: Aufsummieren.** `summe = 0` vor der Schleife, im Rumpf n Messwerte einlesen und addieren, danach den Mittelwert ausgeben. Startwert, Rumpf, nach der Schleife: An welcher Stelle steht welche Zeile? |
| 110–135 | **P3 Teil 5: Auswählen im Rumpf.** `if` ohne `else` in der Schleife: zählen, wie viele Werte über einer Grenze liegen (Grenzfall `>` gegen `>=`). Danach der Auftrag für zu Hause. |

Alltagsbeispiele wie in Termin 04, z. B. Schritte pro Tag einer Woche, Einkaufszettel, Punkte einer Übungsrunde. Maschinenbau nur dort, wo es natürlich passt (z. B. Werkstücke einer Charge messen).

### Interaktive Bausteine (Vorschlag, 3)

1. **„Acht Schalter, ein Byte“** (T3): acht Kippschalter mit den Stellenwerten 128 bis 1 darüber, daneben der Dezimalwert. Umgekehrt lässt sich eine Zahl eingeben und die Stellenwerttabelle von links abarbeiten. Vermutung: Was zeigt das Byte, wenn alle Schalter an sind? (255)
2. **„range von Hand“** (P3): Start und Stopp einstellen. Der Baustein zeigt die Zahlenreihe, die Zahl der Durchläufe und dazu die gleichwertige `while`-Schleife. Vermutung: Wie viele Durchläufe hat `range(3, 8)`? (5)
3. **„Summe Schritt für Schritt“** (P3): eine Messreihe durchlaufen, dabei `summe`, `anzahl_ueber` und die bisherige Ausgabe beobachten. Mit Schalter „Startwert vergessen“ oder „`summe = 0` im Rumpf“ zeigt er die typischen Fehler.

### Im Plan

Die Zählschleife wird als Raute gezeichnet, so wie der Plan-Baustein sie schon kann: „i von 1 bis 5?“ mit Rücksprung. Einmal wird sie neben die `while`-Form mit eigenem Zähler gestellt (Startwert, Raute, Zähler erhöhen), damit klar ist, dass `for` dieselben drei Teile in eine Zeile packt.

### Knobelaufgaben (Ideen)

1. **Bits einlesen:** Acht Eingaben 0 oder 1, von links nach rechts. Gesucht ist die Dezimalzahl, und zwar ohne Stellenwerttabelle: `zahl = zahl * 2 + bit` in einer `for`-Schleife. Verbindet T3 und P3. Der Kniff mit „mal 2“ muss selbst gefunden werden.
2. **Reiskörner auf dem Schachbrett:** Auf Feld 1 liegt 1 Korn, auf jedem Feld doppelt so viele wie auf dem davor. Ab welchem Feld liegen auf einem Feld mehr als eine Million Körner, und wie viele sind es dann insgesamt? `while` mit zwei Variablen. Dahinter steckt 2ⁿ.

## Vorschlag: Was wegfällt

- **Zweierkomplement und negative Binärzahlen:** ganz raus (die Migration hatte schon „ohne Zweierkomplement-Rechnen“ festgelegt).
- **Wertebereich und Überlauf** (16-Bit-Zähler springt um): nicht in T3, sondern in T5 Datentypen (Termin 07), dort, wo es um „Welcher Datentyp reicht?“ geht. In T3 bleibt nur „8 Bit ergeben 256 Werte“.
- **Binär rechnen** (addieren, subtrahieren, Überträge): raus. Bitweises UND, ODER, XOR kommt in T4.
- **Oktal und andere Basen:** raus.
- **`bin()`, `hex()`, `int("1011", 2)`:** nicht in Termin 05. In Termin 06 eventuell als Werkzeug, mit dem man Ergebnisse von Hand nachprüft.
- **`%` und `//`** (bisher nicht eingeführt): nicht in Termin 05. Damit fällt auch das Divisionsrestverfahren als Schleife weg (siehe Frage 2).
- **`range` mit Schrittweite, verschachtelte Schleifen, `break`, `continue`:** nicht in Termin 05. Schrittweite und verschachtelte Schleifen kommen in Termin 06, `break` und `continue` bleiben draußen.

## Offene Fragen an dich

1. **Aufteilung:** Termin 05 nur binär, Termin 06 hex (Empfehlung) – oder beide Systeme schon in 05?
2. **Methode dezimal → binär:** Stellenwerttabelle (Zweierpotenzen von links abziehen; Empfehlung, weil dieselbe Tabelle für beide Richtungen dient) – oder das klassische Divisionsrestverfahren (durch 2 teilen, Reste von unten lesen) – oder beide?
3. **Was wegfällt:** wie oben vorgeschlagen (Zweierkomplement raus, Überlauf nach T5) – oder Zweierkomplement wenigstens lesen?
4. **Programmieren in 05:** `for`/`range`, Aufsummieren, `if` im Rumpf (Empfehlung) – oder zusätzlich `%` und `//`, damit „Umrechnen als Schleife“ (Divisionsrest) möglich wird?
