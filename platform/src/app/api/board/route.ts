import { NextResponse } from "next/server";
import { createBoard, readSnapshot, writeSnapshot } from "@/lib/boards";

/** GET /api/board?slug=... → { snapshot } (null if the board has no canvas yet). */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }
  try {
    return NextResponse.json({ snapshot: readSnapshot(slug) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "read failed" },
      { status: 404 },
    );
  }
}

/** PUT /api/board  { slug, snapshot } → persist the canvas snapshot to file. */
export async function PUT(req: Request) {
  try {
    const { slug, snapshot } = await req.json();
    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }
    writeSnapshot(slug, snapshot);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "save failed" },
      { status: 500 },
    );
  }
}

/** POST /api/board  { title } → create a new board, returns { slug, id }. */
export async function POST(req: Request) {
  try {
    const { title } = await req.json();
    return NextResponse.json(createBoard(String(title ?? "")));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "create failed" },
      { status: 500 },
    );
  }
}
