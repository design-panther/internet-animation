import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { collectionByKey } from "@/lib/collections";
import { getEntriesForCollection, getEntryBySlug, type Entry } from "@/lib/content";
import MarkdownView from "@/components/MarkdownView";

/** Judged quality 1-5 from front-matter (0 if unrated). */
function qualityOf(e: Entry): number {
  const q = Number((e.data as Record<string, unknown>)?.quality);
  return Number.isFinite(q) ? q : 0;
}

function Stars({ q }: { q: number }) {
  if (!q) return null;
  return (
    <span className={`stars stars-${q}`} title={`Quality ${q}/5`} aria-label={`Quality ${q} of 5`}>
      {"★".repeat(q)}
      <span className="stars-off">{"★".repeat(5 - q)}</span>
    </span>
  );
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const collection = collectionByKey(key);
  if (!collection) notFound();
  // Whiteboards have a dedicated canvas index instead of the generic card grid.
  if (key === "whiteboards") redirect("/boards");

  const entries = getEntriesForCollection(key);
  // Rated collections (learning resources) sort best-first.
  const rated = entries.some((e) => qualityOf(e) > 0);
  if (rated) {
    entries.sort((a, b) => qualityOf(b) - qualityOf(a) || (a.id || "").localeCompare(b.id || ""));
  }
  const indexDoc = getEntryBySlug(`${collection.folder}/_index`);

  return (
    <div>
      <div className="crumbs">
        <Link href="/">Dashboard</Link> · {collection.layer}
      </div>
      <div className="row">
        <h1 style={{ marginBottom: 0 }}>{collection.label}</h1>
        <span className="spacer" />
        <Link className="btn primary" href={`/new/${collection.key}`}>
          + New {collection.singular}
        </Link>
      </div>
      <p className="muted">
        <code>{collection.prefix}-</code> · {collection.blurb} · {entries.length}{" "}
        {entries.length === 1 ? "entry" : "entries"}
      </p>

      {entries.length === 0 ? (
        <div className="notice">
          No entries yet. Create the first one with{" "}
          <strong>+ New {collection.singular}</strong>.
        </div>
      ) : (
        <div className="card-grid">
          {entries.map((e) => (
            <Link key={e.slug} href={`/wiki/${e.slug}`} className="entry-card">
              <div className="row" style={{ gap: 6 }}>
                <div className="eid">{e.id}</div>
                <span className="spacer" />
                <Stars q={qualityOf(e)} />
              </div>
              <div className="etitle">{e.title}</div>
              <div className="badges" style={{ margin: "4px 0 0" }}>
                {(e.data as Record<string, unknown>)?.resource_type != null && (
                  <span className="badge">
                    {String((e.data as Record<string, unknown>).resource_type)}
                  </span>
                )}
                {e.status && (
                  <span className={`badge status-${e.status}`}>{e.status}</span>
                )}
                {e.verify && <span className="badge verify">⚠</span>}
                {e.visibility && (
                  <span className={`badge ${e.visibility}`}>{e.visibility}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {indexDoc && indexDoc.body && (
        <div className="panel">
          <MarkdownView markdown={indexDoc.body} />
        </div>
      )}
    </div>
  );
}
