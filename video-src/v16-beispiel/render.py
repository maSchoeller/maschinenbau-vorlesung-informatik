"""V16 Vorgerechnet: Log-Dateien der Fertigungszelle FZ-3 durchsuchen (Code exakt aus briefing/v16-beispiel.py, Daten aus zelle.zip).
Aufruf: python render.py [text|probe [Ordner]|zeiten|scan|stills t1 t2..|full|mux]   (Vertonung vorher: python ../v16-common/tts_run.py v16-beispiel)"""
import os, sys, math, zipfile
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v16-common"))
from bausteine import *
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from pap import Dia, pap_view, reveal, PAL
from texte import SRC

NAME = "v16-beispiel"; LABEL = "DHBW · Informatik · V16 · Vorgerechnetes Beispiel"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Code und echte Daten
CODE = open(os.path.join(HERE, "..", "..", "briefing", "v16-beispiel.py"), encoding="utf-8").read().rstrip("\n").split("\n")
assert len(CODE) == 32 and CODE[4] == "import time" and CODE[13].startswith("for log in sorted") and CODE[23].lstrip().startswith("fehler_je_maschine[maschine].append") and CODE[31].startswith("print(f\"Suche")
ZIP = zipfile.ZipFile(os.path.join(HERE, "..", "..", "site", "assets", "data", "v16", "zelle.zip"))
LOGS = sorted(n for n in ZIP.namelist() if n.endswith(".log"))          # Linux-Reihenfolge (nach Zeichencode)
GROESSE = sum(ZIP.getinfo(n).file_size for n in LOGS)
FEHLER = {}
for n in LOGS:
    maschine = n.split("/")[2]
    for zeile in ZIP.read(n).decode("utf-8").splitlines():
        teile = zeile.strip().split(";")
        if teile[1] == "ERROR": FEHLER.setdefault(maschine, []).append(n.split("/")[-1][:-4] + " " + teile[0][11:] + " " + teile[2])
assert len(LOGS) == 20 and f"{GROESSE / 1024:.1f}" == "47.2"
assert {m: len(v) for m, v in FEHLER.items()} == {"D2": 5, "F1": 4, "M1": 11, "R1": 7}
assert FEHLER["D2"][0] == "2026-11-16 11:22:00 Kuehlmitteldruck zu niedrig" and FEHLER["R1"][0] == "2026-11-16 09:02:27 Not-Halt ausgeloest"
D2LOG = ZIP.read("zelle/maschinen/D2/logs/2026-11-16.log").decode("utf-8").splitlines()
ERR_ZEILE = "2026-11-16 11:22:00;ERROR;Kuehlmitteldruck zu niedrig"
assert ERR_ZEILE in D2LOG


def code_scene(f, t, a, b, size, lh, x, y, w, hl, times, alpha_t=0.0):
    lines = CODE[a - 1:b]; nums = list(range(a, b + 1))
    f.el(ap(t, alpha_t, 0.3), lambda d, dy: code_n(d, x, y + dy, w, lines, nums, times, t, size, lh, hl, title="Python (briefing/v16-beispiel.py)"))

def put(times, idxs, start, a, cps=55):
    c = start
    for i in idxs:
        times[i - a] = c; c += max(len(CODE[i - 1]), 4) / cps + 0.1

