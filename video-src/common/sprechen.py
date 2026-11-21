# -*- coding: utf-8 -*-
"""
sprechen.py - Sprechfassung fuer die Vertonung der Erklaervideos (ElevenLabs eleven_v3).

ANLEITUNG (Workflow Sprechertext -> Markup -> sprechfassung -> tts -> Untertitel)
--------------------------------------------------------------------------------
1. Sprechertext EINMAL im Quelltext schreiben, so wie er auf dem Bildschirm stehen soll:
   Ziffern, Einheiten, Code in `Backticks`. Englische Fachbegriffe bleiben englisch geschrieben.
2. Wo die Automatik falsch liegt, Markup setzen: [[Anzeige|Sprechweise]]
   Beispiel: [[0,30000000000000004|null Komma drei, dann viele Nullen und eine Vier]]
   Untertitel zeigen "Anzeige", die Stimme spricht "Sprechweise".
3. sprechfassung(text) macht daraus den Text fuer die TTS (Zahlen ausgeschrieben, Einheiten
   ausgeschrieben, Backticks weg, Operatoren als Woerter). anzeige(text) liefert den Text fuer
   Untertitel/VTT (Markup aufgeloest, Backticks entfernt, Ziffern bleiben).
4. tts(text, "audio/s1.mp3") wendet sprechfassung() an, ruft ElevenLabs auf (Modell eleven_v3,
   Stimme Theo Teacher, Schluessel aus ELEVENLABS_API_KEY) und schreibt daneben s1.sprech.txt
   mit dem tatsaechlich gesendeten Text. Max. 3000 Zeichen je Aufruf -> je Absatz ein Aufruf.
5. Untertitel/VTT immer aus anzeige(text) erzeugen, nie aus der Sprechfassung.
6. Vorab ohne Kosten pruefen:  python sprechen.py "Text"      (Sprechfassung + PRUEFEN-Hinweise)
   Alle bisherigen Texte:       python sprechfassungen_erzeugen.py  (schreibt ../SPRECHFASSUNGEN.md)

REGELN DER AUTOMATIK (nur ausserhalb von [[...]])
-------------------------------------------------
* Ganzzahlen -> Zahlwoerter (num2words, de); "-5" und Unicode-Minus "-5" -> "minus fuenf";
  "+5" -> "plus fuenf". Fuehrende Nullen ("007") -> Ziffern einzeln.
* Tausendertrennung: Leerzeichen/Schmalraum ("65 535") ist immer Tausender. Ein Punkt ist nur dann
  Tausender, wenn mindestens ZWEI Dreiergruppen folgen ("1.234.567"). Ein einzelnes "65.535" gilt
  als DEZIMALZAHL (Code-Kontext: 2.718, 3.141) und wird mit PRUEFEN markiert; wer Tausender meint,
  schreibt "65 535" oder [[65.535|...]]. Komma ist immer Dezimalkomma. "3.13.1" -> "drei Punkt dreizehn Punkt eins".
* Dezimalzahlen (Punkt oder Komma): Ganzzahlteil als Zahlwort, "Komma", Nachkommastellen einzeln.
  Bis MAX_NACHKOMMA (4) Stellen exakt. Mehr: Float-Artefakte (>=6 Nullen oder Neunen in Folge)
  werden beschrieben ("null Komma drei, dann fuenfzehn Nullen und eine Vier"), sonst
  "ungefaehr" + gerundet auf 4 signifikante Stellen, mindestens aber 2 Nachkommastellen
  (152.788874 -> "ungefaehr hundertzweiundfuenfzig Komma sieben neun").
* 0b../0x.. -> "null b"/"null x" + Ziffern einzeln; 2**16 -> "zwei hoch sechzehn"; 1e-9 -> "zehn hoch minus neun".
* Einheiten nach Zahlen (mm, N/mm2, MPa, Grad, %, s, kg, U/min, Bit, Byte ...) werden ausgeschrieben
  (Singular/Plural: "ein Millimeter", "eins Komma fuenf Millimeter"). Tabelle: EINHEITEN.
* Jahreszahlen 1100-1999 nach "im Jahr", "seit", "Baujahr", "Stand" -> "neunzehnhundert..."; sonst Kardinalzahl.
* Abkuerzungen (z. B., d. h., u. a., ca., bzw., usw., Nr. ...): ABKUERZUNGEN.
* `Code` in Backticks: Backticks weg, Bezeichner bleiben englisch, snake_case -> Woerter,
  math.isclose -> "math punkt isclose", print() -> "print", f(x) -> "f von x", Operatoren als Woerter.
* LEXIKON: Sonderfaelle (Akronyme, schwierige Namen). Mit lexikon_ergaenzen({...}) erweiterbar.
  Eintraege mit gleichem Wert (z. B. "REAL": "REAL") markieren ein Wort als geprueft.
* pruefen(text) liefert Hinweise, wo die Automatik vermutlich schlecht klingt.
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

from num2words import num2words

# --------------------------------------------------------------------------- Konfiguration
VOICE_ID = "TIKjTeWOFujJEvXK1qIU"  # Theo Teacher
MODEL_ID = "eleven_v3"
API_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128"
MAX_ZEICHEN = 3000
MAX_NACHKOMMA = 4
SIGNIFIKANT = 4
MIN_NACHKOMMA = 2
ARTEFAKT_LAUF = 6

LEXIKON: dict[str, str] = {
    "IEEE 754": "I triple E sieben fünf vier",
    "IEEE": "I triple E",
    "SPS": "S P S",
    "CSV": "C S V",
    "DHBW": "D H B W",
    "KI": "K I",
    "CPU": "C P U",
    "GUI": "G U I",
    "API": "A P I",
    "HTML": "H T M L",
    "PDF": "P D F",
    "USB": "U S B",
    "SI": "S I",
    "UTF-8": "U T F acht",
    "ASCII": "Asky",
    "NaN": "Nan",
    "Pyodide": "Pai-oh-daid",  # per Hoerprobe pruefen
    "Jupyter": "Dschupiter",  # per Hoerprobe pruefen
    "REAL": "REAL",  # geprueft: Wort bleibt
    "DIN": "DIN",
    "ISO": "ISO",
}


def lexikon_ergaenzen(eintraege: dict[str, str]) -> None:
    """Erweitert das Lexikon, z. B. lexikon_ergaenzen({"Numpy": "Nampei"})."""
    LEXIKON.update(eintraege)


ABKUERZUNGEN: list[tuple[str, str]] = [
    (r"z\.\s?B\.", "zum Beispiel"),
    (r"d\.\s?h\.", "das heißt"),
    (r"u\.\s?a\.", "unter anderem"),
    (r"u\.\s?U\.", "unter Umständen"),
    (r"z\.\s?T\.", "zum Teil"),
    (r"s\.\s?o\.", "siehe oben"),
    (r"s\.\s?u\.", "siehe unten"),
    (r"ca\.", "circa"),
    (r"bzw\.", "beziehungsweise"),
    (r"bspw\.", "beispielsweise"),
    (r"usw\.", "und so weiter"),
    (r"etc\.", "et cetera"),
    (r"ggf\.", "gegebenenfalls"),
    (r"evtl\.", "eventuell"),
    (r"vgl\.", "vergleiche"),
    (r"inkl\.", "inklusive"),
    (r"Nr\.", "Nummer"),
]

# Einheit -> (Singular, Plural, weiblich)
EINHEITEN: dict[str, tuple[str, str, bool]] = {
    "mm": ("Millimeter", "Millimeter", False),
    "cm": ("Zentimeter", "Zentimeter", False),
    "dm": ("Dezimeter", "Dezimeter", False),
    "m": ("Meter", "Meter", False),
    "km": ("Kilometer", "Kilometer", False),
    "µm": ("Mikrometer", "Mikrometer", False),
    "mm²": ("Quadratmillimeter", "Quadratmillimeter", False),
    "mm2": ("Quadratmillimeter", "Quadratmillimeter", False),
    "cm²": ("Quadratzentimeter", "Quadratzentimeter", False),
    "m²": ("Quadratmeter", "Quadratmeter", False),
    "mm³": ("Kubikmillimeter", "Kubikmillimeter", False),
    "cm³": ("Kubikzentimeter", "Kubikzentimeter", False),
    "m³": ("Kubikmeter", "Kubikmeter", False),
    "N": ("Newton", "Newton", False),
    "kN": ("Kilonewton", "Kilonewton", False),
    "Nm": ("Newtonmeter", "Newtonmeter", False),
    "N/mm²": ("Newton pro Quadratmillimeter", "Newton pro Quadratmillimeter", False),
    "N/mm2": ("Newton pro Quadratmillimeter", "Newton pro Quadratmillimeter", False),
    "Pa": ("Pascal", "Pascal", False),
    "kPa": ("Kilopascal", "Kilopascal", False),
    "MPa": ("Megapascal", "Megapascal", False),
    "GPa": ("Gigapascal", "Gigapascal", False),
    "bar": ("Bar", "Bar", False),
    "°C": ("Grad Celsius", "Grad Celsius", False),
    "°": ("Grad", "Grad", False),
    "Grad": ("Grad", "Grad", False),
    "%": ("Prozent", "Prozent", False),
    "s": ("Sekunde", "Sekunden", True),
    "ms": ("Millisekunde", "Millisekunden", True),
    "µs": ("Mikrosekunde", "Mikrosekunden", True),
    "ns": ("Nanosekunde", "Nanosekunden", True),
    "min": ("Minute", "Minuten", True),
    "h": ("Stunde", "Stunden", True),
    "m/s": ("Meter pro Sekunde", "Meter pro Sekunde", False),
    "km/h": ("Kilometer pro Stunde", "Kilometer pro Stunde", False),
    "U/min": ("Umdrehung pro Minute", "Umdrehungen pro Minute", True),
    "kg": ("Kilogramm", "Kilogramm", False),
    "g": ("Gramm", "Gramm", False),
    "t": ("Tonne", "Tonnen", True),
    "l": ("Liter", "Liter", False),
    "ml": ("Milliliter", "Milliliter", False),
    "Hz": ("Hertz", "Hertz", False),
    "kHz": ("Kilohertz", "Kilohertz", False),
    "MHz": ("Megahertz", "Megahertz", False),
    "GHz": ("Gigahertz", "Gigahertz", False),
    "V": ("Volt", "Volt", False),
    "A": ("Ampere", "Ampere", False),
    "mA": ("Milliampere", "Milliampere", False),
    "W": ("Watt", "Watt", False),
    "kW": ("Kilowatt", "Kilowatt", False),
    "kWh": ("Kilowattstunde", "Kilowattstunden", True),
    "J": ("Joule", "Joule", False),
    "kJ": ("Kilojoule", "Kilojoule", False),
    "Bit": ("Bit", "Bit", False),
    "bit": ("Bit", "Bit", False),
    "Byte": ("Byte", "Bytes", False),
    "byte": ("Byte", "Bytes", False),
    "Bytes": ("Byte", "Bytes", False),
    "kByte": ("Kilobyte", "Kilobytes", False),
    "MByte": ("Megabyte", "Megabytes", False),
    "kB": ("Kilobyte", "Kilobytes", False),
    "MB": ("Megabyte", "Megabytes", False),
}

SYMBOLE = {
    "±": " plus minus ",
    "≈": " ungefähr ",
    "≠": " ungleich ",
    "≤": " kleiner gleich ",
    "≥": " größer gleich ",
    "→": " ergibt ",
    "π": "Pi",
    "Δ": "Delta",
    "µ": "Mikro",
    "…": "",
    "&": " und ",
}

_ZIFFERN = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"]
_ZIFFER_NOMEN = ["Null", "Eins", "Zwei", "Drei", "Vier", "Fünf", "Sechs", "Sieben", "Acht", "Neun"]
_SUP = str.maketrans("⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺", "0123456789-+")
_SUPCH = "⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ⁻⁺"
_SP = "   "


# --------------------------------------------------------------------------- Hinweise
class _Ctx:
    def __init__(self) -> None:
        self.hinweise: list[str] = []

    def hinweis(self, text: str) -> None:
        if text not in self.hinweise:
            self.hinweise.append(text)


# --------------------------------------------------------------------------- Zahlwoerter
def _ganzzahl(n: int) -> str:
    if abs(n) >= 10**18:
        return " ".join(_ZIFFERN[int(c)] for c in str(abs(n)))
    w = num2words(abs(n), lang="de")
    w = re.sub(r"^einhundert", "hundert", w)
    w = re.sub(r"^eintausend", "tausend", w)
    return w


def _ziffern(s: str) -> str:
    return " ".join(_ZIFFERN[int(c)] for c in s if c.isdigit())


def _int_text(s: str) -> str:
    """Ziffernfolge -> Zahlwort; fuehrende Nullen ('007') -> Ziffern einzeln."""
    if len(s) > 1 and s.startswith("0"):
        return _ziffern(s)
    return _ganzzahl(int(s))


def _nachkomma(intpart: str, frac: str, ctx: _Ctx, dez: str) -> str:
    """Ganze Dezimalzahl als Wortfolge (ohne Vorzeichen)."""
    iw = _int_text(intpart)
    if len(frac) <= MAX_NACHKOMMA:
        return f"{iw} {dez} {_ziffern(frac)}"
    m = re.fullmatch(r"(\d*?)(0{%d,}|9{%d,})(\d{0,3})" % (ARTEFAKT_LAUF, ARTEFAKT_LAUF), frac)
    if m and len(m.group(1)) <= 6:
        pre, lauf, tail = m.groups()
        n = len(lauf)
        ziff = lauf[0]
        name = "Nullen" if ziff == "0" else "Neunen"
        if not pre and not tail and ziff == "9":
            return f"{iw} {dez} neun, {_ganzzahl(n)}mal die Neun"
        kopf = f"{iw} {dez} {_ziffern(pre)}" if pre else f"{iw} {dez}"
        if tail:
            if len(tail) == 1:
                rest = f"und eine {_ZIFFER_NOMEN[int(tail)]}"
            else:
                rest = f"und hinten die Ziffern {_ziffern(tail)}"
            return f"{kopf}, dann {_ganzzahl(n)} {name} {rest}"
        if ziff == "9":
            return f"{kopf}, dann {_ganzzahl(n)}mal die Neun"
        return f"{kopf}, dann {_ganzzahl(n)} {name}"
    # ungefaehr: 4 signifikante Stellen, mindestens 2 Nachkommastellen
    d = Decimal(f"{intpart}.{frac}")
    if int(intpart) >= 1:
        stellen = max(MIN_NACHKOMMA, SIGNIFIKANT - len(str(int(intpart))))
    else:
        stellen = max(MIN_NACHKOMMA, len(frac) - len(frac.lstrip("0")) + SIGNIFIKANT)
    r = d.quantize(Decimal(1).scaleb(-stellen), rounding=ROUND_HALF_UP)
    ip, _, fp = f"{r:f}".partition(".")
    fp = fp.rstrip("0")
    ctx.hinweis(f"gerundet: {intpart}.{frac[:8]}{'…' if len(frac) > 8 else ''}")
    if not fp:
        return f"ungefähr {_int_text(ip)}"
    return f"ungefähr {_int_text(ip)} {dez} {_ziffern(fp)}"


def _zahl_wort(body: str, ctx: _Ctx, dez: str = "Komma") -> tuple[str, bool]:
    """Zahlentext (ohne Vorzeichen/Einheit) -> (Wort, ist_ganzzahl)."""
    s = re.sub(r"[   ]", "", body)
    # Versionsnummer oder Tausenderpunkte
    if re.fullmatch(r"\d+(?:\.\d+){2,}", s):
        if re.fullmatch(r"\d{1,3}(?:\.\d{3}){2,}", s):
            return _int_text(s.replace(".", "")), True
        ctx.hinweis(f"Versionsnummer/Mehrfachpunkt: {s}")
        return " Punkt ".join(_int_text(p) for p in s.split(".")), False
    if re.fullmatch(r"\d+[.,]\d+", s):
        ip, fp = re.split(r"[.,]", s)
        if "." in s and re.fullmatch(r"[1-9]\d{0,2}\.\d{3}", s):
            ctx.hinweis(f"mehrdeutig (Tausender oder Dezimal?): {s}")
        return _nachkomma(ip, fp, ctx, dez), False
    if re.fullmatch(r"\d+", s):
        return _int_text(s), True
    return s, False


# --------------------------------------------------------------------------- Zahlen im Text
_UNIT_RE = "|".join(re.escape(u) for u in sorted(EINHEITEN, key=len, reverse=True))
_SIGN = r"(?P<sg>(?:[−]|(?<![\w)\].,])[-+])(?=\d))?"
_NUM = re.compile(
    r"(?P<bin>(?<![\w.])0[bB][01][01_]*(?!\w))"
    r"|(?P<hex>(?<![\w.])0[xX][0-9a-fA-F][0-9a-fA-F_]*(?!\w))"
    r"|" + _SIGN + r"(?<![\w.,])(?:"
    r"(?P<sci>\d+(?:[.,]\d+)?[eE][+−-]?\d+)(?![\w.])"
    r"|(?P<zahl>\d+(?:\.\d+){2,}|\d{1,3}(?:[   ]\d{3})+(?![\d])(?:[.,]\d+)?|\d+[.,]\d+|\d+)"
    r"(?P<unit>[   ]?(?:" + _UNIT_RE + r")(?!\w))?)"
)
_JAHR_DAVOR = re.compile(r"(?:im Jahre?|Jahre?|seit|Baujahr|Stand)\s$")


def _sci_wort(txt: str, ctx: _Ctx, dez: str) -> str:
    m = re.fullmatch(r"(\d+(?:[.,]\d+)?)[eE]([+−-]?)(\d+)", txt)
    mant, vz, ex = m.groups()
    ew = ("minus " if vz in ("-", "−") else "") + _int_text(ex)
    if re.fullmatch(r"1(?:[.,]0+)?", mant):
        return f"zehn hoch {ew}"
    return f"{_zahl_wort(mant, ctx, dez)[0]} mal zehn hoch {ew}"


def _wortzeichen(c: str) -> bool:
    return c.isalnum() and c not in _SUPCH


def _zahlen(s: str, ctx: _Ctx, dez: str = "Komma") -> str:
    def cb(m: re.Match) -> str:
        if m.group("bin"):
            t = m.group("bin")[2:].replace("_", "")
            out = "null b " + _ziffern(t)
        elif m.group("hex"):
            t = m.group("hex")[2:].replace("_", "")
            out = "null x " + " ".join(_ZIFFERN[int(c)] if c.isdigit() else c.upper() for c in t)
        else:
            sg = m.group("sg")
            vz = {"-": "minus ", "−": "minus ", "+": "plus "}.get(sg, "") if sg else ""
            if m.group("sci"):
                out = vz + _sci_wort(m.group("sci"), ctx, dez)
            else:
                body, unit = m.group("zahl"), m.group("unit")
                w, ganz = _zahl_wort(body, ctx, dez)
                if unit:
                    u = unit.strip(_SP)
                    sing, plur, fem = EINHEITEN[u]
                    if ganz and body == "1":
                        w, un = ("eine" if fem else "ein"), sing
                    elif ganz and w.endswith("eins"):
                        w, un = w[:-1] + ("e" if fem else ""), plur
                    else:
                        un = plur
                    out = f"{vz}{w} {un}"
                else:
                    if ganz and re.fullmatch(r"\d{4}", body) and 1100 <= int(body) <= 1999:
                        if _JAHR_DAVOR.search(m.string[max(0, m.start() - 14) : m.start()]):
                            w = num2words(int(body), lang="de", to="year")
                    out = vz + w
        pre = " " if m.start() > 0 and _wortzeichen(m.string[m.start() - 1]) else ""
        post = " " if m.end() < len(m.string) and _wortzeichen(m.string[m.end()]) else ""
        return pre + out + post

    return _NUM.sub(cb, s)


# --------------------------------------------------------------------------- Operatoren im Fliesstext
_L = r"(?:(?<=\d)|(?<=\b[A-Za-z])|(?<=\))|(?<=[ⁿ²³]))"
_R = r"(?=[−-]?(?:\d|[A-Za-z]\b|\())"
_OPS_REGELN: list[tuple[re.Pattern, str]] = [
    (re.compile(r"(?<=[\w)\]²³ⁿ])\s*\*\*\s*(?=[\w(−-])"), " hoch "),
    (re.compile(r"\s==\s"), " gleich gleich "),
    (re.compile(r"\s!=\s"), " ungleich "),
    (re.compile(r"\s<=\s"), " kleiner gleich "),
    (re.compile(r"\s>=\s"), " größer gleich "),
    (re.compile(r"\s//\s"), " Doppel-Slash "),
    (re.compile(r"\s=\s"), " gleich "),
    (re.compile(r"\s\+\s"), " plus "),
    (re.compile(r"\s\*\s"), " mal "),
    (re.compile(r"\s−\s"), " minus "),
    (re.compile(_L + r"\s+%\s+" + _R), " modulo "),
    (re.compile(_L + r"\s+/\s+" + _R), " durch "),
    (re.compile(_L + r"\s+-\s+" + _R), " minus "),
    (re.compile(_L + r"\s*[×·]\s*" + _R), " mal "),
    (re.compile(_L + r"\s*÷\s*" + _R), " geteilt durch "),
    (re.compile(r"(?<=\d)/(?=\d)"), " durch "),
    (re.compile(r"(?<=\d)[–-](?=\d)"), " bis "),
    (re.compile(r"–"), " bis "),
]
_SUPER = re.compile(r"(?P<b>[A-Za-zäöüÄÖÜ\d)])(?P<p>[" + _SUPCH + r"]+)")

_REGELN: list[tuple[re.Pattern, object]] = [
    (re.compile(r"\b(float|int|uint|Float|Int|UInt|double)(\d+)\b"), lambda m: f"{m.group(1)} {_ganzzahl(int(m.group(2)))}"),
]


def _plain(s: str, ctx: _Ctx) -> str:
    # Lexikon
    if LEXIKON:
        keys = sorted(LEXIKON, key=len, reverse=True)
        pat = re.compile(r"(?<![\w])(" + "|".join(re.escape(k) for k in keys) + r")(?![\w])")
        s = pat.sub(lambda m: LEXIKON[m.group(1)], s)
    for rx, rep in _REGELN:
        s = rx.sub(rep, s)
    # Abkuerzungen
    for rx, rep in ABKUERZUNGEN:
        if rep in ("und so weiter", "et cetera"):  # kann Satzende sein: Punkt behalten
            s = re.sub(r"(?<![\w.])" + rx + r"(?=\s+[A-ZÄÖÜ]|\s*$)", rep + ".", s)
        s = re.sub(r"(?<![\w.])" + rx, rep, s)
    for k, v in SYMBOLE.items():
        if k in s and k == "→":
            ctx.hinweis("Pfeil → ersetzt durch „ergibt“")
        s = s.replace(k, v)
    for rx, rep in _OPS_REGELN:
        s = rx.sub(rep, s)
    s = _zahlen(s, ctx)

    def sup(m: re.Match) -> str:
        p = m.group("p").translate(_SUP)
        p = p.replace("ⁿ", "n")
        if p.isdigit():
            p = _int_text(p)
        elif p.startswith("-") and p[1:].isdigit():
            p = "minus " + _int_text(p[1:])
        return f"{m.group('b')} hoch {p}"

    s = _SUPER.sub(sup, s)
    return s


# --------------------------------------------------------------------------- Code in Backticks
_TOK = re.compile(
    r"""\s+|"[^"]*"|'[^']*'|\.\.\.|0[bBxX][0-9a-fA-F_]+|\d+(?:[.,]\d+)?(?:[eE][+-]?\d+)?"""
    r"""|[A-Za-zÄÖÜäöüß_][\wÄÖÜäöüß]*|\*\*|//|==|!=|<=|>=|->|[-+*/%<>=()\[\]{},:.;#!@&|^~]"""
)
_OPWORT = {
    "**": "hoch", "//": "Doppel-Slash", "==": "gleich gleich", "!=": "ungleich", "<=": "kleiner gleich",
    ">=": "größer gleich", "->": "Pfeil", "+": "plus", "-": "minus", "*": "mal", "/": "durch", "%": "modulo",
    "<": "kleiner als", ">": "größer als", "=": "gleich", "[": "eckige Klammer auf", "]": "eckige Klammer zu",
    "{": "geschweifte Klammer auf", "}": "geschweifte Klammer zu", ":": "Doppelpunkt", ";": "", "#": "Raute",
    "!": "nicht", "@": "at", "&": "und", "|": "senkrechter Strich", "^": "Dach", "~": "Tilde",
}


