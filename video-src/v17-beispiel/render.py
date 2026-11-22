"""V17 Vorgerechnet: Zellen-Check der Fertigungszelle FZ-3 (Code exakt aus briefing/v17-beispiel.py, Ausgabe wird echt berechnet).
Aufruf: python render.py [text|probe|zeiten|scan|stills t1 t2..|tts|full|mux]  (tts/full erst nach Freigabe der Credits)"""
import os, sys, types, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v17-common"))
from h17 import *
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from pap import Dia, pap_view, reveal, PAL
from texte import SRC

NAME = "v17-beispiel"; LABEL = "DHBW · Informatik · V17 · Vorgerechnetes Beispiel"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Code und echte Ausgabe
ROOT = os.path.join(HERE, "..", "..")
CODE = open(os.path.join(ROOT, "briefing", "v17-beispiel.py"), encoding="utf-8").read().rstrip("\n").split("\n")
assert len(CODE) == 35 and CODE[4] == "import json" and CODE[10].startswith("antwort =") and CODE[34].startswith("print(json.dumps")
API = os.path.join(ROOT, "site", "assets", "data", "v17", "api")

class _Antwort:
    def __init__(s, pfad):
        s.ok = os.path.exists(pfad); s.status_code = 200 if s.ok else 404
        s.text = open(pfad, encoding="utf-8").read() if s.ok else "404"
    def json(s): return json.loads(s.text)
_req = types.ModuleType("requests")
_req.get = lambda url: _Antwort(os.path.join(API, url.replace("../assets/data/v17/api/", "")))
OUT = run_code("\n".join(CODE), {"requests": _req})
ERWARTET = ["HTTP-Status: 200", "Zelle FZ-3, Netz 192.168.30.0/24, 254 nutzbare Adressen",
            "D2   192.168.30.11   laeuft    im Netz", "F1   192.168.30.12   laeuft    im Netz", "R1   192.168.31.20   gestoert  FALSCHES NETZ",
            "M1   192.168.30.14   bereit    im Netz", "SPS  192.168.30.2    laeuft    im Netz",
            "D2: Werkzeug T4 bei 83 % - wechseln", '{"maschine": "D2", "werkzeug": "T4", "aktion": "wechseln"}']
assert OUT == ERWARTET, OUT
PROG = "Python (briefing/v17-beispiel.py)"

def nums(a, b): return list(range(a, b + 1))
def code_scene(f, t, a, b, size, lh, x, y, w, hl, times, alpha_t=0.0):
    lines = CODE[a - 1:b]
    f.el(ap(t, alpha_t, 0.3), lambda d, dy: code_n(d, x, y + dy, w, lines, nums(a, b), times, t, size, lh, hl, title=PROG))
def put(times, idxs, start, a, cps=55, gap=0.1):
    c = start
    for i in idxs:
        times[i] = c; c += max(len(CODE[a - 1 + i]), 4) / cps + gap
    return c