# ---------------------------------------------------------------- 1 Aufgabe und Zelle
def sc1(f, t, ct):
    heading(f, t, "Fertigungszelle FZ-3: die Logs durchsuchen")
    def logc(d, dy):
        card(d, 60, 112 + dy, 700, 258)
        T2(d, 90, 124 + dy, "maschinen/D2/logs/2026-11-16.log", F(24, 700), DARK, "la")
        d.rounded_rectangle((84, 164 + dy, 736, 330 + dy), 10, fill=BOX)
        mono = M(18)
        for k, ln in enumerate((D2LOG[0], D2LOG[1], D2LOG[2], ERR_ZEILE)):
            col = CODE_R if "ERROR" in ln else CODE_T
            fit(ln, mono, 640, "Log"); T2(d, 98, 188 + dy + k * 36, ln, mono, col, "lm")
    f.el(show(t, 0.3), logc, dy=dyf(t, 0.3))
    def fmt(d, dy):
        mono = M(18); first = D2LOG[0]; x = 98
        parts = [first.split(";")[0], first.split(";")[1], first.split(";")[2]]
        # Markierung der drei Teile in der ersten Zeile
        w0 = mono.getlength(parts[0]); w1 = mono.getlength(";" + parts[1])
        a = ap(t, ct(1) + 0.4, 0.4)
        if a > 0:
            for (x0, x1, txt, col, ln) in ((98, 98 + w0, "Zeit", BLUE, 0), (98 + w0, 98 + w0 + w1, "Stufe", AMBER, 0), (98 + w0 + w1, 98 + mono.getlength(first), "Meldung", GREEN, 0)):
                c = mix(BOX, col, a); d.line((x0 + 2, 205 + dy, x1 - 2, 205 + dy), fill=c, width=3)
        for (xx, txt, col) in ((98, "Zeit", BLUE), (98 + w0 + 6, "Stufe", AMBER), (98 + w0 + w1 + 40, "Meldung", GREEN)):
            al = ap(t, ct(1) + 0.8, 0.4)
            if al > 0: T2(d, xx, 344 + dy, txt, F(22, 700), mix(WHITE, col, al), "lm")
    f.el(1, fmt)
    # Halle
    def hall(d, dy):
        d.rounded_rectangle((800, 112 + dy, 1220, 370 + dy), 16, fill=WHITE, outline=DARK, width=3)
        T2(d, 1010, 122 + dy, "Halle 2: Zelle FZ-3", F(22, 700), GREY, "ma")
        items = [("D2", "Drehen", 820, 156, LIGHTB, BLUE), ("F1", "Fräsen", 1020, 156, LIGHTG, GREEN), ("R1", "Roboter", 820, 262, LIGHTA, AMB), ("M1", "Messen", 1020, 262, LIGHTR, RED)]
        for nm, sub, x, y, fill, col in items:
            d.rounded_rectangle((x, y + dy, x + 180, y + 90 + dy), 12, fill=fill, outline=col, width=3)
            T2(d, x + 90, y + 32 + dy, nm, F(34, 700), col, "mm"); T2(d, x + 90, y + 66 + dy, sub, F(22, 600), DARK, "mm")
    f.el(show(t, ct(0) + 0.2), hall, dy=dyf(t, ct(0) + 0.2))
    # Fragen
    qs = ["Fehler je Maschine?", "Welcher Fehler kam zuerst?", "Größe der Logs, NC-Programme"]
    for k, q in enumerate(qs):
        tin = ct(2) + 0.3 + 1.6 * k
        def qq(d, dy, k=k, q=q):
            x = 60 + k * 396; d.rounded_rectangle((x, 420 + dy, x + 376, 560 + dy), 14, fill=WHITE, outline=LINE, width=2)
            d.ellipse((x + 16, 436 + dy, x + 56, 476 + dy), fill=RED); T2(d, x + 36, 456 + dy, str(k + 1), F(26, 700), WHITE, "mm")
            ls = [["Wie viele Fehler", "je Maschine?"], ["Welcher Fehler", "kam zuerst?"], ["Größe der Logs,", "NC-Programme"]][k]
            for i, ln in enumerate(ls): T2(d, x + 24, 498 + dy + i * 34, ln, F(28, 700), DARK, "la")
        f.el(show(t, tin), qq, dy=dyf(t, tin))
    f.el(show(t, ct(2) + 5.5), lambda d, dy: tag(d, 60, 590 + dy, 1160, 56, "Fehler zählen, Größe summieren, NC-Programme auflisten", RED, WHITE, 30), dy=dyf(t, ct(2) + 5.5))

