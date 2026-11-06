// Shared UI primitives — photography, icons, "now" math, the journey spectrum.
// Loaded after the data scripts and the store.

// ── The journey spectrum ────────────────────────────────────────────────
// One continuous arc from departure ember to the violet of the last spring.
// Chapter colour is derived from position in the arc, so the year reads as a
// single gesture — on the globe, in the spine, and on every card.
const SPECTRUM = [
  '#ff7a45', '#ff8a48', '#ff9a4c', '#fdaa51', '#f8b957', '#efc55e',
  '#e2cd66', '#d2d16e', '#bfd376', '#aad27f', '#96cf8a', '#84ca96',
  '#75c5a3', '#69bfae', '#60b8b8', '#5bb0c1', '#5aa7c8', '#5f9ccb',
  '#6990c9', '#7a83c2', '#8b77b8',
];
(function applySpectrum() {
  const chapters = window.STORE.getChapters();
  chapters.forEach((c, i) => {
    window.TRIP.CHAPTER_COLORS[c.id] = SPECTRUM[i % SPECTRUM.length];
  });
})();

function chapterTint(ch) {
  return (ch && window.TRIP.chapterColor(ch)) || SPECTRUM[0];
}

// Photo component — curated local sources (or Unsplash IDs), loremflickr fallback.
function Photo({ keyword, alt, ratio = '4/3', radius = 0, caption, className = '', style = {}, loading = 'lazy', sizes }) {
  const { photoUrl } = window.TRIP.helpers;
  const [loaded, setLoaded] = React.useState(false);
  const photoVal = window.PHOTO_IDS?.[keyword];
  // photoVal can be a full URL (Wikimedia/Commons), a local relative path, or
  // an Unsplash photo-ID. URLs and paths contain "/"; IDs never do.
  const primary = photoVal
    ? (photoVal.includes('/')
        ? photoVal
        : `https://images.unsplash.com/${photoVal}?w=1600&h=1200&fit=crop&auto=format`)
    : photoUrl(keyword, 1600, 1200);
  const fallback = photoUrl(keyword, 1600, 1200);
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
    background: '#11151c',
    ...style,
  };

  // Vendored photos have a 480px WebP twin beside them (scripts/make-reel-
  // thumbs.py). Offering both by width lets a 240px reel slot pull 26KB
  // instead of the 190KB original, while a full-width hero still gets the
  // original because its sizes ask for it.
  const thumb = (/^extra-pictures\/(.+)$/.exec(src) || [])[1];

  return (
    <div className={`photo ${className}`} style={wrap}>
      <img
        src={src}
        srcSet={thumb ? `extra-pictures/thumbs/${thumb.replace(/\.[^.]+$/, '.webp')} 480w, ${src} 1600w` : undefined}
        alt={alt || keyword}
        loading={loading}
        decoding="async"
        sizes={thumb ? (sizes || '100vw') : sizes}
        onLoad={() => setLoaded(true)}
        onError={() => { if (src !== fallback) setSrc(fallback); setLoaded(true); }}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity .5s ease, transform .8s cubic-bezier(.2,.7,.2,1)',
          display: 'block',
        }}
      />
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #151b24, #0b0f15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10, letterSpacing: '0.24em',
            color: 'rgba(244,236,220,.24)', textTransform: 'uppercase',
          }}>loading</div>
        </div>
      )}
      {caption && (
        <div style={{
          position: 'absolute', bottom: 12, left: 14, right: 14,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11, color: 'rgba(255,255,255,.92)',
          letterSpacing: '0.16em', textTransform: 'uppercase',
          textShadow: '0 1px 8px rgba(0,0,0,.8)',
        }}>{caption}</div>
      )}
    </div>
  );
}

function openMaps(query) {
  window.open(window.TRIP.helpers.mapsUrl(query), '_blank', 'noopener,noreferrer');
}

// ── "Now" ───────────────────────────────────────────────────────────────
function todayISO() {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())).toISOString().slice(0, 10);
}

function currentChapter(chapters, today) {
  const t = today || todayISO();
  let cur = null;
  (chapters || []).forEach((c) => {
    if (!c.start || !c.end || c.kind === 'transit') return;
    // Exit days are shared with the next chapter's start, so the later start wins.
    if (c.start <= t && t <= c.end) cur = c;
  });
  return cur;
}

function chapterStatus(ch, current, today) {
  const t = today || todayISO();
  if (!current || !ch.end) return 'future';
  if (ch.id === current.id) return 'current';
  return ch.end <= t ? 'past' : 'future';
}

function daysUntil(iso, today) {
  const t = today || todayISO();
  return Math.round((Date.parse(iso + 'T00:00:00Z') - Date.parse(t + 'T00:00:00Z')) / 86400000);
}

// Every stop with its own inclusive date window, derived from chapter start
// and cumulative night counts — the same math the detail panel uses.
function placeWindows(ch) {
  if (!ch || !ch.start) return [];
  const base = Date.parse(ch.start + 'T00:00:00Z');
  let offset = 0;
  return (ch.places || []).map((place, idx) => {
    const start = new Date(base + offset * 86400000).toISOString().slice(0, 10);
    const end = new Date(base + (offset + (place.days || 1) - 1) * 86400000).toISOString().slice(0, 10);
    offset += place.days || 1;
    return { place, idx, start, end, chapter: ch };
  });
}

function currentCity(chapters, today) {
  const t = today || todayISO();
  const ch = currentChapter(chapters, t);
  if (!ch) return null;
  const wins = placeWindows(ch);
  const hit = wins.find((w) => w.start <= t && t <= w.end);
  return hit || wins.filter((w) => w.start <= t).pop() || null;
}

