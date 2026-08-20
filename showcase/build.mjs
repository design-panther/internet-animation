// Static showcase generator.
// Reads the wiki's `visibility: public` Markdown pages (minus process/meta docs),
// strips internal references, and emits a clean static site to ./dist for
// Firebase Hosting. NOTHING internal (GPS, permissions, budget) is ever read in.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, ".."); // showcase/ lives in the repo root
const DIST = path.join(__dirname, "dist");

// Content-hash of styles.css → cache-bust query, so a redeploy never serves a
// stale stylesheet (Firebase caches css for an hour). Changes only when CSS changes.
const STYLES_VER = crypto
  .createHash("md5")
  .update(fs.readFileSync(path.join(__dirname, "styles.css")))
  .digest("hex")
  .slice(0, 8);

const IGNORE_DIRS = new Set([
  "platform",
  "showcase",
  "node_modules",
  ".git",
  ".next",
  "_attachments",
  "_templates",
]);

// Public pages we still DON'T show publicly: internal process/meta docs.
const EXCLUDE_BASENAMES = new Set([
  "README",
  "STRUCTURE",
  "CONTRIBUTING",
  "How-To-Edit",
  "Tag-Dictionary",
  "Naming-Conventions",
  "ID-Registry",
]);

// Collection folders — their internal entries stay private; only their _index is
// suppressed here. (Learning-Resources is the exception: its public RES entries
// ARE published — that's the point — so it is deliberately NOT excluded.)
const COLLECTION_FOLDERS = new Set([]);

const SECTIONS = [
  { key: "00-Start-Here", label: "Start Here", glyph: "◆", accent: "#7c8698" },
  { key: "01-Syllabus", label: "Syllabus", glyph: "❡", accent: "#2563eb" },
  { key: "02-Schedule", label: "Schedule", glyph: "⧗", accent: "#b45309" },
  { key: "03-Projects", label: "Projects", glyph: "✦", accent: "#e11d48" },
  { key: "04-Resources", label: "Resources", glyph: "❋", accent: "#0e7490" },
  { key: "05-Toolbox", label: "Toolbox", glyph: "⚒", accent: "#047857" },
  { key: "06-Reference", label: "Reference", glyph: "§", accent: "#64748b" },
  { key: "11-Blog", label: "Blog", glyph: "✍", accent: "#db2777" },
];

const md = new MarkdownIt({ html: true, linkify: true, breaks: false });

// --- scan ------------------------------------------------------------------
function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      walk(path.join(dir, e.name), acc);
    } else if (e.isFile() && e.name.endsWith(".md") && !e.name.startsWith("_TEMPLATE-")) {
      acc.push(path.join(dir, e.name));
    }
  }
  return acc;
}

function loadPages() {
  const pages = [];
  for (const abs of walk(CONTENT_DIR)) {
    const raw = fs.readFileSync(abs, "utf8");
    const { data, content } = matter(raw);
    if (data.visibility !== "public") continue;
    const rel = path.relative(CONTENT_DIR, abs);
    const basename = path.basename(rel, ".md");
    const folder = path.dirname(rel);
    const parentName = path.basename(folder);
    if (EXCLUDE_BASENAMES.has(basename)) continue;
    if (basename === "_index" && COLLECTION_FOLDERS.has(parentName)) continue;
    const slug = rel.replace(/\.md$/, "").split(path.sep).join("/");
    const top = rel.split(path.sep)[0];
    pages.push({
      rel,
      slug,
      basename,
      top,
      title: data.title || basename.replace(/-/g, " "),
      isIndex: basename === "_index",
      data,
      body: content.trim(),
    });
  }
  return pages;
}

// --- transforms ------------------------------------------------------------
function stripDataview(body) {
  return body.replace(/```dataview[\s\S]*?```/g, "").replace(/\n{3,}/g, "\n\n");
}

