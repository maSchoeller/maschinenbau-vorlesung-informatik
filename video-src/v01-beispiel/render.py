"""V01 Vorgerechnet: Pruefprotokoll fuer einen Zugstab (Code = briefing/v01-beispiel.py). Aufruf: python render.py [text|stills t..|full|mux]"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
from ext import *
from sprechen import anzeige, sprechfassung, pruefen, tts
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v01-beispiel"; LABEL = "DHBW · Informatik · V01 · Prüfprotokoll Zugstab"
CODE = open(os.path.join(HERE, "..", "..", "briefing", "v01-beispiel.py"), encoding="utf-8").read().splitlines()
assert len(CODE) == 18

class Satz(tuple):
    """(Untertitel, Sprechfassung) mit Quelltext .q (Markup)."""

def S(t):
    """Ein Quelltext mit Markup: Untertitel = anzeige(t), Audio = tts(t) -> sprechfassung(t) (sprechen.py)."""
    r = Satz((anzeige(t), sprechfassung(t))); r.q = t
    return r

SECS = [
 [S("Heute rechnest du ein Prüfprotokoll vor: die Zugspannung in einem Rundstab."),
  S("Bekannt sind die Zugkraft von 12 000 Newton und der Durchmesser von 10 Millimetern."),
  S("Das Programm fragt nach Prüfer und Bauteil, berechnet Fläche und Spannung und gibt ein Protokoll aus."),
  S("Dafür reichen `print`, Variablen, Kommentare und `input` aus diesem Kapitel.")],
 [S("Die ersten beiden Zeilen sind Kommentare. Sie beginnen mit einer Raute und sagen, worum es geht."),
  S("In Zeile 4 und 5 liest `input` zwei Texte ein: den Namen der Prüferin oder des Prüfers und die Bauteil-Bezeichnung."),
  S("Der Text in den Klammern ist die Aufforderung, die Antworten landen in den Variablen [[pruefer|prüfer]] und `bauteil`."),
  S("Beides bleibt Text, damit wird nichts gerechnet.")],
 [S("Dann folgen die festen Werte: [[kraft_n|kraft n]] ist 12000, [[durchmesser_mm|durchmesser m m]] ist 10."),
  S("Die Einheit steckt im Namen und im Kommentar, so verwechselst du später nichts."),
  S("Pi ist hier eine Näherung: [[3,14159|drei Komma eins vier eins fünf neun]]."),
  S("Alle Zahlen stehen noch fest im Code. Zahlen einlesen lernst du in Lektion 3.")],
 [S("Jetzt wird gerechnet. Zeile 11 berechnet die Fläche: `pi * d * d / 4`."),
  S("Denk an die Zuweisung von rechts nach links: Erst wird die rechte Seite ausgerechnet, dann bekommt [[flaeche_mm2|fläche m m zwei]] das Ergebnis."),
  S("Zeile 12 teilt die Kraft durch die Fläche und speichert die Spannung."),
  S("Die Fläche liegt in Quadratmillimetern vor, also kommt Newton pro Quadratmillimeter heraus, das sind Megapascal."),
  S("Die Reihenfolge zählt: Die Fläche muss existieren, bevor du sie benutzt.")],
 [S("Zum Schluss folgen fünf [[print-Zeilen|print Zeilen]]."),
  S("Die erste gibt die Überschrift aus."),
  S("Die nächsten vier haben je zwei Argumente, einen Text und eine Variable. `print` setzt dazwischen ein Leerzeichen."),
  S("So landen Prüfer, Bauteil, Fläche und Spannung im Protokoll.")],
 [S("Jetzt der Probelauf. Als Prüfer gibst du Max Mustermann ein, als Bauteil Welle W siebzehn."),
  S("Danach läuft der Rest ohne weitere Eingabe, Zeile für Zeile."),
  S("Die Fläche beträgt [[78,53975|achtundsiebzig Komma fünf drei neun sieben fünf]] Quadratmillimeter."),
  S("Die Spannung beginnt mit [[152,78887|hundertzweiundfünfzig Komma sieben acht acht acht sieben]], danach folgen noch viele weitere Stellen, in Megapascal.")],
 [S("Jetzt der wichtigste Schritt: Passt das Ergebnis? Im Kopf überschlägst du 12 000 durch rund 80, das sind etwa 150."),
  S("Unser Ergebnis liegt bei etwa 153 Megapascal, die Größenordnung stimmt."),
  S("Das passt zu Baustahl [[S235|S zwei drei fünf]]: Die Streckgrenze liegt bei 235 Megapascal, der Stab bleibt also darunter."),
  S("Die vielen Nachkommastellen formatieren wir in Lektion 3."),
  S("Ein Ergebnis wie 0,153 oder 150 000 Megapascal würde dir dagegen sofort auffallen.")],
]

def rise(f, t, ti, fn):
    f.el(ap(t, ti, 0.5), fn, dy=int((1 - ap(t, ti, 0.5)) * 12))

# ---------------------------------------------------------------- Code-Szenen
CS, CLH, CX, CW, CY = 20, 27, 90, 1100, 94
CPS = 70
for _l in CODE: assert fits_mono(_l, CS, CW - 62 - 20), _l

def seq(idxs, start, gap=0.1):
    out = {}; c = start
    for i in idxs:
        out[i] = c; c += len(CODE[i]) / CPS + gap
    return out

def draw_code(f, t, tm, hl):
    times = [tm.get(i, 1e9) for i in range(len(CODE))]
    f.el(ap(t, 0.0, 0.3), lambda d, dy: code_panel(d, CX, CY + dy, CW, CODE, times, t, CS, CPS, hl=hl, dim_others=bool(hl), lh=CLH))

def captions(f, t, ct, caps):
    for i, tx in enumerate(caps):
        if tx is None: continue
        t0 = ct(i); t1 = ct(i + 1) if i + 1 < len(caps) else 1e9
        a = ap(t, t0, 0.3) * (1 - ap(t, t1 - 0.1, 0.25))
        if a <= 0: continue
        def fn(d, dy, tx=tx):
            card(d, 90, 626 + dy, 1100, 56)
            sz = 28
            while F(sz, 600).getlength(tx) > 1030 and sz > 16: sz -= 1
            assert sz >= 22, tx
            T(d, 120, 654 + dy, tx, F(sz, 600), DARK, "lm")
        f.el(a, fn, dy=int((1 - ap(t, t0, 0.3)) * 8))

def which(t, ct, spans):
    """spans: Liste (ab Satz, Zeilenmenge) -> aktuelle Menge."""
    cur = set()
    for si, s in spans:
        if t >= ct(si): cur = s
    return cur

ALL = lambda a, b: set(range(a, b + 1))
FULLY = lambda idxs: {i: -1 for i in idxs}

def sc2(f, t, ct):
    heading(f, t, "Abschnitt 1: Kommentare und Eingaben")
    tm = {}; tm.update(seq([0, 1], ct(0) + 0.3)); tm.update(seq([3, 4], ct(1) + 0.3))
    hl = which(t, ct, [(0, {0, 1}), (1, {3, 4}), (3, {3, 4})])
    draw_code(f, t, tm, hl)
    captions(f, t, ct, ["Kommentare: beginnen mit #, Python ignoriert sie", "input liest zwei Texte ein",
                        "Aufforderung in Klammern, Antwort in pruefer und bauteil", "Beides sind Texte: damit wird nicht gerechnet"])

def sc3(f, t, ct):
    heading(f, t, "Abschnitt 2: feste Werte")
    tm = FULLY([0, 1, 3, 4]); tm.update(seq([6, 7, 8], ct(0) + 0.5))
    hl = which(t, ct, [(0, {6, 7, 8}), (1, {6, 7}), (2, {8}), (3, {6, 7, 8})])
    draw_code(f, t, tm, hl)
    captions(f, t, ct, ["Feste Werte: Kraft, Durchmesser, Pi", "Einheit im Namen und im Kommentar: kraft_n, durchmesser_mm",
                        "pi = 3.14159 ist eine Näherung", "Noch alles fest im Code: Zahlen einlesen in V03"])

def sc4(f, t, ct):
    heading(f, t, "Abschnitt 3: rechnen")
    tm = FULLY([0, 1, 3, 4, 6, 7, 8]); tm.update(seq([10], ct(0) + 0.6)); tm.update({11: ct(2) - 0.4})
    hl = which(t, ct, [(0, {10}), (2, {11}), (4, {10, 11})])
    draw_code(f, t, tm, hl)
    captions(f, t, ct, ["Zeile 11: A = π · d · d / 4, rechts zuerst, dann speichern", "Rechte Seite wird berechnet, flaeche_mm2 bekommt das Ergebnis",
                        "Zeile 12: σ = F / A", "N / mm² = MPa", "Reihenfolge zählt: erst die Fläche, dann die Spannung"])

def sc5(f, t, ct):
    heading(f, t, "Abschnitt 4: Ausgabe")
    tm = FULLY(list(range(0, 12))); tm.update(seq([13, 14, 15, 16, 17], ct(0) + 0.5))
    hl = which(t, ct, [(1, {13}), (2, {14, 15, 16, 17})])
    draw_code(f, t, tm, hl)
    captions(f, t, ct, ["Fünf print-Zeilen geben das Protokoll aus", "Zeile 14: die Überschrift",
                        "Zeilen 15 bis 18: Text, Komma, Variable (je zwei Argumente)", "Prüfer, Bauteil, Fläche und Spannung stehen im Protokoll"])

# ---------------------------------------------------------------- freie Szenen
def sc1(f, t, ct):
    heading(f, t, "Die Aufgabe: Prüfprotokoll Zugstab")
    def rod(d, dy):
        card(d, 60, 130 + dy, 560, 300)
        T(d, 90, 146 + dy, "Rundstab unter Zug", F(28, 700), DARK)
        d.rectangle((190, 260 + dy, 470, 310 + dy), fill=(190, 198, 210), outline=DARK, width=3)
        arrow(d, 188, 285 + dy, 100, 285 + dy, RED, 7, 22); arrow(d, 472, 285 + dy, 560, 285 + dy, RED, 7, 22)
    rise(f, t, ct(0) + 0.3, rod)
    def vals(d, dy):
        T(d, 540, 254 + dy, "F = 12 000 N", F(26, 700), RED, "ms"); T(d, 330, 350 + dy, "Durchmesser d = 10 mm", F(28, 700), DARK, "ma")
        T(d, 330, 388 + dy, "gesucht: σ = F / A", F(24, 400), GREY, "ma")
    rise(f, t, ct(1) + 0.2, vals)
    rows = [("Eingabe", RED, "Prüfer und Bauteil (Texte)", 130), ("Verarbeitung", DARK, "Fläche A und Spannung σ", 262), ("Ausgabe", GREEN, "Prüfprotokoll mit fünf Zeilen", 394)]
    for k, (lab, col, body, y) in enumerate(rows):
        def fn(d, dy, lab=lab, col=col, body=body, y=y):
            d.rectangle((660, y + dy, 1220, y + 112 + dy), fill=WHITE, outline=DARK, width=2)
            d.rectangle((660, y + dy, 850, y + 112 + dy), fill=col)
            T(d, 755, y + 56 + dy, lab, F(30, 700), WHITE, "mm")
            TW(d, 870, y + 28 + dy, body, 26, 400, 330, DARK, 32)
        rise(f, t, ct(2) + 0.2 + k * 0.5, fn)
    rise(f, t, ct(3), lambda d, dy: pill(d, 160, 500 + dy, 960, 76, "print · Variablen · Kommentare · input", 38))

RUN = [(0.5, [("Name der Prüferin / des Prüfers: ", CODE_T), ("Max Mustermann", CODE_N)]),
       (1.0, [("Bauteil-Bezeichnung: ", CODE_T), ("Welle W-17", CODE_N)]),
       (None, O("Prüfprotokoll Zugstab")), (None, O("Prüfer: Max Mustermann")), (None, O("Bauteil: Welle W-17")),
       (None, O("Querschnitt A in mm²: 78.53975", CODE_G)), (None, O("Spannung in MPa: 152.78887442346073", CODE_G))]

def sc6(f, t, ct):
    heading(f, t, "Probelauf")
    times = [ct(0) + 2.2, ct(0) + 4.5, ct(1) + 0.6, ct(1) + 1.2, ct(1) + 1.8, ct(2) + 0.8, ct(3) + 0.8]
    ents = [(tm_, s if isinstance(s, list) else s) for tm_, (_, s) in zip(times, RUN)]
    for _, s in ents: assert fits_mono("".join(x for x, _ in s), 28, 1160 - 44)
    f.el(ap(t, 0.0, 0.3), lambda d, dy: console_panel(d, 60, 130 + dy, 1160, 350, ents, t, 28, lh=42))
    def tile(x, w, big, small, col, ti):
        def fn(d, dy):
            card(d, x, 506 + dy, w, 130); T(d, x + 28, 520 + dy, big, F(34, 700), col)
            TW(d, x + 28, 570 + dy, small, 24, 400, w - 56, GREY, 30)
        rise(f, t, ti, fn)
    tile(60, 370, "A = 78,53975 mm²", "π · 10 · 10 / 4 mit π = 3,14159", DARK, ct(2) + 1.2)
    tile(455, 370, "σ ≈ 152,79 MPa", "12 000 N / 78,53975 mm²", DARK, ct(3) + 1.2)
    tile(850, 370, "viele Stellen", "so viele Nachkommastellen sind unnötig", AMBER, ct(3) + 3.2)

def sc7(f, t, ct):
    heading(f, t, "Plausibilitätscheck")
    rise(f, t, ct(0) + 1.6, lambda d, dy: (card(d, 60, 130 + dy, 560, 120), T(d, 90, 142 + dy, "Überschlag im Kopf", F(26, 600), GREY), T(d, 90, 182 + dy, "12 000 / 80 ≈ 150 MPa", F(44, 700), DARK)))
    rise(f, t, ct(1), lambda d, dy: (card(d, 660, 130 + dy, 560, 120), T(d, 690, 142 + dy, "Programm", F(26, 600), GREY), T(d, 690, 182 + dy, "σ ≈ 153 MPa", F(44, 700), GREEN), check(d, 1150, 180 + dy, GREEN, 1.6)))
    X0, X1, Y = 120, 1110, 420
    def XV(v): return X0 + v / 300.0 * (X1 - X0)
    def scale(d, dy):
        y = Y + dy
        d.rectangle((X0, y - 18, XV(235), y + 18), fill=(205, 235, 217))
        d.line((X0, y, X1, y), fill=GREY, width=4)
        for v in (0, 100, 200, 300):
            d.line((XV(v), y - 12, XV(v), y + 12), fill=GREY, width=3); T(d, XV(v), y + 30, f"{v}", F(24, 400), GREY, "ma")
        T(d, X1 + 14, y, "σ in MPa", F(24, 400), GREY, "lm")
        d.polygon([(XV(153), y - 2), (XV(153) - 14, y - 38), (XV(153) + 14, y - 38)], fill=RED)
        d.ellipse((XV(153) - 20, y - 80, XV(153) + 20, y - 40), fill=RED); T(d, XV(153), y - 60, "σ", F(30, 700), WHITE, "mm")
    rise(f, t, ct(1) + 0.6, scale)
    def sg(d, dy):
        y = Y + dy
        d.line((XV(235), y - 60, XV(235), y + 20), fill=DARK, width=4)
        T(d, XV(235), y - 92, "Streckgrenze S235: 235 MPa", F(26, 700), DARK, "ms")
        T(d, XV(120), y + 110, "darunter: elastisch", F(28, 600), GREEN, "mm")
    rise(f, t, ct(2) + 0.4, sg)
    rise(f, t, ct(3), lambda d, dy: pill(d, 160, 570 + dy, 960, 70, "Nachkommastellen formatieren: V03", 34, DARK))
    def bad(d, dy):
        y = Y + dy
        d.ellipse((XV(0.153) - 8, y - 8, XV(0.153) + 8, y + 8), fill=RED)
        T(d, X0, y + 62, "0,153: viel zu klein", F(26, 700), RED, "la")
        T(d, X1, y + 62, "150 000: viel zu groß", F(26, 700), RED, "ra")
    rise(f, t, ct(4), bad)

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6, 7: sc7}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T(d, 90, 110, "V01 · Informatik", F(34, 600), GREY)
        T(d, 90, 160, "Vorgerechnet", F(104, 700), DARK)
        T(d, 90, 290, "Prüfprotokoll für einen Zugstab", F(52, 400), GREY)
        code_panel(d, 90, 390, 1000, [CODE[10], CODE[11], CODE[17]], [0, 0, 0], 9, 24, lineno=False)
        d.rectangle((190, 580, 470, 620), fill=(190, 198, 210), outline=DARK, width=3)
        arrow(d, 188, 600, 110, 600, RED, 7, 20); arrow(d, 472, 600, 550, 600, RED, 7, 20)
        T(d, 600, 600, "F = 12 000 N,  d = 10 mm", F(34, 700), DARK, "lm")
        T(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ("text", "tts"):
        tot = 0
        for i, sec in enumerate(SECS, 1):
            q = " ".join(x.q for x in sec); sp = sprechfassung(q); tot += len(sp)
            print(f"s{i} ({len(sp)} Z.)")
            for h in pruefen(q): print("  PRUEFEN:", h)
            if sys.argv[1] == "tts": tts(q, os.path.join(HERE, "audio", f"s{i}.mp3"))
            else: open(os.path.join(HERE, "audio", f"s{i}.sprech.txt"), "w", encoding="utf-8").write(sp)
        print("Zeichen gesamt", tot)
    else:
        main(HERE, SECS, SCENES, LABEL, poster, NAME)
