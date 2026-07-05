import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function checkAdmin(session) {
  if (!session) return false;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return user?.isAdmin === true;
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!await checkAdmin(session))
    return NextResponse.json({ error: "فقط ادمین می‌تواند دسته‌بندی حذف کند" }, { status: 403 });

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ message: "حذف شد" });
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!await checkAdmin(session))
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 403 });

  const { name, icon } = await req.json();
  const category = await prisma.category.update({
    where: { id },
    data: { ...(name && { name }), ...(icon && { icon }) },
  });
  return NextResponse.json(category);
}
