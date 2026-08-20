// CI gate: every content Markdown file must have parseable YAML front-matter,
// and collection entries must not collide on `id`. Exits non-zero with a
// student-readable message when something is broken.
//   node scripts/validate-frontmatter.mjs      (run `npm ci` in showcase/ first)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "../showcase/node_modules/gray-matter/index.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IGNORE = new Set([
  "platform", "showcase", "scripts", "node_modules", ".git", ".github", ".next",
  "_attachments", "_templates", "_kanban", "_calendar", "_private", "_meta",
]);

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!IGNORE.has(e.name)) walk(p); }
    else if (e.name.endsWith(".md") && !e.name.startsWith("_TEMPLATE-")) files.push(p);
  }
})(ROOT);

let errors = 0;
const ids = new Map();
for (const f of files) {
  const rel = path.relative(ROOT, f);
  const raw = fs.readFileSync(f, "utf8");
  if (rel !== "CONTRIBUTING.md" && rel !== "README.md" && !raw.startsWith("---\n")) {
    console.error(`✗ ${rel}: missing front-matter (file must start with ---)`);
    errors++;
    continue;
  }
  if (!raw.startsWith("---\n")) continue;
  let data;
  try {
    ({ data } = matter(raw));
  } catch (e) {
    console.error(`✗ ${rel}: YAML front-matter does not parse — ${String(e.message).split("\n")[0]}`);
    console.error(`  (most common cause: a value containing a colon that isn't wrapped in "double quotes")`);
    errors++;
    continue;
  }
  if (data.id) {
    if (ids.has(data.id)) {
      console.error(`✗ ${rel}: duplicate id ${data.id} (also used by ${ids.get(data.id)}) — take the next unused ID`);
      errors++;
    } else ids.set(data.id, rel);
  }
  if (data.visibility && !["public", "internal"].includes(data.visibility)) {
    console.error(`✗ ${rel}: visibility must be "public" or "internal", got "${data.visibility}"`);
    errors++;
  }
}

if (errors) {
  console.error(`\n${errors} problem(s) across ${files.length} files. Fix the file(s) above and push again — the check reruns automatically.`);
  process.exit(1);
}
console.log(`✓ front-matter OK across ${files.length} Markdown files`);
