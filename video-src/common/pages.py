"""Konsolen-Szene: links Code (Zeile fuer Zeile getippt) + darunter Konsole, rechts Kacheln. Seiten wechseln nacheinander."""
from core import *

def O(text, col=CODE_T): return [(text, col)]

def page_scene(f, t, ct, pages, code_size=24, con_size=22, left_w=760, tile_x=850, tile_w=370, tile_h=104, y0=130):
    tt = lambda v: ct(v[0]) + v[1] if isinstance(v, tuple) else v
    for pi, pg in enumerate(pages):
        t0 = tt(pg["t0"]); t1 = tt(pages[pi + 1]["t0"]) if pi + 1 < len(pages) else 1e9
        a = ap(t, t0, 0.3) * (1 - ap(t, t1 - 0.1, 0.25))
        if a <= 0: continue
        lines = [l for _, l in pg["code"]]; times = [tt(x) for x, _ in pg["code"]]
        lh = int(code_size * 1.45); clh = int(con_size * 1.45)
        def fn(d, dy, lines=lines, times=times, pg=pg):
            h = code_panel(d, 60, y0 + dy, left_w, lines, times, t, code_size, hl=pg.get("hl"), lineno=pg.get("lineno", True), title="Python")
            ents = [(tt(x), s) for x, s in pg["out"]]
            ch = 46 + clh * len(ents) + 18
            console_panel(d, 60, y0 + dy + h + 16, left_w, ch, ents, t, con_size)
        f.el(a, fn, dy=int((1 - ap(t, t0, 0.3)) * 10))
        for ti, (x, big, small, col) in enumerate(pg.get("tiles", [])):
            ta = ap(t, tt(x), 0.45) * a
            def tile(d, dy, ti=ti, big=big, small=small, col=col):
                y = y0 + ti * (tile_h + 12) + dy
                card(d, tile_x, y, tile_w, tile_h)
                T(d, tile_x + 30, y + 14, big, F(40, 700), col)
                sz = 25
                while F(sz, 400).getlength(small) > tile_w - 50 and sz > 17: sz -= 1
                T(d, tile_x + 30, y + 62, small, F(sz, 400), GREY)
            f.el(ta, tile, dy=int((1 - ap(t, tt(x), 0.45)) * 12))