# ---------------------------------------------------------------- 2 Programmablaufplan
def build_pap():
    D = Dia(20); N = D.node
    N("s", "term", "Start", 0, 0); N("ini", "proc", "Zähler und Fehlerliste anlegen", 0, 0)
    N("w1", "dec", "weitere Log-Datei?", 0, 0); N("b1", "proc", "Datei zählen, Größe addieren", 0, 0)
    N("w2", "dec", "weitere Zeile?", 0, 0); N("dc", "dec", "Stufe == ERROR?", 0, 0)
    N("b2", "proc", "Fehler bei der Maschine merken", 0, 0)
    N("out", "io", "Dateien, Größe, Fehler ausgeben", 0, 0); N("nc", "io", "NC-Programme, Laufzeit ausgeben", 0, 0); N("end", "term", "Ende", 0, 0)
    n = D.nodes; A = 300; B = 700; C = 1010
    Y = [40, 140, 245, 345, 445, 545]
    n["s"].cx, n["s"].cy = 110, Y[0]; n["ini"].cx, n["ini"].cy = 420, Y[0]
    n["w1"].cx, n["w1"].cy = A, Y[1]; n["b1"].cx, n["b1"].cy = B, Y[1]
    n["w2"].cx, n["w2"].cy = B, Y[2]; n["dc"].cx, n["dc"].cy = B, Y[3]; n["b2"].cx, n["b2"].cy = B, Y[4]
    n["out"].cx, n["out"].cy = A, Y[5]; n["nc"].cx, n["nc"].cy = 700, Y[5]; n["end"].cx, n["end"].cy = 1010, Y[5]
    E = D.edge
    yb = 95; ym = (n["b1"].bbox()[3] + n["w2"].bbox()[1]) / 2
    E("s-ini", "s", "r", "ini", "l")
    E("ini-w1", "ini", "b", "w1", "t", via=[(420, yb), (A, yb)])
    E("w1-b1", "w1", "r", "b1", "l", label="ja")
    E("b1-w2", "b1", "b", "w2", "t")
    E("w2-dc", "w2", "b", "dc", "t", label="ja")
    E("dc-b2", "dc", "b", "b2", "t", label="ja")
    E("dc-ret", "dc", "r", (B, ym), None, via=[(C, Y[3]), (C, ym)], label="nein")
    E("b2-ret", "b2", "r", (C, Y[3]), None, via=[(C, Y[4])])
    E("w2-ret", "w2", "l", (A, yb), None, via=[(110, Y[2]), (110, yb)], label="nein")
    E("w1-out", "w1", "b", "out", "t", label="nein")
    E("out-nc", "out", "r", "nc", "l"); E("nc-end", "nc", "r", "end", "l")
    return D
PAP = build_pap()
PGROUPS = [["s", "s-ini", "ini", "ini-w1", "w1", "w1-b1", "b1"],
           ["b1-w2", "w2", "w2-dc", "dc"],
           ["dc-b2", "b2", "b2-ret", "dc-ret", "w2-ret", "w1-out", "out", "out-nc", "nc", "nc-end", "end"],
           []]
_bb = PAP.bbox(); PW, PH = _bb[2] - _bb[0], _bb[3] - _bb[1]
PBOX = (60, 104, 1160, 580); PZOOM = min(1.1, (PBOX[2] - 20) / PW, (PBOX[3] - 20) / PH)
PCAM = (_bb[0] - (PBOX[2] / PZOOM - PW) / 2, _bb[1] - (PBOX[3] / PZOOM - PH) / 2)

def sc2(f, t, ct):
    heading(f, t, "Der Plan: zwei Schleifen ineinander")
    tm = {}
    for g, keys in enumerate(PGROUPS):
        for i, k in enumerate(keys): tm[k] = ct(g) + 0.3 + i * (0.55 if g < 2 else 0.5)
    cur = max([g for g in range(4) if t >= ct(g)] or [0])
    if cur < 3: hl = {k: PAL[cur] for k in PGROUPS[cur]}
    else: hl = {"dc": PAL[3], "w1": PAL[0], "w2": PAL[1]}
    pap_view(f, ap(t, 0.2, 0.3), PAP, PBOX, PCAM, vis=reveal(t, tm), zoom=PZOOM, hl=hl)
    f.el(show(t, ct(3) + 0.3), lambda d, dy: tag(d, 700, 112 + dy, 520, 46, "Raute: gut tausendmal geprüft", LIGHTR, RED, 28, 700, outl=RED), dy=dyf(t, ct(3) + 0.3))

