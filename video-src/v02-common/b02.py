"""Gemeinsame Bausteine der Videos zu Termin 02 und 03 (v02-theorie, v02-python, v02-beispiel, v03-theorie, v03-python, v03-beispiel).

Baut auf v01-common/bausteine.py auf (alles von dort ist hier mit importiert: kopf, E, show, tag, chip, card, TB, cpanel,
lauf_panel, plan_draw, symbol, reveal, aktuell ...) und ergaenzt:
  Plan mit Raute     plan_zweig, weg, weg_vis, weg_hl, zusammen
  Wahrheitstabelle   wahrheitstabelle, tabelle_breite, tabelle_hoehe, zeilenweise
  Vergleich          vergleich, wert_chip, vergleich_zeile, durchstreichen
  Programmlauf       code_lauf (mit grauen, uebersprungenen Zeilen), CodeGeo, spalte, code_markiere,
                     code_einrueckung, code_fluchtlinie, zeilen_notiz
  Bildzeichen        automat, muenze, aussage_karte, werkzeugkarte, wertereihe, bahn
v01-common bleibt unveraendert. Jeder Text wird gegen seinen Kasten (fit/TB) und gegen den Bildrand (T2) geprueft,
die Bausteine pruefen zusaetzlich die Hoehe (imbild): ein Ueberlauf bricht den Lauf ab."""
import os, sys, math
HERE_B02 = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE_B02, "..", "v01-common"))
from bausteine import *
from bausteine import Dia

NL = chr(10)
GREYL = (156, 163, 175)          # Linien und Text im Hintergrund


# ---------------------------------------------------------------- Pruefung der Hoehe
def imbild(y0, y1, what="Element"):
    """Bricht ab, wenn ein Element oben oder unten aus dem Bild laeuft (unten bleibt Platz fuer die Fusszeile).
    Beispiel: imbild(y, y + h, "Tabelle")"""
    assert 0 <= y0 and y1 <= 690, f"{what} laeuft aus dem Bild (y {y0:.0f}..{y1:.0f})"


def bahn(t, t0, dur, p0, p1):
    """Weich bewegter Punkt von p0 nach p1 zwischen t0 und t0 + dur (zum Beispiel eine Raute, die nach rechts wandert).
    Beispiel: x, y = bahn(t, a(1, 0.2), 0.8, (200, 300), (700, 160))"""
    k = ap(t, t0, dur); return (lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k))


# ================================================================ Plan mit Raute
def _lab_w(fs, txt):
    return F(int(max(14, fs - 2)), 600).getlength(txt)


