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
    const [editing, setEditing] = React.useState(false);
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
      <div className={`app ${isMobile ? 'is-mobile' : ''} ${editing ? 'is-editing' : ''}`}>
        <header className="app-header">
          <div className="app-brand">
            <div className="app-brand-mark">Asia</div>
            <div className="app-brand-meta">Sabbatical · 2026·2027 · Two travelers · {store.getTotalDays()} days</div>
          </div>

          <div className="app-progress">
            <span className="app-progress-label">Day {today.n.toString().padStart(3,'0')} / {store.getTotalDays()}</span>
            <div className="app-progress-bar"><div style={{ width: `${(today.n / Math.max(1, store.getTotalDays())) * 100}%` }} /></div>
          </div>

          <div style={{ flex: 1 }} />

          <div className="app-nav">
            <button className={view === 'map' ? 'is-active' : ''} onClick={() => setView('map')}>
              <window.Icon.map size={12} /> {!isMobile && 'Map'}
            </button>
            <button className={view === 'bookings' ? 'is-active' : ''} onClick={() => setView('bookings')}>{isMobile ? 'Book' : 'Bookings'}</button>
            <button className={view === 'diving' ? 'is-active' : ''} onClick={() => setView('diving')}>{isMobile ? 'Dive' : 'Diving'}</button>
            <button className={view === 'budget' ? 'is-active' : ''} onClick={() => setView('budget')}>{isMobile ? '$' : 'Budget'}</button>
            <button className={view === 'packing' ? 'is-active' : ''} onClick={() => setView('packing')}>{isMobile ? 'Pack' : 'Packing'}</button>
            <button className={view === 'snapshots' ? 'is-active' : ''} onClick={() => setView('snapshots')}>{isMobile ? 'Ver' : 'Versions'}</button>
          </div>
        </header>

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
            <button
              className={`pill-btn ${editing ? 'is-active' : ''}`}
              onClick={() => setEditing((e) => !e)}>
              {editing ? 'Done' : 'Edit'}
            </button>
          </div>
        )}

        <div className={`app-main ${showDetail ? '' : 'no-detail'} mobile-${mobileMode}`}>
          {/* On mobile we hide the chapter list when 'map' mode is active,
              and hide the map when 'list' mode is active. */}
          {(!isMobile || mobileMode === 'list') && (
            <window.ChapterList
              selectedId={selectedId}
              onSelect={onSelectChapter}
              editing={editing}
              onToggleEdit={() => setEditing((e) => !e)}
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
                  <button onClick={() => {
                    if (confirm('Reset to the original itinerary? Your edits will be lost.')) {
                      store.reset();
                      onReset();
                    }
                  }}>Restore defaults</button>
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
              editing={editing}
            />
          )}

          {isBinder && (
            <window.Binder activeTab={view} onSwitchTab={setView} onClose={() => setView('map')} />
          )}
        </div>
      </div>
    );
  }

  window.App = App;
})();
