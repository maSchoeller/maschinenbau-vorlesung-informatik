"""Termin 02, Video 2: Python-Werkzeugkasten (Karte 1 vergleichen, Karte 2 if und else, Karte 3 f-String, zwei typische Fehler).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator.
Code wie auf den Syntaxkarten in app/inhalte/v02/labor.mdx; alle gezeigten Ausgaben stammen aus einem echten Lauf (run)."""
import os, sys, traceback
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
import h01, core as _core
from texte import SRC

NAME = "v02-python"; LABEL = "DHBW · Informatik · Termin 02 · Python-Werkzeugkasten"

# ---------------------------------------------------------------- Satzgrenzen von Hand (Sekunden im Ton)
# In s1, s3 und s4 findet die Pausenerkennung nicht alle Satzgrenzen (s3: zwischen Satz 2 und 3 keine Pause ab 0,12 s;
# s1: "Die Antwort ist True." haengt am Satz davor). Die Grenzen unten stammen aus silencedetect (-32 dB, 0,07 s)
# und den Satzlaengen. Sie gelten nur fuer genau diesen Ton (Dauer geprueft); ein neuer Ton faellt auf die Erkennung zurueck.
_HAND = {1: (32.16, [(0.05, 4.95), (5.84, 13.30), (14.28, 19.45), (20.88, 26.56), (27.55, 32.11)]),
         3: (26.08, [(0.05, 4.87), (5.67, 7.32), (7.60, 15.25), (15.68, 23.38), (23.86, 26.03)]),
         4: (32.16, [(0.05, 8.99), (9.28, 13.35), (13.71, 19.07), (19.54, 27.37), (27.87, 32.11)])}
for _i, (_d, _ch) in _HAND.items():
    _p = os.path.join(HERE, "audio", f"s{_i}.mp3")
    if os.path.exists(_p) and abs(_core.dur(_p) - _d) < 0.03: h01.MANUAL[_i] = _ch

SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Code der Szenen (wie auf den Syntaxkarten) und nachgerechnete Ausgaben
CODE1 = ["punkte = 48", "print(punkte >= 50)", "print(punkte == 48)"]
OUT1 = run(NL.join(CODE1)); assert OUT1 == ["False", "True"]
assert (48 >= 50) is False and (48 == 48) is True

CODE2 = ["punkte = 48", "if punkte >= 50:", '    print("Bestanden")', "else:", '    print("Nicht bestanden")']
CODE2_60 = ["punkte = 60"] + CODE2[1:]
OUT48 = run(NL.join(CODE2)); assert OUT48 == ["Nicht bestanden"]
OUT60 = run(NL.join(CODE2_60)); assert OUT60 == ["Bestanden"]
assert (60 >= 50) is True

CODE4 = ["preis = 9.5", 'print(f"Ticket: {preis:.2f} Euro")']
OUT4 = run(NL.join(CODE4)); assert OUT4 == ["Ticket: 9.50 Euro"]

FEHLER1 = ["punkte = 48", "if punkte >= 50", '    print("Bestanden")']
def _syntaxfehler(code):
    try: compile(NL.join(code), "<exec>", "exec")
    except SyntaxError as e: return "".join(traceback.format_exception_only(e)).rstrip(NL).split(NL)
    raise AssertionError("kein SyntaxError")
MELDUNG1 = _syntaxfehler(FEHLER1)
assert MELDUNG1 == ['  File "<exec>", line 2', "    if punkte >= 50", "                   ^", "SyntaxError: expected ':'"], MELDUNG1
FEHLER2 = ["preis = 9.5", 'print("Ticket: {preis:.2f} Euro")']
OUT_F2 = run(NL.join(FEHLER2)); assert OUT_F2 == ["Ticket: {preis:.2f} Euro"]

# Die drei Karten (Titel wie auf der Seite)
KARTEN = [("Vergleichen", "punkte >= 50", "wahr oder falsch"),
          ("if und else", "if punkte >= 50:", "einer von zwei Wegen"),
          ("f-String", 'f"{preis:.2f}"', "zwei Nachkommastellen")]


