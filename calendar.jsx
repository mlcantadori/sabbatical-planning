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

  function clientId() {
    if (window.SABBATICAL_CALENDAR_CLIENT_ID) return window.SABBATICAL_CALENDAR_CLIENT_ID;
    try { return localStorage.getItem(LS_CLIENT) || null; } catch { return null; }
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
  function buildEvents(trip) {
    const events = [];
    trip.chapters.filter((c) => c.kind === 'chapter').forEach((c) => {
      events.push({
        id: 'sabbatical-ch-' + c.id,
        summary: ((c.flag || '') + ' ' + c.title).trim(),
        description: [c.theme, c.tldr, c.start + ' → ' + c.end + ' · ' + c.days + ' days'].filter(Boolean).join('\n'),
        start: { date: c.start },
        end: { date: addDays(c.end, 1) },
        extendedProperties: { private: { sabbatical: '1' } },
      });
    });
    (trip.budget.flights || []).filter((f) => f.date).forEach((f, i) => {
      const slug = f.route.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || ('leg-' + i);
      events.push({
        id: 'sabbatical-fl-' + slug,
        summary: '✈️ ' + f.route,
        description: ['Date: ' + f.date, f.note, f.cost != null ? 'Budget: USD ' + f.cost + ' for two' : null].filter(Boolean).join('\n'),
        start: { date: f.date },
        end: { date: addDays(f.date, 1) },
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

  async function upsert(calendarId, ev) {
    try {
      await window.gapi.client.calendar.events.patch({
        calendarId,
        eventId: ev.id,
        resource: { summary: ev.summary, description: ev.description, start: ev.start, end: ev.end },
      });
    } catch (e) {
      if (e && e.status === 404) {
        await window.gapi.client.calendar.events.insert({ calendarId, resource: ev });
      } else {
        throw e;
      }
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
      (it) => it.id && it.id.indexOf('sabbatical-') === 0 && wantedIds.indexOf(it.id) < 0
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
    for (const ev of events) {
      await upsert(calendarId, ev);
      n++;
    }
    const pruned = await prune(calendarId, events.map((e) => e.id));
    const stamp = new Date().toISOString();
    try { localStorage.setItem(LS_LAST, stamp); } catch {}
    return { synced: n, pruned, at: stamp };
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
      if (!clientId()) {
        const v = prompt('Paste your Google OAuth Client ID (see calendar-config.example.js):');
        if (v && v.trim()) {
          try { localStorage.setItem(LS_CLIENT, v.trim()); } catch {}
        } else {
          return;
        }
      }
      setBusy(true);
      setLabel('Syncing…');
      try {
        const r = await syncAll();
        const d = new Date(r.at);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        setLabel('Synced ✓ ' + hh + ':' + mm);
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
