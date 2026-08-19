/**
 * Shared class/project calendar data layer.
 *
 * The calendar is a JSON file at the repo root (`_calendar/<id>.json`) — the
 * same "file is the source of truth" pattern the wiki uses for Markdown and the
 * kanban board. Anyone with access to the platform (the instructor AND
 * students over the LAN) can add or edit events through `/calendar`; the
 * browser polls `/api/calendar` and reflects changes in near-real time. Every
 * write bumps `rev` so clients can tell when the file changed under them.
 *
 * Unlike `_kanban` (runtime, gitignored) the calendar file is meant to be
 * COMMITTED — a static showcase build can render a read-only copy of it.
 */
import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIR } from "./paths";

export const CALENDAR_DIR = path.join(CONTENT_DIR, "_calendar");

export type CalCategory = "class" | "due" | "critique" | "studio" | "event" | "note";

export const CATEGORIES: { key: CalCategory; label: string; color: string }[] = [
  { key: "class",    label: "Class / topic",  color: "#60a5fa" },
  { key: "due",      label: "Due date",       color: "#fb7185" },
  { key: "critique", label: "Critique",       color: "#f59e0b" },
  { key: "studio",   label: "Studio / lab",   color: "#34d399" },
  { key: "event",    label: "Event",          color: "#22d3ee" },
  { key: "note",     label: "Note",           color: "#94a3b8" },
];

export interface CalEvent {
  id: string;
  title: string;
  /** ISO date YYYY-MM-DD (inclusive). */
  start: string;
  /** Optional ISO end date YYYY-MM-DD (inclusive) for multi-day spans. */
  end?: string;
  /** Optional human time label, e.g. "8:00–9:15am". */
  time?: string;
  category: CalCategory;
  details?: string;
  link?: string;
  /** Who added/last edited it — free text, honor system. */
  addedBy?: string;
  ts?: string;
}

export interface CalendarDoc {
  id: string;
  rev: number;
  /** Display label, e.g. "Fall 2026". */
  semester: string;
  /** One-line standing note shown under the calendar header. */
  note?: string;
  events: CalEvent[];
}

function fileFor(id: string): string {
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(CALENDAR_DIR, `${safe || "class-calendar"}.json`);
}

export function seedCalendar(id: string): CalendarDoc {
  return {
    id,
    rev: 1,
    semester: "Semester",
    note: "Anyone in the class can add events — click a day to add, click an event to edit.",
    events: [],
  };
}

export function readCalendar(id = "class-calendar"): CalendarDoc {
  const f = fileFor(id);
  if (!fs.existsSync(f)) {
    const doc = seedCalendar(id);
    writeCalendar(doc);
    return doc;
  }
  return JSON.parse(fs.readFileSync(f, "utf8")) as CalendarDoc;
}

export function writeCalendar(doc: CalendarDoc): CalendarDoc {
  fs.mkdirSync(CALENDAR_DIR, { recursive: true });
  fs.writeFileSync(fileFor(doc.id), JSON.stringify(doc, null, 2) + "\n", "utf8");
  return doc;
}
