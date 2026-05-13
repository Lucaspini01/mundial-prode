import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user.isAdmin) return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const requests = await prisma.supportRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}
