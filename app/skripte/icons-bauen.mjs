/* icons-bauen.mjs – rendert die App-Symbole (SVG-Entwurf -> PNG) nach public/app/icons/ (Rolle PWA).
   Einmalig bei Änderung des Entwurfs: node skripte/icons-bauen.mjs  (Ergebnis wird mit eingecheckt). */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { PUBLIC_APP } from '../src/lib/pfade.mjs';

const ROT = '#E2001A';
/* Zeichen: spitze Klammern mit Schrägstrich (Code). Liegt in der sicheren Zone (80 %) von maskable-Symbolen. */
const ZEICHEN = '<g fill="none" stroke="#fff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"><polyline points="196,172 116,256 196,340"/><polyline points="316,172 396,256 316,340"/><line x1="282" y1="152" x2="230" y2="360"/></g>';
const svg = (hintergrund) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${hintergrund}${ZEICHEN}</svg>`;
const VARIANTEN = {
  /* any: abgerundetes Quadrat, außen transparent */
  'icon.svg': { svg: svg(`<rect width="512" height="512" rx="104" fill="${ROT}"/>`), png: [['icon-192.png', 192], ['icon-512.png', 512]] },
  /* maskable und Apple: vollflächig (das Betriebssystem schneidet zu) */
  'icon-maskable.svg': { svg: svg(`<rect width="512" height="512" fill="${ROT}"/>`), png: [['icon-maskable-512.png', 512], ['apple-touch-icon.png', 180]] },
};
fs.mkdirSync(path.join(PUBLIC_APP, 'icons'), { recursive: true });
const b = await chromium.launch();
try {
  for (const [name, v] of Object.entries(VARIANTEN)) {
    fs.writeFileSync(path.join(PUBLIC_APP, 'icons', name), v.svg + '\n');
    for (const [datei, px] of v.png) {
      const page = await b.newPage({ viewport: { width: px, height: px }, deviceScaleFactor: 1 });
      await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${px}px;height:${px}px}</style>${v.svg}`);
      await page.screenshot({ path: path.join(PUBLIC_APP, 'icons', datei), omitBackground: true });
      await page.close();
      console.log('icons-bauen:', datei);
    }
  }
} finally { await b.close(); }