def _bezeichner(t: str) -> str:
    t = t.strip("_")
    t = re.sub(r"(?<=[A-Za-zÄÖÜäöüß])(\d+)", lambda m: " " + _ganzzahl(int(m.group(1))), t)
    return t.replace("_", " ")


def _code(s: str, ctx: _Ctx) -> str:
    toks = [t for t in _TOK.findall(s)]
    sig = [t for t in toks if not t.isspace()]
    out: list[str] = []
    stack: list[bool] = []  # True = Aufruf (Klammer wird nicht gesprochen)
    prev = ""
    i = 0
    n = len(sig)
    while i < n:
        t = sig[i]
        nxt = sig[i + 1] if i + 1 < n else ""
        nxt2 = sig[i + 2] if i + 2 < n else ""
        if t == "(":
            ist_name = bool(re.fullmatch(r"[A-Za-zÄÖÜäöüß_][\wÄÖÜäöüß]*", prev)) or prev == ")" or prev == "]"
            if ist_name and (nxt == ")" or (nxt == "..." and nxt2 == ")")):
                i += 3 if nxt == "..." else 2
                prev = ")"
                continue
            if ist_name:
                out.append("von")
                stack.append(True)
            else:
                out.append("Klammer auf")
                stack.append(False)
        elif t == ")":
            kind = stack.pop() if stack else False
            if not kind:
                out.append("Klammer zu")
        elif t == "...":
            pass
        elif t == ".":
            if re.fullmatch(r"[\wÄÖÜäöüß]+", prev or " ") and re.fullmatch(r"[A-Za-zÄÖÜäöüß_]\w*", nxt or " "):
                out.append("punkt")
            elif prev == ")" and nxt:
                out.append("punkt")
            else:
                out.append("Punkt")
        elif t == ",":
            if out:
                out[-1] += ","
        elif t[0] in "\"'":
            inhalt = t[1:-1]
            out.append("Text " + _zahlen(inhalt, ctx, dez="Punkt").strip() if inhalt else "leerer Text")
        elif t[0].isdigit():
            out.append(_zahlen(t, ctx).strip())
        elif re.fullmatch(r"[A-Za-zÄÖÜäöüß_][\wÄÖÜäöüß]*", t):
            out.append(_bezeichner(t))
        elif t in _OPWORT:
            out.append(_OPWORT[t])
        else:
            out.append(t)
        prev = t
        i += 1
    r = " ".join(x for x in out if x)
    return re.sub(r"\s+", " ", r).strip()


