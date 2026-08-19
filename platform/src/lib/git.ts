import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { CONTENT_DIR } from "./paths";

const pExecFile = promisify(execFile);

interface RunResult {
  ok: boolean;
  stdout: string;
  stderr: string;
}

/** Run a git command without throwing. Args are passed as an array (no shell),
 *  so user-supplied strings (commit messages) cannot inject. */
async function git(args: string[], cwd: string = CONTENT_DIR): Promise<RunResult> {
  try {
    const { stdout, stderr } = await pExecFile("git", args, {
      cwd,
      maxBuffer: 10 * 1024 * 1024,
    });
    return { ok: true, stdout: stdout.toString(), stderr: stderr.toString() };
  } catch (err: unknown) {
    const e = err as { stdout?: Buffer | string; stderr?: Buffer | string; message?: string };
    return {
      ok: false,
      stdout: e.stdout ? e.stdout.toString() : "",
      stderr: (e.stderr ? e.stderr.toString() : "") || e.message || "git error",
    };
  }
}

export interface GitChange {
  status: string; // two-char porcelain code, e.g. " M", "??", "A "
  label: string; // human label
  path: string;
}

export interface GitStatus {
  isRepo: boolean;
  branch: string | null;
  hasCommits: boolean;
  changes: GitChange[];
  clean: boolean;
  identityConfigured: boolean;
  lastCommit: string | null;
  remote: string | null; // origin URL, or null if no remote
  upstream: string | null; // e.g. "origin/main", or null if branch has no upstream
  ahead: number; // local commits not on upstream (since last fetch)
  behind: number; // upstream commits not local (since last fetch)
}

const CODE_LABELS: Record<string, string> = {
  "??": "new",
  "A": "added",
  "M": "modified",
  "D": "deleted",
  "R": "renamed",
  "C": "copied",
  "U": "conflict",
};

function labelFor(code: string): string {
  const c = code.trim()[0] || code[0];
  return CODE_LABELS[code.trim()] || CODE_LABELS[c] || "changed";
}

export async function getStatus(cwd: string = CONTENT_DIR): Promise<GitStatus> {
  const inside = await git(["rev-parse", "--is-inside-work-tree"], cwd);
  if (!inside.ok || inside.stdout.trim() !== "true") {
    return {
      isRepo: false,
      branch: null,
      hasCommits: false,
      changes: [],
      clean: true,
      identityConfigured: false,
      lastCommit: null,
      remote: null,
      upstream: null,
      ahead: 0,
      behind: 0,
    };
  }

  // branch (works even before the first commit)
  let branch: string | null = null;
  const sym = await git(["symbolic-ref", "--short", "HEAD"], cwd);
  if (sym.ok) branch = sym.stdout.trim();

  // any commits yet?
  const head = await git(["rev-parse", "--verify", "HEAD"], cwd);
  const hasCommits = head.ok;

  // changes
  const st = await git(["status", "--porcelain=v1", "--untracked-files=all"], cwd);
  const changes: GitChange[] = st.stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const code = line.slice(0, 2);
      let path = line.slice(3);
      // git quotes paths containing spaces/unicode; unquote for display
      if (path.startsWith('"') && path.endsWith('"')) {
        try {
          path = JSON.parse(path);
        } catch {
          path = path.slice(1, -1);
        }
      }
      // for renames "old -> new", show the new path
      const arrow = path.indexOf(" -> ");
      if (arrow !== -1) path = path.slice(arrow + 4);
      return { status: code, label: labelFor(code), path };
    });

  // identity (local or global)
  const name = await git(["config", "user.name"], cwd);
  const email = await git(["config", "user.email"], cwd);
  const identityConfigured = !!name.stdout.trim() && !!email.stdout.trim();

  // last commit summary
  let lastCommit: string | null = null;
  if (hasCommits) {
    const log = await git(["log", "-1", "--pretty=%h %s (%cr)"], cwd);
    if (log.ok) lastCommit = log.stdout.trim();
  }

  // remote (origin) URL
  const remoteRes = await git(["remote", "get-url", "origin"], cwd);
  const remote = remoteRes.ok && remoteRes.stdout.trim() ? remoteRes.stdout.trim() : null;

  // upstream tracking branch + ahead/behind (since last fetch)
  let upstream: string | null = null;
  let ahead = 0;
  let behind = 0;
  const up = await git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], cwd);
  if (up.ok && up.stdout.trim() && !/no upstream/i.test(up.stdout)) {
    upstream = up.stdout.trim();
    const counts = await git(["rev-list", "--left-right", "--count", "@{u}...HEAD"], cwd);
    if (counts.ok) {
      const [b, a] = counts.stdout.trim().split(/\s+/).map((n) => parseInt(n, 10) || 0);
      behind = b || 0;
      ahead = a || 0;
    }
  }

  return {
    isRepo: true,
    branch,
    hasCommits,
    changes,
    clean: changes.length === 0,
    identityConfigured,
    lastCommit,
    remote,
    upstream,
    ahead,
    behind,
  };
}

