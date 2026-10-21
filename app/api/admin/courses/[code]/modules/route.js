import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";

const schema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  published: z.boolean().default(true),
});

async function authorize() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "lms.manage")) return null;
  return user;
}

export async function POST(request, { params }) {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { code } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid module data" }, { status: 400 });

  const course = await db.course.findUnique({ where: { code: code.toUpperCase() } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const module = await db.courseModule.create({
    data: { courseId: course.id, ...parsed.data },
  });

  await db.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "CREATE",
      entityType: "CourseModule",
      entityId: module.id,
      metadata: { course: course.code },
    },
  });

  return NextResponse.json({ module });
}

export async function PUT(request, { params }) {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { code } = await params;
  const body = await request.json();
  const moduleId = typeof body.moduleId === "string" ? body.moduleId : "";
  const parsed = schema.safeParse(body);

  if (!moduleId || !parsed.success) {
    return NextResponse.json({ error: "Invalid module data" }, { status: 400 });
  }

  const course = await db.course.findUnique({ where: { code: code.toUpperCase() } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const existing = await db.courseModule.findFirst({
    where: { id: moduleId, courseId: course.id },
  });
  if (!existing) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const module = await db.courseModule.update({
    where: { id: moduleId },
    data: parsed.data,
  });

  await db.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "UPDATE",
      entityType: "CourseModule",
      entityId: module.id,
      metadata: { course: course.code },
    },
  });

  return NextResponse.json({ module });
}

export async function DELETE(request, { params }) {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { code } = await params;
  const body = await request.json().catch(() => ({}));
  const moduleId = typeof body.moduleId === "string" ? body.moduleId : "";

  if (!moduleId) return NextResponse.json({ error: "Module id is required" }, { status: 400 });

  const course = await db.course.findUnique({ where: { code: code.toUpperCase() } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const existing = await db.courseModule.findFirst({
    where: { id: moduleId, courseId: course.id },
  });
  if (!existing) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  await db.courseModule.delete({ where: { id: moduleId } });

  await db.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "DELETE",
      entityType: "CourseModule",
      entityId: moduleId,
      metadata: { course: course.code, title: existing.title },
    },
  });

  return NextResponse.json({ success: true });
}
