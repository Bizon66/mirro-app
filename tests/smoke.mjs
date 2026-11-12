// End-to-end smoke test of the built web app (www/). Run: npm test
// Copyright (c) 2026 the app's author. All rights reserved.
import { createRequire } from 'node:module';
import { serve } from '../scripts/serve.mjs';

let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); }
catch { console.error('Playwright is needed: npm i -D playwright && npx playwright install chromium (or set NODE_PATH to a global install)'); process.exit(2); }

const server = await serve(0);
const URL0 = `http://localhost:${server.address().port}/`;
const browser = await chromium.launch();
let failed = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`); if (!ok) failed++; };

async function page(ctx, opts = {}) {
  const p = await ctx.newPage();
  p.errors = [];
  p.on('pageerror', e => p.errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') p.errors.push(m.text()); });
  if (opts.clock) await p.clock.install({ time: opts.clock });
  await p.goto(URL0); await p.waitForFunction(() => typeof window.showTab === 'function');
  return p;
}
const fillProfile = async p => { await p.fill('#pAge', '35'); await p.fill('#pHeight', '180'); await p.fill('#pWeight', '92'); await p.click('#pSave'); };
const logFood = async (p, text) => {
  await p.click('nav button[data-t=tabToday]'); await p.fill('#qlText', text); await p.click('#qlGo');
  await p.click('#qlOut button:has-text("✓")'); await p.waitForTimeout(100);
};
const stored = p => p.evaluate(() => JSON.parse(localStorage.getItem('dvijnyk.v1') || '{}'));
const foodsOn = (d, day) => ((d.days || {})[day] || { foods: [] }).foods.map(f => f.n);

try {
  // 1) basic flow, CSP-clean, AI hidden in v1.0
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = await page(ctx);
    await fillProfile(p);
    check('profile saved, twin drawn', (await p.textContent('#mWeight')).includes('92'));
    await logFood(p, '2 яйця і банан');
    const d = await stored(p);
    const today = await p.evaluate(() => todayStr());
    check('food logged', foodsOn(d, today).length === 2);
    check('records carry a uid', d.days[today].foods.every(f => f.uid));
    check('data version set', d.v === 3);
    await p.click('nav button[data-t=tabTips]');
    check('AI coach hidden in v1.0', !(await p.isVisible('.coachCard')));
    await p.click('nav button[data-t=tabToday]'); await p.click('#lblBtn');
    check('label opens manual form (no photo AI)', await p.isVisible('#qlOut input'));
    for (const t of ['tabMe', 'tabToday', 'tabMeasure', 'tabProgress', 'tabTips', 'tabProfile']) await p.click(`nav button[data-t=${t}]`);
    check('fonts are local', await p.evaluate(() => document.fonts.check('700 16px Unbounded')));
    check('no console errors / CSP violations', p.errors.length === 0, p.errors.slice(0, 3).join(' | '));
    await ctx.close();
  }
  // 2) data survives a wiped localStorage (restored from the IndexedDB mirror)
  {
    const ctx = await browser.newContext();
    const p = await page(ctx); await fillProfile(p); await logFood(p, 'банан');
    await p.waitForTimeout(600); // mirror is debounced
    await p.evaluate(() => localStorage.clear());
    await p.reload(); await p.waitForFunction(() => typeof window.showTab === 'function');
    const d = await stored(p);
    check('restored from mirror after localStorage was cleared', !!d.profile && foodsOn(d, await p.evaluate(() => todayStr())).length === 1);
    await ctx.close();
  }
  // 3) app left open past midnight: food goes to the new day
  {
    const ctx = await browser.newContext();
    const p = await page(ctx, { clock: new Date('2026-03-10T22:30:00') });
    await fillProfile(p);
    await p.clock.fastForward('10:00:00');
    await logFood(p, 'банан');
    const d = await stored(p);
    check('overnight: food lands on the new day', foodsOn(d, '2026-03-11').length === 1 && foodsOn(d, '2026-03-10').length === 0);
    await ctx.close();
  }
  // 4) two tabs: a stale tab must not wipe the other tab's entries
  {
    const ctx = await browser.newContext();
    const a = await page(ctx); await fillProfile(a);
    const b = await page(ctx);
    await logFood(a, 'банан');
    await b.click('nav button[data-t=tabToday]'); await b.click('#waterRow > *'); await b.waitForTimeout(100);
    const d = await stored(a);
    check('two tabs: entries kept', foodsOn(d, await a.evaluate(() => todayStr())).length === 1);
    await ctx.close();
  }
  // 5) backup round trip through the text box
  {
    const ctx = await browser.newContext();
    const p = await page(ctx); await fillProfile(p); await logFood(p, 'банан');
    await p.click('nav button[data-t=tabProfile]'); await p.click('details:has(#bCopy) summary'); await p.click('#bCopy');
    const txt = await p.inputValue('#backup');
    await p.fill('#backup', txt); await p.click('#bLoad');
    check('backup restore from text', (await p.textContent('#toast')).includes('✅'));
    await ctx.close();
  }
  // 6) works offline after the first visit (service worker)
  {
    const ctx = await browser.newContext();
    const p = await page(ctx);
    await p.evaluate(() => navigator.serviceWorker.ready); await p.reload(); await p.waitForTimeout(300);
    await ctx.setOffline(true);
    await p.reload(); await p.waitForFunction(() => typeof window.showTab === 'function', null, { timeout: 5000 }).catch(() => {});
    check('opens offline', await p.evaluate(() => typeof window.showTab === 'function').catch(() => false));
    await ctx.close();
  }
} finally {
  await browser.close(); server.close();
}
console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
