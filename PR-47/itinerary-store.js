// Itinerary store — read-only view over window.TRIP (+ TRIP_GEO coords).
// Components subscribe via useStore() and re-render on notify.
// The mutation API, snapshots and the consequence engine were removed
// (read-only UI — see git history to restore).

window.STORE = (function () {
  // v21: Andaman rebalanced — Koh Lipe 3n, Ko Lanta 7n (Dec 29 arrival before NYE), Railay 4n.
  // v20: Malaysia right-sized to 14n (KL/Penang/Langkawi), Andaman expanded
  // to 18n south-to-north (Koh Lipe -> Ko Lanta -> Railay -> Bangkok 4n),
  // Japan swaps Kanazawa for Hakone/Mt. Fuji, China Spring moves to May 6-28
  // ahead of June plum rains, and Korea closes the trip May 28 - Jun 11.
  const LS_KEY = 'trip-data-v21';
  const listeners = new Set();
  let chapters;

  function renumber() {
    let n = 1;
    chapters.forEach((c) => {
      if (c.kind === 'chapter') c.num = n++;
      else c.num = null;
    });
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
        // per-place photos likewise (matched by name; renamed places keep theirs).
        if (src && Array.isArray(src.places)) {
          const photoByName = {};
          src.places.forEach((p) => { photoByName[p.name] = p.photo || null; });
          c.places.forEach((p) => { if (!p.photo && photoByName[p.name]) p.photo = photoByName[p.name]; });
        }
        return;
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
      decisions: c.decisions ? c.decisions.slice() : null,
      places: c.places.map((p) => ({
        name: p.name,
        days: p.days,
        query: p.query,
        photo: p.photo || null,
        coords: (window.TRIP_GEO.places[`${c.id}/${p.name}`] || null),
        highlights: p.highlights.slice(),
      })),
    }));
  }
  init();
  // Chapter numbers always derive from array order — never from static data —
  // so inserting/reordering chapters can't leave stale numbers behind.
  renumber();

  return {
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    getChapters: () => chapters,
    getChapter: (id) => chapters.find((c) => c.id === id),
    getTotalDays: () => chapters.reduce((s, c) => s + (c.days || 0), 0),
  };
})();
