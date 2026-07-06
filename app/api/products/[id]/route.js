import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function parseImages(product) {
  try {
    const parsed = JSON.parse(product.images || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return product.image ? [product.image] : [];
  }
}

export async function GET(req, { params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { seller: { select: { name: true, email: true } } },
  });

  if (!product)
    return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });

  return NextResponse.json({ ...product, images: parseImages(product) });
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.sellerId !== session.user.id)
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 403 });

  const updated = await prisma.product.update({ where: { id }, data: { sold: true, status: "rented" } });
  return NextResponse.json({ ...updated, images: parseImages(updated) });
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session)
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || (product.sellerId !== session.user.id && !session.user.isAdmin))
      return NextResponse.json({ error: "دسترسی ندارید" }, { status: 403 });

    await prisma.$executeRawUnsafe("DELETE FROM Message WHERE \"conversationId\" IN (SELECT id FROM Conversation WHERE \"productId\" = ?)", id);
    await prisma.$executeRawUnsafe("DELETE FROM Conversation WHERE \"productId\" = ?", id);
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "محصول حذف شد" });
  } catch (e) {
    return NextResponse.json({ error: "خطا در حذف محصول" }, { status: 500 });
  }
}
