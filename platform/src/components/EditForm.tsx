"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  slug: string;
  initial: {
    title: string;
    status: string;
    visibility: string;
    owner: string;
    tags: string;
    verify: boolean;
    body: string;
  };
}

const STATUS = ["draft", "in-progress", "tested", "published", "archived"];
const VIS = ["internal", "public"];

export default function EditForm({ slug, initial }: Props) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/entry", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        title: f.title,
        status: f.status,
        visibility: f.visibility,
        owner: f.owner,
        tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
        verify: f.verify,
        body: f.body,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Save failed");
      return;
    }
    router.push(`/wiki/${slug}`);
    router.refresh();
  }

  return (
    <div>
      <div className="row">
        <label className="field" style={{ flex: 2, marginTop: 0 }}>
          <span>Title</span>
          <input
            type="text"
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
          />
        </label>
        <label className="field" style={{ flex: 1, marginTop: 0 }}>
          <span>Owner</span>
          <input
            type="text"
            value={f.owner}
            onChange={(e) => setF({ ...f, owner: e.target.value })}
          />
        </label>
      </div>

      <div className="row">
        <label className="field" style={{ flex: 1 }}>
          <span>Status</span>
          <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            {STATUS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="field" style={{ flex: 1 }}>
          <span>Visibility</span>
          <select
            value={f.visibility}
            onChange={(e) => setF({ ...f, visibility: e.target.value })}
          >
            {VIS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="field" style={{ flex: 2 }}>
          <span>Tags (comma-separated)</span>
          <input
            type="text"
            value={f.tags}
            onChange={(e) => setF({ ...f, tags: e.target.value })}
          />
        </label>
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={f.verify}
          onChange={(e) => setF({ ...f, verify: e.target.checked })}
        />
        ⚠ Contains an unverified claim (adds to verify queue)
      </label>

      <label className="field">
        <span>Body (Markdown — wikilinks <code>[[Target|Label]]</code> supported)</span>
        <textarea value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
      </label>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button className="btn" onClick={() => router.push(`/wiki/${slug}`)} disabled={saving}>
          Cancel
        </button>
        <span className="spacer" />
        <span className="muted" style={{ fontSize: 12 }}>
          Saves to the Markdown file · <code>updated</code> set to today
        </span>
      </div>
    </div>
  );
}
