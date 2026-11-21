"""V04 Vorgerechnet: Zweihandschaltung (Code aus briefing/v04-beispiel.py).
Aufruf: python render.py [text|tts|scan|stills t1 t2..|full|mux]"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v04-common"))
from b4 import *
HERE = os.path.dirname(os.path.abspath(__file__))

NAME = "v04-beispiel"; LABEL = "DHBW · Informatik · V04 · Vorgerechnet: Zweihandschaltung"

SRC = [
 ["Eine Presse darf nur fahren, wenn alles stimmt: beide Taster gedrückt, die Schutztür geschlossen und der Hydraulikdruck im zulässigen Bereich.",
  "Hydraulik heißt: Die Kraft kommt aus Öl unter Druck, gemessen in bar. Zulässig sind 150 bis 210 bar.",
  "Das Programm soll alle vier Bedingungen prüfen und melden, ob der Hub freigegeben ist, und wenn nicht, warum nicht.",
  "Wir gehen den Code Abschnitt für Abschnitt durch."],
 ["Die ersten drei Zeilen sind Kommentare, die erklären den Zweck, und Python ignoriert sie.",
  "In den Zeilen 5 bis 7 liefert `input` immer Text. Der Vergleich [[== \"j\"|gleich Jot]] macht daraus einen Wahrheitswert: Bei der Antwort [[j|Jot]] wird die Variable `True`, sonst `False`.",
  "In Zeile 8 ist der Druck eine Zahl, deshalb wandelt `float` den Text um."],
 ["Zeile 10 prüft den Bereich in einem Zug: `150 <= druck_bar <= 210` ist wahr, wenn der Druck zwischen den Grenzen liegt.",
  "Zeile 11 verknüpft alles: Die Freigabe ist nur wahr, wenn linker Taster, rechter Taster, Tür und Druck zusammen wahr sind.",
  "Vier Wahrheitswerte, drei `and`: Das ist genau die Reihenschaltung aus dem Theorievideo.",
  "Ein einziges `False` genügt, und die ganze Freigabe ist `False`."],
 ["Die Zeilen 13 und 14 geben Zwischenergebnisse aus.",
  "`print` mit einem Komma zeigt erst den Text und dann den Wahrheitswert, getrennt durch ein Leerzeichen."],
 ["Jetzt die Verzweigung in den Zeilen 16 bis 23. Python prüft von oben nach unten und führt nur den ersten passenden Zweig aus.",
  "Zuerst `if freigabe`: Ist sie wahr, wird der Hub freigegeben.",
  "Sonst fragt das erste `elif`, ob die Tür offen ist, also [[not tuer_zu|not Tür zu]], und meldet den Stopp.",
  "Das zweite `elif` prüft `not druck_ok` und nennt den Druck als f-String mit einer Nachkommastelle.",
  "Bleibt nichts übrig, fängt `else` den Rest ab: Dann fehlt nur noch ein Taster, und das Programm bittet zu warten."],
 ["Probelauf eins: Taster links [[j|Jot]], Taster rechts [[j|Jot]], Tür [[j|Jot]], Druck 180 bar.",
  "Beide Taster sind wahr, der Druck liegt im Bereich, die Freigabe ist wahr: Der Zweig unter `if` läuft, der Hub ist freigegeben.",
  "Probelauf zwei: Die Tür ist offen, also [[n|enn]]. Die Freigabe ist falsch, und das erste `elif` greift: Stopp, Schutztür offen.",
  "Die Zweige danach werden gar nicht mehr geprüft."],
 ["Probelauf drei: Der Druck beträgt 230 bar. Taster und Tür sind in Ordnung, aber `druck_ok` ist falsch, und das zweite `elif` meldet den Druck.",
  "Probelauf vier: Der rechte Taster fehlt. Tür und Druck passen, also greifen beide `elif` nicht, und `else` meldet: Warten.",
  "Die Reihenfolge der Zweige entscheidet: Die Sicherheitsgründe stehen zuerst, das Warten ganz zuletzt.",
  "Ändere die Eingaben und sage vorher, welcher Zweig läuft."],
]
SECS = make_secs(SRC)   # Untertitel = anzeige(text), Audio = sprechfassung(text)

# SCENES-FOLGEN
CODE = open(os.path.join(HERE, "..", "..", "briefing", "v04-beispiel.py"), encoding="utf-8").read().rstrip("\n").split("\n")
assert len(CODE) == 23
assert CODE[4].startswith("taster_links") and CODE[7].startswith("druck_bar") and CODE[9].startswith("druck_ok") and CODE[10].startswith("freigabe")
assert CODE[12].startswith('print("Beide') and CODE[13].startswith('print("Druck') and CODE[15] == "if freigabe:" and CODE[21] == "else:"

# Probelaeufe: Ausgaben und Variablen stammen aus der echten Ausfuehrung des Briefing-Codes
RUN = {
    1: dict(ans=["j", "j", "j", "180"], hl={15, 16}, branch="if freigabe", res=CODE_G, out="Hub freigegeben"),
    2: dict(ans=["j", "j", "n", "180"], hl={17, 18}, branch="elif not tuer_zu", res=CODE_R, out="Stopp: Schutztür offen"),
    3: dict(ans=["j", "j", "j", "230"], hl={19, 20}, branch="elif not druck_ok", res=CODE_R, out="Stopp: Druck 230.0 bar außerhalb von 150 bis 210 bar"),
    4: dict(ans=["j", "n", "j", "180"], hl={21, 22}, branch="else", res=CODE_N, out="Warten: bitte beide Taster drücken"),
}
for k, r in RUN.items():
    r["log"], r["outs"], r["ns"] = run_inputs(CODE, r["ans"])
    assert r["outs"][-1] == r["out"] and len(r["outs"]) == 3, (k, r["outs"])
assert RUN[1]["outs"][:2] == ["Beide Taster: True", "Druck im Bereich: True"] and RUN[3]["outs"][1] == "Druck im Bereich: False" and RUN[4]["outs"][0] == "Beide Taster: False"
assert [r["ns"]["freigabe"] for r in RUN.values()] == [True, False, False, False]
VARS = ["taster_links", "taster_rechts", "tuer_zu", "druck_bar", "druck_ok", "freigabe"]

CPS = 70
CX, CW, CSZ, CLH, CY = 40, 720, 15, 22, 100
RX, RW = 768, 472
fit_check(CODE, M(CSZ), CW - 62 - 14, "Code")
for r in RUN.values():
    fit_check(r["outs"], M(14), RW - 44 - 6, "Konsole")
    fit_check([p + a for p, a in r["log"]], M(14), RW - 44 - 6, "Konsole")

def seq(idxs, start, cps=CPS, gap=0.12):
    out = {}; c = start
    for i in idxs:
        out[i] = c; c += len(CODE[i]) / cps + gap
    return out
def code_times(spec):
    tm = [1e9] * len(CODE)
    for i, v in spec.items(): tm[i] = v
    return tm
FULL = {i: -1 for i in range(len(CODE))}

def draw_code(f, t, times, hl=None, dim=True, t0=0.0):
    f.el(ap(t, t0, 0.3), lambda d, dy: code_panel(d, CX, CY + dy, CW, CODE, times, t, CSZ, CPS * 1.0, hl=hl, dim_others=dim, lh=CLH))

def side_card(f, t, tin, y, h, big, small, col=DARK, tout=None):
    a = ap(t, tin, 0.45) * (1 - (ap(t, tout, 0.3) if tout else 0))
    def fn(d, dy):
        card(d, RX, y + dy, RW, h)
        T2(d, RX + 28, y + 10 + dy, big, F(28, 700), col)
        yy = y + 50 + dy
        for ln in ([small] if isinstance(small, str) else small):
            sz = 23
            while F(sz, 400).getlength(ln) > RW - 50 and sz > 16: sz -= 1
            T2(d, RX + 28, yy, ln, F(sz, 400), GREY); yy += 28
    f.el(a, fn, dy=int((1 - ap(t, tin, 0.45)) * 12))

def run_view(f, t, k, t_in, step, t_out, t_res, extra_after=None):
    """Konsole, Variablen und Zweig-Anzeige eines Probelaufs (Zeiten absolut in der Szene)."""
    r = RUN[k]
    ents = [(t_in + i * step, [(p, CODE_T), (a, CODE_N)]) for i, (p, a) in enumerate(r["log"])]
    ents += [(t_out, [(r["outs"][0], CODE_T)]), (t_out + 0.8, [(r["outs"][1], CODE_T)]), (t_res, [(r["outs"][2], r["res"])])]
    f.el(ap(t, t_in - 0.4, 0.3), lambda d, dy: console_panel(d, RX, 100 + dy, RW, 232, ents, t, 14, lh=22))
    times = {"taster_links": t_in, "taster_rechts": t_in + step, "tuer_zu": t_in + 2 * step, "druck_bar": t_in + 3 * step, "druck_ok": t_out - 0.2, "freigabe": t_out - 0.2}
    def vt(d, dy):
        card(d, RX, 346 + dy, RW, 214, stripe=False)
        T2(d, RX + 24, 354 + dy, "Variablen", F(22, 600), GREY)
        for i, nm in enumerate(VARS):
            if t < times[nm]: continue
            v = r["ns"][nm]; col = DARK if not isinstance(v, bool) else (GREEN if v else RED)
            T2(d, RX + 24, 398 + i * 27 + dy, nm, M(17), DARK, "lm"); T2(d, RX + 250, 398 + i * 27 + dy, "=", M(17), GREY, "lm"); T2(d, RX + 280, 398 + i * 27 + dy, str(v), M(17, True), col, "lm")
    f.el(ap(t, t_in - 0.4, 0.3), vt)
    def vd(d, dy):
        d.rounded_rectangle((RX, 574 + dy, RX + RW, 660 + dy), 14, fill=LIGHT_G if r["res"] == CODE_G else (LIGHT_R if r["res"] == CODE_R else LIGHT_A), outline=r["res"] if r["res"] != CODE_N else AMBER, width=3)
        T2(d, RX + 24, 590 + dy, "Zweig genommen:", F(22, 600), GREY)
        T2(d, RX + 24, 620 + dy, r["branch"], M(26, True), DARK)
        if extra_after is not None and t >= extra_after: T2(d, RX + RW - 24, 637 + dy, "Rest nicht geprüft", F(22, 600), GREY, "rm")
    show(f, t, t_res, vd)

# ---------------------------------------------------------------- 1 Aufgabe
def sc1(f, t, ct):
    heading(f, t, "Die Aufgabe: Hub nur bei Freigabe")
    conds = ["Taster links gedrückt", "Taster rechts gedrückt", "Schutztür geschlossen", "Druck zwischen 150 und 210 bar"]
    for i, c in enumerate(conds):
        def cd(d, dy, i=i, c=c):
            y = 120 + i * 100; card(d, 60, y, 600, 68); T2(d, 96, y + 34, c, F(32, 600), DARK, "lm")
            if i < 3: T2(d, 360, y + 84, "und", F(22, 700), RED, "mm")
        show(f, t, ct(0) + 1.4 + i * 1.6, cd)
    show(f, t, ct(1) - 0.8, lambda d, dy: pill(d, 60, 524 + dy, 600, 60, "alle vier wahr: Hub freigegeben", GREEN, size=30))
    def gg(d, dy):
        gauge(d, 960, 330 + dy, 200, 180)
        T2(d, 960, 372 + dy, "Hydraulikdruck in bar", F(24, 600), GREY, "mm")
        T2(d, 960, 404 + dy, "zulässig: 150 bis 210 bar", F(26, 700), GREEN, "mm")
    show(f, t, ct(1) + 0.5, gg)
    for i, (txt, col) in enumerate((("Hub freigegeben", GREEN), ("Stopp: Schutztür offen", (214, 20, 36)), ("Warten: bitte beide Taster drücken", AMBER))):
        show(f, t, ct(2) + 0.6 + i * 1.8, lambda d, dy, i=i, txt=txt, col=col: pill(d, 700, 450 + i * 62 + dy, 520, 50, txt, col, size=26))
    show(f, t, ct(3) + 0.3, lambda d, dy: pill(d, 60, 600 + dy, 600, 56, "Code Abschnitt für Abschnitt", DARK, size=30))

# ---------------------------------------------------------------- 2 Eingaben, Zeilen 1-8
def sc2(f, t, ct):
    heading(f, t, "Abschnitt 1: Eingaben (Zeilen 1 bis 8)")
    tm = {}; tm.update(seq([0, 1, 2], ct(0) + 0.3)); tm.update(seq([4, 5, 6], ct(1) + 0.3)); tm.update(seq([7], ct(2) + 0.3))
    hl = {0, 1, 2} if t < ct(1) else ({4, 5, 6} if t < ct(2) else {7})
    draw_code(f, t, code_times(tm), hl)
    side_card(f, t, ct(0) + 1.5, 100, 100, "Kommentare", ["# bis Zeilenende: Python ignoriert sie"])
    side_card(f, t, ct(1) + 1.0, 214, 100, "input liefert Text", ["immer ein str, auch bei Zahlen"])
    side_card(f, t, ct(1) + 5.0, 328, 100, '== "j"', ["macht daraus True oder False"], RED)
    side_card(f, t, ct(1) + 9.0, 442, 100, "Antwort j  →  True", ["jede andere Antwort  →  False"], GREEN)
    side_card(f, t, ct(2) + 1.8, 556, 100, "float(...)", ["Text → Zahl: aus 180 wird 180.0"], DARK)

# ---------------------------------------------------------------- 3 Bereich und Freigabe, Zeilen 10-11
def sc3(f, t, ct):
    heading(f, t, "Abschnitt 2: Bedingungen (Zeilen 10 und 11)")
    tm = dict(FULL)
    for k in range(9, 23): tm[k] = 1e9
    tm.update(seq([9], ct(0) + 0.3)); tm.update(seq([10], ct(1) + 0.3))
    hl = {9} if t < ct(1) else {10}
    draw_code(f, t, code_times(tm), hl)
    side_card(f, t, ct(0) + 3.5, 100, 110, "Bereich in einem Zug", ["150 <= druck_bar <= 210", "ergibt True oder False"], GREEN)
    side_card(f, t, ct(1) + 4.0, 218, 110, "Freigabe", ["vier Wahrheitswerte,", "drei and dazwischen"], DARK)
    side_card(f, t, ct(2) + 0.2, 336, 100, "Reihenschaltung", ["wie im Theorievideo: UND"], DARK)
    def chain(d, dy):
        card(d, RX, 450 + dy, RW, 150)
        T2(d, RX + 28, 460 + dy, "Ein False genügt", F(28, 700), RED)
        xs = RX + 28; labs = ((True, "True"), (True, "True"), (False, "False"), (True, "True"))
        for i, (v, lab) in enumerate(labs):
            pill(d, xs, 508 + dy, 68, 40, lab, GREEN if v else (214, 20, 36), size=20, mono=True); xs += 68
            if i < 3: T2(d, xs + 20, 528 + dy, "and", F(20, 700), GREY, "mm"); xs += 40
        pill(d, RX + 28, 556 + dy, 130, 36, "False", (214, 20, 36), size=20, mono=True)
        T2(d, RX + 172, 574 + dy, "= die ganze Freigabe", F(24, 600), DARK, "lm")
    show(f, t, ct(3) + 0.3, chain)
    assert (True and True and False and True) is False

# ---------------------------------------------------------------- 4 Zwischenausgaben, Zeilen 13-14
def sc4(f, t, ct):
    heading(f, t, "Abschnitt 3: Zwischenergebnisse (Zeilen 13 und 14)")
    tm = dict(FULL)
    for k in range(12, 23): tm[k] = 1e9
    tm.update(seq([12], ct(0) + 0.3)); tm.update(seq([13], ct(0) + 2.4))
    hl = {12, 13} if t < ct(1) else {12}
    draw_code(f, t, code_times(tm), hl)
    r = RUN[1]
    ents = [(0, [(p, CODE_T), (a, CODE_N)]) for p, a in r["log"]] + [(ct(0) + 3.5, [(r["outs"][0], CODE_T)]), (ct(0) + 4.5, [(r["outs"][1], CODE_T)])]
    f.el(ap(t, 0.0, 0.4), lambda d, dy: console_panel(d, RX, 100 + dy, RW, 200, ents, t, 14, title="Ausgabe bis Zeile 14 (Probelauf j, j, j, 180)", lh=22))
    side_card(f, t, ct(1) + 0.5, 330, 120, "print(Text, Wert)", ["das Komma setzt ein Leerzeichen", "zwischen Text und Wahrheitswert"], DARK)
    side_card(f, t, ct(1) + 5.5, 464, 100, "Zwischenergebnis", ["hilft beim Testen"], GREEN)

# ---------------------------------------------------------------- 5 Verzweigung, Zeilen 16-23
def sc5(f, t, ct):
    heading(f, t, "Abschnitt 4: die Verzweigung (Zeilen 16 bis 23)")
    tm = dict(FULL)
    for k in range(15, 23): tm[k] = 1e9
    tm.update(seq(range(15, 23), ct(0) + 0.6, cps=22))
    if t < ct(1): hl = set(range(15, 23))
    elif t < ct(2): hl = {15, 16}
    elif t < ct(3): hl = {17, 18}
    elif t < ct(4): hl = {19, 20}
    else: hl = {21, 22}
    draw_code(f, t, code_times(tm), hl)
    cs = [(ct(0) + 1.5, "Von oben nach unten", ["nur der erste Treffer läuft"], DARK), (ct(1) + 0.6, "if freigabe", ["wahr: Hub freigegeben"], GREEN),
          (ct(2) + 0.6, "elif not tuer_zu", ["Tür offen: Stopp"], RED), (ct(3) + 0.6, "elif not druck_ok", ["Stopp, Druck als f-String mit .1f"], RED),
          (ct(4) + 0.6, "else", ["Rest: Warten auf beide Taster"], DARK)]
    for i, (tin, big, small, col) in enumerate(cs): side_card(f, t, tin, 100 + i * 116, 100, big, small, col)

# ---------------------------------------------------------------- 6 Probelaeufe 1 und 2
def sc6(f, t, ct):
    heading(f, t, "Probelauf 1 und 2")
    k = 1 if t < ct(2) - 0.3 else 2
    t_in, st, t_out, t_res = ((ct(0) + 1.8, 1.2, ct(1) + 0.4, ct(1) + 6.5) if k == 1 else (ct(2) + 1.2, 0.9, ct(2) + 5.0, ct(2) + 7.0))
    hl = RUN[k]["hl"] if t >= t_res else None
    draw_code(f, t, code_times(FULL), hl)
    run_view(f, t, k, t_in, st, t_out, t_res, extra_after=(ct(3) if k == 2 else None))

# ---------------------------------------------------------------- 7 Probelaeufe 3 und 4, Reihenfolge
def sc7(f, t, ct):
    heading(f, t, "Probelauf 3 und 4")
    if t < ct(2) - 0.3:
        k = 3 if t < ct(1) - 0.3 else 4
        t_in, st, t_out, t_res = ((ct(0) + 1.0, 0.8, ct(0) + 6.0, ct(0) + 9.0) if k == 3 else (ct(1) + 0.8, 0.7, ct(1) + 4.0, ct(1) + 6.5))
        hl = RUN[k]["hl"] if t >= t_res else None
        draw_code(f, t, code_times(FULL), hl)
        run_view(f, t, k, t_in, st, t_out, t_res)
    else:
        draw_code(f, t, code_times(FULL), set(range(15, 23)))
        for i, (txt, sub, col) in enumerate((("1 · Freigabe prüfen", "if freigabe", GREEN), ("2 · Sicherheitsgrund Tür", "elif not tuer_zu", RED),
                                              ("3 · Sicherheitsgrund Druck", "elif not druck_ok", RED), ("4 · Rest: Warten", "else", DARK))):
            side_card(f, t, ct(2) + 0.6 + i * 1.3, 100 + i * 116, 100, txt, [sub], col)
        def end(d, dy):
            d.rounded_rectangle((RX, 574 + dy, RX + RW, 660 + dy), 20, fill=RED)
            T2(d, RX + RW / 2, 600 + dy, "Ändere die Eingaben und sage vorher:", F(25, 700), WHITE, "mm")
            T2(d, RX + RW / 2, 634 + dy, "Welcher Zweig läuft?", F(28, 700), WHITE, "mm")
        show(f, t, ct(3) + 0.3, end)

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6, 7: sc7}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 120, "V04 · Informatik", F(34, 600), GREY)
        T2(d, 90, 170, "Vorgerechnet", F(104, 700), DARK)
        T2(d, 90, 300, "Zweihandschaltung einer Presse", F(52, 400), GREY)
        code_panel(d, 90, 400, 820, CODE[9:11] + ["", "if freigabe:", '    print("Hub freigegeben")'], [0] * 5, 9, 20, lineno=False, lh=30)
        gauge(d, 1060, 560, 140, 180)
        T2(d, 1060, 590, "150 bis 210 bar", F(24, 700), GREEN, "mm")
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch4(HERE, SECS, SCENES, LABEL, poster, NAME)