# ---------------------------------------------------------------- 3 Zeilen 5 bis 16
def sc3(f, t, ct):
    heading(f, t, "Start und Suche: Zeilen 5 bis 16")
    a, b = 5, 16; times = [1e9] * (b - a + 1)
    put(times, [5, 6], ct(0) + 0.2, a); put(times, [8, 9], ct(0) + 1.8, a); put(times, [11, 12, 13], ct(1) + 0.2, a); put(times, [14], ct(2) + 0.2, a); put(times, [15, 16], ct(3) + 0.2, a)
    hl = hl_at(t, [(0, None), (ct(0), {0, 1, 3, 4}), (ct(1), {6, 7, 8}), (ct(2), {9}), (ct(3), {10, 11})])
    code_scene(f, t, a, b, 20, 30, 60, 112, 730, hl, times)
    X = 820; W_ = 400
    def k0(d, dy):
        card(d, X, 112 + dy, W_, 150)
        T2(d, X + 28, 124 + dy, "Stoppuhr und Ordner", F(26, 700), DARK, "la")
        chip(d, X + 28, 166 + dy, 344, 40, "start = perf_counter()", LIGHTB, BLUE, 22, mono=True)
        chip(d, X + 28, 212 + dy, 344, 40, 'zelle = Path("zelle")', LIGHTA, AMB, 22, mono=True)
    f.el(show(t, ct(0) + 0.2, ct(1) + 0.3), k0, dy=dyf(t, ct(0) + 0.2))
    def k1(d, dy):
        card(d, X, 112 + dy, W_, 230)
        T2(d, X + 28, 124 + dy, "Drei Startwerte", F(26, 700), DARK, "la")
        for k, (nm, val) in enumerate((("fehler_je_maschine", "{ }"), ("anzahl_dateien", "0"), ("groesse", "0"))):
            y = 168 + k * 54; d.rounded_rectangle((X + 28, y + dy, X + 372, y + 44 + dy), 10, fill=WHITE, outline=LINE, width=2)
            T2(d, X + 42, y + 22 + dy, nm, M(18, True), GREY, "lm"); T2(d, X + 356, y + 22 + dy, val, M(24, True), DARK, "rm")
    f.el(show(t, ct(1) + 0.2), k1, dy=dyf(t, ct(1) + 0.2))
    def k2(d, dy):
        card(d, X, 360 + dy, W_, 250)
        T2(d, X + 28, 372 + dy, "sorted(zelle.glob(...))", M(22, True), DARK, "la")
        names = [n.split("/", 1)[1] for n in LOGS[:3]]
        for k, nm in enumerate(names):
            al = ap(t, ct(2) + 1.0 + 0.6 * k, 0.35)
            if al > 0: T2(d, X + 28, 420 + k * 34 + dy, nm.replace("maschinen/", ""), M(18), mix(WHITE, DARK, al), "la")
        al = ap(t, ct(2) + 3.0, 0.4)
        if al > 0:
            T2(d, X + 28, 524 + dy, "...", M(22), mix(WHITE, GREY, al), "la")
            tag(d, X + 28, 560 + dy, 220, 36, "20 Stück", GREEN, WHITE, 24)
    f.el(show(t, ct(2) + 0.2), k2, dy=dyf(t, ct(2) + 0.2))
    def k3(d, dy):
        card(d, X, 112 + dy, W_, 230, fill=WHITE)
        T2(d, X + 28, 124 + dy, "Erste Datei, D2 vom 16.11.", F(24, 700), DARK, "la")
        a1 = ap(t, ct(3) + 1.0, 0.4); a2 = ap(t, ct(3) + 2.2, 0.4)
        T2(d, X + 28, 172 + dy, "anzahl_dateien", M(20, True), GREY, "la"); T2(d, X + 372, 172 + dy, "0 → 1", M(26, True), mix(WHITE, GREEN, a1), "ra")
        T2(d, X + 28, 218 + dy, "groesse", M(20, True), GREY, "la"); T2(d, X + 372, 218 + dy, "0 → 2437", M(26, True), mix(WHITE, BLUE, a2), "ra")
        T2(d, X + 28, 272 + dy, "Bytes der Datei: stat().st_size", F(22, 400), GREY, "la")
    f.el(show(t, ct(3) + 0.2), k3, dy=dyf(t, ct(3) + 0.2))

