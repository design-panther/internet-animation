"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  collectionKey: string;
  collectionLabel: string;
  singular: string;
  nextId: string;
  templateBody: string;
}

const STATUS = ["draft", "in-progress", "tested", "published", "archived"];
const VIS = ["internal", "public"];

export default function NewForm({
  collectionKey,
  collectionLabel,
  singular,
  nextId,
  templateBody,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("draft");
  const [visibility, setVisibility] = useState("internal");
  const [tags, setTags] = useState("");
  const [verify, setVerify] = useState(false);
  const [body, setBody] = useState(templateBody);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collectionKey,
        title: title.trim(),
        owner,
        status,
        visibility,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        verify,
        body: body.replace(/\{\{title\}\}/g, title.trim()),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Create failed");
      return;
    }
    const j = await res.json();
    router.push(`/wiki/${j.slug}`);
    router.refresh();
  }

  return (
    <div>
      <p className="muted">
        New {singular} in <strong>{collectionLabel}</strong> — will be created as{" "}
        <code>{nextId}</code>.
      </p>

      <div className="row">
        <label className="field" style={{ flex: 2, marginTop: 0 }}>
          <span>Title *</span>
          <input
            type="text"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`e.g. Birch River blue`}
          />
        </label>
        <label className="field" style={{ flex: 1, marginTop: 0 }}>
          <span>Owner</span>
          <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} />
        </label>
      </div>

      <div className="row">
        <label className="field" style={{ flex: 1 }}>
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="field" style={{ flex: 1 }}>
          <span>Visibility</span>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            {VIS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="field" style={{ flex: 2 }}>
          <span>Tags (comma-separated)</span>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
        </label>
      </div>

      <label className="checkbox">
        <input type="checkbox" checked={verify} onChange={(e) => setVerify(e.target.checked)} />
        ⚠ Contains an unverified claim
      </label>

      <label className="field">
        <span>Body (prefilled from the collection template)</span>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} />
      </label>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn primary" onClick={create} disabled={saving}>
          {saving ? "Creating…" : `Create ${nextId}`}
        </button>
        <button className="btn" onClick={() => router.back()} disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}