# ---------------------------------------------------------------- eigene Hilfen (in b02 nicht vorhanden)
def kopf2(f, t, stufen):
    """Kopfzeile wie kopf/heading, deren Text wechselt: stufen = [(ab, text), ...]; der alte Text blendet vor dem neuen aus."""
    tin0 = 0.2
    f.el(ap(t, tin0, 0.5), lambda d, dy: d.rounded_rectangle((60, 44 + dy, 68, 92 + dy), 4, fill=RED), dy=int((1 - ap(t, tin0, 0.5)) * 10))
    for k, (ab, txt) in enumerate(stufen):
        assert F(40, 700).getlength(txt) <= 1120, f"Ueberschrift zu lang: {txt}"
        tin = tin0 if k == 0 else ab
        nxt = stufen[k + 1][0] if k + 1 < len(stufen) else None
        a = ap(t, tin, 0.5) * (1 - (ap(t, nxt - 0.4, 0.35) if nxt is not None else 0))
        f.el(a, lambda d, dy, txt=txt: T(d, 86, 42 + dy, txt, F(40, 700), DARK), dy=int((1 - ap(t, tin, 0.5)) * 10))


def drei_karten(f, t, tin, y, tout=None, fokus=None, t_fokus=None):
    """Die drei Karten des Werkzeugkastens nebeneinander; fokus: Index der Karte, die voll bleibt (die anderen werden blass)."""
    for k, (titel, code, unter) in enumerate(KARTEN):
        x = 60 + k * 400; t0 = tin + 0.15 * k
        blass = 1.0
        if fokus is not None and k != fokus: blass = lerp(1.0, 0.35, ap(t, t_fokus, 0.4))
        f.el(show(t, t0, tout) * blass, lambda d, dy, x=x, k=k, titel=titel, code=code, unter=unter:
             werkzeugkarte(d, x, y + dy, 360, 230, k + 1, titel, code, unter), dy=dyf(t, t0))


def getippt(full, stufen, t, cps=55):
    """Zeile, die in Stufen getippt wird: stufen = [(ab, bis_zeichen), ...]. Gibt den sichtbaren Anfang der Zeile zurueck."""
    n = 0
    for ab, bis in stufen:
        if t < ab: break
        n = min(bis, n + int((t - ab) * cps) + 1)
    return full[:n]


def zeilen_code(d, x, y, w, zeilen, t, size, lh, aktiv=None, grau=None):
    """code_lauf mit Zeilen, die schon (teilweise) sichtbar sind; leere Zeilen bekommen noch keine Zeilennummer."""
    times = [-1 if z else 1e9 for z in zeilen]
    return code_lauf(d, x, y, w, zeilen, t, size, lh, times=times, aktiv=aktiv, grau=grau)


LINEC = (52, 58, 68)

def plan_mit_ausgang(f, a, hl, vis=None):
    """PLAN zeichnen und unter dem Zusammenfuehrungspunkt einen kurzen Pfeil anhaengen: das Programm geht danach weiter."""
    z, cam = plan_draw(f, a, PLAN, PBOX, vis=vis, hl=hl, maxzoom=1.3)
    mx, my = plan_xy(PBOX, z, cam, *PLAN.merge["d"])
    rot = any(k in hl for k in zusammen(PLAN, "d"))
    f.el(a, lambda d, dy: pfeil(d, mx, my, mx, my + 26, RED if rot else LINEC, 5 if rot else 3, 12))


def caret(d, x, y, col=RED, s=14):
    """Kleines Dreieck, das nach oben auf eine Stelle im Code zeigt (hier fehlt etwas)."""
    d.polygon([(x, y), (x - s * 0.7, y + s), (x + s * 0.7, y + s)], fill=col)


def zeichen_karte(d, x, y, w, h, zeichen, text, col, fill):
    """Karte mit einem Zeichen im Code-Kasten links und dem Satz rechts (z.B. '==' fragt)."""
    imbild(y, y + h, "Zeichen-Karte")
    d.rounded_rectangle((x, y, x + w, y + h), 16, fill=fill, outline=col, width=3)
    bw = 130
    d.rounded_rectangle((x + 16, y + 14, x + 16 + bw, y + h - 14), 10, fill=BOX)
    TB(d, x + 16 + bw / 2, y + h / 2, zeichen, M(46, True), CODE_T, bw - 16, "mm", "Zeichen")
    TB(d, x + 16 + bw + 26, y + h / 2, text, F(36, 700), col, w - bw - 60, "lm", "Zeichen-Text")


