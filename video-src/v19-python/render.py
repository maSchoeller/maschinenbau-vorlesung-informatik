"""V19 Python-Werkzeugkasten: sqlite3, Platzhalter, fetchall, fetchone, commit, typische Fehler (Code wird echt ausgefuehrt, Ausgaben stammen daraus).
Aufruf: python render.py [text|probe|zeiten|scan|stills t1 t2..|tts|full|mux]  (tts/full erst nach Freigabe der Credits)"""
import os, sys, io, contextlib
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v19-common"))
from h19 import *
from texte import SRC

NAME = "v19-python"; LABEL = "DHBW · Informatik · V19 · Python-Werkzeugkasten"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- echte Ausfuehrung (ein gemeinsamer Namensraum, Szene fuer Szene)
NS = {"__name__": "__main__"}
def ex(lines, expect_error=False):
    """Fuehrt die Codezeilen im gemeinsamen Namensraum aus; liefert die Ausgabezeilen (bei Fehlern am Ende die Fehlerzeile)."""
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf): exec("\n".join(lines), NS)
    except Exception as e:
        if not expect_error: raise
        buf.write(f"{type(e).__module__}.{type(e).__name__}: {e}\n")
    return buf.getvalue().splitlines()

C1 = ['import sqlite3',
      'db = sqlite3.connect(":memory:")',
      'cur = db.cursor()',
      'cur.execute("""CREATE TABLE auftraege (',
      '    nr INTEGER PRIMARY KEY, teil TEXT,',
      '    maschine TEXT, menge INTEGER, status TEXT)""")']
assert ex(C1) == []
C2 = ['cur.execute("INSERT INTO auftraege VALUES (?, ?, ?, ?, ?)",',
      '            (4711, "WELLE_20H6", "D2", 500, "in Arbeit"))',
      'neu = [(4712, "FLANSCH_80", "F1", 120, "offen"),',
      '       (4713, "WELLE_20H6", "D2", 300, "offen")]',
      'cur.executemany("INSERT INTO auftraege VALUES (?, ?, ?, ?, ?)", neu)',
      'db.commit()']
assert ex(C2) == [] and NS["cur"].execute("SELECT COUNT(*) FROM auftraege").fetchone() == (3,)
C3 = ['cur.execute("SELECT nr, menge FROM auftraege WHERE teil = ?",',
      '            ("WELLE_20H6",))',
      'print(cur.fetchall())',
      'cur.execute("SELECT nr FROM auftraege WHERE nr = ?", (9999,))',
      'print(cur.fetchone())']
O3 = ex(C3); assert O3 == ["[(4711, 500), (4713, 300)]", "None"], O3
C4 = ['maschine = "D2"',
      'cur.execute("SELECT nr FROM auftraege WHERE maschine = ?", (maschine,))',
      'print(cur.fetchall())',
      'cur.execute("SELECT nr FROM auftraege WHERE maschine = ?", ("D2"))']
O4 = ex(C4, expect_error=True)
assert O4 == ["[(4711,), (4713,)]", "sqlite3.ProgrammingError: Incorrect number of bindings supplied. The current statement uses 1, and there are 2 supplied."], O4
O4a = O4[0]; O4b = ["sqlite3.ProgrammingError: Incorrect number of bindings supplied.", "The current statement uses 1, and there are 2 supplied."]
C5 = ['cur.execute("UPDATE auftraege SET status = ? WHERE nr = ?",',
      '            ("fertig", 4711))',
      'print(cur.rowcount)',
      'cur.execute("DELETE FROM auftraege WHERE nr = ?", (4712,))',
      'db.commit()',
      'db.close()']
O5 = ex(C5); assert O5 == ["1"], O5
# Gegenprobe ohne WHERE (frische Datenbank)
_db, _cur = mk_db(ROWS[:3])
_cur.execute("UPDATE auftraege SET status = ?", ("fertig",)); assert _cur.rowcount == 3
STAT_OHNE = [r[0] for r in _cur.execute("SELECT status FROM auftraege ORDER BY nr")]; assert STAT_OHNE == ["fertig"] * 3
_db, _cur = mk_db(ROWS[:3])
_cur.execute("UPDATE auftraege SET status = ? WHERE nr = ?", ("fertig", 4711))
STAT_MIT = [r[0] for r in _cur.execute("SELECT status FROM auftraege ORDER BY nr")]; assert STAT_MIT == ["fertig", "offen", "offen"]

