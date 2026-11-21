"""V02 Theorie: Wie der Rechner zaehlt (Bits, Hex, Ueberlauf). Aufruf: python render.py [text|tts|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from h import *
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v02-theorie"; LABEL = "DHBW · Informatik · V02 · Bits, Binär, Hex, Zweierkomplement"

def S(x): return (x, x)
SECS = [
 [("Ein Drehgeber zählt Impulse, und sein Zähler hat 16 Bit.", "Ein Drehgeber zählt Impulse, und sein Zähler hat sechzehn Bit."),
  ("Bei 65535 ist Schluss: Der nächste Impuls setzt ihn auf 0 zurück.",
   "Bei fünfundsechzigtausend fünfhundertfünfunddreißig ist Schluss: Der nächste Impuls setzt ihn auf null."),
  ("Liest die Steuerung denselben Zähler mit Vorzeichen, springt er von 32767 auf −32768.",
   "Liest die Steuerung denselben Zähler mit Vorzeichen, springt er von der größten positiven zur kleinsten negativen Zahl."),
  ("Die Achse bewegt sich nur einen Impuls, doch die Zahl springt über die ganze Skala.",
   "Die Achse bewegt sich nur einen Impuls, doch die Zahl springt über die ganze Skala."),
  ("Schauen wir, wie ein Rechner wirklich zählt.", "Schauen wir, wie ein Rechner wirklich zählt.")],
 [("Im Dezimalsystem ist jede Stelle eine Zehnerpotenz.", "Im Dezimalsystem ist jede Stelle eine Zehnerpotenz."),
  ("45 ist 4 · 10 plus 5 · 1.", "Die Zahl fünfundvierzig ist vier mal zehn plus fünf mal eins."),
  ("Ein Rechner kennt nur zwei Zustände, also zählt er binär: Jede Stelle ist eine Zweierpotenz.",
   "Ein Rechner kennt nur zwei Zustände, also zählt er binär: Jede Stelle ist eine Zweierpotenz."),
  ("45 ist dann 32 + 8 + 4 + 1, also 101101.", "Fünfundvierzig ist dann zweiunddreißig plus acht plus vier plus eins."),
  ("Im Hexadezimalsystem steht jede Stelle für eine Sechzehnerpotenz, mit den Ziffern 0 bis 9 und A bis F.",
   "Im Hexadezimalsystem steht jede Stelle für eine Sechzehnerpotenz, mit den Ziffern null bis neun und A bis F."),
  ("45 ist 2 · 16 + 13, und 13 schreibt man D: also 2D.", "Fünfundvierzig ist zwei mal sechzehn plus dreizehn, und dreizehn schreibt man D, also zwei D.")],
 [("Dezimal in binär wandelst du mit dem Divisionsrestverfahren um.", "Dezimal in binär wandelst du mit dem Divisionsrestverfahren um."),
  ("Du teilst immer wieder durch 2 und merkst dir den Rest.", "Du teilst immer wieder durch zwei und merkst dir den Rest."),
  ("45 durch 2 ist 22 Rest 1, und so weiter, bis du bei 0 ankommst.",
   "Fünfundvierzig durch zwei ist zweiundzwanzig Rest eins, und so geht es weiter, bis du bei null ankommst."),
  ("Die Reste liest du von unten nach oben: 101101.", "Die Reste liest du von unten nach oben: eins null eins eins null eins."),
  ("Zurück rechnest du, indem du die Stellenwerte der Einsen addierst.", "Zurück rechnest du, indem du die Stellenwerte der Einsen addierst.")],
 [("Ein Bit ist eine Binärstelle, 0 oder 1. Acht Bit sind ein Byte.", "Ein Bit ist eine Binärstelle, null oder eins. Acht Bit sind ein Byte."),
  ("Mit n Bit gibt es 2ⁿ Werte, ohne Vorzeichen von 0 bis 2ⁿ − 1.", "Mit n Bit gibt es zwei hoch n verschiedene Werte, ohne Vorzeichen von null bis zwei hoch n minus eins."),
  ("Bei 8 Bit sind das 0 bis 255, bei 16 Bit 0 bis 65535.",
   "Bei acht Bit sind das null bis zweihundertfünfundfünfzig, bei sechzehn Bit null bis fünfundsechzigtausend."),
  ("Mit Vorzeichen halbiert sich der positive Bereich: Bei 16 Bit liegt er zwischen −32768 und +32767.",
   "Mit Vorzeichen halbiert sich der positive Bereich: Bei sechzehn Bit liegt er zwischen minus und plus rund zweiunddreißigtausend."),
  ("Wird der Bereich verlassen, läuft die Zahl über und beginnt von vorn.", "Wird der Bereich verlassen, läuft die Zahl über und beginnt von vorn.")],
 [("Negative Zahlen speichert der Rechner im Zweierkomplement.", "Negative Zahlen speichert der Rechner im Zweierkomplement."),
  ("Du schreibst den Betrag binär auf, invertierst alle Bits und addierst 1.", "Du schreibst den Betrag binär auf, invertierst alle Bits und addierst eins."),
  ("Beispiel −5 in 8 Bit: 00000101 invertiert, plus 1, ergibt 11111011.",
   "Beispiel minus fünf in acht Bit: Du invertierst die Bits der Fünf und addierst eins. Heraus kommt eins eins eins eins eins null eins eins."),
  ("Ohne Vorzeichen gelesen wäre dasselbe Muster die 251.",
   "Ohne Vorzeichen gelesen wäre dasselbe Muster die zweihunderteinundfünfzig."),
  ("Am Zahlenkreis siehst du den Überlauf: Nach der größten positiven kommt die kleinste negative Zahl.",
   "Am Zahlenkreis siehst du den Überlauf: Nach der größten positiven Zahl kommt die kleinste negative.")],
 [("Lange Bitketten sind unlesbar. Hex ist die Kurzschrift: Vier Bit ergeben genau eine Hexziffer.",
   "Lange Bitketten sind unlesbar. Hex ist die Kurzschrift: Vier Bit ergeben genau eine Hexziffer."),
  ("Jede Vierergruppe wird eine Ziffer: Das Register wird zu F, A, 3, 1, also 0xFA31.",
   "Jede Vierergruppe wird zu einer Ziffer: Das Register wird zu F, A, drei, eins, also null x F A drei eins."),
  ("In SPS-Registern und bei Fehlercodes begegnet dir Hex ständig.", "In SPS-Registern und bei Fehlercodes begegnet dir Hex ständig."),
  ("Das Präfix 0x kennzeichnet Hex, 0b kennzeichnet binär.", "Das Präfix null x kennzeichnet Hex, null b kennzeichnet binär."),
  ("Merke: Ein Zähler hat endlich viele Bits. Prüfe immer, ob dein Wertebereich reicht.",
   "Merke: Ein Zähler hat endlich viele Bits. Prüfe immer, ob dein Wertebereich reicht.")],
]

# ---------------------------------------------------------------- Pruefung der Zahlen
assert 65535 + 1 - 2**16 == 0 and (65535 + 1) % 2**16 == 0
assert format(32767, "016b") == "0111111111111111" and format(-32768 & 0xFFFF, "016b") == "1000000000000000"
assert format(45, "b") == "101101" and hex(45) == "0x2d" and 4 * 10 + 5 == 45 and 32 + 8 + 4 + 1 == 45 and 2 * 16 + 13 == 45
rem = []; n = 45
while n: rem.append((n, n // 2, n % 2)); n //= 2
assert "".join(str(r[2]) for r in reversed(rem)) == "101101" and len(rem) == 6
assert format(5, "08b") == "00000101" and format(~5 & 0xFF, "08b") == "11111010" and format((~5 + 1) & 0xFF, "08b") == "11111011" and (~5 + 1) & 0xFF == 251
assert 2**8 == 256 and 2**16 == 65536 and 2**32 == 4294967296 and -2**15 == -32768 and 2**15 - 1 == 32767 and -2**31 == -2147483648 and 2**31 - 1 == 2147483647
assert format(0xFA31, "016b") == "1111101000110001"

def g4(v, n=16):
    b = format(v & (2**n - 1), f"0{n}b"); return " ".join(b[i:i + 4] for i in range(0, n, 4))
def fmt(v): return f"{v:,}".replace(",", ".").replace("-", "−")

def cell(d, x, y, w, h, txt, font, tcol=DARK, fill=WHITE, ol=LINE, r=8):
    d.rounded_rectangle((x, y, x + w, y + h), r, fill=fill, outline=ol, width=2)
    T2(d, x + w / 2, y + h / 2, txt, font, tcol, "mm")

# ---------------------------------------------------------------- 1 Hook
def sc1(f, t, ct):
    heading(f, t, "Der Zähler läuft über")
    t1 = ct(1) + 0.9; t2 = ct(2) + 1.2; stp = 0.8
    def panel(x, title, seq, tstart, ta, signed):
        k = min(len(seq) - 1, max(0, int((t - tstart) / stp))) if t >= tstart else 0
        v = seq[k]; over = k == len(seq) - 1 and t >= tstart
        def fn(d, dy):
            card(d, x, 140 + dy, 560, 330)
            T2(d, x + 36, 156 + dy, title, F(30, 700), DARK)
            d.rounded_rectangle((x + 36, 214 + dy, x + 524, 324 + dy), 12, fill=BOX2)
            T2(d, x + 280, 270 + dy, str(v).replace("-", "−"), M(66, True), CODE_R if over else CODE_G, "mm")
            T2(d, x + 36, 346 + dy, "Bitmuster im Zähler", F(22, 400), GREY)
            T2(d, x + 36, 378 + dy, g4(v), M(34, True), RED if over else DARK)
            if over: T2(d, x + 36, 424 + dy, "Überlauf: ein Impuls weiter", F(28, 700), RED)
        f.el(ap(t, ta, 0.5), fn, dy=int((1 - ap(t, ta, 0.5)) * 12))
    panel(60, "16 Bit ohne Vorzeichen", [65533, 65534, 65535, 0], t1, ct(0) + 1.2, False)
    panel(660, "16 Bit mit Vorzeichen", [32765, 32766, 32767, -32768], t2, ct(0) + 1.2, True)
    def ban(d, dy):
        d.rounded_rectangle((60, 520 + dy, 1220, 600 + dy), 40, fill=RED)
        T2(d, 640, 560 + dy, "Eine Zahl, die springt, obwohl sich die Achse kaum bewegt", F(34, 700), WHITE, "mm")
    f.el(ap(t, ct(3) + 0.8, 0.5), ban, dy=int((1 - ap(t, ct(3) + 0.8, 0.5)) * 12))

# ---------------------------------------------------------------- 2 Stellenwertsysteme
def sc2(f, t, ct):
    heading(f, t, "Stellenwertsysteme")
    CW = 84
    def table(y, label, col, places, digits, tin, tsum, sumtxt, hi=None):
        def fn(d, dy):
            d.rounded_rectangle((60, y + 28 + dy, 270, y + 90 + dy), 10, fill=col)
            T2(d, 165, y + 59 + dy, label, F(27, 700), WHITE, "mm")
            for i, (pv, dg) in enumerate(zip(places, digits)):
                x = 310 + i * (CW + 8)
                T2(d, x + CW / 2, y + 8 + dy, str(pv), F(24, 600), GREY, "mm")
                on = dg not in ("0",)
                cell(d, x, y + 28 + dy, CW, 62, dg, M(40, True), RED if (on and label.startswith("Binär")) else DARK)
        f.el(ap(t, tin, 0.5), fn, dy=int((1 - ap(t, tin, 0.5)) * 12))
        def sm(d, dy): T2(d, 310 + len(places) * (CW + 8) + 24, y + 59 + dy, sumtxt, F(30, 700), DARK, "lm")
        f.el(ap(t, tsum, 0.5), sm)
    table(118, "Dezimal", DARK, [10, 1], ["4", "5"], ct(0) + 0.3, ct(1) + 0.6, "4 · 10 + 5 · 1 = 45")
    table(290, "Binär", RED, [32, 16, 8, 4, 2, 1], list("101101"), ct(2) + 0.5, ct(3) + 0.6, "32 + 8 + 4 + 1 = 45")
    table(462, "Hexadezimal", GREEN, [16, 1], ["2", "D"], ct(4) + 0.4, ct(5) + 0.6, "2 · 16 + 13 · 1 = 45")
    def note(d, dy): T2(d, 310 + 2 * (CW + 8) + 24, y_n + dy, "D steht für 13", F(24, 400), GREY, "lm")
    y_n = 462 + 59 + 36
    f.el(ap(t, ct(5) + 1.6, 0.5), note)

# ---------------------------------------------------------------- 3 Divisionsrest
def sc3(f, t, ct):
    heading(f, t, "Divisionsrestverfahren: 45 in binär")
    t0 = ct(2) + 0.6; step = 1.6
    X = 90
    def hdr(d, dy):
        T2(d, X + 40, 132 + dy, "Rechnung", F(24, 600), GREY); T2(d, X + 420, 132 + dy, "Rest", F(24, 600), GREY, "ma")
    f.el(ap(t, ct(1), 0.5), hdr)
    for i, (n, q, r) in enumerate(rem):
        ti = t0 + i * step
        def fn(d, dy, i=i, n=n, q=q, r=r):
            y = 164 + i * 62 + dy
            d.rounded_rectangle((X, y, X + 500, y + 52), 8, fill=WHITE, outline=LINE, width=2)
            T2(d, X + 24, y + 26, f"{n} : 2 = {q}", M(30, True), DARK, "lm")
            d.rounded_rectangle((X + 360, y + 6, X + 480, y + 46), 8, fill=RED if t > t0 + 5 * step + 1.8 else (230, 235, 240))
            T2(d, X + 420, y + 26, f"Rest {r}", M(26, True), WHITE if t > t0 + 5 * step + 1.8 else DARK, "mm")
        f.el(ap(t, ti, 0.4), fn, dy=int((1 - ap(t, ti, 0.4)) * 10))
    # Pfeil von unten nach oben und Ergebnis
    def arrow(d, dy):
        k = ap(t, ct(3) + 0.2, 1.4)
        x = X + 540; y1 = 164 + 5 * 62 + 26; y2 = y1 - k * (5 * 62)
        d.line((x, y1, x, y2), fill=RED, width=6)
        if k > 0.95: d.polygon([(x, y2 - 8), (x - 14, y2 + 18), (x + 14, y2 + 18)], fill=RED)
        T2(d, x + 24, 300 + dy, "von unten", F(24, 600), RED, "lm"); T2(d, x + 24, 330 + dy, "nach oben", F(24, 600), RED, "lm")
    f.el(ap(t, ct(3), 0.3), arrow)
    def res(d, dy):
        T2(d, 790, 150 + dy, "Binärzahl", F(26, 600), GREY)
        digs = [str(r[2]) for r in reversed(rem)]
        for i, dg in enumerate(digs):
            if t < ct(3) + 0.4 + i * 0.3: continue
            cell(d, 790 + i * 64, 190 + dy, 56, 70, dg, M(42, True), RED if dg == "1" else DARK)
        if t > ct(3) + 2.4: T2(d, 790, 280 + dy, "45 = 101101", F(40, 700), DARK)
    f.el(ap(t, ct(3) + 0.2, 0.4), res)
    def back(d, dy):
        card(d, 790, 360 + dy, 430, 190)
        T2(d, 820, 374 + dy, "Probe: Stellenwerte der Einsen", F(24, 700), DARK)
        T2(d, 820, 414 + dy, "32 + 8 + 4 + 1", M(30, True), DARK)
        T2(d, 820, 456 + dy, "= 45", M(30, True), GREEN)
        T2(d, 820, 500 + dy, "Hinweis: 0b101101 in Python", F(22, 400), GREY)
    f.el(ap(t, ct(4) + 0.3, 0.5), back, dy=int((1 - ap(t, ct(4) + 0.3, 0.5)) * 12))

# ---------------------------------------------------------------- 4 Bit, Byte, Wertebereiche
def sc4(f, t, ct):
    heading(f, t, "Bit, Byte und Wertebereiche")
    def byte(d, dy):
        for i in range(8):
            if t < ct(0) + 0.5 + i * 0.12: continue
            cell(d, 60 + i * 72, 128 + dy, 64, 64, "0" if i % 3 else "1", M(34, True), DARK)
        T2(d, 60 + 8 * 72 + 20, 160 + dy, "8 Bit = 1 Byte", F(32, 700), DARK, "lm")
        T2(d, 60 + 8 * 72 + 20, 192 + dy, "1 Bit = eine Stelle (0 oder 1)", F(22, 400), GREY, "lm")
    f.el(ap(t, ct(0), 0.5), byte, dy=int((1 - ap(t, ct(0), 0.5)) * 10))
    cols = [(60, 170, "Bitbreite"), (240, 250, "Anzahl Werte"), (500, 340, "ohne Vorzeichen"), (850, 370, "mit Vorzeichen")]
    rows = [(8, "2⁸ = 256", "0 … 255", "−128 … 127"), (16, "2¹⁶ = 65.536", "0 … 65.535", "−32.768 … 32.767"),
            (32, "2³² ≈ 4,3 Mrd.", "0 … 4.294.967.295", "−2.147.483.648 … 2.147.483.647")]
    def table(d, dy):
        y = 232 + dy
        for x, w, name in cols[:3 if t < ct(3) else 4]:
            if name == "mit Vorzeichen" and t < ct(3): continue
            d.rectangle((x, y, x + w, y + 44), fill=DARK); T2(d, x + 12, y + 22, name, F(24, 700), WHITE, "lm")
        for i, (nb, c1, c2, c3) in enumerate(rows):
            yy = y + 54 + i * 76
            vals = [f"{nb} Bit", c1, c2, c3]
            for j, (x, w, name) in enumerate(cols):
                if j == 3 and t < ct(3): continue
                if j == 2 and t < ct(2): continue
                fn_ = F(26, 700) if j == 0 else F(25, 400) if j == 3 else F(26, 400)
                sz = 26
                while F(sz, 400).getlength(vals[j]) > w - 20 and sz > 16: sz -= 1
                d.rounded_rectangle((x, yy, x + w, yy + 64), 8, fill=WHITE, outline=LINE, width=2)
                T2(d, x + 12, yy + 32, vals[j], F(sz, 700 if j == 0 else 400), (RED if j == 3 else DARK), "lm")
    f.el(ap(t, ct(1) - 0.3, 0.5), table)
    def ov(d, dy):
        d.rounded_rectangle((60, 600 + dy, 1220, 664 + dy), 32, fill=RED)
        T2(d, 640, 632 + dy, "Außerhalb des Bereichs: Überlauf, der Wert beginnt von vorn", F(32, 700), WHITE, "mm")
    f.el(ap(t, ct(4) + 0.3, 0.5), ov, dy=int((1 - ap(t, ct(4) + 0.3, 0.5)) * 12))

# ---------------------------------------------------------------- 5 Zweierkomplement
def sc5(f, t, ct):
    heading(f, t, "Zweierkomplement")
    steps = [("+5", "0000 0101", DARK, ct(2) + 0.3), ("alle Bits invertieren", "1111 1010", DARK, ct(2) + 2.6), ("+ 1", "1111 1011", RED, ct(2) + 5.4)]
    def left(d, dy):
        T2(d, 60, 128 + dy, "Beispiel: −5 in 8 Bit", F(30, 700), DARK)
    f.el(ap(t, ct(1) - 0.3, 0.5), left)
    steps = [("Betrag 5 binär", "0000 0101", DARK, ct(2) + 1.0), ("Bits invertieren", "1111 1010", DARK, ct(2) + 5.0), ("plus 1", "1111 1011", RED, ct(2) + 8.4)]
    for i, (lab, val, col, ti) in enumerate(steps):
        def fn(d, dy, i=i, lab=lab, val=val, col=col):
            y = 176 + i * 104 + dy
            card(d, 60, y, 520, 92)
            T2(d, 90, y + 10, lab, F(24, 600), GREY); T2(d, 90, y + 38, val, M(42, True), col)
        f.el(ap(t, ti, 0.5), fn, dy=int((1 - ap(t, ti, 0.5)) * 12))
    def rd(d, dy):
        card(d, 60, 494 + dy, 520, 134, stripe=True)
        T2(d, 90, 506 + dy, "11111011 gelesen als …", F(24, 600), GREY)
        T2(d, 90, 540 + dy, "mit Vorzeichen: −5", F(32, 700), GREEN)
        T2(d, 90, 576 + dy, "ohne Vorzeichen: 251", F(32, 700), RED)
    f.el(ap(t, ct(3) + 0.4, 0.5), rd, dy=int((1 - ap(t, ct(3) + 0.4, 0.5)) * 12))
    # Zahlenkreis (4 Bit)
    cx, cy, R = 920, 396, 190
    def ring(d, dy):
        T2(d, cx, 126 + dy, "Zahlenkreis mit 4 Bit", F(28, 700), DARK, "mm")
        for k in range(16):
            ang = -math.pi / 2 + 2 * math.pi * k / 16
            sv = k if k < 8 else k - 16
            px, py = cx + R * math.cos(ang), cy + dy + R * math.sin(ang)
            col = GREEN if sv >= 0 else RED
            if k in (0, 7, 8) and t > ct(4) + 0.5: pass
            d.ellipse((px - 22, py - 22, px + 22, py + 22), fill=col)
            T2(d, px, py, format(k, "04b"), M(14, True), WHITE, "mm")
            ox, oy = cx + (R + 52) * math.cos(ang), cy + dy + (R + 52) * math.sin(ang)
            T2(d, ox, oy, str(sv).replace("-", "−"), F(26, 700), col, "mm")
        T2(d, cx, cy + dy - 12, "positiv", F(24, 700), GREEN, "mm"); T2(d, cx, cy + dy + 18, "negativ", F(24, 700), RED, "mm")
    f.el(ap(t, ct(1) + 1.0, 0.6), ring)
    def jump(d, dy):
        k = ap(t, ct(4) + 0.5, 0.8)
        a0 = -math.pi / 2 + 2 * math.pi * 7 / 16; a1 = -math.pi / 2 + 2 * math.pi * 8 / 16
        x0, y0 = cx + (R - 52) * math.cos(a0), cy + (R - 52) * math.sin(a0) + dy
        x1, y1 = cx + (R - 52) * math.cos(a1), cy + (R - 52) * math.sin(a1) + dy
        xm, ym = x0 + (x1 - x0) * k, y0 + (y1 - y0) * k
        d.line((x0, y0, xm, ym), fill=DARK, width=6)
        if k > 0.95:
            d.ellipse((x1 - 7, y1 - 7, x1 + 7, y1 + 7), fill=DARK)
            T2(d, cx, cy + dy + 70, "7 + 1 → −8", F(30, 700), DARK, "mm")
    f.el(ap(t, ct(4) + 0.4, 0.4), jump)

# ---------------------------------------------------------------- 6 Hex
def sc6(f, t, ct):
    heading(f, t, "Hex: Kurzschrift für 4 Bit")
    bits = format(0xFA31, "016b"); hx = "FA31"
    def reg(d, dy):
        T2(d, 60, 124 + dy, "16-Bit-Register", F(26, 600), GREY)
        for gi in range(4):
            gx = 60 + gi * 296
            if t < ct(1) + 0.3 + gi * 0.35: continue
            for bi in range(4):
                cell(d, gx + bi * 66, 160 + dy, 60, 60, bits[gi * 4 + bi], M(34, True), RED if bits[gi * 4 + bi] == "1" else DARK, r=6)
            d.line((gx + 2, 232 + dy, gx + 258, 232 + dy), fill=GREY, width=3)
            d.rounded_rectangle((gx + 80, 244 + dy, gx + 180, 304 + dy), 10, fill=GREEN)
            T2(d, gx + 130, 274 + dy, hx[gi], M(40, True), WHITE, "mm")
        if t > ct(1) + 2.4: T2(d, 640, 328 + dy, "0xFA31", M(54, True), DARK, "mm")
    f.el(ap(t, ct(0) + 0.3, 0.5), reg)
    def tab(d, dy):
        T2(d, 60, 380 + dy, "Eine Hexziffer = vier Bit", F(26, 600), GREY)
        for v in range(16):
            x = 60 + v * 72
            d.rounded_rectangle((x, 416 + dy, x + 66, 566 + dy), 8, fill=WHITE, outline=LINE, width=2)
            T2(d, x + 33, 446 + dy, format(v, "X"), M(34, True), GREEN, "mm")
            T2(d, x + 33, 488 + dy, str(v), F(24, 600), DARK, "mm")
            T2(d, x + 33, 528 + dy, format(v, "04b"), M(17, True), GREY, "mm")
    f.el(ap(t, ct(0) + 1.0, 0.5), tab)
    def sps(d, dy):
        d.rounded_rectangle((60, 590 + dy, 640, 650 + dy), 30, fill=DARK)
        T2(d, 350, 620 + dy, "SPS-Register und Fehlercodes", F(30, 700), WHITE, "mm")
    f.el(ap(t, ct(2) + 0.3, 0.5), sps, dy=int((1 - ap(t, ct(2) + 0.3, 0.5)) * 12))
    def pre(d, dy):
        for i, (p, txt) in enumerate((("0x", "hexadezimal"), ("0b", "binär"))):
            x = 670 + i * 280
            d.rounded_rectangle((x, 590 + dy, x + 262, 650 + dy), 30, fill=WHITE, outline=LINE, width=2)
            T2(d, x + 24, 620 + dy, p, M(32, True), RED, "lm"); T2(d, x + 80, 620 + dy, txt, F(26, 600), DARK, "lm")
    f.el(ap(t, ct(3) + 0.3, 0.5), pre, dy=int((1 - ap(t, ct(3) + 0.3, 0.5)) * 12))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 130, "V02 · Informatik", F(34, 600), GREY)
        T2(d, 90, 180, "Wie der Rechner zählt", F(96, 700), DARK)
        T2(d, 90, 310, "Bits, Hex und Überlauf", F(52, 400), GREY)
        for i, ch in enumerate(format(0xFA31, "016b")):
            if i % 4 == 0 and i: pass
            x = 90 + i * 60 + (i // 4) * 24
            cell(d, x, 420, 54, 70, ch, M(36, True), RED if ch == "1" else DARK, r=6)
        for gi, h in enumerate("FA31"):
            x = 90 + gi * (4 * 60 + 24)
            d.rounded_rectangle((x + 60, 510, x + 180, 580), 10, fill=GREEN); T2(d, x + 120, 545, h, M(44, True), WHITE, "mm")
        T2(d, 90, 610, "65535 + 1 = 0 ?", F(44, 700), RED)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SECS, SCENES, LABEL, poster, NAME)
