import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.VERCEL
  ? "/tmp/uploads"
  : path.join(process.cwd(), "public", "uploads");

export async function POST(req) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file)
    return NextResponse.json({ error: "فایلی انتخاب نشده" }, { status: 400 });

  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type))
    return NextResponse.json({ error: "فقط عکس (jpg, png, webp) قابل قبوله" }, { status: 400 });

  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: "حجم عکس نباید بیشتر از ۵ مگابایت باشه" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = file.name.split(".").pop().toLowerCase();
  const filename = Date.now() + "-" + Math.random().toString(36).slice(2) + "." + ext;
  const filepath = path.join(UPLOAD_DIR, filename);
  await writeFile(filepath, buffer);

  const baseUrl = process.env.VERCEL
    ? process.env.NEXTAUTH_URL + "/api/uploads"
    : "";

  return NextResponse.json({ url: baseUrl + "/uploads/" + filename });
}
