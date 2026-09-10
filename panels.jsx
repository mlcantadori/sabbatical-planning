// Chapter list (left rail / mobile list), detail panel (right slideover /
// mobile full-screen) and binder overlay. Read-only: no editing UI.

(function () {
  const { totalDays, REGIONS, helpers, budget } = window.TRIP;
  const { fmt, dayRange, dayCounter } = helpers;

  // ══════════════════════════════════════════════════════════════════════
  // CHAPTER LIST — left rail (desktop) or main list view (mobile).
  // ══════════════════════════════════════════════════════════════════════
  function ChapterList({ selectedId, onSelect }) {
    const store = window.useStore();
    const chapters = store.getChapters();

    return (
      <div className="chapter-list">
        <div className="chapter-list-head">
          <div className="chapter-list-head-row">
            <div>
              <div className="kicker">The Arc</div>
              <div className="chapter-list-meta">{chapters.length} entries · {store.getTotalDays()} days</div>
            </div>
          </div>
        </div>
        <div className="chapter-list-body">
          {chapters.map((c) => (
            <ChapterRow
              key={c.id}
              ch={c}
              isActive={c.id === selectedId}
              onSelect={() => onSelect(c.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  function ChapterRow({ ch, isActive, onSelect }) {
    const region = REGIONS[ch.region] || { accent: '#c2693a', name: '' };
    return (
      <div
        className={`chapter-row ${isActive ? 'is-active' : ''}`}
        onClick={onSelect}>
        <span className="chapter-row-marker" style={{ background: isActive ? region.accent : 'transparent' }} />
        <span className="chapter-row-num">
          {ch.kind === 'chapter' ? (ch.num || '').toString().padStart(2, '0') : '··'}
        </span>
        <span className="chapter-row-body">
          <span className="chapter-row-title">{ch.title}</span>
          <span className="chapter-row-dates">
            <span className="chapter-row-region-dot" style={{ background: region.accent }} />
            {fmt(ch.start)} – {fmt(ch.end)} · {ch.days}d
          </span>
          {ch.weather && (
            <span className="chapter-row-weather">
              {ch.weather.hi}°/{ch.weather.lo}° · 🌧 {ch.weather.rainyDays ?? 0}d
            </span>
          )}
        </span>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // DETAIL PANEL — full chapter detail. Read-only.
  // ══════════════════════════════════════════════════════════════════════
  function DetailPanel({ chapterId, onClose, onSelectPlace, selectedPlaceIdx }) {
    const store = window.useStore();
    const ch = store.getChapter(chapterId);

    if (!ch) return null;
    const region = REGIONS[ch.region] || { accent: '#c2693a', name: '' };
    const today = dayCounter(ch.start);
    const todayEnd = dayCounter(ch.end);

    return (
      <div className="detail-panel">
        <div className="detail-head">
          <div className="detail-head-meta">
            <span className="detail-pill" style={{ background: region.accent, color: '#fff' }}>
              {ch.kind === 'chapter' ? `Chapter ${(ch.num || '').toString().padStart(2, '0')}` : ch.kind.toUpperCase()}
            </span>
            <span className="kicker">{region.name} · {ch.country} {ch.flag}</span>
          </div>
          <div className="detail-head-actions">
            <button className="icon-btn" onClick={onClose} title="Close">
              <window.Icon.close size={16} />
            </button>
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-hero">
            <window.Photo
              keyword={ch.photos[0]}
              ratio="auto"
              style={{ width: '100%', height: '100%', aspectRatio: 'unset' }}
              caption={`${ch.country.toUpperCase()} · ${fmt(ch.start)}`}
            />
          </div>

          <h1 className="detail-title">{ch.title}</h1>
          {ch.theme && <div className="detail-theme">{ch.theme}.</div>}

          <div className="detail-stats">
            <Stat label="Window" value={`${fmt(ch.start)} – ${fmt(ch.end)}`} sub={`${ch.days} days`} />
            <Stat label="Day of trip" value={`${today.n}–${todayEnd.n}`} sub={`of ${totalDays}`} />
            <Stat label="Weather" value={ch.weather?.label || '—'} sub={ch.weather?.emoji} />
            <Stat label="Temp" value={ch.weather ? `${ch.weather.hi}° / ${ch.weather.lo}°` : '—'} sub="high / low" />
            <Stat label="Rain" value={ch.weather ? `${ch.weather.rainyDays ?? 0} days` : '—'} sub="rainy days" />
          </div>

          {ch.intro && <div className="detail-intro">{ch.intro}</div>}

          {ch.photos.length > 1 && (
                <div className="photo-strip">
                  {ch.photos.slice(1, 4).map((k, i) => (
                    <window.Photo key={i} keyword={k} ratio="3/4" />
                  ))}
                </div>
              )}

              <SectionHead num="01" title={`Itinerary · ${ch.places.length} stop${ch.places.length === 1 ? '' : 's'}`} />
              {ch.places.map((p, i) => {
                const offsetDays = ch.places.slice(0, i).reduce((s, x) => s + x.days, 0);
                const startDate = new Date(new Date(ch.start).getTime() + offsetDays * 86400000);
                const endDate = new Date(startDate.getTime() + (p.days - 1) * 86400000);
                return (
                <PlaceRow
                  key={i}
                  chapterId={ch.id}
                  place={p}
                  idx={i}
                  startDate={startDate}
                  endDate={endDate}
                  region={region}
                  isActive={selectedPlaceIdx === i}
                  onSelect={() => onSelectPlace(i)}
                />
                );
              })}

              {ch.booking && ch.booking.length > 0 && (
                <>
                  <SectionHead num="02" title="Book in advance" small />
                  <ul className="alert-list">
                    {ch.booking.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </>
              )}

              {ch.diving && (
                <>
                  <SectionHead num="03" title="Diving" small />
                  <div className="diving-inline">
                    <div><strong>{ch.diving.sites}</strong> sites · {ch.diving.type}</div>
                    <div className="muted">{ch.diving.operators}</div>
                  </div>
                </>
              )}

              {ch.decisions && ch.decisions.length > 0 && (
                <>
                  <SectionHead num="04" title="Route decisions" small />
                  <ul className="alert-list">
                    {ch.decisions.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </>
              )}
        </div>
      </div>
    );
  }

  function Stat({ label, value, sub }) {
    return (
      <div className="stat">
        <div className="kicker">{label}</div>
        <div className="stat-value">{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    );
  }
  function SectionHead({ num, title, small }) {
    return (
      <div className={`section-head ${small ? 'is-small' : ''}`}>
        <span className="section-head-num">§{num}</span>
        <span className="section-head-title">{title}</span>
      </div>
    );
  }

  function PlaceRow({ chapterId, place, idx, startDate, endDate, region, isActive, onSelect }) {
    const coords = place.coords;
    const sameDay = startDate.getTime() === endDate.getTime();
    const sameMonth = !sameDay
      && startDate.getUTCMonth() === endDate.getUTCMonth()
      && startDate.getUTCFullYear() === endDate.getUTCFullYear();
    return (
      <div
        className={`place-row ${isActive ? 'is-active' : ''}`}
        onClick={onSelect}>
        <span className="place-row-day">
          <span className="place-row-day-num">
            {fmt(startDate)}
            {!sameDay && (
              <span className="place-row-day-dash">–{sameMonth ? endDate.getUTCDate() : fmt(endDate)}</span>
            )}
          </span>
          <span className="place-row-day-label">{place.days}d</span>
        </span>
        <span className="place-row-body">
          <span className="place-row-title">
            <span className="place-row-idx">{(idx + 1).toString().padStart(2, '0')}</span>
            <span>{place.name}</span>
          </span>
          <ul className="place-row-list">
            {place.highlights.map((h, j) => (
              <li key={j} style={{ '--bullet': region.accent }}>
                {h}
              </li>
            ))}
          </ul>
        </span>
        <div className="place-row-actions">
          {coords && (
            <button
              className="place-row-map"
              onClick={(e) => { e.stopPropagation(); window.openMaps(place.query); }}
              title="Open in Google Maps">
              <window.Icon.external size={11} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // BINDER (Budget)
  // ══════════════════════════════════════════════════════════════════════
  function Binder({ onClose }) {
    return (
      <div className="binder">
        <div className="binder-head">
          <div className="binder-tabs">
            <span className="kicker">Budget</span>
          </div>
          <button className="icon-btn" onClick={onClose} title="Close binder">
            <window.Icon.close size={16} />
          </button>
        </div>
        <div className="binder-body">
          <BudgetView />
        </div>
      </div>
    );
  }

  function BudgetView() {
    const store = useStore();
    const fmt$ = (n) => 'USD ' + Math.round(n).toLocaleString('en-US');
    const CATS = [
      ['lodging', 'Lodging'],
      ['food', 'Food'],
      ['transport', 'Local transport'],
      ['activities', 'Activities & diving'],
      ['fees', 'Visas & park fees'],
    ];
    const titleById = Object.fromEntries(store.getChapters().map((c) => [c.id, c.title]));
    const rowTotal = (r) => CATS.reduce((s, [k]) => s + (r[k] || 0), 0);
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
    const COLS = [
      ['idx', '#'],
      ['title', 'Chapter'],
      ['days', 'd'],
      ['perDay', '$/d'],
      ['lodging', 'Lodg.'],
      ['food', 'Food'],
      ['transport', 'Trans.'],
      ['activities', 'Activ.'],
      ['fees', 'Fees'],
      ['total', 'Total'],
    ];
    const [sortKey, setSortKey] = React.useState('idx');
    const [sortDir, setSortDir] = React.useState(1);
    const rows = budget.chapters.map((r, i) => ({
      ...r, idx: i + 1, title: titleById[r.id] || r.id,
      total: rowTotal(r), perDay: rowTotal(r) / r.days,
    }));
    const sorted = [...rows].sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
      return cmp * sortDir;
    });
    const toggleSort = (k) => {
      if (k === sortKey) setSortDir((d) => -d);
      else { setSortKey(k); setSortDir(1); }
    };
    const pct = (n) => Math.round(n / grand * 100) + '%';
    return (
      <div className="binder-pane">
        <div className="binder-pane-head">
          <div>
            <div className="kicker">§ Money</div>
            <h2 className="binder-pane-title">Budget</h2>
            <p className="binder-pane-sub">{budget.basis}. Totals compute from the lines below — nothing hardcoded.</p>
          </div>
        </div>
        <div className="budget-hero">
          <div className="budget-hero-big">{fmt$(grand)} for two</div>
          <div className="budget-hero-sub">{fmt$(perDay)}/day · {totalDays} days · {budget.inBRL}</div>
          <div className="budget-hero-sub">≈ ${perPersonMonth.toLocaleString('en-US')} / R${perPersonMonthBRL.toLocaleString('en-US')} per person/month</div>
        </div>

        <SectionHead num="01" title="Where it goes" small />
        <div className="budget-grid">
          {CATS.map(([k, label]) => (
            <BudgetCard key={k} title={label} items={[fmt$(catTotals[k]), pct(catTotals[k]) + ' of trip']} tone="neutral" />
          ))}
          <BudgetCard title="Inter-chapter flights" items={[fmt$(flightsTotal), pct(flightsTotal) + ' of trip']} tone="warn" />
          <BudgetCard title="Insurance & extras" items={[fmt$(extrasTotal), pct(extrasTotal) + ' of trip']} tone="cool" />
          <BudgetCard title={`Contingency ${budget.contingencyPct}%`} items={[fmt$(contingency), 'peak fares, FX, surprises']} tone="neutral" bordered />
        </div>

        <SectionHead num="02" title="Per chapter" small />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: 'left', opacity: 0.65 }}>
                {COLS.map(([k, label]) => (
                  <th key={k} onClick={() => toggleSort(k)}
                    style={{ padding: '6px 8px 6px 0', cursor: 'pointer', whiteSpace: 'nowrap', textAlign: k === 'total' ? 'right' : 'left' }}>
                    {label}{sortKey === k ? (sortDir === 1 ? ' ▲' : ' ▼') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid rgba(0,0,0,.08)' }} title={r.note}>
                  <td style={{ opacity: 0.55 }}>{r.idx}</td>
                  <td style={{ padding: '6px 8px 6px 0', whiteSpace: 'nowrap' }}>{r.title}</td>
                  <td>{r.days}</td>
                  <td>{fmt$(r.perDay).replace('USD ', '$')}</td>
                  <td>{fmt$(r.lodging).replace('USD ', '$')}</td>
                  <td>{fmt$(r.food).replace('USD ', '$')}</td>
                  <td>{fmt$(r.transport).replace('USD ', '$')}</td>
                  <td>{fmt$(r.activities).replace('USD ', '$')}</td>
                  <td>{fmt$(r.fees).replace('USD ', '$')}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt$(r.total)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid rgba(0,0,0,.2)', fontWeight: 700 }}>
                <td style={{ padding: '6px 8px 6px 0' }}>Chapters</td>
                <td>{budget.chapters.reduce((s, r) => s + r.days, 0)}</td>
                <td></td>
                <td style={{ textAlign: 'right' }}>{fmt$(chTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="binder-pane-sub">Click a column header to sort ▲▼ · hover a row for its note. $/d is per couple.</p>

        <SectionHead num="03" title="From chapters to grand total" small />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <tbody>
              {[
                ['Chapters subtotal (23 chapters)', chTotal, chTotal],
                ['+ Inter-chapter flights (14 legs)', flightsTotal, chTotal + flightsTotal],
                ['+ Insurance & extras', extrasTotal, subtotal],
              ].map(([label, amount, running], i) => (
                <tr key={i} style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,.08)' }}>
                  <td style={{ padding: '6px 8px 6px 0' }}>{label}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt$(amount)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap', opacity: 0.55 }}>= {fmt$(running)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid rgba(0,0,0,.08)' }}>
                <td style={{ padding: '6px 8px 6px 0' }}>= Subtotal</td>
                <td></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 700 }}>{fmt$(subtotal)}</td>
              </tr>
              <tr style={{ borderTop: '1px solid rgba(0,0,0,.08)' }}>
                <td style={{ padding: '6px 8px 6px 0' }}>+ Contingency {budget.contingencyPct}%</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt$(contingency)}</td>
                <td></td>
              </tr>
              <tr style={{ borderTop: '2px solid rgba(0,0,0,.2)', fontWeight: 700 }}>
                <td style={{ padding: '6px 8px 6px 0' }}>= Grand total</td>
                <td></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt$(grand)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <SectionHead num="04" title="Locked costs" small />
        <ul className="alert-list">
          {budget.locked.map((l, i) => <li key={i}><strong>{l.item} — {fmt$(l.cost)}.</strong> {l.note}</li>)}
        </ul>

        <SectionHead num="05" title="Key flights (couple)" small />
        <ul className="alert-list">
          {budget.flights.map((f, i) => <li key={i}><strong>{f.route} — {fmt$(f.cost)}.</strong> {f.note}</li>)}
        </ul>

        <SectionHead num="06" title="Assumptions & levers" small />
        <ul className="alert-list">
          {budget.assumptions.map((a, i) => <li key={i}>{a}</li>)}
          {budget.levers.map((l, i) => <li key={'l' + i}>{l}</li>)}
        </ul>
      </div>
    );
  }
  function BudgetCard({ title, items, tone, bordered }) {
    return (
      <div className={`budget-card budget-card-${tone} ${bordered ? 'is-bordered' : ''}`}>
        <div className="kicker">{title}</div>
        <ul>{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
      </div>
    );
  }

  Object.assign(window, { ChapterList, DetailPanel, Binder });
})();
