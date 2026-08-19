import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllEntries,
  getEntryBySlug,
  preprocessWikilinks,
  injectBlogCards,
  resolveWikiTarget,
  getAttachmentsForId,
} from "@/lib/content";
import { collectionByKey } from "@/lib/collections";
import MarkdownView from "@/components/MarkdownView";
import { EntryBadges } from "@/components/Badges";
import { Attachments } from "@/components/Attachments";

export default async function WikiPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugPath = slug.map(decodeURIComponent).join("/");
  const entry = getEntryBySlug(slugPath);
  if (!entry) notFound();

  const entries = getAllEntries();
  const processed = preprocessWikilinks(injectBlogCards(entry.body, entries), entries);
  const attachments = getAttachmentsForId(entry.id);
  const collection = entry.collectionKey ? collectionByKey(entry.collectionKey) : undefined;

  const related = entry.related
    .map((r) => r.replace(/^\[\[|\]\]$/g, ""))
    .map((r) => {
      const [target, label] = r.split("|");
      const { href, resolved } = resolveWikiTarget(target, entries);
      return { href, label: (label ?? target).trim(), resolved };
    });

  return (
    <article>
      <div className="crumbs">
        <Link href="/">Dashboard</Link> ·{" "}
        {collection ? (
          <Link href={`/collection/${collection.key}`}>{collection.label}</Link>
        ) : (
          <span>{entry.relPath.split("/")[0].replace(/-/g, " ")}</span>
        )}
      </div>

      <h1>{entry.title}</h1>
      <EntryBadges entry={entry} />

      <div className="row" style={{ marginTop: 10 }}>
        <Link className="btn" href={`/edit/${entry.slug}`}>
          ✎ Edit this page
        </Link>
        <span className="spacer" />
        <span className="muted" style={{ fontSize: 12, fontFamily: "var(--mono)" }}>
          {entry.relPath}
        </span>
      </div>

      {related.length > 0 && (
        <div className="panel">
          <strong>Related</strong>
          <div className="row" style={{ marginTop: 6 }}>
            {related.map((r, i) =>
              r.resolved ? (
                <Link key={i} className="badge" href={r.href}>
                  {r.label}
                </Link>
              ) : (
                <span key={i} className="badge" title="unresolved">
                  {r.label}
                </span>
              ),
            )}
          </div>
        </div>
      )}

      <MarkdownView markdown={processed} />

      <Attachments items={attachments} />
    </article>
  );
}
