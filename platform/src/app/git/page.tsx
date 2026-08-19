import Link from "next/link";
import GitPanel from "@/components/GitPanel";

export default function GitPage() {
  return (
    <div>
      <div className="crumbs">
        <Link href="/">Dashboard</Link> · Git
      </div>
      <h1>⎇ Git</h1>
      <p className="muted" style={{ maxWidth: 660 }}>
        Commit, push, and pull — no terminal. The platform writes to the Markdown
        files; this records those edits in Git, sends them to a shared remote, and
        pulls collaborators&rsquo; changes back. Set a remote once, then sync from here.
      </p>
      <GitPanel />
    </div>
  );
}
