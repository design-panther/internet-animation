"use client";

import { useEffect, useState } from "react";

/**
 * Click any blog animation to open it full-screen. The embedded <iframe> has
 * `pointer-events: none` (CSS), so a click over the animation falls through to
 * its `.anim-embed` container and bubbles up — we catch it with a single
 * delegated listener on the document (robust across react-markdown re-renders
 * and client-side navigation; no DOM nodes injected into React-managed markup).
 * The modal's own iframe stays interactive.
 */
export default function AnimModal() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      const embed = el?.closest?.(".anim-embed");
      if (!embed) return;
      const ifr = embed.querySelector("iframe");
      if (ifr) setSrc(ifr.getAttribute("src"));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSrc(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [src]);

  if (!src) return null;
  return (
    <div
      className="anim-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Animation, full screen"
      onClick={() => setSrc(null)}
    >
      <button className="anim-modal-close" aria-label="Close" onClick={() => setSrc(null)}>
        ×
      </button>
      <iframe className="anim-modal-frame" src={src} title="Animation, full screen" />
    </div>
  );
}
