"""Termin 01, Video 2: Python-Werkzeugkasten (print, Variablen als Schachteln, rechnen und merken, a/b kopieren, input mit float/int, NameError).
Aufruf: python render.py [text|probe [Ordner]|zeiten|scan|stills t1 t2..|full|mux]   (Vertonung vorher: python ../v01-common/tts_run.py v01-python)
Nur Python aus Termin 01: print, Variablen, + - * /, input, int(), float(). Alle gezeigten Ausgaben stammen aus einem echten Lauf (run)."""
import os, sys, io, contextlib, traceback
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
from bausteine import *
from texte import SRC

NAME = "v01-python"; LABEL = "DHBW · Informatik · Termin 01 · Python-Werkzeugkasten"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}
NL = chr(10)

# ---------------------------------------------------------------- Code der Szenen (wie auf der Seite) und nachgerechnete Ausgaben
CODE2 = ['print("Hallo")', 'print("Kilometer:", 148)']
OUT2 = run(NL.join(CODE2)); assert OUT2 == ["Hallo", "Kilometer: 148"]
CODE3 = ["strecke = 18.5", "tage = 4"]
CODE4 = CODE3 + ["woche = strecke * 2 * tage"]
_g = {}; exec(NL.join(CODE4), _g); WOCHE = str(_g["woche"]); assert WOCHE == "148.0" and _g["woche"] == 18.5 * 2 * 4
CODE5 = ["a = 5", "b = a", "a = a + 1"]
_g = {}; exec(NL.join(CODE5), _g); assert (_g["a"], _g["b"]) == (6, 5)
CODE6 = ['strecke = float(input("Einfache Strecke in km: "))', 'tage = int(input("Tage pro Woche: "))']
_it = iter(["18.5", "4"]); _g = {"input": lambda p="": next(_it)}; exec(NL.join(CODE6), _g)
assert _g["strecke"] == 18.5 and _g["tage"] == 4 and float("18.5") == 18.5 and int("4") == 4
CODE7 = ["betrag = 40", "gesamt = betrag + 4", 'print("Trinkgeld:", 4)', 'print("Zu zahlen:", gesammt)']

def _fehlerlauf(code):
    """Ausgabe wie auf der Seite: Ausgaben bis zum Fehler, dann die Meldung ab der Zeile im eigenen Programm."""
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf): exec(compile(NL.join(code), "<exec>", "exec"), {})
    except Exception as e:
        tb = "".join(traceback.format_exception(e)).splitlines()
        i = next(k for k, z in enumerate(tb) if 'File "<exec>"' in z)
        return buf.getvalue().splitlines() + ["Traceback (most recent call last):"] + tb[i:]
    raise AssertionError("kein Fehler")
MELDUNG = _fehlerlauf(CODE7)
assert MELDUNG[0] == "Trinkgeld: 4" and len(MELDUNG) == 4, MELDUNG
assert MELDUNG[2] == '  File "<exec>", line 4, in <module>' and MELDUNG[3].startswith("NameError: name 'gesammt' is not defined"), MELDUNG

# ---------------------------------------------------------------- 1 Vier Werkzeuge
WERKZEUGE = [("ausgeben", "print(...)"), ("merken", "name = wert"), ("rechnen", "+  -  *  /"), ("einlesen", "input(...)")]

def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf(f, t, "Vier Werkzeuge für dein erstes Programm")
    for k, ((wort, code), fr) in enumerate(zip(WERKZEUGE, (0.56, 0.68, 0.78, 0.9))):
        def kachel(d, dy, k=k, wort=wort, code=code):
            x = 60 + k * 296
            card(d, x, 130 + dy, 272, 200, stripe=False)
            d.rounded_rectangle((x, 130 + dy, x + 272, 140 + dy), 5, fill=RED)
            num_circle(d, x + 40, 184 + dy, 20, k + 1, RED)
            TB(d, x + 72, 184 + dy, wort, F(38, 700), DARK, 190, "lm")
            d.rounded_rectangle((x + 20, 240 + dy, x + 252, 304 + dy), 10, fill=BOX)
            TB(d, x + 136, 272 + dy, code, M(26), CODE_T, 216, "mm")
        E(f, t, a(0, fr), kachel)
    # Symbol im Plan -> Zeile in Python
    t1 = a(1, 0.0)
    symbol(f, show(t, t1 + 0.1), "io", "Ausgabe: woche", (150, 430, 400, 130), bg=BG, maxzoom=1.6)
    def paar(d, dy):
        TB(d, 350, 400 + dy, "Symbol im Plan", F(28, 700), GREY, 400, "mm")
        TB(d, 930, 400 + dy, "Zeile in Python", F(28, 700), GREY, 400, "mm")
    E(f, t, t1, paar)
    E(f, t, a(1, 0.45), lambda d, dy: pfeil(d, 580, 495 + dy, 690, 495 + dy, RED, 7, 22))
    E(f, t, a(1, 0.55), lambda d, dy: monobox(d, 720, 455 + dy, 420, 80, "print(woche)", 36))
    E(f, t, a(1, 0.7), lambda d, dy: TB(d, 640, 610 + dy, "Jedes Symbol im Plan wird eine Zeile in Python.", F(32, 700), DARK, 1100, "mm"))

