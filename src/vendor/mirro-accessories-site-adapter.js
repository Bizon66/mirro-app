/* Detailed accessories in the existing Mirro shop and Canvas2D scene. MIT.
 * The host keeps purchases, ownership, equipment and its animation clock.
 */
(function () {
  'use strict';
  if (window.MirroAccessoriesSiteAdapter) return;

  const ADDITIONS = [
    { id: 'acc_bandana', slot: 'acc', price: 160, ic: '🧣', n: ['Бандана на шию', 'Šátek na krk', 'Neck bandana'] },
    { id: 'acc_towel', slot: 'acc', price: 150, ic: '🧖', n: ['Спортивний рушник', 'Sportovní ručník', 'Sports towel'] },
    { id: 'acc_waistbag', slot: 'acc', price: 230, ic: '👝', n: ['Поясна сумка', 'Ledvinka', 'Waist bag'] },
    { id: 'acc_crossbody', slot: 'acc', price: 280, ic: '🎒', n: ['Сумка через плече', 'Taška přes rameno', 'Crossbody bag'] },
    { id: 'acc_wristbands', slot: 'acc', price: 130, ic: '💪', n: ['Спортивні напульсники', 'Sportovní potítka', 'Sports wristbands'] },
    { id: 'acc_bottle', slot: 'acc', price: 180, ic: '🧴', n: ['Пляшка для води', 'Láhev na vodu', 'Water bottle'] },
  ];
  const BODY_ACCESSORIES = {
    acc_bandana: 'bandana', acc_towel: 'towel', acc_waistbag: 'waistbag',
    acc_crossbody: 'crossbody', acc_wristbands: 'wristbands', acc_bottle: 'bottle',
  };
  const originals = {}, wrappers = {};
  let installed = false, stopped = false, timer = 0, attempts = 0, generation = 0;
  let bodyOwner = null, originalBodyDraw = null, bodyWrapper = null;
  let resolveReady;
  const ready = new Promise(resolve => { resolveReady = resolve; });

  function appearanceNow() {
    try { return typeof P === 'function' && P().sex === 'f' ? 'female' : 'male'; }
    catch (error) { return 'male'; }
  }
  function available(method) {
    const core = window.MirroAccessories;
    try {
      return !stopped && core && typeof core.isReady === 'function' && core.isReady() && typeof core[method] === 'function' ? core : null;
    } catch (error) { return null; }
  }
  function paint(context, method, options) {
    const core = available(method);
    if (!core || !context || typeof context.save !== 'function' || typeof context.restore !== 'function') return false;
    context.save();
    try { return !!core[method](context, options); }
    catch (error) { return false; }
    finally { context.restore(); }
  }
  function currentContext() {
    try { return typeof ctx !== 'undefined' ? ctx : null; }
    catch (error) { return null; }
  }
  function extendCatalog() {
    try {
      if (typeof SHOP === 'undefined' || !Array.isArray(SHOP)) return false;
      for (const item of ADDITIONS) {
        if (!SHOP.some(existing => existing.id === item.id)) SHOP.push({ ...item, n: [...item.n] });
      }
      return true;
    } catch (error) { return false; }
  }
  function hook(name, wrapper) {
    originals[name] = window[name]; wrappers[name] = wrapper; window[name] = wrapper;
  }
  function installHooks() {
    const token = ++generation;
    const current = () => installed && !stopped && generation === token;
    const nativeHeadphones = window.drawHeadphones, nativeHat = window.drawHat, nativeWatch = window.drawWatch;
    hook('drawHeadphones', function (cx, cy, halfWidth, halfHeight) {
      if (current() && paint(currentContext(), 'drawHeadphones', { appearance: appearanceNow(), cx, cy, halfWidth, halfHeight })) return;
      return nativeHeadphones.apply(this, arguments);
    });
    hook('drawHat', function (id, cx, cy, halfWidth, halfHeight) {
      if (current() && id === 'headband' && paint(currentContext(), 'drawHeadband', { appearance: appearanceNow(), cx, cy, halfWidth, halfHeight })) return;
      return nativeHat.apply(this, arguments);
    });
    hook('drawWatch', function (x, y, size) {
      if (current() && paint(currentContext(), 'drawWatch', { appearance: appearanceNow(), x, y, size })) return;
      return nativeWatch.apply(this, arguments);
    });
    bodyOwner = window.MirroBody;
    originalBodyDraw = bodyOwner.draw;
    const nativeBodyDraw = originalBodyDraw;
    bodyWrapper = function (context, options) {
      const result = nativeBodyDraw.apply(this, arguments);
      const accessory = options && options.equipment && BODY_ACCESSORIES[options.equipment.acc];
      if (current() && result && accessory) {
        paint(context, 'drawBodyAccessories', {
          ...options, accessory,
          appearance: options.appearance || (options.profile && options.profile.sex === 'f' ? 'female' : 'male'),
        });
      }
      return result;
    };
    bodyOwner.draw = bodyWrapper;
  }
  function refreshOnce() {
    if (!installed || stopped) return;
    try {
      if (typeof curTab !== 'undefined' && curTab === 'tabProfile' && typeof profPreview === 'function') profPreview();
      else if (typeof AV_STATE !== 'undefined' && AV_STATE && typeof drawAvatar === 'function') drawAvatar(AV_STATE.w, AV_STATE.tone);
      const shop = document.getElementById('shop');
      if (shop && !shop.classList.contains('hidden') && typeof renderShop === 'function') renderShop();
    } catch (error) { /* A host between page renders will refresh normally. */ }
  }
  function install() {
    if (installed) return true;
    if (!window.MirroAccessories || !window.MirroBody || typeof window.MirroBody.draw !== 'function' ||
        !['drawHeadphones', 'drawHat', 'drawWatch'].every(name => typeof window[name] === 'function')) return false;
    if (!extendCatalog()) return false;
    stopped = false; installHooks(); installed = true;
    Promise.resolve(window.MirroAccessories.ready).then(refreshOnce, () => {});
    resolveReady(true); return true;
  }
  function waitForApp() {
    if (stopped || install()) return;
    if (++attempts >= 300) { resolveReady(false); return; }
    timer = setTimeout(waitForApp, 50);
  }
  function uninstall() {
    stopped = true; clearTimeout(timer);
    for (const name of Object.keys(wrappers)) if (window[name] === wrappers[name]) window[name] = originals[name];
    if (bodyOwner && bodyOwner.draw === bodyWrapper) bodyOwner.draw = originalBodyDraw;
    installed = false; resolveReady(false);
    // Keep catalog entries and owned item IDs. Uninstalling a visual adapter
    // must never erase something the user purchased through the host shop.
  }
  window.MirroAccessoriesSiteAdapter = {
    ready, install, uninstall, isInstalled: () => installed,
    getCatalogAdditions: () => ADDITIONS.map(item => ({ ...item, n: [...item.n] })),
  };
  waitForApp();
})();