# ---------------------------------------------------------------- 4 Zeilen 17 bis 24 (Teil 1)
def sc4(f, t, ct):
    heading(f, t, "Zeile für Zeile: Zeilen 17 bis 24")
    a, b = 17, 24; times = [1e9] * (b - a + 1)
    put(times, [17], ct(0) + 0.2, a); put(times, [18, 19], ct(1) + 0.2, a); put(times, [20, 21], ct(2) + 0.2, a); put(times, [22, 23, 24], ct(3) + 0.2, a)
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {1, 2}), (ct(2), {3, 4}), (ct(3), {5, 6, 7})])
    code_scene(f, t, a, b, 19, 30, 60, 112, 1160, hl, times)
    Y0 = 440
    # ct0: Pfad
    def p0(d, dy):
        names = ["zelle", "maschinen", "D2", "logs", "2026-11-16.log"]; x = 80; xs = []
        for k, nm in enumerate(names):
            w = chip_w(nm, 24, 14, True); on = k == 4
            chip(d, x, Y0 + 40 + dy, w, 48, nm, LIGHTB if on else WHITE, BLUE if on else DARK, 24, mono=True); xs.append((x, w)); x += w + 40
            if k < 4: T2(d, x - 20, Y0 + 64 + dy, "/", F(28, 700), GREY, "mm")
        a1 = ap(t, ct(0) + 1.5, 0.4); a2 = ap(t, ct(0) + 3.0, 0.4)
        lx, lw = xs[4]; mx = xs[3][0] + xs[3][1] / 2; dx = xs[2][0] + xs[2][1] / 2
        if a1 > 0:
            col = mix(WHITE, GREEN, a1); arrow(d, lx + lw / 2, Y0 + 98 + dy, mx + 10, Y0 + 130 + dy, col, 4, 11); T2(d, (lx + mx) / 2 + 40, Y0 + 122 + dy, ".parent", M(22, True), col, "mm")
        if a2 > 0:
            col = mix(WHITE, GREEN, a2); arrow(d, mx - 10, Y0 + 98 + dy, dx + 10, Y0 + 130 + dy, col, 4, 11); T2(d, (mx + dx) / 2, Y0 + 150 + dy, ".parent", M(22, True), col, "mm")
        a3 = ap(t, ct(0) + 4.4, 0.4)
        if a3 > 0:
            d.rounded_rectangle((xs[2][0] - 6, Y0 + 34 + dy, xs[2][0] + xs[2][1] + 6, Y0 + 94 + dy), 12, outline=mix(WHITE, RED, a3), width=4)
            tag(d, 760, Y0 + 150 + dy, 460, 44, "maschine = D2 (aus .name)", RED, WHITE, 26)
    f.el(show(t, ct(0) + 0.2, ct(1) - 0.1), p0, dy=dyf(t, ct(0) + 0.2))
    # ct1: Datei zeilenweise
    def p1(d, dy):
        T2(d, 80, Y0 + 20 + dy, "with open(log, ...) as datei", M(24, True), DARK, "la")
        for k, ln in enumerate(D2LOG[:4]):
            al = ap(t, ct(1) + 1.2 + 0.9 * k, 0.35)
            if al > 0:
                on = t < ct(1) + 1.2 + 0.9 * (k + 1)
                d.rounded_rectangle((80, Y0 + 66 + k * 38 + dy, 900, Y0 + 98 + k * 38 + dy), 8, fill=mix(WHITE, LIGHTR if on else WHITE, al), outline=mix(WHITE, RED if on else LINE, al), width=2)
                fit(ln, M(18), 780, "Zeile"); T2(d, 96, Y0 + 82 + k * 38 + dy, ln, M(18), mix(WHITE, DARK, al), "lm")
        T2(d, 930, Y0 + 100 + dy, "zeile", M(26, True), RED, "lm"); T2(d, 930, Y0 + 138 + dy, "eine nach der anderen", F(22, 400), GREY, "lm")
    f.el(show(t, ct(1) + 0.2, ct(2) - 0.1), p1, dy=dyf(t, ct(1) + 0.2))
    # ct2: zerlegen
    def p2(d, dy):
        z = ERR_ZEILE.split(";"); x = 80; cols = [BLUE, AMBER, GREEN]
        T2(d, 80, Y0 + 14 + dy, "zeile.strip().split(\";\")", M(24, True), DARK, "la")
        for k, part in enumerate(z):
            al = ap(t, ct(2) + 1.0 + 1.0 * k, 0.4)
            if al <= 0: continue
            w = chip_w(part, 24, 14) + 12
            fillc = [LIGHTB, LIGHTA, LIGHTG][k]; colc = [BLUE, AMB, GREEN][k]
            chip(d, x, Y0 + 64 + dy, w, 56, part, mix(WHITE, fillc, al), mix(WHITE, colc, al), 24)
            T2(d, x + w / 2, Y0 + 138 + dy, f"teile[{k}]", M(22, True), mix(WHITE, colc, al), "mm"); x += w + 14
        al = ap(t, ct(2) + 4.2, 0.4)
        if al > 0: tag(d, 760, Y0 + 170 + dy, 460, 40, "Stufe: teile[1] == \"ERROR\"?", mix(WHITE, RED, al), WHITE, 24)
    f.el(show(t, ct(2) + 0.2, ct(3) - 0.1), p2, dy=dyf(t, ct(2) + 0.2))
    # ct3: Dictionary
    def p3(d, dy):
        T2(d, 80, Y0 + 14 + dy, "fehler_je_maschine", M(24, True), DARK, "la")
        d.rounded_rectangle((80, Y0 + 54 + dy, 1200, Y0 + 190 + dy), 12, fill=WHITE, outline=LINE, width=2)
        a1 = ap(t, ct(3) + 0.8, 0.4); a2 = ap(t, ct(3) + 2.4, 0.4)
        if a1 > 0:
            T2(d, 100, Y0 + 82 + dy, "\"D2\"", M(26, True), mix(WHITE, BLUE, a1), "lm"); T2(d, 190, Y0 + 82 + dy, "→  [ ]  leere Liste (wenn D2 neu ist)", F(24, 600), mix(WHITE, GREY, a1), "lm")
        if a2 > 0:
            fit(FEHLER["D2"][0], M(22), 1040, "Eintrag")
            T2(d, 100, Y0 + 134 + dy, "\"D2\"", M(26, True), mix(WHITE, BLUE, a2), "lm")
            T2(d, 190, Y0 + 134 + dy, "→  [ \"" + FEHLER["D2"][0] + "\" ]", M(20, True), mix(WHITE, DARK, a2), "lm")
    f.el(show(t, ct(3) + 0.2), p3, dy=dyf(t, ct(3) + 0.2))

