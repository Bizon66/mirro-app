/* Mirro changes: bigger bowl/bed/pond, parrot keeps the app's stand. */
/* Optional visual adapter for the existing Mirro in-app companions.
 * It changes drawing only. Ownership, prices, feeds, points and petStage stay
 * in the host application. Load as a classic external script. MIT. */
(function () {
  'use strict';
  if (window.MirroCompanionsSiteAdapter) return;
  const SPECIES = { pet_dog: 'dog', pet_cat: 'cat', pet_hamster: 'hamster', pet_rabbit: 'rabbit', pet_turtle: 'turtle', pet_parrot: 'parrot' };
  const ANIMAL_BOXES = {
    dog: [44, 40], cat: [40, 40], hamster: [30, 28],
    rabbit: [40, 46], turtle: [44, 24], parrot: [30, 40],
  };
  const HOUSE_BOXES = { dog: [27, 25], cat: [26, 24], hamster: [32, 28], rabbit: [42, 28] };
  // door of the new pictures, in the host's mirrored house units (x is flipped there)
  const HOUSE_EYES = { dog: [0, -5.5], cat: [0, -6.5], hamster: [2.2, -9], rabbit: [1.9, -7.5] };
  const SPOT_BOXES = { dog: [46, 14], cat: [46, 14], rabbit: [40, 10], turtle: [46, 18] };
  const SPOT_SUPPORT = { dog: 3, cat: 3, hamster: 2.4, rabbit: 0, turtle: 5.6 };
  const originals = {}, wrappers = {}, propCache = new Map();
  let installed = false, stopped = false, timer = 0, attempts = 0;
  let resolveReady;
  const ready = new Promise(resolve => { resolveReady = resolve; });

  function stageFromFeeds(feeds) {
    const value = Math.max(0, Number(feeds) || 0);
    return value < 5 ? 0 : value < 15 ? 1 : value < 30 ? 2 : 3;
  }
  function visualStage(petId) {
    try { return stageFromFeeds(typeof D !== 'undefined' && D.pets && D.pets[petId] && D.pets[petId].feeds); }
    catch (error) { return 0; }
  }
  function reducedMotion() {
    try { return typeof REDUCED !== 'undefined' ? !!REDUCED : !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
    catch (error) { return true; }
  }
  function available(method) {
    const core = window.MirroCompanions;
    return !stopped && core && typeof core.isReady === 'function' && core.isReady() && typeof core[method] === 'function' ? core : null;
  }
  function unitScale(unit) {
    if (typeof unit !== 'function') return 0;
    const value = Number(unit(1));
    return Number.isFinite(value) && value > 0 ? value : 0;
  }
  function inside(petId) {
    try { return typeof petInside === 'function' && petInside(petId); }
    catch (error) { return true; }
  }
  function specialAnimalPose(petId, options) {
    // These poses change silhouette/position beyond the bitmap rig. Keep the
    // host's original shell retraction and flight until they have matching art.
    return !!(options && (options.tuck || options.fly));
  }
  function sceneTime(time) {
    // drawPetScene speeds its legacy oscillator up by 1.8 during reactions.
    // The new motion sampler needs one monotonic scene clock instead.
    try { if (typeof AV_T !== 'undefined' && Number.isFinite(AV_T)) return AV_T; }
    catch (error) { /* Fall back for previews without the native clock. */ }
    return Number(time) || 0;
  }
  function motionFor(petId, time, options) {
    const result = { action: 'idle', actionStart: time };
    if (options && options.sleep) return { action: 'sleep', actionStart: time };
    try {
      // PET_HEART is a native countdown, set only after confirmed feeding or
      // treats. Sampling it never calls feedPet/petData or changes counters.
      if (typeof PET_HEART !== 'undefined' && PET_HEART > 0) {
        return { action: 'eat', actionStart: time - Math.max(0, 2.5 - PET_HEART) * 2.4 / 2.5 };
      }
      if (typeof PET_RT !== 'undefined' && PET_RT && PET_RT.act === petId && Number.isFinite(PET_RT.t0)) {
        const name = PET_RT.actName;
        const durations = { bark: 2.2, purr: 2.4, hop: 1.6, wheel: 6, talk: 2.4 };
        const duration = durations[name];
        const elapsed = time - PET_RT.t0;
        if (duration && elapsed >= 0 && elapsed < duration) {
          // Fit the short reaction to the host's action window. The host still
          // owns rabbit hops, wheel position, bubbles and all hit rectangles.
          return { action: 'happy', actionStart: time - elapsed * 1.8 / duration };
        }
      }
      // Read only an existing record; never call the initializing petData().
      const record = typeof D !== 'undefined' && D.pets && D.pets[petId];
      if (record && typeof todayStr === 'function' && typeof diffDays === 'function') {
        if (record.fed && diffDays(record.fed, todayStr()) > 1) return { action: 'sleep', actionStart: time };
      }
    } catch (error) { /* Unknown native state keeps the detailed idle pose. */ }
    return result;
  }

  function preparedProp(species, kind, isFed) {
    const core = available('drawProp');
    if (!core) return null;
    const key = `${species}:${kind}:${Boolean(isFed)}`;
    if (propCache.has(key)) return propCache.get(key);
    const image = document.createElement('canvas'); image.width = image.height = 256;
    const context = image.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    if (!core.drawProp(context, { species, kind, stage: 3, x: 0, y: 0, width: 256, height: 256, time: 0, reducedMotion: true, isFed: !!isFed })) return null;
    const pixels = context.getImageData(0, 0, 256, 256).data;
    let left = 256, top = 256, right = -1, bottom = -1;
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      if (pixels[(y * 256 + x) * 4 + 3] < 4) continue;
      left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
    if (right < left || bottom < top) return null;
    const result = { image, left, top, width: right - left + 1, height: bottom - top + 1 };
    propCache.set(key, result);
    if (propCache.size > 24) propCache.delete(propCache.keys().next().value);
    return result;
  }
  function paintProp(species, kind, cx, groundY, width, height, mirror, options = {}) {
    if (!(width > 0 && height > 0)) return false;
    try {
      const prop = preparedProp(species, kind, options.isFed);
      if (!prop) return false;
      const scale = Math.min(width / prop.width, height / prop.height);
      const drawWidth = options.stretch ? width : prop.width * scale;
      const drawHeight = options.stretch ? height : prop.height * scale;
      ctx.save();
      try {
        ctx.translate(cx, groundY);
        if (mirror) ctx.scale(-1, 1);
        ctx.drawImage(prop.image, prop.left, prop.top, prop.width, prop.height, -drawWidth / 2, -drawHeight, drawWidth, drawHeight);
      } finally { ctx.restore(); }
      return true;
    } catch (error) { return false; }
  }


  // dog / cat: a flat round mat (as in the owner's picture), drawn in code so it stays flat and wide
  const MAT = { dog: ['#3E5C9A', '#2B4378', '#F3E6C8', 'bone', 19], cat: ['#D9868F', '#B5626C', '#FCEFEA', 'paw', 19],
    rabbit: ['#7CC05E', '#4E8E3A', '#3F7A2E', 'grass', 18], hamster: ['#EBCB6E', '#C49A3C', '#A97F2A', 'hay', 12.5] };
  function drawMat(species, cx, groundY, unit, grow) {
    const [top, side, deco, kind, size] = MAT[species];
    const rx = unit(size) * grow, ry = rx * 0.27, th = Math.max(1, unit(1.3) * grow), cy = groundY - th;
    ctx.save();
    ctx.fillStyle = 'rgba(27,42,74,.16)'; ctx.beginPath(); ctx.ellipse(cx, groundY + th * 0.3, rx * 1.04, ry * 1.05, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = side; ctx.beginPath(); ctx.ellipse(cx, cy + th, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(cx - rx, cy, rx * 2, th);
    const g = ctx.createRadialGradient(cx - rx * 0.2, cy - ry * 0.4, rx * 0.1, cx, cy, rx);
    g.addColorStop(0, top); g.addColorStop(1, side);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    if (kind === 'grass' || kind === 'hay') {
      // grass blades / straws spread over the mat, a few sticking out of the edge
      ctx.lineCap = 'round';
      const n = kind === 'grass' ? 34 : 46;
      for (let i = 0; i < n; i++) {
        const a = (i * 2.399) % (Math.PI * 2), r = Math.sqrt(((i * 0.618) % 1)) * 0.98;
        const px = cx + Math.cos(a) * rx * r, py = cy + Math.sin(a) * ry * r;
        ctx.strokeStyle = i % 3 ? deco : top; ctx.lineWidth = Math.max(0.6, rx * (kind === 'grass' ? 0.035 : 0.03));
        ctx.beginPath(); ctx.moveTo(px, py);
        if (kind === 'grass') { const hgt = rx * (0.12 + 0.1 * ((i * 0.37) % 1)); ctx.quadraticCurveTo(px + rx * 0.02, py - hgt * 0.6, px + rx * 0.05 * Math.sin(i), py - hgt); }
        else { const d = rx * 0.22, t = a + 1.3 * Math.sin(i * 1.7); ctx.lineTo(px + Math.cos(t) * d, py + Math.sin(t) * d * 0.35 - rx * 0.03); }
        ctx.stroke();
      }
      if (kind === 'grass') {   // two small clovers
        ctx.fillStyle = '#9ED67F';
        [[-0.45, 0.1], [0.5, -0.2]].forEach(([u, v]) => [0, 2.1, 4.2].forEach(q => { ctx.beginPath(); ctx.ellipse(cx + u * rx + Math.cos(q) * rx * 0.05, cy + v * ry + Math.sin(q) * rx * 0.025, rx * 0.05, rx * 0.03, q, 0, Math.PI * 2); ctx.fill(); }));
      }
      ctx.restore();
      return th / unit(1);
    }
    ctx.strokeStyle = deco; ctx.globalAlpha = 0.55; ctx.lineWidth = Math.max(0.6, rx * 0.018); ctx.setLineDash([rx * 0.05, rx * 0.035]);
    ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.9, ry * 0.86, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.fillStyle = deco;
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * 2 * i / 7 + 0.35, px = cx + Math.cos(a) * rx * 0.7, py = cy + Math.sin(a) * ry * 0.66, sz = rx * 0.085;
      ctx.save(); ctx.translate(px, py); ctx.scale(1, 0.42); ctx.rotate(a + Math.PI / 2);
      if (kind === 'bone') {
        ctx.fillRect(-sz, -sz * 0.22, sz * 2, sz * 0.44);
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([u, v]) => { ctx.beginPath(); ctx.arc(u * sz, v * sz * 0.28, sz * 0.3, 0, Math.PI * 2); ctx.fill(); });
      } else {
        ctx.beginPath(); ctx.ellipse(0, sz * 0.25, sz * 0.5, sz * 0.42, 0, 0, Math.PI * 2); ctx.fill();
        [[-0.55, -0.45], [-0.2, -0.75], [0.2, -0.75], [0.55, -0.45]].forEach(([u, v]) => { ctx.beginPath(); ctx.arc(u * sz, v * sz, sz * 0.2, 0, Math.PI * 2); ctx.fill(); });
      }
      ctx.restore();
    }
    ctx.restore();
    return th / unit(1);
  }
  function hook(name, wrapper) {
    if (typeof window[name] !== 'function') return;
    originals[name] = window[name]; wrappers[name] = wrapper; window[name] = wrapper;
  }
  function installHooks() {
    hook('drawPetV2', function (petId, cx, groundY, unit, time, options) {
      const species = SPECIES[petId], core = available('drawPet'), scale = unitScale(unit);
      if (!species || !core || !scale || specialAnimalPose(petId, options)) return originals.drawPetV2.apply(this, arguments);
      const [w, h] = ANIMAL_BOXES[species];
      const clock = sceneTime(time), motion = motionFor(petId, clock, options);
      let painted = false;
      try {
        ctx.save();
        try {
          ctx.translate(cx, groundY);
          if (options && options.stand) ctx.scale(-1, 1);
          // unit is layout scale only. Core applies its own four growth sizes;
          // do not multiply by the host's three-stage PET_SCALE a second time.
          const tailOffset = species === 'parrot' ? scale * 8 : 0;
          painted = core.drawPet(ctx, { species, stage: visualStage(petId), x: -w * scale / 2, y: tailOffset - h * scale,
            width: w * scale, height: h * scale, time: clock, ...motion, reducedMotion: reducedMotion() });
          // Keep the host's all-day treat indicator without changing its data
          // or hiding the detailed pet for the remainder of the day.
          const record = typeof D !== 'undefined' && D.pets && D.pets[petId];
          const growth = [.5, .66, .82, 1][visualStage(petId)];
          const transientHeart = typeof PET_HEART !== 'undefined' ? PET_HEART : 0;
          if (painted && transientHeart > 0) {
            ctx.save();
            ctx.globalAlpha *= Math.min(1, transientHeart);
            ctx.font = `${Math.max(9, 11 * scale * growth)}px system-ui`;
            ctx.textAlign = 'center';
            ctx.fillText('❤️', 0, tailOffset - h * scale * growth - scale * (2 + 8 * (2.5 - transientHeart)));
            ctx.restore();
          } else if (painted && record && motion.action !== 'sleep' && typeof todayStr === 'function' && record.treat === todayStr()) {
            const float = reducedMotion() ? 0 : Math.sin(clock * 3) * scale * 2;
            ctx.save();
            ctx.font = `${Math.max(7, 7 * scale * growth)}px system-ui`;
            ctx.textAlign = 'center';
            ctx.fillText('❤️', w * scale * .22, tailOffset - h * scale * growth - scale * 2 + float);
            ctx.restore();
          }
          if (painted && motion.action === 'sleep') {
            ctx.save();
            ctx.fillStyle = '#7D8794'; ctx.textAlign = 'center';
            ctx.font = `bold ${Math.max(7, 8 * scale * growth)}px system-ui`;
            ctx.fillText('z', w * scale * growth * .23, tailOffset - h * scale * growth * .85);
            ctx.font = `bold ${Math.max(5, 6 * scale * growth)}px system-ui`;
            ctx.fillText('z', w * scale * growth * .36, tailOffset - h * scale * growth);
            ctx.restore();
          }
        } finally { ctx.restore(); }
      } catch (error) { painted = false; }
      if (!painted) return originals.drawPetV2.apply(this, arguments);
    });
    hook('drawBowl', function (petId, cx, groundY, unit, isFed) {
      const species = SPECIES[petId], scale = unitScale(unit);
      // The generated bowl contains food. Preserve the actual empty bowl until
      // the host confirms today's feeding; no free food or extra counter.
      if (!species || !scale || !isFed || !paintProp(species, 'bowl', cx, groundY, scale * 17, scale * 8, false, { isFed: true })) return originals.drawBowl.apply(this, arguments);
      return [cx - unit(9), groundY - unit(9), cx + unit(9), groundY + unit(1.5)];
    });
    hook('drawPetSpot', function (petId, cx, groundY, unit, mirror) {
      const species = SPECIES[petId], size = SPOT_BOXES[species], scale = unitScale(unit);
      // Hamster's new "bed" asset is its wheel, not the hay nest underneath it.
      // The wheel is replaced separately by drawWheel, avoiding a duplicate.
      // the mat grows with the pet (same four stages as the picture)
      const grow = [.6, .74, .88, 1][visualStage(petId)];
      if (species === 'rabbit') return 0;   // the rabbit sits right on its lawn strip
      if (MAT[species] && scale) { try { return drawMat(species, cx, groundY, unit, grow); } catch (error) { /* fall through */ } }
      if (!size || !scale || !paintProp(species, 'bed', cx, groundY, unit(size[0] * grow), unit(size[1] * grow), mirror)) return originals.drawPetSpot.apply(this, arguments);
      return SPOT_SUPPORT[species] * grow;
    });
    hook('drawPetHouse', function (petId, cx, groundY, unit, mirror) {
      const species = SPECIES[petId], size = HOUSE_BOXES[species], scale = unitScale(unit);
      // Retain the original house while the animal is inside: its precise door
      // coordinates are used by the host to draw peeking/sleeping eyes.
      if (!size || !scale || !paintProp(species, 'home', cx, groundY, unit(size[0]), unit(size[1]), false)) return originals.drawPetHouse.apply(this, arguments);
      return [...HOUSE_EYES[species]];
    });
    hook('drawPond', function (cx, groundY, unit, time, mirror) {
      const scale = unitScale(unit);
      if (!scale || !paintProp('turtle', 'home', cx, groundY + unit(3.7), unit(84), unit(40), mirror)) return originals.drawPond.apply(this, arguments);
      return [1, 13];   // the water: centre x offset and water line height above the floor, in units
    });
    hook('drawWheel', function (cx, groundY, unit, time, running) {
      const scale = unitScale(unit);
      if (!scale || running || !paintProp('hamster', 'bed', cx, groundY + unit(1), unit(28), unit(30), false)) return originals.drawWheel.apply(this, arguments);
    });
    if (false) hook('drawParrotStand', function (cx, groundY, perchY, unit) {
      const scale = unitScale(unit);
      const height = groundY - perchY + unit(1.2);
      // This prop must connect the existing perch to the floor. A calibrated
      // stretch preserves those two anchors instead of leaving a floating bird.
      if (!scale || !(height > 0) || !paintProp('parrot', 'home', cx, groundY, unit(22), height, false, { stretch: true })) return originals.drawParrotStand.apply(this, arguments);
    });
  }
  function refreshOnce() {
    if (!installed || stopped) return;
    try {
      if (typeof curTab !== 'undefined' && curTab === 'tabProfile' && typeof profPreview === 'function') profPreview();
      else if (typeof AV_STATE !== 'undefined' && AV_STATE && typeof drawAvatar === 'function') drawAvatar(AV_STATE.w, AV_STATE.tone);
      const shop = document.getElementById('shop');
      if (shop && !shop.classList.contains('hidden') && typeof renderShop === 'function') renderShop();
    } catch (error) { /* Unknown host revisions keep their existing rendering. */ }
  }
  function install() {
    if (installed) return true;
    if (!window.MirroCompanions || typeof window.drawPetV2 !== 'function') return false;
    stopped = false; installHooks(); installed = true;
    Promise.resolve(window.MirroCompanions.ready).then(refreshOnce, () => {});
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
    propCache.clear(); installed = false; resolveReady(false);
  }
  window.MirroCompanionsSiteAdapter = { ready, install, uninstall, isInstalled: () => installed, stageFromFeeds, visualStage };
  waitForApp();
})();