def notiz_unter(d, cx, y_von, y, w, h, text, col, fill, size=28):
    """Etikett unter einer Markierung im Code (mit senkrechter Linie von y_von), mittig auf cx, im Bild gehalten."""
    x = min(max(60, cx - w / 2), 1220 - w)
    d.line((cx, y_von, cx, y), fill=col, width=3)
    tag(d, x, y, w, h, text, fill, col, size, 700, outl=col)


def vgl(f, t, x, y, links, op, rechts, t_in, t_erg, tout=None, size=48, unter=None, grund=None, t_grund=None):
    """Vergleich mit Pfeil und Ergebnis (True/False), wie vergleich_zeile aus b02, aber mit Ausblenden (tout).
    Das Ergebnis wird nachgerechnet."""
    wert = eval(f"({links}) {op} ({rechts})", {"__builtins__": {}})
    wort = "True" if wert else "False"
    bw, hc = vergleich_mass(links, op, rechts, size)
    E(f, t, t_in, lambda d, dy: vergleich(d, x, y + dy, links, op, rechts, size, unter), tout)
    ch = int(hc * 0.78); x1 = x + bw
    def erg(d, dy):
        pfeil(d, x1 + 16, y + hc / 2 + dy, x1 + 74, y + hc / 2 + dy, GREY, 6, 18)
        wert_chip(d, x1 + 88, y + (hc - ch) / 2 + dy, wort, ch)
    E(f, t, t_erg, erg, tout)
    if grund:
        E(f, t, t_grund, lambda d, dy: TB(d, x, y + hc + (56 if unter else 16) + dy, grund, F(28, 600), GREY, 1220 - x, "la", "Grund"), tout)
    return wort


# ---------------------------------------------------------------- 1 Karte 1: vergleichen
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)
    kopf2(f, t, [(0, "Drei Karten im Werkzeugkasten"), (a(1), "Karte 1 · Vergleichen: wahr oder falsch")])
    drei_karten(f, t, 0.5, 250, tout=a(1) - 0.4, fokus=0, t_fokus=a(0, 0.52))
    # Code links, Ausgabe darunter
    zeilen = [getippt(CODE1[0], [(a(1, 0.02), 99)], t), getippt(CODE1[1], [(a(1, 0.5), 99)], t), getippt(CODE1[2], [(a(3, 0.25), 99)], t)]
    akt = aktuell(t, [(a(1, 0.02), {0}), (a(1, 0.5), {1}), (a(3, 0.25), {2}), (a(4, 0.0), None)])
    E(f, t, a(1), lambda d, dy: zeilen_code(d, 60, 124 + dy, 560, zeilen, t, 30, 52, aktiv=akt))
    aus = [(a(2, 0.15), OUT1[0], None, None), (a(3, 0.75), OUT1[1], None, None)]
    E(f, t, a(2, 0.0), lambda d, dy: lauf_panel(d, 60, 368 + dy, 560, aus, t, 30, 48, "Ausgabe"))
    # rechts: die Vergleiche mit eingesetztem Wert
    w1 = vgl(f, t, 690, 140, "48", ">=", "50", a(1, 0.7), a(2, 0.15), unter=("punkte", None),
             grund="denn 48 ist kleiner als 50", t_grund=a(2, 0.42))
    w2 = vgl(f, t, 690, 350, "48", "==", "48", a(3, 0.28), a(3, 0.75), unter=("punkte", None))
    assert (w1, w2) == tuple(OUT1)
    # zum Schluss: == fragt, = legt ab (auch im Code markiert)
    g = CodeGeo(60, 124, 560, 30, 52, 3)
    f.el(show(t, a(4, 0.05)), lambda d, dy: code_markiere(d, g, 2, *spalte(CODE1[2], "=="), CODE_R))
    f.el(show(t, a(4, 0.5)), lambda d, dy: code_markiere(d, g, 0, *spalte(CODE1[0], "="), CODE_K))
    E(f, t, a(4, 0.05), lambda d, dy: zeichen_karte(d, 60, 560 + dy, 560, 96, "==", "fragt: gleich?", RED, LIGHTR))
    E(f, t, a(4, 0.5), lambda d, dy: zeichen_karte(d, 680, 560 + dy, 540, 96, "=", "legt einen Wert ab", BLUE, LIGHTB))