# Fehlermeldungen: jeweils in frischer Datenbank ausloesen
t3 = (4720, "X", "D2"); t5 = (4711, "X", "D2", 1, "offen")
ERR = [('cur.execute("SELECT nr FROM auftrag")', "OperationalError", "no such table: auftrag", "Tabellenname falsch", "richtig: auftraege"),
       ('cur.execute("SELECT nummer FROM auftraege")', "OperationalError", "no such column: nummer", "Spaltenname falsch", "richtig: nr"),
       ('cur.execute("SELEC nr FROM auftraege")', "OperationalError", 'near "SELEC": syntax error', "Tippfehler im SQL", "richtig: SELECT"),
       ('cur.execute("INSERT INTO auftraege VALUES (?, ?, ?, ?, ?)", t5)', "IntegrityError", "UNIQUE constraint failed: auftraege.nr", "Primärschlüssel doppelt", "4711 gibt es schon"),
       ('cur.execute("INSERT INTO auftraege VALUES (?, ?, ?)", t3)', "OperationalError", "table auftraege has 5 columns but 3 values were supplied", "Platzhalter passen nicht", "5 Spalten, aber 3 Werte")]
for code, cls, msg, _a, _b in ERR:
    _db, _cur = mk_db()
    try: eval(code.replace("cur.", "_cur."), {"_cur": _cur, "t3": t3, "t5": t5}); raise AssertionError("kein Fehler: " + code)
    except sqlite3.Error as e: assert type(e).__name__ == cls and str(e) == msg, (type(e).__name__, str(e))

# ---------------------------------------------------------------- Bausteine
def codeblock(f, t, x, y, w, lines, t0, size, lh, hl=None, cps=55, a0=None):
    times = [t0 + sum(len(l) / cps + 0.12 for l in lines[:k]) for k in range(len(lines))]
    f.el(ap(t, a0 if a0 is not None else t0 - 0.2, 0.3), lambda d, dy: code_n(d, x, y + dy, w, lines, None, times, t, size, lh, hl, cps))
    return 50 + lh * len(lines) + 18
def outpanel(f, t, x, y, w, lines, t0, size=22, lh=32, step=0.5, cols=None, title="Ausgabe"):
    h = 46 + lh * len(lines) + 14
    ents = [(t0 + k * step, [(s, (cols or {}).get(k, CODE_T))]) for k, s in enumerate(lines)]
    f.el(show(t, t0 - 0.2), lambda d, dy: console_panel(d, x, y + dy, w, h, ents, t, size, title=title, lh=lh), dy=dyf(t, t0 - 0.2))
    return h
def hlsel(t, sched): return hl_at(t, [(0, None)] + sched)
def textcard(d, x, y, w, h, big, small, bigcol=DARK, dy=0, bigsize=28, smallsize=22, mono=False):
    card(d, x, y + dy, w, h)
    T2(d, x + 28, y + 12 + dy, big, M(bigsize, True) if mono else F(bigsize, 700), bigcol, "la"); T2(d, x + 28, y + 14 + bigsize + 10 + dy, small, F(smallsize, 600), GREY, "la")

