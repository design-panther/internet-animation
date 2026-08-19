import Link from "next/link";
import { notFound } from "next/navigation";
import { collectionByKey } from "@/lib/collections";
import { nextId, getTemplateBody } from "@/lib/mutations";
import NewForm from "@/components/NewForm";

export default async function NewEntryPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const collection = collectionByKey(key);
  if (!collection) notFound();

  const id = nextId(key);
  const templateBody = getTemplateBody(key, id);

  return (
    <div>
      <div className="crumbs">
        <Link href="/">Dashboard</Link> ·{" "}
        <Link href={`/collection/${collection.key}`}>{collection.label}</Link> · new
      </div>
      <h1>New {collection.singular}</h1>
      <NewForm
        collectionKey={collection.key}
        collectionLabel={collection.label}
        singular={collection.singular}
        nextId={id}
        templateBody={templateBody}
      />
    </div>
  );
}