# ---------------------------------------------------------------- Plan fuer Karte 2 (Raute mit zwei Wegen)
PLAN = plan_zweig([("d", "dec", "punkte >= 50?", [("j", "io", 'Ausgabe: "Bestanden"')], [("n", "io", 'Ausgabe: "Nicht bestanden"')])])
W_JA = weg(PLAN, {"d": "ja"}); W_NEIN = weg(PLAN, {"d": "nein"})
NUR_NEIN = [k for k in W_NEIN if k not in W_JA]
PBOX = (60, 108, 1160, 214)
CX, CY, CW, CS, CL = 60, 340, 640, 28, 46            # Code-Kasten in Szene 2 und 3
RX, RW = 724, 496                                    # rechte Spalte


# ---------------------------------------------------------------- 2 Karte 2: if
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Karte 2 · if und else: einer von zwei Wegen")
    # Plan oben; der nein-Weg bleibt blass, bis else kommt (Szene 3)
    hl = {}
    if a(0, 0.55) <= t < a(2, 0.0): hl = {"d": RED}
    if t >= a(4, 0.35): hl = weg_hl(W_JA)
    vis = lambda k: 0.3 if k in NUR_NEIN else 1.0
    plan_mit_ausgang(f, show(t, a(0, 0.45)), hl, vis)
    # Code
    z2 = getippt(CODE2[1], [(a(0, 0.8), 3), (a(1, 0.45), 15), (a(2, 0.45), 16)], t)
    z3 = getippt(CODE2[2], [(a(3, 0.05), 99)], t)
    zeilen = [CODE2[0], z2, z3, "", ""]
    akt = aktuell(t, [(a(0, 0.8), {1}), (a(3, 0.05), {2}), (a(3, 0.6), None), (a(4, 0.35), {2})])
    E(f, t, 0.5, lambda d, dy: zeilen_code(d, CX, CY + dy, CW, zeilen, t, CS, CL, aktiv=akt))
    g = CodeGeo(CX, CY, CW, CS, CL, 5)
    f.el(show(t, a(1, 0.75), a(2, 0.4)), lambda d, dy: code_markiere(d, g, 1, *spalte(CODE2[1], "punkte >= 50"), CODE_K))
    f.el(show(t, a(2, 0.6)), lambda d, dy: code_markiere(d, g, 1, *spalte(CODE2[1], ":", True), CODE_R))
    f.el(show(t, a(3, 0.6)), lambda d, dy: code_einrueckung(d, g, 2))
    # rechte Spalte: was du dir merkst
    E(f, t, a(1, 0.75), lambda d, dy: tag(d, RX, 340 + dy, RW, 58, "Bedingung: wie in der Raute", LIGHTB, BLUE, 30, 700, outl=BLUE))
    E(f, t, a(2, 0.6), lambda d, dy: tag(d, RX, 412 + dy, RW, 58, "Doppelpunkt am Ende", LIGHTR, RED, 30, 700, outl=RED))
    E(f, t, a(3, 0.6), lambda d, dy: tag(d, RX, 484 + dy, RW, 58, "vier Leerzeichen eingerückt", LIGHTA, AMB, 30, 700, outl=AMB))
    E(f, t, a(4, 0.35), lambda d, dy: tag(d, RX, 556 + dy, RW, 64, "eingerückt: der ja-Weg", RED, WHITE, 32))


