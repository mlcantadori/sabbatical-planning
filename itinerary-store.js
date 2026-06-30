// Itinerary store — localStorage-backed mutable wrapper around window.TRIP.
// Components subscribe via useStore() and re-render on any mutation.
//
// On first load it bakes the static TRIP_GEO coords into each chapter/place
// so the store is the single source of truth from there on. The user's edits
// override the defaults; "Reset" wipes localStorage and re-bakes from
// TRIP/TRIP_GEO.

window.STORE = (function () {
  const LS_KEY = 'trip-data-v4';
  const listeners = new Set();
  let chapters;

  function uniqueId(prefix) {
    return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function renumber() {
    let n = 1;
    chapters.forEach((c) => {
      if (c.kind === 'chapter') c.num = n++;
      else c.num = null;
    });
  }

  function recomputeDays(c) {
    if (c.start && c.end) {
      const ms = new Date(c.end) - new Date(c.start);
      const d = Math.round(ms / 86400000);
      if (d > 0 && d < 1000) c.days = d;
    }
  }

  function init() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch {}
    if (saved && Array.isArray(saved.chapters)) {
      chapters = saved.chapters;
      const srcById = new Map(window.TRIP.chapters.map((c) => [c.id, c]));
      // Defensive: make sure every chapter has the fields we expect
      chapters.forEach((c) => {
        if (!c.places) c.places = [];
        c.places.forEach((p) => { if (!p.highlights) p.highlights = []; });
        // photos are source-derived, never user-edited — always re-bake from TRIP
        // so curated photo edits propagate without a cache bump or Reset.
        const src = srcById.get(c.id);
        if (src && Array.isArray(src.photos)) c.photos = src.photos.slice();
      });
      return;
    }
    // First run — bake the static data
    chapters = window.TRIP.chapters.map((c) => ({
      id: c.id,
      num: c.num,
      kind: c.kind,
      region: c.region,
      country: c.country,
      flag: c.flag,
      title: c.title,
      start: c.start,
      end: c.end,
      days: c.days,
      theme: c.theme,
      intro: c.intro,
      tldr: c.tldr,
      weather: { ...c.weather },
      photos: c.photos.slice(),
      anchor: (window.TRIP_GEO.chapters[c.id] || [0, 0]).slice(),
      booking: c.booking ? c.booking.slice() : null,
      diving: c.diving ? { ...c.diving } : null,
      places: c.places.map((p) => ({
        name: p.name,
        days: p.days,
        query: p.query,
        coords: (window.TRIP_GEO.places[`${c.id}/${p.name}`] || null),
        highlights: p.highlights.slice(),
      })),
    }));
  }
  init();

  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ chapters })); } catch {}
    listeners.forEach((fn) => fn());
  }

  return {
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    getChapters: () => chapters,
    getChapter: (id) => chapters.find((c) => c.id === id),
    getTotalDays: () => chapters.reduce((s, c) => s + (c.days || 0), 0),

    // ── chapters ──────────────────────────────────────────────────────
    addChapter(afterId, partial = {}) {
      const c = {
        id: uniqueId('ch'),
        num: null,
        kind: 'chapter',
        region: partial.region || 'isthmus',
        country: partial.country || 'New country',
        flag: partial.flag || '🌍',
        title: partial.title || 'New chapter',
        start: partial.start || (chapters.at(-1)?.end ?? '2026-09-15'),
        end: partial.end || (chapters.at(-1)?.end ?? '2026-09-22'),
        days: 7,
        theme: partial.theme || '',
        intro: partial.intro || '',
        tldr: partial.tldr || '',
        weather: partial.weather || { hi: 25, lo: 18, label: '—', emoji: '🌤' },
        photos: partial.photos || [partial.title || 'travel landscape'],
        anchor: partial.anchor || [0, 0],
        booking: null,
        diving: null,
        places: [],
      };
      recomputeDays(c);
      const idx = afterId ? chapters.findIndex((x) => x.id === afterId) : -1;
      if (idx >= 0) chapters.splice(idx + 1, 0, c);
      else chapters.push(c);
      renumber();
      save();
      return c.id;
    },
    removeChapter(id) {
      const idx = chapters.findIndex((c) => c.id === id);
      if (idx >= 0) chapters.splice(idx, 1);
      renumber();
      save();
    },
    updateChapter(id, patch) {
      const c = chapters.find((c) => c.id === id);
      if (!c) return;
      Object.assign(c, patch);
      if (patch.weather) c.weather = { ...c.weather, ...patch.weather };
      recomputeDays(c);
      save();
    },

    // ── places ────────────────────────────────────────────────────────
    addPlace(chapterId, afterIdx, partial = {}) {
      const c = chapters.find((c) => c.id === chapterId);
      if (!c) return;
      const place = {
        name: partial.name || 'New stop',
        days: partial.days || 1,
        query: partial.query || partial.name || 'New stop',
        coords: partial.coords || c.anchor.slice(),
        highlights: partial.highlights || [],
      };
      const idx = (afterIdx === undefined || afterIdx === null) ? c.places.length : afterIdx + 1;
      c.places.splice(idx, 0, place);
      save();
    },
    removePlace(chapterId, placeIdx) {
      const c = chapters.find((c) => c.id === chapterId);
      if (!c) return;
      c.places.splice(placeIdx, 1);
      save();
    },
    updatePlace(chapterId, placeIdx, patch) {
      const c = chapters.find((c) => c.id === chapterId);
      if (!c || !c.places[placeIdx]) return;
      Object.assign(c.places[placeIdx], patch);
      save();
    },

    // ── highlights (attractions) ──────────────────────────────────────
    addHighlight(chapterId, placeIdx, text) {
      const c = chapters.find((c) => c.id === chapterId);
      if (!c || !c.places[placeIdx]) return;
      c.places[placeIdx].highlights.push(text || 'New attraction');
      save();
    },
    removeHighlight(chapterId, placeIdx, hlIdx) {
      const c = chapters.find((c) => c.id === chapterId);
      if (!c || !c.places[placeIdx]) return;
      c.places[placeIdx].highlights.splice(hlIdx, 1);
      save();
    },
    updateHighlight(chapterId, placeIdx, hlIdx, text) {
      const c = chapters.find((c) => c.id === chapterId);
      if (!c || !c.places[placeIdx]) return;
      c.places[placeIdx].highlights[hlIdx] = text;
      save();
    },

    // ── reset everything to defaults ──────────────────────────────────
    reset() {
      try { localStorage.removeItem(LS_KEY); } catch {}
      init();
      listeners.forEach((fn) => fn());
    },

    // ── snapshots ─────────────────────────────────────────────────────
    // Each snapshot: { name, timestamp, chapters: deepClone }
    // Stored in localStorage under a separate key.
    getSnapshots() {
      try { return JSON.parse(localStorage.getItem('trip-snapshots-v1') || '[]'); } catch { return []; }
    },
    saveSnapshot(name) {
      const snaps = this.getSnapshots().filter((s) => s.name !== name);
      snaps.unshift({ name, timestamp: Date.now(), chapters: JSON.parse(JSON.stringify(chapters)) });
      try { localStorage.setItem('trip-snapshots-v1', JSON.stringify(snaps)); } catch {}
    },
    deleteSnapshot(name) {
      const snaps = this.getSnapshots().filter((s) => s.name !== name);
      try { localStorage.setItem('trip-snapshots-v1', JSON.stringify(snaps)); } catch {}
    },
    loadSnapshot(name) {
      const snap = this.getSnapshots().find((s) => s.name === name);
      if (!snap) return;
      chapters = JSON.parse(JSON.stringify(snap.chapters));
      save();
    },

    // compareWithSnapshot: returns a diff of current state vs a named snapshot.
    // Returned shape: { added, removed, modified, totalDaysDelta }
    compareWithSnapshot(name) {
      const snap = this.getSnapshots().find((s) => s.name === name);
      if (!snap) return null;
      const snapMap = new Map(snap.chapters.map((c) => [c.id, c]));
      const curMap  = new Map(chapters.map((c) => [c.id, c]));
      const added   = chapters.filter((c) => !snapMap.has(c.id));
      const removed = snap.chapters.filter((c) => !curMap.has(c.id));
      const modified = [];
      chapters.forEach((cur) => {
        const old = snapMap.get(cur.id);
        if (!old) return;
        if (cur.start !== old.start || cur.end !== old.end || cur.title !== old.title) {
          const curDays  = Math.round((new Date(cur.end) - new Date(cur.start)) / 86400000);
          const snapDays = Math.round((new Date(old.end) - new Date(old.start)) / 86400000);
          modified.push({
            id: cur.id, title: cur.title,
            current:  { start: cur.start,  end: cur.end,  days: curDays },
            snapshot: { start: old.start,   end: old.end,  days: snapDays },
            dateDelta: Math.round((new Date(cur.start) - new Date(old.start)) / 86400000),
            daysDelta: curDays - snapDays,
          });
        }
      });
      const totalDaysDelta = added.reduce((s, c) => s + (c.days || 0), 0)
        - removed.reduce((s, c) => s + (c.days || 0), 0)
        + modified.reduce((s, m) => s + m.daysDelta, 0);
      return { added, removed, modified, totalDaysDelta };
    },

    // getConsequences: preview impact of editing a chapter's dates WITHOUT saving.
    // Pass the chapter id and the form patch (must include start + end strings).
    // Returns: { daysDelta, tripEndDelta, chainShifts, seasonWarnings, gapConflicts }
    getConsequences(chapterId, patch) {
      const idx = chapters.findIndex((c) => c.id === chapterId);
      if (idx < 0) return null;
      const cur = chapters[idx];
      const newStart = patch.start || cur.start;
      const newEnd   = patch.end   || cur.end;
      const newDays  = Math.round((new Date(newEnd) - new Date(newStart)) / 86400000);
      const oldDays  = cur.days || 0;
      const daysDelta = newDays - oldDays;
      const endDelta  = Math.round((new Date(newEnd) - new Date(cur.end)) / 86400000);

      // Chain: how many days each subsequent chapter would need to shift
      const chainShifts = [];
      if (endDelta !== 0) {
        chapters.slice(idx + 1).forEach((c) => {
          const newChStart = new Date(new Date(c.start).getTime() + endDelta * 86400000);
          const newChEnd   = new Date(new Date(c.end).getTime()   + endDelta * 86400000);
          chainShifts.push({
            id: c.id, title: c.title,
            currentStart: c.start,
            newStart: newChStart.toISOString().slice(0, 10),
            currentEnd: c.end,
            newEnd: newChEnd.toISOString().slice(0, 10),
            delta: endDelta,
          });
        });
      }

      // Trip total end delta
      const tripEnd = chapters.at(-1);
      const tripEndDelta = endDelta; // simplified: same as endDelta if chaining

      // Season warnings — check the edited chapter and any that would shift
      const optWin = (window.TRIP.optimalWindows || {})[chapterId];
      const seasonWarnings = [];
      if (optWin) {
        const startMonth = new Date(newStart).getUTCMonth() + 1;
        if (!optWin.months.includes(startMonth)) {
          seasonWarnings.push({
            id: chapterId, title: cur.title,
            message: `${cur.title} starts in month ${startMonth} — optimal window is ${optWin.note}`,
          });
        }
      }
      // Check shifted chapters for season misalignment
      chainShifts.forEach((shift) => {
        const ow = (window.TRIP.optimalWindows || {})[shift.id];
        if (!ow) return;
        const m = new Date(shift.newStart).getUTCMonth() + 1;
        if (!ow.months.includes(m)) {
          seasonWarnings.push({
            id: shift.id, title: shift.title,
            message: `${shift.title} would start in month ${m} — optimal window: ${ow.note}`,
          });
        }
      });

      // Gap/overlap: does the new end create a gap or overlap with the next chapter?
      const gapConflicts = [];
      if (idx + 1 < chapters.length) {
        const next = chapters[idx + 1];
        const gapDays = Math.round((new Date(next.start) - new Date(newEnd)) / 86400000);
        if (gapDays > 1) {
          gapConflicts.push({ between: [chapterId, next.id], titles: [cur.title, next.title], gapDays, type: 'gap' });
        } else if (gapDays < 0) {
          gapConflicts.push({ between: [chapterId, next.id], titles: [cur.title, next.title], gapDays, type: 'overlap' });
        }
      }

      return { daysDelta, tripEndDelta, chainShifts, seasonWarnings, gapConflicts };
    },
  };
})();

// Geocode helper — Nominatim (OpenStreetMap). Free, rate-limited (1/sec) so
// we debounce/await. Returns [lat, lng] or null.
window.geocode = async function geocode(query) {
  if (!query) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const r = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await r.json();
    if (Array.isArray(data) && data[0]) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (e) {
    console.warn('[geocode] failed:', e);
  }
  return null;
};
