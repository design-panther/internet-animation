/**
 * Kanban / timeline control-surface data layer.
 *
 * The board is a JSON file at the repo root (`_kanban/<id>.json`) — the same
 * "file is the source of truth" pattern the wiki uses for Markdown. Agents (the
 * supervisor, operator, critics, the UI/UX reviewer, …) read and write this file
 * directly; the browser polls `/api/kanban` and reflects changes in near-real
 * time. Every write bumps `rev` so clients can tell when the file changed under
 * them.
 */
import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIR } from "./paths";

export const KANBAN_DIR = path.join(CONTENT_DIR, "_kanban");

export type Priority = "urgent" | "high" | "med" | "low";
export const PRIORITIES: Priority[] = ["urgent", "high", "med", "low"];

/** A member of the agent roster — supervisor, operator, a critic, etc. */
export interface Agent {
  id: string;
  name: string;
  /** Free-form role label shown on the chip (e.g. "supervisor", "critic"). */
  role: string;
  /** Hex accent used for the assignee chip + card lane. */
  color: string;
}

/** A dated note appended to a card's activity log (supervisor ⇄ agent comms). */
export interface CardLogEntry {
  ts: string;
  agent: string;
  msg: string;
}

/** A test-gate result recorded against a card. A `fail` sends the card back to
 *  its `reviseColumn` with the note attached for the assigned agent. */
