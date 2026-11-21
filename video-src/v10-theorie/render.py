"""V10 Theorie: Wie funktioniert KI? Aufruf: python render.py [text|tts|zeiten|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v10-common"))
from h10 import *
from texte import SRC

NAME = "v10-theorie"; LABEL = "DHBW · Informatik · V10 · Wie funktioniert KI?"
SECS = make_secs(SRC)
LIGHTG = (236, 238, 241); LIGHTR = (255, 226, 230); LIGHTB = (226, 229, 234); LIGHTA = (236, 238, 241)
BLUE = (75, 85, 99); GREEN = (75, 85, 99); AMBER = (150, 156, 168); GREY2 = (107, 114, 128)
PAL = [((226, 229, 234), (55, 65, 81)), ((240, 241, 244), (75, 85, 99)), ((214, 218, 224), (31, 41, 55)), ((234, 236, 240), (55, 65, 81))]

def show(t, tin, tout=None):
    return ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout is not None else 0))

def fit(txt, font, w, what=""):
    assert font.getlength(txt) <= w, f"{what}: Text zu breit ({font.getlength(txt):.0f} > {w}): {txt}"

def tag(d, x, y, w, h, txt, fill=RED, tc=WHITE, size=24, wt=700, outl=None):
    fit(txt, F(size, wt), w - 16, "Etikett")
    d.rounded_rectangle((x, y, x + w, y + h), h // 2, fill=fill, outline=outl, width=2 if outl else 0)
    T2(d, x + w / 2, y + h / 2, txt, F(size, wt), tc, "mm")

def tick(d, cx, cy, r, col=WHITE, w=4):
    d.line([(cx - r * 0.5, cy), (cx - r * 0.1, cy + r * 0.4), (cx + r * 0.55, cy - r * 0.4)], fill=col, width=w, joint="curve")

def cross(d, cx, cy, r, col=RED, w=4):
    d.line((cx - r * 0.5, cy - r * 0.5, cx + r * 0.5, cy + r * 0.5), fill=col, width=w)
    d.line((cx - r * 0.5, cy + r * 0.5, cx + r * 0.5, cy - r * 0.5), fill=col, width=w)

def chip_w(txt, size, pad=22): return int(F(size, 700).getlength(txt)) + 2 * pad

def chip(d, x, y, w, h, txt, fill, col, size=30, outl=None):
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill, outline=outl or mix(fill, col, 0.35), width=2)
    T2(d, x + w / 2, y + h / 2, txt, F(size, 700), col, "mm")

def monobox(d, x, y, w, h, txt, size=22, col=CODE_T, fill=BOX):
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill)
    fit(txt, M(size), w - 24, "Mono"); T2(d, x + 14, y + h / 2, txt, M(size), col, "lm")

def pct(p): return f"{round(p * 100)} %"
def dez(v, n=1): return f"{v:.{n}f}".replace(".", ",")

def temp_probs(p, T):
    a = [x ** (1 / T) for x in p]; s = sum(a); return [x / s for x in a]

# ---------------------------------------------------------------- 1 Hook
def sc1(f, t, ct):
    heading(f, t, "Eine KI antwortet selbstsicher")
    def chat(d, dy):
        card(d, 60, 130 + dy, 580, 480)
        T2(d, 92, 146 + dy, "Chat", F(24, 700), GREY, "la")
        d.line((92, 182 + dy, 608, 182 + dy), fill=LINE, width=2)
    f.el(show(t, 0.2), chat, dy=int((1 - show(t, 0.2)) * 10))
    def ask(d, dy):
        d.rounded_rectangle((200, 200 + dy, 610, 296 + dy), 16, fill=LIGHTB, outline=BLUE, width=2)
        T2(d, 224, 224 + dy, "Anzugsdrehmoment einer", F(26, 600), DARK, "la")
        T2(d, 224, 258 + dy, "Schraube M10, Klasse 8.8?", F(26, 600), DARK, "la")
    f.el(show(t, ct(0) + 0.6), ask, dy=int((1 - show(t, ct(0) + 0.6)) * 10))
    def ans(d, dy):
        d.rounded_rectangle((92, 330 + dy, 530, 470 + dy), 16, fill=WHITE, outline=LINE, width=2)
        T2(d, 116, 346 + dy, "Das Anzugsmoment beträgt", F(24, 600), DARK, "la")
        T2(d, 116, 386 + dy, "86 Nm", F(60, 700), RED, "la")
    f.el(show(t, ct(1) + 0.5), ans, dy=int((1 - show(t, ct(1) + 0.5)) * 10))
    f.el(show(t, ct(1) + 3.6), lambda d, dy: tag(d, 92, 500 + dy, 280, 44, "klingt sehr sicher", LIGHTG, GREEN, 24, 700, outl=GREEN), dy=int((1 - show(t, ct(1) + 3.6)) * 10))
    # Tabelle
    rows = [("M8", "25 Nm"), ("M10", "49 Nm"), ("M12", "86 Nm")]
    def table(d, dy):
        card(d, 700, 130 + dy, 520, 330)
        T2(d, 732, 146 + dy, "Tabelle (Festigkeitsklasse 8.8)", F(24, 700), GREY, "la")
        for k, (a, b) in enumerate(rows):
            y = 196 + k * 80 + dy
            hotg = ap(t, ct(1) + 6.8, 0.4) if k == 1 else 0
            hotr = ap(t, ct(1) + 9.6, 0.4) if k == 2 else 0
            fill = mix(mix(WHITE, LIGHTG, hotg), LIGHTR, hotr)
            d.rounded_rectangle((730, y, 1190, y + 62), 10, fill=fill, outline=GREEN if hotg > 0.5 else (RED if hotr > 0.5 else LINE), width=3)
            T2(d, 760, y + 31, a, F(34, 700), DARK, "lm"); T2(d, 1160, y + 31, b, F(34, 700), GREEN if hotg > 0.5 else (RED if hotr > 0.5 else DARK), "rm")
    f.el(show(t, ct(1) + 5.2), table, dy=int((1 - show(t, ct(1) + 5.2)) * 10))
    f.el(show(t, ct(1) + 7.0), lambda d, dy: tag(d, 700, 480 + dy, 240, 44, "richtig: 49 Nm", LIGHTG, GREEN, 24, 700, outl=GREEN))
    def arr(d, dy):
        arrow(d, 540, 410 + dy, 726, 390 + dy, RED, 5, 16)
    f.el(show(t, ct(1) + 9.6), arr)
    f.el(show(t, ct(1) + 9.8), lambda d, dy: tag(d, 960, 480 + dy, 260, 44, "gehört zur M12", LIGHTR, RED, 24, 700, outl=RED))
    f.el(show(t, ct(2) + 0.4), lambda d, dy: tag(d, 700, 560 + dy, 520, 54, "Woher kommt diese Sicherheit?", RED, WHITE, 28), dy=int((1 - show(t, ct(2) + 0.4)) * 10))

# ---------------------------------------------------------------- 2 Tokens
TOK = [("Der", 12), ("Wellen", 874), ("dicht", 391), ("ring", 56), ("sitzt", 207), ("im", 45), ("Lager", 633), ("schild", 910), (".", 5)]

def tok_layout(size=34, gap=10, pad=20):
    ws = [chip_w(w, size, pad) for w, _ in TOK]; tot = sum(ws) + gap * (len(ws) - 1); x = (W - tot) / 2; xs = []
    for w in ws: xs.append(x); x += w + gap
    return xs, ws

def sc2(f, t, ct):
    heading(f, t, "Text wird zu Tokens")
    xs, ws = tok_layout()
    # Satz im Klartext
    def sent(d, dy):
        card(d, 60, 130 + dy, 1160, 90)
        T2(d, 640, 175 + dy, "Der Wellendichtring sitzt im Lagerschild.", F(42, 600), DARK, "mm")
    f.el(show(t, ct(0) + 0.5, ct(1) - 0.3), sent, dy=int((1 - show(t, ct(0) + 0.5)) * 10))
    f.el(show(t, ct(0) + 2.0, ct(1) - 0.3), lambda d, dy: tag(d, 440, 250 + dy, 400, 48, "ein Sprachmodell: Tokens", WHITE, DARK, 26, 700, outl=LINE))
    f.el(show(t, ct(1) + 0.1), lambda d, dy: tag(d, 60, 124 + dy, 230, 44, "Tokenizer", BLUE, WHITE, 26))
    for k, (w, n) in enumerate(TOK):
        a = show(t, ct(1) + 0.7 + 0.32 * k)
        fill, col = PAL[k % 4]
        f.el(a, lambda d, dy, k=k, w=w, fill=fill, col=col: chip(d, xs[k], 200 + dy, ws[k], 66, w, fill, col, 34), dy=int((1 - a) * 12))
        a2 = show(t, ct(1) + 3.8 + 0.28 * k)
        f.el(a2, lambda d, dy, k=k, n=n, col=col: T2(d, xs[k] + ws[k] / 2, 296 + dy, str(n), M(30, True), col, "mm"), dy=int((1 - a2) * 8))
    f.el(show(t, ct(1) + 3.6), lambda d, dy: T2(d, 60, 324 + dy, "jedes Stück bekommt eine Nummer", F(24, 600), GREY, "la"))
    # Klammern
    def brk(d, dy, i0, i1, txt, col, y, size=24):
        x0 = xs[i0]; x1 = xs[i1] + ws[i1]
        d.line((x0, y + dy, x1, y + dy), fill=col, width=4); d.line((x0, y + dy, x0, y - 10 + dy), fill=col, width=4); d.line((x1, y + dy, x1, y - 10 + dy), fill=col, width=4)
        T2(d, (x0 + x1) / 2, y + 12 + dy, txt, F(size, 700), col, "ma")
    f.el(show(t, ct(2) + 0.5), lambda d, dy: (brk(d, dy, 0, 0, "1 Token", GREEN, 400, 22), brk(d, dy, 4, 5, "1 Token je Wort", GREEN, 400, 22)))
    f.el(show(t, ct(2) + 3.6), lambda d, dy: brk(d, dy, 1, 3, "Wellendichtring = 3 Tokens", RED, 400, 26))
    # Modell sieht nur Nummern
    def model(d, dy):
        card(d, 60, 500 + dy, 1160, 150)
        T2(d, 92, 514 + dy, "Das Modell sieht nur:", F(26, 700), GREY, "la")
        txt = "[12, 874, 391, 56, 207, 45, 633, 910, 5]"
        monobox(d, 92, 560 + dy, 860, 62, txt, 36, CODE_N)
    f.el(show(t, ct(3) + 0.1), model, dy=int((1 - show(t, ct(3) + 0.1)) * 10))

# ---------------------------------------------------------------- 3 Training: Nachfolger zaehlen
def sc3(f, t, ct):
    heading(f, t, "Training: Nachfolger zählen")
    # Trainingspaare
    def strip(d, dy):
        card(d, 60, 124 + dy, 1160, 96)
        T2(d, 92, 136 + dy, "Trainingstext: Paare aus Kontext und Nachfolger", F(22, 700), GREY, "la")
    f.el(show(t, 0.3), strip)
    folg = ["welle", "welle", "schraube", "welle", "welle"]
    for k, nx in enumerate(folg):
        a = show(t, ct(0) + 0.8 + 0.62 * k); x = 92 + k * 224
        def pair(d, dy, x=x, nx=nx):
            fill, col = (LIGHTB, BLUE) if nx == "welle" else (LIGHTA, GREY2)
            d.rounded_rectangle((x, 168 + dy, x + 208, 208 + dy), 10, fill=WHITE, outline=LINE, width=2)
            T2(d, x + 14, 188 + dy, "die", F(24, 700), DARK, "lm"); arrow(d, x + 62, 188 + dy, x + 92, 188 + dy, GREY, 3, 9)
            d.rounded_rectangle((x + 98, 174 + dy, x + 200, 202 + dy), 8, fill=fill)
            T2(d, x + 149, 188 + dy, nx, F(22, 700), col, "mm")
        f.el(a, pair, dy=int((1 - a) * 8))
    # Tabelle
    def table(d, dy):
        card(d, 60, 250 + dy, 700, 330)
        T2(d, 92, 264 + dy, "Kontext:", F(26, 700), GREY, "la"); chip(d, 200, 258 + dy, 90, 44, "die", LIGHTR, RED, 28)
        for x, h in ((92, "Nachfolger"), (380, "Anzahl"), (500, "Wahrscheinlichkeit")):
            T2(d, x, 330 + dy, h, F(22, 700), GREY, "la")
        d.line((92, 362 + dy, 730, 362 + dy), fill=LINE, width=2)
    f.el(show(t, ct(1) + 0.3), table, dy=int((1 - show(t, ct(1) + 0.3)) * 10))
    f.el(show(t, ct(1) + 2.2), lambda d, dy: T2(d, 330, 270 + dy, "5 Beispiele", F(24, 700), DARK, "la"))
    def row(d, dy, y, nm, cnt, p, fill, col, tc, tb, lf):
        chip(d, 92, y + dy, 170, 54, nm, lf, col, 28)
        a = ap(t, tc, 0.4); T2(d, 400, y + 27 + dy, str(cnt), F(36, 700), DARK, "mm") if a > 0.1 else None
        b = ap(t, tb, 0.8); bw = int(300 * p * b)
        if bw > 0:
            d.rounded_rectangle((500, y + 4 + dy, 500 + max(bw, 12), y + 50 + dy), 8, fill=col)
            lab = pct(p * b)
            if bw > 100: T2(d, 500 + bw - 10, y + 27 + dy, lab, F(28, 700), WHITE, "rm")
            else: T2(d, 500 + bw + 12, y + 27 + dy, lab, F(28, 700), col, "lm")
    a1 = show(t, ct(1) + 3.0); a2 = show(t, ct(1) + 4.5)
    f.el(a1, lambda d, dy: row(d, dy, 384, "welle", 4, 0.8, BLUE, BLUE, ct(1) + 3.0, ct(1) + 6.3, LIGHTB), dy=int((1 - a1) * 8))
    f.el(a2, lambda d, dy: row(d, dy, 462, "schraube", 1, 0.2, GREY2, GREY2, ct(1) + 4.5, ct(1) + 8.3, LIGHTA), dy=int((1 - a2) * 8))
    # Bigramm / Netz
    f.el(show(t, ct(2) + 0.4), lambda d, dy: tag(d, 800, 260 + dy, 420, 54, "Bigramm: Kontext = 1 Wort", BLUE, WHITE, 26), dy=int((1 - show(t, ct(2) + 0.4)) * 10))
    def net(d, dy):
        card(d, 800, 340 + dy, 420, 240)
        T2(d, 1010, 354 + dy, "neuronales Netz", F(26, 700), DARK, "ma")
        cols = [(840, [420, 480, 540]), (950, [400, 450, 500, 550]), (1060, [420, 480, 540]), (1170, [450, 510])]
        for (xa, ya), (xb, yb) in zip(cols[:-1], cols[1:]):
            for y0 in ya:
                for y1 in yb: d.line((xa, y0 + dy, xb, y1 + dy), fill=LINE, width=1)
        for x, ys in cols:
            for y in ys: d.ellipse((x - 11, y - 11 + dy, x + 11, y + 11 + dy), fill=WHITE, outline=BLUE, width=3)
    f.el(show(t, ct(2) + 4.4), net, dy=int((1 - show(t, ct(2) + 4.4)) * 10))
    f.el(show(t, ct(2) + 6.4), lambda d, dy: tag(d, 800, 596 + dy, 420, 50, "gleiches Ergebnis: 80 % / 20 %", WHITE, DARK, 24, 700, outl=LINE))
    f.el(show(t, ct(2) + 7.8), lambda d, dy: tag(d, 60, 612 + dy, 700, 54, "Gelernt wird dasselbe: Nachfolger zählen", RED, WHITE, 28))

# ---------------------------------------------------------------- 4 Wuerfeln, Temperatur, Seed
def tcurve(t, ct1):
    s0 = ct1 + 2.2; s1 = ct1 + 3.0; s2 = ct1 + 4.9; s3 = ct1 + 5.8
    if t < s0: return 1.0
    if t < s2: return lerp(1.0, 0.3, ap(t, s0, s1 - s0))
    return lerp(0.3, 2.0, ap(t, s2, s3 - s2))

def band(d, x, y, w, h, probs, marker=None, nm=("welle", "schraube")):
    wd = int(w * probs[0])
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=(214, 218, 224), outline=LINE, width=2)
    d.rounded_rectangle((x, y, x + wd, y + h), 10, fill=(55, 65, 81))
    if wd < w - 12: d.rectangle((x + wd - 12, y, x + wd, y + h), fill=(55, 65, 81)) if wd > 20 else None
    T2(d, x + 18, y + h / 2, f"{nm[0]}  {pct(probs[0])}", F(30, 700), WHITE, "lm")
    p1 = probs[1]
    lab = f"{nm[1]}  {pct(p1)}"
    if w * p1 > F(30, 700).getlength(lab) + 30: T2(d, x + w - 18, y + h / 2, lab, F(30, 700), GREY2, "rm")
    else: T2(d, x + w, y + h + 10, lab, F(26, 700), GREY2, "ra")
    if marker is not None:
        mx = x + w * marker
        d.polygon([(mx - 13, y - 30), (mx + 13, y - 30), (mx, y - 4)], fill=RED); d.line((mx, y - 4, mx, y + h), fill=RED, width=4)

def sc4(f, t, ct):
    heading(f, t, "Erzeugen: würfeln, Token für Token")
    c1 = ct(1)
    T = tcurve(t, c1)
    probs = temp_probs([0.8, 0.2], T)
    mk = ap(t, ct(0) + 1.4, 1.0) * 0.37
    if t >= c1 + 0.4: mk = lerp(0.37, 0.72, ap(t, c1 + 0.4, 0.6))
    def bd(d, dy):
        T2(d, 120, 126 + dy, "Würfelband: Breite = Wahrscheinlichkeit", F(24, 700), GREY, "la")
        band(d, 120, 180 + dy, 1040, 64, probs, mk if t > ct(0) + 1.4 else None)
        if t > ct(0) + 1.4:
            hit = "welle" if mk < probs[0] else "schraube"
            T2(d, 120, 262 + dy, f"Zufallszahl {dez(mk, 2)}: {hit}", F(28, 700), RED, "la")
    f.el(show(t, ct(0) + 0.3), bd, dy=int((1 - show(t, ct(0) + 0.3)) * 10))
    # Satzbau
    words = [("die", ct(0) + 0.6), ("welle", ct(0) + 3.0), ("sitzt", ct(0) + 4.3), ("im", ct(0) + 4.9), ("lager", ct(0) + 5.5), (".", ct(0) + 6.1)]
    def sat(d, dy):
        card(d, 60, 364 + dy, 1160, 90)
        T2(d, 92, 376 + dy, "Satz", F(22, 700), GREY, "la")
        x = 92
        for k, (w, tw) in enumerate(words):
            a = ap(t, tw, 0.3)
            if a <= 0: continue
            wd = chip_w(w, 30, 18); fill, col = PAL[k % 4]
            chip(d, x, 408 + dy, wd, 40, w, mix(WHITE, fill, a), mix(WHITE, col, a) if a < 1 else col, 28); x += wd + 10
    f.el(show(t, ct(0) + 0.5), sat)
    # Code
    f.el(show(t, ct(0) + 4.6, ct(1) - 0.1), lambda d, dy: code_panel(d, 60, 480 + dy, 700, ["wort = random.choice(nachfolger[wort])"], [ct(0) + 5.0], t, 26, 70, lineno=False, title="Python", pad_bottom=14))
    # Slider
    def sl(d, dy):
        T2(d, 120, 296 + dy + 0, "", F(22, 400), GREY) if False else None
        T2(d, 120, 306 + dy, f"Temperatur  {dez(T)}", F(30, 700), DARK, "la")
        x0, x1, y = 420, 820, 324
        d.rounded_rectangle((x0, y - 5, x1, y + 5), 5, fill=LINE)
        kx = x0 + (x1 - x0) * (T - 0.1) / 2.0
        d.ellipse((kx - 15, y - 15, kx + 15, y + 15), fill=RED, outline=WHITE, width=3)
    f.el(show(t, c1 + 0.3), lambda d, dy: sl(d, dy))
    f.el(show(t, c1 + 2.3), lambda d, dy: tag(d, 60, 480 + dy, 560, 48, "niedrig: fast immer das häufigste Wort", LIGHTB, BLUE, 24, 700, outl=BLUE))
    f.el(show(t, c1 + 5.0), lambda d, dy: tag(d, 640, 480 + dy, 580, 48, "hoch: auch Unwahrscheinliches kommt dran", LIGHTA, GREY2, 24, 700, outl=AMBER))
    # Seed
    def seed(d, dy):
        card(d, 60, 530 + dy, 1160, 140)
        T2(d, 92, 546 + dy, "Seed", F(26, 700), GREY, "la"); monobox(d, 92, 584 + dy, 100, 52, "4", 34, CODE_N)
        for k, (y0, nm) in enumerate(((548, "Lauf 1"), (606, "Lauf 2"))):
            a = ap(t, ct(2) + 1.6 + 1.0 * k, 0.4)
            if a > 0:
                T2(d, 260, y0 + 20 + dy, nm, F(24, 700), GREY, "lm")
                monobox(d, 360, y0 + dy, 560, 44, "die welle sitzt im lager .", 26, CODE_T)
    f.el(show(t, ct(2) + 0.3), seed)
    f.el(show(t, ct(2) + 3.0), lambda d, dy: tag(d, 940, 570 + dy, 250, 70, "gleich!", GREEN, WHITE, 32))

# ---------------------------------------------------------------- 5 Kontext und Halluzination
SENT = ["das", "zahnrad", "treibt", "die", "schraube", "hält", "das", "zahnrad", "."]

def sc5(f, t, ct):
    heading(f, t, "Kontext und Halluzination")
    size, gap, pad = 30, 12, 18
    ws = [chip_w(w, size, pad) for w in SENT]; tot = sum(ws) + gap * (len(ws) - 1); x = (W - tot) / 2; xs = []
    for w in ws: xs.append(x); x += w + gap
    cy = 140; ch = 56
    # die ersten fuenf Chips (c0), Rest ab c1
    for k, w in enumerate(SENT):
        tin = ct(0) + 0.3 + 0.2 * k if k < 5 else ct(1) + 0.1 + 0.3 * (k - 5)
        a = show(t, tin); fill, col = PAL[k % 4]
        f.el(a, lambda d, dy, k=k, w=w, fill=fill, col=col: chip(d, xs[k], cy + dy, ws[k], ch, w, fill, col, size), dy=int((1 - a) * 10))
    # Fragezeichen auf Position 5 in c0
    a = show(t, ct(0) + 1.4, ct(1) + 0.1)
    f.el(a, lambda d, dy: chip(d, xs[5], cy + dy, ws[5], ch, "?", WHITE, RED, 34, RED))
    # Kontextfenster
    def mini(d, dy):
        d.rounded_rectangle((xs[4] - 6, cy - 6 + dy, xs[4] + ws[4] + 6, cy + ch + 6 + dy), 12, outline=RED, width=4)
        cx = xs[4] + ws[4] / 2
        d.line((cx, cy + ch + 8 + dy, cx, 244 + dy), fill=RED, width=3)
        T2(d, cx, 250 + dy, "Mini-Modell: 1 Wort Kontext", F(26, 700), RED, "ma")
    f.el(show(t, ct(0) + 3.0, ct(1) - 0.2), mini)
    def big(d, dy):
        x0 = xs[0]; x1 = xs[5] + ws[5]; y = 330
        d.line((x0, y + dy, x1, y + dy), fill=BLUE, width=5); d.line((x0, y + dy, x0, y - 12 + dy), fill=BLUE, width=5); d.line((x1, y + dy, x1, y - 12 + dy), fill=BLUE, width=5)
        T2(d, (x0 + x1) / 2, y + 14 + dy, "große Modelle: viele tausend Tokens Kontext", F(26, 700), BLUE, "ma")
    f.el(show(t, ct(0) + 6.0, ct(1) - 0.2), big)
    # Wortpaare in c1
    def pairs(d, dy):
        for k in range(len(SENT) - 1):
            a = ap(t, ct(1) + 0.5 + 0.55 * k, 0.3)
            if a <= 0: continue
            y = 228 + (k % 2) * 34; xa = xs[k] + ws[k] / 2; xb = xs[k + 1] + ws[k + 1] / 2
            col = mix(WHITE, GREEN, a)
            d.line((xa, cy + ch + 6 + dy, xa, y + dy), fill=col, width=3); d.line((xb, cy + ch + 6 + dy, xb, y + dy), fill=col, width=3)
            d.line((xa, y + dy, xb, y + dy), fill=col, width=3)
            tick(d, (xa + xb) / 2, y + 16 + dy, 16, col, 3)
    f.el(show(t, ct(1) + 0.4), pairs)
    f.el(show(t, ct(1) + 4.4), lambda d, dy: tag(d, 60, 330 + dy, 600, 46, "jedes Wortpaar kam im Training vor", LIGHTG, GREEN, 24, 700, outl=GREEN))
    f.el(show(t, ct(1) + 4.6), lambda d, dy: tag(d, 700, 330 + dy, 280, 46, "klingt flüssig", GREEN, WHITE, 24))
    f.el(show(t, ct(1) + 6.0), lambda d, dy: tag(d, 1000, 330 + dy, 220, 46, "falsch", RED, WHITE, 24))
    # Halluzination
    def stamp(d, dy):
        d.rounded_rectangle((60, 430 + dy, 600, 540 + dy), 18, fill=WHITE, outline=RED, width=8)
        T2(d, 330, 485 + dy, "Halluzination", F(72, 700), RED, "mm")
    f.el(show(t, ct(2) + 1.0), stamp, dy=int((1 - show(t, ct(2) + 1.0)) * 16))
    def sign(d, dy):
        card(d, 650, 430 + dy, 570, 110, fill=LIGHTR)
        d.ellipse((676, 458 + dy, 732, 514 + dy), outline=RED, width=6); d.line((686, 504 + dy, 722, 468 + dy), fill=RED, width=6)
        T2(d, 752, 485 + dy, "keine Quellenprüfung", F(36, 700), RED, "lm")
    f.el(show(t, ct(2) + 3.4), sign, dy=int((1 - show(t, ct(2) + 3.4)) * 10))
    f.el(show(t, ct(2) + 5.2), lambda d, dy: tag(d, 60, 580 + dy, 560, 56, "erzeugt: Wahrscheinliches", LIGHTG, GREEN, 30, 700, outl=GREEN))
    f.el(show(t, ct(2) + 6.2), lambda d, dy: tag(d, 660, 580 + dy, 560, 56, "nicht: Wahres", LIGHTR, RED, 30, 700, outl=RED))

# ---------------------------------------------------------------- 6 Checkliste
ITEMS = [("Zahlen gegenrechnen oder nachschlagen", 2.4, 0), ("Einheiten prüfen", 5.7, 0), ("Normen im Original öffnen", 6.8, 0),
         ("Quellen anklicken", 8.5, 0), ("Randfälle testen", 9.5, 0), ("Nichts Vertrauliches eingeben", 0.9, 1)]

def sc6(f, t, ct):
    heading(f, t, "Nachprüfen statt glauben")
    for k, (txt, dt, chunk) in enumerate(ITEMS):
        tin = ct(chunk) + dt; a = show(t, tin); y = 130 + k * 82
        def it(d, dy, k=k, txt=txt, y=y, bad=(chunk == 1)):
            card(d, 60, y + dy, 740, 66, fill=LIGHTR if bad else WHITE)
            col = RED if bad else GREEN
            d.ellipse((84, y + 12 + dy, 128, y + 56 + dy), fill=col)
            if bad: d.line((95, y + 34 + dy, 117, y + 34 + dy), fill=WHITE, width=6)
            else: tick(d, 106, y + 34 + dy, 24, WHITE, 5)
            T2(d, 150, y + 33 + dy, txt, F(32, 700), DARK, "lm")
        f.el(a, it, dy=int((1 - a) * 10))
    def box(d, dy):
        card(d, 840, 130 + dy, 380, 320)
        d.rounded_rectangle((870, 160 + dy, 1090, 206 + dy), 23, fill=LIGHTG, outline=GREEN, width=2)
        d.ellipse((884, 170 + dy, 910, 196 + dy), fill=GREEN)
        T2(d, 930, 183 + dy, "Im Kopf", F(26, 700), GREEN, "lm")
        T2(d, 870, 240 + dy, "Die KI entwirft,", F(34, 600), GREY, "la")
        T2(d, 870, 290 + dy, "du verantwortest", F(34, 700), DARK, "la")
        T2(d, 870, 336 + dy, "das Ergebnis.", F(34, 700), RED, "la")
    f.el(show(t, ct(2) + 0.5), box, dy=int((1 - show(t, ct(2) + 0.5)) * 10))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V10 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Wie funktioniert KI?", F(88, 700), DARK)
        T2(d, 90, 290, "Tokens, Wahrscheinlichkeit und Halluzination", F(48, 400), GREY)
        x = 90
        for k, w in enumerate(["die", "welle", "sitzt", "im", "lager"]):
            wd = chip_w(w, 40, 24); fill, col = PAL[k % 4]
            chip(d, x, 440, wd, 80, w, fill, col, 40); x += wd + 14
        d.rounded_rectangle((x, 440, x + 80, 520), 10, fill=WHITE, outline=RED, width=4); T2(d, x + 40, 480, "?", F(44, 700), RED, "mm")
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