# ---------------------------------------------------------------- 2 print
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "print: etwas ausgeben")
    hl = aktuell(t, [(0, {0}), (a(1, 0.0), {1}), (a(3, 0.0), None)])
    cpanel(f, t, CODE2, 60, 124, 640, 32, 52, hl, [a(0, 0.0) + 0.3, a(1, 0.0) + 0.2])
    y = 124 + code_h(2, 52) + 18; t_out2 = a(1, 0.78)
    zeilen = [(a(0, 0.62), OUT2[0], None, None), (t_out2, OUT2[1], None, None)]
    def ausgabe(d, dy):
        h = lauf_panel(d, 60, y + dy, 640, zeilen, t, 32, 50, "Ausgabe", hl={0, 1} if t >= a(3, 0.3) else None)
        return h
    E(f, t, a(0, 0.55), ausgabe)
    # Leerzeichen zwischen den beiden Teilen markieren
    def leer(d, dy):
        fm = M(32); x0 = 60 + 22 + fm.getlength("Kilometer:"); cw = fm.getlength(" "); yy = y + 46 + 50
        d.rounded_rectangle((x0 + 1, yy - 4 + dy, x0 + cw - 1, yy + 36 + dy), 4, outline=CODE_R, width=3)
    f.el(show(t, a(2, 0.55), a(3, 0.0)), leer)
    kacheln = [(a(1, 0.0), 'Text: in Anführungszeichen', 'zum Beispiel "Hallo" und "Kilometer:"', GREEN),
               (a(1, 0.6), "Zahlen: ohne", "zum Beispiel 148", AMB),
               (a(2, 0.0), "Komma trennt mehrere Dinge", "print setzt ein Leerzeichen dazwischen", BLUE),
               (a(3, 0.0), "Jedes print: eine neue Zeile", "zwei print, zwei Zeilen", RED)]
    for k, (tin, gross, klein, col) in enumerate(kacheln):
        fit(gross, F(28, 700), 480 - 50, "Kachel")
        tile(f, t, tin, 740, 124 + k * 112, 480, 98, gross, klein, col)

