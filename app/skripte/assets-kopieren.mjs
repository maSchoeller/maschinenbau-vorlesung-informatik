/* site/assets/** -> dist/assets/**, site/notebooks/** -> dist/notebooks/**, staticwebapp.config.json -> dist/.
   Mit gesetzter Umgebungsvariable VIDEO_BASIS werden *.mp4 ausgelassen (Videos kommen dann aus dem Storage). */
import fs from 'node:fs';
import path from 'node:path';
import { APP, SITE, DIST } from '../src/lib/pfade.mjs';

export default function assetsKopieren() {
  const ohneVideo = !!process.env.VIDEO_BASIS;
  let n = 0, ausgelassen = 0;
  const filter = (quelle) => {
    if (ohneVideo && quelle.toLowerCase().endsWith('.mp4')) { ausgelassen++; return false; }
    if (fs.statSync(quelle).isFile()) n++;
    return true;
  };
  for (const ordner of ['assets', 'notebooks']) {
    const von = path.join(SITE, ordner), nach = path.join(DIST, ordner);
    fs.rmSync(nach, { recursive: true, force: true });
    fs.cpSync(von, nach, { recursive: true, filter });
  }
  fs.writeFileSync(path.join(DIST, 'staticwebapp.config.json'), configMitCsp(fs.readFileSync(path.join(APP, 'staticwebapp.config.json'), 'utf8'), process.env.VIDEO_BASIS));
  console.log(`assets-kopieren: ${n} Dateien${ohneVideo ? `, ${ausgelassen} Videos ausgelassen (VIDEO_BASIS)` : ''}`);
}

/* CSP: In der Quelle steht der Platzhalter https://*.blob.core.windows.net. Erlaubt wird nur das eine
   Storage-Konto aus VIDEO_BASIS (sonst könnte Code im Browser Daten zu jedem beliebigen Storage-Konto
   schicken); ohne VIDEO_BASIS entfällt der Eintrag ganz. */
export const CSP_PLATZHALTER = 'https://*.blob.core.windows.net';
export function configMitCsp(text, videoBasis) {
  let herkunft = '';
  if (videoBasis) {
    const u = new URL(videoBasis);
    if (u.protocol !== 'https:') throw new Error(`VIDEO_BASIS muss https sein: ${videoBasis}`);
    herkunft = u.origin;
  }
  const json = JSON.parse(text);
  const kopf = json.globalHeaders || {};
  const csp = kopf['Content-Security-Policy'];
  if (!csp || !csp.includes(CSP_PLATZHALTER)) throw new Error('staticwebapp.config.json: CSP ohne Storage-Platzhalter');
  kopf['Content-Security-Policy'] = csp.split(' ' + CSP_PLATZHALTER).join(herkunft ? ' ' + herkunft : '');
  return JSON.stringify(json, null, 2) + '\n';
}