def plan_zweig(items, fs=20, gap=26, mitte=40):
    """Senkrechter Plan mit Verzweigungen wie auf der Website: ja-Weg links, nein-Weg rechts, beide laufen unter der Raute
    wieder zusammen (Punkt auf der Mittellinie). Rauten duerfen in einem Weg stehen (zweite Raute im nein-Weg = drei Wege).
    items: Liste aus (schluessel, art, text[, opts]) mit art term, io, proc, und Rauten als
           (schluessel, "dec", text, ja_items, nein_items[, opts]); opts wie bei Dia.node (minw, minh ...).
    Schluessel der Kanten: 'a-b' zwischen zwei Symbolen; 'd-ja' / 'd-nein' von der Raute in den Weg (mit Beschriftung);
    'd-ja-z' / 'd-nein-z' vom Ende eines Wegs in den Zusammenfuehrungspunkt; 'd-x' vom Zusammenfuehrungspunkt zum naechsten
    Symbol x. Ein leerer Weg hat nur 'd-ja' bzw. 'd-nein' (fuehrt direkt in den Punkt).
    Zusaetzlich: D.reihenfolge (alle Schluessel von oben nach unten, fuer reveal), D.spec (fuer weg).
    Beispiel:
        P = plan_zweig([("s", "term", "Start"), ("e", "io", "Eingabe: alter"),
                        ("d", "dec", "alter >= 16?", [("j", "io", 'Ausgabe: "Einlass"')], [("n", "io", 'Ausgabe: "Kein Einlass"')]),
                        ("o", "io", 'Ausgabe: "Der Nächste bitte"'), ("end", "term", "Ende")])
        plan_draw(f, 1.0, P, (60, 104, 580, 520), hl=weg_hl(weg(P, {"d": "ja"})))"""
    D = Dia(fs); D.spec = items; D.reihenfolge = []; D.merge = {}
    stub_j = _lab_w(fs, "ja") + 26; stub_n = _lab_w(fs, "nein") + 26

    def mk(seq):
        for it in seq:
            if it[1] == "dec":
                D.node(it[0], "dec", it[2], 0, 0, **(it[5] if len(it) > 5 else {})); mk(it[3]); mk(it[4])
            else:
                D.node(it[0], it[1], it[2], 0, 0, **(it[3] if len(it) > 3 else {}))
    mk(items)

    def measure(seq):
        L = R = 0.0
        for it in seq:
            n = D.nodes[it[0]]; hw = n.w / 2
            if it[1] == "dec":
                Lj, Rj = measure(it[3]); Ln, Rn = measure(it[4])
                n.a = max(hw + stub_j, Rj + mitte / 2); n.b = max(hw + stub_n, Ln + mitte / 2)
                L = max(L, hw, n.a + Lj); R = max(R, hw, n.b + Rn)
            else:
                L = max(L, hw); R = max(R, hw)
        return L, R
    measure(items)

    def link(prev, k):
        """Kante vom vorigen Ausgang in das Symbol k (oben)."""
        if prev is None: return
        n = D.nodes[k]
        if prev[0] == "node":
            D.edge(f"{prev[1]}-{k}", prev[1], "b", k, "t"); D.reihenfolge.append(f"{prev[1]}-{k}")
        elif prev[0] == "merge":
            D.edge(f"{prev[1]}-{k}", prev[2], None, k, "t", via=[]); D.reihenfolge.append(f"{prev[1]}-{k}")
        else:   # ("corner", d, seite, x_spalte)
            _, d, seite, xs = prev; dn = D.nodes[d]
            D.edge(f"{d}-{seite}", d, "l" if seite == "ja" else "r", k, "t", via=[(xs, dn.cy)], label=seite)
            D.reihenfolge.append(f"{d}-{seite}")

    def place(seq, cx, y, prev):
        bottom = y - gap
        for it in seq:
            k = it[0]; n = D.nodes[k]; n.cx = cx; n.cy = y + n.h / 2
            link(prev, k); D.reihenfolge.append(k)
            if it[1] == "dec":
                # Die Wege beginnen so hoch wie moeglich: ein Symbol, das seitlich neben der Raute Platz hat, rueckt
                # bis knapp unter die Ecke hoch; sonst beginnt es dort, wo die untere Haelfte der Raute schmal genug ist.
                hw, hh = n.w / 2, n.h / 2; yb = n.cy + gap
                for zweig, ab in ((it[3], n.a), (it[4], n.b)):
                    if zweig:
                        dx = ab - D.nodes[zweig[0][0]].w / 2
                        yb = max(yb, n.cy + hh * (1 - dx / hw) + 14 if dx < hw + 8 else yb)
                xj, xn = cx - n.a, cx + n.b
                ej, bj = place(it[3], xj, yb, ("corner", k, "ja", xj))
                en, bn = place(it[4], xn, yb, ("corner", k, "nein", xn))
                ym = max(bj, bn, n.cy + n.h / 2) + gap; pm = (cx, ym)
                for seite, ex, xs in (("ja", ej, xj), ("nein", en, xn)):
                    if ex[0] == "corner":            # leerer Weg: von der Ecke direkt in den Punkt
                        D.edge(f"{k}-{seite}", k, "l" if seite == "ja" else "r", pm, None, via=[(xs, n.cy), (xs, ym)], label=seite, arrow=False)
                        D.reihenfolge.append(f"{k}-{seite}")
                    else:
                        p0 = (ex[1], "b") if ex[0] == "node" else (ex[2], None)
                        x0 = xs
                        D.edge(f"{k}-{seite}-z", p0[0], p0[1], pm, None, via=[(x0, ym)], arrow=False)
                        D.reihenfolge.append(f"{k}-{seite}-z")
                D.merge[k] = pm
                prev = ("merge", k, pm); y = ym + gap; bottom = ym
            else:
                prev = ("node", k); y = n.cy + n.h / 2 + gap; bottom = n.cy + n.h / 2
        return prev, bottom
    place(items, 0.0, 0.0, None)
    assert set(D.reihenfolge) == set(D.nodes) | set(D.edges), "plan_zweig: Schluessel doppelt vergeben"
    return D


def plan_draw(f, a, D, box, vis=None, hl=None, maxzoom=1.4, bg=BG, label_col=None):
    """Wie plan_draw aus Termin 01 (Plan mittig in box=(x, y, w, h), zuerst zeichnen, gibt (zoom, cam) zurueck), mit zwei
    Ergaenzungen fuer Plaene mit Raute: hervorgehobene Kanten liegen oben (der Weg wird nicht von grauen Linien
    ueberdeckt), und die Beschriftungen ja/nein stehen groesser und fett, in der Farbe des Wegs, wenn er hervorgehoben ist.
    label_col: Farbe der nicht hervorgehobenen Beschriftungen (sonst dunkelgrau).
    Beispiel: z, cam = plan_draw(f, 1.0, P, (60, 104, 580, 520), vis=weg_vis(W), hl=weg_hl(W))"""
    hl = hl or {}; vis = vis or (lambda k: 1.0)
    D.edges = dict(sorted(D.edges.items(), key=lambda kv: kv[0] in hl))
    z, cam = plan_fit(D, box, maxzoom)
    pap_view(f, a, D, box, cam, vis=vis, hl=hl, zoom=z, bg=bg, labels=False)
    fl = F(max(17, int(D.fs * z)), 700)
    for k, e in D.edges.items():
        if not e.label: continue
        X, Y = plan_xy(box, z, cam, *e.pts[0]); col = hl.get(k, label_col or LABC_B02)
        links = e.lab == "l"
        f.el(clamp(a) * vis(k), lambda d, dy, X=X, Y=Y, col=col, links=links, txt=e.label:
             T2(d, X + (-8 if links else 8) * z, Y - 6 * z, txt, fl, col, "rs" if links else "ls"))
    return z, cam

