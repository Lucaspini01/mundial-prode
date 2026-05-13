import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user.isAdmin) return null;
  return session;
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const requestId = parseInt(id);
  if (isNaN(requestId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  await prisma.supportRequest.update({
    where: { id: requestId },
    data: { isResolved: true },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const requestId = parseInt(id);
  if (isNaN(requestId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  await prisma.supportRequest.delete({ where: { id: requestId } });

  return NextResponse.json({ ok: true });
}