// --- blog index -----------------------------------------------------------
// The Blog landing (11-Blog/_index.md) holds a `<!--blog-cards-->` token instead
// of a hand-written card grid. We generate the grid from whatever posts live in
// 11-Blog/, driven by each post's blog_* front-matter — so a new post surfaces a
// card automatically and the landing can never fall out of sync. The platform
// (content.ts) mirrors this exact logic for the local knowledge base.
const BLOG_KEY = "11-Blog";
const BLOG_TOKEN = "<!--blog-cards-->";
function escText(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
}
function blogOrder(p) {
  const n = Number(p.data && p.data.blog_order);
  return Number.isFinite(n) ? n : 999;
}
function blogCardsMarkdown(pages) {
  const posts = pages
    .filter((p) => p.top === BLOG_KEY && !p.isIndex)
    .sort((x, y) => blogOrder(x) - blogOrder(y) || x.title.localeCompare(y.title));
  const cards = posts
    .map((p) => {
      const d = p.data || {};
      const accent = d.blog_accent ? String(d.blog_accent) : "#c2410c";
      const kicker = d.blog_kicker ? `<p class="num">${escText(d.blog_kicker)}</p>\n` : "";
      const summary = escText(d.blog_summary || d.description || "");
      return `<div class="blog-card" style="--blog-accent: ${accent}">\n${kicker}\n### [[${p.basename}|${p.title}]]\n\n<p>${summary}</p>\n</div>`;
    })
    .join("\n\n");
  return `<div class="blog-cards">\n\n${cards}\n\n</div>`;
}
function injectBlogCards(body, pages) {
  return body.includes(BLOG_TOKEN) ? body.split(BLOG_TOKEN).join(blogCardsMarkdown(pages)) : body;
}

function resolveWikilinks(body, slugByKey) {
  const segments = body.split(/(```[\s\S]*?```)/g);
  return segments
    .map((seg) => {
      if (seg.startsWith("```")) return seg;
      return seg.replace(/\[\[([^\]]+)\]\]/g, (_m, inner) => {
        const [rawTarget, rawLabel] = inner.split("|");
        const label = (rawLabel ?? rawTarget).trim();
        let t = rawTarget.trim().replace(/\.md$/i, "").replace(/^(\.\.\/|\.\/)+/, "");
        const last = t.split("/").pop();
        const hit = slugByKey.get(t) || slugByKey.get(last);
        // Only link to pages that exist IN the showcase; otherwise plain text
        // (this is what keeps internal pages from leaking as links).
        return hit ? `[${label}](/${hit})` : label;
      });
    })
    .join("");
}

function buildKeyIndex(pages) {
  const map = new Map();
  for (const p of pages) {
    map.set(p.slug, p.slug);
    map.set(p.basename, p.slug);
    map.set(p.slug.split("/").slice(-2).join("/"), p.slug); // e.g. 01-Concept/_index
  }
  return map;
}

// --- html ------------------------------------------------------------------
// Collection entry pages (RES-0001, MB-0002, …) are reached via their collection
// pages/landings — not listed individually in the sidebar, or the nav becomes a
// wall of links.
const isEntryPage = (p) => /^[A-Z]{2,6}-\d+/.test(p.basename);

function navHtml(pages, currentSlug) {
  const current = pages.find((p) => p.slug === currentSlug);
  let out = "";
  for (const section of SECTIONS) {
    const inSection = pages.filter((p) => p.top === section.key && !isEntryPage(p));
    if (inSection.length === 0) continue;
    inSection.sort(
      (a, b) => Number(b.isIndex) - Number(a.isIndex) || a.title.localeCompare(b.title),
    );
    const open = current && current.top === section.key ? " open" : "";
    out += `<details class="nav-group"${open}><summary class="nav-head" style="color:${section.accent}"><span>${section.glyph}</span> ${section.label}</summary>`;
    for (const p of inSection) {
      const active = p.slug === currentSlug ? " active" : "";
      const label = p.isIndex ? "Overview" : p.title;
      out += `<a class="nav-link${active}" href="/${p.slug}">${escapeHtml(label)}</a>`;
    }
    out += `</details>`;
  }
  return out;
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function pageShell({ title, navHtml, contentHtml, isLanding, blogPublished }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)} — Internet Animation · GRFX1222</title>
<meta name="description" content="The course wiki for GRFX1222 Internet Animation: a 16-week course on vector-based animation for the modern web — animation principles, the Lottie/dotLottie pipeline, After Effects, Rive, web-native SVG/CSS motion, and User-Centered Design for motion. Schedule, projects, rated learning resources, class calendar, and blog." />
<link rel="stylesheet" href="/styles.css?v=${STYLES_VER}" />
</head>
<body>
<div class="banner">GRFX1222 · vector motion for the modern web · schedule, projects &amp; resources</div>
<input type="checkbox" id="nav-toggle" class="nav-toggle-cb" hidden />
<div class="mobile-bar">
  <label for="nav-toggle" class="nav-burger" aria-label="Open menu">☰</label>
  <a class="mobile-brand" href="/">Internet Animation · GRFX1222</a>
