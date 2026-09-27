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

// Subscribe to the store and trigger re-render on any mutation.
function useStore() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => window.STORE.subscribe(force), []);
  return window.STORE;
}

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
  ErrorBoundary
});