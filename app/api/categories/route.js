import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) return NextResponse.json({ error: "فقط ادمین می‌تواند دسته‌بندی اضافه کند" }, { status: 403 });

  const { name, icon } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "نام دسته‌بندی الزامی است" }, { status: 400 });

  const existing = await prisma.category.findUnique({ where: { name: name.trim() } });
  if (existing) return NextResponse.json({ error: "این دسته‌بندی قبلاً وجود دارد" }, { status: 400 });

  const last = await prisma.category.findFirst({ orderBy: { order: "desc" } });
  const category = await prisma.category.create({
    data: { name: name.trim(), icon: icon || "📦", order: (last?.order ?? 0) + 1 },
  });
  return NextResponse.json(category, { status: 201 });
}
