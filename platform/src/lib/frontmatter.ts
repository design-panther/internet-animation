import matter from "gray-matter";
import yaml from "js-yaml";

/**
 * gray-matter defaults to js-yaml's DEFAULT_SCHEMA, which parses unquoted dates
 * (`created: 2026-06-25`) into JS Date objects and re-serializes them as ISO
 * timestamps, and rewrites blank fields as `null`. We pin the engine to
 * JSON_SCHEMA so dates stay plain strings and round-tripping a file leaves its
 * front-matter formatting stable.
 */
const engine = {
  parse: (s: string) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object,
  stringify: (o: object) =>
    yaml.dump(o, { schema: yaml.JSON_SCHEMA, lineWidth: -1, noRefs: true, sortKeys: false }),
};

const OPTIONS = { engines: { yaml: engine } } as const;

export function parseMatter(raw: string) {
  return matter(raw, OPTIONS);
}

export function stringifyMatter(body: string, data: Record<string, unknown>): string {
  // normalise null -> "" so cleared optional fields don't litter files with null
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) clean[k] = v === null ? "" : v;
  return matter.stringify(body, clean, OPTIONS);
}
