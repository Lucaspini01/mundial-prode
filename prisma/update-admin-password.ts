import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const newPassword = await bcrypt.hash("soyeladmin123", 10);
  await prisma.user.update({
    where: { username: "admin" },
    data: { password: newPassword },
  });
  console.log("✓ Contraseña del admin actualizada.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
