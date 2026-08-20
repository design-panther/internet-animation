import Link from "next/link";
import { getVerifyQueue } from "@/lib/content";

export default function VerifyPage() {
  const queue = getVerifyQueue();
  return (
    <div>
      <div className="crumbs">
        <Link href="/">Dashboard</Link> · Verify queue
      </div>
      <h1>⚠ Verify queue</h1>
      <p className="muted" style={{ maxWidth: 660 }}>
        Every page carrying an unverified claim — a fact, figure, rule, date, or
        uncited source flagged with <code>verify: true</code> in its front-matter.
        Clear each by adding a citation or confirming the fact, then set{" "}
        <code>verify: false</code>. Nothing here is publish-ready.
      </p>

      {queue.length === 0 ? (
        <div className="notice">Nothing to verify. 🎉</div>
      ) : (
        <table className="prose" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Page</th>
              <th>Section</th>
              <th>Owner</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((e) => (
              <tr key={e.slug}>
                <td>
                  <Link href={`/wiki/${e.slug}`}>{e.title}</Link>
                </td>
                <td className="muted">{e.relPath.split("/")[0].replace(/-/g, " ")}</td>
                <td className="muted">{e.owner || "—"}</td>
                <td className="muted">{e.updated || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
