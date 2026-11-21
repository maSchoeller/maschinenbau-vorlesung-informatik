"""V05 Vorgerechnet: Werkstoffvorschlag fuer eine Welle als PAP und Code (Code exakt aus briefing/v05-beispiel.py).
Aufruf: python render.py [text|fake|tts|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from pap import *
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v05-beispiel"; LABEL = "DHBW · Informatik · V05 · Werkstoffvorschlag für eine Welle"
W16 = "[[16Mo3|sechzehn M O drei]]"; WS235 = "[[S235JR|S zweihundertfünfunddreißig J R]]"
WC45 = "[[C45E|C fünfundvierzig E]]"; W42 = "[[42CrMo4|zweiundvierzig C R M O vier]]"

SRC = [
 ["Die Aufgabe: ein Werkstoff für eine Welle, aus Spannung in MPa und Temperatur in °C.",
  "Wichtig vorab: Das ist eine vereinfachte Lehr-Regel, keine Normauslegung.",
  "Heiß braucht warmfesten Stahl, sonst entscheidet die Spannung, und Unsinn wird abgewiesen. Wir zeichnen den Plan und gehen dann den Code durch."],
 ["Der Plan: zwei Eingaben, dann die Frage, ob die Eingabe unplausibel ist. Bei ja folgen die Meldung und das Ende.",
  f"Bei nein trennt die Temperatur: Über 300 °C entscheidet die Spannung zwischen {W16} und Sonderwerkstoff, sonst wählt eine Kette von Fragen.",
  "Alle Zweige laufen zusammen, dann folgt die Ausgabe."],
 ["Jetzt der Code: Die Zeilen 1 bis 3 sind Kommentare, Python ignoriert sie.",
  "Die Zeilen 5 und 6 sind die zwei Parallelogramme: `input` liest Text, `float` macht eine Kommazahl daraus."],
 ["Zeile 8 ist die erste Raute: `or` verknüpft drei Bedingungen, eine wahre genügt.",
  "Zeile 9 ist der ja-Zweig, die Meldung.",
  "Mit `else` in Zeile 10 beginnt der nein-Zweig: Alles Eingerückte läuft nur bei plausiblen Eingaben."],
 ["Zeile 11 fragt nach über 300 °C und ist eingerückt, weil sie im nein-Zweig steckt.",
  f"Bei ja prüft Zeile 12 die Spannung: bis 200 MPa {W16} in Zeile 13, sonst ein Sonderwerkstoff."],
 ["Das `else` in Zeile 16 gehört zu Zeile 11: bis 300 °C.",
  f"Die Kette aus `if`, `elif` und `else` ist die Reihe der Rauten: bis 140 {WS235}, bis 220 {WC45}, sonst {W42}.",
  "`elif` heißt: sonst, wenn."],
 ["Zeile 23 ist das letzte Parallelogramm: Dort laufen alle Zweige zusammen, und der Werkstoff wird ausgegeben."],
 ["Der Plan hat sechs Wege, also sechs Testfälle.",
  f"Erst die Meldung bei -5 MPa, dann heiß: 250 MPa ergeben den Sonderwerkstoff, 150 MPa den {W16}.",
  f"Kalt: 100 MPa ergeben {WS235}, 180 MPa {WC45} und 250 MPa {W42}.",
  "Dazu kommen Grenzwerte wie genau 140 MPa oder genau 300 °C. Nochmals: vereinfachte Lehr-Regel, keine Normauslegung."],
]
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Code und Pruefung (exakt briefing/v05-beispiel.py)
CODE = open(os.path.join(HERE, "..", "..", "briefing", "v05-beispiel.py"), encoding="utf-8").read().rstrip("\n").split("\n")
assert len(CODE) == 23 and CODE[4].startswith("spannung = float") and CODE[22].lstrip().startswith("print(\"Empfohlener")
SRCTEXT = "\n".join(CODE)
TESTS = [(("-5", "20"), None), (("250", "400"), "Sonderwerkstoff - Rücksprache Konstruktion"), (("150", "400"), "16Mo3 (warmfest)"),
         (("100", "20"), "S235JR"), (("180", "20"), "C45E"), (("250", "20"), "42CrMo4 (vergütet)")]
for ein, erw in TESTS:
    out = run_in(SRCTEXT, ein); assert len(out) == 3
    assert out[2] == ("Empfohlener Werkstoff: " + erw if erw else "Eingabe unplausibel - bitte Werte prüfen"), out
assert run_in(SRCTEXT, ("140", "20"))[2].endswith("S235JR") and run_in(SRCTEXT, ("220", "20"))[2].endswith("C45E")
assert run_in(SRCTEXT, ("200", "301"))[2].endswith("16Mo3 (warmfest)") and run_in(SRCTEXT, ("100", "300"))[2].endswith("S235JR")
CX, CW, CSZ, CLH, CY = 30, 640, 15, 22, 100
fit_check(CODE, M(CSZ), CW - 50 - 14, "Code")

WS = werkstoff_pap(); N = WS.nodes
ZOOM = 0.9; WBOX = (32, 104, 1216, 580)
VX, VW = 680, 576          # Sichtfenster neben dem Code
def vbox(h=490): return (VX, 100, VW, h)

# Zuordnung Plan <-> Codezeilen (0-basiert)
PIDS = {"ein": (["e1", "e2", "s-e1", "e1-e2", "e2-d1"], [4, 5], PAL[0]),
        "if1": (["d1"], [7], PAL[1]), "meld": (["d1-meld", "meld", "meld-ende1", "ende1"], [8], PAL[2]), "else1": (["d1-d2"], [9], PAL[4]),
        "if2": (["d2"], [10], PAL[1]), "if3": (["d2-d3", "d3"], [11], PAL[5]), "w16": (["d3-w16", "w16"], [12], PAL[2]), "wson": (["d3-wson", "wson"], [13, 14], PAL[3]),
        "else2": (["d2-d140"], [15], PAL[4]),
        "c1": (["d140", "d140-w235", "w235"], [16, 17], PAL[0]), "c2": (["d140-d220", "d220", "d220-w45", "w45"], [18, 19], PAL[1]), "c3": (["d220-w42", "w42"], [20, 21], PAL[2]),
        "aus": (["bus-aus", "aus", "aus-ende", "ende"], [22], PAL[3])}
def binds(names):
    keys = {}; lines = {}
    for n in names:
        ks, ls, col = PIDS[n]
        for k in ks: keys[k] = col
        for l in ls: lines[l] = col
    return keys, lines

def code_view(f, t, cols, active):
    f.el(ap(t, 0.0, 0.3), lambda d, dy: code_c(d, CX, CY + dy, CW, CODE, [-1] * len(CODE), t, CSZ, CLH, cols, active, off=50))
def plan(f, t, hl, cam, zoom, h=490, a=None):
    pap_view(f, ap(t, 0.0, 0.3) if a is None else a, WS, vbox(h), cam, hl=hl, zoom=zoom)
CAM_IN = (0, 0); CAM_CHK = (0, N["d1"].cy - 44); CAM_HOT = (745, N["d2"].cy - 60); CAM_D2 = (0, N["d2"].cy - 150)
CAM_COLD = (48, N["d140"].cy - 56)

# ---------------------------------------------------------------- 1 Aufgabe
def sc1(f, t, ct):
    heading(f, t, "Die Aufgabe: Werkstoff für eine Welle")
    def shaft(d, dy):
        y = 330 + dy
        d.rectangle((90, y - 40, 300, y + 40), fill=(205, 210, 218), outline=DARK, width=3)
        d.rectangle((300, y - 56, 420, y + 56), fill=(184, 190, 200), outline=DARK, width=3)
        d.rectangle((420, y - 40, 640, y + 40), fill=(205, 210, 218), outline=DARK, width=3)
        for xx in (150, 560):
            d.polygon([(xx - 34, y + 56), (xx + 34, y + 56), (xx + 50, y + 100), (xx - 50, y + 100)], fill=GREY)
            d.rectangle((xx - 50, y + 100, xx + 50, y + 108), fill=DARK)
        T2(d, 365, y + 128, "Welle", F(30, 700), DARK, "mm")
        arrow(d, 365, y - 130, 365, y - 62, RED, 5, 16); T2(d, 365, y - 150, "Last", F(26, 700), RED, "mm")
    f.el(ap(t, ct(0) + 0.3, 0.5), shaft, dy=int((1 - ap(t, ct(0) + 0.3, 0.5)) * 12))
    def eing(d, dy):
        card(d, 720, 130 + dy, 500, 150)
        T2(d, 752, 142 + dy, "Eingaben", F(28, 700), DARK)
        T2(d, 752, 188 + dy, "größte Spannung in MPa", F(30, 400), DARK)
        T2(d, 752, 232 + dy, "Betriebstemperatur in °C", F(30, 400), DARK)
    f.el(ap(t, ct(0) + 2.0, 0.5), eing, dy=int((1 - ap(t, ct(0) + 2.0, 0.5)) * 12))
    def ausg(d, dy):
        arrow(d, 970, 292 + dy, 970, 338 + dy, DARK, 4, 14)
        card(d, 720, 346 + dy, 500, 90)
        T2(d, 752, 358 + dy, "Ausgabe", F(28, 700), DARK); T2(d, 752, 396 + dy, "Werkstoffvorschlag oder Meldung", F(26, 400), DARK)
    f.el(ap(t, ct(0) + 4.5, 0.5), ausg, dy=int((1 - ap(t, ct(0) + 4.5, 0.5)) * 12))
    pill(f, t, ct(1) + 0.4, 90, 500, 1130, "Vereinfachte Lehr-Regel, keine Normauslegung", AMBER, 60, 32)
    note(f, t, ct(2) + 0.2, 90, 586, 1130, 90, "Unsere Regel", ["hohe Temperatur: warmfester Stahl, sonst entscheidet die Spannung; unsinnige Eingaben werden abgewiesen"], DARK, bsz=24)

# ---------------------------------------------------------------- 2 der Plan
def sc2(f, t, ct):
    heading(f, t, "Der Plan für den Werkstoffvorschlag")
    tm = {}
    def add(keys, t0, step):
        for i, k in enumerate(keys): tm[k] = t0 + i * step
    tm["s"] = ct(0) + 0.1
    add(["s-e1", "e1", "e1-e2", "e2", "e2-d1", "d1", "d1-meld", "meld", "meld-ende1", "ende1"], ct(0) + 0.4, 0.8)
    add(["d1-d2", "d2", "d2-d3", "d3", "d3-w16", "w16", "d3-wson", "wson", "d2-d140", "d140", "d140-w235", "w235", "d140-d220", "d220", "d220-w45", "w45", "d220-w42", "w42"], ct(1) + 0.3, 0.55)
    add(["w235-bus", "w45-bus", "w42-bus", "w16-bus", "wson-bus", "bus1", "bus2", "bus3", "bus4", "bus-aus", "aus", "aus-ende", "ende"], ct(2) + 0.2, 0.28)
    pap_view(f, ap(t, 0.2, 0.3), WS, WBOX, (0, 0), vis=reveal(t, tm), zoom=ZOOM)
    def card_u(d, dy):
        card(d, 800, 108 + dy, 440, 128)
        T2(d, 826, 118 + dy, "unplausibel heißt:", F(24, 700), DARK)
        for i, ln in enumerate(["spannung ≤ 0  oder", "temperatur < −50  oder", "temperatur > 600"]): T2(d, 826, 154 + i * 26 + dy, ln, F(22, 400), GREY)
    f.el(ap(t, ct(0) + 4.0, 0.5), card_u)

# ---------------------------------------------------------------- 3 bis 7 Code
def sc3(f, t, ct):
    heading(f, t, "Abschnitt 1: Kommentare und Eingaben")
    if t < ct(1) - 0.2:
        code_view(f, t, {0: (120, 130, 150), 1: (120, 130, 150), 2: (120, 130, 150)}, {0, 1, 2})
        plan(f, t, {}, CAM_IN, ZOOM)
        note(f, t, ct(0) + 1.5, VX, 604, VW, 84, "Kommentar", ["beginnt mit #, wird nicht ausgeführt"], DARK, bsz=24)
    else:
        keys, lines = binds(["ein"])
        code_view(f, t, lines, {4, 5}); plan(f, t, keys, CAM_IN, ZOOM)
        note(f, t, ct(1) + 3.0, VX, 604, VW, 84, "Eine Anweisung, eine Zeile", ["zwei Parallelogramme, zwei Zeilen"], GREEN, bsz=24)

def sc4(f, t, ct):
    heading(f, t, "Abschnitt 2: Eingabe prüfen")
    if t < ct(1) - 0.2: names, act = ["if1"], {7}
    elif t < ct(2) - 0.2: names, act = ["if1", "meld"], {8}
    else: names, act = ["if1", "meld", "else1"], set(range(9, 23))
    keys, lines = binds(names)
    code_view(f, t, lines, act); plan(f, t, keys, CAM_CHK, 0.82)
    note(f, t, ct(0) + 2.0, VX, 604, VW, 84, "or", ["eine wahre Bedingung genügt"], DARK, tout=ct(1) - 0.2, bsz=24)
    note(f, t, ct(2) + 3.0, VX, 604, VW, 84, "Einrückung", ["4 Leerzeichen weiter rechts = nein-Zweig"], PAL[4], bsz=24)

def sc5(f, t, ct):
    heading(f, t, "Abschnitt 3: ist es heiß?")
    names = ["if2"] + (["if3"] if t > ct(1) - 0.2 else []) + (["w16"] if t > ct(1) + 3.4 else []) + (["wson"] if t > ct(1) + 5.6 else [])
    keys, lines = binds(names)
    act = {10} if t < ct(1) else ({11} if t < ct(1) + 3.4 else ({12} if t < ct(1) + 5.6 else {13, 14}))
    code_view(f, t, lines, act)
    k = ap(t, ct(1) - 0.6, 0.9)
    cam = (lerp(CAM_D2[0], CAM_HOT[0], k), lerp(CAM_D2[1], CAM_HOT[1], k))
    plan(f, t, keys, cam, lerp(0.9, 1.0, k))
    note(f, t, ct(0) + 3.0, VX, 604, VW, 84, "Zwei Ebenen", ["if in if: eine Einrückstufe mehr"], PAL[5], bsz=24)

def sc6(f, t, ct):
    heading(f, t, "Abschnitt 4: Kette aus if, elif, else")
    names = ["else2"] + (["c1"] if t > ct(1) + 3.0 else []) + (["c2"] if t > ct(1) + 7.0 else []) + (["c3"] if t > ct(1) + 11.5 else [])
    keys, lines = binds(names)
    if t < ct(1): act = {15}
    elif t < ct(1) + 7.0: act = {16, 17}
    elif t < ct(1) + 11.5: act = {18, 19}
    elif t < ct(2): act = {20, 21}
    else: act = set(range(16, 22))
    code_view(f, t, lines, act); plan(f, t, keys, CAM_COLD, 0.85)
    note(f, t, ct(2) + 0.2, VX, 604, VW, 84, "elif = sonst, wenn", ["der erste Treffer gewinnt, der Rest entfällt"], DARK, bsz=24)

def sc7(f, t, ct):
    heading(f, t, "Abschnitt 5: Ausgabe")
    keys, lines = binds(["aus"])
    code_view(f, t, lines, {22}); plan(f, t, keys, (330, N["aus"].cy - 62), 0.85)
    note(f, t, ct(0) + 2.0, VX, 604, VW, 84, "Zusammenführung", ["eingerückt im nein-Zweig der ersten Raute"], PAL[3], bsz=24)

# ---------------------------------------------------------------- 8 Testfaelle je Weg
PFADE = ["unplausibel", "heiss_sonder", "heiss_16", "kalt_235", "kalt_45", "kalt_42"]
assert set(PFADE) == set(PFAD_KEYS)
def sc8(f, t, ct):
    heading(f, t, "Sechs Wege, sechs Testfälle")
    starts = [ct(1) + 0.4, ct(1) + 5.8, ct(1) + 10.6, ct(2) + 1.0, ct(2) + 5.2, ct(2) + 9.8]
    dur = 2.4
    cur = None
    for i, s0 in enumerate(starts):
        if t >= s0: cur = i
    hl = {}; mk = None
    if cur is not None:
        keys = PFAD_KEYS[PFADE[cur]]; poly = WS.route(keys); ph = clamp((t - starts[cur]) / dur)
        done = ph * sum(math.dist(a, b) for a, b in zip(poly, poly[1:])); acc = 0.0
        for k in keys:
            pts = WS.edges[k[1:]].pts[::-1] if k.startswith("~") else WS.edges[k].pts
            l = sum(math.dist(a, b) for a, b in zip(pts, pts[1:]))
            if acc + l <= done + 0.5: hl[k] = PAL[cur]
            acc += l
        mx, my = along(poly, ph)
        for k, nd in N.items():
            x0, y0, x1, y1 = nd.bbox(); hit = x0 - 6 <= mx <= x1 + 6 and y0 - 6 <= my <= y1 + 6
            for ek in list(hl):
                if ek in WS.edges:
                    ex, ey = WS.edges[ek].pts[-1]
                    if x0 - 3 <= ex <= x1 + 3 and y0 - 3 <= ey <= y1 + 3: hit = True
            if k == "s" or hit: hl[k] = PAL[cur]
        mk = (mx, my) if ph < 1 else None
    pap_view(f, ap(t, 0.2, 0.3), WS, WBOX, (0, 0), hl=hl, marker=mk, zoom=ZOOM)
    if cur is not None:
        ein, erw = TESTS[cur]; out = run_in(SRCTEXT, ein)
        def card_t(d, dy):
            card(d, 800, 108 + dy, 440, 150)
            T2(d, 826, 118 + dy, f"Test {cur + 1}", F(26, 700), PAL[cur])
            T2(d, 826, 156 + dy, f"spannung {ein[0]} MPa, temperatur {ein[1]} °C".replace("-", "−"), F(22, 400), GREY)
            if t >= starts[cur] + dur:
                txt = out[2]; sz = 22
                while F(sz, 600).getlength(txt) > 390 and sz > 14: sz -= 1
                T2(d, 826, 196 + dy, txt, F(sz, 600), DARK)
        f.el(1, card_t)
    pill(f, t, ct(3) + 0.3, 800, 612, 440, "Vereinfachte Lehr-Regel, keine Normauslegung", AMBER, 44, 20)

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6, 7: sc7, 8: sc8}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V05 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Vorgerechnet", F(104, 700), DARK)
        T2(d, 90, 290, "Werkstoffvorschlag für eine Welle", F(48, 400), GREY)
        code_c(d, 90, 380, 600, CODE[7:12], [-1] * 5, 9, 16, 26, {7: PAL[1], 8: PAL[2], 9: PAL[4]}, None, title="Python", off=56)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn)
    f.img.paste(WS.render((470, 300), (728, N["d2"].cy - 60), zoom=0.8, hl={"d3": PAL[5], "w16": PAL[2], "wson": PAL[3]}), (740, 370)); f.img.save(path)

if __name__ == "__main__":
    modus(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