# ---------------------------------------------------------------- 1 Aufgabe
def sc1(f, t, ct):
    heading(f, t, "Zellen-Check: Daten holen, Netz prüfen")
    def zelle(d, dy):
        card(d, 60, 128 + dy, 560, 330)
        T2(d, 90, 142 + dy, "Fertigungszelle FZ-3", F(32, 700), DARK)
        T2(d, 90, 186 + dy, "Netz 192.168.30.0/24", M(24), GREY)
        for k, (nm, bad) in enumerate((("D2", 0), ("F1", 0), ("R1", 1), ("M1", 0), ("SPS", 0))):
            x = 90 + k * 106
            chip(d, x, 232 + dy, 96, 52, nm, LIGHTR if bad else LIGHTG, RED if bad else GREEN, 26, outl=RED if bad else GREEN)
        d.rounded_rectangle((90, 322 + dy, 590, 430 + dy), 12, fill=BOX)
        T2(d, 110, 340 + dy, "maschinen.json", M(26, True), CODE_K, "la")
        T2(d, 110, 380 + dy, '{"zelle": "FZ-3", "netz": ...}', M(21), CODE_T, "la")
    f.el(show(t, 0.3), zelle, dy=dyf(t, 0.3))
    f.el(show(t, ct(0) + 1.6), lambda d, dy: arrow(d, 640, 290 + dy, 720, 290 + dy, GREY, 5, 16))
    tasks = [(ct(1) + 0.1, "Status der Abfrage melden"), (ct(1) + 1.8, "Je Maschine: IP im Netz?"), (ct(2) + 0.1, "Werkzeuge von D2 prüfen"), (ct(2) + 2.2, "Meldung als JSON bauen")]
    def prog(d, dy):
        card(d, 740, 128 + dy, 480, 330, stripe=False)
        T2(d, 770, 142 + dy, "Das Programm soll …", F(30, 700), DARK, "la")
        for k, (te, s) in enumerate(tasks):
            a = ap(t, te, 0.4)
            if a > 0:
                y = 200 + k * 62
                d.ellipse((770, y + dy, 806, y + 36 + dy), fill=mix(WHITE, RED, a)); T2(d, 788, y + 18 + dy, str(k + 1), F(24, 700), WHITE, "mm")
                T2(d, 822, y + 18 + dy, s, F(27, 700), mix(WHITE, DARK, a), "lm")
    f.el(show(t, ct(0) + 1.2), prog, dy=dyf(t, ct(0) + 1.2))
    def tip(d, dy):
        card(d, 60, 486 + dy, 1160, 150)
        T2(d, 90, 500 + dy, "Die „API“ der Zelle: feste Adressen unter ../assets/data/v17/api/", F(28, 700), DARK, "la")
        for k, nm in enumerate(("maschinen.json", "D2.json", "F1.json", "R1.json", "M1.json", "SPS.json")):
            chip(d, 90 + k * 188, 560 + dy, 176, 48, nm, LIGHTB, BLUE, 20, mono=True)
    f.el(show(t, ct(0) + 0.2), tip, dy=dyf(t, ct(0) + 0.2))

# ---------------------------------------------------------------- 2 Programmablaufplan
def build_pap():
    D = Dia(19); N = D.node
    N("s", "term", "Start", 0, 0); N("get", "proc", "maschinen.json holen", 0, 0); N("st", "io", "HTTP-Status ausgeben", 0, 0); N("net", "proc", "Netz aus den Daten bestimmen", 0, 0)
    N("w1", "dec", "weitere Maschine?", 0, 0); N("chk", "dec", "IP im Netz?", 0, 0); N("ok", "proc", "ort = im Netz", 0, 0); N("bad", "proc", "ort = FALSCHES NETZ", 0, 0); N("out", "io", "Zeile ausgeben", 0, 0)
    N("d2", "proc", "D2.json holen", 0, 0); N("w2", "dec", "weiteres Werkzeug?", 0, 0); N("c2", "dec", "Verschleiß > 80?", 0, 0); N("wt", "io", "wechseln melden", 0, 0)
    N("msg", "io", "Meldung als JSON ausgeben", 0, 0); N("end", "term", "Ende", 0, 0)
    n = D.nodes; Y0, Y1, Y1b, Y2, Y3 = 44, 168, 270, 392, 514; CX = 270
    x = 30
    for k in ("s", "get", "st", "net"):
        n[k].cy = Y0; n[k].cx = x + n[k].w / 2; x += n[k].w + 46
    n["w1"].cx = CX; n["w1"].cy = Y1
    n["chk"].cy = n["ok"].cy = n["out"].cy = Y1
    n["chk"].cx = n["w1"].bbox()[2] + 70 + n["chk"].w / 2; n["ok"].cx = n["chk"].bbox()[2] + 64 + n["ok"].w / 2; n["out"].cx = n["ok"].bbox()[2] + 56 + n["out"].w / 2
    n["bad"].cx = n["chk"].cx; n["bad"].cy = Y1b
    n["d2"].cx = 170; n["d2"].cy = Y2; n["w2"].cy = n["c2"].cy = n["wt"].cy = Y2
    n["w2"].cx = n["d2"].bbox()[2] + 60 + n["w2"].w / 2; n["c2"].cx = n["w2"].bbox()[2] + 64 + n["c2"].w / 2; n["wt"].cx = n["c2"].bbox()[2] + 64 + n["wt"].w / 2
    n["msg"].cy = n["end"].cy = Y3; n["msg"].cx = n["w2"].cx; n["end"].cx = n["msg"].bbox()[2] + 56 + n["end"].w / 2
    E = D.edge
    E("s-get", "s", "r", "get", "l"); E("get-st", "get", "r", "st", "l"); E("st-net", "st", "r", "net", "l")
    yb1 = n["w1"].bbox()[1] - 9; yb2 = n["w2"].bbox()[1] - 9
    E("net-w1", "net", "b", "w1", "t")
    E("w1-chk", "w1", "r", "chk", "l", label="ja"); E("chk-ok", "chk", "r", "ok", "l", label="ja"); E("chk-bad", "chk", "b", "bad", "t", label="nein")
    E("ok-out", "ok", "r", "out", "l"); E("bad-out", "bad", "r", n["out"].port("b"), None, via=[(n["out"].cx, Y1b)])
    E("out-w1", "out", "t", (CX, yb1), None, via=[(n["out"].cx, yb1)])
    E("w1-d2", "w1", "b", "d2", "t", label="nein")
    E("d2-w2", "d2", "r", "w2", "l"); E("w2-c2", "w2", "r", "c2", "l", label="ja"); E("c2-wt", "c2", "r", "wt", "l", label="ja")
    E("wt-w2", "wt", "t", (n["w2"].cx, yb2), None, via=[(n["wt"].cx, yb2)]); E("c2-w2", "c2", "t", (n["c2"].cx, yb2), None, label="nein", lab=(10, -3, "ls"))
    E("w2-msg", "w2", "b", "msg", "t", label="nein"); E("msg-end", "msg", "r", "end", "l")
    return D
