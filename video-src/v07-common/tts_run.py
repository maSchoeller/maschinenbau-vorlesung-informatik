"""Vertont die V07-Texte strikt nacheinander (je Absatz ein Aufruf)."""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from h7 import tts_all
for v in sys.argv[1:]:
    sys.path.insert(0, os.path.join(HERE, "..", "v07-" + v))
    import importlib; texte = importlib.import_module("texte"); importlib.reload(texte)
    print("==", v, flush=True); tts_all(os.path.join(HERE, "..", "v07-" + v), texte.SRC)
    sys.path.pop(0); sys.modules.pop("texte")
