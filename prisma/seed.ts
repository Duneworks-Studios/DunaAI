import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { Plan, Role } from "../src/generated/prisma/enums";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL required for seeding");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const email = "admin@duneworks.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMeNow!123";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: "Duna Admin",
      username: "duna-admin",
      passwordHash,
      role: Role.ADMIN,
      plan: Plan.ENTERPRISE,
    },
    update: {
      passwordHash,
      role: Role.ADMIN,
      plan: Plan.ENTERPRISE,
    },
  });

  await prisma.$disconnect();
  await pool.end();
  console.info("Seed complete. Admin:", email);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
