// Field kit — advance bookings grouped by chapter. Chapters that are past
// (ended before today) or fully completed start collapsed. Done states seed
// from todo-data.js and persist per-browser; Export copies the current states
// back into file format.

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
    const allDone = (g) => g.items.length > 0 && g.items.every((t) => t.done);
    const autoOpen = (g) => g.ch ? (!isPast(g.ch) && !allDone(g)) : !allDone(g);
    const isOpen = (g) => explicitOpen[g.key] !== undefined ? explicitOpen[g.key] : autoOpen(g);
    const setGroup = (key, v) => setExplicitOpen((p) => ({ ...p, [key]: v }));
    const expandAll = () => setExplicitOpen(Object.fromEntries(groups.map((g) => [g.key, true])));
    const collapseAll = () => setExplicitOpen(Object.fromEntries(groups.map((g) => [g.key, false])));

    const open = items.filter((t) => !t.done);
    const doneN = items.length - open.length;
    const donePct = items.length ? Math.round((doneN / items.length) * 100) : 0;
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
        <div key={t.id} className={`kit-row${t.done ? ' is-done' : ''}`}>
          <button className={`booking-check${t.done ? ' is-done' : ''}`} onClick={() => toggle(t.id)} title={t.done ? 'Mark open' : 'Mark done'}>
            {t.done ? '✓' : ''}
          </button>
          <div className="kit-row-body">
            <div className="kit-row-title">{t.title}</div>
            <div className="kit-row-meta">
              <span className="kit-cat">{CAT_LABEL[t.cat] || t.cat}</span>
              {showGroup && <span className="kit-row-group">{groupTag(t)}</span>}
              {t.place && <span className="kit-row-place">{t.place}</span>}
              {t.note && <span className="kit-row-note">{t.note}</span>}
            </div>
          </div>
          <div className={`kit-due${od ? ' is-overdue' : soon ? ' is-soon' : ''}`} title={`Book by ${t.due}`}>
            {t.done ? (t.due ? fmt(t.due) : '—') : `${relDue(t.due, today)} · ${fmt(t.due)}`}
          </div>
        </div>
      );
    };

    return (
      <div className="page-inner kit-page">
        <header className="page-head">
          <h1>The things that<br /><em>must be booked.</em></h1>
          <p>Advance bookings only — transport, stays, cars, scarce attractions, visas. Day-to-day stuff stays out. Ticks live in this browser until you export them back to the file.</p>
        </header>

        <div className="kit-hero">
          <div className="kit-ring" style={{ '--p': `${(donePct / 100) * 360}deg` }}>
            <div className="kit-ring-hole"><b>{donePct}<i>%</i></b><span>ready</span></div>
          </div>
          <div className="kit-stats">
            <div><b>{open.length}</b><span>still open</span></div>
            <div className={overdue.length ? 'is-alert' : ''}><b>{overdue.length}</b><span>overdue</span></div>
            <div><b>{dueSoon.length}</b><span>due in 14 days</span></div>
            <div><b>{items.length}</b><span>total items</span></div>
          </div>
          <div className="kit-actions">
            <button className="pill-btn" onClick={() => setShowExport((v) => !v)}>Export status</button>
            <button className="pill-btn" onClick={resetOverrides} title="Forget browser ticks, go back to file defaults">Reset to file</button>
          </div>
        </div>

        {showExport && (
          <div className="todo-export">
            <div className="kicker">Copy into todo-data.js, then commit — that file is the durable record</div>
            <textarea readOnly value={exportText} rows={Math.min(12, items.length + 2)} onFocus={(e) => e.target.select()} />
            <div><button className="pill-btn" onClick={copyExport}>Copy</button></div>
          </div>
        )}

        <div className="kit-filters">
          <div className="seg">
            <button className={groupBy === 'chapter' ? 'is-active' : ''} onClick={() => setGroupBy('chapter')}>By chapter</button>
            <button className={groupBy === 'due' ? 'is-active' : ''} onClick={() => setGroupBy('due')}>Due soon{dueSoon.length ? ` (${dueSoon.length})` : ''}</button>
          </div>
          <div className="kit-cats">
            <button className={catFilter === 'all' ? 'is-active' : ''} onClick={() => setCatFilter('all')}>All</button>
            {CATS.map(([k, label]) => (
              <button key={k} className={catFilter === k ? 'is-active' : ''} onClick={() => setCatFilter(k)}>{label}</button>
            ))}
          </div>
          <div className="kit-filter-row">
            <label className="todo-check-label"><input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} /> Hide done</label>
            {groupBy === 'chapter' && (
              <span className="todo-expand-links"><button className="pill-btn" onClick={expandAll}>Expand all</button> <button className="pill-btn" onClick={collapseAll}>Collapse all</button></span>
            )}
          </div>
        </div>

        {groupBy === 'due' ? (
          <div className="kit-list">
            {dueSoon.length === 0 && <div className="kit-empty">Nothing overdue or due in the next 14 days.</div>}
            {dueSoon.map((t) => renderItem(t, true))}
          </div>
        ) : (
          groups.map((g) => {
            const list = visibleItems(g.items);
            const gDone = g.items.filter((t) => t.done).length;
            const openN = g.items.length - gDone;
            const past = isPast(g.ch);
            const openState = isOpen(g);
            const tint = g.ch ? window.chapterTint(g.ch) : '#ff7a45';
            const title = g.key === 'prep' ? 'Before you leave' : g.key === 'other' ? 'Unsorted' : `${g.ch.num != null ? String(g.ch.num).padStart(2, '0') + ' · ' : ''}${g.ch.flag || ''} ${g.ch.title}`;
            const sub = g.ch ? dayRange(g.ch.start, g.ch.end) : (g.key === 'prep' ? 'Visas, insurance, paperwork' : '');
            return (
              <div key={g.key} className="kit-group" style={{ '--tint': tint }}>
                <button className="kit-group-head" onClick={() => setGroup(g.key, !openState)}>
                  <span className="kit-caret">{openState ? '−' : '+'}</span>
                  {/* One fixed-width label cell: the bar has to start at the
                      same x on every row, so nothing before it may size to
                      its own content. */}
                  <span className="kit-group-label">
                    <span className="kit-group-title">{title}</span>
                    <span className="kit-group-dates">{sub}</span>
                    {past && <span className="kit-group-past">ended</span>}
                  </span>
                  <span className="kit-group-bar"><i style={{ width: `${g.items.length ? (gDone / g.items.length) * 100 : 0}%` }} /></span>
                  <span className="kit-group-pct">{g.items.length ? Math.round((gDone / g.items.length) * 100) : 0}%</span>
                  <span className={`kit-group-count${openN === 0 ? ' is-done' : ''}`}>{openN === 0 ? 'done' : `${openN} open`}</span>
                </button>
                {openState && (
                  <div className="kit-list">
                    {list.length === 0 && <div className="kit-empty">Nothing here — try another filter.</div>}
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
