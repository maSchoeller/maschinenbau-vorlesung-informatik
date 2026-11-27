"""Termin 05, Video 3: Vorgerechnet: Pendelzeit (Aufgabe mit n Tagen, Plan mit Schleife und Rücksprung, Code mit for und range,
Probe mit 3, 25, 31, 22 als Tabelle, Grenzfall 0 Tage mit ZeroDivisionError).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Der Code muss zeichengleich mit der Seite sein (app/inhalte/v05/labor/w-vorgemacht.vorlage.py)."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v04-common"))
from b04 import *
from texte import SRC

NAME = "v05-beispiel"; LABEL = "DHBW · Informatik · Termin 05 · Vorgerechnet: Pendelzeit"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Code (zeichengenau wie auf der Seite) und echte Programmläufe
CODE = ["# Pendelzeit: Durchschnitt über n Tage",
        'n = int(input("Wie viele Tage? "))',
        "summe = 0",
        "for i in range(1, n + 1):",
        '    minuten = int(input(f"Minuten an Tag {i}: "))',
        "    summe = summe + minuten",
        "mittel = summe / n",
        'print(f"Im Schnitt {mittel:.1f} Minuten")']
_SEITE = os.path.join(HERE, "..", "..", "app", "inhalte", "v05", "labor", "w-vorgemacht.vorlage.py")
if os.path.exists(_SEITE):
    assert open(_SEITE, encoding="utf-8").read().splitlines() == CODE, "Code weicht von w-vorgemacht.vorlage.py ab"
QUELLE = NL.join(CODE)
EING = ["3", "25", "31", "22"]
LAUF = run(QUELLE, EING)
assert LAUF == ["Wie viele Tage? 3", "Minuten an Tag 1: 25", "Minuten an Tag 2: 31", "Minuten an Tag 3: 22",
                "Im Schnitt 26.0 Minuten"], LAUF
assert run(QUELLE, ["1", "17"])[-1] == "Im Schnitt 17.0 Minuten"
try:
    run(QUELLE, ["0"]); raise AssertionError("0 Tage muss einen Fehler geben")
except ZeroDivisionError as _e:
    FEHLER = f"{type(_e).__name__}: {_e}"
assert FEHLER == "ZeroDivisionError: division by zero", FEHLER
MIN = [int(x) for x in EING[1:]]; SUMMEN = [sum(MIN[:k + 1]) for k in range(3)]
assert MIN == [25, 31, 22] and SUMMEN == [25, 56, 78] and 78 / 3 == 26.0 and f"{78 / 3:.1f}" == "26.0"
PROMPTS = [LAUF[0][:-1], *(z[:-2] for z in LAUF[1:4])]
assert PROMPTS == ["Wie viele Tage? ", "Minuten an Tag 1: ", "Minuten an Tag 2: ", "Minuten an Tag 3: "], PROMPTS

# ---------------------------------------------------------------- Plan
PLAN = schleife_plan([("s", "term", "Start"), ("n", "io", "Eingabe: n"), ("i", "proc", "summe = 0"),
                      ("w", "loop", "i von 1 bis n?", [("e", "io", "Eingabe: minuten"), ("a", "proc", "summe = summe + minuten")]),
                      ("m", "proc", "mittel = summe / n"), ("o", "io", "Ausgabe: mittel"), ("end", "term", "Ende")])
W3 = schleife_weg(PLAN, {"w": 3}); W0 = schleife_weg(PLAN, {"w": 0})
assert W3.count("e") == 3 and W3.count("w-zurueck") == 3 and W3.count("w") == 4 and W3[-1] == "end"
assert W0 == ["s", "s-n", "n", "n-i", "i", "i-w", "w", "w-nein", "m", "m-o", "o", "o-end", "end"], W0
assert set(PLAN.reihenfolge) == set(PLAN.nodes) | set(PLAN.edges)
KNOTEN = [k for k in PLAN.reihenfolge if k in PLAN.nodes]
assert KNOTEN == ["s", "n", "i", "w", "e", "a", "m", "o", "end"], KNOTEN


def plan_y(box, z, cam, k):
    return plan_xy(box, z, cam, 0, PLAN.nodes[k].cy)[1]


# ---------------------------------------------------------------- 1 Die Aufgabe
def stoppuhr(d, cx, cy, r, winkel=0.9):
    d.rectangle((cx - 7, cy - r - 16, cx + 7, cy - r - 3), fill=GREY)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=WHITE, outline=DARK, width=5)
    for k in range(12):
        w = k * math.pi / 6; r0 = r - (10 if k % 3 == 0 else 6)
        d.line((cx + r0 * math.sin(w), cy - r0 * math.cos(w), cx + (r - 3) * math.sin(w), cy - (r - 3) * math.cos(w)), fill=GREY, width=2)
    d.line((cx, cy, cx + (r - 14) * math.sin(winkel), cy - (r - 14) * math.cos(winkel)), fill=RED, width=5)
    d.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=DARK)


def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Die Aufgabe: Durchschnitt über n Tage")
    for j, m in enumerate(MIN):
        def karte(d, dy, j=j, m=m):
            x, y = 60 + j * 190, 130 + dy
            card(d, x, y, 170, 250, stripe=False)
            TB(d, x + 85, y + 36, f"Tag {j + 1}", F(30, 700), DARK, 150, "mm", "Tag")
            stoppuhr(d, x + 85, y + 120, 42, 0.8 + 1.7 * j)
            TB(d, x + 85, y + 210, f"{m} min", F(36, 700), RED, 150, "mm", "Minuten")
        E(f, t, a(0, 0.35) + 0.3 * j, karte)
    def klammer(d, dy):
        y = 400 + dy
        d.line((60, y - 14, 60, y), fill=GREY, width=4); d.line((610, y - 14, 610, y), fill=GREY, width=4); d.line((60, y, 610, y), fill=GREY, width=4)
        tag(d, 255, y + 8, 160, 54, "n Tage", LIGHTK, DARK, 30, 700, outl=LINE)
    E(f, t, a(0, 0.6), klammer)
    def auftrag(d, dy):
        card(d, 660, 130 + dy, 560, 250, stripe=False)
        TB(d, 690, 164 + dy, "Auftrag", F(30, 700), GREY, 200, "lm", "Auftrag")
    E(f, t, a(0, 0.05), auftrag)
    schritte = [("n einlesen, mindestens 1", a(0, 0.3)), ("Minuten jedes Tages einlesen", a(1, 0.05)), ("Durchschnitt ausgeben", a(1, 0.55))]
    for j, (txt, tin) in enumerate(schritte):
        def schritt(d, dy, j=j, txt=txt):
            y = 218 + j * 62 + dy
            num_circle(d, 706, y, 20, j + 1, RED); TB(d, 740, y, txt, F(30, 600), DARK, 460, "lm", "Schritt")
        E(f, t, tin, schritt)
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 60, 486 + dy, 1160, 60, "Wie oft? Das steht nach der ersten Eingabe fest: n Mal", LIGHTK, DARK, 32, 700, outl=LINE))
    E(f, t, a(2, 0.6), lambda d, dy: tag(d, 60, 568 + dy, 1160, 76, "n Mal, also for", RED, WHITE, 42))


# ---------------------------------------------------------------- 2 Der Plan mit Schleife
PBOX2 = (60, 100, 520, 576)

def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Erst der Plan: Raute mit Rücksprung")
    tn = {"s": 0.5, "n": a(0, 0.3), "i": a(0, 0.7), "w": a(1, 0.12), "e": a(2, 0.1), "a": a(2, 0.28),
          "m": a(2, 0.66), "o": a(2, 0.84), "end": a(2, 0.95)}
    tm = dict(tn)
    for k, e in PLAN.into.items(): tm[e] = tn[k] - 0.2
    tm["w-zurueck"] = a(2, 0.43)
    assert set(tm) == set(PLAN.reihenfolge), set(PLAN.reihenfolge) ^ set(tm)
    sched = [(tn["n"], ["n"]), (tn["i"], ["i"]), (tn["w"], ["w"]), (a(2, 0.0), ["w-ja"]), (a(2, 0.1), ["e", "e-a"]),
             (a(2, 0.28), ["a"]), (a(2, 0.43), ["w-zurueck"]), (a(2, 0.56), ["w-nein", "m"]), (a(2, 0.84), ["m-o", "o"]),
             (tn["end"] + 0.5, [])]
    cur = aktuell(t, sched) or []
    z, cam = schleife_draw(f, 1.0, PLAN, PBOX2, vis=reveal(t, tm), hl={k: RED for k in cur})
    yw, ye, ya, ym = (plan_y(PBOX2, z, cam, k) for k in ("w", "e", "a", "m"))
    X = 660
    E(f, t, a(1, 0.3), lambda d, dy: tag(d, X, yw - 28 + dy, 520, 56, "Gibt es noch einen Tag?", LIGHTA, AMB, 30, 700, outl=AMB))
    E(f, t, a(2, 0.02), lambda d, dy: tag(d, X, (ye + ya) / 2 - 28 + dy, 520, 56, "ja: der Rumpf läuft", LIGHTR, RED, 30, 700, outl=RED))
    E(f, t, a(2, 0.5), lambda d, dy: tag(d, X, ym - 28 + dy, 520, 56, "nein: es geht weiter", LIGHTG, GREEN, 30, 700, outl=GREEN))


# ---------------------------------------------------------------- 3 Vom Plan zum Code: for und range
PBOX3 = (40, 100, 380, 576)
CX3, CY3, CW3, CS3, CLH3 = 440, 112, 800, 24, 48
G3 = CodeGeo(CX3, CY3, CW3, CS3, CLH3, len(CODE))
assert G3.cx(len(CODE[4])) + 16 <= CX3 + CW3

def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Vom Plan zum Code: for und range")
    t_aus = a(3, 0.0)
    times = [a(0, 0.0) + 0.3, a(0, 0.1), a(1, 0.0), a(1, 0.12), a(2, 0.05), a(2, 0.3), a(2, 0.85), a(2, 0.9)]
    cx = lerp(CX3, 240, ap(t, t_aus, 0.9))
    pa = 1 - ap(t, t_aus, 0.5)
    hl_keys = aktuell(t, [(a(0, 0.05), ["n"]), (a(1, 0.0), ["i"]), (a(1, 0.12), ["w"]), (a(2, 0.05), ["e", "e-a", "a"]), (t_aus, [])]) or []
    if pa > 0.004:
        schleife_draw(f, pa, PLAN, PBOX3, hl={k: RED for k in hl_keys})
    aktiv = aktuell(t, [(a(0, 0.05), {1}), (a(1, 0.0), {2}), (a(1, 0.12), {3}), (a(2, 0.05), {4, 5}), (t_aus, set())]) or set()
    geo = lambda dy: CodeGeo(cx, CY3 + dy, CW3, CS3, CLH3, len(CODE))
    E(f, t, 0.3, lambda d, dy: code_lauf(d, cx, CY3 + dy, CW3, CODE, t, CS3, CLH3, times=times, aktiv=aktiv, cps=140))
    # Satz 2: das Plus eins
    E(f, t, a(1, 0.55), lambda d, dy: code_markiere(d, geo(dy), 3, *spalte(CODE[3], "n + 1")), tout=a(2, 0.0))
    E(f, t, a(1, 0.6), lambda d, dy: zeilen_notiz(d, geo(dy), 3, 880, 340, "Stoppwert zählt nicht", LIGHTA, AMB, 26, outl=AMB), tout=a(2, 0.0))
    # Satz 3: das i steckt in der Frage
    E(f, t, a(2, 0.35), lambda d, dy: code_markiere(d, geo(dy), 4, *spalte(CODE[4], "{i}")), tout=t_aus)
    E(f, t, a(2, 0.4), lambda d, dy: tag(d, CX3, 592 + dy, CW3, 56, "Das i steckt in der Frage: Minuten an Tag i", LIGHTK, DARK, 28, 700, outl=LINE), tout=t_aus)
    # Satz 4: drei Stellen
    stellen = [(2, 2, BLUE, LIGHTB, "vor: Startwert", a(3, 0.22)), (4, 5, RED, LIGHTR, "im Rumpf: einlesen, addieren", a(3, 0.4)),
               (6, 7, GREEN, LIGHTG, "nach: teilen, ausgeben", a(3, 0.72))]
    for j, (i0, i1, col, fill, txt, tin) in enumerate(stellen):
        def rahmen(d, dy, i0=i0, i1=i1, col=col):
            g = geo(dy)
            d.rounded_rectangle((g.x + 6, g.zy(i0) - 6, g.x + g.w - 6, g.zy(i1) + CLH3 - 10), 8, outline=col, width=4)
        E(f, t, tin, rahmen)
        w = 376
        E(f, t, tin, lambda d, dy, j=j, fill=fill, col=col, txt=txt, w=w:
          tag(d, 60 + j * (w + 16), 592 + dy, w, 56, txt, fill, col, 25, 700, outl=col))


# ---------------------------------------------------------------- 4 Die Probe mit 3, 25, 31, 22
TAB_X, TAB_Y = 660, 210
TAB_C = [("i", 110), ("minuten", 210), ("summe", 210)]
TAB_RH = 62

def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Die Probe mit 3, 25, 31 und 22")
    # Eingaben als Reihe
    for j, (lab, w) in enumerate((("n = 3", 130), ("25", 100), ("31", 100), ("22", 100))):
        E(f, t, a(0, 0.15) + 0.3 * j, lambda d, dy, j=j, lab=lab, w=w:
          chip(d, 60 + (0 if j == 0 else 130 + 20 + (j - 1) * 120), 120 + dy, w, 60, lab, LIGHTK if j else LIGHTR, DARK, 32, outl=LINE, mono=True))
    # Lauf
    tab = [(a(1, 0.0), a(1, 0.08)), (a(1, 0.38), a(1, 0.46)), (a(1, 0.68), a(1, 0.76))]
    zeilen = [(a(0, 0.3), PROMPTS[0], a(0, 0.6), "3")]
    for j in range(3):
        zeilen.append((tab[j][0], PROMPTS[j + 1], tab[j][1], str(MIN[j])))
    zeilen.append((a(2, 0.3), LAUF[4], None, None, CODE_G))
    hl = {4} if t >= a(2, 0.3) else None
    E(f, t, 0.4, lambda d, dy: lauf_panel(d, 60, 210 + dy, 540, zeilen, t, 26, 42, hl=hl))
    # Tabelle
    def geruest(d, dy):
        x = TAB_X; y = TAB_Y + dy; wges = sum(w for _, w in TAB_C)
        d.rounded_rectangle((x, y, x + wges, y + TAB_RH * 4), 14, fill=WHITE, outline=LINE, width=2)
        d.rounded_rectangle((x, y, x + wges, y + TAB_RH), 14, fill=LIGHTK)
        d.rectangle((x, y + TAB_RH - 14, x + wges, y + TAB_RH), fill=LIGHTK)
        cx0 = x
        for name, w in TAB_C:
            TB(d, cx0 + w / 2, y + TAB_RH / 2, name, M(30), GREY, w - 10, "mm", "Spalte"); cx0 += w
        for r in range(1, 4): d.line((x, y + r * TAB_RH, x + wges, y + r * TAB_RH), fill=LINE, width=2)
    E(f, t, a(0, 0.5), geruest)
    zeile_hl = aktuell(t, [(tab[0][0], 0), (tab[1][0], 1), (tab[2][0], 2), (a(2, 0.0), None)])
    def zeile(d, dy, j):
        x = TAB_X; y = TAB_Y + dy + (j + 1) * TAB_RH
        if zeile_hl == j:
            d.rectangle((x + 4, y + 3, x + sum(w for _, w in TAB_C) - 4, y + TAB_RH - 3), fill=LIGHTR); d.rectangle((x + 4, y + 3, x + 9, y + TAB_RH - 3), fill=RED)
    for j in range(3): E(f, t, tab[j][0], lambda d, dy, j=j: zeile(d, dy, j))
    for j in range(3):
        vals = [(str(j + 1), tab[j][0]), (str(MIN[j]), tab[j][1] + 0.2), (str(SUMMEN[j]), tab[j][1] + 0.9)]
        cx0 = TAB_X
        for (txt, tin), (name, w) in zip(vals, TAB_C):
            col = RED if name == "summe" else DARK
            E(f, t, tin, lambda d, dy, cx0=cx0, w=w, j=j, txt=txt, col=col:
              TB(d, cx0 + w / 2, TAB_Y + dy + (j + 1) * TAB_RH + TAB_RH / 2, txt, M(34), col, w - 10, "mm", "Zelle"))
            cx0 += w
    # Schluss
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 60, 520 + dy, 540, 56, "Die Schleife ist zu Ende", LIGHTK, DARK, 30, 700, outl=LINE))
    E(f, t, a(2, 0.15), lambda d, dy: monobox(d, 660, 520 + dy, 530, 76, "78 / 3 = 26.0", 44))
    E(f, t, a(2, 0.55), lambda d, dy: check_circle(d, 1226, 558 + dy, 18))


# ---------------------------------------------------------------- 5 Grenzfall: 0 Tage
ERR = (255, 120, 130)
PBOX5 = (60, 100, 420, 576)
RX5 = 540

def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Grenzfall: 0 Tage")
    stufen = [(a(0, 0.3), 7), (a(1, 0.05), 8), (a(1, 0.5), 9)]
    n = aktuell(t, stufen) or 0
    schleife_draw(f, ap(t, 0.2, 0.3), PLAN, PBOX5, vis=weg_vis(W0, 0.3, show(t, a(1, 0.0))), hl=weg_hl(W0[:n]))
    zeilen = [(0.6, PROMPTS[0], a(0, 0.45), "0"), (a(2, 0.2), FEHLER, None, None, ERR)]
    E(f, t, 0.4, lambda d, dy: lauf_panel(d, RX5, 130 + dy, 680, zeilen, t, 28, 44, hl={1} if t >= a(2, 0.2) else None))
    E(f, t, a(1, 0.15), lambda d, dy: (monobox(d, RX5, 310 + dy, 300, 64, "summe = 0", 34), monobox(d, RX5 + 320, 310 + dy, 200, 64, "n = 0", 34)))
    def teilen(d, dy):
        monobox(d, RX5, 396 + dy, 400, 68, "mittel = summe / n", 32)
        pfeil(d, RX5 + 416, 430 + dy, RX5 + 466, 430 + dy, GREY, 5, 16)
        monobox(d, RX5 + 480, 396 + dy, 200, 68, "0 / 0", 36, ERR)
    E(f, t, a(1, 0.6), teilen)
    E(f, t, a(2, 0.55), lambda d, dy: tag(d, RX5, 490 + dy, 680, 64, "Durch 0 teilen geht nicht", LIGHTR, RED, 32, 700, outl=RED), tout=a(3, 0.0))
    E(f, t, a(3, 0.0), lambda d, dy: tag(d, RX5, 490 + dy, 680, 64, "Aufgabe: mindestens 1 Tag", RED, WHITE, 34))
    def auftrag(d, dy):
        card(d, RX5, 586 + dy, 680, 76, stripe=False)
        TB(d, RX5 + 20, 624 + dy, "Auftrag", F(28, 600), GREY, 120, "lm", "Auftrag")
        TB(d, RX5 + 160, 624 + dy, "Probier es selbst aus", F(32, 700), DARK, 500, "lm", "Auftrag")
    E(f, t, a(3, 0.55), auftrag)


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == 5 == len(SCENES)

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 56, "Termin 05 · Informatik", F(34, 600), GREY)
        T2(d, 90, 100, "Vorgerechnet: Pendelzeit", F(58, 700), DARK)
        T2(d, 90, 250, "Durchschnitt über n Tage", F(48, 700), DARK)
        T2(d, 90, 318, "for i in range(1, n + 1):", M(34, True), RED)
        T2(d, 90, 420, "Erst der Plan,", F(32, 600), GREY)
        T2(d, 90, 462, "dann der Code", F(32, 600), GREY)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn)
    schleife_draw(f, 1.0, PLAN, (800, 70, 440, 600), hl={k: RED for k in ("w", "w-ja", "e", "e-a", "a", "w-zurueck")})
    f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