PAP = build_pap()
PGROUPS = [["s", "s-get", "get", "get-st", "st", "st-net", "net"],
           ["net-w1", "w1", "w1-chk", "chk", "chk-ok", "ok", "chk-bad", "bad", "ok-out", "bad-out", "out", "out-w1"],
           ["w1-d2", "d2", "d2-w2", "w2", "w2-c2", "c2", "c2-wt", "wt", "wt-w2", "c2-w2"],
           ["w2-msg", "msg", "msg-end", "end"]]
_bb = PAP.bbox(); PW, PH = _bb[2] - _bb[0], _bb[3] - _bb[1]
PBOX = (60, 104, 1160, 580); PZOOM = min(1.12, (PBOX[2] - 20) / PW, (PBOX[3] - 20) / PH)
PCAM = (_bb[0] - (PBOX[2] / PZOOM - PW) / 2, _bb[1] - (PBOX[3] / PZOOM - PH) / 2)

def sc2(f, t, ct):
    heading(f, t, "Der Plan: holen, prüfen, melden")
    tm = {}
    for g, keys in enumerate(PGROUPS):
        for i, k in enumerate(keys): tm[k] = ct(g) + 0.3 + i * 0.5
    cur = max([g for g in range(4) if t >= ct(g)] or [0])
    hl = {k: PAL[cur] for k in PGROUPS[cur]}
    pap_view(f, ap(t, 0.2, 0.3), PAP, PBOX, PCAM, vis=reveal(t, tm), zoom=PZOOM, hl=hl)

