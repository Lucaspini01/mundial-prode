import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, username, password, favoriteTeamId } = await req.json();

  if (!email || !username || !password) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  if (username.length < 3 || username.length > 20) {
    return NextResponse.json(
      { error: "El usuario debe tener entre 3 y 20 caracteres." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres." },
      { status: 400 }
    );
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json(
      { error: "Ese email ya está registrado." },
      { status: 409 }
    );
  }

  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    return NextResponse.json(
      { error: "Ese nombre de usuario ya está en uso." },
      { status: 409 }
    );
  }

  if (favoriteTeamId) {
    const teamExists = await prisma.team.findUnique({ where: { id: favoriteTeamId } });
    if (!teamExists) {
      return NextResponse.json({ error: "Selección inválida." }, { status: 400 });
    }
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, username, password: hashed, favoriteTeamId: favoriteTeamId ?? null },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
