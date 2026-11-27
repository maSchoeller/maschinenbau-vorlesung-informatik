"""Termin 04, Video 3: Vorgerechnet: Einkauf zusammenrechnen (Aufgabe mit Kassenbon, Plan mit Rücksprung, Code mit while,
Probe mit 12, 8, 5, 0, Grenzfall nur 0 und fehlende Zeile im Rumpf).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) startet nur der Orchestrator; die Töne liegen schon in audio/.
Der Code muss zeichengleich mit der Seite sein (app/inhalte/v04/labor/w-vorgemacht.vorlage.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v04-common"))
from b04 import *
from texte import SRC

NAME = "v04-beispiel"; LABEL = "DHBW · Informatik · Termin 04 · Vorgerechnet: Einkauf zusammenrechnen"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Code (zeichengenau wie auf der Seite) und echte Programmläufe
CODE = ["# Einkauf zusammenrechnen",
        'preis = int(input("Preis in Euro (0 = fertig): "))',
        "summe = 0",
        "while preis != 0:",
        "    summe = summe + preis",
        '    preis = int(input("Preis in Euro (0 = fertig): "))',
        'print(f"Summe: {summe} Euro")']
_SEITE = os.path.join(HERE, "..", "..", "app", "inhalte", "v04", "labor", "w-vorgemacht.vorlage.py")
if os.path.exists(_SEITE):
    assert open(_SEITE, encoding="utf-8").read().splitlines() == CODE, "Code weicht von w-vorgemacht.vorlage.py ab"
QUELLE = NL.join(CODE)
FRAGE = "Preis in Euro (0 = fertig): "
LAUF = run(QUELLE, ["12", "8", "5", "0"]); LAUF0 = run(QUELLE, ["0"])
assert LAUF == [FRAGE + "12", FRAGE + "8", FRAGE + "5", FRAGE + "0", "Summe: 25 Euro"], LAUF
assert LAUF0 == [FRAGE + "0", "Summe: 0 Euro"], LAUF0

# Lauf von Hand nachverfolgt: (preis, preis != 0, summe nach dem Durchgang)
EING = [12, 8, 5, 0]
ZEILEN = []; _s = 0
for _p in EING:
    _ok = _p != 0
    if _ok: _s += _p
    ZEILEN.append((_p, _ok, _s if _ok else None))
assert ZEILEN == [(12, True, 12), (8, True, 20), (5, True, 25), (0, False, None)], ZEILEN
assert f"Summe: {_s} Euro" == LAUF[-1] and sum(EING) == 25
assert (0 != 0) is False and (12 != 0) is True                       # Grenzfall: nur 0 / Preis bleibt 12

# Der Code ohne die letzte Zeile im Rumpf: die Schleife hört nie auf (ein Lauf mit 12 würde nie enden, geprüft mit Schrittgrenze)
CODE_OHNE = CODE[:5] + CODE[6:]
assert len(CODE_OHNE) == 6 and CODE_OHNE[4] == CODE[4] and CODE_OHNE[5] == CODE[6]
_preis = 12; _n = 0
while _preis != 0 and _n < 1000: _n += 1                             # preis ändert sich nie: nach 1000 Schritten noch immer wahr
assert _preis != 0 and _n == 1000

# ---------------------------------------------------------------- Plan
P = schleife_plan([("s", "term", "Start"), ("e", "io", "Eingabe: preis"), ("i", "proc", "summe = 0"),
                   ("w", "loop", "preis != 0?", [("a", "proc", "summe = summe + preis"), ("e2", "io", "Eingabe: preis")]),
                   ("o", "io", 'Ausgabe: summe'), ("end", "term", "Ende")])
W3 = schleife_weg(P, {"w": 3})                                          # 12, 8, 5, dann 0
W0 = schleife_weg(P, {"w": 0})                                          # gleich die 0
assert W3 == ["s", "s-e", "e", "e-i", "i", "i-w", "w", "w-ja", "a", "a-e2", "e2", "w-zurueck", "w", "w-ja", "a", "a-e2", "e2",
              "w-zurueck", "w", "w-ja", "a", "a-e2", "e2", "w-zurueck", "w", "w-nein", "o", "o-end", "end"], W3
assert W0 == ["s", "s-e", "e", "e-i", "i", "i-w", "w", "w-nein", "o", "o-end", "end"], W0
assert W3.count("w-zurueck") == 3 == len([p for p in EING if p != 0])    # dreimal zurück, einmal je Preis
assert W3.count("w") == 4 == len(EING) and W3.index("w-nein") == 25


def route_laenge(pts): return sum(math.dist(p, q) for p, q in zip(pts, pts[1:]))
_GES = route_laenge(schleife_route(P, W3))
FR = [route_laenge(schleife_route(P, W3[:k + 1])) / _GES for k in range(len(W3))]     # Anteil der Strecke je Schlüssel

def lauf_p(t, marken):
    """Anteil der Strecke zur Zeit t: linear zwischen (zeit, index in W3)."""
    zs = [z for z, _ in marken]; assert zs == sorted(zs), zs
    if t <= marken[0][0]: return FR[marken[0][1]]
    for (z0, k0), (z1, k1) in zip(marken, marken[1:]):
        if t <= z1: return lerp(FR[k0], FR[k1], clamp((t - z0) / max(z1 - z0, 1e-6)))
    return FR[marken[-1][1]]


PBOX = (30, 100, 340, 560)                    # Plan links, schmal (Szene 3 bis 5)
PBIG = (60, 100, 560, 576)                    # Plan groß (Szene 2)
for _b in (PBOX, PBIG): plan_fit(P, _b, 1.4)  # bricht ab, wenn die Schrift unter 17 px fällt


def node_xy(box, z, cam, k, seite="r"):
    n = P.nodes[k]; return plan_xy(box, z, cam, n.cx + (n.w / 2 if seite == "r" else 0), n.cy)


# ---------------------------------------------------------------- 1 Die Aufgabe
BON = [("12", 0.15), ("8", 0.32), ("5", 0.5), ("0", 0.68)]

def bon(d, dy, x, y, w, h):
    card(d, x, y + dy, w, h, stripe=False)
    zacken = 14
    for k in range(int(w // zacken) + 1):                 # Abriss unten
        xx = x + k * zacken
        d.polygon([(xx, y + h + dy), (xx + zacken / 2, y + h + 12 + dy), (xx + zacken, y + h + dy)], fill=WHITE, outline=LINE)
    d.rectangle((x + 2, y + h - 3 + dy, x + w - 2, y + h + 3 + dy), fill=WHITE)
    TB(d, x + w / 2, y + 34 + dy, "Einkauf", F(34, 700), DARK, w - 40, "mm")
    d.line((x + 24, y + 66 + dy, x + w - 24, y + 66 + dy), fill=LINE, width=2)

def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Die Aufgabe: Preise zusammenrechnen")
    bx, by, bw, bh = 70, 124, 300, 520
    E(f, t, 0.4, lambda d, dy: bon(d, dy, bx, by, bw, bh))
    for k, (wert, fr) in enumerate(BON):
        yy = by + 112 + k * 74; ende = wert == "0"
        def zeile(d, dy, yy=yy, wert=wert, ende=ende):
            TB(d, bx + 34, yy + dy, "Preis", F(28, 600), GREY, 120, "lm")
            TB(d, bx + bw - 34, yy + dy, wert + " €", F(40, 700), RED if ende else DARK, 150, "rm")
        E(f, t, a(0, fr), zeile)
    E(f, t, a(0, 0.68), lambda d, dy: tag(d, bx + 34, by + 112 + 3 * 74 + 30 + dy, 232, 44, "Schluss: 0", LIGHTR, RED, 26, 700, outl=RED))
    def summe(d, dy):
        yy = by + 112 + 3 * 74 + 112
        d.line((bx + 24, yy - 26 + dy, bx + bw - 24, yy - 26 + dy), fill=DARK, width=3)
        TB(d, bx + 34, yy + 10 + dy, "Summe", F(30, 700), DARK, 120, "lm")
        TB(d, bx + bw - 34, yy + 10 + dy, f"{sum(EING)} €", F(40, 700), GREEN, 150, "rm")
    E(f, t, a(1, 0.3), summe)
    # Auftrag rechts: zwei Karten, dann der Satz in Worten
    x0, w0 = 470, 750
    for j, (txt, tin) in enumerate((("Preise in ganzen Euro einlesen, bis 0 kommt", a(0, 0.1)), ("Am Ende die Summe ausgeben", a(1, 0.1)))):
        y0 = 130 + j * 108
        def karte(d, dy, y0=y0, txt=txt, j=j):
            card(d, x0, y0 + dy, w0, 92, stripe=False); num_circle(d, x0 + 46, y0 + 46 + dy, 24, j + 1, RED)
            TB(d, x0 + 92, y0 + 46 + dy, txt, F(32, 700), DARK, w0 - 120, "lm", "Auftrag")
        E(f, t, tin, karte)
    E(f, t, a(2, 0.05), lambda d, dy: tag(d, x0, 362 + dy, 400, 56, "Wie oft? Das weißt du nicht", LIGHTA, AMB, 28, 700, outl=AMB))
    def wort(d, dy):
        card(d, x0, 438 + dy, w0, 96, stripe=False); d.rectangle((x0, 438 + dy, x0 + 8, 534 + dy), fill=RED)
        TB(d, x0 + 36, 486 + dy, "Die Schleife läuft, solange", F(32, 700), DARK, 420, "lm", "Satz")
        d.rounded_rectangle((x0 + 470, 458 + dy, x0 + w0 - 24, 514 + dy), 10, fill=BOX)
        TB(d, x0 + 470 + (w0 - 24 - 470) / 2, 486 + dy, "preis != 0", M(32, True), CODE_K, 230, "mm")
    E(f, t, a(2, 0.4), wort)
    # Satz 4: erst Worte, dann Plan
    def reihe(d, dy):
        chip(d, x0, 576 + dy, 300, 62, "1  In Worten", LIGHTK, DARK, 30, outl=LINE)
        pfeil(d, x0 + 318, 607 + dy, x0 + 392, 607 + dy, GREY, 6, 18)
        chip(d, x0 + 410, 576 + dy, 300, 62, "2  Der Plan", RED, WHITE, 30)
    E(f, t, a(3, 0.15), reihe)


# ---------------------------------------------------------------- 2 Der Plan mit Rücksprung
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Der Plan: die Raute entscheidet, der Pfeil kehrt zurück")
    tin = {"s": 0.5, "e": a(0, 0.4), "i": a(1, 0.08), "w": a(1, 0.34), "a": a(2, 0.12), "e2": a(2, 0.4),
           "o": a(1, 0.84), "end": a(1, 0.93)}
    tm = dict(tin)
    tm.update({"s-e": tin["e"], "e-i": tin["i"], "i-w": tin["w"], "w-ja": a(1, 0.68), "w-nein": tin["o"], "a-e2": tin["e2"],
               "w-zurueck": a(2, 0.66), "o-end": tin["end"]})
    assert set(tm) == set(P.reihenfolge), set(P.reihenfolge) ^ set(tm)
    sched = [(tin["e"], ["e"]), (tin["i"], ["i"]), (tin["w"], ["w"]), (tm["w-ja"], ["w-ja"]), (tm["w-nein"], ["w-nein", "o"]),
             (tin["a"], ["a"]), (tin["e2"], ["e2", "a-e2"]), (tm["w-zurueck"], ["w-zurueck"]),
             (a(3, 0.0), ["e", "e2"]), (a(4, 0.0), ["e2"]), (a(4, 0.97), [])]
    cur = aktuell(t, sched) or []
    z, cam = schleife_draw(f, 1.0, P, PBIG, vis=reveal(t, tm), hl={k: RED for k in cur})
    # der Rumpf, bevor er genannt wird: gestricheltes Platzhaltersymbol
    def platz(d, dy):
        symbol_gestrichelt(d, PBIG, z, cam, P.nodes["a"], RED, "Rumpf")
    f.el(show(t, tm["w-ja"], tin["a"]), platz)
    # laufende Beschriftungen rechts neben dem Plan: was das Symbol bedeutet
    xr = 700
    for sym, txt, t0, t1, fill, col in (("e", "erster Preis", a(0, 0.45), a(3, 0.45), LIGHTB, BLUE),
                                        ("i", "die Summe startet bei 0", a(1, 0.1), a(3, 0.0), LIGHTB, BLUE),
                                        ("a", "Rumpf: Summe plus Preis", a(2, 0.15), a(3, 0.0), LIGHTA, AMB),
                                        ("e2", "nächster Preis", a(2, 0.45), a(4, 0.1), LIGHTB, BLUE)):
        xs, ys = node_xy(PBIG, z, cam, sym, "r")
        def notiz(d, dy, xs=xs, ys=ys, txt=txt, fill=fill, col=col):
            d.line((xs + 6, ys + dy, xr, ys + dy), fill=col, width=2)
            tag(d, xr, ys - 26 + dy, 420, 52, txt, fill, col, 28, 700, outl=col)
        E(f, t, t0, notiz, tout=t1)
    # Satz 4 und 5: die Eingabe steht zweimal, mit Beschriftung
    for k, (sym, titel, unter, t0, t1) in enumerate((
            ("e", "vor der Schleife", "sonst hat die Raute nichts zu prüfen", a(3, 0.45), None),
            ("e2", "am Ende des Rumpfs", "sonst ändert sich preis nie", a(4, 0.1), None))):
        xs, ys = node_xy(PBIG, z, cam, sym, "r")
        def beschriftung(d, dy, xs=xs, ys=ys, titel=titel, unter=unter, k=k):
            d.line((xs + 6, ys + dy, xr, ys + dy), fill=RED, width=3)
            tag(d, xr, ys - 30 + dy, 400, 56, titel, LIGHTR, RED, 30, 700, outl=RED)
            TB(d, xr + 8, ys + 54 + dy, unter, F(26, 600), DARK, 520, "lm", "Hinweis")
        E(f, t, t0, beschriftung)
    E(f, t, a(3, 0.05), lambda d, dy: tag(d, xr, 330 + dy, 400, 56, "Die Eingabe steht zweimal", RED, WHITE, 30))


# ---------------------------------------------------------------- 3 Vom Plan zum Code
CX3, CY3, CW3, CS3, CLH3 = 410, 116, 810, 22, 40

def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Vom Plan zum Code: Raute für Raute")
    times = [a(0, 0.4), a(1, 0.02), a(1, 0.93), a(2, 0.0), a(3, 0.22), a(3, 0.55), a(4, 0.02)]
    t_a = [a(1, 0.0), a(1, 0.93), a(2, 0.0), a(3, 0.22), a(4, 0.02), a(4, 0.97)]
    aktiv = aktuell(t, [(a(1, 0.0), {1}), (a(1, 0.93), {2}), (a(2, 0.0), {3}), (a(3, 0.22), {4, 5}), (a(4, 0.02), {6}), (a(4, 0.97), set())]) or set()
    hl = aktuell(t, [(a(1, 0.0), ["e", "e-i"]), (a(1, 0.93), ["i", "i-w"]), (a(2, 0.0), ["w"]),
                     (a(3, 0.22), ["w-ja", "a", "a-e2", "e2", "w-zurueck"]), (a(4, 0.02), ["w-nein", "o"]), (a(4, 0.97), [])]) or []
    schleife_draw(f, 1.0, P, PBOX, hl={k: RED for k in hl})
    E(f, t, 0.3, lambda d, dy: code_lauf(d, CX3, CY3 + dy, CW3, CODE, t, CS3, CLH3, times=times, aktiv=aktiv, cps=120))
    g = CodeGeo(CX3, CY3, CW3, CS3, CLH3, 7)
    ZL = CODE[1]; yt = CY3 + g.h + 22
    # Satz 2: Eingabe mit input und int
    f.el(show(t, a(1, 0.3), a(2, 0.0)), lambda d, dy: code_markiere(d, g, 1, *spalte(ZL, "input"), BLUE))
    f.el(show(t, a(1, 0.5), a(2, 0.0)), lambda d, dy: code_markiere(d, g, 1, *spalte(ZL, "int("), AMB))
    E(f, t, a(1, 0.3), lambda d, dy: tag(d, CX3, yt + dy, 270, 54, "input liest ein", LIGHTB, BLUE, 28, 700, outl=BLUE), tout=a(2, 0.0))
    E(f, t, a(1, 0.5), lambda d, dy: tag(d, CX3 + 290, yt + dy, 420, 54, "int: ganze Zahlen", LIGHTA, AMB, 28, 700, outl=AMB), tout=a(2, 0.0))
    # Satz 3: die Raute wird while ... :
    f.el(show(t, a(2, 0.2), a(3, 0.0)), lambda d, dy: code_markiere(d, g, 3, *spalte(CODE[3], "preis != 0"), BLUE))
    f.el(show(t, a(2, 0.6), a(3, 0.0)), lambda d, dy: code_markiere(d, g, 3, *spalte(CODE[3], ":", True), RED))
    E(f, t, a(2, 0.2), lambda d, dy: tag(d, CX3, yt + dy, 330, 54, "while + Bedingung", LIGHTB, BLUE, 28, 700, outl=BLUE), tout=a(3, 0.0))
    E(f, t, a(2, 0.6), lambda d, dy: tag(d, CX3 + 350, yt + dy, 270, 54, "und Doppelpunkt", LIGHTR, RED, 28, 700, outl=RED), tout=a(3, 0.0))
    # Satz 4: Rumpf eingerückt
    def rumpf(d, dy):
        gg = CodeGeo(CX3, CY3 + dy, CW3, CS3, CLH3, 7)
        d.rounded_rectangle((gg.x + 8, gg.zy(4) - 4, gg.x + gg.w - 8, gg.zy(5) + gg.lh - 5), 8, outline=AMBER, width=3)
        d.rectangle((gg.x + 8, gg.zy(4) - 4, gg.x + 14, gg.zy(5) + gg.lh - 5), fill=AMBER)
    f.el(show(t, a(3, 0.3), a(4, 0.0)), rumpf)
    f.el(show(t, a(3, 0.3), a(4, 0.0)), lambda d, dy: (code_einrueckung(d, g, 4), code_einrueckung(d, g, 5)))
    E(f, t, a(3, 0.3), lambda d, dy: tag(d, CX3, yt + dy, 330, 54, "Rumpf: eingerückt", LIGHTA, AMB, 28, 700, outl=AMB), tout=a(4, 0.0))
    E(f, t, a(3, 0.6), lambda d, dy: tag(d, CX3 + 350, yt + dy, 460, 54, "dieselbe Eingabe noch einmal", LIGHTB, BLUE, 28, 700, outl=BLUE), tout=a(4, 0.0))
    # Satz 5: Ausgabe ohne Einrückung
    f.el(show(t, a(4, 0.1)), lambda d, dy: code_markiere(d, g, 6, 0, 5, RED))
    E(f, t, a(4, 0.1), lambda d, dy: tag(d, CX3, yt + dy, 480, 54, "ohne Einrückung: nach der Schleife", LIGHTR, RED, 28, 700, outl=RED))
    E(f, t, a(4, 0.5), lambda d, dy: tag(d, CX3 + 500, yt + dy, 300, 54, "läuft einmal", LIGHTG, GREEN, 28, 700, outl=GREEN))


# ---------------------------------------------------------------- 4 Die Probe mit 12, 8, 5 und 0
TX, TY = 430, 118
SPALTEN = [("preis", 190), ("preis != 0", 330), ("summe", 200)]
RH, KH = 66, 58

def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Die Probe: 12, 8, 5, dann 0")
    # Marke auf dem Weg: Kontrollpunkte (Zeit, Index in W3); Preis, Prüfung und Summe erscheinen im selben Augenblick
    iw = [W3.index("w") + 6 * r for r in range(4)]                       # Raute je Durchgang
    ie2 = [W3.index("e2") + 6 * r for r in range(3)]
    ia = [W3.index("a") + 6 * r for r in range(3)]
    t_preis = [a(1, 0.02), a(2, 0.02), a(2, 0.5), a(3, 0.02)]
    t_pruef = [a(1, 0.36), a(2, 0.24), a(2, 0.7), a(3, 0.16)]
    t_summe = [a(1, 0.82), a(2, 0.46), a(2, 0.93)]
    marken = [(a(0, 0.35), 0), (t_preis[0], W3.index("e")), (t_pruef[0], iw[0]), (a(1, 0.6), iw[0] + 1), (t_summe[0], ia[0]),
              (t_preis[1], ie2[0]), (t_pruef[1], iw[1]), (a(2, 0.34), iw[1] + 1), (t_summe[1], ia[1]),
              (t_preis[2], ie2[1]), (t_pruef[2], iw[2]), (a(2, 0.8), iw[2] + 1), (t_summe[2], ia[2]),
              (t_preis[3], ie2[2]), (t_pruef[3], iw[3]), (a(3, 0.3), iw[3] + 1), (a(3, 0.52), W3.index("o")), (a(3, 0.62), len(W3) - 1)]
    assert W3[iw[3] + 1] == "w-nein" and W3[ia[2]] == "a" and W3[ie2[2]] == "e2"
    n = max([k for z, k in marken if t >= z] or [0])
    p = lauf_p(t, marken)
    z, cam = schleife_draw(f, ap(t, 0.2, 0.3), P, PBOX, vis=None, hl=weg_hl(W3[:n + 1]), marker=schleife_marke(P, W3, p) if marken[0][0] <= t < a(3, 0.8) else None)
    # Tabelle: Spaltenköpfe, Zeilen füllen sich
    xs = [TX]
    for _, w in SPALTEN: xs.append(xs[-1] + w)
    E(f, t, a(0, 0.2), lambda d, dy: (card(d, TX - 16, TY - 12 + dy, xs[-1] - TX + 32, KH + RH * 4 + 24, stripe=False),
                                       [TB(d, xs[j] + SPALTEN[j][1] / 2, TY + KH / 2 + dy, nm, M(30, True), CODE_K if False else DARK, SPALTEN[j][1] - 16, "mm", "Spaltenkopf")
                                        for j, (nm, _) in enumerate(SPALTEN)],
                                       d.line((TX, TY + KH + dy, xs[-1], TY + KH + dy), fill=LINE, width=3)))
    aktiv_zeile = aktuell(t, [(t_preis[r], r) for r in range(4)])
    for r, (p_, ok, s_) in enumerate(ZEILEN):
        yy = TY + KH + 4 + r * RH
        if aktiv_zeile == r and t < a(4, 0.0):
            f.el(1.0, lambda d, dy, yy=yy: d.rounded_rectangle((TX - 8, yy, xs[-1] + 8, yy + RH - 4), 8, fill=LIGHTK))
        E(f, t, t_preis[r], lambda d, dy, yy=yy, p_=p_: TB(d, xs[0] + SPALTEN[0][1] / 2, yy + RH / 2 - 2 + dy, str(p_), M(36, True), BLUE, 150, "mm", "preis"))
        E(f, t, t_pruef[r], lambda d, dy, yy=yy, ok=ok: wert_chip(d, xs[1] + SPALTEN[1][1] / 2, yy + 6 + dy, "True" if ok else "False", RH - 16, anchor="m"))
        if s_ is not None:
            E(f, t, t_summe[r], lambda d, dy, yy=yy, s_=s_: TB(d, xs[2] + SPALTEN[2][1] / 2, yy + RH / 2 - 2 + dy, str(s_), M(36, True), DARK, 160, "mm", "summe"))
    # Rücksprünge zählen
    sprung = [t_summe[0] + 0.35, t_summe[1] + 0.35, t_summe[2] + 0.35]
    wieviel = sum(1 for s_ in sprung if t >= s_)
    yb = TY + KH + RH * 4 + 36
    E(f, t, a(1, 0.5), lambda d, dy: tag(d, TX - 16, yb + 6 + dy, 360, 56, f"Rücksprünge: {wieviel}", LIGHTR, RED, 30, 700, outl=RED))
    # Ausgabe
    ausg = LAUF[-1]
    E(f, t, a(3, 0.55) - 0.2, lambda d, dy: lauf_panel(d, TX - 16 + 400, yb + dy, 400, [(a(3, 0.55), ausg, None, None, CODE_G)], t, 28, 44, "Ausgabe"))
    # Satz 5: die 0 zählt nicht mit
    E(f, t, a(4, 0.1), lambda d, dy: tag(d, TX - 16, yb + 112 + dy, 800, 60, "Die 0 zählt nicht mit: sie ist nur das Zeichen für Schluss", RED, WHITE, 30))
    def streich(d, dy):
        yy = TY + KH + 4 + 3 * RH; xm = xs[0] + SPALTEN[0][1] / 2
        durchstreichen(d, xm - 26, yy + 12 + dy, xm + 26, yy + RH - 16 + dy, RED, 6)
    E(f, t, a(4, 0.3), streich)


# ---------------------------------------------------------------- 5 Jetzt du: der Grenzfall und die fehlende Zeile
CX5, CY5 = 410, 116

def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Jetzt du: der Grenzfall und der Fehler")
    t_ohne = a(3, 0.0)
    # Plan links
    if t < a(1, 0.0):
        schleife_draw(f, 1.0, P, PBOX)
    elif t < t_ohne:
        n0 = len(W0)
        marken = [(a(1, 0.0), 0), (a(1, 0.35), W0.index("w")), (a(1, 0.5), W0.index("w-nein")), (a(1, 0.75), n0 - 1)]
        pz = lerp(0, 1, clamp((t - a(1, 0.0)) / max(a(1, 0.75) - a(1, 0.0), 1e-6)))
        kk = max([k for z_, k in marken if t >= z_] or [0])
        schleife_draw(f, 1.0, P, PBOX, vis=weg_vis(W0, 0.25, show(t, a(1, 0.0))), hl=weg_hl(W0[:kk + 1]),
                      marker=schleife_marke(P, W0, pz) if t < a(1, 0.88) else None)
    else:
        # fehlende Zeile: der Rücksprung ist eingekreist, der Marker kreist durch die Schleife
        kr = ["w", "w-ja", "a", "a-e2", "e2", "w-zurueck", "w"]
        lauf = (t - t_ohne) * 0.2 % 1.0
        z, cam = schleife_draw(f, 1.0, P, PBOX, hl={"w-zurueck": RED}, marker=schleife_marke(P, kr, lauf))
        pts = [plan_xy(PBOX, z, cam, *q) for q in P.edges["w-zurueck"].pts[2:4]]      # die senkrechte Linie links
        xm = pts[0][0]; y0 = min(q[1] for q in pts) - 26; y1 = max(q[1] for q in pts) + 26
        def kreis(d, dy):
            d.ellipse((xm - 30, y0 + dy, xm + 30, y1 + dy), outline=RED, width=5)
        E(f, t, a(3, 0.35), kreis)
    # Code rechts: bis zum Fehler mit allen Zeilen, danach ohne die letzte Zeile im Rumpf
    if t < t_ohne:
        aktiv = {3} if a(1, 0.3) <= t < a(1, 0.7) else (set() if t < a(1, 0.0) else None)
        grau = {4, 5} if t >= a(1, 0.4) else None
        f.el(1.0, lambda d, dy: code_lauf(d, CX5, CY5 + dy, 810, CODE, t, 22, 40, aktiv=aktiv, grau=grau))
        g = CodeGeo(CX5, CY5, 810, 22, 40, 7)
    else:
        f.el(1.0, lambda d, dy: code_lauf(d, CX5, CY5 + dy, 810, CODE_OHNE, t, 22, 40, aktiv={3}))
        g = CodeGeo(CX5, CY5, 810, 22, 40, 6)
        E(f, t, a(3, 0.05), lambda d, dy: zeilen_notiz(d, g, 4, 790, 420, "die Zeile mit der Eingabe fehlt", LIGHTR, RED, 26, outl=RED))
    # Satz 1: Frage
    E(f, t, a(0, 0.25), lambda d, dy: tag(d, CX5, 490 + dy, 540, 62, "Nur die 0: Was erwartest du?", LIGHTA, AMB, 30, 700, outl=AMB), tout=a(1, 0.0))
    # Satz 2: 0 != 0, der Rumpf läuft nie, Summe bleibt 0
    if a(1, 0.0) <= t < t_ohne:
        yv = 482
        vergleich_zeile(f, t, CX5, yv, "0", "!=", "0", a(1, 0.2), a(1, 0.4), "python", 44, ergebnis="False")
        E(f, t, a(1, 0.5), lambda d, dy: tag(d, CX5 + 560, yv + 6 + dy, 250, 54, "Rumpf: nie", LIGHTK, GREY, 28, 700, outl=LINE))
        E(f, t, a(1, 0.68) - 0.2, lambda d, dy: lauf_panel(d, CX5, 566 + dy, 440, [(a(1, 0.68), LAUF0[-1], None, None, CODE_G)], t, 28, 44, "Ausgabe"))
        E(f, t, a(2, 0.05), lambda d, dy: tag(d, CX5 + 470, 584 + dy, 340, 64, "Grenzfall", RED, WHITE, 34))
    # Satz 4: der Preis ändert sich nie
    if t >= t_ohne:
        yv = 486
        E(f, t, a(3, 0.3), lambda d, dy: schachtel(d, CX5, yv + dy, 200, 120, "preis", "12", BLUE, DARK, 56))
        vergleich_zeile(f, t, CX5 + 260, yv + 16, "12", "!=", "0", a(3, 0.5), a(3, 0.62), "python", 44, ergebnis="True")
        E(f, t, a(3, 0.78), lambda d, dy: tag(d, CX5 + 260, yv + 96 + dy, 550, 54, "Die Schleife hört nie auf", RED, WHITE, 30))
    # Auftrag
    E(f, t, a(3, 0.82), lambda d, dy: (card(d, CX5, 644 + dy, 810, 44, stripe=False),
                                       TB(d, CX5 + 20, 666 + dy, "Auftrag: Probier 12, 8, 5, 0 und nur 0", F(28, 700), DARK, 770, "lm", "Auftrag")))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == 5 == len(SCENES)

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 56, "Termin 04 · Informatik", F(34, 600), GREY)
        T2(d, 90, 100, "Vorgerechnet:", F(68, 700), DARK)
        T2(d, 90, 184, "Einkauf zusammenrechnen", F(52, 700), DARK)
        T2(d, 90, 290, "Eine Schleife", F(46, 700), DARK)
        d.rounded_rectangle((90, 360, 560, 424), 12, fill=BOX)
        T2(d, 325, 392, "while preis != 0:", M(34, True), CODE_K, "mm")
        T2(d, 90, 480, "Erst der Plan,", F(32, 600), GREY)
        T2(d, 90, 522, "dann der Code", F(32, 600), GREY)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn)
    schleife_draw(f, 1.0, P, (780, 90, 440, 590), hl={"w-zurueck": RED})
    f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
