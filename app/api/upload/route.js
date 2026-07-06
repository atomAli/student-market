import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const USE_TMP = process.env.VERCEL === "1";
const UPLOAD_DIR = USE_TMP
  ? "/tmp/uploads"
  : path.join(process.cwd(), "public", "uploads");

const MAX_WIDTH = 1920;
const JPEG_QUALITY = 70;
const WEBP_QUALITY = 75;

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
  let buffer = Buffer.from(bytes);

  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    if (metadata.width > MAX_WIDTH || metadata.height > MAX_WIDTH) {
      image.resize({ width: MAX_WIDTH, height: MAX_WIDTH, fit: "inside", withoutEnlargement: true });
    }
    const ext = metadata.format === "png" ? "webp" : metadata.format;
    if (ext === "jpeg") buffer = await image.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    else if (ext === "webp") buffer = await image.webp({ quality: WEBP_QUALITY }).toBuffer();
    else if (ext === "png") buffer = await image.webp({ quality: WEBP_QUALITY }).toBuffer();
    else buffer = await image.toBuffer();
  } catch (e) {
    console.error("Sharp processing failed, saving original:", e.message);
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = file.name.split(".").pop().toLowerCase();
  const finalExt = ext === "png" ? "webp" : ext;
  const filename = Date.now() + "-" + Math.random().toString(36).slice(2) + "." + finalExt;
  const filepath = path.join(UPLOAD_DIR, filename);
  await writeFile(filepath, buffer);

  const url = USE_TMP
    ? process.env.NEXTAUTH_URL + "/api/uploads/" + filename
    : "/uploads/" + filename;

  return NextResponse.json({ url });
}