# ---------------------------------------------------------------- 1 connect, cursor, execute
STEPS = ["connect", "cursor", "execute", "fetchall", "commit", "close"]
def sc1(f, t, ct):
    heading(f, t, "sqlite3: sechs Schritte")
    hot = hl_at(t, [(0, set()), (ct(1), {0}), (ct(2), {1, 2})])
    def chain(d, dy):
        x = 60
        for k, s in enumerate(STEPS):
            a = ap(t, ct(0) + 0.3 + 0.55 * k, 0.4)
            if a > 0:
                on = k in hot
                chip(d, x, 112 + dy, 170, 54, s, mix(WHITE, LIGHTR if on else LIGHTB, a), mix(WHITE, RED if on else BLUE, a), 24, mono=True)
                if k < 5: arrow(d, x + 174, 139 + dy, x + 196, 139 + dy, mix(WHITE, GREY, a), 3, 9)
            x += 198
    f.el(1.0, chain)
    codeblock(f, t, 60, 200, 700, C1, ct(1) + 0.2, 20, 32, hlsel(t, [(ct(1), {1, 2}), (ct(2), {2}), (ct(2) + 1.6, {3, 4, 5})]), a0=ct(0) + 2.5)
    def modes(d, dy):
        card(d, 800, 200 + dy, 420, 290)
        T2(d, 828, 212 + dy, "connect(…)", M(24, True), DARK, "la")
        chip(d, 828, 262 + dy, 170, 48, ":memory:", LIGHTA, AMB, 24, mono=True); T2(d, 828, 322 + dy, "im Arbeitsspeicher, zum Üben", F(23, 600), GREY, "la")
        chip(d, 828, 372 + dy, 170, 48, "fz3.db", LIGHTB, BLUE, 24, mono=True); T2(d, 828, 432 + dy, "in einer Datei", F(23, 600), GREY, "la")
    f.el(show(t, ct(1) + 0.4), modes, dy=dyf(t, ct(1) + 0.4))
    f.el(show(t, ct(2) + 0.2), lambda d, dy: tag(d, 60, 480 + dy, 520, 40, "Cursor: dein Zeiger auf die Datenbank", LIGHTK, DARK, 24, outl=LINE), dy=dyf(t, ct(2) + 0.2))
    def leer(d, dy):
        T2(d, 60, 542 + dy, "auftraege", M(24, True), RED, "la"); T2(d, 220, 546 + dy, "angelegt, noch leer", F(22, 600), GREY, "la")
        auftrags_tabelle(d, 60, 580 + dy, [0] * 5, rh=40, size=20)
    f.el(show(t, ct(2) + 2.4), leer, dy=dyf(t, ct(2) + 2.4))

# ---------------------------------------------------------------- 2 INSERT, executemany, commit
def sc2(f, t, ct):
    heading(f, t, "Eintragen: INSERT und commit")
    codeblock(f, t, 60, 112, 820, C2, 0.5, 19, 30, hlsel(t, [(ct(0), {0, 1}), (ct(1), {2, 3, 4}), (ct(2), {5})]), cps=40)
    tm = [ap(t, ct(0) + 2.0, 0.4), ap(t, ct(1) + 1.8, 0.4), ap(t, ct(1) + 2.4, 0.4), 0, 0]
    f.el(show(t, 0.5), lambda d, dy: auftrags_tabelle(d, 60, 400 + dy, tm, rh=40, size=21, hl_row={i for i in range(3) if 0 < tm[i] < 1} or None), dy=dyf(t, 0.5))
    def fq(d, dy):
        card(d, 920, 112 + dy, 300, 120); T2(d, 944, 124 + dy, "5 Spalten", F(26, 700), DARK, "la"); T2(d, 944, 160 + dy, "5 Fragezeichen", F(26, 700), RED, "la"); T2(d, 944, 196 + dy, "5 Werte im Tupel", F(22, 600), GREY, "la")
    f.el(show(t, ct(0) + 0.6), fq, dy=dyf(t, ct(0) + 0.6))
    def cm(d, dy):
        card(d, 700, 400 + dy, 520, 76); T2(d, 728, 410 + dy, "commit()", M(30, True), GREEN, "la"); T2(d, 728, 448 + dy, "Änderungen dauerhaft gespeichert", F(22, 600), GREY, "la")
    f.el(show(t, ct(2) + 0.2), cm, dy=dyf(t, ct(2) + 0.2))
    def nc(d, dy):
        card(d, 700, 490 + dy, 520, 76); T2(d, 728, 500 + dy, "ohne commit", M(26, True), RED, "la"); T2(d, 728, 538 + dy, "bei einer Datei nach close() weg", F(22, 600), GREY, "la")
    f.el(show(t, ct(2) + 1.6), nc, dy=dyf(t, ct(2) + 1.6))
    def lab(d, dy):
        card(d, 700, 580 + dy, 520, 76); T2(d, 728, 590 + dy, "Im Labor: fz3.db jedes Mal frisch", F(26, 700), AMB, "la"); T2(d, 728, 628 + dy, "Änderungen überleben keinen neuen Lauf", F(22, 600), GREY, "la")
    f.el(show(t, ct(2) + 3.4), lab, dy=dyf(t, ct(2) + 3.4))

