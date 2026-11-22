"""V19 Theorie: Datenbanken und SQL am Beispiel der Auftragsdatenbank der Fertigungszelle FZ-3 (SQL-Ergebnisse werden echt mit sqlite3 berechnet).
Aufruf: python render.py [text|probe|zeiten|scan|stills t1 t2..|tts|full|mux]  (tts/full erst nach Freigabe der Credits)"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v19-common"))
from h19 import *
from texte import SRC, Q3, Q4, Q6

NAME = "v19-theorie"; LABEL = "DHBW · Informatik · V19 · Datenbanken und SQL"
SECS = make_secs(SRC)

# ---------------------------------------------------------------- echte Berechnung
DB, CUR = mk_db()
CUR.execute(Q3); R3 = CUR.fetchall(); assert R3 == [(4714, 800), (4711, 500), (4713, 300)], R3
CUR.execute(Q4); R4 = CUR.fetchall(); assert R4 == [("D2", 1600), ("F1", 180)], R4
try: CUR.execute("INSERT INTO auftraege VALUES (4711, 'FLANSCH_80', 'F1', 60, 'offen')")
except sqlite3.IntegrityError as e: E2 = f"sqlite3.IntegrityError: {e}"
assert E2 == "sqlite3.IntegrityError: UNIQUE constraint failed: auftraege.nr", E2
INJ = "x' OR '1'='1"
CUR.execute(f"SELECT nr FROM auftraege WHERE teil = '{INJ}'"); assert len(CUR.fetchall()) == 5
CUR.execute(Q6, (INJ,)); assert len(CUR.fetchall()) == 0
CUR.execute(Q6, ("O'Brien",)); assert len(CUR.fetchall()) == 0

# ---------------------------------------------------------------- 1 Datei oder Datenbank
def sc1(f, t, ct):
    heading(f, t, "Von der Datei zur Datenbank")
    def frage(d, dy):
        card(d, 60, 112 + dy, 1160, 64)
        T2(d, 92, 144 + dy, "Schichtleitung FZ-3:", F(26, 700), GREY, "lm"); T2(d, 340, 144 + dy, "„Was liegt heute noch für D2 an?“", F(30, 700), DARK, "lm")
    f.el(show(t, 0.3), frage, dy=dyf(t, 0.3))
    def csv(d, dy):
        card(d, 60, 196 + dy, 560, 404, stripe=False)
        T2(d, 90, 210 + dy, "CSV-Liste auf dem Gruppenlaufwerk", F(28, 700), DARK, "la")
        d.rounded_rectangle((90, 258 + dy, 590, 410 + dy), 12, fill=BOX)
        bad = ap(t, ct(1) + 2.2, 0.4)
        for k, ln in enumerate(("nr;teil;maschine;menge;status", "4711;WELLE_20H6;D2;500;in Arbeit", "4712;FLANSCH_80;F1;120;offen", "4713;WELLE_20H6;D2;300;offen")):
            y = 272 + k * 32 + dy
            if k == 2 and bad > 0: d.rounded_rectangle((98, y - 4, 582, y + 26), 6, fill=mix(BOX, (120, 40, 52), bad))
            T2(d, 108, y + 10, ln, M(19), CODE_T if k else CODE_C, "lm")
        for nm, x, w in (("Arbeitsvorbereitung", 90, 262), ("Meister", 372, 150)):
            chip(d, x, 436 + dy, w, 46, nm, LIGHTB, BLUE, 22)
            a = ap(t, ct(1) + 0.3, 0.4)
            if a > 0: arrow(d, x + w / 2, 432 + dy, x + w / 2, 414 + dy, mix(WHITE, BLUE, a), 4, 10)
    f.el(show(t, ct(0) + 0.8), csv, dy=dyf(t, ct(0) + 0.8))
    def konflikt(d, dy):
        tag(d, 90, 500 + dy, 170, 34, "zwei Stände", LIGHTR, RED, 21, outl=RED)
        tag(d, 272, 500 + dy, 270, 34, "Zeile überschrieben", LIGHTR, RED, 21, outl=RED)
        tag(d, 90, 546 + dy, 250, 34, "Spalte verrutscht", LIGHTR, RED, 21, outl=RED)
    f.el(show(t, ct(1) + 1.2), konflikt, dy=dyf(t, ct(1) + 1.2))
    def dbc(d, dy):
        card(d, 660, 196 + dy, 560, 404)
        T2(d, 696, 210 + dy, "Datenbank mit Managementsystem", F(28, 700), DARK, "la")
        T2(d, 696, 248 + dy, "DBMS", M(22, True), RED, "la")
    f.el(show(t, ct(1) + 3.0), dbc, dy=dyf(t, ct(1) + 3.0))
    items = [("gleichzeitiger Zugriff", ct(2) + 0.2), ("Regeln und Datentypen", ct(2) + 1.8), ("Abfragen statt eigener Schleife", ct(2) + 3.6), ("Transaktion: ganz oder gar nicht", ct(3) + 0.2)]
    for k, (s, te) in enumerate(items):
        def it(d, dy, k=k, s=s):
            y = 300 + k * 70
            badge(d, 710, y + 20 + dy, 18, True); T2(d, 746, y + 20 + dy, s, F(26, 700), DARK, "lm")
        f.el(show(t, te), it, dy=dyf(t, te))
    def lite(d, dy):
        card(d, 60, 616 + dy, 1160, 62)
        T2(d, 90, 647 + dy, "SQLite: eine Datenbank in einer einzigen Datei, steckt in Python", F(26, 700), DARK, "lm")
        chip(d, 1020, 626 + dy, 170, 42, "fz3.db", LIGHTA, AMB, 22, mono=True)
    f.el(show(t, ct(3) + 1.6), lite, dy=dyf(t, ct(3) + 1.6))

# ---------------------------------------------------------------- 2 Tabelle
def sc2(f, t, ct):
    heading(f, t, "Tabelle, Zeile, Spalte, Primärschlüssel")
    tm = [ap(t, ct(0) + 0.5 + 0.35 * i, 0.4) for i in range(5)]
    rowhl = {1} if ct(1) <= t < ct(1) + 2.0 else None
    colhl = {1} if ct(1) + 2.0 <= t < ct(2) else None
    keyon = t >= ct(2)
    tabx, taby = 60, 188
    f.el(show(t, 0.3), lambda d, dy: T2(d, 60, 124 + dy, "auftraege", M(26, True), RED, "la"), dy=dyf(t, 0.3))
    def types(d, dy):
        a = ap(t, ct(1) + 2.2, 0.5)
        if a <= 0: return
        xx = tabx
        for w, ty in zip(COLW, ("INTEGER", "TEXT", "TEXT", "INTEGER", "TEXT")):
            T2(d, xx + w / 2, taby - 18 + dy, ty, M(16, True), mix(BG, AMB, a), "mm"); xx += w
    f.el(1.0, types)
    def tab(d, dy):
        auftrags_tabelle(d, tabx, taby + dy, tm, rh=46, size=22, hl_row=rowhl, hl_col=colhl or ({0} if keyon else None), key_col=0 if keyon else None)
    f.el(show(t, 0.3), tab, dy=dyf(t, 0.3))
    X = 700
    cards = [("Tabelle", "auftraege: alle Aufträge der Zelle", ct(0) + 0.3), ("Zeile = Datensatz", "ein Auftrag, hier 4712", ct(1) + 0.2),
             ("Spalte", "Name und Datentyp, hier teil: TEXT", ct(1) + 2.2), ("Primärschlüssel", "nr: eindeutig wie eine Seriennummer", ct(2) + 0.2)]
    for k, (a_, b_, te) in enumerate(cards):
        def dc(d, dy, k=k, a_=a_, b_=b_):
            y = 124 + k * 84
            card(d, X, y + dy, 520, 76); T2(d, X + 28, y + 10 + dy, a_, F(28, 700), RED if k == 3 else DARK, "la"); T2(d, X + 28, y + 44 + dy, b_, F(22, 600), GREY, "la")
        f.el(show(t, te), dc, dy=dyf(t, te))
    def err(d, dy):
        sq = "INSERT INTO auftraege VALUES (4711, 'FLANSCH_80', 'F1', 60, 'offen')"
        ents = [(ct(2) + 1.4, sql_hl(sq)), (ct(2) + 3.0, [(E2, CODE_R)])]
        console_panel(d, 60, 492 + dy, 1160, 46 + 2 * 36 + 14, ents, t, 21, title="Auftrag 4711 ein zweites Mal eintragen", lh=36)
    f.el(show(t, ct(2) + 1.2), err, dy=dyf(t, ct(2) + 1.2))
    def crud(d, dy):
        for k, (a_, b_) in enumerate((("INSERT", "eintragen"), ("SELECT", "lesen"), ("UPDATE", "ändern"), ("DELETE", "löschen"))):
            x = 60 + k * 294; ok = ap(t, ct(3) + 0.3 + 0.6 * k, 0.4)
            if ok > 0:
                d.rounded_rectangle((x, 636 + dy, x + 278, 680 + dy), 10, fill=mix(WHITE, LIGHTB, ok), outline=mix(WHITE, BLUE, ok), width=2)
                T2(d, x + 16, 658 + dy, a_, M(22, True), mix(WHITE, BLUE, ok), "lm"); T2(d, x + 146, 658 + dy, b_, F(24, 700), mix(WHITE, DARK, ok), "lm")
    f.el(show(t, ct(3) + 0.1), crud, dy=dyf(t, ct(3) + 0.1))

# ---------------------------------------------------------------- 3 Abfrage und Auswertungsreihenfolge
Q3L = ["SELECT nr, menge", "FROM auftraege", "WHERE maschine = 'D2'", "ORDER BY menge DESC"]
STEP = {1: 1, 2: 2, 0: 3, 3: 4}  # Zeile der Abfrage -> Auswertungsschritt (FROM=1, WHERE=2, SELECT=3, ORDER BY=4)
def sc3(f, t, ct):
    heading(f, t, "SQL: sagen, was du willst")
    def dekl(d, dy):
        card(d, 60, 112 + dy, 1160, 222, stripe=False)
        T2(d, 90, 124 + dy, "V08: Schleife", F(28, 700), GREY, "la"); T2(d, 330, 130 + dy, "beschreibt, WIE", F(24, 700), GREY, "la")
        T2(d, 680, 124 + dy, "SQL", F(28, 700), RED, "la"); T2(d, 750, 130 + dy, "beschreibt, WAS", F(24, 700), RED, "la")
        code_n(d, 90, 164 + dy, 520, ['for z in zeilen:', '    if z["maschine"] == "D2":', '        ausgeben(z)'], None, [-1] * 3, t, 20, 30, title="Python")
        code_n(d, 680, 164 + dy, 520, ["SELECT nr, menge FROM auftraege", "WHERE maschine = 'D2'"], None, [-1] * 2, t, 20, 30, title="SQL", lex=sql_hl)
        T2(d, 640, 258 + dy, "→", F(36, 700), GREY, "mm")
    f.el(show(t, 0.3, ct(1) + 0.3), dekl, dy=dyf(t, 0.3))
    act = hl_at(t, [(0, None), (ct(2), {1}), (ct(3), {2}), (ct(4), {0}), (ct(5), {3})])
    def q(d, dy):
        code_n(d, 60, 112 + dy, 560, Q3L, None, [-1] * 4, t, 22, 32, act, title="SQL", lex=sql_hl)
        for i, st in STEP.items():
            te = (None, ct(2), ct(3), ct(4), ct(5))[st]; a = ap(t, te + 0.1, 0.4)
            if a > 0:
                cx, cy = 592, 112 + 50 + i * 32 + 16
                d.ellipse((cx - 14, cy - 14 + dy, cx + 14, cy + 14 + dy), fill=mix(BOX, RED, a)); T2(d, cx, cy + dy, str(st), F(21, 700), WHITE, "mm")
    f.el(show(t, ct(1)), q, dy=dyf(t, ct(1)))
    def order(d, dy):
        T2(d, 660, 112 + dy, "geschrieben", F(22, 700), GREY, "la")
        x = 660
        for s in ("SELECT", "FROM", "WHERE", "ORDER BY"):
            w = int(F(22, 700).getlength(s) + 28); chip(d, x, 142 + dy, w, 40, s, LIGHTK, GREY, 22); x += w + 12
        T2(d, 660, 204 + dy, "ausgewertet", F(22, 700), RED, "la")
        x = 660
        for k, s in enumerate(("FROM", "WHERE", "SELECT", "ORDER BY")):
            te = (ct(2), ct(3), ct(4), ct(5))[k]; a = ap(t, te, 0.4)
            w = int(F(22, 700).getlength(f"{k + 1} {s}") + 28)
            if a > 0:
                on = t < ((ct(3), ct(4), ct(5), 1e9)[k]); chip(d, x, 234 + dy, w, 40, f"{k + 1} {s}", mix(WHITE, LIGHTR if on else LIGHTG, a), mix(WHITE, RED if on else GREEN, a), 22)
            x += w + 12
    f.el(show(t, ct(2) - 0.2), order, dy=dyf(t, ct(2) - 0.2))
    rowa = [1.0, 1 - 0.78 * ap(t, ct(3) + 0.6, 0.6), 1.0, 1.0, 1 - 0.78 * ap(t, ct(3) + 0.6, 0.6)]
    cola = [1.0] + [1 - 0.8 * ap(t, ct(4) + 0.6, 0.6)] * 2 + [1.0] + [1 - 0.8 * ap(t, ct(4) + 0.6, 0.6)]
    f.el(show(t, ct(2) + 0.2), lambda d, dy: auftrags_tabelle(d, 60, 340 + dy, [1] * 5, rh=40, size=21, row_a=rowa, col_a=cola), dy=dyf(t, ct(2) + 0.2))
    def drop(d, dy):
        a = ap(t, ct(3) + 0.9, 0.4)
        if a > 0:
            for i in (1, 4): T2(d, 674, 340 + 40 * (i + 1) + 20 + dy, "fällt weg", F(18, 700), mix(WHITE, RED, a), "lm")
    f.el(1.0, drop)
    ents = [(ct(2) + 0.6, [("1 FROM      5 Zeilen, 5 Spalten", CODE_T)]), (ct(3) + 0.8, [("2 WHERE     3 Zeilen", CODE_T)]),
            (ct(4) + 0.8, [("3 SELECT    3 Zeilen, 2 Spalten", CODE_T)]), (ct(5) + 0.8, [("4 ORDER BY  sortiert", CODE_T)])]
    f.el(show(t, ct(2) + 0.4), lambda d, dy: console_panel(d, 760, 340 + dy, 460, 46 + 4 * 34 + 14, ents, t, 20, title="Zwischenstand", lh=34), dy=dyf(t, ct(2) + 0.4))
    ents2 = [(ct(5) + 1.4, [(str(R3), CODE_T)])]
    f.el(show(t, ct(5) + 1.2), lambda d, dy: console_panel(d, 760, 560 + dy, 460, 100, ents2, t, 19, title="Python: fetchall()", lh=34), dy=dyf(t, ct(5) + 1.2))
    f.el(show(t, ct(5) + 3.0), lambda d, dy: tag(d, 60, 624 + dy, 600, 40, "Ohne ORDER BY ist die Reihenfolge nicht garantiert", LIGHTA, AMB, 22, outl=AMB), dy=dyf(t, ct(5) + 3.0))

# ---------------------------------------------------------------- 4 GROUP BY
def sc4(f, t, ct):
    heading(f, t, "GROUP BY: Zeilen in Fächer")
    f.el(show(t, ct(1)), lambda d, dy: code_n(d, 60, 112 + dy, 1160, [Q4], None, [-1], t, 22, 32, {0}, title="SQL", lex=sql_hl), dy=dyf(t, ct(1)))
    BX = {"D2": 540, "F1": 900}
    def bins(d, dy):
        for k, (nm, n) in {"D2": ("D2", 3), "F1": ("F1", 2)}.items():
            x = BX[nm]; d.rounded_rectangle((x - 20, 240 + dy, x + 320, 560 + dy), 14, fill=WHITE, outline=LINE, width=2)
            T2(d, x - 4, 252 + dy, f"Fach {nm}", F(28, 700), DARK, "la")
    f.el(show(t, ct(0) + 0.3), bins, dy=dyf(t, ct(0) + 0.3))
    slots = {"D2": 0, "F1": 0}
    def chips(d, dy):
        sl = {"D2": 0, "F1": 0}
        for i, r in enumerate(ROWS):
            m = r[2]; k = sl[m]; sl[m] += 1
            sx, sy = 60, 252 + i * 52; tx, ty = BX[m], 296 + k * 52
            a = ap(t, ct(0) + 0.5 + 0.2 * i, 0.4)
            p = ap(t, ct(0) + 2.6 + 0.5 * i, 0.9)
            if a <= 0: continue
            x = lerp(sx, tx, p); y = lerp(sy, ty, p)
            d.rounded_rectangle((x, y + dy, x + 270, y + 44 + dy), 10, fill=mix(WHITE, LIGHTB if m == "D2" else LIGHTA, a), outline=mix(WHITE, BLUE if m == "D2" else AMB, a), width=2)
            T2(d, x + 16, y + 22 + dy, str(r[0]), M(22, True), mix(WHITE, DARK, a), "lm"); T2(d, x + 100, y + 22 + dy, m, M(22), mix(WHITE, DARK, a), "lm"); T2(d, x + 256, y + 22 + dy, str(r[3]), M(22, True), mix(WHITE, DARK, a), "rm")
    f.el(1.0, chips)
    def merkk(d, dy):
        card(d, 60, 252 + dy, 400, 140); T2(d, 90, 264 + dy, "Ein Fach je Wert", F(28, 700), DARK, "la"); T2(d, 90, 306 + dy, "der Spalte maschine", F(24, 600), GREY, "la")
        T2(d, 90, 346 + dy, "SUM rechnet je Fach", F(24, 700), GREEN, "la")
    f.el(show(t, ct(1) + 0.6), merkk, dy=dyf(t, ct(1) + 0.6))
    def sums(d, dy):
        for nm, s in (("D2", "500 + 300 + 800 = 1600"), ("F1", "120 + 60 = 180")):
            T2(d, BX[nm] - 4, 526 + dy, "SUM:", F(22, 700), GREY, "lm"); T2(d, BX[nm] + 50, 526 + dy, s, F(24, 700), GREEN, "lm")
    f.el(show(t, ct(2) + 0.3), sums, dy=dyf(t, ct(2) + 0.3))
    ents = [(ct(3) + 0.3, [(str(R4), CODE_T)])]
    f.el(show(t, ct(3) + 0.1), lambda d, dy: console_panel(d, 60, 590 + dy, 640, 46 + 34 + 12, ents, t, 24, title="Python: fetchall()", lh=34), dy=dyf(t, ct(3) + 0.1))
    f.el(show(t, ct(3) + 1.8), lambda d, dy: tag(d, 740, 610 + dy, 360, 44, "5 Zeilen werden zu 2 Zeilen", LIGHTG, GREEN, 24, outl=GREEN), dy=dyf(t, ct(3) + 1.8))

# ---------------------------------------------------------------- 5 SQL-Injection
FS = 'sql = f"SELECT nr FROM auftraege WHERE teil = \'{eingabe}\'"'
VOR = "SELECT nr FROM auftraege WHERE teil = '"
FULL = VOR + INJ + "'"
def sc5(f, t, ct):
    heading(f, t, "SQL-Injection")
    typ = int(max(0, t - ct(1) - 0.3) * 14)
    def feld(d, dy):
        T2(d, 60, 120 + dy, "Teil suchen", F(26, 700), GREY, "lm")
        d.rounded_rectangle((220, 98 + dy, 840, 146 + dy), 10, fill=WHITE, outline=BLUE, width=3)
        txt = INJ[:typ]
        if typ == 0: T2(d, 240, 122 + dy, "FLANSCH_80", M(26), GREY, "lm")
        else: T2(d, 240, 122 + dy, txt, M(26, True), DARK, "lm")
        chip(d, 860, 98 + dy, 150, 48, "Suchen", LIGHTB, BLUE, 24)
    f.el(show(t, 0.3), feld, dy=dyf(t, 0.3))
    f.el(show(t, ct(0) + 1.4), lambda d, dy: code_n(d, 60, 164 + dy, 1160, [FS], None, [-1], t, 22, 32, {0}, title="Python"), dy=dyf(t, ct(0) + 1.4))
    g = ap(t, ct(2) + 0.5, 0.9)
    def sqlp(d, dy):
        x0, y0, W_ = 60, 284, 1160
        d.rounded_rectangle((x0, y0 + dy, x0 + W_, y0 + 140 + dy), 14, fill=BOX); T(d, x0 + 22, y0 + 12 + dy, "SQL-Text, den execute bekommt", F(20, 600), CODE_C)
        fm = M(30); c = fm.getlength("M"); tx = x0 + 30; ty = y0 + 52 + dy
        hl = {}
        pos = 0
        for txt, col in sql_hl(FULL):
            for ch in txt: hl[pos] = col; pos += 1
        s = len(VOR); e = s + len(INJ)
        shown = len(FULL) if t >= ct(1) else int(len(VOR) + 1)   # Eingabe erscheint, sobald sie getippt wird
        if t >= ct(1): shown = len(VOR) + min(len(INJ), typ) + (1 if typ >= len(INJ) else 0)
        else: shown = len(VOR) + 1
        for i, ch in enumerate(FULL[:shown]):
            x = tx + i * c
            if s <= i < e:
                if g < 1: d.rectangle((x, ty - 4, x + c, ty + 38), fill=mix((96, 74, 20), BOX, g))
                col = mix(CODE_N, hl[i], g)
            else: col = hl[i]
            d.text((x, ty), ch, font=fm, fill=col)
        if t >= ct(1) + 0.5:
            lab = "Eingabe = Daten" if g < 0.5 else "wird zu SQL-Code"
            col = AMBER if g < 0.5 else CODE_R
            xa, xb = tx + s * c, tx + e * c
            d.line((xa, ty + 46, xb, ty + 46), fill=col, width=3); T2(d, (xa + xb) / 2, ty + 62, lab, F(22, 700), col, "ma")
    f.el(show(t, ct(1) + 0.1), sqlp, dy=dyf(t, ct(1) + 0.1))
    def ev(d, dy):
        rows = []
        for r in ROWS: rows.append((str(r[0]), r[1], "falsch", "wahr", "Treffer"))
        cols = {}
        for i in range(5): cols[(i, 2)] = RED; cols[(i, 3)] = GREEN; cols[(i, 4)] = GREEN
        rt = [ct(3) + 0.5 + 0.45 * i for i in range(5)]
        grid(d, 60, 448 + dy, [90, 180, 170, 150, 130], ["nr", "teil", "teil = 'x'", "'1'='1'", "Ergebnis"], rows, t, rt, 20, 34, new_hl=False, colors=cols)
    f.el(show(t, ct(3) + 0.1), ev, dy=dyf(t, ct(3) + 0.1))
    def res(d, dy):
        card(d, 840, 448 + dy, 380, 204, stripe=False); d.rectangle((840, 448 + dy, 848, 652 + dy), fill=RED)
        T2(d, 872, 464 + dy, "5 Treffer", F(54, 700), RED, "la"); T2(d, 872, 532 + dy, "alle Aufträge der Zelle", F(26, 700), DARK, "la")
        T2(d, 872, 572 + dy, "WHERE ist nicht mehr", F(22, 600), GREY, "la"); T2(d, 872, 600 + dy, "vom Programm bestimmt", F(22, 600), GREY, "la")
    f.el(show(t, ct(3) + 2.6), res, dy=dyf(t, ct(3) + 2.6))
    f.el(show(t, ct(4) + 0.2), lambda d, dy: tag(d, 60, 660 + dy, 600, 30, "sqlite3: execute führt nur eine Anweisung aus", LIGHTK, GREY, 21), dy=dyf(t, ct(4) + 0.2))

# ---------------------------------------------------------------- 6 Platzhalter
def sc6(f, t, ct):
    heading(f, t, "Platzhalter statt f-String")
    f.el(show(t, 0.3), lambda d, dy: code_n(d, 60, 108 + dy, 1160, ['cur.execute("SELECT nr FROM auftraege WHERE teil = ?", (eingabe,))'], None, [-1], t, 22, 32, {0}, title="Python"), dy=dyf(t, 0.3))
    def fest(d, dy):
        d.rounded_rectangle((60, 232 + dy, 1220, 322 + dy), 14, fill=BOX); T(d, 82, 240 + dy, "SQL-Text, bleibt fest", F(20, 600), CODE_C)
        fm = M(30); c = fm.getlength("M"); s = "SELECT nr FROM auftraege WHERE teil = ?"
        x = 90
        for tx, col in sql_hl(s):
            d.text((x, 276 + dy), tx, font=fm, fill=col); x += c * len(tx)
        qx = 90 + c * (len(s) - 1)
        d.rounded_rectangle((qx - 4, 272 + dy, qx + c + 4, 314 + dy), 6, outline=CODE_R, width=3)
    f.el(show(t, ct(0) + 0.2), fest, dy=dyf(t, ct(0) + 0.2))
    qx = 90 + M(30).getlength("M") * 38
    p = ap(t, ct(0) + 2.4, 1.0)
    def daten(d, dy):
        T2(d, 60, 354 + dy, "Wert, getrennt als Daten", F(24, 700), GREY, "la")
        w = int(M(26, True).getlength(INJ) + 36)
        x = lerp(90, qx - w / 2 + 12, p); y = lerp(390, 336, p)
        d.rounded_rectangle((x, y + dy, x + w, y + 48 + dy), 10, fill=LIGHTA, outline=AMB, width=2); T2(d, x + w / 2, y + 24 + dy, INJ, M(26, True), AMB, "mm")
    f.el(show(t, ct(0) + 0.6), daten, dy=dyf(t, ct(0) + 0.6))
    def ergebnis(d, dy):
        card(d, 880, 336 + dy, 340, 112)
        T2(d, 910, 344 + dy, "0 Treffer", F(40, 700), GREEN, "la"); T2(d, 910, 390 + dy, "kein Teil heißt so", F(22, 600), GREY, "la")
        a = ap(t, ct(1) + 1.2, 0.4)
        if a > 0: T2(d, 910, 414 + dy, "auch O'Brien geht", F(22, 700), mix(WHITE, GREEN, a), "la")
    f.el(show(t, ct(1) + 0.1), ergebnis, dy=dyf(t, ct(1) + 0.1))
    def tup(d, dy):
        for x, tx, lab, ok in ((60, "(maschine,)", "Tupel mit einem Element", True), (460, "('D2')", "nur der Text D2, 2 Zeichen", False)):
            card(d, x, 456 + dy, 380, 112, stripe=False)
            chip(d, x + 20, 472 + dy, 200, 52, tx, LIGHTG if ok else LIGHTR, GREEN if ok else RED, 26, outl=GREEN if ok else RED, mono=True)
            T2(d, x + 236, 498 + dy, "Tupel" if ok else "kein Tupel", F(24, 700), GREEN if ok else RED, "lm")
            T2(d, x + 20, 534 + dy, lab, F(22, 600), GREY, "la")
    f.el(show(t, ct(2) + 0.1), tup, dy=dyf(t, ct(2) + 0.1))
    def merk(d, dy):
        card(d, 60, 588 + dy, 1160, 90); T2(d, 90, 598 + dy, "Merke", F(26, 700), RED, "la")
        T2(d, 90, 646 + dy, "Daten nie in den SQL-Text kleben. Immer ? und ein Tupel.", F(30, 700), DARK, "lm")
    f.el(show(t, ct(3) + 0.1), merk, dy=dyf(t, ct(3) + 0.1))

SCENES = {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5, 6: sc6}

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "V19 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Datenbanken", F(104, 700), DARK)
        T2(d, 90, 290, "und SQL: Aufträge der Zelle FZ-3", F(48, 400), GREY)
        auftrags_tabelle(d, 90, 420, [1] * 5, rh=40, size=20, key_col=0)
        code_n(d, 740, 440, 480, ["SELECT maschine, SUM(menge)", "FROM auftraege", "GROUP BY maschine"], None, [-1] * 3, 9, 20, 30, title="SQL", lex=sql_hl)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn); f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
