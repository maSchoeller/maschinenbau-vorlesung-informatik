"""Termin 02, Video 3: Vorgerechnet: Einlass ab 16, vom Plan zum Programm (Aufgabe und Bedingung, Plan Symbol fuer Symbol,
Code Zeile fuer Zeile aus dem Plan, gemeinsame letzte Zeile, Probe mit dem Grenzfall 16, Jetzt du).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Der Code steht zeichengleich auf der Seite (app/inhalte/v02/labor/w-vorgemacht.vorlage.py); liegt die Datei vor, wird verglichen."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v02-beispiel"; LABEL = "DHBW · Informatik · Termin 02 · Vorgerechnet: Einlass ab 16"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Code (zeichengenau wie auf der Seite) und echte Programmlaeufe
CODE = ["# Einlass ab 16", 'alter = int(input("Alter: "))', "if alter >= 16:", '    print("Einlass")', "else:",
        '    print("Kein Einlass")', 'print("Der Nächste bitte")']
_SEITE = os.path.join(HERE, "..", "..", "app", "inhalte", "v02", "labor", "w-vorgemacht.vorlage.py")
if os.path.exists(_SEITE):
    assert open(_SEITE, encoding="utf-8").read().splitlines() == CODE, "Code im Video weicht von w-vorgemacht.vorlage.py ab"
QUELLE = NL.join(CODE)
LAUF = run(QUELLE, ["16"])
assert LAUF == ["Alter: 16", "Einlass", "Der Nächste bitte"], LAUF
assert run(QUELLE, ["15"]) == ["Alter: 15", "Kein Einlass", "Der Nächste bitte"]
assert run(QUELLE, ["17"]) == ["Alter: 17", "Einlass", "Der Nächste bitte"]
assert (16 >= 16) is True and (16 > 16) is False                          # Grenzfall; mit > kaeme bei 16 "Kein Einlass"
assert run(QUELLE.replace(">=", ">"), ["16"])[1] == "Kein Einlass"
assert CODE[3].startswith("    ") and CODE[5].startswith("    ") and not CODE[6].startswith(" ")   # Einrueckung wie gesprochen

PLAN = plan_zweig([("s", "term", "Start"), ("e", "io", "Eingabe: alter"),
                   ("d", "dec", "alter >= 16?", [("j", "io", 'Ausgabe: "Einlass"')], [("n", "io", 'Ausgabe: "Kein Einlass"')]),
                   ("o", "io", 'Ausgabe: "Der Nächste bitte"'), ("end", "term", "Ende")])
W16 = weg(PLAN, {"d": "ja"})
assert W16 == ["s", "s-e", "e", "e-d", "d", "d-ja", "j", "d-ja-z", "d-o", "o", "o-end", "end"], W16
ZUSAMMEN = zusammen(PLAN, "d")


# ---------------------------------------------------------------- 1 Die Aufgabe und die Bedingung
A1 = ["Lies das Alter ein, eine ganze Zahl.", "Ab 16 Jahren: „Einlass“, sonst: „Kein Einlass“.",
      "Danach in jedem Fall: „Der Nächste bitte“."]

def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Die Aufgabe: Einlass ab 16")
    E(f, t, 0.3, lambda d, dy: card(d, 60, 116 + dy, 1160, 214))
    fa = F(36, 600)
    for k, (zeile, tin) in enumerate(zip(A1, (a(0, 0.05), a(1, 0.0), a(2, 0.0)))):
        E(f, t, tin, lambda d, dy, k=k, zeile=zeile: TB(d, 100, 158 + 62 * k + dy, zeile, fa, DARK, 1080, "lm", "Aufgabe"))
    x_ab = 100 + fa.getlength("Ab 16")
    E(f, t, a(4, 0.0), lambda d, dy: d.line((98, 158 + 62 + 24 + dy, x_ab + 2, 158 + 62 + 24 + dy), fill=RED, width=5))
    E(f, t, a(3, 0.05), lambda d, dy: TB(d, 640, 380 + dy, "Welche Frage entscheidet?", F(38, 700), DARK, 1100, "mm"))
    y = 450; h = 80
    E(f, t, a(4, 0.0), lambda d, dy: chip(d, 60, y + dy, 200, h, "ab 16", LIGHTR, RED, 36, outl=RED))
    E(f, t, a(4, 0.2), lambda d, dy: (pfeil(d, 274, y + h / 2 + dy, 338, y + h / 2 + dy, GREY, 6, 18),
                                       chip(d, 352, y + dy, 320, h, "mindestens 16", LIGHTK, DARK, 36)))
    E(f, t, a(4, 0.55), lambda d, dy: (check_circle(d, 392, y + h + 44 + dy, 18),
                                        TB(d, 422, y + h + 44 + dy, "die 16 gehört dazu", F(30, 700), GREEN, 300, "lm")))
    bw, bh = vergleich_mass("alter", ">=", "16", 48)
    xv = 1220 - bw; yv = y + (h - bh) / 2
    E(f, t, a(5, 0.25), lambda d, dy: (pfeil(d, 686, y + h / 2 + dy, xv - 14, y + h / 2 + dy, GREY, 6, 18),
                                        vergleich(d, xv, yv + dy, "alter", ">=", "16", 48)))
    E(f, t, a(5, 0.45), lambda d, dy: TB(d, xv + bw / 2, yv + bh + 30 + dy, "die Bedingung", F(30, 700), RED, bw + 40, "mm"))


# ---------------------------------------------------------------- 2 Der Plan, Symbol fuer Symbol
PBOX2 = (40, 100, 740, 586)

def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Erst der Plan")
    tin = {"s": a(1, 0.0), "e": a(1, 0.3), "d": a(2, 0.25), "j": a(3, 0.1), "n": a(3, 0.55),
           "z": a(4, 0.1), "o": a(5, 0.05), "end": a(5, 0.75)}
    tm = {"s": tin["s"], "s-e": tin["e"], "e": tin["e"], "e-d": tin["d"], "d": tin["d"],
          "d-ja": tin["j"], "j": tin["j"], "d-nein": tin["n"], "n": tin["n"],
          "d-ja-z": tin["z"], "d-nein-z": tin["z"], "d-o": tin["o"], "o": tin["o"], "o-end": tin["end"], "end": tin["end"]}
    assert set(tm) == set(PLAN.reihenfolge)
    plan_hl = [(tin["s"], {"s"}), (tin["e"], {"e"}), (tin["d"], {"d"}), (tin["j"], {"d-ja", "j"}), (tin["n"], {"d-nein", "n"}),
               (tin["z"], set(ZUSAMMEN)), (tin["o"], {"o"}), (tin["end"], {"end"})]
    cur = aktuell(t, plan_hl) or set()
    z, cam = plan_draw(f, 1.0, PLAN, PBOX2, vis=reveal(t, tm), hl={k: RED for k in cur}, maxzoom=1.3)
    # neben dem Symbol: was es ist (rot, solange davon die Rede ist, danach grau)
    def name(x, ym, txt, tin_, t_aus):
        col = RED if t < t_aus else GREY
        E(f, t, tin_, lambda d, dy: TB(d, x, ym + dy, txt, F(30, 700), col, 1220 - x, "lm", "Symbolname"))
    nd = PLAN.nodes["d"]; x_nein, yd = plan_xy(PBOX2, z, cam, nd.cx + nd.b, nd.cy)
    x0, y0, x1, y1 = plan_kasten(PBOX2, z, cam, PLAN.nodes["e"])
    name(x1 + 24, (y0 + y1) / 2, "Parallelogramm: Eingabe", tin["e"] + 0.2, tin["d"])
    name(x_nein + 28, yd, "Raute: die Frage", tin["d"] + 0.2, tin["j"])
    xm, ym = plan_xy(PBOX2, z, cam, *PLAN.merge["d"])
    name(x_nein + 28, ym, "Wege laufen zusammen", tin["z"] + 0.2, tin["o"])
    x0, y0, x1, y1 = plan_kasten(PBOX2, z, cam, PLAN.nodes["o"])
    name(x_nein + 28, (y0 + y1) / 2, "gemeinsame Ausgabe", tin["o"] + 0.2, tin["end"])
    E(f, t, tin["z"] + 0.2, lambda d, dy: d.ellipse((xm - 10, ym - 10 + dy, xm + 10, ym + 10 + dy), outline=RED, width=4), tout=tin["o"])
    E(f, t, a(0, 0.1), lambda d, dy: tag(d, 820, 112 + dy, 400, 64, "Erst der Plan, dann der Code", RED, WHITE, 28))


# ---------------------------------------------------------------- 3 und 4 Vom Plan zum Code
PBOX3 = (24, 116, 500, 470)
CX, CY, CW, CS, CLH = 560, 116, 660, 24, 42
GEO = CodeGeo(CX, CY, CW, CS, CLH, len(CODE))
NY = CY + GEO.h + 26

def plan_und_code(f, t, times, aktiv, plan_keys):
    z, cam = plan_draw(f, ap(t, 0.0, 0.3), PLAN, PBOX3, hl={k: RED for k in (plan_keys or ())}, maxzoom=1.4)
    f.el(ap(t, 0.0, 0.3), lambda d, dy: code_lauf(d, CX, CY, CW, CODE, t, CS, CLH, times=times, aktiv=aktiv))
    return z, cam

def notiz(f, t, tin, tout, txt, fill, col, y=NY):
    E(f, t, tin, lambda d, dy: tag(d, CX, y + dy, CW, 62, txt, fill, col, 30, 700, outl=col), tout=tout)

def markierung(f, t, tin, tout, fn):
    """Markierung im Code (ohne Verschieben, damit sie genau auf dem Zeichen sitzt)."""
    f.el(show(t, tin, tout), lambda d, dy: fn(d))

def raute_bild(d, cx, cy, w, h, txt, size):
    pts = [(cx - w / 2, cy), (cx, cy - h / 2), (cx + w / 2, cy), (cx, cy + h / 2)]
    d.polygon(pts, fill=LIGHTR); d.line(pts + [pts[0]], fill=RED, width=3, joint="curve")
    T2(d, cx, cy, txt, F(size, 700), DARK, "mm")

def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Vom Plan zum Code")
    t_flug = a(1, 0.05); t_if = t_flug + 1.0
    times = [-1, -1, t_if, a(2, 0.25), a(3, 0.15), a(4, 0.3), 1e9]
    aktiv = aktuell(t, [(a(0, 0.0), {1}), (t_if, {2}), (a(2, 0.0), {3}), (a(3, 0.0), {4}), (a(4, 0.0), {5})])
    keys = aktuell(t, [(a(0, 0.0), {"e"}), (a(1, 0.0), {"d"}), (a(2, 0.0), {"d-ja", "j"}), (a(3, 0.0), {"d-nein"}), (a(4, 0.0), {"d-nein", "n"})])
    z, cam = plan_und_code(f, t, times, aktiv, keys)
    # die Raute wandert nach rechts und wird Zeile 3
    x0, y0, x1, y1 = plan_kasten(PBOX3, z, cam, PLAN.nodes["d"])
    p0 = ((x0 + x1) / 2, (y0 + y1) / 2); rw, rh = x1 - x0, y1 - y0
    p1 = (GEO.cx(0) + rw / 2 - 10, GEO.zmitte(2))
    if t_flug <= t < t_if + 0.5:
        x, y = bahn(t, t_flug, 0.9, p0, p1)
        f.el(ap(t, t_flug, 0.15) * (1 - ap(t, t_if - 0.1, 0.5)), lambda d, dy: raute_bild(d, x, y, rw, rh, "alter >= 16?", max(17, int(PLAN.fs * z))))
    # Markierungen im Code, je Satz
    markierung(f, t, a(0, 0.35), a(1, 0.0) - 0.2, lambda d: code_markiere(d, GEO, 1, *spalte(CODE[1], "int")))
    markierung(f, t, a(1, 0.78), a(2, 0.0) - 0.1, lambda d: code_markiere(d, GEO, 2, *spalte(CODE[2], ":", True)))
    markierung(f, t, a(2, 0.45), a(3, 0.0) - 0.1, lambda d: code_einrueckung(d, GEO, 3))
    markierung(f, t, a(3, 0.45), a(4, 0.0) - 0.1, lambda d: code_fluchtlinie(d, GEO, 2, 4))
    markierung(f, t, a(4, 0.45), None, lambda d: code_einrueckung(d, GEO, 5))
    notiz(f, t, a(0, 0.35), a(1, 0.0) - 0.2, "Das Alter ist eine ganze Zahl: int", LIGHTB, BLUE)
    notiz(f, t, a(1, 0.3), a(2, 0.0) - 0.2, "if, dann die Bedingung, dann ein Doppelpunkt", LIGHTR, RED)
    notiz(f, t, a(2, 0.3), a(3, 0.0) - 0.2, "ja-Weg: eingerückt unter if", LIGHTA, AMB)
    notiz(f, t, a(3, 0.3), a(4, 0.0) - 0.2, "else: auf derselben Höhe wie if", LIGHTR, RED)
    notiz(f, t, a(4, 0.3), None, "nein-Weg: eingerückt unter else", LIGHTA, AMB)


def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Die letzte Zeile: wieder ganz links")
    t7 = a(0, 0.1)
    times = [-1] * 6 + [t7]
    aktiv = {6} if t >= t7 else None
    keys = aktuell(t, [(a(0, 0.0), {"o"}), (a(1, 0.0), set(ZUSAMMEN) | {"o"}), (a(2, 0.0), set(ZUSAMMEN) | {"o", "d-o"})])
    z, cam = plan_und_code(f, t, times, aktiv, keys)
    markierung(f, t, a(0, 0.45), None, lambda d: code_fluchtlinie(d, GEO, 2, 6))
    xm, ym = plan_xy(PBOX3, z, cam, *PLAN.merge["d"])
    E(f, t, a(1, 0.1), lambda d, dy: d.ellipse((xm - 9, ym - 9 + dy, xm + 9, ym + 9 + dy), outline=RED, width=4))
    notiz(f, t, a(0, 0.35), None, "nicht eingerückt: gehört zu keinem Weg", LIGHTK, DARK)
    notiz(f, t, a(1, 0.2), None, "Hier laufen die Wege zusammen", LIGHTR, RED, NY + 78)
    fb = F(32, 700); txt = "läuft in beiden Fällen"; bw = 40 + 14 + fb.getlength(txt); xb = 274 - bw / 2   # unter dem Plan
    E(f, t, a(2, 0.2), lambda d, dy: (check_circle(d, xb + 20, 606 + dy, 20),
                                       TB(d, xb + 54, 606 + dy, txt, fb, GREEN, 480, "lm")))


# ---------------------------------------------------------------- 5 Probe mit dem Grenzfall 16, dann Jetzt du
PBOX5 = (24, 104, 500, 412)
C5X, C5Y, C5W, C5S, C5LH = 560, 104, 660, 22, 36

def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Probe mit dem Grenzfall 16")
    t_weg = a(4, 0.0) - 0.15                                 # Programmlauf blendet aus, Jetzt du blendet ein
    raus = 1 - ap(t, t_weg, 0.35)
    if raus > 0.004:
        bis_j = W16[:W16.index("j") + 1]
        keys = aktuell(t, [(a(0, 0.0), ["e"]), (a(1, 0.0), ["d"]), (a(2, 0.0), bis_j), (a(3, 0.0), W16)])
        vis = weg_vis(W16, 0.3, show(t, a(2, 0.0))) if t >= a(2, 0.0) else None
        plan_draw(f, ap(t, 0.0, 0.3) * raus, PLAN, PBOX5, vis=vis, hl=weg_hl(keys or []), maxzoom=1.4)
        aktiv = aktuell(t, [(a(0, 0.0), {1}), (a(1, 0.0), {2}), (a(2, 0.2), {2, 3}), (a(3, 0.6), {2, 3, 6})])
        grau = {4, 5} if t >= a(2, 0.2) else None
        f.el(ap(t, 0.0, 0.3) * raus, lambda d, dy: code_lauf(d, C5X, C5Y, C5W, CODE, t, C5S, C5LH, aktiv=aktiv, grau=grau))
        ly = C5Y + code_h(len(CODE), C5LH) + 20
        frage = LAUF[0][:-len("16")]
        zeilen = [(a(0, 0.15), frage, a(0, 0.55), "16"), (a(3, 0.25), LAUF[1], None, None, CODE_G), (a(3, 0.6), LAUF[2], None, None, CODE_G)]
        f.el(show(t, 0.3) * raus, lambda d, dy: lauf_panel(d, C5X, ly, C5W, zeilen, t, 26, 42))
        # links unter dem Plan: der Vergleich mit dem Grenzfall
        # (wie vergleich_zeile aus b02, aber mit Ausblenden; Ergebnis oben nachgerechnet: 16 >= 16 ist wahr)
        bw, bh = vergleich_mass("16", ">=", "16", 44); ch = int(bh * 0.78); vy = 546
        f.el(show(t, a(1, 0.0)) * raus, lambda d, dy: vergleich(d, 60, vy + dy, "16", ">=", "16", 44), dy=dyf(t, a(1, 0.0)))
        f.el(show(t, a(1, 0.45)) * raus, lambda d, dy: (pfeil(d, 60 + bw + 16, vy + bh / 2 + dy, 60 + bw + 74, vy + bh / 2 + dy, GREY, 6, 18),
                                                         wert_chip(d, 60 + bw + 88, vy + (bh - ch) / 2 + dy, "wahr", ch)), dy=dyf(t, a(1, 0.45)))
    # Jetzt du
    E(f, t, a(4, 0.05), lambda d, dy: tag(d, 60, 126 + dy, 1160, 72, "Jetzt du: Probier 15 und 17", RED, WHITE, 38))
    E(f, t, a(4, 0.3), lambda d, dy: wertereihe(d, 60, 228 + dy, 1160, [("15", "probier selbst", GREY), ("16", "Einlass", GREEN),
                                                                        ("17", "probier selbst", GREY)], h=140, size=60))
    bw, bh = vergleich_mass("16", ">", "16", 64)
    qw = 110; gesamt = bw + 20 + 64 + 20 + qw; x0 = 640 - gesamt / 2; yv = 418
    def frage_bild(d, dy):
        vergleich(d, x0, yv + dy, "16", ">", "16", 64, op_col=RED)
        pfeil(d, x0 + bw + 20, yv + bh / 2 + dy, x0 + bw + 84, yv + bh / 2 + dy, GREY, 6, 18)
        xq = x0 + bw + 104
        d.rounded_rectangle((xq, yv + 12 + dy, xq + qw, yv + bh - 12 + dy), (bh - 24) // 2, fill=LIGHTK, outline=GREY, width=3)
        T2(d, xq + qw / 2, yv + bh / 2 + dy, "?", F(56, 700), GREY, "mm")
    E(f, t, a(5, 0.1), frage_bild)
    E(f, t, a(5, 0.3), lambda d, dy: TB(d, 640, yv + bh + 50 + dy, "Was passiert bei 16 mit > statt >= ?", F(36, 700), DARK, 1160, "mm"))


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == 5 == len(SCENES)


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 02 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vorgerechnet:", F(84, 700), DARK)
        T2(d, 90, 256, "Einlass ab 16", F(84, 700), DARK)
        T2(d, 90, 384, "Vom Plan zum Programm", F(40, 400), GREY)
        tag(d, 90, 450, 520, 66, "Erst der Plan, dann der Code", RED, WHITE, 34)
        code_n(d, 90, 540, 600, CODE[2:4], [3, 4], [-1] * 2, 0, 24, 40)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn)
    plan_draw(f, 1.0, PLAN, (712, 90, 520, 560), hl={k: RED for k in ("d", "d-ja", "j")}, maxzoom=1.4)
    f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
