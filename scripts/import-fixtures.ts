/**
 * Script: import-fixtures.ts
 * Importa todos los partidos del Mundial 2026 desde API-Football a Prisma.
 *
 * Uso: npm run db:import
 *
 * Comportamiento:
 *  - Crea Fechas por ronda (idempotente: no duplica si ya existen)
 *  - Crea o actualiza Matches (idempotente)
 *  - Imprime equipos sin mapeo para que puedas agregarlos manualmente
 */

import { readFileSync } from "fs";
import { PrismaClient, Phase } from "@prisma/client";

// Cargar .env.local y .env (Prisma lee .env automáticamente para DATABASE_URL,
// pero API_FOOTBALL_KEY vive en .env.local y necesita carga manual fuera de Next.js)
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
const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";
const SEASON = 2026;
const LEAGUE_ID = 1; // FIFA World Cup en API-Football

// ─── Mapeo: nombre API (inglés) → nombre en BD (español) ─────────────────────
const TEAM_NAME_MAP: Record<string, string> = {
  // CONMEBOL
  Argentina: "Argentina",
  Brazil: "Brasil",
  Colombia: "Colombia",
  Uruguay: "Uruguay",
  Ecuador: "Ecuador",
  Venezuela: "Venezuela",
  // CONCACAF
  "United States": "Estados Unidos",
  USA: "Estados Unidos",
  Mexico: "México",
  Canada: "Canadá",
  Panama: "Panamá",
  "Costa Rica": "Costa Rica",
  Honduras: "Honduras",
  // UEFA
  Germany: "Alemania",
  France: "Francia",
  Spain: "España",
  England: "Inglaterra",
  Portugal: "Portugal",
  Netherlands: "Países Bajos",
  Belgium: "Bélgica",
  Italy: "Italia",
  Switzerland: "Suiza",
  Croatia: "Croacia",
  Serbia: "Serbia",
  Poland: "Polonia",
  Austria: "Austria",
  Turkey: "Turquía",
  Türkiye: "Turquía",
  Scotland: "Escocia",
  Romania: "Rumania",
  Denmark: "Dinamarca",
  Albania: "Albania",
  Slovenia: "Eslovenia",
  Slovakia: "Eslovaquia",
  // CAF
  Morocco: "Marruecos",
  Senegal: "Senegal",
  Nigeria: "Nigeria",
  Cameroon: "Camerún",
  Egypt: "Egipto",
  "Congo DR": "Congo RD",
  "DR Congo": "Congo RD",
  "Democratic Republic of Congo": "Congo RD",
  Ghana: "Ghana",
  "South Africa": "Sudáfrica",
  Tunisia: "Túnez",
  // AFC
  Japan: "Japón",
  "South Korea": "Corea del Sur",
  "Korea Republic": "Corea del Sur",
  Iran: "Irán",
  "Saudi Arabia": "Arabia Saudita",
  Australia: "Australia",
  Qatar: "Qatar",
  Iraq: "Iraq",
  // OFC
  "New Zealand": "Nueva Zelanda",
};

// ─── Mapeo: ronda de la API → Phase + Fecha.number ───────────────────────────
type RoundMapping = { phase: Phase; number: number };

function parseRound(round: string): RoundMapping | null {
  const groupMatch = round.match(/Group Stage\s*[-–]\s*(\d+)/i);
  if (groupMatch) return { phase: "GRUPOS", number: parseInt(groupMatch[1]) };
  if (/round of 16/i.test(round)) return { phase: "OCTAVOS", number: 1 };
  if (/quarter.?final/i.test(round)) return { phase: "CUARTOS", number: 1 };
  if (/semi.?final/i.test(round)) return { phase: "SEMIFINAL", number: 1 };
  if (/3rd place|third place/i.test(round)) return { phase: "TERCER_PUESTO", number: 1 };
  if (/^final$/i.test(round.trim())) return { phase: "FINAL", number: 1 };
  return null;
}

