"""Kontaktbogen aus Einzelbildern: python sheet.py out.png a.png b.png ... (2 Spalten)"""
import sys
from PIL import Image
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert("RGB").resize((800, 450)) for f in files]
cols = 2; rows = (len(ims) + 1) // 2
sh = Image.new("RGB", (cols * 800, rows * 450), (255, 255, 255))
for i, im in enumerate(ims): sh.paste(im, ((i % 2) * 800, (i // 2) * 450))
sh.save(out)
