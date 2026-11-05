// The Long Way East — app shell: chrome, year spine, atlas stage, chapter reel,
// cover, and the four sections (Atlas / Chapters / Budget / Tasks).

(function () {
  const { totalDays, helpers, REGIONS } = window.TRIP;
  const { fmt, dayCounter } = helpers;
  const { todayISO, currentChapter, currentCity, nextCity, daysUntil, chapterStatus } = window.TRIP_NOW;

  const TODAY = (() => {
    const n = new Date();
    return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
  })();

  function useIsMobile(bp = 880) {
    const [m, setM] = React.useState(typeof window !== 'undefined' && window.innerWidth < bp);
    React.useEffect(() => {
      const on = () => setM(window.innerWidth < bp);
      window.addEventListener('resize', on);
      return () => window.removeEventListener('resize', on);
    }, [bp]);
    return m;
  }

  // Deep-link params. New names win; the old map/budget/todo names still work
  // so links shared before the redesign keep landing somewhere sensible.
  function readUrlParams() {
    try {
      const q = new URLSearchParams(window.location.search);
      const rawView = (q.get('view') || '').toLowerCase();
      const view = rawView === 'budget' || rawView === 'ledger' ? 'ledger'
        : rawView === 'todo' || rawView === 'kit' || rawView === 'tasks' ? 'kit'
        : rawView === 'map' || rawView === 'atlas' || rawView === 'journey' ? 'atlas'
        : null;
      const mapRaw = (q.get('map') || '').toLowerCase();
      const map = mapRaw === 'globe' || mapRaw === '3d' ? 'globe'
        : mapRaw === 'map' || mapRaw === '2d' ? 'map' : null;
      const chId = q.get('chapter');
      const ch = chId && window.STORE ? window.STORE.getChapter(chId) : null;
      let place = null;
      if (ch) {
        const n = parseInt(q.get('place'), 10);
        if (Number.isInteger(n) && n >= 0 && ch.places && n < ch.places.length) place = n;
      }
      const detail = q.get('detail');
      return { view, map, chapterId: ch ? ch.id : null, placeIdx: place, detail: detail === '0' ? false : null };
    } catch { return { view: null, map: null, chapterId: null, placeIdx: null, detail: null }; }
  }

  const VIEWS = [
    { id: 'atlas', label: 'Atlas', index: '01', icon: (p) => <window.Icon.globe {...p} /> },
    { id: 'ledger', label: 'Budget', index: '02', icon: (p) => <window.Icon.wallet {...p} /> },
    { id: 'kit', label: 'Tasks', index: '03', icon: (p) => <window.Icon.check {...p} /> },
  ];

  // ── Cover / title card ────────────────────────────────────────────────
  // Shown once per browser session. It is a curtain, not a gate: a click,
  // a key, or two seconds and it is gone.
  function Cover({ onDone, stats }) {
    const [leaving, setLeaving] = React.useState(false);
    React.useEffect(() => {
      const t = setTimeout(() => setLeaving(true), 2300);
      return () => clearTimeout(t);
    }, []);
    React.useEffect(() => {
      if (!leaving) return undefined;
      const t = setTimeout(onDone, 750);
      return () => clearTimeout(t);
    }, [leaving, onDone]);
    React.useEffect(() => {
      const skip = () => setLeaving(true);
      window.addEventListener('keydown', skip);
      return () => window.removeEventListener('keydown', skip);
    }, []);
    const chapters = window.STORE.getChapters();
    let acc = 0;
    return (
      <div className={`cover ${leaving ? 'is-leaving' : ''}`} onClick={() => setLeaving(true)} role="button" tabIndex={0} aria-label="Enter the atlas">
        <div className="cover-grain" />
        <div className="cover-glow" />
        <div className="cover-stars" aria-hidden="true">
          {Array.from({ length: 46 }).map((_, i) => (
            <i key={i} style={{ left: `${(i * 37.3) % 100}%`, top: `${(i * 61.7) % 100}%`, animationDelay: `${(i % 9) * 0.4}s` }} />
          ))}
        </div>
        <div className="cover-top">
          <span>2026 — 2027</span>
          <span>SABBATICAL · NO. 01</span>
        </div>
        <div className="cover-center">
          <div className="cover-kicker">One year · two travellers · twenty-one chapters</div>
          <h1>The Long<br /><em>Way East</em></h1>
        </div>
        <div className="cover-route" aria-hidden="true">
          <span className="cover-route-line" />
          {chapters.map((c, i) => {
            const left = acc / totalDays;
            acc += c.days || 0;
            return <span key={c.id} className="cover-route-dot" style={{ left: `${left * 100}%`, background: window.chapterTint(c), animationDelay: `${0.8 + i * 0.035}s` }} />;
          })}
        </div>
        <div className="cover-bottom">
          <span>{stats.days} days</span>
          <span>{stats.countries} countries</span>
          <span>{stats.stops} stops</span>
          <span className="cover-enter">Enter the atlas <window.Icon.arrow size={12} /></span>
        </div>
      </div>
    );
  }

  // ── Header ────────────────────────────────────────────────────────────
  function Header({ view, onView, day, total, isMobile }) {
    const pct = Math.max(0, Math.min(1, day / Math.max(1, total)));
    return (
      <header className="topbar">
        <button className="brand" onClick={() => onView('atlas')} aria-label="The Long Way East — open the atlas">
          <span className="brand-mark"><window.Icon.compass size={19} /></span>
          <span className="brand-text">
            <span className="brand-name">The Long Way <em>East</em></span>
            <span className="brand-sub">Sabbatical · 2026—27</span>
          </span>
        </button>

        {!isMobile && (
          <nav className="topnav" aria-label="Sections">
            {VIEWS.map((v) => (
              <button key={v.id} className={view === v.id ? 'is-active' : ''} onClick={() => onView(v.id)}>
                <span className="topnav-index">{v.index}</span>
                <span>{v.label}</span>
              </button>
            ))}
          </nav>
        )}

        <div className="topbar-right">
          <div className="dayclock" title={`Day ${day} of ${total}`}>
            <div className="dayclock-ring" style={{ '--p': `${pct * 360}deg` }}>
              <span>{String(day).padStart(3, '0')}</span>
            </div>
            <div className="dayclock-meta">
              <span className="dayclock-of">/ {total} days</span>
              <span className="dayclock-label">on the road</span>
            </div>
          </div>
          {!isMobile && <window.SyncButton />}
        </div>
      </header>
    );
  }

  // ── The year spine ────────────────────────────────────────────────────
  // 360 individual days, coloured by chapter, dimmed once they are behind
  // you. It is the whole trip in one line and a jump target at the same time.
  function YearSpine({ chapters, current, selectedId, onPickDay, focusDay }) {
    const today = todayISO();
    const idx = window.dayIndex(today);
    const total = totalDays;
    const months = window.monthsBetween();
    const [hover, setHover] = React.useState(null);

    // One cell per day: the chapter that owns it, its date, and the city you
    // are actually in that day. The city is what the tooltip names and what a
    // click flies the map to — a day is a place, not a chapter.
    const cells = React.useMemo(() => {
      const tripStart = Date.parse('2026-06-21T00:00:00Z');
      const winsById = {};
      chapters.forEach((ch) => { winsById[ch.id] = window.TRIP_NOW.placeWindows(ch); });
      const out = [];
      let carried = null;
      for (let i = 0; i < total; i++) {
        const date = new Date(tripStart + i * 86400000).toISOString().slice(0, 10);
        // Same owner rule the rest of the app uses, so the tooltip's city and
        // the click's destination can never disagree on a shared exit day.
        const ch = currentChapter(chapters, date) || carried || chapters[chapters.length - 1];
        carried = ch;
        const wins = winsById[ch.id] || [];
        const win = wins.find((w) => w.start <= date && date <= w.end) || wins[wins.length - 1] || null;
        out.push({ ch, date, city: win ? win.place.name : ch.title, placeIdx: win ? win.idx : null });
      }
      return out;
    }, [chapters, total]);

    const focusIdx = focusDay ? window.dayIndex(focusDay) : null;
    const tip = hover != null ? cells[hover] : null;
    return (
      <div className="spine" aria-label="The year">
        <div className="spine-months">
          {months.map((m) => (
            <span key={`${m.label}-${m.year}`} style={{ left: `${(m.at / total) * 100}%` }}>
              {m.label}<i>{String(m.year).slice(2)}</i>
            </span>
          ))}
        </div>
        <div className="spine-track">
          {cells.map((cell, i) => {
            const ch = cell.ch;
            const isNow = i === idx;
            const isPast = i < idx;
            const isSelected = ch.id === selectedId;
            const isCurrent = !!current && ch.id === current.id;
            const isFocused = focusIdx === i;
            return (
              <button
                key={i}
                className={`spine-tick ${isNow ? 'is-now' : ''} ${isPast ? 'is-past' : 'is-future'} ${isSelected ? 'is-selected' : ''} ${isCurrent ? 'is-current' : ''} ${isFocused ? 'is-focused' : ''}`}
                style={{ '--tint': window.chapterTint(ch) }}
                onClick={() => onPickDay(cell.date)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                onFocus={() => setHover(i)}
                onBlur={() => setHover((h) => (h === i ? null : h))}
                aria-label={`Day ${i + 1}, ${cell.city}, ${fmt(cell.date)}`}
              />
            );
          })}
          {tip && (
            <div
              className="spine-tip"
              aria-hidden="true"
              style={{ left: `clamp(78px, ${((hover + 0.5) / total) * 100}%, calc(100% - 78px))` }}>
              <b>{fmt(tip.date)}</b>
              <span>{tip.city}</span>
            </div>
          )}
          <span className="spine-now" style={{ left: `${((idx + 0.5) / total) * 100}%` }} />
        </div>
      </div>
    );
  }

  // ── Atlas: giant chapter name ─────────────────────────────────────────
  function AtlasTitle({ active, current, selected, here, next, nowId, onOpen }) {
    const isLong = active.title.length > 12;
    // "Now" selects a chapter so the camera has somewhere to go, but the
    // title should keep the present-tense voice — today's city, the next
    // stop — rather than switching to the "you opened this" one.
    const isNow = !!nowId && active.id === nowId;
    const live = !selected || isNow;
    let sub = '';
    if (selected && !isNow) {
      sub = `${fmt(active.start)} – ${fmt(active.end)} · ${active.days} nights`;
    } else if (here && current) {
      sub = here.place.name;
    } else {
      sub = `${fmt(active.start)} – ${fmt(active.end)}`;
    }
    const weather = active.weather;
    return (
      <div className={`atlas-title ${isLong ? 'is-long' : ''}`}>
        <button className="atlas-name" onClick={onOpen} title={`Open ${active.title}`}>
          <span>{active.title}</span>
          <window.Icon.arrow size={18} />
        </button>
        <div className="atlas-sub">
          <span>{sub}</span>
          {weather && <span className="atlas-weather"><window.Icon.sun size={12} /> {weather.hi}° / {weather.lo}°</span>}
          {weather && <span className="atlas-weather"><window.Icon.rain size={12} /> {weather.rainyDays ?? 0}d</span>}
        </div>
        {live && next && (
          <div className="atlas-next">
            <span className="atlas-next-label">{current && next.chapter.id === current.id ? 'Next stop' : current ? 'Next up' : 'Begins'}</span>
            <span className="atlas-next-city">{next.place.name}</span>
            <span className="atlas-next-when">{current ? `in ${Math.max(0, daysUntil(next.start))} days` : fmt(next.start)}</span>
          </div>
        )}
      </div>
    );
  }

  // ── Atlas tools ───────────────────────────────────────────────────────
  function AtlasTools({ mapMode, onMapMode, onReset }) {
    return (
      <div className="atlas-tools">
        <div className="tool-seg" role="group" aria-label="Map style">
          <button className={mapMode === 'globe' ? 'is-active' : ''} onClick={() => onMapMode('globe')} title="3D globe"><window.Icon.globe size={12} /> <span className="tool-label">Globe</span></button>
          <button className={mapMode === 'map' ? 'is-active' : ''} onClick={() => onMapMode('map')} title="2D map"><window.Icon.map size={12} /> <span className="tool-label">Map</span></button>
        </div>
        <button className="tool-btn" onClick={onReset} title="Back to where you are today"><window.Icon.pin size={13} /> <span className="tool-label">Now</span></button>
      </div>
    );
  }

  // ── Chapter reel ──────────────────────────────────────────────────────
  function ChapterReel({ chapters, current, selectedId, onOpen }) {
    const trackRef = React.useRef(null);
    const focusId = selectedId || (current && current.id);
    React.useEffect(() => {
      const track = trackRef.current;
      if (!track) return;
      const card = track.querySelector('.reel-card.is-selected')
        || track.querySelector('.reel-card.is-now')
        || track.querySelector('.reel-card.is-focus');
      if (!card) return;
      const target = card.offsetLeft - track.offsetLeft;
      track.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }, [focusId, chapters.length]);
    // Mouse drag scrolls the strip. Touch already does it natively, so this
    // only engages for a mouse.
    //
    // Capture is taken only once the pointer has actually travelled: holding
    // it from pointerdown retargets pointerup to the track, and the browser
    // then fires the click on the track instead of the card — which silently
    // killed every card click. A press that never moves is a plain click and
    // is left alone.
    const drag = React.useRef({ active: false, x: 0, left: 0, moved: 0, captured: false });
    const DRAG_SLOP = 6;
    const onDragStart = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      const track = trackRef.current; if (!track) return;
      drag.current = { active: true, x: e.clientX, left: track.scrollLeft, moved: 0, captured: false };
    };
    const onDragMove = (e) => {
      const d = drag.current; if (!d.active) return;
      if (e.buttons === 0) { onDragEnd(e); return; }
      const dx = e.clientX - d.x;
      d.moved = Math.max(d.moved, Math.abs(dx));
      if (!d.captured && d.moved > DRAG_SLOP) {
        const track = trackRef.current;
        track.setPointerCapture(e.pointerId);
        track.classList.add('is-dragging');
        d.captured = true;
      }
      if (d.captured) trackRef.current.scrollLeft = d.left - dx;
    };
    const onDragEnd = (e) => {
      const d = drag.current; if (!d.active) return;
      d.active = false;
      const track = trackRef.current; if (!track) return;
      track.classList.remove('is-dragging');
      if (d.captured) {
        try { track.releasePointerCapture(e.pointerId); } catch {}
        d.captured = false;
      }
    };
    const onClickCapture = (e) => {
      if (drag.current.moved > DRAG_SLOP) { e.preventDefault(); e.stopPropagation(); }
      drag.current.moved = 0;
    };

    return (
      <div className="reel">
        <div className="reel-head">
          <div className="reel-head-left">
            <span className="reel-kicker">The arc</span>
            <span className="reel-count">{chapters.length} chapters · {totalDays} days</span>
          </div>
        </div>
        <div
          className="reel-track"
          ref={trackRef}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
          onClickCapture={onClickCapture}>
          {chapters.map((c) => {
            const isNow = !!current && c.id === current.id;
            const isSelected = c.id === selectedId;
            const isPast = current && c.end < todayISO();
            const status = isNow ? 'is-now' : isSelected ? 'is-selected' : isPast ? 'is-past' : '';
            return (
              <button
                key={c.id}
                className={`reel-card ${status} ${(isNow || isSelected) ? 'is-focus' : ''}`}
                onClick={() => onOpen(c.id)}
                title={`${c.title} · ${fmt(c.start)} – ${fmt(c.end)}`}>
                <span className="reel-photo">
                  <window.Photo keyword={c.photos && c.photos[0]} alt={c.title} ratio="auto" style={{ width: '100%', height: '100%', aspectRatio: 'unset' }} sizes="240px" />
                  <span className="reel-num">{c.kind === 'chapter' && c.num != null ? String(c.num).padStart(2, '0') : '··'}</span>
                  {isNow && <span className="reel-now"><i /> Now</span>}
                  <span className="reel-days">{c.days} nights</span>
                </span>
                <span className="reel-meta">
                  <span className="reel-title">{c.title}</span>
                  <span className="reel-date">{fmt(c.start)} – {fmt(c.end)} <i>·</i> {c.flag}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── App ───────────────────────────────────────────────────────────────
  function App() {
    const store = window.useStore();
    const chapters = store.getChapters();
    const [urlParams] = React.useState(readUrlParams);
    const [view, setView] = React.useState(urlParams.view || 'atlas');
    const [selectedId, setSelectedId] = React.useState(urlParams.chapterId);
    const [selectedPlaceIdx, setSelectedPlaceIdx] = React.useState(urlParams.placeIdx);
    const [focusDay, setFocusDay] = React.useState(null);
    // How tight the 2D map frames a selected stop. A day on the spine is about
    // locating the city in its country (wide); a pin click is about the city.
    const [placeZoom, setPlaceZoom] = React.useState(null);
    const [detailOpen, setDetailOpen] = React.useState(!!urlParams.chapterId && urlParams.detail !== false);
    const [focusKey, setFocusKey] = React.useState(0);
    const [mapRetry, setMapRetry] = React.useState(0);
    const [mapMode, setMapMode] = React.useState(() => {
      if (urlParams.map) return urlParams.map;
      try { return localStorage.getItem('map-mode') || 'globe'; } catch { return 'globe'; }
    });
    const [cover, setCover] = React.useState(() => {
      try {
        const q = new URLSearchParams(window.location.search);
        // A shared chapter or section link should open straight into it.
        return !sessionStorage.getItem('tlwe-cover')
          && !q.has('nocover') && !q.has('chapter') && !q.has('view') && !q.has('map');
      } catch { return false; }
    });
    const isMobile = useIsMobile();
    const stageRef = React.useRef(null);

    // Trackpad pinch arrives as ctrl+wheel, and both OrbitControls and
    // Leaflet listen on the map surface only — so a pinch that started over
    // the chapter title or the map controls did nothing. Re-dispatch those
    // gestures at the surface so the whole stage is pinchable.
    React.useEffect(() => {
      const stage = stageRef.current;
      if (!stage) return undefined;
      const onWheel = (e) => {
        if (!e.ctrlKey) return;             // pinch only; plain wheel is not ours
        const surface = stage.querySelector('.leaflet-container') || stage.querySelector('canvas');
        if (!surface || surface.contains(e.target)) return;   // already on the map
        surface.dispatchEvent(new WheelEvent('wheel', {
          deltaX: e.deltaX, deltaY: e.deltaY, deltaMode: e.deltaMode,
          ctrlKey: true, bubbles: true, cancelable: true,
        }));
      };
      stage.addEventListener('wheel', onWheel, { passive: true });
      return () => stage.removeEventListener('wheel', onWheel);
    }, [mapMode, view, cover]);

    const today = todayISO();
    const current = currentChapter(chapters, today);
    const here = current ? currentCity(chapters, today) : null;
    const next = nextCity(chapters, today);
    const active = (selectedId && store.getChapter(selectedId))
      || current
      || (next ? chapters[0] : chapters[chapters.length - 1]);
    const stats = window.tripStats();
    const day = window.dayIndex(today) + 1;

    // Reflect the whole state into the URL so any view is shareable.
    React.useEffect(() => {
      try {
        const q = new URLSearchParams(window.location.search);
        // Public names in the URL, internal ids in state.
        if (view === 'atlas') q.delete('view');
        else q.set('view', view === 'kit' ? 'tasks' : view === 'ledger' ? 'budget' : view);
        if (mapMode === 'globe') q.delete('map'); else q.set('map', '2d');
        if (selectedId) q.set('chapter', selectedId); else q.delete('chapter');
        if (selectedId && selectedPlaceIdx != null) q.set('place', String(selectedPlaceIdx)); else q.delete('place');
        if (selectedId && !detailOpen) q.set('detail', '0'); else q.delete('detail');
        q.delete('nocover');
        const qs = q.toString();
        const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
        if (nextUrl !== window.location.pathname + window.location.search) {
          window.history.replaceState(null, '', nextUrl);
        }
      } catch {}
    }, [view, mapMode, selectedId, selectedPlaceIdx, detailOpen]);

    // Escape closes the chapter panel; arrows step between chapters.
    React.useEffect(() => {
      const onKey = (e) => {
        const tag = (e.target && e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        if (e.key === 'Escape') {
          if (detailOpen) setDetailOpen(false);
        }
        if (detailOpen && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
          const i = chapters.findIndex((c) => c.id === selectedId);
          if (i < 0) return;
          const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + chapters.length) % chapters.length;
          setSelectedId(chapters[n].id);
          setSelectedPlaceIdx(null);
          setFocusDay(null);
                  }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [detailOpen, selectedId, chapters]);

    const setMapModeAndSave = (m) => {
      setMapMode(m);
      try { localStorage.setItem('map-mode', m); } catch {}
    };

    const goView = (v) => {
      setDetailOpen(false);
      setView(v);
    };

    const openChapter = (id) => {
      setSelectedId(id);
      setSelectedPlaceIdx(null);
      setFocusDay(null);
      setPlaceZoom(null);
      setDetailOpen(true);
      if (view === 'ledger' || view === 'kit') setView('atlas');
    };

    // A spine click is a date, not a chapter: jump to the city the plan has
    // you in that day, and leave the today marker where it is. The spread
    // opens on that stop; the camera only recentres.
    const openDay = (iso) => {
      const ch = currentChapter(chapters, iso);
      if (!ch) return;
      const win = window.TRIP_NOW.placeWindows(ch).find((w) => w.start <= iso && iso <= w.end);
      setFocusDay(iso);
      setSelectedId(ch.id);
      setSelectedPlaceIdx(win ? win.idx : null);
      setPlaceZoom(null);
      setDetailOpen(true);
      if (view === 'ledger' || view === 'kit') setView('atlas');
    };

    // A city click is a request to read about it: open the spread and let it
    // scroll itself to that stop. The map popup that used to appear here was
    // a smaller answer to the same question.
    const onSelectPlace = (idx) => {
      setSelectedPlaceIdx(idx);
      setPlaceZoom(12);
      setDetailOpen(true);
      if (view !== 'atlas') setView('atlas');
    };

    // "Whole route" is really "put me back where I am": today's chapter, and
    // outside the timeline the first one before the trip or the last one
    // after it. focusKey forces the view to re-frame even when the selection
    // has not changed, since a no-op setState would otherwise do nothing.
    const nowTarget = current
      || (chapters[0] && today < chapters[0].start ? chapters[0] : chapters[chapters.length - 1]);

    const onReset = () => {
      setSelectedId(nowTarget ? nowTarget.id : null);
      setSelectedPlaceIdx(null);
      setFocusDay(null);
      setPlaceZoom(null);
      setDetailOpen(false);
      setFocusKey((k) => k + 1);
    };

    const mapFallback = (err) => (
      <div className="map-container">
        <div className="map-fallback">
          <div className="kicker">The map missed its connection</div>
          <p>{String((err && err.message) || err || 'Unknown error')}</p>
          <div className="map-fallback-actions">
            <button className="pill-btn" onClick={() => setMapRetry((k) => k + 1)}>Try again</button>
            <button className="pill-btn" onClick={() => setMapModeAndSave(mapMode === 'map' ? 'globe' : 'map')}>
              Switch to {mapMode === 'map' ? '3D globe' : '2D map'}
            </button>
          </div>
        </div>
      </div>
    );

    const showDetail = detailOpen && !!selectedId && !!store.getChapter(selectedId);

    return (
      <div className={`app view-${view} ${isMobile ? 'is-mobile' : ''} ${showDetail ? 'has-detail' : ''}`}>
        <Header view={view} onView={goView} day={day} total={totalDays} isMobile={isMobile} />
        <YearSpine chapters={chapters} current={current} selectedId={selectedId} onPickDay={openDay} focusDay={focusDay} />

        <main className="app-body">
          {view === 'atlas' && (
            <div className="atlas" ref={stageRef}>
              <div className="atlas-canvas">
                <window.ErrorBoundary key={`${mapMode}:${mapRetry}`} fallback={mapFallback}>
                  {mapMode === 'globe' ? (
                    <window.GlobeView
                      selectedId={selectedId}
                      selectedPlaceIdx={selectedPlaceIdx}
                      
                      onSelectChapter={(id) => { setSelectedId(id); setSelectedPlaceIdx(null); setPlaceZoom(null); setDetailOpen(true); }}
                      onSelectPlace={onSelectPlace}
                      focusKey={focusKey}
                    />
                  ) : (
                    <window.MapView
                      selectedId={selectedId}
                      selectedPlaceIdx={selectedPlaceIdx}
                      placeZoom={placeZoom}
                      onSelectChapter={(id) => { setSelectedId(id); setSelectedPlaceIdx(null); setPlaceZoom(null); setDetailOpen(true); }}
                      onSelectPlace={onSelectPlace}
                      focusKey={focusKey}
                    />
                  )}
                </window.ErrorBoundary>
                <div className="atlas-vignette" aria-hidden="true" />
              </div>

              <AtlasTitle
                active={active}
                current={current}
                selected={!!selectedId}
                here={here}
                next={next}
                nowId={nowTarget ? nowTarget.id : null}
                onOpen={() => openChapter(active.id)}
              />

              <AtlasTools
                mapMode={mapMode}
                onMapMode={setMapModeAndSave}
                onReset={onReset}
              />

              <ChapterReel
                chapters={chapters}
                current={current}
                selectedId={selectedId}
                onOpen={openChapter}
              />
            </div>
          )}

          {(view === 'ledger' || view === 'kit') && (
            <window.Binder view={view} onClose={() => goView('atlas')} onOpenChapter={openChapter} />
          )}
        </main>

        {isMobile && (
          <nav className="bottomnav" aria-label="Sections">
            {VIEWS.map((v) => (
              <button key={v.id} className={view === v.id ? 'is-active' : ''} onClick={() => goView(v.id)}>
                {v.icon({ size: 16 })}
                <span>{v.label}</span>
              </button>
            ))}
            <window.SyncButton compact nav />
          </nav>
        )}

        {showDetail && (
          <window.DetailPanel
            chapterId={selectedId}
            selectedPlaceIdx={selectedPlaceIdx}
            onSelectPlace={onSelectPlace}
            onClose={() => setDetailOpen(false)}
            onOpenChapter={openChapter}
          />
        )}

        {cover && <Cover stats={stats} onDone={() => {
          setCover(false);
          try { sessionStorage.setItem('tlwe-cover', '1'); } catch {}
        }} />}
      </div>
    );
  }

  window.App = App;
})();
