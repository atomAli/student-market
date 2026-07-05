import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password)
    return NextResponse.json({ error: "همه فیلدها الزامی است" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return NextResponse.json({ error: "این ایمیل قبلاً ثبت شده" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      emailVerified: false,
      verificationToken,
    },
  });

  await sendVerificationEmail(email, name, verificationToken);

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    message: "Please check your email to verify your account.",
  });
}
