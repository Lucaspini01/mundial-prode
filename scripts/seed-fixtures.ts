/**
 * Script: seed-fixtures.ts
 * Carga los 72 partidos de la fase de grupos del Mundial 2026.
 * Crea 3 Fechas (Jornada 1-3, phase=GRUPOS) y un Match por partido.
 * Es idempotente: omite matches que ya existen.
 *
 * Uso: npm run db:seed-fixtures
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
  jornada: number;
  fecha_iso: string;
  horario_et: string;
  equipo_local: string;
  equipo_visitante: string;
}

// 72 partidos de fase de grupos — horarios en EDT (UTC-4)
const PARTIDOS: Partido[] = [
  // JORNADA 1
  { jornada: 1, fecha_iso: "2026-06-11", horario_et: "15:00", equipo_local: "México",               equipo_visitante: "Sudáfrica" },
  { jornada: 1, fecha_iso: "2026-06-11", horario_et: "22:00", equipo_local: "Corea del Sur",        equipo_visitante: "Chequia" },
  { jornada: 1, fecha_iso: "2026-06-12", horario_et: "15:00", equipo_local: "Canadá",               equipo_visitante: "Bosnia y Herzegovina" },
  { jornada: 1, fecha_iso: "2026-06-12", horario_et: "21:00", equipo_local: "Estados Unidos",       equipo_visitante: "Paraguay" },
  { jornada: 1, fecha_iso: "2026-06-13", horario_et: "00:00", equipo_local: "Australia",            equipo_visitante: "Turquía" },
  { jornada: 1, fecha_iso: "2026-06-13", horario_et: "15:00", equipo_local: "Qatar",                equipo_visitante: "Suiza" },
  { jornada: 1, fecha_iso: "2026-06-13", horario_et: "18:00", equipo_local: "Brasil",               equipo_visitante: "Marruecos" },
  { jornada: 1, fecha_iso: "2026-06-13", horario_et: "21:00", equipo_local: "Haití",                equipo_visitante: "Escocia" },
  { jornada: 1, fecha_iso: "2026-06-14", horario_et: "13:00", equipo_local: "Alemania",             equipo_visitante: "Curazao" },
  { jornada: 1, fecha_iso: "2026-06-14", horario_et: "16:00", equipo_local: "Países Bajos",         equipo_visitante: "Japón" },
  { jornada: 1, fecha_iso: "2026-06-14", horario_et: "19:00", equipo_local: "Costa de Marfil",      equipo_visitante: "Ecuador" },
  { jornada: 1, fecha_iso: "2026-06-14", horario_et: "22:00", equipo_local: "Suecia",               equipo_visitante: "Túnez" },
  { jornada: 1, fecha_iso: "2026-06-15", horario_et: "12:00", equipo_local: "España",               equipo_visitante: "Cabo Verde" },
  { jornada: 1, fecha_iso: "2026-06-15", horario_et: "15:00", equipo_local: "Bélgica",              equipo_visitante: "Egipto" },
  { jornada: 1, fecha_iso: "2026-06-15", horario_et: "18:00", equipo_local: "Arabia Saudita",       equipo_visitante: "Uruguay" },
  { jornada: 1, fecha_iso: "2026-06-15", horario_et: "21:00", equipo_local: "Irán",                 equipo_visitante: "Nueva Zelanda" },
  { jornada: 1, fecha_iso: "2026-06-16", horario_et: "00:00", equipo_local: "Austria",              equipo_visitante: "Jordania" },
  { jornada: 1, fecha_iso: "2026-06-16", horario_et: "15:00", equipo_local: "Francia",              equipo_visitante: "Senegal" },
  { jornada: 1, fecha_iso: "2026-06-16", horario_et: "18:00", equipo_local: "Iraq",                 equipo_visitante: "Noruega" },
  { jornada: 1, fecha_iso: "2026-06-16", horario_et: "21:00", equipo_local: "Argentina",            equipo_visitante: "Argelia" },
  { jornada: 1, fecha_iso: "2026-06-17", horario_et: "13:00", equipo_local: "Portugal",             equipo_visitante: "DR Congo" },
  { jornada: 1, fecha_iso: "2026-06-17", horario_et: "16:00", equipo_local: "Inglaterra",           equipo_visitante: "Croacia" },
  { jornada: 1, fecha_iso: "2026-06-17", horario_et: "19:00", equipo_local: "Ghana",                equipo_visitante: "Panamá" },
  { jornada: 1, fecha_iso: "2026-06-17", horario_et: "22:00", equipo_local: "Uzbekistán",           equipo_visitante: "Colombia" },
  // JORNADA 2
  { jornada: 2, fecha_iso: "2026-06-18", horario_et: "12:00", equipo_local: "Chequia",              equipo_visitante: "Sudáfrica" },
  { jornada: 2, fecha_iso: "2026-06-18", horario_et: "15:00", equipo_local: "Suiza",                equipo_visitante: "Bosnia y Herzegovina" },
  { jornada: 2, fecha_iso: "2026-06-18", horario_et: "18:00", equipo_local: "Canadá",               equipo_visitante: "Qatar" },
  { jornada: 2, fecha_iso: "2026-06-18", horario_et: "21:00", equipo_local: "México",               equipo_visitante: "Corea del Sur" },
  { jornada: 2, fecha_iso: "2026-06-19", horario_et: "00:00", equipo_local: "Turquía",              equipo_visitante: "Paraguay" },
  { jornada: 2, fecha_iso: "2026-06-19", horario_et: "15:00", equipo_local: "Estados Unidos",       equipo_visitante: "Australia" },
  { jornada: 2, fecha_iso: "2026-06-19", horario_et: "18:00", equipo_local: "Escocia",              equipo_visitante: "Marruecos" },
  { jornada: 2, fecha_iso: "2026-06-19", horario_et: "21:00", equipo_local: "Brasil",               equipo_visitante: "Haití" },
  { jornada: 2, fecha_iso: "2026-06-20", horario_et: "00:00", equipo_local: "Túnez",                equipo_visitante: "Japón" },
  { jornada: 2, fecha_iso: "2026-06-20", horario_et: "13:00", equipo_local: "Países Bajos",         equipo_visitante: "Suecia" },
  { jornada: 2, fecha_iso: "2026-06-20", horario_et: "16:00", equipo_local: "Alemania",             equipo_visitante: "Costa de Marfil" },
  { jornada: 2, fecha_iso: "2026-06-20", horario_et: "20:00", equipo_local: "Ecuador",              equipo_visitante: "Curazao" },
  { jornada: 2, fecha_iso: "2026-06-21", horario_et: "12:00", equipo_local: "España",               equipo_visitante: "Arabia Saudita" },
  { jornada: 2, fecha_iso: "2026-06-21", horario_et: "15:00", equipo_local: "Bélgica",              equipo_visitante: "Irán" },
  { jornada: 2, fecha_iso: "2026-06-21", horario_et: "18:00", equipo_local: "Uruguay",              equipo_visitante: "Cabo Verde" },
  { jornada: 2, fecha_iso: "2026-06-21", horario_et: "21:00", equipo_local: "Nueva Zelanda",        equipo_visitante: "Egipto" },
  { jornada: 2, fecha_iso: "2026-06-22", horario_et: "13:00", equipo_local: "Argentina",            equipo_visitante: "Austria" },
  { jornada: 2, fecha_iso: "2026-06-22", horario_et: "17:00", equipo_local: "Francia",              equipo_visitante: "Iraq" },
  { jornada: 2, fecha_iso: "2026-06-22", horario_et: "20:00", equipo_local: "Noruega",              equipo_visitante: "Senegal" },
  { jornada: 2, fecha_iso: "2026-06-22", horario_et: "23:00", equipo_local: "Jordania",             equipo_visitante: "Argelia" },
  { jornada: 2, fecha_iso: "2026-06-23", horario_et: "13:00", equipo_local: "Portugal",             equipo_visitante: "Uzbekistán" },
  { jornada: 2, fecha_iso: "2026-06-23", horario_et: "16:00", equipo_local: "Inglaterra",           equipo_visitante: "Ghana" },
  { jornada: 2, fecha_iso: "2026-06-23", horario_et: "19:00", equipo_local: "Panamá",               equipo_visitante: "Croacia" },
  { jornada: 2, fecha_iso: "2026-06-23", horario_et: "22:00", equipo_local: "Colombia",             equipo_visitante: "DR Congo" },
  // JORNADA 3 (partidos simultáneos por grupo)
  { jornada: 3, fecha_iso: "2026-06-24", horario_et: "15:00", equipo_local: "Suiza",                equipo_visitante: "Canadá" },
  { jornada: 3, fecha_iso: "2026-06-24", horario_et: "15:00", equipo_local: "Bosnia y Herzegovina", equipo_visitante: "Qatar" },
  { jornada: 3, fecha_iso: "2026-06-24", horario_et: "18:00", equipo_local: "Escocia",              equipo_visitante: "Brasil" },
  { jornada: 3, fecha_iso: "2026-06-24", horario_et: "18:00", equipo_local: "Marruecos",            equipo_visitante: "Haití" },
  { jornada: 3, fecha_iso: "2026-06-24", horario_et: "21:00", equipo_local: "Chequia",              equipo_visitante: "México" },
  { jornada: 3, fecha_iso: "2026-06-24", horario_et: "21:00", equipo_local: "Sudáfrica",            equipo_visitante: "Corea del Sur" },
  { jornada: 3, fecha_iso: "2026-06-25", horario_et: "16:00", equipo_local: "Ecuador",              equipo_visitante: "Alemania" },
  { jornada: 3, fecha_iso: "2026-06-25", horario_et: "16:00", equipo_local: "Curazao",              equipo_visitante: "Costa de Marfil" },
  { jornada: 3, fecha_iso: "2026-06-25", horario_et: "19:00", equipo_local: "Japón",                equipo_visitante: "Suecia" },
  { jornada: 3, fecha_iso: "2026-06-25", horario_et: "19:00", equipo_local: "Túnez",                equipo_visitante: "Países Bajos" },
  { jornada: 3, fecha_iso: "2026-06-25", horario_et: "22:00", equipo_local: "Turquía",              equipo_visitante: "Estados Unidos" },
  { jornada: 3, fecha_iso: "2026-06-25", horario_et: "22:00", equipo_local: "Paraguay",             equipo_visitante: "Australia" },
  { jornada: 3, fecha_iso: "2026-06-26", horario_et: "20:00", equipo_local: "Cabo Verde",           equipo_visitante: "Arabia Saudita" },
  { jornada: 3, fecha_iso: "2026-06-26", horario_et: "20:00", equipo_local: "Uruguay",              equipo_visitante: "España" },
  { jornada: 3, fecha_iso: "2026-06-26", horario_et: "23:00", equipo_local: "Egipto",               equipo_visitante: "Irán" },
  { jornada: 3, fecha_iso: "2026-06-26", horario_et: "23:00", equipo_local: "Nueva Zelanda",        equipo_visitante: "Bélgica" },
  { jornada: 3, fecha_iso: "2026-06-26", horario_et: "15:00", equipo_local: "Noruega",              equipo_visitante: "Francia" },
  { jornada: 3, fecha_iso: "2026-06-26", horario_et: "15:00", equipo_local: "Senegal",              equipo_visitante: "Iraq" },
  { jornada: 3, fecha_iso: "2026-06-27", horario_et: "17:00", equipo_local: "Panamá",               equipo_visitante: "Inglaterra" },
  { jornada: 3, fecha_iso: "2026-06-27", horario_et: "17:00", equipo_local: "Croacia",              equipo_visitante: "Ghana" },
  { jornada: 3, fecha_iso: "2026-06-27", horario_et: "19:30", equipo_local: "Colombia",             equipo_visitante: "Portugal" },
  { jornada: 3, fecha_iso: "2026-06-27", horario_et: "19:30", equipo_local: "DR Congo",             equipo_visitante: "Uzbekistán" },
  { jornada: 3, fecha_iso: "2026-06-27", horario_et: "22:00", equipo_local: "Argelia",              equipo_visitante: "Austria" },
  { jornada: 3, fecha_iso: "2026-06-27", horario_et: "22:00", equipo_local: "Jordania",             equipo_visitante: "Argentina" },
];

// Deadlines: primer partido de cada jornada (EDT = UTC-4)
const JORNADA_DEADLINES: Record<number, string> = {
  1: "2026-06-11T15:00:00-04:00",
  2: "2026-06-18T12:00:00-04:00",
  3: "2026-06-24T15:00:00-04:00",
};

async function main() {
  console.log("⚽  Cargando fixture de fase de grupos...\n");

  // Obtener o crear las 3 Fechas
  const fechas: Record<number, number> = {}; // jornada → fechaId

  for (const jornada of [1, 2, 3]) {
    const existing = await prisma.fecha.findFirst({
      where: { number: jornada, phase: Phase.GRUPOS, season: 2026 },
    });
    if (existing) {
      fechas[jornada] = existing.id;
      console.log(`  Jornada ${jornada}: ya existe (id=${existing.id})`);
    } else {
      const created = await prisma.fecha.create({
        data: {
          number: jornada,
          phase: Phase.GRUPOS,
          season: 2026,
          isActive: false,
          deadline: new Date(JORNADA_DEADLINES[jornada]),
        },
      });
      fechas[jornada] = created.id;
      console.log(`  Jornada ${jornada}: creada (id=${created.id})`);
    }
  }

  console.log();

  // Precargar todos los equipos en un mapa nombre → id
  const allTeams = await prisma.team.findMany({ select: { id: true, name: true } });
  const teamMap = new Map(allTeams.map((t) => [t.name, t.id]));

  let creados = 0;
  let omitidos = 0;
  const errores: string[] = [];

  for (const p of PARTIDOS) {
    const homeId = teamMap.get(p.equipo_local);
    const awayId = teamMap.get(p.equipo_visitante);

    if (!homeId || !awayId) {
      const missing = [!homeId && p.equipo_local, !awayId && p.equipo_visitante]
        .filter(Boolean)
        .join(", ");
      errores.push(`Equipo no encontrado: ${missing}`);
      continue;
    }

    const fechaId = fechas[p.jornada];

    // Idempotente: skip si ya existe este match en esta fecha
    const existing = await prisma.match.findFirst({
      where: { fechaId, homeTeamId: homeId, awayTeamId: awayId },
    });
    if (existing) {
      omitidos++;
      continue;
    }

    // scheduledAt en EDT (UTC-4)
    const scheduledAt = new Date(`${p.fecha_iso}T${p.horario_et}:00-04:00`);

    await prisma.match.create({
      data: { fechaId, homeTeamId: homeId, awayTeamId: awayId, scheduledAt },
    });
    creados++;
  }

  console.log(`✅  ${creados} partidos creados, ${omitidos} ya existían`);
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
