import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const IS_PROD = process.env.VERCEL === "1";
const UPLOAD_DIR = IS_PROD
  ? "/tmp/uploads"
  : path.join(process.cwd(), "public", "uploads");

const MAX_WIDTH = 1920;
const JPEG_QUALITY = 72;

export async function POST(req) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file)
    return NextResponse.json({ error: "فایلی انتخاب نشده" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  let buffer = Buffer.from(bytes);

  try {
    const img = sharp(buffer);
    const meta = await img.metadata();
    if (meta.width > MAX_WIDTH || meta.height > MAX_WIDTH)
      img.resize({ width: MAX_WIDTH, height: MAX_WIDTH, fit: "inside", withoutEnlargement: true });
    buffer = await img.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  } catch {
    return NextResponse.json({ error: "فرمت عکس پشتیبانی نمیشه" }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const filepath = path.join(UPLOAD_DIR, filename);
  await writeFile(filepath, buffer);

  const url = IS_PROD
    ? process.env.NEXTAUTH_URL + "/api/uploads/" + filename
    : "/uploads/" + filename;

  return NextResponse.json({ url });
}
