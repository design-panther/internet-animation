import { NextRequest, NextResponse } from "next/server";
import { readCalendar, writeCalendar, type CalendarDoc } from "@/lib/calendar";

export const dynamic = "force-dynamic";

/** GET /api/calendar?id=<id>  → the calendar JSON (seeds an empty one on first read). */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || "class-calendar";
  try {
    return NextResponse.json(readCalendar(id));
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message) }, { status: 500 });
  }
}

/** PUT /api/calendar  body: CalendarDoc  → persists it and returns the saved doc.
 *  Last-write-wins: the server bumps `rev` past whatever it currently holds so
 *  every writer ends up with a fresh, monotonically-increasing revision that
 *  polling clients use to detect changes. */
export async function PUT(req: NextRequest) {
  let incoming: CalendarDoc;
  try {
    incoming = (await req.json()) as CalendarDoc;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!incoming?.id || !Array.isArray(incoming.events)) {
    return NextResponse.json({ error: "malformed calendar" }, { status: 400 });
  }
  let currentRev = 0;
  try {
    currentRev = readCalendar(incoming.id).rev || 0;
  } catch {
    /* first write */
  }
  incoming.rev = Math.max(currentRev, incoming.rev || 0) + 1;
  const saved = writeCalendar(incoming);
  return NextResponse.json(saved);
}