# ---------------------------------------------------------------- 3 Variablen als Schachteln
def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Variable: ein Name für einen Wert")
    cpanel(f, t, CODE3, 60, 124, 520, 32, 52, None, [a(0, 0.0) + 0.3, a(0, 0.3)])
    E(f, t, a(0, 0.55), lambda d, dy: schachtel(d, 690, 136 + dy, 220, 150, "strecke", "18.5", BLUE))
    E(f, t, a(0, 0.78), lambda d, dy: schachtel(d, 970, 136 + dy, 220, 150, "tage", "4", AMB))
    # grosses Beispiel: links der Name, rechts der Wert
    fm = M(48, True); cw = fm.getlength("x"); bsp = "strecke = 18.5"; x0 = 60 + (520 - cw * len(bsp)) / 2; yb = 334
    def beispiel(d, dy):
        card(d, 60, yb + dy, 520, 170, stripe=False)
        TB(d, x0, yb + 26 + dy, bsp, fm, DARK, 480)
    E(f, t, a(1, 0.0), beispiel)
    def klammer(d, dy, i0, i1, txt, col):
        xa, xb = x0 + cw * i0, x0 + cw * i1; yy = yb + 86 + dy
        d.line((xa, yy, xa, yy + 10, xb, yy + 10, xb, yy), fill=col, width=4, joint="curve")
        TB(d, (xa + xb) / 2, yy + 20, txt, F(30, 700), col, 200, "ma")
    E(f, t, a(1, 0.1), lambda d, dy: klammer(d, dy, 0, 7, "Name", BLUE))
    E(f, t, a(1, 0.55), lambda d, dy: klammer(d, dy, 10, 14, "Wert", AMB))
    def punkt(d, dy):
        cx = x0 + cw * 12.5; cy = yb + 26 + 40 + dy
        d.ellipse((cx - 15, cy - 15, cx + 15, cy + 15), outline=RED, width=4)
    E(f, t, a(2, 0.4), punkt)
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 640, 350 + dy, 580, 64, "Kommazahl mit Punkt: 18.5", LIGHTR, RED, 32, 700, outl=RED))
    E(f, t, a(2, 0.5), lambda d, dy: TB(d, 930, 448 + dy, "nicht 18,5", F(30, 600), GREY, 560, "mm"))
    # Namen
    E(f, t, a(3, 0.0), lambda d, dy: TB(d, 60, 584 + dy, "Namen:", F(34, 700), DARK, 150, "lm"))
    teile = [("Kleinbuchstaben", 210, 280, a(3, 0.3)), ("Ziffern", 510, 170, a(3, 0.6)), ("Unterstrich", 700, 220, a(3, 0.78))]
    for txt, x, w, tin in teile:
        E(f, t, tin, lambda d, dy, txt=txt, x=x, w=w: chip(d, x, 554 + dy, w, 60, txt, LIGHTK, DARK, 30))
    E(f, t, a(3, 0.9), lambda d, dy: monobox(d, 960, 554 + dy, 260, 60, "strecke_km", 30))

# ---------------------------------------------------------------- 4 Rechnen und merken
OPS = [("+", "plus"), ("-", "minus"), ("*", "mal"), ("/", "geteilt")]

def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Rechnen und das Ergebnis merken")
    for k, ((z, wort), fr) in enumerate(zip(OPS, (0.22, 0.38, 0.52, 0.8))):
        def op(d, dy, k=k, z=z, wort=wort):
            x = 60 + k * 296
            d.rounded_rectangle((x, 120 + dy, x + 272, 186 + dy), 12, fill=WHITE, outline=LINE, width=2)
            d.rounded_rectangle((x + 10, 128 + dy, x + 70, 178 + dy), 8, fill=BOX)
            T2(d, x + 40, 153 + dy, z, M(36, True), CODE_T, "mm")
            TB(d, x + 90, 153 + dy, wort, F(32, 700), DARK, 170, "lm")
        E(f, t, a(0, fr), op)
    t1 = a(1, 0.0)
    cpanel(f, t, CODE4, 60, 206, 560, 26, 42, {2}, None, alpha_t=a(0, 0.92))
    # rechte Seite ausrechnen
    cx0, cy0, cw_, ch_ = 650, 206, 570, code_h(3, 42)
    fm = M(34, True); cw = fm.getlength("x"); rhs = "strecke * 2 * tage"; rx = cx0 + 30
    fv = M(34, True); erg = "= " + WOCHE
    assert rx + fv.getlength("18.5 · 2 · 4 " + erg) <= cx0 + cw_ - 14 and rx + cw * len(rhs) <= cx0 + cw_ - 14, "Rechnung passt nicht in die Karte"
    def karte(d, dy):
        card(d, cx0, cy0 + dy, cw_, ch_, stripe=False)
        num_circle(d, cx0 + 40, cy0 + 34 + dy, 18, 1, RED)
        TB(d, cx0 + 70, cy0 + 34 + dy, "erst: rechte Seite ausrechnen", F(27, 700), DARK, cw_ - 90, "lm")
        TB(d, rx, cy0 + 70 + dy, rhs, fm, DARK, cw_ - 40)
    E(f, t, a(1, 0.22), karte)
    werte = "18.5 · 2 · 4"; ex = rx + fv.getlength(werte + " ")
    E(f, t, a(1, 0.34), lambda d, dy: T2(d, rx, cy0 + 150 + dy, werte, fv, AMB, "lm"))
    E(f, t, a(1, 0.5), lambda d, dy: T2(d, ex, cy0 + 150 + dy, erg, fv, GREEN, "lm"))
    # Ergebnis nach links in die Schachtel
    px = ex + fv.getlength(erg) / 2; ty = a(1, 0.62)
    def weg(d, dy):
        d.line((px, cy0 + 176, px, 536, 420, 536), fill=GREEN, width=6, joint="curve")
        pfeil(d, 440, 536, 396, 536, GREEN, 6, 20)
        num_circle(d, 438, 492 + dy, 18, 2, RED)
        TB(d, 466, 492 + dy, "dann: Ergebnis kommt in die Variable links", F(26, 700), DARK, px - 466 - 14, "lm")
    E(f, t, ty, weg)
    E(f, t, a(1, 0.55), lambda d, dy: schachtel(d, 110, 444 + dy, 260, 160, "woche", WOCHE if t >= a(1, 0.8) else None, BLUE, GREEN))
    E(f, t, a(2, 0.3), lambda d, dy: tag(d, 440, 576 + dy, 780, 72, "= ist ein Auftrag, keine Gleichung", RED, WHITE, 38))
    def rahmen(d, dy):
        d.rounded_rectangle((rx - 14, cy0 + 122, ex + fv.getlength(erg) + 14, cy0 + 180), 10, outline=GREEN, width=4)
    f.el(show(t, a(3, 0.0)), rahmen)

