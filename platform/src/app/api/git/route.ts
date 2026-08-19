import { NextResponse } from "next/server";
import {
  getStatus,
  initRepo,
  commitAll,
  addRemote,
  fetchRemote,
  pushRemote,
  pullRemote,
} from "@/lib/git";

export async function GET() {
  try {
    const status = await getStatus();
    return NextResponse.json(status);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "git status failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action as string;

    if (action === "init") {
      const res = await initRepo();
      if (!res.ok) return NextResponse.json({ error: res.stderr }, { status: 500 });
      const status = await getStatus();
      return NextResponse.json({ ok: true, status });
    }

    if (action === "commit") {
      const result = await commitAll({
        message: body.message ?? "",
        authorName: body.authorName,
        authorEmail: body.authorEmail,
      });
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
      const status = await getStatus();
      return NextResponse.json({ ...result, status });
    }

    if (action === "add-remote") {
      const res = await addRemote(body.url ?? "");
      if (!res.ok) return NextResponse.json({ error: res.stderr }, { status: 400 });
      const status = await getStatus();
      return NextResponse.json({ ok: true, status });
    }

    if (action === "fetch") {
      const res = await fetchRemote();
      const status = await getStatus();
      if (!res.ok) return NextResponse.json({ error: res.stderr, status }, { status: 400 });
      return NextResponse.json({ ok: true, status });
    }

    if (action === "push") {
      const result = await pushRemote();
      const status = await getStatus();
      if (!result.ok) return NextResponse.json({ error: result.error, status }, { status: 400 });
      return NextResponse.json({ ...result, status });
    }

    if (action === "pull") {
      const result = await pullRemote();
      const status = await getStatus();
      if (!result.ok) return NextResponse.json({ error: result.error, status }, { status: 400 });
      return NextResponse.json({ ...result, status });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "git action failed" },
      { status: 500 },
    );
  }
}