# ---------------------------------------------------------------- 3 Zeilen 5 bis 13
def sc3(f, t, ct):
    heading(f, t, "Daten holen: Zeilen 5 bis 13")
    times = [1e9] * 9
    put(times, (0, 1, 2), ct(0) + 0.2, 5); put(times, (4,), ct(1) + 0.2, 5); put(times, (6, 7), ct(2) + 0.2, 5); put(times, (8,), ct(3) + 0.2, 5)
    hl = hl_at(t, [(0, None), (ct(0), {0, 1, 2}), (ct(1), {4}), (ct(2), {6, 7}), (ct(3), {8})])
    code_scene(f, t, 5, 13, 19, 30, 60, 112, 800, hl, times)
    X, W_ = 880, 340
    def tA(d, dy):
        card(d, X, 112 + dy, W_, 112); T2(d, X + 24, 122 + dy, "Drei Module", F(26, 700), DARK, "la")
        for k, nm in enumerate(("json", "ipaddress", "requests")):
            w = (68, 112, 104)[k]; xx = X + 24 + sum((68, 112, 104)[:k]) + 4 * k
            chip(d, xx, 166 + dy, w, 44, nm, LIGHTB, BLUE, 19, mono=True)
    f.el(show(t, ct(0) + 0.3), tA, dy=dyf(t, ct(0) + 0.3))
    def tB(d, dy):
        card(d, X, 236 + dy, W_, 124); T2(d, X + 24, 246 + dy, "Adresse = URL + Datei", F(26, 700), DARK, "la")
        chip(d, X + 24, 288 + dy, W_ - 48, 30, "../assets/data/v17/api/", LIGHTA, AMB, 18, mono=True)
        a = ap(t, ct(2) + 0.2, 0.4)
        if a > 0: chip(d, X + 24, 324 + dy, W_ - 48, 30, "+ maschinen.json", mix(WHITE, LIGHTG, a), mix(WHITE, GREEN, a), 18, mono=True)
    f.el(show(t, ct(1) + 0.3), tB, dy=dyf(t, ct(1) + 0.3))
    ents = [(ct(2) + 1.8, [("HTTP-Status: 200", CODE_T)])]
    f.el(show(t, ct(2) + 0.2), lambda d, dy: console_panel(d, X, 372 + dy, W_, 92, ents, t, 22, title="Ausgabe", lh=34), dy=dyf(t, ct(2) + 0.2))
    def tD(d, dy):
        card(d, X, 476 + dy, W_, 150); T2(d, X + 24, 486 + dy, "JSON-Text → Dictionary", F(24, 700), DARK, "la")
        chip(d, X + 24, 530 + dy, 120, 56, "Text", LIGHTA, AMB, 26)
        a = ap(t, ct(3) + 1.0, 0.4)
        if a > 0:
            arrow(d, X + 154, 558 + dy, X + 186, 558 + dy, GREY, 4, 12)
            chip(d, X + 196, 530 + dy, 120, 56, "zelle", mix(WHITE, LIGHTG, a), mix(WHITE, GREEN, a), 26, mono=True)
    f.el(show(t, ct(3) + 0.3), tD, dy=dyf(t, ct(3) + 0.3))

# ---------------------------------------------------------------- 4 Zeilen 15 und 16
def sc4(f, t, ct):
    heading(f, t, "Das Netz bestimmen: Zeilen 15 und 16")
    lines = CODE[14:16]
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {1}), (ct(2), {0, 1})])
    f.el(ap(t, 0.0, 0.3), lambda d, dy: code_n(d, 60, 112 + dy, 1100, lines, [15, 16], [ct(0) + 0.2, ct(1) + 0.2], t, 20, 32, hl, title=PROG))
    def c1(d, dy):
        card(d, 60, 268 + dy, 560, 220); T2(d, 90, 280 + dy, "Text → Netz", F(28, 700), DARK, "la")
        chip(d, 90, 332 + dy, 270, 54, '"192.168.30.0/24"', LIGHTA, AMB, 24, mono=True)
        a = ap(t, ct(0) + 1.6, 0.4)
        if a > 0:
            arrow(d, 372, 359 + dy, 420, 359 + dy, GREY, 4, 12); T2(d, 396, 322 + dy, "ip_network", M(15), GREY, "mm")
            chip(d, 430, 332 + dy, 160, 54, "Netz", mix(WHITE, LIGHTG, a), mix(WHITE, GREEN, a), 26)
        T2(d, 90, 410 + dy, 'steht in zelle["netz"]', M(22), GREY, "la")
    f.el(show(t, ct(0) + 0.2), c1, dy=dyf(t, ct(0) + 0.2))
    def c2(d, dy):
        card(d, 660, 268 + dy, 560, 220); T2(d, 690, 280 + dy, "Nutzbare Adressen", F(28, 700), DARK, "la")
        rows = [(0.4, "netz.num_addresses", "256", DARK), (1.8, "− 2", "", GREY), (3.2, "= 254", "", GREEN)]
        for te, s, v, col in rows:
            if t >= ct(1) + te:
                a = ap(t, ct(1) + te, 0.35); yy = 330 + [0, 1, 2][[r[0] for r in rows].index(te)] * 48
                T2(d, 690, yy + dy, s, M(26, True) if te == 0.4 else F(32, 700), mix(WHITE, col, a), "la")
                if v: T2(d, 1190, yy + dy, v, F(32, 700), mix(WHITE, col, a), "ra")
    f.el(show(t, ct(1) + 0.1), c2, dy=dyf(t, ct(1) + 0.1))
    ents = [(ct(1) + 2.2, [("Zelle FZ-3, Netz 192.168.30.0/24, 254 nutzbare Adressen", CODE_T)])]
    f.el(show(t, ct(1) + 0.1), lambda d, dy: console_panel(d, 60, 512 + dy, 1160, 96, ents, t, 24, title="Ausgabe", lh=36), dy=dyf(t, ct(1) + 0.1))
    f.el(show(t, ct(2) + 0.2), lambda d, dy: tag(d, 60, 626 + dy, 640, 44, "Name und Netz kommen aus den Daten", LIGHTG, GREEN, 24, outl=GREEN), dy=dyf(t, ct(2) + 0.2))

