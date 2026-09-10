"use strict";

// Chapter list (left rail / mobile list), detail panel (right slideover /
// mobile full-screen) and binder overlay. Read-only: no editing UI.

(function () {
  const {
    totalDays,
    REGIONS,
    helpers,
    budget
  } = window.TRIP;
  const {
    fmt,
    dayRange,
    dayCounter
  } = helpers;

  // ══════════════════════════════════════════════════════════════════════
  // CHAPTER LIST — left rail (desktop) or main list view (mobile).
  // ══════════════════════════════════════════════════════════════════════
  function ChapterList({
    selectedId,
    onSelect
  }) {
    const store = window.useStore();
    const chapters = store.getChapters();
    return /*#__PURE__*/React.createElement("div", {
      className: "chapter-list"
    }, /*#__PURE__*/React.createElement("div", {
      className: "chapter-list-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "chapter-list-head-row"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "The Arc"), /*#__PURE__*/React.createElement("div", {
      className: "chapter-list-meta"
    }, chapters.length, " entries \xB7 ", store.getTotalDays(), " days")))), /*#__PURE__*/React.createElement("div", {
      className: "chapter-list-body"
    }, chapters.map(c => /*#__PURE__*/React.createElement(ChapterRow, {
      key: c.id,
      ch: c,
      isActive: c.id === selectedId,
      onSelect: () => onSelect(c.id)
    }))));
  }
  function ChapterRow({
    ch,
    isActive,
    onSelect
  }) {
    const region = REGIONS[ch.region] || {
      accent: '#c2693a',
      name: ''
    };
    return /*#__PURE__*/React.createElement("div", {
      className: `chapter-row ${isActive ? 'is-active' : ''}`,
      onClick: onSelect
    }, /*#__PURE__*/React.createElement("span", {
      className: "chapter-row-marker",
      style: {
        background: isActive ? region.accent : 'transparent'
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "chapter-row-num"
    }, ch.kind === 'chapter' ? (ch.num || '').toString().padStart(2, '0') : '··'), /*#__PURE__*/React.createElement("span", {
      className: "chapter-row-body"
    }, /*#__PURE__*/React.createElement("span", {
      className: "chapter-row-title"
    }, ch.title), /*#__PURE__*/React.createElement("span", {
      className: "chapter-row-dates"
    }, /*#__PURE__*/React.createElement("span", {
      className: "chapter-row-region-dot",
      style: {
        background: region.accent
      }
    }), fmt(ch.start), " \u2013 ", fmt(ch.end), " \xB7 ", ch.days, "d"), ch.weather && /*#__PURE__*/React.createElement("span", {
      className: "chapter-row-weather"
    }, ch.weather.hi, "\xB0/", ch.weather.lo, "\xB0 \xB7 \uD83C\uDF27 ", ch.weather.rainyDays ?? 0, "d")));
  }

  // ══════════════════════════════════════════════════════════════════════
  // DETAIL PANEL — full chapter detail. Read-only.
  // ══════════════════════════════════════════════════════════════════════
  function DetailPanel({
    chapterId,
    onClose,
    onSelectPlace,
    selectedPlaceIdx
  }) {
    const store = window.useStore();
    const ch = store.getChapter(chapterId);
    if (!ch) return null;
    const region = REGIONS[ch.region] || {
      accent: '#c2693a',
      name: ''
    };
    const today = dayCounter(ch.start);
    const todayEnd = dayCounter(ch.end);
    return /*#__PURE__*/React.createElement("div", {
      className: "detail-panel"
    }, /*#__PURE__*/React.createElement("div", {
      className: "detail-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "detail-head-meta"
    }, /*#__PURE__*/React.createElement("span", {
      className: "detail-pill",
      style: {
        background: region.accent,
        color: '#fff'
      }
    }, ch.kind === 'chapter' ? `Chapter ${(ch.num || '').toString().padStart(2, '0')}` : ch.kind.toUpperCase()), /*#__PURE__*/React.createElement("span", {
      className: "kicker"
    }, region.name, " \xB7 ", ch.country, " ", ch.flag)), /*#__PURE__*/React.createElement("div", {
      className: "detail-head-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "icon-btn",
      onClick: onClose,
      title: "Close"
    }, /*#__PURE__*/React.createElement(window.Icon.close, {
      size: 16
    })))), /*#__PURE__*/React.createElement("div", {
      className: "detail-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "detail-hero"
    }, /*#__PURE__*/React.createElement(window.Photo, {
      keyword: ch.photos[0],
      ratio: "auto",
      style: {
        width: '100%',
        height: '100%',
        aspectRatio: 'unset'
      },
      caption: `${ch.country.toUpperCase()} · ${fmt(ch.start)}`
    })), /*#__PURE__*/React.createElement("h1", {
      className: "detail-title"
    }, ch.title), ch.theme && /*#__PURE__*/React.createElement("div", {
      className: "detail-theme"
    }, ch.theme, "."), /*#__PURE__*/React.createElement("div", {
      className: "detail-stats"
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "Window",
      value: `${fmt(ch.start)} – ${fmt(ch.end)}`,
      sub: `${ch.days} days`
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Day of trip",
      value: `${today.n}–${todayEnd.n}`,
      sub: `of ${totalDays}`
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Weather",
      value: ch.weather?.label || '—',
      sub: ch.weather?.emoji
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Temp",
      value: ch.weather ? `${ch.weather.hi}° / ${ch.weather.lo}°` : '—',
      sub: "high / low"
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Rain",
      value: ch.weather ? `${ch.weather.rainyDays ?? 0} days` : '—',
      sub: "rainy days"
    })), ch.intro && /*#__PURE__*/React.createElement("div", {
      className: "detail-intro"
    }, ch.intro), ch.photos.length > 1 && /*#__PURE__*/React.createElement("div", {
      className: "photo-strip"
    }, ch.photos.slice(1, 4).map((k, i) => /*#__PURE__*/React.createElement(window.Photo, {
      key: i,
      keyword: k,
      ratio: "3/4"
    }))), /*#__PURE__*/React.createElement(SectionHead, {
      num: "01",
      title: `Itinerary · ${ch.places.length} stop${ch.places.length === 1 ? '' : 's'}`
    }), ch.places.map((p, i) => {
      const offsetDays = ch.places.slice(0, i).reduce((s, x) => s + x.days, 0);
      const startDate = new Date(new Date(ch.start).getTime() + offsetDays * 86400000);
      const endDate = new Date(startDate.getTime() + (p.days - 1) * 86400000);
      return /*#__PURE__*/React.createElement(PlaceRow, {
        key: i,
        chapterId: ch.id,
        place: p,
        idx: i,
        startDate: startDate,
        endDate: endDate,
        region: region,
        isActive: selectedPlaceIdx === i,
        onSelect: () => onSelectPlace(i)
      });
    }), ch.booking && ch.booking.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionHead, {
      num: "02",
      title: "Book in advance",
      small: true
    }), /*#__PURE__*/React.createElement("ul", {
      className: "alert-list"
    }, ch.booking.map((b, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, b)))), ch.diving && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionHead, {
      num: "03",
      title: "Diving",
      small: true
    }), /*#__PURE__*/React.createElement("div", {
      className: "diving-inline"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, ch.diving.sites), " sites \xB7 ", ch.diving.type), /*#__PURE__*/React.createElement("div", {
      className: "muted"
    }, ch.diving.operators))), ch.decisions && ch.decisions.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionHead, {
      num: "04",
      title: "Route decisions",
      small: true
    }), /*#__PURE__*/React.createElement("ul", {
      className: "alert-list"
    }, ch.decisions.map((d, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, d))))));
  }
  function Stat({
    label,
    value,
    sub
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, label), /*#__PURE__*/React.createElement("div", {
      className: "stat-value"
    }, value), sub && /*#__PURE__*/React.createElement("div", {
      className: "stat-sub"
    }, sub));
  }
  function SectionHead({
    num,
    title,
    small
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: `section-head ${small ? 'is-small' : ''}`
    }, /*#__PURE__*/React.createElement("span", {
      className: "section-head-num"
    }, "\xA7", num), /*#__PURE__*/React.createElement("span", {
      className: "section-head-title"
    }, title));
  }
  function PlaceRow({
    chapterId,
    place,
    idx,
    startDate,
    endDate,
    region,
    isActive,
    onSelect
  }) {
    const coords = place.coords;
    const sameDay = startDate.getTime() === endDate.getTime();
    const sameMonth = !sameDay && startDate.getUTCMonth() === endDate.getUTCMonth() && startDate.getUTCFullYear() === endDate.getUTCFullYear();
    return /*#__PURE__*/React.createElement("div", {
      className: `place-row ${isActive ? 'is-active' : ''}`,
      onClick: onSelect
    }, /*#__PURE__*/React.createElement("span", {
      className: "place-row-day"
    }, /*#__PURE__*/React.createElement("span", {
      className: "place-row-day-num"
    }, fmt(startDate), !sameDay && /*#__PURE__*/React.createElement("span", {
      className: "place-row-day-dash"
    }, "\u2013", sameMonth ? endDate.getUTCDate() : fmt(endDate))), /*#__PURE__*/React.createElement("span", {
      className: "place-row-day-label"
    }, place.days, "d")), /*#__PURE__*/React.createElement("span", {
      className: "place-row-body"
    }, /*#__PURE__*/React.createElement("span", {
      className: "place-row-title"
    }, /*#__PURE__*/React.createElement("span", {
      className: "place-row-idx"
    }, (idx + 1).toString().padStart(2, '0')), /*#__PURE__*/React.createElement("span", null, place.name)), /*#__PURE__*/React.createElement("ul", {
      className: "place-row-list"
    }, place.highlights.map((h, j) => /*#__PURE__*/React.createElement("li", {
      key: j,
      style: {
        '--bullet': region.accent
      }
    }, h)))), /*#__PURE__*/React.createElement("div", {
      className: "place-row-actions"
    }, coords && /*#__PURE__*/React.createElement("button", {
      className: "place-row-map",
      onClick: e => {
        e.stopPropagation();
        window.openMaps(place.query);
      },
      title: "Open in Google Maps"
    }, /*#__PURE__*/React.createElement(window.Icon.external, {
      size: 11
    }))));
  }

  // ══════════════════════════════════════════════════════════════════════
  // BINDER (Budget)
  // ══════════════════════════════════════════════════════════════════════
  function Binder({
    onClose
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "binder"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-tabs"
    }, /*#__PURE__*/React.createElement("span", {
      className: "kicker"
    }, "Budget")), /*#__PURE__*/React.createElement("button", {
      className: "icon-btn",
      onClick: onClose,
      title: "Close binder"
    }, /*#__PURE__*/React.createElement(window.Icon.close, {
      size: 16
    }))), /*#__PURE__*/React.createElement("div", {
      className: "binder-body"
    }, /*#__PURE__*/React.createElement(BudgetView, null)));
  }
  function BudgetView() {
    const store = useStore();
    const fmt$ = n => 'USD ' + Math.round(n).toLocaleString('en-US');
    const CATS = [['lodging', 'Lodging'], ['food', 'Food'], ['transport', 'Local transport'], ['activities', 'Activities & diving'], ['fees', 'Visas & park fees']];
    const titleById = Object.fromEntries(store.getChapters().map(c => [c.id, c.title]));
    const rowTotal = r => CATS.reduce((s, [k]) => s + (r[k] || 0), 0);
    const catTotals = Object.fromEntries(CATS.map(([k]) => [k, budget.chapters.reduce((s, r) => s + (r[k] || 0), 0)]));
    const chTotal = budget.chapters.reduce((s, r) => s + rowTotal(r), 0);
    const flightsTotal = budget.flights.reduce((s, f) => s + f.cost, 0);
    const extrasTotal = budget.extras.reduce((s, e) => s + e.cost, 0);
    const subtotal = chTotal + flightsTotal + extrasTotal;
    const contingency = Math.round(subtotal * budget.contingencyPct / 100);
    const grand = subtotal + contingency;
    const perDay = Math.round(grand / totalDays);
    const perPersonMonth = Math.round(grand / 2 / (totalDays / 30.44));
    const perPersonMonthBRL = Math.round(perPersonMonth * budget.fxBRL);
    // Sortable per-chapter table: click any header to sort asc/desc.
    const COLS = [['idx', '#'], ['title', 'Chapter'], ['days', 'd'], ['perDay', '$/d'], ['lodging', 'Lodg.'], ['food', 'Food'], ['transport', 'Trans.'], ['activities', 'Activ.'], ['fees', 'Fees'], ['total', 'Total']];
    const [sortKey, setSortKey] = React.useState('idx');
    const [sortDir, setSortDir] = React.useState(1);
    const rows = budget.chapters.map((r, i) => ({
      ...r,
      idx: i + 1,
      title: titleById[r.id] || r.id,
      total: rowTotal(r),
      perDay: rowTotal(r) / r.days
    }));
    const sorted = [...rows].sort((a, b) => {
      const va = a[sortKey],
        vb = b[sortKey];
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
      return cmp * sortDir;
    });
    const toggleSort = k => {
      if (k === sortKey) setSortDir(d => -d);else {
        setSortKey(k);
        setSortDir(1);
      }
    };
    const pct = n => Math.round(n / grand * 100) + '%';
    return /*#__PURE__*/React.createElement("div", {
      className: "binder-pane"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-pane-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "\xA7 Money"), /*#__PURE__*/React.createElement("h2", {
      className: "binder-pane-title"
    }, "Budget"), /*#__PURE__*/React.createElement("p", {
      className: "binder-pane-sub"
    }, budget.basis, ". Totals compute from the lines below \u2014 nothing hardcoded."))), /*#__PURE__*/React.createElement("div", {
      className: "budget-hero"
    }, /*#__PURE__*/React.createElement("div", {
      className: "budget-hero-big"
    }, fmt$(grand), " for two"), /*#__PURE__*/React.createElement("div", {
      className: "budget-hero-sub"
    }, fmt$(perDay), "/day \xB7 ", totalDays, " days \xB7 ", budget.inBRL), /*#__PURE__*/React.createElement("div", {
      className: "budget-hero-sub"
    }, "\u2248 $", perPersonMonth.toLocaleString('en-US'), " / R$", perPersonMonthBRL.toLocaleString('en-US'), " per person/month")), /*#__PURE__*/React.createElement(SectionHead, {
      num: "01",
      title: "Where it goes",
      small: true
    }), /*#__PURE__*/React.createElement("div", {
      className: "budget-grid"
    }, CATS.map(([k, label]) => /*#__PURE__*/React.createElement(BudgetCard, {
      key: k,
      title: label,
      items: [fmt$(catTotals[k]), pct(catTotals[k]) + ' of trip'],
      tone: "neutral"
    })), /*#__PURE__*/React.createElement(BudgetCard, {
      title: "Inter-chapter flights",
      items: [fmt$(flightsTotal), pct(flightsTotal) + ' of trip'],
      tone: "warn"
    }), /*#__PURE__*/React.createElement(BudgetCard, {
      title: "Insurance & extras",
      items: [fmt$(extrasTotal), pct(extrasTotal) + ' of trip'],
      tone: "cool"
    }), /*#__PURE__*/React.createElement(BudgetCard, {
      title: `Contingency ${budget.contingencyPct}%`,
      items: [fmt$(contingency), 'peak fares, FX, surprises'],
      tone: "neutral",
      bordered: true
    })), /*#__PURE__*/React.createElement(SectionHead, {
      num: "02",
      title: "Per chapter",
      small: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        overflowX: 'auto'
      }
    }, /*#__PURE__*/React.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      style: {
        textAlign: 'left',
        opacity: 0.65
      }
    }, COLS.map(([k, label]) => /*#__PURE__*/React.createElement("th", {
      key: k,
      onClick: () => toggleSort(k),
      style: {
        padding: '6px 8px 6px 0',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        textAlign: k === 'total' ? 'right' : 'left'
      }
    }, label, sortKey === k ? sortDir === 1 ? ' ▲' : ' ▼' : '')))), /*#__PURE__*/React.createElement("tbody", null, sorted.map(r => /*#__PURE__*/React.createElement("tr", {
      key: r.id,
      style: {
        borderTop: '1px solid rgba(0,0,0,.08)'
      },
      title: r.note
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        opacity: 0.55
      }
    }, r.idx), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px 6px 0',
        whiteSpace: 'nowrap'
      }
    }, r.title), /*#__PURE__*/React.createElement("td", null, r.days), /*#__PURE__*/React.createElement("td", null, fmt$(r.perDay).replace('USD ', '$')), /*#__PURE__*/React.createElement("td", null, fmt$(r.lodging).replace('USD ', '$')), /*#__PURE__*/React.createElement("td", null, fmt$(r.food).replace('USD ', '$')), /*#__PURE__*/React.createElement("td", null, fmt$(r.transport).replace('USD ', '$')), /*#__PURE__*/React.createElement("td", null, fmt$(r.activities).replace('USD ', '$')), /*#__PURE__*/React.createElement("td", null, fmt$(r.fees).replace('USD ', '$')), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'right',
        whiteSpace: 'nowrap'
      }
    }, fmt$(r.total)))), /*#__PURE__*/React.createElement("tr", {
      style: {
        borderTop: '2px solid rgba(0,0,0,.2)',
        fontWeight: 700
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px 6px 0'
      }
    }, "Chapters"), /*#__PURE__*/React.createElement("td", null, budget.chapters.reduce((s, r) => s + r.days, 0)), /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'right'
      }
    }, fmt$(chTotal)))))), /*#__PURE__*/React.createElement("p", {
      className: "binder-pane-sub"
    }, "Click a column header to sort \u25B2\u25BC \xB7 hover a row for its note. $/d is per couple."), /*#__PURE__*/React.createElement(SectionHead, {
      num: "03",
      title: "From chapters to grand total",
      small: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        overflowX: 'auto'
      }
    }, /*#__PURE__*/React.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("tbody", null, [['Chapters subtotal (23 chapters)', chTotal, chTotal], ['+ Inter-chapter flights (14 legs)', flightsTotal, chTotal + flightsTotal], ['+ Insurance & extras', extrasTotal, subtotal]].map(([label, amount, running], i) => /*#__PURE__*/React.createElement("tr", {
      key: i,
      style: {
        borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,.08)'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px 6px 0'
      }
    }, label), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'right',
        whiteSpace: 'nowrap'
      }
    }, fmt$(amount)), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'right',
        whiteSpace: 'nowrap',
        opacity: 0.55
      }
    }, "= ", fmt$(running)))), /*#__PURE__*/React.createElement("tr", {
      style: {
        borderTop: '1px solid rgba(0,0,0,.08)'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px 6px 0'
      }
    }, "= Subtotal"), /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'right',
        whiteSpace: 'nowrap',
        fontWeight: 700
      }
    }, fmt$(subtotal))), /*#__PURE__*/React.createElement("tr", {
      style: {
        borderTop: '1px solid rgba(0,0,0,.08)'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px 6px 0'
      }
    }, "+ Contingency ", budget.contingencyPct, "%"), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'right',
        whiteSpace: 'nowrap'
      }
    }, fmt$(contingency)), /*#__PURE__*/React.createElement("td", null)), /*#__PURE__*/React.createElement("tr", {
      style: {
        borderTop: '2px solid rgba(0,0,0,.2)',
        fontWeight: 700
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px 6px 0'
      }
    }, "= Grand total"), /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: 'right',
        whiteSpace: 'nowrap'
      }
    }, fmt$(grand)))))), /*#__PURE__*/React.createElement(SectionHead, {
      num: "04",
      title: "Locked costs",
      small: true
    }), /*#__PURE__*/React.createElement("ul", {
      className: "alert-list"
    }, budget.locked.map((l, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, /*#__PURE__*/React.createElement("strong", null, l.item, " \u2014 ", fmt$(l.cost), "."), " ", l.note))), /*#__PURE__*/React.createElement(SectionHead, {
      num: "05",
      title: "Key flights (couple)",
      small: true
    }), /*#__PURE__*/React.createElement("ul", {
      className: "alert-list"
    }, budget.flights.map((f, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, /*#__PURE__*/React.createElement("strong", null, f.route, " \u2014 ", fmt$(f.cost), "."), " ", f.note))), /*#__PURE__*/React.createElement(SectionHead, {
      num: "06",
      title: "Assumptions & levers",
      small: true
    }), /*#__PURE__*/React.createElement("ul", {
      className: "alert-list"
    }, budget.assumptions.map((a, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, a)), budget.levers.map((l, i) => /*#__PURE__*/React.createElement("li", {
      key: 'l' + i
    }, l))));
  }
  function BudgetCard({
    title,
    items,
    tone,
    bordered
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: `budget-card budget-card-${tone} ${bordered ? 'is-bordered' : ''}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, title), /*#__PURE__*/React.createElement("ul", null, items.map((it, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, it))));
  }
  Object.assign(window, {
    ChapterList,
    DetailPanel,
    Binder
  });
})();