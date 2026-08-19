import Link from "next/link";
import NewBoardButton from "@/components/NewBoardButton";
import { getEntriesForCollection } from "@/lib/content";

export default function BoardsPage() {
  const boards = getEntriesForCollection("whiteboards");

  return (
    <div>
      <div className="crumbs">
        <Link href="/">Dashboard</Link> · Whiteboards
      </div>
      <div className="row">
        <h1 style={{ marginBottom: 0 }}>▨ Whiteboards</h1>
        <span className="spacer" />
        <NewBoardButton />
      </div>
      <p className="muted" style={{ maxWidth: 680 }}>
        Infinite design canvases. Drop in images and scans, embed resizable
        animations and the storymap, place editable documents, and sketch
        directly with an Apple Pencil. Each board saves to a JSON file beside its
        entry, so it&apos;s versioned like everything else. Boards are{" "}
        <strong>internal</strong> and never appear in the public showcase.
      </p>

      {boards.length === 0 ? (
        <div className="notice">
          No boards yet. Create one with <strong>+ New board</strong>.
        </div>
      ) : (
        <div className="card-grid">
          {boards.map((b) => (
            <Link key={b.slug} href={`/board/${b.slug}`} className="entry-card">
              <div className="eid">{b.id}</div>
              <div className="etitle">{b.title}</div>
              <div className="badges" style={{ margin: "4px 0 0" }}>
                {b.status && <span className={`badge status-${b.status}`}>{b.status}</span>}
                {b.updated && <span className="badge">{b.updated}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
