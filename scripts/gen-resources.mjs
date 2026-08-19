// Regenerate the Learning-Resources landing (04-Resources/Learning-Resources.md)
// from the RES-*.md front-matter. Groups public entries by unit, sorted by first
// week then quality (desc) then ID, and splices the list after the
// <!-- resources-list --> marker. Run after the research fleet / judge pass:
//   node scripts/gen-resources.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "../platform/node_modules/gray-matter/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RES_DIR = path.join(ROOT, "04-Resources", "Learning-Resources");
const LANDING = path.join(ROOT, "04-Resources", "Learning-Resources.md");

const UNITS = [
  [1, "Unit 1 — Foundations (Weeks 1–4)"],
  [2, "Unit 2 — The Lottie Pipeline (Weeks 5–8)"],
  [3, "Unit 3 — Interactive & Alternative Platforms (Weeks 9–12)"],
  [4, "Unit 4 — Final Project (Weeks 13–16)"],
];

const stars = (n) => {
  const q = Math.max(0, Math.min(5, Number(n) || 0));
  return q ? "★".repeat(q) + "☆".repeat(5 - q) : "—";
};

const entries = [];
for (const f of fs.readdirSync(RES_DIR)) {
  if (!/^RES-\d+.*\.md$/.test(f)) continue;
  const { data } = matter(fs.readFileSync(path.join(RES_DIR, f), "utf8"));
  const weeks = Array.isArray(data.weeks) ? data.weeks.map(Number) : [Number(data.weeks) || 99];
  entries.push({
    id: data.id || f.replace(/\.md$/, ""),
    base: f.replace(/\.md$/, ""),
    title: data.title || "",
    creator: data.creator || "",
    rtype: data.resource_type || "resource",
    level: data.level || "",
    quality: Number(data.quality) || 0,
    unit: Number(data.unit) || 0,
    week: Math.min(...weeks),
    weeks,
    visibility: data.visibility || "internal",
  });
}

let out = [];
let counted = 0;
for (const [key, label] of UNITS) {
  const inUnit = entries
    .filter((e) => e.unit === key && e.visibility === "public")
    .sort((a, b) => a.week - b.week || b.quality - a.quality || a.id.localeCompare(b.id));
  if (!inUnit.length) continue;
  out.push(`## ${label} (${inUnit.length})\n`);
  let lastWeek = -1;
  for (const e of inUnit) {
    if (e.week !== lastWeek) {
      out.push(`\n**Week ${e.week}**\n`);
      lastWeek = e.week;
    }
    const meta = [e.rtype, e.level, e.creator].filter(Boolean).join(" · ");
    out.push(`- ${stars(e.quality)} [[${e.base}|${e.title}]]${meta ? ` — ${meta}` : ""}`);
    counted++;
  }
  out.push("");
}

const listBlock = out.join("\n").trim();
const raw = fs.readFileSync(LANDING, "utf8");
const startMark = "<!-- resources-list";
const idx = raw.indexOf(startMark);
const header = idx >= 0 ? raw.slice(0, idx) : raw;
const marker = `<!-- resources-list: regenerated from 04-Resources/Learning-Resources/*.md front-matter — run node scripts/gen-resources.mjs -->\n\n`;
const footer = "\n\n> Ratings are the course's editorial judgment of fit and quality for THIS class — a ★★★☆☆ resource may still be exactly what you need for one stuck moment.\n";
fs.writeFileSync(LANDING, header.trimEnd() + "\n\n" + marker + listBlock + footer, "utf8");
console.log(`Learning-Resources landing regenerated: ${counted} public resources.`);