# ---------------------------------------------------------------- 3 Karte 2: else und zwei Laeufe
def sc3(f, t, ct):
    a = lambda k, fr=0.0: AT[3](ct, k, fr)
    kopf(f, t, "Karte 2 · if und else: einer von zwei Wegen")
    lauf60 = t >= a(3, 0.0)
    # Plan: nein-Weg kommt dazu, dann die beiden Laeufe
    hl = {}; vis = None
    if a(0, 0.85) <= t < a(2, 0.0): hl = weg_hl(NUR_NEIN)
    if not lauf60:
        if t >= a(2, 0.0): hl = {"d": RED}
        if t >= a(2, 0.36): vis = weg_vis(W_NEIN, a=show(t, a(2, 0.36)))
        if t >= a(2, 0.65): hl = weg_hl(W_NEIN)
    else:
        hl = {"d": RED} if t >= a(3, 0.1) else {}
        if t >= a(3, 0.39): vis = weg_vis(W_JA, a=show(t, a(3, 0.39)))
        if t >= a(3, 0.69): hl = weg_hl(W_JA)
    plan_mit_ausgang(f, 1.0, hl, vis)
    # Code
    z4 = getippt(CODE2[3], [(a(0, 0.2), 99)], t)
    z5 = getippt(CODE2[4], [(a(0, 0.85), 99)], t)
    zeilen = [CODE2_60[0] if lauf60 else CODE2[0], CODE2[1], CODE2[2], z4, z5]
    if not lauf60:
        akt = aktuell(t, [(a(0, 0.2), {3}), (a(0, 0.85), {4}), (a(1, 0.0), {3}), (a(2, 0.0), {1}), (a(2, 0.65), {3, 4})])
        grau = {2} if t >= a(2, 0.36) else None
    else:
        akt = aktuell(t, [(a(3, 0.0), {0}), (a(3, 0.15), {1}), (a(3, 0.69), {1, 2})])
        grau = {4} if t >= a(3, 0.39) else None
    E(f, t, 0.0, lambda d, dy: zeilen_code(d, CX, CY + dy, CW, zeilen, t, CS, CL, aktiv=akt, grau=grau))
    g = CodeGeo(CX, CY, CW, CS, CL, 5)
    f.el(show(t, a(0, 0.4), a(2, 0.0)), lambda d, dy: code_fluchtlinie(d, g, 1, 3))
    f.el(show(t, a(0, 0.68), a(2, 0.0)), lambda d, dy: code_markiere(d, g, 3, *spalte(CODE2[3], ":"), CODE_R))
    f.el(show(t, a(1, 0.1), a(2, 0.0)), lambda d, dy: code_markiere(d, g, 3, *spalte(CODE2[3], "else"), CODE_K))
    f.el(show(t, a(3, 0.0), a(3, 0.6)), lambda d, dy: code_markiere(d, g, 0, *spalte(CODE2_60[0], "60"), AMBER))
    # rechte Spalte: erst die Regeln zu else, dann die Laeufe
    E(f, t, a(0, 0.85), lambda d, dy: tag(d, RX, 340 + dy, RW, 58, "eingerückt unter else: nein-Weg", LIGHTR, RED, 28, 700, outl=RED), a(2, 0.0) - 0.3)
    E(f, t, a(1, 0.1), lambda d, dy: tag(d, RX, 412 + dy, RW, 58, "else hat keine Bedingung", LIGHTB, BLUE, 30, 700, outl=BLUE), a(2, 0.0) - 0.3)
    vgl(f, t, RX, 340, "48", ">=", "50", a(2, 0.05), a(2, 0.2), tout=a(3, 0.0) - 0.3, size=44, unter=("punkte", None))
    vgl(f, t, RX, 340, "60", ">=", "50", a(3, 0.1), a(3, 0.25), size=44, unter=("punkte", None))
    aus = [(a(2, 0.83), OUT48[0], None, None)] if not lauf60 else [(a(3, 0.87), OUT60[0], None, None)]
    E(f, t, a(2, 0.6), lambda d, dy: lauf_panel(d, RX, 478 + dy, RW, aus, t, 30, 48, "Ausgabe"))
    E(f, t, a(4, 0.1), lambda d, dy: tag(d, RX, 608 + dy, RW, 66, "Es läuft immer genau ein Weg.", RED, WHITE, 32))


