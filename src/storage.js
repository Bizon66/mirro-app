/* Durable storage + native bridges.
 * Copyright (c) 2026 the app's author. All rights reserved. Proprietary; see LICENSE.
 *
 * The app keeps its data in localStorage (fast, synchronous). That alone is fragile: a browser can evict it,
 * and a phone WebView can lose it under storage pressure. So every save is mirrored:
 *   - in the phone app: to a file in the app's private data folder (Capacitor Filesystem)
 *   - in a browser:     to IndexedDB, and the browser is asked to keep storage persistent
 * On start, whichever copy is newer (by savedAt) wins, then app.js is loaded.
 */
(function () {
  'use strict';
  var KEY = 'dvijnyk.v1', FILE = 'dvijnyk-data-a.json', TMP = 'dvijnyk-data-b.json';
  var cap = window.Capacitor;
  var native = !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
  var plug = function (name) { return native && cap.Plugins ? cap.Plugins[name] : null; };
  var FS = plug('Filesystem');

  function savedAt(json) { try { return (JSON.parse(json) || {}).savedAt || 0; } catch (e) { return -1; } }
  function lsGet() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function lsSet(v) { try { localStorage.setItem(KEY, v); return true; } catch (e) { return false; } }

  // ---- IndexedDB (browser) ----
  function idb() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) return rej(new Error('no idb'));
      var r = indexedDB.open('dvijnyk', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function idbGet() {
    return idb().then(function (db) {
      return new Promise(function (res) {
        var q = db.transaction('kv', 'readonly').objectStore('kv').get(KEY);
        q.onsuccess = function () { res(q.result || null); }; q.onerror = function () { res(null); };
      });
    });
  }
  function idbPut(v) {
    return idb().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, KEY);
        tx.oncomplete = function () { res(); }; tx.onerror = function () { rej(tx.error); };
      });
    });
  }

  // ---- file in the app's private folder (phone) ----
  // two slots written in turn: a crash mid-write can spoil at most the slot being written,
  // and on start the newest slot that still parses wins
  var slot = 0;
  function fileGet() {
    var read = function (p) { return FS.readFile({ path: p, directory: 'DATA', encoding: 'utf8' }).then(function (r) { return r.data; }, function () { return null; }); };
    return Promise.all([read(FILE), read(TMP)]).then(function (v) {
      var a = savedAt(v[0] || ''), b = savedAt(v[1] || '');
      if (a <= 0 && b <= 0) return null;
      slot = a >= b ? 1 : 0; // next write goes to the older slot
      return a >= b ? v[0] : v[1];
    });
  }
  function filePut(v) {
    var p = slot ? TMP : FILE;
    return FS.writeFile({ path: p, data: v, directory: 'DATA', encoding: 'utf8' }).then(function () { slot = 1 - slot; });
  }

  var mirrorGet = FS ? fileGet : idbGet, mirrorPut = FS ? filePut : idbPut;
  var pending = null, timer = 0, failedOnce = false;
  function flush() {
    clearTimeout(timer); timer = 0;
    if (pending == null) return Promise.resolve();
    var v = pending; pending = null;
    return mirrorPut(v).then(function () { failedOnce = false; }, function () {
      if (!failedOnce && typeof window.toast === 'function') {
        var L = document.documentElement.lang || 'en';
        window.toast({ uk: '⚠️ Не вдалося зберегти копію даних', cs: '⚠️ Nepodařilo se uložit zálohu dat', en: "⚠️ Couldn't save a copy of your data" }[L] || "⚠️ Couldn't save");
      }
      failedOnce = true;
    });
  }
  window.AppStore = {
    mirror: function (json) { pending = json; if (!timer) timer = setTimeout(flush, 300); },
    flush: flush
  };
  // write right away when the app goes to the background — phones may kill it there
  document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });
  window.addEventListener('pagehide', flush);

  // ---- native helpers used by app.js ----
  if (native) {
    var Share = plug('Share'), App = plug('App');
    // same shape as Claude's downloads API: save({ filename, data })
    window.AppFiles = {
      save: function (o) {
        return FS.writeFile({ path: o.filename, data: o.data, directory: 'CACHE', encoding: 'utf8' })
          .then(function (w) { return Share.share({ title: o.filename, files: [w.uri] }); })
          .catch(function (e) {
            var m = String((e && (e.message || e.code)) || '');
            if (/cancel/i.test(m)) { var err = new Error('cancelled'); err.code = 'cancelled'; throw err; }
            throw e;
          });
      }
    };
    window.AppNative = {
      onBack: function (fn) { if (App) App.addListener('backButton', function () { fn(); }); },
      exit: function () { if (App) App.exitApp(); }
    };
    if (App) App.addListener('pause', function () { flush(); });
  }

  // ---- boot: restore from the mirror if it is newer, then start the app ----
  function start() {
    try { var th = (JSON.parse(window.AppStore.boot || '{}') || {}).theme; if (th === 'blue' || th === 'dark') document.documentElement.setAttribute('data-theme', th); } catch (e) {}
    var s = document.createElement('script'); s.src = 'app.js'; document.body.appendChild(s);
  }
  var guard = new Promise(function (res) { setTimeout(function () { res(null); }, 2500); }); // never block start for long
  Promise.race([mirrorGet().catch(function () { return null; }), guard]).then(function (m) {
    var ls = lsGet();
    if (m && savedAt(m) > 0 && (!ls || savedAt(m) > savedAt(ls))) { lsSet(m); window.AppStore.boot = m; }
    else { window.AppStore.boot = ls; if (ls && !m) window.AppStore.mirror(ls); } // first run with the mirror: copy data into it
  }).then(start, start);

  if (!native) {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
    }
  }
})();
