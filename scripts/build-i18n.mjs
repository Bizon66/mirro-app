// Builds src/i18n-extra.js (Russian + Lithuanian) from the editable tables in i18n-src/.
// t*.json: interface keys → [ru, lt]; a1/f1/f2/extra.json: Ukrainian name → [ru, lt]; steps.json: first Ukrainian recipe step → [ru steps, lt steps].
// Run after editing a table: node scripts/build-i18n.mjs
// Copyright (c) 2026 the app's author. All rights reserved.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), SRC = join(ROOT, 'i18n-src');
const load = f => JSON.parse(readFileSync(join(SRC, f), 'utf8'));
const merge = files => Object.assign({}, ...files.map(load));
const T = merge(['t1.json', 't2.json', 't3.json']), N = merge(['a1.json', 'f1.json', 'f2.json', 'extra.json']), S = load('steps.json');
const LVL = {
  ru: ['Новичок', 'Начинающий', 'Активный', 'Стабильный', 'Выносливый', 'Сильный', 'Атлет', 'Мастер', 'Легенда', 'Чемпион'],
  lt: ['Naujokas', 'Pradedantysis', 'Aktyvus', 'Pastovus', 'Ištvermingas', 'Stiprus', 'Atletas', 'Meistras', 'Legenda', 'Čempionas'],
};
const pick = (o, i) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v[i]]));
const out = Object.fromEntries(['ru', 'lt'].map((l, i) => [l, { T: pick(T, i), N: pick(N, i), S: pick(S, i), LVL: LVL[l] }]));
const js = '// Russian and Lithuanian texts (14.11). T: interface keys (same as T.uk); N: names by their Ukrainian text\n' +
  '// (foods, exercises, achievements, shop, quests…); S: recipe steps by the first Ukrainian step; LVL: level titles.\n' +
  "// Copyright (c) 2026 the app's author. All rights reserved.\n" +
  'window.I18N_X = ' + JSON.stringify(out) + ';\n';
writeFileSync(join(ROOT, 'src', 'i18n-extra.js'), js);
console.log(`src/i18n-extra.js: ${Object.keys(T).length} interface texts, ${Object.keys(N).length} names, ${Object.keys(S).length} recipes`);