LABC_B02 = (80, 88, 100)


def weg(D, entscheidungen):
    """Schluessel (Symbole und Kanten) des Wegs durch einen Plan aus plan_zweig, in Laufreihenfolge.
    entscheidungen: {raute: "ja" | "nein"}; Rauten, die der Weg nicht erreicht, duerfen fehlen.
    Beispiel: weg(P, {"d1": "nein", "d2": "ja"})  ->  ["s", "s-e", "e", "e-d1", "d1", "d1-nein", "d2", "d2-ja", "r", ...]"""
    out = []

    def walk(seq, prev):
        for it in seq:
            k = it[0]
            if prev is not None:
                out.append(f"{prev[1]}-{k}" if prev[0] in ("node", "merge") else f"{prev[1]}-{prev[2]}")
            out.append(k)
            if it[1] == "dec":
                s = entscheidungen[k]; assert s in ("ja", "nein"), s
                zweig = it[3] if s == "ja" else it[4]
                if zweig:
                    walk(zweig, ("corner", k, s)); out.append(f"{k}-{s}-z")
                else:
                    out.append(f"{k}-{s}")
                prev = ("merge", k)
            else:
                prev = ("node", k)
    walk(D.spec, None)
    assert all(k in D.nodes or k in D.edges for k in out), out
    return out


def weg_vis(keys, rest=0.3, a=1.0):
    """vis-Funktion fuer plan_draw: der Weg (keys) voll, alles andere abgeblendet auf rest. a: Ueberblendung 0..1
    (0 = noch nichts abgeblendet). Beispiel: plan_draw(f, 1, P, box, vis=weg_vis(weg(P, {"d": "ja"}), a=show(t, t1)))"""
    ks = set(keys); r = lerp(1.0, rest, a)
    return lambda k: 1.0 if k in ks else r


def weg_hl(keys, col=RED, nur=None):
    """hl-Dict fuer plan_draw: der Weg in Farbe col. nur: Teilmenge, z.B. nur Kanten (lambda k: "-" in k).
    Beispiel: hl=weg_hl(weg(P, {"d": "nein"}))"""
    return {k: col for k in keys if (nur is None or nur(k))}


def zusammen(D, d):
    """Schluessel der beiden Kanten, die nach der Raute d zusammenlaufen (fuer 'hier laufen die Wege zusammen').
    Beispiel: plan_draw(f, 1, P, box, hl={k: RED for k in zusammen(P, "d")})"""
    return [k for k in (f"{d}-ja-z", f"{d}-nein-z", f"{d}-ja", f"{d}-nein") if k in D.edges and D.edges[k].pts[-1] == D.merge[d]]


# ================================================================ Wahrheitstabelle
WERTFARBE = {"1": GREEN, "wahr": GREEN, "True": GREEN, "ja": GREEN,
             "0": RED, "falsch": RED, "False": RED, "nein": RED}


def tabelle_breiten(spalten, breiten=None, kopf_size=32, minw=120):
    """Breite je Spalte (aus dem Kopftext, mindestens minw). Beispiel: tabelle_breiten(["A", "B", "A UND B"])"""
    if breiten: return list(breiten)
    return [max(minw, F(kopf_size, 700).getlength(s) + 52) for s in spalten]


def tabelle_breite(spalten, breiten=None, kopf_size=32):
    """Gesamtbreite einer Wahrheitstabelle (zum Zentrieren). Beispiel: x = 640 - tabelle_breite(["A", "B", "A UND B"]) / 2"""
    return sum(tabelle_breiten(spalten, breiten, kopf_size))


def tabelle_hoehe(n_zeilen, rh=62):
    """Gesamthoehe (Kopf + n Zeilen). Beispiel: tabelle_hoehe(4, 62) == 310"""
    return rh * (n_zeilen + 1)


def zeilenweise(t0, dt, n):
    """Zeitpunkte fuer n Zellen, die nacheinander erscheinen. Beispiel: zeilenweise(a(1, 0.3), 0.35, 4)"""
    return [t0 + i * dt for i in range(n)]


