import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });

  await prisma.$executeRawUnsafe("DELETE FROM Message WHERE \"conversationId\" IN (SELECT id FROM Conversation WHERE \"productId\" = ?)", id);
  await prisma.$executeRawUnsafe("DELETE FROM Conversation WHERE \"productId\" = ?", id);
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ message: "rejected and deleted" });
}
