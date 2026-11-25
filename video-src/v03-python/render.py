"""Termin 03, Video 2: Python-Werkzeugkasten: elif, and, or (Karte 1 Ampel mit elif, Lauf mit Sekunde 32,
Karte 2 Achterbahn mit and, dieselbe Zeile mit or).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Code und Ausgaben wie im Labor (app/inhalte/v03/labor.mdx, Syntaxkarten sk-elif und sk-and-or); alles nachgerechnet."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v03-python"; LABEL = "DHBW · Informatik · Termin 03 · Python-Werkzeugkasten"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet, wie die Syntaxkarten im Labor)
CODE1 = ["sekunde = 32", "if sekunde < 30:", '    print("Grün")', "elif sekunde < 35:", '    print("Gelb")', "else:", '    print("Rot")']
assert run(NL.join(CODE1)) == ["Gelb"]
def farbe(s): return "Grün" if s < 30 else ("Gelb" if s < 35 else "Rot")
for _s in range(60):
    assert run(NL.join([f"sekunde = {_s}"] + CODE1[1:])) == [farbe(_s)]
assert (32 < 30) is False and (32 < 35) is True
GELB = (245, 190, 30)
ZEIT = [(0, 30, "Grün", GREEN, "0 bis 29"), (30, 35, "Gelb", GELB, "30 bis 34"), (35, 60, "Rot", RED, "35 bis 59")]
for _a, _b, _n, _c, _t in ZEIT:
    assert all(farbe(s) == _n for s in range(_a, _b)) and _t == f"{_a} bis {_b - 1}"

CODE_AND = ["groesse = 150", "alter = 9", "print(groesse >= 140 and alter >= 10)"]
CODE_OR = CODE_AND + ["print(groesse >= 140 or alter >= 10)"]
OUT_AND = run(NL.join(CODE_AND)); assert OUT_AND == ["False"]
OUT_OR = run(NL.join(CODE_OR)); assert OUT_OR == ["False", "True"]
assert (150 >= 140) is True and (9 >= 10) is False
LINKS, RECHTS = "groesse >= 140", "alter >= 10"
L_GAP = f"print({LINKS}     {RECHTS})"          # vor dem and: Platz fuer " and "
assert L_GAP.replace("     ", " and ") == CODE_AND[2] and CODE_AND[2].replace(" and ", " or ") == CODE_OR[3]


# ---------------------------------------------------------------- eigene Bausteine (nur dieses Video)
def kasten(d, x, y, w, size, lh, rows, nums):
    """Code-Kasten wie code_lauf, aber mit gleitender Zeilenzahl (rows darf gebrochen sein) und Zeilennummern
    mit eigener Deckkraft: nums = {zeile: deckkraft}. Gibt CodeGeo zurueck."""
    g = CodeGeo(x, y, w, size, lh, 1); h = 50 + lh * rows + 18; imbild(y, y + h, "Code")
    d.rounded_rectangle((x, y, x + w, y + h), 14, fill=BOX); T(d, x + 22, y + 14, "Python", F(20, 600), CODE_C)
    f = M(size)
    for k, al in nums.items():
        al = min(al, clamp(rows - k))          # Nummer erst, wenn ihre Zeile im Kasten Platz hat
        if al > 0.01: d.text((x + 20, g.zy(k)), f"{k + 1:>2}", font=f, fill=mix(BOX, CODE_C, 0.8 * clamp(al)))
    return g


def zeile(d, g, slot, txt, n=10 ** 9, dim=1.0, ab=0):
    """Eine Code-Zeile an (gebrochener) Zeilenposition slot im Kasten g; ab: erst ab Spalte ab zeichnen."""
    fit(txt, M(g.size), g.w - g.off - 16, "Code-Zeile")
    segs = highlight(txt)
    if ab:
        assert "".join(s for s, _ in segs)[:ab] == txt[:ab]; rest = []; c = 0
        for s_, col in segs:
            if c + len(s_) > ab: rest.append((s_[max(0, ab - c):], col))
            c += len(s_)
        segs = rest
    draw_segs(d, g.cx(ab), g.y + 50 + slot * g.lh, segs, M(g.size), n, dim)


def fluchtlinie(d, g, i0, i1, col=RED, w=3):
    """Gestrichelte Linie zwischen Zeilennummer und Code (etwas weiter links als code_fluchtlinie aus b02, damit sie
    die Rahmen um if, elif, else nicht schneidet)."""
    xl = g.cx(0) - 10; ya, yb = g.zy(i0) - 6, g.zy(i1) + g.lh - 4; yy = ya
    while yy < yb:
        d.line((xl, yy, xl, min(yy + 10, yb)), fill=col, width=w); yy += 17


def ampel(d, x, y, w, an):
    """Ampel (Gehaeuse, oben Rot, Mitte Gelb, unten Gruen). an: {"Rot": 0..1, ...} Leuchtkraft je Licht."""
    h = w * 2.6; imbild(y, y + h + 40, "Ampel")
    d.rectangle((x + w / 2 - 9, y + h, x + w / 2 + 9, y + h + 40), fill=GREY)
    d.rounded_rectangle((x, y, x + w, y + h), int(w * 0.22), fill=DARK)
    r = w * 0.33
    for k, (name, col) in enumerate((("Rot", RED), ("Gelb", GELB), ("Grün", GREEN))):
        cx, cy = x + w / 2, y + h * (0.19 + 0.31 * k)
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=mix(mix(DARK, col, 0.22), col, clamp(an.get(name, 0))))


def zeitstrahl(f, t, x0, x1, y, t_achse, t_seg, h=48):
    """Ein Umlauf von 60 Sekunden als Balken: Gruen 0 bis 29, Gelb 30 bis 34, Rot 35 bis 59 (Segmente ab t_seg[k])."""
    imbild(y - 40, y + h + 40, "Zeitstrahl")
    px = lambda s: x0 + (x1 - x0) * s / 60
    def achse(d, dy):
        TB(d, x0, y - 12 + dy, "Sekunde im Umlauf", F(24, 600), GREY, 400, "ls")
        d.rounded_rectangle((x0, y + dy, x1, y + h + dy), 8, fill=WHITE, outline=LINE, width=2)
    E(f, t, t_achse, achse)
    for (s0, s1, name, col, txt), tin in zip(ZEIT, t_seg):
        def seg(d, dy, s0=s0, s1=s1, name=name, col=col, txt=txt):
            xa, xb = px(s0), px(s1)
            d.rectangle((xa + 1, y + 2 + dy, xb - 1, y + h - 2 + dy), fill=col)
            TB(d, (xa + xb) / 2, y + h / 2 + dy, name, F(26, 700), DARK if col == GELB else WHITE, xb - xa - 8, "mm", "Zeitstrahl")
            TB(d, (xa + xb) / 2, y + h + 8 + dy, txt, F(24, 700), AMB if col == GELB else col, 220, "ma", "Zeitstrahl")
        E(f, t, tin, seg)


def schild(d, x, y, w, h, a1=1.0, a2=1.0):
    """Schild am Eingang der Achterbahn: zwei Regeln (blau: Groesse, braun: Alter), mit Deckkraft a1, a2."""
    imbild(y, y + h, "Schild")
    card(d, x, y, w, h, stripe=False)
    d.rounded_rectangle((x, y, x + w, y + 64), 14, fill=RED); d.rectangle((x, y + 40, x + w, y + 64), fill=RED)
    TB(d, x + w / 2, y + 32, "Achterbahn", F(34, 700), WHITE, w - 30, "mm", "Schild")
    # kleine Bahn mit Wagen
    pts = [(x + 24 + k * (w - 48) / 40, y + h - 34 - 22 * math.sin(k / 40 * 2 * math.pi * 1.25) ** 2) for k in range(41)]
    d.line(pts, fill=GREYL, width=4, joint="curve")
    cxw, cyw = pts[30]; d.rounded_rectangle((cxw - 20, cyw - 22, cxw + 20, cyw - 2), 6, fill=RED)
    for k, (txt, col, al) in enumerate((("mindestens 140 cm", BLUE, a1), ("mindestens 10 Jahre", AMB, a2))):
        if al <= 0.01: continue
        yy = y + 106 + k * 64; c = mix(WHITE, col, al); c2 = mix(WHITE, DARK, al)
        d.ellipse((x + 22, yy - 9, x + 40, yy + 9), fill=c)
        TB(d, x + 50, yy, txt, F(26, 700), c2, w - 58, "lm", "Schild")
    if a2 > 0.01: TB(d, x + 52, y + 138, "und", F(22, 600), mix(WHITE, GREY, a2), 100, "lm", "Schild")


def klammer(d, g, i, c0, c1, col, dy=0):
    """Klammer unter den Zeichen c0..c1 der Code-Zeile i (unterhalb des Kastens). Gibt die Mitte zurueck."""
    xa, xb = g.cx(c0), g.cx(c1); yy = g.y + g.h + 12 + dy
    d.line((xa, yy, xa, yy + 10, xb, yy + 10, xb, yy), fill=col, width=4, joint="curve")
    return (xa + xb) / 2


def chip_breite(wert, h): return F(int(h * 0.6), 700).getlength(wert) + h * 0.9


def verknuepfung(f, t, g, i, zl, wl, wr, wort, erg, t_l, t_r, t_wort, t_erg, t_lab=None, t_lab_aus=None):
    """Unter der Code-Zeile i: Klammern unter beiden Vergleichen, darunter erst links/rechts (t_lab), dann die eingesetzten
    Werte mit wahr/falsch (t_l, t_r), dazwischen das Wort (und/oder), rechts Pfeil und Gesamtergebnis (t_erg)."""
    ln = zl
    cl = spalte(ln, LINKS); cr = spalte(ln, RECHTS)
    ml = (g.cx(cl[0]) + g.cx(cl[1])) / 2; mr = (g.cx(cr[0]) + g.cx(cr[1])) / 2
    yb = g.y + g.h; yt = yb + 26; ych = yt + 44; hc = 56
    for (c0, c1), col, tk in ((cl, BLUE, t_l if t_lab is None else t_lab), (cr, AMB, t_r if t_lab is None else t_lab + 0.5)):
        E(f, t, tk, lambda d, dy, c0=c0, c1=c1, col=col: klammer(d, g, i, c0, c1, col, dy))
    if t_lab is not None:
        E(f, t, t_lab, lambda d, dy: TB(d, ml, yt + dy, "links", F(26, 700), BLUE, 200, "ma"), tout=t_lab_aus)
        E(f, t, t_lab + 0.5, lambda d, dy: TB(d, mr, yt + dy, "rechts", F(26, 700), AMB, 200, "ma"), tout=t_lab_aus)
    werte = (("150 >= 140", wl, ml, t_l, BLUE), ("9 >= 10", wr, mr, t_r, AMB))
    for txt, w_, m, tk, col in werte:
        assert w_ == ("wahr" if eval(txt) else "falsch"), txt
        def wert(d, dy, txt=txt, w_=w_, m=m, col=col):
            TB(d, m, yt + dy, txt, M(26, True), col, 260, "ma")
            wert_chip(d, m, ych + dy, w_, hc, anchor="m")
        E(f, t, tk, wert)
    xl1 = ml + chip_breite(wl, hc) / 2; xr0 = mr - chip_breite(wr, hc) / 2
    E(f, t, t_wort, lambda d, dy: TB(d, (xl1 + xr0) / 2, ych + hc / 2 + dy, wort, F(30, 700), RED, xr0 - xl1 - 12, "mm"))
    xr1 = mr + chip_breite(wr, hc) / 2
    def gesamt(d, dy):
        pfeil(d, xr1 + 12, ych + hc / 2 + dy, xr1 + 48, ych + hc / 2 + dy, GREY, 6, 18)
        x_end = wert_chip(d, xr1 + 58, ych + dy, erg, hc)
        assert x_end <= 904, f"Ergebnis reicht bis {x_end:.0f}"
    E(f, t, t_erg, gesamt)
    return ych + hc


# Lage der Code-Kaesten
G1 = dict(x=60, y=116, w=500, size=28, lh=48)            # Szene 2 und 3 (Ampel)
NOTE_X, NOTE_W = 596, 464
AMPEL = (1080, 130, 140)
G4 = dict(x=60, y=140, w=760, size=28, lh=50)            # Szene 4 und 5 (Achterbahn)
SCHILD = (920, 140, 300, 260)
AUSG = (920, 420, 300)
TAG_Y = 596


# ---------------------------------------------------------------- 1 Zwei neue Karten
ALT = [("Vergleichen", "punkte >= 50"), ("if und else", "if punkte >= 50:"), ("f-String", 'f"{preis:.2f} Euro"')]

def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Zwei neue Karten im Werkzeugkasten")
    # die drei Karten aus Termin 02: blass, hinten (oben)
    E(f, t, a(1, 0.05), lambda d, dy: TB(d, 60, 112 + dy, "Aus Termin 02, gilt weiter:", F(26, 600), GREY, 600))
    for k, ((titel, code), fr) in enumerate(zip(ALT, (0.45, 0.65, 0.85))):
        def alt(d, dy, k=k, titel=titel, code=code):
            x = 60 + k * 400; y = 150 + dy
            card(d, x, y, 360, 120, stripe=False); d.rounded_rectangle((x, y, x + 360, y + 8), 4, fill=GREY)
            TB(d, x + 24, y + 38, titel, F(28, 700), DARK, 310, "lm")
            d.rounded_rectangle((x + 16, y + 66, x + 344, y + 106), 8, fill=BOX)
            TB(d, x + 180, y + 86, code, M(22), CODE_T, 310, "mm")
        f.el(0.4 * show(t, a(1, fr)), alt, dy=dyf(t, a(1, fr)))
    # die zwei neuen Karten: vorn, gross
    neu = [(1, ["elif"], "mehr als zwei Wege"), (2, ["and", "or"], "zwei Vergleiche verbinden")]
    t_wort = iter([a(2, 0.42), a(2, 0.62), a(2, 0.82)])
    for (nr, woerter, unter), t_k, t_u in zip(neu, (a(0, 0.15), a(0, 0.45)), (a(3, 0.0), a(3, 0.5))):
        x = 60 + (nr - 1) * 600; y = 310; w = 560; h = 300
        def karte(d, dy, x=x, nr=nr):
            card(d, x, y + dy, w, h, stripe=False); d.rounded_rectangle((x, y + dy, x + w, y + 10 + dy), 5, fill=RED)
            num_circle(d, x + 44, y + 58 + dy, 22, nr, RED)
            TB(d, x + 80, y + 58 + dy, f"Karte {nr}", F(34, 700), DARK, 300, "lm")
        E(f, t, t_k, karte)
        bw = 200 if len(woerter) == 2 else 240; gap = 40
        x0 = x + (w - (bw * len(woerter) + gap * (len(woerter) - 1))) / 2
        for j, wort in enumerate(woerter):
            def box(d, dy, xb=x0 + j * (bw + gap), wort=wort):
                d.rounded_rectangle((xb, y + 104 + dy, xb + bw, y + 200 + dy), 14, fill=BOX)
                TB(d, xb + bw / 2, y + 152 + dy, wort, M(60, True), CODE_K, bw - 24, "mm")
            E(f, t, next(t_wort), box)
        E(f, t, t_u, lambda d, dy, x=x, unter=unter: TB(d, x + w / 2, y + 250 + dy, unter, F(34, 700), DARK, w - 40, "mm"))


# ---------------------------------------------------------------- 2 Karte 1: elif
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Karte 1: elif, mehr als zwei Wege")
    x, y, w, size, lh = G1["x"], G1["y"], G1["w"], G1["size"], G1["lh"]
    # Code ohne elif: Zeilen 0, 1, 2, 5, 6 auf den Plaetzen 0..4; dann schiebt sich elif dazwischen
    t_code = a(0, 0.45); t_ins = a(2, 0.08); t_typ = t_ins + 0.8
    vorher = [0, 1, 2, 5, 6]; tm = {}; c = t_code
    for i in vorher: tm[i] = c; c += len(CODE1[i]) / 55 + 0.15
    tm[3] = t_typ; tm[4] = t_typ + len(CODE1[3]) / 55 + 0.15
    k_ins = ap(t, t_ins, 0.8)
    def code(d, dy):
        rows = 5 + 2 * k_ins
        nums = {k: 1.0 for k in range(3) if t >= tm[vorher[k]]}
        for k in (3, 4):      # Platz 4, 5: erst else/print(Rot), dann (nach dem Gleiten) elif/print(Gelb)
            pre = 1.0 if t >= tm[vorher[k]] else 0.0
            nums[k] = max(pre * (1 - clamp(k_ins / 0.3)), clamp((t - tm[k]) / 0.2))
        nums.update({5: clamp((k_ins - 0.92) / 0.08), 6: clamp((k_ins - 0.97) / 0.03)})
        g = kasten(d, x, y + dy, w, size, lh, rows, nums)
        for i in vorher:
            slot = vorher.index(i) if i < 3 else vorher.index(i) + 2 * k_ins
            zeile(d, g, slot, CODE1[i], int(max(0, t - tm[i]) * 55))
        for i in (3, 4):
            zeile(d, g, i, CODE1[i], int(max(0, t - tm[i]) * 55))
    f.el(ap(t, t_code - 0.3, 0.3), code)
    g = CodeGeo(x, y, w, size, lh, 7)
    # Ampel
    def licht(name, t_an):
        ruhe = 0.6                                   # im Ruhezustand halb abgeblendet
        base = ruhe + (0.25 - ruhe) * ap(t, a(1, 0.0) - 0.4, 0.4)
        v = base + (1 - base) * ap(t, t_an, 0.3)
        return v - (v - ruhe) * ap(t, a(1, 0.98), 0.5)
    t_g, t_y, t_r = a(1, 0.35), a(1, 0.6), a(1, 0.84)
    E(f, t, a(0, 0.15), lambda d, dy: ampel(d, AMPEL[0], AMPEL[1] + dy, AMPEL[2],
                                              {"Grün": licht("Grün", t_g), "Gelb": licht("Gelb", t_y), "Rot": licht("Rot", t_r)}))
    # Zeitstrahl (nur solange von der Uhr die Rede ist)
    fz = 1 - ap(t, a(3, 0.0), 0.4)
    if fz > 0.01:
        sav = f.master; f.master = sav * fz
        zeitstrahl(f, t, 100, 1180, 594, a(1, 0.0), (t_g, t_y, t_r))
        f.master = sav
    # Notizen und Markierungen
    E(f, t, a(2, 0.55), lambda d, dy: zeilen_notiz(d, g, 3, NOTE_X, NOTE_W, "elif heißt: sonst wenn", LIGHTR, RED, outl=RED), tout=a(3, 0.0))
    E(f, t, a(3, 0.1), lambda d, dy: zeilen_notiz(d, g, 3, NOTE_X, NOTE_W, "eigene Bedingung und Doppelpunkt", LIGHTA, AMB, outl=AMB))
    def mark(i, t_in, t_out):
        ln = CODE1[i]; wort = ln.split()[0]
        b = spalte(ln, ln[len(wort) + 1:-1]); dp = spalte(ln, ":", True)
        f.el(show(t, t_in, t_out), lambda d, dy: (code_markiere(d, g, i, *b, AMBER), code_markiere(d, g, i, *dp, RED)))
    mark(3, a(3, 0.2), a(4, 0.0)); mark(1, a(3, 0.62), a(4, 0.0))
    E(f, t, a(4, 0.1), lambda d, dy: zeilen_notiz(d, g, 5, NOTE_X, NOTE_W, "ohne Bedingung: nimmt den Rest", LIGHTK, DARK, outl=GREY))
    f.el(show(t, a(4, 0.3), a(5, 0.0)), lambda d, dy: code_markiere(d, g, 5, 0, 4, RED))
    def flucht(d, dy):
        fluchtlinie(d, g, 1, 5, RED)
        for i, n in ((1, 2), (3, 4), (5, 4)): code_markiere(d, g, i, 0, n, RED)
    f.el(show(t, a(5, 0.15)), flucht)


# ---------------------------------------------------------------- 3 Lauf mit Sekunde 32
def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Ein Lauf mit sekunde = 32")
    x, y, w, size, lh = G1["x"], G1["y"], G1["w"], G1["size"], G1["lh"]
    t_gelb = a(2, 0.7)
    aktiv = aktuell(t, [(0.3, {0}), (a(1, 0.0), {1}), (a(2, 0.0), {3}), (t_gelb, {4}), (a(3, 0.0), None)])
    grau = set()
    if t >= a(1, 0.75): grau |= {2}
    if t >= a(3, 0.25): grau |= {5, 6}
    E(f, t, 0.0, lambda d, dy: code_lauf(d, x, y + dy, w, CODE1, t, size, lh, aktiv=aktiv, grau=grau))
    g = CodeGeo(x, y, w, size, lh, 7)
    def frage(i, links, op, rechts, t_q, t_a):
        wert = eval(f"{links} {op} {rechts}"); antw = ("wahr: ja" if wert else "falsch: nein")
        txt0 = f"{links} {op} {rechts}?"; txt1 = f"{links} {op} {rechts} ist {antw}"
        fill, col = (LIGHTG, GREEN) if wert else (LIGHTR, RED)
        f.el(show(t, t_q, t_a), lambda d, dy: zeilen_notiz(d, g, i, NOTE_X, NOTE_W, txt0, LIGHTK, DARK, outl=GREY))
        f.el(show(t, t_a), lambda d, dy: zeilen_notiz(d, g, i, NOTE_X, NOTE_W, txt1, fill, col, outl=col))
    frage(1, "32", "<", "30", a(1, 0.15), a(1, 0.52))
    frage(3, "32", "<", "35", a(2, 0.12), a(2, 0.42))
    E(f, t, a(3, 0.3), lambda d, dy: zeilen_notiz(d, g, 5, NOTE_X, NOTE_W, "übersprungen", LIGHTK, GREY, outl=LINE))
    E(f, t, a(0, 0.3), lambda d, dy: ampel(d, AMPEL[0], AMPEL[1] + dy, AMPEL[2], {"Gelb": ap(t, t_gelb + 0.3, 0.4)}))
    E(f, t, t_gelb, lambda d, dy: lauf_panel(d, x, 540 + dy, w, [(t_gelb + 0.2, OUT_GELB[0], None, None)], t, 28, 44, "Ausgabe"))
    E(f, t, a(4, 0.35), lambda d, dy: tag(d, 600, 560 + dy, 620, 72, "Von oben nach unten: das erste Ja gewinnt", RED, WHITE, 30))

OUT_GELB = run(NL.join(CODE1)); assert OUT_GELB == ["Gelb"]


# ---------------------------------------------------------------- 4 Karte 2: and
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Karte 2: zwei Vergleiche verbinden")
    E(f, t, a(0, 0.0), lambda d, dy: schild(d, *SCHILD[:1], SCHILD[1] + dy, *SCHILD[2:], show(t, a(0, 0.6)), show(t, a(0, 0.84))))
    x, y, w, size, lh = G4["x"], G4["y"], G4["w"], G4["size"], G4["lh"]
    t_and = a(2, 0.12)
    n_and = int(clamp((t - t_and) / 0.36) * 3)
    z2 = f"print({LINKS} " + "and"[:n_and] + " " * (3 - n_and) + f" {RECHTS})"
    # erst steht nur die print-Zeile (Zeile 1); mit dem Satz ueber groesse und alter gleitet sie nach unten
    k4 = ap(t, a(3, 0.03), 0.7); p = 2 * k4
    t_gr, t_al = a(3, 0.12), a(3, 0.3)
    def code(d, dy):
        nums = {0: max(1 - clamp(k4 / 0.3), clamp((t - t_gr) / 0.15)), 1: clamp((k4 - 0.9) / 0.1), 2: clamp((k4 - 0.9) / 0.1)}
        g = kasten(d, x, y + dy, w, size, lh, 1 + p, nums)
        zeile(d, g, 0, CODE_AND[0], int(max(0, t - t_gr) * 55))
        zeile(d, g, 1, CODE_AND[1], int(max(0, t - t_al) * 55))
        zeile(d, g, p, z2, int(max(0, t - a(1, 0.0)) * 55))
    f.el(ap(t, a(1, 0.0) - 0.4, 0.3), code)
    g = CodeGeo(x, y, w, size, lh, 1 + p)
    f.el(show(t, t_and + 0.4, a(5, 0.0)), lambda d, dy: code_markiere(d, g, p, *spalte(CODE_AND[2], "and"), RED))
    verknuepfung(f, t, g, 2, CODE_AND[2], "wahr", "falsch", "und", "falsch", a(3, 0.6), a(3, 0.82), a(4, 0.1), a(4, 0.35),
                 t_lab=a(1, 0.42), t_lab_aus=a(3, 0.55))
    t_out = a(4, 0.7)
    E(f, t, t_out - 0.2, lambda d, dy: lauf_panel(d, AUSG[0], AUSG[1] + dy, AUSG[2], [(t_out, OUT_AND[0], None, None)], t, 28, 44, "Ausgabe"))
    def ganz(d, dy):
        code_markiere(d, g, p, *spalte(CODE_AND[2], LINKS), BLUE); code_markiere(d, g, p, *spalte(CODE_AND[2], RECHTS), AMB)
    f.el(show(t, a(5, 0.3)), ganz)
    E(f, t, a(2, 0.6), lambda d, dy: tag(d, 60, TAG_Y + dy, 820, 64, "and: beide müssen stimmen", RED, WHITE, 32), tout=a(5, 0.0))
    E(f, t, a(5, 0.2), lambda d, dy: tag(d, 60, TAG_Y + dy, 820, 64, "Links und rechts je ein vollständiger Vergleich", RED, WHITE, 30))


# ---------------------------------------------------------------- 5 Dieselbe Zeile mit or
def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Dieselbe Zeile mit or")
    fz = 1 - ap(t, a(0, 0.0), 0.8)          # das Schild gehoert zur and-Regel: blendet aus, sonst widerspricht es dem or
    if fz > 0.01:
        sav = f.master; f.master = sav * fz
        E(f, t, 0.0, lambda d, dy: schild(d, SCHILD[0], SCHILD[1] + dy, *SCHILD[2:]))
        f.master = sav
    x, y, w, size, lh = G4["x"], G4["y"], G4["w"], G4["size"], G4["lh"]
    t_dup = a(0, 0.04); t_or = a(0, 0.3)
    k_dup = ap(t, t_dup, 0.8); k_or = ap(t, t_or, 0.6)
    def code(d, dy):
        g = kasten(d, x, y + dy, w, size, lh, 3 + k_dup, {0: 1, 1: 1, 2: 1, 3: clamp((k_dup - 0.85) / 0.15)})
        for i in range(3): zeile(d, g, i, CODE_AND[i])
        if k_dup > 0.01:                       # die Kopie gleitet unter die Zeile und wird sichtbar
            slot = 2.5 + 0.5 * k_dup; pre = len(f"print({LINKS} ")
            zeile(d, g, slot, CODE_AND[2][:pre], dim=k_dup)
            if k_or < 0.5: zeile(d, g, slot, CODE_AND[2], dim=k_dup * clamp(1 - 2 * k_or), ab=pre)
            else: zeile(d, g, slot, CODE_OR[3], dim=clamp(2 * k_or - 1), ab=pre)
    E(f, t, 0.0, code)
    g = CodeGeo(x, y, w, size, lh, 4)
    f.el(show(t, t_or + 0.3, a(1, 0.0)), lambda d, dy: code_markiere(d, g, 3, *spalte(CODE_OR[3], "or"), RED))
    def beide(d, dy):
        code_markiere(d, g, 2, *spalte(CODE_AND[2], "and"), RED); code_markiere(d, g, 3, *spalte(CODE_OR[3], "or"), RED)
    f.el(show(t, a(3, 0.1)), beide)
    verknuepfung(f, t, g, 3, CODE_OR[3], "wahr", "falsch", "oder", "wahr", a(2, 0.05), a(2, 0.4), a(2, 0.48), a(2, 0.62))
    t_true = a(2, 0.82)
    zl = [(0.0, OUT_OR[0], None, None), (t_true, OUT_OR[1], None, None)]
    E(f, t, 0.0, lambda d, dy: lauf_panel(d, AUSG[0], AUSG[1] + dy, AUSG[2], zl, t, 28, 44, "Ausgabe",
                                           hl={0, 1} if t >= a(3, 0.3) else None))
    E(f, t, a(1, 0.1), lambda d, dy: tag(d, 60, TAG_Y + dy, 820, 64, "or: einer genügt", RED, WHITE, 32), tout=a(4, 0.0))
    E(f, t, a(4, 0.15), lambda d, dy: tag(d, 60, TAG_Y + dy, 820, 64, "Probier beide Karten aus und ändere die Werte", RED, WHITE, 30))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == len(SCENES) == 5


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 03 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Python-", F(84, 700), DARK)
        T2(d, 90, 256, "Werkzeugkasten", F(84, 700), DARK)
        T2(d, 90, 384, "mehr als zwei Wege, zwei Vergleiche verbinden", F(34, 400), GREY)
        for k, wort in enumerate(("elif", "and", "or")):
            chip(d, 90 + k * 186, 470, 170, 70, wort, BOX, CODE_K, 40, outl=BOX, mono=True)
        code_n(d, 800, 150, 420, CODE1, list(range(1, 8)), [-1] * 7, 0, 22, 38)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
