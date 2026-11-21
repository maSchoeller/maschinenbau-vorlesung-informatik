"""V05 Theorie: Erst denken, dann tippen: das Struktogramm (Problemanalyse, Nassi-Shneiderman-Symbole, PAP).
Aufruf: python render.py [text|fake|tts|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v05-common"))
from ns import *
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v05-theorie"; LABEL = "DHBW · Informatik · V05 · Problemanalyse und Struktogramm"
WS235 = "[[S235JR|S zweihundertfünfunddreißig J R]]"; WC45 = "[[C45E|C fünfundvierzig E]]"; W42 = "[[42CrMo4|zweiundvierzig C R M O vier]]"

SRC = [
 ["Du bittest eine KI: Schreib ein Programm, das einen Werkstoff für eine Welle auswählt.",
  "Heraus kommt ein Programm, das nichts fragt und immer Stahl empfiehlt.",
  "Gibst du ihr dagegen ein Struktogramm, also deinen Plan als Diagramm, entsteht Code mit genau den Fragen und Fällen, die du meinst.",
  "Das Struktogramm ist die Spezifikation, also die genaue Beschreibung des Programms. Und die schreibst du."],
 ["Bevor du zeichnest, analysierst du das Problem in drei Schritten: Eingabe, Verarbeitung, Ausgabe.",
  "Eingabe: die Spannung in MPa und die Temperatur in °C.",
  "Verarbeitung: eine Entscheidung nach festen Regeln.",
  "Ausgabe: ein Werkstoffname oder eine Meldung.",
  "Dann suchst du Randfälle, also Eingaben am Rand oder außerhalb des erlaubten Bereichs: eine negative Spannung, -500 °C oder ein Wert genau auf der Grenze."],
 ["Ein Struktogramm besteht aus wenigen Bausteinen, entwickelt von Nassi und [[Shneiderman|Schneiderman]].",
  "Die Anweisung ist ein Rechteck mit genau einem Schritt, zum Beispiel: Spannung einlesen.",
  "Mehrere Anweisungen untereinander bilden eine Sequenz: Sie laufen von oben nach unten ab."],
 ["Die Verzweigung stellt eine Frage und teilt den Ablauf in zwei Wege.",
  "Die Bedingung steht im Dreieck, links der Weg für ja, rechts der für nein.",
  "Genau ein Zweig wird ausgeführt, nie beide.",
  "Beispiel: Über 300 °C ein warmfester Stahl, sonst ein normaler."],
 ["Bei mehr als zwei Fällen nimmst du die Mehrfachauswahl: eine Frage, mehrere Spalten, genau eine läuft.",
  f"Beispiel Spannung: bis 140 MPa {WS235}, bis 220 MPa {WC45}, sonst {W42}.",
  "Die Schleife folgt später: Ein Rahmen wiederholt seinen Inhalt, solange die Bedingung gilt."],
 ["Vielleicht kennst du den Programmablaufplan, kurz [[PAP|P A P]], mit Rauten und Pfeilen.",
  "Dort zeigen Pfeile den Fluss, das Struktogramm kennt keine Sprünge, nur Verschachtelung.",
  "Darum lässt sich ein Struktogramm fast eins zu eins in Code übersetzen.",
  "Merke: erst analysieren, dann das Struktogramm, dann der Code, von dir oder von der KI."],
]
SECS = make_secs(SRC)

# ---------------------------------------------------------------- Beispielcode (Hook), vorab ausgefuehrt
VAGUE = ['werkstoff = "Stahl"', 'print("Empfohlener Werkstoff:", werkstoff)']
GUIDED = ['temperatur = float(input("Temperatur in °C: "))', 'if temperatur > 300:', '    print("Werkstoff: 16Mo3 (warmfest)")', 'else:', '    print("Werkstoff: C45E")']
assert run_in("\n".join(VAGUE), ()) == ["Empfohlener Werkstoff: Stahl"]
G400 = run_in("\n".join(GUIDED), ("400",)); G20 = run_in("\n".join(GUIDED), ("20",))
assert G400 == ["Temperatur in °C: 400", "Werkstoff: 16Mo3 (warmfest)"] and G20 == ["Temperatur in °C: 20", "Werkstoff: C45E"]
fit_check(VAGUE, M(20), 580 - 56 - 14, "Hook links"); fit_check(GUIDED, M(18), 580 - 56 - 14, "Hook rechts")
assert 300 < 400 and not 300 < 20

def NSX(fs=18, pv=7, **kw): return NS(fs=fs, pv=pv, **kw)

# ---------------------------------------------------------------- 1 Hook
def sc1(f, t, ct):
    heading(f, t, "Vager Auftrag oder Struktogramm?")
    LX, LW, RX, RW = 40, 580, 660, 580
    # links: vager Prompt
    def lab(d, dy, x, txt, col):
        T2(d, x, 108 + dy, txt, F(24, 700), col)
    f.el(ap(t, ct(0) + 0.2, 0.4), lambda d, dy: lab(d, dy, LX, "Vager Auftrag an die KI", GREY))
    def bubble(d, dy):
        d.rounded_rectangle((LX, 142 + dy, LX + LW, 222 + dy), 16, fill=WHITE, outline=LINE, width=2)
        T2(d, LX + 24, 150 + dy, "Schreib ein Programm, das einen", F(26, 400), DARK)
        T2(d, LX + 24, 184 + dy, "Werkstoff für eine Welle auswählt.", F(26, 400), DARK)
    f.el(ap(t, ct(0) + 1.0, 0.5), bubble, dy=int((1 - ap(t, ct(0) + 1.0, 0.5)) * 10))
    f.el(ap(t, ct(1) + 0.3, 0.5), lambda d, dy: code_panel(d, LX, 250 + dy, LW, VAGUE, [-1, -1], t, 20, lineno=False, title="Antwort der KI (Beispiel, gekürzt)"))
    f.el(ap(t, ct(1) + 1.6, 0.4), lambda d, dy: console_panel(d, LX, 392 + dy, LW, 86, [(ct(1) + 1.8, [("Empfohlener Werkstoff: Stahl", CODE_T)])], t, 20, lh=30))
    pill(f, t, ct(1) + 3.2, LX, 500, LW, "Rät: fragt nichts, kennt keine Fälle", RED, 52, 26)
    # rechts: Struktogramm als Auftrag
    f.el(ap(t, ct(2) + 0.2, 0.4), lambda d, dy: lab(d, dy, RX, "Struktogramm als Auftrag", GREEN))
    tm = {"e": ct(2) + 0.8, "i": ct(2) + 2.0, "y": ct(2) + 4.0, "n": ct(2) + 5.0}
    ns = NSX(vis=reveal(t, tm))
    dg = [A("Eingabe: temperatur in °C", "e"), IF("temperatur > 300 ?", [A("Ausgabe:\n16Mo3 (warmfest)", "y")], [A("Ausgabe:\nC45E", "n")], key="i")]
    f.el(ap(t, ct(2) + 0.6, 0.3), lambda d, dy: ns.draw(d, dg, RX, 142 + dy, RW))
    f.el(ap(t, ct(3) + 0.3, 0.5), lambda d, dy: code_panel(d, RX, 350 + dy, RW, GUIDED, [-1] * 5, t, 18, lineno=False, title="Antwort der KI (Beispiel, gekürzt)"))
    ents = [(ct(3) + 1.8, [(G400[0], CODE_T)]), (ct(3) + 2.4, [(G400[1], CODE_G)])]
    f.el(ap(t, ct(3) + 1.6, 0.4), lambda d, dy: console_panel(d, RX, 566 + dy, RW, 106, ents, t, 18, lh=28))

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
    # Randfaelle
    def rand(d, dy):
        T2(d, 60, 346 + dy, "Randfälle der Temperatur", F(30, 700), DARK)
        xa = lambda v: 140 + (v + 100) / 800 * 1000
        d.rectangle((xa(-50), 456 + dy, xa(600), 480 + dy), fill=(190, 232, 206))
        T2(d, (xa(-50) + xa(600)) / 2, 468 + dy, "erlaubter Bereich", F(22, 600), (22, 120, 60), "mm")
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

# ---------------------------------------------------------------- 3 Anweisung und Sequenz
def sc3(f, t, ct):
    heading(f, t, "Anweisung und Sequenz")
    tm = {"a1": ct(1) + 0.8, "a2": ct(2) + 1.2, "a3": ct(2) + 3.0, "a4": ct(2) + 4.8}
    ns = NSX(fs=30, pv=13, vis=reveal(t, tm)); hl = {"a1": PAL[0]} if ct(1) < t < ct(2) else {}
    ns.fill = hl_fill(hl)
    dg = [A("Spannung einlesen", "a1"), A("Temperatur einlesen", "a2"), A("Werkstoff bestimmen", "a3"), A("Werkstoff ausgeben", "a4")]
    f.el(ap(t, ct(0) + 0.3, 0.3), lambda d, dy: ns.draw(d, dg, 170, 170 + dy, 520))
    def pf(d, dy):
        if t > ct(2) + 0.6:
            arrow(d, 100, 180 + dy, 100, 490 + dy, RED, 5, 16); T2(d, 100, 510 + dy, "Reihenfolge", F(22, 700), RED, "mm")
    f.el(1, pf)
    note(f, t, ct(0) + 1.5, 730, 130, 500, 110, "Nassi-Shneiderman", ["Struktogramm, benannt nach", "Isaac Nassi und Ben Shneiderman"], DARK, bsz=26)
    note(f, t, ct(1) + 0.6, 730, 270, 500, 110, "Anweisung", ["ein Rechteck, ein Schritt"], PAL[0], bsz=26)
    note(f, t, ct(2) + 0.6, 730, 410, 500, 110, "Sequenz", ["Anweisungen untereinander,", "von oben nach unten"], RED, bsz=26)

# ---------------------------------------------------------------- 4 Verzweigung
def sc4(f, t, ct):
    heading(f, t, "Verzweigung")
    tm = {"i": ct(0) + 0.8, "y": ct(1) + 4.0, "n": ct(1) + 5.5}
    ph = t - (ct(2) + 0.6); hl = {}; badge = None
    if 0 <= ph < 3.2: hl = {"y": GREEN, "i": GREEN}; badge = "Temperatur 400 °C: ja"
    elif 3.2 <= ph < 6.4: hl = {"n": GREEN, "i": GREEN}; badge = "Temperatur 20 °C: nein"
    ns = NSX(fs=28, pv=10, vis=reveal(t, tm), fill=hl_fill(hl))
    dg = [IF("temperatur > 300 ?", [A("Werkstoff:\n16Mo3 (warmfest)", "y")], [A("Werkstoff:\nC45E", "n")], key="i")]
    f.el(ap(t, ct(0) + 0.3, 0.3), lambda d, dy: ns.draw(d, dg, 60, 170 + dy, 660))
    if badge: pill(f, t, 0, 130, 440, 520, badge, GREEN, 56, 28)
    note(f, t, ct(1) + 0.4, 780, 130, 450, 110, "Bedingung im Dreieck", ["links ja, rechts nein"], DARK, bsz=26)
    note(f, t, ct(2) + 0.4, 780, 270, 450, 110, "Genau ein Zweig", ["nie beide, nie keiner"], GREEN, bsz=26)

# ---------------------------------------------------------------- 5 Mehrfachauswahl und Schleife
def sc5(f, t, ct):
    heading(f, t, "Mehrfachauswahl und Schleife")
    tm = {"sw": ct(0) + 0.8, "l1": ct(1) + 3.2, "s1": ct(1) + 3.6, "l2": ct(1) + 5.6, "s2": ct(1) + 6.0, "l3": ct(1) + 8.2, "s3": ct(1) + 8.6}
    ns = NSX(fs=26, pv=10, vis=reveal(t, tm))
    dg = [SW("spannung", [("≤ 140", [A("S235JR", "s1")], "l1"), ("≤ 220", [A("C45E", "s2")], "l2"), ("sonst", [A("42CrMo4", "s3")], "l3")], key="sw")]
    f.el(ap(t, ct(0) + 0.3, 0.3), lambda d, dy: ns.draw(d, dg, 40, 170 + dy, 640))
    def tag(d, dy):
        T2(d, 40, 112 + dy, "Mehrfachauswahl", F(28, 700), DARK); T2(d, 740, 112 + dy, "Schleife (Vorschau)", F(28, 700), GREY)
    f.el(ap(t, ct(0) + 0.3, 0.3), tag)
    ns2 = NSX(fs=26, pv=10, vis=reveal(t, {"lp": ct(2) + 0.8}))
    lp = [LOOP("solange Bedingung gilt", [A("Anweisung wiederholen")], key="lp")]
    f.el(ap(t, ct(2) + 0.5, 0.4), lambda d, dy: ns2.draw(d, lp, 740, 170 + dy, 500))
    pill(f, t, ct(2) + 2.2, 740, 320, 380, "kommt in einer späteren Lektion", AMBER, 44, 20)
    note(f, t, ct(0) + 3.5, 40, 400, 640, 110, "Eine Frage, mehrere Spalten", ["genau eine Spalte wird ausgeführt"], PAL[1], bsz=26)

# ---------------------------------------------------------------- 6 PAP im Vergleich
def sc6(f, t, ct):
    heading(f, t, "PAP und Struktogramm")
    oy = 40
    def pap(d, dy):
        y = dy + oy; c = DARK
        T2(d, 300, 112 + dy, "Programmablaufplan (PAP)", F(26, 700), DARK, "mm")
        d.rounded_rectangle((230, 125 + y, 370, 165 + y), 20, outline=c, width=3, fill=WHITE); T2(d, 300, 145 + y, "Start", F(22, 600), DARK, "mm")
        arrow(d, 300, 165 + y, 300, 195 + y, c, 3, 11)
        d.polygon([(200, 195 + y), (410, 195 + y), (380, 235 + y), (170, 235 + y)], outline=c, fill=WHITE, width=3); T2(d, 290, 215 + y, "Eingabe: temperatur", F(20, 600), DARK, "mm")
        arrow(d, 300, 235 + y, 300, 262 + y, c, 3, 11)
        d.polygon([(300, 262 + y), (440, 318 + y), (300, 374 + y), (160, 318 + y)], outline=c, fill=WHITE, width=3)
        T2(d, 300, 318 + y, "temperatur > 300 ?", F(19, 600), DARK, "mm")
        d.line((160, 318 + y, 100, 318 + y), fill=c, width=3); arrow(d, 100, 318 + y, 100, 410 + y, c, 3, 11); T2(d, 130, 296 + y, "ja", F(20, 600), GREY, "mm")
        d.line((440, 318 + y, 500, 318 + y), fill=c, width=3); arrow(d, 500, 318 + y, 500, 410 + y, c, 3, 11); T2(d, 470, 296 + y, "nein", F(20, 600), GREY, "mm")
        for x, txt in ((30, "16Mo3"), (430, "C45E")):
            d.rectangle((x, 410 + y, x + 140, 456 + y), outline=c, fill=WHITE, width=3); T2(d, x + 70, 433 + y, txt, F(22, 600), DARK, "mm")
        d.line((100, 456 + y, 100, 500 + y), fill=c, width=3); d.line((500, 456 + y, 500, 500 + y), fill=c, width=3)
        d.line((100, 500 + y, 500, 500 + y), fill=c, width=3); arrow(d, 300, 500 + y, 300, 526 + y, c, 3, 11)
        d.rounded_rectangle((230, 526 + y, 370, 566 + y), 20, outline=c, width=3, fill=WHITE); T2(d, 300, 546 + y, "Ende", F(22, 600), DARK, "mm")
    f.el(ap(t, ct(0) + 0.5, 0.5), pap, dy=int((1 - ap(t, ct(0) + 0.5, 0.5)) * 12))
    ns = NSX(fs=20, vis=reveal(t, {"s": ct(1) + 1.0}))
    dg = [A("Eingabe: temperatur in °C"), IF("temperatur > 300 ?", [A("16Mo3")], [A("C45E")])]
    def nsd(d, dy):
        T2(d, 930, 112 + dy, "Struktogramm", F(26, 700), DARK, "mm"); ns.draw(d, dg, 650, 150 + dy, 560)
    f.el(ap(t, ct(1) + 0.8, 0.5), nsd, dy=int((1 - ap(t, ct(1) + 0.8, 0.5)) * 12))
    note(f, t, ct(1) + 3.0, 650, 360, 560, 100, "Keine Sprünge", ["nur Verschachtelung: Block in Block"], GREEN, bsz=26)
    note(f, t, ct(2) + 0.4, 650, 480, 560, 100, "Fast eins zu eins in Code", ["jeder Block wird eine Zeile oder ein Zweig"], RED, bsz=26)
    def steps(d, dy):
        xs = [60, 340, 650]; ws = [250, 270, 180]; txts = ["1  analysieren", "2  Struktogramm", "3  Code"]
        for i, (x, w_, txt) in enumerate(zip(xs, ws, txts)):
            tin = ct(3) + 2.0 + i * 2.2
            a = ap(t, tin, 0.4)
            if a <= 0: continue
            d.rounded_rectangle((x + 0, 640 + dy, x + w_, 690 + dy), 25, fill=mix(BG, RED, a)); T2(d, x + w_ / 2, 665 + dy, txt, F(26, 700), mix(BG, WHITE, a), "mm")
    f.el(1, steps)

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V05 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Erst denken,", F(96, 700), DARK)
        T2(d, 90, 270, "dann tippen", F(96, 700), DARK)
        T2(d, 90, 400, "Problemanalyse und Struktogramm", F(46, 400), GREY)
        ns = NS(fs=20, pv=8)
        ns.draw(d, [A("Eingabe: temperatur in °C"), IF("temperatur > 300 ?", [A("16Mo3")], [A("C45E")])], 90, 490, 520)
        arrow(d, 640, 570, 720, 570, RED, 6, 18)
        code_c(d, 740, 488, 480, ['if temperatur > 300:', '    print("16Mo3")', 'else:', '    print("C45E")'], [-1] * 4, 9, 20, 30, {}, None, title="Python", off=24)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    m = sys.argv[1] if len(sys.argv) > 1 else "full"
    if m == "text": text_modus(SRC)
    elif m == "fake": fake_audio(HERE, SECS)
    elif m == "tts": tts_safe(HERE, SECS)
    else: dispatch(HERE, SECS, SCENES, LABEL, poster, NAME)