# --------------------------------------------------------------------------- Oeffentliche API
_SEG = re.compile(r"\[\[(?P<a>.*?)\|(?P<s>.*?)\]\]|`(?P<c>[^`]*)`", re.S)


def anzeige(text: str) -> str:
    """Text fuer Untertitel: [[Anzeige|Sprechweise]] -> Anzeige, Backticks entfernt."""
    def rep(m: re.Match) -> str:
        return m.group("a") if m.group("a") is not None else m.group("c")
    return _SEG.sub(rep, text)


def _verarbeite(text: str) -> tuple[str, _Ctx]:
    ctx = _Ctx()
    out: list[str] = []
    pos = 0
    for m in _SEG.finditer(text):
        out.append(_plain(text[pos : m.start()], ctx))
        if m.group("s") is not None:
            out.append(m.group("s"))
        else:
            out.append(" " + _code(m.group("c"), ctx) + " ")
        pos = m.end()
    out.append(_plain(text[pos:], ctx))
    r = "".join(out)
    r = re.sub(r"[ \t  ]+", " ", r)
    r = re.sub(r" +([,.;:!?])(?=\s|$)", r"\1", r)
    r = re.sub(r"([.!?]) *\.", r"\1", r)
    r = re.sub(r" *\n *", "\n", r)
    return r.strip(), ctx


