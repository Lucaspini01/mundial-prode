import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session || !session.user.isAdmin) return null;
  return session;
}

// PATCH /api/admin/fechas/[id]
// Body { isActive } → toggle active (per tira)
// Body { number, season, tira, deadline } → edit fecha fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const fechaId = parseInt(id);
  const body = await req.json();

  if ("isActive" in body) {
    const { isActive } = body;
    if (isActive) {
      const fecha = await prisma.fecha.findUnique({ where: { id: fechaId }, select: { tira: true } });
      if (!fecha) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await prisma.$transaction([
        prisma.fecha.updateMany({ where: { tira: fecha.tira }, data: { isActive: false } }),
        prisma.fecha.update({ where: { id: fechaId }, data: { isActive: true } }),
      ]);
    } else {
      await prisma.fecha.update({ where: { id: fechaId }, data: { isActive: false } });
    }
  } else {
    const { number, season, tira, deadline } = body;
    if (!number || !season || !tira) {
      return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
    }
    await prisma.fecha.update({
      where: { id: fechaId },
      data: { number, season, tira, deadline: deadline ? new Date(deadline) : null },
    });
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

  const matches = await prisma.match.findMany({ where: { fechaId }, select: { id: true } });
  const matchIds = matches.map((m) => m.id);

  await prisma.$transaction([
    prisma.prediction.deleteMany({ where: { matchId: { in: matchIds } } }),
    prisma.match.deleteMany({ where: { fechaId } }),
    prisma.fecha.delete({ where: { id: fechaId } }),
  ]);

  return NextResponse.json({ ok: true });
}
