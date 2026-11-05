"use strict";

// Photo component — Curated sources (Unsplash ID or full URL) → loremflickr fallback.
function Photo({
  keyword,
  alt,
  ratio = '4/3',
  radius = 0,
  caption,
  className = '',
  style = {}
}) {
  const {
    photoUrl
  } = window.TRIP.helpers;
  const [loaded, setLoaded] = React.useState(false);
  const photoVal = window.PHOTO_IDS?.[keyword];
  // photoVal can be a full URL (Wikipedia/Commons), a local relative path
  // (e.g. "extra-pictures/…"), or an Unsplash photo-ID string. URLs and local
  // paths contain a "/"; Unsplash IDs ("photo-xxxx") never do.
  const primary = photoVal ? photoVal.includes('/') ? photoVal : `https://images.unsplash.com/${photoVal}?w=1200&h=900&fit=crop&auto=format` : photoUrl(keyword, 1200, 900);
  const fallback = photoUrl(keyword, 1200, 900);
  const [src, setSrc] = React.useState(primary);
  React.useEffect(() => {
    setLoaded(false);
    setSrc(primary);
  }, [primary, keyword]);
  const wrap = {
    position: 'relative',
    aspectRatio: ratio === 'auto' ? undefined : ratio,
    overflow: 'hidden',
    borderRadius: radius,
    background: '#1a1814',
    ...style
  };
  return /*#__PURE__*/React.createElement("div", {
    className: `photo ${className}`,
    style: wrap
  }, /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt || keyword,
    onLoad: () => setLoaded(true),
    onError: () => {
      if (src !== fallback) setSrc(fallback);
      setLoaded(true);
    },
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      opacity: loaded ? 1 : 0,
      transition: 'opacity .35s ease',
      display: 'block'
    }
  }), !loaded && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(135deg, #2a241e, #1a1612)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: 9,
      letterSpacing: '0.18em',
      color: 'rgba(255,255,255,.3)',
      textTransform: 'uppercase'
    }
  }, "loading")), caption && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 10,
      left: 12,
      right: 12,
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: 10,
      color: 'rgba(255,255,255,.9)',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      textShadow: '0 1px 4px rgba(0,0,0,.7)'
    }
  }, caption));
}
function openMaps(query) {
  window.open(window.TRIP.helpers.mapsUrl(query), '_blank', 'noopener,noreferrer');
}

// ── "Now" ───────────────────────────────────────────────────────────────
// Which chapter today falls in, and how each chapter stands relative to it.
// Chapter dates are plain YYYY-MM-DD strings (an `end` is the exit day,
// inclusive), so string comparison is exact; today is UTC-normalised so the
// day never flips with the viewer's clock.
function todayISO() {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())).toISOString().slice(0, 10);
}
function currentChapter(chapters, today) {
  const t = today || todayISO();
  let cur = null;
  (chapters || []).forEach(c => {
    if (!c.start || !c.end || c.kind === 'transit') return;
    // Exit days are shared with the next chapter's start, so the later
    // start wins: on a move day you are already in the new chapter.
    if (c.start <= t && t <= c.end) cur = c;
  });
  return cur;
}

// 'current' for today's chapter, 'past' for chapters already exited,
// 'future' otherwise. With no current chapter (before the trip starts or
// after it ends) nothing is greyed out — the whole arc reads the same.
function chapterStatus(ch, current, today) {
  const t = today || todayISO();
  if (!current || !ch.end) return 'future';
  if (ch.id === current.id) return 'current';
  return ch.end <= t ? 'past' : 'future';
}

// First chapter that starts after today — the one you're moving into
// next. Null once the final chapter has begun (nothing follows it).
function nextChapter(chapters, today) {
  const t = today || todayISO();
  let next = null;
  (chapters || []).forEach(c => {
    if (!c.start || c.kind === 'transit') return;
    if (c.start > t && (!next || c.start < next.start)) next = c;
  });
  return next;
}

// Whole days from today to a YYYY-MM-DD date (0 = today, 2 = two days out).
function daysUntil(iso, today) {
  const t = today || todayISO();
  return Math.round((Date.parse(iso + 'T00:00:00Z') - Date.parse(t + 'T00:00:00Z')) / 86400000);
}

// Subscribe to the store and trigger re-render on any mutation.
function useStore() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => window.STORE.subscribe(force), []);
  return window.STORE;
}

