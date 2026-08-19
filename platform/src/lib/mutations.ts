import fs from "node:fs";
import path from "node:path";
import { parseMatter, stringifyMatter } from "./frontmatter";
import { CONTENT_DIR } from "./paths";
import { collectionByKey } from "./collections";
import { getAllEntries, getEntryBySlug, type Entry } from "./content";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Compute the next free ID for a collection by scanning existing files. */
export function nextId(collectionKey: string): string {
  const col = collectionByKey(collectionKey);
  if (!col) throw new Error(`Unknown collection: ${collectionKey}`);
  const re = new RegExp(`^${col.prefix}-(\\d+)$`);
  let max = 0;
  for (const e of getAllEntries()) {
    if (e.collectionKey !== collectionKey || !e.id) continue;
    const m = e.id.match(re);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${col.prefix}-${String(max + 1).padStart(4, "0")}`;
}

/** Read a collection's `_TEMPLATE-*.md` body (front-matter stripped) for prefill. */
export function getTemplateBody(collectionKey: string, id: string): string {
  const col = collectionByKey(collectionKey);
  if (!col) return "";
  const dir = path.join(CONTENT_DIR, col.folder);
  let file: string | undefined;
  try {
    file = fs.readdirSync(dir).find((n) => n.startsWith("_TEMPLATE-"));
  } catch {
    return "";
  }
  if (!file) return "";
  const raw = fs.readFileSync(path.join(dir, file), "utf8");
  const parsed = parseMatter(raw);
  return parsed.content
    .trim()
    .replace(new RegExp(`${col.prefix}-NNNN`, "g"), id)
    .replace(/\{\{title\}\}/g, "");
}

export interface CreateInput {
  collectionKey: string;
  title: string;
  owner?: string;
  visibility?: string;
  status?: string;
  tags?: string[];
  verify?: boolean;
  body?: string;
  /** extra structured front-matter (e.g. lat, lng, land_status) */
  fields?: Record<string, unknown>;
}

export interface WriteResult {
  slug: string;
  relPath: string;
  id?: string;
}

/** Create a new collection entry as a new Markdown file. Returns its slug. */
export function createEntry(input: CreateInput): WriteResult {
  const col = collectionByKey(input.collectionKey);
  if (!col) throw new Error(`Unknown collection: ${input.collectionKey}`);
  const id = nextId(input.collectionKey);
  const slug = slugify(input.title) || "untitled";
  const fileName = `${id}-${slug}.md`;
  const relPath = path.join(col.folder, fileName);
  const absPath = path.join(CONTENT_DIR, relPath);
  if (fs.existsSync(absPath)) throw new Error(`File already exists: ${relPath}`);

  const data: Record<string, unknown> = {
    id,
    title: input.title,
    type: col.type,
    status: input.status || "draft",
    visibility: input.visibility || "internal",
    owner: input.owner || "",
    created: today(),
    updated: today(),
    tags: input.tags ?? [],
    related: [],
    verify: input.verify ?? false,
    ...(input.fields ?? {}),
  };
  const body = input.body?.trim() || `# ${input.title} — \`${id}\`\n`;
  const file = stringifyMatter("\n" + body + "\n", data);
  fs.writeFileSync(absPath, file, "utf8");
  return { slug: relPath.replace(/\.md$/, "").split(path.sep).join("/"), relPath, id };
}

export interface UpdateInput {
  slug: string;
  title?: string;
  status?: string;
  visibility?: string;
  owner?: string;
  tags?: string[];
  related?: string[];
  verify?: boolean;
  body?: string;
  /** extra structured front-matter to merge (e.g. lat, lng, land_status) */
  fields?: Record<string, unknown>;
}

/** Update an existing page's front-matter and/or body in place. */
export function updateEntry(input: UpdateInput): WriteResult {
  const entry = getEntryBySlug(input.slug);
  if (!entry) throw new Error(`Not found: ${input.slug}`);
  const absPath = path.join(CONTENT_DIR, entry.relPath);

  const data = { ...entry.data } as Record<string, unknown>;
  if (input.title !== undefined) data.title = input.title;
  if (input.status !== undefined) data.status = input.status;
  if (input.visibility !== undefined) data.visibility = input.visibility;
  if (input.owner !== undefined) data.owner = input.owner;
  if (input.tags !== undefined) data.tags = input.tags;
  if (input.related !== undefined) data.related = input.related;
  if (input.verify !== undefined) data.verify = input.verify;
  if (input.fields) {
    for (const [k, v] of Object.entries(input.fields)) {
      if (v === null) delete data[k];
      else data[k] = v;
    }
  }
  data.updated = today();

  const body = input.body !== undefined ? input.body.trim() : entry.body;
  const file = stringifyMatter("\n" + body + "\n", data);
  fs.writeFileSync(absPath, file, "utf8");
  return { slug: entry.slug, relPath: entry.relPath, id: entry.id };
}

export type { Entry };
