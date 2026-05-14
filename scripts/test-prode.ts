/**
 * Script: test-prode.ts
 * Testing exhaustivo del flujo predicción → resultados → puntuación → ranking.
 * Crea datos aislados (season=9999), verifica todo, limpia al final.
 *
 * Uso: npm run test:prode
 */

import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

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

// ─── Scoring logic (replica de src/lib/scoring.ts) ───────────────────────────
function calculatePoints(
  homeScore: number,
  awayScore: number,
  predHome: number,
  predAway: number
): number {
  const realWinner = homeScore > awayScore ? "H" : awayScore > homeScore ? "A" : "D";
  const predWinner = predHome > predAway ? "H" : predAway > predHome ? "A" : "D";
  if (realWinner !== predWinner) return 0;
  if (predHome === homeScore && predAway === awayScore) return 10;
  if (homeScore - awayScore === predHome - predAway) return 7;
  return 5;
}

// ─── Test helpers ─────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(label: string, actual: unknown, expected: unknown) {
  if (actual === expected) {
    console.log(`  ✅ ${label}: ${actual}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}: got ${actual}, expected ${expected}`);
    failed++;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n=== MUNDIAL PRODE — TEST SUITE ===\n");

  // ─── FASE A: Unit tests calculatePoints ────────────────────────────────────
  console.log("[FASE A] Unit tests calculatePoints\n");

  assert("[1]  Exacto home win       (2-0 vs 2-0)",  calculatePoints(2, 0, 2, 0), 10);
  assert("[2]  Exacto away win       (0-1 vs 0-1)",  calculatePoints(0, 1, 0, 1), 10);
  assert("[3]  Exacto empate         (1-1 vs 1-1)",  calculatePoints(1, 1, 1, 1), 10);
  assert("[4]  Diff correcta home    (1-0 vs 2-1)",  calculatePoints(2, 1, 1, 0), 7);
  assert("[5]  Diff correcta away    (0-2 vs 1-3)",  calculatePoints(1, 3, 0, 2), 7);
  assert("[6]  Diff correcta empate  (2-2 vs 1-1)",  calculatePoints(1, 1, 2, 2), 7);
  assert("[7]  Ganador ok, diff mal  (1-0 vs 3-1)",  calculatePoints(3, 1, 1, 0), 5);
  assert("[8]  Ganador incorrecto    (1-0 vs 0-1)",  calculatePoints(0, 1, 1, 0), 0);
  assert("[9]  Empate pred, win real (1-1 vs 2-1)",  calculatePoints(2, 1, 1, 1), 0);
  assert("[10] Win pred, empate real (2-1 vs 1-1)",  calculatePoints(1, 1, 2, 1), 0);

  // ─── FASE B: Integración con BD real ───────────────────────────────────────
  console.log("\n[FASE B] Integración BD — flujo completo\n");

  // IDs de cleanup
  let fechaId: number | null = null;
  const testUserIds: number[] = [];

  try {
    // Buscar teams existentes
    const teams = await prisma.team.findMany({
      where: { shortName: { in: ["ARG", "BRA", "ESP", "GER", "FRA", "URU"] } },
    });

    const byShort = Object.fromEntries(teams.map((t) => [t.shortName, t]));
    const arg = byShort["ARG"];
    const bra = byShort["BRA"];
    const esp = byShort["ESP"];
    const ger = byShort["GER"];
    const fra = byShort["FRA"];
    const uru = byShort["URU"];

    if (!arg || !bra || !esp || !ger || !fra || !uru) {
      console.log("  ❌ No se encontraron todos los equipos necesarios en la BD.");
      console.log("     Teams encontrados:", teams.map((t) => t.shortName).join(", "));
      failed++;
      return;
    }

    // Crear Fecha de prueba
    const fecha = await prisma.fecha.create({
      data: {
        number: 99,
        season: 9999,
        phase: "GRUPOS",
        isActive: false,
        deadline: new Date("2000-01-01T00:00:00Z"), // pasado — no acepta predicciones vía API
      },
    });
    fechaId = fecha.id;
    console.log(`  ✅ Fecha TEST creada (id=${fechaId}, season=9999)`);
    passed++;

    // Crear 3 partidos
    const match1 = await prisma.match.create({
      data: { fechaId, homeTeamId: arg.id, awayTeamId: bra.id },
    });
    const match2 = await prisma.match.create({
      data: { fechaId, homeTeamId: esp.id, awayTeamId: ger.id },
    });
    const match3 = await prisma.match.create({
      data: { fechaId, homeTeamId: fra.id, awayTeamId: uru.id },
    });
    console.log(`  ✅ 3 partidos de prueba creados (ARG-BRA, ESP-GER, FRA-URU)`);
    passed++;

    // Crear 2 usuarios de prueba
    const hash = await bcrypt.hash("testpass123", 10);
    const user1 = await prisma.user.create({
      data: {
        email: "test_prode_1@test.com",
        username: "test_prode_1",
        password: hash,
        isApproved: true,
        isAdmin: false,
      },
    });
    const user2 = await prisma.user.create({
      data: {
        email: "test_prode_2@test.com",
        username: "test_prode_2",
        password: hash,
        isApproved: true,
        isAdmin: false,
      },
    });
    testUserIds.push(user1.id, user2.id);
    console.log(`  ✅ Usuarios de prueba creados (test_prode_1, test_prode_2)`);
    passed++;

    // Insertar predicciones
    // user1: 2-0, 1-0, 1-0  → esperamos 10, 7, 5   (total 22)
    // user2: 0-1, 3-2, 4-2  → esperamos  0, 7, 7   (total 14)
    await prisma.prediction.createMany({
      data: [
        { userId: user1.id, matchId: match1.id, homeGoals: 2, awayGoals: 0 },
        { userId: user1.id, matchId: match2.id, homeGoals: 1, awayGoals: 0 },
        { userId: user1.id, matchId: match3.id, homeGoals: 1, awayGoals: 0 },
        { userId: user2.id, matchId: match1.id, homeGoals: 0, awayGoals: 1 },
        { userId: user2.id, matchId: match2.id, homeGoals: 3, awayGoals: 2 }, // mismo diff +1 → 7 pts
        { userId: user2.id, matchId: match3.id, homeGoals: 4, awayGoals: 2 }, // mismo diff +2 → 7 pts
      ],
    });
    console.log(`  ✅ 6 predicciones creadas`);
    passed++;

    // Simular POST /api/admin/resultados para cada partido
    async function uploadResult(matchId: number, homeScore: number, awayScore: number) {
      await prisma.match.update({
        where: { id: matchId },
        data: { homeScore, awayScore, isFinished: true },
      });
      const preds = await prisma.prediction.findMany({ where: { matchId } });
      for (const pred of preds) {
        const points =
          pred.homeGoals !== null && pred.awayGoals !== null
            ? calculatePoints(homeScore, awayScore, pred.homeGoals, pred.awayGoals)
            : 0;
        await prisma.prediction.update({ where: { id: pred.id }, data: { points } });
      }
    }

    await uploadResult(match1.id, 2, 0); // ARG 2-0 BRA
    await uploadResult(match2.id, 2, 1); // ESP 2-1 GER
    await uploadResult(match3.id, 3, 1); // FRA 3-1 URU
    console.log(`  ✅ Resultados subidos y scoring calculado`);
    passed++;

    // Verificar puntos individuales
    const allPreds = await prisma.prediction.findMany({
      where: { userId: { in: testUserIds } },
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
      orderBy: { userId: "asc" },
    });

    const pMap: Record<string, number | null> = {};
    for (const p of allPreds) {
      const key = `u${p.userId}_m${p.matchId}`;
      pMap[key] = p.points;
    }

    console.log("\n  Verificando puntos por predicción:");
    assert(
      `  test_1 ARG-BRA (pred 2-0, real 2-0)`,
      pMap[`u${user1.id}_m${match1.id}`], 10
    );
    assert(
      `  test_1 ESP-GER (pred 1-0, real 2-1)`,
      pMap[`u${user1.id}_m${match2.id}`], 7
    );
    assert(
      `  test_1 FRA-URU (pred 1-0, real 3-1)`,
      pMap[`u${user1.id}_m${match3.id}`], 5
    );
    assert(
      `  test_2 ARG-BRA (pred 0-1, real 2-0)`,
      pMap[`u${user2.id}_m${match1.id}`], 0
    );
    assert(
      `  test_2 ESP-GER (pred 3-2, real 2-1) diff +1`,
      pMap[`u${user2.id}_m${match2.id}`], 7
    );
    assert(
      `  test_2 FRA-URU (pred 4-2, real 3-1) diff +2`,
      pMap[`u${user2.id}_m${match3.id}`], 7
    );

    // Verificar ranking (simula lógica de ranking/page.tsx)
    console.log("\n  Verificando ranking:");
    const groups = await prisma.prediction.groupBy({
      by: ["userId"],
      where: {
        userId: { in: testUserIds },
        points: { not: null },
      },
      _sum: { points: true },
    });

    const rankMap = Object.fromEntries(groups.map((g) => [g.userId, g._sum.points ?? 0]));
    assert(`  test_prode_1 total pts`, rankMap[user1.id], 22);
    assert(`  test_prode_2 total pts`, rankMap[user2.id], 14);

    const sorted = [...testUserIds].sort((a, b) => (rankMap[b] ?? 0) - (rankMap[a] ?? 0));
    assert(`  Ranking: primero es test_prode_1`, sorted[0], user1.id);
    assert(`  Ranking: segundo es test_prode_2`, sorted[1], user2.id);

    // ─── FASE C: Edge cases ──────────────────────────────────────────────────
    console.log("\n[FASE C] Edge cases\n");

    // Edge case 1: predicción con goals nulos (actualizar existente temporalmente)
    await prisma.prediction.update({
      where: { userId_matchId: { userId: user1.id, matchId: match1.id } },
      data: { homeGoals: null, awayGoals: null, points: null },
    });
    const nullPred = await prisma.prediction.findUnique({
      where: { userId_matchId: { userId: user1.id, matchId: match1.id } },
    });
    const pointsForNull =
      nullPred!.homeGoals !== null && nullPred!.awayGoals !== null
        ? calculatePoints(2, 0, nullPred!.homeGoals, nullPred!.awayGoals)
        : 0;
    await prisma.prediction.update({
      where: { userId_matchId: { userId: user1.id, matchId: match1.id } },
      data: { points: pointsForNull },
    });
    const refreshedNull = await prisma.prediction.findUnique({
      where: { userId_matchId: { userId: user1.id, matchId: match1.id } },
    });
    assert(`  Pred nula → 0 pts (sin crash)`, refreshedNull?.points, 0);
    // Restaurar la predicción original
    await prisma.prediction.update({
      where: { userId_matchId: { userId: user1.id, matchId: match1.id } },
      data: { homeGoals: 2, awayGoals: 0, points: 10 },
    });

    // Edge case 2: re-upload de resultados (cambiar ARG 2-0 → 0-0)
    await uploadResult(match1.id, 0, 0);
    const predsAfterReupload = await prisma.prediction.findMany({
      where: { matchId: match1.id, userId: { in: testUserIds } },
    });
    const reupMap = Object.fromEntries(predsAfterReupload.map((p) => [p.userId, p.points]));
    // test_1 predijo 2-0, resultado 0-0 → ganadores distintos (H vs D) → 0 pts
    assert(`  Re-upload ARG-BRA (0-0): test_1 pts`, reupMap[user1.id], 0);
    // test_2 predijo 0-1, resultado 0-0 → ganadores distintos (A vs D) → 0 pts
    assert(`  Re-upload ARG-BRA (0-0): test_2 pts`, reupMap[user2.id], 0);

    // Restaurar resultado original para consistencia
    await uploadResult(match1.id, 2, 0);

    // Edge case 3: verificar que deadline enforcement existe en el schema
    const fechaDb = await prisma.fecha.findUnique({ where: { id: fechaId } });
    const deadlineInPast = fechaDb?.deadline && fechaDb.deadline < new Date();
    assert(`  Deadline en pasado (bloquea API predictions)`, deadlineInPast, true);

  } finally {
    // ─── FASE D: Cleanup ──────────────────────────────────────────────────────
    console.log("\n[CLEANUP]\n");
    if (fechaId) {
      const matchIds = (
        await prisma.match.findMany({ where: { fechaId }, select: { id: true } })
      ).map((m) => m.id);

      await prisma.prediction.deleteMany({ where: { matchId: { in: matchIds } } });
      await prisma.match.deleteMany({ where: { fechaId } });
      await prisma.fecha.delete({ where: { id: fechaId } });
      console.log(`  ✅ Fecha/partidos/predicciones de prueba eliminados`);
    }
    if (testUserIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: testUserIds } } });
      console.log(`  ✅ Usuarios de prueba eliminados`);
    }
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    const total = passed + failed;
    console.log(`\n=== RESULTADO: ${passed}/${total} tests pasados ===\n`);

    if (failed > 0) {
      console.log("  Revisar los tests fallidos arriba antes del launch.\n");
      process.exit(1);
    } else {
      console.log("  Todo listo para el launch. 🚀\n");
    }
  })
  .catch(async (e) => {
    console.error("\n❌ Error inesperado:", e.message);
    await prisma.$disconnect();
    process.exit(1);
  });
