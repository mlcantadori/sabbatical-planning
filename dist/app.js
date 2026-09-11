"use strict";

// App shell — header + body + binder switch + detail panel + mobile mode.

(function () {
  const {
    totalDays,
    helpers
  } = window.TRIP;
  const {
    dayCounter
  } = helpers;
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
  function App() {
    const store = window.useStore();
    const [view, setView] = React.useState('map');
    const [mobileMode, setMobileMode] = React.useState('map'); // 'map' | 'list'
    const [selectedId, setSelectedId] = React.useState(null);
    const [selectedPlaceIdx, setSelectedPlaceIdx] = React.useState(null);
    const [focusKey, setFocusKey] = React.useState(0);
    const [mapMode, setMapMode] = React.useState(() => {
      try {
        return localStorage.getItem('map-mode') || '2d';
      } catch {
        return '2d';
      }
    });
    const isMobile = useIsMobile();
    const today = dayCounter(TODAY);
    const isBinder = view !== 'map';
    const onSelectChapter = id => {
      setSelectedId(id);
      setSelectedPlaceIdx(null);
      if (view !== 'map') setView('map');
    };
    const onSelectPlace = idx => setSelectedPlaceIdx(idx);
    const onCloseDetail = () => {
      setSelectedId(null);
      setSelectedPlaceIdx(null);
    };
    const onReset = () => {
      setSelectedId(null);
      setSelectedPlaceIdx(null);
      setFocusKey(k => k + 1);
    };
    const showDetail = view === 'map' && selectedId;
    return /*#__PURE__*/React.createElement("div", {
      className: `app ${isMobile ? 'is-mobile' : ''}`
    }, /*#__PURE__*/React.createElement("header", {
      className: "app-header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "app-brand"
    }, /*#__PURE__*/React.createElement("div", {
      className: "app-brand-mark"
    }, "Asia"), /*#__PURE__*/React.createElement("div", {
      className: "app-brand-meta"
    }, "Sabbatical \xB7 2026\xB72027 \xB7 Two travelers \xB7 Day ", today.n.toString().padStart(3, '0'), " / ", store.getTotalDays())), /*#__PURE__*/React.createElement("div", {
      className: "app-progress",
      title: `Day ${today.n} of ${store.getTotalDays()}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "app-progress-bar"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${today.n / Math.max(1, store.getTotalDays()) * 100}%`
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "app-nav"
    }, /*#__PURE__*/React.createElement("button", {
      className: view === 'map' ? 'is-active' : '',
      onClick: () => setView('map')
    }, /*#__PURE__*/React.createElement(window.Icon.map, {
      size: 12
    }), " ", !isMobile && 'Map'), /*#__PURE__*/React.createElement("button", {
      className: view === 'budget' ? 'is-active' : '',
      onClick: () => setView('budget')
    }, isMobile ? '$' : 'Budget'))), isMobile && /*#__PURE__*/React.createElement("div", {
      className: "app-progress mobile-progress",
      title: `Day ${today.n} of ${store.getTotalDays()}`
    }, /*#__PURE__*/React.createElement("span", {
      className: "app-progress-label"
    }, "Day ", today.n.toString().padStart(3, '0'), " / ", store.getTotalDays()), /*#__PURE__*/React.createElement("div", {
      className: "app-progress-bar"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${today.n / Math.max(1, store.getTotalDays()) * 100}%`
      }
    }))), isMobile && view === 'map' && /*#__PURE__*/React.createElement("div", {
      className: "mobile-mode"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mobile-mode-toggle"
    }, /*#__PURE__*/React.createElement("button", {
      className: mobileMode === 'map' ? 'is-active' : '',
      onClick: () => setMobileMode('map')
    }, /*#__PURE__*/React.createElement(window.Icon.map, {
      size: 12
    }), " Map"), /*#__PURE__*/React.createElement("button", {
      className: mobileMode === 'list' ? 'is-active' : '',
      onClick: () => setMobileMode('list')
    }, /*#__PURE__*/React.createElement(window.Icon.list, {
      size: 12
    }), " List"))), /*#__PURE__*/React.createElement("div", {
      className: `app-main ${showDetail ? '' : 'no-detail'} mobile-${mobileMode}`
    }, (!isMobile || mobileMode === 'list') && /*#__PURE__*/React.createElement(window.ChapterList, {
      selectedId: selectedId,
      onSelect: onSelectChapter
    }), (!isMobile || mobileMode === 'map') && /*#__PURE__*/React.createElement("div", {
      className: "map-stage"
    }, mapMode === 'globe' ? /*#__PURE__*/React.createElement(window.GlobeView, {
      selectedId: selectedId,
      selectedPlaceIdx: selectedPlaceIdx,
      onSelectChapter: onSelectChapter,
      onSelectPlace: onSelectPlace,
      focusKey: focusKey === 0 ? null : 'world'
    }) : /*#__PURE__*/React.createElement(window.MapView, {
      selectedId: selectedId,
      selectedPlaceIdx: selectedPlaceIdx,
      onSelectChapter: onSelectChapter,
      onSelectPlace: onSelectPlace,
      focusKey: focusKey === 0 ? null : 'world'
    }), /*#__PURE__*/React.createElement("div", {
      className: "mobile-mode-toggle eq-mode"
    }, /*#__PURE__*/React.createElement("button", {
      className: mapMode === 'map' ? 'is-active' : '',
      onClick: () => {
        setMapMode('map');
        try {
          localStorage.setItem('map-mode', 'map');
        } catch {}
      }
    }, "Map"), /*#__PURE__*/React.createElement("button", {
      className: mapMode === 'globe' ? 'is-active' : '',
      onClick: () => {
        setMapMode('globe');
        try {
          localStorage.setItem('map-mode', 'globe');
        } catch {}
      }
    }, "Globe")), selectedId && /*#__PURE__*/React.createElement("div", {
      className: "map-reset"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onReset
    }, "\u2190 Back to whole route"))), showDetail && /*#__PURE__*/React.createElement(window.DetailPanel, {
      chapterId: selectedId,
      selectedPlaceIdx: selectedPlaceIdx,
      onSelectPlace: onSelectPlace,
      onClose: onCloseDetail
    }), isBinder && /*#__PURE__*/React.createElement(window.Binder, {
      onClose: () => setView('map')
    })));
  }
  window.App = App;
})();