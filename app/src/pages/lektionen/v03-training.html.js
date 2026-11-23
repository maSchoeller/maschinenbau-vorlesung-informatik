/* v03-training.html ist im Bestand nur eine Weiterleitung und wird unverändert übernommen. */
import fs from 'node:fs';
import path from 'node:path';
import { SITE } from '../../lib/pfade.mjs';
export function GET() {
  return new Response(fs.readFileSync(path.join(SITE, 'lektionen', 'v03-training.html')), { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
