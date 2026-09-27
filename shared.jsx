// Photo component — Curated sources (Unsplash ID or full URL) → loremflickr fallback.
function Photo({ keyword, alt, ratio = '4/3', radius = 0, caption, className = '', style = {} }) {
  const { photoUrl } = window.TRIP.helpers;
  const [loaded, setLoaded] = React.useState(false);
  const photoVal = window.PHOTO_IDS?.[keyword];
  // photoVal can be a full URL (Wikipedia/Commons), a local relative path
  // (e.g. "extra-pictures/…"), or an Unsplash photo-ID string. URLs and local
  // paths contain a "/"; Unsplash IDs ("photo-xxxx") never do.
  const primary = photoVal
    ? (photoVal.includes('/')
        ? photoVal
        : `https://images.unsplash.com/${photoVal}?w=1200&h=900&fit=crop&auto=format`)
    : photoUrl(keyword, 1200, 900);
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
    ...style,
  };

  return (
    <div className={`photo ${className}`} style={wrap}>
      <img
        src={src}
        alt={alt || keyword}
        onLoad={() => setLoaded(true)}
        onError={() => { if (src !== fallback) setSrc(fallback); setLoaded(true); }}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity .35s ease',
          display: 'block',
        }}
      />
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #2a241e, #1a1612)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 9, letterSpacing: '0.18em',
            color: 'rgba(255,255,255,.3)', textTransform: 'uppercase',
          }}>loading</div>
        </div>
      )}
      {caption && (
        <div style={{
          position: 'absolute', bottom: 10, left: 12, right: 12,
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 10, color: 'rgba(255,255,255,.9)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          textShadow: '0 1px 4px rgba(0,0,0,.7)',
        }}>{caption}</div>
      )}
    </div>
  );
}

function openMaps(query) {
  window.open(window.TRIP.helpers.mapsUrl(query), '_blank', 'noopener,noreferrer');
}

// Subscribe to the store and trigger re-render on any mutation.
function useStore() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => window.STORE.subscribe(force), []);
  return window.STORE;
}

const Icon = {
  external: (p) => <svg viewBox="0 0 24 24" width={p.size || 12} height={p.size || 12} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M10 14L21 3M21 14v7H3V3h7"/></svg>,
  calendar: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  close: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  map: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  list: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
};

// Error boundary — isolates a crashing subtree (e.g. a map view whose CDN
// failed to load) so the rest of the app keeps working. Remount via key.
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

Object.assign(window, { Photo, openMaps, Icon, useStore, ErrorBoundary });
