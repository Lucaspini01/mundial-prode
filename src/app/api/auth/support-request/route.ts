import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email, message } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email requerido." }, { status: 400 });
  }

  await prisma.supportRequest.create({
    data: { email: email.trim(), message: message?.trim() || null },
  });

  return NextResponse.json({ ok: true });
}
