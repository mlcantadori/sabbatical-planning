"use strict";

// Sections beyond the atlas — the chapter grid, the full chapter spread,
// and the ledger + field kit binder. Read-only.

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
    dayCounter,
    contrastText
  } = helpers;
  const {
    placeWindows
  } = window.TRIP_NOW;
  function SectionHead({
    num,
    title,
    note
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "section-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "section-head-num"
    }, num), /*#__PURE__*/React.createElement("h2", {
      className: "section-head-title"
    }, title), note && /*#__PURE__*/React.createElement("span", {
      className: "section-head-note"
    }, note));
  }

  // ══════════════════════════════════════════════════════════════════════
  // CHAPTERS — the editorial index of the whole year.
  // ══════════════════════════════════════════════════════════════════════
  function ChapterCard({
    ch,
    isNow,
    isPast,
    isSelected,
    index,
    onOpen
  }) {
    const tint = window.chapterTint(ch);
    return /*#__PURE__*/React.createElement("button", {
      className: `ch-card ${isNow ? 'is-now' : ''} ${isPast ? 'is-past' : ''} ${isSelected ? 'is-selected' : ''}`,
      onClick: () => onOpen(ch.id),
      style: {
        '--tint': tint
      },
      "aria-label": `Open chapter ${ch.num}: ${ch.title}`
    }, /*#__PURE__*/React.createElement("span", {
      className: "ch-card-media"
    }, /*#__PURE__*/React.createElement(window.Photo, {
      keyword: ch.photos && ch.photos[0],
      alt: ch.title,
      ratio: "4/3",
      sizes: "(max-width: 880px) 90vw, 33vw"
    }), /*#__PURE__*/React.createElement("span", {
      className: "ch-card-shade"
    }), /*#__PURE__*/React.createElement("span", {
      className: "ch-card-num"
    }, String(ch.num || index + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
      className: "ch-card-days"
    }, ch.days, " nights"), isNow && /*#__PURE__*/React.createElement("span", {
      className: "ch-card-now"
    }, /*#__PURE__*/React.createElement("i", null), " You are here"), isPast && !isNow && /*#__PURE__*/React.createElement("span", {
      className: "ch-card-past"
    }, "walked")), /*#__PURE__*/React.createElement("span", {
      className: "ch-card-body"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ch-card-titlerow"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ch-card-title"
    }, ch.title), /*#__PURE__*/React.createElement("span", {
      className: "ch-card-flag"
    }, ch.flag)), /*#__PURE__*/React.createElement("span", {
      className: "ch-card-theme"
    }, ch.theme), /*#__PURE__*/React.createElement("span", {
      className: "ch-card-meta"
    }, /*#__PURE__*/React.createElement("span", null, fmt(ch.start), " \u2013 ", fmt(ch.end)), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("span", null, ch.weather ? `${ch.weather.hi}°/${ch.weather.lo}°` : '—'), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("span", null, ch.places.length, " stop", ch.places.length === 1 ? '' : 's')), /*#__PURE__*/React.createElement("span", {
      className: "ch-card-route"
    }, ch.tldr || (ch.places || []).map(p => p.name).join(' · '))));
  }
  function ChaptersView({
    current,
    selectedId,
    onOpen
  }) {
    const store = window.useStore();
    const chapters = store.getChapters();
    const stats = window.tripStats();
    const today = window.TRIP_NOW.todayISO();
    return /*#__PURE__*/React.createElement("div", {
      className: "page chapters-page"
    }, /*#__PURE__*/React.createElement("div", {
      className: "page-inner"
    }, /*#__PURE__*/React.createElement("header", {
      className: "page-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "page-eyebrow"
    }, /*#__PURE__*/React.createElement("span", null, "02"), " The arc"), /*#__PURE__*/React.createElement("h1", null, "Twenty-one chapters,", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", null, "one long way east.")), /*#__PURE__*/React.createElement("p", null, "A year is not a list of countries. It is a shape: a long, slow opening at home, a winter in the snow, an island spring, and a last bright month in the east. Open any chapter to see the days, the stops, and the thinking behind them."), /*#__PURE__*/React.createElement("div", {
      className: "page-facts"
    }, /*#__PURE__*/React.createElement("div", {
      className: "page-fact"
    }, /*#__PURE__*/React.createElement("b", null, stats.days), /*#__PURE__*/React.createElement("span", null, "days")), /*#__PURE__*/React.createElement("div", {
      className: "page-fact"
    }, /*#__PURE__*/React.createElement("b", null, stats.chapters), /*#__PURE__*/React.createElement("span", null, "chapters")), /*#__PURE__*/React.createElement("div", {
      className: "page-fact"
    }, /*#__PURE__*/React.createElement("b", null, stats.countries), /*#__PURE__*/React.createElement("span", null, "countries")), /*#__PURE__*/React.createElement("div", {
      className: "page-fact"
    }, /*#__PURE__*/React.createElement("b", null, stats.stops), /*#__PURE__*/React.createElement("span", null, "stops")))), /*#__PURE__*/React.createElement("div", {
      className: "chapter-grid"
    }, chapters.map((c, i) => /*#__PURE__*/React.createElement(ChapterCard, {
      key: c.id,
      ch: c,
      index: i,
      isNow: !!current && c.id === current.id,
      isPast: !!current && c.end < today,
      isSelected: c.id === selectedId,
      onOpen: onOpen
    }))), /*#__PURE__*/React.createElement("footer", {
      className: "page-foot"
    }, /*#__PURE__*/React.createElement("span", null, "Jun 21, 2026 \u2014 Jun 16, 2027"), /*#__PURE__*/React.createElement("button", {
      className: "pill-btn",
      onClick: () => onOpen((current || chapters[0]).id)
    }, "Open ", current ? 'where you are' : 'chapter one', " ", /*#__PURE__*/React.createElement(window.Icon.arrow, {
      size: 12
    })))));
  }

  // ══════════════════════════════════════════════════════════════════════
  // PHOTO CAROUSEL — chapter header + one photo per stop with a photo.
  // ══════════════════════════════════════════════════════════════════════
  function PhotoCarousel({
    items,
    tint,
    num,
    flag,
    country
  }) {
    const [idx, setIdx] = React.useState(0);
    const n = items.length;
    const touchX = React.useRef(null);
    if (!n) return null;
    const go = d => setIdx(i => (i + d + n) % n);
    const cur = items[idx];
    return /*#__PURE__*/React.createElement("div", {
      className: "detail-hero carousel",
      onTouchStart: e => {
        touchX.current = e.touches[0].clientX;
      },
      onTouchEnd: e => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      }
    }, /*#__PURE__*/React.createElement(window.Photo, {
      key: cur.keyword,
      keyword: cur.keyword,
      ratio: "auto",
      loading: "eager",
      style: {
        width: '100%',
        height: '100%',
        aspectRatio: 'unset'
      },
      caption: cur.caption
    }), /*#__PURE__*/React.createElement("div", {
      className: "detail-hero-shade"
    }), /*#__PURE__*/React.createElement("div", {
      className: "detail-hero-num",
      style: {
        color: tint
      }
    }, String(num || '').padStart(2, '0')), /*#__PURE__*/React.createElement("div", {
      className: "detail-hero-tag"
    }, flag, " ", country), n > 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "carousel-arrow is-left",
      onClick: () => go(-1),
      "aria-label": "Previous photo"
    }, "\u2039"), /*#__PURE__*/React.createElement("button", {
      className: "carousel-arrow is-right",
      onClick: () => go(1),
      "aria-label": "Next photo"
    }, "\u203A"), /*#__PURE__*/React.createElement("div", {
      className: "carousel-count"
    }, String(idx + 1).padStart(2, '0'), " / ", String(n).padStart(2, '0')), /*#__PURE__*/React.createElement("div", {
      className: "carousel-dots"
    }, items.map((it, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      className: `carousel-dot${i === idx ? ' is-active' : ''}`,
      onClick: () => setIdx(i),
      "aria-label": `Photo ${i + 1}: ${it.caption}`
    })))));
  }

  // ══════════════════════════════════════════════════════════════════════
  // DETAIL — a full editorial spread for one chapter.
  // ══════════════════════════════════════════════════════════════════════
  function DetailPanel({
    chapterId,
    onClose,
    onSelectPlace,
    selectedPlaceIdx,
    onOpenChapter
  }) {
    const store = window.useStore();
    const chapters = store.getChapters();
    const ch = store.getChapter(chapterId);
    if (!ch) return null;
    const region = REGIONS[ch.region] || {
      name: ''
    };
    const tint = window.chapterTint(ch);
    const startDay = dayCounter(ch.start).n;
    const endDay = dayCounter(ch.end).n;
    const windows = placeWindows(ch);
    const idx = chapters.findIndex(c => c.id === ch.id);
    const prev = chapters[(idx - 1 + chapters.length) % chapters.length];
    const next = chapters[(idx + 1) % chapters.length];
    return /*#__PURE__*/React.createElement("aside", {
      className: "detail-panel",
      role: "dialog",
      "aria-label": `Chapter ${ch.num}: ${ch.title}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "detail-topbar"
    }, /*#__PURE__*/React.createElement("span", {
      className: "detail-topbar-label"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        background: tint
      }
    }), "Chapter ", ch.kind === 'chapter' && ch.num != null ? String(ch.num).padStart(2, '0') : '··', " ", /*#__PURE__*/React.createElement("b", null, "/ ", String(chapters.length).padStart(2, '0'))), /*#__PURE__*/React.createElement("button", {
      className: "icon-btn",
      onClick: onClose,
      title: "Close chapter (Esc)"
    }, /*#__PURE__*/React.createElement(window.Icon.close, {
      size: 16
    }))), /*#__PURE__*/React.createElement("div", {
      className: "detail-scroll"
    }, /*#__PURE__*/React.createElement(PhotoCarousel, {
      key: ch.id,
      items: [{
        keyword: ch.photos[0],
        caption: `${ch.country.toUpperCase()} · ${fmt(ch.start)}`
      }, ...ch.places.map((p, i) => p.photo ? {
        keyword: p.photo,
        caption: `${i + 1}. ${p.name}`
      } : null).filter(Boolean)],
      tint: tint,
      num: ch.num,
      flag: ch.flag,
      country: ch.country
    }), /*#__PURE__*/React.createElement("div", {
      className: "detail-content"
    }, /*#__PURE__*/React.createElement("div", {
      className: "detail-eyebrow"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: tint
      }
    }, region.name), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("span", null, ch.tldr)), /*#__PURE__*/React.createElement("h1", {
      className: "detail-title"
    }, ch.title), ch.theme && /*#__PURE__*/React.createElement("p", {
      className: "detail-theme"
    }, ch.theme, "."), /*#__PURE__*/React.createElement("div", {
      className: "detail-facts"
    }, /*#__PURE__*/React.createElement("div", {
      className: "detail-fact"
    }, /*#__PURE__*/React.createElement("span", null, "Window"), /*#__PURE__*/React.createElement("b", null, fmt(ch.start), " \u2013 ", fmt(ch.end)), /*#__PURE__*/React.createElement("i", null, ch.days, " nights")), /*#__PURE__*/React.createElement("div", {
      className: "detail-fact"
    }, /*#__PURE__*/React.createElement("span", null, "Day of trip"), /*#__PURE__*/React.createElement("b", null, startDay, "\u2013", endDay), /*#__PURE__*/React.createElement("i", null, "of ", totalDays)), /*#__PURE__*/React.createElement("div", {
      className: "detail-fact"
    }, /*#__PURE__*/React.createElement("span", null, "Weather"), /*#__PURE__*/React.createElement("b", null, ch.weather ? `${ch.weather.hi}° / ${ch.weather.lo}°` : '—'), /*#__PURE__*/React.createElement("i", null, ch.weather ? ch.weather.label : '')), /*#__PURE__*/React.createElement("div", {
      className: "detail-fact"
    }, /*#__PURE__*/React.createElement("span", null, "Rain"), /*#__PURE__*/React.createElement("b", null, ch.weather ? `${ch.weather.rainyDays ?? 0} day${(ch.weather.rainyDays ?? 0) === 1 ? '' : 's'}` : '—'), /*#__PURE__*/React.createElement("i", null, ch.weather ? ch.weather.emoji : ''))), ch.intro && /*#__PURE__*/React.createElement("p", {
      className: "detail-intro"
    }, ch.intro), /*#__PURE__*/React.createElement(SectionHead, {
      num: "01",
      title: "The stops",
      note: `${ch.places.length} stops · ${ch.days} nights`
    }), /*#__PURE__*/React.createElement("div", {
      className: "stop-timeline",
      style: {
        '--tint': tint
      }
    }, ch.places.map((p, i) => {
      const w = windows[i] || {};
      const active = selectedPlaceIdx === i;
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        className: `stop-row ${active ? 'is-active' : ''}`,
        onClick: () => onSelectPlace(i),
        role: "button",
        tabIndex: 0,
        onKeyDown: e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectPlace(i);
          }
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "stop-date"
      }, /*#__PURE__*/React.createElement("span", {
        className: "stop-date-day"
      }, fmt(w.start)), /*#__PURE__*/React.createElement("span", {
        className: "stop-date-end"
      }, w.end && w.end !== w.start ? `→ ${fmt(w.end)}` : ''), /*#__PURE__*/React.createElement("span", {
        className: "stop-date-nights"
      }, p.days, " night", p.days === 1 ? '' : 's')), /*#__PURE__*/React.createElement("div", {
        className: "stop-node"
      }, /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("div", {
        className: "stop-body"
      }, /*#__PURE__*/React.createElement("div", {
        className: "stop-titlerow"
      }, /*#__PURE__*/React.createElement("span", {
        className: "stop-idx"
      }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
        className: "stop-name"
      }, p.name), p.coords && /*#__PURE__*/React.createElement("button", {
        className: "stop-map",
        onClick: e => {
          e.stopPropagation();
          window.openMaps(p.query);
        },
        title: "Open in Google Maps"
      }, /*#__PURE__*/React.createElement(window.Icon.external, {
        size: 10
      }))), /*#__PURE__*/React.createElement("div", {
        className: "stop-highlights"
      }, (p.highlights || []).map((h, j) => /*#__PURE__*/React.createElement("span", {
        key: j,
        className: "stop-highlight"
      }, h)))));
    })), ch.decisions && ch.decisions.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionHead, {
      num: "02",
      title: "Why it looks like this",
      note: "route decisions"
    }), /*#__PURE__*/React.createElement("ol", {
      className: "decision-list"
    }, ch.decisions.map((d, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, d)))), /*#__PURE__*/React.createElement("div", {
      className: "detail-nav"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onOpenChapter(prev.id)
    }, /*#__PURE__*/React.createElement(window.Icon.arrowLeft, {
      size: 13
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", null, "Previous"), prev.title)), /*#__PURE__*/React.createElement("button", {
      className: "is-next",
      onClick: () => onOpenChapter(next.id)
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", null, "Next"), next.title), /*#__PURE__*/React.createElement(window.Icon.arrow, {
      size: 13
    }))))));
  }

  // ══════════════════════════════════════════════════════════════════════
  // BINDER — Ledger and Field Kit pages.
  // ══════════════════════════════════════════════════════════════════════
  function Binder({
    view,
    onClose,
    onOpenChapter
  }) {
    const isTodo = view === 'kit';
    return /*#__PURE__*/React.createElement("div", {
      className: "page binder-page"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-bar"
    }, /*#__PURE__*/React.createElement("button", {
      className: "binder-back",
      onClick: onClose
    }, /*#__PURE__*/React.createElement(window.Icon.arrowLeft, {
      size: 13
    }), " Atlas"), /*#__PURE__*/React.createElement("span", {
      className: "binder-crumb"
    }, "The Long Way East ", /*#__PURE__*/React.createElement("i", null, "/"), " ", isTodo ? 'Field kit' : 'Ledger'), /*#__PURE__*/React.createElement("span", {
      className: "binder-date"
    }, fmt(window.TRIP_NOW.todayISO()))), /*#__PURE__*/React.createElement("div", {
      className: "binder-scroll"
    }, isTodo ? /*#__PURE__*/React.createElement(window.TodoView, null) : /*#__PURE__*/React.createElement(BudgetView, {
      onOpenChapter: onOpenChapter
    })));
  }

  // ══════════════════════════════════════════════════════════════════════
  // BUDGET — the ledger.
  // ══════════════════════════════════════════════════════════════════════
  function BudgetView({
    onOpenChapter
  }) {
    const store = window.useStore();
    const fmt$ = n => '$' + Math.round(n).toLocaleString('en-US');
    const CATS = [['lodging', 'Lodging', '#ff9a4c'], ['food', 'Food', '#efc55e'], ['transport', 'Local transport', '#84ca96'], ['activities', 'Activities & diving', '#5bb0c1'], ['fees', 'Visas & park fees', '#8b77b8']];
    const chapters = store.getChapters();
    const byId = Object.fromEntries(chapters.map(c => [c.id, c]));
    const rowTotal = r => CATS.reduce((s, [k]) => s + (r[k] || 0), 0);
    const chTotal = budget.chapters.reduce((s, r) => s + rowTotal(r), 0);
    const flightsTotal = budget.flights.reduce((s, f) => s + f.cost, 0);
    const extrasTotal = budget.extras.reduce((s, e) => s + e.cost, 0);
    const subtotal = chTotal + flightsTotal + extrasTotal;
    const contingency = Math.round(subtotal * budget.contingencyPct / 100);
    const grand = subtotal + contingency;
    const perDay = Math.round(grand / totalDays);
    const perPersonMonth = Math.round(grand / 2 / (totalDays / 30.44));
    const perPersonMonthBRL = Math.round(perPersonMonth * budget.fxBRL);
    const catTotals = Object.fromEntries(CATS.map(([k]) => [k, budget.chapters.reduce((s, r) => s + (r[k] || 0), 0)]));
    const slices = [...CATS.map(([k, label, color]) => ({
      label,
      value: catTotals[k],
      color
    })), {
      label: 'Inter-chapter flights',
      value: flightsTotal,
      color: '#c98a2a'
    }, {
      label: 'Insurance & extras',
      value: extrasTotal,
      color: '#7f9dd8'
    }, {
      label: `Contingency ${budget.contingencyPct}%`,
      value: contingency,
      color: 'rgba(244,236,220,.28)'
    }];
    let acc = 0;
    const gradient = slices.map(s => {
      const from = acc / grand * 100;
      acc += s.value;
      const to = acc / grand * 100;
      return `${s.color} ${from}% ${to}%`;
    }).join(', ');
    const rows = budget.chapters.map((r, i) => ({
      ...r,
      idx: i + 1,
      title: byId[r.id] && byId[r.id].title || r.id,
      total: rowTotal(r),
      perDay: rowTotal(r) / r.days,
      tint: byId[r.id] ? window.chapterTint(byId[r.id]) : '#ff7a45'
    }));
    const maxRow = Math.max(...rows.map(r => r.total));
    const [sortKey, setSortKey] = React.useState('idx');
    const [sortDir, setSortDir] = React.useState(1);
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
    const COLS = [['idx', '#'], ['title', 'Chapter'], ['days', 'Nights'], ['perDay', '$/night'], ['lodging', 'Lodging'], ['food', 'Food'], ['transport', 'Transport'], ['activities', 'Activities'], ['fees', 'Fees'], ['total', 'Total']];
    return /*#__PURE__*/React.createElement("div", {
      className: "page-inner ledger-page"
    }, /*#__PURE__*/React.createElement("header", {
      className: "page-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "page-eyebrow"
    }, /*#__PURE__*/React.createElement("span", null, "03"), " The ledger"), /*#__PURE__*/React.createElement("h1", null, "What a year costs.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", null, "And what it buys.")), /*#__PURE__*/React.createElement("p", null, "Mid-range with strategic splurges, priced for two across 360 days. Totals compute from the lines below \u2014 nothing is hardcoded, so the numbers cannot quietly lie.")), /*#__PURE__*/React.createElement("div", {
      className: "money-hero"
    }, /*#__PURE__*/React.createElement("div", {
      className: "money-total"
    }, /*#__PURE__*/React.createElement("span", {
      className: "money-label"
    }, "Grand total \xB7 two travellers"), /*#__PURE__*/React.createElement("span", {
      className: "money-big"
    }, fmt$(grand)), /*#__PURE__*/React.createElement("span", {
      className: "money-sub"
    }, /*#__PURE__*/React.createElement("span", {
      className: "money-stat"
    }, /*#__PURE__*/React.createElement("b", null, fmt$(perDay)), /*#__PURE__*/React.createElement("em", null, "per day for two")), /*#__PURE__*/React.createElement("span", {
      className: "money-stat"
    }, /*#__PURE__*/React.createElement("b", null, fmt$(perPersonMonth)), /*#__PURE__*/React.createElement("em", null, "per person / month")), /*#__PURE__*/React.createElement("span", {
      className: "money-stat"
    }, /*#__PURE__*/React.createElement("b", null, "R$", perPersonMonthBRL.toLocaleString('en-US')), /*#__PURE__*/React.createElement("em", null, "per person / month"))), /*#__PURE__*/React.createElement("span", {
      className: "money-note"
    }, totalDays, " days \xB7 ", budget.inBRL)), /*#__PURE__*/React.createElement("div", {
      className: "donut-wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "donut",
      style: {
        background: `conic-gradient(${gradient})`
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "donut-hole"
    }, /*#__PURE__*/React.createElement("span", null, budget.contingencyPct, "%"), /*#__PURE__*/React.createElement("i", null, "contingency"))), /*#__PURE__*/React.createElement("ul", {
      className: "donut-key"
    }, slices.map(s => /*#__PURE__*/React.createElement("li", {
      key: s.label
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        background: s.color
      }
    }), /*#__PURE__*/React.createElement("span", null, s.label), /*#__PURE__*/React.createElement("b", null, fmt$(s.value))))))), /*#__PURE__*/React.createElement(SectionHead, {
      num: "01",
      title: "Where the nights go",
      note: "total spend per chapter"
    }), /*#__PURE__*/React.createElement("div", {
      className: "bar-list"
    }, rows.map(r => /*#__PURE__*/React.createElement("button", {
      key: r.id,
      className: "bar-row",
      onClick: () => onOpenChapter && onOpenChapter(r.id),
      title: r.note
    }, /*#__PURE__*/React.createElement("span", {
      className: "bar-ch"
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        background: r.tint
      }
    }), String(r.idx).padStart(2, '0'), " ", r.title), /*#__PURE__*/React.createElement("span", {
      className: "bar-track"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: `${Math.max(2, r.total / maxRow * 100)}%`,
        background: r.tint
      }
    })), /*#__PURE__*/React.createElement("span", {
      className: "bar-val"
    }, fmt$(r.total)), /*#__PURE__*/React.createElement("span", {
      className: "bar-per"
    }, fmt$(r.perDay), /*#__PURE__*/React.createElement("i", null, "/night"))))), /*#__PURE__*/React.createElement(SectionHead, {
      num: "02",
      title: "The long table",
      note: "click a column to sort"
    }), /*#__PURE__*/React.createElement("div", {
      className: "ledger-table-wrap"
    }, /*#__PURE__*/React.createElement("table", {
      className: "ledger-table"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, COLS.map(([k, label]) => /*#__PURE__*/React.createElement("th", {
      key: k,
      className: k === 'total' ? 'is-num' : ''
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => toggleSort(k)
    }, label, sortKey === k ? sortDir === 1 ? ' ▲' : ' ▼' : ''))))), /*#__PURE__*/React.createElement("tbody", null, sorted.map(r => /*#__PURE__*/React.createElement("tr", {
      key: r.id,
      title: r.note
    }, /*#__PURE__*/React.createElement("td", {
      className: "is-muted"
    }, r.idx), /*#__PURE__*/React.createElement("td", {
      className: "is-name"
    }, r.title), /*#__PURE__*/React.createElement("td", null, r.days), /*#__PURE__*/React.createElement("td", null, fmt$(r.perDay)), /*#__PURE__*/React.createElement("td", null, fmt$(r.lodging)), /*#__PURE__*/React.createElement("td", null, fmt$(r.food)), /*#__PURE__*/React.createElement("td", null, fmt$(r.transport)), /*#__PURE__*/React.createElement("td", null, fmt$(r.activities)), /*#__PURE__*/React.createElement("td", null, fmt$(r.fees)), /*#__PURE__*/React.createElement("td", {
      className: "is-num is-total"
    }, fmt$(r.total)))), /*#__PURE__*/React.createElement("tr", {
      className: "is-sum"
    }, /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", {
      className: "is-name"
    }, "Chapters"), /*#__PURE__*/React.createElement("td", null, budget.chapters.reduce((s, r) => s + r.days, 0)), /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", {
      className: "is-num is-total"
    }, fmt$(chTotal)))))), /*#__PURE__*/React.createElement("div", {
      className: "ledger-below"
    }, /*#__PURE__*/React.createElement("div", {
      className: "receipt"
    }, /*#__PURE__*/React.createElement("div", {
      className: "receipt-head"
    }, /*#__PURE__*/React.createElement("span", null, "The whole bill"), /*#__PURE__*/React.createElement("span", null, "USD \xB7 two")), [[`Chapters (${budget.chapters.length})`, chTotal], [`Inter-chapter flights (${budget.flights.length} legs)`, flightsTotal], ['Insurance & extras', extrasTotal]].map(([label, value]) => /*#__PURE__*/React.createElement("div", {
      key: label,
      className: "receipt-row"
    }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("b", null, fmt$(value)))), /*#__PURE__*/React.createElement("div", {
      className: "receipt-row is-sub"
    }, /*#__PURE__*/React.createElement("span", null, "Subtotal"), /*#__PURE__*/React.createElement("b", null, fmt$(subtotal))), /*#__PURE__*/React.createElement("div", {
      className: "receipt-row"
    }, /*#__PURE__*/React.createElement("span", null, "Contingency ", budget.contingencyPct, "%"), /*#__PURE__*/React.createElement("b", null, fmt$(contingency))), /*#__PURE__*/React.createElement("div", {
      className: "receipt-row is-grand"
    }, /*#__PURE__*/React.createElement("span", null, "Grand total"), /*#__PURE__*/React.createElement("b", null, fmt$(grand))), /*#__PURE__*/React.createElement("div", {
      className: "receipt-foot"
    }, "\u2248 R$", Math.round(grand * budget.fxBRL).toLocaleString('en-US'), " at today's rate")), /*#__PURE__*/React.createElement("div", {
      className: "ledger-notes"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ledger-note"
    }, /*#__PURE__*/React.createElement("h3", null, "Locked & paid"), /*#__PURE__*/React.createElement("ul", null, budget.locked.map((l, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, /*#__PURE__*/React.createElement("b", null, l.item, " \u2014 ", fmt$(l.cost), "."), " ", l.note)))), /*#__PURE__*/React.createElement("div", {
      className: "ledger-note"
    }, /*#__PURE__*/React.createElement("h3", null, "Key flights"), /*#__PURE__*/React.createElement("ul", null, budget.flights.map((f, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, /*#__PURE__*/React.createElement("b", null, f.route, " \u2014 ", fmt$(f.cost), "."), " ", f.note)))), /*#__PURE__*/React.createElement("div", {
      className: "ledger-note"
    }, /*#__PURE__*/React.createElement("h3", null, "Assumptions & levers"), /*#__PURE__*/React.createElement("ul", null, budget.assumptions.map((a, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, a)), budget.levers.map((l, i) => /*#__PURE__*/React.createElement("li", {
      key: 'l' + i
    }, l)))))));
  }
  Object.assign(window, {
    ChaptersView,
    DetailPanel,
    Binder
  });
})();