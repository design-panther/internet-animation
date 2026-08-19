"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GitStatusBadge() {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);
  const [isRepo, setIsRepo] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/git", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!active) return;
        setIsRepo(!!j.isRepo);
        setCount(typeof j.changes?.length === "number" ? j.changes.length : 0);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // re-check whenever the route changes (i.e. after an edit/create)
  }, [pathname]);

  return (
    <Link href="/git" className="nav-link is-collection">
      <span>⎇ Git</span>
      {!isRepo ? (
        <span className="count">set up</span>
      ) : count && count > 0 ? (
        <span className="count" style={{ color: "#ffd9a0" }}>
          {count}
        </span>
      ) : count === 0 ? (
        <span className="count">clean</span>
      ) : null}
    </Link>
  );
}
