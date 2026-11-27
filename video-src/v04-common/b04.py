"""Baustein fuer Programmablaufplaene mit Schleife (Ruecksprung) fuer die Videos zu Termin 04 und 05.

Baut auf v02-common/b02.py auf (alles von dort ist mit importiert: weg_vis, weg_hl, Symbole aus v05-common/pap.py, kopf, E ...)
und ergaenzt, passend zur Lern-App (site/assets/js/pap-engine.js, Knoten 'while' und 'for'):
  schleife_plan   Plan mit kopfgesteuerter Schleife: Raute, ja nach unten durch den Rumpf, Pfeil seitlich links hoch
                  zurueck in die Linie ueber der Raute, nein rechts hinaus und unten weiter
  schleife_draw   zeichnet den Plan (Beschriftung ja/nein, hervorgehobene Kanten oben, optional Marker)
  schleife_weg    Schluessel (Symbole und Kanten) eines Laufs mit n Durchgaengen, in Laufreihenfolge
  schleife_marke  Punkt auf dem Lauf (Anteil 0..1), fuer den wandernden Marker
Details und Beispiele: LIESMICH.md."""
import os, sys, math
HERE_B04 = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE_B04, "..", "v02-common"))
from b02 import *
from pap import along

LABC_B04 = (80, 88, 100)


def schleife_plan(items, fs=20, gap=22, ret=30, spalt=22):
    """Senkrechter Plan mit Schleifen (kopfgesteuert) wie in der Lern-App. Alles auf einer Mittellinie.
    items: Liste aus (schluessel, art, text[, opts]) mit art term, io, proc und Schleifen als
           (schluessel, "loop", text, rumpf_items[, opts]); text der Raute mit Fragezeichen ('preis != 0?', 'i von 1 bis n?').
           Eine Schleife darf nicht das letzte Symbol einer Folge sein (der nein-Weg braucht ein Ziel), und der Rumpf muss
           mit einem normalen Symbol enden. Schleifen duerfen verschachtelt sein.
    Schluessel der Kanten: 'a-b' zwischen zwei Symbolen; 'w-ja' von der Raute w in den Rumpf (beschriftet);
    'w-zurueck' vom letzten Rumpfsymbol seitlich hoch zurueck vor die Raute (der Ruecksprung); 'w-nein' von der Raute rechts
    hinaus und weiter zum Symbol nach der Schleife (beschriftet). 'x-w' ist die Kante in die Raute hinein.
    Zusaetzlich: D.reihenfolge (alle Schluessel in Aufbau-Reihenfolge, fuer reveal), D.spec, D.into (Kante in ein Symbol).
    Beispiel:
        P = schleife_plan([("s", "term", "Start"), ("e", "io", "Eingabe: preis"), ("i", "proc", "summe = 0"),
                           ("w", "loop", "preis != 0?", [("a", "proc", "summe = summe + preis"), ("e2", "io", "Eingabe: preis")]),
                           ("o", "io", 'Ausgabe: "Summe: ... Euro"'), ("end", "term", "Ende")])"""
    D = Dia(fs); D.spec = items; D.reihenfolge = []; D.into = {}; D.loops = {}

    def opts(it):
        if it[1] == "loop": return it[4] if len(it) > 4 else {}
        return it[3] if len(it) > 3 else {}

    def mk(seq):
        assert seq, "schleife_plan: leere Folge"
        for it in seq:
            D.node(it[0], "dec" if it[1] == "loop" else it[1], it[2], 0, 0, **opts(it))
            if it[1] == "loop": mk(it[3])
        assert seq[-1][1] != "loop", "schleife_plan: eine Schleife darf nicht das letzte Symbol einer Folge sein"
    mk(items)

    M = {}     # Breite links/rechts je Schleife
    def measure(seq):
        L = R = 0.0
        for it in seq:
            hw = D.nodes[it[0]].w / 2
            if it[1] == "loop":
                bl, br = measure(it[3])
                l = max(bl, hw) + ret; r = max(hw + 46, br + spalt); M[it[0]] = (l, r); L = max(L, l); R = max(R, r)
            else:
                L = max(L, hw); R = max(R, hw)
        return L, R
    measure(items)

    def place(seq, x, prev, y0):
        """prev: None | ('n', key) | ('ja', w) | ('nein', w, rx, retY). Gibt (prev, unterkante) zurueck."""
        bottom = y0
        for it in seq:
            k = it[0]; n = D.nodes[k]
            if prev is None: top = y0
            elif prev[0] in ("n", "ja"): p = D.nodes[prev[1]]; top = p.cy + p.h / 2 + gap
            else: top = prev[3] + gap + 12
            n.cx = x; n.cy = top + n.h / 2
            if prev is not None:
                if prev[0] == "n":
                    ek = f"{prev[1]}-{k}"; D.edge(ek, prev[1], "b", k, "t")
                elif prev[0] == "ja":
                    ek = f"{prev[1]}-ja"; D.edge(ek, prev[1], "b", k, "t", label="ja", lab=(12, 17, "ls"))
                else:
                    _, w, rx, retY = prev; ek = f"{w}-nein"; mY = retY + gap * 0.55
                    D.edge(ek, w, "r", k, "t", via=[(rx, D.nodes[w].cy), (rx, mY), (x, mY)], label="nein", lab="r")
                D.reihenfolge.append(ek); D.into[k] = ek
            D.reihenfolge.append(k)
            if it[1] == "loop":
                l, r = M[k]
                body_prev, _ = place(it[3], x, ("ja", k), n.cy)
                last = body_prev[1]; retY = D.nodes[last].cy + D.nodes[last].h / 2 + gap * 0.55
                ey = top - 12; xl = x - l
                D.edge(f"{k}-zurueck", last, "b", (x, ey), None, via=[(x, retY), (xl, retY), (xl, ey)])
                D.reihenfolge.append(f"{k}-zurueck"); D.loops[k] = (it[3][0][0], last, f"{k}-zurueck")
                prev = ("nein", k, x + r, retY); bottom = retY
            else:
                prev = ("n", k); bottom = n.cy + n.h / 2
        return prev, bottom
    place(items, 0.0, None, 0.0)
    assert set(D.reihenfolge) == set(D.nodes) | set(D.edges), "schleife_plan: Schluessel doppelt vergeben"
    return D


