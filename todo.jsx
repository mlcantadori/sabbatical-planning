// To-do checklist — advance bookings grouped by chapter. Past chapters
// (ended before today) start collapsed to avoid crowding; everything else
// starts open. Done states seed from todo-data.js and persist per-browser
// in localStorage; Export copies the current states back into file format.

(function () {
  const { helpers } = window.TRIP;
  const { fmt, dayRange } = helpers;
  const LS_KEY = 'todo-done-v1';

  const CATS = [
    ['transport', 'Transport'],
    ['stay', 'Stays'],
    ['car', 'Car rental'],
    ['attraction', 'Attractions'],
    ['visa', 'Visas & permits'],
    ['admin', 'Docs & admin'],
  ];
  const CAT_LABEL = Object.fromEntries(CATS);

  const todayStr = () => {
    const n = new Date();
    return n.toISOString().slice(0, 10);
  };
  const plusDaysStr = (iso, n) => {
    const d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };
  // "3d overdue" / "due today" / "in 5d" — UTC day math, no TZ drift.
  const relDue = (due, today) => {
    const ms = new Date(due + 'T00:00:00Z') - new Date(today + 'T00:00:00Z');
    const n = Math.round(ms / 86400000);
    if (n < 0) return `${-n}d overdue`;
    if (n === 0) return 'due today';
    return `in ${n}d`;
  };

  function loadOverrides() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
  }

  function TodoView() {
    const store = window.useStore();
    const chapters = store.getChapters();
    const today = todayStr();
    const byId = Object.fromEntries(chapters.map((c) => [c.id, c]));

    const [overrides, setOverrides] = React.useState(loadOverrides);
    const [catFilter, setCatFilter] = React.useState('all');
    const [hideDone, setHideDone] = React.useState(false);
    const [groupBy, setGroupBy] = React.useState('chapter'); // 'chapter' | 'due'
    const [explicitOpen, setExplicitOpen] = React.useState({});
    const [showExport, setShowExport] = React.useState(false);

    const items = React.useMemo(() => (window.TODO_ITEMS || []).map((t) => ({
      ...t, done: overrides[t.id] !== undefined ? overrides[t.id] : !!t.done,
    })), [overrides]);

    const toggle = (id) => {
      setOverrides((prev) => {
        const cur = prev[id] !== undefined ? prev[id] : !!(window.TODO_ITEMS || []).find((t) => t.id === id)?.done;
        const next = { ...prev, [id]: !cur };
        try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    };
    const resetOverrides = () => {
      try { localStorage.removeItem(LS_KEY); } catch {}
      setOverrides({});
    };

    // Groups in trip order: prep first, then chapters that own items.
    const groups = React.useMemo(() => {
      const withItems = new Set(items.map((t) => t.ch));
      const list = [];
      if (withItems.has('prep')) list.push({ key: 'prep', ch: null });
      chapters.forEach((c) => { if (withItems.has(c.id)) list.push({ key: c.id, ch: c }); });
      const orphans = items.filter((t) => t.ch !== 'prep' && !byId[t.ch]);
      if (orphans.length) list.push({ key: 'other', ch: null });
      return list.map((g) => ({
        ...g,
        items: items.filter((t) => (g.key === 'other' ? (t.ch !== 'prep' && !byId[t.ch]) : t.ch === g.key))
          .slice().sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0)),
      }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, chapters]);

    const isPast = (ch) => !!ch && ch.end && ch.end < today;
    const isOpen = (g) => explicitOpen[g.key] !== undefined ? explicitOpen[g.key] : !isPast(g.ch);
    const setGroup = (key, v) => setExplicitOpen((p) => ({ ...p, [key]: v }));
    const expandAll = () => setExplicitOpen(Object.fromEntries(groups.map((g) => [g.key, true])));
    const collapseAll = () => setExplicitOpen(Object.fromEntries(groups.map((g) => [g.key, false])));

    const open = items.filter((t) => !t.done);
    const overdue = open.filter((t) => t.due && t.due < today);
    const dueSoon = open
      .filter((t) => t.due && t.due <= plusDaysStr(today, 14))
      .filter((t) => catFilter === 'all' || t.cat === catFilter)
      .slice().sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));
    const exportText = React.useMemo(() => (
      '// Paste each line into the matching item in todo-data.js (done: …),\n'
      + '// then rebuild. Generated from current checklist state.\n'
      + items.map((t) => `${t.id}: ${t.done ? 'true' : 'false'},`).join('\n')
    ), [items]);
    const copyExport = () => {
      try {
        if (navigator.clipboard) navigator.clipboard.writeText(exportText).catch(() => {});
      } catch {}
    };

    const visibleItems = (list) => list.filter((t) =>
      (catFilter === 'all' || t.cat === catFilter) && !(hideDone && t.done));

    const groupTag = (t) => {
      if (t.ch === 'prep') return 'Before you leave';
      const c = byId[t.ch];
      if (!c) return t.ch;
      return `${c.num != null ? String(c.num).padStart(2, '0') + ' · ' : ''}${c.flag || ''} ${c.title}`;
    };

    const renderItem = (t, showGroup) => {
      const od = !t.done && t.due && t.due < today;
      const soon = !t.done && !od && t.due && t.due <= plusDaysStr(today, 14);
      return (
        <div key={t.id} className={`todo-row${t.done ? ' is-done' : ''}`}>
          <button className={`booking-check${t.done ? ' is-done' : ''}`} onClick={() => toggle(t.id)} title={t.done ? 'Mark open' : 'Mark done'}>
            {t.done ? '✓' : ''}
          </button>
          <div className="todo-row-body">
            <div className="todo-row-title">{t.title}</div>
            <div className="todo-row-meta">
              <span className="kicker">{CAT_LABEL[t.cat] || t.cat}</span>
              {showGroup && <span className="todo-row-group">{groupTag(t)}</span>}
              {t.place && <span className="todo-row-place">{t.place}</span>}
              {t.note && <span className="todo-row-note">{t.note}</span>}
            </div>
          </div>
          <div className={`todo-due${od ? ' is-overdue' : soon ? ' is-soon' : ''}`} title={`Book by ${t.due}`}>
            {t.done ? (t.due ? fmt(t.due) : '—') : `${relDue(t.due, today)} · ${fmt(t.due)}`}
          </div>
        </div>
      );
    };

    return (
      <div className="binder-pane">
        <div className="binder-pane-head">
          <div>
            <div className="kicker">§ Before you go</div>
            <h2 className="binder-pane-title">To-do</h2>
            <p className="binder-pane-sub">Advance bookings only — transport, stays, cars, scarce attractions, visas. Day-to-day stuff stays out.</p>
          </div>
        </div>
        <div className="budget-hero">
          <div className="budget-hero-big">{open.length} open</div>
          <div className="budget-hero-sub">{items.length - open.length}/{items.length} done{overdue.length ? ` · ${overdue.length} overdue` : ''}</div>
          <div className="budget-hero-sub">
            <button className="pill-btn" onClick={() => setShowExport((v) => !v)}>Export status</button>
            {' '}<button className="pill-btn" onClick={resetOverrides} title="Forget browser ticks, go back to file defaults">Reset to file</button>
          </div>
        </div>

        {showExport && (
          <div className="todo-export">
            <div className="kicker">Copy into todo-data.js, then commit — that file is the durable record</div>
            <textarea readOnly value={exportText} rows={Math.min(12, items.length + 2)} onFocus={(e) => e.target.select()} />
            <div><button className="pill-btn" onClick={copyExport}>Copy</button></div>
          </div>
        )}

        <div className="todo-filters">
          <div className="seg">
            <button className={groupBy === 'chapter' ? 'is-active' : ''} onClick={() => setGroupBy('chapter')}>By chapter</button>
            <button className={groupBy === 'due' ? 'is-active' : ''} onClick={() => setGroupBy('due')}>Due soon{dueSoon.length ? ` (${dueSoon.length})` : ''}</button>
          </div>
          <div className="seg">
            <button className={catFilter === 'all' ? 'is-active' : ''} onClick={() => setCatFilter('all')}>All</button>
            {CATS.map(([k, label]) => (
              <button key={k} className={catFilter === k ? 'is-active' : ''} onClick={() => setCatFilter(k)}>{label}</button>
            ))}
          </div>
          <div className="todo-filter-row">
            <label className="todo-check-label"><input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} /> Hide done</label>
            {groupBy === 'chapter' && (
              <span className="todo-expand-links"><button className="pill-btn" onClick={expandAll}>Expand all</button> <button className="pill-btn" onClick={collapseAll}>Collapse all</button></span>
            )}
          </div>
        </div>

        {groupBy === 'due' ? (
          <div className="todo-list">
            {dueSoon.length === 0 && <div className="todo-empty">Nothing overdue or due in the next 14 days. 🎉</div>}
            {dueSoon.map((t) => renderItem(t, true))}
          </div>
        ) : (
        groups.map((g) => {
          const list = visibleItems(g.items);
          const doneN = g.items.filter((t) => t.done).length;
          const openN = g.items.length - doneN;
          const past = isPast(g.ch);
          const openState = isOpen(g);
          const title = g.key === 'prep' ? 'Before you leave' : g.key === 'other' ? 'Unsorted' : `${g.ch.num != null ? String(g.ch.num).padStart(2, '0') + ' · ' : ''}${g.ch.flag || ''} ${g.ch.title}`;
          const sub = g.ch ? dayRange(g.ch.start, g.ch.end) : (g.key === 'prep' ? 'Visas, insurance, paperwork' : '');
          return (
            <div key={g.key} className="todo-group">
              <button className="todo-group-head" onClick={() => setGroup(g.key, !openState)}>
                <span className="todo-group-caret">{openState ? '▾' : '▸'}</span>
                <span className="todo-group-title">{title}</span>
                <span className="todo-group-dates">{sub}</span>
                <span className={`todo-group-count${openN === 0 ? ' is-done' : ''}`}>{openN} open</span>
                {past && <span className="todo-group-past">ended</span>}
              </button>
              {openState && (
                <div className="todo-list">
                  {list.length === 0 && <div className="todo-empty">Nothing here — try another filter.</div>}
                  {list.map((t) => renderItem(t, false))}
                </div>
              )}
            </div>
          );
        })
        )}
      </div>
    );
  }

  window.TodoView = TodoView;
})();
