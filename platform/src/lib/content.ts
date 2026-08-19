import fs from "node:fs";
import path from "node:path";
import { parseMatter } from "./frontmatter";
import { CONTENT_DIR, ATTACHMENTS_DIR, IGNORE_DIRS, isTemplateFile } from "./paths";
import {
  COLLECTIONS,
  LAYERS,
  collectionByFolder,
  type Collection,
  type LayerKey,
} from "./collections";

export interface Entry {
  /** relative path from content root, e.g. "01-Concept/Thesis-and-Abstract.md" */
  relPath: string;
  /** url slug = relPath without ".md", e.g. "01-Concept/Thesis-and-Abstract" */
  slug: string;
  basename: string; // file name without extension
  title: string;
  // front-matter (all optional; files vary)
  id?: string;
  type: string;
  status?: string;
  visibility?: string;
  owner?: string;
  created?: string;
  updated?: string;
  tags: string[];
  related: string[];
  verify: boolean;
  data: Record<string, unknown>; // full raw front-matter
  body: string;
  // derived
  collectionKey?: string;
  layer: LayerKey;
  isIndex: boolean;
}

function topFolder(relPath: string): string {
  return relPath.split(path.sep)[0];
}

function layerForFolder(folder: string): LayerKey {
  const l = LAYERS.find((x) => x.folder === folder);
  if (l) return l.key;
  return "meta";
}

function walk(dir: string, acc: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (e.name.startsWith(".") && e.name !== ".") continue;
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      walk(path.join(dir, e.name), acc);
    } else if (e.isFile() && e.name.endsWith(".md") && !isTemplateFile(e.name)) {
      acc.push(path.join(dir, e.name));
    }
  }
  return acc;
}

/**
 * Parse cache keyed on file mtime — unchanged files are never re-parsed, so
 * navigation stays fast as the content set grows. Edits still reflect (mtime
 * changes → re-parse). getAllEntries() is called several times per request.
 */
const _parseCache = new Map<string, { mtime: number; entry: Entry }>();

function toEntry(absPath: string): Entry {
  let mtime = 0;
  try {
    mtime = fs.statSync(absPath).mtimeMs;
  } catch {
    /* fall through to a fresh read */
  }
  const cached = _parseCache.get(absPath);
  if (cached && cached.mtime === mtime) return cached.entry;

  const raw = fs.readFileSync(absPath, "utf8");
  const parsed = parseMatter(raw);
  const data = parsed.data as Record<string, unknown>;
  const relPath = path.relative(CONTENT_DIR, absPath);
  const basename = path.basename(relPath, ".md");
  const folderRel = path.dirname(relPath);
  const collection = collectionByFolder(folderRel);

  const tags = Array.isArray(data.tags) ? (data.tags as unknown[]).map(String) : [];
  const related = Array.isArray(data.related)
    ? (data.related as unknown[]).map(String)
    : [];

  const entry: Entry = {
    relPath,
    slug: relPath.replace(/\.md$/, "").split(path.sep).join("/"),
    basename,
    title: (data.title as string) || prettifyName(basename),
    id: data.id ? String(data.id) : undefined,
    type: (data.type as string) || (collection ? collection.type : "document"),
    status: data.status ? String(data.status) : undefined,
    visibility: data.visibility ? String(data.visibility) : undefined,
    owner: data.owner ? String(data.owner) : undefined,
    created: data.created ? String(data.created) : undefined,
    updated: data.updated ? String(data.updated) : undefined,
    tags,
    related,
    verify: data.verify === true,
    data,
    body: parsed.content.trim(),
    collectionKey: collection?.key,
    layer: collection ? collection.layer : layerForFolder(topFolder(relPath)),
    isIndex: basename === "_index",
  };
  _parseCache.set(absPath, { mtime, entry });
  return entry;
}

function prettifyName(name: string): string {
  return name.replace(/^_/, "").replace(/-/g, " ");
}

// ---------------------------------------------------------------------------
// Index (re-scanned each call; content set is small. Cheap and always fresh.)
// ---------------------------------------------------------------------------

export function getAllEntries(): Entry[] {
  return walk(CONTENT_DIR)
    .map(toEntry)
    .sort((a, b) => a.relPath.localeCompare(b.relPath));
}

export function getEntryBySlug(slug: string): Entry | undefined {
  const target = slug.replace(/^\/+|\/+$/g, "");
  return getAllEntries().find((e) => e.slug === target);
}

export function getEntriesForCollection(key: string): Entry[] {
  return getAllEntries()
    .filter((e) => e.collectionKey === key && !e.isIndex)
    .sort((a, b) => (a.id || "").localeCompare(b.id || ""));
}