# ---------------------------------------------------------------- 4 Karte 3: f-String
def sc4(f, t, ct):
    a = lambda k, fr=0.0: AT[4](ct, k, fr)
    kopf(f, t, "Karte 3 · f-String: zwei Nachkommastellen")
    zeilen = [getippt(CODE4[0], [(a(0, 0.33), 99)], t), getippt(CODE4[1], [(a(1, 0.0), 99)], t)]
    S, LH = 38, 62
    E(f, t, a(0, 0.3), lambda d, dy: zeilen_code(d, 60, 124 + dy, 1160, zeilen, t, S, LH))
    g = CodeGeo(60, 124, 1160, S, LH, 2); L = CODE4[1]
    unten = g.zy(1) + S * 1.1 + 6; NY = 352
    # Satz 1: Geld schreibt man mit zwei Nachkommastellen
    def geld(d, dy):
        card(d, 60, NY + dy, 620, 128, stripe=False)
        T2(d, 110, NY + 50 + dy, "9.5", M(52, True), GREY, "lm")
        pfeil(d, 230, NY + 50 + dy, 320, NY + 50 + dy, GREY, 6, 18)
        T2(d, 350, NY + 50 + dy, "9.50", M(52, True), GREEN, "lm")
        TB(d, 370, NY + 104 + dy, "Geld: zwei Nachkommastellen", F(28, 700), DARK, 580, "mm", "Geld")
    E(f, t, a(0, 0.7), geld, a(1, 0.0) - 0.35)
    # Satz 2: das f
    c_f = spalte(L, 'f"')
    f.el(show(t, a(1, 0.45)), lambda d, dy: code_markiere(d, g, 1, *c_f, CODE_R))
    E(f, t, a(1, 0.45), lambda d, dy: notiz_unter(d, (g.cx(c_f[0]) + g.cx(c_f[1])) / 2, unten + 2, NY + dy, 520, 60,
                                                  "f direkt vor dem Anführungszeichen", RED, LIGHTR), a(2, 0.0) - 0.35)
    # Satz 3: {preis}
    c_a = spalte(L, "{"); c_n = spalte(L, "preis"); c_z = spalte(L, "}")
    def klammern(d, dy):
        code_markiere(d, g, 1, *c_a, AMBER); code_markiere(d, g, 1, *c_z, AMBER)
    f.el(show(t, a(2, 0.05)), klammern)
    xm = (g.cx(c_n[0]) + g.cx(c_n[1])) / 2
    E(f, t, a(2, 0.1), lambda d, dy: notiz_unter(d, xm, unten + 2, NY + dy, 460, 60, "Name der Variable", AMB, LIGHTA), a(3, 0.0) - 0.35)
    E(f, t, a(2, 0.62), lambda d, dy: tag(d, max(60, xm - 230), NY + 76 + dy, 460, 60, "Python setzt den Wert ein: 9.5", LIGHTK, DARK, 28, 700, outl=GREY), a(3, 0.0) - 0.35)
    # Satz 4: :.2f, Zeichen fuer Zeichen
    c_p = spalte(L, ":.2f"); k = 0
    for tz in (a(3, 0.21), a(3, 0.31), a(3, 0.39), a(3, 0.47)):
        if t >= tz: k += 1
    if k:
        f.el(1.0, lambda d, dy: code_markiere(d, g, 1, c_p[0], c_p[0] + k, CODE_G))
    xp = (g.cx(c_p[0]) + g.cx(c_p[1])) / 2
    E(f, t, a(3, 0.61), lambda d, dy: notiz_unter(d, xp, unten + 2, NY + dy, 520, 60, ":.2f zeigt zwei Nachkommastellen", GREEN, LIGHTG))
    # Satz 5: die Ausgabe, die angehaengte Null markiert
    aus = [(a(4, 0.4), OUT4[0], None, None)]
    AY = 500
    E(f, t, a(4, 0.0), lambda d, dy: lauf_panel(d, 60, AY + dy, 620, aus, t, S, 56, "Ausgabe"))
    fm = M(S); x0 = 60 + 22 + fm.getlength("Ticket: 9.5"); x1 = x0 + fm.getlength("0"); yy = AY + 46
    assert OUT4[0][len("Ticket: 9.5")] == "0"
    f.el(show(t, a(4, 0.75)), lambda d, dy: d.rounded_rectangle((x0 - 3, yy - 5, x1 + 3, yy + S + 4), 6, outline=CODE_G, width=3))
    E(f, t, a(4, 0.75), lambda d, dy: tag(d, 720, AY + 30 + dy, 500, 60, "Die Null hängt Python an", LIGHTG, GREEN, 30, 700, outl=GREEN))


# ---------------------------------------------------------------- 5 Zwei Fehler, dann Ausblick
LX, LW, RX5, RW5 = 60, 540, 640, 580