</div>
<label for="nav-toggle" class="nav-backdrop" aria-hidden="true"></label>
<div class="layout${isLanding ? " landing-layout" : ""}">
  <aside class="sidebar">
    <a class="brand" href="/">Internet Animation<small>GRFX1222 · vector motion for the modern web</small></a>
    <a class="nav-featured" href="/02-Schedule/Calendar" style="border-left-color:#b45309">⧗ Class Calendar</a>
    ${blogPublished ? `<a class="nav-featured" href="/11-Blog/_index" style="border-left-color:#db2777">✍ Blog</a>` : ""}
    <a class="nav-featured" href="/04-Resources/Learning-Resources">❋ Learning resources</a>
    ${navHtml}
  </aside>
  <main class="content">${contentHtml}</main>
</div>
<footer class="foot">Internet Animation · GRFX1222 · Fairmont State University · built ${new Date().getFullYear()}</footer>
<script>(function(){var s=document.querySelector('.sidebar');if(!s)return;var K='ianSidebarScroll';try{var v=sessionStorage.getItem(K);if(v!==null)s.scrollTop=parseInt(v,10)||0;}catch(e){}var t;s.addEventListener('scroll',function(){if(t)cancelAnimationFrame(t);t=requestAnimationFrame(function(){try{sessionStorage.setItem(K,s.scrollTop);}catch(e){}});},{passive:true});document.querySelectorAll('.sidebar a').forEach(function(a){a.addEventListener('click',function(){try{sessionStorage.setItem(K,s.scrollTop);}catch(e){}});});})();</script>
${contentHtml.includes("anim-embed") ? `<div class="anim-modal" id="anim-modal" role="dialog" aria-modal="true" aria-label="Animation, full screen" hidden>
  <button class="anim-modal-close" id="anim-modal-close" aria-label="Close">×</button>
  <iframe class="anim-modal-frame" id="anim-modal-frame" title="Animation, full screen"></iframe>
</div>
<script>(function(){var modal=document.getElementById('anim-modal'),frame=document.getElementById('anim-modal-frame'),closeBtn=document.getElementById('anim-modal-close');if(!modal)return;function open(src){frame.src=src;modal.hidden=false;}function close(){modal.hidden=true;frame.src='about:blank';}document.addEventListener('click',function(e){var embed=e.target&&e.target.closest&&e.target.closest('.anim-embed');if(embed){var iframe=embed.querySelector('iframe');if(iframe)open(iframe.getAttribute('src'));}});closeBtn.addEventListener('click',close);modal.addEventListener('click',function(e){if(e.target===modal)close();});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden)close();});})();</script>` : ""}
</body>
</html>`;
}

function landingContent(pages) {
  const cards = SECTIONS.map((s) => {
    const inSection = pages.filter((p) => p.top === s.key);
    if (!inSection.length) return "";
    const first = inSection.find((p) => p.isIndex) || inSection[0];
    return `<a class="layer-card" href="/${first.slug}" style="--accent:${s.accent}">
      <div class="glyph">${s.glyph}</div><h3>${s.label}</h3>
      <p>${inSection.length} page${inSection.length === 1 ? "" : "s"}</p></a>`;
  }).join("");

  return `<section class="hero">
    <h1>Internet Animation</h1>
    <p class="sub">GRFX1222 · vector motion for the modern web</p>
    <blockquote class="thesis">Motion is interface. The animations that matter today are not movies —
    they are the microinteractions, loaders, and transitions that make software feel alive, shipped
    as vectors a few kilobytes at a time. This course teaches you to design them on purpose: for a
    user, to a brief, and tested against both.</blockquote>
    <p class="lede">The course wiki for GRFX1222 — a 16-week course on vector-based animation for the
    modern web. Follow the <a href="/02-Schedule/_index">week-by-week schedule</a>, check the
    <a href="/02-Schedule/Calendar">class calendar</a>, read each project's brief in
    <a href="/03-Projects/_index">Projects &amp; exercises</a>, and dig into the
    <a href="/04-Resources/Learning-Resources">rated learning-resource library</a> — every link
    verified, free-first, and scored.</p>
  </section>
  <div class="layer-grid">${cards}</div>`;
}

// --- class calendar (read-only) ---------------------------------------------
// The live, editable calendar lives on the class platform (`/calendar`, backed
// by `_calendar/class-calendar.json`). The showcase renders a read-only agenda
// from the same committed file, so the public site always shows the schedule
// as of the last deploy.
const CAL_COLORS = {
  class: "#2563eb", due: "#e11d48", critique: "#b45309",
  studio: "#047857", event: "#0e7490", note: "#64748b",
};
const CAL_LABELS = {
  class: "class", due: "DUE", critique: "critique",
  studio: "studio", event: "event", note: "note",
};
const CAL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CAL_DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function calFmtDay(s) {
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${CAL_DOW[dt.getDay()]} ${CAL_MONTHS[m - 1].slice(0, 3)} ${d}`;
}
function calMonthGrid(ym, events) {
  const [y, m] = ym.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const gridStart = new Date(first);
  gridStart.setDate(1 - first.getDay());
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  let out = `<h2>${CAL_MONTHS[m - 1]} ${y}</h2><div class="cal-grid">`;
  for (const d of CAL_DOW) out += `<div class="cal-dow">${d}</div>`;
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const dIso = iso(d);
    const inMonth = d.getMonth() === m - 1;
    const evs = events.filter((e) => e.start <= dIso && dIso <= (e.end || e.start));
    let pills = "";
    for (const e of evs.slice(0, 4)) {
      const color = CAL_COLORS[e.category] || CAL_COLORS.note;
      pills += `<span class="cal-pill" style="background:${color}26;border-left-color:${color}" title="${escapeHtml(e.title)}">${e.time ? `${escapeHtml(e.time)} · ` : ""}${escapeHtml(e.title)}</span>`;
    }
    if (evs.length > 4) pills += `<span class="cal-more">+${evs.length - 4} more</span>`;
    out += `<div class="cal-cell${inMonth ? "" : " dim"}"><span class="cal-daynum">${d.getDate()}</span><div class="cal-evs">${pills}</div></div>`;
  }
  out += `</div>`;
  return out;
}

