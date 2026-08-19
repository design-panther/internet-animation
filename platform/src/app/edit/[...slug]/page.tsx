import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntryBySlug } from "@/lib/content";
import EditForm from "@/components/EditForm";

export default async function EditPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugPath = slug.map(decodeURIComponent).join("/");
  const entry = getEntryBySlug(slugPath);
  if (!entry) notFound();

  return (
    <div>
      <div className="crumbs">
        <Link href="/">Dashboard</Link> ·{" "}
        <Link href={`/wiki/${entry.slug}`}>{entry.title}</Link> · edit
      </div>
      <h1>Edit: {entry.title}</h1>
      <p className="muted" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
        {entry.relPath}
      </p>
      <EditForm
        slug={entry.slug}
        initial={{
          title: entry.title,
          status: entry.status || "draft",
          visibility: entry.visibility || "internal",
          owner: entry.owner || "",
          tags: entry.tags.join(", "),
          verify: entry.verify,
          body: entry.body,
        }}
      />
    </div>
  );
}