function nextCity(chapters, today) {
  const t = today || todayISO();
  const stops = [];
  (chapters || []).forEach((c) => {
    if (c.kind === 'transit') return;
    placeWindows(c).forEach((w) => stops.push(w));
  });
  stops.sort((a, b) => a.start.localeCompare(b.start));
  return stops.find((s) => s.start > t) || null;
}

// Subscribe to the store and re-render on mutation.
function useStore() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => window.STORE.subscribe(force), []);
  return window.STORE;
}

// Index of a date within the 360-day arc (0-based), clamped.
function dayIndex(iso) {
  const start = Date.parse('2026-06-21T00:00:00Z');
  const d = Date.parse((iso || todayISO()) + 'T00:00:00Z');
  return Math.max(0, Math.min(window.TRIP.totalDays - 1, Math.round((d - start) / 86400000)));
}

function monthsBetween() {
  const out = [];
  const start = new Date(Date.UTC(2026, 5, 21));
  const end = new Date(Date.UTC(2027, 5, 16));
  const names = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  let d = new Date(start);
  while (d <= end) {
    const y = d.getUTCFullYear(), m = d.getUTCMonth();
    // A month the trip only clips — it began before the trip did — gets no
    // label: JUN would sit ten days before JUL and the two collide.
    if (d.getTime() === Date.UTC(y, m, 1)) {
      out.push({ label: names[m], year: y, at: dayIndex(d.toISOString().slice(0, 10)) });
    }
    d = new Date(Date.UTC(y, m + 1, 1));
  }
  return out;
}

// Trip-wide facts used in headers and the cover.
function tripStats() {
  const chapters = window.STORE.getChapters().filter((c) => c.kind !== 'transit');
  const countries = new Set(chapters.map((c) => c.country));
  const stops = chapters.reduce((s, c) => s + (c.places ? c.places.length : 0), 0);
  return {
    chapters: chapters.length,
    days: window.TRIP.totalDays,
    countries: countries.size,
    stops,
    starts: window.TRIP.start,
    ends: window.TRIP.end,
  };
}

const Icon = {
  external: (p) => <svg viewBox="0 0 24 24" width={p.size || 12} height={p.size || 12} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M10 14L21 3M21 14v7H3V3h7"/></svg>,
  calendar: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  close: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  map: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  globe: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.7 2.7 4 6.1 4 9.5s-1.3 6.8-4 9.5c-2.7-2.7-4-6.1-4-9.5s1.3-6.8 4-9.5z"/></svg>,
  list: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  grid: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="7.5" height="7.5" rx="1"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1"/></svg>,
  wallet: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H19a1 1 0 0 1 1 1v2.5"/><path d="M3 7.5V18a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H5.5A2.5 2.5 0 0 1 3 7.5z"/><circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" stroke="none"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12.5l6 6L21 5"/></svg>,
  play: (p) => <svg viewBox="0 0 24 24" width={p.size || 12} height={p.size || 12} fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>,
  stop: (p) => <svg viewBox="0 0 24 24" width={p.size || 12} height={p.size || 12} fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>,
  arrow: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16M14 6l6 6-6 6"/></svg>,
  arrowLeft: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12H4M10 6l-6 6 6 6"/></svg>,
  chevronLeft: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 5l-7 7 7 7"/></svg>,
  chevronRight: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 5l7 7-7 7"/></svg>,
  compass: (p) => <svg viewBox="0 0 24 24" width={p.size || 16} height={p.size || 16} fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9.2"/><path d="M15.6 8.4l-2.2 5.4-5.4 2.2 2.2-5.4z" fill="currentColor" stroke="none"/></svg>,
  pin: (p) => <svg viewBox="0 0 24 24" width={p.size || 13} height={p.size || 13} fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>,
  sun: (p) => <svg viewBox="0 0 24 24" width={p.size || 13} height={p.size || 13} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>,
  rain: (p) => <svg viewBox="0 0 24 24" width={p.size || 13} height={p.size || 13} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M7 15a4.5 4.5 0 0 1 .4-9A6 6 0 0 1 19 7.5a3.8 3.8 0 0 1 .5 7.5"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/></svg>,
};

// Error boundary — isolates a crashing subtree (e.g. a map view whose CDN failed).
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    try { console.error('[boundary]', error, info && info.componentStack); } catch {}
  }
  render() {
    if (this.state.error) {
      const fb = this.props.fallback;
      return typeof fb === 'function' ? fb(this.state.error) : (fb || null);
    }
    return this.props.children;
  }
}

// ── Data fingerprints ───────────────────────────────────────────────────
// Stable, cheap digest (FNV-1a over a string) of a sync payload. Calendar and
// Tasks each store one after a successful push and compare the current payload
// on load, so the header can say "this moved since the last sync" without
// calling Google. Payloads are built deterministically, so equal data always
// digests equal — array order is part of the fingerprint on purpose.
function dataDigest(value) {
  const s = typeof value === 'string' ? value : JSON.stringify(value);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Length rides along so a collision would also have to match size.
  return (h >>> 0).toString(16) + ':' + s.length.toString(36);
}

Object.assign(window, {
  Photo, openMaps, Icon, useStore, ErrorBoundary, dataDigest,
  chapterTint, SPECTRUM, dayIndex, monthsBetween, tripStats,
});
window.TRIP_NOW = { todayISO, currentChapter, chapterStatus, daysUntil, placeWindows, currentCity, nextCity };