# ---------------------------------------------------------------- 3 SELECT, fetchall, fetchone
def sc3(f, t, ct):
    heading(f, t, "Lesen: fetchall und fetchone")
    h = codeblock(f, t, 60, 112, 760, C3, 0.5, 20, 32, hlsel(t, [(ct(0), {0, 1, 2}), (ct(2), {3, 4})]), cps=40)
    outpanel(f, t, 60, 112 + h + 14, 760, O3, ct(0) + 1.8, 22, 34, 1.2)
    def c1(d, dy):
        card(d, 860, 112 + dy, 360, 100); T2(d, 888, 122 + dy, "fetchall()", M(26, True), DARK, "la"); T2(d, 888, 164 + dy, "Liste von Tupeln", F(24, 700), GREEN, "la")
    f.el(show(t, ct(0) + 0.4), c1, dy=dyf(t, ct(0) + 0.4))
    def c2(d, dy):
        card(d, 860, 226 + dy, 360, 156); T2(d, 888, 236 + dy, "Entpacken", F(24, 700), GREY, "la")
        T2(d, 888, 272 + dy, "(4711, 500)", M(24, True), DARK, "la")
        arrow(d, 960, 312 + dy, 960, 336 + dy, GREY, 4, 10); arrow(d, 1100, 312 + dy, 1100, 336 + dy, GREY, 4, 10)
        chip(d, 888, 340 + dy, 150, 34, "nr = 4711", LIGHTB, BLUE, 19, mono=True); chip(d, 1050, 340 + dy, 150, 34, "menge = 500", LIGHTB, BLUE, 19, mono=True)
    f.el(show(t, ct(1) + 0.2), c2, dy=dyf(t, ct(1) + 0.2))
    def c3(d, dy):
        card(d, 860, 396 + dy, 360, 100); T2(d, 888, 406 + dy, "fetchone()", M(26, True), DARK, "la"); T2(d, 888, 448 + dy, "Tupel oder None", F(24, 700), RED, "la")
    f.el(show(t, ct(2) + 0.2), c3, dy=dyf(t, ct(2) + 0.2))
    codeblock(f, t, 60, 524, 760, ['zeile = cur.fetchone()', 'if zeile is None:', '    print("Auftrag nicht gefunden")'], ct(2) + 2.4, 20, 32, {1}, a0=ct(2) + 2.2)
    f.el(show(t, ct(2) + 4.2), lambda d, dy: tag(d, 860, 520 + dy, 360, 44, "erst prüfen, dann lesen", LIGHTA, AMB, 24, outl=AMB), dy=dyf(t, ct(2) + 4.2))

