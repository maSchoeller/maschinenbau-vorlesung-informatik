"""V19 Vorgerechnet: Auftragsdatenbank der Fertigungszelle FZ-3 (Code exakt aus briefing/v19-beispiel.py, Ausgabe wird echt mit sqlite3 berechnet).
Aufruf: python render.py [text|probe|zeiten|scan|stills t1 t2..|tts|full|mux]  (tts/full erst nach Freigabe der Credits)"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v19-common"))
from h19 import *
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from pap import Dia, pap_view, reveal, PAL
from texte import SRC

NAME = "v19-beispiel"; LABEL = "DHBW · Informatik · V19 · Vorgerechnetes Beispiel"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Code und echte Ausgabe
ROOT = os.path.join(HERE, "..", "..")
CODE = open(os.path.join(ROOT, "briefing", "v19-beispiel.py"), encoding="utf-8").read().rstrip("\n").split("\n")
assert len(CODE) == 45 and CODE[3] == "import sqlite3" and CODE[22].startswith("cur.executemany") and CODE[44] == "db.close()", len(CODE)
OUT = run_code("\n".join(CODE))
ERWARTET = ["Auftrag 4711: 500 x WELLE_20H6", "Auftrag 4713: 300 x WELLE_20H6", "Menge je Maschine: [('D2', 1600), ('F1', 180)]",
            "Unsicher (f-String): 5 Treffer - alle Aufträge!", "Sicher (Platzhalter): 0 Treffer"]
assert OUT == ERWARTET, OUT
PROG = "Python (briefing/v19-beispiel.py)"

def nums(a, b): return list(range(a, b + 1))
def code_scene(f, t, a, b, size, lh, x, y, w, hl, times, alpha_t=0.0):
    lines = CODE[a - 1:b]
    f.el(ap(t, alpha_t, 0.3), lambda d, dy: code_n(d, x, y + dy, w, lines, nums(a, b), times, t, size, lh, hl, title=PROG))
def put(times, idxs, start, a, cps=55, gap=0.1):
    c = start
    for i in idxs:
        times[i] = c; c += max(len(CODE[a - 1 + i]), 4) / cps + gap
    return c
SW = [70, 140, 100, 80, 110]          # schmale Spaltenbreiten der Auftragstabelle (500)

# ---------------------------------------------------------------- 1 Aufgabe
def sc1(f, t, ct):
    heading(f, t, "Auftragsdatenbank: anlegen, abfragen, absichern")
    def zelle(d, dy):
        card(d, 60, 112 + dy, 560, 356); T2(d, 90, 124 + dy, "Auftragsdatenbank FZ-3", F(32, 700), DARK); T2(d, 90, 168 + dy, "Tabelle auftraege", M(22), GREY)
        tm = [ap(t, ct(0) + 0.6 + 0.3 * i, 0.4) for i in range(5)]
        auftrags_tabelle(d, 90, 206 + dy, tm, rh=40, size=19, colw=SW)
    f.el(show(t, 0.3), zelle, dy=dyf(t, 0.3))
    f.el(show(t, ct(0) + 1.6), lambda d, dy: arrow(d, 640, 290 + dy, 720, 290 + dy, GREY, 5, 16))
    tasks = [(ct(1) + 0.1, "Tabelle füllen: 5 Aufträge"), (ct(1) + 2.0, "Offene Aufträge von D2"), (ct(1) + 3.8, "Menge je Maschine"), (ct(2) + 0.1, "f-String gegen Platzhalter")]
    def prog(d, dy):
        card(d, 740, 112 + dy, 480, 356, stripe=False)
        T2(d, 770, 126 + dy, "Das Programm soll …", F(30, 700), DARK, "la")
        for k, (te, s) in enumerate(tasks):
            a = ap(t, te, 0.4)
            if a > 0:
                y = 190 + k * 66
                d.ellipse((770, y + dy, 806, y + 36 + dy), fill=mix(WHITE, RED, a)); T2(d, 788, y + 18 + dy, str(k + 1), F(24, 700), WHITE, "mm")
                T2(d, 822, y + 18 + dy, s, F(27, 700), mix(WHITE, DARK, a), "lm")
    f.el(show(t, ct(0) + 1.2), prog, dy=dyf(t, ct(0) + 1.2))
    def zwei(d, dy):
        card(d, 60, 492 + dy, 1160, 170)
        T2(d, 90, 506 + dy, "Zwei Wege, eine Eingabe in SQL zu bringen", F(28, 700), DARK, "la")
        d.rounded_rectangle((90, 556 + dy, 640, 636 + dy), 10, fill=BOX); T2(d, 110, 580 + dy, 'f"… WHERE teil = \'{eingabe}\'"', M(20), CODE_T, "lm"); T2(d, 110, 612 + dy, "unsicher", F(22, 700), CODE_R, "lm")
        d.rounded_rectangle((680, 556 + dy, 1190, 636 + dy), 10, fill=BOX); T2(d, 700, 580 + dy, '"… WHERE teil = ?", (eingabe,)', M(20), CODE_T, "lm"); T2(d, 700, 612 + dy, "sicher", F(22, 700), CODE_G, "lm")
    f.el(show(t, ct(2) + 0.3), zwei, dy=dyf(t, ct(2) + 0.3))

# ---------------------------------------------------------------- 2 Programmablaufplan
def build_pap():
    D = Dia(19); N = D.node
    for k, kind, txt in (("s", "term", "Start"), ("db", "proc", "Datenbank öffnen"), ("tab", "proc", "Tabelle anlegen"), ("ins", "proc", "5 Aufträge eintragen"), ("cm", "proc", "commit"),
                         ("q1", "proc", "offene Aufträge von D2 abfragen"), ("w1", "dec", "weiterer Treffer?"), ("o1", "io", "Auftrag ausgeben"),
                         ("q2", "proc", "Summe je Maschine abfragen"), ("o2", "io", "Summe ausgeben"), ("inj", "proc", "Eingabe per f-String einbauen"), ("o3", "io", "Treffer ausgeben"),
                         ("q4", "proc", "Eingabe per ? übergeben"), ("o4", "io", "Treffer ausgeben"), ("cl", "proc", "Datenbank schließen"), ("end", "term", "Ende")):
        N(k, kind, txt, 0, 0)
    n = D.nodes; YA, YB, YC, YD = 44, 166, 288, 410
    def row(keys, y, x0, gap=46):
        x = x0
        for k in keys: n[k].cx = x + n[k].w / 2; n[k].cy = y; x += n[k].w + gap
    row(("s", "db", "tab", "ins", "cm"), YA, 30); row(("q1", "w1", "o1"), YB, 30, 64); row(("q2", "o2", "inj", "o3"), YC, 30); row(("q4", "o4", "cl", "end"), YD, 30)
    E = D.edge
    for a, b in (("s", "db"), ("db", "tab"), ("tab", "ins"), ("ins", "cm")): E(f"{a}-{b}", a, "r", b, "l")
    E("cm-q1", "cm", "b", "q1", "t")
    E("q1-w1", "q1", "r", "w1", "l"); E("w1-o1", "w1", "r", "o1", "l", label="ja")
    yt = YB - 56
    E("o1-w1", "o1", "t", "w1", "t", via=[(n["o1"].cx, yt), (n["w1"].cx, yt)])
    E("w1-q2", "w1", "b", "q2", "t", label="nein")
    E("q2-o2", "q2", "r", "o2", "l"); E("o2-inj", "o2", "r", "inj", "l"); E("inj-o3", "inj", "r", "o3", "l")
    E("o3-q4", "o3", "b", "q4", "t")
    E("q4-o4", "q4", "r", "o4", "l"); E("o4-cl", "o4", "r", "cl", "l"); E("cl-end", "cl", "r", "end", "l")
    return D
PAP = build_pap()
PGROUPS = [["s", "s-db", "db", "db-tab", "tab", "tab-ins", "ins", "ins-cm", "cm"],
           ["cm-q1", "q1", "q1-w1", "w1", "w1-o1", "o1", "o1-w1"],
           ["w1-q2", "q2", "q2-o2", "o2"],
           ["o2-inj", "inj", "inj-o3", "o3", "o3-q4", "q4", "q4-o4", "o4", "o4-cl", "cl", "cl-end", "end"]]
_bb = PAP.bbox(); PW, PH = _bb[2] - _bb[0], _bb[3] - _bb[1]
PBOX = (60, 104, 1160, 580); PZOOM = min(1.12, (PBOX[2] - 20) / PW, (PBOX[3] - 20) / PH)
PCAM = (_bb[0] - (PBOX[2] / PZOOM - PW) / 2, _bb[1] - (PBOX[3] / PZOOM - PH) / 2)

def sc2(f, t, ct):
    heading(f, t, "Der Plan: anlegen, abfragen, vergleichen")
    tm = {}
    for g, keys in enumerate(PGROUPS):
        for i, k in enumerate(keys): tm[k] = ct(g) + 0.3 + i * 0.4
    cur = max([g for g in range(4) if t >= ct(g)] or [0])
    hl = {k: PAL[cur] for k in PGROUPS[cur]}
    pap_view(f, ap(t, 0.2, 0.3), PAP, PBOX, PCAM, vis=reveal(t, tm), zoom=PZOOM, hl=hl)

# ---------------------------------------------------------------- 3 Zeilen 4 bis 24
def sc3(f, t, ct):
    heading(f, t, "Datenbank und Tabelle: Zeilen 4 bis 24")
    times = [1e9] * 21
    put(times, (0, 2, 3), ct(0) + 0.2, 4); put(times, tuple(range(4, 11)), ct(1) + 0.2, 4); put(times, tuple(range(12, 19)), ct(2) + 0.2, 4); put(times, (19, 20), ct(3) + 0.2, 4)
    # Zeilen 5 und 15 sind leer: Zeit wie Nachbarzeile, damit die Nummern erscheinen
    times[1] = times[0]; times[11] = times[10]
    hl = hl_at(t, [(0, None), (ct(0), {0, 2, 3}), (ct(1), set(range(4, 11))), (ct(2), set(range(12, 19))), (ct(3), {19, 20})])
    code_scene(f, t, 4, 24, 16, 24, 60, 106, 840, hl, times)
    X, W_ = 920, 300
    tile(f, t, ct(0) + 0.3, X, 112, W_, 96, "db und cur", ["Verbindung und Cursor"], DARK, bigsize=26)
    tile(f, t, ct(1) + 0.3, X, 222, W_, 118, "Schema", ["nr = Primärschlüssel", "menge = ganze Zahl"], DARK, bigsize=26)
    tile(f, t, ct(2) + 0.3, X, 354, W_, 96, "Liste", ["fünf Tupel, eins je Auftrag"], DARK, bigsize=26)
    def fin(d, dy):
        card(d, X, 464 + dy, W_, 150); T2(d, X + 28, 474 + dy, "executemany", M(21, True), DARK, "la"); T2(d, X + 28, 506 + dy, "5 Fragezeichen je Zeile", F(21, 600), GREY, "la")
        a = ap(t, ct(3) + 2.2, 0.4)
        if a > 0: chip(d, X + 28, 548 + dy, 244, 48, "5 Zeilen gespeichert", mix(WHITE, LIGHTG, a), mix(WHITE, GREEN, a), 22, outl=GREEN)
    f.el(show(t, ct(3) + 0.3), fin, dy=dyf(t, ct(3) + 0.3))

# ---------------------------------------------------------------- 4 Zeilen 26 bis 31
def sc4(f, t, ct):
    heading(f, t, "Offene Aufträge von D2: Zeilen 26 bis 31")
    times = [1e9] * 6
    put(times, (0, 1), ct(0) + 0.2, 26); put(times, (2, 3), ct(1) + 0.2, 26, gap=0.05); put(times, (4, 5), ct(2) + 0.2, 26)
    hl = hl_at(t, [(0, None), (ct(0), {1}), (ct(1), {2, 3}), (ct(2), {4, 5})])
    code_scene(f, t, 26, 31, 19, 30, 60, 106, 1160, hl, times)
    ents = [(ct(2) + 1.8, [(OUT[0], CODE_T)]), (ct(2) + 3.0, [(OUT[1], CODE_T)])]
    f.el(show(t, ct(2) + 0.6), lambda d, dy: console_panel(d, 60, 372 + dy, 520, 46 + 2 * 36 + 14, ents, t, 21, title="Ausgabe", lh=36), dy=dyf(t, ct(2) + 0.6))
    # Tabelle mit Filter
    drop_f1 = ap(t, ct(1) + 1.2, 0.6); drop_fert = ap(t, ct(1) + 3.4, 0.6)
    rowa = [1.0, 1 - 0.8 * drop_f1, 1.0, 1 - 0.8 * drop_fert, 1 - 0.8 * drop_f1]
    keep = ap(t, ct(3) + 0.3, 0.5)
    fills = {0: mix(WHITE, LIGHTG, keep), 2: mix(WHITE, LIGHTG, keep)}
    f.el(show(t, ct(1) + 0.4), lambda d, dy: auftrags_tabelle(d, 620, 372 + dy, [1] * 5, rh=34, size=18, colw=SW, row_a=rowa, fill_row=fills), dy=dyf(t, ct(1) + 0.4))
    f.el(show(t, ct(1) + 1.2), lambda d, dy: tag(d, 620, 590 + dy, 230, 34, "maschine = 'D2'", LIGHTB, BLUE, 20, outl=BLUE), dy=dyf(t, ct(1) + 1.2))
    f.el(show(t, ct(1) + 3.4), lambda d, dy: tag(d, 870, 590 + dy, 250, 34, "status != 'fertig'", LIGHTA, AMB, 20, outl=AMB), dy=dyf(t, ct(1) + 3.4))
    def werte(d, dy):
        card(d, 60, 548 + dy, 520, 120); T2(d, 88, 558 + dy, "Die zwei Fragezeichen", F(24, 700), DARK, "la")
        chip(d, 88, 600 + dy, 220, 48, "1. ? = 'D2'", LIGHTB, BLUE, 22, mono=True); chip(d, 322, 600 + dy, 240, 48, "2. ? = 'fertig'", LIGHTA, AMB, 22, mono=True)
    f.el(show(t, ct(1) + 0.4), werte, dy=dyf(t, ct(1) + 0.4))
    f.el(show(t, ct(2) + 0.2), lambda d, dy: tag(d, 620, 632 + dy, 500, 34, "nr, teil, menge = ein Tupel entpackt", LIGHTK, GREY, 20), dy=dyf(t, ct(2) + 0.2))

# ---------------------------------------------------------------- 5 Zeilen 33 bis 35
def sc5(f, t, ct):
    heading(f, t, "Summe je Maschine: Zeilen 33 bis 35")
    times = [1e9] * 3
    put(times, (1, 2), ct(0) + 0.2, 33); times[0] = times[1]
    hl = hl_at(t, [(0, None), (ct(0), {1}), (ct(2), {2})])
    code_scene(f, t, 33, 35, 19, 30, 60, 106, 1160, hl, times)
    BX = {"D2": 440, "F1": 800}
    def bins(d, dy):
        for nm in ("D2", "F1"):
            x = BX[nm]; d.rounded_rectangle((x - 16, 288 + dy, x + 310, 566 + dy), 14, fill=WHITE, outline=LINE, width=2); T2(d, x, 298 + dy, f"Fach {nm}", F(26, 700), DARK, "la")
    f.el(show(t, ct(0) + 0.3), bins, dy=dyf(t, ct(0) + 0.3))
    def chips(d, dy):
        sl = {"D2": 0, "F1": 0}
        for i, r in enumerate(ROWS):
            m = r[2]; k = sl[m]; sl[m] += 1
            sx, sy = 60, 300 + i * 52; tx, ty = BX[m], 340 + k * 52
            a = ap(t, ct(0) + 0.5 + 0.2 * i, 0.4); p = ap(t, ct(0) + 1.6 + 0.4 * i, 0.9)
            if a <= 0: continue
            x = lerp(sx, tx, p); y = lerp(sy, ty, p)
            d.rounded_rectangle((x, y + dy, x + 270, y + 44 + dy), 10, fill=mix(WHITE, LIGHTB if m == "D2" else LIGHTA, a), outline=mix(WHITE, BLUE if m == "D2" else AMB, a), width=2)
            T2(d, x + 14, y + 22 + dy, str(r[0]), M(21, True), mix(WHITE, DARK, a), "lm"); T2(d, x + 84, y + 22 + dy, m, M(21), mix(WHITE, DARK, a), "lm"); T2(d, x + 256, y + 22 + dy, str(r[3]), M(21, True), mix(WHITE, DARK, a), "rm")
    f.el(1.0, chips)
    def sums(d, dy):
        for nm, s in (("D2", "500 + 300 + 800 = 1600"), ("F1", "120 + 60 = 180")):
            T2(d, BX[nm], 536 + dy, "SUM:", F(21, 700), GREY, "lm"); T2(d, BX[nm] + 56, 536 + dy, s, F(23, 700), GREEN, "lm")
    f.el(show(t, ct(1) + 0.3), sums, dy=dyf(t, ct(1) + 0.3))
    ents = [(ct(2) + 0.4, [(OUT[2], CODE_T)])]
    f.el(show(t, ct(2) + 0.2), lambda d, dy: console_panel(d, 60, 590 + dy, 700, 46 + 34 + 12, ents, t, 21, title="Ausgabe", lh=34), dy=dyf(t, ct(2) + 0.2))
    f.el(show(t, ct(2) + 1.8), lambda d, dy: tag(d, 800, 606 + dy, 330, 44, "5 Zeilen werden zu 2 Zeilen", LIGHTG, GREEN, 22, outl=GREEN), dy=dyf(t, ct(2) + 1.8))

# ---------------------------------------------------------------- 6 Zeilen 37 bis 45
def sc6(f, t, ct):
    heading(f, t, "f-String gegen Platzhalter: Zeilen 37 bis 45")
    times = [1e9] * 9
    put(times, (0, 1), ct(0) + 0.2, 37); put(times, (2, 3, 4, 5), ct(1) + 0.2, 37, gap=0.05); put(times, (6, 7, 8), ct(2) + 0.2, 37)
    hl = hl_at(t, [(0, None), (ct(0), {1}), (ct(1), {2, 3, 4}), (ct(2), {6, 7, 8}), (ct(3), {1, 2, 3, 4, 6, 7, 8})])
    code_scene(f, t, 37, 45, 17, 26, 60, 106, 840, hl, times)
    ents = [(ct(1) + 3.0, [(OUT[3], CODE_R)]), (ct(2) + 2.2, [(OUT[4], CODE_G)])]
    f.el(show(t, ct(1) + 2.8), lambda d, dy: console_panel(d, 60, 424 + dy, 840, 46 + 2 * 36 + 14, ents, t, 22, title="Ausgabe", lh=36), dy=dyf(t, ct(1) + 2.8))
    X = 920
    def ca(d, dy):
        card(d, X, 112 + dy, 300, 186, stripe=False); d.rectangle((X, 112 + dy, X + 8, 298 + dy), fill=RED)
        T2(d, X + 28, 122 + dy, "f-String", F(26, 700), RED, "la"); T2(d, X + 28, 160 + dy, "… WHERE teil =", M(17), GREY, "la")
        fm = M(19, True); s = "'x' OR '1'='1'"; x = X + 28
        for tx, col in sql_hl(s):
            d.text((x, 186 + dy), tx, font=fm, fill=col); x += fm.getlength(tx)
        T2(d, X + 28, 226 + dy, "OR ist jetzt SQL-Code", F(21, 600), RED, "la"); T2(d, X + 28, 250 + dy, "5 Treffer", F(21, 700), RED, "la")
    f.el(show(t, ct(1) + 0.3), ca, dy=dyf(t, ct(1) + 0.3))
    def cb(d, dy):
        card(d, X, 312 + dy, 300, 186, stripe=False); d.rectangle((X, 312 + dy, X + 8, 498 + dy), fill=GREEN)
        T2(d, X + 28, 322 + dy, "Platzhalter", F(26, 700), GREEN, "la"); T2(d, X + 28, 360 + dy, "… WHERE teil = ?", M(17), GREY, "la")
        chip(d, X + 28, 388 + dy, 244, 36, "x' OR '1'='1", LIGHTA, AMB, 19, mono=True); T2(d, X + 28, 436 + dy, "nur Daten", F(21, 600), GREEN, "la"); T2(d, X + 28, 462 + dy, "0 Treffer", F(21, 700), GREEN, "la")
    f.el(show(t, ct(2) + 0.3), cb, dy=dyf(t, ct(2) + 0.3))
    def merk(d, dy):
        card(d, 60, 584 + dy, 1160, 92); T2(d, 90, 594 + dy, "Merke", F(26, 700), RED, "la")
        T2(d, 90, 640 + dy, "Daten nie in den SQL-Text kleben. Immer ? und ein Tupel.", F(30, 700), DARK, "lm")
    f.el(show(t, ct(3) + 0.1), merk, dy=dyf(t, ct(3) + 0.1))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V19 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vorgerechnet", F(104, 700), DARK)
        T2(d, 90, 290, "Fertigungszelle FZ-3: Aufträge abfragen", F(48, 400), GREY)
        code_n(d, 90, 380, 790, CODE[25:31], nums(26, 31), [-1] * 6, 9, 15, 25, {2, 3})
        for k, s in enumerate((OUT[0], OUT[1])):
            chip(d, 920, 392 + k * 56, 290, 46, s.split(":")[0] + ": " + s.split()[2] + " Stück", LIGHTG, GREEN, 22, outl=GREEN)
        chip(d, 920, 506, 290, 46, "D2 1600 · F1 180", LIGHTB, BLUE, 22)
        chip(d, 920, 562, 290, 46, "f-String: 5 Treffer", LIGHTR, RED, 22, outl=RED)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
