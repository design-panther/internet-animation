import CalendarView from "@/components/CalendarView";

export const dynamic = "force-dynamic";

/**
 * The shared class/project calendar. Everyone with platform access — the
 * instructor and students alike — can add and edit events; the file
 * `_calendar/class-calendar.json` at the repo root is the source of truth.
 */
export default function CalendarPage() {
  return <CalendarView calendarId="class-calendar" />;
}
