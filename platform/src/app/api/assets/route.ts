import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { ATTACHMENTS_DIR } from "@/lib/paths";
import { getAllEntries } from "@/lib/content";

/**
 * Enumerate repo assets that can be placed on a whiteboard "by finding in the
 * file system": images/scans + local HTML animations + the viewer-rig library
 * + wiki documents. Nothing internal is exposed that isn't already reachable
 * via /api/attachments.
 */

const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"]);

/** Where the viewer rig runs (for the server-side proxy fetch only). */
const RIG_URL = (process.env.VIEWER_RIG_URL ?? "http://localhost:3000").replace(/\/$/, "");

interface RigLibraryItem {
  slug: string;
  name?: string;
  html: string; // rig-relative, e.g. /library/<slug>.html
  thumbnail: string; // rig-relative, e.g. /thumbnails/<slug>.png?v=...
}

interface AnimationItem {
  source: "local" | "rig";
  name: string;
  url?: string; // local: same-origin html path
  slug?: string; // rig
  htmlPath?: string; // rig-relative html
  thumbnailPath?: string; // rig-relative thumbnail
}

function listDir(abs: string): string[] {
  try {
    return fs.readdirSync(abs).filter((n) => !n.startsWith("."));
  } catch {
    return [];
  }
}

export async function GET() {
  const images: { name: string; url: string }[] = [];
  for (const sub of ["images", "scans"] as const) {
    for (const name of listDir(path.join(ATTACHMENTS_DIR, sub))) {
      if (IMG_EXT.has(path.extname(name).toLowerCase())) {
        images.push({
          name,
          url: `/api/attachments/${sub}/${encodeURIComponent(name)}`,
        });
      }
    }
  }

  // Local animations: any HTML dropped into platform/public/branding.
  const animations: AnimationItem[] = [];
  for (const name of listDir(path.join(process.cwd(), "public", "branding"))) {
    if (name.endsWith(".html")) {
      animations.push({ source: "local", name: name.replace(/\.html$/, ""), url: `/branding/${name}` });
    }
  }

  // Bridge to the viewer rig (fancy_presentation/viewer-rig on :3000). We proxy
  // its /api/library server-side (no CORS); the browser then loads the thumbnail
  // images and animation HTML directly from the rig origin. Paths are returned
  // rig-relative so the client can prefix the correct host (localhost on desktop,
  // the Mac's LAN IP when the board is opened from the iPad).
  let rigOnline = false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(`${RIG_URL}/api/library`, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(t);
    if (res.ok) {
      const data = (await res.json()) as { library?: RigLibraryItem[] };
      for (const a of data.library ?? []) {
        animations.push({
          source: "rig",
          name: a.name ?? a.slug,
          slug: a.slug,
          htmlPath: a.html,
          thumbnailPath: a.thumbnail,
        });
      }
      rigOnline = true;
    }
  } catch {
    rigOnline = false;
  }

  const docs = getAllEntries()
    .filter((e) => !e.isIndex)
    .map((e) => ({ title: e.title, slug: e.slug, id: e.id, type: e.type }));

  return NextResponse.json({ images, animations, docs, rigOnline });
}
