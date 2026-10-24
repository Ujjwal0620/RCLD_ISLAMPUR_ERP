import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, isSuperAdmin } from "@/lib/permissions";

const taskSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  employeeId: z.string().min(1),
  priority: z.enum(["LOW","NORMAL","HIGH","URGENT"]).default("NORMAL"),
  dueAt: z.string().optional().or(z.literal("")),
  reviewerId: z.string().optional().or(z.literal("")),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (!isSuperAdmin(user) && !hasPermission(user, "employees.manage"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!db.employeeTask?.findMany) return NextResponse.json({ error: "Employee task module is not initialized. Run npx prisma generate and apply the current Prisma schema." }, { status: 503 });
  const tasks = await db.employeeTask.findMany({
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: {
      assignee: { select: { id: true, name: true, employee: { select: { employeeCode: true, designation: true } } } },
      createdBy: { select: { name: true } },
      reviewer: { select: { name: true } },
    },
  });
  return NextResponse.json({ tasks });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || (!isSuperAdmin(user) && !hasPermission(user, "employees.manage"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    if (!db.employeeTask?.create) return NextResponse.json({ error: "Employee task module is not initialized. Run npx prisma generate and apply the current Prisma schema." }, { status: 503 });
    const body = taskSchema.parse(await request.json());
    const employee = await db.employee.findUnique({
      where: { id: body.employeeId },
      select: { userId: true, user: { select: { status: true, name: true } } },
    });
    if (!employee) return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    if (employee.user.status !== "ACTIVE") return NextResponse.json({ error: "Tasks can only be assigned to active employees." }, { status: 400 });

    const task = await db.employeeTask.create({
      data: {
        title: body.title,
        description: body.description || null,
        assigneeId: employee.userId,
        createdById: user.id,
        reviewerId: body.reviewerId || user.id,
        priority: body.priority,
        dueAt: body.dueAt ? new Date(body.dueAt) : null,
      },
    });
    await db.auditLog.create({
      data: { actorUserId: user.id, action: "EMPLOYEE_TASK_ASSIGNED", entityType: "EmployeeTask", entityId: task.id, metadata: { employeeId: body.employeeId, title: task.title, priority: task.priority, dueAt: task.dueAt } },
    });
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error?.name === "ZodError") return NextResponse.json({ error: error.issues?.[0]?.message || "Invalid task." }, { status: 400 });
    console.error("task create error", error);
    return NextResponse.json({ error: "Unable to assign task." }, { status: 500 });
  }
}
