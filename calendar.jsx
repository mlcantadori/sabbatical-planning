// Google Calendar sync — pushes chapter date ranges + flight blocks to the
// signed-in user's Google Calendar. Client-side only (static hosting works).
//
// ONE-TIME SETUP (trip owner, ~10 min):
//   1. https://console.cloud.google.com → new project → enable Google Calendar API
//   2. APIs & Services → Credentials → Create Credentials → OAuth client ID
//      (type: Web application)
//   3. Authorized JavaScript origins: https://mlcantadori.github.io
//      (plus http://localhost:8000 for local testing)
//   4. Copy calendar-config.example.js → calendar-config.js and paste the ID,
//      OR paste it when the Sync button asks (stored in this browser only).
//
// Usage: click Sync in the header after itinerary/flight changes. Events use
// stable IDs, so re-syncing updates in place and removes stale entries.

(function () {
  const CAL_NAME = 'Sabbatical 2026–2027';
  const LS_CAL = 'gcal-calendar-id';
  const LS_LAST = 'gcal-last-sync';
  const LS_CLIENT = 'gcal-client-id';
  const SCOPES = 'https://www.googleapis.com/auth/calendar';

  // OAuth Client ID for the trip's Google Cloud project. Client IDs are
  // public identifiers by design (abuse is contained by the Authorized
  // JavaScript origins allowlist), so shipping it here is safe and means
  // nobody has to paste anything. window.SABBATICAL_CALENDAR_CLIENT_ID
  // still wins if set (e.g. local calendar-config.js override).
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
    await window.gapi.client.init({ discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'] });
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

  function addDays(iso, n) {
    const parts = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + n));
    return dt.toISOString().slice(0, 10);
  }

  // Pure function of TRIP data — safe to unit-test without Google.
  // NOTE: Google event IDs must be base32hex (lowercase a–v + 0–9 ONLY —
  // w, x, y, z fail with "Invalid resource id value"), so the eid helper
  // strips everything else and enforces uniqueness deterministically.
  function eid(prefix, raw, used) {
    const core = String(raw).toLowerCase().replace(/[^a-z0-9]/g, '').replace(/[wxyz]/g, '') || 'event';
    let id = prefix + core;
    let n = 0;
    while (used.has(id)) {
      n += 1;
      id = prefix + core + 'q' + n; // 'q' + digits stay valid + deterministic
    }
    used.add(id);
    return id;
  }
  // City name for a stop, derived from the authored place name (first
  // segment before any + — – · / separator). Generic travel-day rows
  // (Buffer, Transfer/Transit) are skipped — they are not destinations.
  function stopCity(name) {
    return String(name).split(/[+—–·/]/)[0].trim();
  }
  function isSkippableStop(name) {
    return /^(buffer|transfer|transit)\b/i.test(String(name).trim());
  }
  function buildEvents(trip) {
    const events = [];
    const used = new Set();
    trip.chapters.filter((c) => c.kind === 'chapter').forEach((c) => {
      events.push({
        id: eid('sabbaticalch', c.id, used),
        summary: (c.country + ' ' + (c.flag || '')).trim(),
        description: [c.title, c.theme, c.start + ' → ' + c.end + ' · ' + c.days + ' days'].filter(Boolean).join('\n'),
        start: { date: c.start },
        end: { date: addDays(c.end, 1) },
        extendedProperties: { private: { sabbatical: '1' } },
      });
      // One event per stop, dates derived from the chapter start +
      // cumulative place days (same convention as the itinerary view).
      let offset = 0;
      (c.places || []).forEach((p) => {
        const city = stopCity(p.name);
        const d = p.days || 0;
        if (!isSkippableStop(p.name) && city && d > 0) {
          const s = addDays(c.start, offset);
          events.push({
            id: eid('sabbaticalev', c.id + city, used),
            summary: (city + ' - ' + c.country + ' ' + (c.flag || '')).trim(),
            description: [p.query, s + ' → ' + addDays(c.start, offset + d - 1) + ' · ' + d + (d === 1 ? ' day' : ' days')].filter(Boolean).join('\n'),
            start: { date: s },
            end: { date: addDays(c.start, offset + d) },
            extendedProperties: { private: { sabbatical: '1' } },
          });
        }
        offset += d;
      });
    });
    (trip.budget.flights || []).filter((f) => f.date).forEach((f, i) => {
      const slug = f.route.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60) || ('leg' + i);
      events.push({
        id: eid('sabbaticalfl', slug, used),
        summary: '✈️ ' + f.route,
        description: ['Date: ' + f.date, f.note, f.cost != null ? 'Budget: USD ' + f.cost + ' for two' : null].filter(Boolean).join('\n'),
        start: { date: f.date },
        end: { date: addDays(f.date, 1) },
        extendedProperties: { private: { sabbatical: '1' } },
      });
    });
    // Hand-authored highlights: key attractions + car rentals (trip.calendarEvents).
    // `end` is the inclusive last day; Google gets end-exclusive.
    (trip.calendarEvents || []).forEach((a) => {
      events.push({
        id: eid('sabbaticalev', a.id || a.title, used),
        summary: a.title,
        description: [a.note, a.start + ' → ' + a.end].filter(Boolean).join('\n'),
        start: { date: a.start },
        end: { date: addDays(a.end, 1) },
        extendedProperties: { private: { sabbatical: '1' } },
      });
    });
    return events;
  }

  async function findOrCreateCalendar() {
    try {
      const saved = localStorage.getItem(LS_CAL);
      if (saved) {
        await window.gapi.client.calendar.calendars.get({ calendarId: saved });
        return saved;
      }
    } catch { /* fall through and rediscover */ }
    const list = await window.gapi.client.calendar.calendarList.list({ maxResults: 50 });
    const hit = (list.result.items || []).find((c) => c.summary === CAL_NAME);
    if (hit) {
      try { localStorage.setItem(LS_CAL, hit.id); } catch {}
      return hit.id;
    }
    const created = await window.gapi.client.calendar.calendars.insert({
      resource: { summary: CAL_NAME, description: 'Asia sabbatical 2026–2027 — synced from the trip planner', timeZone: 'America/Sao_Paulo' },
    });
    try { localStorage.setItem(LS_CAL, created.result.id); } catch {}
    return created.result.id;
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

  // Returns { ok: true } or { ok: false, error, id, summary } — never
  // throws, so one bad event can't abort the whole sync. Tries update
  // first (existing event), then insert (new event); records both errors
  // when both fail so the report names the exact culprit.
  async function upsert(calendarId, ev) {
    let patchErr = null;
    try {
      await window.gapi.client.calendar.events.patch({
        calendarId,
        eventId: ev.id,
        resource: { summary: ev.summary, description: ev.description, start: ev.start, end: ev.end },
      });
      return { ok: true, created: false };
    } catch (e) {
      patchErr = e;
    }
    try {
      await window.gapi.client.calendar.events.insert({ calendarId, resource: ev });
      return { ok: true, created: true };
    } catch (e2) {
      return { ok: false, id: ev.id, summary: ev.summary, error: errText(e2) + ' [patch: ' + errText(patchErr) + ']' };
    }
  }

  async function prune(calendarId, wantedIds) {
    const res = await window.gapi.client.calendar.events.list({
      calendarId,
      maxResults: 250,
      singleEvents: true,
      orderBy: 'startTime',
      timeMin: '2026-06-01T00:00:00Z',
      timeMax: '2027-07-31T00:00:00Z',
      fields: 'items(id,summary)',
    });
    const stale = (res.result.items || []).filter(
      (it) => it.id && it.id.indexOf('sabbatical') === 0 && wantedIds.indexOf(it.id) < 0
    );
    for (const it of stale) {
      try { await window.gapi.client.calendar.events.delete({ calendarId, eventId: it.id }); } catch {}
    }
    return stale.length;
  }

  async function syncAll(onStatus) {
    const say = (m) => { if (onStatus) onStatus(m); };
    say('Connecting to Google…');
    await ensureClients();
    say('Signing in…');
    const token = await getToken();
    window.gapi.client.setToken({ access_token: token });
    say('Finding calendar…');
    const calendarId = await findOrCreateCalendar();
    const events = buildEvents(window.TRIP);
    say('Syncing ' + events.length + ' events…');
    let n = 0;
    const failed = [];
    for (const ev of events) {
      const r = await upsert(calendarId, ev);
      if (r.ok) n++;
      else failed.push(r);
      if (n % 10 === 0) say('Syncing ' + n + '/' + events.length + '…');
    }
    let pruned = 0;
    try {
      pruned = await prune(calendarId, events.map((e) => e.id));
    } catch (e) {
      failed.push({ id: '(prune)', summary: 'stale-entry cleanup', error: errText(e) });
    }
    const stamp = new Date().toISOString();
    try {
      localStorage.setItem(LS_LAST, stamp);
      localStorage.setItem('gcal-last-report', JSON.stringify({ at: stamp, synced: n, failed }));
    } catch {}
    return { synced: n, failed, pruned, at: stamp };
  }

  function SyncButton({ compact }) {
    const [label, setLabel] = React.useState(() => {
      try {
        return localStorage.getItem(LS_LAST) ? 'Synced ✓' : 'Sync';
      } catch {
        return 'Sync';
      }
    });
    const [busy, setBusy] = React.useState(false);
    const run = async () => {
      if (busy) return;
      setBusy(true);
      setLabel('Syncing…');
      try {
        const r = await syncAll();
        const d = new Date(r.at);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        if (r.failed.length === 0) {
          setLabel('Synced ✓ ' + hh + ':' + mm);
        } else {
          setLabel('Synced ' + r.synced + '/' + (r.synced + r.failed.length) + ' — retry');
          alert('Calendar sync: ' + r.synced + ' ok, ' + r.failed.length + ' failed:\n'
            + r.failed.map((f) => '• ' + f.summary + ' [' + f.id + ']: ' + f.error).join('\n'));
        }
      } catch (e) {
        setLabel('Sync failed — retry');
        alert('Calendar sync failed: ' + ((e && (e.message || (e.result && e.result.error && e.result.error.message))) || e));
      } finally {
        setBusy(false);
      }
    };
    return (
      <button onClick={run} title="Push chapter dates + flight blocks to your Google Calendar">
        <window.Icon.calendar size={12} /> {!compact && label}
      </button>
    );
  }

  Object.assign(window, { SyncButton, CalendarSync: { buildEvents, syncAll, clientId, CAL_NAME } });
})();
