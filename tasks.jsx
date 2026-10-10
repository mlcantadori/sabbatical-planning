// Google Tasks sync — pushes the to-do checklist (window.TODO_ITEMS) into
// a "Sabbatical" task list in the signed-in user's Google Tasks.
// Client-side only (static hosting works).
//
// ONE-TIME SETUP (trip owner, ~10 min):
//   1. https://console.cloud.google.com → the SAME project as the Calendar
//      sync → enable the Google Tasks API (same OAuth Client ID works for
//      both; no new credentials needed).
//   2. Authorized JavaScript origins already cover the app if Calendar sync
//      works (https://mlcantadori.github.io + http://localhost:8000).
//
// Usage: header Sync ▾ → Tasks. The app is the source of truth: re-syncs
// match entries by remembered Google ID (this browser) with title matching
// as fallback, update them in place, and delete remembered entries that no
// longer exist — but only if they still carry the last-synced title, so
// anything you've repurposed is left alone, and your own tasks (never
// remembered) are never touched. Renames you make in Google Tasks get
// overwritten back on the next sync; titles you add yourself that collide
// with a checklist title may get adopted — keep yours distinct.
// Checklist ticks in the app are NOT read — sync from Export-committed
// todo-data.js states (done:true → completed in Google Tasks).

(function () {
  const LIST_NAME = 'Sabbatical';
  const LS_LIST = 'gtasks-list-id';
  const LS_MAP = 'gtasks-id-map';
  const LS_LAST = 'gtasks-last-sync';
  const LS_CLIENT = 'gcal-client-id'; // shared with the Calendar sync
  const SCOPES = 'https://www.googleapis.com/auth/tasks';

  // Same trip Client ID as calendar.jsx (public identifier by design —
  // abuse is contained by the Authorized JavaScript origins allowlist).
  // window.SABBATICAL_CALENDAR_CLIENT_ID still wins if set.
  const DEFAULT_CLIENT_ID = '745260746303-bvf9rc8abdmjssd64cgns1lm4hb91hmp.apps.googleusercontent.com';

  function clientId() {
    if (window.SABBATICAL_CALENDAR_CLIENT_ID) return window.SABBATICAL_CALENDAR_CLIENT_ID;
    try {
      return localStorage.getItem(LS_CLIENT) || DEFAULT_CLIENT_ID;
    } catch {
      return DEFAULT_CLIENT_ID;
    }
  }

  function loadScript(src, optional) {
    return new Promise((resolve, reject) => {
      if ([...document.scripts].some((s) => s.src === src || s.getAttribute('src') === src)) return resolve();
      const el = document.createElement('script');
      el.src = src; el.async = true; el.defer = true;
      el.onload = resolve;
      el.onerror = () => (optional ? resolve() : reject(new Error('Failed to load ' + src)));
      document.head.appendChild(el);
    });
  }

  async function ensureClients() {
    await loadScript('calendar-config.js', true); // optional local override
    await loadScript('https://apis.google.com/js/api.js');
    await new Promise((res, rej) => {
      window.gapi.load('client', { callback: res, onerror: rej });
    });
    await window.gapi.client.init({ discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest'] });
    await loadScript('https://accounts.google.com/gsi/client');
  }

  function getToken() {
    return new Promise((resolve, reject) => {
      const id = clientId();
      if (!id) return reject(new Error('no-client-id'));
      try {
        const tc = window.google.accounts.oauth2.initTokenClient({
          client_id: id,
          scope: SCOPES,
          callback: (resp) => (resp && resp.access_token ? resolve(resp.access_token) : reject(new Error('auth-denied'))),
          error_callback: () => reject(new Error('auth-denied')),
        });
        tc.requestAccessToken({ prompt: '' });
      } catch (e) { reject(e); }
    });
  }

  // Identity without visible markers: entries are matched by remembered
  // Google ID first, then by exact title (unique per level) for browsers
  // whose localStorage was wiped. Titles double as the prune guard below.
  function buildIndex(existing) {
    const byId = {};
    const byTitleTop = {};
    const byTitleChild = {};
    (existing || []).forEach((t) => {
      if (!t || !t.id) return;
      byId[t.id] = t;
      const bucket = t.parent ? byTitleChild : byTitleTop;
      if (t.title && !bucket[t.title]) bucket[t.title] = t;
    });
    return { byId, byTitleTop, byTitleChild };
  }

  function resolveKey(map, idx, key, title, isParent) {
    const entry = map[key];
    if (entry && entry.id && idx.byId[entry.id]) return idx.byId[entry.id];
    const bucket = isParent ? idx.byTitleTop : idx.byTitleChild;
    return bucket[title] || null;
  }

  // Map shape is { key: { id, title } }. Older runs stored bare ID
  // strings — adopt them, recording the current title as the prune guard.
  function normalizeMap(raw, idx) {
    const map = {};
    Object.keys(raw || {}).forEach((key) => {
      const v = raw[key];
      if (typeof v === 'string') {
        const t = idx.byId[v];
        map[key] = { id: v, title: t ? t.title : null };
      } else if (v && v.id) {
        map[key] = { id: v.id, title: v.title != null ? v.title : null };
      }
    });
    return map;
  }

  function fmtRange(c) {
    try {
      const h = window.TRIP && window.TRIP.helpers;
      if (h && h.fmt) return h.fmt(c.start) + ' – ' + h.fmt(c.end);
    } catch {}
    return (c.start || '') + ' – ' + (c.end || '');
  }

  // Pure function of (todos, chapters) — safe to unit-test without Google.
  // Returns { parents, items }; titles are unique within their level so
  // title-matching works as a fallback when localStorage was wiped.
  function buildTasks(todos, chapters) {
    const chById = {};
    (chapters || []).forEach((c) => { chById[c.id] = c; });
    const usedChild = new Set();
    const items = (todos || []).map((t) => {
      const chTitle = chById[t.ch] ? chById[t.ch].title : 'Pre-trip prep';
      let title = String(t.title || 'Untitled');
      let n = 0;
      const base = title;
      while (usedChild.has(title)) {
        n += 1;
        title = base + (t.place ? ' · ' + t.place : '') + ' #' + n;
      }
      usedChild.add(title);
      const meta = [chTitle, t.cat, t.place].filter(Boolean).join(' · ');
      return {
        key: String(t.id),
        ch: t.ch,
        title,
        notes: [t.note, meta].filter(Boolean).join('\n'),
        due: t.due ? t.due + 'T00:00:00.000Z' : null,
        status: t.done ? 'completed' : 'needsAction',
      };
    });
    const order = [];
    const seenCh = {};
    (todos || []).forEach((t) => {
      if (!seenCh[t.ch]) { seenCh[t.ch] = true; order.push(t.ch); }
    });
    const usedParent = new Set();
    const parents = order.map((ch) => {
      const c = chById[ch];
      let title = c
        ? ((c.flag ? c.flag + ' ' : '') + c.title + ' (' + fmtRange(c) + ')')
        : 'Pre-trip prep';
      let n = 0;
      const base = title;
      while (usedParent.has(title)) { n += 1; title = base + ' #' + n; }
      usedParent.add(title);
      // Parent deadline: chapter end; groups without a chapter (prep)
      // inherit their latest child due instead.
      let due = null;
      if (c && c.end) {
        due = c.end + 'T00:00:00.000Z';
      } else {
        const kidDues = items.filter((i) => i.ch === ch && i.due).map((i) => i.due);
        if (kidDues.length) due = kidDues.sort().pop();
      }
      return { key: 'ch:' + ch, title, due };
    });
    return { parents, items };
  }

  function errText(e) {
    if (!e) return 'unknown error';
    if (typeof e === 'string') return e;
    if (e.message) return e.message;
    try {
      const r = e.result;
      if (r && r.error) return 'HTTP ' + (e.status || '?') + ': ' + (r.error.message || JSON.stringify(r.error));
    } catch {}
    return 'HTTP ' + (e.status || '?');
  }

  function loadMap() {
    try {
      return JSON.parse(localStorage.getItem(LS_MAP) || '{}');
    } catch {
      return {};
    }
  }
  function saveMap(map) {
    try { localStorage.setItem(LS_MAP, JSON.stringify(map)); } catch {}
  }

  async function findOrCreateList() {
    try {
      const saved = localStorage.getItem(LS_LIST);
      if (saved) {
        await window.gapi.client.tasks.tasklists.get({ tasklist: saved });
        return saved;
      }
    } catch { /* fall through and rediscover */ }
    let page = null;
    for (;;) {
      const res = await window.gapi.client.tasks.tasklists.list({ maxResults: 20, pageToken: page || undefined });
      const hit = ((res.result || {}).items || []).find((l) => l.title === LIST_NAME);
      if (hit) {
        try { localStorage.setItem(LS_LIST, hit.id); } catch {}
        return hit.id;
      }
      page = (res.result || {}).nextPageToken;
      if (!page) break;
    }
    const created = await window.gapi.client.tasks.tasklists.insert({
      resource: { title: LIST_NAME },
    });
    try { localStorage.setItem(LS_LIST, created.result.id); } catch {}
    return created.result.id;
  }

  // Every task in the list (paginated past the 100-item page cap).
  async function listAll(listId) {
    const all = [];
    let page = null;
    for (;;) {
      const res = await window.gapi.client.tasks.tasks.list({
        tasklist: listId,
        maxResults: 100,
        pageToken: page || undefined,
        showCompleted: true,
        showDeleted: false,
        fields: 'items(id,title,notes,parent,status,due),nextPageToken',
      });
      all.push(...(((res.result || {}).items) || []));
      page = (res.result || {}).nextPageToken;
      if (!page) break;
    }
    return all;
  }

  // Returns { ok: true, id } or { ok: false, error, title } — never throws.
  // Gentle on the Tasks API quota: sequential writes with a gap between
  // them, skip when the server copy already matches, and retry throttled
  // calls with backoff. (Batching would not help — Google counts each
  // batched sub-request against quota the same as a single call.)
  const WRITE_GAP_MS = 350;
  const MAX_ATTEMPTS = 4;

  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  function retryableStatus(e) {
    const s = e && e.status;
    if (s === 429 || s === 500 || s === 502 || s === 503) return true;
    if (s === 403) {
      try {
        const errs = (((e.result || {}).error || {}).errors) || [];
        return errs.some((x) => /rateLimitExceeded|userRateLimitExceeded/i.test(x.reason || ''));
      } catch { return false; }
    }
    return false;
  }

  async function withRetry(label, fn) {
    let last = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return { ok: true, value: await fn() };
      } catch (e) {
        last = e;
        if (!retryableStatus(e) || attempt === MAX_ATTEMPTS) break;
        await sleep(1000 * attempt * attempt); // 1s, 4s, 9s backoff
      }
    }
    return { ok: false, error: errText(last) + ' [' + label + ', ' + MAX_ATTEMPTS + ' attempts]' };
  }

  function sameDay(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return String(a).slice(0, 10) === String(b).slice(0, 10);
  }

  function unchanged(existing, want) {
    return !!existing
      && String(existing.title || '') === String(want.title || '')
      && String(existing.notes || '') === String(want.notes || '')
      && String(existing.status || '') === String(want.status || '')
      && sameDay(existing.due, want.due);
  }

  async function upsert(listId, existing, want, extra) {
    // Already in sync server-side — no write, no quota spent.
    if (unchanged(existing, want)) {
      return { ok: true, id: existing.id, created: false, skipped: true };
    }
    const resource = { title: want.title, notes: want.notes, status: want.status };
    if (want.due) resource.due = want.due;
    if (existing) {
      const r = await withRetry('update', () => window.gapi.client.tasks.tasks.update({ tasklist: listId, task: existing.id, resource }));
      await sleep(WRITE_GAP_MS);
      if (!r.ok) return { ok: false, title: want.title, error: r.error };
      return { ok: true, id: existing.id, created: false };
    }
    const r = await withRetry('insert', () => window.gapi.client.tasks.tasks.insert({
      tasklist: listId,
      parent: extra && extra.parent,
      previous: extra && extra.previous,
      resource,
    }));
    await sleep(WRITE_GAP_MS);
    if (!r.ok) return { ok: false, title: want.title, error: r.error };
    return { ok: true, id: r.value.result.id, created: true };
  }

  async function syncAll(onStatus) {
    const say = (m) => { if (onStatus) onStatus(m); };
    say('Connecting to Google…');
    await ensureClients();
    say('Signing in…');
    const token = await getToken();
    window.gapi.client.setToken({ access_token: token });
    say('Finding task list…');
    const listId = await findOrCreateList();
    const built = buildTasks(window.TODO_ITEMS, (window.TRIP && window.TRIP.chapters) || []);
    const existing = await listAll(listId);
    const idx = buildIndex(existing);
    const map = normalizeMap(loadMap(), idx);
    const failed = [];
    let n = 0;
    let skipped = 0;
    const total = built.parents.length + built.items.length;
    const tick = (r, want) => {
      if (r.ok) {
        n++;
        if (r.skipped) skipped++;
        map[want.key] = { id: r.id, title: want.title };
        if (n % 5 === 0 || n === total) say('Syncing ' + n + '/' + total + '…');
      } else failed.push(r);
    };

    // Parents first (chapters, in trip order), chained to keep order.
    say('Syncing ' + total + ' tasks…');
    const parentIds = {};
    let prevParent = null;
    for (const p of built.parents) {
      const kids = built.items.filter((i) => i.ch === p.key.slice(3));
      const allDone = kids.length > 0 && kids.every((k) => k.status === 'completed');
      const want = {
        key: p.key,
        title: p.title,
        notes: '',
        due: p.due,
        status: allDone ? 'completed' : 'needsAction',
      };
      const r = await upsert(listId, resolveKey(map, idx, p.key, p.title, true), want, { previous: prevParent });
      tick(r, want);
      if (r.ok) { parentIds[p.key] = r.id; prevParent = r.id; }
    }
    // Children under their chapter parent, chained to keep file order.
    const prevByParent = {};
    for (const it of built.items) {
      const r = await upsert(listId, resolveKey(map, idx, it.key, it.title, false), it, {
        parent: parentIds['ch:' + it.ch],
        previous: prevByParent[it.ch],
      });
      tick(r, it);
      if (r.ok) prevByParent[it.ch] = r.id;
    }
    // Prune remembered entries that no longer exist — but only when they
    // still carry the last-synced title. A renamed/repurposed entry is
    // left alone (and forgotten); anything never remembered is untouched.
    let pruned = 0;
    try {
      const wanted = new Set([...built.parents.map((p) => p.key), ...built.items.map((i) => i.key)]);
      for (const key of Object.keys(map)) {
        if (wanted.has(key)) continue;
        const entry = map[key];
        const cur = entry && idx.byId[entry.id];
        if (cur && entry.title != null && cur.title === entry.title) {
          const r = await withRetry('delete', () => window.gapi.client.tasks.tasks.delete({ tasklist: listId, task: cur.id }));
          await sleep(WRITE_GAP_MS);
          if (r.ok) pruned++;
        }
        delete map[key];
      }
    } catch (e) {
      failed.push({ title: 'stale-entry cleanup', error: errText(e) });
    }
    saveMap(map);
    const stamp = new Date().toISOString();
    try {
      localStorage.setItem(LS_LAST, stamp);
      localStorage.setItem('gtasks-last-report', JSON.stringify({ at: stamp, synced: n, skipped, failed }));
    } catch {}
    return { synced: n, skipped, failed, pruned, at: stamp };
  }

  Object.assign(window, { TasksSync: { buildTasks, syncAll, LIST_NAME, _test: { sameDay, unchanged, retryableStatus, withRetry, sleep, buildIndex, resolveKey, normalizeMap } } });
})();
