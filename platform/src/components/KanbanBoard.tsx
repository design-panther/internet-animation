"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Board,
  Card,
  Column,
  Priority,
  TimelineItem,
  TimelineKind,
} from "@/lib/kanban";

/* ─────────────────────────────────────────────────────────────────────────
   Agent Control Board — a kanban + timeline coordination surface.

   The board JSON is the source of truth (`_kanban/<id>.json`). This component
   loads it from /api/kanban, polls for changes agents make to the file, and
   writes edits back (debounced). Everything is a scoped, self-contained dark
   theme (class `.kb`) so it renders identically as a page and inside the
   whiteboard shape.
   ──────────────────────────────────────────────────────────────────────── */

const POLL_MS = 2500;
const SAVE_DEBOUNCE_MS = 500;

const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "#fb7185" },
  high: { label: "High", color: "#fbbf24" },
  med: { label: "Medium", color: "#38bdf8" },
  low: { label: "Low", color: "#64748b" },
};

const KIND_META: Record<TimelineKind, { label: string; color: string; glyph: string }> = {
  event: { label: "Event", color: "#38bdf8", glyph: "◆" },
  scheduled: { label: "Scheduled", color: "#34d399", glyph: "↻" },
  loop: { label: "Revision loop", color: "#c084fc", glyph: "⟳" },
};

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

