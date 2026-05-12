import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user.isAdmin) return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const userId = parseInt(id);
  if (isNaN(userId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  const body = await req.json();
  const data: { isApproved?: boolean; isAdmin?: boolean } = {};
  if (typeof body.isApproved === "boolean") data.isApproved = body.isApproved;
  if (typeof body.isAdmin === "boolean") data.isAdmin = body.isAdmin;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Sin cambios." }, { status: 400 });
  }

  const updated = await prisma.user.update({ where: { id: userId }, data });
  return NextResponse.json({ id: updated.id, isApproved: updated.isApproved, isAdmin: updated.isAdmin });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const userId = parseInt(id);
  if (isNaN(userId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  if (user.isAdmin) return NextResponse.json({ error: "No se puede eliminar un administrador." }, { status: 403 });

  await prisma.prediction.deleteMany({ where: { userId } });
  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ ok: true });
}