export function getVerifyQueue(): Entry[] {
  return getAllEntries()
    .filter((e) => e.verify)
    .sort((a, b) => (b.updated || "").localeCompare(a.updated || ""));
}

export function getRecent(limit = 8): Entry[] {
  return getAllEntries()
    .filter((e) => e.updated)
    .sort((a, b) => (b.updated || "").localeCompare(a.updated || ""))
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Wikilink resolution: [[Target|Label]] / [[Target]] -> internal href
// ---------------------------------------------------------------------------

export interface ResolvedLink {
  href: string;
  resolved: boolean;
}

export function resolveWikiTarget(target: string, entries: Entry[]): ResolvedLink {
  // strip ./ ../ and trailing .md, normalise slashes
  let t = target.trim().replace(/\\/g, "/").replace(/\.md$/i, "");
  t = t.replace(/^(\.\.\/|\.\/)+/, "");
  const last = t.split("/").pop()!;
  // normalize: case-insensitive, spaces/underscores == hyphens
  const norm = (s: string) => s.toLowerCase().replace(/[\s_]+/g, "-");
  const nlast = norm(last);
  const hit =
    entries.find((e) => e.slug === t) ||
    entries.find((e) => e.slug.endsWith("/" + t)) ||
    entries.find((e) => e.basename === last) ||
    // space/hyphen/case-insensitive basename (e.g. "Strength of Evidence")
    entries.find((e) => norm(e.basename) === nlast) ||
    // a section/collection name → that folder's _index (strip leading "NN-")
    entries.find(
      (e) =>
        e.isIndex &&
        norm((e.slug.split("/").slice(-2, -1)[0] ?? "").replace(/^\d+-/, "")) === nlast,
    );
  if (hit) return { href: "/wiki/" + hit.slug, resolved: true };
  return { href: "#unresolved:" + target.trim(), resolved: false };
}

/**
 * Pre-process a markdown body: convert wikilinks to standard markdown links,
 * leaving fenced code blocks untouched. Returns markdown ready for react-markdown.
 */
export function preprocessWikilinks(body: string, entries: Entry[]): string {
  const segments = body.split(/(```[\s\S]*?```)/g);
  return segments
    .map((seg) => {
      if (seg.startsWith("```")) return seg; // code fence — leave as-is
      return seg.replace(/\[\[([^\]]+)\]\]/g, (_m, inner: string) => {
        const [rawTarget, rawLabel] = inner.split("|");
        const label = (rawLabel ?? rawTarget).trim();
        const { href } = resolveWikiTarget(rawTarget, entries);
        // escape closing paren in label/href is unnecessary for our content
        return `[${label}](${href})`;
      });
    })
    .join("");
}

// ---------------------------------------------------------------------------
// Blog index: auto-generate the landing's card grid from the posts on disk
// ---------------------------------------------------------------------------
// The Blog landing (11-Blog/_index.md) carries a `<!--blog-cards-->` token
// instead of a hand-written grid. We expand it from whatever posts live in
// 11-Blog/, driven by each post's blog_* front-matter — so adding a post
// surfaces a card automatically and the landing never drifts. The showcase
// generator (showcase/build.mjs) mirrors this exact logic.

const BLOG_FOLDER = "11-Blog";
const BLOG_TOKEN = "<!--blog-cards-->";

function escText(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);
}

function blogOrderOf(e: Entry): number {
  const n = Number(e.data.blog_order);
  return Number.isFinite(n) ? n : 999;
}

export function blogCardsMarkdown(entries: Entry[]): string {
  const posts = entries
    .filter((e) => e.slug.split("/")[0] === BLOG_FOLDER && !e.isIndex)
    .sort((a, b) => blogOrderOf(a) - blogOrderOf(b) || a.title.localeCompare(b.title));
  const cards = posts
    .map((e) => {
      const accent = e.data.blog_accent ? String(e.data.blog_accent) : "#c2410c";
      const kicker = e.data.blog_kicker
        ? `<p class="num">${escText(String(e.data.blog_kicker))}</p>\n`
        : "";
      const summary = escText(String(e.data.blog_summary ?? e.data.description ?? ""));
      return `<div class="blog-card" style="--blog-accent: ${accent}">\n${kicker}\n### [[${e.basename}|${e.title}]]\n\n<p>${summary}</p>\n</div>`;
    })
    .join("\n\n");
  return `<div class="blog-cards">\n\n${cards}\n\n</div>`;
}

/** Expand the `<!--blog-cards-->` token in a body (no-op if absent). */
export function injectBlogCards(body: string, entries: Entry[]): string {
  return body.includes(BLOG_TOKEN) ? body.split(BLOG_TOKEN).join(blogCardsMarkdown(entries)) : body;
}

