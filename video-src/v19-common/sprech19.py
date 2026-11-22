"""Sprech-Markup fuer V19 (ohne Abhaengigkeiten ausser sprechen): SQL aussprechbar machen, Ausgabe als [[Anzeige|Sprechweise]]."""
import os, re, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "common"))
import sprechen as _SP

ZW = {0: "null", 1: "eins", 2: "zwei", 3: "drei", 4: "vier", 5: "fünf", 6: "sechs", 7: "sieben", 8: "acht", 9: "neun", 12: "zwölf"}

# Lexikon (nur fuer Fliesstext im Markup-freien Teil): SQL-Woerter in Grossbuchstaben und Kennungen der Zelle
LEX = {
    "SQL": "S Q L", "SQLite": "S Q Lite", "DBMS": "D B M S", "CRUD": "Krud",
    "SELECT": "Select", "FROM": "from", "WHERE": "where", "INSERT": "insert", "UPDATE": "update", "DELETE": "delete", "CREATE TABLE": "create table",
    "ORDER BY": "order bai", "GROUP BY": "gruup bai", "JOIN": "Dschoin", "COUNT": "Kaunt", "SUM": "Sam", "OR": "or",
    "INTEGER": "Integer", "TEXT": "Text", "REAL": "Real", "PRIMARY KEY": "primary key", "ACID": "Äsid", "UNIQUE": "unique",
    "FZ-3": "F Z drei", "D2": "D zwei", "F1": "F eins", "R1": "R eins", "M1": "M eins", "CSV": "C S V", "API": "A P I",
    "WELLE_20H6": "Welle zwanzig H sechs", "FLANSCH_80": "Flansch achtzig", "BUCHSE_30": "Buchse dreißig",
}

_KWS = {"SELECT": "select", "FROM": "from", "WHERE": "where", "ORDER": "order", "BY": "bai", "GROUP": "gruup", "AND": "and", "OR": "or", "NOT": "not",
        "DESC": "desc", "ASC": "asc", "INSERT": "insert", "INTO": "into", "VALUES": "values", "UPDATE": "update", "SET": "set", "DELETE": "delete",
        "CREATE": "create", "TABLE": "table", "PRIMARY": "primary", "KEY": "key", "LIMIT": "limit", "JOIN": "Dschoin", "ON": "on",
        "SUM": "Sam", "COUNT": "Kaunt", "INTEGER": "Integer", "TEXT": "Text", "REAL": "Real"}
_IDS = {"nr": "n r", "auftraege": "Aufträge", "teil": "teil", "maschine": "Maschine", "menge": "Menge", "status": "Status", "maschinen": "Maschinen",
        "id": "i d", "typ": "Typ", "ip": "i p"}
_OPS = {"=": "gleich", "!=": "ungleich", "<>": "ungleich", ">": "größer als", "<": "kleiner als", ">=": "größer gleich", "<=": "kleiner gleich",
        "?": "Fragezeichen", "*": "Stern", "(": "Klammer auf", ")": "Klammer zu", ",": ",", ";": ""}
_TOKS = re.compile(r"'[^']*'?|\d+|[A-Za-zÄÖÜäöüß_]\w*|!=|<>|>=|<=|[=<>?*(),;]|\s+")

def _wert(s):
    """Text- oder Zahlenwert aussprechen (D2 -> D zwei, WELLE_20H6 -> Welle zwanzig H sechs)."""
    s = s.strip("'")
    if s == "": return "leerer Text"
    return _SP.sprechfassung(s).replace("_", " ") if not re.search(r"[A-Za-z]\d|_", s) else _bez(s)

def _bez(s):
    for k in ("WELLE_20H6", "FLANSCH_80", "BUCHSE_30", "D2", "F1", "R1", "M1", "FZ-3"):
        if s == k: return LEX[k]
    return _SP.sprechfassung(s).replace("_", " ")

def sprich(s):
    """SQL-Text in Sprechweise: SELECT nr FROM auftraege WHERE maschine = ? -> 'select n r from Aufträge where Maschine gleich Fragezeichen'."""
    out = []
    for m in _TOKS.finditer(s):
        t = m.group(0)
        if t.isspace(): continue
        if t[0] == "'": out.append(_wert(t))
        elif t.isdigit(): out.append(_SP.sprechfassung(t))
        elif t.upper() in _KWS and t.upper() == t: out.append(_KWS[t])
        elif t in _IDS: out.append(_IDS[t])
        elif t in _OPS:
            if t == ",":
                if out: out[-1] += ","
            elif _OPS[t]: out.append(_OPS[t])
        else: out.append(t)
    return " ".join(out)

def sql(s):
    """SQL im Fliesstext: Untertitel zeigt den SQL-Text, gesprochen wird er ausgeschrieben."""
    return f"[[{s}|{sprich(s)}]]"

def K(anz, spr):
    """Beliebiges Markup: Anzeige und Sprechweise."""
    return f"[[{anz}|{spr}]]"