def schleife_draw(f, a, D, box, vis=None, hl=None, maxzoom=1.4, bg=BG, label_col=None, marker=None):
    """Zeichnet den Plan mittig in box=(x, y, w, h) (uebermalt die Flaeche: zuerst zeichnen), gibt (zoom, cam) zurueck.
    a: Ueberblendung; vis(key) -> 0..1 je Symbol/Kante (reveal, weg_vis); hl: key -> Farbe (weg_hl, {"w-zurueck": RED});
    hervorgehobene Kanten liegen oben, ja/nein groesser und in der Farbe der Kante; marker: Punkt im Planraum (schleife_marke).
    Bricht ab, wenn die Schrift unter 17 px faellt.
    Beispiel: z, cam = schleife_draw(f, 1.0, P, (60, 104, 560, 540), hl={"w-zurueck": RED}, marker=schleife_marke(P, W, 0.4))"""
    hl = hl or {}; vis = vis or (lambda k: 1.0)
    D.edges = dict(sorted(D.edges.items(), key=lambda kv: kv[0] in hl))
    z, cam = plan_fit(D, box, maxzoom)
    pap_view(f, a, D, box, cam, vis=vis, hl=hl, zoom=z, bg=bg, labels=False, marker=marker)
    fl = F(max(17, int(D.fs * z)), 700)
    for k, e in D.edges.items():
        if not e.label: continue
        X0, Y0 = e.pts[0]; col = hl.get(k, label_col or LABC_B04)
        if isinstance(e.lab, tuple): dx, dy, an = e.lab
        elif e.lab == "l": dx, dy, an = -8, -6, "rs"
        else: dx, dy, an = 8, -6, "ls"
        X, Y = plan_xy(box, z, cam, X0 + dx, Y0 + dy)
        f.el(clamp(a) * vis(k), lambda d, dy_, X=X, Y=Y, col=col, an=an, txt=e.label: T2(d, X, Y, txt, fl, col, an))
    return z, cam


def schleife_weg(D, durchgaenge):
    """Schluessel (Symbole und Kanten) des Laufs, in Laufreihenfolge; Raute und Rumpf erscheinen je Durchgang erneut.
    durchgaenge: {schleife: n}; n = 0 heisst: der Rumpf wird nie betreten (nein gleich beim ersten Mal).
    Beispiel: schleife_weg(P, {"w": 3}) -> ["s", "s-e", "e", ..., "w", "w-ja", "a", "a-e2", "e2", "w-zurueck", "w", ..., "w-nein", "o", ...]"""
    out = []
    def walk(seq):
        for it in seq:
            k = it[0]
            if k in D.into: out.append(D.into[k])
            out.append(k)
            if it[1] == "loop":
                for _ in range(durchgaenge[k]):
                    walk(it[3]); out.append(f"{k}-zurueck"); out.append(k)
    walk(D.spec)
    assert all(k in D.nodes or k in D.edges for k in out), out
    return out


def schleife_route(D, keys):
    """Polylinie des Laufs (Kanten aus keys, Symbole werden mittig durchquert, dadurch laeuft der Marker nie schraeg)."""
    pts = []
    def add(p):
        if not pts or math.dist(pts[-1], p) > 0.01: pts.append(p)
    for k in keys:
        if k in D.edges:
            for p in D.edges[k].pts: add(p)
        else:
            n = D.nodes[k]; add((n.cx, n.cy))
    return pts


def schleife_marke(D, keys, p):
    """Punkt im Planraum bei Anteil p (0..1) der Wegstrecke: schleife_draw(..., marker=schleife_marke(P, W, p)).
    Beispiel: marker=schleife_marke(P, W, ap(t, t0, 4.0))"""
    return along(schleife_route(D, keys), p)
