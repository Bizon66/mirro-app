/* Mirro (working name «Мій двійник») — app logic.
 * Copyright (c) 2026 the app's author. All rights reserved. Proprietary and confidential; see LICENSE.
 * Unauthorized copying, distribution or modification of this file is prohibited. */
// feature flags come from config.js; the Claude-artifact build has no config, so AI stays on there
const CFG = window.APP_CONFIG || {};
const AI_ON = CFG.features ? !!CFG.features.ai : true;
// ================= i18n =================
const T = {
  uk: {
    app: 'Mirro', tabMe: 'Я', tabToday: 'Сьогодні', tabMeasure: 'Заміри', tabProgress: 'Прогрес', tabProfile: 'Профіль',
    timeMachine: '⏳ Машина часу', now: 'Зараз', w1: '+1 тиж.', m1: '+1 міс.', m3: '+3 міс.', m6: '+6 міс.', y1: '+1 рік', daysWord: 'днів',
    statWeight: 'Вага (модель)', statBmi: 'ІМТ', statNorm: 'Витрата без спорту, ккал/день', statToday: 'Баланс сьогодні, ккал',
    girths: '📏 Обхвати', girthNote: '«оцінка» — розраховано за зростом і вагою. Коли введете заміри, персонаж малюється за ними й далі змінюється разом із вагою.',
    estimate: 'оцінка', measured: 'заміряно', adjusted: 'з поправкою',
    waist: 'Талія', belly: 'Живіт', chest: 'Груди', shoulders: 'Плечі', thigh: 'Стегно', weightKg: 'Вага, кг', cm: 'см', kg: 'кг',
    eaten: "З'їдено, ккал", burned: 'Витрачено, ккал', whatAte: "🍽 Що з'їли", dish: 'Страва', kcal: 'ккал', addFood: 'Додати їжу', quick: 'Швидко додати (калорії приблизні):',
    whatDid: '🏃 Що робили', activity: 'Активність', minutes: 'Хвилин', addAct: 'Додати активність', approx: '≈ {k} ккал',
    dayNote: "Вага змінюється за підсумком дня: наступного ранку персонаж оновиться. Дні без записаної їжі рахуються як «у нормі» (вага не змінюється), але спорт усе одно додає м'язів.",
    noFood: 'Їжа не записана — цей день не змінить вагу', perDay: '≈ {v} кг за день',
    newMeas: '📏 Нові заміри', measHint: 'Заповніть тільки те, що хочете. Справжня вага з ваг виправляє розрахунок моделі.', date: 'Дата', saveMeas: 'Зберегти заміри',
    howTo: 'Як міряти: талія — на рівні пупка, де живіт найбільше випирає; груди — по найширшому місцю; плечі — навколо по найширшій частині плечей; стегно — найширше місце однієї ноги.',
    history: 'Історія замірів', noMeas: 'Ще немає замірів.', weightTitle: '⚖️ Вага', chartNote: 'Лінія — розрахунок моделі, точки — ваші справжні зважування.', few: 'Даних поки мало — записуйте щодня.',
    last7: '📊 Останні 7 днів', thDay: 'День', thEat: 'Їжа', thBurn: 'Витр.', thBal: 'Баланс', thKg: 'кг',
    firstRun: "👋 Привіт! Заповніть профіль — і з'явиться ваш двійник.", about: '👤 Про вас', name: "Ім'я", namePh: 'Як вас звати?', sex: 'Стать', male: 'Чоловік', female: 'Жінка', age: 'Вік', heightCm: 'Зріст, см', startWeight: 'Початкова вага, кг',
    job: 'Робота / спосіб життя', job1: 'Сидяча (офіс, водій)', job2: 'На ногах (склад, магазин)', job3: 'Важка фізична (будова)',
    shape: 'Де найбільше відкладається жир', shBelly: 'Живіт і боки', shEven: 'Рівномірно', shHips: 'Стегна й сідниці', sporty: 'Наскільки ви зараз спортивні', sp0: 'Зовсім ні', sp1: 'Трохи', sp2: 'Регулярно', sp3: 'Дуже (атлет)',
    looks: '🎨 Зовнішність', skin: 'Шкіра', hair: 'Волосся', hairStyle: 'Зачіска', hsShort: 'Коротка', hsBuzz: 'Під машинку', hsLong: 'Довга', hsBald: 'Лисина',
    beard: 'Борода', bNone: 'Немає', bStubble: 'Щетина', bFull: 'Борода', bMoustache: 'Вуса', bBoth: 'Борода + вуса', shirt: 'Футболка', glasses: 'Окуляри', saveProfile: 'Зберегти профіль',
    backup: '💾 Резервна копія', backupNote: 'Дані зберігаються лише в цьому браузері. Скопіюйте текст і збережіть собі, щоб не втратити. Щоб відновити — вставте копію сюди.',
    copy: 'Скопіювати', restore: 'Відновити', reset: 'Стерти всі дані', tapAgain: 'Натисніть ще раз, щоб стерти все',
    tSaved: 'Профіль збережено ✅', tFill: 'Спочатку заповніть профіль', tBad: 'Перевірте вік, зріст і вагу', tAdded: 'Додано: {n}', tKcal: 'Вкажіть калорії', tMeas: 'Заміри збережено ✅', tOne: 'Заповніть хоча б одне поле',
    tCopied: 'Скопійовано ✅', tCopyFail: 'Не вдалося скопіювати — виділіть текст вручну', tRestored: 'Відновлено ✅', tBadBackup: 'Це не схоже на резервну копію', tErased: 'Усе стерто',
    fThin: 'Худорлява статура', fNormal: 'Нормальна вага', fOver: 'Трохи зайвої ваги', fHeavy: 'Повна статура', fSporty: 'Спортивна статура ⚽', fSportyBelly: 'Спортивний, але з животиком 😄', fAthlete: 'Атлетична статура 💪',
    tmNow: 'Так ви виглядаєте сьогодні за розрахунком.', tmFuture: 'Якщо їсти й рухатися як останні дні (у середньому {b} ккал/день), через {d} днів: ≈ {w} кг.', tmNoData: 'Запишіть кілька днів їжі, щоб машина часу знала ваші звички.',
    fridgeTitle: '🧊 Що приготувати з холодильника', fridgePh: 'Що у вас є? Наприклад: яйця, картопля, цибуля, сир, ковбаса', fridgeBtn: '🍳 Що приготувати?',
    fridgeThinking: 'Підбираю рецепти…', fridgeAI: '✨ Рецепти підбирає Claude з урахуванням вашої цілі по калоріях.', fridgeLocal: 'ℹ️ Розумний підбір працює, коли додаток відкрито в Claude. Зараз — базові рецепти з вбудованого списку.',
    fridgeNone: 'Нічого не знайшлося — допишіть більше продуктів.', fridgeErr: 'Не вдалося отримати рецепти. Спробуйте ще раз трохи пізніше.', fridgeEmpty: 'Напишіть, що є в холодильнику',
    perPortion: '≈ {k} ккал / порція', minW: '{m} хв', haveW: '✅ Є', buyW: '🛒 Докупити', addEaten: "➕ З'їв порцію ({k} ккал)", protW: 'білок ≈ {g} г',
    tabTips: 'Поради', calTitle: '🎯 Калорії на день', gLose: 'Схуднути', gKeep: 'Тримати вагу', gGain: "Набрати м'язи", kcalDay: 'ккал на день',
    calBase: 'Ваша витрата без спорту: ≈ {k} ккал.', calLose: 'Ціль на 500 ккал менша за витрату → приблизно −0,5 кг на тиждень.', calKeep: 'Стільки ви витрачаєте — вага триматиметься.',
    calGain: "Невеликий плюс 250 ккал разом із силовими тренуваннями — м'язи без зайвого жиру.", calFloor: "Без нагляду лікаря не опускайтеся нижче {f} ккал на день: так важко добрати білок і поживні речовини, а ризик втратити м'язи зростає.",
    calLow: 'Ваша вага вже в нормі, тож худнути не потрібно. Ціль — тримати вагу, а форму покращать тренування.', calFloorHit: '⚠️ Ціль піднято до безпечного мінімуму {f} ккал.', protein: 'Білок: ≈ {g} г на день (м\'ясо, риба, яйця, сир, бобові) — допомагає зберегти м\'язи.',
    exDays: "У дні тренувань можна з'їсти приблизно половину спалених калорій.", todayVs: "Сьогодні з'їдено {e} із {t} ккал", target: 'Ціль: {t} ккал · залишилось {r}',
    weekTitle: '📅 Ваш тиждень', weekAct: 'Активність за 7 днів: {m} із 150 хв (мінімум ВООЗ)', weekStr: 'Силові / домашні тренування: {n} із 2–3',
    woTitle: '🏠 Домашнє тренування', woIntro: 'Робіть вправи по колу, одна за одною. Між колами — відпочинок 60–90 с. 3 рази на тиждень (наприклад пн, ср, пт).',
    lvlBeg: 'Початківець', lvlMid: 'Середній', lvlAdv: 'Просунутий', woMeta: 'Кіл: {n} · ≈ {m} хв · ≈ {k} ккал',
    sexM: '👨 Навантаження для чоловіків: класичні віджимання, більше трицепса, довша планка.', sexF: '👩 Навантаження для жінок: віджимання з полегшенням, більше сідничного містка й випадів.',
    reps: '{n} разів', perLeg: '{n} на кожну ногу', sec: '{n} с', easier: 'Легше', harder: 'Важче',
    woLog: '✅ Я зробив тренування', woLogged: 'Тренування записано 💪', woNote: "Якщо болить суглоб чи спина — зупиніться. При проблемах зі здоров'ям спершу порадьтеся з лікарем.",
    tipsTitle: '💡 Корисно знати', tip1: "Живіт і боки йдуть разом із загальною вагою: вправи на прес не «спалюють» жир саме там, але зміцнюють м'язи під ним.",
    tip2: 'Пиво й солодкі напої — приховані калорії: 0,5 л пива ≈ 215 ккал.', tip3: 'Невеликий дефіцит, який ви витримаєте місяцями, кращий за жорстку дієту на два тижні.',
    tip4: 'ВООЗ радить дорослим 150–300 хв помірної активності на тиждень і силові вправи щонайменше 2 дні.', srcNote: 'Джерела: рекомендації ВООЗ, Harvard Health, WebMD. Це не медична порада.',
    wd: ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'], today: 'сьогодні', food: 'Їжа', min: 'хв'
  },
  cs: {
    app: 'Mirro', tabMe: 'Já', tabToday: 'Dnes', tabMeasure: 'Míry', tabProgress: 'Pokrok', tabProfile: 'Profil',
    timeMachine: '⏳ Stroj času', now: 'Teď', w1: '+1 týd.', m1: '+1 měs.', m3: '+3 měs.', m6: '+6 měs.', y1: '+1 rok', daysWord: 'dní',
    statWeight: 'Váha (model)', statBmi: 'BMI', statNorm: 'Výdej bez sportu, kcal/den', statToday: 'Dnešní bilance, kcal',
    girths: '📏 Obvody', girthNote: '„odhad" = spočítáno z výšky a váhy. Když zadáte míry, postava se kreslí podle nich a dál se mění s váhou.',
    estimate: 'odhad', measured: 'změřeno', adjusted: 'upraveno',
    waist: 'Pas', belly: 'Břicho', chest: 'Hrudník', shoulders: 'Ramena', thigh: 'Stehno', weightKg: 'Váha, kg', cm: 'cm', kg: 'kg',
    eaten: 'Snědeno, kcal', burned: 'Spáleno, kcal', whatAte: '🍽 Co jsem snědl(a)', dish: 'Jídlo', kcal: 'kcal', addFood: 'Přidat jídlo', quick: 'Rychle přidat (kalorie přibližné):',
    whatDid: '🏃 Co jsem dělal(a)', activity: 'Aktivita', minutes: 'Minut', addAct: 'Přidat aktivitu', approx: '≈ {k} kcal',
    dayNote: 'Váha se mění podle výsledku dne: druhý den ráno se postava aktualizuje. Dny bez zapsaného jídla se berou jako „v normě" (váha se nemění), ale sport i tak přidává svaly.',
    noFood: 'Jídlo nezapsáno — tento den váhu nezmění', perDay: '≈ {v} kg za den',
    newMeas: '📏 Nové míry', measHint: 'Vyplňte jen to, co chcete. Skutečná váha z váhy opraví výpočet modelu.', date: 'Datum', saveMeas: 'Uložit míry',
    howTo: 'Jak měřit: pas — v úrovni pupku, kde břicho nejvíc vystupuje; hrudník — v nejširším místě; ramena — dokola přes nejširší část ramen; stehno — nejširší místo jedné nohy.',
    history: 'Historie měření', noMeas: 'Zatím žádná měření.', weightTitle: '⚖️ Váha', chartNote: 'Čára = výpočet modelu, body = vaše skutečná vážení.', few: 'Zatím málo dat — zapisujte každý den.',
    last7: '📊 Posledních 7 dní', thDay: 'Den', thEat: 'Jídlo', thBurn: 'Výdej', thBal: 'Bilance', thKg: 'kg',
    firstRun: '👋 Ahoj! Vyplňte profil a objeví se váš dvojník.', about: '👤 O vás', name: 'Jméno', namePh: 'Jak se jmenujete?', sex: 'Pohlaví', male: 'Muž', female: 'Žena', age: 'Věk', heightCm: 'Výška, cm', startWeight: 'Počáteční váha, kg',
    job: 'Práce / životní styl', job1: 'Sedavá (kancelář, řidič)', job2: 'Na nohou (sklad, obchod)', job3: 'Těžká fyzická (stavba)',
    shape: 'Kde se vám nejvíc ukládá tuk', shBelly: 'Břicho a boky', shEven: 'Rovnoměrně', shHips: 'Stehna a zadek', sporty: 'Jak moc teď sportujete', sp0: 'Vůbec', sp1: 'Trochu', sp2: 'Pravidelně', sp3: 'Hodně (atlet)',
    looks: '🎨 Vzhled', skin: 'Pleť', hair: 'Vlasy', hairStyle: 'Účes', hsShort: 'Krátký', hsBuzz: 'Na ježka', hsLong: 'Dlouhý', hsBald: 'Pleš',
    beard: 'Vousy', bNone: 'Žádné', bStubble: 'Strniště', bFull: 'Plnovous', bMoustache: 'Knír', bBoth: 'Plnovous + knír', shirt: 'Tričko', glasses: 'Brýle', saveProfile: 'Uložit profil',
    backup: '💾 Záloha', backupNote: 'Data se ukládají jen v tomto prohlížeči. Zkopírujte text a uložte si ho. Pro obnovení vložte zálohu sem.',
    copy: 'Kopírovat', restore: 'Obnovit', reset: 'Smazat všechna data', tapAgain: 'Klepněte znovu pro smazání všeho',
    tSaved: 'Profil uložen ✅', tFill: 'Nejdřív vyplňte profil', tBad: 'Zkontrolujte věk, výšku a váhu', tAdded: 'Přidáno: {n}', tKcal: 'Zadejte kalorie', tMeas: 'Míry uloženy ✅', tOne: 'Vyplňte aspoň jedno pole',
    tCopied: 'Zkopírováno ✅', tCopyFail: 'Kopírování selhalo — označte text ručně', tRestored: 'Obnoveno ✅', tBadBackup: 'Tohle nevypadá jako záloha', tErased: 'Vše smazáno',
    fThin: 'Štíhlá postava', fNormal: 'Normální váha', fOver: 'Trochu nadváhy', fHeavy: 'Plnější postava', fSporty: 'Sportovní postava ⚽', fSportyBelly: 'Sportovní, ale s bříškem 😄', fAthlete: 'Atletická postava 💪',
    tmNow: 'Takhle podle výpočtu vypadáte dnes.', tmFuture: 'Když budete jíst a hýbat se jako poslední dny (průměrně {b} kcal/den), za {d} dní: ≈ {w} kg.', tmNoData: 'Zapište pár dní jídla, ať stroj času zná vaše zvyky.',
    fridgeTitle: '🧊 Co uvařit z ledničky', fridgePh: 'Co máte doma? Např.: vejce, brambory, cibule, sýr, salám', fridgeBtn: '🍳 Co uvařit?',
    fridgeThinking: 'Hledám recepty…', fridgeAI: '✨ Recepty vybírá Claude podle vašeho kalorického cíle.', fridgeLocal: 'ℹ️ Chytrý výběr funguje, když je aplikace otevřená v Claude. Teď jsou to základní recepty z vestavěného seznamu.',
    fridgeNone: 'Nic se nenašlo — dopište víc potravin.', fridgeErr: 'Recepty se nepodařilo získat. Zkuste to za chvíli znovu.', fridgeEmpty: 'Napište, co máte v ledničce',
    perPortion: '≈ {k} kcal / porce', minW: '{m} min', haveW: '✅ Máte', buyW: '🛒 Dokoupit', addEaten: '➕ Snědl jsem porci ({k} kcal)', protW: 'bílkoviny ≈ {g} g',
    tabTips: 'Rady', calTitle: '🎯 Kalorie na den', gLose: 'Zhubnout', gKeep: 'Udržet váhu', gGain: 'Nabrat svaly', kcalDay: 'kcal denně',
    calBase: 'Váš výdej bez sportu: ≈ {k} kcal.', calLose: 'Cíl je o 500 kcal nižší než výdej → zhruba −0,5 kg za týden.', calKeep: 'Tolik spálíte — váha se udrží.',
    calGain: 'Malé plus 250 kcal spolu se silovým tréninkem — svaly bez zbytečného tuku.', calFloor: 'Bez dohledu lékaře nejděte pod {f} kcal denně: je pak těžké přijmout dost bílkovin a živin a roste riziko ztráty svalů.',
    calLow: 'Vaše váha je už v normě, hubnout není potřeba. Cíl je udržet váhu, postavu zlepší trénink.', calFloorHit: '⚠️ Cíl zvýšen na bezpečné minimum {f} kcal.', protein: 'Bílkoviny: ≈ {g} g denně (maso, ryby, vejce, tvaroh, luštěniny) — pomáhají udržet svaly.',
    exDays: 'Ve dnech tréninku můžete sníst zhruba polovinu spálených kalorií.', todayVs: 'Dnes snědeno {e} z {t} kcal', target: 'Cíl: {t} kcal · zbývá {r}',
    weekTitle: '📅 Váš týden', weekAct: 'Pohyb za 7 dní: {m} ze 150 min (minimum WHO)', weekStr: 'Silové / domácí tréninky: {n} ze 2–3',
    woTitle: '🏠 Domácí trénink', woIntro: 'Cviky dělejte v kruhu, jeden po druhém. Mezi koly pauza 60–90 s. 3× týdně (např. po, st, pá).',
    lvlBeg: 'Začátečník', lvlMid: 'Pokročilý', lvlAdv: 'Zkušený', woMeta: 'Kol: {n} · ≈ {m} min · ≈ {k} kcal',
    sexM: '👨 Zátěž pro muže: klasické kliky, víc tricepsu, delší plank.', sexF: '👩 Zátěž pro ženy: kliky s ulehčením, víc hýžďového mostu a výpadů.',
    reps: '{n}×', perLeg: '{n}× na každou nohu', sec: '{n} s', easier: 'Snazší', harder: 'Těžší',
    woLog: '✅ Mám odcvičeno', woLogged: 'Trénink zapsán 💪', woNote: 'Když bolí kloub nebo záda, přestaňte. Se zdravotními potížemi se nejdřív poraďte s lékařem.',
    tipsTitle: '💡 Dobré vědět', tip1: 'Břicho a boky mizí spolu s celkovou váhou: cviky na břicho nespalují tuk přímo tam, ale posilují svaly pod ním.',
    tip2: 'Pivo a slazené nápoje jsou skryté kalorie: 0,5 l piva ≈ 215 kcal.', tip3: 'Malý deficit, který vydržíte měsíce, je lepší než tvrdá dieta na dva týdny.',
    tip4: 'WHO doporučuje dospělým 150–300 min mírného pohybu týdně a posilování aspoň 2 dny.', srcNote: 'Zdroje: doporučení WHO, Harvard Health, WebMD. Nejde o lékařskou radu.',
    wd: ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'], today: 'dnes', food: 'Jídlo', min: 'min'
  },
  en: {
    app: 'Mirro', tabMe: 'Me', tabToday: 'Today', tabMeasure: 'Measure', tabProgress: 'Progress', tabProfile: 'Profile',
    timeMachine: '⏳ Time machine', now: 'Now', w1: '+1 wk', m1: '+1 mo', m3: '+3 mo', m6: '+6 mo', y1: '+1 yr', daysWord: 'days',
    statWeight: 'Weight (model)', statBmi: 'BMI', statNorm: 'Burn without sport, kcal/day', statToday: "Today's balance, kcal",
    girths: '📏 Measurements', girthNote: '"estimate" = calculated from height and weight. Once you enter measurements, the character is drawn from them and keeps changing with your weight.',
    estimate: 'estimate', measured: 'measured', adjusted: 'adjusted',
    waist: 'Waist', belly: 'Belly', chest: 'Chest', shoulders: 'Shoulders', thigh: 'Thigh', weightKg: 'Weight, kg', cm: 'cm', kg: 'kg',
    eaten: 'Eaten, kcal', burned: 'Burned, kcal', whatAte: '🍽 What I ate', dish: 'Food', kcal: 'kcal', addFood: 'Add food', quick: 'Quick add (calories are approximate):',
    whatDid: '🏃 What I did', activity: 'Activity', minutes: 'Minutes', addAct: 'Add activity', approx: '≈ {k} kcal',
    dayNote: 'Weight changes based on the day\'s total: the character updates the next morning. Days with no food logged count as "on target" (no weight change), but exercise still builds muscle.',
    noFood: 'No food logged — this day won\'t change your weight', perDay: '≈ {v} kg per day',
    newMeas: '📏 New measurements', measHint: 'Fill in only what you want. A real weigh-in corrects the model.', date: 'Date', saveMeas: 'Save measurements',
    howTo: 'How to measure: waist — at navel level, where the belly sticks out most; chest — at the widest point; shoulders — around the widest part of the shoulders; thigh — widest part of one leg.',
    history: 'Measurement history', noMeas: 'No measurements yet.', weightTitle: '⚖️ Weight', chartNote: 'Line = model estimate, dots = your real weigh-ins.', few: 'Not much data yet — log every day.',
    last7: '📊 Last 7 days', thDay: 'Day', thEat: 'Food', thBurn: 'Burn', thBal: 'Balance', thKg: 'kg',
    firstRun: '👋 Hi! Fill in your profile and your twin will appear.', about: '👤 About you', name: 'Name', namePh: "What's your name?", sex: 'Sex', male: 'Male', female: 'Female', age: 'Age', heightCm: 'Height, cm', startWeight: 'Starting weight, kg',
    job: 'Job / lifestyle', job1: 'Sitting (office, driver)', job2: 'On your feet (warehouse, shop)', job3: 'Heavy physical (construction)',
    shape: 'Where you store most fat', shBelly: 'Belly and sides', shEven: 'Evenly', shHips: 'Hips and thighs', sporty: 'How sporty are you now', sp0: 'Not at all', sp1: 'A little', sp2: 'Regularly', sp3: 'Very (athlete)',
    looks: '🎨 Appearance', skin: 'Skin', hair: 'Hair', hairStyle: 'Hairstyle', hsShort: 'Short', hsBuzz: 'Buzz cut', hsLong: 'Long', hsBald: 'Bald',
    beard: 'Beard', bNone: 'None', bStubble: 'Stubble', bFull: 'Full beard', bMoustache: 'Moustache', bBoth: 'Beard + moustache', shirt: 'T-shirt', glasses: 'Glasses', saveProfile: 'Save profile',
    backup: '💾 Backup', backupNote: 'Data is stored only in this browser. Copy the text and keep it somewhere safe. To restore, paste a backup here.',
    copy: 'Copy', restore: 'Restore', reset: 'Erase all data', tapAgain: 'Tap again to erase everything',
    tSaved: 'Profile saved ✅', tFill: 'Fill in your profile first', tBad: 'Check age, height and weight', tAdded: 'Added: {n}', tKcal: 'Enter calories', tMeas: 'Measurements saved ✅', tOne: 'Fill in at least one field',
    tCopied: 'Copied ✅', tCopyFail: "Couldn't copy — select the text manually", tRestored: 'Restored ✅', tBadBackup: "This doesn't look like a backup", tErased: 'Everything erased',
    fThin: 'Slim build', fNormal: 'Healthy weight', fOver: 'A bit overweight', fHeavy: 'Heavier build', fSporty: 'Sporty build ⚽', fSportyBelly: 'Sporty, but with a belly 😄', fAthlete: 'Athletic build 💪',
    tmNow: 'This is how you look today, by the model.', tmFuture: 'If you eat and move like the last few days (avg {b} kcal/day), in {d} days: ≈ {w} kg.', tmNoData: 'Log a few days of food so the time machine knows your habits.',
    fridgeTitle: '🧊 What to cook from the fridge', fridgePh: 'What do you have? E.g.: eggs, potatoes, onion, cheese, sausage', fridgeBtn: '🍳 What can I cook?',
    fridgeThinking: 'Finding recipes…', fridgeAI: '✨ Claude picks the recipes, keeping your calorie target in mind.', fridgeLocal: 'ℹ️ Smart suggestions work when the app is opened in Claude. Showing basic built-in recipes for now.',
    fridgeNone: 'Nothing found — add more ingredients.', fridgeErr: "Couldn't get recipes. Try again in a moment.", fridgeEmpty: "Write what's in your fridge",
    perPortion: '≈ {k} kcal / portion', minW: '{m} min', haveW: '✅ Have', buyW: '🛒 Buy', addEaten: '➕ Ate a portion ({k} kcal)', protW: 'protein ≈ {g} g',
    tabTips: 'Tips', calTitle: '🎯 Daily calories', gLose: 'Lose weight', gKeep: 'Maintain', gGain: 'Build muscle', kcalDay: 'kcal per day',
    calBase: 'Your burn without sport: ≈ {k} kcal.', calLose: 'Target is 500 kcal below your burn → about −0.5 kg per week.', calKeep: "That's what you burn — your weight stays stable.",
    calGain: 'A small +250 kcal together with strength training — muscle without extra fat.', calFloor: "Without medical supervision, don't go below {f} kcal a day: it gets hard to eat enough protein and nutrients, and the risk of losing muscle rises.",
    calLow: "Your weight is already healthy, so there's no need to lose more. The target is to maintain; training will improve your shape.", calFloorHit: '⚠️ Target raised to the safe minimum of {f} kcal.', protein: 'Protein: ≈ {g} g per day (meat, fish, eggs, cottage cheese, beans) — helps keep muscle.',
    exDays: 'On workout days you can eat back about half of the calories you burned.', todayVs: 'Eaten today: {e} of {t} kcal', target: 'Target: {t} kcal · {r} left',
    weekTitle: '📅 Your week', weekAct: 'Activity in 7 days: {m} of 150 min (WHO minimum)', weekStr: 'Strength / home workouts: {n} of 2–3',
    woTitle: '🏠 Home workout', woIntro: 'Do the exercises as a circuit, one after another. Rest 60–90 s between rounds. 3 times a week (e.g. Mon, Wed, Fri).',
    lvlBeg: 'Beginner', lvlMid: 'Intermediate', lvlAdv: 'Advanced', woMeta: 'Rounds: {n} · ≈ {m} min · ≈ {k} kcal',
    sexM: '👨 Load for men: standard push-ups, more triceps, longer plank.', sexF: '👩 Load for women: easier push-ups, more glute bridges and lunges.',
    reps: '{n} reps', perLeg: '{n} each leg', sec: '{n} s', easier: 'Easier', harder: 'Harder',
    woLog: '✅ I did the workout', woLogged: 'Workout logged 💪', woNote: 'Stop if a joint or your back hurts. If you have health problems, check with a doctor first.',
    tipsTitle: '💡 Good to know', tip1: "Belly and love handles go with your overall weight: ab exercises don't burn fat right there, but they strengthen the muscles underneath.",
    tip2: 'Beer and sugary drinks are hidden calories: 0.5 l of beer ≈ 215 kcal.', tip3: 'A small deficit you can keep for months beats a harsh two-week diet.',
    tip4: 'WHO recommends adults get 150–300 min of moderate activity a week and strength training on at least 2 days.', srcNote: 'Sources: WHO guidelines, Harvard Health, WebMD. Not medical advice.',
    wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], today: 'today', food: 'Food', min: 'min'
  }
};
// ---- v2 texts ----
const T_ADD = {
  uk: {
    mBreakfast: '🍳 Сніданок', mLunch: '🍲 Обід', mDinner: '🍽 Вечеря', mSnack: '🍎 Перекус', addBtn: '+ Додати',
    prot: 'Білки', fat: 'Жири', carb: 'Вуглеводи', gU: 'г', macroTitle: '🥗 Білки · жири · вуглеводи',
    sheetProducts: '🔎 Продукти', sheetDishes: '🍲 Мої страви', sheetManual: '✍️ Вручну', searchPh: 'Пошук продукту…', recent: 'Нещодавні', popular: 'Популярні',
    per100: 'на 100 г', grams: 'Грамів', mealW: 'Прийом їжі', add: 'Додати', back: '← Назад', newDish: '＋ Нова страва',
    noDishes: 'Ще немає своїх страв. Створіть першу з інгредієнтів!', portions: 'Порцій', portionW: 'порція', dishName: 'Назва страви', dishPortions: 'Скільки порцій вийшло',
    ingredients: 'Інгредієнти', addIng: 'Додати інгредієнт — почніть вводити назву', total: 'Усього', perPortionT: 'На 1 порцію', saveDish: 'Зберегти страву', saveDishAdd: "Зберегти й з'їсти порцію",
    dishSaved: 'Страву збережено 👨‍🍳', needName: 'Вкажіть назву', needIng: 'Додайте хоча б один інгредієнт', delW: 'Видалити', editW: 'Змінити', builderTitle: '🍲 Своя страва',
    manualName: 'Назва', optMacros: 'Білки / жири / вуглеводи, г (необов\'язково)', dbNote: 'Значення приблизні, на 100 г готового продукту (крім позначених «сухий»). Напої — на 100 мл.',
    nothingFound: 'Нічого не знайдено. Спробуйте інше слово або додайте вручну.',
    water: '💧 Вода', waterN: '{n} із 8 склянок (по 250 мл)', steps: '👣 Кроки', stepsPh: 'Кроків за день', stepsKcal: '≈ {k} ккал додатково', saveSteps: 'Зберегти', stepsSaved: 'Кроки збережено 👣',
    goalTitle: '🎯 Моя мета', targetW: 'Цільова вага, кг', setGoal: 'Зберегти', goalLeft: 'Залишилось: {v} кг', goalDone: '🎉 Мету досягнуто!',
    goalEta: 'Якщо як останні дні — приблизно {d} (через {n} дн.).', goalNoEta: 'Запишіть кілька днів їжі — і я порахую, коли ви досягнете мети.',
    goalWrongWay: 'Зараз ви рухаєтесь від мети — подивіться калорії у «Порадах».', goalNone: 'Вкажіть цільову вагу, щоб бачити прогрес.', goalSaved: 'Мету збережено 🎯',
    streak: '🔥 Серія: {n} дн. поспіль', streak0: '🔥 Запишіть їжу сьогодні — і почнеться серія!', achTitle: '🏅 Досягнення', achNew: '🏅 Нове досягнення: {n}', achCount: 'Відкрито {a} з {b}',
    woStart: '▶️ Почати тренування з таймером', getReady: 'Приготуйтеся!', roundW: 'Коло {r}/{n}', exW: 'Вправа {i}/{n}', done: '✅ Готово', restW: 'Відпочинок',
    nextW: 'Далі: {n}', pause: '⏸ Пауза', resume: '▶️ Далі', skip: '⏭ Далі', stop: '✖ Стоп', woFinished: '🎉 Тренування завершено! {m} хв записано.', woTooShort: 'Тренування зупинено.',
    sayRest: 'Відпочинок', sayDone: 'Чудово! Тренування завершено.', paused: 'Пауза'
  },
  cs: {
    mBreakfast: '🍳 Snídaně', mLunch: '🍲 Oběd', mDinner: '🍽 Večeře', mSnack: '🍎 Svačina', addBtn: '+ Přidat',
    prot: 'Bílkoviny', fat: 'Tuky', carb: 'Sacharidy', gU: 'g', macroTitle: '🥗 Bílkoviny · tuky · sacharidy',
    sheetProducts: '🔎 Potraviny', sheetDishes: '🍲 Moje jídla', sheetManual: '✍️ Ručně', searchPh: 'Hledat potravinu…', recent: 'Nedávné', popular: 'Oblíbené',
    per100: 'na 100 g', grams: 'Gramů', mealW: 'Jídlo dne', add: 'Přidat', back: '← Zpět', newDish: '＋ Nové jídlo',
    noDishes: 'Zatím žádná vlastní jídla. Vytvořte první ze surovin!', portions: 'Porcí', portionW: 'porce', dishName: 'Název jídla', dishPortions: 'Kolik porcí vyšlo',
    ingredients: 'Suroviny', addIng: 'Přidat surovinu — začněte psát název', total: 'Celkem', perPortionT: 'Na 1 porci', saveDish: 'Uložit jídlo', saveDishAdd: 'Uložit a sníst porci',
    dishSaved: 'Jídlo uloženo 👨‍🍳', needName: 'Zadejte název', needIng: 'Přidejte aspoň jednu surovinu', delW: 'Smazat', editW: 'Upravit', builderTitle: '🍲 Vlastní jídlo',
    manualName: 'Název', optMacros: 'Bílkoviny / tuky / sacharidy, g (nepovinné)', dbNote: 'Hodnoty jsou přibližné, na 100 g hotové potraviny (kromě označených „suché"). Nápoje na 100 ml.',
    nothingFound: 'Nic nenalezeno. Zkuste jiné slovo nebo přidejte ručně.',
    water: '💧 Voda', waterN: '{n} z 8 sklenic (po 250 ml)', steps: '👣 Kroky', stepsPh: 'Kroků za den', stepsKcal: '≈ {k} kcal navíc', saveSteps: 'Uložit', stepsSaved: 'Kroky uloženy 👣',
    goalTitle: '🎯 Můj cíl', targetW: 'Cílová váha, kg', setGoal: 'Uložit', goalLeft: 'Zbývá: {v} kg', goalDone: '🎉 Cíl splněn!',
    goalEta: 'Pokud jako poslední dny — zhruba {d} (za {n} dní).', goalNoEta: 'Zapište pár dní jídla a spočítám, kdy cíle dosáhnete.',
    goalWrongWay: 'Teď se od cíle vzdalujete — podívejte se na kalorie v „Radách".', goalNone: 'Zadejte cílovou váhu, ať vidíte pokrok.', goalSaved: 'Cíl uložen 🎯',
    streak: '🔥 Série: {n} dní v řadě', streak0: '🔥 Zapište dnes jídlo a začne série!', achTitle: '🏅 Úspěchy', achNew: '🏅 Nový úspěch: {n}', achCount: 'Odemčeno {a} z {b}',
    woStart: '▶️ Spustit trénink s časovačem', getReady: 'Připravte se!', roundW: 'Kolo {r}/{n}', exW: 'Cvik {i}/{n}', done: '✅ Hotovo', restW: 'Pauza',
    nextW: 'Další: {n}', pause: '⏸ Pauza', resume: '▶️ Dál', skip: '⏭ Další', stop: '✖ Stop', woFinished: '🎉 Trénink hotový! {m} min zapsáno.', woTooShort: 'Trénink zastaven.',
    sayRest: 'Pauza', sayDone: 'Výborně! Trénink je hotový.', paused: 'Pauza'
  },
  en: {
    mBreakfast: '🍳 Breakfast', mLunch: '🍲 Lunch', mDinner: '🍽 Dinner', mSnack: '🍎 Snack', addBtn: '+ Add',
    prot: 'Protein', fat: 'Fat', carb: 'Carbs', gU: 'g', macroTitle: '🥗 Protein · fat · carbs',
    sheetProducts: '🔎 Foods', sheetDishes: '🍲 My dishes', sheetManual: '✍️ Manual', searchPh: 'Search food…', recent: 'Recent', popular: 'Popular',
    per100: 'per 100 g', grams: 'Grams', mealW: 'Meal', add: 'Add', back: '← Back', newDish: '＋ New dish',
    noDishes: 'No dishes yet. Build your first one from ingredients!', portions: 'Portions', portionW: 'portion', dishName: 'Dish name', dishPortions: 'How many portions it makes',
    ingredients: 'Ingredients', addIng: 'Add an ingredient — start typing', total: 'Total', perPortionT: 'Per portion', saveDish: 'Save dish', saveDishAdd: 'Save & eat a portion',
    dishSaved: 'Dish saved 👨‍🍳', needName: 'Enter a name', needIng: 'Add at least one ingredient', delW: 'Delete', editW: 'Edit', builderTitle: '🍲 My own dish',
    manualName: 'Name', optMacros: 'Protein / fat / carbs, g (optional)', dbNote: 'Values are approximate, per 100 g of ready food (except items marked "dry"). Drinks per 100 ml.',
    nothingFound: 'Nothing found. Try another word or add it manually.',
    water: '💧 Water', waterN: '{n} of 8 glasses (250 ml)', steps: '👣 Steps', stepsPh: 'Steps today', stepsKcal: '≈ {k} kcal extra', saveSteps: 'Save', stepsSaved: 'Steps saved 👣',
    goalTitle: '🎯 My goal', targetW: 'Target weight, kg', setGoal: 'Save', goalLeft: 'To go: {v} kg', goalDone: '🎉 Goal reached!',
    goalEta: 'At your recent pace — around {d} (in {n} days).', goalNoEta: "Log a few days of food and I'll estimate when you'll get there.",
    goalWrongWay: "Right now you're moving away from the goal — check calories in Tips.", goalNone: 'Set a target weight to see your progress.', goalSaved: 'Goal saved 🎯',
    streak: '🔥 Streak: {n} days in a row', streak0: '🔥 Log food today to start a streak!', achTitle: '🏅 Achievements', achNew: '🏅 New achievement: {n}', achCount: '{a} of {b} unlocked',
    woStart: '▶️ Start timed workout', getReady: 'Get ready!', roundW: 'Round {r}/{n}', exW: 'Exercise {i}/{n}', done: '✅ Done', restW: 'Rest',
    nextW: 'Next: {n}', pause: '⏸ Pause', resume: '▶️ Resume', skip: '⏭ Next', stop: '✖ Stop', woFinished: '🎉 Workout done! {m} min logged.', woTooShort: 'Workout stopped.',
    sayRest: 'Rest', sayDone: 'Great job! Workout complete.', paused: 'Paused'
  }
};
Object.assign(T_ADD.uk, { petTitle: '🐾 Мій улюбленець', petNone: 'Улюбленця поки немає. Купіть його в магазині за бали — і годуйте щодня.', stageBaby: 'Малюк', stageYoung: 'Підліток', stageAdult: 'Дорослий', feedsW: 'годувань: {n}', moodHappy: '😊 Ситий і щасливий', moodOk: '🥺 Чекає на корм', moodSad: '😢 Сумує й спить — давно не їв', dogWalk: '🦮 Сьогодні 8 000+ кроків — песик у захваті від прогулянки!', growHint: 'До наступної стадії: ще {n} × 🥣', feedBtn: '🥣 Нагодувати · {n} ⭐', fedToday: '✓ Сьогодні нагодовано', treatBtn: '🦴 Смаколик · {n} ⭐', treatToday: '❤️ Смаколик уже був', fedToast: 'Ням! Улюбленець ситий 🥣', treatToast: 'Улюбленець у захваті! ❤️' });
Object.assign(T_ADD.cs, { petTitle: '🐾 Můj mazlíček', petNone: 'Zatím nemáte mazlíčka. Kupte si ho v obchodě za body — a krmte ho každý den.', stageBaby: 'Mládě', stageYoung: 'Dospívající', stageAdult: 'Dospělý', feedsW: 'krmení: {n}', moodHappy: '😊 Najedený a šťastný', moodOk: '🥺 Čeká na krmení', moodSad: '😢 Je smutný a spí — dlouho nejedl', dogWalk: '🦮 Dnes 8 000+ kroků — pejsek je z procházky nadšený!', growHint: 'Do další fáze: ještě {n} × 🥣', feedBtn: '🥣 Nakrmit · {n} ⭐', fedToday: '✓ Dnes nakrmeno', treatBtn: '🦴 Pamlsek · {n} ⭐', treatToday: '❤️ Pamlsek už byl', fedToast: 'Mňam! Mazlíček je najedený 🥣', treatToast: 'Mazlíček je nadšený! ❤️' });
Object.assign(T_ADD.en, { petTitle: '🐾 My pet', petNone: 'No pet yet. Buy one in the shop with points — then feed it every day.', stageBaby: 'Baby', stageYoung: 'Young', stageAdult: 'Grown-up', feedsW: 'fed {n} times', moodHappy: '😊 Full and happy', moodOk: '🥺 Waiting for food', moodSad: '😢 Sad and sleepy — hasn\'t eaten for a while', dogWalk: '🦮 8,000+ steps today — your dog loved the walk!', growHint: 'Next stage in {n} more feedings', feedBtn: '🥣 Feed · {n} ⭐', fedToday: '✓ Fed today', treatBtn: '🦴 Treat · {n} ⭐', treatToday: '❤️ Treat given', fedToast: 'Yum! Your pet is full 🥣', treatToast: 'Your pet loves it! ❤️' });
Object.assign(T_ADD.uk, { goalPlateau: 'З нинішніми звичками вага вийде на плато раніше, ніж досягне мети, — трохи зменште калорії або додайте руху.', qlTitle: '⚡ Швидкий запис', qlSub: 'Напишіть або надиктуйте, що з\'їли. Спершу шукаю ваші власні страви, потім базу продуктів.', qlPh: 'Напр.: борщ 400 г, 2 скибки хліба, яблуко', qlGo: 'Розібрати', qlEmpty: 'Напишіть, що ви з\'їли', qlThinking: 'Оцінюю незнайомі страви…',
  qlSrcOwn: '✓ Ваша страва — точно', qlSrcDb: '✓ З бази продуктів', qlSrcTyp: '≈ Типовий рецепт — уточніть, як готували', qlSrcAi: '≈ Оцінка ШІ — уточніть, як готували',
  qMeat: 'М\'ясо', qmNone: 'Без м\'яса', qmChicken: 'Курка', qmPork: 'Свинина / яловичина', qmRibs: 'Жирне / копчені ребра', qCook: 'Як готували', qcBoil: 'Варили', qcBake: 'Запікали', qcFry: 'Смажили',
  qOil: 'Олія / засмажка', qoLess: 'Менше', qoUsual: 'Як зазвичай', qoMore: 'Багато', qSize: 'Порція', qsSmall: 'Мала', qsNormal: 'Звичайна', qsLarge: 'Велика',
  qlTotal: 'Разом', qlAdd: '✓ Додати все', qlUnknown: 'Не знайшла: {n}. Додайте вручну або уточніть назву.',
  qlSaveHint: '💡 «{n}» записано приблизно. Збережіть свій рецепт — наступного разу буде точно.', qlMake: '👨‍🍳 Створити свій рецепт',
  micLabel: 'Надиктувати', micListen: '🎤 Слухаю…', micNo: 'Голосове введення тут не працює — натисніть 🎤 на клавіатурі телефону.', micDenied: 'Немає доступу до мікрофона. Скористайтеся 🎤 на клавіатурі телефону.', micNoSpeech: 'Нічого не почула — спробуйте ще раз.',
  tmRange: 'Ймовірний діапазон: {lo}–{hi} кг.', tmPlateau: 'Вага виходить на плато: з меншою вагою організм витрачає менше, тож для подальшого прогресу треба трохи змінити план.', tmLow: '⚠️ Це нижче здорової ваги — зменште дефіцит.',
  calHint: '🎯 Зважуйтеся раз на тиждень (вкладка «Заміри»): через 2+ тижні модель звірить прогноз із реальною вагою й підлаштує вашу норму.', calOk: '🎯 Модель звірена з вашими зважуваннями ({n} за {d} дн.) — прогноз збігається ✓',
  calMore: '🎯 Звірено з вашими зважуваннями ({n} за {d} дн.): ви худнете швидше за формулу — норму збільшено на ~{k} ккал/день.', calLess: '🎯 Звірено з вашими зважуваннями ({n} за {d} дн.): вага йде повільніше, ніж за записами — норму зменшено на ~{k} ккал/день. Можливо, частина їжі не записується.' });
Object.assign(T_ADD.cs, { goalPlateau: 'Se současnými zvyky se váha zastaví dřív, než dosáhne cíle — uberte trochu kalorií nebo přidejte pohyb.', qlTitle: '⚡ Rychlý zápis', qlSub: 'Napište nebo nadiktujte, co jste snědli. Nejdřív hledám vaše vlastní jídla, pak databázi potravin.', qlPh: 'Např.: boršč 400 g, 2 plátky chleba, jablko', qlGo: 'Rozebrat', qlEmpty: 'Napište, co jste snědli', qlThinking: 'Odhaduji neznámá jídla…',
  qlSrcOwn: '✓ Vaše jídlo — přesně', qlSrcDb: '✓ Z databáze potravin', qlSrcTyp: '≈ Typický recept — upřesněte přípravu', qlSrcAi: '≈ Odhad AI — upřesněte přípravu',
  qMeat: 'Maso', qmNone: 'Bez masa', qmChicken: 'Kuře', qmPork: 'Vepřové / hovězí', qmRibs: 'Tučné / uzená žebra', qCook: 'Příprava', qcBoil: 'Vařené', qcBake: 'Pečené', qcFry: 'Smažené',
  qOil: 'Olej / tuk', qoLess: 'Méně', qoUsual: 'Jako obvykle', qoMore: 'Hodně', qSize: 'Porce', qsSmall: 'Malá', qsNormal: 'Běžná', qsLarge: 'Velká',
  qlTotal: 'Celkem', qlAdd: '✓ Přidat vše', qlUnknown: 'Nenašla jsem: {n}. Přidejte ručně nebo upřesněte název.',
  qlSaveHint: '💡 „{n}“ je zapsáno přibližně. Uložte si vlastní recept — příště to bude přesně.', qlMake: '👨‍🍳 Vytvořit vlastní recept',
  micLabel: 'Nadiktovat', micListen: '🎤 Poslouchám…', micNo: 'Hlasové zadávání tu nefunguje — použijte 🎤 na klávesnici telefonu.', micDenied: 'Bez přístupu k mikrofonu. Použijte 🎤 na klávesnici telefonu.', micNoSpeech: 'Nic jsem neslyšela — zkuste to znovu.',
  tmRange: 'Pravděpodobné rozmezí: {lo}–{hi} kg.', tmPlateau: 'Váha se dostává na plató: s nižší váhou tělo spálí méně, takže pro další pokrok je třeba plán trochu upravit.', tmLow: '⚠️ To je pod zdravou váhou — zmenšete deficit.',
  calHint: '🎯 Važte se jednou týdně (karta „Míry“): po 2+ týdnech model porovná odhad se skutečnou váhou a upraví váš cíl.', calOk: '🎯 Model je porovnán s vaším vážením ({n} za {d} dní) — odhad sedí ✓',
  calMore: '🎯 Porovnáno s vaším vážením ({n} za {d} dní): hubnete rychleji než podle vzorce — cíl zvýšen o ~{k} kcal/den.', calLess: '🎯 Porovnáno s vaším vážením ({n} za {d} dní): váha klesá pomaleji než podle zápisů — cíl snížen o ~{k} kcal/den. Možná se část jídla nezapisuje.' });
Object.assign(T_ADD.en, { goalPlateau: 'With current habits your weight will level off before reaching the goal — trim calories a little or move more.', qlTitle: '⚡ Quick log', qlSub: 'Type or dictate what you ate. I check your own dishes first, then the food database.', qlPh: 'E.g.: borscht 400 g, 2 slices of bread, apple', qlGo: 'Break it down', qlEmpty: 'Write what you ate', qlThinking: 'Estimating unfamiliar dishes…',
  qlSrcOwn: '✓ Your dish — exact', qlSrcDb: '✓ From the food database', qlSrcTyp: '≈ Typical recipe — tell me how it was made', qlSrcAi: '≈ AI estimate — tell me how it was made',
  qMeat: 'Meat', qmNone: 'No meat', qmChicken: 'Chicken', qmPork: 'Pork / beef', qmRibs: 'Fatty / smoked ribs', qCook: 'Cooking', qcBoil: 'Boiled', qcBake: 'Baked', qcFry: 'Fried',
  qOil: 'Oil / fat', qoLess: 'Less', qoUsual: 'Usual', qoMore: 'A lot', qSize: 'Portion', qsSmall: 'Small', qsNormal: 'Normal', qsLarge: 'Large',
  qlTotal: 'Total', qlAdd: '✓ Add all', qlUnknown: 'Not found: {n}. Add it manually or try another name.',
  qlSaveHint: '💡 “{n}” was logged as an estimate. Save your own recipe — next time it will be exact.', qlMake: '👨‍🍳 Create my recipe',
  micLabel: 'Dictate', micListen: '🎤 Listening…', micNo: 'Voice input does not work here — use the 🎤 on your phone keyboard.', micDenied: 'No microphone access. Use the 🎤 on your phone keyboard.', micNoSpeech: "Didn't hear anything — try again.",
  tmRange: 'Likely range: {lo}–{hi} kg.', tmPlateau: 'Weight is levelling off: a lighter body burns less, so further progress needs a small change of plan.', tmLow: '⚠️ This is below a healthy weight — make the deficit smaller.',
  calHint: '🎯 Weigh in once a week (Measure tab): after 2+ weeks the model checks its forecast against your real weight and tunes your target.', calOk: '🎯 Model checked against your weigh-ins ({n} over {d} days) — forecast matches ✓',
  calMore: '🎯 Checked against your weigh-ins ({n} over {d} days): you lose faster than the formula says — target raised by ~{k} kcal/day.', calLess: '🎯 Checked against your weigh-ins ({n} over {d} days): weight drops slower than your logs suggest — target lowered by ~{k} kcal/day. Some food may be going unlogged.' });
Object.assign(T_ADD.uk, { lblBlocked: 'Схоже, тут вибір фото заблоковано. Відкрийте посилання на застосунок у браузері Chrome (⋮ → «Відкрити в браузері») — там кнопка працює.', lblBtn: '📷 Фото етикетки', lblTitle: 'Етикетка', lblReading: 'Читаю етикетку…', lblCheck: '✓ Розпізнано. Звірте цифри з етикеткою — їх можна виправити.', lblUnreadable: 'Не вдалося прочитати етикетку. Сфотографуйте ближче, рівно й без відблисків — або введіть цифри вручну.', lblManual: 'Розпізнавання фото працює, коли застосунок відкрито в Claude. Тут введіть цифри з етикетки вручну:',
  lblName: 'Назва', lblNamePh: 'Напр.: Йогурт полуничний', lblPer100: 'На 100 г (як на етикетці)', lblOdd: 'Калорії не сходяться з білками, жирами й вуглеводами — перевірте цифри.', lblAte: 'Скільки з\'їли', lblPortion: 'Порція', lblPack: 'Упаковка', lblSave: 'Зберегти в мої продукти', lblNeedK: 'Вкажіть калорії на 100 г', lblSaved: '«{n}» збережено — тепер його можна знайти в пошуку' });
Object.assign(T_ADD.cs, { lblBlocked: 'Zdá se, že výběr fotky je tu zablokovaný. Otevřete odkaz na aplikaci v prohlížeči Chrome (⋮ → „Otevřít v prohlížeči“) — tam tlačítko funguje.', lblBtn: '📷 Fotka etikety', lblTitle: 'Etiketa', lblReading: 'Čtu etiketu…', lblCheck: '✓ Rozpoznáno. Porovnejte čísla s etiketou — dají se opravit.', lblUnreadable: 'Etiketu se nepodařilo přečíst. Vyfoťte ji blíž, rovně a bez odlesků — nebo zadejte čísla ručně.', lblManual: 'Rozpoznání fotky funguje, když je aplikace otevřená v Claude. Tady zadejte čísla z etikety ručně:',
  lblName: 'Název', lblNamePh: 'Např.: Jahodový jogurt', lblPer100: 'Na 100 g (jak je na etiketě)', lblOdd: 'Kalorie nesedí s bílkovinami, tuky a sacharidy — zkontrolujte čísla.', lblAte: 'Kolik jste snědli', lblPortion: 'Porce', lblPack: 'Balení', lblSave: 'Uložit do mých potravin', lblNeedK: 'Zadejte kalorie na 100 g', lblSaved: '„{n}“ uloženo — teď to najdete ve vyhledávání' });
Object.assign(T_ADD.en, { lblBlocked: 'Photo picking seems blocked here. Open the app link in Chrome (⋮ → “Open in browser”) — the button works there.', lblBtn: '📷 Label photo', lblTitle: 'Nutrition label', lblReading: 'Reading the label…', lblCheck: '✓ Recognised. Check the numbers against the label — you can edit them.', lblUnreadable: "Couldn't read the label. Take a closer, straight photo without glare — or enter the numbers manually.", lblManual: 'Photo reading works when the app is opened in Claude. Enter the numbers from the label here:',
  lblName: 'Name', lblNamePh: 'E.g.: Strawberry yogurt', lblPer100: 'Per 100 g (as on the label)', lblOdd: "Calories don't add up with protein, fat and carbs — check the numbers.", lblAte: 'How much you ate', lblPortion: 'Serving', lblPack: 'Package', lblSave: 'Save to my products', lblNeedK: 'Enter calories per 100 g', lblSaved: '“{n}” saved — you can now find it in search' });
Object.assign(T_ADD.uk, { dayDone: 'Я записав усе за цей день', dayLow: '⚠️ Записано мало, тож день поки не впливає на вагу двійника. Якщо це справді все — відмітьте вище.', dayAuto: '', dayPartial: 'день неповний — у вазі не враховано',
  bFile: '💾 Зберегти у файл', bFileLoad: '📂 Відновити з файлу', bText: 'Копія текстом', bLastW: '✓ Остання копія: {d}', bNever: '⚠️ Копії ще не було — збережіть, щоб не втратити прогрес і улюбленця при зміні телефона.', bSaved: 'Копію збережено 💾', measW: 'модель · ⚖️ {w}' });
Object.assign(T_ADD.cs, { dayDone: 'Zapsal(a) jsem vše za tento den', dayLow: '⚠️ Zapsáno málo, takže den zatím neovlivňuje váhu dvojníka. Pokud je to opravdu vše — zaškrtněte výše.', dayAuto: '', dayPartial: 'neúplný den — do váhy se nepočítá',
  bFile: '💾 Uložit do souboru', bFileLoad: '📂 Obnovit ze souboru', bText: 'Záloha jako text', bLastW: '✓ Poslední záloha: {d}', bNever: '⚠️ Zatím žádná záloha — uložte ji, ať o pokrok a mazlíčka nepřijdete při změně telefonu.', bSaved: 'Záloha uložena 💾', measW: 'model · ⚖️ {w}' });
Object.assign(T_ADD.en, { dayDone: "I've logged everything for this day", dayLow: "⚠️ Very little is logged, so this day doesn't change your twin's weight yet. If that's really all — tick the box above.", dayAuto: '', dayPartial: 'incomplete day — not counted in weight',
  bFile: '💾 Save to file', bFileLoad: '📂 Restore from file', bText: 'Backup as text', bLastW: '✓ Last backup: {d}', bNever: "⚠️ No backup yet — save one so you don't lose progress and your pet when changing phones.", bSaved: 'Backup saved 💾', measW: 'model · ⚖️ {w}' });
Object.assign(T_ADD.uk, { shareTitle: '👥 Поділитися з тренером', shareSub: 'Створіть звіт про свій прогрес і надішліть його тренеру. Він відкриє його у «Режимі тренера» у своєму застосунку.', sharePeriod: 'Період', shareFood: 'Додати список їжі по днях', shareWarn: '🔒 У звіті ваша вага, заміри, харчування й тренування. Надсилайте лише людині, якій довіряєте.', shareFile: '💾 Зберегти звіт', shareCopy: '📋 Копіювати текстом', shareDone: 'Звіт готовий — надішліть його тренеру', shareLastW: '✓ Останній звіт: {d}',
  trainerTitle: '🏋️ Режим тренера', trainerSub: 'Відкрийте звіт, який вам надіслав клієнт, — побачите його двійника, графік ваги, харчування й тренування.', repOpen: '📂 Відкрити звіт клієнта', repPasteT: 'Вставити звіт текстом', repPasteGo: 'Відкрити', repBad: 'Це не звіт «Мого двійника»', repOk: 'Звіт {n} додано', noClients: 'Клієнтів поки немає.', repFrom: 'звіт {d}',
  repPeriod: 'період {a}–{b}', repModel: 'Вага (модель)', repMeasured: '⚖️ {w} кг ({d})', repGoal: 'Ціль', repLevel: 'Активність', repAch: 'досягнень: {n}', repChartNote: 'Лінія — модель, точки — реальні зважування.', repSummary: 'Підсумок за період', repEat: 'Їжа (повні дні)', repProt: 'Білок (повні дні)', repTarget: 'норма {n}', repDays: 'Повні дні', repDaysSub: 'із записом усієї їжі', repWo: 'Тренування', repWoSub: '{m} хв · усього руху {a} хв', repSteps: 'Кроки', repPerDay: 'в середньому за день', repWater: 'Вода', repGlasses: 'склянок на день', repDW: 'Зміна ваги', repByScale: 'за зважуваннями', repDWaist: 'Зміна талії', repByTape: 'за замірами', repLast14: 'Останні 14 днів', repFoods: 'Їжа по днях', repNote: 'Нотатка тренера', repNotePh: 'Що порадити, на що звернути увагу… (бачите лише ви)', repDel: 'Видалити клієнта' });
Object.assign(T_ADD.cs, { shareTitle: '👥 Sdílet s trenérem', shareSub: 'Vytvořte zprávu o svém pokroku a pošlete ji trenérovi. Otevře ji v „Režimu trenéra“ ve své aplikaci.', sharePeriod: 'Období', shareFood: 'Přidat seznam jídel po dnech', shareWarn: '🔒 Zpráva obsahuje vaši váhu, míry, jídlo a tréninky. Posílejte ji jen člověku, kterému věříte.', shareFile: '💾 Uložit zprávu', shareCopy: '📋 Kopírovat jako text', shareDone: 'Zpráva je hotová — pošlete ji trenérovi', shareLastW: '✓ Poslední zpráva: {d}',
  trainerTitle: '🏋️ Režim trenéra', trainerSub: 'Otevřete zprávu, kterou vám poslal klient — uvidíte jeho dvojníka, graf váhy, jídlo a tréninky.', repOpen: '📂 Otevřít zprávu klienta', repPasteT: 'Vložit zprávu jako text', repPasteGo: 'Otevřít', repBad: 'Tohle není zpráva z aplikace Můj dvojník', repOk: 'Zpráva {n} přidána', noClients: 'Zatím žádní klienti.', repFrom: 'zpráva {d}',
  repPeriod: 'období {a}–{b}', repModel: 'Váha (model)', repMeasured: '⚖️ {w} kg ({d})', repGoal: 'Cíl', repLevel: 'Aktivita', repAch: 'úspěchů: {n}', repChartNote: 'Čára — model, body — skutečná vážení.', repSummary: 'Shrnutí za období', repEat: 'Jídlo (úplné dny)', repProt: 'Bílkoviny (úplné dny)', repTarget: 'cíl {n}', repDays: 'Úplné dny', repDaysSub: 'se zapsaným veškerým jídlem', repWo: 'Tréninky', repWoSub: '{m} min · celkem pohybu {a} min', repSteps: 'Kroky', repPerDay: 'průměrně za den', repWater: 'Voda', repGlasses: 'sklenic za den', repDW: 'Změna váhy', repByScale: 'podle vážení', repDWaist: 'Změna pasu', repByTape: 'podle měření', repLast14: 'Posledních 14 dní', repFoods: 'Jídlo po dnech', repNote: 'Poznámka trenéra', repNotePh: 'Co doporučit, na co se zaměřit… (vidíte jen vy)', repDel: 'Smazat klienta' });
Object.assign(T_ADD.en, { shareTitle: '👥 Share with a trainer', shareSub: 'Create a progress report and send it to your trainer. They open it in “Trainer mode” in their app.', sharePeriod: 'Period', shareFood: 'Include the food list by day', shareWarn: '🔒 The report contains your weight, measurements, food and workouts. Send it only to someone you trust.', shareFile: '💾 Save report', shareCopy: '📋 Copy as text', shareDone: 'Report ready — send it to your trainer', shareLastW: '✓ Last report: {d}',
  trainerTitle: '🏋️ Trainer mode', trainerSub: "Open a report a client sent you — you'll see their twin, weight chart, food and workouts.", repOpen: '📂 Open client report', repPasteT: 'Paste a report as text', repPasteGo: 'Open', repBad: "This isn't a My Twin report", repOk: 'Report from {n} added', noClients: 'No clients yet.', repFrom: 'report {d}',
  repPeriod: 'period {a}–{b}', repModel: 'Weight (model)', repMeasured: '⚖️ {w} kg ({d})', repGoal: 'Goal', repLevel: 'Activity', repAch: '{n} achievements', repChartNote: 'Line — model, dots — real weigh-ins.', repSummary: 'Period summary', repEat: 'Food (full days)', repProt: 'Protein (full days)', repTarget: 'target {n}', repDays: 'Full days', repDaysSub: 'with all food logged', repWo: 'Workouts', repWoSub: '{m} min · all activity {a} min', repSteps: 'Steps', repPerDay: 'daily average', repWater: 'Water', repGlasses: 'glasses a day', repDW: 'Weight change', repByScale: 'by weigh-ins', repDWaist: 'Waist change', repByTape: 'by tape', repLast14: 'Last 14 days', repFoods: 'Food by day', repNote: 'Trainer note', repNotePh: 'Advice, things to watch… (only you see this)', repDel: 'Remove client' });
T_ADD.uk.tapHint = '👋 Торкніться мене'; T_ADD.cs.tapHint = '👋 Klepněte na mě'; T_ADD.en.tapHint = '👋 Tap me';
T_ADD.uk.hello = 'Привіт{n}! 👋'; T_ADD.cs.hello = 'Ahoj{n}! 👋'; T_ADD.en.hello = 'Hi{n}! 👋';
Object.assign(T_ADD.uk, { pointsTitle: '⭐ Бали й рівень', levelW: 'Рівень {n}', lvlShort: 'рів. {n}', toNext: 'До рівня {n}: ще {x} ⭐', todayPts: 'Сьогодні зароблено: +{n} ⭐', shopBtn: '🛍 Магазин',
  questsTitle: '📋 Завдання на сьогодні', questToast: '✅ Завдання виконано: {n} · +10 ⭐', allQuests: '🎉 Усі три завдання виконано! +15 ⭐ бонус', lvlUp: '🆙 Новий рівень {n}: {t}!', howTitle: 'Як заробляти бали',
  howPts: 'Бали даються за дії: +3 за кожен прийом їжі (+5, якщо записали сніданок, обід і вечерю), +1 за склянку води, +20 за тренування, +5 / +10 за 5 / 10 тис. кроків, +10 за заміри (раз на тиждень), +10 за кожне завдання дня (+15, якщо всі три), +30 за кожні 7 днів серії. За саму вагу балів немає, щоб нікого не підштовхувати до голодування.',
  shopTitle: '🛍 Магазин', catHat: 'Шапки', catEyes: 'Окуляри', catShoes: 'Взуття', catAcc: 'Аксесуари', catBg: 'Фони', catPet: 'Улюбленці', buy: 'Купити', equip: 'Обрати', unequip: 'Зняти',
  lockedLvl: '🔒 Рівень {n}', notEnough: 'Не вистачає {n} ⭐', bought: 'Куплено: {n} 🎉', balanceW: 'Баланс: {n} ⭐', tryHint: 'Торкніться речі, щоб приміряти' });
Object.assign(T_ADD.cs, { pointsTitle: '⭐ Body a úroveň', levelW: 'Úroveň {n}', lvlShort: 'úr. {n}', toNext: 'Do úrovně {n}: ještě {x} ⭐', todayPts: 'Dnes získáno: +{n} ⭐', shopBtn: '🛍 Obchod',
  questsTitle: '📋 Dnešní úkoly', questToast: '✅ Úkol splněn: {n} · +10 ⭐', allQuests: '🎉 Všechny tři úkoly splněny! Bonus +15 ⭐', lvlUp: '🆙 Nová úroveň {n}: {t}!', howTitle: 'Jak získat body',
  howPts: 'Body jsou za činy: +3 za každé jídlo (+5, když zapíšete snídani, oběd i večeři), +1 za sklenici vody, +20 za trénink, +5 / +10 za 5 / 10 tis. kroků, +10 za míry (jednou týdně), +10 za každý denní úkol (+15, když všechny tři), +30 za každých 7 dní série. Za samotnou váhu body nejsou, aby to nikoho nenutilo hladovět.',
  shopTitle: '🛍 Obchod', catHat: 'Čepice', catEyes: 'Brýle', catShoes: 'Boty', catAcc: 'Doplňky', catBg: 'Pozadí', catPet: 'Mazlíčci', buy: 'Koupit', equip: 'Vybrat', unequip: 'Sundat',
  lockedLvl: '🔒 Úroveň {n}', notEnough: 'Chybí {n} ⭐', bought: 'Koupeno: {n} 🎉', balanceW: 'Zůstatek: {n} ⭐', tryHint: 'Klepnutím si věc vyzkoušíte' });
Object.assign(T_ADD.en, { pointsTitle: '⭐ Points & level', levelW: 'Level {n}', lvlShort: 'lvl {n}', toNext: 'To level {n}: {x} ⭐ more', todayPts: 'Earned today: +{n} ⭐', shopBtn: '🛍 Shop',
  questsTitle: "📋 Today's quests", questToast: '✅ Quest done: {n} · +10 ⭐', allQuests: '🎉 All three quests done! +15 ⭐ bonus', lvlUp: '🆙 New level {n}: {t}!', howTitle: 'How to earn points',
  howPts: 'Points come from actions: +3 per meal logged (+5 if you log breakfast, lunch and dinner), +1 per glass of water, +20 for a workout, +5 / +10 for 5k / 10k steps, +10 for measurements (once a week), +10 per daily quest (+15 if all three), +30 for every 7-day streak. Weight itself earns nothing, so nobody is pushed to starve.',
  shopTitle: '🛍 Shop', catHat: 'Hats', catEyes: 'Glasses', catShoes: 'Shoes', catAcc: 'Accessories', catBg: 'Backgrounds', catPet: 'Pets', buy: 'Buy', equip: 'Use', unequip: 'Take off',
  lockedLvl: '🔒 Level {n}', notEnough: 'You need {n} ⭐ more', bought: 'Bought: {n} 🎉', balanceW: 'Balance: {n} ⭐', tryHint: 'Tap an item to try it on' });
Object.assign(T_ADD.uk, { coachTitle: '🤖 ШІ-тренер', coachSub: 'Питайте про вправи й техніку, план тренувань, харчування та відновлення. Відповіді враховують ваші дані.', coachOpen: '💬 Запитати тренера', coachClear: 'Очистити',
  chatPh: 'Ваше питання…', coachNote: 'ШІ може помилятися. Це не медична порада: при болю, травмі чи хворобі зверніться до лікаря.', coachOff: 'ℹ️ ШІ-тренер працює, коли додаток відкрито в Claude. У файлі в Chrome він недоступний.',
  coachHello: 'Привіт! Я ваш тренер 💪 Питайте про вправи, техніку, план тренувань чи харчування.', coachErr: 'Не вдалося отримати відповідь. Спробуйте ще раз трохи пізніше.', coachBusy: 'Забагато запитів поспіль — зачекайте хвилинку.', thinking: 'Думаю…',
  q1: 'Як правильно присідати?', q2: 'Що їсти після тренування?', q3: 'Скільки білка мені треба?', q4: 'Як прибрати живіт?', q5: 'Склади план тренувань на тиждень' });
Object.assign(T_ADD.uk, { noPtsLate: 'без балів (запис заднім числом)', lateNote: 'ℹ️ Це минулий день: записи збережуться й врахуються у вазі, але бали за них не нараховуються.', ptsRules: 'Максимум 100 ⭐ на день, тож за день можна піднятися не більше ніж на один рівень. Бали дають лише за записи того ж або наступного дня — заднім числом не нараховуються.', eyesL: 'Колір очей', shirtStyle: 'Верх', pantsL: 'Низ', ssTshirt: 'Футболка', ssTank: 'Майка', ssPolo: 'Поло', ssLong: 'Лонгслів', ssHoodie: 'Худі', ssJersey: 'Спортивна джерсі',
  ptShorts: 'Шорти', ptJoggers: 'Спортивні штани', ptJeans: 'Джинси', hsSide: 'З проділом', hsCurly: 'Кучеряве', hsAfro: 'Афро', hsPony: 'Хвіст', hsBun: 'Пучок', hsMohawk: 'Ірокез', shirt: 'Колір одягу' });
Object.assign(T_ADD.cs, { coachTitle: '🤖 AI trenér', coachSub: 'Ptejte se na cviky a techniku, tréninkový plán, jídlo a regeneraci. Odpovědi berou ohled na vaše údaje.', coachOpen: '💬 Zeptat se trenéra', coachClear: 'Vymazat',
  chatPh: 'Vaše otázka…', coachNote: 'AI se může mýlit. Nejde o lékařskou radu: při bolesti, zranění či nemoci jděte k lékaři.', coachOff: 'ℹ️ AI trenér funguje, když je aplikace otevřená v Claude. V souboru v Chrome není dostupný.',
  coachHello: 'Ahoj! Jsem váš trenér 💪 Ptejte se na cviky, techniku, tréninkový plán nebo jídlo.', coachErr: 'Odpověď se nepodařilo získat. Zkuste to za chvíli znovu.', coachBusy: 'Příliš mnoho dotazů za sebou — chvilku počkejte.', thinking: 'Přemýšlím…',
  q1: 'Jak správně dělat dřepy?', q2: 'Co jíst po tréninku?', q3: 'Kolik bílkovin potřebuju?', q4: 'Jak se zbavit bříška?', q5: 'Sestav mi tréninkový plán na týden' });
Object.assign(T_ADD.cs, { noPtsLate: 'bez bodů (zápis zpětně)', lateNote: 'ℹ️ Tohle je minulý den: zápisy se uloží a započtou do váhy, ale body za ně nejsou.', ptsRules: 'Maximálně 100 ⭐ za den, takže za den lze postoupit nejvýš o jednu úroveň. Body jsou jen za zápisy ze stejného nebo následujícího dne — zpětně se nepřičítají.', eyesL: 'Barva očí', shirtStyle: 'Vršek', pantsL: 'Spodek', ssTshirt: 'Tričko', ssTank: 'Tílko', ssPolo: 'Polokošile', ssLong: 'Triko s dlouhým rukávem', ssHoodie: 'Mikina s kapucí', ssJersey: 'Sportovní dres',
  ptShorts: 'Kraťasy', ptJoggers: 'Tepláky', ptJeans: 'Džíny', hsSide: 'S pěšinkou', hsCurly: 'Kudrnaté', hsAfro: 'Afro', hsPony: 'Culík', hsBun: 'Drdol', hsMohawk: 'Čírka', shirt: 'Barva oblečení' });
Object.assign(T_ADD.en, { coachTitle: '🤖 AI coach', coachSub: 'Ask about exercises and technique, training plans, nutrition and recovery. Answers take your data into account.', coachOpen: '💬 Ask the coach', coachClear: 'Clear',
  chatPh: 'Your question…', coachNote: "AI can make mistakes. This isn't medical advice: for pain, injury or illness, see a doctor.", coachOff: 'ℹ️ The AI coach works when the app is opened in Claude. It is not available in the file opened in Chrome.',
  coachHello: "Hi! I'm your coach 💪 Ask me about exercises, technique, a training plan or nutrition.", coachErr: "Couldn't get an answer. Try again in a moment.", coachBusy: 'Too many questions in a row — wait a minute.', thinking: 'Thinking…',
  q1: 'How do I squat correctly?', q2: 'What should I eat after a workout?', q3: 'How much protein do I need?', q4: 'How do I lose belly fat?', q5: 'Make me a weekly workout plan' });
Object.assign(T_ADD.en, { noPtsLate: 'no points (logged late)', lateNote: 'ℹ️ This is a past day: entries are saved and count toward your weight, but they earn no points.', ptsRules: 'At most 100 ⭐ per day, so you can rise at most one level a day. Points only come from entries made the same or the next day — nothing is awarded for back-filling.', eyesL: 'Eye colour', shirtStyle: 'Top', pantsL: 'Bottoms', ssTshirt: 'T-shirt', ssTank: 'Tank top', ssPolo: 'Polo', ssLong: 'Long sleeve', ssHoodie: 'Hoodie', ssJersey: 'Sports jersey',
  ptShorts: 'Shorts', ptJoggers: 'Joggers', ptJeans: 'Jeans', hsSide: 'Side part', hsCurly: 'Curly', hsAfro: 'Afro', hsPony: 'Ponytail', hsBun: 'Bun', hsMohawk: 'Mohawk', shirt: 'Clothes colour' });
Object.assign(T_ADD.uk, { themeTitle: '🎨 Колір тла', thLight: 'Світле', thBlue: 'Блакитне', thMint: 'Мʼятне', thLavender: 'Лавандове', thPeach: 'Персикове', thPink: 'Рожеве', thSand: 'Пісочне', thGray: 'Сіре', thDark: 'Темне', thBlack: 'Чорне', thCustom: 'Свій колір', thNow: 'Зараз: {n}. Натисніть 🌈, щоб вибрати будь-який відтінок.' });
Object.assign(T_ADD.cs, { themeTitle: '🎨 Barva pozadí', thLight: 'Světlá', thBlue: 'Modrá', thMint: 'Mátová', thLavender: 'Levandulová', thPeach: 'Broskvová', thPink: 'Růžová', thSand: 'Písková', thGray: 'Šedá', thDark: 'Tmavá', thBlack: 'Černá', thCustom: 'Vlastní barva', thNow: 'Teď: {n}. Klepněte na 🌈 a vyberte jakýkoli odstín.' });
Object.assign(T_ADD.en, { themeTitle: '🎨 Background colour', thLight: 'Light', thBlue: 'Blue', thMint: 'Mint', thLavender: 'Lavender', thPeach: 'Peach', thPink: 'Pink', thSand: 'Sand', thGray: 'Grey', thDark: 'Dark', thBlack: 'Black', thCustom: 'Your colour', thNow: 'Now: {n}. Tap 🌈 to pick any shade.' });
Object.assign(T_ADD.uk, { petSayDog: 'Гав!', petSayCat: 'Мур-р…', petSayParrot: 'Привіт!', petTapHint: '👆 Натисніть на улюбленця, і він щось зробить. Порожня мисочка — натисніть, щоб нагодувати (10 ⭐). Будиночок кличе його назовні або відправляє додому. Уночі й коли сумує, улюбленець спить.' });
Object.assign(T_ADD.cs, { petSayDog: 'Haf!', petSayCat: 'Mňau…', petSayParrot: 'Ahoj!', petTapHint: '👆 Klepněte na mazlíčka a něco udělá. Prázdná miska — klepněte a nakrmíte ho (10 ⭐). Domeček ho zavolá ven nebo pošle domů. V noci a když je smutný, mazlíček spí.' });
Object.assign(T_ADD.en, { petSayDog: 'Woof!', petSayCat: 'Purr…', petSayParrot: 'Hello!', petTapHint: '👆 Tap your pet and it does something. Empty bowl? Tap it to feed (10 ⭐). The house calls your pet out or sends it home. At night and when it’s sad, your pet sleeps.' });
Object.assign(T_ADD.uk, { testOn: '🧪 Режим тестування увімкнено: усі речі й улюбленці відкриті безкоштовно', testOff: 'Режим тестування вимкнено', testBanner: '🧪 Режим тестування: усе відкрито безкоштовно, бали не витрачаються. Вимкнути — 5 натискань на версію внизу Профілю.' });
Object.assign(T_ADD.cs, { testOn: '🧪 Testovací režim zapnut: všechny věci a mazlíčci jsou zdarma', testOff: 'Testovací režim vypnut', testBanner: '🧪 Testovací režim: vše odemčeno zdarma, body se neutrácejí. Vypnutí — 5 klepnutí na verzi dole v Profilu.' });
Object.assign(T_ADD.en, { testOn: '🧪 Test mode on: all items and pets are unlocked for free', testOff: 'Test mode off', testBanner: '🧪 Test mode: everything is unlocked for free, no points are spent. To turn it off, tap the version at the bottom of Profile 5 times.' });
for (const l of ['uk', 'cs', 'en']) Object.assign(T[l], T_ADD[l]);
if (!AI_ON) {
  Object.assign(T.uk, { lblBtn: '🏷 Етикетка вручну', lblManual: 'Введіть цифри з етикетки:', fridgeLocal: 'ℹ️ Рецепти з вбудованого списку під ваші продукти.' });
  Object.assign(T.cs, { lblBtn: '🏷 Etiketa ručně', lblManual: 'Zadejte čísla z etikety:', fridgeLocal: 'ℹ️ Recepty z vestavěného seznamu podle vašich surovin.' });
  Object.assign(T.en, { lblBtn: '🏷 Enter a label', lblManual: 'Enter the numbers from the label:', fridgeLocal: 'ℹ️ Recipes from the built-in list, matched to your ingredients.' });
}

let LANG = 'uk';
function t(k, vars) {
  let s = (T[LANG] && T[LANG][k]) ?? T.en[k] ?? k;
  if (vars) for (const v in vars) s = s.replace('{' + v + '}', vars[v]);
  return s;
}
function applyLang() {
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i]').forEach(el => el.textContent = t(el.dataset.i));
  document.querySelectorAll('[data-ph]').forEach(el => el.placeholder = t(el.dataset.ph));
  document.title = t('app');
  $('lang').value = LANG;
}

// ================= utils =================
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, '0');
const ds = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const todayStr = () => ds(new Date());
const addDays = (s, n) => { const [y, m, d] = s.split('-').map(Number); return ds(new Date(y, m - 1, d + n)); };
const diffDays = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);
const fmtDate = s => { const [, m, d] = s.split('-'); return +d + '.' + +m + '.'; };
const fmtDay = s => t('wd')[new Date(s + 'T12:00').getDay()] + ' ' + fmtDate(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : null; };
const r1 = v => (Math.round(v * 10) / 10).toFixed(1);
const signed = (v, d) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
function toast(s) { const el = $('toast'); el.textContent = s; el.style.opacity = 1; clearTimeout(toast.tm); toast.tm = setTimeout(() => el.style.opacity = 0, 2200); }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ================= data =================
const KEY = 'dvijnyk.v1';
const SKINS = ['#f6d5b8', '#f0c29a', '#d9a273', '#b07a4f', '#7a5236'];
const HAIRS = ['#1d1a17', '#4a2e14', '#8a5a2e', '#c89b5a', '#e8d3a0', '#a33b1f', '#9a9a9a', '#eeeeee'];
const SHIRTS = ['#2f6fe0', '#16a3b8', '#2e9b52', '#a3c93a', '#ffd84d', '#ff7a3d', '#c62828', '#f2a7c3', '#7b4fd6', '#8a5a35', '#6b7280', '#22252b', '#ffffff'];
const ACTS = [
  { id: 'homeworkout', n: ['Домашнє тренування 🏠', 'Domácí trénink 🏠', 'Home workout 🏠'], met: 5, tone: 0.09 },
  { id: 'football', n: ['Футбол ⚽', 'Fotbal ⚽', 'Football ⚽'], met: 7, tone: 0.05 },
  { id: 'run', n: ['Біг 🏃', 'Běh 🏃', 'Running 🏃'], met: 9.5, tone: 0.04 },
  { id: 'gym', n: ['Силове тренування 🏋️', 'Posilovna 🏋️', 'Strength training 🏋️'], met: 5, tone: 0.1 },
  { id: 'walk', n: ['Ходьба 🚶', 'Chůze 🚶', 'Walking 🚶'], met: 3.5, tone: 0.01 },
  { id: 'bike', n: ['Велосипед 🚴', 'Kolo 🚴', 'Cycling 🚴'], met: 7, tone: 0.03 },
  { id: 'swim', n: ['Плавання 🏊', 'Plavání 🏊', 'Swimming 🏊'], met: 7, tone: 0.05 },
  { id: 'dance', n: ['Танці 💃', 'Tanec 💃', 'Dancing 💃'], met: 5, tone: 0.02 },
  { id: 'yoga', n: ['Йога / розтяжка 🧘', 'Jóga / protažení 🧘', 'Yoga / stretching 🧘'], met: 3, tone: 0.02 },
  { id: 'home', n: ['Прибирання / сад 🧹', 'Úklid / zahrada 🧹', 'Housework / garden 🧹'], met: 3.3, tone: 0.01 },
  { id: 'custom', n: ['Інше (ввести ккал)', 'Jiné (zadat kcal)', 'Other (enter kcal)'], met: 0, tone: 0.02 }
];
const FOODS = [
  [['Борщ (тарілка)', 'Boršč (talíř)', 'Borscht (bowl)'], 250], [['Вареники 6 шт', 'Pirohy 6 ks', 'Dumplings x6'], 350],
  [['Гуляш з кнедликами', 'Guláš s knedlíky', 'Goulash with dumplings'], 750], [['Свічкова', 'Svíčková', 'Svíčková'], 800],
  [['Шніцель з картоплею', 'Řízek s bramborem', 'Schnitzel with potatoes'], 850], [['Піца (шматок)', 'Pizza (kousek)', 'Pizza (slice)'], 280],
  [['Бургер', 'Burger', 'Burger'], 550], [['Картопля фрі', 'Hranolky', 'Fries'], 350], [['Сосиски 2 шт', 'Párky 2 ks', 'Sausages x2'], 300],
  [['Курка 150 г', 'Kuře 150 g', 'Chicken 150 g'], 250], [['Рис (порція)', 'Rýže (porce)', 'Rice (portion)'], 200], [['Салат', 'Salát', 'Salad'], 150],
  [['Хліб (скибка)', 'Chleba (krajíc)', 'Bread (slice)'], 80], [['Рогалик', 'Rohlík', 'Bread roll'], 120], [['Яйце', 'Vejce', 'Egg'], 75],
  [['Банан', 'Banán', 'Banana'], 105], [['Яблуко', 'Jablko', 'Apple'], 80], [['Шоколад 100 г', 'Čokoláda 100 g', 'Chocolate 100 g'], 540],
  [['Чипси 100 г', 'Chipsy 100 g', 'Crisps 100 g'], 540], [['Пиво 0,5 л', 'Pivo 0,5 l', 'Beer 0.5 l'], 215],
  [['Кава з молоком', 'Káva s mlékem', 'Coffee with milk'], 60], [['Кола 0,5 л', 'Cola 0,5 l', 'Cola 0.5 l'], 210]
];
const LI = () => ({ uk: 0, cs: 1, en: 2 }[LANG]);
const GIRTH_KEYS = ['waist', 'chest', 'shoulders', 'thigh'];
let D = { profile: null, days: {}, meas: [], lang: null };
// storage.js already picked the newest copy (localStorage or the durable mirror) and handed it over as AppStore.boot
try { let raw = window.AppStore && AppStore.boot; if (!raw) raw = localStorage.getItem(KEY); if (raw) D = Object.assign(D, JSON.parse(raw)); } catch (e) {}
// MET includes resting energy, which the daily burn already counts: only the extra (MET − 1) is added
const netMet = a => Math.max(0, a.met - 1);
// one-time fix for activities saved before: gross MET → net MET
// every record gets a stable uid: needed later to merge entries from two phones (sync in 1.2)
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const DATA_VERSION = 3;
function migrate() {
  let changed = false;
  if (!D.metNet && D.days) {
  const OLD = { homeworkout: 6, football: 7, run: 9.5, gym: 5, walk: 3.5, bike: 7, swim: 7, dance: 5, yoga: 3, home: 3.3 }, NEW = { homeworkout: 5 };
  for (const k in D.days) (D.days[k].acts || []).forEach(a => { const o = OLD[a.id]; if (o && a.k) { const n = NEW[a.id] || o; a.k = Math.round(a.k * (n - 1) / o); } });
  D.metNet = true; changed = true;
  }
  if ((D.v || 1) < DATA_VERSION) {
    for (const k in D.days || {}) { const d = D.days[k]; (d.foods || []).forEach(f => { if (!f.uid) f.uid = uid(); }); (d.acts || []).forEach(a => { if (!a.uid) a.uid = uid(); }); }
    (D.meas || []).forEach(m => { if (!m.uid) m.uid = uid(); });
  }
  if ((D.v || 1) < 3 && D.shop) {
    // v3: the gold medal left the shop — take it off; points are counted from owned items, so its price comes back
    D.shop.owned = (D.shop.owned || []).filter(id => id !== 'medal');
    if (D.shop.eq && D.shop.eq.acc === 'medal') delete D.shop.eq.acc;
  }
  if ((D.v || 1) < DATA_VERSION) { D.v = DATA_VERSION; changed = true; }
  return changed;
}
if (migrate()) { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} }
function save() {
  D.savedAt = Date.now(); let json = null;
  try { json = JSON.stringify(D); } catch (e) {}
  if (json && window.AppStore) AppStore.mirror(json);
  try { localStorage.setItem(KEY, json); } catch (e) { if (!window.AppStore && typeof toast === 'function') toast({ uk: '⚠️ Не вдалося зберегти — браузер блокує сховище', cs: '⚠️ Nepodařilo se uložit — prohlížeč blokuje úložiště', en: "⚠️ Couldn't save — the browser is blocking storage" }[LANG] || "⚠️ Couldn't save"); } }
LANG = D.lang || (/^(cs|sk)/i.test(navigator.language || '') ? 'cs' : /^(uk|ru)/i.test(navigator.language || '') ? 'uk' : 'en');
const P = () => D.profile;
const day = s => (D.days[s] = D.days[s] || { foods: [], acts: [] });
const peekDay = s => D.days[s] || { foods: [], acts: [] };
const actDef = id => ACTS.find(x => x.id === id) || ACTS[ACTS.length - 1];

// ================= food database (per 100 g; drinks per 100 ml) =================
// [id, UA, CZ, EN, kcal, protein, fat, carbs, usual portion g]
const FOOD_DB = [
  ['egg', 'Яйце', 'Vejce', 'Egg', 143, 12.6, 9.5, 0.7, 55],
  ['omelette', 'Омлет', 'Omeleta', 'Omelette', 154, 11, 12, 1, 150],
  ['chicken_breast', 'Куряче філе', 'Kuřecí prsa', 'Chicken breast', 165, 31, 3.6, 0, 150],
  ['chicken_thigh', 'Куряче стегно', 'Kuřecí stehno', 'Chicken thigh', 209, 26, 10.9, 0, 150],
  ['pork', 'Свинина', 'Vepřové maso', 'Pork', 242, 27, 14, 0, 150],
  ['beef', 'Яловичина', 'Hovězí maso', 'Beef', 250, 26, 15, 0, 150],
  ['minced', 'Фарш змішаний', 'Mleté maso', 'Minced meat', 263, 17, 21, 0, 100],
  ['sausage', 'Сосиски', 'Párky', 'Sausages', 290, 11, 26, 2, 100],
  ['salami', 'Салямі', 'Salám', 'Salami', 407, 22, 34, 1.5, 30],
  ['ham', 'Шинка', 'Šunka', 'Ham', 145, 21, 6, 1.5, 40],
  ['salo', 'Сало', 'Sádlo / špek', 'Pork fat (salo)', 770, 2.4, 89, 0, 20],
  ['bacon', 'Бекон', 'Slanina', 'Bacon', 541, 37, 42, 1.4, 30],
  ['tuna', 'Тунець консервований', 'Tuňák v konzervě', 'Canned tuna', 116, 26, 1, 0, 100],
  ['salmon', 'Лосось', 'Losos', 'Salmon', 208, 20, 13, 0, 150],
  ['cod', 'Риба біла (тріска)', 'Treska', 'Cod / white fish', 82, 18, 0.7, 0, 150],
  ['milk', 'Молоко 2,5%', 'Mléko polotučné', 'Milk (semi-skimmed)', 52, 3.3, 2.5, 4.8, 250],
  ['kefir', 'Кефір', 'Kefír', 'Kefir', 53, 3.3, 2.5, 4.5, 250],
  ['yogurt', 'Йогурт натуральний', 'Bílý jogurt', 'Plain yogurt', 63, 4.5, 3, 5, 150],
  ['greek', 'Грецький йогурт', 'Řecký jogurt', 'Greek yogurt', 97, 9, 5, 4, 150],
  ['cottage', 'Сир кисломолочний 5%', 'Tvaroh polotučný', 'Cottage cheese (5%)', 121, 17, 5, 3, 100],
  ['cheese', 'Сир твердий', 'Sýr tvrdý', 'Hard cheese', 350, 26, 27, 0.5, 30],
  ['mozzarella', 'Моцарела', 'Mozzarella', 'Mozzarella', 280, 22, 20, 2, 60],
  ['butter', 'Масло вершкове', 'Máslo', 'Butter', 717, 0.9, 81, 0.1, 10],
  ['sourcream', 'Сметана 20%', 'Zakysaná smetana', 'Sour cream', 206, 2.8, 20, 3.2, 30],
  ['rice', 'Рис варений', 'Rýže vařená', 'Rice, cooked', 130, 2.7, 0.3, 28, 200],
  ['rice_dry', 'Рис сухий', 'Rýže (suchá)', 'Rice, dry', 360, 7, 0.6, 79, 80],
  ['buckwheat', 'Гречка варена', 'Pohanka vařená', 'Buckwheat, cooked', 92, 3.4, 0.6, 20, 200],
  ['buckwheat_dry', 'Гречка суха', 'Pohanka (suchá)', 'Buckwheat, dry', 343, 13, 3.4, 72, 80],
  ['pasta', 'Макарони варені', 'Těstoviny vařené', 'Pasta, cooked', 158, 5.8, 0.9, 31, 200],
  ['pasta_dry', 'Макарони сухі', 'Těstoviny (suché)', 'Pasta, dry', 371, 13, 1.5, 75, 80],
  ['oats', 'Вівсянка суха', 'Ovesné vločky', 'Oats, dry', 379, 13, 6.5, 68, 50],
  ['bread', 'Хліб білий', 'Bílý chléb', 'White bread', 265, 9, 3.2, 49, 40],
  ['rye', 'Хліб житній', 'Žitný chléb', 'Rye bread', 259, 8.5, 3.3, 48, 40],
  ['roll', 'Булочка / рогалик', 'Rohlík', 'Bread roll', 290, 9, 4, 55, 43],
  ['potato', 'Картопля варена', 'Brambory vařené', 'Potatoes, boiled', 87, 1.9, 0.1, 20, 200],
  ['potato_raw', 'Картопля сира', 'Brambory syrové', 'Potatoes, raw', 77, 2, 0.1, 17, 200],
  ['potato_fried', 'Картопля смажена', 'Brambory opékané', 'Fried potatoes', 190, 3, 9, 25, 200],
  ['fries', 'Картопля фрі', 'Hranolky', 'French fries', 312, 3.4, 15, 41, 150],
  ['flour', 'Борошно', 'Mouka', 'Flour', 364, 10, 1, 76, 30],
  ['knedlik', 'Кнедлик', 'Houskový knedlík', 'Bread dumpling', 220, 6.5, 1.5, 45, 120],
  ['tomato', 'Помідор', 'Rajče', 'Tomato', 18, 0.9, 0.2, 3.9, 120],
  ['cucumber', 'Огірок', 'Okurka', 'Cucumber', 15, 0.7, 0.1, 3.6, 120],
  ['onion', 'Цибуля', 'Cibule', 'Onion', 40, 1.1, 0.1, 9.3, 80],
  ['carrot', 'Морква', 'Mrkev', 'Carrot', 41, 0.9, 0.2, 9.6, 80],
  ['cabbage', 'Капуста', 'Zelí', 'Cabbage', 25, 1.3, 0.1, 5.8, 100],
  ['pepper', 'Перець солодкий', 'Paprika', 'Bell pepper', 31, 1, 0.3, 6, 120],
  ['broccoli', 'Броколі', 'Brokolice', 'Broccoli', 34, 2.8, 0.4, 7, 100],
  ['mushroom', 'Печериці', 'Žampiony', 'Mushrooms', 22, 3.1, 0.3, 3.3, 100],
  ['lettuce', 'Салат листовий', 'Hlávkový salát', 'Lettuce', 15, 1.4, 0.2, 2.9, 50],
  ['beans', 'Квасоля варена', 'Fazole vařené', 'Beans, cooked', 127, 8.7, 0.5, 23, 150],
  ['corn', 'Кукурудза консервована', 'Kukuřice sterilovaná', 'Sweet corn, canned', 86, 3.3, 1.4, 19, 80],
  ['apple', 'Яблуко', 'Jablko', 'Apple', 52, 0.3, 0.2, 14, 180],
  ['banana', 'Банан', 'Banán', 'Banana', 89, 1.1, 0.3, 23, 120],
  ['orange', 'Апельсин', 'Pomeranč', 'Orange', 47, 0.9, 0.1, 12, 150],
  ['grapes', 'Виноград', 'Hroznové víno', 'Grapes', 69, 0.7, 0.2, 18, 100],
  ['strawberry', 'Полуниця', 'Jahody', 'Strawberries', 32, 0.7, 0.3, 7.7, 150],
  ['walnut', 'Волоські горіхи', 'Vlašské ořechy', 'Walnuts', 654, 15, 65, 14, 30],
  ['peanutbutter', 'Арахісова паста', 'Arašídové máslo', 'Peanut butter', 588, 25, 50, 20, 15],
  ['chocolate', 'Шоколад молочний', 'Mléčná čokoláda', 'Milk chocolate', 535, 7.7, 30, 59, 25],
  ['darkchoc', 'Шоколад чорний', 'Hořká čokoláda', 'Dark chocolate', 598, 7.8, 43, 46, 25],
  ['chips', 'Чипси', 'Chipsy', 'Crisps / chips', 536, 7, 35, 53, 50],
  ['biscuits', 'Печиво', 'Sušenky', 'Biscuits', 480, 6, 20, 70, 30],
  ['icecream', 'Морозиво', 'Zmrzlina', 'Ice cream', 207, 3.5, 11, 24, 100],
  ['sugar', 'Цукор', 'Cukr', 'Sugar', 387, 0, 0, 100, 5],
  ['honey', 'Мед', 'Med', 'Honey', 304, 0.3, 0, 82, 10],
  ['oil', 'Олія', 'Olej', 'Oil', 884, 0, 100, 0, 10],
  ['mayo', 'Майонез', 'Majonéza', 'Mayonnaise', 680, 1, 75, 0.6, 15],
  ['ketchup', 'Кетчуп', 'Kečup', 'Ketchup', 112, 1.7, 0.1, 26, 20],
  ['beer', 'Пиво', 'Pivo', 'Beer', 43, 0.5, 0, 3.6, 500],
  ['cola', 'Кола', 'Cola', 'Cola', 42, 0, 0, 10.6, 500],
  ['juice', 'Сік апельсиновий', 'Pomerančový džus', 'Orange juice', 45, 0.7, 0.2, 10, 250],
  ['wine', 'Вино', 'Víno', 'Wine', 83, 0.1, 0, 2.6, 150],
  ['coffee_milk', 'Кава з молоком', 'Káva s mlékem', 'Coffee with milk', 25, 1.3, 1, 2.5, 250],
  ['borscht', 'Борщ', 'Boršč', 'Borscht', 50, 1.8, 2.5, 5, 350],
  ['varenyky', 'Вареники з картоплею', 'Pirohy s bramborem', 'Potato dumplings (varenyky)', 200, 5, 4, 36, 250],
  ['syrnyky', 'Сирники', 'Tvarohové lívance', 'Cottage cheese pancakes', 220, 13, 10, 19, 150],
  ['goulash', 'Гуляш', 'Guláš', 'Goulash', 140, 12, 8, 5, 250],
  ['svickova', 'Свічкова з м\'ясом', 'Svíčková na smetaně', 'Svíčková (beef in cream sauce)', 160, 10, 9, 9, 300],
  ['schnitzel', 'Шніцель', 'Řízek', 'Schnitzel', 250, 17, 13, 15, 150],
  ['pizza', 'Піца', 'Pizza', 'Pizza', 266, 11, 10, 33, 120],
  ['burger', 'Бургер', 'Burger', 'Burger', 255, 13, 12, 24, 220],
  ['potato_salad', 'Картопляний салат / олів\'є', 'Bramborový salát', 'Potato salad', 180, 4, 13, 12, 200],
  ['chicken_soup', 'Курячий суп з локшиною', 'Kuřecí vývar s nudlemi', 'Chicken noodle soup', 45, 3, 1.5, 5, 350],
  ['pancakes', 'Млинці', 'Palačinky', 'Pancakes', 227, 6, 9, 30, 120],
  ['oatmeal_milk', 'Вівсянка на молоці', 'Ovesná kaše s mlékem', 'Oatmeal with milk', 105, 4, 3, 15, 300],
  ['kebab', 'Шаурма / кебаб', 'Kebab', 'Kebab wrap', 215, 11, 10, 20, 350],
  ['pelmeni', 'Пельмені', 'Pelmeně', 'Pelmeni', 245, 11, 12, 23, 250], ['plov', 'Плов', 'Pilaf (plov)', 'Pilaf (plov)', 170, 7, 7, 20, 300],
  ['holubtsi', 'Голубці', 'Holubce (plněné zelí)', 'Cabbage rolls', 130, 7, 6, 12, 300], ['deruny', 'Деруни', 'Bramboráky', 'Potato pancakes', 240, 4, 14, 25, 200],
  ['veg_salad', 'Салат овочевий з олією', 'Zeleninový salát s olejem', 'Vegetable salad with oil', 80, 1, 6, 5, 200],
  ['pasta_sauce', 'Паста з соусом', 'Těstoviny s omáčkou', 'Pasta with sauce', 160, 6, 5, 22, 300], ['cutlet', 'Котлета', 'Karbanátek', 'Meat patty', 240, 15, 17, 8, 120],
  ['veg_soup', 'Суп овочевий', 'Zeleninová polévka', 'Vegetable soup', 40, 1.5, 1.5, 5, 350], ['sandwich', 'Бутерброд', 'Chlebíček / sendvič', 'Sandwich', 250, 10, 11, 27, 150],
  ['porridge', 'Каша з маслом', 'Kaše s máslem', 'Porridge with butter', 130, 3.5, 4, 20, 250], ['mashed', 'Картопляне пюре', 'Bramborová kaše', 'Mashed potatoes', 105, 2, 4, 15, 250]
];
// ---- more foods (v2): typical values per 100 g / 100 ml — [id, uk, cs, en, kcal, protein, fat, carbs, typical portion g]
// Averages from common nutrition tables (USDA, Czech/Ukrainian product labels); packaged products vary by brand.
FOOD_DB.push(
  // bread & bakery
  ['toast', 'Хліб тостовий', 'Toustový chléb', 'Toast bread', 265, 8.5, 3.5, 49, 25],
  ['wholegrain', 'Хліб цільнозерновий', 'Celozrnný chléb', 'Wholegrain bread', 247, 10, 3.4, 41, 35],
  ['baguette', 'Батон / багет', 'Veka / bageta', 'Baguette / white loaf', 270, 8.5, 2.5, 52, 30],
  ['lavash', 'Лаваш / тортилья', 'Tortilla / placka', 'Flatbread / tortilla', 300, 8, 6, 52, 60],
  ['crispbread', 'Хлібці', 'Křehký chléb', 'Crispbread', 370, 10, 3, 72, 10],
  ['crackers', 'Крекер', 'Krekry', 'Crackers', 440, 9, 15, 68, 30],
  ['croissant', 'Круасан', 'Croissant', 'Croissant', 406, 8, 21, 45, 60],
  ['bun_sweet', 'Булочка солодка', 'Buchta', 'Sweet bun', 330, 7, 9, 54, 80],
  ['donut', 'Пончик', 'Kobliha', 'Doughnut', 400, 6, 22, 45, 70],
  ['kolac', 'Пиріжок солодкий', 'Koláč', 'Sweet pastry (koláč)', 330, 7, 12, 50, 70],
  ['pie_savory', 'Пиріжок з капустою / картоплею', 'Plněná taštička', 'Savory pie (cabbage / potato)', 250, 6, 10, 34, 80],
  ['langos', 'Лангош', 'Langoš', 'Langos (fried flatbread)', 330, 7, 15, 42, 200],
  // spreads
  ['spread', 'Намазка', 'Pomazánka', 'Sandwich spread', 250, 7, 21, 6, 20],
  ['pate', 'Паштет', 'Paštika', 'Pâté', 300, 12, 27, 3, 30],
  ['hummus', 'Хумус', 'Hummus', 'Hummus', 170, 8, 10, 14, 30],
  ['cream_cheese', 'Вершковий сир', 'Žervé / Lučina', 'Cream cheese', 250, 6, 23, 4, 30],
  ['butter_spread', 'Масляна намазка', 'Pomazánkové máslo', 'Butter spread', 230, 6, 21, 4, 20],
  ['margarine', 'Маргарин', 'Margarín', 'Margarine', 530, 0.2, 59, 0.5, 10],
  ['jam', 'Варення / джем', 'Džem / marmeláda', 'Jam', 250, 0.4, 0.1, 62, 20],
  ['choc_spread', 'Шоколадна паста', 'Čokoládová pomazánka', 'Chocolate spread', 540, 6, 31, 57, 20],
  ['processed_cheese', 'Сир плавлений', 'Tavený sýr', 'Processed cheese', 280, 13, 23, 5, 30],
  // dairy
  ['milk_low', 'Молоко 1,5%', 'Mléko polotučné 1,5%', 'Milk 1.5%', 46, 3.3, 1.5, 4.8, 250],
  ['milk_full', 'Молоко 3,5%', 'Mléko plnotučné 3,5%', 'Whole milk 3.5%', 64, 3.3, 3.5, 4.8, 250],
  ['cream', 'Вершки 10%', 'Smetana do kávy 10%', 'Cream 10%', 118, 3, 10, 4, 20],
  ['feta', 'Бринза / фета', 'Balkánský sýr / feta', 'Feta / brynza', 260, 15, 21, 1, 50],
  ['parmesan', 'Пармезан', 'Parmazán', 'Parmesan', 392, 36, 26, 3, 10],
  ['cottage_fat', 'Сир кисломолочний 9%', 'Tvaroh tučný', 'Cottage cheese 9%', 159, 16.7, 9, 2, 150],
  ['cottage_low', 'Сир кисломолочний знежирений', 'Tvaroh netučný', 'Fat-free cottage cheese', 75, 13, 0.5, 4, 150],
  ['yogurt_fruit', 'Йогурт фруктовий', 'Ovocný jogurt', 'Fruit yogurt', 95, 3.5, 2.5, 15, 150],
  ['curd_bar', 'Сирок глазурований', 'Tvarohová tyčinka v čokoládě', 'Glazed curd bar', 410, 8, 26, 36, 45],
  // meat & fish
  ['turkey', 'Індичка (філе)', 'Krůtí prsa', 'Turkey breast', 135, 29, 2, 0, 150],
  ['duck', 'Качка', 'Kachna', 'Duck', 337, 19, 28, 0, 200],
  ['liver', 'Печінка куряча', 'Kuřecí játra', 'Chicken liver', 165, 24, 6.5, 1, 120],
  ['wings', 'Курячі крильця', 'Kuřecí křídla', 'Chicken wings', 255, 24, 17, 0, 200],
  ['chicken_roast', 'Курка запечена', 'Pečené kuře', 'Roast chicken', 215, 25, 13, 0, 200],
  ['bologna', 'Ковбаса варена', 'Šunkový salám', 'Bologna sausage', 260, 12, 23, 2, 50],
  ['spekacky', 'Сардельки', 'Špekáčky', 'Frankfurters', 300, 12, 27, 2, 100],
  ['smoked_sausage', 'Ковбаса копчена', 'Klobása', 'Smoked sausage', 400, 16, 37, 1, 80],
  ['herring', 'Оселедець', 'Sleď', 'Herring', 217, 17, 16, 0, 80],
  ['mackerel', 'Скумбрія', 'Makrela', 'Mackerel', 205, 19, 14, 0, 150],
  ['shrimp', 'Креветки', 'Krevety', 'Shrimp', 99, 24, 0.3, 0.2, 100],
  ['crab_sticks', 'Крабові палички', 'Krabí tyčinky', 'Crab sticks', 95, 7, 1, 15, 50],
  ['sprats', 'Шпроти', 'Šproty v oleji', 'Sprats in oil', 360, 17, 32, 0.4, 60],
  ['fish_fried', 'Риба смажена', 'Smažená ryba', 'Fried fish', 230, 18, 13, 9, 150],
  // grains & cereals
  ['bulgur', 'Булгур варений', 'Bulgur vařený', 'Bulgur, cooked', 83, 3, 0.2, 18.6, 200],
  ['couscous', 'Кускус варений', 'Kuskus vařený', 'Couscous, cooked', 112, 3.8, 0.2, 23, 200],
  ['millet', 'Пшоно варене', 'Jáhly vařené', 'Millet, cooked', 119, 3.5, 1, 23.7, 200],
  ['barley', 'Перловка варена', 'Kroupy vařené', 'Pearl barley, cooked', 123, 2.3, 0.4, 28, 200],
  ['quinoa', 'Кіноа варена', 'Quinoa vařená', 'Quinoa, cooked', 120, 4.4, 1.9, 21, 200],
  ['semolina', 'Манна каша', 'Krupicová kaše', 'Semolina porridge', 98, 3, 3, 15, 250],
  ['muesli', 'Мюслі', 'Müsli', 'Muesli', 370, 10, 6, 66, 50],
  ['granola', 'Гранола', 'Křupavé müsli', 'Granola', 450, 9, 18, 62, 50],
  ['cornflakes', 'Кукурудзяні пластівці', 'Kukuřičné lupínky', 'Cornflakes', 375, 7, 1, 84, 40],
  ['noodles_instant', 'Локшина швидкого приготування', 'Instantní nudle', 'Instant noodles', 450, 9, 18, 62, 70],
  // vegetables & legumes
  ['beet', 'Буряк варений', 'Červená řepa', 'Beetroot, cooked', 44, 1.7, 0.2, 10, 100],
  ['zucchini', 'Кабачок', 'Cuketa', 'Zucchini', 17, 1.2, 0.3, 3.1, 150],
  ['eggplant', 'Баклажан', 'Lilek', 'Eggplant', 25, 1, 0.2, 6, 150],
  ['cauliflower', 'Цвітна капуста', 'Květák', 'Cauliflower', 25, 1.9, 0.3, 5, 150],
  ['spinach', 'Шпинат', 'Špenát', 'Spinach', 23, 2.9, 0.4, 3.6, 100],
  ['peas', 'Горошок зелений', 'Hrášek', 'Green peas', 81, 5.4, 0.4, 14, 100],
  ['pumpkin', 'Гарбуз', 'Dýně', 'Pumpkin', 26, 1, 0.1, 6.5, 150],
  ['garlic', 'Часник', 'Česnek', 'Garlic', 149, 6.4, 0.5, 33, 5],
  ['avocado', 'Авокадо', 'Avokádo', 'Avocado', 160, 2, 15, 9, 100],
  ['radish', 'Редиска', 'Ředkvičky', 'Radish', 16, 0.7, 0.1, 3.4, 50],
  ['sauerkraut', 'Квашена капуста', 'Kysané zelí', 'Sauerkraut', 19, 0.9, 0.1, 4.3, 150],
  ['pickles', 'Огірки солоні', 'Kyselé okurky', 'Pickles', 12, 0.5, 0.2, 2.3, 60],
  ['olives', 'Оливки', 'Olivy', 'Olives', 145, 1, 15, 4, 30],
  ['lentils', 'Сочевиця варена', 'Čočka vařená', 'Lentils, cooked', 116, 9, 0.4, 20, 200],
  ['chickpeas', 'Нут варений', 'Cizrna vařená', 'Chickpeas, cooked', 164, 8.9, 2.6, 27, 150],
  // fruit & berries
  ['pear', 'Груша', 'Hruška', 'Pear', 57, 0.4, 0.1, 15, 170],
  ['plum', 'Слива', 'Švestka', 'Plum', 46, 0.7, 0.3, 11, 150],
  ['peach', 'Персик', 'Broskev', 'Peach', 39, 0.9, 0.3, 10, 150],
  ['apricot', 'Абрикос', 'Meruňka', 'Apricot', 48, 1.4, 0.4, 11, 150],
  ['kiwi', 'Ківі', 'Kiwi', 'Kiwi', 61, 1.1, 0.5, 15, 75],
  ['mandarin', 'Мандарин', 'Mandarinka', 'Mandarin', 53, 0.8, 0.3, 13, 80],
  ['watermelon', 'Кавун', 'Meloun vodní', 'Watermelon', 30, 0.6, 0.2, 7.6, 300],
  ['melon', 'Диня', 'Meloun cukrový', 'Melon', 34, 0.8, 0.2, 8, 300],
  ['sour_cherry', 'Вишня', 'Višně', 'Sour cherries', 50, 1, 0.3, 12, 150],
  ['cherry', 'Черешня', 'Třešně', 'Sweet cherries', 63, 1.1, 0.2, 16, 150],
  ['raspberry', 'Малина', 'Maliny', 'Raspberries', 52, 1.2, 0.7, 12, 125],
  ['blueberry', 'Чорниця / лохина', 'Borůvky', 'Blueberries', 57, 0.7, 0.3, 14, 125],
  ['lemon', 'Лимон', 'Citron', 'Lemon', 29, 1.1, 0.3, 9, 60],
  ['grapefruit', 'Грейпфрут', 'Grapefruit', 'Grapefruit', 42, 0.8, 0.1, 11, 250],
  ['pineapple', 'Ананас', 'Ananas', 'Pineapple', 50, 0.5, 0.1, 13, 150],
  ['mango', 'Манго', 'Mango', 'Mango', 60, 0.8, 0.4, 15, 200],
  ['persimmon', 'Хурма', 'Kaki', 'Persimmon', 70, 0.6, 0.2, 18.6, 170],
  ['pomegranate', 'Гранат', 'Granátové jablko', 'Pomegranate', 83, 1.7, 1.2, 19, 150],
  ['raisins', 'Родзинки', 'Rozinky', 'Raisins', 299, 3.1, 0.5, 79, 30],
  ['dried_apricots', 'Курага', 'Sušené meruňky', 'Dried apricots', 241, 3.4, 0.5, 63, 30],
  ['dates', 'Фініки', 'Datle', 'Dates', 282, 2.5, 0.4, 75, 30],
  // nuts & seeds
  ['almonds', 'Мигдаль', 'Mandle', 'Almonds', 579, 21, 50, 22, 30],
  ['hazelnuts', 'Фундук', 'Lískové ořechy', 'Hazelnuts', 628, 15, 61, 17, 30],
  ['cashew', 'Кешʼю', 'Kešu', 'Cashews', 553, 18, 44, 30, 30],
  ['peanuts', 'Арахіс', 'Arašídy', 'Peanuts', 567, 26, 49, 16, 30],
  ['sunflower_seeds', 'Насіння соняшника', 'Slunečnicová semínka', 'Sunflower seeds', 584, 21, 51, 20, 30],
  ['pumpkin_seeds', 'Гарбузове насіння', 'Dýňová semínka', 'Pumpkin seeds', 559, 30, 49, 11, 30],
  // sweets & snacks
  ['cake', 'Торт', 'Dort', 'Cake', 370, 5, 20, 43, 120],
  ['pastry', 'Тістечко', 'Zákusek', 'Pastry', 380, 5, 21, 43, 80],
  ['wafers', 'Вафлі', 'Oplatky', 'Wafers', 520, 6, 28, 62, 30],
  ['candy', 'Цукерки шоколадні', 'Bonbony', 'Chocolate candies', 520, 5, 29, 60, 15],
  ['zefir', 'Зефір', 'Pěnové cukroví', 'Marshmallow (zefir)', 326, 0.8, 0, 80, 30],
  ['halva', 'Халва', 'Chalva', 'Halva', 520, 12, 30, 54, 30],
  ['gummies', 'Мармелад', 'Želé bonbony', 'Gummy sweets', 320, 0.1, 0.1, 79, 30],
  ['choc_bar', 'Шоколадний батончик', 'Čokoládová tyčinka', 'Chocolate bar', 490, 7, 24, 60, 50],
  ['protein_bar', 'Протеїновий батончик', 'Proteinová tyčinka', 'Protein bar', 360, 30, 12, 35, 50],
  ['popcorn', 'Попкорн', 'Popcorn', 'Popcorn', 480, 8, 25, 56, 50],
  // drinks (per 100 ml)
  ['tea', 'Чай без цукру', 'Čaj neslazený', 'Tea, unsweetened', 1, 0, 0, 0.2, 250],
  ['tea_sugar', 'Чай з цукром', 'Čaj s cukrem', 'Tea with sugar', 8, 0, 0, 2, 250],
  ['coffee_black', 'Кава чорна', 'Černá káva', 'Black coffee', 2, 0.1, 0, 0, 150],
  ['cappuccino', 'Капучино', 'Cappuccino', 'Cappuccino', 40, 2, 2, 3.5, 200],
  ['latte', 'Лате', 'Latté', 'Latte', 50, 2.8, 2.5, 4, 300],
  ['cocoa', 'Какао з молоком', 'Kakao s mlékem', 'Hot cocoa', 80, 3.5, 3, 10, 250],
  ['compote', 'Компот', 'Kompot', 'Fruit compote', 50, 0.2, 0, 12, 250],
  ['kvass', 'Квас', 'Kvas', 'Kvass', 27, 0.2, 0, 5.5, 500],
  ['juice_apple', 'Сік яблучний', 'Jablečný džus', 'Apple juice', 46, 0.1, 0.1, 11, 250],
  ['lemonade', 'Лимонад', 'Limonáda', 'Lemonade (soda)', 40, 0, 0, 10, 330],
  ['kofola', 'Кофола', 'Kofola', 'Kofola', 26, 0, 0, 6.4, 500],
  ['energy', 'Енергетик', 'Energetický nápoj', 'Energy drink', 45, 0, 0, 11, 250],
  ['smoothie', 'Смузі', 'Smoothie', 'Smoothie', 60, 1, 0.5, 13, 300],
  ['milkshake', 'Молочний коктейль', 'Mléčný koktejl', 'Milkshake', 110, 3.5, 3.5, 17, 300],
  ['vodka', 'Горілка', 'Vodka / slivovice', 'Vodka', 231, 0, 0, 0, 50],
  ['cider', 'Сидр', 'Cider', 'Cider', 50, 0, 0, 5, 500],
  // ready dishes
  ['pea_soup', 'Суп гороховий', 'Hrachová polévka', 'Pea soup', 66, 4, 1.5, 9.5, 350],
  ['solyanka', 'Солянка', 'Soljanka', 'Solyanka', 70, 4, 4.5, 3, 350],
  ['okroshka', 'Окрошка', 'Okroška', 'Okroshka', 60, 3, 3, 5, 350],
  ['fish_soup', 'Юшка рибна', 'Rybí polévka', 'Fish soup', 45, 4, 1.5, 3.5, 350],
  ['potato_soup', 'Суп картопляний', 'Bramboračka', 'Potato soup', 55, 1.5, 2, 8, 350],
  ['garlic_soup', 'Часниковий суп', 'Česnečka', 'Garlic soup', 50, 2, 2.5, 6, 350],
  ['buckwheat_meat', 'Гречка з мʼясом', 'Pohanka s masem', 'Buckwheat with meat', 150, 9, 6, 15, 300],
  ['pasta_mince', 'Макарони по-флотськи', 'Těstoviny s mletým masem', 'Pasta with minced meat', 195, 9, 8, 21, 300],
  ['chicken_rice', 'Курка з рисом', 'Kuře s rýží', 'Chicken with rice', 150, 11, 4, 17, 350],
  ['stew', 'Рагу з мʼясом', 'Dušené maso se zeleninou', 'Meat and vegetable stew', 120, 9, 6, 7, 300],
  ['fried_eggs', 'Яєчня', 'Smažená vejce', 'Fried eggs', 196, 13.6, 15, 0.8, 110],
  ['oladky', 'Оладки', 'Lívance', 'Fritters (oladky)', 230, 6, 9, 31, 150],
  ['nalysnyky', 'Налисники з сиром', 'Palačinky s tvarohem', 'Crêpes with cottage cheese', 190, 9, 8, 21, 200],
  ['casserole', 'Сирна запіканка', 'Tvarohový nákyp', 'Cottage cheese bake', 170, 12, 6, 17, 200],
  ['lasagna', 'Лазанья', 'Lasagne', 'Lasagna', 150, 8, 7, 14, 300],
  ['sushi', 'Суші / роли', 'Sushi', 'Sushi rolls', 150, 5, 3, 25, 200],
  ['hotdog', 'Хот-дог', 'Párek v rohlíku', 'Hot dog', 260, 9, 14, 25, 130],
  ['nuggets', 'Нагетси', 'Kuřecí nugety', 'Chicken nuggets', 290, 15, 18, 17, 150],
  ['fried_cheese', 'Смажений сир', 'Smažený sýr', 'Fried cheese', 330, 17, 22, 15, 150],
  ['vepro_knedlo', 'Свинина з кнедликами й капустою', 'Vepřo knedlo zelo', 'Pork, dumplings and sauerkraut', 160, 8, 7, 16, 450],
  ['fruit_dumplings', 'Кнедлики з фруктами', 'Ovocné knedlíky', 'Fruit dumplings', 200, 5, 4, 36, 300],
  ['potato_baked', 'Картопля печена', 'Pečené brambory', 'Baked potatoes', 120, 2.5, 3.5, 20, 250],
  ['caesar', 'Салат Цезар', 'Caesar salát', 'Caesar salad', 150, 8, 10, 6, 250],
  ['greek_salad', 'Грецький салат', 'Řecký salát', 'Greek salad', 105, 3.5, 9, 4, 250],
  ['vinegret', 'Вінегрет', 'Vinegret (řepový salát)', 'Beet salad (vinegret)', 90, 1.5, 6, 8, 200],
  ['shuba', 'Оселедець під шубою', 'Sleď pod kožichem', 'Herring under a fur coat', 190, 6, 15, 8, 200],
  ['cheese_toast', 'Тост з сиром', 'Toast se sýrem', 'Cheese toast', 300, 12, 14, 30, 120]
);
// extra words people use for the same food (any language); searched together with the names
const FOOD_ALIAS = {
  rye: ['чорний хліб', 'бородинськ', 'černý chléb', 'brown bread', 'dark bread', 'rye bread'],
  bread: ['білий хліб', 'пшеничний хліб', 'bílý chléb', 'white bread'],
  roll: ['rohlík', 'houska'],
  spread: ['мазанка', 'намазан', 'pomazánk'],
  choc_spread: ['нутела', 'нутелла', 'nutella'],
  cream_cheese: ['філадельфія', 'philadelphia', 'lučina', 'creme bonjour'],
  cottage: ['творог', 'тварог', 'tvaroh', 'cottage'],
  cottage_fat: ['творог', 'tvaroh'],
  sausage: ['сосиска', 'párek', 'párky'],
  salo: ['шпик', 'špek'],
  cola: ['пепсі', 'pepsi', 'coca'],
  coffee_black: ['еспресо', 'американо', 'espresso', 'americano', 'кава'],
  coffee_milk: ['кава з вершками', 'flat white'],
  kebab: ['шаурма', 'шаверма', 'gyros', 'гірос', 'durum'],
  sushi: ['ролл', 'роли', 'maki', 'суші'],
  choc_bar: ['снікерс', 'марс', 'твікс', 'баунті', 'кіткат', 'snickers', 'mars', 'twix', 'bounty', 'kitkat'],
  wafers: ['tatranka', 'horalky', 'вафля'],
  cake: ['наполеон', 'медовик', 'чізкейк', 'cheesecake', 'dortík'],
  pastry: ['еклер', 'eclair', 'větrník', 'kremrole'],
  candy: ['цукерка', 'bonbon', 'praline'],
  fried_eggs: ['глазунья', 'volské oko', 'míchaná vejce', 'scrambled'],
  oatmeal_milk: ['вівсяна каша', 'ovesná kaše', 'porridge'],
  buckwheat: ['гречана каша', 'pohanka'],
  potato: ['картоплі', 'brambory'],
  mashed: ['пюре', 'kaše bramborová'],
  hotdog: ['hot dog', 'хотдог'],
  vodka: ['slivovice', 'самогон', 'коньяк', 'віскі', 'whisky', 'rum', 'ром'],
  beer: ['пиво', 'pivo', 'ležák'],
  juice: ['сік', 'džus', 'juice'],
  sandwich: ['сендвіч', 'chlebíček', 'toast sandwich'],
  pizza: ['піцца'],
  lavash: ['піта', 'pita', 'wrap'],
  liver: ['печінка', 'játra'],
  herring: ['оселедець', 'селедка'],
  mackerel: ['скумбрія'],
  shrimp: ['креветка'],
  avocado: ['гуакамоле', 'guacamole'],
  dates: ['фінік'],
  sunflower_seeds: ['насіння', 'семечки', 'семки', 'slunečnice'],
  blueberry: ['лохина', 'чорниця', 'borůvka'],
  strawberry: ['суниця', 'клубника', 'jahody'],
  mandarin: ['мандаринка', 'клементин', 'klementinka'],
  watermelon: ['кавун'],
  noodles_instant: ['мівіна', 'доширак', 'роллтон', 'ramen', 'рамен'],
  energy: ['ред булл', 'red bull', 'монстр', 'monster', 'big shock'],
  protein_bar: ['протеїнов', 'protein'],
  greek: ['грецький йогурт', 'skyr', 'скір'],
  mayo: ['майонез', 'majonéza'],
  oil: ['соняшникова олія', 'оливкова олія', 'olej'],
  potato_fried: ['смажена картопля', 'картопля смажена'],
  pelmeni: ['пельмешки'],
  varenyky: ['вареник'],
  syrnyky: ['сирник'],
  pancakes: ['млинець', 'palačinka'],
  borscht: ['борщик']
};
const FDB = FOOD_DB.map(r => ({ id: r[0], n: [r[1], r[2], r[3]], k: r[4], p: r[5], f: r[6], c: r[7], por: r[8], al: FOOD_ALIAS[r[0]] || [] }));
const fdb = id => FDB.find(x => x.id === id);
const fold = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’ʼ]/g, '');
function searchFoods(q) {
  const k = fold(q.trim());
  if (!k) return [];
  return FDB.map(f => {
    const names = f.n.map(fold);
    const own = names[LI()];
    const score = own.startsWith(k) ? 3 : own.includes(k) ? 2 : names.some(n => n.includes(k)) || (f.al || []).some(a => fold(a).includes(k)) ? 1 : 0;
    return { f, score };
  }).filter(x => x.score).sort((a, b) => b.score - a.score).slice(0, 15).map(x => x.f);
}
const macroOf = (f, g) => ({ k: f.k * g / 100, p: f.p * g / 100, f: f.f * g / 100, c: f.c * g / 100 });
const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_KEY = { breakfast: 'mBreakfast', lunch: 'mLunch', dinner: 'mDinner', snack: 'mSnack' };
function defaultMeal() { const h = new Date().getHours(); return h < 11 ? 'breakfast' : h < 16 ? 'lunch' : h < 21 ? 'dinner' : 'snack'; }
function protTarget(w, g) { return Math.round(Math.min(w, 27 * Math.pow(P().height / 100, 2)) * (g === 'keep' ? 1.2 : g === 'gain' ? 1.8 : 1.6) / 5) * 5; }
function macroTargets(w) {
  const ct = calTarget(w), p = protTarget(w, ct.g), f = Math.round(ct.tg * 0.28 / 9);
  return { k: ct.tg, p, f, c: Math.max(0, Math.round((ct.tg - p * 4 - f * 9) / 4)) };
}
function dishTotals(ings) {
  const t0 = { k: 0, p: 0, f: 0, c: 0, g: 0 };
  ings.forEach(i => { const f = fdb(i.id); if (!f) return; const m = macroOf(f, i.g); t0.k += m.k; t0.p += m.p; t0.f += m.f; t0.c += m.c; t0.g += +i.g || 0; });
  return t0;
}

// ================= model =================
const bmr = w => { const p = P(); return 10 * w + 6.25 * p.height - 5 * p.age + (p.sex === 'm' ? 5 : -161); };
// ---- v12: dynamic energy model ----
// energy per kg of weight change depends on body fat (Forbes / Hall): leaner people lose more lean tissue per kg
const RHO_F = 9440, RHO_L = 1816;
function fatMass(w) {
  const p = P(), bmi = w / Math.pow(p.height / 100, 2);
  const bf = clamp(1.2 * bmi + 0.23 * (p.age || 30) - 10.8 * (p.sex === 'm' ? 1 : 0) - 5.4, 6, 60);   // Deurenberg
  return w * bf / 100;
}
function rhoAt(w) { const pL = 10.4 / (10.4 + fatMass(w)); return pL * RHO_L + (1 - pL) * RHO_F; }
// self-correction from real weigh-ins: extra (or missing) kcal/day versus the formula
let CAL = null;
function calib() {
  if (CAL) return CAL;
  CAL = { k: 0, conf: 0, days: 0, n: 0 };            // provisional, so nested baseBurn calls use the plain formula
  if (!P()) return CAL;
  const td = todayStr();
  const ms = D.meas.filter(x => x.weight && diffDays(x.date, td) <= 90).sort((a, b) => a.date < b.date ? -1 : 1);
  const res = { k: 0, conf: 0, days: 0, n: ms.length };
  if (ms.length >= 2) {
    const a = ms[0], b = ms[ms.length - 1], days = diffDays(a.date, b.date);
    if (days >= 14) {
      let w = a.weight, logged = 0, d = a.date;
      for (let i = 0; i < days; i++, d = addDays(d, 1)) { const tt = dayTotals(d, w); if (tt.complete) { w += stepBal(tt, w) / rhoAt(w); logged++; } }
      if (logged / days >= 0.6) {
        const pred = w - a.weight, act = b.weight - a.weight, rho = rhoAt((a.weight + b.weight) / 2);
        const conf = clamp((days - 7) / 35, 0, 1) * (logged / days);
        res.k = Math.round(clamp((pred - act) * rho / logged, -500, 500) * conf);
        res.conf = conf; res.days = days; res.pred = pred; res.act = act;
      }
    }
  }
  CAL = res; return CAL;
}
const baseBurn = w => bmr(w) * P().job + calib().k;
// eating less also lowers the thermic effect of food (~10 % of the change)
const stepBal = (tt, w) => tt.bal - 0.1 * (tt.eaten - baseBurn(w));
// forward projection with adaptive thermogenesis: the body slowly saves ~14 % of a sustained deficit
function etaDays(h, w0, tw) {
  let w = w0, A = 0; const maint = baseBurn(w0), dEI = h.eat - maint, dir = Math.sign(tw - w0);
  for (let i = 1; i <= 1095; i++) {
    A += (0.14 * dEI - A) / 14;
    w += (h.eat - (baseBurn(w) + h.ex * w / w0 + 0.1 * dEI + A)) / rhoAt(w);
    if ((dir < 0 && w <= tw) || (dir > 0 && w >= tw)) return i;
  }
  return null;
}
function project(days, h, w0, eatK = 1, burnK = 1) {
  let w = w0, A = 0; const eat = h.eat * eatK, maint = baseBurn(w0), dEI = eat - maint;
  for (let i = 0; i < days; i++) {
    A += (0.14 * dEI - A) / 14;
    const burn = baseBurn(w) * burnK + h.ex * w / w0 + 0.1 * dEI + A;
    w = clamp(w + (eat - burn) / rhoAt(w), 35, 250);
  }
  return w;
}
function dayTotals(s, w) {
  const d = peekDay(s);
  let eaten = 0, p = 0, f = 0, c = 0;
  d.foods.forEach(x => { eaten += x.k; p += x.p || 0; f += x.f || 0; c += x.c || 0; });
  const stepsK = (d.steps || 0) * w * 0.0003;           // ≈ net kcal per step
  const ex = d.acts.reduce((a, x) => a + x.k, 0) + stepsK;
  const burned = baseBurn(w) + ex;
  const logged = d.foods.length > 0, complete = logged && (d.done === true || (d.done !== false && eaten >= baseBurn(w) * 0.6));
  return { eaten, ex, burned, bal: eaten - burned, logged, complete, p, f, c, stepsK };
}
// model weight at the START of each day, from the first day to today
function series() {
  const p = P(), td = todayStr(), mw = {};
  D.meas.forEach(x => { if (x.weight) mw[x.date] = x.weight; });
  let w = p.weight, d = p.startDate < td ? p.startDate : td;
  const first = D.meas.filter(x => x.weight).map(x => x.date).sort()[0];
  if (first && first < d) d = first;
  const out = []; let guard = 0;
  while (d <= td && guard++ < 4000) {
    const real = mw[d] != null;
    if (real) w = mw[d];
    out.push({ d, w, real });
    if (d < td) { const tt = dayTotals(d, w); if (tt.complete) w += stepBal(tt, w) / rhoAt(w); }
    d = addDays(d, 1);
  }
  return out;
}
let SER = null;
const ser = () => SER || (SER = series());
const dirty = () => { SER = null; CAL = null; };
const weightAt = s => { const a = ser(); let w = a[0].w; for (const x of a) { if (x.d > s) break; w = x.w; } return w; };

function toneAt(s) {
  let sum = 0;
  for (const k in D.days) {
    const age = diffDays(k, s);
    if (age < 0 || age > 150) continue;
    D.days[k].acts.forEach(a => { sum += a.min * actDef(a.id).tone * Math.exp(-age / 21); });
  }
  return clamp(P().sporty + sum, 0, 100);
}
function habits() {
  const td = todayStr(); const bals = [], eats = [], exs = []; let toneDaily = 0;
  for (let i = 1; i <= 14; i++) {
    const s = addDays(td, -i);
    const tt = dayTotals(s, weightAt(s));
    if (tt.complete && bals.length < 7) { bals.push(tt.bal); eats.push(tt.eaten); exs.push(tt.ex); }
    peekDay(s).acts.forEach(a => { toneDaily += a.min * actDef(a.id).tone / 14; });
  }
  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  return { bal: avg(bals), eat: avg(eats), ex: avg(exs), n: bals.length, toneDaily };
}
const shapeOf = p => p.shape || (p.sex === 'm' ? 'belly' : 'hips');
function defaultGirths(w, tone) {
  const p = P(), h = p.height, e = w / Math.pow(h / 100, 2) - 22, m = p.sex === 'm';
  const sh = shapeOf(p), ep = Math.max(0, e);
  return {
    waist: (m ? 0.45 * h + e * 2.4 : 0.40 * h + e * 2.2) + (sh === 'belly' ? ep * 0.6 : sh === 'hips' ? -ep * 0.5 : 0) - tone * 0.02,
    chest: (m ? 0.55 * h + e * 1.8 : 0.53 * h + e * 1.8) + tone * 0.06,
    shoulders: (m ? 0.66 * h + e * 1.5 : 0.6 * h + e * 1.4) + tone * 0.09,
    thigh: (m ? 0.31 * h + e * 1.6 : 0.33 * h + e * 1.7) + (sh === 'hips' ? ep * 0.5 : sh === 'belly' ? -ep * 0.2 : 0) + tone * 0.03
  };
}
// cm change per kg of weight, and per point of muscle tone
const COEF = { waist: [0.9, -0.03], chest: [0.7, 0.06], shoulders: [0.45, 0.09], thigh: [0.5, 0.03] };
function girths(w, tone, onDate) {
  const g = defaultGirths(w, tone), src = {};
  for (const k of GIRTH_KEYS) {
    src[k] = t('estimate');
    const ms = D.meas.filter(x => x[k] && x.date <= onDate).sort((a, b) => a.date < b.date ? -1 : 1);
    const last = ms[ms.length - 1];
    if (!last) continue;
    const wm = last.weight || weightAt(last.date), tm = toneAt(last.date);
    g[k] = last[k] + COEF[k][0] * (w - wm) + COEF[k][1] * (tone - tm);
    src[k] = t('measured') + ' ' + fmtDate(last.date) + (Math.abs(w - wm) > 0.2 || Math.abs(tone - tm) > 2 ? ', ' + t('adjusted') : '');
  }
  const sh = shapeOf(P());
  g.belly = g.waist * (sh === 'belly' ? 1.07 : sh === 'even' ? 1.04 : 1.01);   // the belly drawn from your waist + where you store fat
  return { g, src };
}
function formOf(w, tone) {
  const bmi = w / Math.pow(P().height / 100, 2);
  const whr = girths(w, tone, todayStr()).g.waist / P().height;
  if (tone >= 28 && whr > 0.53) return t('fSportyBelly');
  if (tone >= 65 && bmi < 27) return t('fAthlete');
  if (tone >= 40 && bmi < 27.5) return t('fSporty');
  if (bmi < 18.5) return t('fThin');
  if (bmi < 25) return t('fNormal');
  if (bmi < 30) return t('fOver');
  return t('fHeavy');
}

// ================= avatar =================
const cv = $('avatar'); let ctx = cv.getContext('2d');
function sizeCanvas(c) {
  const dpr = window.devicePixelRatio || 1, r = c.getBoundingClientRect();
  const W2 = Math.max(1, Math.round(r.width * dpr)), H2 = Math.max(1, Math.round(r.height * dpr));
  if (c.width !== W2 || c.height !== H2) { c.width = W2; c.height = H2; }
  c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
  return [r.width, r.height];
}
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = v => clamp(Math.round(v * k), 0, 255);
  return '#' + ((1 << 24) + (f(n >> 16) << 16) + (f((n >> 8) & 255) << 8) + f(n & 255)).toString(16).slice(1);
}

// ================= v5: nicer character parts =================
const EYE_COLS = ['#5B3A1E', '#3D7CC9', '#3F8F5A', '#7D8794', '#2A2A2A'];
const PANTS_COL = { shorts: '#2B3446', joggers: '#3A3F4B', jeans: '#3B5B8C' };
function headPath(cx, cy, rx, ry) {
  const x = ctx;
  x.beginPath(); x.moveTo(cx, cy - ry);
  x.bezierCurveTo(cx + rx * 0.98, cy - ry, cx + rx * 1.06, cy + ry * 0.15, cx + rx * 0.86, cy + ry * 0.6);
  x.quadraticCurveTo(cx + rx * 0.55, cy + ry * 1.03, cx, cy + ry * 1.03);
  x.quadraticCurveTo(cx - rx * 0.55, cy + ry * 1.03, cx - rx * 0.86, cy + ry * 0.6);
  x.bezierCurveTo(cx - rx * 1.06, cy + ry * 0.15, cx - rx * 0.98, cy - ry, cx, cy - ry);
  x.closePath();
}
function drawHairBack(st, hc, cx, cy, rx, ry) {
  const x = ctx; x.fillStyle = hc;
  if (st === 'long') { x.beginPath(); x.ellipse(cx, cy + ry * 0.45, rx * 1.2, ry * 1.4, 0, 0, Math.PI * 2); x.fill(); }
  if (st === 'afro') { x.beginPath(); x.arc(cx, cy - ry * 0.2, rx * 1.55, 0, Math.PI * 2); x.fill(); }
  if (st === 'ponytail') { x.beginPath(); x.ellipse(cx + rx * 1.0, cy + ry * 0.45, rx * 0.3, ry * 0.95, 0.22, 0, Math.PI * 2); x.fill(); }
}
function drawHairFront(st, hc, cx, cy, rx, ry) {
  const x = ctx, hl = shade(hc, 1.18);
  const cap = (k = 1) => { x.beginPath(); x.ellipse(cx, cy - ry * 0.32, rx * 1.04 * k, ry * 0.75 * k, 0, Math.PI, Math.PI * 2); x.fill();
    x.beginPath(); x.ellipse(cx, cy - ry * 0.35, rx * 1.02 * k, ry * 0.2, 0, 0, Math.PI); x.fill(); };
  { const hg = x.createLinearGradient(0, cy - ry * 1.15, 0, cy + ry * 0.9); hg.addColorStop(0, hl); hg.addColorStop(0.45, hc); hg.addColorStop(1, shade(hc, 0.82)); x.fillStyle = hg; }
  HAIR_STRANDS = (st !== 'bald' && st !== 'buzz') ? [hc, cx, cy, rx, ry] : null;
  if (st === 'short') cap();
  else if (st === 'buzz') { x.globalAlpha = 0.55; x.beginPath(); x.ellipse(cx, cy - ry * 0.25, rx * 1.01, ry * 0.78, 0, Math.PI, Math.PI * 2); x.fill(); x.globalAlpha = 1; }
  else if (st === 'bald') { x.beginPath(); x.ellipse(cx - rx * 0.9, cy - ry * 0.1, rx * 0.16, ry * 0.3, 0, 0, Math.PI * 2); x.ellipse(cx + rx * 0.9, cy - ry * 0.1, rx * 0.16, ry * 0.3, 0, 0, Math.PI * 2); x.fill(); }
  else if (st === 'long') { cap(); x.beginPath(); x.ellipse(cx - rx * 0.93, cy + ry * 0.12, rx * 0.2, ry * 0.72, 0.05, 0, Math.PI * 2); x.ellipse(cx + rx * 0.93, cy + ry * 0.12, rx * 0.2, ry * 0.72, -0.05, 0, Math.PI * 2); x.fill(); }
  else if (st === 'side') {
    cap();
    x.beginPath(); x.ellipse(cx + rx * 0.18, cy - ry * 0.5, rx * 0.88, ry * 0.26, -0.2, 0, Math.PI * 2); x.fill();
    x.strokeStyle = hl; x.lineWidth = Math.max(1.2, rx * 0.05); x.beginPath(); x.moveTo(cx - rx * 0.42, cy - ry * 1.0); x.quadraticCurveTo(cx - rx * 0.5, cy - ry * 0.75, cx - rx * 0.55, cy - ry * 0.55); x.stroke();
  }
  else if (st === 'curly' || st === 'afro') {
    cap();
    const n = st === 'afro' ? 9 : 8, r0 = st === 'afro' ? 0.26 : 0.22;
    for (let i = 0; i <= n; i++) { const a = Math.PI * (1.02 + 0.96 * i / n); x.beginPath(); x.arc(cx + Math.cos(a) * rx * 0.98, cy - ry * 0.28 + Math.sin(a) * ry * 0.82, rx * r0, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = hl; for (let i = 1; i < n; i += 2) { const a = Math.PI * (1.02 + 0.96 * i / n); x.beginPath(); x.arc(cx + Math.cos(a) * rx * 0.9, cy - ry * 0.34 + Math.sin(a) * ry * 0.75, rx * 0.06, 0, Math.PI * 2); x.fill(); }
  }
  else if (st === 'ponytail') { cap(); x.fillStyle = '#E5484D'; x.beginPath(); x.arc(cx + rx * 0.92, cy - ry * 0.2, rx * 0.11, 0, Math.PI * 2); x.fill(); }
  else if (st === 'bun') { cap(); x.beginPath(); x.arc(cx, cy - ry * 1.08, rx * 0.4, 0, Math.PI * 2); x.fill(); x.strokeStyle = hl; x.lineWidth = 1.5; x.beginPath(); x.arc(cx, cy - ry * 1.08, rx * 0.25, 0.3, 2.6); x.stroke(); }
  else if (st === 'mohawk') {
    x.globalAlpha = 0.4; x.beginPath(); x.ellipse(cx, cy - ry * 0.25, rx * 1.01, ry * 0.78, 0, Math.PI, Math.PI * 2); x.fill(); x.globalAlpha = 1;
    x.beginPath(); x.moveTo(cx - rx * 0.22, cy - ry * 0.55);
    for (let i = 0; i <= 4; i++) { const xx = cx - rx * 0.22 + rx * 0.11 * i; x.lineTo(xx, cy - ry * (1.35 - Math.abs(i - 2) * 0.08)); x.lineTo(xx + rx * 0.055, cy - ry * 1.0); }
    x.lineTo(cx + rx * 0.22, cy - ry * 0.55); x.closePath(); x.fill();
  }
}
function drawShoe(x0, yb, hw, h, col) {
  const x = ctx;
  x.fillStyle = col; x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 1;
  x.beginPath(); x.ellipse(x0, yb - h * 0.55, hw, h * 0.6, 0, Math.PI, Math.PI * 2); x.lineTo(x0 + hw, yb - h * 0.2); x.lineTo(x0 - hw, yb - h * 0.2); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#FFFFFF'; x.beginPath(); x.ellipse(x0, yb - h * 0.14, hw * 1.02, h * 0.2, 0, 0, Math.PI * 2); x.fill(); x.stroke();
  x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 1.1;
  for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(x0 - hw * 0.28, yb - h * (0.5 + i * 0.16)); x.lineTo(x0 + hw * 0.28, yb - h * (0.5 + i * 0.16)); x.stroke(); }
}

let HAIR_STRANDS = null, AVC = null, AV_T = 0, AV_WAVE = 0, AV_STATE = null, avLoopOn = false, avLast = 0;
const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function avLoop(ts) {
  if (curTab !== 'tabMe' || !AV_STATE || document.hidden) { avLoopOn = false; return; }
  if (ts - avLast > 33) {   // ~30 fps is plenty for idle motion
    const dt = Math.min(0.1, (ts - avLast) / 1000); avLast = ts;
    AV_T += dt; if (AV_WAVE > 0) AV_WAVE -= dt; { const wv = AV_WAVE > 0; if (avLoop.wv !== wv) { avLoop.wv = wv; const el = $('avWeight'); if (el) el.classList.toggle('dim', wv); } } if (PET_HEART > 0) PET_HEART -= dt;
    drawAvatar(AV_STATE.w, AV_STATE.tone);
  }
  requestAnimationFrame(avLoop);
}
function startAvatar(w, tone) {
  AV_STATE = { w, tone };
  if (REDUCED) { drawAvatar(w, tone); return; }
  if (!avLoopOn) { avLoopOn = true; avLast = performance.now(); requestAnimationFrame(avLoop); }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && curTab === 'tabMe' && AV_STATE) startAvatar(AV_STATE.w, AV_STATE.tone); });
function drawAvatar(w, tone) {
  const TGT = AV_TARGET || cv; ctx = TGT.getContext('2d');
  const EQ = equipNow();
  // with a pet the scene card spans the full screen width (set before measuring the canvas)
  if (!AV_TARGET) { const wrap = $('avatarWrap'); if (wrap) wrap.classList.toggle('wide', !!EQ.pet); }
  const [CW, CH] = sizeCanvas(TGT);
  if (!CW || !CH) return;
  const p = P(), H = p.height, male = p.sex === 'm';
  const bmi = w / Math.pow(H / 100, 2);
  if (!AVC || AVC.w !== w || AVC.tone !== tone || AVC.v !== SER) AVC = { w, tone, v: SER, g: girths(w, tone, todayStr()).g };
  const g = AVC.g;
  const br = Math.sin(AV_T * 1.7);   // breathing
  const fat = clamp((bmi - 20) / 15, 0, 1);
  const hip = male ? Math.max(g.belly * 0.92, g.thigh * 1.6, 0.5 * H) : Math.max(g.waist * 1.3, g.thigh * 1.7, 0.54 * H);
  const armG = (male ? 0.17 * H : 0.155 * H) + (bmi - 22) * 0.9 + tone * 0.06;

  ctx.clearRect(0, 0, CW, CH);
  const G = CH - 16;
  const px = (CH - 44) / 205;          // pixels per cm: same scale for everyone, so height is comparable
  let cx = CW / 2 + 12;   // moves left below when there is a pet corner
  const Y = f => G - f * H * px;
  const XX = cm => cx + cm * px;
  const L = cm => cm * px;
  if (EQ.bg) drawBg(EQ.bg, CW, CH, G);


  const skin = p.skin, skinD = shade(skin, 0.86);
  const SS = p.shirtStyle || 'tshirt', PT = p.pants || 'shorts', longPants = PT !== 'shorts', pantsC = PANTS_COL[PT] || PANTS_COL.shorts;
  const sleeve = SS === 'tank' ? 'none' : (SS === 'longsleeve' || SS === 'hoodie') ? 'long' : 'short';
  const shirt = p.shirt, shirtD = shirt === '#ffffff' ? '#c9ced4' : shade(shirt, 0.75);
  const sn = parseInt(shirt.slice(1), 16), darkShirt = (0.3 * (sn >> 16) + 0.59 * ((sn >> 8) & 255) + 0.11 * (sn & 255)) < 70;
  const lineC = darkShirt ? 'rgba(255,255,255,.35)' : shirtD;   // muscle lines stay visible on dark T-shirts
  // half widths in cm (front view width ≈ girth / 2.6…3)
  // cartoon exaggeration: differences from a BMI-22 body are drawn bigger, so changes are easy to see
  const g0 = defaultGirths(22 * Math.pow(H / 100, 2), 0); g0.belly = g0.waist * 1.04;
  const ex = (k, v, f) => g0[k] + (v - g0[k]) * f;
  const hip0 = male ? 0.5 * H : 0.54 * H;
  const shW = ex('shoulders', g.shoulders, 1.3) / 2.85 / 2, chW = ex('chest', g.chest, 1.5) / 2.75 / 2 * (1 + 0.012 * br), waW = ex('waist', g.waist, 1.6) / 2.65 / 2 * (1 + 0.012 * br);
  const beW = ex('belly', g.belly, 1.8) / 2.55 / 2 * (1 + 0.016 * br), hipW = (hip0 + (hip - hip0) * 1.5) / 2.75 / 2;
  const thW = ex('thigh', g.thigh, 1.5) / 3.0 / 2, kneeW = thW * 0.6, calfW = thW * 0.62, ankW = 3.3;
  const legC = Math.max(hipW * 0.5, thW * 0.85);
  const neckW = (male ? 6 : 5) + (bmi - 22) * 0.18 + tone * 0.015;
  const armW = armG / 3.1 / 2;
  const bodyOut0 = Math.max(chW, waW, beW, hipW * 0.96);
  // with a pet corner the twin stands on the left, next to the height ruler; the corner stands at the right edge
  // and the floor between them stays free (as in the owner's mock-up)
  if (EQ.pet && EQ.pet !== 'pet_parrot' && PET_LAYOUT[EQ.pet]) cx = 40 + L(bodyOut0 + armW * 2 + 3);

  ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.beginPath(); ctx.ellipse(cx, G + 2, L(hip / 2.6), 7, 0, 0, Math.PI * 2); ctx.fill();
  // height ruler
  ctx.strokeStyle = '#b9c1cc'; ctx.lineWidth = 1; ctx.fillStyle = '#8a929c'; ctx.font = '10px system-ui'; ctx.textAlign = 'left';
  ctx.beginPath(); ctx.moveTo(20, G); ctx.lineTo(20, G - 200 * px); ctx.stroke();
  for (let c = 0; c <= 200; c += 50) { ctx.beginPath(); ctx.moveTo(16, G - c * px); ctx.lineTo(24, G - c * px); ctx.stroke(); if (c && c < 200) ctx.fillText(c, 26, G - c * px + 3); }
  ctx.strokeStyle = 'rgba(47,111,224,.45)'; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(16, Y(1)); ctx.lineTo(cx - L(14), Y(1)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#2f6fe0'; ctx.font = 'bold 11px system-ui'; ctx.fillText(H + ' ' + t('cm'), 26, Y(1) - 4);
  const headCY = Y(0.93) - br * 0.7, headRy = L(H * 0.066), headRx = headRy * 0.8 + L(fat * 1.4);

  drawHairBack(p.hairStyle, p.hair, cx, headCY, headRx, headRy);

  // the pet's house / pond / wheel stand a little behind the twin's legs (drawn before the body)
  if (EQ.pet) drawPetScene(EQ.pet, { cx, G, L, Y, hipW, armW, shW, H, CW, legC, calfW, ankW }, AV_T, 'back');
  // legs
  [-1, 1].forEach(sd => {
    const inner = Math.max(0.4, legC - thW);
    { const lc = longPants ? pantsC : skin, lg = ctx.createLinearGradient(XX(sd * (legC + thW)), 0, XX(sd * Math.max(0.4, legC - thW)), 0); lg.addColorStop(0, shade(lc, 0.84)); lg.addColorStop(0.45, shade(lc, 1.04)); lg.addColorStop(1, shade(lc, 0.9)); ctx.fillStyle = lg; }
    ctx.beginPath();
    ctx.moveTo(XX(sd * (legC + thW)), Y(0.5));
    ctx.quadraticCurveTo(XX(sd * (legC + thW * 1.02)), Y(0.38), XX(sd * (legC + kneeW)), Y(0.28));
    ctx.quadraticCurveTo(XX(sd * (legC + calfW * 1.15)), Y(0.18), XX(sd * (legC + ankW)), Y(0.045));
    ctx.lineTo(XX(sd * (legC - ankW)), Y(0.045));
    ctx.quadraticCurveTo(XX(sd * (legC - calfW * 1.05)), Y(0.18), XX(sd * (legC - kneeW)), Y(0.28));
    ctx.quadraticCurveTo(XX(sd * inner), Y(0.4), XX(sd * inner), Y(0.47));
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = longPants ? shade(pantsC, 0.75) : skinD; ctx.lineWidth = 1.2; ctx.stroke();
    if (!longPants) { ctx.beginPath(); ctx.arc(XX(sd * legC), Y(0.285), L(kneeW * 0.45), 0.3, Math.PI - 0.3); ctx.stroke(); }
    else if (PT === 'jeans') { ctx.strokeStyle = 'rgba(255,214,120,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(XX(sd * (legC + thW * 0.55)), Y(0.47)); ctx.quadraticCurveTo(XX(sd * (legC + kneeW * 0.6)), Y(0.28), XX(sd * (legC + ankW * 0.5)), Y(0.06)); ctx.stroke(); }
    else { ctx.fillStyle = shade(pantsC, 0.8); ctx.fillRect(XX(sd * legC - ankW - 0.6), Y(0.065), L(ankW * 2 + 1.2), L(H * 0.02)); }
    drawShoe(XX(sd * (legC + 0.8)), Y(0.0) + 1, L(ankW + 3.2), L(7.5), EQ.shoes ? itemById(EQ.shoes).col : '#E9EDF1');
  });

  // shorts
  const inner = Math.max(0.4, legC - thW * 0.95);
  ctx.fillStyle = pantsC;
  ctx.beginPath();
  ctx.moveTo(XX(-hipW), Y(0.535));
  ctx.quadraticCurveTo(XX(-(legC + thW * 1.06)), Y(0.47), XX(-(legC + thW * 1.05)), Y(0.395));
  ctx.lineTo(XX(-inner), Y(0.395)); ctx.lineTo(XX(0), Y(0.462)); ctx.lineTo(XX(inner), Y(0.395));
  ctx.lineTo(XX(legC + thW * 1.05), Y(0.395));
  ctx.quadraticCurveTo(XX(legC + thW * 1.06), Y(0.47), XX(hipW), Y(0.535));
  ctx.closePath(); ctx.fill();

  const shp = shapeOf(p);
  const handle = 0;   // belly/side bulges removed: the outline just follows the measured/estimated waist
  // torso (T-shirt)
  const side = [
    { w: neckW + 1.5, h: 0.842 }, { w: shW, h: 0.81 }, { w: chW, h: 0.745 }, { w: chW * 0.99, h: 0.71 },
    { w: waW, h: 0.645 }, { w: beW, h: 0.6 }, { w: Math.max(hipW, beW * 0.96) + 4.5 * handle, h: 0.56 }, { w: hipW + 1.2 * handle, h: 0.53 }
  ];
  const path = (pts, sd) => {
    ctx.lineTo(XX(sd * pts[0].w), Y(pts[0].h));
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      ctx.quadraticCurveTo(XX(sd * a.w), Y(a.h), (XX(sd * a.w) + XX(sd * b.w)) / 2, (Y(a.h) + Y(b.h)) / 2);
    }
    const l = pts[pts.length - 1]; ctx.lineTo(XX(sd * l.w), Y(l.h));
  };
  if (SS === 'hoodie') { ctx.fillStyle = shirtD; ctx.beginPath(); ctx.ellipse(cx, Y(0.845), L(neckW + 7), L(5.5), 0, 0, Math.PI * 2); ctx.fill(); }
  const tg = ctx.createLinearGradient(XX(-bodyOut0 - 2), 0, XX(bodyOut0 + 2), 0);
  tg.addColorStop(0, shade(shirt, 0.84)); tg.addColorStop(0.28, shirt); tg.addColorStop(0.62, shade(shirt, 1.04)); tg.addColorStop(1, shade(shirt, 0.8));
  ctx.fillStyle = tg; ctx.strokeStyle = shirtD; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(XX(-side[0].w), Y(side[0].h));
  path(side, -1);
  ctx.quadraticCurveTo(XX(0), Y(0.518), XX(hipW + 1.2 * handle), Y(0.53));
  path(side.slice().reverse(), 1);
  ctx.quadraticCurveTo(XX(0), Y(0.836), XX(-side[0].w), Y(side[0].h));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  if (SS === 'jersey') {   // side stripes + trim
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = L(1.4);
    [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(XX(sd * (chW - 1.6)), Y(0.76)); ctx.quadraticCurveTo(XX(sd * (waW - 1.4)), Y(0.64), XX(sd * (hipW - 1.4)), Y(0.54)); ctx.stroke(); });
  }
  if (SS === 'hoodie') {   // front pocket
    ctx.strokeStyle = shirtD; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(XX(-waW * 0.62), Y(0.555)); ctx.lineTo(XX(-waW * 0.45), Y(0.615)); ctx.lineTo(XX(waW * 0.45), Y(0.615)); ctx.lineTo(XX(waW * 0.62), Y(0.555)); ctx.stroke();
  }
  if (SS === 'tank') {   // bare shoulders
    ctx.fillStyle = skin;
    [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(XX(sd * (shW - 2.2)), Y(0.805), L(4.2), L(4.6), 0, 0, Math.PI * 2); ctx.fill(); });
  }

  // abs: show up gradually as the waist gets slimmer (and faster with training); no belly effects
  const whr = g.waist / H;
  const lean = clamp(((male ? 0.54 : 0.49) - whr) / 0.08, 0, 1);   // men: waist/height 0.54 → none, 0.46 → fully visible (women ~0.05 lower)
  const absV = lean * (0.35 + 0.65 * clamp(tone / 60, 0, 1));
  ctx.strokeStyle = lineC; ctx.lineWidth = 1.3;
  if (!male) { ctx.beginPath(); ctx.arc(XX(-chW * 0.42), Y(0.725), L(chW * 0.42), 0.3, Math.PI - 0.3); ctx.moveTo(XX(chW * 0.84), Y(0.725)); ctx.arc(XX(chW * 0.42), Y(0.725), L(chW * 0.42), 0.3, Math.PI - 0.3); ctx.stroke(); }
  else if (tone > 28 || lean > 0.5) { ctx.beginPath(); ctx.arc(XX(-chW * 0.42), Y(0.745), L(chW * 0.45), 0.35, Math.PI - 0.35); ctx.moveTo(XX(chW * 0.87), Y(0.745)); ctx.arc(XX(chW * 0.42), Y(0.745), L(chW * 0.45), 0.35, Math.PI - 0.35); ctx.stroke(); }
  if (absV > 0.05 && SS !== 'hoodie') {
    ctx.save(); ctx.globalAlpha = Math.min(0.85, absV * 0.9); ctx.lineWidth = 1.6; ctx.strokeStyle = lineC;
    const top = 0.695, rowH = 0.036, bw = male ? 4.4 : 3.6;
    ctx.beginPath(); ctx.moveTo(cx, Y(top + 0.005)); ctx.lineTo(cx, Y(top - rowH * 3 - 0.01)); ctx.stroke();   // centre line
    for (let r = 0; r < 3; r++) for (const sd of [-1, 1]) {
      const x0 = sd < 0 ? XX(-bw - 0.6) : XX(0.6), y0 = Y(top - r * rowH);
      const w = L(bw), h = Y(top - (r + 1) * rowH + 0.006) - y0, rr = Math.min(w, h) * 0.35;
      ctx.beginPath();
      ctx.moveTo(x0 + rr, y0); ctx.lineTo(x0 + w - rr, y0); ctx.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + rr);
      ctx.lineTo(x0 + w, y0 + h - rr); ctx.quadraticCurveTo(x0 + w, y0 + h, x0 + w - rr, y0 + h);
      ctx.lineTo(x0 + rr, y0 + h); ctx.quadraticCurveTo(x0, y0 + h, x0, y0 + h - rr);
      ctx.lineTo(x0, y0 + rr); ctx.quadraticCurveTo(x0, y0, x0 + rr, y0); ctx.stroke();
    }
    if (absV > 0.55) { // V-lines toward the hips
      ctx.beginPath();
      ctx.moveTo(XX(-waW * 0.75), Y(0.6)); ctx.quadraticCurveTo(XX(-waW * 0.45), Y(0.56), XX(-2), Y(0.54));
      ctx.moveTo(XX(waW * 0.75), Y(0.6)); ctx.quadraticCurveTo(XX(waW * 0.45), Y(0.56), XX(2), Y(0.54));
      ctx.stroke();
    }
    ctx.restore();
  }

  // arms (shaded, tapered)
  [-1, 1].forEach(sd => {
    const sx = XX(sd * (shW - armW * 0.55)), sy = Y(0.8);
    const bodyOut = Math.max(bodyOut0, Math.max(hipW, beW * 0.96) + 4.5 * handle - 2);
    let ex = XX(sd * (bodyOut + armW + 0.8)), ey = Y(0.625);
    let wx = XX(sd * (bodyOut + armW * 0.8 + 1.6)), wy = Y(0.48);
    let handAng = 0;
    if (sd === 1 && AV_WAVE > 0) {   // waving hello: elbow out to the side, forearm up, palm open
      const ph = Math.sin(AV_T * 9), up = REDUCED ? 1 : clamp(Math.min((2.2 - AV_WAVE) * 5, AV_WAVE * 3), 0, 1);   // ease in / out (static pose when animations are off)
      const ex1 = XX(shW + armW * 1.6 + H * 0.07), ey1 = Y(0.8);
      const wx1 = ex1 + L(H * (0.012 + ph * 0.035)), wy1 = Y(0.915);
      ex = ex + (ex1 - ex) * up; ey = ey + (ey1 - ey) * up;
      wx = wx + (wx1 - wx) * up; wy = wy + (wy1 - wy) * up;
      handAng = Math.atan2(wx - ex, -(wy - ey)) * up;   // hand continues the forearm direction
    }
    const aw = L(armW), up = aw * (1 + tone / 400), el = aw * 0.78, wr = aw * 0.58;
    limb(sx, sy, ex, ey, up, el, skin);
    limb(ex, ey, wx, wy, el, wr, skin);
    if (tone > 25) {
      const bx = sx + (ex - sx) * 0.55, by = sy + (ey - sy) * 0.55;
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(bx - sd * aw * 0.15, by, aw * (0.45 + tone / 300), aw * 1.2, 0, 0, Math.PI * 2); ctx.fill();
    }
    drawHand(wx, wy, sd, aw * 0.95, skin, handAng);
    if (sd === -1 && EQ.acc === 'watch' && sleeve !== 'long') drawWatch(wx, wy - L(2), aw);
    if (sleeve === 'short') {
      const k = 0.42, qx = sx + (ex - sx) * k, qy = sy + (ey - sy) * k;
      limb(sx, sy, qx, qy, up * 0.92 + L(0.9), up * 0.86 + L(0.8), shirt, true);
      ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 1;
      const nx = -(ey - sy), ny = ex - sx, nl = Math.hypot(nx, ny) || 1, hw2 = up * 0.86 + L(0.8);
      ctx.beginPath(); ctx.moveTo(qx - nx / nl * hw2, qy - ny / nl * hw2); ctx.lineTo(qx + nx / nl * hw2, qy + ny / nl * hw2); ctx.stroke();
      if (SS === 'jersey' || SS === 'polo') { ctx.strokeStyle = SS === 'jersey' ? 'rgba(255,255,255,.9)' : shirtD; ctx.lineWidth = L(1.1); ctx.lineCap = 'butt';
        ctx.beginPath(); ctx.moveTo(qx - nx / nl * hw2 * 0.95, qy - ny / nl * hw2 * 0.95); ctx.lineTo(qx + nx / nl * hw2 * 0.95, qy + ny / nl * hw2 * 0.95); ctx.stroke(); ctx.lineCap = 'round'; }
    } else if (sleeve === 'long') {
      limb(sx, sy, ex, ey, up * 0.92 + L(0.9), el + L(0.9), shirt);
      limb(ex, ey, wx, wy, el + L(0.9), wr + L(0.8), shirt, true);
      const cx1 = ex + (wx - ex) * 0.84, cy1 = ey + (wy - ey) * 0.84, cx2 = ex + (wx - ex) * 1.04, cy2 = ey + (wy - ey) * 1.04;
      limb(cx1, cy1, cx2, cy2, wr + L(0.9), wr + L(0.9), shirtD, true);
      if (sd === -1 && EQ.acc === 'watch') drawWatch(wx, wy - L(2), aw);
    } else {   // tank: thin strap over the shoulder
      ctx.strokeStyle = shirt; ctx.lineWidth = L(2.4); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(XX(sd * (neckW + 2)), Y(0.842)); ctx.lineTo(XX(sd * (shW - 4.5)), Y(0.775)); ctx.stroke();
    }
  });

  // neck
  ctx.fillStyle = skin;
  ctx.fillRect(XX(-neckW), Y(0.875), L(neckW * 2), Y(0.842) - Y(0.875) + 2);
  ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(XX(-neckW), Y(0.875), L(neckW * 2), L(1.6));
  if (SS === 'jersey') {   // V-neck
    ctx.fillStyle = skin; ctx.beginPath(); ctx.moveTo(XX(-neckW - 0.5), Y(0.842)); ctx.lineTo(cx, Y(0.805)); ctx.lineTo(XX(neckW + 0.5), Y(0.842)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = L(1); ctx.beginPath(); ctx.moveTo(XX(-neckW - 0.8), Y(0.843)); ctx.lineTo(cx, Y(0.803)); ctx.lineTo(XX(neckW + 0.8), Y(0.843)); ctx.stroke();
  } else if (SS === 'polo') {
    ctx.fillStyle = shirtD; ctx.beginPath(); ctx.ellipse(cx, Y(0.842), L(neckW + 1.2), L(1.6), 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = shade(shirt, 1.06); ctx.strokeStyle = shirtD; ctx.lineWidth = 1;
    [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(cx, Y(0.83)); ctx.lineTo(XX(sd * (neckW + 2.4)), Y(0.85)); ctx.lineTo(XX(sd * (neckW + 1.2)), Y(0.812)); ctx.closePath(); ctx.fill(); ctx.stroke(); });
    ctx.strokeStyle = shirtD; ctx.beginPath(); ctx.moveTo(cx, Y(0.83)); ctx.lineTo(cx, Y(0.785)); ctx.stroke();
    ctx.fillStyle = '#fff'; [0.818, 0.798].forEach(h => { ctx.beginPath(); ctx.arc(cx + 1.5, Y(h), L(0.45), 0, Math.PI * 2); ctx.fill(); });
  } else if (SS === 'hoodie') {
    ctx.fillStyle = shirtD; ctx.beginPath(); ctx.ellipse(cx, Y(0.842), L(neckW + 1.8), L(2.2), 0, 0, Math.PI); ctx.fill();
    ctx.strokeStyle = '#F2F4F7'; ctx.lineWidth = L(0.6);
    [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(XX(sd * 2), Y(0.835)); ctx.lineTo(XX(sd * 2.4), Y(0.77)); ctx.stroke(); ctx.fillStyle = '#F2F4F7'; ctx.beginPath(); ctx.arc(XX(sd * 2.4), Y(0.768), L(0.6), 0, Math.PI * 2); ctx.fill(); });
  } else if (SS === 'tank') {
    ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(cx, Y(0.842), L(neckW + 2), L(2.6), 0, 0, Math.PI); ctx.fill();
  } else {
    ctx.fillStyle = shirtD; ctx.beginPath(); ctx.ellipse(cx, Y(0.842), L(neckW + 1.2), L(1.6), 0, 0, Math.PI); ctx.fill();
  }

  // head
  ctx.fillStyle = skin;
  [-1, 1].forEach(sd => { ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(cx + sd * headRx * 0.98, headCY + headRy * 0.06, headRx * 0.17, headRy * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = skinD; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(cx + sd * headRx * 1.0, headCY + headRy * 0.06, headRx * 0.08, headRy * 0.12, 0, sd > 0 ? -1.2 : 1.9, sd > 0 ? 1.2 : 4.4); ctx.stroke(); });
  ctx.fillStyle = skin; headPath(cx, headCY, headRx, headRy); ctx.fill();
  { const hg = ctx.createRadialGradient(cx - headRx * 0.25, headCY - headRy * 0.25, headRy * 0.1, cx, headCY, headRy * 1.15); hg.addColorStop(0, 'rgba(255,255,255,.14)'); hg.addColorStop(0.6, 'rgba(255,255,255,0)'); hg.addColorStop(1, 'rgba(0,0,0,.12)'); ctx.fillStyle = hg; headPath(cx, headCY, headRx, headRy); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,.05)'; ctx.beginPath(); ctx.ellipse(cx + headRx * 0.55, headCY + headRy * 0.2, headRx * 0.35, headRy * 0.6, 0, 0, Math.PI * 2); ctx.fill();
  if (bmi > 29) { ctx.strokeStyle = skinD; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(cx, headCY + headRy * 0.98, headRx * 0.55, headRy * 0.16, 0, 0.1, Math.PI - 0.1); ctx.stroke(); }
  const hc = p.hair;
  if (p.beard === 'stubble') { ctx.globalAlpha = 0.35; ctx.fillStyle = hc; ctx.beginPath(); ctx.ellipse(cx, headCY + headRy * 0.35, headRx * 0.95, headRy * 0.68, 0, 0.05 * Math.PI, 0.95 * Math.PI); ctx.fill(); ctx.globalAlpha = 1; }
  if (p.beard === 'full' || p.beard === 'both') {
    ctx.fillStyle = hc; ctx.beginPath(); ctx.ellipse(cx, headCY + headRy * 0.3, headRx * 0.98, headRy * 0.82, 0, 0.04 * Math.PI, 0.96 * Math.PI); ctx.fill();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(cx, headCY + headRy * 0.42, headRx * 0.32, headRy * 0.17, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (p.beard === 'moustache' || p.beard === 'both') { ctx.fillStyle = shade(hc, 0.9); ctx.beginPath(); ctx.ellipse(cx, headCY + headRy * 0.3, headRx * 0.4, headRy * 0.09, 0, 0, Math.PI * 2); ctx.fill(); }
  drawHairFront(p.hairStyle, hc, cx, headCY, headRx, headRy);
  if (HAIR_STRANDS) { const [hc2, hx, hy, hrx, hry] = HAIR_STRANDS; ctx.strokeStyle = shade(hc2, 0.78); ctx.lineWidth = 0.8; ctx.globalAlpha = 0.55; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(hx + i * hrx * 0.12, hy - hry * 1.0); ctx.quadraticCurveTo(hx + i * hrx * 0.24, hy - hry * 0.85, hx + i * hrx * 0.27, hy - hry * 0.55); ctx.stroke(); } ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(hx - hrx * 0.25, hy - hry * 0.55, hrx * 0.5, Math.PI * 1.15, Math.PI * 1.45); ctx.stroke(); ctx.globalAlpha = 1; }
  if (EQ.hat) drawHat(EQ.hat, cx, headCY, headRx, headRy);
  if (EQ.acc === 'headphones') drawHeadphones(cx, headCY, headRx, headRy);
  // face
  const ey = drawFace(p, cx, headCY, headRx, headRy, hc, skin, !REDUCED && (AV_T % 4.3) < 0.14, male);
  if (EQ.eyes === 'sunglasses') drawSunglasses(cx, ey, headRx, headRy);
  else if (p.glasses) {
    ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx - headRx * 0.38, ey, headRx * 0.26, 0, Math.PI * 2); ctx.moveTo(cx + headRx * 0.64, ey); ctx.arc(cx + headRx * 0.38, ey, headRx * 0.26, 0, Math.PI * 2);
    ctx.moveTo(cx - headRx * 0.12, ey); ctx.lineTo(cx + headRx * 0.12, ey); ctx.stroke();
  }
  if (EQ.pet) drawPetScene(EQ.pet, { cx, G, L, Y, hipW, armW, shW, H, CW, legC, calfW, ankW }, AV_T, 'front');
  ctx = cv.getContext('2d');
}

// ================= exercises =================
const EXS = [
  { id: 'squat', e: '🦵', n: ['Присідання', 'Dřepy', 'Squats'],
    how: ['Ноги на ширині плечей. Відводьте таз назад, ніби сідаєте на стілець, до паралелі стегон з підлогою. Спина рівна, коліна в бік носків.',
          'Nohy na šířku ramen. Posaďte se dozadu jako na židli, stehna do vodorovné polohy. Rovná záda, kolena směrem ke špičkám.',
          'Feet shoulder-width apart. Sit back as if onto a chair until your thighs are parallel to the floor. Back straight, knees in line with toes.'],
    easy: ['присідайте до стільця', 'dřep na židli', 'squat down to a chair'], hard: ['з вистрибуванням', 's výskokem', 'jump squats'],
    m: [12, 15, 20], f: [12, 15, 20], u: 'reps' },
  { id: 'pushup', e: '💪', n: null,
    how: ["Руки трохи ширше плечей, тіло — рівна лінія від голови до п'ят (або колін). Опускайте груди до опори, лікті під кутом ~45°, і вижміться.",
          'Ruce o něco šíř než ramena, tělo v jedné linii od hlavy k patám (nebo kolenům). Spusťte hrudník k opoře, lokty asi 45°, a vytlačte se.',
          'Hands slightly wider than shoulders, body in a straight line from head to heels (or knees). Lower your chest, elbows at ~45°, then push back up.'],
    easy: ['вища опора (стіл, стіна)', 'vyšší opora (stůl, zeď)', 'higher support (table, wall)'], hard: ['ноги на стільці', 'nohy na židli', 'feet on a chair'],
    m: [['incline', 10], ['full', 10], ['full', 15]], f: [['wall', 10], ['knee', 10], ['full', 8]], u: 'reps' },
  { id: 'dips', e: '🪑', n: ['Трицепс від стільця або ліжка', 'Triceps o židli nebo postel', 'Chair / bed dips (triceps)'],
    how: ['Сядьте на край, руки біля стегон, пальці вперед. Зсуньте таз з опори, згинайте лікті назад до 90° і вижміться вгору. Плечі не піднімайте до вух.',
          'Sedněte si na okraj, ruce vedle stehen, prsty dopředu. Sjeďte pánví z opory, ohýbejte lokty dozadu do 90° a vytlačte se nahoru. Ramena netahejte k uším.',
          'Sit on the edge, hands next to your hips, fingers forward. Slide off, bend your elbows back to 90°, then push up. Keep shoulders away from your ears.'],
    easy: ['коліна зігнуті, ноги ближче', 'pokrčená kolena, nohy blíž', 'bent knees, feet closer'], hard: ['ноги прямі або на іншому стільці', 'propnuté nohy nebo na druhé židli', 'straight legs or feet on another chair'],
    m: [8, 12, 15], f: [6, 10, 12], u: 'reps' },
  { id: 'lunge', e: '🚶', n: ['Випади', 'Výpady', 'Lunges'],
    how: ['Крок уперед і опускайтеся, доки обидва коліна не зігнуться ~90°, заднє майже торкається підлоги. Поверніться й поміняйте ногу.',
          'Krok vpřed a klesejte, až jsou obě kolena v ~90°, zadní skoro u země. Vraťte se a vystřídejte nohy.',
          'Step forward and lower until both knees are at ~90°, back knee almost touching the floor. Step back and switch legs.'],
    easy: ['тримайтеся за стілець', 'držte se židle', 'hold a chair for balance'], hard: ['з вистрибуванням і зміною ніг', 'výskokové výpady', 'jump lunges'],
    m: [8, 10, 12], f: [8, 12, 14], u: 'leg' },
  { id: 'bridge', e: '🍑', n: ['Сідничний місток', 'Hýžďový most', 'Glute bridge'],
    how: ['Ляжте на спину, ноги зігнуті, стопи на підлозі. Підніміть таз, стисніть сідниці на 1–2 с і повільно опустіть.',
          'Lehněte si na záda, pokrčené nohy, chodidla na zemi. Zvedněte pánev, na 1–2 s stáhněte hýždě a pomalu spusťte.',
          'Lie on your back, knees bent, feet flat. Lift your hips, squeeze your glutes for 1–2 s and lower slowly.'],
    easy: ['менша амплітуда', 'menší rozsah', 'smaller range'], hard: ['на одній нозі', 'na jedné noze', 'single leg'],
    m: [12, 15, 20], f: [15, 20, 25], u: 'reps' },
  { id: 'plank', e: '🧱', n: ['Планка', 'Plank', 'Plank'],
    how: ["Упор на передпліччя, тіло рівне від голови до п'ят, живіт напружений, таз не провисає й не задирається.",
          'Opora o předloktí, tělo rovné od hlavy k patám, břicho zpevněné, pánev neprohýbejte ani nezvedejte.',
          "On your forearms, body straight from head to heels, abs tight, hips neither sagging nor raised."],
    easy: ['з колін', 'na kolenou', 'on your knees'], hard: ['по черзі піднімайте руку або ногу', 'střídavě zvedejte ruku nebo nohu', 'lift one arm or leg at a time'],
    m: [20, 40, 60], f: [20, 30, 45], u: 'sec' },
  { id: 'climber', e: '🔥', n: ['Скелелаз', 'Horolezec', 'Mountain climbers'],
    how: ['Упор лежачи на прямих руках. Швидко по черзі підтягуйте коліна до грудей. Тримайте спину рівно.',
          'Vzpor na natažených rukou. Rychle střídavě přitahujte kolena k hrudníku. Záda držte rovně.',
          'Push-up position on straight arms. Quickly drive your knees to your chest one after another. Keep your back flat.'],
    easy: ['руки на ліжку, повільніше', 'ruce na posteli, pomaleji', 'hands on the bed, slower'], hard: ['швидше', 'rychleji', 'faster'],
    m: [20, 30, 40], f: [20, 30, 40], u: 'sec' }
];
const PUSH_NAMES = {
  incline: ['Віджимання від ліжка / столу', 'Kliky o postel / stůl', 'Incline push-ups (bed / table)'],
  wall: ['Віджимання від стіни', 'Kliky o zeď', 'Wall push-ups'],
  knee: ['Віджимання з колін', 'Kliky na kolenou', 'Knee push-ups'],
  full: ['Віджимання', 'Kliky', 'Push-ups']
};
const ROUNDS = [2, 3, 4], WO_MIN = [15, 25, 35];
const calFloor = () => P().sex === 'm' ? 1500 : 1200;
function goalOf() { const p = P(); if (p.goal) return p.goal; return p.weight / Math.pow(p.height / 100, 2) >= 25 ? 'lose' : 'keep'; }
function calTarget(w) {
  const base = baseBurn(w), g = goalOf();
  const low = g === 'lose' && w / Math.pow(P().height / 100, 2) < 20;   // already slim: don't push weight lower
  let tg = g === 'lose' && !low ? base - 500 : g === 'gain' ? base + 250 : base, hit = false;
  if (tg < calFloor()) { tg = calFloor(); hit = true; }
  return { base, tg: Math.round(tg / 10) * 10, hit, g, low };
}
let woLevel = null;

// ---- exercise animations: side-view figure, two key poses, smooth loop ----
// joints: h head, n neck/shoulder, hp hip, k1/f1 near knee/foot, k2/f2 far knee/foot, e1/w1 near elbow/hand (far arm mirrors near one)
const POSES = {
  squat: { T: 2.6, A: { h: [80, 16], n: [80, 27], hp: [80, 57], k1: [82, 77], f1: [84, 97], e1: [90, 31], w1: [103, 31] },
                   B: { h: [88, 37], n: [82, 47], hp: [63, 70], k1: [89, 72], f1: [84, 97], e1: [96, 47], w1: [110, 47] } },
  pushup_full: { T: 2.4, A: { h: [124, 52], n: [112, 58], hp: [57, 79], k1: [38, 88], f1: [20, 97], e1: [112, 78], w1: [112, 97] },
                         B: { h: [124, 82], n: [112, 86], hp: [58, 91], k1: [38, 94], f1: [20, 97], e1: [100, 84], w1: [112, 97] } },
  pushup_knee: { T: 2.4, A: { h: [124, 56], n: [112, 62], hp: [78, 80], k1: [50, 97], f1: [30, 86], e1: [112, 80], w1: [112, 97] },
                         B: { h: [124, 85], n: [112, 88], hp: [80, 92], k1: [50, 97], f1: [30, 86], e1: [100, 88], w1: [112, 97] } },
  pushup_incline: { T: 2.4, prop: 'bed', A: { h: [120, 42], n: [108, 48], hp: [56, 77], k1: [38, 87], f1: [20, 97], e1: [110, 60], w1: [110, 72] },
                                         B: { h: [118, 58], n: [106, 63], hp: [57, 82], k1: [38, 90], f1: [20, 97], e1: [95, 62], w1: [110, 72] } },
  pushup_wall: { T: 2.4, prop: 'wall', A: { h: [108, 26], n: [102, 34], hp: [91, 63], k1: [86, 80], f1: [80, 97], e1: [116, 36], w1: [130, 34] },
                                      B: { h: [121, 25], n: [114, 32], hp: [97, 64], k1: [88, 81], f1: [80, 97], e1: [119, 45], w1: [130, 34] } },
  dips: { T: 2.4, prop: 'chair', A: { h: [64, 28], n: [62, 40], hp: [66, 64], k1: [92, 66], f1: [98, 97], e1: [60, 51], w1: [58, 62] },
                                B: { h: [70, 42], n: [66, 53], hp: [70, 78], k1: [93, 72], f1: [98, 97], e1: [53, 48], w1: [58, 62] } },
  lunge: { T: 2.6, A: { h: [78, 16], n: [78, 27], hp: [78, 57], k1: [92, 77], f1: [100, 97], k2: [66, 77], f2: [56, 97], e1: [70, 42], w1: [78, 54] },
                   B: { h: [78, 32], n: [78, 43], hp: [78, 72], k1: [100, 75], f1: [100, 97], k2: [64, 93], f2: [56, 97], e1: [70, 58], w1: [78, 69] } },
  bridge: { T: 2.4, A: { h: [22, 90], n: [34, 93], hp: [70, 95], k1: [92, 76], f1: [104, 97], e1: [48, 96], w1: [62, 96] },
                    B: { h: [22, 90], n: [36, 92], hp: [72, 73], k1: [96, 72], f1: [104, 97], e1: [48, 96], w1: [62, 96] } },
  plank: { T: 3.2, A: { h: [124, 67], n: [112, 72], hp: [62, 80], k1: [40, 89], f1: [20, 97], e1: [112, 97], w1: [128, 97] },
                   B: { h: [124, 66], n: [112, 71], hp: [62, 79], k1: [40, 88.5], f1: [20, 97], e1: [112, 97], w1: [128, 97] } },
  climber: { T: 0.9, A: { h: [124, 52], n: [112, 58], hp: [62, 74], k1: [88, 84], f1: [72, 95], k2: [40, 87], f2: [20, 97], e1: [112, 78], w1: [112, 97] },
                     B: { h: [124, 52], n: [112, 58], hp: [62, 74], k1: [40, 87], f1: [20, 97], k2: [88, 84], f2: [72, 95], e1: [112, 78], w1: [112, 97] } }
};
let animOn = false;
function startAnims() { if (!animOn) { animOn = true; requestAnimationFrame(animFrame); } }
function animFrame(ts) {
  const cvs = document.querySelectorAll('#woList canvas.anim, #runCanvas');
  if ((curTab !== 'tabTips' && !RUN.on) || !cvs.length) { animOn = false; return; }
  cvs.forEach(c => { if (c.offsetParent !== null || c.id === 'runCanvas' && RUN.on) drawPose(c, ts / 1000); });
  requestAnimationFrame(animFrame);
}
function drawPose(c, time) {
  const key = c.dataset.a === 'pushup' ? 'pushup_' + (c.dataset.v || 'full') : c.dataset.a;
  const P0 = POSES[key]; if (!P0) return;
  const dpr = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight;
  if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  const x = c.getContext('2d'), sc = Math.min(w / 160, h / 110);
  x.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * (w - 160 * sc) / 2, dpr * (h - 110 * sc) / 2);
  x.clearRect(-50, -50, 300, 250);
  // ease in-out loop: pause a little at both ends, like a real controlled rep
  const ph = (time % P0.T) / P0.T, k = (1 - Math.cos(ph * Math.PI * 2)) / 2, e = k * k * (3 - 2 * k);
  const J = {};
  for (const n of ['h', 'n', 'hp', 'k1', 'f1', 'e1', 'w1', 'k2', 'f2']) {
    const a = P0.A[n] || (n === 'k2' ? [P0.A.k1[0] - 3, P0.A.k1[1]] : n === 'f2' ? [P0.A.f1[0] - 3, P0.A.f1[1]] : null);
    const b = P0.B[n] || (n === 'k2' ? [P0.B.k1[0] - 3, P0.B.k1[1]] : n === 'f2' ? [P0.B.f1[0] - 3, P0.B.f1[1]] : null);
    J[n] = [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e];
  }
  // floor + props
  x.strokeStyle = '#d6d0c6'; x.lineWidth = 2; x.beginPath(); x.moveTo(4, 99); x.lineTo(156, 99); x.stroke();
  x.fillStyle = '#c9a77c';
  if (P0.prop === 'bed') { x.fillStyle = '#c9b8e6'; x.fillRect(100, 72, 52, 26); x.fillStyle = '#9d86c9'; x.fillRect(100, 72, 52, 5); }
  if (P0.prop === 'wall') { x.fillStyle = '#d6d0c6'; x.fillRect(131, 4, 10, 95); }
  if (P0.prop === 'chair') { x.fillStyle = '#b7895a'; x.fillRect(26, 62, 34, 5); x.fillRect(28, 62, 4, 37); x.fillRect(54, 62, 4, 37); x.fillRect(26, 34, 4, 30); }
  const seg = (p, q, col, wd) => { x.strokeStyle = col; x.lineWidth = wd; x.lineCap = 'round'; x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]); x.stroke(); };
  const far = '#a9b4c6', near = '#2f6fe0', body = '#2a3550';
  const off = [-2.5, 0], add = (p, o) => [p[0] + o[0], p[1] + o[1]];
  // far limbs first
  seg(J.hp, J.k2, far, 6); seg(J.k2, J.f2, far, 5);
  seg(J.n, add(J.e1, off), far, 5); seg(add(J.e1, off), add(J.w1, off), far, 4);
  // torso + head
  seg(J.n, J.hp, body, 8);
  x.fillStyle = body; x.beginPath(); x.arc(J.h[0], J.h[1], 7, 0, Math.PI * 2); x.fill();
  // near limbs
  seg(J.hp, J.k1, near, 6); seg(J.k1, J.f1, near, 5);
  seg(J.n, J.e1, near, 5); seg(J.e1, J.w1, near, 4);
  // little motion cue
  x.fillStyle = 'rgba(47,111,224,.55)'; x.font = 'bold 11px system-ui';
  if (!['plank', 'climber', 'pushup_wall'].includes(key)) { const down = (P0.B.hp[1] > P0.A.hp[1]) === (ph < 0.5); x.fillText(down ? '↓' : '↑', 148, 14); }
}

// ================= UI =================
let curTab = 'tabMe', curDay = todayStr(), tmDays = 0;
// the app can stay open overnight (phone tab in background): when the date changes, a view that showed
// "today" moves to the new today, so entries are not written into yesterday
let dayAnchor = curDay;
function syncDay() { const td = todayStr(); if (td === dayAnchor) return false; if (curDay === dayAnchor) curDay = td; dayAnchor = td; dirty(); return true; }
function showTab(id) {
  if (!P() && id !== 'tabProfile') { toast(t('tFill')); id = 'tabProfile'; }
  curTab = id;
  document.querySelector('main').scrollTop = 0;
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('on', s.id === id));
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.t === id));
  render();
}
document.querySelectorAll('nav button').forEach(b => b.addEventListener('click', () => showTab(b.dataset.t)));
$('lang').addEventListener('change', e => { LANG = e.target.value; D.lang = LANG; save(); applyLang(); fillStatic(); render(); });

// app colour theme — D.theme: a preset id ('light' = original look, also when missing) or 'custom' with D.themeBg (#rrggbb).
// D.themeCss caches the resulting CSS so storage.js can paint it before the app starts (no light flash).
const THEME_PRESETS = [['light', '#E9F0F5', 'thLight'], ['blue', '#CFE6FA', 'thBlue'], ['mint', '#D3F0E2', 'thMint'], ['lavender', '#E3DCF7', 'thLavender'],
  ['peach', '#FBE2CF', 'thPeach'], ['pink', '#F8DAE5', 'thPink'], ['sand', '#EFE6D2', 'thSand'], ['gray', '#E2E4E8', 'thGray'],
  ['dark', '#0F151C', 'thDark'], ['black', '#000000', 'thBlack']];
const THEME_VARS = ['--bg', '--card', '--line', '--solid'];
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixHex = (h, to, k) => '#' + hexRgb(h).map((c, i) => Math.round(c + (to[i] - c) * k).toString(16).padStart(2, '0')).join('');
function themeVars(bg) {
  const lum = hexRgb(bg).map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }).reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
  if (lum < 0.2) return { a: 'dark', v: { '--bg': bg, '--card': mixHex(bg, [255, 255, 255], 0.08), '--line': mixHex(bg, [255, 255, 255], 0.16), '--solid': mixHex(bg, [255, 255, 255], 0.22) } };
  return { a: 'tint', v: { '--bg': bg, '--line': mixHex(bg, [0, 0, 0], 0.09) } };
}
const themeBg = () => D.theme === 'custom' ? (/^#[0-9a-f]{6}$/i.test(D.themeBg || '') ? D.themeBg : '#E9F0F5') : ((THEME_PRESETS.find(p => p[0] === D.theme) || THEME_PRESETS[0])[1]);
function themeCss() { const p = THEME_PRESETS.find(x => x[0] === D.theme); return (!D.theme || D.theme === 'light' || (!p && D.theme !== 'custom')) ? { a: null, v: {} } : themeVars(themeBg()); }
function applyTheme() {
  const css = themeCss(), root = document.documentElement;
  THEME_VARS.forEach(k => root.style.removeProperty(k));
  if (css.a) root.dataset.theme = css.a; else delete root.dataset.theme;
  for (const k in css.v) root.style.setProperty(k, css.v[k]);
  const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
  const mt = document.querySelector('meta[name="theme-color"]'); if (mt && bg) mt.content = bg;
  const cs = document.querySelector('meta[name="color-scheme"]'); if (cs) cs.content = css.a === 'dark' ? 'dark' : 'light';
  renderThemePal();
}
// The palette is built once and afterwards only updated in place. Rebuilding it would replace the colour <input>,
// and iPhone closes its colour picker as soon as that element disappears (it fires "change" while the slider moves).
function renderThemePal() {
  const box = $('themePal'); if (!box) return;
  const cur = THEME_PRESETS.some(p => p[0] === D.theme) || D.theme === 'custom' ? D.theme : 'light';
  if (!box.dataset.built || box.dataset.lang !== LANG) {
    box.innerHTML = THEME_PRESETS.map(([id, c, key]) => `<button class="sw" data-th="${id}" style="background:${c}" title="${esc(t(key))}" aria-label="${esc(t(key))}"></button>`).join('') +
      `<label class="sw swCustom" title="${esc(t('thCustom'))}" aria-label="${esc(t('thCustom'))}"><span>🌈</span><input type="color" id="themeColor" value="${themeBg()}"></label>`;
    box.dataset.built = '1'; box.dataset.lang = LANG;
  }
  box.querySelectorAll('[data-th]').forEach(b => b.classList.toggle('on', b.dataset.th === cur));
  const lab = box.querySelector('.swCustom'), inp = $('themeColor');
  lab.classList.toggle('on', cur === 'custom');
  lab.style.background = cur === 'custom' ? themeBg() : '';
  if (inp && document.activeElement !== inp && inp.value.toLowerCase() !== themeBg().toLowerCase()) inp.value = themeBg();
  const name = cur === 'custom' ? t('thCustom') : t((THEME_PRESETS.find(p => p[0] === cur) || THEME_PRESETS[0])[2]);
  $('themeName').textContent = t('thNow', { n: name });
}
function setTheme(id, bg) { D.theme = id; if (bg) D.themeBg = bg; D.themeCss = themeCss(); applyTheme(); }
let themeSaveT = 0;
const saveThemeSoon = () => { clearTimeout(themeSaveT); themeSaveT = setTimeout(save, 400); };
$('themePal').addEventListener('click', e => { const b = e.target.closest('[data-th]'); if (!b) return; setTheme(b.dataset.th); save(); });
// live preview while the picker is open; both events only repaint, they never rebuild the palette
['input', 'change'].forEach(ev => $('themePal').addEventListener(ev, e => {
  if (e.target.id !== 'themeColor') return;
  setTheme('custom', e.target.value); saveThemeSoon();
}));
function render() {
  applyTheme();
  $('firstRun').style.display = P() ? 'none' : 'block';
  if (!P()) { renderProfile(); return; }
  if (curTab === 'tabMe') renderMe();
  if (curTab === 'tabToday') renderToday();
  if (curTab === 'tabMeasure') renderMeasure();
  if (curTab === 'tabProgress') renderProgress();
  if (curTab === 'tabProfile') renderProfile();
  if (curTab === 'tabTips') renderTips();
  if (curTab !== 'tabProgress') checkAch();
}

// ---- Me ----
document.querySelectorAll('#timeSeg button').forEach(b => b.addEventListener('click', () => {
  tmDays = +b.dataset.d; if (tmDays === 365) bump('tm');
  document.querySelectorAll('#timeSeg button').forEach(x => x.classList.toggle('on', x === b));
  renderMe();
}));
function renderMe() {
  const a = ser(), td = todayStr();
  const wToday = a[a.length - 1].w;
  let w = wToday, tone = toneAt(td);
  if (tmDays > 0) {
    const h = habits(), k = Math.exp(-tmDays / 21);
    if (h.n) {
      const w0 = w, sp = 1 - 0.6 * calib().conf;
      w = project(tmDays, h, w0);
      const a1 = project(tmDays, h, w0, 1 + 0.12 * sp, 1 - 0.04 * sp), a2 = project(tmDays, h, w0, 1 - 0.04 * sp, 1 + 0.03 * sp);
      let txt = t('tmFuture', { b: signed(Math.round(h.bal), 0), d: tmDays, w: r1(w) });
      if (tmDays >= 30 && Math.abs(a2 - a1) >= 0.6) txt += ' ' + t('tmRange', { lo: Math.round(Math.min(a1, a2)), hi: Math.round(Math.max(a1, a2)) });
      if (tmDays >= 90 && Math.abs(w - project(tmDays - 30, h, w0)) < 0.6 && Math.abs(w - w0) > 2) txt += ' ' + t('tmPlateau');
      if (w / Math.pow(P().height / 100, 2) < 18.5) txt += ' ' + t('tmLow');
      $('timeNote').textContent = txt;
    } else $('timeNote').textContent = t('tmNoData');
    tone = clamp(P().sporty + (tone - P().sporty) * k + h.toneDaily * 21 * (1 - k), 0, 100);
  } else $('timeNote').textContent = t('tmNow');
  { const c = calib(); $('calNote').textContent = c.conf > 0.15 ? (Math.abs(c.k) < 50 ? t('calOk', { n: c.n, d: c.days }) : t(c.k > 0 ? 'calMore' : 'calLess', { n: c.n, d: c.days, k: Math.abs(c.k) })) : t('calHint'); }
  const bmi = w / Math.pow(P().height / 100, 2);
  $('formTag').textContent = (P().name ? P().name + ' · ' : '') + formOf(w, tone);
  $('mWeight').textContent = r1(w) + ' ' + t('kg');
  $('mBmi').textContent = r1(bmi);
  $('mNorm').textContent = Math.round(baseBurn(w));
  const tt = dayTotals(td, wToday);
  $('mToday').textContent = tt.logged ? signed(Math.round(tt.bal), 0) : '–';
  const { g, src } = girths(w, tone, td);
  $('girthList').innerHTML = GIRTH_KEYS.map(k => `<div class="item"><span>${t(k)}</span><span><b>${r1(g[k])} ${t('cm')}</b><em>${esc(src[k])}</em></span></div>`).join('');
  renderGoal(wToday);
  renderRewards();
  $('avW').textContent = r1(w) + ' ' + t('kg');
  { const lm = D.meas.filter(m => m.weight).sort((a, b) => a.date < b.date ? -1 : 1).pop();
    const show = lm && tmDays === 0 && lm.date !== P().startDate, dd = lm ? lm.date.split('-') : [];
    $('avMeas').textContent = show ? t('measW', { w: r1(lm.weight), d: +dd[2] + '.' + +dd[1] + '.' }) : '';
    $('avWeight').classList.toggle('hasMeas', !!show); }
  startAvatar(w, tone);
}

const HINT_KEY = 'mirro.tapHintSeen';
function hideTapHint() { try { localStorage.setItem(HINT_KEY, '1'); } catch (e) {} const h = $('avHint'); if (h) h.style.display = 'none'; }
try { if (localStorage.getItem(HINT_KEY)) $('avHint').style.display = 'none'; } catch (e) {}
$('avatar').addEventListener('click', e => {
  hideTapHint();
  const r = e.currentTarget.getBoundingClientRect();
  if (petTap(e.clientX - r.left, e.clientY - r.top)) return;
  AV_WAVE = 2.2; if (REDUCED && AV_STATE) { $('avWeight').classList.add('dim'); drawAvatar(AV_STATE.w, AV_STATE.tone); setTimeout(() => { AV_WAVE = 0; $('avWeight').classList.remove('dim'); if (AV_STATE) drawAvatar(AV_STATE.w, AV_STATE.tone); }, 2200); }
  const s = streakNow(), nm = P() && P().name ? ', ' + P().name : '';
  toast(t('hello', { n: nm }) + (s ? '  ' + t('streak', { n: s }) : ''));
});
// ---- Today ----
function fillStatic() {
  const sel = $('aType'), v = sel.value;
  sel.innerHTML = ACTS.map(a => `<option value="${a.id}">${esc(a.n[LI()])}</option>`).join('');
  if (v) sel.value = v;
  $('msFields').innerHTML = [['weight', t('weightKg'), '0.1'], ...GIRTH_KEYS.map(k => [k, t(k) + ', ' + t('cm'), '0.5'])]
    .map(([k, lbl, st]) => `<div><label>${esc(lbl)}</label><input id="ms_${k}" type="number" step="${st}" inputmode="decimal"></div>`).join('');
}
$('dDone').addEventListener('change', e => { day(curDay).done = e.target.checked; save(); dirty(); renderToday(); });
$('dayPrev').addEventListener('click', () => { curDay = addDays(curDay, -1); renderToday(); });
$('dayNext').addEventListener('click', () => { if (curDay < todayStr()) curDay = addDays(curDay, 1); renderToday(); });
function renderToday() {
  syncDay();
  const td = todayStr();
  if (curDay > td) curDay = td;
  $('dayLbl').textContent = (curDay === td ? t('today') + ', ' : '') + fmtDay(curDay);
  $('dayNext').disabled = curDay >= td;
  $('dayPrev').disabled = diffDays(curDay, td) >= 365;
  $('lateNote').style.display = diffDays(curDay, td) > 1 ? 'block' : 'none';
  const d = peekDay(curDay), w = weightAt(curDay), tt = dayTotals(curDay, w);
  $('dEaten').textContent = Math.round(tt.eaten);
  $('dBurned').textContent = Math.round(tt.burned);
  if (tt.logged) {
    $('dBal').textContent = signed(Math.round(tt.bal), 0) + ' ' + t('kcal');
    $('dBal').className = 'balance ' + (tt.bal > 0 ? 'pos' : 'neg');
    $('dBalNote').textContent = tt.complete ? t('perDay', { v: signed(tt.bal / rhoAt(w), 2) }) : t('dayPartial');
  } else { $('dBal').textContent = '–'; $('dBal').className = 'balance'; $('dBalNote').textContent = t('noFood'); }
  const ct = calTarget(w);
  $('dTarget').textContent = t('target', { t: ct.tg, r: Math.max(0, Math.round(ct.tg + tt.ex / 2 - tt.eaten)) });
  $('dDone').checked = d.done === true || (d.done !== false && tt.complete);
  $('dDone').disabled = !tt.logged;
  $('dDoneHint').textContent = !tt.logged ? '' : tt.complete ? (d.done === true ? '' : t('dayAuto')) : t('dayLow');
  renderMeals(d); renderMacros(w, tt); renderWaterSteps(d, w);
  $('actList').innerHTML = d.acts.map((a, i) => `<div class="item"><span>${esc(actDef(a.id).n[LI()])}<em>${a.min} ${t('min')} · ${Math.round(a.k)} ${t('kcal')}</em></span><button data-da="${i}">×</button></div>`).join('');
  actPreview();
  if ($('fridgeText').value === '' && D.fridge) $('fridgeText').value = D.fridge;
  fridgeNote();
  renderRewards();
}
$('actList').addEventListener('click', e => { const b = e.target.closest('[data-da]'); if (!b) return; day(curDay).acts.splice(+b.dataset.da, 1); save(); dirty(); renderToday(); });
function actKcal() {
  const a = actDef($('aType').value), min = num($('aMin').value) || 0;
  if (a.id === 'custom') return num($('aKcal').value) || 0;
  return netMet(a) * weightAt(curDay) * min / 60;
}
function actPreview() {
  if (!P()) return;
  const custom = $('aType').value === 'custom';
  $('aKcalBox').style.display = custom ? 'block' : 'none';
  $('aPreview').textContent = custom ? '' : t('approx', { k: Math.round(actKcal()) });
}
['aType', 'aMin', 'aKcal'].forEach(id => $(id).addEventListener('input', actPreview));
$('aAdd').addEventListener('click', () => {
  const min = num($('aMin').value), k = actKcal();
  if (!min || min <= 0 || min > 900) return toast(t('minutes') + '?');
  if ($('aType').value === 'custom' && (!k || k <= 0)) return toast(t('tKcal'));
  syncDay(); day(curDay).acts.push({ uid: uid(), id: $('aType').value, min: Math.round(min), k: Math.round(k), at: Date.now() });
  save(); dirty(); renderToday(); toast(t('tAdded', { n: actDef($('aType').value).n[LI()] }));
});

// ---- Fridge → recipes ----
let SAMPLE = null, fridgeRecipes = [];
(async () => { try { if (AI_ON && window.claude && typeof claude.use === 'function') SAMPLE = await claude.use('sample'); } catch (e) { SAMPLE = null; } fridgeNote(); })();
function fridgeNote() { const el = $('fridgeNote'); if (el && !fridgeRecipes.length) el.textContent = SAMPLE ? t('fridgeAI') : t('fridgeLocal'); }
// built-in fallback: ingredient keywords in UA / CZ / EN
const ING = {
  egg: /яйц|яєць|яйо|vejc|vajec|vajíč|egg/i, potato: /картопл|картош|бульб|brambor|potat/i, onion: /цибул|cibul|onion/i,
  sausage: /ковбас|сосиск|сардельк|шинк|párk|klobás|salám|uzenin|šunk|sausage|salami|ham\b/i, chicken: /курк|курят|курич|kuř|chicken/i,
  rice: /(^|[^а-яіїє])рис|rýž|\brice/i, pasta: /макарон|спагет|паст|локшин|těstovin|špaget|nudl|pasta|spaghetti|noodle/i,
  cheese: /(^|[^а-яіїє])сир($|[^а-яіїє])|сиру|sýr|eidam|cheese/i, cottage: /кисломолочн|творог|сирок|tvaroh|cottage/i,
  tomato: /помідор|томат|rajč|tomat/i, milk: /молок|mlék|mlík|milk/i, oats: /вівсян|геркулес|ovesn|vločk|oat/i,
  banana: /банан|banán|banana/i, buckwheat: /гречк|pohank|buckwheat/i, cabbage: /капуст|zelí|cabbage/i,
  carrot: /морк|mrkev|mrkv|carrot/i, bread: /хліб|батон|тост|chleb|chléb|rohlík|toast|bread/i, flour: /борошн|мук|mouk|flour/i,
  cucumber: /огір|okurk|cucumber/i, mushroom: /гриб|печериц|houb|žampion|mushroom/i, pepper: /перець|paprik|bell pepper/i
};
const LOCAL_RECIPES = [
  { need: ['egg'], opt: ['milk', 'cheese', 'tomato'], k: 320, m: 10, p: 20, n: ['Омлет', 'Omeleta', 'Omelette'],
    s: [['Збийте 3 яйця з ложкою молока, посоліть.', 'Вилийте на розігріту пательню з краплею олії.', 'Готуйте під кришкою 4–5 хв, за бажанням додайте сир або помідор.'],
        ['Rozšlehejte 3 vejce s lžící mléka, osolte.', 'Vlijte na rozpálenou pánev s kapkou oleje.', 'Pod pokličkou 4–5 min, podle chuti přidejte sýr nebo rajče.'],
        ['Whisk 3 eggs with a spoon of milk, add salt.', 'Pour into a hot pan with a drop of oil.', 'Cook covered 4–5 min; add cheese or tomato if you like.']] },
  { need: ['potato', 'onion'], opt: ['egg', 'sausage'], k: 420, m: 25, p: 8, n: ['Смажена картопля з цибулею', 'Opékané brambory s cibulí', 'Fried potatoes with onion'],
    s: [['Наріжте 3 картоплини соломкою, цибулю півкільцями.', 'Смажте картоплю на олії 15 хв, перевертайте.', 'Додайте цибулю, посоліть і смажте ще 5 хв.'],
        ['Nakrájejte 3 brambory na hranolky, cibuli na půlkolečka.', 'Opékejte brambory na oleji 15 min, obracejte.', 'Přidejte cibuli, osolte a opékejte dalších 5 min.'],
        ['Cut 3 potatoes into sticks and an onion into half-rings.', 'Fry the potatoes in oil for 15 min, turning.', 'Add the onion, salt and fry 5 more min.']] },
  { need: ['potato', 'sausage'], opt: ['onion', 'cucumber'], k: 600, m: 25, p: 20, n: ['Варена картопля з сосисками', 'Vařené brambory s párky', 'Boiled potatoes with sausages'],
    s: [['Зваріть очищену картоплю в підсоленій воді 20 хв.', 'Сосиски проваріть або обсмажте 5 хв.', 'Подавайте з огірком або цибулею.'],
        ['Uvařte oloupané brambory v osolené vodě 20 min.', 'Párky povařte nebo opečte 5 min.', 'Podávejte s okurkou nebo cibulí.'],
        ['Boil peeled potatoes in salted water for 20 min.', 'Boil or fry the sausages for 5 min.', 'Serve with cucumber or onion.']] },
  { need: ['chicken', 'rice'], opt: ['carrot', 'onion'], k: 560, m: 30, p: 40, n: ['Курка з рисом', 'Kuře s rýží', 'Chicken with rice'],
    s: [['Зваріть рис (1 частина рису на 2 води) 15–18 хв.', 'Наріжте курку шматочками, обсмажте 8–10 хв з цибулею й морквою.', 'Посоліть, поперчіть, подавайте разом.'],
        ['Uvařte rýži (1 díl na 2 díly vody) 15–18 min.', 'Kuře nakrájejte, opečte 8–10 min s cibulí a mrkví.', 'Osolte, opepřete a podávejte.'],
        ['Cook the rice (1 part rice to 2 water) 15–18 min.', 'Cut the chicken into pieces and fry 8–10 min with onion and carrot.', 'Season and serve together.']] },
  { need: ['pasta'], opt: ['cheese', 'tomato', 'sausage'], k: 550, m: 15, p: 18, n: ['Макарони з сиром і помідором', 'Těstoviny se sýrem a rajčaty', 'Pasta with cheese and tomato'],
    s: [['Зваріть 100 г макаронів за інструкцією.', 'Нарізаний помідор протушкуйте 3 хв на пательні.', 'Змішайте з макаронами, посипте тертим сиром.'],
        ['Uvařte 100 g těstovin podle návodu.', 'Nakrájené rajče poduste 3 min na pánvi.', 'Smíchejte s těstovinami a posypte strouhaným sýrem.'],
        ['Cook 100 g pasta as on the pack.', 'Simmer a chopped tomato in a pan for 3 min.', 'Mix with the pasta and top with grated cheese.']] },
  { need: ['oats'], opt: ['milk', 'banana'], k: 350, m: 8, p: 12, n: ['Вівсянка з бананом', 'Ovesná kaše s banánem', 'Oatmeal with banana'],
    s: [['Залийте 60 г вівсянки 200 мл молока або води.', 'Варіть 5 хв, помішуючи.', 'Додайте нарізаний банан.'],
        ['Zalijte 60 g vloček 200 ml mléka nebo vody.', 'Vařte 5 min za stálého míchání.', 'Přidejte nakrájený banán.'],
        ['Cover 60 g oats with 200 ml milk or water.', 'Cook 5 min, stirring.', 'Add a sliced banana.']] },
  { need: ['buckwheat'], opt: ['chicken', 'mushroom', 'onion'], k: 400, m: 25, p: 18, n: ['Гречка з грибами або куркою', 'Pohanka s houbami nebo kuřetem', 'Buckwheat with mushrooms or chicken'],
    s: [['Зваріть гречку (1:2 з водою) 15 хв.', 'Обсмажте гриби або курку з цибулею 8 хв.', 'Змішайте, посоліть.'],
        ['Uvařte pohanku (1:2 s vodou) 15 min.', 'Opečte houby nebo kuře s cibulí 8 min.', 'Smíchejte a osolte.'],
        ['Cook buckwheat (1:2 with water) 15 min.', 'Fry mushrooms or chicken with onion 8 min.', 'Mix and season.']] },
  { need: ['cabbage'], opt: ['carrot', 'cucumber'], k: 120, m: 10, p: 3, n: ['Салат з капусти й моркви', 'Zelný salát s mrkví', 'Cabbage and carrot salad'],
    s: [['Тонко наріжте капусту, натріть моркву.', "Посоліть і трохи пом'яйте руками.", 'Заправте ложкою олії й краплею оцту.'],
        ['Nakrouhejte zelí, nastrouhejte mrkev.', 'Osolte a trochu promačkejte rukama.', 'Zakápněte lžící oleje a trochou octa.'],
        ['Thinly slice cabbage and grate a carrot.', 'Salt and squeeze a little by hand.', 'Dress with a spoon of oil and a dash of vinegar.']] },
  { need: ['bread', 'cheese'], opt: ['tomato', 'sausage'], k: 330, m: 7, p: 15, n: ['Гарячі бутерброди з сиром', 'Zapečené chlebíčky se sýrem', 'Cheese toasts'],
    s: [['Покладіть на 2 скибки хліба помідор і сир.', 'Запікайте в духовці або на пательні під кришкою 5 хв.', 'Їжте теплими.'],
        ['Na 2 krajíce chleba dejte rajče a sýr.', 'Zapečte v troubě nebo na pánvi pod pokličkou 5 min.', 'Jezte teplé.'],
        ['Top 2 slices of bread with tomato and cheese.', 'Bake or cook covered in a pan for 5 min.', 'Eat warm.']] },
  { need: ['cottage', 'egg'], opt: ['flour'], k: 450, m: 20, p: 30, n: ['Сирники', 'Tvarohové lívance', 'Cottage cheese pancakes'],
    s: [['Змішайте 250 г кисломолочного сиру, яйце й 2 ложки борошна.', 'Сформуйте невеликі коржики.', 'Обсмажте на малій кількості олії по 3 хв з кожного боку.'],
        ['Smíchejte 250 g tvarohu, vejce a 2 lžíce mouky.', 'Vytvořte malé placičky.', 'Opečte na troše oleje 3 min z každé strany.'],
        ['Mix 250 g cottage cheese, an egg and 2 spoons of flour.', 'Shape small patties.', 'Fry in a little oil, 3 min per side.']] },
  { need: ['potato', 'carrot'], opt: ['onion', 'cabbage'], k: 200, m: 30, p: 5, n: ['Овочевий суп', 'Zeleninová polévka', 'Vegetable soup'],
    s: [['Наріжте картоплю, моркву й цибулю кубиками.', 'Залийте 1,5 л води, варіть 20 хв.', 'Посоліть, додайте спеції чи зелень.'],
        ['Nakrájejte brambory, mrkev a cibuli na kostičky.', 'Zalijte 1,5 l vody a vařte 20 min.', 'Osolte, přidejte koření nebo bylinky.'],
        ['Dice potato, carrot and onion.', 'Add 1.5 l water and simmer 20 min.', 'Season, add herbs or spices.']] },
  { need: ['chicken'], opt: ['tomato', 'cucumber', 'cabbage'], k: 350, m: 20, p: 35, n: ['Салат з куркою', 'Salát s kuřecím masem', 'Chicken salad'],
    s: [['Обсмажте або зваріть 150 г курки, наріжте.', 'Наріжте овочі, що є: помідор, огірок, капусту.', 'Змішайте, заправте олією або йогуртом.'],
        ['Opečte nebo uvařte 150 g kuřete, nakrájejte.', 'Nakrájejte zeleninu: rajče, okurku, zelí.', 'Smíchejte, zakápněte olejem nebo jogurtem.'],
        ['Fry or boil 150 g chicken and slice it.', 'Chop any veg you have: tomato, cucumber, cabbage.', 'Mix and dress with oil or yogurt.']] },
  { need: ['egg', 'potato'], opt: ['onion', 'sausage'], k: 480, m: 25, p: 22, n: ['Картопля з яйцем на пательні', 'Brambory s vejci na pánvi', 'Potato and egg skillet'],
    s: [['Обсмажте нарізану картоплю 15 хв.', 'Залийте 2–3 збитими яйцями.', 'Готуйте під кришкою 4 хв.'],
        ['Opečte nakrájené brambory 15 min.', 'Zalijte 2–3 rozšlehanými vejci.', 'Pod pokličkou 4 min.'],
        ['Fry sliced potatoes 15 min.', 'Pour over 2–3 beaten eggs.', 'Cook covered 4 min.']] },
  { need: ['rice'], opt: ['carrot', 'onion', 'egg', 'pepper'], k: 380, m: 20, p: 10, n: ['Рис з овочами', 'Rýže se zeleninou', 'Rice with vegetables'],
    s: [['Зваріть рис.', 'Обсмажте моркву, цибулю й перець 5 хв.', 'Додайте рис (і яйце, якщо є), перемішайте 2 хв.'],
        ['Uvařte rýži.', 'Opečte mrkev, cibuli a papriku 5 min.', 'Přidejte rýži (a vejce, pokud máte) a 2 min promíchejte.'],
        ['Cook the rice.', 'Fry carrot, onion and pepper 5 min.', 'Add the rice (and an egg if you have one), stir 2 min.']] }
];
function localRecipes(text) {
  const have = new Set(Object.keys(ING).filter(k => ING[k].test(text)));
  return LOCAL_RECIPES.filter(r => r.need.every(n => have.has(n)))
    .map(r => ({ r, score: r.need.length * 2 + r.opt.filter(o => have.has(o)).length }))
    .sort((a, b) => b.score - a.score).slice(0, 5)
    .map(({ r }) => ({ name: r.n[LI()], kcal: r.k, time: r.m, protein: r.p, uses: [], missing: [], steps: r.s[LI()] }));
}
function renderRecipes() {
  $('fridgeOut').innerHTML = fridgeRecipes.map((r, i) => `<div class="rec"><h3>${esc(r.name)}</h3>
    <div class="meta">${t('perPortion', { k: Math.round(r.kcal) })}${r.time ? ' · ' + t('minW', { m: Math.round(r.time) }) : ''}${r.protein ? ' · ' + t('protW', { g: Math.round(r.protein) }) : ''}</div>
    ${r.uses && r.uses.length ? `<div class="ing">${t('haveW')}: ${esc(r.uses.join(', '))}</div>` : ''}
    ${r.missing && r.missing.length ? `<div class="ing">${t('buyW')}: ${esc(r.missing.join(', '))}</div>` : ''}
    <ol>${(r.steps || []).map(st => `<li>${esc(st)}</li>`).join('')}</ol>
    <button class="btn ghost" data-eat="${i}">${t('addEaten', { k: Math.round(r.kcal) })}</button></div>`).join('');
}
$('fridgeOut').addEventListener('click', e => { const b = e.target.closest('[data-eat]'); if (!b) return; const r = fridgeRecipes[+b.dataset.eat]; addFood(r.name, r.kcal, { p: r.protein, f: r.fat, c: r.carbs, src: 'ai' }); });
$('fridgeText').addEventListener('input', () => { D.fridge = $('fridgeText').value; save(); });
let fridgeBusy = false;
$('fridgeBtn').addEventListener('click', async () => {
  const text = $('fridgeText').value.trim();
  if (!text) return toast(t('fridgeEmpty'));
  if (fridgeBusy) return;
  const note = $('fridgeNote');
  if (!SAMPLE) {
    fridgeRecipes = localRecipes(text); renderRecipes(); if (fridgeRecipes.length) bump('fridge');
    note.textContent = t('fridgeLocal') + (fridgeRecipes.length ? '' : ' ' + t('fridgeNone'));
    return;
  }
  fridgeBusy = true; $('fridgeBtn').disabled = true; note.textContent = t('fridgeThinking'); $('fridgeOut').innerHTML = '';
  const td = todayStr(), w = weightAt(td), ct = calTarget(w), tt = dayTotals(td, w);
  const left = Math.max(0, Math.round(ct.tg + tt.ex / 2 - tt.eaten));
  const langName = { uk: 'Ukrainian', cs: 'Czech', en: 'English' }[LANG];
  const goal = ct.g === 'lose' ? 'lose weight' : ct.g === 'gain' ? 'build muscle' : 'maintain weight';
  const prompt = 'You are a practical home-cooking assistant. Write ALL text in ' + langName + '.\n' +
    'Ingredients the user has (their own words, may be informal):\n<<<\n' + text.slice(0, 800) + '\n>>>\n' +
    'Assume a basic pantry: salt, pepper, oil, water, common spices.\n' +
    'User: ' + (P().sex === 'm' ? 'man' : 'woman') + ', ' + P().age + ' years, goal: ' + goal + '. Daily target ≈ ' + ct.tg + ' kcal, about ' + left + ' kcal still left today.\n' +
    'Suggest 3 to 5 simple dishes that mainly use these ingredients (at most 2 missing items each). Prefer filling, high-protein options that suit the goal. Give realistic calories for ONE portion.\n' +
    'Return ONLY JSON, no markdown: {"recipes":[{"name":string,"kcal":number,"protein":number,"fat":number,"carbs":number,"time":number,"uses":[string],"missing":[string],"steps":[string]}]} — "time" in minutes, "protein", "fat", "carbs" in grams per portion, 3–5 short steps.';
  try {
    let v = await SAMPLE.json(prompt, { modelTier: 'default' });
    if (typeof v === 'string') { try { v = JSON.parse(v); } catch (e) {} }
    const list = (v && Array.isArray(v.recipes) ? v.recipes : Array.isArray(v) ? v : [])
      .filter(r => r && r.name && isFinite(+r.kcal) && +r.kcal > 0 && +r.kcal < 3000)
      .slice(0, 5).map(r => ({ name: String(r.name).slice(0, 80), kcal: +r.kcal, protein: +r.protein || 0, fat: isFinite(+r.fat) ? +r.fat : null, carbs: isFinite(+r.carbs) ? +r.carbs : null, time: +r.time || 0,
        uses: (r.uses || []).map(String).slice(0, 10), missing: (r.missing || []).map(String).slice(0, 4), steps: (r.steps || []).map(String).slice(0, 6) }));
    fridgeRecipes = list.length ? list : localRecipes(text); if (fridgeRecipes.length) bump('fridge');
    renderRecipes();
    note.textContent = list.length ? t('fridgeAI') : t('fridgeNone');
  } catch (e) {
    if (e && e.code === 'not_granted') { SAMPLE = null; fridgeRecipes = localRecipes(text); renderRecipes(); note.textContent = t('fridgeLocal'); }
    else note.textContent = t('fridgeErr');
  } finally { fridgeBusy = false; $('fridgeBtn').disabled = false; }
});

// ---- v2: meals, food search sheet, dish builder, water, steps ----
const r1n = v => Math.round(v * 10) / 10;
function addFood(n, k, x) {
  x = x || {}; syncDay();
  const e = { uid: uid(), n: n || t('food'), k: Math.round(k), meal: x.meal || defaultMeal(), at: Date.now() };
  ['p', 'f', 'c'].forEach(m => { if (x[m] != null && isFinite(+x[m])) e[m] = r1n(+x[m]); });
  if (x.g) e.g = Math.round(x.g);
  if (x.src) e.src = x.src;
  if (x.id) e.id = x.id;
  if (x.approx) e.approx = x.approx;
  day(curDay).foods.push(e);
  save(); dirty(); renderToday(); toast(t('tAdded', { n: e.n }) + (diffDays(curDay, todayStr()) > 1 ? ' · ' + t('noPtsLate') : ''));
}
function macroLine(m) { return `${t('prot')[0]} ${Math.round(m.p || 0)} · ${t('fat')[0]} ${Math.round(m.f || 0)} · ${t('carb')[0]} ${Math.round(m.c || 0)} ${t('gU')}`; }

function renderMeals(d) {
  const html = MEALS.map(meal => {
    const items = d.foods.map((f, i) => ({ f, i })).filter(x => (x.f.meal || 'snack') === meal);
    const kc = items.reduce((a, x) => a + x.f.k, 0);
    return `<div class="meal"><div class="mealHead"><b>${t(MEAL_KEY[meal])}</b><span class="muted">${kc ? Math.round(kc) + ' ' + t('kcal') : ''}</span><button class="chip" data-addmeal="${meal}">${t('addBtn')}</button></div>
      ${items.map(({ f, i }) => `<div class="item"><span>${esc(f.n)}${f.g ? ` <em>${f.g} ${t('gU')}</em>` : ''}<br><em style="margin:0">${f.approx ? '≈ ' : ''}${f.k} ${t('kcal')}${f.approx ? ` (${f.approx[0]}–${f.approx[1]})` : ''}${f.p != null ? ' · ' + macroLine(f) : ''}</em></span><button data-df="${i}">×</button></div>`).join('')}</div>`;
  }).join('');
  $('meals').innerHTML = html;
}
function renderMacros(w, tt) {
  const mt = macroTargets(w);
  const row = (lbl, v, tg, col) => `<div class="mrow"><div class="mlab"><span>${lbl}</span><span>${Math.round(v)} / ${tg} ${t('gU')}</span></div><div class="bar"><i style="width:${clamp(v / tg * 100, 0, 100)}%;background:${v > tg * 1.1 ? 'var(--bad)' : col}"></i></div></div>`;
  $('macroBars').innerHTML = row(t('prot'), tt.p, mt.p, '#2f6fe0') + row(t('fat'), tt.f, mt.f, '#e8a200') + row(t('carb'), tt.c, mt.c, '#2e9b52');
}
$('meals').addEventListener('click', e => {
  const a = e.target.closest('[data-addmeal]'); if (a) return openSheet(a.dataset.addmeal);
  const b = e.target.closest('[data-df]'); if (b) { day(curDay).foods.splice(+b.dataset.df, 1); save(); dirty(); renderToday(); }
});

// water + steps
function renderWaterSteps(d, w) {
  const n = d.water || 0;
  $('waterRow').innerHTML = Array.from({ length: 8 }, (_, i) => `<button class="glass${i < n ? ' on' : ''}" data-gl="${i}">${i < n ? '💧' : ''}</button>`).join('');
  $('waterN').textContent = t('waterN', { n });
  if (document.activeElement !== $('stepsIn')) $('stepsIn').value = d.steps || '';
  $('stepsK').textContent = d.steps ? t('stepsKcal', { k: Math.round(d.steps * w * 0.0003) }) : '';
}
$('waterRow').addEventListener('click', e => {
  const b = e.target.closest('[data-gl]'); if (!b) return;
  syncDay(); const i = +b.dataset.gl, dd = day(curDay); dd.water = (dd.water || 0) === i + 1 ? i : i + 1; dd.wAt = Date.now(); save(); renderToday();
});
$('stepsSave').addEventListener('click', () => {
  syncDay(); const v = num($('stepsIn').value); const dd = day(curDay);
  dd.steps = v && v > 0 && v < 100000 ? Math.round(v) : 0; dd.sAt = Date.now(); save(); dirty(); renderToday(); toast(t('stepsSaved'));
});

// ---- add-food sheet ----
let sheetMeal = 'breakfast', sheetTab = 'db', sheetSel = null;
function openSheet(meal) { sheetMeal = meal; sheetTab = 'db'; sheetSel = null; $('sheet').classList.remove('hidden'); renderSheet(); setTimeout(() => { const q = $('sq'); if (q) q.focus(); }, 50); }
function closeSheet() { $('sheet').classList.add('hidden'); }
$('sheetClose').addEventListener('click', closeSheet);
$('sheet').addEventListener('click', e => { if (e.target.id === 'sheet') closeSheet(); });
document.querySelectorAll('#sheetTabs button').forEach(b => b.addEventListener('click', () => { sheetTab = b.dataset.st; sheetSel = null; renderSheet(); }));
const mealSelect = () => `<label>${t('mealW')}</label><select id="sMeal">${MEALS.map(m => `<option value="${m}"${m === sheetMeal ? ' selected' : ''}>${t(MEAL_KEY[m])}</option>`).join('')}</select>`;
function foodRow(f) { return `<div class="res" data-fid="${f.id}"><span>${esc(f.n[LI()])}<br><em>${f.k} ${t('kcal')} ${t('per100')} · ${macroLine(f)}</em></span><b>›</b></div>`; }
function renderSheet() {
  $('sheetTitle').textContent = t(MEAL_KEY[sheetMeal]);
  document.querySelectorAll('#sheetTabs button').forEach(b => b.classList.toggle('on', b.dataset.st === sheetTab));
  const body = $('sheetBody');
  if (sheetTab === 'db') {
    if (sheetSel) {
      const f = fdb(sheetSel);
      body.innerHTML = `<button class="chip" id="sBack">${t('back')}</button><h3 style="margin:10px 0 2px">${esc(f.n[LI()])}</h3><p class="muted">${f.k} ${t('kcal')} ${t('per100')} · ${macroLine(f)}</p>
        <label>${t('grams')}</label><input id="sG" type="number" inputmode="numeric" value="${f.por}">
        <div class="chips">${[0.5, 1, 1.5, 2].map(m => `<button class="chip" data-mul="${m}">${Math.round(f.por * m)} ${t('gU')}</button>`).join('')}</div>
        ${mealSelect()}<p class="calc" id="sCalc"></p><button class="btn" id="sAdd">${t('add')}</button>`;
      const upd = () => { const g = num($('sG').value) || 0, m = macroOf(f, g); $('sCalc').textContent = `${Math.round(m.k)} ${t('kcal')} · ${macroLine(m)}`; };
      $('sG').addEventListener('input', upd); upd();
      body.querySelectorAll('[data-mul]').forEach(b => b.addEventListener('click', () => { $('sG').value = Math.round(f.por * +b.dataset.mul); upd(); }));
      $('sBack').addEventListener('click', () => { sheetSel = null; renderSheet(); });
      $('sAdd').addEventListener('click', () => {
        const g = num($('sG').value); if (!g || g <= 0 || g > 3000) return toast(t('grams') + '?');
        const m = macroOf(f, g); sheetMeal = $('sMeal').value;
        D.recent = [f.id, ...(D.recent || []).filter(x => x !== f.id)].slice(0, 12);
        addFood(f.n[LI()], m.k, { p: m.p, f: m.f, c: m.c, g, meal: sheetMeal, src: 'db', id: f.id }); closeSheet();
      });
      return;
    }
    body.innerHTML = `<input id="sq" data-ph="searchPh" placeholder="${t('searchPh')}" autocomplete="off"><div id="sres"></div><p class="muted" style="margin-top:8px">${t('dbNote')}</p>`;
    const draw = () => {
      const q = $('sq').value, res = searchFoods(q);
      if (q.trim()) $('sres').innerHTML = res.length ? res.map(foodRow).join('') : `<p class="muted" style="padding:10px 4px">${t('nothingFound')}</p>`;
      else {
        const rec = (D.recent || []).map(fdb).filter(Boolean);
        const pop = ['egg', 'chicken_breast', 'rice', 'potato', 'bread', 'cottage', 'banana', 'beer', 'cheese', 'pasta'].map(fdb).filter(f => !rec.includes(f));
        $('sres').innerHTML = (rec.length ? `<p class="sub">${t('recent')}</p>` + rec.map(foodRow).join('') : '') + `<p class="sub">${t('popular')}</p>` + pop.map(foodRow).join('');
      }
    };
    $('sq').addEventListener('input', draw); draw();
    $('sres').addEventListener('click', e => { const r = e.target.closest('[data-fid]'); if (r) { sheetSel = r.dataset.fid; renderSheet(); } });
  } else if (sheetTab === 'dish') {
    const ds = D.dishes || [];
    if (sheetSel) {
      const d0 = ds.find(x => x.id === sheetSel); if (!d0) { sheetSel = null; return renderSheet(); }
      body.innerHTML = `<button class="chip" id="sBack">${t('back')}</button><h3 style="margin:10px 0 2px">${esc(d0.n)}</h3><p class="muted">1 ${t('portionW')}: ${Math.round(d0.k)} ${t('kcal')} · ${macroLine(d0)}</p>
        <label>${t('portions')}</label><input id="sP" type="number" step="0.5" inputmode="decimal" value="1">
        ${mealSelect()}<p class="calc" id="sCalc"></p><button class="btn" id="sAdd">${t('add')}</button>
        <div class="grid2"><button class="btn ghost" id="sEdit">${t('editW')}</button><button class="btn danger" id="sDel">${t('delW')}</button></div>`;
      const upd = () => { const n = num($('sP').value) || 0; $('sCalc').textContent = `${Math.round(d0.k * n)} ${t('kcal')} · ${macroLine({ p: d0.p * n, f: d0.f * n, c: d0.c * n })}`; };
      $('sP').addEventListener('input', upd); upd();
      $('sBack').addEventListener('click', () => { sheetSel = null; renderSheet(); });
      $('sAdd').addEventListener('click', () => {
        const n = num($('sP').value); if (!n || n <= 0 || n > 20) return toast(t('portions') + '?');
        sheetMeal = $('sMeal').value;
        addFood(d0.n, d0.k * n, { p: d0.p * n, f: d0.f * n, c: d0.c * n, g: d0.g * n, meal: sheetMeal, src: 'dish' }); closeSheet();
      });
      $('sEdit').addEventListener('click', () => openBuilder(d0));
      let arm = 0;
      $('sDel').addEventListener('click', () => { if (Date.now() - arm > 3000) { arm = Date.now(); return toast(t('delW') + '? ↻'); } D.dishes = ds.filter(x => x.id !== d0.id); save(); sheetSel = null; renderSheet(); });
      return;
    }
    body.innerHTML = `<button class="btn" id="sNew">${t('newDish')}</button>` + (ds.length ? ds.map(d0 => `<div class="res" data-did="${d0.id}"><span>${esc(d0.n)}<br><em>1 ${t('portionW')}: ${Math.round(d0.k)} ${t('kcal')} · ${macroLine(d0)}</em></span><b>›</b></div>`).join('') : `<p class="muted" style="margin-top:10px">${t('noDishes')}</p>`);
    $('sNew').addEventListener('click', () => openBuilder(null));
    body.querySelectorAll('[data-did]').forEach(r => r.addEventListener('click', () => { sheetSel = r.dataset.did; renderSheet(); }));
  } else {
    body.innerHTML = `<label>${t('manualName')}</label><input id="mN">
      <div class="row"><div><label>${t('kcal')}</label><input id="mK" type="number" inputmode="numeric"></div><div><label>${t('grams')}</label><input id="mG" type="number" inputmode="numeric"></div></div>
      <label>${t('optMacros')}</label><div class="row"><input id="mP" type="number" inputmode="decimal" placeholder="${t('prot')}"><input id="mF" type="number" inputmode="decimal" placeholder="${t('fat')}"><input id="mC" type="number" inputmode="decimal" placeholder="${t('carb')}"></div>
      ${mealSelect()}<button class="btn" id="mAdd">${t('add')}</button>`;
    $('mAdd').addEventListener('click', () => {
      const k = num($('mK').value); if (!k || k <= 0 || k > 6000) return toast(t('tKcal'));
      sheetMeal = $('sMeal').value;
      addFood($('mN').value.trim().slice(0, 60), k, { p: num($('mP').value), f: num($('mF').value), c: num($('mC').value), g: num($('mG').value), meal: sheetMeal, src: 'manual' }); closeSheet();
    });
  }
}

// ---- dish builder ----
let BLD = null;
function openBuilder(d0) {
  BLD = d0 ? { id: d0.id, n: d0.n, portions: d0.portions, ings: d0.ings.map(i => ({ ...i })) } : { id: null, n: '', portions: 1, ings: [] };
  $('builder').classList.remove('hidden'); renderBuilder();
}
$('bClose').addEventListener('click', () => $('builder').classList.add('hidden'));
function bTotals() {
  const tt0 = dishTotals(BLD.ings), n = Math.max(0.5, +BLD.portions || 1);
  $('bTot').innerHTML = `<div class="grid2"><div class="stat"><b>${Math.round(tt0.k)}</b><span>${t('total')}, ${t('kcal')} · ${Math.round(tt0.g)} ${t('gU')}</span><br><span>${macroLine(tt0)}</span></div>
    <div class="stat"><b>${Math.round(tt0.k / n)}</b><span>${t('perPortionT')}, ${t('kcal')}</span><br><span>${macroLine({ p: tt0.p / n, f: tt0.f / n, c: tt0.c / n })}</span></div></div>`;
}
function renderBuilder() {
  $('bName').value = BLD.n; $('bPort').value = BLD.portions;
  $('bIngs').innerHTML = BLD.ings.length ? BLD.ings.map((i, k) => { const f = fdb(i.id); return `<div class="ingrow"><span>${esc(f ? f.n[LI()] : i.id)}</span><input type="number" inputmode="numeric" data-ig="${k}" value="${i.g}"><em>${t('gU')}</em><button data-ix="${k}">×</button></div>`; }).join('') : '';
  bTotals();
}
$('bName').addEventListener('input', () => BLD.n = $('bName').value);
$('bPort').addEventListener('input', () => { BLD.portions = num($('bPort').value) || 1; bTotals(); });
$('bIngs').addEventListener('input', e => { const i = e.target.dataset.ig; if (i == null) return; BLD.ings[+i].g = num(e.target.value) || 0; bTotals(); });
$('bIngs').addEventListener('click', e => { const b = e.target.closest('[data-ix]'); if (!b) return; BLD.ings.splice(+b.dataset.ix, 1); renderBuilder(); });
$('bq').addEventListener('input', () => {
  const res = searchFoods($('bq').value);
  $('bres').innerHTML = $('bq').value.trim() ? (res.length ? res.slice(0, 8).map(foodRow).join('') : `<p class="muted" style="padding:8px 4px">${t('nothingFound')}</p>`) : '';
});
$('bres').addEventListener('click', e => {
  const r = e.target.closest('[data-fid]'); if (!r) return; const f = fdb(r.dataset.fid);
  BLD.ings.push({ id: f.id, g: f.por }); $('bq').value = ''; $('bres').innerHTML = ''; renderBuilder();
});
function saveDish(eat) {
  BLD.n = $('bName').value.trim().slice(0, 60);
  if (!BLD.n) return toast(t('needName'));
  if (!BLD.ings.length) return toast(t('needIng'));
  const n = Math.max(0.5, +BLD.portions || 1), tt0 = dishTotals(BLD.ings);
  const dish = { id: BLD.id || 'd' + Date.now(), n: BLD.n, portions: n, ings: BLD.ings, k: r1n(tt0.k / n), p: r1n(tt0.p / n), f: r1n(tt0.f / n), c: r1n(tt0.c / n), g: Math.round(tt0.g / n) };
  D.dishes = (D.dishes || []).filter(x => x.id !== dish.id); D.dishes.unshift(dish); save();
  $('builder').classList.add('hidden'); toast(t('dishSaved'));
  if (eat) { addFood(dish.n, dish.k, { p: dish.p, f: dish.f, c: dish.c, g: dish.g, meal: sheetMeal, src: 'dish' }); closeSheet(); }
  else { sheetTab = 'dish'; sheetSel = null; if (!$('sheet').classList.contains('hidden')) renderSheet(); }
}
$('bSave').addEventListener('click', () => saveDish(false));
$('bSaveEat').addEventListener('click', () => saveDish(true));

// ---- v2: goal, streak, achievements ----
function streakNow() {
  let n = 0, d = todayStr();
  if (!peekDay(d).foods.length) d = addDays(d, -1);
  while (peekDay(d).foods.length && n < 3650) { n++; d = addDays(d, -1); }
  return n;
}
function streakMax() {
  const ks = Object.keys(D.days).filter(k => D.days[k].foods.length).sort();
  let best = 0, cur = 0, prev = null;
  ks.forEach(k => { cur = prev && diffDays(prev, k) === 1 ? cur + 1 : 1; best = Math.max(best, cur); prev = k; });
  return best;
}
function renderGoal(w) {
  const tw = P().targetW;
  if (document.activeElement !== $('goalIn')) $('goalIn').value = tw || '';
  const s = streakNow();
  $('streakText').textContent = s ? t('streak', { n: s }) : t('streak0');
  if (!tw) { $('goalBar').style.width = '0'; $('goalText').textContent = t('goalNone'); return; }
  const start = P().weight, dir = Math.sign(tw - start) || -1;
  const done = dir < 0 ? w <= tw : w >= tw;
  $('goalBar').style.width = (done ? 100 : clamp((w - start) / (tw - start || 1) * 100, 0, 100)) + '%';
  if (done) { $('goalText').textContent = t('goalDone'); return; }
  const h = habits(), left = Math.abs(w - tw);
  let txt = t('goalLeft', { v: r1(left) });
  if (!h.n) txt += ' ' + t('goalNoEta');
  else {
    const rate = h.bal / rhoAt(w), days = Math.sign(rate) === dir && Math.abs(rate) >= 0.003 ? etaDays(h, w, tw) : null;
    if (!days) txt += ' ' + t(Math.sign(rate) === dir && Math.abs(rate) >= 0.003 ? 'goalPlateau' : 'goalWrongWay');
    else {
      const dt = addDays(todayStr(), days).split('-');
      txt += ' ' + t('goalEta', { d: +dt[2] + '.' + +dt[1] + '.' + dt[0], n: days });
    }
  }
  $('goalText').textContent = txt;
}
$('goalSave').addEventListener('click', () => {
  const v = num($('goalIn').value);
  P().targetW = v && v >= 35 && v <= 250 ? v : null; save(); renderMe(); toast(t('goalSaved'));
});

const ACH_CATS = [
  ['food', ['🍽 Харчування', '🍽 Jídlo', '🍽 Food']],
  ['streak', ['🔥 Серії', '🔥 Série', '🔥 Streaks']],
  ['move', ['💪 Тренування', '💪 Trénink', '💪 Workouts']],
  ['steps', ['👣 Кроки', '👣 Kroky', '👣 Steps']],
  ['health', ['💧 Вода й баланс', '💧 Voda a rovnováha', '💧 Water & balance']],
  ['body', ['📏 Тіло', '📏 Tělo', '📏 Body']],
  ['stars', ['⭐ Бали й улюбленці', '⭐ Body a mazlíčci', '⭐ Points & pets']],
  ['app', ['🧭 Дослідник', '🧭 Průzkumník', '🧭 Explorer']]
];
// [id, emoji, category, stat, need, names uk/cs/en, descriptions uk/cs/en]
const ACH_DEF = [
  ['first', '📝', 'food', 'foods', 1, ['Перший запис', 'První zápis', 'First entry'], ['Записали першу їжу', 'Zapsali jste první jídlo', 'Logged your first food']],
  ['f50', '🗒️', 'food', 'foods', 50, ['Щоденник', 'Deníček', 'Food diary'], ['50 записів їжі', '50 zápisů jídla', '50 food entries']],
  ['f200', '📚', 'food', 'foods', 200, ['Літописець', 'Kronikář', 'Chronicler'], ['200 записів їжі', '200 zápisů jídla', '200 food entries']],
  ['f500', '📖', 'food', 'foods', 500, ['Енциклопедія смаку', 'Encyklopedie chutí', 'Taste encyclopedia'], ['500 записів їжі', '500 zápisů jídla', '500 food entries']],
  ['full1', '🍱', 'food', 'fullDays', 1, ['Повний день', 'Celý den', 'Full day'], ['Сніданок, обід і вечеря за день', 'Snídaně, oběd i večeře za den', 'Breakfast, lunch and dinner in one day']],
  ['full10', '🗓️', 'food', 'fullDays', 10, ['Режим харчування', 'Pravidelné jídlo', 'Regular meals'], ['10 днів з усіма трьома прийомами', '10 dní se všemi třemi jídly', '10 days with all three meals']],
  ['bf7', '🍳', 'food', 'bfDays', 7, ['Ранкова пташка', 'Ranní ptáče', 'Early bird'], ['7 днів зі сніданком', '7 dní se snídaní', '7 days with breakfast']],
  ['var10', '🥗', 'food', 'variety', 10, ['Різноманіття', 'Pestrost', 'Variety'], ['10 різних продуктів', '10 různých potravin', '10 different foods']],
  ['dish', '👨‍🍳', 'food', 'dishes', 1, ['Шеф-кухар', 'Šéfkuchař', 'Home chef'], ['Створили власну страву', 'Vytvořili jste vlastní jídlo', 'Created your own dish']],
  ['dish5', '🍲', 'food', 'dishes', 5, ['Своя кухня', 'Vlastní kuchyně', 'Own cookbook'], ['5 власних страв', '5 vlastních jídel', '5 own dishes']],

  ['s3', '🔥', 'streak', 'smax', 3, ['3 дні поспіль', '3 dny v řadě', '3 days in a row'], ['Записували їжу 3 дні підряд', 'Jídlo zapsáno 3 dny po sobě', 'Logged food 3 days running']],
  ['s7', '🔥', 'streak', 'smax', 7, ['Тиждень поспіль', 'Týden v řadě', 'A full week'], ['7 днів підряд', '7 dní po sobě', '7 days running']],
  ['s14', '⚡', 'streak', 'smax', 14, ['Два тижні', 'Dva týdny', 'Two weeks'], ['14 днів підряд', '14 dní po sobě', '14 days running']],
  ['s30', '🏆', 'streak', 'smax', 30, ['Місяць поспіль', 'Měsíc v řadě', 'A full month'], ['30 днів підряд', '30 dní po sobě', '30 days running']],
  ['s60', '💎', 'streak', 'smax', 60, ['Залізна воля', 'Železná vůle', 'Iron will'], ['60 днів підряд', '60 dní po sobě', '60 days running']],
  ['s100', '👑', 'streak', 'smax', 100, ['Сотня', 'Stovka', 'Hundred'], ['100 днів підряд', '100 dní po sobě', '100 days running']],
  ['days50', '📆', 'streak', 'logDays', 50, ['50 днів з нами', '50 dní s námi', '50 days with us'], ['50 днів із записами (не обовʼязково підряд)', '50 dní se zápisy (i s přestávkami)', '50 logged days (any order)']],

  ['wo1', '💪', 'move', 'wo', 1, ['Перше тренування', 'První trénink', 'First workout'], ['Домашнє або силове тренування', 'Domácí nebo silový trénink', 'A home or strength workout']],
  ['wo10', '🏋️', 'move', 'wo', 10, ['10 тренувань', '10 tréninků', '10 workouts'], ['Разом 10 тренувань', 'Celkem 10 tréninků', '10 workouts in total']],
  ['wo25', '🦾', 'move', 'wo', 25, ['25 тренувань', '25 tréninků', '25 workouts'], ['Разом 25 тренувань', 'Celkem 25 tréninků', '25 workouts in total']],
  ['wo50', '🥈', 'move', 'wo', 50, ['50 тренувань', '50 tréninků', '50 workouts'], ['Разом 50 тренувань', 'Celkem 50 tréninků', '50 workouts in total']],
  ['wo100', '🥇', 'move', 'wo', 100, ['Сотня тренувань', 'Sto tréninků', '100 workouts'], ['Разом 100 тренувань', 'Celkem 100 tréninků', '100 workouts in total']],
  ['run', '🏃', 'move', 'run', 1, ['Бігун', 'Běžec', 'Runner'], ['Записали пробіжку', 'Zapsali jste běh', 'Logged a run']],
  ['bike', '🚴', 'move', 'bike', 1, ['Велосипедист', 'Cyklista', 'Cyclist'], ['Записали велосипед', 'Zapsali jste kolo', 'Logged a bike ride']],
  ['swim', '🏊', 'move', 'swim', 1, ['Плавець', 'Plavec', 'Swimmer'], ['Записали плавання', 'Zapsali jste plavání', 'Logged a swim']],
  ['yoga', '🧘', 'move', 'yoga', 1, ['Гнучкість', 'Ohebnost', 'Flexibility'], ['Записали йогу чи розтяжку', 'Zapsali jste jógu či protažení', 'Logged yoga or stretching']],
  ['types5', '🎨', 'move', 'types', 5, ['Універсал', 'Všestranný', 'All-rounder'], ['5 різних видів активності', '5 různých druhů pohybu', '5 different activity types']],
  ['hours10', '⏱️', 'move', 'hours', 10, ['10 годин руху', '10 hodin pohybu', '10 hours moving'], ['Разом 10 годин активностей', 'Celkem 10 hodin aktivit', '10 hours of activities in total']],
  ['long60', '🏅', 'move', 'longest', 60, ['Марафонець', 'Vytrvalec', 'Endurance'], ['Одна активність від 60 хвилин', 'Jedna aktivita aspoň 60 minut', 'One activity of 60+ minutes']],

  ['steps', '👣', 'steps', 'stepMax', 10000, ['10 000 кроків', '10 000 kroků', '10,000 steps'], ['За один день', 'Za jeden den', 'In a single day']],
  ['st15', '🥾', 'steps', 'stepMax', 15000, ['15 000 кроків', '15 000 kroků', '15,000 steps'], ['За один день', 'Za jeden den', 'In a single day']],
  ['st20', '🚀', 'steps', 'stepMax', 20000, ['20 000 кроків', '20 000 kroků', '20,000 steps'], ['За один день', 'Za jeden den', 'In a single day']],
  ['st8x7', '🚶', 'steps', 'step8Days', 7, ['Активний тиждень', 'Aktivní týden', 'Active week'], ['7 днів по 8 000+ кроків', '7 dní s 8 000+ kroky', '7 days with 8,000+ steps']],
  ['st100k', '🗺️', 'steps', 'stepTotal', 100000, ['100 тисяч кроків', '100 tisíc kroků', '100k steps'], ['Сумарно за весь час', 'Celkem za celou dobu', 'All-time total']],
  ['st1m', '🌍', 'steps', 'stepTotal', 1000000, ['Мільйонник', 'Milionář kroků', 'Millionaire'], ['Мільйон кроків сумарно', 'Milion kroků celkem', 'A million steps in total']],

  ['water', '💧', 'health', 'waterDays', 1, ['Водний баланс', 'Pitný režim', 'Hydrated'], ['8 склянок води за день', '8 sklenic vody za den', '8 glasses of water in a day']],
  ['water7', '🌊', 'health', 'waterDays', 7, ['Вода — звичка', 'Voda je zvyk', 'Water habit'], ['7 днів по 8 склянок', '7 dní po 8 sklenicích', '7 days with 8 glasses']],
  ['water30', '🐳', 'health', 'waterDays', 30, ['Кит', 'Velryba', 'Whale'], ['30 днів по 8 склянок', '30 dní po 8 sklenicích', '30 days with 8 glasses']],
  ['prot', '🥩', 'health', 'protDays', 1, ['Норма білка', 'Denní bílkoviny', 'Protein goal'], ['Добрали норму білка за день', 'Splněný denní cíl bílkovin', 'Hit your protein target in a day']],
  ['prot7', '🍗', 'health', 'protDays', 7, ['Білковий тиждень', 'Bílkovinový týden', 'Protein week'], ['7 днів з нормою білка', '7 dní se splněnými bílkovinami', '7 days at protein target']],
  ['cal1', '🎯', 'health', 'calDays', 1, ['У яблучко', 'Přesně', 'Bullseye'], ['Калорії в межах ±10% від норми', 'Kalorie v rozmezí ±10 % cíle', 'Calories within ±10% of target']],
  ['cal7', '⚖️', 'health', 'calDays', 7, ['Баланс', 'Rovnováha', 'In balance'], ['7 днів у межах норми', '7 dní v rozmezí cíle', '7 days on target']],
  ['cal30', '🧠', 'health', 'calDays', 30, ['Майстер балансу', 'Mistr rovnováhy', 'Balance master'], ['30 днів у межах норми', '30 dní v rozmezí cíle', '30 days on target']],

  ['meas', '📏', 'body', 'meas', 1, ['Перші заміри', 'První míry', 'First measurements'], ['Записали заміри тіла', 'Zapsali jste míry těla', 'Logged body measurements']],
  ['meas5', '📐', 'body', 'meas', 5, ['Під контролем', 'Pod kontrolou', 'On track'], ['5 записів замірів', '5 zápisů měr', '5 measurement entries']],
  ['kg1', '⚖️', 'body', 'lost', 1, ['−1 кг', '−1 kg', '−1 kg'], ['Модель показує мінус 1 кг', 'Model ukazuje mínus 1 kg', 'Model shows 1 kg down']],
  ['kg3', '📉', 'body', 'lost', 3, ['−3 кг', '−3 kg', '−3 kg'], ['Мінус 3 кг від старту', 'Mínus 3 kg od startu', '3 kg down from the start']],
  ['kg5', '🥇', 'body', 'lost', 5, ['−5 кг', '−5 kg', '−5 kg'], ['Мінус 5 кг від старту', 'Mínus 5 kg od startu', '5 kg down from the start']],
  ['kg10', '🌟', 'body', 'lost', 10, ['−10 кг', '−10 kg', '−10 kg'], ['Мінус 10 кг від старту', 'Mínus 10 kg od startu', '10 kg down from the start']],
  ['kg20', '🦋', 'body', 'lost', 20, ['−20 кг', '−20 kg', '−20 kg'], ['Мінус 20 кг — нова людина', 'Mínus 20 kg — nový člověk', '20 kg down — a new you']],
  ['abs', '🍫', 'body', 'abs', 1, ['Прес проявився', 'Viditelné břišáky', 'Abs showing'], ['Талія досить тонка, щоб видно було прес', 'Pas je tak štíhlý, že jsou vidět břišáky', 'Waist slim enough for abs to show']],
  ['goal', '🎯', 'body', 'goal', 1, ['Мету досягнуто', 'Cíl splněn', 'Goal reached'], ['Досягли цільової ваги', 'Dosáhli jste cílové váhy', 'Reached your target weight']],

  ['lvl3', '🌱', 'stars', 'lvl', 3, ['Рівень 3', 'Úroveň 3', 'Level 3'], ['Досягли 3 рівня', 'Dosáhli jste úrovně 3', 'Reached level 3']],
  ['lvl5', '🌿', 'stars', 'lvl', 5, ['Рівень 5', 'Úroveň 5', 'Level 5'], ['Досягли 5 рівня', 'Dosáhli jste úrovně 5', 'Reached level 5']],
  ['lvl10', '🌳', 'stars', 'lvl', 10, ['Рівень 10', 'Úroveň 10', 'Level 10'], ['Досягли 10 рівня', 'Dosáhli jste úrovně 10', 'Reached level 10']],
  ['buy1', '🛍', 'stars', 'owned', 1, ['Перша покупка', 'První nákup', 'First purchase'], ['Купили щось у магазині', 'Koupili jste něco v obchodě', 'Bought something in the shop']],
  ['buy5', '👗', 'stars', 'owned', 5, ['Модник', 'Módní ikona', 'Fashionista'], ['5 речей у колекції', '5 věcí ve sbírce', '5 items in your collection']],
  ['pet1', '🐾', 'stars', 'pets', 1, ['Новий друг', 'Nový kamarád', 'New friend'], ['Завели улюбленця', 'Pořídili jste mazlíčka', 'Got a pet']],
  ['pets3', '🏡', 'stars', 'pets', 3, ['Зоопарк', 'Zoo', 'Mini zoo'], ['3 улюбленці', '3 mazlíčci', '3 pets']],
  ['feed10', '🥣', 'stars', 'feeds', 10, ['Турботливий господар', 'Starostlivý páníček', 'Caring owner'], ['10 разів нагодували улюбленця', '10× nakrmený mazlíček', 'Fed your pet 10 times']],
  ['petAdult', '🐕‍🦺', 'stars', 'petAdult', 1, ['Виростили!', 'Vyrostl!', 'All grown up'], ['Улюбленець став дорослим', 'Mazlíček je dospělý', 'Your pet is grown up']],

  ['q1', '✅', 'app', 'quests', 1, ['Перший квест', 'První úkol', 'First quest'], ['Виконали денне завдання', 'Splnili jste denní úkol', 'Finished a daily quest']],
  ['q25', '📜', 'app', 'quests', 25, ['Мисливець за квестами', 'Lovec úkolů', 'Quest hunter'], ['25 виконаних завдань', '25 splněných úkolů', '25 quests finished']],
  ['allq', '🎖', 'app', 'allQuests', 1, ['Ідеальний день', 'Dokonalý den', 'Perfect day'], ['Усі 3 завдання за день', 'Všechny 3 úkoly za den', 'All 3 quests in one day']],
  ['coach1', '🤖', 'app', 'coach', 1, ['Порада тренера', 'Rada trenéra', 'Coach advice'], ['Поставили питання ШІ-тренеру', 'Zeptali jste se AI trenéra', 'Asked the AI coach']],
  ['coach20', '🎓', 'app', 'coach', 20, ['Допитливий', 'Zvídavý', 'Curious mind'], ['20 питань тренеру', '20 otázek trenérovi', '20 questions to the coach']],
  ['fridge1', '🧊', 'app', 'fridge', 1, ['Ревізія холодильника', 'Revize ledničky', 'Fridge raid'], ['Підібрали рецепти з того, що є', 'Recepty z toho, co máte doma', 'Got recipes from what you have']],
  ['fridge10', '🍳', 'app', 'fridge', 10, ['Кулінарний експерт', 'Kuchařský expert', 'Kitchen expert'], ['10 разів підбирали рецепти', '10× hledání receptů', 'Found recipes 10 times']],
  ['tm', '⏳', 'app', 'tm', 1, ['Мандрівник у часі', 'Cestovatel časem', 'Time traveller'], ['Зазирнули в майбутнє на рік', 'Podívali jste se o rok dopředu', 'Looked a year ahead']]
];
const ACH = ACH_DEF.map(([id, e, cat, k, need, n, d]) => ({ id, e, cat, k, need, n, d, ok: s => (+s[k] || 0) >= need }));
function bump(k, n = 1) { D.cnt = D.cnt || {}; D.cnt[k] = (D.cnt[k] || 0) + n; save(); }
function achStats() {
  const a = ser(), w = a[a.length - 1].w, td = todayStr(), C = D.cnt || {};
  const s = { foods: 0, fullDays: 0, bfDays: 0, logDays: 0, wo: 0, run: 0, bike: 0, swim: 0, yoga: 0, hours: 0, longest: 0,
    stepMax: 0, step8Days: 0, stepTotal: 0, waterDays: 0, protDays: 0, calDays: 0 };
  const names = new Set(), types = new Set();
  for (const k in D.days) {
    const d = D.days[k], fs = d.foods || [];
    s.foods += fs.length;
    if (fs.length) {
      s.logDays++;
      const meals = new Set(fs.map(f => f.meal || 'snack'));
      if (meals.has('breakfast')) s.bfDays++;
      if (meals.has('breakfast') && meals.has('lunch') && meals.has('dinner')) s.fullDays++;
      fs.forEach(f => names.add(String(f.id || f.n || '').toLowerCase().trim()));
      if (k <= td) {
        const wk = weightAt(k), tt = dayTotals(k, wk), ct = calTarget(wk);
        if (tt.p >= protTarget(wk, ct.g)) s.protDays++;
        if (k < td && Math.abs(tt.eaten - ct.tg) <= ct.tg * 0.1) s.calDays++;
      }
    }
    (d.acts || []).forEach(x => {
      if (x.id === 'homeworkout' || x.id === 'gym') s.wo++;
      if (x.id in s && ['run', 'bike', 'swim', 'yoga'].includes(x.id)) s[x.id]++;
      if (x.id !== 'custom') types.add(x.id);
      s.hours += (x.min || 0) / 60; s.longest = Math.max(s.longest, x.min || 0);
    });
    const st = d.steps || 0;
    s.stepMax = Math.max(s.stepMax, st); s.stepTotal += st; if (st >= 8000) s.step8Days++;
    if ((d.water || 0) >= 8) s.waterDays++;
  }
  names.delete('');
  s.variety = names.size; s.types = types.size; s.smax = streakMax();
  s.dishes = (D.dishes || []).length; s.meas = D.meas.length;
  const tw = P().targetW, start = P().weight;
  s.lost = start - w;
  s.abs = girths(w, toneAt(td), td).g.waist / P().height < 0.5 ? 1 : 0;
  s.goal = tw && (tw < start ? w <= tw : w >= tw) ? 1 : 0;
  s.lvl = levelOf(pointsSummary().earned).L;
  const owned = (D.shop && D.shop.owned) || [];
  s.owned = owned.length; s.pets = owned.filter(id => id.startsWith('pet_')).length;
  const pv = Object.values(D.pets || {});
  s.feeds = pv.reduce((x, p) => x + (p.feeds || 0), 0); s.petAdult = pv.some(p => p.feeds >= 15) ? 1 : 0;
  s.quests = C.quests || 0; s.allQuests = C.allQuests || 0; s.coach = C.coach || 0; s.fridge = C.fridge || 0; s.tm = C.tm || 0;
  return s;
}
let ACH_OPEN = null;
function renderAch() {
  if (!P()) return;
  const { s, got } = achCheck();
  $('achCount').innerHTML = `${esc(t('achCount', { a: got.length, b: ACH.length }))}<div class="bar"><i style="width:${Math.round(got.length / ACH.length * 100)}%"></i></div>`;
  if (ACH_OPEN === null) ACH_OPEN = (ACH_CATS.find(([c]) => ACH.some(a => a.cat === c && !got.includes(a.id))) || ACH_CATS[0])[0];
  const fmt = v => v >= 10000 ? Math.round(v / 1000) + 'k' : String(Math.round(v * 10) / 10);
  $('achGrid').innerHTML = ACH_CATS.map(([c, title]) => {
    const list = ACH.filter(a => a.cat === c), n = list.filter(a => got.includes(a.id)).length;
    return `<details class="achCat" data-c="${c}"${ACH_OPEN === c ? ' open' : ''}><summary><span>${esc(title[LI()])}</span><b>${n}/${list.length}</b></summary><div class="achgrid">` +
      list.map(a => {
        const on = got.includes(a.id), cur = Math.max(0, Math.min(a.need, +s[a.k] || 0));
        const pr = !on && a.need > 1 ? `<div class="bar"><i style="width:${Math.round(cur / a.need * 100)}%"></i></div><em>${fmt(cur)} / ${fmt(a.need)}</em>` : '';
        return `<div class="ach${on ? ' on' : ''}"><div class="ae">${a.e}</div><b>${esc(a.n[LI()])}</b><span>${esc(a.d[LI()])}</span>${pr}</div>`;
      }).join('') + '</div></details>';
  }).join('');
  $('achGrid').querySelectorAll('details').forEach(el => el.addEventListener('toggle', () => { if (el.open) { ACH_OPEN = el.dataset.c; $('achGrid').querySelectorAll('details').forEach(o => { if (o !== el) o.open = false; }); } }));
}
function achCheck() {
  const s = achStats(), got = ACH.filter(a => a.ok(s)).map(a => a.id);
  D.ach = D.ach || [];
  const fresh = got.filter(id => !D.ach.includes(id));
  if (fresh.length) { D.ach.push(...fresh); save(); const a = ACH.find(x => x.id === fresh[0]); setTimeout(() => toast(t('achNew', { n: a.e + ' ' + a.n[LI()] }) + (fresh.length > 1 ? ' · +' + (fresh.length - 1) + ' 🏅' : '')), 400); }
  return { s, got };
}
function checkAch() { return P() ? achCheck().got : []; }

// ---- v2: guided workout with timer ----
const RUN = { on: false, steps: [], i: 0, left: 0, paused: false, active: 0, last: 0, timer: null, ac: null, sound: true };
const VOICE_LANG = { uk: 'uk-UA', cs: 'cs-CZ', en: 'en-US' };
function exInfo(x) {
  const male = P().sex === 'm', lv = woLevel == null ? 0 : woLevel;
  let dose = (male ? x.m : x.f)[lv], name = x.n ? x.n[LI()] : '', v = '';
  if (x.id === 'pushup') { v = dose[0]; name = PUSH_NAMES[v][LI()]; dose = dose[1]; }
  const label = x.u === 'sec' ? t('sec', { n: dose }) : x.u === 'leg' ? t('perLeg', { n: dose }) : t('reps', { n: dose });
  return { name, dose, label, v, timed: x.u === 'sec' };
}
function beep(f, ms) {
  if (!RUN.sound || !RUN.ac) return;
  try { const o = RUN.ac.createOscillator(), g = RUN.ac.createGain(); o.frequency.value = f; o.connect(g); g.connect(RUN.ac.destination);
    g.gain.setValueAtTime(0.25, RUN.ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, RUN.ac.currentTime + ms / 1000); o.start(); o.stop(RUN.ac.currentTime + ms / 1000); } catch (e) {}
}
function speak(txt) {
  if (!RUN.sound) return;
  try { if (!window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.lang = VOICE_LANG[LANG]; u.rate = 1; speechSynthesis.speak(u); } catch (e) {}
}
function buildRun() {
  const lv = woLevel == null ? 0 : woLevel, R = ROUNDS[lv], st = [];
  st.push({ kind: 'ready', sec: 8, ex: EXS[0], r: 1, k: 0 });
  for (let r = 1; r <= R; r++) EXS.forEach((x, k) => {
    st.push({ kind: 'ex', ex: x, r, k });
    const last = k === EXS.length - 1;
    if (!last) st.push({ kind: 'trans', sec: 10, ex: EXS[k + 1], r, k: k + 1 });
    else if (r < R) st.push({ kind: 'rest', sec: lv === 2 ? 75 : 60, ex: EXS[0], r: r + 1, k: 0 });
  });
  return st;
}
function startRun() {
  try { RUN.ac = RUN.ac || new (window.AudioContext || window.webkitAudioContext)(); RUN.ac.resume && RUN.ac.resume(); } catch (e) { RUN.ac = null; }
  RUN.sound = D.woSound !== false;
  RUN.steps = buildRun(); RUN.i = -1; RUN.active = 0; RUN.paused = false; RUN.on = true; RUN.last = Date.now();
  try { navigator.wakeLock && navigator.wakeLock.request('screen').then(l => RUN.lock = l, () => {}); } catch (e) {}
  $('woRun').classList.remove('hidden');
  nextStep();
  clearInterval(RUN.timer); RUN.timer = setInterval(tickRun, 200);
  startAnims();
}
function nextStep() {
  RUN.i++;
  if (RUN.i >= RUN.steps.length) return finishRun(true);
  const s = RUN.steps[RUN.i], info = exInfo(s.ex);
  RUN.left = s.kind === 'ex' ? (info.timed ? info.dose : 0) : s.sec;
  if (s.kind === 'ex') { beep(880, 350); speak(info.name + '. ' + info.label); }
  else if (s.kind === 'rest') { beep(520, 400); speak(t('sayRest') + '. ' + t('nextW', { n: info.name })); }
  else if (s.kind === 'ready') speak(t('getReady') + ' ' + info.name);
  renderRun();
}
function tickRun() {
  if (!RUN.on) return;
  const now = Date.now(), dt = (now - RUN.last) / 1000; RUN.last = now;
  if (RUN.paused) return;
  RUN.active += dt;
  const s = RUN.steps[RUN.i], info = exInfo(s.ex);
  const counting = s.kind !== 'ex' || info.timed;
  if (counting) {
    const before = Math.ceil(RUN.left);
    RUN.left -= dt;
    const after = Math.ceil(RUN.left);
    if (after !== before && after <= 3 && after > 0) beep(660, 120);
    if (RUN.left <= 0) return nextStep();
  }
  renderRun(true);
}
function renderRun(light) {
  const s = RUN.steps[RUN.i]; if (!s) return;
  const info = exInfo(s.ex), R = ROUNDS[woLevel == null ? 0 : woLevel];
  const c = $('runCanvas'); c.dataset.a = s.ex.id; c.dataset.v = info.v;
  $('runInfo').textContent = t('roundW', { r: s.r, n: R }) + ' · ' + t('exW', { i: s.k + 1, n: EXS.length });
  const counting = s.kind !== 'ex' || info.timed;
  $('runTimer').textContent = counting ? Math.max(0, Math.ceil(RUN.left)) : '';
  $('runTimer').style.display = counting ? 'block' : 'none';
  if (light) return;
  $('runPhase').textContent = s.kind === 'ex' ? '' : s.kind === 'rest' ? '😮‍💨 ' + t('restW') : s.kind === 'ready' ? t('getReady') : '';
  $('runName').textContent = (s.kind === 'ex' ? '' : t('nextW', { n: '' })) + s.ex.e + ' ' + info.name;
  $('runDose').textContent = info.label;
  $('runDone').style.display = s.kind === 'ex' && !info.timed ? 'block' : 'none';
  $('runDone').textContent = t('done');
  $('runPause').textContent = RUN.paused ? t('resume') : t('pause');
  $('runSkip').textContent = t('skip'); $('runStop').textContent = t('stop');
  $('runSound').textContent = RUN.sound ? '🔊' : '🔇';
  const nx = RUN.steps.slice(RUN.i + 1).find(x => x.kind === 'ex');
  $('runNext').textContent = s.kind === 'ex' && nx ? t('nextW', { n: exInfo(nx.ex).name }) : '';
}
function finishRun(completed) {
  RUN.on = false; clearInterval(RUN.timer);
  try { RUN.lock && RUN.lock.release(); } catch (e) {}
  $('woRun').classList.add('hidden');
  const mins = Math.round(RUN.active / 60);
  if (mins >= 3) {
    const td = todayStr(), w = weightAt(td);
    day(td).acts.push({ id: 'homeworkout', at: Date.now(), min: mins, k: Math.round(netMet(actDef('homeworkout')) * w * mins / 60) });
    save(); dirty();
    if (completed) speak(t('sayDone'));
    toast(t('woFinished', { m: mins }));
  } else toast(t('woTooShort'));
  renderTips();
}
$('woStartBtn').addEventListener('click', startRun);
$('runDone').addEventListener('click', () => { if (RUN.on) nextStep(); });
$('runSkip').addEventListener('click', () => { if (RUN.on) nextStep(); });
$('runPause').addEventListener('click', () => { RUN.paused = !RUN.paused; RUN.last = Date.now(); if (RUN.paused) try { speechSynthesis.cancel(); } catch (e) {} renderRun(); });
$('runStop').addEventListener('click', () => finishRun(false));
$('runSound').addEventListener('click', () => { RUN.sound = !RUN.sound; D.woSound = RUN.sound; save(); if (!RUN.sound) try { speechSynthesis.cancel(); } catch (e) {} renderRun(); });

// ================= v4: points, daily quests, levels, shop =================
const LVL_TITLES = {
  uk: ['Новачок', 'Початківець', 'Активний', 'Стабільний', 'Витривалий', 'Сильний', 'Атлет', 'Майстер', 'Легенда', 'Чемпіон'],
  cs: ['Nováček', 'Začátečník', 'Aktivní', 'Vytrvalý', 'Odolný', 'Silný', 'Atlet', 'Mistr', 'Legenda', 'Šampion'],
  en: ['Rookie', 'Beginner', 'Active', 'Steady', 'Enduring', 'Strong', 'Athlete', 'Master', 'Legend', 'Champion']
};
const QUESTS = {
  water6: { n: ['Випийте 6 склянок води', 'Vypijte 6 sklenic vody', 'Drink 6 glasses of water'], e: '💧' },
  meals3: { n: ['Запишіть сніданок, обід і вечерю', 'Zapište snídani, oběd i večeři', 'Log breakfast, lunch and dinner'], e: '🍽' },
  move20: { n: ['20 хвилин руху', '20 minut pohybu', '20 minutes of activity'], e: '🏃' },
  steps7k: { n: ['Пройдіть 7 000 кроків', 'Ujděte 7 000 kroků', 'Walk 7,000 steps'], e: '👣' },
  protein: { n: ['Доберіть норму білка', 'Splňte denní bílkoviny', 'Hit your protein target'], e: '🥩' },
  veg: { n: ['Додайте овочі або фрукти', 'Přidejte zeleninu nebo ovoce', 'Add vegetables or fruit'], e: '🥦' },
  workout: { n: ['Зробіть домашнє тренування', 'Dejte si domácí trénink', 'Do a home workout'], e: '💪' },
  nosoda: { n: ['День без пива й солодких напоїв', 'Den bez piva a slazených nápojů', 'A day without beer or sugary drinks'], e: '🚱' },
  budget: { n: ['Вкладіться в денну ціль калорій', 'Vejděte se do denního cíle kalorií', 'Stay within your calorie target'], e: '🎯' }
};
const MOVE_Q = ['move20', 'steps7k', 'workout'], FOOD_Q = ['meals3', 'protein', 'veg', 'nosoda', 'budget'];
const VEG_IDS = ['tomato', 'cucumber', 'carrot', 'cabbage', 'pepper', 'broccoli', 'mushroom', 'lettuce', 'beans', 'corn', 'apple', 'banana', 'orange', 'grapes', 'strawberry'];
const VEG_RE = /овоч|салат|фрукт|яблук|банан|помідор|огір|морк|капуст|zelenin|salát|ovoc|jablk|banán|rajč|okurk|mrkev|zelí|veg|fruit|salad|apple|banana|tomato|carrot/i;
const SODA_IDS = ['beer', 'cola', 'juice', 'wine'], SODA_RE = /пив|кола|лимонад|сік|вино|pivo|cola|limon|džus|víno|beer|soda|juice|wine/i;

function hashStr(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function questsFor(s) {   // 3 quests per day, always 1 about moving and 2 about food/water
  let h = hashStr(s + 'q');
  const rnd = () => (h = (Math.imul(h, 1103515245) + 12345) >>> 0) / 4294967296;
  const pool = [...FOOD_Q, 'water6'];
  const a = MOVE_Q[Math.floor(rnd() * MOVE_Q.length)];
  const b = pool.splice(Math.floor(rnd() * pool.length), 1)[0];
  const c = pool.splice(Math.floor(rnd() * pool.length), 1)[0];
  return [a, b, c];
}
function questProgress(id, s, dd) {
  const d = dd || peekDay(s), w = weightAt(s), tt = dayTotals(s, w);
  const meals = new Set(d.foods.map(f => f.meal || 'snack'));
  const main = ['breakfast', 'lunch', 'dinner'].filter(m => meals.has(m)).length;
  const mins = d.acts.reduce((a, x) => a + x.min, 0);
  switch (id) {
    case 'water6': return clamp((d.water || 0) / 6, 0, 1);
    case 'meals3': return main / 3;
    case 'move20': return clamp(mins / 20, 0, 1);
    case 'steps7k': return clamp((d.steps || 0) / 7000, 0, 1);
    case 'protein': return clamp(tt.p / protTarget(w, calTarget(w).g), 0, 1);
    case 'veg': return d.foods.some(f => VEG_IDS.includes(f.id) || VEG_RE.test(f.n)) ? 1 : 0;
    case 'workout': return d.acts.some(x => x.id === 'homeworkout' || x.id === 'gym') ? 1 : 0;
    case 'nosoda': return d.foods.some(f => SODA_IDS.includes(f.id) || SODA_RE.test(f.n)) ? 0 : clamp(d.foods.length / 2, 0, 1);
    case 'budget': { if (main < 3) return main / 3 * 0.99; const ct = calTarget(w); return tt.eaten <= ct.tg + tt.ex / 2 ? 1 : 0; }
  }
  return 0;
}
// points for one day: only for things people control (logging, water, moving) — never for the weight itself
const PTS_DAY_MAX = 100;
// a record counts for points only if it was made on that day or the next one (no back-filling); old records without a time still count
const timely = (s, at) => !at || diffDays(s, ds(new Date(at))) <= 1;
function timelyDay(s) {
  const d0 = peekDay(s);
  return { foods: d0.foods.filter(f => timely(s, f.at)), acts: d0.acts.filter(a => timely(s, a.at)),
    water: timely(s, d0.wAt) ? d0.water || 0 : 0, steps: timely(s, d0.sAt) ? d0.steps || 0 : 0 };
}
function dayPoints(s) {
  const d = timelyDay(s); let p = 0;
  const meals = new Set(d.foods.map(f => f.meal || 'snack'));
  p += 3 * meals.size;
  if (['breakfast', 'lunch', 'dinner'].every(m => meals.has(m))) p += 5;
  p += Math.min(8, d.water || 0);
  if ((d.steps || 0) >= 10000) p += 10; else if ((d.steps || 0) >= 5000) p += 5;
  if (d.acts.some(x => x.id === 'homeworkout' || x.id === 'gym')) p += 20;
  else if (d.acts.some(x => x.min >= 30)) p += 10;
  const qs = questsFor(s).filter(q => questProgress(q, s, d) >= 1).length;
  p += qs * 10 + (qs === 3 ? 15 : 0);
  return Math.min(PTS_DAY_MAX, p);
}
function pointsSummary() {
  let earned = 0;
  for (const k in D.days) earned += dayPoints(k);
  // measurements: +15, at most once a week
  let lastM = null;
  D.meas.filter(m => timely(m.date, m.at)).map(m => m.date).sort().forEach(dt => { if (!lastM || diffDays(lastM, dt) >= 7) { earned += 10; lastM = dt; } });
  // streak bonus: +50 for every 7 logged days in a row
  const ks = Object.keys(D.days).filter(k => timelyDay(k).foods.length).sort();
  let cur = 0, prev = null;
  ks.forEach(k => { cur = prev && diffDays(prev, k) === 1 ? cur + 1 : 1; if (cur % 7 === 0) earned += 30; prev = k; });
  let spent = ((D.shop && D.shop.owned) || []).reduce((a, id) => { const it = SHOP.find(x => x.id === id); return a + (it ? it.price : 0); }, 0);
  spent += (D.petSpent || 0);
  return { earned, spent, bal: Math.max(0, earned - spent) };
}
function levelOf(xp) {
  let L = 1, acc = 0, need = 150;
  while (xp >= acc + need) { acc += need; L++; need += 100; }
  return { L, into: xp - acc, need };
}
const lvlTitle = L => { const a = LVL_TITLES[LANG]; return L <= a.length ? a[L - 1] : a[a.length - 1] + ' ' + (L - a.length + 1); };

// ---- shop ----
const SHOP = [
  { id: 'cap_blue', slot: 'hat', price: 120, ic: '🧢', col: '#2f6fe0', n: ['Кепка синя', 'Kšiltovka modrá', 'Blue cap'] },
  { id: 'cap_red', slot: 'hat', price: 120, ic: '🧢', col: '#d6453a', n: ['Кепка червона', 'Kšiltovka červená', 'Red cap'] },
  { id: 'beanie', slot: 'hat', price: 180, ic: '🧶', col: '#1f9d6b', n: ['Шапка з помпоном', 'Kulich s bambulí', 'Bobble hat'] },
  { id: 'headband', slot: 'hat', price: 80, ic: '🎽', col: '#ff7a3d', n: ['Спортивна пов\'язка', 'Sportovní čelenka', 'Sweatband'] },
  { id: 'sunglasses', slot: 'eyes', price: 160, ic: '🕶️', n: ['Сонцезахисні окуляри', 'Sluneční brýle', 'Sunglasses'] },
  { id: 'shoes_orange', slot: 'shoes', price: 140, ic: '👟', col: '#ff7a3d', n: ['Кросівки помаранчеві', 'Tenisky oranžové', 'Orange sneakers'] },
  { id: 'shoes_green', slot: 'shoes', price: 140, ic: '👟', col: '#1f9d6b', n: ['Кросівки зелені', 'Tenisky zelené', 'Green sneakers'] },
  { id: 'shoes_black', slot: 'shoes', price: 100, ic: '👟', col: '#2b2f3a', n: ['Кросівки чорні', 'Tenisky černé', 'Black sneakers'] },
  { id: 'headphones', slot: 'acc', price: 240, ic: '🎧', n: ['Навушники', 'Sluchátka', 'Headphones'] },
  { id: 'watch', slot: 'acc', price: 200, ic: '⌚', n: ['Фітнес-браслет', 'Fitness náramek', 'Fitness tracker'] },
  { id: 'bg_park', slot: 'bg', price: 240, ic: '🌳', n: ['Парк', 'Park', 'Park'] },
  { id: 'bg_gym', slot: 'bg', price: 300, ic: '🏋️', n: ['Спортзал', 'Posilovna', 'Gym'] },
  { id: 'bg_beach', slot: 'bg', price: 360, ic: '🏖️', n: ['Пляж', 'Pláž', 'Beach'] },
  { id: 'bg_mount', slot: 'bg', price: 440, lvl: 4, ic: '⛰️', n: ['Гори', 'Hory', 'Mountains'] },
  { id: 'bg_city', slot: 'bg', price: 500, lvl: 6, ic: '🌃', n: ['Нічне місто', 'Noční město', 'City at night'] },
  { id: 'pet_dog', slot: 'pet', price: 600, lvl: 3, ic: '🐕', n: ['Песик', 'Pejsek', 'Dog'] },
  { id: 'pet_cat', slot: 'pet', price: 600, lvl: 3, ic: '🐈', n: ['Котик', 'Kočička', 'Cat'] },
  { id: 'pet_hamster', slot: 'pet', price: 450, lvl: 2, ic: '🐹', n: ['Хом\'ячок', 'Křeček', 'Hamster'] },
  { id: 'pet_rabbit', slot: 'pet', price: 550, lvl: 3, ic: '🐇', n: ['Кролик', 'Králíček', 'Bunny'] },
  { id: 'pet_turtle', slot: 'pet', price: 650, lvl: 4, ic: '🐢', n: ['Черепашка', 'Želvička', 'Turtle'] },
  { id: 'pet_parrot', slot: 'pet', price: 750, lvl: 5, ic: '🦜', n: ['Папуга', 'Papoušek', 'Parrot'] }
];
const SLOTS = [['hat', 'catHat'], ['eyes', 'catEyes'], ['shoes', 'catShoes'], ['acc', 'catAcc'], ['bg', 'catBg'], ['pet', 'catPet']];
const shopState = () => (D.shop = D.shop || { owned: [], eq: {} });
let AV_TARGET = null, AV_TRY = null;
function equipNow() {
  const eq = Object.assign({}, shopState().eq);
  if (AV_TRY) for (const k in AV_TRY) { if (AV_TRY[k]) eq[k] = AV_TRY[k]; else delete eq[k]; }
  return eq;
}
const itemById = id => SHOP.find(x => x.id === id);

// ---- item drawing (front view) ----
function drawBg(id, W, H, G) {
  const x = ctx;
  const sky = (a, b) => { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, W, H); };
  if (id === 'bg_park') {
    sky('#BFE3FF', '#EAF7FF');
    x.fillStyle = '#FFE58A'; x.beginPath(); x.arc(W * 0.3, H * 0.24, 20, 0, Math.PI * 2); x.fill();
    [[0.12, 0.62, 46], [0.9, 0.6, 52], [0.24, 0.66, 34]].forEach(([fx, fy, r]) => { x.fillStyle = '#8B5E3C'; x.fillRect(W * fx - 4, H * fy, 8, G - H * fy); x.fillStyle = '#5DBB63'; x.beginPath(); x.arc(W * fx, H * fy, r, 0, Math.PI * 2); x.fill(); });
    x.fillStyle = '#8FD18B'; x.fillRect(0, G - 18, W, H);
  } else if (id === 'bg_gym') {
    sky('#DDE3EA', '#C9D1DB');
    x.fillStyle = '#E9EEF3'; x.fillRect(W * 0.08, H * 0.12, W * 0.84, H * 0.42);
    x.fillStyle = '#B9C3CF'; x.fillRect(W * 0.08, H * 0.54, W * 0.84, 6);
    for (let i = 0; i < 5; i++) { const px2 = W * (0.14 + i * 0.075); x.fillStyle = '#2B2F3A'; x.fillRect(px2 - 3, H * 0.6, 6, 16); x.beginPath(); x.arc(px2, H * 0.6, 7, 0, Math.PI * 2); x.arc(px2, H * 0.6 + 16, 7, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = '#3B4252'; x.fillRect(0, G - 14, W, H);
    x.strokeStyle = '#4C5466'; x.lineWidth = 1; for (let i = 0; i < W; i += 40) { x.beginPath(); x.moveTo(i, G - 14); x.lineTo(i, H); x.stroke(); }
  } else if (id === 'bg_beach') {
    sky('#9FD8FF', '#E6F6FF');
    x.fillStyle = '#FFD84D'; x.beginPath(); x.arc(W * 0.28, H * 0.26, 24, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#3FA7D6'; x.fillRect(0, H * 0.58, W, H * 0.14);
    x.fillStyle = '#7CC6E8'; for (let i = 0; i < W; i += 36) x.fillRect(i, H * 0.6 + (i % 72 ? 10 : 22), 18, 3);
    x.fillStyle = '#F2D9A0'; x.fillRect(0, H * 0.72, W, H);
  } else if (id === 'bg_mount') {
    sky('#C9D8F2', '#EEF3FB');
    const mt = (x0, w0, h0, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(x0 - w0, G - 10); x.lineTo(x0, G - 10 - h0); x.lineTo(x0 + w0, G - 10); x.fill(); };
    mt(W * 0.25, W * 0.4, H * 0.55, '#9FB3D1'); mt(W * 0.75, W * 0.45, H * 0.62, '#9FB3D1');
    mt(W * 0.5, W * 0.38, H * 0.45, '#6F86A8');
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(W * 0.75 - 26, G - 10 - H * 0.62 + 40); x.lineTo(W * 0.75, G - 10 - H * 0.62); x.lineTo(W * 0.75 + 28, G - 10 - H * 0.62 + 42); x.fill();
    x.fillStyle = '#A9C98F'; x.fillRect(0, G - 12, W, H);
  } else if (id === 'bg_city') {
    sky('#1B2240', '#3A4470');
    x.fillStyle = '#F4EFC9'; x.beginPath(); x.arc(W * 0.28, H * 0.24, 15, 0, Math.PI * 2); x.fill();
    let h = 7;
    for (let bx = 0; bx < W; bx += 46) {
      h = (h * 37 + 11) % 100; const bh = H * (0.25 + h / 260);
      x.fillStyle = '#283055'; x.fillRect(bx, G - bh, 42, bh);
      for (let wy = G - bh + 10; wy < G - 16; wy += 16) for (let wx = bx + 6; wx < bx + 38; wx += 12) { if ((wx * 7 + wy * 3) % 5 < 2) { x.fillStyle = '#FFD86B'; x.fillRect(wx, wy, 6, 8); } }
    }
    x.fillStyle = '#20263F'; x.fillRect(0, G - 10, W, H);
  }
}
function drawHat(id, cx, hy, rx, ry) {
  const it = itemById(id), x = ctx, col = it.col, dk = shade(col, 0.72);
  if (id === 'headband') {
    x.fillStyle = col; x.beginPath(); x.ellipse(cx, hy - ry * 0.42, rx * 1.03, ry * 0.12, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#fff'; x.fillRect(cx - rx * 0.1, hy - ry * 0.5, rx * 0.2, ry * 0.16);
    return;
  }
  if (id === 'beanie') {
    x.fillStyle = col; x.beginPath(); x.ellipse(cx, hy - ry * 0.36, rx * 1.08, ry * 0.92, 0, Math.PI, Math.PI * 2); x.fill();
    x.fillStyle = dk; x.beginPath(); x.ellipse(cx, hy - ry * 0.36, rx * 1.1, ry * 0.2, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(cx, hy - ry * 1.3, rx * 0.22, 0, Math.PI * 2); x.fill();
    return;
  }
  // cap
  x.fillStyle = col; x.beginPath(); x.ellipse(cx, hy - ry * 0.38, rx * 1.06, ry * 0.8, 0, Math.PI, Math.PI * 2); x.fill();
  x.fillStyle = dk; x.beginPath(); x.ellipse(cx, hy - ry * 0.37, rx * 1.18, ry * 0.15, 0, 0, Math.PI); x.fill();
  x.beginPath(); x.arc(cx, hy - ry * 1.17, rx * 0.08, 0, Math.PI * 2); x.fill();
  x.strokeStyle = dk; x.lineWidth = 1.2; x.beginPath(); x.moveTo(cx, hy - ry * 1.15); x.lineTo(cx, hy - ry * 0.4); x.stroke();
}
function drawHeadphones(cx, hy, rx, ry) {
  const x = ctx;
  x.strokeStyle = '#2B2F3A'; x.lineWidth = Math.max(3, rx * 0.16); x.lineCap = 'round';
  x.beginPath(); x.ellipse(cx, hy - ry * 0.05, rx * 1.12, ry * 1.08, 0, Math.PI * 1.04, Math.PI * 1.96); x.stroke();
  [-1, 1].forEach(sd => { x.fillStyle = '#2B2F3A'; x.beginPath(); x.ellipse(cx + sd * rx * 1.08, hy + ry * 0.05, rx * 0.22, ry * 0.3, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#1F9D6B'; x.beginPath(); x.ellipse(cx + sd * rx * 1.1, hy + ry * 0.05, rx * 0.1, ry * 0.15, 0, 0, Math.PI * 2); x.fill(); });
}
function drawSunglasses(cx, ey, rx, ry) {
  const x = ctx;
  x.fillStyle = '#1B1F2A';
  x.beginPath(); x.ellipse(cx - rx * 0.38, ey, rx * 0.28, ry * 0.16, 0, 0, Math.PI * 2); x.ellipse(cx + rx * 0.38, ey, rx * 0.28, ry * 0.16, 0, 0, Math.PI * 2); x.fill();
  x.strokeStyle = '#1B1F2A'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx - rx * 0.12, ey - ry * 0.03); x.lineTo(cx + rx * 0.12, ey - ry * 0.03); x.stroke();
  x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.ellipse(cx - rx * 0.46, ey - ry * 0.05, rx * 0.08, ry * 0.04, -0.4, 0, Math.PI * 2); x.ellipse(cx + rx * 0.3, ey - ry * 0.05, rx * 0.08, ry * 0.04, -0.4, 0, Math.PI * 2); x.fill();
}
function drawWatch(wx, wy, aw) {
  const x = ctx;
  x.fillStyle = '#2B2F3A'; x.fillRect(wx - aw * 0.95, wy - aw * 0.25, aw * 1.9, aw * 0.9);
  x.fillStyle = '#3EE08A'; x.fillRect(wx - aw * 0.45, wy - aw * 0.12, aw * 0.9, aw * 0.6);
}
// ---- UI: points card, quests, shop ----
function renderRewards() {
  const ps = pointsSummary(), lv = levelOf(ps.earned), td = todayStr();
  $('ptBal').textContent = '⭐ ' + ps.bal;
  $('ptLvl').textContent = t('levelW', { n: lv.L }) + ' · ' + lvlTitle(lv.L);
  $('ptBar').style.width = clamp(lv.into / lv.need * 100, 0, 100) + '%';
  $('ptNext').textContent = t('toNext', { n: lv.L + 1, x: lv.need - lv.into });
  $('ptToday').textContent = t('todayPts', { n: dayPoints(td) });
  if ($('petBox')) renderPet();
  $('avPts').textContent = '⭐ ' + ps.bal + ' · ' + t('lvlShort', { n: lv.L });
  const qs = questsFor(td);
  $('questList').innerHTML = qs.map(id => {
    const q = QUESTS[id], pr = questProgress(id, td), done = pr >= 1;
    return `<div class="quest${done ? ' done' : ''}"><div class="qtop"><span>${q.e} ${esc(q.n[LI()])}</span><b>${done ? '✅' : '+10 ⭐'}</b></div><div class="bar"><i style="width:${Math.round(pr * 100)}%"></i></div></div>`;
  }).join('');
  // one-time toasts for freshly finished quests / level ups
  D.qDone = D.qDone || {}; const was = D.qDone[td] || [];
  const now = qs.filter(id => questProgress(id, td) >= 1);
  const fresh = now.filter(id => !was.includes(id));
  if (fresh.length) {
    D.qDone = { [td]: now }; bump('quests', fresh.length); if (now.length === 3) bump('allQuests');
    setTimeout(() => toast(now.length === 3 && was.length < 3 ? t('allQuests') : t('questToast', { n: QUESTS[fresh[0]].n[LI()] })), 300);
  }
  if ((D.lvlSeen || 1) < lv.L) { D.lvlSeen = lv.L; save(); setTimeout(() => toast(t('lvlUp', { n: lv.L, t: lvlTitle(lv.L) })), 900); }
}

let shopCat = 'hat', shopSel = null;
function openShop() { shopSel = null; AV_TRY = null; $('shop').classList.remove('hidden'); renderShop(); }
function closeShop() { AV_TRY = null; $('shop').classList.add('hidden'); if (AV_STATE) drawAvatar(AV_STATE.w, AV_STATE.tone); }
function renderShop() {
  const st = shopState(), ps = pointsSummary(), lv = levelOf(ps.earned);
  $('shopBal').textContent = t('balanceW', { n: ps.bal });
  const test = !!D.testMode;
  $('shopCats').innerHTML = SLOTS.map(([sl, key]) => `<button data-sc="${sl}" class="${sl === shopCat ? 'on' : ''}">${t(key)}</button>`).join('');
  $('shopGrid').innerHTML = SHOP.filter(i => i.slot === shopCat).map(i => {
    const own = test || st.owned.includes(i.id), on = st.eq[i.slot] === i.id, locked = i.lvl && lv.L < i.lvl;
    let btn;
    if (own) btn = `<button class="btn ${on ? 'ghost' : ''}" data-eq="${i.id}">${on ? t('unequip') : t('equip')}</button>`;
    else if (locked) btn = `<button class="btn ghost" disabled>${t('lockedLvl', { n: i.lvl })}</button>`;
    else btn = `<button class="btn${ps.bal < i.price ? ' ghost' : ''}" data-buy="${i.id}">${t('buy')} · ${i.price} ⭐</button>`;
    return `<div class="sitem${shopSel === i.id ? ' sel' : ''}${on ? ' on' : ''}" data-try="${i.id}"><div class="sic">${i.ic}</div><b>${esc(i.n[LI()])}</b>${btn}</div>`;
  }).join('');
  if (test) $('shopGrid').insertAdjacentHTML('afterbegin', `<p class="testBanner" style="grid-column:1/-1">${t('testBanner')}</p>`);
  AV_TARGET = $('shopPrev');
  if (AV_STATE) drawAvatar(AV_STATE.w, AV_STATE.tone);
  AV_TARGET = null;
}
$('shopBtn').addEventListener('click', openShop);
$('shopClose').addEventListener('click', closeShop);
$('shop').addEventListener('click', e => { if (e.target.id === 'shop') closeShop(); });
$('shopCats').addEventListener('click', e => { const b = e.target.closest('[data-sc]'); if (!b) return; shopCat = b.dataset.sc; shopSel = null; AV_TRY = null; renderShop(); });
$('shopGrid').addEventListener('click', e => {
  const st = shopState();
  const buy = e.target.closest('[data-buy]'), eq = e.target.closest('[data-eq]'), tr = e.target.closest('[data-try]');
  if (buy) {
    const it = itemById(buy.dataset.buy), ps = pointsSummary();
    if (ps.bal < it.price) { toast(t('notEnough', { n: it.price - ps.bal })); return; }
    st.owned.push(it.id); st.eq[it.slot] = it.id; save(); AV_TRY = null; shopSel = it.id;
    toast(t('bought', { n: it.n[LI()] })); renderShop(); renderRewards(); return;
  }
  if (eq) {
    const it = itemById(eq.dataset.eq);
    if (st.eq[it.slot] === it.id) delete st.eq[it.slot]; else st.eq[it.slot] = it.id;
    save(); AV_TRY = null; renderShop(); return;
  }
  if (tr) { const it = itemById(tr.dataset.try); shopSel = it.id; AV_TRY = { [it.slot]: it.id }; renderShop(); }
});

// ================= v6: AI coach (sport & nutrition only) =================
function coachContext() {
  const p = P(), td = todayStr(), w = weightAt(td), ct = calTarget(w), tt = dayTotals(td, w), mt = macroTargets(w);
  let wo = 0, mins = 0;
  for (let i = 0; i < 7; i++) peekDay(addDays(td, -i)).acts.forEach(a => { mins += a.min; if (a.id === 'homeworkout' || a.id === 'gym') wo++; });
  const goal = { lose: 'lose weight', keep: 'maintain weight', gain: 'build muscle' }[ct.g];
  const job = { 1.2: 'sitting job', 1.35: 'on feet at work', 1.5: 'heavy physical work' }[p.job] || 'on feet at work';
  return [
    `Sex: ${p.sex === 'm' ? 'male' : 'female'}, age ${p.age}, height ${p.height} cm, current weight ≈ ${r1(w)} kg (BMI ${r1(w / Math.pow(p.height / 100, 2))})${p.targetW ? ', target weight ' + p.targetW + ' kg' : ''}.`,
    `Lifestyle: ${job}. Goal: ${goal}. Daily calorie target ≈ ${ct.tg} kcal (safe minimum ${calFloor()}), protein ≈ ${mt.p} g, fat ≈ ${mt.f} g, carbs ≈ ${mt.c} g.`,
    `Today so far: eaten ${Math.round(tt.eaten)} kcal, protein ${Math.round(tt.p)} g, fat ${Math.round(tt.f)} g, carbs ${Math.round(tt.c)} g; steps ${peekDay(td).steps || 0}; water ${peekDay(td).water || 0} glasses.`,
    `Last 7 days: ${wo} strength/home workouts, ${mins} active minutes in total. Fat mostly stored on: ${shapeOf(p)}.`,
    `The app's home workout uses: squats, push-ups (wall/incline/knee/full), chair dips, lunges, glute bridge, plank, mountain climbers.`
  ].join('\n');
}
function coachSystem() {
  const lang = { uk: 'Ukrainian', cs: 'Czech', en: 'English' }[LANG];
  const minor = P().age < 18;
  return `You are "Coach", a friendly, practical fitness and nutrition assistant inside the app "My Twin".
Only help with: exercise and technique, home and gym workouts, sports, running/walking, stretching, nutrition and healthy eating, meal ideas, protein/calories, hydration, sleep and recovery, motivation and habits.
If the question is about anything else, say in one short sentence that you only help with sport and nutrition, and offer a related question instead.
Always reply in ${lang}. Write for a phone screen: short, clear, at most about 150 words, simple bullet lists, no tables.
Personalise using the user's data below, but don't repeat the data back.
Safety rules: you are not a doctor. For pain, injury, illness, pregnancy, medications, heart or blood-pressure issues, recommend seeing a doctor and do not prescribe a plan. Never recommend eating below ${calFloor()} kcal a day, multi-day fasting, dehydration, laxatives, diet pills, or losing more than about 1% of body weight per week. If the user describes restricting, bingeing, purging or fear of food, respond with care, don't give numbers or diet plans, and gently suggest talking to a doctor or someone they trust.${minor ? ' The user is under 18: focus on healthy habits, sport and balanced eating, not on weight loss or calorie cutting.' : ''}
User data:
${coachContext()}`;
}
function mdLite(s) {
  const lines = esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').split('\n');
  let out = '', list = null;
  for (const ln of lines) {
    const m = ln.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)$/);
    if (m) { if (!list) { out += '<ul>'; list = true; } out += '<li>' + m[1] + '</li>'; continue; }
    if (list) { out += '</ul>'; list = null; }
    out += ln.trim() ? '<p>' + ln + '</p>' : '';
  }
  if (list) out += '</ul>';
  return out;
}
let coachBusy = false, coachAbort = null;
function renderChat() {
  const log = D.chat || [];
  const html = [`<div class="msg a">${mdLite(t('coachHello'))}</div>`].concat(log.map(m => `<div class="msg ${m.r === 'u' ? 'u' : 'a'}">${m.r === 'u' ? esc(m.c) : mdLite(m.c)}</div>`));
  $('chatLog').innerHTML = html.join('');
  $('chatChips').innerHTML = log.length ? '' : ['q1', 'q2', 'q3', 'q4', 'q5'].map(k => `<button class="chip" data-q="${k}">${esc(t(k))}</button>`).join('');
  $('chatLog').scrollTop = $('chatLog').scrollHeight;
  const off = !SAMPLE;
  $('coachOff').style.display = off ? 'block' : 'none';
  $('chatSend').disabled = off || coachBusy; $('chatText').disabled = off;
}
function openCoach() { $('coach').classList.remove('hidden'); renderChat(); setTimeout(() => { if (SAMPLE) $('chatText').focus(); }, 60); }
function closeCoach() { $('coach').classList.add('hidden'); try { coachAbort && coachAbort.abort(); } catch (e) {} }
async function askCoach(q) {
  q = (q || '').trim().slice(0, 600);
  if (!q || coachBusy || !SAMPLE) return;
  D.chat = (D.chat || []).concat([{ r: 'u', c: q }]); bump('coach');
  coachBusy = true; renderChat();
  const bubble = document.createElement('div'); bubble.className = 'msg a'; bubble.innerHTML = '<p class="muted">' + t('thinking') + '</p>';
  $('chatLog').appendChild(bubble); $('chatLog').scrollTop = $('chatLog').scrollHeight;
  const hist = D.chat.slice(-12).map(m => ({ role: m.r === 'u' ? 'user' : 'assistant', content: m.c }));
  while (hist.length && hist[0].role !== 'user') hist.shift();
  hist[0] = { role: 'user', content: coachSystem() + '\n\n---\nUser question:\n' + hist[0].content };
  coachAbort = new AbortController();
  try {
    const res = await SAMPLE(hist, { modelTier: 'default', cache: false, signal: coachAbort.signal,
      onText: ({ text }) => { bubble.innerHTML = mdLite(text); $('chatLog').scrollTop = $('chatLog').scrollHeight; } });
    const txt = (res && res.text || '').trim() || t('coachErr');
    D.chat.push({ r: 'a', c: txt }); D.chat = D.chat.slice(-40); save();
  } catch (e) {
    const msg = e && e.code === 'rate_limited' ? t('coachBusy') : e && e.code === 'not_granted' ? t('coachOff') : t('coachErr');
    if (e && e.code === 'not_granted') SAMPLE = null;
    D.chat.push({ r: 'a', c: msg }); save();
  } finally { coachBusy = false; coachAbort = null; renderChat(); }
}
$('coachOpen').addEventListener('click', openCoach);
$('coachClose').addEventListener('click', closeCoach);
$('coach').addEventListener('click', e => { if (e.target.id === 'coach') closeCoach(); });
$('coachClear').addEventListener('click', () => { D.chat = []; save(); renderChat(); });
$('chatChips').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (b) askCoach(t(b.dataset.q)); });
$('chatSend').addEventListener('click', () => { const v = $('chatText').value; $('chatText').value = ''; askCoach(v); });
$('chatText').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('chatSend').click(); } });
$('chatText').addEventListener('input', () => { const el = $('chatText'); el.style.height = 'auto'; el.style.height = Math.min(120, el.scrollHeight) + 'px'; });

// ---- v9: shaded limbs and a more natural face ----
function limb(x1, y1, x2, y2, w1, w2, col, noEnd) {
  const x = ctx, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  const g = x.createLinearGradient(x1 + nx * w1, y1 + ny * w1, x1 - nx * w1, y1 - ny * w1);
  g.addColorStop(0, shade(col, 0.82)); g.addColorStop(0.35, col); g.addColorStop(0.6, shade(col, 1.06)); g.addColorStop(1, shade(col, 0.86));
  x.fillStyle = g;
  x.beginPath(); x.moveTo(x1 + nx * w1, y1 + ny * w1); x.lineTo(x2 + nx * w2, y2 + ny * w2); x.lineTo(x2 - nx * w2, y2 - ny * w2); x.lineTo(x1 - nx * w1, y1 - ny * w1); x.closePath(); x.fill();
  x.beginPath(); x.arc(x1, y1, w1, 0, Math.PI * 2); x.fill(); if (!noEnd) { x.beginPath(); x.arc(x2, y2, w2, 0, Math.PI * 2); x.fill(); }
}
function drawHand(wx0, wy0, sd, aw, skin, ang = 0) {
  const x = ctx;
  if (Math.abs(ang) > 0.05) {   // raised hand: draw in a frame rotated so that 'down' points along the forearm
    x.save(); x.translate(wx0, wy0); x.rotate(Math.PI + ang); drawHand(0, 0, -sd, aw, skin, 0); x.restore(); return;
  }
  const wx = wx0, wy = wy0;
  x.fillStyle = skin; x.beginPath(); x.ellipse(wx, wy + aw * 1.25, aw * 0.88, aw * 1.25, 0, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.ellipse(wx - sd * aw * 0.82, wy + aw * 0.75, aw * 0.32, aw * 0.6, sd * 0.55, 0, Math.PI * 2); x.fill();
  x.strokeStyle = shade(skin, 0.8); x.lineWidth = Math.max(0.8, aw * 0.12); x.lineCap = 'round';
  for (let i = -1; i <= 1; i++) { x.beginPath(); x.moveTo(wx + i * aw * 0.32, wy + aw * 1.75); x.lineTo(wx + i * aw * 0.3, wy + aw * 2.3); x.stroke(); }
}
function drawFace(p, cx, hy, rx, ry, hc, skin, blink, male) {
  const x = ctx, ey = hy - ry * 0.02, eyeW = rx * 0.19, eyeH = ry * 0.1, iris = p.eyes || EYE_COLS[0];
  const eyeShape = ex => { x.beginPath(); x.moveTo(ex - eyeW, ey + eyeH * 0.15); x.bezierCurveTo(ex - eyeW * 0.6, ey - eyeH * 1.35, ex + eyeW * 0.6, ey - eyeH * 1.35, ex + eyeW, ey); x.bezierCurveTo(ex + eyeW * 0.55, ey + eyeH * 1.05, ex - eyeW * 0.55, ey + eyeH * 1.05, ex - eyeW, ey + eyeH * 0.15); x.closePath(); };
  // soft socket shadow under the brows
  x.fillStyle = 'rgba(120,60,40,.08)'; [-1, 1].forEach(sd => { x.beginPath(); x.ellipse(cx + sd * rx * 0.37, ey - eyeH * 0.6, eyeW * 1.35, eyeH * 1.5, 0, 0, Math.PI * 2); x.fill(); });
  [-1, 1].forEach(sd => {
    const ex = cx + sd * rx * 0.37;
    if (blink) {
      x.strokeStyle = '#2E2019'; x.lineWidth = Math.max(1.4, ry * 0.04); x.lineCap = 'round';
      x.beginPath(); x.moveTo(ex - eyeW, ey); x.quadraticCurveTo(ex, ey + eyeH * 0.9, ex + eyeW, ey); x.stroke();
    } else {
      x.fillStyle = '#FFFFFF'; eyeShape(ex); x.fill();
      x.save(); eyeShape(ex); x.clip();
      const ix = ex + sd * eyeW * 0.04, iy = ey - eyeH * 0.12, ir = eyeH * 1.05;
      const ig = x.createRadialGradient(ix, iy + ir * 0.3, ir * 0.1, ix, iy, ir); ig.addColorStop(0, shade(iris, 1.45)); ig.addColorStop(0.7, iris); ig.addColorStop(1, shade(iris, 0.6));
      x.fillStyle = ig; x.beginPath(); x.arc(ix, iy, ir, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#120C09'; x.beginPath(); x.arc(ix, iy, ir * 0.48, 0, Math.PI * 2); x.fill();
      x.fillStyle = 'rgba(0,0,0,.16)'; x.fillRect(ex - eyeW, ey - eyeH * 1.6, eyeW * 2, eyeH * 0.8);   // upper lid shadow
      x.restore();
      x.fillStyle = 'rgba(255,255,255,.95)'; x.beginPath(); x.arc(ix + ir * 0.35, iy - ir * 0.35, ir * 0.27, 0, Math.PI * 2); x.fill();
      x.fillStyle = 'rgba(255,255,255,.6)'; x.beginPath(); x.arc(ix - ir * 0.3, iy + ir * 0.35, ir * 0.12, 0, Math.PI * 2); x.fill();
      // upper lid line (thicker at the outer corner) + soft lower lid
      x.strokeStyle = '#2E2019'; x.lineCap = 'round'; x.lineWidth = Math.max(1.4, ry * (male ? 0.035 : 0.045));
      x.beginPath(); x.moveTo(ex - eyeW, ey + eyeH * 0.15); x.bezierCurveTo(ex - eyeW * 0.6, ey - eyeH * 1.35, ex + eyeW * 0.6, ey - eyeH * 1.35, ex + eyeW * 1.05, ey - eyeH * 0.05); x.stroke();
      if (!male) { x.lineWidth = 1; [0.35, 0.7].forEach(k => { const lx = ex + sd * eyeW * k; x.beginPath(); x.moveTo(lx, ey - eyeH * 0.95); x.lineTo(lx + sd * eyeW * 0.18, ey - eyeH * 1.35); x.stroke(); }); }
      x.strokeStyle = 'rgba(120,60,40,.25)'; x.lineWidth = 0.9; x.beginPath(); x.moveTo(ex - eyeW * 0.8, ey + eyeH * 0.55); x.quadraticCurveTo(ex, ey + eyeH * 1.05, ex + eyeW * 0.85, ey + eyeH * 0.35); x.stroke();
      // lid crease
      x.strokeStyle = 'rgba(90,45,30,.22)'; x.lineWidth = 1; x.beginPath(); x.moveTo(ex - eyeW * 0.8, ey - eyeH * 1.25); x.quadraticCurveTo(ex, ey - eyeH * 2.0, ex + eyeW * 0.9, ey - eyeH * 0.9); x.stroke();
    }
    // eyebrow: thick, tapered, slightly arched
    const bx = ex, by = ey - ry * 0.2, bw = eyeW * 1.3, th = ry * (male ? 0.06 : 0.04);
    x.fillStyle = shade(hc, 0.82); x.beginPath();
    x.moveTo(bx - sd * bw, by + th * 0.6);
    x.quadraticCurveTo(bx - sd * bw * 0.2, by - th * 1.4, bx + sd * bw * 1.05, by + th * 0.2);
    x.quadraticCurveTo(bx - sd * bw * 0.1, by - th * 0.2, bx - sd * bw, by + th * 1.5);
    x.closePath(); x.fill();
  });
  // nose: soft side shadow, nostril wings, tip highlight (no hard outline)
  const nyT = ey + ry * 0.3;
  { const ng = x.createRadialGradient(cx + rx * 0.08, nyT - ry * 0.06, 0, cx + rx * 0.08, nyT - ry * 0.06, rx * 0.2); ng.addColorStop(0, 'rgba(120,55,35,.22)'); ng.addColorStop(1, 'rgba(120,55,35,0)');
    x.fillStyle = ng; x.beginPath(); x.ellipse(cx + rx * 0.08, nyT - ry * 0.08, rx * 0.12, ry * 0.2, 0, 0, Math.PI * 2); x.fill(); }
  x.strokeStyle = 'rgba(120,55,35,.35)'; x.lineWidth = Math.max(1, rx * 0.028); x.lineCap = 'round';
  x.beginPath(); x.arc(cx - rx * 0.1, nyT, rx * 0.06, Math.PI * 0.5, Math.PI * 1.3); x.stroke();
  x.beginPath(); x.arc(cx + rx * 0.1, nyT, rx * 0.06, -Math.PI * 0.3, Math.PI * 0.5); x.stroke();
  x.fillStyle = 'rgba(90,40,30,.35)'; x.beginPath(); x.ellipse(cx - rx * 0.055, nyT + ry * 0.025, rx * 0.035, ry * 0.016, 0.2, 0, Math.PI * 2); x.ellipse(cx + rx * 0.055, nyT + ry * 0.025, rx * 0.035, ry * 0.016, -0.2, 0, Math.PI * 2); x.fill();
  x.fillStyle = 'rgba(255,255,255,.28)'; x.beginPath(); x.ellipse(cx - rx * 0.01, nyT - ry * 0.04, rx * 0.05, ry * 0.03, 0, 0, Math.PI * 2); x.fill();
  // friendly closed smile with soft lips
  const my = hy + ry * 0.47, mw = rx * (male ? 0.27 : 0.25);
  x.fillStyle = male ? shade(skin, 0.78) : '#D27C7E';
  x.beginPath(); x.moveTo(cx - mw, my - ry * 0.02); x.quadraticCurveTo(cx, my + ry * 0.14, cx + mw, my - ry * 0.02); x.quadraticCurveTo(cx, my + ry * 0.06, cx - mw, my - ry * 0.02); x.fill();
  x.strokeStyle = male ? '#5A2E24' : '#9A4A48'; x.lineWidth = Math.max(1.2, ry * 0.03); x.lineCap = 'round';
  x.beginPath(); x.moveTo(cx - mw, my - ry * 0.025); x.quadraticCurveTo(cx, my + ry * 0.07, cx + mw, my - ry * 0.025); x.stroke();
  x.strokeStyle = 'rgba(120,55,35,.3)'; x.lineWidth = 1;   // smile corners
  [-1, 1].forEach(sd => { x.beginPath(); x.arc(cx + sd * mw * 1.08, my - ry * 0.05, ry * 0.05, sd > 0 ? -0.6 : Math.PI - 0.9, sd > 0 ? 0.9 : Math.PI + 0.6); x.stroke(); });
  x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.ellipse(cx, my + ry * 0.085, mw * 0.4, ry * 0.02, 0, 0, Math.PI * 2); x.fill();
  // cheeks
  x.fillStyle = 'rgba(225,110,100,.16)'; [-1, 1].forEach(sd => { x.beginPath(); x.ellipse(cx + sd * rx * 0.55, hy + ry * 0.25, rx * 0.17, ry * 0.1, 0, 0, Math.PI * 2); x.fill(); });
  return ey;
}

// ================= v10: pets with food, mood and growth =================
const PET_FOOD = 10, PET_TREAT = 25;
const petData = id => { D.pets = D.pets || {}; return (D.pets[id] = D.pets[id] || { name: '', fed: null, treat: null, feeds: 0 }); };
function petMood(id) {
  const pd = petData(id), td = todayStr();
  const days = pd.fed ? diffDays(pd.fed, td) : 1;
  return days <= 0 ? 'happy' : days === 1 ? 'ok' : 'sad';
}
function petStage(id) { const f = petData(id).feeds; return f < 5 ? 0 : f < 15 ? 1 : 2; }
const PET_SCALE = [0.72, 0.86, 1];
function petSpent() { return (D.petSpent || 0); }
function renderPet() {
  const id = shopState().eq.pet, box = $('petBox');
  if (!id) { box.innerHTML = `<p class="muted">${t('petNone')}</p>`; return; }
  const it = itemById(id), pd = petData(id), mood = petMood(id), st = petStage(id), td = todayStr();
  const nextAt = [5, 15][st];
  const dogWalk = id === 'pet_dog' && (peekDay(td).steps || 0) >= 8000;
  box.innerHTML = `<div class="petHead"><span class="petIc">${it.ic}</span><div style="flex:1"><input id="petName" value="${esc(pd.name || '')}" placeholder="${esc(it.n[LI()])}" maxlength="20">
      <div class="muted" style="margin-top:4px">${t(['stageBaby', 'stageYoung', 'stageAdult'][st])} · ${t('feedsW', { n: pd.feeds })}</div></div></div>
    <p class="petMood ${mood}">${t({ happy: 'moodHappy', ok: 'moodOk', sad: 'moodSad' }[mood])}</p>
    ${dogWalk ? `<p class="muted">${t('dogWalk')}</p>` : ''}
    <p class="muted" style="margin-top:4px">${t('petTapHint')}</p>
    ${st < 2 ? `<div class="bar"><i style="width:${Math.round(pd.feeds / nextAt * 100)}%"></i></div><p class="muted" style="margin-top:4px">${t('growHint', { n: nextAt - pd.feeds })}</p>` : ''}
    <div class="grid2"><button class="btn" id="petFeed"${pd.fed === td ? ' disabled' : ''}>${pd.fed === td ? t('fedToday') : t('feedBtn', { n: PET_FOOD })}</button>
      <button class="btn ghost" id="petTreat"${pd.treat === td ? ' disabled' : ''}>${pd.treat === td ? t('treatToday') : t('treatBtn', { n: PET_TREAT })}</button></div>`;
  $('petName').addEventListener('change', e => { pd.name = e.target.value.trim().slice(0, 20); save(); });
  $('petFeed').addEventListener('click', () => feedPet(id));
  $('petTreat').addEventListener('click', () => {
    if (!D.testMode && pointsSummary().bal < PET_TREAT) return toast(t('notEnough', { n: PET_TREAT - pointsSummary().bal }));
    pd.treat = td; if (pd.fed !== td) { pd.fed = td; pd.feeds++; } if (!D.testMode) D.petSpent = petSpent() + PET_TREAT; save(); toast(t('treatToast')); PET_HEART = 2.5; renderRewards();
  });
}
let PET_HEART = 0;
// ---- pets v3: one consistent, softly shaded style (all six); facing left towards the twin, ground at y = 0, ~40 units tall ----
// ================= pet corner: house (or pond) right next to the pet's spot, plus a food bowl =================
// Everything sits together on the LEFT of the twin (the right is where the arm waves and the weight badge is).
// Tap the pet → it does its thing. Tap its house / the pond → it comes out or goes in (10 min).
// Tap the bowl → feed it for PET_FOOD ⭐ (same as the button in the pet card); a full bowl means "fed today".
// Pets sleep at night (22:00–7:00) and when sad: in their house; the turtle in its pond; the parrot on its perch.
// Runtime state only: nothing new is stored in D.
let PET_RT = { act: null, t0: 0, home: null, homeUntil: 0, pop: -9 };
let PET_HIT = null, PET_WHEEL = null, PET_TAPS = [], PET_FLY_DIM = false;   // tap areas on the main canvas: { house, pet, bowl } as [x0, y0, x1, y1]
const PET_ACT = { pet_dog: ['bark', 2.2], pet_cat: ['purr', 2.4], pet_rabbit: ['hop', 1.6], pet_hamster: ['wheel', 6], pet_turtle: ['tuck', 2.4], pet_parrot: ['talk', 2.4] };
const ACT_DUR = { bark: 2.2, purr: 2.4, hop: 1.6, wheel: 6, tuck: 2.4, talk: 2.4, fly: 5 };
// layout of each corner in cm from where the corner starts (after the free floor next to the twin), going right:
// bowl, the pet's spot, the house / pond on the right — each with its own room, nothing piled up; total width
const PET_LAYOUT = {
  pet_dog: { bowl: 4, spot: 26, house: 58, w: 72 }, pet_cat: { bowl: 4, spot: 26, house: 58, w: 72 },
  pet_rabbit: { bowl: 4, spot: 24, house: 60, w: 74 }, pet_hamster: { bowl: 4, spot: 20, wheel: 45, house: 70, w: 80 },
  pet_turtle: { bowl: 4, spot: 22, house: 50, w: 71 }
};
// the least free floor between the twin's sneaker and the corner (a sneaker is ~13 cm wide)
const PET_GAP = 13;
// small animals are drawn a bit smaller in their corner so they fit next to the house / pond
const PET_K = { pet_hamster: 0.8, pet_turtle: 0.72 };
function petAsleepAuto(id) { const h = new Date().getHours(); return petMood(id) === 'sad' || h >= 22 || h < 7; }
function petInside(id) {
  if (PET_RT.home && Date.now() < PET_RT.homeUntil) return PET_RT.home === 'in';
  return petAsleepAuto(id);
}
// draws in "cm" units with the origin on the ground at (ox, G)
function petUnits(ox, G, L, flip) { const x = ctx; x.save(); x.translate(ox, G); x.scale(flip ? -L(1) : L(1), L(1)); return x; }
const pGrad = (x, cx, cy, r, a, b) => { const g = x.createRadialGradient(cx - r * 0.4, cy - r * 0.5, r * 0.1, cx, cy, r * 1.2); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
function petPath(x, fill, line, lw) { x.fillStyle = fill; x.fill(); if (line) { x.strokeStyle = line; x.lineWidth = lw || 0.7; x.lineJoin = 'round'; x.stroke(); } }
// eyes peeking out of a doorway: open & blinking (sent home) or closed (asleep)
function peekEyes(x, ex, ey, gap, asleep, time) {
  if (asleep) {
    x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 0.6; x.lineCap = 'round';
    [-1, 1].forEach(sd => { x.beginPath(); x.arc(ex + sd * gap / 2, ey - 0.3, 0.9, 0.3, Math.PI - 0.3); x.stroke(); });
  } else {
    const blink = (time % 3.2) < 0.15;
    [-1, 1].forEach(sd => {
      x.fillStyle = '#fff'; x.beginPath(); x.ellipse(ex + sd * gap / 2, ey, 1.1, blink ? 0.15 : 1.25, 0, 0, Math.PI * 2); x.fill();
      if (!blink) { x.fillStyle = '#1E2230'; x.beginPath(); x.arc(ex + sd * gap / 2 + 0.25, ey + 0.1, 0.55, 0, Math.PI * 2); x.fill(); }
    });
  }
}
function sleepZ(x, zx, zy, time) {
  x.fillStyle = '#7D8794'; x.textAlign = 'center';
  const f = (time * 0.6) % 1;
  x.globalAlpha = 1 - f * 0.6; x.font = 'bold 4px system-ui'; x.fillText('z', zx, zy - f * 3);
  x.font = 'bold 3px system-ui'; x.fillText('z', zx + 3, zy - 4 - f * 3); x.globalAlpha = 1;
}
// ---- houses; the door faces the pet's spot (to the right); returns the doorway point
function drawPetHouse(id, hx, G, L, flip) {
  const x = petUnits(hx, G, L, flip);
  let door = [0, -5];
  if (id === 'pet_dog') {          // wooden kennel with a gable roof and a bone sign
    x.beginPath(); x.roundRect(-11, -15, 22, 15, 1); petPath(x, pGrad(x, 0, -8, 14, '#D97A55', '#A84E33'), 'rgba(70,30,15,.5)');
    x.strokeStyle = 'rgba(80,35,20,.35)'; x.lineWidth = 0.5; for (let yy = -12; yy < 0; yy += 3) { x.beginPath(); x.moveTo(-11, yy); x.lineTo(11, yy); x.stroke(); }
    x.beginPath(); x.moveTo(-13.5, -14); x.lineTo(0, -25); x.lineTo(13.5, -14); x.lineTo(11.5, -13); x.lineTo(0, -22.5); x.lineTo(-11.5, -13); x.closePath(); petPath(x, '#5B3A29', 'rgba(30,15,5,.5)');
    x.beginPath(); x.moveTo(-5, 0); x.lineTo(-5, -7); x.arc(0, -7, 5, Math.PI, 0); x.lineTo(5, 0); x.closePath(); petPath(x, '#2A1D18');
    x.fillStyle = '#F5F1E6'; x.beginPath(); x.roundRect(-2.6, -18.6, 5.2, 1.4, 0.7); x.fill(); [-2.6, 2.6].forEach(bx => { x.beginPath(); x.arc(bx, -18.4, 0.9, 0, 7); x.arc(bx, -17.6, 0.9, 0, 7); x.fill(); });
    door = [0, -5.5];
  } else if (id === 'pet_cat') {   // soft dome bed shaped like a cat head
    [[-8, -17.5], [8, -17.5]].forEach(([ex2, ey2]) => { x.beginPath(); x.moveTo(ex2 - 3.5, ey2 + 2.5); x.lineTo(ex2 + (ex2 < 0 ? -1 : 1), ey2 - 5); x.lineTo(ex2 + 3.5, ey2 + 2.5); x.closePath(); petPath(x, '#7FB7BE', 'rgba(30,70,75,.5)'); });
    x.beginPath(); x.ellipse(0, 0, 12.5, 19, 0, Math.PI, Math.PI * 2); x.closePath(); petPath(x, pGrad(x, 0, -9, 14, '#9FD0D5', '#5E9AA2'), 'rgba(30,70,75,.5)');
    x.beginPath(); x.ellipse(0, -0.2, 13, 2.2, 0, 0, Math.PI * 2); petPath(x, '#4F858C');
    x.beginPath(); x.arc(0, -6.5, 5.6, 0, Math.PI * 2); petPath(x, '#263A3D', 'rgba(255,255,255,.35)');
    door = [0, -6.5];
  } else if (id === 'pet_rabbit') { // earthen burrow mound with grass on top, entrance towards the spot
    x.beginPath(); x.ellipse(0, 0, 14, 12, 0, Math.PI, Math.PI * 2); x.closePath(); petPath(x, pGrad(x, -2, -6, 14, '#B08A60', '#7A5A3A'), 'rgba(60,40,20,.5)');
    x.fillStyle = 'rgba(70,45,25,.35)'; [[-7, -4, 1.3], [-3, -8, 1], [-9, -8, 0.8]].forEach(([a, b2, r]) => { x.beginPath(); x.arc(a, b2, r, 0, 7); x.fill(); });
    x.strokeStyle = '#5DA34A'; x.lineWidth = 0.9; x.lineCap = 'round';
    for (let i = -10; i <= 10; i += 2.5) { const top = -Math.sqrt(Math.max(0, 1 - (i / 14) ** 2)) * 12; x.beginPath(); x.moveTo(i, top + 0.8); x.lineTo(i - 0.8, top - 2.2); x.moveTo(i, top + 0.8); x.lineTo(i + 1, top - 1.8); x.stroke(); }
    x.beginPath(); x.moveTo(1.5, 0); x.bezierCurveTo(1.5, -8.5, 11.5, -8.5, 11.5, 0); x.closePath(); petPath(x, '#2E2016');
    door = [6.5, -3.5];
  } else if (id === 'pet_hamster') { // little wooden house with a red roof and a round door
    x.beginPath(); x.roundRect(-8, -12, 16, 12, 1); petPath(x, pGrad(x, 0, -6, 10, '#F2D3A0', '#C99A5E'), 'rgba(90,60,25,.5)');
    x.beginPath(); x.moveTo(-10, -11); x.lineTo(0, -19); x.lineTo(10, -11); x.closePath(); petPath(x, pGrad(x, 0, -15, 9, '#E87866', '#B8453A'), 'rgba(90,25,20,.5)');
    x.beginPath(); x.arc(0, -5, 3.6, 0, Math.PI * 2); petPath(x, '#2A1D18');
    x.fillStyle = '#9FD3F0'; x.beginPath(); x.roundRect(-6.5, -10.5, 2.8, 2.8, 0.4); x.fill();
    door = [0, -5];
  }
  x.restore();
  return door;
}
// ---- the turtle's pond (its "house"); the pet spot stone stands at its right edge, partly in the water
function drawPond(px, G, L, time, flip) {
  const x = petUnits(px, G, L, flip);
  // reeds on the far side
  x.strokeStyle = '#5DA34A'; x.lineWidth = 0.8; x.lineCap = 'round';
  [[-17, 9], [-15, 12], [-13, 8]].forEach(([rx2, h]) => { x.beginPath(); x.moveTo(rx2, -1); x.quadraticCurveTo(rx2 - 1, -h / 2, rx2 + 0.5, -h); x.stroke(); });
  x.fillStyle = '#8A5A35'; x.beginPath(); x.ellipse(-14.6, -11.5, 0.8, 2, 0, 0, 7); x.fill();
  // pebble rim + water
  x.beginPath(); x.ellipse(0, -1.2, 20.5, 4.9, 0, 0, Math.PI * 2); petPath(x, '#B9BFC7');
  const wg = x.createLinearGradient(0, -5, 0, 2); wg.addColorStop(0, '#9ED8F2'); wg.addColorStop(1, '#4C9FD0');
  x.beginPath(); x.ellipse(0, -1.2, 19, 4, 0, 0, Math.PI * 2); petPath(x, wg);
  // ripples
  x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 0.45;
  const f = (time * 0.4) % 1;
  [[-7, -1.6], [6, -0.6]].forEach(([wx, wy], i) => { const k = (f + i * 0.5) % 1; x.globalAlpha = 1 - k; x.beginPath(); x.ellipse(wx, wy, 1.5 + k * 4, 0.4 + k, 0, 0, Math.PI * 2); x.stroke(); });
  x.globalAlpha = 1;
  x.restore();
}
// ---- the spot where the pet sits; returns how high the pet sits above the ground (cm)
function drawPetSpot(id, rx, G, L, flip) {
  const x = petUnits(rx, G, L, flip);
  let lift = 0;
  if (id === 'pet_dog' || id === 'pet_cat') {          // round bed
    const rim = id === 'pet_dog' ? ['#7C9CD6', '#4E6CA8'] : ['#D79AB8', '#A3628A'];
    x.fillStyle = 'rgba(27,42,74,.14)'; x.beginPath(); x.ellipse(1, 0.5, 17, 2.4, 0, 0, 7); x.fill();
    x.beginPath(); x.ellipse(1, -2.6, 16.5, 4.4, 0, 0, Math.PI * 2); petPath(x, pGrad(x, 1, -3, 16, rim[0], rim[1]), 'rgba(30,30,60,.4)');
    x.beginPath(); x.ellipse(1, -3.4, 12.5, 2.6, 0, 0, Math.PI * 2); petPath(x, id === 'pet_dog' ? '#DCE6F7' : '#F6E1EC');
    lift = 3;
  } else if (id === 'pet_turtle') {                       // flat stone, its left side in the pond
    x.beginPath(); x.moveTo(-10, -0.4); x.bezierCurveTo(-10, -4.6, -5, -6, 1, -6); x.bezierCurveTo(7, -6, 11, -4.6, 11, 0); x.bezierCurveTo(5, 0.6, -5, 0.6, -10, -0.4); x.closePath();
    petPath(x, pGrad(x, 0, -3, 12, '#B5BCC5', '#6E7781'), 'rgba(40,45,55,.45)');
    x.fillStyle = 'rgba(111,174,90,.75)'; [[6, -4.8, 2], [9, -2.6, 1.4]].forEach(([a, b2, r]) => { x.beginPath(); x.ellipse(a, b2, r, r * 0.5, 0, 0, 7); x.fill(); });
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 0.45; x.beginPath(); x.ellipse(-9, -0.6, 3, 0.7, 0, 0, Math.PI * 2); x.stroke();   // water touching the stone
    lift = 5.6;
  } else if (id === 'pet_rabbit') {                       // grass tufts and a carrot
    x.strokeStyle = '#5DA34A'; x.lineWidth = 0.9; x.lineCap = 'round';
    [[-12, 0], [15, 0], [18, 0]].forEach(([gx]) => { for (let k = -1; k <= 1; k++) { x.beginPath(); x.moveTo(gx + k, 0); x.quadraticCurveTo(gx + k * 2, -3, gx + k * 2.6, -5 + Math.abs(k)); x.stroke(); } });
  } else if (id === 'pet_hamster') {                      // hay pile
    x.beginPath(); x.ellipse(0, -1.4, 10, 3.2, 0, Math.PI, Math.PI * 2); x.closePath(); petPath(x, '#E8C766');
    x.strokeStyle = '#C9A240'; x.lineWidth = 0.45;
    for (let k = -9; k <= 9; k += 1.6) { x.beginPath(); x.moveTo(k, -0.8); x.lineTo(k + 2.4 * Math.sin(k * 3), -3.2 - Math.abs(Math.sin(k)) * 1.6); x.stroke(); }
    lift = 2.4;
  }
  x.restore();
  return lift;
}
function drawWheel(wx0, G, L, time, spinning) {
  const x = petUnits(wx0, G, L), wy = -15, R = 14, ang = spinning ? time * 7 : 0;
  x.fillStyle = 'rgba(27,42,74,.12)'; x.beginPath(); x.ellipse(0, 0.5, 12, 1.8, 0, 0, 7); x.fill();
  x.strokeStyle = '#8A93A3'; x.lineWidth = 1.2; x.lineCap = 'round';
  x.beginPath(); x.moveTo(-6, 0); x.lineTo(0, wy); x.lineTo(6, 0); x.stroke();
  x.beginPath(); x.arc(0, wy, R, 0, Math.PI * 2); x.strokeStyle = '#5E8FD6'; x.lineWidth = 1.4; x.stroke();
  x.strokeStyle = 'rgba(94,143,214,.55)'; x.lineWidth = 0.5;
  for (let k = 0; k < 8; k++) { const a = ang + k * Math.PI / 4; x.beginPath(); x.moveTo(0, wy); x.lineTo(Math.cos(a) * R, wy + Math.sin(a) * R); x.stroke(); }
  x.fillStyle = '#C9CED6'; x.beginPath(); x.arc(0, wy, 1.2, 0, 7); x.fill();
  x.restore();
}
// food bowl: full (fed today) or empty; returns its tap rectangle
function drawBowl(id, bx, G, L, full) {
  const x = petUnits(bx, G, L);
  const col = { pet_dog: ['#E5484D', '#A8282D'], pet_cat: ['#F2A93B', '#C27C1A'], pet_rabbit: ['#7FB7BE', '#4F858C'], pet_hamster: ['#9B7BD8', '#6A4FAA'], pet_turtle: ['#6FAE5A', '#4E8A3E'] }[id] || ['#5E8FD6', '#3E6BB0'];
  x.fillStyle = 'rgba(27,42,74,.14)'; x.beginPath(); x.ellipse(0, 0.4, 5.4, 1.1, 0, 0, 7); x.fill();
  x.beginPath(); x.moveTo(-4.8, -2.6); x.lineTo(4.8, -2.6); x.lineTo(3.8, 0); x.lineTo(-3.8, 0); x.closePath(); petPath(x, col[0], 'rgba(0,0,0,.25)');
  x.beginPath(); x.ellipse(0, -2.6, 4.8, 1.2, 0, 0, Math.PI * 2); petPath(x, col[1]);
  if (full) {
    const food = { pet_rabbit: '#F08A3C', pet_hamster: '#E2B04A', pet_turtle: '#8CCF5E', pet_parrot: '#E2B04A' }[id] || '#9A6B42';
    x.fillStyle = food; x.beginPath(); x.ellipse(0, -3, 4.2, 1.6, 0, Math.PI, Math.PI * 2); x.fill();
    x.fillStyle = 'rgba(255,255,255,.35)'; [[-1.8, -3.6], [0.6, -3.9], [2.2, -3.3]].forEach(([a, b2]) => { x.beginPath(); x.arc(a, b2, 0.5, 0, 7); x.fill(); });
  } else { x.beginPath(); x.ellipse(0, -2.5, 3.9, 0.8, 0, 0, Math.PI * 2); petPath(x, 'rgba(0,0,0,.35)'); }
  x.restore();
  return [bx - L(6), G - L(6), bx + L(6), G + L(1.5)];
}
function petBubble(bx, by, text, L) {
  const x = ctx; x.save();
  x.font = `800 ${Math.max(11, Math.round(L(5.2)))}px Manrope, system-ui, sans-serif`;
  const w = x.measureText(text).width + 14, h = Math.max(20, L(9));
  x.fillStyle = '#fff'; x.strokeStyle = 'rgba(27,42,74,.25)'; x.lineWidth = 1;
  x.beginPath(); x.roundRect(bx - w / 2, by - h, w, h, h / 2); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(bx - 4, by - 0.5); x.lineTo(bx + 2, by + 6); x.lineTo(bx + 4, by - 0.5); x.closePath(); x.fill();
  x.fillStyle = '#1B2A4A'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, bx, by - h / 2 + 0.5); x.textBaseline = 'alphabetic';
  x.restore();
}
// the whole pet corner; called from drawAvatar with the twin's measurements
function drawPetScene(id, d, time, pass) {
  const { cx, G, Y, hipW, armW, shW, H } = d, L0 = d.L, main = !AV_TARGET;
  const inside = petInside(id), asleep = petAsleepAuto(id) && inside;
  const an = PET_RT.actName || PET_ACT[id][0];
  const act = !inside && PET_RT.act === id && time - PET_RT.t0 < (ACT_DUR[an] || 2) ? an : null;
  const sc = PET_SCALE[petStage(id)], fed = petData(id).fed === todayStr();
  const pop = clamp((time - PET_RT.pop) / 0.35, 0, 1), popS = 0.55 + 0.45 * (1 - (1 - pop) ** 3);
  const hit = {};
  if (id === 'pet_parrot') {
    if (pass === 'back') return;
    // no house: it sleeps right on its perch; its food bowl hangs from the perch
    const sx = Math.max(cx - L0(Math.max(hipW, 14) + armW * 2 + 17), 24 + L0(13)), top = Y(0.81);
    drawParrotStand(sx, G, top, L0);
    // the bowl: a bracket from the perch end and a proper, colourful bowl (easy to see and to tap)
    const bx = sx + L0(9), by = top + L0(15), LB = cm => L0(cm) * 1.7;   // the bowl is drawn 1.7x bigger
    ctx.strokeStyle = '#6E4C30'; ctx.lineWidth = Math.max(1.5, L0(0.7)); ctx.beginPath(); ctx.moveTo(bx, top + L0(1.4)); ctx.lineTo(bx, by - LB(2.4)); ctx.stroke();
    drawBowl(id, bx, by, LB, fed);
    hit.bowl = [bx - L0(12), top + L0(2), bx + L0(12), by + L0(4)];
    // the weight badge fades while the parrot flies over the top of the scene (like when the twin waves)
    if (main) { const flying = act === 'fly', wb = $('avWeight'); if (wb && flying !== PET_FLY_DIM) { PET_FLY_DIM = flying; wb.classList.toggle('dim', flying); } }
    if (act === 'fly') {
      // three quick taps: a lap around the twin and back to the perch, wings flapping
      const u = clamp((time - PET_RT.t0) / ACT_DUR.fly, 0, 1), ccy = Y(0.58);
      const rx = L0(Math.max(hipW, shW) + armW * 2 + 16), ry = L0(H * 0.42);
      const a0 = Math.atan2((top - ccy) / ry, (sx - cx) / rx), a = a0 + u * Math.PI * 2;
      const ex = cx + Math.cos(a) * rx, ey = ccy + Math.sin(a) * ry;
      const ease = v => v * v * (3 - 2 * v), w = ease(Math.min(u / 0.12, 1)) * ease(Math.min((1 - u) / 0.12, 1));
      const fx = sx + (ex - sx) * w, fy = top + (ey - top) * w + Math.sin(time * 10) * L0(1.5) * w;
      const dir = -Math.sin(a);   // moving right when > 0 (the drawing faces left by default)
      drawPetV2(id, fx, fy, L0, time * 2.5, { stand: dir > 0, excited: true, fly: true });
    } else {
      ctx.save(); ctx.translate(sx, top); ctx.scale(popS, popS); ctx.translate(-sx, -top);
      drawPetV2(id, sx, top, L0, time * (act ? 1.8 : 1), { stand: true, excited: !!act, sleep: inside, perch: true });
      ctx.restore();
      if (act) petBubble(sx + L0(4), top - L0(34) * sc, t('petSayParrot'), L0);
    }
    hit.pet = [sx - L0(13), top - L0(36) * sc, sx + L0(13), top + L0(1)];
    hit.house = hit.pet;   // tapping a sleeping parrot wakes it
  } else {
    // the corner stands on the ground to the RIGHT of the twin (only the parrot needs the left: shoulder height);
    // the house starts behind the leg; the corner grows when there is room (wide screens, the shop preview)
    // anchored at the right edge; it may grow up to x1.2, and always keeps at least PET_GAP of floor from the foot
    const lay = PET_LAYOUT[id], CW = d.CW || cx * 2, right = CW - Math.max(L0(5), CW * 0.05);
    const footX = cx + L0(d.legC + 0.8 + (d.ankW + 3.2) * 1.02);
    const k = clamp((right - footX - L0(PET_GAP)) / L0(lay.w), 0.6, 1.2), L = cm => L0(cm) * k;
    const x0 = right - L(lay.w), at = cm => x0 + L(cm);
    const pk = PET_K[id] || 1;
    if (pass === 'back') {
      ctx.fillStyle = 'rgba(27,42,74,.07)'; ctx.beginPath(); ctx.ellipse(x0 + L(lay.w / 2), G + 1, L(lay.w / 2 + 6), L(2.6), 0, 0, Math.PI * 2); ctx.fill();
      if (id === 'pet_turtle') drawPond(at(lay.house), G, L, time, true); else {
        const door = drawPetHouse(id, at(lay.house), G, L, true);   // mirrored: the door faces the pet
        if (inside) {
          const x = petUnits(at(lay.house), G, L, true);
          peekEyes(x, door[0], door[1], id === 'pet_rabbit' ? 2.2 : 2.6, asleep, time);
          x.restore();
          if (asleep) { const z = petUnits(at(lay.house), G, L); sleepZ(z, -door[0] + 4, door[1] - 14, time); z.restore(); }
        }
      }
      if (lay.wheel) { drawWheel(at(lay.wheel), G, L, time, act === 'wheel'); if (main) PET_WHEEL = [at(lay.wheel) - L(15), G - L(30), at(lay.wheel) + L(15), G + L(1)]; }
      if (inside && id === 'pet_turtle') {
        // in the pond: only the top of the shell and the eyes above the water
        const tx = at(lay.house) + L(2), ty = G + L(6.5), wl = G - L(1.4);   // wl = water line
        ctx.save(); ctx.beginPath(); ctx.rect(tx - L(30), wl - L(40), L(60), L(40)); ctx.clip();
        ctx.translate(tx, ty); ctx.scale(pk, pk); ctx.translate(-tx, -ty);
        drawPetV2(id, tx, ty, L, time, { noShadow: true, sleep: asleep });
        ctx.restore();
        const x = petUnits(tx, G, L); if (asleep) sleepZ(x, 6, -12, time); x.restore();
      }
      const hw = id === 'pet_turtle' ? 20 : 15;
      if (main) PET_HIT = { house: [at(lay.house) - L(hw), G - L(id === 'pet_turtle' ? 10 : 27), at(lay.house) + L(hw), G + L(2)], wheel: lay.wheel ? PET_WHEEL : null };
      return;
    }
    const lift = drawPetSpot(id, at(lay.spot), G, L, true);
    if (!inside) {
      let px = at(lay.spot), py = G - L(lift);
      if (act === 'hop') py -= L(9) * Math.abs(Math.sin((time - PET_RT.t0) * Math.PI * 2 / 0.8));
      if (act === 'bark') py -= L(3) * Math.abs(Math.sin((time - PET_RT.t0) * 9));
      if (act === 'wheel') { px = at(lay.wheel); py = G - L(2.2) - L(0.8) * Math.abs(Math.sin(time * 14)); }
      const s2 = popS * pk * (act === 'wheel' ? 0.62 / pk : 1);   // smaller inside the wheel
      ctx.save(); ctx.translate(px, py); ctx.scale(s2, s2); ctx.translate(-px, -py);
      drawPetV2(id, px, py, L, time * (act ? 1.8 : 1), { tuck: act === 'tuck', excited: !!act, noShadow: lift > 0 || act === 'wheel' });
      ctx.restore();
      const say = act === 'bark' ? t('petSayDog') : act === 'purr' ? t('petSayCat') : null;
      if (say) petBubble(px + L(4), py - L(40) * sc * pk, say, L);
      hit.pet = [px - L(18) * sc * pk, py - L(40) * sc * pk, px + L(18) * sc * pk, py + L(3)];
    }
    hit.bowl = drawBowl(id, at(lay.bowl), G, L, fed);
  }
  if (main) PET_HIT = Object.assign(PET_HIT || {}, hit);
}
// feeding — used by the bowl on the scene and by the button in the pet card
function feedPet(id) {
  const pd = petData(id), td = todayStr();
  if (pd.fed === td) { toast(t('fedToday')); return false; }
  if (!D.testMode && pointsSummary().bal < PET_FOOD) { toast(t('notEnough', { n: PET_FOOD - pointsSummary().bal })); return false; }
  pd.fed = td; pd.feeds++; if (!D.testMode) D.petSpent = petSpent() + PET_FOOD; save(); toast(t('fedToast')); renderRewards();
  return true;
}
// tap handling on the main canvas; returns true when the tap hit the pet, its house or its bowl
function petTap(tx, ty) {
  const id = equipNow().pet; if (!id || !PET_HIT) return false;
  const inR = r => r && tx >= r[0] && tx <= r[2] && ty >= r[1] && ty <= r[3];
  const redraw = () => { if (REDUCED && AV_STATE) drawAvatar(AV_STATE.w, AV_STATE.tone); };
  const inside = petInside(id);
  // the areas overlap a little (pet next to its house and bowl): the one whose centre is closest wins
  const near = r => Math.hypot(tx - (r[0] + r[2]) / 2, ty - (r[1] + r[3]) / 2);
  const cand = [['bowl', PET_HIT.bowl], ['pet', inside ? null : PET_HIT.pet], ['house', PET_HIT.house], ['wheel', PET_HIT.wheel]].filter(([, r]) => inR(r));
  if (!cand.length) return false;
  const what = cand.sort((a, b) => near(a[1]) - near(b[1]))[0][0];
  if (what === 'bowl') {
    if (feedPet(id)) { PET_HEART = 2.5; if (inside) { PET_RT.home = 'out'; PET_RT.homeUntil = Date.now() + 10 * 60 * 1000; PET_RT.pop = AV_T; } }
    redraw(); return true;
  }
  if (what === 'wheel') {   // the hamster's wheel: it comes out (if needed) and runs
    if (inside) { PET_RT.home = 'out'; PET_RT.homeUntil = Date.now() + 10 * 60 * 1000; }
    PET_RT.act = id; PET_RT.actName = 'wheel'; PET_RT.t0 = AV_T;
    if (REDUCED && AV_STATE) { redraw(); setTimeout(() => { PET_RT.act = null; redraw(); }, 2200); }
    return true;
  }
  if (what === 'pet') {
    if (PET_RT.act === id && PET_RT.actName === 'fly' && AV_T - PET_RT.t0 < ACT_DUR.fly) return true;   // let it finish the lap
    const now = Date.now(); PET_TAPS = PET_TAPS.filter(x => now - x < 2500).concat(now);
    PET_RT.actName = id === 'pet_parrot' && PET_TAPS.length >= 3 && !REDUCED ? 'fly' : PET_ACT[id][0];
    if (PET_RT.actName === 'fly') PET_TAPS = [];
    PET_RT.act = id; PET_RT.t0 = AV_T;
    if (REDUCED && AV_STATE) { redraw(); setTimeout(() => { PET_RT.act = null; redraw(); }, 2200); }
    return true;
  }
  {
    PET_RT.home = inside ? 'out' : 'in'; PET_RT.homeUntil = Date.now() + 10 * 60 * 1000; PET_RT.act = null;
    if (inside) PET_RT.pop = AV_T;
    redraw(); return true;
  }
  return false;
}

// wooden parrot stand: weighted base on the ground, pole, perch bar at `top`, a small seed cup
function drawParrotStand(sx, G, top, L) {
  const x = ctx, wood = (y0, y1) => { const g = x.createLinearGradient(sx - L(1), 0, sx + L(1), 0); g.addColorStop(0, '#8C6440'); g.addColorStop(1, '#5E3F25'); return g; };
  x.save();
  x.fillStyle = 'rgba(27,42,74,.16)'; x.beginPath(); x.ellipse(sx, G + 1, L(11), L(1.6), 0, 0, Math.PI * 2); x.fill();
  // base feet
  x.fillStyle = '#6E4C30'; x.beginPath(); x.roundRect(sx - L(8), G - L(2.2), L(16), L(2.2), L(1.1)); x.fill();
  // pole
  x.fillStyle = wood(); x.beginPath(); x.roundRect(sx - L(1.1), top, L(2.2), G - top - L(1.5), L(1)); x.fill();
  // perch bar with a darker underside
  const pg = x.createLinearGradient(0, top - L(1.2), 0, top + L(1.6)); pg.addColorStop(0, '#A57A52'); pg.addColorStop(1, '#6E4C30');
  x.fillStyle = pg; x.beginPath(); x.roundRect(sx - L(11), top - L(0.6), L(22), L(2.2), L(1.1)); x.fill();
  x.strokeStyle = 'rgba(60,35,15,.45)'; x.lineWidth = 1; x.stroke();
  x.restore();
}
function drawPetV2(id, px0, G, L, time, o) {
  o = o || {}; const onStand = !!o.stand;
  const x = ctx, mood = petMood(id), st = petStage(id), s = L(1) * PET_SCALE[st], happy = mood === 'happy' || !!o.excited;
  const squash = mood === 'sad' && !o.sleep, sad = mood === 'sad' || !!o.sleep;   // sad = eyes closed + z z
  const wag = sad ? 0 : Math.sin(time * (happy ? 9 : 4));
  const TAU = Math.PI * 2;
  x.save(); x.translate(px0, G); x.scale(s, s);
  // soft ground shadow (drawn before the sad "squash" so it stays flat)
  if (!onStand && !o.noShadow && !o.fly) { x.fillStyle = 'rgba(27,42,74,.16)'; x.beginPath(); x.ellipse(2, 0.6, id === 'pet_parrot' ? 15 : 17, 2.6, 0, 0, TAU); x.fill(); }
  if (onStand) x.scale(-1, 1);   // on the left stand it faces right, towards the twin
  if (squash) x.scale(1.06, 0.9);
  // helpers
  const shade = (cx, cy, r, light, dark) => { const g = x.createRadialGradient(cx - r * 0.4, cy - r * 0.5, r * 0.15, cx, cy, r * 1.15); g.addColorStop(0, light); g.addColorStop(1, dark); return g; };
  const ell = (cx, cy, rx, ry, rot, fill, line) => { x.beginPath(); x.ellipse(cx, cy, rx, ry, rot || 0, 0, TAU); x.fillStyle = fill; x.fill(); if (line) { x.strokeStyle = line; x.lineWidth = 0.8; x.stroke(); } };
  const blob = (fill, line) => { x.fillStyle = fill; x.fill(); if (line) { x.strokeStyle = line; x.lineWidth = 0.8; x.lineJoin = 'round'; x.stroke(); } };
  const leg = (lx, top, w, fill, line, paw) => { x.beginPath(); x.roundRect(lx, top, w, -top, w / 2); blob(fill, line); if (paw) ell(lx + w / 2 - 0.3, -0.9, w * 0.62, 1.3, 0, paw); };
  // glossy eye; sad → calm closed lid
  const eye = (ex, ey, r, iris) => {
    if (sad) { x.strokeStyle = '#2B2F3A'; x.lineWidth = 0.9; x.lineCap = 'round'; x.beginPath(); x.arc(ex, ey - r * 0.2, r, 0.25, Math.PI - 0.25); x.stroke(); return; }
    ell(ex, ey, r, r * 1.12, 0, iris || '#1E2230');
    if (iris) ell(ex, ey, r * 0.32, r * 0.95, 0, '#14161C');
    ell(ex - r * 0.35, ey - r * 0.42, r * 0.36, r * 0.36, 0, '#fff');
    ell(ex + r * 0.3, ey + r * 0.35, r * 0.15, r * 0.15, 0, 'rgba(255,255,255,.8)');
  };
  const blush = (bx, by, r) => ell(bx, by, r, r * 0.62, 0, 'rgba(255,120,130,.32)');
  const smile = (mx, my, w) => { if (sad) return; x.strokeStyle = 'rgba(40,30,30,.75)'; x.lineWidth = 0.7; x.lineCap = 'round'; x.beginPath(); x.arc(mx, my, w, 0.25, Math.PI - 0.25); x.stroke(); };

  if (id === 'pet_dog') {
    const base = '#D9A066', dark = '#A8713F', line = 'rgba(90,55,25,.45)', cream = '#F6E3C6';
    // tail
    x.lineCap = 'round'; x.strokeStyle = dark; x.lineWidth = 3.4; x.beginPath(); x.moveTo(13, -8); x.quadraticCurveTo(21, -12, 19 + wag * 3.5, -23 + Math.abs(wag)); x.stroke();
    x.strokeStyle = base; x.lineWidth = 2; x.stroke();
    // haunch + far leg
    leg(-1.2, -10.5, 3.6, dark, line);
    ell(9, -7.5, 8, 7.5, 0, shade(9, -7.5, 8, base, dark), line);
    ell(11.5, -1.2, 4.2, 1.6, 0, dark);
    // body (sitting, leaning forward)
    x.beginPath(); x.moveTo(-8, -9); x.bezierCurveTo(-9, -19, -4, -23, 3, -20); x.bezierCurveTo(12, -17, 15, -9, 12, -3); x.bezierCurveTo(6, 0, -6, 0, -8, -9); x.closePath();
    blob(shade(1, -12, 12, base, dark), line);
    ell(-4.5, -12.5, 3.8, 6, -0.15, cream);
    // near front leg
    leg(-7.6, -12, 4, shade(-6, -6, 6, base, dark), line, cream);
    // head
    ell(-8.5, -26, 8.2, 7.6, 0, shade(-8.5, -26, 8.2, '#E8B77F', base), line);
    ell(-14.2, -23.6, 5, 3.6, -0.1, cream, line);                 // muzzle
    ell(-18.4, -24.6, 1.9, 1.5, 0, '#2B2524'); ell(-18.9, -25.1, 0.6, 0.45, 0, 'rgba(255,255,255,.7)');   // nose
    if (happy) ell(-15, -20.6, 1.4, 1.9, 0, '#E86A7A');            // tongue
    smile(-15.5, -22.6, 1.6);
    eye(-11, -27.6, 1.55);
    // floppy ear
    x.beginPath(); x.moveTo(-6, -32); x.bezierCurveTo(-1, -33, 1, -27 + wag * 0.4, -1.5, -21.5); x.bezierCurveTo(-3.5, -20, -6, -24, -6.5, -28); x.closePath();
    blob(shade(-3, -27, 6, '#B47D4A', '#8E5A30'), line);
    blush(-10.5, -23.6, 1.6);
  } else if (id === 'pet_cat') {
    const base = '#9AA4B2', dark = '#6C7684', line = 'rgba(45,52,64,.45)', light = '#E3E7EE';
    // tail curling up behind
    x.lineCap = 'round'; x.strokeStyle = dark; x.lineWidth = 3.2; x.beginPath(); x.moveTo(12, -3); x.bezierCurveTo(22, -3, 22, -14, 18 + wag * 2.5, -22); x.stroke();
    x.strokeStyle = base; x.lineWidth = 1.9; x.stroke();
    leg(-0.6, -10, 3.4, dark, line);
    // body (pear, sitting)
    x.beginPath(); x.moveTo(-6, -15); x.bezierCurveTo(-8, -6, -6, 0, 4, 0); x.bezierCurveTo(14, 0, 15, -8, 11, -14); x.bezierCurveTo(7, -20, -3, -21, -6, -15); x.closePath();
    blob(shade(3, -10, 12, base, dark), line);
    ell(-2.6, -10.5, 3.6, 5.5, 0, light);
    // stripes on the back
    x.strokeStyle = 'rgba(70,78,92,.45)'; x.lineWidth = 1; x.lineCap = 'round';
    [[6, -16, 9, -12], [9, -13, 12, -9], [11, -9, 13, -5]].forEach(([a, b2, c, d]) => { x.beginPath(); x.moveTo(a, b2); x.lineTo(c, d); x.stroke(); });
    leg(-5.6, -10.5, 3.6, shade(-4, -5, 5, base, dark), line, light);
    // head + ears (shifted down so the head rests on the body)
    x.save(); x.translate(0.5, 3.5);
    [[-12.2, -31, -14, -38.5, -8, -34], [-5, -34.5, -1.8, -38.5, 0.2, -31]].forEach(([a, b2, c, d, e, f]) => {
      x.beginPath(); x.moveTo(a, b2); x.quadraticCurveTo(c, d, c, d); x.lineTo(e, f); x.closePath(); blob(base, line);
      x.beginPath(); x.moveTo(a + (e - a) * 0.25, b2 + (f - b2) * 0.25 - 0.3); x.lineTo(c + (e - c) * 0.12, d + 1.8); x.lineTo(e - (e - a) * 0.25, f - (f - b2) * 0.25 - 0.3); x.closePath(); x.fillStyle = '#F3B7C2'; x.fill();
    });
    ell(-6.4, -27, 8.6, 7.4, 0, shade(-6.4, -27, 8.6, '#B5BEC9', base), line);
    ell(-6.4, -24, 4.6, 2.9, 0, light);                            // muzzle
    x.strokeStyle = 'rgba(70,78,92,.45)'; x.lineWidth = 0.9; [-8, -5].forEach(sx => { x.beginPath(); x.moveTo(sx, -34); x.lineTo(sx + 0.6, -31.5); x.stroke(); });
    eye(-9.6, -27.8, 1.75, '#9BD06A'); eye(-3.4, -27.8, 1.75, '#9BD06A');
    x.beginPath(); x.moveTo(-7.4, -25.3); x.lineTo(-5.4, -25.3); x.lineTo(-6.4, -24.2); x.closePath(); x.fillStyle = '#E58A9A'; x.fill();
    if (!sad) { x.strokeStyle = 'rgba(40,30,30,.7)'; x.lineWidth = 0.6; x.beginPath(); x.arc(-7.2, -23.6, 0.8, 0.1, Math.PI - 0.3); x.arc(-5.6, -23.6, 0.8, 0.3, Math.PI - 0.1); x.stroke(); }
    x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 0.45;
    [[-10.5, -24.6, -17, -25.6], [-10.5, -23.8, -17, -22.8], [-2.3, -24.6, 4, -25.6], [-2.3, -23.8, 4, -22.8]].forEach(([a, b2, c, d]) => { x.beginPath(); x.moveTo(a, b2); x.lineTo(c, d); x.stroke(); });
    blush(-11.6, -24.6, 1.4); blush(-1.2, -24.6, 1.4);
    x.restore();
  } else if (id === 'pet_rabbit') {
    const base = '#F6F2EC', dark = '#D9CFC2', line = 'rgba(120,100,80,.38)', pink = '#F2B5BF';
    ell(15, -9.5, 3.6, 3.4, 0, shade(15, -9.5, 3.6, '#fff', dark), line);          // tail
    ell(4, -9.5, 12, 9.5, 0, shade(4, -10, 12, base, dark), line);                  // body
    ell(9, -6, 6.8, 6, 0, shade(9, -6, 6.8, base, dark), line);                     // haunch
    ell(3.5, -1.2, 6.2, 1.9, 0, dark, line);                                        // big foot
    ell(-6.2, -1.6, 2.8, 1.8, 0, base, line);                                       // front paw
    // ears (upright & wiggling when happy, folded back when sad)
    [[-9.6, -29, -0.12], [-4.6, -30, 0.18]].forEach(([ex2, ey2, r]) => {
      const rot = sad ? r + 1.25 * Math.sign(r || 1) : r + wag * 0.08;
      x.save(); x.translate(ex2, ey2); x.rotate(rot);
      ell(0, -7.5, 3, 8.5, 0, shade(0, -7, 8, '#fff', dark), line); ell(0, -7, 1.5, 6.2, 0, pink);
      x.restore();
    });
    ell(-7.4, -21.5, 7.4, 7, 0, shade(-7.4, -22, 7.4, '#fff', dark), line);       // head
    ell(-9.6, -18.8, 4.6, 3.4, 0, base);                                            // cheek
    eye(-10, -23, 1.7);
    ell(-14, -19.9, 1.1, 0.85, 0, '#E07F90');                                       // nose
    smile(-13.5, -18.6, 1.1);
    blush(-9.5, -19.5, 1.6);
  } else if (id === 'pet_hamster') {
    const base = '#EBA85F', dark = '#C27C3A', line = 'rgba(110,65,25,.45)', cream = '#FFF1DE';
    ell(-6.5, -1.4, 3, 1.6, 0, '#F1B6A8', line); ell(7.5, -1.4, 3, 1.6, 0, '#F1B6A8', line);   // feet
    ell(0.5, -10.5, 13, 10.5, 0, shade(0.5, -11, 13, '#F5BE7E', dark), line);                 // body
    ell(-0.5, -7.2, 8.4, 6.8, 0, cream);                                                       // belly
    [[-8.5, -19.5], [7.5, -19.5]].forEach(([ex2, ey2]) => { ell(ex2, ey2, 3.4, 3.2, 0, shade(ex2, ey2, 3.4, base, dark), line); ell(ex2, ey2 + 0.2, 1.8, 1.7, 0, '#F2B6C0'); });
    eye(-5, -13.5, 1.6); eye(3.2, -13.5, 1.6);
    ell(-0.9, -11, 1, 0.75, 0, '#D9707F');
    smile(-0.9, -10.2, 1);
    blush(-8.6, -10.2, 2); blush(6.8, -10.2, 2);
    // tiny front paws
    ell(-3, -5.6, 1.7, 1.3, 0, '#F1B6A8', line); ell(1.2, -5.6, 1.7, 1.3, 0, '#F1B6A8', line);
  } else if (id === 'pet_parrot') {
    const base = '#3CBF66', dark = '#1E8445', line = 'rgba(15,70,35,.45)';
    // own little perch (only when not sitting on the stand)
    if (!onStand && !o.fly) { x.beginPath(); x.roundRect(-15, -2.2, 31, 3, 1.5); blob(shade(0, -1, 16, '#9C7350', '#6E4C30'), 'rgba(60,35,15,.45)'); }
    // tail feathers
    [[4, -4, 9, 7, '#2F6FE0'], [1.5, -4, 5.5, 8, '#E5484D']].forEach(([tx, ty, ex2, ey2, col]) => {
      x.beginPath(); x.moveTo(tx - 1.6, ty); x.quadraticCurveTo(ex2 - 1, ey2 - 6, ex2, ey2); x.quadraticCurveTo(ex2 + 1.5, ey2 - 7, tx + 2.2, ty); x.closePath(); blob(col, 'rgba(0,0,0,.25)');
    });
    // body
    x.beginPath(); x.moveTo(-3, -24); x.bezierCurveTo(-11, -18, -8, -4, 0, -3); x.bezierCurveTo(7, -3, 9, -14, 4, -22); x.closePath();
    blob(shade(-1, -14, 11, '#5AD883', base), line);
    // wing with layered feathers
    x.save(); x.translate(3, -14); x.rotate(o.fly ? -1.1 + wag * 0.9 : 0.28 + wag * 0.06);
    ell(0, 0, 4.6, 8.6, 0, shade(0, -2, 8, base, dark), line);
    ell(0.6, 5.2, 3, 3.4, 0, '#2F6FE0'); ell(0, 2, 3.4, 3, 0, dark);
    x.restore();
    // feet gripping the perch (tucked in while flying)
    if (!o.fly) { ell(-2.5, -2.2, 1.8, 1.2, 0, '#8A8F98'); ell(1.5, -2.2, 1.8, 1.2, 0, '#8A8F98'); }
    // head
    ell(-3, -26.5, 6.8, 6.6, 0, shade(-3, -27, 6.8, '#5AD883', base), line);
    ell(-6.6, -24.6, 2.6, 2.1, 0, '#FFD84D');                                       // cheek patch
    ell(-4.3, -28.3, 2.6, 2.6, 0, '#fff', 'rgba(0,0,0,.18)');                       // eye ring
    eye(-4.5, -28.3, 1.35);
    // hooked beak
    x.beginPath(); x.moveTo(-8.6, -29.5); x.bezierCurveTo(-13.5, -29.5, -14, -24.5, -11.6, -22.6); x.bezierCurveTo(-11.4, -25, -10.2, -26, -8.4, -25.6); x.closePath(); blob('#F4C542', 'rgba(120,80,0,.5)');
    x.beginPath(); x.moveTo(-8.6, -25.4); x.quadraticCurveTo(-10.6, -24.6, -10.4, -23); x.lineTo(-8, -24); x.closePath(); blob('#C9962A');
  } else if (id === 'pet_turtle') {
    const skin = '#A9D38C', skinD = '#78AD5E', line = 'rgba(40,80,40,.45)';
    // legs + tail
    x.beginPath(); x.moveTo(13, -4); x.lineTo(17, -2.5); x.lineTo(13, -2); x.closePath(); blob(skinD, line);
    [[-9.5, skinD], [8, skinD], [-5, skin], [4, skin]].forEach(([lx, col]) => { x.beginPath(); x.roundRect(lx, -5, 4.2, 5, 1.8); blob(col, line); });
    // neck + head (stretching out when happy, tucked when sad)
    const out = o.tuck ? 10 : sad ? 4.5 : happy ? 0 : 1.5;   // tuck: head hidden under the shell
    x.beginPath(); x.moveTo(-9, -8); x.quadraticCurveTo(-14 + out, -9, -15 + out, -12); x.lineTo(-12 + out, -14.5); x.quadraticCurveTo(-9, -11, -7, -11); x.closePath(); blob(shade(-12, -11, 5, skin, skinD), line);
    ell(-17 + out, -13, 5, 4.2, -0.15, shade(-17 + out, -13.5, 5, '#BFE2A6', skin), line);
    eye(-18.2 + out, -14.2, 1.35);
    smile(-19.6 + out, -12.1, 1.2);
    blush(-16.2 + out, -12, 1.3);
    // shell: rim band, dome, scutes
    x.beginPath(); x.roundRect(-12.5, -6.2, 26, 3, 1.5); blob('#D8C27A', 'rgba(110,90,30,.45)');
    x.beginPath(); x.moveTo(-12, -5.5); x.bezierCurveTo(-11, -20, 13, -20, 13.5, -5.5); x.closePath();
    blob(shade(0, -12, 13, '#64B57E', '#2E6E45'), 'rgba(20,60,35,.55)');
    x.save(); x.clip();
    x.strokeStyle = 'rgba(200,235,190,.55)'; x.lineWidth = 0.9; x.lineJoin = 'round';
    x.beginPath(); x.moveTo(-3, -13.5); x.lineTo(4, -13.5); x.lineTo(6, -9.5); x.lineTo(4, -5.5); x.lineTo(-3, -5.5); x.lineTo(-5, -9.5); x.closePath(); x.stroke();
    [[-3, -13.5, -6, -18], [4, -13.5, 7, -18], [-5, -9.5, -12, -10], [6, -9.5, 14, -10]].forEach(([a, b2, c, d]) => { x.beginPath(); x.moveTo(a, b2); x.lineTo(c, d); x.stroke(); });
    x.restore();
  }
  x.restore();
  // sleep "z z" and hearts are drawn unsquashed, above the pet
  x.save(); x.translate(px0, G); x.scale(s, s);
  if (sad) { x.fillStyle = '#7D8794'; x.textAlign = 'center'; x.font = 'bold 8px system-ui'; x.fillText('z', 12, -32); x.font = 'bold 6px system-ui'; x.fillText('z', 17, -38); }
  if (PET_HEART > 0) { x.globalAlpha = Math.min(1, PET_HEART); x.font = '11px system-ui'; x.textAlign = 'center'; x.fillText('❤️', 0, -42 - (2.5 - PET_HEART) * 8); x.globalAlpha = 1; }
  else if (petData(id).treat === todayStr() && !sad) { x.font = '7px system-ui'; x.textAlign = 'center'; x.fillText('❤️', 9, -40 + Math.sin(time * 3) * 2); }
  x.restore();
}

// ================= v12: quick text logging with clarifying questions + voice input =================
// clarifiers for home-cooked dishes: m = meat, c = cooking, o = oil / fat
const DISH_Q = {
  borscht: 'mo', chicken_soup: 'o', veg_soup: 'mo', goulash: 'm', svickova: '', schnitzel: 'c', varenyky: 'c', pelmeni: 'c',
  syrnyky: 'co', pancakes: 'o', omelette: 'o', potato_fried: 'o', plov: 'mo', holubtsi: 'm', deruny: 'o', veg_salad: 'o',
  pasta_sauce: 'mo', cutlet: 'mc', porridge: 'o', mashed: 'o', potato_salad: '', kebab: '', burger: '', pizza: '', sandwich: '', oatmeal_milk: ''
};
const QOPT = {
  m: [['qmNone', 0.8], ['qmChicken', 1, 1], ['qmPork', 1.15], ['qmRibs', 1.35]],
  c: [['qcBoil', 1, 1], ['qcBake', 1.06], ['qcFry', 1.25]],
  o: [['qoLess', -25], ['qoUsual', 0, 1], ['qoMore', 130]],
  s: [['qsSmall', 0.7], ['qsNormal', 1, 1], ['qsLarge', 1.4]]
};
const QTITLE = { m: 'qMeat', c: 'qCook', o: 'qOil', s: 'qSize' };
// typical weight of one piece / slice / spoon for counted items
const PIECE = { egg: 55, varenyky: 40, pelmeni: 12, syrnyky: 60, pancakes: 50, cutlet: 120, banana: 120, apple: 180, orange: 200,
  sausage: 50, roll: 60, bread: 30, rye: 35, deruny: 70, holubtsi: 150, burger: 220, pizza: 110, sandwich: 150, biscuits: 12, tomato: 120, cucumber: 120, schnitzel: 150 };
Object.assign(PIECE, { toast: 25, wholegrain: 35, baguette: 30, crispbread: 10, crackers: 6, croissant: 60, bun_sweet: 80, donut: 70, kolac: 70, pie_savory: 80,
  pear: 170, plum: 40, peach: 150, apricot: 40, kiwi: 75, mandarin: 80, lemon: 60, persimmon: 170, avocado: 150, dates: 8, radish: 15, garlic: 5, olives: 4,
  candy: 12, choc_bar: 50, protein_bar: 50, curd_bar: 45, hotdog: 130, nuggets: 18, sushi: 25, wings: 50, oladky: 50, nalysnyky: 100, spekacky: 100, fried_cheese: 150 });
const NUMW = { 'один': 1, 'одна': 1, 'одне': 1, 'два': 2, 'дві': 2, 'три': 3, 'чотири': 4, "п'ять": 5, 'пять': 5, 'шість': 6, 'пів': 0.5, 'півтори': 1.5,
  'jeden': 1, 'jedna': 1, 'jedno': 1, 'dva': 2, 'dve': 2, 'tri': 3, 'ctyri': 4, 'pet': 5, 'pul': 0.5, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'half': 0.5, 'a': 1 };
const UNIT_RX = [
  [/^(кг|kg)$/, 'kg'], [/^(г|гр|грам\S*|g|gr|gramu?|grams?)$/, 'g'], [/^(мл|ml)$/, 'g'], [/^(л|l)$/, 'kg'],
  [/^(шт\S*|ks|kus\S*|pcs?|pieces?|x|×)$/, 'pc'], [/^(скиб\S*|шмат\S*|plat\S*|kraj\S*|slices?)$/, 'slice'],
  [/^(ложк\S*|ложок|lzic\S*|lzi?ce|tbsp|spoons?)$/, 'spoon'], [/^(тарілк\S*|тарілок|миск\S*|talir\S*|bowls?|plates?)$/, 'por'],
  [/^(порці\S*|porc\S*|portions?|servings?)$/, 'por'], [/^(склян\S*|чашк\S*|sklen\S*|hrnk\S*|glass\S*|cups?)$/, 'glass']
];
const stemsOf = w => { const out = [w]; for (let i = 1; i <= 3; i++) if (w.length - i >= (w.length <= 5 ? 3 : 4)) out.push(w.slice(0, w.length - i)); return out; };
const stemW = w => w.length > 5 ? w.slice(0, w.length - 1) : w;
// words that never identify a food on their own
const QL_STOP = new Set(['з', 'зі', 'із', 'та', 'і', 'й', 'на', 'в', 'у', 'до', 'по', 'для', 'без', 'трохи', 'ще', 's', 'se', 'a', 'na', 'v', 've', 'do', 'bez', 'with', 'and', 'of', 'the', 'some', 'little', 'bit']);
const startsName = k => FDB.find(f => fold(f.n[LI()]).startsWith(k)) || FDB.find(f => f.n.some(n => fold(n).startsWith(k)));
function findFood(q) {
  const k = fold(q).replace(/[^\p{L}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (!k) return null;
  const own = (D.dishes || []).find(d => { const n = fold(d.n); return n.includes(k) || k.includes(n) || n.includes(stemW(k)); });
  if (own) return { dish: own };
  // the whole phrase is the start of a food name («кава з молоком», «вареники з картоплею»)
  const whole = startsName(k); if (whole) return { food: whole };
  const words = k.split(' ').filter(w => w.length > 2 && !QL_STOP.has(w));
  if (!words.length) return null;
  let best = null;
  for (const f of FDB) {
    const names = f.n.map(fold), hay = names.concat((f.al || []).map(fold)).join(' | ');
    const toks = hay.split(/[\s|/(),]+/);
    let hits = 0, last = -1, strength = 0;
    words.forEach((w, i) => {
      const st = stemsOf(w).find(x => hay.includes(x)); if (!st) return;
      hits++; last = i;
      // the food's own name starting with the word counts most (масло → «Масло вершкове», not «Каша з маслом»);
      // then a whole-word match (хліб → «Хліб білий», not «Хлібці»); stem length only breaks ties
      strength += (names[LI()].startsWith(st) ? 3 : names.some(n => n.startsWith(st)) ? 2.5 : 0) + (toks.includes(st) || toks.includes(w) ? 2 : 0) + st.length / 10;
    });
    if (!hits) continue;
    const c = { f, hits, last, strength };
    if (!best || c.hits > best.hits || (c.hits === best.hits && (c.last > best.last || (c.last === best.last && c.strength > best.strength)))) best = c;   // full tie: the earlier, more basic food wins
  }
  return best ? { food: best.f } : null;
}
// "хліб з маслом" → two foods; "вареники з картоплею" stays one dish because the whole phrase is a food name
function splitWith(raw) {
  const m = raw.match(/^(.*\S)\s+(?:з|зі|із|with|s|se)\s+(\S.*)$/i);
  if (!m) return null;
  const whole = parseItem(raw).q; if (whole && startsName(whole)) return null;
  const a = parseItem(m[1]), b = parseItem(m[2]);
  return findFood(a.q || m[1]) && findFood(b.q || m[2]) ? [m[1], m[2]] : null;
}
function parseItem(raw) {
  let words = fold(raw).replace(/(\d)([^\d\s.,])/g, '$1 $2').split(/\s+/).filter(Boolean), qty = null, unit = null;
  const rest = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (qty == null && /^\d+([.,]\d+)?$/.test(w)) { qty = parseFloat(w.replace(',', '.')); continue; }
    if (qty == null && NUMW[w] != null && (w !== 'a' || i === 0)) { qty = NUMW[w]; continue; }
    const u = UNIT_RX.find(([rx]) => rx.test(w));
    if (u && !unit) { unit = u[1]; continue; }
    rest.push(w);
  }
  if (qty != null && qty >= 20 && !unit) unit = 'g';   // "борщ 400" means grams
  return { q: rest.join(' '), qty, unit, raw: raw.trim() };
}
function gramsFor(it, por, pieceId) {
  const n = it.qty == null ? 1 : it.qty;
  if (it.unit === 'g') return n;
  if (it.unit === 'kg') return n * 1000;
  if (it.unit === 'spoon') return n * 15;
  if (it.unit === 'glass') return n * 250;
  if (it.unit === 'slice') return n * (PIECE[pieceId] && PIECE[pieceId] < 60 ? PIECE[pieceId] : 30);
  if (it.unit === 'pc' || (it.qty != null && !it.unit)) return n * (PIECE[pieceId] || por);
  return n * por;
}
let QL = [];   // parsed quick-log items
function qlEstimate(x) {
  // returns { k, lo, hi, p, f, c } for current answers
  const base = x.k100 * x.g / 100, scaleG = x.g / (x.por || x.g);
  const calc = pick => {
    let k = base, add = 0;
    for (const key of x.qs) {
      const opts = QOPT[key], o = pick(key, opts);
      if (key === 'o') add += o[1] * scaleG; else if (key === 's') { if (x.ans.s == null) k *= o[1]; } else k *= o[1];
    }
    return Math.max(0, k + add);
  };
  const cur = calc((key, opts) => opts[x.ans[key] != null ? x.ans[key] : opts.findIndex(o => o[2])]);
  const lo = calc((key, opts) => x.ans[key] != null ? opts[x.ans[key]] : opts.reduce((a, o) => o[1] < a[1] ? o : a));
  const hi = calc((key, opts) => x.ans[key] != null ? opts[x.ans[key]] : opts.reduce((a, o) => o[1] > a[1] ? o : a));
  const r = base ? cur / base : 1;
  return { k: cur, lo, hi, p: x.p100 * x.g / 100 * Math.min(r, 1.3), f: x.f100 * x.g / 100 * r, c: x.c100 * x.g / 100 };
}
async function qlParse() {
  const text = $('qlText').value.trim();
  if (!text) return toast(t('qlEmpty'));
  LBL = null;
  const parts = text.split(/\s*(?:,|;|\+|\n|\s+і\s+|\s+та\s+|\s+й\s+|\s+а також\s+|\s+and\s+|\s+a\s+|\s+plus\s+)\s*/i).filter(p => p && p.trim().length > 1);
  QL = []; const unknown = [];
  const items = parts.flatMap(p => splitWith(p) || [p]);
  for (const raw of items.slice(0, 10)) {
    const it = parseItem(raw), m = findFood(it.q || raw);
    if (m && m.dish) {
      const d0 = m.dish, por = d0.g || 300;
      let g = it.unit === 'g' || it.unit === 'kg' ? gramsFor(it, por) : (it.qty || 1) * por;
      QL.push({ name: d0.n, src: 'own', g: Math.round(g), por, k100: d0.k / por * 100, p100: d0.p / por * 100, f100: d0.f / por * 100, c100: d0.c / por * 100, qs: [], ans: {}, dishId: d0.id });
    } else if (m && m.food) {
      const f = m.food, q = DISH_Q[f.id], dish = q != null;
      const g = gramsFor(it, f.por, f.id), qs = dish ? q.split('').filter(Boolean) : [];
      if (dish && it.qty == null && !it.unit) qs.push('s');
      QL.push({ name: f.n[LI()], src: dish ? 'typical' : 'db', id: f.id, g: Math.round(g), por: f.por, k100: f.k, p100: f.p, f100: f.f, c100: f.c, qs, ans: {} });
    } else unknown.push(it);
  }
  if (unknown.length && SAMPLE) {
    $('qlOut').innerHTML = `<p class="muted">${t('qlThinking')}</p>`;
    try {
      const prompt = `Estimate typical nutrition for these foods as home-cooked in Central/Eastern Europe. Reply ONLY JSON array, one object per food, same order: {"name": short name in ${({ uk: 'Ukrainian', cs: 'Czech', en: 'English' })[LANG]}, "kcal100": kcal per 100 g, "p": protein g/100g, "f": fat g/100g, "c": carbs g/100g, "portion": typical portion grams, "piece": grams of one piece or 0, "meat": true if the recipe can be made with different meats, "fried": true if it can be boiled/baked or fried, "oil": true if amount of oil/butter varies}. Foods: ${JSON.stringify(unknown.map(u => u.raw))}`;
      const res = await SAMPLE([{ role: 'user', content: prompt }], { modelTier: 'quick', cache: false });
      const arr = JSON.parse(((res && res.text) || '').replace(/^[^[]*/, '').replace(/[^\]]*$/, ''));
      unknown.splice(0).forEach((it, i) => {
        const a = arr[i]; if (!a || !(a.kcal100 > 0)) { unknown.push(it); return; }
        const por = clamp(+a.portion || 250, 20, 800), piece = +a.piece || 0;
        const g = it.unit === 'pc' || (it.qty != null && !it.unit) ? (it.qty || 1) * (piece || por) : gramsFor(it, por);
        const qs = [a.meat && 'm', a.fried && 'c', a.oil && 'o'].filter(Boolean); if (it.qty == null && !it.unit) qs.push('s');
        QL.push({ name: String(a.name || it.q).slice(0, 50), src: 'ai', g: Math.round(g), por, k100: clamp(+a.kcal100, 5, 900), p100: +a.p || 0, f100: +a.f || 0, c100: +a.c || 0, qs, ans: {} });
      });
    } catch (e) { /* keep unknown list */ }
  }
  QL.unknown = unknown.map(u => u.raw);
  renderQL();
}
function renderQL() {
  const out = $('qlOut');
  if (!QL.length && !(QL.unknown || []).length) { out.innerHTML = ''; return; }
  const SRC = { own: 'qlSrcOwn', db: 'qlSrcDb', typical: 'qlSrcTyp', ai: 'qlSrcAi' };
  let tot = 0, tlo = 0, thi = 0;
  out.innerHTML = QL.map((x, i) => {
    const e = qlEstimate(x); tot += e.k; tlo += e.lo; thi += e.hi;
    const approx = x.qs.length && Math.round(e.hi - e.lo) > 15;
    return `<div class="qlItem"><div class="qlTop"><b>${esc(x.name)}</b><button data-qlx="${i}" aria-label="×">×</button></div>
      <div class="qlSrc ${x.src}">${t(SRC[x.src])}</div>
      <div class="qlG"><input type="number" inputmode="numeric" data-qlg="${i}" value="${x.g}"><em>${t('gU')}</em><span class="qlK">${approx ? '≈ ' : ''}${Math.round(e.k)} ${t('kcal')}${approx ? ` <em>(${Math.round(e.lo)}–${Math.round(e.hi)})</em>` : ''}</span></div>
      ${x.qs.map(key => `<div class="qlQ"><span>${t(QTITLE[key])}</span><div class="chips">${QOPT[key].map((o, j) => `<button class="chip${x.ans[key] === j ? ' on' : x.ans[key] == null && o[2] ? ' def' : ''}" data-qli="${i}" data-qlk="${key}" data-qlj="${j}">${t(o[0])}</button>`).join('')}</div></div>`).join('')}
    </div>`;
  }).join('') +
    ((QL.unknown || []).length ? `<p class="muted qlUnk">${t('qlUnknown', { n: QL.unknown.map(esc).join(', ') })}</p>` : '') +
    (QL.length ? `<p class="qlSum">${t('qlTotal')}: <b>${Math.round(tot)} ${t('kcal')}</b>${Math.round(thi - tlo) > 15 ? ` <em>(${Math.round(tlo)}–${Math.round(thi)})</em>` : ''}</p>
      <label>${t('mealW')}</label><select id="qlMeal">${MEALS.map(m => `<option value="${m}"${m === defaultMeal() ? ' selected' : ''}>${t(MEAL_KEY[m])}</option>`).join('')}</select>
      <button class="btn" id="qlAdd">${t('qlAdd')}</button>` : '');
  const add = $('qlAdd'); if (add) add.addEventListener('click', qlCommit);
}
function qlCommit() {
  const meal = $('qlMeal').value, rough = [];
  QL.forEach(x => {
    const e = qlEstimate(x), approx = x.qs.length && Math.round(e.hi - e.lo) > 15;
    const unanswered = x.qs.some(k => x.ans[k] == null);
    addFood(x.name, e.k, { p: e.p, f: e.f, c: e.c, g: x.g, meal, src: { own: 'dish', db: 'db' }[x.src] || 'approx', id: x.id, approx: approx && unanswered ? [Math.round(e.lo), Math.round(e.hi)] : null });
    if (x.src === 'typical' || x.src === 'ai') rough.push(x.name);
  });
  QL = []; $('qlText').value = ''; renderQL();
  if (rough.length) {
    $('qlOut').innerHTML = `<div class="qlSave"><p>${t('qlSaveHint', { n: esc(rough[0]) })}</p><button class="btn ghost" id="qlMake">${t('qlMake')}</button></div>`;
    $('qlMake').addEventListener('click', () => { sheetMeal = meal; openBuilder(null); BLD.n = rough[0]; renderBuilder(); $('qlOut').innerHTML = ''; });
  }
}
$('qlGo').addEventListener('click', qlParse);
$('qlText').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); qlParse(); } });
$('qlOut').addEventListener('click', e => {
  const c = e.target.closest('[data-qlk]');
  if (c) {
    const x = QL[+c.dataset.qli], k = c.dataset.qlk, j = +c.dataset.qlj;
    if (x.ans[k] === j) delete x.ans[k]; else x.ans[k] = j;
    if (k === 's') x.g = Math.round(x.por * (x.ans.s != null ? QOPT.s[x.ans.s][1] : 1));
    renderQL(); return;
  }
  const r = e.target.closest('[data-qlx]'); if (r) { QL.splice(+r.dataset.qlx, 1); renderQL(); }
});
$('qlOut').addEventListener('change', e => { const i = e.target.dataset.qlg; if (i == null) return; const x = QL[+i]; x.g = clamp(num(e.target.value) || 0, 0, 3000); x.qs = x.qs.filter(k => k !== 's'); delete x.ans.s; renderQL(); });

// ---- voice input (Web Speech API); the phone keyboard mic works everywhere as a fallback ----
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let MIC = null, DICT = null, DICT_ON = null;
(async () => { try { if (AI_ON && window.claude && typeof claude.use === 'function') DICT = await claude.use('dictation'); } catch (e) { DICT = null; }
  if (DICT) {
    DICT.onPartial(({ text }) => { if (DICT_ON) { DICT_ON.el.value = DICT_ON.base + DICT_ON.fin + text; DICT_ON.el.dispatchEvent(new Event('input', { bubbles: true })); } });
    DICT.onFinal(({ text }) => { if (DICT_ON) { DICT_ON.fin += text + ' '; DICT_ON.el.value = DICT_ON.base + DICT_ON.fin; DICT_ON.el.dispatchEvent(new Event('input', { bubbles: true })); } });
    DICT.onState(({ state }) => { if (state === 'idle' && DICT_ON) { DICT_ON.btn.classList.remove('on'); DICT_ON = null; } });
  } })();
function micButton(targetId, onDone) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'micBtn'; b.textContent = '🎤'; b.setAttribute('aria-label', t('micLabel'));
  b.addEventListener('click', () => {
    if (DICT) {
      if (DICT_ON) { DICT.stop().catch(() => {}); return; }
      const el = $(targetId); if (!el) return;
      DICT_ON = { el, btn: b, base: el.value ? el.value.replace(/\s+$/, '') + ' ' : '', fin: '' };
      b.classList.add('on');
      DICT.start().then(() => toast(t('micListen'))).catch(e => { b.classList.remove('on'); DICT_ON = null; toast(e && e.code === 'not_granted' ? t('micDenied') : t('micNo')); });
      return;
    }
    if (!SR) return toast(t('micNo'));
    if (MIC) { try { MIC.stop(); } catch (e) {} return; }
    const el = $(targetId); if (!el) return;
    const r = new SR(); MIC = r;
    r.lang = VOICE_LANG[LANG]; r.interimResults = true; r.continuous = false;
    const before = el.value ? el.value.replace(/\s+$/, '') + ' ' : '';
    b.classList.add('on'); toast(t('micListen'));
    r.onresult = ev => { let txt = ''; for (const res of ev.results) txt += res[0].transcript; el.value = before + txt; el.dispatchEvent(new Event('input', { bubbles: true })); };
    r.onerror = ev => { toast(ev.error === 'not-allowed' || ev.error === 'service-not-allowed' ? t('micDenied') : ev.error === 'no-speech' ? t('micNoSpeech') : t('micNo')); };
    r.onend = () => { MIC = null; b.classList.remove('on'); if (onDone && el.value.trim()) onDone(); };
    try { r.start(); } catch (e) { MIC = null; b.classList.remove('on'); toast(t('micDenied')); }
  });
  return b;
}
$('qlMicSlot').appendChild(micButton('qlText'));
$('fridgeMicSlot').appendChild(micButton('fridgeText'));
{ const ci = document.querySelector('.chatIn'); if (ci) ci.insertBefore(micButton('chatText'), $('chatSend')); }

// ================= v13: nutrition label photo → own products =================
// own products live in D.myFoods and join the food database (search, quick log, dish builder)
function loadMyFoods() {
  (D.myFoods || []).forEach(m => { if (!FDB.some(f => f.id === m.id)) FDB.push({ id: m.id, n: [m.n, m.n, m.n], k: m.k, p: m.p, f: m.f, c: m.c, por: m.por || 100, mine: true }); });
}
let LBL = null;
async function shrinkImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return await new Promise(res => c.toBlob(res, 'image/jpeg', 0.85));
  } finally { URL.revokeObjectURL(url); }
}
async function labelFromPhoto(file) {
  LBL = { n: '', k: '', p: '', f: '', c: '', g: 100, por: 0, pack: 0, note: t('lblReading'), busy: true };
  renderLabel();
  let canRead = false;
  try { canRead = !!(SAMPLE && SAMPLE.limits && (await SAMPLE.limits()).images); } catch (e) { canRead = false; }
  if (!canRead) { Object.assign(LBL, { busy: false, note: t('lblManual') }); return renderLabel(); }
  try {
    const blob = await shrinkImage(file);
    const prompt = `This is a photo of a food package nutrition label. Read it carefully. Reply ONLY with JSON:
{"readable": true/false, "name": product name if visible else "", "kcal100": energy in kcal per 100 g or 100 ml (if only kJ is shown, divide by 4.184), "p100": protein g per 100 g, "f100": fat g per 100 g, "c100": carbohydrates g per 100 g, "portionG": grams per serving if stated else 0, "packageG": net weight of the package in g or ml if visible else 0}
If the label only gives values per serving, convert them to per 100 g using the serving size. Use numbers, not strings. Do not guess values you cannot see — use null.`;
    const res = await SAMPLE([{ role: 'user', content: prompt }], { images: [blob], modelTier: 'default', cache: false });
    const v = JSON.parse(((res && res.text) || '').replace(/^[^{]*/, '').replace(/[^}]*$/, ''));
    const n = x => (typeof x === 'number' && isFinite(x) && x >= 0) ? Math.round(x * 10) / 10 : '';
    if (!v || v.readable === false || n(v.kcal100) === '') { Object.assign(LBL, { busy: false, note: t('lblUnreadable') }); return renderLabel(); }
    Object.assign(LBL, { busy: false, n: String(v.name || '').slice(0, 50), k: n(v.kcal100), p: n(v.p100), f: n(v.f100), c: n(v.c100),
      por: +v.portionG > 0 ? Math.round(v.portionG) : 0, pack: +v.packageG > 0 ? Math.round(v.packageG) : 0, note: t('lblCheck'), ai: true });
    LBL.g = LBL.por || 100;
  } catch (e) {
    Object.assign(LBL, { busy: false, note: e && e.code === 'not_granted' ? t('lblManual') : t('lblUnreadable') });
  }
  renderLabel();
}
function labelTotals() {
  const g = +LBL.g || 0, k = +LBL.k || 0, p = +LBL.p || 0, f = +LBL.f || 0, c = +LBL.c || 0;
  const est = 4 * p + 4 * c + 9 * f, odd = k > 20 && est > 0 && Math.abs(est - k) / k > 0.25;
  return { k: k * g / 100, p: p * g / 100, f: f * g / 100, c: c * g / 100, odd };
}
function renderLabel() {
  const out = $('qlOut');
  if (!LBL) { out.innerHTML = ''; return; }
  if (LBL.busy) { out.innerHTML = `<div class="qlItem"><p class="muted" style="margin:0">📷 ${t('lblReading')}</p></div>`; return; }
  const tt = labelTotals(), chips = [[100, '100 ' + t('gU')]];
  if (LBL.por) chips.push([LBL.por, t('lblPortion') + ' · ' + LBL.por + ' ' + t('gU')]);
  if (LBL.pack) chips.push([LBL.pack, t('lblPack') + ' · ' + LBL.pack + ' ' + t('gU')]);
  out.innerHTML = `<div class="qlItem lbl">
    <div class="qlTop"><b>📷 ${t('lblTitle')}</b><button id="lblX" aria-label="×">×</button></div>
    <p class="qlSrc ${LBL.ai ? 'typical' : ''}" style="margin:2px 0 8px">${esc(LBL.note || '')}</p>
    <label>${t('lblName')}</label><input id="lblN" value="${esc(LBL.n)}" placeholder="${t('lblNamePh')}">
    <label>${t('lblPer100')}</label>
    <div class="lblGrid">
      <div><span>${t('kcal')}</span><input id="lblK" type="number" inputmode="decimal" value="${LBL.k}"></div>
      <div><span>${t('prot')}</span><input id="lblP" type="number" inputmode="decimal" value="${LBL.p}"></div>
      <div><span>${t('fat')}</span><input id="lblF" type="number" inputmode="decimal" value="${LBL.f}"></div>
      <div><span>${t('carb')}</span><input id="lblC" type="number" inputmode="decimal" value="${LBL.c}"></div>
    </div>
    ${tt.odd ? `<p class="lblWarn">⚠️ ${t('lblOdd')}</p>` : ''}
    <label>${t('lblAte')}</label>
    <div class="qlG"><input id="lblG" type="number" inputmode="numeric" value="${LBL.g}"><em>${t('gU')}</em><span class="qlK" id="lblTot">${Math.round(tt.k)} ${t('kcal')}</span></div>
    <div class="chips" style="margin-top:6px">${chips.map(([g, l]) => `<button class="chip${+LBL.g === g ? ' on' : ''}" data-lblg="${g}">${esc(l)}</button>`).join('')}</div>
    <label class="lblSave"><input type="checkbox" id="lblSave" checked> ${t('lblSave')}</label>
    <label>${t('mealW')}</label><select id="lblMeal">${MEALS.map(m => `<option value="${m}"${m === defaultMeal() ? ' selected' : ''}>${t(MEAL_KEY[m])}</option>`).join('')}</select>
    <button class="btn" id="lblAdd">${t('add')}</button>
  </div>`;
  const sync = () => {
    LBL.n = $('lblN').value; ['k', 'p', 'f', 'c', 'g'].forEach(k => LBL[k] = $('lbl' + k.toUpperCase()).value);
    const t2 = labelTotals(); $('lblTot').textContent = Math.round(t2.k) + ' ' + t('kcal');
  };
  out.querySelectorAll('input:not([type=checkbox])').forEach(i => i.addEventListener('input', sync));
  out.querySelectorAll('input[type=number]').forEach(i => i.addEventListener('change', () => { sync(); renderLabel(); }));
  out.querySelectorAll('[data-lblg]').forEach(b => b.addEventListener('click', () => { sync(); LBL.g = +b.dataset.lblg; renderLabel(); }));
  $('lblX').addEventListener('click', () => { LBL = null; renderLabel(); });
  $('lblAdd').addEventListener('click', () => {
    sync();
    const k = +LBL.k, g = +LBL.g, name = LBL.n.trim().slice(0, 50) || t('food');
    if (!(k > 0 && k <= 950)) return toast(t('lblNeedK'));
    if (!(g > 0 && g <= 3000)) return toast(t('grams') + '?');
    let id = null;
    if ($('lblSave').checked) {
      D.myFoods = D.myFoods || [];
      const old = D.myFoods.find(m => fold(m.n) === fold(name));
      const rec = { id: old ? old.id : 'my_' + Date.now(), n: name, k: +k, p: +LBL.p || 0, f: +LBL.f || 0, c: +LBL.c || 0, por: LBL.por || g };
      if (old) Object.assign(old, rec); else D.myFoods.unshift(rec);
      const fi = FDB.findIndex(f => f.id === rec.id); if (fi >= 0) FDB.splice(fi, 1);
      loadMyFoods(); id = rec.id;
      D.recent = [id, ...(D.recent || []).filter(x => x !== id)].slice(0, 12);
    }
    const tt2 = labelTotals();
    addFood(name, tt2.k, { p: tt2.p, f: tt2.f, c: tt2.c, g, meal: $('lblMeal').value, src: 'label', id });
    LBL = null; renderLabel();
    if (id) toast(t('lblSaved', { n: name }));
  });
}
// the native <label for=file> opens the picker; if the frame blocks it, nothing blurs the page — then show a tip
let lblPick = 0;
$('lblFile').addEventListener('click', e => { if (!AI_ON) { e.preventDefault(); QL = []; labelFromPhoto(null); return; }
  e.target.value = ''; lblPick = Date.now(); const t0 = lblPick;
  setTimeout(() => { if (lblPick === t0) { $('lblTip').textContent = t('lblBlocked'); $('lblTip').style.display = ''; } }, 1600); });
window.addEventListener('blur', () => { if (Date.now() - lblPick < 1500) lblPick = -1; });
document.addEventListener('visibilitychange', () => { if (document.hidden && Date.now() - lblPick < 1500) lblPick = -1; });
$('lblFile').addEventListener('change', e => { lblPick = -1; $('lblTip').style.display = 'none'; const f = e.target.files && e.target.files[0]; if (f) { QL = []; labelFromPhoto(f); } });
loadMyFoods();

// ================= v15: progress report for a trainer + trainer mode =================
// A person makes a report file on purpose (their consent); the trainer opens it. No server: the file is the bridge.
let SHARE_DAYS = 30;
function offerFile(name, txt, done) {
  const fallback = () => {
    try {
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = name;
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); done && done();
    } catch (e) { toast(t('tCopyFail')); }
  };
  if (typeof DL !== 'undefined' && DL) DL.save({ filename: name, data: txt }).then(() => done && done()).catch(e => { if (!(e && /declin|cancel|dismiss/.test(e.code || ''))) fallback(); });
  else fallback();
}
function buildReport(days, withFood) {
  const td = todayStr(), from = addDays(td, -(days - 1)), p = P(), wNow = weightAt(td), ct = calTarget(wNow);
  D.cid = D.cid || 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const out = { kind: 'dvijnyk-report', v: 1, cid: D.cid, made: td, from, to: td,
    profile: (({ name, sex, age, height, weight, startDate, targetW, skin, hair, hairStyle, beard, glasses, shirt, shirtStyle, pants, eyes, shape, job, sporty }) =>
      ({ name, sex, age, height, weight, startDate, targetW, skin, hair, hairStyle, beard, glasses, shirt, shirtStyle, pants, eyes, shape, job, sporty }))(p),
    goal: ct.g, tg: ct.tg, pt: protTarget(wNow, ct.g), wNow: r1(wNow), tone: Math.round(toneAt(td)), eq: (D.shop && D.shop.eq) || {},
    lvl: levelOf(pointsSummary().earned).L, ach: (D.ach || []).length,
    meas: D.meas.filter(m => m.date >= addDays(from, -60)).map(m => Object.assign({}, m)),
    model: ser().filter(x => x.d >= from).map(x => [x.d, r1(x.w)]), days: {} };
  for (let s = from; s <= td; s = addDays(s, 1)) {
    const d = peekDay(s); if (!d.foods.length && !d.acts.length && !d.steps && !d.water) continue;
    const tt = dayTotals(s, weightAt(s));
    const r = { e: Math.round(tt.eaten), p: Math.round(tt.p), f: Math.round(tt.f), c: Math.round(tt.c), ex: Math.round(tt.ex), st: d.steps || 0, wa: d.water || 0,
      ok: tt.complete ? 1 : 0, acts: d.acts.map(a => [a.id, a.min || 0, Math.round(a.k || 0)]) };
    if (withFood) r.foods = d.foods.map(f => [f.n, Math.round(f.k), f.meal || 'snack', f.g || 0]);
    out.days[s] = r;
  }
  return out;
}
function renderShare() {
  const box = $('shareBox'); if (!box || !P()) return;
  box.querySelectorAll('[data-sd]').forEach(b => b.classList.toggle('on', +b.dataset.sd === SHARE_DAYS));
  $('shareLast').textContent = D.lastShare ? t('shareLastW', { d: fmtDate(D.lastShare) }) : '';
}
function shareMake(asText) {
  const rep = buildReport(SHARE_DAYS, $('shareFood').checked), txt = JSON.stringify(rep);
  const nm = (rep.profile.name || 'client').replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 20);
  const done = () => { D.lastShare = todayStr(); save(); renderShare(); toast(t('shareDone')); };
  if (asText) {
    $('shareText').value = txt; $('shareText').style.display = '';
    try { navigator.clipboard.writeText(txt).then(done, () => { $('shareText').select(); toast(t('tCopyFail')); }); } catch (e) { $('shareText').select(); }
  } else offerFile(`dvijnyk-report-${nm}-${rep.made}.json`, txt, done);
}

// ---- trainer side ----
let CLIENT_OPEN = null;
function importReport(txt) {
  let r; try { r = JSON.parse(txt); } catch (e) { r = null; }
  if (!r || r.kind !== 'dvijnyk-report' || !r.profile || !r.profile.height) return toast(t('repBad'));
  D.clients = D.clients || [];
  const old = D.clients.find(c => c.cid === r.cid);
  if (old) { old.rep = r; old.imported = todayStr(); } else D.clients.unshift({ cid: r.cid, rep: r, note: '', imported: todayStr() });
  save(); renderClients(); toast(t('repOk', { n: r.profile.name || '?' })); openClient(r.cid);
}
function renderClients() {
  const el = $('clientList'); if (!el) return;
  const cs = D.clients || [];
  el.innerHTML = cs.length ? cs.map(c => {
    const r = c.rep, ws = r.model.map(x => x[1]), dw = ws.length > 1 ? ws[ws.length - 1] - ws[0] : 0;
    return `<div class="res" data-cl="${esc(c.cid)}"><span>${esc(r.profile.name || '—')}<br><em>${t('repFrom', { d: fmtDate(r.made) })} · ${r.wNow} ${t('kg')}${ws.length > 1 ? ` (${signed(r1(dw), 1)})` : ''}</em></span><b>›</b></div>`;
  }).join('') : `<p class="muted">${t('noClients')}</p>`;
}
function clientStats(r) {
  const ds = Object.entries(r.days).sort((a, b) => a[0] < b[0] ? -1 : 1), full = ds.filter(([, d]) => d.ok);
  const avg = (arr, k) => arr.length ? arr.reduce((a, [, d]) => a + (d[k] || 0), 0) / arr.length : 0;
  const stepDays = ds.filter(([, d]) => d.st > 0), waterDays = ds.filter(([, d]) => d.wa > 0);
  let woN = 0, woMin = 0, actMin = 0;
  ds.forEach(([, d]) => d.acts.forEach(([id, min]) => { actMin += min; if (id === 'homeworkout' || id === 'gym') { woN++; woMin += min; } }));
  const mw = r.meas.filter(m => m.weight && m.date >= r.from).sort((a, b) => a.date < b.date ? -1 : 1);
  const mwa = r.meas.filter(m => m.waist).sort((a, b) => a.date < b.date ? -1 : 1);
  const span = diffDays(r.from, r.to) + 1;
  return { ds, full, span, eat: avg(full, 'e'), prot: avg(full, 'p'), steps: avg(stepDays, 'st'), water: avg(waterDays, 'wa'), woN, woMin, actMin,
    wFirst: mw[0], wLast: mw[mw.length - 1], waistFirst: mwa[0], waistLast: mwa[mwa.length - 1] };
}
function drawClientAvatar(r, canvas) {
  const keep = { D, SER, CAL, AVC };
  try {
    D = { profile: Object.assign({}, r.profile), days: {}, meas: r.meas, shop: { owned: [], eq: r.eq || {} }, pets: {}, lang: LANG };
    SER = null; CAL = null; AVC = null; AV_TARGET = canvas;
    drawAvatar(r.wNow, r.tone);
  } catch (e) { /* keep the rest of the view */ }
  finally { AV_TARGET = null; D = keep.D; SER = keep.SER; CAL = keep.CAL; AVC = keep.AVC; }
}
function drawClientChart(r, c) {
  const [w, h] = sizeCanvas(c), x = c.getContext('2d'); x.clearRect(0, 0, w, h);
  const a = r.model; if (a.length < 2) { x.fillStyle = '#6b7078'; x.font = '13px system-ui'; x.textAlign = 'center'; x.fillText(t('few'), w / 2, h / 2); return; }
  const real = r.meas.filter(m => m.weight && m.date >= r.from && m.date <= r.to);
  const ws = a.map(p => p[1]).concat(real.map(m => m.weight), r.profile.targetW && r.profile.targetW > 0 ? [] : []);
  let lo = Math.min(...ws), hi = Math.max(...ws); if (hi - lo < 2) { const m = (hi + lo) / 2; lo = m - 1; hi = m + 1; } lo -= 0.3; hi += 0.3;
  const L = 40, R = 10, Tp = 10, B = 22, n = diffDays(r.from, r.to) || 1;
  const X = d => L + (w - L - R) * diffDays(r.from, d) / n, Yv = v => Tp + (h - Tp - B) * (1 - (v - lo) / (hi - lo));
  x.strokeStyle = '#e6e2da'; x.fillStyle = '#6b7078'; x.font = '11px system-ui'; x.textAlign = 'right'; x.lineWidth = 1;
  for (let k = 0; k <= 4; k++) { const v = lo + (hi - lo) * k / 4; x.beginPath(); x.moveTo(L, Yv(v)); x.lineTo(w - R, Yv(v)); x.stroke(); x.fillText(v.toFixed(1), L - 4, Yv(v) + 4); }
  x.textAlign = 'left'; x.fillText(fmtDate(r.from), L, h - 5); x.textAlign = 'right'; x.fillText(fmtDate(r.to), w - R, h - 5);
  x.strokeStyle = '#2f6fe0'; x.lineWidth = 2.5; x.beginPath(); a.forEach((p, i) => i ? x.lineTo(X(p[0]), Yv(p[1])) : x.moveTo(X(p[0]), Yv(p[1]))); x.stroke();
  x.fillStyle = '#e8572a'; real.forEach(m => { x.beginPath(); x.arc(X(m.date), Yv(m.weight), 4.5, 0, Math.PI * 2); x.fill(); });
}
function openClient(cid) {
  const c = (D.clients || []).find(x => x.cid === cid); if (!c) return;
  CLIENT_OPEN = cid;
  const r = c.rep, p = r.profile, s = clientStats(r), GOALW = { lose: 'gLose', keep: 'gKeep', gain: 'gGain' };
  const kv = (k, v, sub) => `<div class="stat"><b>${v}</b><span>${k}</span>${sub ? `<br><span>${sub}</span>` : ''}</div>`;
  const dW = s.wFirst && s.wLast && s.wFirst !== s.wLast ? signed(r1(s.wLast.weight - s.wFirst.weight), 1) + ' ' + t('kg') : '—';
  const dWaist = s.waistFirst && s.waistLast && s.waistFirst !== s.waistLast ? signed(r1(s.waistLast.waist - s.waistFirst.waist), 1) + ' ' + t('cm') : '—';
  const last = s.ds.slice(-14).reverse();
  $('clientTitle').textContent = p.name || '—';
  $('clientBody').innerHTML = `
    <p class="muted" style="margin:0 0 8px">${esc(t(p.sex === 'm' ? 'male' : 'female'))} · ${p.age} · ${p.height} ${t('cm')} · ${t('repPeriod', { a: fmtDate(r.from), b: fmtDate(r.to) })}</p>
    <div class="clTop"><canvas id="clAv"></canvas>
      <div class="clKpi">${kv(t('repModel'), r.wNow + ' ' + t('kg'), s.wLast ? t('repMeasured', { w: s.wLast.weight, d: fmtDate(s.wLast.date) }) : '')}
        ${kv(t('repGoal'), p.targetW ? p.targetW + ' ' + t('kg') : '—', t(GOALW[r.goal] || 'gLose'))}
        ${kv(t('repLevel'), t('lvlShort', { n: r.lvl }), t('repAch', { n: r.ach }))}</div></div>
    <h3 class="clH">${t('weightTitle')}</h3><canvas id="clChart" class="clChart"></canvas>
    <p class="muted" style="margin-top:4px">${t('repChartNote')}</p>
    <h3 class="clH">${t('repSummary')}</h3>
    <div class="grid2">
      ${kv(t('repEat'), s.full.length ? Math.round(s.eat) + ' ' + t('kcal') : '—', t('repTarget', { n: r.tg }))}
      ${kv(t('repProt'), s.full.length ? Math.round(s.prot) + ' ' + t('gU') : '—', t('repTarget', { n: r.pt }))}
      ${kv(t('repDays'), `${s.full.length} / ${s.span}`, t('repDaysSub'))}
      ${kv(t('repWo'), s.woN, t('repWoSub', { m: s.woMin, a: s.actMin }))}
      ${kv(t('repSteps'), s.steps ? Math.round(s.steps).toLocaleString() : '—', t('repPerDay'))}
      ${kv(t('repWater'), s.water ? r1(s.water) : '—', t('repGlasses'))}
      ${kv(t('repDW'), dW, t('repByScale'))}
      ${kv(t('repDWaist'), dWaist, t('repByTape'))}
    </div>
    <h3 class="clH">${t('repLast14')}</h3>
    <div class="clTable"><table><tr><th>${t('thDay')}</th><th>${t('thEat')}</th><th>${t('prot')[0]}</th><th>👣</th><th>💪</th><th>✓</th></tr>
      ${last.map(([d, x]) => `<tr><td>${fmtDay(d)}</td><td>${x.e || '·'}</td><td>${x.p || '·'}</td><td>${x.st ? (x.st / 1000).toFixed(1) + 'k' : '·'}</td><td>${x.acts.reduce((a, q) => a + q[1], 0) || '·'}</td><td>${x.ok ? '✓' : (x.e ? '½' : '·')}</td></tr>`).join('')}</table></div>
    ${s.ds.some(([, x]) => x.foods && x.foods.length) ? `<details class="how" style="margin-top:10px"><summary>${t('repFoods')}</summary>${s.ds.slice().reverse().filter(([, x]) => x.foods && x.foods.length).map(([d, x]) => `<p class="clFoodDay"><b>${fmtDay(d)}</b> · ${x.e} ${t('kcal')}</p><ul class="clFoods">${x.foods.map(f => `<li>${esc(f[0])}${f[3] ? ` <em>${f[3]} ${t('gU')}</em>` : ''} — ${f[1]} ${t('kcal')}</li>`).join('')}</ul>`).join('')}</details>` : ''}
    <h3 class="clH">${t('repNote')}</h3>
    <textarea id="clNote" placeholder="${esc(t('repNotePh'))}">${esc(c.note || '')}</textarea>
    <button class="btn danger" id="clDel">${t('repDel')}</button>`;
  $('client').classList.remove('hidden');
  requestAnimationFrame(() => { drawClientAvatar(r, $('clAv')); drawClientChart(r, $('clChart')); });
  $('clNote').addEventListener('input', e => { c.note = e.target.value.slice(0, 2000); save(); });
  let arm = 0;
  $('clDel').addEventListener('click', () => {
    if (Date.now() - arm > 3000) { arm = Date.now(); return toast(t('tapAgain')); }
    D.clients = D.clients.filter(x => x.cid !== cid); save(); $('client').classList.add('hidden'); CLIENT_OPEN = null; renderClients();
  });
}
$('clientClose').addEventListener('click', () => { $('client').classList.add('hidden'); CLIENT_OPEN = null; });
$('client').addEventListener('click', e => { if (e.target.id === 'client') { $('client').classList.add('hidden'); CLIENT_OPEN = null; } });
$('clientList').addEventListener('click', e => { const r = e.target.closest('[data-cl]'); if (r) openClient(r.dataset.cl); });
$('repFile').addEventListener('click', e => { e.target.value = ''; });
$('repFile').addEventListener('change', e => { const f = e.target.files && e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => importReport(String(rd.result || '')); rd.readAsText(f); });
$('repPasteGo').addEventListener('click', () => importReport($('repPaste').value.trim()));
document.querySelectorAll('#shareBox [data-sd]').forEach(b => b.addEventListener('click', () => { SHARE_DAYS = +b.dataset.sd; renderShare(); }));
$('shareFile').addEventListener('click', () => shareMake(false));
$('shareCopy').addEventListener('click', () => shareMake(true));

// ---- Measure ----
function renderMeasure() {
  if (!$('msDate').value) $('msDate').value = todayStr();
  $('msDate').max = todayStr();
  const ms = D.meas.slice().sort((a, b) => a.date < b.date ? 1 : -1);
  if (!ms.length) { $('msHist').innerHTML = `<p class="muted">${t('noMeas')}</p>`; return; }
  const cols = ['weight', ...GIRTH_KEYS];
  $('msHist').innerHTML = `<div style="overflow-x:auto"><table><tr><th>${t('date')}</th>${cols.map(c => `<th>${c === 'weight' ? t('kg') : esc(t(c))}</th>`).join('')}<th></th></tr>` +
    ms.map(m => `<tr><td>${fmtDate(m.date)}</td>${cols.map(c => `<td>${m[c] ? r1(m[c]) : '·'}</td>`).join('')}<td><button data-dm="${m.date}" style="border:0;background:none;font-size:16px;color:#6b7078">×</button></td></tr>`).join('') + '</table></div>';
}
$('msHist').addEventListener('click', e => { const b = e.target.closest('[data-dm]'); if (!b) return; D.meas = D.meas.filter(m => m.date !== b.dataset.dm); save(); dirty(); renderMeasure(); });
$('msSave').addEventListener('click', () => {
  const date = $('msDate').value || todayStr();
  const rec = { uid: uid(), date, at: Date.now() }; let any = false;
  ['weight', ...GIRTH_KEYS].forEach(k => {
    const v = num($('ms_' + k).value);
    const ok = k === 'weight' ? v >= 30 && v <= 300 : v >= 20 && v <= 250;
    if (v != null && ok) { rec[k] = v; any = true; }
  });
  if (!any) return toast(t('tOne'));
  const old = D.meas.find(m => m.date === date);
  if (old) Object.assign(old, rec); else D.meas.push(rec);
  save(); dirty();
  ['weight', ...GIRTH_KEYS].forEach(k => $('ms_' + k).value = '');
  renderMeasure(); toast(t('tMeas'));
});

// ---- Progress ----
function renderProgress() {
  const c = $('chart'); const [w, h] = sizeCanvas(c); const x = c.getContext('2d');
  x.clearRect(0, 0, w, h);
  const a = ser();
  if (a.length < 2) { x.fillStyle = '#6b7078'; x.font = '14px system-ui'; x.textAlign = 'center'; x.fillText(t('few'), w / 2, h / 2); }
  else {
    const ws = a.map(p => p.w); let lo = Math.min(...ws), hi = Math.max(...ws);
    if (hi - lo < 2) { const m = (hi + lo) / 2; lo = m - 1; hi = m + 1; }
    lo -= 0.3; hi += 0.3;
    const L = 40, R = 10, Tp = 10, B = 24;
    const X = i => L + (w - L - R) * i / (a.length - 1), Yv = v => Tp + (h - Tp - B) * (1 - (v - lo) / (hi - lo));
    x.strokeStyle = '#e6e2da'; x.fillStyle = '#6b7078'; x.font = '11px system-ui'; x.textAlign = 'right'; x.lineWidth = 1;
    for (let k = 0; k <= 4; k++) { const v = lo + (hi - lo) * k / 4; x.beginPath(); x.moveTo(L, Yv(v)); x.lineTo(w - R, Yv(v)); x.stroke(); x.fillText(v.toFixed(1), L - 4, Yv(v) + 4); }
    x.textAlign = 'left'; x.fillText(fmtDate(a[0].d), L, h - 6); x.textAlign = 'right'; x.fillText(fmtDate(a[a.length - 1].d), w - R, h - 6);
    x.strokeStyle = '#2f6fe0'; x.lineWidth = 2.5; x.beginPath(); a.forEach((p, i) => i ? x.lineTo(X(i), Yv(p.w)) : x.moveTo(X(i), Yv(p.w))); x.stroke();
    x.fillStyle = '#e8572a'; a.forEach((p, i) => { if (p.real) { x.beginPath(); x.arc(X(i), Yv(p.w), 4.5, 0, Math.PI * 2); x.fill(); } });
  }
  const td = todayStr(); let rows = '';
  for (let i = 6; i >= 0; i--) {
    const s = addDays(td, -i), tt = dayTotals(s, weightAt(s));
    rows += `<tr><td>${fmtDay(s)}</td><td>${tt.eaten ? Math.round(tt.eaten) : '·'}</td><td>${Math.round(tt.burned)}</td><td class="${tt.logged ? (tt.bal > 0 ? 'pos' : 'neg') : ''}">${tt.logged ? signed(Math.round(tt.bal), 0) : '·'}</td><td>${tt.logged ? signed(tt.bal / 7700, 2) : '·'}</td></tr>`;
  }
  renderAch(); renderShare();
  $('weekTable').innerHTML = `<table><tr><th>${t('thDay')}</th><th>${t('thEat')}</th><th>${t('thBurn')}</th><th>${t('thBal')}</th><th>${t('thKg')}</th></tr>${rows}</table>`;
}

// ---- Tips ----
document.querySelectorAll('#goalSeg button').forEach(b => b.addEventListener('click', () => { P().goal = b.dataset.g; save(); renderTips(); }));
document.querySelectorAll('#lvlSeg button').forEach(b => b.addEventListener('click', () => { woLevel = +b.dataset.l; D.woLevel = woLevel; save(); renderTips(); }));
function renderTips() {
  const td = todayStr(), w = weightAt(td), p = P(), male = p.sex === 'm', li = LI();
  // calories
  const ct = calTarget(w), tt = dayTotals(td, w);
  document.querySelectorAll('#goalSeg button').forEach(b => b.classList.toggle('on', b.dataset.g === ct.g));
  $('calTarget').textContent = '≈ ' + ct.tg;
  const allowed = ct.tg + tt.ex / 2;
  $('calBar').style.width = clamp(tt.eaten / allowed * 100, 0, 100) + '%';
  $('calBar').style.background = tt.eaten > allowed ? 'var(--bad)' : 'var(--good)';
  $('calToday').textContent = t('todayVs', { e: Math.round(tt.eaten), t: Math.round(allowed) });
  const refW = Math.min(w, 27 * Math.pow(p.height / 100, 2));
  const prot = Math.round(refW * (ct.g === 'keep' ? 1.2 : ct.g === 'gain' ? 1.8 : 1.6) / 5) * 5;
  const lines = [t('calBase', { k: Math.round(ct.base) }), ct.low ? t('calLow') : t(ct.g === 'lose' ? 'calLose' : ct.g === 'gain' ? 'calGain' : 'calKeep')];
  if (ct.hit) lines.push(t('calFloorHit', { f: calFloor() }));
  lines.push(t('protein', { g: prot }), t('exDays'));
  if (ct.g === 'lose') lines.push(t('calFloor', { f: calFloor() }));
  $('calLines').innerHTML = lines.map(l => `<li>${esc(l)}</li>`).join('');
  // week
  let mins = 0, str = 0;
  for (let i = 0; i < 7; i++) peekDay(addDays(td, -i)).acts.forEach(a => { mins += a.min; if (a.id === 'homeworkout' || a.id === 'gym') str++; });
  $('weekAct').textContent = t('weekAct', { m: mins }); $('weekActBar').style.width = clamp(mins / 150 * 100, 0, 100) + '%';
  $('weekStr').textContent = t('weekStr', { n: str }); $('weekStrBar').style.width = clamp(str / 3 * 100, 0, 100) + '%';
  // workout
  if (woLevel == null) woLevel = D.woLevel != null ? D.woLevel : p.sporty >= 50 ? 2 : p.sporty >= 30 ? 1 : 0;
  document.querySelectorAll('#lvlSeg button').forEach(b => b.classList.toggle('on', +b.dataset.l === woLevel));
  $('woSex').textContent = t(male ? 'sexM' : 'sexF');
  const minutes = WO_MIN[woLevel], kcal = Math.round(netMet(actDef('homeworkout')) * w * minutes / 60);
  $('woMeta').textContent = t('woMeta', { n: ROUNDS[woLevel], m: minutes, k: kcal });
  $('woList').innerHTML = EXS.map(x => {
    let dose = (male ? x.m : x.f)[woLevel], name = x.n ? x.n[li] : '';
    if (x.id === 'pushup') { name = PUSH_NAMES[dose[0]][li]; dose = dose[1]; }
    const ds = x.u === 'sec' ? t('sec', { n: dose }) : x.u === 'leg' ? t('perLeg', { n: dose }) : t('reps', { n: dose });
    const av = x.id === 'pushup' ? (male ? x.m : x.f)[woLevel][0] : '';
    return `<div class="ex"><div class="top"><canvas class="anim" data-a="${x.id}" data-v="${av}"></canvas><div class="hd"><b>${x.e} ${esc(name)}</b><span class="dose">${esc(ds)}</span></div></div><p>${esc(x.how[li])}</p><p>⬇️ ${t('easier')}: ${esc(x.easy[li])} · ⬆️ ${t('harder')}: ${esc(x.hard[li])}</p></div>`;
  }).join('');
  startAnims();
}
$('woLog').addEventListener('click', () => {
  const td = todayStr(), w = weightAt(td), minutes = WO_MIN[woLevel == null ? 0 : woLevel];
  day(td).acts.push({ id: 'homeworkout', at: Date.now(), min: minutes, k: Math.round(netMet(actDef('homeworkout')) * w * minutes / 60) });
  save(); dirty(); toast(t('woLogged')); renderTips();
});

// ---- Profile ----
let draft = null;
function swatches(id, list, key) {
  $(id).innerHTML = list.map(c => `<button class="sw${draft[key] === c ? ' on' : ''}" data-c="${c}" style="background:${c}"></button>`).join('');
}
['swSkin', 'swHair', 'swShirt', 'swEyes'].forEach((id, i) => $(id).addEventListener('click', e => {
  const b = e.target.closest('[data-c]'); if (!b) return;
  const key = ['skin', 'hair', 'shirt', 'eyes'][i]; draft[key] = b.dataset.c; swatches(id, [SKINS, HAIRS, SHIRTS, EYE_COLS][i], key); profPreview();
}));
['pSex', 'pHairStyle', 'pBeard', 'pShirtStyle', 'pPants', 'pGlasses', 'pHeight', 'pWeight'].forEach(id => $(id).addEventListener('input', profPreview));
function profPreview() {
  if (!draft) return;
  const tmp = Object.assign({}, draft, { sex: $('pSex').value, hairStyle: $('pHairStyle').value, beard: $('pBeard').value, shirtStyle: $('pShirtStyle').value, pants: $('pPants').value, glasses: $('pGlasses').checked,
    height: num($('pHeight').value) || draft.height, weight: num($('pWeight').value) || draft.weight, age: num($('pAge').value) || draft.age, job: +$('pJob').value, sporty: +$('pSporty').value, startDate: draft.startDate || todayStr() });
  const real = D.profile; D.profile = tmp; const keepSer = SER, keepAvc = AVC; SER = null; AVC = null;
  try { AV_TARGET = $('profPrev'); const w = real ? weightAt(todayStr()) : tmp.weight; drawAvatar(w, toneAt(todayStr())); } catch (e) {}
  AV_TARGET = null; D.profile = real; SER = keepSer; AVC = keepAvc;
}
function renderProfile() {
  if (typeof renderBackupInfo === 'function') renderBackupInfo();
  if (typeof renderClients === 'function') renderClients();
  draft = Object.assign({ name: '', sex: 'm', age: 30, height: 175, weight: 80, job: 1.35, sporty: 0, skin: SKINS[1], hair: HAIRS[1], hairStyle: 'short', beard: 'none', glasses: false, shirt: SHIRTS[0] }, P() || {});
  $('pName').value = draft.name; $('pSex').value = draft.sex; $('pAge').value = draft.age; $('pHeight').value = draft.height; $('pWeight').value = draft.weight;
  $('pJob').value = String(draft.job); $('pSporty').value = String(draft.sporty); $('pShape').value = shapeOf(draft); $('pHairStyle').value = draft.hairStyle; $('pBeard').value = draft.beard; $('pGlasses').checked = !!draft.glasses;
  $('pShirtStyle').value = draft.shirtStyle || 'tshirt'; $('pPants').value = draft.pants || 'shorts'; if (!draft.eyes) draft.eyes = EYE_COLS[0];
  swatches('swSkin', SKINS, 'skin'); swatches('swHair', HAIRS, 'hair'); swatches('swShirt', SHIRTS, 'shirt'); swatches('swEyes', EYE_COLS, 'eyes');
  requestAnimationFrame(profPreview);
}
$('pSave').addEventListener('click', () => {
  const age = num($('pAge').value), h = num($('pHeight').value), w = num($('pWeight').value);
  if (!(age >= 12 && age <= 100 && h >= 120 && h <= 230 && w >= 30 && w <= 300)) return toast(t('tBad'));
  const isNew = !P();
  D.profile = Object.assign(draft, {
    name: $('pName').value.trim().slice(0, 30), sex: $('pSex').value, age, height: h, weight: w,
    job: +$('pJob').value, sporty: +$('pSporty').value, shape: $('pShape').value, shirtStyle: $('pShirtStyle').value, pants: $('pPants').value, hairStyle: $('pHairStyle').value, beard: $('pBeard').value, glasses: $('pGlasses').checked,
    startDate: (P() && P().startDate) || todayStr()
  });
  save(); dirty(); toast(t('tSaved'));
  if (isNew) showTab('tabMe');
});
$('bCopy').addEventListener('click', () => {
  const txt = JSON.stringify(D); $('backup').value = txt;
  try { navigator.clipboard.writeText(txt).then(() => toast(t('tCopied')), () => { $('backup').select(); toast(t('tCopyFail')); }); }
  catch (e) { $('backup').select(); toast(t('tCopyFail')); }
});
function restoreFrom(txt) {
  try {
    const o = JSON.parse(txt);
    if (!o || !o.profile || !o.profile.height) throw 0;
    D = Object.assign({ profile: null, days: {}, meas: [], lang: LANG }, o); LANG = D.lang || LANG; migrate();
    save(); dirty(); if (typeof loadMyFoods === 'function') loadMyFoods(); applyLang(); fillStatic(); toast(t('tRestored')); showTab('tabMe');
  } catch (e) { toast(t('tBadBackup')); }
}
$('bLoad').addEventListener('click', () => restoreFrom($('backup').value));
let DL = null;
(async () => { try { if (window.claude && typeof claude.use === 'function') DL = await claude.use('downloads'); } catch (e) { DL = null; } if (!DL && window.AppFiles) DL = window.AppFiles; })();
function renderBackupInfo() {
  const el = $('bLast'); if (!el) return;
  el.textContent = D.lastBackup ? t('bLastW', { d: fmtDate(D.lastBackup) }) : t('bNever');
  el.className = 'bLast' + (!D.lastBackup || diffDays(D.lastBackup, todayStr()) > 14 ? ' warn' : '');
}
$('bFile').addEventListener('click', async () => {
  const txt = JSON.stringify(Object.assign({}, D, { lastBackup: todayStr() })), name = 'dvijnyk-' + todayStr() + '.json';
  if (DL) {
    try { await DL.save({ filename: name, data: txt }); D.lastBackup = todayStr(); save(); renderBackupInfo(); toast(t('bSaved')); return; }
    catch (e) { if (e && (e.code === 'declined' || e.code === 'cancelled' || e.code === 'dismissed')) return; }
  }
  try {   // outside Claude: a normal browser download
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    D.lastBackup = todayStr(); save(); renderBackupInfo(); toast(t('bSaved'));
  } catch (e) { $('backup').value = txt; toast(t('tCopyFail')); }
});
$('bFileIn').addEventListener('click', e => { e.target.value = ''; });
$('bFileIn').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  const r = new FileReader(); r.onload = () => restoreFrom(String(r.result || '')); r.onerror = () => toast(t('tBadBackup')); r.readAsText(f);
});
let resetArm = 0;
$('bReset').addEventListener('click', () => {
  if (Date.now() - resetArm > 4000) { resetArm = Date.now(); return toast(t('tapAgain')); }
  D = { profile: null, days: {}, meas: [], lang: LANG }; save(); dirty(); resetArm = 0; toast(t('tErased')); showTab('tabProfile');
});

window.addEventListener('resize', () => { if (!P()) return; if (curTab === 'tabMe') renderMe(); if (curTab === 'tabProgress') renderProgress(); });
window.addEventListener('error', ev => toast('Error: ' + ev.message));
function reloadFromStorage(raw) {
  try { raw = raw || localStorage.getItem(KEY); if (!raw) return; const o = JSON.parse(raw); if (!o || typeof o !== 'object') return; D = Object.assign({ profile: null, days: {}, meas: [], lang: LANG }, o); migrate(); } catch (e) { return; }
  dirty(); if (typeof loadMyFoods === 'function') loadMyFoods(); if (curTab !== 'tabProfile') render();
}
// another tab of the app saved: take its data (storage events fire only in the *other* tabs)
window.addEventListener('storage', e => { if (e.key === KEY && e.newValue) reloadFromStorage(e.newValue); });
// coming back to the app (phone unlocked, tab switched): re-read storage and roll the date if needed
document.addEventListener('visibilitychange', () => { if (document.hidden) return; const raw = (() => { try { return localStorage.getItem(KEY); } catch (e) { return null; } })();
  if (raw && raw !== JSON.stringify(D)) reloadFromStorage(raw); else if (syncDay() && curTab !== 'tabProfile') render(); });
setInterval(() => { if (syncDay() && curTab === 'tabToday') renderToday(); }, 60000);

if (!AI_ON) { const cc = document.querySelector('.coachCard'); if (cc) cc.style.display = 'none'; }
if (!AI_ON && !SR) document.querySelectorAll('.micBtn').forEach(b => { b.style.display = 'none'; });
// Android back button: close the top sheet first, then go to the main tab, then leave the app
if (window.AppNative) AppNative.onBack(() => {
  const run = $('woRun'); if (run && !run.classList.contains('hidden')) { $('runStop').click(); return; }
  const open = [...document.querySelectorAll('.sheet:not(.hidden)')].sort((a, b) => (+getComputedStyle(b).zIndex || 0) - (+getComputedStyle(a).zIndex || 0))[0];
  if (open) { const x = open.querySelector('.sheetHead button[id$="Close"], #bClose'); if (x) x.click(); else open.classList.add('hidden'); return; }
  if (curTab !== 'tabMe' && P()) return showTab('tabMe');
  AppNative.exit();
});
// hidden test mode (D.testMode, optional): 5 quick taps on the version line; shop items free, feeding free.
// Turning it off takes back what was only worn for testing (items that were never bought).
$('appVer').textContent = 'Mirro ' + (CFG.version || '');
let verTaps = [];
$('appVer').addEventListener('click', () => {
  const now = Date.now(); verTaps = verTaps.filter(x => now - x < 2500).concat(now);
  if (verTaps.length < 5) return;
  verTaps = []; if (CFG.features && CFG.features.testTools === false && !D.testMode) return;
  D.testMode = !D.testMode;
  if (!D.testMode) { const st = shopState(); for (const sl in st.eq) if (!st.owned.includes(st.eq[sl])) delete st.eq[sl]; delete D.testMode; }
  save(); dirty(); toast(D.testMode ? t('testOn') : t('testOff'));
});
applyLang(); fillStatic();
showTab(P() ? 'tabMe' : 'tabProfile');