export async function addRemote(url: string, cwd: string = CONTENT_DIR): Promise<RunResult> {
  const u = url.trim();
  if (!u) return { ok: false, stdout: "", stderr: "Remote URL is required" };
  // replace if origin already exists, else add
  const existing = await git(["remote", "get-url", "origin"], cwd);
  if (existing.ok) return git(["remote", "set-url", "origin", u], cwd);
  return git(["remote", "add", "origin", u], cwd);
}

export async function fetchRemote(cwd: string = CONTENT_DIR): Promise<RunResult> {
  return git(["fetch", "origin"], cwd);
}

export interface SyncResult {
  ok: boolean;
  error?: string;
  output?: string;
}

export async function pushRemote(cwd: string = CONTENT_DIR): Promise<SyncResult> {
  const status = await getStatus(cwd);
  if (!status.remote) return { ok: false, error: "No remote set. Add a remote URL first." };
  if (!status.hasCommits) return { ok: false, error: "Nothing to push — make a commit first." };
  // first push of this branch needs -u to set the upstream
  const args = status.upstream
    ? ["push", "origin", "HEAD"]
    : ["push", "-u", "origin", status.branch || "HEAD"];
  const res = await git(args, cwd);
  if (!res.ok) return { ok: false, error: friendlyRemoteError(res.stderr) };
  return { ok: true, output: (res.stderr || res.stdout).trim() };
}

export async function pullRemote(cwd: string = CONTENT_DIR): Promise<SyncResult> {
  const status = await getStatus(cwd);
  if (!status.remote) return { ok: false, error: "No remote set. Add a remote URL first." };
  // --no-edit avoids opening a merge-commit editor (which would hang the request);
  // core.editor=true is a belt-and-suspenders non-interactive fallback.
  const res = await git(["-c", "core.editor=true", "pull", "--no-edit"], cwd);
  if (!res.ok) {
    if (/conflict/i.test(res.stderr + res.stdout)) {
      return {
        ok: false,
        error:
          "Pull hit a merge conflict. Resolve it in your editor / terminal, then commit. (The app won't auto-resolve conflicts.)",
      };
    }
    return { ok: false, error: friendlyRemoteError(res.stderr) };
  }
  return { ok: true, output: (res.stdout || res.stderr).trim() };
}

function friendlyRemoteError(stderr: string): string {
  if (/Authentication failed|could not read Username|terminal prompts disabled|Permission denied|403/i.test(stderr)) {
    return (
      "Authentication failed talking to the remote. Set up Git credentials — e.g. run `gh auth setup-git` " +
      "in a terminal (you're logged into the GitHub CLI), or use an SSH remote. Then try again.\n\n" +
      stderr.trim()
    );
  }
  if (/Could not resolve host|unable to access|Connection|network/i.test(stderr)) {
    return "Network error reaching the remote. Check your connection and the remote URL.\n\n" + stderr.trim();
  }
  if (/rejected|non-fast-forward|fetch first/i.test(stderr)) {
    return "Push rejected — the remote has commits you don't. Pull first, then push.\n\n" + stderr.trim();
  }
  return stderr.trim() || "Git operation failed.";
}

export async function initRepo(cwd: string = CONTENT_DIR): Promise<RunResult> {
  // -b main works on git >= 2.28; falls back gracefully if already a repo
  const res = await git(["init", "-b", "main"], cwd);
  if (!res.ok) return git(["init"], cwd);
  return res;
}

export interface CommitInput {
  message: string;
  authorName?: string;
  authorEmail?: string;
  cwd?: string;
}

export interface CommitResult {
  ok: boolean;
  error?: string;
  hash?: string;
  summary?: string;
  committed?: number;
}

export async function commitAll(input: CommitInput): Promise<CommitResult> {
  const cwd = input.cwd ?? CONTENT_DIR;
  const message = input.message.trim();
  if (!message) return { ok: false, error: "Commit message is required" };

  // stage everything (respects .gitignore)
  const add = await git(["add", "-A"], cwd);
  if (!add.ok) return { ok: false, error: add.stderr };

  // nothing staged?
  const diff = await git(["diff", "--cached", "--name-only"], cwd);
  const staged = diff.stdout.split("\n").filter(Boolean);
  if (staged.length === 0) return { ok: false, error: "Nothing to commit — working tree clean." };

  // build commit args, injecting a per-commit identity if one was supplied
  const args: string[] = [];
  if (input.authorName && input.authorEmail) {
    args.push("-c", `user.name=${input.authorName}`, "-c", `user.email=${input.authorEmail}`);
  }
  args.push("commit", "-m", message);

  const res = await git(args, cwd);
  if (!res.ok) {
    let error = res.stderr;
    if (/Please tell me who you are|user\.email|user\.name|empty ident/i.test(res.stderr)) {
      error =
        "Git doesn't know who you are. Add your name and email below (saved on this device) and commit again.";
    }
    return { ok: false, error };
  }

  const log = await git(["log", "-1", "--pretty=%h %s"], cwd);
  return {
    ok: true,
    hash: log.ok ? log.stdout.trim().split(" ")[0] : undefined,
    summary: log.ok ? log.stdout.trim() : undefined,
    committed: staged.length,
  };
}
