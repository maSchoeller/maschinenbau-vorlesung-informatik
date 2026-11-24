import { defineConfig } from 'astro/config';

/* Statische Ausgabe, URLs wie im Bestand (lektionen/v01-labor.html), HTML unverändert. */
export default defineConfig({
  output: 'static',
  outDir: './' + (process.env.KURS_AUSGABE || 'dist'),   /* siehe src/lib/pfade.mjs */
  publicDir: './public',
  trailingSlash: 'ignore',
  compressHTML: false,
  build: { format: 'file', assets: '_astro', inlineStylesheets: 'never' },
  devToolbar: { enabled: false },
  server: { port: 4301 },
});
