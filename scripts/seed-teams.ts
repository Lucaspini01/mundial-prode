/**
 * Script: seed-teams.ts
 * Upsert de las 48 selecciones nacionales del Mundial 2026.
 * NO borra usuarios, fechas ni partidos — es seguro correr en cualquier momento.
 *
 * Uso: npm run db:seed-teams
 */

import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

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

const TEAMS = [
  // CONMEBOL
  { name: "Argentina",    shortName: "ARG", flagCode: "ar" },
  { name: "Brasil",       shortName: "BRA", flagCode: "br" },
  { name: "Colombia",     shortName: "COL", flagCode: "co" },
  { name: "Uruguay",      shortName: "URU", flagCode: "uy" },
  { name: "Ecuador",      shortName: "ECU", flagCode: "ec" },
  { name: "Venezuela",    shortName: "VEN", flagCode: "ve" },
  // CONCACAF
  { name: "Estados Unidos", shortName: "USA", flagCode: "us" },
  { name: "México",       shortName: "MEX", flagCode: "mx" },
  { name: "Canadá",       shortName: "CAN", flagCode: "ca" },
  { name: "Panamá",       shortName: "PAN", flagCode: "pa" },
  { name: "Costa Rica",   shortName: "CRC", flagCode: "cr" },
  { name: "Honduras",     shortName: "HON", flagCode: "hn" },
  // UEFA
  { name: "Alemania",     shortName: "GER", flagCode: "de" },
  { name: "Francia",      shortName: "FRA", flagCode: "fr" },
  { name: "España",       shortName: "ESP", flagCode: "es" },
  { name: "Inglaterra",   shortName: "ENG", flagCode: "gb-eng" },
  { name: "Portugal",     shortName: "POR", flagCode: "pt" },
  { name: "Países Bajos", shortName: "NED", flagCode: "nl" },
  { name: "Bélgica",      shortName: "BEL", flagCode: "be" },
  { name: "Italia",       shortName: "ITA", flagCode: "it" },
  { name: "Suiza",        shortName: "SUI", flagCode: "ch" },
  { name: "Croacia",      shortName: "CRO", flagCode: "hr" },
  { name: "Serbia",       shortName: "SRB", flagCode: "rs" },
  { name: "Polonia",      shortName: "POL", flagCode: "pl" },
  { name: "Austria",      shortName: "AUT", flagCode: "at" },
  { name: "Turquía",      shortName: "TUR", flagCode: "tr" },
  { name: "Escocia",      shortName: "SCO", flagCode: "gb-sct" },
  { name: "Rumania",      shortName: "ROU", flagCode: "ro" },
  { name: "Dinamarca",    shortName: "DEN", flagCode: "dk" },
  { name: "Albania",      shortName: "ALB", flagCode: "al" },
  { name: "Eslovenia",    shortName: "SVN", flagCode: "si" },
  { name: "Eslovaquia",   shortName: "SVK", flagCode: "sk" },
  // CAF
  { name: "Marruecos",    shortName: "MAR", flagCode: "ma" },
  { name: "Senegal",      shortName: "SEN", flagCode: "sn" },
  { name: "Nigeria",      shortName: "NGA", flagCode: "ng" },
  { name: "Camerún",      shortName: "CMR", flagCode: "cm" },
  { name: "Egipto",       shortName: "EGY", flagCode: "eg" },
  { name: "Congo RD",     shortName: "COD", flagCode: "cd" },
  { name: "Ghana",        shortName: "GHA", flagCode: "gh" },
  { name: "Sudáfrica",    shortName: "RSA", flagCode: "za" },
  { name: "Túnez",        shortName: "TUN", flagCode: "tn" },
  // AFC
  { name: "Japón",        shortName: "JPN", flagCode: "jp" },
  { name: "Corea del Sur", shortName: "KOR", flagCode: "kr" },
  { name: "Irán",         shortName: "IRN", flagCode: "ir" },
  { name: "Arabia Saudita", shortName: "KSA", flagCode: "sa" },
  { name: "Australia",    shortName: "AUS", flagCode: "au" },
  { name: "Qatar",        shortName: "QAT", flagCode: "qa" },
  { name: "Iraq",         shortName: "IRQ", flagCode: "iq" },
  // OFC
  { name: "Nueva Zelanda", shortName: "NZL", flagCode: "nz" },
];

async function main() {
  console.log("🏴  Sincronizando equipos nacionales...\n");

  let creados = 0;
  let actualizados = 0;

  for (const team of TEAMS) {
    const existing = await prisma.team.findUnique({ where: { name: team.name } });
    if (existing) {
      await prisma.team.update({ where: { name: team.name }, data: team });
      actualizados++;
    } else {
      await prisma.team.create({ data: team });
      creados++;
    }
  }

  console.log(`✅  ${creados} equipos creados, ${actualizados} actualizados`);
  console.log(`   Total en BD: ${creados + actualizados} selecciones`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("❌  Error:", e.message);
  await prisma.$disconnect();
  process.exit(1);
});