// ─── Llamada a la API ─────────────────────────────────────────────────────────
async function apiGet(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "x-apisports-key": API_KEY!,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`API HTTP ${res.status} en: ${endpoint}`);
  const json = (await res.json()) as any;
  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(`API error: ${JSON.stringify(json.errors)}`);
  }
  return json;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!API_KEY) {
    console.error("❌  API_FOOTBALL_KEY no encontrada. Revisá .env.local");
    process.exit(1);
  }

  console.log("═══════════════════════════════════════════════════════");
  console.log("🌍  IMPORTACIÓN MUNDIAL 2026 — API-Football → Prisma");
  console.log("═══════════════════════════════════════════════════════\n");

  // 1. Cargar equipos de la BD
  const dbTeams = await prisma.team.findMany();
  const teamByName = new Map(dbTeams.map((t) => [t.name, t]));

  function resolveTeam(apiName: string) {
    const dbName = TEAM_NAME_MAP[apiName] ?? apiName;
    return teamByName.get(dbName) ?? null;
  }

  // 2. Descargar fixtures
  console.log("📡  Consultando API-Football...");
  const data = await apiGet(`/fixtures?league=${LEAGUE_ID}&season=${SEASON}`);
  const fixtures: any[] = data.response ?? [];

  if (fixtures.length === 0) {
    console.log("⚠️   La API no devolvió fixtures para la temporada", SEASON);
    console.log("     El torneo puede no estar disponible aún en la API.\n");
    console.log("     Rounds disponibles en API-Football: /leagues?id=1&season=2026");
    await prisma.$disconnect();
    return;
  }

  console.log(`     ✅ ${fixtures.length} fixtures recibidos\n`);

  // 3. Agrupar por ronda y ordenar
  const byRound = new Map<string, any[]>();
  for (const f of fixtures) {
    const round: string = f.league.round;
    if (!byRound.has(round)) byRound.set(round, []);
    byRound.get(round)!.push(f);
  }

  // 4. Procesar cada ronda
  let fechasCreadas = 0;
  let matchesCreados = 0;
  let matchesActualizados = 0;
  const equiposSinMapeo = new Set<string>();
  const rondasIgnoradas: string[] = [];

  for (const [round, roundFixtures] of byRound) {
    const mapping = parseRound(round);
    if (!mapping) {
      rondasIgnoradas.push(round);
      continue;
    }

    // Buscar o crear Fecha (idempotente)
    let fecha = await prisma.fecha.findFirst({
      where: { phase: mapping.phase, number: mapping.number, season: SEASON },
    });

    if (!fecha) {
      fecha = await prisma.fecha.create({
        data: {
          number: mapping.number,
          season: SEASON,
          phase: mapping.phase,
          isActive: false,
        },
      });
      fechasCreadas++;
    }

    console.log(
      `📅  ${mapping.phase.padEnd(13)} Fecha ${mapping.number}  (${roundFixtures.length} partidos)`
    );

    // Procesar cada partido de la ronda
    for (const f of roundFixtures) {
      const homeApiName: string = f.teams.home.name;
      const awayApiName: string = f.teams.away.name;

      const homeTeam = resolveTeam(homeApiName);
      const awayTeam = resolveTeam(awayApiName);

      if (!homeTeam) { equiposSinMapeo.add(homeApiName); continue; }
      if (!awayTeam) { equiposSinMapeo.add(awayApiName); continue; }

      const scheduledAt = f.fixture.date ? new Date(f.fixture.date) : null;
      const statusShort: string = f.fixture.status?.short ?? "";
      const isFinished = ["FT", "AET", "PEN"].includes(statusShort);
      const homeScore = isFinished ? (f.goals.home ?? null) : null;
      const awayScore = isFinished ? (f.goals.away ?? null) : null;

      // Buscar match existente por equipo local + visitante + fecha
      const existing = await prisma.match.findFirst({
        where: {
          fechaId: fecha.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
        },
      });

      if (existing) {
        await prisma.match.update({
          where: { id: existing.id },
          data: { scheduledAt, isFinished, homeScore, awayScore },
        });
        matchesActualizados++;
      } else {
        await prisma.match.create({
          data: {
            fechaId: fecha.id,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            scheduledAt,
            isFinished,
            homeScore,
            awayScore,
          },
        });
        matchesCreados++;
      }
    }
  }

  // 5. Resumen
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("✅  IMPORTACIÓN COMPLETADA");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`   Fechas creadas:        ${fechasCreadas}`);
  console.log(`   Matches creados:       ${matchesCreados}`);
  console.log(`   Matches actualizados:  ${matchesActualizados}`);

  if (rondasIgnoradas.length > 0) {
    console.log(`\n⚠️   Rondas no reconocidas (omitidas):`);
    for (const r of rondasIgnoradas) console.log(`     - "${r}"`);
  }

  if (equiposSinMapeo.size > 0) {
    console.log(`\n⚠️   Equipos sin mapeo en TEAM_NAME_MAP (${equiposSinMapeo.size}):`);
    for (const name of equiposSinMapeo) {
      console.log(`     - "${name}"`);
    }
    console.log(
      "     → Agregá estos nombres a TEAM_NAME_MAP en scripts/import-fixtures.ts"
    );
  }

  console.log("");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("\n❌  Error:", e.message);
  await prisma.$disconnect();
  process.exit(1);
});