def sprechfassung(text: str) -> str:
    """Text fuer die TTS: Zahlen/Einheiten ausgeschrieben, Code gesprochen, [[A|S]] -> S."""
    return _verarbeite(text)[0]


def pruefen(text: str) -> list[str]:
    """Hinweise, wo die automatische Sprechfassung vermutlich schlecht klingt."""
    r, ctx = _verarbeite(text)
    h = list(ctx.hinweise)
    frei = _SEG.sub("", text)  # Text ohne Markup und Code
    for c in re.findall(r"\b[A-Za-z_][\w.]*\([^)]*\)|\b\w+_\w+\b", frei):
        h.append(f"Code ohne Backticks: {c}")
    if re.search(r"\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\.\d{1,2}\.\d{2,4}\b", frei):
        h.append("Datum: wird nicht als Datum gelesen")
    if re.search(r"\beins (?!Komma|Punkt|Million|Milliarde)[A-ZÄÖÜ][a-zäöüß]", r):
        h.append("„1“ vor Nomen: Genus prüfen (eins/ein/eine)")
    if re.search(r"(?<![\w])\d*\.\d+[fdegs]\b", frei):
        h.append("Formatangabe (z. B. .2f): ausschreiben, z. B. [[.2f|Punkt zwei f]]")
    if re.search(r"\b\d{1,2}:\d{2}\b", frei):
        h.append("Uhrzeit/Verhältnis mit Doppelpunkt")
    rest = re.findall(r"\S*[\d_*/\\<>=#^~|{}\[\]²³]\S*", r)
    if rest:
        h.append("Rest-Ziffern/Symbole: " + ", ".join(sorted({x.strip(".,;:!?") for x in rest})[:6]))
    bekannt = {v for v in LEXIKON.values()}
    for w in sorted(set(re.findall(r"\b[A-ZÄÖÜ]{2,}\b", r))):
        if w not in LEXIKON and w not in bekannt and not any(w in v.split() for v in LEXIKON.values()):
            h.append(f"Akronym {w}: Aussprache prüfen oder ins LEXIKON")
    return h


