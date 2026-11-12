// Renders assets/icon.svg into the PNG icons (dev tool; needs Playwright). Copyright (c) 2026 the app's author.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // run with NODE_PATH set to the global node_modules if it is not installed locally
import { readFileSync } from 'node:fs';
const svg = readFileSync(new URL('../assets/icon.svg', import.meta.url), 'utf8');
const out = [['src/icons/icon-192.png', 192, 0], ['src/icons/icon-512.png', 512, 0], ['src/icons/icon-maskable-512.png', 512, 0.1], ['assets/icon-only.png', 1024, 0], ['assets/icon-foreground.png', 1024, 0.2], ['assets/splash.png', 2732, 0.38]];
const b = await chromium.launch(); const p = await b.newPage();
for (const [file, size, pad] of out) {
  await p.setViewportSize({ width: size, height: size });
  const inner = Math.round(size * (1 - 2 * pad));
  await p.setContent(`<html><body style="margin:0;background:#2b62cf;display:grid;place-items:center;width:${size}px;height:${size}px">${svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</body></html>`);
  await p.screenshot({ path: file });
}
await b.close(); console.log('icons done');
