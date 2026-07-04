/**
 * Script: seed-fixtures-octavos.ts
 * Carga los 8 partidos de octavos de final (Round of 16) del Mundial 2026
 * en la Fecha existente (phase=OCTAVOS, season=2026).
 * Es idempotente: omite matches que ya existen.
 *
 * Cruces y horarios verificados contra fifa.com (04/07/2026).
 * scheduledAt en UTC.
 *
 * Uso: npm run db:seed-octavos
 */

import { readFileSync } from "fs";
import { PrismaClient, Phase } from "@prisma/client";

for (const file of [".env.local", ".env"]) {
  try {
    const lines = readFileSync(file, "utf8").split("\n");
    for (const line of lines) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)="?([^"]*)"?\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}

const prisma = new PrismaClient();

interface Partido {
  local: string;
  visitante: string;
  utc: string; // ISO en UTC
}

// 8 partidos de octavos. Nombres en español (como están en la BD).
const PARTIDOS: Partido[] = [
  { local: "Canadá",       visitante: "Marruecos",      utc: "2026-07-04T17:00:00Z" },
  { local: "Paraguay",     visitante: "Francia",        utc: "2026-07-04T21:00:00Z" },
  { local: "Brasil",       visitante: "Noruega",        utc: "2026-07-05T20:00:00Z" },
  { local: "México",       visitante: "Inglaterra",     utc: "2026-07-06T00:00:00Z" },
  { local: "Portugal",     visitante: "España",         utc: "2026-07-06T19:00:00Z" },
  { local: "Estados Unidos", visitante: "Bélgica",       utc: "2026-07-07T00:00:00Z" },
  { local: "Argentina",    visitante: "Egipto",         utc: "2026-07-07T16:00:00Z" },
  { local: "Suiza",        visitante: "Colombia",       utc: "2026-07-07T20:00:00Z" },
];

async function main() {
  console.log("⚽  Cargando fixture de octavos de final...\n");

  const fecha = await prisma.fecha.findFirst({
    where: { phase: Phase.OCTAVOS, season: 2026 },
  });
  if (!fecha) {
    throw new Error("No existe una Fecha con phase=OCTAVOS season=2026. Creala primero en el admin.");
  }
  console.log(`  Fecha destino: id=${fecha.id} number=${fecha.number} isActive=${fecha.isActive}\n`);

  const allTeams = await prisma.team.findMany({ select: { id: true, name: true } });
  const teamMap = new Map(allTeams.map((t) => [t.name, t.id]));

  let creados = 0;
  let omitidos = 0;
  const errores: string[] = [];

  for (const p of PARTIDOS) {
    const homeId = teamMap.get(p.local);
    const awayId = teamMap.get(p.visitante);

    if (!homeId || !awayId) {
      const missing = [!homeId && p.local, !awayId && p.visitante].filter(Boolean).join(", ");
      errores.push(`Equipo no encontrado: ${missing}`);
      continue;
    }

    const existing = await prisma.match.findFirst({
      where: { fechaId: fecha.id, homeTeamId: homeId, awayTeamId: awayId },
    });
    if (existing) {
      omitidos++;
      continue;
    }

    await prisma.match.create({
      data: {
        fechaId: fecha.id,
        homeTeamId: homeId,
        awayTeamId: awayId,
        scheduledAt: new Date(p.utc),
      },
    });
    creados++;
    console.log(`  + ${p.local} vs ${p.visitante}`);
  }

  // Set deadline de la fecha al primer partido (si no tiene)
  const firstKickoff = new Date(
    PARTIDOS.map((p) => p.utc).sort()[0]
  );
  if (!fecha.deadline) {
    await prisma.fecha.update({
      where: { id: fecha.id },
      data: { deadline: firstKickoff },
    });
    console.log(`\n  Deadline de la fecha seteado a ${firstKickoff.toISOString()}`);
  }

  console.log(`\n✅  ${creados} partidos creados, ${omitidos} ya existían`);
  if (errores.length > 0) {
    console.log(`\n⚠️  Errores (${errores.length}):`);
    errores.forEach((e) => console.log(`   - ${e}`));
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("❌  Error:", e.message);
  await prisma.$disconnect();
  process.exit(1);
});