def wahrheitstabelle(f, t, x, y, spalten, zeilen, t_spalten, t_zellen=None, hl=None, hl_a=1.0, breiten=None,
                     rh=62, size=36, kopf_size=32, trenner=None, farbig="ergebnis"):
    """Wahrheitstabelle mit 1/0 (oder wahr/falsch): Spalten erscheinen nacheinander, Zellen fuellen sich zeilenweise.
    spalten: Kopfzeile, z.B. ["A", "B", "A UND B"]; zeilen: Werte als Strings je Zeile, z.B. [["0", "0", "0"], ...].
    t_spalten: Zeitpunkt je Spalte (Kopf und leere Zellen erscheinen). t_zellen: je Spalte eine Zahl (alle Werte zugleich)
    oder eine Liste mit einer Zeit je Zeile; None = Werte erscheinen mit der Spalte.
    hl: Menge hervorgehobener Zeilen (rot umrandet, rosa hinterlegt), hl_a: deren Deckkraft 0..1 (zum Ein- und Ausblenden).
    trenner: Index der ersten Ergebnis-Spalte (dicke Linie davor). farbig: "ergebnis" (Standard) = nur die Spalten ab trenner
    farbig (1/wahr gruen, 0/falsch rot), die Eingangsspalten dunkel; True = alle Spalten farbig; False = alles dunkel.
    Gibt (breite, hoehe) zurueck.
    Beispiel: wahrheitstabelle(f, t, 380, 200, ["A", "B", "A UND B"], ZEILEN, [a(1), a(1), a(4)],
                               [a(3), a(3), zeilenweise(a(4, 0.5), 0.4, 4)], hl={3} if t > a(5) else None, trenner=2)"""
    ws = tabelle_breiten(spalten, breiten, kopf_size); xs = [x + sum(ws[:j]) for j in range(len(ws))]
    W_, H_ = sum(ws), tabelle_hoehe(len(zeilen), rh)
    imbild(y, y + H_, "Wahrheitstabelle"); assert x >= 24 and x + W_ <= 1256, f"Wahrheitstabelle zu breit ({x}..{x + W_})"
    assert all(len(z) == len(spalten) for z in zeilen), "Wahrheitstabelle: Zeile mit falscher Spaltenzahl"
    tz = t_zellen if t_zellen is not None else t_spalten
    hl = hl or set()
    fk = F(kopf_size, 700); fv = F(size, 700)
    for j, (sp, w) in enumerate(zip(spalten, ws)):
        cx = xs[j]
        def spalte(d, dy, j=j, sp=sp, w=w, cx=cx):
            d.rectangle((cx, y + dy, cx + w, y + rh + dy), fill=DARK, outline=DARK)
            TB(d, cx + w / 2, y + rh / 2 + dy, sp, fk, WHITE, w - 16, "mm", "Tabellenkopf")
            for i in range(len(zeilen)):
                yy = y + rh * (i + 1) + dy
                fill = mix(WHITE, LIGHTR, hl_a) if i in hl else WHITE
                d.rectangle((cx, yy, cx + w, yy + rh), fill=fill, outline=LINE, width=2)
        E(f, t, t_spalten[j], spalte)
        zt = tz[j] if isinstance(tz[j], (list, tuple)) else [tz[j]] * len(zeilen)
        for i, row in enumerate(zeilen):
            v = row[j]
            bunt = farbig is True or (farbig == "ergebnis" and (not trenner or j >= trenner))
            col = WERTFARBE.get(v, DARK) if bunt else DARK
            E(f, t, max(zt[i], t_spalten[j]),
              lambda d, dy, i=i, v=v, col=col, cx=cx, w=w: TB(d, cx + w / 2, y + rh * (i + 1.5) + dy, v, fv, col, w - 16, "mm", "Tabellenwert"))
    if trenner:
        xt = xs[trenner]
        E(f, t, t_spalten[trenner], lambda d, dy: d.line((xt, y + dy, xt, y + H_ + dy), fill=DARK, width=5))
    if hl and hl_a > 0.01:
        vis = [j for j in range(len(spalten)) if t >= t_spalten[j]]
        if vis:
            x0, x1 = xs[vis[0]], xs[vis[-1]] + ws[vis[-1]]
            def rahmen(d, dy):
                for i in hl:
                    yy = y + rh * (i + 1) + dy
                    d.rectangle((x0 - 2, yy - 2, x1 + 2, yy + rh + 2), outline=RED, width=5)
            f.el(hl_a, rahmen)
    return W_, H_


# ================================================================ Vergleich mit Ergebnis
def _farbteile(txt):
    """Farben wie im Code-Kasten (Zahlen gelb, Namen hell)."""
    return highlight(txt)


def vergleich_mass(links, op, rechts, size=56, pad=28):
    """(breite, hoehe) des Kastens, den vergleich zeichnet. Beispiel: bw, bh = vergleich_mass("2", ">=", "1.5", 72)"""
    return M(size, True).getlength(f"{links} {op} {rechts}") + 2 * pad, int(size * 1.7)


def vergleich(d, x, y, links, op, rechts, size=56, unter=None, op_col=None, anchor="l", pad=28):
    """Ein Vergleich gross im Code-Kasten, zum Beispiel 2 >= 1.5; so geschrieben, wie man ihn tippt.
    x, y: linke obere Ecke (anchor="l") oder Mitte oben (anchor="m"). unter: (text_links, text_rechts) klein unter den
    beiden Seiten (z.B. ("dein Geld", "Preis der Cola")); None oder "" fuer keine. op_col: Farbe des Zeichens (sonst wie Code).
    Gibt ein dict mit x0, y0, x1, y1 (Kasten), op, links, rechts (je (x0, x1) des Textes) zurueck.
    Beispiel: g = vergleich(d, 640, 300 + dy, "2", ">=", "1.5", 72, unter=("dein Geld", "Preis der Cola"), anchor="m")"""
    fm = M(size, True); bw, h = vergleich_mass(links, op, rechts, size, pad)
    x0 = x - bw / 2 if anchor == "m" else x
    imbild(y, y + h + (50 if unter else 0), "Vergleich")
    assert x0 >= 24 and x0 + bw <= 1256, f"Vergleich laeuft aus dem Bild ({x0:.0f}..{x0 + bw:.0f})"
    d.rounded_rectangle((x0, y, x0 + bw, y + h), 14, fill=BOX)
    tx = x0 + pad; ty = y + h / 2
    cx = tx; teile = {}
    for name, part in (("links", links), ("sp1", " "), ("op", op), ("sp2", " "), ("rechts", rechts)):
        segs = _farbteile(part) if name != "op" else [(op, op_col or CODE_T)]
        x_start = cx
        for txt, col in segs:
            d.text((cx, ty), txt, font=fm, fill=col, anchor="lm"); cx += fm.getlength(txt)
        teile[name] = (x_start, cx)
    if unter:
        fu = F(24, 600)
        for key, txt in zip(("links", "rechts"), unter):
            if not txt: continue
            a, b = teile[key]; m = (a + b) / 2
            d.line((a, y + h + 10, b, y + h + 10), fill=GREY, width=3)
            TB(d, m, y + h + 20, txt, fu, GREY, max(220, b - a + 120), "ma", "Beschriftung unter dem Vergleich")
    return dict(x0=x0, y0=y, x1=x0 + bw, y1=y + h, op=teile["op"], links=teile["links"], rechts=teile["rechts"])


