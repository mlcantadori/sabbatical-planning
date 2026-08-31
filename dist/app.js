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
      className: `app ${isMobile ? 'is-mobile' : ''} ${editing ? 'is-editing' : ''}`
    }, /*#__PURE__*/React.createElement("header", {
      className: "app-header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "app-brand"
    }, /*#__PURE__*/React.createElement("div", {
      className: "app-brand-mark"
    }, "Asia"), /*#__PURE__*/React.createElement("div", {
      className: "app-brand-meta"
    }, "Sabbatical \xB7 2026\xB72027 \xB7 Two travelers \xB7 ", store.getTotalDays(), " days")), /*#__PURE__*/React.createElement("div", {
      className: "app-progress"
    }, /*#__PURE__*/React.createElement("span", {
      className: "app-progress-label"
    }, "Day ", today.n.toString().padStart(3, '0'), " / ", store.getTotalDays()), /*#__PURE__*/React.createElement("div", {
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
      className: view === 'bookings' ? 'is-active' : '',
      onClick: () => setView('bookings')
    }, isMobile ? 'Book' : 'Bookings'), /*#__PURE__*/React.createElement("button", {
      className: view === 'diving' ? 'is-active' : '',
      onClick: () => setView('diving')
    }, isMobile ? 'Dive' : 'Diving'), /*#__PURE__*/React.createElement("button", {
      className: view === 'budget' ? 'is-active' : '',
      onClick: () => setView('budget')
    }, isMobile ? '$' : 'Budget'), /*#__PURE__*/React.createElement("button", {
      className: view === 'packing' ? 'is-active' : '',
      onClick: () => setView('packing')
    }, isMobile ? 'Pack' : 'Packing'), /*#__PURE__*/React.createElement("button", {
      className: view === 'snapshots' ? 'is-active' : '',
      onClick: () => setView('snapshots')
    }, isMobile ? 'Ver' : 'Versions'))), isMobile && view === 'map' && /*#__PURE__*/React.createElement("div", {
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
    }), " List")), /*#__PURE__*/React.createElement("button", {
      className: `pill-btn ${editing ? 'is-active' : ''}`,
      onClick: () => setEditing(e => !e)
    }, editing ? 'Done' : 'Edit')), /*#__PURE__*/React.createElement("div", {
      className: `app-main ${showDetail ? '' : 'no-detail'} mobile-${mobileMode}`
    }, (!isMobile || mobileMode === 'list') && /*#__PURE__*/React.createElement(window.ChapterList, {
      selectedId: selectedId,
      onSelect: onSelectChapter,
      editing: editing,
      onToggleEdit: () => setEditing(e => !e)
    }), (!isMobile || mobileMode === 'map') && /*#__PURE__*/React.createElement("div", {
      className: "map-stage"
    }, /*#__PURE__*/React.createElement(window.MapView, {
      selectedId: selectedId,
      selectedPlaceIdx: selectedPlaceIdx,
      onSelectChapter: onSelectChapter,
      onSelectPlace: onSelectPlace,
      focusKey: focusKey === 0 ? null : 'world'
    }), /*#__PURE__*/React.createElement("div", {
      className: "map-legend"
    }, /*#__PURE__*/React.createElement("div", {
      className: "map-legend-title"
    }, /*#__PURE__*/React.createElement("span", null, "Route \xB7 ", store.getChapters().filter(c => c.kind === 'chapter').length, " chapters"), /*#__PURE__*/React.createElement("span", {
      style: {
        opacity: 0.4
      }
    }, "\u25BE")), /*#__PURE__*/React.createElement("div", {
      className: "map-legend-items"
    }, Object.entries(window.TRIP.REGIONS).map(([k, r]) => /*#__PURE__*/React.createElement("div", {
      key: k,
      className: "map-legend-item"
    }, /*#__PURE__*/React.createElement("span", {
      className: "map-legend-swatch",
      style: {
        background: r.accent
      }
    }), /*#__PURE__*/React.createElement("span", null, r.name)))), /*#__PURE__*/React.createElement("div", {
      className: "map-legend-action"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onReset
    }, "Reset view"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (confirm('Reset to the original itinerary? Your edits will be lost.')) {
          store.reset();
          onReset();
        }
      }
    }, "Restore defaults"))), selectedId && /*#__PURE__*/React.createElement("div", {
      className: "map-reset"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onReset
    }, "\u2190 Back to whole route"))), showDetail && /*#__PURE__*/React.createElement(window.DetailPanel, {
      chapterId: selectedId,
      selectedPlaceIdx: selectedPlaceIdx,
      onSelectPlace: onSelectPlace,
      onClose: onCloseDetail,
      editing: editing
    }), isBinder && /*#__PURE__*/React.createElement(window.Binder, {
      activeTab: view,
      onSwitchTab: setView,
      onClose: () => setView('map')
    })));
  }
  window.App = App;
})();