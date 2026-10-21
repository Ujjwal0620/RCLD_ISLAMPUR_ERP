import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
const logEnabled = process.env.NODE_ENV !== "production";

function createClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Configure the Neon PostgreSQL connection in the deployment environment.");
  }
  return new PrismaClient({
    log: logEnabled ? ["warn","error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export async function checkDatabaseConnection() {
  await db.$queryRaw`SELECT 1`;
  return true;
}
