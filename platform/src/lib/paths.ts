import path from "node:path";

/**
 * The wiki content root = the repo root, which is the PARENT of this app folder
 * (`platform/`). The Markdown files are the source of truth; this app reads and
 * writes them in place. Override with CONTENT_DIR if you relocate things.
 */
export const CONTENT_DIR = process.env.CONTENT_DIR
  ? path.resolve(process.env.CONTENT_DIR)
  : path.resolve(process.cwd(), "..");

export const ATTACHMENTS_DIR = path.join(CONTENT_DIR, "_attachments");

/** Folders/files never scanned as content. */
export const IGNORE_DIRS = new Set([
  "platform",
  "node_modules",
  ".git",
  ".next",
  "_attachments",
  "_templates",
  "_kanban",
  "_calendar",
]);

/** A path segment is a template file we skip. */
export function isTemplateFile(name: string): boolean {
  return name.startsWith("_TEMPLATE-");
}
