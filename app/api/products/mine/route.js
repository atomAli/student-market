import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { seller: { select: { id: true, name: true, email: true } } },
  });

  const parsed = products.map((p) => ({
    ...p,
    images: (() => { try { return JSON.parse(p.images); } catch { return []; } })(),
  }));

  return NextResponse.json(parsed);
}
