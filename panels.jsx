// Sections beyond the atlas — the chapter grid, the full chapter spread,
// and the ledger + field kit binder. Read-only.

(function () {
  const { totalDays, REGIONS, helpers, budget } = window.TRIP;
  const { fmt, dayRange, dayCounter, contrastText } = helpers;
  const { placeWindows } = window.TRIP_NOW;

  function SectionHead({ num, title, note }) {
    return (
      <div className="section-head">
        <span className="section-head-num">{num}</span>
        <h2 className="section-head-title">{title}</h2>
        {note && <span className="section-head-note">{note}</span>}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // CHAPTERS — the editorial index of the whole year.
  // ══════════════════════════════════════════════════════════════════════
  function ChapterCard({ ch, isNow, isPast, isSelected, index, onOpen }) {
    const tint = window.chapterTint(ch);
    return (
      <button
        className={`ch-card ${isNow ? 'is-now' : ''} ${isPast ? 'is-past' : ''} ${isSelected ? 'is-selected' : ''}`}
        onClick={() => onOpen(ch.id)}
        style={{ '--tint': tint }}
        aria-label={`Open chapter ${ch.num}: ${ch.title}`}>
        <span className="ch-card-media">
          <window.Photo keyword={ch.photos && ch.photos[0]} alt={ch.title} ratio="4/3" sizes="(max-width: 880px) 90vw, 33vw" />
          <span className="ch-card-shade" />
          <span className="ch-card-num">{String(ch.num || index + 1).padStart(2, '0')}</span>
          <span className="ch-card-days">{ch.days} nights</span>
          {isNow && <span className="ch-card-now"><i /> You are here</span>}
          {isPast && !isNow && <span className="ch-card-past">walked</span>}
        </span>
        <span className="ch-card-body">
          <span className="ch-card-titlerow">
            <span className="ch-card-title">{ch.title}</span>
            <span className="ch-card-flag">{ch.flag}</span>
          </span>
          <span className="ch-card-theme">{ch.theme}</span>
          <span className="ch-card-meta">
            <span>{fmt(ch.start)} – {fmt(ch.end)}</span>
            <i />
            <span>{ch.weather ? `${ch.weather.hi}°/${ch.weather.lo}°` : '—'}</span>
            <i />
            <span>{ch.places.length} stop{ch.places.length === 1 ? '' : 's'}</span>
          </span>
          <span className="ch-card-route">{ch.tldr || (ch.places || []).map((p) => p.name).join(' · ')}</span>
        </span>
      </button>
    );
  }

  function ChaptersView({ current, selectedId, onOpen }) {
    const store = window.useStore();
    const chapters = store.getChapters();
    const stats = window.tripStats();
    const today = window.TRIP_NOW.todayISO();
    return (
      <div className="page chapters-page">
        <div className="page-inner">
          <header className="page-head">
            <div className="page-eyebrow"><span>02</span> The arc</div>
            <h1>Twenty-one chapters,<br /><em>one long way east.</em></h1>
            <p>
              A year is not a list of countries. It is a shape: a long, slow opening at home,
              a winter in the snow, an island spring, and a last bright month in the east.
              Open any chapter to see the days, the stops, and the thinking behind them.
            </p>
            <div className="page-facts">
              <div className="page-fact"><b>{stats.days}</b><span>days</span></div>
              <div className="page-fact"><b>{stats.chapters}</b><span>chapters</span></div>
              <div className="page-fact"><b>{stats.countries}</b><span>countries</span></div>
              <div className="page-fact"><b>{stats.stops}</b><span>stops</span></div>
            </div>
          </header>

          <div className="chapter-grid">
            {chapters.map((c, i) => (
              <ChapterCard
                key={c.id}
                ch={c}
                index={i}
                isNow={!!current && c.id === current.id}
                isPast={!!current && c.end < today}
                isSelected={c.id === selectedId}
                onOpen={onOpen}
              />
            ))}
          </div>

          <footer className="page-foot">
            <span>Jun 21, 2026 — Jun 16, 2027</span>
            <button className="pill-btn" onClick={() => onOpen((current || chapters[0]).id)}>
              Open {current ? 'where you are' : 'chapter one'} <window.Icon.arrow size={12} />
            </button>
          </footer>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // PHOTO CAROUSEL — chapter header + one photo per stop with a photo.
  // ══════════════════════════════════════════════════════════════════════
  function PhotoCarousel({ items }) {
    const [idx, setIdx] = React.useState(0);
    const n = items.length;
    const touchX = React.useRef(null);
    if (!n) return null;
    const go = (d) => setIdx((i) => (i + d + n) % n);
    const cur = items[idx];
    return (
      <div className="detail-hero carousel"
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}>
        <window.Photo key={cur.keyword} keyword={cur.keyword} ratio="auto" loading="eager"
          style={{ width: '100%', height: '100%', aspectRatio: 'unset' }} caption={cur.caption} />
        <div className="detail-hero-shade" />
        {n > 1 && (
          <>
            <button className="carousel-arrow is-left" onClick={() => go(-1)} aria-label="Previous photo">‹</button>
            <button className="carousel-arrow is-right" onClick={() => go(1)} aria-label="Next photo">›</button>
            <div className="carousel-dots">
              {items.map((it, i) => (
                <button key={i} className={`carousel-dot${i === idx ? ' is-active' : ''}`} onClick={() => setIdx(i)} aria-label={`Photo ${i + 1}: ${it.caption}`} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // DETAIL — a full editorial spread for one chapter.
  // ══════════════════════════════════════════════════════════════════════
  function DetailPanel({ chapterId, onClose, onSelectPlace, selectedPlaceIdx, onOpenChapter }) {
    const store = window.useStore();
    const chapters = store.getChapters();
    const ch = store.getChapter(chapterId);
    if (!ch) return null;

    const region = REGIONS[ch.region] || { name: '' };
    const tint = window.chapterTint(ch);
    const startDay = dayCounter(ch.start).n;
    const endDay = dayCounter(ch.end).n;
    const windows = placeWindows(ch);
    const idx = chapters.findIndex((c) => c.id === ch.id);
    const prev = chapters[(idx - 1 + chapters.length) % chapters.length];
    const next = chapters[(idx + 1) % chapters.length];

    return (
      <aside className="detail-panel" role="dialog" aria-label={`Chapter ${ch.num}: ${ch.title}`}>
        <div className="detail-topbar">
          <span className="detail-topbar-label">
            <i style={{ background: tint }} />
            Chapter {ch.kind === 'chapter' && ch.num != null ? String(ch.num).padStart(2, '0') : '··'} <b>/ {String(chapters.length).padStart(2, '0')}</b>
          </span>
          <button className="icon-btn" onClick={onClose} title="Close chapter (Esc)">
            <window.Icon.close size={16} />
          </button>
        </div>

        <div className="detail-scroll">
          <PhotoCarousel
            key={ch.id}
            items={[
              { keyword: ch.photos[0], caption: `${ch.country.toUpperCase()} · ${fmt(ch.start)}` },
              ...ch.places.map((p, i) => (p.photo ? { keyword: p.photo, caption: `${i + 1}. ${p.name}` } : null)).filter(Boolean),
            ]}
          />

          <div className="detail-content">
            <div className="detail-eyebrow">
              <span style={{ color: tint }}>{region.name}</span>
              <i />
              <span>{ch.tldr}</span>
            </div>
            <h1 className="detail-title">{ch.title}</h1>
            {ch.theme && <p className="detail-theme">{ch.theme}.</p>}

            <div className="detail-facts">
              <div className="detail-fact"><span>Window</span><b>{fmt(ch.start)} – {fmt(ch.end)}</b><i>{ch.days} nights</i></div>
              <div className="detail-fact"><span>Day of trip</span><b>{startDay}–{endDay}</b><i>of {totalDays}</i></div>
              <div className="detail-fact"><span>Weather</span><b>{ch.weather ? `${ch.weather.hi}° / ${ch.weather.lo}°` : '—'}</b><i>{ch.weather ? ch.weather.label : ''}</i></div>
              <div className="detail-fact"><span>Rain</span><b>{ch.weather ? `${ch.weather.rainyDays ?? 0} day${(ch.weather.rainyDays ?? 0) === 1 ? '' : 's'}` : '—'}</b><i>{ch.weather ? ch.weather.emoji : ''}</i></div>
            </div>

            {ch.intro && <p className="detail-intro">{ch.intro}</p>}

            <SectionHead num="01" title="The stops" note={`${ch.places.length} stops · ${ch.days} nights`} />
            <div className="stop-timeline" style={{ '--tint': tint }}>
              {ch.places.map((p, i) => {
                const w = windows[i] || {};
                const active = selectedPlaceIdx === i;
                return (
                  <div
                    key={i}
                    className={`stop-row ${active ? 'is-active' : ''}`}
                    onClick={() => onSelectPlace(i)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectPlace(i); } }}>
                    <div className="stop-date">
                      <span className="stop-date-day">{fmt(w.start)}</span>
                      <span className="stop-date-end">{w.end && w.end !== w.start ? `→ ${fmt(w.end)}` : ''}</span>
                      <span className="stop-date-nights">{p.days} night{p.days === 1 ? '' : 's'}</span>
                    </div>
                    <div className="stop-node"><i /></div>
                    <div className="stop-body">
                      <div className="stop-titlerow">
                        <span className="stop-idx">{String(i + 1).padStart(2, '0')}</span>
                        <span className="stop-name">{p.name}</span>
                        {p.coords && (
                          <button
                            className="stop-map"
                            onClick={(e) => { e.stopPropagation(); window.openMaps(p.query); }}
                            title="Open in Google Maps">
                            <window.Icon.external size={10} />
                          </button>
                        )}
                      </div>
                      <div className="stop-highlights">
                        {(p.highlights || []).map((h, j) => (
                          <span key={j} className="stop-highlight">{h}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {ch.decisions && ch.decisions.length > 0 && (
              <>
                <SectionHead num="02" title="Why it looks like this" note="route decisions" />
                <ol className="decision-list">
                  {ch.decisions.map((d, i) => <li key={i}>{d}</li>)}
                </ol>
              </>
            )}

            <div className="detail-nav">
              <button onClick={() => onOpenChapter(prev.id)}>
                <window.Icon.arrowLeft size={13} />
                <span><i>Previous</i>{prev.title}</span>
              </button>
              <button className="is-next" onClick={() => onOpenChapter(next.id)}>
                <span><i>Next</i>{next.title}</span>
                <window.Icon.arrow size={13} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // BINDER — Ledger and Field Kit pages.
  // ══════════════════════════════════════════════════════════════════════
  function Binder({ view, onClose, onOpenChapter }) {
    const isTodo = view === 'kit';
    return (
      <div className="page binder-page">
        <div className="binder-bar">
          <button className="binder-back" onClick={onClose}><window.Icon.arrowLeft size={13} /> Atlas</button>
          <span className="binder-crumb">The Long Way East <i>/</i> {isTodo ? 'Field kit' : 'Ledger'}</span>
          <span className="binder-date">{fmt(window.TRIP_NOW.todayISO())}</span>
        </div>
        <div className="binder-scroll">
          {isTodo ? <window.TodoView /> : <BudgetView onOpenChapter={onOpenChapter} />}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // BUDGET — the ledger.
  // ══════════════════════════════════════════════════════════════════════
  function BudgetView({ onOpenChapter }) {
    const store = window.useStore();
    const fmt$ = (n) => '$' + Math.round(n).toLocaleString('en-US');
    const CATS = [
      ['lodging', 'Lodging', '#ff9a4c'],
      ['food', 'Food', '#efc55e'],
      ['transport', 'Local transport', '#84ca96'],
      ['activities', 'Activities & diving', '#5bb0c1'],
      ['fees', 'Visas & park fees', '#8b77b8'],
    ];
    const chapters = store.getChapters();
    const byId = Object.fromEntries(chapters.map((c) => [c.id, c]));
    const rowTotal = (r) => CATS.reduce((s, [k]) => s + (r[k] || 0), 0);
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

    const slices = [
      ...CATS.map(([k, label, color]) => ({ label, value: catTotals[k], color })),
      { label: 'Inter-chapter flights', value: flightsTotal, color: '#c98a2a' },
      { label: 'Insurance & extras', value: extrasTotal, color: '#7f9dd8' },
      { label: `Contingency ${budget.contingencyPct}%`, value: contingency, color: 'rgba(244,236,220,.28)' },
    ];
    let acc = 0;
    const gradient = slices.map((s) => {
      const from = (acc / grand) * 100;
      acc += s.value;
      const to = (acc / grand) * 100;
      return `${s.color} ${from}% ${to}%`;
    }).join(', ');

    const rows = budget.chapters.map((r, i) => ({
      ...r, idx: i + 1, title: (byId[r.id] && byId[r.id].title) || r.id,
      total: rowTotal(r), perDay: rowTotal(r) / r.days,
      tint: byId[r.id] ? window.chapterTint(byId[r.id]) : '#ff7a45',
    }));
    const maxRow = Math.max(...rows.map((r) => r.total));
    const [sortKey, setSortKey] = React.useState('idx');
    const [sortDir, setSortDir] = React.useState(1);
    const sorted = [...rows].sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
      return cmp * sortDir;
    });
    const toggleSort = (k) => {
      if (k === sortKey) setSortDir((d) => -d);
      else { setSortKey(k); setSortDir(1); }
    };
    const COLS = [
      ['idx', '#'], ['title', 'Chapter'], ['days', 'Nights'], ['perDay', '$/night'],
      ['lodging', 'Lodging'], ['food', 'Food'], ['transport', 'Transport'],
      ['activities', 'Activities'], ['fees', 'Fees'], ['total', 'Total'],
    ];

    return (
      <div className="page-inner ledger-page">
        <header className="page-head">
          <div className="page-eyebrow"><span>03</span> The ledger</div>
          <h1>What a year costs.<br /><em>And what it buys.</em></h1>
          <p>Mid-range with strategic splurges, priced for two across 360 days. Totals compute from the lines below — nothing is hardcoded, so the numbers cannot quietly lie.</p>
        </header>

        <div className="money-hero">
          <div className="money-total">
            <span className="money-label">Grand total · two travellers</span>
            <span className="money-big">{fmt$(grand)}</span>
            <span className="money-sub">
              <span className="money-stat"><b>{fmt$(perDay)}</b><em>per day for two</em></span>
              <span className="money-stat"><b>{fmt$(perPersonMonth)}</b><em>per person / month</em></span>
              <span className="money-stat"><b>R${perPersonMonthBRL.toLocaleString('en-US')}</b><em>per person / month</em></span>
            </span>
            <span className="money-note">{totalDays} days · {budget.inBRL}</span>
          </div>
          <div className="donut-wrap">
            <div className="donut" style={{ background: `conic-gradient(${gradient})` }}>
              <div className="donut-hole">
                <span>{budget.contingencyPct}%</span>
                <i>contingency</i>
              </div>
            </div>
            <ul className="donut-key">
              {slices.map((s) => (
                <li key={s.label}>
                  <i style={{ background: s.color }} />
                  <span>{s.label}</span>
                  <b>{fmt$(s.value)}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <SectionHead num="01" title="Where the nights go" note="total spend per chapter" />
        <div className="bar-list">
          {rows.map((r) => (
            <button key={r.id} className="bar-row" onClick={() => onOpenChapter && onOpenChapter(r.id)} title={r.note}>
              <span className="bar-ch"><i style={{ background: r.tint }} />{String(r.idx).padStart(2, '0')} {r.title}</span>
              <span className="bar-track"><span style={{ width: `${Math.max(2, (r.total / maxRow) * 100)}%`, background: r.tint }} /></span>
              <span className="bar-val">{fmt$(r.total)}</span>
              <span className="bar-per">{fmt$(r.perDay)}<i>/night</i></span>
            </button>
          ))}
        </div>

        <SectionHead num="02" title="The long table" note="click a column to sort" />
        <div className="ledger-table-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                {COLS.map(([k, label]) => (
                  <th key={k} className={k === 'total' ? 'is-num' : ''}>
                    <button onClick={() => toggleSort(k)}>
                      {label}{sortKey === k ? (sortDir === 1 ? ' ▲' : ' ▼') : ''}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} title={r.note}>
                  <td className="is-muted">{r.idx}</td>
                  <td className="is-name">{r.title}</td>
                  <td>{r.days}</td>
                  <td>{fmt$(r.perDay)}</td>
                  <td>{fmt$(r.lodging)}</td>
                  <td>{fmt$(r.food)}</td>
                  <td>{fmt$(r.transport)}</td>
                  <td>{fmt$(r.activities)}</td>
                  <td>{fmt$(r.fees)}</td>
                  <td className="is-num is-total">{fmt$(r.total)}</td>
                </tr>
              ))}
              <tr className="is-sum">
                <td />
                <td className="is-name">Chapters</td>
                <td>{budget.chapters.reduce((s, r) => s + r.days, 0)}</td>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td className="is-num is-total">{fmt$(chTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="ledger-below">
          <div className="receipt">
            <div className="receipt-head"><span>The whole bill</span><span>USD · two</span></div>
            {[
              [`Chapters (${budget.chapters.length})`, chTotal],
              [`Inter-chapter flights (${budget.flights.length} legs)`, flightsTotal],
              ['Insurance & extras', extrasTotal],
            ].map(([label, value]) => (
              <div key={label} className="receipt-row"><span>{label}</span><b>{fmt$(value)}</b></div>
            ))}
            <div className="receipt-row is-sub"><span>Subtotal</span><b>{fmt$(subtotal)}</b></div>
            <div className="receipt-row"><span>Contingency {budget.contingencyPct}%</span><b>{fmt$(contingency)}</b></div>
            <div className="receipt-row is-grand"><span>Grand total</span><b>{fmt$(grand)}</b></div>
            <div className="receipt-foot">≈ R${Math.round(grand * budget.fxBRL).toLocaleString('en-US')} at today's rate</div>
          </div>

          <div className="ledger-notes">
            <div className="ledger-note">
              <h3>Locked &amp; paid</h3>
              <ul>
                {budget.locked.map((l, i) => <li key={i}><b>{l.item} — {fmt$(l.cost)}.</b> {l.note}</li>)}
              </ul>
            </div>
            <div className="ledger-note">
              <h3>Key flights</h3>
              <ul>
                {budget.flights.map((f, i) => <li key={i}><b>{f.route} — {fmt$(f.cost)}.</b> {f.note}</li>)}
              </ul>
            </div>
            <div className="ledger-note">
              <h3>Assumptions &amp; levers</h3>
              <ul>
                {budget.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                {budget.levers.map((l, i) => <li key={'l' + i}>{l}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  Object.assign(window, { ChaptersView, DetailPanel, Binder });
})();