// Header status: the chapter you are in right now and the one that follows
// it. Both cells are buttons — tapping jumps to that chapter. Rendered twice:
// full width in the desktop header, compact in the mobile status strip.
function NowNext({
  compact,
  onSelect
}) {
  const store = useStore();
  const chapters = store.getChapters();
  const today = window.TRIP_NOW.todayISO();
  const current = window.TRIP_NOW.currentChapter(chapters, today);
  const next = window.TRIP_NOW.nextChapter(chapters, today);
  const {
    chapterColor,
    helpers
  } = window.TRIP;
  const {
    fmt
  } = helpers;
  const go = ch => () => {
    if (onSelect) onSelect(ch.id);
  };
  const cell = (label, ch, meta) => /*#__PURE__*/React.createElement("button", {
    className: "app-now-cell",
    onClick: go(ch),
    title: `${label} — ${ch.title} (${fmt(ch.start)} – ${fmt(ch.end)})`
  }, /*#__PURE__*/React.createElement("span", {
    className: "app-now-label"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "app-now-value"
  }, /*#__PURE__*/React.createElement("span", {
    className: "app-now-dot",
    style: {
      background: chapterColor(ch)
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "app-now-title"
  }, ch.title), meta && /*#__PURE__*/React.createElement("span", {
    className: "app-now-meta"
  }, meta)));

  // No chapter contains today and none follows: the trip is over.
  if (!current && !next) {
    const last = chapters[chapters.length - 1];
    return /*#__PURE__*/React.createElement("div", {
      className: `app-now ${compact ? 'is-compact' : ''}`
    }, /*#__PURE__*/React.createElement("span", {
      className: "app-now-cell is-static"
    }, /*#__PURE__*/React.createElement("span", {
      className: "app-now-label"
    }, "Trip"), /*#__PURE__*/React.createElement("span", {
      className: "app-now-value"
    }, /*#__PURE__*/React.createElement("span", {
      className: "app-now-title"
    }, "Complete"), last && /*#__PURE__*/React.createElement("span", {
      className: "app-now-meta"
    }, fmt(last.end)))));
  }
  const left = current ? window.TRIP_NOW.daysUntil(current.end, today) : null;
  const currentMeta = left == null ? '' : left <= 0 ? 'exit day' : compact ? `${left}d left` : `${left} day${left === 1 ? '' : 's'} left`;
  const toNext = next ? window.TRIP_NOW.daysUntil(next.start, today) : 0;
  const nextMeta = !next ? '' : toNext <= 1 ? 'tomorrow' : `in ${toNext}d`;
  return /*#__PURE__*/React.createElement("div", {
    className: `app-now ${compact ? 'is-compact' : ''}`
  }, current && cell('Currently in', current, currentMeta), next && cell('Next up', next, compact ? nextMeta : `${fmt(next.start)} · ${nextMeta}`));
}
const Icon = {
  external: p => /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: p.size || 12,
    height: p.size || 12,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M15 3h6v6M10 14L21 3M21 14v7H3V3h7"
  })),
  calendar: p => /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: p.size || 14,
    height: p.size || 14,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "18",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 2v4M8 2v4M3 10h18"
  })),
  close: p => /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: p.size || 14,
    height: p.size || 14,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6L6 18M6 6l12 12"
  })),
  map: p => /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: p.size || 14,
    height: p.size || 14,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "2",
    x2: "8",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    y1: "6",
    x2: "16",
    y2: "22"
  })),
  list: p => /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: p.size || 14,
    height: p.size || 14,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "6",
    x2: "21",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "12",
    x2: "21",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "18",
    x2: "21",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "6",
    x2: "3.01",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "12",
    x2: "3.01",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "18",
    x2: "3.01",
    y2: "18"
  }))
};

// Error boundary — isolates a crashing subtree (e.g. a map view whose CDN
// failed to load) so the rest of the app keeps working. Remount via key.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      error
    };
  }
  componentDidCatch(error, info) {
    try {
      console.error('[boundary]', error, info && info.componentStack);
    } catch {}
  }
  render() {
    if (this.state.error) {
      const fb = this.props.fallback;
      return typeof fb === 'function' ? fb(this.state.error) : fb || null;
    }
    return this.props.children;
  }
}
Object.assign(window, {
  Photo,
  openMaps,
  Icon,
  useStore,
  ErrorBoundary,
  NowNext
});
window.TRIP_NOW = {
  todayISO,
  currentChapter,
  chapterStatus,
  nextChapter,
  daysUntil
};