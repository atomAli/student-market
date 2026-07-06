import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const IS_PROD = process.env.VERCEL === "1";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const MAX_WIDTH = 1920;
const JPEG_QUALITY = 70;
const WEBP_QUALITY = 75;

function compress(buffer) {
  const image = sharp(buffer);
  return image.metadata().then(meta => {
    if (meta.width > MAX_WIDTH || meta.height > MAX_WIDTH) {
      image.resize({ width: MAX_WIDTH, height: MAX_WIDTH, fit: "inside", withoutEnlargement: true });
    }
    const fmt = meta.format;
    if (fmt === "jpeg") return image.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    if (fmt === "webp") return image.webp({ quality: WEBP_QUALITY }).toBuffer();
    if (fmt === "png") return image.webp({ quality: WEBP_QUALITY }).toBuffer();
    if (fmt === "heif" || fmt === "heic") return image.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    if (fmt === "gif") return image.gif().toBuffer();
    return image.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  });
}

export async function POST(req) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file)
    return NextResponse.json({ error: "فایلی انتخاب نشده" }, { status: 400 });

  if (file.type && !file.type.startsWith("image/"))
    return NextResponse.json({ error: "فقط عکس قابل قبوله" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  let buffer = Buffer.from(bytes);

  try {
    buffer = await compress(buffer);
  } catch {
    return NextResponse.json({ error: "فرمت عکس پشتیبانی نمیشه" }, { status: 400 });
  }

  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2);
  const filename = `${ts}-${rand}.jpg`;

  if (IS_PROD) {
    try {
      const { UTApi } = await import("uploadthing/server");
      const utapi = new UTApi();
      const result = await utapi.uploadFiles(new File([buffer], filename, { type: "image/jpeg" }));
      const url = result.data?.url ?? result.data?.ufsUrl;
      if (url) return NextResponse.json({ url });
    } catch (e) {
      console.error("UploadThing failed, falling back to local:", e.message);
    }
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filepath = path.join(UPLOAD_DIR, filename);
  await writeFile(filepath, buffer);

  const url = IS_PROD
    ? process.env.NEXTAUTH_URL + "/api/uploads/" + filename
    : "/uploads/" + filename;

  return NextResponse.json({ url });
}
