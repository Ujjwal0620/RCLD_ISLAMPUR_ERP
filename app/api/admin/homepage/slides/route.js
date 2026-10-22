import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const slideSchema = z.object({
  id: z.string().optional(),
  eyebrow: z.string().trim().max(100).optional().nullable(),
  title: z.string().trim().min(2).max(120),
  accent: z.string().trim().max(120).optional().nullable(),
  description: z.string().trim().max(500).optional().nullable(),
  imageUrl: z.string().trim().url(),
  primaryLabel: z.string().trim().max(50).optional().nullable(),
  primaryHref: z.string().trim().max(250).optional().nullable(),
  secondaryLabel: z.string().trim().max(50).optional().nullable(),
  secondaryHref: z.string().trim().max(250).optional().nullable(),
  statLabel: z.string().trim().max(80).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(100).default(0),
  active: z.boolean().default(true),
});

async function authorize() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "cms.edit")) return null;
  return user;
}

export async function GET() {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const slides = await db.homeSlide.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json({ slides });
}

export async function POST(req) {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = slideSchema.parse(await req.json());
    const { id, ...data } = body;
    const slide = id
      ? await db.homeSlide.update({ where: { id }, data })
      : await db.homeSlide.create({ data });
    await db.auditLog.create({ data: { actorUserId: user.id, action: id ? "HOME_SLIDE_UPDATED" : "HOME_SLIDE_CREATED", entityType: "HomeSlide", entityId: slide.id } });
    return NextResponse.json({ slide });
  } catch (error) {
    return NextResponse.json({ error: "Invalid homepage slide data" }, { status: 400 });
  }
}

export async function DELETE(req) {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(await req.json());
    await db.homeSlide.delete({ where: { id } });
    await db.auditLog.create({ data: { actorUserId: user.id, action: "HOME_SLIDE_DELETED", entityType: "HomeSlide", entityId: id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete slide" }, { status: 400 });
  }
}
