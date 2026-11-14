// Quick-log recognition: phrase → expected foods, with the interface in each of the three languages. Run: node tests/foods.mjs (after npm run build)
// Copyright (c) 2026 the app's author. All rights reserved.
import { createRequire } from 'node:module';
import { serve } from '../scripts/serve.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const CASES = [
  ['1 скибка чорного хліба з намазкою', ['rye', 'spread']],
  ['2 скибки хліба з маслом', ['bread', 'butter']],
  ['чорний шоколад 30 г', ['darkchoc']],
  ['вареники з картоплею 300 г', ['varenyky']],
  ['кава з молоком', ['coffee_milk']],
  ['яблучний сік', ['juice_apple']],
  ['борщ 400 г, 2 скибки хліба, яблуко', ['borscht', 'bread', 'apple']],
  ['шаурма', ['kebab']],
  ['снікерс', ['choc_bar']],
  ['гречка з мʼясом', ['buckwheat_meat']],
  ['сирники зі сметаною', ['syrnyky', 'sourcream']],
  ['2 круасани', ['croissant']],
  ['мівіна', ['noodles_instant']],
  ['чай з цукром', ['tea_sugar']],
  ['černý chléb s máslem', ['rye', 'butter']],
  ['smažený sýr', ['fried_cheese']],
  ['párek v rohlíku', ['hotdog']],
  ['rohlík s pomazánkou', ['roll', 'spread']],
  ['brown bread with butter', ['rye', 'butter']],
  ['greek salad', ['greek_salad']],
  ['вареники з вишнею', ['varenyky_cherry']],
  ['шашлик 200 г', ['shashlyk']],
  ['холодець', ['kholodets']],
  ['спагеті болоньєзе', ['pasta_bolognese']],
  ['медовик', ['honey_cake']],
  ['ряжанка', ['ryazhenka']],
  ['svařené víno', ['mulled_wine']],
  ['segedínský guláš', ['szegedin']],
  ['chicken curry', ['chicken_curry']],
  ['запечена картопля', ['potato_baked']],
  ['картопля запечена', ['potato_baked']],
  ['картопля в духовці', ['potato_baked']],
  ['картопля смажена', ['potato_fried']],
  ['риба печена', ['fish_baked']],
  ['печена курка', ['chicken_roast']],
  ['печені овочі', ['veg_baked']],
  ['запечена свинина', ['pork_baked']],
  ['печене яблуко', ['apple_baked']],
  ['pečená ryba', ['fish_baked']],
  ['roast pork', ['pork_baked']],
  ['jacket potato', ['potato_baked_skin']],
];
// Russian and Lithuanian interfaces: their own words
const CASES_X = [
  ['ru', 'жареная картошка', ['potato_fried']], ['ru', 'куриное филе 150 г', ['chicken_breast']], ['ru', 'хлеб с маслом', ['bread', 'butter']],
  ['ru', 'сырники со сметаной', ['syrnyky', 'sourcream']], ['ru', 'печёная рыба', ['fish_baked']], ['ru', 'яичница', ['fried_eggs']],
  ['lt', 'kiaušinienė', ['fried_eggs']], ['lt', 'virtos bulvės', ['potato']], ['lt', 'kava su pienu', ['coffee_milk']],
  ['lt', 'balta duona su sviestu', ['bread', 'butter']], ['lt', 'cepelinai', ['cepelinai']], ['lt', 'šaltibarščiai', ['saltibarsciai']],
];
const server = await serve(0);
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(`http://localhost:${server.address().port}/`); await p.waitForFunction(() => typeof window.showTab === 'function');
let bad = 0;
for (const ui of ['uk', 'cs', 'en']) for (const [phrase, want] of CASES) {
  const got = await p.evaluate(([ph, lg]) => {
    LANG = lg;
    const parts = ph.split(/\s*(?:,|;|\+|\n|\s+і\s+|\s+та\s+|\s+й\s+|\s+а також\s+|\s+and\s+|\s+a\s+|\s+plus\s+)\s*/i).filter(x => x && x.trim().length > 1);
    return parts.flatMap(x => splitWith(x) || [x]).map(x => { const it = parseItem(x), m = findFood(it.q || x); return m && m.food ? m.food.id : m && m.dish ? 'dish' : null; });
  }, [phrase, ui]);
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) bad++;
  console.log(`${ok ? '✓' : '✗'} [${ui}] ${phrase} → ${got.join(', ')}${ok ? '' : `   (expected ${want.join(', ')})`}`);
}
for (const [ui, phrase, want] of CASES_X) {
  const got = await p.evaluate(([ph, lg]) => {
    LANG = lg;
    const parts = ph.split(/\s*(?:,|;|\+|\n|\s+и\s+|\s+ir\s+)\s*/i).filter(x => x && x.trim().length > 1);
    return parts.flatMap(x => splitWith(x) || [x]).map(x => { const it = parseItem(x), m = findFood(it.q || x); return m && m.food ? m.food.id : m && m.dish ? 'dish' : null; });
  }, [phrase, ui]);
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) bad++;
  console.log(`${ok ? '✓' : '✗'} [${ui}] ${phrase} → ${got.join(', ')}${ok ? '' : `   (expected ${want.join(', ')})`}`);
}
await b.close(); server.close();
console.log(bad ? `\n${bad} failed` : '\nall recognized');
process.exit(bad ? 1 : 0);
