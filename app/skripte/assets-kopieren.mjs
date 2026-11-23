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
  fs.copyFileSync(path.join(APP, 'staticwebapp.config.json'), path.join(DIST, 'staticwebapp.config.json'));
  console.log(`assets-kopieren: ${n} Dateien${ohneVideo ? `, ${ausgelassen} Videos ausgelassen (VIDEO_BASIS)` : ''}`);
}
