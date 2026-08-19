import { notFound } from "next/navigation";
import BoardLoader from "@/components/BoardLoader";
import { getEntryBySlug } from "@/lib/content";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const joined = slug.join("/");
  const entry = getEntryBySlug(joined);
  if (!entry || entry.collectionKey !== "whiteboards") notFound();
  return <BoardLoader slug={entry.slug} title={entry.title} />;
}