export interface CardCheck {
  ts: string;
  agent: string;
  verdict: "pass" | "fail";
  score: number;
  note: string;
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  /** Short supervisor brief — what this card is and the acceptance bar. */
  details?: string;
  /** What the doer needs to KNOW before starting: sources, prior findings,
   *  constraints, cited data. The supervisor briefs the agent here. */
  researchNotes?: string;
  /** How to DO it: concrete build steps, files, commands, gotchas. */
  buildNotes?: string;
  /** Column to return this card to when a test gate fails (for revision).
   *  Defaults handled by kb.mjs / the UI when unset. */
  reviseColumn?: string;
  /** Agent id this work is delegated to; empty = unassigned. */
  assignee?: string;
  priority?: Priority;
  /** ISO date (yyyy-mm-dd) or datetime; optional. */
  due?: string;
  labels?: string[];
  /** Append-only activity log — the sole supervisor⇄agent comms channel. */
  log?: CardLogEntry[];
  /** Test-gate history; a failing check carries the revision reason. */
  checks?: CardCheck[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  /** Optional WIP limit for the column. */
  wip?: number;
}

export type TimelineKind = "event" | "scheduled" | "loop";

export interface TimelineItem {
  id: string;
  label: string;
  /** ISO datetime. */
  start: string;
  end?: string;
  details?: string;
  /** `event` = one-off, `scheduled` = recurring cron-ish task, `loop` = a
   *  post-evaluation revision loop. */
  kind: TimelineKind;
  /** Human recurrence for scheduled/loop items, e.g. "every 30m", "daily 09:00". */
  recurrence?: string;
  /** Agent id this scheduled task notifies / is owned by (e.g. "ui-ux"). */
  agent?: string;
  /** Links a timeline item back to a card. */
  cardId?: string;
  notified?: boolean;
}

export interface Requirement {
  id: string;
  text: string;
  details?: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  requirements: Requirement[];
  columns: Column[];
  cards: Card[];
  timeline: TimelineItem[];
  agents: Agent[];
  /** Monotonic revision — bumped on every write for change detection. */
  rev: number;
  updatedAt: string;
}

const ID = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

/** The default control board, reflecting the agent-orchestration system. */
export function seedBoard(id = "control-board"): Board {
  const now = new Date().toISOString();
  const agents: Agent[] = [
    { id: "supervisor", name: "Supervisor", role: "supervisor", color: "#7c5cff" },
    { id: "operator", name: "Operator", role: "operator", color: "#38bdf8" },
    { id: "critic", name: "Critic", role: "critic", color: "#fb7185" },
    { id: "ui-ux", name: "UI/UX Reviewer", role: "ui-ux", color: "#34d399" },
    { id: "researcher", name: "Researcher", role: "researcher", color: "#fbbf24" },
    { id: "editor", name: "Editor", role: "editor", color: "#c084fc" },
  ];
  const columns: Column[] = [
    { id: "backlog", title: "Backlog", order: 0 },
    { id: "todo", title: "Ready", order: 1 },
    { id: "doing", title: "In Progress", order: 2, wip: 4 },
    { id: "review", title: "In Review", order: 3 },
    { id: "done", title: "Done", order: 4 },
  ];
  const cards: Card[] = [
    { id: ID("card"), columnId: "backlog", title: "UI mockups and wireframes", assignee: "ui-ux", priority: "med", order: 0, createdAt: now, updatedAt: now },
    { id: ID("card"), columnId: "backlog", title: "Real-time synchronization setup", assignee: "operator", priority: "high", order: 1, createdAt: now, updatedAt: now },
    {
      id: ID("card"), columnId: "doing", title: "Database schema design", assignee: "operator", priority: "high",
      reviseColumn: "doing", order: 0, createdAt: now, updatedAt: now,
      details: "Design the persistence schema. Acceptance: normalized, migrations reversible, reviewed by critic.",
      researchNotes: "What to know before starting: existing entities and their relationships; the query patterns the app actually runs; any constraints from upstream sources. Cite the specific files/tables you inspected.",
      buildNotes: "How to build it: write migrations under db/migrations, one concern per migration; keep them reversible; note any gotchas (enum changes, backfills) here for the reviewer.",
    },
  ];
  return {
    id,
    title: "Agent Control Board",
    description:
      "Coordination surface for the agent system. The supervisor generates and delegates work here; operators, critics, and the UI/UX reviewer pull their assigned cards. Scheduled tasks and post-evaluation revision loops appear on the timeline.",
    requirements: [
      { id: ID("req"), text: "Supervisor generates and delegates all tasks and board movement." },
      { id: ID("req"), text: "Supervisor communicates with agents SOLELY through card notes — research notes, build notes, and the activity log. No side channels." },
      { id: ID("req"), text: "Every actionable card carries research notes (what to know) and build notes (how to do it) before it is assigned." },
      { id: ID("req"), text: "Agents pull their assigned work from the board and read its notes before acting." },
      { id: ID("req"), text: "A failed test gate returns the card to its revision column with the failure reason attached for the assignee." },
      { id: ID("req"), text: "Board updates in real time as the file changes." },
      { id: ID("req"), text: "Repeated scheduled tasks live on the timeline." },
      { id: ID("req"), text: "Looping revisions after evaluation are tracked on the timeline." },
      { id: ID("req"), text: "Droppable into the whiteboard as a control surface." },
    ],
    timeline: [
      { id: ID("tl"), label: "Nightly showcase deploy", start: iso(9, 0), kind: "scheduled", recurrence: "daily 09:00" },
      {
        id: ID("tl"), label: "UI/UX audit", start: iso(5, 0), kind: "scheduled", recurrence: "daily 14:00", agent: "ui-ux",
        details: "Notify the UI/UX reviewer to sweep for UI/UX issues: overlapping or clipped text (esp. in animations), broken mobile layout, stale CSS, scroll/continuity bugs, and visibility leaks. File a card per issue with a repro and route it to the owning agent.",
      },
      { id: ID("tl"), label: "UI/UX review loop", start: iso(2, 0), kind: "loop", recurrence: "after each evaluation", agent: "ui-ux" },
    ],
    columns,
    cards,
    agents,
    rev: 1,
    updatedAt: now,
  };
}

function iso(hoursFromNow: number, min: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow, min, 0, 0);
  return d.toISOString();
}

export function boardPath(id: string): string {
  const safe = id.replace(/[^a-z0-9_-]/gi, "");
  return path.join(KANBAN_DIR, `${safe}.json`);
}

export function readBoard(id: string): Board {
  const p = boardPath(id);
  if (!fs.existsSync(p)) {
    const seeded = seedBoard(id);
    writeBoard(seeded);
    return seeded;
  }
  return JSON.parse(fs.readFileSync(p, "utf8")) as Board;
}

export function writeBoard(board: Board): Board {
  fs.mkdirSync(KANBAN_DIR, { recursive: true });
  board.updatedAt = new Date().toISOString();
  fs.writeFileSync(boardPath(board.id), JSON.stringify(board, null, 2) + "\n", "utf8");
  return board;
}

export function listBoards(): string[] {
  if (!fs.existsSync(KANBAN_DIR)) return [];
  return fs
    .readdirSync(KANBAN_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}