# ---------------------------------------------------------------- 4 Platzhalter und Tupel-Komma
def sc4(f, t, ct):
    heading(f, t, "Platzhalter und das Komma im Tupel")
    h = codeblock(f, t, 60, 112, 790, C4, 0.5, 18, 30, hlsel(t, [(ct(1), {0, 1}), (ct(1) + 3.2, {3})]), cps=45)
    ents = [(ct(1) + 1.6, [(O4a, CODE_T)]), (ct(2) + 0.8, [(O4b[0], CODE_R)]), (ct(2) + 1.8, [(O4b[1], CODE_R)])]
    f.el(show(t, ct(1) + 1.4), lambda d, dy: console_panel(d, 60, 112 + h + 14 + dy, 790, 46 + 3 * 30 + 14, ents, t, 18, title="Ausgabe", lh=30), dy=dyf(t, ct(1) + 1.4))
    def t1(d, dy):
        card(d, 890, 112 + dy, 330, 150); T2(d, 914, 122 + dy, "(maschine,)", M(26, True), GREEN, "la"); T2(d, 914, 164 + dy, "Tupel mit 1 Element", F(24, 700), DARK, "la"); T2(d, 914, 200 + dy, "= 1 Wert", F(24, 600), GREY, "la")
    f.el(show(t, ct(1) + 0.3), t1, dy=dyf(t, ct(1) + 0.3))
    def t2(d, dy):
        card(d, 890, 276 + dy, 330, 160); T2(d, 914, 286 + dy, "('D2')", M(26, True), RED, "la"); T2(d, 914, 328 + dy, "nur der Text D2", F(24, 700), DARK, "la")
        a = ap(t, ct(2) + 0.2, 0.4)
        if a > 0:
            chip(d, 914, 368 + dy, 56, 44, "D", mix(WHITE, LIGHTR, a), mix(WHITE, RED, a), 26, mono=True); chip(d, 980, 368 + dy, 56, 44, "2", mix(WHITE, LIGHTR, a), mix(WHITE, RED, a), 26, mono=True)
            T2(d, 1054, 390 + dy, "= 2 Werte", F(24, 700), mix(WHITE, RED, a), "lm")
    f.el(show(t, ct(1) + 2.8), t2, dy=dyf(t, ct(1) + 2.8))
    def nein(d, dy):
        card(d, 60, 490 + dy, 570, 170, stripe=False); badge(d, 96, 526 + dy, 18, False); T2(d, 128, 526 + dy, "nie: f-String im SQL-Text", F(27, 700), RED, "lm")
        d.rounded_rectangle((84, 566 + dy, 606, 636 + dy), 8, fill=BOX); T2(d, 100, 586 + dy, 'f"… WHERE maschine = \'{maschine}\'"', M(18), CODE_T, "lm"); T2(d, 100, 618 + dy, "führt zu SQL-Injection", F(19, 600), CODE_R, "lm")
    def ja(d, dy):
        card(d, 650, 490 + dy, 570, 170, stripe=False); badge(d, 686, 526 + dy, 18, True); T2(d, 718, 526 + dy, "immer: ? und Tupel", F(27, 700), GREEN, "lm")
        d.rounded_rectangle((674, 566 + dy, 1196, 636 + dy), 8, fill=BOX); T2(d, 690, 586 + dy, '"… WHERE maschine = ?", (maschine,)', M(18), CODE_T, "lm"); T2(d, 690, 618 + dy, "Wert bleibt Daten", F(19, 600), CODE_G, "lm")
    f.el(show(t, ct(0) + 0.3), nein, dy=dyf(t, ct(0) + 0.3)); f.el(show(t, ct(0) + 1.8), ja, dy=dyf(t, ct(0) + 1.8))

# ---------------------------------------------------------------- 5 UPDATE, DELETE, close
def mini(d, x, y, stat, hl, colr, dy=0):
    d.rounded_rectangle((x, y + dy, x + 420, y + 36 * 4 + dy), 6, fill=WHITE, outline=LINE)
    for j, (w, hd) in enumerate(((100, "nr"), (320, "status"))):
        xx = x + (0 if j == 0 else 100)
        d.rectangle((xx, y + dy, xx + w, y + 36 + dy), fill=DARK); T2(d, xx + w / 2, y + 18 + dy, hd, F(20, 700), WHITE, "mm")
    for i in range(3):
        yy = y + 36 * (i + 1) + dy; on = i in hl
        d.rectangle((x, yy, x + 420, yy + 36), fill=colr if on else WHITE, outline=LINE)
        T2(d, x + 50, yy + 18, str(ROWS[i][0]), F(21, 600), DARK, "mm"); T2(d, x + 260, yy + 18, stat[i], F(21, 700 if on else 600), RED if (on and colr == LIGHTR) else (GREEN if on else DARK), "mm")
