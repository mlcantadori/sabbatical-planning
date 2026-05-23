// Photo component — Uses curated Unsplash IDs when available, falls back to picsum.
function Photo({ keyword, alt, ratio = '4/3', radius = 0, caption, className = '', style = {} }) {
  const { photoUrl } = window.TRIP.helpers;
  const [loaded, setLoaded] = React.useState(false);
  const photoId = window.PHOTO_IDS?.[keyword];
  const src = photoId
    ? `https://images.unsplash.com/${photoId}?w=1200&h=900&fit=crop&auto=format`
    : photoUrl(keyword, 1200, 900);

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
        onError={() => setLoaded(true)}
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

function getDayN(date) {
  return window.TRIP.helpers.dayCounter(date);
}
function openMaps(query) {
  window.open(window.TRIP.helpers.mapsUrl(query), '_blank', 'noopener,noreferrer');
}
function openMapsLatLng(lat, lng, label) {
  window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank', 'noopener,noreferrer');
}

// Subscribe to the store and trigger re-render on any mutation.
function useStore() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => window.STORE.subscribe(force), []);
  return window.STORE;
}

// Small contentEditable wrapper — commits on blur or Enter, reverts on Esc.
function Editable({ value, onCommit, className = '', placeholder = '', as = 'span', style = {} }) {
  const Tag = as;
  const ref = React.useRef(null);
  // Sync external value into the DOM when not focused. While focused, leave
  // the user's edits alone so the caret doesn't jump.
  React.useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.textContent = value || '';
    }
  }, [value]);
  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`editable ${className}`}
      data-placeholder={placeholder}
      onBlur={(e) => {
        const v = e.currentTarget.textContent.trim();
        if (v !== (value || '')) onCommit(v);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
        if (e.key === 'Escape') {
          e.preventDefault();
          e.currentTarget.textContent = value || '';
          e.currentTarget.blur();
        }
      }}
      onClick={(e) => e.stopPropagation()}
      style={style}>
      {/* initial text — subsequent updates handled by effect */}
      {value || ''}
    </Tag>
  );
}

// Hover-revealed action menu (⋯).
function ActionMenu({ items, className = '', stop = true }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const off = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', off, true);
    return () => document.removeEventListener('pointerdown', off, true);
  }, [open]);
  return (
    <div ref={ref} className={`action-menu ${className}`}
      onClick={stop ? (e) => e.stopPropagation() : undefined}>
      <button className="action-menu-trigger"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        title="Actions">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="2.5" cy="6" r="1.1" /><circle cx="6" cy="6" r="1.1" /><circle cx="9.5" cy="6" r="1.1" />
        </svg>
      </button>
      {open && (
        <div className="action-menu-list">
          {items.map((it, i) => (
            <button key={i} className={`action-menu-item ${it.danger ? 'is-danger' : ''}`}
              onClick={(e) => { e.stopPropagation(); setOpen(false); it.onClick(); }}>
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const Icon = {
  pin: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  arrowRight: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  arrowLeft: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6L5 12l6 6"/></svg>,
  external: (p) => <svg viewBox="0 0 24 24" width={p.size || 12} height={p.size || 12} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M10 14L21 3M21 14v7H3V3h7"/></svg>,
  calendar: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
  close: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  map: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  list: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  diving: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  trash: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>,
  edit: (p) => <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
};

Object.assign(window, { Photo, getDayN, openMaps, openMapsLatLng, Icon, useStore, Editable, ActionMenu });
