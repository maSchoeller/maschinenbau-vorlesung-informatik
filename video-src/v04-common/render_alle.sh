#!/bin/sh
# Rendert und muxt die drei V04-Videos nacheinander nach site/assets/video/
cd "$(dirname "$0")/.."
for n in theorie python beispiel; do
  echo "=== v04-$n"
  (cd "v04-$n" && ../.venv/Scripts/python.exe render.py full) || exit 1
done
echo FERTIG