def wert_chip(d, x, y, wert, h=64, size=None, anchor="l"):
    """Ergebnis eines Vergleichs: True/False (Code-Schrift), wahr/falsch, ja/nein oder 1/0 als Kapsel, gruen oder rot.
    x, y: linke obere Ecke (anchor="l") bzw. Mitte oben ("m"). Gibt die rechte Kante zurueck.
    Beispiel: wert_chip(d, g["x1"] + 90, g["y0"] + 10, "True")"""
    col = WERTFARBE[wert]; fill = LIGHTG if col == GREEN else LIGHTR
    size = size or int(h * 0.6)
    font = M(size, True) if wert in ("True", "False") else F(size, 700)
    w = font.getlength(wert) + h * 0.9
    x0 = x - w / 2 if anchor == "m" else x
    imbild(y, y + h, "Ergebnis"); assert x0 >= 24 and x0 + w <= 1256, f"Ergebnis {wert} laeuft aus dem Bild"
    d.rounded_rectangle((x0, y, x0 + w, y + h), h // 2, fill=fill, outline=col, width=3)
    T2(d, x0 + w / 2, y + h / 2, wert, font, col, "mm")
    return x0 + w


def vergleich_zeile(f, t, x, y, links, op, rechts, t_in, t_erg=None, sprache="python", size=56, unter=None, op_col=None, ergebnis=None):
    """Vergleich, dann (ab t_erg) Pfeil und Ergebnis. Das Ergebnis wird nachgerechnet (eval der beiden Zahlen);
    sprache: "python" (True/False), "deutsch" (wahr/falsch), "weg" (ja/nein). ergebnis: zur Kontrolle (muss stimmen).
    Gibt dict(x0, y0, x1, y1, wert) zurueck (Kasten des Vergleichs und das gerechnete Ergebniswort).
    Beispiel: vergleich_zeile(f, t, 120, 300, "1.5", ">", "1.5", a(3), a(3, 0.5), "deutsch")   # zeigt: falsch"""
    wert = eval(f"({links}) {op} ({rechts})", {"__builtins__": {}})
    wort = {"python": ("True", "False"), "deutsch": ("wahr", "falsch"), "weg": ("ja", "nein")}[sprache][0 if wert else 1]
    if ergebnis is not None: assert ergebnis == wort, f"Vergleich {links} {op} {rechts}: gerechnet {wort}, erwartet {ergebnis}"
    bw, hc = vergleich_mass(links, op, rechts, size)
    E(f, t, t_in, lambda d, dy: vergleich(d, x, y + dy, links, op, rechts, size, unter, op_col))
    if t_erg is not None:
        ch = int(hc * 0.78); x1 = x + bw
        def erg(d, dy):
            pfeil(d, x1 + 16, y + hc / 2 + dy, x1 + 74, y + hc / 2 + dy, GREY, 6, 18)
            wert_chip(d, x1 + 88, y + (hc - ch) / 2 + dy, wort, ch)
        E(f, t, t_erg, erg)
    return dict(x0=x, y0=y, x1=x + bw, y1=y + hc, wert=wort)


def durchstreichen(d, x0, y0, x1, y1, col=RED, w=7, art="schraeg"):
    """Streicht einen Bereich durch: art "schraeg" (von links unten nach rechts oben) oder "waagrecht".
    Beispiel: a, b = g["op"]; durchstreichen(d, a - 6, g["y0"] + 14, b + 6, g["y1"] - 14)"""
    if art == "waagrecht":
        ym = (y0 + y1) / 2; d.line((x0, ym, x1, ym), fill=col, width=w)
    else:
        d.line((x0, y1, x1, y0), fill=col, width=w)


# ================================================================ Programmlauf: Code mit grauen Zeilen und Markierungen
class CodeGeo:
    """Lage der Zeichen in einem Code-Kasten (wie code_n/cpanel/code_lauf): Zeile i, Spalte c (Zeichen, ab 0).
    Beispiel: g = CodeGeo(460, 124, 760, 24, 42, 7); g.zeichen(2, 15, 16) -> Rechteck um das 16. Zeichen in Zeile 3."""
    def __init__(s, x, y, w, size, lh, n):
        s.x, s.y, s.w, s.size, s.lh, s.n = x, y, w, size, lh, n
        s.cw = M(size).getlength("x"); s.off = code_off(size); s.h = code_h(n, lh)
    def zy(s, i): return s.y + 50 + i * s.lh                      # Oberkante des Texts in Zeile i
    def zmitte(s, i): return s.zy(i) + s.size * 0.55                 # Mitte der Schrift in Zeile i
    def cx(s, c): return s.x + s.off + c * s.cw                     # linke Kante des Zeichens c
    def zeichen(s, i, c0, c1):
        """Rechteck um die Zeichen c0 .. c1-1 der Zeile i."""
        return (s.cx(c0) - 2, s.zy(i) - 6, s.cx(c1) + 2, s.zy(i) + s.size * 1.1 + 6)


def spalte(zeile, teil, von_rechts=False):
    """(c0, c1) eines Teilstrings in einer Code-Zeile, fuer code_markiere. Beispiel: spalte('if punkte >= 50:', ':', True) -> (15, 16)"""
    c0 = zeile.rfind(teil) if von_rechts else zeile.find(teil)
    assert c0 >= 0, f"{teil!r} nicht in {zeile!r}"
    return c0, c0 + len(teil)


def code_lauf(d, x, y, w, lines, t, size=24, lh=42, times=None, aktiv=None, grau=None, nums=None, title="Python", cps=55, grau_a=0.28):
    """Code-Kasten fuer den Programmlauf: aktiv = Menge der Zeilen, die gerade laufen (markiert wie in Termin 01),
    grau = Menge der uebersprungenen Zeilen (stark abgeblendet), alle anderen normal. times: Startzeit je Zeile zum
    Eintippen (None = steht schon da). nums: Zeilennummern (sonst 1..n). Gibt CodeGeo (mit .h) zurueck.
    Beispiel: g = code_lauf(d, 460, 124 + dy, 760, CODE, t, 24, 42, aktiv={2}, grau={4, 5})"""
    g = CodeGeo(x, y, w, size, lh, len(lines)); imbild(y, y + g.h, "Code")
    times = times if times is not None else [-1] * len(lines)
    nums = nums or list(range(1, len(lines) + 1)); aktiv = aktiv or set(); grau = grau or set()
    f = M(size)
    d.rounded_rectangle((x, y, x + w, y + g.h), 14, fill=BOX); T(d, x + 22, y + 14, title, F(20, 600), CODE_C)
    for i, (ln, t0) in enumerate(zip(lines, times)):
        yy = g.zy(i); n = int(max(0, t - t0) * cps)
        fit(ln, f, w - g.off - 16, f"Code Zeile {nums[i]}")
        if n <= 0: continue
        if i in aktiv:
            d.rounded_rectangle((x + 8, yy - 4, x + w - 8, yy + lh - 5), 6, fill=HLBG); d.rectangle((x + 8, yy - 4, x + 13, yy + lh - 5), fill=RED)
        dim = grau_a if i in grau else 1.0
        d.text((x + 20, yy), f"{nums[i]:>2}", font=f, fill=mix(BOX, CODE_C, dim * 0.8))
        draw_segs(d, x + g.off, yy, highlight(ln), f, n, dim)
    return g


def code_markiere(d, g, i, c0, c1, col=RED, w=3):
    """Rahmen um Zeichen im Code (Doppelpunkt, das f vor dem Anfuehrungszeichen, {preis}, :.2f ...).
    Beispiel: code_markiere(d, g, 2, *spalte(CODE[2], ":", True))"""
    d.rounded_rectangle(g.zeichen(i, c0, c1), 6, outline=col, width=w)


def code_einrueckung(d, g, i, n=4, col=AMBER):
    """Macht die n Leerzeichen am Anfang der Zeile i sichtbar (je ein Punkt) und klammert sie unten.
    Beispiel: code_einrueckung(d, g, 3)"""
    ym = g.zmitte(i); r = max(3, g.size * 0.14)
    for c in range(n):
        xm = g.cx(c) + g.cw / 2; d.ellipse((xm - r, ym - r, xm + r, ym + r), fill=col)
    yb = g.zy(i) + g.lh - 8
    d.line((g.cx(0), yb, g.cx(n), yb), fill=col, width=3)
    d.line((g.cx(0), yb - 6, g.cx(0), yb), fill=col, width=3); d.line((g.cx(n), yb - 6, g.cx(n), yb), fill=col, width=3)


def code_fluchtlinie(d, g, i0, i1, c=0, col=RED, w=3):
    """Gestrichelte senkrechte Linie links vor Spalte c von Zeile i0 bis i1: zeigt, dass if, elif und else auf derselben
    Hoehe stehen. Beispiel: code_fluchtlinie(d, g, 2, 6)"""
    xl = g.cx(c) - 5; ya, yb = g.zy(i0) - 6, g.zy(i1) + g.lh - 4; yy = ya
    while yy < yb:
        d.line((xl, yy, xl, min(yy + 10, yb)), fill=col, width=w); yy += 17


def zeilen_notiz(d, g, i, x, w, text, fill=LIGHTK, col=DARK, size=26, h=None, linie=True, outl=None):
    """Etikett auf Hoehe der Code-Zeile i, rechts neben dem Kasten (x), mit duenner Verbindungslinie vom Kastenrand.
    Beispiel: zeilen_notiz(d, g, 2, 860, 360, "32 < 30: nein", LIGHTR, RED, outl=RED)"""
    h = h or int(size * 1.9); ym = g.zmitte(i); imbild(ym - h / 2, ym + h / 2, "Zeilen-Notiz")
    if linie and x > g.x + g.w + 6: d.line((g.x + g.w + 4, ym, x, ym), fill=outl or col, width=2)
    tag(d, x, ym - h / 2, w, h, text, fill, col, size, 700, outl=outl)


# ================================================================ Bildzeichen
def muenze(d, cx, cy, r, wert="2 €"):
    """Muenze (goldener Kreis mit Wert). Beispiel: muenze(d, 900, 300 + dy, 46, "2 €")"""
    imbild(cy - r, cy + r, "Muenze")
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(246, 196, 76), outline=AMB, width=4)
    d.ellipse((cx - r + 8, cy - r + 8, cx + r - 8, cy + r - 8), outline=(214, 160, 40), width=2)
    TB(d, cx, cy, wert, F(int(r * 0.7), 700), (110, 70, 0), 2 * r - 14, "mm", "Muenze")


