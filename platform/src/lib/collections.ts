/**
 * Collection registry — domain: INTERNET ANIMATION (GRFX1222), the course wiki
 * for a 16-week hybrid course on vector-based animation for the modern web:
 * animation principles, the Lottie/dotLottie pipeline, After Effects, Rive,
 * web-native SVG/CSS motion, and User-Centered Design for motion. The headline
 * collections are `resources` (the rated learning-resource library, organized
 * by unit and week) and the week-by-week schedule pages.
 */
export type LayerKey =
  | "start" | "syllabus" | "schedule" | "projects"
  | "resources" | "toolbox" | "reference"
  | "blog" | "boards" | "meta";

export interface Layer {
  key: LayerKey; label: string; glyph: string; folder?: string; accent: string;
}

export const LAYERS: Layer[] = [
  { key: "start",     label: "Start Here",  glyph: "◆", folder: "00-Start-Here", accent: "#7c8698" },
  { key: "syllabus",  label: "Syllabus",    glyph: "❡", folder: "01-Syllabus",   accent: "#60a5fa" },
  { key: "schedule",  label: "Schedule",    glyph: "⧗", folder: "02-Schedule",   accent: "#f59e0b" },
  { key: "projects",  label: "Projects",    glyph: "✦", folder: "03-Projects",   accent: "#fb7185" },
  { key: "resources", label: "Resources",   glyph: "❋", folder: "04-Resources",  accent: "#22d3ee" },
  { key: "toolbox",   label: "Toolbox",     glyph: "⚒", folder: "05-Toolbox",    accent: "#34d399" },
  { key: "reference", label: "Reference",   glyph: "§", folder: "06-Reference",  accent: "#94a3b8" },
  { key: "blog",      label: "Blog",        glyph: "✍", folder: "11-Blog",       accent: "#db2777" },
  { key: "boards",    label: "Whiteboards", glyph: "▨", folder: "10-Whiteboards", accent: "#0f766e" },
  { key: "meta",      label: "Meta & Guides", glyph: "⚙", accent: "#6b7280" },
];

export function layerOf(key: LayerKey): Layer {
  return LAYERS.find((l) => l.key === key) ?? LAYERS[LAYERS.length - 1];
}

export interface Collection {
  key: string; folder: string; type: string; prefix: string;
  label: string; singular: string; layer: LayerKey; blurb: string;
}

export const COLLECTIONS: Collection[] = [
  {
    key: "resources",
    folder: "04-Resources/Learning-Resources",
    type: "resource",
    prefix: "RES",
    label: "Learning Resources",
    singular: "resource",
    layer: "resources",
    blurb: "One verified, rated learning resource — a tutorial, doc page, video, tool, or article supporting a specific unit and week of the course. Free-first; every URL checked.",
  },
  {
    key: "whiteboards",
    folder: "10-Whiteboards",
    type: "whiteboard",
    prefix: "WB",
    label: "Whiteboards",
    singular: "whiteboard",
    layer: "boards",
    blurb: "An infinite canvas for critiques, storyboards, and motion-brief workshops.",
  },
];

export function collectionByKey(key: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.key === key);
}
export function collectionByFolder(folder: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.folder === folder);
}
export function collectionByType(type: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.type === type);
}
