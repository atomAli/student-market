import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req, { params }) {
  const { filename } = await params;

  const safe = path.basename(filename);
  const filepath = path.join("/tmp/uploads", safe);

  try {
    const buffer = await readFile(filepath);
    const ext = safe.split(".").pop().toLowerCase();
    const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "gif" ? "image/gif" : "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