# ---------------------------------------------------------------- 5 a und b: kopieren
def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf(f, t, "Ein Beispiel, das oft überrascht")
    t_a5, t_b5, t_a6 = a(1, 0.12), a(1, 0.62), a(2, 0.5)
    hl = aktuell(t, [(a(1, 0.0), {0}), (a(1, 0.3), {1}), (a(2, 0.0), {2}), (a(3, 0.0), None)])
    cpanel(f, t, CODE5, 60, 140, 480, 38, 60, hl, [a(1, 0.0) + 0.1, a(1, 0.3), a(2, 0.0) + 0.2])
    wa = None if t < t_a5 else ("5" if t < t_a6 else "6"); wb = None if t < t_b5 else "5"
    rot_a = t_a6 <= t < a(3, 0.0)
    E(f, t, 0.5, lambda d, dy: schachtel(d, 640, 150 + dy, 230, 180, "a", wa, BLUE, RED if rot_a else DARK, 64))
    E(f, t, 0.8, lambda d, dy: schachtel(d, 970, 150 + dy, 230, 180, "b", wb, AMB, GREEN if t >= a(3, 0.15) else DARK, 64))
    def kopie(d, dy):
        pfeil(d, 890, 262 + dy, 952, 262 + dy, GREY, 6, 18)
        TB(d, 920, 226 + dy, "Kopie", F(24, 700), GREY, 90, "mm")
    f.el(show(t, a(1, 0.45), a(2, 0.0)), kopie)
    E(f, t, t_a6, lambda d, dy: tag(d, 640, 372 + dy, 230, 52, "5 + 1 = 6", LIGHTR, RED, 28, 700, outl=RED))
    E(f, t, a(3, 0.15), lambda d, dy: tag(d, 970, 372 + dy, 230, 52, "bleibt 5", LIGHTG, GREEN, 28, 700, outl=GREEN))
    E(f, t, a(3, 0.45), lambda d, dy: tag(d, 60, 500 + dy, 1160, 84, "Nach dem Kopieren sind die Schachteln unabhängig", GREEN, WHITE, 40))

