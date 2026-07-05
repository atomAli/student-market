import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ isAdmin: false });
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return NextResponse.json({ isAdmin: user?.isAdmin ?? false });
}
