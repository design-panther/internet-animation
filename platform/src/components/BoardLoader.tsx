"use client";

import dynamic from "next/dynamic";

/**
 * tldraw touches `window`/`document` and ships its own canvas runtime, so it
 * must never be part of the server bundle (same reasoning as the Leaflet map).
 */
const Whiteboard = dynamic(() => import("./Whiteboard"), {
  ssr: false,
  loading: () => <div className="notice" style={{ margin: 24 }}>Loading canvas…</div>,
});

export default function BoardLoader({ slug, title }: { slug: string; title: string }) {
  return <Whiteboard slug={slug} title={title} />;
}