# --------------------------------------------------------------------------- TTS
def tts(text: str, ziel_mp3, *, sprechfassung_anwenden: bool = True, api_key: str | None = None,
        voice_id: str = VOICE_ID, versuche: int = 4) -> Path:
    """Vertont text mit ElevenLabs (eleven_v3). Schreibt ziel_mp3 und daneben <name>.sprech.txt."""
    gesendet = sprechfassung(text) if sprechfassung_anwenden else text
    if len(gesendet) > MAX_ZEICHEN:
        raise ValueError(
            f"Text hat {len(gesendet)} Zeichen, erlaubt sind {MAX_ZEICHEN} je Aufruf. "
            "Bitte in kleinere Absätze aufteilen (je Abschnitt ein tts-Aufruf)."
        )
    key = api_key or os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        raise RuntimeError("Umgebungsvariable ELEVENLABS_API_KEY ist nicht gesetzt.")
    body = json.dumps(
        {"text": gesendet, "model_id": MODEL_ID, "language_code": "de",
         "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}},  # v3: nur 0.0/0.5/1.0 erlaubt
        ensure_ascii=False,
    ).encode("utf-8")
    url = API_URL.format(voice=voice_id)
    daten = None
    for versuch in range(1, versuche + 1):
        rq = urllib.request.Request(
            url, data=body, method="POST",
            headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
        )
        try:
            with urllib.request.urlopen(rq, timeout=180) as resp:
                daten = resp.read()
            break
        except urllib.error.HTTPError as e:
            if (e.code == 429 or e.code >= 500) and versuch < versuche:
                time.sleep(2 ** versuch)
                continue
            detail = ""
            try:
                detail = e.read()[:300].decode("utf-8", "replace")
            except Exception:
                pass
            raise RuntimeError(f"ElevenLabs HTTP {e.code}: {detail}") from e
        except urllib.error.URLError as e:
            if versuch < versuche:
                time.sleep(2 ** versuch)
                continue
            raise RuntimeError(f"ElevenLabs nicht erreichbar: {e.reason}") from e
    ziel = Path(ziel_mp3)
    ziel.parent.mkdir(parents=True, exist_ok=True)
    ziel.write_bytes(daten)
    ziel.with_name(ziel.stem + ".sprech.txt").write_text(gesendet, encoding="utf-8")
    return ziel


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    eingabe = " ".join(sys.argv[1:]) or sys.stdin.read()
    sf, _ = _verarbeite(eingabe)
    print(sf)
    for h in pruefen(eingabe):
        print("PRÜFEN:", h)
