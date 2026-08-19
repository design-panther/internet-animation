"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface GitChange {
  status: string;
  label: string;
  path: string;
}
interface GitStatus {
  isRepo: boolean;
  branch: string | null;
  hasCommits: boolean;
  changes: GitChange[];
  clean: boolean;
  identityConfigured: boolean;
  lastCommit: string | null;
  remote: string | null;
  upstream: string | null;
  ahead: number;
  behind: number;
}

export default function GitPanel() {
  const router = useRouter();
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/git", { cache: "no-store" });
    const j = await res.json();
    if (!res.ok) setError(j.error || "Failed to read git status");
    else setStatus(j);
  }, []);

  useEffect(() => {
    load();
    setName(localStorage.getItem("git.authorName") || "");
    setEmail(localStorage.getItem("git.authorEmail") || "");
  }, [load]);

  // Generic POST to /api/git. `label` drives the busy spinner; returns the json.
  async function run(action: string, extra: Record<string, unknown>, label: string) {
    setBusy(label);
    setError(null);
    setFlash(null);
    const res = await fetch("/api/git", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const j = await res.json();
    setBusy(null);
    if (j.status) setStatus(j.status);
    if (!res.ok) {
      setError(j.error || `${action} failed`);
      return null;
    }
    return j;
  }

  async function doInit() {
    const j = await run("init", {}, "init");
    if (j) setFlash("Initialized an empty Git repository.");
  }

  async function doCommit() {
    if (!message.trim()) return setError("Write a commit message first.");
    if (name) localStorage.setItem("git.authorName", name);
    if (email) localStorage.setItem("git.authorEmail", email);
    const j = await run(
      "commit",
      { message, authorName: name || undefined, authorEmail: email || undefined },
      "commit",
    );
    if (j) {
      setMessage("");
      setFlash(`Committed ${j.committed} file${j.committed === 1 ? "" : "s"} — ${j.summary}`);
      router.refresh();
    }
  }

  async function doAddRemote() {
    if (!remoteUrl.trim()) return setError("Paste a remote URL first.");
    const j = await run("add-remote", { url: remoteUrl.trim() }, "remote");
    if (j) {
      setRemoteUrl("");
      setFlash("Remote 'origin' set. You can push now.");
    }
  }

  async function doFetch() {
    const j = await run("fetch", {}, "fetch");
    if (j) setFlash("Fetched from origin — ahead/behind counts updated.");
  }

  async function doPush() {
    const j = await run("push", {}, "push");
    if (j) setFlash("Pushed to origin." + (j.output ? ` ${truncate(j.output)}` : ""));
  }

  async function doPull() {
    const j = await run("pull", {}, "pull");
    if (j) {
      setFlash("Pulled from origin." + (j.output ? ` ${truncate(j.output)}` : ""));
      router.refresh();
    }
  }

  if (!status) return <div className="notice">{error || "Reading Git status…"}</div>;

  if (!status.isRepo) {
    return (
      <div className="panel">
        <h3>Git is not set up here yet</h3>
        <p className="muted">
          Initialize a repository to start tracking and syncing changes. After this,
          commit, push, and pull from here — no terminal needed.
        </p>
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
        {flash && <p style={{ color: "var(--ok)" }}>{flash}</p>}
        <button className="btn primary" onClick={doInit} disabled={!!busy}>
          {busy === "init" ? "Initializing…" : "Initialize Git repository"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <span className="badge id">⎇ {status.branch || "—"}</span>
        {status.upstream && <span className="badge">↔ {status.upstream}</span>}
        {status.ahead > 0 && <span className="badge" style={{ color: "#ffd9a0" }}>↑ {status.ahead} ahead</span>}
        {status.behind > 0 && <span className="badge" style={{ color: "#9ad0ff" }}>↓ {status.behind} behind</span>}
        {status.lastCommit && <span className="badge">last: {status.lastCommit}</span>}
        <span className="spacer" />
        <button className="btn" onClick={load} disabled={!!busy}>
          ↻ Refresh
        </button>
      </div>

      {flash && (
        <div className="notice" style={{ borderColor: "#3a5a2c", color: "var(--ok)", whiteSpace: "pre-wrap" }}>
          {flash}
        </div>
      )}
      {error && (
        <div className="notice" style={{ borderColor: "#6b2f2f", color: "var(--danger)", whiteSpace: "pre-wrap" }}>
          {error}
        </div>
      )}

      {/* ---- commit ---- */}
      {status.clean ? (
        <div className="notice">Working tree clean — nothing to commit.</div>
      ) : (
        <>
          <div className="panel">
            <strong>
              {status.changes.length} uncommitted change
              {status.changes.length === 1 ? "" : "s"}
            </strong>
            <ul style={{ marginTop: 8, maxHeight: 200, overflowY: "auto" }}>
              {status.changes.map((c) => (
                <li key={c.path} style={{ fontFamily: "var(--mono)", fontSize: 12.5 }}>
                  <span className="badge" style={{ marginRight: 8, textTransform: "lowercase" }}>
                    {c.label}
                  </span>
                  {c.path}
                </li>
              ))}
            </ul>
          </div>

          {!status.identityConfigured && (
            <div className="row">
              <label className="field" style={{ flex: 1, marginTop: 0 }}>
                <span>Your name (saved on this device)</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="field" style={{ flex: 1, marginTop: 0 }}>
                <span>Your email</span>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
            </div>
          )}

          <label className="field">
            <span>Commit message</span>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Add CS-0007 Birch River clay sample + firing FIRE-0002"
              onKeyDown={(e) => e.key === "Enter" && doCommit()}
            />
          </label>

          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn primary" onClick={doCommit} disabled={!!busy}>
              {busy === "commit" ? "Committing…" : `Commit all ${status.changes.length} changes`}
            </button>
            <span className="spacer" />
            <span className="muted" style={{ fontSize: 12 }}>
              Stages everything (respecting <code>.gitignore</code>).
            </span>
          </div>
        </>
      )}

      {/* ---- sync (push / pull) ---- */}
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="row">
          <h3 style={{ margin: 0 }}>Sync with remote</h3>
          <span className="spacer" />
          {status.remote && (
            <span className="muted" style={{ fontSize: 12, fontFamily: "var(--mono)" }}>
              origin: {truncate(status.remote, 42)}
            </span>
          )}
        </div>

        {!status.remote ? (
          <>
            <p className="muted" style={{ marginTop: 6 }}>
              No remote yet. Paste the URL of a repository to sync with (HTTPS or SSH).
              ⚠ Use a <strong>private</strong> remote — this repo holds internal data.
            </p>
            <div className="row">
              <input
                type="text"
                value={remoteUrl}
                onChange={(e) => setRemoteUrl(e.target.value)}
                placeholder="git@github.com:you/appalachian-clay.git  or  https://github.com/you/repo.git"
                onKeyDown={(e) => e.key === "Enter" && doAddRemote()}
              />
              <button className="btn" onClick={doAddRemote} disabled={!!busy}>
                {busy === "remote" ? "Setting…" : "Add remote"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn" onClick={doPull} disabled={!!busy}>
                {busy === "pull" ? "Pulling…" : `⤓ Pull${status.behind ? ` (${status.behind})` : ""}`}
              </button>
              <button className="btn primary" onClick={doPush} disabled={!!busy}>
                {busy === "push" ? "Pushing…" : `⤒ Push${status.ahead ? ` (${status.ahead})` : ""}`}
              </button>
              <button className="btn" onClick={doFetch} disabled={!!busy}>
                {busy === "fetch" ? "Fetching…" : "↻ Fetch"}
              </button>
              <span className="spacer" />
              {!status.upstream && (
                <span className="muted" style={{ fontSize: 12 }}>
                  First push sets the upstream.
                </span>
              )}
            </div>
            <p className="muted" style={{ fontSize: 12, marginTop: 10, marginBottom: 0 }}>
              Pull merges remote changes in (no auto-resolve of conflicts). Push sends your
              commits up. Counts are since the last fetch — hit <strong>Fetch</strong> to refresh.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function truncate(s: string, n = 120): string {
  s = s.trim();
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
