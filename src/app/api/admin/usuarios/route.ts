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

  const users = await prisma.user.findMany({
    orderBy: [{ isApproved: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      username: true,
      isAdmin: true,
      isApproved: true,
      hasPaid: true,
      createdAt: true,
      favoriteTeam: { select: { flagCode: true, shortName: true, name: true } },
    },
  });

  return NextResponse.json(users);
}