# ---------------------------------------------------------------- 5 Zeile 24 bis 28 (Ausgabe)
def sc5(f, t, ct):
    heading(f, t, "Ausgabe: Zeilen 24 bis 28")
    a, b = 24, 28; times = [1e9] * (b - a + 1)
    put(times, [24], ct(0) + 0.2, a); put(times, [26], ct(1) + 0.2, a); put(times, [27, 28], ct(2) + 0.2, a)
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {2}), (ct(2), {3, 4}), (ct(3), {3, 4})])
    code_scene(f, t, a, b, 19, 30, 60, 112, 1160, hl, times)
    # ct0: Zusammensetzung des Eintrags
    def zs(d, dy):
        y = 350 + dy
        parts = [("log.stem", "2026-11-16", BLUE), ("teile[0][11:]", "11:22:00", AMB), ("teile[2]", "Kuehlmitteldruck zu niedrig", GREEN)]
        x = 60
        for k, (code, val, col) in enumerate(parts):
            al = ap(t, ct(0) + 0.8 + 1.4 * k, 0.4)
            if al <= 0: continue
            w = max(chip_w(val, 24, 14) + 12, chip_w(code, 22, 10, True)); fillc = [LIGHTB, LIGHTA, LIGHTG][k]
            T2(d, x + w / 2, y, code, M(22, True), mix(WHITE, col, al), "ma")
            chip(d, x, y + 40, w, 56, val, mix(WHITE, fillc, al), mix(WHITE, col, al), 24); x += w + 24
            if k < 2: T2(d, x - 12, y + 68, "+", F(32, 700), GREY, "mm")
        al = ap(t, ct(0) + 5.0, 0.4)
        if al > 0: T2(d, 60, y + 124, "ein Text mit Datum, Uhrzeit und Meldung, mit Leerzeichen dazwischen", F(24, 600), mix(WHITE, GREY, al), "la")
    f.el(show(t, ct(0) + 0.2, ct(1) - 0.1), zs, dy=dyf(t, ct(0) + 0.2))
    # Konsole
    ents = [(ct(1) + 1.0, [("20 Log-Dateien, zusammen 47.2 KiB", CODE_T)])]
    mono = M(20)
    for k, m in enumerate(("D2", "F1", "M1", "R1")):
        s = f"{m}: {len(FEHLER[m])} Fehler, zuerst: {FEHLER[m][0]}"; fit(s, mono, 1090, "Ausgabe")
        ents.append((ct(2) + 0.8 + 1.0 * k, [(s, CODE_R if (m == "M1" and t >= ct(3) + 0.5) else CODE_T)]))
    f.el(show(t, ct(1) + 0.3), lambda d, dy: console_panel(d, 60, 372 + dy, 1160, 200, ents, t, 20, title="Ausgabe (Browser)", lh=32), dy=dyf(t, ct(1) + 0.3))
    f.el(show(t, ct(1) + 1.6), lambda d, dy: T2(d, 60, 590 + dy, "groesse / 1024 = KiB, :.1f = eine Nachkommastelle", F(24, 600), GREY, "la"))
    f.el(show(t, ct(3) + 0.3), lambda d, dy: tag(d, 60, 626 + dy, 520, 44, "M1: 11 Fehler, die meisten", RED, WHITE, 26), dy=dyf(t, ct(3) + 0.3))
    f.el(show(t, ct(3) + 0.3), lambda d, dy: tag(d, 600, 626 + dy, 620, 44, "erst das Zählen zeigt es", LIGHTR, RED, 26, 700, outl=RED), dy=dyf(t, ct(3) + 0.6))

