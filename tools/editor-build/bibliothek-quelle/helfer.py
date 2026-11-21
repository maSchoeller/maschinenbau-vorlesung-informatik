"""Hilfsfunktion fuer die Eintraege der Befehls-Bibliothek."""
from textwrap import dedent

EINTRAEGE = []


def c(code):
    return dedent(code).strip("\n")


def E(id, name, kat, v, ampel, kurz, syntax, erkl, bsp, wann, transfer, fehler, verw,
      bez=None, lauff=True, stdin=None, aliase=None):
    """transfer: [(situation, code)], fehler: [(beschreibung, code[, meldung[, ausfuehren]])]."""
    EINTRAEGE.append(dict(
        id=id, name=name, kategorie=kat, eingefuehrt=v, ampel=ampel, kurz=kurz, syntax=syntax,
        erklaerung=erkl, beispiel=c(bsp), wann_nutzen=wann,
        transfer=[dict(situation=s, code=c(k)) for s, k in transfer],
        _fehler=fehler, verwandt=verw, bezeichner=bez or [name],
        lauffaehig=lauff, _stdin=stdin, suchbegriffe=aliase or []))


def S(id, name, kat, v, ampel, kurz, syntax, verw=None, bez=None):
    """Stichwort-Eintrag (ab V10)."""
    EINTRAEGE.append(dict(id=id, name=name, kategorie=kat, eingefuehrt=v, ampel=ampel, kurz=kurz,
                          syntax=syntax, stichwort=True, verwandt=verw or [], bezeichner=bez or [name]))