// ---------------------------------------------------------------------------
// Attachments belonging to an entry (by ID prefix, e.g. CS-0001-*)
// ---------------------------------------------------------------------------

export interface Attachment {
  kind: "image" | "audio" | "scan" | "other";
  name: string;
  url: string; // served via /api/attachments/...
}

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"]);
const AUDIO_EXT = new Set([".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"]);

export function getAttachmentsForId(id?: string): Attachment[] {
  if (!id) return [];
  const out: Attachment[] = [];
  for (const sub of ["images", "audio", "scans"] as const) {
    const dir = path.join(ATTACHMENTS_DIR, sub);
    let names: string[] = [];
    try {
      names = fs.readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of names) {
      if (!name.startsWith(id)) continue;
      const ext = path.extname(name).toLowerCase();
      const kind: Attachment["kind"] = IMAGE_EXT.has(ext)
        ? "image"
        : AUDIO_EXT.has(ext)
          ? "audio"
          : sub === "scans"
            ? "scan"
            : "other";
      out.push({ kind, name, url: `/api/attachments/${sub}/${encodeURIComponent(name)}` });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Navigation tree for the sidebar
// ---------------------------------------------------------------------------

export interface NavCollection {
  key: string;
  label: string;
  count: number;
}
export interface NavSection {
  key: LayerKey;
  label: string;
  glyph: string;
  accent: string;
  docs: { slug: string; title: string }[];
  collections: NavCollection[];
}

export function getNav(): NavSection[] {
  const entries = getAllEntries();
  return LAYERS.map((layer) => {
    const docs = entries
      .filter((e) => e.layer === layer.key && !e.collectionKey)
      .map((e) => ({
        slug: e.slug,
        title: e.isIndex ? `${layer.label} — overview` : e.title,
        isIndex: e.isIndex,
      }))
      .sort((a, b) => Number(b.isIndex) - Number(a.isIndex) || a.title.localeCompare(b.title))
      .map(({ slug, title }) => ({ slug, title }));
    const collections: NavCollection[] = COLLECTIONS.filter((c) => c.layer === layer.key).map(
      (c) => ({
        key: c.key,
        label: c.label,
        count: entries.filter((e) => e.collectionKey === c.key && !e.isIndex).length,
      }),
    );
    return {
      key: layer.key,
      label: layer.label,
      glyph: layer.glyph,
      accent: layer.accent,
      docs,
      collections,
    };
  });
}

// ---------------------------------------------------------------------------
// Counts for the dashboard
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Map: sourcing sites with coordinates + their linked clay samples
// ---------------------------------------------------------------------------

export interface MapSampleRef {
  id?: string;
  title: string;
  slug: string;
}
export interface MapSite {
  id?: string;
  slug: string;
  title: string;
  lat: number;
  lng: number;
  status?: string;
  visibility?: string;
  verify: boolean;
  land_status: string;
  permission: string;
  county: string;
  watershed: string;
  provenance: string;
  contact: string;
  samples: MapSampleRef[];
}

function asStr(v: unknown): string {
  return v == null ? "" : String(v);
}
function asNum(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

/** Sites that have valid lat/lng, with the clay samples collected there. */
export function getMapSites(): MapSite[] {
  const all = getAllEntries();
  const samples = all.filter((e) => e.collectionKey === "clay-samples" && !e.isIndex);
  return all
    .filter((e) => e.collectionKey === "sourcing-sites" && !e.isIndex)
    .map((site) => {
      const lat = asNum(site.data.lat);
      const lng = asNum(site.data.lng);
      if (lat === null || lng === null) return null;
      const linked = samples
        .filter((s) => {
          const ref = asStr(s.data.source_site) + " " + s.related.join(" ");
          return (
            (site.id && ref.includes(site.id)) ||
            ref.includes(site.slug) ||
            ref.includes(site.title)
          );
        })
        .map((s) => ({ id: s.id, title: s.title, slug: s.slug }));
      return {
        id: site.id,
        slug: site.slug,
        title: site.title,
        lat,
        lng,
        status: site.status,
        visibility: site.visibility,
        verify: site.verify,
        land_status: asStr(site.data.land_status),
        permission: asStr(site.data.permission),
        county: asStr(site.data.county),
        watershed: asStr(site.data.watershed),
        provenance: asStr(site.data.provenance),
        contact: asStr(site.data.contact),
        samples: linked,
      } as MapSite;
    })
    .filter((x): x is MapSite => x !== null);
}

export interface CollectionStat {
  collection: Collection;
  count: number;
}

export function getCollectionStats(): CollectionStat[] {
  const entries = getAllEntries();
  return COLLECTIONS.map((collection) => ({
    collection,
    count: entries.filter((e) => e.collectionKey === collection.key && !e.isIndex).length,
  }));
}
