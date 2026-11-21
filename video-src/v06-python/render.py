"""V06 Python: while, for und range. Aufruf: python render.py [text|tts|zeiten|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v06-common"))
from h6 import *
from texte import SRC

NAME = "v06-python"; LABEL = "DHBW · Informatik · V06 · while, for und range"
SECS = make_secs(SRC)
C = lambda s, col=CODE_T: [(s, col)]

# ---------------------------------------------------------------- Code der Szenen und Pruefung aller Ausgaben
CODE1 = ["zaehler = 1", "while zaehler <= 3:", "    print(zaehler)", "    zaehler = zaehler + 1"]
assert run("\n".join(CODE1)) == ["1", "2", "3"]
CODE2 = [["for i in range(5):", "    print(i)"], ["for i in range(1, 6):", "    print(i)"], ["for i in range(0, 10, 3):", "    print(i)"]]
OUT2 = [run("\n".join(c)) for c in CODE2]
assert OUT2 == [["0", "1", "2", "3", "4"], ["1", "2", "3", "4", "5"], ["0", "3", "6", "9"]]
assert len(range(5)) == 5 and len(range(1, 6)) == 6 - 1 and len(range(0, 10, 3)) == 4
CODE3 = ["summe = 0", "maximum = 0", "for i in range(5):", '    wert = int(input("Wert: "))', "    summe = summe + wert", "    if wert > maximum:",
         "        maximum = wert", 'print("Summe:", summe)', 'print("Mittelwert:", summe / 5)', 'print("Maximum:", maximum)']
EINGABE = ["12", "7", "15", "9", "11"]
OUT3 = run("\n".join(CODE3), EINGABE)
assert OUT3 == ["Wert: 12", "Wert: 7", "Wert: 15", "Wert: 9", "Wert: 11", "Summe: 54", "Mittelwert: 10.8", "Maximum: 15"]
ROWS3 = []; s_ = 0; m_ = 0
for i, v in enumerate(EINGABE):
    v = int(v); s_ += v; m_ = max(m_, v); ROWS3.append([str(i), str(v), str(s_), str(m_)])
assert ROWS3[-1] == ["4", "11", "54", "15"] and 54 / 5 == 10.8
CODE4 = ["for i in range(1, 8):", "    if i == 3:", "        continue", "    if i == 6:", "        break", "    print(i)"]
assert run("\n".join(CODE4)) == ["1", "2", "4", "5"]
CODE5 = ["zaehler = 1", "while zaehler <= 3:", "    print(zaehler)"]
assert run("\n".join(CODE1)) == ["1", "2", "3"]        # mit der ergaenzten Zeile endet die Schleife nach 3 Durchlaeufen
# Endlosschleife: zaehler bleibt 1 und die Bedingung bleibt wahr (simulierte ersten 8 Durchlaeufe, ohne die Schleife wirklich auszufuehren)
zz = 1
for _ in range(8): assert zz <= 3

# ---------------------------------------------------------------- 1 while
def sc1(f, t, ct):
    heading(f, t, "1 · while: wiederholen, solange die Bedingung wahr ist")
    tm = seq_times(CODE1, [0, 1, 2, 3], ct(0) + 0.6, cps=45)
    hl = hl_at(t, [(0, None), (ct(0), {1, 2, 3}), (ct(1) + 3.0, {1}), (ct(2), {0}), (ct(2) + 2.0, {1}), (ct(3), {2}), (ct(3) + 1.5, {3})])
    rt = [ct(4) + 0.4, ct(4) + 1.5, ct(4) + 2.6, ct(5) + 0.3]
    cur = None
    for r in range(4):
        if t >= rt[r]:
            if r < 3: cur = [(rt[r], {1}), (rt[r] + 0.4, {2}), (rt[r] + 0.8, {3})]
            else: cur = [(rt[r], {1})]
    if cur: hl = hl_at(t, cur)
    code_box(f, t, CODE1, 40, 110, 600, 28, 42, hl=hl, times=tm, cps=45)
    rows = [["1", "1", "1 <= 3: wahr", "1"], ["2", "2", "2 <= 3: wahr", "2"], ["3", "3", "3 <= 3: wahr", "3"], ["4", "4", "4 <= 3: falsch", "-"]]
    f.el(ap(t, ct(4), 0.4), lambda d, dy: grid(d, 680, 110 + dy, [120, 120, 206, 110], ["Durchlauf", "zaehler", "Bedingung", "Ausgabe"], rows, t, rt, size=22, rh=52,
                                              colors={(3, 2): RED, (0, 2): GREEN, (1, 2): GREEN, (2, 2): GREEN}))
    ents = [(rt[0] + 0.9, C("1")), (rt[1] + 0.9, C("2")), (rt[2] + 0.9, C("3"))]
    f.el(ap(t, ct(4), 0.4), lambda d, dy: console_panel(d, 40, 370 + dy, 600, 46 + 3 * 38 + 20, ents, t, 26, "Ausgabe", lh=38))
    out = ap(t, ct(1) + 0.5, 0.4) * (1 - ap(t, ct(4) - 0.4, 0.3))
    tile(f, t, ct(1) + 0.5, 680, 110, 556, 96, "Bedingung und Doppelpunkt", "hinter while: Wahrheitswert, dann :", DARK, tout=ct(4) - 0.4, bigsize=28)
    tile(f, t, ct(1) + 1.2, 680, 224, 556, 96, "Der Block ist eingerückt", "alles Eingerückte wird wiederholt", DARK, tout=ct(4) - 0.4, bigsize=28)
    tile(f, t, ct(5) + 0.6, 680, 440, 556, 96, "Bedingung falsch: Ende", "der Rest des Programms läuft weiter", RED, bigsize=28)

# ---------------------------------------------------------------- 2 for und range
def sc2(f, t, ct):
    heading(f, t, "2 · for und range: der Stoppwert gehört nicht dazu")
    pages = [(ct(0), ct(3) - 0.2, 0), (ct(3) - 0.2, ct(4) - 0.2, 1), (ct(4) - 0.2, 1e9, 2)]
    starts = [(ct(0) + 1.0, ct(1) + 0.6), (ct(3) + 0.2, ct(3) + 2.0), (ct(4) + 0.4, ct(4) + 2.6)]
    for (t0, t1, k) in pages:
        a = ap(t, t0, 0.3) * (1 - ap(t, t1, 0.25))
        if a <= 0: continue
        code = CODE2[k]; times = seq_times(code, [0, 1], starts[k][0], cps=45)
        outs = OUT2[k]; ot = [starts[k][1] + 0.55 * j for j in range(len(outs))]
        def fn(d, dy, code=code, times=times, outs=outs, ot=ot):
            h = code_panel(d, 60, 130 + dy, 540, code, times, t, 26, 45, lh=38, title="Python")
            console_panel(d, 60, 130 + dy + h + 16, 540, 46 + 34 * len(outs) + 18, [(ot[j], C(outs[j])) for j in range(len(outs))], t, 24, "Ausgabe", lh=34)
        f.el(a, fn)
        # Zahlenstrahl
        sel = {v for j, v in enumerate(outs) if t >= ot[j] - 0.15}
        stop = (5, 6, 10)[k]; start = (0, 1, 0)[k]
        def nl(d, dy, sel=sel, stop=stop, start=start, k=k):
            numline(d, 640, 140 + dy, list(range(0, 11)), {int(v) for v in sel}, cw=48, gap=6, stop=stop)
            T2(d, 640 + start * 54 + 24, 196 + dy, "Start", F(20, 700), GREEN, "ma")
            T2(d, 640 + stop * 54 + 24, 196 + dy, "Stopp", F(20, 700), RED, "ma")
        f.el(a, nl)
    # Erklaerkacheln
    tile(f, t, ct(1) + 3.2, 640, 250, 596, 96, "Start 0, Stopp 5: fünf Durchläufe", "0, 1, 2, 3, 4: die 5 kommt nie vor", DARK, tout=ct(3) - 0.2, bigsize=26)
    tile(f, t, ct(2) + 2.8, 640, 366, 596, 96, "Off-by-one: der Stoppwert fehlt", "wer bis 5 zählen will, braucht Stopp 6", RED, tout=ct(3) - 0.2, bigsize=26)
    tile(f, t, ct(3) + 2.2, 640, 250, 596, 96, "Start 1, Stopp 6: die Zahlen 1 bis 5", "range zählt ab dem Start, ohne den Stopp", GREEN, tout=ct(4) - 0.2, bigsize=26)
    tile(f, t, ct(4) + 3.6, 640, 250, 596, 96, "Dritter Wert: die Schrittweite", "von 0 bis 9 in Dreierschritten", DARK, bigsize=26)
    tile(f, t, ct(5) + 0.2, 640, 366, 596, 96, "Durchläufe = Stopp − Start", "ohne Schrittweite, z. B. 6 − 1 = 5", GREEN, bigsize=26)

# ---------------------------------------------------------------- 3 Zaehler, Summe, Mittelwert, Maximum
def sc3(f, t, ct):
    heading(f, t, "3 · Summe, Mittelwert und Maximum ohne Listen")
    tm = seq_times(CODE3, [0, 1, 2, 3, 4, 5, 6], ct(0) + 1.0, cps=60, gap=0.05)
    tm = [tm[i] if i < 7 else ct(4) + 0.1 + 0.6 * (i - 7) for i in range(10)]
    s0 = [ct(3) + 0.3 + 1.5 * r for r in range(5)]
    sched = [(0, None), (ct(1), {2, 3, 4, 5, 6}), (ct(2), {0, 1})]
    prev = 0
    for r, v in enumerate(EINGABE):
        a = s0[r]; sched += [(a, {2, 3}), (a + 0.5, {4}), (a + 0.9, {5})]
        if int(v) > prev: sched.append((a + 1.2, {6})); prev = int(v)
    sched += [(ct(4), {7, 8, 9})]
    code_box(f, t, CODE3, 40, 100, 620, 22, 31, hl=hl_at(t, sched), times=tm, cps=60)
    rt = [s + 1.3 for s in s0]
    f.el(ap(t, ct(3), 0.4), lambda d, dy: grid(d, 690, 100 + dy, [70, 120, 170, 186], ["i", "wert", "summe", "maximum"], ROWS3, t, rt, size=22, rh=44,
                                              colors={(r, 3): RED for r in range(5)} | {(r, 2): GREEN for r in range(5)}))
    ents = [(s0[r] + 0.2, C(OUT3[r], CODE_T)) for r in range(5)]
    ents += [(ct(4) + 0.8, C(OUT3[5], CODE_G)), (ct(4) + 3.6, C(OUT3[6], CODE_G)), (ct(4) + 4.4, C(OUT3[7], CODE_G))]
    # Eingaben orange einfaerben
    ents = [(t0_, [(txt[:6], CODE_T), (txt[6:], CODE_N)] if txt.startswith("Wert:") else segs) for (t0_, segs), txt in zip(ents, OUT3)]
    f.el(ap(t, ct(3), 0.4), lambda d, dy: console_panel(d, 690, 380 + dy, 546, 290, ents, t, 20, "Ausgabe", lh=28))
    tile(f, t, ct(2) + 0.6, 40, 498, 620, 96, "Startwert 0 vor der Schleife", "summe sammelt, maximum merkt sich den größten Wert", DARK, bigsize=26)
    tile(f, t, ct(4) + 2.2, 40, 610, 620, 62, "Mittelwert: 54 : 5 = 10,8", "", GREEN, bigsize=26)

# ---------------------------------------------------------------- 4 break und continue
def sc4(f, t, ct):
    heading(f, t, "4 · break und continue")
    tm = seq_times(CODE4, [0, 1, 2, 3, 4, 5], ct(0) + 0.8, cps=55, gap=0.1)
    rows = [["1", "ausgeben", "1"], ["2", "ausgeben", "2"], ["3", "continue: nächster Durchlauf", "-"], ["4", "ausgeben", "4"], ["5", "ausgeben", "5"], ["6", "break: Schleife beendet", "-"]]
    rt = [ct(1) + 0.8, ct(1) + 1.6, ct(2) + 1.5, ct(2) + 3.6, ct(2) + 4.4, ct(3) + 1.5]
    sched = [(0, None), (ct(0), {0, 1, 2, 3, 4, 5})]
    for r in range(6):
        a = rt[r]; i = r + 1; sched.append((a, {1}))
        if i == 3: sched.append((a + 0.4, {2}))
        else:
            sched.append((a + 0.4, {3}))
            if i == 6: sched.append((a + 0.8, {4}))
            else: sched.append((a + 0.8, {5}))
    code_box(f, t, CODE4, 40, 110, 560, 24, 34, hl=hl_at(t, sched), times=tm, cps=55)
    f.el(ap(t, ct(1), 0.4), lambda d, dy: grid(d, 640, 110 + dy, [90, 340, 166], ["i", "Aktion", "Ausgabe"], rows, t, rt, size=22, rh=46,
                                              colors={(2, 1): RED, (5, 1): RED, (0, 1): GREEN, (1, 1): GREEN, (3, 1): GREEN, (4, 1): GREEN}))
    ents = [(rt[0] + 0.9, C("1")), (rt[1] + 0.9, C("2")), (rt[3] + 0.9, C("4")), (rt[4] + 0.9, C("5"))]
    f.el(ap(t, ct(1), 0.4), lambda d, dy: console_panel(d, 40, 400 + dy, 560, 46 + 34 * 4 + 18, ents, t, 24, "Ausgabe", lh=34))
    tile(f, t, ct(2) + 0.3, 640, 450, 596, 62, "continue: gleich zum nächsten Durchlauf", "", DARK, bigsize=26)
    tile(f, t, ct(3) + 0.3, 640, 530, 596, 62, "break: die ganze Schleife beenden", "", RED, bigsize=26)

# ---------------------------------------------------------------- 5 Endlosschleife
def sc5(f, t, ct):
    heading(f, t, "5 · Typischer Fehler: die Endlosschleife")
    tm = seq_times(CODE1, [0, 1, 2], ct(0) + 0.6, cps=45)
    tm = tm[:3] + [ct(4) + 0.4]
    hl = hl_at(t, [(0, None), (ct(1), {2}), (ct(2), {1, 2}), (ct(4), {3}), (ct(5), {1, 2, 3})])
    code_box(f, t, CODE1, 40, 110, 600, 28, 42, hl=hl, times=tm, cps=45)
    if ct(1) < t < ct(4) + 0.4:
        def miss(d, dy):
            y = 110 + 50 + 3 * 42 + dy; x = 40 + 14
            for xx in range(x, x + 572, 14): d.line((xx, y, xx + 7, y), fill=CODE_R, width=2); d.line((xx, y + 38, xx + 7, y + 38), fill=CODE_R, width=2)
            d.line((x, y, x, y + 38), fill=CODE_R, width=2); d.line((x + 572, y, x + 572, y + 38), fill=CODE_R, width=2)
            T2(d, x + 286, y + 19, "hier fehlt eine Zeile: zaehler erhöhen", F(20, 700), CODE_R, "mm")
        f.el(ap(t, ct(1) + 0.3, 0.4) * (1 - ap(t, ct(4) + 0.2, 0.3)), miss)
    # Konsole Lauf 1: endlos
    e1 = [(ct(2) + 0.6 + 0.3 * j, C("1", CODE_R)) for j in range(8)]
    f.el(ap(t, ct(2), 0.4) * (1 - ap(t, ct(4) + 0.3, 0.3)), lambda d, dy: console_panel(d, 40, 370 + dy, 600, 46 + 8 * 30 + 14, e1, t, 22, "Ausgabe", lh=30))
    e2 = [(ct(4) + 2.2, C("1", CODE_G)), (ct(4) + 2.8, C("2", CODE_G)), (ct(4) + 3.4, C("3", CODE_G))]
    f.el(ap(t, ct(4) + 0.5, 0.4), lambda d, dy: console_panel(d, 40, 370 + dy, 600, 46 + 3 * 30 + 14, e2, t, 22, "Ausgabe", lh=30))
    rows = [["1", "1", "1 <= 3: wahr"], ["2", "1", "1 <= 3: wahr"], ["3", "1", "1 <= 3: wahr"], ["4", "1", "1 <= 3: wahr"], ["...", "1", "immer wahr"]]
    rt = [ct(2) + 0.5, ct(2) + 1.1, ct(2) + 1.7, ct(2) + 2.3, ct(2) + 2.9]
    f.el(ap(t, ct(2), 0.4) * (1 - ap(t, ct(4), 0.4)), lambda d, dy: grid(d, 660, 110 + dy, [130, 150, 296], ["Durchlauf", "zaehler", "Bedingung"], rows, t, rt, size=22, rh=46,
                                                                          colors={(r, 2): RED for r in range(5)}))
    tile(f, t, ct(2) + 3.4, 660, 420, 576, 96, "zaehler bleibt immer 1", "die Bedingung wird nie falsch", RED, tout=ct(4), bigsize=28)
    tile(f, t, ct(3) + 0.3, 660, 530, 576, 96, "Abbrechen: Stopp-Taste oder Strg C", "bei Python und im Notebook", DARK, tout=ct(4), bigsize=26)
    tile(f, t, ct(4) + 0.8, 660, 110, 576, 96, "Mit der Zeile endet die Schleife", "nach 3 Durchläufen", GREEN, bigsize=28)
    tile(f, t, ct(5) + 0.5, 660, 230, 576, 130, "Prüffrage bei jedem while", ["Ändert sich im Block eine Variable", "aus der Bedingung?"], DARK, bigsize=28)

# ---------------------------------------------------------------- 6 Wann was?
def sc6(f, t, ct):
    heading(f, t, "6 · Wann nimmst du was?")
    def c1(d, dy):
        card(d, 60, 130 + dy, 560, 230)
        T2(d, 92, 144 + dy, "for mit range", F(36, 700), DARK); T2(d, 92, 198 + dy, "Die Anzahl der Durchläufe", F(26, 400), GREY); T2(d, 92, 232 + dy, "steht vorher fest.", F(26, 400), GREY)
        T2(d, 92, 290 + dy, "z. B. 5 Messwerte einlesen", F(26, 700), GREEN)
    def c2(d, dy):
        card(d, 660, 130 + dy, 560, 230)
        T2(d, 692, 144 + dy, "while", F(36, 700), DARK); T2(d, 692, 198 + dy, "Das Ende hängt von einer", F(26, 400), GREY); T2(d, 692, 232 + dy, "Bedingung ab.", F(26, 400), GREY)
        T2(d, 692, 290 + dy, "z. B. abkühlen, bis 60 °C", F(26, 700), GREEN)
    f.el(ap(t, ct(1) + 0.3, 0.5), c1, dy=int((1 - ap(t, ct(1) + 0.3, 0.5)) * 12))
    f.el(ap(t, ct(2) + 0.3, 0.5), c2, dy=int((1 - ap(t, ct(2) + 0.3, 0.5)) * 12))
    def chk(d, dy):
        card(d, 60, 390 + dy, 1160, 130)
        T2(d, 92, 400 + dy, "Bei jeder Schleife prüfst du drei Dinge:", F(26, 700), DARK)
        for k, (txt, tin) in enumerate((("1  Startwert", ct(3) + 3.2), ("2  Bedingung", ct(3) + 4.4), ("3  Änderung im Block", ct(3) + 5.8))):
            if t >= tin:
                a = ap(t, tin, 0.4)
                x = 92 + k * 370; d.rounded_rectangle((x, 450 + dy, x + 340, 500 + dy), 25, fill=mix(BG, GREEN, a)); T2(d, x + 170, 475 + dy, txt, F(26, 700), mix(DARK, WHITE, a), "mm")
    f.el(ap(t, ct(3) + 0.2, 0.5), chk, dy=int((1 - ap(t, ct(3) + 0.2, 0.5)) * 12))
    def nl(d, dy):
        numline(d, 60, 560 + dy, [1, 2, 3, 4, 5, 6], {1, 2, 3, 4, 5}, cw=48, gap=6, stop=6)
        T2(d, 60 + 5 * 54 + 24, 616 + dy, "Stopp: nicht mehr dabei", F(20, 700), RED, "ma")
        T2(d, 60 + 6 * 54 + 10, 576 + dy, "range mit Start 1 und Stopp 6", F(24, 400), GREY)
    f.el(ap(t, ct(4) + 0.3, 0.5), nl)
    pill(f, t, ct(5) + 0.2, 760, 570, 460, 66, "Probier alles selbst aus!", size=34)

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V06 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "while, for, range", F(104, 700), DARK)
        T2(d, 90, 300, "Schleifen in Python", F(52, 400), GREY)
        code_panel(d, 90, 410, 640, ["for i in range(1, 6):", "    print(i)", "", "while zaehler <= 3:"], [0, 0, 0, 0], 9, 30, lineno=False, lh=44)
        numline(d, 790, 440, [1, 2, 3, 4, 5, 6], {1, 2, 3, 4, 5}, cw=56, gap=8, stop=6, size=28)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