function calendarContent(keyIndex) {
  const f = path.join(CONTENT_DIR, "_calendar", "class-calendar.json");
  if (!fs.existsSync(f)) return null;
  const doc = JSON.parse(fs.readFileSync(f, "utf8"));
  const events = [...(doc.events || [])].sort(
    (a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title),
  );
  // months spanned by events (inclusive), in order
  const months = [];
  for (const e of events) {
    for (const ym of [e.start.slice(0, 7), (e.end || e.start).slice(0, 7)]) {
      if (!months.includes(ym)) months.push(ym);
    }
  }
  months.sort();

  let out = `<article class="prose cal-static"><h1>⧗ Class Calendar — ${escapeHtml(doc.semester || "")}</h1>`;
  out += `<p class="cal-static-note">This is the schedule as of the last site update. The live calendar — which everyone in the class can edit — is on the class platform in ET 206 / over the class network.</p>`;
  out += `<div class="cal-legend">`;
  for (const [k, color] of Object.entries(CAL_COLORS)) {
    out += `<span class="cal-key"><i style="background:${color}"></i> ${CAL_LABELS[k]}</span>`;
  }
  out += `</div>`;
  for (const ym of months) {
    const inMonth = events.filter((e) => e.start.slice(0, 7) <= ym && (e.end || e.start).slice(0, 7) >= ym);
    out += calMonthGrid(ym, inMonth);
  }

  out += `<h2>All events</h2>`;
  const byMonth = new Map();
  for (const e of events) {
    const key = e.start.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key).push(e);
  }
  for (const [ym, evs] of byMonth) {
    const [y, m] = ym.split("-").map(Number);
    out += `<h3>${CAL_MONTHS[m - 1]} ${y}</h3><div class="cal-static-list">`;
    for (const e of evs) {
      const color = CAL_COLORS[e.category] || CAL_COLORS.note;
      const span = e.end ? `${calFmtDay(e.start)} → ${calFmtDay(e.end)}` : calFmtDay(e.start);
      let title = escapeHtml(e.title);
      if (e.link) {
        if (/^https?:/.test(e.link)) {
          title = `<a href="${escapeHtml(e.link)}" target="_blank" rel="noreferrer">${title}</a>`;
        } else {
          const slug = e.link.replace(/^\/wiki\//, "").replace(/^\//, "");
          const hit = keyIndex.get(slug) || keyIndex.get(slug.split("/").pop());
          if (hit) title = `<a href="/${hit}">${title}</a>`;
        }
      }
      out += `<div class="cal-static-row" style="border-left-color:${color}">
        <span class="cal-static-date">${span}${e.time ? ` · ${escapeHtml(e.time)}` : ""}</span>
        <span class="cal-static-cat" style="background:${color}">${CAL_LABELS[e.category] || "event"}</span>
        <span class="cal-static-title">${title}${e.details ? `<small>${escapeHtml(e.details)}</small>` : ""}</span>
      </div>`;
    }
    out += `</div>`;
  }
  out += `</article>`;
  return out;
}