# ---------------------------------------------------------------- 6 input, float, int
def sc6(f, t, ct):
    a = lambda k, fr=0.0: AT[6](ct, k, fr)
    kopf(f, t, "input: einen Wert einlesen")
    t_z2 = a(2, 0.55)
    hl = aktuell(t, [(0, {0}), (t_z2, {1}), (a(3, 0.0), None)])
    cpanel(f, t, CODE6, 60, 120, 1160, 28, 46, hl, [a(0, 0.0) + 0.2, a(0, 0.0) + 1.3])
    y = 120 + code_h(2, 46) + 18
    zeilen = [(a(0, 0.5), "Einfache Strecke in km: ", a(1, 0.0) - 0.5, "18.5"), (t_z2, "Tage pro Woche: ", a(2, 0.72), "4")]
    E(f, t, a(0, 0.45), lambda d, dy: lauf_panel(d, 60, y + dy, 620, zeilen, t, 26, 44))
    E(f, t, a(0, 0.6), lambda d, dy: TB(d, 370, y + lauf_h(2, 44) + 14 + dy, "Das Programm zeigt die Frage und wartet.", F(24, 600), GREY, 620, "ma"), tout=a(1, 0.0) - 0.4)
    fit("input liefert immer Text", F(28, 700), 500 - 50, "Kachel")
    tile(f, t, a(1, 0.0), 720, y, 500, 98, "input liefert immer Text", 'getippt: 18.5   im Programm: "18.5"', RED)
    def wandeln(d, dy, yy, code, wert, sorte, col, fill):
        monobox(d, 720, yy + dy, 204, 60, code, 24)
        pfeil(d, 932, yy + 30 + dy, 978, yy + 30 + dy, GREY, 5, 16)
        chip(d, 988, yy + dy, 84, 60, wert, fill, col, 28, mono=True)
        TB(d, 1084, yy + 30 + dy, sorte, F(24, 700), col, 136, "lm")
    E(f, t, a(2, 0.3), lambda d, dy: wandeln(d, dy, y + 116, 'float("18.5")', "18.5", "Kommazahl", BLUE, LIGHTB))
    E(f, t, a(2, 0.78), lambda d, dy: wandeln(d, dy, y + 190, 'int("4")', "4", "ganze Zahl", AMB, LIGHTA))
    E(f, t, a(3, 0.35), lambda d, dy: tag(d, 60, 580 + dy, 1160, 76, "Fester Baustein: Zahl einlesen", RED, WHITE, 40))

# ---------------------------------------------------------------- 7 Fehlermeldung lesen
def sc7(f, t, ct):
    a = lambda k, fr=0.0: AT[7](ct, k, fr)
    kopf(f, t, "Wenn etwas schiefgeht: die Fehlermeldung")
    t_m = a(0, 0.42)
    cpanel(f, t, CODE7, 60, 116, 600, 26, 40, {3} if t >= a(0, 0.6) else None)
    def tippfehler(d, dy):
        fm = M(26); xa = 60 + code_off(26) + fm.getlength('print("Zu zahlen:", '); xb = xa + fm.getlength("gesammt"); yy = 116 + 50 + 3 * 40 + 30
        d.line((xa, yy, xb, yy), fill=CODE_R, width=4)
    f.el(show(t, a(2, 0.0)), tippfehler)
    E(f, t, a(0, 0.6), lambda d, dy: tag(d, 700, 124 + dy, 520, 60, "Fehler mit Zeilennummer: Zeile 4", LIGHTA, AMB, 28, 700, outl=AMB))
    E(f, t, a(1, 0.0), lambda d, dy: tag(d, 700, 204 + dy, 520, 60, "Zuerst lesen: die letzte Zeile", LIGHTK, DARK, 28, 700, outl=GREY))
    E(f, t, a(2, 0.0), lambda d, dy: tag(d, 700, 284 + dy, 520, 60, "NameError: Name falsch geschrieben", LIGHTR, RED, 27, 700, outl=RED))
    y = 116 + code_h(4, 40) + 18
    z3 = [('  File "<exec>", ', CODE_T), ("line 4", CODE_N), (", in <module>", CODE_T)]
    zeilen = [(0.6, MELDUNG[0], None, None), (t_m, MELDUNG[1], None, None, CODE_C), (t_m, z3, None, None), (t_m, MELDUNG[3], None, None, CODE_R)]
    assert "".join(s for s, _ in z3) == MELDUNG[2]
    E(f, t, 0.4, lambda d, dy: lauf_panel(d, 60, y + dy, 1160, zeilen, t, 25, 38, "Ausgabe", hl={3} if t >= a(1, 0.0) else None))
    E(f, t, a(3, 0.3), lambda d, dy: tag(d, 60, 590 + dy, 1160, 70, "Jetzt du: die vier Karten im Werkzeugkasten", RED, WHITE, 38))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6, 7: sc7}
assert len(SRC) == 7 == len(SCENES)

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 01 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Python-", F(84, 700), DARK)
        T2(d, 90, 256, "Werkzeugkasten", F(84, 700), DARK)
        T2(d, 90, 384, "print, Variablen, rechnen, einlesen", F(40, 400), GREY)
        for k, (wort, _) in enumerate(WERKZEUGE):
            chip(d, 90 + k * 186, 500, 170, 64, wort, LIGHTR, RED, 30)
        code_n(d, 830, 150, 390, CODE4, [1, 2, 3], [-1] * 3, 0, 21, 36)
        schachtel(d, 930, 440, 220, 150, "woche", WOCHE, BLUE, GREEN)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
