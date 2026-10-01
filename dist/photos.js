"use strict";

// Photos — Google Photos favorites picker as a binder view.
// Port of the standalone gphotos-picker page: slot-first assignment,
// random auto-assign within date ranges, one-button pick flow with
// auto-polling, sessionStorage token persistence, and in-page zip export.
// Google OAuth (implicit flow): tokens live ~1h, never renewed in the
// background — a 401 just means "press Pick photos" again.

(function () {
  const DEFAULT_ID = '745260746303-bvf9rc8abdmjssd64cgns1lm4hb91hmp.apps.googleusercontent.com';
  const SCOPES = 'https://www.googleapis.com/auth/photospicker.mediaitems.readonly';
  const STORE_KEY = 'gphotos-picker-state-v1';
  const SEL_KEY = 'gphotos-picker-selected';
  const AUTH_KEY = 'gphotos-picker-auth';
  const FAVS_TTL_MS = 55 * 60 * 1000;
  const PICKS_TTL_MS = 7 * 24 * 3600 * 1000;
  function addDays(iso, n) {
    const p = iso.split('-').map(Number);
    const d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n));
    return d.toISOString().slice(0, 10);
  }
  function fmtRange(s, e) {
    return s.slice(5).replace('-', '/') + ' – ' + e.slice(5).replace('-', '/');
  }
  function pl(n, w) {
    return n + ' ' + w + (n === 1 ? '' : 's');
  }
  function slug(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'photo';
  }
  function extFor(mime) {
    mime = String(mime || '');
    if (mime.includes('png')) return 'png';
    if (mime.includes('webp')) return 'webp';
    if (mime.includes('mp4')) return 'mp4';
    if (mime.indexOf('video/') === 0) return 'mov';
    return 'jpg';
  }
  function slots() {
    const out = [];
    const wanted = ['brasil', 'toronto', 'athens', 'turkey'];
    window.TRIP.chapters.filter(c => wanted.includes(c.id)).forEach(c => {
      out.push({
        key: c.id + '::__chapter',
        chapter: c.id,
        chapterTitle: c.title,
        chapterCountry: c.country,
        flag: c.flag || '',
        type: 'chapter',
        name: c.title + ' (chapter cover)',
        short: c.title,
        start: c.start,
        end: c.end
      });
      let off = 0;
      (c.places || []).forEach(p => {
        if (c.id === 'turkey' && p.name === 'Istanbul') return;
        const s = addDays(c.start, off);
        const e = addDays(c.start, off + (p.days || 1) - 1);
        out.push({
          key: c.id + '::' + p.name,
          chapter: c.id,
          chapterTitle: c.title,
          chapterCountry: c.country,
          flag: c.flag || '',
          type: 'place',
          name: p.name,
          short: p.name,
          start: s,
          end: e,
          query: p.query
        });
        off += p.days || 0;
      });
    });
    return out;
  }
  function slotByKey(key) {
    return slots().find(s => s.key === key);
  }
  function itemDate(m) {
    return (m.createTime || '').slice(0, 10);
  }
  function itemName(m) {
    return m.mediaFile && m.mediaFile.filename || '';
  }
  function itemBase(m) {
    return m.mediaFile && m.mediaFile.baseUrl || '';
  }
  function itemThumb(m) {
    const b = itemBase(m);
    return b ? b + '=w400-h300-c' : '';
  }
  function candidatesFor(all, slotKey, excludeIds) {
    const sl = slotByKey(slotKey);
    if (!sl) return [];
    const ex = excludeIds ? new Set(excludeIds) : new Set();
    return all.filter(m => {
      const d = itemDate(m);
      return d && sl.start <= d && d <= sl.end && !ex.has(m.id);
    });
  }
  function prunePicks(p, items) {
    const ids = new Set((items || []).map(m => m.id));
    const out = {};
    Object.keys(p || {}).forEach(k => {
      if (p[k] && p[k].id && ids.has(p[k].id)) out[k] = p[k];
    });
    return out;
  }
  function prunePicksToSlots(p) {
    const valid = new Set(slots().map(x => x.key));
    const out = {};
    Object.keys(p || {}).forEach(k => {
      if (valid.has(k) && p[k] && p[k].id) out[k] = p[k];
    });
    return out;
  }
  function loadStateRaw() {
    try {
      const r = localStorage.getItem(STORE_KEY);
      return r ? JSON.parse(r) : null;
    } catch {
      return null;
    }
  }
  function PhotosView() {
    const [favs, setFavs] = React.useState([]);
    const [picks, setPicks] = React.useState({});
    const [thumbs, setThumbs] = React.useState({});
    const [sel, setSel] = React.useState(null);
    const [status, setStatus] = React.useState('');
    const [connected, setConnected] = React.useState(false);
    const [pickUi, setPickUi] = React.useState('idle'); // idle | awaiting | ready
    const [working, setWorking] = React.useState(false);

    // Mutable flow state — never drives rendering directly.
    const R = React.useRef(null);
    if (!R.current) R.current = {
      token: null,
      expiresAt: 0,
      sessionId: null,
      pickerUri: null,
      busy: false,
      pollBusy: false,
      warned: false
    };
    const favsRef = React.useRef(favs);
    favsRef.current = favs;
    const picksRef = React.useRef(picks);
    picksRef.current = picks;
    const selRef = React.useRef(sel);
    selRef.current = sel;
    const uiRef = React.useRef(pickUi);
    uiRef.current = pickUi;
    const cid = window.SABBATICAL_CALENDAR_CLIENT_ID || DEFAULT_ID;

    // ---- persistence ----
    function persist(next) {
      try {
        const cur = loadStateRaw() || {};
        localStorage.setItem(STORE_KEY, JSON.stringify({
          v: 1,
          savedAt: new Date().toISOString(),
          favsAt: next.favsAt !== undefined ? next.favsAt : cur.favsAt || null,
          sessionId: next.sessionId !== undefined ? next.sessionId : R.current.sessionId,
          pickerUri: next.pickerUri !== undefined ? next.pickerUri : R.current.pickerUri,
          allFavs: next.allFavs !== undefined ? next.allFavs : favsRef.current,
          picks: next.picks !== undefined ? next.picks : picksRef.current
        }));
      } catch {}
    }
    function persistSession() {
      try {
        localStorage.setItem('gphotos-session', JSON.stringify({
          sessionId: R.current.sessionId,
          at: new Date().toISOString()
        }));
      } catch {}
    }

    // ---- auth ----
    function getToken() {
      return new Promise((res, rej) => {
        try {
          if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
            rej(new Error('gsi-missing'));
            return;
          }
          const tc = window.google.accounts.oauth2.initTokenClient({
            client_id: cid,
            scope: SCOPES,
            callback: r => r && r.access_token ? res(r) : rej(new Error('auth-denied')),
            error_callback: () => rej(new Error('auth-denied'))
          });
          tc.requestAccessToken({
            prompt: ''
          });
        } catch (e) {
          rej(e);
        }
      });
    }
    function setToken(resp) {
      R.current.token = resp.access_token;
      R.current.expiresAt = Date.now() + (resp && resp.expires_in || 3600) * 1000;
      R.current.warned = false;
      try {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify({
          token: R.current.token,
          expiresAt: R.current.expiresAt
        }));
      } catch {}
    }
    function tokenUsable() {
      return !!R.current.token && Date.now() < R.current.expiresAt - 60000;
    }
    function onAuthLost() {
      R.current.token = null;
      R.current.expiresAt = 0;
      try {
        sessionStorage.removeItem(AUTH_KEY);
      } catch {}
      setConnected(false);
      setStatus('Google sign-in expired — press Pick photos to reconnect. Your slots are saved.');
    }
    async function authedFetch(url, opts) {
      opts = opts || {};
      const r = await fetch(url, Object.assign({}, opts, {
        headers: Object.assign({}, opts.headers, {
          Authorization: 'Bearer ' + R.current.token
        })
      }));
      if (r.status !== 401) return r;
      onAuthLost();
      return null;
    }
    async function ensureToken() {
      if (tokenUsable()) return true;
      setStatus('Connecting to Google…');
      try {
        setToken(await getToken());
        setConnected(true);
        return true;
      } catch (e) {
        setStatus('Sign-in failed — allow popups, enable the Photos Picker API, and check the localhost origin.');
        return false;
      }
    }

    // ---- Google Picker API ----
    async function getSession() {
      try {
        const r = await authedFetch('https://photospicker.googleapis.com/v1/sessions/' + encodeURIComponent(R.current.sessionId));
        if (!r) return undefined;
        if (r.status === 404 || r.status === 410) return null;
        if (!r.ok) {
          setStatus('Could not reach Google (' + r.status + ') — retry.');
          return undefined;
        }
        return await r.json();
      } catch (e) {
        setStatus('Network error — retry.');
        return undefined;
      }
    }
    function openPickerTab() {
      if (!R.current.pickerUri) return false;
      let w = null;
      try {
        w = window.open(R.current.pickerUri, '_blank');
      } catch {
        w = null;
      }
      if (!w) {
        setStatus('Popup blocked — allow popups for this site, then press the pick button again. The session is ready.');
        return false;
      }
      return true;
    }
    async function createSession() {
      setStatus('Starting a pick session…');
      try {
        const r = await authedFetch('https://photospicker.googleapis.com/v1/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: '{}'
        });
        if (!r) return false;
        if (!r.ok) {
          setStatus('Could not start a session (' + r.status + ') — retry.');
          return false;
        }
        const j = await r.json();
        R.current.sessionId = j.id;
        R.current.pickerUri = j.pickerUri;
        persist({
          favsAt: (loadStateRaw() || {}).favsAt || null
        });
        persistSession();
        setPickUi('awaiting');
        if (openPickerTab()) setStatus('Choose favorites in the Google tab and click DONE — loading starts automatically (or press Load picked photos).');
        return true;
      } catch (e) {
        setStatus('Network error — retry.');
        return false;
      }
    }
    function autoAssign(all, prevPicks, fillEmpty) {
      const ordered = slots().slice().sort((a, b) => a.type === b.type ? 0 : a.type === 'place' ? -1 : 1);
      const next = fillEmpty ? {
        ...prevPicks
      } : {};
      const used = new Set(Object.values(next).map(p => p && p.id).filter(Boolean));
      let n = 0;
      ordered.forEach(sl => {
        if (fillEmpty && next[sl.key]) return;
        const c = candidatesFor(all, sl.key, used);
        if (!c.length) {
          if (!fillEmpty) delete next[sl.key];
          return;
        }
        const m = c[Math.floor(Math.random() * c.length)];
        next[sl.key] = {
          id: m.id,
          filename: itemName(m),
          creationTime: itemDate(m)
        };
        used.add(m.id);
        n++;
      });
      return {
        picks: next,
        n
      };
    }
    async function loadThumbs(all) {
      if (!all.length || !R.current.token) return;
      await Promise.all(all.map(async (m, i) => {
        if (R.current.thumbs[m.id]) return;
        try {
          const r = await authedFetch(itemThumb(m));
          if (!r) return;
          if (!r.ok) return;
          const blob = await r.blob();
          const url = URL.createObjectURL(blob);
          R.current.thumbs[m.id] = url;
          setThumbs(prev => prev[m.id] ? prev : {
            ...prev,
            [m.id]: url
          });
        } catch (e) {/* per-photo failure stays silent; slot shows no thumb */}
      }));
    }
    async function loadPicked() {
      setStatus('Loading your picks…');
      const fresh = [];
      let next = null;
      try {
        do {
          let url = 'https://photospicker.googleapis.com/v1/mediaItems?sessionId=' + encodeURIComponent(R.current.sessionId) + '&pageSize=100';
          if (next) url += '&pageToken=' + encodeURIComponent(next);
          const r = await authedFetch(url);
          if (!r) return; // auth lost (status set) — kept previous data
          if (r.status === 404 || r.status === 410) {
            setStatus('Session expired — press Pick photos to start over. Assignments kept.');
            return;
          }
          if (!r.ok) {
            setStatus('Load failed (' + r.status + ') — kept previous data.');
            return;
          }
          const j = await r.json();
          (j.mediaItems || []).forEach(m => fresh.push(m));
          next = j.nextPageToken || null;
        } while (next);
      } catch (e) {
        setStatus('Network error — kept previous data.');
        return;
      }
      Object.values(R.current.thumbs).forEach(u => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
      R.current.thumbs = {};
      setThumbs({});
      const before = Object.keys(picksRef.current).length;
      const kept = prunePicks(prunePicksToSlots(picksRef.current), fresh);
      const dropped = before - Object.keys(kept).length;
      const {
        picks: filledPicks,
        n: filled
      } = autoAssign(fresh, kept, true);
      setFavs(fresh);
      setPicks(filledPicks);
      persist({
        allFavs: fresh,
        picks: filledPicks,
        favsAt: new Date().toISOString()
      });
      persistSession();
      ensureSel(filledPicks);
      setPickUi('ready');
      await loadThumbs(fresh);
      setStatus('Loaded ' + fresh.length + ' picked — randomly filled ' + pl(filled, 'slot') + '.' + (dropped ? ' Cleared ' + pl(dropped, 'stale assignment') + '.' : ''));
    }
    async function onPick() {
      if (R.current.busy) return;
      R.current.busy = true;
      setWorking(true);
      try {
        if (!(await ensureToken())) return;
        // Awaiting an open picker: check whether DONE was clicked.
        if (uiRef.current === 'awaiting' && R.current.sessionId) {
          const s = await getSession();
          if (s === undefined) return;
          if (s === null) {
            await createSession();
            return;
          }
          if (!s.mediaItemsSet) {
            setPickUi('awaiting');
            if (openPickerTab()) setStatus('Choose favorites in the Google tab and click DONE — loading starts automatically (or press Load picked photos).');
            return;
          }
          await loadPicked();
          return;
        }
        // Otherwise (first run or "Pick more photos"): always open a fresh
        // Google picker so you can re-select. Old data stays until the new
        // load completes.
        await createSession();
      } finally {
        R.current.busy = false;
        setWorking(false);
      }
    }
    async function doExport() {
      if (!window.JSZip) {
        setStatus('Zip library failed to load — check your connection and retry.');
        return;
      }
      const all = slots();
      const ready = all.filter(x => picksRef.current[x.key]);
      const missing = all.filter(x => !picksRef.current[x.key]);
      const byId = new Map(favsRef.current.map(m => [m.id, m]));
      if (ready.some(s => !byId.has(picksRef.current[s.key].id))) {
        setStatus('Photos expired — press Pick photos to reload, then download again.');
        return;
      }
      const zip = new window.JSZip();
      const failed = [];
      let added = 0;
      for (let i = 0; i < ready.length; i++) {
        const s = ready[i];
        const m = byId.get(picksRef.current[s.key].id);
        const mime = m.mediaFile && m.mediaFile.mimeType || 'image/jpeg';
        const base = m.mediaFile && m.mediaFile.baseUrl || '';
        const param = mime.indexOf('video/') === 0 ? '=dv' : '=w2048-h1536-d';
        setStatus('Downloading ' + (i + 1) + '/' + ready.length + ' · ' + s.chapter + ' / ' + s.name + '…');
        try {
          const r = await authedFetch(base + param);
          if (!r) break; // signed out (status set) — the rest would fail too
          if (!r.ok) {
            failed.push(s.key + ' (' + r.status + ')');
            continue;
          }
          zip.file('extra-pictures/' + s.chapter + '/gphotos-' + slug(s.name) + '.' + extFor(mime), await r.arrayBuffer());
          added++;
        } catch (e) {
          failed.push(s.key + ' (network)');
        }
      }
      if (!added) {
        setStatus(failed.length ? 'Nothing downloaded — ' + failed.join(', ') : 'Nothing to download.');
        return;
      }
      setStatus('Compressing…');
      let blob;
      try {
        blob = await zip.generateAsync({
          type: 'blob'
        });
      } catch (e) {
        setStatus('Could not build the zip — retry.');
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sabbatical-photos.zip';
      a.click();
      setTimeout(() => {
        try {
          URL.revokeObjectURL(a.href);
        } catch {}
      }, 60000);
      setStatus(failed.length || missing.length ? 'Downloaded ' + added + '/' + ready.length + ' photos.' + (failed.length ? ' Failed: ' + failed.join(', ') + '.' : '') + (missing.length ? ' Empty: ' + pl(missing.length, 'slot') + '.' : '') : 'All ' + added + ' photos downloaded — unzip into the repo root.');
      if (missing.length) alert('Missing ' + missing.length + ' slots:\n' + missing.map(m => m.key).join('\n'));
    }

    // ---- selection ----
    function ensureSel(nextPicks) {
      const all = slots();
      let k = null;
      try {
        k = localStorage.getItem(SEL_KEY);
      } catch {}
      if (!k || !all.some(x => x.key === k)) k = all.length ? all[0].key : null;
      try {
        localStorage.setItem(SEL_KEY, k || '');
      } catch {}
      setSel(k);
    }
    function selectSlot(key) {
      setSel(key);
      try {
        localStorage.setItem(SEL_KEY, key || '');
      } catch {}
    }

    // ---- mount: restore saved state, resume polling ----
    React.useEffect(() => {
      try {
        const a = JSON.parse(sessionStorage.getItem(AUTH_KEY) || 'null');
        if (a && a.token && a.expiresAt && Date.now() < a.expiresAt - 60000) {
          R.current.token = a.token;
          R.current.expiresAt = a.expiresAt;
        }
      } catch {}
      let k = null;
      try {
        k = localStorage.getItem(SEL_KEY);
      } catch {}
      const all = slots();
      const initialSel = k && all.some(x => x.key === k) ? k : all.length ? all[0].key : null;
      setSel(initialSel);
      const s = loadStateRaw();
      if (s && typeof s === 'object' && s.sessionId && (Array.isArray(s.allFavs) || s.picks)) {
        const now = Date.now();
        const favsAge = s.favsAt ? now - new Date(s.favsAt).getTime() : Infinity;
        const savedAge = s.savedAt ? now - new Date(s.savedAt).getTime() : Infinity;
        const prunedToSlots = prunePicksToSlots(s.picks || {});
        if (savedAge <= PICKS_TTL_MS) {
          R.current.sessionId = s.sessionId || null;
          R.current.pickerUri = s.pickerUri || null;
          if (s.allFavs && s.allFavs.length && s.allFavs.every(m => m && m.id && (m.mediaFile || {}).baseUrl) && favsAge < FAVS_TTL_MS) {
            const kept = prunePicks(prunedToSlots, s.allFavs);
            setFavs(s.allFavs);
            setPicks(kept);
            setPickUi('ready');
            setStatus('Restored ' + s.allFavs.length + ' photos + ' + Object.keys(kept).length + ' assignments — press Pick photos to reconnect.');
          } else if (Object.keys(prunedToSlots).length) {
            setPicks(prunedToSlots);
            setPickUi('awaiting');
            setStatus('Cached photos expired (baseUrls ~60 min) — press Pick photos to reconnect and reload. ' + Object.keys(prunedToSlots).length + ' assignments kept.');
          } else if (R.current.sessionId) {
            setPickUi('awaiting');
            setStatus('Restored session — press Pick photos to continue.');
          }
        }
      }
      if (R.current.token && Date.now() < R.current.expiresAt - 60000) {
        setConnected(true);
        const restored = (loadStateRaw() || {}).allFavs || [];
        if (restored.length) {
          setStatus('Reconnected ✓ — reloading thumbnails…');
          loadThumbs(restored).then(() => setStatus('Reconnected ✓ — ' + restored.length + ' photos restored.'));
        }
      }
      const id = setInterval(pollTick, 5000);
      return () => {
        try {
          clearInterval(id);
        } catch {}
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    async function pollTick() {
      if (R.current.pollBusy || R.current.busy) return;
      if (uiRef.current !== 'awaiting' || !R.current.sessionId) return;
      if (document.hidden) return;
      if (!tokenUsable()) {
        if (!R.current.warned) {
          R.current.warned = true;
          setStatus('Connection paused — press Pick photos to reconnect (your picks are safe). Polling resumes after.');
        }
        return;
      }
      R.current.pollBusy = true;
      try {
        const s = await getSession();
        if (s === undefined) return;
        if (s === null) {
          setStatus('Session expired — press Pick photos to start over. Assignments kept.');
          return;
        }
        if (s.mediaItemsSet) await loadPicked();
      } finally {
        R.current.pollBusy = false;
      }
    }
    function shuffle() {
      if (!favsRef.current.length) {
        setStatus('Press Pick photos first to load your favorites.');
        return;
      }
      const ordered = slots().slice().sort((a, b) => a.type === b.type ? 0 : a.type === 'place' ? -1 : 1);
      const next = {};
      const used = new Set();
      let n = 0;
      ordered.forEach(sl => {
        const c = candidatesFor(favsRef.current, sl.key, used);
        if (!c.length) return;
        const m = c[Math.floor(Math.random() * c.length)];
        next[sl.key] = {
          id: m.id,
          filename: itemName(m),
          creationTime: itemDate(m)
        };
        used.add(m.id);
        n++;
      });
      setPicks(next);
      persist({
        picks: next
      });
      setStatus('Shuffled — randomly re-assigned ' + pl(n, 'slot') + ' within their date ranges.');
    }
    function clearSlot(key) {
      const next = {
        ...picksRef.current
      };
      delete next[key];
      setPicks(next);
      persist({
        picks: next
      });
    }
    function assignSelected(id) {
      const sl = slotByKey(selRef.current);
      const m = favsRef.current.find(x => x.id === id);
      if (!m || !sl) return;
      const next = {
        ...picksRef.current,
        [sl.key]: {
          id: m.id,
          filename: itemName(m),
          creationTime: itemDate(m)
        }
      };
      setPicks(next);
      persist({
        picks: next
      });
    }
    function resetSaved() {
      Object.values(R.current.thumbs).forEach(u => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
      R.current.thumbs = {};
      R.current.sessionId = null;
      R.current.pickerUri = null;
      clearAuthSafe();
      setFavs([]);
      setPicks({});
      setThumbs({});
      setPickUi('idle');
      try {
        localStorage.removeItem(STORE_KEY);
      } catch {}
      try {
        localStorage.removeItem(SEL_KEY);
      } catch {}
      ensureSel({});
      setStatus('Saved picker data cleared.');
    }
    function clearAuthSafe() {
      R.current.token = null;
      R.current.expiresAt = 0;
      try {
        sessionStorage.removeItem(AUTH_KEY);
      } catch {}
      setConnected(false);
    }

    // ---- render ----
    const all = slots();
    const groups = React.useMemo(() => {
      const gs = [];
      const seen = {};
      all.forEach(x => {
        if (!seen[x.chapter]) {
          seen[x.chapter] = {
            id: x.chapter,
            title: x.chapterTitle,
            country: x.chapterCountry,
            flag: x.flag,
            items: []
          };
          gs.push(seen[x.chapter]);
        }
        seen[x.chapter].items.push(x);
      });
      return gs;
    }, [all.length]);
    const sl = slotByKey(sel);
    const list = sl ? candidatesFor(favs, sl.key) : [];
    const doneN = Object.keys(picks).length;
    const pickLabel = working ? 'Working…' : pickUi === 'awaiting' ? 'Load picked photos' : favs.length ? 'Pick more photos' : 'Pick photos';
    return /*#__PURE__*/React.createElement("div", {
      className: "binder-pane"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-pane-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "\xA7 Traveled chapters \xB7 ", all.length, " slots"), /*#__PURE__*/React.createElement("h2", {
      className: "binder-pane-title"
    }, "Photos"), /*#__PURE__*/React.createElement("p", {
      className: "binder-pane-sub"
    }, "Pick favorites from Google Photos \u2014 one per stop \u2014 then download the zip.")), /*#__PURE__*/React.createElement("div", {
      className: "binder-pane-counter"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-pane-counter-big"
    }, doneN, /*#__PURE__*/React.createElement("span", null, "/", all.length)))), /*#__PURE__*/React.createElement("div", {
      className: "photos"
    }, /*#__PURE__*/React.createElement("div", {
      className: "picker-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn-primary btn-big",
      onClick: onPick,
      disabled: working
    }, pickLabel), /*#__PURE__*/React.createElement("button", {
      className: "btn-primary btn-big",
      onClick: doExport,
      disabled: !favs.length
    }, "Download zip", doneN ? ` (${doneN}/${all.length})` : ''), /*#__PURE__*/React.createElement("span", {
      className: `conn-pill${connected ? ' is-on' : ''}`
    }, connected ? 'Connected' : 'Not connected')), status && /*#__PURE__*/React.createElement("div", {
      className: "picker-status"
    }, status), /*#__PURE__*/React.createElement("div", {
      className: "picker-layout"
    }, /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
      className: "picker-section-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "section-head-num"
    }, "01"), /*#__PURE__*/React.createElement("h2", null, "Slots"), /*#__PURE__*/React.createElement("button", {
      className: "pill-btn",
      onClick: shuffle,
      title: "Randomly re-assign all slots"
    }, "Shuffle"), /*#__PURE__*/React.createElement("span", {
      className: "picker-count"
    }, doneN, " / ", all.length, " assigned")), /*#__PURE__*/React.createElement("div", null, groups.map(g => {
      const gDone = g.items.filter(x => picks[x.key]).length;
      return /*#__PURE__*/React.createElement("div", {
        key: g.id,
        className: "chapter-block"
      }, /*#__PURE__*/React.createElement("div", {
        className: "chapter-block-head"
      }, /*#__PURE__*/React.createElement("span", {
        className: "chapter-block-flag"
      }, g.flag), /*#__PURE__*/React.createElement("span", {
        className: "chapter-block-title"
      }, g.country), /*#__PURE__*/React.createElement("span", {
        className: "chapter-block-dates"
      }, gDone, "/", g.items.length)), g.items.map(x => {
        const pk = picks[x.key];
        const n = candidatesFor(favs, x.key).length;
        const kicker = x.type === 'chapter' ? 'Chapter cover · ' + x.chapter.toUpperCase() : x.chapterCountry.toUpperCase() + ' · ' + fmtRange(x.start, x.end);
        return /*#__PURE__*/React.createElement("div", {
          key: x.key,
          className: `slot-row${pk ? ' is-filled' : ''}${x.key === sel ? ' is-selected' : ''}`,
          onClick: () => selectSlot(x.key)
        }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          className: "slot-kicker"
        }, kicker), /*#__PURE__*/React.createElement("div", {
          className: "slot-name"
        }, x.type === 'chapter' ? x.chapterTitle + ' — cover' : x.short), /*#__PURE__*/React.createElement("div", {
          className: "slot-dates"
        }, x.start, " \u2192 ", x.end, " \xB7 ", n, " photo", n === 1 ? '' : 's'), /*#__PURE__*/React.createElement("div", {
          className: "slot-pick"
        }, pk ? '✓ ' + pk.creationTime : 'Empty — select, then assign from the right')), /*#__PURE__*/React.createElement("div", {
          className: "slot-actions"
        }, pk && thumbs[pk.id] && /*#__PURE__*/React.createElement("img", {
          className: "slot-thumb",
          src: thumbs[pk.id],
          alt: ""
        }), pk && /*#__PURE__*/React.createElement("button", {
          className: "pill-btn",
          onClick: e => {
            e.stopPropagation();
            clearSlot(x.key);
          }
        }, "Clear")));
      }));
    }))), /*#__PURE__*/React.createElement("section", {
      className: "picker-favs"
    }, /*#__PURE__*/React.createElement("div", {
      className: "picker-section-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "section-head-num"
    }, "02"), /*#__PURE__*/React.createElement("h2", null, sl ? 'For: ' + (sl.type === 'chapter' ? sl.chapterTitle + ' — cover' : sl.short) : 'Picked photos'), /*#__PURE__*/React.createElement("span", {
      className: "picker-count"
    }, list.length, " of ", favs.length, " in range")), /*#__PURE__*/React.createElement("div", {
      className: "fav-grid"
    }, !sl ? null : !favs.length ? /*#__PURE__*/React.createElement("div", {
      className: "muted",
      style: {
        fontSize: 13
      }
    }, "No photos loaded yet \u2014 press Pick photos above.") : !list.length ? /*#__PURE__*/React.createElement("div", {
      className: "muted",
      style: {
        fontSize: 13
      }
    }, "No photos in ", sl.start, " \u2192 ", sl.end, ". Select another stop.") : list.map(m => {
      const i = favs.indexOf(m);
      const d = itemDate(m) || 'no date';
      const cur = picks[sl.key];
      const isCur = cur && cur.id === m.id;
      const usedElsewhere = !isCur && Object.keys(picks).some(k => picks[k] && picks[k].id === m.id);
      return /*#__PURE__*/React.createElement("div", {
        key: m.id,
        className: `fav-card${isCur ? ' is-assigned' : ''}`
      }, thumbs[m.id] ? /*#__PURE__*/React.createElement("img", {
        loading: "lazy",
        src: thumbs[m.id],
        alt: ""
      }) : /*#__PURE__*/React.createElement("img", {
        loading: "lazy",
        alt: ""
      }), /*#__PURE__*/React.createElement("div", {
        className: "fav-body"
      }, /*#__PURE__*/React.createElement("div", {
        className: "fav-date"
      }, d), /*#__PURE__*/React.createElement("div", {
        className: "fav-assign"
      }, /*#__PURE__*/React.createElement("button", {
        className: "btn-primary",
        disabled: !!usedElsewhere,
        onClick: () => assignSelected(m.id)
      }, isCur ? 'Assigned ✓' : usedElsewhere ? 'Used' : cur ? 'Switch to this' : 'Assign'))));
    })))), /*#__PURE__*/React.createElement("section", {
      className: "export-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "Finish"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--f-serif)',
        fontSize: 16,
        marginTop: 4
      }
    }, "One photo per stop \u2014 downloads a .zip that unzips straight into the repo."), /*#__PURE__*/React.createElement("div", {
      className: "export-row"
    }, /*#__PURE__*/React.createElement("button", {
      className: "pill-btn",
      onClick: resetSaved
    }, "Clear saved"), /*#__PURE__*/React.createElement("span", {
      className: "muted",
      style: {
        fontSize: 12
      }
    }, "Picks + photos auto-restore on reload.")))));
  }
  window.PhotosView = PhotosView;
})();