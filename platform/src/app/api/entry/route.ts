import { NextResponse } from "next/server";
import { createEntry, updateEntry } from "@/lib/mutations";
import { getEntryBySlug } from "@/lib/content";

/** GET /api/entry?slug=... → { slug, title, body } (for inline doc editing). */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }
  const entry = getEntryBySlug(slug);
  if (!entry) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ slug: entry.slug, title: entry.title, body: entry.body });
}

/** Coerce known geo fields to numbers so they serialize as YAML numbers. */
function normalizeFields(fields: unknown): Record<string, unknown> | undefined {
  if (!fields || typeof fields !== "object") return undefined;
  const out: Record<string, unknown> = { ...(fields as Record<string, unknown>) };
  for (const k of ["lat", "lng"]) {
    if (k in out && out[k] !== null && out[k] !== "") {
      const n = parseFloat(String(out[k]));
      out[k] = Number.isFinite(n) ? n : null;
    }
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.collectionKey || !body.title?.trim()) {
      return NextResponse.json(
        { error: "collectionKey and title are required" },
        { status: 400 },
      );
    }
    const result = createEntry({
      collectionKey: body.collectionKey,
      title: body.title.trim(),
      owner: body.owner,
      visibility: body.visibility,
      status: body.status,
      tags: body.tags,
      verify: body.verify,
      body: body.body,
      fields: normalizeFields(body.fields),
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "create failed" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }
    const result = updateEntry({
      slug: body.slug,
      title: body.title,
      status: body.status,
      visibility: body.visibility,
      owner: body.owner,
      tags: body.tags,
      related: body.related,
      verify: body.verify,
      body: body.body,
      fields: normalizeFields(body.fields),
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "update failed" },
      { status: 500 },
    );
  }
}
