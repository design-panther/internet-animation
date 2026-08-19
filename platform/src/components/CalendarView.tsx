"use client";

/**
 * Shared class calendar — month grid + agenda list over `/api/calendar`.
 *
 * The JSON file (`_calendar/<id>.json`) is the source of truth; this component
 * polls it every ~3s so edits made by anyone else on the LAN (or by an agent
 * editing the file directly) appear in near-real time. Everyone with platform
 * access can add, edit, and delete events — the "your name" field is stamped
 * onto events on the honor system.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type CalCategory = "class" | "due" | "critique" | "studio" | "event" | "note";
const CATEGORIES: { key: CalCategory; label: string; color: string }[] = [
  { key: "class",    label: "Class / topic", color: "#60a5fa" },
  { key: "due",      label: "Due date",      color: "#fb7185" },
  { key: "critique", label: "Critique",      color: "#f59e0b" },
  { key: "studio",   label: "Studio / lab",  color: "#34d399" },
  { key: "event",    label: "Event",         color: "#22d3ee" },
  { key: "note",     label: "Note",          color: "#94a3b8" },
];
const catColor = (c: string) => CATEGORIES.find((x) => x.key === c)?.color ?? "#94a3b8";

interface CalEvent {
  id: string; title: string; start: string; end?: string; time?: string;
  category: CalCategory; details?: string; link?: string; addedBy?: string; ts?: string;
}
interface CalendarDoc {
  id: string; rev: number; semester: string; note?: string; events: CalEvent[];
}

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function fmtDay(s: string): string {
  const d = parseISO(s);
  return `${DOW[d.getDay()]} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

interface Draft {
  id?: string; title: string; start: string; end: string; time: string;
  category: CalCategory; details: string; link: string;
}
const emptyDraft = (start: string): Draft => ({
  title: "", start, end: "", time: "", category: "event", details: "", link: "",
});

export default function CalendarView({ calendarId = "class-calendar" }: { calendarId?: string }) {
  const [doc, setDoc] = useState<CalendarDoc | null>(null);
  const [cursor, setCursor] = useState<Date>(() => new Date());
  const [view, setView] = useState<"month" | "agenda">("month");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [who, setWho] = useState("");
  const [err, setErr] = useState("");
  const editing = draft !== null;
  const editingRef = useRef(editing);
  editingRef.current = editing;
  const revRef = useRef(0);

  useEffect(() => {
    try { const v = localStorage.getItem("cal-who"); if (v) setWho(v); } catch {}
  }, []);
  const rememberWho = (v: string) => {
    setWho(v);
    try { localStorage.setItem("cal-who", v); } catch {}
  };

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/calendar?id=${encodeURIComponent(calendarId)}`, { cache: "no-store" });
      const j = (await r.json()) as CalendarDoc;
      if (!r.ok) throw new Error((j as unknown as { error?: string }).error || r.statusText);
      if (!editingRef.current && j.rev !== revRef.current) {
        revRef.current = j.rev;
        setDoc(j);
      }
      setErr("");
    } catch (e) {
      setErr(String((e as Error).message));
    }
  }, [calendarId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [load]);

  const save = useCallback(async (next: CalendarDoc) => {
    setDoc(next); // optimistic
    try {
      const r = await fetch("/api/calendar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const j = (await r.json()) as CalendarDoc;
      if (!r.ok) throw new Error((j as unknown as { error?: string }).error || r.statusText);
      revRef.current = j.rev;
      setDoc(j);
      setErr("");
    } catch (e) {
      setErr(`save failed: ${String((e as Error).message)}`);
    }
  }, []);

  const commitDraft = () => {
    if (!doc || !draft || !draft.title.trim() || !draft.start) return;
    const ev: CalEvent = {
      id: draft.id || `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      title: draft.title.trim(),
      start: draft.start,
      end: draft.end && draft.end > draft.start ? draft.end : undefined,
      time: draft.time.trim() || undefined,
      category: draft.category,
      details: draft.details.trim() || undefined,
      link: draft.link.trim() || undefined,
      addedBy: who.trim() || undefined,
      ts: new Date().toISOString().slice(0, 10),
    };
    const events = draft.id
      ? doc.events.map((e) => (e.id === draft.id ? ev : e))
      : [...doc.events, ev];
    setDraft(null);
    save({ ...doc, events });
  };

  const removeDraft = () => {
    if (!doc || !draft?.id) return;
    const events = doc.events.filter((e) => e.id !== draft.id);
    setDraft(null);
    save({ ...doc, events });
  };

  const monthCells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    const cells: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({ date: d, inMonth: d.getMonth() === cursor.getMonth() });
    }
    return cells;
  }, [cursor]);

  const eventsOn = useCallback((dayIso: string) =>
    (doc?.events ?? [])
      .filter((e) => e.start <= dayIso && dayIso <= (e.end || e.start))
      .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title)),
  [doc]);

  const agenda = useMemo(() => {
    const todayIso = iso(new Date());
    const upcoming = (doc?.events ?? [])
      .filter((e) => (e.end || e.start) >= todayIso)
      .sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title));
    const past = (doc?.events ?? [])
      .filter((e) => (e.end || e.start) < todayIso)
      .sort((a, b) => b.start.localeCompare(a.start));
    return { upcoming, past };
  }, [doc]);

  const todayIso = iso(new Date());

  if (!doc) return <div className="calwrap"><p style={{ color: "#94a3b8" }}>Loading calendar…{err && ` (${err})`}</p></div>;

  return (
    <div className="calwrap">
      <style>{CSS}</style>

      <div className="cal-head">
        <div className="cal-title">
          <h1>⧗ Class Calendar <span className="cal-sem">{doc.semester}</span></h1>
          {doc.note && <p className="cal-note">{doc.note}</p>}
        </div>
        <div className="cal-controls">
          <input
            className="cal-who"
            placeholder="your name"
            value={who}
            onChange={(e) => rememberWho(e.target.value)}
            title="Stamped on events you add or edit"
          />
          <div className="cal-seg">
            <button className={view === "month" ? "on" : ""} onClick={() => setView("month")}>Month</button>
            <button className={view === "agenda" ? "on" : ""} onClick={() => setView("agenda")}>Agenda</button>
          </div>
          <button className="cal-add" onClick={() => setDraft(emptyDraft(todayIso))}>＋ Add event</button>
        </div>
      </div>

      {err && <div className="cal-err">⚠ {err}</div>}

      <div className="cal-legend">
        {CATEGORIES.map((c) => (
          <span key={c.key} className="cal-key"><i style={{ background: c.color }} /> {c.label}</span>
        ))}
      </div>

      {view === "month" && (
        <>
          <div className="cal-nav">
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>‹</button>
            <strong>{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</strong>
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>›</button>
            <button className="cal-today" onClick={() => setCursor(new Date())}>Today</button>
          </div>
          <div className="cal-grid">
            {DOW.map((d) => <div key={d} className="cal-dow">{d}</div>)}
            {monthCells.map(({ date, inMonth }) => {
              const dIso = iso(date);
              const evs = eventsOn(dIso);
              return (
                <div
                  key={dIso}
                  className={`cal-cell${inMonth ? "" : " dim"}${dIso === todayIso ? " today" : ""}`}
                  onClick={() => setDraft(emptyDraft(dIso))}
                  title="Click to add an event"
                >
                  <span className="cal-daynum">{date.getDate()}</span>
                  <div className="cal-evs">
                    {evs.slice(0, 4).map((e) => (
                      <button
                        key={e.id}
                        className="cal-pill"
                        style={{ background: `${catColor(e.category)}26`, borderLeftColor: catColor(e.category) }}
                        onClick={(x) => {
                          x.stopPropagation();
                          setDraft({
                            id: e.id, title: e.title, start: e.start, end: e.end || "",
                            time: e.time || "", category: e.category,
                            details: e.details || "", link: e.link || "",
                          });
                        }}
                      >
                        {e.time ? `${e.time} · ` : ""}{e.title}
                      </button>
                    ))}
                    {evs.length > 4 && <span className="cal-more">+{evs.length - 4} more</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {view === "agenda" && (
        <div className="cal-agenda">
          <h2>Upcoming</h2>
          {agenda.upcoming.length === 0 && <p className="cal-empty">Nothing upcoming — click "Add event".</p>}
          {agenda.upcoming.map((e) => <AgendaRow key={e.id} e={e} onEdit={setDraft} />)}
          {agenda.past.length > 0 && (
            <details>
              <summary>Past ({agenda.past.length})</summary>
              {agenda.past.map((e) => <AgendaRow key={e.id} e={e} onEdit={setDraft} />)}
            </details>
          )}
        </div>
      )}

      {draft && (
        <div className="cal-modal" onClick={() => setDraft(null)}>
          <div className="cal-form" onClick={(e) => e.stopPropagation()}>
            <h3>{draft.id ? "Edit event" : "New event"}</h3>
            <label>Title
              <input autoFocus value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Project 2 due — midterm critique" />
            </label>
            <div className="cal-row">
              <label>Start
                <input type="date" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} />
              </label>
              <label>End (optional)
                <input type="date" value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} />
              </label>
              <label>Time (optional)
                <input value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} placeholder="8:00–9:15am" />
              </label>
            </div>
            <label>Category
              <div className="cal-cats">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    className={draft.category === c.key ? "on" : ""}
                    style={{ ["--c" as string]: c.color }}
                    onClick={() => setDraft({ ...draft, category: c.key })}
                  >{c.label}</button>
                ))}
              </div>
            </label>
            <label>Details (optional)
              <textarea rows={3} value={draft.details} onChange={(e) => setDraft({ ...draft, details: e.target.value })} />
            </label>
            <label>Link (optional)
              <input value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="https://… or /wiki/03-Projects/…" />
            </label>
            <div className="cal-actions">
              {draft.id && <button className="danger" onClick={removeDraft}>Delete</button>}
              <span style={{ flex: 1 }} />
              <button onClick={() => setDraft(null)}>Cancel</button>
              <button className="primary" disabled={!draft.title.trim() || !draft.start} onClick={commitDraft}>
                {draft.id ? "Save" : "Add"}
              </button>
            </div>
            {!who.trim() && <p className="cal-hint">Tip: put your name in the "your name" box up top so classmates can see who added this.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function AgendaRow({ e, onEdit }: { e: CalEvent; onEdit: (d: Draft) => void }) {
  return (
    <div className="cal-arow" style={{ borderLeftColor: catColor(e.category) }}>
      <div className="cal-adate">{fmtDay(e.start)}{e.end ? ` → ${fmtDay(e.end)}` : ""}{e.time ? ` · ${e.time}` : ""}</div>
      <div className="cal-amain">
        <strong>{e.title}</strong>
        {e.details && <p>{e.details}</p>}
        {e.link && <a href={e.link} target={e.link.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{e.link}</a>}
      </div>
      <div className="cal-ameta">
        {e.addedBy && <span className="cal-by">{e.addedBy}</span>}
        <button onClick={() => onEdit({
          id: e.id, title: e.title, start: e.start, end: e.end || "",
          time: e.time || "", category: e.category, details: e.details || "", link: e.link || "",
        })}>edit</button>
      </div>
    </div>
  );
}

const CSS = `
.calwrap { max-width: 1100px; }
.cal-head { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end; justify-content: space-between; margin-bottom: 10px; }
.cal-head h1 { margin: 0 0 4px; font-size: 26px; }
.cal-sem { font-size: 14px; color: var(--text-faint, #78869e); font-weight: 500; margin-left: 8px; }
.cal-note { margin: 0; font-size: 13px; color: var(--text-dim, #a9b6cc); max-width: 520px; }
.cal-controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.cal-who { background: var(--panel, #161e2c); border: 1px solid var(--border, #2c3a54); color: var(--text, #e9eef7); border-radius: 8px; padding: 7px 10px; font-size: 13px; width: 130px; }
.cal-seg { display: flex; border: 1px solid var(--border, #2c3a54); border-radius: 8px; overflow: hidden; }
.cal-seg button { background: transparent; color: var(--text-dim, #a9b6cc); border: 0; padding: 7px 12px; font-size: 13px; cursor: pointer; }
.cal-seg button.on { background: var(--panel-2, #1d2738); color: var(--text, #e9eef7); }
.cal-add { background: var(--accent, #22d3ee); color: #06121a; border: 0; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; }
.cal-err { background: #f43f5e22; border: 1px solid #f43f5e55; color: #fda4af; border-radius: 8px; padding: 6px 12px; font-size: 13px; margin-bottom: 10px; }
.cal-legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 12px; color: var(--text-dim, #a9b6cc); margin-bottom: 12px; }
.cal-key i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; }
.cal-nav { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; }
.cal-nav strong { font-size: 17px; min-width: 170px; text-align: center; }
.cal-nav button { background: var(--panel, #161e2c); color: var(--text, #e9eef7); border: 1px solid var(--border, #2c3a54); border-radius: 8px; padding: 5px 12px; font-size: 15px; cursor: pointer; }
.cal-nav .cal-today { font-size: 12px; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-dow { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-faint, #78869e); padding: 4px 6px; }
.cal-cell { background: var(--panel, #161e2c); border: 1px solid var(--border, #2c3a54); border-radius: 8px; min-height: 92px; padding: 5px 6px; cursor: pointer; overflow: hidden; }
.cal-cell:hover { border-color: var(--accent, #22d3ee); }
.cal-cell.dim { opacity: 0.45; }
.cal-cell.today { outline: 2px solid var(--accent, #22d3ee); outline-offset: -2px; }
.cal-daynum { font-size: 12px; color: var(--text-faint, #78869e); }
.cal-evs { display: flex; flex-direction: column; gap: 3px; margin-top: 3px; }
.cal-pill { display: block; width: 100%; text-align: left; font-size: 11px; line-height: 1.35; color: var(--text, #e9eef7); background: transparent; border: 0; border-left: 3px solid; border-radius: 4px; padding: 2px 5px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cal-more { font-size: 10px; color: var(--text-faint, #78869e); }
.cal-agenda h2 { font-size: 16px; margin: 14px 0 8px; }
.cal-empty { color: var(--text-faint, #78869e); font-size: 14px; }
.cal-arow { display: flex; gap: 14px; align-items: baseline; background: var(--panel, #161e2c); border: 1px solid var(--border, #2c3a54); border-left: 4px solid; border-radius: 8px; padding: 9px 12px; margin-bottom: 6px; }
.cal-adate { font-size: 12px; color: var(--text-dim, #a9b6cc); min-width: 170px; font-family: var(--mono, monospace); }
.cal-amain { flex: 1; font-size: 14px; }
.cal-amain p { margin: 3px 0 0; font-size: 13px; color: var(--text-dim, #a9b6cc); }
.cal-amain a { font-size: 12px; }
.cal-ameta { display: flex; gap: 8px; align-items: center; }
.cal-by { font-size: 11px; color: var(--text-faint, #78869e); background: var(--panel-2, #1d2738); border-radius: 10px; padding: 2px 8px; }
.cal-ameta button { background: transparent; border: 1px solid var(--border, #2c3a54); color: var(--text-dim, #a9b6cc); border-radius: 6px; font-size: 11px; padding: 2px 8px; cursor: pointer; }
.cal-agenda details { margin-top: 16px; }
.cal-agenda summary { cursor: pointer; color: var(--text-dim, #a9b6cc); font-size: 13px; margin-bottom: 8px; }
.cal-modal { position: fixed; inset: 0; z-index: 300; background: rgba(5, 8, 14, 0.66); display: flex; align-items: center; justify-content: center; padding: 20px; }
.cal-form { background: var(--panel, #161e2c); border: 1px solid var(--border, #2c3a54); border-radius: 12px; padding: 18px 20px; width: 520px; max-width: 100%; max-height: 90vh; overflow: auto; }
.cal-form h3 { margin: 0 0 12px; }
.cal-form label { display: block; font-size: 12px; color: var(--text-dim, #a9b6cc); margin-bottom: 10px; }
.cal-form input, .cal-form textarea { display: block; width: 100%; box-sizing: border-box; margin-top: 4px; background: var(--bg-2, #121826); border: 1px solid var(--border, #2c3a54); color: var(--text, #e9eef7); border-radius: 8px; padding: 8px 10px; font-size: 14px; font-family: inherit; }
.cal-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.cal-cats { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.cal-cats button { background: transparent; border: 1px solid var(--border, #2c3a54); color: var(--text-dim, #a9b6cc); border-radius: 14px; font-size: 12px; padding: 4px 10px; cursor: pointer; }
.cal-cats button.on { border-color: var(--c); color: var(--text, #e9eef7); background: color-mix(in srgb, var(--c) 18%, transparent); }
.cal-actions { display: flex; gap: 8px; margin-top: 6px; }
.cal-actions button { border-radius: 8px; padding: 8px 16px; font-size: 13px; cursor: pointer; background: var(--panel-2, #1d2738); color: var(--text, #e9eef7); border: 1px solid var(--border, #2c3a54); }
.cal-actions .primary { background: var(--accent, #22d3ee); color: #06121a; border: 0; font-weight: 600; }
.cal-actions .primary:disabled { opacity: 0.5; cursor: not-allowed; }
.cal-actions .danger { background: transparent; border-color: #f43f5e77; color: #fda4af; }
.cal-hint { font-size: 12px; color: var(--text-faint, #78869e); margin: 10px 0 0; }
@media (max-width: 720px) {
  .cal-grid { gap: 2px; }
  .cal-cell { min-height: 64px; padding: 3px 4px; }
  .cal-pill { font-size: 9px; padding: 1px 3px; }
  .cal-row { grid-template-columns: 1fr; }
  .cal-adate { min-width: 0; }
  .cal-arow { flex-direction: column; gap: 4px; }
}
`;
