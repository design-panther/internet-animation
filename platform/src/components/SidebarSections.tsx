"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LAYERS, type LayerKey } from "@/lib/collections";
import type { NavSection } from "@/lib/content";

/**
 * Collapsible nav sections. Each section is a <details> that is open only when
 * the current route lives inside it — so the sidebar shows one expanded group at
 * a time instead of a wall of every page. Users can still toggle any section;
 * navigating re-syncs to the active one.
 */
export default function SidebarSections({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();
  const folderFor = (k: LayerKey) => LAYERS.find((l) => l.key === k)?.folder;

  return (
    <>
      {sections.map((section) => {
        if (section.docs.length === 0 && section.collections.length === 0) return null;
        const folder = folderFor(section.key);
        const active =
          (!!folder && pathname.startsWith(`/wiki/${folder}`)) ||
          section.collections.some((c) => pathname.startsWith(`/collection/${c.key}`)) ||
          section.docs.some((d) => pathname === `/wiki/${d.slug}`);

        return (
          <details key={section.key} className="nav-group" open={active}>
            <summary className="nav-head" style={{ color: section.accent }}>
              <span className="glyph">{section.glyph}</span>
              {section.label}
            </summary>
            {section.collections.map((c) => (
              <Link key={c.key} href={`/collection/${c.key}`} className="nav-link is-collection">
                <span>{c.label}</span>
                <span className="count">{c.count}</span>
              </Link>
            ))}
            {section.docs.map((d) => (
              <Link key={d.slug} href={`/wiki/${d.slug}`} className="nav-link">
                <span>{d.title}</span>
              </Link>
            ))}
          </details>
        );
      })}
    </>
  );
}
