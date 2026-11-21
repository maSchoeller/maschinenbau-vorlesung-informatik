"""V05 Theorie: Der PAP wird zum Prompt (Problemanalyse, Programmablaufplan nach DIN 66001, Werkstoff-PAP).
Aufruf: python render.py [text|fake|tts|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from pap import *
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v05-theorie"; LABEL = "DHBW · Informatik · V05 · Problemanalyse und Programmablaufplan"
W16 = "[[16Mo3|sechzehn M O drei]]"; WS235 = "[[S235JR|S zweihundertfünfunddreißig J R]]"; WC45 = "[[C45E|C fünfundvierzig E]]"; W42 = "[[42CrMo4|zweiundvierzig C R M O vier]]"

SRC = [
 ["Du bittest eine KI: Schreib ein Programm, das einen Werkstoff für eine Welle auswählt.",
  "Heraus kommt ein Programm, das nichts fragt und immer Stahl empfiehlt.",
  "Gibst du ihr dagegen deinen Plan als Diagramm, einen Programmablaufplan, entsteht Code mit genau deinen Fragen und Fällen.",
  "Der Programmablaufplan, kurz [[PAP|P A P]], beschreibt das Programm genau: Der [[PAP|P A P]] wird zum Prompt."],
 ["Bevor du zeichnest, analysierst du das Problem in drei Schritten: Eingabe, Verarbeitung, Ausgabe.",
  "Eingabe: Spannung und Temperatur.",
  "Verarbeitung: Entscheidung nach festen Regeln.",
  "Ausgabe: Werkstoffname oder Meldung.",
  "Dann suchst du Randfälle: eine negative Spannung, -500 °C oder ein Wert genau auf der Grenze."],
 ["Ein Programmablaufplan besteht aus wenigen genormten Symbolen nach DIN 66001.",
  "Start und Ende sind Grenzstellen, Ovale mit dem Text Start oder Ende.",
  "Das Rechteck ist eine Operation, eine Zuweisung oder Rechnung, zum Beispiel [[werkstoff = \"C45E\"|werkstoff gleich C fünfundvierzig E]].",
  "Das Parallelogramm steht für Eingabe und Ausgabe, also für `input` und `print`.",
  "Die Ablauflinien verbinden alles: Pfeile von oben nach unten und von links nach rechts."],
 ["Die Raute ist die Verzweigung: Sie stellt eine Frage, und genau zwei Linien führen hinaus, beschriftet mit ja und nein.",
  "In Python wird sie zu `if` und `else`.",
  "Danach laufen die Zweige wieder zusammen: Eine Linie mündet in die andere.",
  "Zwei weitere Symbole nennen wir nur kurz: Die Übergangsstelle, ein kleiner Kreis, setzt eine Linie anderswo fort, und das Unterprogramm kommt in einer späteren Lektion."],
 ["Jetzt entsteht der Plan: Nach dem Start liest er Spannung und Temperatur ein.",
  "Die erste Raute fragt, ob die Eingabe unplausibel ist. Bei ja folgt eine Meldung und das Ende.",
  f"Bei nein fragt die nächste Raute, ob die Temperatur über 300 °C liegt. Bei ja entscheidet die Spannung: bis 200 MPa der {W16}, sonst ein Sonderwerkstoff.",
  f"Bei nein folgt eine Kette von Fragen: bis 140 MPa {WS235}, bis 220 MPa {WC45}, sonst {W42}.",
  "Alle Zweige laufen zusammen, dann folgen Ausgabe und Ende."],
 ["Zum Prüfen läuft eine Marke durch den Plan, hier mit 180 MPa bei 20 °C.",
  f"Zweimal nein bei den ersten Rauten, dann ist die Spannung nicht bis 140, aber bis 220 MPa: Das ergibt {WC45}.",
  "Jeder Weg vom Start bis zum Ende ist ein Testfall. Dieser Plan hat sechs Wege."],
 ["Fünf Regeln helfen beim Zeichnen: ein Start, beschriftete Ausgänge, zusammenlaufende Zweige, keine Kreuzungen und immer Pfeile.",
  "Merke: erst analysieren, dann den Plan zeichnen, dann der Code, von dir oder von der KI.",
  "Der [[PAP|P A P]] wird zum Prompt."],
]
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Beispielcode (Hook), vorab ausgefuehrt
VAGUE = ['werkstoff = "Stahl"', 'print("Empfohlener Werkstoff:", werkstoff)']
GUIDED = ['temperatur = float(input("Temperatur in °C: "))', 'if temperatur > 300:', '    print("16Mo3 (warmfest)")', 'else:', '    print("C45E")']
assert run_in("\n".join(VAGUE), ()) == ["Empfohlener Werkstoff: Stahl"]
assert run_in("\n".join(GUIDED), ("400",)) == ["Temperatur in °C: 400", "16Mo3 (warmfest)"] and run_in("\n".join(GUIDED), ("20",))[1] == "C45E"
fit_check(VAGUE, M(20), 580 - 56 - 14, "Hook links"); fit_check(GUIDED, M(18), 580 - 40 - 14, "Hook rechts")

# ---------------------------------------------------------------- Plaene
def hook_pap():
    """Kleiner PAP zu GUIDED (Hook): Start, Eingabe, Raute, zwei Ausgaben, Zusammenfuehrung, Ende. Planraum 580 breit."""
    D = Dia(17); N = D.node; Q = chr(34); cx = 290
    N("s", "term", "Start", cx, 0); N("e", "io", "temperatur einlesen", cx, 0, minw=210); N("d", "dec", "temperatur > 300 ?", cx, 0)
    N("ja", "io", Q + "16Mo3 (warmfest)" + Q + NL + "ausgeben", 125, 0, minw=200); N("nein", "io", Q + "C45E" + Q + NL + "ausgeben", 455, 0, minw=200); N("z", "term", "Ende", cx, 0)
    n = D.nodes; y = 4
    for k, gap in (("s", 18), ("e", 18), ("d", 30)):
        n[k].cy = y + n[k].h / 2; y += n[k].h + gap
    n["ja"].cy = n["nein"].cy = y + n["ja"].h / 2; y += n["ja"].h + 16; bus = y; y += 14 + 16
    n["z"].cy = y + n["z"].h / 2
    D.edge("s-e", "s", "b", "e", "t"); D.edge("e-d", "e", "b", "d", "t")
    D.edge("d-ja", "d", "l", "ja", "t", label="ja"); D.edge("d-nein", "d", "r", "nein", "t", label="nein")
    D.edge("ja-bus", "ja", "b", (125, bus), None, arrow=False); D.edge("nein-bus", "nein", "b", (455, bus), None, arrow=False)
    D.edge("bus1", (125, bus), None, (cx, bus), None, arrow=False); D.edge("bus2", (cx, bus), None, (455, bus), None, arrow=False)
    D.edge("bus-z", (cx, bus), None, "z", "t")
    return D
HOOK = hook_pap()

def pap_sym(fs=24):
    """Symbole des Hooks in V05-Theorie Szene 3: Start, Eingabe, Operation, Ausgabe, Ende in einer Folge."""
    D = Dia(fs); Q = chr(34)
    D.stack([("s", "term", "Start"), ("e", "io", "spannung einlesen"), ("p", "proc", "werkstoff = " + Q + "C45E" + Q), ("a", "io", "werkstoff ausgeben"), ("z", "term", "Ende")],
            330, 126, gap=34, minw=300)
    return D
SYM = pap_sym()

def raute_pap(fs=21):
    """Szene 4: Raute mit ja/nein, zwei Operationen, Zusammenfuehrung, Ausgabe."""
    D = Dia(fs); N = D.node; Q = chr(34); cx = 290
    N("s", "term", "Start", cx, 0); N("e", "io", "temperatur einlesen", cx, 0, minw=250); N("d", "dec", "temperatur > 300 ?", cx, 0)
    N("ja", "proc", "werkstoff =" + NL + Q + "16Mo3 (warmfest)" + Q, 125, 0, minw=230); N("nein", "proc", "werkstoff =" + NL + Q + "C45E" + Q, 455, 0, minw=230)
    N("a", "io", "werkstoff ausgeben", cx, 0, minw=250); N("z", "term", "Ende", cx, 0)
    n = D.nodes; y = 0
    for k, gap in (("s", 22), ("e", 22), ("d", 34)):
        n[k].cy = y + n[k].h / 2; y += n[k].h + gap
    n["ja"].cy = n["nein"].cy = y + n["ja"].h / 2; y += n["ja"].h + 18; bus = y; y += 14 + 20
    n["a"].cy = y + n["a"].h / 2; y += n["a"].h + 22; n["z"].cy = y + n["z"].h / 2
    E = D.edge
    E("s-e", "s", "b", "e", "t"); E("e-d", "e", "b", "d", "t")
    E("d-ja", "d", "l", "ja", "t", label="ja"); E("d-nein", "d", "r", "nein", "t", label="nein")
    E("ja-bus", "ja", "b", (125, bus), None, arrow=False); E("nein-bus", "nein", "b", (455, bus), None, arrow=False)
    E("bus1", (125, bus), None, (cx, bus), None, arrow=False); E("bus2", (cx, bus), None, (455, bus), None, arrow=False)
    E("bus-a", (cx, bus), None, "a", "t"); E("a-z", "a", "b", "z", "t")
    return D
RAUTE = raute_pap()
RAUTE_CODE = ['temperatur = float(input("Temperatur in °C: "))', 'if temperatur > 300:', '    werkstoff = "16Mo3 (warmfest)"', 'else:', '    werkstoff = "C45E"', 'print(werkstoff)']
assert run_in("\n".join(RAUTE_CODE), ("400",))[1] == "16Mo3 (warmfest)" and run_in("\n".join(RAUTE_CODE), ("20",))[1] == "C45E"
fit_check(RAUTE_CODE, M(19), 590 - 50 - 14, "Raute-Code")

WS = werkstoff_pap()            # Planraum ca. 1200 x 636
ZOOM = 0.9
WBOX = (32, 104, 1216, 580)
def wcam(): return (0, 0)

# ---------------------------------------------------------------- 1 Hook
def sc1(f, t, ct):
    heading(f, t, "Vager Auftrag oder Programmablaufplan?")
    LX, LW, RX, RW = 40, 580, 660, 580
    def lab(d, dy, x, txt, col): T2(d, x, 108 + dy, txt, F(24, 700), col)
    f.el(ap(t, ct(0) + 0.2, 0.4), lambda d, dy: lab(d, dy, LX, "Vager Auftrag an die KI", GREY))
    def bubble(d, dy):
        d.rounded_rectangle((LX, 142 + dy, LX + LW, 222 + dy), 16, fill=WHITE, outline=LINE, width=2)
        T2(d, LX + 24, 150 + dy, "Schreib ein Programm, das einen", F(26, 400), DARK)
        T2(d, LX + 24, 184 + dy, "Werkstoff für eine Welle auswählt.", F(26, 400), DARK)
    f.el(ap(t, ct(0) + 1.0, 0.5), bubble, dy=int((1 - ap(t, ct(0) + 1.0, 0.5)) * 10))
    f.el(ap(t, ct(1) + 0.3, 0.5), lambda d, dy: code_panel(d, LX, 250 + dy, LW, VAGUE, [-1, -1], t, 20, lineno=False, title="Antwort der KI (Beispiel, gekürzt)"))
    f.el(ap(t, ct(1) + 1.6, 0.4), lambda d, dy: console_panel(d, LX, 392 + dy, LW, 86, [(ct(1) + 1.8, [("Empfohlener Werkstoff: Stahl", CODE_T)])], t, 20, lh=30))
    pill(f, t, ct(1) + 3.2, LX, 500, LW, "Rät: fragt nichts, kennt keine Fälle", RED, 52, 26)
    f.el(ap(t, ct(2) + 0.2, 0.4), lambda d, dy: lab(d, dy, RX, "Programmablaufplan als Auftrag", GREEN))
    tm = {"s": ct(2) + 0.8, "s-e": ct(2) + 1.1, "e": ct(2) + 1.4, "e-d": ct(2) + 1.7, "d": ct(2) + 2.0, "d-ja": ct(2) + 3.2, "ja": ct(2) + 3.5,
          "d-nein": ct(2) + 4.2, "nein": ct(2) + 4.5, "ja-bus": ct(2) + 5.0, "nein-bus": ct(2) + 5.0, "bus1": ct(2) + 5.2, "bus2": ct(2) + 5.2, "bus-z": ct(2) + 5.6, "z": ct(2) + 5.8}
    pap_view(f, ap(t, ct(2) + 0.6, 0.3), HOOK, (RX, 146, RW, 350), (0, 2), vis=reveal(t, tm), zoom=1.0)
    f.el(ap(t, ct(3) + 0.3, 0.5), lambda d, dy: code_panel(d, RX, 508 + dy, RW, GUIDED, [-1] * 5, t, 18, lineno=False))

# ---------------------------------------------------------------- 2 Problemanalyse
def sc2(f, t, ct):
    heading(f, t, "Problemanalyse: Eingabe, Verarbeitung, Ausgabe")
    cards = [(60, "Eingabe", ["spannung in MPa", "temperatur in °C"], ct(1) + 0.2, PAL[0]),
             (460, "Verarbeitung", ["Entscheidung nach", "festen Regeln"], ct(2) + 0.2, PAL[1]),
             (860, "Ausgabe", ["Werkstoffname", "oder Meldung"], ct(3) + 0.2, PAL[2])]
    for i, (x, tit, lines, t0, col) in enumerate(cards):
        a = ap(t, t0, 0.5)
        def fn(d, dy, x=x, tit=tit, lines=lines, col=col, i=i):
            d.rounded_rectangle((x, 130 + dy, x + 360, 300 + dy), 14, fill=WHITE, outline=col, width=3)
            d.rounded_rectangle((x, 130 + dy, x + 360, 180 + dy), 14, fill=col); d.rectangle((x, 160 + dy, x + 360, 180 + dy), fill=col)
            T2(d, x + 24, 138 + dy, f"{i+1}  {tit}", F(30, 700), WHITE)
            for k, ln in enumerate(lines): T2(d, x + 24, 200 + k * 40 + dy, ln, F(30, 400), DARK)
        f.el(a, fn, dy=int((1 - a) * 12))
    def arrows(d, dy):
        for x0, x1, tt in ((420, 456, ct(2) + 0.2), (820, 856, ct(3) + 0.2)):
            if t > tt: arrow(d, x0, 215 + dy, x1, 215 + dy, DARK, 4, 12)
    f.el(1, arrows)
    def rand(d, dy):
        T2(d, 60, 346 + dy, "Randfälle der Temperatur", F(30, 700), DARK)
        xa = lambda v: 140 + (v + 100) / 800 * 1000
        d.rectangle((xa(-50), 456 + dy, xa(600), 480 + dy), fill=(190, 232, 206))
        T2(d, xa(100), 468 + dy, "erlaubter Bereich", F(22, 600), (22, 120, 60), "mm")
        d.line((140, 500 + dy, 1140, 500 + dy), fill=DARK, width=4)
        for v in (-50, 0, 300, 600):
            d.line((xa(v), 492 + dy, xa(v), 508 + dy), fill=DARK, width=3)
            T2(d, xa(v), 516 + dy, f"{v} °C".replace("-", "−"), F(22, 400), GREY, "ma")
        if t > ct(4) + 5.8:
            m = xa(300)
            d.polygon([(m, 496 + dy), (m - 12, 440 + dy), (m + 12, 440 + dy)], fill=AMBER)
            T2(d, m, 408 + dy, "genau 300: Grenze", F(24, 700), (170, 110, 0), "mm")
        if t > ct(4) + 3.6:
            arrow(d, 150, 450 + dy, 70, 450 + dy, RED, 5, 14); T2(d, 70, 412 + dy, "−500 °C", F(26, 700), RED, "lm")
    f.el(ap(t, ct(4) + 0.3, 0.5), rand)
    def chips(d, dy):
        d.rounded_rectangle((60, 590 + dy, 440, 640 + dy), 25, fill=RED)
        T2(d, 250, 615 + dy, "spannung ≤ 0 (negativ)", F(26, 700), WHITE, "mm")
    f.el(ap(t, ct(4) + 1.8, 0.5), chips)

# ---------------------------------------------------------------- 3 Symbole: Grenzstelle, Operation, Ein-/Ausgabe, Ablauflinie
def sc3(f, t, ct):
    heading(f, t, "Die Symbole des Programmablaufplans")
    tm = {"s": ct(1) + 0.4, "z": ct(1) + 1.4, "e": ct(3) + 0.2, "a": ct(3) + 1.4, "p": ct(2) + 0.2}
    for k in ("s-e", "e-p", "p-a", "a-z"): tm[k] = ct(4) + 0.2
    hl = {}
    if ct(1) < t < ct(2): hl = {"s": PAL[0], "z": PAL[0]}
    elif ct(2) < t < ct(3): hl = {"p": PAL[1]}
    elif ct(3) < t < ct(4): hl = {"e": PAL[2], "a": PAL[2]}
    elif t > ct(4) + 0.4: hl = {k: RED for k in ("s-e", "e-p", "p-a", "a-z")}
    pap_view(f, ap(t, 0.2, 0.3), SYM, (60, 108, 600, 560), (90, 112), vis=reveal(t, tm), hl=hl, zoom=1.25)
    note(f, t, ct(0) + 0.6, 700, 130, 530, 100, "DIN 66001", ["genormte Symbole, in der Klausur gefordert"], DARK, bsz=26)
    note(f, t, ct(1) + 0.4, 700, 250, 530, 100, "Grenzstelle: Oval", ["Start und Ende, kein Python-Befehl"], PAL[0], bsz=26)
    note(f, t, ct(2) + 0.3, 700, 370, 530, 100, "Operation: Rechteck", ["werkstoff = \"C45E\"  (Zuweisung, Rechnung)"], PAL[1], bsz=26)
    note(f, t, ct(3) + 0.3, 700, 490, 530, 100, "Ein-/Ausgabe: Parallelogramm", ["input()  und  print()"], PAL[2], bsz=26)
    pill(f, t, ct(4) + 1.0, 700, 612, 530, "Ablauflinie: Pfeil, oben nach unten", RED, 52, 26)

# ---------------------------------------------------------------- 4 Raute, Zusammenfuehrung, Uebergangsstelle, Unterprogramm
def sc4(f, t, ct):
    heading(f, t, "Die Raute: Verzweigung")
    tm = {"s": 0.3, "s-e": 0.4, "e": 0.5, "e-d": 0.6, "d": ct(0) + 0.2, "d-ja": ct(0) + 4.0, "ja": ct(0) + 4.3, "d-nein": ct(0) + 5.0, "nein": ct(0) + 5.3,
          "ja-bus": ct(2) + 0.3, "nein-bus": ct(2) + 0.3, "bus1": ct(2) + 1.0, "bus2": ct(2) + 1.0, "bus-a": ct(2) + 2.2, "a": ct(2) + 2.4, "a-z": ct(2) + 3.0, "z": ct(2) + 3.2}
    hl = {}
    if ct(0) < t < ct(2): hl = {"d": RED, "d-ja": RED, "d-nein": RED}
    if ct(2) < t < ct(3): hl = {k: RED for k in ("ja-bus", "nein-bus", "bus1", "bus2", "bus-a")}
    pap_view(f, ap(t, 0.2, 0.3), RAUTE, (40, 106, 580, 520), (0, 0), vis=reveal(t, tm), hl=hl)
    cols = {}; act = None
    if t > ct(0) + 0.2: cols[1] = PAL[0]
    if t > ct(1) - 0.2: cols.update({1: PAL[0], 2: PAL[1], 3: PAL[0], 4: PAL[3]}); act = {1, 2, 3, 4}
    if t > ct(2) - 0.2: cols[5] = PAL[4]; act = {5}
    times = [0.4, ct(0) + 0.2, ct(1) + 0.4, ct(1) + 1.0, ct(1) + 1.6, ct(2) + 2.4]
    f.el(ap(t, 0.2, 0.3), lambda d, dy: code_c(d, 660, 124 + dy, 590, RAUTE_CODE, times, t, 19, 28, cols, act, off=50))
    note(f, t, ct(1) + 0.6, 660, 374, 590, 84, "Raute  =  if", ["ja-Zweig eingerückt unter if, nein-Zweig unter else"], PAL[0], bsz=24)
    note(f, t, ct(2) + 0.6, 660, 374, 590, 84, "Zusammenführung", ["Ende der Einrückung: dann geht es gemeinsam weiter"], PAL[4], tout=ct(3) - 0.2, bsz=24)
    # Uebergangsstelle und Unterprogramm als kleine Symbole
    def sym(d, dy):
        d.rounded_rectangle((660, 470 + dy, 1250, 660 + dy), 14, fill=WHITE, outline=LINE, width=2)
        T2(d, 690, 484 + dy, "Zwei weitere Symbole", F(24, 700), DARK)
    f.el(ap(t, ct(3) + 0.2, 0.4), sym)
    Dm = Dia(22); Dm.node("c", "conn", "1", 90, 70, w=48, h=48); Dm.node("u", "sub", "Unterprogramm", 400, 70, minw=190)
    hl2 = {"c": RED} if ct(3) + 1.0 < t < ct(3) + 6.2 else ({"u": RED} if t > ct(3) + 6.6 else {})
    pap_view(f, ap(t, ct(3) + 0.5, 0.4), Dm, (680, 530, 540, 100), (0, 20), bg=WHITE, hl=hl2)
    f.el(ap(t, ct(3) + 0.8, 0.4), lambda d, dy: T2(d, 775, 640 + dy, "Übergangsstelle", F(20, 600), GREY, "mm"))
    f.el(ap(t, ct(3) + 6.4, 0.4), lambda d, dy: T2(d, 1080, 640 + dy, "Unterprogramm (später)", F(20, 600), GREY, "mm"))

# ---------------------------------------------------------------- 5 Der Werkstoff-PAP entsteht
def sc5(f, t, ct):
    heading(f, t, "Der Plan für den Werkstoffvorschlag")
    T0 = {0: ct(0) + 1.2, 1: ct(1) + 0.4, 2: ct(2) + 0.4, 3: ct(3) + 0.4, 4: ct(4) + 0.3}
    tm = {}
    def add(keys, t0, step=0.35):
        for i, k in enumerate(keys): tm[k] = t0 + i * step
    tm["s"] = ct(0) + 0.2
    add(["s-e1", "e1", "e1-e2", "e2"], ct(0) + 1.4, 0.5)
    add(["e2-d1", "d1", "d1-meld", "meld", "meld-ende1", "ende1"], ct(1) + 0.3, 0.9)
    add(["d1-d2", "d2", "d2-d3", "d3", "d3-w16", "w16", "d3-wson", "wson"], ct(2) + 0.3, 1.3)
    add(["d2-d140", "d140", "d140-w235", "w235", "d140-d220", "d220", "d220-w45", "w45", "d220-w42", "w42"], ct(3) + 0.3, 1.0)
    add(["w235-bus", "w45-bus", "w42-bus", "w16-bus", "wson-bus", "bus1", "bus2", "bus3", "bus4", "bus-aus", "aus", "aus-ende", "ende"], ct(4) + 0.1, 0.27)
    # Hervorhebung: das gerade erklaerte Teilstueck in Rot
    hl = {}
    grp = [(0, 1, ["s", "e1", "e2"]), (1, 2, ["d1", "meld", "ende1", "d1-meld", "meld-ende1"]),
           (2, 3, ["d2", "d3", "w16", "wson", "d2-d3", "d3-w16", "d3-wson"]), (3, 4, ["d140", "d220", "w235", "w45", "w42", "d140-w235", "d140-d220", "d220-w45", "d220-w42"]),
           (4, 5, ["aus", "ende", "bus-aus", "aus-ende"])]
    for a, b, ks in grp:
        t_a = ct(a) + 0.2; t_b = ct(b) + 0.0 if b < 5 else 1e9
        if t_a < t < t_b: hl = {k: RED for k in ks}
    pap_view(f, ap(t, 0.2, 0.3), WS, WBOX, wcam(), vis=reveal(t, tm), hl=hl, zoom=ZOOM)
    def card_u(d, dy):
        card(d, 800, 108 + dy, 440, 128)
        T2(d, 826, 118 + dy, "unplausibel heißt:", F(24, 700), DARK)
        for i, ln in enumerate(["spannung ≤ 0  oder", "temperatur < −50  oder", "temperatur > 600"]): T2(d, 826, 154 + i * 26 + dy, ln, F(22, 400), GREY)
    f.el(ap(t, ct(1) + 0.8, 0.5) , card_u)

# ---------------------------------------------------------------- 6 Marke laeuft
PFADE = ["unplausibel", "heiss_sonder", "heiss_16", "kalt_235", "kalt_45", "kalt_42"]
assert set(PFADE) == set(PFAD_KEYS)
def sc6(f, t, ct):
    heading(f, t, "Eine Marke läuft durch den Plan")
    keys = PFAD_KEYS["kalt_45"]; poly = WS.route(keys)
    run0 = ct(0) + 5.0; speed = 0.088          # Anteil der Gesamtlaenge je Sekunde
    prog = clamp((t - run0) * speed) if t >= run0 else 0.0
    L = sum(math.dist(a, b) for a, b in zip(poly, poly[1:]))
    # bereits durchlaufene Kanten rot
    hl = {}; vis_nodes = {}
    done = prog * L; acc = 0.0
    for k in keys:
        pts = WS.edges[k[1:]].pts[::-1] if k.startswith("~") else WS.edges[k].pts
        l = sum(math.dist(a, b) for a, b in zip(pts, pts[1:]))
        if acc + l <= done + 0.5: hl[k] = RED
        acc += l
    if prog > 0:
        mx, my = along(poly, prog)
        for k, nd in WS.nodes.items():
            x0, y0, x1, y1 = nd.bbox(); hit = x0 - 6 <= mx <= x1 + 6 and y0 - 6 <= my <= y1 + 6
            for ek in hl:                     # Knoten, in die eine durchlaufene Kante muendet
                if ek in WS.edges:
                    ex, ey = WS.edges[ek].pts[-1]
                    if x0 - 3 <= ex <= x1 + 3 and y0 - 3 <= ey <= y1 + 3: hit = True
            if k == "s" or hit: hl[k] = RED
    mk = along(poly, prog) if t >= run0 else None
    pap_view(f, ap(t, 0.2, 0.3), WS, WBOX, wcam(), hl=hl, marker=mk, zoom=ZOOM)
    def card_in(d, dy):
        card(d, 800, 108 + dy, 440, 128)
        T2(d, 826, 118 + dy, "Testlauf", F(26, 700), DARK)
        T2(d, 826, 156 + dy, "spannung = 180 MPa", F(24, 400), GREY); T2(d, 826, 188 + dy, "temperatur = 20 °C", F(24, 400), GREY)
    f.el(ap(t, ct(0) + 0.3, 0.5), card_in)
    # Ergebnis
    tend = run0 + 1.0 / speed
    def res(d, dy):
        d.rounded_rectangle((800, 248 + dy, 1240, 300 + dy), 26, fill=GREEN)
        T2(d, 1020, 274 + dy, "Ergebnis: C45E", F(28, 700), WHITE, "mm")
    f.el(ap(t, min(tend, ct(2) + 5.0), 0.5), res)
    # sechs Wege
    if t > ct(2) + 1.0:
        a = ap(t, ct(2) + 1.0, 0.5)
        cols = {"meld": PAL[0], "wson": PAL[1], "w16": PAL[2], "w235": PAL[3], "w45": PAL[4], "w42": PAL[5]}
        pap_view(f, a, WS, WBOX, wcam(), hl=cols, zoom=ZOOM)
        pill(f, t, ct(2) + 2.4, 800, 612, 440, "6 Wege = 6 Testfälle", RED, 52, 28)

# ---------------------------------------------------------------- 7 Regeln und Prompt
def sc7(f, t, ct):
    heading(f, t, "Regeln für den Plan")
    rules = ["genau ein Start, mindestens ein Ende", "jede Raute: ein Eingang, Ausgänge mit ja und nein", "Zweige laufen wieder zusammen",
             "Linien kreuzen sich nicht (sonst Übergangsstelle)", "Pfeile immer zeichnen"]
    for i, r in enumerate(rules):
        t0 = ct(0) + 1.0 + i * 1.4; a = ap(t, t0, 0.4)
        def fn(d, dy, i=i, r=r):
            y = 126 + i * 78 + dy
            card(d, 60, y, 700, 64); check(d, 84, y + 22, GREEN, 1.0, 5)
            sz = 28
            while F(sz, 600).getlength(r) > 620 and sz > 18: sz -= 1
            T2(d, 130, y + 32, r, F(sz, 600), DARK, "lm")
        f.el(a, fn, dy=int((1 - a) * 12))
    note(f, t, ct(0) + 5.5, 800, 126, 440, 110, "Text im Symbol", ["kurz und eindeutig;", "Bedingung als Frage"], PAL[1], bsz=26)
    def steps(d, dy):
        labs = ["1  analysieren", "2  Plan zeichnen", "3  Code"]; xs = [60, 380, 720]; ws = [290, 300, 180]
        for i, (x, w_, txt) in enumerate(zip(xs, ws, labs)):
            a = ap(t, ct(1) + 0.6 + i * 1.6, 0.4)
            if a <= 0: continue
            d.rounded_rectangle((x, 560 + dy, x + w_, 612 + dy), 26, fill=mix(BG, DARK, a)); T2(d, x + w_ / 2, 586 + dy, txt, F(28, 700), mix(BG, WHITE, a), "mm")
            if i < 2: arrow(d, x + w_ + 6, 586 + dy, x + w_ + 28, 586 + dy, mix(BG, DARK, a), 4, 12)
    f.el(1, steps)
    def big(d, dy):
        d.rounded_rectangle((60, 630 + dy, 1220, 690 + dy), 30, fill=RED)
        T2(d, 640, 660 + dy, "Der PAP wird zum Prompt", F(36, 700), WHITE, "mm")
    f.el(ap(t, ct(2) + 0.3, 0.5), big, dy=int((1 - ap(t, ct(2) + 0.3, 0.5)) * 12))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6, 7: sc7}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V05 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Der PAP wird", F(100, 700), DARK)
        T2(d, 90, 272, "zum Prompt", F(100, 700), RED)
        T2(d, 90, 410, "Problemanalyse und", F(46, 400), GREY); T2(d, 90, 466, "Programmablaufplan", F(46, 400), GREY)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn)
    f.img.paste(HOOK.render((520, 352), (28, 2), zoom=1.0), (708, 320)); f.img.save(path)

if __name__ == "__main__":
    modus(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