# ---------------------------------------------------------------- 6 NC, Reihenfolge, Zeit
def sc6(f, t, ct):
    heading(f, t, "NC-Programme und Zeit: Zeilen 30 bis 32")
    a, b = 30, 32; times = [1e9] * 3
    put(times, [30], ct(0) + 0.2, a); put(times, [31], ct(0) + 1.2, a); put(times, [32], ct(2) + 0.2, a)
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(2), {2}), (ct(3), None)])
    code_scene(f, t, a, b, 22, 34, 60, 112, 1160, hl, times)
    ents = [(ct(0) + 1.4, [("NC-Programme: ['FLANSCH_80.nc', 'WELLE_20H6.nc', 'WELLE_20H6_v1.nc']", CODE_T)])]
    f.el(show(t, ct(0) + 0.8), lambda d, dy: console_panel(d, 60, 290 + dy, 1160, 92, ents, t, 22, title="Ausgabe (Browser, Linux)", lh=34), dy=dyf(t, ct(0) + 0.8))
    def cmp(d, dy):
        for k, (ttl, order, col, fillc) in enumerate((("Browser (Linux)", ["FLANSCH_80.nc", "WELLE_20H6.nc", "WELLE_20H6_v1.nc"], GREEN, LIGHTG),
                                                      ("Windows (lokal)", ["WELLE_20H6_v1.nc", "FLANSCH_80.nc", "WELLE_20H6.nc"], RED, LIGHTR))):
            x = 60 + k * 590; d.rounded_rectangle((x, 398 + dy, x + 570, 508 + dy), 12, fill=fillc, outline=col, width=2)
            T2(d, x + 20, 408 + dy, ttl, F(22, 700), col, "la")
            for i, nm in enumerate(order):
                chip(d, x + 14 + i * 186, 446 + dy, 178, 44, nm, WHITE, DARK, 16, mono=True)
    f.el(show(t, ct(1) + 0.4), cmp, dy=dyf(t, ct(1) + 0.4))
    f.el(show(t, ct(1) + 3.0), lambda d, dy: T2(d, 640, 522 + dy, "Großbuchstaben vor Kleinbuchstaben: der Ordner alt steht in Linux hinten", F(22, 600), GREY, "ma"), dy=dyf(t, ct(1) + 3.0))
    # Zeit
    vals = ["11,8 ms", "9,7 ms", "10,4 ms"]
    for k, v in enumerate(vals):
        tin = ct(2) + 1.0 + 1.0 * k
        f.el(show(t, tin), lambda d, dy, k=k, v=v: chip(d, 60 + k * 200, 556 + dy, 188, 46, "Suche " + v, WHITE, DARK, 24), dy=dyf(t, tin))
    f.el(show(t, ct(2) + 4.2), lambda d, dy: tag(d, 670, 556 + dy, 550, 46, "schwankt von Lauf zu Lauf: mehrmals messen", LIGHTA, AMB, 24, 700, outl=AMBER), dy=dyf(t, ct(2) + 4.2))
    # Merke
    for k, txt in enumerate(("Pfade mit pathlib", "finden mit glob, ordnen mit sorted", "Laufzeit mit perf_counter")):
        tin = ct(3) + 0.3 + 1.6 * k; x = [60, 340, 810][k]; w = [260, 450, 410][k]
        def mk(d, dy, x=x, w=w, txt=txt):
            d.rounded_rectangle((x, 622 + dy, x + w, 672 + dy), 14, fill=LIGHTG, outline=GREEN, width=2)
            d.ellipse((x + 10, 634 + dy, x + 36, 660 + dy), fill=GREEN); tick(d, x + 23, 647 + dy, 16, WHITE, 3)
            fit(txt, F(22, 700), w - 54, "Merke"); T2(d, x + 46, 647 + dy, txt, F(22, 700), DARK, "lm")
        f.el(show(t, tin), mk, dy=dyf(t, tin))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V16 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vorgerechnet", F(104, 700), DARK)
        T2(d, 90, 290, "Log-Dateien der Fertigungszelle durchsuchen", F(46, 400), GREY)
        code_n(d, 90, 380, 800, CODE[13:16], list(range(14, 17)), [-1] * 3, 9, 20, 30, {0}, title="Python")
        mono = M(22)
        d.rounded_rectangle((930, 380, 1220, 560), 14, fill=BOX2); T2(d, 950, 394, "Ausgabe", F(20, 600), CODE_C, "la")
        for k, s in enumerate(("20 Log-Dateien", "47.2 KiB", "M1: 11 Fehler")): T2(d, 950, 440 + k * 36, s, mono, CODE_T, "la")
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
