// Build: src/ → www/ (phone app + installable web app) and, with --artifact, dist/claude-artifact.html
// Copyright (c) 2026 the app's author. All rights reserved.
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { minify } from 'terser';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src'), OUT = join(ROOT, 'www'), DIST = join(ROOT, 'dist');
const read = p => readFileSync(join(SRC, p), 'utf8');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

// keep the copyright header, drop everything else; locals are mangled, globals shared between files are not
const TERSER = { compress: { passes: 2 }, mangle: true, format: { comments: /Copyright|All rights reserved/ } };
const min = async code => (await minify(code, TERSER)).code;

// fonts: only the weights the app uses, only the alphabets of its languages (uk, cs, en)
const FONTS = { manrope: [400, 600, 700, 800], unbounded: [500, 700] };
const SUBSETS = ['cyrillic', 'cyrillic-ext', 'latin', 'latin-ext'];
function buildFonts(dir) {
  mkdirSync(join(dir, 'fonts'), { recursive: true });
  let css = '/* Manrope and Unbounded — SIL Open Font License 1.1 (see fonts/OFL.txt) */\n';
  for (const [fam, weights] of Object.entries(FONTS)) {
    const base = join(ROOT, 'node_modules', '@fontsource', fam);
    for (const w of weights) for (const sub of SUBSETS) {
      const f = join(base, `${sub}-${w}.css`); if (!existsSync(f)) continue;
      css += readFileSync(f, 'utf8')
        .replace(/src: url\(\.\/files\/([^)]+\.woff2)\) format\('woff2'\), url\([^)]+\) format\('woff'\);/g, (_, file) => {
          copyFileSync(join(base, 'files', file), join(dir, 'fonts', file));
          return `src: url(./${file}) format('woff2');`;
        });
    }
  }
  writeFileSync(join(dir, 'fonts', 'fonts.css'), css);
  copyFileSync(join(ROOT, 'node_modules', '@fontsource', 'manrope', 'LICENSE'), join(dir, 'fonts', 'OFL.txt'));
}

async function buildApp() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(join(OUT, 'icons'), { recursive: true });
  const config = read('config.js').replace(/version: '[^']*'/, `version: '${pkg.version}'`);
  writeFileSync(join(OUT, 'config.js'), await min(config));
  writeFileSync(join(OUT, 'storage.js'), await min(read('storage.js')));
  writeFileSync(join(OUT, 'app.js'), await min(read('app.js')));
  writeFileSync(join(OUT, 'i18n-extra.js'), await min(read('i18n-extra.js')));   // Russian + Lithuanian texts
  // image-based pets (owner's art + MIT companion module): sprite sheets in pets/, scripts in vendor/
  mkdirSync(join(OUT, 'vendor'), { recursive: true }); mkdirSync(join(OUT, 'pets'), { recursive: true });
  for (const f of readdirSync(join(SRC, 'vendor'))) f.endsWith('.js') ? writeFileSync(join(OUT, 'vendor', f), await min(read('vendor/' + f))) : copyFileSync(join(SRC, 'vendor', f), join(OUT, 'vendor', f));
  for (const f of readdirSync(join(SRC, 'pets'))) copyFileSync(join(SRC, 'pets', f), join(OUT, 'pets', f));
  mkdirSync(join(OUT, 'art'), { recursive: true });   // body / clothes / hair atlases
  for (const f of readdirSync(join(SRC, 'art'))) copyFileSync(join(SRC, 'art', f), join(OUT, 'art', f));
  writeFileSync(join(OUT, 'app.css'), read('app.css').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*/g, '\n'));
  writeFileSync(join(OUT, 'index.html'), read('index.html'));
  writeFileSync(join(OUT, 'manifest.webmanifest'), read('manifest.webmanifest'));
  writeFileSync(join(OUT, 'robots.txt'), read('robots.txt')); // test phase: keep the web version out of search engines
  for (const f of readdirSync(join(SRC, 'icons'))) copyFileSync(join(SRC, 'icons', f), join(OUT, 'icons', f));
  buildFonts(OUT);

  // service worker for the web version: offline after the first visit; the hash renews the cache on every release
  const files = [];
  const walk = (d, pre = '') => { for (const e of readdirSync(d, { withFileTypes: true })) e.isDirectory() ? walk(join(d, e.name), pre + e.name + '/') : files.push(pre + e.name); };
  walk(OUT);
  const hash = createHash('sha256'); for (const f of files.sort()) hash.update(f).update(readFileSync(join(OUT, f)));
  const sw = read('sw.js').replace('__CACHE__', `dvijnyk-${pkg.version}-${hash.digest('hex').slice(0, 10)}`)
    .replace('__FILES__', JSON.stringify(['./', ...files.filter(f => !f.endsWith('.txt'))]));
  writeFileSync(join(OUT, 'sw.js'), await min(sw));
  console.log(`www/ built: ${files.length + 1} files, v${pkg.version}`);
}

// one self-contained HTML for testing inside Claude (step 1 of the plan): AI on, Google Fonts, no config/storage files
async function buildArtifact() {
  mkdirSync(DIST, { recursive: true });
  let html = read('index.html')
    .replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\n/, '')
    .replace(/<link rel="(manifest|icon|apple-touch-icon)"[^>]*>\n/g, '')
    .replace('<link rel="stylesheet" href="fonts/fonts.css">', '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Unbounded:wght@500;700&display=swap" rel="stylesheet">')
    .replace('<link rel="stylesheet" href="app.css">', () => `<style>\n${read('app.css')}</style>`)
    .replace('<script src="config.js"></script>\n<script src="storage.js"></script>', () => `<script>\n${read('app.js')}</script>`);
  writeFileSync(join(DIST, 'claude-artifact.html'), html);
  console.log('dist/claude-artifact.html built (AI on)');
}

await buildApp();
if (process.argv.includes('--artifact')) await buildArtifact();
