/* Optional adapter for Mirro's existing Canvas2D app. No legacy source included.
 * Load as a classic external script after the MirroAppearance assets/module.
 * It wraps head drawing only; the app retains its body, data and motion loop.
 * MIT license for this adapter. */
(function () {
  'use strict';
  if (window.MirroSiteAdapter) return;

  const STYLE_MAP = {
    male: { short: 'crop', side: 'side-part', buzz: 'buzz', curly: 'curly', long: 'long', bun: 'bun' },
    female: { short: 'pixie', side: 'bob', long: 'lob', ponytail: 'ponytail', bun: 'bun', curly: 'curls' },
  };
  const DIRECT_STYLES = {
    male: new Set(['buzz', 'crop', 'side-part', 'fringe', 'quiff', 'slick-back', 'curly', 'long', 'bun']),
    female: new Set(['pixie', 'bob', 'lob', 'waves', 'ponytail', 'bun', 'braid', 'braids', 'curls']),
  };
  const DETAILED_BEARDS = new Set(['none', 'stubble', 'short', 'full', 'moustache', 'both']);
  const EXTRA_STYLES = {
    male: [
      ['fringe', ['З чубчиком', 'S ofinou', 'Fringe']],
      ['quiff', ['Квіф', 'Objemný quiff', 'Quiff']],
      ['slick-back', ['Зачесана назад', 'Uhlazené dozadu', 'Slicked back']],
    ],
    female: [
      ['waves', ['Хвилі', 'Vlny', 'Waves']],
      ['braid', ['Коса', 'Cop', 'Braid']],
      ['braids', ['Дві коси', 'Dva copy', 'Two braids']],
    ],
  };
  const HEX = /^#[0-9a-f]{6}$/i;
  const cache = new Map();
  const originals = {};
  const wrappers = {};
  let installed = false, stopped = false, timer = 0, tries = 0, activeHead = null;
  let colorRow = null, colorInput = null, colorHint = null, saveButton = null;
  const watchedSelects = [];
  let resolveReady;
  const ready = new Promise(resolve => { resolveReady = resolve; });

  function profileNow() {
    try { return typeof P === 'function' ? P() : null; } catch (error) { return null; }
  }
  function draftNow() {
    try { return typeof draft === 'object' && draft ? draft : null; } catch (error) { return null; }
  }
  function preview() {
    try { if (typeof profPreview === 'function') profPreview(); } catch (error) { /* The legacy form can be between renders. */ }
  }
  function readBlink() {
    try { return typeof AV_T === 'number' && !(typeof REDUCED !== 'undefined' && REDUCED) && AV_T % 4.3 < .14 ? 1 : 0; }
    catch (error) { return 0; }
  }
  function mapStyle(style, appearance) {
    // An existing legacy name takes precedence over a coincidentally equal new
    // identifier (female legacy "long" means the reference's straight lob).
    return STYLE_MAP[appearance][style] || (DIRECT_STYLES[appearance].has(style) ? style : null);
  }
  function syncHairstyles(restoreSelection = false) {
    const select = document.getElementById('pHairStyle');
    if (!select) return false;
    const source = draftNow() || profileNow();
    const sexSelect = document.getElementById('pSex');
    const appearance = (sexSelect && sexSelect.value || source && source.sex) === 'f' ? 'female' : 'male';
    const language = document.documentElement && document.documentElement.lang || 'uk';
    const languageIndex = { uk: 0, cs: 1, en: 2 }[language] || 0;
    const previous = select.value;
    let wanted = restoreSelection && source && source.hairStyle ? source.hairStyle : previous;
    for (const option of [...select.options]) {
      if (option.dataset.mirroDetailedStyle && option.dataset.mirroDetailedStyle !== appearance) option.remove();
    }
    for (const [id, labels] of EXTRA_STYLES[appearance]) {
      let option = [...select.options].find(item => item.value === id);
      if (!option) { option = document.createElement('option'); option.value = id; option.dataset.mirroDetailedStyle = appearance; select.append(option); }
      option.textContent = typeof window.L3 === 'function' ? window.L3(labels) : labels[languageIndex];   // Mirro: ru / lt via L3
    }
    // Restore a saved direct detailed ID even if the original select did not
    // contain it when renderProfile first tried assigning its value.
    if (wanted && ![...select.options].some(option => option.value === wanted) && DIRECT_STYLES[appearance].has(wanted)) {
      const option = document.createElement('option');
      option.value = wanted; option.dataset.mirroDetailedStyle = appearance;
      const labels = window.MirroAppearance.HAIRSTYLES && window.MirroAppearance.HAIRSTYLES[appearance];
      option.textContent = labels && labels.find(style => style.id === wanted)?.label || wanted;
      select.append(option);
    }
    if (![...select.options].some(option => option.value === wanted)) wanted = 'short';
    select.value = wanted;
    return previous !== select.value;
  }
  function landmarksFor(appearance, style) {
    const supplied = window.MirroAppearance.getHeadLandmarks(appearance, style) || {};
    const eyeY = Number(supplied.eyeY), chinY = Number(supplied.chinY);
    const faceHalfWidth = Number(supplied.faceHalfWidth);
    if (!(eyeY > 0 && eyeY < chinY && chinY < 1 && faceHalfWidth > .05 && faceHalfWidth < .5)) return null;
    return { ...supplied, eyeY, chinY, faceHalfWidth, faceCenterX: Number(supplied.faceCenterX) || .5 };
  }

  function prepareHead(appearance, value, skinColor, blink, landmarks, shirtStyle) {
    const highCollar = appearance === 'male' && shirtStyle === 'hoodie';
    const key = JSON.stringify([appearance, value, skinColor, blink, highCollar]);
    if (cache.has(key)) return cache.get(key);
    const core = window.MirroAppearance;
    const portrait = core.getHeadCanvas(appearance, value, { blink, skinColor });
    if (!portrait || !portrait.width || !portrait.height) return null;
    const result = document.createElement('canvas');
    result.width = portrait.width; result.height = portrait.height;
    const context = result.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(portrait, 0, 0);

    // Portrait atlas cells include a blue shirt. Remove that shirt so the
    // application's own tank/polo/hoodie and shirt color remain visible. Inspect
    // a canonical green-hair / warm-skin copy: hair, skin and the blue shirt
    // stay distinguishable even when the user recolors any of those layers.
    const neutralValue = { ...value, hairColor: '#20b060', beardColor: '#20b060' };
    const neutral = core.getHeadCanvas(appearance, neutralValue, { blink, skinColor: '#e3ad83' });
    if (!neutral || neutral.width !== result.width || neutral.height !== result.height) return null;
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = result.width; maskCanvas.height = result.height;
    const maskContext = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!maskContext) return null;
    maskContext.drawImage(neutral, 0, 0);
    const mask = maskContext.getImageData(0, 0, result.width, result.height).data;
    const pixels = context.getImageData(0, 0, result.width, result.height);
    for (let y = Math.floor(landmarks.chinY * result.height); y < result.height; y++) {
      const ny = y / result.height;
      for (let x = 0; x < result.width; x++) {
        const index = (y * result.width + x) * 4;
        if (!pixels.data[index + 3]) continue;
        const red = mask[index], green = mask[index + 1], blue = mask[index + 2];
        const shirt = blue > red * 1.18 && blue > green * 1.12;
        if (shirt) { pixels.data[index + 3] = 0; continue; }
        const skin = red > green * 1.06 && red > blue * 1.15;
        if (skin) {
          // Blend painted neck skin into the body's own neck. A curved, soft
          // boundary avoids the old horizontal cut without trimming long hair.
          const lateral = Math.min(1, Math.abs(x / result.width - landmarks.faceCenterX) / (landmarks.faceHalfWidth * .65));
          const start = landmarks.chinY + .018;
          // The high hood covers the lower portrait neck; let the body's
          // registered neck show there instead of painting skin over its rim.
          const end = landmarks.chinY + (highCollar ? .065 : .11) - (highCollar ? .02 : .035) * lateral * lateral;
          const t = Math.max(0, Math.min(1, (ny - start) / (end - start)));
          pixels.data[index + 3] = Math.round(pixels.data[index + 3] * (1 - t * t * (3 - 2 * t)));
        }
      }
    }
    context.putImageData(pixels, 0, 0);
    cache.set(key, result);
    if (cache.size > 8) cache.delete(cache.keys().next().value);
    return result;
  }

  function makePlan(style, color, cx, cy, halfWidth, halfHeight) {
    const core = window.MirroAppearance;
    const profile = profileNow();
    if (!core || typeof core.isReady !== 'function' || !core.isReady() || !profile || (profile.sex !== 'm' && profile.sex !== 'f')) return null;
    const appearance = profile.sex === 'f' ? 'female' : 'male';
    const hairStyle = mapStyle(style, appearance);
    const beardStyle = profile.beard || 'none';
    if (!hairStyle || !DETAILED_BEARDS.has(beardStyle)) return null;
    if (!HEX.test(profile.skin || '') || !HEX.test(color || '')) return null;
    try {
      const defaults = core.getDefaults(appearance);
      const value = core.normalizeCustomization({
        hairStyle,
        hairColor: color,
        eyeColor: HEX.test(profile.eyes || '') ? profile.eyes : defaults.eyeColor,
        beardStyle: appearance === 'female' ? 'none' : beardStyle,
        beardColor: HEX.test(profile.beardColor || '') ? profile.beardColor : color,
      }, appearance);
      const landmarks = landmarksFor(appearance, hairStyle);
      if (!landmarks) return null;
      const image = prepareHead(appearance, value, profile.skin, readBlink(), landmarks, profile.shirtStyle);
      if (!image) return null;
      return { image, landmarks, style, cx, cy, halfWidth, halfHeight, painted: false };
    } catch (error) { return null; }
  }

  function installHeadHooks() {
    for (const name of ['drawHairBack', 'drawHairFront', 'drawFace']) originals[name] = window[name];
    wrappers.drawHairBack = function (style, color, cx, cy, halfWidth, halfHeight) {
      activeHead = makePlan(style, color, cx, cy, halfWidth, halfHeight);
      if (!activeHead) return originals.drawHairBack.apply(this, arguments);
    };
    wrappers.drawHairFront = function (style, color, cx, cy, halfWidth, halfHeight) {
      const plan = activeHead;
      if (!plan || plan.style !== style || plan.cx !== cx || plan.cy !== cy) return originals.drawHairFront.apply(this, arguments);
      const m = plan.landmarks;
      const eyeY = cy - .06 * halfHeight;
      const chinY = cy + 1.03 * halfHeight;
      const height = (chinY - eyeY) / (m.chinY - m.eyeY);
      // Preserve the portrait's own aspect ratio. The legacy vector head gets
      // wider with BMI, but stretching these painted faces horizontally makes
      // eyes, ears and jaws look flattened. Girth changes belong to the body.
      const width = height * plan.image.width / plan.image.height;
      try {
        // ctx is the app's current 2D drawing context, including when a profile,
        // shop or client report temporarily renders into a different canvas.
        ctx.save();
        try { ctx.drawImage(plan.image, cx - m.faceCenterX * width, eyeY - m.eyeY * height, width, height); }
        finally { ctx.restore(); }
        plan.painted = true;
        // Suppress the legacy renderer's decorative strands over the portrait.
        if (typeof HAIR_STRANDS !== 'undefined') HAIR_STRANDS = null;
      } catch (error) {
        activeHead = null;
        originals.drawHairBack.apply(this, arguments);
        return originals.drawHairFront.apply(this, arguments);
      }
    };
    wrappers.drawFace = function (profile, cx, cy, halfWidth, halfHeight) {
      const plan = activeHead;
      if (plan && plan.painted && plan.cx === cx && plan.cy === cy) return cy - .06 * halfHeight;
      return originals.drawFace.apply(this, arguments);
    };
    for (const name of ['drawHairBack', 'drawHairFront', 'drawFace']) window[name] = wrappers[name];
  }

  function syncBeardColor() {
    if (!colorInput) return;
    const hairChanged = syncHairstyles();
    const source = draftNow() || profileNow();
    const color = source && (source.beardColor || source.hair);
    colorInput.value = HEX.test(color || '') ? color.toLowerCase() : '#65432e';
    const sexSelect = document.getElementById('pSex');
    const sex = sexSelect && sexSelect.value ? sexSelect.value : source && source.sex;
    const styleSelect = document.getElementById('pHairStyle');
    const beardSelect = document.getElementById('pBeard');
    const style = styleSelect && styleSelect.value || source && source.hairStyle;
    const beard = beardSelect && beardSelect.value || source && source.beard || 'none';
    const detailed = sex === 'm' && !!mapStyle(style, 'male') && DETAILED_BEARDS.has(beard);
    colorInput.disabled = !detailed;
    const language = document.documentElement && document.documentElement.lang || 'uk';
    const label = colorRow && colorRow.querySelector('label');
    const text = typeof window.L3 === 'function' ? window.L3(['Колір бороди', 'Barva vousů', 'Beard color']) : ({ uk: 'Колір бороди', cs: 'Barva vousů', en: 'Beard color' }[language] || 'Колір бороди');
    if (label) label.textContent = text;
    colorInput.setAttribute('aria-label', text);
    if (colorHint) {
      colorHint.hidden = sex !== 'm' || detailed;
      colorHint.style.display = colorHint.hidden ? 'none' : 'block';
      const hintTexts = ['Для цієї зачіски або бороди працює початковий рендерер: борода має колір волосся.',
        'Tento účes nebo vousy používají původní vykreslení: vousy mají barvu vlasů.',
        'This hairstyle or beard uses the original renderer: beard color follows hair color.'];
      colorHint.textContent = typeof window.L3 === 'function' ? window.L3(hintTexts) : (hintTexts[{ uk: 0, cs: 1, en: 2 }[language]] || hintTexts[0]);
    }
    // The host registered its preview listener before this adapter. If a sex
    // change invalidates one of our extra styles, redraw the short fallback.
    if (hairChanged) preview();
  }
  function editBeardColor() {
    const draftProfile = draftNow();
    if (!draftProfile || colorInput.disabled || !HEX.test(colorInput.value)) return;
    // Follow the app's existing draft -> pSave -> save()/AppStore flow. Editing
    // a color never saves unrelated incomplete profile fields prematurely.
    draftProfile.beardColor = colorInput.value.toLowerCase();
    preview();
  }
  function stageBeardColorForSave() {
    const draftProfile = draftNow();
    if (draftProfile && colorInput && !colorInput.disabled && HEX.test(colorInput.value)) draftProfile.beardColor = colorInput.value.toLowerCase();
  }
  function installBeardControl() {
    const select = document.getElementById('pBeard');
    if (!select || document.getElementById('pBeardColor')) return;
    colorRow = document.createElement('div');
    colorRow.id = 'mirro-beard-color-row';
    const label = document.createElement('label');
    label.htmlFor = 'pBeardColor'; label.textContent = 'Колір бороди';
    colorInput = document.createElement('input');
    colorInput.id = 'pBeardColor'; colorInput.type = 'color';
    colorInput.setAttribute('aria-label', 'Колір бороди');
    colorInput.style.cssText = 'width:100%;height:44px;padding:4px;cursor:pointer';
    colorHint = document.createElement('small');
    colorHint.id = 'mirro-beard-color-hint'; colorHint.className = 'muted';
    colorHint.style.cssText = 'display:block;font-size:11px;margin-top:5px';
    colorInput.setAttribute('aria-describedby', colorHint.id);
    colorRow.append(label, colorInput, colorHint);
    select.parentElement.append(colorRow);
    colorInput.addEventListener('input', editBeardColor);
    for (const id of ['pSex', 'pHairStyle', 'pBeard']) {
      const input = document.getElementById(id);
      if (input) { input.addEventListener('input', syncBeardColor); watchedSelects.push(input); }
    }
    saveButton = document.getElementById('pSave');
    if (saveButton) saveButton.addEventListener('click', stageBeardColorForSave, true);
    for (const name of ['renderProfile', 'profPreview']) {
      if (typeof window[name] !== 'function') continue;
      originals[name] = window[name];
      wrappers[name] = function () {
        const result = originals[name].apply(this, arguments);
        if (name === 'renderProfile') syncHairstyles(true);
        syncBeardColor();
        return result;
      };
      window[name] = wrappers[name];
    }
    syncHairstyles(true); syncBeardColor();
    // Mirro: relabel the added hairstyles when the interface language changes
    if (typeof MutationObserver === 'function') new MutationObserver(() => { syncHairstyles(); syncBeardColor(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  function canInstall() {
    return ['drawAvatar', 'drawHairBack', 'drawHairFront', 'drawFace'].every(name => typeof window[name] === 'function') &&
      window.MirroAppearance && typeof window.MirroAppearance.getHeadCanvas === 'function';
  }
  function install() {
    if (installed) return true;
    if (!canInstall()) return false;
    installHeadHooks(); installBeardControl(); installed = true;
    Promise.resolve(window.MirroAppearance.ready).then(() => {
      if (!installed || stopped) return;
      try {
        // The host may use reduced motion and therefore draw only once before
        // images decode. Refresh that existing view once; do not start a loop.
        if (typeof curTab !== 'undefined' && curTab === 'tabProfile') preview();
        else if (typeof AV_STATE !== 'undefined' && AV_STATE && typeof drawAvatar === 'function') drawAvatar(AV_STATE.w, AV_STATE.tone);
        const shop = document.getElementById('shop');
        if (shop && !shop.classList.contains('hidden') && typeof renderShop === 'function') renderShop();
      } catch (error) { /* Unsupported host revisions keep their current drawing. */ }
    }, () => {});
    resolveReady(true);
    return true;
  }
  function waitForApp() {
    if (stopped || install()) return;
    if (++tries >= 300) { resolveReady(false); return; }
    timer = setTimeout(waitForApp, 50);
  }
  function uninstall() {
    stopped = true; clearTimeout(timer);
    for (const name of Object.keys(wrappers)) if (window[name] === wrappers[name]) window[name] = originals[name];
    if (saveButton) saveButton.removeEventListener('click', stageBeardColorForSave, true);
    if (colorInput) colorInput.removeEventListener('input', editBeardColor);
    for (const input of watchedSelects) input.removeEventListener('input', syncBeardColor);
    watchedSelects.length = 0;
    if (colorRow) colorRow.remove();
    cache.clear(); activeHead = null; installed = false;
    resolveReady(false);
  }

  window.MirroSiteAdapter = {
    ready, install, uninstall, isInstalled: () => installed, mapStyle,
    // The optional body patcher uses this after drawHairBack prepared the
    // decoded portrait, before painting the old vector ears/head underneath.
    hasActiveHeadPlan: () => !!(installed && activeHead && activeHead.image),
  };
  waitForApp();
})();