// --- build -----------------------------------------------------------------
function rimraf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function writeFile(rel, html) {
  const abs = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, html, "utf8");
}

function main() {
  const pages = loadPages();
  const keyIndex = buildKeyIndex(pages);
  // Only surface the featured Blog nav link if the blog section actually publishes
  // (11-Blog is internal/draft until the wiki adds public posts) — else it 404s sitewide.
  const blogPublished = pages.some((p) => p.top === BLOG_KEY);
  rimraf(DIST);
  fs.mkdirSync(DIST, { recursive: true });

  // styles
  fs.copyFileSync(path.join(__dirname, "styles.css"), path.join(DIST, "styles.css"));

  // Blog animation figures (canonical copies live in platform/public/animations).
  // The essays embed these self-contained HTML animations via <iframe src="/animations/…">.
  const animationsSrc = path.join(CONTENT_DIR, "platform", "public", "animations");
  if (fs.existsSync(animationsSrc)) {
    fs.cpSync(animationsSrc, path.join(DIST, "animations"), { recursive: true });
    console.log("Copied blog animations → dist/animations");
  } else {
    console.warn("WARNING: animations source not found at", animationsSrc);
  }

  // landing
  writeFile("index.html", pageShell({
    title: "Home",
    navHtml: navHtml(pages, ""),
    contentHtml: landingContent(pages),
    isLanding: true,
    blogPublished,
  }));

  // read-only class calendar (from the committed _calendar/class-calendar.json)
  const cal = calendarContent(keyIndex);
  if (cal) {
    writeFile("02-Schedule/Calendar.html", pageShell({
      title: "Class Calendar",
      navHtml: navHtml(pages, "02-Schedule/Calendar"),
      contentHtml: cal,
      isLanding: false,
      blogPublished,
    }));
    console.log("Built read-only class calendar → 02-Schedule/Calendar");
  }

  // pages
  for (const p of pages) {
    const pre = resolveWikilinks(stripDataview(injectBlogCards(p.body, pages)), keyIndex);
    const contentHtml = `<article class="prose">${md.render(pre)}</article>`;
    const html = pageShell({
      title: p.title,
      navHtml: navHtml(pages, p.slug),
      contentHtml,
      isLanding: false,
      blogPublished,
    });
    writeFile(`${p.slug}.html`, html);
    // Also emit a directory index.html for section landings so the bare folder
    // URL (e.g. /11-Blog/) resolves instead of 404ing (landings are named _index).
    if (p.isIndex) {
      const dir = p.slug.replace(/\/_index$/, "");
      if (dir && dir !== p.slug) writeFile(`${dir}/index.html`, html);
    }
  }

  console.log(`Built showcase: ${pages.length} pages + landing → ${path.relative(process.cwd(), DIST)}`);
  console.log("Pages included:");
  for (const p of pages.sort((a, b) => a.slug.localeCompare(b.slug))) console.log("  •", p.slug);
}

main();
