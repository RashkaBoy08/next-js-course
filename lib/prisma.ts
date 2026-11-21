import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { taskflowPrisma?: PrismaClient };

export function getPrisma() {
  if (globalForPrisma.taskflowPrisma) return globalForPrisma.taskflowPrisma;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Database is not configured yet.");
  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") globalForPrisma.taskflowPrisma = client;
  return client;
}
