import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const club = await prisma.club.create({
    data: {
      name: "Algun Otro",
      shortName: "OTRO",
      logoPath: "/clubs/otros.svg",
    },
  });
  console.log(`✓ Club creado: ${club.name} (id: ${club.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
