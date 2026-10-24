import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema = z.object({
  code: z.string().trim().min(2).max(40),
  name: z.string().trim().min(2).max(120),
  courseId: z.string().min(1),
  capacity: z.coerce.number().int().min(1).max(50).default(50),
  status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"]).default("PLANNED"),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  startTime: z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/).optional().or(z.literal("")),
  endTime: z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/).optional().or(z.literal("")),
  room: z.string().trim().max(80).optional().or(z.literal("")),
}).refine((value) => !value.startTime || !value.endTime || value.startTime < value.endTime, {
  message: "Batch end time must be after start time.",
  path: ["endTime"],
});

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "batches.manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const b = schema.parse(await req.json());
    const course = await db.course.findUnique({ where: { id: b.courseId }, select: { id: true, active: true } });
    if (!course) return NextResponse.json({ error: "Selected course was not found." }, { status: 404 });
    if (!course.active) return NextResponse.json({ error: "Activate the course before creating a batch." }, { status: 400 });
    const batch = await db.batch.create({
      data: {
        code: b.code.toUpperCase(),
        name: b.name,
        courseId: b.courseId,
        capacity: b.capacity,
        status: b.status,
        startsAt: b.startsAt ? new Date(b.startsAt) : null,
        endsAt: b.endsAt ? new Date(b.endsAt) : null,
        startTime: b.startTime || null,
        endTime: b.endTime || null,
        room: b.room || null,
      },
    });
    await db.auditLog.create({ data: { actorUserId: user.id, action: "BATCH_CREATED", entityType: "Batch", entityId: batch.id, metadata: { code: batch.code, courseId: batch.courseId, startTime: batch.startTime, endTime: batch.endTime, room: batch.room } } });
    return NextResponse.json({ batch }, { status: 201 });
  } catch (e) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Batch code already exists." }, { status: 409 });
    if (e?.name === "ZodError") return NextResponse.json({ error: e.issues?.[0]?.message || "Invalid batch data." }, { status: 400 });
    return NextResponse.json({ error: "Unable to create batch." }, { status: 500 });
  }
}
