"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * On client navigation the layout (and its sidebar) stays mounted, so the
 * sidebar keeps its scroll position — continuity we want. But the content
 * column (`.main`) is its own scroll container, so we reset ONLY it to the top
 * when the route changes, so each new page starts at the top. The sidebar is
 * deliberately left alone.
 */
export default function ScrollReset() {
  const pathname = usePathname();
  useEffect(() => {
    document.querySelector(".main")?.scrollTo({ top: 0 });
    // Close the mobile nav drawer on navigation (no-op on desktop).
    const cb = document.getElementById("nav-toggle");
    if (cb instanceof HTMLInputElement) cb.checked = false;
  }, [pathname]);
  return null;
}
