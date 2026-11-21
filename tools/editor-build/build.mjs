import { build } from 'esbuild';
import { statSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../../site/assets/vendor/codemirror.bundle.js');

await build({
  entryPoints: [path.join(here, 'entry.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  target: ['es2019'],
  legalComments: 'none',
  outfile: out,
  banner: { js: '/* CodeMirror 6 (state 6.4.1, view 6.26.3, language 6.10.2, autocomplete 6.16.3, commands 6.5.0, search 6.5.6, lang-python 6.1.6) – MIT, gebaut mit tools/editor-build */' },
});

const bundle = readFileSync(out, 'utf8');
const n = (bundle.match(/class \w+\{[^}]*constructor\(\w+,\w+,\w+,\w+\)\{/g) || []).length;
console.log('OK', out, (statSync(out).size / 1024).toFixed(1) + ' KB');
