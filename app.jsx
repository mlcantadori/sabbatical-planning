// App shell — header + body + binder switch + detail panel + mobile mode.

(function () {
  const { totalDays, helpers } = window.TRIP;
  const { dayCounter } = helpers;
  // Real current date (UTC-normalized so the day never flips with timezones).
  const TODAY = (() => {
    const n = new Date();
    return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
  })();

  // Track viewport width for mobile layout switch
  function useIsMobile(bp = 880) {
    const [m, setM] = React.useState(typeof window !== 'undefined' && window.innerWidth < bp);
    React.useEffect(() => {
      const on = () => setM(window.innerWidth < bp);
      window.addEventListener('resize', on);
      return () => window.removeEventListener('resize', on);
    }, [bp]);
    return m;
  }

  // Deep-link params (?map=2d|3d&chapter=<id>&place=<idx>): read once
  // on load, then reflected back via replaceState so any view is
  // shareable. Invalid values fall back to defaults (never crash).
  function readUrlParams() {
    try {
      const q = new URLSearchParams(window.location.search);
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
      return { map, chapterId: ch ? ch.id : null, placeIdx: place };
    } catch { return { map: null, chapterId: null, placeIdx: null }; }
  }

  function App() {
    const store = window.useStore();
    const [view, setView] = React.useState('map');
    const [mobileMode, setMobileMode] = React.useState('map'); // 'map' | 'list'
    const [urlParams] = React.useState(readUrlParams);
    const [selectedId, setSelectedId] = React.useState(urlParams.chapterId);
    const [selectedPlaceIdx, setSelectedPlaceIdx] = React.useState(urlParams.placeIdx);
    const [focusKey, setFocusKey] = React.useState(0);
    const [mapMode, setMapMode] = React.useState(() => {
      if (urlParams.map) return urlParams.map;
      try { return localStorage.getItem('map-mode') || 'globe'; } catch { return 'globe'; }
    });
    const isMobile = useIsMobile();

    // Reflect the current view back into the URL (replaceState: no
    // history spam, no reload) so links reproduce exactly what's on
    // screen. Defaults stay clean: globe (the default view) is omitted,
    // so a fresh load shows no parameters at all.
    React.useEffect(() => {
      try {
        const q = new URLSearchParams(window.location.search);
        if (mapMode === 'globe') q.delete('map'); else q.set('map', '2d');
        if (selectedId) q.set('chapter', selectedId); else q.delete('chapter');
        if (selectedId && selectedPlaceIdx != null) q.set('place', String(selectedPlaceIdx));
        else q.delete('place');
        const qs = q.toString();
        const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
        if (next !== window.location.pathname + window.location.search) {
          window.history.replaceState(null, '', next);
        }
      } catch {}
    }, [mapMode, selectedId, selectedPlaceIdx]);

    const today = dayCounter(TODAY);
    const isBinder = view !== 'map';

    const onSelectChapter = (id) => {
      setSelectedId(id);
      setSelectedPlaceIdx(null);
      if (view !== 'map') setView('map');
    };
    const onSelectPlace = (idx) => setSelectedPlaceIdx(idx);
    const onCloseDetail = () => {
      setSelectedId(null);
      setSelectedPlaceIdx(null);
    };
    const onReset = () => {
      setSelectedId(null);
      setSelectedPlaceIdx(null);
      setFocusKey((k) => k + 1);
    };

    const showDetail = view === 'map' && selectedId;

    return (
      <div className={`app ${isMobile ? 'is-mobile' : ''}`}>
        <header className="app-header">
          <div className="app-brand">
            <div className="app-brand-mark">Asia</div>
            <div className="app-brand-meta">Sabbatical · 2026·2027 · Two travelers · Day {today.n.toString().padStart(3,'0')} / {store.getTotalDays()}</div>
          </div>

          <div className="app-progress" title={`Day ${today.n} of ${store.getTotalDays()}`}>
            <div className="app-progress-bar"><div style={{ width: `${(today.n / Math.max(1, store.getTotalDays())) * 100}%` }} /></div>
          </div>

          <div style={{ flex: 1 }} />

          <div className="app-nav">
            <button className={view === 'map' ? 'is-active' : ''} onClick={() => setView('map')}>
              <window.Icon.map size={12} /> {!isMobile && 'Map'}
            </button>
            <button className={view === 'budget' ? 'is-active' : ''} onClick={() => setView('budget')}>{isMobile ? '$' : 'Budget'}</button>
            <window.SyncButton compact={isMobile} />
          </div>
        </header>

        {/* Mobile progress strip: days + bar below the header (hidden on desktop) */}
        {isMobile && (
          <div className="app-progress mobile-progress" title={`Day ${today.n} of ${store.getTotalDays()}`}>
            <span className="app-progress-label">Day {today.n.toString().padStart(3,'0')} / {store.getTotalDays()}</span>
            <div className="app-progress-bar"><div style={{ width: `${(today.n / Math.max(1, store.getTotalDays())) * 100}%` }} /></div>
          </div>
        )}

        {/* Mobile sub-header: map / list toggle (only while in map view) */}
        {isMobile && view === 'map' && (
          <div className="mobile-mode">
            <div className="mobile-mode-toggle">
              <button
                className={mobileMode === 'map' ? 'is-active' : ''}
                onClick={() => setMobileMode('map')}>
                <window.Icon.map size={12} /> Map
              </button>
              <button
                className={mobileMode === 'list' ? 'is-active' : ''}
                onClick={() => setMobileMode('list')}>
                <window.Icon.list size={12} /> List
              </button>
            </div>
          </div>
        )}

        <div className={`app-main ${showDetail ? '' : 'no-detail'} mobile-${mobileMode}`}>
          {/* On mobile we hide the chapter list when 'map' mode is active,
              and hide the map when 'list' mode is active. */}
          {(!isMobile || mobileMode === 'list') && (
            <window.ChapterList
              selectedId={selectedId}
              onSelect={onSelectChapter}
            />
          )}

          {(!isMobile || mobileMode === 'map') && (
            <div className="map-stage">
              {mapMode === 'globe' ? (
                <window.GlobeView
                  selectedId={selectedId}
                  selectedPlaceIdx={selectedPlaceIdx}
                  onSelectChapter={onSelectChapter}
                  onSelectPlace={onSelectPlace}
                  focusKey={focusKey === 0 ? null : 'world'}
                />
              ) : (
                <window.MapView
                  selectedId={selectedId}
                  selectedPlaceIdx={selectedPlaceIdx}
                  onSelectChapter={onSelectChapter}
                  onSelectPlace={onSelectPlace}
                  focusKey={focusKey === 0 ? null : 'world'}
                />
              )}
              <div className="mobile-mode-toggle eq-mode">
                <button
                  className={mapMode === 'map' ? 'is-active' : ''}
                  onClick={() => {
                    setMapMode('map');
                    try { localStorage.setItem('map-mode', 'map'); } catch {}
                  }}>Map</button>
                <button
                  className={mapMode === 'globe' ? 'is-active' : ''}
                  onClick={() => {
                    setMapMode('globe');
                    try { localStorage.setItem('map-mode', 'globe'); } catch {}
                  }}>Globe</button>
              </div>

              {selectedId && (
                <div className="map-reset">
                  <button onClick={onReset}>← Back to whole route</button>
                </div>
              )}
            </div>
          )}

          {showDetail && (
            <window.DetailPanel
              chapterId={selectedId}
              selectedPlaceIdx={selectedPlaceIdx}
              onSelectPlace={onSelectPlace}
              onClose={onCloseDetail}
            />
          )}

          {isBinder && (
            <window.Binder onClose={() => setView('map')} />
          )}
        </div>
      </div>
    );
  }

  window.App = App;
})();
