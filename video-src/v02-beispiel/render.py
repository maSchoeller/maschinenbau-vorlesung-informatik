"""V02 Vorgerechnet: Inkrementalgeber auswerten (Code aus briefing/v02-beispiel.py).
Aufruf: python render.py [text|tts|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from h import *
from pages import O
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v02-beispiel"; LABEL = "DHBW · Informatik · V02 · Inkrementalgeber auswerten"

SECS = [
 [("Ein Inkrementalgeber liefert 1024 Impulse pro Umdrehung.", "Ein Inkrementalgeber liefert eintausendvierundzwanzig Impulse pro Umdrehung."),
  ("Der Zähler steht auf 5000. Wie viele ganze Umdrehungen sind das, und in welchem Winkel steht die Welle jetzt?",
   "Der Zähler steht auf fünftausend. Wie viele ganze Umdrehungen sind das, und in welchem Winkel steht die Welle jetzt?"),
  ("5000 durch 1024 ist knapp 5, also vier ganze Umdrehungen und ein Rest.",
   "Fünftausend durch eintausendvierundzwanzig ist knapp fünf, also vier ganze Umdrehungen und ein Rest."),
  ("Genau diese Aufteilung in Ganzteil und Rest übernimmt Python für uns.", "Genau diese Aufteilung in Ganzteil und Rest übernimmt Python für uns."),
  ("Wir gehen den Code Abschnitt für Abschnitt durch.", "Wir gehen den Code Abschnitt für Abschnitt durch.")],
 [("Zuerst die Eingangsdaten: 1024 Impulse pro Umdrehung und ein Zählerstand von 5000.",
   "Zuerst die Eingangsdaten: eintausendvierundzwanzig Impulse pro Umdrehung und ein Zählerstand von fünftausend."),
  ("Die Variablennamen sagen, was drinsteht, so brauchst du kaum Kommentare.", "Die Variablennamen sagen, was drinsteht, so brauchst du kaum Kommentare."),
  ("Zeile 7: Der doppelte Schrägstrich liefert die ganzen Umdrehungen: 5000 // 1024 ist 4.",
   "Zeile sieben: Der doppelte Schrägstrich liefert die ganzen Umdrehungen: Fünftausend, doppelter Schrägstrich, eintausendvierundzwanzig, ist vier."),
  ("Zeile 8: Das Prozentzeichen liefert den Rest: 5000 % 1024 ist 904.",
   "Zeile acht: Das Prozentzeichen liefert den Rest: Fünftausend Prozent eintausendvierundzwanzig ist neunhundertvier.")],
 [("Zeile 9 rechnet den Winkel der angefangenen Umdrehung: 904 · 360 / 1024.", "Zeile neun rechnet den Winkel der angefangenen Umdrehung: neunhundertvier mal dreihundertsechzig durch eintausendvierundzwanzig."),
  ("Mal und Schrägstrich sind gleichrangig und werden von links nach rechts gerechnet.", "Mal und Schrägstrich sind gleichrangig und werden von links nach rechts gerechnet."),
  ("Der einfache Schrägstrich liefert immer einen float: 317.8125 Grad.", "Der einfache Schrägstrich liefert immer einen float: dreihundertsiebzehn Komma acht eins zwei fünf Grad."),
  ("Das ist knapp vor einer vollen Umdrehung.", "Das ist knapp vor einer vollen Umdrehung.")],
 [("Die Zeilen 11 bis 15 geben die Ergebnisse aus.", "Die Zeilen elf bis fünfzehn geben die Ergebnisse aus."),
  ("Probelauf: Ganze Umdrehungen 4, Rest-Impulse 904, Winkel 317.8125 Grad.", "Probelauf: Ganze Umdrehungen vier, Rest-Impulse neunhundertvier, Winkel dreihundertsiebzehn Komma acht eins zwei fünf Grad."),
  ("bin liefert die Binärdarstellung, hex die Hexdarstellung des Zählerstands.", "bin liefert die Binärdarstellung, hex die Hexdarstellung des Zählerstands."),
  ("Zur Probe: 0x1388 ist 1 · 4096 + 3 · 256 + 8 · 16 + 8, das sind wieder 5000.",
   "Zur Probe: Hex eins drei acht acht ist eins mal viertausendsechsundneunzig plus drei mal zweihundertsechsundfünfzig plus acht mal sechzehn plus acht, das sind wieder fünftausend.")],
 [("Die letzten Zeilen zeigen den Überlauf: Ein 16-Bit-Zähler kennt nur 0 bis 2 hoch 16 minus 1, also 65535.",
   "Die letzten Zeilen zeigen den Überlauf: Ein Sechzehn-Bit-Zähler kennt nur null bis zwei hoch sechzehn minus eins, also fünfundsechzigtausend fünfhundertfünfunddreißig."),
  ("Ein Impuls weiter wäre 65536, und der Rest modulo 2 hoch 16 ist dann 0.", "Ein Impuls weiter wäre fünfundsechzigtausend fünfhundertsechsunddreißig, und der Rest modulo zwei hoch sechzehn ist dann null."),
  ("Genau so läuft ein echter Zähler über.", "Genau so läuft ein echter Zähler über."),
  ("Bei 1024 Impulsen pro Umdrehung passiert das schon nach 64 Umdrehungen.", "Bei eintausendvierundzwanzig Impulsen pro Umdrehung passiert das schon nach vierundsechzig Umdrehungen.")],
 [("Warum gehören // und % zusammen?", "Warum gehören doppelter Schrägstrich und Prozentzeichen zusammen?"),
  ("Weil sie die Zahl vollständig zerlegen: 4 · 1024 + 904 ergibt wieder 5000.", "Weil sie die Zahl vollständig zerlegen: Vier mal eintausendvierundzwanzig plus neunhundertvier ergibt wieder fünftausend."),
  ("Für eine echte Achse bedeutet der Überlauf: Die Steuerung verliert die Position, obwohl die Achse weiterläuft.",
   "Für eine echte Achse bedeutet der Überlauf: Die Steuerung verliert die Position, obwohl die Achse weiterläuft."),
  ("Du musst Überläufe mitzählen oder einen größeren Zähler wählen.", "Du musst Überläufe mitzählen oder einen größeren Zähler wählen."),
  ("Ändere den Zählerstand und sage vorher, was herauskommt.", "Ändere den Zählerstand und sage vorher, was herauskommt.")],
]

CODE = open(os.path.join(HERE, "..", "..", "briefing", "v02-beispiel.py"), encoding="utf-8").read().rstrip("\n").split("\n")
assert len(CODE) == 21
EXPECT = ["Ganze Umdrehungen: 4", "Rest-Impulse: 904", "Winkel in Grad: 317.8125", "Zählerstand binär: 0b1001110001000", "Zählerstand hex: 0x1388",
          "Größter 16-Bit-Wert: 65535", "Ein Impuls weiter: 0"]
assert run("\n".join(CODE)) == EXPECT
assert 5000 // 1024 == 4 and 5000 % 1024 == 904 and 4 * 1024 + 904 == 5000 and 904 * 360 / 1024 == 317.8125
assert 1 * 4096 + 3 * 256 + 8 * 16 + 8 == 5000 == 0x1388 and 65536 / 1024 == 64
CPS = 55
CX, CW, CSZ, CLH, CY = 40, 800, 16, 24, 108
RX, RW = 860, 360
fit_check(CODE, M(CSZ), CW - 62 - 14, "Code")
fit_check(EXPECT, M(16), RW - 44 - 6, "Konsole")

def seq(idxs, start, cps=CPS, gap=0.15):
    out = {}; c = start
    for i in idxs:
        out[i] = c; c += len(CODE[i]) / cps + gap
    return out
def code_times(spec):
    tm = [1e9] * len(CODE)
    for i, v in spec.items(): tm[i] = v
    return tm
FULL = {i: -1 for i in range(len(CODE))}

def draw_code(f, t, times, hl=None, dim=False):
    f.el(ap(t, 0.0, 0.3), lambda d, dy: code_panel(d, CX, CY + dy, CW, CODE, times, t, CSZ, CPS * 1.0, hl=hl, dim_others=dim, lh=CLH))

def side_card(f, t, tin, y, h, big, small, col=DARK, tout=None):
    a = ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout else 0))
    def fn(d, dy):
        card(d, RX, y + dy, RW, h)
        T2(d, RX + 28, y + 10 + dy, big, F(28, 700), col)
        yy = y + 50 + dy
        for ln in ([small] if isinstance(small, str) else small):
            sz = 23
            while F(sz, 400).getlength(ln) > RW - 50 and sz > 16: sz -= 1
            T2(d, RX + 28, yy, ln, F(sz, 400), GREY); yy += 28
    f.el(a, fn, dy=int((1 - ap(t, tin, 0.45)) * 12))

def console(f, t, entries, y=108, h=250):
    f.el(ap(t, 0.0, 0.4), lambda d, dy: console_panel(d, RX, y + dy, RW, h, entries, t, 16, lh=24))
CON = lambda i, ts: [(ts, [(EXPECT[i], CODE_T if i not in (6,) else CODE_G)])]

# ---------------------------------------------------------------- 1 Aufgabe
def sc1(f, t, ct):
    heading(f, t, "Die Aufgabe: Inkrementalgeber")
    cx, cy, R = 270, 380, 170
    def disc(d, dy):
        d.ellipse((cx - R, cy - R + dy, cx + R, cy + R + dy), fill=WHITE, outline=DARK, width=5)
        d.ellipse((cx - R + 40, cy - R + 40 + dy, cx + R - 40, cy + R - 40 + dy), outline=LINE, width=3)
        for k in range(64):
            a = 2 * math.pi * k / 64 - math.pi / 2; L = 22 if k % 8 == 0 else 12
            d.line((cx + (R - 6) * math.cos(a), cy + dy + (R - 6) * math.sin(a), cx + (R - 6 - L) * math.cos(a), cy + dy + (R - 6 - L) * math.sin(a)), fill=DARK if k % 8 == 0 else GREY, width=3)
        d.ellipse((cx - 8, cy - 8 + dy, cx + 8, cy + 8 + dy), fill=DARK)
        T2(d, cx, cy + R + 44 + dy, "1 Umdrehung = 1024 Impulse", F(28, 700), DARK, "mm")
    f.el(ap(t, ct(0) + 0.3, 0.5), disc, dy=int((1 - ap(t, ct(0) + 0.3, 0.5)) * 12))
    def cnt(d, dy):
        card(d, 540, 150 + dy, 680, 120)
        T2(d, 572, 162 + dy, "Zählerstand", F(26, 600), GREY)
        T2(d, 572, 196 + dy, "5000 Impulse", F(56, 700), RED)
    f.el(ap(t, ct(1) + 0.2, 0.5), cnt, dy=int((1 - ap(t, ct(1) + 0.2, 0.5)) * 12))
    def qs(d, dy):
        T2(d, 540, 300 + dy, "Gesucht:", F(28, 700), DARK)
        T2(d, 540, 340 + dy, "• ganze Umdrehungen", F(30, 400), DARK); T2(d, 540, 380 + dy, "• Winkel der angefangenen Umdrehung", F(30, 400), DARK)
    f.el(ap(t, ct(1) + 3.0, 0.5), qs)
    u = 680 / 5120.0
    def bar(d, dy):
        y = 470 + dy; x = 540
        for i in range(4):
            if t < ct(2) + 3.0 + i * 0.35: continue
            xa = x + i * 1024 * u
            d.rectangle((xa + 2, y, xa + 1024 * u - 2, y + 56), fill=GREEN)
            T2(d, xa + 512 * u, y + 28, "1024", F(24, 700), WHITE, "mm")
        if t > ct(2) + 5.6:
            xa = x + 4 * 1024 * u
            d.rectangle((xa + 2, y, xa + 904 * u, y + 56), fill=RED)
            T2(d, xa + 450 * u, y + 28, "Rest", F(24, 700), WHITE, "mm")
        if t > ct(2) + 4.4:
            d.line((x, y + 72, x + 4 * 1024 * u - 4, y + 72), fill=GREEN, width=4)
            T2(d, x + 2 * 1024 * u, y + 84, "4 ganze Umdrehungen", F(26, 700), GREEN, "ma")
        if t > ct(2) + 5.9:
            T2(d, x + 4 * 1024 * u + 452 * u, y + 84, "Rest", F(26, 700), RED, "ma")
    f.el(ap(t, ct(2) + 1.0, 0.5), bar)
    def py(d, dy):
        d.rounded_rectangle((540, 600 + dy, 1220, 660 + dy), 30, fill=DARK)
        T2(d, 880, 630 + dy, "Python: Ganzteil und Rest mit // und %", F(30, 700), WHITE, "mm")
    f.el(ap(t, ct(3) + 0.5, 0.5), py, dy=int((1 - ap(t, ct(3) + 0.5, 0.5)) * 12))

# ---------------------------------------------------------------- 2 Eingangsdaten, // und %
def sc2(f, t, ct):
    heading(f, t, "Abschnitt 1: Eingangsdaten, // und %")
    tm = {}; tm.update(seq([0, 1, 3, 4], ct(0) + 0.2)); tm.update(seq([6], ct(2) + 0.3)); tm.update(seq([7], ct(3) + 0.3))
    hl = {3, 4} if t < ct(2) else ({6} if t < ct(3) else {7})
    draw_code(f, t, code_times(tm), hl, True)
    side_card(f, t, ct(0) + 1.5, 108, 112, "Eingangsdaten", ["1024 Impulse pro Umdrehung", "Zählerstand 5000"], DARK)
    side_card(f, t, ct(1) + 0.3, 232, 112, "Sprechende Namen", ["impulse_pro_umdrehung statt x", "erklären sich selbst"], DARK)
    side_card(f, t, ct(2) + 1.5, 356, 112, "// = Ganzteil", ["5000 // 1024 = 4", "ganze Umdrehungen"], GREEN)
    side_card(f, t, ct(3) + 1.5, 480, 112, "% = Rest", ["5000 % 1024 = 904", "Impulse der angefangenen Umdrehung"], RED)

# ---------------------------------------------------------------- 3 Winkel
def sc3(f, t, ct):
    heading(f, t, "Abschnitt 2: der Winkel")
    tm = dict(FULL); tm[8] = 1e9
    tm.update({k: v for k, v in seq([8], ct(0) + 0.2).items()})
    for k in (9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20): tm[k] = 1e9
    draw_code(f, t, code_times(tm), {8}, True)
    side_card(f, t, ct(0) + 1.5, 108, 112, "Winkel", ["904 · 360 / 1024", "Anteil der Umdrehung mal 360 Grad"], DARK)
    side_card(f, t, ct(1) + 0.3, 232, 112, "Gleichrangig", ["* und / : von links nach rechts", "erst 904 * 360, dann / 1024"], DARK)
    side_card(f, t, ct(2) + 1.5, 356, 112, "/ liefert float", ["317.8125 Grad"], RED)
    def dsc(d, dy):
        cx, cy, R = RX + 180, 560, 70
        d.ellipse((cx - R, cy - R + dy, cx + R, cy + R + dy), fill=WHITE, outline=DARK, width=4)
        a = math.radians(317.8125) - math.pi / 2
        d.pieslice((cx - R, cy - R + dy, cx + R, cy + R + dy), -90, 317.8125 - 90, fill=(255, 220, 224))
        d.ellipse((cx - R, cy - R + dy, cx + R, cy + R + dy), outline=DARK, width=4)
        d.line((cx, cy + dy, cx + R * math.cos(a), cy + dy + R * math.sin(a)), fill=RED, width=6)
        T2(d, cx, cy + R + 22 + dy, "317,8125°", F(26, 700), RED, "mm")
    f.el(ap(t, ct(3) + 0.2, 0.5), dsc)

# ---------------------------------------------------------------- 4 Ausgaben und Probelauf
def sc4(f, t, ct):
    heading(f, t, "Abschnitt 3: Ausgabe und Probelauf")
    tm = dict(FULL)
    for k in (15, 16, 17, 18, 19, 20): tm[k] = 1e9
    for k in (10, 11, 12, 13, 14): tm[k] = 1e9
    tm.update(seq([10, 11, 12, 13, 14], ct(0) + 0.2))
    draw_code(f, t, code_times(tm), {10, 11, 12, 13, 14}, True)
    ents = [(ct(1) + 2.6, [(EXPECT[0], CODE_T)]), (ct(1) + 5.0, [(EXPECT[1], CODE_T)]), (ct(1) + 8.0, [(EXPECT[2], CODE_T)]),
            (ct(2) + 1.0, [(EXPECT[3], CODE_T)]), (ct(2) + 2.8, [(EXPECT[4], CODE_T)])]
    console(f, t, ents)
    side_card(f, t, ct(2) + 0.4, 380, 100, "bin() und hex()", ["Zahl → Text mit 0b bzw. 0x"], DARK)
    side_card(f, t, ct(3) + 0.5, 492, 130, "Probe: 0x1388", ["1 · 4096 + 3 · 256", "+ 8 · 16 + 8 = 5000"], GREEN)

# ---------------------------------------------------------------- 5 Ueberlauf
def sc5(f, t, ct):
    heading(f, t, "Abschnitt 4: der 16-Bit-Überlauf")
    tm = dict(FULL)
    for k in (16, 17, 18, 19, 20): tm[k] = 1e9
    tm.update(seq([16, 17, 18, 19, 20], ct(0) + 0.3))
    draw_code(f, t, code_times(tm), {16, 17, 18, 19, 20}, True)
    ents = [(0, [(EXPECT[0], CODE_T)]), (0, [(EXPECT[1], CODE_T)]), (0, [(EXPECT[2], CODE_T)]), (0, [(EXPECT[3], CODE_T)]), (0, [(EXPECT[4], CODE_T)]),
            (ct(0) + 9.6, [(EXPECT[5], CODE_T)]), (ct(1) + 6.3, [(EXPECT[6], CODE_R)])]
    console(f, t, ents, h=290)
    side_card(f, t, ct(0) + 2.0, 408, 100, "16 Bit", ["0 … 2 ** 16 − 1 = 65535"], DARK, tout=ct(3) - 0.2)
    side_card(f, t, ct(1) + 1.8, 520, 100, "% 2 ** 16", ["65536 % 65536 = 0: Überlauf"], RED)
    side_card(f, t, ct(3) + 0.2, 408, 100, "65536 / 1024 = 64", ["schon nach 64 Umdrehungen"], RED)

# ---------------------------------------------------------------- 6 Zusammenhang, echte Achse
def sc6(f, t, ct):
    heading(f, t, "Warum // und % zusammengehören")
    hl = {6, 7} if t < ct(2) else {17, 18}
    draw_code(f, t, code_times(dict(FULL)), hl, True)
    ents = [(0, [(e, CODE_T)]) for e in EXPECT[:6]] + [(0, [(EXPECT[6], CODE_R)])]
    console(f, t, ents, h=290)
    side_card(f, t, ct(1) + 0.4, 408, 100, "4 · 1024 + 904", ["= 5000: nichts geht verloren"], GREEN, tout=ct(3) - 0.2)
    side_card(f, t, ct(2) + 0.6, 520, 100, "Echte Achse", ["Position verloren, obwohl sie läuft"], RED)
    side_card(f, t, ct(3) + 0.3, 408, 100, "Gegenmittel", ["Überläufe zählen oder 32 Bit"], DARK)
    def end(d, dy):
        d.rounded_rectangle((60, 640 + dy, 820, 680 + dy), 20, fill=RED)
        T2(d, 440, 660 + dy, "Ändere den Zählerstand und sage vorher, was herauskommt", F(26, 700), WHITE, "mm")
    f.el(ap(t, ct(4) + 0.3, 0.5), end, dy=int((1 - ap(t, ct(4) + 0.3, 0.5)) * 12))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V02 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Vorgerechnet", F(104, 700), DARK)
        T2(d, 90, 300, "Inkrementalgeber auswerten", F(52, 400), GREY)
        code_panel(d, 90, 400, 900, CODE[6:9], [0, 0, 0], 9, 24, lineno=False, lh=36)
        cx, cy, R = 1090, 470, 70
        d.ellipse((cx - R, cy - R, cx + R, cy + R), fill=WHITE, outline=DARK, width=4)
        d.pieslice((cx - R, cy - R, cx + R, cy + R), -90, 317.8125 - 90, fill=(255, 220, 224))
        d.ellipse((cx - R, cy - R, cx + R, cy + R), outline=DARK, width=4)
        a = math.radians(317.8125) - math.pi / 2
        d.line((cx, cy, cx + R * math.cos(a), cy + R * math.sin(a)), fill=RED, width=6)
        T2(d, cx, cy + R + 28, "317,8125°", F(30, 700), RED, "mm")
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SECS, SCENES, LABEL, poster, NAME)
