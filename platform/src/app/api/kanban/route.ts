import { NextRequest, NextResponse } from "next/server";
import { readBoard, writeBoard, listBoards, type Board } from "@/lib/kanban";

export const dynamic = "force-dynamic";

/** GET /api/kanban?board=<id>  → the board JSON.
 *  GET /api/kanban?list=1      → { boards: string[] }. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  if (sp.get("list")) {
    return NextResponse.json({ boards: listBoards() });
  }
  const id = sp.get("board") || "control-board";
  try {
    return NextResponse.json(readBoard(id));
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message) }, { status: 500 });
  }
}

/** PUT /api/kanban  body: Board  → persists it and returns the saved board.
 *  Last-write-wins: the server bumps `rev` past whatever it currently holds so
 *  every writer (UI or agent) ends up with a fresh, monotonically-increasing
 *  revision that polling clients use to detect changes. */
export async function PUT(req: NextRequest) {
  let incoming: Board;
  try {
    incoming = (await req.json()) as Board;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!incoming?.id || !Array.isArray(incoming.columns) || !Array.isArray(incoming.cards)) {
    return NextResponse.json({ error: "malformed board" }, { status: 400 });
  }
  let currentRev = 0;
  try {
    currentRev = readBoard(incoming.id).rev || 0;
  } catch {
    /* first write */
  }
  incoming.rev = Math.max(currentRev, incoming.rev || 0) + 1;
  const saved = writeBoard(incoming);
  return NextResponse.json(saved);
}
