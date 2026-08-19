import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIR } from "./paths";
import { collectionByKey } from "./collections";
import { getEntryBySlug } from "./content";
import { createEntry, updateEntry } from "./mutations";

/**
 * Whiteboards persist as two paired files in the boards folder:
 *   WB-0001-title.md            — front-matter metadata (a normal collection entry)
 *   WB-0001-title.snapshot.json — the tldraw canvas snapshot
 * Both are plain files in the repo, so every board edit is a Git diff. The
 * snapshot is never scanned as wiki content (only *.md are), and it is
 * path-locked to the boards folder so a bad slug can't write elsewhere.
 */
const BOARDS_FOLDER = collectionByKey("whiteboards")?.folder ?? "10-Whiteboards";
const BOARDS_DIR = path.join(CONTENT_DIR, BOARDS_FOLDER);

function snapshotAbsForRel(relPath: string): string {
  const abs = path.normalize(
    path.join(CONTENT_DIR, relPath.replace(/\.md$/, ".snapshot.json")),
  );
  if (!abs.startsWith(path.normalize(BOARDS_DIR + path.sep))) {
    throw new Error("Refusing to write snapshot outside the boards folder");
  }
  return abs;
}

/** Resolve a board slug to its snapshot path, verifying it is a whiteboard. */
function snapshotPathForSlug(slug: string): string {
  const entry = getEntryBySlug(slug);
  if (!entry) throw new Error(`Board not found: ${slug}`);
  if (entry.collectionKey !== "whiteboards") {
    throw new Error(`Not a whiteboard: ${slug}`);
  }
  return snapshotAbsForRel(entry.relPath);
}

export function readSnapshot(slug: string): unknown | null {
  const p = snapshotPathForSlug(slug);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

export function writeSnapshot(slug: string, snapshot: unknown): void {
  const p = snapshotPathForSlug(slug);
  fs.writeFileSync(p, JSON.stringify(snapshot), "utf8");
  // Stamp `updated` on the metadata file (no-op diff if already today).
  try {
    updateEntry({ slug });
  } catch {
    /* metadata bump is best-effort */
  }
}

export function createBoard(title: string): { slug: string; id?: string } {
  const res = createEntry({
    collectionKey: "whiteboards",
    title: title.trim() || "Untitled board",
    visibility: "internal",
    status: "draft",
  });
  // Initialise an empty snapshot so the paired file exists from the start.
  fs.writeFileSync(snapshotAbsForRel(res.relPath), JSON.stringify({}), "utf8");
  return { slug: res.slug, id: res.id };
}
