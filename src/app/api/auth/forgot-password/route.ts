import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Falta el email." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid email enumeration
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  // Delete existing tokens for this user
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, resetUrl);

  return NextResponse.json({ ok: true });
}
