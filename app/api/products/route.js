import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function parseImages(value, fallback) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return fallback ? [fallback] : [];
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const city = searchParams.get("city");
  const search = searchParams.get("search");

  const where = {
    status: "active",
    ...(category ? { category } : {}),
    ...(city ? { city } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { address: { contains: search } },
          ],
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    include: { seller: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    products.map((p) => ({ ...p, images: parseImages(p.images, p.image) }))
  );
}

export async function POST(req) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });

  const { title, description, price, category, city, images, address, latitude, longitude, telegram } = await req.json();
  if (!title || !description || !price || !category)
    return NextResponse.json({ error: "فیلدهای اجباری را پر کنید" }, { status: 400 });

  const imagesArr = Array.isArray(images) ? images : [];
  const coverImage = imagesArr[0] || null;

  const product = await prisma.product.create({
    data: {
      title,
      description,
      price: parseFloat(price),
      category,
      city: city || "Messina",
      address: address || null,
      latitude: latitude !== null && latitude !== undefined && latitude !== "" ? parseFloat(latitude) : null,
      longitude: longitude !== null && longitude !== undefined && longitude !== "" ? parseFloat(longitude) : null,
      image: coverImage,
      images: JSON.stringify(imagesArr),
      telegram: telegram || null,
      sellerId: session.user.id,
      status: "pending",
    },
    include: { seller: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ ...product, images: imagesArr }, { status: 201 });
}
