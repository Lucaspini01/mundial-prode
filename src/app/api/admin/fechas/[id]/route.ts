import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session || !session.user.isAdmin) return null;
  return session;
}

// PATCH /api/admin/fechas/[id] — toggle isActive
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const fechaId = parseInt(id);
  const { isActive } = await req.json();

  if (isActive) {
    // Activar: desactivar todas primero
    await prisma.$transaction([
      prisma.fecha.updateMany({ data: { isActive: false } }),
      prisma.fecha.update({ where: { id: fechaId }, data: { isActive: true } }),
    ]);
  } else {
    await prisma.fecha.update({ where: { id: fechaId }, data: { isActive: false } });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/fechas/[id] — borrar fecha y sus partidos/predicciones
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const fechaId = parseInt(id);

  // Borrar predicciones → partidos → fecha (por foreign keys)
  const matches = await prisma.match.findMany({ where: { fechaId }, select: { id: true } });
  const matchIds = matches.map((m) => m.id);

  await prisma.$transaction([
    prisma.prediction.deleteMany({ where: { matchId: { in: matchIds } } }),
    prisma.match.deleteMany({ where: { fechaId } }),
    prisma.fecha.delete({ where: { id: fechaId } }),
  ]);

  return NextResponse.json({ ok: true });
}