def _flasche(d, cx, by, s, col=RED):
    """Kleine Flasche, Boden bei by."""
    b = 15 * s; hk = 50 * s
    d.rounded_rectangle((cx - b, by - hk, cx + b, by), int(6 * s), fill=col)
    d.polygon([(cx - b, by - hk + 2), (cx - 6 * s, by - hk - 14 * s), (cx + 6 * s, by - hk - 14 * s), (cx + b, by - hk + 2)], fill=col)
    d.rectangle((cx - 6 * s, by - hk - 24 * s, cx + 6 * s, by - hk - 12 * s), fill=col)
    d.rectangle((cx - b, by - hk * 0.62, cx + b, by - hk * 0.34), fill=WHITE)


def automat(d, x, y, s=1.0, preis="1,50 €", flaschen=6, ausgabe=False, beschriftung="Cola"):
    """Getraenkeautomat (Umriss wie die Bildzeichen in Termin 01), etwa 300 x 440 Pixel bei s=1, linke obere Ecke x, y.
    preis: Preisschild (None = keins); flaschen: Zahl der Flaschen im Fenster (0 = Fach leer, dann steht dort "leer");
    ausgabe: eine Flasche liegt im Ausgabefach. Gibt (x1, y1) der rechten unteren Ecke zurueck.
    Beispiel: automat(d, 80, 130 + dy, 1.0, "1,50 €", flaschen=0)"""
    W_, H_ = 300 * s, 440 * s; x1, y1 = x + W_, y + H_; imbild(y, y1, "Automat")
    lw = max(3, int(5 * s))
    d.rounded_rectangle((x, y, x1, y1), int(18 * s), fill=WHITE, outline=DARK, width=lw)
    d.rounded_rectangle((x, y, x1, y + 64 * s), int(18 * s), fill=RED)
    d.rectangle((x, y + 40 * s, x1, y + 64 * s), fill=RED)
    TB(d, x + W_ / 2, y + 32 * s, beschriftung, F(int(34 * s), 700), WHITE, W_ - 30, "mm", "Automat")
    # Fenster mit Flaschen
    fx0, fy0, fx1, fy1 = x + 22 * s, y + 84 * s, x + 192 * s, y + 300 * s
    d.rectangle((fx0, fy0, fx1, fy1), fill=LIGHTK, outline=DARK, width=max(2, int(3 * s)))
    for r_ in range(2):
        yb = fy0 + (100 + r_ * 104) * s
        d.line((fx0, yb + 2 * s, fx1, yb + 2 * s), fill=GREYL, width=max(2, int(3 * s)))
        for c in range(3):
            if r_ * 3 + c < flaschen: _flasche(d, fx0 + (30 + c * 55) * s, yb, s)
    if flaschen == 0:
        fl = F(int(34 * s), 700); lw_ = fl.getlength("leer") + 36 * s; mx, my = (fx0 + fx1) / 2, (fy0 + fy1) / 2
        d.rounded_rectangle((mx - lw_ / 2, my - 28 * s, mx + lw_ / 2, my + 28 * s), int(28 * s), fill=WHITE, outline=GREY, width=2)
        TB(d, mx, my, "leer", fl, GREY, fx1 - fx0 - 20, "mm", "Automat")
    # Bedienfeld: Preis, Muenzschlitz, Knopf
    px0, px1 = x + 206 * s, x + 280 * s
    if preis:
        fp = F(int(24 * s), 700)
        pw = max(px1 - px0, fp.getlength(preis) + 20 * s); pxa = min(px0, x1 - 8 * s - pw)
        d.rounded_rectangle((pxa, y + 90 * s, pxa + pw, y + 132 * s), int(8 * s), fill=LIGHTA, outline=AMB, width=2)
        TB(d, pxa + pw / 2, y + 111 * s, preis, fp, AMB, pw - 8, "mm", "Preisschild")
    d.rounded_rectangle((px0 + 20 * s, y + 160 * s, px1 - 20 * s, y + 220 * s), int(6 * s), fill=LIGHTK, outline=DARK, width=2)
    d.rectangle((px0 + 33 * s, y + 172 * s, px1 - 33 * s, y + 208 * s), fill=DARK)
    d.ellipse(((px0 + px1) / 2 - 16 * s, y + 244 * s, (px0 + px1) / 2 + 16 * s, y + 276 * s), fill=RED)
    # Ausgabefach
    ax0, ay0, ax1, ay1 = x + 40 * s, y + 334 * s, x1 - 40 * s, y + 404 * s
    d.rounded_rectangle((ax0, ay0, ax1, ay1), int(10 * s), fill=DARK)
    if ausgabe:
        cy_ = (ay0 + ay1) / 2 + 6 * s; L = 48 * s
        d.rounded_rectangle((x + W_ / 2 - L, cy_ - 14 * s, x + W_ / 2 + L * 0.5, cy_ + 14 * s), int(6 * s), fill=RED)
        d.rectangle((x + W_ / 2 + L * 0.5, cy_ - 6 * s, x + W_ / 2 + L * 0.95, cy_ + 6 * s), fill=RED)
        d.rectangle((x + W_ / 2 - L * 0.4, cy_ - 14 * s, x + W_ / 2 - L * 0.05, cy_ + 14 * s), fill=WHITE)
    return x1, y1


