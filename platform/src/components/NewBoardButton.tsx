"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewBoardButton() {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: name.trim() || "Untitled board" }),
      });
      const data = await res.json();
      if (data.slug) router.push(`/board/${data.slug}`);
      else alert(data.error || "Could not create board");
    } finally {
      setBusy(false);
    }
  }

  if (!adding) {
    return (
      <button className="btn primary" onClick={() => setAdding(true)}>
        + New board
      </button>
    );
  }

  return (
    <span className="row" style={{ gap: 8 }}>
      <input
        autoFocus
        className="wb-name-input"
        placeholder="Board name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") create();
          if (e.key === "Escape") setAdding(false);
        }}
      />
      <button className="btn primary" onClick={create} disabled={busy}>
        {busy ? "Creating…" : "Create"}
      </button>
      <button className="btn" onClick={() => setAdding(false)} disabled={busy}>
        Cancel
      </button>
    </span>
  );
}
