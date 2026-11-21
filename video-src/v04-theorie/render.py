"""V04 Theorie: Wahr oder falsch, Logik für Maschinen (Zweihandschaltung, UND/ODER/NICHT, De Morgan, Verzweigung).
Aufruf: python render.py [text|tts|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v04-common"))
from b4 import *
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v04-theorie"; LABEL = "DHBW · Informatik · V04 · Boolesche Logik und Verzweigungen"

SRC = [
 ["Eine Presse drückt mit mehreren Tonnen Kraft zu, und dein Finger hat darin nichts verloren.",
  "Darum startet der Hub nur, wenn du mit beiden Händen gleichzeitig zwei Taster drückst, einen links und einen rechts.",
  "Dann sind beide Hände sicher außerhalb des Werkzeugs. Drückst du nur einen Taster, passiert nichts.",
  "Dahinter steckt Logik: Der Hub ist nur erlaubt, wenn der linke Taster gedrückt ist und der rechte auch.",
  "Genau diese Logik der Maschinen schauen wir uns jetzt an."],
 ["Eine Maschine arbeitet mit Aussagen, die stimmen oder nicht: Taster gedrückt, Tür geschlossen, Druck zu hoch.",
  "Solche Aussagen haben genau zwei mögliche Werte: wahr oder falsch. Man nennt sie Wahrheitswerte.",
  "In Python heißen sie `True` und `False`.",
  "Im Rechner ist wahr die 1 und falsch die 0, genau wie bei einem Bit, das nur 0 oder 1 kennt.",
  "Eine Bedingung ist eine Aussage, die das Programm auswertet und die dann wahr oder falsch ist."],
 ["Beginnen wir mit dem [[UND|Und]]. Elektrisch ist es eine Reihenschaltung: zwei Schalter hintereinander.",
  "Die Lampe leuchtet nur, wenn Schalter A und Schalter B geschlossen sind.",
  "In der Wahrheitstabelle stehen alle vier Kombinationen von A und B, und nur eine liefert wahr: beide wahr.",
  "Ist auch nur ein Schalter offen, ist der Stromkreis unterbrochen.",
  "Das ist die Zweihandschaltung: Der Hub läuft, wenn links [[UND|und]] rechts gedrückt ist."],
 ["Das [[ODER|Oder]] ist eine Parallelschaltung: Die beiden Schalter liegen nebeneinander.",
  "Hier reicht es, wenn A oder B geschlossen ist, denn der Strom nimmt den freien Weg.",
  "Die Tabelle liefert nur dann falsch, wenn beide Schalter offen sind.",
  "Jede Seite allein genügt, beide zusammen genügen erst recht."],
 ["Das [[NICHT|Nicht]] dreht einen Wert um: Aus wahr wird falsch und aus falsch wird wahr.",
  "Als Schalter ist das ein Öffner: Er ist in Ruhe geschlossen und unterbricht den Strom erst, wenn man ihn betätigt.",
  "Die Wahrheitstabelle hat nur zwei Zeilen: Ist A falsch, ist das Ergebnis wahr, und umgekehrt.",
  "Jeder Not-Halt-Taster ist so ein Öffner: Solange niemand drückt, fließt der Strom, und beim Drücken wird die Maschine stromlos."],
 ["Jetzt kombinieren wir. Die Maschine ist freigegeben, wenn die Tür zu ist [[UND|und]] der Druck im Bereich liegt.",
  "Stoppen soll sie, sobald das nicht gilt: [[NICHT (Tür zu UND Druck ok)|nicht, Klammer auf, Tür zu und Druck ok, Klammer zu]].",
  "Der Satz von De Morgan sagt: Das ist dasselbe wie [[Tür offen ODER Druck nicht ok|Tür offen oder Druck nicht ok]].",
  "Das Nicht vor der Klammer macht aus Und ein Oder und verneint beide Teile.",
  "Die Tabelle beweist es: In allen vier Zeilen stimmen beide Spalten überein."],
 ["Eine Verzweigung ist eine Weiche im Programmablauf: Ist die Bedingung wahr, läuft das Programm den einen Weg, sonst den anderen.",
  "Ist die Freigabe wahr, wird der Hub ausgeführt, und der andere Zweig bleibt unberührt.",
  "Ist sie falsch, kommt die nächste Frage: Ist die Tür offen? Dann stoppt das Programm, sonst wartet es.",
  "Von mehreren Zweigen wird immer nur einer genommen, und zwar der erste, dessen Bedingung wahr ist.",
  "Wie du das in Python schreibst, zeigt das nächste Video."],
]
SECS = make_secs(SRC)   # Untertitel = anzeige(text), Audio = sprechfassung(text)

# SCENES-FOLGEN
# ---------------------------------------------------------------- Pruefung der Logik (alle Tabellen, die das Video zeigt)
ROWS2 = [(0, 0), (0, 1), (1, 0), (1, 1)]
T_AND = [(a, b, int(a and b)) for a, b in ROWS2]
T_OR = [(a, b, int(a or b)) for a, b in ROWS2]
T_NOT = [(a, int(not a)) for a in (0, 1)]
assert [r[2] for r in T_AND] == [0, 0, 0, 1] and [r[2] for r in T_OR] == [0, 1, 1, 1] and [r[1] for r in T_NOT] == [1, 0]
T_DM = [(a, b, int(not (a and b)), int((not a) or (not b))) for a, b in ROWS2]
assert all(r[2] == r[3] for r in T_DM) and [r[2] for r in T_DM] == [1, 1, 1, 0]
assert all((not (a or b)) == ((not a) and (not b)) for a, b in ROWS2)

def appear_row(t, t0, step, n):
    """Zahl sichtbarer Tabellenzeilen: Zeile k erscheint bei t0 + k*step."""
    return max(0, min(n, int((t - t0) / step) + 1)) if t >= t0 else 0

# ---------------------------------------------------------------- 1 Hook: Zweihandschaltung
def sc1(f, t, ct):
    heading(f, t, "Die Zweihandschaltung einer Presse")
    p1, p2 = ct(1) + 3.5, ct(2) - 0.4
    one0, one1 = ct(2) + 4.0, ct(3) - 0.2
    q1, q2 = ct(3) + 3.0, ct(4) + 1.2
    both = (p1 <= t < p2) or (q1 <= t < q2)
    Lp = both or (one0 <= t < one1); Rp = both
    ram = 140 * (ap(t, p1 + 0.2, 1.2) * (1 - ap(t, p2, 1.0)) + ap(t, q1 + 0.2, 1.2) * (1 - ap(t, q2, 1.0)))
    show(f, t, ct(0) + 0.3, lambda d, dy: press(d, 60, 104 + dy, ram, Lp, Rp))
    def state(d, dy):
        card(d, 720, 140 + dy, 500, 300)
        T2(d, 752, 156 + dy, "Zustand", F(28, 700), GREY)
        for i, (lab, v) in enumerate((("Taster links", Lp), ("Taster rechts", Rp), ("Hub erlaubt", Lp and Rp))):
            y = 212 + i * 74 + dy + (14 if i == 2 else 0)
            T2(d, 752, y + 22, lab, F(32, 600), DARK, "lm")
            pill(d, 1020, y, 160, 44, "wahr" if v else "falsch", GREEN if v else GREY2, size=26)
        d.line((752, 372 + dy, 1188, 372 + dy), fill=LINE, width=2)
    show(f, t, ct(1) + 0.5, state)
    show(f, t, ct(2) + 5.0, lambda d, dy: pill(d, 720, 470 + dy, 500, 52, "ein Taster allein: kein Hub", RED, size=26))
    show(f, t, ct(3) + 0.5, lambda d, dy: pill(d, 720, 540 + dy, 500, 56, "Hub = links  UND  rechts", DARK, size=30))
    show(f, t, ct(4) + 0.3, lambda d, dy: pill(d, 720, 610 + dy, 500, 56, "Boolesche Logik", RED, size=32))

# ---------------------------------------------------------------- 2 Wahrheitswerte
def sc2(f, t, ct):
    heading(f, t, "Wahrheitswerte: wahr oder falsch")
    stm = [("Taster links gedrückt", lambda t: True), ("Tür geschlossen", lambda t: t < ct(1) + 3.0), ("Druck zu hoch", lambda t: t > ct(1) + 5.2)]
    for i, (txt, fn) in enumerate(stm):
        v = fn(t)
        def card_i(d, dy, i=i, txt=txt, v=v):
            y = 130 + i * 118 + dy
            card(d, 60, y, 700, 100)
            T2(d, 96, y + 50, txt, F(34, 600), DARK, "lm")
            pill(d, 560, y + 28, 170, 46, "wahr" if v else "falsch", GREEN if v else GREY2, size=28)
        show(f, t, ct(0) + 0.6 + i * 1.8, card_i)
    def py(d, dy):
        card(d, 800, 130 + dy, 420, 150); T2(d, 832, 142 + dy, "In Python", F(26, 600), GREY)
        pill(d, 832, 190 + dy, 170, 54, "True", GREEN, size=32, mono=True); pill(d, 1020, 190 + dy, 170, 54, "False", GREY2, size=32, mono=True)
    show(f, t, ct(2) + 0.4, py)
    def rc(d, dy):
        card(d, 800, 300 + dy, 420, 150); T2(d, 832, 312 + dy, "Im Rechner", F(26, 600), GREY)
        pill(d, 832, 360 + dy, 170, 54, "1", GREEN, size=36, mono=True); pill(d, 1020, 360 + dy, 170, 54, "0", GREY2, size=36, mono=True)
    show(f, t, ct(3) + 0.4, rc)
    def bd(d, dy):
        d.rounded_rectangle((60, 520 + dy, 1220, 600 + dy), 40, fill=DARK)
        T2(d, 640, 560 + dy, "Bedingung: eine Aussage, die wahr oder falsch ist", F(36, 700), WHITE, "mm")
    show(f, t, ct(4) + 0.4, bd)

# ---------------------------------------------------------------- Schaltungsszenen (UND, ODER, NICHT)
def logic_scene(f, t, ct, kind, title, tab, states, rows_t0, rows_step, heads, widths, caption, labs=("A", "B")):
    heading(f, t, title)
    A, B, act = states(t)
    nshow = appear_row(t, rows_t0, rows_step, len(tab))
    show(f, t, ct(0) + 0.3, lambda d, dy: circuit(d, kind, A, B, 60, 170, labs[0], labs[1], dy=dy))
    show(f, t, ct(0) + 0.8, lambda d, dy: pill(d, 60, 450, 560, 64, caption, DARK, size=30))
    def tb(d, dy):
        T2(d, 740, 140 + dy, "Wahrheitstabelle", F(28, 700), GREY)
        ttable(d, 740, 180 + dy, heads, tab, nshow, act if nshow else None, widths=widths, size=30)
    f.el(ap(t, rows_t0 - 0.2, 0.4), tb)

def sc3(f, t, ct):
    c1, c2, c3, c4 = ct(1), ct(2), ct(3), ct(4)
    def states(t):
        if t < c1 + 0.8: return 0, 0, None
        if t < c1 + 2.4: return 1, 0, None
        if t < c2 + 0.3: return 1, 1, None
        if t < c3: k = min(3, int((t - (c2 + 0.3)) / 1.3)); return ROWS2[k][0], ROWS2[k][1], k
        if t < c4: return 1, 0, 2
        return 1, 1, 3
    logic_scene(f, t, ct, "and", "UND: Reihenschaltung", T_AND, states, c2 + 0.3, 1.3, ["A", "B", "A UND B"], [90, 90, 170], "Reihenschaltung  =  UND")
    show(f, t, c3 + 0.3, lambda d, dy: pill(d, 740, 470 + dy, 480, 52, "ein offener Schalter: unterbrochen", RED, size=26))
    show(f, t, c4 + 0.3, lambda d, dy: pill(d, 740, 540 + dy, 480, 56, "Zweihand: links UND rechts", GREEN, size=28))

def sc4(f, t, ct):
    c1, c2, c3 = ct(1), ct(2), ct(3)
    def states(t):
        if t < c1 + 0.8: return 0, 0, None
        if t < c1 + 2.8: return 1, 0, None
        if t < c1 + 4.8: return 0, 1, None
        if t < c2: return 1, 1, None
        if t < c3:
            k = min(3, int((t - (c2 + 0.2)) / 1.0)) if t >= c2 + 0.2 else 0
            return ROWS2[k][0], ROWS2[k][1], k
        return 1, 1, 3
    logic_scene(f, t, ct, "or", "ODER: Parallelschaltung", T_OR, states, c2 + 0.2, 1.0, ["A", "B", "A ODER B"], [90, 90, 170], "Parallelschaltung  =  ODER")
    show(f, t, c2 + 5.0, lambda d, dy: pill(d, 740, 470 + dy, 480, 52, "falsch nur, wenn beide offen sind", DARK, size=26))
    show(f, t, c3 + 0.3, lambda d, dy: pill(d, 740, 540 + dy, 480, 56, "mindestens ein Schalter genügt", GREEN, size=28))

def sc5(f, t, ct):
    c1, c2, c3 = ct(1), ct(2), ct(3)
    def states(t):
        if t < ct(0) + 3.6: return 0, 0, (0 if t >= ct(0) + 1.0 else None)
        if t < c2: return 1, 0, 1
        k = int((t - c2) / 3.0) % 2
        return k, 0, k
    logic_scene(f, t, ct, "not", "NICHT: der Öffner", T_NOT, states, ct(0) + 1.0, 2.6, ["A", "NICHT A"], [110, 170], "Öffner  =  NICHT")
    show(f, t, c1 + 0.3, lambda d, dy: pill(d, 740, 370 + dy, 480, 52, "in Ruhe geschlossen", DARK, size=26))
    def nh(d, dy):
        cx, cy = 980, 510 + dy
        d.ellipse((cx - 84, cy - 84, cx + 84, cy + 84), fill=(250, 204, 21), outline=DARK, width=4)
        d.ellipse((cx - 62, cy - 62, cx + 62, cy + 62), fill=(214, 20, 36), outline=(150, 10, 24), width=4)
        T2(d, cx, cy, "NOT-HALT", F(26, 700), WHITE, "mm")
        T2(d, cx, cy + 112, "Drücken: Maschine stromlos", F(26, 600), DARK, "mm")
    show(f, t, c3 + 0.3, nh)

# ---------------------------------------------------------------- 6 De Morgan
def sc6(f, t, ct):
    heading(f, t, "Verknüpfen und verneinen: De Morgan")
    def banner(y, txt, fill):
        def fn(d, dy):
            d.rounded_rectangle((60, y + dy, 940, y + 58 + dy), 14, fill=fill)
            T2(d, 90, y + 29 + dy, txt, F(34, 700), DARK, "lm")
        return fn
    show(f, t, ct(0) + 0.5, banner(120, "Freigabe  =  Tür zu  UND  Druck ok", LIGHT_G))
    show(f, t, ct(1) + 0.3, banner(188, "Stopp  =  NICHT (Tür zu UND Druck ok)", LIGHT_R))
    show(f, t, ct(2) + 0.3, banner(256, "Stopp  =  Tür offen  ODER  Druck nicht ok", LIGHT_R))
    show(f, t, ct(2) + 1.0, lambda d, dy: pill(d, 960, 262 + dy, 260, 46, "De Morgan", DARK, size=28))
    nshow = appear_row(t, ct(3) + 0.3, 0.9, 4)
    W6 = [110, 130, 250, 300]
    f.el(ap(t, ct(3) + 0.1, 0.4), lambda d, dy: ttable(d, 60, 336 + dy, ["Tür zu", "Druck ok", "NICHT (A UND B)", "NICHT A ODER NICHT B"], T_DM, nshow, widths=W6, res_cols=2, size=30))
    x0 = 60 + 110 + 6 + 130 + 6; x1 = x0 + 250 + 6 + 300
    def eq(d, dy):
        d.rounded_rectangle((x0 - 6, 330 + dy, x1 + 6, 336 + 5 * 52 + dy - 6), 12, outline=GREEN, width=6)
        pill(d, x0, 612 + dy, 556, 50, "in allen vier Zeilen gleich", GREEN, size=28)
    show(f, t, ct(4) + 0.6, eq)
    def rule(d, dy):
        card(d, 900, 336 + dy, 320, 230)
        T2(d, 924, 352 + dy, "NICHT vor der Klammer:", F(26, 700), DARK)
        T2(d, 924, 398 + dy, "UND wird ODER", F(30, 700), RED)
        T2(d, 924, 442 + dy, "und jeder Teil wird", F(26, 400), GREY); T2(d, 924, 474 + dy, "verneint", F(26, 400), GREY)
    show(f, t, ct(3) + 0.5, rule)

# ---------------------------------------------------------------- 7 Verzweigung
NODES = {"start": (165, 250), "d1": (440, 250), "A": (815, 250), "d2": (440, 450), "B": (815, 380), "C": (815, 520), "M": (1115, 385)}
EDGES = {
    ("start", "d1"): [(270, 250), (310, 250)],
    ("d1", "A"): [(570, 250), (700, 250)],
    ("d1", "d2"): [(440, 312), (440, 388)],
    ("d2", "B"): [(570, 450), (640, 450), (640, 380), (700, 380)],
    ("d2", "C"): [(440, 512), (440, 520), (700, 520)],
    ("A", "M"): [(930, 250), (1115, 250), (1115, 335)],
    ("B", "M"): [(930, 380), (1010, 385)],
    ("C", "M"): [(930, 520), (1115, 520), (1115, 435)],
}
RUNS = {"A": ["start", "d1", "A", "M"], "B": ["start", "d1", "d2", "B", "M"], "C": ["start", "d1", "d2", "C", "M"]}
assert all(k in EDGES for r in RUNS.values() for k in zip(r, r[1:]))

def sc7(f, t, ct):
    heading(f, t, "Verzweigung: die Weiche im Ablauf")
    starts = {"A": ct(1) + 0.2, "B": ct(2) + 2.5, "C": ct(2) + 6.0}
    cur = None
    for k in ("A", "B", "C"):
        if t >= starts[k]: cur = k
    prog = 0.0 if cur is None else (t - starts[cur]) / 0.8
    path = RUNS[cur] if cur else []
    pe = list(zip(path, path[1:]))
    lit = {e for i, e in enumerate(pe) if prog >= i + 1}
    visited = {n for i, n in enumerate(path) if prog >= i}
    def chart(d, dy):
        for e, pts in EDGES.items():
            on = e in lit; col = RED if on else GREY2
            d.line([(x, y + dy) for x, y in pts], fill=col, width=7 if on else 4)
            a, b = pts[-2], pts[-1]; l = math.dist(a, b)
            arrow(d, (b[0] - (b[0] - a[0]) / l * 3, b[1] - (b[1] - a[1]) / l * 3 + dy), (b[0], b[1] + dy), col, 4, 18)
        def box(n, w, h, txt, fill, size=26):
            cx, cy = NODES[n]; vis = n in visited
            d.rounded_rectangle((cx - w / 2, cy - h / 2 + dy, cx + w / 2, cy + h / 2 + dy), 16, fill=fill if vis else WHITE, outline=RED if vis else DARK, width=5 if vis else 3)
            T2(d, cx, cy + dy, txt, F(size, 700), WHITE if (vis and fill in (GREEN, AMBER, (214, 20, 36))) else DARK, "mm")
        def dia(n, hw, hh, txt):
            cx, cy = NODES[n]; vis = n in visited
            d.polygon([(cx - hw, cy + dy), (cx, cy - hh + dy), (cx + hw, cy + dy), (cx, cy + hh + dy)], fill=LIGHT_R if vis else WHITE, outline=RED if vis else DARK, width=5 if vis else 3)
            T2(d, cx, cy + dy, txt, F(24, 700), DARK, "mm")
        box("start", 210, 70, "Eingaben lesen", LIGHT_A)
        dia("d1", 130, 62, "Freigabe wahr?"); dia("d2", 130, 62, "Tür offen?")
        box("A", 230, 70, "Hub freigegeben", GREEN); box("B", 230, 70, "Stopp: Tür offen", (214, 20, 36)); box("C", 230, 70, "Warten", AMBER)
        box("M", 210, 100, "weiter im Programm", LIGHT_A, 22)
        T2(d, 635, 226 + dy, "ja", F(28, 700), GREEN, "mm"); T2(d, 466, 350 + dy, "nein", F(28, 700), RED, "lm")
        T2(d, 610, 426 + dy, "ja", F(28, 700), GREEN, "mm"); T2(d, 466, 538 + dy, "nein", F(28, 700), RED, "lm")
        if cur and prog < len(pe):
            i = int(prog); a, b = pe[i]
            pos = poly_pos([NODES[a]] + EDGES[(a, b)] + [NODES[b]], prog - i)
            d.ellipse((pos[0] - 13, pos[1] + dy - 13, pos[0] + 13, pos[1] + dy + 13), fill=RED, outline=WHITE, width=3)
    show(f, t, ct(0) + 0.4, chart)
    show(f, t, ct(3) + 0.3, lambda d, dy: pill(d, 60, 600 + dy, 740, 56, "Nur ein Zweig wird genommen: der erste mit wahrer Bedingung", DARK, size=26))
    show(f, t, ct(4) + 0.3, lambda d, dy: pill(d, 830, 600 + dy, 390, 56, "Weiter: if, elif, else", RED, size=30))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6, 7: sc7}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V04 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Wahr oder falsch", F(104, 700), DARK)
        T2(d, 90, 300, "Logik für Maschinen", F(52, 400), GREY)
        circuit(d, "and", 1, 1, 90, 400, "links", "rechts")
        T2(d, 740, 372, "Wahrheitstabelle", F(26, 700), GREY)
        ttable(d, 740, 408, ["A", "B", "A UND B"], T_AND, 4, 3, widths=[100, 100, 170], size=28)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch4(HERE, SECS, SCENES, LABEL, poster, NAME)
