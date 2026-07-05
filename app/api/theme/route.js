import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const DEFAULT = {
  primary: "#4f46e5",
  navFrom: "#312e81",
  navTo:   "#4338ca",
  bgFrom:  "#eef2ff",
  bgTo:    "#f0fdf4",
  accent:  "#4f46e5",
};

export async function GET() {
  let theme = await prisma.themeConfig.findUnique({ where: { id: "default" } });
  if (!theme) {
    theme = await prisma.themeConfig.create({ data: { id: "default", ...DEFAULT } });
  }
  return NextResponse.json(theme);
}

export async function POST(req) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });

  const body = await req.json();
  const allowed = ["primary", "navFrom", "navTo", "bgFrom", "bgTo", "accent"];
  const data = {};
  for (const key of allowed) {
    if (body[key]) data[key] = body[key];
  }

  const theme = await prisma.themeConfig.upsert({
    where:  { id: "default" },
    update: data,
    create: { id: "default", ...DEFAULT, ...data },
  });

  return NextResponse.json(theme);
}
