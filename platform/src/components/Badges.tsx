import type { Entry } from "@/lib/content";

export function EntryBadges({ entry }: { entry: Entry }) {
  return (
    <div className="badges">
      {entry.id && <span className="badge id">{entry.id}</span>}
      <span className="badge">{entry.type}</span>
      {entry.status && (
        <span className={`badge status-${entry.status}`}>{entry.status}</span>
      )}
      {entry.visibility && (
        <span className={`badge ${entry.visibility}`}>{entry.visibility}</span>
      )}
      {entry.verify && <span className="badge verify">⚠ verify</span>}
      {entry.owner && <span className="badge">@ {entry.owner}</span>}
      {entry.updated && <span className="badge">updated {entry.updated}</span>}
    </div>
  );
}