def sc5(f, t, ct):
    heading(f, t, "Ändern und Löschen: immer mit WHERE")
    codeblock(f, t, 60, 112, 700, C5, 0.5, 19, 30, hlsel(t, [(ct(0), {0, 1, 2}), (ct(1), {0}), (ct(2), {4, 5})]), cps=40)
    def ta(d, dy):
        card(d, 780, 112 + dy, 440, 232, stripe=False); d.rectangle((780, 112 + dy, 788, 344 + dy), fill=GREEN)
        T2(d, 808, 122 + dy, "mit WHERE nr = ?", M(22, True), GREEN, "la")
        mini(d, 790, 160, STAT_MIT, {0}, LIGHTG, dy)
        T2(d, 808, 310 + dy, "rowcount = 1: eine Zeile geändert", F(21, 700), DARK, "la")
    f.el(show(t, ct(0) + 0.6), ta, dy=dyf(t, ct(0) + 0.6))
    def tb(d, dy):
        card(d, 780, 372 + dy, 440, 232, stripe=False); d.rectangle((780, 372 + dy, 788, 604 + dy), fill=RED)
        T2(d, 808, 382 + dy, "ohne WHERE", M(22, True), RED, "la")
        mini(d, 790, 420, STAT_OHNE, {0, 1, 2}, LIGHTR, dy)
        T2(d, 808, 570 + dy, "rowcount = 3: alle Zeilen geändert", F(21, 700), RED, "la")
    f.el(show(t, ct(1) + 0.2), tb, dy=dyf(t, ct(1) + 0.2))
    def cl(d, dy):
        card(d, 60, 384 + dy, 700, 150); T2(d, 88, 394 + dy, "Am Ende", F(26, 700), RED, "la")
        steps = ["commit", "close"]; x = 88
        for k, s in enumerate(steps):
            w = 190; chip(d, x, 438 + dy, w, 52, s + "()", LIGHTB, BLUE, 26, mono=True); x += w
            if k == 0: arrow(d, x + 10, 464 + dy, x + 50, 464 + dy, GREY, 4, 12); x += 60
        T2(d, 88, 500 + dy, "speichern, dann die Verbindung schließen", F(22, 600), GREY, "la")
    f.el(show(t, ct(2) + 0.2), cl, dy=dyf(t, ct(2) + 0.2))

# ---------------------------------------------------------------- 6 typische Fehler
def sc6(f, t, ct):
    heading(f, t, "Typische Fehlermeldungen")
    te = [ct(0) + 0.5, ct(0) + 3.4, ct(1) + 0.2, ct(2) + 0.2, ct(3) + 0.2]
    for k, (code, cls, msg, ur, rich) in enumerate(ERR):
        def row(d, dy, k=k, code=code, cls=cls, msg=msg, ur=ur, rich=rich):
            y = 112 + k * 112
            card(d, 60, y + dy, 740, 100, stripe=False); d.rectangle((60, y + dy, 68, y + 100 + dy), fill=RED)
            T2(d, 90, y + 10 + dy, code, M(17), GREY, "la"); T2(d, 90, y + 36 + dy, msg, M(22, True), RED, "la"); T2(d, 90, y + 70 + dy, f"sqlite3.{cls}", M(16), GREY, "la")
            card(d, 820, y + dy, 400, 100, stripe=False)
            T2(d, 846, y + 14 + dy, ur, F(27, 700), DARK, "la"); T2(d, 846, y + 56 + dy, rich, F(23, 600), GREEN if k != 3 else AMB, "la")
            arrow(d, 804, y + 50 + dy, 818, y + 50 + dy, GREY, 3, 8)
        f.el(show(t, te[k]), row, dy=dyf(t, te[k]))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V19 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Python-Werkzeugkasten", F(84, 700), DARK)
        T2(d, 90, 270, "sqlite3: die Auftragsdatenbank per Code", F(44, 400), GREY)
        x = 90
        for k, s in enumerate(STEPS):
            chip(d, x, 380, 170, 54, s, LIGHTB, BLUE, 24, mono=True)
            if k < 5: arrow(d, x + 174, 407, x + 196, 407, GREY, 3, 9)
            x += 198
        code_n(d, 90, 470, 760, C3[:3], None, [-1] * 3, 9, 20, 32, {2})
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
