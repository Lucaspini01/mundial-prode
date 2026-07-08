/**
 * Script: seed-fixtures-cuartos.ts
 * Crea la Fecha de cuartos de final (phase=CUARTOS, season=2026) si no existe,
 * carga los 4 partidos, la activa y desactiva la Fecha de octavos.
 * Es idempotente: omite matches que ya existen.
 *
 * Cruces y horarios verificados contra fifa.com y fuentes oficiales (08/07/2026).
 * scheduledAt en UTC.
 *
 * Uso: npm run db:seed-cuartos
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

// 4 partidos de cuartos de final. Nombres en español (como están en la BD).
const PARTIDOS: Partido[] = [
  { local: "Francia",   visitante: "Marruecos",  utc: "2026-07-09T20:00:00Z" },
  { local: "España",    visitante: "Bélgica",    utc: "2026-07-10T19:00:00Z" },
  { local: "Noruega",   visitante: "Inglaterra", utc: "2026-07-11T21:00:00Z" },
  { local: "Argentina", visitante: "Suiza",      utc: "2026-07-12T01:00:00Z" },
];

async function main() {
  console.log("⚽  Cargando fixture de cuartos de final...\n");

  let fecha = await prisma.fecha.findFirst({
    where: { phase: Phase.CUARTOS, season: 2026 },
  });

  if (!fecha) {
    const maxNumber = await prisma.fecha.aggregate({
      where: { season: 2026 },
      _max: { number: true },
    });
    fecha = await prisma.fecha.create({
      data: {
        number: (maxNumber._max.number ?? 0) + 1,
        season: 2026,
        phase: Phase.CUARTOS,
        isActive: false,
      },
    });
    console.log(`  Fecha CUARTOS creada: id=${fecha.id} number=${fecha.number}\n`);
  } else {
    console.log(`  Fecha destino: id=${fecha.id} number=${fecha.number} isActive=${fecha.isActive}\n`);
  }

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

  // Activar CUARTOS y desactivar el resto (octavos incluido)
  await prisma.$transaction([
    prisma.fecha.updateMany({ data: { isActive: false } }),
    prisma.fecha.update({ where: { id: fecha.id }, data: { isActive: true } }),
  ]);
  console.log(`\n  Fecha CUARTOS activada (id=${fecha.id})`);

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
