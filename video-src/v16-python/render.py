"""V16 Python-Werkstatt: pathlib, Dateien suchen, Zeit messen.
Aufruf: python render.py [text|probe [Ordner]|zeiten|scan|stills t1 t2..|full|mux]   (Vertonung vorher: python ../v16-common/tts_run.py v16-python)"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v16-common"))
from bausteine import *
from texte import SRC

NAME = "v16-python"; LABEL = "DHBW · Informatik · V16 · Python-Werkstatt"
SECS = make_secs(SRC)

def cpanel(f, t, lines, x, y, w, size, lh, hl=None, times=None, alpha_t=0.0, title="Python"):
    times = times if times is not None else [-1] * len(lines)
    f.el(ap(t, alpha_t, 0.3), lambda d, dy: code_n(d, x, y + dy, w, lines, list(range(1, len(lines) + 1)), times, t, size, lh, hl, title=title))

# ---------------------------------------------------------------- 1 Path und /
def sc1(f, t, ct):
    heading(f, t, "Pfade bauen mit pathlib")
    code = ["from pathlib import Path", 'zelle = Path("zelle")', 'maschine = zelle / "maschinen" / "D2"', "print(maschine)"]
    tm = [ct(0) + 0.3, ct(1) + 0.2, ct(1) + 2.6, ct(1) + 5.0]
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {1}), (ct(1) + 2.4, {2}), (ct(2), {2, 3}), (ct(3), None)])
    cpanel(f, t, code, 60, 116, 680, 24, 36, hl, tm)
    f.el(show(t, ct(1) + 5.6), lambda d, dy: console_panel(d, 60, 360, 680, 96, [(ct(1) + 5.7, [("zelle/maschinen/D2", CODE_T)])], t, 26, title="Ausgabe", lh=34), dy=dyf(t, ct(1) + 5.6))
    # Baum
    names = ["zelle", "maschinen", "D2"]
    for k, nm in enumerate(names):
        tin = ct(1) + 1.2 + 1.4 * k
        def nd(d, dy, k=k, nm=nm):
            x = 800 + k * 34; chip(d, x, 124 + k * 68 + dy, 170, 50, nm, LIGHTA if k < 2 else LIGHTB, AMB if k < 2 else BLUE, 26)
            if k > 0: arrow(d, 800 + (k - 1) * 34 + 17, 124 + (k - 1) * 68 + 52 + dy, 800 + (k - 1) * 34 + 17, 124 + k * 68 - 2 + dy, GREY, 3, 9)
            if k > 0: T2(d, 800 + (k - 1) * 34 + 40, 124 + (k - 1) * 68 + 82 + dy, "/", F(34, 700), RED, "lm")
        f.el(show(t, tin), nd, dy=dyf(t, tin))
    # Windows / Linux
    def wl(d, dy):
        for k, (osn, txt, col) in enumerate((("Windows", "zelle\\maschinen\\D2", BLUE), ("Linux", "zelle/maschinen/D2", GREEN))):
            y = 340 + k * 70
            chip(d, 800, y + dy, 130, 50, osn, WHITE, col, 24)
            monobox(d, 940, y + dy, 280, 50, txt, 22, CODE_T)
    f.el(show(t, ct(2) + 0.2), wl, dy=dyf(t, ct(2) + 0.2))
    f.el(show(t, ct(2) + 1.8), lambda d, dy: tag(d, 800, 484 + dy, 420, 40, "gleicher Code, richtiges Trennzeichen", LIGHTG, GREEN, 22, 700, outl=GREEN), dy=dyf(t, ct(2) + 1.8))
    # relativ / absolut
    def ra(d, dy):
        card(d, 60, 556 + dy, 560, 112)
        T2(d, 90, 568 + dy, "relativ: ab Arbeitsverzeichnis", F(26, 700), GREEN, "la")
        monobox(d, 90, 610 + dy, 500, 44, "zelle/maschinen/D2", 22)
    f.el(show(t, ct(3) + 0.2), ra, dy=dyf(t, ct(3) + 0.2))
    def ab(d, dy):
        card(d, 660, 556 + dy, 560, 112, fill=WHITE)
        T2(d, 690, 568 + dy, "absolut: ganz oben im Baum", F(26, 700), BLUE, "la")
        monobox(d, 690, 610 + dy, 500, 44, "C:\\Users\\anna\\projekte\\zelle", 22)
    f.el(show(t, ct(3) + 1.8), ab, dy=dyf(t, ct(3) + 1.8))

# ---------------------------------------------------------------- 2 Pfadteile
PARTS = [("zelle", DARK), ("/", GREY), ("maschinen", DARK), ("/", GREY), ("D2", RED), ("/", GREY), ("logs", DARK), ("/", GREY), ("2026-11-16", BLUE), (".log", AMB)]

def sc2(f, t, ct):
    heading(f, t, "Pfade zerlegen")
    fnt = M(32, True); x0 = 60; xs = []; x = x0
    for txt, _ in PARTS: xs.append(x); x += fnt.getlength(txt)
    xe = x
    def path(d, dy):
        d.rounded_rectangle((x0 - 18, 116 + dy, xe + 18, 176 + dy), 12, fill=BOX)
        for (txt, col), px in zip(PARTS, xs):
            c = {DARK: CODE_T, GREY: CODE_C, RED: CODE_R, BLUE: CODE_K, AMB: CODE_N}[col]
            T2(d, px, 146 + dy, txt, fnt, c, "lm")
    f.el(show(t, 0.3), path, dy=dyf(t, 0.3))
    def brk(d, dy, a, b, y, col, label, tin):
        al = ap(t, tin, 0.4)
        if al <= 0: return
        c = mix(WHITE, col, al)
        d.line((a, y + dy, b, y + dy), fill=c, width=4); d.line((a, y - 8 + dy, a, y + dy), fill=c, width=4); d.line((b, y - 8 + dy, b, y + dy), fill=c, width=4)
        T2(d, (a + b) / 2, y + 8 + dy, label, F(22, 700), c, "ma")
    end = lambda k: xs[k] + fnt.getlength(PARTS[k][0])
    f.el(1, lambda d, dy: (brk(d, dy, xs[8], end(9), 190, AMB, ".name", ct(1) + 0.8),
                           brk(d, dy, xs[8], end(8), 232, BLUE, ".stem", ct(1) + 2.4),
                           brk(d, dy, xs[9], end(9), 274, AMB, ".suffix", ct(1) + 4.0),
                           brk(d, dy, x0, end(7) - fnt.getlength("/"), 190, GREEN, ".parent", ct(2) + 0.6)))
    def pp(d, dy):
        a = ap(t, ct(2) + 3.0, 0.4)
        if a > 0: d.rounded_rectangle((xs[4] - 8, 112 + dy, end(4) + 8, 180 + dy), 12, outline=mix(WHITE, RED, a), width=4)
    f.el(1, pp)
    rows = [["log.name", "2026-11-16.log"], ["log.stem", "2026-11-16"], ["log.suffix", ".log"], ["log.parent.parent.name", "D2"], ["log.exists()", "True"], ["log.is_dir()", "False"]]
    rt = [ct(1) + 1.2, ct(1) + 2.8, ct(1) + 4.4, ct(2) + 3.4, ct(3) + 0.8, ct(3) + 3.2]
    f.el(show(t, ct(1) + 0.4), lambda d, dy: grid(d, 60, 340 + dy, [520, 640], ["Ausdruck (log = der Pfad oben)", "Ergebnis"], rows, t, rt, size=24, rh=44, new_hl=True, colors={(3, 1): RED, (4, 1): GREEN, (5, 1): RED}))

# ---------------------------------------------------------------- 3 iterdir, glob, rglob, sorted
TREE = [(0, "zelle", 1), (1, "LIESMICH.txt", 0), (1, "maschinen", 1), (2, "D2", 1), (3, "logs", 1), (4, "2026-11-16.log", 0), (2, "F1, M1, R1 ...", 1),
        (1, "messprotokolle", 1), (2, "M1_D2_KW47.csv", 0), (1, "nc-programme", 1), (2, "FLANSCH_80.nc", 0), (2, "WELLE_20H6.nc", 0), (2, "alt", 1), (3, "WELLE_20H6_v1.nc", 0)]

def sc3(f, t, ct):
    heading(f, t, "Dateien finden")
    hlset = hl_at(t, [(0, set()), (ct(0), {1, 2, 7, 9}), (ct(1), {5, 6}), (ct(2), {10, 11, 13}), (ct(3), set())])
    def tree(d, dy):
        card(d, 60, 112 + dy, 560, 520)
        for k, (dep, nm, isd) in enumerate(TREE):
            y = 126 + k * 36 + dy; x = 84 + dep * 30
            if k in hlset: d.rounded_rectangle((72, y - 3, 608, y + 30), 8, fill=LIGHTR, outline=RED, width=2)
            (folder_icon if isd else file_icon)(d, x, y + 4)
            T2(d, x + 36, y + 14, nm, F(22, 600), DARK if k not in hlset else RED, "lm")
    f.el(show(t, 0.3), tree, dy=dyf(t, 0.3))
    codes = ["for p in zelle.iterdir():", 'logs = zelle.glob("maschinen/*/logs/*.log")', 'nc = zelle.rglob("*.nc")', 'logs = sorted(zelle.glob("maschinen/*/logs/*.log"))']
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {1}), (ct(2), {2}), (ct(3), {3})])
    tm = [ct(0) + 0.3, ct(1) + 0.3, ct(2) + 0.3, ct(3) + 0.3]
    cpanel(f, t, codes, 660, 112, 560, 17, 34, hl, tm)
    # Muster-Anzeige
    def pat(d, dy):
        T2(d, 660, 338 + dy, "Muster:", F(24, 700), GREY, "la")
        x = 660
        for txt, star in (("maschinen", 0), ("/", 0), ("*", 1), ("/", 0), ("logs", 0), ("/", 0), ("*.log", 1)):
            w = chip_w(txt, 26, 12, True); chip(d, x, 372 + dy, w, 48, txt, LIGHTR if star else WHITE, RED if star else DARK, 26, mono=True); x += w + 6
        T2(d, 660, 430 + dy, "Stern = irgendein Name, ein Stern je Ordnerebene", F(22, 600), GREY, "la")
    f.el(show(t, ct(1) + 0.9), pat, dy=dyf(t, ct(1) + 0.9))
    f.el(show(t, ct(1) + 2.2), lambda d, dy: tag(d, 960, 334 + dy, 260, 36, "20 Log-Dateien", LIGHTG, GREEN, 22, 700, outl=GREEN), dy=dyf(t, ct(1) + 2.2))
    f.el(show(t, ct(2) + 1.2), lambda d, dy: tag(d, 940, 334 + dy, 280, 36, "rglob: auch Unterordner", LIGHTR, RED, 22, 700, outl=RED) if t < ct(3) else None, dy=0)
    # sorted
    def so(d, dy):
        card(d, 660, 476 + dy, 560, 156)
        T2(d, 688, 486 + dy, "Reihenfolge nicht festgelegt", F(24, 700), RED, "la")
        T2(d, 688, 520 + dy, "sorted(...) macht sie überall gleich:", F(24, 700), DARK, "la")
        for k, nm in enumerate(("FLANSCH_80.nc", "WELLE_20H6.nc", "WELLE_20H6_v1.nc")):
            a = ap(t, ct(3) + 1.8 + 0.8 * k, 0.4)
            if a > 0: T2(d, 700, 562 + k * 24 + dy, nm, M(20, True), mix(WHITE, DARK, a), "lm")
    f.el(show(t, ct(3) + 0.1), so, dy=dyf(t, ct(3) + 0.1))

# ---------------------------------------------------------------- 4 stat und read_text
def sc4(f, t, ct):
    heading(f, t, "Größe und Inhalt")
    code1 = ['log = Path("zelle/maschinen/D2/logs/2026-11-16.log")', "print(log.stat().st_size / 1024)"]
    cpanel(f, t, code1, 60, 112, 820, 22, 34, hl_at(t, [(0, None), (ct(0), {1})]), [ct(0) + 0.2, ct(0) + 1.6])
    def calc(d, dy):
        card(d, 920, 112 + dy, 300, 150)
        T2(d, 946, 124 + dy, "Bytes", F(22, 600), GREY, "la"); T2(d, 946, 150 + dy, "2437", F(40, 700), DARK, "la")
        a = ap(t, ct(0) + 2.4, 0.4)
        if a > 0:
            T2(d, 946, 204 + dy, "/ 1024", F(28, 700), mix(WHITE, RED, a), "la"); T2(d, 1090, 204 + dy, "= 2,4 KiB", F(28, 700), mix(WHITE, GREEN, a), "la")
    f.el(show(t, ct(0) + 0.8), calc, dy=dyf(t, ct(0) + 0.8))
    code2 = ['text = Path("zelle/LIESMICH.txt").read_text(encoding="utf-8")']
    cpanel(f, t, code2, 60, 290, 1160, 22, 34, hl_at(t, [(0, None), (ct(1), {0})]), [ct(1) + 0.2], alpha_t=ct(1))
    f.el(show(t, ct(1) + 3.0), lambda d, dy: tag(d, 60, 394 + dy, 520, 38, "ganze Datei = ein Text (kurze Dateien)", LIGHTB, BLUE, 22, 700, outl=BLUE), dy=dyf(t, ct(1) + 3.0))
    f.el(show(t, ct(1) + 5.0), lambda d, dy: tag(d, 600, 394 + dy, 620, 38, "lange Logs: weiter with open und Schleife", LIGHTG, GREEN, 22, 700, outl=GREEN), dy=dyf(t, ct(1) + 5.0))
    ents = [(ct(2) + 0.4, [("FileNotFoundError: No such file or directory:", CODE_R)]), (ct(2) + 0.9, [("'zelle/gibt-es-nicht.txt'", CODE_R)])]
    f.el(show(t, ct(2) + 0.1), lambda d, dy: console_panel(d, 60, 470 + dy, 1160, 120, ents, t, 24, title="Ausgabe", lh=34), dy=dyf(t, ct(2) + 0.1))
    f.el(show(t, ct(2) + 2.4), lambda d, dy: chip(d, 60, 610 + dy, 440, 50, "vorher: .exists() prüfen", LIGHTG, GREEN, 26), dy=dyf(t, ct(2) + 2.4))
    f.el(show(t, ct(2) + 3.8), lambda d, dy: chip(d, 520, 610 + dy, 440, 50, "oder: try/except abfangen", LIGHTA, AMB, 26), dy=dyf(t, ct(2) + 3.8))

# ---------------------------------------------------------------- 5 os
def sc5(f, t, ct):
    heading(f, t, "os: nur lesen können")
    f.el(show(t, 0.3), lambda d, dy: tag(d, 60, 112 + dy, 560, 42, "häufig in älterem Code und in KI-Code", LIGHTA, AMB, 24, 700, outl=AMBER), dy=dyf(t, 0.3))
    rows = [["Arbeitsverzeichnis", "os.getcwd()", "-"],
            ["Namen im Ordner", 'os.listdir(".")', 'Path(".").iterdir()'],
            ["Pfadteile verbinden", 'os.path.join("zelle", "maschinen")', 'Path("zelle") / "maschinen"'],
            ["Baum durchlaufen", 'os.walk("zelle")', 'zelle.rglob("*")']]
    rt = [ct(1) + 0.4, ct(1) + 2.4, ct(2) + 0.2, ct(2) + 3.6]
    f.el(show(t, ct(1) + 0.1), lambda d, dy: grid(d, 60, 184 + dy, [250, 470, 440], ["Aufgabe", "os (nur lesen)", "pathlib (selbst schreiben)"], rows, t, rt, size=23, rh=64, new_hl=True))
    f.el(show(t, ct(3) + 0.3), lambda d, dy: tag(d, 60, 560 + dy, 400, 48, "os: lesen können", LIGHTB, BLUE, 28, 700, outl=BLUE), dy=dyf(t, ct(3) + 0.3))
    f.el(show(t, ct(3) + 2.2), lambda d, dy: tag(d, 480, 560 + dy, 520, 48, "selbst schreiben: pathlib, kürzer", LIGHTG, GREEN, 28, 700, outl=GREEN), dy=dyf(t, ct(3) + 2.2))

# ---------------------------------------------------------------- 6 Zeit messen
def sc6(f, t, ct):
    heading(f, t, "Laufzeit messen")
    def cards(d, dy):
        card(d, 60, 112 + dy, 560, 92); T2(d, 90, 120 + dy, "Uhrzeit", F(24, 700), GREY, "la"); T2(d, 90, 152 + dy, "14:32 Uhr: Wanduhr", F(30, 700), DARK, "la")
    f.el(show(t, 0.3), cards, dy=dyf(t, 0.3))
    def c2(d, dy):
        card(d, 660, 112 + dy, 560, 92); T2(d, 690, 120 + dy, "Laufzeit", F(24, 700), RED, "la"); T2(d, 690, 152 + dy, "9,8 ms: Stoppuhr", F(30, 700), DARK, "la")
    f.el(show(t, ct(0) + 1.4), c2, dy=dyf(t, ct(0) + 1.4))
    code = ["import time", "start = time.perf_counter()", "# ... das Programmstück ...", "ende = time.perf_counter()", 'print(f"{1000 * (ende - start):.1f} ms")']
    tm = [ct(1) + 0.1, ct(1) + 0.8, ct(1) + 1.8, ct(1) + 2.4, ct(1) + 3.8]
    cpanel(f, t, code, 60, 226, 700, 22, 34, hl_at(t, [(0, None), (ct(1), {0, 1}), (ct(1) + 1.6, {3}), (ct(1) + 3.4, {4})]), tm, alpha_t=ct(1))
    def sw(d, dy):
        cx, cy, r = 1000, 346, 96
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=WHITE, outline=DARK, width=6)
        for k in range(12):
            a = k * math.pi / 6; d.line((cx + (r - 12) * math.sin(a), cy - (r - 12) * math.cos(a) + dy, cx + (r - 2) * math.sin(a), cy - (r - 2) * math.cos(a) + dy), fill=DARK, width=3)
        run = clamp((t - ct(1) - 1.0) / 1.2); ang = run * 2 * math.pi * 0.8
        d.line((cx, cy + dy, cx + 76 * math.sin(ang), cy - 76 * math.cos(ang) + dy), fill=RED, width=6)
        d.ellipse((cx - 8, cy - 8 + dy, cx + 8, cy + 8 + dy), fill=RED)
        d.rounded_rectangle((cx - 14, cy - r - 24 + dy, cx + 14, cy - r - 4 + dy), 4, fill=DARK)
    f.el(show(t, ct(1) + 0.3), sw, dy=dyf(t, ct(1) + 0.3))
    # mehrere Messungen
    vals = [12.4, 9.8, 10.3, 9.9]; best = vals.index(min(vals))
    f.el(show(t, ct(2) + 0.1), lambda d, dy: T2(d, 60, 480 + dy, "4 Messungen desselben Programms", F(24, 700), GREY, "la"))
    for k, v in enumerate(vals):
        tin = ct(2) + 0.8 + 0.9 * k; x = 60 + k * 200
        def ch(d, dy, k=k, v=v, x=x):
            on = k == best and t >= ct(2) + 5.0
            chip(d, x, 520 + dy, 180, 56, f"{v:.1f} ms".replace(".", ","), LIGHTG if on else WHITE, GREEN if on else DARK, 28, outl=GREEN if on else LINE)
        f.el(show(t, tin), ch, dy=dyf(t, tin))
    f.el(show(t, ct(2) + 5.0), lambda d, dy: tag(d, 880, 526 + dy, 340, 44, "kleinster Wert zählt", GREEN, WHITE, 24), dy=dyf(t, ct(2) + 5.0))
    # Zeitscheiben anderer Prozesse
    def sl(d, dy):
        T2(d, 60, 602 + dy, "Das Betriebssystem schiebt andere Prozesse dazwischen:", F(22, 600), GREY, "la")
        cols = [RED, LIGHTK, RED, LIGHTK, LIGHTK, RED, LIGHTK, RED, RED, LIGHTK]
        for k, c in enumerate(cols):
            d.rectangle((60 + k * 80, 636 + dy, 60 + k * 80 + 76, 664 + dy), fill=c, outline=LINE)
        T2(d, 880, 650 + dy, "rot = unser Programm", F(20, 700), RED, "lm")
    f.el(show(t, ct(2) + 2.6), sl, dy=dyf(t, ct(2) + 2.6))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V16 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Python-Werkstatt", F(96, 700), DARK)
        T2(d, 90, 290, "pathlib, Dateien finden, Laufzeit messen", F(48, 400), GREY)
        code_n(d, 90, 400, 820, ['from pathlib import Path', 'for log in sorted(zelle.glob("*/*.log")):', '    print(log.name)'], [1, 2, 3], [-1] * 3, 9, 24, 36, {1})
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
