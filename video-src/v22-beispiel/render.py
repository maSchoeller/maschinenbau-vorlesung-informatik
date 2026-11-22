"""V22 Vorgerechnet: Prüfprotokoll einer Wellen-Charge als Code-Walkthrough (Code exakt aus briefing/v22-beispiel.py, Ausgabe wird echt berechnet).
Aufruf: python render.py [text|probe|zeiten|scan|tts|full|mux]
Ohne Audio (Trockenlauf): python render.py probe  (Poster, Standbilder je Szene, Scan aller 0,5 s; Ausgabe nach out/, nicht im Repo).
tts/full erst nach Freigabe der ElevenLabs-Credits (strikt nacheinander ueber sprechen.py)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v18-common"))
from h18 import *
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from pap import Dia, pap_view, reveal, PAL
from texte import SRC

NAME = "v22-beispiel"; LABEL = "DHBW · Informatik · V22 · Vorgerechnetes Beispiel"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Code und echte Ausgabe
ROOT = os.path.join(HERE, "..", "..")
CODE = open(os.path.join(ROOT, "briefing", "v22-beispiel.py"), encoding="utf-8").read().rstrip("\n").split("\n")
assert len(CODE) == 39 and CODE[6].startswith("def bewerte") and CODE[19].startswith("for d in messwerte") and CODE[24].startswith("anteil") \
    and CODE[37].startswith("assert bewerte(25.1"), "briefing/v22-beispiel.py hat sich geaendert"
OUT = run_code("\n".join(CODE))
ERWARTET = ["20.01 mm -> gut", "20.03 mm -> nacharbeit", "19.97 mm -> ausschuss", "20.00 mm -> gut", "20.02 mm -> gut",
            "{'gut': 3, 'nacharbeit': 1, 'ausschuss': 1}", "Gutanteil: 60 %", "Alle Grenzfall-Tests bestanden"]
assert OUT == ERWARTET, OUT
PROG = "Python (briefing/v22-beispiel.py)"
MESS = [20.01, 20.03, 19.97, 20.00, 20.02]
ROWS = []; Z = {"gut": 0, "nacharbeit": 0, "ausschuss": 0}
for k, d in enumerate(MESS, 1):
    e = OUT[k - 1].split("-> ")[1]; Z[e] += 1
    ROWS.append([str(k), f"{d:.2f}", e, str(Z["gut"]), str(Z["nacharbeit"]), str(Z["ausschuss"])])
assert ROWS[-1][3:] == ["3", "1", "1"]
ECOL = {"gut": GREEN, "nacharbeit": AMB, "ausschuss": RED}

def nums(a, b): return list(range(a, b + 1))
def monobox(d, x, y, w, h, txt, size=22, col=CODE_T, fill=BOX):
    d.rounded_rectangle((x, y, x + w, y + h), 10, fill=fill)
    fit(txt, M(size), w - 24, "Mono"); T2(d, x + 14, y + h / 2, txt, M(size), col, "lm")

# ---------------------------------------------------------------- 1 Spezifikation, Schritt 1 und 2
def sc1(f, t, ct):
    heading(f, t, "Prüfprotokoll einer Wellen-Charge")
    X = lambda v: 100 + (v - 19.95) / 0.10 * 1080
    def skala(d, dy):
        T2(d, 60, 112 + dy, "Nennmaß 20,00 mm, Toleranz ± 0,02 mm", F(28, 700), DARK, "la")
        zones = [(19.95, 19.98, LIGHTR, RED, "ausschuss"), (19.98, 20.02, LIGHTG, GREEN, "gut"), (20.02, 20.05, LIGHTA, AMB, "nacharbeit")]
        for k, (a, b, fill, col, nm) in enumerate(zones):
            ta = ct(0) + 0.8 + 0.9 * k
            al = ap(t, ta, 0.4)
            if al <= 0: continue
            d.rectangle((X(a), 166 + dy, X(b), 236 + dy), fill=mix(WHITE, fill, al), outline=mix(WHITE, col, al), width=3)
            T2(d, (X(a) + X(b)) / 2, 192 + dy, nm, F(28, 700), mix(WHITE, col, al), "mm")
            T2(d, (X(a) + X(b)) / 2, 220 + dy, ("zu dünn" if k == 0 else "zu dick" if k == 2 else "in Toleranz"), F(20, 400), mix(WHITE, GREY, al), "mm")
        for v, lab in ((19.98, "19,98"), (20.00, "20,00"), (20.02, "20,02")):
            d.line((X(v), 236 + dy, X(v), 250 + dy), fill=DARK, width=3); T2(d, X(v), 256 + dy, lab, M(22, True), DARK, "ma")
    f.el(show(t, ct(0) + 0.3), skala, dy=dyf(t, ct(0) + 0.3))
    def k1(d, dy):
        card(d, 60, 330 + dy, 560, 250); T2(d, 88, 346 + dy, "1 · Zweck in einem Satz", F(30, 700), BLUE, "la")
        for j, s in enumerate(("Messungen einordnen, zählen und", "den Gutanteil in Prozent ausgeben")):
            T2(d, 88, 410 + j * 40 + dy, s, F(28, 600), DARK, "la")
    def k2(d, dy):
        card(d, 660, 330 + dy, 560, 250); T2(d, 688, 346 + dy, "2 · Eingaben und Ausgaben", F(30, 700), GREEN, "la")
        for j, s in enumerate(("Ein: Durchmesser d in mm (float)", "Aus: Text, Zähler, Gutanteil in %")):
            T2(d, 688, 410 + j * 40 + dy, s, F(28, 600), DARK, "la")
    f.el(show(t, ct(2) + 0.3), k1, dy=dyf(t, ct(2) + 0.3)); f.el(show(t, ct(3) + 0.3), k2, dy=dyf(t, ct(3) + 0.3))

# ---------------------------------------------------------------- 2 Programmablaufplan der Funktion
def build_pap():
    D = Dia(19); N = D.node
    N("s", "term", "bewerte(d, nenn, tol)", 0, 0); N("a", "proc", "abweichung = d - nenn", 0, 0); N("d1", "dec", "abs(abweichung) <= tol ?", 0, 0)
    N("d2", "dec", "abweichung > 0 ?", 0, 0, minw=250); N("gut", "term", "Rückgabe: gut", 0, 0); N("nach", "term", "Rückgabe: nacharbeit", 0, 0); N("aus", "term", "Rückgabe: ausschuss", 0, 0)
    n = D.nodes; cx = 200; y = 0
    for k in ("s", "a", "d1", "d2", "aus"):
        n[k].cx = cx; n[k].cy = y + n[k].h / 2; y = n[k].cy + n[k].h / 2 + 38
    n["gut"].cx = 520; n["gut"].cy = n["d1"].cy; n["nach"].cx = 520; n["nach"].cy = n["d2"].cy
    E = D.edge
    E("s-a", "s", "b", "a", "t"); E("a-d1", "a", "b", "d1", "t")
    E("d1-gut", "d1", "r", "gut", "l", label="ja"); E("d1-d2", "d1", "b", "d2", "t", label="nein")
    E("d2-nach", "d2", "r", "nach", "l", label="ja"); E("d2-aus", "d2", "b", "aus", "t", label="nein")
    return D
PAP = build_pap()
PGROUPS = [["s", "s-a", "a", "a-d1"], ["d1", "d1-gut", "gut", "d1-d2"], ["d2", "d2-nach", "nach", "d2-aus", "aus"]]
_bb = PAP.bbox(); PW, PH = _bb[2] - _bb[0], _bb[3] - _bb[1]
PBOX = (60, 112, 680, 560); PZOOM = min(1.1, (PBOX[2] - 24) / PW, (PBOX[3] - 24) / PH)
PCAM = (_bb[0] - (PBOX[2] / PZOOM - PW) / 2, _bb[1] - (PBOX[3] / PZOOM - PH) / 2)

def sc2(f, t, ct):
    heading(f, t, "Der Plan der Funktion bewerte")
    tm = {}
    for g, keys in enumerate(PGROUPS):
        for i, k in enumerate(keys): tm[k] = ct(g) + 0.3 + i * 0.5
    cur = max([g for g in range(3) if t >= ct(g)] or [0])
    hl = {k: PAL[g] for g in range(cur + 1) for k in PGROUPS[g]}
    pap_view(f, ap(t, 0.2, 0.3), PAP, PBOX, PCAM, vis=reveal(t, tm), zoom=PZOOM, hl=hl)
    notes = [("1 · Abweichung", "d minus Nennmaß, mit Vorzeichen"), ("2 · Betrag prüfen", "abs: Abstand, nach oben und unten"), ("3 · Richtung prüfen", "positiv: zu dick, negativ: zu dünn")]
    for k, (big, small) in enumerate(notes):
        tin = ct(k) + 0.6
        def fn(d, dy, k=k, big=big, small=small):
            y = 150 + k * 140; card(d, 740, y + dy, 480, 116, stripe=False)
            d.rectangle((740, y + dy, 748, y + 116 + dy), fill=PAL[k])
            T2(d, 770, y + 18 + dy, big, F(30, 700), DARK, "la"); fit(small, F(24, 400), 430, "Notiz"); T2(d, 770, y + 64 + dy, small, F(24, 400), GREY, "la")
        f.el(show(t, tin), fn, dy=dyf(t, tin))

# ---------------------------------------------------------------- 3 Zeilen 7 bis 15
def put(times, idxs, start, a, cps=55, gap=0.1):
    c = start
    for i in idxs:
        times[i] = c; c += max(len(CODE[a - 1 + i]), 4) / cps + gap
    return c
def sc3(f, t, ct):
    heading(f, t, "Die Funktion: Zeilen 7 bis 15")
    times = [1e9] * 9
    put(times, (0,), ct(0) + 0.2, 7); put(times, (2, 3, 4), ct(1) + 0.2, 7); put(times, (5, 6, 7, 8), ct(2) + 0.2, 7)
    times[1] = ct(0) + 1.2
    hl = hl_at(t, [(0, None), (ct(0), {0, 1}), (ct(1), {2, 3, 4}), (ct(2), {5, 6, 7, 8}), (ct(3), {3, 5})])
    f.el(ap(t, 0.0, 0.3), lambda d, dy: code_n(d, 60, 112 + dy, 840, CODE[6:15], nums(7, 15), times, t, 17, 34, hl, title=PROG))
    def abs_(d, dy):
        card(d, 930, 130 + dy, 290, 150); T2(d, 956, 144 + dy, "abs(...)", M(30, True), RED, "la"); T2(d, 956, 196 + dy, "Abstand: zählt", F(26, 600), DARK, "la"); T2(d, 956, 230 + dy, "nach beiden Seiten", F(26, 600), DARK, "la")
    def elif_(d, dy):
        card(d, 930, 310 + dy, 290, 150); T2(d, 956, 324 + dy, "elif ... > 0", M(30, True), RED, "la"); T2(d, 956, 376 + dy, "Richtung: zählt", F(26, 600), DARK, "la"); T2(d, 956, 410 + dy, "das Vorzeichen", F(26, 600), DARK, "la")
    f.el(show(t, ct(3) + 0.3), abs_, dy=dyf(t, ct(3) + 0.3)); f.el(show(t, ct(3) + 3.4), elif_, dy=dyf(t, ct(3) + 3.4))
    for k, (nm, col, fill) in enumerate((("gut", GREEN, LIGHTG), ("nacharbeit", AMB, LIGHTA), ("ausschuss", RED, LIGHTR))):
        tin = ct(1) + 0.8 + 0.2 * k
        f.el(show(t, tin), lambda d, dy, k=k, nm=nm, col=col, fill=fill: chip(d, 60 + k * 210, 520 + dy, 200, 46, "return " + nm if False else nm, fill, col, 24, outl=col), dy=dyf(t, tin))

# ---------------------------------------------------------------- 4 Zeilen 18 bis 23 mit Variablentabelle
def sc4(f, t, ct):
    heading(f, t, "Die Schleife: Zeilen 18 bis 23")
    lines = CODE[17:23]
    times = [ct(0) + 0.2, ct(0) + 1.4, ct(1) + 0.2, ct(1) + 1.2, ct(1) + 2.6, ct(1) + 4.2]
    hl = hl_at(t, [(0, None), (ct(0), {0, 1}), (ct(1), {2, 3, 4, 5}), (ct(2), {2, 3, 4})])
    f.el(ap(t, 0.0, 0.3), lambda d, dy: code_n(d, 60, 112 + dy, 620, lines, nums(18, 23), times, t, 18, 30, hl, title=PROG))
    rt = [ct(2) + 0.6, ct(2) + 3.0, ct(2) + 4.4, ct(3) + 0.3, ct(3) + 1.8]
    colors = {(i, 2): ECOL[ROWS[i][2]] for i in range(5)}
    f.el(show(t, ct(1) + 0.3), lambda d, dy: grid(d, 700, 112 + dy, [56, 84, 140, 80, 80, 80], ["Nr", "d", "ergebnis", "gut", "nach.", "aus."], ROWS, t, rt, size=24, rh=48, colors=colors), dy=dyf(t, ct(1) + 0.3))
    f.el(show(t, ct(0) + 1.8), lambda d, dy: tag(d, 60, 380 + dy, 620, 44, 'zaehler: drei Schlüssel, alle auf 0', LIGHTK, DARK, 24), dy=dyf(t, ct(0) + 1.8))
    f.el(show(t, ct(1) + 3.0), lambda d, dy: tag(d, 60, 440 + dy, 620, 44, "Zeile 22: passenden Zähler um 1 erhöhen", LIGHTB, BLUE, 24, outl=BLUE), dy=dyf(t, ct(1) + 3.0))
    f.el(show(t, ct(3) + 3.0), lambda d, dy: tag(d, 700, 480 + dy, 520, 48, "Zähler am Ende: gut 3, nacharbeit 1, ausschuss 1", LIGHTG, GREEN, 22, outl=GREEN), dy=dyf(t, ct(3) + 3.0))

# ---------------------------------------------------------------- 5 Ausgabe
def sc5(f, t, ct):
    heading(f, t, "Ausgabe und Gutanteil: Zeilen 23 bis 27")
    idx = [22, 24, 25, 26]
    times = [ct(0) + 0.2, ct(1) + 0.2, ct(2) + 0.2, ct(2) + 1.4]
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {1}), (ct(2), {2, 3})])
    f.el(ap(t, 0.0, 0.3), lambda d, dy: code_n(d, 60, 112 + dy, 1160, [CODE[i] for i in idx], [i + 1 for i in idx], times, t, 20, 36, hl, title=PROG))
    ents = [(ct(0) + 0.8 + 0.45 * k, [(OUT[k], ECOL[OUT[k].split("-> ")[1]] if k < 5 else CODE_T)]) for k in range(5)]
    ents.append((ct(2) + 0.8, [(OUT[5], CODE_T)])); ents.append((ct(2) + 2.2, [(OUT[6], CODE_G)]))
    f.el(show(t, ct(0) + 0.5), lambda d, dy: console_panel(d, 60, 330 + dy, 700, 316, ents, t, 24, title="Ausgabe", lh=36), dy=dyf(t, ct(0) + 0.5))
    def rech(d, dy):
        card(d, 800, 330 + dy, 420, 200); T2(d, 826, 344 + dy, "Gutanteil", F(30, 700), DARK, "la")
        T2(d, 826, 400 + dy, "3 / 5 · 100", M(32, True), DARK, "la"); T2(d, 826, 452 + dy, "= 60 %", M(40, True), GREEN, "la")
    f.el(show(t, ct(1) + 0.8), rech, dy=dyf(t, ct(1) + 0.8))

# ---------------------------------------------------------------- 6 Grenzfaelle und Verbesserungen
def sc6(f, t, ct):
    heading(f, t, "Schritt 4 und 5: Grenzfälle, Verbesserungen")
    lines = CODE[32:38]
    times = [ct(0) + 0.2, ct(0) + 1.0, ct(0) + 1.8, ct(1) + 0.2, ct(1) + 0.6, ct(1) + 1.0]
    hl = hl_at(t, [(0, None), (ct(0), {0, 1, 2}), (ct(1), {3, 4, 5})])
    f.el(ap(t, 0.0, 0.3), lambda d, dy: code_n(d, 60, 112 + dy, 1160, lines, nums(33, 38), times, t, 16, 30, hl, title=PROG))
    chips = [("19.98: gut", ct(0) + 1.0), ("20.025: nacharbeit", ct(0) + 2.6), ("19.975: ausschuss", ct(0) + 4.2)]
    for k, (txt, tin) in enumerate(chips):
        f.el(show(t, tin), lambda d, dy, k=k, txt=txt: (d.ellipse((60 + k * 390, 396 + dy, 96 + k * 390, 432 + dy), fill=GREEN), tick(d, 78 + k * 390, 414 + dy, 22, WHITE, 4),
                                                       T2(d, 108 + k * 390, 414 + dy, txt, M(24, True), DARK, "lm")), dy=dyf(t, tin))
    f.el(show(t, ct(1) + 0.8), lambda d, dy: tag(d, 60, 452 + dy, 780, 50, "25.1 - 25.0 = 0.10000000000000142  >  0.1", LIGHTR, RED, 28, outl=RED), dy=dyf(t, ct(1) + 0.8))
    f.el(show(t, ct(1) + 3.6), lambda d, dy: T2(d, 860, 477 + dy, "nacharbeit statt gut", F(28, 700), RED, "lm"), dy=dyf(t, ct(1) + 3.6))
    f.el(show(t, ct(2) + 1.8), lambda d, dy: tag(d, 60, 524 + dy, 700, 50, "Grenzfälle immer als Test aufschreiben", LIGHTB, BLUE, 28, outl=BLUE), dy=dyf(t, ct(2) + 1.8))
    for k, (txt, tin) in enumerate((("leere Liste abfangen", ct(3) + 0.8), ("Grenzprüfung absichern", ct(3) + 2.8))):
        def fn(d, dy, k=k, txt=txt):
            x = 60 + k * 600; card(d, x, 596 + dy, 560, 76, stripe=False)
            d.ellipse((x + 20, 616 + dy, x + 56, 652 + dy), fill=BLUE); tick(d, x + 38, 634 + dy, 22, WHITE, 4)
            T2(d, x + 72, 634 + dy, txt, F(30, 700), DARK, "lm")
        f.el(show(t, tin), fn, dy=dyf(t, tin))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V22 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vorgerechnet", F(104, 700), DARK)
        T2(d, 90, 290, "Prüfprotokoll einer Wellen-Charge erklären", F(46, 400), GREY)
        code_n(d, 90, 380, 700, CODE[8:12], nums(9, 12), [-1] * 4, 9, 17, 30, {1})
        chip(d, 840, 392, 360, 56, "20.01 mm: gut", LIGHTG, GREEN, 22, outl=GREEN, mono=True)
        chip(d, 840, 464, 360, 56, "20.03 mm: nacharbeit", LIGHTA, AMB, 22, outl=AMB, mono=True)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