# ---------------------------------------------------------------- 5 Schleife (Zeilen 18 bis 24)
def sc5(f, t, ct):
    heading(f, t, "Jede Maschine prüfen: Zeilen 18 bis 24")
    times = [1e9] * 7
    put(times, (0,), ct(0) + 0.2, 18); put(times, (1, 2), ct(1) + 0.2, 18); put(times, (3, 4, 5, 6), ct(1) + 1.6, 18)
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {1, 2}), (ct(2), {6}), (ct(3), {2, 4})])
    code_scene(f, t, 18, 24, 19, 29, 60, 112, 760, hl, times)
    X, W_ = 850, 370
    def g(d, dy):
        card(d, X, 112 + dy, W_, 270); T2(d, X + 24, 122 + dy, "Breite in der f-Zeichenkette", F(23, 700), DARK, "la")
        cols = [("{m['id']:4}", 4, "id"), ("{m['ip']:15}", 15, "ip"), ("{m['status']:9}", 9, "status")]
        for k, (s, w, nm) in enumerate(cols):
            y = 172 + k * 60
            T2(d, X + 24, y + dy, s, M(20, True), RED, "la")
            fw = int(w * 15)
            d.rounded_rectangle((X + 24, y + 28 + dy, X + 24 + fw, y + 50 + dy), 4, fill=LIGHTB, outline=BLUE)
            T2(d, X + 30 + fw, y + 39 + dy, f"{w} Zeichen", F(18, 600), GREY, "lm") if fw < 200 else T2(d, X + 30, y + 39 + dy, f"{w} Zeichen", F(18, 600), BLUE, "lm")
    f.el(show(t, ct(2) + 0.2), g, dy=dyf(t, ct(2) + 0.2))
    ents = []
    for k, s in enumerate(OUT[2:7]):
        ents.append((ct(3) + 0.3 + 0.5 * k, [(s, CODE_R if "FALSCHES" in s else CODE_T)]))
    f.el(show(t, ct(3) + 0.1), lambda d, dy: console_panel(d, 60, 424 + dy, 1160, 250, ents, t, 25, title="Ausgabe", lh=38), dy=dyf(t, ct(3) + 0.1))
    f.el(show(t, ct(3) + 3.0), lambda d, dy: tag(d, 850, 390 + dy, 370, 30, "R1: drittes Oktett 31 statt 30", LIGHTR, RED, 19, outl=RED))

