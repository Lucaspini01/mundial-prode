import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const teams = [
  // Grupo A
  { name: "México",              shortName: "MEX", flagCode: "mx",     group: "A" },
  { name: "Sudáfrica",           shortName: "RSA", flagCode: "za",     group: "A" },
  { name: "Corea del Sur",       shortName: "KOR", flagCode: "kr",     group: "A" },
  { name: "Chequia",             shortName: "CZE", flagCode: "cz",     group: "A" },
  // Grupo B
  { name: "Canadá",              shortName: "CAN", flagCode: "ca",     group: "B" },
  { name: "Suiza",               shortName: "SUI", flagCode: "ch",     group: "B" },
  { name: "Qatar",               shortName: "QAT", flagCode: "qa",     group: "B" },
  { name: "Bosnia y Herzegovina",shortName: "BIH", flagCode: "ba",     group: "B" },
  // Grupo C
  { name: "Brasil",              shortName: "BRA", flagCode: "br",     group: "C" },
  { name: "Marruecos",           shortName: "MAR", flagCode: "ma",     group: "C" },
  { name: "Haití",               shortName: "HAI", flagCode: "ht",     group: "C" },
  { name: "Escocia",             shortName: "SCO", flagCode: "gb-sct", group: "C" },
  // Grupo D
  { name: "Estados Unidos",      shortName: "USA", flagCode: "us",     group: "D" },
  { name: "Paraguay",            shortName: "PAR", flagCode: "py",     group: "D" },
  { name: "Australia",           shortName: "AUS", flagCode: "au",     group: "D" },
  { name: "Turquía",             shortName: "TUR", flagCode: "tr",     group: "D" },
  // Grupo E
  { name: "Alemania",            shortName: "GER", flagCode: "de",     group: "E" },
  { name: "Curazao",             shortName: "CUW", flagCode: "cw",     group: "E" },
  { name: "Costa de Marfil",     shortName: "CIV", flagCode: "ci",     group: "E" },
  { name: "Ecuador",             shortName: "ECU", flagCode: "ec",     group: "E" },
  // Grupo F
  { name: "Países Bajos",        shortName: "NED", flagCode: "nl",     group: "F" },
  { name: "Japón",               shortName: "JPN", flagCode: "jp",     group: "F" },
  { name: "Túnez",               shortName: "TUN", flagCode: "tn",     group: "F" },
  { name: "Suecia",              shortName: "SWE", flagCode: "se",     group: "F" },
  // Grupo G
  { name: "Bélgica",             shortName: "BEL", flagCode: "be",     group: "G" },
  { name: "Egipto",              shortName: "EGY", flagCode: "eg",     group: "G" },
  { name: "Irán",                shortName: "IRN", flagCode: "ir",     group: "G" },
  { name: "Nueva Zelanda",       shortName: "NZL", flagCode: "nz",     group: "G" },
  // Grupo H
  { name: "España",              shortName: "ESP", flagCode: "es",     group: "H" },
  { name: "Cabo Verde",          shortName: "CPV", flagCode: "cv",     group: "H" },
  { name: "Arabia Saudita",      shortName: "KSA", flagCode: "sa",     group: "H" },
  { name: "Uruguay",             shortName: "URU", flagCode: "uy",     group: "H" },
  // Grupo I
  { name: "Francia",             shortName: "FRA", flagCode: "fr",     group: "I" },
  { name: "Senegal",             shortName: "SEN", flagCode: "sn",     group: "I" },
  { name: "Noruega",             shortName: "NOR", flagCode: "no",     group: "I" },
  { name: "Iraq",                shortName: "IRQ", flagCode: "iq",     group: "I" },
  // Grupo J
  { name: "Argentina",           shortName: "ARG", flagCode: "ar",     group: "J" },
  { name: "Argelia",             shortName: "ALG", flagCode: "dz",     group: "J" },
  { name: "Austria",             shortName: "AUT", flagCode: "at",     group: "J" },
  { name: "Jordania",            shortName: "JOR", flagCode: "jo",     group: "J" },
  // Grupo K
  { name: "Portugal",            shortName: "POR", flagCode: "pt",     group: "K" },
  { name: "Colombia",            shortName: "COL", flagCode: "co",     group: "K" },
  { name: "Uzbekistán",          shortName: "UZB", flagCode: "uz",     group: "K" },
  { name: "DR Congo",            shortName: "COD", flagCode: "cd",     group: "K" },
  // Grupo L
  { name: "Inglaterra",          shortName: "ENG", flagCode: "gb-eng", group: "L" },
  { name: "Croacia",             shortName: "CRO", flagCode: "hr",     group: "L" },
  { name: "Ghana",               shortName: "GHA", flagCode: "gh",     group: "L" },
  { name: "Panamá",              shortName: "PAN", flagCode: "pa",     group: "L" },
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

  console.log("Creating admin users...");
  const adminPassword = await bcrypt.hash("admin123", 10);
  const lucasPassword = await bcrypt.hash("lucas2026", 10);

  await prisma.user.createMany({
    data: [
      {
        email: "admin@mundial-prode.com",
        username: "admin",
        password: adminPassword,
        favoriteTeamId: null,
        isAdmin: true,
        isApproved: true,
      },
      {
        email: "lucas@prode.com",
        username: "Lucas",
        password: lucasPassword,
        favoriteTeamId: null,
        isAdmin: true,
        isApproved: true,
      },
    ],
  });

  console.log("\n✓ Seed completado.");
  console.log("  Admin 1: admin@mundial-prode.com / admin123");
  console.log("  Admin 2: lucas@prode.com / lucas2026");
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