def sc5(f, t, ct):
    a = lambda k, fr=0.0: AT[5](ct, k, fr)
    kopf2(f, t, [(0, "Zwei Fehler, die fast jedem passieren"), (a(4), "Jetzt du: die drei Karten")])
    weg_ = a(4) - 0.35
    def kopfkarte(x, w, nr, tin, txt, t_txt):
        def karte(d, dy):
            card(d, x, 116 + dy, w, 64, stripe=False)
            num_circle(d, x + 36, 148 + dy, 20, nr, RED)
        E(f, t, tin, karte, weg_)
        # erst "Fehler 1", dann der Name des Fehlers
        E(f, t, tin, lambda d, dy: TB(d, x + 70, 148 + dy, f"Fehler {nr}", F(30, 700), GREY, w - 90, "lm", "Fehler-Titel"), t_txt - 0.3)
        E(f, t, t_txt, lambda d, dy: TB(d, x + 70, 148 + dy, txt, F(30, 700), RED, w - 90, "lm", "Fehler-Titel"), weg_)
    kopfkarte(LX, LW, 1, a(0, 0.2), "Der Doppelpunkt fehlt", a(1, 0.25))
    kopfkarte(RX5, RW5, 2, a(0, 0.45), "Das f fehlt", a(2, 0.12))
    # Fehler 1: Doppelpunkt fehlt -> SyntaxError mit Zeile
    S, LH = 24, 42
    E(f, t, a(1, 0.25), lambda d, dy: zeilen_code(d, LX, 196 + dy, LW, FEHLER1, t, S, LH), weg_)
    g1 = CodeGeo(LX, 196, LW, S, LH, 3)
    def luecke(d, dy):
        x0, y0, x1, y1 = g1.zeichen(1, len(FEHLER1[1]), len(FEHLER1[1]) + 1)
        x0 += 4; gestrichelt(d, [(x0, y0 + dy), (x1, y0 + dy), (x1, y1 + dy), (x0, y1 + dy)], CODE_R, 3, 6, 5)
    E(f, t, a(1, 0.4), luecke, weg_)
    z3 = [('  File "<exec>", ', CODE_T), ("line 2", CODE_N)]
    assert "".join(s for s, _ in z3) == MELDUNG1[0]
    zeilen = [(a(1, 0.5), z3, None, None), (a(1, 0.5), MELDUNG1[1], None, None), (a(1, 0.5), MELDUNG1[2], None, None, CODE_R),
              (a(1, 0.5), MELDUNG1[3], None, None, CODE_R)]
    YM = 196 + g1.h + 16
    E(f, t, a(1, 0.45), lambda d, dy: lauf_panel(d, LX, YM + dy, LW, zeilen, t, S, 38, "Ausgabe", hl={0} if t >= a(1, 0.72) else None), weg_)
    # Fehler 2: f fehlt -> keine Meldung, Klammern stehen woertlich da
    E(f, t, a(2, 0.1), lambda d, dy: zeilen_code(d, RX5, 196 + dy, RW5, FEHLER2, t, S, LH), weg_)
    g2 = CodeGeo(RX5, 196, RW5, S, LH, 2)
    E(f, t, a(2, 0.25), lambda d, dy: caret(d, g2.cx(spalte(FEHLER2[1], '"')[0]), g2.zy(1) + S * 1.1 + 4 + dy), weg_)
    Y2 = 196 + g2.h + 16
    aus = [(a(2, 0.5), OUT_F2[0], None, None)]
    E(f, t, a(2, 0.45), lambda d, dy: lauf_panel(d, RX5, Y2 + dy, RW5, aus, t, S, 38, "Ausgabe"), weg_)
    fm = M(S)
    def klammern(d, dy):
        for teil in ("{", "}"):
            c = OUT_F2[0].find(teil); xa = RX5 + 22 + fm.getlength(OUT_F2[0][:c]); xb = xa + fm.getlength(teil)
            d.rounded_rectangle((xa - 3, Y2 + 46 - 5 + dy, xb + 3, Y2 + 46 + S + 4 + dy), 5, outline=CODE_R, width=3)
    E(f, t, a(2, 0.72), klammern, weg_)
    E(f, t, a(3, 0.05), lambda d, dy: tag(d, RX5, Y2 + lauf_h(1, 38) + 20 + dy, RW5, 64, "Diesen Fehler findest nur du.", RED, WHITE, 32), weg_)
    # Ausblick: die drei Karten
    drei_karten(f, t, a(4, 0.1), 250)


SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == 5 == len(SCENES)


def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 02 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Python-", F(84, 700), DARK)
        T2(d, 90, 256, "Werkzeugkasten", F(84, 700), DARK)
        T2(d, 90, 384, "vergleichen, if und else, f-String", F(40, 400), GREY)
        for k, (titel, _, _) in enumerate(KARTEN):
            chip(d, 90 + k * 216, 500, 200, 64, titel, LIGHTR, RED, 30)
        code_n(d, 760, 150, 460, CODE2, [1, 2, 3, 4, 5], [-1] * 5, 0, 22, 38)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)


if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
