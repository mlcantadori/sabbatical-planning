"use strict";

// The Long Way East — app shell: chrome, year spine, atlas stage, chapter reel,
// route tour, cover, and the four sections (Atlas / Chapters / Budget / Tasks).

(function () {
  const {
    totalDays,
    helpers,
    REGIONS
  } = window.TRIP;
  const {
    fmt,
    dayCounter
  } = helpers;
  const {
    todayISO,
    currentChapter,
    currentCity,
    nextCity,
    daysUntil,
    chapterStatus
  } = window.TRIP_NOW;
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
      const view = rawView === 'chapters' ? 'chapters' : rawView === 'budget' || rawView === 'ledger' ? 'ledger' : rawView === 'todo' || rawView === 'kit' || rawView === 'tasks' ? 'kit' : rawView === 'map' || rawView === 'atlas' || rawView === 'journey' ? 'atlas' : null;
      const mapRaw = (q.get('map') || '').toLowerCase();
      const map = mapRaw === 'globe' || mapRaw === '3d' ? 'globe' : mapRaw === 'map' || mapRaw === '2d' ? 'map' : null;
      const chId = q.get('chapter');
      const ch = chId && window.STORE ? window.STORE.getChapter(chId) : null;
      let place = null;
      if (ch) {
        const n = parseInt(q.get('place'), 10);
        if (Number.isInteger(n) && n >= 0 && ch.places && n < ch.places.length) place = n;
      }
      const detail = q.get('detail');
      return {
        view,
        map,
        chapterId: ch ? ch.id : null,
        placeIdx: place,
        detail: detail === '0' ? false : null
      };
    } catch {
      return {
        view: null,
        map: null,
        chapterId: null,
        placeIdx: null,
        detail: null
      };
    }
  }
  const VIEWS = [{
    id: 'atlas',
    label: 'Atlas',
    index: '01',
    icon: p => /*#__PURE__*/React.createElement(window.Icon.globe, p)
  }, {
    id: 'chapters',
    label: 'Chapters',
    index: '02',
    icon: p => /*#__PURE__*/React.createElement(window.Icon.grid, p)
  }, {
    id: 'ledger',
    label: 'Budget',
    index: '03',
    icon: p => /*#__PURE__*/React.createElement(window.Icon.wallet, p)
  }, {
    id: 'kit',
    label: 'Tasks',
    index: '04',
    icon: p => /*#__PURE__*/React.createElement(window.Icon.check, p)
  }];

  // ── Cover / title card ────────────────────────────────────────────────
  // Shown once per browser session. It is a curtain, not a gate: a click,
  // a key, or two seconds and it is gone.
  function Cover({
    onDone,
    stats
  }) {
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
    return /*#__PURE__*/React.createElement("div", {
      className: `cover ${leaving ? 'is-leaving' : ''}`,
      onClick: () => setLeaving(true),
      role: "button",
      tabIndex: 0,
      "aria-label": "Enter the atlas"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cover-grain"
    }), /*#__PURE__*/React.createElement("div", {
      className: "cover-glow"
    }), /*#__PURE__*/React.createElement("div", {
      className: "cover-stars",
      "aria-hidden": "true"
    }, Array.from({
      length: 46
    }).map((_, i) => /*#__PURE__*/React.createElement("i", {
      key: i,
      style: {
        left: `${i * 37.3 % 100}%`,
        top: `${i * 61.7 % 100}%`,
        animationDelay: `${i % 9 * 0.4}s`
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "cover-top"
    }, /*#__PURE__*/React.createElement("span", null, "2026 \u2014 2027"), /*#__PURE__*/React.createElement("span", null, "SABBATICAL \xB7 NO. 01")), /*#__PURE__*/React.createElement("div", {
      className: "cover-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cover-kicker"
    }, "One year \xB7 two travellers \xB7 twenty-one chapters"), /*#__PURE__*/React.createElement("h1", null, "The Long", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", null, "Way East"))), /*#__PURE__*/React.createElement("div", {
      className: "cover-route",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("span", {
      className: "cover-route-line"
    }), chapters.map((c, i) => {
      const left = acc / totalDays;
      acc += c.days || 0;
      return /*#__PURE__*/React.createElement("span", {
        key: c.id,
        className: "cover-route-dot",
        style: {
          left: `${left * 100}%`,
          background: window.chapterTint(c),
          animationDelay: `${0.8 + i * 0.035}s`
        }
      });
    })), /*#__PURE__*/React.createElement("div", {
      className: "cover-bottom"
    }, /*#__PURE__*/React.createElement("span", null, stats.days, " days"), /*#__PURE__*/React.createElement("span", null, stats.countries, " countries"), /*#__PURE__*/React.createElement("span", null, stats.stops, " stops"), /*#__PURE__*/React.createElement("span", {
      className: "cover-enter"
    }, "Enter the atlas ", /*#__PURE__*/React.createElement(window.Icon.arrow, {
      size: 12
    }))));
  }

  // ── Header ────────────────────────────────────────────────────────────
  function Header({
    view,
    onView,
    day,
    total,
    isMobile
  }) {
    const pct = Math.max(0, Math.min(1, day / Math.max(1, total)));
    return /*#__PURE__*/React.createElement("header", {
      className: "topbar"
    }, /*#__PURE__*/React.createElement("button", {
      className: "brand",
      onClick: () => onView('atlas'),
      "aria-label": "The Long Way East \u2014 open the atlas"
    }, /*#__PURE__*/React.createElement("span", {
      className: "brand-mark"
    }, /*#__PURE__*/React.createElement(window.Icon.compass, {
      size: 19
    })), /*#__PURE__*/React.createElement("span", {
      className: "brand-text"
    }, /*#__PURE__*/React.createElement("span", {
      className: "brand-name"
    }, "The Long Way ", /*#__PURE__*/React.createElement("em", null, "East")), /*#__PURE__*/React.createElement("span", {
      className: "brand-sub"
    }, "Sabbatical \xB7 2026\u201427"))), !isMobile && /*#__PURE__*/React.createElement("nav", {
      className: "topnav",
      "aria-label": "Sections"
    }, VIEWS.map(v => /*#__PURE__*/React.createElement("button", {
      key: v.id,
      className: view === v.id ? 'is-active' : '',
      onClick: () => onView(v.id)
    }, /*#__PURE__*/React.createElement("span", {
      className: "topnav-index"
    }, v.index), /*#__PURE__*/React.createElement("span", null, v.label)))), /*#__PURE__*/React.createElement("div", {
      className: "topbar-right"
    }, /*#__PURE__*/React.createElement("div", {
      className: "dayclock",
      title: `Day ${day} of ${total}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "dayclock-ring",
      style: {
        '--p': `${pct * 360}deg`
      }
    }, /*#__PURE__*/React.createElement("span", null, String(day).padStart(3, '0'))), /*#__PURE__*/React.createElement("div", {
      className: "dayclock-meta"
    }, /*#__PURE__*/React.createElement("span", {
      className: "dayclock-of"
    }, "/ ", total, " days"), /*#__PURE__*/React.createElement("span", {
      className: "dayclock-label"
    }, "on the road"))), !isMobile && /*#__PURE__*/React.createElement(window.SyncButton, null)));
  }

  // ── The year spine ────────────────────────────────────────────────────
  // 360 individual days, coloured by chapter, dimmed once they are behind
  // you. It is the whole trip in one line and a jump target at the same time.
  function YearSpine({
    chapters,
    current,
    selectedId,
    onPickDay,
    focusDay
  }) {
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
      chapters.forEach(ch => {
        winsById[ch.id] = window.TRIP_NOW.placeWindows(ch);
      });
      const out = [];
      let carried = null;
      for (let i = 0; i < total; i++) {
        const date = new Date(tripStart + i * 86400000).toISOString().slice(0, 10);
        // Same owner rule the rest of the app uses, so the tooltip's city and
        // the click's destination can never disagree on a shared exit day.
        const ch = currentChapter(chapters, date) || carried || chapters[chapters.length - 1];
        carried = ch;
        const wins = winsById[ch.id] || [];
        const win = wins.find(w => w.start <= date && date <= w.end) || wins[wins.length - 1] || null;
        out.push({
          ch,
          date,
          city: win ? win.place.name : ch.title,
          placeIdx: win ? win.idx : null
        });
      }
      return out;
    }, [chapters, total]);
    const focusIdx = focusDay ? window.dayIndex(focusDay) : null;
    const tip = hover != null ? cells[hover] : null;
    return /*#__PURE__*/React.createElement("div", {
      className: "spine",
      "aria-label": "The year"
    }, /*#__PURE__*/React.createElement("div", {
      className: "spine-months"
    }, months.map(m => /*#__PURE__*/React.createElement("span", {
      key: `${m.label}-${m.year}`,
      style: {
        left: `${m.at / total * 100}%`
      }
    }, m.label, /*#__PURE__*/React.createElement("i", null, String(m.year).slice(2))))), /*#__PURE__*/React.createElement("div", {
      className: "spine-track"
    }, cells.map((cell, i) => {
      const ch = cell.ch;
      const isNow = i === idx;
      const isPast = i < idx;
      const isSelected = ch.id === selectedId;
      const isCurrent = !!current && ch.id === current.id;
      const isFocused = focusIdx === i;
      return /*#__PURE__*/React.createElement("button", {
        key: i,
        className: `spine-tick ${isNow ? 'is-now' : ''} ${isPast ? 'is-past' : 'is-future'} ${isSelected ? 'is-selected' : ''} ${isCurrent ? 'is-current' : ''} ${isFocused ? 'is-focused' : ''}`,
        style: {
          '--tint': window.chapterTint(ch)
        },
        onClick: () => onPickDay(cell.date),
        onMouseEnter: () => setHover(i),
        onMouseLeave: () => setHover(h => h === i ? null : h),
        onFocus: () => setHover(i),
        onBlur: () => setHover(h => h === i ? null : h),
        "aria-label": `Day ${i + 1}, ${cell.city}, ${fmt(cell.date)}`
      });
    }), tip && /*#__PURE__*/React.createElement("div", {
      className: "spine-tip",
      "aria-hidden": "true",
      style: {
        left: `clamp(78px, ${(hover + 0.5) / total * 100}%, calc(100% - 78px))`
      }
    }, /*#__PURE__*/React.createElement("b", null, fmt(tip.date)), /*#__PURE__*/React.createElement("span", null, tip.city)), /*#__PURE__*/React.createElement("span", {
      className: "spine-now",
      style: {
        left: `${(idx + 0.5) / total * 100}%`
      }
    })));
  }

  // ── Atlas: giant chapter name ─────────────────────────────────────────
  function AtlasTitle({
    active,
    current,
    selected,
    here,
    next,
    onOpen
  }) {
    const isLong = active.title.length > 12;
    let sub = '';
    if (selected) {
      sub = `${fmt(active.start)} – ${fmt(active.end)} · ${active.days} nights`;
    } else if (here && current) {
      const left = next ? daysUntil(next.start) : daysUntil(current.end);
      sub = `${here.place.name} · ${left <= 0 ? 'leaving today' : `${left} day${left === 1 ? '' : 's'} left`}`;
    } else {
      sub = `${fmt(active.start)} – ${fmt(active.end)}`;
    }
    const weather = active.weather;
    return /*#__PURE__*/React.createElement("div", {
      className: `atlas-title ${isLong ? 'is-long' : ''}`
    }, /*#__PURE__*/React.createElement("button", {
      className: "atlas-name",
      onClick: onOpen,
      title: `Open ${active.title}`
    }, /*#__PURE__*/React.createElement("span", null, active.title), /*#__PURE__*/React.createElement(window.Icon.arrow, {
      size: 18
    })), /*#__PURE__*/React.createElement("div", {
      className: "atlas-sub"
    }, /*#__PURE__*/React.createElement("span", null, sub), weather && /*#__PURE__*/React.createElement("span", {
      className: "atlas-weather"
    }, /*#__PURE__*/React.createElement(window.Icon.sun, {
      size: 12
    }), " ", weather.hi, "\xB0 / ", weather.lo, "\xB0"), weather && /*#__PURE__*/React.createElement("span", {
      className: "atlas-weather"
    }, /*#__PURE__*/React.createElement(window.Icon.rain, {
      size: 12
    }), " ", weather.rainyDays ?? 0, "d")), !selected && next && /*#__PURE__*/React.createElement("div", {
      className: "atlas-next"
    }, /*#__PURE__*/React.createElement("span", {
      className: "atlas-next-label"
    }, current && next.chapter.id === current.id ? 'Next stop' : current ? 'Next up' : 'Begins'), /*#__PURE__*/React.createElement("span", {
      className: "atlas-next-city"
    }, next.place.name), /*#__PURE__*/React.createElement("span", {
      className: "atlas-next-when"
    }, current ? `in ${Math.max(0, daysUntil(next.start))} days` : fmt(next.start))));
  }

  // ── Atlas tools ───────────────────────────────────────────────────────
  function AtlasTools({
    mapMode,
    onMapMode,
    onReset,
    tour,
    onTour
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "atlas-tools"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tool-seg",
      role: "group",
      "aria-label": "Map style"
    }, /*#__PURE__*/React.createElement("button", {
      className: mapMode === 'globe' ? 'is-active' : '',
      onClick: () => onMapMode('globe'),
      title: "3D globe"
    }, /*#__PURE__*/React.createElement(window.Icon.globe, {
      size: 12
    }), " ", /*#__PURE__*/React.createElement("span", {
      className: "tool-label"
    }, "Globe")), /*#__PURE__*/React.createElement("button", {
      className: mapMode === 'map' ? 'is-active' : '',
      onClick: () => onMapMode('map'),
      title: "2D map"
    }, /*#__PURE__*/React.createElement(window.Icon.map, {
      size: 12
    }), " ", /*#__PURE__*/React.createElement("span", {
      className: "tool-label"
    }, "Map"))), /*#__PURE__*/React.createElement("button", {
      className: "tool-btn",
      onClick: onReset,
      title: "Zoom back to the whole route"
    }, /*#__PURE__*/React.createElement(window.Icon.compass, {
      size: 13
    }), " ", /*#__PURE__*/React.createElement("span", {
      className: "tool-label"
    }, "Whole route")), /*#__PURE__*/React.createElement("button", {
      className: `tool-btn ${tour ? 'is-live' : ''}`,
      onClick: onTour,
      title: "Fly through every chapter"
    }, tour ? /*#__PURE__*/React.createElement(window.Icon.stop, {
      size: 11
    }) : /*#__PURE__*/React.createElement(window.Icon.play, {
      size: 10
    }), /*#__PURE__*/React.createElement("span", {
      className: "tool-label"
    }, tour ? 'Stop tour' : 'Route tour')));
  }

  // ── Chapter reel ──────────────────────────────────────────────────────
  function ChapterReel({
    chapters,
    current,
    selectedId,
    onOpen
  }) {
    const trackRef = React.useRef(null);
    const focusId = selectedId || current && current.id;
    React.useEffect(() => {
      const track = trackRef.current;
      if (!track) return;
      const card = track.querySelector('.reel-card.is-selected') || track.querySelector('.reel-card.is-now') || track.querySelector('.reel-card.is-focus');
      if (!card) return;
      const target = card.offsetLeft - track.offsetLeft;
      track.scrollTo({
        left: Math.max(0, target),
        behavior: 'smooth'
      });
    }, [focusId, chapters.length]);
    const nudge = d => {
      const track = trackRef.current;
      if (track) track.scrollBy({
        left: d * Math.max(280, track.clientWidth * 0.7),
        behavior: 'smooth'
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "reel"
    }, /*#__PURE__*/React.createElement("div", {
      className: "reel-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "reel-head-left"
    }, /*#__PURE__*/React.createElement("span", {
      className: "reel-kicker"
    }, "The arc"), /*#__PURE__*/React.createElement("span", {
      className: "reel-count"
    }, chapters.length, " chapters \xB7 ", totalDays, " days")), /*#__PURE__*/React.createElement("div", {
      className: "reel-head-right"
    }, /*#__PURE__*/React.createElement("button", {
      className: "reel-arrow",
      onClick: () => nudge(-1),
      "aria-label": "Earlier chapters"
    }, /*#__PURE__*/React.createElement(window.Icon.chevronLeft, {
      size: 14
    })), /*#__PURE__*/React.createElement("button", {
      className: "reel-arrow",
      onClick: () => nudge(1),
      "aria-label": "Later chapters"
    }, /*#__PURE__*/React.createElement(window.Icon.chevronRight, {
      size: 14
    })))), /*#__PURE__*/React.createElement("div", {
      className: "reel-track",
      ref: trackRef
    }, chapters.map(c => {
      const isNow = !!current && c.id === current.id;
      const isSelected = c.id === selectedId;
      const isPast = current && c.end < todayISO();
      const status = isNow ? 'is-now' : isSelected ? 'is-selected' : isPast ? 'is-past' : '';
      return /*#__PURE__*/React.createElement("button", {
        key: c.id,
        className: `reel-card ${status} ${isNow || isSelected ? 'is-focus' : ''}`,
        onClick: () => onOpen(c.id),
        title: `${c.title} · ${fmt(c.start)} – ${fmt(c.end)}`
      }, /*#__PURE__*/React.createElement("span", {
        className: "reel-photo"
      }, /*#__PURE__*/React.createElement(window.Photo, {
        keyword: c.photos && c.photos[0],
        alt: c.title,
        ratio: "auto",
        style: {
          width: '100%',
          height: '100%',
          aspectRatio: 'unset'
        },
        sizes: "240px"
      }), /*#__PURE__*/React.createElement("span", {
        className: "reel-num"
      }, c.kind === 'chapter' && c.num != null ? String(c.num).padStart(2, '0') : '··'), isNow && /*#__PURE__*/React.createElement("span", {
        className: "reel-now"
      }, /*#__PURE__*/React.createElement("i", null), " Now"), /*#__PURE__*/React.createElement("span", {
        className: "reel-days"
      }, c.days, " nights")), /*#__PURE__*/React.createElement("span", {
        className: "reel-meta"
      }, /*#__PURE__*/React.createElement("span", {
        className: "reel-title"
      }, c.title), /*#__PURE__*/React.createElement("span", {
        className: "reel-date"
      }, fmt(c.start), " \u2013 ", fmt(c.end), " ", /*#__PURE__*/React.createElement("i", null, "\xB7"), " ", c.flag)));
    })));
  }

  // ── Tour bar ──────────────────────────────────────────────────────────
  function TourBar({
    index,
    total,
    chapter,
    onStop
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "tourbar"
    }, /*#__PURE__*/React.createElement("span", {
      className: "tourbar-live"
    }, /*#__PURE__*/React.createElement("i", null), " Live"), /*#__PURE__*/React.createElement("span", {
      className: "tourbar-name"
    }, chapter.title), /*#__PURE__*/React.createElement("span", {
      className: "tourbar-track"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: `${(index + 1) / total * 100}%`
      }
    })), /*#__PURE__*/React.createElement("span", {
      className: "tourbar-count"
    }, String(index + 1).padStart(2, '0'), " / ", String(total).padStart(2, '0')), /*#__PURE__*/React.createElement("button", {
      onClick: onStop
    }, "Stop"));
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
    // Whether the map should show the stop popup. Only a click on the map's own
    // dot sets this; a spine click just recentres the camera.
    const [placePopup, setPlacePopup] = React.useState(false);
    // How tight the 2D map frames a selected stop. A day on the spine is about
    // locating the city in its country (wide); a pin click is about the city.
    const [placeZoom, setPlaceZoom] = React.useState(null);
    const [detailOpen, setDetailOpen] = React.useState(!!urlParams.chapterId && urlParams.detail !== false);
    const [focusKey, setFocusKey] = React.useState(0);
    const [mapRetry, setMapRetry] = React.useState(0);
    const [mapMode, setMapMode] = React.useState(() => {
      if (urlParams.map) return urlParams.map;
      try {
        return localStorage.getItem('map-mode') || 'globe';
      } catch {
        return 'globe';
      }
    });
    const [tour, setTour] = React.useState(null);
    const [cover, setCover] = React.useState(() => {
      try {
        const q = new URLSearchParams(window.location.search);
        // A shared chapter or section link should open straight into it.
        return !sessionStorage.getItem('tlwe-cover') && !q.has('nocover') && !q.has('chapter') && !q.has('view') && !q.has('map');
      } catch {
        return false;
      }
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
      const onWheel = e => {
        if (!e.ctrlKey) return; // pinch only; plain wheel is not ours
        const surface = stage.querySelector('.leaflet-container') || stage.querySelector('canvas');
        if (!surface || surface.contains(e.target)) return; // already on the map
        surface.dispatchEvent(new WheelEvent('wheel', {
          deltaX: e.deltaX,
          deltaY: e.deltaY,
          deltaMode: e.deltaMode,
          ctrlKey: true,
          bubbles: true,
          cancelable: true
        }));
      };
      stage.addEventListener('wheel', onWheel, {
        passive: true
      });
      return () => stage.removeEventListener('wheel', onWheel);
    }, [mapMode, view, cover]);
    const today = todayISO();
    const current = currentChapter(chapters, today);
    const here = current ? currentCity(chapters, today) : null;
    const next = nextCity(chapters, today);
    const active = selectedId && store.getChapter(selectedId) || current || (next ? chapters[0] : chapters[chapters.length - 1]);
    const stats = window.tripStats();
    const day = window.dayIndex(today) + 1;

    // Reflect the whole state into the URL so any view is shareable.
    React.useEffect(() => {
      try {
        const q = new URLSearchParams(window.location.search);
        if (view === 'atlas') q.delete('view');else q.set('view', view);
        if (mapMode === 'globe') q.delete('map');else q.set('map', '2d');
        if (selectedId) q.set('chapter', selectedId);else q.delete('chapter');
        if (selectedId && selectedPlaceIdx != null) q.set('place', String(selectedPlaceIdx));else q.delete('place');
        if (selectedId && !detailOpen) q.set('detail', '0');else q.delete('detail');
        q.delete('nocover');
        const qs = q.toString();
        const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
        if (nextUrl !== window.location.pathname + window.location.search) {
          window.history.replaceState(null, '', nextUrl);
        }
      } catch {}
    }, [view, mapMode, selectedId, selectedPlaceIdx, detailOpen]);

    // Tour: one chapter every 5.2s, camera flying between anchors.
    React.useEffect(() => {
      if (tour == null) return undefined;
      const idx = Math.min(tour, chapters.length - 1);
      const ch = chapters[idx];
      if (!ch) {
        setTour(null);
        return undefined;
      }
      setSelectedId(ch.id);
      setSelectedPlaceIdx(null);
      setFocusDay(null);
      setPlacePopup(false);
      setDetailOpen(false);
      const t = setTimeout(() => {
        setTour(cur => cur == null ? null : cur >= chapters.length - 1 ? null : cur + 1);
      }, 5200);
      return () => clearTimeout(t);
    }, [tour, chapters.length]);

    // Escape closes the chapter panel; arrows step between chapters.
    React.useEffect(() => {
      const onKey = e => {
        const tag = (e.target && e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        if (e.key === 'Escape') {
          if (detailOpen) setDetailOpen(false);else if (tour != null) setTour(null);
        }
        if (detailOpen && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
          const i = chapters.findIndex(c => c.id === selectedId);
          if (i < 0) return;
          const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + chapters.length) % chapters.length;
          setSelectedId(chapters[n].id);
          setSelectedPlaceIdx(null);
          setFocusDay(null);
          setPlacePopup(false);
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [detailOpen, selectedId, tour, chapters]);
    const setMapModeAndSave = m => {
      setMapMode(m);
      try {
        localStorage.setItem('map-mode', m);
      } catch {}
    };
    const goView = v => {
      setTour(null);
      setDetailOpen(false);
      setView(v);
    };
    const openChapter = id => {
      setTour(null);
      setSelectedId(id);
      setSelectedPlaceIdx(null);
      setFocusDay(null);
      setPlacePopup(false);
      setPlaceZoom(null);
      setDetailOpen(true);
      if (view === 'ledger' || view === 'kit') setView('atlas');
    };

    // A spine click is a date, not a chapter: jump to the city the plan has
    // you in that day, and leave the today marker where it is. The camera
    // recentres; the Google-Maps popup stays shut unless you click the dot.
    const openDay = iso => {
      const ch = currentChapter(chapters, iso);
      if (!ch) return;
      const win = window.TRIP_NOW.placeWindows(ch).find(w => w.start <= iso && iso <= w.end);
      setTour(null);
      setFocusDay(iso);
      setSelectedId(ch.id);
      setSelectedPlaceIdx(win ? win.idx : null);
      setPlacePopup(false);
      setPlaceZoom(null);
      setDetailOpen(true);
      if (view === 'ledger' || view === 'kit') setView('atlas');
    };
    const onSelectPlace = idx => {
      setSelectedPlaceIdx(idx);
      setPlacePopup(true);
      setPlaceZoom(12);
      if (view !== 'atlas') setView('atlas');
    };
    const onReset = () => {
      setTour(null);
      setSelectedId(null);
      setSelectedPlaceIdx(null);
      setFocusDay(null);
      setPlacePopup(false);
      setPlaceZoom(null);
      setDetailOpen(false);
      setFocusKey(k => k + 1);
    };
    const startTour = () => {
      if (tour != null) {
        setTour(null);
        return;
      }
      const base = current || chapters[0];
      const i = Math.max(0, chapters.findIndex(c => c.id === (selectedId || base.id)));
      setView('atlas');
      setDetailOpen(false);
      setTour(i >= chapters.length - 1 ? 0 : i);
    };
    const mapFallback = err => /*#__PURE__*/React.createElement("div", {
      className: "map-container"
    }, /*#__PURE__*/React.createElement("div", {
      className: "map-fallback"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "The map missed its connection"), /*#__PURE__*/React.createElement("p", null, String(err && err.message || err || 'Unknown error')), /*#__PURE__*/React.createElement("div", {
      className: "map-fallback-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "pill-btn",
      onClick: () => setMapRetry(k => k + 1)
    }, "Try again"), /*#__PURE__*/React.createElement("button", {
      className: "pill-btn",
      onClick: () => setMapModeAndSave(mapMode === 'map' ? 'globe' : 'map')
    }, "Switch to ", mapMode === 'map' ? '3D globe' : '2D map'))));
    const showDetail = detailOpen && !!selectedId && !!store.getChapter(selectedId);
    return /*#__PURE__*/React.createElement("div", {
      className: `app view-${view} ${isMobile ? 'is-mobile' : ''} ${showDetail ? 'has-detail' : ''}`
    }, /*#__PURE__*/React.createElement(Header, {
      view: view,
      onView: goView,
      day: day,
      total: totalDays,
      isMobile: isMobile
    }), /*#__PURE__*/React.createElement(YearSpine, {
      chapters: chapters,
      current: current,
      selectedId: selectedId,
      onPickDay: openDay,
      focusDay: focusDay
    }), /*#__PURE__*/React.createElement("main", {
      className: "app-body"
    }, view === 'atlas' && /*#__PURE__*/React.createElement("div", {
      className: "atlas",
      ref: stageRef
    }, /*#__PURE__*/React.createElement("div", {
      className: "atlas-canvas"
    }, /*#__PURE__*/React.createElement(window.ErrorBoundary, {
      key: `${mapMode}:${mapRetry}`,
      fallback: mapFallback
    }, mapMode === 'globe' ? /*#__PURE__*/React.createElement(window.GlobeView, {
      selectedId: selectedId,
      selectedPlaceIdx: selectedPlaceIdx,
      showPlacePopup: placePopup,
      onSelectChapter: id => {
        setSelectedId(id);
        setSelectedPlaceIdx(null);
        setPlacePopup(false);
        setPlaceZoom(null);
        setDetailOpen(true);
        setTour(null);
      },
      onSelectPlace: onSelectPlace,
      focusKey: focusKey === 0 ? null : 'world'
    }) : /*#__PURE__*/React.createElement(window.MapView, {
      selectedId: selectedId,
      selectedPlaceIdx: selectedPlaceIdx,
      placeZoom: placeZoom,
      onSelectChapter: id => {
        setSelectedId(id);
        setSelectedPlaceIdx(null);
        setPlacePopup(false);
        setPlaceZoom(null);
        setDetailOpen(true);
        setTour(null);
      },
      onSelectPlace: onSelectPlace,
      focusKey: focusKey === 0 ? null : 'world'
    })), /*#__PURE__*/React.createElement("div", {
      className: "atlas-vignette",
      "aria-hidden": "true"
    })), /*#__PURE__*/React.createElement(AtlasTitle, {
      active: active,
      current: current,
      selected: !!selectedId,
      here: here,
      next: next,
      onOpen: () => openChapter(active.id)
    }), /*#__PURE__*/React.createElement(AtlasTools, {
      mapMode: mapMode,
      onMapMode: setMapModeAndSave,
      onReset: onReset,
      tour: tour,
      onTour: startTour
    }), tour != null && /*#__PURE__*/React.createElement(TourBar, {
      index: tour,
      total: chapters.length,
      chapter: chapters[tour],
      onStop: () => setTour(null)
    }), /*#__PURE__*/React.createElement(ChapterReel, {
      chapters: chapters,
      current: current,
      selectedId: selectedId,
      onOpen: openChapter
    })), view === 'chapters' && /*#__PURE__*/React.createElement(window.ChaptersView, {
      current: current,
      selectedId: selectedId,
      onOpen: openChapter
    }), (view === 'ledger' || view === 'kit') && /*#__PURE__*/React.createElement(window.Binder, {
      view: view,
      onClose: () => goView('atlas'),
      onOpenChapter: openChapter
    })), isMobile && /*#__PURE__*/React.createElement("nav", {
      className: "bottomnav",
      "aria-label": "Sections"
    }, VIEWS.map(v => /*#__PURE__*/React.createElement("button", {
      key: v.id,
      className: view === v.id ? 'is-active' : '',
      onClick: () => goView(v.id)
    }, v.icon({
      size: 16
    }), /*#__PURE__*/React.createElement("span", null, v.label))), /*#__PURE__*/React.createElement(window.SyncButton, {
      compact: true,
      nav: true
    })), showDetail && /*#__PURE__*/React.createElement(window.DetailPanel, {
      chapterId: selectedId,
      selectedPlaceIdx: selectedPlaceIdx,
      onSelectPlace: onSelectPlace,
      onClose: () => setDetailOpen(false),
      onOpenChapter: openChapter
    }), cover && /*#__PURE__*/React.createElement(Cover, {
      stats: stats,
      onDone: () => {
        setCover(false);
        try {
          sessionStorage.setItem('tlwe-cover', '1');
        } catch {}
      }
    }));
  }
  window.App = App;
})();