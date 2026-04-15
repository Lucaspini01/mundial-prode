import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres." },
      { status: 400 }
    );
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    return NextResponse.json({ error: "Token inválido." }, { status: 400 });
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } });
    return NextResponse.json({ error: "El enlace expiró. Solicitá uno nuevo." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashed },
  });

  await prisma.passwordResetToken.delete({ where: { token } });

  return NextResponse.json({ ok: true });
}