export default function KanbanBoard({ boardId = "control-board" }: { boardId?: string }) {
  const [board, setBoard] = useState<Board | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null); // assignee id filter
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [tlModalOpen, setTlModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const revRef = useRef(0);
  const dirtyRef = useRef(false);
  const saveTimer = useRef<number | undefined>(undefined);
  const boardRef = useRef<Board | null>(null);
  boardRef.current = board;

  // ── load + real-time poll ────────────────────────────────────────────────
  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const r = await fetch(`/api/kanban?board=${encodeURIComponent(boardId)}`, {
          cache: "no-store",
        });
        const d = (await r.json()) as Board;
        if (!live) return;
        // adopt server state only when we have no unsaved local edits and it changed
        if (!dirtyRef.current && d.rev !== revRef.current) {
          revRef.current = d.rev;
          setBoard(d);
        } else if (revRef.current === 0) {
          revRef.current = d.rev;
          setBoard(d);
        }
        setErr(null);
      } catch (e) {
        if (live) setErr(String((e as Error).message));
      }
    };
    load();
    const iv = window.setInterval(load, POLL_MS);
    return () => {
      live = false;
      window.clearInterval(iv);
    };
  }, [boardId]);

  // ── persist (debounced) ───────────────────────────────────────────────────
  const save = useCallback((next: Board) => {
    dirtyRef.current = true;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      try {
        const r = await fetch("/api/kanban", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        const saved = (await r.json()) as Board;
        revRef.current = saved.rev;
      } catch {
        /* keep dirty; next edit retries */
      } finally {
        dirtyRef.current = false;
      }
    }, SAVE_DEBOUNCE_MS);
  }, []);

  /** Apply a mutation to the board: update local state immediately + persist. */
  const mutate = useCallback(
    (fn: (b: Board) => Board) => {
      const cur = boardRef.current;
      if (!cur) return;
      const next = fn(structuredClone(cur));
      setBoard(next);
      save(next);
    },
    [save],
  );

  // ── reminders: fire when a timeline item's time arrives ───────────────────
  useEffect(() => {
    const check = () => {
      const b = boardRef.current;
      if (!b) return;
      const now = Date.now();
      for (const t of b.timeline) {
        const at = new Date(t.start).getTime();
        if (!t.notified && Math.abs(now - at) < 60000) {
          setToast(`⏰ ${t.label} — ${new Date(t.start).toLocaleTimeString()}`);
          try {
            new Audio(
              "data:audio/wav;base64,UklGRhwAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=",
            ).play().catch(() => {});
          } catch {
            /* audio optional */
          }
          mutate((bb) => {
            const it = bb.timeline.find((x) => x.id === t.id);
            if (it) it.notified = true;
            return bb;
          });
        }
      }
    };
    const iv = window.setInterval(check, 30000);
    return () => window.clearInterval(iv);
  }, [mutate]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 8000);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (err && !board)
    return (
      <div className="kb kb-msg">
        Couldn&apos;t load the board. <code>{err}</code>
      </div>
    );
  if (!board) return <div className="kb kb-msg">Loading control board…</div>;

  const agentById = (id?: string) => board.agents.find((a) => a.id === id);
  const columns = [...board.columns].sort((a, b) => a.order - b.order);
  const cardsIn = (colId: string) =>
    board.cards
      .filter((c) => c.columnId === colId && (!filter || c.assignee === filter))
      .sort((a, b) => a.order - b.order);

  // ── card mutations ────────────────────────────────────────────────────────
  const moveCard = (cardId: string, toCol: string, beforeId?: string) =>
    mutate((b) => {
      const card = b.cards.find((c) => c.id === cardId);
      if (!card) return b;
      card.columnId = toCol;
      card.updatedAt = new Date().toISOString();
      // reorder within destination
      const dest = b.cards.filter((c) => c.columnId === toCol && c.id !== cardId);
      const beforeIdx = beforeId ? dest.findIndex((c) => c.id === beforeId) : dest.length;
      dest.splice(beforeIdx === -1 ? dest.length : beforeIdx, 0, card);
      dest.forEach((c, i) => (c.order = i));
      return b;
    });

  const addCard = (colId: string, title: string) =>
    mutate((b) => {
      const now = new Date().toISOString();
      const order = b.cards.filter((c) => c.columnId === colId).length;
      b.cards.push({ id: uid("card"), columnId: colId, title, order, createdAt: now, updatedAt: now });
      return b;
    });

  const saveCard = (patch: Card) =>
    mutate((b) => {
      const i = b.cards.findIndex((c) => c.id === patch.id);
      if (i >= 0) b.cards[i] = { ...patch, updatedAt: new Date().toISOString() };
      return b;
    });

  const deleteCard = (id: string) => mutate((b) => ({ ...b, cards: b.cards.filter((c) => c.id !== id) }));

  const addColumn = (title: string) =>
    mutate((b) => {
      b.columns.push({ id: uid("col"), title, order: b.columns.length });
      return b;
    });
  const renameColumn = (id: string, title: string) =>
    mutate((b) => {
      const c = b.columns.find((x) => x.id === id);
      if (c) c.title = title;
      return b;
    });
  const deleteColumn = (id: string) =>
    mutate((b) => ({
      ...b,
      columns: b.columns.filter((c) => c.id !== id),
      cards: b.cards.filter((c) => c.columnId !== id),
    }));

  const addTimeline = (item: Omit<TimelineItem, "id">) =>
    mutate((b) => {
      b.timeline.push({ ...item, id: uid("tl") });
      return b;
    });
  const deleteTimeline = (id: string) =>
    mutate((b) => ({ ...b, timeline: b.timeline.filter((t) => t.id !== id) }));

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(board, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${board.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="kb">
      <Style />
      {/* Header */}
      <header className="kb-head">
        <div className="kb-title">
          <span className="kb-live" title="Live — reflects file changes">
            ●
          </span>
          <EditableText
            value={board.title}
            onCommit={(v) => mutate((b) => ({ ...b, title: v }))}
            as="h1"
          />
        </div>
        <div className="kb-roster">
          {board.agents.map((a) => (
            <button
              key={a.id}
              className={`kb-agent ${filter === a.id ? "on" : ""}`}
              style={{ ["--c" as string]: a.color }}
              onClick={() => setFilter(filter === a.id ? null : a.id)}
              title={`Filter to ${a.name}`}
            >
              <span className="kb-dot" />
              {a.name}
            </button>
          ))}
          {filter && (
            <button className="kb-clear" onClick={() => setFilter(null)}>
              clear
            </button>
          )}
        </div>
        <div className="kb-actions">
          <button className="kb-btn ghost" onClick={exportJson}>
            Export
          </button>
        </div>
      </header>

      {/* Timeline rail */}
      <TimelineRail
        items={board.timeline}
        onAdd={() => setTlModalOpen(true)}
        onDelete={deleteTimeline}
      />

      {/* Board */}
      <div className="kb-board">
        {columns.map((col) => (
          <ColumnView
            key={col.id}
            column={col}
            cards={cardsIn(col.id)}
            agentById={agentById}
            onDropCard={moveCard}
            onAddCard={addCard}
            onRename={renameColumn}
            onDelete={deleteColumn}
            onOpenCard={setEditingCard}
          />
        ))}
        <AddColumn onAdd={addColumn} />
      </div>

      {/* Context: description + requirements */}
      <ContextPanel
        board={board}
        onDescription={(v) => mutate((b) => ({ ...b, description: v }))}
        onRequirements={(reqs) => mutate((b) => ({ ...b, requirements: reqs }))}
      />

      {editingCard && (
        <CardModal
          card={editingCard}
          agents={board.agents}
          onClose={() => setEditingCard(null)}
          onSave={(c) => {
            saveCard(c);
            setEditingCard(null);
          }}
          onDelete={(id) => {
            deleteCard(id);
            setEditingCard(null);
          }}
        />
      )}
      {tlModalOpen && (
        <TimelineModal onClose={() => setTlModalOpen(false)} onSave={(it) => { addTimeline(it); setTlModalOpen(false); }} />
      )}
      {toast && <div className="kb-toast" onClick={() => setToast(null)}>{toast}</div>}
    </div>
  );
}

