"use strict";

// To-do checklist — advance bookings grouped by chapter. Past chapters
// (ended before today) start collapsed to avoid crowding; everything else
// starts open. Done states seed from todo-data.js and persist per-browser
// in localStorage; Export copies the current states back into file format.

(function () {
  const {
    helpers
  } = window.TRIP;
  const {
    fmt,
    dayRange
  } = helpers;
  const LS_KEY = 'todo-done-v1';
  const CATS = [['transport', 'Transport'], ['stay', 'Stays'], ['car', 'Car rental'], ['attraction', 'Attractions'], ['visa', 'Visas & permits'], ['admin', 'Docs & admin']];
  const CAT_LABEL = Object.fromEntries(CATS);
  const todayStr = () => {
    const n = new Date();
    return n.toISOString().slice(0, 10);
  };
  function loadOverrides() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    } catch {
      return {};
    }
  }
  function TodoView() {
    const store = window.useStore();
    const chapters = store.getChapters();
    const today = todayStr();
    const byId = Object.fromEntries(chapters.map(c => [c.id, c]));
    const [overrides, setOverrides] = React.useState(loadOverrides);
    const [catFilter, setCatFilter] = React.useState('all');
    const [hideDone, setHideDone] = React.useState(false);
    const [explicitOpen, setExplicitOpen] = React.useState({});
    const [showExport, setShowExport] = React.useState(false);
    const items = React.useMemo(() => (window.TODO_ITEMS || []).map(t => ({
      ...t,
      done: overrides[t.id] !== undefined ? overrides[t.id] : !!t.done
    })), [overrides]);
    const toggle = id => {
      setOverrides(prev => {
        const cur = prev[id] !== undefined ? prev[id] : !!(window.TODO_ITEMS || []).find(t => t.id === id)?.done;
        const next = {
          ...prev,
          [id]: !cur
        };
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    };
    const resetOverrides = () => {
      try {
        localStorage.removeItem(LS_KEY);
      } catch {}
      setOverrides({});
    };

    // Groups in trip order: prep first, then chapters that own items.
    const groups = React.useMemo(() => {
      const withItems = new Set(items.map(t => t.ch));
      const list = [];
      if (withItems.has('prep')) list.push({
        key: 'prep',
        ch: null
      });
      chapters.forEach(c => {
        if (withItems.has(c.id)) list.push({
          key: c.id,
          ch: c
        });
      });
      const orphans = items.filter(t => t.ch !== 'prep' && !byId[t.ch]);
      if (orphans.length) list.push({
        key: 'other',
        ch: null
      });
      return list.map(g => ({
        ...g,
        items: items.filter(t => g.key === 'other' ? t.ch !== 'prep' && !byId[t.ch] : t.ch === g.key).slice().sort((a, b) => a.due < b.due ? -1 : a.due > b.due ? 1 : 0)
      }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, chapters]);
    const isPast = ch => !!ch && ch.end && ch.end < today;
    const isOpen = g => explicitOpen[g.key] !== undefined ? explicitOpen[g.key] : !isPast(g.ch);
    const setGroup = (key, v) => setExplicitOpen(p => ({
      ...p,
      [key]: v
    }));
    const expandAll = () => setExplicitOpen(Object.fromEntries(groups.map(g => [g.key, true])));
    const collapseAll = () => setExplicitOpen(Object.fromEntries(groups.map(g => [g.key, false])));
    const open = items.filter(t => !t.done);
    const overdue = open.filter(t => t.due && t.due < today);
    const exportText = React.useMemo(() => '// Paste each line into the matching item in todo-data.js (done: …),\n' + '// then rebuild. Generated from current checklist state.\n' + items.map(t => `${t.id}: ${t.done ? 'true' : 'false'},`).join('\n'), [items]);
    const copyExport = () => {
      try {
        if (navigator.clipboard) navigator.clipboard.writeText(exportText).catch(() => {});
      } catch {}
    };
    const visibleItems = list => list.filter(t => (catFilter === 'all' || t.cat === catFilter) && !(hideDone && t.done));
    return /*#__PURE__*/React.createElement("div", {
      className: "binder-pane"
    }, /*#__PURE__*/React.createElement("div", {
      className: "binder-pane-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "\xA7 Before you go"), /*#__PURE__*/React.createElement("h2", {
      className: "binder-pane-title"
    }, "To-do"), /*#__PURE__*/React.createElement("p", {
      className: "binder-pane-sub"
    }, "Advance bookings only \u2014 transport, stays, cars, scarce attractions, visas. Day-to-day stuff stays out."))), /*#__PURE__*/React.createElement("div", {
      className: "budget-hero"
    }, /*#__PURE__*/React.createElement("div", {
      className: "budget-hero-big"
    }, open.length, " open"), /*#__PURE__*/React.createElement("div", {
      className: "budget-hero-sub"
    }, items.length - open.length, "/", items.length, " done", overdue.length ? ` · ${overdue.length} overdue` : ''), /*#__PURE__*/React.createElement("div", {
      className: "budget-hero-sub"
    }, /*#__PURE__*/React.createElement("button", {
      className: "pill-btn",
      onClick: () => setShowExport(v => !v)
    }, "Export status"), ' ', /*#__PURE__*/React.createElement("button", {
      className: "pill-btn",
      onClick: resetOverrides,
      title: "Forget browser ticks, go back to file defaults"
    }, "Reset to file"))), showExport && /*#__PURE__*/React.createElement("div", {
      className: "todo-export"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kicker"
    }, "Copy into todo-data.js, then commit \u2014 that file is the durable record"), /*#__PURE__*/React.createElement("textarea", {
      readOnly: true,
      value: exportText,
      rows: Math.min(12, items.length + 2),
      onFocus: e => e.target.select()
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
      className: "pill-btn",
      onClick: copyExport
    }, "Copy"))), /*#__PURE__*/React.createElement("div", {
      className: "todo-filters"
    }, /*#__PURE__*/React.createElement("div", {
      className: "seg"
    }, /*#__PURE__*/React.createElement("button", {
      className: catFilter === 'all' ? 'is-active' : '',
      onClick: () => setCatFilter('all')
    }, "All"), CATS.map(([k, label]) => /*#__PURE__*/React.createElement("button", {
      key: k,
      className: catFilter === k ? 'is-active' : '',
      onClick: () => setCatFilter(k)
    }, label))), /*#__PURE__*/React.createElement("div", {
      className: "todo-filter-row"
    }, /*#__PURE__*/React.createElement("label", {
      className: "todo-check-label"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: hideDone,
      onChange: e => setHideDone(e.target.checked)
    }), " Hide done"), /*#__PURE__*/React.createElement("span", {
      className: "todo-expand-links"
    }, /*#__PURE__*/React.createElement("button", {
      className: "pill-btn",
      onClick: expandAll
    }, "Expand all"), " ", /*#__PURE__*/React.createElement("button", {
      className: "pill-btn",
      onClick: collapseAll
    }, "Collapse all")))), groups.map(g => {
      const list = visibleItems(g.items);
      const doneN = g.items.filter(t => t.done).length;
      const openN = g.items.length - doneN;
      const past = isPast(g.ch);
      const openState = isOpen(g);
      const title = g.key === 'prep' ? 'Before you leave' : g.key === 'other' ? 'Unsorted' : `${g.ch.num != null ? String(g.ch.num).padStart(2, '0') + ' · ' : ''}${g.ch.flag || ''} ${g.ch.title}`;
      const sub = g.ch ? dayRange(g.ch.start, g.ch.end) : g.key === 'prep' ? 'Visas, insurance, paperwork' : '';
      return /*#__PURE__*/React.createElement("div", {
        key: g.key,
        className: "todo-group"
      }, /*#__PURE__*/React.createElement("button", {
        className: "todo-group-head",
        onClick: () => setGroup(g.key, !openState)
      }, /*#__PURE__*/React.createElement("span", {
        className: "todo-group-caret"
      }, openState ? '▾' : '▸'), /*#__PURE__*/React.createElement("span", {
        className: "todo-group-title"
      }, title), /*#__PURE__*/React.createElement("span", {
        className: "todo-group-dates"
      }, sub), /*#__PURE__*/React.createElement("span", {
        className: `todo-group-count${openN === 0 ? ' is-done' : ''}`
      }, openN, " open"), past && /*#__PURE__*/React.createElement("span", {
        className: "todo-group-past"
      }, "ended")), openState && /*#__PURE__*/React.createElement("div", {
        className: "todo-list"
      }, list.length === 0 && /*#__PURE__*/React.createElement("div", {
        className: "todo-empty"
      }, "Nothing here \u2014 try another filter."), list.map(t => {
        const od = !t.done && t.due && t.due < today;
        return /*#__PURE__*/React.createElement("div", {
          key: t.id,
          className: `todo-row${t.done ? ' is-done' : ''}`
        }, /*#__PURE__*/React.createElement("button", {
          className: `booking-check${t.done ? ' is-done' : ''}`,
          onClick: () => toggle(t.id),
          title: t.done ? 'Mark open' : 'Mark done'
        }, t.done ? '✓' : ''), /*#__PURE__*/React.createElement("div", {
          className: "todo-row-body"
        }, /*#__PURE__*/React.createElement("div", {
          className: "todo-row-title"
        }, t.title), /*#__PURE__*/React.createElement("div", {
          className: "todo-row-meta"
        }, /*#__PURE__*/React.createElement("span", {
          className: "kicker"
        }, CAT_LABEL[t.cat] || t.cat), t.place && /*#__PURE__*/React.createElement("span", {
          className: "todo-row-place"
        }, t.place), t.note && /*#__PURE__*/React.createElement("span", {
          className: "todo-row-note"
        }, t.note))), /*#__PURE__*/React.createElement("div", {
          className: `todo-due${od ? ' is-overdue' : ''}`,
          title: `Book by ${t.due}`
        }, od ? 'overdue · ' : '', t.due ? fmt(t.due) : '—'));
      })));
    }));
  }
  window.TodoView = TodoView;
})();