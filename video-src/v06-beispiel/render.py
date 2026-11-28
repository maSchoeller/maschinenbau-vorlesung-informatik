"""Termin 06, Video 3: Vorgerechnet: Kino (Aufgabe mit Reihen und Plaetzen, Plan mit der Raute in der Raute und einer Entscheidung im
inneren Rumpf, Code mit zwei for-Schleifen und if, die drei Stellen, Probe mit 2, 3 und 1, 0, 1, 1, 1, 0, Grenzfall 1, 1, 1).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Der Code muss zeichengleich mit der Seite sein (app/inhalte/v06/labor/w-vorgemacht.vorlage.py, sobald es sie gibt)."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v04-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v06-common"))
from b06 import *
from texte import SRC

NAME = "v06-beispiel"; LABEL = "DHBW · Informatik · Termin 06 · Vorgerechnet: Kino"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Code (zeichengenau wie auf der Seite) und echte Programmlaeufe
CODE = ['# Kino: Wie viele Plätze sind belegt?',
        'reihen = int(input("Wie viele Reihen? "))',
        'plaetze = int(input("Wie viele Plätze je Reihe? "))',
        "belegt = 0",
        "for i in range(1, reihen + 1):",
        "    for j in range(1, plaetze + 1):",
        '        platz = int(input(f"Reihe {i}, Platz {j} (1 belegt, 0 frei): "))',
        "        if platz == 1:",
        "            belegt = belegt + 1",
        "gesamt = reihen * plaetze",
        'print(f"Belegt: {belegt} von {gesamt}")']
_SEITE = os.path.join(HERE, "..", "..", "app", "inhalte", "v06", "labor", "w-vorgemacht.vorlage.py")
if os.path.exists(_SEITE) and open(_SEITE, encoding="utf-8").read().splitlines() != CODE:
    raise AssertionError("Code weicht von app/inhalte/v06/labor/w-vorgemacht.vorlage.py ab")
QUELLE = NL.join(CODE)
EING = ["2", "3", "1", "0", "1", "1", "1", "0"]
LAUF = run(QUELLE, EING)
assert len(LAUF) == 9 and LAUF[0] == "Wie viele Reihen? 2" and LAUF[1] == "Wie viele Plätze je Reihe? 3", LAUF
assert LAUF[2] == "Reihe 1, Platz 1 (1 belegt, 0 frei): 1" and LAUF[7] == "Reihe 2, Platz 3 (1 belegt, 0 frei): 0", LAUF
assert LAUF[-1] == "Belegt: 4 von 6", LAUF
EING1 = ["1", "1", "1"]
LAUF1 = run(QUELLE, EING1)
assert LAUF1[-1] == "Belegt: 1 von 1" and len(LAUF1) == 4, LAUF1
PLAETZE = [[1, 0, 1], [1, 1, 0]]
assert [int(x) for x in EING[2:]] == [p for r in PLAETZE for p in r] and sum(map(sum, PLAETZE)) == 4 and 2 * 3 == 6
BELEGT = []; _b = 0                                                             # Zaehler nach jedem Platz
for _r in PLAETZE:
    for _p in _r:
        _b += _p; BELEGT.append(_b)
assert BELEGT == [1, 1, 2, 3, 4, 4], BELEGT
# Fehlerbild der Auftragsfrage: belegt = 0 im Rumpf der aeusseren Schleife
FALSCH = NL.join(CODE[:4] + CODE[4:5] + ["    belegt = 0"] + CODE[5:])
assert run(FALSCH, EING)[-1] == "Belegt: 2 von 6"                                # nur die letzte Reihe zaehlt (wird im Video nicht gezeigt)
PROMPTS = [LAUF[0][:-1], LAUF[1][:-1]]
PL = [LAUF[2 + k][:-1] for k in range(6)]
assert all(LAUF[2 + k].endswith(EING[2 + k]) for k in range(6)) and PL[3] == "Reihe 2, Platz 1 (1 belegt, 0 frei): "
P1 = [LAUF1[0][:-1], LAUF1[1][:-1], LAUF1[2][:-1]]

# ---------------------------------------------------------------- Plan
PLAN = kino_plan()
KNOTEN = [k for k in PLAN.reihenfolge if k in PLAN.nodes]
assert KNOTEN == ["s", "r", "p", "b", "wi", "wj", "e", "d", "a", "g", "o", "end"], KNOTEN
W = kino_weg(PLAN, PLAETZE); W1 = kino_weg(PLAN, [[1]])
assert W.count("e") == 6 and W.count("a") == 4 and W.count("wj-zurueck") == 6 and W.count("wi") == 3 and W.count("wj") == 8
assert W1.count("e") == 1 and W1.count("a") == 1 and W1[-1] == "end"


def plan_y(box, z, cam, k):
    return plan_xy(box, z, cam, 0, PLAN.nodes[k].cy)[1]


# ---------------------------------------------------------------- Sitzplan
def sitz(d, x, y, c, zust, aktiv=False, nr=None):
    """Ein Sitz. zust: None = noch nicht gefragt (gestrichelt), 1 = belegt (rot), 0 = frei (grau)."""
    if zust is None:
        gestrichelt(d, [(x, y), (x + c, y), (x + c, y + c), (x, y + c)], GREYL, 3)
    else:
        d.rounded_rectangle((x, y + 10, x + c, y + c), 14, fill=LIGHTR if zust else WHITE, outline=RED if zust else LINE, width=3)
        d.rounded_rectangle((x + 8, y, x + c - 8, y + 22), 8, fill=mix(LIGHTR if zust else WHITE, RED if zust else GREYL, 0.35))
        TB(d, x + c / 2, y + c * 0.62, str(zust), F(int(c * 0.46), 700), RED if zust else GREY, c - 10, "mm", "Sitz")
    if aktiv: d.rounded_rectangle((x - 6, y - 6, x + c + 6, y + c + 6), 18, outline=RED, width=5)


def sitzplan(d, x, y, zustaende, c=96, gap=18, aktiv=None, beschriftung=True):
    """zustaende: je Reihe eine Liste (None, 0 oder 1); aktiv: (reihe, platz) oder None. Gibt (breite, hoehe) zurueck."""
    nr, np_ = len(zustaende), len(zustaende[0]); lw = 130 if beschriftung else 0
    imbild(y, y + 40 + nr * (c + gap), "Sitzplan")
    if beschriftung:
        for j in range(np_): TB(d, x + lw + j * (c + gap) + c / 2, y + 12, f"Platz {j + 1}", F(24, 600), GREY, c + 10, "mm", "Platz")
    for i, reihe in enumerate(zustaende):
        yy = y + 40 + i * (c + gap)
        if beschriftung: TB(d, x, yy + c / 2, f"Reihe {i + 1}", F(26, 700), DARK, lw - 10, "lm", "Reihe")
        for j, z in enumerate(reihe):
            sitz(d, x + lw + j * (c + gap), yy, c, z, aktiv == (i, j))
    return lw + np_ * (c + gap) - gap, 40 + nr * (c + gap) - gap


# ---------------------------------------------------------------- 1 Die Aufgabe
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Die Aufgabe: Plätze im Kino zählen")
    t_s = [a(1, 0.45 + 0.1 * k) for k in range(6)]
    def plan_sitze(d, dy):
        zust = [[(PLAETZE[i][j] if t >= t_s[3 * i + j] else None) for j in range(3)] for i in range(2)]
        sitzplan(d, 60, 124 + dy, zust)
    E(f, t, a(0, 0.1), plan_sitze)
    E(f, t, a(1, 0.2), lambda d, dy: (tag(d, 60, 450 + dy, 180, 54, "1 belegt", LIGHTR, RED, 28, 700, outl=RED),
                                      tag(d, 260, 450 + dy, 180, 54, "0 frei", WHITE, GREY, 28, 700, outl=LINE)))
    def auftrag(d, dy):
        card(d, 660, 130 + dy, 560, 250, stripe=False)
        TB(d, 690, 164 + dy, "Auftrag", F(30, 700), GREY, 200, "lm", "Auftrag")
    E(f, t, a(0, 0.05), auftrag)
    schritte = [("Reihen und Plätze je Reihe einlesen", a(0, 0.3)), ("jeden Platz abfragen: 1 oder 0", a(1, 0.05)), ("Ausgabe: Belegt: 4 von 6", a(1, 0.7))]
    for j, (txt, tin) in enumerate(schritte):
        def schritt(d, dy, j=j, txt=txt):
            y = 218 + j * 62 + dy
            num_circle(d, 706, y, 20, j + 1, RED); TB(d, 740, y, txt, F(30, 600), DARK, 460, "lm", "Schritt")
        E(f, t, tin, schritt)
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 660, 450 + dy, 560, 60, "In jeder Reihe jeder Platz", LIGHTK, DARK, 32, 700, outl=LINE))
    E(f, t, a(2, 0.4), lambda d, dy: tag(d, 660, 530 + dy, 560, 76, "zwei Schleifen ineinander", RED, WHITE, 40))


# ---------------------------------------------------------------- 2 Der Plan: Raute in der Raute
PBOX2 = (40, 96, 440, 590)
TAGX = 540

def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Erst der Plan: Raute in der Raute")
    tn = {"s": 0.5, "r": a(0, 0.15), "p": a(0, 0.4), "b": a(0, 0.72), "wi": a(1, 0.2), "wj": a(1, 0.62),
          "e": a(2, 0.06), "d": a(2, 0.3), "a": a(2, 0.6), "g": a(3, 0.5), "o": a(3, 0.75), "end": a(3, 0.92)}
    tm = dict(tn)
    for k, e in PLAN.into.items(): tm[e] = tn[k] - 0.2
    tm["a-m"] = tn["a"] + 0.25; tm["d-nein"] = a(2, 0.78); tm["wj-zurueck"] = a(2, 0.9)
    tm["wj-nein"] = a(3, 0.12); tm["wi-nein"] = a(3, 0.42)
    assert set(tm) == set(PLAN.reihenfolge), set(PLAN.reihenfolge) ^ set(tm)
    sched = [(tn["r"], ["r"]), (tn["p"], ["p"]), (tn["b"], ["b"]), (tn["wi"], ["wi"]), (tn["wj"], ["wi-wj", "wj"]), (tn["e"], ["wj-e", "e"]),
             (tn["d"], ["e-d", "d"]), (tn["a"], ["d-a", "a"]), (tm["d-nein"], ["d-nein"]), (tm["wj-zurueck"], ["wj-zurueck"]),
             (tm["wj-nein"], ["wj-nein"]), (tm["wi-nein"], ["wi-nein", "g", "g-o", "o"]), (tn["end"] + 0.5, [])]
    cur = aktuell(t, sched) or []
    z, cam = kino_draw(f, 1.0, PLAN, PBOX2, vis=reveal(t, tm), hl={k: RED for k in cur})
    yw1, yw2, yd, ya = (plan_y(PBOX2, z, cam, k) for k in ("wi", "wj", "d", "a"))
    yg = plan_y(PBOX2, z, cam, "g")
    E(f, t, a(1, 0.3), lambda d, dy: tag(d, TAGX, yw1 - 28 + dy, 600, 56, "Gibt es noch eine Reihe?", LIGHTA, AMB, 30, 700, outl=AMB))
    E(f, t, a(1, 0.7), lambda d, dy: tag(d, TAGX, yw2 - 28 + dy, 600, 56, "Gibt es noch einen Platz in dieser Reihe?", LIGHTA, AMB, 28, 700, outl=AMB))
    E(f, t, a(2, 0.36), lambda d, dy: tag(d, TAGX, yd - 28 + dy, 600, 56, "Ist der Platz belegt?", LIGHTK, DARK, 30, 700, outl=LINE))
    E(f, t, a(2, 0.64), lambda d, dy: tag(d, TAGX, ya - 28 + dy, 600, 56, "ja: der Zähler wird größer", LIGHTG, GREEN, 28, 700, outl=GREEN), tout=a(2, 0.86))
    E(f, t, a(2, 0.88), lambda d, dy: tag(d, TAGX, ya - 28 + dy, 600, 56, "zurück: der nächste Platz", LIGHTR, RED, 28, 700, outl=RED), tout=a(3, 0.1))
    E(f, t, a(3, 0.18), lambda d, dy: tag(d, TAGX, ya - 28 + dy, 600, 56, "zurück: die nächste Reihe", LIGHTR, RED, 28, 700, outl=RED), tout=a(3, 0.52))
    E(f, t, a(3, 0.6), lambda d, dy: tag(d, TAGX, yg - 28 + dy, 600, 56, "alle Reihen durch: rechnen und ausgeben", LIGHTG, GREEN, 28, 700, outl=GREEN))


# ---------------------------------------------------------------- 3 Vom Plan zum Code: zwei for und if, die drei Stellen
PBOX3 = (20, 96, 400, 590)
CX3, CY3, CW3, CS3, CLH3 = 430, 112, 820, 17, 36
G3 = CodeGeo(CX3, CY3, CW3, CS3, CLH3, len(CODE))
assert all(G3.cx(len(z)) + 16 <= CX3 + CW3 for z in CODE), max(G3.cx(len(z)) for z in CODE)
CX3B = 60                                         # Code zieht nach links, wenn der Plan geht
G3B = CodeGeo(CX3B, CY3, CW3, CS3, CLH3, len(CODE))

def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Vom Plan zum Code: zwei for und ein if")
    t_aus = a(3, 0.0)
    times = [0.4, a(0, 0.15), a(0, 0.4), a(0, 0.7), a(1, 0.0) + 0.3, a(1, 0.45), a(2, 0.05), a(2, 0.45), a(2, 0.7), a(3, 0.05), a(3, 0.12)]
    cx = lerp(CX3, CX3B, ap(t, t_aus, 0.9))
    pa = 1 - ap(t, t_aus, 0.5)
    sched = [(times[1], ["r"]), (times[2], ["p"]), (times[3], ["b"]), (times[4], ["b-wi", "wi", "wi-wj"]), (times[5], ["wj", "wj-e"]),
             (times[6], ["e", "e-d"]), (times[7], ["d", "d-a"]), (times[8], ["a"]), (times[9], [])]
    hl_keys = aktuell(t, sched) or []
    if pa > 0.004: kino_draw(f, pa, PLAN, PBOX3, hl={k: RED for k in hl_keys})
    aktiv = aktuell(t, [(times[i], {i}) for i in range(1, 9)] + [(times[9], set())]) or set()
    geo = lambda dy: CodeGeo(cx, CY3 + dy, CW3, CS3, CLH3, len(CODE))
    E(f, t, 0.3, lambda d, dy: code_lauf(d, cx, CY3 + dy, CW3, CODE, t, CS3, CLH3, times=times, aktiv=aktiv, cps=140))
    # Satz 3: i und j stecken in der Frage, das if ist noch einmal eingerueckt
    E(f, t, a(2, 0.08), lambda d, dy: (code_markiere(d, geo(dy), 6, *spalte(CODE[6], "{i}")), code_markiere(d, geo(dy), 6, *spalte(CODE[6], "{j}"), BLUE)),
      tout=a(2, 0.42))
    E(f, t, a(2, 0.5), lambda d, dy: code_einrueckung(d, geo(dy), 7, 8), tout=t_aus)
    E(f, t, a(2, 0.55), lambda d, dy: tag(d, CX3, 600 + dy, CW3, 56, "Das if steht im inneren Rumpf: drei Stufen Einrückung", LIGHTK, DARK, 28, 700, outl=LINE), tout=t_aus)
    # Satz 4: drei Stellen
    stellen = [(1, 3, BLUE, LIGHTB, "vor beiden: Startwert", a(3, 0.22)), (6, 8, RED, LIGHTR, "im Rumpf innen: einlesen, zählen", a(3, 0.42)),
               (9, 10, GREEN, LIGHTG, "nach beiden: rechnen, ausgeben", a(3, 0.74))]
    for j, (i0, i1, col, fill, txt, tin) in enumerate(stellen):
        def rahmen(d, dy, i0=i0, i1=i1, col=col):
            g = geo(dy)
            d.rounded_rectangle((g.x + 6, g.zy(i0) - 6, g.x + g.w - 6, g.zy(i1) + CLH3 - 10), 8, outline=col, width=4)
        E(f, t, tin, rahmen)
        w = 376
        E(f, t, tin, lambda d, dy, j=j, fill=fill, col=col, txt=txt, w=w: tag(d, 60 + j * (w + 16), 600 + dy, w, 56, txt, fill, col, 22, 700, outl=col))


# ---------------------------------------------------------------- 4 Die Probe mit 2, 3 und 1, 0, 1, 1, 1, 0
TAB_X, TAB_Y = 700, 200
TAB_C = [("i", 90), ("j", 90), ("platz", 150), ("belegt", 170)]
TAB_RH = 52

def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Die Probe: 2 Reihen, 3 Plätze")
    # Eingaben als Reihe
    for j, (lab, w) in enumerate((("reihen = 2", 190), ("plaetze = 3", 210))):
        E(f, t, a(0, 0.12) + 0.3 * j, lambda d, dy, j=j, lab=lab, w=w: chip(d, 60 + j * 210, 116 + dy, w, 52, lab, LIGHTR if j == 0 else LIGHTK, DARK, 26, outl=LINE, mono=True))
    # Zeitpunkte je Platz
    tp = [a(1, 0.0), a(1, 0.42), a(1, 0.68), a(2, 0.0), a(2, 0.36), a(2, 0.72)]
    tp[0] = max(tp[0], a(0, 0.5))
    t_ende = a(3, 0.0)
    def stand():
        """Nummer des zuletzt abgefragten Platzes (-1 = keiner)."""
        n = -1
        for q in range(6):
            if t >= tp[q]: n = q
        return n
    n = stand()
    def sitze(d, dy):
        zust = [[(PLAETZE[i][j] if 3 * i + j <= n else None) for j in range(3)] for i in range(2)]
        akt = (n // 3, n % 3) if 0 <= n and t < t_ende else None
        sitzplan(d, 60, 200 + dy, zust, c=96, gap=18, aktiv=akt)
    E(f, t, a(0, 0.35), sitze)
    # Tabelle
    def geruest(d, dy):
        x = TAB_X; y = TAB_Y + dy; wges = sum(w for _, w in TAB_C)
        d.rounded_rectangle((x, y, x + wges, y + TAB_RH * 7), 14, fill=WHITE, outline=LINE, width=2)
        d.rounded_rectangle((x, y, x + wges, y + TAB_RH), 14, fill=LIGHTK); d.rectangle((x, y + TAB_RH - 14, x + wges, y + TAB_RH), fill=LIGHTK)
        cx0 = x
        for name, w in TAB_C:
            TB(d, cx0 + w / 2, y + TAB_RH / 2, name, M(28), GREY, w - 10, "mm", "Spalte"); cx0 += w
        for r in range(1, 7): d.line((x, y + r * TAB_RH, x + wges, y + r * TAB_RH), fill=LINE, width=2)
        d.line((x + TAB_C[0][1] + TAB_C[1][1], y, x + TAB_C[0][1] + TAB_C[1][1], y + TAB_RH * 7), fill=LINE, width=2)
    E(f, t, a(0, 0.5), geruest)
    zeile_hl = aktuell(t, [(tp[q], q) for q in range(6)] + [(t_ende, None)])
    for q in range(6):
        def zeile(d, dy, q=q):
            x = TAB_X; y = TAB_Y + dy + (q + 1) * TAB_RH
            if zeile_hl == q:
                d.rectangle((x + 4, y + 3, x + sum(w for _, w in TAB_C) - 4, y + TAB_RH - 3), fill=LIGHTR); d.rectangle((x + 4, y + 3, x + 9, y + TAB_RH - 3), fill=RED)
        E(f, t, tp[q], zeile)
        vals = [str(q // 3 + 1), str(q % 3 + 1), str(PLAETZE[q // 3][q % 3]), str(BELEGT[q])]
        cx0 = TAB_X
        for k, ((name, w), txt) in enumerate(zip(TAB_C, vals)):
            tin = tp[q] + (0.0 if k < 2 else 0.25 if k == 2 else 0.55)
            col = RED if name == "belegt" else DARK
            E(f, t, tin, lambda d, dy, cx0=cx0, w=w, q=q, txt=txt, col=col:
              TB(d, cx0 + w / 2, TAB_Y + dy + (q + 1) * TAB_RH + TAB_RH / 2, txt, M(30), col, w - 10, "mm", "Zelle"))
            cx0 += w
    # Hinweise zu den Reihen
    E(f, t, a(1, 0.1), lambda d, dy: tag(d, 60, 560 + dy, 600, 50, "Reihe 1: j beginnt bei 1", LIGHTK, DARK, 26, 700, outl=LINE), tout=a(2, 0.0))
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 60, 560 + dy, 600, 50, "Reihe 2: j beginnt wieder bei 1", LIGHTA, AMB, 26, 700, outl=AMB), tout=t_ende)
    # Schluss
    E(f, t, t_ende, lambda d, dy: tag(d, 60, 560 + dy, 600, 50, "Beide Schleifen sind zu Ende", LIGHTK, DARK, 26, 700, outl=LINE))
    E(f, t, a(3, 0.3), lambda d, dy: monobox(d, 700, 590 + dy, 520, 70, "Belegt: 4 von 6", 40))


# ---------------------------------------------------------------- 5 Grenzfall: 1 Reihe, 1 Platz
def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Grenzfall: 1 Reihe, 1 Platz")
    E(f, t, a(0, 0.1), lambda d, dy: sitzplan(d, 60, 130 + dy, [[1 if t >= a(1, 0.0) else None]], c=120, gap=18))
    zeilen = [(0.6, P1[0], a(0, 0.4), "1"), (a(0, 0.55), P1[1], a(0, 0.7), "1"), (a(0, 0.8), P1[2], a(0, 0.92), "1"), (a(1, 0.5), LAUF1[3], None, None, CODE_G)]
    E(f, t, 0.4, lambda d, dy: lauf_panel(d, 60, 330 + dy, 760, zeilen, t, 26, 42, hl={3} if t >= a(1, 0.5) else None))
    E(f, t, a(1, 0.0), lambda d, dy: tag(d, 420, 150 + dy, 560, 60, "beide Schleifen: genau einmal", LIGHTK, DARK, 32, 700, outl=LINE))
    E(f, t, a(1, 0.6), lambda d, dy: tag(d, 420, 232 + dy, 560, 60, "1 belegt von 1 Platz", LIGHTG, GREEN, 32, 700, outl=GREEN))
    def auftrag(d, dy):
        card(d, 60, 588 + dy, 1160, 90, stripe=False)
        TB(d, 90, 633 + dy, "Auftrag", F(28, 600), GREY, 130, "lm", "Auftrag")
        TB(d, 240, 633 + dy, "belegt = 0 in den äußeren Rumpf: was passiert?", F(32, 700), DARK, 940, "lm", "Auftrag")
    E(f, t, a(2, 0.15), auftrag)


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == 5 == len(SCENES)


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 56, "Termin 06 · Informatik", F(34, 600), GREY)
        T2(d, 90, 100, "Vorgerechnet: Kino", F(58, 700), DARK)
        T2(d, 90, 250, "Belegte Plätze zählen", F(48, 700), DARK)
        T2(d, 90, 318, "for i … for j …", M(34, True), RED)
        T2(d, 90, 420, "Raute in der Raute,", F(32, 600), GREY)
        T2(d, 90, 462, "dann der Code", F(32, 600), GREY)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
        sitzplan(d, 90, 520, [[1, 0, 1]], c=70, gap=14, beschriftung=False)
    f.el(1, fn)
    kino_draw(f, 1.0, PLAN, (800, 70, 440, 600), hl={k: RED for k in ("wj", "wj-e", "e", "e-d", "d", "d-a", "a", "wj-zurueck")})
    f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
