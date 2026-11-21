three.js r160 (npm three@0.160.1), Lizenz MIT (siehe LICENSE).
Dateien:
- three.module.min.js  aus build/three.module.min.js (unverändert)
- OrbitControls.js     aus examples/jsm/controls/OrbitControls.js; einzige Änderung: Import
                       `from 'three'` -> `from './three.module.min.js'`, damit keine Import-Map nötig ist.
Bezug: npm pack three@0.160.1. Wird nur lokal geladen (kein CDN), erst beim ersten Aufruf von Vorschau3D.zeige.
