import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/db";

export const dynamic="force-dynamic";

export async function GET() {
  const checks={database:false};
  try { checks.database=await checkDatabaseConnection(); } catch {}
  const healthy=checks.database;
  return NextResponse.json({ok:healthy,checks,timestamp:new Date().toISOString()},{status:healthy?200:503});
}
