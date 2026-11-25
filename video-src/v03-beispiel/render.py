"""Termin 03, Video 3: Vorgerechnet: Getränkeautomat mit drei Wegen (Aufgabe, Plan mit zwei Rauten, Code mit if/elif/else,
Rückgeld mit f-String, Probe mit 2 Euro und Auftrag).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Der Code muss zeichengleich mit der Seite sein (app/inhalte/v03/labor/w-vorgemacht.vorlage.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v03-beispiel"; LABEL = "DHBW · Informatik · Termin 03 · Vorgerechnet: Getränkeautomat"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Code (zeichengenau wie auf der Seite) und echte Programmläufe
CODE = ["# Getränkeautomat mit drei Wegen",
        'geld = float(input("Eingeworfen in Euro: "))',
        "if geld < 1.5:",
        '    print("Zu wenig Geld")',
        "elif geld > 1.5:",
        "    rueckgeld = geld - 1.5",
        '    print(f"Rückgeld: {rueckgeld:.2f} Euro")',
        "else:",
        '    print("Passt genau")']
_SEITE = os.path.join(HERE, "..", "..", "app", "inhalte", "v03", "labor", "w-vorgemacht.vorlage.py")
if os.path.exists(_SEITE):
    assert open(_SEITE, encoding="utf-8").read().splitlines() == CODE, "Code weicht von w-vorgemacht.vorlage.py ab"
QUELLE = NL.join(CODE)
LAUF2 = run(QUELLE, ["2"]); LAUF1 = run(QUELLE, ["1"]); LAUF15 = run(QUELLE, ["1.5"])
assert LAUF2 == ["Eingeworfen in Euro: 2", "Rückgeld: 0.50 Euro"], LAUF2
assert LAUF1 == ["Eingeworfen in Euro: 1", "Zu wenig Geld"], LAUF1
assert LAUF15 == ["Eingeworfen in Euro: 1.5", "Passt genau"], LAUF15
assert (2 < 1.5) is False and (2 > 1.5) is True                          # Probe: erst nein, dann ja
assert f"{2 - 1.5:.2f}" == "0.50" and str(2 - 1.5) == "0.5"              # 0.50 statt 0.5

# ---------------------------------------------------------------- Pläne
PLAN = plan_zweig([("s", "term", "Start"), ("e", "io", "Eingabe: geld"),
                   ("d1", "dec", "geld < 1.5?", [("o1", "io", 'Ausgabe: "Zu wenig Geld"')],
                    [("d2", "dec", "geld > 1.5?", [("r", "proc", "rueckgeld = geld - 1.5"), ("o2", "io", "Ausgabe: rueckgeld")],
                      [("o3", "io", 'Ausgabe: "Passt genau"')])]),
                   ("end", "term", "Ende")])
PLAN02 = plan_zweig([("s", "term", "Start"), ("e", "io", "Eingabe: geld"),
                     ("d", "dec", "geld >= 1.5?", [("j", "io", 'Ausgabe: "Cola kommt"')], [("n", "io", 'Ausgabe: "Zu wenig Geld"')]),
                     ("o", "io", 'Ausgabe: "Danke"'), ("end", "term", "Ende")])
W2 = weg(PLAN, {"d1": "nein", "d2": "ja"})          # Probe mit 2 Euro: der mittlere Weg
assert W2 == ["s", "s-e", "e", "e-d1", "d1", "d1-nein", "d2", "d2-ja", "r", "r-o2", "o2", "d2-ja-z", "d1-nein-z", "d1-end", "end"], W2


from PIL import Image
RAND = 56                                                          # Breite der weichen Blende am Rand des Ausschnitts
_RANDMASKE = Image.linear_gradient("L").rotate(-90, expand=True)     # links 255 (Hintergrund), rechts 0 (Plan)


def plan_sicht(f, a, D, box, z, cam, vis=None, hl=None):
    """Plan-Ausschnitt mit fester Zoomstufe und frei gewählter Kamera (plan_draw aus b02 zentriert immer den ganzen Plan).
    Die Beschriftungen ja/nein erscheinen nur, wenn sie ganz im Ausschnitt liegen."""
    hl = hl or {}; vis = vis or (lambda k: 1.0)
    D.edges = dict(sorted(D.edges.items(), key=lambda kv: kv[0] in hl))
    pap_view(f, a, D, box, cam, vis=vis, hl=hl, zoom=z, bg=BG, labels=False)
    # Ränder weich ausblenden, wo der Ausschnitt den Plan anschneidet
    bb = D.bbox(); bx, by, bw, bh = box
    links = clamp((cam[0] - (bb[0] - 12)) / 30); rechts = clamp(((bb[2] + 12) - (cam[0] + bw / z)) / 30)
    for staerke, x0, umgekehrt in ((links, bx, False), (rechts, bx + bw - RAND, True)):
        if staerke > 0.01:
            m = _RANDMASKE.transpose(Image.FLIP_LEFT_RIGHT) if umgekehrt else _RANDMASKE
            m = m.resize((RAND, bh)).point(lambda v, s=staerke: int(v * s))
            f.img.paste(Image.new("RGB", (RAND, bh), BG), (x0, by), m)
    fl = F(max(17, int(D.fs * z)), 700)
    for k, e in D.edges.items():
        if not e.label: continue
        X, Y = plan_xy(box, z, cam, *e.pts[0]); col = hl.get(k, LABC_B02); links = e.lab == "l"
        x0 = X - 8 * z - fl.getlength(e.label) if links else X + 8 * z
        if x0 < bx + 2 or x0 + fl.getlength(e.label) > bx + bw - 2 or Y - 30 < by: continue
        f.el(clamp(a) * vis(k), lambda d, dy, X=X, Y=Y, col=col, links=links, txt=e.label:
             T2(d, X + (-8 if links else 8) * z, Y - 6 * z, txt, fl, col, "rs" if links else "ls"))


# ---------------------------------------------------------------- 1 Die Aufgabe
FAELLE = [("zu wenig", '"Zu wenig Geld"'), ("zu viel", "Rückgeld"), ("genau passend", '"Passt genau"')]

def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Die Aufgabe: drei Fälle am Automaten")
    E(f, t, 0.4, lambda d, dy: automat(d, 70, 140 + dy, 1.0, "1,50 €"))
    # Satz 1: der Plan aus Termin 02 mit zwei Wegen, klein; verschwindet mit Satz 2
    t02, t02_aus = a(1, 0.3), a(2, 0.0)
    pa = show(t, t02, t02_aus)
    if pa > 0.004: plan_draw(f, pa, PLAN02, (440, 160, 780, 410), maxzoom=1.0)
    E(f, t, t02, lambda d, dy: tag(d, 440, 118 + dy, 330, 46, "Termin 02: zwei Wege", LIGHTK, GREY, 24, 700, outl=LINE), tout=t02_aus)
    # Satz 2 und 3: drei Fälle untereinander
    ys = [150, 280, 410]; tf = [a(3, 0.0), a(3, 0.19), a(3, 0.7)]
    for j, (fall, aus) in enumerate(FAELLE):
        y = ys[j]
        def karte(d, dy, y=y, j=j):
            card(d, 440, y + dy, 780, 104, stripe=False); num_circle(d, 490, y + 52 + dy, 24, j + 1, RED)
        E(f, t, a(2, 0.15) + 0.25 * j, karte)
        def inhalt(d, dy, y=y, fall=fall, aus=aus):
            chip(d, 536, y + 22 + dy, 250, 60, fall, LIGHTK, DARK, 30)
            pfeil(d, 802, y + 52 + dy, 862, y + 52 + dy, GREY, 6, 18)
            TB(d, 880, y + 52 + dy, aus, F(38, 700), RED, 320, "lm", "Fall")
        E(f, t, tf[j], inhalt)
    E(f, t, a(4, 0.1), lambda d, dy: tag(d, 440, 560 + dy, 780, 72, "Drei Fälle, aber zwei Fragen genügen", RED, WHITE, 36))


# ---------------------------------------------------------------- 2 Der Plan mit zwei Rauten
PBOX2 = (60, 100, 1160, 560)

def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Erst der Plan: zwei Rauten, drei Wege")
    tin = {"s": 0.5, "e": 0.8, "d1": a(0, 0.45),
           "o1": a(1, 0.15),
           "d2": a(2, 0.55),
           "r": a(3, 0.35), "o2": a(3, 0.6),
           "o3": a(4, 0.55), "end": a(4, 0.85)}
    tm = dict(tin)
    tm.update({"s-e": tin["e"], "e-d1": tin["d1"], "d1-ja": a(1, 0.0), "d1-nein": a(2, 0.0), "d2-ja": a(3, 0.0),
               "r-o2": tin["o2"], "d2-nein": a(4, 0.0)})
    for k in ("d2-ja-z", "d2-nein-z", "d1-ja-z", "d1-nein-z", "d1-end"): tm[k] = tin["end"] - 0.1
    assert set(tm) == set(PLAN.reihenfolge), set(PLAN.reihenfolge) - set(tm)
    # gerade genannt: rot (Raute, Weg mit Beschriftung, Symbol)
    sched = [(tin["d1"], ["d1"]), (a(1, 0.0), ["d1-ja", "o1"]), (a(2, 0.0), ["d1-nein"]), (tin["d2"], ["d2"]),
             (a(3, 0.0), ["d2-ja", "r", "r-o2", "o2"]), (a(4, 0.0), ["d2-nein", "o3"]), (tin["end"] + 0.6, [])]
    cur = aktuell(t, sched)
    plan_draw(f, 1.0, PLAN, PBOX2, vis=reveal(t, tm), hl={k: RED for k in (cur or [])}, maxzoom=1.3)
    z, cam = plan_fit(PLAN, PBOX2, 1.3)
    # Satz 3: "Das Geld reicht" am nein-Weg der ersten Raute
    xd, yd = plan_xy(PBOX2, z, cam, PLAN.nodes["d2"].cx, PLAN.nodes["d1"].cy)
    E(f, t, a(2, 0.2), lambda d, dy: tag(d, xd + 22, yd - 22 + dy, 250, 46, "Das Geld reicht", LIGHTG, GREEN, 26, 700, outl=GREEN))


# ---------------------------------------------------------------- 3 Vom Plan zum Code: if, elif, else
PBOX3 = (40, 104, 500, 468)
Z3 = (PBOX3[3] - 24) / (PLAN.bbox()[3] - PLAN.bbox()[1])
assert Z3 * PLAN.fs >= 17, Z3
_bb = PLAN.bbox(); _sw, _sh = PBOX3[2] / Z3, PBOX3[3] / Z3
CAM_L = (_bb[0] - 12, _bb[1] - (_sh - (_bb[3] - _bb[1])) / 2)          # linker Teil: erste Raute mit ja-Weg
CAM_R = (_bb[2] + 12 - _sw, CAM_L[1])                                   # rechter Teil: zweite Raute mit beiden Wegen
for _k in ("o1", "d1"): assert PLAN.nodes[_k].bbox()[2] <= CAM_L[0] + _sw, _k
for _k in ("d2", "r", "o2", "o3"): assert PLAN.nodes[_k].bbox()[0] >= CAM_R[0], _k
CX3, CY3, CW3, CS3, CLH3 = 560, 116, 660, 24, 42

def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Vom Plan zum Code: if, elif, else")
    t_if, t_elif, t_else = a(1, 0.1), a(2, 0.05), a(3, 0.1)
    t_rest = a(3, 0.0) - 0.78                                 # Zeilen 6 und 7 erscheinen in der Pause zwischen Satz 3 und Satz 4
    times = [-1, -1, t_if, t_if + 0.5, t_elif, t_rest, t_rest + 0.3, t_else, t_else + 0.4]
    t_aus = a(4, 0.0)                                           # Satz 5 geht um den Code: der Plan blendet aus, der Code rückt in die Mitte
    cx = lerp(CX3, 310, ap(t, t_aus, 0.9))
    # Kamera: links (erste Raute), ab elif rechts (zweite Raute)
    k = ap(t, t_elif - 0.3, 0.9); cam = (lerp(CAM_L[0], CAM_R[0], k), CAM_L[1])
    hl_keys = aktuell(t, [(t_if, ["d1", "d1-ja", "o1"]), (t_elif, ["d2"]), (t_rest, ["d2", "d2-ja", "r", "r-o2", "o2"]),
                          (t_else, ["d2-nein", "o3"]), (t_aus, [])]) or []
    spaeter = {"d2", "d2-ja", "d2-nein", "r", "r-o2", "o2", "o3", "d2-ja-z", "d2-nein-z", "d1-nein", "d1-nein-z"}
    zeig = ap(t, t_elif - 0.5, 0.5)
    pa = ap(t, 0.2, 0.3) * (1 - ap(t, t_aus, 0.5))
    if pa > 0.004:
        plan_sicht(f, pa, PLAN, PBOX3, Z3, cam, vis=lambda k_: zeig if k_ in spaeter else 1.0, hl={k_: RED for k_ in hl_keys})
    aktiv = aktuell(t, [(t_if, {2, 3}), (t_elif, {4}), (t_rest, {4, 5, 6}), (t_else, {7, 8}), (t_aus, set())]) or set()
    geo = lambda dy: CodeGeo(cx, CY3 + dy, CW3, CS3, CLH3, 9)
    E(f, t, 0.3, lambda d, dy: code_lauf(d, cx, CY3 + dy, CW3, CODE, t, CS3, CLH3, times=times, aktiv=aktiv, cps=140))
    g = geo(0)
    # Satz 3: eigene Bedingung und Doppelpunkt
    E(f, t, a(2, 0.45), lambda d, dy: code_markiere(d, geo(dy), 4, *spalte(CODE[4], "geld > 1.5")), tout=t_else - 0.2)
    E(f, t, a(2, 0.62), lambda d, dy: code_markiere(d, geo(dy), 4, *spalte(CODE[4], ":", True)), tout=t_else - 0.2)
    # Satz 5: gleiche Höhe und Einrückung
    E(f, t, a(4, 0.05), lambda d, dy: code_fluchtlinie(d, geo(dy), 2, 7))
    def einr(d, dy):
        gg = geo(dy)
        for i in (3, 5, 6, 8): code_einrueckung(d, gg, i)
    E(f, t, a(4, 0.5), einr)
    yt = CY3 + g.h + 18
    E(f, t, a(4, 0.05), lambda d, dy: tag(d, cx, yt + dy, 322, 58, "if, elif, else: eine Linie", LIGHTR, RED, 26, 700, outl=RED))
    E(f, t, a(4, 0.5), lambda d, dy: tag(d, cx + 338, yt + dy, 322, 58, "der Weg: eingerückt", LIGHTA, AMB, 26, 700, outl=AMB))


# ---------------------------------------------------------------- 4 Das Rückgeld mit dem f-String
CX4, CY4, CW4, CS4, CLH4 = 120, 272, 840, 30, 54
ZEILEN4 = CODE[5:7]; G4 = CodeGeo(CX4, CY4, CW4, CS4, CLH4, 2)
assert G4.cx(len(ZEILEN4[1])) + 16 <= CX4 + CW4

def hinweis(d, dy, xm, y_code, x, y, w, txt, col, fill):
    """Etikett unter dem Code, mit senkrechter Linie hoch zur markierten Stelle (xm)."""
    assert x + 10 <= xm <= x + w - 10, txt
    d.line((xm, y_code + dy, xm, y + dy), fill=col, width=3)
    tag(d, x, y + dy, w, 52, txt, fill, col, 26, 700, outl=col)

def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Das Rückgeld mit zwei Nachkommastellen")
    E(f, t, 0.3, lambda d, dy: code_lauf(d, CX4, CY4 + dy, CW4, ZEILEN4, t, CS4, CLH4, nums=[6, 7],
                                           aktiv={1} if a(1, 0.0) <= t < a(5, 0.0) else None))
    E(f, t, a(0, 0.45), lambda d, dy: zeilen_notiz(d, CodeGeo(CX4, CY4 + dy, CW4, CS4, CLH4, 2), 0, 980, 240, "erst rechnen", LIGHTA, AMB, 28, outl=AMB), tout=a(2, 0.0))
    E(f, t, a(0, 0.7), lambda d, dy: zeilen_notiz(d, CodeGeo(CX4, CY4 + dy, CW4, CS4, CLH4, 2), 1, 980, 240, "dann ausgeben", LIGHTG, GREEN, 28, outl=GREEN), tout=a(2, 0.0))
    # Satz 2: das Parallelogramm aus dem Plan, Pfeil zur print-Zeile
    if t >= a(1, 0.0) - 0.1:
        symbol(f, show(t, a(1, 0.0)), "io", "Ausgabe: rueckgeld", (60, 112, 400, 110), bg=BG, hl=RED, maxzoom=1.4)
    def zur_zeile(d, dy):
        ym = G4.zmitte(1) + dy
        d.line((100, 196 + dy, 100, ym), fill=RED, width=4); pfeil(d, 98, ym, CX4 - 4, ym, RED, 4, 16)
    E(f, t, a(1, 0.15), zur_zeile)
    E(f, t, a(1, 0.55), lambda d, dy: tag(d, 500, 136 + dy, 720, 60, "Wie die Zahl aussieht, legt der Code fest", LIGHTK, DARK, 28, 700, outl=LINE), tout=a(2, 0.0))
    E(f, t, a(2, 0.05), lambda d, dy: tag(d, 500, 136 + dy, 720, 60, "der f-String aus Termin 02", RED, WHITE, 30))
    # Satz 4 und 5: f, geschweifte Klammern, :.2f
    L = ZEILEN4[1]; yb = G4.zeichen(1, 0, 1)[3]
    f0, f1 = spalte(L, 'f"'); f1 = f0 + 1
    k0, _ = spalte(L, "{"); _, k1 = spalte(L, "}")
    p0, p1 = spalte(L, ":.2f")
    def mark(c0, c1, col, ri=0, li=0):
        def fn(d, dy):
            x0, y0, x1, y1 = CodeGeo(CX4, CY4 + dy, CW4, CS4, CLH4, 2).zeichen(1, c0, c1)
            d.rounded_rectangle((x0 + li, y0, x1 - ri, y1), 6, outline=col, width=3)
        return fn
    E(f, t, a(3, 0.15), mark(f0, f1, RED))
    E(f, t, a(3, 0.15), lambda d, dy: hinweis(d, dy, (G4.cx(f0) + G4.cx(f1)) / 2, yb, 160, 474, 380, "f vor dem Anführungszeichen", RED, LIGHTR))
    E(f, t, a(3, 0.6), mark(k0, k0 + 1, BLUE)); E(f, t, a(3, 0.6), mark(k1 - 1, k1, BLUE, 0, 6))
    xn = (G4.cx(k0 + 1) + G4.cx(p0)) / 2
    E(f, t, a(3, 0.6), lambda d, dy: hinweis(d, dy, xn, yb, 500, 544, 220, "Name in { }", BLUE, LIGHTB))
    E(f, t, a(4, 0.2), mark(p0, p1, AMB, 3))
    E(f, t, a(4, 0.2), lambda d, dy: hinweis(d, dy, (G4.cx(p0) + G4.cx(p1)) / 2, yb, 600, 614, 400, ":.2f zwei Nachkommastellen", AMB, LIGHTA))
    # Satz 6: 0.50 statt 0.5
    def richtig(d, dy):
        monobox(d, 990, 290 + dy, 160, 72, "0.50", 40); check_circle(d, 1186, 326 + dy, 24)
    def falsch(d, dy):
        monobox(d, 990, 390 + dy, 160, 72, "0.5", 40, CODE_C); durchstreichen(d, 1000, 400 + dy, 1096, 452 + dy, art="waagrecht")
    E(f, t, a(5, 0.1), richtig); E(f, t, a(5, 0.55), falsch)


# ---------------------------------------------------------------- 5 Die Probe mit 2 Euro
PBOX5 = (40, 100, 760, 470)
RX = 820

def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Die Probe: ein Wert je Weg")
    stufen = [(a(0, 0.3), 3), (a(1, 0.0), 5), (a(1, 0.8), 6), (a(2, 0.0), 7), (a(2, 0.8), 11), (a(3, 0.0), len(W2))]
    n = aktuell(t, stufen) or 0
    alles = t >= a(3, 0.0)
    plan_draw(f, ap(t, 0.2, 0.3), PLAN, PBOX5, vis=weg_vis(W2, 0.3, show(t, a(3, 0.3))) if alles else None,
              hl=weg_hl(W2[:n]), maxzoom=1.0)
    p = LAUF2[0][:-1]
    zeilen = [(0.6, p, a(0, 0.45), "2"), (a(3, 0.15), LAUF2[1], None, None, CODE_G)]
    E(f, t, 0.4, lambda d, dy: lauf_panel(d, RX, 110 + dy, 400, zeilen, t, 24, 40, hl={1} if t >= a(3, 0.15) else None))
    E(f, t, a(1, 0.0), lambda d, dy: TB(d, RX, 278 + dy, "1. Raute", F(26, 700), GREY, 400))
    vergleich_zeile(f, t, RX, 312, "2", "<", "1.5", a(1, 0.1), a(1, 0.8), "weg", 36, ergebnis="nein")
    E(f, t, a(2, 0.0), lambda d, dy: TB(d, RX, 392 + dy, "2. Raute", F(26, 700), GREY, 400))
    vergleich_zeile(f, t, RX, 426, "2", ">", "1.5", a(2, 0.1), a(2, 0.8), "weg", 36, ergebnis="ja")
    E(f, t, a(3, 0.6), lambda d, dy: tag(d, RX, 510 + dy, 400, 56, "der mittlere Weg", LIGHTR, RED, 28, 700, outl=RED))
    # Auftrag
    for j, (wert, lauf, tin) in enumerate((("1", LAUF1, a(4, 0.15)), ("1.5", LAUF15, a(4, 0.6)))):
        x = 40 + j * 600
        def karte(d, dy, x=x, wert=wert, lauf=lauf):
            card(d, x, 590 + dy, 580, 76, stripe=False)
            TB(d, x + 20, 628 + dy, "Probier", F(28, 600), GREY, 100, "lm", "Auftrag")
            monobox(d, x + 124, 600 + dy, 100, 56, wert, 34, CODE_N)
        def ergebnis(d, dy, x=x, lauf=lauf):
            pfeil(d, x + 236, 628 + dy, x + 280, 628 + dy, GREY, 5, 16)
            TB(d, x + 292, 628 + dy, lauf[1], F(32, 700), DARK, 240, "lm", "Auftrag")
        E(f, t, tin, karte); E(f, t, a(5, 0.1) + 0.5 * j, ergebnis)    # das Ergebnis erst am Schluss: erst selbst probieren
    E(f, t, a(5, 0.7), lambda d, dy: (check_circle(d, 590, 628 + dy, 18), check_circle(d, 1190, 628 + dy, 18),
                                      check_circle(d, 1190, 538 + dy, 18)))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == 5 == len(SCENES)

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 56, "Termin 03 · Informatik", F(34, 600), GREY)
        T2(d, 90, 100, "Vorgerechnet: Getränkeautomat", F(68, 700), DARK)
        T2(d, 90, 250, "Drei Wege", F(52, 700), DARK)
        T2(d, 90, 318, "if, elif, else", M(34, True), RED)
        T2(d, 90, 420, "Erst der Plan,", F(32, 600), GREY)
        T2(d, 90, 462, "dann der Code", F(32, 600), GREY)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn)
    plan_draw(f, 1.0, PLAN, (380, 196, 870, 484), hl=weg_hl(W2), maxzoom=1.0)
    f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
