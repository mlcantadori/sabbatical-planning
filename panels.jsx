// Chapter list (left rail / mobile list), detail panel (right slideover /
// mobile full-screen), binder overlay, and inline editing UI.

(function () {
  const { totalDays, REGIONS, helpers, bookings, diving, budget, packing } = window.TRIP;
  const { fmt, dayRange, dayCounter } = helpers;

  // ══════════════════════════════════════════════════════════════════════
  // CHAPTER LIST — left rail (desktop) or main list view (mobile).
  // ══════════════════════════════════════════════════════════════════════
  function ChapterList({ selectedId, onSelect, editing, onToggleEdit }) {
    const store = window.useStore();
    const chapters = store.getChapters();
    const [editChapter, setEditChapter] = React.useState(null);

    return (
      <>
        <div className="chapter-list">
          <div className="chapter-list-head">
            <div className="chapter-list-head-row">
              <div>
                <div className="kicker">The Arc</div>
                <div className="chapter-list-meta">{chapters.length} entries · {store.getTotalDays()} days</div>
              </div>
              <button
                className={`pill-btn ${editing ? 'is-active' : ''}`}
                onClick={onToggleEdit}
                title="Toggle edit mode">
                {editing ? 'Done' : 'Edit'}
              </button>
            </div>
          </div>
          <div className="chapter-list-body">
            {chapters.map((c) => (
              <ChapterRow
                key={c.id}
                ch={c}
                isActive={c.id === selectedId}
                editing={editing}
                onSelect={() => onSelect(c.id)}
                onRename={(t) => store.updateChapter(c.id, { title: t })}
                onEdit={() => setEditChapter(c.id)}
                onAddBelow={() => {
                  const newId = store.addChapter(c.id);
                  setEditChapter(newId);
                }}
                onDelete={() => {
                  if (confirm(`Delete "${c.title}"?`)) {
                    store.removeChapter(c.id);
                    if (selectedId === c.id) onSelect(null);
                  }
                }}
              />
            ))}
            {editing && (
              <button
                className="add-row"
                onClick={() => {
                  const lastId = chapters.at(-1)?.id;
                  const newId = store.addChapter(lastId);
                  setEditChapter(newId);
                }}>
                <window.Icon.plus size={12} /> Add chapter
              </button>
            )}
          </div>
        </div>

        {editChapter && (
          <ChapterEditModal
            chapterId={editChapter}
            onClose={() => setEditChapter(null)}
          />
        )}
      </>
    );
  }

  function ChapterRow({ ch, isActive, editing, onSelect, onRename, onEdit, onAddBelow, onDelete }) {
    const region = REGIONS[ch.region] || { accent: '#c2693a', name: '' };
    return (
      <div
        className={`chapter-row ${isActive ? 'is-active' : ''} ${editing ? 'is-editing' : ''}`}
        onClick={onSelect}>
        <span className="chapter-row-marker" style={{ background: isActive ? region.accent : 'transparent' }} />
        <span className="chapter-row-num">
          {ch.kind === 'chapter' ? (ch.num || '').toString().padStart(2, '0') : '··'}
        </span>
        <span className="chapter-row-body">
          {editing ? (
            <window.Editable
              className="chapter-row-title"
              value={ch.title}
              onCommit={onRename}
              placeholder="Chapter title"
            />
          ) : (
            <span className="chapter-row-title">{ch.title}</span>
          )}
          <span className="chapter-row-dates">
            <span className="chapter-row-region-dot" style={{ background: region.accent }} />
            {fmt(ch.start)} – {fmt(ch.end)} · {ch.days}d
          </span>
        </span>
        {editing && (
          <window.ActionMenu
            className="chapter-row-menu"
            items={[
              { label: 'Edit details…', onClick: onEdit },
              { label: 'Add chapter below', onClick: onAddBelow },
              { label: 'Delete', onClick: onDelete, danger: true },
            ]} />
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // DETAIL PANEL — chapter detail with editable places + attractions.
  // ══════════════════════════════════════════════════════════════════════
  function DetailPanel({ chapterId, onClose, onSelectPlace, selectedPlaceIdx, editing }) {
    const store = window.useStore();
    const ch = store.getChapter(chapterId);
    const [view, setView] = React.useState('full'); // overview | full
    const [note, setNote] = React.useState('');
    const [editChapter, setEditChapter] = React.useState(false);
    const [editPlace, setEditPlace] = React.useState(null); // { placeIdx }

    React.useEffect(() => {
      if (!chapterId) return;
      try { setNote(localStorage.getItem('note:' + chapterId) || ''); } catch {}
    }, [chapterId]);
    React.useEffect(() => {
      if (!chapterId) return;
      const t = setTimeout(() => {
        try { localStorage.setItem('note:' + chapterId, note); } catch {}
      }, 400);
      return () => clearTimeout(t);
    }, [note, chapterId]);

    if (!ch) return null;
    const region = REGIONS[ch.region] || { accent: '#c2693a', name: '' };
    const today = dayCounter(ch.start);
    const todayEnd = dayCounter(ch.end);
    const isFull = view === 'full';

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
            {editing && (
              <button className="icon-btn" onClick={() => setEditChapter(true)} title="Edit chapter">
                <window.Icon.edit size={14} />
              </button>
            )}
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

          {editing ? (
            <window.Editable
              as="h1"
              className="detail-title"
              value={ch.title}
              onCommit={(t) => store.updateChapter(ch.id, { title: t })}
              placeholder="Chapter title"
            />
          ) : (
            <h1 className="detail-title">{ch.title}</h1>
          )}
          {editing ? (
            <window.Editable
              as="div"
              className="detail-theme"
              value={ch.theme}
              onCommit={(t) => store.updateChapter(ch.id, { theme: t })}
              placeholder="A short theme for this chapter"
            />
          ) : (
            ch.theme && <div className="detail-theme">{ch.theme}.</div>
          )}

          <div className="detail-stats">
            <Stat label="Window" value={`${fmt(ch.start)} – ${fmt(ch.end)}`} sub={`${ch.days} days`} />
            <Stat label="Day of trip" value={`${today.n}–${todayEnd.n}`} sub={`of ${totalDays}`} />
            <Stat label="Weather" value={ch.weather?.label || '—'} sub={ch.weather?.emoji} />
          </div>

          <div className="seg">
            {[['overview', 'Condensed'], ['full', 'Full detail']].map(([k, l]) => (
              <button key={k} className={view === k ? 'is-active' : ''} onClick={() => setView(k)}>{l}</button>
            ))}
          </div>

          {!isFull && (
            <>
              <div className="detail-summary-card">
                <div className="kicker">The shape of it</div>
                <div className="detail-summary-text">{ch.tldr || ch.places.map((p) => p.name).join(' · ')}</div>
              </div>
              {ch.intro && <div className="detail-intro">{ch.intro}</div>}
            </>
          )}

          {isFull && (
            <>
              {ch.intro && (
                editing ? (
                  <window.Editable
                    as="div"
                    className="detail-intro"
                    value={ch.intro}
                    onCommit={(t) => store.updateChapter(ch.id, { intro: t })}
                    placeholder="A few sentences setting the scene"
                  />
                ) : (
                  <div className="detail-intro">{ch.intro}</div>
                )
              )}
              {editing && !ch.intro && (
                <window.Editable
                  as="div"
                  className="detail-intro is-empty"
                  value=""
                  onCommit={(t) => store.updateChapter(ch.id, { intro: t })}
                  placeholder="Add a few sentences setting the scene…"
                />
              )}

              {ch.photos.length > 1 && (
                <div className="photo-strip">
                  {ch.photos.slice(1, 4).map((k, i) => (
                    <window.Photo key={i} keyword={k} ratio="3/4" />
                  ))}
                </div>
              )}

              <SectionHead num="01" title={`Itinerary · ${ch.places.length} stop${ch.places.length === 1 ? '' : 's'}`} />
              {ch.places.map((p, i) => (
                <PlaceRow
                  key={i}
                  chapterId={ch.id}
                  place={p}
                  idx={i}
                  offsetDays={ch.places.slice(0, i).reduce((s, x) => s + x.days, 0)}
                  region={region}
                  isActive={selectedPlaceIdx === i}
                  editing={editing}
                  onSelect={() => onSelectPlace(i)}
                  onEdit={() => setEditPlace(i)}
                  onAddBelow={async () => {
                    const name = prompt('Name of new stop?');
                    if (!name) return;
                    let coords = null;
                    try { coords = await window.geocode(name + ' ' + ch.country); } catch {}
                    store.addPlace(ch.id, i, { name, query: name, coords: coords || ch.anchor });
                  }}
                  onDelete={() => {
                    if (confirm(`Delete "${p.name}"?`)) store.removePlace(ch.id, i);
                  }}
                />
              ))}
              {editing && (
                <button
                  className="add-row place-add-row"
                  onClick={async () => {
                    const name = prompt('Name of new stop?');
                    if (!name) return;
                    let coords = null;
                    try { coords = await window.geocode(name + ' ' + ch.country); } catch {}
                    store.addPlace(ch.id, null, { name, query: name, coords: coords || ch.anchor });
                  }}>
                  <window.Icon.plus size={12} /> Add stop
                </button>
              )}

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

              <SectionHead num="04" title="Notes & journal" small />
              <textarea
                className="journal-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={`Notes for ${ch.title.toLowerCase()} — what to remember, who to message…`}
              />
            </>
          )}
        </div>

        {editChapter && (
          <ChapterEditModal chapterId={ch.id} onClose={() => setEditChapter(false)} />
        )}
        {editPlace !== null && (
          <PlaceEditModal
            chapterId={ch.id}
            placeIdx={editPlace}
            onClose={() => setEditPlace(null)}
          />
        )}
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

  function PlaceRow({ chapterId, place, idx, offsetDays, region, isActive, editing, onSelect, onEdit, onAddBelow, onDelete }) {
    const store = window.useStore();
    const coords = place.coords;
    return (
      <div
        className={`place-row ${isActive ? 'is-active' : ''} ${editing ? 'is-editing' : ''}`}
        onClick={onSelect}>
        <span className="place-row-day">
          <span className="place-row-day-num">
            {offsetDays + 1}<span className="place-row-day-dash">–{offsetDays + place.days}</span>
          </span>
          <span className="place-row-day-label">{place.days}d</span>
        </span>
        <span className="place-row-body">
          <span className="place-row-title">
            <span className="place-row-idx">{(idx + 1).toString().padStart(2, '0')}</span>
            {editing ? (
              <window.Editable
                value={place.name}
                onCommit={(v) => store.updatePlace(chapterId, idx, { name: v, query: v })}
                placeholder="Place name"
              />
            ) : (
              <span>{place.name}</span>
            )}
          </span>
          <ul className="place-row-list">
            {place.highlights.map((h, j) => (
              <li key={j} style={{ '--bullet': region.accent }}>
                {editing ? (
                  <>
                    <window.Editable
                      value={h}
                      onCommit={(v) => {
                        if (!v) store.removeHighlight(chapterId, idx, j);
                        else store.updateHighlight(chapterId, idx, j, v);
                      }}
                      placeholder="Attraction"
                    />
                    <button
                      className="hl-remove"
                      onClick={(e) => { e.stopPropagation(); store.removeHighlight(chapterId, idx, j); }}
                      title="Remove">×</button>
                  </>
                ) : h}
              </li>
            ))}
            {editing && (
              <li className="hl-add">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    store.addHighlight(chapterId, idx, '');
                  }}>
                  <window.Icon.plus size={10} /> Add attraction
                </button>
              </li>
            )}
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
          {editing && (
            <window.ActionMenu
              items={[
                { label: 'Edit details…', onClick: onEdit },
                { label: 'Add stop below', onClick: onAddBelow },
                { label: 'Delete', onClick: onDelete, danger: true },
              ]} />
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // EDIT MODALS
  // ══════════════════════════════════════════════════════════════════════
  function Modal({ title, onClose, children, wide }) {
    React.useEffect(() => {
      const k = (e) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', k);
      return () => document.removeEventListener('keydown', k);
    }, [onClose]);
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className={`modal ${wide ? 'is-wide' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <div className="modal-title">{title}</div>
            <button className="icon-btn" onClick={onClose}><window.Icon.close size={14} /></button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    );
  }

  function Field({ label, children, hint }) {
    return (
      <label className="field">
        <span className="field-label">{label}</span>
        {children}
        {hint && <span className="field-hint">{hint}</span>}
      </label>
    );
  }

  function ChapterEditModal({ chapterId, onClose }) {
    const store = window.useStore();
    const ch = store.getChapter(chapterId);
    const [form, setForm] = React.useState({
      title: ch.title, country: ch.country, flag: ch.flag,
      region: ch.region, start: ch.start, end: ch.end,
      theme: ch.theme || '', intro: ch.intro || '',
      anchor: ch.anchor ? ch.anchor.join(', ') : '',
      weatherLabel: ch.weather?.label || '', weatherEmoji: ch.weather?.emoji || '',
    });
    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    // Consequence preview — recomputed whenever dates change.
    const datesChanged = form.start !== ch.start || form.end !== ch.end;
    const consequences = React.useMemo(() => {
      if (!datesChanged) return null;
      return store.getConsequences(chapterId, { start: form.start, end: form.end });
    }, [form.start, form.end, datesChanged]);

    const save = () => {
      const [latS, lngS] = form.anchor.split(',').map((x) => x.trim());
      const lat = parseFloat(latS), lng = parseFloat(lngS);
      store.updateChapter(chapterId, {
        title: form.title, country: form.country, flag: form.flag,
        region: form.region, start: form.start, end: form.end,
        theme: form.theme, intro: form.intro,
        anchor: (!isNaN(lat) && !isNaN(lng)) ? [lat, lng] : ch.anchor,
        weather: { ...ch.weather, label: form.weatherLabel, emoji: form.weatherEmoji },
      });
      onClose();
    };

    const geocodeAnchor = async () => {
      const q = form.title + ' ' + form.country;
      const res = await window.geocode(q);
      if (res) update('anchor', res.join(', '));
      else alert('Could not find a location for "' + q + '"');
    };

    return (
      <Modal title="Edit chapter" onClose={onClose} wide>
        <div className="modal-grid">
          <Field label="Title"><input value={form.title} onChange={(e) => update('title', e.target.value)} /></Field>
          <Field label="Country"><input value={form.country} onChange={(e) => update('country', e.target.value)} /></Field>
          <Field label="Flag (emoji)"><input value={form.flag} onChange={(e) => update('flag', e.target.value)} maxLength={4} /></Field>
          <Field label="Region">
            <select value={form.region} onChange={(e) => update('region', e.target.value)}>
              {Object.entries(REGIONS).map(([k, r]) => <option key={k} value={k}>{r.name}</option>)}
            </select>
          </Field>
          <Field label="Start date"><input type="date" value={form.start} onChange={(e) => update('start', e.target.value)} /></Field>
          <Field label="End date"><input type="date" value={form.end} onChange={(e) => update('end', e.target.value)} /></Field>
          <Field label="Anchor (lat, lng)" hint="Coordinates of the chapter's pin on the map">
            <div className="field-row">
              <input value={form.anchor} onChange={(e) => update('anchor', e.target.value)} placeholder="e.g. 41.0082, 28.9784" />
              <button type="button" className="btn-secondary" onClick={geocodeAnchor}>Find</button>
            </div>
          </Field>
          <Field label="Weather summary"><input value={form.weatherLabel} onChange={(e) => update('weatherLabel', e.target.value)} placeholder="e.g. Late summer, 28°/16°" /></Field>
          <Field label="Weather emoji"><input value={form.weatherEmoji} onChange={(e) => update('weatherEmoji', e.target.value)} maxLength={4} /></Field>
          <Field label="Theme" hint="Italic deck under the title">
            <input value={form.theme} onChange={(e) => update('theme', e.target.value)} />
          </Field>
          <Field label="Intro paragraph">
            <textarea rows={4} value={form.intro} onChange={(e) => update('intro', e.target.value)} />
          </Field>
        </div>

        {consequences && <ConsequencePreview c={consequences} />}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save changes</button>
        </div>
      </Modal>
    );
  }

  function ConsequencePreview({ c }) {
    const sign = (n) => n > 0 ? `+${n}` : `${n}`;
    const hasIssues = c.seasonWarnings.length > 0 || c.gapConflicts.length > 0;
    return (
      <div className={`consequence-preview ${hasIssues ? 'has-issues' : ''}`}>
        <div className="consequence-title">
          {hasIssues ? '⚠ Consequence preview' : '✓ Consequence preview'}
        </div>
        <ul className="consequence-list">
          {c.daysDelta !== 0 && (
            <li>
              This chapter changes by <strong>{sign(c.daysDelta)} days</strong>.
              {c.tripEndDelta !== 0 && ` Trip end shifts by ${sign(c.tripEndDelta)} days.`}
            </li>
          )}
          {c.chainShifts.length > 0 && (
            <li className="consequence-chain">
              Subsequent chapters not auto-shifted —&nbsp;
              <strong>{c.chainShifts.map((s) => s.title).join(', ')}</strong>
              &nbsp;would each need to shift by <strong>{sign(c.chainShifts[0].delta)} days</strong> to stay continuous.
            </li>
          )}
          {c.gapConflicts.map((g, i) => (
            <li key={i} className="consequence-warn">
              {g.type === 'gap'
                ? `Gap of ${g.gapDays} day${g.gapDays > 1 ? 's' : ''} between ${g.titles[0]} and ${g.titles[1]}.`
                : `Overlap of ${Math.abs(g.gapDays)} day${Math.abs(g.gapDays) > 1 ? 's' : ''} with ${g.titles[1]}.`}
            </li>
          ))}
          {c.seasonWarnings.map((w, i) => (
            <li key={i} className="consequence-warn">{w.message}</li>
          ))}
          {c.daysDelta === 0 && c.chainShifts.length === 0 && c.gapConflicts.length === 0 && c.seasonWarnings.length === 0 && (
            <li>No date changes detected.</li>
          )}
        </ul>
      </div>
    );
  }

  function PlaceEditModal({ chapterId, placeIdx, onClose }) {
    const store = window.useStore();
    const ch = store.getChapter(chapterId);
    const p = ch?.places[placeIdx];
    const [form, setForm] = React.useState({
      name: p?.name || '',
      days: p?.days || 1,
      coords: p?.coords ? p.coords.join(', ') : '',
    });
    if (!p) return null;
    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const save = () => {
      const [latS, lngS] = form.coords.split(',').map((x) => x.trim());
      const lat = parseFloat(latS), lng = parseFloat(lngS);
      store.updatePlace(chapterId, placeIdx, {
        name: form.name, query: form.name,
        days: parseInt(form.days, 10) || 1,
        coords: (!isNaN(lat) && !isNaN(lng)) ? [lat, lng] : p.coords,
      });
      onClose();
    };
    const find = async () => {
      const res = await window.geocode(form.name + ' ' + ch.country);
      if (res) update('coords', res.join(', '));
      else alert('Could not find "' + form.name + '"');
    };
    return (
      <Modal title="Edit stop" onClose={onClose}>
        <div className="modal-grid">
          <Field label="Name"><input value={form.name} onChange={(e) => update('name', e.target.value)} /></Field>
          <Field label="Days"><input type="number" min="1" value={form.days} onChange={(e) => update('days', e.target.value)} /></Field>
          <Field label="Coordinates (lat, lng)" hint="Pin location on the map">
            <div className="field-row">
              <input value={form.coords} onChange={(e) => update('coords', e.target.value)} placeholder="e.g. 41.0082, 28.9784" />
              <button type="button" className="btn-secondary" onClick={find}>Find</button>
            </div>
          </Field>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </Modal>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // BINDER (Bookings / Diving / Budget / Packing / Snapshots)
  // ══════════════════════════════════════════════════════════════════════
  function Binder({ activeTab, onSwitchTab, onClose }) {
    const tab = activeTab || 'bookings';
    return (
      <div className="binder">
        <div className="binder-head">
          <div className="binder-tabs">
            {[
              ['bookings', 'Bookings'],
              ['diving', 'Diving log'],
              ['budget', 'Budget'],
              ['packing', 'Packing'],
              ['snapshots', 'Versions'],
            ].map(([k, l]) => (
              <button key={k}
                className={`binder-tab ${tab === k ? 'is-active' : ''}`}
                onClick={() => onSwitchTab(k)}>{l}</button>
            ))}
          </div>
          <button className="icon-btn" onClick={onClose} title="Close binder">
            <window.Icon.close size={16} />
          </button>
        </div>
        <div className="binder-body">
          {tab === 'bookings' && <BookingsView />}
          {tab === 'diving' && <DivingView />}
          {tab === 'budget' && <BudgetView />}
          {tab === 'packing' && <PackingView />}
          {tab === 'snapshots' && <SnapshotsView />}
        </div>
      </div>
    );
  }

  function BookingsView() {
    const [done, setDone] = React.useState(() => {
      try { return JSON.parse(localStorage.getItem('bookings-done') || '{}'); } catch { return {}; }
    });
    const setAndSave = (i, v) => {
      const next = { ...done, [i]: v };
      setDone(next);
      try { localStorage.setItem('bookings-done', JSON.stringify(next)); } catch {}
    };
    const doneCount = bookings.filter((_, i) => done[i]).length;
    return (
      <div className="binder-pane">
        <div className="binder-pane-head">
          <div>
            <div className="kicker">§ Pre-departure</div>
            <h2 className="binder-pane-title">Book before you leave Brazil</h2>
            <p className="binder-pane-sub">Time-sensitive locks. Liveaboard cabins and Sipadan permits don't reappear once they're gone.</p>
          </div>
          <div className="binder-pane-counter">
            <div className="binder-pane-counter-big">{doneCount}<span>/{bookings.length}</span></div>
            <div className="kicker">checked off</div>
          </div>
        </div>
        <div className="booking-grid">
          {bookings.map((b, i) => {
            const isDone = !!done[i];
            return (
              <div key={i} className={`booking-card ${isDone ? 'is-done' : ''}`}>
                {b.critical && !isDone && <div className="stamp">Critical</div>}
                <button className={`booking-check ${isDone ? 'is-done' : ''}`} onClick={() => setAndSave(i, !isDone)}>
                  {isDone && <window.Icon.check size={14} />}
                </button>
                <div className="booking-body">
                  <div className="booking-task">{b.task}</div>
                  <div className="booking-by">{b.by}</div>
                  <div className="booking-notes">{b.notes}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function DivingView() {
    const total = diving.reduce((s, d) => s + d.days, 0);
    return (
      <div className="binder-pane diving-pane">
        <div className="binder-pane-head">
          <div>
            <div className="kicker" style={{ color: '#1c4a5e' }}>§ Underwater</div>
            <h2 className="binder-pane-title" style={{ color: '#1c4a5e' }}>Diving log</h2>
            <p className="binder-pane-sub">Six chapters underwater. Two liveaboards, three day-boat windows, one limestone reset.</p>
          </div>
          <div className="binder-pane-counter">
            <div className="binder-pane-counter-big" style={{ color: '#1c4a5e' }}>{total}<span>/{totalDays}</span></div>
            <div className="kicker">days underwater</div>
          </div>
        </div>
        <div className="diving-grid">
          {diving.map((d, i) => (
            <div key={i} className="diving-card">
              <div className="diving-photo">
                <window.Photo keyword={d.where.split('—')[0].trim() + ' underwater'} ratio="auto" style={{ width: '100%', height: '100%', aspectRatio: 'unset' }} />
              </div>
              <div className="diving-body">
                <div className="diving-name">{d.where}</div>
                <div className="diving-meta">
                  <span>{d.dates}</span>
                  <span className="diving-dot" />
                  <span>{d.days}d</span>
                </div>
                <div className="diving-notes">{d.notes}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function BudgetView() {
    return (
      <div className="binder-pane">
        <div className="binder-pane-head">
          <div>
            <div className="kicker">§ Money</div>
            <h2 className="binder-pane-title">Budget anchors</h2>
            <p className="binder-pane-sub">Where the money goes and what's worth the splurge.</p>
          </div>
        </div>
        <div className="budget-hero">
          <div className="budget-hero-big">{budget.estimate}</div>
          <div className="budget-hero-sub">{budget.inBRL}</div>
        </div>
        <div className="budget-grid">
          <BudgetCard title="Expensive chapters" items={budget.expensive} tone="warn" />
          <BudgetCard title="Cheap anchors" items={budget.cheap} tone="cool" />
          <BudgetCard title="Strategic splurges" items={budget.splurges} tone="neutral" bordered />
        </div>
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

  function PackingView() {
    return (
      <div className="binder-pane">
        <div className="binder-pane-head">
          <div>
            <div className="kicker">§ Kit</div>
            <h2 className="binder-pane-title">Packing</h2>
            <p className="binder-pane-sub">Carry-on + 30L only. Rent locally where it makes sense.</p>
          </div>
        </div>
        <div className="packing-list">
          {packing.map((p, i) => (
            <div key={i} className="packing-row">
              <div className="packing-layer">{p.layer}</div>
              <div className="packing-items">{p.items}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // SNAPSHOTS — save named versions and compare diffs
  // ══════════════════════════════════════════════════════════════════════
  function SnapshotsView() {
    const store = window.useStore();
    const [snaps, setSnaps] = React.useState(() => store.getSnapshots());
    const [diffTarget, setDiffTarget] = React.useState(null);

    const refresh = () => setSnaps(store.getSnapshots());

    const saveNew = () => {
      const name = prompt('Name this version (e.g. "V1 Original", "V2 Longer Nepal"):');
      if (!name || !name.trim()) return;
      store.saveSnapshot(name.trim());
      refresh();
    };

    const load = (name) => {
      if (!confirm(`Load snapshot "${name}"? Your current unsaved edits will be replaced.`)) return;
      store.loadSnapshot(name);
      refresh();
    };

    const del = (name) => {
      if (!confirm(`Delete snapshot "${name}"?`)) return;
      store.deleteSnapshot(name);
      refresh();
    };

    return (
      <div className="binder-pane">
        <div className="binder-pane-head">
          <div>
            <div className="kicker">§ Versions</div>
            <h2 className="binder-pane-title">Saved versions</h2>
            <p className="binder-pane-sub">Save named snapshots of your itinerary and compare them side-by-side.</p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <button className="btn-primary" onClick={saveNew}>Save current as…</button>
          </div>
        </div>

        {snaps.length === 0 ? (
          <div className="snapshot-empty">
            No versions saved yet. Click "Save current as…" to capture the current itinerary.
          </div>
        ) : (
          <div className="snapshot-list">
            {snaps.map((s) => (
              <div key={s.name} className="snapshot-row">
                <div className="snapshot-row-info">
                  <div className="snapshot-name">{s.name}</div>
                  <div className="snapshot-meta">
                    {new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {' · '}{s.chapters.length} entries
                  </div>
                </div>
                <div className="snapshot-row-actions">
                  <button className="pill-btn" onClick={() => setDiffTarget(s.name)}>Compare</button>
                  <button className="pill-btn" onClick={() => load(s.name)}>Load</button>
                  <button className="pill-btn" style={{ color: 'var(--stamp)', borderColor: 'var(--stamp)' }}
                    onClick={() => del(s.name)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {diffTarget && (
          <SnapshotDiffModal
            snapName={diffTarget}
            store={store}
            onClose={() => setDiffTarget(null)}
          />
        )}
      </div>
    );
  }

  function SnapshotDiffModal({ snapName, store, onClose }) {
    const diff = React.useMemo(() => store.compareWithSnapshot(snapName), [snapName]);
    if (!diff) return null;
    const sign = (n) => n > 0 ? `+${n}` : `${n}`;
    const fmtDate = (d) => {
      if (!d) return '—';
      const dt = new Date(d);
      return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getUTCMonth()] + ' ' + dt.getUTCDate();
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal is-wide diff-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 820 }}>
          <div className="modal-head">
            <div className="modal-title">Compare: current vs "{snapName}"</div>
            <button className="icon-btn" onClick={onClose}><window.Icon.close size={14} /></button>
          </div>
          <div className="modal-body">
            <div className="diff-summary">
              <span className="diff-summary-chip"
                style={{ background: diff.totalDaysDelta !== 0 ? 'var(--accent)' : 'var(--rule)', color: diff.totalDaysDelta !== 0 ? '#fff' : 'var(--ink-3)' }}>
                {diff.totalDaysDelta !== 0 ? `${sign(diff.totalDaysDelta)} days total` : 'Same total days'}
              </span>
              {diff.added.length > 0 && <span className="diff-summary-chip diff-added">{diff.added.length} added</span>}
              {diff.removed.length > 0 && <span className="diff-summary-chip diff-removed">{diff.removed.length} removed</span>}
              {diff.modified.length > 0 && <span className="diff-summary-chip diff-modified">{diff.modified.length} modified</span>}
              {diff.added.length === 0 && diff.removed.length === 0 && diff.modified.length === 0 && (
                <span className="diff-summary-chip">No changes</span>
              )}
            </div>

            <table className="diff-table">
              <thead>
                <tr>
                  <th>Chapter</th>
                  <th>Current dates</th>
                  <th>Snapshot dates</th>
                  <th>Δ days</th>
                  <th>Δ start</th>
                </tr>
              </thead>
              <tbody>
                {diff.added.map((c) => (
                  <tr key={c.id} className="diff-row-added">
                    <td>{c.flag} {c.title}</td>
                    <td>{fmtDate(c.start)} – {fmtDate(c.end)}</td>
                    <td className="diff-cell-muted">—</td>
                    <td className="diff-cell-pos">+{c.days}d</td>
                    <td>—</td>
                  </tr>
                ))}
                {diff.removed.map((c) => (
                  <tr key={c.id} className="diff-row-removed">
                    <td>{c.flag} {c.title}</td>
                    <td className="diff-cell-muted">—</td>
                    <td>{fmtDate(c.start)} – {fmtDate(c.end)}</td>
                    <td className="diff-cell-neg">-{c.days}d</td>
                    <td>—</td>
                  </tr>
                ))}
                {diff.modified.map((m) => (
                  <tr key={m.id} className="diff-row-modified">
                    <td>{m.title}</td>
                    <td>{fmtDate(m.current.start)} – {fmtDate(m.current.end)}</td>
                    <td>{fmtDate(m.snapshot.start)} – {fmtDate(m.snapshot.end)}</td>
                    <td className={m.daysDelta > 0 ? 'diff-cell-pos' : m.daysDelta < 0 ? 'diff-cell-neg' : ''}>
                      {m.daysDelta !== 0 ? sign(m.daysDelta) + 'd' : '—'}
                    </td>
                    <td className={m.dateDelta !== 0 ? 'diff-cell-shifted' : ''}>
                      {m.dateDelta !== 0 ? sign(m.dateDelta) + 'd' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  Object.assign(window, { ChapterList, DetailPanel, Binder });
})();
