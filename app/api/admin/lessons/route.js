import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import { getYouTubeVideoId } from "@/lib/youtube";

const schema = z.object({
  moduleId: z.string().min(1),
  title: z.string().min(2).max(200),
  description: z.string().max(3000).optional(),
  videoUrl: z.string().max(1000).optional(),
  videoProvider: z.enum(["youtube"]).default("youtube"),
  resourceUrl: z.string().max(1000).optional(),
  durationMinutes: z.coerce.number().int().min(0).max(10000).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  published: z.boolean().default(true),
});

async function authorize() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "lms.manage")) return null;
  return user;
}

function validateVideo(data) {
  if (data.videoUrl && !getYouTubeVideoId(data.videoUrl)) {
    return "Enter a valid YouTube video URL or video ID.";
  }
  return null;
}

async function verifyModule(moduleId) {
  return db.courseModule.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });
}

export async function POST(request) {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid lesson data" }, { status: 400 });

  const videoError = validateVideo(parsed.data);
  if (videoError) return NextResponse.json({ error: videoError }, { status: 400 });

  const module = await verifyModule(parsed.data.moduleId);
  if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const lesson = await db.lesson.create({ data: parsed.data });

  await db.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "CREATE",
      entityType: "Lesson",
      entityId: lesson.id,
      metadata: { course: module.course.code, module: module.title },
    },
  });

  return NextResponse.json({ lesson });
}

export async function PUT(request) {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const lessonId = typeof body.lessonId === "string" ? body.lessonId : "";
  const parsed = schema.safeParse(body);

  if (!lessonId || !parsed.success) {
    return NextResponse.json({ error: "Invalid lesson data" }, { status: 400 });
  }

  const videoError = validateVideo(parsed.data);
  if (videoError) return NextResponse.json({ error: videoError }, { status: 400 });

  const module = await verifyModule(parsed.data.moduleId);
  if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const existing = await db.lesson.findFirst({
    where: { id: lessonId, module: { courseId: module.courseId } },
  });
  if (!existing) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const lesson = await db.lesson.update({
    where: { id: lessonId },
    data: parsed.data,
  });

  await db.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "UPDATE",
      entityType: "Lesson",
      entityId: lesson.id,
      metadata: { course: module.course.code, module: module.title },
    },
  });

  return NextResponse.json({ lesson });
}

export async function DELETE(request) {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const lessonId = typeof body.lessonId === "string" ? body.lessonId : "";
  if (!lessonId) return NextResponse.json({ error: "Lesson id is required" }, { status: 400 });

  const existing = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  await db.lesson.delete({ where: { id: lessonId } });

  await db.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "DELETE",
      entityType: "Lesson",
      entityId: lessonId,
      metadata: { course: existing.module.course.code, module: existing.module.title, title: existing.title },
    },
  });

  return NextResponse.json({ success: true });
}
