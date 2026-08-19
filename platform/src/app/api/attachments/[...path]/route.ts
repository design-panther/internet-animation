import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { ATTACHMENTS_DIR } from "@/lib/paths";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
  ".flac": "audio/flac",
  ".pdf": "application/pdf",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;
  const rel = parts.map(decodeURIComponent).join("/");
  const abs = path.normalize(path.join(ATTACHMENTS_DIR, rel));

  // prevent path traversal outside the attachments dir
  if (!abs.startsWith(path.normalize(ATTACHMENTS_DIR + path.sep))) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(abs).toLowerCase();
  const buf = fs.readFileSync(abs);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    },
  });
}
