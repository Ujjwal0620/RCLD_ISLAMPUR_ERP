import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
const logEnabled = process.env.NODE_ENV !== "production";

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is missing. Configure the Neon PostgreSQL connection in Vercel/local environment.");
  }
  return new PrismaClient({ log: logEnabled ? ["warn", "error"] : ["error"] });
}

function getClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

// Lazy proxy prevents a missing production DATABASE_URL from breaking the Vercel build.
// The database is initialized only when a server request actually uses it.
export const db = new Proxy({}, {
  get(_target, property) {
    const client = getClient();
    return client[property];
  },
});

export async function checkDatabaseConnection() {
  await getClient().$queryRaw`SELECT 1`;
  return true;
}