def aussage_karte(d, x, y, w, h, name, text, col=BLUE, fill=None, size=34, name_size=None):
    """Karte fuer eine Aussage: links eine farbige Marke mit dem Namen (A, B, NICHT A), rechts der Satz.
    Beispiel: aussage_karte(d, 60, 140 + dy, 560, 96, "A", "„Das Geld reicht“", BLUE)"""
    imbild(y, y + h, "Aussage-Karte")
    card(d, x, y, w, h, stripe=False, fill=fill or WHITE)
    fn = F(name_size or min(40, int(h * 0.42)), 700); mh = h - 28
    mw = max(mh, fn.getlength(name) + 36)
    d.rounded_rectangle((x + 16, y + 14, x + 16 + mw, y + 14 + mh), mh // 2, fill=col)
    TB(d, x + 16 + mw / 2, y + h / 2, name, fn, WHITE, mw - 12, "mm", "Aussage-Name")
    TB(d, x + 16 + mw + 24, y + h / 2, text, F(size, 600), DARK, w - mw - 60, "lm", "Aussage")


def werkzeugkarte(d, x, y, w, h, nr, titel, code=None, untertitel=None, col=RED, code_size=26):
    """Karte aus dem Werkzeugkasten (wie die Kacheln in v01-python): roter Streifen oben, Nummer, Titel, darunter optional
    eine Zeile Code im dunklen Kasten und/oder ein Untertitel. Fuer 'blass dahinter': mit f.el(0.35 * show(...), ...) zeichnen.
    Beispiel: werkzeugkarte(d, 60, 140 + dy, 360, 220, 1, "elif", "elif sekunde < 35:", "mehr als zwei Wege")"""
    imbild(y, y + h, "Werkzeugkarte")
    card(d, x, y, w, h, stripe=False)
    d.rounded_rectangle((x, y, x + w, y + 10), 5, fill=col)
    num_circle(d, x + 44, y + 58, 22, nr, col)
    TB(d, x + 80, y + 58, titel, F(36, 700), DARK, w - 100, "lm", "Kartentitel")
    yy = y + 100
    if code:
        d.rounded_rectangle((x + 20, yy, x + w - 20, yy + 60), 10, fill=BOX)
        TB(d, x + w / 2, yy + 30, code, M(code_size), CODE_T, w - 64, "mm", "Kartencode"); yy += 76
    if untertitel:
        TB(d, x + 24, yy + 4, untertitel, F(26, 600), GREY, w - 48, "la", "Karten-Untertitel")


def wertereihe(d, x, y, w, werte, h=120, size=48, gap=24):
    """Mehrere Probewerte nebeneinander (zum Beispiel darunter / auf der Grenze / darueber), je eine Karte mit dem Wert
    gross und der Beschriftung darunter. werte: [(wert, beschriftung, farbe)].
    Beispiel: wertereihe(d, 60, 470 + dy, 1160, [("1,00 €", "darunter", GREY), ("1,50 €", "auf der Grenze", RED), ("2,00 €", "darüber", GREY)])"""
    imbild(y, y + h, "Wertereihe")
    n = len(werte); cw = (w - gap * (n - 1)) / n
    for k, (wert, txt, col) in enumerate(werte):
        cx = x + k * (cw + gap)
        d.rounded_rectangle((cx, y, cx + cw, y + h), 14, fill=WHITE, outline=col if col != GREY else LINE, width=3 if col != GREY else 2)
        TB(d, cx + cw / 2, y + h * 0.40, wert, F(size, 700), col if col != GREY else DARK, cw - 24, "mm", "Wert")
        TB(d, cx + cw / 2, y + h * 0.80, txt, F(26, 600), col, cw - 24, "mm", "Wert-Beschriftung")
