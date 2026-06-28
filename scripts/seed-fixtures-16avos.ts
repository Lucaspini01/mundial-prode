/**
 * Script: seed-fixtures-16avos.ts
 * Carga los 16 partidos de 16avos de final (Round of 32) del Mundial 2026
 * en la Fecha existente (phase=DIECISEISAVOS, season=2026).
 * Es idempotente: omite matches que ya existen.
 *
 * Cruces y horarios verificados contra Wikipedia y Sky Sports (28/06/2026).
 * scheduledAt en UTC.
 *
 * Uso: npm run db:seed-16avos
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

// 16 partidos de 16avos. Nombres en español (como están en la BD).
const PARTIDOS: Partido[] = [
  { local: "Sudáfrica",            visitante: "Canadá",                utc: "2026-06-28T19:00:00Z" },
  { local: "Brasil",               visitante: "Japón",                 utc: "2026-06-29T17:00:00Z" },
  { local: "Alemania",             visitante: "Paraguay",              utc: "2026-06-29T20:30:00Z" },
  { local: "Países Bajos",         visitante: "Marruecos",             utc: "2026-06-30T01:00:00Z" },
  { local: "Costa de Marfil",      visitante: "Noruega",               utc: "2026-06-30T17:00:00Z" },
  { local: "Francia",              visitante: "Suecia",                utc: "2026-06-30T21:00:00Z" },
  { local: "México",               visitante: "Ecuador",               utc: "2026-07-01T01:00:00Z" },
  { local: "Inglaterra",           visitante: "DR Congo",              utc: "2026-07-01T16:00:00Z" },
  { local: "Bélgica",              visitante: "Senegal",               utc: "2026-07-01T20:00:00Z" },
  { local: "Estados Unidos",       visitante: "Bosnia y Herzegovina",  utc: "2026-07-02T00:00:00Z" },
  { local: "España",               visitante: "Austria",               utc: "2026-07-02T19:00:00Z" },
  { local: "Portugal",             visitante: "Croacia",               utc: "2026-07-02T23:00:00Z" },
  { local: "Suiza",                visitante: "Argelia",               utc: "2026-07-03T03:00:00Z" },
  { local: "Australia",            visitante: "Egipto",                utc: "2026-07-03T18:00:00Z" },
  { local: "Argentina",            visitante: "Cabo Verde",            utc: "2026-07-03T22:00:00Z" },
  { local: "Colombia",             visitante: "Ghana",                 utc: "2026-07-04T01:30:00Z" },
];

async function main() {
  console.log("⚽  Cargando fixture de 16avos de final...\n");

  const fecha = await prisma.fecha.findFirst({
    where: { phase: Phase.DIECISEISAVOS, season: 2026 },
  });
  if (!fecha) {
    throw new Error("No existe una Fecha con phase=DIECISEISAVOS season=2026. Creala primero en el admin.");
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
