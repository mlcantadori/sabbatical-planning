// App shell — header + body + binder switch + detail panel + mobile mode.

(function () {
  const { totalDays, helpers } = window.TRIP;
  const { dayCounter } = helpers;
  const TODAY = new Date('2026-09-15');

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

  function App() {
    const store = window.useStore();
    const [view, setView] = React.useState('map');
    const [mobileMode, setMobileMode] = React.useState('map'); // 'map' | 'list'
    const [selectedId, setSelectedId] = React.useState(null);
    const [selectedPlaceIdx, setSelectedPlaceIdx] = React.useState(null);
    const [focusKey, setFocusKey] = React.useState(0);
    const isMobile = useIsMobile();

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
              <window.MapView
                selectedId={selectedId}
                selectedPlaceIdx={selectedPlaceIdx}
                onSelectChapter={onSelectChapter}
                onSelectPlace={onSelectPlace}
                focusKey={focusKey === 0 ? null : 'world'}
              />

              <div className="map-legend">
                <div className="map-legend-title">
                  <span>Route · {store.getChapters().filter((c) => c.kind === 'chapter').length} chapters</span>
                  <span style={{ opacity: 0.4 }}>▾</span>
                </div>
                <div className="map-legend-items">
                  {Object.entries(window.TRIP.REGIONS).map(([k, r]) => (
                    <div key={k} className="map-legend-item">
                      <span className="map-legend-swatch" style={{ background: r.accent }} />
                      <span>{r.name}</span>
                    </div>
                  ))}
                </div>
                <div className="map-legend-action">
                  <button onClick={onReset}>Reset view</button>
                </div>
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
