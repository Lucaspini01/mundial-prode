import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const teams = [
  // CONMEBOL
  { name: "Argentina", shortName: "ARG", flagCode: "ar" },
  { name: "Brasil", shortName: "BRA", flagCode: "br" },
  { name: "Colombia", shortName: "COL", flagCode: "co" },
  { name: "Uruguay", shortName: "URU", flagCode: "uy" },
  { name: "Ecuador", shortName: "ECU", flagCode: "ec" },
  { name: "Venezuela", shortName: "VEN", flagCode: "ve" },
  // CONCACAF
  { name: "Estados Unidos", shortName: "USA", flagCode: "us" },
  { name: "México", shortName: "MEX", flagCode: "mx" },
  { name: "Canadá", shortName: "CAN", flagCode: "ca" },
  { name: "Panamá", shortName: "PAN", flagCode: "pa" },
  { name: "Costa Rica", shortName: "CRC", flagCode: "cr" },
  { name: "Honduras", shortName: "HON", flagCode: "hn" },
  // UEFA
  { name: "Alemania", shortName: "GER", flagCode: "de" },
  { name: "Francia", shortName: "FRA", flagCode: "fr" },
  { name: "España", shortName: "ESP", flagCode: "es" },
  { name: "Inglaterra", shortName: "ENG", flagCode: "gb-eng" },
  { name: "Portugal", shortName: "POR", flagCode: "pt" },
  { name: "Países Bajos", shortName: "NED", flagCode: "nl" },
  { name: "Bélgica", shortName: "BEL", flagCode: "be" },
  { name: "Italia", shortName: "ITA", flagCode: "it" },
  { name: "Suiza", shortName: "SUI", flagCode: "ch" },
  { name: "Croacia", shortName: "CRO", flagCode: "hr" },
  { name: "Serbia", shortName: "SRB", flagCode: "rs" },
  { name: "Polonia", shortName: "POL", flagCode: "pl" },
  { name: "Austria", shortName: "AUT", flagCode: "at" },
  { name: "Turquía", shortName: "TUR", flagCode: "tr" },
  { name: "Escocia", shortName: "SCO", flagCode: "gb-sct" },
  { name: "Rumania", shortName: "ROU", flagCode: "ro" },
  { name: "Dinamarca", shortName: "DEN", flagCode: "dk" },
  { name: "Albania", shortName: "ALB", flagCode: "al" },
  { name: "Eslovenia", shortName: "SVN", flagCode: "si" },
  { name: "Eslovaquia", shortName: "SVK", flagCode: "sk" },
  // CAF
  { name: "Marruecos", shortName: "MAR", flagCode: "ma" },
  { name: "Senegal", shortName: "SEN", flagCode: "sn" },
  { name: "Nigeria", shortName: "NGA", flagCode: "ng" },
  { name: "Camerún", shortName: "CMR", flagCode: "cm" },
  { name: "Egipto", shortName: "EGY", flagCode: "eg" },
  { name: "Congo RD", shortName: "COD", flagCode: "cd" },
  { name: "Ghana", shortName: "GHA", flagCode: "gh" },
  { name: "Sudáfrica", shortName: "RSA", flagCode: "za" },
  { name: "Túnez", shortName: "TUN", flagCode: "tn" },
  // AFC
  { name: "Japón", shortName: "JPN", flagCode: "jp" },
  { name: "Corea del Sur", shortName: "KOR", flagCode: "kr" },
  { name: "Irán", shortName: "IRN", flagCode: "ir" },
  { name: "Arabia Saudita", shortName: "KSA", flagCode: "sa" },
  { name: "Australia", shortName: "AUS", flagCode: "au" },
  { name: "Qatar", shortName: "QAT", flagCode: "qa" },
  { name: "Iraq", shortName: "IRQ", flagCode: "iq" },
  // OFC / Playoffs
  { name: "Nueva Zelanda", shortName: "NZL", flagCode: "nz" },
];

async function main() {
  console.log("Limpiando base de datos...");
  await prisma.prediction.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.fecha.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.team.deleteMany({});

  console.log("Seeding teams...");
  for (const team of teams) {
    await prisma.team.create({ data: team });
  }

  console.log("Creating admin user...");
  const adminPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      username: "admin",
      password: adminPassword,
      favoriteTeamId: null,
      isAdmin: true,
    },
  });

  console.log("\n✓ Seed completado.");
  console.log("  Admin: admin / admin123");
  console.log(`  Equipos cargados: ${teams.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