/* ── Column ─────────────────────────────────────────────────────────────── */
function ColumnView({
  column,
  cards,
  agentById,
  onDropCard,
  onAddCard,
  onRename,
  onDelete,
  onOpenCard,
}: {
  column: Column;
  cards: Card[];
  agentById: (id?: string) => { name: string; color: string; role: string } | undefined;
  onDropCard: (cardId: string, toCol: string, beforeId?: string) => void;
  onAddCard: (colId: string, title: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onOpenCard: (c: Card) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [over, setOver] = useState(false);
  const wipHit = column.wip != null && cards.length >= column.wip;

  return (
    <section
      className={`kb-col ${over ? "over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("text/card");
        if (id) onDropCard(id, column.id);
      }}
    >
      <div className="kb-col-head">
        <EditableText value={column.title} onCommit={(v) => onRename(column.id, v)} as="h5" />
        <span className={`kb-count ${wipHit ? "wip" : ""}`}>
          {cards.length}
          {column.wip != null ? `/${column.wip}` : ""}
        </span>
        <button className="kb-x" title="Delete column" onClick={() => onDelete(column.id)}>
          ×
        </button>
      </div>
      <div className="kb-cards">
        {cards.map((card) => (
          <CardView key={card.id} card={card} agent={agentById(card.assignee)} onOpen={onOpenCard} onDropBefore={onDropCard} colId={column.id} />
        ))}
      </div>
      {adding ? (
        <div className="kb-addcard">
          <textarea
            autoFocus
            value={draft}
            placeholder="Card title…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (draft.trim()) onAddCard(column.id, draft.trim());
                setDraft("");
                setAdding(false);
              }
              if (e.key === "Escape") setAdding(false);
            }}
          />
          <div className="kb-row">
            <button className="kb-btn sm" onClick={() => { if (draft.trim()) onAddCard(column.id, draft.trim()); setDraft(""); setAdding(false); }}>Add</button>
            <button className="kb-btn sm ghost" onClick={() => { setDraft(""); setAdding(false); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="kb-add" onClick={() => setAdding(true)}>
          + Add card
        </button>
      )}
    </section>
  );
}

/* ── Card ───────────────────────────────────────────────────────────────── */
function CardView({
  card,
  agent,
  onOpen,
  onDropBefore,
  colId,
}: {
  card: Card;
  agent?: { name: string; color: string; role: string };
  onOpen: (c: Card) => void;
  onDropBefore: (cardId: string, toCol: string, beforeId?: string) => void;
  colId: string;
}) {
  const p = card.priority ? PRIORITY_META[card.priority] : null;
  const overdue = card.due && new Date(card.due).getTime() < Date.now();
  const lastCheck = card.checks?.length ? card.checks[card.checks.length - 1] : null;
  const needsRevision = lastCheck?.verdict === "fail";
  const hasNotes = !!(card.researchNotes || card.buildNotes);
  return (
    <article
      className="kb-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/card", card.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.stopPropagation();
        const id = e.dataTransfer.getData("text/card");
        if (id && id !== card.id) onDropBefore(id, colId, card.id);
      }}
      onClick={() => onOpen(card)}
      style={{ ["--lane" as string]: agent?.color ?? "#3a4150" }}
    >
      <div className="kb-card-title">{card.title}</div>
      {needsRevision && (
        <div className="kb-revise" title={lastCheck?.note}>⚠ revise — {lastCheck?.note}</div>
      )}
      <div className="kb-card-meta">
        {p && (
          <span className="kb-prio" style={{ ["--c" as string]: p.color }}>
            {p.label}
          </span>
        )}
        {hasNotes && <span className="kb-note-dot" title="Has research / build notes">📝</span>}
        {card.due && (
          <span className={`kb-due ${overdue ? "over" : ""}`}>
            {new Date(card.due).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        )}
        <span className="kb-spacer" />
        {agent && (
          <span className="kb-chip" style={{ ["--c" as string]: agent.color }} title={`${agent.name} · ${agent.role}`}>
            {initials(agent.name)}
          </span>
        )}
      </div>
    </article>
  );
}

/* ── Add column ─────────────────────────────────────────────────────────── */
function AddColumn({ onAdd }: { onAdd: (title: string) => void }) {
  const [v, setV] = useState("");
  const [open, setOpen] = useState(false);
  if (!open) return <button className="kb-addcol" onClick={() => setOpen(true)}>+ Column</button>;
  return (
    <div className="kb-col kb-newcol">
      <input
        autoFocus
        value={v}
        placeholder="Column name…"
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && v.trim()) { onAdd(v.trim()); setV(""); setOpen(false); }
          if (e.key === "Escape") setOpen(false);
        }}
      />
      <div className="kb-row">
        <button className="kb-btn sm" onClick={() => { if (v.trim()) onAdd(v.trim()); setV(""); setOpen(false); }}>Add</button>
        <button className="kb-btn sm ghost" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}

/* ── Timeline rail (custom, dependency-free) ────────────────────────────── */
function TimelineRail({ items, onAdd, onDelete }: { items: TimelineItem[]; onAdd: () => void; onDelete: (id: string) => void }) {
  const sorted = [...items].sort((a, b) => +new Date(a.start) - +new Date(b.start));
  const times = sorted.map((i) => +new Date(i.start));
  const now = Date.now();
  const min = Math.min(now, ...(times.length ? times : [now])) - 3600_000;
  const max = Math.max(now, ...(times.length ? times : [now])) + 3600_000;
  const span = Math.max(1, max - min);
  const pos = (t: number) => `${((t - min) / span) * 100}%`;

  return (
    <div className="kb-tl">
      <div className="kb-tl-head">
        <span className="kb-tl-label">Timeline</span>
        <div className="kb-tl-legend">
          {(Object.keys(KIND_META) as TimelineKind[]).map((k) => (
            <span key={k} style={{ ["--c" as string]: KIND_META[k].color }}>
              {KIND_META[k].glyph} {KIND_META[k].label}
            </span>
          ))}
        </div>
        <button className="kb-btn sm" onClick={onAdd}>+ Event</button>
      </div>
      <div className="kb-tl-track">
        <div className="kb-now" style={{ left: pos(now) }} title="now">
          <span>now</span>
        </div>
        {sorted.map((it) => {
          const m = KIND_META[it.kind];
          return (
            <div
              key={it.id}
              className="kb-tl-item"
              style={{ left: pos(+new Date(it.start)), ["--c" as string]: m.color }}
              title={`${it.label}\n${new Date(it.start).toLocaleString()}${it.recurrence ? `\n${it.recurrence}` : ""}${it.agent ? `\n→ ${it.agent}` : ""}${it.details ? `\n\n${it.details}` : ""}`}
            >
              <span className="kb-tl-glyph">{m.glyph}</span>
              <span className="kb-tl-txt">{it.label}{it.agent ? ` → ${it.agent}` : ""}</span>
              <button className="kb-tl-x" onClick={() => onDelete(it.id)}>×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Context panel (description + requirements) ─────────────────────────── */
function ContextPanel({
  board,
  onDescription,
  onRequirements,
}: {
  board: Board;
  onDescription: (v: string) => void;
  onRequirements: (reqs: Board["requirements"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  return (
    <details className="kb-ctx" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>Brief &amp; requirements</summary>
      <div className="kb-ctx-body">
        <EditableText
          value={board.description || ""}
          onCommit={onDescription}
          as="p"
          placeholder="Describe this board…"
          multiline
        />
        <ul className="kb-reqs">
          {board.requirements.map((r) => (
            <li key={r.id} className={active === r.id ? "on" : ""}>
              <button onClick={() => setActive(active === r.id ? null : r.id)}>{r.text}</button>
              {active === r.id && (
                <EditableText
                  value={r.details || ""}
                  placeholder="Add detail…"
                  onCommit={(v) => onRequirements(board.requirements.map((x) => (x.id === r.id ? { ...x, details: v } : x)))}
                  as="div"
                  multiline
                />
              )}
            </li>
          ))}
        </ul>
        <button
          className="kb-btn sm ghost"
          onClick={() => onRequirements([...board.requirements, { id: uid("req"), text: "New requirement" }])}
        >
          + Requirement
        </button>
      </div>
    </details>
  );
}

/* ── Card modal ─────────────────────────────────────────────────────────── */
function CardModal({
  card,
  agents,
  onClose,
  onSave,
  onDelete,
}: {
  card: Card;
  agents: Board["agents"];
  onClose: () => void;
  onSave: (c: Card) => void;
  onDelete: (id: string) => void;
}) {
  const [c, setC] = useState<Card>({ ...card });
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="kb-modal-bg" onClick={onClose}>
      <div className="kb-modal" onClick={(e) => e.stopPropagation()}>
        <input className="kb-in title" value={c.title} onChange={(e) => setC({ ...c, title: e.target.value })} placeholder="Card title" />
        <div className="kb-field">
          <label>Supervisor brief</label>
          <textarea className="kb-in" rows={2} value={c.details || ""} placeholder="What this card is and the acceptance bar…" onChange={(e) => setC({ ...c, details: e.target.value })} />
        </div>
        <div className="kb-field">
          <label>📋 research · what to know</label>
          <textarea className="kb-in" rows={3} value={c.researchNotes || ""} placeholder="Sources, prior findings, constraints, cited data — brief the agent before they start…" onChange={(e) => setC({ ...c, researchNotes: e.target.value })} />
        </div>
        <div className="kb-field">
          <label>🔧 build · how to do it</label>
          <textarea className="kb-in" rows={3} value={c.buildNotes || ""} placeholder="Concrete steps, files, commands, gotchas…" onChange={(e) => setC({ ...c, buildNotes: e.target.value })} />
        </div>
        {(c.checks?.length || c.log?.length) ? (
          <div className="kb-thread">
            {c.checks?.length ? (
              <div className="kb-thread-sec">
                <label>Test gate</label>
                {c.checks.map((ck, i) => (
                  <div key={i} className={`kb-check ${ck.verdict}`}>
                    <span className="kb-check-v">{ck.verdict === "pass" ? "✓ pass" : "✕ fail"}</span>
                    <span className="kb-check-note">{ck.note}{typeof ck.score === "number" ? ` (${ck.score})` : ""}</span>
                    <span className="kb-check-by">{ck.agent}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {c.log?.length ? (
              <div className="kb-thread-sec">
                <label>Activity / notes</label>
                {c.log.slice(-8).map((l, i) => (
                  <div key={i} className="kb-logline"><span className="kb-log-by">{l.agent}</span> {l.msg}</div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="kb-field">
          <label>Assignee</label>
          <select className="kb-in" value={c.assignee || ""} onChange={(e) => setC({ ...c, assignee: e.target.value || undefined })}>
            <option value="">Unassigned</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name} · {a.role}</option>
            ))}
          </select>
        </div>
        <div className="kb-field-row">
          <div className="kb-field">
            <label>Priority</label>
            <select className="kb-in" value={c.priority || ""} onChange={(e) => setC({ ...c, priority: (e.target.value || undefined) as Priority | undefined })}>
              <option value="">—</option>
              {(Object.keys(PRIORITY_META) as Priority[]).map((p) => (
                <option key={p} value={p}>{PRIORITY_META[p].label}</option>
              ))}
            </select>
          </div>
          <div className="kb-field">
            <label>Due</label>
            <input className="kb-in" type="date" value={c.due ? c.due.slice(0, 10) : ""} onChange={(e) => setC({ ...c, due: e.target.value || undefined })} />
          </div>
        </div>
        <div className="kb-modal-foot">
          <button className="kb-btn danger ghost" onClick={() => onDelete(c.id)}>Delete</button>
          <span className="kb-spacer" />
          <button className="kb-btn ghost" onClick={onClose}>Cancel</button>
          <button className="kb-btn" onClick={() => onSave(c)}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ── Timeline modal ─────────────────────────────────────────────────────── */
function TimelineModal({ onClose, onSave }: { onClose: () => void; onSave: (i: Omit<TimelineItem, "id">) => void }) {
  const [label, setLabel] = useState("");
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [kind, setKind] = useState<TimelineKind>("event");
  const [recurrence, setRecurrence] = useState("");
  const [details, setDetails] = useState("");
  return (
    <div className="kb-modal-bg" onClick={onClose}>
      <div className="kb-modal" onClick={(e) => e.stopPropagation()}>
        <h4>Add timeline item</h4>
        <input className="kb-in" value={label} placeholder="Label" onChange={(e) => setLabel(e.target.value)} />
        <div className="kb-field-row">
          <div className="kb-field">
            <label>When</label>
            <input className="kb-in" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="kb-field">
            <label>Kind</label>
            <select className="kb-in" value={kind} onChange={(e) => setKind(e.target.value as TimelineKind)}>
              {(Object.keys(KIND_META) as TimelineKind[]).map((k) => (
                <option key={k} value={k}>{KIND_META[k].label}</option>
              ))}
            </select>
          </div>
        </div>
        {kind !== "event" && (
          <input className="kb-in" value={recurrence} placeholder='Recurrence, e.g. "daily 09:00" or "after each evaluation"' onChange={(e) => setRecurrence(e.target.value)} />
        )}
        <textarea className="kb-in" rows={3} value={details} placeholder="Details" onChange={(e) => setDetails(e.target.value)} />
        <div className="kb-modal-foot">
          <span className="kb-spacer" />
          <button className="kb-btn ghost" onClick={onClose}>Cancel</button>
          <button
            className="kb-btn"
            onClick={() => {
              if (!label.trim() || !start) return;
              onSave({ label: label.trim(), start: new Date(start).toISOString(), kind, recurrence: recurrence || undefined, details: details || undefined, notified: false });
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Editable text (contenteditable-free, commit on blur/Enter) ─────────── */
function EditableText({
  value,
  onCommit,
  as = "span",
  placeholder,
  multiline,
}: {
  value: string;
  onCommit: (v: string) => void;
  as?: "h1" | "h5" | "p" | "span" | "div";
  placeholder?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const Tag = as;
  if (editing) {
    return multiline ? (
      <textarea
        className="kb-edit"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { setEditing(false); if (draft !== value) onCommit(draft); }}
        rows={3}
      />
    ) : (
      <input
        className="kb-edit"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { setEditing(false); if (draft !== value) onCommit(draft); }}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      />
    );
  }
  return (
    <Tag className="kb-editable" onClick={() => setEditing(true)} title="Click to edit">
      {value || <span className="kb-ph">{placeholder}</span>}
    </Tag>
  );
}

function initials(name: string) {
  return name.split(/[\s/-]+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

/* ── Scoped styles ──────────────────────────────────────────────────────── */
function Style() {
  return (
    <style>{`
.kb{--bg:#0e1014;--surf:#171a21;--surf2:#1e222b;--line:#2a2f3a;--ink:#e8eaf0;--dim:#9aa3b2;--faint:#6b7280;--violet:#7c5cff;--teal:#16d1c9;--radius:12px;
  color:var(--ink);background:var(--bg);font:14px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --mono:ui-monospace,SFMono-Regular,Menlo,monospace;height:100%;display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;}
.kb *{box-sizing:border-box}
.kb-msg{padding:24px;color:var(--dim)}
.kb-head{display:flex;align-items:center;gap:14px;padding:12px 16px;border-bottom:1px solid var(--line);flex:0 0 auto;flex-wrap:wrap}
.kb-title{display:flex;align-items:center;gap:9px;min-width:0}
.kb-title h1{font-size:16px;font-weight:650;margin:0;letter-spacing:.2px}
.kb-live{color:#34d399;font-size:10px;animation:kb-pulse 2s ease-in-out infinite}
@keyframes kb-pulse{0%,100%{opacity:.45}50%{opacity:1}}
.kb-roster{display:flex;gap:6px;flex-wrap:wrap;flex:1;min-width:0}
.kb-agent{display:inline-flex;align-items:center;gap:6px;background:var(--surf);border:1px solid var(--line);color:var(--dim);
  border-radius:999px;padding:4px 10px;font-size:12px;cursor:pointer;transition:.15s}
.kb-agent .kb-dot{width:8px;height:8px;border-radius:50%;background:var(--c)}
.kb-agent:hover{color:var(--ink);border-color:var(--c)}
.kb-agent.on{color:var(--ink);border-color:var(--c);background:color-mix(in srgb,var(--c) 16%,var(--surf))}
.kb-clear{background:none;border:0;color:var(--faint);font-size:12px;cursor:pointer}
.kb-actions{display:flex;gap:8px}
.kb-btn{background:var(--violet);color:#fff;border:0;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:550;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.kb-btn:hover{filter:brightness(1.12)}
.kb-btn.ghost{background:transparent;border:1px solid var(--line);color:var(--dim)}
.kb-btn.ghost:hover{color:var(--ink);border-color:var(--violet)}
.kb-btn.sm{padding:5px 10px;font-size:12px}
.kb-btn.danger{color:#fb7185;border-color:#5b2530}
.kb-btn.danger:hover{background:#fb7185;color:#111;border-color:#fb7185}
/* timeline */
.kb-tl{flex:0 0 auto;padding:10px 16px 14px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,var(--surf),transparent)}
.kb-tl-head{display:flex;align-items:center;gap:14px;margin-bottom:10px}
.kb-tl-label{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim)}
.kb-tl-legend{display:flex;gap:12px;font-size:11px;color:var(--dim);flex:1;flex-wrap:wrap}
.kb-tl-legend span{color:var(--c)}
.kb-tl-track{position:relative;height:52px;border-left:1px solid var(--line);border-bottom:1px solid var(--line);
  background:repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(255,255,255,.02) 24px,rgba(255,255,255,.02) 25px)}
.kb-now{position:absolute;top:0;bottom:0;width:1px;background:var(--teal);z-index:2}
.kb-now span{position:absolute;top:-2px;left:3px;font-size:9px;color:var(--teal);text-transform:uppercase;letter-spacing:.1em}
.kb-tl-item{position:absolute;top:12px;transform:translateX(-4px);display:inline-flex;align-items:center;gap:5px;
  background:color-mix(in srgb,var(--c) 18%,var(--surf2));border:1px solid var(--c);color:var(--ink);
  border-radius:999px;padding:3px 8px 3px 6px;font-size:11px;white-space:nowrap;max-width:190px;cursor:default}
.kb-tl-glyph{color:var(--c)}
.kb-tl-txt{overflow:hidden;text-overflow:ellipsis}
.kb-tl-x{background:none;border:0;color:var(--faint);cursor:pointer;font-size:13px;line-height:1;padding:0 0 0 2px}
.kb-tl-x:hover{color:#fb7185}
/* board */
.kb-board{flex:1;display:flex;gap:14px;overflow-x:auto;overflow-y:hidden;padding:16px;align-items:flex-start;min-height:0}
.kb-col{flex:0 0 264px;max-width:264px;background:var(--surf);border:1px solid var(--line);border-radius:var(--radius);
  padding:10px;display:flex;flex-direction:column;max-height:100%;transition:.15s}
.kb-col.over{border-color:var(--violet);background:color-mix(in srgb,var(--violet) 8%,var(--surf))}
.kb-col-head{display:flex;align-items:center;gap:8px;padding:2px 4px 8px;border-bottom:1px solid var(--line);margin-bottom:8px}
.kb-col-head h5{margin:0;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);flex:1}
.kb-count{font:11px var(--mono);color:var(--faint);background:var(--surf2);border-radius:999px;padding:1px 8px}
.kb-count.wip{color:#fb7185}
.kb-x{background:none;border:0;color:var(--faint);cursor:pointer;font-size:16px;line-height:1;opacity:0;transition:.15s}
.kb-col:hover .kb-x{opacity:1}
.kb-x:hover{color:#fb7185}
.kb-cards{display:flex;flex-direction:column;gap:8px;overflow-y:auto;flex:1;min-height:8px;padding:2px}
.kb-card{background:var(--surf2);border:1px solid var(--line);border-left:3px solid var(--lane);border-radius:9px;padding:10px 11px;cursor:grab;transition:.12s}
.kb-card:hover{border-color:var(--violet);transform:translateY(-1px);box-shadow:0 6px 18px rgba(0,0,0,.35)}
.kb-card:active{cursor:grabbing}
.kb-card-title{font-size:13px;line-height:1.4;color:var(--ink);margin-bottom:8px;word-break:break-word}
.kb-card-meta{display:flex;align-items:center;gap:6px}
.kb-prio{font-size:10px;font-weight:600;color:var(--c);border:1px solid var(--c);border-radius:5px;padding:1px 6px;letter-spacing:.03em}
.kb-due{font:10px var(--mono);color:var(--dim);background:var(--surf);border-radius:5px;padding:1px 6px}
.kb-due.over{color:#fb7185}
.kb-spacer{flex:1}
.kb-chip{width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;
  font-size:9px;font-weight:700;color:#0e1014;background:var(--c)}
.kb-add{background:none;border:1px dashed var(--line);color:var(--dim);border-radius:8px;padding:8px;font-size:12px;cursor:pointer;margin-top:8px;transition:.15s}
.kb-add:hover{color:var(--ink);border-color:var(--violet)}
.kb-addcard textarea{width:100%;background:var(--surf2);border:1px solid var(--violet);color:var(--ink);border-radius:8px;padding:8px;font:inherit;resize:vertical;margin-bottom:6px}
.kb-row{display:flex;gap:6px}
.kb-addcol{flex:0 0 auto;align-self:flex-start;background:none;border:1px dashed var(--line);color:var(--dim);border-radius:var(--radius);padding:10px 14px;cursor:pointer;font-size:13px}
.kb-addcol:hover{color:var(--ink);border-color:var(--violet)}
.kb-newcol input{width:100%;background:var(--surf2);border:1px solid var(--violet);color:var(--ink);border-radius:8px;padding:8px;font:inherit;margin-bottom:6px}
/* editable */
.kb-editable{cursor:text;border-radius:5px;padding:1px 3px;transition:.12s}
.kb-editable:hover{background:var(--surf2)}
.kb-ph{color:var(--faint)}
.kb-edit{background:var(--surf2);border:1px solid var(--violet);color:var(--ink);border-radius:6px;padding:4px 6px;font:inherit;width:100%}
/* context */
.kb-ctx{flex:0 0 auto;border-top:1px solid var(--line);background:var(--surf);max-height:38%;overflow:auto}
.kb-ctx>summary{cursor:pointer;padding:10px 16px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);list-style:none}
.kb-ctx>summary::-webkit-details-marker{display:none}
.kb-ctx-body{padding:0 16px 16px}
.kb-ctx-body p{color:var(--dim);max-width:70ch}
.kb-reqs{list-style:none;padding:0;margin:8px 0;display:flex;flex-direction:column;gap:4px}
.kb-reqs>li>button{background:none;border:0;color:var(--ink);text-align:left;cursor:pointer;padding:4px 0;font:inherit;border-left:2px solid transparent;padding-left:10px}
.kb-reqs>li.on>button{border-left-color:var(--violet);color:#fff}
/* modal */
.kb-modal-bg{position:fixed;inset:0;z-index:9000;background:rgba(6,8,12,.72);display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(2px)}
.kb-modal{background:var(--surf);border:1px solid var(--line);border-radius:14px;width:min(520px,94vw);max-height:88vh;overflow:auto;padding:18px;box-shadow:0 24px 70px rgba(0,0,0,.6);display:flex;flex-direction:column;gap:10px}
.kb-modal h4{margin:0 0 4px}
.kb-in{background:var(--surf2);border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:9px 11px;font:inherit;width:100%}
.kb-in:focus{outline:none;border-color:var(--violet)}
.kb-in.title{font-size:16px;font-weight:600}
.kb-field{display:flex;flex-direction:column;gap:4px;flex:1}
.kb-field>label{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}
.kb-field-row{display:flex;gap:10px}
.kb-modal-foot{display:flex;align-items:center;gap:8px;margin-top:6px}
/* toast */
.kb-toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:9500;background:var(--surf2);border:1px solid var(--violet);color:var(--ink);border-radius:10px;padding:12px 18px;box-shadow:0 12px 40px rgba(0,0,0,.5);cursor:pointer;font-size:13px}
.kb-board::-webkit-scrollbar,.kb-cards::-webkit-scrollbar{height:9px;width:9px}
.kb-board::-webkit-scrollbar-thumb,.kb-cards::-webkit-scrollbar-thumb{background:var(--line);border-radius:6px}
/* card notes + gate */
.kb-note-dot{font-size:11px;line-height:1;opacity:.85}
.kb-revise{margin:0 0 8px;font-size:11px;line-height:1.35;color:#fca5a5;background:rgba(251,113,133,.10);border:1px solid rgba(251,113,133,.35);border-radius:6px;padding:4px 7px;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.kb-thread{display:flex;flex-direction:column;gap:10px;background:var(--surf2);border:1px solid var(--line);border-radius:8px;padding:10px}
.kb-thread-sec{display:flex;flex-direction:column;gap:5px}
.kb-thread-sec>label{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}
.kb-check{display:flex;gap:8px;align-items:baseline;font-size:12px;line-height:1.4;border-left:2px solid var(--line);padding-left:8px}
.kb-check.pass{border-left-color:#34d399}
.kb-check.fail{border-left-color:#fb7185}
.kb-check-v{font-weight:700;white-space:nowrap}
.kb-check.pass .kb-check-v{color:#34d399}
.kb-check.fail .kb-check-v{color:#fb7185}
.kb-check-note{color:var(--ink);flex:1}
.kb-check-by{font:10px var(--mono);color:var(--dim);white-space:nowrap}
.kb-logline{font-size:12px;line-height:1.45;color:var(--ink)}
.kb-log-by{font:10px var(--mono);color:var(--violet);margin-right:5px}
`}</style>
  );
}