# ---------------------------------------------------------------- 6 D2 und Meldung (Zeilen 27 bis 35)
def sc6(f, t, ct):
    heading(f, t, "Verschleiß und Meldung: Zeilen 27 bis 35")
    times = [1e9] * 9
    put(times, (0, 1), ct(0) + 0.2, 27, gap=0.05); put(times, (2, 3, 4), ct(1) + 0.2, 27); put(times, (6, 7, 8), ct(3) + 0.2, 27)
    hl = hl_at(t, [(0, None), (ct(0), {0}), (ct(1), {1, 2}), (ct(2), {3, 4}), (ct(3), {6, 7, 8}), (ct(4), {0, 1, 2, 3, 4, 6, 7, 8})])
    code_scene(f, t, 27, 35, 17, 26, 60, 112, 800, hl, times)
    X = 890
    def bars(d, dy):
        card(d, X, 112 + dy, 330, 302); T2(d, X + 24, 122 + dy, "Werkzeugverschleiß D2", F(24, 700), DARK, "la")
        x0, x1, y1 = X + 70, X + 304, 380
        d.line((x0, y1 + dy, x1, y1 + dy), fill=DARK, width=3); d.line((x0, 170 + dy, x0, y1 + dy), fill=DARK, width=3)
        yp = lambda v: y1 - v / 100 * (y1 - 176)
        for k, (nm, v) in enumerate((("T1", 22), ("T4", 83))):
            g = ap(t, ct(1) + 0.6, 1.2); bx = x0 + 30 + k * 110; col = RED if v > 80 else GREY
            d.rectangle((bx, yp(v * g) + dy, bx + 70, y1 + dy), fill=col)
            T2(d, bx + 35, y1 + 6 + dy, nm, F(22, 700), DARK, "ma")
            if g > 0.95: T2(d, bx + 35, yp(v) - 18 + dy, f"{v} %", F(22, 700), col, "mm")
        yy = yp(80) + dy
        for xx in range(int(x0), int(x1), 16): d.line((xx, yy, xx + 9, yy), fill=AMB, width=3)
        T2(d, x0 - 8, yy, "80", F(20, 700), AMB, "rm")
    f.el(show(t, ct(0) + 0.3), bars, dy=dyf(t, ct(0) + 0.3))
    ents = [(ct(2) + 0.3, [(OUT[7], CODE_T)]), (ct(3) + 2.0, [(OUT[8], CODE_T)])]
    f.el(show(t, ct(2) + 0.1), lambda d, dy: console_panel(d, 60, 440 + dy, 1160, 136, ents, t, 24, title="Ausgabe", lh=36), dy=dyf(t, ct(2) + 0.1))
    def merk(d, dy):
        card(d, 60, 590 + dy, 1160, 92); T2(d, 90, 602 + dy, "Merke", F(26, 700), RED, "la")
        items = ["Status prüfen", "JSON lesen", "Adressen nie als Text vergleichen"]; x = 90
        for k, s in enumerate(items):
            a = ap(t, ct(4) + 0.3 + 1.1 * k, 0.4)
            if a > 0:
                d.ellipse((x, 640 + dy, x + 30, 670 + dy), fill=mix(WHITE, GREEN, a)); tick(d, x + 15, 655 + dy, 17, WHITE, 4)
                w = F(24, 700).getlength(s); T2(d, x + 42, 655 + dy, s, F(24, 700), mix(WHITE, DARK, a), "lm"); x += 42 + w + 50
    f.el(show(t, ct(4) + 0.1), merk, dy=dyf(t, ct(4) + 0.1))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V17 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vorgerechnet", F(104, 700), DARK)
        T2(d, 90, 290, "Fertigungszelle FZ-3: das Netz prüfen", F(48, 400), GREY)
        code_n(d, 90, 380, 700, CODE[17:24], nums(18, 24), [-1] * 7, 9, 17, 27, {2})
        for k, s in enumerate(OUT[2:7]):
            bad = "FALSCHES" in s
            chip(d, 840, 392 + k * 56, 360, 46, s.split()[0] + "  " + ("falsches Netz" if bad else "im Netz"), LIGHTR if bad else LIGHTG, RED if bad else GREEN, 24, outl=RED if bad else GREEN)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
